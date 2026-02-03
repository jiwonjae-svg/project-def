/**
 * Save Manager - Local and cloud save management
 */

import apiService from './ApiService';

const STORAGE_KEY = 'projectd_save';
const SETTINGS_KEY = 'projectd_settings';

class SaveManager {
  constructor() {
    this.isOnline = false;
  }

  setOnline(online) {
    this.isOnline = online;
  }

  // Local Storage operations
  saveLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Local save failed:', error);
      return false;
    }
  }

  loadLocal(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Local load failed:', error);
      return null;
    }
  }

  deleteLocal(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Local delete failed:', error);
      return false;
    }
  }

  // Game State
  async saveGameState(gameState) {
    // Always save locally first
    const localSuccess = this.saveLocal(STORAGE_KEY, {
      ...gameState,
      savedAt: Date.now()
    });

    // Try cloud save if online (server validates the state)
    if (this.isOnline) {
      try {
        const response = await apiService.saveGame(gameState);
        if (response.validated) {
          console.log('Cloud save successful and validated');
        } else {
          console.warn('Cloud save succeeded but validation skipped');
        }
      } catch (error) {
        console.warn('Cloud save failed, local save preserved:', error.message);
      }
    }

    return localSuccess;
  }

  /**
   * Request server-validated gold reward
   */
  async requestGoldReward(eventType, baseReward, playerLevel, enemiesKilled) {
    if (!this.isOnline) {
      // Offline mode - use client-side calculation with limited validation
      return {
        success: true,
        offline: true,
        reward: {
          base: baseReward,
          bonus: 0,
          total: baseReward
        }
      };
    }

    try {
      const response = await apiService.post('/api/reward/gold', {
        userId: this.getCurrentUserId(),
        eventType,
        baseReward,
        playerLevel,
        enemiesKilled
      });

      return response;
    } catch (error) {
      console.error('Failed to validate gold reward:', error);
      // Fallback to offline mode
      return {
        success: true,
        offline: true,
        reward: {
          base: baseReward,
          bonus: 0,
          total: baseReward
        }
      };
    }
  }

  /**
   * Request server-validated card reward rarity
   */
  async requestCardReward(isElite, stageNumber) {
    if (!this.isOnline) {
      // Offline mode - client determines rarity
      return {
        success: true,
        offline: true,
        rarity: this.getClientSideRarity(isElite)
      };
    }

    try {
      const response = await apiService.post('/api/reward/card', {
        userId: this.getCurrentUserId(),
        isElite,
        stageNumber
      });

      return response;
    } catch (error) {
      console.error('Failed to validate card reward:', error);
      // Fallback to client-side
      return {
        success: true,
        offline: true,
        rarity: this.getClientSideRarity(isElite)
      };
    }
  }

  /**
   * Client-side rarity determination (fallback only)
   */
  getClientSideRarity(isElite) {
    const roll = Math.random() * 100;
    
    if (isElite) {
      if (roll < 20) return 'common';
      if (roll < 45) return 'uncommon';
      if (roll < 70) return 'rare';
      if (roll < 90) return 'epic';
      return 'legendary';
    } else {
      if (roll < 50) return 'common';
      if (roll < 75) return 'uncommon';
      if (roll < 90) return 'rare';
      if (roll < 98) return 'epic';
      return 'legendary';
    }
  }

  /**
   * Get current user ID (should be set during authentication)
   */
  getCurrentUserId() {
    return localStorage.getItem('userId') || 'anonymous';
  }

  setCurrentUserId(userId) {
    localStorage.setItem('userId', userId);
  }

  async loadGameState() {
    const localData = this.loadLocal(STORAGE_KEY);

    // Try cloud load if online
    if (this.isOnline) {
      try {
        const cloudResponse = await apiService.loadGame();
        if (cloudResponse.data) {
          // Compare timestamps, use newer save
          const cloudData = cloudResponse.data;
          if (!localData || (cloudData.savedAt > localData.savedAt)) {
            // Sync cloud to local
            this.saveLocal(STORAGE_KEY, cloudData);
            return cloudData;
          }
        }
      } catch (error) {
        console.warn('Cloud load failed, using local data');
      }
    }

    return localData;
  }

  clearGameState() {
    return this.deleteLocal(STORAGE_KEY);
  }

  // Settings
  saveSettings(settings) {
    return this.saveLocal(SETTINGS_KEY, settings);
  }

  loadSettings() {
    return this.loadLocal(SETTINGS_KEY) || {
      musicVolume: 70,
      sfxVolume: 80,
      vibration: true,
      notifications: true,
      language: 'en',
      quality: 'high',
      showDamageNumbers: true,
      autoPlay: false
    };
  }

  // Run Data (current roguelike run)
  saveCurrentRun(runData) {
    return this.saveLocal(`${STORAGE_KEY}_run`, {
      ...runData,
      savedAt: Date.now()
    });
  }

  loadCurrentRun() {
    return this.loadLocal(`${STORAGE_KEY}_run`);
  }

  clearCurrentRun() {
    return this.deleteLocal(`${STORAGE_KEY}_run`);
  }

  // Statistics
  saveStats(stats) {
    const existing = this.loadStats();
    const merged = { ...existing, ...stats };
    return this.saveLocal(`${STORAGE_KEY}_stats`, merged);
  }

  loadStats() {
    return this.loadLocal(`${STORAGE_KEY}_stats`) || {
      totalGamesPlayed: 0,
      totalWins: 0,
      totalDeaths: 0,
      totalEnemiesKilled: 0,
      totalGoldEarned: 0,
      totalCardsCollected: 0,
      highestStage: 0,
      fastestWin: null,
      favoriteCard: null
    };
  }

  // Unlocks
  saveUnlocks(unlocks) {
    return this.saveLocal(`${STORAGE_KEY}_unlocks`, unlocks);
  }

  loadUnlocks() {
    return this.loadLocal(`${STORAGE_KEY}_unlocks`) || {
      cards: ['arrow_tower', 'cannon_tower', 'ice_tower', 'heal_spell'],
      achievements: [],
      skins: ['default']
    };
  }

  unlockCard(cardId) {
    const unlocks = this.loadUnlocks();
    if (!unlocks.cards.includes(cardId)) {
      unlocks.cards.push(cardId);
      this.saveUnlocks(unlocks);
    }
  }

  isCardUnlocked(cardId) {
    const unlocks = this.loadUnlocks();
    return unlocks.cards.includes(cardId);
  }

  // Export/Import for backup
  exportAllData() {
    return {
      gameState: this.loadLocal(STORAGE_KEY),
      settings: this.loadSettings(),
      stats: this.loadStats(),
      unlocks: this.loadUnlocks(),
      exportedAt: Date.now()
    };
  }

  importAllData(data) {
    try {
      if (data.gameState) this.saveLocal(STORAGE_KEY, data.gameState);
      if (data.settings) this.saveSettings(data.settings);
      if (data.stats) this.saveLocal(`${STORAGE_KEY}_stats`, data.stats);
      if (data.unlocks) this.saveUnlocks(data.unlocks);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const saveManager = new SaveManager();
export default saveManager;
