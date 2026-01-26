/**
 * Rest Scene - Heal and upgrade cards at campfire
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Button } from '../ui/Button';

export class RestScene extends Phaser.Scene {
  constructor() {
    super('RestScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Night sky background
    this.add.rectangle(0, 0, width, height, 0x0a0a1a)
      .setOrigin(0);
    
    // Stars
    for (let i = 0; i < 100; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height / 2),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1)
      );
      
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.2, 0.5),
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }
    
    // Ground
    const ground = this.add.rectangle(0, height - 100, width, 200, 0x1a1a1a);
    ground.setOrigin(0, 0);
    
    // Campfire
    this.createCampfire(width / 2, height - 200);
    
    // Title
    const title = this.add.text(width / 2, 150, 'Rest', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);
    title.setAlpha(0);
    
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: 120,
      duration: 500
    });
    
    // Current HP display
    const hp = this.registry.get('playerHp') || 100;
    const maxHp = this.registry.get('maxHp') || 100;
    const healAmount = Math.floor(maxHp * 0.3);
    const newHp = Math.min(hp + healAmount, maxHp);
    
    const hpText = this.add.text(width / 2, 200, `❤️ ${hp} / ${maxHp}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ff6b6b'
    }).setOrigin(0.5);
    hpText.setAlpha(0);
    
    this.tweens.add({
      targets: hpText,
      alpha: 1,
      duration: 500,
      delay: 200
    });
    
    // Options container
    const optionsY = height / 2 - 50;
    
    // Rest option
    const restOption = this.createOption(
      width / 2 - 170, optionsY,
      '💤',
      'Rest',
      `Heal ${healAmount} HP (30%)`,
      hp < maxHp,
      () => this.doRest(healAmount)
    );
    
    // Smith option (upgrade)
    const deck = this.registry.get('deck') || [];
    const canUpgrade = deck.length > 0;
    
    const smithOption = this.createOption(
      width / 2 + 170, optionsY,
      '⚒️',
      'Smith',
      'Upgrade a card',
      canUpgrade,
      () => this.doSmith()
    );
    
    // Flavor text
    const flavor = this.add.text(width / 2, height - 300, 'The warm fire crackles softly...', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#636e72',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    flavor.setAlpha(0);
    
    this.tweens.add({
      targets: flavor,
      alpha: 0.7,
      duration: 1000,
      delay: 800
    });
  }

  createCampfire(x, y) {
    // Fire pit (rocks)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rock = this.add.ellipse(
        x + Math.cos(angle) * 40,
        y + Math.sin(angle) * 15 + 20,
        25, 15,
        0x3d3d3d
      );
    }
    
    // Logs
    const log1 = this.add.rectangle(x - 20, y + 15, 60, 12, 0x4a3728);
    log1.setRotation(-0.3);
    const log2 = this.add.rectangle(x + 20, y + 15, 60, 12, 0x4a3728);
    log2.setRotation(0.3);
    
    // Fire layers
    this.fireParticles = [];
    const fireColors = [0xff4500, 0xff6600, 0xff8c00, 0xffd700];
    
    for (let i = 0; i < 20; i++) {
      const color = Phaser.Utils.Array.GetRandom(fireColors);
      const particle = this.add.circle(
        x + Phaser.Math.Between(-20, 20),
        y,
        Phaser.Math.Between(5, 15),
        color,
        0.8
      );
      this.fireParticles.push(particle);
      
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(40, 80),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(500, 1000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 500),
        onRepeat: () => {
          particle.x = x + Phaser.Math.Between(-20, 20);
          particle.y = y;
          particle.setScale(1);
        }
      });
    }
    
    // Glow
    const glow = this.add.circle(x, y - 20, 80, 0xff6600, 0.2);
    this.tweens.add({
      targets: glow,
      alpha: 0.3,
      scale: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // Ground light
    const groundLight = this.add.ellipse(x, y + 50, 200, 50, 0xff6600, 0.15);
    this.tweens.add({
      targets: groundLight,
      alpha: 0.2,
      scaleX: 1.1,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  createOption(x, y, icon, title, description, enabled, callback) {
    const container = this.add.container(x, y);
    container.setAlpha(0);
    container.setScale(0.8);
    
    // Background
    const bgColor = enabled ? 0x2d3436 : 0x1a1a1a;
    const borderColor = enabled ? GAME_CONFIG.COLORS.PRIMARY : 0x636e72;
    
    const bg = this.add.rectangle(0, 0, 280, 200, bgColor);
    bg.setStrokeStyle(3, borderColor);
    container.add(bg);
    
    // Icon
    const iconText = this.add.text(0, -50, icon, {
      fontSize: '48px'
    }).setOrigin(0.5);
    container.add(iconText);
    
    // Title
    const titleText = this.add.text(0, 10, title, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: enabled ? '#ffffff' : '#636e72'
    }).setOrigin(0.5);
    container.add(titleText);
    
    // Description
    const descText = this.add.text(0, 50, description, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: enabled ? '#b2bec3' : '#4a4a4a',
      align: 'center',
      wordWrap: { width: 240 }
    }).setOrigin(0.5);
    container.add(descText);
    
    // Interactive
    if (enabled) {
      bg.setInteractive({ useHandCursor: true });
      
      bg.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 150
        });
        bg.setFillStyle(0x3d4c53);
      });
      
      bg.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 150
        });
        bg.setFillStyle(0x2d3436);
      });
      
      bg.on('pointerdown', () => {
        bg.disableInteractive();
        callback();
      });
    }
    
    // Animate in
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 400,
      delay: 400,
      ease: 'Back.easeOut'
    });
    
    return container;
  }

  doRest(healAmount) {
    const { width, height } = this.cameras.main;
    
    // Heal player
    const hp = this.registry.get('playerHp') || 100;
    const maxHp = this.registry.get('maxHp') || 100;
    const newHp = Math.min(hp + healAmount, maxHp);
    this.registry.set('playerHp', newHp);
    
    // Sleep animation
    const sleepOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0)
      .setOrigin(0);
    
    // Z's floating up
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 400, () => {
        const z = this.add.text(width / 2, height / 2, 'Z', {
          fontFamily: 'Arial Black',
          fontSize: '32px',
          color: '#ffffff'
        }).setOrigin(0.5);
        
        this.tweens.add({
          targets: z,
          x: width / 2 + Phaser.Math.Between(-50, 50),
          y: height / 2 - 150,
          alpha: 0,
          scale: 1.5,
          duration: 1500,
          onComplete: () => z.destroy()
        });
      });
    }
    
    this.tweens.add({
      targets: sleepOverlay,
      alpha: 0.8,
      duration: 800,
      yoyo: true,
      hold: 1500,
      onComplete: () => {
        this.showResult(`Healed ${healAmount} HP!\n❤️ ${hp} → ${newHp}`);
      }
    });
  }

  doSmith() {
    // Would show card selection for upgrade
    // For now, just upgrade a random card
    const deck = this.registry.get('deck') || [];
    if (deck.length > 0) {
      const randomIndex = Phaser.Math.Between(0, deck.length - 1);
      const cardToUpgrade = deck[randomIndex];
      
      // Mark as upgraded
      cardToUpgrade.upgraded = true;
      if (cardToUpgrade.damage) cardToUpgrade.damage = Math.floor(cardToUpgrade.damage * 1.25);
      if (cardToUpgrade.cooldown) cardToUpgrade.cooldown *= 0.9;
      
      deck[randomIndex] = cardToUpgrade;
      this.registry.set('deck', deck);
      
      this.showResult(`Upgraded: ${cardToUpgrade.name}+`);
    }
  }

  showResult(text) {
    const { width, height } = this.cameras.main;
    
    // Result popup
    const popup = this.add.container(width / 2, height / 2);
    popup.setAlpha(0);
    popup.setScale(0.5);
    
    const bg = this.add.rectangle(0, 0, 300, 150, 0x2d3436);
    bg.setStrokeStyle(3, GAME_CONFIG.COLORS.SUCCESS);
    popup.add(bg);
    
    const resultText = this.add.text(0, -20, text, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#00b894',
      align: 'center'
    }).setOrigin(0.5);
    popup.add(resultText);
    
    const continueText = this.add.text(0, 40, 'Tap to continue', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#636e72'
    }).setOrigin(0.5);
    popup.add(continueText);
    
    this.tweens.add({
      targets: continueText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    this.tweens.add({
      targets: popup,
      alpha: 1,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
    
    // Click to continue
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => {
      this.tweens.add({
        targets: popup,
        alpha: 0,
        scale: 0.8,
        duration: 300,
        onComplete: () => {
          this.scene.start('MapScene');
        }
      });
    });
  }
}
