import { getRealm, REALMS } from '../data/realms';
import {
  getBreakthroughBonus,
  getCultivateMul,
  pushLog,
  recalcPower,
  type GameState,
} from '../model/GameState';
import { advanceDays, tryUnlockBuildings } from './DaySys';
import { syncQuestProgress } from './QuestSys';

const CULTIVATE_BASE = 18;
const CULTIVATE_DAYS = 1;

export interface CultivateResult {
  ok: boolean;
  message: string;
}

export function canCultivate(state: GameState): CultivateResult {
  if (state.realmIndex >= REALMS.length - 1 && state.cultivation >= getRealm(state.realmIndex).needCultivation) {
    return { ok: false, message: '你已臻金丹后期圆满，闭关再难精进。' };
  }
  const realm = getRealm(state.realmIndex);
  if (state.qi < realm.qiCost) {
    return { ok: false, message: `灵气不足（需要 ${realm.qiCost}）。` };
  }
  return { ok: true, message: '' };
}

/** 突破基础成功率：炼气高、后期渐难 */
function breakthroughChance(state: GameState): number {
  const realmFactor = Math.max(0.35, 0.95 - state.realmIndex * 0.04);
  let chance = realmFactor + getBreakthroughBonus(state);
  if (state.breakCharges > 0) {
    chance += 0.25;
  }
  chance += Math.min(0.1, state.fame / 500);
  return Math.min(0.95, chance);
}

function attemptBreakthrough(state: GameState): string {
  const usedPill = state.breakCharges > 0;
  if (usedPill) {
    state.breakCharges -= 1;
  }
  const chance = breakthroughChance(state);
  const success = Math.random() < chance;

  if (success) {
    const need = getRealm(state.realmIndex).needCultivation;
    state.cultivation = Math.max(0, state.cultivation - need);
    state.realmIndex += 1;
    state.stats.breakthroughs += 1;
    const next = getRealm(state.realmIndex);
    recalcPower(state);
    const unlockNotes = tryUnlockBuildings(state);
    let msg =
      `天地异象！突破成功，迈入【${next.name}】（成功率约 ${Math.floor(chance * 100)}%` +
      `${usedPill ? '，已耗破境丹' : ''}），战力 ${state.power}！`;
    if (unlockNotes.length) {
      msg += ' ' + unlockNotes.join(' ');
      for (const n of unlockNotes) {
        pushLog(state, n);
      }
    }
    return msg;
  }

  const loss = Math.floor(state.cultivation * (0.25 + Math.random() * 0.2));
  state.cultivation = Math.max(0, state.cultivation - loss);
  state.qi = Math.max(0, state.qi - 3);
  recalcPower(state);
  return (
    `突破失败！心魔反噬，修为 -${loss}，灵气 -3` +
    `（成功率约 ${Math.floor(chance * 100)}%${usedPill ? '，已耗破境丹' : ''}）。可炼破境丹或精进功法后再试。`
  );
}

export function cultivate(state: GameState): CultivateResult {
  const check = canCultivate(state);
  if (!check.ok) {
    pushLog(state, check.message);
    return check;
  }

  const realm = getRealm(state.realmIndex);
  state.qi -= realm.qiCost;
  const mul = getCultivateMul(state);
  const gain = Math.floor(CULTIVATE_BASE * realm.cultivateFactor * mul);
  state.cultivation += gain;
  state.stats.cultivateCount += 1;

  advanceDays(state, CULTIVATE_DAYS);

  let message = `你闭关 ${CULTIVATE_DAYS} 日，耗灵气 ${realm.qiCost}，修为 +${gain}`;
  if (mul > 1.05) {
    message += `（效率 ×${mul.toFixed(2)}）`;
  }
  message += '。';

  const need = realm.needCultivation;
  if (state.cultivation >= need && state.realmIndex < REALMS.length - 1) {
    message += ' ' + attemptBreakthrough(state);
  } else {
    const remain = need - state.cultivation;
    if (remain <= need * 0.2) {
      message += ' 瓶颈将近，可备破境丹再冲击。';
    }
    recalcPower(state);
  }

  syncQuestProgress(state);
  pushLog(state, message);
  return { ok: true, message };
}
