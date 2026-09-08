import { describe, it, expect } from 'vitest';
import { calculateTierStat, computeCardTierStats } from '../fusion/tierScaling';
import { canFuse, fuseCards } from '../fusion/fusionRules';
import { SAMPLE_EMBERCLAW_WYRM } from '../data/sampleCard';
import { Card } from '../models/card';

describe('Tier Stat Scaling', () => {
  it('should scale stats according to progressive tier multipliers', () => {
    // Multipliers: [1.00, 1.10, 1.22, 1.37, 1.55, 1.78, 2.05, 2.40]
    expect(calculateTierStat(10, 0)).toBe(10); // C
    expect(calculateTierStat(10, 1)).toBe(11); // UC
    expect(calculateTierStat(10, 2)).toBe(12); // R
    expect(calculateTierStat(10, 3)).toBe(14); // SR (13.7 -> 14)
    expect(calculateTierStat(10, 4)).toBe(16); // SSR (15.5 -> 16)
    expect(calculateTierStat(10, 5)).toBe(18); // UR (17.8 -> 18)
    expect(calculateTierStat(10, 6)).toBe(21); // MR (20.5 -> 21)
    expect(calculateTierStat(10, 7)).toBe(24); // TR (24.0 -> 24)
  });

  it('correctly matches sample fixture emberclaw_wyrm stats', () => {
    const computed = computeCardTierStats(
      SAMPLE_EMBERCLAW_WYRM.baseHP,
      SAMPLE_EMBERCLAW_WYRM.baseATK,
      SAMPLE_EMBERCLAW_WYRM.baseSPD,
      SAMPLE_EMBERCLAW_WYRM.tierLevel
    );

    expect(computed.computedHP).toBe(16);
    expect(computed.computedATK).toBe(5);
    // CRITICAL: SPD must remain unchanged by tier!
    expect(computed.computedSPD).toBe(4);
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
    expect(result.fusedCard?.computedHP).toBe(Math.round(8 * 1.10));
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
