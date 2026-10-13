'use client';

import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { UserSettings, WordData, TestState } from '@/types/typing';
import { soundManager } from '@/lib/sound';
import { RotateCcw } from 'lucide-react';

interface TypingAreaProps {
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  onInputChange: (val: string) => void;
  onWordComplete: (typedWord: string) => void;
  onStartTest: () => void;
  testState: TestState;
  completedWords: WordData[];
  settings: UserSettings;
  timeLeft: number;
  onRestart: () => void;
}

export function TypingArea({
  words,
  currentWordIndex,
  currentInput,
  onInputChange,
  onWordComplete,
  onStartTest,
  testState,
  completedWords,
  settings,
  timeLeft,
  onRestart,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [scrollOffsetY, setScrollOffsetY] = useState(0);

  // Focus input automatically on mount and whenever user clicks area
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput, testState]);

  // Keep input focused when clicking anywhere in window if test is idle or running
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('dialog') ||
        target.closest('[role="dialog"]')
      ) {
        return;
      }
      if (testState !== 'completed') {
        focusInput();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [focusInput, testState]);

  // 10FastFingers 2-line smooth shifting algorithm
  useLayoutEffect(() => {
    if (!wordsWrapperRef.current || !wordRefs.current[currentWordIndex]) return;

    const currentWordEl = wordRefs.current[currentWordIndex];
    if (!currentWordEl) return;

    const currentTop = currentWordEl.offsetTop;

    // Detect first word top offset (Line 1 base)
    const firstWordEl = wordRefs.current[0];
    const baseTop = firstWordEl ? firstWordEl.offsetTop : 0;

    // Line height approximate delta (~46px - 52px)
    const lineDelta = currentTop - baseTop;

    // When current word moves past Line 2 (lineDelta > 65px), shift up
    if (lineDelta > 65) {
      const shiftAmount = lineDelta - 48;
      setScrollOffsetY(shiftAmount);
    } else {
      setScrollOffsetY(0);
    }
  }, [currentWordIndex]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Auto-start test on first key typed
    if (testState === 'idle' && value.length > 0) {
      onStartTest();
    }

    // Spacebar pressed: Complete current word
    if (value.endsWith(' ')) {
      const typedWord = value.trim();
      onWordComplete(typedWord);
      if (settings.soundEnabled) {
        soundManager.playSpace(settings.soundVolume / 100);
      }
      return;
    }

    // Normal typing: check for audio click
    if (settings.soundEnabled) {
      const targetWord = words[currentWordIndex] || '';
      const charIndex = value.length - 1;
      const isCorrectChar = charIndex >= 0 && value[charIndex] === targetWord[charIndex];

      if (isCorrectChar) {
        soundManager.playKey(settings.soundVolume / 100);
      } else {
        soundManager.playError(settings.soundVolume / 100);
      }
    }

    onInputChange(value);
  };

  // Prevent default spacebar page scrolling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' && currentInput.trim() === '') {
      e.preventDefault();
    }
  };

  // Check if current word has an error typed so far
  const targetWord = words[currentWordIndex] || '';
  const hasErrorInCurrentWord =
    currentInput.length > 0 &&
    (currentInput !== targetWord.slice(0, currentInput.length) ||
      currentInput.length > targetWord.length);

  // Format timer into 0:60 / 0:59 / 1:00 or seconds
  const formatTimer = (sec: number) => {
    if (sec >= 60) {
      const mins = Math.floor(sec / 60);
      const remainingSecs = sec % 60;
      return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    }
    return `0:${sec.toString().padStart(2, '0')}`;
  };

  // Font size classes
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm':
        return 'text-xl leading-10';
      case 'md':
        return 'text-2xl leading-11';
      case 'xl':
        return 'text-[28px] leading-12';
      case 'lg':
      default:
        return 'text-2xl sm:text-[26px] leading-11';
    }
  };

  return (
    <div className="w-full select-none">
      {/* 10FastFingers Words Display Box (#words) - Taller panel for generous vertical breathing space */}
      <div
        ref={containerRef}
        onClick={focusInput}
        className="relative w-full cursor-text overflow-hidden rounded-md border px-5 py-4 sm:px-6 sm:py-4 transition-colors shadow-2xs"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--bg-border)',
          height: '118px', // Taller height (increased from 84px) for comfortable reading and line clearance
        }}
      >
        <div
          ref={wordsWrapperRef}
          className={`flex flex-wrap items-center gap-x-3.5 gap-y-2 font-sans transition-transform duration-150 ease-out ${getFontSizeClass()}`}
          style={{
            transform: `translateY(-${scrollOffsetY}px)`,
          }}
        >
          {words.map((word, wordIndex) => {
            const isCurrent = wordIndex === currentWordIndex;
            const isCompleted = wordIndex < currentWordIndex;
            const completedWord = isCompleted ? completedWords[wordIndex] : null;

            if (isCurrent) {
              // Active Word:
              // Highlighted with clear contrast and high-visibility character state!
              return (
                <span
                  key={wordIndex}
                  ref={(el) => {
                    wordRefs.current[wordIndex] = el;
                  }}
                  className={`relative inline-flex items-center px-2 py-0.5 rounded transition-colors ${
                    hasErrorInCurrentWord
                      ? 'bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800'
                      : 'bg-blue-100/90 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800'
                  }`}
                >
                  {/* Characters in active word */}
                  {word.split('').map((char, charIdx) => {
                    const typedChars = currentInput.split('');
                    const isCaret = charIdx === typedChars.length;
                    const isTyped = charIdx < typedChars.length;
                    const isMatch = isTyped && typedChars[charIdx] === char;

                    // High contrast colors for typed vs untyped characters
                    let charClassName = '';
                    if (isTyped) {
                      if (isMatch) {
                        // Correctly typed character: vivid bold green
                        charClassName = 'text-green-700 dark:text-green-400 font-bold';
                      } else {
                        // Incorrectly typed character: vivid bold red with underline
                        charClassName = 'text-red-600 dark:text-red-400 font-bold underline decoration-2';
                      }
                    } else {
                      // Untyped character: high-contrast dark text in light mode, bright text in dark mode
                      charClassName = 'text-slate-800 dark:text-slate-100 font-medium';
                    }

                    return (
                      <span key={charIdx} className="relative inline-block">
                        {isCaret && (
                          <span
                            className="absolute -left-[1.5px] top-1 bottom-1 w-[2px] animate-caret-blink"
                            style={{ backgroundColor: 'var(--color-caret)' }}
                          />
                        )}
                        <span className={charClassName}>{char}</span>
                      </span>
                    );
                  })}

                  {/* Extra characters typed past target word length */}
                  {currentInput.length > word.length && (
                    <span className="text-red-600 dark:text-red-400 font-bold underline decoration-2">
                      {currentInput.slice(word.length)}
                    </span>
                  )}

                  {/* Caret at end of word */}
                  {currentInput.length === word.length && (
                    <span
                      className="inline-block w-[2px] h-6 ml-0.5 animate-caret-blink"
                      style={{ backgroundColor: 'var(--color-caret)' }}
                    />
                  )}
                </span>
              );
            }

            if (isCompleted && completedWord) {
              const isCorrect = completedWord.isCorrect;
              return (
                <span
                  key={wordIndex}
                  ref={(el) => {
                    wordRefs.current[wordIndex] = el;
                  }}
                  className={`inline-block px-1 py-0.5 ${
                    isCorrect
                      ? 'font-medium text-green-700 dark:text-green-400'
                      : 'font-medium text-red-600 dark:text-red-400 line-through'
                  }`}
                >
                  {word}
                </span>
              );
            }

            // Upcoming words: high-contrast slate text so they are easily legible
            return (
              <span
                key={wordIndex}
                ref={(el) => {
                  wordRefs.current[wordIndex] = el;
                }}
                className="inline-block px-1 py-0.5 text-slate-700 dark:text-slate-300 font-normal"
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* 10FastFingers Input + Timer + Reload Action Row */}
      <div className="mt-3 flex items-center gap-2">
        {/* Main Input Field with high-contrast text and instant typo color */}
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={testState === 'completed'}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={`flex-1 h-12 px-4 rounded-md border font-sans text-xl sm:text-2xl outline-none transition-all shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)] ${
            hasErrorInCurrentWord
              ? 'text-red-600 dark:text-red-400 font-semibold bg-red-50/50 dark:bg-red-950/20'
              : 'text-slate-900 dark:text-slate-100 font-medium'
          }`}
          style={{
            backgroundColor: hasErrorInCurrentWord ? undefined : 'var(--bg-surface)',
            borderColor: hasErrorInCurrentWord ? 'var(--color-error)' : 'var(--bg-border)',
          }}
          placeholder=""
        />

        {/* Timer Box (10FastFingers countdown box) */}
        <div
          className="h-12 min-w-[76px] sm:min-w-[84px] px-3 flex items-center justify-center rounded-md font-mono text-xl sm:text-2xl font-bold tracking-tight shadow-2xs select-none"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#ffffff',
          }}
          title="Waktu Tersisa"
        >
          {formatTimer(timeLeft)}
        </div>

        {/* Reload Button */}
        <button
          onClick={onRestart}
          title="Ulangi Tes (Shortcut: Tab + Enter)"
          className="h-12 w-12 flex items-center justify-center rounded-md text-white transition-opacity hover:opacity-90 active:scale-95 shadow-2xs cursor-pointer"
          style={{
            backgroundColor: 'var(--color-accent)',
          }}
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
