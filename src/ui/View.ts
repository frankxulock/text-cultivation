import { getArtifact } from '../data/artifacts';
import { getMaxDisciples } from '../data/buildings';
import { LOCATIONS, type LocationId } from '../data/locations';
import { getTechnique } from '../data/techniques';
import { getRealm } from '../data/realms';
import type { BuildingId } from '../data/buildings';
import type { GameState } from '../model/GameState';
import { listCraftOptions, listOwnedPills } from '../systems/AlchemySys';
import { listOwnedArtifacts } from '../systems/ArtifactSys';
import { getBuildingLines, listUpgradeOptions, buildingLabel } from '../systems/ManageSys';
import { listActiveQuests } from '../systems/QuestSys';
import { remainingRewardAds } from '../systems/AdRewardSys';
import { listLearnable, listOwnedTechniques } from '../systems/TechniqueSys';

export type PanelMode =
  | 'main'
  | 'manage'
  | 'assign'
  | 'outing'
  | 'alchemy'
  | 'technique'
  | 'artifact'
  | 'quest'
  | 'shop'
  | 'ads';

export interface ViewHandlers {
  onCultivate: () => void;
  onOpenManage: () => void;
  onOpenOuting: () => void;
  onOpenAlchemy: () => void;
  onOpenTechnique: () => void;
  onOpenArtifact: () => void;
  onOpenQuest: () => void;
  onOpenAds: () => void;
  onBackMain: () => void;
  onUpgrade: (buildingId: BuildingId) => void;
  onRecruit: () => void;
  onOpenAssign: () => void;
  onAssign: (discipleIndex: number, buildingId: BuildingId | null) => void;
  onTrain: (discipleIndex: number) => void;
  onOuting: (locationId: LocationId) => void;
  onCraft: (pillId: string) => void;
  onUsePill: (pillId: string) => void;
  onLearnTech: (techId: string) => void;
  onActivateTech: (techId: string) => void;
  onEquipArtifact: (artifactId: string) => void;
  onClaimQuest: (questId: string) => void;
  onShopBuy: (artifactId: string) => void;
  onShopSkip: () => void;
  onWatchRewardAd: () => void;
  onShareInvite: () => void;
  onReset: () => void;
}

export class View {
  private root: HTMLElement;
  private handlers: ViewHandlers;
  private mode: PanelMode = 'main';
  private pendingShopId: string | null = null;

  constructor(root: HTMLElement, handlers: ViewHandlers) {
    this.root = root;
    this.handlers = handlers;
  }

  setMode(mode: PanelMode): void {
    this.mode = mode;
  }

  setPendingShop(id: string | null): void {
    this.pendingShopId = id;
    if (id) {
      this.mode = 'shop';
    }
  }

