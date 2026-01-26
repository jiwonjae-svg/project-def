/**
 * Collection Scene - View and manage tower collection
 */

import Phaser from 'phaser';
import { Button } from '../ui/Button';

export class CollectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CollectionScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Background
    this.createBackground(width, height);
    
    // Title
    this.add.text(width / 2, 50, 'TOWER COLLECTION', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Tower collection data
    this.towerCollection = this.getTowerCollection();
    
    // Create tower grid
    this.createTowerGrid(width, height);
    
    // Back button
    new Button(this, width / 2, height - 60, '← Back to Menu', () => {
      this.scene.start('MainMenuScene');
    }, {
      width: 220,
      height: 50,
      backgroundColor: 0x555555,
      fontSize: '20px'
    });
    
    // Entrance animation
    this.cameras.main.fadeIn(400);
  }

  createBackground(width, height) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);
    
    // Decorative grid
    bg.lineStyle(1, 0x2a2a4a, 0.3);
    for (let x = 0; x < width; x += 40) {
      bg.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      bg.lineBetween(0, y, width, y);
    }
  }

  getTowerCollection() {
    return [
      {
        id: 'basic',
        name: 'Basic Tower',
        rarity: 'Normal',
        color: 0x9e9e9e,
        damage: 10,
        range: 100,
        attackSpeed: 1000,
        description: 'A simple tower with balanced stats.',
        unlocked: true
      },
      {
        id: 'archer',
        name: 'Archer Tower',
        rarity: 'Normal',
        color: 0x4caf50,
        damage: 8,
        range: 150,
        attackSpeed: 600,
        description: 'Fast attack speed, targets furthest enemy.',
        unlocked: true
      },
      {
        id: 'cannon',
        name: 'Cannon Tower',
        rarity: 'Rare',
        color: 0xff5722,
        damage: 25,
        range: 80,
        attackSpeed: 2000,
        description: 'High damage with area splash.',
        unlocked: true
      },
      {
        id: 'frost',
        name: 'Frost Tower',
        rarity: 'Rare',
        color: 0x00bcd4,
        damage: 12,
        range: 120,
        attackSpeed: 800,
        description: 'Slows enemies on hit.',
        unlocked: true
      },
      {
        id: 'lightning',
        name: 'Lightning Tower',
        rarity: 'Unique',
        color: 0xffeb3b,
        damage: 20,
        range: 130,
        attackSpeed: 900,
        description: 'Chain lightning to nearby enemies.',
        unlocked: true
      },
      {
        id: 'poison',
        name: 'Poison Tower',
        rarity: 'Unique',
        color: 0x8bc34a,
        damage: 5,
        range: 110,
        attackSpeed: 700,
        description: 'Applies poison damage over time.',
        unlocked: false
      },
      {
        id: 'laser',
        name: 'Laser Tower',
        rarity: 'Unique',
        color: 0xe91e63,
        damage: 30,
        range: 160,
        attackSpeed: 1500,
        description: 'Piercing beam hits multiple enemies.',
        unlocked: false
      },
      {
        id: 'dragon',
        name: 'Dragon Tower',
        rarity: 'Legendary',
        color: 0xffd700,
        damage: 50,
        range: 180,
        attackSpeed: 1200,
        description: 'Breathes fire in a cone.',
        unlocked: false
      },
      {
        id: 'phoenix',
        name: 'Phoenix Tower',
        rarity: 'Legendary',
        color: 0xff6b35,
        damage: 40,
        range: 150,
        attackSpeed: 800,
        description: 'Revives once when destroyed.',
        unlocked: false
      },
      {
        id: 'void',
        name: 'Void Tower',
        rarity: 'Legendary',
        color: 0x7c4dff,
        damage: 60,
        range: 140,
        attackSpeed: 2000,
        description: 'Teleports enemies backwards.',
        unlocked: false
      }
    ];
  }

  createTowerGrid(width, height) {
    const startY = 100;
    const cardWidth = 140;
    const cardHeight = 180;
    const cols = 3;
    const spacing = 15;
    const totalWidth = cols * cardWidth + (cols - 1) * spacing;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;
    
    // Rarity colors
    const rarityColors = {
      'Normal': 0x9e9e9e,
      'Rare': 0x2196f3,
      'Unique': 0x9c27b0,
      'Legendary': 0xffd700
    };

    this.towerCollection.forEach((tower, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + spacing);
      const y = startY + row * (cardHeight + spacing) + cardHeight / 2;
      
      this.createTowerCard(x, y, cardWidth, cardHeight, tower, rarityColors);
    });
  }

  createTowerCard(x, y, cardWidth, cardHeight, tower, rarityColors) {
    const container = this.add.container(x, y);
    
    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(tower.unlocked ? 0x2a2a4a : 0x1a1a2a, 0.95);
    bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
    
    // Rarity border
    const rarityColor = rarityColors[tower.rarity] || 0x9e9e9e;
    bg.lineStyle(3, tower.unlocked ? rarityColor : 0x444444, 1);
    bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
    container.add(bg);
    
    if (tower.unlocked) {
      // Tower icon (colored rectangle representing tower)
      const iconBg = this.add.circle(0, -40, 30, tower.color, 0.3);
      container.add(iconBg);
      
      const icon = this.add.rectangle(0, -40, 24, 36, tower.color);
      container.add(icon);
      
      // Tower name
      const name = this.add.text(0, 10, tower.name, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: cardWidth - 20 }
      }).setOrigin(0.5);
      container.add(name);
      
      // Rarity label
      const rarityLabel = this.add.text(0, 30, tower.rarity, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: `#${rarityColor.toString(16).padStart(6, '0')}`
      }).setOrigin(0.5);
      container.add(rarityLabel);
      
      // Stats
      const statsText = `DMG: ${tower.damage}\nRNG: ${tower.range}\nSPD: ${(1000 / tower.attackSpeed).toFixed(1)}/s`;
      const stats = this.add.text(0, 60, statsText, {
        fontFamily: 'Arial',
        fontSize: '9px',
        color: '#aaaaaa',
        align: 'center',
        lineSpacing: 2
      }).setOrigin(0.5);
      container.add(stats);
      
    } else {
      // Locked icon
      const lockIcon = this.add.text(0, -30, '🔒', {
        fontSize: '40px'
      }).setOrigin(0.5);
      container.add(lockIcon);
      
      // Locked text
      const lockedText = this.add.text(0, 20, 'LOCKED', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#666666',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(lockedText);
      
      // Tower name (dimmed)
      const name = this.add.text(0, 45, tower.name, {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#444444'
      }).setOrigin(0.5);
      container.add(name);
    }
    
    // Make interactive
    const hitArea = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: tower.unlocked });
    container.add(hitArea);
    
    hitArea.on('pointerover', () => {
      if (tower.unlocked) {
        bg.clear();
        bg.fillStyle(0x3a3a5a, 0.95);
        bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
        bg.lineStyle(3, rarityColors[tower.rarity], 1);
        bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
        container.setScale(1.05);
      }
    });
    
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(tower.unlocked ? 0x2a2a4a : 0x1a1a2a, 0.95);
      bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
      bg.lineStyle(3, tower.unlocked ? rarityColors[tower.rarity] : 0x444444, 1);
      bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
      container.setScale(1);
    });
    
    hitArea.on('pointerdown', () => {
      if (tower.unlocked) {
        this.showTowerDetail(tower);
      }
    });
  }

  showTowerDetail(tower) {
    const { width, height } = this.cameras.main;
    
    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setDepth(200);
    overlay.setInteractive();
    
    // Detail panel
    const panel = this.add.graphics();
    panel.fillStyle(0x2a2a4a, 1);
    panel.fillRoundedRect(width / 2 - 150, height / 2 - 180, 300, 360, 15);
    panel.lineStyle(3, tower.color, 1);
    panel.strokeRoundedRect(width / 2 - 150, height / 2 - 180, 300, 360, 15);
    panel.setDepth(201);
    
    // Tower icon
    const icon = this.add.rectangle(width / 2, height / 2 - 100, 50, 70, tower.color);
    icon.setDepth(202);
    
    // Tower name
    const name = this.add.text(width / 2, height / 2 - 30, tower.name, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(202);
    
    // Rarity
    const rarityColors = {
      'Normal': '#9e9e9e',
      'Rare': '#2196f3',
      'Unique': '#9c27b0',
      'Legendary': '#ffd700'
    };
    const rarity = this.add.text(width / 2, height / 2, tower.rarity, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: rarityColors[tower.rarity]
    }).setOrigin(0.5).setDepth(202);
    
    // Stats
    const statsText = `Damage: ${tower.damage}\nRange: ${tower.range}\nAttack Speed: ${(1000 / tower.attackSpeed).toFixed(1)}/s`;
    const stats = this.add.text(width / 2, height / 2 + 50, statsText, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(202);
    
    // Description
    const desc = this.add.text(width / 2, height / 2 + 120, tower.description, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#aaaaaa',
      align: 'center',
      wordWrap: { width: 260 }
    }).setOrigin(0.5).setDepth(202);
    
    // Close button
    const closeBtn = new Button(this, width / 2, height / 2 + 160, 'Close', () => {
      overlay.destroy();
      panel.destroy();
      icon.destroy();
      name.destroy();
      rarity.destroy();
      stats.destroy();
      desc.destroy();
      closeBtn.destroy();
    }, {
      width: 120,
      height: 40,
      backgroundColor: 0x555555,
      fontSize: '16px'
    });
    closeBtn.setDepth(202);
  }
}
