import type { Rules, Attribute } from '../../../shared/types';
export const defaultRules: Rules = {
  capacity: 16,
  initialCards: 10,
  diseaseMode: 'blog-fixed',
  diseaseChance: 0.05,
  lightDefense: 'dark',
  summonChance: 0.3,
  doomAt: 100,
  demonChance: 0.25,
  demonDamage: [5, 10, 15],
  maxChain: 24,
  maxTurns: 600,
};
export function canDefend(a: Attribute | null, d: Attribute, light: 'dark' | 'none' = 'dark') {
  if (a === null) return false;
  if (a === '' || a === 'DARK') return true;
  return (
    {
      FIRE: ['WATER', 'LIGHT'],
      WATER: ['FIRE', 'LIGHT'],
      TREE: ['SOIL', 'LIGHT'],
      SOIL: ['TREE', 'LIGHT'],
      LIGHT: light === 'dark' ? ['DARK'] : [],
    }[a] as string[]
  ).includes(d);
}
export function mix(a: Attribute | null, b: Attribute, override = false): Attribute {
  return a === null || a === 'LIGHT' || override ? b : a !== b && b !== 'LIGHT' ? '' : a;
}
