import React from 'react';
import { Skull, RotateCcw, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameOverModalProps {
  isVictory: boolean;
  floor: number;
  gold: number;
  capturedCount: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  floor,
  gold,
  capturedCount,
  onRestart,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-md bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div
          className={`p-4 rounded-3xl mb-3 ${
            isVictory
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              : 'bg-rose-950/60 text-rose-400 border border-rose-700/60'
          }`}
        >
          {isVictory ? <Trophy className="w-12 h-12" /> : <Skull className="w-12 h-12" />}
        </div>

        <h3
          className={`text-2xl font-black ${
            isVictory ? 'text-amber-300' : 'text-rose-500'
          }`}
        >
          {isVictory ? '🎉 CHINH PHỤC CÁNH RỪNG HOANG!' : '💀 TOÀN ĐỘI ĐÃ TỬ TRẬN'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {isVictory
            ? 'Bạn đã đánh bại Chúa Tể Cánh Rừng và giải cứu vương quốc quái thú hoang dã!'
            : 'Cánh rừng hoang đã nuốt chửng đội hình của bạn. Hãy rút kinh nghiệm và thử lại!'}
        </p>

        {/* Stats summary */}
        <div className="w-full grid grid-cols-3 gap-2 my-6 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">TẦNG ĐẠT ĐƯỢC</span>
            <span className="text-base font-black text-emerald-400 font-mono">{floor}/7</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">VÀNG TÍCH LŨY</span>
            <span className="text-base font-black text-amber-400 font-mono">{gold}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">QUÁI BẮT ĐƯỢC</span>
            <span className="text-base font-black text-purple-400 font-mono">{capturedCount}</span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playCardSelect();
            onRestart();
          }}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider transition active:scale-95 shadow-xl flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Bắt Đầu Hành Trình Mới</span>
        </button>
      </div>
    </div>
  );
};
