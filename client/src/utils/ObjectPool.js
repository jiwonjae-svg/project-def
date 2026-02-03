/**
 * Object Pool - Reuse game objects to reduce garbage collection
 * Uses Phaser's built-in Group system with enhanced pooling features
 */

import Phaser from 'phaser';

/**
 * Enhanced pooling system for enemies
 */
export class EnemyPool {
  constructor(scene, EnemyClass, initialSize = 20) {
    this.scene = scene;
    this.EnemyClass = EnemyClass;
    
    // Create Phaser Group with pooling enabled
    this.group = this.scene.add.group({
      classType: EnemyClass,
      maxSize: 100, // Maximum pool size
      runChildUpdate: true // Auto-call update on all active children
    });
    
    // Pre-create initial objects
    for (let i = 0; i < initialSize; i++) {
      const enemy = this.group.create(0, 0);
      enemy.setActive(false);
      enemy.setVisible(false);
    }
  }

  /**
   * Get an enemy from the pool
   */
  spawn(pathPoints, enemyData) {
    // Get first inactive enemy
    let enemy = this.group.getFirstDead(false);
    
    if (!enemy) {
      // Pool is full, create new one
      enemy = this.group.create(0, 0, pathPoints, enemyData);
    } else {
      // Reuse existing enemy
      enemy.reset(pathPoints, enemyData);
    }
    
    enemy.setActive(true);
    enemy.setVisible(true);
    
    return enemy;
  }

  /**
   * Return enemy to pool
   */
  despawn(enemy) {
    if (!enemy) return;
    
    // Clean up enemy state
    if (enemy.cleanup) {
      enemy.cleanup();
    }
    
    enemy.setActive(false);
    enemy.setVisible(false);
  }

  /**
   * Get all active enemies
   */
  getActive() {
    return this.group.getChildren().filter(e => e.active);
  }

  /**
   * Clear all enemies
   */
  clear() {
    this.group.clear(true, true);
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const children = this.group.getChildren();
    return {
      total: children.length,
      active: children.filter(e => e.active).length,
      inactive: children.filter(e => !e.active).length
    };
  }
}

/**
 * Enhanced pooling system for projectiles
 */
export class ProjectilePool {
  constructor(scene, ProjectileClass, initialSize = 50) {
    this.scene = scene;
    this.ProjectileClass = ProjectileClass;
    
    // Create Phaser Group with pooling
    this.group = this.scene.add.group({
      classType: ProjectileClass,
      maxSize: 200,
      runChildUpdate: true
    });
    
    // Pre-create projectiles
    for (let i = 0; i < initialSize; i++) {
      const projectile = this.group.create(0, 0);
      projectile.setActive(false);
      projectile.setVisible(false);
    }
  }

  /**
   * Fire a projectile from the pool
   */
  fire(x, y, worldX, worldY, target, config) {
    let projectile = this.group.getFirstDead(false);
    
    if (!projectile) {
      projectile = this.group.create(x, y, target, config);
    } else {
      projectile.reset(x, y, worldX, worldY, target, config);
    }
    
    projectile.setActive(true);
    projectile.setVisible(true);
    
    return projectile;
  }

  /**
   * Return projectile to pool
   */
  despawn(projectile) {
    if (!projectile) return;
    
    if (projectile.cleanup) {
      projectile.cleanup();
    }
    
    projectile.setActive(false);
    projectile.setVisible(false);
  }

  /**
   * Get all active projectiles
   */
  getActive() {
    return this.group.getChildren().filter(p => p.active);
  }

  /**
   * Clear all projectiles
   */
  clear() {
    this.group.clear(true, true);
  }

  /**
   * Update all active projectiles
   */
  update(time, delta) {
    const active = this.getActive();
    
    active.forEach(projectile => {
      if (projectile.shouldDestroy) {
        this.despawn(projectile);
      }
    });
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const children = this.group.getChildren();
    return {
      total: children.length,
      active: children.filter(p => p.active).length,
      inactive: children.filter(p => !p.active).length
    };
  }
}

/**
 * Generic object pool for any game object type
 */
export class GenericPool {
  constructor(scene, classType, config = {}) {
    this.scene = scene;
    this.classType = classType;
    
    const defaultConfig = {
      maxSize: 100,
      initialSize: 20,
      runChildUpdate: true
    };
    
    const poolConfig = { ...defaultConfig, ...config };
    
    this.group = this.scene.add.group({
      classType: classType,
      maxSize: poolConfig.maxSize,
      runChildUpdate: poolConfig.runChildUpdate
    });
    
    // Pre-create objects
    for (let i = 0; i < poolConfig.initialSize; i++) {
      const obj = this.group.create(0, 0);
      obj.setActive(false);
      obj.setVisible(false);
    }
  }

  get(...args) {
    let obj = this.group.getFirstDead(false);
    
    if (!obj) {
      obj = this.group.create(...args);
    } else if (obj.reset) {
      obj.reset(...args);
    }
    
    obj.setActive(true);
    obj.setVisible(true);
    
    return obj;
  }

  release(obj) {
    if (!obj) return;
    
    if (obj.cleanup) {
      obj.cleanup();
    }
    
    obj.setActive(false);
    obj.setVisible(false);
  }

  clear() {
    this.group.clear(true, true);
  }

  getActive() {
    return this.group.getChildren().filter(o => o.active);
  }

  getStats() {
    const children = this.group.getChildren();
    return {
      total: children.length,
      active: children.filter(o => o.active).length,
      inactive: children.filter(o => !o.active).length
    };
  }
}
