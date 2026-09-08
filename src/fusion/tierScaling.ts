import {
  TierLevel,
  TIER_MULTIPLIERS,
  TIER_SPEED_BONUS,
  TIER_DEFENSE_BONUS,
  TIER_PASSIVE_MULTIPLIERS,
  getTierByLevel,
  TierCode,
} from '../models/tier';

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
 * Computes stats for a card based on tier.
 * HP and ATK scale by the progressive tier multiplier.
 * SPD increases progressively with each tier (giving higher tier cards turn priority!).
 * DEF provides innate natural armor for higher tiers.
 */
export function computeCardTierStats(
  baseHP: number,
  baseATK: number,
  baseSPD: number,
  tierLevel: TierLevel
): { computedHP: number; computedATK: number; computedSPD: number; computedDEF: number } {
  const clampedLevel = Math.max(0, Math.min(7, Math.floor(tierLevel))) as TierLevel;
  return {
    computedHP: calculateTierStat(baseHP, clampedLevel),
    computedATK: calculateTierStat(baseATK, clampedLevel),
    computedSPD: baseSPD + (TIER_SPEED_BONUS[clampedLevel] ?? 0),
    computedDEF: TIER_DEFENSE_BONUS[clampedLevel] ?? 0,
  };
}

/**
 * Computes skill utility / damage / shield scaled by tier.
 */
export function calculateTierSkillDamage(baseDmg: number, tierLevel: number): number {
  const clampedLevel = Math.max(0, Math.min(7, Math.floor(tierLevel))) as TierLevel;
  const multiplier = TIER_MULTIPLIERS[clampedLevel];
  return Math.max(1, Math.round(baseDmg * multiplier));
}

/**
 * Computes Ultimate (Tuyệt Kỹ) damage scaled by tier.
 */
export function calculateTierUltimateDamage(baseUltDmg: number, tierLevel: number): number {
  const clampedLevel = Math.max(0, Math.min(7, Math.floor(tierLevel))) as TierLevel;
  const multiplier = TIER_MULTIPLIERS[clampedLevel];
  return Math.max(8, Math.round(baseUltDmg * multiplier));
}

/**
 * Gets the passive efficiency multiplier for a given tier.
 */
export function getTierPassiveMultiplier(tierLevel: number): number {
  const clampedLevel = Math.max(0, Math.min(7, Math.floor(tierLevel))) as TierLevel;
  return TIER_PASSIVE_MULTIPLIERS[clampedLevel] ?? 1.0;
}

/**
 * Helper to get next tier code and info if eligible for fusion.
 */
export function getNextTierLevel(currentLevel: TierLevel): TierLevel | null {
  if (currentLevel >= 7) return null;
  return (currentLevel + 1) as TierLevel;
}

