/** AdsGram / TG Mini App 广告配置。
 *  BlockId 直接填在下面两个常量里（.env 里填了会优先用 .env），留空则不显示广告入口。 */
const REWARD_BLOCK_ID = '';
const INTERSTITIAL_BLOCK_ID = '';

export const AdConfig = {
  rewardBlockId: import.meta.env.VITE_ADSGRAM_REWARD_BLOCK_ID || REWARD_BLOCK_ID,
  interstitialBlockId: import.meta.env.VITE_ADSGRAM_INTERSTITIAL_BLOCK_ID || INTERSTITIAL_BLOCK_ID,
  debug: import.meta.env.VITE_ADS_DEBUG === 'true',
  botUsername: import.meta.env.VITE_BOT_USERNAME || 'CakeLinkPlayBot',
  /** 每日激励广告上限（参考常见 TG 小游戏） */
  dailyRewardLimit: 8,
  /** 每看几次外出后尝试插屏 */
  interstitialEveryOutings: 3,
  /** 激励广告奖励 */
  rewardStone: [25, 45] as [number, number],
  rewardQi: [8, 16] as [number, number],
  rewardFame: 2,
};
