import type { GameEvent } from './types.js';

export interface BattleCue {
  kind: 'start' | 'damage' | 'death' | 'demon';
  seq: number;
  target?: string;
  amount?: number;
  demonDamage?: number;
}

export function battleCues(events: GameEvent[]): BattleCue[] {
  let demon: GameEvent | undefined;
  let lastDamage: BattleCue | undefined;
  const cues: BattleCue[] = [];
  for (const e of events) {
    if (e.type === 'demon' && e.target && Number.isFinite(e.amount)) {
      demon = e;
      cues.push({ kind: 'demon', seq: e.seq, target: e.target, demonDamage: e.amount });
    } else if (e.type === 'damage' && e.target) {
      const demonDamage = demon?.target === e.target ? demon.amount : undefined;
      if (demon?.target === e.target) demon = undefined;
      lastDamage = undefined;
      if ((e.amount ?? 0) <= 0) continue;
      lastDamage = { kind: 'damage', seq: e.seq, target: e.target, amount: e.amount, demonDamage };
      cues.push(lastDamage);
    } else if (e.type === 'death' && e.target) {
      cues.push({
        kind: 'death',
        seq: e.seq,
        target: e.target,
        demonDamage: lastDamage?.target === e.target ? lastDamage.demonDamage : undefined,
      });
    } else if (['attack', 'turn_start', 'revive'].includes(e.type)) {
      demon = undefined;
      lastDamage = undefined;
    }
  }
  return cues;
}

export const battleTiming = {
  botActionMs: 1800,
  start: 2200,
  damage: 1400,
  death: 1800,
  demon: 900,
  settleMs: 350,
  maxQueuedCues: 8,
} as const;

/** Reserve enough time for the same cues that viewers display before an AI acts. */
export function battleReadTime(events: GameEvent[]) {
  if (events.some((e) => e.type === 'game_start'))
    return battleTiming.start + battleTiming.settleMs;
  return battleCues(events)
    .slice(-battleTiming.maxQueuedCues)
    .reduce<number>((total, cue) => total + battleTiming[cue.kind], battleTiming.settleMs);
}
