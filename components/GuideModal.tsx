'use client';

import React from 'react';
import { BookOpen, X, Keyboard, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null;

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
            <BookOpen className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="text-lg font-bold">Panduan Mengetik 10 Jari Indonesia</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            style={{ borderColor: 'var(--bg-border)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 text-sm">
          {/* Home Row Position */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--bg-border)' }}>
            <div className="flex items-center gap-2 font-semibold text-[var(--text-main)] mb-2">
              <Keyboard className="h-4 w-4 text-[var(--color-accent)]" />
              <span>Posisi Baris Pangkal (Home Row Keys)</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
              Kunci utama mengetik 10 jari adalah membiasakan jari beristirahat pada tuts pangkal:
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--bg-border)' }}>
                <div className="font-bold text-[var(--color-accent)] mb-1">Tangan Kiri:</div>
                <div className="text-[var(--text-muted)]">Kelingking: <strong className="text-[var(--text-main)]">A</strong></div>
                <div className="text-[var(--text-muted)]">Manis: <strong className="text-[var(--text-main)]">S</strong></div>
                <div className="text-[var(--text-muted)]">Tengah: <strong className="text-[var(--text-main)]">D</strong></div>
                <div className="text-[var(--text-muted)]">Telunjuk: <strong className="text-[var(--text-main)]">F</strong> (ada benjolan penanda)</div>
              </div>

              <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--bg-border)' }}>
                <div className="font-bold text-[var(--color-accent)] mb-1">Tangan Kanan:</div>
                <div className="text-[var(--text-muted)]">Telunjuk: <strong className="text-[var(--text-main)]">J</strong> (ada benjolan penanda)</div>
                <div className="text-[var(--text-muted)]">Tengah: <strong className="text-[var(--text-main)]">K</strong></div>
                <div className="text-[var(--text-muted)]">Manis: <strong className="text-[var(--text-main)]">L</strong></div>
                <div className="text-[var(--text-muted)]">Kelingking: <strong className="text-[var(--text-main)]">;</strong></div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-[var(--text-muted)]">
              Ibu jari kiri dan kanan bertugas menekan tombol <strong>Spasi</strong> secara bergantian.
            </div>
          </div>

          {/* Formula calculation */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--bg-border)' }}>
            <div className="flex items-center gap-2 font-semibold text-[var(--text-main)] mb-2">
              <Zap className="h-4 w-4 text-[var(--color-correct)]" />
              <span>Standar Perhitungan WPM & Akurasi</span>
            </div>
            <div className="space-y-2 text-xs leading-relaxed text-[var(--text-muted)]">
              <p>
                KetikKilat menggunakan standar internasional yang sama persis dengan 10FastFingers:
              </p>
              <div className="p-2.5 rounded-lg border font-mono text-[11px] text-[var(--text-main)]" style={{ borderColor: 'var(--bg-border)', backgroundColor: 'var(--bg-surface)' }}>
                <div>WPM = (Karakter Benar / 5) / (Waktu Berlalu dalam Menit)</div>
                <div>Akurasi = (Karakter Benar / Total Karakter Diketik) × 100%</div>
              </div>
              <p>
                Angka 5 adalah standar kata typografi internasional (1 kata = 5 ketukan karakter termasuk spasi).
              </p>
            </div>
          </div>

          {/* Tips for Fast Typing */}
          <div className="space-y-2">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[var(--text-muted)]">
              3 Kiat Cepat Meningkatkan Skor
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                <span className="text-[var(--text-muted)]">
                  <strong className="text-[var(--text-main)]">Utamakan Akurasi di atas Kecepatan:</strong>{' '}
                  Mengetik lambat tanpa salah jauh lebih efisien daripada mengetik cepat namun sering menekan backspace.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                <span className="text-[var(--text-muted)]">
                  <strong className="text-[var(--text-main)]">Lihat Kata Berikutnya:</strong>{' '}
                  Latih mata untuk membaca 1–2 kata di depan kata yang sedang diketik agar ritme jari tidak terputus.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                <span className="text-[var(--text-muted)]">
                  <strong className="text-[var(--text-main)]">Pertahankan Postur Rileks:</strong>{' '}
                  Punggung tegak, siku membentuk 90 derajat, dan pergelangan tangan tidak menekan meja secara kaku.
                </span>
              </div>
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
              color: 'var(--bg-app)',
            }}
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
}
