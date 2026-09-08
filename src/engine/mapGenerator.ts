import { MapNode, NodeType } from '../types/game';

export interface ForestMapStructure {
  nodes: MapNode[];
  totalFloors: number;
}

/**
 * Sinh bản đồ cánh rừng hoang dạng nhánh (Slay the Spire / Inscryption style)
 */
export const generateForestMap = (): MapNode[] => {
  const nodes: MapNode[] = [];

  // Floor 1: 3 Starting battle nodes with detailed previews
  const f1: MapNode[] = [
    {
      id: 'f1_n0',
      type: 'battle',
      name: 'Rìa Rừng Gai',
      icon: 'Swords',
      floor: 1,
      columnIndex: 0,
      connectedTo: ['f2_n0', 'f2_n1'],
      cleared: false,
      available: true,
      previewEnemy: {
        name: 'Hỏa Miêu Bộc Hỏa',
        avatar: '🔥🐱',
        element: 'fire',
        tier: 'C',
        difficulty: 'Dễ',
        threatNote: 'Kẻ địch đơn lẻ hệ Hỏa. Sử dụng quái thú hệ Thủy để nhận +35% sát thương Ngũ Khắc!',
        expectedMonsters: ['Hỏa Miêu Bốc Lửa [C]'],
      },
    },
    {
      id: 'f1_n1',
      type: 'battle',
      name: 'Bụi Rậm Ma Quái',
      icon: 'Swords',
      floor: 1,
      columnIndex: 1,
      connectedTo: ['f2_n1', 'f2_n2'],
      cleared: false,
      available: true,
      previewEnemy: {
        name: 'Mầm Mộc Tinh Dại',
        avatar: '🌿🌱',
        element: 'nature',
        tier: 'C',
        difficulty: 'Dễ',
        threatNote: 'Linh thú hệ Mộc có khả năng tự hồi máu. Dùng đòn tấn công hệ Hỏa để khắc chế triệt để!',
        expectedMonsters: ['Mầm Mộc Tinh [C]'],
      },
    },
    {
      id: 'f1_n2',
      type: 'battle',
      name: 'Lối Mòn Cổ Thạch',
      icon: 'Swords',
      floor: 1,
      columnIndex: 2,
      connectedTo: ['f2_n2'],
      cleared: false,
      available: true,
      previewEnemy: {
        name: 'Thạch Giáp Quy Cổ',
        avatar: '🌍🐢',
        element: 'earth',
        tier: 'UC',
        difficulty: 'Dễ',
        threatNote: 'Kẻ địch hệ Thổ sở hữu Giáp cứng cáp. Hãy dùng quái thú có ATK cao để xuyên giáp!',
        expectedMonsters: ['Thạch Giáp Quy [UC]'],
      },
    },
  ];

  // Floor 2: Events & Battles
  const f2: MapNode[] = [
    {
      id: 'f2_n0',
      type: 'event',
      name: 'Bàn Thờ Cổ Tự',
      icon: 'HelpCircle',
      floor: 2,
      columnIndex: 0,
      connectedTo: ['f3_n0'],
      cleared: false,
      available: false,
    },
    {
      id: 'f2_n1',
      type: 'battle',
      name: 'Đầm Lầy Sương Độc',
      icon: 'Swords',
      floor: 2,
      columnIndex: 1,
      connectedTo: ['f3_n0', 'f3_n1'],
      cleared: false,
      available: false,
      previewEnemy: {
        name: 'Song Quái Thủy Mộc',
        avatar: '💧🐍',
        element: 'water',
        tier: 'UC',
        difficulty: 'Trung Bình',
        threatNote: 'Toán địch 2 quái có hiệu ứng Độc tố tích lũy và làm chậm. Khuyên dùng quái thú tốc độ cao!',
        expectedMonsters: ['Thủy Xà Sương Mù [UC]', 'Mầm Mộc Tinh [C]'],
      },
    },
    {
      id: 'f2_n2',
      type: 'event',
      name: 'Gốc Cây Nguyện Ước',
      icon: 'HelpCircle',
      floor: 2,
      columnIndex: 2,
      connectedTo: ['f3_n1'],
      cleared: false,
      available: false,
    },
  ];

  // Floor 3: Sanctuary / Forge (Fusion & Relic Merge) & Battles
  const f3: MapNode[] = [
    {
      id: 'f3_n0',
      type: 'sanctuary',
      name: 'Lò Rèn Sanctuary',
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
      name: 'Hang Dơi Lôi Điện',
      icon: 'Swords',
      floor: 3,
      columnIndex: 1,
      connectedTo: ['f4_n1'],
      cleared: false,
      available: false,
      previewEnemy: {
        name: 'Lôi Điểu Bão Táp',
        avatar: '⚡🦅',
        element: 'thunder',
        tier: 'R',
        difficulty: 'Trung Bình',
        threatNote: 'Kẻ địch hệ Lôi có SPD cao và đòn tấn công tê liệt. Sử dụng quái thú Thổ để khắc chế (-25% ST nhận)!',
        expectedMonsters: ['Lôi Điểu Bão Táp [R]', 'Hỏa Miêu [C]'],
      },
    },
  ];

  // Floor 4: Merchant Shop & Treasure Vault (Rương Cổ Đại)
  const f4: MapNode[] = [
    {
      id: 'f4_n0',
      type: 'shop',
      name: 'Thương Điếm Yêu Tinh',
      icon: 'ShoppingBag',
      floor: 4,
      columnIndex: 0,
      connectedTo: ['f5_n0'],
      cleared: false,
      available: false,
    },
    {
      id: 'f4_n1',
      type: 'vault',
      name: 'Kho Báu Rương Cổ',
      icon: 'Key',
      floor: 4,
      columnIndex: 1,
      connectedTo: ['f5_n0', 'f5_n1'],
      cleared: false,
      available: false,
    },
  ];

  // Floor 5: Elite Beasts & Sanctuary Forge
  const f5: MapNode[] = [
    {
      id: 'f5_n0',
      type: 'elite',
      name: 'Thủ Lĩnh Dã Thú Sừng Gai',
      icon: 'Skull',
      floor: 5,
      columnIndex: 0,
      connectedTo: ['f6_n0'],
      cleared: false,
      available: false,
      previewEnemy: {
        name: 'Hỏa Lang Vương Cổ [ELITE]',
        avatar: '🔥🐺',
        element: 'fire',
        tier: 'SR',
        difficulty: 'Nguy Hiểm',
        threatNote: 'Quái Tinh Anh sở hữu Đòn Đánh Lan và Nộ bộc phát! Rơi Chìa Khóa Cổ Đại và Cổ Vật chỉ số phẳng.',
        expectedMonsters: ['[ELITE] Hỏa Lang Vương [SR]', 'Hỏa Miêu Trợ Chiến [C]'],
        isElite: true,
      },
    },
    {
      id: 'f5_n1',
      type: 'sanctuary',
      name: 'Bàn Thờ Tế Thần Cổ',
      icon: 'Anvil',
      floor: 5,
      columnIndex: 1,
      connectedTo: ['f6_n0', 'f6_n1'],
      cleared: false,
      available: false,
    },
  ];

  // Floor 6: Ancient Rest & Treasure Vault
  const f6: MapNode[] = [
    {
      id: 'f6_n0',
      type: 'rest',
      name: 'Suối Tiên Thần Bí',
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
      name: 'Mật Thất Rương Hoàng Kim',
      icon: 'Key',
      floor: 6,
      columnIndex: 1,
      connectedTo: ['f7_boss'],
      cleared: false,
      available: false,
    },
  ];

  // Floor 7: Boss Overlord
  const f7: MapNode[] = [
    {
      id: 'f7_boss',
      type: 'boss',
      name: 'Đỉnh Cổ Long Thần Bí',
      icon: 'Crown',
      floor: 7,
      columnIndex: 0,
      connectedTo: [],
      cleared: false,
      available: false,
      previewEnemy: {
        name: 'Hoàng Đế Rồng Lửa Viễn Cổ [TRÙM]',
        avatar: '👑🐉',
        element: 'fire',
        tier: 'SSR',
        difficulty: 'Tử Địa',
        threatNote: 'Trùm tối thượng sở hữu Tuyệt Kỹ thiêu rụi toàn sân đấu! Cần chuẩn bị Giáp dày và tích Nộ trước khi giao chiến.',
        expectedMonsters: ['[TRÙM] Viễn Cổ Long Vương [SSR]', 'Cấm Vệ Núi Lửa [R]', 'Hộ Vệ Viêm Linh [R]'],
        isBoss: true,
      },
    },
  ];

  nodes.push(...f1, ...f2, ...f3, ...f4, ...f5, ...f6, ...f7);
  return nodes;
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
