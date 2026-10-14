'use client';

import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { UserSettings, WordData, TestState } from '@/types/typing';
import { soundManager, SoundProfile } from '@/lib/sound';
import { RotateCcw, Flame, Zap, Award, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface SparkParticle {
  id: number;
  x: number;
  y: number;
  color: string;
}

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
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [showPop, setShowPop] = useState(false);
  const [popText, setPopText] = useState('+1 Benar!');
  const [isShaking, setIsShaking] = useState(false);
  const [sparks, setSparks] = useState<SparkParticle[]>([]);
  const [isAudioBouncing, setIsAudioBouncing] = useState(false);

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
        target.closest('select') ||
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

  // 10FastFingers 2-line smooth shifting algorithm with responsive measurements
  useLayoutEffect(() => {
    if (!wordsWrapperRef.current) return;
    if (currentWordIndex === 0) {
      wordsWrapperRef.current.style.transform = 'translateY(0px)';
      return;
    }
    if (!wordRefs.current[currentWordIndex]) return;

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
      wordsWrapperRef.current.style.transform = `translateY(-${shiftAmount}px)`;
    } else {
      wordsWrapperRef.current.style.transform = 'translateY(0px)';
    }
  }, [currentWordIndex]);

  // Spawn visual spark particles on word completion
  const spawnSparks = useCallback((xOffset = 0, yOffset = 0) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#00f0ff'];
    const newSparks: SparkParticle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: xOffset + (Math.random() - 0.5) * 60,
      y: yOffset + (Math.random() - 0.5) * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setSparks((prev) => [...prev, ...newSparks]);
    setTimeout(() => {
      setSparks((prev) => prev.filter((p) => !newSparks.some((n) => n.id === p.id)));
    }, 600);
  }, []);

  // Check if current word has an error typed so far
  const targetWord = words[currentWordIndex] || '';
  const hasErrorInCurrentWord =
    currentInput.length > 0 &&
    (currentInput !== targetWord.slice(0, currentInput.length) ||
      currentInput.length > targetWord.length);

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
      if (typedWord.length === 0) {
        onInputChange('');
        return;
      }

      // Check if correct to award pop effect or error shake
      const isCorrect = typedWord === targetWord;
      if (isCorrect) {
        const nextStreak = streak + 1;
        if (nextStreak % 10 === 0) {
          setPopText(`🔥 ${nextStreak} COMBO!`);
          if (settings.soundEnabled) {
            soundManager.playStreak(settings.soundVolume / 100);
          }
        } else if (nextStreak >= 5) {
          setPopText(`⚡ +1 (${nextStreak}x)`);
        } else {
          setPopText('+1 Benar!');
        }
        setShowPop(true);
        spawnSparks(0, 0);
        setTimeout(() => setShowPop(false), 500);
      } else {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 250);
      }

      onWordComplete(typedWord);
      if (settings.soundEnabled) {
        soundManager.playSpace(settings.soundVolume / 100, settings.soundProfile || 'mechanical');
      }
      return;
    }

    // Normal typing: check for audio click & error shake
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
      setTimeout(() => setIsShaking(false), 250);
    }

    onInputChange(value);
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

  // Dynamic reactive speed border - refined, functional, zero-slop
  const getSpeedAuraClass = () => {
    if (testState !== 'running') return '';
    if (liveWpm >= 85) return 'animate-speed-blaze border-amber-500';
    if (liveWpm >= 65) return 'animate-lightning-surge border-sky-500';
    if (liveWpm >= 45) return 'border-blue-500/70 shadow-2xs';
    return '';
  };

  // Quick sound profile switcher
  const soundProfiles: { id: SoundProfile; label: string }[] = [
    { id: 'mechanical', label: 'Mekanikal' },
    { id: 'thock', label: 'Thock' },
    { id: 'typewriter', label: 'Mesin Tik' },
    { id: 'bubble', label: 'Bubble Pop' },
  ];

  return (
    <div className="w-full select-none relative">
      {/* Top Bar: Interactive Combo Badge + Quick Sound Switcher */}
      <div className="h-7 mb-1.5 flex items-center justify-between px-1">
        {/* Left: Streak & Combo Meter */}
        <div className="flex items-center gap-2">
          {streak >= 3 ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold transition-all duration-200 ${
                streak >= 20
                  ? 'bg-amber-600 text-white shadow-xs'
                  : streak >= 10
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-800 bg-amber-100 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800'
              }`}
            >
              {streak >= 20 ? (
                <Award className="h-3.5 w-3.5 animate-spin-once" />
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
              <span>Ketik kata lalu tekan</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[10px] font-mono shadow-2xs">
                Spasi
              </kbd>
            </div>
          )}

          {/* Floating pop animation on word complete */}
          {showPop && (
            <div className="text-xs font-black text-green-700 dark:text-green-400 animate-float-pop flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{popText}</span>
            </div>
          )}
        </div>

        {/* Right: Quick Sound Switcher Pill */}
        <div className="flex items-center gap-1 text-xs">
          {onUpdateSettings && (
            <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-full px-2 py-0.5 shadow-2xs text-[11px]">
              <button
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
                    {/* Animated Equalizer mini bars */}
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
                      onClick={() => {
                        onUpdateSettings({ ...settings, soundProfile: p.id });
                        soundManager.playKey(0.4, p.id);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                        settings.soundProfile === p.id
                          ? 'bg-[var(--color-accent)] text-white font-bold shadow-2xs'
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

      {/* 10FastFingers Words Display Box (#words) with Speed Aura */}
      <div
        ref={containerRef}
        onClick={focusInput}
        className={`relative w-full cursor-text overflow-hidden rounded-md border px-5 py-4 sm:px-6 sm:py-4 transition-all duration-300 shadow-2xs ${getSpeedAuraClass()}`}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--bg-border)',
          height: '118px', // Taller height for generous vertical breathing space
        }}
      >
        <div
          ref={wordsWrapperRef}
          className={`flex flex-wrap items-center gap-x-4 gap-y-2 font-mono tracking-wide transition-transform duration-200 ease-out ${getFontSizeClass()}`}
        >
          {words.map((word, wordIndex) => {
            const isCurrent = wordIndex === currentWordIndex;
            const isCompleted = wordIndex < currentWordIndex;
            const completedWord = isCompleted ? completedWords[wordIndex] : null;

            if (isCurrent) {
              return (
                <span
                  key={wordIndex}
                  ref={(el) => {
                    wordRefs.current[wordIndex] = el;
                  }}
                  className="relative inline-flex items-center px-2.5 py-1 rounded border-2 shadow-xs transition-all duration-150"
                  style={{
                    backgroundColor: hasErrorInCurrentWord
                      ? 'rgba(239, 68, 68, 0.16)'
                      : 'rgba(37, 99, 235, 0.12)',
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
                            className="absolute -left-[1.5px] top-1 bottom-1 w-[2.5px] rounded-full animate-caret-blink shadow-xs transition-all duration-75"
                            style={{
                              backgroundColor: 'var(--color-caret)',
                              boxShadow: '0 0 6px var(--color-caret)',
                            }}
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
                        boxShadow: '0 0 6px var(--color-caret)',
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
                  className={`inline-block px-1.5 py-0.5 transition-all duration-150 font-semibold ${
                    isCorrect ? '' : 'line-through opacity-85'
                  }`}
                  style={{
                    color: isCorrect ? 'var(--color-correct)' : 'var(--color-error)',
                  }}
                >
                  {word}
                </span>
              );
            }

            // Upcoming words - Always match active theme text color with high contrast
            return (
              <span
                key={wordIndex}
                ref={(el) => {
                  wordRefs.current[wordIndex] = el;
                }}
                className="inline-block px-1.5 py-0.5 font-semibold tracking-wide transition-colors"
                style={{
                  color: 'var(--text-main)',
                  opacity: 0.88,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Flying spark particles on word completion */}
        {sparks.map((spark) => (
          <div
            key={spark.id}
            className="absolute pointer-events-none w-2 h-2 rounded-full animate-spark"
            style={{
              left: `calc(50% + ${spark.x}px)`,
              top: `calc(50% + ${spark.y}px)`,
              backgroundColor: spark.color,
              boxShadow: `0 0 8px ${spark.color}`,
            }}
          />
        ))}
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
          className="flex-1 h-12 px-4 rounded-md border font-mono tracking-wide text-xl sm:text-2xl font-bold outline-none transition-all shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{
            backgroundColor: hasErrorInCurrentWord ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface)',
            borderColor: hasErrorInCurrentWord ? 'var(--color-error)' : 'var(--bg-border)',
            color: hasErrorInCurrentWord ? 'var(--color-error)' : 'var(--text-main)',
          }}
          placeholder=""
        />

        {/* Timer Box with dynamic low-time pulse (< 10s) */}
        <div
          className={`h-12 min-w-[76px] sm:min-w-[84px] px-3 flex items-center justify-center rounded-md font-mono text-xl sm:text-2xl font-bold tracking-tight shadow-2xs select-none transition-all ${
            timeLeft <= 10 && testState === 'running'
              ? 'animate-pulse bg-red-600 text-white'
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

        {/* Reload Button with smooth hover and click spin */}
        <button
          onClick={onRestart}
          title="Ulangi Tes (Shortcut: Tab + Enter)"
          className="group h-12 w-12 flex items-center justify-center rounded-md text-white transition-all hover:opacity-90 active:scale-95 shadow-2xs cursor-pointer"
          style={{
            backgroundColor: 'var(--color-accent)',
          }}
        >
          <RotateCcw className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-90 group-active:-rotate-180" />
        </button>
      </div>
    </div>
  );
}
