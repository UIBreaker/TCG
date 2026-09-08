import { StatModifier } from '../models/card';

export interface DisplayedStat {
  finalValue: number;
  delta: number | null;
  deltaType: 'buff' | 'debuff' | null;
  displayText: string;
}

/**
 * Calculates displayed stat with in-place delta indicators.
 * Follows Section 11.2 & 11.3:
 * - Green for positive delta (+X), Red for negative delta (-X).
 * - Modifiers of the same stat are aggregated into a single delta.
 * - If no active modifiers, returns delta: null and standard base string.
 */
export function getDisplayedStatValue(
  baseValue: number,
  activeModifiers: StatModifier[] = []
): DisplayedStat {
  if (activeModifiers.length === 0) {
    return {
      finalValue: baseValue,
      delta: null,
      deltaType: null,
      displayText: `${baseValue}`,
    };
  }

  const totalDelta = activeModifiers.reduce((acc, mod) => acc + mod.amount, 0);

  if (totalDelta === 0) {
    return {
      finalValue: baseValue,
      delta: null,
      deltaType: null,
      displayText: `${baseValue}`,
    };
  }

  const finalValue = Math.max(0, baseValue + totalDelta);
  const deltaType: 'buff' | 'debuff' = totalDelta > 0 ? 'buff' : 'debuff';
  const deltaSign = totalDelta > 0 ? `+${totalDelta}` : `${totalDelta}`;

  return {
    finalValue,
    delta: totalDelta,
    deltaType,
    displayText: `${baseValue} ${deltaSign}`,
  };
}
