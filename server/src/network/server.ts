import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { WebSocketServer, WebSocket } from 'ws';
import type { Store, Identity } from '../persistence/Store.js';
import { RoomService } from '../rooms/RoomService.js';
import { requireRule } from '../game/State.js';
import { cards } from '../../../shared/catalog.js';
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.json': 'application/json',
  '.zip': 'application/zip',
};
export async function createArenaServer(
  store: Store,
  options: { botDelay?: number; turnMs?: number; pollMs?: number } = {},
) {
  await store.init();
  const service = new RoomService(store, options.botDelay, options.turnMs);
  const root = resolve('dist');
  const http = createServer(async (req, res) => {
    try {
      const parsed = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
      const path = parsed.searchParams.has('arenaRoute')
        ? '/api/' + parsed.searchParams.get('arenaRoute')
        : parsed.pathname;
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'same-origin');
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws: wss:; media-src 'self'; frame-ancestors 'none'; base-uri 'self'",
      );
      if (path === '/api/health') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, protocol: 1, persistence: store.constructor.name }));
        return;
      }
      if (path === '/api/rooms') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(await service.list()));
        return;
      }
      if (path === '/api/cards') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(cards));
        return;
      }
      if (path.startsWith('/api/')) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      const file = resolve(root, '.' + decodeURIComponent(path === '/' ? '/index.html' : path));
      if (!file.startsWith(root + sep)) {
        res.statusCode = 403;
        res.end();
        return;
      }
      let selected = file;
      try {
        if (!(await stat(file)).isFile()) selected = resolve(root, 'index.html');
      } catch {
        selected = resolve(root, 'index.html');
      }
      res.setHeader('Content-Type', mime[extname(selected)] ?? 'application/octet-stream');
      res.setHeader(
        'Cache-Control',
        selected.endsWith('.html') ? 'no-cache' : 'public, max-age=3600',
      );
      res.end(await readFile(selected));
    } catch {
      res.statusCode = 503;
      res.end('서비스를 준비 중입니다.');
    }
  });
  const wss = new WebSocketServer({ noServer: true, maxPayload: 16384 });
  http.on('upgrade', (req, socket, head) => {
    const path = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`).pathname;
    if (!['/api/ws', '/api/server', '/api/server/ws'].includes(path)) {
      socket.destroy();
      return;
    }
    const origin = req.headers.origin;
    const allowed = (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean);
    if (origin) {
      let good = false;
      try {
        good =
          new URL(origin).host === req.headers.host ||
          allowed.includes(origin) ||
          (!process.env.VERCEL && /^http:\/\/localhost:\d+$/.test(origin));
      } catch {}
      if (!good) {
        socket.destroy();
        return;
      }
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  });
  const clients = new Map<
    WebSocket,
    {
      identity?: Identity;
      roomId?: string;
      revision: number;
      tokens: number;
      last: number;
      alive: boolean;
    }
  >();
  function send(ws: WebSocket, value: unknown) {
    if (ws.readyState === WebSocket.OPEN && ws.bufferedAmount < 1024 * 1024)
      ws.send(JSON.stringify(value));
  }
  async function publish(id: string) {
    const r = await store.get(id);
    if (!r) return;
    for (const [ws, c] of clients)
      if (c.roomId === id && c.identity && c.revision !== r.revision) {
        send(ws, { type: 'room', room: service.project(r, c.identity.id) });
        c.revision = r.revision;
      }
  }
  wss.on('connection', (ws) => {
    const c = {
      identity: undefined as Identity | undefined,
      roomId: undefined as string | undefined,
      revision: -1,
      tokens: 50,
      last: Date.now(),
      alive: true,
    };
    clients.set(ws, c);
    const authTimer = setTimeout(() => {
      if (!c.identity) ws.close(1008, '인증 시간 초과');
    }, 10000);
    authTimer.unref();
    ws.on('pong', () => {
      c.alive = true;
    });
    let chain = Promise.resolve();
    ws.on('message', (raw) => {
      chain = chain
        .then(async () => {
          const now = Date.now();
          c.tokens = Math.min(50, c.tokens + ((now - c.last) / 1000) * 5);
          c.last = now;
          if (--c.tokens < 0) {
            ws.close(1008, '요청이 너무 많습니다.');
            return;
          }
          let input: any;
          try {
            input = JSON.parse(raw.toString());
            requireRule(input && typeof input.type === 'string', '잘못된 요청입니다.');
            if (input.type === 'hello') {
              requireRule(!c.identity, '이미 연결된 세션입니다.');
              const auth = await service.authenticate(input.token, input.name);
              c.identity = auth.identity;
              send(ws, { type: 'hello', token: auth.token, id: auth.identity.id });
              send(ws, { type: 'lobby', rooms: await service.list() });
              return;
            }
            requireRule(c.identity, '먼저 세션을 연결해 주세요.');
            if (input.type === 'lobby') {
              send(ws, { type: 'lobby', rooms: await service.list() });
              return;
            }
            if (input.type === 'create' || input.type === 'practice') {
              requireRule(!c.roomId, '먼저 현재 방에서 나가 주세요.');
              const r = await service.create(c.identity, input.options, input.type === 'practice');
              c.roomId = r.id;
              c.revision = -1;
              await publish(r.id);
              return;
            }
            if (input.type === 'join') {
              const r = await service.join(
                String(input.roomId),
                c.identity,
                input.password ?? '',
                Boolean(input.spectate),
              );
              c.roomId = r.id;
              c.revision = -1;
              await publish(r.id);
              return;
            }
            requireRule(c.roomId, '참가한 방이 없습니다.');
            if (input.type === 'replay') {
              const r = await store.get(c.roomId);
              requireRule(r?.game?.phase === 'FINISHED', '경기 종료 후 기록을 볼 수 있습니다.');
              send(ws, { type: 'replay', events: r.game.events });
              return;
            }
            const r = await service.command(c.roomId, c.identity, input);
            if (input.type === 'leave') {
              const prev = c.roomId;
              c.roomId = undefined;
              c.revision = -1;
              send(ws, { type: 'left' });
              await publish(prev);
            } else await publish(r.id);
          } catch (e) {
            send(ws, {
              type: 'error',
              message: e instanceof Error ? e.message : '요청을 처리할 수 없습니다.',
            });
          }
        })
        .catch(() => {
          send(ws, { type: 'error', message: '연결 처리를 다시 시도해 주세요.' });
        });
    });
    ws.on('close', () => {
      clearTimeout(authTimer);
      clients.delete(ws);
    });
    ws.on('error', () => {});
  });
  let ticking = false;
  const timer = setInterval(async () => {
    if (ticking) return;
    ticking = true;
    try {
      const ids = new Set([...clients.values()].flatMap((c) => (c.roomId ? [c.roomId] : [])));
      for (const id of ids) {
        await service.tick(id);
        await publish(id);
      }
    } catch {
      /* Database failures do not advance in-memory state. */
    } finally {
      ticking = false;
    }
  }, options.pollMs ?? 500);
  timer.unref();
  const heartbeat = setInterval(() => {
    for (const [ws, c] of clients) {
      if (!c.alive) {
        ws.terminate();
        continue;
      }
      c.alive = false;
      ws.ping();
    }
  }, 20000);
  heartbeat.unref();
  return {
    http,
    wss,
    service,
    close: async () => {
      clearInterval(timer);
      clearInterval(heartbeat);
      for (const ws of clients.keys()) ws.terminate();
      await new Promise<void>((done) => wss.close(() => done()));
      if (http.listening) await new Promise<void>((done) => http.close(() => done()));
      await store.close();
    },
  };
}