  render(state: GameState): void {
    const realm = getRealm(state.realmIndex);
    const need = realm.needCultivation;
    const buildingLines = getBuildingLines(state);
    const libLv = state.buildings.find((b) => b.id === 'library')?.level ?? 0;
    const maxDisciple = getMaxDisciples(state.fame, libLv);
    const techName = state.activeTechnique
      ? getTechnique(state.activeTechnique)?.name ?? '无'
      : '无';
    const artName = state.equippedArtifact
      ? getArtifact(state.equippedArtifact)?.name ?? '无'
      : '无';
    const buffText =
      state.buffs.length === 0
        ? '无'
        : state.buffs
            .map((b) => `${b.kind === 'cultivate_buff' ? '凝神' : '破军'}至D${b.expireDay}`)
            .join('、');

    this.root.innerHTML = `
      <div class="game">
        <header class="status">
          <div class="status-line">
            【第 ${state.day} 天】${escapeHtml(state.name)} · ${realm.name}
            | 战力 ${state.power}
            | 声望 ${state.fame}
          </div>
          <div class="status-sub">
            灵石 ${state.spiritStone} · 灵气 ${state.qi} · 灵草 ${state.herb} · 悟性 ${state.insight}
            ${state.breakCharges > 0 ? ` · 破境×${state.breakCharges}` : ''}
          </div>
          <div class="status-sub">
            修为 ${state.cultivation}/${need}
            <span class="bar" style="--progress:${Math.min(100, (state.cultivation / need) * 100)}%"><span class="bar-fill"></span></span>
            弟子 ${state.disciples.length}/${maxDisciple}
            · 功法 ${escapeHtml(techName)} · 法宝 ${escapeHtml(artName)} · Buff ${escapeHtml(buffText)}
          </div>
        </header>

        <section class="buildings">
          ${buildingLines.map((line) => `<div>${escapeHtml(line)}</div>`).join('') || '<div>宗门建筑尚未展开</div>'}
        </section>

        <section class="log" id="log-panel" aria-live="polite">
          ${state.log
            .slice(-14)
            .map((line) => `<div class="log-line">&gt; ${escapeHtml(line)}</div>`)
            .join('')}
        </section>

        <section class="actions" id="actions">
          ${this.renderActions(state)}
        </section>

        <footer class="footer">
          <span class="hint">存档已自动保存</span>
          <button type="button" class="btn btn-ghost" data-action="reset">重置进度</button>
        </footer>
      </div>
    `;

    this.bind();
    const logPanel = this.root.querySelector('#log-panel');
    if (logPanel) {
      logPanel.scrollTop = logPanel.scrollHeight;
    }
  }

