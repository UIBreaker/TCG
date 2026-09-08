import React from 'react';
import { SkillEffectPreview } from '../ui/skillEffectPreview';
import { Sparkles, Swords, Shield, Zap } from 'lucide-react';

interface SkillDetailPopoverProps {
  preview: SkillEffectPreview;
  iconType: 'basic_attack' | 'utility' | 'ultimate';
  onClose?: () => void;
  className?: string;
}

export const SkillDetailPopover: React.FC<SkillDetailPopoverProps> = ({
  preview,
  iconType,
  className = '',
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'basic_attack':
        return <Swords className="w-3.5 h-3.5 text-amber-400" />;
      case 'utility':
        return <Shield className="w-3.5 h-3.5 text-cyan-400" />;
      case 'ultimate':
        return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  const hasRelicContributions = preview.relicContributions && preview.relicContributions.length > 0;

  return (
    <div
      className={`absolute z-50 w-64 p-3 rounded-2xl bg-slate-950/95 border border-amber-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.9)] backdrop-blur-md text-slate-100 text-xs pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150 ${className}`}
      onMouseEnter={(e) => e.stopPropagation()}
    >
      {/* 1. Header: Skill Name & Icon Type */}
      <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="p-1 rounded bg-white/5 shrink-0">{getIcon()}</span>
          <span className="font-fantasy font-black text-sm text-amber-200 truncate">
            {preview.skillName}
          </span>
        </div>
        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40 shrink-0">
          {iconType === 'basic_attack' ? 'Đòn Đánh' : iconType === 'utility' ? 'Hỗ Trợ' : 'Tuyệt Kỹ'}
        </span>
      </div>

      {/* 2. Full Description with calculated real values */}
      <p className="py-2 text-slate-300 leading-relaxed text-[11px]">
        {preview.description}
      </p>

      {/* 3. Relic Interaction Section (Only rendered when >= 1 relic affects this skill) */}
      {hasRelicContributions && (
        <div className="mt-1 pt-2 border-t border-amber-900/50 flex flex-col gap-1.5 bg-amber-950/30 -mx-1 px-2 py-1.5 rounded-xl">
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Cộng Hưởng Cổ Vật (Relic):</span>
          </div>

          <div className="flex flex-col gap-1 pl-1">
            {preview.relicContributions.map((relic, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10.5px]">
                <span className="text-slate-300">
                  {relic.relicName} <span className="text-amber-400 font-mono">x{relic.stackCount}</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  +{relic.contributionAmount}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] font-bold">
            <span className="text-amber-200">Tổng hiệu ứng thực tế:</span>
            <span className="font-mono text-emerald-300 text-xs font-black">
              {preview.finalValue}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
