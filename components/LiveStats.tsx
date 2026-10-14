'use client';

import React from 'react';
import { TestState, TypingMode } from '@/types/typing';
import { Gauge, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';

interface LiveStatsProps {
  state: TestState;
  mode: TypingMode;
  timeLeft: number;
  initialTime: number;
  wordsCompleted: number;
  targetWords: number;
  liveWpm: number;
  liveAccuracy: number;
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  onRestart: () => void;
  showLiveWpm?: boolean;
  showLiveAccuracy?: boolean;
}

export function LiveStats({
  state,
  mode,
  wordsCompleted,
  targetWords,
  liveWpm,
  liveAccuracy,
  correctKeystrokes,
  incorrectKeystrokes,
}: LiveStatsProps) {
  // Speed tier badge label
  const getSpeedPaceLabel = (wpm: number) => {
    if (wpm >= 90) return { label: 'Kilat Dewa', color: 'text-amber-500 font-black' };
    if (wpm >= 70) return { label: 'Sangat Cepat', color: 'text-cyan-500 font-bold' };
    if (wpm >= 50) return { label: 'Cepat & Gesit', color: 'text-emerald-500 font-bold' };
    if (wpm >= 30) return { label: 'Stabil', color: 'text-blue-500 font-medium' };
    return { label: 'Pemanasan', color: 'text-[var(--text-muted)] font-normal' };
  };

  const pace = getSpeedPaceLabel(liveWpm);
  const speedPercentage = Math.min(100, Math.round((liveWpm / 100) * 100));

  return (
    <div className="w-full flex flex-col gap-1.5 mb-2 select-none">
      <div className="flex items-center justify-between text-xs font-sans text-[var(--text-muted)] px-1">
        <div className="flex items-center gap-2 sm:gap-3">
          {mode === 'words' ? (
            <span>
              Target: <strong className="text-[var(--text-main)]">{wordsCompleted} / {targetWords} kata</strong>
            </span>
          ) : (
            <span>
              Kata ke-<strong className="text-[var(--text-main)]">{wordsCompleted + 1}</strong>
            </span>
          )}

          {state === 'running' && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                <strong className="text-[var(--color-accent)] font-mono text-sm tabular-nums">{liveWpm} WPM</strong>
              </span>
              <span>·</span>
              <span>
                Akurasi:{' '}
                <strong className={`tabular-nums ${liveAccuracy >= 95 ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {liveAccuracy}%
                </strong>
              </span>
              <span className="hidden sm:inline">·</span>
              <span className={`hidden sm:inline-flex items-center gap-1 text-[11px] ${pace.color}`}>
                <Zap className="h-3 w-3" />
                <span>{pace.label}</span>
              </span>
            </>
          )}
        </div>

        {(correctKeystrokes > 0 || incorrectKeystrokes > 0) && (
          <div className="font-mono text-[11px] tabular-nums flex items-center gap-1.5 bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--bg-border)] shadow-2xs">
            <span className="text-green-700 dark:text-green-400 font-semibold flex items-center gap-0.5">
              <CheckCircle2 className="h-3 w-3 inline text-green-600" />
              {correctKeystrokes}
            </span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-red-600 dark:text-red-400 font-semibold">{incorrectKeystrokes}</span>
            <span className="text-[var(--text-muted)] text-[10px]">tuts</span>
          </div>
        )}
      </div>

      {/* Live Speed Dynamic Meter Line (Active during test) */}
      {state === 'running' && (
        <div className="w-full h-1 bg-[var(--bg-border)]/60 rounded-full overflow-hidden relative">
          <div
            className="h-full transition-all duration-300 ease-out rounded-full"
            style={{
              width: `${Math.max(4, speedPercentage)}%`,
              backgroundColor: liveWpm >= 85 ? '#d97706' : liveWpm >= 65 ? '#0284c7' : 'var(--color-accent)',
            }}
          />
        </div>
      )}
    </div>
  );
}
