'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Settings,
  Palette,
  RotateCcw,
  Users,
  History,
  BookOpen,
} from 'lucide-react';
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
  const [displayCount, setDisplayCount] = useState<number>(onlineCount);
  const [outgoingCount, setOutgoingCount] = useState<number | null>(null);
  const [animSequence, setAnimSequence] = useState<number>(0);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const prevCountRef = useRef<number>(onlineCount);

  useEffect(() => {
    if (onlineCount !== prevCountRef.current) {
      const previous = prevCountRef.current;
      prevCountRef.current = onlineCount;
      setOutgoingCount(previous);
      setDisplayCount(onlineCount);
      setAnimSequence((s) => s + 1);
      setIsPulsing(true);

      const clearSlideTimer = setTimeout(() => {
        setOutgoingCount(null);
      }, 300);

      const clearPulseTimer = setTimeout(() => {
        setIsPulsing(false);
      }, 650);

      return () => {
        clearTimeout(clearSlideTimer);
        clearTimeout(clearPulseTimer);
      };
    }
  }, [onlineCount]);

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
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 sm:gap-4 px-3.5 sm:px-6">
        {/* Left: Brand Title + Desktop Navigation */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <button
            onClick={() => setActiveTab('test')}
            className="flex items-center gap-2 text-left cursor-pointer transition-opacity hover:opacity-90 shrink-0"
            title="KetikKilat Beranda"
          >
            <BrandLogo size={28} />
            <span className="text-base font-extrabold tracking-tight text-[var(--text-main)] font-sans">
              Ketik<span className="text-[var(--color-accent)]">Kilat</span>
            </span>
          </button>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('test')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'test'
                  ? 'bg-[var(--bg-app)] text-[var(--color-accent)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Tes Kecepatan
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'practice'
                  ? 'bg-[var(--bg-app)] text-[var(--color-accent)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Latihan Bebas
            </button>
            <button
              onClick={onOpenHistory}
              className="px-3 py-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer whitespace-nowrap"
            >
              Riwayat Skor
            </button>
            <button
              onClick={onOpenGuide}
              className="px-3 py-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer whitespace-nowrap"
            >
              Panduan 10 Jari
            </button>
          </nav>
        </div>

        {/* Right: Top-Right Online Users Indicator + Responsive Action Controls */}
        <div className="flex items-center gap-1.5 text-xs shrink-0">
          {/* Top-Right Online Users Real-Time Indicator with Bottom-to-Top Slide-Up Animation */}
          <div
            className={`h-9 px-2.5 flex items-center gap-1.5 rounded-md border font-medium whitespace-nowrap shrink-0 transition-colors duration-300 ${
              isPulsing
                ? 'border-emerald-500/80 bg-emerald-500/10'
                : ''
            }`}
            style={{
              backgroundColor: isPulsing ? undefined : 'var(--bg-app)',
              borderColor: isPulsing ? undefined : 'var(--bg-border)',
              color: 'var(--text-main)',
            }}
            title={
              typingCount > 0
                ? `${displayCount} pengguna online (${typingCount} sedang mengetik secara real-time)`
                : `${displayCount} pengguna sedang online secara real-time`
            }
          >
            {/* Live Connection Dot with Green Pulse on Change */}
            <span className="relative flex h-2 w-2 shrink-0">
              {isPulsing && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 transition-transform duration-200 ${
                  isPulsing
                    ? 'bg-emerald-400 scale-125'
                    : 'bg-emerald-500'
                }`}
              />
            </span>

            <Users className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />

            {/* Vertical Odometer Slide-Up Container (Bottom -> Top) */}
            <span className="relative inline-flex items-center justify-center overflow-hidden h-5 min-w-[1ch] px-0.5 font-display tabular-nums font-bold">
              {outgoingCount !== null && (
                <span
                  key={`out-${animSequence}`}
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center animate-slide-up-out"
                >
                  {outgoingCount}
                </span>
              )}
              <span
                key={`in-${animSequence}`}
                className={`inline-flex items-center justify-center ${
                  outgoingCount !== null ? 'animate-slide-up-in text-emerald-600 dark:text-emerald-400' : ''
                }`}
              >
                {displayCount}
              </span>
            </span>

            <span className="text-[var(--text-muted)] hidden sm:inline">
              Online
            </span>
          </div>

          {testRunning && (
            <button
              onClick={onRestartTest}
              title="Restart (Tab + Enter)"
              className="hidden sm:flex items-center gap-1 px-2.5 h-9 rounded-md border text-xs font-medium transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
              style={{
                borderColor: 'var(--bg-border)',
                color: 'var(--text-main)',
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Mobile Quick History & Guide Buttons */}
          <button
            onClick={onOpenHistory}
            title="Riwayat Skor"
            aria-label="Riwayat Skor"
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-md border text-[var(--text-main)] transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
            style={{ borderColor: 'var(--bg-border)' }}
          >
            <History className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenGuide}
            title="Panduan 10 Jari"
            aria-label="Panduan 10 Jari"
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-md border text-[var(--text-main)] transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
            style={{ borderColor: 'var(--bg-border)' }}
          >
            <BookOpen className="h-4 w-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={
              settings.soundEnabled
                ? `Suara Aktif (${settings.soundVolume}%)`
                : 'Suara Mati'
            }
            aria-label="Pengaturan Suara"
            className="h-9 w-9 flex items-center justify-center rounded-md border transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
            style={{
              borderColor: 'var(--bg-border)',
              color: settings.soundEnabled
                ? 'var(--color-accent)'
                : 'var(--text-muted)',
            }}
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onOpenThemes}
            title="Ganti Tema & Warna"
            aria-label="Ganti Tema"
            className="h-9 w-9 flex items-center justify-center rounded-md border text-[var(--text-main)] transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
            style={{ borderColor: 'var(--bg-border)' }}
          >
            <Palette className="h-4 w-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Pengaturan"
            aria-label="Pengaturan"
            className="h-9 w-9 flex items-center justify-center rounded-md border text-[var(--text-main)] transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
            style={{ borderColor: 'var(--bg-border)' }}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
