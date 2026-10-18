import { describe, it, expect, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { SQLiteStore } from '../server/src/persistence/Store';
import { RoomService } from '../server/src/rooms/RoomService';
import { createArenaServer } from '../server/src/network/server';
import { viewFor, createGame, applyAction } from '../server/src/game/GameEngine';
import { botStep } from '../server/src/ai/BotController';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const options = {
  name: '테스트 의회',
  namePlayer: '여행자',
  capacity: 4,
  mode: 'ffa',
  difficulty: 'normal',
  private: false,
};
describe('durable room service', () => {
  it('password, host authority, ready, capacity and private list', async () => {
    const store = new SQLiteStore(':memory:');
    await store.init();
    const service = new RoomService(store);
    const a = await service.authenticate(undefined, '가'),
      b = await service.authenticate(undefined, '나');
    const r = await service.create(a.identity, { ...options, private: true, password: 's3cret' });
    expect(await service.list()).toHaveLength(0);
    await expect(service.join(r.id, b.identity, 'wrong')).rejects.toThrow();
    await service.join(r.id, b.identity, 's3cret');
    await expect(service.command(r.id, b.identity, { type: 'addBot' })).rejects.toThrow();
    await expect(service.command(r.id, a.identity, { type: 'start' })).rejects.toThrow();
    await service.command(r.id, a.identity, { type: 'ready', ready: true });
    await service.command(r.id, b.identity, { type: 'ready', ready: true });
    const started = await service.command(r.id, a.identity, { type: 'start' });
    expect(started.game?.phase).toBe('ATTACK_SELECTION');
    await store.close();
  });
  it('restores identity, hand, phase and commands after reopening SQLite', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'arena-'));
    const path = join(dir, 'test.sqlite');
    const one = new SQLiteStore(path);
    await one.init();
    const service = new RoomService(one);
    const a = await service.authenticate(undefined, '가');
    const r = await service.create(a.identity, options, true);
    await one.close();
    const two = new SQLiteStore(path);
    await two.init();
    const next = new RoomService(two);
    const auth = await next.authenticate(a.token);
    expect(auth.identity.id).toBe(a.identity.id);
    expect((await next.snapshot(r.id, a.identity.id))?.game).toEqual(
      viewFor(r.game!, a.identity.id),
    );
    await two.close();
    await rm(dir, { recursive: true, force: true });
  });
  it('spectator cannot command and never receives a hand', async () => {
    const store = new SQLiteStore(':memory:');
    await store.init();
    const service = new RoomService(store);
    const a = await service.authenticate(),
      b = await service.authenticate();
    const r = await service.create(a.identity, options, true);
    await service.join(r.id, b.identity, '', true);
    expect((await service.snapshot(r.id, b.identity.id))?.game?.self).toBe(null);
    await expect(
      service.command(r.id, b.identity, {
        type: 'action',
        envelope: { id: 'valid-id', version: 0, action: { kind: 'pass' } },
      }),
    ).rejects.toThrow();
    await service.command(r.id, b.identity, { type: 'leave' });
    expect((await store.get(r.id))?.spectators).not.toContain(b.identity.id);
    await store.close();
  });
  it('actual AI action commands replay exactly', async () => {
    const store = new SQLiteStore(':memory:');
    await store.init();
    const service = new RoomService(store, 0, 0);
    const a = await service.authenticate();
    let r = await service.create(a.identity, options, true);
    const initial = structuredClone(r.game!);
    for (let i = 0; i < 10; i++) r = (await service.tick(r.id))!;
    let replay = initial;
    for (const command of r.commands) replay = applyAction(replay, command.actor, command.envelope);
    expect(replay).toEqual(r.game);
    await store.close();
  });
  it('AFK uses bot and reconnect restores seat without replacing hand', async () => {
    const store = new SQLiteStore(':memory:');
    await store.init();
    const service = new RoomService(store, 0, 0);
    const a = await service.authenticate();
    const b = await service.authenticate();
    let r = await service.create(a.identity, options);
    await service.join(r.id, b.identity);
    for (const p of [a, b]) await service.command(r.id, p.identity, { type: 'ready', ready: true });
    r = await service.command(r.id, a.identity, { type: 'start' });
    r = await service.command(r.id, a.identity, { type: 'leave' });
    expect(r.seats.find((p) => p.id === a.identity.id)?.autopilot).toBe(true);
    r = await service.command(r.id, a.identity, { type: 'heartbeat' });
    expect(r.seats.find((p) => p.id === a.identity.id)?.autopilot).toBe(true);
    const before = structuredClone(r.game);
    r = await service.join(r.id, a.identity);
    expect(r.seats.find((p) => p.id === a.identity.id)?.autopilot).toBe(false);
    expect(r.game).toEqual(before);
    await store.close();
  });
});
describe('real WebSocket clients', () => {
  it('eight clients receive the same game with eight isolated hands', async () => {
    const arena = await createArenaServer(new SQLiteStore(':memory:'), {
      pollMs: 10,
      turnMs: 30000,
    });
    const clients: { ws: WebSocket; messages: any[]; id: string }[] = [];
    try {
      await new Promise<void>((resolve, reject) => {
        arena.http.once('error', reject);
        arena.http.listen(0, '127.0.0.1', resolve);
      });
      const port = (arena.http.address() as { port: number }).port;
      async function wait(c: (typeof clients)[number], type: string, check = (m: any) => true) {
        const start = Date.now();
        while (Date.now() - start < 3000) {
          const i = c.messages.findIndex((m) => m.type === type && check(m));
          if (i >= 0) return c.messages.splice(i, 1)[0];
          await new Promise((r) => setTimeout(r, 5));
        }
        throw new Error('8-client response timeout');
      }
      for (let i = 0; i < 8; i++) {
        const ws = new WebSocket(`ws://127.0.0.1:${port}/api/ws`),
          c = { ws, messages: [] as any[], id: '' };
        clients.push(c);
        ws.on('message', (d) => c.messages.push(JSON.parse(d.toString())));
        await new Promise<void>((r) => ws.once('open', () => r()));
        ws.send(JSON.stringify({ type: 'hello', name: `여행자${i}` }));
        c.id = (await wait(c, 'hello')).id;
      }
      clients[0].ws.send(JSON.stringify({ type: 'create', options: { ...options, capacity: 8 } }));
      const id = (await wait(clients[0], 'room')).room.id;
      for (const c of clients.slice(1)) {
        c.ws.send(JSON.stringify({ type: 'join', roomId: id }));
        await wait(c, 'room');
      }
      for (const c of clients) c.ws.send(JSON.stringify({ type: 'ready', ready: true }));
      await wait(
        clients[0],
        'room',
        (m) => m.room.seats.length === 8 && m.room.seats.every((p: any) => p.ready),
      );
      clients[0].ws.send(JSON.stringify({ type: 'start' }));
      const games = await Promise.all(
        clients.map(async (c) => (await wait(c, 'room', (m) => Boolean(m.room.game))).room.game),
      );
      expect(games.every((g) => g.players.length === 8 && g.self.hand.length === 10)).toBe(true);
      expect(games.map((g) => g.self.id)).toEqual(clients.map((c) => c.id));
      expect(
        games.every((g) => JSON.stringify(g.players) === JSON.stringify(games[0].players)),
      ).toBe(true);
      const response = await fetch(`http://127.0.0.1:${port}/api/server?arenaRoute=health`);
      expect((await response.json()).ok).toBe(true);
    } finally {
      for (const c of clients) c.ws.terminate();
      await arena.close();
    }
  });
  it('two clients synchronize, isolate hands, reject duplicates, and resume', async () => {
    const store = new SQLiteStore(':memory:');
    const arena = await createArenaServer(store, { pollMs: 10, botDelay: 10000, turnMs: 30000 });
    const sockets: WebSocket[] = [];
    try {
      await new Promise<void>((resolve, reject) => {
        arena.http.once('error', reject);
        arena.http.listen(0, '127.0.0.1', () => resolve());
      });
      const addr = arena.http.address() as { port: number };
      const url = `ws://127.0.0.1:${addr.port}/api/ws`;
      async function client() {
        const ws = new WebSocket(url);
        sockets.push(ws);
        const messages: any[] = [];
        ws.on('message', (data) => messages.push(JSON.parse(data.toString())));
        await new Promise<void>((r) => ws.once('open', () => r()));
        return {
          ws,
          messages,
          send: (v: unknown) => ws.send(JSON.stringify(v)),
          wait: async (type: string, predicate = (x: any) => true) => {
            const start = Date.now();
            while (Date.now() - start < 3000) {
              const i = messages.findIndex((m) => m.type === type && predicate(m));
              if (i >= 0) return messages.splice(i, 1)[0];
              await new Promise((r) => setTimeout(r, 5));
            }
            throw new Error(`Timed out: ${type}`);
          },
        };
      }
      const a = await client(),
        b = await client();
      a.send({ type: 'hello', name: '가' });
      b.send({ type: 'hello', name: '나' });
      const authA = await a.wait('hello'),
        authB = await b.wait('hello');
      a.send({ type: 'create', options });
      const created = await a.wait('room');
      const roomId = created.room.id;
      b.send({ type: 'join', roomId });
      await b.wait('room');
      a.send({ type: 'ready', ready: true });
      b.send({ type: 'ready', ready: true });
      await a.wait('room', (m: any) => m.room.seats.every((p: any) => p.ready));
      a.send({ type: 'start' });
      const ga = (await a.wait('room', (m: any) => Boolean(m.room.game))).room.game,
        gb = (await b.wait('room', (m: any) => Boolean(m.room.game))).room.game;
      expect(ga.self.id).toBe(authA.id);
      expect(gb.self.id).toBe(authB.id);
      expect(ga.players).toEqual(gb.players);
      expect(ga.players.every((p: any) => !('hand' in p))).toBe(true);
      const actor = ga.attacker === authA.id ? a : b;
      const envelope = { id: 'duplicate-network-command', version: 0, action: { kind: 'pass' } };
      actor.send({ type: 'action', envelope });
      actor.send({ type: 'action', envelope });
      const updated = await actor.wait('room', (m: any) => m.room.game?.version === 1);
      expect((await actor.wait('error')).message).toContain('이미 처리');
      a.ws.close();
      const resumed = await client();
      resumed.send({ type: 'hello', token: authA.token });
      expect((await resumed.wait('hello')).id).toBe(authA.id);
      resumed.send({ type: 'join', roomId });
      const recovered = await resumed.wait('room');
      expect(recovered.room.game.version).toBe(1);
      expect(recovered.room.game.self.hand).toHaveLength(
        updated.room.game.players.find((p: any) => p.id === authA.id).handCount,
      );
      const spectator = await client();
      spectator.send({ type: 'hello', name: '관전자' });
      await spectator.wait('hello');
      spectator.send({ type: 'join', roomId, spectate: true });
      expect((await spectator.wait('room')).room.game.self).toBeNull();
      b.send({ type: 'leave' });
      await b.wait('left');
      expect(await store.get(roomId)).not.toBeNull();
      resumed.send({ type: 'leave' });
      await resumed.wait('left');
      expect((await spectator.wait('room_closed')).roomId).toBe(roomId);
      await b.wait('lobby', (m: any) => m.rooms.length === 0);
      expect(await store.get(roomId)).toBeNull();
      expect(await (await fetch(`http://127.0.0.1:${addr.port}/api/rooms`)).json()).toEqual([]);
    } finally {
      for (const ws of sockets) ws.terminate();
      await arena.close();
    }
  });
});
