import { Skill, SkillType } from '../models/skill';
import { Card } from '../models/card';
import { checkUltimateUnlock } from '../combat/ultimate';

export interface SkillTooltipData {
  skillId: string;
  name: string;
  iconType: SkillType;
  fullDescription: string;
  isLocked?: boolean;
}

/**
 * Builds tooltip data separating the skill name (always visible on card)
 * from its full computed description (visible on hover / tap).
 */
export function getSkillTooltipData(
  skillType: 'basic' | 'utility' | 'ultimate',
  card: Card
): SkillTooltipData {
  if (skillType === 'basic') {
    const skill = card.skills.basic;
    return {
      skillId: skill.id || 'basic',
      name: skill.name,
      iconType: 'basic_attack',
      fullDescription: `Tấn công gây sát thương tương đương ATK hiện tại (${card.computedATK} sát thương).`,
    };
  }

  if (skillType === 'utility') {
    const skill = card.skills.utility;
    const parts: string[] = [];
    if (skill.shield) parts.push(`Tạo ${skill.shield} Giáp (hết hạn cuối lượt)`);
    if (skill.heal) parts.push(`Hồi ${skill.heal} Máu`);
    if (skill.atkBuffPercent) parts.push(`Tăng ${skill.atkBuffPercent}% ATK trong 1 hiệp`);
    if (skill.tierBonusEffect) {
      parts.push(`[Hiệu ứng Bậc SSR+] ${skill.tierBonusEffect === 'cleanse_1_debuff' ? 'Xóa 1 hiệu ứng bất lợi' : skill.tierBonusEffect}`);
    }

    return {
      skillId: skill.id || 'utility',
      name: skill.name,
      iconType: 'utility',
      fullDescription: parts.join('. ') || skill.description || 'Kỹ năng hỗ trợ.',
    };
  }

  // Ultimate
  const skill = card.skills.ultimate;
  const isUnlocked = checkUltimateUnlock(card);
  const isExhausted = skill.usesRemaining <= 0;

  return {
    skillId: skill.id || 'ultimate',
    name: skill.name,
    iconType: 'ultimate',
    fullDescription: `Tuyệt Kỹ: Gây ${skill.damage} sát thương. Điều kiện: ${skill.unlockCondition}. (Còn lại: ${skill.usesRemaining} lần dùng)${isExhausted ? ' - ĐÃ DÙNG' : isUnlocked ? ' - ĐÃ SẴN SÀNG!' : ' - ĐANG KHÓA'}`,
    isLocked: !isUnlocked,
  };
}
