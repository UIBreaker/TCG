import { Card } from '../models/card';
import { RelicInstance, RelicStack } from '../models/relic';
import { MAX_RELIC_SLOTS_PER_CARD, MAX_RELIC_STACK } from '../models/inventory';

export type EquipResult =
  | { success: true; card: Card }
  | { success: false; reason: 'MAX_STACK_REACHED' | 'MAX_SLOTS_REACHED' };

export interface UnequipResult {
  success: boolean;
  card: Card;
  returnedInstances: RelicInstance[];
  reason?: string;
}

/**
 * Equips a RelicInstance from the Relic Bag onto a specific Card.
 * Rules:
 * - Each card has at most 10 unique relic slots.
 * - Same relic stacks up to 5 times in a single slot.
 * - Stacking on an existing relic does NOT use an additional slot.
 */
export function equipRelicToCard(
  card: Card,
  relicInstance: RelicInstance
): EquipResult {
  const existingIndex = card.equippedRelics.findIndex(
    (r) => r.relicId === relicInstance.relicId
  );

  if (existingIndex !== -1) {
    // Already equipped: attempt to stack
    const currentStack = card.equippedRelics[existingIndex];
    if (currentStack.stackCount >= MAX_RELIC_STACK) {
      return { success: false, reason: 'MAX_STACK_REACHED' };
    }

    const updatedRelics = [...card.equippedRelics];
    updatedRelics[existingIndex] = {
      ...currentStack,
      stackCount: currentStack.stackCount + 1,
    };

    return {
      success: true,
      card: {
        ...card,
        equippedRelics: updatedRelics,
        relicSlotsUsed: updatedRelics.length,
      },
    };
  }

  // Not yet equipped: check slot capacity
  if (card.equippedRelics.length >= MAX_RELIC_SLOTS_PER_CARD) {
    return { success: false, reason: 'MAX_SLOTS_REACHED' };
  }

  const newRelicStack: RelicStack = {
    relicId: relicInstance.relicId,
    stackCount: 1,
  };

  const updatedRelics = [...card.equippedRelics, newRelicStack];

  return {
    success: true,
    card: {
      ...card,
      equippedRelics: updatedRelics,
      relicSlotsUsed: updatedRelics.length,
    },
  };
}

/**
 * Unequips a relic from a card and returns instances to be placed back in the Relic Bag.
 * CRITICAL RULE: Unequipping is strictly forbidden during combat (inCombat === true)!
 */
export function unequipRelicFromCard(
  card: Card,
  relicId: string,
  amount: number = 1,
  inCombat: boolean = false
): UnequipResult {
  if (inCombat) {
    return {
      success: false,
      card,
      returnedInstances: [],
      reason: 'CANNOT_UNEQUIP_IN_COMBAT',
    };
  }

  const existingIndex = card.equippedRelics.findIndex((r) => r.relicId === relicId);
  if (existingIndex === -1) {
    return {
      success: false,
      card,
      returnedInstances: [],
      reason: 'RELIC_NOT_EQUIPPED',
    };
  }

  const currentStack = card.equippedRelics[existingIndex];
  const removeCount = Math.min(currentStack.stackCount, Math.max(1, amount));
  const remainingCount = currentStack.stackCount - removeCount;

  const updatedRelics = [...card.equippedRelics];
  if (remainingCount > 0) {
    updatedRelics[existingIndex] = {
      ...currentStack,
      stackCount: remainingCount,
    };
  } else {
    updatedRelics.splice(existingIndex, 1);
  }

  // Create returned relic instances
  const returnedInstances: RelicInstance[] = Array.from({ length: removeCount }, () => ({
    relicId,
    effectCategory: 'general',
    name: relicId,
    description: `Unequipped ${relicId}`,
    baseEffect: 1,
  }));

  return {
    success: true,
    card: {
      ...card,
      equippedRelics: updatedRelics,
      relicSlotsUsed: updatedRelics.length,
    },
    returnedInstances,
  };
}
