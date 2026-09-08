import { RelicInstance } from './relic';

export const MAX_CONSUMABLE_SLOTS = 8;
export const MAX_CONSUMABLE_STACK = 4;
export const MAX_RELIC_SLOTS_PER_CARD = 10;
export const MAX_RELIC_STACK = 5;

export interface ConsumableStack {
  itemId: string;
  name: string;
  quantity: number;
  baseBuyPrice: number;
  description?: string;
  targetType?: 'card' | 'chest' | 'global';
}

export interface Inventory {
  gold: number;
  keys: number;
  consumableSlots: ConsumableStack[];
  relicBag: RelicInstance[];
}

export type InventoryItem =
  | { type: 'consumable'; stack: ConsumableStack }
  | { type: 'relic'; instance: RelicInstance }
  | { type: 'gold'; amount: number }
  | { type: 'key'; amount: number };

export type InventoryUpdateResult =
  | { success: true; inventory: Inventory }
  | { success: false; reason: 'CONSUMABLE_FULL' };
