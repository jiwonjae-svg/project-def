/**
 * Preload Scene - Asset loading with progress display
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create loading progress bar
    this.createLoadingUI();

    // Load all game assets
    this.loadImages();
    this.loadSpritesheets();
    this.loadAudio();
    this.loadFonts();

    // Loading progress events - using Phaser's built-in loader events
    this.load.on('progress', (value) => {
      this.updateProgress(value);
    });

    this.load.on('fileprogress', (file) => {
      this.updateFileProgress(file);
    });

    this.load.on('complete', () => {
      this.loadComplete();
    });

    this.load.on('loaderror', (file) => {
      console.error('Error loading file:', file.key, file.url);
      this.handleLoadError(file);
    });
  }

  createLoadingUI() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    this.titleText = this.add.text(width / 2, height * 0.35, 'DECK DEFENSE', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '48px',
      color: '#e94560',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Add pulsing animation to title
    this.tweens.add({
      targets: this.titleText,
      scale: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Progress bar background
    this.progressBg = this.add.rectangle(
      width / 2, height * 0.55,
      width * 0.7, 20,
      0x16213e
    ).setStrokeStyle(2, 0x533483);

    // Progress bar fill
    this.progressBar = this.add.rectangle(
      width / 2 - (width * 0.7) / 2 + 2,
      height * 0.55,
      0, 16,
      0xe94560
    ).setOrigin(0, 0.5);

    // Loading text
    this.loadingText = this.add.text(width / 2, height * 0.62, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // File name text (shows current file being loaded)
    this.fileText = this.add.text(width / 2, height * 0.67, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height * 0.45, 'Roguelike Tower Defense', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      alpha: 0.7
    }).setOrigin(0.5);

    // Loading spinner animation
    this.createLoadingSpinner(width / 2, height * 0.75);
  }

  createLoadingSpinner(x, y) {
    // Simple rotating circles for loading indicator
    this.spinnerCircles = [];
    const circleCount = 8;
    const radius = 30;

    for (let i = 0; i < circleCount; i++) {
      const angle = (i / circleCount) * Math.PI * 2;
      const circleX = x + Math.cos(angle) * radius;
      const circleY = y + Math.sin(angle) * radius;
      
      const circle = this.add.circle(circleX, circleY, 4, 0xe94560);
      circle.setAlpha(0.2 + (i / circleCount) * 0.8);
      this.spinnerCircles.push(circle);
    }

    // Rotate spinner
    this.spinnerAngle = 0;
    this.time.addEvent({
      delay: 50,
      callback: () => {
        this.spinnerAngle += Math.PI / 8;
        this.spinnerCircles.forEach((circle, i) => {
          const angle = (i / circleCount) * Math.PI * 2 + this.spinnerAngle;
          circle.x = x + Math.cos(angle) * radius;
          circle.y = y + Math.sin(angle) * radius;
        });
      },
      loop: true
    });
  }

  updateProgress(value) {
    const { width } = this.cameras.main;
    const progressWidth = (width * 0.7 - 4) * value;
    
    this.progressBar.width = progressWidth;
    
    const percent = Math.floor(value * 100);
    this.loadingText.setText(`Loading assets... ${percent}%`);

    // Add color transition as progress increases
    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0xe94560),
      Phaser.Display.Color.ValueToColor(0x4caf50),
      100,
      percent
    );
    this.progressBar.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
  }

  updateFileProgress(file) {
    // Show which file is currently being loaded
    const fileName = file.key || 'unknown';
    const fileType = file.type || '';
    this.fileText.setText(`Loading ${fileType}: ${fileName}`);
  }

  handleLoadError(file) {
    // Show error in file text
    this.fileText.setText(`Error loading: ${file.key}`);
    this.fileText.setColor('#ff5252');
  }

  loadComplete() {
    this.loadingText.setText('Ready!');
    this.loadingText.setColor('#4caf50');
    
    // Stop spinner animation
    if (this.spinnerCircles) {
      this.spinnerCircles.forEach(circle => {
        this.tweens.add({
          targets: circle,
          alpha: 0,
          duration: 300
        });
      });
    }

    // Add checkmark animation
    const { width, height } = this.cameras.main;
    const checkmark = this.add.text(width / 2 + 200, height * 0.55, '✓', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#4caf50'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: checkmark,
      alpha: 1,
      scale: 1.5,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Short delay before transitioning
    this.time.delayedCall(800, () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.start('MainMenuScene');
      });
    });
  }

  loadImages() {
    // Generate placeholder graphics programmatically
    this.generatePlaceholderAssets();
  }

  loadSpritesheets() {
    // Spritesheets will be generated as placeholders
  }

  loadAudio() {
    // Audio will be loaded when actual files are available
  }

  loadFonts() {
    // Web fonts are loaded via CSS
  }

  generatePlaceholderAssets() {
    // Generate card back
    this.generateCardBack();
    
    // Generate card frames for each rarity
    this.generateCardFrames();
    
    // Generate tower sprites
    this.generateTowerSprites();
    
    // Generate enemy sprites
    this.generateEnemySprites();
    
    // Generate UI elements
    this.generateUIElements();
    
    // Generate particle textures
    this.generateParticles();
    
    // Generate map nodes
    this.generateMapNodes();
  }

  generateCardBack() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Card back design
    graphics.fillStyle(0x16213e);
    graphics.fillRoundedRect(0, 0, 120, 180, 12);
    graphics.lineStyle(3, 0xe94560);
    graphics.strokeRoundedRect(0, 0, 120, 180, 12);
    
    // Pattern
    graphics.lineStyle(1, 0x533483, 0.5);
    for (let i = 0; i < 6; i++) {
      graphics.strokeCircle(60, 90, 15 + i * 12);
    }
    
    // Center diamond
    graphics.fillStyle(0xe94560);
    graphics.beginPath();
    graphics.moveTo(60, 50);
    graphics.lineTo(85, 90);
    graphics.lineTo(60, 130);
    graphics.lineTo(35, 90);
    graphics.closePath();
    graphics.fill();
    
    graphics.generateTexture('card_back', 120, 180);
  }

  generateCardFrames() {
    const rarities = [
      { key: 'common', color: 0x9e9e9e },
      { key: 'uncommon', color: 0x4caf50 },
      { key: 'rare', color: 0x2196f3 },
      { key: 'epic', color: 0x9c27b0 },
      { key: 'legendary', color: 0xff9800 }
    ];

    rarities.forEach(rarity => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      
      // Card background
      graphics.fillStyle(0x16213e);
      graphics.fillRoundedRect(0, 0, 120, 180, 12);
      
      // Rarity border
      graphics.lineStyle(3, rarity.color);
      graphics.strokeRoundedRect(0, 0, 120, 180, 12);
      
      // Inner border
      graphics.lineStyle(1, rarity.color, 0.3);
      graphics.strokeRoundedRect(6, 6, 108, 168, 8);
      
      // Art area
      graphics.fillStyle(0x0f3460);
      graphics.fillRoundedRect(10, 10, 100, 70, 6);
      
      // Text area
      graphics.fillStyle(0x1a1a2e);
      graphics.fillRoundedRect(10, 85, 100, 85, 6);
      
      // Energy cost circle
      graphics.fillStyle(0x00bcd4);
      graphics.fillCircle(20, 20, 14);
      graphics.lineStyle(2, 0xffffff);
      graphics.strokeCircle(20, 20, 14);
      
      graphics.generateTexture(`card_frame_${rarity.key}`, 120, 180);
    });
  }

  generateTowerSprites() {
    const towers = [
      { key: 'tower_basic', color: 0x9e9e9e },
      { key: 'tower_archer', color: 0x4caf50 },
      { key: 'tower_mage', color: 0x9c27b0 },
      { key: 'tower_cannon', color: 0xff5722 },
      { key: 'tower_frost', color: 0x00bcd4 },
      { key: 'tower_lightning', color: 0xffeb3b }
    ];

    towers.forEach(tower => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      
      // Base
      graphics.fillStyle(0x333333);
      graphics.fillEllipse(40, 75, 60, 20);
      
      // Tower body
      graphics.fillStyle(tower.color);
      graphics.fillRect(25, 30, 30, 45);
      
      // Tower top
      graphics.fillStyle(tower.color);
      graphics.beginPath();
      graphics.moveTo(40, 5);
      graphics.lineTo(60, 30);
      graphics.lineTo(20, 30);
      graphics.closePath();
      graphics.fill();
      
      // Outline
      graphics.lineStyle(2, 0xffffff, 0.5);
      graphics.strokeRect(25, 30, 30, 45);
      
      graphics.generateTexture(tower.key, 80, 80);
    });
  }

  generateEnemySprites() {
    const enemies = [
      { key: 'enemy_normal', color: 0xf44336, size: 32 },
      { key: 'enemy_fast', color: 0xff9800, size: 28 },
      { key: 'enemy_tank', color: 0x795548, size: 40 },
      { key: 'enemy_flying', color: 0x9c27b0, size: 30 },
      { key: 'enemy_boss', color: 0x000000, size: 56 },
      { key: 'enemy_elite', color: 0xffd700, size: 44 }
    ];

    enemies.forEach(enemy => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      const size = enemy.size;
      const center = size / 2;
      
      // Shadow
      graphics.fillStyle(0x000000, 0.3);
      graphics.fillEllipse(center, size - 5, size * 0.6, 8);
      
      // Body
      graphics.fillStyle(enemy.color);
      graphics.fillCircle(center, center, size * 0.4);
      
      // Eyes
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(center - 5, center - 3, 4);
      graphics.fillCircle(center + 5, center - 3, 4);
      
      // Pupils
      graphics.fillStyle(0x000000);
      graphics.fillCircle(center - 4, center - 3, 2);
      graphics.fillCircle(center + 6, center - 3, 2);
      
      // Outline
      graphics.lineStyle(2, 0x000000, 0.5);
      graphics.strokeCircle(center, center, size * 0.4);
      
      graphics.generateTexture(enemy.key, size, size);
    });
  }

  generateUIElements() {
    // Button normal
    let graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xe94560);
    graphics.fillRoundedRect(0, 0, 200, 60, 15);
    graphics.lineStyle(3, 0xff6b6b);
    graphics.strokeRoundedRect(0, 0, 200, 60, 15);
    graphics.generateTexture('button_primary', 200, 60);
    
    // Button secondary
    graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x533483);
    graphics.fillRoundedRect(0, 0, 200, 60, 15);
    graphics.lineStyle(3, 0x7b5ea7);
    graphics.strokeRoundedRect(0, 0, 200, 60, 15);
    graphics.generateTexture('button_secondary', 200, 60);
    
    // Icon backgrounds
    graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x16213e);
    graphics.fillCircle(25, 25, 25);
    graphics.lineStyle(2, 0xe94560);
    graphics.strokeCircle(25, 25, 25);
    graphics.generateTexture('icon_bg', 50, 50);
    
    // Health bar background
    graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x333333);
    graphics.fillRoundedRect(0, 0, 200, 20, 10);
    graphics.generateTexture('health_bar_bg', 200, 20);
    
    // Health bar fill
    graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xf44336);
    graphics.fillRoundedRect(0, 0, 200, 20, 10);
    graphics.generateTexture('health_bar_fill', 200, 20);
    
    // Energy bar fill
    graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00bcd4);
    graphics.fillRoundedRect(0, 0, 200, 20, 10);
    graphics.generateTexture('energy_bar_fill', 200, 20);
    
    // Panel background
    graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x16213e, 0.95);
    graphics.fillRoundedRect(0, 0, 300, 400, 20);
    graphics.lineStyle(3, 0x533483);
    graphics.strokeRoundedRect(0, 0, 300, 400, 20);
    graphics.generateTexture('panel_bg', 300, 400);
    
    // Gold icon
    graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffd700);
    graphics.fillCircle(16, 16, 14);
    graphics.lineStyle(2, 0xb8860b);
    graphics.strokeCircle(16, 16, 14);
    graphics.fillStyle(0xb8860b);
    graphics.fillRect(12, 8, 8, 16);
    graphics.generateTexture('icon_gold', 32, 32);
    
    // Energy icon
    graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00bcd4);
    graphics.beginPath();
    graphics.moveTo(16, 0);
    graphics.lineTo(8, 16);
    graphics.lineTo(18, 16);
    graphics.lineTo(12, 32);
    graphics.lineTo(24, 12);
    graphics.lineTo(14, 12);
    graphics.closePath();
    graphics.fill();
    graphics.generateTexture('icon_energy', 32, 32);
    
    // Heart icon
    graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xf44336);
    graphics.fillCircle(10, 12, 8);
    graphics.fillCircle(22, 12, 8);
    graphics.beginPath();
    graphics.moveTo(2, 14);
    graphics.lineTo(16, 30);
    graphics.lineTo(30, 14);
    graphics.closePath();
    graphics.fill();
    graphics.generateTexture('icon_heart', 32, 32);
  }

  generateParticles() {
    // Circle particle
    let graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('particle_circle', 16, 16);
    
    // Star particle
    graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff);
    this.drawStar(graphics, 12, 12, 5, 12, 6);
    graphics.generateTexture('particle_star', 24, 24);
    
    // Spark particle
    graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff);
    graphics.fillRect(6, 0, 4, 16);
    graphics.fillRect(0, 6, 16, 4);
    graphics.generateTexture('particle_spark', 16, 16);
  }

  generateMapNodes() {
    const nodeTypes = [
      { key: 'node_battle', color: 0xf44336 },
      { key: 'node_elite', color: 0xffd700 },
      { key: 'node_boss', color: 0x000000 },
      { key: 'node_shop', color: 0x4caf50 },
      { key: 'node_event', color: 0x9c27b0 },
      { key: 'node_rest', color: 0x2196f3 },
      { key: 'node_treasure', color: 0xff9800 }
    ];

    nodeTypes.forEach(node => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      
      // Outer glow
      graphics.fillStyle(node.color, 0.3);
      graphics.fillCircle(30, 30, 28);
      
      // Main circle
      graphics.fillStyle(node.color);
      graphics.fillCircle(30, 30, 22);
      
      // Inner highlight
      graphics.fillStyle(0xffffff, 0.3);
      graphics.fillCircle(25, 25, 10);
      
      // Border
      graphics.lineStyle(3, 0xffffff, 0.5);
      graphics.strokeCircle(30, 30, 22);
      
      graphics.generateTexture(node.key, 60, 60);
    });
    
    // Locked node
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x333333);
    graphics.fillCircle(30, 30, 22);
    graphics.lineStyle(2, 0x666666);
    graphics.strokeCircle(30, 30, 22);
    graphics.generateTexture('node_locked', 60, 60);
    
    // Path line
    const pathGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    pathGraphics.fillStyle(0x666666);
    pathGraphics.fillRect(0, 0, 100, 4);
    pathGraphics.generateTexture('map_path', 100, 4);
  }

  drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;

    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      graphics.lineTo(
        cx + Math.cos(rot) * outerRadius,
        cy + Math.sin(rot) * outerRadius
      );
      rot += step;

      graphics.lineTo(
        cx + Math.cos(rot) * innerRadius,
        cy + Math.sin(rot) * innerRadius
      );
      rot += step;
    }

    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fill();
  }
}
