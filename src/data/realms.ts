export interface RealmDef {
  name: string;
  /** 突破所需修为 */
  needCultivation: number;
  /** 突破后战力基础值 */
  basePower: number;
  /** 闭关修为系数 */
  cultivateFactor: number;
  /** 闭关消耗灵气 */
  qiCost: number;
}

/** 炼气 1–9 → 筑基 → 金丹 */
export const REALMS: RealmDef[] = [
  { name: '炼气一层', needCultivation: 100, basePower: 20, cultivateFactor: 1.0, qiCost: 2 },
  { name: '炼气二层', needCultivation: 150, basePower: 35, cultivateFactor: 1.1, qiCost: 2 },
  { name: '炼气三层', needCultivation: 220, basePower: 55, cultivateFactor: 1.2, qiCost: 3 },
  { name: '炼气四层', needCultivation: 320, basePower: 80, cultivateFactor: 1.3, qiCost: 3 },
  { name: '炼气五层', needCultivation: 450, basePower: 110, cultivateFactor: 1.4, qiCost: 4 },
  { name: '炼气六层', needCultivation: 620, basePower: 150, cultivateFactor: 1.5, qiCost: 4 },
  { name: '炼气七层', needCultivation: 850, basePower: 200, cultivateFactor: 1.6, qiCost: 5 },
  { name: '炼气八层', needCultivation: 1100, basePower: 260, cultivateFactor: 1.7, qiCost: 5 },
  { name: '炼气九层', needCultivation: 1500, basePower: 340, cultivateFactor: 1.8, qiCost: 6 },
  { name: '筑基初期', needCultivation: 2200, basePower: 450, cultivateFactor: 2.0, qiCost: 8 },
  { name: '筑基中期', needCultivation: 3200, basePower: 600, cultivateFactor: 2.2, qiCost: 10 },
  { name: '筑基后期', needCultivation: 4500, basePower: 800, cultivateFactor: 2.4, qiCost: 12 },
  { name: '金丹初期', needCultivation: 6500, basePower: 1100, cultivateFactor: 2.8, qiCost: 15 },
  { name: '金丹中期', needCultivation: 9000, basePower: 1500, cultivateFactor: 3.2, qiCost: 18 },
  { name: '金丹后期', needCultivation: 99999, basePower: 2000, cultivateFactor: 3.6, qiCost: 22 },
];

export function getRealm(index: number): RealmDef {
  const clamped = Math.max(0, Math.min(index, REALMS.length - 1));
  return REALMS[clamped];
}
