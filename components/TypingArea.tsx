'use client';

import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { UserSettings, WordData, TestState } from '@/types/typing';
import { soundManager, SoundProfile } from '@/lib/sound';
import { RotateCcw, Flame, Zap, Award, Volume2, VolumeX, Gauge, Eye } from 'lucide-react';

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
  streak: number;
  liveWpm?: number;
  onUpdateSettings?: (settings: UserSettings) => void;
  onKeyActivity?: (key: string) => void;
  paceTargetWpm?: number;
  paceLabel?: string;
  onCyclePaceTarget?: () => void;
  focusModeEnabled?: boolean;
  onToggleFocusMode?: () => void;
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
  streak,
  liveWpm = 0,
  onUpdateSettings,
  onKeyActivity,
  paceTargetWpm = 0,
  paceLabel = 'Mati',
  onCyclePaceTarget,
  focusModeEnabled = true,
  onToggleFocusMode,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [showPop, setShowPop] = useState(false);
  const [popText, setPopText] = useState('+1 Benar');
  const [isShaking, setIsShaking] = useState(false);
  const [isAudioBouncing, setIsAudioBouncing] = useState(false);

  // Pace Car (Ghost cursor) character counter
  const [paceCharsElapsed, setPaceCharsElapsed] = useState(0);
  const paceStartRef = useRef<number>(0);

  // Focus input automatically on mount and whenever user clicks area
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput, testState]);

  // Pace Car animation loop when test is running and paceTargetWpm > 0
  useEffect(() => {
    if (testState !== 'running' || paceTargetWpm <= 0) {
      paceStartRef.current = 0;
      return;
    }

    paceStartRef.current = Date.now();
    const charsPerSecond = (paceTargetWpm * 5) / 60;

    const interval = setInterval(() => {
      const elapsedSec = (Date.now() - paceStartRef.current) / 1000;
      setPaceCharsElapsed(Math.floor(elapsedSec * charsPerSecond));
    }, 120);

    return () => clearInterval(interval);
  }, [testState, paceTargetWpm]);

  // Map active pace characters to (ghostWordIndex, ghostCharIndex)
  const effectivePaceChars = testState === 'running' && paceTargetWpm > 0 ? paceCharsElapsed : 0;
  let ghostPosition: { wordIndex: number; charIndex: number } | null = null;
  if (effectivePaceChars > 0) {
    let remaining = effectivePaceChars;
    for (let i = 0; i < words.length; i++) {
      const wLen = words[i].length + 1;
      if (remaining < wLen) {
        ghostPosition = { wordIndex: i, charIndex: Math.min(remaining, words[i].length - 1) };
        break;
      }
      remaining -= wLen;
    }
  }

  // Keep input focused when clicking anywhere in window if test is idle or running
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('form') ||
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

  // Immediate 1st-Line Shifting Algorithm:
  // As soon as the user finishes the 1st line and moves to the first word of the next line,
  // immediately shift the completed line up so the active line is always at the top row!
  const updateLineScroll = useCallback(() => {
    if (!wordsWrapperRef.current) return;
    if (currentWordIndex === 0) {
      wordsWrapperRef.current.style.transform = 'translateY(0px)';
      return;
    }
    const currentWordEl = wordRefs.current[currentWordIndex];
    if (!currentWordEl) return;

    const currentTop = currentWordEl.offsetTop;
    const firstWordEl = wordRefs.current[0];
    const baseTop = firstWordEl ? firstWordEl.offsetTop : 0;

    const lineDelta = currentTop - baseTop;

    // Immediately shift up as soon as active word wraps to the second line (lineDelta > 16px)
    if (lineDelta > 16) {
      wordsWrapperRef.current.style.transform = `translateY(-${lineDelta}px)`;
    } else {
      wordsWrapperRef.current.style.transform = 'translateY(0px)';
    }
  }, [currentWordIndex]);

  useLayoutEffect(() => {
    updateLineScroll();
  }, [updateLineScroll, words, settings.fontSize]);

  useEffect(() => {
    window.addEventListener('resize', updateLineScroll);
    return () => window.removeEventListener('resize', updateLineScroll);
  }, [updateLineScroll]);

  // Check if current word has an error typed so far
  const targetWord = words[currentWordIndex] || '';
  const hasErrorInCurrentWord =
    currentInput.length > 0 &&
    (currentInput !== targetWord.slice(0, currentInput.length) ||
      currentInput.length > targetWord.length);

  // Core value processor shared by direct input change and global auto-focus keypress
  const processInputValue = useCallback(
    (value: string) => {
      // Auto-start test on first key typed
      if (testState === 'idle' && value.length > 0) {
        onStartTest();
      }

      // Spacebar pressed: Complete current word
      if (value.endsWith(' ')) {
        const typedWord = value.trim();
        if (typedWord.length === 0) {
          onInputChange('');
          return;
        }

        const isCorrect = typedWord === targetWord;
        if (isCorrect) {
          const nextStreak = streak + 1;
          if (nextStreak % 10 === 0) {
            setPopText(`${nextStreak}x Beruntun`);
            if (settings.soundEnabled) {
              soundManager.playStreak(settings.soundVolume / 100);
            }
          } else if (nextStreak >= 5) {
            setPopText(`+1 (${nextStreak}x)`);
          } else {
            setPopText('+1 Benar');
          }
          setShowPop(true);
          setTimeout(() => setShowPop(false), 450);
        } else {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 220);
        }

        onWordComplete(typedWord);
        if (settings.soundEnabled) {
          soundManager.playSpace(settings.soundVolume / 100, settings.soundProfile || 'mechanical');
        }
        return;
      }

      // Normal typing: audio click & error feedback
      if (settings.soundEnabled) {
        const charIndex = value.length - 1;
        const isCorrectChar = charIndex >= 0 && value[charIndex] === targetWord[charIndex];

        if (isCorrectChar) {
          soundManager.playKey(settings.soundVolume / 100, settings.soundProfile || 'mechanical');
        } else {
          soundManager.playError(settings.soundVolume / 100);
        }

        setIsAudioBouncing(true);
        setTimeout(() => setIsAudioBouncing(false), 120);
      }

      // Trigger subtle shake if newly typed char is a mismatch
      if (
        value.length > 0 &&
        (value !== targetWord.slice(0, value.length) || value.length > targetWord.length) &&
        !hasErrorInCurrentWord
      ) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 220);
      }

      onInputChange(value);
    },
    [
      testState,
      onStartTest,
      onInputChange,
      targetWord,
      streak,
      settings.soundEnabled,
      settings.soundVolume,
      settings.soundProfile,
      onWordComplete,
      hasErrorInCurrentWord,
    ]
  );

  // Global Auto-Focus on Any Printable Keypress:
  // If the user starts typing a letter without clicking the input box first,
  // automatically focus the typing input and register that very first character!
  useEffect(() => {
    const handleGlobalKeyCapture = (e: KeyboardEvent) => {
      if (testState === 'completed') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl === inputRef.current) return;

      // Do not hijack typing if user is typing in another input (e.g. Username field) or modal is open
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable ||
          activeEl.closest('[role="dialog"]'))
      ) {
        return;
      }

      // Capture printable single characters (letters, numbers, punctuation)
      if (e.key.length === 1 && e.key !== ' ') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
        if (onKeyActivity) {
          onKeyActivity(e.key);
          setTimeout(() => onKeyActivity(''), 80);
        }
        processInputValue(currentInput + e.key);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyCapture);
    return () => window.removeEventListener('keydown', handleGlobalKeyCapture);
  }, [testState, currentInput, processInputValue, onKeyActivity]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processInputValue(e.target.value);
  };

  // Prevent default spacebar page scrolling and pass key to visualizer
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyActivity) {
      onKeyActivity(e.key);
    }
    if (e.key === ' ' && currentInput.trim() === '') {
      e.preventDefault();
    }
  };

  const handleKeyUp = () => {
    if (onKeyActivity) {
      setTimeout(() => onKeyActivity(''), 80);
    }
  };

  // Format timer into 0:60 / 0:59 / 1:00 or seconds
  const formatTimer = (sec: number) => {
    if (sec >= 60) {
      const mins = Math.floor(sec / 60);
      const remainingSecs = sec % 60;
      return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    }
    return `0:${sec.toString().padStart(2, '0')}`;
  };

  // Font size classes with strict monospace geometry
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm':
        return 'text-lg sm:text-xl leading-10 font-mono tracking-wide';
      case 'md':
        return 'text-xl sm:text-2xl leading-11 font-mono tracking-wide';
      case 'xl':
        return 'text-2xl sm:text-[28px] leading-12 font-mono tracking-wide';
      case 'lg':
      default:
        return 'text-xl sm:text-[25px] leading-11 font-mono tracking-wide';
    }
  };

  // Quick sound profile switcher
  const soundProfiles: { id: SoundProfile; label: string }[] = [
    { id: 'mechanical', label: 'Mekanikal' },
    { id: 'thock', label: 'Thock' },
    { id: 'typewriter', label: 'Mesin Tik' },
    { id: 'bubble', label: 'Bubble Pop' },
  ];

  const paceDelta = testState === 'running' && paceTargetWpm > 0 ? liveWpm - paceTargetWpm : 0;

  return (
    <div className="w-full select-none relative">
      {/* Top Bar: Interactive Combo Meter + Pace Car Switcher + Quick Sound Switcher */}
      <div className="min-h-7 mb-1.5 flex flex-wrap items-center justify-between gap-2 px-0.5">
        {/* Left: Streak & Combo Meter / Auto-Focus Instruction */}
        <div className="flex items-center gap-2">
          {streak >= 3 ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold transition-colors duration-150 ${
                streak >= 20
                  ? 'bg-amber-600 text-white'
                  : streak >= 10
                  ? 'bg-amber-500 text-white'
                  : 'text-amber-800 bg-amber-100 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800'
              }`}
            >
              {streak >= 20 ? (
                <Award className="h-3.5 w-3.5" />
              ) : streak >= 10 ? (
                <Zap className="h-3.5 w-3.5" />
              ) : (
                <Flame className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span>
                {streak}x Beruntun {streak >= 20 ? '· Presisi Sempurna' : streak >= 10 ? '· Ritme Cepat' : ''}
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1">
              <span>Ketik huruf apa saja untuk langsung mulai · Tekan</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[10px] font-mono">
                Spasi
              </kbd>
              <span>tiap kata</span>
            </div>
          )}

          {/* Floating pop animation on word complete */}
          {showPop && (
            <div className="text-xs font-bold text-green-700 dark:text-green-400 animate-float-pop flex items-center gap-1">
              <span>{popText}</span>
            </div>
          )}
        </div>

        {/* Right: Pace Car Toggle + Focus Mode + Sound Switcher */}
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          {/* Pace Car / Kursor Bayangan Button */}
          {onCyclePaceTarget && (
            <button
              type="button"
              onClick={onCyclePaceTarget}
              title="Ubah target Pace Car (Kursor Bayangan Lawan)"
              className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                paceTargetWpm > 0
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold'
                  : 'bg-[var(--bg-surface)] border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Gauge className="h-3 w-3" />
              <span>Pace: {paceTargetWpm > 0 ? `${paceLabel} (${paceTargetWpm} WPM)` : 'Mati'}</span>
              {testState === 'running' && paceTargetWpm > 0 && (
                <span
                  className={`ml-1 font-mono tabular-nums font-bold ${
                    paceDelta >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  ({paceDelta >= 0 ? `+${paceDelta}` : paceDelta})
                </span>
              )}
            </button>
          )}

          {/* Auto Focus Mode Toggle */}
          {onToggleFocusMode && (
            <button
              type="button"
              onClick={onToggleFocusMode}
              title="Mode Fokus Otomatis (Meredupkan navigasi saat mengetik)"
              className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                focusModeEnabled
                  ? 'border-[var(--color-accent)]/50 bg-[var(--bg-surface)] text-[var(--text-main)]'
                  : 'bg-[var(--bg-surface)] border-[var(--bg-border)] text-[var(--text-muted)]'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Fokus: {focusModeEnabled ? 'Aktif' : 'Mati'}</span>
            </button>
          )}

          {/* Quick Sound Switcher */}
          {onUpdateSettings && (
            <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-2 py-0.5 text-[11px]">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    soundEnabled: !settings.soundEnabled,
                  })
                }
                title={settings.soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara Keyboard'}
                className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mr-1"
              >
                {settings.soundEnabled ? (
                  <div className="flex items-center gap-1 text-green-700 dark:text-green-400">
                    <Volume2 className="h-3.5 w-3.5" />
                    <div className="flex items-end gap-[1.5px] h-3 w-3">
                      <span className={`w-[2px] bg-green-500 rounded-full ${isAudioBouncing ? 'animate-eq-1' : 'h-1.5'}`} />
                      <span className={`w-[2px] bg-green-500 rounded-full ${isAudioBouncing ? 'animate-eq-2' : 'h-2.5'}`} />
                      <span className={`w-[2px] bg-green-500 rounded-full ${isAudioBouncing ? 'animate-eq-3' : 'h-1'}`} />
                    </div>
                  </div>
                ) : (
                  <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                )}
              </button>

              {settings.soundEnabled && (
                <div className="flex items-center gap-1 border-l pl-1.5" style={{ borderColor: 'var(--bg-border)' }}>
                  {soundProfiles.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onUpdateSettings({ ...settings, soundProfile: p.id });
                        soundManager.playKey(0.4, p.id);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        settings.soundProfile === p.id
                          ? 'bg-[var(--color-accent)] text-white font-bold'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                      title={`Ganti suara ke ${p.label}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Clean Anti-AI-Slop Words Display Box (Zero Glow, Instant 1st-Line Scroll) */}
      <div
        ref={containerRef}
        onClick={focusInput}
        className="relative w-full cursor-text overflow-hidden rounded-md border px-5 py-4 sm:px-6 sm:py-4 transition-colors duration-150"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: testState === 'running' ? 'var(--color-accent)' : 'var(--bg-border)',
          height: '118px',
        }}
      >
        <div
          ref={wordsWrapperRef}
          className={`flex flex-wrap items-center gap-x-4 gap-y-2 font-mono tracking-wide transition-transform duration-150 ease-out ${getFontSizeClass()}`}
        >
          {words.map((word, wordIndex) => {
            const isCurrent = wordIndex === currentWordIndex;
            const isCompleted = wordIndex < currentWordIndex;
            const completedWord = isCompleted ? completedWords[wordIndex] : null;
            const isGhostWord = ghostPosition?.wordIndex === wordIndex;

            if (isCurrent) {
              return (
                <span
                  key={wordIndex}
                  ref={(el) => {
                    wordRefs.current[wordIndex] = el;
                  }}
                  className="relative inline-flex items-center px-2 py-0.5 rounded border-2 transition-colors duration-100"
                  style={{
                    backgroundColor: hasErrorInCurrentWord
                      ? 'rgba(239, 68, 68, 0.14)'
                      : 'rgba(37, 99, 235, 0.10)',
                    borderColor: hasErrorInCurrentWord
                      ? 'var(--color-error)'
                      : 'var(--color-accent)',
                  }}
                >
                  {/* Characters in active word */}
                  {word.split('').map((char, charIdx) => {
                    const typedChars = currentInput.split('');
                    const isCaret = charIdx === typedChars.length;
                    const isTyped = charIdx < typedChars.length;
                    const isMatch = isTyped && typedChars[charIdx] === char;
                    const isGhostChar = isGhostWord && ghostPosition?.charIndex === charIdx;

                    let charColor = 'var(--text-main)';
                    let extraClass = 'font-bold';

                    if (isTyped) {
                      if (isMatch) {
                        charColor = 'var(--color-correct)';
                        extraClass = 'font-extrabold';
                      } else {
                        charColor = 'var(--color-error)';
                        extraClass = 'font-extrabold underline decoration-2';
                      }
                    }

                    return (
                      <span key={charIdx} className="relative inline-block">
                        {isCaret && (
                          <span
                            className="absolute -left-[1.5px] top-1 bottom-1 w-[2.5px] rounded-full animate-caret-blink"
                            style={{
                              backgroundColor: 'var(--color-caret)',
                            }}
                          />
                        )}
                        {isGhostChar && (
                          <span
                            className="absolute -left-[1.5px] top-0.5 bottom-0.5 w-[2px] bg-amber-500/80 pointer-events-none"
                            title={`Pace Car (${paceTargetWpm} WPM)`}
                          />
                        )}
                        <span
                          className={extraClass}
                          style={{
                            color: charColor,
                            backgroundColor: isTyped && !isMatch ? 'rgba(239, 68, 68, 0.18)' : undefined,
                            borderRadius: '2px',
                            padding: isTyped && !isMatch ? '0 1px' : undefined,
                          }}
                        >
                          {char}
                        </span>
                      </span>
                    );
                  })}

                  {/* Extra characters typed past target word length */}
                  {currentInput.length > word.length && (
                    <span
                      className="font-extrabold underline decoration-2 rounded-xs px-0.5"
                      style={{
                        color: 'var(--color-error)',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      {currentInput.slice(word.length)}
                    </span>
                  )}

                  {/* Caret at end of word */}
                  {currentInput.length === word.length && (
                    <span
                      className="inline-block w-[2.5px] h-6 ml-0.5 rounded-full animate-caret-blink"
                      style={{
                        backgroundColor: 'var(--color-caret)',
                      }}
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
                  className={`relative inline-block px-1.5 py-0.5 transition-colors duration-100 font-semibold ${
                    isCorrect ? '' : 'line-through opacity-85'
                  } ${isGhostWord ? 'border-b-2 border-dashed border-amber-500' : ''}`}
                  style={{
                    color: isCorrect ? 'var(--color-correct)' : 'var(--color-error)',
                  }}
                >
                  {word}
                </span>
              );
            }

            // Upcoming words
            return (
              <span
                key={wordIndex}
                ref={(el) => {
                  wordRefs.current[wordIndex] = el;
                }}
                className={`relative inline-block px-1.5 py-0.5 font-semibold tracking-wide transition-colors ${
                  isGhostWord ? 'border-b-2 border-dashed border-amber-500 bg-amber-500/10 rounded-xs' : ''
                }`}
                style={{
                  color: 'var(--text-main)',
                  opacity: 0.9,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* 10FastFingers Input + Timer + Reload Action Row */}
      <div className={`mt-3 flex items-center gap-2 ${isShaking ? 'animate-shake' : ''}`}>
        {/* Main Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          disabled={testState === 'completed'}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 h-12 px-4 rounded-md border font-mono tracking-wide text-xl sm:text-2xl font-bold outline-none transition-colors focus:border-[var(--color-accent)]"
          style={{
            backgroundColor: hasErrorInCurrentWord ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface)',
            borderColor: hasErrorInCurrentWord ? 'var(--color-error)' : 'var(--bg-border)',
            color: hasErrorInCurrentWord ? 'var(--color-error)' : 'var(--text-main)',
          }}
          placeholder={testState === 'idle' ? 'Ketik di sini atau langsung tekan huruf...' : ''}
        />

        {/* Timer Box */}
        <div
          className={`h-12 min-w-[76px] sm:min-w-[84px] px-3 flex items-center justify-center rounded-md font-mono tabular-nums text-xl sm:text-2xl font-bold tracking-tight select-none transition-colors ${
            timeLeft <= 10 && testState === 'running'
              ? 'bg-red-600 text-white'
              : 'text-white'
          }`}
          style={{
            backgroundColor:
              timeLeft <= 10 && testState === 'running' ? '#dc2626' : 'var(--color-accent)',
          }}
          title="Waktu Tersisa"
        >
          {formatTimer(timeLeft)}
        </div>

        {/* Reload Button */}
        <button
          type="button"
          onClick={onRestart}
          title="Ulangi Tes (Shortcut: Tab + Enter / Esc)"
          className="group h-12 w-12 flex items-center justify-center rounded-md text-white transition-opacity hover:opacity-90 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: 'var(--color-accent)',
          }}
        >
          <RotateCcw className="h-5 w-5 transition-transform duration-200 group-hover:-rotate-90" />
        </button>
      </div>
    </div>
  );
}
