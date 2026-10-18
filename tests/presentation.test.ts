import { afterEach, describe, expect, it, vi } from 'vitest';
import { battleCues, BattlePresentation } from '../client/src/presentation';
import { createGame, viewFor } from '../server/src/game/GameEngine';
import type { GameEvent } from '../shared/types';

const game = () =>
  viewFor(
    createGame(
      'presentation',
      [
        { id: 'a', name: '가' },
        { id: 'b', name: '나' },
      ],
      7,
    ),
    'a',
  );
const event = (seq: number, type: string, amount?: number): GameEvent => ({
  seq,
  turn: 1,
  type,
  target: 'b',
  amount,
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('server event presentation', () => {
  it('uses actual damage after summon absorption and never invents a death', () => {
    const cues = battleCues([
      event(1, 'demon', 10),
      event(2, 'summon_damage', 7),
      event(3, 'damage', 3),
      event(4, 'revive', 20),
    ]);
    expect(cues.map((c) => c.kind)).toEqual(['demon', 'damage']);
    expect(cues[1]).toMatchObject({ amount: 3, demonDamage: 10, target: 'b' });
    expect(battleCues([event(5, 'damage', 0), event(6, 'block')])).toEqual([]);
  });
  it('does not label a later ordinary attack as another demon hit', () => {
    const cues = battleCues([
      event(1, 'demon', 10),
      event(2, 'damage', 10),
      event(3, 'damage', 5),
      event(4, 'death'),
    ]);
    expect(cues[1].demonDamage).toBe(10);
    expect(cues[2].demonDamage).toBeUndefined();
    expect(cues[3].demonDamage).toBeUndefined();
  });
  it('only shows ascension for the explicit server death event', () => {
    expect(battleCues([event(1, 'damage', 99)]).map((c) => c.kind)).toEqual(['damage']);
    expect(battleCues([event(2, 'death')])).toEqual([
      { kind: 'death', seq: 2, target: 'b', demonDamage: undefined },
    ]);
  });
  it('does not replay historical damage when joining or reconnecting', () => {
    vi.useFakeTimers();
    const g = game();
    g.version = 20;
    g.events.push(event(50, 'damage', 10));
    const changed = vi.fn(),
      p = new BattlePresentation(changed);
    p.sync(g);
    vi.runAllTimers();
    expect(p.current).toBeNull();
    expect(changed).not.toHaveBeenCalled();
  });
  it('plays new events in order and ignores repeated snapshots', () => {
    vi.useFakeTimers();
    const g = game();
    g.version = 1;
    const p = new BattlePresentation(vi.fn());
    p.sync(g);
    const seq = g.events.at(-1)!.seq;
    g.version++;
    g.events.push(event(seq + 1, 'damage', 10), event(seq + 2, 'death'));
    p.sync(g);
    p.sync(g);
    expect(p.current?.kind).toBe('damage');
    vi.advanceTimersByTime(1100);
    expect(p.current?.kind).toBe('death');
    vi.advanceTimersByTime(1100);
    expect(p.current).toBeNull();
    p.sync(g);
    expect(p.current).toBeNull();
  });
  it('cancels old callbacks and cues on room exit', () => {
    vi.useFakeTimers();
    const changed = vi.fn(),
      p = new BattlePresentation(changed);
    p.sync(game());
    expect(p.current?.kind).toBe('start');
    p.reset();
    vi.runAllTimers();
    expect(p.current).toBeNull();
    expect(changed).not.toHaveBeenCalled();
  });
  it('starts a rematch with a fresh sequence and leaves server data unchanged', () => {
    vi.useFakeTimers();
    const changed = vi.fn(),
      p = new BattlePresentation(changed, () => false),
      g = game();
    g.version = 10;
    p.sync(g);
    const rematch = game(),
      before = JSON.stringify(rematch);
    p.sync(rematch);
    expect(p.current?.kind).toBe('start');
    vi.advanceTimersByTime(200);
    expect(p.current).toBeNull();
    expect(changed).toHaveBeenCalledOnce();
    expect(JSON.stringify(rematch)).toBe(before);
  });
  it('bounds visual lag from large AI chains while keeping the latest death', () => {
    vi.useFakeTimers();
    const p = new BattlePresentation(vi.fn()),
      g = game();
    g.version = 1;
    p.sync(g);
    const seq = g.events.at(-1)!.seq;
    for (let i = 1; i <= 200; i++) g.events.push(event(seq + i, 'damage', 1));
    g.events.push(event(seq + 201, 'death'));
    g.version++;
    p.sync(g);
    const shown: string[] = [];
    while (p.current) {
      shown.push(p.current.kind);
      vi.advanceTimersByTime(1100);
    }
    expect(shown.length).toBeLessThanOrEqual(8);
    expect(shown.at(-1)).toBe('death');
  });
});