  private renderActions(state: GameState): string {
    if (this.mode === 'shop' && this.pendingShopId) {
      const art = getArtifact(this.pendingShopId);
      return `
        <div class="panel-title">—— 坊市交易 ——</div>
        <div class="empty">${art ? `是否花费 ${art.marketPrice} 灵石购买【${art.name}】？` : '货物已不见。'}</div>
        <button type="button" class="btn btn-primary" data-action="shop-buy" data-id="${this.pendingShopId}">购买</button>
        <button type="button" class="btn btn-secondary" data-action="shop-skip">放弃</button>
      `;
    }

    if (this.mode === 'outing') {
      return `
        <div class="panel-title">—— 选择历练地点 ——</div>
        ${LOCATIONS.map((loc) => {
          const locked = state.realmIndex < loc.minRealm;
          return `<button type="button" class="btn" data-action="outing-go" data-id="${loc.id}" ${locked ? 'disabled' : ''}>
            ${escapeHtml(loc.name)}（${loc.days}天）${locked ? '·未解锁' : ''}
            <span class="btn-desc">${escapeHtml(loc.desc)}</span>
          </button>`;
        }).join('')}
        <button type="button" class="btn btn-secondary" data-action="back">返回</button>
      `;
    }

    if (this.mode === 'manage') {
      const upgrades = listUpgradeOptions(state);
      return `
        <div class="panel-title">—— 宗门经营 ——</div>
        ${upgrades
          .map(
            (u) =>
              `<button type="button" class="btn" data-action="upgrade" data-id="${u.id}">${escapeHtml(u.label)}</button>`,
          )
          .join('')}
        <button type="button" class="btn" data-action="recruit">收徒</button>
        <button type="button" class="btn" data-action="open-assign">弟子执事 / 培养</button>
        <button type="button" class="btn btn-secondary" data-action="back">返回</button>
      `;
    }

    if (this.mode === 'assign') {
      if (state.disciples.length === 0) {
        return `
          <div class="panel-title">—— 弟子 ——</div>
          <div class="empty">尚无弟子，请先收徒。</div>
          <button type="button" class="btn btn-secondary" data-action="back-manage">返回经营</button>
        `;
      }
      const buildingIds = state.buildings.map((b) => b.id);
      return `
        <div class="panel-title">—— 弟子执事 / 培养 ——</div>
        ${state.disciples
          .map((d, i) => {
            const where = d.assignedTo ? buildingLabel(d.assignedTo) : '空闲';
            return `
              <div class="disciple-row">
                <span>${escapeHtml(d.name)} Lv${d.level}（战力 ${d.power}）· ${where}</span>
                <span class="disciple-btns">
                  ${buildingIds
                    .map(
                      (id) =>
                        `<button type="button" class="btn btn-sm" data-action="assign" data-index="${i}" data-id="${id}">${buildingLabel(id)}</button>`,
                    )
                    .join('')}
                  <button type="button" class="btn btn-sm" data-action="assign" data-index="${i}" data-id="">卸任</button>
                  <button type="button" class="btn btn-sm" data-action="train" data-index="${i}">培养</button>
                </span>
              </div>
            `;
          })
          .join('')}
        <button type="button" class="btn btn-secondary" data-action="back-manage">返回经营</button>
      `;
    }

    if (this.mode === 'alchemy') {
      const craft = listCraftOptions(state);
      const owned = listOwnedPills(state);
      return `
        <div class="panel-title">—— 炼丹 / 服药 ——</div>
        ${craft.map((c) => `<button type="button" class="btn" data-action="craft" data-id="${c.id}">${escapeHtml(c.label)}</button>`).join('')}
        <div class="panel-title">库存</div>
        ${
          owned.length
            ? owned.map((p) => `<button type="button" class="btn" data-action="use-pill" data-id="${p.id}">${escapeHtml(p.label)}</button>`).join('')
            : '<div class="empty">暂无丹药</div>'
        }
        <button type="button" class="btn btn-secondary" data-action="back">返回</button>
      `;
    }

    if (this.mode === 'technique') {
      const learnable = listLearnable(state);
      const owned = listOwnedTechniques(state);
      return `
        <div class="panel-title">—— 功法 ——</div>
        ${
          owned.length
            ? owned
                .map(
                  (t) =>
                    `<button type="button" class="btn" data-action="activate-tech" data-id="${t.id}">运转：${escapeHtml(t.label)}</button>`,
                )
                .join('')
            : '<div class="empty">尚未学会功法（需解锁藏经阁）</div>'
        }
        <div class="panel-title">可学</div>
        ${
          learnable.length
            ? learnable
                .map(
                  (t) =>
                    `<button type="button" class="btn" data-action="learn-tech" data-id="${t.id}">${escapeHtml(t.label)}</button>`,
                )
                .join('')
            : '<div class="empty">暂无更多功法</div>'
        }
        <button type="button" class="btn btn-secondary" data-action="back">返回</button>
      `;
    }

    if (this.mode === 'artifact') {
      const owned = listOwnedArtifacts(state);
      return `
        <div class="panel-title">—— 法宝 ——</div>
        ${
          owned.length
            ? owned
                .map(
                  (a) =>
                    `<button type="button" class="btn" data-action="equip-art" data-id="${a.id}">佩戴：${escapeHtml(a.label)}</button>`,
                )
                .join('')
            : '<div class="empty">尚无法宝。可去坊市购买或秘境夺宝。</div>'
        }
        <button type="button" class="btn btn-secondary" data-action="back">返回</button>
      `;
    }

    if (this.mode === 'quest') {
      const quests = listActiveQuests(state);
      return `
        <div class="panel-title">—— 宗门事务 ——</div>
        ${
          quests.length
            ? quests
                .map(
                  (q) =>
                    `<button type="button" class="btn ${q.canClaim ? 'btn-primary' : ''}" data-action="claim-quest" data-id="${q.id}" ${q.canClaim ? '' : 'disabled'}>
                      ${escapeHtml(q.label)}${q.canClaim ? ' · 领取' : ''}
                    </button>`,
                )
                .join('')
            : '<div class="empty">所有事务已完成。</div>'
        }
        <button type="button" class="btn btn-secondary" data-action="back">返回</button>
      `;
    }

    if (this.mode === 'ads') {
      const left = remainingRewardAds(state);
      return `
        <div class="panel-title">—— 天机广告（AdsGram）——</div>
        <div class="empty">观看激励广告可领取灵石、灵气与短时凝神加成。今日剩余 ${left} 次。</div>
        <button type="button" class="btn btn-primary" data-action="watch-ad" ${left <= 0 ? 'disabled' : ''}>看广告领补给</button>
        <button type="button" class="btn" data-action="share-invite">邀请好友</button>
        <button type="button" class="btn btn-secondary" data-action="back">返回</button>
      `;
    }

    return `
      <button type="button" class="btn btn-primary" data-action="cultivate">闭关</button>
      <button type="button" class="btn btn-primary" data-action="manage">经营</button>
      <button type="button" class="btn btn-primary" data-action="outing">外出</button>
      <button type="button" class="btn" data-action="alchemy">炼丹</button>
      <button type="button" class="btn" data-action="technique">功法</button>
      <button type="button" class="btn" data-action="artifact">法宝</button>
      <button type="button" class="btn" data-action="quest">任务</button>
      <button type="button" class="btn btn-ad" data-action="ads">看广告</button>
    `;
  }

