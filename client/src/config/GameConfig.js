/**
 * Game Configuration Constants
 * Central configuration for game settings, balance, and constants
 */

export const GameConfig = {
  // Screen dimensions (portrait mobile)
  GAME_WIDTH: 720,
  GAME_HEIGHT: 1280,
  
  // Game balance settings
  STARTING_HEALTH: 100,
  STARTING_GOLD: 50,
  STARTING_ENERGY: 3,
  MAX_ENERGY: 10,
  HAND_SIZE: 5,
  MAX_HAND_SIZE: 10,
  
  // Deck settings
  STARTING_DECK_SIZE: 10,
  MAX_DECK_SIZE: 40,
  
  // Combat settings
  BASE_DRAW_COUNT: 5,
  ENEMY_SPAWN_DELAY: 2000,
  TOWER_ATTACK_SPEED: 1000,
  
  // Economy settings
  GOLD_PER_ENEMY: 5,
  GOLD_PER_WAVE: 20,
  CARD_REMOVE_COST: 75,
  CARD_UPGRADE_COST: 50,
  
  // Roguelike progression
  FLOORS_PER_ACT: 15,
  TOTAL_ACTS: 3,
  ELITE_CHANCE: 0.2,
  EVENT_CHANCE: 0.15,
  
  // Animation timings (ms)
  CARD_PLAY_DURATION: 300,
  CARD_DRAW_DURATION: 200,
  DAMAGE_FLASH_DURATION: 100,
  SCREEN_TRANSITION_DURATION: 500,
  
  // UI settings
  CARD_WIDTH: 120,
  CARD_HEIGHT: 180,
  CARD_SCALE_HAND: 0.8,
  CARD_SCALE_HOVER: 1.1,
  
  // Tower types
  TOWER_TYPES: {
    BASIC: 'basic',
    ARCHER: 'archer',
    MAGE: 'mage',
    CANNON: 'cannon',
    FROST: 'frost',
    LIGHTNING: 'lightning'
  },
  
  // Card rarities (10 tiers with exponential decay - 10x reduction per tier)
  RARITY: {
    COMMON: { name: 'Common', color: 0x9e9e9e, weight: 90, tier: 1 },
    UNCOMMON: { name: 'Uncommon', color: 0x76ff03, weight: 9, tier: 2 },
    RARE: { name: 'Rare', color: 0x00bcd4, weight: 0.9, tier: 3 },
    EPIC: { name: 'Epic', color: 0x9c27b0, weight: 0.09, tier: 4 },
    LEGENDARY: { name: 'Legendary', color: 0xff9800, weight: 0.009, tier: 5 },
    MYTHIC: { name: 'Mythic', color: 0xe91e63, weight: 0.0009, tier: 6 },
    EXALTED: { name: 'Exalted', color: 0xffd700, weight: 0.00009, tier: 7 },
    CELESTIAL: { name: 'Celestial', color: 0x00ffff, weight: 0.000009, tier: 8 },
    TRANSCENDENT: { name: 'Transcendent', color: 0xff00ff, weight: 0.0000009, tier: 9 },
    DIVINE: { name: 'Divine', color: 0xffffff, weight: 0.00000001, tier: 10 }
  },
  
  // Card types
  CARD_TYPES: {
    TOWER: 'tower',
    SPELL: 'spell',
    MODIFIER: 'modifier',
    RESOURCE: 'resource'
  },
  
  // Enemy types
  ENEMY_TYPES: {
    NORMAL: 'normal',
    FAST: 'fast',
    TANK: 'tank',
    FLYING: 'flying',
    BOSS: 'boss',
    ELITE: 'elite'
  },
  
  // Status effects
  STATUS_EFFECTS: {
    BURN: { id: 'burn', duration: 3, stackable: true },
    FREEZE: { id: 'freeze', duration: 2, stackable: false },
    POISON: { id: 'poison', duration: 4, stackable: true },
    SLOW: { id: 'slow', duration: 3, stackable: false },
    STUN: { id: 'stun', duration: 1, stackable: false },
    SHIELD: { id: 'shield', duration: -1, stackable: true },
    WEAKNESS: { id: 'weakness', duration: 2, stackable: false }
  },
  
  // Monetization settings
  IAP_PRODUCTS: {
    REMOVE_ADS: { id: 'remove_ads', price: 2.99 },
    STARTER_PACK: { id: 'starter_pack', price: 4.99 },
    GOLD_SMALL: { id: 'gold_small', amount: 500, price: 0.99 },
    GOLD_MEDIUM: { id: 'gold_medium', amount: 1500, price: 2.99 },
    GOLD_LARGE: { id: 'gold_large', amount: 5000, price: 7.99 },
    PREMIUM_PASS: { id: 'premium_pass', price: 9.99 }
  },
  
  // Rewarded ad settings
  AD_REWARDS: {
    GOLD: 50,
    CARD_REFRESH: true,
    REVIVE: true,
    DOUBLE_REWARD: true
  },
  
  // Colors
  COLORS: {
    PRIMARY: 0xe94560,
    SECONDARY: 0x0f3460,
    ACCENT: 0x533483,
    SUCCESS: 0x4caf50,
    WARNING: 0xff9800,
    DANGER: 0xf44336,
    INFO: 0x2196f3,
    BACKGROUND: 0x1a1a2e,
    CARD_BG: 0x16213e,
    TEXT_PRIMARY: 0xffffff,
    TEXT_SECONDARY: 0xaaaaaa,
    GOLD: 0xffd700,
    ENERGY: 0x00bcd4,
    HEALTH: 0xf44336
  },
  
  // Sound settings
  SOUND: {
    MASTER_VOLUME: 0.8,
    MUSIC_VOLUME: 0.5,
    SFX_VOLUME: 0.7
  },
  
  // Firebase collections
  FIREBASE_COLLECTIONS: {
    USERS: 'users',
    RUNS: 'runs',
    LEADERBOARD: 'leaderboard',
    ACHIEVEMENTS: 'achievements',
    DAILY_CHALLENGES: 'daily_challenges'
  }
};

// Freeze config to prevent accidental modifications
Object.freeze(GameConfig);

// Export GAME_CONFIG as alias for compatibility
export const GAME_CONFIG = GameConfig;
export default GameConfig;
