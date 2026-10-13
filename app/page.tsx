'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { LiveStats } from '@/components/LiveStats';
import { TypingArea } from '@/components/TypingArea';
import { ResultsView } from '@/components/ResultsView';
import { SettingsModal } from '@/components/SettingsModal';
import { ThemeModal } from '@/components/ThemeModal';
import { HistoryModal } from '@/components/HistoryModal';
import { GuideModal } from '@/components/GuideModal';
import { KeyboardVisualizer } from '@/components/KeyboardVisualizer';
import { generateWordList } from '@/lib/words';
import { soundManager } from '@/lib/sound';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  loadHistory,
  saveResultToHistory,
  clearHistory,
  deleteHistoryItem,
  getActiveTheme,
} from '@/lib/storage';
import { applyThemeToDom } from '@/lib/themes';
import {
  UserSettings,
  TestState,
  WordData,
  PerformanceDataPoint,
  TestResult,
} from '@/types/typing';
import { RotateCcw, Trophy, Info, Keyboard } from 'lucide-react';

export default function TypingApp() {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [history, setHistory] = useState<TestResult[]>(() => loadHistory());
  const [personalBest, setPersonalBest] = useState<number>(() => {
    const hist = loadHistory();
    return hist.length > 0 ? Math.max(...hist.map((h) => h.wpm)) : 0;
  });
  const [previousResult, setPreviousResult] = useState<TestResult | null>(() => {
    const hist = loadHistory();
    return hist.length > 0 ? hist[0] : null;
  });

  const [activeNavTab, setActiveNavTab] = useState<'test' | 'practice' | 'history' | 'guide'>('test');

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Core Typing Engine States
  const [words, setWords] = useState<string[]>(() => generateWordList('normal', 300));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [completedWords, setCompletedWords] = useState<WordData[]>([]);
  const [testState, setTestState] = useState<TestState>('idle');
  const [streak, setStreak] = useState(0);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Telemetry & Timing States
  const [timeLeft, setTimeLeft] = useState<number>(() => loadSettings().timeDuration);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [incorrectKeystrokes, setIncorrectKeystrokes] = useState(0);
  const [correctWordCount, setCorrectWordCount] = useState(0);
  const [incorrectWordCount, setIncorrectWordCount] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{ target: string; typed: string }>>([]);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceDataPoint[]>([]);

  // Results & History
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Interval, timestamp, and authoritative keystroke refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const testStateRef = useRef<TestState>('idle');
  const lastSampledSecRef = useRef<number>(0);
  const prevSecondKeysRef = useRef<number>(0);
  const secondDeltasRef = useRef<number[]>([]);

  // Authoritative metric refs (never stale, updated synchronously)
  const correctKeystrokesRef = useRef<number>(0);
  const incorrectKeystrokesRef = useRef<number>(0);
  const correctWordCountRef = useRef<number>(0);
  const incorrectWordCountRef = useRef<number>(0);
  const mistakesRef = useRef<Array<{ target: string; typed: string }>>([]);
  const wordsRef = useRef<string[]>(words);
  const currentWordIndexRef = useRef<number>(0);
  const currentInputRef = useRef<string>('');
  const performanceHistoryRef = useRef<PerformanceDataPoint[]>([]);

  // Keep wordsRef synced
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  // Synchronize active theme CSS variables to DOM
  useEffect(() => {
    applyThemeToDom(getActiveTheme(settings));
  }, [settings]);

  // Finish Test - Reads directly from authoritative refs so results are NEVER zero
  const finishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (testStateRef.current === 'completed') return;
    testStateRef.current = 'completed';
    setTestState('completed');

    // Count any correct and incorrect characters typed in the active input
    let pendingCorrect = 0;
    let pendingIncorrect = 0;
    const currentVal = currentInputRef.current.trim();
    const target = wordsRef.current[currentWordIndexRef.current] || '';
    if (currentVal.length > 0) {
      for (let i = 0; i < currentVal.length; i++) {
        if (i < target.length && currentVal[i] === target[i]) {
          pendingCorrect++;
        } else {
          pendingIncorrect++;
        }
      }
    }

    const finalCorrect = correctKeystrokesRef.current + pendingCorrect;
    const finalIncorrect = incorrectKeystrokesRef.current + pendingIncorrect;
    const totalChars = finalCorrect + finalIncorrect;

    const actualElapsedMs = startTimeRef.current > 0 ? Date.now() - startTimeRef.current : 60000;
    const durationSec = Math.max(1, Math.round(actualElapsedMs / 1000));
    const durationMin = durationSec / 60;

    // Standard 10FastFingers WPM: (correct keystrokes / 5) / minutes
    const finalWpm = Math.round(finalCorrect / 5 / durationMin) || 0;
    const rawWpm = Math.round(totalChars / 5 / durationMin) || 0;
    const finalAccuracy = totalChars > 0 ? Math.round((finalCorrect / totalChars) * 100) : 100;

    const result: TestResult = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      wpm: finalWpm,
      rawWpm,
      accuracy: finalAccuracy,
      correctChars: finalCorrect,
      incorrectChars: finalIncorrect,
      correctWords: correctWordCountRef.current,
      incorrectWords: incorrectWordCountRef.current,
      totalKeystrokes: totalChars,
      duration: durationSec,
      mode: settings.mode,
      timeOption: settings.timeDuration,
      wordOption: settings.wordCount,
      difficulty: settings.difficulty,
      historyPoints:
        performanceHistoryRef.current.length >= 2
          ? [...performanceHistoryRef.current]
          : [
              { second: 0, wpm: 0, rawWpm: 0, accuracy: 100, errors: 0 },
              { second: durationSec, wpm: finalWpm, rawWpm: finalWpm, accuracy: finalAccuracy, errors: finalIncorrect },
            ],
    };

    setTestResult(result);
    const updatedHistory = saveResultToHistory(result);
    setHistory(updatedHistory);
    setPreviousResult(result);
    if (finalWpm > personalBest) {
      setPersonalBest(finalWpm);
    }

    if (settings.soundEnabled) {
      soundManager.playComplete(settings.soundVolume / 100);
    }
  }, [settings, personalBest]);

  // Start Test - Single interval with timestamp calculation: strictly 1 second per second!
  const startTest = useCallback(() => {
    if (testStateRef.current === 'running') return;
    testStateRef.current = 'running';
    setTestState('running');

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const now = Date.now();
    startTimeRef.current = now;
    lastSampledSecRef.current = 0;
    prevSecondKeysRef.current = 0;
    secondDeltasRef.current = [];

    const initialPoint: PerformanceDataPoint = {
      second: 0,
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      errors: 0,
    };
    performanceHistoryRef.current = [initialPoint];
    setPerformanceHistory([initialPoint]);

    const targetDurationMs = settings.timeDuration * 1000;

    timerRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const remainingSec = Math.max(0, Math.ceil((targetDurationMs - elapsedMs) / 1000));

      setTimeLeft(remainingSec);
      setElapsedSeconds(elapsedSec);

      // Record performance sample once every new elapsed second
      if (elapsedSec > lastSampledSecRef.current) {
        lastSampledSecRef.current = elapsedSec;

        const currentKeys = correctKeystrokesRef.current;
        const deltaKeys = Math.max(0, currentKeys - prevSecondKeysRef.current);
        prevSecondKeysRef.current = currentKeys;
        secondDeltasRef.current.push(deltaKeys);

        const recentWindow = secondDeltasRef.current.slice(-2);
        const windowTotalKeys = recentWindow.reduce((a, b) => a + b, 0);
        const windowDurationSec = Math.max(1, recentWindow.length);
        const rollingInstantWpm = Math.round((windowTotalKeys / 5) * (60 / windowDurationSec));

        const totalKeys = correctKeystrokesRef.current + incorrectKeystrokesRef.current;
        const currentAcc = totalKeys > 0 ? Math.round((correctKeystrokesRef.current / totalKeys) * 100) : 100;

        const point: PerformanceDataPoint = {
          second: elapsedSec,
          wpm: rollingInstantWpm,
          rawWpm: rollingInstantWpm,
          accuracy: currentAcc,
          errors: incorrectKeystrokesRef.current,
        };

        performanceHistoryRef.current.push(point);
        setPerformanceHistory([...performanceHistoryRef.current]);
      }

      // Finish test exactly when remaining seconds hit 0
      if (remainingSec <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        finishTest();
      }
    }, 200);
  }, [settings.timeDuration, finishTest]);

  // Reset / Restart Test
  const resetTest = useCallback(
    (newWordsList?: string[]) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      testStateRef.current = 'idle';
      setTestState('idle');

      startTimeRef.current = 0;
      lastSampledSecRef.current = 0;
      prevSecondKeysRef.current = 0;
      secondDeltasRef.current = [];

      correctKeystrokesRef.current = 0;
      incorrectKeystrokesRef.current = 0;
      correctWordCountRef.current = 0;
      incorrectWordCountRef.current = 0;
      mistakesRef.current = [];
      currentWordIndexRef.current = 0;
      currentInputRef.current = '';
      performanceHistoryRef.current = [];

      setCorrectKeystrokes(0);
      setIncorrectKeystrokes(0);
      setCorrectWordCount(0);
      setIncorrectWordCount(0);
      setMistakes([]);
      setCurrentWordIndex(0);
      setCurrentInput('');
      setCompletedWords([]);
      setTimeLeft(settings.timeDuration);
      setElapsedSeconds(0);
      setPerformanceHistory([]);
      setTestResult(null);
      setStreak(0);
      setActiveKey(null);

      const generated = newWordsList || generateWordList(settings.difficulty, 300);
      wordsRef.current = generated;
      setWords(generated);
    },
    [settings.timeDuration, settings.difficulty]
  );

  // Practice specifically the mistyped words from previous session
  const handlePracticeMistakes = useCallback(
    (mistypedWords: string[]) => {
      if (mistypedWords.length === 0) return;
      const repeatedList: string[] = [];
      while (repeatedList.length < 120) {
        const shuffled = [...mistypedWords].sort(() => Math.random() - 0.5);
        repeatedList.push(...shuffled);
      }
      resetTest(repeatedList);
    },
    [resetTest]
  );

  // Global Escape key to instantly restart test
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isSettingsOpen || isThemeOpen || isHistoryOpen || isGuideOpen) return;
      if (e.key === 'Escape') {
        resetTest();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isSettingsOpen, isThemeOpen, isHistoryOpen, isGuideOpen, resetTest]);

  // Update theme & save settings when settings change
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    applyThemeToDom(getActiveTheme(newSettings));

    if (testStateRef.current === 'idle') {
      setTimeLeft(newSettings.timeDuration);
      const generated = generateWordList(newSettings.difficulty, 300);
      wordsRef.current = generated;
      setWords(generated);
    }
  };

  // Input change handler
  const handleInputChange = (val: string) => {
    currentInputRef.current = val;
    setCurrentInput(val);
    if (testStateRef.current === 'idle' && val.length > 0) {
      startTest();
    }
  };

  // Word submission when Space is pressed
  const handleWordComplete = (typedWord: string) => {
    if (testStateRef.current === 'idle') {
      startTest();
    }

    const wordIdx = currentWordIndexRef.current;
    const targetWord = wordsRef.current[wordIdx] || '';
    const isWordCorrect = typedWord === targetWord;

    let wordCorrectChars = 0;
    let wordIncorrectChars = 0;

    const maxLen = Math.max(targetWord.length, typedWord.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < typedWord.length && i < targetWord.length) {
        if (typedWord[i] === targetWord[i]) {
          wordCorrectChars++;
        } else {
          wordIncorrectChars++;
        }
      } else {
        wordIncorrectChars++;
      }
    }

    if (isWordCorrect) {
      wordCorrectChars += 1;
      correctWordCountRef.current += 1;
      setCorrectWordCount(correctWordCountRef.current);
      setStreak((s) => s + 1);
    } else {
      wordIncorrectChars += 1;
      incorrectWordCountRef.current += 1;
      setIncorrectWordCount(incorrectWordCountRef.current);
      mistakesRef.current.push({ target: targetWord, typed: typedWord });
      setMistakes([...mistakesRef.current]);
      setStreak(0);
    }

    correctKeystrokesRef.current += wordCorrectChars;
    incorrectKeystrokesRef.current += wordIncorrectChars;
    setCorrectKeystrokes(correctKeystrokesRef.current);
    setIncorrectKeystrokes(incorrectKeystrokesRef.current);

    const newWordData: WordData = {
      text: targetWord,
      typed: typedWord,
      isCorrect: isWordCorrect,
    };
    setCompletedWords((prev) => [...prev, newWordData]);

    const nextIndex = wordIdx + 1;
    currentWordIndexRef.current = nextIndex;
    setCurrentWordIndex(nextIndex);

    currentInputRef.current = '';
    setCurrentInput('');

    if (settings.mode === 'words' && nextIndex >= settings.wordCount) {
      finishTest();
    }
  };

  // Keyboard shortcut listener: Tab + Enter to restart
  useEffect(() => {
    let tabPressed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabPressed = true;
      }
      if (e.key === 'Enter' && tabPressed) {
        e.preventDefault();
        resetTest();
      }
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsThemeOpen(false);
        setIsHistoryOpen(false);
        setIsGuideOpen(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetTest]);

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Live real-time statistics calculation
  const currentDurationMin = Math.max(1, elapsedSeconds) / 60;
  const liveWpm =
    elapsedSeconds > 0
      ? Math.round(correctKeystrokes / 5 / currentDurationMin)
      : 0;
  const totalTypedKeystrokes = correctKeystrokes + incorrectKeystrokes;
  const liveAccuracy =
    totalTypedKeystrokes > 0
      ? Math.round((correctKeystrokes / totalTypedKeystrokes) * 100)
      : 100;

  // History Actions
  const handleClearAllHistory = () => {
    clearHistory();
    setHistory([]);
    setPersonalBest(0);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
    if (updated.length > 0) {
      setPersonalBest(Math.max(...updated.map((h) => h.wpm)));
    } else {
      setPersonalBest(0);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col font-sans transition-colors duration-200">
      {/* 10FastFingers Navbar */}
      <Navbar
        activeTab={activeNavTab}
        setActiveTab={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'history') setIsHistoryOpen(true);
          if (tab === 'guide') setIsGuideOpen(true);
          if (tab === 'practice' || tab === 'test') {
            resetTest();
          }
        }}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenThemes={() => setIsThemeOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onRestartTest={() => resetTest()}
        testRunning={testState === 'running'}
      />

      {/* Main Container - Width 800px-840px matching 10FastFingers */}
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {/* Page Title & Subtitle */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)] font-sans">
            Tes Mengetik Bahasa Indonesia
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Uji dan tingkatkan kecepatan mengetik kata-kata Bahasa Indonesia (WPM) dalam 60 detik.
          </p>
        </div>

        {/* 10FastFingers Mode Options Strip */}
        {testState !== 'completed' && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Mode selection buttons */}
            <div className="flex items-center gap-1.5">
              {[
                { label: '60 Detik', dur: 60 },
                { label: '30 Detik', dur: 30 },
                { label: '120 Detik', dur: 120 },
              ].map((btn) => (
                <button
                  key={btn.dur}
                  onClick={() => {
                    handleUpdateSettings({
                      ...settings,
                      mode: 'time',
                      timeDuration: btn.dur,
                    });
                    resetTest();
                  }}
                  className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer border ${
                    settings.mode === 'time' && settings.timeDuration === btn.dur
                      ? 'bg-[var(--color-accent)] text-white border-transparent font-semibold'
                      : 'border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-surface)]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}

              <span className="text-[var(--bg-border)] px-1">|</span>

              <button
                onClick={() => {
                  const nextDiff =
                    settings.difficulty === 'easy'
                      ? 'normal'
                      : settings.difficulty === 'normal'
                      ? 'advanced'
                      : 'easy';
                  handleUpdateSettings({ ...settings, difficulty: nextDiff });
                  resetTest();
                }}
                className="px-2.5 py-1 rounded text-xs border border-[var(--bg-border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer capitalize"
                title="Beralih tingkat kosakata"
              >
                Tingkat: <strong className="text-[var(--text-main)]">{settings.difficulty}</strong>
              </button>
            </div>

            {/* Personal Best Info */}
            {personalBest > 0 && (
              <div className="text-xs text-[var(--text-muted)] font-sans">
                Rekor Terbaik:{' '}
                <strong className="text-[var(--color-accent)]">{personalBest} WPM</strong>
              </div>
            )}
          </div>
        )}

        {/* Live status if enabled */}
        <LiveStats
          state={testState}
          mode={settings.mode}
          timeLeft={timeLeft}
          initialTime={settings.timeDuration}
          wordsCompleted={currentWordIndex}
          targetWords={settings.wordCount}
          liveWpm={liveWpm}
          liveAccuracy={liveAccuracy}
          correctKeystrokes={correctKeystrokes}
          incorrectKeystrokes={incorrectKeystrokes}
          onRestart={() => resetTest()}
          showLiveWpm={settings.liveWpm}
          showLiveAccuracy={settings.liveAccuracy}
        />

        {/* View Switch: Active Typing Test vs 10FastFingers Result Screen */}
        {testState === 'completed' && testResult ? (
          <ResultsView
            result={testResult}
            personalBest={personalBest}
            previousResult={previousResult}
            mistakes={mistakes}
            onRestart={() => resetTest()}
            onChangeWords={() => resetTest(generateWordList(settings.difficulty, 300))}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onPracticeMistakes={handlePracticeMistakes}
          />
        ) : (
          <div className="flex flex-col gap-1">
            <TypingArea
              words={words}
              currentWordIndex={currentWordIndex}
              currentInput={currentInput}
              onInputChange={handleInputChange}
              onWordComplete={handleWordComplete}
              onStartTest={startTest}
              testState={testState}
              completedWords={completedWords}
              settings={settings}
              timeLeft={timeLeft}
              onRestart={() => resetTest()}
              streak={streak}
              liveWpm={liveWpm}
              onUpdateSettings={handleUpdateSettings}
              onKeyActivity={(k) => setActiveKey(k)}
            />

            <KeyboardVisualizer
              activeKey={activeKey}
              nextChar={
                currentInput.length < (words[currentWordIndex] || '').length
                  ? (words[currentWordIndex] || '')[currentInput.length]
                  : ' '
              }
            />
          </div>
        )}

        {/* Authentic 10FastFingers Content Below the Test */}
        <div className="mt-8 pt-6 border-t space-y-6 text-sm" style={{ borderColor: 'var(--bg-border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: About Indonesian Typing Test */}
            <div
              className="rounded-md border p-4 sm:p-5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--bg-border)',
              }}
            >
              <h3 className="font-bold text-base text-[var(--text-main)] mb-2">
                Tentang Tes Mengetik 10FastFingers
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                Tes ini mengukur seberapa banyak kata Bahasa Indonesia yang dapat Anda ketik secara tepat dalam waktu 60 detik. Kosakata yang disajikan diambil dari kumpulan kata-kata bahasa Indonesia yang paling sering digunakan sehari-hari.
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1.5 list-disc pl-4">
                <li>
                  <strong className="text-[var(--text-main)]">Spasi:</strong> Menyelesaikan kata dan lanjut ke kata berikutnya.
                </li>
                <li>
                  <strong className="text-[var(--text-main)]">Kata Benar:</strong> Ditandai dengan warna hijau.
                </li>
                <li>
                  <strong className="text-[var(--text-main)]">Kata Salah:</strong> Ditandai dengan warna merah.
                </li>
                <li>
                  <strong className="text-[var(--text-main)]">Tab + Enter:</strong> Mengulang tes seketika.
                </li>
              </ul>
            </div>

            {/* Right: WPM Speed Scale Table */}
            <div
              className="rounded-md border p-4 sm:p-5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--bg-border)',
              }}
            >
              <h3 className="font-bold text-base text-[var(--text-main)] mb-2">
                Skala Kecepatan Mengetik (WPM)
              </h3>
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="border-b text-left text-[var(--text-muted)]" style={{ borderColor: 'var(--bg-border)' }}>
                    <th className="py-1.5 font-semibold">Kecepatan</th>
                    <th className="py-1.5 font-semibold">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--bg-border)' }}>
                  <tr>
                    <td className="py-1.5 font-medium">&lt; 25 WPM</td>
                    <td className="py-1.5 text-[var(--text-muted)]">Pemula / Lambat</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">25 – 45 WPM</td>
                    <td className="py-1.5 text-[var(--text-muted)]">Rata-rata Normal</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">45 – 65 WPM</td>
                    <td className="py-1.5 text-[var(--text-muted)]">Cepat & Produktif</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">65 – 85 WPM</td>
                    <td className="py-1.5 text-[var(--text-muted)]">Sangat Cepat</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium font-bold text-green-700 dark:text-green-400">&gt; 85 WPM</td>
                    <td className="py-1.5 text-green-700 dark:text-green-400 font-semibold">Master / Profesional</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full border-t py-4 text-center text-xs transition-colors mt-auto"
        style={{
          borderColor: 'var(--bg-border)',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            10FastFingers ID (KetikKilat) &copy; {new Date().getFullYear()} — Tes Kecepatan Mengetik Indonesia
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-[var(--text-main)] cursor-pointer"
            >
              Panduan 10 Jari
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-[var(--text-main)] cursor-pointer"
            >
              Pengaturan
            </button>
            <span>·</span>
            <button
              onClick={() => setIsThemeOpen(true)}
              className="hover:text-[var(--text-main)] cursor-pointer"
            >
              Tema
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearHistory={handleClearAllHistory}
      />

      <ThemeModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDeleteResult={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
