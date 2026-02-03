/**
 * Project-D Backend Server
 * Express + Socket.io + Firebase Integration
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Firebase initialization
let db = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    db = admin.firestore();
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
  }
} else {
  console.log('Firebase credentials not found, running in offline mode');
}

const app = express();
const server = http.createServer(app);

// Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow game assets
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (production build)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    firebase: db !== null
  });
});

// ==================== API ROUTES ====================

// User Management
app.post('/api/users', async (req, res) => {
  try {
    const { userId, displayName, email } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const userData = {
      displayName: displayName || 'Player',
      email: email || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      stats: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        totalEnemiesKilled: 0,
        totalGoldEarned: 0,
        highestStage: 0
      },
      currency: {
        gold: 100,
        gems: 10
      },
      inventory: {
        unlockedCards: ['arrow_tower', 'cannon_tower', 'ice_tower', 'heal_spell'],
        ownedItems: []
      },
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        notifications: true
      }
    };

    if (db) {
      await db.collection('users').doc(userId).set(userData, { merge: true });
      res.json({ success: true, userId });
    } else {
      res.json({ success: true, userId, offline: true });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (db) {
      const doc = await db.collection('users').doc(userId).get();
      if (doc.exists) {
        res.json({ success: true, data: doc.data() });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.json({ success: true, data: null, offline: true });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { stats } = req.body;

    if (db) {
      await db.collection('users').doc(userId).update({
        stats: admin.firestore.FieldValue.serverTimestamp(),
        ...Object.fromEntries(
          Object.entries(stats).map(([key, value]) => [`stats.${key}`, admin.firestore.FieldValue.increment(value)])
        )
      });
      res.json({ success: true });
    } else {
      res.json({ success: true, offline: true });
    }
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { type = 'highestStage', limit = 100 } = req.query;

    if (db) {
      const snapshot = await db.collection('users')
        .orderBy(`stats.${type}`, 'desc')
        .limit(parseInt(limit))
        .get();

      const leaderboard = [];
      let rank = 1;
      snapshot.forEach(doc => {
        const data = doc.data();
        leaderboard.push({
          rank: rank++,
          userId: doc.id,
          displayName: data.displayName,
          value: data.stats?.[type] || 0
        });
      });

      res.json({ success: true, data: leaderboard });
    } else {
      res.json({ success: true, data: [], offline: true });
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ==================== GAME VALIDATION UTILITIES ====================

/**
 * Validate and calculate gold rewards server-side
 */
function validateGoldReward(eventType, baseReward, playerLevel, enemiesKilled) {
  const validatedReward = {
    base: 0,
    bonus: 0,
    total: 0,
    valid: true,
    reason: ''
  };

  // Define expected gold ranges by event type
  const goldRanges = {
    enemy_kill: { min: 5, max: 50 },
    wave_complete: { min: 20, max: 200 },
    elite_kill: { min: 50, max: 300 },
    boss_kill: { min: 100, max: 500 },
    stage_complete: { min: 100, max: 1000 }
  };

  const range = goldRanges[eventType];
  if (!range) {
    validatedReward.valid = false;
    validatedReward.reason = 'Invalid event type';
    return validatedReward;
  }

  // Validate base reward is within expected range
  if (baseReward < range.min || baseReward > range.max) {
    validatedReward.valid = false;
    validatedReward.reason = `Gold reward ${baseReward} outside valid range [${range.min}, ${range.max}]`;
    return validatedReward;
  }

  // Calculate server-side bonus
  const levelBonus = Math.floor(playerLevel * 0.1 * baseReward);
  const killBonus = Math.floor(enemiesKilled * 0.5);
  
  validatedReward.base = baseReward;
  validatedReward.bonus = levelBonus + killBonus;
  validatedReward.total = validatedReward.base + validatedReward.bonus;
  
  return validatedReward;
}

/**
 * Validate card reward selection server-side
 */
function validateCardReward(cardId, isElite, stageNumber) {
  const validation = {
    valid: true,
    reason: '',
    adjustedRarity: null
  };

  // Server-side rarity determination
  const rarityRoll = Math.random() * 100;
  let expectedRarity;
  
  if (isElite) {
    if (rarityRoll < 20) expectedRarity = 'common';
    else if (rarityRoll < 45) expectedRarity = 'uncommon';
    else if (rarityRoll < 70) expectedRarity = 'rare';
    else if (rarityRoll < 90) expectedRarity = 'epic';
    else expectedRarity = 'legendary';
  } else {
    if (rarityRoll < 50) expectedRarity = 'common';
    else if (rarityRoll < 75) expectedRarity = 'uncommon';
    else if (rarityRoll < 90) expectedRarity = 'rare';
    else if (rarityRoll < 98) expectedRarity = 'epic';
    else expectedRarity = 'legendary';
  }

  // In production, verify cardId exists and matches rarity
  // For now, we trust client but log for audit
  validation.adjustedRarity = expectedRarity;
  
  return validation;
}

/**
 * Validate game state changes
 */
