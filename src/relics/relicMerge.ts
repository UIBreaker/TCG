import { RelicInstance } from '../models/relic';

/**
 * Merges two relic instances in the Relic Bag at Sanctuary/Forge.
 * Returns null if they belong to different effect categories.
 */
export function mergeRelics(
  relicA: RelicInstance,
  relicB: RelicInstance
): RelicInstance | null {
  if (relicA.effectCategory !== relicB.effectCategory) {
    return null; // Incompatible categories cannot be merged
  }

  // Combined effect: base sum + 20% synergy bonus
  const mergedBaseEffect = Math.round((relicA.baseEffect + relicB.baseEffect) * 1.2 * 100) / 100;

  return {
    relicId: `merged_${relicA.relicId}_${relicB.relicId}`,
    effectCategory: relicA.effectCategory,
    name: `Tinh Hoa ${relicA.name.split(' ')[0]} (Hợp Nhất)`,
    description: `Relic hợp nhất từ ${relicA.name} và ${relicB.name}. Hiệu quả cộng hưởng +20%.`,
    baseEffect: mergedBaseEffect,
    targetSkillType: relicA.targetSkillType || relicB.targetSkillType,
  };
}
