import type { BuildingId } from '../data/buildings';
import { BUILDINGS } from '../data/buildings';
import { getArtifact } from '../data/artifacts';
import { getActiveBonuses } from '../data/techniques';
import { getRealm } from '../data/realms';

export interface BuildingState {
  id: BuildingId;
  level: number;
  assigned: number;
}

export interface Disciple {
  name: string;
  power: number;
  level: number;
  assignedTo?: BuildingId;
}

export interface BuffState {
  kind: 'cultivate_buff' | 'combat_buff';
  value: number;
  expireDay: number;
}

export interface GameStats {
  cultivateCount: number;
  outingCount: number;
  battleWins: number;
  breakthroughs: number;
  recruitCount: number;
  alchemySuccess: number;
  techLearned: number;
  adRewards: number;
}

export interface AdDayState {
  date: string;
  rewardCount: number;
  outingSinceInterstitial: number;
}

export interface GameState {
  day: number;
  name: string;
  realmIndex: number;
  cultivation: number;
  qi: number;
  spiritStone: number;
  herb: number;
  insight: number;
  fame: number;
  power: number;
  buildings: BuildingState[];
  disciples: Disciple[];
  techniques: string[];
  activeTechnique?: string;
  pills: Record<string, number>;
  artifacts: string[];
  equippedArtifact?: string;
  /** 破境丹层数（突破时消耗） */
  breakCharges: number;
  buffs: BuffState[];
  questProgress: Record<string, number>;
  completedQuests: string[];
  stats: GameStats;
  /** TG 激励广告日计数 */
  adDay?: AdDayState;
  /** 是否已领取邀请启动奖励 */
  inviteClaimed?: boolean;
  tgId?: string;
  log: string[];
}

const DISCIPLE_NAMES = [
  '青云', '墨尘', '白芷', '玄机', '凌霜',
  '夜阑', '疏影', '清和', '无尘', '归真',
  '寒山', '听雨', '逐月', '怀远', '照夜',
];

function emptyStats(): GameStats {
  return {
    cultivateCount: 0,
    outingCount: 0,
    battleWins: 0,
    breakthroughs: 0,
    recruitCount: 0,
    alchemySuccess: 0,
    techLearned: 0,
    adRewards: 0,
  };
}

export function createInitialState(playerName = '无名散修'): GameState {
  const realm = getRealm(0);
  return {
    day: 1,
    name: playerName,
    realmIndex: 0,
    cultivation: 0,
    qi: 20,
    spiritStone: 80,
    herb: 0,
    insight: 0,
    fame: 0,
    power: realm.basePower,
    buildings: BUILDINGS.filter((b) => b.unlockRealm === 0).map((b) => ({
      id: b.id,
      level: 1,
      assigned: 0,
    })),
    disciples: [],
    techniques: [],
    pills: {},
    artifacts: [],
    breakCharges: 0,
    buffs: [],
    questProgress: {},
    completedQuests: [],
    stats: emptyStats(),
    log: [
      `【开局】你踏入修仙之路，如今乃${realm.name}。宗门初立，万事待兴。`,
      '提示：闭关 / 经营 / 外出 / 炼丹 / 功法；亦可「看广告」领取天机补给（TG AdsGram）。境界提升后解锁灵脉与藏经阁。',
    ],
  };
}

export function getCombatMul(state: GameState): number {
  const tech = getActiveBonuses(state.techniques, state.activeTechnique);
  const art = state.equippedArtifact ? getArtifact(state.equippedArtifact) : undefined;
  let mul = tech.combatMul * (art?.combatMul ?? 1);
  for (const buff of state.buffs) {
    if (buff.kind === 'combat_buff' && buff.expireDay >= state.day) {
      mul += buff.value;
    }
  }
  return mul;
}

export function getCultivateMul(state: GameState): number {
  const tech = getActiveBonuses(state.techniques, state.activeTechnique);
  const art = state.equippedArtifact ? getArtifact(state.equippedArtifact) : undefined;
  let mul = tech.cultivateMul * (1 + (art?.cultivateBonus ?? 0));
  for (const buff of state.buffs) {
    if (buff.kind === 'cultivate_buff' && buff.expireDay >= state.day) {
      mul += buff.value;
    }
  }
  return mul;
}

export function getOutputMul(state: GameState): number {
  return getActiveBonuses(state.techniques, state.activeTechnique).outputMul;
}

export function getBreakthroughBonus(state: GameState): number {
  return getActiveBonuses(state.techniques, state.activeTechnique).breakthroughBonus;
}

export function recalcPower(state: GameState): void {
  const realm = getRealm(state.realmIndex);
  const discipleBonus = state.disciples.reduce(
    (sum, d) => sum + Math.floor(d.power * (0.12 + d.level * 0.02)),
    0,
  );
  const art = state.equippedArtifact ? getArtifact(state.equippedArtifact) : undefined;
  const artBonus = art?.powerBonus ?? 0;
  const base = realm.basePower + discipleBonus + Math.floor(state.cultivation / 50) + artBonus;
  state.power = Math.floor(base * getCombatMul(state));
}

export function pushLog(state: GameState, message: string): void {
  state.log.push(message);
  if (state.log.length > 100) {
    state.log = state.log.slice(-100);
  }
}

export function randomDiscipleName(existing: Disciple[]): string {
  const used = new Set(existing.map((d) => d.name));
  const available = DISCIPLE_NAMES.filter((n) => !used.has(n));
  if (available.length === 0) {
    return `弟子${existing.length + 1}`;
  }
  return available[Math.floor(Math.random() * available.length)];
}

export function pruneBuffs(state: GameState): void {
  state.buffs = state.buffs.filter((b) => b.expireDay >= state.day);
}

/** 将旧存档补齐新字段、补全建筑 */
export function migrateState(raw: Partial<GameState>): GameState {
  const base = createInitialState(raw.name);
  const merged: GameState = {
    ...base,
    ...raw,
    buildings: Array.isArray(raw.buildings) ? raw.buildings : base.buildings,
    disciples: Array.isArray(raw.disciples) ? raw.disciples : [],
    techniques: Array.isArray(raw.techniques) ? raw.techniques : [],
    pills: raw.pills ?? {},
    artifacts: Array.isArray(raw.artifacts) ? raw.artifacts : [],
    buffs: Array.isArray(raw.buffs) ? raw.buffs : [],
    questProgress: raw.questProgress ?? {},
    completedQuests: Array.isArray(raw.completedQuests) ? raw.completedQuests : [],
    stats: { ...emptyStats(), ...(raw.stats ?? {}) },
    insight: raw.insight ?? 0,
    fame: raw.fame ?? 0,
    breakCharges: raw.breakCharges ?? 0,
    log: Array.isArray(raw.log) ? raw.log : base.log,
  };

  for (const def of BUILDINGS) {
    if (def.unlockRealm > merged.realmIndex) {
      continue;
    }
    if (!merged.buildings.some((b) => b.id === def.id)) {
      merged.buildings.push({ id: def.id, level: 1, assigned: 0 });
    }
  }

  merged.disciples = merged.disciples.map((d) => ({
    ...d,
    level: d.level ?? 1,
  }));

  recalcPower(merged);
  return merged;
}
