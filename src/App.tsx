import React, { useState } from 'react';
import { GameState, MonsterCard, Relic, MapNode } from './types/game';
import { createInitialPlayerParty, generateEnemyTeam } from './data/monsters';
import { generateForestMap, advanceMapNode } from './engine/mapGenerator';
import { ALL_RELICS } from './data/relics';
import { HeaderBar } from './components/HeaderBar';
import { Battlefield } from './components/Battlefield';
import { ForestMap } from './components/ForestMap';
import { ShopModal } from './components/ShopModal';
import { RestCampModal } from './components/RestCampModal';
import { DeckManagerModal } from './components/DeckManagerModal';
import { MysteryEventModal } from './components/MysteryEventModal';
import { BattleRewardModal } from './components/BattleRewardModal';
import { GameOverModal } from './components/GameOverModal';
import { StarterDraftModal } from './components/StarterDraftModal';
import { SanctuaryModal } from './components/SanctuaryModal';
import { TreasureVaultModal } from './components/TreasureVaultModal';
import { GameMenuModal } from './components/GameMenuModal';
import { InventoryModal } from './components/InventoryModal';
import { sound } from './utils/audio';

export const App: React.FC = () => {
  // Initialize game state with starter draft mode (choose 2 cards across 2 stages into hand)
  const initializeRun = (): GameState => {
    const map = generateForestMap();

    return {
      playerParty: [null, null, null],
      reserveRoster: [],
      relicInventory: [
        ALL_RELICS.find(r => r.id === 'relic_vampire')!,
      ],
      gold: 75,
      captureCardsCount: 2, // 2 free capture cards to recruit wild monsters
      healingHerbsCount: 1, // 1 Free healing herb in satchel
      shieldPotionsCount: 1, // 1 Free shield talisman in satchel
      keysCount: 1, // 1 Ancient Key to safely open Treasure Vault
      lockpickToolkitsCount: 1, // 1 Lockpick Toolkit (+20% brute force)
      currentFloor: 1,
      mapNodes: map,
      currentNodeId: null,
      phase: 'draft',
    };
  };

  const [gameState, setGameState] = useState<GameState>(initializeRun);
  const [enemyParty, setEnemyParty] = useState<(MonsterCard | null)[]>([]);
  const [isBossNode, setIsBossNode] = useState<boolean>(false);
  const [isEliteNode, setIsEliteNode] = useState<boolean>(false);

  // Modals & UI States
  const [isDeckManagerOpen, setIsDeckManagerOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [battleRewards, setBattleRewards] = useState<{
    gold: number;
    gotRecruitmentCard: boolean;
    relicDrop?: Relic;
  } | null>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Section 3: 2-stage Mulligan Starter Selection. Both starters placed in reserveRoster (hand).
  // Crucially transitions to MAP so player can view the 7-floor map, inspect enemy previews, and choose their starting node!
  const handleSelectStarters = (chosenMonsters: MonsterCard[], _targetSlot: number = 0) => {
    const cleaveRelic = ALL_RELICS.find(r => r.id === 'relic_cleave');
    const firstWithRelic: MonsterCard = {
      ...chosenMonsters[0],
      equippedRelics: cleaveRelic ? [cleaveRelic] : [],
    };
    const secondStarter: MonsterCard = {
      ...chosenMonsters[1],
      equippedRelics: [],
    };

    setGameState(prev => ({
      ...prev,
      playerParty: [null, null, null],
      reserveRoster: [firstWithRelic, secondStarter],
      currentNodeId: null,
      currentFloor: 1,
      phase: 'map',
    }));
  };

  // Inventory Handlers (Supports both active 3 lanes and reserve roster)
  const handleInventoryHealHerb = (targetSlot: number, isReserve = false) => {
    setGameState(prev => {
      if ((prev.healingHerbsCount ?? 0) <= 0) return prev;
      if (isReserve) {
        const nextReserve = [...prev.reserveRoster];
        const card = nextReserve[targetSlot];
        if (card && card.hp > 0) {
          card.hp = Math.min(card.maxHp, card.hp + 35);
        }
        return {
          ...prev,
          reserveRoster: nextReserve,
          healingHerbsCount: Math.max(0, (prev.healingHerbsCount ?? 1) - 1),
        };
      }
      const nextParty = [...prev.playerParty];
      const card = nextParty[targetSlot];
      if (card && card.hp > 0) {
        card.hp = Math.min(card.maxHp, card.hp + 35);
      }
      return {
        ...prev,
        playerParty: nextParty,
        healingHerbsCount: Math.max(0, (prev.healingHerbsCount ?? 1) - 1),
      };
    });
  };

  const handleInventoryApplyShield = (targetSlot: number, isReserve = false) => {
    setGameState(prev => {
      if ((prev.shieldPotionsCount ?? 0) <= 0) return prev;
      if (isReserve) {
        const nextReserve = [...prev.reserveRoster];
        const card = nextReserve[targetSlot];
        if (card && card.hp > 0) {
          card.shield = (card.shield || 0) + 25;
        }
        return {
          ...prev,
          reserveRoster: nextReserve,
          shieldPotionsCount: Math.max(0, (prev.shieldPotionsCount ?? 1) - 1),
        };
      }
      const nextParty = [...prev.playerParty];
      const card = nextParty[targetSlot];
      if (card && card.hp > 0) {
        card.shield = (card.shield || 0) + 25;
      }
      return {
        ...prev,
        playerParty: nextParty,
        shieldPotionsCount: Math.max(0, (prev.shieldPotionsCount ?? 1) - 1),
      };
    });
  };

  const handleInventoryBuyItem = (
    type: 'capture_card' | 'healing_herb' | 'shield_potion' | 'key' | 'toolkit',
    cost: number
  ) => {
    setGameState(prev => {
      if (prev.gold < cost) return prev;
      const nextGold = prev.gold - cost;
      if (type === 'capture_card') {
        return {
          ...prev,
          gold: nextGold,
          captureCardsCount: prev.captureCardsCount + 1,
        };
      }
      if (type === 'shield_potion') {
        return {
          ...prev,
          gold: nextGold,
          shieldPotionsCount: (prev.shieldPotionsCount ?? 0) + 1,
        };
      }
      if (type === 'healing_herb') {
        return {
          ...prev,
          gold: nextGold,
          healingHerbsCount: (prev.healingHerbsCount ?? 0) + 1,
        };
      }
      if (type === 'key') {
        return {
          ...prev,
          gold: nextGold,
          keysCount: (prev.keysCount ?? 0) + 1,
        };
      }
      if (type === 'toolkit') {
        return {
          ...prev,
          gold: nextGold,
          lockpickToolkitsCount: (prev.lockpickToolkitsCount ?? 0) + 1,
        };
      }
      return prev;
    });
  };

  // Restart Run
  const handleRestart = () => {
    sound.playCardSelect();
    setBattleRewards(null);
    setIsDeckManagerOpen(false);
    setIsMenuOpen(false);
    setGameState(initializeRun());
  };

  // Node Selected on Map
  const handleSelectMapNode = (node: MapNode) => {
    setGameState(prev => ({
      ...prev,
      currentNodeId: node.id,
      currentFloor: node.floor,
    }));

    if (node.type === 'battle' || node.type === 'elite' || node.type === 'boss') {
      const isBoss = node.type === 'boss';
      const isElite = node.type === 'elite';
      setIsBossNode(isBoss);
      setIsEliteNode(isElite);
      const enemies = generateEnemyTeam(node.floor, isBoss, isElite);
      setEnemyParty(enemies);
      const resetCardForCombat = (card: MonsterCard): MonsterCard => ({
        ...card,
        shield: 0,
        hiddenRage: 0,
        hitsDealt: 0,
        ultimateUsed: false,
        exhaustTurns: 0,
        statusEffects: [],
        skills: [
          { ...card.skills[0], currentCooldown: 0, usedThisCombat: false },
          { ...card.skills[1], currentCooldown: 0, usedThisCombat: false },
          { ...card.skills[2], currentCooldown: 0, usedThisCombat: false },
        ],
      });

      setGameState(prev => ({
        ...prev,
        phase: 'combat',
        playerParty: prev.playerParty.map(c => (c ? resetCardForCombat(c) : null)),
        reserveRoster: prev.reserveRoster.map(resetCardForCombat),
      }));
    } else if (node.type === 'shop') {
      setGameState(prev => ({ ...prev, phase: 'shop' }));
    } else if (node.type === 'rest') {
      setGameState(prev => ({ ...prev, phase: 'rest' }));
    } else if (node.type === 'event') {
      setGameState(prev => ({ ...prev, phase: 'event' }));
    } else if (node.type === 'sanctuary') {
      setGameState(prev => ({ ...prev, phase: 'sanctuary' }));
    } else if (node.type === 'vault') {
      setGameState(prev => ({ ...prev, phase: 'vault' }));
    }
  };

  // Turn End in Battlefield
  const handleCombatTurnEnd = (
    nextPlayerParty: (MonsterCard | null)[],
    nextEnemyParty: (MonsterCard | null)[],
    isVictory: boolean,
    isDefeat: boolean,
    rewards?: { gold: number; gotRecruitmentCard: boolean; relicDrop?: Relic }
  ) => {
    setGameState(prev => ({
      ...prev,
      playerParty: nextPlayerParty,
    }));
    setEnemyParty(nextEnemyParty);

    if (isDefeat) {
      setGameState(prev => ({ ...prev, phase: 'gameover' }));
      return;
    }

    if (isVictory) {
      if (isBossNode) {
        setGameState(prev => ({ ...prev, phase: 'victory' }));
      } else if (rewards) {
        setBattleRewards(rewards);
      }
    }
  };

  // Claim Battle Rewards & Advance Map
  const handleClaimBattleRewards = () => {
    if (!battleRewards) return;

    setGameState(prev => {
      const activeNodeId = prev.currentNodeId || 'f1_n0';
      const nextMap = advanceMapNode(prev.mapNodes, activeNodeId);
      const nextRelicInv = battleRewards.relicDrop
        ? [...prev.relicInventory, battleRewards.relicDrop]
        : prev.relicInventory;

      return {
        ...prev,
        gold: prev.gold + battleRewards.gold,
        captureCardsCount: prev.captureCardsCount + (battleRewards.gotRecruitmentCard ? 1 : 0),
        relicInventory: nextRelicInv,
        mapNodes: nextMap,
        currentNodeId: activeNodeId,
        phase: 'map',
      };
    });

    setBattleRewards(null);
  };

  // Monster Captured during combat
  const handleMonsterCaptured = (capturedMonster: MonsterCard) => {
    setGameState(prev => ({
      ...prev,
      reserveRoster: [...prev.reserveRoster, capturedMonster],
    }));
  };

  // Consume Capture Card on attempt
  const handleConsumeCaptureCard = () => {
    setGameState(prev => ({
      ...prev,
      captureCardsCount: Math.max(0, prev.captureCardsCount - 1),
    }));
  };

  // Shop Purchases
  const handleBuyRelic = (relic: Relic) => {
    setGameState(prev => ({
      ...prev,
      gold: prev.gold - relic.price,
      relicInventory: [...prev.relicInventory, relic],
    }));
  };

  const handleBuyCaptureCard = (cost: number) => {
    setGameState(prev => ({
      ...prev,
      gold: prev.gold - cost,
      captureCardsCount: prev.captureCardsCount + 1,
    }));
  };

  const handleBuyHealingSeed = (cost: number) => {
    setGameState(prev => {
      const healedParty = prev.playerParty.map(p => {
        if (!p || p.hp <= 0) return p;
        const heal = Math.round(p.maxHp * 0.4);
        return { ...p, hp: Math.min(p.maxHp, p.hp + heal) };
      });
      return {
        ...prev,
        gold: prev.gold - cost,
        playerParty: healedParty,
      };
    });
  };

  // Complete Shop / Rest / Event and advance map
  const handleCompleteNonCombatNode = () => {
    if (!gameState.currentNodeId) {
      setGameState(prev => ({ ...prev, phase: 'map' }));
      return;
    }
    setGameState(prev => ({
      ...prev,
      mapNodes: advanceMapNode(prev.mapNodes, prev.currentNodeId!),
      phase: 'map',
    }));
  };

  // Rest Camp Actions
  const handleRestHealAll = (percent: number) => {
    setGameState(prev => {
      const healedParty = prev.playerParty.map(p => {
        if (!p || p.hp <= 0) return p;
        const heal = Math.round(p.maxHp * percent);
        return { ...p, hp: Math.min(p.maxHp, p.hp + heal) };
      });
      return { ...prev, playerParty: healedParty };
    });
  };

  const handleRestRevive = (slotIdx: number) => {
    setGameState(prev => {
      const nextParty = [...prev.playerParty];
      const target = nextParty[slotIdx];
      if (target) {
        nextParty[slotIdx] = {
          ...target,
          hp: Math.round(target.maxHp * 0.5),
        };
      }
      return { ...prev, playerParty: nextParty };
    });
  };

  // Deck Management: Equip / Unequip Relics (Active party or Reserve roster)
  const handleEquipRelic = (slotIdx: number, relic: Relic, isReserve = false) => {
    setGameState(prev => {
      if (isReserve) {
        const nextReserve = [...prev.reserveRoster];
        const card = nextReserve[slotIdx];
        if (!card || card.equippedRelics.length >= 10) return prev;
        card.equippedRelics = [...card.equippedRelics, relic];
        return {
          ...prev,
          reserveRoster: nextReserve,
          relicInventory: prev.relicInventory.filter(r => r !== relic),
        };
      }
      const nextParty = [...prev.playerParty];
      const card = nextParty[slotIdx];
      if (!card || card.equippedRelics.length >= 10) return prev;

      card.equippedRelics = [...card.equippedRelics, relic];
      const nextInv = prev.relicInventory.filter(r => r !== relic);

      return {
        ...prev,
        playerParty: nextParty,
        relicInventory: nextInv,
      };
    });
  };

  const handleUnequipRelic = (slotIdx: number, relicIdx: number, isReserve = false) => {
    setGameState(prev => {
      if (isReserve) {
        const nextReserve = [...prev.reserveRoster];
        const card = nextReserve[slotIdx];
        if (!card) return prev;
        const unequipped = card.equippedRelics[relicIdx];
        card.equippedRelics = card.equippedRelics.filter((_, i) => i !== relicIdx);
        return {
          ...prev,
          reserveRoster: nextReserve,
          relicInventory: [...prev.relicInventory, unequipped],
        };
      }
      const nextParty = [...prev.playerParty];
      const card = nextParty[slotIdx];
      if (!card) return prev;

      const unequipped = card.equippedRelics[relicIdx];
      card.equippedRelics = card.equippedRelics.filter((_, i) => i !== relicIdx);

      return {
        ...prev,
        playerParty: nextParty,
        relicInventory: [...prev.relicInventory, unequipped],
      };
    });
  };

  // Deck Management: Swap active card with reserve roster
  const handleSwapMonster = (activeSlotIdx: number, reserveIdx: number) => {
    setGameState(prev => {
      const activeCard = prev.playerParty[activeSlotIdx];
      const reserveCard = prev.reserveRoster[reserveIdx];

      const nextParty = [...prev.playerParty];
      nextParty[activeSlotIdx] = reserveCard;

      const nextReserve = [...prev.reserveRoster];
      if (activeCard) {
        nextReserve[reserveIdx] = activeCard;
      } else {
        nextReserve.splice(reserveIdx, 1);
      }

      return {
        ...prev,
        playerParty: nextParty,
        reserveRoster: nextReserve,
      };
    });
  };

  // Reorder player cards on the battlefield (via mouse drag-and-drop or click-swap)
  const handleReorderParty = (fromIdx: number, toIdx: number) => {
    sound.playCardSelect();
    setGameState(prev => {
      const nextParty = [...prev.playerParty];
      const temp = nextParty[fromIdx];
      nextParty[fromIdx] = nextParty[toIdx];
      nextParty[toIdx] = temp;
      return {
        ...prev,
        playerParty: nextParty,
      };
    });
  };

  // Recall player card from battlefield lane back to reserve hand (Section 12: max 2/combat)
  const handleRecallCard = (slotIdx: number) => {
    setGameState(prev => {
      const card = prev.playerParty[slotIdx];
      if (!card) return prev;
      const nextParty = [...prev.playerParty];
      nextParty[slotIdx] = null;
      return {
        ...prev,
        playerParty: nextParty,
        reserveRoster: [...prev.reserveRoster, card],
      };
    });
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Header Bar */}
      <HeaderBar
        gold={gameState.gold}
        captureCards={gameState.captureCardsCount}
        keysCount={gameState.keysCount ?? 0}
        floor={gameState.currentFloor}
        phase={gameState.phase}
        onOpenDeck={() => setIsDeckManagerOpen(true)}
        onOpenMap={() => setGameState(prev => ({ ...prev, phase: 'map' }))}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onReset={handleRestart}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
      />

      {/* Main Game Screen Router */}
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {gameState.phase === 'map' && (
          <ForestMap
            nodes={gameState.mapNodes}
            currentNodeId={gameState.currentNodeId}
            onSelectNode={handleSelectMapNode}
            gold={gameState.gold}
          />
        )}

        {gameState.phase === 'combat' && (
          <Battlefield
            playerParty={gameState.playerParty}
            enemyParty={enemyParty}
            reserveRoster={gameState.reserveRoster}
            captureCardsCount={gameState.captureCardsCount}
            onTurnEnd={handleCombatTurnEnd}
            onMonsterCaptured={handleMonsterCaptured}
            onEnemyPartyChange={setEnemyParty}
            onDeployReserveCard={(reserveIdx, targetSlot) => handleSwapMonster(targetSlot, reserveIdx)}
            onRecallCard={handleRecallCard}
            onConsumeCaptureCard={handleConsumeCaptureCard}
            onReorderParty={handleReorderParty}
            onOpenInventory={() => setIsInventoryOpen(true)}
            gold={gameState.gold}
            isBoss={isBossNode}
            isElite={isEliteNode}
          />
        )}
      </main>

      {/* MODAL: Shop */}
      {gameState.phase === 'shop' && (
        <ShopModal
          gold={gameState.gold}
          playerParty={gameState.playerParty}
          onBuyRelic={handleBuyRelic}
          onBuyCaptureCard={handleBuyCaptureCard}
          onBuyHealingSeed={handleBuyHealingSeed}
          onBuyKey={cost => handleInventoryBuyItem('key', cost)}
          onBuyToolkit={cost => handleInventoryBuyItem('toolkit', cost)}
          onCloseShop={handleCompleteNonCombatNode}
        />
      )}

      {/* MODAL: Rest Camp */}
      {gameState.phase === 'rest' && (
        <RestCampModal
          playerParty={gameState.playerParty}
          onHealAll={handleRestHealAll}
          onReviveCard={handleRestRevive}
          onContinue={handleCompleteNonCombatNode}
        />
      )}

      {/* MODAL: Sanctuary (Card Fusion & Relic Merge) */}
      {gameState.phase === 'sanctuary' && (
        <SanctuaryModal
          playerParty={gameState.playerParty}
          reserveRoster={gameState.reserveRoster}
          relicInventory={gameState.relicInventory}
          onUpdatePartyAndReserve={(party, reserve) => {
            setGameState(prev => ({
              ...prev,
              playerParty: party,
              reserveRoster: reserve,
            }));
          }}
          onUpdateRelics={relics => {
            setGameState(prev => ({
              ...prev,
              relicInventory: relics,
            }));
          }}
          onClose={handleCompleteNonCombatNode}
        />
      )}

      {/* MODAL: Treasure Vault (Ancient Chest) */}
      {gameState.phase === 'vault' && (
        <TreasureVaultModal
          keysCount={gameState.keysCount ?? 0}
          lockpickToolkitsCount={gameState.lockpickToolkitsCount ?? 0}
          playerParty={gameState.playerParty}
          onConsumeKey={() => {
            setGameState(prev => ({
              ...prev,
              keysCount: Math.max(0, (prev.keysCount ?? 1) - 1),
            }));
          }}
          onConsumeToolkit={() => {
            setGameState(prev => ({
              ...prev,
              lockpickToolkitsCount: Math.max(0, (prev.lockpickToolkitsCount ?? 1) - 1),
            }));
          }}
          onDamageParty={damage => {
            setGameState(prev => ({
              ...prev,
              playerParty: prev.playerParty.map(p =>
                p ? { ...p, hp: Math.max(1, p.hp - damage) } : p
              ),
            }));
          }}
          onAddRewards={(gold, relic) => {
            setGameState(prev => ({
              ...prev,
              gold: prev.gold + gold,
              relicInventory: relic ? [...prev.relicInventory, relic] : prev.relicInventory,
            }));
          }}
          onTriggerMimicCombat={() => {
            const mimicTeam = generateEnemyTeam(gameState.currentFloor, false, true);
            if (mimicTeam[0]) {
              mimicTeam[0].name = 'Quái Rương Mimic Cổ';
              mimicTeam[0].avatar = '👹📦';
            }
            setEnemyParty(mimicTeam);
            setIsBossNode(false);
            setIsEliteNode(true);
            setGameState(prev => ({ ...prev, phase: 'combat' }));
          }}
          onClose={handleCompleteNonCombatNode}
        />
      )}

      {/* MODAL: Mystery Event */}
      {gameState.phase === 'event' && (
        <MysteryEventModal
          onGainRelic={relic =>
            setGameState(p => ({ ...p, relicInventory: [...p.relicInventory, relic] }))
          }
          onGainCaptureCard={() =>
            setGameState(p => ({ ...p, captureCardsCount: p.captureCardsCount + 1 }))
          }
          onGainGold={amt => setGameState(p => ({ ...p, gold: p.gold + amt }))}
          onDamageAll={amt =>
            setGameState(p => ({
              ...p,
              playerParty: p.playerParty.map(c =>
                c ? { ...c, hp: Math.max(1, c.hp - amt) } : c
              ),
            }))
          }
          onComplete={handleCompleteNonCombatNode}
        />
      )}

      {/* MODAL: Battle Rewards */}
      {battleRewards && (
        <BattleRewardModal
          gold={battleRewards.gold}
          gotRecruitmentCard={battleRewards.gotRecruitmentCard}
          relicDrop={battleRewards.relicDrop}
          onClaimAndContinue={handleClaimBattleRewards}
          isBossWin={isBossNode}
        />
      )}

      {/* MODAL: Deck & Relics Manager */}
      {isDeckManagerOpen && (
        <DeckManagerModal
          playerParty={gameState.playerParty}
          reserveRoster={gameState.reserveRoster}
          relicInventory={gameState.relicInventory}
          onEquipRelic={handleEquipRelic}
          onUnequipRelic={handleUnequipRelic}
          onSwapMonster={handleSwapMonster}
          onClose={() => setIsDeckManagerOpen(false)}
        />
      )}

      {/* MODAL: Starter Draft (2-Stage Mulligan: pick 2 cards into hand, then view map) */}
      {gameState.phase === 'draft' && (
        <StarterDraftModal
          onSelectStarters={handleSelectStarters}
          onSelectStarter={(card, slot) => handleSelectStarters([card, card], slot)}
        />
      )}

      {/* MODAL: Game Menu / Codex / Elemental Star */}
      <GameMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onStartNewGame={handleRestart}
        hasActiveRun={gameState.phase !== 'draft'}
      />

      {/* MODAL: Player Inventory & Satchel (Túi Đồ: Vàng, Thẻ Bắt, Dược Liệu, Chìa Khóa, Cổ Vật) */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        gold={gameState.gold}
        captureCardsCount={gameState.captureCardsCount}
        healingHerbsCount={gameState.healingHerbsCount ?? 0}
        shieldPotionsCount={gameState.shieldPotionsCount ?? 0}
        keysCount={gameState.keysCount ?? 0}
        lockpickToolkitsCount={gameState.lockpickToolkitsCount ?? 0}
        playerParty={gameState.playerParty}
        reserveRoster={gameState.reserveRoster}
        relicInventory={gameState.relicInventory}
        onEquipRelic={handleEquipRelic}
        onUnequipRelic={handleUnequipRelic}
        onUseCaptureCard={() => {
          setIsInventoryOpen(false);
          if (gameState.captureCardsCount > 0) {
            handleConsumeCaptureCard();
          }
        }}
        onUseHealingHerb={handleInventoryHealHerb}
        onUseShieldPotion={handleInventoryApplyShield}
        onBuyItem={handleInventoryBuyItem}
        isInCombat={gameState.phase === 'combat'}
      />

      {/* MODAL: Game Over / Full Victory */}
      {(gameState.phase === 'gameover' || gameState.phase === 'victory') && (
        <GameOverModal
          isVictory={gameState.phase === 'victory'}
          floor={gameState.currentFloor}
          gold={gameState.gold}
          capturedCount={gameState.reserveRoster.length}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default App;
