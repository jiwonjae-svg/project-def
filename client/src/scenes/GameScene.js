/**
 * Game Scene - Placeholder/transition scene
 */

import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // This scene acts as a hub/transition scene
    // Redirect to map scene
    this.scene.start('MapScene');
  }
}
