/// <reference types="vite/client" />
import './style.css';
import './field.css';
import './mobile.css';
import { BattlePresentation } from './presentation';
import { remainingTurnTime } from './turn-clock';
import { battleView } from './battle';
import { esc, icon } from './html';
import {
  createIcons,
  Sparkles,
  Swords,
  Shield,
  Flame,
  Droplets,
  Leaf,
  Mountain,
  Sun,
  Moon,
  Coins,
  Heart,
  Zap,
  Users,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  Settings,
  Volume2,
  Clock,
  Wifi,
  WifiOff,
  Plus,
  Check,
  X,
  Send,
  ScrollText,
  Bot,
  Crown,
  Eye,
  LogOut,
  Search,
  RotateCcw,
  Layers,
  MoveUpRight,
  Star,
  Orbit,
  Link,
  Trash2,
} from 'lucide';
import {
  cards,
  card,
  typeNames,
  attributeNames,
  statusNames,
  attackValue,
  defenseValue,
  assistantArt,
  summonArt,
} from '../../shared/catalog';
import type {
  Action,
  GameView,
  Piece,
  GameEvent,
  CardDefinition,
  Difficulty,
} from '../../shared/types';
import { doomStartTurns, playerCounts } from '../../shared/settings';
import type { DoomStartTurn } from '../../shared/types';
import type { RoomService } from '../../server/src/rooms/RoomService';
import { Connection } from './network';
import { animateEvent } from './animations';
import { sound, unlockAudio, preferences, setMusic } from './audio';
import { battleClip } from '../../shared/sounds';
type Room = ReturnType<RoomService['project']>;
const conn = new Connection(),
  app = document.querySelector<HTMLDivElement>('#app')!,
  dialog = document.querySelector<HTMLDialogElement>('#dialog')!;
let showSidebar = false;
let showMiracles = false;
let hoveredUid = '';
let handFilter = 'all';
let serverClockOffset = 0;
const storedDoom = Number(localStorage.getItem('arena-doom-at'));
const storedPlayers = Number(localStorage.getItem('arena-practice-players'));
let practicePlayers = playerCounts.some((n) => n === storedPlayers) ? storedPlayers : 4;
let doomAt: DoomStartTurn = doomStartTurns.includes(storedDoom as DoomStartTurn)
  ? (storedDoom as DoomStartTurn)
  : 100;
let tutorialStep = 0;
let page = 'home',
  room: Room | null = null,
  lobby: any[] = [],
  selected: string[] = [],
  target = '',
  lastVersion = -1,
  lastEvent = 0,
  lastMatch = '',
  pending = false,
  difficulty: Difficulty = 'normal',
  codexType = '',
  codexAttribute = '',
  codexSearch = '',
  codexLimit = 48;
const presentation = new BattlePresentation(() => {
  if (room?.game) render();
});
const icons = {
  Sparkles,
  Swords,
  Shield,
  Flame,
  Droplets,
  Leaf,
  Mountain,
  Sun,
  Moon,
  Coins,
  Heart,
  Zap,
  Users,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  Settings,
  Volume2,
  Clock,
  Wifi,
  WifiOff,
  Plus,
  Check,
  X,
  Send,
  ScrollText,
  Bot,
  Crown,
  Eye,
  LogOut,
  Search,
  RotateCcw,
  Layers,
  MoveUpRight,
  Star,
  Orbit,
  Link,
  Trash2,
};
const attrIcon: Record<string, string> = {
  '': 'Orbit',
  FIRE: 'Flame',
  WATER: 'Droplets',
  TREE: 'Leaf',
  SOIL: 'Mountain',
  LIGHT: 'Sun',
  DARK: 'Moon',
};
const typeIcon: Record<string, string> = {
  WEAPON: 'Swords',
  PROTECTOR: 'Shield',
  MAGIC: 'Sparkles',
  TRADE: 'Coins',
  SUNDRY: 'Star',
  CREATURE: 'Orbit',
  FIXED: 'Clock',
};
const difficultyOptions = () =>
  `<option value="easy" ${difficulty === 'easy' ? 'selected' : ''}>쉬움 · 가볍게 연습</option><option value="normal" ${difficulty === 'normal' ? 'selected' : ''}>보통 · 균형 잡힌 대전</option><option value="hard" ${difficulty === 'hard' ? 'selected' : ''}>어려움 · 전략적인 승부</option>`;
