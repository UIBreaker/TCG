export interface RelicStack {
  relicId: string;
  stackCount: number;
}

export interface RelicInstance {
  relicId: string;
  effectCategory: string;
  name: string;
  description: string;
  baseEffect: number;
  targetSkillType?: 'basic_attack' | 'utility' | 'ultimate' | 'all';
}

export interface RuleModifyingRelic {
  id: string;
  name: string;
  description: string;
  effectCategory: string;
  ruleModifierType: 'extra_recall' | 'backline_shield' | 'extra_ultimate_use';
}
