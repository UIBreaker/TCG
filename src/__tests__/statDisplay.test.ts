import { describe, it, expect } from 'vitest';
import { getDisplayedStatValue } from '../ui/statDisplay';
import { StatModifier } from '../models/card';

describe('getDisplayedStatValue', () => {
  it('returns standard base string without delta when there are no active modifiers', () => {
    const result = getDisplayedStatValue(5, []);
    expect(result.finalValue).toBe(5);
    expect(result.delta).toBeNull();
    expect(result.deltaType).toBeNull();
    expect(result.displayText).toBe('5');
  });

  it('displays green delta for single positive buff', () => {
    const mods: StatModifier[] = [{ statType: 'ATK', amount: 1, expiresAt: 'endOfTurn' }];
    const result = getDisplayedStatValue(5, mods);

    expect(result.finalValue).toBe(6);
    expect(result.delta).toBe(1);
    expect(result.deltaType).toBe('buff');
    expect(result.displayText).toBe('5 +1');
  });

  it('displays red delta for debuff', () => {
    const mods: StatModifier[] = [{ statType: 'SPD', amount: -2, expiresAt: 'endOfTurn' }];
    const result = getDisplayedStatValue(4, mods);

    expect(result.finalValue).toBe(2);
    expect(result.delta).toBe(-2);
    expect(result.deltaType).toBe('debuff');
    expect(result.displayText).toBe('4 -2');
  });

  it('aggregates multiple modifiers of the same stat into a single unified delta', () => {
    const mods: StatModifier[] = [
      { statType: 'ATK', amount: 3, expiresAt: 'endOfTurn' },
      { statType: 'ATK', amount: -1, expiresAt: 'endOfTurn' },
    ];
    // 3 - 1 = +2
    const result = getDisplayedStatValue(5, mods);

    expect(result.finalValue).toBe(7);
    expect(result.delta).toBe(2);
    expect(result.deltaType).toBe('buff');
    expect(result.displayText).toBe('5 +2');
  });
});
