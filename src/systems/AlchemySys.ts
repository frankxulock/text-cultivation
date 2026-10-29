import { getPill, PILLS } from '../data/pills';
import { pushLog, type GameState } from '../model/GameState';
import { advanceDays } from './DaySys';
import { syncQuestProgress } from './QuestSys';

export interface AlchemyResult {
  ok: boolean;
  message: string;
}

export function craftPill(state: GameState, pillId: string): AlchemyResult {
  const pill = getPill(pillId);
  if (!pill) {
    return { ok: false, message: '丹方不存在。' };
  }
  if (state.realmIndex < pill.minRealm) {
    const message = `境界不足，无法炼制${pill.name}。`;
    pushLog(state, message);
    return { ok: false, message };
  }
  if (state.herb < pill.herbCost || state.spiritStone < pill.stoneCost) {
    const message = `材料不足：需要灵草 ${pill.herbCost}、灵石 ${pill.stoneCost}。`;
    pushLog(state, message);
    return { ok: false, message };
  }

  state.herb -= pill.herbCost;
  state.spiritStone -= pill.stoneCost;
  advanceDays(state, 1);

  const success = Math.random() < pill.successRate;
  if (!success) {
    const message = `炼制${pill.name}失败，丹炉炸裂，材料尽毁……`;
    pushLog(state, message);
    return { ok: false, message };
  }

  state.pills[pillId] = (state.pills[pillId] ?? 0) + 1;
  state.stats.alchemySuccess += 1;
  syncQuestProgress(state);
  const message = `炼丹成功！获得【${pill.name}】×1。`;
  pushLog(state, message);
  return { ok: true, message };
}

export function usePill(state: GameState, pillId: string): AlchemyResult {
  const pill = getPill(pillId);
  if (!pill) {
    return { ok: false, message: '丹药不存在。' };
  }
  const count = state.pills[pillId] ?? 0;
  if (count <= 0) {
    const message = `没有【${pill.name}】。`;
    pushLog(state, message);
    return { ok: false, message };
  }

  state.pills[pillId] = count - 1;
  let message = `你服下【${pill.name}】。`;

  switch (pill.effect) {
    case 'qi':
      state.qi += pill.value;
      message += ` 灵气 +${pill.value}。`;
      break;
    case 'cultivate_buff':
      state.buffs.push({
        kind: 'cultivate_buff',
        value: pill.value,
        expireDay: state.day + pill.durationDays,
      });
      message += ` 闭关效率提升，持续至第 ${state.day + pill.durationDays} 天。`;
      break;
    case 'combat_buff':
      state.buffs.push({
        kind: 'combat_buff',
        value: pill.value,
        expireDay: state.day + pill.durationDays,
      });
      message += ` 战力增幅，持续至第 ${state.day + pill.durationDays} 天。`;
      break;
    case 'breakthrough':
      state.breakCharges += 1;
      message += ` 破境之力凝聚（当前破境丹层数 ${state.breakCharges}）。`;
      break;
    case 'heal_fame':
      state.fame += pill.value;
      message += ` 心境澄明，声望 +${pill.value}。`;
      break;
    default:
      break;
  }

  pushLog(state, message);
  return { ok: true, message };
}

export function listCraftOptions(state: GameState): { id: string; label: string }[] {
  return PILLS.filter((p) => p.minRealm <= state.realmIndex).map((p) => ({
    id: p.id,
    label: `炼制${p.name}（草${p.herbCost}/石${p.stoneCost}，成功率${Math.floor(p.successRate * 100)}%）`,
  }));
}

export function listOwnedPills(state: GameState): { id: string; label: string }[] {
  return PILLS.filter((p) => (state.pills[p.id] ?? 0) > 0).map((p) => ({
    id: p.id,
    label: `服用${p.name}×${state.pills[p.id]}（${p.desc}）`,
  }));
}
