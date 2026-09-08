import { Card } from '../models/card';
import { ConsumableStack } from '../models/inventory';

/**
 * Creates a temporary Heal Consumable card granted after winning battles.
 * Restores 2-4 HP when dragged onto a friendly card.
 */
export function createHealConsumable(amount: number = 3): ConsumableStack {
  return {
    itemId: `heal_card_${amount}`,
    name: `Thẻ Hồi Máu (+${amount} HP)`,
    quantity: 1,
    baseBuyPrice: 20,
    description: `Kéo thả vào tướng trên sân để hồi phục ${amount} Máu (tối đa bằng Máu tối đa).`,
    targetType: 'card',
  };
}

/**
 * Applies healing to a target card, capped at computedHP.
 */
export function applyHealConsumable(card: Card, healAmount: number): Card {
  const newHP = Math.min(card.computedHP, card.currentHP + healAmount);
  return {
    ...card,
    currentHP: newHP,
  };
}
