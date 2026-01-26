/**
 * Enemy Database - All enemy definitions
 */

export const EnemyDatabase = {
  enemies: {
    normal: {
      type: 'normal',
      name: 'Goblin',
      health: 50,
      speed: 60,
      damage: 10,
      goldValue: 5,
      scoreValue: 10
    },
    fast: {
      type: 'fast',
      name: 'Scout',
      health: 30,
      speed: 120,
      damage: 5,
      goldValue: 4,
      scoreValue: 8
    },
    tank: {
      type: 'tank',
      name: 'Ogre',
      health: 150,
      speed: 35,
      damage: 20,
      goldValue: 10,
      scoreValue: 25
    },
    flying: {
      type: 'flying',
      name: 'Harpy',
      health: 40,
      speed: 80,
      damage: 8,
      goldValue: 7,
      scoreValue: 15
    },
    elite: {
      type: 'elite',
      name: 'Elite Warrior',
      health: 300,
      speed: 45,
      damage: 30,
      goldValue: 50,
      scoreValue: 100
    },
    boss: {
      type: 'boss',
      name: 'Dark Lord',
      health: 1000,
      speed: 25,
      damage: 50,
      goldValue: 200,
      scoreValue: 500
    }
  },

  // Boss variants per act
  bosses: {
    act1: {
      type: 'boss',
      name: 'Goblin King',
      health: 800,
      speed: 30,
      damage: 40,
      goldValue: 150,
      scoreValue: 400,
      abilities: ['summon', 'rage']
    },
    act2: {
      type: 'boss',
      name: 'Dragon',
      health: 1500,
      speed: 25,
      damage: 60,
      goldValue: 250,
      scoreValue: 600,
      abilities: ['fire_breath', 'flight']
    },
    act3: {
      type: 'boss',
      name: 'Demon Lord',
      health: 2500,
      speed: 20,
      damage: 80,
      goldValue: 500,
      scoreValue: 1000,
      abilities: ['teleport', 'dark_aura', 'summon_minions']
    }
  },

  // Elite variants
  elites: {
    berserker: {
      type: 'elite',
      name: 'Berserker',
      health: 250,
      speed: 55,
      damage: 35,
      goldValue: 40,
      scoreValue: 80,
      abilities: ['rage']
    },
    shaman: {
      type: 'elite',
      name: 'Shaman',
      health: 200,
      speed: 40,
      damage: 20,
      goldValue: 45,
      scoreValue: 90,
      abilities: ['heal_allies']
    },
    champion: {
      type: 'elite',
      name: 'Champion',
      health: 400,
      speed: 35,
      damage: 40,
      goldValue: 60,
      scoreValue: 120,
      abilities: ['shield', 'charge']
    }
  },

  /**
   * Get enemy by type
   */
  getEnemy(type, floor = 1, act = 1) {
    const base = this.enemies[type];
    if (!base) return this.enemies.normal;

    // Scale based on floor and act
    const floorScale = 1 + (floor - 1) * 0.1;
    const actScale = 1 + (act - 1) * 0.5;
    const totalScale = floorScale * actScale;

    return {
      ...base,
      health: Math.floor(base.health * totalScale),
      damage: Math.floor(base.damage * totalScale),
      goldValue: Math.floor(base.goldValue * (1 + (act - 1) * 0.3)),
      scoreValue: Math.floor(base.scoreValue * totalScale)
    };
  },

  /**
   * Get boss for specific act
   */
  getBoss(act) {
    const bossKey = `act${act}`;
    return this.bosses[bossKey] || this.bosses.act1;
  },

  /**
   * Get random elite
   */
  getRandomElite(floor = 1, act = 1) {
    const eliteKeys = Object.keys(this.elites);
    const randomKey = eliteKeys[Math.floor(Math.random() * eliteKeys.length)];
    const base = this.elites[randomKey];

    const floorScale = 1 + (floor - 1) * 0.1;
    const actScale = 1 + (act - 1) * 0.5;
    const totalScale = floorScale * actScale;

    return {
      ...base,
      health: Math.floor(base.health * totalScale),
      damage: Math.floor(base.damage * totalScale),
      goldValue: Math.floor(base.goldValue * (1 + (act - 1) * 0.3)),
      scoreValue: Math.floor(base.scoreValue * totalScale)
    };
  },

  /**
   * Generate wave composition
   */
  generateWave(waveNumber, floor, act, isElite = false, isBoss = false) {
    const enemies = [];
    
    if (isBoss) {
      enemies.push({
        ...this.getBoss(act),
        delay: 2000
      });
      return enemies;
    }

    // Base enemy count increases with wave and floor
    const baseCount = 5 + waveNumber * 2 + Math.floor(floor / 3);
    const enemyCount = Math.min(baseCount, 20);

    for (let i = 0; i < enemyCount; i++) {
      const rand = Math.random();
      let type = 'normal';

      // Enemy type distribution based on progress
      if (rand < 0.1 && act >= 2) {
        type = 'tank';
      } else if (rand < 0.25) {
        type = 'fast';
      } else if (rand < 0.35 && floor >= 5) {
        type = 'flying';
      }

      enemies.push({
        ...this.getEnemy(type, floor, act),
        delay: i * (800 - floor * 20 - act * 50) + Phaser.Math.Between(0, 200)
      });
    }

    // Add elite at end of wave for elite encounters
    if (isElite && waveNumber === 1) {
      enemies.push({
        ...this.getRandomElite(floor, act),
        delay: enemies.length * 800 + 1000
      });
    }

    return enemies;
  }
};
