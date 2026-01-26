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

// Save/Load Game State
app.post('/api/save', async (req, res) => {
  try {
    const { userId, gameState } = req.body;

    if (!userId || !gameState) {
      return res.status(400).json({ error: 'userId and gameState are required' });
    }

    const saveData = {
      ...gameState,
      savedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (db) {
      await db.collection('saves').doc(userId).set(saveData);
      res.json({ success: true });
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
