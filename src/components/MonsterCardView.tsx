import React, { useState } from 'react';
import { MonsterCard, PlannedAction, ElementType, Skill } from '../types/game';
import { calculateCaptureRate } from '../engine/capture';
import { getEffectiveSpeed } from '../engine/combat';
import { sound } from '../utils/audio';
import { Shield, Sparkles, Flame, Skull, Crosshair, ArrowLeftRight, Heart, Zap, Lock, Swords } from 'lucide-react';
import { TIERS } from '../models/tier';
import { getDisplayedStatValue } from '../ui/statDisplay';

export interface HoveredSkillData {
  skill: Skill;
  monsterName: string;
  element: ElementType;
  hasCleave?: boolean;
  hasBurn?: boolean;
  isPlayer: boolean;
  slotIndex: number;
  skillIndex: 0 | 1 | 2;
  rect: { top: number; left: number; width: number; height: number; bottom: number; right: number };
}

export interface MonsterCardViewProps {
  card: MonsterCard | null;
  slotIndex: number;
  isPlayer: boolean;
  isSelectedTarget?: boolean;
  isCurrentActor?: boolean;
  isTakingDamage?: boolean;
  isFatalBlow?: boolean;
  isCritDamage?: boolean;
  dealDelay?: number;
  captureStage?: 'idle' | 'containment' | 'rattle_1' | 'rattle_2' | 'rattle_3' | 'success' | 'failed';
  currentAction?: PlannedAction;
  enemyIntent?: {
    skillName: string;
    targetSlot: number;
    damage: number;
    isOpposing: boolean;
  };
  onSelectTarget?: () => void;
  onSelectSkill?: (skillIndex: 0 | 1 | 2) => void;
  onAttemptCapture?: () => void;
  onInspectCard?: () => void;
  onHoverSkill?: (data: HoveredSkillData | null) => void;
  canCapture?: boolean;
  hasCaptureCard?: boolean;
  floatingDamage?: { text: string; type: 'damage' | 'heal' | 'burn' | 'splash'; isCrit?: boolean; isElemAdvantage?: boolean } | null;
  // Mouse Drag & Drop / Click Swap Props
  isDraggable?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  isSwapSelected?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onTriggerSwap?: () => void;
  onDisabledSkillClick?: (msg: string) => void;
  needsSkillSelection?: boolean;
  isActivePlayerSlot?: boolean;
  onSelectActiveSlot?: () => void;
  onRecall?: () => void;
  recallsRemaining?: number;
}

