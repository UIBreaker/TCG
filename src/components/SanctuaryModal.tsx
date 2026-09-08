import React, { useState } from 'react';
import { MonsterCard, Relic } from '../types/game';
import { TIERS, TierCode, TierLevel, getTierByLevel } from '../models/tier';
import { computeCardTierStats, getNextTierLevel, calculateTierSkillDamage, calculateTierUltimateDamage } from '../fusion/tierScaling';
import { formatPassiveForTier } from '../data/monsters';
import { Anvil, Sparkles, Flame, CheckCircle2, ChevronRight, X, Layers, ShieldCheck, Heart, Swords, Zap } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SanctuaryModalProps {
  playerParty: (MonsterCard | null)[];
  reserveRoster: MonsterCard[];
  relicInventory: Relic[];
  onUpdatePartyAndReserve: (party: (MonsterCard | null)[], reserve: MonsterCard[]) => void;
  onUpdateRelics: (relics: Relic[]) => void;
  onClose: () => void;
}

export const SanctuaryModal: React.FC<SanctuaryModalProps> = ({
  playerParty,
  reserveRoster,
  relicInventory,
  onUpdatePartyAndReserve,
  onUpdateRelics,
  onClose,
}) => {
  const [tab, setTab] = useState<'fusion' | 'relics'>('fusion');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Collect all available cards across active party and reserve
  const allCards: { card: MonsterCard; location: 'party' | 'reserve'; index: number }[] = [];
  playerParty.forEach((c, idx) => {
    if (c) allCards.push({ card: c, location: 'party', index: idx });
  });
  reserveRoster.forEach((c, idx) => {
    allCards.push({ card: c, location: 'reserve', index: idx });
  });

  // Find eligible fusion pairs (same templateId/name, same tier, tierLevel < 7)
  const fusionPairs: {
    first: (typeof allCards)[0];
    second: (typeof allCards)[0];
    currentTier: TierCode;
    nextTier: TierCode;
  }[] = [];

  for (let i = 0; i < allCards.length; i++) {
    for (let j = i + 1; j < allCards.length; j++) {
      const a = allCards[i].card;
      const b = allCards[j].card;
      const aId = a.templateId || a.id.split('_')[0];
      const bId = b.templateId || b.id.split('_')[0];
      const aTier: TierCode = a.tier || 'C';
      const bTier: TierCode = b.tier || 'C';

      if (aId === bId && aTier === bTier) {
        const currentTierLevel = a.tierLevel ?? (TIERS[aTier]?.level || 0);
        const nextLevel = getNextTierLevel(currentTierLevel);
        if (nextLevel !== null) {
          const nextTierInfo = getTierByLevel(nextLevel);
          fusionPairs.push({
            first: allCards[i],
            second: allCards[j],
            currentTier: aTier,
            nextTier: nextTierInfo.code,
          });
        }
      }
    }
  }

  // Selected fusion pair index
  const [selectedPairIdx, setSelectedPairIdx] = useState<number>(0);

  // Selected relics to merge
  const [selectedRelicA, setSelectedRelicA] = useState<number | null>(null);
  const [selectedRelicB, setSelectedRelicB] = useState<number | null>(null);

  // Perform Card Fusion
  const handleExecuteFusion = () => {
    const pair = fusionPairs[selectedPairIdx];
    if (!pair) return;

    sound.playCardSlam();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    const cardA = pair.first.card;
    const currentLevel = cardA.tierLevel ?? (TIERS[pair.currentTier]?.level || 0);
    const nextLevel = getNextTierLevel(currentLevel);
    if (nextLevel === null) return;

    const nextTierInfo = getTierByLevel(nextLevel);
    const baseHP = cardA.baseHP ?? cardA.maxHp;
    const baseATK = cardA.baseATK ?? cardA.attackPower;
    const baseSPD = cardA.baseSPD ?? cardA.speed;
    const scaledStats = computeCardTierStats(baseHP, baseATK, baseSPD, nextLevel);

    // Deep copy skills and scale damages according to new tier
    const updatedSkills = [
      {
        ...cardA.skills[0],
        baseDamage: scaledStats.computedATK,
        description: `Đòn cơ bản gây ${scaledStats.computedATK} sát thương theo ATK.`,
      },
      {
        ...cardA.skills[1],
        baseDamage: calculateTierSkillDamage(cardA.skills[1].baseDamage, nextLevel),
        healAmount: cardA.skills[1].healAmount ? calculateTierSkillDamage(cardA.skills[1].healAmount, nextLevel) : undefined,
        description: nextLevel >= 4
          ? `${cardA.skills[1].description} (SSR+: Hóa giải 1 debuff xấu cho bản thân)`
          : cardA.skills[1].description,
      },
      {
        ...cardA.skills[2],
        baseDamage: calculateTierUltimateDamage(cardA.skills[2].baseDamage, nextLevel),
        description: `TUYỆT KỸ: Gây ${calculateTierUltimateDamage(cardA.skills[2].baseDamage, nextLevel)} sát thương khi đạt 2 đòn đánh, dưới 50% HP hoặc đủ 3 Nộ ẩn.`,
      },
    ] as [MonsterCard['skills'][0], MonsterCard['skills'][1], MonsterCard['skills'][2]];

    const scaledPassive = formatPassiveForTier(cardA.passive, nextLevel);

    const fusedCard: MonsterCard = {
      ...cardA,
      tier: nextTierInfo.code,
      tierLevel: nextLevel,
      baseHP,
      baseATK,
      baseSPD,
      computedHP: scaledStats.computedHP,
      computedATK: scaledStats.computedATK,
      computedSPD: scaledStats.computedSPD,
      computedDEF: scaledStats.computedDEF,
      maxHp: scaledStats.computedHP,
      hp: scaledStats.computedHP, // Full heal on fusion
      attackPower: scaledStats.computedATK,
      speed: scaledStats.computedSPD, // Speed scales with tier!
      defense: scaledStats.computedDEF,
      equippedRelics: [...cardA.equippedRelics, ...pair.second.card.equippedRelics],
      passive: scaledPassive,
      skills: updatedSkills,
    };

    // Update playerParty & reserveRoster immutably
    const nextParty = [...playerParty];
    const nextReserve = [...reserveRoster];

    // Remove second card first
    if (pair.second.location === 'party') {
      nextParty[pair.second.index] = null;
    } else {
      nextReserve.splice(pair.second.index, 1);
    }

    // Replace first card with fused card
    if (pair.first.location === 'party') {
      nextParty[pair.first.index] = fusedCard;
    } else {
      // Find actual current index in nextReserve if second was also in reserve
      const targetIdx = pair.second.location === 'reserve' && pair.second.index < pair.first.index
        ? pair.first.index - 1
        : pair.first.index;
      nextReserve[targetIdx] = fusedCard;
    }

    onUpdatePartyAndReserve(nextParty, nextReserve);
    setSuccessMessage(`🔥 Hợp nhất thành công! ${fusedCard.name} đạt Bậc [${fusedCard.tier}] với HP ${fusedCard.maxHp}, ATK ${fusedCard.attackPower}!`);
    setSelectedPairIdx(0);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Perform Relic Merge
  const handleExecuteRelicMerge = () => {
    if (selectedRelicA === null || selectedRelicB === null || selectedRelicA === selectedRelicB) return;
    const relicA = relicInventory[selectedRelicA];
    const relicB = relicInventory[selectedRelicB];
    if (!relicA || !relicB) return;

    sound.playCardSlam();
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });

    const mergedRelic: Relic = {
      id: `merged_${relicA.id}_${relicB.id}`,
      name: `${relicA.name} Tinh Hoa`,
      description: `Cổ vật hợp nhất cộng hưởng +20%: ${relicA.description} kết hợp cùng ${relicB.description}`,
      rarity: relicA.rarity === 'legendary' || relicB.rarity === 'legendary' ? 'legendary' : 'epic',
      price: Math.round((relicA.price + relicB.price) * 1.2),
      icon: relicA.icon || '✨',
      type: relicA.type,
    };

    const nextRelics = relicInventory.filter((_, idx) => idx !== selectedRelicA && idx !== selectedRelicB);
    nextRelics.push(mergedRelic);

    onUpdateRelics(nextRelics);
    setSelectedRelicA(null);
    setSelectedRelicB(null);
    setSuccessMessage(`✨ Luyện hóa thành công! Nhận Cổ Vật [${mergedRelic.name}]!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const activePair = fusionPairs[selectedPairIdx];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-950 border-2 border-amber-600/80 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/70 text-amber-400 shadow-inner">
              <Anvil className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-fantasy font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-100">
                  LÒ RÈN THẦN BÍ • SANCTUARY
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-600/50 text-[10px] font-mono text-amber-300 uppercase">
                  Tầng 3 / 5
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Nơi ngọn lửa vĩnh hằng tôi luyện: Hợp nhất quái thú cùng Bậc lên Bậc cao hơn hoặc Luyện hóa Cổ Vật!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-3 my-3 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setTab('fusion');
            }}
            className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              tab === 'fusion'
                ? 'bg-amber-600 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] font-black'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>HỢP NHẤT THẺ BÀI (CARD FUSION) • {fusionPairs.length} CẶP KHẢ DỤNG</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab('relics');
            }}
            className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              tab === 'relics'
                ? 'bg-amber-600 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] font-black'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>LUYỆN HÓA CỔ VẬT (RELIC MERGE) • {relicInventory.length} CỔ VẬT</span>
          </button>
        </div>

        {/* Notice Message */}
        {successMessage && (
          <div className="mb-3 px-4 py-2 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-bold text-center animate-in fade-in">
            {successMessage}
          </div>
        )}

        {/* Body Content */}
        <div className="overflow-y-auto flex-1 pr-1">
          {tab === 'fusion' ? (
            <div>
              {fusionPairs.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400">
                  <Flame className="w-12 h-12 mx-auto mb-3 text-amber-500/40" />
                  <h4 className="text-base font-bold text-slate-300 mb-1">Chưa có 2 lá bài nào cùng Tên & cùng Bậc</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Để hợp nhất, bạn cần sở hữu 2 lá bài cùng loài và cùng Bậc (ví dụ: 2 lá Hỏa Miêu [C]). Hãy dùng Thẻ Chiêu Mộ trong trận đấu hoặc ghé Thương Điếm để chiêu mộ thêm!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pair Selector if multiple */}
                  {fusionPairs.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {fusionPairs.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPairIdx(idx)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition ${
                            selectedPairIdx === idx
                              ? 'bg-amber-950 border-amber-400 text-amber-200 shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          <span>{p.first.card.avatar}</span>
                          <span>{p.first.card.name}</span>
                          <span className="text-amber-400">[{p.currentTier} ➔ {p.nextTier}]</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {activePair && (() => {
                    const cardA = activePair.first.card;
                    const curTierInfo = TIERS[activePair.currentTier] || TIERS.C;
                    const nextTierInfo = TIERS[activePair.nextTier] || TIERS.UC;
                    const baseHP = cardA.baseHP ?? cardA.maxHp;
                    const baseATK = cardA.baseATK ?? cardA.attackPower;
                    const baseSPD = cardA.baseSPD ?? cardA.speed;
                    const curLevel = cardA.tierLevel ?? curTierInfo.level;
                    const nextLevel = getNextTierLevel(curLevel) ?? 1;
                    const nextStats = computeCardTierStats(baseHP, baseATK, baseSPD, nextLevel);

                    return (
                      <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900/60 to-slate-950 border border-amber-500/50 shadow-xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          {/* Card 1 & Card 2 Source Display */}
                          <div className="space-y-2">
                            <div className="text-[11px] font-mono text-amber-300 font-bold uppercase flex items-center gap-1">
                              <span>1. NGUYÊN LIỆU ĐỒNG ĐỒNG BẬC</span>
                            </div>
                            <div className="p-3 rounded-xl bg-black/60 border border-slate-700 flex items-center gap-3">
                              <span className="text-3xl">{cardA.avatar}</span>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-sm text-slate-200 truncate">{cardA.name}</h5>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span style={{ backgroundColor: curTierInfo.hex }} className="px-1.5 py-0.2 rounded text-[9px] font-black text-slate-950">
                                    {curTierInfo.code}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    HP {cardA.hp}/{cardA.maxHp} • ATK {cardA.attackPower}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-black/60 border border-slate-700 flex items-center gap-3">
                              <span className="text-3xl">{activePair.second.card.avatar}</span>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-sm text-slate-200 truncate">{activePair.second.card.name}</h5>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span style={{ backgroundColor: curTierInfo.hex }} className="px-1.5 py-0.2 rounded text-[9px] font-black text-slate-950">
                                    {curTierInfo.code}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Bản sao cùng Bậc
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Arrow & Forge Spark */}
                          <div className="flex flex-col items-center justify-center py-2 text-center">
                            <div className="p-3 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 animate-bounce">
                              <Flame className="w-6 h-6 text-amber-400" />
                            </div>
                            <span className="text-[11px] font-mono text-amber-400 font-black mt-2">
                              TÔI LUYỆN LÊN
                            </span>
                            <span className="text-xs text-slate-400">
                              Bậc kế tiếp [{nextTierInfo.code}]
                            </span>
                          </div>

                          {/* Resulting Fused Card Preview */}
                          <div className="p-4 rounded-xl bg-black/70 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                            <div className="flex items-center justify-between mb-2">
                              <span style={{ backgroundColor: nextTierInfo.hex }} className="px-2 py-0.5 rounded text-[10px] font-black text-slate-950 uppercase shadow">
                                BẬC MỚI: {nextTierInfo.code} ({nextTierInfo.name})
                              </span>
                              <span className="text-[10px] font-mono text-amber-300 font-bold">
                                Hệ số x{nextTierInfo.multiplier.toFixed(2)}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">{cardA.avatar}</span>
                              <div>
                                <h4 className="font-fantasy font-black text-base text-amber-100">{cardA.name}</h4>
                                <span className="text-[11px] text-slate-400 italic">{cardA.title}</span>
                              </div>
                            </div>

                            {/* Stat Boost Breakdown */}
                            <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 rounded-lg bg-slate-900 border border-amber-500/40 text-center font-mono text-xs mb-3">
                              <div>
                                <span className="text-[9px] text-slate-400 block">MÁU HP</span>
                                <span className="font-bold text-red-400">{nextStats.computedHP}</span>
                                <span className="text-[8px] text-emerald-400 block">+{nextStats.computedHP - cardA.maxHp}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block">TẤN CÔNG</span>
                                <span className="font-bold text-orange-400">{nextStats.computedATK}</span>
                                <span className="text-[8px] text-emerald-400 block">+{nextStats.computedATK - cardA.attackPower}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block">TỐC ĐỘ</span>
                                <span className="font-bold text-teal-400">{nextStats.computedSPD}</span>
                                <span className="text-[8px] text-emerald-400 block">+{nextStats.computedSPD - cardA.speed}</span>
                              </div>
                            </div>

                            {/* SSR+ Cleanse Special Unlocked */}
                            {nextLevel >= 4 && (
                              <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/70 text-[10px] text-amber-200 flex items-center gap-1.5 mb-3">
                                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                                <span><strong>Đặc Quyền SSR+:</strong> Mở khóa Cleanse (Hóa giải 1 Debuff khi dùng Chiêu 2)!</span>
                              </div>
                            )}

                            <button
                              onClick={handleExecuteFusion}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs font-fantasy tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
                            >
                              <Anvil className="w-4 h-4" />
                              <span>TIẾN HÀNH HỢP NHẤT NGAY</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Relic Merge */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/50 text-xs text-amber-200/90 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Chọn 2 Cổ Vật trong rương để tôi luyện thành 1 Cổ Vật Tinh Hoa với hiệu ứng cộng hưởng +20%!</span>
              </div>

              {relicInventory.length < 2 ? (
                <div className="text-center py-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400">
                  <Layers className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                  <p className="text-xs">Bạn cần ít nhất 2 Cổ Vật trong rương để tiến hành luyện hóa.</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {relicInventory.map((r, idx) => {
                      const isA = selectedRelicA === idx;
                      const isB = selectedRelicB === idx;
                      const isChosen = isA || isB;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            sound.playClick();
                            if (isA) setSelectedRelicA(null);
                            else if (isB) setSelectedRelicB(null);
                            else if (selectedRelicA === null) setSelectedRelicA(idx);
                            else if (selectedRelicB === null) setSelectedRelicB(idx);
                            else setSelectedRelicB(idx);
                          }}
                          className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                            isChosen
                              ? 'bg-amber-950/70 border-amber-400 shadow-md ring-2 ring-amber-500/40'
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-3xl p-2 rounded-xl bg-black/40 border border-white/10">{r.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-amber-200 truncate">{r.name}</h5>
                              <span className="text-[9px] font-mono uppercase text-amber-400">{r.rarity}</span>
                            </div>
                            <p className="text-[10px] text-slate-300 leading-tight mt-0.5 line-clamp-2">{r.description}</p>
                          </div>
                          {isChosen && (
                            <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                              {isA ? '1' : '2'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {selectedRelicA !== null && selectedRelicB !== null && (
                    <div className="p-4 rounded-2xl bg-amber-950/50 border-2 border-amber-500 flex items-center justify-between gap-4">
                      <div className="text-xs">
                        <span className="text-amber-300 font-bold block">
                          Sẵn sàng luyện hóa: {relicInventory[selectedRelicA]?.name} + {relicInventory[selectedRelicB]?.name}
                        </span>
                        <span className="text-slate-300 text-[11px]">Tạo ra Cổ Vật Tinh Hoa cấp cao với hiệu ứng +20%</span>
                      </div>
                      <button
                        onClick={handleExecuteRelicMerge}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
                      >
                        LUYỆN HÓA CỔ VẬT
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-4 mt-3 border-t border-amber-900/50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Lò Rèn Sanctuary chỉ xuất hiện 1 lần mỗi chặng hành trình.
          </span>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-fantasy font-black text-xs tracking-wider shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 transition"
          >
            <span>TIẾP TỤC HÀNH TRÌNH</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
