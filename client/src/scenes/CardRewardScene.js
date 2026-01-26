/**
 * Card Reward Scene - Choose cards after battle
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { Card } from '../entities/Card';
import { CardDatabase } from '../data/CardDatabase';

export class CardRewardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CardRewardScene' });
  }

  init(data) {
    this.rewardData = data || {};
  }

  create() {
    const { width, height } = this.cameras.main;
    
    this.playerData = this.registry.get('playerData');
    
    // Generate card rewards
    const isElite = this.rewardData.isElite || false;
    this.cardRewards = CardDatabase.getCardRewards(3, isElite);
    
    // Create background
    this.createBackground(width, height);
    
    // Create header
    this.createHeader(width, height);
    
    // Display card choices
    this.displayCards(width, height);
    
    // Skip button
    this.createSkipButton(width, height);
    
    // Show gold reward
    if (this.rewardData.gold > 0) {
      this.showGoldReward(width, height);
    }
    
    // Entrance animation
    this.cameras.main.fadeIn(300);
  }

  createBackground(width, height) {
    // Dark overlay
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    
    // Decorative particles
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const star = this.add.star(x, y, 4, 2, 4, 0xffd700, 0.3);
      
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        scale: 0.5,
        duration: Phaser.Math.Between(1000, 2000),
        yoyo: true,
        repeat: -1
      });
    }
  }

  createHeader(width, height) {
    // Victory text
    this.add.text(width / 2, 100, 'VICTORY!', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(width / 2, 160, 'Choose a card to add to your deck', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Battle stats
    if (this.rewardData.gold) {
      const statsY = 200;
      
      // Gold earned
      this.add.image(width / 2 - 40, statsY, 'icon_gold').setScale(0.8);
      this.add.text(width / 2 - 15, statsY, `+${this.rewardData.gold}`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffd700'
      }).setOrigin(0, 0.5);
      
      // Score
      if (this.rewardData.score) {
        this.add.text(width / 2 + 60, statsY, `Score: ${this.rewardData.score}`, {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#ffffff'
        }).setOrigin(0, 0.5);
      }
    }
  }

  displayCards(width, height) {
    const cardY = height / 2;
    const cardSpacing = 160;
    const startX = width / 2 - cardSpacing;
    
    this.cardDisplays = [];
    
    this.cardRewards.forEach((cardData, index) => {
      const x = startX + index * cardSpacing;
      this.createCardChoice(x, cardY, cardData, index);
    });
    
    // Entrance animation for cards
    this.cardDisplays.forEach((display, index) => {
      display.setScale(0);
      display.setAlpha(0);
      
      this.tweens.add({
        targets: display,
        scale: 1,
        alpha: 1,
        duration: 400,
        delay: 300 + index * 150,
        ease: 'Back.easeOut'
      });
    });
  }

  createCardChoice(x, y, cardData, index) {
    const card = new Card(this, x, y, cardData);
    card.setScale(1);
    
    // Glow behind card
    const glow = this.add.graphics();
    const rarityColors = {
      Common: 0x9e9e9e,
      Uncommon: 0x4caf50,
      Rare: 0x2196f3,
      Epic: 0x9c27b0,
      Legendary: 0xff9800
    };
    const glowColor = rarityColors[cardData.rarity] || 0xffffff;
    
    glow.fillStyle(glowColor, 0.3);
    glow.fillCircle(x, y, 100);
    glow.setDepth(-1);
    
    // Pulsing glow animation
    this.tweens.add({
      targets: glow,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Make card interactive
    card.setInteractive({ useHandCursor: true });
    
    card.on('pointerover', () => {
      this.tweens.add({
        targets: card,
        scale: 1.2,
        y: y - 30,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });
    
    card.on('pointerout', () => {
      this.tweens.add({
        targets: card,
        scale: 1,
        y: y,
        duration: 200
      });
    });
    
    card.on('pointerup', () => {
      this.selectCard(cardData, card, index);
    });
    
    this.cardDisplays.push(card);
  }

  selectCard(cardData, selectedCard, index) {
    // Disable all card interactions
    this.cardDisplays.forEach(card => {
      card.disableInteractive();
    });
    
    // Add card to deck
    this.playerData.deck.push({ ...cardData });
    this.registry.set('playerData', this.playerData);
    
    // Selection animation
    this.tweens.add({
      targets: selectedCard,
      scale: 1.5,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Fade out other cards
    this.cardDisplays.forEach((card, i) => {
      if (i !== index) {
        this.tweens.add({
          targets: card,
          alpha: 0,
          scale: 0,
          duration: 300
        });
      }
    });
    
    // Show confirmation
    const { width, height } = this.cameras.main;
    const confirmText = this.add.text(width / 2, height / 2 + 150, 'Card Added!', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#4caf50',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0);
    
    this.tweens.add({
      targets: confirmText,
      alpha: 1,
      duration: 300
    });
    
    // Transition after delay
    this.time.delayedCall(1500, () => {
      this.proceedToMap();
    });
  }

  createSkipButton(width, height) {
    new Button(this, width / 2, height - 100, 'Skip Reward', {
      width: 180,
      height: 50,
      fontSize: '18px',
      backgroundColor: 0x666666,
      onClick: () => this.proceedToMap()
    });
  }

  showGoldReward(width, height) {
    // Animated gold popup
    const goldContainer = this.add.container(width / 2, 50);
    
    const goldIcon = this.add.image(0, 0, 'icon_gold').setScale(1.5);
    goldContainer.add(goldIcon);
    
    const goldText = this.add.text(30, 0, `+${this.rewardData.gold}`, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffd700'
    }).setOrigin(0, 0.5);
    goldContainer.add(goldText);
    
    goldContainer.setAlpha(0);
    goldContainer.setScale(0);
    
    this.tweens.add({
      targets: goldContainer,
      alpha: 1,
      scale: 1,
      duration: 500,
      delay: 500,
      ease: 'Back.easeOut'
    });
    
    // Float up and fade
    this.tweens.add({
      targets: goldContainer,
      y: goldContainer.y - 30,
      alpha: 0,
      duration: 1000,
      delay: 2000
    });
  }

  proceedToMap() {
    // Check for act/game completion
    const currentFloor = this.playerData.currentFloor;
    const floorsPerAct = GameConfig.FLOORS_PER_ACT;
    
    if (currentFloor > floorsPerAct * GameConfig.TOTAL_ACTS) {
      // Game won!
      this.scene.start('VictoryScene', {
        score: this.playerData.score,
        gold: this.playerData.gold
      });
    } else if (currentFloor > floorsPerAct * this.playerData.currentAct) {
      // Act completed
      this.playerData.currentAct++;
      this.registry.set('playerData', this.playerData);
      this.registry.remove('currentMap'); // Generate new map for next act
      this.scene.start('MapScene');
    } else {
      this.scene.start('MapScene');
    }
  }
}
