/**
 * Shop Scene - Purchase cards and items
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { Card } from '../entities/Card';
import { CardDatabase } from '../data/CardDatabase';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    this.playerData = this.registry.get('playerData');
    
    // Generate shop items
    this.generateShopItems();
    
    // Create background
    this.createBackground(width, height);
    
    // Create header
    this.createHeader(width);
    
    // Create shop display
    this.createShopDisplay(width, height);
    
    // Create footer
    this.createFooter(width, height);
    
    // Entrance animation
    this.cameras.main.fadeIn(500);
  }

  createBackground(width, height) {
    // Dark shop background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);
    
    // Decorative elements
    this.add.text(width / 2, 150, '🏪', {
      fontSize: '64px'
    }).setOrigin(0.5);
  }

  createHeader(width) {
    // Header background
    this.add.rectangle(width / 2, 50, width, 100, 0x1a1a2e, 0.95);
    
    // Title
    this.add.text(width / 2, 30, 'SHOP', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffd700'
    }).setOrigin(0.5);
    
    // Gold display
    this.add.image(width / 2 - 50, 70, 'icon_gold').setScale(0.8);
    this.goldText = this.add.text(width / 2 - 25, 70, `${this.playerData.gold}`, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffd700'
    }).setOrigin(0, 0.5);
  }

  generateShopItems() {
    this.shopItems = {
      cards: CardDatabase.getShopCards(),
      removeCard: { price: GameConfig.CARD_REMOVE_COST },
      healthPotion: { 
        name: 'Health Potion',
        description: 'Restore 25% HP',
        price: 30,
        healPercent: 0.25
      },
      maxHealthUp: {
        name: 'Max HP Up',
        description: '+10 Max Health',
        price: 75,
        value: 10
      },
      energyUp: {
        name: 'Energy Up',
        description: '+1 Max Energy',
        price: 100,
        value: 1
      }
    };
  }

  createShopDisplay(width, height) {
    const startY = 220;
    
    // Cards section title
    this.add.text(40, startY, 'CARDS', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff'
    });
    
    // Display cards for sale
    this.cardDisplays = [];
    const cardY = startY + 130;
    const cardSpacing = (width - 60) / 4;
    
    this.shopItems.cards.forEach((card, index) => {
      const x = 45 + cardSpacing * index + cardSpacing / 2;
      this.createCardDisplay(x, cardY, card, index);
    });
    
    // Services section
    const servicesY = cardY + 180;
    this.add.text(40, servicesY, 'SERVICES', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff'
    });
    
    // Remove card button
    new Button(this, width / 2, servicesY + 60, `Remove Card (${this.shopItems.removeCard.price}g)`, {
      width: 280,
      height: 50,
      fontSize: '16px',
      backgroundColor: 0xf44336,
      onClick: () => this.openRemoveCard()
    });
    
    // Items section
    const itemsY = servicesY + 130;
    this.add.text(40, itemsY, 'ITEMS', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff'
    });
    
    // Health potion
    const potion = this.shopItems.healthPotion;
    new Button(this, width / 4, itemsY + 60, `${potion.name}\n${potion.price}g`, {
      width: 150,
      height: 70,
      fontSize: '14px',
      backgroundColor: 0x4caf50,
      onClick: () => this.buyPotion()
    });
    
    // Max HP up
    const maxHp = this.shopItems.maxHealthUp;
    new Button(this, width / 2, itemsY + 60, `${maxHp.name}\n${maxHp.price}g`, {
      width: 150,
      height: 70,
      fontSize: '14px',
      backgroundColor: 0x9c27b0,
      onClick: () => this.buyMaxHealth()
    });
    
    // Energy up
    const energy = this.shopItems.energyUp;
    new Button(this, width * 3 / 4, itemsY + 60, `${energy.name}\n${energy.price}g`, {
      width: 150,
      height: 70,
      fontSize: '14px',
      backgroundColor: 0x00bcd4,
      onClick: () => this.buyEnergy()
    });
  }

  createCardDisplay(x, y, cardData, index) {
    const card = new Card(this, x, y, cardData);
    card.setScale(0.7);
    
    // Price tag
    const priceTag = this.add.container(x, y + 100);
    
    const priceBg = this.add.rectangle(0, 0, 80, 30, 0x1a1a2e, 0.9);
    priceBg.setStrokeStyle(2, 0xffd700);
    priceTag.add(priceBg);
    
    const priceIcon = this.add.image(-25, 0, 'icon_gold').setScale(0.5);
    priceTag.add(priceIcon);
    
    const priceText = this.add.text(5, 0, `${cardData.price}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffd700'
    }).setOrigin(0, 0.5);
    priceTag.add(priceText);
    
    // Make card interactive
    card.setInteractive({ useHandCursor: true });
    
    card.on('pointerup', () => {
      this.buyCard(cardData, index, card, priceTag);
    });
    
    card.on('pointerover', () => {
      this.tweens.add({
        targets: card,
        scale: 0.85,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    card.on('pointerout', () => {
      this.tweens.add({
        targets: card,
        scale: 0.7,
        duration: 150
      });
    });
    
    this.cardDisplays.push({ card, priceTag, data: cardData });
  }

  buyCard(cardData, index, cardSprite, priceTag) {
    if (this.playerData.gold < cardData.price) {
      this.showMessage('Not enough gold!', '#f44336');
      return;
    }
    
    // Deduct gold
    this.playerData.gold -= cardData.price;
    this.goldText.setText(`${this.playerData.gold}`);
    
    // Add card to deck
    this.playerData.deck.push({ ...cardData });
    this.registry.set('playerData', this.playerData);
    
    // Remove from display
    this.tweens.add({
      targets: [cardSprite, priceTag],
      alpha: 0,
      scale: 0,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => {
        cardSprite.destroy();
        priceTag.destroy();
      }
    });
    
    // Mark as sold
    this.shopItems.cards[index] = null;
    
    this.showMessage('Card added to deck!', '#4caf50');
  }

  buyPotion() {
    const potion = this.shopItems.healthPotion;
    
    if (this.playerData.gold < potion.price) {
      this.showMessage('Not enough gold!', '#f44336');
      return;
    }
    
    // Deduct gold
    this.playerData.gold -= potion.price;
    this.goldText.setText(`${this.playerData.gold}`);
    
    // Heal player
    const healAmount = Math.floor(this.playerData.maxHealth * potion.healPercent);
    this.playerData.health = Math.min(
      this.playerData.health + healAmount,
      this.playerData.maxHealth
    );
    
    this.registry.set('playerData', this.playerData);
    this.showMessage(`Healed ${healAmount} HP!`, '#4caf50');
  }

  buyMaxHealth() {
    const item = this.shopItems.maxHealthUp;
    
    if (this.playerData.gold < item.price) {
      this.showMessage('Not enough gold!', '#f44336');
      return;
    }
    
    this.playerData.gold -= item.price;
    this.goldText.setText(`${this.playerData.gold}`);
    
    this.playerData.maxHealth += item.value;
    this.playerData.health += item.value;
    
    this.registry.set('playerData', this.playerData);
    this.showMessage(`Max HP increased by ${item.value}!`, '#9c27b0');
  }

  buyEnergy() {
    const item = this.shopItems.energyUp;
    
    if (this.playerData.gold < item.price) {
      this.showMessage('Not enough gold!', '#f44336');
      return;
    }
    
    this.playerData.gold -= item.price;
    this.goldText.setText(`${this.playerData.gold}`);
    
    this.playerData.maxEnergy += item.value;
    this.playerData.energy += item.value;
    
    this.registry.set('playerData', this.playerData);
    this.showMessage(`Max Energy increased by ${item.value}!`, '#00bcd4');
  }

  openRemoveCard() {
    if (this.playerData.gold < this.shopItems.removeCard.price) {
      this.showMessage('Not enough gold!', '#f44336');
      return;
    }
    
    this.scene.start('DeckViewScene', { 
      mode: 'remove',
      cost: this.shopItems.removeCard.price,
      onComplete: () => {
        this.scene.start('ShopScene');
      }
    });
  }

  showMessage(text, color) {
    const { width, height } = this.cameras.main;
    
    const msg = this.add.text(width / 2, height / 2, text, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(100);
    
    this.tweens.add({
      targets: msg,
      y: msg.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => msg.destroy()
    });
  }

  createFooter(width, height) {
    // Footer background
    this.add.rectangle(width / 2, height - 50, width, 100, 0x1a1a2e, 0.95);
    
    // Leave button
    new Button(this, width / 2, height - 50, 'Leave Shop', {
      width: 200,
      height: 50,
      fontSize: '18px',
      backgroundColor: 0x533483,
      onClick: () => this.leaveShop()
    });
  }

  leaveShop() {
    // Complete node and return to map
    const selectedNode = this.registry.get('selectedNode');
    if (selectedNode) {
      selectedNode.completed = true;
      
      const mapData = this.registry.get('currentMap');
      const nextFloor = mapData.floors[selectedNode.floor + 1];
      if (nextFloor) {
        selectedNode.connections.forEach(connIdx => {
          if (nextFloor[connIdx]) {
            nextFloor[connIdx].accessible = true;
          }
        });
      }
      
      this.playerData.currentFloor = selectedNode.floor + 2;
      this.registry.set('currentMap', mapData);
    }
    
    this.registry.set('playerData', this.playerData);
    this.scene.start('MapScene');
  }
}
