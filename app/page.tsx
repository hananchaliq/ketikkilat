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
import { OnlineLeaderboardPanel } from '@/components/OnlineLeaderboardPanel';
import { generateWordList } from '@/lib/words';
import { soundManager } from '@/lib/sound';
import {
  loadSettings,
  saveSettings,
  loadHistory,
  saveResultToHistory,
  clearHistory,
  deleteHistoryItem,
  getActiveTheme,
  loadUsername,
  saveUsername,
  getOrCreateClientId,
} from '@/lib/storage';
import { applyThemeToDom } from '@/lib/themes';
import {
  UserSettings,
  TestState,
  WordData,
  PerformanceDataPoint,
  TestResult,
} from '@/types/typing';
import { LeaderboardEntry, OnlineUserPresence } from '@/lib/serverStore';

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

  // Focus Mode & Pace Car States
  const [focusModeEnabled, setFocusModeEnabled] = useState(true);
  const [isUserActivelyTyping, setIsUserActivelyTyping] = useState(false);
  const [paceTargetWpm, setPaceTargetWpm] = useState<number>(0);
  const [paceLabel, setPaceLabel] = useState<string>('Mati');

  // Online Presence & Persistent Leaderboard States
  const [username, setUsername] = useState<string>(() => loadUsername());
  const [clientId] = useState<string>(() => getOrCreateClientId());
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserPresence[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardDuration, setLeaderboardDuration] = useState<number>(() => loadSettings().timeDuration || 60);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardMessage, setLeaderboardMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

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
  const prevSecondErrorsRef = useRef<number>(0);
  const secondDeltasRef = useRef<number[]>([]);
  const secondErrorDeltasRef = useRef<number[]>([]);

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
  const usernameRef = useRef<string>(username);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // Keep wordsRef synced
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  // Synchronize active theme CSS variables to DOM
  useEffect(() => {
    applyThemeToDom(getActiveTheme(settings));
  }, [settings]);

  // Restore UI visibility when mouse moves during Focus Mode
  useEffect(() => {
    if (!isUserActivelyTyping) return;
    const handleMouseMove = () => {
      setIsUserActivelyTyping(false);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isUserActivelyTyping]);

  // Fetch Leaderboard for selected duration
  const fetchLeaderboard = useCallback(async (dur: number) => {
    try {
      const res = await fetch(`/api/leaderboard?duration=${dur}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard);
        }
      }
    } catch {
      // Ignore network error
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => {
      fetchLeaderboard(leaderboardDuration);
    }, 0);
    return () => clearTimeout(timer);
  }, [isMounted, leaderboardDuration, fetchLeaderboard]);

  // Submit score to persistent server leaderboard
  const submitScoreToServer = useCallback(
    async (resultToSubmit: TestResult, userToSubmit: string) => {
      const cleanName = userToSubmit.trim();
      if (cleanName.length < 2) return;

      if (resultToSubmit.accuracy < 85) {
        setLeaderboardMessage({
          type: 'info',
          text: `Skor ${resultToSubmit.wpm} WPM belum masuk Leaderboard karena akurasi ${resultToSubmit.accuracy}% (syarat minimal 85%).`,
        });
        return;
      }

      try {
        const res = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: cleanName,
            wpm: resultToSubmit.wpm,
            rawWpm: resultToSubmit.rawWpm,
            accuracy: resultToSubmit.accuracy,
            correctWords: resultToSubmit.correctWords,
            incorrectWords: resultToSubmit.incorrectWords,
            correctChars: resultToSubmit.correctChars,
            duration: resultToSubmit.timeOption || resultToSubmit.duration,
            difficulty: resultToSubmit.difficulty,
          }),
        });

        const data = await res.json();
        if (res.ok && data.ok) {
          if (resultToSubmit.timeOption === leaderboardDuration && Array.isArray(data.leaderboard)) {
            setLeaderboard(data.leaderboard);
          } else {
            fetchLeaderboard(leaderboardDuration);
          }

          if (data.isNewRecord) {
            setLeaderboardMessage({
              type: 'success',
              text: `Rekor Leaderboard baru untuk @${cleanName}: ${resultToSubmit.wpm} WPM (Peringkat #${data.rank || 1} di mode ${resultToSubmit.timeOption} Detik)!`,
            });
          } else {
            setLeaderboardMessage({
              type: 'info',
              text: `Skor selesai: ${resultToSubmit.wpm} WPM. Rekor tertinggi @${cleanName} di Leaderboard tetap ${data.previousBestWpm} WPM (Peringkat #${data.rank || '-'}).`,
            });
          }
        } else if (data.reason) {
          setLeaderboardMessage({
            type: 'error',
            text: data.reason,
          });
        }
      } catch {
        // Ignore network error
      }
    },
    [leaderboardDuration, fetchLeaderboard]
  );

  // Finish Test - Reads directly from authoritative refs so results are accurate and never falsely inflated
  const finishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (testStateRef.current === 'completed') return;
    testStateRef.current = 'completed';
    setTestState('completed');
    setIsUserActivelyTyping(false);

    // Count unfinished word keystrokes at the timer cutoff
    let pendingCorrect = 0;
    let pendingIncorrect = 0;
    const currentVal = currentInputRef.current.trim();
    const target = wordsRef.current[currentWordIndexRef.current] || '';
    if (currentVal.length > 0) {
      if (target.startsWith(currentVal)) {
        pendingCorrect = currentVal.length;
      } else {
        pendingIncorrect = currentVal.length;
      }
    }

    const finalCorrect = correctKeystrokesRef.current + pendingCorrect;
    const finalIncorrect = incorrectKeystrokesRef.current + pendingIncorrect;
    const totalChars = finalCorrect + finalIncorrect;

    const actualElapsedMs = startTimeRef.current > 0 ? Date.now() - startTimeRef.current : 60000;
    const durationSec = Math.max(1, Math.round(actualElapsedMs / 1000));
    const durationMin = durationSec / 60;

    // Standard 10FastFingers Net WPM: (correct keystrokes / 5) / minutes
    const finalWpm = Math.max(0, Math.round(finalCorrect / 5 / durationMin)) || 0;
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
              {
                second: durationSec,
                wpm: finalWpm,
                rawWpm: finalWpm,
                accuracy: finalAccuracy,
                errors: finalIncorrect,
              },
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

    // Automatically submit to persistent Leaderboard if username is set
    if (usernameRef.current && usernameRef.current.trim().length >= 2) {
      submitScoreToServer(result, usernameRef.current);
    } else {
      setLeaderboardMessage(null);
    }
  }, [settings, personalBest, submitScoreToServer]);

  // Start Test - Single interval with timestamp calculation: strictly 1 second per second
  const startTest = useCallback(() => {
    if (testStateRef.current === 'running') return;
    testStateRef.current = 'running';
    setTestState('running');
    setLeaderboardMessage(null);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const now = Date.now();
    startTimeRef.current = now;
    lastSampledSecRef.current = 0;
    prevSecondKeysRef.current = 0;
    prevSecondErrorsRef.current = 0;
    secondDeltasRef.current = [];
    secondErrorDeltasRef.current = [];

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

        const currentCorrect = correctKeystrokesRef.current;
        const currentErrors = incorrectKeystrokesRef.current;

        const deltaCorrect = Math.max(0, currentCorrect - prevSecondKeysRef.current);
        const deltaErrors = Math.max(0, currentErrors - prevSecondErrorsRef.current);

        prevSecondKeysRef.current = currentCorrect;
        prevSecondErrorsRef.current = currentErrors;

        secondDeltasRef.current.push(deltaCorrect);
        secondErrorDeltasRef.current.push(deltaErrors);

        const recentCorrect = secondDeltasRef.current.slice(-2);
        const recentErrors = secondErrorDeltasRef.current.slice(-2);

        const windowCorrect = recentCorrect.reduce((a, b) => a + b, 0);
        const windowErrors = recentErrors.reduce((a, b) => a + b, 0);
        const windowDurationSec = Math.max(1, recentCorrect.length);

        const rollingRawWpm = Math.round(
          ((windowCorrect + windowErrors) / 5) * (60 / windowDurationSec)
        );
        const rollingNetWpm = Math.max(
          0,
          Math.round(((windowCorrect - windowErrors) / 5) * (60 / windowDurationSec))
        );
        const cumulativeNetWpm = Math.max(0, Math.round(currentCorrect / 5 / (elapsedSec / 60)));

        const instantWpm =
          elapsedSec <= 2
            ? rollingNetWpm
            : Math.round(0.65 * rollingNetWpm + 0.35 * cumulativeNetWpm);

        const totalKeys = currentCorrect + currentErrors;
        const currentAcc = totalKeys > 0 ? Math.round((currentCorrect / totalKeys) * 100) : 100;

        const point: PerformanceDataPoint = {
          second: elapsedSec,
          wpm: instantWpm,
          rawWpm: Math.max(instantWpm, rollingRawWpm),
          accuracy: currentAcc,
          errors: currentErrors,
        };

        performanceHistoryRef.current.push(point);
        setPerformanceHistory([...performanceHistoryRef.current]);
      }

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
      setIsUserActivelyTyping(false);

      startTimeRef.current = 0;
      lastSampledSecRef.current = 0;
      prevSecondKeysRef.current = 0;
      prevSecondErrorsRef.current = 0;
      secondDeltasRef.current = [];
      secondErrorDeltasRef.current = [];

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

    if (newSettings.timeDuration !== leaderboardDuration) {
      setLeaderboardDuration(newSettings.timeDuration);
    }

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
    setIsUserActivelyTyping(true);
    if (testStateRef.current === 'idle' && val.length > 0) {
      startTest();
    }
  };

  // Word submission when Space is pressed
  const handleWordComplete = (typedWord: string) => {
    if (testStateRef.current === 'idle') {
      startTest();
    }
    setIsUserActivelyTyping(true);

    const wordIdx = currentWordIndexRef.current;
    const targetWord = wordsRef.current[wordIdx] || '';
    const isWordCorrect = typedWord === targetWord;

    if (isWordCorrect) {
      const correctChars = targetWord.length + 1;
      correctKeystrokesRef.current += correctChars;
      correctWordCountRef.current += 1;
      setCorrectWordCount(correctWordCountRef.current);
      setStreak((s) => s + 1);
    } else {
      const errorChars = Math.max(typedWord.length, targetWord.length) + 1;
      incorrectKeystrokesRef.current += errorChars;
      incorrectWordCountRef.current += 1;
      setIncorrectWordCount(incorrectWordCountRef.current);
      mistakesRef.current.push({ target: targetWord, typed: typedWord });
      setMistakes([...mistakesRef.current]);
      setStreak(0);
    }

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
    elapsedSeconds > 0 ? Math.round(correctKeystrokes / 5 / currentDurationMin) : 0;
  const totalTypedKeystrokes = correctKeystrokes + incorrectKeystrokes;
  const liveAccuracy =
    totalTypedKeystrokes > 0
      ? Math.round((correctKeystrokes / totalTypedKeystrokes) * 100)
      : 100;

  // Real-Time Online Presence Heartbeat
  const sendPresenceHeartbeat = useCallback(async () => {
    if (!clientId) return;
    try {
      const statusPayload =
        testState === 'running'
          ? 'typing'
          : testState === 'completed'
          ? 'completed'
          : 'idle';

      const res = await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          username: username || 'PengetikAnonim',
          status: statusPayload,
          liveWpm: testState === 'completed' && testResult ? testResult.wpm : liveWpm,
          accuracy: testState === 'completed' && testResult ? testResult.accuracy : liveAccuracy,
          duration: settings.timeDuration,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) {
          setOnlineUsers(data.users);
        }
      }
    } catch {
      // Ignore network hiccup
    }
  }, [clientId, username, testState, testResult, liveWpm, liveAccuracy, settings.timeDuration]);

  useEffect(() => {
    if (!isMounted) return;
    const initTimer = setTimeout(sendPresenceHeartbeat, 0);
    const interval = setInterval(sendPresenceHeartbeat, 6000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [isMounted, sendPresenceHeartbeat]);

  // Update Username Handler
  const handleUpdateUsername = (newName: string) => {
    setUsername(newName);
    saveUsername(newName);
    usernameRef.current = newName;
    if (testResult && testState === 'completed') {
      submitScoreToServer(testResult, newName);
    }
  };

  // Cycle Pace Car Target WPM
  const handleCyclePaceTarget = () => {
    const topLbWpm = leaderboard.length > 0 ? leaderboard[0].wpm : 95;
    const topLbName = leaderboard.length > 0 ? leaderboard[0].username : 'Top #1';

    if (paceTargetWpm === 0) {
      setPaceTargetWpm(60);
      setPaceLabel('Target Cepat');
    } else if (paceTargetWpm === 60 && personalBest > 0 && personalBest !== 60) {
      setPaceTargetWpm(personalBest);
      setPaceLabel('Rekor Pribadi');
    } else if (paceTargetWpm !== topLbWpm) {
      setPaceTargetWpm(topLbWpm);
      setPaceLabel(`#1 ${topLbName}`);
    } else {
      setPaceTargetWpm(0);
      setPaceLabel('Mati');
    }
  };

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

  const isFocusDimmed = focusModeEnabled && testState === 'running' && isUserActivelyTyping;

  return (
    <div className="flex min-h-screen flex-col font-sans transition-colors duration-200">
      {/* Navbar with Focus Mode dimming */}
      <div className={`transition-opacity duration-300 ${isFocusDimmed ? 'opacity-25 hover:opacity-100' : 'opacity-100'}`}>
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
          onlineCount={Math.max(1, onlineUsers.length)}
          typingCount={onlineUsers.filter((u) => u.status === 'typing').length}
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {/* Page Title & Subtitle */}
        <div
          className={`mb-4 transition-opacity duration-300 ${
            isFocusDimmed ? 'opacity-25 hover:opacity-100' : 'opacity-100'
          }`}
        >
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)] font-sans">
            Tes Mengetik Bahasa Indonesia
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Uji dan tingkatkan kecepatan mengetik kata-kata Bahasa Indonesia (WPM) secara presisi.
          </p>
        </div>

        {/* Mode Options Strip */}
        {testState !== 'completed' && (
          <div
            className={`mb-3 flex flex-wrap items-center justify-between gap-2 text-xs transition-opacity duration-300 ${
              isFocusDimmed ? 'opacity-25 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {[
                { label: '60 Detik', dur: 60 },
                { label: '30 Detik', dur: 30 },
                { label: '120 Detik', dur: 120 },
              ].map((btn) => (
                <button
                  key={btn.dur}
                  type="button"
                  onClick={() => {
                    handleUpdateSettings({
                      ...settings,
                      mode: 'time',
                      timeDuration: btn.dur,
                    });
                    resetTest();
                  }}
                  className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
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
                type="button"
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
                className="px-2.5 py-1 rounded text-xs border border-[var(--bg-border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer capitalize whitespace-nowrap shrink-0"
                title="Beralih tingkat kosakata"
              >
                Tingkat: <strong className="text-[var(--text-main)]">{settings.difficulty}</strong>
              </button>
            </div>

            {/* Personal Best & Username Summary */}
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-sans">
              {username && (
                <span>
                  Pengetik: <strong className="text-[var(--text-main)]">@{username}</strong>
                </span>
              )}
              {personalBest > 0 && (
                <span>
                  Rekor Terbaik:{' '}
                  <strong className="text-[var(--color-accent)] font-mono tabular-nums">
                    {personalBest} WPM
                  </strong>
                </span>
              )}
            </div>
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

        {/* View Switch: Active Typing Test vs Result Screen */}
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
            username={username}
            onSubmitToLeaderboard={(newUsername) => handleUpdateUsername(newUsername)}
            leaderboardStatus={leaderboardMessage}
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
              paceTargetWpm={paceTargetWpm}
              paceLabel={paceLabel}
              onCyclePaceTarget={handleCyclePaceTarget}
              focusModeEnabled={focusModeEnabled}
              onToggleFocusMode={() => setFocusModeEnabled((f) => !f)}
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

        {/* Persistent Leaderboard Section */}
        <div
          className={`transition-opacity duration-300 ${
            isFocusDimmed ? 'opacity-20 hover:opacity-100' : 'opacity-100'
          }`}
        >
          <OnlineLeaderboardPanel
            username={username}
            onUpdateUsername={handleUpdateUsername}
            leaderboard={leaderboard}
            selectedDuration={leaderboardDuration}
            onSelectDuration={(dur) => setLeaderboardDuration(dur)}
            isLoadingLeaderboard={isLoadingLeaderboard}
            onRefreshLeaderboard={() => fetchLeaderboard(leaderboardDuration)}
            lastSubmissionMessage={leaderboardMessage}
            paceTargetWpm={paceTargetWpm}
            onSetPaceTarget={(wpm, label) => {
              setPaceTargetWpm(wpm);
              setPaceLabel(wpm > 0 ? label : 'Mati');
            }}
          />

          {/* Authentic Content Below the Leaderboard */}
          <div className="mt-6 pt-6 border-t space-y-6 text-sm" style={{ borderColor: 'var(--bg-border)' }}>
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
                  Tentang Tes Mengetik KetikKilat
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                  Tes ini mengukur seberapa banyak kata Bahasa Indonesia yang dapat Anda ketik secara tepat dan berirama. Baris kata otomatis bergulir setiap selesai satu baris, dan Anda dapat langsung mengetik huruf tanpa perlu mengklik kotak teks terlebih dahulu.
                </p>
                <ul className="text-xs text-[var(--text-muted)] space-y-1.5 list-disc pl-4">
                  <li>
                    <strong className="text-[var(--text-main)]">Auto-Focus Instan:</strong> Tekan huruf apa saja untuk langsung memulai.
                  </li>
                  <li>
                    <strong className="text-[var(--text-main)]">Spasi:</strong> Menyelesaikan kata dan lanjut ke kata berikutnya.
                  </li>
                  <li>
                    <strong className="text-[var(--text-main)]">Pace Car:</strong> Kursor bayangan untuk balapan melawan rekor pribadi atau lawan di Leaderboard.
                  </li>
                  <li>
                    <strong className="text-[var(--text-main)]">Tab + Enter / Esc:</strong> Mengulang sesi tes seketika.
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
                      <td className="py-1.5 font-medium font-mono tabular-nums">&lt; 25 WPM</td>
                      <td className="py-1.5 text-[var(--text-muted)]">Pemula / Lambat</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium font-mono tabular-nums">25 – 45 WPM</td>
                      <td className="py-1.5 text-[var(--text-muted)]">Rata-rata Normal</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium font-mono tabular-nums">45 – 65 WPM</td>
                      <td className="py-1.5 text-[var(--text-muted)]">Cepat &amp; Produktif</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium font-mono tabular-nums">65 – 85 WPM</td>
                      <td className="py-1.5 text-[var(--text-muted)]">Sangat Cepat</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium font-mono tabular-nums font-bold text-green-700 dark:text-green-400">&gt; 85 WPM</td>
                      <td className="py-1.5 text-green-700 dark:text-green-400 font-semibold">Master / Profesional</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`w-full border-t py-4 text-center text-xs transition-all duration-300 mt-auto ${
          isFocusDimmed ? 'opacity-20 hover:opacity-100' : 'opacity-100'
        }`}
        style={{
          borderColor: 'var(--bg-border)',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            KetikKilat &copy; {new Date().getFullYear()} — Platform Latihan &amp; Tes Kecepatan Mengetik Indonesia
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
