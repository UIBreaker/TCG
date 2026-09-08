import React from 'react';
import { Relic, MonsterCard } from '../types/game';
import { ALL_RELICS } from '../data/relics';
import { ShoppingBag, Coins, Scroll, Heart, Sparkles, X, Key, Hammer } from 'lucide-react';
import { sound } from '../utils/audio';

interface ShopModalProps {
  gold: number;
  playerParty: (MonsterCard | null)[];
  onBuyRelic: (relic: Relic) => void;
  onBuyCaptureCard: (cost: number) => void;
  onBuyHealingSeed: (cost: number) => void;
  onBuyKey?: (cost: number) => void;
  onBuyToolkit?: (cost: number) => void;
  onCloseShop: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  gold,
  playerParty,
  onBuyRelic,
  onBuyCaptureCard,
  onBuyHealingSeed,
  onBuyKey,
  onBuyToolkit,
  onCloseShop,
}) => {
  // Select 4 random relics available for sale
  const [shopRelics, setShopRelics] = React.useState<Relic[]>(() => {
    const shuffled = [...ALL_RELICS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  });

  const captureCardCost = 45;
  const healingSeedCost = 50;
  const keyCost = 35;
  const toolkitCost = 25;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-950 border-2 border-amber-600/70 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-800/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧌</span>
            <div>
              <h3 className="text-xl font-black text-amber-300 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" /> CỬA HÀNG YÊU TINH RỪNG SÂU
              </h3>
              <p className="text-xs text-amber-200/70">
                "Chào lữ khách! Cổ vật này sẽ biến quái thú của ngươi thành huyền thoại!"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950 border border-amber-500/60 rounded-xl text-amber-300 font-bold font-mono">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{gold} Vàng</span>
            </div>

            <button
              onClick={() => {
                sound.playCardSelect();
                onCloseShop();
              }}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-6">
          {/* SPECIAL SUPPLIES */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
              <span>🌿</span> VẬT PHẨM TIÊU HAO ĐẶC BIỆT
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Buy Capture Card */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-600/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-purple-900/60 text-purple-300">
                    <Scroll className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-purple-200">Lá Bài Chiêu Mộ</h5>
                    <p className="text-[11px] text-purple-300/80">
                      Cho phép bắt quái đối thủ khi máu dưới 15% (hoặc tăng theo % máu mất)
                    </p>
                  </div>
                </div>

                <button
                  disabled={gold < captureCardCost}
                  onClick={() => {
                    if (gold >= captureCardCost) {
                      sound.playCoin();
                      onBuyCaptureCard(captureCardCost);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black shrink-0 transition ${
                    gold >= captureCardCost
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {captureCardCost} Vàng
                </button>
              </div>

              {/* Buy Healing Seed */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-600/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-900/60 text-emerald-300">
                    <Heart className="w-6 h-6 fill-emerald-400 text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-emerald-200">Hạt Hồi Máu Toàn Đội</h5>
                    <p className="text-[11px] text-emerald-300/80">
                      Hồi phục ngay lập tức 40% Máu tối đa cho tất cả 4 lá bài trong đội
                    </p>
                  </div>
                </div>

                <button
                  disabled={gold < healingSeedCost}
                  onClick={() => {
                    if (gold >= healingSeedCost) {
                      sound.playHeal();
                      onBuyHealingSeed(healingSeedCost);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black shrink-0 transition ${
                    gold >= healingSeedCost
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {healingSeedCost} Vàng
                </button>
              </div>

              {/* Buy Ancient Key */}
              <div className="p-3.5 rounded-2xl bg-yellow-950/40 border border-yellow-600/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-yellow-900/60 text-yellow-300">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-yellow-200">Chìa Khóa Cổ</h5>
                    <p className="text-[11px] text-yellow-300/80">
                      Mở an toàn 100% Rương Kho Báu cổ đại ở Tầng 4 &amp; 6
                    </p>
                  </div>
                </div>

                <button
                  disabled={gold < keyCost}
                  onClick={() => {
                    if (gold >= keyCost && onBuyKey) {
                      sound.playCoin();
                      onBuyKey(keyCost);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black shrink-0 transition ${
                    gold >= keyCost
                      ? 'bg-yellow-600 hover:bg-yellow-500 text-slate-950 shadow-lg active:scale-95 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {keyCost} Vàng
                </button>
              </div>

              {/* Buy Lockpick Toolkit */}
              <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-600/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-teal-900/60 text-teal-300">
                    <Hammer className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-teal-200">Bộ Dụng Cụ Phá Khóa</h5>
                    <p className="text-[11px] text-teal-300/80">
                      Tăng +20% tỷ lệ Phá Khóa thành công khi mở Rương Kho Báu
                    </p>
                  </div>
                </div>

                <button
                  disabled={gold < toolkitCost}
                  onClick={() => {
                    if (gold >= toolkitCost && onBuyToolkit) {
                      sound.playCoin();
                      onBuyToolkit(toolkitCost);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black shrink-0 transition ${
                    gold >= toolkitCost
                      ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg active:scale-95 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {toolkitCost} Vàng
                </button>
              </div>
            </div>
          </div>

          {/* RELICS FOR SALE */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <span>✨</span> CỔ VẬT TRANG BỊ CHO LÁ BÀI (MỖI LÁ TỐI ĐA 10 RELIC)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shopRelics.map(relic => {
                const canAfford = gold >= relic.price;

                return (
                  <div
                    key={relic.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/60 transition flex flex-col justify-between gap-2 shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-600/40 text-amber-300">
                            <Sparkles className="w-4 h-4" />
                          </span>
                          <span className="font-bold text-sm text-slate-100">{relic.name}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {relic.rarity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{relic.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-1">
                      <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{relic.price} Vàng</span>
                      </div>

                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          if (canAfford) {
                            sound.playCoin();
                            onBuyRelic(relic);
                            setShopRelics(prev => prev.filter(r => r.id !== relic.id));
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Mua Cổ Vật
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playCardSelect();
              onCloseShop();
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition shadow"
          >
            Rời Cửa Hàng & Tiếp Tục Di Chuyển
          </button>
        </div>
      </div>
    </div>
  );
};
