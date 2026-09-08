import React, { useState } from 'react';
import { MonsterCard, ElementType } from '../types/game';
import { getRandomStarterChoices } from '../data/monsters';
import { Sparkles, Swords, Zap, Heart, CheckCircle2, ChevronRight, Crown, Lock } from 'lucide-react';
import { sound } from '../utils/audio';
import { TIERS, TierCode } from '../models/tier';

interface StarterDraftModalProps {
  onSelectStarters: (chosenMonsters: MonsterCard[], targetSlot: number) => void;
  onSelectStarter?: (chosenMonster: MonsterCard, targetSlot: number) => void;
}

const ELEMENT_COLORS: Record<ElementType, { badge: string; border: string; bg: string; text: string; artBg: string }> = {
  fire: { badge: '🔥 HỎA', border: 'border-amber-600', bg: 'from-amber-950/80 to-slate-950', text: 'text-amber-400', artBg: 'from-orange-950/60 to-red-950/70' },
  water: { badge: '💧 THỦY', border: 'border-cyan-600', bg: 'from-cyan-950/80 to-slate-950', text: 'text-cyan-400', artBg: 'from-cyan-950/60 to-blue-950/70' },
  nature: { badge: '🌿 MỘC', border: 'border-emerald-600', bg: 'from-emerald-950/80 to-slate-950', text: 'text-emerald-400', artBg: 'from-emerald-950/60 to-teal-950/70' },
  thunder: { badge: '⚡ LÔI', border: 'border-yellow-500', bg: 'from-yellow-950/80 to-slate-950', text: 'text-yellow-400', artBg: 'from-yellow-950/60 to-amber-950/70' },
  earth: { badge: '🌍 THỔ', border: 'border-amber-700', bg: 'from-[#382618]/80 to-slate-950', text: 'text-amber-500', artBg: 'from-stone-900/60 to-amber-950/70' },
};

