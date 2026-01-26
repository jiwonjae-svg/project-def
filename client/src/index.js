/**
 * Deck Defense Roguelike - Main Entry Point
 * A deck-building roguelike defense mobile game built with Phaser.js
 */

import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { SaveDataScene } from './scenes/SaveDataScene';
import { CollectionScene } from './scenes/CollectionScene';
import { GameScene } from './scenes/GameScene';
import { BattleScene } from './scenes/BattleScene';
import { ShopScene } from './scenes/ShopScene';
import { CardRewardScene } from './scenes/CardRewardScene';
import { DeckViewScene } from './scenes/DeckViewScene';
import { SettingsScene } from './scenes/SettingsScene';
import { GameOverScene } from './scenes/GameOverScene';
import { VictoryScene } from './scenes/VictoryScene';
import { UIScene } from './scenes/UIScene';
import { EventScene } from './scenes/EventScene';
import { RestScene } from './scenes/RestScene';
import { TreasureScene } from './scenes/TreasureScene';
import './styles/main.css';

// Game configuration
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GameConfig.GAME_WIDTH,
  height: GameConfig.GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GameConfig.GAME_WIDTH,
    height: GameConfig.GAME_HEIGHT,
    min: {
      width: 320,
      height: 480
    },
    max: {
      width: 1080,
      height: 1920
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  input: {
    activePointers: 3,
    touch: {
      capture: true
    }
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    SaveDataScene,
    CollectionScene,
    GameScene,
    BattleScene,
    ShopScene,
    CardRewardScene,
    DeckViewScene,
    SettingsScene,
    GameOverScene,
    VictoryScene,
    UIScene,
    EventScene,
    RestScene,
    TreasureScene
  ]
};

// Initialize the game
window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
  
  // Make game accessible globally for debugging
  window.game = game;
  
  // Handle visibility change for mobile
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.scene.pause();
    } else {
      game.scene.resume();
    }
  });
  
  // Handle resize for better mobile experience
  window.addEventListener('resize', () => {
    game.scale.refresh();
  });
});

// Service Worker registration for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, but app will still work
    });
  });
}
