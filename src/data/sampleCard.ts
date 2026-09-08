import { Card } from '../models/card';

export const SAMPLE_EMBERCLAW_WYRM: Card = {
  id: 'emberclaw_wyrm',
  name: 'Emberclaw wyrm',
  tier: 'UR',
  tierLevel: 5,
  baseHP: 9,
  baseATK: 3,
  baseSPD: 4,
  computedHP: 16,
  computedATK: 5,
  computedSPD: 4,
  currentHP: 16,
  currentShield: 0,
  hiddenRage: 0,
  hitsDealt: 0,
  skills: {
    basic: {
      name: 'Ember slash',
      type: 'basic_attack',
      damage: 'ATK',
    },
    utility: {
      name: 'Scale ward',
      type: 'utility',
      shield: 2,
      tierBonusEffect: 'cleanse_1_debuff',
    },
    ultimate: {
      name: 'Wyrmfire cataclysm',
      type: 'ultimate',
      damage: 14,
      unlockCondition: 'hits>=2 OR hpPercent<0.5 OR hiddenRage>=3',
      usesRemaining: 1,
    },
  },
  equippedRelics: [
    { relicId: 'ember_core', stackCount: 3 },
    { relicId: 'swift_string', stackCount: 1 },
    { relicId: 'iron_scale', stackCount: 2 },
  ],
  relicSlotsUsed: 3,
  relicSlotsMax: 10,
  fusionResult: 'tier_up_to_MR',
};
