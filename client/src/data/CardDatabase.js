/**
 * Card Database - All card definitions
 */

export const CardDatabase = {
  // Starter deck cards
  starterCards: [
    {
      id: 'basic_tower',
      name: 'Watchtower',
      type: 'tower',
      rarity: 'Common',
      cost: 1,
      description: 'A basic tower. Deals 8 damage.',
      towerType: 'basic',
      damage: 8,
      range: 120,
      attackSpeed: 1000,
      projectileSpeed: 400
    },
    {
      id: 'archer_tower',
      name: 'Archer Post',
      type: 'tower',
      rarity: 'Common',
      cost: 2,
      description: 'Fast attacks. Targets furthest enemy.',
      towerType: 'archer',
      damage: 6,
      range: 150,
      attackSpeed: 700,
      projectileSpeed: 500
    },
    {
      id: 'fireball',
      name: 'Fireball',
      type: 'spell',
      rarity: 'Common',
      cost: 1,
      description: 'Deal 15 damage to all enemies in area.',
      effect: 'damage_area',
      value: 15,
      radius: 80
    },
    {
      id: 'energy_surge',
      name: 'Energy Surge',
      type: 'resource',
      rarity: 'Common',
      cost: 0,
      description: 'Gain 2 energy.',
      resourceType: 'energy',
      value: 2
    },
    {
      id: 'quick_draw',
      name: 'Quick Draw',
      type: 'resource',
      rarity: 'Common',
      cost: 1,
      description: 'Draw 2 cards.',
      resourceType: 'draw',
      value: 2
    }
  ],

  // All available cards by rarity
  allCards: {
    common: [
      {
        id: 'basic_tower',
        name: 'Watchtower',
        type: 'tower',
        rarity: 'Common',
        cost: 1,
        description: 'A basic tower. Deals 8 damage.',
        towerType: 'basic',
        damage: 8,
        range: 120,
        attackSpeed: 1000,
        projectileSpeed: 400
      },
      {
        id: 'archer_tower',
        name: 'Archer Post',
        type: 'tower',
        rarity: 'Common',
        cost: 2,
        description: 'Fast attacks. Targets furthest enemy.',
        towerType: 'archer',
        damage: 6,
        range: 150,
        attackSpeed: 700,
        projectileSpeed: 500
      },
      {
        id: 'fireball',
        name: 'Fireball',
        type: 'spell',
        rarity: 'Common',
        cost: 1,
        description: 'Deal 15 damage to all enemies in area.',
        effect: 'damage_area',
        value: 15,
        radius: 80
      },
      {
        id: 'energy_surge',
        name: 'Energy Surge',
        type: 'resource',
        rarity: 'Common',
        cost: 0,
        description: 'Gain 2 energy.',
        resourceType: 'energy',
        value: 2
      },
      {
        id: 'quick_draw',
        name: 'Quick Draw',
        type: 'resource',
        rarity: 'Common',
        cost: 1,
        description: 'Draw 2 cards.',
        resourceType: 'draw',
        value: 2
      },
      {
        id: 'reinforced_wall',
        name: 'Wall',
        type: 'tower',
        rarity: 'Common',
        cost: 1,
        description: 'Blocks path. No attack.',
        towerType: 'basic',
        damage: 0,
        range: 0,
        attackSpeed: 0,
        projectileSpeed: 0,
        isWall: true
      },
      {
        id: 'gold_pouch',
        name: 'Gold Pouch',
        type: 'resource',
        rarity: 'Common',
        cost: 0,
        description: 'Gain 10 gold.',
        resourceType: 'gold',
        value: 10
      }
    ],

    uncommon: [
      {
        id: 'mage_tower',
        name: 'Mage Tower',
        type: 'tower',
        rarity: 'Uncommon',
        cost: 3,
        description: 'High damage magic attacks.',
        towerType: 'mage',
        damage: 25,
        range: 140,
        attackSpeed: 1500,
        projectileSpeed: 300
      },
      {
        id: 'cannon_tower',
        name: 'Cannon',
        type: 'tower',
        rarity: 'Uncommon',
        cost: 3,
        description: 'Area damage on impact.',
        towerType: 'cannon',
        damage: 20,
        range: 130,
        attackSpeed: 2000,
        projectileSpeed: 350
      },
      {
        id: 'frost_tower',
        name: 'Frost Spire',
        type: 'tower',
        rarity: 'Uncommon',
        cost: 2,
        description: 'Slows enemies hit.',
        towerType: 'frost',
        damage: 5,
        range: 100,
        attackSpeed: 800,
        projectileSpeed: 300
      },
      {
        id: 'chain_lightning',
        name: 'Chain Lightning',
        type: 'spell',
        rarity: 'Uncommon',
        cost: 2,
        description: 'Deal 10 damage. Chains to 2 nearby enemies.',
        effect: 'damage_chain',
        value: 10,
        chainCount: 2
      },
      {
        id: 'frost_nova',
        name: 'Frost Nova',
        type: 'spell',
        rarity: 'Uncommon',
        cost: 2,
        description: 'Freeze all enemies in area for 2 turns.',
        effect: 'freeze_area',
        radius: 100,
        duration: 2
      },
      {
        id: 'power_boost',
        name: 'Power Boost',
        type: 'modifier',
        rarity: 'Uncommon',
        cost: 2,
        description: 'All towers gain +5 damage.',
        modifierType: 'damage',
        value: 5
      },
      {
        id: 'rapid_fire',
        name: 'Rapid Fire',
        type: 'modifier',
        rarity: 'Uncommon',
        cost: 2,
        description: 'All towers attack 20% faster.',
        modifierType: 'speed',
        value: 200
      },
      {
        id: 'treasure_hunt',
        name: 'Treasure Hunt',
        type: 'resource',
        rarity: 'Uncommon',
        cost: 1,
        description: 'Gain 25 gold.',
        resourceType: 'gold',
        value: 25
      }
    ],

    rare: [
      {
        id: 'lightning_tower',
        name: 'Tesla Tower',
        type: 'tower',
        rarity: 'Rare',
        cost: 4,
        description: 'Lightning chains between enemies.',
        towerType: 'lightning',
        damage: 15,
        range: 120,
        attackSpeed: 1200,
        projectileSpeed: 600
      },
      {
        id: 'sniper_tower',
        name: 'Sniper Nest',
        type: 'tower',
        rarity: 'Rare',
        cost: 4,
        description: 'Very long range, high damage.',
        towerType: 'archer',
        damage: 50,
        range: 250,
        attackSpeed: 2500,
        projectileSpeed: 800
      },
      {
        id: 'meteor_strike',
        name: 'Meteor Strike',
        type: 'spell',
        rarity: 'Rare',
        cost: 3,
        description: 'Deal 40 damage to all enemies.',
        effect: 'damage_all',
        value: 40
      },
      {
        id: 'time_warp',
        name: 'Time Warp',
        type: 'spell',
        rarity: 'Rare',
        cost: 2,
        description: 'Slow all enemies for 3 turns.',
        effect: 'slow_all',
        duration: 3
      },
      {
        id: 'energy_overload',
        name: 'Overload',
        type: 'resource',
        rarity: 'Rare',
        cost: 0,
        description: 'Gain 4 energy.',
        resourceType: 'energy',
        value: 4
      },
      {
        id: 'tactical_draw',
        name: 'Tactical Draw',
        type: 'resource',
        rarity: 'Rare',
        cost: 1,
        description: 'Draw 3 cards.',
        resourceType: 'draw',
        value: 3
      },
      {
        id: 'fortify',
        name: 'Fortify',
        type: 'modifier',
        rarity: 'Rare',
        cost: 2,
        description: 'All towers gain +50 range.',
        modifierType: 'range',
        value: 50
      }
    ],

    epic: [
      {
        id: 'inferno_tower',
        name: 'Inferno Tower',
        type: 'tower',
        rarity: 'Epic',
        cost: 5,
        description: 'Burns enemies. Damage increases over time.',
        towerType: 'mage',
        damage: 30,
        range: 140,
        attackSpeed: 1000,
        projectileSpeed: 400,
        special: 'burn'
      },
      {
        id: 'void_cannon',
        name: 'Void Cannon',
        type: 'tower',
        rarity: 'Epic',
        cost: 5,
        description: 'Massive area damage.',
        towerType: 'cannon',
        damage: 60,
        range: 160,
        attackSpeed: 3000,
        projectileSpeed: 300
      },
      {
        id: 'annihilation',
        name: 'Annihilation',
        type: 'spell',
        rarity: 'Epic',
        cost: 4,
        description: 'Deal 100 damage to all enemies.',
        effect: 'damage_all',
        value: 100
      },
      {
        id: 'double_time',
        name: 'Double Time',
        type: 'resource',
        rarity: 'Epic',
        cost: 2,
        description: 'Draw 4 cards, gain 2 energy.',
        resourceType: 'both',
        drawValue: 4,
        energyValue: 2
      },
      {
        id: 'war_machine',
        name: 'War Machine',
        type: 'modifier',
        rarity: 'Epic',
        cost: 3,
        description: 'All towers gain +10 damage and +100 range.',
        modifierType: 'both',
        damageValue: 10,
        rangeValue: 100
      }
    ],

    legendary: [
      {
        id: 'ancient_guardian',
        name: 'Ancient Guardian',
        type: 'tower',
        rarity: 'Legendary',
        cost: 7,
        description: 'The ultimate defense. Attacks all enemies in range.',
        towerType: 'mage',
        damage: 25,
        range: 200,
        attackSpeed: 500,
        projectileSpeed: 600,
        special: 'multishot'
      },
      {
        id: 'dragon_breath',
        name: 'Dragon Breath',
        type: 'tower',
        rarity: 'Legendary',
        cost: 6,
        description: 'Fires a devastating flame cone.',
        towerType: 'cannon',
        damage: 40,
        range: 180,
        attackSpeed: 1500,
        projectileSpeed: 400,
        special: 'cone'
      },
      {
        id: 'armageddon',
        name: 'Armageddon',
        type: 'spell',
        rarity: 'Legendary',
        cost: 6,
        description: 'Deal 200 damage to all enemies. Stun for 2 turns.',
        effect: 'apocalypse',
        value: 200,
        stunDuration: 2
      },
      {
        id: 'infinite_power',
        name: 'Infinite Power',
        type: 'resource',
        rarity: 'Legendary',
        cost: 0,
        description: 'Double your current energy. Draw 3 cards.',
        resourceType: 'infinite'
      }
    ],

    mythic: [
      {
        id: 'titan_fortress',
        name: 'Titan Fortress',
        type: 'tower',
        rarity: 'Mythic',
        cost: 8,
        description: 'Colossal tower with devastating power.',
        towerType: 'cannon',
        damage: 100,
        range: 220,
        attackSpeed: 2000,
        projectileSpeed: 500,
        special: 'splash'
      },
      {
        id: 'phoenix_spire',
        name: 'Phoenix Spire',
        type: 'tower',
        rarity: 'Mythic',
        cost: 7,
        description: 'Burns everything. Damage over time stacks.',
        towerType: 'mage',
        damage: 50,
        range: 180,
        attackSpeed: 800,
        projectileSpeed: 600,
        special: 'burn_stack'
      }
    ],

    exalted: [
      {
        id: 'celestial_arbiter',
        name: 'Celestial Arbiter',
        type: 'tower',
        rarity: 'Exalted',
        cost: 9,
        description: 'Divine judgment rains from above.',
        towerType: 'mage',
        damage: 150,
        range: 250,
        attackSpeed: 1500,
        projectileSpeed: 700,
        special: 'divine_wrath'
      },
      {
        id: 'worldbreaker',
        name: 'Worldbreaker',
        type: 'spell',
        rarity: 'Exalted',
        cost: 8,
        description: 'Deal 500 damage to all enemies.',
        effect: 'damage_all',
        value: 500
      }
    ],

    celestial: [
      {
        id: 'astral_nexus',
        name: 'Astral Nexus',
        type: 'tower',
        rarity: 'Celestial',
        cost: 10,
        description: 'Channels cosmic energy. Multi-target beam.',
        towerType: 'lightning',
        damage: 200,
        range: 300,
        attackSpeed: 1000,
        projectileSpeed: 800,
        special: 'cosmic_beam'
      },
      {
        id: 'stellar_cascade',
        name: 'Stellar Cascade',
        type: 'spell',
        rarity: 'Celestial',
        cost: 10,
        description: 'Deal 1000 damage to all enemies. Slow for 5 turns.',
        effect: 'apocalypse',
        value: 1000,
        stunDuration: 5
      }
    ],

    transcendent: [
      {
        id: 'eternal_sentinel',
        name: 'Eternal Sentinel',
        type: 'tower',
        rarity: 'Transcendent',
        cost: 12,
        description: 'Beyond mortal comprehension. Infinite targets.',
        towerType: 'mage',
        damage: 300,
        range: 350,
        attackSpeed: 500,
        projectileSpeed: 1000,
        special: 'reality_warp'
      },
      {
        id: 'void_collapse',
        name: 'Void Collapse',
        type: 'spell',
        rarity: 'Transcendent',
        cost: 12,
        description: 'Instantly destroy all enemies below 50% HP.',
        effect: 'execute_all',
        threshold: 0.5
      }
    ],

    divine: [
      {
        id: 'omniscient_obelisk',
        name: 'Omniscient Obelisk',
        type: 'tower',
        rarity: 'Divine',
        cost: 15,
        description: 'The pinnacle of power. Destroys all.',
        towerType: 'cannon',
        damage: 500,
        range: 400,
        attackSpeed: 300,
        projectileSpeed: 1200,
        special: 'omnipotent'
      },
      {
        id: 'genesis',
        name: 'Genesis',
        type: 'spell',
        rarity: 'Divine',
        cost: 15,
        description: 'Reset the battlefield. Restore all HP, destroy all enemies.',
        effect: 'reality_reset'
      }
    ]
  },

  /**
   * Get starter deck
   */
  getStarterDeck() {
    const deck = [];
    
    // Add starter cards
    // 4x Watchtower
    for (let i = 0; i < 4; i++) {
      deck.push({ ...this.starterCards[0] });
    }
    // 2x Archer Post
    for (let i = 0; i < 2; i++) {
      deck.push({ ...this.starterCards[1] });
    }
    // 2x Fireball
    for (let i = 0; i < 2; i++) {
      deck.push({ ...this.starterCards[2] });
    }
    // 1x Energy Surge
    deck.push({ ...this.starterCards[3] });
    // 1x Quick Draw
    deck.push({ ...this.starterCards[4] });
    
    return deck;
  },

  /**
   * Get random card reward based on rarity weights
   */
  getRandomCard(isElite = false) {
    const rarityRoll = Math.random() * 100;
    let rarity;
    
    if (isElite) {
      // Elite rewards have better odds
      if (rarityRoll < 25) rarity = 'common';
      else if (rarityRoll < 55) rarity = 'uncommon';
      else if (rarityRoll < 75) rarity = 'rare';
      else if (rarityRoll < 90) rarity = 'epic';
      else if (rarityRoll < 97) rarity = 'legendary';
      else if (rarityRoll < 99) rarity = 'mythic';
      else if (rarityRoll < 99.5) rarity = 'exalted';
      else if (rarityRoll < 99.8) rarity = 'celestial';
      else if (rarityRoll < 99.95) rarity = 'transcendent';
      else rarity = 'divine';
    } else {
      // Normal rewards
      if (rarityRoll < 55) rarity = 'common';
      else if (rarityRoll < 80) rarity = 'uncommon';
      else if (rarityRoll < 92) rarity = 'rare';
      else if (rarityRoll < 98) rarity = 'epic';
      else if (rarityRoll < 99.5) rarity = 'legendary';
      else if (rarityRoll < 99.8) rarity = 'mythic';
      else if (rarityRoll < 99.95) rarity = 'exalted';
      else if (rarityRoll < 99.99) rarity = 'celestial';
      else if (rarityRoll < 99.999) rarity = 'transcendent';
      else rarity = 'divine';
    }
    
    const pool = this.allCards[rarity];
    if (!pool || pool.length === 0) {
      // Fallback to common if rarity not found
      rarity = 'common';
    }
    const card = this.allCards[rarity][Math.floor(Math.random() * this.allCards[rarity].length)];
    
    return { ...card };
  },

  /**
   * Get multiple card rewards
   */
  getCardRewards(count = 3, isElite = false) {
    const rewards = [];
    const usedIds = new Set();
    
    while (rewards.length < count) {
      const card = this.getRandomCard(isElite);
      if (!usedIds.has(card.id)) {
        usedIds.add(card.id);
        rewards.push(card);
      }
    }
    
    return rewards;
  },

  /**
   * Get shop cards
   */
  getShopCards() {
    return [
      { ...this.getRandomCard(false), price: 50 },
      { ...this.getRandomCard(false), price: 75 },
      { ...this.getRandomCard(true), price: 100 },
      { ...this.getRandomCard(true), price: 150 }
    ];
  },

  /**
   * Get upgraded version of a card
   */
  getUpgradedCard(card) {
    const upgraded = { ...card };
    upgraded.upgraded = true;
    upgraded.name = card.name + '+';
    
    // Upgrade stats based on type
    if (card.type === 'tower') {
      upgraded.damage = Math.floor(card.damage * 1.5);
      upgraded.range = card.range + 20;
      upgraded.attackSpeed = Math.max(200, card.attackSpeed - 200);
    } else if (card.type === 'spell') {
      upgraded.value = Math.floor((card.value || 0) * 1.5);
      upgraded.radius = (card.radius || 0) + 20;
    } else if (card.type === 'resource') {
      upgraded.value = Math.floor((card.value || 0) * 1.5);
    } else if (card.type === 'modifier') {
      upgraded.value = Math.floor((card.value || 0) * 1.5);
    }
    
    // Cost reduction (minimum 0)
    upgraded.cost = Math.max(0, card.cost - 1);
    
    return upgraded;
  },

  /**
   * Get card by ID
   */
  getCardById(id) {
    for (const rarity in this.allCards) {
      const card = this.allCards[rarity].find(c => c.id === id);
      if (card) return { ...card };
    }
    return null;
  }
};

// Export helper function
export function getCardsByRarity(rarity) {
  const rarityKey = rarity.charAt(0).toUpperCase() + rarity.slice(1);
  return CardDatabase.allCards[rarityKey] || [];
}

// Export CARD_DATABASE as alias for compatibility
export const CARD_DATABASE = CardDatabase;
export default CardDatabase;
