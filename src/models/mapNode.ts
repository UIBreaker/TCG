export type MapNodeType =
  | 'Battle'
  | 'Elite'
  | 'Shop'
  | 'Sanctuary/Forge'
  | 'Treasure Vault'
  | 'Mystery/Event';

export interface EnemyPreview {
  name: string;
  avatar: string;
  tier: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Deadly';
  element?: string;
}

export interface MapNode {
  id: string;
  type: MapNodeType;
  floor: number;
  label: string;
  nextIds: string[];
  enemyPreview?: EnemyPreview;
  completed?: boolean;
}
