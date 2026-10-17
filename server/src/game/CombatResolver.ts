import type { GameState, Player, Attack, Action, CardDefinition } from '../../../shared/types.js';
import { attackValue } from '../../../shared/catalog.js';
import { card, owned, consume } from './CardRegistry.js';
import { alive, enemy, requireRule, uid, player, damage, increase, emit } from './State.js';
import { choose } from './Random.js';
import { mix } from './Rules.js';
import { exchange, sell } from './TradeManager.js';
import { mystery, resolveEffect } from './CardEffectResolver.js';
import { addStatus, diseases, harms } from './StatusEffectEngine.js';
import { endgameRisk } from './EndgameManager.js';
const additions = ['INCREASE_ATK', 'DOUBLE_ATK', 'WIDE_ATK', 'ADD_ATTRIBUTE'];
export function validateCombo(list: CardDefinition[]) {
  const first = list[0];
  requireRule(
    first && first.type !== 'FIXED' && first.type !== 'PROTECTOR',
    '이 카드는 공격을 시작할 수 없습니다.',
  );
  requireRule(Boolean(first.attackKind), '추가 효과 카드는 단독으로 사용할 수 없습니다.');
  if (first.attackKind === 'SELL') {
    requireRule(list.length === 2, '판매 카드와 판매할 카드를 순서대로 골라 주세요.');
    return;
  }
  let hasMagic = first.type === 'MAGIC';
  for (let i = 1; i < list.length; i++) {
    const c = list[i];
    if (c.attackExtra === 'MAGIC_FREE' && list[i - 1].type === 'MAGIC') {
      hasMagic = true;
      continue;
    }
    requireRule(
      first.type === 'WEAPON' && first.hitRate === 0 && additions.includes(c.attackExtra),
      '조합할 수 없는 카드입니다.',
    );
    requireRule(
      !['EXCHANGE', 'SELL', 'BUY', 'MYSTERY'].includes(c.attackKind),
      '독립 행동은 조합할 수 없습니다.',
    );
    hasMagic ||= c.type === 'MAGIC';
  }
}
export function buildAttack(
  s: GameState,
  a: Player,
  defs: CardDefinition[],
  target: string,
  depth = 0,
  summoned = false,
): Attack[] {
  const first = defs[0];
  let amount = -1,
    attr: Attack['attribute'] = null,
    chance = first.hitRate,
    wide = first.hitRate > 0;
  const extras: string[] = [];
  let magical = false;
  const extraHandlers: Record<string, (c: CardDefinition) => void> = {
    INCREASE_ATK: (c) => {
      amount = Math.max(0, amount) + attackValue(c);
    },
    DOUBLE_ATK: () => {
      requireRule(amount >= 0, '두 배 기적에는 선행 공격이 필요합니다.');
      amount *= 2;
    },
    WIDE_ATK: () => {
      requireRule(amount >= 0, '광역 기적에는 선행 공격이 필요합니다.');
      wide = true;
      chance = 100;
      attr = '';
    },
    MAGICAL: () => {
      amount = summoned ? 200 : a.mp * 2;
      magical = !summoned;
    },
    PESTLE: () => {
      const bearer = alive(s).find((p) => p.hand.some((x) => x.cardId === 245));
      target = bearer?.id ?? choose(s, alive(s)).id;
      if (bearer) amount = 999;
    },
  };
  const mechanical = ['ADD_ITEM', 'SELL'].includes(first.attackKind) ? defs.slice(0, 1) : defs;
  for (let i = 0; i < mechanical.length; i++) {
    const c = mechanical[i];
    if (c.attackExtra === 'MAGIC_FREE' && i > 0 && mechanical[i - 1].type === 'MAGIC') continue;
    extraHandlers[c.attackExtra]?.(c);
    if (amount < 0 && c.attackKind === 'ATK') amount = attackValue(c);
    if (!additions.includes(c.attackExtra) && c.attackExtra) extras.push(c.attackExtra);
    attr = mix(attr, c.attribute, c.attackExtra === 'ADD_ATTRIBUTE');
  }
  if (magical) a.mp = 0;
  if (extras.includes('TO_ENEMY'))
    target = choose(
      s,
      alive(s).filter((p) => enemy(a, p)),
    ).id;
  const targets = wide
    ? alive(s)
        .filter((p) => enemy(a, p))
        .map((p) => p.id)
    : [target];
  return targets.map((id) => ({
    id: uid(s, 'a'),
    source: a.id,
    target: id,
    cards: defs,
    damage: Math.max(0, amount),
    attribute: ['SELL', 'BUY', 'REMOVE_ITEMS', 'REMOVE_ABILITIES', 'ADD_ITEM'].includes(
      first.attackKind,
    )
      ? null
      : attr,
    chance,
    extras,
    depth,
    counter: false,
    unblockable: id === a.id || (extras.includes('PESTLE') && amount === 999),
  }));
}
export function attackCommand(
  s: GameState,
  a: Player,
  action: Extract<Action, { kind: 'attack' }>,
) {
  const entries = owned(a, action.pieces),
    defs = entries.map((x) => x.card);
  validateCombo(defs);
  let target = player(s, action.target);
  requireRule(!target.dead && target.hp > 0, '살아 있는 대상을 선택해 주세요.');
  const first = defs[0];
  if (first.targetRule === 'self') requireRule(target.id === a.id, '자신에게 사용하는 카드입니다.');
  if (first.targetRule === 'other-alive')
    requireRule(target.id !== a.id, '다른 플레이어를 선택해 주세요.');
  if (a.harms.includes('FOG') && target.id !== a.id) {
    const enemies = enemy(a, target);
    target = choose(
      s,
      alive(s).filter((p) => enemy(a, p) === enemies),
    );
  }
  if (first.attackKind === 'EXCHANGE') {
    exchange(s, a, action.exchange);
    consume(s, a, action.pieces);
  } else if (first.attackKind === 'SELL') {
    requireRule(
      !entries[1].ability && !['FIXED', 'CREATURE'].includes(entries[1].card.type),
      '판매할 수 없는 카드입니다.',
    );
    requireRule(
      target.hand.length + target.abilities.length < s.rules.capacity,
      '상대 보유 공간이 가득 찼습니다.',
    );
    consume(s, a, [action.pieces[0]]);
    a.hand = a.hand.filter((x) => x.uid !== action.pieces[1]);
    a.refill++;
    s.queue.push(...buildAttack(s, a, defs, target.id));
  } else {
    consume(s, a, action.pieces);
    if (first.attackKind === 'MYSTERY') s.queue.push(...mystery(s, a));
    else s.queue.push(...buildAttack(s, a, defs, target.id));
  }
  endgameRisk(s, a, action.pieces.length);
}
export function inflict(s: GameState, atk: Attack) {
  const a = player(s, atk.source),
    b = player(s, atk.target);
  if (b.dead || b.hp <= 0) return;
  if (atk.cards[0].attackKind !== 'ATK' && atk.cards[0].attackKind !== 'MYSTERY') {
    resolveEffect(s, atk);
    return;
  }
  const n = damage(s, b, atk.damage, a.id);
  if (n > 0) {
    if (atk.attribute === 'DARK') {
      b.hp = 0;
      emit(s, 'dark_death', { actor: a.id, target: b.id });
    }
    if (atk.extras.includes('ABSORB_HP')) {
      increase(a, 'hp', n);
      emit(s, 'heal', { target: a.id, amount: n });
    }
    if (atk.extras.includes('DAMAGE_TO_SELF')) damage(s, a, n, a.id);
    for (const extra of atk.extras)
      if (diseases.includes(extra as any) || harms.includes(extra as any)) addStatus(s, b, extra);
  }
}
