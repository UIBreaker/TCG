import React, { useState } from 'react';
import { MapNode, NodeType } from '../types/game';
import { sound } from '../utils/audio';
import { Compass, Sparkles, Swords, Skull, Crown, ShoppingBag, Heart, HelpCircle, Anvil, Key, ShieldAlert, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { TIERS, TierCode } from '../models/tier';

interface ForestMapProps {
  nodes: MapNode[];
  currentNodeId: string | null;
  onSelectNode: (node: MapNode) => void;
  gold: number;
  mapLoop?: number;
}

// Fixed SVG layout coordinates for 7 floors (800 x 1120 coordinate space)
const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
  f7_boss: { x: 400, y: 110 },
  f6_n0:   { x: 310, y: 260 },
  f6_n1:   { x: 490, y: 260 },
  f5_n0:   { x: 290, y: 410 },
  f5_n1:   { x: 510, y: 410 },
  f4_n0:   { x: 290, y: 560 },
  f4_n1:   { x: 510, y: 560 },
  f3_n0:   { x: 310, y: 710 },
  f3_n1:   { x: 490, y: 710 },
  f2_n0:   { x: 220, y: 860 },
  f2_n1:   { x: 400, y: 860 },
  f2_n2:   { x: 580, y: 860 },
  f1_n0:   { x: 220, y: 1010 },
  f1_n1:   { x: 400, y: 1010 },
  f1_n2:   { x: 580, y: 1010 },
};

