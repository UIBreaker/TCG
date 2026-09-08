import React from 'react';

// 1. Vintage Brass Nautical Spyglass
export const SpyglassSvg: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="35%" stopColor="#eab308" />
        <stop offset="70%" stopColor="#a16207" />
        <stop offset="100%" stopColor="#713f12" />
      </linearGradient>
      <linearGradient id="leatherGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#5c3a21" />
        <stop offset="50%" stopColor="#784c28" />
        <stop offset="100%" stopColor="#3d2412" />
      </linearGradient>
      <radialGradient id="lensGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
        <stop offset="70%" stopColor="#0891b2" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#164e63" />
      </radialGradient>
      <filter id="dropGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.6" />
      </filter>
    </defs>
    <g filter="url(#dropGlow)">
      {/* Tripod / Stand Base */}
      <path d="M24 54L30 40L36 54" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="30" cy="40" r="2.5" fill="#ca8a04" />
      
      {/* Main Barrel (Leather-wrapped) */}
      <rect x="18" y="24" width="24" height="12" rx="2" transform="rotate(-28 30 30)" fill="url(#leatherGrad)" stroke="#451a03" strokeWidth="1" />
      {/* Gold Ring Bands */}
      <rect x="23" y="22" width="2" height="16" transform="rotate(-28 24 30)" fill="url(#brassGrad)" />
      <rect x="35" y="16" width="2.5" height="16" transform="rotate(-28 36 24)" fill="url(#brassGrad)" />
      
      {/* Front Bell / Objective Tube */}
      <polygon points="40,16 52,10 55,16 43,22" fill="url(#brassGrad)" stroke="#713f12" strokeWidth="1" />
      {/* Front Lens */}
      <ellipse cx="53.5" cy="13" rx="2.5" ry="4" transform="rotate(-28 53.5 13)" fill="url(#lensGrad)" stroke="#fef08a" strokeWidth="0.8" />
      
      {/* Eyepiece Tube */}
      <rect x="11" y="32" width="9" height="6" transform="rotate(-28 15 35)" fill="url(#brassGrad)" stroke="#713f12" strokeWidth="0.8" />
      <ellipse cx="8.5" cy="38.5" rx="1.5" ry="3" transform="rotate(-28 8.5 38.5)" fill="#451a03" />
    </g>
  </svg>
);

// 2. Ancient Celtic / Forest Rune Stone
export const RuneStoneSvg: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="stoneGrad" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="40%" stopColor="#334155" />
        <stop offset="85%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="56" rx="22" ry="5" fill="#000" opacity="0.6" />
    {/* Stone Megalith */}
    <path
      d="M18 54L15 28L24 10L40 8L49 24L46 54Z"
      fill="url(#stoneGrad)"
      stroke="#1e293b"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Stone Texture Chisel Facets */}
    <path d="M24 10L28 32L18 54" stroke="#64748b" strokeWidth="0.8" opacity="0.5" />
    <path d="M40 8L36 30L46 54" stroke="#0f172a" strokeWidth="1.2" opacity="0.8" />
    <path d="M28 32L36 30" stroke="#64748b" strokeWidth="0.8" opacity="0.4" />
    {/* Moss Growth on bottom */}
    <path d="M16 50C19 47 22 53 25 50C28 48 31 54 35 51L46 54L17 54Z" fill="#14532d" opacity="0.7" />
    {/* Glowing Carved Runes */}
    <g filter="url(#emeraldGlow)">
      <path
        d="M32 18L32 44M26 24L38 34M38 24L26 34"
        stroke="#4ade80"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="18" r="1.5" fill="#86efac" />
      <circle cx="32" cy="44" r="1.5" fill="#86efac" />
    </g>
  </svg>
);

// 3. Adventurer's Weathered Leather Rucksack
export const BackpackSvg: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="leatherBag" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#854d0e" />
        <stop offset="40%" stopColor="#713f12" />
        <stop offset="80%" stopColor="#54300d" />
        <stop offset="100%" stopColor="#3b1d06" />
      </linearGradient>
      <linearGradient id="bedroll" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="58" rx="20" ry="4" fill="#000" opacity="0.5" />
    {/* Bedroll on top */}
    <rect x="14" y="8" width="36" height="10" rx="5" fill="url(#bedroll)" stroke="#0f172a" strokeWidth="1.2" />
    {/* Bedroll straps */}
    <rect x="22" y="7" width="2.5" height="12" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
    <rect x="39" y="7" width="2.5" height="12" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
    {/* Main Pack Body */}
    <path d="M16 18C16 18 13 40 14 52C14 55 17 56 32 56C47 56 50 55 50 52C51 40 48 18 48 18Z" fill="url(#leatherBag)" stroke="#271304" strokeWidth="1.5" />
    {/* Flap Cover */}
    <path d="M16 18C16 18 20 34 32 34C44 34 48 18 48 18Z" fill="#a16207" stroke="#451a03" strokeWidth="1.2" />
    {/* Center Leather Straps with Brass Buckles */}
    <rect x="24" y="18" width="2" height="28" fill="#451a03" />
    <rect x="38" y="18" width="2" height="28" fill="#451a03" />
    {/* Brass Buckles */}
    <rect x="23" y="32" width="4" height="5" rx="1" fill="#fef08a" stroke="#713f12" strokeWidth="0.8" />
    <rect x="37" y="32" width="4" height="5" rx="1" fill="#fef08a" stroke="#713f12" strokeWidth="0.8" />
    {/* Front Pocket */}
    <rect x="22" y="38" width="20" height="14" rx="2" fill="#713f12" stroke="#3b1d06" strokeWidth="1" />
    <rect x="30" y="38" width="4" height="6" rx="1" fill="#ca8a04" />
  </svg>
);

