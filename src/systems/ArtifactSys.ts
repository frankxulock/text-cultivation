import { getArtifact } from '../data/artifacts';
import { pushLog, recalcPower, type GameState } from '../model/GameState';

export interface ArtifactResult {
  ok: boolean;
  message: string;
}

export function grantArtifact(state: GameState, artifactId: string): string | null {
  if (state.artifacts.includes(artifactId)) {
    return null;
  }
  const art = getArtifact(artifactId);
  if (!art) {
    return null;
  }
  state.artifacts.push(artifactId);
  if (!state.equippedArtifact) {
    state.equippedArtifact = artifactId;
    recalcPower(state);
  }
  return `获得法宝【${art.name}】！${art.desc}`;
}

export function buyArtifact(state: GameState, artifactId: string): ArtifactResult {
  const art = getArtifact(artifactId);
  if (!art || art.marketPrice == null) {
    return { ok: false, message: '此物不可购得。' };
  }
  if (state.artifacts.includes(artifactId)) {
    return { ok: false, message: `你已拥有【${art.name}】。` };
  }
  if (state.spiritStone < art.marketPrice) {
    const message = `灵石不足，【${art.name}】需 ${art.marketPrice} 灵石。`;
    pushLog(state, message);
    return { ok: false, message };
  }
  state.spiritStone -= art.marketPrice;
  const gained = grantArtifact(state, artifactId);
  const message = gained
    ? `花费 ${art.marketPrice} 灵石购入。${gained}`
    : `购入失败。`;
  pushLog(state, message);
  recalcPower(state);
  return { ok: Boolean(gained), message };
}

export function equipArtifact(state: GameState, artifactId: string): ArtifactResult {
  if (!state.artifacts.includes(artifactId)) {
    return { ok: false, message: '未拥有该法宝。' };
  }
  state.equippedArtifact = artifactId;
  recalcPower(state);
  const art = getArtifact(artifactId)!;
  const message = `佩戴法宝【${art.name}】，战力 ${state.power}。`;
  pushLog(state, message);
  return { ok: true, message };
}

export function listOwnedArtifacts(state: GameState): { id: string; label: string }[] {
  return state.artifacts.map((id) => {
    const a = getArtifact(id)!;
    const eq = state.equippedArtifact === id ? '【佩戴】' : '';
    return {
      id,
      label: `${eq}${a.name}（战力+${a.powerBonus}）`,
    };
  });
}
