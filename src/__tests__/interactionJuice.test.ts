import { describe, it, expect } from 'vitest';
import { getHandCardTransform } from '../ui/handInteraction';
import { resolveDropFeedback } from '../ui/dropFeedback';
import { resolveDefeatAnimation } from '../ui/defeatAnimation';

describe('Hand Card Transform & Juice', () => {
  it('positions middle card upright and rotates edge cards in fan arc', () => {
    // 3 cards: index 0 (left), index 1 (center), index 2 (right)
    const leftCard = getHandCardTransform(0, 3, 'idle');
    const middleCard = getHandCardTransform(1, 3, 'idle');
    const rightCard = getHandCardTransform(2, 3, 'idle');

    expect(middleCard.rotateDeg).toBe(0);
    expect(middleCard.translateY).toBe(0);

    expect(leftCard.rotateDeg).toBeLessThan(0);
    expect(leftCard.translateY).toBeGreaterThan(0);

    expect(rightCard.rotateDeg).toBeGreaterThan(0);
    expect(rightCard.translateY).toBeGreaterThan(0);
  });

  it('lifts and straightens card to 0deg on hover', () => {
    const hovered = getHandCardTransform(0, 3, 'hovered');
    expect(hovered.rotateDeg).toBe(0);
    expect(hovered.translateY).toBe(-14);
    expect(hovered.scale).toBe(1.08);
  });

  it('clamps drag tilt to +/- 6 degrees', () => {
    const tiltRight = getHandCardTransform(0, 3, 'dragging', 50);
    expect(tiltRight.rotateDeg).toBe(6);

    const tiltLeft = getHandCardTransform(0, 3, 'dragging', -50);
    expect(tiltLeft.rotateDeg).toBe(-6);
  });
});

describe('Drop Feedback', () => {
  it('returns accepted with tier-scaling shakeAmount for valid slots', () => {
    const tier0Drop = resolveDropFeedback(true, 0); // 2 + 0 * 0.5 = 2
    expect(tier0Drop.outcome).toBe('accepted');
    expect(tier0Drop.shakeAmount).toBe(2);
    expect(tier0Drop.bounceDurationMs).toBe(380);

    const tier5Drop = resolveDropFeedback(true, 5); // 2 + 5 * 0.5 = 4.5
    expect(tier5Drop.outcome).toBe('accepted');
    expect(tier5Drop.shakeAmount).toBe(4.5);
  });

  it('returns rejected with horizontal shake and zero board shake for invalid slots', () => {
    const invalidDrop = resolveDropFeedback(false, 5);
    expect(invalidDrop.outcome).toBe('rejected');
    expect(invalidDrop.shakeAmount).toBe(0);
    expect(invalidDrop.rejectShakeAmount).toBe(4);
  });
});

describe('Defeat Animation Specs', () => {
  it('gives standard fall for basic attack without pre-shake', () => {
    const anim = resolveDefeatAnimation('basic_attack');
    expect(anim.preShakeMs).toBe(0);
    expect(anim.fallDurationMs).toBe(500);
    expect(anim.staggerDelayMs).toBe(0);
  });

  it('adds 120ms pre-shake with 1.5x amplitude for ultimate kill', () => {
    const anim = resolveDefeatAnimation('ultimate');
    expect(anim.preShakeMs).toBe(120);
    expect(anim.shakeAmplitudeMultiplier).toBe(1.5);
  });

  it('adds staggered delay for chest trap explosions (index * 80ms)', () => {
    const card0 = resolveDefeatAnimation('chest_trap', 0);
    const card1 = resolveDefeatAnimation('chest_trap', 1);
    const card2 = resolveDefeatAnimation('chest_trap', 2);

    expect(card0.staggerDelayMs).toBe(0);
    expect(card1.staggerDelayMs).toBe(80);
    expect(card2.staggerDelayMs).toBe(160);
  });
});
