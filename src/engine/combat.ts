import { MonsterCard, PlannedAction, CombatLogEntry, ElementType, Relic, Skill, StatusType } from '../types/game';
import { getRandomRelic } from '../data/relics';
import { calculateDamage } from '../combat/damage';
import { resolveImpactVFX, ImpactVFXSpec } from '../combat/impactVFX';
import { Card } from '../models/card';
import { getTierPassiveMultiplier } from '../fusion/tierScaling';

// Converts MonsterCard to tactical engine Card model
export function monsterToCombatCard(m: MonsterCard): Card {
  return {
    id: m.id,
    name: m.name,
    tier: m.tier || 'C',
    tierLevel: (m.tierLevel ?? 0) as any,
    baseHP: m.baseHP ?? m.hp,
    baseATK: m.baseATK ?? m.attackPower,
    baseSPD: m.baseSPD ?? m.speed,
    computedHP: m.computedHP ?? m.maxHp,
    computedATK: m.computedATK ?? m.attackPower,
    computedSPD: m.computedSPD ?? m.speed,
    computedDEF: m.computedDEF ?? m.defense ?? 0,
    currentHP: m.hp,
    currentShield: m.shield || 0,
    hiddenRage: m.hiddenRage || 0,
    hitsDealt: m.hitsDealt || 0,
    skills: {
      basic: {
        id: m.skills[0].id,
        name: m.skills[0].name,
        type: 'basic_attack',
        damage: m.skills[0].baseDamage,
        description: m.skills[0].description,
      },
      utility: {
        id: m.skills[1].id,
        name: m.skills[1].name,
        type: 'utility',
        shield: m.skills[1].statusEffect?.type === 'shield' ? m.skills[1].statusEffect.value : undefined,
        heal: m.skills[1].healAmount,
        description: m.skills[1].description,
      },
      ultimate: {
        id: m.skills[2].id,
        name: m.skills[2].name,
        type: 'ultimate',
        damage: m.skills[2].baseDamage,
        unlockCondition: '2 hits OR HP < 50% OR Rage >= 3',
        usesRemaining: m.ultimateUsed ? 0 : 1,
        description: m.skills[2].description,
      },
    },
    equippedRelics: [],
    relicSlotsUsed: m.equippedRelics.length,
    relicSlotsMax: 10,
    modifiers: m.modifiers || [],
    avatar: m.avatar,
    element: m.element,
  };
}

// 5-Star Elemental Advantage (Ngũ Hành Tương Khắc Ngôi Sao 5 Cánh)
// Vòng tương khắc: Hỏa (Fire) -> Mộc (Nature) -> Thổ (Earth) -> Lôi (Thunder) -> Thủy (Water) -> Hỏa (Fire)
export const getElementMultiplier = (
  attacker: ElementType,
  defender: ElementType,
  hasPrismRelic: boolean = false
): { mult: number; note?: string; isAdvantage: boolean } => {
  const advantageMap: Record<ElementType, ElementType> = {
    fire: 'nature',
    nature: 'earth',
    earth: 'thunder',
    thunder: 'water',
    water: 'fire',
  };

  const elemNames: Record<ElementType, string> = {
    fire: 'Hỏa',
    water: 'Thủy',
    nature: 'Mộc',
    thunder: 'Lôi',
    earth: 'Thổ',
  };

  // Khắc chế (Advantage)
  if (advantageMap[attacker] === defender) {
    const bonus = hasPrismRelic ? 1.55 : 1.35;
    const bonusPct = hasPrismRelic ? '+55%' : '+35%';
    return {
      mult: bonus,
      note: `⭐ Ngũ Khắc: ${elemNames[attacker]} khắc chế ${elemNames[defender]} (${bonusPct})`,
      isAdvantage: true,
    };
  }

  // Bị khắc chế (Disadvantage)
  if (advantageMap[defender] === attacker) {
    return {
      mult: 0.75,
      note: `🛡️ Ngũ Khắc: ${elemNames[attacker]} bị giảm sát thương trước ${elemNames[defender]} (-25%)`,
      isAdvantage: false,
    };
  }

  return { mult: 1.0, isAdvantage: false };
};

// Calculate effective monster speed taking into account relics and buffs/debuffs
export const getEffectiveSpeed = (monster: MonsterCard): number => {
  let spd = monster.speed;
  // Relic speed bonus
  if (monster.equippedRelics.some(r => r.type === 'speed')) {
    spd += 1;
  }
  // Status buffs and debuffs
  for (const st of monster.statusEffects) {
    if (st.type === 'haste') spd += 1;
    if (st.type === 'freeze') spd = Math.max(1, spd - 2);
  }
  return spd;
};

