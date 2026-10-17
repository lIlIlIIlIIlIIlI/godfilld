import type { Disease, Harm, Player, GameState } from '../../../shared/types.js';
import { emit, damage, increase } from './State.js';
import { random } from './Random.js';
export const diseases: Disease[] = ['COLD', 'FEVER', 'HELL', 'HEAVEN'];
export const harms: Harm[] = ['FOG', 'ILLUSION', 'GLORY', 'DARK_CLOUD'];
export function addStatus(s: GameState, p: Player, status: string) {
  if (diseases.includes(status as Disease)) {
    if (p.disease === 'HEAVEN') {
      p.hp = 0;
      p.worseChance = 0;
      emit(s, 'heaven_fall', { target: p.id });
      return;
    }
    const current = diseases.indexOf(p.disease),
      next = diseases.indexOf(status as Disease);
    p.disease = diseases[Math.max(next, current + 1)];
    p.worseChance = 0;
  } else if (harms.includes(status as Harm)) {
    if (p.harms.includes(status as Harm)) return;
    p.harms.push(status as Harm);
  } else return;
  emit(s, 'status', { target: p.id, text: status });
}
export function cleanse(s: GameState, p: Player, lower = false) {
  if (!lower || ['COLD', 'FEVER'].includes(p.disease)) {
    p.disease = '';
    p.worseChance = 0;
  }
  p.harms = lower ? p.harms.filter((x) => !['FOG', 'GLORY'].includes(x)) : [];
  if (!p.harms.includes('ILLUSION')) for (const c of p.hand) delete c.displayId;
  emit(s, 'cleanse', { target: p.id, text: lower ? 'lower' : 'all' });
}
export function tickStatus(s: GameState, p: Player) {
  if (p.dead || p.hp <= 0 || !p.disease) return;
  const chance = s.rules.diseaseMode === 'blog-fixed' ? s.rules.diseaseChance : p.worseChance / 100;
  if (random(s) < chance) addStatus(s, p, p.disease);
  else p.worseChance++;
  if (p.hp <= 0) return;
  const value = ({ COLD: 1, FEVER: 2, HELL: 5, HEAVEN: -5 } as Record<string, number>)[p.disease];
  if (value < 0) {
    increase(p, 'hp', -value);
    emit(s, 'heal', { target: p.id, amount: -value });
  } else damage(s, p, value);
}
