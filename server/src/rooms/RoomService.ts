import { randomUUID, randomBytes, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { roomSchema, envelopeSchema } from '../../../shared/schemas.js';
import type { GameState, Difficulty, ActionEnvelope } from '../../../shared/types.js';
import { createGame, applyAction, viewFor } from '../game/GameEngine.js';
import { requireRule } from '../game/State.js';
import { botDecision, waitingActor } from '../ai/BotController.js';
import type { Store, Identity } from '../persistence/Store.js';
export interface Seat {
  id: string;
  name: string;
  bot: boolean;
  ready: boolean;
  team: string;
  difficulty: Difficulty;
  lastSeen: number;
  autopilot: boolean;
}
export interface RoomRecord {
  id: string;
  name: string;
  host: string;
  private: boolean;
  passwordHash: string;
  capacity: number;
  mode: 'ffa' | 'team';
  seats: Seat[];
  spectators: string[];
  revision: number;
  game: GameState | null;
  deadline: number;
  chat: { id: string; name: string; text: string }[];
  commands: { actor: string; envelope: ActionEnvelope }[];
  createdAt: number;
}
export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
function password(value: string, salt: string) {
  return value ? scryptSync(value, salt, 32).toString('hex') : '';
}
export class RoomService {
  constructor(
    public store: Store,
    public botDelay = 650,
    public turnMs = 30000,
  ) {}
  async authenticate(token?: string, name = '여행자') {
    if (token) {
      const id = token.split('.')[0],
        identity = await this.store.identity(id);
      requireRule(
        identity && identity.tokenHash === hash(token),
        '세션이 만료되었거나 유효하지 않습니다.',
      );
      return { identity, token };
    }
    const id = randomUUID(),
      newToken = `${id}.${randomBytes(32).toString('base64url')}`;
    const identity = {
      id,
      name: z.string().trim().min(1).max(20).parse(name),
      tokenHash: hash(newToken),
    };
    await this.store.saveIdentity(identity);
    return { identity, token: newToken };
  }
  async list() {
    return (await this.store.list())
      .filter((r) => !r.private)
      .map((r) => ({
        id: r.id,
        name: r.name,
        mode: r.mode,
        count: r.seats.length,
        capacity: r.capacity,
        locked: Boolean(r.passwordHash),
        playing: Boolean(r.game && r.game.phase !== 'FINISHED'),
      }));
  }
  async create(identity: Identity, input: unknown, practice = false) {
    const options = roomSchema.parse(input);
    const id = randomUUID();
    const seat: Seat = {
      id: identity.id,
      name: options.namePlayer,
      bot: false,
      ready: practice,
      team: options.mode === 'team' ? 'A' : 'SINGLE',
      difficulty: options.difficulty,
      lastSeen: Date.now(),
      autopilot: false,
    };
    const room: RoomRecord = {
      id,
      name: options.name,
      host: identity.id,
      private: options.private || practice,
      passwordHash: password(options.password, id),
      capacity: practice ? 4 : options.capacity,
      mode: options.mode,
      seats: [seat],
      spectators: [],
      revision: 0,
      game: null,
      deadline: 0,
      chat: [],
      commands: [],
      createdAt: Date.now(),
    };
    if (practice) {
      for (let i = 0; i < 3; i++) this.addBot(room, options.difficulty);
      this.start(room, identity.id);
    }
    await this.store.create(room);
    return room;
  }
  addBot(r: RoomRecord, difficulty: Difficulty) {
    requireRule(r.seats.length < r.capacity, '방이 가득 찼습니다.');
    r.seats.push({
      id: randomUUID(),
      name: [
        '이슬 마법사',
        '새벽 기사',
        '달빛 정령',
        '숲의 여행자',
        '별 수집가',
        '모래 현자',
        '안개 사냥꾼',
      ][r.seats.length - 1],
      bot: true,
      ready: true,
      team: r.mode === 'team' ? (r.seats.length % 2 ? 'B' : 'A') : 'SINGLE',
      difficulty,
      lastSeen: Date.now(),
      autopilot: true,
    });
  }
  setDeadline(r: RoomRecord) {
    if (!r.game || r.game.phase === 'FINISHED') {
      r.deadline = 0;
      return;
    }
    const seat = r.seats.find((p) => p.id === waitingActor(r.game!));
    r.deadline = Date.now() + (seat?.bot || seat?.autopilot ? this.botDelay : this.turnMs);
  }
  start(r: RoomRecord, id: string) {
    requireRule(r.host === id, '방장만 시작할 수 있습니다.');
    requireRule(!r.game || r.game.phase === 'FINISHED', '이미 진행 중입니다.');
    requireRule(
      r.seats.length >= 2 && r.seats.every((p) => p.ready),
      '2명 이상 모두 준비해야 합니다.',
    );
    r.commands = [];
    r.game = createGame(r.id, r.seats, randomBytes(4).readUInt32LE());
    this.setDeadline(r);
  }
  async join(id: string, identity: Identity, pass = '', spectate = false) {
    return this.store.mutate(id, (r) => {
      const seat = r.seats.find((p) => p.id === identity.id);
      if (seat) {
        seat.lastSeen = Date.now();
        seat.autopilot = false;
        if (r.game && r.game.phase !== 'FINISHED' && waitingActor(r.game) === identity.id)
          this.setDeadline(r);
        return;
      }
      requireRule(
        !r.passwordHash ||
          timingSafeEqual(
            Buffer.from(r.passwordHash, 'hex'),
            Buffer.from(password(pass, id), 'hex'),
          ),
        '비밀번호가 올바르지 않습니다.',
      );
      if (spectate) {
        if (!r.spectators.includes(identity.id)) r.spectators.push(identity.id);
        return;
      }
      requireRule(
        !r.game || r.game.phase === 'FINISHED',
        '진행 중인 방에는 관전으로 참가해 주세요.',
      );
      requireRule(r.seats.length < r.capacity, '방이 가득 찼습니다.');
      if (!r.seats.some((p) => !p.bot)) r.host = identity.id;
      r.seats.push({
        id: identity.id,
        name: identity.name,
        bot: false,
        ready: false,
        team: r.mode === 'team' ? (r.seats.length % 2 ? 'B' : 'A') : 'SINGLE',
        difficulty: 'normal',
        lastSeen: Date.now(),
        autopilot: false,
      });
    });
  }
  async command(id: string, identity: Identity, input: any) {
    return this.store.mutate(id, (r) => {
      const seat = r.seats.find((p) => p.id === identity.id);
      const host = r.host === identity.id;
      requireRule(seat || r.spectators.includes(identity.id), '이 방에 참가하지 않았습니다.');
      if (seat) {
        seat.lastSeen = Date.now();
        if (input.type !== 'heartbeat') {
          const reclaimed = seat.autopilot;
          seat.autopilot = false;
          if (
            reclaimed &&
            r.game &&
            r.game.phase !== 'FINISHED' &&
            waitingActor(r.game) === identity.id
          )
            this.setDeadline(r);
        }
      }
      if (input.type === 'heartbeat') return;
      if (input.type === 'chat') {
        const text = z.string().trim().min(1).max(300).parse(input.text);
        r.chat.push({ id: randomUUID(), name: seat?.name ?? '관전자', text });
        r.chat = r.chat.slice(-100);
        return;
      }
      if (input.type === 'leave' && !seat) {
        r.spectators = r.spectators.filter((id) => id !== identity.id);
        return;
      }
      requireRule(seat, '관전자는 게임을 조작할 수 없습니다.');
      if (input.type === 'action') {
        requireRule(r.game, '경기를 시작해 주세요.');
        const envelope = envelopeSchema.parse(input.envelope);
        r.game = applyAction(r.game, identity.id, envelope);
        r.commands.push({ actor: identity.id, envelope });
        this.setDeadline(r);
        return;
      }
      if (input.type === 'leave') {
        seat.autopilot = true;
        seat.lastSeen = 0;
        if (!r.game || r.game.phase === 'FINISHED') {
          r.seats = r.seats.filter((p) => p.id !== identity.id);
          if (host) r.host = r.seats.find((p) => !p.bot)?.id ?? r.seats[0]?.id ?? '';
        } else {
          if (host) r.host = r.seats.find((p) => !p.bot && p.id !== identity.id)?.id ?? identity.id;
          this.setDeadline(r);
        }
        return;
      }
      if (input.type === 'start') {
        this.start(r, identity.id);
        return;
      }
      requireRule(
        !r.game || r.game.phase === 'FINISHED',
        '대전 중에는 방 설정을 바꿀 수 없습니다.',
      );
      if (input.type === 'ready') {
        seat.ready = z.boolean().parse(input.ready);
        return;
      }
      if (input.type === 'team') {
        requireRule(r.mode === 'team', '팀전 방이 아닙니다.');
        seat.team = z.enum(['A', 'B', 'C', 'D']).parse(input.team);
        return;
      }
      requireRule(host, '방장만 사용할 수 있습니다.');
      if (input.type === 'addBot') {
        this.addBot(r, z.enum(['easy', 'normal', 'hard']).parse(input.difficulty ?? 'normal'));
        return;
      }
      if (input.type === 'removeBot') {
        requireRule(
          r.seats.some((p) => p.bot && p.id === input.id),
          '봇을 찾을 수 없습니다.',
        );
        r.seats = r.seats.filter((p) => !p.bot || p.id !== input.id);
        return;
      }
      throw new Error('지원하지 않는 요청입니다.');
    });
  }
  async tick(id: string) {
    const existing = await this.store.get(id);
    if (
      !existing?.game ||
      !existing.deadline ||
      existing.deadline > Date.now() ||
      existing.game.phase === 'FINISHED'
    )
      return existing;
    return this.store.mutate(id, (r) => {
      if (!r.game || !r.deadline || r.deadline > Date.now() || r.game.phase === 'FINISHED') return;
      const actor = waitingActor(r.game),
        seat = r.seats.find((p) => p.id === actor);
      if (seat && !seat.bot) seat.autopilot = true;
      const decision = botDecision(r.game, actor);
      r.game = decision.state;
      r.commands.push({ actor, envelope: decision.envelope });
      this.setDeadline(r);
    });
  }
  async snapshot(id: string, viewer: string) {
    const r = await this.store.get(id);
    if (!r) return null;
    requireRule(
      r.seats.some((p) => p.id === viewer) || r.spectators.includes(viewer),
      '방에 참가해 주세요.',
    );
    return this.project(r, viewer);
  }
  project(r: RoomRecord, viewer: string) {
    const seat = r.seats.find((p) => p.id === viewer);
    const fog = Boolean(r.game?.players.find((p) => p.id === viewer)?.harms.includes('FOG'));
    return {
      id: r.id,
      name: r.name,
      host: r.host,
      private: r.private,
      capacity: r.capacity,
      mode: r.mode,
      revision: r.revision,
      seats: r.seats.map((p) => ({
        id: p.id,
        name: fog && p.id !== viewer ? '안개 속 여행자' : p.name,
        bot: p.bot,
        ready: p.ready,
        team: p.team,
        difficulty: p.difficulty,
        autopilot: p.autopilot,
        connected: !p.bot && Date.now() - p.lastSeen < 45000,
      })),
      deadline: r.deadline,
      chat: r.chat,
      game: r.game ? viewFor(r.game, seat ? viewer : undefined) : null,
    };
  }
}