export interface CombatStepAnimation {
  stepId: string;
  actorSide: 'player' | 'enemy';
  actorSlot: number;
  targetSide: 'player' | 'enemy';
  targetSlot: number;
  actionName: string;
  damage: number;
  heal?: number;
  isSplash?: boolean;
  splashTargets?: { slot: number; damage: number; burnApplied?: boolean }[];
  burnApplied?: boolean;
  poisonApplied?: boolean;
  logMessage: string;
  synergyMessage?: string;
  soundType: 'attack' | 'cleave' | 'burn' | 'heal';
  isFatalBlow?: boolean;
  isCrit?: boolean;
  isElementAdvantage?: boolean;
  isUltimate?: boolean;
  impactVFX?: ImpactVFXSpec;
  isDistanceDecayed?: boolean;
}

export interface TurnResolutionResult {
  nextPlayerParty: (MonsterCard | null)[];
  nextEnemyParty: (MonsterCard | null)[];
  animationSteps: CombatStepAnimation[];
  logs: CombatLogEntry[];
  isVictory: boolean;
  isDefeat: boolean;
  rewards?: {
    gold: number;
    gotRecruitmentCard: boolean;
    chestsCount?: number;
    keysCount?: number;
    healingHerbsCount?: number;
    shieldPotionsCount?: number;
    lockpickToolkitsCount?: number;
    relicDrop?: Relic;
  };
}

/**
 * AI lựa chọn chiêu thức và mục tiêu có sẵn cho phe Địch:
 * Tự động cân nhắc dùng Chiêu Cuối (Ultimate) nếu máu thấp và chưa dùng lần nào!
 */
export const generateEnemyActions = (
  enemies: (MonsterCard | null)[],
  playerParty: (MonsterCard | null)[]
): PlannedAction[] => {
  return enemies.map((enemy, enemySlot) => {
    if (!enemy || enemy.hp <= 0 || (enemy.exhaustTurns && enemy.exhaustTurns > 0)) {
      return { skillIndex: 0, targetSlotIndex: enemySlot };
    }

    // Check if can use Ultimate (Skill 2)
    const ultSkill = enemy.skills[2];
    const canUseUlt = ultSkill && !enemy.ultimateUsed && !ultSkill.usedThisCombat && enemy.hp <= enemy.maxHp * 0.55;

    let skillIndex: 0 | 1 | 2 = 0;
    if (canUseUlt && Math.random() < 0.65) {
      skillIndex = 2;
    } else {
      const skill2 = enemy.skills[1];
      if ((skill2.currentCooldown || 0) <= 0) {
        skillIndex = 1;
      } else {
        skillIndex = 0;
      }
    }

    const chosenSkill = enemy.skills[skillIndex];

    // Chiêu buff bản thân
    if (chosenSkill.targetType === 'self') {
      return { skillIndex, targetSlotIndex: enemySlot };
    }

    // ĐÁNH VÀO LÁ ĐỐI DIỆN (Slot đối diện)
    let targetSlot = enemySlot;
    const opposingPlayer = playerParty[targetSlot];

    // Nếu slot đối diện đã chết hoặc trống, tìm quái phe ta gần nhất còn sống
    if (!opposingPlayer || opposingPlayer.hp <= 0) {
      let nearestDist = 999;
      let bestSlot = 0;
      let foundAlive = false;

      playerParty.forEach((p, pIdx) => {
        if (p && p.hp > 0) {
          const dist = Math.abs(pIdx - enemySlot);
          if (dist < nearestDist) {
            nearestDist = dist;
            bestSlot = pIdx;
            foundAlive = true;
          }
        }
      });

      if (foundAlive) {
        targetSlot = bestSlot;
      }
    }

    return {
      skillIndex,
      targetSlotIndex: targetSlot,
    };
  });
};

/**
 * Xử lý toàn bộ lượt đấu theo nguyên tắc:
 * Đánh tuần tự từ trái sang phải (Slot 0 đến Slot 3).
 * Tại mỗi slot: lá nào có Tốc độ cao hơn sẽ ra đòn trước!
 */
