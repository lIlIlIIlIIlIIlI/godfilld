import { afterEach, describe, expect, it, vi } from 'vitest';
import { battleTiming, battleReadTime } from '../shared/battle-pacing';
import { SQLiteStore } from '../server/src/persistence/Store';
import { RoomService } from '../server/src/rooms/RoomService';
import { applyAction } from '../server/src/game/GameEngine';
import { give } from '../server/src/game/CardRegistry';

afterEach(() => vi.restoreAllMocks());

describe('readable shared battle pacing', () => {
  it('reserves sequential damage and ascension time, rather than only one short delay', () => {
    expect(
      battleReadTime([
        { seq: 1, turn: 1, type: 'damage', target: 'target', amount: 5 },
        { seq: 2, turn: 1, type: 'death', target: 'target' },
      ]),
    ).toBe(battleTiming.damage + battleTiming.death + battleTiming.settleMs);
  });

  it('holds the next AI until a lethal hit is readable and preserves that deadline on reconnect', async () => {
    let now = 1000000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const store = new SQLiteStore(':memory:');
    try {
      await store.init();
      const service = new RoomService(store);
      const { identity } = await service.authenticate();
      const created = await service.create(
        identity,
        { name: '속도 검사', namePlayer: '나', capacity: 4 },
        true,
      );
      const room = await store.mutate(created.id, (r) => {
        const g = r.game!;
        const [human, attacker, target, next] = g.players;
        for (const p of g.players) {
          p.hand = [];
          p.abilities = [];
          p.summon = null;
        }
        target.hp = 5;
        g.attacker = attacker.id;
        g.order = [attacker.id, target.id, next.id, human.id];
        g.orderIndex = 0;
        give(g, attacker, 36);
        r.game = applyAction(g, attacker.id, {
          id: 'paced-attack',
          version: g.version,
          action: { kind: 'attack', pieces: [attacker.hand[0].uid], target: target.id },
        });
        service.setDeadline(r);
      });
      expect(room.turnDurationMs).toBe(1800);
      now = room.deadline - 1;
      expect((await service.tick(room.id))?.game?.version).toBe(1);
      now++;
      const resolved = (await service.tick(room.id))!;
      expect(resolved.game?.version).toBe(2);
      expect(resolved.game?.players[2].dead).toBe(true);
      expect(resolved.turnDurationMs).toBe(
        battleTiming.damage + battleTiming.death + battleTiming.settleMs,
      );
      const deadline = resolved.deadline;
      expect((await service.join(room.id, identity)).deadline).toBe(deadline);
      expect((await new RoomService(store).snapshot(room.id, identity.id))?.timer.deadline).toBe(
        deadline,
      );
      now = deadline - 1;
      expect((await service.tick(room.id))?.game?.version).toBe(2);
      now++;
      await Promise.all([service.tick(room.id), service.tick(room.id)]);
      expect((await store.get(room.id))?.game?.version).toBe(3);
    } finally {
      await store.close();
    }
  });
});