// 4. Ancient Leather Grimoire
export const GrimoireSvg: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="bookCover" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c2d12" />
        <stop offset="50%" stopColor="#5a1e0b" />
        <stop offset="100%" stopColor="#3c1407" />
      </linearGradient>
      <linearGradient id="goldFiligree" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#a16207" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="34" cy="56" rx="20" ry="5" fill="#000" opacity="0.6" />
    {/* Pages Block Bottom */}
    <polygon points="18,14 48,10 52,48 22,52" fill="#fef3c7" stroke="#d97706" strokeWidth="0.8" />
    {/* Spine & Back Cover */}
    <polygon points="12,16 16,14 20,52 16,54" fill="#3b1d06" />
    {/* Front Leather Cover */}
    <polygon points="16,12 48,8 52,46 20,50" fill="url(#bookCover)" stroke="#271304" strokeWidth="1.5" />
    {/* Corner Brass Protectors */}
    <polygon points="16,12 24,11 20,17 17,16" fill="url(#goldFiligree)" />
    <polygon points="48,8 42,9 44,15 48,12" fill="url(#goldFiligree)" />
    <polygon points="52,46 46,45 47,40 51,41" fill="url(#goldFiligree)" />
    <polygon points="20,50 26,49 24,44 19,46" fill="url(#goldFiligree)" />
    {/* Mystic Rune Emblem on Cover */}
    <circle cx="34" cy="28" r="7" stroke="url(#goldFiligree)" strokeWidth="1.2" fill="#431407" />
    <polygon points="34,22 39,32 29,32" stroke="url(#goldFiligree)" strokeWidth="1" fill="none" />
    {/* Glowing Bookmark Ribbon */}
    <path d="M34 8L34 56L38 52L42 56L42 8" fill="#ef4444" opacity="0.9" />
  </svg>
);

// 5. Wildwood Carved Battle Horn
export const BattleHornSvg: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="hornBone" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="40%" stopColor="#d5c29d" />
        <stop offset="80%" stopColor="#785c37" />
        <stop offset="100%" stopColor="#3d2a13" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="54" rx="20" ry="4" fill="#000" opacity="0.5" />
    {/* Curved Horn Body */}
    <path
      d="M12 40C16 46 32 50 46 44C52 41 54 32 50 24C48 18 42 16 38 18C34 20 34 26 38 30C42 34 46 36 44 40C40 44 26 42 16 34L12 40Z"
      fill="url(#hornBone)"
      stroke="#271304"
      strokeWidth="1.5"
    />
    {/* Metal Bell Mouth */}
    <ellipse cx="14" cy="37" rx="3.5" ry="6" fill="#eab308" stroke="#713f12" strokeWidth="1" />
    <ellipse cx="14" cy="37" rx="2" ry="4" fill="#1f180e" />
    {/* Metal Trim Rings */}
    <path d="M22 36C21 39 23 42 25 43" stroke="#ca8a04" strokeWidth="2.5" />
    <path d="M34 43C33 46 36 48 38 48" stroke="#ca8a04" strokeWidth="2.5" />
    {/* Hanging Braided Cord */}
    <path d="M18 40C22 52 38 52 44 42" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 1" fill="none" />
  </svg>
);

