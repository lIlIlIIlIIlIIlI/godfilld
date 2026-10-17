import raw from '../../../data/summons.json';
import type { GameState, Player, CardDefinition } from '../../../shared/types';
import { card, drawPool } from './CardRegistry';
import { weighted, choose, random } from './Random';
import { alive, enemy } from './State';
import { buildAttack } from './CombatResolver';
const beneficial = [
  'INCREASE_MP',
  'INCREASE_HP',
  'INCREASE_YEN',
  'REMOVE_LOWER_HARMS',
  'REMOVE_ALL_HARMS',
  'ADD_ITEM',
  'SET_ASSISTANT',
];
export function summonAction(s: GameState, p: Player) {
  const summon = p.summon;
  if (!summon) return;
  let defs: CardDefinition[];
  if (summon.type === 'EARTH') {
    const c = weighted(s, drawPool);
    if (c.type !== 'MAGIC' && ['ATK', 'BUY'].includes(c.attackKind)) defs = [c];
    else if (c.attackKind === 'SELL' && c.type !== 'MAGIC') defs = [c, weighted(s, drawPool)];
    else defs = [{ ...card(246), attackKind: 'ADD_ITEM', value: 0 }, c];
  } else if (summon.type === 'MOON') {
    const c = choose(
      s,
      drawPool.filter(
        (c) => c.type === 'MAGIC' && !['FLICK_MAGIC', 'BLOCK_WEAPON'].includes(c.defenseExtra),
      ),
    );
    defs = ['WIDE_ATK', 'DOUBLE_ATK'].includes(c.attackExtra)
      ? [{ ...card(246), value: 10 }, c]
      : [c];
  } else {
    const r = weighted(
      s,
      raw.filter((x) => x.assistantType === summon.type),
    );
    defs = [
      {
        ...card(246),
        id: 1000 + r.id,
        attackKind: r.attackKind,
        attackExtra: r.attackExtra,
        attribute: r.attribute as CardDefinition['attribute'],
        value: r.value,
        hitRate: r.hitRate,
        weight: 0,
        name: { ko: `${summon.type}의 개입`, en: summon.type },
      },
    ];
  }
  const first = defs[0],
    foes = alive(s).filter((x) => enemy(p, x)),
    allies = alive(s).filter((x) => !enemy(p, x));
  const target =
    beneficial.includes(first.attackKind) && first.attackExtra !== 'HEAVEN'
      ? choose(s, allies)
      : foes.length
        ? choose(s, foes)
        : p;
  const attacks = buildAttack(s, p, defs, target.id, 0, true);
  for (const a of attacks) a.summon = summon.type;
  s.queue.push(...attacks);
}
export function summonOpportunities(s: GameState, attacker: Player) {
  for (const p of alive(s)) {
    if (p.summon && enemy(p, attacker) && random(s) < s.rules.summonChance) summonAction(s, p);
  }
}
