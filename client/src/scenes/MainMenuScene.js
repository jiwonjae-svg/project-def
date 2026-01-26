/**
 * Main Menu Scene - Title screen with stylish animations
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { ParticleEffects } from '../effects/ParticleEffects';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Background with gradient
    this.createBackground(width, height);
    
    // Particle effects
    this.createParticles(width, height);
    
    // Title
    this.createTitle(width, height);
    
    // Menu buttons
    this.createMenuButtons(width, height);
    
    // Version text
    this.add.text(width - 20, height - 20, 'v1.0.0', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(1, 1);
    
    // Entrance animation
    this.playEntranceAnimation();
  }

  createBackground(width, height) {
    // Gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1);
    bg.fillRect(0, 0, width, height);
    
    // Animated background elements
    this.bgElements = [];
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(2, 6);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
      
      const element = this.add.circle(x, y, size, 0xffffff, alpha);
      this.bgElements.push(element);
      
      // Floating animation
      this.tweens.add({
        targets: element,
        y: y - Phaser.Math.Between(20, 50),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
    
    // Decorative circles
    this.add.circle(width * 0.1, height * 0.2, 150, 0xe94560, 0.05);
    this.add.circle(width * 0.9, height * 0.8, 200, 0x533483, 0.05);
  }

  createParticles(width, height) {
    // Floating card particles
    if (this.textures.exists('card_back')) {
      for (let i = 0; i < 5; i++) {
        const card = this.add.image(
          Phaser.Math.Between(50, width - 50),
          Phaser.Math.Between(100, height - 200),
          'card_back'
        ).setScale(0.3).setAlpha(0.2).setAngle(Phaser.Math.Between(-20, 20));
        
        this.tweens.add({
          targets: card,
          y: card.y - 30,
          angle: card.angle + Phaser.Math.Between(-10, 10),
          duration: Phaser.Math.Between(2000, 4000),
          repeat: -1,
          yoyo: true,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  createTitle(width, height) {
    // Main title
    this.titleText = this.add.text(width / 2, height * 0.18, 'DECK', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '72px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);
    
    this.titleText2 = this.add.text(width / 2, height * 0.26, 'DEFENSE', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '72px',
      color: '#e94560',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);
    
    // Subtitle
    this.subtitleText = this.add.text(width / 2, height * 0.34, 'Roguelike Tower Defense', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setAlpha(0);
    
    // Add glow effect to title
    this.titleGlow = this.add.rectangle(width / 2, height * 0.22, 400, 150, 0xe94560, 0);
    this.tweens.add({
      targets: this.titleGlow,
      alpha: 0.1,
      duration: 2000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  createMenuButtons(width, height) {
    const buttonSpacing = 80;
    const startY = height * 0.5;
    
    // Play button
    this.playButton = new Button(this, width / 2, startY, 'PLAY', {
      width: 280,
      height: 70,
      fontSize: '32px',
      backgroundColor: 0xe94560,
      hoverColor: 0xff6b6b,
      onClick: () => this.scene.start('SaveDataScene')
    });
    
    // Continue button (if save exists)
    this.continueButton = new Button(this, width / 2, startY + buttonSpacing, 'CONTINUE', {
      width: 280,
      height: 60,
      fontSize: '24px',
      backgroundColor: 0x533483,
      hoverColor: 0x7b5ea7,
      onClick: () => this.continueGame()
    });
    
    // Deck Collection button
    this.collectionButton = new Button(this, width / 2, startY + buttonSpacing * 2, 'COLLECTION', {
      width: 280,
      height: 60,
      fontSize: '24px',
      backgroundColor: 0x0f3460,
      hoverColor: 0x1a4a7a,
      onClick: () => this.openCollection()
    });
    
    // Settings button
    this.settingsButton = new Button(this, width / 2, startY + buttonSpacing * 3, 'SETTINGS', {
      width: 280,
      height: 60,
      fontSize: '24px',
      backgroundColor: 0x0f3460,
      hoverColor: 0x1a4a7a,
      onClick: () => this.openSettings()
    });
    
    // Store initial positions for animation
    this.menuButtons = [
      this.playButton,
      this.continueButton,
      this.collectionButton,
      this.settingsButton
    ];
    
    this.menuButtons.forEach(btn => {
      btn.setAlpha(0);
      btn.setScale(0.8);
    });
  }

  playEntranceAnimation() {
    // Title animation
    this.tweens.add({
      targets: this.titleText,
      alpha: 1,
      y: this.titleText.y + 20,
      duration: 800,
      ease: 'Back.easeOut'
    });
    
    this.tweens.add({
      targets: this.titleText2,
      alpha: 1,
      y: this.titleText2.y + 20,
      duration: 800,
      delay: 200,
      ease: 'Back.easeOut'
    });
    
    this.tweens.add({
      targets: this.subtitleText,
      alpha: 1,
      duration: 600,
      delay: 500
    });
    
    // Button animations with stagger
    this.menuButtons.forEach((button, index) => {
      this.tweens.add({
        targets: button,
        alpha: 1,
        scale: 1,
        duration: 500,
        delay: 600 + index * 100,
        ease: 'Back.easeOut'
      });
    });
  }

  startGame() {
    // Flash effect
    this.cameras.main.flash(300, 233, 69, 96);
    
    // Reset player data for new run
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
    
    // Transition to map scene
    this.time.delayedCall(300, () => {
      this.scene.start('MapScene');
    });
  }

  getStarterDeck() {
    // Return starter deck cards
    const { CardDatabase } = require('../data/CardDatabase');
    return CardDatabase.getStarterDeck();
  }

  continueGame() {
    // TODO: Load saved game from Firebase
    console.log('Continue game - Loading save...');
  }

  openCollection() {
    this.scene.start('CollectionScene');
  }

  openSettings() {
    this.scene.start('SettingsScene', { returnScene: 'MainMenuScene' });
  }
}
