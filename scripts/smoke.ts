import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { WebSocket } from 'ws';
import { maxPlayers } from '../shared/settings.js';

// Runs against a real deployment. Creates a private test room and removes it on exit.
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:3000');
const health = await fetch(new URL('/api/health', base));
assert.equal(health.status, 200, 'health endpoint must be ready');
assert.equal((await health.json()).ok, true);
const source = await fetch(new URL('/source.zip', base));
assert.equal(source.status, 200, 'corresponding source must be downloadable');
assert.equal(
  Buffer.from(await source.arrayBuffer())
    .subarray(0, 2)
    .toString(),
  'PK',
);
const endpoint = new URL('/api/ws', base);
endpoint.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
type Client = { ws: WebSocket; messages: any[]; id: string; token: string };
const clients: Client[] = [];
let roomId = '';
async function wait(client: Client, type: string, accept = (_message: any) => true) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const error = client.messages.find((m) => m.type === 'error');
    if (error) throw new Error(error.message);
    const i = client.messages.findIndex((m) => m.type === type && accept(m));
    if (i >= 0) return client.messages.splice(i, 1)[0];
    await delay(20);
  }
  throw new Error(`Timed out waiting for ${type}`);
}
function send(client: Client, message: unknown) {
  client.ws.send(JSON.stringify(message));
}
async function connect(token?: string) {
  const client: Client = {
    ws: new WebSocket(endpoint, { origin: base.origin }),
    messages: [],
    id: '',
    token: '',
  };
  clients.push(client);
  client.ws.on('message', (data) => client.messages.push(JSON.parse(data.toString())));
  await new Promise<void>((resolve, reject) => {
    client.ws.once('open', resolve);
    client.ws.once('error', reject);
  });
  send(client, { type: 'hello', name: '배포 검사', ...(token ? { token } : {}) });
  const hello = await wait(client, 'hello');
  client.id = hello.id;
  client.token = hello.token;
  return client;
}
try {
  for (let i = 0; i < maxPlayers; i++) await connect();
  const host = clients[0];
  send(host, {
    type: 'create',
    options: {
      name: '배포 자동 검사',
      namePlayer: '검사 방장',
      private: true,
      capacity: maxPlayers,
    },
  });
  roomId = (await wait(host, 'room')).room.id;
  for (const c of clients.slice(1)) {
    send(c, { type: 'join', roomId });
    await wait(c, 'room');
  }
  for (const c of clients) {
    send(c, { type: 'chooseTeam', team: 'SINGLE' });
    send(c, { type: 'ready', ready: true });
  }
  await wait(
    host,
    'room',
    (m) => m.room.seats.length === maxPlayers && m.room.seats.every((p: any) => p.ready),
  );
  send(host, { type: 'start' });
  const games = await Promise.all(
    clients.map(async (c) => (await wait(c, 'room', (m) => Boolean(m.room.game))).room.game),
  );
  for (const [i, game] of games.entries()) {
    assert.equal(game.players.length, maxPlayers);
    assert.equal(game.self.id, clients[i].id);
    assert.equal(game.self.hand.length, 10);
    assert.deepEqual(game.players, games[0].players);
    assert.ok(
      game.players.every((p: any) => !('hand' in p)),
      'public players must not contain private hands',
    );
  }
  const old = clients[1];
  old.ws.terminate();
  const restored = await connect(old.token);
  assert.equal(restored.id, old.id);
  send(restored, { type: 'join', roomId });
  const recovered = (await wait(restored, 'room')).room.game;
  assert.deepEqual(recovered.self.hand, games[1].self.hand);
  console.log(
    `PASS: HTTP, source ZIP, ${maxPlayers} WebSocket players, isolated hands, token reconnect`,
  );
} finally {
  // Explicit leave deletes the private test room when the final human leaves.
  await Promise.all(
    clients
      .filter((c) => c.ws.readyState === WebSocket.OPEN)
      .map(async (c) => {
        if (!roomId) return;
        send(c, { type: 'leave' });
        await wait(c, 'left').catch(() => {});
      }),
  );
  for (const c of clients) c.ws.terminate();
}
