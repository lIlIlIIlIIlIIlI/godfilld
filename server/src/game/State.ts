import type { GameState, Player, GameEvent } from '../../../shared/types.js';
export function requireRule(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}
export function player(s: GameState, id: string) {
  const p = s.players.find((p) => p.id === id);
  requireRule(p, '플레이어를 찾을 수 없습니다.');
  return p;
}
export function enemy(a: Pick<Player, 'id' | 'team'>, b: Pick<Player, 'id' | 'team'>) {
  return a.id !== b.id && (a.team === 'SINGLE' || b.team === 'SINGLE' || a.team !== b.team);
}
export function alive(s: GameState) {
  return s.players.filter((p) => !p.dead && p.hp > 0);
}
export function emit(s: GameState, type: string, details: Partial<GameEvent> = {}) {
  s.events.push({ seq: ++s.eventSeq, turn: s.turn, type, ...details });
}
export function uid(s: GameState, prefix = 'p') {
  return `${prefix}${++s.serial}`;
}
export function increase(p: Player, key: 'hp' | 'mp' | 'gold', n: number) {
  p[key] = Math.min(99, Math.max(0, p[key] + n));
}
export function damage(s: GameState, p: Player, n: number, source?: string) {
  let remaining = Math.max(0, n);
  if (p.summon) {
    const absorbed = Math.min(p.summon.hp, remaining);
    p.summon.hp -= absorbed;
    remaining -= absorbed;
    emit(s, 'summon_damage', { target: p.id, amount: absorbed });
    if (p.summon.hp <= 0) {
      emit(s, 'summon_death', { target: p.id });
      p.summon = null;
    }
  }
  const taken = Math.min(p.hp, remaining);
  p.hp = Math.max(0, p.hp - remaining);
  emit(s, 'damage', { actor: source, target: p.id, amount: taken });
  return taken;
}
