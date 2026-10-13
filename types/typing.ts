export type TypingMode = 'time' | 'words';

export type Difficulty = 'easy' | 'normal' | 'advanced';

export type TestState = 'idle' | 'running' | 'completed';

export interface PerformanceDataPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
}

export interface WordData {
  text: string;
  typed: string;
  isCorrect?: boolean;
}

export interface TestResult {
  id: string;
  date: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  correctWords: number;
  incorrectWords: number;
  totalKeystrokes: number;
  duration: number; // in seconds
  mode: TypingMode;
  timeOption: number;
  wordOption?: number;
  difficulty: Difficulty;
  historyPoints: PerformanceDataPoint[];
}

export interface ThemeConfig {
  id: string;
  name: string;
  bg: string;
  surface: string;
  surfaceBorder: string;
  text: string;
  textMuted: string;
  accent: string;
  correct: string;
  error: string;
  caret: string;
  chartLine: string;
}

export interface UserSettings {
  themeId: string;
  customTheme: ThemeConfig;
  soundEnabled: boolean;
  soundVolume: number; // 0 - 100
  difficulty: Difficulty;
  mode: TypingMode;
  timeDuration: number; // 15, 30, 60, 120
  wordCount: number; // 10, 25, 50, 100
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'sans' | 'mono';
  highlightMistakes: boolean;
  liveWpm: boolean;
  liveAccuracy: boolean;
  liveTimer: boolean;
}
