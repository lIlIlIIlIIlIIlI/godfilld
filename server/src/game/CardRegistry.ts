import { card, cards } from '../../../shared/catalog';
import type { GameState, Player, Piece, CardDefinition } from '../../../shared/types';
import { random, weighted, choose } from './Random';
import { emit, requireRule, uid } from './State';
export { card, cards };
export const drawPool = cards.filter((c) => c.weight > 0);
export function draw(s: GameState, p: Player, count: number) {
  for (let i = 0; i < count; i++) {
    if (p.dead || p.hp === 0 || p.hand.length + p.abilities.length >= s.rules.capacity) break;
    give(s, p, weighted(s, drawPool).id);
  }
}
export function give(s: GameState, p: Player, id: number) {
  if (p.hand.length + p.abilities.length >= s.rules.capacity) return false;
  const c = card(id),
    piece: Piece = { uid: uid(s), cardId: id };
  if (p.harms.includes('ILLUSION') && !['MAGIC', 'TRADE'].includes(c.type) && random(s) < 0.5) {
    const alternatives = drawPool.filter(
      (x) =>
        x.type === c.type &&
        x.defenseKind === c.defenseKind &&
        x.attribute === c.attribute &&
        x.hitRate > 0 === c.hitRate > 0 &&
        x.attackExtra === c.attackExtra &&
        x.defenseExtra === c.defenseExtra,
    );
    piece.displayId = choose(s, alternatives.length ? alternatives : [c]).id;
  }
  p.hand.push(piece);
  emit(s, 'draw', { target: p.id, amount: 1 });
  return true;
}
export function owned(
  p: Player,
  refs: string[],
): { piece: Piece; card: CardDefinition; ability: boolean }[] {
  requireRule(new Set(refs).size === refs.length, '같은 카드를 두 번 사용할 수 없습니다.');
  return refs.map((ref) => {
    const piece = [...p.hand, ...p.abilities].find((x) => x.uid === ref);
    requireRule(piece, '보유하지 않은 카드입니다.');
    return { piece, card: card(piece.cardId), ability: p.abilities.includes(piece) };
  });
}
export function consume(s: GameState, p: Player, refs: string[], defense = false) {
  const list = owned(p, refs);
  for (let i = 0; i < list.length; i++) {
    const { piece, card: c, ability } = list[i];
    const free = list[i + 1]?.card.attackExtra === 'MAGIC_FREE' && c.type === 'MAGIC';
    if (c.attackExtra === 'MAGIC_FREE' && i > 0 && list[i - 1].card.type === 'MAGIC') {
      requireRule(!ability, '면제 카드는 일반 카드여야 합니다.');
      p.hand = p.hand.filter((x) => x.uid !== piece.uid);
      p.refill++;
      continue;
    }
    if (c.type === 'MAGIC') {
      requireRule(free || p.mp >= c.subValue, 'MP가 부족합니다.');
      if (!free) p.mp -= c.subValue;
      if (!ability) {
        p.hand = p.hand.filter((x) => x.uid !== piece.uid);
        delete piece.displayId;
        p.abilities.push(piece);
        emit(s, 'miracle_learned', { actor: p.id, cards: [c.id] });
      }
    } else {
      requireRule(c.type !== 'FIXED', '고정 행동을 손패로 사용할 수 없습니다.');
      p.hand = p.hand.filter((x) => x.uid !== piece.uid);
      p.refill++;
    }
  }
  emit(s, defense ? 'defense_cards' : 'use_cards', {
    actor: p.id,
    cards: list.map((x) => x.card.id),
  });
  return list.map((x) => x.card);
}
