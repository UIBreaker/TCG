import { describe, it, expect } from 'vitest';
import { calculateRelicEffectValue } from '../relics/relicScaling';
import { equipRelicToCard, unequipRelicFromCard } from '../relics/relicEquip';
import { mergeRelics } from '../relics/relicMerge';
import { SAMPLE_EMBERCLAW_WYRM } from '../data/sampleCard';
import { RelicInstance } from '../models/relic';

describe('Relic Scaling Formula', () => {
  it('correctly calculates diminishing return values per stack', () => {
    // Formula: baseEffect * (1 + 0.8 * (stackCount - 1))
    const base = 10;
    expect(calculateRelicEffectValue(base, 1)).toBe(10); // 10 * 1.0 = 10
    expect(calculateRelicEffectValue(base, 2)).toBe(18); // 10 * 1.8 = 18
    expect(calculateRelicEffectValue(base, 3)).toBe(26); // 10 * 2.6 = 26
    expect(calculateRelicEffectValue(base, 5)).toBe(42); // 10 * 4.2 = 42
  });

  it('matches sample fixture ember_core stackCount=3 scaling', () => {
    const baseEffect = 5;
    // Section 10: ember_core stackCount=3 must yield baseEffect * 2.6
    expect(calculateRelicEffectValue(baseEffect, 3)).toBe(13); // 5 * 2.6 = 13
  });
});

describe('Relic Equip & Unequip on Card', () => {
  it('equips a 4th unique relic onto emberclaw_wyrm (has 3/10 slots)', () => {
    const newRelic: RelicInstance = {
      relicId: 'wind_feather',
      effectCategory: 'speed',
      name: 'Wind Feather',
      description: '+SPD',
      baseEffect: 2,
    };

    const result = equipRelicToCard(SAMPLE_EMBERCLAW_WYRM, newRelic);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.card.equippedRelics.length).toBe(4);
      expect(result.card.relicSlotsUsed).toBe(4);
      const equipped = result.card.equippedRelics.find(r => r.relicId === 'wind_feather');
      expect(equipped?.stackCount).toBe(1);
    }
  });

  it('stacks an existing relic up to max 5 without using additional slots', () => {
    const swiftString: RelicInstance = {
      relicId: 'swift_string',
      effectCategory: 'speed',
      name: 'Swift String',
      description: '+SPD',
      baseEffect: 1,
    };

    // SAMPLE_EMBERCLAW_WYRM has swift_string at stackCount: 1
    let currentCard = SAMPLE_EMBERCLAW_WYRM;

    // Stack 2
    let res = equipRelicToCard(currentCard, swiftString);
    expect(res.success).toBe(true);
    if (res.success) currentCard = res.card;
    expect(currentCard.equippedRelics.find(r => r.relicId === 'swift_string')?.stackCount).toBe(2);
    expect(currentCard.relicSlotsUsed).toBe(3); // Still 3 unique slots!

    // Stack 3, 4, 5
    for (let i = 3; i <= 5; i++) {
      res = equipRelicToCard(currentCard, swiftString);
      expect(res.success).toBe(true);
      if (res.success) currentCard = res.card;
      expect(currentCard.equippedRelics.find(r => r.relicId === 'swift_string')?.stackCount).toBe(i);
    }

    // Stack 6 -> should fail with MAX_STACK_REACHED
    const overflowRes = equipRelicToCard(currentCard, swiftString);
    expect(overflowRes.success).toBe(false);
    if (!overflowRes.success) {
      expect(overflowRes.reason).toBe('MAX_STACK_REACHED');
    }
  });

  it('fails with MAX_SLOTS_REACHED when attempting to equip an 11th unique relic', () => {
    // Build a card that already has 10 unique relics
    const fullCard = {
      ...SAMPLE_EMBERCLAW_WYRM,
      equippedRelics: Array.from({ length: 10 }, (_, i) => ({
        relicId: `relic_${i}`,
        stackCount: 1,
      })),
      relicSlotsUsed: 10,
    };

    const newRelic: RelicInstance = {
      relicId: 'relic_11',
      effectCategory: 'power',
      name: 'Eleventh Relic',
      description: 'Over limit',
      baseEffect: 1,
    };

    const res = equipRelicToCard(fullCard, newRelic);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.reason).toBe('MAX_SLOTS_REACHED');
    }
  });

  it('blocks unequipping during combat', () => {
    const res = unequipRelicFromCard(SAMPLE_EMBERCLAW_WYRM, 'ember_core', 1, true); // inCombat = true
    expect(res.success).toBe(false);
    expect(res.reason).toBe('CANNOT_UNEQUIP_IN_COMBAT');
  });

  it('allows unequipping outside combat and returns relic instances', () => {
    const res = unequipRelicFromCard(SAMPLE_EMBERCLAW_WYRM, 'ember_core', 1, false); // inCombat = false
    expect(res.success).toBe(true);
    expect(res.card.equippedRelics.find(r => r.relicId === 'ember_core')?.stackCount).toBe(2);
    expect(res.returnedInstances.length).toBe(1);
  });
});

describe('Relic Merge at Sanctuary', () => {
  it('merges two relics with matching effectCategory and applies +20% synergy bonus', () => {
    const relicA: RelicInstance = {
      relicId: 'fire_fang',
      effectCategory: 'burn',
      name: 'Nanh Lửa',
      description: 'Đốt cháy',
      baseEffect: 5,
    };

    const relicB: RelicInstance = {
      relicId: 'flame_orb',
      effectCategory: 'burn',
      name: 'Hỏa Cầu',
      description: 'Lửa địa ngục',
      baseEffect: 5,
    };

    const merged = mergeRelics(relicA, relicB);
    expect(merged).not.toBeNull();
    // (5 + 5) * 1.2 = 12
    expect(merged?.baseEffect).toBe(12);
    expect(merged?.effectCategory).toBe('burn');
  });

  it('returns null when attempting to merge relics from different categories', () => {
    const relicA: RelicInstance = {
      relicId: 'fire_fang',
      effectCategory: 'burn',
      name: 'Nanh Lửa',
      description: 'Đốt cháy',
      baseEffect: 5,
    };

    const relicB: RelicInstance = {
      relicId: 'water_drop',
      effectCategory: 'heal',
      name: 'Giọt Nước Cổ',
      description: 'Hồi máu',
      baseEffect: 4,
    };

    const merged = mergeRelics(relicA, relicB);
    expect(merged).toBeNull();
  });
});
