import type { GameState, Player, Attack, CardDefinition } from '../../../shared/types';
import { defenseValue } from '../../../shared/catalog';
import { owned, consume } from './CardRegistry';
import { emit, requireRule, uid, alive } from './State';
import { choose } from './Random';
import { canDefend, mix } from './Rules';
import { addStatus } from './StatusEffectEngine';
import { inflict, buildAttack } from './CombatResolver';
import { endgameRisk } from './EndgameManager';
export function specialDefense(c: CardDefinition, atk: Attack, s: GameState) {
  const x = c.defenseExtra;
  if (x === 'REFLECT_ANY') return true;
  const type = atk.cards[0].type;
  if (atk.counter || atk.attribute === 'DARK' || atk.attribute === null) return false;
  if (type === 'MAGIC') return /_(MAGIC)$/.test(x);
  return (
    type === 'WEAPON' &&
    /_(WEAPON)$/.test(x) &&
    canDefend(atk.attribute, c.attribute, s.rules.lightDefense)
  );
}
export function validateDefense(s: GameState, p: Player, refs: string[], atk: Attack) {
  const defs = owned(p, refs).map((x) => x.card);
  requireRule(!atk.unblockable || !refs.length, '이 공격은 방어할 수 없습니다.');
  requireRule(
    !p.harms.includes('GLORY') || refs.length <= 1,
    '섬광 상태에서는 카드 1장만 사용할 수 있습니다.',
  );
  let attr: Attack['attribute'] = null;
  let attackAttr = atk.attribute;
  let terminal = false;
  for (let i = 0; i < defs.length; i++) {
    const c = defs[i];
    if (c.attackExtra === 'MAGIC_FREE' && i > 0 && defs[i - 1].type === 'MAGIC') continue;
    requireRule(!terminal, '반사·튕겨내기·차단 카드는 조합의 마지막에 놓아 주세요.');
    requireRule(Boolean(c.defenseKind || c.defenseExtra), '방어할 수 없는 카드입니다.');
    if (c.defenseExtra === 'REMOVE_ATTRIBUTE') {
      requireRule(atk.attribute !== null, '속성이 없는 효과에는 사용할 수 없습니다.');
      attackAttr = '';
      continue;
    }
    if (specialDefense(c, { ...atk, attribute: attackAttr }, s)) {
      terminal = true;
      continue;
    }
    requireRule(!atk.counter, '반격에는 만능 반사만 사용할 수 있습니다.');
    requireRule(
      c.defenseKind === 'DFS' || c.defenseKind === 'COUNTER',
      '이 공격에 쓸 수 없는 특수 방어입니다.',
    );
    attr = mix(attr, c.attribute);
  }
  if (defs.length && !terminal && defs.some((c) => c.defenseKind))
    requireRule(
      canDefend(attackAttr, attr ?? '', s.rules.lightDefense),
      '방어 카드 조합의 속성이 맞지 않습니다.',
    );
  return defs;
}
export function defend(s: GameState, p: Player, refs: string[]) {
  const atk = s.current;
  requireRule(atk, '방어할 공격이 없습니다.');
  const defs = validateDefense(s, p, refs, atk);
  consume(s, p, refs, true);
  const resolved = structuredClone(atk);
  let redirected = false,
    blocked = false;
  for (const c of defs) {
    if (c.defenseExtra === 'REMOVE_ATTRIBUTE') {
      resolved.attribute = '';
      continue;
    }
    if (specialDefense(c, resolved, s)) {
      const x = c.defenseExtra;
      if (x.startsWith('BLOCK')) {
        blocked = true;
        emit(s, 'block', { actor: p.id, target: atk.source });
      } else {
        const flick = x.startsWith('FLICK');
        const target = flick ? choose(s, alive(s)).id : resolved.source;
        resolved.damage = atk.damage;
        resolved.source = p.id;
        resolved.target = target;
        resolved.depth++;
        resolved.unblockable = flick || target === p.id;
        resolved.chance = 0;
        redirected = true;
        emit(s, flick ? 'flick' : 'reflect', { actor: p.id, target });
      }
      break;
    }
    if (c.defenseKind === 'DFS') {
      resolved.damage = Math.max(0, resolved.damage - defenseValue(c));
      addStatus(s, p, c.defenseExtra);
    }
  }
  endgameRisk(s, p, refs.length);
  if (redirected) {
    if (resolved.depth <= s.rules.maxChain) s.queue.unshift(resolved);
    else emit(s, 'chain_limit');
  } else if (!blocked) {
    const pending: Attack[] = [];
    if (resolved.damage > 0)
      for (const c of defs.filter((c) => c.defenseKind === 'COUNTER')) {
        const n = resolved.damage * ([190, 193].includes(c.id) ? 2 : 1);
        const custom = { ...c, value: n, type: 'WEAPON' as const, hitRate: c.hitRate };
        const attacks = buildAttack(
          s,
          p,
          [custom],
          c.attackKind === 'INCREASE_MP' ? p.id : atk.source,
          atk.depth + 1,
        );
        for (const a of attacks) {
          a.counter = true;
          a.unblockable = a.target === p.id;
          if (a.depth <= s.rules.maxChain) pending.push(a);
        }
      }
    inflict(s, resolved);
    s.queue.push(...pending);
  }
  s.current = null;
}
