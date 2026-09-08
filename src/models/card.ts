import { TierCode, TierLevel } from './tier';
import { CardSkills } from './skill';
import { RelicStack } from './relic';

export interface StatModifier {
  id?: string;
  statType: 'ATK' | 'SPD' | 'HP';
  amount: number;
  expiresAt: 'endOfTurn' | 'endOfMatch' | number;
}

export interface Card {
  id: string;
  name: string;
  tier: TierCode;
  tierLevel: TierLevel;
  baseHP: number;
  baseATK: number;
  baseSPD: number;
  computedHP: number;
  computedATK: number;
  computedSPD: number;
  computedDEF?: number;
  currentHP: number;
  currentShield: number;
  hiddenRage: number;
  hitsDealt: number;
  skills: CardSkills;
  equippedRelics: RelicStack[];
  relicSlotsUsed: number;
  relicSlotsMax: number;
  fusionResult?: string;
  modifiers?: StatModifier[];
  avatar?: string;
  element?: string;
}