export const resolveCombatTurn = (
  playerParty: (MonsterCard | null)[],
  enemyParty: (MonsterCard | null)[],
  playerActions: PlannedAction[],
  enemyActions: PlannedAction[],
  turnNumber: number,
  isBoss: boolean = false,
  isElite: boolean = false
): TurnResolutionResult => {
  const pTeam: (MonsterCard | null)[] = JSON.parse(JSON.stringify(playerParty));
  const eTeam: (MonsterCard | null)[] = JSON.parse(JSON.stringify(enemyParty));
  const animationSteps: CombatStepAnimation[] = [];
  const logs: CombatLogEntry[] = [];

  let logSeq = 1;
  const addLog = (
    actorName: string,
    isPlayer: boolean,
    msg: string,
    slotIdx?: number,
    damage?: number,
    synergy?: string
  ) => {
    logs.push({
      id: `log_${turnNumber}_${logSeq++}`,
      turn: turnNumber,
      actorName,
      actorIsPlayer: isPlayer,
      message: msg,
      slotIndex: slotIdx,
      damage,
      synergyTriggered: synergy,
    });
  };

  // Helper to execute single monster's attack
  const executeAttack = (
    actorSide: 'player' | 'enemy',
    actorSlot: number,
    action: PlannedAction
  ) => {
    const actors = actorSide === 'player' ? pTeam : eTeam;
    const defenders = actorSide === 'player' ? eTeam : pTeam;
    const actor = actors[actorSlot];

    if (!actor || actor.hp <= 0) return;

    // Check exhaust turns from using Tuyệt Kỹ (Không thể dùng chiêu trong 2 turn kế tiếp)
    if (actor.exhaustTurns && actor.exhaustTurns > 0) {
      addLog(actor.name, actorSide === 'player', `đang kiệt sức sau khi tung Tuyệt Kỹ (còn ${actor.exhaustTurns} lượt), nghỉ ngơi không ra đòn!`, actorSlot);
      animationSteps.push({
        stepId: `anim_${Date.now()}_${Math.random()}`,
        actorSide,
        actorSlot,
        targetSide: actorSide,
        targetSlot: actorSlot,
        actionName: 'Kiệt Sức (Nghỉ)',
        damage: 0,
        logMessage: `${actor.name} đang kiệt sức sau Tuyệt Kỹ (còn ${actor.exhaustTurns} lượt), nghỉ ngơi lấy lại sức!`,
        soundType: 'heal',
      });
      return;
    }

    // Check freeze (Tê Liệt) chance to skip turn
    const isFrozen = actor.statusEffects.some(s => s.type === 'freeze');
    if (isFrozen && Math.random() < 0.4) {
      addLog(actor.name, actorSide === 'player', `bị Tê Liệt Đóng Băng, không thể cử động trong lượt này!`, actorSlot);
      return;
    }

    let skillIdx = action.skillIndex;
    let skill = actor.skills[skillIdx] || actor.skills[0];

    // Fallback to basic skill (skill 0) if chosen skill is on cooldown or ultimate was already used
    const isUlt = skill.isUltimate || skillIdx === 2;
    const isUltUsed = actor.ultimateUsed || skill.usedThisCombat;
    const onCooldown = (skill.currentCooldown || 0) > 0 && !isUlt;

    if (onCooldown || (isUlt && isUltUsed)) {
      skillIdx = 0;
      skill = actor.skills[0];
    }

    // Set cooldown or mark ultimate used (Tuyệt Kỹ làm kiệt sức 2 lượt tiếp theo)
    if (skill.isUltimate || skillIdx === 2) {
      actor.ultimateUsed = true;
      actor.exhaustTurns = 2; // Không thể dùng chiêu trong 2 turn tiếp theo
      skill.usedThisCombat = true;
      skill.currentCooldown = 99;
    } else {
      skill.currentCooldown = skill.cooldown;
    }

    // RELIC: Overdrive Orb (Cường hóa tuyệt kỹ)
    const hasOverdriveOrb = actor.equippedRelics.some(r => r.type === 'overdrive_orb');
    if (skill.isUltimate && hasOverdriveOrb) {
      // Heals all alive allies +15 HP
      actors.forEach((ally, aIdx) => {
        if (ally && ally.hp > 0) {
          ally.hp = Math.min(ally.maxHp, ally.hp + 15);
        }
      });
      addLog(actor.name, actorSide === 'player', `✨ Ngọc Tuyệt Kỹ hồi ngay +15 HP cho toàn đội khi kích hoạt Tuyệt Kỹ!`, actorSlot);
    }

    // Self/Ally Buff/Heal Skills
    if (skill.targetType === 'self' || skill.targetType === 'single_ally') {
      let targetAlly = actor;
      let targetSlot = actorSlot;
      if (skill.targetType === 'single_ally') {
        let lowestHp = 9999;
        actors.forEach((ally, idx) => {
          if (ally && ally.hp > 0 && ally.hp < lowestHp) {
            lowestHp = ally.hp;
            targetAlly = ally;
            targetSlot = idx;
          }
        });
      }

      const healAmt = skill.healAmount || 0;
      if (healAmt > 0) {
        targetAlly.hp = Math.min(targetAlly.maxHp, targetAlly.hp + healAmt);
      }

      // Apply Buffs (Shield, Strengthen, Regen, Thorns, Haste)
      if (skill.statusEffect) {
        if (skill.statusEffect.type === 'shield') {
          targetAlly.shield += skill.statusEffect.value;
        } else {
          targetAlly.statusEffects.push({
            type: skill.statusEffect.type,
            duration: skill.statusEffect.duration,
            value: skill.statusEffect.value,
            sourceRelic: skill.name,
          });
        }
      }

      animationSteps.push({
        stepId: `anim_${Date.now()}_${Math.random()}`,
        actorSide,
        actorSlot,
        targetSide: actorSide,
        targetSlot,
        actionName: skill.name,
        damage: 0,
        heal: healAmt,
        logMessage: `${actor.name} thi triển [${skill.name}] ${healAmt > 0 ? `hồi phục +${healAmt} máu` : 'tăng cường hộ thể'} cho ${targetAlly.name}!`,
        soundType: 'heal',
        isUltimate: skill.isUltimate,
      });

      addLog(actor.name, actorSide === 'player', `dùng [${skill.name}]`, actorSlot, 0);
      return;
    }

    // DAMAGE SKILLS: Single Target or All Enemies
    const hasPrism = actor.equippedRelics.some(r => r.type === 'elemental_prism');
    const hasSpeedRelic = actor.equippedRelics.some(r => r.type === 'speed');
    const hasExecutioner = actor.equippedRelics.some(r => r.type === 'executioner');
    const hasVampire = actor.equippedRelics.some(r => r.type === 'vampire');
    const hasCleave = actor.equippedRelics.some(r => r.type === 'cleave');
    const hasBurnRelic = actor.equippedRelics.some(r => r.type === 'burn');
    const hasPoisonRelic = actor.equippedRelics.some(r => r.type === 'poison');
    const hasFrostbite = actor.equippedRelics.some(r => r.type === 'frostbite');
    const hasBerserkMask = actor.equippedRelics.some(r => r.type === 'berserk_mask');

    // Determine target(s)
    const targetSlotsToHit: number[] = [];
    if (skill.targetType === 'all_enemies') {
      defenders.forEach((d, idx) => {
        if (d && d.hp > 0) targetSlotsToHit.push(idx);
      });
    } else {
      let targetSlot = action.targetSlotIndex;
      if (!defenders[targetSlot] || defenders[targetSlot]!.hp <= 0) {
        const aliveIdx = defenders.findIndex(d => d && d.hp > 0);
        if (aliveIdx === -1) return;
        targetSlot = aliveIdx;
      }
      targetSlotsToHit.push(targetSlot);
    }

    if (targetSlotsToHit.length === 0) return;

    let totalDealtDamage = 0;

    targetSlotsToHit.forEach(targetSlot => {
      const target = defenders[targetSlot]!;
      const elemData = getElementMultiplier(actor.element, target.element, hasPrism);
      const distance = Math.abs(actorSlot - targetSlot);

      // Section 1 Baseline low-scale modifiers: Flat +1/+2 or small % (3-5%)
      let multiplier = elemData.mult;
      if (skill.isUltimate && hasOverdriveOrb) multiplier *= 1.5;
      if (actor.statusEffects.some(s => s.type === 'strengthen')) multiplier *= 1.25;
      if (actor.statusEffects.some(s => s.type === 'weaken')) multiplier *= 0.75;
      if (target.statusEffects.some(s => s.type === 'vulnerable')) multiplier *= 1.25;

      // Passive bonuses scaled by Tier
      const actorPassiveMult = getTierPassiveMultiplier(actor.tierLevel ?? 0);
      const targetPassiveMult = getTierPassiveMultiplier(target.tierLevel ?? 0);

      if (actor.passive.id === 'ignis_passion' && actor.hp < actor.maxHp * 0.5) {
        multiplier *= (1 + 0.25 * actorPassiveMult);
      }
      if (actor.passive.id === 'ash_fangs' && target.statusEffects.some(s => s.type === 'burn')) {
        multiplier *= (1 + 0.3 * actorPassiveMult);
      }
      if (actor.passive.id === 'high_voltage' && getEffectiveSpeed(actor) > getEffectiveSpeed(target)) {
        multiplier *= (1 + 0.2 * actorPassiveMult);
      }
      if (actor.passive.id === 'stalker_instinct' && getEffectiveSpeed(actor) > getEffectiveSpeed(target)) {
        multiplier *= (1 + 0.3 * actorPassiveMult);
      }
      if (target.passive.id === 'solid_shell') {
        multiplier *= Math.max(0.15, 1 - 0.25 * targetPassiveMult);
      }

      // Relic: Speed Blitz
      if (hasSpeedRelic && getEffectiveSpeed(actor) > getEffectiveSpeed(target)) {
        multiplier *= 1.2;
      }

      // Relic: Executioner
      if (hasExecutioner && target.hp < target.maxHp * 0.35) {
        multiplier *= 1.35;
      }

      // Relic: Berserk Mask
      if (hasBerserkMask) {
        const lostRatio = (actor.maxHp - actor.hp) / actor.maxHp;
        if (lostRatio >= 0.5) multiplier *= 1.25;
      }

      const isCrit = Math.random() < (hasExecutioner ? 0.25 : 0.1);
      const scaledBase = Math.max(1, Math.round((skill.baseDamage || actor.attackPower) * multiplier));

      const actorCardModel = monsterToCombatCard(actor);
      const targetCardModel = monsterToCombatCard(target);

      // Call pure calculateDamage function (Section 3 & 8 specs: 12% decay on dist>=2, frontline block, shield absorption)
      const dmgRes = calculateDamage(actorCardModel, targetCardModel, distance, {
        baseDamage: scaledBase,
        isCrit,
        hasFrontlineBlock: false,
      });

      const initialTargetShield = target.shield;
      target.shield = dmgRes.defenderRemainingShield;
      target.hp = dmgRes.defenderRemainingHP;
      const dealtDamage = dmgRes.hpDamage + dmgRes.shieldAbsorbed;
      totalDealtDamage += dealtDamage;

      // Track hitsDealt & hiddenRage
      actor.hitsDealt = (actor.hitsDealt || 0) + 1;
      target.hiddenRage = (target.hiddenRage || 0) + (isCrit ? 2 : 1);

      // Generate pure ImpactVFXSpec (2-phase Shield Break, popHeight, screenShake)
      const impactVFX = resolveImpactVFX(dmgRes, target.maxHp);

      // RELIC: Shield Battery on target (Explosion when shield breaks)
      if (initialTargetShield > 0 && target.shield === 0 && target.equippedRelics.some(r => r.type === 'shield_battery')) {
        actors.forEach(ally => {
          if (ally && ally.hp > 0) {
            ally.hp = Math.max(0, ally.hp - 2);
          }
        });
        addLog(target.name, actorSide !== 'player', `💥 Lõi Năng Lượng Giáp vỡ nổ phản pháo 2 ST lên toàn bộ quân địch!`, targetSlot);
      }

      // Target Thorns Relic or Thorns buff
      const hasThorns = target.equippedRelics.some(r => r.type === 'thorns') || target.statusEffects.some(s => s.type === 'thorns');
      if (hasThorns && dealtDamage > 0) {
        const reflectDmg = Math.max(1, Math.round(dealtDamage * 0.25));
        actor.hp = Math.max(0, actor.hp - reflectDmg);
        addLog(target.name, actorSide !== 'player', `Gai Phản Đòn phản lại ${reflectDmg} sát thương cho ${actor.name}!`, targetSlot);
      }

      // Apply skill status effect
      if (skill.statusEffect && target.hp > 0) {
        target.statusEffects.push({
          type: skill.statusEffect.type,
          duration: skill.statusEffect.duration,
          value: skill.statusEffect.value,
          sourceRelic: skill.name,
        });
      }

      // Apply relic DoTs
      if (hasBurnRelic && target.hp > 0) {
        target.statusEffects.push({ type: 'burn', duration: 2, value: 1, sourceRelic: 'Hỏa Tinh Phù' });
      }
      if (hasPoisonRelic && target.hp > 0) {
        target.statusEffects.push({ type: 'poison', duration: 2, value: 1, sourceRelic: 'Nanh Độc' });
      }
      if (hasFrostbite && target.hp > 0) {
        target.statusEffects.push({ type: 'freeze', duration: 1, value: 1, sourceRelic: 'Băng Bách Thạch' });
      }

      // Cleave (Đánh Lan)
      const splashTargets: { slot: number; damage: number; burnApplied?: boolean }[] = [];
      let synergyDesc = '';
      if (hasCleave && skill.targetType !== 'all_enemies') {
        const splashDmg = Math.max(1, Math.round(dealtDamage * 0.2));
        const adjacentSlots = [targetSlot - 1, targetSlot + 1];
        for (const adjIdx of adjacentSlots) {
          if (adjIdx >= 0 && adjIdx < 4) {
            const adjMonster = defenders[adjIdx];
            if (adjMonster && adjMonster.hp > 0) {
              adjMonster.hp = Math.max(0, adjMonster.hp - splashDmg);
              totalDealtDamage += splashDmg;

              let burned = false;
              if (hasBurnRelic) {
                adjMonster.statusEffects.push({ type: 'burn', duration: 2, value: 1, sourceRelic: 'Hỏa Tinh Phù (Lan)' });
                burned = true;
              }
              if (hasPoisonRelic) {
                adjMonster.statusEffects.push({ type: 'poison', duration: 2, value: 1, sourceRelic: 'Nanh Độc (Lan)' });
              }

              splashTargets.push({ slot: adjIdx, damage: splashDmg, burnApplied: burned });
            }
          }
        }
        if (splashTargets.length > 0) {
          synergyDesc = hasBurnRelic ? '🔥 [Đánh Lan + Cháy] Bốc hỏa thiêu lan sang 2 bên!' : '🌪️ [Đánh Lan] Lan 20% ST sang 2 bên!';
        }
      }

      // RELIC: Plague Catalyst (Transfer poison on kill)
      if (target.hp <= 0 && target.statusEffects.some(s => s.type === 'poison') && actor.equippedRelics.some(r => r.type === 'plague_catalyst')) {
        const adjSlots = [targetSlot - 1, targetSlot + 1];
        adjSlots.forEach(adj => {
          if (adj >= 0 && adj < 4 && defenders[adj] && defenders[adj]!.hp > 0) {
            defenders[adj]!.statusEffects.push({ type: 'poison', duration: 2, value: 2, sourceRelic: 'Bình Dịch Bệnh' });
          }
        });
        addLog(actor.name, actorSide === 'player', `☣️ Bình Độc Dược Cổ bùng phát lây lan độc sang quái vật bên cạnh!`, targetSlot);
      }

      // Animation record
      const isFatal = target.hp <= 0;
      const decayNote = distance >= 2 ? ' (Khoảng cách ≥ 2: giảm 12% ST)' : '';
      animationSteps.push({
        stepId: `anim_${Date.now()}_${Math.random()}`,
        actorSide,
        actorSlot,
        targetSide: actorSide === 'player' ? 'enemy' : 'player',
        targetSlot,
        actionName: skill.name,
        damage: dealtDamage,
        isSplash: splashTargets.length > 0,
        splashTargets,
        burnApplied: hasBurnRelic,
        poisonApplied: hasPoisonRelic,
        logMessage: `${actor.name} thi triển [${skill.name}] gây ${dealtDamage} sát thương lên ${target.name}!${decayNote} ${elemData.note || ''}${isFatal ? ' 💀 TIÊU DIỆT!' : ''}`,
        synergyMessage: synergyDesc,
        soundType: hasCleave ? 'cleave' : hasBurnRelic ? 'burn' : 'attack',
        isFatalBlow: isFatal,
        isCrit: dmgRes.isCrit,
        isElementAdvantage: elemData.isAdvantage,
        isUltimate: skill.isUltimate,
        impactVFX,
        isDistanceDecayed: distance >= 2,
      });

      addLog(
        actor.name,
        actorSide === 'player',
        `dùng [${skill.name}] gây ${dealtDamage} ST lên ${target.name}`,
        actorSlot,
        dealtDamage,
        synergyDesc
      );
    });

    // Attacker Vampire Relic
    if (hasVampire && totalDealtDamage > 0) {
      const healAmt = Math.max(2, Math.round(totalDealtDamage * 0.25));
      actor.hp = Math.min(actor.maxHp, actor.hp + healAmt);
      addLog(actor.name, actorSide === 'player', `Hạt Huyết Tộc hút máu hồi +${healAmt} HP!`, actorSlot);
    }

    // Chain Lightning Relic
    const hasLightning = actor.equippedRelics.some(r => r.type === 'chain_lightning');
    if (hasLightning && Math.random() < 0.4) {
      const otherAliveIndices = defenders
        .map((d, i) => (d && d.hp > 0 ? i : -1))
        .filter(i => i !== -1);
      if (otherAliveIndices.length > 0) {
        const zapSlot = otherAliveIndices[Math.floor(Math.random() * otherAliveIndices.length)];
        const zapTarget = defenders[zapSlot]!;
        zapTarget.hp = Math.max(0, zapTarget.hp - 14);
        addLog(actor.name, actorSide === 'player', `⚡ Lôi Thần Trụy giật sét phụ 14 ST vào ${zapTarget.name}!`, actorSlot);
      }
    }
  };

  // RESOLUTION LOOP: From Slot 0 to end (Left to Right, 3 Lanes)
  const totalSlots = Math.max(pTeam.length, eTeam.length);
  for (let slot = 0; slot < totalSlots; slot++) {
    const pCard = pTeam[slot];
    const eCard = eTeam[slot];
    const pAction = playerActions[slot];
    const eAction = enemyActions[slot];

    const pAlive = pCard && pCard.hp > 0;
    const eAlive = eCard && eCard.hp > 0;

    if (!pAlive && !eAlive) continue;

    if (pAlive && !eAlive) {
      if (pAction) executeAttack('player', slot, pAction);
    } else if (!pAlive && eAlive) {
      if (eAction) executeAttack('enemy', slot, eAction);
    } else if (pAlive && eAlive) {
      const pSpeed = getEffectiveSpeed(pCard!);
      const eSpeed = getEffectiveSpeed(eCard!);

      if (pSpeed >= eSpeed) {
        if (pAction) executeAttack('player', slot, pAction);
        if (eTeam[slot] && eTeam[slot]!.hp > 0 && eAction) {
          executeAttack('enemy', slot, eAction);
        }
      } else {
        if (eAction) executeAttack('enemy', slot, eAction);
        if (pTeam[slot] && pTeam[slot]!.hp > 0 && pAction) {
          executeAttack('player', slot, pAction);
        }
      }
    }
  }

  // POST-TURN PHASE: Tick DoT & Status Effects
  const processEndOfTurnEffects = (team: (MonsterCard | null)[], side: 'player' | 'enemy') => {
    team.forEach((card, slotIdx) => {
      if (!card || card.hp <= 0) return;

      // Passive: Photosynthesis (+5 HP scaled by tier)
      if (card.passive.id === 'photosynthesis') {
        const pMult = getTierPassiveMultiplier(card.tierLevel ?? 0);
        const healVal = Math.round(5 * pMult);
        card.hp = Math.min(card.maxHp, card.hp + healVal);
        addLog(card.name, side === 'player', `Quang hợp rừng già hồi phục +${healVal} HP`, slotIdx);
      }

      // Relic: Ancient Heart (+5 HP)
      if (card.equippedRelics.some(r => r.type === 'ancient_heart')) {
        card.hp = Math.min(card.maxHp, card.hp + 5);
        addLog(card.name, side === 'player', `Trái Tim Cổ Thụ tái sinh +5 HP`, slotIdx);
      }

      // Decrement exhaust turns from Ultimate
      if (card.exhaustTurns && card.exhaustTurns > 0) {
        card.exhaustTurns -= 1;
        if (card.exhaustTurns === 0) {
          addLog(card.name, side === 'player', `đã hồi phục thể lực sau Tuyệt Kỹ, sẵn sàng chiến đấu trở lại!`, slotIdx);
        }
      }

      // Decrement skill cooldowns
      card.skills.forEach(s => {
        if (s.currentCooldown && s.currentCooldown > 0 && !s.isUltimate) {
          s.currentCooldown -= 1;
        }
      });

      // Tick Status Effects (Burn, Poison, Regen, etc.)
      const remainingEffects = [];
      for (const effect of card.statusEffects) {
        if (effect.type === 'burn') {
          const burnDmg = Math.max(1, effect.value || 1);
          card.hp = Math.max(0, card.hp - burnDmg);
          addLog(card.name, side === 'player', `🔥 Bị thiêu đốt mất ${burnDmg} HP!`, slotIdx);
        } else if (effect.type === 'poison') {
          const poisonDmg = Math.max(1, effect.value || 1);
          card.hp = Math.max(0, card.hp - poisonDmg);
          addLog(card.name, side === 'player', `☣️ Trúng độc mất ${poisonDmg} HP!`, slotIdx);
        } else if (effect.type === 'regen') {
          const regenHeal = Math.max(1, effect.value || 2);
          card.hp = Math.min(card.maxHp, card.hp + regenHeal);
          addLog(card.name, side === 'player', `🌱 Hồi Sinh Lực hồi phục +${regenHeal} HP`, slotIdx);
        }

        effect.duration -= 1;
        if (effect.duration > 0 && card.hp > 0) {
          remainingEffects.push(effect);
        }
      }
      card.statusEffects = remainingEffects;
    });
  };

  processEndOfTurnEffects(pTeam, 'player');
  processEndOfTurnEffects(eTeam, 'enemy');

  // Check victory / defeat conditions
  const playerAliveCount = pTeam.filter(p => p && p.hp > 0).length;
  const enemyAliveCount = eTeam.filter(e => e && e.hp > 0).length;

  const isVictory = enemyAliveCount === 0;
  const isDefeat = playerAliveCount === 0;

  let rewards = undefined;
  if (isVictory) {
    const goldDrop = isBoss ? 135 : isElite ? 70 : Math.floor(35 + Math.random() * 20);
    const gotRecruitment = isBoss || Math.random() < (isElite ? 0.45 : 0.25);
    const chestsCount = isBoss ? 1 : isElite ? (Math.random() < 0.7 ? 1 : 0) : (Math.random() < 0.35 ? 1 : 0);
    const keysCount = isBoss ? 2 : isElite ? 1 : (Math.random() < 0.4 ? 1 : 0);
    const healingHerbsCount = isBoss ? 2 : isElite ? (Math.random() < 0.6 ? 1 : 0) : (Math.random() < 0.4 ? 1 : 0);
    const shieldPotionsCount = isBoss ? 1 : isElite ? (Math.random() < 0.5 ? 1 : 0) : (Math.random() < 0.3 ? 1 : 0);
    const lockpickToolkitsCount = isBoss ? 1 : isElite ? (Math.random() < 0.4 ? 1 : 0) : 0;

    let relicDrop: Relic | undefined = undefined;
    const shouldDropRelic = isBoss || isElite || Math.random() < 0.25;
    if (shouldDropRelic) {
      relicDrop = getRandomRelic();
    }

    rewards = {
      gold: goldDrop,
      gotRecruitmentCard: gotRecruitment,
      chestsCount,
      keysCount,
      healingHerbsCount,
      shieldPotionsCount,
      lockpickToolkitsCount,
      relicDrop,
    };
  }

  return {
    nextPlayerParty: pTeam,
    nextEnemyParty: eTeam,
    animationSteps,
    logs,
    isVictory,
    isDefeat,
    rewards,
  };
};

