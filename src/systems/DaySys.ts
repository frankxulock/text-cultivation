import {
  BUILDINGS,
  calcDailyOutput,
  getBuildingDef,
  type BuildingId,
} from '../data/buildings';
import {
  getOutputMul,
  pruneBuffs,
  pushLog,
  type GameState,
} from '../model/GameState';
import { syncQuestProgress } from './QuestSys';

/** 弱自动转化：每 4 灵草 → 1 灵气（精炼丹药更划算） */
const HERB_TO_QI = 4;

export function tryUnlockBuildings(state: GameState): string[] {
  const notes: string[] = [];
  for (const def of BUILDINGS) {
    if (def.unlockRealm > state.realmIndex) {
      continue;
    }
    if (state.buildings.some((b) => b.id === def.id)) {
      continue;
    }
    state.buildings.push({ id: def.id, level: 1, assigned: 0 });
    notes.push(`宗门机缘：解锁建筑【${def.name}】！`);
  }
  return notes;
}

export function settleDays(state: GameState, days: number): string[] {
  const notes: string[] = [];
  if (days <= 0) {
    return notes;
  }

  let herbGain = 0;
  let stoneGain = 0;
  let qiGain = 0;
  let insightGain = 0;
  const outputMul = getOutputMul(state);

  for (let i = 0; i < days; i++) {
    for (const building of state.buildings) {
      const def = getBuildingDef(building.id as BuildingId);
      const output = calcDailyOutput(def.baseOutput, building.level, building.assigned, outputMul);
      if (building.id === 'garden') {
        herbGain += output;
      } else if (building.id === 'forge') {
        stoneGain += output;
      } else if (building.id === 'vein') {
        qiGain += output;
      } else if (building.id === 'library') {
        insightGain += output;
      }
    }
  }

  state.day += days;
  state.herb += herbGain;
  state.spiritStone += stoneGain;
  state.qi += qiGain;
  state.insight += insightGain;
  pruneBuffs(state);

  const parts: string[] = [];
  if (herbGain > 0) {
    parts.push(`药园灵草 +${herbGain}`);
  }
  if (stoneGain > 0) {
    parts.push(`炼器坊灵石 +${stoneGain}`);
  }
  if (qiGain > 0) {
    parts.push(`灵脉灵气 +${qiGain}`);
  }
  if (insightGain > 0) {
    parts.push(`藏经阁悟性 +${insightGain}`);
  }
  if (parts.length > 0) {
    notes.push(`【日结】${parts.join('；')}。`);
  }

  const convertible = Math.floor(state.herb / HERB_TO_QI);
  if (convertible > 0) {
    const used = convertible * HERB_TO_QI;
    state.herb -= used;
    state.qi += convertible;
    notes.push(`粗炼灵草 ${used}，灵气 +${convertible}（精炼丹药收益更高）。`);
  }

  for (const note of notes) {
    pushLog(state, note);
  }

  syncQuestProgress(state);
  return notes;
}

export function advanceDays(state: GameState, days: number): void {
  settleDays(state, days);
}
