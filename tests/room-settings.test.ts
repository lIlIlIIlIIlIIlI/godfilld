import { describe, it, expect } from 'vitest';
import { cards } from '../shared/catalog';
import { roomSchema } from '../shared/schemas';
import { SQLiteStore } from '../server/src/persistence/Store';
import { RoomService } from '../server/src/rooms/RoomService';
import { applyAction } from '../server/src/game/GameEngine';
const options = {
  name: '재앙 테스트',
  namePlayer: '여행자',
  capacity: 4,
  mode: 'ffa',
  difficulty: 'normal',
};
describe('card names and room catastrophe settings', () => {
  it('gives every card a distinct Korean name without an ID placeholder', () => {
    expect(cards).toHaveLength(364);
    expect(new Set(cards.map((c) => c.name.ko)).size).toBe(364);
    for (const c of cards) {
      expect(c.name.ko).toMatch(/[가-힣]/);
      expect(c.name.ko).not.toMatch(/\d|미등록/);
    }
  });
  it.each([1, 50, 100, 500])('persists %i turns and keeps it on rematch', async (doomAt) => {
    const store = new SQLiteStore(':memory:');
    try {
      await store.init();
      const service = new RoomService(store);
      const a = await service.authenticate();
      let room = await service.create(a.identity, { ...options, doomAt }, true);
      expect(room.game?.rules.doomAt).toBe(doomAt);
      expect(service.project(room, a.identity.id).doomAt).toBe(doomAt);
      expect(room.game?.events.some((e) => e.type === 'doom_start')).toBe(doomAt === 1);
      room = await store.mutate(room.id, (r) => {
        r.game!.phase = 'FINISHED';
      });
      room = await service.command(room.id, a.identity, { type: 'start' });
      expect(room.game?.rules.doomAt).toBe(doomAt);
    } finally {
      await store.close();
    }
  });
  it('rejects arbitrary values and retains 100 for older room records', async () => {
    for (const doomAt of [0, 2, 99, 501, '50'])
      expect(roomSchema.safeParse({ ...options, doomAt }).success).toBe(false);
    expect(roomSchema.parse(options).doomAt).toBe(100);
    const store = new SQLiteStore(':memory:');
    try {
      await store.init();
      const service = new RoomService(store);
      const a = await service.authenticate();
      let r = await service.create(a.identity, options, true);
      r = await store.mutate(r.id, (room) => {
        delete room.doomAt;
        room.game!.phase = 'FINISHED';
      });
      r = await service.command(r.id, a.identity, { type: 'start' });
      expect(r.game?.rules.doomAt).toBe(100);
    } finally {
      await store.close();
    }
  });
  it('starts the catastrophe at the chosen boundary, rather than changing only its label', async () => {
    const store = new SQLiteStore(':memory:');
    try {
      await store.init();
      const service = new RoomService(store);
      const a = await service.authenticate();
      const room = await service.create(a.identity, { ...options, doomAt: 50 }, true);
      let s = structuredClone(room.game!);
      s.turn = 49;
      s = applyAction(s, s.attacker, {
        id: 'boundary-pass',
        version: s.version,
        action: { kind: 'pass' },
      });
      expect(s.turn).toBe(50);
      expect(s.events.some((e) => e.type === 'doom_start')).toBe(true);
    } finally {
      await store.close();
    }
  });
});

describe('reference waiting-room controls', () => {
  it('validates host mode/doom changes, participant team choices and live-game restrictions', async () => {
    const store = new SQLiteStore(':memory:');
    try {
      await store.init();
      const service = new RoomService(store);
      const host = (await service.authenticate()).identity;
      const guest = (await service.authenticate()).identity;
      let room = await service.create(host, options);
      await service.join(room.id, guest);
      expect(room.seats).toHaveLength(0);
      await service.command(room.id, guest, { type: 'chooseTeam', team: 'A' });
      room = await service.command(room.id, host, { type: 'chooseTeam', team: 'A' });
      expect(room.mode).toBe('team');
      room = await service.command(room.id, guest, { type: 'chooseTeam', team: 'C' });
      expect(room.seats.find((p) => p.id === guest.id)?.team).toBe('C');
      await expect(
        service.command(room.id, host, { type: 'chooseTeam', team: 'E' }),
      ).rejects.toThrow();
      await expect(service.command(room.id, guest, { type: 'doomAt', value: 50 })).rejects.toThrow(
        '방장',
      );
      await expect(service.command(room.id, host, { type: 'doomAt', value: 25 })).rejects.toThrow();
      room = await service.command(room.id, host, { type: 'doomAt', value: 50 });
      expect(service.project(room, guest.id).doomAt).toBe(50);
      await expect(
        service.command(room.id, host, { type: 'chooseTeam', team: 'SINGLE' }),
      ).rejects.toThrow('대기열');
      await service.command(room.id, host, { type: 'cancelQueue' });
      await service.command(room.id, guest, { type: 'cancelQueue' });
      room = await service.command(room.id, host, { type: 'chooseTeam', team: 'SINGLE' });
      room = await service.command(room.id, guest, { type: 'chooseTeam', team: 'SINGLE' });
      expect(room.mode).toBe('ffa');
      expect(room.seats.every((p) => p.team === 'SINGLE')).toBe(true);
      await service.command(room.id, host, { type: 'ready', ready: true });
      await service.command(room.id, guest, { type: 'ready', ready: true });
      room = await service.command(room.id, host, { type: 'start' });
      expect(room.game?.rules.doomAt).toBe(50);
      await expect(
        service.command(room.id, host, { type: 'chooseTeam', team: 'B' }),
      ).rejects.toThrow('대전 중');
      await expect(service.command(room.id, host, { type: 'doomAt', value: 100 })).rejects.toThrow(
        '대전 중',
      );
    } finally {
      await store.close();
    }
  });
});
