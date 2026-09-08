import { Inventory } from '../models/inventory';

/**
 * Sells a consumable stack from inventory at the shop for 50% of baseBuyPrice.
 * Provides an outlet when consumable bag is full.
 */
export function sellConsumable(
  inventory: Inventory,
  slotIndex: number
): { inventory: Inventory; goldGained: number } {
  if (slotIndex < 0 || slotIndex >= inventory.consumableSlots.length) {
    return { inventory, goldGained: 0 };
  }

  const slots = [...inventory.consumableSlots];
  const target = slots[slotIndex];

  // 50% of unit price * quantity
  const unitSellPrice = Math.max(1, Math.floor(target.baseBuyPrice * 0.5));
  const goldGained = unitSellPrice * target.quantity;

  // Remove the sold stack from consumable slots
  slots.splice(slotIndex, 1);

  return {
    inventory: {
      ...inventory,
      gold: inventory.gold + goldGained,
      consumableSlots: slots,
    },
    goldGained,
  };
}
