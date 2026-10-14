'use client';

import React from 'react';
import { TestResult } from '@/types/typing';
import {
  History,
  X,
  Trophy,
  Zap,
  Target,
  Clock,
  Trash2,
  Calendar,
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TestResult[];
  onDeleteResult: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryModal({
  isOpen,
  onClose,
  history,
  onDeleteResult,
  onClearAll,
}: HistoryModalProps) {
  if (!isOpen) return null;

  const totalTests = history.length;
  const bestWpm = totalTests > 0 ? Math.max(...history.map((h) => h.wpm)) : 0;
  const avgWpm =
    totalTests > 0
      ? Math.round(history.reduce((acc, curr) => acc + curr.wpm, 0) / totalTests)
      : 0;
  const avgAccuracy =
    totalTests > 0
      ? Math.round(history.reduce((acc, curr) => acc + curr.accuracy, 0) / totalTests)
      : 0;

  // Last 10 results for miniature trend bar
  const recent10 = [...history].reverse().slice(-10);
  const maxRecentWpm = Math.max(1, ...recent10.map((r) => r.wpm));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl transition-all"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--bg-border)',
          color: 'var(--text-main)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--bg-border)' }}>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="text-lg font-bold">Riwayat & Statistik Mengetik</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            style={{ borderColor: 'var(--bg-border)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Global Summary Stats */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border text-left" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--bg-border)' }}>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium mb-1">
              <Trophy className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              <span>Rekor Terbaik</span>
            </div>
            <div className="font-mono text-2xl font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>
              {bestWpm} <span className="text-xs text-[var(--text-muted)]">WPM</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border text-left" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--bg-border)' }}>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium mb-1">
              <Zap className="h-3.5 w-3.5 text-[var(--color-correct)]" />
              <span>Rata-rata WPM</span>
            </div>
            <div className="font-mono text-2xl font-bold tabular-nums text-[var(--text-main)]">
              {avgWpm} <span className="text-xs text-[var(--text-muted)]">WPM</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border text-left" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--bg-border)' }}>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium mb-1">
              <Target className="h-3.5 w-3.5 text-[var(--color-correct)]" />
              <span>Rata-rata Akurasi</span>
            </div>
            <div className="font-mono text-2xl font-bold tabular-nums text-[var(--color-correct)]">
              {avgAccuracy}%
            </div>
          </div>

          <div className="p-3.5 rounded-xl border text-left" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--bg-border)' }}>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium mb-1">
              <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span>Total Sesi Tes</span>
            </div>
            <div className="font-mono text-2xl font-bold tabular-nums text-[var(--text-main)]">
              {totalTests}
            </div>
          </div>
        </div>

        {/* Progress Mini Sparkline Chart */}
        {recent10.length >= 2 && (
          <div className="mt-5 p-4 rounded-xl border text-left" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--bg-border)' }}>
            <div className="flex items-center justify-between text-xs font-semibold mb-3">
              <span className="text-[var(--text-main)]">Tren 10 Tes Terakhir</span>
              <span className="text-[var(--text-muted)] font-mono">WPM per sesi</span>
            </div>
            <div className="flex items-end gap-2 h-20 pt-2 border-b" style={{ borderColor: 'var(--bg-border)' }}>
              {recent10.map((r, i) => {
                const heightPercent = Math.max(15, (r.wpm / maxRecentWpm) * 100);
                return (
                  <div key={r.id || i} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                      {r.wpm}
                    </span>
                    <div
                      className="w-full rounded-t-sm transition-all group-hover:opacity-100 opacity-80"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: 'var(--color-accent)',
                      }}
                      title={`${r.wpm} WPM (${r.accuracy}%) - ${r.date}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Session Log Table */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Daftar Riwayat Sesi
            </span>
            {totalTests > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-xs text-[var(--color-error)] hover:underline"
              >
                <Trash2 className="h-3 w-3" />
                <span>Bersihkan Riwayat</span>
              </button>
            )}
          </div>

          {totalTests === 0 ? (
            <div className="p-8 text-center rounded-xl border" style={{ borderColor: 'var(--bg-border)', backgroundColor: 'var(--bg-app)' }}>
              <History className="h-8 w-8 mx-auto text-[var(--text-muted)] opacity-40 mb-2" />
              <div className="text-sm font-semibold text-[var(--text-main)]">Belum ada riwayat tes</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                Selesaikan satu sesi pengetikan untuk melihat riwayat performa Anda di sini.
              </div>
            </div>
          ) : (
            <div className="divide-y rounded-xl border overflow-hidden" style={{ borderColor: 'var(--bg-border)', backgroundColor: 'var(--bg-app)' }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 hover:bg-[var(--bg-surface)] transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[var(--text-main)]">
                          {item.wpm} WPM
                        </span>
                        <span className="font-mono text-[var(--color-correct)] font-semibold">
                          {item.accuracy}%
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--bg-border)]">
                          {item.mode === 'time' ? `${item.duration}s` : `${item.wordOption || 50} kata`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{item.date}</span>
                        <span>·</span>
                        <span>{item.correctChars} benar / {item.incorrectChars} salah</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteResult(item.id)}
                    title="Hapus sesi ini"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--bg-border)]/50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
