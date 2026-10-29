'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
  memo,
} from 'react';
import { UserSettings, WordData, TestState } from '@/types/typing';
import { soundManager, SoundProfile } from '@/lib/sound';
import {
  RotateCcw,
  Flame,
  Zap,
  Award,
  Volume2,
  VolumeX,
  Gauge,
  Eye,
  EyeOff,
  Keyboard,
} from 'lucide-react';

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

interface WordItemProps {
  word: string;
  wordIndex: number;
  isCurrent: boolean;
  isCompleted: boolean;
  isCorrect?: boolean;
  typedText?: string;
  currentInput: string;
  highlightMistakes: boolean;
  isGhostWord: boolean;
  ghostCharIndex: number | null;
  paceTargetWpm: number;
  setWordRef: (index: number, el: HTMLSpanElement | null) => void;
}

const WordItem = memo(function WordItem({
  word,
  wordIndex,
  isCurrent,
  isCompleted,
  isCorrect,
  typedText,
  currentInput,
  highlightMistakes,
  isGhostWord,
  ghostCharIndex,
  paceTargetWpm,
  setWordRef,
}: WordItemProps) {
  const handleRef = useCallback(
    (el: HTMLSpanElement | null) => {
      setWordRef(wordIndex, el);
    },
    [wordIndex, setWordRef]
  );

  if (isCurrent) {
    const chars = word.split('');
    const typedChars = currentInput.split('');
    const overflowChars =
      currentInput.length > word.length ? currentInput.slice(word.length).split('') : [];
    const hasError =
      highlightMistakes &&
      currentInput.length > 0 &&
      (currentInput !== word.slice(0, currentInput.length) ||
        currentInput.length > word.length);

    return (
      <span
        ref={handleRef}
        data-word-active="true"
        className="relative inline-flex items-baseline px-1.5 py-0.5 rounded transition-colors duration-75"
        style={{
          backgroundColor: hasError
            ? 'rgba(239, 68, 68, 0.12)'
            : 'rgba(37, 99, 235, 0.08)',
        }}
      >
        {chars.map((char, charIdx) => {
          const isTyped = charIdx < typedChars.length;
          const isMatch = isTyped && typedChars[charIdx] === char;
          const isGhostChar = isGhostWord && ghostCharIndex === charIdx;

          let charColor = 'var(--text-main)';
          let charOpacity = 0.62;
          let extraClass = 'font-medium';

          if (isTyped) {
            charOpacity = 1;
            if (isMatch || !highlightMistakes) {
              charColor = 'var(--color-correct)';
              extraClass = 'font-bold';
            } else {
              charColor = 'var(--color-error)';
              extraClass = 'font-bold underline decoration-2 underline-offset-4';
            }
          }

          return (
            <span
              key={charIdx}
              data-char-idx={charIdx}
              className={`relative inline-block ${extraClass}`}
              style={{
                color: charColor,
                opacity: charOpacity,
                backgroundColor:
                  isTyped && !isMatch && highlightMistakes
                    ? 'rgba(239, 68, 68, 0.16)'
                    : undefined,
                borderRadius: '2px',
              }}
            >
              {isGhostChar && (
                <span
                  className="absolute -left-[1px] top-1 bottom-1 w-[2px] bg-amber-500/85 pointer-events-none rounded-full"
                  title={`Pace Car (${paceTargetWpm} WPM)`}
                />
              )}
              {char}
            </span>
          );
        })}

        {/* Overflow characters typed beyond target word length */}
        {overflowChars.map((extraChar, extraIdx) => (
          <span
            key={`extra-${extraIdx}`}
            data-char-idx={word.length + extraIdx}
            className="relative inline-block font-bold underline decoration-2 underline-offset-4 rounded-xs"
            style={{
              color: 'var(--color-error)',
              backgroundColor: 'rgba(239, 68, 68, 0.20)',
            }}
          >
            {extraChar}
          </span>
        ))}
      </span>
    );
  }

  if (isCompleted) {
    return (
      <span
        ref={handleRef}
        className={`relative inline-block px-1.5 py-0.5 font-medium transition-colors duration-75 ${
          isCorrect ? '' : 'underline decoration-2 underline-offset-4'
        } ${isGhostWord ? 'border-b-2 border-dashed border-amber-500' : ''}`}
        style={{
          color: isCorrect ? 'var(--color-correct)' : 'var(--color-error)',
          opacity: isCorrect ? 0.92 : 0.95,
        }}
        title={!isCorrect && typedText ? `Diketik: "${typedText}"` : undefined}
      >
        {word}
      </span>
    );
  }

  // Upcoming words
  return (
    <span
      ref={handleRef}
      className={`relative inline-block px-1.5 py-0.5 font-normal transition-colors ${
        isGhostWord
          ? 'border-b-2 border-dashed border-amber-500 bg-amber-500/10 rounded-xs'
          : ''
      }`}
      style={{
        color: 'var(--text-main)',
        opacity: 0.56,
      }}
    >
      {word}
    </span>
  );
});

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
  const rafScrollRef = useRef<number | null>(null);

  const [isFocused, setIsFocused] = useState(true);
  const [showPop, setShowPop] = useState(false);
  const [popText, setPopText] = useState('+1 Benar');
  const [isShaking, setIsShaking] = useState(false);
  const [isAudioBouncing, setIsAudioBouncing] = useState(false);

  // Smooth caret coordinates relative to wordsWrapperRef
  const [caretPos, setCaretPos] = useState<{
    left: number;
    top: number;
    height: number;
  }>({ left: 6, top: 6, height: 26 });

  // Pace Car (Ghost cursor) character counter
  const [paceCharsElapsed, setPaceCharsElapsed] = useState(0);
  const paceStartRef = useRef<number>(0);

  const setWordRef = useCallback((index: number, el: HTMLSpanElement | null) => {
    wordRefs.current[index] = el;
  }, []);

  // Focus hidden input automatically on mount and whenever user taps/clicks typing area
  const focusInput = useCallback(() => {
    if (inputRef.current && testState !== 'completed') {
      inputRef.current.focus({ preventScroll: true });
      setIsFocused(true);
    }
  }, [testState]);

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
    }, 140);

    return () => clearInterval(interval);
  }, [testState, paceTargetWpm]);

  // Map active pace characters to (ghostWordIndex, ghostCharIndex)
  const effectivePaceChars =
    testState === 'running' && paceTargetWpm > 0 ? paceCharsElapsed : 0;
  let ghostPosition: { wordIndex: number; charIndex: number } | null = null;
  if (effectivePaceChars > 0) {
    let remaining = effectivePaceChars;
    for (let i = 0; i < words.length; i++) {
      const wLen = words[i].length + 1;
      if (remaining < wLen) {
        ghostPosition = {
          wordIndex: i,
          charIndex: Math.min(remaining, words[i].length - 1),
        };
        break;
      }
      remaining -= wLen;
    }
  }

  // Keep input focused when clicking non-interactive space if test is idle or running
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('a') ||
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

  // Calculate Smooth Caret Position & Instant 1st-Line Scroll via requestAnimationFrame
  const syncCaretAndLineScroll = useCallback(() => {
    const wrapperEl = wordsWrapperRef.current;
    const activeWordEl = wordRefs.current[currentWordIndex];
    if (!wrapperEl || !activeWordEl) return;

    // 1. Line scroll calculation: shift completed top line immediately upon moving to row 2
    if (currentWordIndex === 0) {
      wrapperEl.style.transform = 'translate3d(0px, 0px, 0px)';
    } else {
      const firstWordEl = wordRefs.current[0];
      const baseTop = firstWordEl ? firstWordEl.offsetTop : 0;
      const currentTop = activeWordEl.offsetTop;
      const lineDelta = currentTop - baseTop;

      if (lineDelta > 14) {
        wrapperEl.style.transform = `translate3d(0px, -${lineDelta}px, 0px)`;
      } else {
        wrapperEl.style.transform = 'translate3d(0px, 0px, 0px)';
      }
    }

    // 2. Smooth caret coordinates calculation inside active word
    const typedLen = currentInput.length;
    const targetCharEl = activeWordEl.querySelector<HTMLElement>(
      `[data-char-idx="${typedLen}"]`
    );

    let nextLeft = activeWordEl.offsetLeft + 6;
    const nextTop = activeWordEl.offsetTop + 5;
    const nextHeight = Math.max(20, activeWordEl.offsetHeight - 10);

    if (targetCharEl) {
      nextLeft = activeWordEl.offsetLeft + targetCharEl.offsetLeft;
    } else if (typedLen > 0) {
      const prevCharEl = activeWordEl.querySelector<HTMLElement>(
        `[data-char-idx="${typedLen - 1}"]`
      );
      if (prevCharEl) {
        nextLeft =
          activeWordEl.offsetLeft +
          prevCharEl.offsetLeft +
          prevCharEl.offsetWidth;
      }
    }

    setCaretPos((prev) => {
      if (
        Math.abs(prev.left - nextLeft) < 0.5 &&
        Math.abs(prev.top - nextTop) < 0.5 &&
        Math.abs(prev.height - nextHeight) < 0.5
      ) {
        return prev;
      }
      return { left: nextLeft, top: nextTop, height: nextHeight };
    });
  }, [currentWordIndex, currentInput.length]);

  useLayoutEffect(() => {
    if (rafScrollRef.current) {
      cancelAnimationFrame(rafScrollRef.current);
    }
    rafScrollRef.current = requestAnimationFrame(() => {
      syncCaretAndLineScroll();
    });
    return () => {
      if (rafScrollRef.current) {
        cancelAnimationFrame(rafScrollRef.current);
      }
    };
  }, [syncCaretAndLineScroll, words, settings.fontSize]);

  useEffect(() => {
    const handleResize = () => {
      if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
      rafScrollRef.current = requestAnimationFrame(syncCaretAndLineScroll);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [syncCaretAndLineScroll]);

  // Check if current word has an error typed so far
  const targetWord = words[currentWordIndex] || '';
  const hasErrorInCurrentWord =
    currentInput.length > 0 &&
    (currentInput !== targetWord.slice(0, currentInput.length) ||
      currentInput.length > targetWord.length);

  // Core value processor shared by direct inline input and global auto-focus keypress
  const processInputValue = useCallback(
    (value: string) => {
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
          setTimeout(() => setShowPop(false), 420);
        } else {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 200);
        }

        onWordComplete(typedWord);
        if (settings.soundEnabled) {
          soundManager.playSpace(
            settings.soundVolume / 100,
            settings.soundProfile || 'mechanical'
          );
        }
        return;
      }

      // Normal character typing: audio click & error feedback
      if (settings.soundEnabled) {
        const charIndex = value.length - 1;
        const isCorrectChar =
          charIndex >= 0 && value[charIndex] === targetWord[charIndex];

        if (isCorrectChar) {
          soundManager.playKey(
            settings.soundVolume / 100,
            settings.soundProfile || 'mechanical'
          );
        } else {
          soundManager.playError(settings.soundVolume / 100);
        }

        setIsAudioBouncing(true);
        setTimeout(() => setIsAudioBouncing(false), 120);
      }

      // Subtle shake if newly typed char is a mismatch
      if (
        value.length > 0 &&
        (value !== targetWord.slice(0, value.length) ||
          value.length > targetWord.length) &&
        !hasErrorInCurrentWord
      ) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 200);
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
  // Typing any letter immediately focuses the inline engine and registers that character
  useEffect(() => {
    const handleGlobalKeyCapture = (e: KeyboardEvent) => {
      if (testState === 'completed') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl === inputRef.current) return;

      // Do not hijack typing if user is typing inside another input (e.g. Username field) or modal
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

      if (e.key === 'Backspace') {
        e.preventDefault();
        focusInput();
        if (currentInput.length > 0) {
          processInputValue(currentInput.slice(0, -1));
        }
        return;
      }

      if (e.key.length === 1 && e.key !== ' ') {
        e.preventDefault();
        focusInput();
        if (onKeyActivity) {
          onKeyActivity(e.key);
          setTimeout(() => onKeyActivity(''), 80);
        }
        processInputValue(currentInput + e.key);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyCapture);
    return () => window.removeEventListener('keydown', handleGlobalKeyCapture);
  }, [testState, currentInput, processInputValue, onKeyActivity, focusInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processInputValue(e.target.value);
  };

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

  // Format timer into 0:60 / 0:59 / 1:00
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Responsive typography classes using IBM Plex Mono (--font-mono)
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm':
        return 'text-base sm:text-lg md:text-xl leading-9 sm:leading-10 font-mono tracking-normal';
      case 'md':
        return 'text-lg sm:text-xl md:text-[22px] leading-9 sm:leading-10 md:leading-11 font-mono tracking-normal';
      case 'xl':
        return 'text-xl sm:text-2xl md:text-[27px] leading-10 sm:leading-11 md:leading-12 font-mono tracking-normal';
      case 'lg':
      default:
        return 'text-lg sm:text-xl md:text-2xl leading-9 sm:leading-10 md:leading-11 font-mono tracking-normal';
    }
  };

  const soundProfiles: { id: SoundProfile; label: string }[] = [
    { id: 'mechanical', label: 'Mekanikal' },
    { id: 'thock', label: 'Thock' },
    { id: 'typewriter', label: 'Mesin Tik' },
    { id: 'bubble', label: 'Bubble' },
  ];

  const paceDelta =
    testState === 'running' && paceTargetWpm > 0 ? liveWpm - paceTargetWpm : 0;

  // Render window cap to keep DOM ultra-lightweight while preserving line-offset integrity
  const maxVisibleWordIndex = Math.min(words.length, currentWordIndex + 85);
  const visibleWords = words.slice(0, maxVisibleWordIndex);

  return (
    <div className="w-full select-none relative">
      {/* Unified Top Control Bar: Timer + Reset + Streak + Pace Car + Sound Switcher */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-0.5">
        {/* Left: Prominent Monkeytype-Style Top Timer + Reset + Streak */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timer + Hide Toggle + Reset Group */}
          <div
            className="inline-flex items-center rounded-md border p-0.5 gap-1"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--bg-border)',
            }}
          >
            {settings.liveTimer !== false && (
              <div
                className={`h-8 sm:h-9 px-2.5 sm:px-3 flex items-center justify-center rounded font-display tabular-nums text-base sm:text-lg font-bold tracking-tight transition-colors ${
                  timeLeft <= 10 && testState === 'running'
                    ? 'bg-red-600 text-white'
                    : 'text-[var(--color-accent)]'
                }`}
                style={{
                  backgroundColor:
                    timeLeft <= 10 && testState === 'running'
                      ? '#dc2626'
                      : 'var(--bg-app)',
                }}
                title="Sisa Waktu Tes"
              >
                {formatTimer(timeLeft)}
              </div>
            )}

            {onUpdateSettings && (
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    liveTimer: settings.liveTimer === false ? true : false,
                  })
                }
                title={
                  settings.liveTimer === false
                    ? 'Tampilkan Timer'
                    : 'Sembunyikan Timer'
                }
                className="h-8 w-8 sm:h-9 sm:w-8 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] transition-colors cursor-pointer"
              >
                {settings.liveTimer === false ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onRestart();
                setTimeout(focusInput, 10);
              }}
              title="Ulangi Tes (Shortcut: Tab + Enter / Esc)"
              className="group h-8 px-2.5 sm:h-9 sm:px-3 flex items-center gap-1.5 rounded text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: 'var(--color-accent)',
              }}
            >
              <RotateCcw className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-rotate-90" />
              <span className="hidden xs:inline sm:inline">Ulangi</span>
            </button>
          </div>

          {/* Streak & Combo Meter / Direct Typing Hint */}
          {streak >= 3 ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors duration-150 ${
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
              <span className="font-display tabular-nums">{streak}x</span>
              <span className="hidden sm:inline">
                Beruntun {streak >= 20 ? '· Presisi' : ''}
              </span>
            </div>
          ) : (
            <div className="hidden sm:flex text-[11px] text-[var(--text-muted)] font-medium items-center gap-1">
              <span>Ketik langsung di teks ·</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[10px] font-mono">
                Spasi
              </kbd>
              <span>tiap kata</span>
            </div>
          )}

          {/* Floating pop animation on word complete */}
          {showPop && (
            <div className="text-xs font-bold text-green-700 dark:text-green-400 animate-float-pop flex items-center gap-1 font-display">
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
              className={`h-8 flex items-center gap-1 px-2.5 rounded border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                paceTargetWpm > 0
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold'
                  : 'bg-[var(--bg-surface)] border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Gauge className="h-3.5 w-3.5" />
              <span>
                Pace:{' '}
                {paceTargetWpm > 0 ? (
                  <strong className="font-display tabular-nums">
                    {paceTargetWpm} WPM
                  </strong>
                ) : (
                  'Mati'
                )}
              </span>
              {testState === 'running' && paceTargetWpm > 0 && (
                <span
                  className={`ml-0.5 font-display tabular-nums font-bold ${
                    paceDelta >= 0
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
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
              className={`hidden md:flex h-8 items-center gap-1 px-2.5 rounded border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                focusModeEnabled
                  ? 'border-[var(--color-accent)]/50 bg-[var(--bg-surface)] text-[var(--text-main)]'
                  : 'bg-[var(--bg-surface)] border-[var(--bg-border)] text-[var(--text-muted)]'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Fokus: {focusModeEnabled ? 'Aktif' : 'Mati'}</span>
            </button>
          )}

          {/* Quick Sound Switcher */}
          {onUpdateSettings && (
            <div className="h-8 flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-2 text-[11px]">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    soundEnabled: !settings.soundEnabled,
                  })
                }
                title={
                  settings.soundEnabled
                    ? 'Matikan Suara'
                    : 'Aktifkan Suara Keyboard'
                }
                className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              >
                {settings.soundEnabled ? (
                  <div className="flex items-center gap-1 text-green-700 dark:text-green-400">
                    <Volume2 className="h-3.5 w-3.5" />
                    <div className="hidden sm:flex items-end gap-[1.5px] h-3 w-3">
                      <span
                        className={`w-[2px] bg-green-500 rounded-full ${
                          isAudioBouncing ? 'animate-eq-1' : 'h-1.5'
                        }`}
                      />
                      <span
                        className={`w-[2px] bg-green-500 rounded-full ${
                          isAudioBouncing ? 'animate-eq-2' : 'h-2.5'
                        }`}
                      />
                      <span
                        className={`w-[2px] bg-green-500 rounded-full ${
                          isAudioBouncing ? 'animate-eq-3' : 'h-1'
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                )}
              </button>

              {settings.soundEnabled && (
                <div
                  className="hidden sm:flex items-center gap-0.5 border-l pl-1.5 ml-0.5"
                  style={{ borderColor: 'var(--bg-border)' }}
                >
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

      {/* Direct Inline Monkeytype-Style Words Container (No Separate Bottom Input Box) */}
      <div
        ref={containerRef}
        onClick={focusInput}
        className={`relative w-full cursor-text overflow-hidden rounded-lg border px-4 py-3.5 sm:px-6 sm:py-4 transition-colors duration-150 ${
          isShaking ? 'animate-shake' : ''
        }`}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor:
            testState === 'running'
              ? 'var(--color-accent)'
              : hasErrorInCurrentWord
              ? 'var(--color-error)'
              : 'var(--bg-border)',
          height: '124px',
        }}
      >
        {/* Hidden Native Input overlaid for seamless Mobile/Tablet Virtual Keyboard & Desktop Inline Typing */}
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={testState === 'completed'}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="next"
          aria-label="Ketik kata Bahasa Indonesia secara langsung"
          className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 text-base"
        />

        {/* Subtle Unfocused Prompt Pill (Top-Right Corner) */}
        {!isFocused && testState !== 'completed' && (
          <div
            onClick={focusInput}
            className="absolute top-2 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-2xs pointer-events-auto cursor-pointer transition-opacity"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--color-accent)',
              color: 'var(--text-main)',
            }}
          >
            <Keyboard className="h-3 w-3 text-[var(--color-accent)]" />
            <span>Ketuk untuk fokus mengetik</span>
          </div>
        )}

        {/* Words Stream + Smooth Gliding Caret */}
        <div
          ref={wordsWrapperRef}
          className={`relative flex flex-wrap items-baseline gap-x-2.5 sm:gap-x-3.5 gap-y-1.5 sm:gap-y-2 transition-transform duration-150 ease-out will-change-transform ${getFontSizeClass()}`}
        >
          {/* Smooth Vertical Caret */}
          {testState !== 'completed' && (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute top-0 left-0 w-[2.5px] rounded-full z-10 transition-transform duration-75 ease-out ${
                testState === 'idle' ? 'animate-caret-blink' : ''
              }`}
              style={{
                height: `${caretPos.height}px`,
                transform: `translate3d(${caretPos.left}px, ${caretPos.top}px, 0)`,
                backgroundColor: hasErrorInCurrentWord
                  ? 'var(--color-error)'
                  : 'var(--color-caret)',
              }}
            />
          )}

          {visibleWords.map((word, wordIndex) => {
            const isCurrent = wordIndex === currentWordIndex;
            const isCompleted = wordIndex < currentWordIndex;
            const completedWord = isCompleted
              ? completedWords[wordIndex]
              : undefined;
            const isGhostWord = ghostPosition?.wordIndex === wordIndex;

            return (
              <WordItem
                key={wordIndex}
                word={word}
                wordIndex={wordIndex}
                isCurrent={isCurrent}
                isCompleted={isCompleted}
                isCorrect={completedWord?.isCorrect}
                typedText={completedWord?.typed}
                currentInput={isCurrent ? currentInput : ''}
                highlightMistakes={settings.highlightMistakes !== false}
                isGhostWord={isGhostWord}
                ghostCharIndex={isGhostWord ? ghostPosition?.charIndex ?? null : null}
                paceTargetWpm={paceTargetWpm}
                setWordRef={setWordRef}
              />
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet Helper Strip Below Words Container */}
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-[var(--text-muted)] px-1">
        <span className="sm:hidden">
          Ketuk kotak teks untuk membuka keyboard &amp; langsung mengetik
        </span>
        <span className="hidden sm:inline">
          Pintasan cepat: <kbd className="font-mono">Tab + Enter</kbd> atau{' '}
          <kbd className="font-mono">Esc</kbd> untuk mengulang tes
        </span>
        {paceTargetWpm > 0 && (
          <span className="text-[11px] text-[var(--text-muted)]">
            Target Pace: <strong className="text-[var(--text-main)]">{paceLabel}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
