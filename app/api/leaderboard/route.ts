import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, submitLeaderboardScore } from '@/lib/serverStore';
import { Difficulty } from '@/types/typing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const durationParam = searchParams.get('duration');
  const duration = durationParam ? Number(durationParam) : undefined;

  const entries = getLeaderboard(duration);
  return NextResponse.json({
    leaderboard: entries,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = submitLeaderboardScore({
      username: String(body.username || ''),
      wpm: Number(body.wpm || 0),
      rawWpm: Number(body.rawWpm || 0),
      accuracy: Number(body.accuracy || 0),
      correctWords: Number(body.correctWords || 0),
      incorrectWords: Number(body.incorrectWords || 0),
      correctChars: Number(body.correctChars || 0),
      duration: Number(body.duration || 60),
      difficulty: (body.difficulty as Difficulty) || 'normal',
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, reason: 'Gagal memproses data skor leaderboard.' },
      { status: 500 }
    );
  }
}