// Dark Fantasy TCG Palettes inspired by Image 2 (Phapoda, Alpino, Peacarp, Abyssal Elk)
const CARD_PALETTES = {
  fire: {
    bg: 'bg-[#dfd3c3]',
    border: 'border-[#8a381e]',
    headerBg: 'bg-gradient-to-r from-[#6b2310] via-[#853018] to-[#6b2310]',
    headerText: 'text-[#fef3c7]',
    skillBg: 'bg-[#ede2d2] border-[#c2b29c]',
    skillSelectedBg: 'bg-[#fed7aa] border-[#ea580c] ring-2 ring-[#ea580c]/60',
    artTint: 'from-[#431407] via-[#7c2d12] to-[#1c0a04]',
    talentBg: 'bg-[#3b2319] text-[#fed7aa]',
    elementBadge: '🔥 Hỏa',
  },
  water: {
    bg: 'bg-[#cddbe2]',
    border: 'border-[#245772]',
    headerBg: 'bg-gradient-to-r from-[#11384e] via-[#1b4b66] to-[#11384e]',
    headerText: 'text-[#e0f2fe]',
    skillBg: 'bg-[#dce7ec] border-[#a2b9c5]',
    skillSelectedBg: 'bg-[#bae6fd] border-[#0284c7] ring-2 ring-[#0284c7]/60',
    artTint: 'from-[#082f49] via-[#075985] to-[#041d2e]',
    talentBg: 'bg-[#142e3d] text-[#bae6fd]',
    elementBadge: '💧 Thủy',
  },
  nature: {
    bg: 'bg-[#cdd8cc]',
    border: 'border-[#2b613e]',
    headerBg: 'bg-gradient-to-r from-[#173d25] via-[#215433] to-[#173d25]',
    headerText: 'text-[#dcfce7]',
    skillBg: 'bg-[#dce4db] border-[#a5b9a4]',
    skillSelectedBg: 'bg-[#bbf7d0] border-[#16a34a] ring-2 ring-[#16a34a]/60',
    artTint: 'from-[#022c22] via-[#065f46] to-[#011a14]',
    talentBg: 'bg-[#183523] text-[#bbf7d0]',
    elementBadge: '🌿 Mộc',
  },
  thunder: {
    bg: 'bg-[#ddd9bf]',
    border: 'border-[#75661a]',
    headerBg: 'bg-gradient-to-r from-[#4d400e] via-[#665413] to-[#4d400e]',
    headerText: 'text-[#fef9c3]',
    skillBg: 'bg-[#e8e4cf] border-[#bfb794]',
    skillSelectedBg: 'bg-[#fef08a] border-[#ca8a04] ring-2 ring-[#ca8a04]/60',
    artTint: 'from-[#422006] via-[#713f12] to-[#241103]',
    talentBg: 'bg-[#3b320d] text-[#fef08a]',
    elementBadge: '⚡ Lôi',
  },
  earth: {
    bg: 'bg-[#d8d2c7]',
    border: 'border-[#5e4b33]',
    headerBg: 'bg-gradient-to-r from-[#3e2c19] via-[#523b23] to-[#3e2c19]',
    headerText: 'text-[#fef3c7]',
    skillBg: 'bg-[#e5dfd4] border-[#b8ab97]',
    skillSelectedBg: 'bg-[#fed7aa] border-[#b45309] ring-2 ring-[#b45309]/60',
    artTint: 'from-[#291b0f] via-[#4d341a] to-[#170e08]',
    talentBg: 'bg-[#291c11] text-[#fed7aa]',
    elementBadge: '🌍 Thổ',
  },
  dark: {
    bg: 'bg-[#d2ced9]',
    border: 'border-[#4a3463]',
    headerBg: 'bg-gradient-to-r from-[#291b3b] via-[#3a2652] to-[#291b3b]',
    headerText: 'text-[#f3e8ff]',
    skillBg: 'bg-[#e0dce6] border-[#aba2b8]',
    skillSelectedBg: 'bg-[#ddd6fe] border-[#7c3aed] ring-2 ring-[#7c3aed]/60',
    artTint: 'from-[#1e1b4b] via-[#3b0764] to-[#0f0c24]',
    talentBg: 'bg-[#2b1b3d] text-[#ddd6fe]',
    elementBadge: '🌑 Ám',
  },
  light: {
    bg: 'bg-[#e4ddcc]',
    border: 'border-[#7d6423]',
    headerBg: 'bg-gradient-to-r from-[#4d3d13] via-[#634e18] to-[#4d3d13]',
    headerText: 'text-[#fef3c7]',
    skillBg: 'bg-[#ece6d7] border-[#c4baa2]',
    skillSelectedBg: 'bg-[#fde68a] border-[#d97706] ring-2 ring-[#d97706]/60',
    artTint: 'from-[#451a03] via-[#78350f] to-[#240d01]',
    talentBg: 'bg-[#3b2e0e] text-[#fde68a]',
    elementBadge: '✨ Quang',
  },
};

