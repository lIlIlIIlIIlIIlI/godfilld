import type { GameState } from '../../../shared/types.js';
export function random(s: GameState): number {
  let x = s.rng || 0x9e3779b9;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  s.rng = x >>> 0;
  return s.rng / 4294967296;
}
export function choose<T>(s: GameState, a: T[]): T {
  if (!a.length) throw new Error('선택 가능한 대상이 없습니다.');
  return a[Math.floor(random(s) * a.length)];
}
export function weighted<T extends { weight: number }>(s: GameState, a: T[]): T {
  const total = a.reduce((n, c) => n + c.weight, 0);
  if (total <= 0) throw new Error('빈 출현 테이블');
  let n = random(s) * total;
  return a.find((c) => (n -= c.weight) < 0) ?? a[a.length - 1];
}
export function shuffle<T>(s: GameState, a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
