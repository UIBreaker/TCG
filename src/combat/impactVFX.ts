import { DamageResult } from './damage';

export interface ImpactPhase {
  amount: number;
  type: 'blocked' | 'hp' | 'critical';
  popHeight: number;
  fontScale: number;
  shakeAmount: number;
  delayMs: number;
  displayText: string;
}

export interface ImpactVFXSpec {
  phases: ImpactPhase[];
  hasScreenShake: boolean;
  screenShakeDurationMs: number;
  hasShieldShatter: boolean;
  hasShieldCrack: boolean;
}

/**
 * Pure data-driven calculation of visual impact VFX and damage number pops.
 * Follows Section 9 specifications:
 * - impactRatio = damageDealt / defenderMaxHP
 * - popHeight = 20 + impactRatio * 40 (px)
 * - fontScale = 1.0 + impactRatio * 0.6
 * - shakeAmount = impactRatio * 6 (px)
 * - Critical if impactRatio >= 0.5 (triggers screen shake 150ms)
 * - Shield Break creates two distinct phases (Phase 1: absorbed shield, Phase 2: HP loss with 120ms delay).
 * - Never combines shield and HP damage into a single number!
 */
export function resolveImpactVFX(
  damageResult: DamageResult,
  defenderMaxHP: number
): ImpactVFXSpec {
  const safeMaxHP = Math.max(1, defenderMaxHP);

  // If completely blocked by Frontline
  if (damageResult.isBlockedByFrontline) {
    return {
      phases: [
        {
          amount: 0,
          type: 'blocked',
          popHeight: 20,
          fontScale: 1.0,
          shakeAmount: 0,
          delayMs: 0,
          displayText: 'BLOCKED (Vanguard)',
        },
      ],
      hasScreenShake: false,
      screenShakeDurationMs: 0,
      hasShieldShatter: false,
      hasShieldCrack: false,
    };
  }

  const hpDamage = damageResult.hpDamage;
  const shieldAbsorbed = damageResult.shieldAbsorbed;
  const impactRatio = hpDamage / safeMaxHP;
  const isCritical = impactRatio >= 0.5 || damageResult.isCrit;

  const popHeight = 20 + impactRatio * 40;
  const fontScale = 1.0 + impactRatio * 0.6;
  const shakeAmount = impactRatio * 6;

  const phases: ImpactPhase[] = [];

  // Case 1: Shield absorbed ALL damage (No HP damage)
  if (shieldAbsorbed > 0 && hpDamage === 0) {
    phases.push({
      amount: shieldAbsorbed,
      type: 'blocked',
      popHeight: 20,
      fontScale: 1.0,
      shakeAmount: 0,
      delayMs: 0,
      displayText: `BLOCKED -${shieldAbsorbed}`,
    });

    return {
      phases,
      hasScreenShake: false,
      screenShakeDurationMs: 0,
      hasShieldShatter: false,
      hasShieldCrack: true,
    };
  }

  // Case 2: Shield Break (Shield absorbed part, HP took the rest in 2 sequential phases)
  if (shieldAbsorbed > 0 && hpDamage > 0) {
    // Phase 1: Absorbed by Shield
    phases.push({
      amount: shieldAbsorbed,
      type: 'blocked',
      popHeight: 20,
      fontScale: 1.0,
      shakeAmount: 0,
      delayMs: 0,
      displayText: `-${shieldAbsorbed} (shield)`,
    });

    // Phase 2: Remainder strikes HP directly after 120ms
    phases.push({
      amount: hpDamage,
      type: isCritical ? 'critical' : 'hp',
      popHeight,
      fontScale,
      shakeAmount,
      delayMs: 120,
      displayText: `-${hpDamage} (hp)`,
    });

    return {
      phases,
      hasScreenShake: isCritical,
      screenShakeDurationMs: isCritical ? 150 : 0,
      hasShieldShatter: true,
      hasShieldCrack: true,
    };
  }

  // Case 3: Straight damage to HP (No shield active)
  phases.push({
    amount: hpDamage,
    type: isCritical ? 'critical' : 'hp',
    popHeight,
    fontScale,
    shakeAmount,
    delayMs: 0,
    displayText: `-${hpDamage}`,
  });

  return {
    phases,
    hasScreenShake: isCritical,
    screenShakeDurationMs: isCritical ? 150 : 0,
    hasShieldShatter: false,
    hasShieldCrack: false,
  };
}
