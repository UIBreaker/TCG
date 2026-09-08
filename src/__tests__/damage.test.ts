import { describe, it, expect } from 'vitest';
import { calculateDamage } from '../combat/damage';
import { Card } from '../models/card';

describe('calculateDamage', () => {
  const attacker: Card = {
    id: 'attacker_1',
    name: 'Attacker',
    tier: 'C',
    tierLevel: 0,
    baseHP: 10,
    baseATK: 3,
    baseSPD: 3,
    computedHP: 10,
    computedATK: 3,
    computedSPD: 3,
    currentHP: 10,
    currentShield: 0,
    hiddenRage: 0,
    hitsDealt: 0,
    skills: {
      basic: { name: 'Strike', type: 'basic_attack', damage: 'ATK' },
      utility: { name: 'Guard', type: 'utility', shield: 2 },
      ultimate: { name: 'Blast', type: 'ultimate', damage: 6, unlockCondition: 'hits>=2', usesRemaining: 1 },
    },
    equippedRelics: [],
    relicSlotsUsed: 0,
    relicSlotsMax: 10,
  };

  const defender: Card = {
    id: 'defender_1',
    name: 'Defender',
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
      basic: { name: 'Strike', type: 'basic_attack', damage: 'ATK' },
      utility: { name: 'Guard', type: 'utility', shield: 2 },
      ultimate: { name: 'Blast', type: 'ultimate', damage: 6, unlockCondition: 'hits>=2', usesRemaining: 1 },
    },
    equippedRelics: [],
    relicSlotsUsed: 0,
    relicSlotsMax: 10,
  };

  it('deals full damage when distance is 0 or 1', () => {
    const resDist0 = calculateDamage(attacker, defender, 0);
    expect(resDist0.rawDamage).toBe(3);
    expect(resDist0.decayedDamage).toBe(3);
    expect(resDist0.hpDamage).toBe(3);
    expect(resDist0.defenderRemainingHP).toBe(7);

    const resDist1 = calculateDamage(attacker, defender, 1);
    expect(resDist1.decayedDamage).toBe(3);
    expect(resDist1.hpDamage).toBe(3);
  });

  it('reduces damage by 12% when distance >= 2', () => {
    // raw = 5, distance = 2 -> 5 * 0.88 = 4.4 -> floor = 4
    const strongAttacker: Card = { ...attacker, computedATK: 5 };
    const resDist2 = calculateDamage(strongAttacker, defender, 2);

    expect(resDist2.rawDamage).toBe(5);
    expect(resDist2.decayedDamage).toBeCloseTo(4.4, 2);
    expect(resDist2.hpDamage).toBe(4);
    expect(resDist2.defenderRemainingHP).toBe(6);
  });

  it('absorbs all damage when Shield is sufficient', () => {
    const shieldedDefender: Card = { ...defender, currentShield: 4 };
    const res = calculateDamage(attacker, shieldedDefender, 0);

    expect(res.shieldAbsorbed).toBe(3);
    expect(res.hpDamage).toBe(0);
    expect(res.defenderRemainingShield).toBe(1);
    expect(res.defenderRemainingHP).toBe(10);
  });

  it('breaks Shield and deals leftover damage to HP when Shield is insufficient', () => {
    const shieldedDefender: Card = { ...defender, currentShield: 2 };
    const res = calculateDamage(attacker, shieldedDefender, 0);

    expect(res.shieldAbsorbed).toBe(2);
    expect(res.hpDamage).toBe(1);
    expect(res.defenderRemainingShield).toBe(0);
    expect(res.defenderRemainingHP).toBe(9);
  });

  it('is completely blocked when Frontline block is active', () => {
    const res = calculateDamage(attacker, defender, 0, { hasFrontlineBlock: true });

    expect(res.isBlockedByFrontline).toBe(true);
    expect(res.hpDamage).toBe(0);
    expect(res.defenderRemainingHP).toBe(10);
  });

  it('pierces through Frontline block when isPiercing is true', () => {
    const res = calculateDamage(attacker, defender, 0, { hasFrontlineBlock: true, isPiercing: true });

    expect(res.isBlockedByFrontline).toBe(false);
    expect(res.hpDamage).toBe(3);
    expect(res.defenderRemainingHP).toBe(7);
  });
});
