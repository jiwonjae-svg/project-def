/**
 * Tower Entity - Defensive structure that attacks enemies
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Tower extends Phaser.GameObjects.Container {
  constructor(scene, x, y, cardData) {
    super(scene, x, y);
    
    this.scene = scene;
    this.cardData = cardData;
    
    // Base stats from card data
    this.baseDamage = cardData.damage || 10;
    this.baseRange = cardData.range || 150;
    this.baseAttackSpeed = cardData.attackSpeed || 1000;
    this.projectileSpeed = cardData.projectileSpeed || 400;
    this.towerType = cardData.towerType || 'basic';
    
    // Bonus stats (from upgrades)
    this.damageBonus = 0;
    this.attackSpeedBonus = 0;
    this.rangeBonus = 0;
    
    // Attribute system
    this.attributeLevel = 0;
    this.pierceCount = 0;
    this.splashRadius = 0;
    this.slowAmount = 0;
    this.chainCount = 0;
    this.poisonDuration = 0;
    this.burnDamage = 0;
    this.critChance = 0;
    this.projectileCount = 0;
    
    // State
    this.lastAttackTime = 0;
    this.target = null;
    this.level = cardData.upgraded ? 2 : 1;
    
    // Create tower visual
    this.createTower();
    
    scene.add.existing(this);
  }

  createTower() {
    // Get cell size from scene for proper scaling
    const cellSize = this.scene.cellSize || 40;
    const towerSize = cellSize * 0.7; // Tower takes 70% of cell size
    
    // Tower base (scaled to cell)
    this.base = this.scene.add.ellipse(0, towerSize * 0.4, towerSize * 0.8, towerSize * 0.3, 0x333333, 0.8);
    this.add(this.base);
    
    // Use rarity color from GameConfig - always use rarity color for consistency
    const rarityKey = this.cardData.rarity ? this.cardData.rarity.toUpperCase() : 'COMMON';
    const rarityData = GameConfig.RARITY[rarityKey];
    this.bodyColor = rarityData ? rarityData.color : 0x9e9e9e; // Default to Common color
    // Override cardData color to ensure consistency
    this.cardData.color = this.bodyColor;
    
    // Tower body (scaled to cell)
    const bodyGraphics = this.scene.add.graphics();
    const bodyWidth = towerSize * 0.5;
    const bodyHeight = towerSize * 0.9;
    
    bodyGraphics.fillStyle(this.bodyColor);
    bodyGraphics.fillRect(-bodyWidth / 2, -bodyHeight * 0.6, bodyWidth, bodyHeight);
    
    // Tower top (pyramid)
    bodyGraphics.beginPath();
    bodyGraphics.moveTo(0, -bodyHeight * 0.8);
    bodyGraphics.lineTo(bodyWidth * 0.6, -bodyHeight * 0.6);
    bodyGraphics.lineTo(-bodyWidth * 0.6, -bodyHeight * 0.6);
    bodyGraphics.closePath();
    bodyGraphics.fill();
    
    // Outline
    bodyGraphics.lineStyle(2, 0xffffff, 0.3);
    bodyGraphics.strokeRect(-bodyWidth / 2, -bodyHeight * 0.6, bodyWidth, bodyHeight);
    
    this.add(bodyGraphics);
    
    // Set tower depth (above enemies, below UI)
    this.setDepth(30);
    
    // Range indicator (hidden by default) - NOT added to container to avoid scaling
    this.rangeCircle = this.scene.add.circle(this.x, this.y, this.getRange(), 0xffffff, 0);
    this.rangeCircle.setStrokeStyle(2, 0xffffff, 0);
    this.rangeCircle.setDepth(25);
    
    // Level indicator
    if (this.level > 1) {
      const badgeSize = towerSize * 0.25;
      const levelBadge = this.scene.add.circle(towerSize * 0.4, -towerSize * 0.7, badgeSize, 0x4caf50);
      this.add(levelBadge);
      
      const levelText = this.scene.add.text(towerSize * 0.4, -towerSize * 0.7, `${this.level}`, {
        fontFamily: 'Arial',
        fontSize: `${Math.floor(badgeSize * 1.2)}px`,
        color: '#ffffff'
      }).setOrigin(0.5);
      this.add(levelText);
    }
    
    // Make interactive for info display (scaled to cell)
    this.setSize(towerSize, towerSize);
    this.setInteractive({ useHandCursor: true });
    
    this.on('pointerover', () => this.onHoverStart());
    this.on('pointerout', () => this.onHoverEnd());
    this.on('pointerdown', () => this.onTowerClick());
  }

  onHoverStart() {
    this.showRange();
    this.showTowerInfo();
  }

  onHoverEnd() {
    this.hideRange();
    this.hideTowerInfo();
  }

  onTowerClick() {
    // Check if in sell mode
    if (this.scene.isSellMode) {
      this.scene.sellTower(this);
      return;
    }
    
    // Show persistent info or handle selection
    if (this.scene.showTowerInfoPanel) {
      this.scene.showTowerInfoPanel(this);
    }
  }

  showTowerInfo() {
    // Create floating info tooltip (larger for mobile, doesn't scale with zoom)
    if (this.infoTooltip) return;
    
    const towerName = this.cardData.name || 'Tower';
    const infoText = `${towerName}\nDMG: ${this.getDamage()}\nRNG: ${this.getRange()}\nSPD: ${(1000/this.getAttackSpeed()).toFixed(1)}/s`;
    
    // Convert tower world position to screen position
    const screen = this.scene.worldToScreen(this.worldX, this.worldY);
    
    // Create as UI element (not child of tower)
    this.infoTooltip = this.scene.add.container(screen.x, screen.y - 190);
    this.infoTooltip.setDepth(300);
    
    // Background 2x size (240x150 instead of 120x75)
    const bg = this.scene.add.rectangle(0, 0, 240, 150, 0x000000, 0.95);
    bg.setStrokeStyle(3, this.bodyColor, 1);
    this.infoTooltip.add(bg);
    
    // Text 2x size (28px instead of 14px)
    const text = this.scene.add.text(0, 0, infoText, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.infoTooltip.add(text);
    
    // Add to scene's UI elements so it doesn't scale
    this.scene.addUIElement(this.infoTooltip);
  }

  hideTowerInfo() {
    if (this.infoTooltip) {
      this.infoTooltip.destroy();
      this.infoTooltip = null;
    }
  }

  getRange() {
    return this.baseRange + this.rangeBonus;
  }

  getDamage() {
    return this.baseDamage + this.damageBonus;
  }

  getAttackSpeed() {
    return Math.max(100, this.baseAttackSpeed + this.attackSpeedBonus);
  }

  showRange() {
    this.rangeCircle.setPosition(this.x, this.y);
    this.rangeCircle.setRadius(this.getRange());
    this.rangeCircle.setFillStyle(0xffffff, 0.1);
    this.rangeCircle.setStrokeStyle(2, this.bodyColor, 0.5);
  }

  hideRange() {
    this.rangeCircle.setFillStyle(0xffffff, 0);
    this.rangeCircle.setStrokeStyle(2, this.bodyColor, 0);
  }

  update(time, delta, enemies) {
    // Update range circle position to follow tower
    if (this.rangeCircle) {
      this.rangeCircle.setPosition(this.x, this.y);
    }
    
    // Update tooltip position to follow tower (if visible)
    if (this.infoTooltip && this.scene && this.scene.worldToScreen) {
      const screen = this.scene.worldToScreen(this.worldX, this.worldY);
      this.infoTooltip.x = screen.x;
      this.infoTooltip.y = screen.y - 190;
    }
    
    // Find target if none
    if (!this.target || !this.isTargetValid()) {
      this.target = this.findTarget(enemies);
    }
    
    // Attack if ready and has target
    if (this.target && time - this.lastAttackTime >= this.getAttackSpeed()) {
      this.attack();
      this.lastAttackTime = time;
    }
    
    // Rotate towards target
    if (this.target) {
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        this.target.x, this.target.y
      );
      // Could add rotation animation here
    }
  }

  findTarget(enemies) {
    let closest = null;
    let closestDist = this.getRange();
    
    // Use world coordinates for distance calculation (zoom-independent)
    const towerWorldX = this.worldX !== undefined ? this.worldX : this.x;
    const towerWorldY = this.worldY !== undefined ? this.worldY : this.y;
    
    enemies.forEach(enemy => {
      if (!enemy.isDead) {
        // Use world coordinates for enemy too
        const enemyWorldX = enemy.worldX !== undefined ? enemy.worldX : enemy.x;
        const enemyWorldY = enemy.worldY !== undefined ? enemy.worldY : enemy.y;
        
        const dist = Phaser.Math.Distance.Between(towerWorldX, towerWorldY, enemyWorldX, enemyWorldY);
        
        if (dist <= this.getRange()) {
          // Target selection strategies
          switch (this.towerType) {
            case 'archer':
              // Target furthest along path
              if (!closest || enemy.pathProgress > closest.pathProgress) {
                closest = enemy;
              }
              break;
            case 'cannon':
              // Target groups (closest to other enemies)
              if (dist < closestDist) {
                closest = enemy;
                closestDist = dist;
              }
              break;
            default:
              // Target closest
              if (dist < closestDist) {
                closest = enemy;
                closestDist = dist;
              }
          }
        }
      }
    });
    
    return closest;
  }

  isTargetValid() {
    if (!this.target || this.target.isDead) return false;
    
    // Use world coordinates for distance calculation (zoom-independent)
    const towerWorldX = this.worldX !== undefined ? this.worldX : this.x;
    const towerWorldY = this.worldY !== undefined ? this.worldY : this.y;
    const targetWorldX = this.target.worldX !== undefined ? this.target.worldX : this.target.x;
    const targetWorldY = this.target.worldY !== undefined ? this.target.worldY : this.target.y;
    
    const dist = Phaser.Math.Distance.Between(
      towerWorldX, towerWorldY,
      targetWorldX, targetWorldY
    );
    
    return dist <= this.getRange();
  }

  attack() {
    if (!this.target) return;
    
    // Attack animation
    this.scene.tweens.add({
      targets: this,
      scale: 1.1,
      duration: 50,
      yoyo: true,
      ease: 'Cubic.easeOut'
    });
    
    // Fire projectile
    this.fireProjectile();
  }

  fireProjectile() {
    // Use world coordinates for projectile creation
    const towerWorldX = this.worldX !== undefined ? this.worldX : this.x;
    const towerWorldY = this.worldY !== undefined ? this.worldY : this.y;
    
    const projectile = new Projectile(
      this.scene,
      this.x,
      this.y - 20,
      this.target,
      {
        damage: this.getDamage(),
        speed: this.projectileSpeed,
        color: this.bodyColor,
        type: this.towerType,
        worldX: towerWorldX,
        worldY: towerWorldY - 20
      }
    );
    
    this.scene.projectiles.push(projectile);
  }

  upgrade() {
    this.level++;
    this.damage = Math.floor(this.damage * 1.5);
    this.range += 20;
    this.attackSpeed = Math.max(200, this.attackSpeed - 100);
    
    // Upgrade visual effect
    this.scene.tweens.add({
      targets: this,
      scale: 1.3,
      duration: 200,
      yoyo: true,
      ease: 'Bounce.easeOut'
    });
    
    // Particles
    for (let i = 0; i < 12; i++) {
      const particle = this.scene.add.circle(this.x, this.y, 4, 0x4caf50);
      const angle = (i / 12) * Math.PI * 2;
      
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 60,
        y: this.y + Math.sin(angle) * 60,
        alpha: 0,
        duration: 500,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  destroy(fromScene) {
    // Clean up range circle
    if (this.rangeCircle) {
      this.rangeCircle.destroy();
      this.rangeCircle = null;
    }
    
    // Clean up tooltip if exists
    if (this.infoTooltip) {
      this.infoTooltip.destroy();
      this.infoTooltip = null;
    }
    
    super.destroy(fromScene);
  }
}

/**
 * Projectile - Fired by towers at enemies
 */
