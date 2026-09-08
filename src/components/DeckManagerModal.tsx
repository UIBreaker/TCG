import React, { useState } from 'react';
import { MonsterCard, Relic } from '../types/game';
import { MonsterCardView } from './MonsterCardView';
import { Shield, Sparkles, X, ArrowLeftRight, Flame } from 'lucide-react';
import { sound } from '../utils/audio';

interface DeckManagerModalProps {
  playerParty: (MonsterCard | null)[];
  reserveRoster: MonsterCard[];
  relicInventory: Relic[];
  onEquipRelic: (slotIndex: number, relic: Relic) => void;
  onUnequipRelic: (slotIndex: number, relicIndex: number) => void;
  onSwapMonster: (activeSlotIndex: number, reserveIndex: number) => void;
  onClose: () => void;
}

export const DeckManagerModal: React.FC<DeckManagerModalProps> = ({
  playerParty,
  reserveRoster,
  relicInventory,
  onEquipRelic,
  onUnequipRelic,
  onSwapMonster,
  onClose,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const currentMonster = playerParty[selectedSlot];

  // Detect synergies on current selected monster
  const hasCleave = currentMonster?.equippedRelics.some(r => r.type === 'cleave');
  const hasBurn = currentMonster?.equippedRelics.some(r => r.type === 'burn');
  const hasPoison = currentMonster?.equippedRelics.some(r => r.type === 'poison');
  const hasFrostbite = currentMonster?.equippedRelics.some(r => r.type === 'frostbite');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 text-slate-100">
      <div className="w-full max-w-5xl bg-slate-950 border-2 border-indigo-700/60 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-indigo-900/60">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-900/60 text-indigo-300">
              <Shield className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-xl font-black text-indigo-200 flex items-center gap-2">
                QUẢN LÝ ĐỘI HÌNH & TRANG BỊ CỔ VẬT (RELIC)
              </h3>
              <p className="text-xs text-indigo-300/70">
                Mỗi lá bài mang tối đa 10 Relic. Kết hợp các Relic để kích hoạt tương tác chéo mạnh mẽ!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playCardSelect();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-6">
          {/* Active 4-Slot Selector */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              4 LÁ BÀI ĐANG XUẤT TRẬN (Chọn để gắn Relic hoặc thay quái)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map(slotIdx => {
                const card = playerParty[slotIdx];
                const isSelected = selectedSlot === slotIdx;

                return (
                  <button
                    key={slotIdx}
                    onClick={() => {
                      sound.playCardSelect();
                      setSelectedSlot(slotIdx);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition relative flex flex-col justify-between h-28 ${
                      isSelected
                        ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg'
                        : card
                        ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700'
                        : 'bg-slate-950 border-dashed border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-indigo-400">
                        Slot {slotIdx + 1}
                      </span>
                      {card && (
                        <span className="text-[10px] font-mono text-emerald-400">
                          {card.hp}/{card.maxHp} HP
                        </span>
                      )}
                    </div>

                    {card ? (
                      <div>
                        <div className="font-black text-xs text-slate-100 truncate flex items-center gap-1">
                          <span>{card.avatar}</span>
                          <span className="truncate">{card.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                          <span>⚡ {card.speed} Tốc</span>
                          <span className="text-amber-400">✨ {card.equippedRelics.length}/10 Relic</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 italic">Trống</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Monster Relic Configuration */}
          {currentMonster ? (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-6 items-start">
              {/* Pokémon TCG Card Preview */}
              <div className="shrink-0 mx-auto md:mx-0">
                <MonsterCardView
                  card={currentMonster}
                  slotIndex={selectedSlot}
                  isPlayer={true}
                />
              </div>

              {/* Relic Management Controls */}
              <div className="flex-1 w-full flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentMonster.avatar}</span>
                    <div>
                      <h4 className="text-sm font-black text-slate-100 flex items-center gap-2">
                        {currentMonster.name} <span className="text-xs font-normal text-slate-400">({currentMonster.title})</span>
                      </h4>
                      <span className="text-xs text-slate-400">
                        Đang cầm: <span className="text-amber-300 font-bold font-mono">{currentMonster.equippedRelics.length}/10</span> Cổ vật
                      </span>
                    </div>
                  </div>

                  {/* ACTIVE SYNERGIES BANNER */}
                  {hasCleave && hasBurn && (
                    <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 text-white font-black text-xs flex items-center gap-1.5 shadow-lg animate-pulse">
                      <Flame className="w-4 h-4" />
                      <span>TƯƠNG TÁC ĐẶC BIỆT: [Đánh Lan + Thiêu Đốt] Đang Kích Hoạt!</span>
                    </div>
                  )}
                  {hasCleave && hasPoison && (
                    <div className="px-3 py-1 rounded-xl bg-purple-900 border border-purple-500 text-purple-200 font-bold text-xs flex items-center gap-1.5 shadow">
                      <span>☣️ TƯƠNG TÁC: [Đánh Lan + Độc] Lan nọc độc sang 2 bên!</span>
                    </div>
                  )}
                </div>

              {/* Equipped Relics List */}
              <div>
                <h5 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Cổ vật đã trang bị trên lá bài này (Nhấn Tháo để gỡ):
                </h5>

                {currentMonster.equippedRelics.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    Lá bài này chưa được trang bị cổ vật nào. Hãy chọn cổ vật từ Kho bên dưới để trang bị!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentMonster.equippedRelics.map((relic, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-2.5 rounded-xl bg-slate-950 border border-emerald-600/40 flex items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-xs text-emerald-300 flex items-center gap-1">
                            <span>✨</span> {relic.name}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{relic.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            sound.playCardSelect();
                            onUnequipRelic(selectedSlot, rIdx);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-300 text-[10px] font-bold shrink-0 transition"
                        >
                          Tháo ra
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unassigned Relics in Inventory */}
              <div>
                <h5 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Kho Cổ Vật Chưa Dùng ({relicInventory.length} cổ vật):
                </h5>

                {relicInventory.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    Kho đồ rỗng. Hãy đánh quái tinh anh, trùm cuối hoặc mua tại Cửa Hàng Rừng!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {relicInventory.map((relic, invIdx) => {
                      const canEquip = currentMonster.equippedRelics.length < 10;

                      return (
                        <div
                          key={invIdx}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-200">{relic.name}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{relic.description}</p>
                          </div>
                          <button
                            disabled={!canEquip}
                            onClick={() => {
                              if (canEquip) {
                                sound.playCoin();
                                onEquipRelic(selectedSlot, relic);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition ${
                              canEquip
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow active:scale-95'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            Trang Bị
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            </div>
          ) : null}

          {/* Reserve Roster (Captured Bench Monsters) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
              <span>🎴</span> HÀNG GHẾ DỰ BỊ / QUÁI VẬT ĐÃ CHIÊU MỘ ({reserveRoster.length} quái thú)
            </h4>

            {reserveRoster.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
                Chưa có quái thú dự bị nào. Sử dụng <span className="text-purple-300 font-bold">Thẻ Chiêu Mộ</span> trong trận đấu khi quái địch yếu máu để bắt!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {reserveRoster.map((resCard, rIdx) => (
                  <div
                    key={resCard.id}
                    className="p-3 rounded-2xl bg-purple-950/30 border border-purple-600/40 flex items-center justify-between gap-2 shadow"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{resCard.avatar}</span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-100">{resCard.name}</h5>
                        <p className="text-[10px] text-purple-300">
                          {resCard.hp}/{resCard.maxHp} HP • ⚡{resCard.speed} Tốc
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sound.playCardSelect();
                        onSwapMonster(selectedSlot, rIdx);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] shrink-0 transition flex items-center gap-1 active:scale-95 shadow"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      <span>Đổi Vào Slot {selectedSlot + 1}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playCardSelect();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow"
          >
            Hoàn Tất Quản Lý
          </button>
        </div>
      </div>
    </div>
  );
};
