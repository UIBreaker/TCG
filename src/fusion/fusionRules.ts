import { Card } from '../models/card';
import { TierLevel, getTierByLevel } from '../models/tier';
import { computeCardTierStats, getNextTierLevel } from './tierScaling';

export interface FusionResult {
  success: boolean;
  fusedCard?: Card;
  reason?: string;
}

export function canFuse(cardA: Card, cardB: Card): boolean {
  if (cardA.id !== cardB.id) return false;
  if (cardA.tierLevel !== cardB.tierLevel) return false;
  if (cardA.tierLevel >= 7) return false; // TR (level 7) is max tier
  return true;
}

export function fuseCards(cardA: Card, cardB: Card): FusionResult {
  if (!canFuse(cardA, cardB)) {
    return {
      success: false,
      reason: 'Cards must have the same ID, same Tier, and be below maximum Tier (TR).',
    };
  }

  const nextLevel = getNextTierLevel(cardA.tierLevel);
  if (nextLevel === null) {
    return { success: false, reason: 'Already at maximum tier.' };
  }

  const nextTierInfo = getTierByLevel(nextLevel);
  const newStats = computeCardTierStats(cardA.baseHP, cardA.baseATK, cardA.baseSPD, nextLevel);

  // Deep clone skill 2 and apply SSR+ tierBonusEffect if reached
  const updatedUtility = { ...cardA.skills.utility };
  if (nextLevel >= 4 && !updatedUtility.tierBonusEffect) {
    updatedUtility.tierBonusEffect = 'cleanse_1_debuff';
  }

  // Preserve relics from cardA, return cardB relics to bag (handled by caller)
  const fusedCard: Card = {
    ...cardA,
    tier: nextTierInfo.code,
    tierLevel: nextLevel,
    computedHP: newStats.computedHP,
    computedATK: newStats.computedATK,
    computedSPD: newStats.computedSPD,
    computedDEF: newStats.computedDEF,
    currentHP: newStats.computedHP, // Reset to full max HP on fusion
    currentShield: 0,
    skills: {
      ...cardA.skills,
      utility: updatedUtility,
    },
    fusionResult: nextLevel < 7 ? `tier_up_to_${getTierByLevel((nextLevel + 1) as TierLevel).code}` : undefined,
  };

  return { success: true, fusedCard };
}
