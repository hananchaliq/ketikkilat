'use client';

import React from 'react';
import { TestState, TypingMode } from '@/types/typing';

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
  timeLeft,
  wordsCompleted,
  targetWords,
  liveWpm,
  liveAccuracy,
  correctKeystrokes,
  incorrectKeystrokes,
  showLiveWpm = false,
  showLiveAccuracy = false,
}: LiveStatsProps) {
  // If neither live metric is enabled and test is in time mode, render nothing to keep the pure 10FastFingers look
  if (!showLiveWpm && !showLiveAccuracy && mode === 'time') {
    return null;
  }

  return (
    <div className="flex items-center justify-between text-xs font-sans text-[var(--text-muted)] px-1 mb-2">
      {mode === 'words' && (
        <div>
          Target: <strong className="text-[var(--text-main)]">{wordsCompleted} / {targetWords} kata</strong>
        </div>
      )}

      {(showLiveWpm || showLiveAccuracy) && state === 'running' && (
        <div className="flex items-center gap-3 ml-auto font-mono text-[11px]">
          {showLiveWpm && (
            <span>
              WPM: <strong className="text-[var(--color-accent)]">{liveWpm}</strong>
            </span>
          )}
          {showLiveAccuracy && (
            <span>
              Akurasi: <strong className="text-green-600">{liveAccuracy}%</strong>
            </span>
          )}
          <span>
            Karakter: <span className="text-green-600">{correctKeystrokes}</span> /{' '}
            <span className="text-red-600">{incorrectKeystrokes}</span>
          </span>
        </div>
      )}
    </div>
  );
}
