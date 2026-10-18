import { cards, card, attributeNames, attackValue, defenseValue } from '../../shared/catalog';
import type { GameView, Piece, CardDefinition } from '../../shared/types';
import { esc, icon } from './html';

interface BattleProps {
  game: GameView;
  viewer: string;
  mode: string;
  selected: string[];
  target: string;
  handFilter: string;
  pending: boolean;
  connected: boolean;
  canAct: boolean;
  showSidebar: boolean;
  tutorialStep: number;
  renderCard: (p: Piece, i: number, permanent?: boolean) => string;
  renderPlayer: (p: GameView['players'][number], i: number) => string;
  renderArt: (c: CardDefinition, size?: number) => string;
  logs: string;
  chat: string;
}
// Rendering is a projection of server state. Cosmetic state never resolves combat.
export function battleView(ui: BattleProps) {
  const { game: g, viewer, canAct, renderArt } = ui;
  const me = g.players.find((p) => p.id === viewer);
  const actor = g.players.find((p) => p.id === (g.current?.source ?? g.attacker));
  const receiver = g.players.find((p) => p.id === (g.current?.target ?? ui.target));
  const defense = g.phase === 'DEFENSE_SELECTION' && g.current?.target === viewer;
  const buying = g.phase === 'BUY_CONFIRMATION' && Boolean(g.purchase);
  const finished = g.phase === 'FINISHED';
  const doom = g.doom >= 100;
  const owned = [...(g.self?.hand ?? []), ...(g.self?.abilities ?? [])];
  const chosen = ui.selected.map((uid) => owned.find((p) => p.uid === uid)).filter(Boolean) as Piece[];
  const currentCards = g.current?.cards.map((c) => cards[c.id] ?? c) ?? [];
  const preview = currentCards[0] ?? (chosen.length ? card(chosen[0].cardId) : undefined);
  const banner = finished ? '전투가 끝났습니다' : canAct
    ? defense ? '공격을 막을 차례입니다' : buying ? '구매를 결정해 주세요' : '당신의 차례입니다'
    : g.phase === 'DEFENSE_SELECTION' ? `${receiver?.name ?? '상대'}의 방어를 기다리는 중`
    : `${actor?.name ?? '여행자'}의 선택을 기다리는 중`;
  const demon = doom && !finished && [...g.events].reverse().find((e) => e.type === 'demon' && e.turn >= g.turn - 1);
  const hand = (g.self?.hand ?? []).filter((p) => ui.handFilter === 'all' || card(p.cardId).type === ui.handFilter);
  const filters = [['all', '전체'], ['WEAPON', '무기'], ['PROTECTOR', '방어구'], ['MAGIC', '기적'], ['TRADE', '거래'], ['SUNDRY', '도구']];
  const actions = buying
    ? `<span class="purchase-label">${esc(card(g.purchase!.cardId).name.ko)} · ${g.purchase!.price}G</span><button class="button" data-buy="false" ${!canAct ? 'disabled' : ''}>거절</button><button class="button primary" data-buy="true" ${!canAct ? 'disabled' : ''}>구매하기</button>`
    : defense
      ? `<button class="button" data-take ${!canAct ? 'disabled' : ''}>피해 받기</button><button class="button primary" data-use ${!canAct || !chosen.length ? 'disabled' : ''}>${icon('Shield')} 방어하기</button>`
      : `<button class="button" data-discard ${!canAct || !chosen.length ? 'disabled' : ''}>버리기</button><button class="button" data-pass ${!canAct ? 'disabled' : ''}>턴 넘기기</button><button class="button primary" data-use ${!canAct || !chosen.length ? 'disabled' : ''}>${icon('Swords')} 카드 사용</button>`;
  function focus(c: CardDefinition) {
    return `<article class="focus-card attr-${c.attribute || 'NONE'}">${renderArt(c, 104)}<div class="focus-copy"><small>${g.current ? '지금 사용한 카드' : '선택한 카드'} · ${attributeNames[c.attribute]}</small><h3>${esc(c.name.ko)}</h3><p>${esc(c.description.ko || '별도의 추가 효과 없음')}</p><div class="focus-numbers"><b>공격 ${attackValue(c)}</b><b>방어 ${defenseValue(c)}</b><span>${c.type === 'MAGIC' ? 'MP ' + c.subValue : '₩ ' + c.price}</span></div></div>${cards[c.id] ? `<button class="focus-detail" data-detail="${c.id}" aria-label="${esc(c.name.ko)} 상세 보기">${icon('BookOpen', 17)}</button>` : ''}</article>`;
  }
  return `<main class="battle-page field-battle tutorial-step-${ui.tutorialStep} ${doom ? 'doom' : ''}" data-doom="${doom}" data-phase="${g.phase}">
    <div class="battle-top"><div class="turn-banner ${canAct ? 'your-turn' : ''}" role="status"><span class="live-dot"></span>${esc(banner)}</div><div class="turn-track"><span class="phase-pill">${finished ? '경기 종료' : defense || g.phase === 'DEFENSE_SELECTION' ? '방어' : buying ? '거래' : '공격'}</span><span class="timer">${icon('Clock', 15)} <b id="turn-countdown">--</b></span></div></div>
    <div class="doom-track"><span>${icon(doom ? 'Moon' : 'Sun', 14)} ${doom ? '종말 · 악마의 기척' : `종말의 시간 · ${g.rules.doomAt}턴`}</span><div role="progressbar" aria-label="종말 진행도" aria-valuenow="${g.doom}" aria-valuemin="0" aria-valuemax="100"><i style="width:${g.doom}%"></i></div><b>${doom ? '종말 시작' : `${g.doom}%`}</b></div>
    ${ui.tutorialStep ? `<div class="tutorial-hint">${['', '1 / 3 · 손패의 카드를 눌러 선택해 보세요.', '2 / 3 · 플레이어를 눌러 대상을 골라 보세요.', '3 / 3 · 카드 사용을 눌러 보세요.', '첫 행동을 처리하고 있습니다.'][ui.tutorialStep]}</div>` : ''}
    <div class="field-board">
      <section class="battle-center field-stage" aria-label="전투 상황">
        <div class="attack-route"><span class="route-player"><i class="team-mark team-solo"></i>${esc(actor?.name ?? '공격자')}</span><span class="route-arrow" aria-hidden="true">➜</span><span class="route-player ${receiver ? 'has-target' : ''}">${esc(receiver?.name ?? '공격 대상을 선택하세요')}</span></div>
        ${demon ? `<div class="demon-event" role="status">${icon('Moon', 24)}<div><b>악마 출현</b><span>${esc(g.players.find((p) => p.id === demon.target)?.name ?? '플레이어')} · HP −${demon.amount ?? 0}</span></div></div>` : ''}
        <div class="field-focus">${preview ? focus(preview) : `<div class="field-rest"><span>${icon(doom ? 'Moon' : 'Sparkles', 48)}</span><h2>${finished ? '이번 전투의 막이 내렸습니다' : doom ? '종말이 시작되었습니다' : '한 장의 카드가 운명을 바꿉니다'}</h2><p>${finished ? '결과를 확인하거나 다시 대전하세요.' : '카드 선택 → 대상 선택 → 카드 사용'}</p></div>`}</div>
        ${g.current ? `<div class="attack-summary"><span>현재 공격</span><b class="attack-power">${g.current.damage} · ${attributeNames[g.current.attribute ?? '']}</b></div><div class="played-cards">${currentCards.map((c) => `<span>${renderArt(c, 36)}${esc(c.name.ko)}</span>`).join('<b>+</b>')}</div>` : ''}
        ${finished ? `<div class="result"><h2>${g.winners.includes(viewer) ? '승리하셨습니다!' : g.winners.length ? '승자가 정해졌습니다' : '무승부입니다'}</h2><p>${g.winners.map((id) => esc(g.players.find((p) => p.id === id)?.name)).join(' · ')}</p><button class="button primary" data-rematch>다시 대전</button><button class="button" data-replay>전투 기록</button></div>` : ''}
      </section>
      <section class="arena field-players" id="players"><div class="board-heading"><b>플레이어</b><span>눌러서 대상 선택 · ${ui.mode === 'team' ? '팀전' : '개인전'}</span><a class="mobile-only" href="#my-hand">내 카드 ↓</a></div><div class="opponents">${g.players.map(ui.renderPlayer).join('')}</div></section>
      ${g.self ? `<section class="hand-area" id="my-hand"><div class="action-dock"><div class="target-summary">${defense ? '방어 카드를 선택하세요' : buying ? '구매 여부를 선택하세요' : `대상 <b>${receiver ? esc(receiver.name) : '미선택'}</b> <a href="#players" class="target-edit">변경 ↑</a>`}<small>${ui.pending ? '서버 처리 중…' : !ui.connected ? '재연결 중' : canAct ? '지금 행동할 수 있습니다' : '다른 플레이어의 차례입니다'}</small></div><div class="hand-actions">${actions}</div></div><div class="hand-toolbar"><h3>내 카드 <span class="count">${g.self.hand.length + g.self.abilities.length} / ${g.rules.capacity}</span></h3><small>${me?.dead ? '탈락 · 관전 중' : '눌러서 선택 · 책 버튼으로 상세 보기'}</small></div><div class="hand-tabs" role="group" aria-label="손패 종류 필터">${filters.map(([key, label]) => `<button data-hand-filter="${key}" class="${ui.handFilter === key ? 'active' : ''}" aria-pressed="${ui.handFilter === key}">${label}</button>`).join('')}</div><div class="hand-cards" aria-label="내 카드">${hand.map((p, i) => ui.renderCard(p, i)).join('') || '<p class="empty-hand">이 종류의 카드가 없습니다.</p>'}</div><div class="selection-panel"><div class="selection-heading"><b>선택한 카드 ${chosen.length}장</b><button class="text-button" data-clear>모두 해제</button></div><div class="selected-names">${chosen.length ? chosen.map((p) => `<span>${esc(card(p.cardId).name.ko)}</span>`).join('<b>+</b>') : '<span class="muted">사용할 카드를 골라 주세요.</span>'}</div></div></section><section class="miracle-rack abilities"><h3>${icon('Sun', 22)} 일으킨 기적 <small>${g.self.abilities.length}개</small></h3><div>${g.self.abilities.length ? g.self.abilities.map((p, i) => ui.renderCard(p, i, true)).join('') : '<p class="empty-miracles">기적을 사용하면 이곳에 남습니다.<small>MP를 소모하여 다시 사용할 수 있어요.</small></p>'}</div></section>` : '<div class="spectator-note">관전 중 · 다른 사람의 손패는 공개되지 않습니다.</div>'}
    </div>
    <div class="battle-tools"><span>${icon(ui.connected ? 'Wifi' : 'WifiOff', 14)} ${ui.connected ? '서버 연결됨' : '재연결 중'}</span><button class="button small" data-toggle-sidebar aria-expanded="${ui.showSidebar}" aria-controls="battle-records">${icon('ScrollText', 16)} 기록·채팅</button></div><aside id="battle-records" class="battle-sidebar ${ui.showSidebar ? 'expanded' : ''}" ${ui.showSidebar ? '' : 'hidden'}>${ui.logs}${ui.chat}</aside>
  </main>`;
}
