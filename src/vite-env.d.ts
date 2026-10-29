/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADSGRAM_REWARD_BLOCK_ID: string;
  readonly VITE_ADSGRAM_INTERSTITIAL_BLOCK_ID: string;
  readonly VITE_ADS_DEBUG: string;
  readonly VITE_BOT_USERNAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: 'load' | 'render' | 'playing' | 'destroy';
  error: boolean;
}

interface AdController {
  show(): Promise<ShowPromiseResult>;
  destroy?: () => void;
}

interface AdsgramStatic {
  init(options: {
    blockId: string;
    debug?: boolean;
    debugBannerType?: string;
  }): AdController;
}

interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableVerticalSwipes?: () => void;
  initData: string;
  initDataUnsafe: {
    user?: TelegramWebAppUser;
    start_param?: string;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
  };
  openTelegramLink?: (url: string) => void;
  switchInlineQuery?: (query: string, chooseChatTypes?: string[]) => void;
  platform?: string;
  version?: string;
}

interface Window {
  Adsgram?: AdsgramStatic;
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
