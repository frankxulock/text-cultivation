import { AdConfig } from '../config/AdConfig';
import { isInTelegram } from '../tg/TelegramApp';

type AdKind = 'reward' | 'interstitial';

interface Controllers {
  reward?: AdController;
  interstitial?: AdController;
}

const controllers: Controllers = {};
let inited = false;
let busy = false;

/** 只有本地 npm run dev 才用确认框模拟广告；上线包绝不在没看广告时发奖 */
const SIMULATE = import.meta.env.DEV;

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
  if (SIMULATE) {
    return true;
  }
  // AdsGram 只能在 Telegram 里出广告，普通浏览器里不显示入口
  const ctrl = kind === 'reward' ? controllers.reward : controllers.interstitial;
  return Boolean(ctrl) && isInTelegram();
}

/**
 * 展示广告，看完才返回 true；跳过、失败、没配置、正在播都返回 false。
 * - 已配置 AdsGram 且在 Telegram 内：走真实 SDK
 * - 本地 npm run dev：弹出确认模拟（方便浏览器测奖励链路）
 */
export function showAd(kind: AdKind): Promise<boolean> {
  initAdsGram();
  const ctrl = kind === 'reward' ? controllers.reward : controllers.interstitial;

  if (busy) {
    return Promise.resolve(false);
  }

  if (ctrl && isInTelegram()) {
    busy = true;
    return ctrl
      .show()
      .then((result) => Boolean(result && result.done !== false))
      .catch(() => false)
      .finally(() => {
        busy = false;
      });
  }

  if (!SIMULATE || kind === 'interstitial') {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const ok = window.confirm(
      '[调试] AdsGram 未配置或未加载。\n模拟观看激励广告并领取奖励？',
    );
    resolve(ok);
  });
}
