// Element types - 5 Elements Star System (Ngũ Hành Tương Khắc Ngôi Sao)
// Fire (Hỏa) -> Nature (Mộc) -> Earth (Thổ) -> Thunder (Lôi) -> Water (Thủy) -> Fire (Hỏa)
export type ElementType = 'fire' | 'water' | 'nature' | 'thunder' | 'earth';

// Comprehensive Buff & Debuff Status Types
export type StatusType = 
  // Buffs
  | 'shield'      // 🛡️ Giáp ảo hấp thụ sát thương
  | 'strengthen'  // ⚔️ Tăng Công (+30% hoặc +4 ST)
  | 'haste'       // ⚡ Tăng Tốc (+3 SPD)
  | 'regen'       // 🌱 Hồi Sinh Lực (+5 HP mỗi lượt)
  | 'thorns'      // 🪞 Gai Phản Đòn (Phản sát thương)
  // Debuffs
  | 'burn'        // 🔥 Thiêu Đốt (Mất máu trực tiếp mỗi lượt)
  | 'poison'      // ☠️ Độc Tố (Tích lũy stack độc)
  | 'freeze'      // ❄️ Đóng Băng / Tê Liệt (Giảm tốc & mất lượt)
  | 'weaken'      // 💔 Suy Yếu (-30% sát thương gây ra)
  | 'vulnerable'; // 🎯 Vỡ Giáp / Lỗ Hổng (Nhận thêm +30% ST)

// Monster Card Skill
export interface Skill {
  id: string;
  name: string;
  element: ElementType;
  description: string;
  baseDamage: number; // 0 for pure buff/debuff/heal
  healAmount?: number;
  targetType: 'single_enemy' | 'all_enemies' | 'single_ally' | 'self';
  statusEffect?: {
    type: StatusType;
    duration: number; // turns
    value: number; // e.g., damage, shield, or %
  };
  cooldown: number; // 0 for basic, 1-3 for special
  currentCooldown?: number;
  iconName?: string;
  isUltimate?: boolean; // Chiêu cuối / Tuyệt kỹ
  usedThisCombat?: boolean; // Chỉ dùng 1 lần duy nhất mỗi trận!
}

// 15 Tactical Relics definition
export interface Relic {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  icon: string;
  type: 
    | 'cleave'            // 1. Đánh lan sang 2 bên
    | 'burn'              // 2. Thiêu đốt mỗi lượt
    | 'poison'            // 3. Độc tố tích lũy
    | 'vampire'           // 4. Hút máu theo sát thương
    | 'speed'             // 5. Tăng tốc độ & sát thương khi đi trước
    | 'thorns'            // 6. Phản sát thương khi bị đánh
    | 'chain_lightning'   // 7. Giật sét lan ngẫu nhiên
    | 'frostbite'         // 8. Đóng băng làm chậm & tê liệt
    | 'ancient_heart'     // 9. Tăng HP tối đa & hồi sinh lực
    | 'executioner'       // 10. Kết liễu mục tiêu máu thấp
    | 'shield_battery'    // 11. Nhận giáp đầu trận & phản nổ giáp
    | 'overdrive_orb'     // 12. Cường hóa Tuyệt Kỹ (Ultimate) +50%
    | 'plague_catalyst'   // 13. Kẻ địch nhiễm độc chết lan độc sang quái khác
    | 'berserk_mask'      // 14. Máu càng thấp sát thương càng cao
    | 'elemental_prism';  // 15. Tăng sát thương Khắc Hệ Ngôi Sao lên +50%
  synergiesWith?: string[]; // IDs of relics that produce special synergies
}

// Active combat status effects on a monster
export interface StatusEffect {
  type: StatusType;
  duration: number;
  value: number;
  stacks?: number;
  sourceRelic?: string;
}

