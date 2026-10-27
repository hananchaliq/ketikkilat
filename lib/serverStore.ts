import fs from 'fs';
import path from 'path';
import { Difficulty } from '@/types/typing';

export interface LeaderboardEntry {
  id: string;
  username: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  correctChars: number;
  duration: number; // 30, 60, 120
  difficulty: Difficulty;
  updatedAt: string;
}

export interface OnlineUserPresence {
  clientId: string;
  username: string;
  status: 'idle' | 'typing' | 'completed';
  liveWpm: number;
  accuracy: number;
  duration: number;
  lastSeen: number;
}

interface PersistentStoreData {
  leaderboard: LeaderboardEntry[];
}

const INITIAL_SEED_ENTRIES: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    username: 'RizkyKilat',
    wpm: 104,
    rawWpm: 108,
    accuracy: 98,
    correctWords: 89,
    incorrectWords: 2,
    correctChars: 520,
    duration: 60,
    difficulty: 'normal',
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'seed-2',
    username: 'NadiaJari10',
    wpm: 92,
    rawWpm: 95,
    accuracy: 97,
    correctWords: 78,
    incorrectWords: 2,
    correctChars: 460,
    duration: 60,
    difficulty: 'normal',
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'seed-3',
    username: 'DimasTekno',
    wpm: 81,
    rawWpm: 85,
    accuracy: 95,
    correctWords: 69,
    incorrectWords: 3,
    correctChars: 405,
    duration: 60,
    difficulty: 'normal',
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'seed-4',
    username: 'AyuMengetik',
    wpm: 74,
    rawWpm: 77,
    accuracy: 96,
    correctWords: 63,
    incorrectWords: 2,
    correctChars: 370,
    duration: 60,
    difficulty: 'easy',
    updatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'seed-5',
    username: 'FajarSakti',
    wpm: 112,
    rawWpm: 115,
    accuracy: 97,
    correctWords: 48,
    incorrectWords: 1,
    correctChars: 280,
    duration: 30,
    difficulty: 'normal',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'seed-6',
    username: 'BagasPro',
    wpm: 88,
    rawWpm: 91,
    accuracy: 96,
    correctWords: 37,
    incorrectWords: 1,
    correctChars: 220,
    duration: 30,
    difficulty: 'normal',
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'seed-7',
    username: 'SitiKencana',
    wpm: 86,
    rawWpm: 89,
    accuracy: 97,
    correctWords: 145,
    incorrectWords: 4,
    correctChars: 860,
    duration: 120,
    difficulty: 'normal',
    updatedAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
  },
];

// Global singleton in-memory cache so state stays consistent across Next.js hot reloads
const globalForStore = globalThis as unknown as {
  __ketikKilatLeaderboard?: LeaderboardEntry[];
  __ketikKilatPresence?: Map<string, OnlineUserPresence>;
  __ketikKilatStorePath?: string;
};

function getStoreFilePath(): string {
  if (globalForStore.__ketikKilatStorePath) {
    return globalForStore.__ketikKilatStorePath;
  }
  const primaryDir = path.join(process.cwd(), '.data');
  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    const filePath = path.join(primaryDir, 'leaderboard.json');
    globalForStore.__ketikKilatStorePath = filePath;
    return filePath;
  } catch {
    const fallbackPath = '/tmp/ketikkilat_leaderboard.json';
    globalForStore.__ketikKilatStorePath = fallbackPath;
    return fallbackPath;
  }
}

function loadLeaderboardFromDisk(): LeaderboardEntry[] {
  if (globalForStore.__ketikKilatLeaderboard) {
    return globalForStore.__ketikKilatLeaderboard;
  }

  const filePath = getStoreFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as PersistentStoreData;
      if (Array.isArray(parsed.leaderboard) && parsed.leaderboard.length > 0) {
        globalForStore.__ketikKilatLeaderboard = parsed.leaderboard;
        return parsed.leaderboard;
      }
    }
  } catch {
    // Fallback to initial seed if file read fails
  }

  globalForStore.__ketikKilatLeaderboard = [...INITIAL_SEED_ENTRIES];
  saveLeaderboardToDisk(globalForStore.__ketikKilatLeaderboard);
  return globalForStore.__ketikKilatLeaderboard;
}

