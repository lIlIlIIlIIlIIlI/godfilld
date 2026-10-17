import { card, attackValue, defenseValue } from '../../../shared/catalog.js';
import type {
  GameView,
  Action,
  Difficulty,
  Piece,
  CardDefinition,
  PublicPlayer,
} from '../../../shared/types.js';
import { enemy } from '../game/State.js';
import { canDefend, mix } from '../game/Rules.js';
import { validateCombo } from '../game/CombatResolver.js';
export interface ScoredAction {
  action: Action;
  score: number;
}
function exchangeValues(hp: number, mp: number, gold: number) {
  const total = hp + mp + gold;
  let h = Math.min(99, total),
    m = 0,
    g = 0;
  if (total > 45) {
    h = 45;
    m = Math.min(30, total - h);
    g = Math.min(99, total - h - m);
    h += Math.max(0, total - h - m - g);
  }
  return { hp: h, mp: m, gold: g };
}
function affordable(list: CardDefinition[], mp: number) {
  return (
    list.reduce(
      (n, c, i) =>
        n + (c.type === 'MAGIC' && list[i + 1]?.attackExtra !== 'MAGIC_FREE' ? c.subValue : 0),
      0,
    ) <= mp
  );
}
export function evaluateAttack(v: GameView, difficulty: Difficulty): ScoredAction[] {
  const self = v.self!;
  const me = v.players.find((p) => p.id === self.id)!;
  const refs = [...self.hand, ...self.abilities];
  const foes = v.players.filter((p) => !p.dead && enemy(me, p));
  const allies = v.players.filter((p) => !p.dead && !enemy(me, p));
  const ranked: ScoredAction[] = [];
  const sets: Piece[][] = refs.map((p) => [p]);
  for (const p of refs) {
    const first = card(p.cardId);
    if (first.attackKind === 'SELL')
      for (const q of self.hand.filter((x) => x.uid !== p.uid)) sets.push([p, q]);
    if (first.type === 'MAGIC')
      for (const q of self.hand.filter((x) => card(x.cardId).attackExtra === 'MAGIC_FREE'))
        sets.push([p, q]);
    if (difficulty === 'easy' || first.type !== 'WEAPON' || first.hitRate > 0) continue;
    const extras = refs.filter(
      (q) =>
        q.uid !== p.uid &&
        ['INCREASE_ATK', 'DOUBLE_ATK', 'WIDE_ATK', 'ADD_ATTRIBUTE'].includes(
          card(q.cardId).attackExtra,
        ),
    );
    for (const q of extras) sets.push([p, q]);
    if (difficulty === 'hard') {
      const best = extras
        .sort((a, b) => attackValue(card(b.cardId)) - attackValue(card(a.cardId)))
        .slice(0, 3);
      if (best.length) sets.push([p, ...best]);
      for (const q of extras.filter((x) => card(x.cardId).attackExtra === 'DOUBLE_ATK')) {
        const adds = extras
          .filter((x) => x.uid !== q.uid && card(x.cardId).attackExtra === 'INCREASE_ATK')
          .slice(0, 2);
        sets.push([p, ...adds, q]);
      }
    }
  }
  for (const set of sets) {
    const defs = set.map((p) => card(p.cardId)),
      c = defs[0];
    try {
      validateCombo(defs);
    } catch {
      continue;
    }
    if (!affordable(defs, me.mp ?? 0)) continue;
    let n = 0,
      attr: CardDefinition['attribute'] = '';
    for (let i = 0; i < defs.length; i++) {
      const d = defs[i];
      if (d.attackExtra === 'MAGIC_FREE' && i > 0 && defs[i - 1].type === 'MAGIC') continue;
      n += i === 0 ? attackValue(d) : d.attackExtra === 'INCREASE_ATK' ? attackValue(d) : 0;
      if (d.attackExtra === 'DOUBLE_ATK') n *= 2;
      if (d.attackExtra === 'MAGICAL') n = (me.mp ?? 0) * 2;
      attr = mix(i === 0 ? null : attr, d.attribute, d.attackExtra === 'ADD_ATTRIBUTE');
    }
    const helpful = [
      'INCREASE_HP',
      'INCREASE_MP',
      'INCREASE_YEN',
      'REMOVE_ALL_HARMS',
      'REMOVE_LOWER_HARMS',
      'SET_ASSISTANT',
    ].includes(c.attackKind);
    let targets = c.targetRule === 'self' ? [me] : helpful ? allies : foes;
    for (const t of targets) {
      let score = 0;
      const hp = t.hp ?? 40,
        myhp = me.hp ?? 40,
        mp = me.mp ?? 0;
      const wide = c.hitRate > 0 || defs.some((c) => c.attackExtra === 'WIDE_ATK');
      const hits = wide ? foes.length : 1;
      const chance = t.harms.includes('DARK_CLOUD') ? 1 : c.hitRate ? c.hitRate / 100 : 1;
      const blockEstimate = difficulty === 'hard' ? Math.min(0.55, t.handCount / 30) : 0.2;
      if (c.attackKind === 'ATK') {
        score = n * chance * hits * (1 - blockEstimate) + (attr ? 2 : 0);
        if (attr === 'DARK' && n > 0) score += 35 * chance;
        if (n >= hp + (t.summon?.hp ?? 0)) score += 35 * chance;
        if (c.attackExtra === 'ABSORB_HP')
          score += Math.min(n, 99 - myhp) * (myhp < 20 ? 1.4 : 0.3);
        if (c.attackExtra === 'DAMAGE_TO_SELF') score -= n * (myhp <= n ? 4 : 1);
        if (c.attackExtra === 'DYING_ATTACK') score -= 10;
        if (c.attackExtra === 'PESTLE') score -= 5;
        if (
          c.attackExtra &&
          ['FOG', 'ILLUSION', 'GLORY', 'DARK_CLOUD'].includes(c.attackExtra) &&
          !t.harms.includes(c.attackExtra as any)
        )
          score += 5;
      } else if (c.attackKind === 'INCREASE_HP')
        score = Math.min(c.value, 99 - hp) * (hp < 20 ? 3.5 : hp < 35 ? 1.3 : 0.15);
      else if (c.attackKind === 'INCREASE_MP')
        score = Math.min(c.value, Math.max(0, 15 - (t.mp ?? 0))) * 0.7;
      else if (c.attackKind === 'INCREASE_YEN') score = Math.min(c.value, 99 - (t.gold ?? 0)) * 0.4;
      else if (c.attackKind === 'ADD_HARM')
        score =
          t.disease === 'HEAVEN' && ['COLD', 'FEVER', 'HELL', 'HEAVEN'].includes(c.attackExtra)
            ? 100
            : t.harms.includes(c.attackExtra as any)
              ? 0
              : 9;
      else if (c.attackKind.startsWith('REMOVE_') && c.attackKind.includes('HARMS'))
        score =
          t.disease === 'HEAVEN' || t.disease === 'HELL' ? 35 : t.disease ? 16 : t.harms.length * 5;
      else if (c.attackKind === 'SET_ASSISTANT') score = t.summon ? 0 : 22;
      else if (c.attackKind === 'EXCHANGE')
        score = myhp < 20 && mp + (me.gold ?? 0) > 0 ? 75 : myhp < 35 ? 18 : -4;
      else if (c.attackKind === 'SELL') {
        const sale = defs[1];
        if (t.handCount + t.abilityCount >= v.rules.capacity) continue;
        score =
          sale.price * 0.7 +
          (sale.price >= hp + (t.mp ?? 0) + (t.gold ?? 0) ? 70 : 0) -
          (attackValue(sale) + defenseValue(sale)) * 0.15;
      } else if (c.attackKind === 'BUY') score = (me.gold ?? 0) > 8 && t.handCount > 0 ? 8 : -3;
      else if (c.attackKind === 'REMOVE_ITEMS') score = t.handCount ? 7 : 0;
      else if (c.attackKind === 'REMOVE_ABILITIES') score = t.abilityCount ? 12 : 0;
      else if (c.attackKind === 'MYSTERY') score = myhp < 15 ? 14 : 4;
      else if (c.attackKind === 'INCREASE_OR_DECREASE_HP') score = 3;
      score -=
        defs.reduce((x, c) => x + (c.type === 'MAGIC' ? c.subValue * 0.4 : 0), 0) +
        set.length * 0.25;
      if (v.doom >= 100) score -= set.length * v.rules.demonChance * 8;
      if (self.hand.length + self.abilities.length >= 16)
        score += set.filter((p) => self.hand.includes(p)).length;
      if (difficulty === 'easy') score += ((v.version * 13 + c.id * 17) % 11) - 5;
      ranked.push({
        action: {
          kind: 'attack',
          pieces: set.map((p) => p.uid),
          target: t.id,
          ...(c.attackKind === 'EXCHANGE'
            ? { exchange: exchangeValues(myhp, mp, me.gold ?? 0) }
            : {}),
        },
        score,
      });
    }
  }
  if (self.hand.length >= 12) {
    const discard = self.hand
      .filter((p) => !['REVIVE', 'MORTAR', 'DYING_ATTACK'].includes(card(p.cardId).attackExtra))
      .sort(
        (a, b) =>
          attackValue(card(a.cardId)) +
          defenseValue(card(a.cardId)) -
          attackValue(card(b.cardId)) -
          defenseValue(card(b.cardId)),
      )
      .slice(0, 2);
    if (discard.length)
      ranked.push({ action: { kind: 'discard', pieces: discard.map((p) => p.uid) }, score: 0.5 });
  }
  ranked.push({ action: { kind: 'pass' }, score: 0 });
  return ranked.sort((a, b) => b.score - a.score);
}
export function evaluateDefense(v: GameView, difficulty: Difficulty): ScoredAction[] {
  const atk = v.current!,
    self = v.self!,
    me = v.players.find((p) => p.id === self.id)!;
  const refs = [...self.hand, ...self.abilities];
  const sets: Piece[][] = [[], ...refs.map((p) => [p])];
  const plain = refs
    .filter(
      (p) =>
        card(p.cardId).defenseKind === 'DFS' &&
        canDefend(atk.attribute, card(p.cardId).attribute, v.rules.lightDefense),
    )
    .sort((a, b) => defenseValue(card(b.cardId)) - defenseValue(card(a.cardId)));
  if (!me.harms.includes('GLORY')) {
    for (let i = 2; i <= Math.min(plain.length, 8); i++) sets.push(plain.slice(0, i));
    const erase = refs.find((p) => card(p.cardId).defenseExtra === 'REMOVE_ATTRIBUTE');
    if (erase)
      for (const q of refs.filter(
        (p) => p.uid !== erase.uid && card(p.cardId).defenseKind === 'DFS',
      ))
        sets.push([erase, q]);
    const free = self.hand.filter((p) => card(p.cardId).attackExtra === 'MAGIC_FREE');
    for (const p of refs.filter(
      (p) => card(p.cardId).type === 'MAGIC' && card(p.cardId).contexts.includes('defense'),
    ))
      for (const q of free) sets.push([p, q]);
  }
  return sets
    .filter((set) =>
      affordable(
        set.map((p) => card(p.cardId)),
        me.mp ?? 0,
      ),
    )
    .map((set) => {
      let block = 0,
        special = '',
        attr = atk.attribute;
      for (const p of set) {
        const c = card(p.cardId);
        block += defenseValue(c);
        if (c.defenseExtra === 'REMOVE_ATTRIBUTE') attr = '';
        if (
          c.defenseExtra.startsWith('REFLECT') ||
          c.defenseExtra.startsWith('BLOCK') ||
          c.defenseExtra.startsWith('FLICK')
        )
          special = c.defenseExtra;
      }
      const remain = Math.max(0, atk.damage - block),
        lethal =
          remain > (me.summon?.hp ?? 0) &&
          (attr === 'DARK' || remain >= (me.hp ?? 40) + (me.summon?.hp ?? 0));
      const defs = set.map((p) => card(p.cardId));
      const beneficial =
        [
          'INCREASE_HP',
          'INCREASE_MP',
          'INCREASE_YEN',
          'REMOVE_ALL_HARMS',
          'REMOVE_LOWER_HARMS',
          'SET_ASSISTANT',
          'ADD_ITEM',
        ].includes(atk.cards[0].attackKind) && !atk.cards[0].attackExtra;
      let score =
        Math.min(block, atk.damage) * 0.7 -
        set.length * 0.3 -
        Math.max(0, block - atk.damage) * 0.08;
      if (lethal && !special) score -= 150;
      if (remain > 0)
        for (const c of defs.filter((c) => c.defenseKind === 'COUNTER')) {
          if (c.attackKind === 'ATK')
            score +=
              Math.min(40, remain * ([190].includes(c.id) ? 2 : 1)) *
              (c.hitRate ? c.hitRate / 100 : 1) *
              0.5;
          else if (c.attackKind === 'ADD_HARM') score += 8;
          else if (c.attackKind === 'INCREASE_MP') score += Math.min(20, remain * 2) * 0.4;
          else if (c.attackKind === 'ABSORB_YEN') score += Math.min(20, remain) * 0.5;
        }
      if (special) {
        score += atk.damage + 40;
        if (special.startsWith('FLICK')) score -= 12;
      }
      if (difficulty === 'easy') score -= set.length * 2;
      score -= defs.filter((c) => c.type === 'MAGIC').reduce((n, c) => n + c.subValue * 0.1, 0);
      if (v.doom >= 100) score -= set.length * v.rules.demonChance * 4;
      if (beneficial && atk.damage === 0) score = set.length ? -100 : 100;
      return { action: { kind: 'defend' as const, pieces: set.map((p) => p.uid) }, score };
    })
    .sort((a, b) => b.score - a.score);
}
