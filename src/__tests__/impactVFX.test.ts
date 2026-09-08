import { describe, it, expect } from 'vitest';
import { resolveImpactVFX } from '../combat/impactVFX';
import { DamageResult } from '../combat/damage';

describe('resolveImpactVFX', () => {
  const defenderMaxHP = 10;

  it('generates 1 blocked phase when Shield absorbs all damage', () => {
    const damageResult: DamageResult = {
      rawDamage: 3,
      decayedDamage: 3,
      shieldAbsorbed: 3,
      hpDamage: 0,
      defenderRemainingHP: 10,
      defenderRemainingShield: 1,
      isBlockedByFrontline: false,
      isCrit: false,
      distance: 0,
    };

    const vfx = resolveImpactVFX(damageResult, defenderMaxHP);

    expect(vfx.phases.length).toBe(1);
    expect(vfx.phases[0].type).toBe('blocked');
    expect(vfx.phases[0].displayText).toBe('BLOCKED -3');
    expect(vfx.phases[0].shakeAmount).toBe(0);
    expect(vfx.hasScreenShake).toBe(false);
    expect(vfx.hasShieldCrack).toBe(true);
    expect(vfx.hasShieldShatter).toBe(false);
  });

  it('generates 2 distinct phases on Shield Break with 120ms delay on HP phase', () => {
    const damageResult: DamageResult = {
      rawDamage: 5,
      decayedDamage: 5,
      shieldAbsorbed: 2,
      hpDamage: 3,
      defenderRemainingHP: 7,
      defenderRemainingShield: 0,
      isBlockedByFrontline: false,
      isCrit: false,
      distance: 0,
    };

    const vfx = resolveImpactVFX(damageResult, defenderMaxHP);

    expect(vfx.phases.length).toBe(2);
    // Phase 1: Shield absorbed
    expect(vfx.phases[0].type).toBe('blocked');
    expect(vfx.phases[0].amount).toBe(2);
    expect(vfx.phases[0].delayMs).toBe(0);
    expect(vfx.phases[0].displayText).toBe('-2 (shield)');

    // Phase 2: Remainder into HP
    expect(vfx.phases[1].type).toBe('hp');
    expect(vfx.phases[1].amount).toBe(3);
    expect(vfx.phases[1].delayMs).toBe(120);
    expect(vfx.phases[1].displayText).toBe('-3 (hp)');

    expect(vfx.hasShieldShatter).toBe(true);
  });

  it('calculates dynamic pop height and font scale for unshielded hit', () => {
    // 2 damage on 10 max HP -> impactRatio = 0.2
    // popHeight = 20 + 0.2 * 40 = 28
    // fontScale = 1.0 + 0.2 * 0.6 = 1.12
    // shakeAmount = 0.2 * 6 = 1.2
    const damageResult: DamageResult = {
      rawDamage: 2,
      decayedDamage: 2,
      shieldAbsorbed: 0,
      hpDamage: 2,
      defenderRemainingHP: 8,
      defenderRemainingShield: 0,
      isBlockedByFrontline: false,
      isCrit: false,
      distance: 0,
    };

    const vfx = resolveImpactVFX(damageResult, defenderMaxHP);

    expect(vfx.phases.length).toBe(1);
    expect(vfx.phases[0].popHeight).toBeCloseTo(28, 1);
    expect(vfx.phases[0].fontScale).toBeCloseTo(1.12, 2);
    expect(vfx.phases[0].shakeAmount).toBeCloseTo(1.2, 1);
    expect(vfx.hasScreenShake).toBe(false);
  });

  it('triggers critical screen shake (150ms) when impactRatio >= 0.5', () => {
    // 6 damage on 10 max HP -> impactRatio = 0.6 >= 0.5
    const damageResult: DamageResult = {
      rawDamage: 6,
      decayedDamage: 6,
      shieldAbsorbed: 0,
      hpDamage: 6,
      defenderRemainingHP: 4,
      defenderRemainingShield: 0,
      isBlockedByFrontline: false,
      isCrit: false,
      distance: 0,
    };

    const vfx = resolveImpactVFX(damageResult, defenderMaxHP);

    expect(vfx.phases.length).toBe(1);
    expect(vfx.phases[0].type).toBe('critical');
    expect(vfx.hasScreenShake).toBe(true);
    expect(vfx.screenShakeDurationMs).toBe(150);
  });
});
