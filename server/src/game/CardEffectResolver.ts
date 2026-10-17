import type { GameState, Player, Attack, CardDefinition } from '../../../shared/types.js';
import { alive, emit, increase, damage, player, enemy, uid } from './State.js';
import { choose, shuffle } from './Random.js';
import { addStatus, cleanse } from './StatusEffectEngine.js';
import { card, give } from './CardRegistry.js';
import { offerBuy, payForced } from './TradeManager.js';
export const summonTypes = [
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
];
export function summon(s: GameState, p: Player) {
  p.summon = { type: choose(s, summonTypes), hp: 20 };
  emit(s, 'summon', { target: p.id, text: p.summon.type });
}
type Context = { s: GameState; a: Player; b: Player; c: CardDefinition; attack: Attack };
export const effectResolvers: Record<string, (x: Context) => void> = {
  INCREASE_HP: ({ s, b, c }) => {
    increase(b, 'hp', c.value);
    emit(s, 'heal', { target: b.id, amount: c.value });
  },
  INCREASE_MP: ({ b, c }) => increase(b, 'mp', c.value),
  INCREASE_YEN: ({ b, c }) => increase(b, 'gold', c.value),
  ABSORB_YEN: ({ a, b, c }) => {
    payForced(b, c.value);
    increase(a, 'gold', c.value);
  },
  SCATTER_YEN: ({ s, c }) => {
    for (const p of alive(s)) increase(p, 'gold', c.value);
  },
  REMOVE_LOWER_HARMS: ({ s, b }) => cleanse(s, b, true),
  REMOVE_ALL_HARMS: ({ s, b }) => cleanse(s, b),
  ADD_HARM: ({ s, b, c }) => addStatus(s, b, c.attackExtra),
  INCREASE_OR_DECREASE_HP: ({ s, b, c }) => {
    if (choose(s, [true, false])) {
      increase(b, 'hp', c.value);
      emit(s, 'heal', { target: b.id, amount: c.value });
    } else damage(s, b, c.value);
  },
  REMOVE_ITEMS: ({ s, b }) => {
    if (b.hand.length) {
      const p = choose(s, b.hand);
      b.hand = b.hand.filter((x) => x.uid !== p.uid);
      emit(s, 'remove_card', { target: b.id, cards: [p.cardId] });
    }
  },
  REMOVE_ABILITIES: ({ s, b }) => {
    if (b.abilities.length) {
      const p = choose(s, b.abilities);
      b.abilities = b.abilities.filter((x) => x.uid !== p.uid);
      emit(s, 'forget', { target: b.id, cards: [p.cardId] });
    }
  },
  SET_ASSISTANT: ({ s, b }) => summon(s, b),
  BUY: ({ s, a, b }) => offerBuy(s, a, b),
  SELL: ({ s, a, b, attack }) => {
    const c = attack.cards[1];
    if (c && give(s, b, c.id)) {
      payForced(b, c.price);
      increase(a, 'gold', c.price);
      emit(s, 'sell', { actor: a.id, target: b.id, cards: [c.id], amount: c.price });
    }
  },
  ADD_ITEM: ({ s, b, attack }) => {
    if (attack.cards[1]) give(s, b, attack.cards[1].id);
  },
};
export function resolveEffect(s: GameState, attack: Attack) {
  const a = player(s, attack.source),
    b = player(s, attack.target),
    c = attack.cards[0];
  effectResolvers[c.attackKind]?.({ s, a, b, c, attack });
  if (c.attackKind === 'INCREASE_MP' && c.attackExtra) addStatus(s, b, c.attackExtra);
}
export const mysteryResolvers: Record<string, (s: GameState, a: Player) => Attack[]> = {
  MARS: (s) => {
    for (const p of alive(s)) {
      p.disease = 'FEVER';
      p.worseChance = 0;
      emit(s, 'status', { target: p.id, text: 'FEVER' });
    }
    return [];
  },
  MERCURY: (s) => {
    for (const p of alive(s)) addStatus(s, p, 'FOG');
    return [];
  },
  JUPITER: (s) => {
    for (const p of alive(s)) addStatus(s, p, 'ILLUSION');
    return [];
  },
  SATURN: (s) => {
    for (const p of alive(s)) p.hp = 1;
    return [];
  },
  URANUS: (s, a) => [mysteryAttack(s, a, choose(s, alive(s)), 60, 'LIGHT', 0)],
  PLUTO: (s, a) =>
    alive(s)
      .filter((p) => enemy(a, p))
      .map((p) => mysteryAttack(s, a, p, 30, 'DARK', 75)),
  NEPTUNE: (s, a) => {
    increase(a, 'hp', 60);
    emit(s, 'heal', { target: a.id, amount: 60 });
    return [];
  },
  VENUS: (s) => {
    for (const p of alive(s)) p.gold = 99;
    return [];
  },
  EARTH: (s) => {
    const people = alive(s),
      counts = people.map((p) => p.hand.length),
      pool = shuffle(
        s,
        people.flatMap((p) => p.hand),
      );
    for (let i = 0; i < people.length; i++) {
      people[i].hand = pool.splice(0, counts[i]);
      for (const p of people[i].hand) delete p.displayId;
    }
    return [];
  },
  MOON: (s) => {
    for (const p of alive(s)) summon(s, p);
    return [];
  },
};
function mysteryAttack(
  s: GameState,
  a: Player,
  b: Player,
  n: number,
  attr: Attack['attribute'],
  chance: number,
): Attack {
  return {
    id: uid(s, 'a'),
    source: a.id,
    target: b.id,
    cards: [card(243)],
    damage: n,
    attribute: attr,
    chance,
    extras: [],
    depth: 0,
    counter: false,
    unblockable: a.id === b.id,
  };
}
export function mystery(s: GameState, a: Player) {
  const kind = choose(s, summonTypes);
  emit(s, 'mystery', { actor: a.id, text: kind });
  return mysteryResolvers[kind](s, a);
}
