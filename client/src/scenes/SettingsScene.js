/**
 * Settings Scene - Game options and preferences
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Button } from '../ui/Button';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  init(data) {
    this.returnScene = data.returnScene || 'MainMenuScene';
  }

  create() {
    const { width, height } = this.cameras.main;
    
    this.settings = this.registry.get('settings');
    
    // Create background
    this.createBackground(width, height);
    
    // Create header
    this.createHeader(width);
    
    // Create settings options
    this.createSettings(width, height);
    
    // Create footer
    this.createFooter(width, height);
    
    // Entrance animation
    this.cameras.main.fadeIn(300);
  }

  createBackground(width, height) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);
  }

  createHeader(width) {
    // Header background
    this.add.rectangle(width / 2, 60, width, 120, 0x16213e, 0.95);
    
    // Title
    this.add.text(width / 2, 50, 'SETTINGS', {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  createSettings(width, height) {
    const startY = 180;
    const spacing = 80;
    
    // Master Volume
    this.createSlider(width / 2, startY, 'Master Volume', this.settings.masterVolume, (value) => {
      this.settings.masterVolume = value;
      this.applySettings();
    });
    
    // Music Volume
    this.createSlider(width / 2, startY + spacing, 'Music Volume', this.settings.musicVolume, (value) => {
      this.settings.musicVolume = value;
      this.applySettings();
    });
    
    // SFX Volume
    this.createSlider(width / 2, startY + spacing * 2, 'SFX Volume', this.settings.sfxVolume, (value) => {
      this.settings.sfxVolume = value;
      this.applySettings();
    });
    
    // Vibration toggle
    this.createToggle(width / 2, startY + spacing * 3, 'Vibration', this.settings.vibration, (value) => {
      this.settings.vibration = value;
      this.applySettings();
    });
    
    // Notifications toggle
    this.createToggle(width / 2, startY + spacing * 4, 'Notifications', this.settings.notifications, (value) => {
      this.settings.notifications = value;
      this.applySettings();
    });
    
    // Language selector
    this.createLanguageSelector(width / 2, startY + spacing * 5);
    
    // Credits section
    this.createCredits(width, startY + spacing * 7);
  }

  createSlider(x, y, label, value, onChange) {
    // Label
    this.add.text(x - 200, y, label, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    
    // Slider background
    const sliderWidth = 200;
    const sliderBg = this.add.rectangle(x + 50, y, sliderWidth, 8, 0x333333);
    sliderBg.setOrigin(0, 0.5);
    
    // Slider fill
    const sliderFill = this.add.rectangle(x + 50, y, sliderWidth * value, 8, 0xe94560);
    sliderFill.setOrigin(0, 0.5);
    
    // Slider handle
    const handle = this.add.circle(x + 50 + sliderWidth * value, y, 15, 0xffffff);
    handle.setStrokeStyle(3, 0xe94560);
    
    // Value text
    const valueText = this.add.text(x + sliderWidth + 80, y, `${Math.round(value * 100)}%`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    
    // Make interactive
    const hitArea = this.add.rectangle(x + 50 + sliderWidth / 2, y, sliderWidth + 30, 40, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerdown', (pointer) => {
      this.updateSlider(pointer, x + 50, sliderWidth, sliderFill, handle, valueText, onChange);
    });
    
    hitArea.on('pointermove', (pointer) => {
      if (pointer.isDown) {
        this.updateSlider(pointer, x + 50, sliderWidth, sliderFill, handle, valueText, onChange);
      }
    });
  }

  updateSlider(pointer, startX, width, fill, handle, text, onChange) {
    const relativeX = Phaser.Math.Clamp(pointer.x - startX, 0, width);
    const value = relativeX / width;
    
    fill.width = relativeX;
    handle.x = startX + relativeX;
    text.setText(`${Math.round(value * 100)}%`);
    
    onChange(value);
  }

  createToggle(x, y, label, value, onChange) {
    // Label
    this.add.text(x - 200, y, label, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    
    // Toggle background
    const toggleWidth = 60;
    const toggleHeight = 30;
    const toggleBg = this.add.rectangle(x + 100, y, toggleWidth, toggleHeight, value ? 0x4caf50 : 0x666666, 1);
    toggleBg.setStrokeStyle(2, 0x333333);
    
    // Toggle handle
    const handleX = value ? x + 100 + toggleWidth / 2 - 15 : x + 100 - toggleWidth / 2 + 15;
    const toggleHandle = this.add.circle(handleX, y, 12, 0xffffff);
    
    // Make interactive
    toggleBg.setInteractive({ useHandCursor: true });
    
    toggleBg.on('pointerup', () => {
      const newValue = !value;
      value = newValue;
      
      // Animate toggle
      this.tweens.add({
        targets: toggleHandle,
        x: newValue ? x + 100 + toggleWidth / 2 - 15 : x + 100 - toggleWidth / 2 + 15,
        duration: 150,
        ease: 'Cubic.easeOut'
      });
      
      toggleBg.setFillStyle(newValue ? 0x4caf50 : 0x666666);
      
      onChange(newValue);
    });
  }

  createLanguageSelector(x, y) {
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'ko', name: '한국어' },
      { code: 'ja', name: '日本語' },
      { code: 'zh', name: '中文' }
    ];
    
    // Label
    this.add.text(x - 200, y, 'Language', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    
    // Current language display
    const currentLang = languages.find(l => l.code === this.settings.language) || languages[0];
    
    const langBtn = new Button(this, x + 100, y, currentLang.name, {
      width: 150,
      height: 40,
      fontSize: '16px',
      backgroundColor: 0x533483,
      onClick: () => this.cycleLanguage(languages, langBtn)
    });
  }

  cycleLanguage(languages, button) {
    const currentIdx = languages.findIndex(l => l.code === this.settings.language);
    const nextIdx = (currentIdx + 1) % languages.length;
    const nextLang = languages[nextIdx];
    
    this.settings.language = nextLang.code;
    button.setText(nextLang.name);
    this.applySettings();
  }

  createCredits(width, y) {
    // Divider line
    const line = this.add.rectangle(width / 2, y - 20, width - 80, 2, 0x333333);
    
    // Credits title
    this.add.text(width / 2, y + 20, 'Credits', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Credits text
    this.add.text(width / 2, y + 60, 'Made with Phaser.js\nDeck Defense Roguelike\n© 2024', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);
    
    // Version
    this.add.text(width / 2, y + 120, 'v1.0.0', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(0.5);
  }

  createFooter(width, height) {
    // Footer background
    this.add.rectangle(width / 2, height - 50, width, 100, 0x16213e, 0.95);
    
    // Back button
    new Button(this, width / 2, height - 50, 'Back', {
      width: 150,
      height: 50,
      fontSize: '20px',
      backgroundColor: 0x666666,
      onClick: () => this.goBack()
    });
  }

  applySettings() {
    // Save settings to registry
    this.registry.set('settings', this.settings);
    
    // Apply audio settings
    this.sound.volume = this.settings.masterVolume;
    
    // TODO: Save to local storage or Firebase
  }

  goBack() {
    this.scene.start(this.returnScene);
  }
}
