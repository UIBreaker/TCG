/**
 * Calculates relic effect scaling according to Section 7.3:
 * EffectValue(stackCount) = baseEffect * (1 + 0.8 * (stackCount - 1))
 *
 * Examples:
 * Stack 1 = 100% (baseEffect * 1.0)
 * Stack 2 = 180% (baseEffect * 1.8)
 * Stack 3 = 260% (baseEffect * 2.6)
 * Stack 5 = 420% (baseEffect * 4.2)
 */
export function calculateRelicEffectValue(baseEffect: number, stackCount: number): number {
  const safeStack = Math.max(1, Math.min(5, Math.floor(stackCount)));
  const scaled = baseEffect * (1 + 0.8 * (safeStack - 1));
  // Round to 2 decimal places to avoid IEEE float inaccuracy
  return Math.round(scaled * 100) / 100;
}
