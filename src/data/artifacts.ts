export interface ArtifactDef {
  id: string;
  name: string;
  desc: string;
  powerBonus: number;
  cultivateBonus: number;
  combatMul: number;
  rarity: 'common' | 'rare' | 'epic';
  /** 坊市购买价；外出掉落则无价 */
  marketPrice?: number;
  minRealm: number;
}

export const ARTIFACTS: ArtifactDef[] = [
  {
    id: 'wood_sword',
    name: '青木剑',
    desc: '寻常飞剑，聊胜于无。',
    powerBonus: 25,
    cultivateBonus: 0,
    combatMul: 1.05,
    rarity: 'common',
    marketPrice: 60,
    minRealm: 0,
  },
  {
    id: 'spirit_bead',
    name: '聚灵珠',
    desc: '辅助吐纳的宝珠。',
    powerBonus: 10,
    cultivateBonus: 0.1,
    combatMul: 1.0,
    rarity: 'common',
    marketPrice: 80,
    minRealm: 1,
  },
  {
    id: 'frost_blade',
    name: '霜华刃',
    desc: '寒气逼人，斩妖除魔利器。',
    powerBonus: 80,
    cultivateBonus: 0,
    combatMul: 1.15,
    rarity: 'rare',
    marketPrice: 220,
    minRealm: 4,
  },
  {
    id: 'dao_mirror',
    name: '问道镜',
    desc: '观镜可照见心魔，助突破。',
    powerBonus: 40,
    cultivateBonus: 0.15,
    combatMul: 1.05,
    rarity: 'rare',
    marketPrice: 260,
    minRealm: 6,
  },
  {
    id: 'void_seal',
    name: '虚空印',
    desc: '上古残印，战力与修炼皆非凡。',
    powerBonus: 180,
    cultivateBonus: 0.2,
    combatMul: 1.25,
    rarity: 'epic',
    minRealm: 9,
  },
];

export function getArtifact(id: string): ArtifactDef | undefined {
  return ARTIFACTS.find((a) => a.id === id);
}
