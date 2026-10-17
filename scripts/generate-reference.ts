import { writeFileSync } from 'node:fs';
import {
  cards,
  attackValue,
  defenseValue,
  typeNames,
  attributeNames,
  effectNames,
  statusNames,
} from '../shared/catalog';
import summons from '../data/summons.json';
import { effectResolvers } from '../server/src/game/CardEffectResolver';
const safe = (v: unknown) => String(v ?? '').replaceAll('|', '/');
const lines = [
  '# 카드별 규칙 명세',
  '',
  '기준 CSV의 0 기반 ID를 그대로 보존합니다. 아래 한국어 이름은 새로 만든 명칭이며 원작 번역 데이터가 아닙니다. image는 모두 권리가 확인된 신규 placeholder입니다. 모든 일반 데이터364행과 소환체 행동42행을 기재합니다.',
  '',
  '## 데이터 필드와 해석',
  '',
  '`value/subValue`는 종류와 효과에 따라 의미가 달라집니다. WEAPON의 DFS는 subValue, PROTECTOR의 DFS는 value, MAGIC의 MP비용은 subValue입니다. INCREASE_ATK의 보조 수치는 무기/기적은 value, 방어구/도구는 subValue입니다. hitRate>0은 적 전체에 대상별 명중 판정합니다. weight0은 일반 드로우에서 제외합니다. price0을 무조건 거래 가능한 것으로 해석하지 않습니다.',
  '',
  '대상 규칙 self는 자신, other-alive는 자신 외 생존자, any-alive는 생존자입니다. DEFENSE의 실제 대상은 현재 공격을 받는 플레이어입니다. 공격 상황 표시는 첫 카드 유효성의 안내이며, 추가 효과는 조합 후속 위치에서만 쓸 수 있습니다.',
  '',
  '## 일반 카드 전체',
  '',
  '| ID | 신규 한국어 이름 | 종류 | 속성 | attackKind / attackExtra | defenseKind / defenseExtra | value / subValue | 공격 / 방어 | MP | 명중% | 가격 | 가중치 | 대상 | 사용 상황 |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
];
for (const c of cards)
  lines.push(
    `| ${c.id} | ${safe(c.name.ko)} | ${typeNames[c.type]} | ${attributeNames[c.attribute]} | ${c.attackKind || '—'} / ${c.attackExtra || '—'} | ${c.defenseKind || '—'} / ${c.defenseExtra || '—'} | ${c.value} / ${c.subValue} | ${attackValue(c)} / ${defenseValue(c)} | ${c.type === 'MAGIC' ? c.subValue : 0} | ${c.hitRate || '확정 단일'} | ${c.price} | ${c.weight} | ${c.targetRule} | ${c.contexts.join(',') || '후속 조합'} |`,
  );
lines.push('', '## 카드별 표시 설명', '');
for (const c of cards)
  lines.push(
    `- **#${c.id} ${c.name.ko}**: ${c.description.ko || '추가 효과 없음'}. ${c.weight === 0 ? '일반 드로우 제외. ' : ''}자산: \`${c.image}\`.`,
  );
lines.push(
  '',
  '## 특수 수치와 적용 위치',
  '',
  '- #0/#1은 손패가 아닌 대기/버리기 명령에 대응합니다. 새 게임의 대기·버리기 보충 정책은 game-rules.md에 따릅니다.',
  '- #99: MORTAR 소유자 탐색→999 피해. 없으면 무작위30 피해. #245: 일반 사용 불가, 버리기 불가, 판매 가능.',
  '- #117: 일반 사용은 CSV상 빛1/75% 적 전체. 사망 시에는 빛30/75% 적 전체로 전환합니다.',
  '- #187: 미방어 공격량을 화염 반격,75% 적 전체. #190: 대지 반격2배. #193: 본인 MP2배. #194: 공격자 소지금 흡수.',
  '- #195 속성 제거는 방어 합성에서 제외하고 공격 속성만 지웁니다. #196 만능 반사는 일반 속성/반격 제한의 예외입니다.',
  '- #243 MYSTERY: MARS 열병 / MERCURY 안개 / JUPITER 꿈 / SATURN 모두HP1 / URANUS 임의 빛60 / PLUTO 적 전체 어둠30·75% / NEPTUNE 본인HP+60 / VENUS 모두소지금99 / EARTH 일반 손패 재분배 / MOON 모두 수호자. 각 분기가 별도 함수입니다.',
  '- #244는 직접 사용하는 대신 죽음 판정에 반응하여 HP10으로 회복합니다.',
  '- #246~253 CREATURE는 출현 가중치0이며 이벤트용 데이터입니다. 기본 종말 악마 피해표는 별도 신규 설정이고, 이8행을 무조건 무작위 드로우하지 않습니다.',
  '- MAGIC_FREE는 바로 앞 MAGIC의 비용만 면제하며 자신은 일반 손패에서 소모됩니다.',
  '- ADD_ATTRIBUTE는 후속 조합에서 속성을 덮어쓰고 기본 value를 추가 공격력으로 중복 합산하지 않습니다.',
  '',
  '## 소환체 행동 전체',
  '',
  '원본 AssistantItemData.CSV의 ID는 수호자 종류마다0부터 시작합니다. JSON id는 전체 CSV 행 번호입니다. 아래 두 ID를 모두 기록합니다. EARTH와 MOON은 한 행을 그대로 반복하는 대신 일반/기적 카드 조합을 생성합니다.',
  '',
  '| CSV 전체 ID | 원본 종류 내부 ID | 수호자 | attackKind | attackExtra | 속성 | 수치 | 명중% | 가중치 |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
);
const counts: Record<string, number> = {};
for (const c of summons) {
  const local = counts[c.assistantType] ?? 0;
  counts[c.assistantType] = local + 1;
  lines.push(
    `| ${c.id} | ${local} | ${c.assistantType} | ${c.attackKind} | ${c.attackExtra || '—'} | ${attributeNames[c.attribute]} | ${c.value} | ${c.hitRate || '확정 단일'} | ${c.weight} |`,
  );
}
lines.push(
  '',
  '## 효과 처리 레지스트리',
  '',
  ...Object.keys(effectResolvers)
    .sort()
    .map((key) => `- \`${key}\`: ${effectNames[key] ?? statusNames[key] ?? key}`),
  '',
  'ATK와 공격 보조 효과는 CombatResolver, 방어는 DefenseResolver, EXCHANGE/SELL의 소유권 검증은 TradeManager 및 공격 제출 경로, MYSTERY는 개별 열 가지 함수, 사망 직전 효과는 GameEngine.handleDeaths가 처리합니다.',
  '',
  '## 검증 한계',
  '',
  '전체 직접 사용 가능 카드에 대해 실제 CSV 값으로 명령을 실행하는 테스트를 포함합니다. 모든 카드×모든 카드의 조합 전수검사나 공식 원작 비교 실험을 완료한 것은 아닙니다. 이름·가격·확률·기적 공간 정책이 원작과 완전히 일치한다고 보증하지 않습니다.',
);
writeFileSync('docs/card-reference.md', lines.join('\n') + '\n');
console.log(`Documented ${cards.length} cards and ${summons.length} summon actions.`);
