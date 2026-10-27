import { NextRequest, NextResponse } from 'next/server';
import { getOnlineUsers, updateOnlinePresence } from '@/lib/serverStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const users = getOnlineUsers();
  return NextResponse.json({
    onlineCount: users.length,
    users,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const users = updateOnlinePresence({
      clientId: String(body.clientId || ''),
      username: String(body.username || 'PengetikAnonim'),
      status: body.status === 'typing' || body.status === 'completed' ? body.status : 'idle',
      liveWpm: Number(body.liveWpm || 0),
      accuracy: Number(body.accuracy || 100),
      duration: Number(body.duration || 60),
    });

    return NextResponse.json({
      onlineCount: users.length,
      users,
    });
  } catch {
    const users = getOnlineUsers();
    return NextResponse.json({
      onlineCount: users.length,
      users,
    });
  }
}
