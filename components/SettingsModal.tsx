'use client';

import React, { useState } from 'react';
import { UserSettings, Difficulty, TypingMode } from '@/types/typing';
import { DEFAULT_SETTINGS } from '@/lib/storage';
import { soundManager } from '@/lib/sound';
import {
  X,
  Volume2,
  Sliders,
  Type,
  RotateCcw,
  Trash2,
  Check,
  Play,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onClearHistory: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'rules' | 'appearance' | 'sound' | 'data'>('rules');
  const [customDurationInput, setCustomDurationInput] = useState<string>(
    settings.timeDuration.toString()
  );
  const [clearedConfirm, setClearedConfirm] = useState(false);

  if (!isOpen) return null;

  const handleDifficultyChange = (difficulty: Difficulty) => {
    onUpdateSettings({ ...settings, difficulty });
  };

  const handleModeChange = (mode: TypingMode) => {
    onUpdateSettings({ ...settings, mode });
  };

  const handleTimeDurationChange = (dur: number) => {
    onUpdateSettings({ ...settings, timeDuration: dur });
    setCustomDurationInput(dur.toString());
  };

  const handleWordCountChange = (count: number) => {
    onUpdateSettings({ ...settings, wordCount: count });
  };

  const handleCustomDurationSubmit = () => {
    const val = parseInt(customDurationInput, 10);
    if (!isNaN(val) && val >= 5 && val <= 600) {
      onUpdateSettings({ ...settings, timeDuration: val });
    }
  };

  const testKeySound = () => {
    soundManager.playKey(settings.soundVolume / 100);
  };
  const testSpaceSound = () => {
    soundManager.playSpace(settings.soundVolume / 100);
  };
  const testFinishSound = () => {
    soundManager.playComplete(settings.soundVolume / 100);
  };

  const handleResetDefaults = () => {
    onUpdateSettings(DEFAULT_SETTINGS);
  };

  const handleClearHistoryConfirm = () => {
    onClearHistory();
    setClearedConfirm(true);
    setTimeout(() => setClearedConfirm(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl rounded-2xl border p-6 shadow-2xl transition-all"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--bg-border)',
          color: 'var(--text-main)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--bg-border)' }}>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="text-lg font-bold">Pengaturan KetikKilat</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            style={{ borderColor: 'var(--bg-border)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b my-4 pb-2 text-xs font-semibold" style={{ borderColor: 'var(--bg-border)' }}>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'rules'
                ? 'bg-[var(--bg-app)] text-[var(--color-accent)] border border-[var(--bg-border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Mode & Waktu
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'appearance'
                ? 'bg-[var(--bg-app)] text-[var(--color-accent)] border border-[var(--bg-border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Tampilan & Font
          </button>
          <button
            onClick={() => setActiveTab('sound')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'sound'
                ? 'bg-[var(--bg-app)] text-[var(--color-accent)] border border-[var(--bg-border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Audio Keyboard
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'data'
                ? 'bg-[var(--bg-app)] text-[var(--color-accent)] border border-[var(--bg-border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Data & Riwayat
          </button>
        </div>

        {/* Tab 1: Mode & Waktu */}
        {activeTab === 'rules' && (
          <div className="space-y-5 py-2 text-sm">
            {/* Mode Selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                Format Pengujian
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleModeChange('time')}
                  className={`py-2 px-3 rounded-lg border font-medium text-xs transition-all ${
                    settings.mode === 'time'
                      ? 'border-[var(--color-accent)] bg-[var(--bg-app)] font-bold text-[var(--color-accent)]'
                      : 'border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Berdasarkan Waktu (Time Mode)
                </button>
                <button
                  onClick={() => handleModeChange('words')}
                  className={`py-2 px-3 rounded-lg border font-medium text-xs transition-all ${
                    settings.mode === 'words'
                      ? 'border-[var(--color-accent)] bg-[var(--bg-app)] font-bold text-[var(--color-accent)]'
                      : 'border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Berdasarkan Target Kata (Word Mode)
                </button>
              </div>
            </div>

            {/* Durasi Waktu */}
            {settings.mode === 'time' && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                  Durasi Tes Waktu
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[15, 30, 60, 120].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => handleTimeDurationChange(dur)}
                      className={`py-2 rounded-lg border font-mono text-xs font-semibold transition-all ${
                        settings.timeDuration === dur
                          ? 'border-[var(--color-accent)] bg-[var(--bg-app)] text-[var(--color-accent)]'
                          : 'border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>

                {/* Custom duration */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-[var(--text-muted)]">Durasi Khusus:</span>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={customDurationInput}
                    onChange={(e) => setCustomDurationInput(e.target.value)}
                    onBlur={handleCustomDurationSubmit}
                    className="w-24 px-2 py-1 rounded-md border text-xs font-mono bg-[var(--bg-app)] text-[var(--text-main)] outline-none"
                    style={{ borderColor: 'var(--bg-border)' }}
                  />
                  <span className="text-xs text-[var(--text-muted)]">detik (5 - 600s)</span>
                </div>
              </div>
            )}

            {/* Target Words */}
            {settings.mode === 'words' && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                  Target Jumlah Kata
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleWordCountChange(count)}
                      className={`py-2 rounded-lg border font-mono text-xs font-semibold transition-all ${
                        settings.wordCount === count
                          ? 'border-[var(--color-accent)] bg-[var(--bg-app)] text-[var(--color-accent)]'
                          : 'border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {count} kata
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tingkat Kesulitan */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                Tingkat Kosakata Bahasa Indonesia
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'easy', label: 'Mudah', desc: 'Kata umum pendek' },
                    { id: 'normal', label: 'Normal', desc: 'Kosakata harian & imbuhan' },
                    { id: 'advanced', label: 'Mahir', desc: 'Kata panjang formal' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleDifficultyChange(d.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      settings.difficulty === d.id
                        ? 'border-[var(--color-accent)] bg-[var(--bg-app)] text-[var(--color-accent)]'
                        : 'border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <div className="font-semibold text-xs text-[var(--text-main)]">{d.label}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Appearance */}
        {activeTab === 'appearance' && (
          <div className="space-y-5 py-2 text-sm">
            {/* Font Size */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                Ukuran Teks Kata
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'sm', label: 'Kecil' },
                    { id: 'md', label: 'Sedang' },
                    { id: 'lg', label: 'Besar' },
                    { id: 'xl', label: 'Ekstra' },
                  ] as const
                ).map((size) => (
                  <button
                    key={size.id}
                    onClick={() => onUpdateSettings({ ...settings, fontSize: size.id })}
                    className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                      settings.fontSize === size.id
                        ? 'border-[var(--color-accent)] bg-[var(--bg-app)] text-[var(--color-accent)] font-bold'
                        : 'border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Stats Toggles */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                Indikator Langsung Selama Tes
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-lg border cursor-pointer hover:bg-[var(--bg-app)]" style={{ borderColor: 'var(--bg-border)' }}>
                  <span className="text-xs font-medium">Tampilkan Kecepatan Langsung (Live WPM)</span>
                  <input
                    type="checkbox"
                    checked={settings.liveWpm}
                    onChange={(e) => onUpdateSettings({ ...settings, liveWpm: e.target.checked })}
                    className="accent-[var(--color-accent)] h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg border cursor-pointer hover:bg-[var(--bg-app)]" style={{ borderColor: 'var(--bg-border)' }}>
                  <span className="text-xs font-medium">Tampilkan Akurasi Langsung (Live Accuracy)</span>
                  <input
                    type="checkbox"
                    checked={settings.liveAccuracy}
                    onChange={(e) => onUpdateSettings({ ...settings, liveAccuracy: e.target.checked })}
                    className="accent-[var(--color-accent)] h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg border cursor-pointer hover:bg-[var(--bg-app)]" style={{ borderColor: 'var(--bg-border)' }}>
                  <span className="text-xs font-medium">Sorot Kesalahan Per Huruf (Underline & Warna)</span>
                  <input
                    type="checkbox"
                    checked={settings.highlightMistakes}
                    onChange={(e) => onUpdateSettings({ ...settings, highlightMistakes: e.target.checked })}
                    className="accent-[var(--color-accent)] h-4 w-4"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Sound */}
        {activeTab === 'sound' && (
          <div className="space-y-5 py-2 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--bg-border)', backgroundColor: 'var(--bg-app)' }}>
              <div>
                <div className="font-semibold text-xs text-[var(--text-main)]">Efek Suara Mechanical Keyboard</div>
                <div className="text-[11px] text-[var(--text-muted)]">Sintesis Web Audio real-time tanpa lag</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
                className="accent-[var(--color-accent)] h-5 w-5 cursor-pointer"
              />
            </div>

            {settings.soundEnabled && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Volume Suara
                    </span>
                    <span className="font-mono text-xs font-bold text-[var(--color-accent)]">
                      {settings.soundVolume}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume}
                    onChange={(e) => onUpdateSettings({ ...settings, soundVolume: parseInt(e.target.value, 10) })}
                    className="w-full accent-[var(--color-accent)] cursor-pointer"
                  />
                </div>

                {/* Sound Profile Selector */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                    Pilihan Karakter Suara Tuts
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'mechanical', name: 'Cherry Blue (Klik)', desc: 'Klik tajam & renyah' },
                      { id: 'thock', name: 'Gateron Thock (Bass)', desc: 'Suara dalam mantap' },
                      { id: 'typewriter', name: 'Mesin Tik Vintage', desc: 'Sentuhan klasik logam' },
                      { id: 'bubble', name: 'Bubble Pop', desc: 'Pop gelembung santai' },
                    ].map((prof) => (
                      <button
                        key={prof.id}
                        onClick={() => {
                          onUpdateSettings({ ...settings, soundProfile: prof.id as any });
                          soundManager.playKey(settings.soundVolume / 100, prof.id as any);
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          (settings.soundProfile || 'mechanical') === prof.id
                            ? 'border-[var(--color-accent)] bg-[var(--bg-app)] text-[var(--color-accent)] font-semibold shadow-2xs'
                            : 'border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        <div className="font-semibold text-xs text-[var(--text-main)]">{prof.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{prof.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Sound Samples */}
                <div className="mt-2">
                  <div className="text-xs text-[var(--text-muted)] mb-2 font-medium">Uji Coba Suara:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => soundManager.playKey(settings.soundVolume / 100, settings.soundProfile || 'mechanical')}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium hover:bg-[var(--bg-app)] transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--bg-border)' }}
                    >
                      <Play className="h-3 w-3 text-[var(--color-accent)]" />
                      <span>Tuts Standar</span>
                    </button>
                    <button
                      onClick={() => soundManager.playSpace(settings.soundVolume / 100, settings.soundProfile || 'mechanical')}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium hover:bg-[var(--bg-app)] transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--bg-border)' }}
                    >
                      <Play className="h-3 w-3 text-[var(--color-accent)]" />
                      <span>Spasi / Thud</span>
                    </button>
                    <button
                      onClick={testFinishSound}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium hover:bg-[var(--bg-app)] transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--bg-border)' }}
                    >
                      <Play className="h-3 w-3 text-[var(--color-correct)]" />
                      <span>Chime Selesai</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Data & Reset */}
        {activeTab === 'data' && (
          <div className="space-y-4 py-2 text-sm">
            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--bg-border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-[var(--text-main)]">Hapus Semua Riwayat Tes</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Menghapus data sesi dan rekor dari browser lokal</div>
                </div>
                <button
                  onClick={handleClearHistoryConfirm}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors hover:bg-red-500/10"
                  style={{
                    borderColor: 'var(--color-error)',
                    color: 'var(--color-error)',
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{clearedConfirm ? 'Terhapus!' : 'Hapus Riwayat'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--bg-border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-[var(--text-main)]">Reset Pengaturan ke Default</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Mengembalikan konfigurasi tema, suara, dan mode awal</div>
                </div>
                <button
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors hover:bg-[var(--bg-app)]"
                  style={{
                    borderColor: 'var(--bg-border)',
                    color: 'var(--text-main)',
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t flex justify-end" style={{ borderColor: 'var(--bg-border)' }}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--bg-app)',
            }}
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
