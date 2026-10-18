// @vitest-environment happy-dom
import { it, expect, vi } from 'vitest';
import { createGame, viewFor, applyAction } from '../server/src/game/GameEngine';
import { give } from '../server/src/game/CardRegistry';
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
    deadline: Date.now() + 30000,
    chat: [{ id: 'x', name: '<script>', text: '<img src=x onerror=alert(1)>' }],
    game: viewFor(state, 'me'),
  };
  function update() {
    fixture.connection.dispatchEvent(
      new CustomEvent('data', {
        detail: { type: 'room', room: { ...room, game: viewFor(state, 'me') } },
      }),
    );
  }
  update();
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
  expect(document.querySelector('.action-dock [data-use]')).not.toBeNull();
  expect(document.querySelector('.chat-items script')).toBeNull();
  expect(document.querySelector('.chat-items img')).toBeNull();
  (document.querySelector('[data-card]') as HTMLButtonElement).click();
  (document.querySelector('[data-target="enemy"]') as HTMLButtonElement).click();
  (document.querySelector('[data-use]') as HTMLButtonElement).click();
  const request = fixture.connection.sent.at(-1);
  expect(request.type).toBe('action');
  expect(request.envelope.action.target).toBe('enemy');
  state = applyAction(state, 'me', request.envelope);
  update();
  expect(state.phase).toBe('DEFENSE_SELECTION');
  expect(document.body.textContent).toContain('방어를 기다리는 중');
  expect((document.querySelector('[data-use]') as HTMLButtonElement).disabled).toBe(true);
  state.current!.cards = [
    { ...state.current!.cards[0], id: 1000, name: { ko: '수호자의 파동', en: 'Summon' } },
  ];
  update();
  expect(document.querySelector('.played-cards')?.textContent).toContain('수호자의 파동');
  fixture.connection.dispatchEvent(new CustomEvent('data', { detail: { type: 'left' } }));
  (document.querySelector('[data-page="codex"]') as HTMLButtonElement).click();
  expect(document.body.textContent).toContain('364개 카드 규칙');
  const input = document.querySelector<HTMLInputElement>('#codex-search')!;
  input.value = '새벽의 씨앗';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  expect(document.querySelectorAll('.codex-card')).toHaveLength(1);
  expect(document.querySelector('.codex-card')?.textContent).toContain('새벽의 씨앗');
  (document.querySelector('[data-page="home"]') as HTMLButtonElement).click();
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
  vi.clearAllTimers();
  vi.useRealTimers();
});
