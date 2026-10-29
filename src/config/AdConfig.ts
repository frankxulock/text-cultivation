/** AdsGram / TG Mini App 广告配置（在 .env 填写真实 BlockId） */
export const AdConfig = {
  rewardBlockId: import.meta.env.VITE_ADSGRAM_REWARD_BLOCK_ID || '',
  interstitialBlockId: import.meta.env.VITE_ADSGRAM_INTERSTITIAL_BLOCK_ID || '',
  debug: import.meta.env.VITE_ADS_DEBUG === 'true',
  botUsername: import.meta.env.VITE_BOT_USERNAME || '',
  /** 每日激励广告上限（参考常见 TG 小游戏） */
  dailyRewardLimit: 8,
  /** 每看几次外出后尝试插屏 */
  interstitialEveryOutings: 3,
  /** 激励广告奖励 */
  rewardStone: [25, 45] as [number, number],
  rewardQi: [8, 16] as [number, number],
  rewardFame: 2,
};
