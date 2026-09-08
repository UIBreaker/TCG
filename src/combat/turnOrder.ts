import { BoardSlot } from '../models/board';
import { Card } from '../models/card';

export interface TurnOrderEntry {
  card: Card;
  slotIndex: number;
  row: 'frontline' | 'backline';
  col: number;
  side: 'player' | 'enemy';
}

/**
 * Builds the turn queue for a round:
 * - Sorted by Speed (computedSPD) descending.
 * - Tie-breaker: who entered the board earlier (represented by smaller slotIndex).
 */
export function buildTurnQueue(
  playerSlots: BoardSlot[],
  enemySlots: BoardSlot[]
): TurnOrderEntry[] {
  const activeEntries: TurnOrderEntry[] = [];

  playerSlots.forEach((slot) => {
    if (slot.card && slot.card.currentHP > 0) {
      activeEntries.push({
        card: slot.card,
        slotIndex: slot.slotIndex,
        row: slot.row,
        col: slot.col,
        side: 'player',
      });
    }
  });

  enemySlots.forEach((slot) => {
    if (slot.card && slot.card.currentHP > 0) {
      activeEntries.push({
        card: slot.card,
        slotIndex: slot.slotIndex,
        row: slot.row,
        col: slot.col,
        side: 'enemy',
      });
    }
  });

  return activeEntries.sort((a, b) => {
    // 1. Primary sort: Speed descending
    if (b.card.computedSPD !== a.card.computedSPD) {
      return b.card.computedSPD - a.card.computedSPD;
    }
    // 2. Tie-breaker: entered board earlier (smaller slotIndex goes first)
    return a.slotIndex - b.slotIndex;
  });
}
