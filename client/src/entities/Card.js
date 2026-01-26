/**
 * Card Entity - Visual representation of a playable card
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Card extends Phaser.GameObjects.Container {
  constructor(scene, x, y, cardData) {
    super(scene, x, y);
    
    this.scene = scene;
    this.cardData = cardData;
    this.isDragging = false;
    this.originalX = x;
    this.originalY = y;
    
    this.createCard();
    
    scene.add.existing(this);
    this.setScale(GameConfig.CARD_SCALE_HAND);
  }

  createCard() {
    const width = GameConfig.CARD_WIDTH;
    const height = GameConfig.CARD_HEIGHT;
    
    // Card frame based on rarity
    const rarityKey = this.cardData.rarity.toLowerCase();
    const frameTexture = `card_frame_${rarityKey}`;
    
    if (this.scene.textures.exists(frameTexture)) {
      this.cardFrame = this.scene.add.image(0, 0, frameTexture);
    } else {
      // Fallback to generated frame
      this.cardFrame = this.createCardFrame(width, height);
    }
    this.add(this.cardFrame);
    
    // Card art placeholder
    this.createCardArt();
    
    // Energy cost
    this.costText = this.scene.add.text(-45, -75, `${this.cardData.cost}`, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.add(this.costText);
    
    // Card name
    this.nameText = this.scene.add.text(0, 10, this.cardData.name, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 100 }
    }).setOrigin(0.5, 0);
    this.add(this.nameText);
    
    // Card description
    this.descText = this.scene.add.text(0, 35, this.cardData.description, {
      fontFamily: 'Arial',
      fontSize: '9px',
      color: '#aaaaaa',
      align: 'center',
      wordWrap: { width: 95 }
    }).setOrigin(0.5, 0);
    this.add(this.descText);
    
    // Type icon/badge
    this.createTypeBadge();
    
    // Upgrade indicator
    if (this.cardData.upgraded) {
      this.createUpgradeIndicator();
    }
    
    // Set interactive hit area
    this.setSize(width, height);
  }

  createCardFrame(width, height) {
    const graphics = this.scene.add.graphics();
    
    // Get rarity color
    const rarityColors = {
      common: 0x9e9e9e,
      uncommon: 0x4caf50,
      rare: 0x2196f3,
      epic: 0x9c27b0,
      legendary: 0xff9800
    };
    
    const rarityColor = rarityColors[this.cardData.rarity.toLowerCase()] || 0x9e9e9e;
    
    // Background
    graphics.fillStyle(0x16213e);
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    
    // Border
    graphics.lineStyle(3, rarityColor);
    graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    
    return graphics;
  }

  createCardArt() {
    // Create dynamic art based on card type
    const artContainer = this.scene.add.container(0, -35);
    
    // Art background
    const artBg = this.scene.add.rectangle(0, 0, 100, 60, 0x0f3460);
    artContainer.add(artBg);
    
    // Icon based on card type
    const typeColors = {
      tower: 0x4caf50,
      spell: 0x9c27b0,
      modifier: 0xff9800,
      resource: 0x00bcd4
    };
    
    const color = typeColors[this.cardData.type] || 0xffffff;
    
    // Simple icon
    if (this.cardData.type === 'tower') {
      // Tower shape
      const tower = this.scene.add.polygon(0, 0, [
        0, -20,
        15, 0,
        10, 0,
        10, 20,
        -10, 20,
        -10, 0,
        -15, 0
      ], color);
      artContainer.add(tower);
    } else if (this.cardData.type === 'spell') {
      // Star shape
      const star = this.scene.add.star(0, 0, 5, 10, 20, color);
      artContainer.add(star);
    } else if (this.cardData.type === 'modifier') {
      // Arrow up
      const arrow = this.scene.add.triangle(0, 0, 0, -20, 15, 15, -15, 15, color);
      artContainer.add(arrow);
    } else {
      // Circle for resource
      const circle = this.scene.add.circle(0, 0, 18, color);
      artContainer.add(circle);
    }
    
    this.add(artContainer);
  }

  createTypeBadge() {
    const typeIcons = {
      tower: '🏰',
      spell: '✨',
      modifier: '⬆',
      resource: '💎'
    };
    
    const icon = typeIcons[this.cardData.type] || '?';
    
    this.typeBadge = this.scene.add.text(45, -75, icon, {
      fontFamily: 'Arial',
      fontSize: '14px'
    }).setOrigin(0.5);
    this.add(this.typeBadge);
  }

  createUpgradeIndicator() {
    // Plus sign for upgraded cards
    const upgrade = this.scene.add.text(50, 75, '+', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#4caf50'
    }).setOrigin(0.5);
    this.add(upgrade);
    
    // Glow effect for upgraded name
    this.nameText.setColor('#4caf50');
  }

  highlight(color = 0x4caf50) {
    this.cardFrame.setTint(color);
  }

  clearHighlight() {
    this.cardFrame.clearTint();
  }

  playAnimation() {
    // Card play animation - called when card is being used
    this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      alpha: 0,
      y: this.y - 50,
      duration: 300,
      ease: 'Back.easeIn'
    });
  }

  discardAnimation(targetX, targetY) {
    // Animation when card goes to discard pile
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      scale: 0.3,
      alpha: 0,
      angle: Phaser.Math.Between(-30, 30),
      duration: 400,
      ease: 'Cubic.easeIn',
      onComplete: () => this.destroy()
    });
  }

  flipCard(callback) {
    // Card flip animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 150,
      ease: 'Linear',
      onComplete: () => {
        if (callback) callback();
        this.scene.tweens.add({
          targets: this,
          scaleX: GameConfig.CARD_SCALE_HAND,
          duration: 150,
          ease: 'Linear'
        });
      }
    });
  }
}