export const MonsterCardView: React.FC<MonsterCardViewProps> = ({
  card,
  slotIndex,
  isPlayer,
  isSelectedTarget,
  isCurrentActor,
  isTakingDamage,
  isFatalBlow,
  isCritDamage,
  dealDelay,
  captureStage = 'idle',
  currentAction,
  enemyIntent,
  onSelectTarget,
  onSelectSkill,
  onAttemptCapture,
  onInspectCard,
  onHoverSkill,
  canCapture,
  hasCaptureCard,
  floatingDamage,
  isDraggable = false,
  isDragging = false,
  isDragOver = false,
  isSwapSelected = false,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onTriggerSwap,
  onDisabledSkillClick,
  needsSkillSelection = false,
  isActivePlayerSlot = false,
  onSelectActiveSlot,
  onRecall,
  recallsRemaining = 2,
}) => {
  // 3D Tilt & Specular Glare state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  if (!card) {
    return (
      <div
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onTriggerSwap}
        className={`game-card-root empty-lane-slot flex flex-col items-center justify-between p-3.5 text-center select-none cursor-pointer transition-all duration-300 relative overflow-hidden group ${
          isDragOver ? 'is-drag-over ring-4 ring-emerald-400/90 scale-[1.02]' : ''
        }`}
      >
        {/* Ancient Runic Arcane Circle Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15)_0%,_rgba(4,18,12,0.95)_85%)] pointer-events-none" />

        {/* Top Header Badge */}
        <div className="w-full py-1 px-2.5 rounded bg-emerald-950/90 border border-emerald-500/40 shadow flex items-center justify-between z-10">
          <span className="font-fantasy font-black text-xs sm:text-[13px] text-emerald-300 tracking-wider">
            🏛️ BỆ TRIỆU HỒI
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono font-black text-emerald-400">
            LÀN {slotIndex + 1}
          </span>
        </div>

        {/* Center Rune Pedestal Sigil */}
        <div className="my-auto flex flex-col items-center z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-900/60 via-slate-900 to-black/80 border-2 border-emerald-500/50 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_25px_rgba(16,185,129,0.35)] group-hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] group-hover:scale-105 transition-all">
            {isPlayer ? '📥' : '🌲'}
          </div>
          <span className="mt-2 text-xs sm:text-sm font-fantasy font-black tracking-wide text-emerald-200 drop-shadow">
            {isPlayer ? 'VỊ TRÍ CHIẾN ĐẤU' : 'RỪNG HOANG DÃ'}
          </span>
        </div>

        {/* Bottom Instruction Pill */}
        <div className="w-full z-10">
          {isPlayer ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] sm:text-xs font-black text-amber-200 bg-amber-950/90 px-3 py-1 rounded-full border border-amber-500/70 shadow-md group-hover:border-amber-300 group-hover:text-amber-100 transition">
                ⚡ Chạm để đặt quái thú
              </span>
              <span className="text-[10px] text-emerald-300/70 font-mono">hoặc kéo thả từ túi dự bị</span>
            </div>
          ) : (
            <span className="text-[10.5px] text-slate-400 font-mono font-medium">Trống (Kẻ địch chưa xuất hiện)</span>
          )}
        </div>
      </div>
    );
  }

  const isDead = card.hp <= 0;
  const tierInfo = TIERS[card.tier || 'C'] || TIERS.C;
  const palette = CARD_PALETTES[card.element] || CARD_PALETTES.nature;
  const hpPercent = Math.max(0, Math.min(100, Math.round((card.hp / card.maxHp) * 100)));
  const captureRate = !isPlayer && !isDead ? calculateCaptureRate(card) : 0;
  const effectiveSpeed = getEffectiveSpeed(card);
  const isUltUnlocked = (card.hitsDealt || 0) >= 2 || (card.hp / card.maxHp) < 0.5 || (card.hiddenRage || 0) >= 3;

  // Synergy detection
  const hasCleave = card.equippedRelics.some(r => r.type === 'cleave');
  const hasBurn = card.equippedRelics.some(r => r.type === 'burn');

  const isBurned = card.statusEffects.some(s => s.type === 'burn');
  const isPoisoned = card.statusEffects.some(s => s.type === 'poison');

  // Mouse Move for 3D Perspective Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDead) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));
    setTilt({
      x: -((y - rect.height / 2) / (rect.height / 2)) * 6,
      y: ((x - rect.width / 2) / (rect.width / 2)) * 6,
    });
    setGlare({ x: xPercent, y: yPercent, opacity: 0.22 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="game-card-3d-wrapper relative select-none">
      {/* 3D Physical Card Edge Layer (Section 13.1: offset 5px to bottom-right, darker tone) */}
      <div
        style={{ borderColor: tierInfo.hex }}
        className="absolute inset-0 rounded-2xl bg-black/85 translate-x-1.5 translate-y-1.5 -z-10 shadow-2xl border-2 pointer-events-none opacity-80"
      />
      <div
        draggable={isPlayer && !isDead && isDraggable}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onContextMenu={(e) => {
          e.preventDefault();
          if (onInspectCard) onInspectCard();
        }}
        onClick={() => {
          if (!isPlayer && onSelectTarget && !isDead) {
            sound.playCardSelect();
            onSelectTarget();
          } else if (isPlayer && onSelectActiveSlot && !isDead) {
            sound.playCardSelect();
            onSelectActiveSlot();
          }
        }}
        style={{
          transform: !isDead
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            : undefined,
          borderColor: tierInfo.hex,
          boxShadow: `0 0 0 1px ${tierInfo.hex}44, 0 10px 25px -5px rgba(0, 0, 0, 0.6)`,
          ...(dealDelay !== undefined ? { animationDelay: `${dealDelay}ms` } : {}),
        }}
        className={`game-card-root ${palette.bg} p-1.5 sm:p-2 flex flex-col justify-between text-slate-800 relative group border-2 ${
          dealDelay !== undefined ? 'animate-card-deal' : ''
        } ${
          isDead ? 'opacity-55 grayscale scale-95' : ''
        } ${isSelectedTarget ? 'is-target' : ''} ${
          isActivePlayerSlot ? 'ring-2 sm:ring-4 ring-amber-400/90 shadow-[0_0_24px_rgba(245,158,11,0.7)]' : ''
        } ${
          isDragging ? 'is-dragging' : ''
        } ${
          isDragOver ? 'is-drag-over' : ''
        } ${
          isSwapSelected ? 'is-swap-source' : ''
        } ${
          isCurrentActor
            ? isPlayer ? 'is-actor-player animate-lunge-player' : 'is-actor-enemy animate-lunge-enemy'
            : ''
        } ${
          isTakingDamage ? 'animate-violent-hit' : ''
        } ${
          captureStage === 'rattle_1' ? 'animate-rattle-1' :
          captureStage === 'rattle_2' ? 'animate-rattle-2' :
          captureStage === 'rattle_3' ? 'animate-rattle-3' :
          captureStage === 'failed' ? 'animate-capture-burst' :
          captureStage === 'success' ? 'animate-golden-ascend' : ''
        } ${
          isPlayer && !isDead ? 'cursor-grab active:cursor-grabbing' : ''
        } ${
          !isPlayer && !isDead ? 'cursor-pointer hover:scale-[1.02]' : ''
        }`}
      >
        {/* SPECULAR GLARE OVERLAY */}
        <div
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 60%)`,
          }}
          className="card-specular-glare"
        />

        {/* FIXED LANE BADGE (Bài nằm ở vị trí cố định) */}
        {isPlayer && !isDead && (
          <div
            className="absolute -top-2.5 -left-2 z-30 px-2 py-0.5 rounded-full border shadow-sm bg-slate-950/90 border-slate-700 text-amber-300 text-[9px] font-mono font-bold flex items-center gap-1 pointer-events-none select-none"
            title={`Làn ${slotIndex + 1} • Vị trí chiến đấu cố định (Dùng Thu Hồi hoặc chờ trận mới để đặt lại)`}
          >
            <span>🔒 Làn {slotIndex + 1}</span>
          </div>
        )}

        {/* QUICK INSPECT BUTTON (1-Click xem chi tiết thẻ bài) */}
        {!isDead && onInspectCard && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playCardSelect();
              onInspectCard();
            }}
            className="absolute -top-2.5 -right-2 z-30 p-1 rounded-full border shadow-md bg-slate-900/90 border-slate-700 text-slate-300 hover:text-amber-300 hover:scale-110 transition cursor-pointer"
            title="Xem chi tiết thẻ bài & bộ kĩ năng (Hoặc nhấp chuột phải)"
          >
            <span className="text-[11px] leading-none block px-0.5">🔍</span>
          </button>
        )}

        {/* Target Indicator: Clean and subtle without distorting card artwork */}

        {/* Slash Cut Visual FX */}
        {isTakingDamage && (
          <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-[140%] h-3.5 bg-gradient-to-r from-transparent via-amber-100 to-transparent shadow-[0_0_22px_#ef4444,0_0_40px_#f97316] animate-slash-cut" />
          </div>
        )}

        {/* Defeat / Elimination Stamp */}
        {isDead && (
          <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-black/50 backdrop-grayscale rounded-lg overflow-hidden">
            <div className="animate-defeat-stamp px-3 py-1.5 rounded bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.9),0_0_10px_rgba(0,0,0,0.8)] text-center flex flex-col items-center justify-center -rotate-12">
              <span className="flex items-center gap-1 font-fantasy font-black text-xs sm:text-sm text-red-100 tracking-widest leading-none drop-shadow">
                💀 HẠ GỤC
              </span>
              <span className="text-[7.5px] uppercase font-mono font-bold text-red-300 tracking-wider mt-0.5">
                TIÊU DIỆT
              </span>
            </div>
          </div>
        )}

        {/* Capture Container & Suspense Shakes */}
        {captureStage && captureStage !== 'idle' && (
          <div className="absolute inset-0 z-45 pointer-events-none flex flex-col items-center justify-center rounded-lg overflow-hidden backdrop-blur-xs">
            {(captureStage === 'containment' || captureStage.startsWith('rattle')) && (
              <div className="w-full h-full absolute inset-0 bg-purple-950/70 flex flex-col items-center justify-center p-2 text-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-purple-400/80 animate-spin flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.7)]">
                  <span className="text-2xl animate-pulse">🔮</span>
                </div>
                <div className="mt-2 px-2.5 py-1 rounded bg-slate-950/90 border border-purple-400 text-purple-200 font-mono font-bold text-[8.5px] sm:text-[9.5px] shadow-lg animate-pulse">
                  {captureStage === 'containment' && '⚡ ĐANG PHONG ẤN...'}
                  {captureStage === 'rattle_1' && '🔮 LẮC NHỊP 1 / 3...'}
                  {captureStage === 'rattle_2' && '⚡ QUÁI THÚ GIẰNG XÉ... 2 / 3!'}
                  {captureStage === 'rattle_3' && '🔥 NHỊP QUYẾT ĐỊNH... 3 / 3!'}
                </div>
              </div>
            )}
            {captureStage === 'failed' && (
              <div className="w-full h-full absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center p-2 text-center animate-capture-burst">
                <div className="px-3 py-1.5 rounded bg-red-950 border-2 border-red-500 text-red-100 font-fantasy font-black text-xs shadow-[0_0_25px_#ef4444] -rotate-6">
                  ❌ PHÁ VỠ PHONG ẤN!
                </div>
              </div>
            )}
            {captureStage === 'success' && (
              <div className="w-full h-full absolute inset-0 bg-amber-950/80 flex flex-col items-center justify-center p-2 text-center animate-golden-ascend">
                <div className="px-3 py-1.5 rounded bg-amber-900 border-2 border-yellow-400 text-yellow-100 font-fantasy font-black text-xs shadow-[0_0_30px_#f59e0b] animate-bounce">
                  ⭐ THU PHỤC THÀNH CÔNG!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Damage Popup */}
        {floatingDamage && (
          <div
            className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none font-black flex flex-col items-center animate-float-damage ${
              floatingDamage.type === 'heal'
                ? 'text-emerald-400 drop-shadow-[0_0_15px_#10b981]'
                : floatingDamage.type === 'burn'
                ? 'text-orange-500 drop-shadow-[0_0_15px_#f97316]'
                : floatingDamage.type === 'splash'
                ? 'text-cyan-400 drop-shadow-[0_0_15px_#06b6d4]'
                : 'text-rose-500 drop-shadow-[0_0_20px_#e11d48]'
            }`}
          >
            {floatingDamage.isCrit && (
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-400 text-amber-300 uppercase font-mono tracking-wider shadow-md mb-0.5">
                💥 BẠO KÍCH!
              </span>
            )}
            {floatingDamage.isElemAdvantage && !floatingDamage.isCrit && (
              <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-rose-950 border border-rose-400 text-rose-200 uppercase font-mono tracking-wider shadow-md mb-0.5">
                ⚡ KHẮC HỆ!
              </span>
            )}
            <span className="text-3xl sm:text-4xl xl:text-5xl tracking-tighter leading-none stroke-black stroke-2 font-black">
              {floatingDamage.text}
            </span>
          </div>
        )}

        {/* 1. TOP TITLE BANNER (Matching Image 2: Phapoda / Alpino) */}
        <div className={`w-full h-6 sm:h-7 px-2.5 rounded-t-sm border-b border-black/20 shadow-xs flex items-center justify-between shrink-0 ${palette.headerBg}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Tier Badge (Section 1: 8 Tiers) */}
            <span
              style={{ backgroundColor: tierInfo.hex }}
              className="px-1.5 py-0.2 rounded text-[8.5px] sm:text-[9.5px] font-mono font-black text-slate-950 uppercase shrink-0 shadow-xs ring-1 ring-black/40"
              title={`Bậc: ${tierInfo.name} (${tierInfo.code}) - Hệ số: x${tierInfo.multiplier}`}
            >
              {card.tier || 'C'}
            </span>
            <span className={`font-fantasy font-black text-xs sm:text-[13.5px] tracking-wide whitespace-nowrap ${palette.headerText} drop-shadow`}>
              {card.name}
            </span>
            {/* Subtle enemy intent pill on card header */}
            {!isPlayer && enemyIntent && !isDead && (
              <span className="px-1.5 py-0.5 rounded bg-red-950/90 border border-red-500/80 text-red-200 text-[8.5px] font-mono font-bold shrink-0">
                ⚔️➔Làn {enemyIntent.targetSlot + 1}
              </span>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-black text-slate-900 bg-amber-100/95 px-2 py-0.5 rounded shadow-xs shrink-0">
            {palette.elementBadge}
          </span>
        </div>

        {/* 2. ARTWORK WINDOW (Image 2 Signature Look!) */}
        <div className="card-art-box relative w-full my-0.5 rounded border border-black/40 shadow-inner bg-slate-950 flex items-center justify-center shrink-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b ${palette.artTint} opacity-95`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/15 via-transparent to-black/70 pointer-events-none" />

          {/* Capture Quick Orb on enemy card when low HP */}
          {!isPlayer && hasCaptureCard && canCapture && !isDead && card.hp <= card.maxHp * 0.45 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onAttemptCapture) onAttemptCapture();
              }}
              className="absolute top-1 right-1 z-30 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-600 hover:to-pink-500 border border-pink-300 text-white text-[8.5px] sm:text-[9.5px] font-mono font-black shadow-lg animate-pulse flex items-center gap-1"
              title="Bắt quái thú này vào tay!"
            >
              <Sparkles className="w-2.5 h-2.5 text-pink-200" />
              <span>Bắt</span>
            </button>
          )}

          {/* Creature Avatar */}
          <div className="relative z-10 text-3xl sm:text-4xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
            {card.avatar}
          </div>

          {/* Shield Counter on art if active */}
          {card.shield > 0 && (
            <div className="absolute top-1 left-1 z-20 px-2 py-0.5 rounded bg-blue-600/90 text-white text-[8.5px] sm:text-[9.5px] font-black flex items-center gap-1 shadow">
              <Shield className="w-2.5 h-2.5 fill-white" /> +{card.shield}
            </div>
          )}

          {/* Status Burn / Poison Tags on art */}
          {(isBurned || isPoisoned) && (
            <div className="absolute top-1 right-1 z-20 flex flex-col gap-0.5">
              {isBurned && (
                <span className="px-1.5 py-0.5 rounded bg-red-600/90 text-white text-[8px] font-black flex items-center gap-0.5 shadow animate-burn">
                  <Flame className="w-2.5 h-2.5" /> Cháy
                </span>
              )}
              {isPoisoned && (
                <span className="px-1.5 py-0.5 rounded bg-purple-700/90 text-white text-[8px] font-black flex items-center gap-0.5 shadow">
                  <Skull className="w-2.5 h-2.5" /> Độc
                </span>
              )}
            </div>
          )}

          {/* BOTTOM-LEFT HEART BADGE (HP) */}
          <div
            className="absolute -bottom-1 -left-1 z-20 px-2 py-0.5 rounded-full bg-gradient-to-br from-rose-600 via-red-600 to-red-950 border-2 border-[#fef08a] shadow-md flex items-center justify-center text-white font-black text-xs sm:text-[13px] font-mono gap-1"
            title={`Máu: ${card.hp}/${card.maxHp}`}
          >
            <Heart className="w-3 h-3 fill-white shrink-0" />
            <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{card.hp}</span>
          </div>

          {/* BOTTOM-CENTER ATK BADGE */}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-950 border-2 border-[#fef08a] shadow-md flex items-center justify-center text-white font-black text-xs sm:text-[13px] font-mono gap-1"
            title={`Sức tấn công ATK: ${card.attackPower}`}
          >
            <Swords className="w-3 h-3 text-amber-200 shrink-0" />
            <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{card.attackPower}</span>
          </div>

          {/* BOTTOM-RIGHT SPEED BADGE (SPD) */}
          <div
            className="absolute -bottom-1 -right-1 z-20 px-2 py-0.5 rounded-full bg-gradient-to-br from-teal-500 via-emerald-600 to-emerald-950 border-2 border-[#fef08a] shadow-md flex items-center justify-center text-white font-black text-xs sm:text-[13px] font-mono gap-1"
            title={`Tốc độ: ${effectiveSpeed}`}
          >
            <Zap className="w-3 h-3 fill-white shrink-0" />
            <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{effectiveSpeed}</span>
          </div>
        </div>

        {/* 3. TALENT / PASSIVE RIBBON BANNER */}
        <div className={`w-full py-0.5 px-2 rounded border border-black/20 text-center text-[9.5px] sm:text-[10.5px] font-bold tracking-wide my-0.5 shadow-xs truncate shrink-0 flex items-center justify-center gap-1.5 ${palette.talentBg}`}>
          <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
          <span className="font-black tracking-wide uppercase truncate">
            {card.passive.name}
          </span>
        </div>

        {/* 4. CLEAN SKILLS ACTION SLABS OR EXHAUSTED STATE */}
        {card.exhaustTurns && card.exhaustTurns > 0 ? (
          <div
            onClick={() => {
              if (onDisabledSkillClick) {
                onDisabledSkillClick(`💤 [${card.name}] đang kiệt sức sau khi tung Tuyệt Kỹ! Cần nghỉ ${card.exhaustTurns} lượt nữa mới hồi phục để dùng chiêu.`);
              }
            }}
            className="flex-1 my-0.5 sm:my-1 p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border-2 border-amber-500/70 shadow-inner flex flex-col items-center justify-center text-center cursor-not-allowed group/exhaust"
          >
            <span className="text-xl sm:text-2xl animate-pulse mb-0.5">💤</span>
            <span className="font-fantasy font-black text-[11px] sm:text-[13px] text-amber-300 uppercase tracking-wide">
              KIỆT SỨC
            </span>
            <div className="mt-0.5 px-2 py-0.2 rounded-full bg-amber-500/20 border border-amber-400 text-amber-200 font-mono font-black text-[9px] sm:text-[11px] shadow-sm animate-pulse">
              ⏳ Còn {card.exhaustTurns} lượt
            </div>
          </div>
        ) : (
          <>
            {/* MOBILE COMPACT INTENT / SKILL PREVIEW (md:hidden) */}
            <div className="md:hidden w-full my-0.5">
              {!isPlayer && enemyIntent && !isDead ? (
                <div className="w-full px-1.5 py-0.5 rounded bg-red-950/90 border border-red-500/70 flex items-center justify-between text-[9px] font-mono text-red-200 shadow-xs">
                  <span className="truncate font-fantasy font-black text-red-100">
                    ⚔️ {enemyIntent.skillName}
                  </span>
                  <span className="font-bold text-amber-300 ml-1 shrink-0">
                    {enemyIntent.damage} ST
                  </span>
                </div>
              ) : isPlayer && !isDead ? (
                <div className="w-full px-1.5 py-0.5 rounded bg-slate-900/90 border border-amber-500/70 flex items-center justify-between text-[9px] font-mono text-amber-200 shadow-xs">
                  <span className="truncate font-fantasy font-black text-amber-100 flex items-center gap-1">
                    <span>{currentAction?.skillIndex === 2 ? '⭐' : '⚡'}</span>
                    <span className="truncate">{card.skills[currentAction?.skillIndex || 0]?.name || 'Chiêu cơ bản'}</span>
                  </span>
                  <span className="font-black text-amber-300 ml-1 shrink-0">
                    {card.skills[currentAction?.skillIndex || 0]?.baseDamage > 0
                      ? `⚔${card.skills[currentAction?.skillIndex || 0]?.baseDamage}`
                      : card.skills[currentAction?.skillIndex || 0]?.healAmount
                      ? `💚+${card.skills[currentAction?.skillIndex || 0]?.healAmount}`
                      : '🛡'}
                  </span>
                </div>
              ) : null}
            </div>

            {/* DESKTOP FULL 3-SKILL SLABS (hidden md:flex) */}
            <div className={`hidden md:flex flex-col gap-1 sm:gap-1.5 my-1 flex-1 justify-center relative p-0.5 rounded-lg transition-all ${
              isPlayer && !isDead && needsSkillSelection ? 'ring-2 ring-amber-400 bg-amber-950/20' : ''
            }`}>
              {isPlayer && !isDead && needsSkillSelection && (
                <div className="text-center font-black text-[8px] sm:text-[8.5px] text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 rounded py-0.5 uppercase tracking-wider shadow-xs mb-0.5 animate-pulse">
                  👉 Hãy chọn chiêu thức
                </div>
              )}
              {card.skills.map((skill, sIdx) => {
                const isSelected = isPlayer && currentAction?.skillIndex === sIdx;
                const isEnemyPlanned = !isPlayer && enemyIntent && enemyIntent.skillName === skill.name;
                const isUlt = skill.isUltimate || sIdx === 2;
                const isUltUsed = card.ultimateUsed || skill.usedThisCombat;
                const onCooldown = (skill.currentCooldown || 0) > 0 && !isUlt;

                return (
                  <button
                    type="button"
                    key={sIdx}
                    draggable={false}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPlayer && !isDead) {
                        if (onCooldown) {
                          sound.playCardSelect();
                          if (onDisabledSkillClick) {
                            onDisabledSkillClick(`⏳ Kỹ năng [${skill.name}] đang hồi chiêu (còn ${skill.currentCooldown} lượt)! Hãy chọn kỹ năng khác.`);
                          }
                        } else if (isUltUsed) {
                          sound.playCardSelect();
                          if (onDisabledSkillClick) {
                            onDisabledSkillClick(`👑 Tuyệt kỹ [${skill.name}] chỉ dùng 1 lần mỗi trận và đã sử dụng! Hãy chọn kỹ năng khác.`);
                          }
                        } else if (isUlt && !isUltUnlocked) {
                          sound.playCardSelect();
                          if (onDisabledSkillClick) {
                            onDisabledSkillClick(`🔒 Tuyệt kỹ đang khóa! Cần đánh đủ 2 đòn, Máu <50% hoặc tích lũy đủ 3 Nộ ẩn (Hiện có: ${card.hitsDealt || 0} đòn, ${card.hiddenRage || 0} Nộ).`);
                          }
                        } else if (onSelectSkill) {
                          sound.playCardSelect();
                          onSelectSkill(sIdx as 0 | 1 | 2);
                        }
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (onHoverSkill && card) {
                        const r = e.currentTarget.getBoundingClientRect();
                        onHoverSkill({
                          skill,
                          monsterName: card.name,
                          element: card.element,
                          hasCleave,
                          hasBurn,
                          isPlayer,
                          slotIndex,
                          skillIndex: sIdx as 0 | 1 | 2,
                          rect: { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right },
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      if (onHoverSkill) onHoverSkill(null);
                    }}
                    className={`w-full text-left skill-action-slab px-2.5 py-1.5 sm:py-2 rounded-lg border transition-all relative touch-manipulation ${
                      isPlayer && !isDead && !onCooldown && !isUltUsed && (!isUlt || isUltUnlocked) ? 'cursor-pointer hover:brightness-105 active:scale-[0.98]' : ''
                    } ${
                      isUlt
                        ? isUltUsed
                          ? 'bg-slate-200/80 border-slate-400/60 opacity-40 cursor-not-allowed'
                          : !isUltUnlocked
                          ? 'bg-slate-900/40 border-slate-700/60 text-slate-500 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-200 border-amber-600 ring-2 ring-amber-500 shadow-md'
                          : isEnemyPlanned
                          ? 'bg-rose-100 border-rose-500 ring-2 ring-rose-500'
                          : 'bg-gradient-to-r from-amber-50 via-amber-100 to-yellow-50 border-amber-400 shadow-xs ring-1 ring-amber-400/50'
                        : isSelected
                        ? palette.skillSelectedBg
                        : isEnemyPlanned
                        ? 'bg-rose-100/95 border-rose-500 ring-2 ring-rose-500'
                        : palette.skillBg
                    } ${onCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-1.5 leading-none">
                      {/* Left: Energy Pip & Name */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[8.5px] sm:text-[9.5px] font-mono font-black px-1.5 py-0.5 rounded shrink-0 ${
                          isUlt
                            ? isUltUsed
                              ? 'bg-slate-700 text-slate-300'
                              : isUltUnlocked
                              ? 'bg-amber-900 text-amber-100 ring-1 ring-amber-400 animate-pulse'
                              : 'bg-black/30 text-slate-500'
                            : 'bg-black/10 text-slate-800'
                        }`}>
                          {isUlt
                            ? isUltUsed
                              ? '👑 ĐÃ DÙNG'
                              : isUltUnlocked
                              ? '⭐ TUYỆT KỸ'
                              : '🔒 KHÓA'
                            : onCooldown
                            ? `⏳${skill.currentCooldown}T`
                            : sIdx === 0
                            ? '⚡0'
                            : '⚡1'}
                        </span>
                        <span className="font-black text-xs sm:text-[13px] text-slate-900 whitespace-nowrap">
                          {skill.name}
                        </span>
                      </div>

                      {/* Right: State & Action Power */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected && isPlayer && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-black text-[8px] sm:text-[8.5px] uppercase tracking-tight flex items-center gap-0.5 shadow-xs">
                            <span>✓</span>
                            <span>ĐÃ CHỌN</span>
                          </span>
                        )}
                        {isEnemyPlanned && (
                          <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[8px] sm:text-[8.5px] uppercase tracking-tight animate-pulse">
                            Đánh
                          </span>
                        )}
                        <span className="font-mono font-black text-[10px] sm:text-[11px] text-slate-950 px-1.5 py-0.5 rounded bg-white/70 shadow-xs">
                          {skill.baseDamage > 0
                            ? `⚔${skill.baseDamage}`
                            : skill.healAmount
                            ? `💚+${skill.healAmount}`
                            : '🛡Giáp'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* 5. CARD SUB-FOOTER: RELICS, INLINE RECALL & 1-CLICK INSPECT */}
        <div className="pt-1 border-t border-black/15 flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-slate-700 shrink-0 gap-1">
          <div
            className="cursor-pointer hover:text-amber-900 flex items-center gap-1 shrink-0"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (onInspectCard) onInspectCard();
            }}
            title="Nhấp để xem chi tiết thẻ bài & 10 ô Relic"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span className="hidden sm:inline">Cổ Vật:</span>
            <span className="text-amber-900 font-mono font-black">{card.equippedRelics.length}/10</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* INLINE RECALL BUTTON FOR PLAYER CARDS */}
            {isPlayer && !isDead && onRecall && (
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onRecall();
                }}
                className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold border flex items-center gap-0.5 transition shadow-xs ${
                  (recallsRemaining ?? 0) > 0
                    ? 'bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border-emerald-500 cursor-pointer active:scale-95'
                    : 'bg-slate-800/60 text-slate-500 border-slate-700/50 cursor-not-allowed'
                }`}
                title={(recallsRemaining ?? 0) > 0 ? `Thu hồi về hàng dự bị (Còn ${recallsRemaining}/2)` : 'Đã hết lượt thu hồi'}
              >
                <span>↩ Thu Hồi</span>
                <span className="text-amber-300">({recallsRemaining ?? 2}/2)</span>
              </button>
            )}

            {/* 1-CLICK INSPECT BUTTON */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (onInspectCard) onInspectCard();
              }}
              className="px-1.5 py-0.5 rounded bg-black/10 hover:bg-black/20 text-slate-700 hover:text-amber-900 cursor-pointer font-mono text-[8px] sm:text-[9px] flex items-center gap-0.5 transition"
              title="Nhấp chuột trái hoặc phải để xem toàn bộ thông số chi tiết"
            >
              <span>🔍 Chi tiết</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