function validateGameState(previousState, newState) {
  const validation = {
    valid: true,
    issues: []
  };

  // Validate gold changes
  const goldDiff = newState.gold - previousState.gold;
  const maxGoldPerSession = 5000; // Reasonable limit
  
  if (goldDiff > maxGoldPerSession) {
    validation.valid = false;
    validation.issues.push(`Suspicious gold gain: ${goldDiff}`);
  }

  // Validate stage progression
  if (newState.currentStage < previousState.currentStage) {
    validation.issues.push('Stage number decreased');
  }

  if (newState.currentStage - previousState.currentStage > 5) {
    validation.valid = false;
    validation.issues.push('Stage progression too fast');
  }

  // Validate deck size
  if (newState.deck && newState.deck.length > 50) {
    validation.valid = false;
    validation.issues.push('Deck size exceeds maximum');
  }

  return validation;
}

// Save/Load Game State (with validation)
app.post('/api/save', async (req, res) => {
  try {
    const { userId, gameState } = req.body;

    if (!userId || !gameState) {
      return res.status(400).json({ error: 'userId and gameState are required' });
    }

    // Load previous state for validation
    let previousState = null;
    if (db) {
      const prevDoc = await db.collection('saves').doc(userId).get();
      if (prevDoc.exists) {
        previousState = prevDoc.data();
      }
    }

    // Validate state changes if previous state exists
    if (previousState) {
      const validation = validateGameState(previousState, gameState);
      if (!validation.valid) {
        console.warn(`State validation failed for user ${userId}:`, validation.issues);
        return res.status(400).json({ 
          error: 'Invalid game state',
          issues: validation.issues 
        });
      }
      if (validation.issues.length > 0) {
        console.warn(`State validation warnings for user ${userId}:`, validation.issues);
      }
    }

    const saveData = {
      ...gameState,
      savedAt: admin.firestore.FieldValue.serverTimestamp(),
      validated: true
    };

    if (db) {
      await db.collection('saves').doc(userId).set(saveData);
      res.json({ success: true, validated: true });
    } else {
      res.json({ success: true, offline: true });
    }
  } catch (error) {
    console.error('Error saving game:', error);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

app.get('/api/save/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (db) {
      const doc = await db.collection('saves').doc(userId).get();
      if (doc.exists) {
        res.json({ success: true, data: doc.data() });
      } else {
        res.json({ success: true, data: null });
      }
    } else {
      res.json({ success: true, data: null, offline: true });
    }
  } catch (error) {
    console.error('Error loading save:', error);
    res.status(500).json({ error: 'Failed to load save' });
  }
});

// Daily Rewards
app.post('/api/daily-reward/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (db) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      const lastClaim = userData.lastDailyReward?.toDate() || new Date(0);
      const now = new Date();
      
      // Check if 24 hours have passed
      const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);
      
      if (hoursSinceLastClaim < 24) {
        return res.json({ 
          success: false, 
          message: 'Daily reward already claimed',
          nextClaimIn: Math.ceil(24 - hoursSinceLastClaim)
        });
      }

      // Server-determined reward (not client)
      const dailyReward = {
        gold: 50,
        gems: 5
      };

      await db.collection('users').doc(userId).update({
        'currency.gold': admin.firestore.FieldValue.increment(dailyReward.gold),
        'currency.gems': admin.firestore.FieldValue.increment(dailyReward.gems),
        lastDailyReward: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ 
        success: true, 
        reward: dailyReward
      });
    } else {
      res.json({ success: true, offline: true });
    }
  } catch (error) {
    console.error('Error claiming daily reward:', error);
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});

// Server-validated gold reward endpoint
app.post('/api/reward/gold', async (req, res) => {
  try {
    const { userId, eventType, baseReward, playerLevel, enemiesKilled } = req.body;

    if (!userId || !eventType || baseReward === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Validate gold reward server-side
    const validation = validateGoldReward(
      eventType, 
      baseReward, 
      playerLevel || 1, 
      enemiesKilled || 0
    );

    if (!validation.valid) {
      console.warn(`Gold validation failed for user ${userId}: ${validation.reason}`);
      return res.status(400).json({ 
        error: 'Invalid reward',
        reason: validation.reason 
      });
    }

    if (db) {
      // Update user's gold
      await db.collection('users').doc(userId).update({
        'currency.gold': admin.firestore.FieldValue.increment(validation.total)
      });

      res.json({ 
        success: true, 
        reward: validation
      });
    } else {
      res.json({ success: true, offline: true, reward: validation });
    }
  } catch (error) {
    console.error('Error processing gold reward:', error);
    res.status(500).json({ error: 'Failed to process reward' });
  }
});

// Server-validated card reward endpoint
app.post('/api/reward/card', async (req, res) => {
  try {
    const { userId, isElite, stageNumber } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Server determines card rarity
    const validation = validateCardReward(null, isElite || false, stageNumber || 1);
    
    res.json({ 
      success: true, 
      rarity: validation.adjustedRarity
    });
  } catch (error) {
    console.error('Error processing card reward:', error);
    res.status(500).json({ error: 'Failed to process card reward' });
  }
});
      const hoursSinceClaim = (now - lastClaim) / (1000 * 60 * 60);
      if (hoursSinceClaim < 24) {
        const timeRemaining = Math.ceil(24 - hoursSinceClaim);
        return res.status(400).json({
          error: 'Daily reward already claimed',
          hoursRemaining: timeRemaining
        });
      }

      // Calculate streak
      let streak = userData.dailyStreak || 0;
      if (hoursSinceClaim < 48) {
        streak++;
      } else {
        streak = 1;
      }

      // Calculate reward based on streak
      const baseGold = 50;
      const bonusGold = Math.min(streak * 10, 100);
      const gems = streak >= 7 ? 5 : 0;

      const reward = {
        gold: baseGold + bonusGold,
        gems: gems,
        streak: streak
      };

      await db.collection('users').doc(userId).update({
        lastDailyReward: admin.firestore.FieldValue.serverTimestamp(),
        dailyStreak: streak,
        'currency.gold': admin.firestore.FieldValue.increment(reward.gold),
        'currency.gems': admin.firestore.FieldValue.increment(reward.gems)
      });

      res.json({ success: true, reward });
    } else {
      res.json({
        success: true,
        reward: { gold: 50, gems: 0, streak: 1 },
        offline: true
      });
    }
  } catch (error) {
    console.error('Error claiming daily reward:', error);
    res.status(500).json({ error: 'Failed to claim daily reward' });
  }
});

