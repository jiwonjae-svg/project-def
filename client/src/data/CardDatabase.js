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
      },
      // Extended legendary cards (consolidated from mythic/exalted/celestial/transcendent/divine)
      {
        id: 'titan_fortress',
        name: 'Titan Fortress',
        type: 'tower',
        rarity: 'Legendary',
        cost: 7,
        description: 'Colossal tower with devastating power.',
        towerType: 'cannon',
        damage: 80,
        range: 220,
        attackSpeed: 1800,
        projectileSpeed: 500,
        special: 'splash'
      },
      {
        id: 'phoenix_spire',
        name: 'Phoenix Spire',
        type: 'tower',
        rarity: 'Legendary',
        cost: 6,
        description: 'Burns everything. Damage over time stacks.',
        towerType: 'mage',
        damage: 40,
        range: 180,
        attackSpeed: 800,
        projectileSpeed: 600,
        special: 'burn_stack'
      },
      {
        id: 'celestial_arbiter',
        name: 'Celestial Arbiter',
        type: 'tower',
        rarity: 'Legendary',
        cost: 8,
        description: 'Divine judgment rains from above.',
        towerType: 'mage',
        damage: 100,
        range: 250,
        attackSpeed: 1500,
        projectileSpeed: 700,
        special: 'divine_wrath'
      },
      {
        id: 'worldbreaker',
        name: 'Worldbreaker',
        type: 'spell',
        rarity: 'Legendary',
        cost: 7,
        description: 'Deal 300 damage to all enemies.',
        effect: 'damage_all',
        value: 300
      },
      {
        id: 'astral_nexus',
        name: 'Astral Nexus',
        type: 'tower',
        rarity: 'Legendary',
        cost: 8,
        description: 'Channels cosmic energy. Multi-target beam.',
        towerType: 'lightning',
        damage: 120,
        range: 280,
        attackSpeed: 1000,
        projectileSpeed: 800,
        special: 'cosmic_beam'
      },
      {
        id: 'stellar_cascade',
        name: 'Stellar Cascade',
        type: 'spell',
        rarity: 'Legendary',
        cost: 8,
        description: 'Deal 500 damage to all enemies. Slow for 3 turns.',
        effect: 'apocalypse',
        value: 500,
        stunDuration: 3
      },
      {
        id: 'eternal_sentinel',
        name: 'Eternal Sentinel',
        type: 'tower',
        rarity: 'Legendary',
        cost: 9,
        description: 'Beyond mortal comprehension. Attacks all enemies.',
        towerType: 'mage',
        damage: 150,
        range: 350,
        attackSpeed: 700,
        projectileSpeed: 1000,
        special: 'reality_warp'
      },
      {
        id: 'void_collapse',
        name: 'Void Collapse',
        type: 'spell',
        rarity: 'Legendary',
        cost: 9,
        description: 'Instantly destroy all enemies below 40% HP.',
        effect: 'execute_all',
        threshold: 0.4
      }
    ],

    // Note: Old mythic/exalted/celestial/transcendent/divine tiers removed
    // All consolidated into legendary (5-tier system: common/uncommon/rare/epic/legendary)
    legendary_extended: []
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
   * Redesigned with 5 tiers and balanced probabilities
   */
  getRandomCard(isElite = false) {
    const rarityRoll = Math.random() * 100;
    let rarity;
    
    if (isElite) {
      // Elite rewards - Better odds for higher rarities
      if (rarityRoll < 20) rarity = 'common';          // 20%
      else if (rarityRoll < 45) rarity = 'uncommon';   // 25%
      else if (rarityRoll < 70) rarity = 'rare';       // 25%
      else if (rarityRoll < 90) rarity = 'epic';       // 20%
      else rarity = 'legendary';                        // 10%
    } else {
      // Normal rewards - Common cards are more frequent
      if (rarityRoll < 50) rarity = 'common';          // 50%
      else if (rarityRoll < 75) rarity = 'uncommon';   // 25%
      else if (rarityRoll < 90) rarity = 'rare';       // 15%
      else if (rarityRoll < 98) rarity = 'epic';       // 8%
      else rarity = 'legendary';                        // 2%
    }
    
    const pool = this.allCards[rarity];
    if (!pool || pool.length === 0) {
      // Fallback to common if rarity not found
      rarity = 'common';
    }
    const card = this.allCards[rarity][Math.floor(Math.random() * this.allCards[rarity].length)];
    
    // Apply rarity-specific mechanics
    const enhancedCard = this.applyRarityMechanics({ ...card });
    
    return enhancedCard;
  }

  /**
   * Apply rarity-specific mechanics and bonuses
   */
  applyRarityMechanics(card) {
    const rarityBonuses = {
      common: {
        multiplier: 1.0,
        special: null,
        color: '#9e9e9e',
        glowColor: null
      },
      uncommon: {
        multiplier: 1.3,
        special: 'bonus_resources', // 10% chance to refund 1 energy
        color: '#4caf50',
        glowColor: null
      },
      rare: {
        multiplier: 1.6,
        special: 'splash_damage', // Towers deal 25% damage to nearby enemies
        color: '#2196f3',
        glowColor: '#64b5f6'
      },
      epic: {
        multiplier: 2.0,
        special: 'double_attack', // 20% chance to attack twice
        color: '#9c27b0',
        glowColor: '#ba68c8'
      },
      legendary: {
        multiplier: 2.5,
        special: 'multi_effect', // Cards have additional unique effects
        color: '#ff9800',
        glowColor: '#ffa726'
      }
    };

    const bonus = rarityBonuses[card.rarity.toLowerCase()] || rarityBonuses.common;

    // Apply stat multiplier
    if (card.type === 'tower') {
      card.damage = Math.floor(card.damage * bonus.multiplier);
      card.range = Math.floor(card.range * (1 + (bonus.multiplier - 1) * 0.5));
      card.attackSpeed = Math.max(200, Math.floor(card.attackSpeed / (1 + (bonus.multiplier - 1) * 0.3)));
    } else if (card.type === 'spell') {
      card.value = Math.floor((card.value || 0) * bonus.multiplier);
      if (card.radius) {
        card.radius = Math.floor(card.radius * (1 + (bonus.multiplier - 1) * 0.3));
      }
    } else if (card.type === 'resource') {
      card.value = Math.floor((card.value || 0) * bonus.multiplier);
    }

    // Add special ability
    card.specialAbility = bonus.special;
    card.rarityColor = bonus.color;
    card.glowColor = bonus.glowColor;

    // Add unique legendary effects
    if (card.rarity === 'Legendary' || card.rarity === 'legendary') {
      card.legendaryEffect = this.getLegendaryEffect(card);
    }

    return card;
  }

  /**
   * Get unique legendary effects
   */
  getLegendaryEffect(card) {
    const legendaryEffects = {
      tower: [
        { name: 'Chain Reaction', description: 'Attacks chain to 2 additional enemies' },
        { name: 'Crit Master', description: '30% chance to deal 3x damage' },
        { name: 'Aura of Power', description: 'Nearby towers gain +20% damage' },
        { name: 'Pierce', description: 'Attacks pierce through enemies' }
      ],
      spell: [
        { name: 'Echo Cast', description: 'Spell casts twice' },
        { name: 'Overcharge', description: 'Double effect, costs no energy' },
        { name: 'Area Boost', description: 'Effect radius doubled' }
      ],
      resource: [
        { name: 'Abundance', description: 'Gain double resources' },
        { name: 'Chain Draw', description: 'Draw an additional card' }
      ]
    };

    const effectPool = legendaryEffects[card.type] || legendaryEffects.tower;
    return effectPool[Math.floor(Math.random() * effectPool.length)];
  }

  /**
   * Get rarity display info
   */
  getRarityInfo(rarity) {
    const rarityData = {
      common: {
        name: 'Common',
        color: '#9e9e9e',
        glowColor: null,
        description: 'Basic cards',
        dropRate: 'Very Common'
      },
      uncommon: {
        name: 'Uncommon',
        color: '#4caf50',
        glowColor: null,
        description: 'Enhanced cards with 10% energy refund chance',
        dropRate: 'Common'
      },
      rare: {
        name: 'Rare',
        color: '#2196f3',
        glowColor: '#64b5f6',
        description: 'Powerful cards with splash damage',
        dropRate: 'Uncommon'
      },
      epic: {
        name: 'Epic',
        color: '#9c27b0',
        glowColor: '#ba68c8',
        description: 'Elite cards with 20% double attack chance',
        dropRate: 'Rare'
      },
      legendary: {
        name: 'Legendary',
        color: '#ff9800',
        glowColor: '#ffa726',
        description: 'Ultimate cards with unique legendary effects',
        dropRate: 'Very Rare'
      }
    };

    return rarityData[rarity.toLowerCase()] || rarityData.common;
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
