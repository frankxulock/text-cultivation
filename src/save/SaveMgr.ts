import { createInitialState, migrateState, type GameState } from '../model/GameState';

const SAVE_KEY = 'text-cultivation-save-v2';
const LEGACY_KEY = 'text-cultivation-save-v1';

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (typeof parsed.day !== 'number') {
      return null;
    }
    const migrated = migrateState(parsed);
    localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(LEGACY_KEY);
}

export function loadOrCreate(playerName?: string): GameState {
  return loadGame() ?? createInitialState(playerName);
}
