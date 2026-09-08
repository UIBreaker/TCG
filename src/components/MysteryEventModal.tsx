import React, { useState } from 'react';
import { Relic } from '../types/game';
import { getRandomRelic } from '../data/relics';
import { HelpCircle, Sparkles, Scroll, Coins, HeartCrack } from 'lucide-react';
import { sound } from '../utils/audio';

interface MysteryEventModalProps {
  onGainRelic: (relic: Relic) => void;
  onGainCaptureCard: () => void;
  onGainGold: (amt: number) => void;
  onDamageAll: (amt: number) => void;
  onComplete: () => void;
}

export const MysteryEventModal: React.FC<MysteryEventModalProps> = ({
  onGainRelic,
  onGainCaptureCard,
  onGainGold,
  onDamageAll,
  onComplete,
}) => {
  const [outcome, setOutcome] = useState<string | null>(null);

  const handleSacrifice = () => {
    sound.playAttack('dark');
    const relic = getRandomRelic();
    onDamageAll(25);
    onGainRelic(relic);
    setOutcome(`🩸 Bạn đã hiến tế 25 Máu của tất cả quái vật và nhận được Cổ Vật [${relic.name}]!`);
  };

  const handlePray = () => {
    sound.playHeal();
    onGainCaptureCard();
    onGainGold(45);
    setOutcome('✨ Lời cầu nguyện thành tâm được hồi đáp: Bạn nhận được 1 Lá Bài Chiêu Mộ và 45 Vàng cổ!');
  };

  const handleLeave = () => {
    sound.playCardSelect();
    setOutcome('🌿 Bạn cẩn trọng rời khỏi bàn thờ kỳ bí trong yên bình.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-950 border-2 border-cyan-600/70 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center text-slate-100">
        <span className="text-4xl mb-2">🗿</span>
        <h3 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
          BÀN THỜ CỔ TỰ RỪNG MA
        </h3>
        <p className="text-xs sm:text-sm text-cyan-300/80 mt-1 max-w-md">
          Trước mặt bạn là một bàn đá phủ đầy rêu phong cổ xưa, tỏa ra thứ hào quang ma mị huyền bí...
        </p>

        {outcome ? (
          <div className="w-full mt-6 flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-cyan-950/80 border border-cyan-500 text-cyan-200 text-sm font-bold">
              {outcome}
            </div>
            <button
              onClick={() => {
                sound.playCardSelect();
                onComplete();
              }}
              className="px-8 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition shadow"
            >
              Tiếp Tục Di Chuyển
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3 mt-6">
            {/* Choice 1 */}
            <button
              onClick={handleSacrifice}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-500 transition text-left flex items-center justify-between gap-3 group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <HeartCrack className="w-5 h-5 text-rose-400 group-hover:scale-110 transition shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-rose-300">Hiến Tế Sinh Lực</h4>
                  <p className="text-[11px] text-slate-400">Tất cả quái vật mất 25 HP. Đổi lại nhận 1 Cổ Vật Hiếm!</p>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            </button>

            {/* Choice 2 */}
            <button
              onClick={handlePray}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-amber-950/50 border border-slate-700 hover:border-amber-500 transition text-left flex items-center justify-between gap-3 group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <Scroll className="w-5 h-5 text-purple-400 group-hover:scale-110 transition shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-300">Cầu Nguyện Ánh Sáng</h4>
                  <p className="text-[11px] text-slate-400">Nhận 1 Lá Bài Chiêu Mộ + 45 Đồng Vàng cổ.</p>
                </div>
              </div>
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            </button>

            {/* Choice 3 */}
            <button
              onClick={handleLeave}
              className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between gap-3 text-slate-400 hover:text-slate-200 transition"
            >
              <span className="text-xs font-semibold">Lặng lẽ rời đi (Không chọn gì)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
