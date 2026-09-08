import React from 'react';
import { Relic } from '../types/game';
import { Trophy, Coins, Scroll, Sparkles, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface BattleRewardModalProps {
  gold: number;
  gotRecruitmentCard: boolean;
  relicDrop?: Relic;
  onClaimAndContinue: () => void;
  isBossWin?: boolean;
}

export const BattleRewardModal: React.FC<BattleRewardModalProps> = ({
  gold,
  gotRecruitmentCard,
  relicDrop,
  onClaimAndContinue,
  isBossWin = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center text-slate-100 animate-in fade-in zoom-in-95 duration-300">
        <div className="p-4 rounded-3xl bg-amber-500/20 border border-amber-500/50 mb-3 text-amber-300">
          <Trophy className="w-12 h-12" />
        </div>

        <h3 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-yellow-200 to-emerald-400 bg-clip-text text-transparent">
          {isBossWin ? '👑 ĐẠI THẮNG CHÚA TỂ RỪNG GIÀ!' : '⚔️ CHIẾN THẮNG TRẬN ĐẤU!'}
        </h3>
        <p className="text-xs text-slate-300 mt-1">
          Kẻ địch đã bị khuất phục hoàn toàn. Thu thập chiến lợi phẩm và tiếp tục hành trình!
        </p>

        {/* Rewards List */}
        <div className="w-full flex flex-col gap-3 my-6">
          {/* Gold reward */}
          <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-600/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-amber-400" />
              <div className="text-left">
                <span className="font-bold text-sm text-amber-200">Tiền Thưởng Trận</span>
                <p className="text-[11px] text-amber-400/80">Dùng mua relic và hạt hồi máu</p>
              </div>
            </div>
            <span className="text-lg font-black text-amber-300 font-mono">+{gold} Vàng</span>
          </div>

          {/* Recruitment Card Drop (15% drop rate) */}
          {gotRecruitmentCard && (
            <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <Scroll className="w-6 h-6 text-pink-400" />
                <div className="text-left">
                  <span className="font-bold text-sm text-pink-200">RƠI: Lá Bài Chiêu Mộ (15% tỉ lệ)!</span>
                  <p className="text-[11px] text-pink-300/80">Dùng để bắt quái đối thủ khi máu dưới 15%</p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-purple-600 text-white shadow">
                +1 Thẻ Bắt
              </span>
            </div>
          )}

          {/* Relic Drop */}
          {relicDrop && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-emerald-400" />
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
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-black text-sm uppercase tracking-wider transition active:scale-95 shadow-xl flex items-center justify-center gap-2"
        >
          <span>Nhận Thưởng & Tiến Lên Bản Đồ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
