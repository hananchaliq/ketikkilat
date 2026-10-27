'use client';

import React, { useState } from 'react';
import { LeaderboardEntry } from '@/lib/serverStore';
import { Trophy, Check, User, ShieldCheck, Gauge, RefreshCw, Edit3 } from 'lucide-react';

interface OnlineLeaderboardPanelProps {
  username: string;
  onUpdateUsername: (newName: string) => void;
  leaderboard: LeaderboardEntry[];
  selectedDuration: number;
  onSelectDuration: (duration: number) => void;
  isLoadingLeaderboard: boolean;
  onRefreshLeaderboard: () => void;
  lastSubmissionMessage?: { type: 'success' | 'info' | 'error'; text: string } | null;
  paceTargetWpm: number;
  onSetPaceTarget: (wpm: number, label: string) => void;
}

export function OnlineLeaderboardPanel({
  username,
  onUpdateUsername,
  leaderboard,
  selectedDuration,
  onSelectDuration,
  isLoadingLeaderboard,
  onRefreshLeaderboard,
  lastSubmissionMessage,
  paceTargetWpm,
  onSetPaceTarget,
}: OnlineLeaderboardPanelProps) {
  const [draftName, setDraftName] = useState(username);
  const [isEditingName, setIsEditingName] = useState(!username);
  const [savedToast, setSavedToast] = useState(false);
  const [nowMs, setNowMs] = useState<number>(0);

  React.useEffect(() => {
    const updateNow = () => setNowMs(Date.now());
    const initTimer = setTimeout(updateNow, 0);
    const interval = setInterval(updateNow, 30000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftName.trim().replace(/[^a-zA-Z0-9_\-. ]/g, '').slice(0, 22);
    if (cleaned.length < 2) return;
    onUpdateUsername(cleaned);
    setDraftName(cleaned);
    setIsEditingName(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const formatRelativeTime = (isoDate: string) => {
    if (!nowMs) return 'Tersimpan';
    try {
      const diffSec = Math.max(0, Math.floor((nowMs - new Date(isoDate).getTime()) / 1000));
      if (diffSec < 60) return 'Baru saja';
      const mins = Math.floor(diffSec / 60);
      if (mins < 60) return `${mins} mnt lalu`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} jam lalu`;
      const days = Math.floor(hours / 24);
      return `${days} hari lalu`;
    } catch {
      return 'Tersimpan';
    }
  };

  return (
    <section className="mt-6 space-y-3">
      {/* Submission Feedback Banner (if any) */}
      {lastSubmissionMessage && (
        <div
          className={`rounded-md border px-4 py-2.5 text-xs flex items-center justify-between ${
            lastSubmissionMessage.type === 'success'
              ? 'border-green-600/40 bg-green-500/10 text-green-800 dark:text-green-300'
              : lastSubmissionMessage.type === 'error'
              ? 'border-red-600/40 bg-red-500/10 text-red-800 dark:text-red-300'
              : 'border-blue-600/40 bg-blue-500/10 text-[var(--text-main)]'
          }`}
        >
          <span className="font-medium">{lastSubmissionMessage.text}</span>
        </div>
      )}

      {/* Persistent Leaderboard Card */}
      <div
        className="rounded-md border p-4 sm:p-5 transition-colors"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--bg-border)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--bg-border)' }}>
          <div className="flex items-center gap-2.5">
            <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                Papan Peringkat KetikKilat (Leaderboard)
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 flex-wrap">
                <span>Rekor tertinggi per username</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-green-600 dark:text-green-400" />
                  Minimal Akurasi 85% &amp; Anti-Cheat
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Username Form (No Login Required) */}
            {!isEditingName && username ? (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[var(--text-muted)]">Username:</span>
                <span
                  className="font-bold px-2.5 py-1 rounded border text-[var(--text-main)] font-mono"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderColor: 'var(--bg-border)',
                  }}
                >
                  {username}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(username);
                    setIsEditingName(true);
                  }}
                  className="px-2 py-1 rounded border text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                  style={{ borderColor: 'var(--bg-border)' }}
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Ubah</span>
                </button>
                {savedToast && (
                  <span className="text-green-700 dark:text-green-400 text-[11px] font-semibold flex items-center gap-0.5">
                    <Check className="h-3.5 w-3.5" /> Tersimpan
                  </span>
                )}
              </div>
            ) : (
              <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                <div className="relative flex items-center">
                  <User className="h-3.5 w-3.5 text-[var(--text-muted)] absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="Ketik username Anda..."
                    maxLength={22}
                    className="pl-7 pr-2.5 py-1 text-xs rounded border font-medium outline-none focus:ring-1 focus:ring-[var(--color-accent)] w-40 sm:w-44"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      borderColor: 'var(--bg-border)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={draftName.trim().length < 2}
                  className="px-2.5 py-1 rounded text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  Simpan
                </button>
                {username && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    Batal
                  </button>
                )}
              </form>
            )}

            {/* Duration Filter Tabs + Refresh Button */}
            <div className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-1 p-1 rounded border"
              style={{
                backgroundColor: 'var(--bg-app)',
                borderColor: 'var(--bg-border)',
              }}
            >
              {[
                { label: '60 Detik', dur: 60 },
                { label: '30 Detik', dur: 30 },
                { label: '120 Detik', dur: 120 },
              ].map((tab) => (
                <button
                  key={tab.dur}
                  type="button"
                  onClick={() => onSelectDuration(tab.dur)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedDuration === tab.dur
                      ? 'bg-[var(--color-accent)] text-white font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onRefreshLeaderboard}
              title="Muat ulang papan peringkat"
              className="h-8 w-8 flex items-center justify-center rounded border text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer shrink-0"
              style={{ borderColor: 'var(--bg-border)' }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} />
            </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="border-b text-left text-[var(--text-muted)]" style={{ borderColor: 'var(--bg-border)' }}>
                <th className="py-2.5 px-2 font-semibold w-12">#</th>
                <th className="py-2.5 px-2 font-semibold">Username</th>
                <th className="py-2.5 px-2 font-semibold text-right">Kecepatan</th>
                <th className="py-2.5 px-2 font-semibold text-right hidden sm:table-cell">Raw</th>
                <th className="py-2.5 px-2 font-semibold text-right">Akurasi</th>
                <th className="py-2.5 px-2 font-semibold text-center hidden md:table-cell">Tingkat</th>
                <th className="py-2.5 px-2 font-semibold text-right hidden sm:table-cell">Waktu</th>
                <th className="py-2.5 px-2 font-semibold text-right">Pace Lawan</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--bg-border)' }}>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-[var(--text-muted)]">
                    Belum ada rekor untuk mode {selectedDuration} detik. Jadilah yang pertama mencetak skor!
                  </td>
                </tr>
              ) : (
                leaderboard.slice(0, 15).map((entry, idx) => {
                  const rank = idx + 1;
                  const isCurrentUser =
                    username && entry.username.toLowerCase() === username.toLowerCase();
                  const isActivePace = paceTargetWpm === entry.wpm;

                  return (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-[var(--bg-app)]/60"
                      style={{
                        backgroundColor: isCurrentUser ? 'rgba(37, 99, 235, 0.07)' : undefined,
                      }}
                    >
                      <td className="py-2.5 px-2 font-mono tabular-nums font-bold">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-[11px]">
                            #1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-slate-400/20 text-slate-700 dark:text-slate-300 border border-slate-400/40 text-[11px]">
                            #2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-amber-700/20 text-amber-800 dark:text-amber-400 border border-amber-700/40 text-[11px]">
                            #3
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] pl-1">#{rank}</span>
                        )}
                      </td>

                      <td className="py-2.5 px-2 font-semibold text-[var(--text-main)]">
                        <div className="flex items-center gap-1.5">
                          <span>{entry.username}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-medium text-[var(--color-accent)]">
                              · Anda
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-2 text-right font-mono tabular-nums font-extrabold text-sm" style={{ color: 'var(--color-accent)' }}>
                        {entry.wpm} WPM
                      </td>

                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-[var(--text-muted)] hidden sm:table-cell">
                        {entry.rawWpm} WPM
                      </td>

                      <td className="py-2.5 px-2 text-right font-mono tabular-nums font-semibold text-green-700 dark:text-green-400">
                        {entry.accuracy}%
                      </td>

                      <td className="py-2.5 px-2 text-center capitalize text-[var(--text-muted)] hidden md:table-cell">
                        {entry.difficulty}
                      </td>

                      <td className="py-2.5 px-2 text-right text-[var(--text-muted)] hidden sm:table-cell whitespace-nowrap">
                        {formatRelativeTime(entry.updatedAt)}
                      </td>

                      <td className="py-2.5 px-2 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            onSetPaceTarget(
                              isActivePace ? 0 : entry.wpm,
                              `${entry.username} (${entry.wpm} WPM)`
                            )
                          }
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            isActivePace
                              ? 'bg-[var(--color-accent)] text-white border-transparent font-semibold'
                              : 'border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                          }`}
                          title="Gunakan kecepatan pemain ini sebagai kursor bayangan (Pace Car)"
                        >
                          <Gauge className="h-3 w-3" />
                          <span>{isActivePace ? 'Aktif' : 'Lawan'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
