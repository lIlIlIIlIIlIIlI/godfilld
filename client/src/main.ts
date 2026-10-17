/// <reference types="vite/client" />
import './style.css';
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
} from '../../shared/catalog';
import type {
  Action,
  GameView,
  Piece,
  GameEvent,
  CardDefinition,
  Difficulty,
} from '../../shared/types';
import type { RoomService } from '../../server/src/rooms/RoomService';
import { Connection } from './network';
import { animateEvent } from './animations';
import { sound, unlockAudio, preferences, setMusic } from './audio';
type Room = ReturnType<RoomService['project']>;
const conn = new Connection(),
  app = document.querySelector<HTMLDivElement>('#app')!,
  dialog = document.querySelector<HTMLDialogElement>('#dialog')!;
let showSidebar = false;
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
const icon = (name: string, size = 18) =>
  `<i data-lucide="${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}" width="${size}" height="${size}" aria-hidden="true"></i>`;
const esc = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
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
  return `<header class="topbar"><a class="brand" href="#" data-page="home"><span class="brand-mark">${icon('Sparkles', 24)}</span><span>별의 의회<small>AETHER ARENA</small></span></a><nav aria-label="주 메뉴">${[
    ['home', '플레이'],
    ['lobby', '멀티플레이'],
    ['codex', '카드 도감'],
    ['guide', '게임 방법'],
  ]
    .map(
      ([p, n]) =>
        `<button data-page="${p}" class="nav-button ${page === p ? 'active' : ''}">${n}</button>`,
    )
    .join(
      '',
    )}</nav><div class="header-end"><span class="connection ${conn.connected ? 'online' : ''}">${icon(conn.connected ? 'Wifi' : 'WifiOff', 14)}<span>${conn.connected ? '서버 연결됨' : '재연결 중'}</span></span><button class="icon-button" data-settings aria-label="설정">${icon('Settings')}</button></div></header>`;
}
function home() {
  return `<main class="home"><div class="eyebrow">${icon('Star', 14)} 매번 새로운 카드, 당신만의 전략</div><section class="hero"><div class="hero-copy"><h1>작은 카드 한 장이<br><em>운명을 바꾸는 순간.</em></h1><p>무기와 기적을 조합하고, 예측할 수 없는 전투에서<br class="desktop"> 마지막까지 살아남으세요. 별의 의회가 기다립니다.</p><div class="hero-actions"><button class="button primary large" data-practice>${icon('Sparkles')} AI와 바로 시작 ${icon('ArrowRight')}</button><button class="button ghost large" data-page="lobby">${icon('Users')} 친구와 대전</button></div><div class="practice-options"><label for="difficulty">AI 난이도</label><select id="difficulty">${difficultyOptions()}</select><span>가입 없이 · 나 + AI 3명</span></div><div class="hero-facts"><span><b>364</b> 카드 규칙</span><span><b>7</b> 가지 속성</span><span><b>2–8</b> 명의 플레이어</span></div></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="art-star one">✧</span><span class="art-star two">✦</span><span class="art-star three">✧</span><div class="display-card back-card"><div class="card-glyph">${icon('Shield', 72)}</div><b>대지의 가호</b><span>지켜내는 힘</span></div><div class="display-card front-card"><div class="tiny-label">ARCANA · 01</div><div class="card-glyph">${icon('Sparkles', 90)}</div><div class="art-divider"></div><b>별빛의 기적</b><span>아직 쓰이지 않은 이야기</span><div class="art-card-footer">${icon('Star', 14)} AETHER ARENA ${icon('Star', 14)}</div></div><div class="art-chip">${icon('Layers')} 조합은 자유롭게, 승부는 전략적으로</div></div></section><section class="path-grid"><button class="path-card" data-practice><span class="path-icon mint">${icon('Bot', 26)}</span><div><h3>부담 없이, AI 연습</h3><p>세 가지 난이도에서 나만의 조합을 찾아보세요.</p></div>${icon('MoveUpRight')}</button><button class="path-card" data-page="lobby"><span class="path-icon gold">${icon('Users', 26)}</span><div><h3>함께 즐기는 실시간 대전</h3><p>개인전부터 팀전까지, 친구를 초대해 보세요.</p></div>${icon('MoveUpRight')}</button><button class="path-card" data-page="guide"><span class="path-icon purple">${icon('BookOpen', 26)}</span><div><h3>첫 전투를 위한 안내서</h3><p>공격, 방어, 기적. 차근차근 알아가세요.</p></div>${icon('MoveUpRight')}</button></section><div class="home-footnote">${icon('Shield', 15)} 서버가 모든 전투를 판정합니다. 상대의 손패는 공개되지 않습니다.</div></main>`;
}
function lobbyPage() {
  return `<main class="page-container"><div class="page-heading"><div><div class="eyebrow">GATHER YOUR PARTY</div><h1>함께할 의회를 찾아보세요</h1><p>방을 만들고 친구와 실시간으로 대전해 보세요.</p></div><button class="button primary" data-create>${icon('Plus')} 방 만들기</button></div><div class="section-bar"><h2>공개 게임방 <span class="count">${lobby.length}</span></h2><div><button class="button small" data-join-code>${icon('Link')} 초대 코드로 참가</button><button class="icon-button" data-refresh aria-label="새로 고침">${icon('RotateCcw')}</button></div></div><div class="room-list">${lobby.length ? lobby.map((r) => `<article class="lobby-card"><span class="path-icon ${r.mode === 'team' ? 'gold' : 'mint'}">${icon('Users', 28)}</span><div class="grow"><div class="tags"><span>${r.mode === 'team' ? '팀전' : '개인전'}</span>${r.locked ? '<span>비밀번호</span>' : ''}${r.playing ? '<span>대전 중</span>' : ''}</div><h3>${esc(r.name)}</h3><p>${r.count} / ${r.capacity} 명</p></div><button class="button" data-join="${esc(r.id)}" data-locked="${r.locked}" data-spectate="${r.playing}">${r.playing ? '관전하기' : '참가하기'} ${icon('ArrowRight')}</button></article>`).join('') : `<div class="empty-state">${icon('Orbit', 48)}<h3>${conn.connected ? '아직 열린 방이 없어요' : '서버와 연결하고 있어요'}</h3><p>${conn.connected ? '첫 번째 의회를 열거나, AI와 먼저 연습해 보세요.' : '연결되면 게임방 목록을 불러옵니다.'}</p><button class="button primary" data-create>새로운 방 만들기</button></div>`}</div></main>`;
}
function waitingRoom() {
  if (!room) return '';
  const isHost = room.host === conn.id;
  return `<main class="page-container room-wait"><button class="text-button" data-leave>${icon('ChevronLeft')} 방 나가기</button><div class="page-heading"><div><div class="eyebrow">${room.mode === 'team' ? 'TEAM BATTLE' : 'FREE FOR ALL'}</div><h1>${esc(room.name)}</h1><p>모두 준비하면 방장이 전투를 시작할 수 있습니다.</p></div><button class="button" data-invite>${icon('Link')} 초대 링크 복사</button></div><div class="wait-layout"><section class="panel"><div class="section-bar"><h2>참가자 <span class="count">${room.seats.length}/${room.capacity}</span></h2>${isHost ? '<button class="button small" data-add-bot>+ AI 추가</button>' : ''}</div><div class="seats">${room.seats.map((s, i) => `<article class="seat"><span class="avatar avatar-${i % 4}">${icon(s.bot ? 'Bot' : 'Star', 24)}</span><div class="grow"><b>${esc(s.name)} ${s.id === room!.host ? icon('Crown', 14) : ''}</b><p>${s.bot ? 'AI · ' + { easy: '쉬움', normal: '보통', hard: '어려움' }[s.difficulty] : s.id === conn.id ? '나' : s.connected ? '온라인' : '연결 대기'} ${room!.mode === 'team' ? ' · 팀 ' + s.team : ''}</p></div><span class="ready ${s.ready ? 'yes' : ''}">${s.ready ? '준비 완료' : '준비 중'}</span>${isHost && s.bot ? `<button class="icon-button" data-remove-bot="${s.id}" aria-label="봇 삭제">${icon('X')}</button>` : ''}</article>`).join('')}</div><div class="wait-actions">${room.mode === 'team' ? `<label>내 팀 <select id="team">${['A', 'B', 'C', 'D'].map((t) => `<option ${room!.seats.find((p) => p.id === conn.id)?.team === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>` : ''}<button class="button" data-ready>${room.seats.find((s) => s.id === conn.id)?.ready ? '준비 취소' : '준비 완료'}</button>${isHost ? `<button class="button primary" data-start ${room.seats.length < 2 || !room.seats.every((p) => p.ready) ? 'disabled' : ''}>전투 시작 ${icon('ArrowRight')}</button>` : ''}</div></section>${chatPanel()}</div></main>`;
}
function cardHtml(piece: Piece, index: number, permanent = false) {
  const c = card(piece.cardId),
    active = selected.includes(piece.uid),
    order = selected.indexOf(piece.uid) + 1;
  const ownTurn = canAct();
  const kind =
    c.type === 'WEAPON'
      ? 'weapon'
      : c.type === 'PROTECTOR'
        ? 'protector'
        : c.type === 'MAGIC'
          ? 'magic'
          : c.type === 'TRADE'
            ? 'trade'
            : 'sundry';
  return `<button class="game-card ${kind} ${active ? 'selected' : ''} ${permanent ? 'permanent' : ''}" data-card="${piece.uid}" aria-pressed="${active}" title="${esc(c.description.ko)}" style="--card-order:${index}"><div class="card-top"><span>${typeNames[c.type]}${permanent ? ' · 영구' : ''}</span><span>${icon(attrIcon[c.attribute], 14)}</span></div><div class="card-illustration"><img class="card-art" src="${esc(c.image)}" alt="" loading="lazy" width="100" height="80">${icon(typeIcon[c.type], permanent ? 26 : 44)}<span class="card-ring"></span></div><b>${esc(c.name.ko)}</b><div class="card-bottom"><span>${c.attackKind === 'ATK' || c.attackExtra === 'INCREASE_ATK' ? icon('Swords', 14) + ' ' + attackValue(c) : c.defenseKind === 'DFS' ? icon('Shield', 14) + ' ' + defenseValue(c) : icon('Star', 14) + ' 효과'}</span><span>${c.type === 'MAGIC' ? icon('Zap', 14) + ' ' + c.subValue : attributeNames[c.attribute]}</span></div>${active ? `<span class="selection-order">${order}</span>` : ''}</button>`;
}
function canAct() {
  const g = room?.game;
  if (!g || g.phase === 'FINISHED' || pending || !conn.connected) return false;
  return g.phase === 'ATTACK_SELECTION'
    ? g.attacker === conn.id
    : g.phase === 'DEFENSE_SELECTION'
      ? g.current?.target === conn.id
      : g.phase === 'BUY_CONFIRMATION'
        ? Boolean(g.purchase)
        : false;
}
function playerTile(p: GameView['players'][number], i: number) {
  const self = p.id === conn.id,
    g = room!.game!,
    active = p.id === g.attacker,
    defending = p.id === g.current?.target;
  return `<button class="player-tile ${p.dead ? 'dead' : ''} ${target === p.id ? 'targeted' : ''} ${active ? 'current-player' : ''}" data-target="${p.id}" data-player="${p.id}" ${p.dead ? 'disabled' : ''} aria-label="${esc(p.name)} 대상으로 선택"><div class="player-top"><span class="avatar avatar-${i % 4}">${icon(p.bot ? 'Bot' : 'Star', 24)}</span><div class="grow"><b>${esc(p.name)} ${self ? '<small>나</small>' : ''}</b><span>${p.dead ? '탈락' : defending ? '방어 선택 중' : active ? '공격 차례' : room!.mode === 'team' ? '팀 ' + p.team : p.bot ? 'AI 여행자' : '여행자'}</span></div>${target === p.id ? `<span class="target-check">${icon('Check', 16)}</span>` : ''}</div><div class="hp-bar"><div style="width:${p.hp === null ? 100 : Math.min(100, (p.hp / 40) * 100)}%"></div></div><div class="stats"><span class="hp">${icon('Heart', 13)} ${p.hp ?? '?'}</span><span class="mp">${icon('Zap', 13)} ${p.mp ?? '?'}</span><span>${icon('Coins', 13)} ${p.gold ?? '?'}</span><span class="hand-count">${icon('Layers', 13)} ${p.handCount}+${p.abilityCount}</span></div><div class="status-row">${p.disease ? `<span class="status disease">${statusNames[p.disease]}</span>` : ''}${p.harms.map((h) => `<span class="status">${statusNames[h]}</span>`).join('')}${p.summon ? `<span class="status summon">${icon('Orbit', 11)} ${p.summon.type} · ${p.summon.hp}</span>` : ''}</div></button>`;
}
function logText(e: GameEvent) {
  const g = room?.game;
  const name = (id?: string) => g?.players.find((p) => p.id === id)?.name ?? '여행자';
  const a = name(e.actor),
    b = name(e.target);
  const text: Record<string, string> = {
    game_start: '의회의 전투가 시작되었습니다.',
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
  return `<section class="panel chat-panel"><h3>${icon('Users', 16)} 의회 채팅</h3><div class="chat-items">${
    room?.chat.length
      ? room.chat
          .slice(-20)
          .map((c) => `<p><b>${esc(c.name)}</b> ${esc(c.text)}</p>`)
          .join('')
      : '<p class="muted">함께하는 여행자에게 인사를 건네보세요.</p>'
  }</div><form id="chat-form"><input id="chat-input" name="message" aria-label="채팅 메시지" placeholder="메시지 입력…" maxlength="300" autocomplete="off"><button class="icon-button" aria-label="전송">${icon('Send', 16)}</button></form></section>`;
}
function battle() {
  const g = room!.game!,
    my = g.players.find((p) => p.id === conn.id),
    attacker = g.players.find((p) => p.id === g.attacker),
    hasSelf = Boolean(g.self),
    defense = g.phase === 'DEFENSE_SELECTION' && g.current?.target === conn.id,
    buying = g.phase === 'BUY_CONFIRMATION' && Boolean(g.purchase),
    finished = g.phase === 'FINISHED';
  let banner = finished
    ? '전투가 끝났습니다'
    : canAct()
      ? defense
        ? '공격을 막을 차례입니다'
        : buying
          ? '구매를 결정해 주세요'
          : '당신의 차례입니다'
      : g.phase === 'DEFENSE_SELECTION'
        ? `${g.players.find((p) => p.id === g.current?.target)?.name ?? '상대'}의 방어를 기다리는 중`
        : `${attacker?.name ?? '여행자'}의 선택을 기다리는 중`;
  const selectedPieces = [...(g.self?.hand ?? []), ...(g.self?.abilities ?? [])].filter((p) =>
    selected.includes(p.uid),
  );
  const chosen = selected
    .map((uid) => selectedPieces.find((p) => p.uid === uid))
    .filter(Boolean) as Piece[];
  const detail = chosen.length ? card(chosen.at(-1)!.cardId) : null;
  return `<main class="battle-page tutorial-step-${tutorialStep} ${g.doom >= 100 ? 'doom' : ''}"><div class="battle-top"><div><span class="eyebrow">${room!.mode === 'team' ? 'TEAM BATTLE' : 'FREE FOR ALL'}</span><h2>${esc(room!.name)}</h2></div><div class="turn-track"><span>TURN <b>${String(g.turn).padStart(2, '0')}</b></span><span class="phase-pill">${finished ? '경기 종료' : g.phase === 'DEFENSE_SELECTION' ? '방어 단계' : g.phase === 'BUY_CONFIRMATION' ? '거래 확인' : '공격 단계'}</span><span class="timer">${icon('Clock', 14)} <b id="turn-countdown">--</b></span></div><button class="text-button mobile-only" data-toggle-sidebar>${icon('ScrollText', 16)} 기록·채팅</button><button class="text-button" data-leave>${icon('LogOut', 16)} 나가기</button></div>${tutorialStep ? `<div class="tutorial-hint">${icon('Sparkles', 16)} ${['', '1 / 3 · 손패의 카드를 눌러 선택해 보세요.', '2 / 3 · 중앙의 플레이어를 눌러 대상을 골라 보세요.', '3 / 3 · 자신의 공격 차례에 카드 사용을 눌러 보세요.', '서버에서 첫 행동을 확인하고 있습니다.'][tutorialStep]}</div>` : ''}<div class="battle-layout"><div class="arena"><div class="doom-track"><span>${icon('Sun', 14)} 종말의 시간</span><div><i style="width:${g.doom}%"></i></div><b>${g.doom}%</b></div><div class="opponents">${g.players
    .filter((p) => p.id !== conn.id)
    .map(playerTile)
    .join(
      '',
    )}</div><section class="battle-center"><div class="center-sigil">${icon(g.current ? 'Swords' : 'Sparkles', 42)}</div><div class="turn-banner ${canAct() ? 'your-turn' : ''}"><span class="live-dot"></span>${esc(banner)}</div>${g.current ? `<p class="attack-summary">${esc(g.players.find((p) => p.id === g.current!.source)?.name)} ${icon('ArrowRight', 14)} <b>${g.current.damage}</b> ${attributeNames[g.current.attribute ?? '']} ${g.current.chance ? '· ' + g.current.chance + '%' : ''}</p>` : '<p>카드를 연결하고, 새로운 가능성을 발견하세요.</p>'}${finished ? `<div class="result"><h2>${g.winners.includes(conn.id) ? '승리하셨습니다!' : g.winners.length ? '의회의 승자가 정해졌습니다' : '무승부입니다'}</h2><p>${g.winners.map((id) => esc(g.players.find((p) => p.id === id)?.name)).join(' · ')}</p><div class="hero-actions"><button class="button primary" data-rematch>${icon('RotateCcw')} 다시 대전</button><button class="button" data-replay>${icon('ScrollText')} 전체 기록</button></div></div>` : ''}</section>${my ? `<div class="self-row">${playerTile(my, g.players.indexOf(my))}<div class="selection-panel"><span class="tiny-label">YOUR COMBINATION</span><div class="selected-names">${chosen.length ? chosen.map((p) => `<span>${esc(card(p.cardId).name.ko)}</span>`).join('<b>+</b>') : '<span class="muted">손패에서 카드를 선택해 주세요</span>'}</div><p>${detail ? esc(detail.description.ko) : defense ? '방어할 카드가 없으면 피해 받기를 선택할 수 있습니다.' : '카드 선택 순서대로 조합합니다. 대상을 선택한 뒤 사용하세요.'}</p></div></div>` : ''}</div><aside class="battle-sidebar ${showSidebar ? 'expanded' : ''}">${logs()}${chatPanel()}</aside></div>${hasSelf ? `<section class="hand-area"><div class="hand-toolbar"><div><h3>나의 손패 <span class="count">${g.self!.hand.length + g.self!.abilities.length} / ${g.rules.capacity}</span></h3><small>${my?.dead ? '탈락하여 관전 중입니다.' : canAct() ? '카드를 눌러 선택 · 다시 눌러 해제' : '상대의 차례입니다. 카드를 살펴보세요.'}</small></div><div class="hand-actions">${buying ? `<span>${esc(card(g.purchase!.cardId).name.ko)} · ${g.purchase!.price}G</span><button class="button" data-buy="false">거절</button><button class="button primary" data-buy="true">구매 확정</button>` : defense ? `<button class="button" data-take ${!canAct() ? 'disabled' : ''}>피해 받기</button><button class="button primary" data-use ${!canAct() || !selected.length ? 'disabled' : ''}>${icon('Shield')} 방어하기</button>` : `<button class="icon-button" data-clear title="선택 해제" aria-label="선택 해제">${icon('X')}</button><button class="button" data-discard ${!canAct() || !selected.length ? 'disabled' : ''}>${icon('Trash2', 15)} 버리기</button><button class="button" data-pass ${!canAct() ? 'disabled' : ''}>숨 고르기</button><button class="button primary" data-use ${!canAct() || !selected.length ? 'disabled' : ''}>${icon('Swords')} 카드 사용</button>`}</div></div><div class="hand-cards" aria-label="내 카드">${g.self!.hand.map((p, i) => cardHtml(p, i)).join('') || '<div class="empty-hand">일반 손패가 없습니다. 영구 기적을 쓰거나 숨 고르기로 보충하세요.</div>'}</div>${g.self!.abilities.length ? `<div class="abilities"><span>${icon('Sparkles', 16)} 영구 기적</span><div>${g.self!.abilities.map((p, i) => cardHtml(p, i, true)).join('')}</div></div>` : ''}</section>` : '<div class="spectator-note">' + icon('Eye') + ' 관전 중 · 다른 사람의 손패는 공개되지 않습니다.</div>'}</main>`;
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
        `<button class="codex-card" data-detail="${c.id}"><div class="codex-art ${c.type.toLowerCase()}">${icon(typeIcon[c.type], 44)}${icon(attrIcon[c.attribute], 18)}</div><div><small>${typeNames[c.type]} · ${attributeNames[c.attribute]} · #${c.id}</small><h3>${esc(c.name.ko)}</h3><p>${esc(c.description.ko || '별도의 추가 효과 없음')}</p><div class="codex-stats"><span>공격 ${attackValue(c)} / 방어 ${defenseValue(c)}</span><span>${c.type === 'MAGIC' ? 'MP ' + c.subValue : c.price + 'G'}</span></div><small>${c.weight > 0 ? '출현 가중치 ' + c.weight : '일반 드로우 제외 · 특수 데이터'}</small></div></button>`,
    )
    .join(
      '',
    )}</div>${filtered.length > codexLimit ? '<button class="button load-more" data-load-more>카드 더 보기</button>' : ''}</main>`;
}
function guide() {
  const sections = [
    [
      '01',
      '살아남는 사람이 승리합니다',
      'HP 40, MP 10, 소지금 20으로 시작합니다. 개인전은 최후의 생존자, 팀전은 마지막 생존 팀이 승리합니다. 시작 카드 10장, 일반 손패와 영구 기적을 합쳐 최대 16칸입니다.',
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
      '기본 100턴 이후 카드 사용·지급마다 25% 악마 위험이 생깁니다. 시작 턴과 피해량 5/10/15는 이 게임의 설정이며 원본 확정 수치가 아닙니다. 입력 제한은 30초이며, 시간이 지나면 AI가 대신 행동합니다. 재접속하면 저장된 경기와 조작권을 복구합니다.',
    ],
  ];
  return `<main class="page-container guide"><div class="page-heading"><div><div class="eyebrow">A LITTLE HELP, A GREAT ADVENTURE</div><h1>당신의 첫 번째 의회</h1><p>작은 선택들이 모여 하나의 전략이 됩니다.</p></div><button class="button primary" data-practice>연습하며 배우기 ${icon('ArrowRight')}</button></div><div class="guide-grid">${sections.map(([n, h, t]) => `<article class="panel guide-section"><span>${n}</span><h2>${h}</h2><p>${t}</p></article>`).join('')}</div><p class="muted">원본 Flash 화면·이미지·음원은 사용하지 않습니다. 한국어 카드명은 원작 번역명이 아닌 새 이름입니다. 상세 규칙과 원본과의 차이는 소스의 docs/game-rules.md를 참고해 주세요.</p></main>`;
}
function render() {
  const chatInput = document.querySelector<HTMLInputElement>('#chat-form input'),
    chatValue = chatInput?.value;
  const active = document.activeElement?.id;
  const scroll = document.querySelector('.hand-cards')?.scrollLeft ?? 0;
  app.innerHTML =
    header() +
    (room
      ? room.game
        ? battle()
        : waitingRoom()
      : page === 'home'
        ? home()
        : page === 'lobby'
          ? lobbyPage()
          : page === 'codex'
            ? codex()
            : guide()) +
    `<footer><span>✧ 별의 의회 · Aether Arena</span><span>새로운 운명이 시작되는 곳</span><a href="/source.zip" download>소스 코드 · AGPL-3.0</a></footer>`;
  hydrate();
  if (chatValue) {
    const e = document.querySelector<HTMLInputElement>('#chat-form input');
    if (e) e.value = chatValue;
  }
  const hand = document.querySelector('.hand-cards');
  if (hand) hand.scrollLeft = scroll;
  if (active === 'chat-input')
    document.querySelector<HTMLInputElement>('#chat-form input')?.focus();
  countdown();
}
function countdown() {
  const t = document.querySelector('#turn-countdown');
  if (t)
    t.textContent = room?.deadline
      ? `${Math.max(0, Math.ceil((room.deadline - Date.now()) / 1000))}초`
      : '--';
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
      name: '별빛 연습 의회',
      namePlayer: localStorage.getItem('arena-name') || '여행자',
      difficulty,
      private: true,
      capacity: 4,
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
    `<div class="eyebrow">PREFERENCES</div><h2>나만의 플레이 환경</h2><form id="settings-form"><label>플레이어 이름<input name="name" maxlength="20" value="${esc(localStorage.getItem('arena-name') || '여행자')}"></label><label>효과음 <span id="effects-value">${Math.round(preferences.effects * 100)}%</span><input name="effects" type="range" min="0" max="1" step="0.05" value="${preferences.effects}"></label><label>배경 음악<input name="music" type="range" min="0" max="1" step="0.05" value="${preferences.music}"></label><label class="check-label"><input name="motion" type="checkbox" ${preferences.motion ? 'checked' : ''}> 전투 애니메이션</label><button class="button primary" type="submit">설정 저장</button></form><p class="muted">음악과 효과음은 이 게임에서 합성한 사운드입니다. 이름은 새 방을 만들 때 적용됩니다.</p>`,
  );
}
function showCreate() {
  modal(
    `<div class="eyebrow">A NEW COUNCIL</div><h2>우리만의 의회를 열어요</h2><form id="create-form"><label>방 이름<input name="name" required maxlength="40" value="함께하는 별의 의회"></label><div class="form-grid"><label>게임 모드<select name="mode"><option value="ffa">개인전</option><option value="team">팀전</option></select></label><label>최대 인원<select name="capacity">${[2, 3, 4, 5, 6, 7, 8].map((n) => `<option ${n === 4 ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div><label>비밀번호 · 선택<input name="password" type="password" maxlength="80" autocomplete="new-password" placeholder="친구만 초대하고 싶다면 입력해 주세요"></label><label class="check-label"><input name="private" type="checkbox"> 공개 목록에 표시하지 않기</label><button class="button primary">게임방 만들기 ${icon('ArrowRight')}</button></form>`,
  );
}
function showJoin(id = '', locked = false, spectate = false) {
  modal(
    `<h2>${spectate ? '전투 관전하기' : '의회에 참가하기'}</h2><form id="join-form"><label>방 코드<input name="roomId" value="${esc(id)}" required></label><label>비밀번호<input name="password" type="password" placeholder="설정된 경우에만 입력" autocomplete="off"></label><input name="spectate" type="hidden" value="${spectate}"><button class="button primary">${spectate ? '관전하기' : '참가하기'}</button></form>`,
  );
}
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button,a');
  if (!b) return;
  unlockAudio();
  if (b.hasAttribute('disabled')) return;
  if (b.dataset.page) {
    e.preventDefault();
    navigate(b.dataset.page);
  } else if (b.hasAttribute('data-settings')) openSettings();
  else if (b.hasAttribute('data-toggle-sidebar')) {
    showSidebar = !showSidebar;
    render();
  } else if (b.hasAttribute('data-close')) dialog.close();
  else if (b.hasAttribute('data-practice')) startPractice();
  else if (b.hasAttribute('data-create')) showCreate();
  else if (b.hasAttribute('data-join-code')) showJoin();
  else if (b.hasAttribute('data-refresh')) conn.send({ type: 'lobby' });
  else if (b.dataset.join)
    showJoin(b.dataset.join, b.dataset.locked === 'true', b.dataset.spectate === 'true');
  else if (b.hasAttribute('data-leave')) {
    conn.send({ type: 'leave' });
  } else if (b.hasAttribute('data-ready'))
    conn.send({ type: 'ready', ready: !room?.seats.find((p) => p.id === conn.id)?.ready });
  else if (b.hasAttribute('data-start')) conn.send({ type: 'start' });
  else if (b.hasAttribute('data-add-bot')) conn.send({ type: 'addBot', difficulty });
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
    if (tutorialStep === 2) tutorialStep = 3;
    render();
  } else if (b.hasAttribute('data-clear')) {
    selected = [];
    render();
  } else if (b.hasAttribute('data-pass')) action({ kind: 'pass' });
  else if (b.hasAttribute('data-discard')) action({ kind: 'discard', pieces: [...selected] });
  else if (b.hasAttribute('data-take')) action({ kind: 'defend', pieces: [] });
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
    if (room?.host === conn.id) conn.send({ type: 'start' });
    else {
      conn.send({ type: 'ready', ready: true });
      toast('준비되었습니다. 모두 준비하면 방장이 다시 시작할 수 있습니다.');
    }
  } else if (b.hasAttribute('data-replay')) conn.send({ type: 'replay' });
  else if (b.dataset.detail) {
    const c = card(Number(b.dataset.detail));
    modal(
      `<div class="eyebrow">CARD #${c.id}</div><h2>${esc(c.name.ko)}</h2><div class="detail-glyph">${icon(typeIcon[c.type], 64)}</div><p>${esc(c.description.ko)}</p><dl><dt>속성</dt><dd>${attributeNames[c.attribute]}</dd><dt>공격 / 방어</dt><dd>${attackValue(c)} / ${defenseValue(c)}</dd><dt>가격 / 가중치</dt><dd>${c.price}G / ${c.weight}</dd><dt>원본 CSV ID</dt><dd>${c.id} · ${c.nameStatus}</dd></dl><small>한국어 이름은 새로 만든 이름이며, 원작 번역 확정 데이터가 아닙니다.</small>`,
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
  if (el.id === 'difficulty') difficulty = el.value as Difficulty;
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
  if (msg.type === 'left') {
    room = null;
    lastVersion = -1;
    lastEvent = 0;
    selected = [];
    pending = false;
    page = 'lobby';
    conn.send({ type: 'lobby' });
    render();
  }
  if (msg.type === 'room') {
    const next = msg.room as Room;
    const g = next.game,
      changed = g && (lastMatch !== g.id || lastVersion !== g.version);
    const previous = room?.game;
    room = next;
    if (changed) {
      if (tutorialStep === 4) {
        tutorialStep = 0;
        toast('첫 행동이 완료되었습니다. 이제 나만의 조합을 만들어 보세요.');
      }
      selected = [];
      pending = false;
      lastVersion = g!.version;
      if (!target || g!.players.find((p) => p.id === target)?.dead)
        target = g!.players.find((p) => p.id !== conn.id && !p.dead)?.id ?? conn.id;
    }
    render();
    if (g) {
      if (!previous || previous.id !== g.id || g.version < previous.version) {
        lastEvent = g.events.at(-1)?.seq ?? 0;
      }
      const fresh = g.events.filter((e) => e.seq > lastEvent);
      lastEvent = g.events.at(-1)?.seq ?? lastEvent;
      lastMatch = g.id;
      for (const e of fresh.slice(-6)) {
        animateEvent(e);
        if (
          [
            'attack',
            'damage',
            'heal',
            'reflect',
            'block',
            'status',
            'summon',
            'death',
            'game_end',
          ].includes(e.type)
        )
          sound(e.type);
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
      `<h2>이번 의회의 전투 기록</h2><p>공개 행동만 표시합니다. 사용하지 않은 손패는 공개하지 않습니다.</p><div class="replay-list">${(
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
setInterval(countdown, 1000);
render();
conn.connect();

document.addEventListener(
  'error',
  (e) => {
    const el = e.target;
    if (el instanceof HTMLImageElement && el.classList.contains('card-art')) {
      if (!el.dataset.fallback) {
        el.dataset.fallback = '1';
        el.src = '/assets/card-placeholder.svg';
      } else el.hidden = true;
    }
  },
  true,
);
