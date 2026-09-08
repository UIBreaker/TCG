import React, { useState, useEffect } from 'react';
import { MonsterCard, ElementType } from '../types/game';
import { getEffectiveSpeed, getElementMultiplier } from '../engine/combat';
import { Shield, Sparkles, X, Swords, Heart, Zap, Flame, ChevronRight, Compass } from 'lucide-react';
import { sound } from '../utils/audio';
import { RelicIcon } from './RelicIcon';
import { TIERS } from '../models/tier';

export interface CardInspectorModalProps {
  card: MonsterCard | null;
  opposingCard?: MonsterCard | null;
  slotIndex: number;
  isPlayer: boolean;
  currentSkillIndex?: 0 | 1 | 2;
  onSelectSkill?: (skillIndex: 0 | 1 | 2) => void;
  onRecallCard?: () => void;
  recallsRemaining?: number;
  canRecall?: boolean;
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
  currentSkillIndex,
  onSelectSkill,
  onRecallCard,
  recallsRemaining = 2,
  canRecall = false,
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

  const tierInfo = TIERS[card.tier || 'C'] || TIERS.C;
  const effectiveSpeed = getEffectiveSpeed(card);
  const elementData = ELEMENT_INFO[card.element] || ELEMENT_INFO.nature;
  const hpPercent = Math.max(0, Math.min(100, Math.round((card.hp / card.maxHp) * 100)));