function hydrate() {
  createIcons({ icons });
}
function toast(text: string) {
  const t = document.querySelector('#toast')!;
  t.textContent = text;
  t.classList.add('visible');
  window.setTimeout(() => t.classList.remove('visible'), 4000);
}
function modal(html: string) {
  dialog.innerHTML = `<button class="icon-button dialog-close" data-close aria-label="닫기">${icon('X')}</button>${html}`;
  dialog.showModal();
  hydrate();
}
function header() {
  const g = room?.game;
  const label = room
    ? g
      ? room.practice
        ? '훈련'
        : room.name
      : room.private
        ? '비밀 결투'
        : room.name
    : ({ menu: '메뉴', lobby: '게임방 목록', codex: '카드 도감', guide: '교전' }[page] ?? '');
  return `<header class="topbar reference-header">${page !== 'home' || room ? `<button class="reference-back" ${room ? 'data-leave' : 'data-page="home"'} aria-label="뒤로">←</button><strong class="reference-screen-name">${esc(label)}</strong>` : ''}${g ? `<span class="gf-counter ${g.doom >= 100 ? 'is-doom' : ''}" aria-label="현재 ${g.turn}턴, 종말 ${g.rules.doomAt}턴">G.F.<b>${g.turn}</b><span> /${g.rules.doomAt}</span></span>` : ''}<button class="reference-book" data-help><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2" fill="currentColor"/><path fill="#eeffee" d="M10 4h5v9l-2.5-2L10 13z"/></svg><span class="reference-book-label">교전</span></button></header>`;
}
function doomOptions(name: string, value = doomAt) {
  return `<fieldset class="doom-options"><legend>재앙 · 종말 시작 턴</legend>${doomStartTurns.map((n) => `<label><input type="radio" name="${name}" value="${n}" ${n === value ? 'checked' : ''}><span>${n}</span></label>`).join('')}<small>선택한 턴부터 악마가 출현할 수 있습니다.</small></fieldset>`;
}
function home() {
  return `<main class="reference-home"><img class="reference-logo" src="/assets/reference/logo.webp" alt="GOD FIELD"><label class="reference-name-label" for="player-name">예언자의 이름</label><input class="reference-name-input" id="player-name" maxlength="20" value="${esc(localStorage.getItem('arena-name') || '')}" aria-label="예언자의 이름"><button class="reference-birth" data-enter>탄생하기</button><a class="reference-app-store" href="https://apps.apple.com/kr/app/id1536427424?l=ko" target="_blank" rel="noopener" aria-label="원작 God Field App Store"><img src="/assets/reference/app-store.svg" alt="App Store에서 다운로드하기"></a><a class="reference-google-play" href="https://play.google.com/store/apps/details?id=net.godfield&hl=ko" target="_blank" rel="noopener" aria-label="원작 God Field Google Play"><img src="/assets/reference/google-play.webp" alt="Google Play에서 다운로드하기"></a></main>`;
}
function modeMenu() {
  return `<main class="reference-menu"><section><h1>훈련</h1><label>참가 인원<select id="practice-players">${playerCounts.map((n) => `<option value="${n}" ${n === practicePlayers ? 'selected' : ''}>${n}명 · 나 + AI ${n - 1}명</option>`).join('')}</select></label><label>AI 난이도<select id="difficulty">${difficultyOptions()}</select></label>${doomOptions('practice-doom')}<button class="button primary" data-practice>AI 연습 대전</button></section><section><h1>결투</h1><button class="button primary" data-create>비밀 결투 · 방 만들기</button><button class="button" data-page="lobby">게임방 목록</button><button class="button" data-join-code>초대 코드로 참가</button><button class="button" data-page="codex">카드 도감</button><button class="button" data-page="guide">게임 방법</button></section></main>`;
}
function lobbyPage() {
  return `<main class="page-container"><div class="page-heading"><div><div class="eyebrow">MULTIPLAYER</div><h1>게임방 목록</h1><p>방을 만들고 친구와 실시간으로 대전해 보세요.</p></div><button class="button primary" data-create>${icon('Plus')} 방 만들기</button></div><div class="section-bar"><h2>공개 게임방 <span class="count">${lobby.length}</span></h2><div><button class="button small" data-join-code>${icon('Link')} 초대 코드로 참가</button><button class="icon-button" data-refresh aria-label="새로 고침">${icon('RotateCcw')}</button></div></div><div class="room-list">${lobby.length ? lobby.map((r) => `<article class="lobby-card"><span class="path-icon ${r.mode === 'team' ? 'gold' : 'mint'}">${icon('Users', 28)}</span><div class="grow"><div class="tags"><span>${r.mode === 'team' ? '팀전' : '개인전'}</span>${r.locked ? '<span>비밀번호</span>' : ''}${r.playing ? '<span>대전 중</span>' : ''}</div><h3>${esc(r.name)}</h3><p>${r.count} / ${r.capacity} 명 · 재앙 ${r.doomAt ?? 100}턴</p></div><button class="button" data-join="${esc(r.id)}" data-locked="${r.locked}" data-spectate="${r.playing}">${r.playing ? '관전하기' : '참가하기'} ${icon('ArrowRight')}</button></article>`).join('') : `<div class="empty-state">${icon('Orbit', 48)}<h3>${conn.connected ? '아직 열린 방이 없어요' : '서버와 연결하고 있어요'}</h3><p>${conn.connected ? '첫 번째 방을 만들거나, AI와 먼저 연습해 보세요.' : '연결되면 게임방 목록을 불러옵니다.'}</p><button class="button primary" data-create>새로운 방 만들기</button></div>`}</div></main>`;
}
function waitingRoom() {
  if (!room) return '';
  const host = room.host === conn.id;
  const own = room.seats.find((p) => p.id === conn.id);
  const members = room.members ?? room.seats.filter((p) => !p.bot);
  const full = !own && room.seats.length >= room.capacity;
  const singleDisabled = full || (room.seats.length > 0 && room.mode !== 'ffa');
  const teamDisabled = full || (room.seats.length > 0 && room.mode !== 'team');
  return `<main class="reference-wait"><div class="reference-solo"><button class="reference-mode-title" data-team-choice="SINGLE" ${singleDisabled ? 'disabled' : ''}>개인전</button><button class="reference-team solo-choice ${own && room.mode === 'ffa' ? 'chosen' : ''}" data-team-choice="SINGLE" ${singleDisabled ? 'disabled' : ''} aria-label="개인전 선택"><span class="team-mark team-solo"></span></button></div><section class="reference-seats" aria-label="참가자">${Array.from(
    { length: 9 },
    (_, i) => {
      const seat = room!.seats[i];
      return seat
        ? `<button class="reference-seat ${seat.ready ? 'seat-ready' : ''}" ${seat.id === conn.id ? 'data-ready' : 'data-room-controls'} aria-label="${esc(seat.name)} · ${seat.ready ? '준비 완료' : '준비 중'}"><span class="team-mark team-${room!.mode === 'team' ? esc(seat.team) : 'solo'}"></span><b>${esc(seat.name)}${seat.id === room!.host ? '(방장)' : ''}</b></button>`
        : '<div class="reference-seat empty-seat" aria-hidden="true"></div>';
    },
  ).join(
    '',
  )}</section>${!own ? '<p class="reference-queue-hint">' + (full ? '대기열이 가득 찼습니다.<br>참가자가 나갈 때까지 기다려 주세요.' : '개인전 또는 팀을 눌러<br>대기열에 참가하세요.') + '</p>' : ''}<section class="reference-teams"><h2 class="reference-mode-title">팀전</h2>${['A', 'B', 'C', 'D'].map((team) => `<button class="reference-team team-choice-${team} ${room!.mode === 'team' && own?.team === team ? 'chosen' : ''}" data-team-choice="${team}" ${teamDisabled ? 'disabled' : ''} aria-label="${team} 팀 선택"><span class="team-mark team-${team}"></span></button>`).join('')}</section><button class="reference-doom" data-room-controls><b>종말의 시간</b><span>G.F.${room.doomAt ?? 100}</span></button><div class="reference-members">${members.map((seat) => `<button data-room-controls title="${room!.seats.some((p) => p.id === seat.id) ? '대기열 참가 중' : '대기실 입장 · 대기열 미참가'}">${esc(seat.name)}${seat.id === room!.host ? '(방장)' : ''}</button>`).join('')}${host && room.seats.length >= 2 && room.seats.every((p) => p.ready) ? '<button data-start>시작하기</button>' : ''}</div><aside class="reference-chat-log ${showSidebar ? 'expanded' : ''}" ${showSidebar ? '' : 'hidden'}><button class="reference-close" data-toggle-sidebar aria-label="게시록 닫기">×</button>${room.chat.map((c) => `<p><b>${esc(c.name)}</b> ${esc(c.text)}</p>`).join('') || '<p>아직 게시물이 없습니다.</p>'}</aside></main>`;
}
function referenceFooter() {
  const name =
    room?.game?.players.find((p) => p.id === conn.id)?.name ??
    room?.members?.find((p) => p.id === conn.id)?.name ??
    room?.seats.find((p) => p.id === conn.id)?.name ??
    localStorage.getItem('arena-name') ??
    '';
  return `<footer class="field-footer reference-footer"><button class="reference-footer-name" ${room?.game ? 'data-toggle-sidebar aria-label="기록·채팅 열기"' : room ? 'data-room-controls aria-label="준비·봇·시작 설정"' : 'data-page="menu"'}>${esc(name)}</button>${room?.game?.self ? '<button class="mobile-card-menu" data-hand-menu>카드 메뉴</button>' : ''}${page === 'home' && !room ? `<button class="reference-settings" data-settings>${icon('Settings', 22)} 설정</button>` : room && !room.game ? `<form id="chat-form" class="reference-footer-chat"><input id="chat-input" name="message" aria-label="채팅 메시지" maxlength="300" autocomplete="off"><button type="submit">${icon('ScrollText', 18)} 방에 게시를 내리기</button></form><button class="reference-history" data-toggle-sidebar>${icon('Clock', 19)} 게시록</button>` : ''}<button class="reference-volume" data-settings aria-label="효과음 및 배경 음악 설정">${icon('Volume2', 24)}<span class="volume-bars" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<i class="${i < Math.round(preferences.effects * 10) ? 'on' : ''}"></i>`).join('')}</span></button></footer>`;
}
function showRoomControls() {
  if (!room || room.game) return;
  const host = room.host === conn.id;
  const own = room.seats.find((p) => p.id === conn.id);
  modal(
    `<h2>방 설정</h2><p>${esc(room.name)}</p><div class="reference-modal-controls">${own ? `<button class="button" data-ready>${own.ready ? '준비 취소' : '준비 완료'}</button><button class="button" data-cancel-queue>대기열 참가 취소</button>` : '<p>개인전 또는 팀 버튼을 눌러 대기열에 먼저 참가해 주세요.</p>'}<button class="button" data-invite>초대 링크 복사</button>${
      host
        ? `<button class="button" data-add-bot ${room.seats.length >= room.capacity ? 'disabled' : ''}>AI 추가</button><button class="button primary" data-start ${room.seats.length < 2 || !room.seats.every((p) => p.ready) ? 'disabled' : ''}>시작하기</button><fieldset><legend>종말의 시간</legend>${doomStartTurns.map((n) => `<button class="button" data-room-doom="${n}">${n}</button>`).join('')}</fieldset>${room.seats
            .filter((p) => p.bot)
            .map(
              (p) =>
                `<button class="button" data-remove-bot="${p.id}">${esc(p.name)} 삭제</button>`,
            )
            .join('')}`
        : ''
    }</div>`,
  );
}
function artHtml(image: string, sprite: CardDefinition['imageSprite'], name: string, size: number) {
  const style = sprite
    ? `position:absolute;width:calc(var(--art-size) * ${sprite.atlasWidth / sprite.width});height:calc(var(--art-size) * ${sprite.atlasHeight / sprite.height});left:calc(var(--art-size) * ${-sprite.x / sprite.width});top:calc(var(--art-size) * ${-sprite.y / sprite.height});max-width:none;`
    : 'width:100%;height:100%;object-fit:contain;';
  return `<span class="card-art-window" style="--art-size:${size}px"><img class="card-art" src="${esc(image)}" alt="${esc(name)} 그림" loading="lazy" decoding="async" style="${style}"></span>`;
}
function cardArt(c: CardDefinition, size = 64) {
  const original = assistantArt(c.id);
  return artHtml(original?.url ?? c.image, original?.sprite ?? c.imageSprite, c.name.ko, size);
}
function summonPortrait(type: string) {
  const art = summonArt(type);
  return art ? artHtml(art.url, art.sprite, type, 24) : icon('Orbit', 11);
}
function cardHint(c: CardDefinition) {
  if (c.hitRate) return `전체 ${c.hitRate}%`;
  if (c.attackExtra === 'INCREASE_ATK') return '추가 조합 가능';
  if (c.attackExtra === 'DOUBLE_ATK') return '공격력 2배';
  if (c.attackExtra === 'MAGIC_FREE') return '기적 MP 면제';
  if (c.attackExtra === 'REVIVE') return '사망 직전 부활';
  if (c.attackExtra === 'MORTAR') return '소지 시 주의';
  if (c.attackExtra === 'ABSORB_HP') return 'HP 흡수';
  if (c.defenseExtra.includes('REFLECT')) return '공격 반사';
  if (c.defenseExtra.includes('FLICK')) return '무작위 튕김';
  if (c.defenseExtra.includes('BLOCK')) return '완전 차단';
  if (c.defenseExtra === 'COUNTER') return '피해 기준 반격';
  if (statusNames[c.attackExtra]) return statusNames[c.attackExtra] + ' 부여';
  if (c.attackKind === 'INCREASE_HP') return `HP +${c.value}`;
  if (c.attackKind === 'INCREASE_MP') return `MP +${c.value}`;
  if (c.attackKind === 'SET_ASSISTANT') return '수호자 소환';
  if (c.attackKind.includes('REMOVE')) return '제거 · 정화';
  return c.type === 'MAGIC' ? '반복 사용 기적' : c.type === 'TRADE' ? '거래 카드' : '단일 사용';
}
function cardHtml(piece: Piece, index: number, permanent = false) {
  const c = card(piece.cardId),
    active = selected.includes(piece.uid);
  const power =
    c.attackKind === 'ATK' || c.attackExtra === 'INCREASE_ATK'
      ? attackValue(c)
      : c.defenseKind === 'DFS'
        ? defenseValue(c)
        : null;
  const label = c.attackKind === 'ATK' || c.attackExtra === 'INCREASE_ATK' ? '공격' : '방어';
  return `<article class="hand-card ${active ? 'is-selected' : ''}"><button class="game-card attr-${c.attribute || 'NONE'} ${active ? 'selected' : ''} ${permanent ? 'permanent' : ''}" data-card="${piece.uid}" aria-pressed="${active}" aria-label="${esc(c.name.ko + ' · ' + c.description.ko)}" title="${esc(c.name.ko + ' · ' + c.description.ko)}">${cardArt(c, 80)}<b class="card-name sr-only">${esc(c.name.ko)}</b>${power !== null ? `<span class="reference-card-stat ${c.hitRate ? 'probability-stat' : ''}">${c.hitRate ? c.hitRate + '% ' : ''}${label}${power}</span>` : ''}${active ? `<span class="selection-order">${selected.indexOf(piece.uid) + 1}</span>` : ''}</button><button class="card-inspect" data-detail="${c.id}" aria-label="${esc(c.name.ko)} 상세 보기">${icon('BookOpen', 15)}</button></article>`;
}
function canAct() {
  const g = room?.game;
  if (!g || g.phase === 'FINISHED' || pending || !conn.connected) return false;
  if (
    room?.deadline &&
    remainingTurnTime(
      room.timer ?? { deadline: room.deadline, durationMs: 60000 },
      Date.now() + serverClockOffset,
    ).remainingMs <= 0
  )
    return false;
  return g.phase === 'ATTACK_SELECTION'
    ? g.attacker === conn.id
    : g.phase === 'DEFENSE_SELECTION'
      ? g.current?.target === conn.id
      : g.phase === 'BUY_CONFIRMATION'
        ? Boolean(g.purchase) && g.attacker === conn.id
        : false;
}
function playerTile(p: GameView['players'][number], i: number) {
  const g = room!.game!,
    self = p.id === conn.id,
    active = p.id === g.attacker;
  const glyph = (h: string) => {
    const c = cards.find((c) => c.attackExtra === h);
    return c ? cardArt(c, 28) : '';
  };
  return `<button class="player-tile field-player ${p.dead ? 'dead' : ''} ${target === p.id ? 'targeted' : ''} ${active ? 'current-player' : ''} ${self ? 'is-self' : ''}" data-target="${p.id}" data-player="${p.id}" ${p.dead ? 'disabled' : ''} aria-pressed="${target === p.id}" aria-label="${esc(p.name)} 대상으로 선택" title="${esc(p.name)}"><span class="team-mark team-${room!.mode === 'team' ? esc(p.team) : 'solo'}"></span><b class="reference-player-name ${p.name.length > 5 ? 'long-name' : ''}">${esc(p.name)}</b><span class="stats"><span>HP <b>${p.hp ?? '?'}</b></span><span>MP <b>${p.mp ?? '?'}</b></span><span>₩ <b>${p.gold ?? '?'}</b></span></span><span class="status-row">${p.disease ? `<span title="${statusNames[p.disease]}">${glyph(p.disease)}<span class="sr-only">${statusNames[p.disease]}</span></span>` : ''}${p.harms.map((h) => `<span title="${statusNames[h]}">${glyph(h)}<span class="sr-only">${statusNames[h]}</span></span>`).join('')}${p.summon ? `<span title="${esc(p.summon.type)} HP ${p.summon.hp}">${summonPortrait(p.summon.type)}</span>` : ''}</span></button>`;
}
function logText(e: GameEvent) {
  const g = room?.game;
  const name = (id?: string) => g?.players.find((p) => p.id === id)?.name ?? '여행자';
  const a = name(e.actor),
    b = name(e.target);
  const text: Record<string, string> = {
    game_start: '전투가 시작되었습니다.',
    turn_start: `${a}의 차례`,
    attack: `${a} → ${b} · ${e.amount ?? 0} 공격`,
    use_cards: `${a} · ${(e.cards ?? []).map((id) => cards[id]?.name.ko ?? '수호자의 행동').join(' + ')}`,
    defense_cards: `${a} · 방어 카드 ${(e.cards ?? []).length}장`,
    damage: `${b} · HP −${e.amount}`,
    heal: `${b} · HP +${e.amount}`,
    miss: `${a}의 공격이 빗나갔습니다.`,
    status: `${b} · ${statusNames[e.text ?? ''] ?? e.text}`,
    cleanse: `${b}의 재앙이 해제되었습니다.`,
    death: `${b} 탈락`,
    revive: `${b} · HP ${e.amount}로 부활`,
    reflect: `${a} → ${b} 공격 반사`,
    flick: `${a} → ${b} 무작위 튕겨내기`,
    block: `${a}의 완전 방어`,
    draw: `${b}에게 카드 지급`,
    miracle_learned: `${a}의 영구 기적 획득`,
    exchange: `${a}의 능력치 환전`,
    sell: `${a} → ${b} · ${e.amount}G 강제 판매`,
    buy: `${a}의 카드 구매 · ${e.amount}G`,
    buy_offer: `${a}의 구매 확인 대기`,
    buy_cancelled: '사망으로 거래가 취소되었습니다.',
    summon: `${b} · ${e.text} 소환`,
    summon_damage: `${b}의 수호자 · −${e.amount}`,
    summon_death: `${b}의 수호자 소멸`,
    mystery: `운명의 갈림길 · ${e.text}`,
    doom_start: '종말이 시작되었습니다.',
    demon: `${b}에게 악마 출현`,
    dark_death: `${b} · 어둠의 즉사`,
    heaven_fall: `${b} · 천국에서 추락`,
    pass: `${a}의 숨 고르기`,
    discard: `${a}의 카드 정리`,
    game_end: '전투가 종료되었습니다.',
    safety_draw: '턴 한도에 도달하여 무승부입니다.',
    chain_limit: '연쇄 한도에 도달했습니다.',
    dying_attack: `${a}의 마지막 공격`,
    forget: `${b}의 기적 제거`,
    remove_card: `${b}의 카드 제거`,
  };
  return text[e.type] ?? e.type;
}
function logs() {
  return `<section class="panel combat-log"><div class="section-bar"><h3>${icon('ScrollText', 16)} 전투 기록</h3><span class="live-dot"></span></div><div class="log-items">${room!
    .game!.events.filter((e) => e.type !== 'draw')
    .slice(-35)
    .reverse()
    .map(
      (e) =>
        `<div class="log-line ${e.type}"><small>${String(e.turn).padStart(2, '0')}</small><span>${esc(logText(e))}</span></div>`,
    )
    .join('')}</div></section>`;
}
function chatPanel() {
  return `<section class="panel chat-panel"><h3>${icon('Users', 16)} 채팅</h3><div class="chat-items">${
    room?.chat.length
      ? room.chat
          .slice(-20)
          .map((c) => `<p><b>${esc(c.name)}</b> ${esc(c.text)}</p>`)
          .join('')
      : '<p class="muted">함께하는 여행자에게 인사를 건네보세요.</p>'
  }</div><form id="chat-form"><input id="chat-input" name="message" aria-label="채팅 메시지" placeholder="메시지 입력…" maxlength="300" autocomplete="off"><button class="icon-button" aria-label="전송">${icon('Send', 16)}</button></form></section>`;
}
function battle() {
  return battleView({
    game: room!.game!,
    viewer: conn.id,
    mode: room!.mode,
    selected,
    target,
    handFilter,
    pending,
    connected: conn.connected,
    canAct: canAct(),
    cue: presentation.current,
    showSidebar,
    showMiracles,
    hoveredUid,
    tutorialStep,
    renderCard: cardHtml,
    renderPlayer: playerTile,
    renderArt: cardArt,
    logs: logs(),
    chat: chatPanel(),
  });
}
function codex() {
  const filtered = cards.filter(
    (c) =>
      (!codexType || c.type === codexType) &&
      (!codexAttribute || c.attribute === (codexAttribute === 'NONE' ? '' : codexAttribute)) &&
      c.name.ko.includes(codexSearch),
  );
  return `<main class="page-container"><div class="page-heading"><div><div class="eyebrow">THE ARCHIVE</div><h1>모든 카드에는 이야기가 있습니다</h1><p>364개 카드 규칙 · 새로 지은 한국어 이름 · 일반 출현 카드 244종</p></div></div><div class="filter-bar"><label class="search-field">${icon('Search')}<input id="codex-search" placeholder="카드 이름 검색" value="${esc(codexSearch)}"></label><select id="codex-type"><option value="">모든 종류</option>${Object.entries(
    typeNames,
  )
    .map(([k, n]) => `<option value="${k}" ${codexType === k ? 'selected' : ''}>${n}</option>`)
    .join(
      '',
    )}</select><select id="codex-attribute"><option value="">모든 속성</option>${Object.entries(
    attributeNames,
  )
    .map(
      ([k, n]) =>
        `<option value="${k || 'NONE'}" ${codexAttribute === (k || 'NONE') ? 'selected' : ''}>${n}</option>`,
    )
    .join(
      '',
    )}</select><span>${filtered.length}개 결과</span></div><div class="codex-grid">${filtered
    .slice(0, codexLimit)
    .map(
      (c) =>
        `<button class="codex-card" data-detail="${c.id}"><div class="codex-art ${c.type.toLowerCase()}">${cardArt(c, 72)}${icon(attrIcon[c.attribute], 18)}</div><div><small>${typeNames[c.type]} · ${attributeNames[c.attribute]} · #${c.id}</small><h3>${esc(c.name.ko)}</h3><p>${esc(c.description.ko || '별도의 추가 효과 없음')}</p><div class="codex-stats"><span>공격 ${attackValue(c)} / 방어 ${defenseValue(c)}</span><span>${c.type === 'MAGIC' ? 'MP ' + c.subValue : c.price + 'G'}</span></div><small>${c.weight > 0 ? '출현 가중치 ' + c.weight : '일반 드로우 제외 · 특수 데이터'}</small></div></button>`,
    )
    .join(
      '',
    )}</div>${filtered.length > codexLimit ? '<button class="button load-more" data-load-more>카드 더 보기</button>' : ''}</main>`;
}
function researchNotes() {
  return `<section class="panel research-notes" aria-labelledby="research-heading"><h2 id="research-heading">조사 근거와 구현 범위</h2><p>2026년 10월 19일 확인. 공개 클라이언트와 규칙 설명을 참고해 독립 엔진에 구현했습니다.</p><ul><li><a href="https://godfield.net/?lang=ko" target="_blank" rel="noopener noreferrer">공식 God Field</a>: 최대 9인 카드 배틀. 공개 HTML은 Dart 컴파일 클라이언트, Firebase 익명 인증과 Firestore 구독을 사용합니다.</li><li><a href="https://namu.wiki/w/%EA%B0%93%ED%95%84%EB%93%9C" target="_blank" rel="noopener noreferrer">나무위키 · 게임 방식</a>: HP 40 · MP 10 · 소지금 20, 공격과 방어, 기적, 거래, 종말 설명을 교차 참고했습니다. 이용자 작성 자료이므로 공식 명세와 구분합니다.</li><li><a href="https://godfield.net/i18n/ko.json" target="_blank" rel="noopener noreferrer">공식 한국어 설명 파일</a>: 빛 공격은 방어 불가, 수호신 행동 확률은 25%로 설명합니다. 이 프로젝트는 어둠 속성으로 빛 방어 가능·수호자 행동 30%라는 기존 규칙을 유지합니다.</li><li><a href="https://github.com/morluto/rea" target="_blank" rel="noopener noreferrer">REA 분석 도구</a>로 공개 번들을 조사했습니다. 확인한 근거와 분석 한계는 <a href="https://github.com/lIlIlIIlIIlIIlI/godfilld/blob/main/docs/godfield-research-2026-10-19.md" target="_blank" rel="noopener noreferrer">조사 보고서</a>에서 확인할 수 있습니다.</li></ul><p><strong>이 게임의 규칙:</strong> 시작 카드 10장, 손패·기적 합계 16칸, 종말 1/50/100/500턴, 악마 피해 5/10/15. 나무위키의 시작 카드 9장·종말 선택지·악마 피해 10/20/30과 차이가 있습니다. 공식 서버의 내부 코드와 확률은 확인하지 않았습니다. 랭크전·공식 계정 연동은 제공하지 않습니다.</p></section>`;
}
function guide() {
  const sections = [
    [
      '01',
      '살아남는 사람이 승리합니다',
      '2~9명이 HP 40, MP 10, 소지금 20으로 시작합니다. 개인전은 최후의 생존자, 팀전은 마지막 생존 팀이 승리합니다. 시작 카드 10장, 일반 손패와 영구 기적을 합쳐 최대 16칸입니다.',
    ],
    [
      '02',
      '공격은 한 장에서 시작합니다',
      '무기나 효과 카드를 선택하고 중앙의 대상을 눌러 주세요. 확률이 없는 무기로 시작하면 추가 공격·속성 부여·배율·광역 카드를 순서대로 조합할 수 있습니다. 확률이 붙은 공격은 적 전체에 대상별로 명중을 판정합니다.',
    ],
    [
      '03',
      '방어는 가장 중요한 선택입니다',
      '일반 방어는 여러 장을 합산합니다. 화염↔물결, 숲↔대지가 상성입니다. 빛 방어는 이 네 속성도 막습니다. 이 게임은 참고 서버를 따라 빛 공격에 어둠 방어를 허용합니다. 어둠 공격은 HP에 실제 피해가 들어오면 즉사하니 완전히 막으세요.',
    ],
    [
      '04',
      '기적은 반복해서 사용할 수 있습니다',
      'MP를 지불한 기적은 영구 능력으로 이동합니다. 계속 사용할 수 있지만 보유 공간 한 칸을 차지합니다. 기적 바로 다음에 MP 면제 카드를 조합할 수 있습니다.',
    ],
    [
      '05',
      '거래와 환전으로 흐름을 바꾸세요',
      '환전 카드는 능력치 총합을 유지하며 HP·MP·소지금을 재배분합니다. 판매는 판매할 카드를 두 번째로 선택해 상대에게 강제 판매합니다. 부족한 소지금은 MP, HP 순으로 지불됩니다. 구매는 상대 카드 무작위 선택 후 가격을 확인하고 결정합니다.',
    ],
    [
      '06',
      '재앙을 살펴보세요',
      '감기(1 피해)→열병(2)→지옥병(5)→천국병(5 회복). 같은 계열 재앙은 단계가 올라가며, 천국병에 질병을 다시 걸면 즉사합니다. 기본 설정은 턴마다 5% 악화입니다. 섬광은 방어 카드 1장, 먹구름은 확률 공격 확정 명중, 안개는 정보 은폐와 대상 변경, 꿈은 새 카드의 일부 표시를 바꿉니다.',
    ],
    [
      '07',
      '수호자와 운명의 사건',
      '수호자는 HP 20으로 피해를 대신 받고, 적의 행동 뒤 30% 확률로 개입합니다. 운명 카드는 10개 사건 중 하나를 일으킵니다. 부활 씨앗은 죽음보다 먼저 발동하며, 유언 카드는 사망 뒤 공격을 이어갑니다.',
    ],
    [
      '08',
      '종말과 연결 끊김',
      '방 생성 시 재앙 시작을 1/50/100/500턴 중 선택합니다. 선택한 턴 이후 카드 사용·지급마다 25% 악마 위험이 생깁니다. 시작 턴과 피해량 5/10/15는 이 게임의 설정이며 원본 확정 수치가 아닙니다. 입력 제한은 기본 60초이며, 시간이 지나면 AI가 대신 행동합니다. 재접속하면 저장된 경기와 조작권을 복구합니다.',
    ],
  ];
  return `<main class="page-container guide"><div class="page-heading"><div><div class="eyebrow">A LITTLE HELP, A GREAT ADVENTURE</div><h1>처음 시작하기</h1><p>작은 선택들이 모여 하나의 전략이 됩니다.</p></div><button class="button primary" data-practice>연습하며 배우기 ${icon('ArrowRight')}</button></div><div class="guide-grid">${sections.map(([n, h, t]) => `<article class="panel guide-section"><span>${n}</span><h2>${h}</h2><p>${t}</p></article>`).join('')}</div><p class="muted">원본 Flash 실행 엔진은 사용하지 않으며, 허가 확인된 카드 그림·효과음을 사용합니다. 한국어 카드명은 원작 번역명이 아닌 새 이름입니다. 상세 규칙과 원본과의 차이는 소스의 docs/game-rules.md를 참고해 주세요.</p>${researchNotes()}</main>`;
}
function render() {
  document.body.classList.add('field-shell');
  document.body.dataset.screen = room?.game ? 'battle' : room ? 'waiting' : page;
  document.body.classList.toggle('in-battle', Boolean(room?.game));
  document.body.classList.toggle('end-of-world', Boolean(room?.game && room.game.doom >= 100));
  const chatInput = document.querySelector<HTMLInputElement>('#chat-form input'),
    chatValue = chatInput?.value;
  const active = document.activeElement?.id;
  const previousHand = document.querySelector('.hand-cards');
  const scroll = previousHand?.scrollLeft ?? 0,
    scrollTop = previousHand?.scrollTop ?? 0;
  const abilityScroll = document.querySelector('.abilities > div')?.scrollTop ?? 0;
  app.innerHTML =
    header() +
    (room
      ? room.game
        ? battle()
        : waitingRoom()
      : page === 'home'
        ? home()
        : page === 'menu'
          ? modeMenu()
          : page === 'lobby'
            ? lobbyPage()
            : page === 'codex'
              ? codex()
              : guide()) +
    referenceFooter();
  hydrate();
  if (chatValue) {
    const e = document.querySelector<HTMLInputElement>('#chat-form input');
    if (e) e.value = chatValue;
  }
  const hand = document.querySelector('.hand-cards');
  if (hand) {
    hand.scrollLeft = scroll;
    hand.scrollTop = scrollTop;
  }
  const abilities = document.querySelector('.abilities > div');
  if (abilities) abilities.scrollTop = abilityScroll;
  if (active === 'chat-input')
    document.querySelector<HTMLInputElement>('#chat-form input')?.focus();
  countdown();
}
function countdown() {
  const clock = remainingTurnTime(
    room?.timer ?? { deadline: room?.deadline ?? 0, durationMs: 60000 },
    Date.now() + serverClockOffset,
  );
  const t = document.querySelector('#turn-countdown');
  const secondsText = room?.deadline ? clock.seconds + '초' : '--';
  if (t && t.textContent !== secondsText) t.textContent = secondsText;
  const bar = document.querySelector<HTMLElement>('#turn-timebar');
  if (bar) {
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(clock.totalSeconds));
    bar.setAttribute('aria-valuenow', String(clock.seconds));
    bar.setAttribute('aria-valuetext', clock.seconds + '초 남음');
    bar.title = clock.seconds + '초 남음';
    bar.classList.toggle('urgent', clock.urgent);
    const fill = bar.querySelector<HTMLElement>('.turn-time-fill');
    if (fill) fill.style.width = clock.percent + '%';
    if (room?.deadline && clock.remainingMs <= 0)
      document.querySelectorAll<HTMLButtonElement>('.action-dock button').forEach((b) => {
        b.disabled = true;
      });
  }
}
function action(a: Action) {
  if (!room?.game || !canAct()) return;
  pending = true;
  if (tutorialStep === 3) tutorialStep = 4;
  conn.send({
    type: 'action',
    envelope: { id: crypto.randomUUID(), version: room.game.version, action: a },
  });
  render();
}
function startPractice() {
  if (!conn.connected) {
    toast('서버 연결 후 시작할 수 있습니다.');
    return;
  }
  conn.send({
    type: 'practice',
    options: {
      name: '훈련',
      namePlayer: localStorage.getItem('arena-name') || '여행자',
      difficulty,
      doomAt,
      private: true,
      capacity: practicePlayers,
      mode: 'ffa',
    },
  });
}
function navigate(p: string) {
  if (room) {
    toast('현재 방에서 나가면 다른 메뉴를 사용할 수 있습니다.');
    return;
  }
  page = p;
  if (p === 'lobby') conn.send({ type: 'lobby' });
  render();
  window.scrollTo(0, 0);
}
function openSettings() {
  modal(
    `<div class="eyebrow">PREFERENCES</div><h2>나만의 플레이 환경</h2><form id="settings-form"><label>플레이어 이름<input name="name" maxlength="20" value="${esc(localStorage.getItem('arena-name') || '여행자')}"></label><label>효과음 <span id="effects-value">${Math.round(preferences.effects * 100)}%</span><input name="effects" type="range" min="0" max="1" step="0.05" value="${preferences.effects}"></label><label>배경 음악<input name="music" type="range" min="0" max="1" step="0.05" value="${preferences.music}"></label><label class="check-label"><input name="motion" type="checkbox" ${preferences.motion ? 'checked' : ''}> 전투 애니메이션</label><button class="button primary" type="submit">설정 저장</button></form><p class="muted">효과음과 배경 음악의 볼륨을 따로 조절할 수 있습니다. 이름은 새 방을 만들 때 적용됩니다.</p>`,
  );
}
function showCreate() {
  modal(
    `<div class="eyebrow">ROOM</div><h2>게임방 만들기</h2><form id="create-form"><label>방 이름<input name="name" required maxlength="40" value="비밀 결투"></label><div class="form-grid"><label>게임 모드<select name="mode"><option value="ffa">개인전</option><option value="team">팀전</option></select></label><label>최대 인원<select name="capacity">${playerCounts.map((n) => `<option ${n === 4 ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>${doomOptions('doomAt')}<label>비밀번호 · 선택<input name="password" type="password" maxlength="80" autocomplete="new-password" placeholder="친구만 초대하고 싶다면 입력해 주세요"></label><label class="check-label"><input name="private" type="checkbox"> 공개 목록에 표시하지 않기</label><button class="button primary">게임방 만들기 ${icon('ArrowRight')}</button></form>`,
  );
}
function showJoin(id = '', locked = false, spectate = false) {
  modal(
    `<h2>${spectate ? '전투 관전하기' : '방에 참가하기'}</h2><form id="join-form"><label>방 코드<input name="roomId" value="${esc(id)}" required></label><label>비밀번호<input name="password" type="password" placeholder="설정된 경우에만 입력" autocomplete="off"></label><input name="spectate" type="hidden" value="${spectate}"><button class="button primary">${spectate ? '관전하기' : '참가하기'}</button></form>`,
  );
}
document.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch' || !room?.game) return;
  const uid = (event.target as HTMLElement).closest<HTMLElement>('[data-card]')?.dataset.card ?? '';
  if (hoveredUid !== uid) {
    hoveredUid = uid;
    render();
  }
});
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button,a');
  if (!b) return;
  unlockAudio();
  if (b.hasAttribute('disabled')) return;
  if (!b.dataset.card && !b.dataset.target && !b.dataset.detail) sound('button');
  if (b.dataset.detail) sound('card_detail');
  if (b.dataset.page) {
    e.preventDefault();
    navigate(b.dataset.page);
  } else if (b.hasAttribute('data-settings')) openSettings();
  else if (b.hasAttribute('data-hand-menu'))
    modal(
      '<h2>카드 메뉴</h2><div class="mobile-hand-controls">' +
        (room?.game?.phase === 'FINISHED'
          ? '<button class="button" data-rematch>다시 대전</button><button class="button" data-replay>전투 기록</button>'
          : '') +
        (document.querySelector('.deck-menu')?.innerHTML ?? '') +
        '</div>',
    );
  else if (b.hasAttribute('data-help'))
    modal(
      '<h2>교전 지침</h2><ol class="tutorial"><li>카드 선택 → 플레이어 선택 → 카드 사용 순서로 진행합니다.</li><li>공격을 받으면 방어 카드를 고르거나 피해 받기를 누르세요.</li><li>일으킨 기적은 MP를 소모해 반복 사용합니다.</li><li>종말에 진입하면 배경이 분홍색으로 바뀌고 악마가 출현할 수 있습니다.</li></ol><p><a href="/source.zip" download>소스 코드 · AGPL-3.0</a></p>',
    );
  else if (b.hasAttribute('data-toggle-sidebar')) {
    showSidebar = !showSidebar;
    render();
  } else if (b.hasAttribute('data-close')) dialog.close();
  else if (b.dataset.handFilter) {
    handFilter = b.dataset.handFilter;
    if (dialog.querySelector('.mobile-hand-controls')) dialog.close();
    render();
  } else if (b.hasAttribute('data-enter')) {
    const name = document.querySelector<HTMLInputElement>('#player-name')?.value.trim();
    if (!name) {
      toast('예언자의 이름을 입력해 주세요.');
      return;
    }
    localStorage.setItem('arena-name', name);
    navigate('menu');
  } else if (b.hasAttribute('data-room-controls')) showRoomControls();
  else if (b.dataset.teamChoice) {
    conn.send({ type: 'chooseTeam', team: b.dataset.teamChoice });
    if (dialog.open) dialog.close();
  } else if (b.hasAttribute('data-cancel-queue')) {
    conn.send({ type: 'cancelQueue' });
    if (dialog.open) dialog.close();
  } else if (b.dataset.roomDoom) {
    conn.send({ type: 'doomAt', value: Number(b.dataset.roomDoom) });
    dialog.close();
  } else if (b.hasAttribute('data-toggle-miracles')) {
    showMiracles = !showMiracles;
    render();
  } else if (b.hasAttribute('data-practice')) startPractice();
  else if (b.hasAttribute('data-create')) showCreate();
  else if (b.hasAttribute('data-join-code')) showJoin();
  else if (b.hasAttribute('data-refresh')) conn.send({ type: 'lobby' });
  else if (b.dataset.join)
    showJoin(b.dataset.join, b.dataset.locked === 'true', b.dataset.spectate === 'true');
  else if (b.hasAttribute('data-leave')) {
    conn.send({ type: 'leave' });
  } else if (b.hasAttribute('data-ready'))
    conn.send({ type: 'ready', ready: !room?.seats.find((p) => p.id === conn.id)?.ready });
  else if (b.hasAttribute('data-start')) {
    conn.send({ type: 'start' });
    dialog.close();
  } else if (b.hasAttribute('data-add-bot')) conn.send({ type: 'addBot', difficulty });
  else if (b.dataset.removeBot) conn.send({ type: 'removeBot', id: b.dataset.removeBot });
  else if (b.hasAttribute('data-invite')) {
    const url = `${location.origin}/?room=${room?.id}`;
    void navigator.clipboard
      .writeText(url)
      .then(() => toast('초대 링크를 복사했습니다.'))
      .catch(() => modal(`<h2>초대 링크</h2><input readonly value="${esc(url)}">`));
  } else if (b.dataset.card) {
    const uid = b.dataset.card;
    if (tutorialStep === 1) tutorialStep = 2;
    if (selected.includes(uid)) selected = selected.filter((x) => x !== uid);
    else {
      selected.push(uid);
      if (selected.length === 1) {
        const p = [...(room?.game?.self?.hand ?? []), ...(room?.game?.self?.abilities ?? [])].find(
          (p) => p.uid === uid,
        );
        if (p) {
          const c = card(p.cardId);
          if (
            c.targetRule === 'self' ||
            [
              'INCREASE_HP',
              'INCREASE_MP',
              'SET_ASSISTANT',
              'REMOVE_ALL_HARMS',
              'REMOVE_LOWER_HARMS',
            ].includes(c.attackKind)
          )
            target = conn.id;
        }
      }
    }
    sound('select');
    render();
  } else if (b.dataset.target) {
    target = b.dataset.target;
    sound('target');
    if (tutorialStep === 2) tutorialStep = 3;
    render();
  } else if (b.hasAttribute('data-clear')) {
    if (dialog.open && dialog.querySelector('.mobile-hand-controls')) dialog.close();
    selected = [];
    render();
  } else if (b.hasAttribute('data-pass')) action({ kind: 'pass' });
  else if (b.hasAttribute('data-discard')) {
    if (dialog.open && dialog.querySelector('.mobile-hand-controls')) dialog.close();
    action({ kind: 'discard', pieces: [...selected] });
  } else if (b.hasAttribute('data-take')) action({ kind: 'defend', pieces: [] });
  else if (b.hasAttribute('data-use')) {
    if (room?.game?.phase === 'DEFENSE_SELECTION')
      action({ kind: 'defend', pieces: [...selected] });
    else {
      const first = [
        ...(room?.game?.self?.hand ?? []),
        ...(room?.game?.self?.abilities ?? []),
      ].find((p) => p.uid === selected[0]);
      if (first && card(first.cardId).attackKind === 'EXCHANGE') openExchange();
      else if (!target) toast('중앙에서 대상을 선택해 주세요.');
      else action({ kind: 'attack', pieces: [...selected], target });
    }
  } else if (b.dataset.buy) action({ kind: 'buy', accept: b.dataset.buy === 'true' });
  else if (b.hasAttribute('data-rematch')) {
    if (dialog.open) dialog.close();
    if (room?.host === conn.id) conn.send({ type: 'start' });
    else {
      conn.send({ type: 'ready', ready: true });
      toast('준비되었습니다. 모두 준비하면 방장이 다시 시작할 수 있습니다.');
    }
  } else if (b.hasAttribute('data-replay')) {
    if (dialog.open) dialog.close();
    conn.send({ type: 'replay' });
  } else if (b.dataset.detail) {
    const c = card(Number(b.dataset.detail));
    modal(
      `<div class="eyebrow">CARD #${c.id}</div><h2>${esc(c.name.ko)}</h2><div class="detail-glyph">${cardArt(c, 128)}</div><p>${esc(c.description.ko)}</p><dl><dt>속성</dt><dd>${attributeNames[c.attribute]}</dd><dt>공격 / 방어</dt><dd>${attackValue(c)} / ${defenseValue(c)}</dd><dt>가격 / 가중치</dt><dd>${c.price}G / ${c.weight}</dd><dt>원본 CSV ID</dt><dd>${c.id} · ${c.nameStatus}</dd></dl><small>한국어 이름은 새로 만든 이름이며, 원작 번역 확정 데이터가 아닙니다.</small>`,
    );
  } else if (b.hasAttribute('data-load-more')) {
    codexLimit += 48;
    render();
  }
});
function openExchange() {
  const p = room!.game!.players.find((p) => p.id === conn.id)!;
  modal(
    `<h2>능력치 환전</h2><p>총합 ${(p.hp ?? 0) + (p.mp ?? 0) + (p.gold ?? 0)}을 유지해 주세요. HP는 1 이상입니다.</p><form id="exchange-form"><div class="form-grid">${[
      ['hp', p.hp],
      ['mp', p.mp],
      ['gold', p.gold],
    ]
      .map(
        ([key, value]) =>
          `<label>${String(key).toUpperCase()}<input name="${key}" type="number" min="${key === 'hp' ? 1 : 0}" max="99" required value="${value}"></label>`,
      )
      .join('')}</div><button class="button primary">환전 확정</button></form>`,
  );
}
document.addEventListener('change', (e) => {
  const el = e.target as HTMLSelectElement;
  if (el.id === 'practice-players' && playerCounts.some((n) => n === Number(el.value))) {
    practicePlayers = Number(el.value);
    localStorage.setItem('arena-practice-players', String(practicePlayers));
  }
  if (el.id === 'difficulty') difficulty = el.value as Difficulty;
  if (el.name === 'practice-doom' && doomStartTurns.includes(Number(el.value) as DoomStartTurn)) {
    doomAt = Number(el.value) as DoomStartTurn;
    localStorage.setItem('arena-doom-at', String(doomAt));
  }
  if (el.id === 'team') conn.send({ type: 'team', team: el.value });
  if (el.id === 'codex-type') {
    codexType = el.value;
    codexLimit = 48;
    render();
  }
  if (el.id === 'codex-attribute') {
    codexAttribute = el.value;
    codexLimit = 48;
    render();
  }
});
document.addEventListener('input', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.id === 'player-name') localStorage.setItem('arena-name', el.value.trim().slice(0, 20));
  if (el.id === 'codex-search') {
    codexSearch = el.value;
    const caret = el.selectionStart;
    render();
    const next = document.querySelector<HTMLInputElement>('#codex-search');
    next?.focus();
    next?.setSelectionRange(caret, caret);
  }
});
document.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement,
    data = new FormData(form);
  if (form.id === 'create-form') {
    conn.send({
      type: 'create',
      options: {
        name: data.get('name'),
        namePlayer: localStorage.getItem('arena-name') || '여행자',
        password: data.get('password'),
        private: data.get('private') === 'on',
        mode: data.get('mode'),
        capacity: Number(data.get('capacity')),
        difficulty,
        doomAt: Number(data.get('doomAt')),
      },
    });
    dialog.close();
  }
  if (form.id === 'join-form') {
    conn.send({
      type: 'join',
      roomId: data.get('roomId'),
      password: data.get('password'),
      spectate: data.get('spectate') === 'true',
    });
    dialog.close();
  }
  if (form.id === 'chat-form') {
    const text = String(data.get('message') ?? '').trim();
    if (text) conn.send({ type: 'chat', text });
    form.reset();
  }
  if (form.id === 'settings-form') {
    localStorage.setItem('arena-name', String(data.get('name') || '여행자'));
    preferences.effects = Number(data.get('effects'));
    preferences.music = Number(data.get('music'));
    preferences.motion = data.get('motion') === 'on';
    localStorage.setItem('arena-effects', String(preferences.effects));
    localStorage.setItem('arena-music', String(preferences.music));
    localStorage.setItem('arena-motion', preferences.motion ? 'on' : 'off');
    setMusic();
    sound('select');
    dialog.close();
    render();
    toast('설정을 저장했습니다.');
  }
  if (form.id === 'exchange-form') {
    action({
      kind: 'attack',
      pieces: [...selected],
      target: conn.id,
      exchange: {
        hp: Number(data.get('hp')),
        mp: Number(data.get('mp')),
        gold: Number(data.get('gold')),
      },
    });
    dialog.close();
  }
});
conn.addEventListener('status', () => {
  if (!conn.connected) pending = false;
  render();
});
conn.addEventListener('data', (event) => {
  const msg = (event as CustomEvent).detail;
  if (msg.type === 'error') {
    pending = false;
    if (tutorialStep === 4) tutorialStep = 3;
    toast(msg.message);
    render();
  }
  if (msg.type === 'lobby') {
    lobby = msg.rooms;
    if (!room) render();
  }
  if (msg.type === 'left' || msg.type === 'room_closed') {
    room = null;
    presentation.reset();
    if (dialog.open) dialog.close();
    lastVersion = -1;
    lastEvent = 0;
    selected = [];
    target = '';
    tutorialStep = 0;
    showSidebar = false;
    showMiracles = false;
    hoveredUid = '';
    pending = false;
    page = 'lobby';
    conn.send({ type: 'lobby' });
    render();
    if (msg.type === 'room_closed') toast(msg.message || '방이 종료되었습니다.');
  }
  if (msg.type === 'room') {
    const next = msg.room as Room;
    const g = next.game,
      changed = g && (lastMatch !== g.id || lastVersion !== g.version);
    const previous = room?.game;
    room = next;
    serverClockOffset = next.timer ? next.timer.serverNow - Date.now() : 0;
    if (g) presentation.sync(g);
    else presentation.reset();
    if (changed) {
      if (tutorialStep === 4) {
        tutorialStep = 0;
        toast('첫 행동이 완료되었습니다. 이제 나만의 조합을 만들어 보세요.');
      }
      selected = [];
      hoveredUid = '';
      pending = false;
      lastVersion = g!.version;
      if (!target || g!.players.find((p) => p.id === target)?.dead)
        target = g!.players.find((p) => p.id !== conn.id && !p.dead)?.id ?? conn.id;
    }
    render();
    if (dialog.open && dialog.querySelector('.reference-modal-controls')) {
      if (g) dialog.close();
      else showRoomControls();
    }
    if (g) {
      if (!previous || previous.id !== g.id || g.version < previous.version) {
        sound('game_start');
        lastEvent = g.events.at(-1)?.seq ?? 0;
      }
      const fresh = g.events.filter((e) => e.seq > lastEvent);
      lastEvent = g.events.at(-1)?.seq ?? lastEvent;
      lastMatch = g.id;
      for (const e of fresh.slice(-6)) {
        animateEvent(e);
        const clip = battleClip(e, g, conn.id);
        if (clip) sound(clip);
      }
      if (g.self && !localStorage.getItem('arena-tutorial')) {
        localStorage.setItem('arena-tutorial', '1');
        tutorialStep = 1;
        render();
        modal(
          `<div class="eyebrow">WELCOME, TRAVELER</div><h2>첫 전투에 오신 것을 환영합니다</h2><ol class="tutorial"><li>하단의 손패를 눌러 카드를 선택하세요.</li><li>중앙의 플레이어를 눌러 대상을 고르세요.</li><li>내 차례에 <b>카드 사용</b>, 공격을 받으면 <b>방어하기</b>를 누르세요.</li><li>회복·기적·거래도 카드로 사용합니다. 카드 설명을 확인해 보세요.</li></ol><button class="button primary" data-close>첫 조합 만들어보기 ${icon('ArrowRight')}</button>`,
        );
      }
    }
  }
  if (msg.type === 'replay')
    modal(
      `<h2>이번 경기의 전투 기록</h2><p>공개 행동만 표시합니다. 사용하지 않은 손패는 공개하지 않습니다.</p><div class="replay-list">${(
        msg.events as GameEvent[]
      )
        .filter((e) => e.type !== 'draw')
        .map((e) => `<p><small>${e.turn}턴</small> ${esc(logText(e))}</p>`)
        .join('')}</div>`,
    );
  if (msg.type === 'hello') {
    const invite = new URLSearchParams(location.search).get('room');
    if (invite && !conn.roomId) {
      showJoin(invite);
      history.replaceState({}, '', location.pathname);
    }
  }
});
setInterval(() => {
  countdown();
  if (conn.connected && conn.roomId) conn.send({ type: 'heartbeat' });
  else if (conn.connected && page === 'lobby') conn.send({ type: 'lobby' });
}, 10000);
setInterval(countdown, 100);
render();
conn.connect();

document.addEventListener(
  'error',
  (e) => {
    const el = e.target;
    if (el instanceof HTMLImageElement && el.classList.contains('card-art')) {
      if (!el.dataset.fallback) {
        el.dataset.fallback = '1';
        el.style.cssText =
          'position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;';
        el.src = '/assets/card-placeholder.svg';
      } else el.hidden = true;
    }
  },
  true,
);