export interface SkillPreviewResult {
  expectedDamage: number;
  hpDamage: number;
  shieldDamage: number;
  projectedHp: number;
  projectedShield: number;
  isFatal: boolean;
  isAdvantage: boolean;
  isDisadvantage: boolean;
  elementMultiplier: number;
  debuffToApply?: {
    type: StatusType;
    duration: number;
    value: number;
    name?: string;
  };
  hasCleave?: boolean;
  hasBurn?: boolean;
}

/**
 * Pure calculation of projected damage and debuffs when hovering over a skill
 */
export function calculateSkillPreview(
  actor: MonsterCard,
  target: MonsterCard,
  skill: Skill,
  distance: number = 0
): SkillPreviewResult {
  const hasPrism = actor.equippedRelics.some(r => r.type === 'elemental_prism');
  const hasSpeedRelic = actor.equippedRelics.some(r => r.type === 'speed');
  const hasExecutioner = actor.equippedRelics.some(r => r.type === 'executioner');
  const hasBerserkMask = actor.equippedRelics.some(r => r.type === 'berserk_mask');
  const hasOverdriveOrb = actor.equippedRelics.some(r => r.type === 'overdrive_orb');
  const hasCleave = actor.equippedRelics.some(r => r.type === 'cleave');
  const hasBurnRelic = actor.equippedRelics.some(r => r.type === 'burn');

  const elemData = getElementMultiplier(actor.element, target.element, hasPrism);

  let multiplier = elemData.mult;
  if (skill.isUltimate && hasOverdriveOrb) multiplier *= 1.5;
  if (actor.statusEffects.some(s => s.type === 'strengthen')) multiplier *= 1.25;
  if (actor.statusEffects.some(s => s.type === 'weaken')) multiplier *= 0.75;
  if (target.statusEffects.some(s => s.type === 'vulnerable')) multiplier *= 1.25;

  const actorPassiveMult = getTierPassiveMultiplier(actor.tierLevel ?? 0);
  const targetPassiveMult = getTierPassiveMultiplier(target.tierLevel ?? 0);

  if (actor.passive.id === 'ignis_passion' && actor.hp < actor.maxHp * 0.5) {
    multiplier *= (1 + 0.25 * actorPassiveMult);
  }
  if (actor.passive.id === 'ash_fangs' && target.statusEffects.some(s => s.type === 'burn')) {
    multiplier *= (1 + 0.3 * actorPassiveMult);
  }
  if (actor.passive.id === 'high_voltage' && getEffectiveSpeed(actor) > getEffectiveSpeed(target)) {
    multiplier *= (1 + 0.2 * actorPassiveMult);
  }
  if (actor.passive.id === 'stalker_instinct' && getEffectiveSpeed(actor) > getEffectiveSpeed(target)) {
    multiplier *= (1 + 0.3 * actorPassiveMult);
  }
  if (target.passive.id === 'solid_shell') {
    multiplier *= Math.max(0.15, 1 - 0.25 * targetPassiveMult);
  }
  if (hasSpeedRelic && getEffectiveSpeed(actor) > getEffectiveSpeed(target)) {
    multiplier *= 1.2;
  }
  if (hasExecutioner && target.hp < target.maxHp * 0.35) {
    multiplier *= 1.35;
  }
  if (hasBerserkMask) {
    const lostRatio = (actor.maxHp - actor.hp) / actor.maxHp;
    if (lostRatio >= 0.5) multiplier *= 1.25;
  }

  const baseAtk = skill.baseDamage > 0 ? skill.baseDamage : actor.attackPower;
  const scaledBase = Math.max(1, Math.round(baseAtk * multiplier));

  const actorCardModel = monsterToCombatCard(actor);
  const targetCardModel = monsterToCombatCard(target);

  const dmgRes = calculateDamage(actorCardModel, targetCardModel, distance, {
    baseDamage: scaledBase,
    isCrit: false,
    hasFrontlineBlock: false,
  });

  const totalDamage = dmgRes.hpDamage + dmgRes.shieldAbsorbed;
  const projectedHp = Math.max(0, dmgRes.defenderRemainingHP);
  const projectedShield = Math.max(0, dmgRes.defenderRemainingShield);
  const isFatal = projectedHp <= 0;

  let debuffToApply = skill.statusEffect
    ? {
        type: skill.statusEffect.type,
        duration: skill.statusEffect.duration,
        value: skill.statusEffect.value,
        name: skill.name,
      }
    : undefined;

  if (!debuffToApply && hasBurnRelic && skill.baseDamage > 0) {
    debuffToApply = { type: 'burn', duration: 2, value: 1, name: 'Cổ Vật Thiêu Đốt' };
  }

  return {
    expectedDamage: totalDamage,
    hpDamage: dmgRes.hpDamage,
    shieldDamage: dmgRes.shieldAbsorbed,
    projectedHp,
    projectedShield,
    isFatal,
    isAdvantage: elemData.isAdvantage,
    isDisadvantage: elemData.mult < 1.0,
    elementMultiplier: elemData.mult,
    debuffToApply,
    hasCleave,
    hasBurn: hasBurnRelic,
  };
}
