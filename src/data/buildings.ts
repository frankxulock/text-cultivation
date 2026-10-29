export type BuildingId = 'garden' | 'forge' | 'vein' | 'library';

export interface BuildingDef {
  id: BuildingId;
  name: string;
  baseOutput: number;
  costBase: number;
  maxLevel: number;
  outputLabel: string;
  /** 解锁所需最低境界索引，0 表示开局可用 */
  unlockRealm: number;
}

export const BUILDINGS: BuildingDef[] = [
  {
    id: 'garden',
    name: '药园',
    baseOutput: 4,
    costBase: 30,
    maxLevel: 12,
    outputLabel: '灵草',
    unlockRealm: 0,
  },
  {
    id: 'forge',
    name: '炼器坊',
    baseOutput: 3,
    costBase: 40,
    maxLevel: 12,
    outputLabel: '灵石',
    unlockRealm: 0,
  },
  {
    id: 'vein',
    name: '灵脉',
    baseOutput: 2,
    costBase: 55,
    maxLevel: 10,
    outputLabel: '灵气',
    unlockRealm: 2,
  },
  {
    id: 'library',
    name: '藏经阁',
    baseOutput: 1,
    costBase: 60,
    maxLevel: 8,
    outputLabel: '悟性',
    unlockRealm: 3,
  },
];

export function getBuildingDef(id: BuildingId): BuildingDef {
  const found = BUILDINGS.find((b) => b.id === id);
  if (!found) {
    throw new Error(`Unknown building: ${id}`);
  }
  return found;
}

/** 日产出 = base * level * (1 + 0.3 * assigned) * outputMul */
export function calcDailyOutput(
  base: number,
  level: number,
  assigned: number,
  outputMul = 1,
): number {
  return Math.floor(base * level * (1 + 0.3 * assigned) * outputMul);
}

export function calcUpgradeCost(costBase: number, level: number): number {
  return costBase * level;
}

export const BASE_MAX_DISCIPLES = 3;
export const RECRUIT_COST = 50;

export function getMaxDisciples(fame: number, libraryLevel: number): number {
  return BASE_MAX_DISCIPLES + Math.floor(fame / 40) + Math.floor(libraryLevel / 3);
}
