'use client';

import React from 'react';
import { UserSettings, ThemeConfig } from '@/types/typing';
import { THEME_PRESETS, DEFAULT_THEME, applyThemeToDom } from '@/lib/themes';
import { Palette, X, RotateCcw, Check } from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export function ThemeModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: ThemeModalProps) {
  if (!isOpen) return null;

  const currentThemeId = settings.themeId;

  const handleSelectPreset = (preset: ThemeConfig) => {
    applyThemeToDom(preset);
    onUpdateSettings({
      ...settings,
      themeId: preset.id,
    });
  };

  const handleCustomColorChange = (key: keyof ThemeConfig, value: string) => {
    const updatedCustom: ThemeConfig = {
      ...settings.customTheme,
      [key]: value,
    };
    applyThemeToDom(updatedCustom);
    onUpdateSettings({
      ...settings,
      themeId: 'custom',
      customTheme: updatedCustom,
    });
  };

  const handleResetCustomTheme = () => {
    const resetCustom: ThemeConfig = {
      ...DEFAULT_THEME,
      id: 'custom',
      name: 'Kustom',
    };
    applyThemeToDom(resetCustom);
    onUpdateSettings({
      ...settings,
      themeId: 'custom',
      customTheme: resetCustom,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl transition-all"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--bg-border)',
          color: 'var(--text-main)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--bg-border)' }}>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="text-lg font-bold">Pengaturan Tema & Warna</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            style={{ borderColor: 'var(--bg-border)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section 1: Presets */}
        <div className="mt-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-3">
            Preset Tema Siap Pakai
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEME_PRESETS.map((preset) => {
              const isSelected = currentThemeId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/30 shadow-md'
                      : 'border-[var(--bg-border)] hover:border-[var(--text-muted)]'
                  }`}
                  style={{
                    backgroundColor: preset.bg,
                    color: preset.text,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs">{preset.name}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5" style={{ color: preset.accent }} />
                    )}
                  </div>

                  {/* Swatches strip */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className="h-3.5 w-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.accent }}
                      title="Accent"
                    />
                    <div
                      className="h-3.5 w-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.surface }}
                      title="Surface"
                    />
                    <div
                      className="h-3.5 w-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.correct }}
                      title="Correct"
                    />
                    <div
                      className="h-3.5 w-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.error }}
                      title="Error"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Custom Theme Color Pickers */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--bg-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-sm">Tema Kustom Pengguna</div>
              <div className="text-xs text-[var(--text-muted)]">
                Ubah tiap elemen warna secara presisi
              </div>
            </div>
            <button
              onClick={handleResetCustomTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-[var(--bg-app)] transition-colors"
              style={{ borderColor: 'var(--bg-border)' }}
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Kustom</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Background Color */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: 'var(--bg-border)' }}>
              <div>
                <span className="font-medium block">Latar Belakang (Background)</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{settings.customTheme.bg}</span>
              </div>
              <input
                type="color"
                value={settings.customTheme.bg}
                onChange={(e) => handleCustomColorChange('bg', e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
              />
            </div>

            {/* Surface Color */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: 'var(--bg-border)' }}>
              <div>
                <span className="font-medium block">Panel / Kotak (Surface)</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{settings.customTheme.surface}</span>
              </div>
              <input
                type="color"
                value={settings.customTheme.surface}
                onChange={(e) => handleCustomColorChange('surface', e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
              />
            </div>

            {/* Accent Color */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: 'var(--bg-border)' }}>
              <div>
                <span className="font-medium block">Warna Aksen Utama</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{settings.customTheme.accent}</span>
              </div>
              <input
                type="color"
                value={settings.customTheme.accent}
                onChange={(e) => {
                  handleCustomColorChange('accent', e.target.value);
                  handleCustomColorChange('chartLine', e.target.value);
                  handleCustomColorChange('caret', e.target.value);
                }}
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
              />
            </div>

            {/* Text Color */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: 'var(--bg-border)' }}>
              <div>
                <span className="font-medium block">Warna Teks Utama</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{settings.customTheme.text}</span>
              </div>
              <input
                type="color"
                value={settings.customTheme.text}
                onChange={(e) => handleCustomColorChange('text', e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
              />
            </div>

            {/* Correct Color */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: 'var(--bg-border)' }}>
              <div>
                <span className="font-medium block">Karakter / Kata Benar</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{settings.customTheme.correct}</span>
              </div>
              <input
                type="color"
                value={settings.customTheme.correct}
                onChange={(e) => handleCustomColorChange('correct', e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
              />
            </div>

            {/* Error Color */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: 'var(--bg-border)' }}>
              <div>
                <span className="font-medium block">Karakter / Kata Salah</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{settings.customTheme.error}</span>
              </div>
              <input
                type="color"
                value={settings.customTheme.error}
                onChange={(e) => handleCustomColorChange('error', e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
              />
            </div>

            {/* Caret Color */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: 'var(--bg-border)' }}>
              <div>
                <span className="font-medium block">Indikator Caret Kursor</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{settings.customTheme.caret}</span>
              </div>
              <input
                type="color"
                value={settings.customTheme.caret}
                onChange={(e) => handleCustomColorChange('caret', e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
              />
            </div>

            {/* Chart Line Color */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: 'var(--bg-border)' }}>
              <div>
                <span className="font-medium block">Garis Grafik Performa</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{settings.customTheme.chartLine}</span>
              </div>
              <input
                type="color"
                value={settings.customTheme.chartLine}
                onChange={(e) => handleCustomColorChange('chartLine', e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t flex justify-end" style={{ borderColor: 'var(--bg-border)' }}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#ffffff',
            }}
          >
            Terapkan & Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
