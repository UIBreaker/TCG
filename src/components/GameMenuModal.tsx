import React, { useState } from 'react';
import { MONSTER_TEMPLATES } from '../data/monsters';
import { ALL_RELICS } from '../data/relics';
import { ElementType } from '../types/game';
import { BookOpen, Sparkles, X, Swords, Shield, Zap, Flame, Crown, Compass, Play, RefreshCcw } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewGame: () => void;
  hasActiveRun?: boolean;
}

const ELEMENT_TABS: { key: ElementType | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'Tất Cả (25 Quái)', icon: '🌟' },
  { key: 'fire', label: 'Hệ Hỏa (5)', icon: '🔥' },
  { key: 'water', label: 'Hệ Thủy (5)', icon: '💧' },
  { key: 'nature', label: 'Hệ Mộc (5)', icon: '🌿' },
  { key: 'thunder', label: 'Hệ Lôi (5)', icon: '⚡' },
  { key: 'earth', label: 'Hệ Thổ (5)', icon: '🌍' },
];

const RARITY_COLORS: Record<string, { label: string; text: string; bg: string; border: string }> = {
  common: { label: 'Phổ Thông', text: 'text-slate-300', bg: 'bg-slate-900', border: 'border-slate-700' },
  rare: { label: 'Hiếm', text: 'text-cyan-300', bg: 'bg-cyan-950', border: 'border-cyan-700' },
  epic: { label: 'Sử Thi', text: 'text-purple-300', bg: 'bg-purple-950', border: 'border-purple-700' },
  legendary: { label: 'Truyền Thuyết', text: 'text-amber-300', bg: 'bg-amber-950', border: 'border-amber-600' },
};

