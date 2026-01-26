/**
 * Game Over Scene - Death screen with stats and retry options
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Button } from '../ui/Button';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalWave = data.wave || 1;
    this.finalFloor = data.floor || 1;
    this.finalAct = data.act || 1;
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Create dramatic background
    this.createBackground(width, height);
    
    // Game over title
    this.createTitle(width, height);
    
    // Stats display
    this.createStats(width, height);
    
    // Action buttons
    this.createButtons(width, height);
    
    // Ad prompt
    this.createAdPrompt(width, height);
    
    // Entrance animation
    this.playEntranceAnimation();
  }

  createBackground(width, height) {
    // Dark vignette background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0000, 0x1a0000, 0x0a0000, 0x0a0000, 1);
    bg.fillRect(0, 0, width, height);
    
    // Red atmospheric particles
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const particle = this.add.circle(x, y, Phaser.Math.Between(1, 3), 0xff0000, 0.3);
      
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(50, 150),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
    
    // Vignette overlay
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.5);
    vignette.fillCircle(width / 2, height / 2, width);
  }

  createTitle(width, height) {
    // Game Over text
    this.gameOverText = this.add.text(width / 2, height * 0.15, 'GAME OVER', {
      fontFamily: 'Arial Black',
      fontSize: '56px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);
    
    // Skull emoji
    this.skull = this.add.text(width / 2, height * 0.28, '💀', {
      fontSize: '80px'
    }).setOrigin(0.5).setAlpha(0).setScale(0);
  }

  createStats(width, height) {
    const statsY = height * 0.42;
    const spacing = 50;
    
    // Stats container
    this.statsContainer = this.add.container(width / 2, statsY);
    this.statsContainer.setAlpha(0);
    
    // Background panel
    const panel = this.add.rectangle(0, 0, 320, 220, 0x16213e, 0.9);
    panel.setStrokeStyle(3, 0xf44336);
    this.statsContainer.add(panel);
    
    // Title
    const title = this.add.text(0, -80, 'RUN STATISTICS', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.statsContainer.add(title);
    
    // Wave reached
    const waveText = this.add.text(0, -40, `Waves Survived: ${this.finalWave}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#4a9eff'
    }).setOrigin(0.5);
    this.statsContainer.add(waveText);
    
    // Enemies killed info
    const infoText = this.add.text(0, 0, 'Too many enemies on the field!', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ff6b6b'
    }).setOrigin(0.5);
    this.statsContainer.add(infoText);
    
    // Score
    const scoreLabel = this.add.text(0, 50, 'FINAL SCORE', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
    this.statsContainer.add(scoreLabel);
    
    const scoreText = this.add.text(0, 80, `${this.finalScore}`, {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.statsContainer.add(scoreText);
  }

  createButtons(width, height) {
    const buttonsY = height * 0.72;
    const spacing = 70;
    
    // Try Again button
    this.retryButton = new Button(this, width / 2, buttonsY, 'TRY AGAIN', {
      width: 240,
      height: 60,
      fontSize: '24px',
      backgroundColor: 0xe94560,
      onClick: () => this.retryGame()
    });
    this.retryButton.setAlpha(0);
    
    // Main Menu button
    this.menuButton = new Button(this, width / 2, buttonsY + spacing, 'MAIN MENU', {
      width: 240,
      height: 60,
      fontSize: '24px',
      backgroundColor: 0x533483,
      onClick: () => this.goToMenu()
    });
    this.menuButton.setAlpha(0);
  }

  createAdPrompt(width, height) {
    // Revive with ad option
    this.adContainer = this.add.container(width / 2, height * 0.88);
    this.adContainer.setAlpha(0);
    
    // Ad button with special styling
    const adBg = this.add.rectangle(0, 0, 280, 50, 0x4caf50, 0.9);
    adBg.setStrokeStyle(2, 0x81c784);
    this.adContainer.add(adBg);
    
    // Video icon
    const videoIcon = this.add.text(-110, 0, '📺', {
      fontSize: '24px'
    }).setOrigin(0.5);
    this.adContainer.add(videoIcon);
    
    // Text
    const adText = this.add.text(15, 0, 'Watch Ad to Revive', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.adContainer.add(adText);
    
    // Make interactive
    adBg.setInteractive({ useHandCursor: true });
    
    adBg.on('pointerover', () => {
      this.tweens.add({
        targets: this.adContainer,
        scale: 1.05,
        duration: 150
      });
    });
    
    adBg.on('pointerout', () => {
      this.tweens.add({
        targets: this.adContainer,
        scale: 1,
        duration: 150
      });
    });
    
    adBg.on('pointerup', () => {
      this.showRewardedAd();
    });
  }

  playEntranceAnimation() {
    // Shake effect
    this.cameras.main.shake(500, 0.02);
    
    // Game over text
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 1,
      duration: 800,
      ease: 'Cubic.easeOut'
    });
    
    // Skull
    this.tweens.add({
      targets: this.skull,
      alpha: 1,
      scale: 1,
      duration: 600,
      delay: 500,
      ease: 'Back.easeOut'
    });
    
    // Stats
    this.tweens.add({
      targets: this.statsContainer,
      alpha: 1,
      y: this.statsContainer.y + 20,
      duration: 500,
      delay: 800,
      ease: 'Cubic.easeOut'
    });
    
    // Buttons
    this.tweens.add({
      targets: this.retryButton,
      alpha: 1,
      duration: 400,
      delay: 1200
    });
    
    this.tweens.add({
      targets: this.menuButton,
      alpha: 1,
      duration: 400,
      delay: 1400
    });
    
    // Ad prompt
    this.tweens.add({
      targets: this.adContainer,
      alpha: 1,
      duration: 400,
      delay: 1600
    });
  }

  retryGame() {
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
    this.cameras.main.fadeOut(500, 0, 0, 0);
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

  showRewardedAd() {
    // Simulate rewarded ad
    const { width, height } = this.cameras.main;
    
    const adOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
    adOverlay.setDepth(100);
    
    const adText = this.add.text(width / 2, height / 2, 'Playing Ad...\n(Simulated)', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setDepth(101);
    
    // Simulate ad completion
    this.time.delayedCall(2000, () => {
      adOverlay.destroy();
      adText.destroy();
      this.revivePlayer();
    });
  }

  revivePlayer() {
    // Revive with 30% health
    const playerData = this.registry.get('playerData');
    playerData.health = Math.floor(playerData.maxHealth * 0.3);
    this.registry.set('playerData', playerData);
    
    // Return to battle
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.scene.start('MapScene');
    });
  }
}
