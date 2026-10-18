import raw from '../data/cards.json' with { type: 'json' };
import assets from '../data/asset-manifest.json' with { type: 'json' };
import koreanNames from '../data/card-names.ko.json' with { type: 'json' };
import type { Attribute, CardDefinition, CardType } from './types.js';
export const typeNames: Record<CardType, string> = {
  WEAPON: '무기',
  PROTECTOR: '방어구',
  MAGIC: '기적',
  TRADE: '거래',
  SUNDRY: '도구',
  CREATURE: '이벤트',
  FIXED: '행동',
};
export const attributeNames: Record<string, string> = {
  '': '무속성',
  FIRE: '화염',
  WATER: '물결',
  TREE: '숲',
  SOIL: '대지',
  LIGHT: '빛',
  DARK: '어둠',
};
export const statusNames: Record<string, string> = {
  COLD: '감기',
  FEVER: '열병',
  HELL: '지옥병',
  HEAVEN: '천국병',
  FOG: '안개',
  ILLUSION: '꿈',
  GLORY: '섬광',
  DARK_CLOUD: '먹구름',
};
export const effectNames: Record<string, string> = {
  ATK: '공격',
  INCREASE_ATK: '추가 공격',
  DOUBLE_ATK: '공격력 두 배',
  WIDE_ATK: '적 전체 공격 · 무속성 전환',
  ADD_ATTRIBUTE: '속성 덮어쓰기',
  ABSORB_HP: '피해량만큼 HP 흡수',
  DAMAGE_TO_SELF: '같은 피해를 자신도 받음',
  MAGICAL: '남은 MP 전부를 공격력 두 배로 전환',
  MAGIC_FREE: '바로 앞 기적의 MP 비용 면제',
  PESTLE: '위험한 그릇 소유자에게 999 피해 · 없으면 무작위 대상',
  DYING_ATTACK: '사망 시 빛 30 · 적 전체 75%',
  REVIVE: '사망 직전 HP 10 부활',
  MORTAR: '특수 공격의 표적 · 버릴 수 없음',
  INCREASE_HP: 'HP 회복',
  INCREASE_MP: 'MP 회복',
  INCREASE_YEN: '소지금 획득',
  ABSORB_YEN: '소지금 흡수 · 부족분 MP→HP',
  SCATTER_YEN: '모두 소지금 획득',
  SET_ASSISTANT: '무작위 수호자 소환 · HP 20',
  REMOVE_ALL_HARMS: '모든 재앙 해제',
  REMOVE_LOWER_HARMS: '감기·열병·안개·섬광 해제',
  REMOVE_ITEMS: '상대 일반 카드 1장 제거',
  REMOVE_ABILITIES: '상대 영구 기적 1개 제거',
  INCREASE_OR_DECREASE_HP: '50%로 HP +10 또는 피해 10',
  MYSTERY: '열 가지 운명 중 무작위 발동',
  EXCHANGE: 'HP·MP·소지금 총합을 보존하여 재분배',
  SELL: '카드 한 장을 골라 상대에게 강제 판매',
  BUY: '상대 카드 무작위 선택 후 구매 확인',
  ADD_ITEM: '카드 한 장 지급',
  DFS: '방어',
  COUNTER: '받은 피해를 기준으로 반격',
  REFLECT_ANY: '공격 되돌리기',
  REFLECT_WEAPON: '무기 되돌리기',
  REFLECT_MAGIC: '기적 되돌리기',
  FLICK_WEAPON: '무기 무작위 튕겨내기',
  FLICK_MAGIC: '기적 무작위 튕겨내기',
  BLOCK_MAGIC: '기적 완전 차단',
  BLOCK_WEAPON: '무기 완전 차단',
  REMOVE_ATTRIBUTE: '공격 속성 제거',
  TO_ENEMY: '적에게 무작위 지정',
  DO_NOTHING: '대기',
  DISCARD: '카드 버리기',
};
export const cards: CardDefinition[] = raw.map((r) => {
  const type = r.type as CardType,
    effects = [r.attackKind, r.attackExtra, r.defenseKind, r.defenseExtra].filter(Boolean);
  const name = (koreanNames as Record<string, string>)[String(r.id)] ?? '이름 미등록 카드';
  const desc =
    effects.map((e) => effectNames[e] ?? statusNames[e] ?? e).join(' · ') +
    (r.hitRate ? ` · 대상별 명중 ${r.hitRate}%` : '') +
    (type === 'MAGIC' ? ` · MP ${r.subValue}, 획득 후 반복 사용, 보유 공간 1칸` : '');
  const approved = (
    assets.approvedOriginalAssets as Record<
      string,
      { url: string; permissionConfirmed: boolean; sprite: CardDefinition['imageSprite'] }
    >
  )[String(r.id)];
  return {
    ...r,
    type,
    attribute: r.attribute as Attribute,
    name: { ko: name, en: `Aether ${type.toLowerCase()} ${r.id}` },
    description: { ko: desc, en: effects.join(' / ') },
    image: approved?.permissionConfirmed ? approved.url : assets.default.url,
    imageSprite: approved?.permissionConfirmed ? approved.sprite : undefined,
    nameStatus: 'original-new-name',
    targetRule: ['EXCHANGE', 'MYSTERY', 'DO_NOTHING', 'DISCARD'].includes(r.attackKind)
      ? 'self'
      : ['SELL', 'BUY'].includes(r.attackKind)
        ? 'other-alive'
        : 'any-alive',
    contexts: [
      ...(r.attackKind && type !== 'PROTECTOR' ? ['attack' as const] : []),
      ...(r.defenseKind || r.defenseExtra ? ['defense' as const] : []),
      ...(['REVIVE', 'MORTAR', 'DYING_ATTACK'].includes(r.attackExtra) ? ['passive' as const] : []),
    ],
    effectIds: effects,
  };
});
export const cardById = new Map(cards.map((c) => [c.id, c]));
type OriginalArt = { url: string; sprite: NonNullable<CardDefinition['imageSprite']> };
export function assistantArt(id: number): OriginalArt | undefined {
  return (assets.assistantActions as Record<string, OriginalArt>)[String(id)];
}
export function summonArt(type: string): OriginalArt | undefined {
  return (assets.summonPortraits as Record<string, OriginalArt>)[type];
}
export function card(id: number): CardDefinition {
  const c = cardById.get(id);
  if (!c) throw new Error('존재하지 않는 카드입니다.');
  return c;
}
export function attackValue(c: CardDefinition) {
  return c.attackKind === 'ATK'
    ? c.value
    : ['INCREASE_ATK', 'ADD_ATTRIBUTE'].includes(c.attackExtra)
      ? ['WEAPON', 'MAGIC'].includes(c.type)
        ? c.value
        : c.subValue
      : 0;
}
export function defenseValue(c: CardDefinition) {
  return c.defenseKind === 'DFS' ? (c.type === 'WEAPON' ? c.subValue : c.value) : 0;
}
