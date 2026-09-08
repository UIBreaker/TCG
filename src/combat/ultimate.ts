import { Card } from '../models/card';

/**
 * Checks if a card's Ultimate is unlocked and ready to use.
 * Conditions:
 * 1. Has performed >= 2 attacks (hitsDealt >= 2) OR
 * 2. Current HP is < 50% of computedHP (currentHP / computedHP < 0.5) OR
 * 3. Hidden Rage counter is >= 3 (hiddenRage >= 3)
 * AND must have usesRemaining > 0 (strictly limited to 1 use per match by default).
 */
export function checkUltimateUnlock(card: Card): boolean {
  if (card.skills.ultimate.usesRemaining <= 0) {
    return false;
  }

  const hitsCondition = card.hitsDealt >= 2;
  const lowHpCondition = card.computedHP > 0 && (card.currentHP / card.computedHP) < 0.5;
  const hiddenRageCondition = card.hiddenRage >= 3;

  return hitsCondition || lowHpCondition || hiddenRageCondition;
}

/**
 * Immutable helper: records a basic attack performed by the card.
 * Increments hitsDealt and adds +1 to Hidden Rage counter (even on miss).
 */
export function recordAttackAction(card: Card, _isHit: boolean = true): Card {
  return {
    ...card,
    hitsDealt: card.hitsDealt + 1,
    hiddenRage: card.hiddenRage + 1,
  };
}

/**
 * Immutable helper: marks the ultimate as used, decrementing usesRemaining.
 */
export function executeUltimate(card: Card): { card: Card; success: boolean; reason?: string } {
  if (!checkUltimateUnlock(card)) {
    return {
      card,
      success: false,
      reason: card.skills.ultimate.usesRemaining <= 0
        ? 'Ultimate has already been used this match.'
        : 'Ultimate unlock conditions have not been met.',
    };
  }

  const updatedCard: Card = {
    ...card,
    skills: {
      ...card.skills,
      ultimate: {
        ...card.skills.ultimate,
        usesRemaining: Math.max(0, card.skills.ultimate.usesRemaining - 1),
      },
    },
  };

  return { card: updatedCard, success: true };
}
