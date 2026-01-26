/**
 * Event Scene - Random event encounters with choices
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Button } from '../ui/Button';

// Event definitions
const EVENTS = [
  {
    id: 'mysterious_merchant',
    title: 'Mysterious Merchant',
    description: 'A hooded figure approaches with rare wares...',
    icon: '🧙',
    choices: [
      {
        text: 'Trade 30 gold for a random card',
        cost: { gold: 30 },
        reward: { randomCard: true }
      },
      {
        text: 'Trade 20 HP for 50 gold',
        cost: { hp: 20 },
        reward: { gold: 50 }
      },
      {
        text: 'Leave quietly',
        cost: null,
        reward: null
      }
    ]
  },
  {
    id: 'ancient_shrine',
    title: 'Ancient Shrine',
    description: 'A glowing shrine pulses with mysterious energy.',
    icon: '⛩️',
    choices: [
      {
        text: 'Pray for power (+1 max energy)',
        cost: { gold: 50 },
        reward: { maxEnergy: 1 }
      },
      {
        text: 'Pray for health (+20 max HP)',
        cost: { gold: 40 },
        reward: { maxHp: 20 }
      },
      {
        text: 'Desecrate (-10 HP, +100 gold)',
        cost: { hp: 10 },
        reward: { gold: 100 }
      }
    ]
  },
  {
    id: 'gambling_goblin',
    title: 'Gambling Goblin',
    description: 'A goblin offers you a game of chance...',
    icon: '🎰',
    choices: [
      {
        text: 'Gamble 30 gold (50% for 80 gold)',
        cost: { gold: 30 },
        reward: { gamble: { chance: 0.5, gold: 80 } }
      },
      {
        text: 'All or nothing (30% for 200 gold)',
        cost: { gold: 50 },
        reward: { gamble: { chance: 0.3, gold: 200 } }
      },
      {
        text: 'Walk away',
        cost: null,
        reward: null
      }
    ]
  },
  {
    id: 'wounded_knight',
    title: 'Wounded Knight',
    description: 'A knight lies wounded on the road...',
    icon: '⚔️',
    choices: [
      {
        text: 'Heal them (-15 HP, receive a card)',
        cost: { hp: 15 },
        reward: { randomCard: true }
      },
      {
        text: 'Give gold (30 gold, +10 max HP)',
        cost: { gold: 30 },
        reward: { maxHp: 10 }
      },
      {
        text: 'Rob them (+40 gold, curse)',
        cost: { curse: true },
        reward: { gold: 40 }
      }
    ]
  },
  {
    id: 'card_forge',
    title: 'Card Forge',
    description: 'An ancient forge that can enhance your cards.',
    icon: '🔥',
    choices: [
      {
        text: 'Upgrade a random card (40 gold)',
        cost: { gold: 40 },
        reward: { upgradeCard: true }
      },
      {
        text: 'Remove a random card (free)',
        cost: null,
        reward: { removeCard: true }
      },
      {
        text: 'Duplicate a random card (60 gold)',
        cost: { gold: 60 },
        reward: { duplicateCard: true }
      }
    ]
  },
  {
    id: 'treasure_guardian',
    title: 'Treasure Guardian',
    description: 'A stone golem guards a treasure chest.',
    icon: '🗿',
    choices: [
      {
        text: 'Fight! (-30 HP, +150 gold)',
        cost: { hp: 30 },
        reward: { gold: 150 }
      },
      {
        text: 'Sneak past (50% chance, +100 gold)',
        cost: null,
        reward: { sneak: { chance: 0.5, gold: 100, failHp: 20 } }
      },
      {
        text: 'Leave it alone',
        cost: null,
        reward: null
      }
    ]
  }
];

export class EventScene extends Phaser.Scene {
  constructor() {
    super('EventScene');
  }

  init(data) {
    this.currentEvent = null;
    this.choiceButtons = [];
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e)
      .setOrigin(0)
      .setScrollFactor(0);
    
    // Vignette effect
    this.createVignette(width, height);
    
    // Select random event
    this.currentEvent = Phaser.Utils.Array.GetRandom(EVENTS);
    
    // Event container
    this.eventContainer = this.add.container(width / 2, height / 2);
    this.eventContainer.setAlpha(0);
    this.eventContainer.setScale(0.8);
    
    // Event card background
    const cardBg = this.add.rectangle(0, 0, 600, 800, 0x2d3436, 0.95);
    cardBg.setStrokeStyle(3, GAME_CONFIG.COLORS.PRIMARY);
    this.eventContainer.add(cardBg);
    
    // Event icon
    const iconBg = this.add.circle(0, -280, 60, GAME_CONFIG.COLORS.PRIMARY);
    this.eventContainer.add(iconBg);
    
    const icon = this.add.text(0, -280, this.currentEvent.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);
    this.eventContainer.add(icon);
    
    // Event title
    const title = this.add.text(0, -180, this.currentEvent.title, {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.eventContainer.add(title);
    
    // Event description
    const description = this.add.text(0, -110, this.currentEvent.description, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#b2bec3',
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5);
    this.eventContainer.add(description);
    
    // Divider
    const divider = this.add.rectangle(0, -60, 500, 2, 0x636e72);
    this.eventContainer.add(divider);
    
    // Choice buttons
    this.createChoices();
    
    // Current resources display
    this.createResourceDisplay(width);
    
    // Animate in
    this.tweens.add({
      targets: this.eventContainer,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // Floating particles
    this.createParticles(width, height);
  }

  createVignette(width, height) {
    const graphics = this.add.graphics();
    
    // Create gradient vignette
    for (let i = 0; i < 20; i++) {
      const alpha = (1 - i / 20) * 0.4;
      graphics.fillStyle(0x000000, alpha);
      graphics.fillRect(
        i * 20, i * 20,
        width - i * 40, height - i * 40
      );
    }
  }

  createChoices() {
    const startY = -10;
    const spacing = 90;
    
    this.currentEvent.choices.forEach((choice, index) => {
      const choiceContainer = this.add.container(0, startY + index * spacing);
      
      // Button background
      const canAfford = this.canAffordChoice(choice);
      const bgColor = canAfford ? 0x2d3436 : 0x1a1a2e;
      const borderColor = canAfford ? GAME_CONFIG.COLORS.SECONDARY : 0x636e72;
      
      const bg = this.add.rectangle(0, 0, 520, 75, bgColor);
      bg.setStrokeStyle(2, borderColor);
      choiceContainer.add(bg);
      
      // Choice text
      const textColor = canAfford ? '#ffffff' : '#636e72';
      const text = this.add.text(-240, -15, choice.text, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: textColor,
        wordWrap: { width: 480 }
      });
      choiceContainer.add(text);
      
      // Cost display
      if (choice.cost) {
        let costStr = '';
        if (choice.cost.gold) costStr += `💰 -${choice.cost.gold} `;
        if (choice.cost.hp) costStr += `❤️ -${choice.cost.hp} `;
        if (choice.cost.curse) costStr += '☠️ Cursed';
        
        const costText = this.add.text(-240, 15, costStr, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#ff6b6b'
        });
        choiceContainer.add(costText);
      }
      
      // Reward display
      if (choice.reward) {
        let rewardStr = this.getRewardText(choice.reward);
        const rewardText = this.add.text(240, 0, rewardStr, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#00b894',
          align: 'right'
        }).setOrigin(1, 0.5);
        choiceContainer.add(rewardText);
      }
      
      // Interactive
      if (canAfford) {
        bg.setInteractive({ useHandCursor: true });
        
        bg.on('pointerover', () => {
          this.tweens.add({
            targets: choiceContainer,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 100
          });
          bg.setFillStyle(0x3d4c53);
        });
        
        bg.on('pointerout', () => {
          this.tweens.add({
            targets: choiceContainer,
            scaleX: 1,
            scaleY: 1,
            duration: 100
          });
          bg.setFillStyle(0x2d3436);
        });
        
        bg.on('pointerdown', () => {
          this.selectChoice(choice);
        });
      }
      
      this.eventContainer.add(choiceContainer);
      this.choiceButtons.push(choiceContainer);
    });
  }

  getRewardText(reward) {
    const parts = [];
    if (reward.gold) parts.push(`💰 +${reward.gold}`);
    if (reward.randomCard) parts.push('🃏 Card');
    if (reward.maxHp) parts.push(`❤️ +${reward.maxHp} Max`);
    if (reward.maxEnergy) parts.push(`⚡ +${reward.maxEnergy} Max`);
    if (reward.upgradeCard) parts.push('⬆️ Upgrade');
    if (reward.removeCard) parts.push('🗑️ Remove');
    if (reward.duplicateCard) parts.push('📋 Copy');
    if (reward.gamble) parts.push(`🎰 ${Math.round(reward.gamble.chance * 100)}%`);
    if (reward.sneak) parts.push(`🤫 ${Math.round(reward.sneak.chance * 100)}%`);
    return parts.join(' ');
  }

  canAffordChoice(choice) {
    if (!choice.cost) return true;
    
    const gold = this.registry.get('gold') || 100;
    const hp = this.registry.get('playerHp') || 100;
    
    if (choice.cost.gold && gold < choice.cost.gold) return false;
    if (choice.cost.hp && hp <= choice.cost.hp) return false;
    
    return true;
  }

  selectChoice(choice) {
    // Disable all buttons
    this.choiceButtons.forEach(btn => {
      btn.getAll().forEach(obj => {
        if (obj.input) obj.disableInteractive();
      });
    });
    
    // Apply costs
    if (choice.cost) {
      if (choice.cost.gold) {
        const gold = this.registry.get('gold') || 0;
        this.registry.set('gold', gold - choice.cost.gold);
      }
      if (choice.cost.hp) {
        const hp = this.registry.get('playerHp') || 100;
        this.registry.set('playerHp', hp - choice.cost.hp);
      }
    }
    
    // Process rewards
    if (choice.reward) {
      this.processReward(choice.reward);
    } else {
      this.showResult('You leave without incident.', true);
    }
  }

  processReward(reward) {
    let resultText = '';
    let success = true;
    
    if (reward.gold) {
      const gold = this.registry.get('gold') || 0;
      this.registry.set('gold', gold + reward.gold);
      resultText = `You gained ${reward.gold} gold!`;
    }
    
    if (reward.maxHp) {
      const maxHp = this.registry.get('maxHp') || 100;
      this.registry.set('maxHp', maxHp + reward.maxHp);
      resultText = `Your max HP increased by ${reward.maxHp}!`;
    }
    
    if (reward.maxEnergy) {
      const maxEnergy = this.registry.get('maxEnergy') || 3;
      this.registry.set('maxEnergy', maxEnergy + reward.maxEnergy);
      resultText = `Your max energy increased by ${reward.maxEnergy}!`;
    }
    
    if (reward.randomCard) {
      resultText = 'You received a new card!';
      // Would trigger card reward scene
    }
    
    if (reward.upgradeCard) {
      resultText = 'One of your cards was upgraded!';
    }
    
    if (reward.removeCard) {
      resultText = 'A card was removed from your deck.';
    }
    
    if (reward.duplicateCard) {
      resultText = 'A card was duplicated!';
    }
    
    if (reward.gamble) {
      const won = Math.random() < reward.gamble.chance;
      if (won) {
        const gold = this.registry.get('gold') || 0;
        this.registry.set('gold', gold + reward.gamble.gold);
        resultText = `🎉 You won ${reward.gamble.gold} gold!`;
      } else {
        resultText = '😢 You lost the gamble...';
        success = false;
      }
    }
    
    if (reward.sneak) {
      const succeeded = Math.random() < reward.sneak.chance;
      if (succeeded) {
        const gold = this.registry.get('gold') || 0;
        this.registry.set('gold', gold + reward.sneak.gold);
        resultText = `🤫 You snuck past and grabbed ${reward.sneak.gold} gold!`;
      } else {
        const hp = this.registry.get('playerHp') || 100;
        this.registry.set('playerHp', hp - reward.sneak.failHp);
        resultText = `💥 You were caught! Lost ${reward.sneak.failHp} HP.`;
        success = false;
      }
    }
    
    this.showResult(resultText, success);
  }

  showResult(text, success) {
    // Animate out choices
    this.tweens.add({
      targets: this.choiceButtons,
      alpha: 0,
      y: '+=50',
      duration: 300,
      stagger: 50
    });
    
    // Result text
    this.time.delayedCall(400, () => {
      const resultText = this.add.text(0, 50, text, {
        fontFamily: 'Arial Black',
        fontSize: '24px',
        color: success ? '#00b894' : '#ff6b6b',
        align: 'center',
        wordWrap: { width: 500 }
      }).setOrigin(0.5);
      resultText.setAlpha(0);
      this.eventContainer.add(resultText);
      
      this.tweens.add({
        targets: resultText,
        alpha: 1,
        duration: 300
      });
      
      // Continue button
      const continueBtn = new Button(
        this, 0, 200, 'Continue', () => {
          this.exitEvent();
        }, {
          width: 200,
          height: 50,
          color: GAME_CONFIG.COLORS.PRIMARY
        }
      );
      continueBtn.setAlpha(0);
      this.eventContainer.add(continueBtn);
      
      this.tweens.add({
        targets: continueBtn,
        alpha: 1,
        duration: 300,
        delay: 200
      });
    });
  }

  exitEvent() {
    // Animate out
    this.tweens.add({
      targets: this.eventContainer,
      alpha: 0,
      scale: 0.8,
      duration: 400,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.scene.start('MapScene');
      }
    });
  }

  createResourceDisplay(width) {
    const gold = this.registry.get('gold') || 100;
    const hp = this.registry.get('playerHp') || 100;
    const maxHp = this.registry.get('maxHp') || 100;
    
    const resourceContainer = this.add.container(width / 2, 80);
    resourceContainer.setAlpha(0);
    
    const bg = this.add.rectangle(0, 0, 300, 50, 0x000000, 0.5);
    bg.setStrokeStyle(1, 0x636e72);
    resourceContainer.add(bg);
    
    const goldText = this.add.text(-80, 0, `💰 ${gold}`, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#fdcb6e'
    }).setOrigin(0.5);
    resourceContainer.add(goldText);
    
    const hpText = this.add.text(80, 0, `❤️ ${hp}/${maxHp}`, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ff6b6b'
    }).setOrigin(0.5);
    resourceContainer.add(hpText);
    
    this.tweens.add({
      targets: resourceContainer,
      alpha: 1,
      y: 100,
      duration: 500,
      delay: 300
    });
  }

  createParticles(width, height) {
    // Floating orbs
    for (let i = 0; i < 15; i++) {
      const orb = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(2, 5),
        GAME_CONFIG.COLORS.PRIMARY,
        Phaser.Math.FloatBetween(0.1, 0.3)
      );
      
      this.tweens.add({
        targets: orb,
        y: orb.y - Phaser.Math.Between(50, 100),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }
}
