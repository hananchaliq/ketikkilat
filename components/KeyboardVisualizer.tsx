'use client';

import React, { useState, useEffect } from 'react';
import { Keyboard, Eye, EyeOff, Sparkles } from 'lucide-react';

interface KeyboardVisualizerProps {
  activeKey: string | null;
  nextChar: string | null;
  isOpenDefault?: boolean;
}

interface KeyDef {
  key: string;
  display: string;
  code?: string;
  width?: string;
  finger?: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
}

const ROWS: KeyDef[][] = [
  [
    { key: '`', display: '~', finger: 'pinky' },
    { key: '1', display: '1', finger: 'pinky' },
    { key: '2', display: '2', finger: 'ring' },
    { key: '3', display: '3', finger: 'middle' },
    { key: '4', display: '4', finger: 'index' },
    { key: '5', display: '5', finger: 'index' },
    { key: '6', display: '6', finger: 'index' },
    { key: '7', display: '7', finger: 'index' },
    { key: '8', display: '8', finger: 'middle' },
    { key: '9', display: '9', finger: 'ring' },
    { key: '0', display: '0', finger: 'pinky' },
    { key: '-', display: '-', finger: 'pinky' },
    { key: '=', display: '=', finger: 'pinky' },
    { key: 'Backspace', display: '⌫', width: 'w-14 sm:w-16', finger: 'pinky' },
  ],
  [
    { key: 'Tab', display: 'Tab', width: 'w-12 sm:w-14', finger: 'pinky' },
    { key: 'q', display: 'Q', finger: 'pinky' },
    { key: 'w', display: 'W', finger: 'ring' },
    { key: 'e', display: 'E', finger: 'middle' },
    { key: 'r', display: 'R', finger: 'index' },
    { key: 't', display: 'T', finger: 'index' },
    { key: 'y', display: 'Y', finger: 'index' },
    { key: 'u', display: 'U', finger: 'index' },
    { key: 'i', display: 'I', finger: 'middle' },
    { key: 'o', display: 'O', finger: 'ring' },
    { key: 'p', display: 'P', finger: 'pinky' },
    { key: '[', display: '[', finger: 'pinky' },
    { key: ']', display: ']', finger: 'pinky' },
    { key: '\\', display: '\\', finger: 'pinky' },
  ],
  [
    { key: 'CapsLock', display: 'Caps', width: 'w-14 sm:w-16', finger: 'pinky' },
    { key: 'a', display: 'A', finger: 'pinky' },
    { key: 's', display: 'S', finger: 'ring' },
    { key: 'd', display: 'D', finger: 'middle' },
    { key: 'f', display: 'F', finger: 'index' },
    { key: 'g', display: 'G', finger: 'index' },
    { key: 'h', display: 'H', finger: 'index' },
    { key: 'j', display: 'J', finger: 'index' },
    { key: 'k', display: 'K', finger: 'middle' },
    { key: 'l', display: 'L', finger: 'ring' },
    { key: ';', display: ';', finger: 'pinky' },
    { key: "'", display: "'", finger: 'pinky' },
    { key: 'Enter', display: '↵ Enter', width: 'w-16 sm:w-20', finger: 'pinky' },
  ],
  [
    { key: 'Shift', display: 'Shift', width: 'w-18 sm:w-22', finger: 'pinky' },
    { key: 'z', display: 'Z', finger: 'pinky' },
    { key: 'x', display: 'X', finger: 'ring' },
    { key: 'c', display: 'C', finger: 'middle' },
    { key: 'v', display: 'V', finger: 'index' },
    { key: 'b', display: 'B', finger: 'index' },
    { key: 'n', display: 'N', finger: 'index' },
    { key: 'm', display: 'M', finger: 'index' },
    { key: ',', display: ',', finger: 'middle' },
    { key: '.', display: '.', finger: 'ring' },
    { key: '/', display: '/', finger: 'pinky' },
    { key: 'ShiftRight', display: 'Shift', width: 'w-16 sm:w-20', finger: 'pinky' },
  ],
  [
    { key: 'Control', display: 'Ctrl', width: 'w-12', finger: 'pinky' },
    { key: 'Alt', display: 'Alt', width: 'w-12', finger: 'thumb' },
    { key: ' ', display: 'Spasi', width: 'flex-1 max-w-sm sm:max-w-md', finger: 'thumb' },
    { key: 'AltGraph', display: 'Alt', width: 'w-12', finger: 'thumb' },
    { key: 'ControlRight', display: 'Ctrl', width: 'w-12', finger: 'pinky' },
  ],
];

