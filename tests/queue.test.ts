import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoomService } from '../server/src/rooms/RoomService';
import { SQLiteStore } from '../server/src/persistence/Store';
import { waitingActor } from '../server/src/ai/BotController';
import { give } from '../server/src/game/CardRegistry';
const options = {
  name: '입장과 참가 검사',
  namePlayer: '방장',
  capacity: 2,
  mode: 'ffa',
  difficulty: 'normal',
};
const stores: SQLiteStore[] = [];
async function setup() {
  const store = new SQLiteStore(':memory:');
  stores.push(store);
  await store.init();
  const service = new RoomService(store);
  const host = (await service.authenticate(undefined, '방장')).identity;
  const guest = (await service.authenticate(undefined, '친구')).identity;
  const room = await service.create(host, options);
  return { service, store, host, guest, room };
}
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(stores.splice(0).map((s) => s.close()));
});
describe('separate room presence and player queue', () => {
  it('enters an empty room, then enqueues explicitly and cancels without leaving', async () => {
    const { service, store, host, guest, room } = await setup();
    expect(room.seats).toHaveLength(0);
    await service.join(room.id, guest);
    expect((await service.snapshot(room.id, guest.id))?.members.map((p) => p.queued)).toEqual([
      false,
      false,
    ]);
    expect((await service.list())[0].count).toBe(0);
    await expect(service.command(room.id, guest, { type: 'ready', ready: true })).rejects.toThrow(
      '먼저 참가',
    );
    let r = await service.command(room.id, guest, { type: 'chooseTeam', team: 'SINGLE' });
    expect(r.seats.map((p) => p.id)).toEqual([guest.id]);
    r = await service.command(room.id, guest, { type: 'chooseTeam', team: 'SINGLE' });
    expect(r.seats).toHaveLength(1);
    r = await service.command(room.id, guest, { type: 'cancelQueue' });
    expect(r.seats).toHaveLength(0);
    expect((await service.snapshot(room.id, guest.id))?.members).toHaveLength(2);
    await service.command(room.id, host, { type: 'leave' });
    expect((await store.get(room.id))?.host).toBe(guest.id);
    await service.command(room.id, guest, { type: 'leave' });
    expect(await store.get(room.id)).toBeNull();
  });
  it('locks the queue mode at the first choice and resets ready only on a real team change', async () => {
    const { service, host, guest, room } = await setup();
    await service.join(room.id, guest);
    await service.command(room.id, guest, { type: 'chooseTeam', team: 'C' });
    await expect(
      service.command(room.id, host, { type: 'chooseTeam', team: 'SINGLE' }),
    ).rejects.toThrow('대기열');
    await service.command(room.id, host, { type: 'chooseTeam', team: 'A' });
    await service.command(room.id, guest, { type: 'ready', ready: true });
    let r = await service.command(room.id, guest, { type: 'chooseTeam', team: 'C' });
    expect(r.seats.find((p) => p.id === guest.id)?.ready).toBe(true);
    r = await service.command(room.id, guest, { type: 'chooseTeam', team: 'B' });
    expect(r.seats.find((p) => p.id === guest.id)?.ready).toBe(false);
  });
  it('allows room entry when the queue is full and rejects racing queue requests atomically', async () => {
    const { service, store, host, guest, room } = await setup();
    await service.join(room.id, guest);
    const third = (await service.authenticate(undefined, '셋째')).identity;
    await service.join(room.id, third);
    await service.command(room.id, host, { type: 'chooseTeam', team: 'SINGLE' });
    const results = await Promise.allSettled(
      [guest, third].map((p) =>
        service.command(room.id, p, { type: 'chooseTeam', team: 'SINGLE' }),
      ),
    );
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const r = (await store.get(room.id))!;
    expect(r.seats).toHaveLength(2);
    expect(r.visitors).toHaveLength(1);
    expect(new Set([...r.seats, ...r.visitors!].map((p) => p.id)).size).toBe(3);
  });
  it('starts only queued players and keeps the unqueued host out of private hands', async () => {
    const { service, host, guest, room } = await setup();
    await service.join(room.id, guest);
    const third = (await service.authenticate(undefined, '셋째')).identity;
    await service.join(room.id, third);
    for (const p of [guest, third]) {
      await service.command(room.id, p, { type: 'chooseTeam', team: 'SINGLE' });
      await service.command(room.id, p, { type: 'ready', ready: true });
    }
    const r = await service.command(room.id, host, { type: 'start' });
    expect(r.game?.players.map((p) => p.id).sort()).toEqual([guest.id, third.id].sort());
    expect((await service.snapshot(room.id, host.id))?.game?.self).toBeNull();
    expect((await service.snapshot(room.id, guest.id))?.game?.self?.hand).toHaveLength(10);
    await expect(
      service.command(room.id, host, {
        type: 'action',
        envelope: { id: 'outsider-action', version: 0, action: { kind: 'pass' } },
      }),
    ).rejects.toThrow('대기열');
    await expect(service.command(room.id, guest, { type: 'cancelQueue' })).rejects.toThrow(
      '대전 중',
    );
  });
  it('keeps an unqueued visitor alive through heartbeat and expires only abandoned rooms', async () => {
    let now = 1000000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { service, store, host, room } = await setup();
    now += 100000;
    await service.command(room.id, host, { type: 'heartbeat' });
    now += 100000;
    await service.cleanup();
    expect((await store.get(room.id))?.seats).toEqual([]);
    now += 20001;
    await service.cleanup();
    expect(await store.get(room.id)).toBeNull();
  });
  it('reconnects an unqueued visitor without silently entering the queue', async () => {
    const { service, host, room } = await setup();
    const r = await service.join(room.id, host);
    expect(r.seats).toHaveLength(0);
    expect(r.visitors).toHaveLength(1);
    expect((await service.snapshot(room.id, host.id))?.members[0].queued).toBe(false);
  });
  it('accepts older persisted rooms without a visitors field as existing queued players', async () => {
    const { service, store, host } = await setup();
    const legacy = await service.create(host, options, true);
    await store.mutate(legacy.id, (r) => {
      delete r.visitors;
    });
    expect((await service.join(legacy.id, host)).seats).toHaveLength(4);
    expect((await service.snapshot(legacy.id, host.id))?.game?.self?.hand).toHaveLength(10);
  });
});
describe('authoritative turn deadlines', () => {
  it('does not extend the acting player clock when another player leaves', async () => {
    let now = 1000000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { service, host, guest, room } = await setup();
    await service.join(room.id, guest);
    for (const p of [host, guest]) {
      await service.command(room.id, p, { type: 'chooseTeam', team: 'SINGLE' });
      await service.command(room.id, p, { type: 'ready', ready: true });
    }
    const started = await service.command(room.id, host, { type: 'start' });
    const other = [host, guest].find((p) => p.id !== waitingActor(started.game!))!;
    now += 10000;
    const left = await service.command(room.id, other, { type: 'leave' });
    expect(left.deadline).toBe(started.deadline);
    expect(left.turnStartedAt).toBe(started.turnStartedAt);
  });
  it('gives the defender a fresh deadline after the attacker submits cards', async () => {
    let now = 1000000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { service, store, host, guest, room } = await setup();
    await service.join(room.id, guest);
    for (const p of [host, guest]) {
      await service.command(room.id, p, { type: 'chooseTeam', team: 'SINGLE' });
      await service.command(room.id, p, { type: 'ready', ready: true });
    }
    let r = await service.command(room.id, host, { type: 'start' });
    const actor = [host, guest].find((p) => p.id === waitingActor(r.game!))!;
    const target = [host, guest].find((p) => p.id !== actor.id)!;
    r = await store.mutate(room.id, (r) => {
      r.game!.players.forEach((p) => {
        p.hand = [];
        p.abilities = [];
      });
      give(
        r.game!,
        r.game!.players.find((p) => p.id === actor.id)!,
        36,
      );
    });
    const piece = r.game!.players.find((p) => p.id === actor.id)!.hand[0];
    now += 20000;
    r = await service.command(room.id, actor, {
      type: 'action',
      envelope: {
        id: 'phase-attack',
        version: r.game!.version,
        action: { kind: 'attack', pieces: [piece.uid], target: target.id },
      },
    });
    expect(r.game?.phase).toBe('DEFENSE_SELECTION');
    expect(r.deadline).toBe(now + 60000);
    expect(service.project(r, target.id).timer).toMatchObject({
      actor: target.id,
      startedAt: now,
      durationMs: 60000,
      deadline: now + 60000,
    });
    now += 10000;
    r = await service.command(room.id, target, {
      type: 'action',
      envelope: {
        id: 'phase-defense',
        version: r.game!.version,
        action: { kind: 'defend', pieces: [] },
      },
    });
    expect(r.game?.version).toBe(2);
    expect(r.deadline).toBe(now + 60000);
  });
  it('preserves a running deadline on heartbeat/reconnect and advances an expired turn exactly once', async () => {
    let now = 1000000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { service, store, host, guest, room } = await setup();
    await service.join(room.id, guest);
    for (const p of [host, guest]) {
      await service.command(room.id, p, { type: 'chooseTeam', team: 'SINGLE' });
      await service.command(room.id, p, { type: 'ready', ready: true });
    }
    let r = await service.command(room.id, host, { type: 'start' });
    const actor = [host, guest].find((p) => p.id === waitingActor(r.game!))!;
    const deadline = r.deadline;
    expect(r.turnDurationMs).toBe(60000);
    now += 10000;
    await service.command(room.id, actor, { type: 'heartbeat' });
    r = await service.join(room.id, actor);
    expect(r.deadline).toBe(deadline);
    now = deadline;
    await expect(
      service.command(room.id, actor, {
        type: 'action',
        envelope: { id: 'late-turn-command', version: r.game!.version, action: { kind: 'pass' } },
      }),
    ).rejects.toThrow('시간');
    expect((await store.get(room.id))?.game?.version).toBe(0);
    await Promise.all([service.tick(room.id), service.tick(room.id)]);
    r = (await store.get(room.id))!;
    expect(r.game?.version).toBe(1);
    expect(r.commands).toHaveLength(1);
    expect(r.deadline).toBeGreaterThan(now);
  });
});
