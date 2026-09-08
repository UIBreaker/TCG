import React, { useState, useEffect } from 'react';
import { MonsterCard, ElementType } from '../types/game';
import { getEffectiveSpeed, getElementMultiplier } from '../engine/combat';
import { Shield, Sparkles, X, Swords, Heart, Zap, Flame, ChevronRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { RelicIcon } from './RelicIcon';

interface CardInspectorModalProps {
  card: MonsterCard | null;
  opposingCard?: MonsterCard | null;
  slotIndex: number;
  isPlayer: boolean;
  onClose: () => void;
}

const ELEMENT_INFO: Record<ElementType, { name: string; color: string; bg: string; border: string; strongAgainst: string[]; weakAgainst: string[] }> = {
  fire: {
    name: 'Hỏa Tộc',
    color: 'text-amber-400',
    bg: 'bg-amber-950/60',
    border: 'border-amber-700/70',
    strongAgainst: ['Mộc (+35% Sát thương)'],
    weakAgainst: ['Thủy (-25% Sát thương)'],
  },
  water: {
    name: 'Thủy Tộc',
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/60',
    border: 'border-cyan-700/70',
    strongAgainst: ['Hỏa (+35% Sát thương)'],
    weakAgainst: ['Lôi (-25% Sát thương)'],
  },
  nature: {
    name: 'Mộc Tộc',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-700/70',
    strongAgainst: ['Thổ (+35% Sát thương)'],
    weakAgainst: ['Hỏa (-25% Sát thương)'],
  },
  thunder: {
    name: 'Lôi Tộc',
    color: 'text-yellow-400',
    bg: 'bg-yellow-950/60',
    border: 'border-yellow-700/70',
    strongAgainst: ['Thủy (+35% Sát thương)'],
    weakAgainst: ['Thổ (-25% Sát thương)'],
  },
  earth: {
    name: 'Thổ Tộc',
    color: 'text-amber-600',
    bg: 'bg-[#291b0f]/80',
    border: 'border-amber-800/70',
    strongAgainst: ['Lôi (+35% Sát thương)'],
    weakAgainst: ['Mộc (-25% Sát thương)'],
  },
};

const RARITY_BADGES: Record<string, { label: string; color: string; border: string }> = {
  common: { label: 'Phổ Thông', color: 'text-slate-300 bg-slate-800', border: 'border-slate-600' },
  rare: { label: 'Hiếm', color: 'text-cyan-300 bg-cyan-950', border: 'border-cyan-600' },
  epic: { label: 'Sử Thi', color: 'text-purple-300 bg-purple-950', border: 'border-purple-600' },
  legendary: { label: 'Truyền Thuyết', color: 'text-amber-300 bg-amber-950', border: 'border-amber-500' },
};

export const CardInspectorModal: React.FC<CardInspectorModalProps> = ({
  card,
  opposingCard,
  slotIndex,
  isPlayer,
  onClose,
}) => {
  // 3D Card tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    sound.playCardSelect();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!card) return null;

  const effectiveSpeed = getEffectiveSpeed(card);
  const elementData = ELEMENT_INFO[card.element] || ELEMENT_INFO.nature;
  const hpPercent = Math.max(0, Math.min(100, Math.round((card.hp / card.maxHp) * 100)));

  // Synergies
  const hasCleave = card.equippedRelics.some(r => r.type === 'cleave');
  const hasBurn = card.equippedRelics.some(r => r.type === 'burn');
  const hasCleaveBurn = hasCleave && hasBurn;

  // Versus matchup
  const vsMultiplier = opposingCard ? getElementMultiplier(card.element, opposingCard.element) : null;
  const isFasterThanOpponent = opposingCard ? effectiveSpeed > getEffectiveSpeed(opposingCard) : null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / (rect.height / 2)) * 14,
      y: (x / (rect.width / 2)) * 14,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-slate-950/95 border-2 border-amber-800/80 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-900/60 bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fantasy font-black text-base sm:text-lg text-amber-200 tracking-wide">
                  THẤU THỊ CHI TIẾT THẺ BÀI
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isPlayer ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80' : 'bg-red-950/80 text-red-300 border border-red-700/80'
                }`}>
                  {isPlayer ? `Phe Ta • Làn ${slotIndex + 1}` : `Kẻ Địch • Làn ${slotIndex + 1}`}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/60 font-mono">
                Bách khoa thuộc tính quái thú, nội tại, bộ kĩ năng và 10 ô Cổ vật trang bị
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950/80 text-slate-400 hover:text-red-200 border border-slate-700 hover:border-red-700 transition"
            title="Đóng (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (2 COLUMNS) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: LARGE 3D SHOWCASE CARD (md:col-span-5) */}
          <div className="md:col-span-5 flex flex-col items-center justify-start gap-4">
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="w-[240px] sm:w-[260px] h-[350px] sm:h-[375px] rounded-2xl bg-gradient-to-b from-[#3a281c] via-[#24170d] to-[#140b05] border-[3px] border-amber-600/90 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.4)] p-3 flex flex-col justify-between relative cursor-grab overflow-hidden select-none"
            >
              {/* Dynamic light reflection sweep */}
              <div
                style={{
                  background: `radial-gradient(circle at ${50 + tilt.y * 3}% ${50 - tilt.x * 3}%, rgba(255,255,255,0.22) 0%, transparent 60%)`,
                }}
                className="absolute inset-0 pointer-events-none z-30"
              />

              {/* Card Title Banner */}
              <div className="w-full py-1 px-2.5 rounded-lg bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 border border-amber-400/50 shadow flex items-center justify-between z-10">
                <span className="font-fantasy font-black text-xs text-amber-100 drop-shadow">
                  {card.name}
                </span>
                <span className="text-[9px] font-bold text-slate-900 bg-amber-200 px-1.5 py-0.2 rounded font-mono">
                  {elementData.name}
                </span>
              </div>

              {/* 3D Creature Portrait Frame */}
              <div className="w-full h-40 rounded-xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-900/80 shadow-inner flex items-center justify-center relative overflow-hidden my-auto">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_0%,transparent_70%)]" />
                <span className="text-6xl sm:text-7xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] transform hover:scale-110 transition-transform">
                  {card.avatar}
                </span>

                {/* HP Gem */}
                <div className="absolute bottom-2 left-2 z-20 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-red-700 border border-red-300 text-white font-mono font-black text-xs shadow-lg flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-white" />
                  <span>{card.hp}</span>
                </div>

                {/* Speed Gem */}
                <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-700 border border-green-300 text-white font-mono font-black text-xs shadow-lg flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-white" />
                  <span>{effectiveSpeed}</span>
                </div>
              </div>

              {/* Passive Badge */}
              <div className="w-full py-1 px-2 rounded-lg bg-amber-950/80 border border-amber-700/60 text-center text-[9px] font-bold text-amber-300 z-10">
                ✨ {card.passive.name}
              </div>

              {/* Skills Display */}
              <div className="space-y-1.5 z-10">
                {card.skills.map((sk, idx) => (
                  <div
                    key={idx}
                    className="py-1 px-2 rounded-lg bg-slate-900/90 border border-amber-900/50 flex items-center justify-between text-[10px]"
                  >
                    <span className="font-bold text-amber-100">{sk.name}</span>
                    <span className="font-mono font-black text-amber-400">
                      {sk.baseDamage > 0 ? `⚔ ${sk.baseDamage} ST` : sk.healAmount ? `💚 +${sk.healAmount} HP` : '🛡 Giáp'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <span className="text-[10.5px] text-amber-400/80 font-mono tracking-wider">
              (Rê chuột trên thẻ để xoay góc nhìn 3D)
            </span>
          </div>

          {/* RIGHT COLUMN: CODEX & ATTRIBUTES (md:col-span-7) */}
          <div className="md:col-span-7 flex flex-col gap-4">
            
            {/* 1. VITAL STATS & ELEMENTAL MATRIX */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-950/80 shadow-lg space-y-2.5">
              <h3 className="font-fantasy font-black text-xs sm:text-sm text-amber-300 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                CHỈ SỐ SINH TỒN & NGUYÊN TỐ
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                {/* HP */}
                <div className="p-2 rounded-xl bg-slate-950/80 border border-rose-900/50">
                  <span className="text-[10px] text-rose-300 block">SINH LỰC (HP)</span>
                  <span className="text-sm sm:text-base font-black text-rose-200">
                    {card.hp} <span className="text-[10px] text-slate-500">/ {card.maxHp}</span>
                  </span>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div
                      style={{ width: `${hpPercent}%` }}
                      className={`h-full ${hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    />
                  </div>
                </div>

                {/* Speed */}
                <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-900/50">
                  <span className="text-[10px] text-emerald-300 block">TỐC ĐỘ</span>
                  <span className="text-sm sm:text-base font-black text-emerald-200">{effectiveSpeed}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">(Cơ bản: {card.speed})</span>
                </div>

                {/* Shield */}
                <div className="p-2 rounded-xl bg-slate-950/80 border border-blue-900/50">
                  <span className="text-[10px] text-blue-300 block">GIÁP ẢO</span>
                  <span className="text-sm sm:text-base font-black text-blue-200">{card.shield}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Chặn ST trực tiếp</span>
                </div>

                {/* Element */}
                <div className="p-2 rounded-xl bg-slate-950/80 border border-amber-900/50">
                  <span className="text-[10px] text-amber-300 block">NGUYÊN TỐ</span>
                  <span className={`text-xs sm:text-sm font-black ${elementData.color}`}>{elementData.name}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Hệ {card.element}</span>
                </div>
              </div>

              {/* Elemental Advantage Matrix */}
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[10.5px] space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ưu thế khắc chế: </span>
                  <span className="text-slate-300 font-normal">
                    {elementData.strongAgainst.length > 0 ? elementData.strongAgainst.join(', ') : 'Không có'}
                  </span>
                </div>
                {elementData.weakAgainst.length > 0 && (
                  <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    <span>Bất lợi trước: </span>
                    <span className="text-slate-300 font-normal">{elementData.weakAgainst.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. PASSIVE ABILITY DETAIL */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-950/80 shadow-lg space-y-1.5">
              <h3 className="font-fantasy font-black text-xs sm:text-sm text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                NỘI TẠI BÍ TRUYỀN: {card.passive.name.toUpperCase()}
              </h3>
              <p className="text-[11.5px] sm:text-xs text-amber-100/90 leading-relaxed font-sans bg-slate-950/70 p-2.5 rounded-xl border border-amber-900/40">
                {card.passive.description}
              </p>
            </div>

            {/* 3. SKILLS CODEX DETAIL */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-950/80 shadow-lg space-y-2">
              <h3 className="font-fantasy font-black text-xs sm:text-sm text-amber-300 flex items-center gap-2">
                <Swords className="w-4 h-4 text-orange-400" />
                BỘ CHIÊU THỨC CHIẾN ĐẤU & TUYỆT KỸ (3 KĨ NĂNG)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {card.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border space-y-1 ${
                      idx === 2 || skill.isUltimate
                        ? 'bg-gradient-to-b from-amber-950/80 to-slate-950/95 border-amber-500 shadow-md'
                        : 'bg-slate-950/90 border-amber-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200 text-xs flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-amber-400" /> {skill.name}
                      </span>
                      <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        idx === 2 || skill.isUltimate
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-amber-950 text-amber-300 border-amber-700'
                      }`}>
                        {idx === 2 || skill.isUltimate ? '👑 1 LẦN/TRẬN' : idx === 0 ? 'Năng Lượng 0' : 'Hồi Chiêu 1T'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      {skill.baseDamage > 0 && (
                        <span className="text-red-400 font-bold">⚔ {skill.baseDamage} ST</span>
                      )}
                      {skill.healAmount && (
                        <span className="text-emerald-400 font-bold">💚 +{skill.healAmount} HP</span>
                      )}
                      {skill.statusEffect && (
                        <span className="text-amber-400">✨ {skill.statusEffect.type}</span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-300 leading-snug font-sans pt-0.5">
                      {skill.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. EQUIPPED RELICS (0/10 SLOTS) */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-950/80 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-fantasy font-black text-xs sm:text-sm text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  KHO CỔ VẬT TRANG BỊ ({card.equippedRelics.length} / 10 Ô)
                </h3>
                {hasCleaveBurn && (
                  <span className="text-[10px] font-bold text-red-300 bg-red-950 px-2 py-0.5 rounded-full border border-red-500 animate-pulse flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" /> Combo Lan + Cháy
                  </span>
                )}
              </div>

              {card.equippedRelics.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center text-slate-500 text-xs font-mono">
                  (Thẻ bài này chưa trang bị Relic nào. Nhận thêm Relic từ Rương, Shop hoặc Quái Tinh Anh!)
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {card.equippedRelics.map((relic, rIdx) => {
                    const rBadge = RARITY_BADGES[relic.rarity] || RARITY_BADGES.common;
                    return (
                      <div
                        key={rIdx}
                        className="p-2 rounded-xl bg-slate-950 border border-amber-900/40 flex items-start gap-2 shadow-xs"
                      >
                        <span className="w-8 h-8 shrink-0 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-300">
                          <RelicIcon icon={relic.icon} className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-amber-200 truncate">{relic.name}</span>
                            <span className={`text-[8px] font-bold px-1 rounded border ${rBadge.color} ${rBadge.border} shrink-0`}>
                              {rBadge.label}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-slate-400 leading-snug mt-0.5">{relic.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. LANE MATCHUP ANALYSIS (IF OPPOSING MONSTER EXISTS) */}
            {opposingCard && (
              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-700/50 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{opposingCard.avatar}</span>
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono block">ĐỐI THỦ TRỰC DIỆN</span>
                    <span className="font-bold text-slate-200">{opposingCard.name}</span>
                  </div>
                </div>

                <div className="text-right font-mono text-[10.5px]">
                  <div>
                    Tốc độ:{' '}
                    <b className={isFasterThanOpponent ? 'text-emerald-400' : 'text-rose-400'}>
                      {isFasterThanOpponent ? 'Ra đòn trước ➔' : 'Ra đòn sau ➔'}
                    </b>
                  </div>
                  <div>
                    Tương quan:{' '}
                    <b className={vsMultiplier?.mult && vsMultiplier.mult > 1 ? 'text-emerald-400' : 'text-slate-300'}>
                      {vsMultiplier?.note || 'Hòa hoãn (1.0x)'}
                    </b>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-amber-900/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px] text-amber-200/70">
            💡 Mẹo: Nhấp chuột phải vào bất kỳ lá bài nào trên sân để mở bảng này.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded-xl bg-amber-800 hover:bg-amber-700 text-amber-100 font-bold text-xs shadow transition active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
