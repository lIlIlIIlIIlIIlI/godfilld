import { cards, card, attributeNames, attackValue, defenseValue } from '../../shared/catalog';
import type { GameView, Piece, CardDefinition } from '../../shared/types';
import { esc, icon } from './html';
import { referenceIcon } from './reference-icons';
import type { BattleCue } from './presentation';
import screenAssets from '../../data/ui-asset-manifest.json';

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
  showMiracles: boolean;
  hoveredUid: string;
  tutorialStep: number;
  cue: BattleCue | null;
  renderCard: (p: Piece, i: number, permanent?: boolean) => string;
  renderPlayer: (p: GameView['players'][number], i: number) => string;
  renderArt: (c: CardDefinition, size?: number) => string;
  logs: string;
  chat: string;
}
export function battleView(ui: BattleProps) {
  const { game: g, viewer, canAct } = ui;
  const own = [...(g.self?.hand ?? []), ...(g.self?.abilities ?? [])];
  const chosen = ui.selected
    .map((uid) => own.find((p) => p.uid === uid))
    .filter(Boolean) as Piece[];
  const hovered = own.find((p) => p.uid === ui.hoveredUid);
  const played = g.current?.cards.map((c) => cards[c.id] ?? c) ?? [];
  const selectedCard = chosen.length ? card(chosen[0].cardId) : undefined;
  const inspecting = hovered ? card(hovered.cardId) : selectedCard;
  const preview = inspecting ?? played[0];
  const info =
    preview ?? (g.self?.abilities.length ? card(g.self.abilities.at(-1)!.cardId) : undefined);
  const actor = g.players.find((p) => p.id === (g.current?.source ?? g.attacker));
  const receiver = g.players.find((p) => p.id === (g.current?.target ?? ui.target));
  const defense = g.phase === 'DEFENSE_SELECTION' && g.current?.target === viewer;
  const buying = g.phase === 'BUY_CONFIRMATION' && Boolean(g.purchase);
  const finished = g.phase === 'FINISHED';
  const doom = g.doom >= 100;
  const cue = ui.cue;
  const cueTarget = g.players.find((p) => p.id === cue?.target);
  const demonAsset =
    cue?.demonDamage === undefined
      ? undefined
      : screenAssets.assets.find((asset) => 'damage' in asset && asset.damage === cue.demonDamage);
  const impact = cue?.kind === 'damage' ? cue.amount : defense ? g.current?.damage : undefined;
  const remaining = finished ? g.players.filter((p) => !p.dead) : g.players;
  const fallen = finished ? g.players.filter((p) => p.dead) : [];
  const victory = g.winners.includes(viewer);
  const resultLabel = !g.winners.length
    ? '무승부'
    : victory
      ? '승리'
      : g.self
        ? '패배'
        : '경기 종료';
  const cueMarkup = cue
    ? '<div class="reference-cue" role="status" data-cue="' +
      cue.kind +
      '">' +
      (cue.kind === 'start'
        ? '<div class="reference-start-banner">예언자들의 전쟁이<br>지금 시작된다!</div>'
        : '<span class="route-player cue-target"><i class="team-mark team-solo"></i>' +
          esc(cueTarget?.name) +
          '</span>' +
          (cue.demonDamage !== undefined
            ? '<article class="reference-detail reference-devil"><span class="card-art-window" style="--art-size:80px"><img class="card-art" src="' +
              esc(demonAsset?.url ?? '/assets/card-placeholder.svg') +
              '" alt="악마 그림"></span><div class="reference-detail-copy"><h3>' +
              esc(demonAsset && 'name' in demonAsset ? demonAsset.name : '악마') +
              '</h3><b class="detail-power">' +
              cue.demonDamage +
              '데미지</b></div></article>'
            : '') +
          (cue.kind === 'death' ? '<div class="reference-ascension">승천</div>' : '')) +
      '</div>'
    : '';

  const demon =
    doom &&
    !finished &&
    [...g.events].reverse().find((e) => e.type === 'demon' && e.turn >= g.turn - 1);
  const hand = (g.self?.hand ?? []).filter(
    (p) => ui.handFilter === 'all' || card(p.cardId).type === ui.handFilter,
  );
  const filters = [
    ['all', '전체'],
    ['WEAPON', '무기'],
    ['PROTECTOR', '방어구'],
    ['MAGIC', '기적'],
    ['TRADE', '거래'],
    ['SUNDRY', '도구'],
  ];
  const activeName = g.phase === 'DEFENSE_SELECTION' ? receiver?.name : actor?.name;
  const status = finished
    ? '전투가 끝났습니다'
    : canAct
      ? defense
        ? '공격을 막을 차례입니다'
        : '당신의 차례입니다'
      : g.phase === 'DEFENSE_SELECTION'
        ? `${activeName ?? '상대'}의 방어를 기다리는 중`
        : `${activeName ?? '상대'}의 차례입니다`;
  function detail(c: CardDefinition, cls: string) {
    const power =
      c.attackKind === 'ATK'
        ? `${c.hitRate ? c.hitRate + '% ' : ''}공격${attackValue(c)}`
        : c.defenseKind === 'DFS'
          ? `방어${defenseValue(c)}`
          : c.description.ko.split(' · ')[0];
    return `<article class="reference-detail focus-card attr-${c.attribute || 'NONE'} ${cls}">${ui.renderArt(c, 80)}<div class="reference-detail-copy"><h3>${esc(c.type === 'MAGIC' ? '<' + c.name.ko + '>' : c.name.ko)}</h3><b class="detail-power">${esc(power)}</b><p>${esc(c.description.ko)}</p></div><span class="detail-price ${c.type === 'MAGIC' ? 'mp-cost' : ''}">${c.type === 'MAGIC' ? '소비<br>MP' + c.subValue : '₩' + c.price}</span>${cards[c.id] ? `<button class="focus-detail" data-detail="${c.id}" aria-label="${esc(c.name.ko)} 상세 보기"></button>` : ''}</article>`;
  }
  const actions = buying
    ? `<button class="reference-command" data-buy="true" ${!canAct ? 'disabled' : ''}>구입하기</button><button class="reference-command command-skip" data-buy="false" ${!canAct ? 'disabled' : ''}>거절하기</button>`
    : defense
      ? `<button class="reference-command defense-command" ${chosen.length ? 'data-use' : 'data-take'} ${!canAct ? 'disabled' : ''}>${chosen.length ? '방어하기' : '용서하기'}</button>`
      : `<button class="reference-command" ${chosen.length ? 'data-use' : 'data-pass'} ${!canAct ? 'disabled' : ''}>${chosen.length ? '사용하기' : '기도하기'}</button>`;
  return `<main class="battle-page reference-battle tutorial-step-${ui.tutorialStep} ${doom ? 'doom' : ''}" data-doom="${doom}" data-phase="${g.phase}" data-presentation="${cue?.kind ?? ''}">
    <div class="turn-banner sr-only" role="status">${esc(status)}<b id="turn-countdown">--</b></div>
    <div class="doom-track sr-only"><div role="progressbar" aria-label="종말 진행도" aria-valuenow="${g.doom}" aria-valuemin="0" aria-valuemax="100"></div></div>
    <div class="attack-route"><span class="route-player ${actor?.id === viewer ? 'is-self' : ''}"><i class="team-mark team-solo"></i>${esc(actor?.name ?? '')}</span>${g.current || inspecting ? `<svg class="route-arrow" viewBox="0 0 40 40" aria-hidden="true"><path fill="#ff5599" d="M0 10h20V0l20 20-20 20V30H0z"/></svg><span class="route-player route-receiver ${receiver?.id === viewer ? 'is-self' : ''}"><i class="team-mark team-solo"></i>${esc(receiver?.name ?? '')}</span>` : ''}</div>
    ${cueMarkup}
    ${impact !== undefined ? `<div class="reference-impact" role="status" aria-label="${cue?.kind === 'damage' ? '실제 피해' : '방어 전 예상 피해'} ${impact}"><b>${impact}</b><span>데미지</span></div>` : ''}
    <section class="battle-center reference-stage" aria-label="전투 상황">${preview ? detail(preview, inspecting ? 'reference-inspection' : 'reference-incoming') : ''}${played.length ? `<div class="played-cards sr-only">${played.map((c) => esc(c.name.ko)).join(' + ')}</div>` : ''}${demon ? `<div class="demon-event" role="status">악마 출현 · ${esc(g.players.find((p) => p.id === demon.target)?.name)} HP −${demon.amount ?? 0}</div>` : ''}</section>
    <section class="arena field-players" id="players" aria-label="플레이어 · 누르면 대상 선택"><div class="opponents ${g.players.length > 4 ? 'many-players' : g.players.length > 2 ? 'several-players' : ''}" style="--players:${g.players.length}">${remaining.map(ui.renderPlayer).join('')}</div></section>
    ${defense && g.current ? `<div class="reference-incoming-power attr-${g.current.attribute || 'NONE'}">공격${g.current.damage}</div>` : ''}
    <div class="action-dock ${canAct && !finished ? '' : 'inactive'}">${actions}</div><div class="reference-divider" id="turn-timebar" role="progressbar" aria-label="행동 제한 시간"><span class="turn-time-fill"></span></div>
    ${g.self ? `<section class="hand-area" id="my-hand" aria-label="내 카드"><h3 class="sr-only">내 카드 ${g.self.hand.length + g.self.abilities.length} / ${g.rules.capacity}</h3><div class="hand-cards">${hand.map((p, i) => ui.renderCard(p, i)).join('')}</div></section><details class="deck-options"><summary aria-label="손패 메뉴"><img src="/assets/reference/discard.webp" alt=""></summary><div class="deck-menu"><div class="hand-tabs" role="group" aria-label="손패 종류 필터">${filters.map(([key, name]) => `<button data-hand-filter="${key}" class="${ui.handFilter === key ? 'active' : ''}">${name}</button>`).join('')}</div><div class="selected-names">${chosen.map((p) => `<span>${esc(card(p.cardId).name.ko)}</span>`).join(' + ')}</div><button data-clear>선택 해제</button><button data-discard ${!canAct || !chosen.length ? 'disabled' : ''}>선택 카드 버리기</button></div></details><section class="miracle-rack abilities"><h3><button data-toggle-miracles aria-expanded="${ui.showMiracles}">${referenceIcon('miracle')} 일으킨 기적</button></h3><div class="miracle-content ${ui.showMiracles ? 'miracle-list' : ''}">${ui.showMiracles ? g.self.abilities.map((p, i) => ui.renderCard(p, i, true)).join('') || '<p class="empty-miracles">아직 일으킨 기적이 없습니다.</p>' : info ? detail(info, 'reference-info') : ''}</div></section>` : '<p class="spectator-note sr-only">관전 중 · 다른 사람의 손패는 공개되지 않습니다.</p>'}
    ${fallen.length ? '<section class="fallen-players" aria-label="탈락한 플레이어">' + fallen.map(ui.renderPlayer).join('') + '</section>' : ''}
    ${finished ? `<section class="result ${cue && cue.kind !== 'start' ? 'awaiting-cue' : ''}"><h2>${resultLabel}</h2><p class="result-winners ${g.winners.length > 1 ? 'multiple' : ''}">${g.winners.map((id) => '<span><i class="team-mark team-solo"></i>' + esc(g.players.find((p) => p.id === id)?.name) + '</span>').join('')}</p><button class="button result-end" data-leave>경기 끝내기</button><details class="result-more"><summary>재대전 · 전투 기록</summary><button class="button primary" data-rematch>다시 대전</button><button class="button" data-replay>전투 기록</button></details></section>` : ''}
    ${ui.tutorialStep ? `<p class="reference-tutorial">${['', '카드를 눌러 선택하세요.', '플레이어를 눌러 대상을 선택하세요.', '사용하기를 누르세요.', '서버 처리 중입니다.'][ui.tutorialStep]}</p>` : ''}
    <aside id="battle-records" class="battle-sidebar ${ui.showSidebar ? 'expanded' : ''}" ${ui.showSidebar ? '' : 'hidden'}><button class="reference-close" data-toggle-sidebar aria-label="게시록 닫기">×</button>${ui.logs}${ui.chat}</aside>
  </main>`;
}
