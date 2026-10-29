export interface PillDef {
  id: string;
  name: string;
  desc: string;
  herbCost: number;
  stoneCost: number;
  /** 炼丹成功率 */
  successRate: number;
  minRealm: number;
  effect: 'qi' | 'cultivate_buff' | 'combat_buff' | 'breakthrough' | 'heal_fame';
  /** 效果数值：回气量 / buff 倍率加成 / 突破加成 */
  value: number;
  /** buff 持续天数（即时效果为 0） */
  durationDays: number;
}

export const PILLS: PillDef[] = [
  {
    id: 'qi_pill',
    name: '回气丹',
    desc: '服下立刻恢复灵气。',
    herbCost: 6,
    stoneCost: 5,
    successRate: 0.9,
    minRealm: 0,
    effect: 'qi',
    value: 12,
    durationDays: 0,
  },
  {
    id: 'focus_pill',
    name: '凝神丹',
    desc: '数日内闭关效率大增。',
    herbCost: 12,
    stoneCost: 15,
    successRate: 0.75,
    minRealm: 1,
    effect: 'cultivate_buff',
    value: 0.35,
    durationDays: 5,
  },
  {
    id: 'war_pill',
    name: '破军丹',
    desc: '短时战力飙升，适合外出。',
    herbCost: 10,
    stoneCost: 20,
    successRate: 0.7,
    minRealm: 2,
    effect: 'combat_buff',
    value: 0.3,
    durationDays: 3,
  },
  {
    id: 'break_pill',
    name: '破境丹',
    desc: '下次突破大幅提高成功率（可叠一层）。',
    herbCost: 20,
    stoneCost: 40,
    successRate: 0.55,
    minRealm: 4,
    effect: 'breakthrough',
    value: 0.25,
    durationDays: 0,
  },
  {
    id: 'virtue_pill',
    name: '清心丹',
    desc: '洗涤心魔，略增宗门声望。',
    herbCost: 8,
    stoneCost: 10,
    successRate: 0.85,
    minRealm: 1,
    effect: 'heal_fame',
    value: 8,
    durationDays: 0,
  },
];

export function getPill(id: string): PillDef | undefined {
  return PILLS.find((p) => p.id === id);
}
