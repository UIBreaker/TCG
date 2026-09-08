import React, { useEffect, useState } from 'react';
import { ImpactPhase, ImpactVFXSpec } from '../combat/impactVFX';
import { ShieldAlert, Shield } from 'lucide-react';

interface ImpactVFXOverlayProps {
  spec: ImpactVFXSpec | null;
  onComplete?: () => void;
}

interface ActivePhaseDisplay extends ImpactPhase {
  id: string;
}

export const ImpactVFXOverlay: React.FC<ImpactVFXOverlayProps> = ({ spec, onComplete }) => {
  const [activePhases, setActivePhases] = useState<ActivePhaseDisplay[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (!spec || spec.phases.length === 0) {
      setActivePhases([]);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Screen Shake
    if (spec.hasScreenShake) {
      setIsShaking(true);
      timers.push(
        setTimeout(() => setIsShaking(false), spec.screenShakeDurationMs || 150)
      );
    }

    // Schedule each phase
    spec.phases.forEach((phase, idx) => {
      const timer = setTimeout(() => {
        const phaseItem: ActivePhaseDisplay = {
          ...phase,
          id: `phase_${idx}_${Date.now()}`,
        };
        setActivePhases((prev) => [...prev, phaseItem]);

        // Auto remove phase after animation duration (800ms)
        setTimeout(() => {
          setActivePhases((prev) => prev.filter((p) => p.id !== phaseItem.id));
        }, 800);
      }, phase.delayMs);

      timers.push(timer);
    });

    // Cleanup and completion
    const maxDelay = Math.max(...spec.phases.map((p) => p.delayMs));
    const totalDuration = maxDelay + 900;
    timers.push(setTimeout(() => onComplete?.(), totalDuration));

    return () => timers.forEach(clearTimeout);
  }, [spec, onComplete]);

  if (activePhases.length === 0 && !isShaking) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible ${
        isShaking ? 'animate-screen-shake' : ''
      }`}
    >
      {/* Shield Shatter Visual */}
      {spec?.hasShieldShatter && (
        <div className="absolute inset-0 flex items-center justify-center animate-ping opacity-60">
          <ShieldAlert className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_20px_#22d3ee]" />
        </div>
      )}

      {/* Floating Damage Numbers */}
      {activePhases.map((phase) => {
        const isBlocked = phase.type === 'blocked';
        const isCritical = phase.type === 'critical';

        return (
          <div
            key={phase.id}
            style={{
              transform: `translateY(-${phase.popHeight}px) scale(${phase.fontScale})`,
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            className={`absolute flex items-center gap-1 font-fantasy font-black drop-shadow-md select-none ${
              isBlocked
                ? 'text-cyan-300 text-sm bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-400/60'
                : isCritical
                ? 'text-red-400 text-2xl font-black drop-shadow-[0_0_15px_rgba(239,68,68,0.9)] scale-125'
                : 'text-red-300 text-lg font-bold'
            }`}
          >
            {isBlocked && <Shield className="w-3.5 h-3.5 text-cyan-300 inline shrink-0" />}
            <span>{phase.displayText}</span>
          </div>
        );
      })}
    </div>
  );
};
