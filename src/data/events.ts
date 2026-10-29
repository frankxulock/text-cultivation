import type { LocationId } from './locations';

export type EventKind = 'adventure' | 'battle' | 'idle' | 'trade';

export interface GameEventDef {
  id: string;
  kind: EventKind;
  location: LocationId | 'any';
  minRealm: number;
  weight: number;
  text: string;
  enemyPowerRatio?: number;
  enemyName?: string;
  rewardStone?: [number, number];
  rewardQi?: [number, number];
  rewardHerb?: [number, number];
  rewardFame?: [number, number];
  rewardInsight?: [number, number];
  /** 掉落法宝 id（概率在系统里掷） */
  artifactDrop?: string;
  artifactChance?: number;
  winStone?: [number, number];
  winQi?: [number, number];
  winFame?: [number, number];
  loseStone?: [number, number];
  loseQi?: [number, number];
  loseFame?: [number, number];
  /** 坊市可购买的法宝 id */
  shopArtifact?: string;
}

export const EVENTS: GameEventDef[] = [
  {
    id: 'm_idle',
    kind: 'idle',
    location: 'mountain',
    minRealm: 0,
    weight: 6,
    text: '山间云雾缭绕，你信步而行，心境平和。',
  },
  {
    id: 'm_herb',
    kind: 'adventure',
    location: 'mountain',
    minRealm: 0,
    weight: 12,
    text: '你在山涧发现一丛灵草，小心采摘入囊。',
    rewardHerb: [4, 10],
  },
  {
    id: 'm_stone',
    kind: 'adventure',
    location: 'mountain',
    minRealm: 0,
    weight: 8,
    text: '乱石堆中闪过微光——竟是几枚散落的灵石！',
    rewardStone: [10, 28],
  },
  {
    id: 'm_qi',
    kind: 'adventure',
    location: 'mountain',
    minRealm: 1,
    weight: 7,
    text: '你盘坐于灵泉旁片刻，周身灵气充盈。',
    rewardQi: [5, 14],
  },
  {
    id: 'm_wolf',
    kind: 'battle',
    location: 'mountain',
    minRealm: 0,
    weight: 10,
    text: '林中窜出一头妖狼，龇牙扑来！',
    enemyName: '妖狼',
    enemyPowerRatio: 0.75,
    winStone: [8, 20],
    winQi: [1, 4],
    winFame: [1, 3],
    loseStone: [5, 12],
    loseQi: [1, 3],
  },
  {
    id: 'm_snake',
    kind: 'battle',
    location: 'mountain',
    minRealm: 3,
    weight: 7,
    text: '毒雾中现身一条青鳞巨蟒。',
    enemyName: '青鳞巨蟒',
    enemyPowerRatio: 1.1,
    winStone: [25, 50],
    winQi: [4, 8],
    winFame: [2, 5],
    loseStone: [15, 35],
    loseQi: [3, 7],
    loseFame: [0, 2],
  },
  {
    id: 'm_beast',
    kind: 'battle',
    location: 'mountain',
    minRealm: 5,
    weight: 5,
    text: '洞穴深处，一头二阶妖兽护着巢穴。',
    enemyName: '二阶妖兽',
    enemyPowerRatio: 1.25,
    winStone: [40, 80],
    winQi: [5, 12],
    winFame: [3, 6],
    artifactDrop: 'frost_blade',
    artifactChance: 0.08,
    loseStone: [20, 45],
    loseQi: [4, 9],
  },
  {
    id: 'mk_idle',
    kind: 'idle',
    location: 'market',
    minRealm: 1,
    weight: 5,
    text: '坊市人声嘈杂，你喝了杯灵茶便离开。',
  },
  {
    id: 'mk_trade_herb',
    kind: 'trade',
    location: 'market',
    minRealm: 1,
    weight: 10,
    text: '药铺掌柜愿高价收购灵草。你出手若干。',
    rewardStone: [15, 35],
    rewardHerb: [-8, -3],
    rewardFame: [0, 2],
  },
  {
    id: 'mk_buy_sword',
    kind: 'trade',
    location: 'market',
    minRealm: 1,
    weight: 6,
    text: '兵器摊上有一柄青木剑，价码尚可。',
    shopArtifact: 'wood_sword',
  },
  {
    id: 'mk_buy_bead',
    kind: 'trade',
    location: 'market',
    minRealm: 2,
    weight: 5,
    text: '散修兜售一枚聚灵珠，声称能助吐纳。',
    shopArtifact: 'spirit_bead',
  },
  {
    id: 'mk_buy_frost',
    kind: 'trade',
    location: 'market',
    minRealm: 5,
    weight: 3,
    text: '黑市柜中寒光一闪——霜华刃！',
    shopArtifact: 'frost_blade',
  },
  {
    id: 'mk_brawl',
    kind: 'battle',
    location: 'market',
    minRealm: 1,
    weight: 6,
    text: '有人当街起哄抢货，冲突不可避免。',
    enemyName: '市井散修',
    enemyPowerRatio: 0.9,
    winStone: [12, 28],
    winFame: [2, 5],
    loseStone: [10, 22],
    loseFame: [1, 3],
  },
  {
    id: 'mk_rumor',
    kind: 'adventure',
    location: 'market',
    minRealm: 2,
    weight: 7,
    text: '茶楼听闻秘辛，你心有所悟。',
    rewardInsight: [2, 6],
    rewardFame: [1, 3],
  },
  {
    id: 'r_idle',
    kind: 'idle',
    location: 'ruins',
    minRealm: 4,
    weight: 4,
    text: '秘境迷雾弥漫，你谨慎探路，暂无所获。',
  },
  {
    id: 'r_cache',
    kind: 'adventure',
    location: 'ruins',
    minRealm: 4,
    weight: 9,
    text: '残破祭坛下挖出一箱灵石与残页。',
    rewardStone: [40, 90],
    rewardInsight: [3, 8],
  },
  {
    id: 'r_ghost',
    kind: 'battle',
    location: 'ruins',
    minRealm: 4,
    weight: 10,
    text: '古战场残魂汇聚成影，向你扑来！',
    enemyName: '古战场残魂',
    enemyPowerRatio: 1.35,
    winStone: [60, 120],
    winQi: [8, 16],
    winFame: [4, 8],
    artifactDrop: 'dao_mirror',
    artifactChance: 0.1,
    loseStone: [30, 60],
    loseQi: [6, 12],
    loseFame: [1, 4],
  },
  {
    id: 'r_elder',
    kind: 'battle',
    location: 'ruins',
    minRealm: 8,
    weight: 5,
    text: '守护遗迹的禁制化作人形，威压如山。',
    enemyName: '禁制化身',
    enemyPowerRatio: 1.55,
    winStone: [100, 200],
    winQi: [12, 24],
    winFame: [8, 15],
    artifactDrop: 'void_seal',
    artifactChance: 0.12,
    loseStone: [50, 100],
    loseQi: [8, 15],
  },
  {
    id: 'r_jade',
    kind: 'adventure',
    location: 'ruins',
    minRealm: 6,
    weight: 6,
    text: '你得一枚残破玉简，内含功法碎片。',
    rewardInsight: [8, 16],
    rewardQi: [5, 12],
  },
  {
    id: 'any_rain',
    kind: 'adventure',
    location: 'any',
    minRealm: 0,
    weight: 4,
    text: '灵雨忽至，你张开衣袖承接，浑身舒畅。',
    rewardQi: [4, 10],
  },
];

export function pickEvent(realmIndex: number, location: LocationId): GameEventDef {
  const pool = EVENTS.filter(
    (e) => e.minRealm <= realmIndex && (e.location === location || e.location === 'any'),
  );
  const total = pool.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * total;
  for (const event of pool) {
    roll -= event.weight;
    if (roll <= 0) {
      return event;
    }
  }
  return pool[pool.length - 1];
}

export function rollRange(range: [number, number]): number {
  const [min, max] = range;
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(lo + Math.random() * (hi - lo + 1));
}