export const GameMenuModal: React.FC<GameMenuModalProps> = ({
  isOpen,
  onClose,
  onStartNewGame,
  hasActiveRun = true,
}) => {
  const [activeTab, setActiveTab] = useState<'codex' | 'relics' | 'star'>('codex');
  const [elementFilter, setElementFilter] = useState<ElementType | 'all'>('all');
  const [selectedMonsterId, setSelectedMonsterId] = useState<string>(MONSTER_TEMPLATES[0].id);

  if (!isOpen) return null;

  const filteredMonsters = elementFilter === 'all'
    ? MONSTER_TEMPLATES
    : MONSTER_TEMPLATES.filter(m => m.element === elementFilter);

  const currentMonster = MONSTER_TEMPLATES.find(m => m.id === selectedMonsterId) || filteredMonsters[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[90vh] bg-slate-950 border-2 border-emerald-700/80 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-emerald-900/60 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌲</span>
            <div>
              <h2 className="font-fantasy font-black text-lg text-emerald-300 tracking-wider">
                MENU TRÒ CHƠI & BÁCH KHOA TOÀN THƯ
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Tra cứu hệ thống 25 Quái Thú, 15 Cổ Vật Chiến Thuật & Sơ Đồ Ngũ Khắc Ngôi Sao
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playCardSelect();
                onStartNewGame();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Chơi Mới (Draft Quái)</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-black/40 border-b border-slate-800/80 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('codex');
            }}
            className={`px-4 py-1.5 rounded-xl font-fantasy font-bold text-xs flex items-center gap-1.5 transition ${
              activeTab === 'codex'
                ? 'bg-emerald-700 text-white shadow'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Thư Viện Quái Vật (25 Lá Bài)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('relics');
            }}
            className={`px-4 py-1.5 rounded-xl font-fantasy font-bold text-xs flex items-center gap-1.5 transition ${
              activeTab === 'relics'
                ? 'bg-amber-700 text-white shadow'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thư Viện Cổ Vật (15 Relic & Synergy)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('star');
            }}
            className={`px-4 py-1.5 rounded-xl font-fantasy font-bold text-xs flex items-center gap-1.5 transition ${
              activeTab === 'star'
                ? 'bg-teal-700 text-white shadow'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Sơ Đồ Ngũ Khắc Ngôi Sao 5 Cánh</span>
          </button>

          {hasActiveRun && (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="ml-auto px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Tiếp Tục Trận Đấu</span>
            </button>
          )}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-hidden p-4 min-h-0">
          {/* TAB 1: MONSTER CODEX */}
          {activeTab === 'codex' && (
            <div className="h-full flex flex-col gap-3">
              {/* Element filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
                {ELEMENT_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      sound.playClick();
                      setElementFilter(tab.key);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1 shrink-0 ${
                      elementFilter === tab.key
                        ? 'bg-amber-500 text-slate-950 shadow font-black'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Master-detail layout */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 overflow-hidden">
                {/* Left: Monster List Grid */}
                <div className="md:col-span-2 overflow-y-auto pr-1 space-y-2 max-h-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredMonsters.map(monster => {
                      const isSelected = monster.id === currentMonster?.id;
                      return (
                        <div
                          key={monster.id}
                          onClick={() => {
                            sound.playCardSelect();
                            setSelectedMonsterId(monster.id);
                          }}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/50 shadow'
                              : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800'
                          }`}
                        >
                          <div className="w-11 h-11 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                            {monster.avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-fantasy font-black text-xs text-amber-200 truncate">
                                {monster.name}
                              </h4>
                              <span className="text-[9px] font-mono uppercase font-bold text-slate-400">
                                {monster.element}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                              <span className="text-red-400">HP: {monster.hp}</span>
                              <span className="text-orange-400">ATK: {monster.attackPower}</span>
                              <span className="text-blue-400">DEF: {monster.defense}</span>
                              <span className="text-emerald-400">SPD: {monster.speed}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Selected Monster Full Codex Preview */}
                {currentMonster && (
                  <div className="overflow-y-auto p-4 rounded-2xl bg-slate-900/90 border border-emerald-800/60 flex flex-col justify-between max-h-full space-y-3">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h3 className="font-fantasy font-black text-base text-amber-300">
                            {currentMonster.name}
                          </h3>
                          <span className="text-xs text-emerald-400 font-mono italic">
                            {currentMonster.title}
                          </span>
                        </div>
                        <div className="text-4xl p-2 rounded-xl bg-black/40 border border-white/10">
                          {currentMonster.avatar}
                        </div>
                      </div>

                      {/* Stat pills */}
                      <div className="grid grid-cols-4 gap-1 py-2 my-2 rounded-lg bg-black/40 text-center font-mono text-xs">
                        <div>
                          <span className="text-[9px] text-slate-500 block">MÁU</span>
                          <span className="font-bold text-red-400">{currentMonster.hp}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block">CÔNG</span>
                          <span className="font-bold text-orange-400">{currentMonster.attackPower}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block">THỦ</span>
                          <span className="font-bold text-blue-400">{currentMonster.defense}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block">TỐC</span>
                          <span className="font-bold text-emerald-400">{currentMonster.speed}</span>
                        </div>
                      </div>

                      {/* Passive */}
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 mb-2.5">
                        <span className="font-bold text-xs text-amber-300 flex items-center gap-1 mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Nội Tại: {currentMonster.passive.name}
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          {currentMonster.passive.description}
                        </p>
                      </div>

                      {/* 3 Skills */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-300 block">Bộ 3 Kĩ Năng:</span>
                        {currentMonster.skills.map((s, idx) => {
                          const isUlt = s.isUltimate || idx === 2;
                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded-lg border ${
                                isUlt
                                  ? 'bg-amber-950/70 border-amber-500 text-amber-100 shadow'
                                  : 'bg-black/40 border-slate-800 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-xs">
                                <span className="flex items-center gap-1">
                                  {isUlt && <Crown className="w-3 h-3 text-amber-400" />}
                                  {s.name}
                                </span>
                                <span className="font-mono text-[10px] text-amber-300">
                                  {isUlt ? '👑 1 Lần/Trận' : idx === 0 ? '⚡0 Cơ bản' : '⏳1T Hồi chiêu'}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-slate-400 leading-tight mt-1 font-sans">
                                {s.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RELICS COMPENDIUM */}
          {activeTab === 'relics' && (
            <div className="h-full overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ALL_RELICS.map(relic => {
                  const rarity = RARITY_COLORS[relic.rarity] || RARITY_COLORS.common;
                  return (
                    <div
                      key={relic.id}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-600/70 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${rarity.border} ${rarity.bg} ${rarity.text}`}>
                            {rarity.label}
                          </span>
                          <span className="text-xs font-mono font-black text-amber-400">
                            💰 {relic.price}V
                          </span>
                        </div>

                        <h4 className="font-fantasy font-black text-sm text-amber-200 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          {relic.name}
                        </h4>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {relic.description}
                        </p>
                      </div>

                      {/* Synergy Highlight */}
                      {relic.synergiesWith && relic.synergiesWith.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-mono">
                          <span className="font-bold">✨ Combo Cộng Hưởng: </span>
                          <span className="text-slate-300">
                            {relic.synergiesWith
                              .map(id => ALL_RELICS.find(r => r.id === id)?.name.split(' ')[0])
                              .filter(Boolean)
                              .join(' + ')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 5-STAR ELEMENTAL MATRIX */}
          {activeTab === 'star' && (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 border border-teal-600 text-teal-300 text-xs font-mono font-bold">
                ⭐ HỆ THỐNG NGŨ HÀNH TƯƠNG KHẮC HÌNH NGÔI SAO
              </div>

              <h3 className="font-fantasy font-black text-2xl text-amber-300">
                VÒNG TRÒN KHẮC CHẾ NGŨ NGUYÊN TỐ
              </h3>

              {/* Graphical Cycle Display */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-3 px-4 rounded-2xl bg-black/60 border border-slate-800">
                <span className="px-3 py-1.5 rounded-xl bg-amber-950 border border-amber-500 text-amber-300 font-bold text-sm">
                  🔥 Hỏa
                </span>
                <span className="text-emerald-400 font-black">➔</span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-sm">
                  🌿 Mộc
                </span>
                <span className="text-emerald-400 font-black">➔</span>
                <span className="px-3 py-1.5 rounded-xl bg-[#291b0f] border border-amber-700 text-amber-500 font-bold text-sm">
                  🌍 Thổ
                </span>
                <span className="text-emerald-400 font-black">➔</span>
                <span className="px-3 py-1.5 rounded-xl bg-yellow-950 border border-yellow-500 text-yellow-300 font-bold text-sm">
                  ⚡ Lôi
                </span>
                <span className="text-emerald-400 font-black">➔</span>
                <span className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold text-sm">
                  💧 Thủy
                </span>
                <span className="text-emerald-400 font-black">➔</span>
                <span className="px-3 py-1.5 rounded-xl bg-amber-950 border border-amber-500 text-amber-300 font-bold text-sm">
                  🔥 Hỏa
                </span>
              </div>

              {/* Combat Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left w-full">
                <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-600/50 space-y-1">
                  <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-emerald-400" />
                    ĐÒN ĐÁNH KHẮC CHẾ (+35% SÁT THƯƠNG)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Khi tấn công kẻ địch thuộc hệ bị mình khắc, đòn đánh nhận thêm +35% sát thương. Nếu trang bị Cổ Vật <strong>Lăng Kính Ngũ Hành</strong>, sát thương tăng vọt thành <strong>+55%</strong>!
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-600/50 space-y-1">
                  <h4 className="font-bold text-sm text-rose-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-rose-400" />
                    ĐÒN ĐÁNH BỊ KHẮC (-25% SÁT THƯƠNG)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Khi tấn công kẻ địch thuộc hệ khắc chế mình, đòn đánh bị hấp thụ và giảm đi -25% sát thương. Hãy đổi vị trí các lá bài để tối ưu hóa tương khắc làn đấu!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
