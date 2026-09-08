import React, { useState } from 'react';
import { Relic, MonsterCard, ElementType } from '../types/game';
import { Briefcase, Coins, Scroll, Sparkles, X, Heart, Shield, Zap, Plus, Check, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { RelicIcon } from './RelicIcon';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold: number;
  captureCardsCount: number;
  healingHerbsCount: number;
  shieldPotionsCount: number;
  keysCount?: number;
  lockpickToolkitsCount?: number;
  playerParty: (MonsterCard | null)[];
  reserveRoster: MonsterCard[];
  relicInventory: Relic[];
  onUseCaptureCard?: () => void;
  onUseHealingHerb?: (targetSlot: number, isReserve?: boolean) => void;
  onUseShieldPotion?: (targetSlot: number, isReserve?: boolean) => void;
  onEquipRelic?: (targetSlot: number, relic: Relic, isReserve?: boolean) => void;
  onUnequipRelic?: (targetSlot: number, relicIdx: number, isReserve?: boolean) => void;
  onBuyItem?: (type: 'capture_card' | 'healing_herb' | 'shield_potion' | 'key' | 'toolkit', cost: number) => void;
  isInCombat?: boolean;
}

const ELEMENT_COLORS: Record<ElementType, { bg: string; text: string; badge: string }> = {
  fire: { bg: 'bg-orange-950/70 border-orange-600/80', text: 'text-orange-200', badge: '🔥 Hỏa' },
  water: { bg: 'bg-blue-950/70 border-blue-600/80', text: 'text-blue-200', badge: '💧 Thủy' },
  nature: { bg: 'bg-emerald-950/70 border-emerald-600/80', text: 'text-emerald-200', badge: '🌿 Mộc' },
  thunder: { bg: 'bg-yellow-950/70 border-yellow-600/80', text: 'text-yellow-200', badge: '⚡ Lôi' },
  earth: { bg: 'bg-amber-950/70 border-amber-600/80', text: 'text-amber-200', badge: '🌍 Thổ' },
};

