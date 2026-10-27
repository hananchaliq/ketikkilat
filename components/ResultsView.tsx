'use client';

import React, { useState, useEffect } from 'react';
import { TestResult } from '@/types/typing';
import { PerformanceChart } from './PerformanceChart';
import {
  RotateCcw,
  Share2,
  Check,
  RefreshCw,
  History,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Award,
  Zap,
  Target,
  Flame,
  Wrench,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '@/lib/sound';

interface ResultsViewProps {
  result: TestResult;
  personalBest: number;
  previousResult: TestResult | null;
  mistakes: Array<{ target: string; typed: string }>;
  onRestart: () => void;
  onChangeWords: () => void;
  onOpenHistory: () => void;
  onPracticeMistakes?: (words: string[]) => void;
  username?: string;
  onSubmitToLeaderboard?: (username: string) => void;
  leaderboardStatus?: { type: 'success' | 'info' | 'error'; text: string } | null;
}

export function ResultsView({
  result,
  personalBest,
  previousResult,
  mistakes,
  onRestart,
  onChangeWords,
  onOpenHistory,
  onPracticeMistakes,
  username = '',
  onSubmitToLeaderboard,
  leaderboardStatus,
}: ResultsViewProps) {
  const [copied, setCopied] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);
  const [displayWpm, setDisplayWpm] = useState(0);
  const [inputUsername, setInputUsername] = useState(username);

  const isNewBest = result.wpm >= personalBest && personalBest > 0;
  const cpm = result.wpm * 5;

  // Speed tier badge definition - clean, dignified, non-slop
  const getSpeedTier = (wpm: number) => {
    if (wpm >= 90) {
      return {
        title: 'Kilat Dewa (Grandmaster)',
        subtitle: 'Kecepatan luar biasa! Jari Anda melesat seperti kilat presisi.',
        badgeColor: 'bg-amber-600 text-white shadow-xs border border-amber-500/40',
        icon: <Trophy className="h-5 w-5 text-amber-200" />,
      };
    }
    if (wpm >= 70) {
      return {
        title: 'Rajawali Angkasa (Master)',
        subtitle: 'Sangat cepat dan konsisten di atas rata-rata pengetik!',
        badgeColor: 'bg-sky-600 text-white shadow-xs border border-sky-500/40',
        icon: <Zap className="h-5 w-5 text-sky-100" />,
      };
    }
    if (wpm >= 50) {
      return {
        title: 'Macan Gesit (Profesional)',
        subtitle: 'Laju mengetik cepat, produktif, dan siap kerja profesional.',
        badgeColor: 'bg-emerald-600 text-white shadow-xs border border-emerald-500/40',
        icon: <Award className="h-5 w-5 text-emerald-100" />,
      };
    }
    if (wpm >= 35) {
      return {
        title: 'Kuda Lari (Menengah)',
        subtitle: 'Kecepatan standar yang baik, terus latih konsistensi ritme!',
        badgeColor: 'bg-blue-600 text-white shadow-xs border border-blue-500/40',
        icon: <Flame className="h-5 w-5 text-blue-100" />,
      };
    }
    return {
      title: 'Penyu Tekun (Pemula)',
      subtitle: 'Awal yang baik! Terus berlatih 10 jari secara teratur.',
      badgeColor: 'bg-slate-700 text-white shadow-xs border border-slate-600/40',
      icon: <Target className="h-5 w-5 text-slate-200" />,
    };
  };

  const tier = getSpeedTier(result.wpm);

  // Trigger celebratory confetti and fanfare sound on mount
  useEffect(() => {
    try {
      soundManager.playFanfare(0.4);

      if (isNewBest) {
        // Grand celebration for personal best
        const end = Date.now() + 1000;
        const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'];
        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
          });
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        })();
      } else {
        // Standard pleasant celebration pop
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
        });
      }
    } catch {
      // Ignore if canvas is unsupported
    }
  }, [isNewBest]);

  // Smooth animated count-up for WPM score
  useEffect(() => {
    const target = result.wpm;
    if (target === 0) {
      setDisplayWpm(0);
      return;
    }

    const duration = 750; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      // Ease out cubic: 1 - (1 - t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * easeProgress);
      setDisplayWpm(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [result.wpm]);

  const handleCopy = () => {
    const text = `⚡ Hasil Tes Mengetik Bahasa Indonesia (KetikKilat):
🏆 Gelar: ${tier.title}
🚀 Kecepatan: ${result.wpm} WPM (${cpm} CPM)
🎯 Akurasi: ${result.accuracy}%
⌨️ Keystrokes: ${result.totalKeystrokes} (${result.correctChars} benar | ${result.incorrectChars} salah)
✅ Kata Benar: ${result.correctWords} | ❌ Kata Salah: ${result.incorrectWords}
⏱️ Durasi: ${result.duration} detik
Uji kecepatan jari Anda di KetikKilat!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartMistakesPractice = () => {
    if (onPracticeMistakes && mistakes.length > 0) {
      const mistypedWords = Array.from(new Set(mistakes.map((m) => m.target)));
      onPracticeMistakes(mistypedWords);
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none">
      {/* 10FastFingers Classic Result Table Card with Tier Ribbon */}
      <div
        className="w-full rounded-md border p-4 sm:p-6 transition-colors shadow-2xs relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--bg-border)',
        }}
      >
        {/* Tier Medal Ribbon Banner */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b mb-4 gap-2" style={{ borderColor: 'var(--bg-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg flex items-center justify-center ${tier.badgeColor}`}>
              {tier.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                  {tier.title}
                </h2>
                <Sparkles className="h-4 w-4 text-amber-500 animate-spin-once" />
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {tier.subtitle}
              </p>
            </div>
          </div>

          {isNewBest && (
            <span
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-xs animate-bounce"
              style={{ backgroundColor: 'var(--color-correct)' }}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Rekor Pribadi Baru!</span>
            </span>
          )}
        </div>

        {/* The Authentic 10FastFingers #result-table */}
        <table className="w-full text-sm font-sans divide-y" style={{ borderColor: 'var(--bg-border)' }}>
          <tbody>
            {/* Primary Result Row with Animated Count-Up */}
            <tr className="border-b" style={{ borderColor: 'var(--bg-border)' }}>
              <td className="py-2.5 text-[var(--text-muted)] font-medium">Hasil Kecepatan:</td>
              <td className="py-2.5 text-right">
                <span
                  className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums transition-all"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {displayWpm} WPM
                </span>
                <span className="text-xs text-[var(--text-muted)] ml-1.5 font-normal">
                  (yaitu: {displayWpm * 5} CPM)
                </span>
              </td>
            </tr>

            {/* Keystrokes Row */}
            <tr className="border-b" style={{ borderColor: 'var(--bg-border)' }}>
              <td className="py-2 text-[var(--text-muted)] font-medium">Keystrokes:</td>
              <td className="py-2 text-right">
                <span className="font-semibold text-[var(--text-main)] font-mono tabular-nums">{result.totalKeystrokes}</span>
                <span className="text-[var(--text-muted)] ml-1 font-mono text-xs">
                  ({' '}
                  <span className="font-semibold text-green-700 dark:text-green-400 tabular-nums">
                    {result.correctChars}
                  </span>{' '}
                  |{' '}
                  <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                    {result.incorrectChars}
                  </span>{' '}
                  )
                </span>
              </td>
            </tr>

            {/* Accuracy Row */}
            <tr className="border-b" style={{ borderColor: 'var(--bg-border)' }}>
              <td className="py-2 text-[var(--text-muted)] font-medium">Akurasi:</td>
              <td className="py-2 text-right font-semibold text-[var(--text-main)] font-mono tabular-nums">
                {result.accuracy}%
              </td>
            </tr>

            {/* Correct Words Row */}
            <tr className="border-b" style={{ borderColor: 'var(--bg-border)' }}>
              <td className="py-2 text-[var(--text-muted)] font-medium">Kata Benar:</td>
              <td className="py-2 text-right font-bold text-green-700 dark:text-green-400 font-mono tabular-nums">
                {result.correctWords}
              </td>
            </tr>

              {/* Wrong Words Row */}
            <tr>
              <td className="py-2 text-[var(--text-muted)] font-medium">Kata Salah:</td>
              <td className="py-2 text-right font-bold text-red-600 dark:text-red-400 font-mono tabular-nums">
                {result.incorrectWords}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Quick Leaderboard Status / Username Submission Strip */}
        {onSubmitToLeaderboard && (
          <div
            className="mt-4 p-3 rounded border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--bg-border)',
            }}
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
              {leaderboardStatus ? (
                <span
                  className={`font-medium ${
                    leaderboardStatus.type === 'success'
                      ? 'text-green-700 dark:text-green-400'
                      : leaderboardStatus.type === 'error'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-[var(--text-main)]'
                  }`}
                >
                  {leaderboardStatus.text}
                </span>
              ) : result.accuracy < 85 ? (
                <span className="text-[var(--text-muted)]">
                  Syarat masuk Leaderboard minimal akurasi <strong>85%</strong> (skor saat ini: {result.accuracy}%).
                </span>
              ) : (
                <span className="text-[var(--text-main)]">
                  Masukkan username untuk mencatat skor <strong>{result.wpm} WPM</strong> ke Papan Peringkat:
                </span>
              )}
            </div>

            {!username && result.accuracy >= 85 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputUsername.trim().length >= 2) {
                    onSubmitToLeaderboard(inputUsername.trim());
                  }
                }}
                className="flex items-center gap-1.5 shrink-0"
              >
                <input
                  type="text"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  placeholder="Ketik username..."
                  maxLength={22}
                  className="px-2.5 py-1 rounded border text-xs font-medium outline-none focus:border-[var(--color-accent)]"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--bg-border)',
                    color: 'var(--text-main)',
                  }}
                />
                <button
                  type="submit"
                  disabled={inputUsername.trim().length < 2}
                  className="px-3 py-1 rounded text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  Simpan ke Leaderboard
                </button>
              </form>
            )}
          </div>
        )}

        {/* 10FastFingers Action Buttons */}
        <div className="mt-5 pt-4 border-t flex flex-wrap items-center gap-2" style={{ borderColor: 'var(--bg-border)' }}>
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold text-xs text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-2xs hover:shadow-xs"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Ulangi Tes (Tab + Enter)</span>
          </button>

          <button
            onClick={onChangeWords}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs border transition-all hover:bg-[var(--bg-app)] active:scale-95 cursor-pointer"
            style={{
              borderColor: 'var(--bg-border)',
              color: 'var(--text-main)',
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Ganti Kumpulan Kata</span>
          </button>

          {mistakes.length > 0 && onPracticeMistakes && (
            <button
              onClick={handleStartMistakesPractice}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs border border-amber-400/60 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 transition-all hover:bg-amber-100 dark:hover:bg-amber-950/70 active:scale-95 cursor-pointer"
              title="Latih hanya kata-kata yang salah diketik"
            >
              <Wrench className="h-3.5 w-3.5 text-amber-600" />
              <span>Latih Kata Typo ({mistakes.length})</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs border transition-all hover:bg-[var(--bg-app)] active:scale-95 cursor-pointer"
            style={{
              borderColor: 'var(--bg-border)',
              color: 'var(--text-main)',
            }}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600 font-semibold">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Salin Hasil</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs border transition-all hover:bg-[var(--bg-app)] active:scale-95 cursor-pointer ml-auto"
            style={{
              borderColor: 'var(--bg-border)',
              color: 'var(--text-main)',
            }}
          >
            <History className="h-3.5 w-3.5" />
            <span>Riwayat</span>
          </button>
        </div>
      </div>

      {/* Mistakes review if any with smooth reveal */}
      {mistakes.length > 0 && (
        <div
          className="w-full rounded-md border p-3 transition-colors text-xs"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--bg-border)',
          }}
        >
          <button
            onClick={() => setShowMistakes(!showMistakes)}
            className="w-full flex items-center justify-between text-left font-medium text-[var(--text-main)] cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span>Daftar Kesalahan Kata ({mistakes.length})</span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal">
                (Klik untuk melihat perbandingan)
              </span>
            </div>
            {showMistakes ? (
              <ChevronUp className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            )}
          </button>

          {showMistakes && (
            <div className="mt-2.5 pt-2 border-t flex flex-wrap gap-2 animate-in fade-in duration-200" style={{ borderColor: 'var(--bg-border)' }}>
              {mistakes.map((m, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded border text-[11px] font-sans hover:scale-105 transition-transform flex items-center gap-1"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderColor: 'var(--bg-border)',
                  }}
                >
                  <span className="text-green-700 dark:text-green-400 font-medium">{m.target}</span>
                  <span className="text-[var(--text-muted)] mx-0.5">→</span>
                  <span className="text-red-600 dark:text-red-400 line-through">
                    {m.typed || '(kosong)'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Integrated Performance Line Chart with Animated Wave */}
      <PerformanceChart
        data={result.historyPoints}
        averageWpm={result.wpm}
        duration={result.duration}
      />
    </div>
  );
}
