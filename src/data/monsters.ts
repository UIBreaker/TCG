import { MonsterCard, Skill } from '../types/game';
import {
  computeCardTierStats,
  calculateTierSkillDamage,
  calculateTierUltimateDamage,
  getTierPassiveMultiplier,
} from '../fusion/tierScaling';
import { TierCode, TierLevel, TIER_ORDER, TIERS } from '../models/tier';

// Helper to scale passive ability description based on tier
export const formatPassiveForTier = (
  passive: { id: string; name: string; description: string },
  tierLevel: TierLevel
): { id: string; name: string; description: string } => {
  const mult = getTierPassiveMultiplier(tierLevel);
  if (tierLevel === 0) return { ...passive };

  let desc = passive.description;
  if (passive.id === 'ignis_passion') {
    desc = `Khi máu còn dưới 50%, toàn bộ sát thương gây ra tăng thêm +${Math.round(25 * mult)}%.`;
  } else if (passive.id === 'ash_fangs') {
    desc = `Đòn đánh lên mục tiêu đang bị Thiêu Đốt gây thêm +${Math.round(30 * mult)}%.`;
  } else if (passive.id === 'solid_shell') {
    desc = `Giảm ${Math.min(85, Math.round(25 * mult))}% sát thương từ mọi đòn tấn công trực tiếp nhận vào.`;
  } else if (passive.id === 'photosynthesis') {
    desc = `Tự động hồi phục +${Math.round(5 * mult)} Máu vào đầu mỗi lượt thi đấu.`;
  } else if (passive.id === 'phoenix_rebirth') {
    desc = `Lần đầu nhận đòn chí tử, giữ lại 1 HP và lập tức nhận ${Math.round(15 * mult)} Giáp ảo.`;
  } else if (passive.id === 'magma_scales') {
    desc = `Giảm ${Math.round(3 * mult)} sát thương từ mọi đòn tấn công trực tiếp nhận vào.`;
  } else if (passive.id === 'last_blast') {
    desc = `Khi bị tiêu diệt, phát nổ gây ${Math.round(15 * mult)} sát thương phản kích lên kẻ ra đòn kết liễu.`;
  } else if (passive.id === 'abyssal_chill') {
    desc = `Kẻ tấn công vào nhận trạng thái Làm Chậm (-${Math.round(3 * mult)} Tốc độ) trong 1 lượt.`;
  } else if (passive.id === 'ink_camouflage') {
    desc = `Có ${Math.min(65, Math.round(20 * mult))}% xác suất né tránh hoàn toàn đòn đánh của đối thủ.`;
  } else if (passive.id === 'venomous_touch') {
    desc = `Mỗi tầng Độc trên kẻ địch gia tăng thêm +${Math.round(10 * mult)}% sát thương cho mọi đòn tấn công của Xà Độc.`;
  } else if (passive.id === 'stalker_instinct') {
    desc = `Nếu hành động trước đối thủ trong làn đối diện, đòn đánh chắc chắn bạo kích +${Math.round(30 * mult)}% sát thương.`;
  } else if (passive.id === 'high_voltage') {
    desc = `Nếu tốc độ cao hơn mục tiêu, sát thương tăng thêm +${Math.round(20 * mult)}%.`;
  }

  const tierInfo = TIERS[TIER_ORDER[tierLevel]];
  return {
    ...passive,
    description: `[${tierInfo.name}] ${desc}`,
  };
};

