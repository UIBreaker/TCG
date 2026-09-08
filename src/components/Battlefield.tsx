import React, { useState, useEffect } from 'react';
import { MonsterCard, PlannedAction, CombatLogEntry, Relic, ElementType } from '../types/game';
import { MonsterCardView, HoveredSkillData } from './MonsterCardView';
import { CardInspectorModal } from './CardInspectorModal';
import { resolveCombatTurn, generateEnemyActions, CombatStepAnimation } from '../engine/combat';
import { attemptCapture, calculateCaptureRate } from '../engine/capture';
import { sound } from '../utils/audio';
import { Swords, ScrollText, Sparkles, Flame, Shield, ArrowLeftRight, Skull } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImpactVFXOverlay } from './ImpactVFXOverlay';
import { TIERS } from '../models/tier';
import {
  EndTurnWheel,
  SpyglassSvg,
  GrimoireSvg,
  BackpackSvg,
  BattleHornSvg,
  SpiralShellSvg,
  DeckStackSvg,
} from './TableAccessories';

const StatusTokenBadge: React.FC<{ status: { type: string; duration: number } }> = ({ status }) => {
  switch (status.type) {
    case 'burn':
      return (
        <span className="px-1.5 py-0.2 rounded-full bg-red-900/95 border border-red-400 text-red-100 text-[8px] font-mono font-bold flex items-center gap-0.5 shadow-sm animate-burn">
          <Flame className="w-2 h-2 text-red-300" /> Cháy
        </span>
      );
    case 'poison':
      return (
        <span className="px-1.5 py-0.2 rounded-full bg-purple-900/95 border border-purple-400 text-purple-100 text-[8px] font-mono font-bold flex items-center gap-0.5 shadow-sm">
          <Skull className="w-2 h-2 text-purple-300" /> Độc
        </span>
      );
    case 'freeze':
      return (
        <span className="px-1.5 py-0.2 rounded-full bg-cyan-900/95 border border-cyan-400 text-cyan-100 text-[8px] font-mono font-bold flex items-center gap-0.5 shadow-sm">
          ❄️ Liệt
        </span>
      );
    case 'weaken':
      return (
        <span className="px-1.5 py-0.2 rounded-full bg-orange-900/95 border border-orange-400 text-orange-100 text-[8px] font-mono font-bold flex items-center gap-0.5 shadow-sm">
          💔 Yếu
        </span>
      );
    case 'vulnerable':
      return (
        <span className="px-1.5 py-0.2 rounded-full bg-rose-900/95 border border-rose-400 text-rose-100 text-[8px] font-mono font-bold flex items-center gap-0.5 shadow-sm">
          🎯 Vỡ
        </span>
      );
    case 'strengthen':
      return (
        <span className="px-1.5 py-0.2 rounded-full bg-amber-900/95 border border-amber-400 text-amber-100 text-[8px] font-mono font-bold flex items-center gap-0.5 shadow-sm">
          ⚔️ +Công
        </span>
      );
    case 'haste':
      return (
        <span className="px-1.5 py-0.2 rounded-full bg-teal-900/95 border border-teal-400 text-teal-100 text-[8px] font-mono font-bold flex items-center gap-0.5 shadow-sm">
          ⚡ +Tốc
        </span>
      );
    case 'regen':
      return (
        <span className="px-1.5 py-0.2 rounded-full bg-emerald-900/95 border border-emerald-400 text-emerald-100 text-[8px] font-mono font-bold flex items-center gap-0.5 shadow-sm">
          🌱 Hồi
        </span>
      );
    case 'thorns':
      return (
        <span className="px-1.5 py-0.2 rounded-full bg-stone-900/95 border border-stone-400 text-stone-100 text-[8px] font-mono font-bold flex items-center gap-0.5 shadow-sm">
          🪞 Gai
        </span>
      );
    default:
      return null;
  }
};

const HAND_CARD_STYLES: Record<ElementType, { border: string; bg: string; badge: string; text: string; artBg: string }> = {
  fire: { border: 'border-amber-500/80', bg: 'from-amber-950/90 via-slate-950 to-orange-950/90', badge: '🔥 HỎA', text: 'text-amber-300', artBg: 'from-orange-900/40 to-amber-950/60' },
  water: { border: 'border-cyan-500/80', bg: 'from-cyan-950/90 via-slate-950 to-blue-950/90', badge: '💧 THỦY', text: 'text-cyan-300', artBg: 'from-cyan-900/40 to-blue-950/60' },
  nature: { border: 'border-emerald-500/80', bg: 'from-emerald-950/90 via-slate-950 to-teal-950/90', badge: '🌿 MỘC', text: 'text-emerald-300', artBg: 'from-emerald-900/40 to-teal-950/60' },
  thunder: { border: 'border-yellow-500/80', bg: 'from-yellow-950/90 via-slate-950 to-amber-950/90', badge: '⚡ LÔI', text: 'text-yellow-300', artBg: 'from-yellow-900/40 to-amber-950/60' },
  earth: { border: 'border-amber-600/80', bg: 'from-[#382618]/90 via-slate-950 to-amber-950/90', badge: '🌍 THỔ', text: 'text-amber-400', artBg: 'from-stone-900/40 to-amber-950/60' },
};

interface BattlefieldProps {
  playerParty: (MonsterCard | null)[];
  enemyParty: (MonsterCard | null)[];
  reserveRoster?: MonsterCard[];
  captureCardsCount: number;
  onTurnEnd: (
    nextPlayerParty: (MonsterCard | null)[],
    nextEnemyParty: (MonsterCard | null)[],
    isVictory: boolean,
    isDefeat: boolean,
    rewards?: {
      gold: number;
      gotRecruitmentCard: boolean;
      chestsCount?: number;
      keysCount?: number;
      healingHerbsCount?: number;
      shieldPotionsCount?: number;
      lockpickToolkitsCount?: number;
      relicDrop?: Relic;
    }
  ) => void;
  onMonsterCaptured: (monster: MonsterCard) => void;
  onEnemyPartyChange?: (nextEnemyParty: (MonsterCard | null)[]) => void;
  onDeployReserveCard?: (reserveIndex: number, targetSlot: number) => void;
  onRecallCard?: (slotIdx: number) => void;
  onConsumeCaptureCard: () => void;
  onReorderParty?: (fromIdx: number, toIdx: number) => void;
  onOpenInventory?: () => void;
  gold?: number;
  isBoss?: boolean;
  isElite?: boolean;
}

