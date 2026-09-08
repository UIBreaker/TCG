export interface Card3DTilt {
  rotateXDeg: number;
  rotateYDeg: number;
}

/**
 * Calculates 3D tilt angles based on cursor position relative to card boundaries.
 * Follows Section 13.1 & 13.3:
 * - Center returns (0, 0).
 * - Maximum tilt is clamped to +/- 6 degrees.
 */
export function getCard3DTiltTransform(
  pointerX: number,
  pointerY: number,
  cardWidth: number,
  cardHeight: number
): Card3DTilt {
  if (cardWidth <= 0 || cardHeight <= 0) {
    return { rotateXDeg: 0, rotateYDeg: 0 };
  }

  // Normalized [-1, 1] relative to card center
  const normalizedX = (pointerX - cardWidth / 2) / (cardWidth / 2);
  const normalizedY = (pointerY - cardHeight / 2) / (cardHeight / 2);

  // Tilting up/down rotates around X axis (pointing top tilts backward -> negative rotateX)
  // Tilting left/right rotates around Y axis (pointing right tilts right -> positive rotateY)
  const rawRotateX = -normalizedY * 6;
  const rawRotateY = normalizedX * 6;

  // Clamp within [-6, 6] deg
  const rotateXDeg = Math.round(Math.max(-6, Math.min(6, rawRotateX)) * 10) / 10;
  const rotateYDeg = Math.round(Math.max(-6, Math.min(6, rawRotateY)) * 10) / 10;

  return {
    rotateXDeg: rotateXDeg === 0 ? 0 : rotateXDeg,
    rotateYDeg: rotateYDeg === 0 ? 0 : rotateYDeg,
  };
}
