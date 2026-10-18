// @vitest-environment happy-dom
import { it, expect, vi } from 'vitest';
import { createGame, viewFor, applyAction } from '../server/src/game/GameEngine';
import { give } from '../server/src/game/CardRegistry';
import { endgameRisk } from '../server/src/game/EndgameManager';
const fixture = vi.hoisted(() => ({ connection: null as any }));
vi.mock('../client/src/network', () => ({
  Connection: class extends EventTarget {
    connected = true;
    id = 'me';
    roomId = '';
    sent: any[] = [];
    constructor() {
      super();
      fixture.connection = this;
    }
    connect() {}
    send(v: any) {
      this.sent.push(v);
    }
  },
}));
vi.mock('../client/src/audio', () => ({
  sound: () => {},
  unlockAudio: () => {},
  setMusic: () => {},
  preferences: { effects: 0, music: 0, motion: false },
}));
it('connects Korean home controls to a real validated game action and escapes chat', async () => {
  vi.useFakeTimers();
  localStorage.clear();
  localStorage.setItem('arena-tutorial', '1');
  document.body.innerHTML =
    '<div id="app"></div><div id="toast"></div><dialog id="dialog"></dialog>';
  await import('../client/src/main');
  expect(document.querySelector('.reference-logo')?.getAttribute('src')).toBe(
    '/assets/reference/logo.webp',
  );
  expect(document.body.textContent).toContain('탄생하기');
  expect(document.querySelector('[data-practice]')).toBeNull();
  (document.querySelector('#player-name') as HTMLInputElement).value = '예언자';
  (document.querySelector('[data-enter]') as HTMLButtonElement).click();
  expect(localStorage.getItem('arena-name')).toBe('예언자');
  expect(document.body.textContent).toContain('AI 연습 대전');
  expect(
    [...document.querySelectorAll<HTMLInputElement>('input[name="practice-doom"]')].map(
      (e) => e.value,
    ),
  ).toEqual(['1', '50', '100', '500']);
  const doom = document.querySelector<HTMLInputElement>('input[name="practice-doom"][value="50"]')!;
  doom.checked = true;
  doom.dispatchEvent(new Event('change', { bubbles: true }));
  (document.querySelector('#difficulty') as HTMLSelectElement).value = 'hard';
  document.querySelector('#difficulty')!.dispatchEvent(new Event('change', { bubbles: true }));
  (document.querySelector('[data-practice]') as HTMLButtonElement).click();
  expect(fixture.connection.sent.at(-1).options.difficulty).toBe('hard');
  expect(fixture.connection.sent.at(-1).options.doomAt).toBe(50);
  expect(fixture.connection.sent.at(-1).type).toBe('practice');
  let state = createGame(
    'room-test',
    [
      { id: 'me', name: '나' },
      { id: 'enemy', name: '상대' },
    ],
    1,
  );
  for (const p of state.players) p.hand = [];
  give(state, state.players[0], 36);
  state.attacker = 'me';
  const room = {
    id: 'room-test',
    name: '테스트',
    host: 'me',
    private: true,
    capacity: 4,
    mode: 'ffa',
    revision: 0,
    seats: state.players.map((p) => ({ ...p, ready: true, connected: true, autopilot: false })),
    deadline: Date.now() + 60000,
    timer: {
      deadline: Date.now() + 60000,
      durationMs: 60000,
      startedAt: Date.now(),
      serverNow: Date.now(),
      actor: 'me',
    },
    chat: [{ id: 'x', name: '<script>', text: '<img src=x onerror=alert(1)>' }],
    game: viewFor(state, 'me'),
  };
  function update() {
    fixture.connection.dispatchEvent(
      new CustomEvent('data', {
        detail: {
          type: 'room',
          room: {
            ...room,
            timer: { ...room.timer, serverNow: Date.now() },
            game: viewFor(state, 'me'),
          },
        },
      }),
    );
  }
  update();
  expect(document.querySelector('.reference-battle .field-players')).not.toBeNull();
  expect(document.querySelector('.miracle-rack')?.textContent).toContain('일으킨 기적');
  expect(document.querySelector('#turn-timebar')?.getAttribute('aria-valuenow')).toBe('60');
  vi.advanceTimersByTime(5000);
  expect(document.querySelector('#turn-timebar')?.getAttribute('aria-valuenow')).toBe('55');
  expect(
    parseFloat((document.querySelector('.turn-time-fill') as HTMLElement).style.width),
  ).toBeCloseTo((55 / 60) * 100);

  expect(document.body.classList.contains('end-of-world')).toBe(false);
  expect(document.querySelector('.gf-counter')?.textContent).toMatch(/\/\s*100/);
  const originalImage = document.querySelector<HTMLImageElement>('.game-card .card-art')!;
  expect(originalImage.getAttribute('src')).toMatch(/^\/assets\/original\/\d{3}\.webp$/);
  expect(originalImage.alt).toContain(document.querySelector('.card-name')!.textContent!);
  originalImage.dispatchEvent(new Event('error'));
  expect(originalImage.getAttribute('src')).toBe('/assets/card-placeholder.svg');
  expect(originalImage.style.left).toBe('0px');
  originalImage.dispatchEvent(new Event('error'));
  expect(originalImage.hidden).toBe(true);
  expect(document.querySelector('.card-name')?.textContent?.trim()).toBeTruthy();
  expect(document.querySelector('.game-card')?.getAttribute('aria-label')).toContain(
    document.querySelector('.card-name')!.textContent!,
  );
  const selection = document.querySelector('[data-card]')!.getAttribute('data-card');
  (document.querySelector('[data-hand-filter="PROTECTOR"]') as HTMLButtonElement).click();
  expect(document.querySelectorAll('.hand-cards [data-card]')).toHaveLength(0);
  (document.querySelector('[data-hand-filter="all"]') as HTMLButtonElement).click();
  expect(document.querySelector('[data-card]')?.getAttribute('data-card')).toBe(selection);
  expect(document.querySelector('.action-dock [data-pass]')).not.toBeNull();
  expect(document.querySelector('.chat-items script')).toBeNull();
  expect(document.querySelector('.chat-items img')).toBeNull();
  (document.querySelector('[data-card]') as HTMLButtonElement).click();
  expect(document.querySelector('.focus-card h3')?.textContent).toBe(
    document.querySelector('.card-name')!.textContent,
  );
  (document.querySelector('[data-target="enemy"]') as HTMLButtonElement).click();
  (document.querySelector('[data-use]') as HTMLButtonElement).click();
  const request = fixture.connection.sent.at(-1);
  expect(request.type).toBe('action');
  expect(request.envelope.action.target).toBe('enemy');
  state = applyAction(state, 'me', request.envelope);
  update();
  expect(state.phase).toBe('DEFENSE_SELECTION');
  expect(document.body.textContent).toContain('방어를 기다리는 중');
  expect(document.querySelector('.action-dock.inactive')).not.toBeNull();
  state.current!.cards = [
    { ...state.current!.cards[0], id: 1000, name: { ko: '수호자의 파동', en: 'Summon' } },
  ];
  update();
  expect(document.querySelector('.played-cards')?.textContent).toContain('수호자의 파동');
  expect(document.querySelector('.focus-card [data-detail="1000"]')).toBeNull();
  state.rules.doomAt = 1;
  update();
  expect(document.body.classList.contains('end-of-world')).toBe(true);
  expect(document.querySelector('.gf-counter.is-doom')).not.toBeNull();
  expect(document.querySelector('.demon-event')).toBeNull();
  state.rules.demonChance = 1;
  endgameRisk(state, state.players[0], 1);
  update();
  expect(document.querySelector('.demon-event')?.textContent).toContain('악마 출현');
  fixture.connection.dispatchEvent(
    new CustomEvent('data', { detail: { type: 'room_closed', message: '방이 종료되었습니다.' } }),
  );
  expect(document.querySelector('.reference-battle')).toBeNull();
  expect(document.body.classList.contains('end-of-world')).toBe(false);
  expect(document.body.textContent).toContain('게임방 목록');
  (document.querySelector('[data-page="home"]') as HTMLButtonElement).click();
  (document.querySelector('[data-enter]') as HTMLButtonElement).click();
  (document.querySelector('[data-page="codex"]') as HTMLButtonElement).click();
  expect(document.body.textContent).toContain('364개 카드 규칙');
  const input = document.querySelector<HTMLInputElement>('#codex-search')!;
  input.value = '새벽의 씨앗';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  expect(document.querySelectorAll('.codex-card')).toHaveLength(1);
  expect(document.querySelector('.codex-card')?.textContent).toContain('새벽의 씨앗');
  (document.querySelector('[data-page="home"]') as HTMLButtonElement).click();
  (document.querySelector('[data-enter]') as HTMLButtonElement).click();
  expect(
    document.querySelector<HTMLInputElement>('input[name="practice-doom"]:checked')?.value,
  ).toBe('50');
  (document.querySelector('[data-create]') as HTMLButtonElement).click();
  const lateDoom = document.querySelector<HTMLInputElement>('input[name="doomAt"][value="500"]')!;
  lateDoom.checked = true;
  document
    .querySelector('#create-form')!
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  expect(fixture.connection.sent.at(-1).options.doomAt).toBe(500);
  const waiting = {
    ...room,
    game: undefined,
    doomAt: 500,
    seats: [],
    members: [{ id: 'me', name: '예언자', queued: false, connected: true }],
  };
  fixture.connection.dispatchEvent(
    new CustomEvent('data', { detail: { type: 'room', room: waiting } }),
  );
  expect(document.querySelector('.reference-wait')).not.toBeNull();
  expect(document.querySelectorAll('.reference-seat')).toHaveLength(9);
  expect(document.querySelectorAll('.reference-seat:not(.empty-seat)')).toHaveLength(0);
  expect(document.querySelector('[data-ready]')).toBeNull();
  expect(document.querySelector('.reference-members')?.textContent).toContain('예언자');
  (document.querySelector('[data-team-choice="SINGLE"]') as HTMLButtonElement).click();
  expect(fixture.connection.sent.at(-1)).toEqual({ type: 'chooseTeam', team: 'SINGLE' });
  expect(document.querySelectorAll('.reference-seat:not(.empty-seat)')).toHaveLength(0);
  fixture.connection.dispatchEvent(
    new CustomEvent('data', {
      detail: { type: 'room', room: { ...room, game: undefined, doomAt: 500 } },
    }),
  );
  (document.querySelector('[data-ready]') as HTMLButtonElement).click();
  expect(fixture.connection.sent.at(-1)).toEqual({ type: 'ready', ready: false });
  (document.querySelector('.reference-doom') as HTMLButtonElement).click();
  (document.querySelector('[data-room-doom="50"]') as HTMLButtonElement).click();
  expect(fixture.connection.sent.at(-1)).toEqual({ type: 'doomAt', value: 50 });
  (document.querySelector('.reference-footer-name') as HTMLButtonElement).click();
  (document.querySelector('[data-cancel-queue]') as HTMLButtonElement).click();
  expect(fixture.connection.sent.at(-1)).toEqual({ type: 'cancelQueue' });

  (document.querySelector('.reference-footer-name') as HTMLButtonElement).click();
  fixture.connection.dispatchEvent(
    new CustomEvent('data', {
      detail: {
        type: 'room',
        room: { ...room, game: undefined, seats: room.seats.map((p) => ({ ...p, ready: false })) },
      },
    }),
  );
  expect((document.querySelector('#dialog [data-start]') as HTMLButtonElement).disabled).toBe(true);
  fixture.connection.dispatchEvent(
    new CustomEvent('data', {
      detail: { type: 'room', room: { ...room, game: undefined } },
    }),
  );
  expect((document.querySelector('#dialog [data-start]') as HTMLButtonElement).disabled).toBe(
    false,
  );
  (document.querySelector('#dialog [data-start]') as HTMLButtonElement).click();
  expect(fixture.connection.sent.at(-1)).toEqual({ type: 'start' });
  expect((document.querySelector('#dialog') as HTMLDialogElement).open).toBe(false);

  // Real engine actions behind the portrait defense and result controls.
  state = createGame(
    'mobile-defense',
    [
      { id: 'me', name: '나' },
      { id: 'enemy', name: '상대' },
    ],
    11,
    { demonChance: 0, diseaseChance: 0, summonChance: 0 },
  );
  state.players.forEach((p) => {
    p.hand = [];
    p.abilities = [];
  });
  state.attacker = 'enemy';
  give(state, state.players[1], 36);
  state = applyAction(state, 'enemy', {
    id: 'incoming',
    version: state.version,
    action: { kind: 'attack', pieces: [state.players[1].hand[0].uid], target: 'me' },
  });
  update();
  expect(document.querySelector('.reference-incoming-power')?.textContent).toBe(
    '공격' + state.current!.damage,
  );
  expect(document.querySelector('.reference-impact')?.getAttribute('aria-label')).toContain(
    '방어 전 예상 피해',
  );
  (document.querySelector('[data-take]') as HTMLButtonElement).click();
  const defenseRequest = fixture.connection.sent.at(-1);
  expect(defenseRequest.envelope.action).toEqual({ kind: 'defend', pieces: [] });
  state = applyAction(state, 'me', defenseRequest.envelope);
  update();
  expect(document.querySelector('.reference-impact')?.getAttribute('aria-label')).toContain(
    '실제 피해',
  );
  const actualDamage = state.events
    .filter((e) => e.type === 'damage' && e.target === 'me')
    .at(-1)!.amount;
  expect(document.querySelector('.reference-impact b')?.textContent).toBe(String(actualDamage));
  const sentBeforeAnimation = fixture.connection.sent.length;
  vi.advanceTimersByTime(500);
  expect(fixture.connection.sent).toHaveLength(sentBeforeAnimation);
  (document.querySelector('[data-hand-menu]') as HTMLButtonElement).click();
  expect(document.querySelector('.mobile-hand-controls')).not.toBeNull();
  (document.querySelector('#dialog [data-hand-filter="PROTECTOR"]') as HTMLButtonElement).click();
  expect((document.querySelector('#dialog') as HTMLDialogElement).open).toBe(false);
  (document.querySelector('[data-hand-filter="all"]') as HTMLButtonElement).click();
  (document.querySelector('[data-toggle-miracles]') as HTMLButtonElement).click();
  expect(document.querySelector('.empty-miracles')?.textContent).toContain('아직 일으킨 기적');
  (document.querySelector('[data-toggle-miracles]') as HTMLButtonElement).click();
  state = createGame(
    'mobile-victory',
    [
      { id: 'me', name: '나' },
      { id: 'enemy', name: '상대' },
    ],
    12,
    { demonChance: 0, diseaseChance: 0, summonChance: 0 },
  );
  state.players.forEach((p) => {
    p.hand = [];
    p.abilities = [];
  });
  state.players[1].hp = 1;
  state.attacker = 'me';
  give(state, state.players[0], 36);
  state = applyAction(state, 'me', {
    id: 'last-attack',
    version: state.version,
    action: { kind: 'attack', pieces: [state.players[0].hand[0].uid], target: 'enemy' },
  });
  update();
  state = applyAction(state, 'enemy', {
    id: 'last-defense',
    version: state.version,
    action: { kind: 'defend', pieces: [] },
  });
  update();
  expect(state.phase).toBe('FINISHED');
  expect(document.querySelector('.reference-impact b')?.textContent).toBe('1');
  vi.advanceTimersByTime(200);
  expect(document.querySelector('.reference-ascension')?.textContent).toBe('승천');
  vi.advanceTimersByTime(200);
  expect(document.querySelector('.result.awaiting-cue')).toBeNull();
  expect(document.querySelector('.result h2')?.textContent).toBe('승리');
  expect(document.querySelector('.result-winners')?.textContent).toContain('나');
  expect(document.querySelector('.fallen-players [data-player="enemy"]')).not.toBeNull();
  expect(document.querySelector('.field-players [data-player="enemy"]')).toBeNull();
  (document.querySelector('.result-end') as HTMLButtonElement).click();
  expect(fixture.connection.sent.at(-1)).toEqual({ type: 'leave' });
  fixture.connection.dispatchEvent(new CustomEvent('data', { detail: { type: 'left' } }));
  expect(document.querySelector('.reference-cue')).toBeNull();

  state = createGame(
    'expired-input',
    [
      { id: 'me', name: '나' },
      { id: 'enemy', name: '상대' },
    ],
    4,
  );
  state.attacker = 'me';
  const expiredAt = Date.now() + 1000;
  fixture.connection.dispatchEvent(
    new CustomEvent('data', {
      detail: {
        type: 'room',
        room: {
          ...room,
          deadline: expiredAt,
          timer: {
            deadline: expiredAt,
            startedAt: Date.now(),
            durationMs: 1000,
            serverNow: Date.now(),
            actor: 'me',
          },
          game: viewFor(state, 'me'),
        },
      },
    }),
  );
  expect(document.querySelector('#turn-timebar')?.getAttribute('aria-valuenow')).toBe('1');
  vi.advanceTimersByTime(1000);
  expect(document.querySelector('#turn-timebar')?.getAttribute('aria-valuenow')).toBe('0');
  expect((document.querySelector('.action-dock [data-pass]') as HTMLButtonElement).disabled).toBe(
    true,
  );
  const actionsBefore = fixture.connection.sent.filter((m: any) => m.type === 'action').length;
  (document.querySelector('.action-dock [data-pass]') as HTMLButtonElement).click();
  expect(fixture.connection.sent.filter((m: any) => m.type === 'action')).toHaveLength(
    actionsBefore,
  );
  fixture.connection.dispatchEvent(new CustomEvent('data', { detail: { type: 'left' } }));
  vi.clearAllTimers();
  vi.useRealTimers();
});