class Projectile extends Phaser.GameObjects.Container {
  constructor(scene, x, y, target, config) {
    super(scene, x, y);
    
    this.scene = scene;
    this.target = target;
    this.damage = config.damage;
    this.speed = config.speed;
    this.projectileType = config.type;
    
    // Set world coordinates for zoom-independent movement
    this.worldX = config.worldX !== undefined ? config.worldX : x;
    this.worldY = config.worldY !== undefined ? config.worldY : y;
    
    // Create projectile visual
    this.createProjectile(config.color);
    
    scene.add.existing(this);
  }

  createProjectile(color) {
    switch (this.projectileType) {
      case 'cannon':
        // Cannonball
        this.sprite = this.scene.add.circle(0, 0, 8, 0x333333);
        this.add(this.sprite);
        break;
      case 'mage':
        // Magic orb
        this.sprite = this.scene.add.circle(0, 0, 6, color);
        this.glow = this.scene.add.circle(0, 0, 10, color, 0.3);
        this.add(this.glow);
        this.add(this.sprite);
        break;
      case 'frost':
        // Ice crystal
        this.sprite = this.scene.add.star(0, 0, 6, 4, 8, color);
        this.add(this.sprite);
        break;
      case 'lightning':
        // Electric bolt
        this.sprite = this.scene.add.rectangle(0, 0, 12, 4, color);
        this.add(this.sprite);
        break;
      default:
        // Arrow
        this.sprite = this.scene.add.triangle(0, 0, 0, -8, 4, 4, -4, 4, color);
        this.add(this.sprite);
    }
    
    // Trail effect
    this.trail = [];
  }

