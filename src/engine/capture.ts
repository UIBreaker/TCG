import { MonsterCard } from '../types/game';

export interface CaptureResult {
  success: boolean;
  captureRatePercent: number;
  message: string;
  capturedMonster?: MonsterCard;
}

/**
 * Tính toán tỉ lệ bắt quái và thực hiện bắt bài chiêu mộ.
 * Quy tắc:
 * - Tỉ lệ cơ bản: 20%
 * - Cứ mỗi 10% máu mất đi của đối thủ sẽ cộng thêm +10% tỉ lệ bắt.
 * - Ví dụ đối thủ còn 15% máu (đã mất 85% máu) -> Tỉ lệ là 20% + 80% = 100%!
 */
export const calculateCaptureRate = (target: MonsterCard): number => {
  if (target.hp <= 0) return 0;
  
  const hpMissingRatio = (target.maxHp - target.hp) / target.maxHp;
  const hpMissingPercent = hpMissingRatio * 100;
  
  // Mỗi 10% mất đi được +10%
  const missingTenPercentSteps = Math.floor(hpMissingPercent / 10);
  let rate = 20 + missingTenPercentSteps * 10;
  
  // Giới hạn trong khoảng [20%, 100%]
  rate = Math.min(100, Math.max(20, rate));
  return rate;
};

/**
 * Thực hiện chiêu mộ quái vật
 */
export const attemptCapture = (target: MonsterCard): CaptureResult => {
  const rate = calculateCaptureRate(target);
  const roll = Math.random() * 100;
  const success = roll <= rate;

  if (success) {
    // Clone monster for player's roster with full HP and reset status
    const captured: MonsterCard = {
      ...target,
      id: `captured_${target.templateId}_${Date.now()}`,
      hp: target.maxHp,
      shield: 0,
      skills: [
        { ...target.skills[0], currentCooldown: 0 },
        { ...target.skills[1], currentCooldown: 0 },
        { ...target.skills[2], currentCooldown: 0, usedThisCombat: false },
      ],
      ultimateUsed: false,
      equippedRelics: [...target.equippedRelics],
    };

    return {
      success: true,
      captureRatePercent: rate,
      message: `🎉 Chiêu mộ thành công ${target.name} (Tỉ lệ: ${rate}%)! Quái vật đã gia nhập đội ngũ!`,
      capturedMonster: captured,
    };
  } else {
    return {
      success: false,
      captureRatePercent: rate,
      message: `❌ Chiêu mộ thất bại (Tỉ lệ: ${rate}%, Xúc xắc: ${Math.round(roll)}%)! Quái vật kháng cự quyết liệt!`,
    };
  }
};
