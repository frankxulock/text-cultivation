export interface TechniqueDef {
  id: string;
  name: string;
  desc: string;
  minRealm: number;
  /** 藏经阁最低等级 */
  libraryLevel: number;
  costStone: number;
  costInsight: number;
  cultivateMul: number;
  combatMul: number;
  outputMul: number;
  breakthroughBonus: number;
}

export const TECHNIQUES: TechniqueDef[] = [
  {
    id: 'basic_breath',
    name: '吐纳诀',
    desc: '基础吐纳，略增闭关效率。',
    minRealm: 0,
    libraryLevel: 1,
    costStone: 40,
    costInsight: 8,
    cultivateMul: 1.15,
    combatMul: 1.0,
    outputMul: 1.0,
    breakthroughBonus: 0.02,
  },
  {
    id: 'iron_body',
    name: '铁体功',
    desc: '淬炼肉身，战力显著提升。',
    minRealm: 2,
    libraryLevel: 1,
    costStone: 80,
    costInsight: 12,
    cultivateMul: 1.0,
    combatMul: 1.2,
    outputMul: 1.0,
    breakthroughBonus: 0.03,
  },
  {
    id: 'spirit_farm',
    name: '聚灵诀',
    desc: '沟通地脉，提升建筑产出。',
    minRealm: 3,
    libraryLevel: 2,
    costStone: 100,
    costInsight: 15,
    cultivateMul: 1.05,
    combatMul: 1.0,
    outputMul: 1.25,
    breakthroughBonus: 0.02,
  },
  {
    id: 'cloud_step',
    name: '踏云步',
    desc: '身法灵动，战斗略优，闭关亦顺。',
    minRealm: 5,
    libraryLevel: 3,
    costStone: 160,
    costInsight: 22,
    cultivateMul: 1.12,
    combatMul: 1.15,
    outputMul: 1.05,
    breakthroughBonus: 0.05,
  },
  {
    id: 'golden_core_art',
    name: '凝金诀',
    desc: '冲击更高境界的秘法，大幅提高突破成功率。',
    minRealm: 8,
    libraryLevel: 4,
    costStone: 280,
    costInsight: 35,
    cultivateMul: 1.2,
    combatMul: 1.1,
    outputMul: 1.1,
    breakthroughBonus: 0.12,
  },
];

export function getTechnique(id: string): TechniqueDef | undefined {
  return TECHNIQUES.find((t) => t.id === id);
}

export function getActiveBonuses(techniqueIds: string[], activeId?: string): {
  cultivateMul: number;
  combatMul: number;
  outputMul: number;
  breakthroughBonus: number;
} {
  const active = activeId ? getTechnique(activeId) : undefined;
  if (!active || !techniqueIds.includes(active.id)) {
    return { cultivateMul: 1, combatMul: 1, outputMul: 1, breakthroughBonus: 0 };
  }
  return {
    cultivateMul: active.cultivateMul,
    combatMul: active.combatMul,
    outputMul: active.outputMul,
    breakthroughBonus: active.breakthroughBonus,
  };
}
