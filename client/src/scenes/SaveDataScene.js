/**
 * Save Data Scene - Select or create save slots
 */

import Phaser from 'phaser';
import { Button } from '../ui/Button';

export class SaveDataScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SaveDataScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);
    
    // Decorative particles
    this.createParticles(width, height);
    
    // Title
    this.add.text(width / 2, 80, 'SELECT SAVE DATA', {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(width / 2, 120, 'Choose a save slot to continue', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);
    
    // Load save data
    this.loadSaveData();
    
    // Create save slots
    this.createSaveSlots(width, height);
    
    // Back button
    new Button(this, width / 2, height - 80, '← Back to Menu', () => {
      this.scene.start('MainMenuScene');
    }, { width: 200, height: 50, color: 0x555555 });
    
    // Entrance animation
    this.cameras.main.fadeIn(400);
  }

  createParticles(width, height) {
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 2 + Math.random() * 3;
      const alpha = 0.1 + Math.random() * 0.3;
      
      const particle = this.add.circle(x, y, size, 0x4a9eff, alpha);
      
      this.tweens.add({
        targets: particle,
        y: y - 50 - Math.random() * 50,
        alpha: 0,
        duration: 3000 + Math.random() * 3000,
        repeat: -1,
        delay: Math.random() * 2000,
        onRepeat: () => {
          particle.y = height + 20;
          particle.x = Math.random() * width;
          particle.alpha = alpha;
        }
      });
    }
  }

  loadSaveData() {
    this.saveSlots = [];
    
    for (let i = 0; i < 3; i++) {
      const key = `deckDefense_save_${i}`;
      const data = localStorage.getItem(key);
      
      if (data) {
        try {
          this.saveSlots[i] = JSON.parse(data);
        } catch (e) {
          this.saveSlots[i] = null;
        }
      } else {
        this.saveSlots[i] = null;
      }
    }
  }

  createSaveSlots(width, height) {
    const startY = 180;
    const slotHeight = 120;
    const slotSpacing = 130;
    
    for (let i = 0; i < 3; i++) {
      const slotY = startY + i * slotSpacing;
      const data = this.saveSlots[i];
      
      // Slot background
      const slotBg = this.add.rectangle(width / 2, slotY, width - 60, slotHeight, 0x2a2a4a, 0.9);
      slotBg.setStrokeStyle(3, data ? 0x4a9eff : 0x3a3a5a);
      slotBg.setInteractive({ useHandCursor: true });
      
      if (data) {
        // Has save data
        this.add.text(width / 2 - 130, slotY - 35, `SLOT ${i + 1}`, {
          fontFamily: 'Arial Black',
          fontSize: '20px',
          color: '#4a9eff'
        }).setOrigin(0, 0.5);
        
        // Wave progress
        this.add.text(width / 2 - 130, slotY, `Wave: ${data.wave || 1}`, {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        // Score
        this.add.text(width / 2 - 130, slotY + 25, `Score: ${data.score || 0}`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#aaaaaa'
        }).setOrigin(0, 0.5);
        
        // Gold
        this.add.text(width / 2 + 50, slotY, `Gold: ${data.gold || 0}`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#ffd700'
        }).setOrigin(0, 0.5);
        
        // Last played
        if (data.lastPlayed) {
          const date = new Date(data.lastPlayed);
          const dateStr = date.toLocaleDateString();
          this.add.text(width / 2 + 50, slotY + 25, dateStr, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#666666'
          }).setOrigin(0, 0.5);
        }
        
        // Delete button
        const deleteBtn = this.add.text(width / 2 + 130, slotY, '🗑️', {
          fontFamily: 'Arial',
          fontSize: '24px'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        deleteBtn.on('pointerover', () => deleteBtn.setScale(1.2));
        deleteBtn.on('pointerout', () => deleteBtn.setScale(1));
        deleteBtn.on('pointerdown', (event) => {
          event.stopPropagation();
          this.confirmDelete(i);
        });
        
      } else {
        // Empty slot
        this.add.text(width / 2, slotY - 10, `SLOT ${i + 1}`, {
          fontFamily: 'Arial Black',
          fontSize: '20px',
          color: '#666666'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, slotY + 20, '- Empty -', {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#444444'
        }).setOrigin(0.5);
      }
      
      // Hover effect
      slotBg.on('pointerover', () => {
        slotBg.setFillStyle(0x3a3a5a, 0.95);
        slotBg.setStrokeStyle(3, 0x4a9eff);
      });
      
      slotBg.on('pointerout', () => {
        slotBg.setFillStyle(0x2a2a4a, 0.9);
        slotBg.setStrokeStyle(3, data ? 0x4a9eff : 0x3a3a5a);
      });
      
      // Click to select
      slotBg.on('pointerdown', () => {
        this.selectSlot(i);
      });
    }
  }

  selectSlot(slotIndex) {
    // Store current slot
    this.registry.set('currentSlot', slotIndex);
    
    const data = this.saveSlots[slotIndex];
    
    if (data) {
      // Continue from save
      this.registry.set('saveData', data);
      this.scene.start('BattleScene', { saveData: data });
    } else {
      // New game
      const newData = {
        slot: slotIndex,
        wave: 1,
        score: 0,
        gold: 100,
        towers: [],
        lastPlayed: Date.now()
      };
      
      this.saveGame(slotIndex, newData);
      this.registry.set('saveData', newData);
      this.scene.start('BattleScene', { saveData: newData });
    }
  }

  saveGame(slotIndex, data) {
    const key = `deckDefense_save_${slotIndex}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  confirmDelete(slotIndex) {
    const { width, height } = this.cameras.main;
    
    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setDepth(200);
    overlay.setInteractive();
    
    // Dialog box
    const dialog = this.add.rectangle(width / 2, height / 2, 300, 180, 0x2a2a4a, 1);
    dialog.setStrokeStyle(3, 0xff4444);
    dialog.setDepth(201);
    
    // Title
    const title = this.add.text(width / 2, height / 2 - 50, 'Delete Save?', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ff4444'
    }).setOrigin(0.5).setDepth(202);
    
    // Message
    const msg = this.add.text(width / 2, height / 2 - 10, `Delete Slot ${slotIndex + 1}?\nThis cannot be undone.`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setDepth(202);
    
    // Buttons
    const confirmBtn = new Button(this, width / 2 - 60, height / 2 + 50, 'Delete', () => {
      this.deleteSave(slotIndex);
      closeDialog();
    }, { width: 80, height: 40, color: 0xff4444 });
    confirmBtn.setDepth(202);
    
    const cancelBtn = new Button(this, width / 2 + 60, height / 2 + 50, 'Cancel', () => {
      closeDialog();
    }, { width: 80, height: 40, color: 0x555555 });
    cancelBtn.setDepth(202);
    
    const closeDialog = () => {
      overlay.destroy();
      dialog.destroy();
      title.destroy();
      msg.destroy();
      confirmBtn.destroy();
      cancelBtn.destroy();
    };
  }

  deleteSave(slotIndex) {
    const key = `deckDefense_save_${slotIndex}`;
    localStorage.removeItem(key);
    this.scene.restart();
  }
}
