import React, { useState } from 'react';
import { MonsterCard, Relic } from '../types/game';
import { ALL_RELICS } from '../data/relics';
import { resolveBruteForce, openChestWithKey } from '../rewards/chestSystem';
import { Key, ShieldAlert, Sparkles, Coins, Skull, ChevronRight, X, AlertTriangle, Hammer, Lock } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface TreasureVaultModalProps {
  keysCount: number;
  lockpickToolkitsCount: number;
  playerParty: (MonsterCard | null)[];
  onAddRewards: (gold: number, relic?: Relic) => void;
  onConsumeKey: () => void;
  onConsumeToolkit: () => void;
  onDamageParty: (damage: number) => void;
  onTriggerMimicCombat: () => void;
  onClose: () => void;
}

export const TreasureVaultModal: React.FC<TreasureVaultModalProps> = ({
  keysCount,
  lockpickToolkitsCount,
  playerParty,
  onAddRewards,
  onConsumeKey,
  onConsumeToolkit,
  onDamageParty,
  onTriggerMimicCombat,
  onClose,
}) => {
  const [chestOpened, setChestOpened] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [rewardDetails, setRewardDetails] = useState<{ gold: number; relic?: Relic } | null>(null);
  const [isTrap, setIsTrap] = useState<boolean>(false);
  const [isMimic, setIsMimic] = useState<boolean>(false);

  // 1. Open with Key (100% safe)
  const handleOpenWithKey = () => {
    if (keysCount <= 0 || chestOpened) return;

    sound.playCardSlam();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    const droppedRelic = ALL_RELICS[Math.floor(Math.random() * ALL_RELICS.length)];
    const goldGained = 55;

    onConsumeKey();
    onAddRewards(goldGained, droppedRelic);

    setChestOpened(true);
    setRewardDetails({ gold: goldGained, relic: droppedRelic });
    setResultMessage('🔑 Dùng Chìa Khóa Cổ mở rương an toàn 100%! Nhận Vàng và Cổ Vật Thần Bí!');
  };

  // 2. Brute Force
  const handleBruteForce = () => {
    if (chestOpened) return;

    const hasToolkit = lockpickToolkitsCount > 0;
    if (hasToolkit) {
      onConsumeToolkit();
    }

    const res = resolveBruteForce({ hasToolkit });

    if (res.isMimic) {
      sound.playAttack('fire');
      setIsMimic(true);
      setChestOpened(true);
      setResultMessage(res.message);
      setTimeout(() => {
        onTriggerMimicCombat();
      }, 2000);
      return;
    }

    if (res.isTrap) {
      sound.playAttack('fire');
      setIsTrap(true);
      setChestOpened(true);
      onDamageParty(2);
      setResultMessage(res.message);
      return;
    }

    // Success!
    sound.playCardSlam();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    const droppedRelic = Math.random() < 0.5 ? ALL_RELICS[Math.floor(Math.random() * ALL_RELICS.length)] : undefined;
    const goldGained = 40;

    onAddRewards(goldGained, droppedRelic);
    setChestOpened(true);
    setRewardDetails({ gold: goldGained, relic: droppedRelic });
    setResultMessage(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-yellow-600/80 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(234,179,8,0.25)] relative flex flex-col text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-yellow-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-yellow-950/80 border border-yellow-500/70 text-yellow-400 shadow-inner">
              <Key className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-fantasy font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500">
                  MẬT THẤT KHO BÁU • TREASURE VAULT
                </h3>
              </div>
              <p className="text-xs text-yellow-200/70">
                Rương cổ đại bị phong ấn bởi ma thuật ngàn năm. Hãy chọn cách mở kho báu!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inventory Status Badges */}
        <div className="flex items-center justify-center gap-4 my-4 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <span className="text-base">🔑</span>
            <span className="text-amber-300">Chìa Khóa Cổ:</span>
            <span className="px-2 py-0.5 rounded bg-black/60 border border-amber-500/50 text-amber-200">{keysCount}</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <span className="text-base">🛠️</span>
            <span className="text-teal-300">Bộ Phá Khóa:</span>
            <span className="px-2 py-0.5 rounded bg-black/60 border border-teal-500/50 text-teal-200">{lockpickToolkitsCount}</span>
          </div>
        </div>

        {/* Ancient Chest Illustration */}
        <div className="my-3 text-center py-6 px-4 rounded-2xl bg-gradient-to-b from-yellow-950/30 via-slate-900/40 to-slate-950 border border-yellow-800/40 flex flex-col items-center justify-center">
          <div className="text-7xl sm:text-8xl drop-shadow-[0_10px_25px_rgba(234,179,8,0.4)] animate-pulse">
            {isMimic ? '👹' : chestOpened ? '✨🔓' : '🗝️📦'}
          </div>
          <h4 className="font-fantasy font-bold text-base text-yellow-100 mt-2">
            {isMimic ? 'QUÁI VẬT MIMIC THỨC TỈNH!' : chestOpened ? 'RƯƠNG ĐÃ ĐƯỢC MỞ' : 'RƯƠNG THẦN BÍ VIỄN CỔ'}
          </h4>

          {/* Result Alert */}
          {resultMessage && (
            <div className={`mt-3 px-4 py-2 rounded-xl text-xs font-bold text-center border animate-in fade-in ${
              isTrap
                ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                : isMimic
                ? 'bg-red-950/90 border-red-500 text-red-200 animate-bounce'
                : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
            }`}>
              {resultMessage}
            </div>
          )}

          {/* Reward Details Showcase */}
          {rewardDetails && (
            <div className="mt-3 flex items-center justify-center gap-4 text-xs font-mono font-bold">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950 border border-amber-500 text-amber-300">
                <Coins className="w-4 h-4" />
                <span>+{rewardDetails.gold} Vàng</span>
              </div>
              {rewardDetails.relic && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950 border border-purple-500 text-purple-300">
                  <span>{rewardDetails.relic.icon}</span>
                  <span>{rewardDetails.relic.name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Options */}
        {!chestOpened ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {/* Option 1: Open with Key */}
            <button
              disabled={keysCount <= 0}
              onClick={handleOpenWithKey}
              className={`p-4 rounded-2xl border-2 flex flex-col justify-between text-left transition ${
                keysCount > 0
                  ? 'bg-gradient-to-b from-yellow-950/60 to-slate-900 border-yellow-500/80 hover:border-yellow-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(234,179,8,0.2)] cursor-pointer'
                  : 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5 uppercase font-mono">
                    <Key className="w-4 h-4 text-yellow-400" />
                    <span>Mở Bằng Chìa Khóa Cổ</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-[10px] font-black text-emerald-300">
                    100% AN TOÀN
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Tiêu hao 1 Chìa Khóa Cổ. Nhận 50+ Vàng và 1 Cổ Vật thần bí chắc chắn!
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-yellow-900/50 flex items-center justify-between text-[11px] font-mono">
                <span className="text-yellow-400">Tiêu hao: 1 Chìa Khóa</span>
                <span className="font-bold text-yellow-200">MỞ NGAY ➔</span>
              </div>
            </button>

            {/* Option 2: Brute Force */}
            <button
              onClick={handleBruteForce}
              className="p-4 rounded-2xl border-2 bg-gradient-to-b from-slate-900 to-red-950/40 border-orange-600/70 hover:border-orange-500 hover:scale-[1.02] shadow-lg flex flex-col justify-between text-left transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5 uppercase font-mono">
                    <Hammer className="w-4 h-4 text-orange-400" />
                    <span>Phá Khóa Liều Lĩnh</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500 text-[10px] font-black text-amber-300">
                    {lockpickToolkitsCount > 0 ? '60% TỶ LỆ' : '40% TỶ LỆ'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {lockpickToolkitsCount > 0
                    ? 'Dùng 1 Bộ Dụng Cụ Phá Khóa (+20% tỉ lệ thành công). Thất bại dính Bẫy Nổ gây 2 ST cho cả đội!'
                    : 'Cạy rương tay không (40% thành công). Thất bại dính Bẫy Nổ (2 ST toàn đội) hoặc gặp Mimic!'}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-orange-900/50 flex items-center justify-between text-[11px] font-mono">
                <span className="text-orange-400">
                  {lockpickToolkitsCount > 0 ? 'Tiêu hao: 1 Bộ Phá Khóa' : 'Không tốn tài nguyên'}
                </span>
                <span className="font-bold text-orange-200">THỬ PHÁ KHÓA ➔</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-black text-xs font-fantasy tracking-wider shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 transition"
            >
              <span>TIẾP TỤC HÀNH TRÌNH</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
