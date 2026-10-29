import {
  BUILDINGS,
  calcDailyOutput,
  calcUpgradeCost,
  getBuildingDef,
  getMaxDisciples,
  RECRUIT_COST,
  type BuildingId,
} from '../data/buildings';
import {
  getOutputMul,
  pushLog,
  randomDiscipleName,
  recalcPower,
  type GameState,
} from '../model/GameState';
import { advanceDays } from './DaySys';
import { syncQuestProgress } from './QuestSys';

export interface ManageResult {
  ok: boolean;
  message: string;
}

function libraryLevel(state: GameState): number {
  return state.buildings.find((b) => b.id === 'library')?.level ?? 0;
}

export function getBuildingLines(state: GameState): string[] {
  const mul = getOutputMul(state);
  return state.buildings.map((b) => {
    const def = getBuildingDef(b.id);
    const daily = calcDailyOutput(def.baseOutput, b.level, b.assigned, mul);
    return `${def.name} Lv${b.level}（弟子×${b.assigned}）日产 ${daily} ${def.outputLabel}`;
  });
}

export function upgradeBuilding(state: GameState, id: BuildingId): ManageResult {
  const building = state.buildings.find((b) => b.id === id);
  if (!building) {
    return { ok: false, message: '建筑未解锁或不存在。' };
  }
  const def = getBuildingDef(id);
  if (building.level >= def.maxLevel) {
    const message = `${def.name}已达最高等级。`;
    pushLog(state, message);
    return { ok: false, message };
  }
  const cost = calcUpgradeCost(def.costBase, building.level);
  if (state.spiritStone < cost) {
    const message = `灵石不足，升级${def.name}需要 ${cost} 灵石。`;
    pushLog(state, message);
    return { ok: false, message };
  }

  state.spiritStone -= cost;
  building.level += 1;
  advanceDays(state, 1);
  const message = `耗费 ${cost} 灵石，将${def.name}升至 Lv${building.level}。`;
  pushLog(state, message);
  return { ok: true, message };
}

export function recruitDisciple(state: GameState): ManageResult {
  const max = getMaxDisciples(state.fame, libraryLevel(state));
  if (state.disciples.length >= max) {
    const message = `弟子已满（当前上限 ${max}，声望/藏经阁可提高）。`;
    pushLog(state, message);
    return { ok: false, message };
  }
  const cost = RECRUIT_COST + state.disciples.length * 20;
  if (state.spiritStone < cost) {
    const message = `收徒需要 ${cost} 灵石。`;
    pushLog(state, message);
    return { ok: false, message };
  }

  state.spiritStone -= cost;
  const name = randomDiscipleName(state.disciples);
  const fameBonus = Math.floor(state.fame / 25);
  const power = 15 + Math.floor(Math.random() * 20) + state.realmIndex * 5 + fameBonus;
  state.disciples.push({ name, power, level: 1 });
  state.stats.recruitCount += 1;
  state.fame += 2;
  recalcPower(state);
  advanceDays(state, 1);
  syncQuestProgress(state);
  const message = `收下弟子「${name}」（战力 ${power} Lv1），耗灵石 ${cost}。声望 +2。`;
  pushLog(state, message);
  return { ok: true, message };
}

export function trainDisciple(state: GameState, discipleIndex: number): ManageResult {
  const disciple = state.disciples[discipleIndex];
  if (!disciple) {
    return { ok: false, message: '弟子不存在。' };
  }
  if (disciple.assignedTo) {
    const message = `「${disciple.name}」正在任职，请先卸任再培养。`;
    pushLog(state, message);
    return { ok: false, message };
  }
  if (disciple.level >= 5) {
    const message = `「${disciple.name}」已达弟子圆满。`;
    pushLog(state, message);
    return { ok: false, message };
  }
  const cost = 25 + disciple.level * 20;
  if (state.spiritStone < cost) {
    const message = `培养需要 ${cost} 灵石。`;
    pushLog(state, message);
    return { ok: false, message };
  }
  if (state.qi < 3) {
    return { ok: false, message: '培养至少需要 3 点灵气。' };
  }

  state.spiritStone -= cost;
  state.qi -= 3;
  disciple.level += 1;
  const gain = 8 + disciple.level * 4 + Math.floor(Math.random() * 6);
  disciple.power += gain;
  recalcPower(state);
  advanceDays(state, 1);
  const message = `指点「${disciple.name}」修炼，升至 Lv${disciple.level}，战力 +${gain}（耗 ${cost} 灵石、3 灵气）。`;
  pushLog(state, message);
  return { ok: true, message };
}

export function assignDisciple(
  state: GameState,
  discipleIndex: number,
  buildingId: BuildingId | null,
): ManageResult {
  const disciple = state.disciples[discipleIndex];
  if (!disciple) {
    return { ok: false, message: '弟子不存在。' };
  }

  if (disciple.assignedTo) {
    const prev = state.buildings.find((b) => b.id === disciple.assignedTo);
    if (prev && prev.assigned > 0) {
      prev.assigned -= 1;
    }
    disciple.assignedTo = undefined;
  }

  if (buildingId === null) {
    const message = `弟子「${disciple.name}」已卸任，暂无职守。`;
    pushLog(state, message);
    return { ok: true, message };
  }

  const building = state.buildings.find((b) => b.id === buildingId);
  if (!building) {
    return { ok: false, message: '建筑未解锁。' };
  }

  disciple.assignedTo = buildingId;
  building.assigned += 1;
  const def = getBuildingDef(buildingId);
  const message = `弟子「${disciple.name}」被派往${def.name}。`;
  pushLog(state, message);
  return { ok: true, message };
}

export function listUpgradeOptions(state: GameState): { id: BuildingId; label: string }[] {
  return BUILDINGS.filter((def) => state.buildings.some((b) => b.id === def.id)).map((def) => {
    const building = state.buildings.find((b) => b.id === def.id)!;
    const cost = calcUpgradeCost(def.costBase, building.level);
    const maxed = building.level >= def.maxLevel;
    const label = maxed
      ? `升级${def.name}（已满级）`
      : `升级${def.name} Lv${building.level}→${building.level + 1}（${cost} 灵石）`;
    return { id: def.id, label };
  });
}

export function buildingLabel(id: BuildingId): string {
  return getBuildingDef(id).name;
}
