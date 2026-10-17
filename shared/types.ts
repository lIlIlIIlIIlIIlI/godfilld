export type Attribute = '' | 'FIRE' | 'WATER' | 'TREE' | 'SOIL' | 'LIGHT' | 'DARK';
export type CardType = 'WEAPON' | 'PROTECTOR' | 'MAGIC' | 'TRADE' | 'SUNDRY' | 'CREATURE' | 'FIXED';
export interface CardDefinition {
  id: number;
  type: CardType;
  attackKind: string;
  attackExtra: string;
  defenseKind: string;
  defenseExtra: string;
  attribute: Attribute;
  value: number;
  subValue: number;
  hitRate: number;
  price: number;
  weight: number;
  name: { ko: string; en: string };
  description: { ko: string; en: string };
  image: string;
  nameStatus: 'original-new-name';
  targetRule: 'self' | 'any-alive' | 'other-alive';
  contexts: ('attack' | 'defense' | 'passive')[];
  effectIds: string[];
}
export interface Piece {
  uid: string;
  cardId: number;
  displayId?: number;
}
export type Disease = '' | 'COLD' | 'FEVER' | 'HELL' | 'HEAVEN';
export type Harm = 'FOG' | 'ILLUSION' | 'GLORY' | 'DARK_CLOUD';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type DoomStartTurn = 1 | 50 | 100 | 500;
export interface Summon {
  type: string;
  hp: number;
}
export interface Player {
  id: string;
  name: string;
  team: string;
  bot: boolean;
  difficulty: Difficulty;
  hp: number;
  mp: number;
  gold: number;
  dead: boolean;
  disease: Disease;
  worseChance: number;
  harms: Harm[];
  hand: Piece[];
  abilities: Piece[];
  summon: Summon | null;
  refill: number;
}
export interface Attack {
  id: string;
  source: string;
  target: string;
  cards: CardDefinition[];
  damage: number;
  attribute: Attribute | null;
  chance: number;
  extras: string[];
  depth: number;
  counter: boolean;
  unblockable: boolean;
  summon?: string;
}
export type Phase =
  | 'WAITING'
  | 'ATTACK_SELECTION'
  | 'DEFENSE_SELECTION'
  | 'BUY_CONFIRMATION'
  | 'RESOLVING'
  | 'TURN_END'
  | 'NEXT_TURN'
  | 'FINISHED';
export interface Rules {
  capacity: number;
  initialCards: number;
  diseaseMode: 'blog-fixed' | 'emulator-growing';
  diseaseChance: number;
  lightDefense: 'dark' | 'none';
  summonChance: number;
  doomAt: number;
  demonChance: number;
  demonDamage: number[];
  maxChain: number;
  maxTurns: number;
}
export interface GameEvent {
  seq: number;
  turn: number;
  type: string;
  actor?: string;
  target?: string;
  amount?: number;
  cards?: number[];
  text?: string;
}
export interface GameState {
  schemaVersion: 1;
  id: string;
  version: number;
  rng: number;
  initialSeed: number;
  serial: number;
  phase: Phase;
  players: Player[];
  order: string[];
  orderIndex: number;
  attacker: string;
  turn: number;
  queue: Attack[];
  current: Attack | null;
  purchase: {
    buyer: string;
    seller: string;
    pieceUid: string;
    cardId: number;
    price: number;
  } | null;
  events: GameEvent[];
  eventSeq: number;
  winners: string[];
  rules: Rules;
  processed: string[];
  endStage: 'none' | 'status' | 'summons' | 'refill';
}
export type Action =
  | {
      kind: 'attack';
      pieces: string[];
      target: string;
      exchange?: { hp: number; mp: number; gold: number };
    }
  | { kind: 'defend'; pieces: string[] }
  | { kind: 'buy'; accept: boolean }
  | { kind: 'pass' }
  | { kind: 'discard'; pieces: string[] };
export interface ActionEnvelope {
  id: string;
  version: number;
  action: Action;
}
export interface PublicPlayer {
  id: string;
  name: string;
  team: string;
  bot: boolean;
  dead: boolean;
  hp: number | null;
  mp: number | null;
  gold: number | null;
  disease: Disease;
  harms: Harm[];
  handCount: number;
  abilityCount: number;
  summon: Summon | null;
}
export interface GameView {
  id: string;
  version: number;
  phase: Phase;
  players: PublicPlayer[];
  attacker: string;
  turn: number;
  current: Attack | null;
  purchase: { cardId: number; price: number } | null;
  events: GameEvent[];
  winners: string[];
  self: { id: string; hand: Piece[]; abilities: Piece[] } | null;
  doom: number;
  rules: Rules;
}
