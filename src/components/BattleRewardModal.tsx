import React from 'react';
import { Relic } from '../types/game';
import { Trophy, Coins, Scroll, Sparkles, ArrowRight, Key, Heart, Shield, Briefcase, Package } from 'lucide-react';
import { sound } from '../utils/audio';

interface BattleRewardModalProps {
  gold: number;
  gotRecruitmentCard?: boolean;
  chestsCount?: number;
  keysCount?: number;
  healingHerbsCount?: number;
  shieldPotionsCount?: number;
  lockpickToolkitsCount?: number;
  relicDrop?: Relic;
  onClaimAndContinue: () => void;
  isBossWin?: boolean;
  mapLoop?: number;
}

export const BattleRewardModal: React.FC<BattleRewardModalProps> = ({
  gold,
  gotRecruitmentCard = false,
  chestsCount = 0,
  keysCount = 0,
  healingHerbsCount = 0,
  shieldPotionsCount = 0,
  lockpickToolkitsCount = 0,
  relicDrop,
  onClaimAndContinue,
  isBossWin = false,
  mapLoop = 1,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-950 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col items-center text-center text-slate-100 animate-in zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto">
        <div className="p-4 rounded-3xl bg-amber-500/20 border border-amber-500/50 mb-2.5 text-amber-300">
          <Trophy className="w-12 h-12" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-fantasy font-black bg-gradient-to-r from-amber-400 via-yellow-200 to-emerald-400 bg-clip-text text-transparent">
          {isBossWin ? `👑 CHINH PHỤC BẢN ĐỒ ${mapLoop} LỤC ĐỊA ĐEN!` : '⚔️ CHIẾN THẮNG TRẬN ĐẤU!'}
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-md">
          {isBossWin
            ? `Bạn đã đánh bại Đại Tai Ương tầng cuối! Toàn bộ chiến lợi phẩm quý hiếm đã được chuyển vào Túi Đồ. Cổng dẫn vào Bản Đồ ${mapLoop + 1} đã rộng mở!`
            : 'Kẻ địch đã bị khuất phục. Toàn bộ vật phẩm rơi đã được cất thẳng vào Túi Đồ của bạn!'}
        </p>

        {/* Notice about Inventory */}
        <div className="mt-2.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5 shadow-sm">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Tất cả phần thưởng được cất an toàn trong Túi Đồ</span>
        </div>

        {/* Rewards List */}
        <div className="w-full flex flex-col gap-2.5 my-5">
          {/* Gold reward */}
          <div className="p-3 rounded-2xl bg-amber-950/50 border border-amber-600/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="font-bold text-sm text-amber-200">Tiền Thưởng Trận</span>
                <p className="text-[10.5px] text-amber-400/80">Dùng mua relic, bốc thăm & vật phẩm</p>
              </div>
            </div>
            <span className="text-base sm:text-lg font-black text-amber-300 font-mono shrink-0">+{gold} Vàng</span>
          </div>

          {/* Chest Drop */}
          {chestsCount > 0 && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 to-slate-900 border border-amber-500/80 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-amber-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-sm text-amber-100 flex items-center gap-1">
                    🎁 RƠI: Rương Kho Báu Cổ Đại!
                  </span>
                  <p className="text-[10.5px] text-amber-300/80">Cất vào Túi Đồ, mở bằng Chìa Khóa hoặc Phá Khóa</p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 shadow-md font-mono shrink-0">
                +{chestsCount} Rương
              </span>
            </div>
          )}

          {/* Key Drop */}
          {keysCount > 0 && (
            <div className="p-3 rounded-2xl bg-yellow-950/60 border border-yellow-500/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-6 h-6 text-yellow-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-sm text-yellow-200">RƠI: Chìa Khóa Cổ Đại!</span>
                  <p className="text-[10.5px] text-yellow-300/80">Mở rương 100% an toàn tránh Bẫy & Quái Giả Rương</p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-yellow-500 text-slate-950 font-mono shrink-0">
                +{keysCount} Chìa Khóa
              </span>
            </div>
          )}

          {/* Healing Herb Drop */}
          {healingHerbsCount > 0 && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-sm text-emerald-200">RƠI: Dược Thảo Rừng Xanh!</span>
                  <p className="text-[10.5px] text-emerald-300/80">Hồi ngay +35 HP trong Túi Đồ cho linh thú</p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 font-mono shrink-0">
                +{healingHerbsCount} Thảo Dược
              </span>
            </div>
          )}

          {/* Shield Potion Drop */}
          {shieldPotionsCount > 0 && (
            <div className="p-3 rounded-2xl bg-blue-950/60 border border-blue-500/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-sm text-blue-200">RƠI: Bình Giáp Hộ Mệnh!</span>
                  <p className="text-[10.5px] text-blue-300/80">Ban +25 Giáp ảo hấp thụ đòn đánh</p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-blue-500 text-white font-mono shrink-0">
                +{shieldPotionsCount} Bình Giáp
              </span>
            </div>
          )}

          {/* Recruitment Card Drop */}
          {gotRecruitmentCard && (
            <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <Scroll className="w-6 h-6 text-pink-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-sm text-pink-200">RƠI: Lá Bài Chiêu Mộ!</span>
                  <p className="text-[10.5px] text-pink-300/80">Dùng bắt quái đối thủ khi máu dưới 15%</p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-purple-600 text-white shadow font-mono shrink-0">
                +1 Thẻ Bắt
              </span>
            </div>
          )}

          {/* Relic Drop */}
          {relicDrop && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-950 to-emerald-950/80 border border-emerald-500 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-sm text-emerald-200 flex items-center gap-1.5">
                    RƠI CỔ VẬT: {relicDrop.name}
                  </span>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{relicDrop.description}</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 ml-2">
                {relicDrop.rarity}
              </span>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={() => {
            sound.playCoin();
            onClaimAndContinue();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-black text-sm uppercase tracking-wider transition active:scale-95 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>
            {isBossWin
              ? `Chuyển Sang Bản Đồ ${mapLoop + 1} Lục Địa Đen`
              : 'Cất Vào Túi Đồ & Tiếp Tục Thám Hiểm'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
