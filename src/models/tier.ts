export type TierCode = 'C' | 'UC' | 'R' | 'SR' | 'SSR' | 'UR' | 'MR' | 'TR';

export type TierLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface TierInfo {
  level: TierLevel;
  name: string;
  code: TierCode;
  hex: string;
  multiplier: number;
}

export const TIER_MULTIPLIERS = [1.00, 1.10, 1.22, 1.37, 1.55, 1.78, 2.05, 2.40] as const;

export const TIERS: Record<TierCode, TierInfo> = {
  C: { level: 0, name: 'Common', code: 'C', hex: '#9E9E9E', multiplier: 1.00 },
  UC: { level: 1, name: 'Uncommon', code: 'UC', hex: '#4CAF50', multiplier: 1.10 },
  R: { level: 2, name: 'Rare', code: 'R', hex: '#2196F3', multiplier: 1.22 },
  SR: { level: 3, name: 'Super Rare', code: 'SR', hex: '#9C27B0', multiplier: 1.37 },
  SSR: { level: 4, name: 'Super Special Rare', code: 'SSR', hex: '#FFD700', multiplier: 1.55 },
  UR: { level: 5, name: 'Ultra Rare', code: 'UR', hex: '#F44336', multiplier: 1.78 },
  MR: { level: 6, name: 'Mythic', code: 'MR', hex: '#E0115F', multiplier: 2.05 },
  TR: { level: 7, name: 'Origin / Transcendent', code: 'TR', hex: '#E5E4E2', multiplier: 2.40 },
};

export const TIER_ORDER: TierCode[] = ['C', 'UC', 'R', 'SR', 'SSR', 'UR', 'MR', 'TR'];

export function getTierByLevel(level: TierLevel): TierInfo {
  const code = TIER_ORDER[level];
  return TIERS[code];
}
