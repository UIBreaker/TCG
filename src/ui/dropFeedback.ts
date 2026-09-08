export interface DropVFXSpec {
  outcome: 'accepted' | 'rejected';
  shakeAmount?: number;
  bounceDurationMs?: number;
  rejectShakeAmount?: number;
}

/**
 * Calculates drop impact feedback on the board according to Section 12.2 & 12.4:
 * - Accepted: impact bounce duration 380ms, shakeAmount proportional to Tier: 2 + tierLevel * 0.5 (px).
 * - Rejected: card returns to hand with horizontal shake (+/- 4px), no board shake.
 */
export function resolveDropFeedback(
  isValidSlot: boolean,
  tierLevel: number = 0
): DropVFXSpec {
  if (!isValidSlot) {
    return {
      outcome: 'rejected',
      shakeAmount: 0,
      rejectShakeAmount: 4,
    };
  }

  const safeTier = Math.max(0, Math.min(7, Math.floor(tierLevel)));
  const shakeAmount = 2 + safeTier * 0.5;

  return {
    outcome: 'accepted',
    bounceDurationMs: 380,
    shakeAmount,
  };
}
