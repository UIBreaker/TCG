import { GameState, CombatPhase } from '../models/gameState';
import { Card } from '../models/card';
import { BoardSlot } from '../models/board';
import { buildTurnQueue, TurnOrderEntry } from './turnOrder';

export interface MulliganState {
  stage: 1 | 2 | 'done';
  offeredCards: Card[];
  remainingDeck: Card[];
}

export interface RecallResult {
  success: boolean;
  gameState: GameState;
  reason?: string;
}

export interface PlaceCardResult {
  success: boolean;
  gameState: GameState;
  reason?: string;
}

/**
 * Combat State Machine handling:
 * - 2-stage Mulligan
 * - Strict Recall limits (max 2, or 3 with relic)
 * - Turn Order resolution
 * - End of turn cleanup (reset Shield to 0 for all cards)
 */
export class CombatStateMachine {
  /**
   * Initializes Mulligan Stage 1 by offering 3 cards from the deck.
   */
  static startMulligan(deck: Card[]): MulliganState {
    const offered = deck.slice(0, 3);
    const remaining = deck.slice(3);
    return {
      stage: 1,
      offeredCards: offered,
      remainingDeck: remaining,
    };
  }

  /**
   * Resolves a card pick in Mulligan.
   * Stage 1: picks 1, draws next 3 for Stage 2.
   * Stage 2: picks 1, ends Mulligan.
   */
  static selectMulliganCard(
    currentMulligan: MulliganState,
    chosenIndex: number,
    currentHand: Card[]
  ): { mulligan: MulliganState; hand: Card[]; nextPhase: CombatPhase } {
    const chosenCard = currentMulligan.offeredCards[chosenIndex];
    const newHand = [...currentHand, chosenCard];

    if (currentMulligan.stage === 1) {
      const nextOffered = currentMulligan.remainingDeck.slice(0, 3);
      const nextRemaining = currentMulligan.remainingDeck.slice(3);
      return {
        mulligan: {
          stage: 2,
          offeredCards: nextOffered,
          remainingDeck: nextRemaining,
        },
        hand: newHand,
        nextPhase: 'Mulligan_2',
      };
    }

    // Stage 2 completed
    return {
      mulligan: {
        stage: 'done',
        offeredCards: [],
        remainingDeck: currentMulligan.remainingDeck,
      },
      hand: newHand,
      nextPhase: 'Planning',
    };
  }

  /**
   * Recalls a card from a board slot back into the player's hand.
   * Section 3 rules:
   * - No direct drag-swap.
   * - Must Recall to hand then place on an empty slot.
   * - Hard-capped at maxRecalls (default 2, or 3 if relic).
   */
  static recallCard(
    gameState: GameState,
    slotIndex: number
  ): RecallResult {
    if (gameState.recallCount >= gameState.maxRecalls) {
      return {
        success: false,
        gameState,
        reason: `Đã dùng hết số lần Thu Hồi (${gameState.maxRecalls}/${gameState.maxRecalls}) trong trận này!`,
      };
    }

    const slot = gameState.playerBoard.find((s) => s.slotIndex === slotIndex);
    if (!slot || !slot.card) {
      return {
        success: false,
        gameState,
        reason: 'Không có thẻ bài ở vị trí này để thu hồi.',
      };
    }

    const cardToReturn = slot.card;
    const updatedBoard = gameState.playerBoard.map((s) =>
      s.slotIndex === slotIndex ? { ...s, card: null } : s
    );

    const updatedState: GameState = {
      ...gameState,
      playerBoard: updatedBoard,
      playerHand: [...gameState.playerHand, cardToReturn],
      recallCount: gameState.recallCount + 1,
    };

    return {
      success: true,
      gameState: updatedState,
    };
  }

  /**
   * Places a card from hand onto an empty board slot.
   */
  static placeCardFromHand(
    gameState: GameState,
    handIndex: number,
    targetSlotIndex: number
  ): PlaceCardResult {
    if (handIndex < 0 || handIndex >= gameState.playerHand.length) {
      return { success: false, gameState, reason: 'Thẻ bài không hợp lệ trong tay.' };
    }

    const targetSlot = gameState.playerBoard.find((s) => s.slotIndex === targetSlotIndex);
    if (!targetSlot) {
      return { success: false, gameState, reason: 'Ô đích không tồn tại trên sàn đấu.' };
    }

    if (targetSlot.card !== null) {
      return {
        success: false,
        gameState,
        reason: 'Ô này đã có thẻ bài! Hãy Thu Hồi thẻ bài về tay trước.',
      };
    }

    const cardToPlace = gameState.playerHand[handIndex];
    const updatedHand = gameState.playerHand.filter((_, idx) => idx !== handIndex);
    const updatedBoard = gameState.playerBoard.map((s) =>
      s.slotIndex === targetSlotIndex ? { ...s, card: cardToPlace } : s
    );

    return {
      success: true,
      gameState: {
        ...gameState,
        playerBoard: updatedBoard,
        playerHand: updatedHand,
      },
    };
  }

  /**
   * Generates the turn resolution queue sorted by Speed descending + tie-breaker.
   */
  static getTurnQueue(gameState: GameState): TurnOrderEntry[] {
    return buildTurnQueue(gameState.playerBoard, gameState.enemyBoard);
  }

  /**
   * End of Turn Cleanup:
   * - Resets all cards' temporary Shields to 0.
   * - Increments turnCounter.
   * - Cleanses expired modifiers.
   */
  static processEndOfTurn(gameState: GameState): GameState {
    const cleanSlots = (slots: BoardSlot[]): BoardSlot[] =>
      slots.map((slot) => {
        if (!slot.card) return slot;

        // Reset temporary shield to 0
        return {
          ...slot,
          card: {
            ...slot.card,
            currentShield: 0,
            // Cleanse endOfTurn modifiers
            modifiers: (slot.card.modifiers || []).filter(
              (m) => m.expiresAt !== 'endOfTurn'
            ),
          },
        };
      });

    return {
      ...gameState,
      playerBoard: cleanSlots(gameState.playerBoard),
      enemyBoard: cleanSlots(gameState.enemyBoard),
      turnCounter: gameState.turnCounter + 1,
      phase: 'Planning',
    };
  }
}
