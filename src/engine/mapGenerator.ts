import { MapNode } from '../types/game';

export interface DarkContinentMapStructure {
  nodes: MapNode[];
  totalFloors: number;
  mapLoop: number;
}

/**
 * Sinh bản đồ Lục Địa Đen (Hunter x Hunter Dark Continent) đa dạng nhánh rẽ phong phú (Slay the Spire / Roguelike DAG)
 * Hỗ trợ mapLoop vô tận (Vòng 1, 2, 3...) với 5 Đại Tai Ương (Brion, Hellbell, Pap, Zobae, Ai)
 */
export const generateDarkContinentMap = (mapLoop: number = 1): MapNode[] => {
  const nodes: MapNode[] = [];

  const tierSuffix = mapLoop >= 3 ? '[SSR]' : mapLoop >= 2 ? '[SR]' : '[C]';
  const bossTier = mapLoop >= 4 ? 'TR' : mapLoop >= 3 ? 'MR' : mapLoop >= 2 ? 'UR' : 'SSR';

  // ================= FLOOR 1: BỜ BIỂN MOBIUS & CỔNG RANH GIỚI (3 Khởi Đầu Đa Dạng) =================
  const f1: MapNode[] = [
    {
      id: 'f1_n0',
      type: 'battle',
      name: 'Cổng Ranh Giới Gatekeeper',
      icon: 'Swords',
      floor: 1,
      columnIndex: 0,
      connectedTo: ['f2_n0', 'f2_n1'],
      cleared: false,
      available: true,
      previewEnemy: {
        name: `Hỏa Miêu Biến Dị ${tierSuffix}`,
        avatar: '🔥🐱',
        element: 'fire',
        tier: mapLoop >= 2 ? 'R' : 'C',
        difficulty: 'Dễ',
        threatNote: 'Lính gác cổng ranh giới hệ Hỏa. Sử dụng quái thú hệ Thủy để nhận +35% sát thương Ngũ Khắc!',
        expectedMonsters: [`Hỏa Miêu Hắc Ám ${tierSuffix}`],
      },
    },
    {
      id: 'f1_n1',
      type: 'battle',
      name: 'Bờ Biển Vô Tận Mobius',
      icon: 'Swords',
      floor: 1,
      columnIndex: 1,
      connectedTo: ['f2_n1', 'f2_n2'],
      cleared: false,
      available: true,
      previewEnemy: {
        name: `Mầm Mộc Tinh Cổ Sinh ${tierSuffix}`,
        avatar: '🌿🌱',
        element: 'nature',
        tier: mapLoop >= 2 ? 'R' : 'C',
        difficulty: 'Dễ',
        threatNote: 'Thực vật ven biển có khả năng quang hợp hồi máu. Khắc chế bằng quái thú hệ Hỏa!',
        expectedMonsters: [`Mầm Cổ Sinh ${tierSuffix}`],
      },
    },
    {
      id: 'f1_n2',
      type: 'battle',
      name: 'Thềm Cổ Rạn San Hô Đen',
      icon: 'Swords',
      floor: 1,
      columnIndex: 2,
      connectedTo: ['f2_n2', 'f2_n3'],
      cleared: false,
      available: true,
      previewEnemy: {
        name: `Thạch Quy Hộ Vệ ${tierSuffix}`,
        avatar: '🌍🐢',
        element: 'earth',
        tier: mapLoop >= 2 ? 'SR' : 'UC',
        difficulty: 'Dễ',
        threatNote: 'Dị thú mang mai đá ngàn năm với lớp Giáp ảo dày đặc. Cần quái thú có ATK cao để xuyên giáp!',
        expectedMonsters: [`Thạch Giáp Quy Cổ ${tierSuffix}`],
      },
    },
  ];

  // ================= FLOOR 2: VÙNG RÌA LỤC ĐỊA ĐEN (4 Nhánh Rẽ Phong Phú) =================
  const f2: MapNode[] = [
    {
      id: 'f2_n0',
      type: 'event',
      name: 'Di Tích Cổ Nhân Hunter',
      icon: 'HelpCircle',
      floor: 2,
      columnIndex: 0,
      connectedTo: ['f3_n0', 'f3_n1'],
      cleared: false,
      available: false,
    },
    {
      id: 'f2_n1',
      type: 'battle',
      name: 'Đầm Lầy Sương Độc Dị Thú',
      icon: 'Swords',
      floor: 2,
      columnIndex: 1,
      connectedTo: ['f3_n0', 'f3_n1', 'f3_n2'],
      cleared: false,
      available: false,
      previewEnemy: {
        name: `Song Quái Thủy Mộc Vực Sâu`,
        avatar: '💧🐍',
        element: 'water',
        tier: mapLoop >= 2 ? 'SR' : 'UC',
        difficulty: 'Trung Bình',
        threatNote: 'Quái thú đầm lầy tiết ra chất nhờn gây Độc và Làm Chậm. Ưu tiên tiêu diệt nhanh!',
        expectedMonsters: ['Thủy Xà Biến Dị [UC]', 'Mầm Mộc Tinh Dại [C]'],
      },
    },
    {
      id: 'f2_n2',
      type: 'event',
      name: 'Vết Nứt Niệm Lực Khởi Nguyên',
      icon: 'HelpCircle',
      floor: 2,
      columnIndex: 2,
      connectedTo: ['f3_n1', 'f3_n2'],
      cleared: false,
      available: false,
    },
    {
      id: 'f2_n3',
      type: 'battle',
      name: 'Hang Động Lôi Thạch Cổ',
      icon: 'Swords',
      floor: 2,
      columnIndex: 3,
      connectedTo: ['f3_n2'],
      cleared: false,
      available: false,
      previewEnemy: {
        name: 'Lôi Dơi Dạ Hành',
        avatar: '⚡🦇',
        element: 'thunder',
        tier: mapLoop >= 2 ? 'SR' : 'UC',
        difficulty: 'Trung Bình',
        threatNote: 'Lũ dơi tích điện trong hang tối, có SPD cao và đòn tấn công Tê Liệt. Sử dụng hệ Thổ để kháng cự!',
        expectedMonsters: ['Lôi Điểu Bão Táp [R]'],
      },
    },
  ];

  // ================= FLOOR 3: DI TÍCH TẾ ĐÀN & LÒ RÈN SANCTUARY =================
  const f3: MapNode[] = [
    {
      id: 'f3_n0',
      type: 'sanctuary',
      name: 'Bàn Thờ Niệm Cổ Sanctuary',
      icon: 'Anvil',
      floor: 3,
      columnIndex: 0,
      connectedTo: ['f4_n0', 'f4_n1'],
      cleared: false,
      available: false,
    },
    {
      id: 'f3_n1',
      type: 'battle',
      name: 'Vườn Ươm Thực Vật Tai Ương',
      icon: 'Swords',
      floor: 3,
      columnIndex: 1,
      connectedTo: ['f4_n1', 'f4_n2'],
      cleared: false,
      available: false,
      previewEnemy: {
        name: 'Thực Vật Ký Sinh Lục Địa Đen',
        avatar: '🌿🥀',
        element: 'nature',
        tier: mapLoop >= 2 ? 'SSR' : 'R',
        difficulty: 'Trung Bình',
        threatNote: 'Chi nhánh của Đại Tai Ương Brion, rễ cây có khả năng trói chân và phản đòn gai nhọn!',
        expectedMonsters: ['Mộc Tinh Viễn Cổ [R]', 'Hỏa Miêu Trợ Chiến [C]'],
      },
    },
    {
      id: 'f3_n2',
      type: 'event',
      name: 'Kim Tự Tháp Tàn Tích Hunter',
      icon: 'HelpCircle',
      floor: 3,
      columnIndex: 2,
      connectedTo: ['f4_n2', 'f4_n3'],
      cleared: false,
      available: false,
    },
  ];

  // ================= FLOOR 4: TRẠM TIẾP TẾ & MẬT THẤT RƯƠNG CỔ (4 Nhánh Rẽ) =================
  const f4: MapNode[] = [
    {
      id: 'f4_n0',
      type: 'shop',
      name: 'Trạm Tiếp Tế Hiệp Hội Hunter',
      icon: 'ShoppingBag',
      floor: 4,
      columnIndex: 0,
      connectedTo: ['f5_n0', 'f5_n1'],
      cleared: false,
      available: false,
    },
    {
      id: 'f4_n1',
      type: 'vault',
      name: 'Mật Thất Rương Cổ Mobius',
      icon: 'Key',
      floor: 4,
      columnIndex: 1,
      connectedTo: ['f5_n0', 'f5_n1'],
      cleared: false,
      available: false,
    },
    {
      id: 'f4_n2',
      type: 'shop',
      name: 'Thương Điếm Dị Giới Cổ Đại',
      icon: 'ShoppingBag',
      floor: 4,
      columnIndex: 2,
      connectedTo: ['f5_n1', 'f5_n2'],
      cleared: false,
      available: false,
    },
    {
      id: 'f4_n3',
      type: 'vault',
      name: 'Hầm Báu Di Tích Viễn Cổ',
      icon: 'Key',
      floor: 4,
      columnIndex: 3,
      connectedTo: ['f5_n1', 'f5_n2'],
      cleared: false,
      available: false,
    },
  ];

  // ================= FLOOR 5: KHU VỰC QUÁI TINH ANH BIẾN DỊ (Elite Calamities) =================
  const f5: MapNode[] = [
    {
      id: 'f5_n0',
      type: 'elite',
      name: 'Vương Giả Sừng Gai Biến Dị',
      icon: 'Skull',
      floor: 5,
      columnIndex: 0,
      connectedTo: ['f6_n0', 'f6_n1'],
      cleared: false,
      available: false,
      previewEnemy: {
        name: `Hỏa Lang Vương Lục Địa Đen [ELITE]`,
        avatar: '🔥🐺',
        element: 'fire',
        tier: mapLoop >= 2 ? 'SSR' : 'SR',
        difficulty: 'Nguy Hiểm',
        threatNote: 'Dị thú cấp Tinh Anh sở hữu Đòn Đánh Lan và Nộ Cuồng Sát! Thưởng Rương Cổ, Chìa Khóa và Cổ Vật.',
        expectedMonsters: ['[ELITE] Hỏa Lang Vương [SR]', 'Hỏa Miêu Cấm Vệ [C]'],
        isElite: true,
      },
    },
    {
      id: 'f5_n1',
      type: 'sanctuary',
      name: 'Lò Luyện Niệm Lực Thượng Cổ',
      icon: 'Anvil',
      floor: 5,
      columnIndex: 1,
      connectedTo: ['f6_n0', 'f6_n1', 'f6_n2'],
      cleared: false,
      available: false,
    },
    {
      id: 'f5_n2',
      type: 'elite',
      name: 'Quái Dị Chủng Chimera Cấp B+',
      icon: 'Skull',
      floor: 5,
      columnIndex: 2,
      connectedTo: ['f6_n1', 'f6_n2'],
      cleared: false,
      available: false,
      previewEnemy: {
        name: `Lôi Điểu Chúa Biến Dị [ELITE]`,
        avatar: '⚡🦅',
        element: 'thunder',
        tier: mapLoop >= 2 ? 'SSR' : 'SR',
        difficulty: 'Nguy Hiểm',
        threatNote: 'Chimera biến dị tốc độ cực cao, phóng bão sét gây sát thương chuỗi. Khuyên dùng quái thú hệ Thổ!',
        expectedMonsters: ['[ELITE] Lôi Điểu Chúa [SR]', 'Thạch Giáp Hộ Tùng [UC]'],
        isElite: true,
      },
    },
  ];

  // ================= FLOOR 6: TRẠM NGHỈ CHÂN & RƯƠNG HOÀNG KIM =================
  const f6: MapNode[] = [
    {
      id: 'f6_n0',
      type: 'rest',
      name: 'Suối Nguồn Sinh Mệnh Khởi Nguyên',
      icon: 'Heart',
      floor: 6,
      columnIndex: 0,
      connectedTo: ['f7_boss'],
      cleared: false,
      available: false,
    },
    {
      id: 'f6_n1',
      type: 'vault',
      name: 'Mật Thất Rương Hoàng Kim Lục Địa Đen',
      icon: 'Key',
      floor: 6,
      columnIndex: 1,
      connectedTo: ['f7_boss'],
      cleared: false,
      available: false,
    },
    {
      id: 'f6_n2',
      type: 'rest',
      name: 'Cây Cổ Thụ Tịnh Hóa Hunter',
      icon: 'Heart',
      floor: 6,
      columnIndex: 2,
      connectedTo: ['f7_boss'],
      cleared: false,
      available: false,
    },
  ];

  // ================= FLOOR 7: TAI ƯƠNG LỤC ĐỊA ĐEN (HUNTER X HUNTER BOSS OVERLORD) =================
  let bossName = 'Đại Tai Ương BRION - Vũ Khí Sống Thực Vật';
  let bossAvatar = '👑🌿';
  let bossElement: 'fire' | 'water' | 'nature' | 'thunder' | 'earth' = 'nature';
  let bossThreat = 'Một trong 5 Đại Tai Ương của Lục Địa Đen! Sở hữu thân thể thực vật bất hoại và đòn quất rễ hủy diệt.';
  let bossMonsters = ['[TRÙM] Tai Ương Brion [SSR]', 'Mầm Mộc Tinh Viễn Cổ [R]', 'Hộ Vệ Dị Chủng [R]'];

  if (mapLoop === 2) {
    bossName = 'Đại Tai Ương HELLBELL - Song Vĩ Xà Điên Loạn';
    bossAvatar = '👑🐍';
    bossElement = 'water';
    bossThreat = 'Đại Tai Ương Rắn Chuông Hai Đuôi gieo rắc chứng cuồng sát và độc tố ăn mòn toàn đội hình!';
    bossMonsters = ['[TRÙM] Song Vĩ Xà Hellbell [UR]', 'Thủy Xà Biến Dị [SR]', 'Hộ Vệ Viêm Linh [R]'];
  } else if (mapLoop === 3) {
    bossName = 'Đại Tai Ương PAP - Dị Thú Nuôi Dưỡng Khoái Lạc';
    bossAvatar = '👑👁️';
    bossElement = 'earth';
    bossThreat = 'Đại Tai Ương thao túng tinh thần, tạo ảo ảnh và hút kiệt sinh lực đồng minh. Cần bộc phát dứt điểm nhanh!';
    bossMonsters = ['[TRÙM] Quái Thú Pap [MR]', 'Thạch Giáp Quy Chúa [SR]', 'Cấm Vệ Núi Lửa [SR]'];
  } else if (mapLoop >= 4) {
    bossName = 'Đại Tai Ương ZOBAE & KHÍ GAS AI - Bệnh Dịch Bất Tử';
    bossAvatar = '👑💀';
    bossElement = 'fire';
    bossThreat = 'Mầm bệnh bất tử cổ đại kết hợp sinh thể sương mù AI! Sát thương tột đỉnh, thách thức giới hạn của mọi Hunter!';
    bossMonsters = ['[TRÙM] Hắc Ám Zobae [TR]', 'Khí Thể Ai Hộ Thể [SSR]', 'Dị Chủng Hắc Hóa [SSR]'];
  }

  const f7: MapNode[] = [
    {
      id: 'f7_boss',
      type: 'boss',
      name: `Vực Sâu Tai Ương (Bản Đồ ${mapLoop})`,
      icon: 'Crown',
      floor: 7,
      columnIndex: 0,
      connectedTo: [],
      cleared: false,
      available: false,
      previewEnemy: {
        name: `${bossName} [VÒNG ${mapLoop}]`,
        avatar: bossAvatar,
        element: bossElement,
        tier: bossTier as any,
        difficulty: 'Tử Địa',
        threatNote: bossThreat,
        expectedMonsters: bossMonsters,
        isBoss: true,
      },
    },
  ];

  nodes.push(...f1, ...f2, ...f3, ...f4, ...f5, ...f6, ...f7);
  return nodes;
};

/**
 * Backward compatibility helper for existing code and tests
 */
export const generateForestMap = (): MapNode[] => {
  return generateDarkContinentMap(1);
};

/**
 * Cập nhật trạng thái các node khi người chơi hoàn thành 1 node
 */
export const advanceMapNode = (nodes: MapNode[], completedNodeId: string): MapNode[] => {
  const completed = nodes.find(n => n.id === completedNodeId);
  if (!completed) return nodes;

  return nodes.map(node => {
    if (node.id === completedNodeId) {
      return { ...node, cleared: true, available: false };
    }
    // Set next connected nodes as available
    if (completed.connectedTo.includes(node.id)) {
      return { ...node, available: true };
    }
    // Nodes on other paths at same floor become locked
    if (node.floor <= completed.floor) {
      return { ...node, available: false };
    }
    return node;
  });
};
