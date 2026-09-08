import { describe, it, expect } from 'vitest';
import {
  calculateTierStat,
  computeCardTierStats,
  calculateTierSkillDamage,
  calculateTierUltimateDamage,
  getTierPassiveMultiplier,
} from '../fusion/tierScaling';
import { canFuse, fuseCards } from '../fusion/fusionRules';
import { SAMPLE_EMBERCLAW_WYRM } from '../data/sampleCard';
import { Card } from '../models/card';

describe('Tier Stat Scaling', () => {
  it('should scale stats according to progressive tier multipliers', () => {
    // Multipliers: [1.00, 1.40, 2.00, 2.80, 4.00, 5.80, 8.20, 12.00]
    expect(calculateTierStat(10, 0)).toBe(10); // C
    expect(calculateTierStat(10, 1)).toBe(14); // UC (10 * 1.40 = 14)
    expect(calculateTierStat(10, 2)).toBe(20); // R (10 * 2.00 = 20)
    expect(calculateTierStat(10, 3)).toBe(28); // SR (10 * 2.80 = 28)
    expect(calculateTierStat(10, 4)).toBe(40); // SSR (10 * 4.00 = 40)
    expect(calculateTierStat(10, 5)).toBe(58); // UR (10 * 5.80 = 58)
    expect(calculateTierStat(10, 6)).toBe(82); // MR (10 * 8.20 = 82)
    expect(calculateTierStat(10, 7)).toBe(120); // TR (10 * 12.00 = 120)
  });

  it('correctly matches sample fixture emberclaw_wyrm stats', () => {
    const computed = computeCardTierStats(
      SAMPLE_EMBERCLAW_WYRM.baseHP,
      SAMPLE_EMBERCLAW_WYRM.baseATK,
      SAMPLE_EMBERCLAW_WYRM.baseSPD,
      SAMPLE_EMBERCLAW_WYRM.tierLevel
    );

    expect(computed.computedHP).toBe(52);
    expect(computed.computedATK).toBe(17);
    // Speed scales progressively with tier (baseSPD 4 + UR speed bonus 9 = 13)
    expect(computed.computedSPD).toBe(13);
    expect(computed.computedDEF).toBe(5);
  });

  it('progressively scales speed across tiers giving higher tier cards turn priority', () => {
    // Base speed = 3
    const spdC = computeCardTierStats(10, 2, 3, 0).computedSPD;
    const spdUC = computeCardTierStats(10, 2, 3, 1).computedSPD;
    const spdR = computeCardTierStats(10, 2, 3, 2).computedSPD;
    const spdSR = computeCardTierStats(10, 2, 3, 3).computedSPD;
    const spdSSR = computeCardTierStats(10, 2, 3, 4).computedSPD;
    const spdUR = computeCardTierStats(10, 2, 3, 5).computedSPD;
    const spdMR = computeCardTierStats(10, 2, 3, 6).computedSPD;
    const spdTR = computeCardTierStats(10, 2, 3, 7).computedSPD;

    expect(spdC).toBe(3);   // +0
    expect(spdUC).toBe(4);  // +1
    expect(spdR).toBe(5);   // +2
    expect(spdSR).toBe(7);  // +4
    expect(spdSSR).toBe(9); // +6
    expect(spdUR).toBe(12); // +9
    expect(spdMR).toBe(15); // +12
    expect(spdTR).toBe(19); // +16
    expect(spdTR).toBeGreaterThan(spdMR);
    expect(spdMR).toBeGreaterThan(spdUR);
  });

  it('scales skill damage and ultimate damage across tiers', () => {
    // Skill 1 base = 2
    expect(calculateTierSkillDamage(2, 0)).toBe(2);  // C
    expect(calculateTierSkillDamage(2, 1)).toBe(3);  // UC
    expect(calculateTierSkillDamage(2, 2)).toBe(4);  // R
    expect(calculateTierSkillDamage(2, 4)).toBe(8);  // SSR
    expect(calculateTierSkillDamage(2, 7)).toBe(24); // TR

    // Ultimate base = 10
    expect(calculateTierUltimateDamage(10, 0)).toBe(10);  // C
    expect(calculateTierUltimateDamage(10, 1)).toBe(14);  // UC
    expect(calculateTierUltimateDamage(10, 2)).toBe(20);  // R
    expect(calculateTierUltimateDamage(10, 4)).toBe(40);  // SSR
    expect(calculateTierUltimateDamage(10, 7)).toBe(120); // TR
  });

  it('scales passive efficiency multiplier across tiers', () => {
    expect(getTierPassiveMultiplier(0)).toBe(1.0);
    expect(getTierPassiveMultiplier(1)).toBe(1.25);
    expect(getTierPassiveMultiplier(2)).toBe(1.50);
    expect(getTierPassiveMultiplier(4)).toBe(2.50);
    expect(getTierPassiveMultiplier(7)).toBe(5.00);
  });
});

describe('Card Fusion Rules', () => {
  const cardC1: Card = {
    id: 'forest_wolf',
    name: 'Forest Wolf',
    tier: 'C',
    tierLevel: 0,
    baseHP: 8,
    baseATK: 2,
    baseSPD: 3,
    computedHP: 8,
    computedATK: 2,
    computedSPD: 3,
    currentHP: 8,
    currentShield: 0,
    hiddenRage: 0,
    hitsDealt: 0,
    skills: {
      basic: { name: 'Bite', type: 'basic_attack', damage: 'ATK' },
      utility: { name: 'Howl', type: 'utility', shield: 1 },
      ultimate: { name: 'Pack Frenzy', type: 'ultimate', damage: 8, unlockCondition: 'hits>=2', usesRemaining: 1 },
    },
    equippedRelics: [],
    relicSlotsUsed: 0,
    relicSlotsMax: 10,
  };

  const cardC2: Card = { ...cardC1 };

  it('can fuse two cards with same ID and same tier', () => {
    expect(canFuse(cardC1, cardC2)).toBe(true);
  });

  it('cannot fuse cards with different IDs or tiers', () => {
    const diffId = { ...cardC2, id: 'fire_fox' };
    const diffTier = { ...cardC2, tierLevel: 1 as const, tier: 'UC' as const };
    expect(canFuse(cardC1, diffId)).toBe(false);
    expect(canFuse(cardC1, diffTier)).toBe(false);
  });

  it('fuses C + C into UC with updated stats', () => {
    const result = fuseCards(cardC1, cardC2);
    expect(result.success).toBe(true);
    expect(result.fusedCard?.tier).toBe('UC');
    expect(result.fusedCard?.tierLevel).toBe(1);
    expect(result.fusedCard?.computedHP).toBe(Math.round(8 * 1.40));
    expect(result.fusedCard?.computedSPD).toBe(3 + 1); // Speed +1 for UC
  });

  it('unlocks secondary bonus effect on utility skill when reaching SSR (tierLevel 4)', () => {
    const cardSR1: Card = { ...cardC1, tier: 'SR', tierLevel: 3 };
    const cardSR2: Card = { ...cardC1, tier: 'SR', tierLevel: 3 };

    const result = fuseCards(cardSR1, cardSR2);
    expect(result.success).toBe(true);
    expect(result.fusedCard?.tier).toBe('SSR');
    expect(result.fusedCard?.tierLevel).toBe(4);
    expect(result.fusedCard?.skills.utility.tierBonusEffect).toBe('cleanse_1_debuff');
  });
});
