import { ThemeConfig } from '@/types/typing';

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: '10ff-classic',
    name: '10FastFingers Klasik (Default)',
    bg: '#f0f4f8',
    surface: '#ffffff',
    surfaceBorder: '#d1d5db',
    text: '#1f2937',
    textMuted: '#6b7280',
    accent: '#337ab7',
    correct: '#2e7d32',
    error: '#c62828',
    caret: '#337ab7',
    chartLine: '#337ab7',
  },
  {
    id: '10ff-dark',
    name: '10FF Dark Mode',
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
    surface: '#f9fafb',
    surfaceBorder: '#e5e7eb',
    text: '#111827',
    textMuted: '#4b5563',
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

export function applyThemeToDom(theme: ThemeConfig) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

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
