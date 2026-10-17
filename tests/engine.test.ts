import { describe, it, expect } from 'vitest';
import {
  createGame,
  applyAction,
  handleDeaths,
  viewFor,
  pump,
} from '../server/src/game/GameEngine';
import { give, draw, cards, owned } from '../server/src/game/CardRegistry';
import { canDefend } from '../server/src/game/Rules';
import { addStatus, tickStatus, cleanse } from '../server/src/game/StatusEffectEngine';
import { payForced } from '../server/src/game/TradeManager';
import { mysteryResolvers, summon } from '../server/src/game/CardEffectResolver';
import { botStep, waitingActor } from '../server/src/ai/BotController';
import { evaluateAttack } from '../server/src/ai/ActionEvaluator';
import { summonAction } from '../server/src/game/SummonManager';
import { damage } from '../server/src/game/State';
import type { GameState, Action, Attack } from '../shared/types';
function game(n = 2) {
  const s = createGame(
    'test',
    Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `사람${i}`, bot: true })),
    123,
    { doomAt: 1000 },
  );
  for (const p of s.players) {
    p.hand = [];
    p.abilities = [];
  }
  s.attacker = 'p0';
  return s;
}
function deal(s: GameState, i: number, ids: number[]) {
  const before = s.players[i].hand.length;
  for (const id of ids) give(s, s.players[i], id);
  return s.players[i].hand.slice(before).map((p) => p.uid);
}
function act(s: GameState, id: string, action: Action) {
  return applyAction(s, id, { id: `action-${s.version}`, version: s.version, action });
}
function attack(s: GameState, ids: number[], target = 'p1') {
  const pieces = deal(s, 0, ids);
  return act(s, 'p0', { kind: 'attack', pieces, target });
}
function defend(s: GameState, ids: number[] = []) {
  const i = s.players.findIndex((p) => p.id === s.current!.target),
    pieces = deal(s, i, ids);
  return act(s, s.players[i].id, { kind: 'defend', pieces });
}
describe('data and dealing', () => {
  it('preserves every CSV row and excludes zero weights', () => {
    expect(cards).toHaveLength(364);
    expect(cards.filter((c) => c.weight > 0)).toHaveLength(244);
  });
  it('starts with exact stats and 10 pieces', () => {
    const s = createGame(
      'a',
      [
        { id: 'a', name: '가' },
        { id: 'b', name: '나' },
      ],
      1,
    );
    expect(
      s.players.every((p) => p.hp === 40 && p.mp === 10 && p.gold === 20 && p.hand.length === 10),
    ).toBe(true);
  });
  it('never exceeds combined capacity', () => {
    const s = game();
    s.players[0].abilities = Array.from({ length: 8 }, (_, i) => ({ uid: `m${i}`, cardId: 197 }));
    draw(s, s.players[0], 100);
    expect(s.players[0].hand.length).toBe(8);
    expect(s.players[0].hand.every((p) => cards[p.cardId].weight > 0)).toBe(true);
  });
  it('creates distinct instance identifiers', () => {
    const s = game();
    deal(s, 0, [5, 5]);
    expect(new Set(s.players[0].hand.map((p) => p.uid)).size).toBe(2);
  });
});
describe('combat and validation', () => {
  it('ordinary damage, defense and refill', () => {
    let s = attack(game(), [36]);
    expect(s.phase).toBe('DEFENSE_SELECTION');
    s = defend(s, [149]);
    expect(s.players[1].hp).toBe(35);
    expect(s.players[0].hand).toHaveLength(1);
  });
  it('multiple defense cards sum before damage', () => {
    let s = attack(game(), [36]);
    s = defend(s, [149, 149]);
    expect(s.players[1].hp).toBe(40);
  });
  it('additive combination sums once', () => {
    let s = attack(game(), [36, 44]);
    expect(s.current?.damage).toBe(21);
    s = defend(s);
    expect(s.players[1].hp).toBe(19);
  });
  it('doubles after addition and pays MP', () => {
    let s = attack(game(), [36, 44, 214]);
    expect(s.current?.damage).toBe(42);
    expect(s.players[0].mp).toBe(4);
  });
  it('area attacks offer independent defense', () => {
    let s = attack(game(4), [100]);
    const targets = new Set<string>();
    while (s.phase === 'DEFENSE_SELECTION') {
      targets.add(s.current!.target);
      s = defend(s);
    }
    expect(s.events.filter((e) => e.type === 'attack' || e.type === 'miss')).toHaveLength(3);
    expect(targets.size).toBeGreaterThan(0);
  });
  it('dark cloud forces probabilistic hit', () => {
    const s = game();
    s.players[1].harms = ['DARK_CLOUD'];
    expect(attack(s, [101]).current?.target).toBe('p1');
  });
  it('dark damage kills only after HP damage', () => {
    let s = attack(game(), [63]);
    s = defend(s);
    expect(s.players[1].dead).toBe(true);
    expect(s.phase).toBe('FINISHED');
  });
  it('summon shields dark damage without killing owner', () => {
    const s = game();
    s.players[1].summon = { type: 'MARS', hp: 20 };
    let n = attack(s, [63]);
    n = defend(n);
    expect(n.players[1].hp).toBe(40);
    expect(n.players[1].dead).toBe(false);
  });
  it('full dark defense survives', () => {
    let s = attack(game(), [63]);
    s = defend(s, [120]);
    expect(s.players[1].hp).toBe(40);
  });
  it('rejects wrong attribute without mutation', () => {
    const s = attack(game(), [58]);
    const refs = deal(s, 1, [122]);
    const before = JSON.stringify(s);
    expect(() => act(s, 'p1', { kind: 'defend', pieces: refs })).toThrow();
    expect(JSON.stringify(s)).toBe(before);
  });
  it('universal reflection creates another defense phase', () => {
    let s = attack(game(), [36]);
    s = defend(s, [196]);
    expect(s.current?.target).toBe('p0');
    expect(s.events.some((e) => e.type === 'reflect')).toBe(true);
    s = defend(s);
    expect(s.players[0].hp).toBe(30);
  });
  it('flick resolves through queue without additional defense', () => {
    let s = attack(game(), [36]);
    s = defend(s, [20]);
    expect(s.events.some((e) => e.type === 'flick')).toBe(true);
    expect(s.current).toBe(null);
  });
  it('counter scales by unblocked damage', () => {
    let s = attack(game(), [36]);
    s = defend(s, [190]);
    expect(s.current?.damage).toBe(20);
    expect(s.current?.counter).toBe(true);
    s = defend(s);
    expect(s.players[0].hp).toBe(20);
  });
  it('rejects illegal followup', () => {
    const s = game(),
      refs = deal(s, 0, [36, 56]);
    expect(() => act(s, 'p0', { kind: 'attack', pieces: refs, target: 'p1' })).toThrow();
  });
  it('rejects other hand, other turn, duplicate references and missing MP', () => {
    const s = game(),
      r = deal(s, 1, [36]);
    expect(() => act(s, 'p0', { kind: 'attack', pieces: r, target: 'p1' })).toThrow();
    expect(() => act(s, 'p1', { kind: 'pass' })).toThrow();
    expect(() => owned(s.players[1], [r[0], r[0]])).toThrow();
    const refs = deal(s, 0, [226]);
    expect(() => act(s, 'p0', { kind: 'attack', pieces: refs, target: 'p1' })).toThrow();
  });
  it('duplicate ids and stale versions cannot repeat actions', () => {
    const s = game(),
      e = { id: 'same-event', version: 0, action: { kind: 'pass' as const } };
    const n = applyAction(s, 'p0', e);
    expect(() => applyAction(n, 'p0', e)).toThrow();
    expect(() =>
      applyAction(n, n.attacker, { id: 'new-event', version: 0, action: { kind: 'pass' } }),
    ).toThrow();
  });
  it('glory enforces one-card defense', () => {
    const s = attack(game(), [36]);
    s.players[1].harms = ['GLORY'];
    const refs = deal(s, 1, [120, 120]);
    expect(() => act(s, 'p1', { kind: 'defend', pieces: refs })).toThrow();
  });
  it('revives before declaring death', () => {
    const s = game();
    deal(s, 1, [244]);
    s.players[1].hp = 0;
    handleDeaths(s);
    expect(s.players[1].hp).toBe(10);
    expect(s.players[1].dead).toBe(false);
  });
  it('dying attack queues before victory', () => {
    const s = game(3);
    deal(s, 1, [117]);
    s.players[1].hp = 0;
    handleDeaths(s);
    expect(s.queue).toHaveLength(2);
    expect(s.queue.every((a) => a.damage === 30 && a.chance === 75)).toBe(true);
  });
  it('pestle finds mortar', () => {
    const s = game();
    deal(s, 1, [245]);
    const n = attack(s, [99]);
    expect(n.players[1].dead).toBe(true);
    expect(n.events.some((e) => e.type === 'damage' && e.amount === 40)).toBe(true);
  });
  it('binds then reuses a miracle without making duplicates', () => {
    let s = attack(game(), [197]);
    s = defend(s);
    expect(s.players[0].abilities).toHaveLength(1);
    expect(s.players[0].mp).toBe(8);
    s.attacker = 'p0';
    s.phase = 'ATTACK_SELECTION';
    const ability = s.players[0].abilities[0].uid;
    s = act(s, 'p0', { kind: 'attack', pieces: [ability], target: 'p1' });
    expect(s.players[0].mp).toBe(6);
    expect(s.players[0].abilities).toHaveLength(1);
  });
  it('waives immediately preceding miracle MP cost', () => {
    const s = game();
    s.players[0].mp = 0;
    const n = attack(s, [197, 239]);
    expect(n.players[0].mp).toBe(0);
    expect(n.players[0].abilities).toHaveLength(1);
  });
});
describe('attributes', () => {
  for (const [a, d, yes] of [
    ['FIRE', 'WATER', true],
    ['FIRE', 'FIRE', false],
    ['WATER', 'LIGHT', true],
    ['TREE', 'SOIL', true],
    ['SOIL', 'TREE', true],
    ['LIGHT', 'DARK', true],
    ['LIGHT', 'LIGHT', false],
    ['DARK', '', true],
    ['', '', true],
  ] as const)
    it(`${a}/${d}`, () => expect(canDefend(a, d)).toBe(yes));
});
describe('statuses, trade, summons and special events', () => {
  it('stages disease and heaven falls only on disease', () => {
    const s = game(),
      p = s.players[0];
    for (const d of ['COLD', 'COLD', 'COLD', 'COLD']) addStatus(s, p, d);
    expect(p.disease).toBe('HEAVEN');
    addStatus(s, p, 'FOG');
    expect(p.hp).toBe(40);
    addStatus(s, p, 'COLD');
    expect(p.hp).toBe(0);
  });
  it('ticks and cleanses lower statuses only', () => {
    const s = game(),
      p = s.players[0];
    s.rules.diseaseChance = 0;
    addStatus(s, p, 'HELL');
    addStatus(s, p, 'FOG');
    addStatus(s, p, 'ILLUSION');
    tickStatus(s, p);
    expect(p.hp).toBe(35);
    cleanse(s, p, true);
    expect(p.disease).toBe('HELL');
    expect(p.harms).toEqual(['ILLUSION']);
    cleanse(s, p);
    expect(p.disease).toBe('');
  });
  it('heaven heals 5 before cap', () => {
    const s = game(),
      p = s.players[0];
    p.disease = 'HEAVEN';
    s.rules.diseaseChance = 0;
    tickStatus(s, p);
    expect(p.hp).toBe(45);
  });
  it('forced debt consumes gold then MP then HP', () => {
    const p = game().players[0];
    payForced(p, 35);
    expect([p.gold, p.mp, p.hp]).toEqual([0, 0, 35]);
  });
  it('exchange preserves total and rejects negative/range overflow', () => {
    const s = game(),
      pieces = deal(s, 0, [2]);
    expect(() =>
      act(s, 'p0', {
        kind: 'attack',
        pieces,
        target: 'p0',
        exchange: { hp: 99, mp: 10, gold: 20 },
      }),
    ).toThrow();
    const n = act(s, 'p0', {
      kind: 'attack',
      pieces,
      target: 'p0',
      exchange: { hp: 60, mp: 10, gold: 0 },
    });
    expect(n.players[0].hp).toBe(60);
  });
  it('sale transfers actual owned card atomically', () => {
    let s = attack(game(), [3, 56]);
    s = defend(s);
    expect(s.players[0].gold).toBe(50);
    expect(s.players[1].gold).toBe(0);
    expect(s.players[1].mp).toBe(0);
    expect(s.players[1].hand.some((c) => c.cardId === 56)).toBe(true);
  });
  it('buy waits for confirmation and checks money', () => {
    const s = game();
    deal(s, 1, [22]);
    let n = attack(s, [4]);
    n = defend(n);
    expect(n.phase).toBe('BUY_CONFIRMATION');
    n = act(n, 'p0', { kind: 'buy', accept: true });
    expect(n.players[0].hand.some((c) => c.cardId === 22)).toBe(true);
    expect(n.players[0].gold).toBe(17);
  });
  it('summon absorbs and passes overflow', () => {
    const s = game(),
      p = s.players[0];
    summon(s, p);
    damage(s, p, 24);
    expect(p.hp).toBe(36);
    expect(p.summon).toBeNull();
  });
  for (const type of [
    'MARS',
    'MERCURY',
    'JUPITER',
    'SATURN',
    'URANUS',
    'PLUTO',
    'NEPTUNE',
    'VENUS',
    'EARTH',
    'MOON',
  ])
    it(`summon ${type} queues legal independent object`, () => {
      const s = game();
      s.players[0].summon = { type, hp: 20 };
      summonAction(s, s.players[0]);
      expect(s.queue.length).toBeGreaterThan(0);
    });
  for (const type of Object.keys(mysteryResolvers))
    it(`mystery branch ${type}`, () => {
      const s = game(4);
      draw(s, s.players[0], 10);
      s.queue.push(...mysteryResolvers[type](s, s.players[0]));
      pump(s);
      expect(s.players.every((p) => p.hp >= 0 && p.hp <= 99)).toBe(true);
    });
  it('team win retains living allies', () => {
    const s = game(4);
    s.players[0].team = 'A';
    s.players[1].team = 'A';
    s.players[2].team = 'B';
    s.players[3].team = 'B';
    s.players[2].hp = 0;
    s.players[3].hp = 0;
    pump(s);
    expect(s.winners).toEqual(['p0', 'p1']);
  });
  it('doom generates actual damage events and ends processing after game', () => {
    const s = game();
    s.rules.doomAt = 1;
    s.rules.demonChance = 1;
    s.rules.demonDamage = [5];
    const n = act(s, 'p0', { kind: 'pass' });
    expect(n.events.some((e) => e.type === 'demon')).toBe(true);
  });
});
describe('privacy and AI', () => {
  it('AI uses a counter when direct shielding is unavailable', () => {
    const s = game();
    deal(s, 1, [190]);
    let n = attack(s, [36]);
    n = botStep(n, 'p1');
    expect(n.events.some((e) => e.type === 'defense_cards' && e.cards?.includes(190))).toBe(true);
    expect(n.current?.counter).toBe(true);
  });
  it('view never includes another hand, seed, queue, or true illusion id', () => {
    const s = game();
    deal(s, 0, [36]);
    s.players[0].hand[0].displayId = 5;
    const v = viewFor(s, 'p0');
    expect(v.self?.hand[0].cardId).toBe(5);
    expect((v as any).rng).toBeUndefined();
    expect((v.players[1] as any).hand).toBeUndefined();
    expect(viewFor(s).self).toBeNull();
  });
  it('fog conceals other stats', () => {
    const s = game();
    s.players[0].harms = ['FOG'];
    expect(viewFor(s, 'p0').players[1].hp).toBeNull();
  });
  it('AI assessment is invariant to unseen enemy hand', () => {
    const s = game();
    draw(s, s.players[0], 10);
    draw(s, s.players[1], 10);
    const a = evaluateAttack(viewFor(s, 'p0'), 'hard');
    s.players[1].hand = s.players[1].hand.map((c) => ({ ...c, cardId: 244 }));
    expect(evaluateAttack(viewFor(s, 'p0'), 'hard')).toEqual(a);
  });
  it('AI heals low HP and never attacks an ally', () => {
    const s = game(3);
    s.players[0].hp = 5;
    s.players[0].team = 'A';
    s.players[1].team = 'A';
    s.players[2].team = 'B';
    deal(s, 0, [36, 229]);
    const ranked = evaluateAttack(viewFor(s, 'p0'), 'hard');
    expect(ranked[0].action.kind).toBe('attack');
    expect((ranked[0].action as any).target).toBe('p0');
  });
  it('all AI games finish deterministically', () => {
    function play(seed: number) {
      let s = createGame(
        'bots',
        Array.from({ length: 4 }, (_, i) => ({
          id: `p${i}`,
          name: `봇${i}`,
          bot: true,
          difficulty: 'hard',
        })),
        seed,
      );
      let moves = 0;
      while (s.phase !== 'FINISHED' && moves++ < 3000) s = botStep(s);
      expect(s.phase).toBe('FINISHED');
      return s;
    }
    const a = play(17),
      b = play(17);
    expect(a).toEqual(b);
  });
});
