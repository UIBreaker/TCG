export type TierCode = 'C' | 'UC' | 'R' | 'SR' | 'SSR' | 'UR' | 'MR' | 'TR';

export type TierLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface TierInfo {
  level: TierLevel;
  name: string;
  code: TierCode;
  hex: string;
  multiplier: number;
}

export const TIER_MULTIPLIERS = [1.00, 1.40, 2.00, 2.80, 4.00, 5.80, 8.20, 12.00] as const;

export const TIER_SPEED_BONUS = [0, 1, 2, 4, 6, 9, 12, 16] as const;

export const TIER_DEFENSE_BONUS = [0, 0, 1, 2, 3, 5, 8, 12] as const;

export const TIER_PASSIVE_MULTIPLIERS = [1.00, 1.25, 1.50, 2.00, 2.50, 3.20, 4.00, 5.00] as const;

export const TIERS: Record<TierCode, TierInfo> = {
  C: { level: 0, name: 'Common', code: 'C', hex: '#9E9E9E', multiplier: 1.00 },
  UC: { level: 1, name: 'Uncommon', code: 'UC', hex: '#4CAF50', multiplier: 1.40 },
  R: { level: 2, name: 'Rare', code: 'R', hex: '#2196F3', multiplier: 2.00 },
  SR: { level: 3, name: 'Super Rare', code: 'SR', hex: '#9C27B0', multiplier: 2.80 },
  SSR: { level: 4, name: 'Super Special Rare', code: 'SSR', hex: '#FFD700', multiplier: 4.00 },
  UR: { level: 5, name: 'Ultra Rare', code: 'UR', hex: '#F44336', multiplier: 5.80 },
  MR: { level: 6, name: 'Mythic', code: 'MR', hex: '#E0115F', multiplier: 8.20 },
  TR: { level: 7, name: 'Origin / Transcendent', code: 'TR', hex: '#E5E4E2', multiplier: 12.00 },
};

export const TIER_ORDER: TierCode[] = ['C', 'UC', 'R', 'SR', 'SSR', 'UR', 'MR', 'TR'];

export function getTierByLevel(level: TierLevel): TierInfo {
  const code = TIER_ORDER[level];
  return TIERS[code];
}
