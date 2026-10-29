import { getArtifact } from '../data/artifacts';
import { pickEvent, rollRange, type GameEventDef } from '../data/events';
import { getLocation, type LocationId } from '../data/locations';
import { pushLog, recalcPower, type GameState } from '../model/GameState';
import { buyArtifact, grantArtifact } from './ArtifactSys';
import { advanceDays } from './DaySys';
import { syncQuestProgress } from './QuestSys';

export interface OutingResult {
  ok: boolean;
  message: string;
  pendingShop?: string;
}

function applyReward(
  state: GameState,
  stone?: [number, number],
  qi?: [number, number],
  herb?: [number, number],
  fame?: [number, number],
  insight?: [number, number],
): string[] {
  const parts: string[] = [];
  if (stone) {
    const v = rollRange(stone);
    state.spiritStone = Math.max(0, state.spiritStone + v);
    parts.push(v >= 0 ? `灵石 +${v}` : `灵石 ${v}`);
  }
  if (qi) {
    const v = rollRange(qi);
    state.qi = Math.max(0, state.qi + v);
    parts.push(v >= 0 ? `灵气 +${v}` : `灵气 ${v}`);
  }
  if (herb) {
    const v = rollRange(herb);
    state.herb = Math.max(0, state.herb + v);
    parts.push(v >= 0 ? `灵草 +${v}` : `灵草 ${v}`);
  }
  if (fame) {
    const v = rollRange(fame);
    state.fame = Math.max(0, state.fame + v);
    parts.push(v >= 0 ? `声望 +${v}` : `声望 ${v}`);
  }
  if (insight) {
    const v = rollRange(insight);
    state.insight = Math.max(0, state.insight + v);
    parts.push(v >= 0 ? `悟性 +${v}` : `悟性 ${v}`);
  }
  return parts;
}

function runBattle(state: GameState, event: GameEventDef): string {
  const ratio = event.enemyPowerRatio ?? 1;
  recalcPower(state);
  const playerPower = state.power;
  const enemyPower = Math.max(1, Math.floor(playerPower * ratio * (0.95 + Math.random() * 0.1)));
  const enemyName = event.enemyName ?? '未知强敌';
  const fameBoost = Math.min(0.08, state.fame / 400);
  const baseRatio = playerPower / Math.max(1, enemyPower);
  let winChance: number;
  if (baseRatio >= 1.2) {
    winChance = 0.9;
  } else if (baseRatio >= 1.0) {
    winChance = 0.75;
  } else if (baseRatio >= 0.7) {
    winChance = 0.45;
  } else {
    winChance = 0.2;
  }
  winChance = Math.min(0.95, winChance + fameBoost);
  const won = Math.random() < winChance;

  let message = `${event.text} 敌方「${enemyName}」战力约 ${enemyPower}（你 ${playerPower}）。`;

  if (won) {
    state.stats.battleWins += 1;
    const parts = applyReward(state, event.winStone, event.winQi, undefined, event.winFame);
    message += ` 你力克对手！${parts.length ? parts.join('，') + '。' : ''}`;
    if (event.artifactDrop && Math.random() < (event.artifactChance ?? 0)) {
      const drop = grantArtifact(state, event.artifactDrop);
      if (drop) {
        message += ` ${drop}`;
      }
    }
    return message;
  }

  const loseParts: string[] = [];
  if (event.loseStone) {
    const loss = rollRange(event.loseStone);
    state.spiritStone = Math.max(0, state.spiritStone - loss);
    loseParts.push(`灵石 -${loss}`);
  }
  if (event.loseQi) {
    const loss = rollRange(event.loseQi);
    state.qi = Math.max(0, state.qi - loss);
    loseParts.push(`灵气 -${loss}`);
  }
  if (event.loseFame) {
    const loss = rollRange(event.loseFame);
    state.fame = Math.max(0, state.fame - loss);
    loseParts.push(`声望 -${loss}`);
  }
  message += ` 不敌败退……${loseParts.join('，')}。`;
  return message;
}

export function goOuting(state: GameState, locationId: LocationId): OutingResult {
  const loc = getLocation(locationId);
  if (state.realmIndex < loc.minRealm) {
    const message = `境界不足，难以涉足${loc.name}（需更高境界）。`;
    pushLog(state, message);
    return { ok: false, message };
  }

  const event = pickEvent(state.realmIndex, locationId);
  let message: string;
  let pendingShop: string | undefined;

  if (event.kind === 'battle') {
    message = runBattle(state, event);
  } else if (event.kind === 'trade' && event.shopArtifact) {
    const art = getArtifact(event.shopArtifact);
    if (art && !state.artifacts.includes(art.id) && art.marketPrice != null) {
      message = `${event.text}【${art.name}】售价 ${art.marketPrice} 灵石。`;
      pendingShop = art.id;
    } else if (art && state.artifacts.includes(art.id)) {
      message = `${event.text} 你已拥有【${art.name}】，遂一笑置之。`;
    } else {
      const parts = applyReward(
        state,
        event.rewardStone,
        event.rewardQi,
        event.rewardHerb,
        event.rewardFame,
        event.rewardInsight,
      );
      message = `${event.text}${parts.length ? ' ' + parts.join('，') + '。' : ''}`;
    }
  } else if (event.kind === 'adventure' || event.kind === 'trade') {
    const parts = applyReward(
      state,
      event.rewardStone,
      event.rewardQi,
      event.rewardHerb,
      event.rewardFame,
      event.rewardInsight,
    );
    message = `${event.text}${parts.length ? ' ' + parts.join('，') + '。' : ''}`;
    if (event.artifactDrop && Math.random() < (event.artifactChance ?? 0)) {
      const drop = grantArtifact(state, event.artifactDrop);
      if (drop) {
        message += ` ${drop}`;
      }
    }
  } else {
    message = event.text;
    if (loc.fameBias > 0 && Math.random() < 0.3) {
      state.fame += 1;
      message += ' 一路行善，声望 +1。';
    }
  }

  state.stats.outingCount += 1;
  advanceDays(state, loc.days);
  syncQuestProgress(state);
  recalcPower(state);
  pushLog(state, `【${loc.name}】${message}`);
  return { ok: true, message, pendingShop };
}

export function confirmShopBuy(state: GameState, artifactId: string): OutingResult {
  const result = buyArtifact(state, artifactId);
  return { ok: result.ok, message: result.message };
}
