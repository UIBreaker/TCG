import {
  Inventory,
  InventoryItem,
  InventoryUpdateResult,
  MAX_CONSUMABLE_SLOTS,
  MAX_CONSUMABLE_STACK,
  ConsumableStack,
} from '../models/inventory';

/**
 * Adds an item to the player inventory immutably.
 * Follows Section 7.1 & 7.2:
 * - Resources (Gold, Keys) are unlimited.
 * - Relics fall into RelicBag (unassigned, unlimited).
 * - Consumables: Max 8 slots, max 4 per stack.
 * - If slots are full and cannot stack into an existing slot, returns CONSUMABLE_FULL.
 */
export function addToInventory(
  inventory: Inventory,
  item: InventoryItem
): InventoryUpdateResult {
  if (item.type === 'gold') {
    return {
      success: true,
      inventory: {
        ...inventory,
        gold: inventory.gold + item.amount,
      },
    };
  }

  if (item.type === 'key') {
    return {
      success: true,
      inventory: {
        ...inventory,
        keys: inventory.keys + item.amount,
      },
    };
  }

  if (item.type === 'relic') {
    return {
      success: true,
      inventory: {
        ...inventory,
        relicBag: [...inventory.relicBag, item.instance],
      },
    };
  }

  // item.type === 'consumable'
  const newStack = item.stack;
  let remainingToAdd = newStack.quantity;
  const currentSlots = [...inventory.consumableSlots];

  // 1. Attempt to merge into existing stacks of same itemId that have space (< 4)
  for (let i = 0; i < currentSlots.length; i++) {
    if (currentSlots[i].itemId === newStack.itemId && currentSlots[i].quantity < MAX_CONSUMABLE_STACK) {
      const space = MAX_CONSUMABLE_STACK - currentSlots[i].quantity;
      const addAmount = Math.min(space, remainingToAdd);
      currentSlots[i] = {
        ...currentSlots[i],
        quantity: currentSlots[i].quantity + addAmount,
      };
      remainingToAdd -= addAmount;
      if (remainingToAdd <= 0) break;
    }
  }

  // 2. If nothing left to add, return success
  if (remainingToAdd <= 0) {
    return {
      success: true,
      inventory: {
        ...inventory,
        consumableSlots: currentSlots,
      },
    };
  }

  // 3. Need new slot(s) for the remainder
  while (remainingToAdd > 0) {
    if (currentSlots.length >= MAX_CONSUMABLE_SLOTS) {
      // Consumable bag is full!
      return {
        success: false,
        reason: 'CONSUMABLE_FULL',
      };
    }

    const takeAmount = Math.min(MAX_CONSUMABLE_STACK, remainingToAdd);
    currentSlots.push({
      ...newStack,
      quantity: takeAmount,
    });
    remainingToAdd -= takeAmount;
  }

  return {
    success: true,
    inventory: {
      ...inventory,
      consumableSlots: currentSlots,
    },
  };
}

/**
 * Removes a consumable from inventory when used.
 */
export function consumeItem(
  inventory: Inventory,
  slotIndex: number
): { success: boolean; inventory: Inventory; consumedItem?: ConsumableStack } {
  if (slotIndex < 0 || slotIndex >= inventory.consumableSlots.length) {
    return { success: false, inventory };
  }

  const slots = [...inventory.consumableSlots];
  const target = slots[slotIndex];

  if (target.quantity > 1) {
    slots[slotIndex] = { ...target, quantity: target.quantity - 1 };
  } else {
    slots.splice(slotIndex, 1);
  }

  return {
    success: true,
    inventory: {
      ...inventory,
      consumableSlots: slots,
    },
    consumedItem: target,
  };
}
