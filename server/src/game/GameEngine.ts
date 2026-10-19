import type {
  GameState,
  Player,
  ActionEnvelope,
  Rules,
  Difficulty,
  GameView,
  Attack,
} from '../../../shared/types.js';
import { defaultRules } from './Rules.js';
import { maxPlayers } from '../../../shared/settings.js';
import { draw, owned, card } from './CardRegistry.js';
import { emit, requireRule, uid, player, alive, enemy } from './State.js';
import { shuffle, random } from './Random.js';
import { attackCommand, inflict } from './CombatResolver.js';
import { defend } from './DefenseResolver.js';
import { buy } from './TradeManager.js';
import { tickStatus } from './StatusEffectEngine.js';
import { summonOpportunities } from './SummonManager.js';
import { endgameRisk } from './EndgameManager.js';
export interface PlayerInput {
  id: string;
  name: string;
  team?: string;
  bot?: boolean;
  difficulty?: Difficulty;
}
export function createGame(
  id: string,
  players: PlayerInput[],
  seed: number,
  rules: Partial<Rules> = {},
): GameState {
  requireRule(
    players.length >= 2 && players.length <= maxPlayers,
    `2~${maxPlayers}명이 필요합니다.`,
  );
  requireRule(new Set(players.map((p) => p.id)).size === players.length, '중복 플레이어입니다.');
  const s: GameState = {
    schemaVersion: 1,
    id,
    version: 0,
    rng: seed >>> 0 || 1,
    initialSeed: seed >>> 0 || 1,
    serial: 0,
    phase: 'WAITING',
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      team: p.team ?? 'SINGLE',
      bot: p.bot ?? false,
      difficulty: p.difficulty ?? 'normal',
      hp: 40,
      mp: 10,
      gold: 20,
      dead: false,
      disease: '',
      worseChance: 0,
      harms: [],
      hand: [],
      abilities: [],
      summon: null,
      refill: 0,
    })),
    order: [],
    orderIndex: -1,
    attacker: '',
    turn: 0,
    queue: [],
    current: null,
    purchase: null,
    events: [],
    eventSeq: 0,
    winners: [],
    rules: { ...defaultRules, ...rules },
    processed: [],
    endStage: 'none',
  };
  requireRule(
    s.players.some((p) => s.players.some((q) => enemy(p, q))),
    '서로 다른 팀이 필요합니다.',
  );
  emit(s, 'game_start');
  for (const p of s.players) draw(s, p, s.rules.initialCards);
  nextTurn(s);
  return s;
}
export function handleDeaths(s: GameState) {
  for (const p of s.players) {
    if (p.hp > 0 || p.dead) continue;
    const revive = p.hand.find((c) => card(c.cardId).attackExtra === 'REVIVE');
    if (revive) {
      p.hand = p.hand.filter((x) => x.uid !== revive.uid);
      p.hp = card(revive.cardId).value;
      p.refill++;
      emit(s, 'revive', { target: p.id, amount: p.hp, cards: [revive.cardId] });
      continue;
    }
    p.dead = true;
    emit(s, 'death', { target: p.id });
    const dying = p.hand.find((c) => card(c.cardId).attackExtra === 'DYING_ATTACK');
    if (dying) {
      p.hand = p.hand.filter((x) => x.uid !== dying.uid);
      const c = card(dying.cardId);
      for (const q of alive(s).filter((q) => enemy(p, q)))
        s.queue.push({
          id: uid(s, 'a'),
          source: p.id,
          target: q.id,
          cards: [c],
          damage: 30,
          attribute: 'LIGHT',
          chance: 75,
          extras: [],
          depth: 0,
          counter: false,
          unblockable: false,
        });
      emit(s, 'dying_attack', { actor: p.id, cards: [c.id] });
    }
  }
}
function endIfWon(s: GameState) {
  if (s.queue.length || s.current) return false;
  const people = alive(s);
  if (people.length > 1 && people.some((p) => people.some((q) => enemy(p, q)))) return false;
  s.winners = people.map((p) => p.id);
  s.phase = 'FINISHED';
  s.purchase = null;
  emit(s, 'game_end', { text: s.winners.join(',') });
  return true;
}
function nextTurn(s: GameState) {
  s.phase = 'NEXT_TURN';
  s.turn++;
  if (s.turn > s.rules.maxTurns) {
    s.phase = 'FINISHED';
    s.winners = [];
    emit(s, 'safety_draw');
    return;
  }
  if (s.orderIndex < 0 || s.orderIndex >= s.order.length - 1) {
    s.order = shuffle(
      s,
      alive(s).map((p) => p.id),
    );
    s.orderIndex = 0;
  } else s.orderIndex++;
  let next = player(s, s.order[s.orderIndex]);
  let guard = 0;
  while (next.dead && guard++ < s.players.length) {
    s.orderIndex++;
    if (s.orderIndex >= s.order.length) {
      s.order = shuffle(
        s,
        alive(s).map((p) => p.id),
      );
      s.orderIndex = 0;
    }
    next = player(s, s.order[s.orderIndex]);
  }
  s.attacker = next.id;
  s.endStage = 'none';
  s.phase = 'ATTACK_SELECTION';
  if (s.turn === s.rules.doomAt) emit(s, 'doom_start');
  emit(s, 'turn_start', { actor: next.id });
}
export function pump(s: GameState) {
  let steps = 0;
  while (s.phase !== 'FINISHED') {
    requireRule(++steps < 2048, '내부 처리 한도를 초과했습니다.');
    handleDeaths(s);
    if (s.purchase) {
      if (player(s, s.purchase.buyer).dead || player(s, s.purchase.seller).dead) {
        emit(s, 'buy_cancelled');
        s.purchase = null;
      } else {
        s.phase = 'BUY_CONFIRMATION';
        return;
      }
    }
    if (s.current) {
      s.phase = 'DEFENSE_SELECTION';
      return;
    }
    if (s.queue.length) {
      const a = s.queue.shift()!;
      if (a.depth > s.rules.maxChain) {
        emit(s, 'chain_limit');
        continue;
      }
      const b = player(s, a.target);
      if (b.dead || b.hp === 0) continue;
      if (a.chance > 0 && !b.harms.includes('DARK_CLOUD') && random(s) * 100 >= a.chance) {
        emit(s, 'miss', { actor: a.source, target: a.target, cards: a.cards.map((c) => c.id) });
        continue;
      }
      emit(s, 'attack', {
        actor: a.source,
        target: a.target,
        amount: a.damage,
        cards: a.cards.map((c) => c.id),
      });
      if (a.unblockable || a.source === a.target) {
        inflict(s, a);
        continue;
      }
      s.current = a;
      s.phase = 'DEFENSE_SELECTION';
      return;
    }
    if (endIfWon(s)) return;
    s.phase = 'TURN_END';
    const a = player(s, s.attacker);
    if (s.endStage === 'none') {
      s.endStage = 'status';
      tickStatus(s, a);
      continue;
    }
    if (s.endStage === 'status') {
      s.endStage = 'summons';
      summonOpportunities(s, a);
      continue;
    }
    if (s.endStage === 'summons') {
      s.endStage = 'refill';
      for (const p of s.players) {
        if (p.dead) continue;
        const before = p.hand.length;
        draw(s, p, p.refill);
        p.refill = 0;
        endgameRisk(s, p, p.hand.length - before);
      }
      continue;
    }
    if (endIfWon(s)) return;
    nextTurn(s);
    return;
  }
}
export function applyAction(
  state: GameState,
  actorId: string,
  envelope: ActionEnvelope,
): GameState {
  requireRule(!state.processed.includes(`${actorId}:${envelope.id}`), '이미 처리된 행동입니다.');
  requireRule(
    envelope.version === state.version,
    '게임 상태가 변경되었습니다. 다시 선택해 주세요.',
  );
  requireRule(state.phase !== 'FINISHED', '이미 종료된 경기입니다.');
  const s = structuredClone(state),
    p = player(s, actorId),
    action = envelope.action;
  requireRule(!p.dead && p.hp > 0, '탈락한 플레이어입니다.');
  if (s.phase === 'BUY_CONFIRMATION') {
    requireRule(
      p.id === s.purchase?.buyer && action.kind === 'buy',
      '구매 확인을 기다리고 있습니다.',
    );
    buy(s, action.accept);
  } else if (s.phase === 'DEFENSE_SELECTION') {
    requireRule(p.id === s.current?.target && action.kind === 'defend', '방어 차례가 아닙니다.');
    defend(s, p, action.pieces);
  } else {
    requireRule(
      s.phase === 'ATTACK_SELECTION' && p.id === s.attacker,
      '자신의 공격 차례가 아닙니다.',
    );
    if (action.kind === 'attack') attackCommand(s, p, action);
    else if (action.kind === 'pass') {
      p.refill++;
      emit(s, 'pass', { actor: p.id });
      endgameRisk(s, p, 1);
    } else if (action.kind === 'discard') {
      const entries = owned(p, action.pieces);
      requireRule(
        entries.length > 0 && entries.every((x) => !x.ability && x.card.attackExtra !== 'MORTAR'),
        '버릴 수 없는 카드입니다.',
      );
      p.hand = p.hand.filter((x) => !action.pieces.includes(x.uid));
      p.refill += entries.length;
      emit(s, 'discard', { actor: p.id, cards: entries.map((x) => x.card.id) });
      endgameRisk(s, p, entries.length);
    } else throw new Error('현재 단계에 맞지 않는 행동입니다.');
  }
  s.phase = 'RESOLVING';
  pump(s);
  s.version++;
  s.processed.push(`${actorId}:${envelope.id}`);
  return s;
}
// The only network/AI projection: never serialize GameState to clients.
export function viewFor(s: GameState, viewerId?: string): GameView {
  const self = s.players.find((p) => p.id === viewerId),
    fog = Boolean(self?.harms.includes('FOG'));
  const purchase =
    s.purchase && s.purchase.buyer === viewerId
      ? { cardId: s.purchase.cardId, price: s.purchase.price }
      : null;
  return {
    id: s.id,
    version: s.version,
    phase: s.phase,
    turn: s.turn,
    attacker: s.attacker,
    players: s.players.map((p) => ({
      id: p.id,
      name: fog && p !== self ? '안개 속 여행자' : p.name,
      team: p.team,
      bot: p.bot,
      dead: p.dead,
      hp: fog && p !== self ? null : p.hp,
      mp: fog && p !== self ? null : p.mp,
      gold: fog && p !== self ? null : p.gold,
      disease: p.disease,
      harms: p.harms,
      handCount: p.hand.length,
      abilityCount: p.abilities.length,
      summon: p.summon ? { ...p.summon } : null,
    })),
    current: s.current ? structuredClone(s.current) : null,
    purchase,
    events: s.events.slice(-200).map((e) => ({ ...e })),
    winners: [...s.winners],
    self: self
      ? {
          id: self.id,
          hand: self.hand.map((p) => ({ uid: p.uid, cardId: p.displayId ?? p.cardId })),
          abilities: self.abilities.map((p) => ({ uid: p.uid, cardId: p.cardId })),
        }
      : null,
    doom: Math.min(100, Math.floor((s.turn / s.rules.doomAt) * 100)),
    rules: { ...s.rules },
  };
}