  update(time, delta) {
    if (!this.target || this.target.isDead) {
      this.shouldDestroy = true;
      return;
    }
    
    // Use world coordinates for movement (zoom-independent)
    const targetWorldX = this.target.worldX !== undefined ? this.target.worldX : this.target.x;
    const targetWorldY = this.target.worldY !== undefined ? this.target.worldY : this.target.y;
    
    // Move towards target in world space
    const angle = Phaser.Math.Angle.Between(this.worldX, this.worldY, targetWorldX, targetWorldY);
    const velocity = {
      x: Math.cos(angle) * this.speed * (delta / 1000),
      y: Math.sin(angle) * this.speed * (delta / 1000)
    };
    
    // Update world position
    this.worldX += velocity.x;
    this.worldY += velocity.y;
    
    // Rotate projectile
    this.rotation = angle + Math.PI / 2;
    
    // Check collision in world space
    const dist = Phaser.Math.Distance.Between(this.worldX, this.worldY, targetWorldX, targetWorldY);
    
    if (dist < 15) {
      this.hit();
    }
    
    // Remove if far from map (in world space)
    if (this.scene && this.scene.mapSize) {
      const halfMap = this.scene.mapSize;
      if (Math.abs(this.worldX - this.scene.centerX) > halfMap ||
          Math.abs(this.worldY - this.scene.centerY) > halfMap) {
        this.shouldDestroy = true;
      }
    }
  }