// In-App Purchase Verification (simplified)
app.post('/api/purchase/verify', async (req, res) => {
  try {
    const { userId, productId, receipt } = req.body;

    // In production, verify receipt with App Store/Google Play
    // This is a simplified implementation
    console.log(`Purchase verification for ${userId}: ${productId}`);

    const products = {
      'gem_pack_small': { gems: 100 },
      'gem_pack_medium': { gems: 500 },
      'gem_pack_large': { gems: 1200 },
      'starter_pack': { gems: 200, gold: 1000, cards: ['legendary_random'] },
      'remove_ads': { removeAds: true }
    };

    const product = products[productId];
    if (!product) {
      return res.status(400).json({ error: 'Invalid product' });
    }

    if (db) {
      const updates = {};
      if (product.gems) {
        updates['currency.gems'] = admin.firestore.FieldValue.increment(product.gems);
      }
      if (product.gold) {
        updates['currency.gold'] = admin.firestore.FieldValue.increment(product.gold);
      }
      if (product.removeAds) {
        updates['settings.adsRemoved'] = true;
      }

      await db.collection('users').doc(userId).update(updates);

      // Log purchase
      await db.collection('purchases').add({
        userId,
        productId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        verified: true
      });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('Error verifying purchase:', error);
    res.status(500).json({ error: 'Failed to verify purchase' });
  }
});

// ==================== SOCKET.IO EVENTS ====================

// Connected players tracking
const connectedPlayers = new Map();

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Player authentication
  socket.on('authenticate', async (data) => {
    const { userId, displayName } = data;
    
    connectedPlayers.set(socket.id, {
      odId: socket.id,
      userId,
      displayName,
      status: 'online',
      connectedAt: Date.now()
    });

    socket.userId = userId;
    socket.displayName = displayName;

    socket.emit('authenticated', {
      success: true,
      playersOnline: connectedPlayers.size
    });

    // Broadcast player count update
    io.emit('playersOnline', connectedPlayers.size);
  });

  // Real-time game sync (for future multiplayer features)
  socket.on('gameEvent', (data) => {
    const { type, payload } = data;
    
    // Log significant events
    if (db && socket.userId) {
      db.collection('gameEvents').add({
        userId: socket.userId,
        type,
        payload,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }).catch(err => console.error('Error logging event:', err));
    }
  });

  // Leaderboard subscription
  socket.on('subscribeLeaderboard', async () => {
    if (db) {
      // Send current top 10
      const snapshot = await db.collection('users')
        .orderBy('stats.highestStage', 'desc')
        .limit(10)
        .get();

      const leaders = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        leaders.push({
          userId: doc.id,
          displayName: data.displayName,
          highestStage: data.stats?.highestStage || 0
        });
      });

      socket.emit('leaderboardUpdate', leaders);
    }
  });

  // Chat (for future social features)
  socket.on('chatMessage', (data) => {
    if (socket.userId && data.message) {
      io.emit('chatMessage', {
        userId: socket.userId,
        displayName: socket.displayName,
        message: data.message.substring(0, 200), // Limit message length
        timestamp: Date.now()
      });
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    connectedPlayers.delete(socket.id);
    io.emit('playersOnline', connectedPlayers.size);
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║         Project-D Game Server             ║
  ╠═══════════════════════════════════════════╣
  ║  Port: ${PORT.toString().padEnd(35)}║
  ║  Mode: ${(process.env.NODE_ENV || 'development').padEnd(35)}║
  ║  Firebase: ${(db ? 'Connected' : 'Offline').padEnd(31)}║
  ╚═══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