export const Battlefield: React.FC<BattlefieldProps> = ({
  playerParty,
  enemyParty,
  reserveRoster = [],
  captureCardsCount,
  onTurnEnd,
  onMonsterCaptured,
  onEnemyPartyChange,
  onDeployReserveCard,
  onRecallCard,
  onConsumeCaptureCard,
  onReorderParty,
  onOpenInventory,
  gold = 0,
  isBoss = false,
  isElite = false,
}) => {
  // Current planned actions for the 3 player slots (default targeting opposing slot 0, 1, 2)
  const [playerActions, setPlayerActions] = useState<PlannedAction[]>([
    { skillIndex: 0, targetSlotIndex: 0 },
    { skillIndex: 0, targetSlotIndex: 1 },
    { skillIndex: 0, targetSlotIndex: 2 },
  ]);

  // Turn counter
  const [turnCounter, setTurnCounter] = useState<number>(1);

  // Section 12: Recall counter (2 times per match: Thu Hồi: X/2) - tự động reset mỗi trận
  const [recallsRemaining, setRecallsRemaining] = useState<number>(2);

  const handleRecallSlot = (slotIdx: number) => {
    if (isExecutingTurn) return;
    if (recallsRemaining <= 0) {
      setBannerNotice('⚠️ Đã hết lượt Thu Hồi trong trận đánh này (tối đa 2 lần/trận)!');
      setTimeout(() => setBannerNotice(null), 3000);
      return;
    }
    const card = playerParty[slotIdx];
    if (!card || card.hp <= 0) return;

    const aliveOtherOnField = playerParty.filter((c, idx) => idx !== slotIdx && c && c.hp > 0);
    if (aliveOtherOnField.length === 0 && reserveRoster.length === 0) {
      setBannerNotice('⚠️ Không thể thu hồi quái thú duy nhất khi không còn quái dự bị!');
      setTimeout(() => setBannerNotice(null), 3000);
      return;
    }

    sound.playCardDraw();
    setRecallsRemaining(prev => Math.max(0, prev - 1));
    onRecallCard?.(slotIdx);
    setBannerNotice(`🃏 Đã thu hồi [${card.name}] về Túi Đồ Dự Bị! (Còn ${recallsRemaining - 1}/2 lần thu hồi)`);
    setTimeout(() => setBannerNotice(null), 3000);
  };

  // Track which player slots have explicitly selected/confirmed a skill this turn
  const [slotSkillChosenThisTurn, setSlotSkillChosenThisTurn] = useState<Record<number, boolean>>({});

  // Reset skill selection confirmation on each new turn
  useEffect(() => {
    setSlotSkillChosenThisTurn({});
  }, [turnCounter]);

  // Pre-selected enemy actions generated UPFRONT! (Đối thủ chọn tấn công sẵn)
  const [enemyActions, setEnemyActions] = useState<PlannedAction[]>(() =>
    generateEnemyActions(enemyParty, playerParty)
  );

  // Active monster slot being configured by player (0 to 2)
  const [activeSlotConfig, setActiveSlotConfig] = useState<number>(0);

  // Combat execution state
  const [isExecutingTurn, setIsExecutingTurn] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<CombatStepAnimation | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Floating damage indicators map: key = 'player_0' or 'enemy_1' -> { text, type, isCrit, isElemAdvantage }
  const [floatingEffects, setFloatingEffects] = useState<Record<string, { text: string; type: 'damage' | 'heal' | 'burn' | 'splash'; isCrit?: boolean; isElemAdvantage?: boolean } | null>>({});

  // Combat Log
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);

  // Capture Banner & Suspense Sequence
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const [captureTargetSlot, setCaptureTargetSlot] = useState<number | null>(null);
  const [captureStage, setCaptureStage] = useState<'idle' | 'containment' | 'rattle_1' | 'rattle_2' | 'rattle_3' | 'success' | 'failed'>('idle');

  // Entrance Card Deal Sequence
  const [isDealingCards, setIsDealingCards] = useState<boolean>(true);

  // Board Impact Camera Shake
  const [isBoardShaking, setIsBoardShaking] = useState<boolean>(false);

  // Drag and drop / swap states for repositioning player cards & deploying from hand
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [swapSelectedSlot, setSwapSelectedSlot] = useState<number | null>(null);
  const [draggedReserveIdx, setDraggedReserveIdx] = useState<number | null>(null);
  const [selectedReserveIdx, setSelectedReserveIdx] = useState<number | null>(null);
  const [showMobileHandDrawer, setShowMobileHandDrawer] = useState<boolean>(false);
  const [showReserveDrawer, setShowReserveDrawer] = useState<boolean>(false);
  const [deployTargetSlot, setDeployTargetSlot] = useState<number | null>(null);

  const handleDeployReserve = (reserveIdx: number, targetSlot: number) => {
    if (isExecutingTurn) return;
    sound.playCardSlam();
    onDeployReserveCard?.(reserveIdx, targetSlot);
    setSelectedReserveIdx(null);
    setShowReserveDrawer(false);
    setShowMobileHandDrawer(false);
    setDeployTargetSlot(null);
    setBannerNotice(`✨ Đã điều động quái thú vào Làn ${targetSlot + 1}!`);
    setTimeout(() => setBannerNotice(null), 3000);
  };

  const handleEmptySlotClick = (slotIdx: number) => {
    if (selectedReserveIdx !== null && reserveRoster && reserveRoster[selectedReserveIdx]) {
      handleDeployReserve(selectedReserveIdx, slotIdx);
    } else if (reserveRoster && reserveRoster.length > 0) {
      sound.playCardSelect();
      setDeployTargetSlot(slotIdx);
      setShowReserveDrawer(true);
    } else {
      setBannerNotice('Túi đồ dự bị hiện không còn quái thú nào!');
      setTimeout(() => setBannerNotice(null), 3000);
    }
  };

  // Right-click inspected card modal state
  const [inspectedCardData, setInspectedCardData] = useState<{
    card: MonsterCard;
    opposingCard?: MonsterCard | null;
    slotIndex: number;
    isPlayer: boolean;
  } | null>(null);

  // Screen-level floating skill tooltip state
  const [hoveredSkillData, setHoveredSkillData] = useState<HoveredSkillData | null>(null);

  // Card Deal Entrance Effect on Mount / Battle Start
  useEffect(() => {
    setIsDealingCards(true);
    sound.playCardDraw();

    const timers = [
      setTimeout(() => sound.playCardSlam(), 150),
      setTimeout(() => sound.playCardDraw(), 260),
      setTimeout(() => sound.playCardSlam(), 400),
      setTimeout(() => sound.playCardSlam(), 650),
      setTimeout(() => setIsDealingCards(false), 950),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // Pre-select enemy attacks and update opposing lane targeting & validate player actions
  useEffect(() => {
    setEnemyActions(generateEnemyActions(enemyParty, playerParty));

    setPlayerActions(prev =>
      prev.map((action, slotIdx) => {
        const pCard = playerParty[slotIdx];
        let validSkillIdx: 0 | 1 | 2 = action.skillIndex;

        // Reset to basic skill 0 if planned skill is on cooldown or spent ultimate
        if (pCard) {
          const plannedSkill = pCard.skills[validSkillIdx];
          const isUlt = plannedSkill?.isUltimate || validSkillIdx === 2;
          const isUltUsed = pCard.ultimateUsed || plannedSkill?.usedThisCombat;
          const onCd = (plannedSkill?.currentCooldown || 0) > 0 && !isUlt;

          if (onCd || isUltUsed) {
            validSkillIdx = 0;
          }
        }

        const opposingEnemy = enemyParty[slotIdx];
        if (opposingEnemy && opposingEnemy.hp > 0) {
          return { skillIndex: validSkillIdx, targetSlotIndex: slotIdx };
        }

        let nearestDist = 999;
        let bestSlot = 0;
        let foundAlive = false;

        enemyParty.forEach((e, eIdx) => {
          if (e && e.hp > 0) {
            const dist = Math.abs(eIdx - slotIdx);
            if (dist < nearestDist) {
              nearestDist = dist;
              bestSlot = eIdx;
              foundAlive = true;
            }
          }
        });

        return {
          skillIndex: validSkillIdx,
          targetSlotIndex: foundAlive ? bestSlot : slotIdx,
        };
      })
    );
  }, [enemyParty, playerParty, turnCounter]);

  // Handle skill change for a slot (supports basic, special, and ultimate)
  const handleSelectSkill = (slotIdx: number, skillIdx: 0 | 1 | 2) => {
    setPlayerActions(prev => {
      const next = [...prev];
      next[slotIdx] = { ...next[slotIdx], skillIndex: skillIdx };
      return next;
    });
    setSlotSkillChosenThisTurn(prev => ({ ...prev, [slotIdx]: true }));
    setActiveSlotConfig(slotIdx);
  };

  // Handle target change for currently active slot
  const handleSelectEnemyTarget = (enemySlotIdx: number) => {
    setPlayerActions(prev => {
      const next = [...prev];
      next[activeSlotConfig] = { ...next[activeSlotConfig], targetSlotIndex: enemySlotIdx };
      return next;
    });
  };

  // Attempt capture on an enemy (Suspenseful 3-stage Rattle Sequence)
  const handleCaptureMonster = (enemySlotIdx: number) => {
    if (captureCardsCount <= 0 || isExecutingTurn || captureStage !== 'idle') return;

    const targetEnemy = enemyParty[enemySlotIdx];
    if (!targetEnemy || targetEnemy.hp <= 0) return;

    // 1. Consume capture card and start containment
    onConsumeCaptureCard();
    setCaptureTargetSlot(enemySlotIdx);
    setCaptureStage('containment');
    sound.playCaptureAttempt();
    setCaptureNotice(`🔮 Đang phóng phù ấn giam cầm ${targetEnemy.name}...`);

    // 2. Compute roll
    const result = attemptCapture(targetEnemy);

    // 3. Rattle 1 (after 650ms)
    setTimeout(() => {
      setCaptureStage('rattle_1');
      sound.playCaptureRattle(1);
      setCaptureNotice(`🔮 Đang phong ấn ${targetEnemy.name} (Nhịp 1 / 3)...`);
    }, 650);

    // 4. Rattle 2 (after 1300ms)
    setTimeout(() => {
      setCaptureStage('rattle_2');
      sound.playCaptureRattle(2);
      setCaptureNotice(`⚡ Quái thú kháng cự dữ dội (Nhịp 2 / 3)...`);
    }, 1300);

    // 5. Rattle 3 (after 1950ms)
    setTimeout(() => {
      setCaptureStage('rattle_3');
      sound.playCaptureRattle(3);
      setCaptureNotice(`🔥 Nhịp quyết định (Nhịp 3 / 3)...`);
    }, 1950);

    // 6. Resolution (after 2650ms)
    setTimeout(() => {
      if (result.success && result.capturedMonster) {
        setCaptureStage('success');
        sound.playCaptureSuccess();
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
        setCaptureNotice(result.message);

        setTimeout(() => {
          onMonsterCaptured(result.capturedMonster!);
          const nextEnemies = [...enemyParty];
          nextEnemies[enemySlotIdx] = null;
          if (onEnemyPartyChange) {
            onEnemyPartyChange(nextEnemies);
          }
          setCaptureStage('idle');
          setCaptureTargetSlot(null);

          const aliveRemaining = nextEnemies.filter(e => e && e.hp > 0).length;
          if (aliveRemaining === 0) {
            onTurnEnd(playerParty, nextEnemies, true, false, {
              gold: 50,
              gotRecruitmentCard: false,
            });
          }
        }, 1200);
      } else {
        setCaptureStage('failed');
        sound.playCaptureBreak();
        setCaptureNotice(result.message);

        setTimeout(() => {
          setCaptureStage('idle');
          setCaptureTargetSlot(null);
        }, 1300);
      }

      setTimeout(() => {
        setCaptureNotice(null);
      }, 4000);
    }, 2650);
  };

  // Reorder & Swap actions
  const executeSwap = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || fromIdx > 2 || toIdx < 0 || toIdx > 2) {
      setDraggedSlot(null);
      setDragOverSlot(null);
      setSwapSelectedSlot(null);
      return;
    }
    sound.playCardSelect();

    // 1. Notify parent to swap positions in playerParty
    onReorderParty?.(fromIdx, toIdx);

    // 2. Also swap corresponding playerActions so actions stay with their card
    setPlayerActions(prev => {
      const next = [...prev];
      const temp = next[fromIdx];
      next[fromIdx] = next[toIdx];
      next[toIdx] = temp;
      return next;
    });

    // 3. Swap chosen flags
    setSlotSkillChosenThisTurn(prev => {
      const next = { ...prev };
      const temp = next[fromIdx];
      next[fromIdx] = next[toIdx];
      next[toIdx] = temp;
      return next;
    });

    setDraggedSlot(null);
    setDragOverSlot(null);
    setSwapSelectedSlot(null);
    setActiveSlotConfig(toIdx);
  };

  const handleCardDragStart = (slotIdx: number) => {
    if (isExecutingTurn) return;
    setDraggedSlot(slotIdx);
  };

  const handleCardDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    if (draggedReserveIdx !== null || (draggedSlot !== null && draggedSlot !== slotIdx)) {
      if (dragOverSlot !== slotIdx) {
        setDragOverSlot(slotIdx);
      }
    }
  };

  const handleCardDrop = (targetSlotIdx: number) => {
    // 1. Dropped from Hand Tray onto battlefield slot
    if (draggedReserveIdx !== null) {
      if (onDeployReserveCard) {
        onDeployReserveCard(draggedReserveIdx, targetSlotIdx);
        sound.playCardSlam();
        setActiveSlotConfig(targetSlotIdx);
        const cardName = reserveRoster[draggedReserveIdx]?.name || 'linh thú';
        setBannerNotice(`⚔️ Đã xuất trận [${cardName}] vào Làn ${targetSlotIdx + 1}! Trận đấu bắt đầu, hãy chọn kĩ năng!`);
        setTimeout(() => setBannerNotice(null), 4500);
      }
      setDraggedReserveIdx(null);
      setSelectedReserveIdx(null);
      setDragOverSlot(null);
      return;
    }

    // 2. Swapping between board slots
    if (draggedSlot !== null && draggedSlot !== targetSlotIdx) {
      executeSwap(draggedSlot, targetSlotIdx);
    }
    setDraggedSlot(null);
    setDragOverSlot(null);
  };

  const handleTriggerSwap = (slotIdx: number) => {
    if (isExecutingTurn) return;

    // If user previously clicked a card in Hand Tray, deploy it to this slot!
    if (selectedReserveIdx !== null) {
      if (onDeployReserveCard) {
        onDeployReserveCard(selectedReserveIdx, slotIdx);
        sound.playCardSlam();
        setActiveSlotConfig(slotIdx);
        const cardName = reserveRoster[selectedReserveIdx]?.name || 'linh thú';
        setBannerNotice(`⚔️ Đã xuất trận [${cardName}] vào Làn ${slotIdx + 1}! Trận đấu bắt đầu, hãy chọn kĩ năng!`);
        setTimeout(() => setBannerNotice(null), 4500);
      }
      setSelectedReserveIdx(null);
      return;
    }

    if (swapSelectedSlot === null) {
      setSwapSelectedSlot(slotIdx);
      sound.playClick();
    } else if (swapSelectedSlot === slotIdx) {
      setSwapSelectedSlot(null);
    } else {
      executeSwap(swapSelectedSlot, slotIdx);
    }
  };

  // Re-deal / Summon Cards Entrance Animation
  const handleRedealCards = () => {
    if (isExecutingTurn || isDealingCards) return;
    setIsDealingCards(true);
    sound.playCardDraw();
    const timers = [
      setTimeout(() => sound.playCardSlam(), 150),
      setTimeout(() => sound.playCardDraw(), 260),
      setTimeout(() => sound.playCardSlam(), 400),
      setTimeout(() => sound.playCardSlam(), 650),
      setTimeout(() => setIsDealingCards(false), 950),
    ];
    return () => timers.forEach(clearTimeout);
  };

  // MAIN: End Turn Button Clicked (Instant 1-Click Execution)
  const handleEndTurn = () => {
    if (isExecutingTurn) return;

    // Normalize actions for all actionable slots: ensure valid skillIndex & alive target
    const finalPlayerActions = playerActions.map((action, slotIdx) => {
      const card = playerParty[slotIdx];
      if (!card || card.hp <= 0) return action;

      let validSkillIdx: 0 | 1 | 2 = action.skillIndex;
      const plannedSkill = card.skills[validSkillIdx];
      const isUlt = plannedSkill?.isUltimate || validSkillIdx === 2;
      const isUltUsed = card.ultimateUsed || plannedSkill?.usedThisCombat;
      const isUltUnlocked = (card.hitsDealt || 0) >= 2 || (card.hp / card.maxHp) < 0.5 || (card.hiddenRage || 0) >= 3;
      const onCd = (plannedSkill?.currentCooldown || 0) > 0 && !isUlt;

      if (onCd || isUltUsed || (isUlt && !isUltUnlocked)) {
        validSkillIdx = 0;
      }

      let targetSlot = action.targetSlotIndex;
      const currentTarget = enemyParty[targetSlot];
      if (!currentTarget || currentTarget.hp <= 0) {
        let nearestDist = 999;
        let bestSlot = 0;
        let foundAlive = false;
        enemyParty.forEach((e, eIdx) => {
          if (e && e.hp > 0) {
            const dist = Math.abs(eIdx - slotIdx);
            if (dist < nearestDist) {
              nearestDist = dist;
              bestSlot = eIdx;
              foundAlive = true;
            }
          }
        });
        if (foundAlive) targetSlot = bestSlot;
      }

      return {
        skillIndex: validSkillIdx,
        targetSlotIndex: targetSlot,
      };
    });

    setPlayerActions(finalPlayerActions);
    setSlotSkillChosenThisTurn({ 0: true, 1: true, 2: true });

    // Execute immediately in 1 click!
    sound.playEndTurn();
    setIsExecutingTurn(true);
    setBannerNotice('⚔️ GIẢI QUYẾT LƯỢT: TỪ TRÁI QUA PHẢI (SLOT 1 ➔ 3) - TỐC ĐỘ CAO RA ĐÒN TRƯỚC!');

    const currentEnemyActions = enemyActions && enemyActions.length === 3
      ? enemyActions
      : generateEnemyActions(enemyParty, playerParty);

    const turnResult = resolveCombatTurn(
      playerParty,
      enemyParty,
      finalPlayerActions,
      currentEnemyActions,
      turnCounter,
      isBoss,
      isElite
    );

    setCombatLogs(prev => [...turnResult.logs, ...prev]);

    const steps = turnResult.animationSteps;
    let stepIdx = 0;

    const runNextStep = () => {
      if (stepIdx < steps.length) {
        const step = steps[stepIdx];
        setActiveStep(step);

        // Screen Shake on impact
        if (!step.heal && step.damage > 0) {
          setTimeout(() => {
            setIsBoardShaking(true);
            setTimeout(() => setIsBoardShaking(false), 420);
          }, 160);
        }

        // Heavy Impact & Death Sound Effects
        if (step.heal) {
          sound.playHeal();
        } else if (step.isFatalBlow) {
          sound.playMonsterDeath();
        } else if (step.isCrit) {
          sound.playHeavyImpact(true);
        } else if (step.soundType === 'cleave') {
          sound.playCleave();
        } else if (step.soundType === 'burn') {
          sound.playBurn();
        } else {
          sound.playHeavyImpact(false);
        }

        if (step.synergyMessage) {
          setBannerNotice(step.synergyMessage);
        } else {
          setBannerNotice(`Slot ${step.actorSlot + 1}: ${step.logMessage}`);
        }

        const targetKey = `${step.targetSide}_${step.targetSlot}`;
        if (step.heal) {
          setFloatingEffects({ [targetKey]: { text: `+${step.heal}`, type: 'heal' } });
        } else {
          setFloatingEffects({
            [targetKey]: {
              text: `-${step.damage}`,
              type: 'damage',
              isCrit: step.isCrit,
              isElemAdvantage: step.isElementAdvantage,
            },
          });
        }

        if (step.isSplash && step.splashTargets) {
          step.splashTargets.forEach(st => {
            const splashKey = `${step.targetSide}_${st.slot}`;
            setTimeout(() => {
              setFloatingEffects(prev => ({
                ...prev,
                [splashKey]: {
                  text: `-${st.damage} (Lan${st.burnApplied ? ' + Cháy' : ''})`,
                  type: st.burnApplied ? 'burn' : 'splash',
                },
              }));
            }, 200);
          });
        }

        stepIdx++;
        setTimeout(() => {
          setFloatingEffects({});
          runNextStep();
        }, 1250);
      } else {
        setIsExecutingTurn(false);
        setActiveStep(null);
        setBannerNotice(null);
        setTurnCounter(prev => prev + 1);

        // Pre-reset playerActions to available skills for the new turn
        setPlayerActions(prev =>
          prev.map((action, slotIdx) => {
            const card = turnResult.nextPlayerParty[slotIdx];
            if (!card) return { skillIndex: 0, targetSlotIndex: action.targetSlotIndex };
            const currSkill = card.skills[action.skillIndex];
            const isUlt = currSkill?.isUltimate || action.skillIndex === 2;
            const isUltUsed = card.ultimateUsed || currSkill?.usedThisCombat;
            const onCd = (currSkill?.currentCooldown || 0) > 0 && !isUlt;
            return {
              skillIndex: (onCd || isUltUsed) ? 0 : action.skillIndex,
              targetSlotIndex: action.targetSlotIndex,
            };
          })
        );

        if (turnResult.isVictory) {
          sound.playVictory();
          confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        } else if (turnResult.isDefeat) {
          sound.playDefeat();
        }

        onTurnEnd(
          turnResult.nextPlayerParty,
          turnResult.nextEnemyParty,
          turnResult.isVictory,
          turnResult.isDefeat,
          turnResult.rewards
        );
      }
    };

    setTimeout(() => {
      runNextStep();
    }, 600);
  };

  const selectedTargetForActiveCard = playerActions[activeSlotConfig]?.targetSlotIndex ?? 0;
  const activePlayerCard = playerParty[activeSlotConfig];

  return (
    <div className={`w-full h-[calc(100vh-44px)] max-h-[calc(100vh-44px)] mossy-table-bg text-slate-100 relative flex flex-col justify-between py-1 px-2 sm:px-4 lg:px-6 overflow-hidden select-none border-t border-emerald-950 ${
      isBoardShaking ? 'animate-board-shake' : ''
    }`}>
      {/* Decorative Corner Foliage & Forest Flourishes (Image 1 Style) */}
      <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.3)_0%,transparent_70%)]" />
      <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.3)_0%,transparent_70%)]" />
      <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.3)_0%,transparent_70%)]" />
      <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.3)_0%,transparent_70%)]" />

      {/* TOP ROW: Spyglass + Turn Pebble (Left) | Notice Banner (Center) | Ancient Grimoire (Right) */}
      <div className="w-full flex items-center justify-between z-30 shrink-0 px-1 sm:px-2 pt-0.5">
        {/* TOP LEFT: SPYGLASS + PEBBLE TURN COUNTER (Image 1 Style) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <SpyglassSvg className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md hidden sm:block" />
          <div className="flex flex-col items-center justify-center px-3.5 py-1 rounded-2xl bg-gradient-to-b from-[#2a3441] via-[#1a232f] to-[#0f151d] border-2 border-[#64748b]/70 shadow-[0_4px_12px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.25)]">
            <span className="text-[7.5px] sm:text-[8.5px] font-mono uppercase tracking-widest text-amber-300/90 font-black">LƯỢT ĐẤU</span>
            <span className="text-base sm:text-lg font-mono font-black text-white leading-none">{turnCounter}</span>
          </div>
        </div>

        {/* TOP CENTER: FLOATING NOTICES */}
        <div className="flex-1 max-w-2xl mx-2 text-center">
          {captureNotice ? (
            <div className="py-1 px-4 rounded-full bg-purple-900/95 border border-purple-400 text-purple-100 font-bold text-xs shadow-xl animate-bounce flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-300" />
              {captureNotice}
            </div>
          ) : bannerNotice ? (
            <div className="py-1 px-4 rounded-full bg-amber-950/95 border border-amber-400 text-amber-200 font-bold text-xs shadow-xl animate-pulse flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              {bannerNotice}
            </div>
          ) : swapSelectedSlot !== null ? (
            <div className="py-1 px-4 rounded-full bg-cyan-950/95 border border-cyan-400 text-cyan-200 font-bold text-xs shadow-xl flex items-center justify-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Đang chọn đổi chỗ <b className="text-amber-300 font-bold">Làn {swapSelectedSlot + 1}</b>: Nhấp vào lá bài muốn đổi!</span>
              <button
                onClick={() => setSwapSelectedSlot(null)}
                className="ml-2 px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] border border-slate-700"
              >
                Hủy
              </button>
            </div>
          ) : reserveRoster.length > 0 && playerParty.slice(0, 3).some(p => p === null) ? (
            <div className="py-1 px-4 rounded-full bg-emerald-950/95 border border-emerald-400 text-emerald-100 font-bold text-xs shadow-xl flex items-center justify-center gap-2 animate-pulse">
              <span>🖐️</span>
              <span>Cầm <b className="text-amber-300">[{reserveRoster[0]?.name}]</b> trên tay! Kéo thả hoặc nhấp vào ô trống để xuất trận!</span>
            </div>
          ) : null}
        </div>

        {/* TOP RIGHT: ANCIENT GRIMOIRE (Image 1 Style) */}
        <div
          onClick={() => {
            sound.playCardSelect();
            setShowLogDrawer(prev => !prev);
          }}
          className="cursor-pointer hover:scale-105 transition-transform flex flex-col items-center pointer-events-auto group"
          title="Cuốn sách cổ tích thần bí (Mở nhật ký trận đánh)"
        >
          <GrimoireSvg className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg" />
          <span className="text-[8.5px] sm:text-[9.5px] font-bold text-amber-200/90 font-mono group-hover:text-amber-300">SÁCH CỔ</span>
        </div>
      </div>

      {/* ================= MAIN 3-LANE TABLETOP ARENA ================= */}
      <div className="w-full max-w-[1400px] mx-auto flex-1 flex items-center justify-center gap-2 sm:gap-4 lg:gap-6 px-1 my-auto min-h-0 relative z-10">
        
        {/* LEFT FLANK: PINK AMMONITE SHELL & FOREST ACCENTS (Image 1 Style) */}
        <div className="hidden lg:flex flex-col justify-center items-center h-full w-20 shrink-0 relative z-20 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <SpiralShellSvg color="pink" className="w-12 h-12 xl:w-14 xl:h-14 drop-shadow-lg rotate-12" />
            <div className="w-2 h-2 rounded-full bg-pink-400/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/30" />
          </div>
        </div>

        {/* CENTER TACTICAL 3-LANE BOARD */}
        <div className="flex-1 max-w-[1020px] flex flex-col justify-center items-center gap-1 sm:gap-1.5 my-auto min-h-0 w-full relative">
          
          {/* SECTION 9: 2-PHASE SHIELD BREAK & IMPACT VFX OVERLAY */}
          {activeStep?.impactVFX && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-visible flex items-center justify-center">
              <ImpactVFXOverlay spec={activeStep.impactVFX} />
            </div>
          )}

          {/* 1. ENEMY 3-CARD ROW */}
          <div className="w-full">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 place-items-center">
              {enemyParty.slice(0, 3).map((enemyCard, slotIdx) => {
                const enemyAction = enemyActions[slotIdx];
                const plannedSkill = enemyCard && enemyAction ? enemyCard.skills[enemyAction.skillIndex] : undefined;
                const enemyIntent = plannedSkill && enemyCard && enemyCard.hp > 0 ? {
                  skillName: plannedSkill.name,
                  targetSlot: enemyAction.targetSlotIndex,
                  damage: plannedSkill.baseDamage,
                  isOpposing: enemyAction.targetSlotIndex === slotIdx,
                } : undefined;

                return (
                  <div key={slotIdx} className="w-full flex flex-col items-center">
                    <MonsterCardView
                      card={enemyCard}
                      slotIndex={slotIdx}
                      isPlayer={false}
                      isSelectedTarget={selectedTargetForActiveCard === slotIdx}
                      isCurrentActor={activeStep?.actorSide === 'enemy' && activeStep?.actorSlot === slotIdx}
                      isTakingDamage={activeStep?.targetSide === 'enemy' && activeStep?.targetSlot === slotIdx}
                      isFatalBlow={activeStep?.targetSide === 'enemy' && activeStep?.targetSlot === slotIdx && !!activeStep?.isFatalBlow}
                      isCritDamage={activeStep?.targetSide === 'enemy' && activeStep?.targetSlot === slotIdx && !!activeStep?.isCrit}
                      dealDelay={isDealingCards ? slotIdx * 80 : undefined}
                      captureStage={captureTargetSlot === slotIdx ? captureStage : 'idle'}
                      enemyIntent={enemyIntent}
                      onSelectTarget={() => handleSelectEnemyTarget(slotIdx)}
                      onInspectCard={() => {
                        if (enemyCard) {
                          setInspectedCardData({
                            card: enemyCard,
                            opposingCard: playerParty[slotIdx],
                            slotIndex: slotIdx,
                            isPlayer: false,
                          });
                        }
                      }}
                      onHoverSkill={setHoveredSkillData}
                      canCapture={true}
                      hasCaptureCard={captureCardsCount > 0}
                      onAttemptCapture={() => handleCaptureMonster(slotIdx)}
                      floatingDamage={floatingEffects[`enemy_${slotIdx}`]}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. MIDDLE CLASH & TACTICAL GROUND TOKEN BADGES */}
          <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 place-items-center my-0.5">
            {[0, 1, 2].map(slotIdx => {
              const enemyCard = enemyParty[slotIdx];
              const playerCard = playerParty[slotIdx];
              const enemyAlive = enemyCard && enemyCard.hp > 0;
              const playerAlive = playerCard && playerCard.hp > 0;

              return (
                <div key={slotIdx} className="w-full flex items-center justify-center min-h-[20px] px-1 relative">
                  <div className="absolute inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-emerald-800/40 to-transparent" />
                  <div className="flex flex-wrap items-center justify-center gap-1 z-10">
                    {/* Enemy Tokens */}
                    {enemyAlive && enemyCard.shield > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-900/90 border border-blue-400 text-blue-100 text-[8px] font-mono font-bold flex items-center gap-0.5 shadow-sm">
                        <Shield className="w-2.5 h-2.5 fill-blue-300" />+{enemyCard.shield}
                      </span>
                    )}
                    {enemyAlive && enemyCard.statusEffects.map((st, sIdx) => (
                      <StatusTokenBadge key={`e_${slotIdx}_${sIdx}`} status={st} />
                    ))}

                    {/* Ally Tokens */}
                    {playerAlive && playerCard.shield > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-cyan-900/90 border border-cyan-400 text-cyan-100 text-[8px] font-mono font-bold flex items-center gap-0.5 shadow-sm">
                        <Shield className="w-2.5 h-2.5 fill-cyan-300" />+{playerCard.shield}
                      </span>
                    )}
                    {playerAlive && playerCard.statusEffects.map((st, sIdx) => (
                      <StatusTokenBadge key={`p_${slotIdx}_${sIdx}`} status={st} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. PLAYER 3-CARD ROW */}
          <div className="w-full">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 place-items-center">
              {playerParty.slice(0, 3).map((playerCard, slotIdx) => {
                const currentAction = playerActions[slotIdx];
                const needsSkillSelection = !slotSkillChosenThisTurn[slotIdx] && (!playerCard?.exhaustTurns || playerCard.exhaustTurns <= 0);

                return (
                  <div
                    key={slotIdx}
                    onClick={() => {
                      if (!playerCard) {
                        handleEmptySlotClick(slotIdx);
                      } else {
                        setActiveSlotConfig(slotIdx);
                      }
                    }}
                    className={`w-full flex flex-col items-center transition-transform ${
                      activeSlotConfig === slotIdx ? 'scale-[1.01]' : ''
                    }`}
                  >
                    <MonsterCardView
                      card={playerCard}
                      slotIndex={slotIdx}
                      isPlayer={true}
                      isCurrentActor={activeStep?.actorSide === 'player' && activeStep?.actorSlot === slotIdx}
                      isTakingDamage={activeStep?.targetSide === 'player' && activeStep?.targetSlot === slotIdx}
                      isFatalBlow={activeStep?.targetSide === 'player' && activeStep?.targetSlot === slotIdx && !!activeStep?.isFatalBlow}
                      isCritDamage={activeStep?.targetSide === 'player' && activeStep?.targetSlot === slotIdx && !!activeStep?.isCrit}
                      dealDelay={isDealingCards ? 320 + slotIdx * 80 : undefined}
                      currentAction={currentAction}
                      needsSkillSelection={needsSkillSelection}
                      isActivePlayerSlot={activeSlotConfig === slotIdx}
                      onSelectActiveSlot={() => setActiveSlotConfig(slotIdx)}
                      onSelectSkill={(skillIdx) => handleSelectSkill(slotIdx, skillIdx)}
                      onDisabledSkillClick={(reason) => {
                        setBannerNotice(reason);
                        setTimeout(() => setBannerNotice(null), 3500);
                      }}
                      onInspectCard={() => {
                        if (playerCard) {
                          setInspectedCardData({
                            card: playerCard,
                            opposingCard: enemyParty[slotIdx],
                            slotIndex: slotIdx,
                            isPlayer: true,
                          });
                        }
                      }}
                      onHoverSkill={setHoveredSkillData}
                      floatingDamage={floatingEffects[`player_${slotIdx}`]}
                      isDraggable={!isExecutingTurn && playerCard !== null}
                      isDragging={draggedSlot === slotIdx}
                      isDragOver={dragOverSlot === slotIdx}
                      isSwapSelected={swapSelectedSlot === slotIdx}
                      onDragStart={() => handleCardDragStart(slotIdx)}
                      onDragOver={(e) => handleCardDragOver(e, slotIdx)}
                      onDragEnter={() => setDragOverSlot(slotIdx)}
                      onDragLeave={() => {
                        if (dragOverSlot === slotIdx) setDragOverSlot(null);
                      }}
                      onDrop={() => handleCardDrop(slotIdx)}
                      onTriggerSwap={() => handleTriggerSwap(slotIdx)}
                    />

                    {/* Section 12: Recall Button (Thu Hồi Quái Thú - 2 lần/trận) */}
                    {playerCard && playerCard.hp > 0 && !isExecutingTurn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecallSlot(slotIdx);
                        }}
                        className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-bold border flex items-center gap-1 transition ${
                          recallsRemaining > 0
                            ? 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/70 text-emerald-200 hover:text-white hover:scale-105 cursor-pointer shadow-md'
                            : 'bg-slate-900/60 border-slate-700/40 text-slate-500 cursor-not-allowed'
                        }`}
                        title={recallsRemaining > 0 ? `Thu hồi quái thú về tay (Còn ${recallsRemaining}/2 lượt)` : 'Đã hết lượt thu hồi trong trận này'}
                      >
                        <span>🃏 Thu Hồi</span>
                        <span className="text-amber-300">({recallsRemaining}/2)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT FLANK: TURQUOISE SHELL + GRAND STONE END TURN WHEEL (Desktop Only) */}
        <div className="hidden md:flex flex-col justify-center items-center h-full w-20 sm:w-28 shrink-0 z-30 gap-3">
          <SpiralShellSvg color="teal" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg -rotate-12 hidden lg:block" />
          <EndTurnWheel
            isExecuting={isExecutingTurn}
            onClick={handleEndTurn}
          />
        </div>
      </div>

      {/* BOTTOM ROW (DESKTOP): Backpack & Bench Toggle (Left) | Dark Continent Center Banner | Horn & Deck (Right) */}
      <div className="hidden md:flex w-full max-w-[1360px] mx-auto items-end justify-between z-30 shrink-0 px-2 sm:px-4">
        
        {/* BOTTOM LEFT: BACKPACK + RESERVE BENCH (TÚI ĐỒ & QUÁI DỰ BỊ) */}
        <div className="flex items-end gap-3 pointer-events-auto pb-1 z-40">
          <div
            onClick={() => {
              sound.playCardSelect();
              onOpenInventory?.();
            }}
            className="cursor-pointer hover:scale-105 transition-transform flex items-end gap-2 group"
            title="Túi đồ lữ hành (Mở túi để dùng Vàng, Thảo dược, Bình giáp, Cổ vật & xem Quái dự bị)"
          >
            <div className="flex flex-col items-center">
              <BackpackSvg className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg" />
              <span className="text-[8.5px] sm:text-[9.5px] font-bold text-amber-200/90 font-mono group-hover:text-amber-300">
                TÚI ĐỒ ({gold}G)
              </span>
            </div>
            <DeckStackSvg className="w-7 h-9 drop-shadow-md opacity-85 hidden sm:block" />
          </div>

          {/* RESERVE BENCH DRAWER TOGGLE BUTTON */}
          {reserveRoster && reserveRoster.length > 0 && (
            <button
              onClick={() => {
                sound.playCardSelect();
                setShowReserveDrawer(prev => !prev);
              }}
              className={`px-3 py-1.5 rounded-2xl border flex items-center gap-2 transition shadow-lg cursor-pointer ${
                showReserveDrawer
                  ? 'bg-amber-500 border-amber-300 text-slate-950 font-black ring-2 ring-amber-300'
                  : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/70 text-emerald-200 hover:text-white'
              }`}
              title="Mở ngăn quái thú dự bị để điều động ra sân"
            >
              <span className="text-base">🃏</span>
              <div className="text-left">
                <span className="text-xs font-black font-mono block leading-none">
                  DỰ BỊ ({reserveRoster.length})
                </span>
                <span className="text-[8.5px] opacity-80 block mt-0.5">
                  {showReserveDrawer ? 'Đóng ngăn' : 'Mở điều động'}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* BOTTOM CENTER: UNOBSTRUCTED DARK CONTINENT ARENA BANNER */}
        <div className="flex flex-col items-center pb-1 text-center pointer-events-none">
          <span className="text-[11px] sm:text-xs font-fantasy font-black tracking-widest text-emerald-300/80 drop-shadow">
            🌌 ĐẤU TRƯỜNG LỤC ĐỊA ĐEN (HUNTER X HUNTER)
          </span>
          <span className="text-[9px] text-amber-400/60 font-mono">
            {reserveRoster && reserveRoster.length > 0 && playerParty.slice(0, 3).some(p => p === null)
              ? '✨ Có làn trống! Bấm vào làn trống hoặc nút Dự Bị để xuất trận quái thú'
              : 'Chiến tuyến 3 làn đối đầu • Lượt đi quyết định bởi Tốc Độ SPD'}
          </span>
        </div>

        {/* BOTTOM RIGHT: WAR HORN + CARD DECK STAND (Image 1 Style) */}
        <div
          onClick={() => {
            sound.playCardSelect();
            setShowLogDrawer(prev => !prev);
          }}
          className="cursor-pointer hover:scale-105 transition-transform flex items-end gap-2 pointer-events-auto group pb-1"
          title="Tù và chiến trận (Nhật ký giao tranh)"
        >
          <DeckStackSvg className="w-7 h-9 drop-shadow-md opacity-85 hidden sm:block" />
          <div className="flex flex-col items-center">
            <BattleHornSvg className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg" />
            <span className="text-[8.5px] sm:text-[9.5px] font-bold text-amber-200/90 font-mono group-hover:text-amber-300">
              TÙ VÀ
            </span>
          </div>
        </div>
      </div>

      {/* ================= DEDICATED SLIDE-UP RESERVE ROSTER DRAWER (Không che bài trên sân!) ================= */}
      {showReserveDrawer && reserveRoster && reserveRoster.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 bg-slate-950/95 border-t-2 border-amber-500 shadow-[0_-15px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-amber-300 font-mono tracking-wider flex items-center gap-1.5">
                  <span>🃏 QUÁI THÚ TRONG TÚI DỰ BỊ ({reserveRoster.length})</span>
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/50">
                  {deployTargetSlot !== null ? `Đang chọn xuất trận vào Làn ${deployTargetSlot + 1}` : 'Chạm quái rồi chạm Làn trống trên sân để điều động'}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowReserveDrawer(false);
                  setDeployTargetSlot(null);
                  setSelectedReserveIdx(null);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition cursor-pointer"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto py-2 px-1">
              {reserveRoster.map((resCard, rIdx) => {
                const isSelected = selectedReserveIdx === rIdx;
                const elemStyle = HAND_CARD_STYLES[resCard.element] || HAND_CARD_STYLES.nature;
                const tierCode = resCard.tier || 'C';
                const tierInfo = TIERS[tierCode] || TIERS.C;

                return (
                  <div
                    key={resCard.id || rIdx}
                    onClick={() => {
                      if (deployTargetSlot !== null) {
                        handleDeployReserve(rIdx, deployTargetSlot);
                      } else if (selectedReserveIdx === rIdx) {
                        setSelectedReserveIdx(null);
                      } else {
                        setSelectedReserveIdx(rIdx);
                        sound.playCardSelect();
                        const emptyIdx = playerParty.findIndex(p => !p);
                        if (emptyIdx !== -1) {
                          setDeployTargetSlot(emptyIdx);
                        }
                      }
                    }}
                    style={{ borderColor: isSelected ? '#fbbf24' : tierInfo.hex }}
                    className={`shrink-0 w-32 sm:w-36 h-44 sm:h-48 rounded-2xl bg-gradient-to-b ${elemStyle.bg} border-2 p-2.5 flex flex-col justify-between cursor-pointer transition select-none shadow-xl relative group ${
                      isSelected
                        ? 'ring-4 ring-amber-400 -translate-y-2 shadow-[0_0_25px_rgba(245,158,11,0.9)]'
                        : 'hover:-translate-y-1 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[8px] font-mono border-b border-white/10 pb-1">
                      <div className="flex items-center gap-1 truncate min-w-0">
                        <span style={{ backgroundColor: tierInfo.hex }} className="px-1 py-0.2 rounded text-[7.5px] font-black text-slate-950 uppercase shrink-0">
                          {tierInfo.code}
                        </span>
                        <span className="font-fantasy font-black text-xs text-amber-100 truncate">{resCard.name}</span>
                      </div>
                      <span className={`text-[7.5px] font-black px-1 py-0.2 rounded bg-black/50 ${elemStyle.text}`}>{elemStyle.badge}</span>
                    </div>

                    <div className={`my-1 py-2 rounded-xl bg-gradient-to-b ${elemStyle.artBg} border border-white/10 flex items-center justify-center flex-1 shadow-inner text-4xl`}>
                      {resCard.avatar}
                    </div>

                    <div className="flex items-center justify-between font-mono text-[9px] text-white pt-1 border-t border-white/10">
                      <span className="px-1 py-0.2 rounded bg-red-950 border border-red-500/50">❤️{resCard.hp}</span>
                      <span className="px-1 py-0.2 rounded bg-amber-950 border border-amber-500/50">⚔️{resCard.attackPower}</span>
                      <span className="px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/50">⚡{resCard.speed}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const targetSlot = deployTargetSlot ?? playerParty.findIndex(p => !p);
                        if (targetSlot !== -1) {
                          handleDeployReserve(rIdx, targetSlot);
                        } else {
                          setBannerNotice('Cả 3 Làn đều đã có quái! Hãy Thu Hồi 1 quái về trước.');
                          setTimeout(() => setBannerNotice(null), 3000);
                        }
                      }}
                      className="mt-1.5 py-1 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[10px] uppercase shadow-md transition cursor-pointer"
                    >
                      {deployTargetSlot !== null ? `Xuất trận Làn ${deployTargetSlot + 1}` : 'Xuất Trận'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE TACTICAL COMMAND DECK (md:hidden) ================= */}
      <div className="md:hidden w-full z-30 shrink-0 bg-gradient-to-t from-slate-950 via-slate-950/98 to-slate-900/95 border-t border-amber-600/60 shadow-[0_-8px_25px_rgba(0,0,0,0.9)] backdrop-blur-xl px-1.5 py-1 flex flex-col gap-1">
        
        {/* ROW 1: LANE SELECTOR TABS */}
        <div className="grid grid-cols-3 gap-1 w-full">
          {[0, 1, 2].map(slotIdx => {
            const card = playerParty[slotIdx];
            const isActive = activeSlotConfig === slotIdx;
            const isAlive = card && card.hp > 0;
            const action = playerActions[slotIdx];

            return (
              <button
                key={slotIdx}
                type="button"
                onClick={() => {
                  sound.playCardSelect();
                  setActiveSlotConfig(slotIdx);
                }}
                className={`px-1.5 py-0.5 rounded-lg border transition-all flex items-center justify-between text-left touch-manipulation relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-950/95 to-slate-900 border-amber-400 ring-2 ring-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : card
                    ? 'bg-slate-900/80 border-slate-700/70 text-slate-300 hover:border-slate-500'
                    : 'bg-emerald-950/40 border-dashed border-emerald-600/40 text-emerald-400/80'
                }`}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-sm shrink-0">{card ? card.avatar : '➕'}</span>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className={`text-[9.5px] font-fantasy font-black truncate ${isActive ? 'text-amber-200' : 'text-slate-200'}`}>
                      {card ? card.name : `Làn ${slotIdx + 1}`}
                    </span>
                    {card && isAlive ? (
                      <span className="text-[8px] font-mono font-bold text-rose-300">
                        ❤️{card.hp} {card.shield > 0 ? `🛡${card.shield}` : ''}
                      </span>
                    ) : card ? (
                      <span className="text-[7.5px] font-mono text-slate-500 font-bold">💀 Tử trận</span>
                    ) : (
                      <span className="text-[7.5px] font-mono text-emerald-400">Trống</span>
                    )}
                  </div>
                </div>

                {card && isAlive && (
                  <span className={`text-[7.5px] font-mono font-black px-1 py-0.2 rounded shrink-0 ${
                    action?.skillIndex === 2
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-amber-300'
                  }`}>
                    {action?.skillIndex === 2 ? '⭐' : `⚡${action?.skillIndex || 0}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ROW 2: ACTIVE MONSTER SKILL SELECTION & END TURN BUTTON */}
        <div className="flex items-center gap-1.5 w-full">
          {/* Skill Selector (3 buttons) */}
          <div className="flex-1 grid grid-cols-3 gap-1">
            {activePlayerCard && activePlayerCard.hp > 0 ? (
              activePlayerCard.exhaustTurns && activePlayerCard.exhaustTurns > 0 ? (
                <div
                  onClick={() => {
                    setBannerNotice(`💤 [${activePlayerCard.name}] đang kiệt sức sau Tuyệt Kỹ (còn ${activePlayerCard.exhaustTurns} lượt)!`);
                    setTimeout(() => setBannerNotice(null), 3000);
                  }}
                  className="col-span-3 h-14 rounded-lg bg-slate-950/80 border border-amber-500/60 p-1 flex items-center justify-center gap-2 text-center"
                >
                  <span className="text-xl animate-pulse">💤</span>
                  <div className="flex flex-col text-left">
                    <span className="font-fantasy font-black text-xs text-amber-300 uppercase">Kiệt Sức Sau Tuyệt Kỹ</span>
                    <span className="text-[9px] text-slate-400 font-mono">Cần nghỉ ngơi: còn {activePlayerCard.exhaustTurns} lượt</span>
                  </div>
                </div>
              ) : (
                activePlayerCard.skills.map((skill, sIdx) => {
                  const isSelected = playerActions[activeSlotConfig]?.skillIndex === sIdx;
                  const isUlt = skill.isUltimate || sIdx === 2;
                  const isUltUsed = activePlayerCard.ultimateUsed || skill.usedThisCombat;
                  const isUltUnlocked = (activePlayerCard.hitsDealt || 0) >= 2 || (activePlayerCard.hp / activePlayerCard.maxHp) < 0.5 || (activePlayerCard.hiddenRage || 0) >= 3;
                  const onCooldown = (skill.currentCooldown || 0) > 0 && !isUlt;
                  const isDisabled = onCooldown || isUltUsed || (isUlt && !isUltUnlocked);

                  return (
                    <button
                      type="button"
                      key={sIdx}
                      onClick={() => {
                        if (onCooldown) {
                          sound.playCardSelect();
                          setBannerNotice(`⏳ Kỹ năng [${skill.name}] đang hồi chiêu (còn ${skill.currentCooldown} lượt)!`);
                          setTimeout(() => setBannerNotice(null), 3000);
                        } else if (isUltUsed) {
                          sound.playCardSelect();
                          setBannerNotice(`👑 Tuyệt kỹ [${skill.name}] chỉ dùng 1 lần mỗi trận!`);
                          setTimeout(() => setBannerNotice(null), 3000);
                        } else if (isUlt && !isUltUnlocked) {
                          sound.playCardSelect();
                          setBannerNotice(`🔒 Tuyệt kỹ đang khóa! Cần 2 đòn đánh / Máu <50% / 3 Nộ.`);
                          setTimeout(() => setBannerNotice(null), 3000);
                        } else {
                          handleSelectSkill(activeSlotConfig, sIdx as 0 | 1 | 2);
                        }
                      }}
                      className={`h-14 rounded-lg border p-1 flex flex-col justify-between text-left relative transition-all touch-manipulation active:scale-95 select-none ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-500/30 via-amber-950/80 to-slate-950 border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_14px_rgba(245,158,11,0.6)]'
                          : isUlt
                          ? 'bg-gradient-to-b from-yellow-950/30 to-slate-950 border-yellow-600/50 text-amber-200'
                          : 'bg-slate-900/90 border-slate-700/80 text-slate-200'
                      } ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between w-full leading-none">
                        <span className={`text-[7.5px] font-mono font-black px-1 py-0.2 rounded leading-none ${
                          isUlt
                            ? isUltUsed ? 'bg-slate-700 text-slate-300' : isUltUnlocked ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                            : onCooldown ? 'bg-red-950 text-red-300 border border-red-500/50' : sIdx === 0 ? 'bg-emerald-900/90 text-emerald-200' : 'bg-cyan-900/90 text-cyan-200'
                        }`}>
                          {isUlt
                            ? isUltUsed ? 'ĐÃ DÙNG' : isUltUnlocked ? '⭐ TUYỆT KỸ' : '🔒 KHÓA'
                            : onCooldown ? `⏳${skill.currentCooldown}L` : sIdx === 0 ? '⚡ CƠ BẢN' : '⚡ ĐẶC BIỆT'}
                        </span>
                        {isSelected && (
                          <span className="text-[7.5px] font-black text-amber-400">✓</span>
                        )}
                      </div>

                      <span className="font-fantasy font-black text-[10px] leading-tight truncate text-amber-100 my-0.5">
                        {skill.name}
                      </span>

                      <div className="flex items-center justify-between w-full text-[8.5px] font-mono font-bold leading-none">
                        <span className="text-amber-300">
                          {skill.baseDamage > 0
                            ? `⚔${skill.baseDamage}`
                            : skill.healAmount ? `💚+${skill.healAmount}` : '🛡Giáp'}
                        </span>
                        {isSelected && (
                          <span className="text-[7px] font-black text-amber-400 uppercase tracking-tighter">ĐANG CHỌN</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )
            ) : (
              <div className="col-span-3 h-14 rounded-lg border border-dashed border-emerald-600/50 bg-emerald-950/30 flex items-center justify-center p-1 text-center text-[10px] font-fantasy text-emerald-300">
                {activePlayerCard ? 'Quái thú đã tử trận' : 'Làn này trống — Bấm "🃏 Trên tay" để chọn quái xuất trận!'}
              </div>
            )}
          </div>

          {/* End Turn Wheel right by thumb */}
          <div className="shrink-0 flex flex-col items-center">
            <EndTurnWheel
              size="sm"
              isExecuting={isExecutingTurn}
              onClick={handleEndTurn}
            />
          </div>
        </div>

        {/* ROW 3: UTILITY ACTION BUTTONS (Hand Drawer, Inventory, Recall, Log) */}
        <div className="flex items-center justify-between w-full pt-0.5 border-t border-slate-800/80 text-[9.5px] font-mono">
          <button
            type="button"
            onClick={() => setShowReserveDrawer(prev => !prev)}
            className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 transition ${
              showReserveDrawer
                ? 'bg-amber-950 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            <span>🃏 Dự bị ({reserveRoster.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playCardSelect();
              onOpenInventory?.();
            }}
            className="px-2 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/60 text-amber-300 font-bold flex items-center gap-1 transition active:scale-95"
          >
            <BackpackSvg className="w-3.5 h-3.5 inline" />
            <span>Túi ({gold}G)</span>
          </button>

          {activePlayerCard && activePlayerCard.hp > 0 && !isExecutingTurn && (
            <button
              type="button"
              onClick={() => handleRecallSlot(activeSlotConfig)}
              className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 transition ${
                recallsRemaining > 0
                  ? 'bg-emerald-950 border-emerald-500/70 text-emerald-200'
                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>Thu hồi ({recallsRemaining}/2)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sound.playCardSelect();
              setShowLogDrawer(prev => !prev);
            }}
            className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-bold flex items-center gap-1 transition"
          >
            <GrimoireSvg className="w-3.5 h-3.5 inline" />
            <span>Nhật ký</span>
          </button>
        </div>


      </div>

      {/* ================= 5. SCREEN-LEVEL FIXED SKILL TOOLTIP (Khắc phục 100% che chữ / cắt chữ) ================= */}
      {hoveredSkillData && (
        <div
          style={{
            position: 'fixed',
            left: `${Math.max(16, Math.min(window.innerWidth - 410, hoveredSkillData.rect.left + hoveredSkillData.rect.width / 2 - 180))}px`,
            top: hoveredSkillData.isPlayer
              ? `${Math.max(20, hoveredSkillData.rect.top - 190)}px`
              : `${Math.min(window.innerHeight - 210, hoveredSkillData.rect.bottom + 12)}px`,
          }}
          className="w-[360px] sm:w-[400px] p-3.5 rounded-2xl bg-slate-950/98 border-2 border-amber-500 text-slate-100 shadow-[0_25px_50px_rgba(0,0,0,0.95)] backdrop-blur-xl z-[100] pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-900/60">
            <div>
              <h4 className="font-fantasy font-black text-base text-amber-200">
                {hoveredSkillData.skill.name}
              </h4>
              <span className="text-xs text-amber-400/90 font-mono">
                {hoveredSkillData.monsterName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700">
                {hoveredSkillData.skillIndex === 0 ? '⚡ Năng Lượng 0' : '⏳ Hồi Chiêu 1T'}
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-300 px-2 py-0.5 rounded-full bg-black/50 border border-amber-900/60">
                {hoveredSkillData.skill.baseDamage > 0
                  ? `⚔ ${hoveredSkillData.skill.baseDamage} ST`
                  : hoveredSkillData.skill.healAmount
                  ? `💚 +${hoveredSkillData.skill.healAmount} HP`
                  : '🛡 Giáp'}
              </span>
            </div>
          </div>

          {/* Full Unclipped Description */}
          <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-sans font-normal">
            {hoveredSkillData.skill.description}
          </p>

          {/* Relic Synergy Bonuses */}
          {hoveredSkillData.hasCleave && hoveredSkillData.skill.baseDamage > 0 && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-xs text-cyan-300 font-mono flex items-center gap-1.5 font-bold">
              <span>✨ [Cổ Vật] Đòn đánh lan sang 2 quái cạnh bên (+60% ST)</span>
            </div>
          )}
          {hoveredSkillData.hasBurn && hoveredSkillData.skill.baseDamage > 0 && (
            <div className="mt-1 text-xs text-orange-400 font-mono flex items-center gap-1.5 font-bold">
              <span>🔥 [Cổ Vật] Thiêu đốt mục tiêu mỗi lượt</span>
            </div>
          )}
        </div>
      )}

      {/* CARD & RELIC DETAILED INSPECTION MODAL (RIGHT-CLICK) */}
      {inspectedCardData && (
        <CardInspectorModal
          card={inspectedCardData.card}
          opposingCard={inspectedCardData.opposingCard}
          slotIndex={inspectedCardData.slotIndex}
          isPlayer={inspectedCardData.isPlayer}
          onClose={() => setInspectedCardData(null)}
        />
      )}

      {/* COMBAT LOG MODAL DRAWER */}
      {showLogDrawer && (
        <div className="fixed bottom-20 right-4 w-96 max-w-[90vw] max-h-72 bg-slate-950/95 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 flex flex-col backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <ScrollText className="w-3.5 h-3.5" /> Nhật Ký Chiến Đấu
            </span>
            <button
              onClick={() => setShowLogDrawer(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              Đóng
            </button>
          </div>

          <div className="overflow-y-auto flex-1 mt-2 space-y-1.5 text-[11px] pr-1">
            {combatLogs.length === 0 ? (
              <p className="text-slate-500 italic text-center py-4">Chưa có dữ liệu lượt đấu.</p>
            ) : (
              combatLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-1.5 rounded border ${
                    log.actorIsPlayer
                      ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200'
                      : 'bg-red-950/40 border-red-900/60 text-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>
                      {log.actorIsPlayer ? '🛡️' : '⚔️'} {log.actorName}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Lượt {log.turn}</span>
                  </div>
                  <p className="mt-0.5 text-slate-300">{log.message}</p>
                  {log.synergyTriggered && (
                    <p className="mt-0.5 text-[10px] font-bold text-amber-300 bg-amber-950/60 p-1 rounded border border-amber-700/50">
                      {log.synergyTriggered}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