const RARITY_COLORS = {
  common: 'border-slate-500 text-slate-300 bg-slate-900/80',
  rare: 'border-blue-500 text-blue-300 bg-blue-950/80',
  epic: 'border-purple-500 text-purple-300 bg-purple-950/80',
  legendary: 'border-amber-400 text-amber-300 bg-amber-950/90',
};

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  gold,
  captureCardsCount,
  healingHerbsCount = 0,
  shieldPotionsCount = 0,
  keysCount = 0,
  lockpickToolkitsCount = 0,
  playerParty,
  reserveRoster,
  relicInventory,
  onUseCaptureCard,
  onUseHealingHerb,
  onUseShieldPotion,
  onEquipRelic,
  onUnequipRelic,
  onBuyItem,
  isInCombat = false,
}) => {
  // Mode selection: which action is currently armed
  // 'none' | 'heal' | 'shield' | 'equip'
  const [armedAction, setArmedAction] = useState<'none' | 'heal' | 'shield' | 'equip'>('none');
  const [selectedRelicToEquip, setSelectedRelicToEquip] = useState<Relic | null>(null);
  const [inspectingRelic, setInspectingRelic] = useState<{ relic: Relic; slotIdx?: number; relicIdx?: number; isReserve?: boolean } | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'consumables' | 'relics'>('consumables');
  const [partyViewMode, setPartyViewMode] = useState<'active' | 'reserve'>('active');

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // 1. Armed Healing Action
  const handleArmHeal = () => {
    if (healingHerbsCount <= 0) {
      showNotice('❌ Bạn không còn Dược Thảo Rừng Xanh! Hãy mua thêm bên dưới.');
      return;
    }
    sound.playCardSelect();
    if (armedAction === 'heal') {
      setArmedAction('none');
    } else {
      setArmedAction('heal');
      setSelectedRelicToEquip(null);
      showNotice('🌿 Hãy bấm vào 1 linh thú bên trái để hồi +35 Máu!');
    }
  };

  // 2. Armed Shield Action
  const handleArmShield = () => {
    if (shieldPotionsCount <= 0) {
      showNotice('❌ Bạn không còn Bình Giáp Hộ Mệnh! Hãy mua thêm bên dưới.');
      return;
    }
    sound.playCardSelect();
    if (armedAction === 'shield') {
      setArmedAction('none');
    } else {
      setArmedAction('shield');
      setSelectedRelicToEquip(null);
      showNotice('🛡️ Hãy bấm vào 1 linh thú bên trái để ban +25 Giáp ảo!');
    }
  };

  // 3. Armed Equip Relic Action
  const handleArmEquipRelic = (relic: Relic) => {
    sound.playCardSelect();
    if (selectedRelicToEquip?.id === relic.id && armedAction === 'equip') {
      setArmedAction('none');
      setSelectedRelicToEquip(null);
    } else {
      setArmedAction('equip');
      setSelectedRelicToEquip(relic);
      showNotice(`✨ Đang chọn [${relic.name}]! Hãy nhấp vào 1 linh thú bên trái để trang bị.`);
    }
  };

  // 4. Clicked a monster card (active slot or reserve)
  const handleMonsterSlotClick = (slotIdx: number, isReserve: boolean = false) => {
    const card = isReserve ? reserveRoster[slotIdx] : playerParty[slotIdx];
    if (!card || card.hp <= 0) {
      showNotice('❌ Ô này trống hoặc quái thú đã tử trận!');
      return;
    }

    // Apply Heal
    if (armedAction === 'heal') {
      if (card.hp >= card.maxHp) {
        showNotice(`⚠️ [${card.name}] đang đầy máu, không thể dùng thêm thuốc!`);
        return;
      }
      if (onUseHealingHerb) {
        sound.playHeal();
        onUseHealingHerb(slotIdx, isReserve);
        showNotice(`💚 Đã dùng Thảo Dược hồi phục +35 HP cho [${card.name}]!`);
        setArmedAction('none');
      }
      return;
    }

    // Apply Shield
    if (armedAction === 'shield') {
      if (onUseShieldPotion) {
        sound.playCardSlam();
        onUseShieldPotion(slotIdx, isReserve);
        showNotice(`🛡️ Đã ban +25 Giáp ảo hộ mệnh cho [${card.name}]!`);
        setArmedAction('none');
      }
      return;
    }

    // Apply Equip Relic
    if (armedAction === 'equip' && selectedRelicToEquip) {
      if (card.equippedRelics.length >= 10) {
        showNotice(`❌ [${card.name}] đã đầy 10 ô Cổ Vật! Vui lòng tháo bớt trước.`);
        return;
      }
      if (card.equippedRelics.some(r => r.id === selectedRelicToEquip.id)) {
        showNotice(`⚠️ [${card.name}] đã trang bị cổ vật này rồi!`);
        return;
      }
      if (onEquipRelic) {
        sound.playCardSlam();
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        onEquipRelic(slotIdx, selectedRelicToEquip, isReserve);
        showNotice(`✨ Đã gắn [${selectedRelicToEquip.name}] lên [${card.name}] thành công!`);
        setArmedAction('none');
        setSelectedRelicToEquip(null);
      }
      return;
    }

    // Default click: Show monster details notice
    showNotice(`ℹ️ ${card.name}: ${card.hp}/${card.maxHp} HP, Giáp +${card.shield || 0}, Cổ vật: ${card.equippedRelics.length}/10`);
  };

  // 5. Unequip relic from monster
  const handleUnequip = (slotIdx: number, relicIdx: number, relicName: string, isReserve: boolean = false) => {
    sound.playCardSelect();
    if (onUnequipRelic) {
      onUnequipRelic(slotIdx, relicIdx, isReserve);
      showNotice(`↩️ Đã tháo cổ vật [${relicName}] về Túi Đồ!`);
      setInspectingRelic(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-[#0c1611] border-2 border-emerald-600/90 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col max-h-[94vh] overflow-hidden text-slate-100 relative">
        
        {/* TOP HEADER */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-emerald-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-800 to-[#3b1d06] border-2 border-amber-400/80 flex items-center justify-center text-2xl shadow-lg">
              🎒
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-fantasy font-black text-amber-200 tracking-wide flex items-center gap-2">
                <span>TÚI ĐỒ LỮ HÀNH & TRANG BỊ CỔ VẬT</span>
              </h2>
              <p className="text-xs text-emerald-300/85 font-medium">
                Sử dụng dược phẩm hồi phục, ban giáp và gắn cổ vật trực tiếp vào các lá bài linh thú
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Gold Balance Chip */}
            <div className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-950 to-yellow-950 border-2 border-amber-500 flex items-center gap-2 shadow-md">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="text-lg font-black font-mono text-amber-300">{gold}</span>
              <span className="text-xs font-mono font-bold text-amber-400">VÀNG</span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-400 hover:text-white flex items-center justify-center transition hover:scale-110 active:scale-95"
              title="Đóng túi đồ [ESC]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION BANNER */}
        {noticeMessage ? (
          <div className="py-2 px-4 rounded-xl bg-amber-950/95 border border-amber-400 text-amber-200 text-xs sm:text-sm font-bold font-mono text-center animate-pulse shadow-lg mb-2">
            {noticeMessage}
          </div>
        ) : armedAction !== 'none' ? (
          <div className="py-2 px-4 rounded-xl bg-emerald-950/95 border border-emerald-400 text-emerald-200 text-xs sm:text-sm font-black font-mono text-center animate-bounce shadow-lg mb-2 flex items-center justify-center gap-2">
            <span>👉 CHẾ ĐỘ THAO TÁC:</span>
            {armedAction === 'heal' && <span>BẤM VÀO LINH THÚ MUỐN HỒI PHỤC (+35 HP)</span>}
            {armedAction === 'shield' && <span>BẤM VÀO LINH THÚ MUỐN BAN GIÁP (+25 GIÁP)</span>}
            {armedAction === 'equip' && <span>BẤM VÀO LINH THÚ ĐỂ GẮN [{selectedRelicToEquip?.name}]</span>}
            <button
              onClick={() => {
                setArmedAction('none');
                setSelectedRelicToEquip(null);
              }}
              className="ml-3 px-2 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-white text-xs border border-slate-700"
            >
              Hủy thao tác
            </button>
          </div>
        ) : null}

        {/* MAIN BODY: 2 COLUMNS (LEFT = PARTY SHOWCASE & SLOTS, RIGHT = SATCHEL & RELIC VAULT) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          
          {/* ================= LEFT COLUMN: ĐỘI HÌNH LINH THÚ (lg:col-span-6) ================= */}
          <div className="lg:col-span-6 flex flex-col min-h-0 bg-slate-950/60 border border-emerald-900/60 rounded-2xl p-3 sm:p-4">
            {/* View Switcher: Active (3 Lanes) vs Reserve (Hand/Bench) */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-900/40 shrink-0">
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-emerald-900/60">
                <button
                  onClick={() => {
                    sound.playClick();
                    setPartyViewMode('active');
                  }}
                  className={`px-3 py-1 rounded-lg font-black text-xs transition ${
                    partyViewMode === 'active'
                      ? 'bg-emerald-700 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🛡️ TRÊN SÂN (3 LÀN)
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setPartyViewMode('reserve');
                  }}
                  className={`px-3 py-1 rounded-lg font-black text-xs transition flex items-center gap-1.5 ${
                    partyViewMode === 'reserve'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🃏 DỰ BỊ / TRÊN TAY</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black/50 text-[10px] font-mono font-bold">
                    {reserveRoster.length}
                  </span>
                </button>
              </div>

              <span className="text-[11px] text-emerald-300 font-bold hidden sm:inline">
                {armedAction !== 'none' ? '👉 Nhấp thẻ để áp dụng' : 'Xem & Quản lý'}
              </span>
            </div>

            {/* List of Monsters */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {partyViewMode === 'active' ? (
                // 3 Active Lane Monsters
                [0, 1, 2].map((slotIdx) => {
                  const card = playerParty[slotIdx];
                  const isArmed = armedAction !== 'none';
                  const canAcceptRelic = armedAction === 'equip' && card && card.equippedRelics.length < 10;
                  const needsHeal = armedAction === 'heal' && card && card.hp < card.maxHp;
                  const canShield = armedAction === 'shield' && card && card.hp > 0;

                  if (!card) {
                    return (
                      <div
                        key={slotIdx}
                        className="p-3 rounded-2xl bg-black/30 border-2 border-dashed border-emerald-900/50 flex items-center justify-center text-center text-slate-500 text-xs font-mono h-24"
                      >
                        <span>Làn {slotIdx + 1}: Chưa đặt linh thú lên sàn</span>
                      </div>
                    );
                  }

                  const palette = ELEMENT_COLORS[card.element] || ELEMENT_COLORS.nature;
                  const isDead = card.hp <= 0;
                  const isHighlighted = isArmed && (canAcceptRelic || needsHeal || canShield);

                  return (
                    <div
                      key={slotIdx}
                      onClick={() => handleMonsterSlotClick(slotIdx, false)}
                      className={`p-3 rounded-2xl border-2 transition-all relative cursor-pointer ${
                        isHighlighted
                          ? 'ring-4 ring-amber-400 border-amber-300 bg-amber-950/30 scale-[1.01] shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                          : isDead
                          ? 'opacity-50 border-red-900 bg-red-950/20'
                          : `${palette.bg} hover:border-amber-400 hover:scale-[1.01]`
                      }`}
                    >
                      {/* Top Row: Avatar, Name, Element, HP, Speed */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-white/20 flex items-center justify-center text-3xl shrink-0 shadow-md">
                            {card.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-fantasy font-black text-sm sm:text-base text-white">
                                {card.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9.5px] font-black text-amber-200">
                                {palette.badge}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                (Làn {slotIdx + 1})
                              </span>
                            </div>
                            
                            {/* Live HP Bar */}
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-32 sm:w-40 h-3 bg-black/60 rounded-full overflow-hidden border border-white/20 p-0.5">
                                <div
                                  style={{ width: `${Math.max(0, Math.min(100, Math.round((card.hp / card.maxHp) * 100)))}%` }}
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    card.hp > card.maxHp * 0.5 ? 'bg-emerald-500' : card.hp > card.maxHp * 0.25 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                />
                              </div>
                              <span className="font-mono text-xs font-bold text-white">
                                {card.hp}/{card.maxHp} HP
                              </span>
                              {card.shield > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-mono text-[10px] font-black flex items-center gap-0.5">
                                  <Shield className="w-3 h-3 fill-white" /> +{card.shield}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Action Hint if armed */}
                        {isArmed && (
                          <div className="shrink-0">
                            {armedAction === 'heal' && needsHeal && (
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-tight shadow-md animate-pulse block">
                                💚 Hồi Máu
                              </span>
                            )}
                            {armedAction === 'shield' && canShield && (
                              <span className="px-3 py-1.5 rounded-xl bg-cyan-600 text-slate-950 font-black text-xs uppercase tracking-tight shadow-md animate-pulse block">
                                🛡️ Ban Giáp
                              </span>
                            )}
                            {armedAction === 'equip' && canAcceptRelic && (
                              <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-tight shadow-md animate-pulse block">
                                ✨ Gắn Vào Đây
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: 10 Relic Sockets */}
                      <div className="mt-2.5 pt-2 border-t border-white/15">
                        <div className="flex items-center justify-between mb-1 text-[10.5px] font-bold text-slate-300">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Ô Cổ Vật Trang Bị ({card.equippedRelics.length}/10):</span>
                          </span>
                          <span className="text-[10px] text-amber-300/80">Nhấp vào cổ vật để tháo ra</span>
                        </div>

                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                          {Array.from({ length: 10 }).map((_, rIdx) => {
                            const relic = card.equippedRelics[rIdx];
                            if (relic) {
                              return (
                                <div
                                  key={rIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectingRelic({ relic, slotIdx, relicIdx: rIdx, isReserve: false });
                                  }}
                                  className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-400/80 hover:border-yellow-300 hover:scale-110 flex items-center justify-center text-amber-300 cursor-pointer transition shadow group relative"
                                  title={`${relic.name}: ${relic.description} (Bấm để xem/tháo)`}
                                >
                                  <RelicIcon icon={relic.icon} className="w-4 h-4" />
                                </div>
                              );
                            }
                            return (
                              <div
                                key={rIdx}
                                className="w-8 h-8 rounded-lg bg-black/40 border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-600 font-mono"
                                title="Ô trống sẵn sàng gắn cổ vật"
                              >
                                +
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Reserve Roster Monsters
                reserveRoster.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-black/30 border-2 border-dashed border-emerald-900/40 text-center flex flex-col items-center justify-center">
                    <span className="text-3xl mb-2">📦</span>
                    <span className="font-fantasy font-black text-amber-200 text-sm">Chưa có linh thú dự bị trên tay</span>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Hãy dùng Thẻ Bắt Thu Phục trong các trận chiến để đưa quái thú hoang dã vào túi bài của bạn!
                    </p>
                  </div>
                ) : (
                  reserveRoster.map((card, rIdx) => {
                    const isArmed = armedAction !== 'none';
                    const canAcceptRelic = armedAction === 'equip' && card.equippedRelics.length < 10;
                    const needsHeal = armedAction === 'heal' && card.hp < card.maxHp;
                    const canShield = armedAction === 'shield' && card.hp > 0;
                    const palette = ELEMENT_COLORS[card.element] || ELEMENT_COLORS.nature;
                    const isDead = card.hp <= 0;
                    const isHighlighted = isArmed && (canAcceptRelic || needsHeal || canShield);

                    return (
                      <div
                        key={card.id || rIdx}
                        onClick={() => handleMonsterSlotClick(rIdx, true)}
                        className={`p-3 rounded-2xl border-2 transition-all relative cursor-pointer ${
                          isHighlighted
                            ? 'ring-4 ring-amber-400 border-amber-300 bg-amber-950/30 scale-[1.01] shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                            : isDead
                            ? 'opacity-50 border-red-900 bg-red-950/20'
                            : `${palette.bg} hover:border-amber-400 hover:scale-[1.01]`
                        }`}
                      >
                        {/* Top Row: Avatar, Name, Element, HP, Speed */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-white/20 flex items-center justify-center text-3xl shrink-0 shadow-md">
                              {card.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-fantasy font-black text-sm sm:text-base text-white">
                                  {card.name}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9.5px] font-black text-amber-200">
                                  {palette.badge}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-amber-400">
                                  (Dự bị #{rIdx + 1})
                                </span>
                              </div>
                              
                              {/* Live HP Bar */}
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-32 sm:w-40 h-3 bg-black/60 rounded-full overflow-hidden border border-white/20 p-0.5">
                                  <div
                                    style={{ width: `${Math.max(0, Math.min(100, Math.round((card.hp / card.maxHp) * 100)))}%` }}
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      card.hp > card.maxHp * 0.5 ? 'bg-emerald-500' : card.hp > card.maxHp * 0.25 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                  />
                                </div>
                                <span className="font-mono text-xs font-bold text-white">
                                  {card.hp}/{card.maxHp} HP
                                </span>
                                {card.shield > 0 && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-mono text-[10px] font-black flex items-center gap-0.5">
                                    <Shield className="w-3 h-3 fill-white" /> +{card.shield}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Action Hint if armed */}
                          {isArmed && (
                            <div className="shrink-0">
                              {armedAction === 'heal' && needsHeal && (
                                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-tight shadow-md animate-pulse block">
                                  💚 Hồi Máu
                                </span>
                              )}
                              {armedAction === 'shield' && canShield && (
                                <span className="px-3 py-1.5 rounded-xl bg-cyan-600 text-slate-950 font-black text-xs uppercase tracking-tight shadow-md animate-pulse block">
                                  🛡️ Ban Giáp
                                </span>
                              )}
                              {armedAction === 'equip' && canAcceptRelic && (
                                <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-tight shadow-md animate-pulse block">
                                  ✨ Gắn Vào Đây
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bottom Row: 10 Relic Sockets */}
                        <div className="mt-2.5 pt-2 border-t border-white/15">
                          <div className="flex items-center justify-between mb-1 text-[10.5px] font-bold text-slate-300">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>Ô Cổ Vật Trang Bị ({card.equippedRelics.length}/10):</span>
                            </span>
                            <span className="text-[10px] text-amber-300/80">Nhấp vào cổ vật để tháo ra</span>
                          </div>

                          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                            {Array.from({ length: 10 }).map((_, relicIdx) => {
                              const relic = card.equippedRelics[relicIdx];
                              if (relic) {
                                return (
                                  <div
                                    key={relicIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInspectingRelic({ relic, slotIdx: rIdx, relicIdx, isReserve: true });
                                    }}
                                    className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-400/80 hover:border-yellow-300 hover:scale-110 flex items-center justify-center text-amber-300 cursor-pointer transition shadow group relative"
                                    title={`${relic.name}: ${relic.description} (Bấm để xem/tháo)`}
                                  >
                                    <RelicIcon icon={relic.icon} className="w-4 h-4" />
                                  </div>
                                );
                              }
                              return (
                                <div
                                  key={relicIdx}
                                  className="w-8 h-8 rounded-lg bg-black/40 border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-600 font-mono"
                                  title="Ô trống sẵn sàng gắn cổ vật"
                                >
                                  +
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: TÚI ĐỒ VẬT PHẨM & KHO CỔ VẬT (lg:col-span-6) ================= */}
          <div className="lg:col-span-6 flex flex-col min-h-0 bg-slate-950/60 border border-emerald-900/60 rounded-2xl p-3 sm:p-4">
            
            {/* TAB SELECTOR */}
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-emerald-900/40 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('consumables');
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                  activeTab === 'consumables'
                    ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-white border border-emerald-400 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>🧪 VẬT PHẨM TIÊU HAO</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                  {captureCardsCount + healingHerbsCount + shieldPotionsCount}
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('relics');
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                  activeTab === 'relics'
                    ? 'bg-gradient-to-r from-amber-800 to-yellow-800 text-white border border-amber-400 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>✨ CỔ VẬT DỰ TRỮ</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                  {relicInventory.length}
                </span>
              </button>
            </div>

            {/* TAB 1: CONSUMABLES (THẺ BẮT, DƯỢC THẢO, BÌNH GIÁP) */}
            {activeTab === 'consumables' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                
                {/* 1. THẺ BẮT THU PHỤC */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#240b2f] to-[#120517] border-2 border-purple-600/70 shadow-md flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-400 flex items-center justify-center text-2xl shrink-0 shadow">
                        🔮
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-fantasy font-black text-sm text-purple-200">
                            Thẻ Bắt Thu Phục
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-mono font-black text-[11px]">
                            Có sẵn: {captureCardsCount} lá
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-200/80 mt-0.5 leading-snug">
                          Dùng trong trận đấu để phong ấn quái thú rừng hoang khi chúng yếu máu (&lt;45%). Thu phục thành công sẽ lập tức vào tay bạn!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-purple-800/40 flex items-center justify-between gap-2">
                    {isInCombat ? (
                      <button
                        onClick={() => {
                          if (captureCardsCount <= 0) {
                            showNotice('❌ Bạn đã hết Thẻ Bắt! Hãy mua thêm bằng Vàng bên cạnh.');
                            return;
                          }
                          sound.playCardSelect();
                          onClose();
                          onUseCaptureCard?.();
                        }}
                        className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs shadow-md animate-pulse flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>DÙNG BẮT QUÁI ĐỊCH NGAY!</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-purple-300/70 font-mono italic">
                        Chỉ kích hoạt trong trận đánh quái
                      </span>
                    )}

                    <button
                      onClick={() => {
                        if (gold < 40) {
                          showNotice('❌ Không đủ vàng! Cần 40 Vàng để mua thêm Thẻ Bắt.');
                          return;
                        }
                        onBuyItem?.('capture_card', 40);
                        sound.playCoin();
                        showNotice('🎉 Đã mua thành công +1 Thẻ Bắt Thu Phục!');
                      }}
                      className="py-1.5 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-purple-300" />
                      <span>Mua thêm (40 Vàng)</span>
                    </button>
                  </div>
                </div>

                {/* 2. DƯỢC THẢO RỪNG XANH (HEALING HERB) */}
                <div className={`p-3.5 rounded-2xl bg-gradient-to-r from-[#0d2818] to-[#06160d] border-2 transition-all shadow-md flex flex-col justify-between ${
                  armedAction === 'heal' ? 'border-emerald-400 ring-4 ring-emerald-400/60' : 'border-emerald-600/70'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-400 flex items-center justify-center text-2xl shrink-0 shadow">
                        🌿
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-fantasy font-black text-sm text-emerald-200">
                            Dược Thảo Rừng Xanh
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono font-black text-[11px]">
                            Có sẵn: {healingHerbsCount} gói
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-snug">
                          Chiết xuất từ hoa cỏ ngàn năm, hồi phục ngay lập tức <b className="text-emerald-300 font-bold">+35 Sinh lực</b> cho 1 linh thú bất kỳ.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-emerald-800/40 flex items-center justify-between gap-2">
                    <button
                      onClick={handleArmHeal}
                      className={`py-1.5 px-3 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 ${
                        armedAction === 'heal'
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{armedAction === 'heal' ? '👉 BẤM VÀO THẺ BÀI ĐỂ DÙNG' : 'SỬ DỤNG TRỊ LIỆU (+35 HP)'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (gold < 30) {
                          showNotice('❌ Không đủ vàng! Cần 30 Vàng để mua Dược Thảo.');
                          return;
                        }
                        onBuyItem?.('healing_herb', 30);
                        sound.playCoin();
                        showNotice('🎉 Đã mua Dược Thảo Rừng Xanh (+1 gói)!');
                      }}
                      className="py-1.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500 text-emerald-200 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Mua thêm (30 Vàng)</span>
                    </button>
                  </div>
                </div>

                {/* 3. BÌNH GIÁP HỘ MỆNH (SHIELD POTION) */}
                <div className={`p-3.5 rounded-2xl bg-gradient-to-r from-[#0d1f2d] to-[#07111a] border-2 transition-all shadow-md flex flex-col justify-between ${
                  armedAction === 'shield' ? 'border-cyan-400 ring-4 ring-cyan-400/60' : 'border-cyan-600/70'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-cyan-900/60 border border-cyan-400 flex items-center justify-center text-2xl shrink-0 shadow">
                        🛡️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-fantasy font-black text-sm text-cyan-200">
                            Bùa Hộ Mệnh Tinh Thạch
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 font-mono font-black text-[11px]">
                            Có sẵn: {shieldPotionsCount} bình
                          </span>
                        </div>
                        <p className="text-[11px] text-cyan-200/80 mt-0.5 leading-snug">
                          Tạo kết giới vững chắc, ban tặng <b className="text-cyan-300 font-bold">+25 Giáp ảo</b> hấp thụ sát thương cho linh thú trước khi bị trừ máu thật.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-cyan-800/40 flex items-center justify-between gap-2">
                    <button
                      onClick={handleArmShield}
                      className={`py-1.5 px-3 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 ${
                        armedAction === 'shield'
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 fill-current" />
                      <span>{armedAction === 'shield' ? '👉 BẤM VÀO THẺ BÀI ĐỂ DÙNG' : 'SỬ DỤNG BAN GIÁP (+25 GIÁP)'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (gold < 25) {
                          showNotice('❌ Không đủ vàng! Cần 25 Vàng để mua Bùa Hộ Mệnh.');
                          return;
                        }
                        onBuyItem?.('shield_potion', 25);
                        sound.playCoin();
                        showNotice('🎉 Đã mua Bùa Hộ Mệnh (+1 bình)!');
                      }}
                      className="py-1.5 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500 text-cyan-200 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Mua thêm (25 Vàng)</span>
                    </button>
                  </div>
                </div>

                {/* 4. CHÌA KHÓA CỔ (ANCIENT KEYS) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2a2208] to-[#141003] border-2 border-yellow-600/70 shadow-md flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-yellow-900/60 border border-yellow-400 flex items-center justify-center text-2xl shrink-0 shadow">
                        🔑
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-fantasy font-black text-sm text-yellow-200">
                            Chìa Khóa Cổ Đại
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-yellow-500/30 text-yellow-300 font-mono font-black text-[11px]">
                            Có sẵn: {keysCount} chiếc
                          </span>
                        </div>
                        <p className="text-[11px] text-yellow-200/80 mt-0.5 leading-snug">
                          Dùng để mở an toàn 100% các Rương Kho Báu ở Mật Thất (Tầng 4 &amp; 6), nhận lượng lớn Vàng và Cổ Vật.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-yellow-800/40 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-yellow-300/70 font-mono italic">
                      Dùng tại các ô Kho Báu Rương Cổ
                    </span>

                    <button
                      onClick={() => {
                        if (gold < 35) {
                          showNotice('❌ Không đủ vàng! Cần 35 Vàng để mua Chìa Khóa Cổ.');
                          return;
                        }
                        onBuyItem?.('key', 35);
                        sound.playCoin();
                        showNotice('🎉 Đã mua Chìa Khóa Cổ (+1 chiếc)!');
                      }}
                      className="py-1.5 px-3 rounded-xl bg-yellow-950 hover:bg-yellow-900 border border-yellow-500 text-yellow-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Mua thêm (35 Vàng)</span>
                    </button>
                  </div>
                </div>

                {/* 5. BỘ DỤNG CỤ PHÁ KHÓA (TOOLKIT) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0d2328] to-[#051114] border-2 border-teal-600/70 shadow-md flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-900/60 border border-teal-400 flex items-center justify-center text-2xl shrink-0 shadow">
                        🛠️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-fantasy font-black text-sm text-teal-200">
                            Bộ Dụng Cụ Phá Khóa
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-300 font-mono font-black text-[11px]">
                            Có sẵn: {lockpickToolkitsCount} bộ
                          </span>
                        </div>
                        <p className="text-[11px] text-teal-200/80 mt-0.5 leading-snug">
                          Tăng +20% tỷ lệ thành công khi Phá Khóa Rương Cổ Đại mà không cần dùng Chìa Khóa.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-teal-800/40 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-teal-300/70 font-mono italic">
                      Tự động kích hoạt khi Phá Khóa
                    </span>

                    <button
                      onClick={() => {
                        if (gold < 25) {
                          showNotice('❌ Không đủ vàng! Cần 25 Vàng để mua Bộ Phá Khóa.');
                          return;
                        }
                        onBuyItem?.('toolkit', 25);
                        sound.playCoin();
                        showNotice('🎉 Đã mua Bộ Dụng Cụ Phá Khóa (+1 bộ)!');
                      }}
                      className="py-1.5 px-3 rounded-xl bg-teal-950 hover:bg-teal-900 border border-teal-500 text-teal-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-teal-300" />
                      <span>Mua thêm (25 Vàng)</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: RELICS VAULT (KHO CỔ VẬT CHƯA TRANG BỊ) */}
            {activeTab === 'relics' && (
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {relicInventory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
                    <span className="text-4xl mb-2">💎</span>
                    <h4 className="text-sm font-fantasy font-black text-amber-300 mb-1">
                      Tất Cả Cổ Vật Đang Được Trang Bị!
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Bạn không còn cổ vật nào nằm trong kho dự trữ. Để đổi cổ vật, hãy bấm vào các ô cổ vật của linh thú bên trái để tháo ra.
                    </p>
                  </div>
                ) : (
                  relicInventory.map((relic, rIdx) => {
                    const isSelected = selectedRelicToEquip?.id === relic.id;
                    const rarityStyle = RARITY_COLORS[relic.rarity] || RARITY_COLORS.common;

                    return (
                      <div
                        key={relic.id || rIdx}
                        className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-amber-950/70 border-amber-400 ring-4 ring-amber-400/50 shadow-lg scale-[1.01]'
                            : 'bg-slate-900/80 border-slate-700 hover:border-amber-500/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow overflow-hidden ${rarityStyle}`}>
                            <RelicIcon icon={relic.icon} className="w-6 h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-fantasy font-black text-xs sm:text-sm text-amber-200 truncate">
                                {relic.name}
                              </h4>
                              <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-mono text-slate-300 uppercase shrink-0">
                                {relic.rarity}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug break-words">
                              {relic.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleArmEquipRelic(relic)}
                          className={`py-1.5 px-3 rounded-xl font-black text-xs shadow-md shrink-0 flex items-center gap-1 transition active:scale-95 ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                              : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                          }`}
                        >
                          <span>{isSelected ? '👉 BẤM VÀO THẺ ĐỂ GẮN' : 'TRANG BỊ ➔'}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>
        </div>

        {/* MODAL OVERLAY FOR INSPECTING / UNEQUIPPING AN EQUIPPED RELIC */}
        {inspectingRelic && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-slate-950 border-2 border-amber-500 rounded-3xl p-5 shadow-2xl flex flex-col text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-amber-900/60 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-400/80 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                    <RelicIcon icon={inspectingRelic.relic.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-fantasy font-black text-base text-amber-200">
                      {inspectingRelic.relic.name}
                    </h3>
                    <span className="text-xs text-amber-400/80 font-mono">
                      Cổ vật đang trang bị
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingRelic(null)}
                  className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans mb-4">
                {inspectingRelic.relic.description}
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setInspectingRelic(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Đóng
                </button>
                {inspectingRelic.slotIdx !== undefined && inspectingRelic.relicIdx !== undefined && (
                  <button
                    onClick={() => handleUnequip(inspectingRelic.slotIdx!, inspectingRelic.relicIdx!, inspectingRelic.relic.name, !!inspectingRelic.isReserve)}
                    className="px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Tháo Về Túi Đồ</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM FOOTER */}
        <div className="pt-3 mt-2 border-t border-emerald-900/60 flex items-center justify-between shrink-0 text-xs text-slate-400 font-mono">
          <span>Nhấn [ESC] hoặc nút X góc trên để trở lại chiến trường</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-md"
          >
            Đóng Túi Đồ
          </button>
        </div>

      </div>
    </div>
  );
};
