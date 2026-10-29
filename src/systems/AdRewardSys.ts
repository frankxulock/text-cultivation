import { AdConfig } from '../config/AdConfig';
import { rollRange } from '../data/events';
import {
  pushLog,
  recalcPower,
  type AdDayState,
  type GameState,
} from '../model/GameState';
import { showAd } from '../ads/AdsGramMgr';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function ensureAdDay(state: GameState): AdDayState {
  if (!state.adDay || state.adDay.date !== todayKey()) {
    state.adDay = {
      date: todayKey(),
      rewardCount: 0,
      outingSinceInterstitial: state.adDay?.outingSinceInterstitial ?? 0,
    };
  }
  return state.adDay;
}

export function remainingRewardAds(state: GameState): number {
  const day = ensureAdDay(state);
  return Math.max(0, AdConfig.dailyRewardLimit - day.rewardCount);
}

export async function watchRewardAd(state: GameState): Promise<{ ok: boolean; message: string }> {
  const day = ensureAdDay(state);
  if (day.rewardCount >= AdConfig.dailyRewardLimit) {
    const message = `今日天机感悟已达上限（${AdConfig.dailyRewardLimit} 次），明日再来。`;
    pushLog(state, message);
    return { ok: false, message };
  }

  const watched = await showAd('reward');
  if (!watched) {
    const message = '广告未完整观看或加载失败，未获得奖励。';
    pushLog(state, message);
    return { ok: false, message };
  }

  day.rewardCount += 1;
  const stone = rollRange(AdConfig.rewardStone);
  const qi = rollRange(AdConfig.rewardQi);
  state.spiritStone += stone;
  state.qi += qi;
  state.fame += AdConfig.rewardFame;
  state.stats.adRewards = (state.stats.adRewards ?? 0) + 1;

  // 短时凝神 buff（参考小游戏看广告拿加速）
  state.buffs.push({
    kind: 'cultivate_buff',
    value: 0.2,
    expireDay: state.day + 2,
  });
  recalcPower(state);

  const message =
    `【天机广告】观摩天机投影，灵石 +${stone}，灵气 +${qi}，声望 +${AdConfig.rewardFame}，并获得 2 日凝神加成。` +
    `（今日剩余 ${remainingRewardAds(state)} 次）`;
  pushLog(state, message);
  return { ok: true, message };
}

/** 外出后自然节点尝试插屏（不发奖励） */
export async function maybeShowInterstitial(state: GameState): Promise<void> {
  const day = ensureAdDay(state);
  day.outingSinceInterstitial += 1;
  if (day.outingSinceInterstitial < AdConfig.interstitialEveryOutings) {
    return;
  }
  day.outingSinceInterstitial = 0;
  await showAd('interstitial');
}

/** 处理邀请启动参数 inv_{tgId} */
export function applyInviteParam(state: GameState, startParam?: string): void {
  if (!startParam || !startParam.startsWith('inv_')) {
    return;
  }
  if (state.inviteClaimed) {
    return;
  }
  state.inviteClaimed = true;
  state.spiritStone += 40;
  state.qi += 10;
  state.fame += 5;
  pushLog(state, '【邀约】受友人引荐踏入修仙界，灵石 +40，灵气 +10，声望 +5。');
}
