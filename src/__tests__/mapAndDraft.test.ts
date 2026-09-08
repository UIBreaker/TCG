import { describe, it, expect } from 'vitest';
import { generateForestMap, advanceMapNode } from '../engine/mapGenerator';
import { getRandomStarterChoices } from '../data/monsters';

describe('DAG Map & Starter Draft Integration', () => {
  it('generates a complete 7-floor map with all required node types', () => {
    const map = generateForestMap();
    expect(map.length).toBeGreaterThanOrEqual(13);

    const floorNumbers = new Set(map.map(n => n.floor));
    expect(floorNumbers.size).toBe(7);

    // Verify node types present
    const types = new Set(map.map(n => n.type));
    expect(types.has('battle')).toBe(true);
    expect(types.has('elite')).toBe(true);
    expect(types.has('sanctuary')).toBe(true);
    expect(types.has('vault')).toBe(true);
    expect(types.has('shop')).toBe(true);
    expect(types.has('rest')).toBe(true);
    expect(types.has('event')).toBe(true);
    expect(types.has('boss')).toBe(true);
  });

  it('provides rich Enemy Preview data for all combat nodes', () => {
    const map = generateForestMap();
    const combatNodes = map.filter(n => n.type === 'battle' || n.type === 'elite' || n.type === 'boss');

    combatNodes.forEach(node => {
      expect(node.previewEnemy).toBeDefined();
      expect(node.previewEnemy?.name).toBeTruthy();
      expect(node.previewEnemy?.avatar).toBeTruthy();
      expect(node.previewEnemy?.element).toBeTruthy();
      expect(node.previewEnemy?.tier).toBeTruthy();
      expect(node.previewEnemy?.difficulty).toBeTruthy();
      expect(node.previewEnemy?.threatNote).toBeTruthy();
      expect(node.previewEnemy?.expectedMonsters.length).toBeGreaterThan(0);
    });
  });

  it('correctly advances DAG nodes when completed', () => {
    const map = generateForestMap();
    const startNode = map.find(n => n.id === 'f1_n0');
    expect(startNode?.available).toBe(true);

    const updatedMap = advanceMapNode(map, 'f1_n0');
    const completedNode = updatedMap.find(n => n.id === 'f1_n0');
    expect(completedNode?.cleared).toBe(true);
    expect(completedNode?.available).toBe(false);

    // Other floor 1 nodes should now be unavailable
    const f1_n1 = updatedMap.find(n => n.id === 'f1_n1');
    expect(f1_n1?.available).toBe(false);

    // Connected floor 2 nodes should become available
    startNode?.connectedTo.forEach(targetId => {
      const child = updatedMap.find(n => n.id === targetId);
      expect(child?.available).toBe(true);
    });
  });

  it('draft provides 6 distinct starter candidates with valid stats', () => {
    const pool = getRandomStarterChoices(6);
    expect(pool.length).toBe(6);

    const ids = new Set(pool.map(c => c.templateId || c.id));
    // At least 3 different templates
    expect(ids.size).toBeGreaterThanOrEqual(3);

    // Each starter has valid low-tier stats (C, UC, or R only)
    pool.forEach(card => {
      expect(['C', 'UC', 'R']).toContain(card.tier);
      expect(card.hp).toBeGreaterThanOrEqual(6);
      expect(card.hp).toBeLessThanOrEqual(22);
      expect(card.attackPower).toBeGreaterThanOrEqual(1);
      expect(card.attackPower).toBeLessThanOrEqual(8);
      expect(card.speed).toBeGreaterThanOrEqual(1);
      expect(card.speed).toBeLessThanOrEqual(8);
    });
  });

  it('enforces starter draft gacha rates: 90% C, 9% UC, 1% R, 0% high tiers', () => {
    const trials = 2000;
    const tierCounts: Record<string, number> = { C: 0, UC: 0, R: 0, OTHER: 0 };

    for (let i = 0; i < trials; i++) {
      const candidates = getRandomStarterChoices(1);
      const card = candidates[0];
      const tier = card.tier || 'C';
      if (tier === 'C') tierCounts.C++;
      else if (tier === 'UC') tierCounts.UC++;
      else if (tier === 'R') tierCounts.R++;
      else tierCounts.OTHER++;
    }

    // Absolutely NO SR, SSR, UR, MR, TR in draft!
    expect(tierCounts.OTHER).toBe(0);

    // Verify statistical boundaries (with 2000 samples):
    // C ~ 90% (allow 85% - 95%)
    const cRate = tierCounts.C / trials;
    expect(cRate).toBeGreaterThan(0.85);
    expect(cRate).toBeLessThan(0.95);

    // UC ~ 9% (allow 5% - 13%)
    const ucRate = tierCounts.UC / trials;
    expect(ucRate).toBeGreaterThan(0.05);
    expect(ucRate).toBeLessThan(0.13);

    // R ~ 1% (allow 0.1% - 3%)
    const rRate = tierCounts.R / trials;
    expect(rRate).toBeGreaterThanOrEqual(0.001);
    expect(rRate).toBeLessThan(0.035);
  });
});
