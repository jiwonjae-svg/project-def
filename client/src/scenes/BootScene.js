/**
 * Boot Scene - Initial game setup and system checks
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Update loading progress
    if (window.updateLoadingProgress) {
      window.updateLoadingProgress(5, 'Starting up...');
    }
  }

  create() {
    // Set up global game registry for shared data
    this.registry.set('playerData', {
      gold: GameConfig.STARTING_GOLD,
      health: GameConfig.STARTING_HEALTH,
      maxHealth: GameConfig.STARTING_HEALTH,
      energy: GameConfig.STARTING_ENERGY,
      maxEnergy: GameConfig.STARTING_ENERGY,
      deck: [],
      hand: [],
      drawPile: [],
      discardPile: [],
      relics: [],
      currentFloor: 1,
      currentAct: 1,
      score: 0
    });

    // Set up sound manager settings
    this.registry.set('settings', {
      masterVolume: GameConfig.SOUND.MASTER_VOLUME,
      musicVolume: GameConfig.SOUND.MUSIC_VOLUME,
      sfxVolume: GameConfig.SOUND.SFX_VOLUME,
      vibration: true,
      notifications: true,
      language: 'en'
    });

    // Check device capabilities
    this.checkDeviceCapabilities();

    // Proceed to preload scene
    this.scene.start('PreloadScene');
  }

  checkDeviceCapabilities() {
    // Check WebGL support
    const hasWebGL = this.sys.game.renderer.type === Phaser.WEBGL;
    this.registry.set('hasWebGL', hasWebGL);

    // Check touch support
    const hasTouch = this.sys.game.device.input.touch;
    this.registry.set('hasTouch', hasTouch);

    // Check audio support
    const hasAudio = this.sys.game.device.audio.webAudio;
    this.registry.set('hasAudio', hasAudio);

    // Store screen dimensions
    this.registry.set('screenWidth', this.cameras.main.width);
    this.registry.set('screenHeight', this.cameras.main.height);

    console.log('Device capabilities:', {
      webGL: hasWebGL,
      touch: hasTouch,
      audio: hasAudio
    });
  }
}
