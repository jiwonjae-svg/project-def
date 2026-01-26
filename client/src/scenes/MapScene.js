/**
 * Map Scene - Simple stage selection before battle
 * Removed procedural map generation - now directly starts battle
 */

import Phaser from 'phaser';
import { Button } from '../ui/Button';

export class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Create background
    this.createBackground(width, height);
    
    // Create header
    this.createHeader(width);
    
    // Create start button
    this.createButtons(width, height);
    
    // Entrance animation
    this.cameras.main.fadeIn(500);
  }

  createBackground(width, height) {
    // Dark gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a15, 0x0a0a15, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);
    
    // Animated stars
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8);
      const size = Phaser.Math.Between(1, 3);
      const star = this.add.circle(x, y, size, 0xffffff, alpha);
      
      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: alpha * 0.3,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
    
    // Central arena preview (circular glow)
    const centerGlow = this.add.graphics();
    centerGlow.fillStyle(0x4a9eff, 0.1);
    centerGlow.fillCircle(width / 2, height / 2 - 50, 200);
    
    centerGlow.lineStyle(3, 0x4a9eff, 0.5);
    centerGlow.strokeCircle(width / 2, height / 2 - 50, 200);
    
    // Inner circle
    centerGlow.lineStyle(2, 0x4a9eff, 0.3);
    centerGlow.strokeCircle(width / 2, height / 2 - 50, 140);
    
    // Animated glow
    this.tweens.add({
      targets: centerGlow,
      alpha: 0.5,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
  }

  createHeader(width) {
    // Title
    const title = this.add.text(width / 2, 80, 'CIRCULAR DEFENSE', {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(width / 2, 130, 'Tower Defense Arena', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#4a9eff'
    }).setOrigin(0.5);
  }

  createButtons(width, height) {
    // Start Battle button
    const startBtn = new Button(this, width / 2, height - 180, '⚔️ START BATTLE', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => {
        this.scene.start('BattleScene');
      });
    }, { width: 250, height: 60, color: 0x4caf50 });
    
    // Pulsing animation
    this.tweens.add({
      targets: startBtn,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    
    // Back to menu
    new Button(this, 60, 40, '← Back', () => {
      this.scene.start('MainMenuScene');
    }, { width: 100, height: 40, color: 0x333333 });
  }
}
