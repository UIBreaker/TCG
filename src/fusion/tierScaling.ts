import { TierLevel, TIER_MULTIPLIERS, getTierByLevel, TierCode } from '../models/tier';

/**
 * Calculates a stat value scaled by the progressive tier multiplier.
 * Stat_Tier = round(Base_Stat * tierMultiplier[tier_level])
 */
export function calculateTierStat(baseStat: number, tierLevel: number): number {
  const clampedLevel = Math.max(0, Math.min(7, Math.floor(tierLevel))) as TierLevel;
  const multiplier = TIER_MULTIPLIERS[clampedLevel];
  return Math.round(baseStat * multiplier);
}

/**
 * Computes all 3 stats for a card.
 * CRITICAL RULE: Base HP and Base ATK scale by tier multiplier.
 * Speed (SPD) DOES NOT scale by tier and stays strictly equal to baseSPD!
 */
export function computeCardTierStats(
  baseHP: number,
  baseATK: number,
  baseSPD: number,
  tierLevel: TierLevel
): { computedHP: number; computedATK: number; computedSPD: number } {
  return {
    computedHP: calculateTierStat(baseHP, tierLevel),
    computedATK: calculateTierStat(baseATK, tierLevel),
    computedSPD: baseSPD, // Speed never scales with tier!
  };
}

/**
 * Helper to get next tier code and info if eligible for fusion.
 */
export function getNextTierLevel(currentLevel: TierLevel): TierLevel | null {
  if (currentLevel >= 7) return null;
  return (currentLevel + 1) as TierLevel;
}
