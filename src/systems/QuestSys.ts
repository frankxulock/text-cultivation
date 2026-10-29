import { QUESTS, getQuest } from '../data/quests';
import { pushLog, type GameState, type GameStats } from '../model/GameState';

type QuestStatKey = keyof GameStats;

const TYPE_TO_STAT: Record<string, QuestStatKey> = {
  cultivate: 'cultivateCount',
  outing: 'outingCount',
  battle_win: 'battleWins',
  breakthrough: 'breakthroughs',
  recruit: 'recruitCount',
  alchemy: 'alchemySuccess',
  learn_tech: 'techLearned',
};

export function syncQuestProgress(state: GameState): void {
  for (const quest of QUESTS) {
    if (state.completedQuests.includes(quest.id)) {
      continue;
    }
    const key = TYPE_TO_STAT[quest.type];
    if (!key) {
      continue;
    }
    state.questProgress[quest.id] = state.stats[key];
  }
}

export function claimQuest(state: GameState, questId: string): { ok: boolean; message: string } {
  if (state.completedQuests.includes(questId)) {
    return { ok: false, message: '该任务已完成。' };
  }
  const quest = getQuest(questId);
  if (!quest) {
    return { ok: false, message: '任务不存在。' };
  }
  syncQuestProgress(state);
  const progress = state.questProgress[questId] ?? 0;
  if (progress < quest.target) {
    return { ok: false, message: `进度不足（${progress}/${quest.target}）。` };
  }

  state.completedQuests.push(questId);
  state.spiritStone += quest.rewardStone;
  state.qi += quest.rewardQi;
  state.fame += quest.rewardFame;
  if (quest.rewardInsight) {
    state.insight += quest.rewardInsight;
  }
  const message =
    `【任务完成】${quest.name}！奖励：灵石 +${quest.rewardStone}，灵气 +${quest.rewardQi}，声望 +${quest.rewardFame}` +
    (quest.rewardInsight ? `，悟性 +${quest.rewardInsight}` : '') +
    '。';
  pushLog(state, message);
  return { ok: true, message };
}

export function listActiveQuests(state: GameState): {
  id: string;
  label: string;
  canClaim: boolean;
}[] {
  syncQuestProgress(state);
  return QUESTS.filter((q) => !state.completedQuests.includes(q.id)).map((q) => {
    const progress = Math.min(state.questProgress[q.id] ?? 0, q.target);
    return {
      id: q.id,
      label: `${q.name}：${q.desc}（${progress}/${q.target}）`,
      canClaim: progress >= q.target,
    };
  });
}