// Handcrafted Low-Poly Fir Tree (Faceted 3D Cone inspired by Inscryption)
const LowPolyPine: React.FC<{ x: number; y: number; scale?: number; rotation?: number }> = ({
  x,
  y,
  scale = 1,
  rotation = 0,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`} className="pointer-events-none select-none">
    <ellipse cx="2" cy="18" rx="14" ry="4.5" fill="#140b04" opacity="0.45" />
    <polygon points="-2.5,10 2.5,10 2,18 -2,18" fill="#321b0d" />
    <polygon points="0,-4 14,14 -14,14" fill="#1e3827" />
    <polygon points="0,-4 14,14 0,14" fill="#13271b" />
    <polygon points="0,-4 0,14 -14,14" fill="#2b5037" />
    <polygon points="0,-14 11,2 -11,2" fill="#264832" />
    <polygon points="0,-14 11,2 0,2" fill="#193322" />
    <polygon points="0,-14 0,2 -11,2" fill="#386345" />
    <polygon points="0,-24 8,-8 -8,-8" fill="#30583d" />
    <polygon points="0,-24 8,-8 0,-8" fill="#1f3d2a" />
    <polygon points="0,-24 0,-8 -8,-8" fill="#497c58" />
    <polygon points="0,-26 3,-20 -3,-20" fill="#629b74" opacity="0.85" />
  </g>
);

// Woodcut Stamp Icons for each node type
const WoodcutIcon: React.FC<{ type: NodeType; isAvailable: boolean; isCurrent: boolean; isCleared: boolean }> = ({
  type,
  isAvailable,
  isCurrent,
  isCleared,
}) => {
  const inkColor = isCleared ? '#5c1913' : isAvailable || isCurrent ? '#1c1209' : '#4d3725';

  if (type === 'boss') {
    return (
      <g>
        <path d="M-14,-6 L-16,-16 L-8,-11 L0,-19 L8,-11 L16,-16 L14,-6 Z" fill="#b91c1c" stroke="#450a0a" strokeWidth="1.5" />
        <ellipse cx="0" cy="4" rx="15" ry="12" fill={inkColor} />
        <path d="M-10,-2 C-18,-12 -24,-8 -22,-2 C-16,4 -10,2 -8,2" fill={inkColor} />
        <path d="M10,-2 C18,-12 24,-8 22,-2 C16,4 10,2 8,2" fill={inkColor} />
        <circle cx="-5" cy="2" r="3.5" fill="#fef08a" />
        <circle cx="5" cy="2" r="3.5" fill="#fef08a" />
        <circle cx="-5" cy="2" r="1.5" fill="#000" />
        <circle cx="5" cy="2" r="1.5" fill="#000" />
        <polygon points="-8,14 -5,22 -3,14" fill="#fef08a" />
        <polygon points="8,14 5,22 3,14" fill="#fef08a" />
      </g>
    );
  }

  if (type === 'elite') {
    return (
      <g>
        <path d="M-8,-2 C-16,-14 -22,-12 -20,-4 C-16,2 -10,0 -7,1" fill={inkColor} />
        <path d="M8,-2 C16,-14 22,-12 20,-4 C16,2 10,0 7,1" fill={inkColor} />
        <ellipse cx="0" cy="3" rx="12" ry="10" fill={inkColor} />
        <circle cx="-4" cy="2" r="2.8" fill="#ef4444" />
        <circle cx="4" cy="2" r="2.8" fill="#ef4444" />
        <polygon points="-6,11 -4,17 -2,11" fill="#fff" />
        <polygon points="6,11 4,17 2,11" fill="#fff" />
      </g>
    );
  }

  if (type === 'battle') {
    return (
      <g>
        <line x1="-16" y1="-14" x2="16" y2="14" stroke={inkColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="16" y1="-14" x2="-16" y2="14" stroke={inkColor} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="0" cy="-1" rx="11" ry="9" fill={inkColor} />
        <circle cx="-4" cy="-2" r="2.5" fill="#fef3c7" />
        <circle cx="4" cy="-2" r="2.5" fill="#fef3c7" />
        <path d="M-5,7 L0,12 L5,7 Z" fill={inkColor} />
      </g>
    );
  }

  if (type === 'shop') {
    return (
      <g>
        <rect x="-12" y="-5" width="24" height="18" rx="4" fill={inkColor} />
        <path d="M-6,-5 L-6,-10 C-6,-13 6,-13 6,-10 L6,-5" stroke={inkColor} strokeWidth="2.5" fill="none" />
        <g transform="translate(10, -2) scale(0.65)">
          <rect x="-4" y="-8" width="8" height="14" rx="2" fill="#eab308" stroke="#713f12" strokeWidth="2" />
          <circle cx="0" cy="-1" r="3" fill="#fef08a" />
          <line x1="0" y1="-14" x2="0" y2="-8" stroke="#713f12" strokeWidth="2" />
        </g>
      </g>
    );
  }

  if (type === 'rest') {
    return (
      <g>
        <ellipse cx="0" cy="8" rx="14" ry="5" fill="#3f3f46" stroke="#18181b" strokeWidth="2" />
        <polygon points="-6,10 6,10 0,-10" fill="#f97316" />
        <polygon points="-3,10 3,10 0,-4" fill="#fef08a" />
        <path d="M-2,-10 C-1,-16 2,-14 3,-8" stroke="#ea580c" strokeWidth="2" fill="none" />
      </g>
    );
  }

  if (type === 'sanctuary') {
    return (
      <g>
        {/* Ancient Anvil & Forge Stamp */}
        <polygon points="-12,6 12,6 8,12 -8,12" fill={inkColor} />
        <rect x="-14" y="0" width="28" height="6" rx="1" fill={inkColor} />
        <polygon points="-16,-4 16,-4 12,0 -12,0" fill={inkColor} />
        <circle cx="0" cy="-8" r="3" fill="#f59e0b" />
        <circle cx="-5" cy="-9" r="1.5" fill="#ef4444" />
        <circle cx="5" cy="-9" r="1.5" fill="#ef4444" />
      </g>
    );
  }

  if (type === 'vault') {
    return (
      <g>
        {/* Ancient Locked Treasure Chest Stamp */}
        <rect x="-12" y="-3" width="24" height="15" rx="3" fill={inkColor} />
        <path d="M-12,-3 C-12,-10 12,-10 12,-3 Z" fill={inkColor} />
        <circle cx="0" cy="4" r="3" fill="#fef08a" />
        <line x1="0" y1="4" x2="0" y2="8" stroke="#000" strokeWidth="1.5" />
      </g>
    );
  }

  // Event (Mystery Shrine)
  return (
    <g>
      <polygon points="-8,12 8,12 5,-14 -5,-14" fill={inkColor} />
      <ellipse cx="0" cy="-2" rx="4" ry="2.5" fill="#38bdf8" />
      <circle cx="0" cy="-2" r="1.5" fill="#0f172a" />
      <text x="0" y="-18" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="serif">?</text>
    </g>
  );
};

const DIFFICULTY_STYLES = {
  'Dễ': 'bg-emerald-950/90 border-emerald-500 text-emerald-300',
  'Trung Bình': 'bg-blue-950/90 border-blue-500 text-blue-300',
  'Khó': 'bg-amber-950/90 border-amber-500 text-amber-300',
  'Nguy Hiểm': 'bg-orange-950/90 border-orange-500 text-orange-300',
  'Tử Địa': 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse',
};

export const ForestMap: React.FC<ForestMapProps> = ({
  nodes,
  currentNodeId,
  onSelectNode,
  mapLoop = 1,
}) => {
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const [inspectedNode, setInspectedNode] = useState<MapNode | null>(null);

  const currentNode = nodes.find(n => n.id === currentNodeId);
  const currentCoords = currentNode ? NODE_COORDINATES[currentNode.id] : null;

  // Build trail connections between nodes
  const trails: {
    fromId: string;
    toId: string;
    from: { x: number; y: number };
    to: { x: number; y: number };
    isActive: boolean;
    isTraversed: boolean;
  }[] = [];

  nodes.forEach(node => {
    const fromCoord = NODE_COORDINATES[node.id];
    if (!fromCoord) return;

    node.connectedTo.forEach(targetId => {
      const toCoord = NODE_COORDINATES[targetId];
      if (!toCoord) return;

      const targetNode = nodes.find(n => n.id === targetId);
      const isActive = node.id === currentNodeId && !!targetNode?.available;
      const isTraversed = node.cleared && (targetNode?.cleared || targetId === currentNodeId);

      trails.push({
        fromId: node.id,
        toId: targetId,
        from: fromCoord,
        to: toCoord,
        isActive,
        isTraversed,
      });
    });
  });

  // Handle clicking on a node: open inspection panel
  const handleNodeClick = (node: MapNode) => {
    sound.playCardSelect();
    setInspectedNode(node);
  };

  // Confirm entering node
  const handleConfirmEnterNode = (node: MapNode) => {
    sound.playWoodThud();
    setInspectedNode(null);
    onSelectNode(node);
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-44px)] overflow-y-auto inscryption-map-bg text-slate-100 flex flex-col items-center justify-between py-2 px-2 sm:px-4 relative select-none">
      
      {/* 1. ATMOSPHERIC AMBIENT SPORES & CREEPING FOG */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -inset-10 bg-[radial-gradient(circle_at_50%_70%,rgba(245,158,11,0.12)_0%,transparent_60%)]" />
        {[
          { top: '15%', left: '20%', delay: '0s' },
          { top: '35%', left: '80%', delay: '1s' },
          { top: '65%', left: '15%', delay: '2s' },
          { top: '80%', left: '75%', delay: '1.5s' },
          { top: '50%', left: '50%', delay: '0.5s' },
        ].map((spore, idx) => (
          <div
            key={idx}
            style={{ top: spore.top, left: spore.left, animationDelay: spore.delay }}
            className="absolute w-2 h-2 rounded-full bg-amber-400/40 blur-xs animate-spore pointer-events-none"
          />
        ))}
      </div>

      {/* 2. HEADER BANNER */}
      <div className="text-center z-20 mb-2 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-950/80 border border-red-800/80 shadow-[0_0_20px_rgba(239,68,68,0.4)] mb-1">
          <Compass className="w-3 h-3 text-red-400 animate-spin" />
          <span className="font-mono font-black tracking-widest text-[10px] sm:text-xs text-red-200 uppercase">
            TẦNG {currentNode?.floor || 1} / 7 • VÒNG LẶP {mapLoop} • ĐẠI TAI ƯƠNG LỤC ĐỊA ĐEN
          </span>
        </div>
        <h1 className="font-fantasy font-black tracking-widest text-base sm:text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 drop-shadow-[0_2px_12px_rgba(245,158,11,0.6)] uppercase">
          LỤC ĐỊA ĐEN (HUNTER X HUNTER) {mapLoop > 1 ? `• VÒNG ${mapLoop}` : '• TAI ƯƠNG KHỞI NGUYÊN'}
        </h1>
        <p className="text-[10px] sm:text-[11px] text-amber-200/70 font-mono tracking-wider">
          (Khám phá biển Mobius, săn quái dị chủng & thu thập cổ vật vô tận cho đến khi tử trận)
        </p>
      </div>

      {/* 3. 3D TILTED PRIMORDIAL MAP BOARD (Inscryption Style) */}
      <div className="w-full max-w-[840px] relative z-10 my-auto flex flex-col items-center">
        
        {/* Floating Quick Tooltip on Hover */}
        {hoveredNode && !inspectedNode && (
          <div className="absolute -top-7 z-30 px-3 py-1 rounded-full bg-slate-950/95 border border-amber-500/80 text-amber-200 font-bold text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in">
            {hoveredNode.previewEnemy?.avatar && (
              <span className="text-sm">{hoveredNode.previewEnemy.avatar}</span>
            )}
            <span className="text-amber-100">{hoveredNode.name}</span>
            <span className="text-slate-400 font-mono text-[10px]">• Tầng {hoveredNode.floor}</span>
            {hoveredNode.previewEnemy?.difficulty && (
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${DIFFICULTY_STYLES[hoveredNode.previewEnemy.difficulty] || ''}`}>
                {hoveredNode.previewEnemy.difficulty}
              </span>
            )}
            {hoveredNode.available && (
              <span className="text-emerald-400 text-[10px] font-mono font-bold animate-pulse">[Bấm để xem tình báo]</span>
            )}
          </div>
        )}

        {/* The Aged Parchment Map Box */}
        <div className="w-full primordial-map-parchment rounded-2xl overflow-hidden relative shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
          
          <svg viewBox="0 0 800 1120" className="w-full h-auto block select-none">
            <defs>
              {/* Lantern Warm Spotlight over player */}
              {currentCoords && (
                <radialGradient id="lanternSpotlight" cx={currentCoords.x} cy={currentCoords.y} r="220" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
                  <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1a0f05" stopOpacity="0" />
                </radialGradient>
              )}

              {/* Fog of war at top */}
              <linearGradient id="topFogGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#050805" stopOpacity="0.9" />
                <stop offset="25%" stopColor="#050805" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#050805" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* --- LAYER 1: NATURAL STREAM / RIVER CROSSING --- */}
            <path
              d="M0,640 C180,620 280,670 400,650 C520,630 650,660 800,630"
              stroke="#2c4b57"
              strokeWidth="28"
              fill="none"
              opacity="0.35"
              strokeLinecap="round"
            />
            <path
              d="M0,640 C180,620 280,670 400,650 C520,630 650,660 800,630"
              stroke="#528296"
              strokeWidth="6"
              strokeDasharray="14 10"
              fill="none"
              opacity="0.5"
            />

            {/* --- LAYER 2: DENSE LOW-POLY PINE THICKETS --- */}
            {[
              { x: 50, y: 120, s: 1.2 }, { x: 90, y: 160, s: 1.0 }, { x: 45, y: 220, s: 1.3 },
              { x: 80, y: 280, s: 1.1 }, { x: 50, y: 350, s: 1.2 }, { x: 100, y: 410, s: 0.95 },
              { x: 40, y: 480, s: 1.3 }, { x: 85, y: 550, s: 1.1 }, { x: 55, y: 630, s: 1.2 },
              { x: 110, y: 700, s: 0.9 }, { x: 50, y: 780, s: 1.3 }, { x: 90, y: 850, s: 1.05 },
              { x: 45, y: 930, s: 1.25 }, { x: 80, y: 1000, s: 1.1 }, { x: 55, y: 1070, s: 1.3 },
              { x: 130, y: 200, s: 0.85 }, { x: 135, y: 500, s: 0.8 }, { x: 140, y: 800, s: 0.85 },
            ].map((t, idx) => (
              <LowPolyPine key={`left_tree_${idx}`} x={t.x} y={t.y} scale={t.s} />
            ))}

            {[
              { x: 750, y: 120, s: 1.2 }, { x: 710, y: 160, s: 1.0 }, { x: 755, y: 220, s: 1.3 },
              { x: 720, y: 280, s: 1.1 }, { x: 750, y: 350, s: 1.2 }, { x: 700, y: 410, s: 0.95 },
              { x: 760, y: 480, s: 1.3 }, { x: 715, y: 550, s: 1.1 }, { x: 745, y: 630, s: 1.2 },
              { x: 690, y: 700, s: 0.9 }, { x: 750, y: 780, s: 1.3 }, { x: 710, y: 850, s: 1.05 },
              { x: 755, y: 930, s: 1.25 }, { x: 720, y: 1000, s: 1.1 }, { x: 745, y: 1070, s: 1.3 },
              { x: 670, y: 200, s: 0.85 }, { x: 665, y: 500, s: 0.8 }, { x: 660, y: 800, s: 0.85 },
            ].map((t, idx) => (
              <LowPolyPine key={`right_tree_${idx}`} x={t.x} y={t.y} scale={t.s} />
            ))}

            {[
              { x: 400, y: 410, s: 1.1 }, { x: 375, y: 440, s: 0.85 }, { x: 425, y: 440, s: 0.85 },
              { x: 400, y: 560, s: 1.05 }, { x: 380, y: 590, s: 0.8 }, { x: 420, y: 590, s: 0.8 },
              { x: 400, y: 710, s: 1.15 }, { x: 400, y: 745, s: 0.9 },
              { x: 310, y: 860, s: 0.9 }, { x: 490, y: 860, s: 0.9 },
              { x: 310, y: 1010, s: 0.9 }, { x: 490, y: 1010, s: 0.9 },
              { x: 260, y: 110, s: 1.2 }, { x: 540, y: 110, s: 1.2 },
              { x: 230, y: 160, s: 1.0 }, { x: 570, y: 160, s: 1.0 },
            ].map((t, idx) => (
              <LowPolyPine key={`mid_tree_${idx}`} x={t.x} y={t.y} scale={t.s} />
            ))}

            {/* --- LAYER 3: SVG BRANCHING INK TRAILS --- */}
            {trails.map((trail, idx) => {
              const startX = trail.from.x;
              const startY = trail.from.y;
              const endX = trail.to.x;
              const endY = trail.to.y;
              const midY = (startY + endY) / 2;
              const pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

              return (
                <g key={`trail_${idx}`}>
                  <path
                    d={pathData}
                    stroke="#1a0f07"
                    strokeWidth={trail.isActive ? '7' : '4.5'}
                    fill="none"
                    opacity="0.3"
                  />
                  <path
                    d={pathData}
                    stroke={trail.isActive ? '#f59e0b' : trail.isTraversed ? '#7f1d1d' : '#2b190c'}
                    strokeWidth={trail.isActive ? '5' : '3'}
                    strokeDasharray={trail.isActive ? '8 6' : '6 6'}
                    strokeLinecap="round"
                    fill="none"
                    className={trail.isActive ? 'animate-pulse' : ''}
                    opacity={trail.isActive ? 1 : trail.isTraversed ? 0.85 : 0.65}
                  />
                </g>
              );
            })}

            {/* --- LAYER 4: LANTERN LIGHT CONE OVER PLAYER --- */}
            {currentCoords && (
              <circle
                cx={currentCoords.x}
                cy={currentCoords.y}
                r="200"
                fill="url(#lanternSpotlight)"
                className="pointer-events-none"
              />
            )}

            {/* --- LAYER 5: WOODCUT STAMP NODES --- */}
            {nodes.map(node => {
              const coords = NODE_COORDINATES[node.id];
              if (!coords) return null;

              const isCurrent = node.id === currentNodeId;
              const isAvailable = node.available;
              const isCleared = node.cleared;
              const isInspected = inspectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${coords.x}, ${coords.y})`}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`select-none cursor-pointer`}
                >
                  {/* Available glowing aura ring */}
                  {isAvailable && (
                    <circle
                      cx="0"
                      cy="0"
                      r="32"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      className="animate-spin origin-center"
                      opacity="0.85"
                    />
                  )}

                  {/* Inspected Highlight Ring */}
                  {isInspected && (
                    <circle
                      cx="0"
                      cy="0"
                      r="36"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      className="animate-pulse origin-center"
                    />
                  )}

                  {/* Stamp Stone / Parchment Disc */}
                  <circle
                    cx="0"
                    cy="0"
                    r={node.type === 'boss' ? '28' : '23'}
                    fill={isCurrent ? '#fef3c7' : isAvailable ? '#fff7ed' : isCleared ? '#baa680' : '#8c7653'}
                    stroke={isCurrent ? '#b45309' : isAvailable ? '#78350f' : isCleared ? '#3d2511' : '#2b1a0e'}
                    strokeWidth={isCurrent ? '3.5' : isAvailable ? '3' : '2'}
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                    className="transition-transform duration-200 hover:scale-110"
                  />

                  {/* Woodcut Stamp Artwork */}
                  <WoodcutIcon
                    type={node.type}
                    isAvailable={isAvailable}
                    isCurrent={isCurrent}
                    isCleared={isCleared}
                  />

                  {/* Stamped 'X' mark if cleared */}
                  {isCleared && (
                    <g>
                      <line x1="-14" y1="-14" x2="14" y2="14" stroke="#7f1d1d" strokeWidth="4" strokeLinecap="round" />
                      <line x1="14" y1="-14" x2="-14" y2="14" stroke="#7f1d1d" strokeWidth="4" strokeLinecap="round" />
                    </g>
                  )}

                  {/* Node Label Text */}
                  <text
                    x="0"
                    y={node.type === 'boss' ? '44' : '36'}
                    textAnchor="middle"
                    fill={isAvailable ? '#1c1007' : '#3d2511'}
                    fontSize={node.type === 'boss' ? '12' : '10'}
                    fontWeight="900"
                    fontFamily="serif"
                    className="drop-shadow-xs select-none pointer-events-none"
                  >
                    {node.name}
                  </text>

                  {/* CARVED WOODEN PLAYER FIGURINE / PAWN */}
                  {isCurrent && (
                    <g transform="translate(0, -38)" className="animate-bounce pointer-events-none">
                      <ellipse cx="0" cy="16" rx="8" ry="3" fill="#140b04" opacity="0.6" />
                      <path d="M-6,14 C-7,10 -4,2 0,0 C4,2 7,10 6,14 Z" fill="#78350f" stroke="#2e1003" strokeWidth="1.5" />
                      <circle cx="0" cy="-4" r="5.5" fill="#92400e" stroke="#2e1003" strokeWidth="1.5" />
                      <ellipse cx="0" cy="-7" rx="8" ry="2.5" fill="#451a03" />
                      <circle cx="7" cy="4" r="4" fill="#fef08a" filter="drop-shadow(0 0 6px #f59e0b)" />
                      <circle cx="7" cy="4" r="1.8" fill="#fff" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* --- LAYER 6: TOP SHROUD (FOG OF WAR OVER UNEXPLORED BOSS LAIR) --- */}
            <rect x="0" y="0" width="800" height="240" fill="url(#topFogGradient)" className="pointer-events-none" />
          </svg>
        </div>
      </div>

      {/* 4. INTERACTIVE ENEMY PREVIEW & STRATEGIC BRIEFING DRAWER (SECTION 5) */}
      {inspectedNode && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-2 sm:p-4 animate-in slide-in-from-bottom duration-300">
          <div className="w-full max-w-3xl bg-slate-950/95 border-2 border-amber-500 rounded-3xl p-4 sm:p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.9)] backdrop-blur-md relative flex flex-col gap-3 text-slate-100">
            
            {/* Header with Close */}
            <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {inspectedNode.type === 'boss' ? '👑💀' : inspectedNode.type === 'elite' ? '☠️' : inspectedNode.type === 'sanctuary' ? '🛠️' : inspectedNode.type === 'vault' ? '🗝️' : inspectedNode.type === 'shop' ? '🎒' : inspectedNode.type === 'rest' ? '🔥' : inspectedNode.type === 'event' ? '🔮' : '⚔️'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-fantasy font-black text-base sm:text-lg text-amber-200">
                      {inspectedNode.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-[10px] font-mono text-slate-300">
                      TẦNG {inspectedNode.floor} / 7
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-sans">
                    {inspectedNode.available
                      ? '🟢 Con đường này đang mở - Hãy nghiên cứu kẻ địch trước khi tiến bước!'
                      : inspectedNode.cleared
                      ? '✓ Bạn đã vượt qua khu vực này'
                      : '🔒 Chưa thể đi vào khu vực này (Hãy hoàn thành tầng trước)'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInspectedNode(null)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Enemy Preview vs Special Node */}
            {inspectedNode.previewEnemy ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                {/* Enemy Avatar & Tier */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/50 border border-slate-800">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/40 flex items-center justify-center text-4xl shadow-inner shrink-0 animate-pulse">
                    {inspectedNode.previewEnemy.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        style={{ backgroundColor: TIERS[inspectedNode.previewEnemy.tier]?.hex || '#9E9E9E' }}
                        className="px-1.5 py-0.2 rounded text-[9px] font-black text-slate-950 font-mono uppercase"
                      >
                        BẬC {inspectedNode.previewEnemy.tier}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${DIFFICULTY_STYLES[inspectedNode.previewEnemy.difficulty] || ''}`}>
                        {inspectedNode.previewEnemy.difficulty}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-100 truncate">
                      {inspectedNode.previewEnemy.name}
                    </h4>
                    <span className="text-[10px] font-mono text-amber-400 uppercase">
                      HỆ: {inspectedNode.previewEnemy.element}
                    </span>
                  </div>
                </div>

                {/* Threat Note & Strategic Hint */}
                <div className="sm:col-span-2 p-3 rounded-2xl bg-amber-950/30 border border-amber-900/60 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>TÌNH BÁO CHIẾN THUẬT:</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-snug font-sans">
                      {inspectedNode.previewEnemy.threatNote}
                    </p>
                  </div>

                  {/* Expected Troop List */}
                  <div className="mt-2 pt-2 border-t border-amber-900/40 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span className="text-amber-400 font-bold">Đội hình địch:</span>
                    <span>{inspectedNode.previewEnemy.expectedMonsters.join(' + ')}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Non-Combat Node Lore Briefing */
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                {inspectedNode.type === 'sanctuary' && (
                  <p>🛠️ <strong>Lò Rèn Sanctuary:</strong> Cho phép Hợp Nhất 2 thẻ bài cùng Tên và cùng Bậc lên Bậc cao hơn (tăng chỉ số vượt trội và mở khóa Cleanse nếu đạt SSR+), hoặc Luyện hóa Cổ Vật để tạo hiệu ứng cộng hưởng +20%!</p>
                )}
                {inspectedNode.type === 'vault' && (
                  <p>🗝️ <strong>Kho Báu Rương Cổ:</strong> Chứa đựng Vàng và Cổ Vật cổ đại. Có thể mở bằng Chìa Khóa Cổ (100% an toàn) hoặc Phá Khóa Liều Lĩnh (40%-60% thành công, cẩn thận bẫy nổ hoặc Quái Rương Mimic tấn công!).</p>
                )}
                {inspectedNode.type === 'shop' && (
                  <p>🎒 <strong>Thương Điếm Yêu Tinh:</strong> Gặp gỡ thương nhân rừng sâu để mua sắm Cổ Vật, Thẻ Chiêu Mộ, Dược Liệu hồi phục, Chìa Khóa Cổ và Bộ Dụng Cụ Phá Khóa.</p>
                )}
                {inspectedNode.type === 'rest' && (
                  <p>🔥 <strong>Khu Nghỉ Chân:</strong> Đốt lửa trại để hồi phục 30% sinh lực toàn bộ linh thú, hoặc làm phép thức tỉnh 1 linh thú đã hy sinh.</p>
                )}
                {inspectedNode.type === 'event' && (
                  <p>🔮 <strong>Điềm Báo Kỳ Bí:</strong> Ngã rẽ định mệnh với những lựa chọn may rủi: nhận cổ vật thần bí, tài nguyên hoặc đương đầu thử thách bí ẩn.</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setInspectedNode(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-xs transition cursor-pointer"
              >
                Đóng & Xem Đường Khác
              </button>

              {inspectedNode.available ? (
                <button
                  onClick={() => handleConfirmEnterNode(inspectedNode)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-xs font-fantasy tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2 cursor-pointer active:scale-95 transition"
                >
                  <span>
                    {inspectedNode.type === 'battle' || inspectedNode.type === 'elite' || inspectedNode.type === 'boss'
                      ? 'TIẾN VÀO CHIẾN TRƯỜNG'
                      : 'KHÁM PHÁ KHU VỰC NÀY'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs font-mono text-slate-500 italic">
                  {inspectedNode.cleared ? 'Đã hoàn thành' : 'Đường đi đang bị phong tỏa'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. BOTTOM LEGEND (Woodcut Stamp Meanings) */}
      <div className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-1.5 px-3 rounded-full bg-slate-950/85 border border-amber-900/60 shadow-lg text-[9px] sm:text-[10px] text-amber-200/80 font-mono mt-1 z-20 shrink-0">
        <span className="flex items-center gap-1 font-bold text-slate-300">
          <span className="text-sm">⚔️</span> Quái Rừng
        </span>
        <span className="flex items-center gap-1 font-bold text-red-300">
          <span className="text-sm">☠️</span> Quái Tinh Anh (Relic)
        </span>
        <span className="flex items-center gap-1 font-bold text-amber-300">
          <span className="text-sm">🛠️</span> Lò Rèn Sanctuary
        </span>
        <span className="flex items-center gap-1 font-bold text-yellow-300">
          <span className="text-sm">🗝️</span> Kho Báu Rương Cổ
        </span>
        <span className="flex items-center gap-1 font-bold text-amber-400">
          <span className="text-sm">🎒</span> Ẩn Sĩ Rừng (Shop)
        </span>
        <span className="flex items-center gap-1 font-bold text-orange-300">
          <span className="text-sm">🔥</span> Hạt Mầm Cứu Rỗi (Nghỉ Chân)
        </span>
        <span className="flex items-center gap-1 font-bold text-cyan-300">
          <span className="text-sm">🔮?</span> Điềm Báo Kỳ Bí
        </span>
        <span className="flex items-center gap-1 font-bold text-yellow-400">
          <span className="text-sm">👑💀</span> Chúa Tể Cổ Long (Boss)
        </span>
      </div>
    </div>
  );
};
