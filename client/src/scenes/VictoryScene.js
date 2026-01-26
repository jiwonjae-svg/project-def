/**
 * Victory Scene - Game completion celebration
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Button } from '../ui/Button';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalGold = data.gold || 0;
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Create celebration background
    this.createBackground(width, height);
    
    // Victory title
    this.createTitle(width, height);
    
    // Stats display
    this.createStats(width, height);
    
    // Rewards
    this.createRewards(width, height);
    
    // Action buttons
    this.createButtons(width, height);
    
    // Play celebration effects
    this.playCelebration();
    
    // Entrance animation
    this.cameras.main.flash(500, 255, 215, 0);
  }

  createBackground(width, height) {
    // Golden gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x2a1a00, 0x1a1a00, 0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);
    
    // Firework particles
    this.createFireworks(width, height);
    
    // Golden particles
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const star = this.add.star(x, y, 4, 2, 5, 0xffd700, Phaser.Math.FloatBetween(0.2, 0.5));
      
      this.tweens.add({
        targets: star,
        y: y - 100,
        alpha: 0,
        rotation: Math.PI * 2,
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  createFireworks(width, height) {
    // Create periodic firework bursts
    this.time.addEvent({
      delay: 1500,
      callback: () => {
        this.fireworkBurst(
          Phaser.Math.Between(100, width - 100),
          Phaser.Math.Between(100, height / 2)
        );
      },
      loop: true
    });
  }

  fireworkBurst(x, y) {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffd700];
    const color = Phaser.Utils.Array.GetRandom(colors);
    
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(x, y, 4, color);
      const angle = (i / 20) * Math.PI * 2;
      const distance = Phaser.Math.Between(50, 100);
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance + 50,
        alpha: 0,
        scale: 0,
        duration: 800,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  createTitle(width, height) {
    // Victory text
    this.victoryText = this.add.text(width / 2, height * 0.12, 'VICTORY!', {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Add pulsing glow
    this.tweens.add({
      targets: this.victoryText,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Trophy emoji
    this.trophy = this.add.text(width / 2, height * 0.25, '🏆', {
      fontSize: '100px'
    }).setOrigin(0.5);
    
    // Trophy animation
    this.tweens.add({
      targets: this.trophy,
      y: this.trophy.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Subtitle
    this.add.text(width / 2, height * 0.35, 'You have defeated all the enemies!', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  createStats(width, height) {
    const statsY = height * 0.45;
    
    // Stats container
    const statsContainer = this.add.container(width / 2, statsY);
    
    // Background panel
    const panel = this.add.rectangle(0, 0, 350, 180, 0x16213e, 0.9);
    panel.setStrokeStyle(3, 0xffd700);
    statsContainer.add(panel);
    
    // Title
    const title = this.add.text(0, -65, 'FINAL STATISTICS', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);
    statsContainer.add(title);
    
    // Floors completed
    const floorsText = this.add.text(0, -25, `Floors Completed: ${GameConfig.FLOORS_PER_ACT * GameConfig.TOTAL_ACTS}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    statsContainer.add(floorsText);
    
    // Acts completed
    const actsText = this.add.text(0, 5, `Acts Completed: ${GameConfig.TOTAL_ACTS}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    statsContainer.add(actsText);
    
    // Final score
    const scoreLabel = this.add.text(0, 45, 'FINAL SCORE', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#888888'
    }).setOrigin(0.5);
    statsContainer.add(scoreLabel);
    
    const scoreText = this.add.text(0, 70, `${this.finalScore}`, {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: '#ffd700'
    }).setOrigin(0.5);
    statsContainer.add(scoreText);
  }

  createRewards(width, height) {
    const rewardsY = height * 0.66;
    
    // Rewards container
    const rewardsContainer = this.add.container(width / 2, rewardsY);
    
    // Title
    const title = this.add.text(0, -30, 'REWARDS EARNED', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#4caf50'
    }).setOrigin(0.5);
    rewardsContainer.add(title);
    
    // Gold reward
    const goldIcon = this.add.image(-50, 15, 'icon_gold').setScale(1.2);
    rewardsContainer.add(goldIcon);
    
    const goldText = this.add.text(0, 15, `${this.finalGold}`, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffd700'
    }).setOrigin(0, 0.5);
    rewardsContainer.add(goldText);
    
    // Premium currency (gems)
    const gemText = this.add.text(0, 55, '💎 +50 Gems (First Victory Bonus!)', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#e040fb'
    }).setOrigin(0.5);
    rewardsContainer.add(gemText);
  }

  createButtons(width, height) {
    const buttonsY = height * 0.82;
    const spacing = 70;
    
    // Play Again button
    new Button(this, width / 2, buttonsY, 'PLAY AGAIN', {
      width: 240,
      height: 60,
      fontSize: '24px',
      backgroundColor: 0xe94560,
      onClick: () => this.playAgain()
    });
    
    // Main Menu button
    new Button(this, width / 2, buttonsY + spacing, 'MAIN MENU', {
      width: 240,
      height: 60,
      fontSize: '24px',
      backgroundColor: 0x533483,
      onClick: () => this.goToMenu()
    });
  }

  playCelebration() {
    // Initial firework burst at center
    this.fireworkBurst(this.cameras.main.width / 2, this.cameras.main.height * 0.3);
    
    // Delayed bursts
    this.time.delayedCall(300, () => {
      this.fireworkBurst(this.cameras.main.width * 0.3, this.cameras.main.height * 0.2);
    });
    
    this.time.delayedCall(600, () => {
      this.fireworkBurst(this.cameras.main.width * 0.7, this.cameras.main.height * 0.25);
    });
  }

  playAgain() {
    // Reset player data
    const playerData = {
      gold: GameConfig.STARTING_GOLD,
      health: GameConfig.STARTING_HEALTH,
      maxHealth: GameConfig.STARTING_HEALTH,
      energy: GameConfig.STARTING_ENERGY,
      maxEnergy: GameConfig.STARTING_ENERGY,
      deck: this.getStarterDeck(),
      hand: [],
      drawPile: [],
      discardPile: [],
      relics: [],
      currentFloor: 1,
      currentAct: 1,
      score: 0
    };
    
    this.registry.set('playerData', playerData);
    this.registry.remove('currentMap');
    
    // Start new game
    this.cameras.main.fadeOut(500, 255, 215, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('MapScene');
    });
  }

  getStarterDeck() {
    const { CardDatabase } = require('../data/CardDatabase');
    return CardDatabase.getStarterDeck();
  }

  goToMenu() {
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
