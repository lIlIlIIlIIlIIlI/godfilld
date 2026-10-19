import type { GameView } from '../../shared/types';
import { battleCues, battleTiming, type BattleCue } from '../../shared/battle-pacing';
export { battleCues, type BattleCue } from '../../shared/battle-pacing';

/** Visual-only queue: neither timers nor dismissal submit a game command. */
export class BattlePresentation {
  current: BattleCue | null = null;
  private gameId = '';
  private version = -1;
  private cursor = 0;
  private queue: BattleCue[] = [];
  private timer?: ReturnType<typeof setTimeout>;
  constructor(private changed: () => void) {}

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
    if (this.queue.length > battleTiming.maxQueuedCues)
      this.queue = this.queue.slice(-battleTiming.maxQueuedCues);
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
    const duration = battleTiming[this.current.kind];
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.current = null;
      this.advance();
      this.changed();
    }, duration);
  }
}
