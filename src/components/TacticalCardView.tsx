import React, { useState, useRef } from 'react';
import { Card } from '../models/card';
import { TIERS } from '../models/tier';
import { getDisplayedStatValue } from '../ui/statDisplay';
import { getCard3DTiltTransform, Card3DTilt } from '../ui/card3DTilt';
import { calculateSkillEffectPreview } from '../ui/skillEffectPreview';
import { checkUltimateUnlock } from '../combat/ultimate';
import { SkillDetailPopover } from './SkillDetailPopover';
import { Swords, Shield, Zap, Lock, Heart, Sparkles } from 'lucide-react';

interface TacticalCardViewProps {
  card: Card;
  isSelected?: boolean;
  isCurrentActor?: boolean;
  onSelectSkill?: (skillType: 'basic' | 'utility' | 'ultimate') => void;
  selectedSkillType?: 'basic' | 'utility' | 'ultimate';
  className?: string;
}

export const TacticalCardView: React.FC<TacticalCardViewProps> = ({
  card,
  isSelected = false,
  isCurrentActor = false,
  onSelectSkill,
  selectedSkillType = 'basic',
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<Card3DTilt>({ rotateXDeg: 0, rotateYDeg: 0 });
  const [hoveredSkill, setHoveredSkill] = useState<'basic' | 'utility' | 'ultimate' | null>(null);

  const tierInfo = TIERS[card.tier] || TIERS.C;
  const isUltUnlocked = checkUltimateUnlock(card);
  const isDead = card.currentHP <= 0;

  // Stat displays with in-place delta indicators (Section 11.2)
  const atkDisplay = getDisplayedStatValue(
    card.computedATK,
    card.modifiers?.filter((m) => m.statType === 'ATK')
  );
  const spdDisplay = getDisplayedStatValue(
    card.computedSPD,
    card.modifiers?.filter((m) => m.statType === 'SPD')
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isDead) return;
    const rect = cardRef.current.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;
    const newTilt = getCard3DTiltTransform(pointerX, pointerY, rect.width, rect.height);
    setTilt(newTilt);
  };

  const handleMouseLeave = () => {
    setTilt({ rotateXDeg: 0, rotateYDeg: 0 });
    setHoveredSkill(null);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(600px) rotateX(${tilt.rotateXDeg}deg) rotateY(${tilt.rotateYDeg}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      className={`relative w-64 rounded-2xl select-none transition-all ${
        isDead ? 'opacity-40 grayscale rotate-90 translate-y-8 duration-500' : ''
      } ${className}`}
    >
      {/* 3D Physical Card Edge Layer (Offset 5px to bottom-right, Section 13.1) */}
      <div
        style={{ borderColor: tierInfo.hex }}
        className="absolute inset-0 rounded-2xl bg-black/80 translate-x-1.5 translate-y-1.5 -z-10 shadow-2xl"
      />

      {/* Main Card Face with Dual Border (Section 13.1) */}
      <div
        style={{ borderColor: tierInfo.hex }}
        className={`relative w-full rounded-2xl bg-gradient-to-b from-slate-900 via-[#101725] to-slate-950 border-2 p-3 flex flex-col justify-between shadow-xl ring-1 ring-white/10 ${
          isSelected ? 'ring-4 ring-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.8)]' : ''
        } ${isCurrentActor ? 'ring-2 ring-emerald-400 animate-pulse' : ''}`}
      >
        {/* Top Header: Tier Badge & Name */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              style={{ backgroundColor: tierInfo.hex }}
              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black text-slate-950 uppercase shrink-0 shadow-xs"
            >
              {card.tier}
            </span>
            <h3 className="font-fantasy font-black text-sm text-slate-100 truncate">
              {card.name}
            </h3>
          </div>

          {/* Equipped Relic Counter (Section 7.3: max 10) */}
          <div
            className="flex items-center gap-1 text-[10px] font-mono text-amber-300 shrink-0"
            title={`Cổ vật: ${card.relicSlotsUsed}/${card.relicSlotsMax} loại`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{card.relicSlotsUsed}/10</span>
          </div>
        </div>

        {/* Center Artwork Portal */}
        <div className="my-2 py-3 rounded-xl bg-gradient-to-b from-white/5 to-black/30 border border-white/10 flex items-center justify-center relative overflow-hidden shadow-inner">
          <span className="text-4xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            {card.avatar || '🐉'}
          </span>
          {card.currentShield > 0 && (
            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-cyan-900/90 border border-cyan-400 text-cyan-200 text-[10px] font-mono font-black flex items-center gap-0.5">
              <Shield className="w-3 h-3 text-cyan-300" />
              <span>+{card.currentShield}</span>
            </div>
          )}
        </div>

        {/* In-place Stat Bar (Section 11.2) */}
        <div className="grid grid-cols-3 gap-1.5 py-1.5 font-mono text-[11px] text-center border-y border-white/10">
          {/* HP */}
          <div className="px-1 py-0.5 rounded bg-red-950/80 border border-red-800/60 flex items-center justify-center gap-0.5">
            <Heart className="w-3 h-3 text-red-400" />
            <span className="font-bold text-red-200">
              {card.currentHP}/{card.computedHP}
            </span>
          </div>

          {/* ATK with Delta */}
          <div className="px-1 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 flex items-center justify-center gap-0.5">
            <Swords className="w-3 h-3 text-amber-400" />
            <span
              className={`font-bold ${
                atkDisplay.deltaType === 'buff'
                  ? 'text-emerald-400'
                  : atkDisplay.deltaType === 'debuff'
                  ? 'text-red-400'
                  : 'text-amber-200'
              }`}
            >
              {atkDisplay.displayText}
            </span>
          </div>

          {/* SPD with Delta */}
          <div className="px-1 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center gap-0.5">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span
              className={`font-bold ${
                spdDisplay.deltaType === 'buff'
                  ? 'text-emerald-400'
                  : spdDisplay.deltaType === 'debuff'
                  ? 'text-red-400'
                  : 'text-cyan-200'
              }`}
            >
              {spdDisplay.displayText}
            </span>
          </div>
        </div>

        {/* 3 Skill Action Slabs (Section 11.1 & 13.2) */}
        <div className="mt-2 flex flex-col gap-1.5 relative">
          {/* Skill 1: Basic */}
          <button
            type="button"
            onClick={() => onSelectSkill?.('basic')}
            onMouseEnter={() => setHoveredSkill('basic')}
            className={`px-2.5 py-1.5 rounded-lg border text-left flex items-center justify-between transition active:scale-95 ${
              selectedSkillType === 'basic'
                ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50'
                : 'bg-white/5 border-white/10 hover:border-amber-400/50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Swords className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-fantasy font-black text-xs text-slate-100 truncate">
                {card.skills.basic.name}
              </span>
            </div>
            <span className="font-mono text-[10px] text-amber-300 shrink-0 font-bold">
              ⚔{card.computedATK}
            </span>
          </button>

          {/* Skill 2: Utility */}
          <button
            type="button"
            onClick={() => onSelectSkill?.('utility')}
            onMouseEnter={() => setHoveredSkill('utility')}
            className={`px-2.5 py-1.5 rounded-lg border text-left flex items-center justify-between transition active:scale-95 ${
              selectedSkillType === 'utility'
                ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/50'
                : 'bg-white/5 border-white/10 hover:border-cyan-400/50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-fantasy font-black text-xs text-slate-100 truncate">
                {card.skills.utility.name}
              </span>
            </div>
            <span className="font-mono text-[10px] text-cyan-300 shrink-0 font-bold">
              {card.skills.utility.shield ? `🛡+${card.skills.utility.shield}` : '✨Hỗ Trợ'}
            </span>
          </button>

          {/* Skill 3: Ultimate */}
          <button
            type="button"
            onClick={() => isUltUnlocked && onSelectSkill?.('ultimate')}
            onMouseEnter={() => setHoveredSkill('ultimate')}
            disabled={!isUltUnlocked}
            className={`px-2.5 py-1.5 rounded-lg border text-left flex items-center justify-between transition ${
              isUltUnlocked
                ? selectedSkillType === 'ultimate'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300 shadow-md animate-pulse'
                  : 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 border-amber-300 hover:brightness-110'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {isUltUnlocked ? (
                <Zap className="w-3.5 h-3.5 text-slate-950 fill-current shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <span className="font-fantasy font-black text-xs truncate">
                {card.skills.ultimate.name}
              </span>
            </div>
            <span className="font-mono text-[10px] font-black shrink-0">
              {isUltUnlocked ? `💥${card.skills.ultimate.damage}` : '🔒KHÓA'}
            </span>
          </button>

          {/* Skill Detail Popover on Hover (Section 13.2) */}
          {hoveredSkill && (
            <SkillDetailPopover
              preview={calculateSkillEffectPreview(card, hoveredSkill)}
              iconType={
                hoveredSkill === 'basic'
                  ? 'basic_attack'
                  : hoveredSkill === 'utility'
                  ? 'utility'
                  : 'ultimate'
              }
              className="top-full mt-2 left-0"
              onClose={() => setHoveredSkill(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
