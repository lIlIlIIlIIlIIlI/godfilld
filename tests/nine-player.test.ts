import { describe, expect, it } from 'vitest';
import { roomSchema } from '../shared/schemas';
import { playerCounts } from '../shared/settings';
import { createGame, applyAction } from '../server/src/game/GameEngine';
import { SQLiteStore } from '../server/src/persistence/Store';
import { RoomService } from '../server/src/rooms/RoomService';

describe('2–9 player training and room limits', () => {
  it.each(playerCounts)(
    'starts %i seats with exactly one human and preserves them on rematch',
    async (capacity) => {
      const store = new SQLiteStore(':memory:');
      try {
        await store.init();
        const service = new RoomService(store);
        const { identity } = await service.authenticate();
        let room = await service.create(
          identity,
          {
            name: '훈련',
            namePlayer: '나',
            capacity,
            difficulty: 'hard',
          },
          true,
        );
        expect(room.capacity).toBe(capacity);
        expect(room.seats).toHaveLength(capacity);
        expect(new Set(room.seats.filter((p) => p.bot).map((p) => p.name)).size).toBe(capacity - 1);
        expect(room.seats.filter((p) => !p.bot).map((p) => p.id)).toEqual([identity.id]);
        expect(room.game?.players).toHaveLength(capacity);
        expect(room.game?.players.filter((p) => p.bot).every((p) => p.difficulty === 'hard')).toBe(
          true,
        );
        await store.mutate(room.id, (r) => {
          r.game!.phase = 'FINISHED';
        });
        room = await service.command(room.id, identity, { type: 'start' });
        expect(room.game?.players).toHaveLength(capacity);
        expect(service.project(room, identity.id).game?.self?.id).toBe(identity.id);
      } finally {
        await store.close();
      }
    },
  );

  it('rejects more than nine players at both request and engine boundaries', () => {
    expect(roomSchema.safeParse({ name: '방', namePlayer: '나', capacity: 10 }).success).toBe(
      false,
    );
    expect(() =>
      createGame(
        'too-many',
        Array.from({ length: 10 }, (_, i) => ({ id: `p${i}`, name: `${i}` })),
        1,
      ),
    ).toThrow('2~9');
  });

  it('skips seven eliminated seats before returning control to a survivor', () => {
    const s = createGame(
      'skip',
      Array.from({ length: 9 }, (_, i) => ({ id: `p${i}`, name: `${i}` })),
      1,
    );
    // A completed attack can leave a stale turn order containing eliminated players.
    s.order = s.players.map((p) => p.id);
    s.orderIndex = 0;
    s.attacker = 'p0';
    s.players.slice(1, 8).forEach((p) => {
      p.dead = true;
      p.hp = 0;
    });
    const next = applyAction(s, 'p0', {
      id: 'nine-skip',
      version: s.version,
      action: { kind: 'pass' },
    });
    expect(next.attacker).toBe('p8');
    expect(next.phase).toBe('ATTACK_SELECTION');
  });
});
