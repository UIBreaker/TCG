import { ChestResult } from '../models/chest';
import { Card } from '../models/card';

export interface BruteForceOptions {
  hasToolkit?: boolean;
  forcedRoll?: number; // 0.0 to 1.0, for deterministic testing
  forcedMimicRoll?: number; // 0.0 to 1.0, for deterministic testing
  sampleRewardCard?: Card;
}

/**
 * Resolves opening a chest via Brute Force (when having no Key).
 * Follows Section 4 specifications:
 * - 40% success / 60% trap (2 damage to entire team).
 * - Lockpick toolkit consumable adds +20% success (40% -> 60%).
 * - Mimic 10% chance: becomes a mini-boss.
 */
export function resolveBruteForce(
  options: BruteForceOptions = {}
): ChestResult {
  const { hasToolkit = false, forcedRoll, forcedMimicRoll, sampleRewardCard } = options;

  // 1. Check Mimic (10% chance)
  const mimicRoll = forcedMimicRoll ?? Math.random();
  if (mimicRoll < 0.10) {
    return {
      success: false,
      isTrap: false,
      isMimic: true,
      goldGained: 0,
      message: '⚠️ RƯƠNG BIẾN THÀNH QUÁI MIMIC! Chuẩn bị chiến đấu sinh tử!',
    };
  }

  // 2. Compute success threshold (0.40 base, +0.20 if hasToolkit -> 0.60)
  const successThreshold = hasToolkit ? 0.60 : 0.40;
  const roll = forcedRoll ?? Math.random();

  if (roll < successThreshold) {
    // Success!
    return {
      success: true,
      isTrap: false,
      isMimic: false,
      goldGained: 30,
      cardReward: sampleRewardCard,
      message: hasToolkit
        ? '🔓 Phá khóa thành công bằng Bộ Dụng Cụ! Nhận tài nguyên.'
        : '💥 Cạy rương thành công! Nhận tài nguyên an toàn.',
    };
  }

  // Trap!
  return {
    success: false,
    isTrap: true,
    isMimic: false,
    goldGained: 0,
    trapDamageToTeam: 2, // 2 damage to entire team
    message: '💣 BẪY NỔ! Rương phát nổ gây 2 sát thương lên toàn bộ đội hình!',
  };
}

/**
 * Safely opens a chest using a Key (100% safe success).
 */
export function openChestWithKey(sampleRewardCard?: Card): ChestResult {
  return {
    success: true,
    isTrap: false,
    isMimic: false,
    goldGained: 45,
    cardReward: sampleRewardCard,
    message: '🔑 Dùng Chìa Khóa mở rương an toàn 100%! Nhận Vàng & Thẻ Tướng.',
  };
}
