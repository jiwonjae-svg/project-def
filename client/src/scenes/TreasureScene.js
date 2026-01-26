/**
 * Treasure Scene - Free rewards from treasure nodes
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { CARD_DATABASE, getCardsByRarity } from '../data/CardDatabase';

export class TreasureScene extends Phaser.Scene {
  constructor() {
    super('TreasureScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Dark background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e)
      .setOrigin(0);
    
    // Light rays from above
    this.createLightRays(width, height);
    
    // Treasure chest
    this.createChest(width / 2, height / 2 - 50);
    
    // Title
    const title = this.add.text(width / 2, 100, 'Treasure!', {
      fontFamily: 'Arial Black',
      fontSize: '42px',
      color: '#fdcb6e'
    }).setOrigin(0.5);
    title.setAlpha(0);
    
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: 80,
      duration: 500
    });
    
    // Subtitle
    const subtitle = this.add.text(width / 2, 130, 'You found a treasure chest!', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#b2bec3'
    }).setOrigin(0.5);
    subtitle.setAlpha(0);
    
    this.tweens.add({
      targets: subtitle,
      alpha: 0.8,
      duration: 500,
      delay: 200
    });
    
    // Open button
    this.openButton = new Button(
      this, width / 2, height / 2 + 180,
      'Open Chest',
      () => this.openChest(),
      {
        width: 250,
        height: 60,
        color: GAME_CONFIG.COLORS.GOLD,
        textColor: '#2d3436'
      }
    );
    this.openButton.setAlpha(0);
    this.openButton.setScale(0.8);
    
    this.tweens.add({
      targets: this.openButton,
      alpha: 1,
      scale: 1,
      duration: 500,
      delay: 600,
      ease: 'Back.easeOut'
    });
  }

  createLightRays(width, height) {
    const rayColors = [0xfdcb6e, 0xffeaa7];
    
    for (let i = 0; i < 8; i++) {
      const startX = width / 2 + Phaser.Math.Between(-100, 100);
      const endX = startX + Phaser.Math.Between(-200, 200);
      
      const ray = this.add.graphics();
      ray.fillStyle(Phaser.Utils.Array.GetRandom(rayColors), 0.1);
      ray.beginPath();
      ray.moveTo(startX - 20, 0);
      ray.lineTo(startX + 20, 0);
      ray.lineTo(endX + 50, height);
      ray.lineTo(endX - 50, height);
      ray.closePath();
      ray.fill();
      
      this.tweens.add({
        targets: ray,
        alpha: 0.05,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1
      });
    }
  }

  createChest(x, y) {
    this.chestContainer = this.add.container(x, y);
    this.chestContainer.setScale(0.8);
    this.chestContainer.setAlpha(0);
    
    // Chest body
    this.chestBody = this.add.rectangle(0, 30, 150, 80, 0x8b4513);
    this.chestBody.setStrokeStyle(4, 0x5d3a1a);
    this.chestContainer.add(this.chestBody);
    
    // Metal bands
    const band1 = this.add.rectangle(-50, 30, 8, 80, 0xdaa520);
    const band2 = this.add.rectangle(50, 30, 8, 80, 0xdaa520);
    const band3 = this.add.rectangle(0, 30, 150, 8, 0xdaa520);
    this.chestContainer.add([band1, band2, band3]);
    
    // Chest lid (closed)
    this.chestLid = this.add.container(0, -10);
    
    const lidTop = this.add.ellipse(0, 0, 160, 60, 0x8b4513);
    lidTop.setStrokeStyle(4, 0x5d3a1a);
    this.chestLid.add(lidTop);
    
    const lidBand = this.add.ellipse(0, 0, 160, 60, 0xdaa520, 0);
    lidBand.setStrokeStyle(6, 0xdaa520);
    this.chestLid.add(lidBand);
    
    // Lock
    this.lock = this.add.circle(0, 20, 15, 0xffd700);
    this.lock.setStrokeStyle(2, 0xb8860b);
    this.chestLid.add(this.lock);
    
    this.chestContainer.add(this.chestLid);
    
    // Glow effect
    const glow = this.add.ellipse(0, 50, 200, 60, 0xffd700, 0.3);
    this.chestContainer.add(glow);
    this.chestContainer.sendToBack(glow);
    
    this.tweens.add({
      targets: glow,
      alpha: 0.1,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Floating sparkles
    for (let i = 0; i < 10; i++) {
      const sparkle = this.add.star(
        Phaser.Math.Between(-80, 80),
        Phaser.Math.Between(-60, 60),
        4, 2, 4,
        0xffd700
      );
      this.chestContainer.add(sparkle);
      
      this.tweens.add({
        targets: sparkle,
        y: sparkle.y - 30,
        alpha: 0,
        duration: Phaser.Math.Between(1000, 2000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000)
      });
    }
    
    this.tweens.add({
      targets: this.chestContainer,
      alpha: 1,
      scale: 1,
      duration: 600,
      delay: 200,
      ease: 'Back.easeOut'
    });
    
    // Subtle bounce
    this.tweens.add({
      targets: this.chestContainer,
      y: y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  openChest() {
    // Disable button
    this.openButton.disableInteractive();
    
    // Stop bounce
    this.tweens.killTweensOf(this.chestContainer);
    
    // Shake before opening
    this.tweens.add({
      targets: this.chestContainer,
      x: this.chestContainer.x - 5,
      duration: 50,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.revealTreasure();
      }
    });
  }

  revealTreasure() {
    const { width, height } = this.cameras.main;
    
    // Open lid animation
    this.tweens.add({
      targets: this.chestLid,
      y: -60,
      rotation: -0.5,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // Hide lock
    this.tweens.add({
      targets: this.lock,
      alpha: 0,
      duration: 200
    });
    
    // Light burst
    const burst = this.add.circle(
      this.chestContainer.x,
      this.chestContainer.y - 20,
      20, 0xffd700, 0.8
    );
    
    this.tweens.add({
      targets: burst,
      radius: 200,
      alpha: 0,
      duration: 500,
      onComplete: () => burst.destroy()
    });
    
    // Particle explosion
    for (let i = 0; i < 30; i++) {
      const coin = this.add.circle(
        this.chestContainer.x,
        this.chestContainer.y,
        Phaser.Math.Between(4, 8),
        0xffd700
      );
      
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(100, 200);
      
      this.tweens.add({
        targets: coin,
        x: coin.x + Math.cos(angle) * distance,
        y: coin.y + Math.sin(angle) * distance - 50,
        alpha: 0,
        duration: Phaser.Math.Between(500, 1000),
        ease: 'Cubic.easeOut',
        onComplete: () => coin.destroy()
      });
    }
    
    // Generate rewards
    this.time.delayedCall(300, () => {
      this.showRewards();
    });
  }

  showRewards() {
    const { width, height } = this.cameras.main;
    
    // Generate rewards
    const goldReward = Phaser.Math.Between(50, 150);
    const rewards = [{ type: 'gold', amount: goldReward }];
    
    // Chance for extra rewards
    if (Math.random() < 0.5) {
      // Random card
      const rarities = ['uncommon', 'rare'];
      const rarity = Phaser.Utils.Array.GetRandom(rarities);
      const cards = getCardsByRarity(rarity);
      if (cards.length > 0) {
        rewards.push({
          type: 'card',
          card: Phaser.Utils.Array.GetRandom(cards)
        });
      }
    }
    
    if (Math.random() < 0.3) {
      // Max HP increase
      rewards.push({ type: 'maxHp', amount: 10 });
    }
    
    // Apply rewards
    const gold = this.registry.get('gold') || 0;
    this.registry.set('gold', gold + goldReward);
    
    rewards.forEach(reward => {
      if (reward.type === 'card') {
        const deck = this.registry.get('deck') || [];
        deck.push({ ...reward.card });
        this.registry.set('deck', deck);
      }
      if (reward.type === 'maxHp') {
        const maxHp = this.registry.get('maxHp') || 100;
        this.registry.set('maxHp', maxHp + reward.amount);
      }
    });
    
    // Display rewards
    const rewardsContainer = this.add.container(width / 2, height / 2 + 180);
    rewardsContainer.setAlpha(0);
    
    const rewardsBg = this.add.rectangle(0, 0, 400, 150, 0x2d3436, 0.9);
    rewardsBg.setStrokeStyle(2, GAME_CONFIG.COLORS.GOLD);
    rewardsContainer.add(rewardsBg);
    
    const rewardsTitle = this.add.text(0, -50, '✨ Rewards ✨', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#fdcb6e'
    }).setOrigin(0.5);
    rewardsContainer.add(rewardsTitle);
    
    let rewardX = -(rewards.length - 1) * 60;
    rewards.forEach((reward, index) => {
      let text = '';
      let color = '#ffffff';
      
      if (reward.type === 'gold') {
        text = `💰 +${reward.amount}`;
        color = '#fdcb6e';
      } else if (reward.type === 'card') {
        text = `🃏 ${reward.card.name}`;
        color = GAME_CONFIG.RARITY_COLORS[reward.card.rarity];
      } else if (reward.type === 'maxHp') {
        text = `❤️ +${reward.amount} Max HP`;
        color = '#ff6b6b';
      }
      
      const rewardText = this.add.text(0, -10 + index * 25, text, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: color
      }).setOrigin(0.5);
      rewardsContainer.add(rewardText);
    });
    
    this.tweens.add({
      targets: rewardsContainer,
      alpha: 1,
      y: height / 2 + 150,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // Hide open button and show continue
    this.tweens.add({
      targets: this.openButton,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.openButton.destroy();
        
        const continueBtn = new Button(
          this, width / 2, height - 100,
          'Continue',
          () => this.exitScene(),
          {
            width: 200,
            height: 50,
            color: GAME_CONFIG.COLORS.PRIMARY
          }
        );
        continueBtn.setAlpha(0);
        
        this.tweens.add({
          targets: continueBtn,
          alpha: 1,
          duration: 300
        });
      }
    });
  }

  exitScene() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('MapScene');
    });
  }
}
