import type { GameState, Player, Action } from '../../../shared/types.js';
import { increase, emit, requireRule, player } from './State.js';
import { give, card } from './CardRegistry.js';
import { choose } from './Random.js';
export function payForced(p: Player, n: number) {
  const gold = Math.min(n, p.gold);
  p.gold -= gold;
  n -= gold;
  const mp = Math.min(n, p.mp);
  p.mp -= mp;
  n -= mp;
  p.hp = Math.max(0, p.hp - n);
}
export function exchange(
  s: GameState,
  p: Player,
  values: Extract<Action, { kind: 'attack' }>['exchange'],
) {
  requireRule(values, '환전할 능력치를 입력해 주세요.');
  requireRule(
    Object.values(values).every((x) => Number.isInteger(x) && x >= 0 && x <= 99) && values.hp >= 1,
    '능력치는 0~99, HP는 1 이상이어야 합니다.',
  );
  requireRule(
    values.hp + values.mp + values.gold === p.hp + p.mp + p.gold,
    '능력치 총합을 보존해야 합니다.',
  );
  Object.assign(p, values);
  emit(s, 'exchange', { actor: p.id });
}
export function sell(s: GameState, a: Player, b: Player, pieceUid: string) {
  const piece = a.hand.find((p) => p.uid === pieceUid);
  requireRule(piece, '판매할 카드가 없습니다.');
  const c = card(piece.cardId);
  requireRule(c.type !== 'FIXED' && c.type !== 'CREATURE', '판매할 수 없는 카드입니다.');
  requireRule(
    b.hand.length + b.abilities.length < s.rules.capacity,
    '상대 보유 공간이 가득 찼습니다.',
  );
  a.hand = a.hand.filter((p) => p.uid !== pieceUid);
  a.refill++;
  give(s, b, c.id);
  payForced(b, c.price);
  increase(a, 'gold', c.price);
  emit(s, 'sell', { actor: a.id, target: b.id, amount: c.price, cards: [c.id] });
}
export function offerBuy(s: GameState, a: Player, b: Player) {
  const choices = b.hand.filter((p) => !['FIXED', 'CREATURE'].includes(card(p.cardId).type));
  if (!choices.length) return;
  const piece = choose(s, choices),
    c = card(piece.cardId);
  if (a.gold < c.price || a.hand.length + a.abilities.length >= s.rules.capacity) return;
  s.purchase = { buyer: a.id, seller: b.id, pieceUid: piece.uid, cardId: c.id, price: c.price };
  s.phase = 'BUY_CONFIRMATION';
  emit(s, 'buy_offer', { actor: a.id, target: b.id });
}
export function buy(s: GameState, accept: boolean) {
  const offer = s.purchase;
  requireRule(offer, '확인할 구매 제안이 없습니다.');
  const a = player(s, offer.buyer),
    b = player(s, offer.seller),
    piece = b.hand.find((x) => x.uid === offer.pieceUid);
  if (accept) {
    requireRule(
      piece && a.gold >= offer.price && !a.dead && !b.dead,
      '구매 상태가 변경되었습니다.',
    );
    requireRule(a.hand.length + a.abilities.length < s.rules.capacity, '카드 공간이 부족합니다.');
    a.gold -= offer.price;
    increase(b, 'gold', offer.price);
    b.hand = b.hand.filter((x) => x.uid !== offer.pieceUid);
    give(s, a, offer.cardId);
    emit(s, 'buy', { actor: a.id, target: b.id, cards: [offer.cardId], amount: offer.price });
  }
  s.purchase = null;
}