  private bind(): void {
    this.root.querySelectorAll('[data-action]').forEach((el) => {
      el.addEventListener('click', () => {
        const action = (el as HTMLElement).dataset.action;
        const id = (el as HTMLElement).dataset.id ?? '';
        const indexRaw = (el as HTMLElement).dataset.index;

        switch (action) {
          case 'cultivate':
            this.handlers.onCultivate();
            break;
          case 'manage':
            this.handlers.onOpenManage();
            break;
          case 'outing':
            this.handlers.onOpenOuting();
            break;
          case 'alchemy':
            this.handlers.onOpenAlchemy();
            break;
          case 'technique':
            this.handlers.onOpenTechnique();
            break;
          case 'artifact':
            this.handlers.onOpenArtifact();
            break;
          case 'quest':
            this.handlers.onOpenQuest();
            break;
          case 'ads':
            this.handlers.onOpenAds();
            break;
          case 'watch-ad':
            this.handlers.onWatchRewardAd();
            break;
          case 'share-invite':
            this.handlers.onShareInvite();
            break;
          case 'back':
            this.handlers.onBackMain();
            break;
          case 'back-manage':
            this.handlers.onOpenManage();
            break;
          case 'upgrade':
            if (id === 'garden' || id === 'forge' || id === 'vein' || id === 'library') {
              this.handlers.onUpgrade(id);
            }
            break;
          case 'recruit':
            this.handlers.onRecruit();
            break;
          case 'open-assign':
            this.handlers.onOpenAssign();
            break;
          case 'assign': {
            const idx = Number(indexRaw);
            const buildingId =
              id === 'garden' || id === 'forge' || id === 'vein' || id === 'library' ? id : null;
            this.handlers.onAssign(idx, buildingId);
            break;
          }
          case 'train':
            this.handlers.onTrain(Number(indexRaw));
            break;
          case 'outing-go':
            if (id === 'mountain' || id === 'market' || id === 'ruins') {
              this.handlers.onOuting(id);
            }
            break;
          case 'craft':
            this.handlers.onCraft(id);
            break;
          case 'use-pill':
            this.handlers.onUsePill(id);
            break;
          case 'learn-tech':
            this.handlers.onLearnTech(id);
            break;
          case 'activate-tech':
            this.handlers.onActivateTech(id);
            break;
          case 'equip-art':
            this.handlers.onEquipArtifact(id);
            break;
          case 'claim-quest':
            this.handlers.onClaimQuest(id);
            break;
          case 'shop-buy':
            this.handlers.onShopBuy(id);
            break;
          case 'shop-skip':
            this.handlers.onShopSkip();
            break;
          case 'reset':
            this.handlers.onReset();
            break;
          default:
            break;
        }
      });
    });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
