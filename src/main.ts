import './style.css';
import { initAdsGram } from './ads/AdsGramMgr';
import { createInitialState, type GameState } from './model/GameState';
import { clearSave, loadOrCreate, saveGame } from './save/SaveMgr';
import {
  applyInviteParam,
  maybeShowInterstitial,
  watchRewardAd,
} from './systems/AdRewardSys';
import { craftPill, usePill } from './systems/AlchemySys';
import { equipArtifact } from './systems/ArtifactSys';
import { cultivate } from './systems/CultivateSys';
import { confirmShopBuy, goOuting } from './systems/EventSys';
import {
  assignDisciple,
  recruitDisciple,
  trainDisciple,
  upgradeBuilding,
} from './systems/ManageSys';
import { claimQuest } from './systems/QuestSys';
import { learnTechnique, setActiveTechnique } from './systems/TechniqueSys';
import { hapticLight, initTelegramApp, shareInvite } from './tg/TelegramApp';
import { View } from './ui/View';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('#app not found');
}

const tgUser = initTelegramApp();
initAdsGram();

let state: GameState = loadOrCreate(tgUser.name);
if (tgUser.inTelegram && tgUser.id !== 'tg-guest') {
  state.tgId = tgUser.id;
  if (state.name === '无名散修' || !state.name) {
    state.name = tgUser.name;
  }
}
applyInviteParam(state, tgUser.startParam);
saveGame(state);

const view = new View(app, {
  onCultivate: () => {
    cultivate(state);
    hapticLight();
    persist();
  },
  onOpenManage: () => {
    view.setMode('manage');
    view.render(state);
  },
  onOpenOuting: () => {
    view.setMode('outing');
    view.render(state);
  },
  onOpenAlchemy: () => {
    view.setMode('alchemy');
    view.render(state);
  },
  onOpenTechnique: () => {
    view.setMode('technique');
    view.render(state);
  },
  onOpenArtifact: () => {
    view.setMode('artifact');
    view.render(state);
  },
  onOpenQuest: () => {
    view.setMode('quest');
    view.render(state);
  },
  onOpenAds: () => {
    view.setMode('ads');
    view.render(state);
  },
  onBackMain: () => {
    view.setPendingShop(null);
    view.setMode('main');
    view.render(state);
  },
  onUpgrade: (buildingId) => {
    upgradeBuilding(state, buildingId);
    persist();
  },
  onRecruit: () => {
    recruitDisciple(state);
    persist();
  },
  onOpenAssign: () => {
    view.setMode('assign');
    view.render(state);
  },
  onAssign: (discipleIndex, buildingId) => {
    assignDisciple(state, discipleIndex, buildingId);
    persist();
  },
  onTrain: (discipleIndex) => {
    trainDisciple(state, discipleIndex);
    persist();
  },
  onOuting: (locationId) => {
    void (async () => {
      const result = goOuting(state, locationId);
      if (result.pendingShop) {
        view.setPendingShop(result.pendingShop);
      } else {
        view.setMode('outing');
      }
      persist();
      await maybeShowInterstitial(state);
      persist();
    })();
  },
  onCraft: (pillId) => {
    craftPill(state, pillId);
    persist();
  },
  onUsePill: (pillId) => {
    usePill(state, pillId);
    persist();
  },
  onLearnTech: (techId) => {
    learnTechnique(state, techId);
    persist();
  },
  onActivateTech: (techId) => {
    setActiveTechnique(state, techId);
    persist();
  },
  onEquipArtifact: (artifactId) => {
    equipArtifact(state, artifactId);
    persist();
  },
  onClaimQuest: (questId) => {
    claimQuest(state, questId);
    persist();
  },
  onShopBuy: (artifactId) => {
    confirmShopBuy(state, artifactId);
    view.setPendingShop(null);
    view.setMode('outing');
    persist();
  },
  onShopSkip: () => {
    view.setPendingShop(null);
    view.setMode('outing');
    view.render(state);
  },
  onWatchRewardAd: () => {
    void (async () => {
      await watchRewardAd(state);
      hapticLight();
      persist();
    })();
  },
  onShareInvite: () => {
    shareInvite(state.tgId || tgUser.id || 'guest');
  },
  onReset: () => {
    if (!window.confirm('确定要重置全部进度吗？')) {
      return;
    }
    clearSave();
    state = createInitialState(tgUser.name);
    state.tgId = tgUser.id;
    view.setPendingShop(null);
    view.setMode('main');
    persist();
  },
});

function persist(): void {
  saveGame(state);
  view.render(state);
}

view.render(state);
