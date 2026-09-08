export type SkillType = 'basic_attack' | 'utility' | 'ultimate';

export interface BasicSkill {
  id?: string;
  name: string;
  type: 'basic_attack';
  damage: 'ATK' | number;
  description?: string;
}

export interface UtilitySkill {
  id?: string;
  name: string;
  type: 'utility';
  shield?: number;
  heal?: number;
  atkBuffPercent?: number;
  tierBonusEffect?: 'cleanse_1_debuff' | 'extra_1_shield' | string;
  description?: string;
}

export interface UltimateSkill {
  id?: string;
  name: string;
  type: 'ultimate';
  damage: number;
  unlockCondition: string;
  usesRemaining: number;
  description?: string;
}

export type Skill = BasicSkill | UtilitySkill | UltimateSkill;

export interface CardSkills {
  basic: BasicSkill;
  utility: UtilitySkill;
  ultimate: UltimateSkill;
}
