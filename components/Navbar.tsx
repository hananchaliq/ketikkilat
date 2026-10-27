'use client';

import React from 'react';
import { Volume2, VolumeX, Settings, Palette, RotateCcw, Users } from 'lucide-react';
import { UserSettings } from '@/types/typing';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  activeTab: 'test' | 'practice' | 'history' | 'guide';
  setActiveTab: (tab: 'test' | 'practice' | 'history' | 'guide') => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onOpenSettings: () => void;
  onOpenThemes: () => void;
  onOpenHistory: () => void;
  onOpenGuide: () => void;
  onRestartTest: () => void;
  testRunning: boolean;
  onlineCount?: number;
  typingCount?: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenThemes,
  onOpenHistory,
  onOpenGuide,
  onRestartTest,
  testRunning,
  onlineCount = 1,
  typingCount = 0,
}: NavbarProps) {
  const toggleSound = () => {
    onUpdateSettings({
      ...settings,
      soundEnabled: !settings.soundEnabled,
    });
  };

  return (
    <header
      className="w-full border-b transition-colors select-none"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--bg-border)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: 10FastFingers-inspired clean brand title */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('test')}
            className="flex items-center gap-2 text-left cursor-pointer transition-opacity hover:opacity-90"
            title="KetikKilat Beranda"
          >
            <BrandLogo size={28} />
            <span className="text-base font-extrabold tracking-tight text-[var(--text-main)] font-sans">
              Ketik<span className="text-[var(--color-accent)]">Kilat</span>
            </span>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('test')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'test'
                  ? 'bg-[var(--bg-app)] text-[var(--color-accent)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Tes Kecepatan (1 Menit)
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'practice'
                  ? 'bg-[var(--bg-app)] text-[var(--color-accent)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Latihan Bebas
            </button>
            <button
              onClick={onOpenHistory}
              className="px-3 py-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Riwayat Skor
            </button>
            <button
              onClick={onOpenGuide}
              className="px-3 py-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Panduan 10 Jari
            </button>
          </nav>
        </div>

        {/* Right: Online Indicator + Clean Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Top-Right Online Users Indicator */}
          <div
            className="h-8 px-2.5 flex items-center gap-1.5 rounded border font-medium whitespace-nowrap shrink-0"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--bg-border)',
              color: 'var(--text-main)',
            }}
            title={
              typingCount > 0
                ? `${onlineCount} pengguna online (${typingCount} sedang mengetik)`
                : `${onlineCount} pengguna sedang online`
            }
          >
            <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
            <Users className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
            <span className="font-mono tabular-nums font-bold">{onlineCount}</span>
            <span className="text-[var(--text-muted)] hidden sm:inline">Online</span>
          </div>

          {testRunning && (
            <button
              onClick={onRestartTest}
              title="Restart (Tab + Enter)"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 h-8 rounded border text-xs font-medium transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
              style={{
                borderColor: 'var(--bg-border)',
                color: 'var(--text-main)',
              }}
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={settings.soundEnabled ? `Suara Aktif (${settings.soundVolume}%)` : 'Suara Mati'}
            className="h-8 w-8 flex items-center justify-center rounded border transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
            style={{
              borderColor: 'var(--bg-border)',
              color: settings.soundEnabled ? 'var(--color-accent)' : 'var(--text-muted)',
            }}
          >
            {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onOpenThemes}
            title="Ganti Tema & Warna"
            className="h-8 w-8 flex items-center justify-center rounded border text-[var(--text-main)] transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
            style={{ borderColor: 'var(--bg-border)' }}
          >
            <Palette className="h-4 w-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Pengaturan"
            className="h-8 w-8 flex items-center justify-center rounded border text-[var(--text-main)] transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
            style={{ borderColor: 'var(--bg-border)' }}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
