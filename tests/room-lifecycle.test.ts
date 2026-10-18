import { afterEach, describe, expect, it, vi } from 'vitest';
import { SQLiteStore, PostgresStore } from '../server/src/persistence/Store';
import { RoomService } from '../server/src/rooms/RoomService';

const options = { name: '수명 주기 검사', namePlayer: '방장', capacity: 4, mode: 'ffa', difficulty: 'normal' };
const stores: SQLiteStore[] = [];
async function setup() {
  const store = new SQLiteStore(':memory:');
  stores.push(store);
  await store.init();
  const service = new RoomService(store);
  const a = await service.authenticate(undefined, '방장');
  const b = await service.authenticate(undefined, '친구');
  return { store, service, a: a.identity, b: b.identity };
}
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(stores.splice(0).map((s) => s.close()));
});
describe('room lifetime', () => {
  it('deletes a waiting room when its last human leaves, including remaining bots', async () => {
    const { service, store, a } = await setup();
    const r = await service.create(a, options);
    await service.command(r.id, a, { type: 'addBot' });
    await service.command(r.id, a, { type: 'leave' });
    expect(await store.get(r.id)).toBeNull();
    expect(await service.list()).toEqual([]);
    await expect(service.join(r.id, a)).rejects.toThrow('방을 찾을 수 없습니다.');
  });
  it('deletes an abandoned practice match instead of leaving AI-only rooms forever', async () => {
    const { service, store, a } = await setup();
    const r = await service.create(a, options, true);
    await service.command(r.id, a, { type: 'leave' });
    expect(await store.get(r.id)).toBeNull();
  });
  it('keeps an active match and transfers host while another human remains', async () => {
    const { service, store, a, b } = await setup();
    const r = await service.create(a, options);
    await service.join(r.id, b);
    for (const p of [a, b]) await service.command(r.id, p, { type: 'ready', ready: true });
    await service.command(r.id, a, { type: 'start' });
    const left = await service.command(r.id, a, { type: 'leave' });
    expect(left.host).toBe(b.id);
    expect(left.seats.find((p) => p.id === a.id)?.autopilot).toBe(true);
    expect(await store.get(r.id)).not.toBeNull();
    await service.command(r.id, b, { type: 'leave' });
    expect(await store.get(r.id)).toBeNull();
  });
  it('allows a disconnected player to reconnect within two minutes with the same hand', async () => {
    let now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { service, store, a } = await setup();
    const r = await service.create(a, options, true);
    now += 90_000;
    await service.list();
    const restored = await service.join(r.id, a);
    expect(restored.game).toEqual(r.game);
    now += 90_000;
    await service.list();
    expect(await store.get(r.id)).not.toBeNull();
    now += 30_001;
    await service.list();
    expect(await store.get(r.id)).toBeNull();
  });
  it('prunes old persisted rooms and stale hosts without removing a fresh participant', async () => {
    let now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { service, store, a, b } = await setup();
    const active = await service.create(a, options);
    await service.join(active.id, b);
    const abandoned = await service.create(a, { ...options, private: true }, true);
    now += 120_001;
    await service.command(active.id, b, { type: 'heartbeat' });
    const visible = await service.list();
    expect(visible.map((r) => r.id)).toEqual([active.id]);
    expect((await store.get(active.id))?.host).toBe(b.id);
    expect((await store.get(active.id))?.seats.map((p) => p.id)).toEqual([b.id]);
    expect(await store.get(abandoned.id)).toBeNull();
  });
  it('rechecks freshness under the mutation lock so cleanup cannot erase a reconnect', async () => {
    let now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { service, store, a } = await setup();
    const r = await service.create(a, options, true);
    now += 120_001;
    const list = store.list.bind(store);
    vi.spyOn(store, 'list').mockImplementationOnce(async () => {
      const stale = await list();
      await service.join(r.id, a);
      return stale;
    });
    await service.list();
    expect((await store.get(r.id))?.seats[0].lastSeen).toBe(now);
  });
  it('deletes PostgreSQL rooms inside the same locked transaction', async () => {
    const { service, a } = await setup();
    const room = await service.create(a, options);
    const query = vi.fn(async (sql: string) => sql.includes('SELECT') ? { rows: [{ data: structuredClone(room) }] } : { rows: [] });
    const release = vi.fn();
    const store = Object.create(PostgresStore.prototype) as PostgresStore;
    store.pool = { connect: async () => ({ query, release }) } as any;
    await store.mutate(room.id, () => 'delete');
    expect(query.mock.calls.map(([sql]) => sql)).toEqual([
      'BEGIN', 'SELECT data FROM arena_rooms WHERE id=$1 FOR UPDATE',
      'DELETE FROM arena_rooms WHERE id=$1', 'COMMIT',
    ]);
    expect(release).toHaveBeenCalledOnce();
  });
  it('rolls back PostgreSQL changes and releases the lock on a rejected command', async () => {
    const { service, a } = await setup();
    const room = await service.create(a, options);
    const query = vi.fn(async (sql: string) => sql.includes('SELECT') ? { rows: [{ data: structuredClone(room) }] } : { rows: [] });
    const release = vi.fn();
    const store = Object.create(PostgresStore.prototype) as PostgresStore;
    store.pool = { connect: async () => ({ query, release }) } as any;
    await expect(store.mutate(room.id, () => { throw Error('잘못된 명령'); })).rejects.toThrow('잘못된 명령');
    expect(query.mock.calls.at(-1)?.[0]).toBe('ROLLBACK');
    expect(query.mock.calls.some(([sql]) => /DELETE|UPDATE/.test(sql) && !sql.includes('SELECT'))).toBe(false);
    expect(release).toHaveBeenCalledOnce();
  });
});
