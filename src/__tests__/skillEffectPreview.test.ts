import { describe, it, expect } from 'vitest';
import { calculateSkillEffectPreview } from '../ui/skillEffectPreview';
import { getCard3DTiltTransform } from '../ui/card3DTilt';
import { SAMPLE_EMBERCLAW_WYRM } from '../data/sampleCard';
import { Card } from '../models/card';

describe('calculateSkillEffectPreview & Relic Breakdown', () => {
  it('returns empty relicContributions when no relics affect the skill', () => {
    // Card with no equipped relics
    const plainCard: Card = {
      ...SAMPLE_EMBERCLAW_WYRM,
      equippedRelics: [],
    };

    const preview = calculateSkillEffectPreview(plainCard, 'utility');
    expect(preview.relicContributions.length).toBe(0);
    expect(preview.finalValue).toBe(preview.baseValue);
  });

  it('aggregates multiple relic contributions on emberclaw_wyrm basic attack', () => {
    // SAMPLE_EMBERCLAW_WYRM has:
    // ember_core (stack 3, baseEffect 2 -> 2 * 2.6 = 5.2)
    // swift_string (stack 1, baseEffect 1 -> 1 * 1.0 = 1.0)
    // iron_scale affects utility only, so excluded from basic!
    const preview = calculateSkillEffectPreview(SAMPLE_EMBERCLAW_WYRM, 'basic');

    expect(preview.relicContributions.length).toBe(2);
    const emberContrib = preview.relicContributions.find(r => r.relicId === 'ember_core');
    const swiftContrib = preview.relicContributions.find(r => r.relicId === 'swift_string');

    expect(emberContrib?.contributionAmount).toBe(5.2);
    expect(swiftContrib?.contributionAmount).toBe(1.0);

    // Base ATK is 17 (UR tier). Total = 17 + 5.2 + 1.0 = 23.2
    expect(preview.baseValue).toBe(17);
    expect(preview.finalValue).toBe(23.2);
  });

  it('correctly calculates utility skill relic contribution from iron_scale', () => {
    // iron_scale (stack 2, baseEffect 1 -> 1 * 1.8 = 1.8)
    const preview = calculateSkillEffectPreview(SAMPLE_EMBERCLAW_WYRM, 'utility');

    expect(preview.relicContributions.length).toBe(1);
    expect(preview.relicContributions[0].relicId).toBe('iron_scale');
    expect(preview.relicContributions[0].contributionAmount).toBe(1.8);
    // Base shield is 2. Total = 2 + 1.8 = 3.8
    expect(preview.finalValue).toBe(3.8);
  });
});

describe('getCard3DTiltTransform', () => {
  const cardWidth = 200;
  const cardHeight = 300;

  it('returns exactly 0deg on both axes when pointer is at center', () => {
    const centerTilt = getCard3DTiltTransform(100, 150, cardWidth, cardHeight);
    expect(centerTilt.rotateXDeg).toBe(0);
    expect(centerTilt.rotateYDeg).toBe(0);
  });

  it('clamps tilt angles within +/- 6 degrees at the 4 corners', () => {
    // Top-Left corner (0, 0)
    const topLeft = getCard3DTiltTransform(0, 0, cardWidth, cardHeight);
    expect(topLeft.rotateXDeg).toBe(6); // tilts back
    expect(topLeft.rotateYDeg).toBe(-6); // tilts left

    // Bottom-Right corner (200, 300)
    const bottomRight = getCard3DTiltTransform(200, 300, cardWidth, cardHeight);
    expect(bottomRight.rotateXDeg).toBe(-6); // tilts forward
    expect(bottomRight.rotateYDeg).toBe(6); // tilts right

    // Way beyond corners (overflow coordinates)
    const overflow = getCard3DTiltTransform(500, -200, cardWidth, cardHeight);
    expect(overflow.rotateXDeg).toBe(6);
    expect(overflow.rotateYDeg).toBe(6);
  });
});
