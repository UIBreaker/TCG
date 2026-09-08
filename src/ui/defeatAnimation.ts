export interface DefeatVFXSpec {
  preShakeMs: number;
  fallDurationMs: number;
  staggerDelayMs: number;
  shakeAmplitudeMultiplier: number;
}

/**
 * Calculates card defeat animation spec according to Section 12.3 & 12.4:
 * - Basic/Utility: default 500ms fall duration, 0ms pre-shake.
 * - Ultimate: 120ms pre-shake with 1.5x amplitude before falling.
 * - Chest trap: staggered fall with 80ms delay per index to prevent stiff simultaneous animations.
 */
export function resolveDefeatAnimation(
  cause: 'basic_attack' | 'utility' | 'ultimate' | 'chest_trap',
  staggerIndex: number = 0
): DefeatVFXSpec {
  const fallDurationMs = 500;

  if (cause === 'ultimate') {
    return {
      preShakeMs: 120,
      fallDurationMs,
      staggerDelayMs: 0,
      shakeAmplitudeMultiplier: 1.5,
    };
  }

  if (cause === 'chest_trap') {
    return {
      preShakeMs: 0,
      fallDurationMs,
      staggerDelayMs: Math.max(0, staggerIndex) * 80,
      shakeAmplitudeMultiplier: 1.0,
    };
  }

  return {
    preShakeMs: 0,
    fallDurationMs,
    staggerDelayMs: 0,
    shakeAmplitudeMultiplier: 1.0,
  };
}
