/**
 * Deck View Scene - View, upgrade, or remove cards
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { Card } from '../entities/Card';
import { CardDatabase } from '../data/CardDatabase';

export class DeckViewScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeckViewScene' });
  }

  init(data) {
    this.mode = data.mode || 'view'; // view, upgrade, remove, collection
    this.cost = data.cost || 0;
    this.onComplete = data.onComplete;
    this.returnScene = data.returnScene || 'MapScene';
  }

  create() {
    const { width, height } = this.cameras.main;
    
    this.playerData = this.registry.get('playerData');
    this.currentPage = 0;
    this.cardsPerPage = 8;
    
    // Create background
    this.createBackground(width, height);
    
    // Create header
    this.createHeader(width, height);
    
    // Create card grid
    this.createCardGrid(width, height);
    
    // Create pagination
    this.createPagination(width, height);
    
    // Create footer
    this.createFooter(width, height);
    
    // Display cards
    this.displayCards();
    
    // Entrance animation
    this.cameras.main.fadeIn(300);
  }

  createBackground(width, height) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1);
    bg.fillRect(0, 0, width, height);
  }

  createHeader(width, height) {
    // Header background
    this.add.rectangle(width / 2, 60, width, 120, 0x16213e, 0.95);
    
    // Title based on mode
    const titles = {
      view: 'YOUR DECK',
      upgrade: 'UPGRADE A CARD',
      remove: 'REMOVE A CARD',
      collection: 'COLLECTION'
    };
    
    this.add.text(width / 2, 30, titles[this.mode], {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Deck count
    const deckCount = this.playerData.deck.length;
    this.add.text(width / 2, 70, `${deckCount} cards`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    // Cost indicator for upgrade/remove
    if (this.mode === 'remove' && this.cost > 0) {
      this.add.text(width / 2, 100, `Cost: ${this.cost} gold`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffd700'
      }).setOrigin(0.5);
    }
  }

  createCardGrid(width, height) {
    this.cardContainer = this.add.container(0, 0);
    this.gridStartY = 170;
  }

  displayCards() {
    // Clear existing cards
    this.cardContainer.removeAll(true);
    
    const { width, height } = this.cameras.main;
    const deck = this.playerData.deck;
    const startIdx = this.currentPage * this.cardsPerPage;
    const endIdx = Math.min(startIdx + this.cardsPerPage, deck.length);
    
    const cardsPerRow = 4;
    const cardSpacingX = (width - 40) / cardsPerRow;
    const cardSpacingY = 220;
    
    for (let i = startIdx; i < endIdx; i++) {
      const cardData = deck[i];
      const localIdx = i - startIdx;
      const row = Math.floor(localIdx / cardsPerRow);
      const col = localIdx % cardsPerRow;
      
      const x = 40 + col * cardSpacingX + cardSpacingX / 2;
      const y = this.gridStartY + row * cardSpacingY + 100;
      
      this.createCardDisplay(x, y, cardData, i);
    }
  }

  createCardDisplay(x, y, cardData, deckIndex) {
    const card = new Card(this, x, y, cardData);
    card.setScale(0.75);
    card.deckIndex = deckIndex;
    
    this.cardContainer.add(card);
    
    // Make interactive based on mode
    if (this.mode !== 'view') {
      card.setInteractive({ useHandCursor: true });
      
      card.on('pointerover', () => {
        this.tweens.add({
          targets: card,
          scale: 0.9,
          duration: 150,
          ease: 'Back.easeOut'
        });
      });
      
      card.on('pointerout', () => {
        this.tweens.add({
          targets: card,
          scale: 0.75,
          duration: 150
        });
      });
      
      card.on('pointerup', () => {
        if (this.mode === 'upgrade') {
          this.upgradeCard(card, deckIndex);
        } else if (this.mode === 'remove') {
          this.removeCard(card, deckIndex);
        }
      });
    }
    
    // Entrance animation
    card.setAlpha(0);
    card.setScale(0);
    
    this.tweens.add({
      targets: card,
      alpha: 1,
      scale: 0.75,
      duration: 300,
      delay: (deckIndex % this.cardsPerPage) * 50,
      ease: 'Back.easeOut'
    });
  }

  upgradeCard(card, deckIndex) {
    const cardData = this.playerData.deck[deckIndex];
    
    // Check if already upgraded
    if (cardData.upgraded) {
      this.showMessage('Card already upgraded!', '#ff9800');
      return;
    }
    
    // Upgrade the card
    const upgradedCard = CardDatabase.getUpgradedCard(cardData);
    this.playerData.deck[deckIndex] = upgradedCard;
    this.registry.set('playerData', this.playerData);
    
    // Visual feedback
    this.tweens.add({
      targets: card,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Bounce.easeOut'
    });
    
    // Particles
    for (let i = 0; i < 12; i++) {
      const particle = this.add.star(card.x, card.y, 5, 3, 6, 0x4caf50);
      const angle = (i / 12) * Math.PI * 2;
      
      this.tweens.add({
        targets: particle,
        x: card.x + Math.cos(angle) * 80,
        y: card.y + Math.sin(angle) * 80,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
    
    this.showMessage('Card upgraded!', '#4caf50');
    
    // Return after delay
    this.time.delayedCall(1000, () => {
      if (this.onComplete) {
        this.onComplete();
      }
      this.scene.start(this.returnScene);
    });
  }

  removeCard(card, deckIndex) {
    // Check cost
    if (this.cost > 0 && this.playerData.gold < this.cost) {
      this.showMessage('Not enough gold!', '#f44336');
      return;
    }
    
    // Deduct cost
    if (this.cost > 0) {
      this.playerData.gold -= this.cost;
    }
    
    // Remove card from deck
    this.playerData.deck.splice(deckIndex, 1);
    this.registry.set('playerData', this.playerData);
    
    // Visual feedback
    this.tweens.add({
      targets: card,
      scale: 0,
      alpha: 0,
      angle: 180,
      duration: 400,
      ease: 'Back.easeIn',
      onComplete: () => {
        card.destroy();
      }
    });
    
    this.showMessage('Card removed!', '#f44336');
    
    // Return after delay
    this.time.delayedCall(1000, () => {
      if (this.onComplete) {
        this.onComplete();
      }
      this.scene.start(this.returnScene);
    });
  }

  createPagination(width, height) {
    const deck = this.playerData.deck;
    const totalPages = Math.ceil(deck.length / this.cardsPerPage);
    
    if (totalPages <= 1) return;
    
    const paginationY = height - 140;
    
    // Previous button
    if (this.currentPage > 0) {
      new Button(this, width / 2 - 80, paginationY, '◀', {
        width: 50,
        height: 40,
        fontSize: '20px',
        backgroundColor: 0x533483,
        onClick: () => this.prevPage()
      });
    }
    
    // Page indicator
    this.pageText = this.add.text(width / 2, paginationY, `${this.currentPage + 1} / ${totalPages}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Next button
    if (this.currentPage < totalPages - 1) {
      new Button(this, width / 2 + 80, paginationY, '▶', {
        width: 50,
        height: 40,
        fontSize: '20px',
        backgroundColor: 0x533483,
        onClick: () => this.nextPage()
      });
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.scene.restart({ mode: this.mode, cost: this.cost, onComplete: this.onComplete });
    }
  }

  nextPage() {
    const totalPages = Math.ceil(this.playerData.deck.length / this.cardsPerPage);
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
      this.scene.restart({ mode: this.mode, cost: this.cost, onComplete: this.onComplete });
    }
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

  goBack() {
    if (this.mode === 'collection') {
      this.scene.start('MainMenuScene');
    } else {
      this.scene.start(this.returnScene);
    }
  }

  showMessage(text, color) {
    const { width, height } = this.cameras.main;
    
    const msg = this.add.text(width / 2, height / 2, text, {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: color,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);
    
    this.tweens.add({
      targets: msg,
      y: msg.y - 50,
      alpha: 0,
      duration: 1500,
      ease: 'Cubic.easeOut',
      onComplete: () => msg.destroy()
    });
  }
}
