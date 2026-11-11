import { NextRequest, NextResponse } from 'next/server';
import {
  getOnlineUsers,
  updateOnlinePresence,
  removeOnlinePresence,
  subscribePresence,
} from '@/lib/serverStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isStream = searchParams.get('stream') === '1';
  const streamClientId = searchParams.get('clientId') || '';

  if (isStream) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        let isClosed = false;

        const sendUsers = (users = getOnlineUsers()) => {
          if (isClosed) return;
          try {
            const payload = JSON.stringify({
              onlineCount: users.length,
              users,
              ts: Date.now(),
            });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          } catch {
            isClosed = true;
          }
        };

        // Immediately send current snapshot on connect
        sendUsers();

        // Subscribe to real-time updates whenever any user joins, leaves, or types
        const unsubscribe = subscribePresence((updatedUsers) => {
          sendUsers(updatedUsers);
        });

        // Periodic prune & keepalive every 3 seconds
        const keepAliveTimer = setInterval(() => {
          if (isClosed) return;
          const current = getOnlineUsers();
          sendUsers(current);
        }, 3000);

        // Clean up and immediately remove session when tab closes / disconnects
        req.signal.addEventListener('abort', () => {
          isClosed = true;
          clearInterval(keepAliveTimer);
          unsubscribe();
          if (streamClientId) {
            removeOnlinePresence(streamClientId);
          }
          try {
            controller.close();
          } catch {
            // Ignore if already closed
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  }

  const users = getOnlineUsers();
  return NextResponse.json(
    {
      onlineCount: users.length,
      users,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clientId = String(body.clientId || '');

    if (body.action === 'leave') {
      const users = removeOnlinePresence(clientId);
      return NextResponse.json({
        onlineCount: users.length,
        users,
      });
    }

    const users = updateOnlinePresence({
      clientId,
      username: String(body.username || 'PengetikAnonim'),
      status:
        body.status === 'typing' || body.status === 'completed'
          ? body.status
          : 'idle',
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