  // Ultimate unlock conditions (3 branches: 2 hits dealt, HP < 50%, or 3 rage)
  const condHits = (card.hitsDealt || 0) >= 2;
  const condLowHp = (card.hp / card.maxHp) < 0.5;
  const condRage = (card.hiddenRage || 0) >= 3;
  const isUltUnlocked = condHits || condLowHp || condRage;

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
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-amber-900/60 bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-fantasy font-black text-base sm:text-xl text-amber-200 tracking-wide">
                  THẤU THỊ CHI TIẾT THẺ BÀI
                </h2>
                <span
                  style={{ backgroundColor: tierInfo.hex }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-black text-slate-950 uppercase shadow-xs ring-1 ring-black/50"
                  title={`Bậc: ${tierInfo.name} (${tierInfo.code})`}
                >
                  BẬC {tierInfo.code} • {tierInfo.name}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isPlayer ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-600/80' : 'bg-red-950/90 text-red-300 border border-red-600/80'
                }`}>
                  {isPlayer ? `Đội Hình Phe Ta • Làn ${slotIndex + 1}` : `Quái Địch Lục Địa Đen • Làn ${slotIndex + 1}`}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/70 font-mono mt-0.5">
                Xem trọn vẹn chỉ số sinh tồn, hiệu ứng trạng thái, nhánh Tuyệt Kỹ & 10 ô Cổ vật trang bị
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* IN-MODAL RECALL ACTION BUTTON */}
            {canRecall && onRecallCard && (
              <button
                type="button"
                onClick={() => {
                  onRecallCard();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 border border-emerald-400 text-white font-mono font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                title="Thu hồi lá bài này về hàng dự bị"
              >
                <span>↩ THU HỒI</span>
                <span className="text-amber-300">({recallsRemaining}/2)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950/80 text-slate-400 hover:text-red-200 border border-slate-700 hover:border-red-700 transition cursor-pointer"
              title="Đóng (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (2 COLUMNS) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: LARGE 3D SHOWCASE CARD (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start gap-3.5">
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
                transition: 'transform 0.15s ease-out',
                borderColor: tierInfo.hex,
                boxShadow: `0 0 25px ${tierInfo.hex}33, 0 20px 50px rgba(0,0,0,0.9)`,
              }}
              className="w-[260px] sm:w-[280px] h-[380px] sm:h-[410px] rounded-2xl bg-gradient-to-b from-[#3a281c] via-[#24170d] to-[#140b05] border-[3px] p-3.5 flex flex-col justify-between relative cursor-grab overflow-hidden select-none"
            >
              {/* Dynamic light reflection sweep */}
              <div
                style={{
                  background: `radial-gradient(circle at ${50 + tilt.y * 3}% ${50 - tilt.x * 3}%, rgba(255,255,255,0.22) 0%, transparent 60%)`,
                }}
                className="absolute inset-0 pointer-events-none z-30"
              />

              {/* Card Title Banner */}
              <div className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 border border-amber-400/50 shadow flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    style={{ backgroundColor: tierInfo.hex }}
                    className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black text-slate-950 uppercase shrink-0 ring-1 ring-black/40"
                  >
                    {tierInfo.code}
                  </span>
                  <span className="font-fantasy font-black text-xs sm:text-sm text-amber-100 drop-shadow truncate">
                    {card.name}
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-slate-950 bg-amber-200 px-1.5 py-0.5 rounded font-mono shrink-0">
                  {elementData.name}
                </span>
              </div>

              {/* 3D Creature Portrait Frame */}
              <div className="w-full h-44 rounded-xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-900/80 shadow-inner flex items-center justify-center relative overflow-hidden my-auto">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25)_0%,transparent_70%)]" />
                <span className="text-6xl sm:text-7xl filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)] transform hover:scale-110 transition-transform duration-300">
                  {card.avatar}
                </span>

                {/* HP Gem */}
                <div className="absolute bottom-2 left-2 z-20 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-red-700 border border-red-300 text-white font-mono font-black text-xs shadow-lg flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-white" />
                  <span>{card.hp}</span>
                </div>

                {/* ATK Gem */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 border border-yellow-300 text-slate-950 font-mono font-black text-xs shadow-lg flex items-center gap-1">
                  <Swords className="w-3 h-3" />
                  <span>{card.attackPower}</span>
                </div>

                {/* Speed Gem */}
                <div className="absolute bottom-2 right-2 z-20 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-700 border border-green-300 text-white font-mono font-black text-xs shadow-lg flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-white" />
                  <span>{effectiveSpeed}</span>
                </div>
              </div>

              {/* Passive Badge */}
              <div className="w-full py-1 px-2 rounded-lg bg-amber-950/90 border border-amber-700/60 text-center text-[10px] font-bold text-amber-300 z-10 truncate shadow-xs">
                ✨ {card.passive.name.toUpperCase()}
              </div>

              {/* Skills Quick Display */}
              <div className="space-y-1 z-10">
                {card.skills.map((sk, idx) => (
                  <div
                    key={idx}
                    className={`py-1 px-2 rounded-lg border flex items-center justify-between text-[10px] transition ${
                      currentSkillIndex === idx
                        ? 'bg-amber-500/30 border-amber-400 text-amber-100 font-bold'
                        : 'bg-slate-900/90 border-amber-900/50 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{idx === 2 ? '⭐ ' : '⚡ '}{sk.name}</span>
                    <span className="font-mono font-black text-amber-400 shrink-0 ml-1">
                      {sk.baseDamage > 0 ? `⚔ ${sk.baseDamage}` : sk.healAmount ? `💚 +${sk.healAmount}` : '🛡 Giáp'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <span className="text-[10.5px] text-amber-400/80 font-mono tracking-wider">
              🖱️ (Rê chuột trên thẻ để xoay góc nhìn 3D vật lý)
            </span>
          </div>

          {/* RIGHT COLUMN: ATTRIBUTES, STATUS, PASSIVE, SKILLS & RELICS (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* 1. VITAL STATS & ELEMENTAL ADVANTAGE */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-900/60 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-fantasy font-black text-xs sm:text-sm text-amber-300 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  CHỈ SỐ SINH TỒN & NGUYÊN TỐ
                </h3>
                <span className="text-[10px] font-mono text-amber-400/80 font-bold">
                  Hệ số Bậc: x{tierInfo.multiplier}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                {/* HP */}
                <div className="p-2 rounded-xl bg-slate-950/90 border border-rose-900/60 shadow-xs">
                  <span className="text-[10px] text-rose-300 block font-bold">SINH LỰC (HP)</span>
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

                {/* Attack */}
                <div className="p-2 rounded-xl bg-slate-950/90 border border-amber-900/60 shadow-xs">
                  <span className="text-[10px] text-amber-300 block font-bold">TẤN CÔNG (ATK)</span>
                  <span className="text-sm sm:text-base font-black text-amber-200">{card.attackPower}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Sát thương phẳng</span>
                </div>

                {/* Speed */}
                <div className="p-2 rounded-xl bg-slate-950/90 border border-emerald-900/60 shadow-xs">
                  <span className="text-[10px] text-emerald-300 block font-bold">TỐC ĐỘ (SPD)</span>
                  <span className="text-sm sm:text-base font-black text-emerald-200">{effectiveSpeed}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Cơ bản: {card.speed}</span>
                </div>

                {/* Shield */}
                <div className="p-2 rounded-xl bg-slate-950/90 border border-blue-900/60 shadow-xs">
                  <span className="text-[10px] text-blue-300 block font-bold">GIÁP ẢO</span>
                  <span className="text-sm sm:text-base font-black text-blue-200">{card.shield}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Hấp thụ đòn</span>
                </div>
              </div>

              {/* Elemental Advantage Matrix */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[10.5px] space-y-1 font-mono">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Ưu thế khắc hệ: </span>
                  <span className="text-slate-300 font-normal">
                    {elementData.strongAgainst.length > 0 ? elementData.strongAgainst.join(', ') : 'Không có'}
                  </span>
                </div>
                {elementData.weakAgainst.length > 0 && (
                  <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                    <Shield className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Bị khắc chế bởi: </span>
                    <span className="text-slate-300 font-normal">{elementData.weakAgainst.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Active Status Effects */}
              {card.statusEffects && card.statusEffects.length > 0 && (
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-purple-300 font-mono">HIỆU ỨNG ĐANG TÁC DỤNG:</span>
                  {card.statusEffects.map((st, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full bg-purple-900/70 border border-purple-400 text-purple-100 text-[10px] font-mono font-bold flex items-center gap-1">
                      {st.type === 'burn' && '🔥 Cháy (-1 HP)'}
                      {st.type === 'poison' && '☠️ Độc (-1 HP)'}
                      {st.type === 'haste' && '⚡ Tăng Tốc (+2 SPD)'}
                      {st.type === 'strengthen' && '⚔️ Tăng Công (+2 ATK)'}
                      {st.type === 'thorns' && '🪞 Gai Phản Đòn'}
                      {st.type === 'freeze' && '❄️ Đóng Băng'}
                      {st.type === 'weaken' && '💔 Suy Yếu (-30% ST)'}
                      {st.type === 'vulnerable' && '🎯 Dễ Tổn Thương (+30% ST)'}
                      {st.type === 'shield' && '🛡️ Giáp Ảo'}
                      {st.type === 'regen' && '🌱 Hồi Phục (+1 HP)'}
                      <span className="text-amber-300">({st.duration} lượt)</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 2. PASSIVE ABILITY DETAIL */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-900/60 shadow-lg space-y-1.5">
              <h3 className="font-fantasy font-black text-xs sm:text-sm text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                NỘI TẠI BÍ TRUYỀN: {card.passive.name.toUpperCase()}
              </h3>
              <p className="text-[11.5px] sm:text-xs text-amber-100/90 leading-relaxed font-sans bg-slate-950/80 p-2.5 rounded-xl border border-amber-900/40">
                {card.passive.description}
              </p>
            </div>

            {/* 3. SKILLS CODEX DETAIL & DIRECT SELECTION */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-900/60 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-fantasy font-black text-xs sm:text-sm text-amber-300 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-orange-400" />
                  BỘ KỸ NĂNG & TUYỆT KỸ CHIẾN ĐẤU (3 CHIÊU THỨC)
                </h3>
                {isPlayer && onSelectSkill && (
                  <span className="text-[10.5px] text-amber-400 font-mono font-bold animate-pulse">
                    👉 Bấm chọn chiêu để chỉ định hành động lượt này!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {card.skills.map((skill, idx) => {
                  const isUlt = idx === 2 || skill.isUltimate;
                  const isSpent = isUlt && (card.ultimateUsed || skill.usedThisCombat);
                  const onCd = (skill.currentCooldown || 0) > 0 && !isUlt;
                  const isSelected = currentSkillIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/70 shadow-md'
                          : isUlt
                          ? 'bg-gradient-to-r from-amber-950/60 to-slate-950/90 border-amber-600/70'
                          : 'bg-slate-950/90 border-slate-800 hover:border-amber-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-fantasy font-black text-amber-200 text-xs sm:text-sm flex items-center gap-1">
                            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                            {isUlt ? `👑 [TUYỆT KỸ] ${skill.name}` : skill.name}
                          </span>
                          <span className={`text-[9.5px] font-mono font-bold px-2 py-0.2 rounded border ${
                            isUlt
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : idx === 0
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : 'bg-blue-950 text-blue-300 border-blue-700'
                          }`}>
                            {isUlt ? '1 LẦN / TRẬN' : idx === 0 ? 'Năng Lượng 0 (Mỗi Lượt)' : 'Hồi Chiêu 1 Lượt'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="font-mono text-xs font-bold">
                            {skill.baseDamage > 0 && (
                              <span className="text-red-400">⚔ {skill.baseDamage} ST</span>
                            )}
                            {skill.healAmount && (
                              <span className="text-emerald-400">💚 +{skill.healAmount} HP</span>
                            )}
                          </div>

                          {/* IN-MODAL SKILL SELECTION BUTTON */}
                          {isPlayer && onSelectSkill && !isSpent && !onCd && (!isUlt || isUltUnlocked) && (
                            <button
                              type="button"
                              onClick={() => {
                                sound.playCardSelect();
                                onSelectSkill(idx as 0 | 1 | 2);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black transition cursor-pointer shadow-sm ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-200'
                                  : 'bg-slate-800 hover:bg-amber-900 border border-slate-600 text-amber-200'
                              }`}
                            >
                              {isSelected ? '✓ ĐANG CHỌN' : '⚡ CHỌN CHIÊU NÀY'}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
                        {skill.description}
                      </p>

                      {/* ULTIMATE 3-BRANCH UNLOCK STATUS */}
                      {isUlt && (
                        <div className="mt-2 pt-2 border-t border-amber-900/40 text-[10px] font-mono space-y-1">
                          <div className="text-amber-300 font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Điều kiện mở khóa Tuyệt Kỹ (Thỏa mãn 1 trong 3 nhánh):</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-0.5">
                            <div className={`p-1.5 rounded border ${condHits ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                              <span>Đòn đã đánh: {card.hitsDealt || 0}/2</span> {condHits ? '✓' : ''}
                            </div>
                            <div className={`p-1.5 rounded border ${condLowHp ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                              <span>Máu &lt; 50%: {card.hp}/{card.maxHp}</span> {condLowHp ? '✓' : ''}
                            </div>
                            <div className={`p-1.5 rounded border ${condRage ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                              <span>Nộ khí: {card.hiddenRage || 0}/3</span> {condRage ? '✓' : ''}
                            </div>
                          </div>
                          {isSpent && (
                            <div className="text-red-400 font-bold mt-1">
                              ⚠️ Đã tung Tuyệt Kỹ trong trận này! Quái thú rơi vào trạng thái Kiệt Sức 2 lượt sau khi dùng.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. EQUIPPED RELICS (10 SLOTS) */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-900/60 shadow-lg space-y-2">
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
                  (Thẻ bài này chưa trang bị Relic nào. Nhận thêm Cổ vật từ Rương Kho Báu, Thương Điếm Yêu Tinh hoặc Tiêu diệt Quái Tinh Anh!)
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
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
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{opposingCard.avatar}</span>
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono block">ĐỐI THỦ TRỰC DIỆN (LÀN {slotIndex + 1})</span>
                    <span className="font-bold text-slate-200 text-sm">{opposingCard.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      HP: {opposingCard.hp}/{opposingCard.maxHp} • SPD: {getEffectiveSpeed(opposingCard)}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono text-[10.5px] space-y-0.5">
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

            {/* 6. DARK CONTINENT HUNTER X HUNTER LORE */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-amber-950/60 text-xs space-y-1">
              <span className="text-amber-400 font-bold font-mono text-[10.5px] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>HỒ SƠ LỤC ĐỊA ĐEN (HUNTER X HUNTER):</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Sinh vật sinh tồn tại vùng biên hải Biển Mobius của Lục Địa Đen. Được nuôi dưỡng bởi dòng chảy khí niệm viễn cổ, thể chất sở hữu khả năng phòng ngự tự nhiên và đòn đánh mang thuộc tính khắc chế nguyên tố nguyên thủy.
              </p>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-amber-900/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px] text-amber-200/70">
            💡 Mẹo: Bạn có thể nhấp chuột trái vào nút &quot;🔍 Chi tiết&quot; hoặc chuột phải vào bất kỳ lá bài nào trên sân để mở nhanh bảng này.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-amber-100 font-bold text-xs shadow transition active:scale-95 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