export const StarterDraftModal: React.FC<StarterDraftModalProps> = ({ onSelectStarters, onSelectStarter }) => {
  // Section 3: Mulligan 2 nhịp (Nhịp 1: rút 3 chọn 1. Nhịp 2: rút 3 khác chọn 1)
  const [allCandidates] = useState<MonsterCard[]>(() => getRandomStarterChoices(6));
  const [step, setStep] = useState<1 | 2>(1);
  const [firstChoice, setFirstChoice] = useState<MonsterCard | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [targetSlot, setTargetSlot] = useState<number>(0);

  // Candidates for the active step (3 cards per step, strictly distinct)
  const candidates = step === 1 ? allCandidates.slice(0, 3) : allCandidates.slice(3, 6);

  // 3D Card hover tilt
  const [tiltMap, setTiltMap] = useState<Record<number, { x: number; y: number }>>({});

  const handleMouseMove = (idx: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTiltMap(prev => ({
      ...prev,
      [idx]: {
        x: -((y - rect.height / 2) / (rect.height / 2)) * 6,
        y: ((x - rect.width / 2) / (rect.width / 2)) * 6,
      },
    }));
  };

  const handleMouseLeave = (idx: number) => {
    setTiltMap(prev => ({ ...prev, [idx]: { x: 0, y: 0 } }));
  };

  const handleConfirm = () => {
    const chosen = candidates[selectedIdx];
    if (!chosen) return;

    if (step === 1) {
      sound.playCardSlam();
      setFirstChoice(chosen);
      setStep(2);
      setSelectedIdx(0);
      setTiltMap({});
    } else {
      sound.playCardSlam();
      if (firstChoice) {
        if (onSelectStarters) {
          onSelectStarters([firstChoice, chosen], targetSlot);
        } else if (onSelectStarter) {
          onSelectStarter(firstChoice, targetSlot);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Header Banner with 2-Stage Mulligan Indicator */}
      <div className="text-center max-w-2xl mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs font-mono font-bold mb-2 shadow">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>MULLIGAN 2 NHỊP (CHỌN 2 QUÁI THÚ VÀO ĐỘI HÌNH)</span>
        </div>
        <h2 className="font-fantasy font-black text-2xl sm:text-3xl text-amber-200 tracking-wider">
          {step === 1 ? 'NHỊP 1 / 2: RÚT 3 CHỌN 1 QUÁI TIÊN PHONG' : 'NHỊP 2 / 2: RÚT 3 KHÁC CHỌN 1 QUÁI HỖ TRỢ'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1">
          {step === 1
            ? 'Rút 3 lá ngẫu nhiên đầu tiên. Hãy chọn 1 quái thú đồng hành chủ lực!'
            : 'Hệ thống rút tiếp 3 lá quái thú hoàn toàn khác. Hãy chọn linh thú thứ 2 để đồng hành!'}
        </p>

        {/* First choice summary pill if in Step 2 */}
        {step === 2 && firstChoice && (
          <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/90 border border-amber-500/70 text-amber-200 text-xs font-mono shadow-md animate-in fade-in">
            <span className="text-base">{firstChoice.avatar}</span>
            <span>Đã chọn Nhịp 1: <strong className="text-amber-100">{firstChoice.name}</strong> ({firstChoice.tier})</span>
          </div>
        )}
      </div>

      {/* 3 Starter Cards Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-7 w-full max-w-5xl mb-5">
        {candidates.map((card, idx) => {
          const isChosen = selectedIdx === idx;
          const elem = ELEMENT_COLORS[card.element] || ELEMENT_COLORS.nature;
          const tierCode: TierCode = card.tier || 'C';
          const tierInfo = TIERS[tierCode] || TIERS.C;
          const tilt = tiltMap[idx] || { x: 0, y: 0 };

          return (
            <div
              key={card.id}
              className="relative group"
              style={{
                perspective: '1000px',
              }}
            >
              {/* 3D Physical Card Edge Layer (Section 4: offset 5px to bottom-right, darker tone) */}
              <div
                style={{ borderColor: tierInfo.hex }}
                className="absolute inset-0 rounded-2xl bg-black/85 translate-x-1.5 translate-y-1.5 -z-10 shadow-2xl border-2 pointer-events-none opacity-80"
              />

              {/* Main Card Shell with 3D Tilt */}
              <div
                onClick={() => {
                  sound.playCardSelect();
                  setSelectedIdx(idx);
                }}
                onMouseMove={e => handleMouseMove(idx, e)}
                onMouseLeave={() => handleMouseLeave(idx)}
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  borderColor: isChosen ? '#fbbf24' : tierInfo.hex,
                  boxShadow: isChosen
                    ? `0 0 0 2px #fbbf24, 0 0 35px ${tierInfo.hex}77`
                    : `0 0 0 1px ${tierInfo.hex}44, 0 12px 28px -5px rgba(0, 0, 0, 0.7)`,
                }}
                className={`relative rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden p-3.5 flex flex-col justify-between bg-gradient-to-b ${
                  elem.bg
                } ${
                  isChosen
                    ? 'ring-4 ring-amber-500/40 scale-[1.02]'
                    : 'opacity-85 hover:opacity-100 hover:scale-[1.01]'
                }`}
              >
                {/* Selected Badge */}
                {isChosen && (
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[10px] shadow-lg animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ĐÃ CHỌN</span>
                  </div>
                )}

                {/* Card Top Section */}
                <div>
                  {/* Top Bar: Tier Badge + Element + Title */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {/* Tier Badge with hex color & multiplier */}
                      <span
                        style={{ backgroundColor: tierInfo.hex }}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-black text-slate-950 uppercase shadow-sm ring-1 ring-black/40"
                        title={`Bậc: ${tierInfo.name} - Hệ số: x${tierInfo.multiplier.toFixed(2)}`}
                      >
                        {tierInfo.code} • x{tierInfo.multiplier.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-black/50 border border-white/10 text-slate-200">
                        {elem.badge}
                      </span>
                    </div>
                    <span className="text-xs text-amber-300/80 font-mono italic">
                      {card.title}
                    </span>
                  </div>

                  {/* Artwork Window with Integrated HP / ATK / SPD Badges */}
                  <div className={`w-full h-32 rounded-xl bg-gradient-to-b ${elem.artBg} border border-white/10 flex items-center justify-center text-6xl shadow-inner mb-3 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_0%,_transparent_70%)] pointer-events-none" />
                    <span className="transform group-hover:scale-110 transition duration-300 drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)]">
                      {card.avatar}
                    </span>

                    {/* Integrated Bottom Badges: HP (Left), ATK (Center), SPD (Right) */}
                    <div
                      className="absolute -bottom-1 -left-1 z-20 px-2 py-0.5 rounded-full bg-gradient-to-br from-rose-600 to-red-950 border-2 border-amber-300 shadow flex items-center gap-0.5 text-white font-black text-xs font-mono"
                      title="Máu cơ bản HP"
                    >
                      <Heart className="w-3 h-3 fill-white shrink-0" />
                      <span>{card.hp}</span>
                    </div>

                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-gradient-to-br from-amber-500 to-yellow-800 border-2 border-amber-300 shadow flex items-center gap-0.5 text-white font-black text-xs font-mono"
                      title="Sức tấn công ATK"
                    >
                      <Swords className="w-3 h-3 text-amber-100 shrink-0" />
                      <span>{card.attackPower}</span>
                    </div>

                    <div
                      className="absolute -bottom-1 -right-1 z-20 px-2 py-0.5 rounded-full bg-gradient-to-br from-teal-500 to-emerald-950 border-2 border-amber-300 shadow flex items-center gap-0.5 text-white font-black text-xs font-mono"
                      title="Tốc độ SPD (Không đổi theo bậc)"
                    >
                      <Zap className="w-3 h-3 fill-white shrink-0" />
                      <span>{card.speed}</span>
                    </div>
                  </div>

                  <h3 className="font-fantasy font-black text-base text-amber-100 mb-1.5 drop-shadow">
                    {card.name}
                  </h3>

                  {/* Vitals Summary Breakdown */}
                  <div className="grid grid-cols-3 gap-1 py-1 px-2 rounded-lg bg-black/60 border border-white/10 text-center font-mono text-[10px] mb-2">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Gốc HP: {card.baseHP ?? card.hp}</span>
                      <span className="font-bold text-red-400">HP {card.hp}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Gốc ATK: {card.baseATK ?? card.attackPower}</span>
                      <span className="font-bold text-orange-400">ATK {card.attackPower}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Tốc chuẩn</span>
                      <span className="font-bold text-emerald-400">SPD {card.speed}</span>
                    </div>
                  </div>

                  {/* Passive Ability Banner */}
                  <div className="p-1.5 rounded-lg bg-black/40 border border-amber-900/50 text-[11px] mb-2">
                    <span className="font-bold text-amber-300 flex items-center gap-1 mb-0.5">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{card.passive.name}</span>
                    </span>
                    <p className="text-slate-300 text-[10px] leading-tight font-sans">
                      {card.passive.description}
                    </p>
                  </div>

                  {/* 3 Tactical Skills Breakdown */}
                  <div className="space-y-1 text-[10.5px]">
                    {card.skills.map((skill, sIdx) => {
                      const isUlt = skill.isUltimate || sIdx === 2;
                      return (
                        <div
                          key={sIdx}
                          className={`p-1.5 rounded border ${
                            isUlt
                              ? 'bg-amber-950/70 border-amber-500 text-amber-100 shadow-sm'
                              : 'bg-black/35 border-white/10 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-[10px]">
                            <span className="flex items-center gap-1 truncate">
                              {isUlt ? <Crown className="w-3 h-3 text-amber-400 shrink-0" /> : <Swords className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
                              <span className="truncate">{skill.name}</span>
                            </span>
                            <span className="font-mono text-[9px] text-amber-400 shrink-0">
                              {isUlt ? '👑 1 Lần/Trận' : sIdx === 0 ? '⚡0 Cơ bản' : '⏳1T Hồi'}
                            </span>
                          </div>

                          {/* Skill description */}
                          <p className="text-[9.5px] text-slate-300 leading-tight mt-0.5">
                            {skill.description}
                          </p>

                          {/* 3-branch Ultimate Unlock condition display */}
                          {isUlt && (
                            <div className="mt-1 pt-1 border-t border-amber-500/30 flex items-center gap-1 text-[9px] font-mono text-amber-300">
                              <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              <span>Mở khi: 2 đòn đánh | Máu &lt; 50% | Nộ ẩn ≥ 3</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-3xl p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-700/60 shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <span className="text-xl">🖐️</span>
          <span>
            {step === 1
              ? 'Nhịp 1: Chọn 1 quái thú để làm tiên phong, sau đó tiếp tục rút 3 lá khác cho quái thứ 2!'
              : 'Nhịp 2: Chọn quái thú thứ 2 để hoàn tất đội hình 2 lá bước vào chiến trường!'}
          </span>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-fantasy font-black text-sm tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] transition transform active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>
            {step === 1 ? 'CHỌN & TIẾP TỤC NHỊP 2 (RÚT 3 KHÁC)' : 'XÁC NHẬN 2 QUÁI & VÀO TRẬN ĐẤU'}
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
