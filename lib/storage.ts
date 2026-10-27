import { UserSettings, TestResult, ThemeConfig } from '@/types/typing';
import { DEFAULT_THEME, THEME_PRESETS } from './themes';

const SETTINGS_KEY = 'ketikkilat_settings_v1';
const HISTORY_KEY = 'ketikkilat_history_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  themeId: '10ff-classic',
  customTheme: {
    ...DEFAULT_THEME,
    id: 'custom',
    name: 'Kustom',
  },
  soundEnabled: true,
  soundVolume: 50,
  soundProfile: 'mechanical',
  difficulty: 'normal',
  mode: 'time',
  timeDuration: 60,
  wordCount: 50,
  fontSize: 'lg',
  fontFamily: 'sans',
  highlightMistakes: true,
  liveWpm: false,
  liveAccuracy: false,
  liveTimer: true,
};

export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage might be full or restricted
  }
}

export function loadHistory(): TestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveResultToHistory(result: TestResult): TestResult[] {
  if (typeof window === 'undefined') return [result];
  try {
    const existing = loadHistory();
    const updated = [result, ...existing].slice(0, 100); // Keep last 100 results
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [result];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    //
  }
}

export function deleteHistoryItem(id: string): TestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = loadHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getActiveTheme(settings: UserSettings): ThemeConfig {
  if (settings.themeId === 'custom') {
    return settings.customTheme;
  }
  return THEME_PRESETS.find((t) => t.id === settings.themeId) || DEFAULT_THEME;
}

const USERNAME_KEY = 'ketikkilat_username_v1';
const CLIENT_ID_KEY = 'ketikkilat_client_id_v1';

export function loadUsername(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(USERNAME_KEY) || '';
  } catch {
    return '';
  }
}

export function saveUsername(username: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERNAME_KEY, username.trim());
  } catch {
    //
  }
}

export function getOrCreateClientId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let existing = localStorage.getItem(CLIENT_ID_KEY);
    if (!existing) {
      existing = `kk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(CLIENT_ID_KEY, existing);
    }
    return existing;
  } catch {
    return `kk-anon-${Math.random().toString(36).slice(2, 8)}`;
  }
}

