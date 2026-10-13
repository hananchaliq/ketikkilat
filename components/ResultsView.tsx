'use client';

import React, { useState } from 'react';
import { TestResult } from '@/types/typing';
import { PerformanceChart } from './PerformanceChart';
import { RotateCcw, Share2, Check, RefreshCw, History, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultsViewProps {
  result: TestResult;
  personalBest: number;
  previousResult: TestResult | null;
  mistakes: Array<{ target: string; typed: string }>;
  onRestart: () => void;
  onChangeWords: () => void;
  onOpenHistory: () => void;
}

export function ResultsView({
  result,
  personalBest,
  previousResult,
  mistakes,
  onRestart,
  onChangeWords,
  onOpenHistory,
}: ResultsViewProps) {
  const [copied, setCopied] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);

  const isNewBest = result.wpm >= personalBest && personalBest > 0;
  const cpm = result.wpm * 5; // Characters per minute approximation

  const handleCopy = () => {
    const text = `Hasil Tes Mengetik Bahasa Indonesia (KetikKilat / 10FastFingers):
Kecepatan: ${result.wpm} WPM (${cpm} CPM)
Keystrokes: ${result.totalKeystrokes} (${result.correctChars} | ${result.incorrectChars})
Akurasi: ${result.accuracy}%
Kata Benar: ${result.correctWords}
Kata Salah: ${result.incorrectWords}
Durasi: ${result.duration}s`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* 10FastFingers Classic Result Table Card */}
      <div
        className="w-full rounded-md border p-4 sm:p-6 transition-colors shadow-2xs"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--bg-border)',
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b mb-3" style={{ borderColor: 'var(--bg-border)' }}>
          <h2 className="text-lg font-bold text-[var(--text-main)]">
            Hasil Tes Mengetik
          </h2>
          {isNewBest && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: 'var(--color-correct)' }}
            >
              Rekor Pribadi Baru!
            </span>
          )}
        </div>

        {/* The Authentic 10FastFingers #result-table */}
        <table className="w-full text-sm font-sans divide-y" style={{ borderColor: 'var(--bg-border)' }}>
          <tbody>
            {/* Primary Result Row */}
            <tr className="border-b" style={{ borderColor: 'var(--bg-border)' }}>
              <td className="py-2.5 text-[var(--text-muted)] font-medium">Hasil:</td>
              <td className="py-2.5 text-right">
                <span
                  className="font-sans text-3xl font-extrabold tracking-tight"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {result.wpm} WPM
                </span>
                <span className="text-xs text-[var(--text-muted)] ml-1 font-normal">
                  (yaitu: {cpm} CPM)
                </span>
              </td>
            </tr>

            {/* Keystrokes Row */}
            <tr className="border-b" style={{ borderColor: 'var(--bg-border)' }}>
              <td className="py-2 text-[var(--text-muted)] font-medium">Keystrokes:</td>
              <td className="py-2 text-right font-sans">
                <span className="font-semibold text-[var(--text-main)]">{result.totalKeystrokes}</span>
                <span className="text-[var(--text-muted)] ml-1">
                  ({' '}
                  <span className="font-bold text-green-700 dark:text-green-400">
                    {result.correctChars}
                  </span>{' '}
                  |{' '}
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {result.incorrectChars}
                  </span>{' '}
                  )
                </span>
              </td>
            </tr>

            {/* Accuracy Row */}
            <tr className="border-b" style={{ borderColor: 'var(--bg-border)' }}>
              <td className="py-2 text-[var(--text-muted)] font-medium">Akurasi:</td>
              <td className="py-2 text-right font-semibold text-[var(--text-main)]">
                {result.accuracy}%
              </td>
            </tr>

            {/* Correct Words Row */}
            <tr className="border-b" style={{ borderColor: 'var(--bg-border)' }}>
              <td className="py-2 text-[var(--text-muted)] font-medium">Kata Benar:</td>
              <td className="py-2 text-right font-bold text-green-700 dark:text-green-400">
                {result.correctWords}
              </td>
            </tr>

            {/* Wrong Words Row */}
            <tr>
              <td className="py-2 text-[var(--text-muted)] font-medium">Kata Salah:</td>
              <td className="py-2 text-right font-bold text-red-600 dark:text-red-400">
                {result.incorrectWords}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 10FastFingers Action Buttons */}
        <div className="mt-5 pt-4 border-t flex flex-wrap items-center gap-2" style={{ borderColor: 'var(--bg-border)' }}>
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold text-xs text-white transition-opacity hover:opacity-90 active:scale-95 cursor-pointer shadow-2xs"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Ulangi Tes (Tab + Enter)</span>
          </button>

          <button
            onClick={onChangeWords}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs border transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
            style={{
              borderColor: 'var(--bg-border)',
              color: 'var(--text-main)',
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Ganti Kumpulan Kata</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs border transition-colors hover:bg-[var(--bg-app)] cursor-pointer"
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs border transition-colors hover:bg-[var(--bg-app)] cursor-pointer ml-auto"
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

      {/* Mistakes review if any */}
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
            <span>Daftar Kesalahan Kata ({mistakes.length})</span>
            {showMistakes ? (
              <ChevronUp className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            )}
          </button>

          {showMistakes && (
            <div className="mt-2 pt-2 border-t flex flex-wrap gap-2" style={{ borderColor: 'var(--bg-border)' }}>
              {mistakes.map((m, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 rounded border text-[11px] font-sans"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderColor: 'var(--bg-border)',
                  }}
                >
                  <span className="text-green-700 dark:text-green-400 font-medium">{m.target}</span>
                  <span className="text-[var(--text-muted)] mx-1">→</span>
                  <span className="text-red-600 dark:text-red-400 line-through">
                    {m.typed || '(kosong)'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Integrated Performance Line Chart */}
      <PerformanceChart
        data={result.historyPoints}
        averageWpm={result.wpm}
        duration={result.duration}
      />
    </div>
  );
}
