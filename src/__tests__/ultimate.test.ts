import { describe, it, expect } from 'vitest';
import { checkUltimateUnlock, recordAttackAction, executeUltimate } from '../combat/ultimate';
import { Card } from '../models/card';

describe('checkUltimateUnlock & Ultimate execution', () => {
  const baseCard: Card = {
    id: 'test_mage',
    name: 'Test Mage',
    tier: 'C',
    tierLevel: 0,
    baseHP: 10,
    baseATK: 2,
    baseSPD: 2,
    computedHP: 10,
    computedATK: 2,
    computedSPD: 2,
    currentHP: 10,
    currentShield: 0,
    hiddenRage: 0,
    hitsDealt: 0,
    skills: {
      basic: { name: 'Zap', type: 'basic_attack', damage: 'ATK' },
      utility: { name: 'Barrier', type: 'utility', shield: 2 },
      ultimate: { name: 'Meteor', type: 'ultimate', damage: 10, unlockCondition: 'hits>=2 OR hp<50% OR rage>=3', usesRemaining: 1 },
    },
    equippedRelics: [],
    relicSlotsUsed: 0,
    relicSlotsMax: 10,
  };

  it('starts locked when no conditions are met', () => {
    expect(checkUltimateUnlock(baseCard)).toBe(false);
  });

  it('unlocks when hitsDealt >= 2', () => {
    const card = { ...baseCard, hitsDealt: 2 };
    expect(checkUltimateUnlock(card)).toBe(true);
  });

  it('unlocks when HP is below 50%', () => {
    const card = { ...baseCard, currentHP: 4 }; // 4/10 < 0.5
    expect(checkUltimateUnlock(card)).toBe(true);
  });

  it('unlocks via Hidden Rage counter (>= 3) even if hits < 2 and HP >= 50%', () => {
    const card = { ...baseCard, hiddenRage: 3, hitsDealt: 1, currentHP: 10 };
    expect(checkUltimateUnlock(card)).toBe(true);
  });

  it('increments hitsDealt and hiddenRage on recordAttackAction', () => {
    let card = baseCard;
    card = recordAttackAction(card);
    expect(card.hitsDealt).toBe(1);
    expect(card.hiddenRage).toBe(1);

    card = recordAttackAction(card);
    expect(card.hitsDealt).toBe(2);
    expect(card.hiddenRage).toBe(2);
    expect(checkUltimateUnlock(card)).toBe(true);
  });

  it('consumes usesRemaining when ultimate is executed and cannot be used again', () => {
    const readyCard = { ...baseCard, hitsDealt: 2 };
    const { card: usedCard, success } = executeUltimate(readyCard);

    expect(success).toBe(true);
    expect(usedCard.skills.ultimate.usesRemaining).toBe(0);

    // Cannot use again
    expect(checkUltimateUnlock(usedCard)).toBe(false);
    const retry = executeUltimate(usedCard);
    expect(retry.success).toBe(false);
  });
});