// 6. The Grand Carved Stone & Iron End Turn Wheel (Image 1 Style)
export const EndTurnWheel: React.FC<{
  isExecuting: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ isExecuting, onClick, size = 'md', className = '' }) => {
  const isSm = size === 'sm';
  return (
    <button
      type="button"
      disabled={isExecuting}
      onClick={onClick}
      className={`relative group cursor-pointer select-none transition-transform duration-200 active:scale-95 touch-manipulation ${
        isExecuting ? 'opacity-70 cursor-not-allowed' : ''
      } ${className}`}
      title="Kết thúc lượt và bắt đầu giao tranh"
    >
      {/* Heavy Cast Iron Rim with Rivets */}
      <div className={`${isSm ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-20 h-20 sm:w-24 sm:h-24'} rounded-full bg-gradient-to-br from-[#475569] via-[#1e293b] to-[#090d16] p-1 sm:p-2 shadow-[0_12px_28px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.8)] border-2 border-[#64748b]/50 relative flex items-center justify-center`}>
        
        {/* Brass Rivets around outer rim */}
        <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-b from-yellow-300 to-amber-700 shadow-xs" />
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-b from-yellow-300 to-amber-700 shadow-xs" />
        <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-b from-yellow-300 to-amber-700 shadow-xs" />
        <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-b from-yellow-300 to-amber-700 shadow-xs" />
        
        {/* Inner Rotating / Glowing Rune Ring */}
        <div className={`w-full h-full rounded-full bg-gradient-to-br from-[#2f3e35] via-[#1c2720] to-[#0f1812] border-2 border-emerald-600/50 p-0.5 sm:p-1 flex items-center justify-center relative overflow-hidden ${
          isExecuting ? 'animate-spin' : 'group-hover:border-amber-400 group-hover:shadow-[0_0_22px_rgba(251,191,36,0.6)]'
        }`}>
          {/* Chiseled Slate Center Disc */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#3a443e] to-[#1e2521] shadow-inner flex flex-col items-center justify-center border border-emerald-950">
            <span className={`font-fantasy font-black text-amber-100 ${isSm ? 'text-[10px] sm:text-xs' : 'text-[11px] sm:text-xs xl:text-sm'} tracking-widest leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]`}>
              {isExecuting ? 'GIAO' : 'End'}
            </span>
            <span className={`font-fantasy font-black text-amber-400 ${isSm ? 'text-[10px] sm:text-xs' : 'text-[11px] sm:text-xs xl:text-sm'} tracking-widest leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] mt-0.5`}>
              {isExecuting ? 'ĐẤU...' : 'Turn'}
            </span>
            
            {/* Subtle Rune Underline */}
            <div className={`${isSm ? 'w-5 sm:w-6' : 'w-6 sm:w-7'} h-0.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent mt-0.5`} />
          </div>
        </div>
      </div>
    </button>
  );
};

// 7. Curled Snail / Fossil Ammonite Shell (Matching Image 1 Left & Right)
export const SpiralShellSvg: React.FC<{ color?: 'pink' | 'teal'; className?: string }> = ({
  color = 'pink',
  className = "w-10 h-10"
}) => {
  const isPink = color === 'pink';
  const strokeColor = isPink ? "#9d174d" : "#0f766e";
  const mainColor = isPink ? "#f472b6" : "#2dd4bf";
  const innerColor = isPink ? "#fb7185" : "#14b8a6";
  const deepColor = isPink ? "#831843" : "#115e59";

  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`shellGrad_${color}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="40%" stopColor={mainColor} />
          <stop offset="80%" stopColor={innerColor} />
          <stop offset="100%" stopColor={deepColor} />
        </radialGradient>
      </defs>
      {/* Soft shadow */}
      <ellipse cx="32" cy="56" rx="20" ry="5" fill="#000" opacity="0.45" />
      {/* Outer spiral ridge */}
      <path
        d="M32 8C45 8 56 19 56 32C56 46 44 56 30 56C16 56 8 44 8 30C8 18 18 12 28 12C38 12 44 18 44 26C44 34 38 40 30 40C24 40 20 36 20 30C20 25 24 22 28 22C31 22 34 24 34 28"
        stroke={`url(#shellGrad_${color})`}
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      {/* Segmented grooves */}
      <path
        d="M32 8L34 16M45 12L41 20M54 24L46 28M54 38L45 36M46 48L40 42M32 54L32 46M20 50L24 44"
        stroke={strokeColor}
        strokeWidth="1.2"
        opacity="0.6"
      />
    </svg>
  );
};

// 8. Tabletop Wooden Stand with Card Deck (Matching Image 1 Corners)
export const DeckStackSvg: React.FC<{ className?: string }> = ({ className = "w-12 h-14" }) => (
  <svg viewBox="0 0 64 74" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="cardBack" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="woodStand" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="68" rx="22" ry="5" fill="#000" opacity="0.6" />
    {/* Wooden Tray Stand */}
    <rect x="8" y="58" width="48" height="10" rx="3" fill="url(#woodStand)" stroke="#271304" strokeWidth="1.2" />
    {/* Stacked Cards */}
    <rect x="15" y="18" width="34" height="42" rx="3" fill="#475569" stroke="#1e293b" strokeWidth="1" />
    <rect x="14" y="15" width="34" height="42" rx="3" fill="#64748b" stroke="#334155" strokeWidth="1" />
    <rect x="13" y="12" width="34" height="42" rx="3" fill="url(#cardBack)" stroke="#1e293b" strokeWidth="1.2" />
    {/* Card Back Insignia */}
    <rect x="16" y="15" width="28" height="36" rx="2" fill="#334155" />
    <circle cx="30" cy="33" r="7" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
    <path d="M30 26V40M23 33H37" stroke="#94a3b8" strokeWidth="1.2" />
  </svg>
);
