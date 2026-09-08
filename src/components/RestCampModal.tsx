import React, { useState } from 'react';
import { MonsterCard } from '../types/game';
import { Heart, Sparkles, RefreshCw } from 'lucide-react';
import { sound } from '../utils/audio';

interface RestCampModalProps {
  playerParty: (MonsterCard | null)[];
  onHealAll: (percent: number) => void;
  onReviveCard: (slotIndex: number) => void;
  onContinue: () => void;
}

export const RestCampModal: React.FC<RestCampModalProps> = ({
  playerParty,
  onHealAll,
  onReviveCard,
  onContinue,
}) => {
  const [acted, setActed] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const deadCards = playerParty
    .map((card, idx) => ({ card, idx }))
    .filter(item => item.card && item.card.hp <= 0);

  const handleHealAllClick = () => {
    sound.playHeal();
    onHealAll(0.4);
    setMessage('✨ Toàn bộ quái vật đã hấp thu Hạt Hồi Máu và phục hồi +40% lượng máu tối đa!');
    setActed(true);
  };

  const handleReviveClick = (slotIdx: number) => {
    sound.playHeal();
    onReviveCard(slotIdx);
    const revivedName = playerParty[slotIdx]?.name || 'Quái vật';
    setMessage(`🌿 Mầm sống hồi sinh: ${revivedName} đã tỉnh lại với 50% lượng máu!`);
    setActed(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-emerald-600/70 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center text-slate-100 relative">
        <span className="text-4xl mb-2 animate-bounce">🏕️</span>
        <h3 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
          SUỐI THIÊNG & HẠT HỒI MÁU RỪNG GIÀ
        </h3>
        <p className="text-xs sm:text-sm text-emerald-300/80 mt-1 max-w-md">
          Dưới bóng râm cây cổ thụ nghìn năm, dòng suối phát ra ánh sáng chữa lành mọi vết thương chiến tranh.
        </p>

        {message && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 font-bold text-xs sm:text-sm animate-pulse">
            {message}
          </div>
        )}

        {!acted ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {/* Option 1: Heal All 40% */}
            <button
              onClick={handleHealAllClick}
              className="p-5 rounded-2xl bg-emerald-950/50 hover:bg-emerald-900/60 border-2 border-emerald-500/60 hover:border-emerald-400 transition flex flex-col items-center text-center group active:scale-95 shadow-lg"
            >
              <div className="p-3 rounded-2xl bg-emerald-900/80 text-emerald-300 group-hover:scale-110 transition mb-3">
                <Heart className="w-8 h-8 fill-emerald-400 text-emerald-400" />
              </div>
              <h4 className="font-bold text-base text-emerald-200">Nuốt Hạt Hồi Máu</h4>
              <p className="text-xs text-emerald-300/70 mt-1">
                Phục hồi <span className="font-black text-emerald-400">+40% Máu</span> cho tất cả các lá bài đang còn sống.
              </p>
            </button>

            {/* Option 2: Revive dead monster */}
            <div className="p-5 rounded-2xl bg-teal-950/50 border-2 border-teal-500/60 flex flex-col items-center text-center shadow-lg">
              <div className="p-3 rounded-2xl bg-teal-900/80 text-teal-300 mb-3">
                <RefreshCw className="w-8 h-8 text-teal-400" />
              </div>
              <h4 className="font-bold text-base text-teal-200">Hồi Sinh Quái Vật</h4>
              <p className="text-xs text-teal-300/70 mt-1 mb-2">
                Đánh thức 1 lá bài đã tử trận sống lại với 50% HP.
              </p>

              {deadCards.length === 0 ? (
                <span className="text-xs text-slate-500 italic mt-auto">Không có quái nào tử trận</span>
              ) : (
                <div className="w-full flex flex-col gap-1.5 mt-auto">
                  {deadCards.map(item => (
                    <button
                      key={item.idx}
                      onClick={() => handleReviveClick(item.idx)}
                      className="w-full py-1.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs transition active:scale-95"
                    >
                      Hồi sinh {item.card?.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <button
              onClick={() => {
                sound.playCardSelect();
                onContinue();
              }}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider transition active:scale-95 shadow-xl shadow-emerald-700/40"
            >
              Tiếp Tục Cuộc Hành Trình
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