// Monster Card Interface
export interface MonsterCard {
  id: string;
  templateId: string;
  name: string;
  title: string;
  element: ElementType;
  avatar: string; // SVG or icon code
  hp: number;
  maxHp: number;
  speed: number;
  attackPower: number;
  defense: number;
  passive: {
    id: string;
    name: string;
    description: string;
  };
  skills: [Skill, Skill, Skill]; // Exactly 3 skills: [Skill 1, Skill 2, Ultimate (1 lần/trận)]
  ultimateUsed?: boolean; // Track if ultimate has been cast in this combat
  tier?: 'C' | 'UC' | 'R' | 'SR' | 'SSR' | 'UR' | 'MR' | 'TR';
  tierLevel?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  baseHP?: number;
  baseATK?: number;
  baseSPD?: number;
  computedHP?: number;
  computedATK?: number;
  computedSPD?: number;
  computedDEF?: number;
  hiddenRage?: number;
  hitsDealt?: number;
  modifiers?: { id?: string; statType: 'ATK' | 'SPD' | 'HP'; amount: number; expiresAt: 'endOfTurn' | 'endOfMatch' | number }[];
  equippedRelics: Relic[]; // Up to 10 relics per card
  statusEffects: StatusEffect[];
  shield: number;
  exhaustTurns?: number; // Turns unable to act after using ultimate
}

// Planned Action for a turn
export interface PlannedAction {
  skillIndex: 0 | 1 | 2; // Skill 0 (Basic), Skill 1 (Special), Skill 2 (Ultimate)
  targetSlotIndex: number; // 0 to 3
  isCaptureAttempt?: boolean;
}

export interface EnemyPreviewData {
  name: string;
  avatar: string;
  element: ElementType;
  tier: 'C' | 'UC' | 'R' | 'SR' | 'SSR' | 'UR' | 'MR' | 'TR';
  difficulty: 'Dễ' | 'Trung Bình' | 'Khó' | 'Nguy Hiểm' | 'Tử Địa';
  threatNote: string;
  expectedMonsters: string[];
  isElite?: boolean;
  isBoss?: boolean;
}

// Map Node Type (Section 5: Battle, Elite, Shop, Sanctuary/Forge, Treasure Vault, Mystery/Event, Boss, Rest)
export type NodeType = 'battle' | 'elite' | 'shop' | 'rest' | 'event' | 'boss' | 'sanctuary' | 'vault';

export interface MapNode {
  id: string;
  type: NodeType;
  name: string;
  icon: string;
  floor: number;
  columnIndex: number;
  connectedTo: string[]; // IDs of next accessible nodes
  cleared: boolean;
  available: boolean;
  previewEnemy?: EnemyPreviewData;
}

export interface CombatLogEntry {
  id: string;
  turn: number;
  slotIndex?: number;
  actorName: string;
  actorIsPlayer: boolean;
  message: string;
  synergyTriggered?: string;
  damage?: number;
  heal?: number;
}

// Game overall State
export interface GameState {
  playerParty: (MonsterCard | null)[]; // 3 combat slots
  reserveRoster: MonsterCard[]; // Captured bench monsters
  relicInventory: Relic[]; // Unassigned relics
  gold: number;
  keysCount: number; // Chìa khóa mở rương cổ đại 100% an toàn (Section 4 & 7.1)
  lockpickToolkitsCount: number; // Dụng cụ phá khóa, tăng tỷ lệ Brute Force thêm +20% (Section 4 & 7.2)
  captureCardsCount: number; // Lá bài chiêu mộ
  healingHerbsCount: number; // Dược thảo hồi phục sinh mệnh
  shieldPotionsCount: number; // Bình giáp ảo hộ mệnh
  currentFloor: number;
  mapNodes: MapNode[];
  currentNodeId: string | null;
  phase: 'menu' | 'draft' | 'map' | 'combat' | 'shop' | 'rest' | 'event' | 'deck' | 'gameover' | 'victory' | 'sanctuary' | 'vault';
}
