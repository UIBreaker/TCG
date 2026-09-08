import { describe, it, expect } from 'vitest';
import { addToInventory, consumeItem } from '../inventory/inventoryManager';
import { sellConsumable } from '../inventory/shopSell';
import { Inventory, ConsumableStack } from '../models/inventory';

describe('Inventory Manager', () => {
  const emptyInventory: Inventory = {
    gold: 50,
    keys: 1,
    consumableSlots: [],
    relicBag: [],
  };

  const sampleConsumable: ConsumableStack = {
    itemId: 'heal_potion',
    name: 'Bình Hồi Máu',
    quantity: 2,
    baseBuyPrice: 20,
  };

  it('adds gold and keys without occupying consumable slots', () => {
    let inv = emptyInventory;
    const resGold = addToInventory(inv, { type: 'gold', amount: 30 });
    expect(resGold.success).toBe(true);
    if (resGold.success) inv = resGold.inventory;
    expect(inv.gold).toBe(80);

    const resKey = addToInventory(inv, { type: 'key', amount: 2 });
    expect(resKey.success).toBe(true);
    if (resKey.success) inv = resKey.inventory;
    expect(inv.keys).toBe(3);
    expect(inv.consumableSlots.length).toBe(0);
  });

  it('stacks same item into existing slot up to max 4 per slot', () => {
    let inv = emptyInventory;

    // Add 2
    const res1 = addToInventory(inv, { type: 'consumable', stack: sampleConsumable });
    expect(res1.success).toBe(true);
    if (res1.success) inv = res1.inventory;
    expect(inv.consumableSlots.length).toBe(1);
    expect(inv.consumableSlots[0].quantity).toBe(2);

    // Add 3 more of same item -> 2 + 3 = 5 -> slot 1 has 4 (max), slot 2 has 1
    const res2 = addToInventory(inv, { type: 'consumable', stack: { ...sampleConsumable, quantity: 3 } });
    expect(res2.success).toBe(true);
    if (res2.success) inv = res2.inventory;
    expect(inv.consumableSlots.length).toBe(2);
    expect(inv.consumableSlots[0].quantity).toBe(4);
    expect(inv.consumableSlots[1].quantity).toBe(1);
  });

  it('returns CONSUMABLE_FULL when all 8 slots are full and cannot stack', () => {
    // Fill all 8 slots with distinct items
    const fullSlots: ConsumableStack[] = Array.from({ length: 8 }, (_, i) => ({
      itemId: `item_${i}`,
      name: `Item ${i}`,
      quantity: 4,
      baseBuyPrice: 10,
    }));

    const fullInv: Inventory = {
      ...emptyInventory,
      consumableSlots: fullSlots,
    };

    const res = addToInventory(fullInv, {
      type: 'consumable',
      stack: { itemId: 'new_item_9', name: 'Item 9', quantity: 1, baseBuyPrice: 10 },
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.reason).toBe('CONSUMABLE_FULL');
    }
  });

  it('sells consumable for 50% baseBuyPrice and adds gold', () => {
    const inv: Inventory = {
      ...emptyInventory,
      gold: 10,
      consumableSlots: [
        { itemId: 'potion', name: 'Potion', quantity: 2, baseBuyPrice: 40 }, // 50% = 20 * 2 = 40G
      ],
    };

    const { inventory: updatedInv, goldGained } = sellConsumable(inv, 0);

    expect(goldGained).toBe(40);
    expect(updatedInv.gold).toBe(50);
    expect(updatedInv.consumableSlots.length).toBe(0);
  });
});
