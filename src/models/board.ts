import { Card } from './card';

export type BoardRow = 'frontline' | 'backline';
export type BoardCol = 0 | 1 | 2;

export interface BoardSlot {
  row: BoardRow;
  col: BoardCol;
  card: Card | null;
  slotIndex: number;
}

export type BoardGrid = BoardSlot[];

export function createEmptyBoard(): BoardGrid {
  const slots: BoardSlot[] = [];
  let slotIndex = 0;
  // Frontline: cols 0, 1, 2
  for (let col = 0; col < 3; col++) {
    slots.push({ row: 'frontline', col: col as BoardCol, card: null, slotIndex: slotIndex++ });
  }
  // Backline: cols 0, 1, 2
  for (let col = 0; col < 3; col++) {
    slots.push({ row: 'backline', col: col as BoardCol, card: null, slotIndex: slotIndex++ });
  }
  return slots;
}
