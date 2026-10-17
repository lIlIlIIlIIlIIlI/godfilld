import { describe, it, expect } from 'vitest';
import { cards, card, give } from '../server/src/game/CardRegistry';
import { effectResolvers, mysteryResolvers } from '../server/src/game/CardEffectResolver';
import { createGame, applyAction, pump } from '../server/src/game/GameEngine';
import { validateDefense } from '../server/src/game/DefenseResolver';
import rawSummons from '../data/summons.json';
import { buildAttack } from '../server/src/game/CombatResolver';
import type { GameState } from '../shared/types';
function clean() {
  const s = createGame(
    'x',
    [
      { id: 'a', name: '가' },
      { id: 'b', name: '나' },
    ],
    1,
    { doomAt: 10000 },
  );
  s.attacker = 'a';
  for (const p of s.players) {
    p.hand = [];
    p.abilities = [];
    p.mp = 99;
  }
  return s;
}
describe('complete registry coverage', () => {
  const terminal = ['ATK', 'EXCHANGE', 'SELL', 'DO_NOTHING', 'DISCARD', 'MYSTERY'];
  for (const kind of new Set([...cards, ...rawSummons].map((c) => c.attackKind).filter(Boolean)))
    it(`attackKind ${kind} has an explicit handler`, () =>
      expect(terminal.includes(kind) || kind in effectResolvers).toBe(true));
  const handled = [
    'INCREASE_ATK',
    'DOUBLE_ATK',
    'WIDE_ATK',
    'ADD_ATTRIBUTE',
    'MAGICAL',
    'PESTLE',
    'DYING_ATTACK',
    'MAGIC_FREE',
    'ABSORB_HP',
    'DAMAGE_TO_SELF',
    'REVIVE',
    'MORTAR',
    'TO_ENEMY',
    'COLD',
    'FEVER',
    'HELL',
    'HEAVEN',
    'FOG',
    'ILLUSION',
    'GLORY',
    'DARK_CLOUD',
  ];
  for (const extra of new Set([...cards, ...rawSummons].map((c) => c.attackExtra).filter(Boolean)))
    it(`attackExtra ${extra} is supported`, () => expect(handled).toContain(extra));
  for (const c of cards.filter(
    (c) => c.type !== 'FIXED' && c.type !== 'PROTECTOR' && Boolean(c.attackKind),
  ))
    it(`card ${c.id} executes from its real data`, () => {
      const s = clean();
      give(s, s.players[0], c.id);
      if (c.attackKind === 'SELL') give(s, s.players[0], 5);
      give(s, s.players[1], 36);
      const pieces = s.players[0].hand.map((p) => p.uid);
      const action = {
        kind: 'attack' as const,
        pieces,
        target: c.targetRule === 'self' ? 'a' : 'b',
        ...(c.attackKind === 'EXCHANGE' ? { exchange: { hp: 40, mp: 99, gold: 20 } } : {}),
      };
      const n = applyAction(s, 'a', { id: 'test-card', version: 0, action });
      expect(n.version).toBe(1);
      expect(n.players.every((p) => [p.hp, p.mp, p.gold].every((x) => x >= 0 && x <= 99))).toBe(
        true,
      );
    });
  it('a death while buying cancels instead of waiting for a dead player', () => {
    const s = clean();
    s.purchase = { buyer: 'a', seller: 'b', pieceUid: 'nothing', cardId: 5, price: 1 };
    s.players[0].hp = 0;
    s.phase = 'RESOLVING';
    pump(s);
    expect(s.purchase).toBeNull();
    expect(s.phase).toBe('FINISHED');
  });
  it('summoned magical attacks never drain owner MP', () => {
    const s = clean();
    const attacks = buildAttack(s, s.players[0], [card(57)], 'b', 0, true);
    expect(attacks[0].damage).toBe(200);
    expect(s.players[0].mp).toBe(99);
  });
  it('gift cargo effects are not executed as a combination', () => {
    const s = clean(),
      gift = { ...card(246), attackKind: 'ADD_ITEM' };
    expect(() => buildAttack(s, s.players[0], [gift, card(209)], 'b', 0, true)).not.toThrow();
  });
});
