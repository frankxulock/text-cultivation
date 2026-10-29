import { getTechnique, TECHNIQUES } from '../data/techniques';
import { pushLog, recalcPower, type GameState } from '../model/GameState';
import { advanceDays } from './DaySys';
import { syncQuestProgress } from './QuestSys';

export interface TechResult {
  ok: boolean;
  message: string;
}

function libraryLevel(state: GameState): number {
  return state.buildings.find((b) => b.id === 'library')?.level ?? 0;
}

export function learnTechnique(state: GameState, techId: string): TechResult {
  const tech = getTechnique(techId);
  if (!tech) {
    return { ok: false, message: '功法不存在。' };
  }
  if (state.techniques.includes(techId)) {
    return { ok: false, message: `你已学会【${tech.name}】。` };
  }
  if (state.realmIndex < tech.minRealm) {
    const message = `境界不足，无法修习【${tech.name}】。`;
    pushLog(state, message);
    return { ok: false, message };
  }
  const lib = libraryLevel(state);
  if (lib < tech.libraryLevel) {
    const message = `藏经阁等级不足（需要 Lv${tech.libraryLevel}）。`;
    pushLog(state, message);
    return { ok: false, message };
  }
  if (state.spiritStone < tech.costStone || state.insight < tech.costInsight) {
    const message = `资源不足：需要灵石 ${tech.costStone}、悟性 ${tech.costInsight}。`;
    pushLog(state, message);
    return { ok: false, message };
  }

  state.spiritStone -= tech.costStone;
  state.insight -= tech.costInsight;
  state.techniques.push(techId);
  if (!state.activeTechnique) {
    state.activeTechnique = techId;
  }
  state.stats.techLearned += 1;
  advanceDays(state, 2);
  recalcPower(state);
  syncQuestProgress(state);
  const message = `苦修数日，终于学会功法【${tech.name}】！${tech.desc}`;
  pushLog(state, message);
  return { ok: true, message };
}

export function setActiveTechnique(state: GameState, techId: string): TechResult {
  if (!state.techniques.includes(techId)) {
    return { ok: false, message: '尚未学会该功法。' };
  }
  state.activeTechnique = techId;
  recalcPower(state);
  const tech = getTechnique(techId)!;
  const message = `运转功法切换为【${tech.name}】。`;
  pushLog(state, message);
  return { ok: true, message };
}

export function listLearnable(state: GameState): { id: string; label: string }[] {
  const lib = libraryLevel(state);
  return TECHNIQUES.filter((t) => !state.techniques.includes(t.id)).map((t) => {
    const locked =
      state.realmIndex < t.minRealm || lib < t.libraryLevel
        ? '（未满足条件）'
        : '';
    return {
      id: t.id,
      label: `学习${t.name}（石${t.costStone}/悟${t.costInsight}）${locked}`,
    };
  });
}

export function listOwnedTechniques(state: GameState): { id: string; label: string }[] {
  return state.techniques.map((id) => {
    const t = getTechnique(id)!;
    const active = state.activeTechnique === id ? '【运转中】' : '';
    return { id, label: `${active}${t.name}：${t.desc}` };
  });
}
