import type { GameState, Player } from '../../../shared/types';
import { random, choose } from './Random';
import { damage, emit } from './State';
// Threshold and demon damage are explicit new-game settings, not verified historical values.
export function endgameRisk(s: GameState, p: Player, operations: number) {
  if (s.turn < s.rules.doomAt || s.phase === 'FINISHED') return;
  for (let i = 0; i < operations && !p.dead && p.hp > 0; i++) {
    if (random(s) < s.rules.demonChance) {
      const n = choose(s, s.rules.demonDamage);
      emit(s, 'demon', { target: p.id, amount: n });
      damage(s, p, n);
    }
  }
}
