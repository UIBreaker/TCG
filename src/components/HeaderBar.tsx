import React from 'react';
import { Coins, Scroll, Volume2, VolumeX, Shield, RotateCcw, Compass } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderBarProps {
  gold: number;
  captureCards: number;
  keysCount?: number;
  floor: number;
  phase: string;
  onOpenDeck: () => void;
  onOpenMap: () => void;
  onOpenMenu: () => void;
  onOpenInventory: () => void;
  onReset: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  gold,
  captureCards,
  keysCount = 0,
  floor,
  phase,
  onOpenDeck,
  onOpenMap,
  onOpenMenu,
  onOpenInventory,
  onReset,
  audioEnabled,
  setAudioEnabled,
}) => {
  return (
    <header className="w-full h-11 bg-slate-950/90 border-b border-emerald-900/60 backdrop-blur-md px-3 flex items-center justify-between sticky top-0 z-40 text-slate-100 shadow-md">
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => {
            sound.playClick();
            onOpenMenu();
          }}
          className="flex items-center gap-1.5 font-black tracking-wider text-emerald-400 text-base hover:opacity-80 transition cursor-pointer"
          title="Mở Menu Trò Chơi & Thư Viện"
        >
          <span className="text-xl">🌲</span>
          <span className="hidden sm:inline bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent text-sm font-black">
            WILDWOOD TCG
          </span>
        </button>
        <div className="px-2 py-0.5 rounded-full bg-slate-900 border border-emerald-700/50 text-[11px] font-bold text-emerald-300">
          Tầng {floor}/7
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 text-sm font-medium">
        {/* Gold display - Click to open Bag */}
        <button
          onClick={() => {
            sound.playCardSelect();
            onOpenInventory();
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/60 rounded-xl text-amber-300 shadow-inner transition active:scale-95 cursor-pointer"
          title="Mở Túi Đồ để quản lý Vàng và mua vật phẩm"
        >
          <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-bold font-mono">{gold}</span>
          <span className="text-xs text-amber-400/80">Vàng</span>
        </button>

        {/* Capture Cards Count - Click to open Bag */}
        <button 
          onClick={() => {
            sound.playCardSelect();
            onOpenInventory();
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/60 rounded-xl text-purple-300 shadow-inner transition active:scale-95 cursor-pointer"
          title="Mở Túi Đồ để dùng hoặc mua Thẻ Bắt"
        >
          <Scroll className="w-4 h-4 text-purple-400" />
          <span className="font-bold font-mono">{captureCards}</span>
          <span className="text-xs text-purple-400/80 hidden md:inline">Thẻ Bắt</span>
        </button>

        {/* Ancient Keys Count */}
        {keysCount !== undefined && (
          <button
            onClick={() => {
              sound.playCardSelect();
              onOpenInventory();
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-yellow-950/70 hover:bg-yellow-900/80 border border-yellow-500/60 rounded-xl text-yellow-300 shadow-inner transition active:scale-95 cursor-pointer"
            title="Số lượng Chìa Khóa Cổ dùng để mở Rương Kho Báu"
          >
            <span className="text-sm">🔑</span>
            <span className="font-bold font-mono">{keysCount}</span>
            <span className="text-xs text-yellow-400/80 hidden lg:inline">Chìa Khóa</span>
          </button>
        )}

        {/* Dedicated Bag Button */}
        <button
          onClick={() => {
            sound.playCardSelect();
            onOpenInventory();
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/80 rounded-xl text-emerald-200 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
          title="Mở Túi Đồ (Vàng, Thẻ Bắt & Dược Liệu)"
        >
          <span className="text-sm">🎒</span>
          <span className="hidden sm:inline">Túi Đồ</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            sound.playCardSelect();
            onOpenMenu();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-xs font-semibold text-amber-200 transition active:scale-95 shadow"
          title="Xem Thư Viện Quái Vật, Relic & Sơ Đồ Ngũ Khắc"
        >
          <span className="text-xs">📖</span>
          <span className="hidden sm:inline">Menu / Thư Viện</span>
        </button>

        {phase !== 'map' && (
          <button
            onClick={() => {
              sound.playCardSelect();
              onOpenMap();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-600/50 text-xs font-semibold text-emerald-200 transition active:scale-95 shadow"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Bản Đồ</span>
          </button>
        )}

        <button
          onClick={() => {
            sound.playCardSelect();
            onOpenDeck();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-xs font-semibold text-indigo-200 transition active:scale-95 shadow"
        >
          <Shield className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Đội & Relic</span>
        </button>

        <button
          onClick={() => {
            const next = !audioEnabled;
            setAudioEnabled(next);
            sound.enabled = next;
            if (next) sound.playCoin();
          }}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
          title={audioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          onClick={onReset}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/50 border border-slate-700 hover:border-red-700 text-slate-400 hover:text-red-400 transition"
          title="Chơi lại từ đầu"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
