import { BoardSlot } from './board';
import { Card } from './card';
import { Inventory } from './inventory';
import { MapNode } from './mapNode';

export type CombatPhase =
  | 'Mulligan_1'
  | 'Mulligan_2'
  | 'Planning'
  | 'TurnOrder'
  | 'ActionResolution'
  | 'Victory'
  | 'Defeat';

export interface GameState {
  playerBoard: BoardSlot[];
  enemyBoard: BoardSlot[];
  playerHand: Card[];
  reserveRoster: Card[];
  inventory: Inventory;
  phase: CombatPhase;
  turnCounter: number;
  recallCount: number;
  maxRecalls: number;
  currentFloor: number;
  mapNodes: MapNode[];
  currentNodeId: string | null;
}
