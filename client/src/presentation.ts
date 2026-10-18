import type { GameEvent, GameView } from '../../shared/types';

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

/** Visual-only queue: neither timers nor dismissal submit a game command. */
export class BattlePresentation {
  current: BattleCue | null = null;
  private gameId = '';
  private version = -1;
  private cursor = 0;
  private queue: BattleCue[] = [];
  private timer?: ReturnType<typeof setTimeout>;
  constructor(
    private changed: () => void,
    private motion = () => true,
  ) {}

  sync(game: GameView) {
    const freshMatch = this.gameId !== game.id || game.version < this.version;
    if (freshMatch) {
      this.reset();
      this.gameId = game.id;
      this.cursor = game.events.at(-1)?.seq ?? 0;
      const start = game.events.find((e) => e.type === 'game_start');
      if (game.version === 0 && game.turn === 1 && game.phase !== 'FINISHED' && start)
        this.queue.push({ kind: 'start', seq: start.seq });
    } else {
      this.queue.push(...battleCues(game.events.filter((e) => e.seq > this.cursor)));
      this.cursor = Math.max(this.cursor, game.events.at(-1)?.seq ?? 0);
    }
    this.version = game.version;
    // Bound presentation lag during fast AI chains without delaying server state.
    if (this.queue.length > 8) this.queue = this.queue.slice(-8);
    if (!this.current) this.advance();
  }

  reset() {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    this.current = null;
    this.queue = [];
    this.gameId = '';
    this.version = -1;
    this.cursor = 0;
  }

  private advance() {
    this.current = this.queue.shift() ?? null;
    if (!this.current) return;
    const duration = this.motion() ? (this.current.kind === 'demon' ? 650 : 1100) : 200;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.current = null;
      this.advance();
      this.changed();
    }, duration);
  }
}
