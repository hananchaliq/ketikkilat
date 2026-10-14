import { ThemeConfig } from '@/types/typing';

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: '10ff-classic',
    name: 'KetikKilat Klasik (Default)',
    bg: '#f1f5f9',
    surface: '#ffffff',
    surfaceBorder: '#94a3b8',
    text: '#0f172a',
    textMuted: '#475569',
    accent: '#2563eb',
    correct: '#15803d',
    error: '#dc2626',
    caret: '#2563eb',
    chartLine: '#2563eb',
  },
  {
    id: '10ff-dark',
    name: 'KetikKilat Dark',
    bg: '#0f172a',
    surface: '#1e293b',
    surfaceBorder: '#334155',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    accent: '#38bdf8',
    correct: '#22c55e',
    error: '#f87171',
    caret: '#38bdf8',
    chartLine: '#38bdf8',
  },
  {
    id: 'clean-white',
    name: 'Putih Minimalis',
    bg: '#ffffff',
    surface: '#f8fafc',
    surfaceBorder: '#cbd5e1',
    text: '#020617',
    textMuted: '#475569',
    accent: '#2563eb',
    correct: '#15803d',
    error: '#b91c1c',
    caret: '#2563eb',
    chartLine: '#2563eb',
  },
  {
    id: 'midnight',
    name: 'Midnight Navy',
    bg: '#0a0e1a',
    surface: '#121829',
    surfaceBorder: '#1e293b',
    text: '#e2e8f0',
    textMuted: '#64748b',
    accent: '#6366f1',
    correct: '#22c55e',
    error: '#ef4444',
    caret: '#818cf8',
    chartLine: '#6366f1',
  },
  {
    id: 'oled',
    name: 'OLED Black',
    bg: '#000000',
    surface: '#0d0d0d',
    surfaceBorder: '#222222',
    text: '#ffffff',
    textMuted: '#777777',
    accent: '#10b981',
    correct: '#10b981',
    error: '#f43f5e',
    caret: '#10b981',
    chartLine: '#10b981',
  },
  {
    id: 'sepia',
    name: 'Warm Sepia',
    bg: '#fbf0d9',
    surface: '#f4e6c7',
    surfaceBorder: '#dac39f',
    text: '#433422',
    textMuted: '#8c7b64',
    accent: '#b45309',
    correct: '#15803d',
    error: '#b91c1c',
    caret: '#b45309',
    chartLine: '#b45309',
  },
];

export const DEFAULT_THEME = THEME_PRESETS[0];

export function isDarkTheme(theme: ThemeConfig): boolean {
  return theme.id === '10ff-dark' || theme.id === 'midnight' || theme.id === 'oled';
}

export function applyThemeToDom(theme: ThemeConfig) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (isDarkTheme(theme)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  root.style.setProperty('--bg-app', theme.bg);
  root.style.setProperty('--bg-surface', theme.surface);
  root.style.setProperty('--bg-border', theme.surfaceBorder);
  root.style.setProperty('--text-main', theme.text);
  root.style.setProperty('--text-muted', theme.textMuted);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-correct', theme.correct);
  root.style.setProperty('--color-error', theme.error);
  root.style.setProperty('--color-caret', theme.caret);
  root.style.setProperty('--color-chart', theme.chartLine);
}
