import type { GameEvent, GameView } from './types.js';
import { cards } from './catalog.js';
export const eventClips: Record<string, string> = {
  select: 'card',
  button: 'button_down',
  target: 'target',
  card_detail: 'book_tab_down',
  attack: 'card',
  draw: 'card',
  damage: 'damage',
  heal: 'hp_increase',
  reflect: 'reflect',
  flick: 'flick',
  counter: 'counter',
  block: 'block',
  miss: 'miss',
  status: 'harm_add',
  cleanse: 'harm_remove',
  summon: 'assistant_add',
  summon_damage: 'assistant',
  summon_death: 'assistant_remove',
  death: 'dead',
  dark_death: 'damage_dark',
  heaven_fall: 'seizure',
  revive: 'revive',
  dying_attack: 'dying_attack',
  miracle_learned: 'open_cover',
  exchange: 'exchange',
  buy: 'exchange',
  sell: 'exchange',
  buy_offer: 'target',
  remove_card: 'item_remove',
  forget: 'item_remove',
  discard: 'item_remove',
  mystery: 'mystery',
  game_start: 'game_start',
  safety_draw: 'game_draw',
};
export function battleClip(event: GameEvent, game: GameView, viewer: string): string | undefined {
  if (event.type === 'game_end')
    return !game.winners.length ? 'game_draw' : game.winners.includes(viewer) ? 'game_win' : 'dead';
  if (event.type === 'turn_start') return event.actor === viewer ? 'client_turn' : undefined;
  if (event.type === 'status' && ['COLD', 'FEVER', 'HELL', 'HEAVEN'].includes(event.text ?? ''))
    return 'disease';
  if (event.type === 'damage' && !event.amount) return undefined;
  if (event.type === 'attack') {
    const c = event.cards?.length ? cards[event.cards[0]] : undefined;
    if (c?.attackKind === 'INCREASE_MP') return 'mp_increase';
    if (c?.attackKind === 'INCREASE_YEN' || c?.attackKind === 'SCATTER_YEN') return 'yen_increase';
    if (c?.attackKind === 'ABSORB_YEN') return 'yen_absorb';
  }
  return eventClips[event.type];
}
