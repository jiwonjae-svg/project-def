/**
 * Enemy Entity - Follows path and attacks base
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Enemy extends Phaser.GameObjects.Container {
  constructor(scene, pathPoints, enemyData) {
    super(scene, pathPoints[0].x, pathPoints[0].y);
    
    this.scene = scene;
    this.pathPoints = pathPoints;
    this.enemyData = enemyData;
    
    // Important: worldX/worldY = actual world coordinates for movement
    // x/y = screen coordinates for display (affected by virtual zoom)
    this.worldX = pathPoints[0].x;
    this.worldY = pathPoints[0].y;
    
    // Stats
    this.maxHealth = enemyData.health;
    this.health = enemyData.health;
    this.speed = enemyData.speed;
    this.damage = enemyData.damage;
    this.goldValue = enemyData.goldValue;
    this.scoreValue = enemyData.scoreValue;
    this.enemyType = enemyData.type;
    
    // State
    this.currentPathIndex = 0;
    this.pathProgress = 0;
    this.isDead = false;
    this.statusEffects = {};
    
    // Callbacks
    this.onReachBase = null;
    this.onDeath = null;
    
    // Create enemy visual
    this.createEnemy();
    
    scene.add.existing(this);
  }

  createEnemy() {
    // Shadow
    this.shadow = this.scene.add.ellipse(0, 15, 25, 10, 0x000000, 0.3);
    this.add(this.shadow);
    
    // Body color based on type
    const typeColors = {
      normal: 0xf44336,
      fast: 0xff9800,
      tank: 0x795548,
      flying: 0x9c27b0,
      boss: 0x212121,
      elite: 0xffd700
    };
    
    this.bodyColor = typeColors[this.enemyType] || 0xf44336;
    
    // Body size based on type
    const sizes = {
      normal: 16,
      fast: 14,
      tank: 22,
      flying: 15,
      boss: 30,
      elite: 24
    };
    
    this.bodySize = sizes[this.enemyType] || 16;
    
    // Main body
    this.body = this.scene.add.circle(0, 0, this.bodySize, this.bodyColor);
    this.add(this.body);
    
    // Eyes
    this.leftEye = this.scene.add.circle(-5, -3, 4, 0xffffff);
    this.rightEye = this.scene.add.circle(5, -3, 4, 0xffffff);
    this.add(this.leftEye);
    this.add(this.rightEye);
    
    // Pupils
    this.leftPupil = this.scene.add.circle(-4, -3, 2, 0x000000);
    this.rightPupil = this.scene.add.circle(6, -3, 2, 0x000000);
    this.add(this.leftPupil);
    this.add(this.rightPupil);
    
    // Special features based on type
    this.addTypeFeatures();
    
    // Health bar system - independent from container rotation
    // Create health bars in scene (not in container) to avoid rotation effects
    const healthBarOffset = -this.bodySize - 10; // Y offset from center
    
    // Calculate initial health bar position (convert world to screen if possible)
    let healthBarX = this.worldX;
    let healthBarY = this.worldY + healthBarOffset;
    
    if (this.scene.worldToScreen) {
      const screenPos = this.scene.worldToScreen(this.worldX, this.worldY + healthBarOffset);
      healthBarX = screenPos.x;
      healthBarY = screenPos.y;
    }
    
    // Health bar background (added to scene, not container)
    this.healthBarBg = this.scene.add.rectangle(healthBarX, healthBarY, 30, 5, 0x333333);
    this.healthBarBg.setDepth(16); // Just above enemy
    
    // Health bar fill (added to scene, not container)
    this.healthBar = this.scene.add.rectangle(healthBarX - 15, healthBarY, 30, 4, 0x4caf50);
    this.healthBar.setOrigin(0, 0.5);
    this.healthBar.setDepth(16);
    
    // Status effect icons container
    this.statusContainer = this.scene.add.container(0, -this.bodySize - 20);
    this.add(this.statusContainer);
    
    // Set depth for enemies (below towers and UI)
    this.setDepth(15);
    
    // Entrance animation
    this.setScale(0);
    this.scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Make enemy interactive for hover info
    this.body.setInteractive({ useHandCursor: true });
    
    this.body.on('pointerover', () => {
      if (this.scene && this.scene.showEnemyInfo) {
        this.scene.showEnemyInfo(this);
      }
    });
    
    this.body.on('pointerout', () => {
      if (this.scene && this.scene.hideEnemyInfo) {
        this.scene.hideEnemyInfo();
      }
    });
  }

  addTypeFeatures() {
    switch (this.enemyType) {
      case 'fast':
        // Speed lines
        const line1 = this.scene.add.line(0, 0, -25, 0, -15, 0, 0xffffff, 0.5);
        const line2 = this.scene.add.line(0, 5, -25, 0, -15, 0, 0xffffff, 0.3);
        this.add(line1);
        this.add(line2);
        break;
        
      case 'tank':
        // Armor plates
        const armor = this.scene.add.arc(0, 0, this.bodySize + 3, 0, Math.PI, false, 0x5d4037);
        armor.setRotation(-Math.PI / 2);
        this.add(armor);
        break;
        
      case 'flying':
        // Wings
        const leftWing = this.scene.add.ellipse(-15, -5, 12, 8, 0xba68c8, 0.8);
        const rightWing = this.scene.add.ellipse(15, -5, 12, 8, 0xba68c8, 0.8);
        this.add(leftWing);
        this.add(rightWing);
        
        // Wing animation
        this.scene.tweens.add({
          targets: [leftWing, rightWing],
          scaleY: 0.5,
          duration: 150,
          yoyo: true,
          repeat: -1
        });
        
        // Float above ground
        this.shadow.y = 25;
        break;
        
      case 'boss':
        // Crown
        const crown = this.scene.add.polygon(0, -this.bodySize - 5, [
          -15, 5,
          -10, -5,
          -5, 5,
          0, -10,
          5, 5,
          10, -5,
          15, 5
        ], 0xffd700);
        this.add(crown);
        
        // Glow effect
        this.bossGlow = this.scene.add.circle(0, 0, this.bodySize + 10, this.bodyColor, 0.3);
        this.addAt(this.bossGlow, 1);
        
        this.scene.tweens.add({
          targets: this.bossGlow,
          alpha: 0.1,
          scale: 1.2,
          duration: 500,
          yoyo: true,
          repeat: -1
        });
        break;
        
      case 'elite':
        // Aura
        this.eliteAura = this.scene.add.circle(0, 0, this.bodySize + 5, 0xffd700, 0.3);
        this.addAt(this.eliteAura, 1);
        
        this.scene.tweens.add({
          targets: this.eliteAura,
          alpha: 0.1,
          duration: 400,
          yoyo: true,
          repeat: -1
        });
        break;
    }
  }

  update(time, delta) {
    // Safety check - if enemy is destroyed or dead, don't update
    if (this.isDead || !this.scene || !this.body) return;
    
    // Apply status effects
    this.updateStatusEffects(delta);
    
    // Calculate current speed with modifiers
    let currentSpeed = this.speed;
    
    if (this.statusEffects.slow) {
      currentSpeed *= 0.5;
    }
    
    if (this.statusEffects.freeze) {
      currentSpeed = 0;
    }
    
    // Move along path
    if (currentSpeed > 0) {
      this.moveAlongPath(currentSpeed, delta);
    }
    
    // Update facing direction
    this.updateFacing();
    
    // Update health bar position (independent of rotation)
    this.updateHealthBarPosition();
    
    // Animate (check if components still exist)
    if (this.body && !this.isDead) {
      this.animate(time);
    }
  }

  moveAlongPath(speed, delta) {
    // Check if we're at the end of the path
    if (this.currentPathIndex >= this.pathPoints.length - 1) {
      // For circular path, loop back to start
      if (this.isCircularPath) {
        this.currentPathIndex = 0;
        this.lapsCompleted = (this.lapsCompleted || 0) + 1;
      } else {
        // Reached base (non-circular path)
        if (this.onReachBase) {
          this.isDead = true;
          this.onReachBase();
        }
        return;
      }
    }
    
    const target = this.pathPoints[this.currentPathIndex + 1];
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    const moveDistance = speed * (delta / 1000);
    
    if (distance <= moveDistance) {
      // Reached waypoint
      this.x = target.x;
      this.y = target.y;
      this.worldX = target.x;
      this.worldY = target.y;
      this.currentPathIndex++;
      this.pathProgress = this.currentPathIndex / (this.pathPoints.length - 1);
    } else {
      // Move towards waypoint
      const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
      this.x += Math.cos(angle) * moveDistance;
      this.y += Math.sin(angle) * moveDistance;
      this.worldX = this.x;
      this.worldY = this.y;
      
      // Calculate progress within segment
      const segmentProgress = 1 - (distance / Phaser.Math.Distance.Between(
        this.pathPoints[this.currentPathIndex].x,
        this.pathPoints[this.currentPathIndex].y,
        target.x,
        target.y
      ));
      
      this.pathProgress = (this.currentPathIndex + segmentProgress) / (this.pathPoints.length - 1);
    }
  }

  updateFacing() {
    // Rotate enemy to face movement direction
    if (this.currentPathIndex < this.pathPoints.length - 1) {
      const target = this.pathPoints[this.currentPathIndex + 1];
      
      // Calculate angle to target for rotation
      const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
      
      // Rotate container to face movement direction
      this.rotation = angle + Math.PI / 2;
    }
  }

  updateHealthBarPosition() {
    // Update health bar position - always above enemy, rotation-independent
    if (!this.healthBar || !this.healthBarBg || !this.scene) return;
    
    // Health bar offset in world coordinates
    const healthBarOffset = -this.bodySize - 10;
    
    // Calculate health bar world position
    const healthBarWorldX = this.worldX;
    const healthBarWorldY = this.worldY + healthBarOffset;
    
    // Convert to screen coordinates using scene's worldToScreen
    if (this.scene.worldToScreen) {
      const screenPos = this.scene.worldToScreen(healthBarWorldX, healthBarWorldY);
      
      // Position health bars at screen coordinates
      this.healthBarBg.x = screenPos.x;
      this.healthBarBg.y = screenPos.y;
      
      this.healthBar.x = screenPos.x - 15; // Offset for left-aligned bar
      this.healthBar.y = screenPos.y;
    } else {
      // Fallback if worldToScreen not available
      this.healthBarBg.x = healthBarWorldX;
      this.healthBarBg.y = healthBarWorldY;
      
      this.healthBar.x = healthBarWorldX - 15;
      this.healthBar.y = healthBarWorldY;
    }
  }

  animate(time) {
    // Safety check - ensure all components exist
    if (!this.body || !this.leftEye || !this.rightEye || 
        !this.leftPupil || !this.rightPupil) return;
    
    // Bobbing animation
    const bob = Math.sin(time / 200) * 2;
    this.body.y = bob;
    this.leftEye.y = -3 + bob;
    this.rightEye.y = -3 + bob;
    this.leftPupil.y = -3 + bob;
    this.rightPupil.y = -3 + bob;
  }

  takeDamage(amount) {
    if (this.isDead) return;
    
    // Apply damage reduction for tank types
    if (this.enemyType === 'tank') {
      amount = Math.floor(amount * 0.7);
    }
    
    this.health -= amount;
    
    // Update health bar
    const healthPercent = Math.max(0, this.health / this.maxHealth);
    this.healthBar.scaleX = healthPercent;
    
    // Health bar color based on percentage
    if (healthPercent > 0.6) {
      this.healthBar.setFillStyle(0x4caf50);
    } else if (healthPercent > 0.3) {
      this.healthBar.setFillStyle(0xffc107);
    } else {
      this.healthBar.setFillStyle(0xf44336);
    }
    
    // Damage flash
    this.scene.tweens.add({
      targets: this.body,
      fillColor: 0xffffff,
      duration: 50,
      yoyo: true,
      onComplete: () => {
        this.body.setFillStyle(this.bodyColor);
      }
    });
    
    // Damage number
    this.showDamageNumber(amount);
    
    // Check death
    if (this.health <= 0) {
      this.die();
    }
  }

  showDamageNumber(amount) {
    const dmgText = this.scene.add.text(this.x, this.y - 20, `-${amount}`, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: dmgText,
      y: dmgText.y - 30,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => dmgText.destroy()
    });
  }

  applyStatus(statusType, duration) {
    const statusColors = {
      burn: 0xff5722,
      freeze: 0x00bcd4,
      poison: 0x4caf50,
      slow: 0x9c27b0,
      stun: 0xffeb3b
    };
    
    // Add or refresh status
    this.statusEffects[statusType] = {
      duration: duration * 1000, // Convert to ms
      remaining: duration * 1000
    };
    
    // Visual indicator
    this.updateStatusIcons();
    
    // Status visual effect
    if (statusType === 'freeze') {
      this.body.setStrokeStyle(3, statusColors.freeze);
    } else if (statusType === 'burn') {
      this.body.setStrokeStyle(3, statusColors.burn);
    } else if (statusType === 'poison') {
      this.body.setStrokeStyle(3, statusColors.poison);
    }
  }

  updateStatusEffects(delta) {
    Object.keys(this.statusEffects).forEach(status => {
      const effect = this.statusEffects[status];
      effect.remaining -= delta;
      
      // Apply damage over time
      if (status === 'burn' || status === 'poison') {
        // Tick damage
        const tickDamage = Math.ceil(this.maxHealth * 0.02);
        if (Math.random() < delta / 500) {
          this.takeDamage(tickDamage);
        }
      }
      
      // Remove expired effects
      if (effect.remaining <= 0) {
        delete this.statusEffects[status];
        this.body.setStrokeStyle(0);
        this.updateStatusIcons();
      }
    });
  }

  updateStatusIcons() {
    // Clear existing icons
    this.statusContainer.removeAll(true);
    
    const statusIcons = {
      burn: '🔥',
      freeze: '❄',
      poison: '☠',
      slow: '🐌',
      stun: '⚡'
    };
    
    let xOffset = -10 * Object.keys(this.statusEffects).length / 2;
    
    Object.keys(this.statusEffects).forEach(status => {
      const icon = this.scene.add.text(xOffset, 0, statusIcons[status] || '?', {
        fontSize: '12px'
      }).setOrigin(0.5);
      
      this.statusContainer.add(icon);
      xOffset += 15;
    });
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    
    // Death animation
    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      angle: 180,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => {
        if (this.onDeath) {
          this.onDeath();
        }
      }
    });
  }

  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
    
    // Update health bar
    const healthPercent = this.health / this.maxHealth;
    this.healthBar.scaleX = healthPercent;
    
    // Heal visual
    const healText = this.scene.add.text(this.x, this.y - 20, `+${amount}`, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#4caf50',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: healText,
      y: healText.y - 30,
      alpha: 0,
      duration: 600,
      onComplete: () => healText.destroy()
    });
  }
}