export function KeyboardVisualizer({
  activeKey,
  nextChar,
  isOpenDefault = false,
}: KeyboardVisualizerProps) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [showFingers, setShowFingers] = useState(true);

  // Normalize next char for comparison
  const normalizedNext = nextChar ? nextChar.toLowerCase() : null;

  // Finger zone color hints
  const getFingerIndicator = (finger?: string) => {
    if (!showFingers || !finger) return null;
    switch (finger) {
      case 'pinky':
        return 'border-b-2 border-b-purple-400 dark:border-b-purple-500';
      case 'ring':
        return 'border-b-2 border-b-blue-400 dark:border-b-blue-500';
      case 'middle':
        return 'border-b-2 border-b-emerald-400 dark:border-b-emerald-500';
      case 'index':
        return 'border-b-2 border-b-amber-400 dark:border-b-amber-500';
      case 'thumb':
        return 'border-b-2 border-b-rose-400 dark:border-b-rose-500';
      default:
        return '';
    }
  };

  return (
    <div className="hidden md:block w-full mt-3 select-none">
      {/* Visualizer Header Toggle Bar */}
      <div className="flex items-center justify-between text-xs px-1 mb-2">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--bg-border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer shadow-2xs font-medium"
        >
          <Keyboard className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          <span>{isOpen ? 'Sembunyikan Keyboard Visual' : 'Tampilkan Keyboard Visual Interaktif'}</span>
          {isOpen ? <EyeOff className="h-3 w-3 ml-0.5 opacity-70" /> : <Eye className="h-3 w-3 ml-0.5 opacity-70" />}
        </button>

        {isOpen && (
          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showFingers}
                onChange={(e) => setShowFingers(e.target.checked)}
                className="rounded accent-[var(--color-accent)] cursor-pointer"
              />
              <span>Panduan Zona Jari</span>
            </label>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
              <span>Target Berikutnya: <strong className="font-mono text-[var(--text-main)] font-semibold">{nextChar === ' ' ? 'Spasi' : nextChar || '-'}</strong></span>
            </span>
          </div>
        )}
      </div>

      {/* Keyboard Matrix Container */}
      {isOpen && (
        <div
          className="w-full rounded-lg border p-2.5 sm:p-3 transition-all duration-300 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--bg-border)',
          }}
        >
          <div className="flex flex-col gap-1 sm:gap-1.5 max-w-3xl mx-auto">
            {ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5 w-full">
                {row.map((item, keyIdx) => {
                  const keyLower = item.key.toLowerCase();
                  const isCurrentActive =
                    activeKey &&
                    (activeKey.toLowerCase() === keyLower ||
                      (item.key === ' ' && activeKey === ' ') ||
                      (item.key === 'Backspace' && activeKey === 'Backspace') ||
                      (item.key === 'Enter' && activeKey === 'Enter') ||
                      (item.key.includes('Shift') && activeKey === 'Shift'));

                  const isNextTarget =
                    normalizedNext &&
                    (normalizedNext === keyLower || (normalizedNext === ' ' && item.key === ' '));

                  const isHomeKey = ['f', 'j'].includes(keyLower);

                  return (
                    <div
                      key={keyIdx}
                      className={`relative flex flex-col items-center justify-center rounded transition-all duration-75 select-none ${
                        item.width ? item.width : 'w-7 sm:w-10'
                      } h-8 sm:h-10 text-[11px] sm:text-xs font-mono font-medium shadow-2xs border ${
                        isCurrentActive
                          ? 'bg-[var(--color-accent)] text-white font-bold scale-95 shadow-md -translate-y-0.5 border-transparent animate-key-pop'
                          : isNextTarget
                          ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 dark:border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/80 ring-offset-1 font-bold'
                          : 'bg-[var(--bg-app)] border-[var(--bg-border)] text-[var(--text-main)] hover:border-[var(--color-accent)]/50'
                      } ${getFingerIndicator(item.finger)}`}
                    >
                      <span>{item.display}</span>

                      {/* Home row key notch indicator for F and J */}
                      {isHomeKey && !isCurrentActive && (
                        <div className="absolute bottom-1 w-2.5 sm:w-3.5 h-[2px] rounded-full bg-[var(--text-muted)] opacity-60" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Finger guide legend footer */}
          {showFingers && (
            <div className="mt-2.5 pt-2 border-t flex flex-wrap items-center justify-center gap-3 text-[10px] text-[var(--text-muted)]" style={{ borderColor: 'var(--bg-border)' }}>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-1 rounded bg-purple-400" />
                <span>Kelingking</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-1 rounded bg-blue-400" />
                <span>Jari Manis</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-1 rounded bg-emerald-400" />
                <span>Jari Tengah</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-1 rounded bg-amber-400" />
                <span>Jari Telunjuk</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-1 rounded bg-rose-400" />
                <span>Ibu Jari (Spasi)</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
