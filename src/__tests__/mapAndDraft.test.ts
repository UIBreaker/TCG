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

  it('draft provides 6 distinct starter candidates for 2-stage Mulligan', () => {
    const pool = getRandomStarterChoices(6);
    expect(pool.length).toBe(6);

    const ids = new Set(pool.map(c => c.templateId || c.id));
    // At least 3 different templates
    expect(ids.size).toBeGreaterThanOrEqual(3);

    // Each starter has baseline low-scale stats
    pool.forEach(card => {
      expect(card.hp).toBeGreaterThanOrEqual(6);
      expect(card.hp).toBeLessThanOrEqual(14);
      expect(card.attackPower).toBeGreaterThanOrEqual(1);
      expect(card.attackPower).toBeLessThanOrEqual(5);
      expect(card.speed).toBeGreaterThanOrEqual(1);
      expect(card.speed).toBeLessThanOrEqual(5);
    });
  });
});
