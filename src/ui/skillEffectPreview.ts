import { Card } from '../models/card';
import { calculateRelicEffectValue } from '../relics/relicScaling';

export interface RelicContribution {
  relicId: string;
  relicName: string;
  stackCount: number;
  contributionAmount: number;
}

export interface SkillEffectPreview {
  skillId: string;
  skillName: string;
  description: string;
  baseValue: number;
  relicContributions: RelicContribution[];
  finalValue: number;
}

// Registry of relic metadata for effect resolution
const RELIC_EFFECT_METADATA: Record<
  string,
  { name: string; targetSkills: ('basic' | 'utility' | 'ultimate')[]; baseEffect: number }
> = {
  ember_core: { name: 'Ember Core', targetSkills: ['basic', 'ultimate'], baseEffect: 2 },
  swift_string: { name: 'Swift String', targetSkills: ['basic'], baseEffect: 1 },
  iron_scale: { name: 'Iron Scale', targetSkills: ['utility'], baseEffect: 1 },
};

/**
 * Calculates real computed skill values and lists active relic contributions.
 * Follows Section 13.2 & 13.3:
 * - If no relics affect this skill, relicContributions is empty (hiding the section in UI).
 * - Relic scaling uses calculateRelicEffectValue(baseEffect, stackCount).
 */
export function calculateSkillEffectPreview(
  card: Card,
  skillId: 'basic' | 'utility' | 'ultimate'
): SkillEffectPreview {
  let skillName = '';
  let description = '';
  let baseValue = 0;

  if (skillId === 'basic') {
    skillName = card.skills.basic.name;
    baseValue = card.computedATK;
    description = `Gây sát thương theo ATK hiện tại (${baseValue})`;
  } else if (skillId === 'utility') {
    skillName = card.skills.utility.name;
    baseValue = card.skills.utility.shield || card.skills.utility.heal || card.skills.utility.atkBuffPercent || 0;
    description = card.skills.utility.description || `Kỹ năng hỗ trợ (giá trị cơ bản: ${baseValue})`;
  } else {
    skillName = card.skills.ultimate.name;
    baseValue = card.skills.ultimate.damage;
    description = `Tuyệt Kỹ gây ${baseValue} sát thương`;
  }

  const relicContributions: RelicContribution[] = [];
  let totalBonus = 0;

  for (const stack of card.equippedRelics) {
    const meta = RELIC_EFFECT_METADATA[stack.relicId];
    if (meta && meta.targetSkills.includes(skillId)) {
      const contributionAmount = calculateRelicEffectValue(meta.baseEffect, stack.stackCount);
      totalBonus += contributionAmount;
      relicContributions.push({
        relicId: stack.relicId,
        relicName: meta.name,
        stackCount: stack.stackCount,
        contributionAmount,
      });
    }
  }

  const finalValue = Math.round((baseValue + totalBonus) * 100) / 100;

  return {
    skillId,
    skillName,
    description,
    baseValue,
    relicContributions,
    finalValue,
  };
}
