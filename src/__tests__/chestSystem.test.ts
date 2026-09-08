import { describe, it, expect } from 'vitest';
import { resolveBruteForce, openChestWithKey } from '../rewards/chestSystem';

describe('Chest System & Brute Force RNG', () => {
  it('safely opens chest with key 100% of the time', () => {
    const result = openChestWithKey();
    expect(result.success).toBe(true);
    expect(result.isTrap).toBe(false);
    expect(result.isMimic).toBe(false);
    expect(result.goldGained).toBeGreaterThan(0);
  });

  it('correctly resolves deterministic brute force rolls', () => {
    // 1. Success without toolkit: roll 0.35 < 0.40
    const resSuccess = resolveBruteForce({ hasToolkit: false, forcedRoll: 0.35, forcedMimicRoll: 0.5 });
    expect(resSuccess.success).toBe(true);
    expect(resSuccess.isTrap).toBe(false);

    // 2. Trap without toolkit: roll 0.45 >= 0.40
    const resTrap = resolveBruteForce({ hasToolkit: false, forcedRoll: 0.45, forcedMimicRoll: 0.5 });
    expect(resTrap.success).toBe(false);
    expect(resTrap.isTrap).toBe(true);
    expect(resTrap.trapDamageToTeam).toBe(2);

    // 3. Success with toolkit on roll 0.55 (< 0.60 threshold)
    const resToolkitSuccess = resolveBruteForce({ hasToolkit: true, forcedRoll: 0.55, forcedMimicRoll: 0.5 });
    expect(resToolkitSuccess.success).toBe(true);

    // 4. Trap with toolkit on roll 0.65 (>= 0.60 threshold)
    const resToolkitTrap = resolveBruteForce({ hasToolkit: true, forcedRoll: 0.65, forcedMimicRoll: 0.5 });
    expect(resToolkitTrap.success).toBe(false);
    expect(resToolkitTrap.isTrap).toBe(true);

    // 5. Mimic trigger when mimicRoll < 0.10
    const resMimic = resolveBruteForce({ forcedMimicRoll: 0.05 });
    expect(resMimic.isMimic).toBe(true);
    expect(resMimic.success).toBe(false);
  });

  it('statistically aligns with 40% base and 60% toolkit distribution over 1,000 simulations', () => {
    const SIMULATIONS = 1000;
    let baseSuccessCount = 0;
    let toolkitSuccessCount = 0;
    let mimicCount = 0;

    for (let i = 0; i < SIMULATIONS; i++) {
      // Test base (bypass mimic to test pure brute force formula distribution)
      const resBase = resolveBruteForce({ hasToolkit: false, forcedMimicRoll: 0.99 });
      if (resBase.success) baseSuccessCount++;

      // Test toolkit
      const resToolkit = resolveBruteForce({ hasToolkit: true, forcedMimicRoll: 0.99 });
      if (resToolkit.success) toolkitSuccessCount++;

      // Test natural mimic
      const resNatural = resolveBruteForce();
      if (resNatural.isMimic) mimicCount++;
    }

    // 40% expected -> within [34%, 46%] with high statistical confidence for 1000 rolls
    expect(baseSuccessCount / SIMULATIONS).toBeGreaterThanOrEqual(0.34);
    expect(baseSuccessCount / SIMULATIONS).toBeLessThanOrEqual(0.46);

    // 60% expected -> within [54%, 66%]
    expect(toolkitSuccessCount / SIMULATIONS).toBeGreaterThanOrEqual(0.54);
    expect(toolkitSuccessCount / SIMULATIONS).toBeLessThanOrEqual(0.66);

    // 10% expected -> within [7%, 13%]
    expect(mimicCount / SIMULATIONS).toBeGreaterThanOrEqual(0.07);
    expect(mimicCount / SIMULATIONS).toBeLessThanOrEqual(0.14);
  });
});