function saveLeaderboardToDisk(entries: LeaderboardEntry[]): void {
  globalForStore.__ketikKilatLeaderboard = entries;
  const filePath = getStoreFilePath();
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify({ leaderboard: entries }, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch {
    try {
      fs.writeFileSync(filePath, JSON.stringify({ leaderboard: entries }, null, 2), 'utf-8');
    } catch {
      // Ignore disk write error if read-only fs, in-memory cache still holds it
    }
  }
}

export function getLeaderboard(duration?: number): LeaderboardEntry[] {
  const all = loadLeaderboardFromDisk();
  const filtered = duration ? all.filter((item) => item.duration === duration) : all;
  return [...filtered].sort((a, b) => {
    if (b.wpm !== a.wpm) return b.wpm - a.wpm;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return b.correctChars - a.correctChars;
  });
}

export interface SubmitScoreInput {
  username: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  correctChars: number;
  duration: number;
  difficulty: Difficulty;
}

export interface SubmitScoreResult {
  ok: boolean;
  reason?: string;
  isNewRecord?: boolean;
  previousBestWpm?: number;
  rank?: number;
  entry?: LeaderboardEntry;
  leaderboard: LeaderboardEntry[];
}

export function submitLeaderboardScore(input: SubmitScoreInput): SubmitScoreResult {
  const cleanUsername = (input.username || '')
    .trim()
    .replace(/[^a-zA-Z0-9_\-. ]/g, '')
    .slice(0, 22);

  if (cleanUsername.length < 2) {
    return {
      ok: false,
      reason: 'Username minimal 2 karakter.',
      leaderboard: getLeaderboard(input.duration),
    };
  }

  const duration = [30, 60, 120].includes(Number(input.duration)) ? Number(input.duration) : 60;
  const wpm = Math.round(Number(input.wpm) || 0);
  const rawWpm = Math.round(Number(input.rawWpm) || wpm);
  const accuracy = Math.round(Number(input.accuracy) || 0);
  const correctChars = Math.max(0, Math.round(Number(input.correctChars) || 0));
  const correctWords = Math.max(0, Math.round(Number(input.correctWords) || 0));
  const incorrectWords = Math.max(0, Math.round(Number(input.incorrectWords) || 0));

  // Anti-cheat & minimum accuracy validation (>= 85%)
  if (wpm <= 0) {
    return {
      ok: false,
      reason: 'Skor WPM harus lebih dari 0.',
      leaderboard: getLeaderboard(duration),
    };
  }

  if (accuracy < 85) {
    return {
      ok: false,
      reason: `Akurasi minimal untuk masuk Leaderboard adalah 85% (skor Anda: ${accuracy}%).`,
      leaderboard: getLeaderboard(duration),
    };
  }

  // Anti-cheat plausibility check
  const expectedWpm = Math.round(correctChars / 5 / (duration / 60));
  if (wpm > 220 || rawWpm > 250 || Math.abs(expectedWpm - wpm) > 12) {
    return {
      ok: false,
      reason: 'Terdeteksi anomali perhitungan WPM (Anti-Cheat aktif).',
      leaderboard: getLeaderboard(duration),
    };
  }

  const all = [...loadLeaderboardFromDisk()];
  const normalizedUser = cleanUsername.toLowerCase();

  const existingIndex = all.findIndex(
    (e) => e.username.toLowerCase() === normalizedUser && e.duration === duration
  );

  let isNewRecord = false;
  let previousBestWpm = 0;
  let savedEntry: LeaderboardEntry;

  if (existingIndex >= 0) {
    const existing = all[existingIndex];
    previousBestWpm = existing.wpm;

    if (wpm > existing.wpm || (wpm === existing.wpm && accuracy > existing.accuracy)) {
      isNewRecord = true;
      savedEntry = {
        ...existing,
        username: cleanUsername,
        wpm,
        rawWpm,
        accuracy,
        correctWords,
        incorrectWords,
        correctChars,
        difficulty: input.difficulty || 'normal',
        updatedAt: new Date().toISOString(),
      };
      all[existingIndex] = savedEntry;
      saveLeaderboardToDisk(all);
    } else {
      savedEntry = existing;
    }
  } else {
    isNewRecord = true;
    savedEntry = {
      id: `lb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      username: cleanUsername,
      wpm,
      rawWpm,
      accuracy,
      correctWords,
      incorrectWords,
      correctChars,
      duration,
      difficulty: input.difficulty || 'normal',
      updatedAt: new Date().toISOString(),
    };
    all.push(savedEntry);
    saveLeaderboardToDisk(all);
  }

  const updatedList = getLeaderboard(duration);
  const rank = updatedList.findIndex((e) => e.username.toLowerCase() === normalizedUser) + 1;

  return {
    ok: true,
    isNewRecord,
    previousBestWpm,
    rank: rank > 0 ? rank : undefined,
    entry: savedEntry,
    leaderboard: updatedList,
  };
}

// Online presence management (Active within last 35 seconds)
const PRESENCE_TTL_MS = 35_000;

function getPresenceMap(): Map<string, OnlineUserPresence> {
  if (!globalForStore.__ketikKilatPresence) {
    globalForStore.__ketikKilatPresence = new Map<string, OnlineUserPresence>();
  }
  return globalForStore.__ketikKilatPresence;
}

export function updateOnlinePresence(input: {
  clientId: string;
  username: string;
  status: 'idle' | 'typing' | 'completed';
  liveWpm?: number;
  accuracy?: number;
  duration?: number;
}): OnlineUserPresence[] {
  const map = getPresenceMap();
  const now = Date.now();

  // Prune expired sessions
  for (const [key, value] of map.entries()) {
    if (now - value.lastSeen > PRESENCE_TTL_MS) {
      map.delete(key);
    }
  }

  const cleanId = (input.clientId || '').trim().slice(0, 64);
  if (cleanId) {
    const cleanName =
      (input.username || '')
        .trim()
        .replace(/[^a-zA-Z0-9_\-. ]/g, '')
        .slice(0, 22) || 'PengetikAnonim';

    map.set(cleanId, {
      clientId: cleanId,
      username: cleanName,
      status: input.status || 'idle',
      liveWpm: Math.max(0, Math.min(240, Math.round(Number(input.liveWpm) || 0))),
      accuracy: Math.max(0, Math.min(100, Math.round(Number(input.accuracy) || 100))),
      duration: [30, 60, 120].includes(Number(input.duration)) ? Number(input.duration) : 60,
      lastSeen: now,
    });
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.status === 'typing' && b.status !== 'typing') return -1;
    if (a.status !== 'typing' && b.status === 'typing') return 1;
    return b.liveWpm - a.liveWpm;
  });
}

export function getOnlineUsers(): OnlineUserPresence[] {
  const map = getPresenceMap();
  const now = Date.now();
  for (const [key, value] of map.entries()) {
    if (now - value.lastSeen > PRESENCE_TTL_MS) {
      map.delete(key);
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.status === 'typing' && b.status !== 'typing') return -1;
    if (a.status !== 'typing' && b.status === 'typing') return 1;
    return b.liveWpm - a.liveWpm;
  });
}
