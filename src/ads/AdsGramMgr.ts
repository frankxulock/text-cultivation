import { AdConfig } from '../config/AdConfig';

type AdKind = 'reward' | 'interstitial';

interface Controllers {
  reward?: AdController;
  interstitial?: AdController;
}

const controllers: Controllers = {};
let inited = false;

function canUseSdk(blockId: string): boolean {
  return Boolean(blockId && window.Adsgram);
}

export function initAdsGram(): void {
  if (inited) {
    return;
  }
  inited = true;

  if (canUseSdk(AdConfig.rewardBlockId)) {
    controllers.reward = window.Adsgram!.init({
      blockId: AdConfig.rewardBlockId,
      debug: AdConfig.debug,
      debugBannerType: AdConfig.debug ? 'FullscreenMedia' : undefined,
    });
  }

  if (canUseSdk(AdConfig.interstitialBlockId)) {
    controllers.interstitial = window.Adsgram!.init({
      blockId: AdConfig.interstitialBlockId,
      debug: AdConfig.debug,
      debugBannerType: AdConfig.debug ? 'FullscreenMedia' : undefined,
    });
  }
}

export function isAdsReady(kind: AdKind): boolean {
  if (kind === 'reward') {
    return Boolean(controllers.reward) || AdConfig.debug || !AdConfig.rewardBlockId;
  }
  return Boolean(controllers.interstitial) || AdConfig.debug || !AdConfig.interstitialBlockId;
}

/**
 * 展示广告。
 * - 已配置 AdsGram：走真实 SDK
 * - 未配置 / 本地调试：弹出确认模拟（方便浏览器测奖励链路）
 */
export function showAd(kind: AdKind): Promise<boolean> {
  initAdsGram();
  const ctrl = kind === 'reward' ? controllers.reward : controllers.interstitial;

  if (ctrl) {
    return ctrl
      .show()
      .then(() => true)
      .catch(() => false);
  }

  // 本地 / 未填 BlockId：模拟激励（插屏直接跳过不算奖励）
  if (kind === 'interstitial') {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const ok = window.confirm(
      '[调试] AdsGram 未配置或未加载。\n模拟观看激励广告并领取奖励？',
    );
    resolve(ok);
  });
}
