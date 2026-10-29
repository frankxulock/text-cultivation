import { AdConfig } from '../config/AdConfig';

export interface TgUserInfo {
  id: string;
  name: string;
  username?: string;
  startParam?: string;
  inTelegram: boolean;
}

/** 对齐德州客户端 ThirdApiManager 的 TG WebApp 初始化 */
export function initTelegramApp(): TgUserInfo {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    return {
      id: 'local',
      name: '无名散修',
      inTelegram: false,
    };
  }

  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f1410');
    tg.setBackgroundColor('#0f1410');
    tg.enableClosingConfirmation();
    tg.disableVerticalSwipes?.();

    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      tg.close();
    });
  } catch {
    // ignore
  }

  const user = tg.initDataUnsafe?.user;
  const name = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || '散修'
    : '无名散修';

  return {
    id: user?.id ? String(user.id) : 'tg-guest',
    name,
    username: user?.username,
    startParam: tg.initDataUnsafe?.start_param,
    inTelegram: true,
  };
}

export function hapticLight(): void {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
  } catch {
    // ignore
  }
}

/** 邀请好友（startapp 带 inviter） */
export function shareInvite(inviterId: string): void {
  const bot = AdConfig.botUsername;
  const tg = window.Telegram?.WebApp;
  const text = encodeURIComponent('一起来玩文字修仙经营，闭关经营两不误！');
  if (bot && tg?.openTelegramLink) {
    const url = `https://t.me/${bot}?startapp=inv_${inviterId}`;
    tg.openTelegramLink(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`,
    );
    return;
  }
  const fallback = bot
    ? `https://t.me/${bot}?startapp=inv_${inviterId}`
    : window.location.href;
  void navigator.clipboard?.writeText(fallback);
  window.alert(`邀请链接已复制：\n${fallback}`);
}

export function isInTelegram(): boolean {
  return Boolean(window.Telegram?.WebApp?.initData);
}
