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

  // Interval and keystroke delta tracking refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevSecondKeysRef = useRef(0);
  const secondDeltasRef = useRef<number[]>([]);

  // Synchronize active theme CSS variables to DOM
  useEffect(() => {
    applyThemeToDom(getActiveTheme(settings));
  }, [settings]);

  // Update theme & save settings when settings change
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    applyThemeToDom(getActiveTheme(newSettings));

    if (testState === 'idle') {
      setTimeLeft(newSettings.timeDuration);
      setWords(generateWordList(newSettings.difficulty, 300));
    }
  };

  // Reset / Restart Test
  const resetTest = useCallback(
    (newWordsList?: string[]) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      prevSecondKeysRef.current = 0;
      secondDeltasRef.current = [];
      setTestState('idle');
      setCurrentWordIndex(0);
      setCurrentInput('');
      setCompletedWords([]);
      setTimeLeft(settings.timeDuration);
      setElapsedSeconds(0);
      setCorrectKeystrokes(0);
      setIncorrectKeystrokes(0);
      setCorrectWordCount(0);
      setIncorrectWordCount(0);
      setMistakes([]);
      setPerformanceHistory([]);
      setTestResult(null);

      if (newWordsList) {
        setWords(newWordsList);
      } else {
        setWords(generateWordList(settings.difficulty, 300));
      }
    },
    [settings.timeDuration, settings.difficulty]
  );

  // Finish Test
  const finishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setTestState('completed');

    const durationSec = Math.max(1, elapsedSeconds);
    const durationMin = durationSec / 60;

    // Standard overall average WPM = (correctChars / 5) / minutes
    const finalWpm = Math.round(correctKeystrokes / 5 / durationMin) || 0;
    const totalChars = correctKeystrokes + incorrectKeystrokes;
    const rawWpm = Math.round(totalChars / 5 / durationMin) || 0;
    const finalAccuracy =
      totalChars > 0 ? Math.round((correctKeystrokes / totalChars) * 100) : 100;

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
      correctChars: correctKeystrokes,
      incorrectChars: incorrectKeystrokes,
      correctWords: correctWordCount,
      incorrectWords: incorrectWordCount,
      totalKeystrokes: totalChars,
      duration: durationSec,
      mode: settings.mode,
      timeOption: settings.timeDuration,
      wordOption: settings.wordCount,
      difficulty: settings.difficulty,
      historyPoints: performanceHistory,
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
  }, [
    elapsedSeconds,
    correctKeystrokes,
    incorrectKeystrokes,
    correctWordCount,
    incorrectWordCount,
    settings,
    performanceHistory,
    personalBest,
  ]);

  // Start Test
  const startTest = useCallback(() => {
    if (testState === 'running') return;
    setTestState('running');
    setElapsedSeconds(0);
    prevSecondKeysRef.current = 0;
    secondDeltasRef.current = [];

    const initialPoint: PerformanceDataPoint = {
      second: 0,
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      errors: 0,
    };
    setPerformanceHistory([initialPoint]);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prevElapsed) => {
        const nextElapsed = prevElapsed + 1;

        if (settings.mode === 'time') {
          setTimeLeft((prevTime) => {
            if (prevTime <= 1) {
              setTimeout(() => finishTest(), 0);
              return 0;
            }
            return prevTime - 1;
          });
        }

        setCorrectKeystrokes((latestCorrect) => {
          setIncorrectKeystrokes((latestIncorrect) => {
            // Delta keystrokes typed in this exact 1-second interval
            const deltaKeys = Math.max(0, latestCorrect - prevSecondKeysRef.current);
            prevSecondKeysRef.current = latestCorrect;
            secondDeltasRef.current.push(deltaKeys);

            // 2-second moving average window to produce an authentic fluctuating speed curve
            const recentWindow = secondDeltasRef.current.slice(-2);
            const windowTotalKeys = recentWindow.reduce((a, b) => a + b, 0);
            const windowDurationSec = recentWindow.length;
            const rollingInstantWpm = Math.round((windowTotalKeys / 5) * (60 / windowDurationSec)) || 0;

            const currentTotal = latestCorrect + latestIncorrect;
            const currentAcc =
              currentTotal > 0
                ? Math.round((latestCorrect / currentTotal) * 100)
                : 100;

            const point: PerformanceDataPoint = {
              second: nextElapsed,
              wpm: rollingInstantWpm,
              rawWpm: rollingInstantWpm,
              accuracy: currentAcc,
              errors: latestIncorrect,
            };

            setPerformanceHistory((prevPoints) => [...prevPoints, point]);
            return latestIncorrect;
          });
          return latestCorrect;
        });

        return nextElapsed;
      });
    }, 1000);
  }, [testState, settings.mode, finishTest]);

  // Input change handler
  const handleInputChange = (val: string) => {
    setCurrentInput(val);
  };

  // Word submission when Space is pressed
  const handleWordComplete = (typedWord: string) => {
    const targetWord = words[currentWordIndex] || '';
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
      setCorrectWordCount((prev) => prev + 1);
    } else {
      wordIncorrectChars += 1;
      setIncorrectWordCount((prev) => prev + 1);
      setMistakes((prev) => [...prev, { target: targetWord, typed: typedWord }]);
    }

    setCorrectKeystrokes((prev) => prev + wordCorrectChars);
    setIncorrectKeystrokes((prev) => prev + wordIncorrectChars);

    const newWordData: WordData = {
      text: targetWord,
      typed: typedWord,
      isCorrect: isWordCorrect,
    };
    setCompletedWords((prev) => [...prev, newWordData]);

    const nextIndex = currentWordIndex + 1;
    setCurrentWordIndex(nextIndex);
    setCurrentInput('');

    if (settings.mode === 'words' && nextIndex >= settings.wordCount) {
      setTimeout(() => finishTest(), 0);
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
          />
        ) : (
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
          />
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