// Helper to generate a new instance of a monster with unique id and fresh tactical stats
export const createMonsterInstance = (template: MonsterCard, customId?: string, forcedTier?: TierLevel): MonsterCard => {
  const derivedTierLevel: TierLevel = forcedTier ?? (template.tierLevel !== undefined ? template.tierLevel : 0);
  const tierCode: TierCode = template.tier && forcedTier === undefined ? template.tier : TIER_ORDER[derivedTierLevel];

  // Baseline low-scale stats (Section 1: Base HP 6-10, Base ATK 1-3, Base SPD 1-5)
  const rawBaseHP = template.baseHP ?? Math.max(7, Math.min(10, Math.round(template.hp / 9.5)));
  const rawBaseATK = template.baseATK ?? Math.max(2, Math.min(3, Math.round(template.attackPower / 7.5)));
  const rawBaseSPD = template.baseSPD ?? Math.max(2, Math.min(5, Math.round(template.speed / 3.5)));

  const computed = computeCardTierStats(rawBaseHP, rawBaseATK, rawBaseSPD, derivedTierLevel);

  // Dynamic Skill Scaling across Tiers:
  // Skill 0: ATK based basic attack
  const basicDmg = computed.computedATK;

  // Skill 1: Utility skill (scaled damage / shield / heal)
  const rawSkill1Dmg = Math.max(1, Math.round((template.skills[1]?.baseDamage || 2) / 8));
  const utilDmg = calculateTierSkillDamage(rawSkill1Dmg, derivedTierLevel);
  const rawHeal = template.skills[1]?.healAmount ? Math.max(1, Math.round(template.skills[1].healAmount / 8)) : 0;
  const utilHeal = rawHeal > 0 ? calculateTierSkillDamage(rawHeal, derivedTierLevel) : undefined;
  const utilStatus = template.skills[1]?.statusEffect
    ? {
        ...template.skills[1].statusEffect,
        value: calculateTierSkillDamage(Math.max(1, Math.round((template.skills[1].statusEffect.value || 2) / 8)), derivedTierLevel),
      }
    : undefined;

  // Skill 2: Ultimate skill (explosive damage scaling across tiers)
  const rawUltDmg = Math.max(8, Math.min(14, Math.round((template.skills[2]?.baseDamage || 10) / 3)));
  const ultDmg = calculateTierUltimateDamage(rawUltDmg, derivedTierLevel);

  const scaledPassive = formatPassiveForTier(template.passive, derivedTierLevel);

  const skill1Desc = utilHeal
    ? `Hồi phục ${utilHeal} Máu.`
    : template.skills[1]?.statusEffect?.type === 'shield'
    ? `Tạo ${utilStatus?.value ?? utilDmg} Giáp ảo bảo vệ.`
    : `Kỹ năng phụ gây ${utilDmg} sát thương.`;

  return {
    ...template,
    id: customId || `${template.templateId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    tier: tierCode,
    tierLevel: derivedTierLevel,
    baseHP: rawBaseHP,
    baseATK: rawBaseATK,
    baseSPD: rawBaseSPD,
    computedHP: computed.computedHP,
    computedATK: computed.computedATK,
    computedSPD: computed.computedSPD,
    computedDEF: computed.computedDEF,
    hp: computed.computedHP,
    maxHp: computed.computedHP,
    speed: computed.computedSPD, // Speed scales progressively with tier!
    attackPower: computed.computedATK,
    defense: computed.computedDEF, // Innate defense for high tiers!
    shield: 0,
    hiddenRage: 0,
    hitsDealt: 0,
    ultimateUsed: false,
    exhaustTurns: 0,
    modifiers: [],
    equippedRelics: [...(template.equippedRelics || [])],
    statusEffects: [],
    passive: scaledPassive,
    skills: [
      {
        ...template.skills[0],
        baseDamage: basicDmg,
        currentCooldown: 0,
        description: `Đòn cơ bản gây ${basicDmg} sát thương theo ATK.`,
      },
      {
        ...template.skills[1],
        baseDamage: utilDmg,
        healAmount: utilHeal,
        statusEffect: utilStatus,
        currentCooldown: 0,
        description: skill1Desc,
      },
      {
        ...template.skills[2],
        baseDamage: ultDmg,
        isUltimate: true,
        currentCooldown: 0,
        usedThisCombat: false,
        description: `TUYỆT KỸ: Gây ${ultDmg} sát thương khi đạt 2 đòn đánh, dưới 50% HP hoặc đủ 3 Nộ ẩn.`,
      },
    ],
  };
};

export const MONSTER_TEMPLATES: MonsterCard[] = [
  // ===================== HỆ HỎA (FIRE 🔥) =====================
  // 1. Hỏa Miêu Bốc Lửa
  {
    id: 'tpl_fire_1',
    templateId: 'ignis_cat',
    name: 'Hỏa Miêu Bốc Lửa',
    title: 'Linh Miêu Núi Lửa',
    element: 'fire',
    avatar: '🔥🐱',
    hp: 82,
    maxHp: 82,
    speed: 15,
    attackPower: 20,
    defense: 6,
    passive: {
      id: 'ignis_passion',
      name: 'Nhiệt Huyết Rực Lửa',
      description: 'Khi máu còn dưới 50%, toàn bộ sát thương gây ra tăng thêm +25%.',
    },
    skills: [
      {
        id: 'flame_claw',
        name: 'Móng Vuốt Hỏa',
        element: 'fire',
        description: 'Cào mạnh gây 14 sát thương và có 50% cơ hội thiêu đốt mục tiêu.',
        baseDamage: 14,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
        statusEffect: { type: 'burn', duration: 2, value: 5 },
      },
      {
        id: 'fire_storm',
        name: 'Hỏa Diễm Liệt Thổ',
        element: 'fire',
        description: 'Phun cầu lửa bốc cháy dữ dội gây 24 sát thương bạo nổ.',
        baseDamage: 24,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
      },
      {
        id: 'inferno_burst',
        name: 'Liệt Hỏa Bộc Phá',
        element: 'fire',
        description: 'TUYỆT KỸ [1 lần/trận]: Giáng cột lửa thiêu đốt 36 sát thương lên mục tiêu chính và lan 10 sát thương sang 2 làn cạnh bên.',
        baseDamage: 36,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
        statusEffect: { type: 'burn', duration: 3, value: 6 },
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 2. Viêm Lang Cuồng Nộ
  {
    id: 'tpl_fire_2',
    templateId: 'pyro_wolf',
    name: 'Viêm Lang Cuồng Nộ',
    title: 'Sói Lửa Tử Chiến',
    element: 'fire',
    avatar: '🔥🐺',
    hp: 78,
    maxHp: 78,
    speed: 14,
    attackPower: 22,
    defense: 5,
    passive: {
      id: 'ash_fangs',
      name: 'Răng Nanh Tro Tàn',
      description: 'Đòn đánh lên mục tiêu đang bị Thiêu Đốt gây thêm +30% sát thương.',
    },
    skills: [
      {
        id: 'wolf_bite',
        name: 'Cắn Xé Rực Lửa',
        element: 'fire',
        description: 'Cắn xé gây 15 sát thương. Nếu mục tiêu đang cháy, hồi phục 5 HP cho bản thân.',
        baseDamage: 15,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'wolf_roar',
        name: 'Gầm Lửa Trợ Oai',
        element: 'fire',
        description: 'Hống lửa vang dội, nhận hiệu ứng Tăng Công (+30% sát thương) trong 2 lượt.',
        baseDamage: 0,
        targetType: 'self',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'strengthen', duration: 2, value: 4 },
      },
      {
        id: 'berserk_flame',
        name: 'Cuồng Bạo Huyết Viêm',
        element: 'fire',
        description: 'TUYỆT KỸ [1 lần/trận]: Lao vào cắn xé tàn bạo gây 38 sát thương. Nếu hạ gục mục tiêu, hồi ngay 25 HP!',
        baseDamage: 38,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 3. Chu Tước Hỏa Điểu
  {
    id: 'tpl_fire_3',
    templateId: 'phoenix_chick',
    name: 'Chu Tước Hỏa Điểu',
    title: 'Chim Lửa Tái Sinh',
    element: 'fire',
    avatar: '🔥🦅',
    hp: 72,
    maxHp: 72,
    speed: 16,
    attackPower: 18,
    defense: 5,
    passive: {
      id: 'phoenix_rebirth',
      name: 'Tàn Tro Bất Diệt',
      description: 'Lần đầu nhận đòn chí tử, giữ lại 1 HP và lập tức nhận 15 Giáp ảo.',
    },
    skills: [
      {
        id: 'fire_feather',
        name: 'Lông Vũ Rực Lửa',
        element: 'fire',
        description: 'Phóng chùm lông lửa gây 12 sát thương và giảm 2 Tốc độ của đối thủ.',
        baseDamage: 12,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'flame_dance',
        name: 'Vũ Điệu Hỏa Diễm',
        element: 'fire',
        description: 'Múa lượn tạo vệt lửa gây 16 sát thương và thanh tẩy 1 hiệu ứng bất lợi trên bản thân.',
        baseDamage: 16,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
      },
      {
        id: 'phoenix_nirvana',
        name: 'Niết Bàn Tái Sinh',
        element: 'fire',
        description: 'TUYỆT KỸ [1 lần/trận]: Phóng hỏa toàn chiến trường gây 22 sát thương lên toàn bộ kẻ địch và tự hồi 20 HP.',
        baseDamage: 22,
        targetType: 'all_enemies',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 4. Hỏa Long Sa Thạch
  {
    id: 'tpl_fire_4',
    templateId: 'ember_drake',
    name: 'Hỏa Long Sa Thạch',
    title: 'Rồng Tro Nham Thạch',
    element: 'fire',
    avatar: '🔥🐲',
    hp: 95,
    maxHp: 95,
    speed: 12,
    attackPower: 19,
    defense: 10,
    passive: {
      id: 'magma_scales',
      name: 'Vảy Nham Kiên Cố',
      description: 'Giảm 3 sát thương từ mọi đòn tấn công trực tiếp nhận vào.',
    },
    skills: [
      {
        id: 'hot_breath',
        name: 'Hơi Thở Tro Nóng',
        element: 'fire',
        description: 'Phun tro bỏng gây 13 sát thương và tạo Vỡ Giáp (+30% ST nhận vào) trong 2 lượt.',
        baseDamage: 13,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
        statusEffect: { type: 'vulnerable', duration: 2, value: 3 },
      },
      {
        id: 'magma_tail',
        name: 'Quét Đuôi Nham Thạch',
        element: 'fire',
        description: 'Quật mạnh đuôi gây 20 sát thương và tạo 10 Giáp cho bản thân.',
        baseDamage: 20,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'shield', duration: 2, value: 10 },
      },
      {
        id: 'infernal_prison',
        name: 'Hỏa Ngục Nham Thạch',
        element: 'fire',
        description: 'TUYỆT KỸ [1 lần/trận]: Phá tan toàn bộ Giáp của mục tiêu và gây 34 sát thương thiêu đốt bỏng rát.',
        baseDamage: 34,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 5. Viêm Ma Hỏa Cầu
  {
    id: 'tpl_fire_5',
    templateId: 'magma_sprite',
    name: 'Viêm Ma Hỏa Cầu',
    title: 'Linh Hồn Lửa Nổ',
    element: 'fire',
    avatar: '🔥💥',
    hp: 68,
    maxHp: 68,
    speed: 17,
    attackPower: 24,
    defense: 4,
    passive: {
      id: 'last_blast',
      name: 'Bộc Phá Tử Sĩ',
      description: 'Khi bị tiêu diệt, phát nổ gây 15 sát thương phản kích lên kẻ ra đòn kết liễu.',
    },
    skills: [
      {
        id: 'spark_dart',
        name: 'Tia Lửa Nén',
        element: 'fire',
        description: 'Bắn tia lửa cao áp gây 16 sát thương cực nhanh.',
        baseDamage: 16,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'magma_bomb',
        name: 'Quả Cầu Bộc Hỏa',
        element: 'fire',
        description: 'Nén quả cầu lửa cực mạnh gây 26 sát thương, bản thân chịu 5 sát thương phản chấn.',
        baseDamage: 26,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
      },
      {
        id: 'supernova',
        name: 'Đại Bạo Nổ Thái Dương',
        element: 'fire',
        description: 'TUYỆT KỸ [1 lần/trận]: Giải phóng toàn bộ nhiệt năng dồn lại gây 42 sát thương hủy diệt!',
        baseDamage: 42,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // ===================== HỆ THỦY (WATER 💧) =====================
  // 6. Cự Quy Thủy Thạch
  {
    id: 'tpl_water_1',
    templateId: 'aquaroc_turtle',
    name: 'Cự Quy Thủy Thạch',
    title: 'Hộ Vệ Vực Nước',
    element: 'water',
    avatar: '💧🐢',
    hp: 105,
    maxHp: 105,
    speed: 10,
    attackPower: 14,
    defense: 14,
    passive: {
      id: 'solid_shell',
      name: 'Mai Rùa Cổ Thạch',
      description: 'Giảm 25% sát thương từ mọi đòn tấn công trực tiếp nhận vào.',
    },
    skills: [
      {
        id: 'water_cannon',
        name: 'Thủy Pháo Áp Suất',
        element: 'water',
        description: 'Bắn tia nước áp lực cao gây 12 sát thương Thủy.',
        baseDamage: 12,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'tide_barrier',
        name: 'Khiên Thủy Triều',
        element: 'water',
        description: 'Tạo lớp bong bóng nước ban 22 Giáp ảo cho bản thân.',
        baseDamage: 0,
        targetType: 'self',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'shield', duration: 2, value: 22 },
      },
      {
        id: 'aegis_of_ocean',
        name: 'Thủy Thần Kim Thuẫn',
        element: 'water',
        description: 'TUYỆT KỸ [1 lần/trận]: Ban 35 Giáp cho bản thân và 15 Giáp cho toàn bộ đồng minh kề bên.',
        baseDamage: 0,
        targetType: 'self',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
        statusEffect: { type: 'shield', duration: 3, value: 35 },
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 7. Băng Giao Hải Long
  {
    id: 'tpl_water_2',
    templateId: 'frost_serpent',
    name: 'Băng Giao Hải Long',
    title: 'Thủy Long Biển Sâu',
    element: 'water',
    avatar: '💧🐉',
    hp: 84,
    maxHp: 84,
    speed: 13,
    attackPower: 17,
    defense: 8,
    passive: {
      id: 'abyssal_chill',
      name: 'Hàn Khí Biển Sâu',
      description: 'Kẻ tấn công vào nhận trạng thái Làm Chậm (-3 Tốc độ) trong 1 lượt.',
    },
    skills: [
      {
        id: 'ice_shard',
        name: 'Băng Tiễn Sắc Lẹm',
        element: 'water',
        description: 'Phóng mũi tên băng gây 13 sát thương và 40% cơ hội làm chậm mục tiêu.',
        baseDamage: 13,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'frost_lock',
        name: 'Sương Băng Tê Buốt',
        element: 'water',
        description: 'Gây 18 sát thương và đóng băng mục tiêu, khiến kẻ địch có 60% mất lượt tiếp theo.',
        baseDamage: 18,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'freeze', duration: 1, value: 5 },
      },
      {
        id: 'blizzard_tempest',
        name: 'Bão Tuyết Vực Sâu',
        element: 'water',
        description: 'TUYỆT KỸ [1 lần/trận]: Quét bão tuyết gây 26 sát thương lên toàn bộ địch và giảm 4 Tốc độ của đối phương.',
        baseDamage: 26,
        targetType: 'all_enemies',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 8. Bạch Linh Hải Mã
  {
    id: 'tpl_water_3',
    templateId: 'tide_seahorse',
    name: 'Bạch Linh Hải Mã',
    title: 'Thủy Mã Trị Liệu',
    element: 'water',
    avatar: '💧🐴',
    hp: 76,
    maxHp: 76,
    speed: 14,
    attackPower: 13,
    defense: 7,
    passive: {
      id: 'purifying_spring',
      name: 'Dòng Nước Thanh Tẩy',
      description: 'Đầu mỗi lượt tự động hóa giải 1 trạng thái bất lợi ngẫu nhiên trên bản thân.',
    },
    skills: [
      {
        id: 'bubble_spray',
        name: 'Bọt Nước Phục Hồi',
        element: 'water',
        description: 'Bắn bong bóng nước gây 10 sát thương và hồi 6 HP cho bản thân.',
        baseDamage: 10,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
        healAmount: 6,
      },
      {
        id: 'healing_tide',
        name: 'Thủy Ba Trị Liệu',
        element: 'water',
        description: 'Hồi phục 18 HP cho bản thân hoặc đồng minh thấp máu nhất kèm hiệu ứng Hồi Sinh Lực.',
        baseDamage: 0,
        targetType: 'single_ally',
        cooldown: 1,
        currentCooldown: 0,
        healAmount: 18,
        statusEffect: { type: 'regen', duration: 2, value: 5 },
      },
      {
        id: 'ocean_grace',
        name: 'Đại Hải Ân Sủng',
        element: 'water',
        description: 'TUYỆT KỸ [1 lần/trận]: Ban phước lành hồi 24 HP cho toàn bộ đội hình và xóa sạch mọi hiệu ứng Thiêu Đốt, Độc Tố.',
        baseDamage: 0,
        targetType: 'self',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
        healAmount: 24,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 9. Kình Ngư Thủy Kích
  {
    id: 'tpl_water_4',
    templateId: 'abyssal_whale',
    name: 'Kình Ngư Thủy Kích',
    title: 'Cá Voi Sóng Thần',
    element: 'water',
    avatar: '💧🐋',
    hp: 100,
    maxHp: 100,
    speed: 11,
    attackPower: 16,
    defense: 10,
    passive: {
      id: 'blubber_armor',
      name: 'Lớp Mỡ Biển Sâu',
      description: 'Miễn nhiễm hoàn toàn với các đòn đánh bạo kích (Critical Hits).',
    },
    skills: [
      {
        id: 'body_slam',
        name: 'Va Chạm Sóng Lớn',
        element: 'water',
        description: 'Dùng thân hình khổng lồ húc mạnh gây 14 sát thương Thủy.',
        baseDamage: 14,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'abyssal_sonar',
        name: 'Sóng Siêu Âm Vực Thẳm',
        element: 'water',
        description: 'Gầm vang đáy biển gây 18 sát thương và Suy Yếu (-30% ST) mục tiêu trong 2 lượt.',
        baseDamage: 18,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'weaken', duration: 2, value: 4 },
      },
      {
        id: 'tsunami_crush',
        name: 'Sóng Thần Thôn Phệ',
        element: 'water',
        description: 'TUYỆT KỸ [1 lần/trận]: Dựng ngọn sóng thần khổng lồ gây 32 sát thương và phá hủy 20 Giáp của mục tiêu.',
        baseDamage: 32,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 10. Bạch Tuộc Mực Đen
  {
    id: 'tpl_water_5',
    templateId: 'ink_kraken',
    name: 'Bạch Tuộc Mực Đen',
    title: 'Xúc Tu Ảo Ảnh',
    element: 'water',
    avatar: '💧🐙',
    hp: 80,
    maxHp: 80,
    speed: 12,
    attackPower: 17,
    defense: 8,
    passive: {
      id: 'ink_camouflage',
      name: 'Mực Đen Ngụy Trang',
      description: 'Có 20% xác suất né tránh hoàn toàn đòn đánh của đối thủ.',
    },
    skills: [
      {
        id: 'tentacle_lash',
        name: 'Roi Mực Xúc Tu',
        element: 'water',
        description: 'Quất xúc tu gây 13 sát thương liên hoàn.',
        baseDamage: 13,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'ink_spray',
        name: 'Phun Mực Đen',
        element: 'water',
        description: 'Phun mực làm mù mục tiêu gây 15 sát thương và giảm 40% sát thương của kẻ địch lượt tới.',
        baseDamage: 15,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'weaken', duration: 1, value: 5 },
      },
      {
        id: 'kraken_vortex',
        name: 'Xoáy Nước Mực Ma',
        element: 'water',
        description: 'TUYỆT KỸ [1 lần/trận]: Cuốn mục tiêu vào tâm xoáy nước gây 30 sát thương và khóa chiêu hồi trong 2 lượt.',
        baseDamage: 30,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // ===================== HỆ MỘC (NATURE 🌿) =====================
  // 11. Mộc Tinh Cổ Thụ
  {
    id: 'tpl_nature_1',
    templateId: 'sylvan_treant',
    name: 'Mộc Tinh Cổ Thụ',
    title: 'Thần Rừng Rễ Sâu',
    element: 'nature',
    avatar: '🌿🌲',
    hp: 110,
    maxHp: 110,
    speed: 9,
    attackPower: 13,
    defense: 12,
    passive: {
      id: 'photosynthesis',
      name: 'Quang Hợp Rừng Già',
      description: 'Tự động hồi phục +5 Máu vào đầu mỗi lượt thi đấu.',
    },
    skills: [
      {
        id: 'vine_whip',
        name: 'Roi Dây Leo',
        element: 'nature',
        description: 'Quật cành dây leo gây 12 sát thương Mộc.',
        baseDamage: 12,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'root_entangle',
        name: 'Rễ Cây Trói Chặt',
        element: 'nature',
        description: 'Bắn rễ cây đâm sâu gây 16 sát thương và trói chân làm giảm 4 Tốc độ của mục tiêu.',
        baseDamage: 16,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
      },
      {
        id: 'sylvan_growth',
        name: 'Đại Địa Sinh Sôi',
        element: 'nature',
        description: 'TUYỆT KỸ [1 lần/trận]: Kích phát sinh mệnh lực ban 25 Giáp ảo và hồi 10 HP mỗi lượt trong 3 lượt tiếp theo.',
        baseDamage: 0,
        targetType: 'self',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
        statusEffect: { type: 'regen', duration: 3, value: 10 },
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 12. Xà Độc Mộc Linh
  {
    id: 'tpl_nature_2',
    templateId: 'venom_viper',
    name: 'Xà Độc Mộc Linh',
    title: 'Trăn Xanh Kịch Độc',
    element: 'nature',
    avatar: '🌿🐍',
    hp: 75,
    maxHp: 75,
    speed: 15,
    attackPower: 16,
    defense: 6,
    passive: {
      id: 'venomous_touch',
      name: 'Chất Độc Ăn Mòn',
      description: 'Mỗi tầng Độc trên kẻ địch gia tăng thêm +10% sát thương cho mọi đòn tấn công của Xà Độc.',
    },
    skills: [
      {
        id: 'poison_bite',
        name: 'Nhát Cắn Răng Độc',
        element: 'nature',
        description: 'Cắn nhanh gây 11 sát thương và tích lũy 2 tầng Độc Tố.',
        baseDamage: 11,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
        statusEffect: { type: 'poison', duration: 2, value: 6 },
      },
      {
        id: 'toxic_spray',
        name: 'Phun Mưa Kịch Độc',
        element: 'nature',
        description: 'Phun luồng độc ăn mòn gây 15 sát thương và tích thêm 3 tầng Độc Tố.',
        baseDamage: 15,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'poison', duration: 3, value: 8 },
      },
      {
        id: 'plague_eruption',
        name: 'Kích Nổ Độc Tố',
        element: 'nature',
        description: 'TUYỆT KỸ [1 lần/trận]: Gây 24 sát thương và kích nổ lập tức toàn bộ sát thương của tất cả các tầng Độc đang có!',
        baseDamage: 24,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 13. Liệp Báo Rừng Rậm
  {
    id: 'tpl_nature_3',
    templateId: 'canopy_panther',
    name: 'Liệp Báo Rừng Rậm',
    title: 'Báo Mộc Ẩn Thân',
    element: 'nature',
    avatar: '🌿🐆',
    hp: 76,
    maxHp: 76,
    speed: 17,
    attackPower: 21,
    defense: 5,
    passive: {
      id: 'stalker_instinct',
      name: 'Rình Mồi Rừng Sâu',
      description: 'Nếu hành động trước đối thủ trong làn đối diện, đòn đánh chắc chắn bạo kích +30% sát thương.',
    },
    skills: [
      {
        id: 'panther_claw',
        name: 'Vuốt Sắc Báo Rừng',
        element: 'nature',
        description: 'Cào chớp nhoáng gây 15 sát thương.',
        baseDamage: 15,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'ambush_strike',
        name: 'Tập Kích Chớp Nhoáng',
        element: 'nature',
        description: 'Lao tới từ bóng cây gây 23 sát thương hiểm hóc.',
        baseDamage: 23,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
      },
      {
        id: 'fatal_assassination',
        name: 'Tuyệt Kỹ Ám Sát',
        element: 'nature',
        description: 'TUYỆT KỸ [1 lần/trận]: Nhắm vào yết hầu đối phương gây 38 sát thương. Nếu máu đối thủ < 40%, gây 50 sát thương kết liễu!',
        baseDamage: 38,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 14. Nấm Bào Tử Rừng
  {
    id: 'tpl_nature_4',
    templateId: 'spore_mushroom',
    name: 'Nấm Bào Tử Rừng',
    title: 'Bào Tử Thôi Miên',
    element: 'nature',
    avatar: '🌿🍄',
    hp: 85,
    maxHp: 85,
    speed: 11,
    attackPower: 14,
    defense: 9,
    passive: {
      id: 'spore_shield',
      name: 'Bào Tử Tự Vệ',
      description: 'Khi bị tấn công trực tiếp, có 40% tung bào tử khiến kẻ đánh bị Suy Yếu (-30% ST) ở lượt tiếp theo.',
    },
    skills: [
      {
        id: 'spore_burst',
        name: 'Phóng Thích Bào Tử',
        element: 'nature',
        description: 'Xả luồng bào tử gây 11 sát thương và làm Suy Yếu (-30% ST) đối phương trong 1 lượt.',
        baseDamage: 11,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
        statusEffect: { type: 'weaken', duration: 1, value: 4 },
      },
      {
        id: 'life_drain',
        name: 'Ký Sinh Hút Máu',
        element: 'nature',
        description: 'Ký sinh mút lấy 16 sát thương của địch và hồi 8 HP cho bản thân.',
        baseDamage: 16,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
        healAmount: 8,
      },
      {
        id: 'fungal_overgrowth',
        name: 'Mê Trận Rừng Nấm',
        element: 'nature',
        description: 'TUYỆT KỸ [1 lần/trận]: Tung bào tử bao trùm toàn sân địch gây 22 sát thương, đồng thời gieo Độc và làm chậm toàn bộ!',
        baseDamage: 22,
        targetType: 'all_enemies',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 15. Tiên Hoa Thảo Mộc
  {
    id: 'tpl_nature_5',
    templateId: 'flora_sprite',
    name: 'Tiên Hoa Thảo Mộc',
    title: 'Hoa Tiên Dược Cỏ',
    element: 'nature',
    avatar: '🌿🌸',
    hp: 70,
    maxHp: 70,
    speed: 14,
    attackPower: 12,
    defense: 6,
    passive: {
      id: 'floral_aroma',
      name: 'Hương Rừng Trợ Lực',
      description: 'Các đồng minh ở 2 bên kề cận nhận thêm +2 Tốc độ cơ bản.',
    },
    skills: [
      {
        id: 'petal_blast',
        name: 'Cánh Hoa Ban Phước',
        element: 'nature',
        description: 'Phóng cánh hoa sắc gây 10 sát thương và hồi 5 HP cho đồng minh thấp máu nhất.',
        baseDamage: 10,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
        healAmount: 5,
      },
      {
        id: 'pollen_empower',
        name: 'Phấn Hoa Tiếp Sức',
        element: 'nature',
        description: 'Trao hiệu ứng Tăng Công (+30% ST) và Hồi Sinh Lực cho 1 đồng minh trong 2 lượt.',
        baseDamage: 0,
        targetType: 'single_ally',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'strengthen', duration: 2, value: 4 },
      },
      {
        id: 'spring_bloom',
        name: 'Mùa Xuân Nở Rộ',
        element: 'nature',
        description: 'TUYỆT KỸ [1 lần/trận]: Toàn bộ quân ta hồi 22 HP và nhận 10 Giáp ảo bảo vệ vững vàng.',
        baseDamage: 0,
        targetType: 'self',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
        healAmount: 22,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // ===================== HỆ LÔI (THUNDER ⚡) =====================
  // 16. Kim Bằng Lôi Điểu
  {
    id: 'tpl_thunder_1',
    templateId: 'volt_falcon',
    name: 'Kim Bằng Lôi Điểu',
    title: 'Chim Sấm Sét',
    element: 'thunder',
    avatar: '⚡🦅',
    hp: 74,
    maxHp: 74,
    speed: 18,
    attackPower: 21,
    defense: 5,
    passive: {
      id: 'high_voltage',
      name: 'Lôi Điện Cao Thế',
      description: 'Nếu Tốc độ cao hơn đối thủ, sát thương mọi kĩ năng được tăng thêm +20%.',
    },
    skills: [
      {
        id: 'spark_peck',
        name: 'Mỏ Sét Xé Gió',
        element: 'thunder',
        description: 'Mổ chớp nhoáng gây 15 sát thương Lôi tích điện.',
        baseDamage: 15,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'lightning_strike',
        name: 'Tia Chớp Giáng Trần',
        element: 'thunder',
        description: 'Gọi tia sét thẳng từ tầng mây gây 23 sát thương cực mạnh.',
        baseDamage: 23,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
      },
      {
        id: 'thunder_tempest',
        name: 'Thiên Lôi Vạn Trượng',
        element: 'thunder',
        description: 'TUYỆT KỸ [1 lần/trận]: Giáng sấm sét 36 sát thương lên mục tiêu chính và phóng tia điện giật 14 sát thương sang 2 làn cạnh bên.',
        baseDamage: 36,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 17. Lôi Báo Siêu Tốc
  {
    id: 'tpl_thunder_2',
    templateId: 'thunder_leopard',
    name: 'Lôi Báo Siêu Tốc',
    title: 'Báo Sấm Chớp',
    element: 'thunder',
    avatar: '⚡🐆',
    hp: 70,
    maxHp: 70,
    speed: 18,
    attackPower: 23,
    defense: 4,
    passive: {
      id: 'speed_overcharge',
      name: 'Xung Điện Tốc Độ',
      description: 'Luôn hành động đầu tiên ở lượt đấu thứ nhất bất chấp tốc độ của quân địch.',
    },
    skills: [
      {
        id: 'volt_slash',
        name: 'Tia Sét Xung Kích',
        element: 'thunder',
        description: 'Cào xé bằng vuốt nhiễm điện gây 16 sát thương.',
        baseDamage: 16,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'overload_burst',
        name: 'Quá Tải Điện Trường',
        element: 'thunder',
        description: 'Phóng luồng điện quá tải gây 25 sát thương, tự chịu 4 sát thương phản chấn.',
        baseDamage: 25,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
      },
      {
        id: 'speed_of_light',
        name: 'Vận Tốc Ánh Sáng',
        element: 'thunder',
        description: 'TUYỆT KỸ [1 lần/trận]: Di chuyển với tốc độ ánh sáng gây 40 sát thương dồn vào một mục tiêu duy nhất!',
        baseDamage: 40,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 18. Lôi Xà Nhiệt Điện
  {
    id: 'tpl_thunder_3',
    templateId: 'plasma_eel',
    name: 'Lôi Xà Nhiệt Điện',
    title: 'Lươn Điện Huỳnh Quang',
    element: 'thunder',
    avatar: '⚡🐍',
    hp: 82,
    maxHp: 82,
    speed: 14,
    attackPower: 16,
    defense: 8,
    passive: {
      id: 'static_feedback',
      name: 'Dòng Điện Lan Truyền',
      description: 'Khi bị tấn công trực tiếp, phản hồi giật lại 4 sát thương Lôi cho kẻ đánh.',
    },
    skills: [
      {
        id: 'shock_jab',
        name: 'Chích Điện Tê Tái',
        element: 'thunder',
        description: 'Chích điện áp cao gây 12 sát thương và có 35% làm mục tiêu Tê Liệt.',
        baseDamage: 12,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'arc_orb',
        name: 'Quả Cầu Hồ Quang',
        element: 'thunder',
        description: 'Bắn cầu điện gây 18 sát thương và tạo Vỡ Giáp (+30% ST nhận vào) trong 2 lượt.',
        baseDamage: 18,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'vulnerable', duration: 2, value: 4 },
      },
      {
        id: 'paralyze_tempest',
        name: 'Bão Sét Tê Liệt',
        element: 'thunder',
        description: 'TUYỆT KỸ [1 lần/trận]: Gây 28 sát thương, chắc chắn làm Tê Liệt đối thủ mất lượt sau và đặt mọi chiêu vào thời gian hồi!',
        baseDamage: 28,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
        statusEffect: { type: 'freeze', duration: 1, value: 6 },
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 19. Thiên Lôi Tê Ngưu
  {
    id: 'tpl_thunder_4',
    templateId: 'thunder_rhino',
    name: 'Thiên Lôi Tê Ngưu',
    title: 'Tê Giác Sấm Sét',
    element: 'thunder',
    avatar: '⚡🦏',
    hp: 98,
    maxHp: 98,
    speed: 12,
    attackPower: 17,
    defense: 11,
    passive: {
      id: 'charge_battery',
      name: 'Tích Điện Hộ Thân',
      description: 'Mỗi khi nhận một đòn tấn công, tích lũy thêm +2 Sát thương cho đòn ra chiêu kế tiếp.',
    },
    skills: [
      {
        id: 'thunder_horn',
        name: 'Húc Sét Tê Liệt',
        element: 'thunder',
        description: 'Dùng sừng điện húc mạnh gây 14 sát thương.',
        baseDamage: 14,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'thunder_stomp',
        name: 'Dậm Chân Lôi Điện',
        element: 'thunder',
        description: 'Dậm đất tạo sóng xung kích lôi điện gây 19 sát thương và nhận 12 Giáp ảo.',
        baseDamage: 19,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'shield', duration: 2, value: 12 },
      },
      {
        id: 'cataclysmic_smash',
        name: 'Lôi Kích Bộc Phá',
        element: 'thunder',
        description: 'TUYỆT KỸ [1 lần/trận]: Húc bay đối phương gây 34 sát thương, nghiền nát toàn bộ Giáp và làm choáng 1 lượt.',
        baseDamage: 34,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 20. Lôi Thần Khôi Lỗi
  {
    id: 'tpl_thunder_5',
    templateId: 'volt_golem',
    name: 'Lôi Thần Khôi Lỗi',
    title: 'Ma Đạo Tích Điện',
    element: 'thunder',
    avatar: '⚡🤖',
    hp: 88,
    maxHp: 88,
    speed: 13,
    attackPower: 18,
    defense: 9,
    passive: {
      id: 'energy_core',
      name: 'Lõi Tích Năng',
      description: 'Vào trận với 12 Giáp ảo điện từ bảo vệ sẵn.',
    },
    skills: [
      {
        id: 'volt_fist',
        name: 'Nắm Đấm Điện Từ',
        element: 'thunder',
        description: 'Đấm thẳng bằng điện cao thế gây 13 sát thương.',
        baseDamage: 13,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'recharge_overdrive',
        name: 'Tụ Năng Lượng',
        element: 'thunder',
        description: 'Tự nạp điện nhận hiệu ứng Tăng Công (+30% ST) và 10 Giáp trong 2 lượt.',
        baseDamage: 0,
        targetType: 'self',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'strengthen', duration: 2, value: 4 },
      },
      {
        id: 'plasma_meltdown',
        name: 'Xả Lũ Điện Trường',
        element: 'thunder',
        description: 'TUYỆT KỸ [1 lần/trận]: Xả toàn bộ pin điện gây 30 sát thương lên mục tiêu chính và 12 sát thương lên toàn thể quân địch!',
        baseDamage: 30,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 12,
  },

  // ===================== HỆ THỔ (EARTH 🌍) =====================
  // 21. Thạch Cự Nhân
  {
    id: 'tpl_earth_1',
    templateId: 'stone_golem',
    name: 'Thạch Cự Nhân',
    title: 'Khổng Lồ Đá Tảng',
    element: 'earth',
    avatar: '🌍🗿',
    hp: 115,
    maxHp: 115,
    speed: 9,
    attackPower: 13,
    defense: 15,
    passive: {
      id: 'unyielding_rock',
      name: 'Vách Đá Kiên Cố',
      description: 'Miễn nhiễm hoàn toàn với các hiệu ứng Thiêu Đốt và Vỡ Giáp.',
    },
    skills: [
      {
        id: 'rock_punch',
        name: 'Nắm Đấm Đá Tảng',
        element: 'earth',
        description: 'Nện nắm đấm cự thạch gây 12 sát thương Thổ.',
        baseDamage: 12,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'earth_wall',
        name: 'Thạch Bích Khiên',
        element: 'earth',
        description: 'Dựng tường đá vững chãi tạo 25 Giáp ảo cho bản thân.',
        baseDamage: 0,
        targetType: 'self',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'shield', duration: 2, value: 25 },
      },
      {
        id: 'impenetrable_fortress',
        name: 'Tường Thành Bất Khả Xâm Phạm',
        element: 'earth',
        description: 'TUYỆT KỸ [1 lần/trận]: Nhận ngay 45 Giáp ảo và phản lại 35% sát thương nhận vào trong 2 lượt.',
        baseDamage: 0,
        targetType: 'self',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
        statusEffect: { type: 'shield', duration: 3, value: 45 },
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 22. Sơn Bàng Thép Trư
  {
    id: 'tpl_earth_2',
    templateId: 'iron_boar',
    name: 'Sơn Bàng Thép Trư',
    title: 'Heo Rừng Gai Sắt',
    element: 'earth',
    avatar: '🌍🐗',
    hp: 96,
    maxHp: 96,
    speed: 11,
    attackPower: 16,
    defense: 12,
    passive: {
      id: 'iron_thorns',
      name: 'Gai Thép Phản Kích',
      description: 'Khi bị tấn công trực diện, phản hồi 20% sát thương nhận vào cho kẻ tấn công.',
    },
    skills: [
      {
        id: 'boar_charge',
        name: 'Ủi Gai Sắt',
        element: 'earth',
        description: 'Lao tới húc gai gây 13 sát thương Thổ.',
        baseDamage: 13,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'quake_roar',
        name: 'Gầm Động Đất',
        element: 'earth',
        description: 'Gầm rung chuyển đất đá gây 17 sát thương và giảm 4 Tốc độ của kẻ địch trong 2 lượt.',
        baseDamage: 17,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
      },
      {
        id: 'iron_rampage',
        name: 'Cuồng Nộ Giáp Sắt',
        element: 'earth',
        description: 'TUYỆT KỸ [1 lần/trận]: Lao điên cuồng gây 32 sát thương và kích hoạt phản đòn 50% sát thương nhận vào trong 2 lượt.',
        baseDamage: 32,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 23. Sa Trùng Hoàng Lăng
  {
    id: 'tpl_earth_3',
    templateId: 'dune_worm',
    name: 'Sa Trùng Hoàng Lăng',
    title: 'Giun Cát Sa Mạc',
    element: 'earth',
    avatar: '🌍🪱',
    hp: 90,
    maxHp: 90,
    speed: 10,
    attackPower: 18,
    defense: 10,
    passive: {
      id: 'burrow_evasion',
      name: 'Độn Thổ Sa Mạc',
      description: 'Sát thương từ quái vật có Tốc độ cao hơn mình bị giảm 20% uy lực.',
    },
    skills: [
      {
        id: 'sand_bite',
        name: 'Nhai Nuốt Cát Lún',
        element: 'earth',
        description: 'Nuốt cát gây 14 sát thương và phá hủy 6 Giáp của đối phương.',
        baseDamage: 14,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'desert_tremor',
        name: 'Chấn Động Sa Mạc',
        element: 'earth',
        description: 'Độn thổ hất tung đất cát gây 20 sát thương và tạo Vỡ Giáp (+30% ST) trong 2 lượt.',
        baseDamage: 20,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'vulnerable', duration: 2, value: 4 },
      },
      {
        id: 'abyss_sinkhole',
        name: 'Hố Tử Thần Cát Đỏ',
        element: 'earth',
        description: 'TUYỆT KỸ [1 lần/trận]: Tạo hố lún cát tử thần gây 35 sát thương, nuốt chửng một nửa lượng Giáp của kẻ địch thành sát thương trực tiếp!',
        baseDamage: 35,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 24. Hoàng Thổ Cổ Quy
  {
    id: 'tpl_earth_4',
    templateId: 'terra_tortoise',
    name: 'Hoàng Thổ Cổ Quy',
    title: 'Rùa Địa Mạch',
    element: 'earth',
    avatar: '🌍🐢',
    hp: 108,
    maxHp: 108,
    speed: 9,
    attackPower: 12,
    defense: 14,
    passive: {
      id: 'earth_nourish',
      name: 'Địa Mạch Nuôi Dưỡng',
      description: 'Mỗi khi bản thân có Giáp ảo, tự động hồi phục 4 HP vào đầu mỗi lượt.',
    },
    skills: [
      {
        id: 'gravity_press',
        name: 'Nén Trọng Lực',
        element: 'earth',
        description: 'Tạo áp suất đất đá đè bẹp gây 11 sát thương Thổ.',
        baseDamage: 11,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'mother_earth_bastion',
        name: 'Pháo Đài Đất Mẹ',
        element: 'earth',
        description: 'Ban 18 Giáp cho bản thân và 12 Giáp cho 1 đồng minh thấp máu nhất.',
        baseDamage: 0,
        targetType: 'self',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'shield', duration: 2, value: 18 },
      },
      {
        id: 'five_mountains_quake',
        name: 'Chấn Động Ngũ Nhạc',
        element: 'earth',
        description: 'TUYỆT KỸ [1 lần/trận]: Dậm chân chấn động cả 5 đỉnh núi gây 26 sát thương toàn bộ phe địch và cấp 15 Giáp cho toàn đội quân ta!',
        baseDamage: 26,
        targetType: 'all_enemies',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },

  // 25. Thạch Linh Sơn Kê
  {
    id: 'tpl_earth_5',
    templateId: 'granite_basilisk',
    name: 'Thạch Linh Sơn Kê',
    title: 'Thằn Lằn Hóa Đá',
    element: 'earth',
    avatar: '🌍🦎',
    hp: 86,
    maxHp: 86,
    speed: 12,
    attackPower: 17,
    defense: 11,
    passive: {
      id: 'petrifying_gaze',
      name: 'Ánh Mắt Hóa Đá',
      description: 'Kẻ địch tấn công trực tiếp vào có 25% cơ hội bị Tê Liệt hóa đá 1 lượt.',
    },
    skills: [
      {
        id: 'granite_scratch',
        name: 'Cào Móng Hoa Cương',
        element: 'earth',
        description: 'Cào vuốt đá sắc nhọn gây 14 sát thương.',
        baseDamage: 14,
        targetType: 'single_enemy',
        cooldown: 0,
        currentCooldown: 0,
      },
      {
        id: 'blinding_dust',
        name: 'Bụi Đá Mù Mắt',
        element: 'earth',
        description: 'Tung bụi hoa cương gây 16 sát thương và làm Suy Yếu (-30% ST) mục tiêu trong 2 lượt.',
        baseDamage: 16,
        targetType: 'single_enemy',
        cooldown: 1,
        currentCooldown: 0,
        statusEffect: { type: 'weaken', duration: 2, value: 4 },
      },
      {
        id: 'millennium_petrification',
        name: 'Hóa Đá Ngàn Năm',
        element: 'earth',
        description: 'TUYỆT KỸ [1 lần/trận]: Hóa đá toàn thân đối phương gây 30 sát thương, khiến mục tiêu nhận thêm +40% sát thương ở đòn kế tiếp!',
        baseDamage: 30,
        targetType: 'single_enemy',
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
        statusEffect: { type: 'vulnerable', duration: 2, value: 6 },
      },
    ],
    equippedRelics: [],
    statusEffects: [],
    shield: 0,
  },
];

// Helper: Roll gacha tier for starter choices:
// 90% Tier C (Common - Level 0)
// 9% Tier UC (Uncommon - Level 1)
// 1% Tier R (Rare - Level 2)
// 0% for SR, SSR, UR, MR, TR
export const rollStarterTier = (): TierLevel => {
  const rand = Math.random();
  if (rand < 0.01) return 2; // 1% Tier R (Rare)
  if (rand < 0.10) return 1; // 9% Tier UC (Uncommon)
  return 0;                  // 90% Tier C (Common)
};

// Helper: Pick random distinct starter choices for player draft with strict gacha rates
export const getRandomStarterChoices = (count: number = 6): MonsterCard[] => {
  const shuffled = [...MONSTER_TEMPLATES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(tpl => {
    const tier = rollStarterTier();
    return createMonsterInstance(tpl, undefined, tier);
  });
};

// Initial player party when a draft choice is selected (3 Lanes matching Image 1)
export const createInitialPlayerParty = (chosenMonster?: MonsterCard): (MonsterCard | null)[] => {
  const starter = chosenMonster ? { ...chosenMonster } : createMonsterInstance(MONSTER_TEMPLATES[0], undefined, 0);
  return [starter, null, null];
};

// Generate enemy team for battlefield based on floor and difficulty (3 Lanes matching Image 1)
export const generateEnemyTeam = (
  floor: number,
  isBoss: boolean = false,
  isElite: boolean = false
): (MonsterCard | null)[] => {
  const availableTemplates = [...MONSTER_TEMPLATES];

  if (isBoss) {
    // Boss battle: 3 enemies (Minion 1 in Lane 1, Boss in Center Lane 2, Minion 2 in Lane 3)
    const bossTier: TierLevel = Math.min(3, Math.max(1, Math.floor(floor / 2))) as TierLevel;
    const minionTier: TierLevel = Math.max(0, bossTier - 1) as TierLevel;

    const bossTpl = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    const boss = createMonsterInstance(bossTpl, `boss_${floor}_1`, bossTier);
    boss.name = `[TRÙM] ${boss.name}`;
    boss.hp = Math.round(boss.hp * 1.5);
    boss.maxHp = boss.hp;
    boss.attackPower = Math.round(boss.attackPower * 1.25);
    boss.shield = 20;

    const minion1 = createMonsterInstance(availableTemplates[(floor * 2) % availableTemplates.length], undefined, minionTier);
    const minion2 = createMonsterInstance(availableTemplates[(floor * 3 + 1) % availableTemplates.length], undefined, minionTier);

    return [minion1, boss, minion2];
  }

  if (isElite) {
    // Elite battle: 2-3 tough enemies
    const eliteTier: TierLevel = Math.min(2, Math.max(1, Math.floor(floor / 3))) as TierLevel;
    const elite1 = createMonsterInstance(availableTemplates[(floor * 2) % availableTemplates.length], undefined, eliteTier);
    const elite2 = createMonsterInstance(availableTemplates[(floor * 2 + 1) % availableTemplates.length], undefined, eliteTier);
    elite1.hp = Math.round(elite1.hp * 1.25);
    elite1.maxHp = elite1.hp;
    elite2.hp = Math.round(elite2.hp * 1.25);
    elite2.maxHp = elite2.hp;

    return [elite1, null, elite2];
  }

  // Regular Battle (3-lane layout):
  // Floor 1: 1 enemy in center slot (Lane 2)
  // Floor 2: 2 enemies in Lane 1 and Lane 3
  // Floor 3+: 3 enemies
  const normalTier: TierLevel = (floor >= 5 ? 1 : 0) as TierLevel;
  const enemyCount = floor === 1 ? 1 : floor < 3 ? 2 : 3;
  const team: (MonsterCard | null)[] = [null, null, null];

  const shuffled = [...availableTemplates].sort(() => 0.5 - Math.random());
  if (enemyCount === 1) {
    const enemy = createMonsterInstance(shuffled[0], `enemy_${floor}_0`, normalTier);
    enemy.hp = Math.round(enemy.hp * 0.8);
    enemy.maxHp = enemy.hp;
    team[1] = enemy; // Centered
  } else if (enemyCount === 2) {
    team[0] = createMonsterInstance(shuffled[0], `enemy_${floor}_0`, normalTier);
    team[2] = createMonsterInstance(shuffled[1], `enemy_${floor}_1`, normalTier);
  } else {
    team[0] = createMonsterInstance(shuffled[0], `enemy_${floor}_0`, normalTier);
    team[1] = createMonsterInstance(shuffled[1], `enemy_${floor}_1`, normalTier);
    team[2] = createMonsterInstance(shuffled[2], `enemy_${floor}_2`, normalTier);
  }

  return team;
};

