export interface CardTransform {
  rotateDeg: number;
  translateY: number;
  scale: number;
}

/**
 * Calculates card transform in hand according to Section 12.1 & 12.4:
 * - Idle: fan arc with cards tilting outward up to +/- 8deg and shifting down 6px.
 * - Hovered: lifts up (translateY: -14px), scales to 1.08, resets rotation to 0deg for readability.
 * - Dragging: tilts according to drag velocity, clamped to +/- 6deg.
 */
export function getHandCardTransform(
  cardIndex: number,
  handSize: number,
  state: 'idle' | 'hovered' | 'dragging',
  dragVelocity: number = 0
): CardTransform {
  if (state === 'hovered') {
    return {
      rotateDeg: 0,
      translateY: -14,
      scale: 1.08,
    };
  }

  if (state === 'dragging') {
    // Tilt follows drag velocity, clamped to [-6, 6] deg
    const clampedTilt = Math.max(-6, Math.min(6, dragVelocity * 0.5));
    return {
      rotateDeg: clampedTilt,
      translateY: -20,
      scale: 1.1,
    };
  }

  // Idle fan arc
  if (handSize <= 1) {
    return { rotateDeg: 0, translateY: 0, scale: 1.0 };
  }

  const centerIndex = (handSize - 1) / 2;
  const offsetFromCenter = cardIndex - centerIndex; // negative for left, positive for right, 0 for middle
  const normalizedOffset = centerIndex > 0 ? offsetFromCenter / centerIndex : 0;

  // Max +/- 8 deg rotation
  const rotateDeg = Math.round(normalizedOffset * 8 * 10) / 10;
  // Shifts down slightly as distance from center increases, up to 6px
  const translateY = Math.round(Math.abs(normalizedOffset) * 6 * 10) / 10;

  return {
    rotateDeg,
    translateY,
    scale: 1.0,
  };
}