  hit() {
    // Safety check
    if (!this.scene || !this.target || this.target.isDead) {
      this.shouldDestroy = true;
      return;
    }
    
    // Deal damage
    if (this.target && !this.target.isDead && typeof this.target.takeDamage === 'function') {
      this.target.takeDamage(this.damage);
    }
    
    // Apply special effects based on type
    switch (this.projectileType) {
      case 'frost':
        if (this.target && !this.target.isDead) this.target.applyStatus('slow', 2);
        break;
      case 'lightning':
        // Chain lightning effect
        this.chainLightning();
        break;
      case 'cannon':
        // Area damage
        this.areaDamage(50, this.damage * 0.5);
        break;
    }
    
    // Impact effect
    this.createImpactEffect();
    
    // Mark for removal
    this.shouldDestroy = true;
  }

  chainLightning() {
    // Safety check
    if (!this.scene || !this.scene.enemies || !this.scene.add || !this.scene.time || !this.scene.tweens) return;
    if (!this.target || this.target.isDead) return;
    
    // Find nearby enemies
    const nearbyEnemies = this.scene.enemies.filter(e => {
      if (e === this.target || e.isDead) return false;
      const dist = Phaser.Math.Distance.Between(this.target.x, this.target.y, e.x, e.y);
      return dist < 80;
    });
    
    // Chain to up to 2 enemies
    const chainTargets = nearbyEnemies.slice(0, 2);
    chainTargets.forEach((enemy, idx) => {
      this.scene.time.delayedCall(100 * (idx + 1), () => {
        // Double check scene and enemy still exist
        if (!this.scene || !this.scene.add || !this.scene.tweens) return;
        if (!enemy || enemy.isDead) return;
        
        enemy.takeDamage(this.damage * 0.5);
        
        // Draw lightning line
        const line = this.scene.add.graphics();
        line.lineStyle(2, 0xffeb3b);
        line.lineBetween(this.target.x, this.target.y, enemy.x, enemy.y);
        
        this.scene.tweens.add({
          targets: line,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            if (line && line.scene) line.destroy();
          }
        });
      });
    });
  }

  areaDamage(radius, damage) {
    // Safety check
    if (!this.scene || !this.scene.enemies) return;
    
    this.scene.enemies.forEach(enemy => {
      if (enemy !== this.target && !enemy.isDead) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
        if (dist < radius) {
          enemy.takeDamage(damage);
        }
      }
    });
    
    // Area effect visual
    const areaCircle = this.scene.add.circle(this.x, this.y, 10, 0xff5722, 0.5);
    this.scene.tweens.add({
      targets: areaCircle,
      radius: radius,
      alpha: 0,
      duration: 300,
      onComplete: () => areaCircle.destroy()
    });
  }

  createImpactEffect() {
    // Safety check
    if (!this.scene || !this.scene.add || !this.scene.tweens) return;
    
    // Small particles on impact
    for (let i = 0; i < 5; i++) {
      const particle = this.scene.add.circle(this.x, this.y, 3, 0xffffff);
      const angle = Math.random() * Math.PI * 2;
      
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 20,
        y: this.y + Math.sin(angle) * 20,
        alpha: 0,
        scale: 0,
        duration: 200,
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Reset projectile for object pooling
   */
  reset(x, y, worldX, worldY, target, config) {
    this.x = x;
    this.y = y;
    this.worldX = worldX !== undefined ? worldX : x;
    this.worldY = worldY !== undefined ? worldY : y;

    this.target = target;
    this.damage = config.damage;
    this.speed = config.speed;
    this.projectileType = config.type;
    this.shouldDestroy = false;

    // Reset visual state
    this.setAlpha(1);
    this.setScale(1);
    this.rotation = 0;

    // Recalculate initial rotation towards target
    if (target) {
      const targetWorldX = target.worldX !== undefined ? target.worldX : target.x;
      const targetWorldY = target.worldY !== undefined ? target.worldY : target.y;
      const angle = Phaser.Math.Angle.Between(this.worldX, this.worldY, targetWorldX, targetWorldY);
      this.rotation = angle + Math.PI / 2;
    }
  }

  /**
   * Cleanup before returning to pool
   */
  cleanup() {
    // Stop tweens
    this.scene.tweens.killTweensOf(this);

    // Clear target reference
    this.target = null;
    this.shouldDestroy = false;

    // Clear trail
    if (this.trail && this.trail.length > 0) {
      this.trail.forEach(t => {
        if (t && t.destroy) t.destroy();
      });
      this.trail = [];
    }
  }
  
  destroy(fromScene) {
    // Mark as destroyed
    this.shouldDestroy = true;
    this.target = null;
    super.destroy(fromScene);
  }
}

export { Projectile };

