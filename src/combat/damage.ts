import { Card } from '../models/card';

export interface DamageOptions {
  distance?: number; // column distance (0, 1, 2)
  isPiercing?: boolean;
  hasFrontlineBlock?: boolean;
  baseDamage?: number;
  isCrit?: boolean;
}

export interface DamageResult {
  rawDamage: number;
  decayedDamage: number;
  shieldAbsorbed: number;
  hpDamage: number;
  defenderRemainingHP: number;
  defenderRemainingShield: number;
  isBlockedByFrontline: boolean;
  isCrit: boolean;
  distance: number;
}

/**
 * Calculates tactical combat damage following Section 3 & 8 specifications:
 * - Frontline blocks melee attacks against Backline in same column (unless piercing).
 * - Target distance >= 2 columns decays damage by 12% (x 0.88).
 * - Decay applies before subtracting Shield.
 * - Rounding down (Math.floor) occurs at the final step.
 */
export function calculateDamage(
  attacker: Card,
  defender: Card,
  distance: number = 0,
  options?: DamageOptions
): DamageResult {
  // 1. Frontline block check
  const isBlocked = !!options?.hasFrontlineBlock && !options?.isPiercing;
  if (isBlocked) {
    return {
      rawDamage: 0,
      decayedDamage: 0,
      shieldAbsorbed: 0,
      hpDamage: 0,
      defenderRemainingHP: defender.currentHP,
      defenderRemainingShield: defender.currentShield,
      isBlockedByFrontline: true,
      isCrit: false,
      distance,
    };
  }

  // 2. Base raw damage (default to attacker computedATK, or custom baseDamage)
  let raw = options?.baseDamage ?? attacker.computedATK;
  if (options?.isCrit) {
    raw = Math.round(raw * 1.5);
  }

  // 3. Distance decay: distance >= 2 decays by 12%
  const decayed = distance >= 2 ? raw * 0.88 : raw;

  // 4. Shield absorption
  let shieldAbsorbed = 0;
  let excessDamage = decayed;
  let remainingShield = defender.currentShield;

  if (defender.currentShield > 0) {
    if (decayed <= defender.currentShield) {
      shieldAbsorbed = Math.floor(decayed);
      remainingShield = defender.currentShield - shieldAbsorbed;
      excessDamage = 0;
    } else {
      shieldAbsorbed = defender.currentShield;
      remainingShield = 0;
      excessDamage = decayed - shieldAbsorbed;
    }
  }

  // 5. HP damage: floor at the final step
  const hpDamage = Math.max(0, Math.floor(excessDamage));
  const remainingHP = Math.max(0, defender.currentHP - hpDamage);

  return {
    rawDamage: raw,
    decayedDamage: decayed,
    shieldAbsorbed,
    hpDamage,
    defenderRemainingHP: remainingHP,
    defenderRemainingShield: remainingShield,
    isBlockedByFrontline: false,
    isCrit: !!options?.isCrit,
    distance,
  };
}
