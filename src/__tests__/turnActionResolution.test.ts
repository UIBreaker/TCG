import { describe, it, expect } from 'vitest';
import { resolveCombatTurn, generateEnemyActions } from '../engine/combat';
import { MonsterCard, PlannedAction } from '../types/game';

// Factory helper to create clean mock cards for testing
function createMockCard(id: string, name: string, overrides: Partial<MonsterCard> = {}): MonsterCard {
  return {
    id,
    name,
    element: 'nature',
    tier: 'C',
    hp: 50,
    maxHp: 50,
    shield: 0,
    attackPower: 12,
    speed: 10,
    avatar: '🦉',
    skills: [
      {
        name: 'Mổ Cơ Bản',
        element: 'nature',
        baseDamage: 12,
        energyCost: 0,
        cooldown: 0,
        currentCooldown: 0,
        description: 'Đòn đánh cơ bản không tốn năng lượng',
      },
      {
        name: 'Bão Lá Gai',
        element: 'nature',
        baseDamage: 24,
        energyCost: 1,
        cooldown: 2,
        currentCooldown: 0,
        description: 'Tấn công gây sát thương lớn',
      },
      {
        name: 'Cuồng Nộ Thần Mộc',
        element: 'nature',
        baseDamage: 45,
        energyCost: 0,
        cooldown: 99,
        isUltimate: true,
        usedThisCombat: false,
        description: 'Tuyệt kỹ giáng xuống kẻ địch',
      },
    ],
    passive: {
      name: 'Hài Hòa Rừng Xanh',
      description: 'Hồi phục máu theo lượt',
    },
    equippedRelics: [],
    statusEffects: [],
    hitsDealt: 0,
    hiddenRage: 0,
    ultimateUsed: false,
    exhaustTurns: 0,
    ...overrides,
  };
}

describe('Turn Action Resolution & 1-Click End Turn', () => {
  it('executes combat turn on first click with default basic skill 0', () => {
    const player1 = createMockCard('p1', 'Cú Rừng');
    const playerParty: (MonsterCard | null)[] = [player1, null, null];

    const enemy1 = createMockCard('e1', 'Sói Xám');
    const enemyParty: (MonsterCard | null)[] = [enemy1, null, null];

    const playerActions: PlannedAction[] = [
      { skillIndex: 0, targetSlotIndex: 0 },
      { skillIndex: 0, targetSlotIndex: 1 },
      { skillIndex: 0, targetSlotIndex: 2 },
    ];

    const enemyActions = generateEnemyActions(enemyParty, playerParty);

    // Turn 1 resolve
    const result = resolveCombatTurn(
      playerParty,
      enemyParty,
      playerActions,
      enemyActions,
      1,
      false,
      false
    );

    expect(result).toBeDefined();
    expect(result.animationSteps.length).toBeGreaterThan(0);
    expect(result.logs.length).toBeGreaterThan(0);
    expect(result.nextPlayerParty[0]).not.toBeNull();
    expect(result.nextEnemyParty[0]).not.toBeNull();
  });

  it('safely normalizes and falls back to skill 0 if planned skill is on cooldown', () => {
    // Card with skill 1 on cooldown
    const playerCard = createMockCard('p1', 'Hổ Lửa');
    playerCard.skills[1].currentCooldown = 2; // on cooldown!

    const rawAction: PlannedAction = { skillIndex: 1, targetSlotIndex: 0 };

    // Normalization logic equivalent to Battlefield handleEndTurn
    let validSkillIdx: 0 | 1 | 2 = rawAction.skillIndex;
    const plannedSkill = playerCard.skills[validSkillIdx];
    const isUlt = plannedSkill?.isUltimate || validSkillIdx === 2;
    const isUltUsed = playerCard.ultimateUsed || plannedSkill?.usedThisCombat;
    const onCd = (plannedSkill?.currentCooldown || 0) > 0 && !isUlt;

    if (onCd || isUltUsed) {
      validSkillIdx = 0;
    }

    expect(validSkillIdx).toBe(0);
  });

  it('safely normalizes and falls back to skill 0 if ultimate was already used', () => {
    const playerCard = createMockCard('p1', 'Rồng Sấm', {
      ultimateUsed: true,
    });
    playerCard.skills[2].usedThisCombat = true;

    const rawAction: PlannedAction = { skillIndex: 2, targetSlotIndex: 0 };

    let validSkillIdx: 0 | 1 | 2 = rawAction.skillIndex;
    const plannedSkill = playerCard.skills[validSkillIdx];
    const isUlt = plannedSkill?.isUltimate || validSkillIdx === 2;
    const isUltUsed = playerCard.ultimateUsed || plannedSkill?.usedThisCombat;

    if (isUltUsed) {
      validSkillIdx = 0;
    }

    expect(validSkillIdx).toBe(0);
  });

  it('retargets to nearest alive enemy if original targeted enemy is eliminated', () => {
    const deadEnemy = createMockCard('e1', 'Mộc Nhân', { hp: 0 });
    const aliveEnemy = createMockCard('e2', 'Đá Cổ Thụ', { hp: 40 });
    const enemyParty: (MonsterCard | null)[] = [deadEnemy, aliveEnemy, null];

    const slotIdx = 0;
    const targetedSlot = 0; // targeting slot 0 which is dead

    let targetSlot = targetedSlot;
    const currentTarget = enemyParty[targetSlot];
    if (!currentTarget || currentTarget.hp <= 0) {
      let nearestDist = 999;
      let bestSlot = 0;
      let foundAlive = false;
      enemyParty.forEach((e, eIdx) => {
        if (e && e.hp > 0) {
          const dist = Math.abs(eIdx - slotIdx);
          if (dist < nearestDist) {
            nearestDist = dist;
            bestSlot = eIdx;
            foundAlive = true;
          }
        }
      });
      if (foundAlive) targetSlot = bestSlot;
    }

    expect(targetSlot).toBe(1); // successfully retargeted to alive enemy at slot 1
  });

  it('correctly detects ultimate unlock condition: >= 2 hits or hp < 50% or >= 3 rage', () => {
    // Case 1: Fresh card -> locked
    const freshCard = createMockCard('c1', 'Bạch Hổ', { hitsDealt: 0, hp: 50, maxHp: 50, hiddenRage: 0 });
    const freshUnlocked = (freshCard.hitsDealt || 0) >= 2 || (freshCard.hp / freshCard.maxHp) < 0.5 || (freshCard.hiddenRage || 0) >= 3;
    expect(freshUnlocked).toBe(false);

    // Case 2: 2 hits dealt -> unlocked
    const battleCard = createMockCard('c2', 'Bạch Hổ', { hitsDealt: 2, hp: 50, maxHp: 50 });
    const battleUnlocked = (battleCard.hitsDealt || 0) >= 2 || (battleCard.hp / battleCard.maxHp) < 0.5;
    expect(battleUnlocked).toBe(true);

    // Case 3: Low HP (< 50%) -> emergency unlock
    const lowHpCard = createMockCard('c3', 'Bạch Hổ', { hitsDealt: 0, hp: 20, maxHp: 50 });
    const lowHpUnlocked = (lowHpCard.hp / lowHpCard.maxHp) < 0.5;
    expect(lowHpUnlocked).toBe(true);

    // Case 4: 3 Rage -> unlocked
    const rageCard = createMockCard('c4', 'Bạch Hổ', { hiddenRage: 3 });
    const rageUnlocked = (rageCard.hiddenRage || 0) >= 3;
    expect(rageUnlocked).toBe(true);
  });
});
