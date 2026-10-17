# 카드별 규칙 명세

기준 CSV의 0 기반 ID를 그대로 보존합니다. 아래 한국어 이름은 새로 만든 명칭이며 원작 번역 데이터가 아닙니다. image는 모두 권리가 확인된 신규 placeholder입니다. 모든 일반 데이터364행과 소환체 행동42행을 기재합니다.

## 데이터 필드와 해석

`value/subValue`는 종류와 효과에 따라 의미가 달라집니다. WEAPON의 DFS는 subValue, PROTECTOR의 DFS는 value, MAGIC의 MP비용은 subValue입니다. INCREASE_ATK의 보조 수치는 무기/기적은 value, 방어구/도구는 subValue입니다. hitRate>0은 적 전체에 대상별 명중 판정합니다. weight0은 일반 드로우에서 제외합니다. price0을 무조건 거래 가능한 것으로 해석하지 않습니다.

대상 규칙 self는 자신, other-alive는 자신 외 생존자, any-alive는 생존자입니다. DEFENSE의 실제 대상은 현재 공격을 받는 플레이어입니다. 공격 상황 표시는 첫 카드 유효성의 안내이며, 추가 효과는 조합 후속 위치에서만 쓸 수 있습니다.

## 일반 카드 전체

| ID  | 신규 한국어 이름  | 종류   | 속성   | attackKind / attackExtra    | defenseKind / defenseExtra | value / subValue | 공격 / 방어 | MP  | 명중%     | 가격 | 가중치 | 대상        | 사용 상황      |
| --- | ----------------- | ------ | ------ | --------------------------- | -------------------------- | ---------------- | ----------- | --- | --------- | ---- | ------ | ----------- | -------------- |
| 0   | 숨 고르기         | 행동   | 무속성 | DO_NOTHING / —              | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 0    | 0      | self        | attack         |
| 1   | 정리의 시간       | 행동   | 무속성 | DISCARD / —                 | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 0    | 0      | self        | attack         |
| 2   | 균형의 저울       | 거래   | 무속성 | EXCHANGE / —                | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 20     | self        | attack         |
| 3   | 여행 상인의 제안  | 거래   | 무속성 | SELL / —                    | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 5    | 20     | other-alive | attack         |
| 4   | 별빛 경매장       | 거래   | 무속성 | BUY / —                     | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 5    | 20     | other-alive | attack         |
| 5   | 무속성 무기 005   | 무기   | 무속성 | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 1    | 3      | any-alive   | attack         |
| 6   | 무속성 무기 006   | 무기   | 무속성 | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 5    | 1      | any-alive   | attack         |
| 7   | 무속성 무기 007   | 무기   | 무속성 | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 8   | 무속성 무기 008   | 무기   | 무속성 | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 9   | 무속성 무기 009   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 2    | 1      | any-alive   | attack         |
| 10  | 무속성 무기 010   | 무기   | 무속성 | ATK / —                     | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 1    | 3      | any-alive   | attack         |
| 11  | 무속성 무기 011   | 무기   | 무속성 | ATK / —                     | DFS / —                    | 2 / 6            | 2 / 6       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack,defense |
| 12  | 무속성 무기 012   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 3    | 1      | any-alive   | attack         |
| 13  | 무속성 무기 013   | 무기   | 무속성 | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 2    | 3      | any-alive   | attack         |
| 14  | 무속성 무기 014   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 3    | 1      | any-alive   | attack         |
| 15  | 무속성 무기 015   | 무기   | 무속성 | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 2    | 3      | any-alive   | attack         |
| 16  | 무속성 무기 016   | 무기   | 무속성 | ATK / —                     | DFS / —                    | 4 / 2            | 4 / 2       | 0   | 확정 단일 | 3    | 1      | any-alive   | attack,defense |
| 17  | 무속성 무기 017   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 4    | 1      | any-alive   | attack         |
| 18  | 무속성 무기 018   | 무기   | 무속성 | ATK / —                     | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 3    | 3      | any-alive   | attack         |
| 19  | 무속성 무기 019   | 무기   | 무속성 | ATK / —                     | DFS / —                    | 5 / 7            | 5 / 7       | 0   | 확정 단일 | 3    | 1      | any-alive   | attack,defense |
| 20  | 무속성 무기 020   | 무기   | 무속성 | ATK / —                     | — / FLICK_WEAPON           | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 10   | 6      | any-alive   | attack,defense |
| 21  | 무속성 무기 021   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / FLICK_MAGIC            | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack,defense |
| 22  | 무속성 무기 022   | 무기   | 무속성 | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 3    | 8      | any-alive   | attack         |
| 23  | 무속성 무기 023   | 무기   | 무속성 | ATK / —                     | DFS / —                    | 6 / 3            | 6 / 3       | 0   | 확정 단일 | 3    | 1      | any-alive   | attack,defense |
| 24  | 무속성 무기 024   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 5    | 1      | any-alive   | attack         |
| 25  | 무속성 무기 025   | 무기   | 무속성 | ATK / —                     | — / —                      | 7 / 0            | 7 / 0       | 0   | 확정 단일 | 4    | 8      | any-alive   | attack         |
| 26  | 무속성 무기 026   | 무기   | 무속성 | ATK / ABSORB_HP             | — / —                      | 7 / 0            | 7 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 27  | 무속성 무기 027   | 무기   | 무속성 | ATK / —                     | — / BLOCK_MAGIC            | 7 / 0            | 7 / 0       | 0   | 확정 단일 | 15   | 1      | any-alive   | attack,defense |
| 28  | 무속성 무기 028   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / —                      | 7 / 0            | 7 / 0       | 0   | 확정 단일 | 5    | 1      | any-alive   | attack         |
| 29  | 무속성 무기 029   | 무기   | 무속성 | ATK / —                     | — / —                      | 8 / 0            | 8 / 0       | 0   | 확정 단일 | 4    | 7      | any-alive   | attack         |
| 30  | 무속성 무기 030   | 무기   | 무속성 | ATK / HELL                  | — / —                      | 8 / 0            | 8 / 0       | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 31  | 무속성 무기 031   | 무기   | 무속성 | ATK / —                     | DFS / —                    | 8 / 12           | 8 / 12      | 0   | 확정 단일 | 4    | 1      | any-alive   | attack,defense |
| 32  | 무속성 무기 032   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / —                      | 8 / 0            | 8 / 0       | 0   | 확정 단일 | 5    | 1      | any-alive   | attack         |
| 33  | 무속성 무기 033   | 무기   | 무속성 | ATK / —                     | — / —                      | 9 / 0            | 9 / 0       | 0   | 확정 단일 | 5    | 7      | any-alive   | attack         |
| 34  | 무속성 무기 034   | 무기   | 무속성 | ATK / COLD                  | — / —                      | 9 / 0            | 9 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 35  | 무속성 무기 035   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / —                      | 9 / 0            | 9 / 0       | 0   | 확정 단일 | 5    | 1      | any-alive   | attack         |
| 36  | 무속성 무기 036   | 무기   | 무속성 | ATK / —                     | — / —                      | 10 / 0           | 10 / 0      | 0   | 확정 단일 | 5    | 5      | any-alive   | attack         |
| 37  | 무속성 무기 037   | 무기   | 무속성 | ATK / ILLUSION              | — / —                      | 10 / 0           | 10 / 0      | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 38  | 무속성 무기 038   | 무기   | 무속성 | ATK / —                     | DFS / —                    | 10 / 10          | 10 / 10     | 0   | 확정 단일 | 15   | 1      | any-alive   | attack,defense |
| 39  | 무속성 무기 039   | 무기   | 무속성 | ATK / —                     | — / REFLECT_WEAPON         | 10 / 0           | 10 / 0      | 0   | 확정 단일 | 5    | 3      | any-alive   | attack,defense |
| 40  | 무속성 무기 040   | 무기   | 무속성 | ATK / —                     | — / REFLECT_MAGIC          | 10 / 0           | 10 / 0      | 0   | 확정 단일 | 15   | 1      | any-alive   | attack,defense |
| 41  | 무속성 무기 041   | 무기   | 무속성 | ATK / —                     | — / —                      | 11 / 0           | 11 / 0      | 0   | 확정 단일 | 6    | 4      | any-alive   | attack         |
| 42  | 무속성 무기 042   | 무기   | 무속성 | ATK / ABSORB_HP             | — / —                      | 11 / 0           | 11 / 0      | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 43  | 무속성 무기 043   | 무기   | 무속성 | ATK / DARK_CLOUD            | — / —                      | 11 / 0           | 11 / 0      | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 44  | 무속성 무기 044   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / —                      | 11 / 0           | 11 / 0      | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 45  | 무속성 무기 045   | 무기   | 무속성 | ATK / —                     | — / —                      | 12 / 0           | 12 / 0      | 0   | 확정 단일 | 6    | 4      | any-alive   | attack         |
| 46  | 무속성 무기 046   | 무기   | 무속성 | ATK / ILLUSION              | — / —                      | 12 / 0           | 12 / 0      | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 47  | 무속성 무기 047   | 무기   | 무속성 | ATK / MAGIC_FREE            | — / —                      | 12 / 0           | 12 / 0      | 0   | 확정 단일 | 20   | 1      | any-alive   | attack         |
| 48  | 무속성 무기 048   | 무기   | 무속성 | ATK / —                     | — / —                      | 13 / 0           | 13 / 0      | 0   | 확정 단일 | 7    | 3      | any-alive   | attack         |
| 49  | 무속성 무기 049   | 무기   | 무속성 | ATK / COLD                  | — / —                      | 13 / 0           | 13 / 0      | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 50  | 무속성 무기 050   | 무기   | 무속성 | ATK / —                     | DFS / —                    | 13 / 1           | 13 / 1      | 0   | 확정 단일 | 7    | 1      | any-alive   | attack,defense |
| 51  | 무속성 무기 051   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / —                      | 13 / 0           | 13 / 0      | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 52  | 무속성 무기 052   | 무기   | 무속성 | ATK / —                     | — / —                      | 14 / 0           | 14 / 0      | 0   | 확정 단일 | 7    | 3      | any-alive   | attack         |
| 53  | 무속성 무기 053   | 무기   | 무속성 | ATK / DAMAGE_TO_SELF        | — / —                      | 14 / 0           | 14 / 0      | 0   | 확정 단일 | 1    | 1      | any-alive   | attack         |
| 54  | 무속성 무기 054   | 무기   | 무속성 | ATK / —                     | — / BLOCK_MAGIC            | 15 / 0           | 15 / 0      | 0   | 확정 단일 | 10   | 1      | any-alive   | attack,defense |
| 55  | 무속성 무기 055   | 무기   | 무속성 | ATK / INCREASE_ATK          | — / BLOCK_MAGIC            | 15 / 0           | 15 / 0      | 0   | 확정 단일 | 10   | 1      | any-alive   | attack,defense |
| 56  | 무속성 무기 056   | 무기   | 무속성 | ATK / —                     | — / —                      | 30 / 0           | 30 / 0      | 0   | 확정 단일 | 30   | 1      | any-alive   | attack         |
| 57  | 마력의 수정검     | 무기   | 무속성 | ATK / MAGICAL               | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 58  | 화염 무기 058     | 무기   | 화염   | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 1    | 1      | any-alive   | attack         |
| 59  | 물결 무기 059     | 무기   | 물결   | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 1    | 1      | any-alive   | attack         |
| 60  | 숲 무기 060       | 무기   | 숲     | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 1    | 1      | any-alive   | attack         |
| 61  | 대지 무기 061     | 무기   | 대지   | ATK / COLD                  | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 62  | 빛 무기 062       | 무기   | 빛     | ATK / INCREASE_ATK          | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 63  | 어둠 무기 063     | 무기   | 어둠   | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 64  | 화염 무기 064     | 무기   | 화염   | ATK / —                     | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 2    | 1      | any-alive   | attack         |
| 65  | 화염 무기 065     | 무기   | 화염   | ATK / ADD_ATTRIBUTE         | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 66  | 물결 무기 066     | 무기   | 물결   | ATK / —                     | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 2    | 1      | any-alive   | attack         |
| 67  | 숲 무기 067       | 무기   | 숲     | ATK / —                     | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 2    | 1      | any-alive   | attack         |
| 68  | 숲 무기 068       | 무기   | 숲     | ATK / INCREASE_ATK          | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 3    | 1      | any-alive   | attack         |
| 69  | 대지 무기 069     | 무기   | 대지   | ATK / —                     | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 2    | 1      | any-alive   | attack         |
| 70  | 빛 무기 070       | 무기   | 빛     | ATK / GLORY                 | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 71  | 화염 무기 071     | 무기   | 화염   | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 3    | 1      | any-alive   | attack         |
| 72  | 물결 무기 072     | 무기   | 물결   | ATK / FOG                   | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 73  | 숲 무기 073       | 무기   | 숲     | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 3    | 1      | any-alive   | attack         |
| 74  | 숲 무기 074       | 무기   | 숲     | ATK / INCREASE_ATK          | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 4    | 1      | any-alive   | attack         |
| 75  | 빛 무기 075       | 무기   | 빛     | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 3    | 1      | any-alive   | attack         |
| 76  | 어둠 무기 076     | 무기   | 어둠   | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 77  | 화염 무기 077     | 무기   | 화염   | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 4    | 1      | any-alive   | attack         |
| 78  | 화염 무기 078     | 무기   | 화염   | ATK / —                     | DFS / —                    | 4 / 4            | 4 / 4       | 0   | 확정 단일 | 8    | 1      | any-alive   | attack,defense |
| 79  | 물결 무기 079     | 무기   | 물결   | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 4    | 1      | any-alive   | attack         |
| 80  | 숲 무기 080       | 무기   | 숲     | ATK / ILLUSION              | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 81  | 대지 무기 081     | 무기   | 대지   | ATK / INCREASE_ATK          | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 5    | 1      | any-alive   | attack         |
| 82  | 빛 무기 082       | 무기   | 빛     | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 4    | 1      | any-alive   | attack         |
| 83  | 어둠 무기 083     | 무기   | 어둠   | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 84  | 화염 무기 084     | 무기   | 화염   | ATK / INCREASE_ATK          | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 6    | 1      | any-alive   | attack         |
| 85  | 물결 무기 085     | 무기   | 물결   | ATK / ADD_ATTRIBUTE         | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 86  | 숲 무기 086       | 무기   | 숲     | ATK / —                     | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 5    | 1      | any-alive   | attack         |
| 87  | 빛 무기 087       | 무기   | 빛     | ATK / —                     | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 5    | 1      | any-alive   | attack         |
| 88  | 어둠 무기 088     | 무기   | 어둠   | ATK / —                     | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 89  | 어둠 무기 089     | 무기   | 어둠   | ATK / INCREASE_ATK          | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 90  | 화염 무기 090     | 무기   | 화염   | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 6    | 1      | any-alive   | attack         |
| 91  | 물결 무기 091     | 무기   | 물결   | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 6    | 1      | any-alive   | attack         |
| 92  | 대지 무기 092     | 무기   | 대지   | ATK / INCREASE_ATK          | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 7    | 1      | any-alive   | attack         |
| 93  | 어둠 무기 093     | 무기   | 어둠   | ATK / —                     | — / —                      | 7 / 0            | 7 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 94  | 화염 무기 094     | 무기   | 화염   | ATK / INCREASE_ATK          | — / —                      | 8 / 0            | 8 / 0       | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 95  | 물결 무기 095     | 무기   | 물결   | ATK / INCREASE_ATK          | — / —                      | 8 / 0            | 8 / 0       | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 96  | 빛 무기 096       | 무기   | 빛     | ATK / —                     | — / —                      | 9 / 0            | 9 / 0       | 0   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 97  | 어둠 무기 097     | 무기   | 어둠   | ATK / —                     | — / —                      | 10 / 0           | 10 / 0      | 0   | 확정 단일 | 20   | 1      | any-alive   | attack         |
| 98  | 대지 무기 098     | 무기   | 대지   | ATK / —                     | — / —                      | 13 / 0           | 13 / 0      | 0   | 확정 단일 | 25   | 1      | any-alive   | attack         |
| 99  | 운명의 추         | 무기   | 빛     | ATK / PESTLE                | — / —                      | 30 / 0           | 30 / 0      | 0   | 확정 단일 | 5    | 1      | any-alive   | attack         |
| 100 | 화염 무기 100     | 무기   | 화염   | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 75        | 2    | 1      | any-alive   | attack         |
| 101 | 어둠 무기 101     | 무기   | 어둠   | ATK / —                     | — / —                      | 2 / 0            | 2 / 0       | 0   | 50        | 8    | 1      | any-alive   | attack         |
| 102 | 물결 무기 102     | 무기   | 물결   | ATK / FOG                   | — / —                      | 3 / 0            | 3 / 0       | 0   | 50        | 8    | 1      | any-alive   | attack         |
| 103 | 숲 무기 103       | 무기   | 숲     | ATK / ABSORB_HP             | — / —                      | 3 / 0            | 3 / 0       | 0   | 75        | 10   | 1      | any-alive   | attack         |
| 104 | 빛 무기 104       | 무기   | 빛     | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 25        | 3    | 1      | any-alive   | attack         |
| 105 | 화염 무기 105     | 무기   | 화염   | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 75        | 6    | 1      | any-alive   | attack         |
| 106 | 물결 무기 106     | 무기   | 물결   | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 75        | 6    | 1      | any-alive   | attack         |
| 107 | 숲 무기 107       | 무기   | 숲     | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 75        | 6    | 1      | any-alive   | attack         |
| 108 | 대지 무기 108     | 무기   | 대지   | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 75        | 6    | 1      | any-alive   | attack         |
| 109 | 물결 무기 109     | 무기   | 물결   | ATK / —                     | — / —                      | 5 / 0            | 5 / 0       | 0   | 50        | 5    | 1      | any-alive   | attack         |
| 110 | 대지 무기 110     | 무기   | 대지   | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 25        | 9    | 1      | any-alive   | attack         |
| 111 | 빛 무기 111       | 무기   | 빛     | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 75        | 10   | 1      | any-alive   | attack         |
| 112 | 화염 무기 112     | 무기   | 화염   | ATK / —                     | — / —                      | 7 / 0            | 7 / 0       | 0   | 75        | 10   | 1      | any-alive   | attack         |
| 113 | 숲 무기 113       | 무기   | 숲     | ATK / —                     | DFS / —                    | 8 / 6            | 8 / 6       | 0   | 75        | 15   | 1      | any-alive   | attack,defense |
| 114 | 물결 무기 114     | 무기   | 물결   | ATK / —                     | — / —                      | 9 / 0            | 9 / 0       | 0   | 50        | 9    | 1      | any-alive   | attack         |
| 115 | 화염 무기 115     | 무기   | 화염   | ATK / —                     | — / —                      | 10 / 0           | 10 / 0      | 0   | 50        | 15   | 1      | any-alive   | attack         |
| 116 | 대지 무기 116     | 무기   | 대지   | ATK / —                     | — / —                      | 20 / 0           | 20 / 0      | 0   | 25        | 15   | 1      | any-alive   | attack         |
| 117 | 황혼의 유언       | 무기   | 빛     | ATK / DYING_ATTACK          | — / —                      | 1 / 30           | 1 / 0       | 0   | 75        | 10   | 1      | any-alive   | attack,passive |
| 118 | 무속성 방어구 118 | 방어구 | 무속성 | — / —                       | DFS / —                    | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 1    | 1      | any-alive   | defense        |
| 119 | 무속성 방어구 119 | 방어구 | 무속성 | — / —                       | DFS / FLICK_MAGIC          | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 5    | 1      | any-alive   | defense        |
| 120 | 무속성 방어구 120 | 방어구 | 무속성 | — / —                       | DFS / —                    | 1 / 0            | 0 / 1       | 0   | 확정 단일 | 1    | 12     | any-alive   | defense        |
| 121 | 무속성 방어구 121 | 방어구 | 무속성 | — / —                       | DFS / FLICK_MAGIC          | 1 / 0            | 0 / 1       | 0   | 확정 단일 | 5    | 1      | any-alive   | defense        |
| 122 | 화염 방어구 122   | 방어구 | 화염   | — / —                       | DFS / —                    | 1 / 0            | 0 / 1       | 0   | 확정 단일 | 2    | 1      | any-alive   | defense        |
| 123 | 물결 방어구 123   | 방어구 | 물결   | — / —                       | DFS / —                    | 1 / 0            | 0 / 1       | 0   | 확정 단일 | 2    | 1      | any-alive   | defense        |
| 124 | 숲 방어구 124     | 방어구 | 숲     | — / —                       | DFS / —                    | 1 / 0            | 0 / 1       | 0   | 확정 단일 | 2    | 1      | any-alive   | defense        |
| 125 | 대지 방어구 125   | 방어구 | 대지   | — / —                       | DFS / —                    | 1 / 0            | 0 / 1       | 0   | 확정 단일 | 2    | 1      | any-alive   | defense        |
| 126 | 무속성 방어구 126 | 방어구 | 무속성 | — / —                       | DFS / —                    | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 2    | 11     | any-alive   | defense        |
| 127 | 무속성 방어구 127 | 방어구 | 무속성 | — / —                       | DFS / FLICK_MAGIC          | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 5    | 1      | any-alive   | defense        |
| 128 | 화염 방어구 128   | 방어구 | 화염   | — / —                       | DFS / —                    | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 3    | 1      | any-alive   | defense        |
| 129 | 물결 방어구 129   | 방어구 | 물결   | — / —                       | DFS / —                    | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 3    | 1      | any-alive   | defense        |
| 130 | 숲 방어구 130     | 방어구 | 숲     | — / —                       | DFS / —                    | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 3    | 1      | any-alive   | defense        |
| 131 | 대지 방어구 131   | 방어구 | 대지   | — / —                       | DFS / —                    | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 3    | 1      | any-alive   | defense        |
| 132 | 무속성 방어구 132 | 방어구 | 무속성 | — / —                       | DFS / —                    | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 3    | 10     | any-alive   | defense        |
| 133 | 무속성 방어구 133 | 방어구 | 무속성 | — / INCREASE_ATK            | DFS / —                    | 3 / 5            | 5 / 3       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 134 | 무속성 방어구 134 | 방어구 | 무속성 | — / —                       | DFS / FLICK_MAGIC          | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 5    | 1      | any-alive   | defense        |
| 135 | 화염 방어구 135   | 방어구 | 화염   | — / —                       | DFS / —                    | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 4    | 1      | any-alive   | defense        |
| 136 | 물결 방어구 136   | 방어구 | 물결   | — / —                       | DFS / —                    | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 4    | 1      | any-alive   | defense        |
| 137 | 숲 방어구 137     | 방어구 | 숲     | — / —                       | DFS / —                    | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 4    | 1      | any-alive   | defense        |
| 138 | 대지 방어구 138   | 방어구 | 대지   | — / —                       | DFS / —                    | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 4    | 1      | any-alive   | defense        |
| 139 | 무속성 방어구 139 | 방어구 | 무속성 | — / —                       | DFS / —                    | 4 / 0            | 0 / 4       | 0   | 확정 단일 | 4    | 9      | any-alive   | defense        |
| 140 | 무속성 방어구 140 | 방어구 | 무속성 | — / —                       | DFS / FLICK_MAGIC          | 4 / 0            | 0 / 4       | 0   | 확정 단일 | 5    | 1      | any-alive   | defense        |
| 141 | 화염 방어구 141   | 방어구 | 화염   | — / —                       | DFS / —                    | 4 / 0            | 0 / 4       | 0   | 확정 단일 | 5    | 1      | any-alive   | defense        |
| 142 | 물결 방어구 142   | 방어구 | 물결   | — / —                       | DFS / —                    | 4 / 0            | 0 / 4       | 0   | 확정 단일 | 5    | 1      | any-alive   | defense        |
| 143 | 숲 방어구 143     | 방어구 | 숲     | — / —                       | DFS / —                    | 4 / 0            | 0 / 4       | 0   | 확정 단일 | 5    | 1      | any-alive   | defense        |
| 144 | 대지 방어구 144   | 방어구 | 대지   | — / —                       | DFS / —                    | 4 / 0            | 0 / 4       | 0   | 확정 단일 | 5    | 1      | any-alive   | defense        |
| 145 | 무속성 방어구 145 | 방어구 | 무속성 | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 5    | 8      | any-alive   | defense        |
| 146 | 무속성 방어구 146 | 방어구 | 무속성 | — / INCREASE_ATK            | DFS / —                    | 5 / 10           | 10 / 5      | 0   | 확정 단일 | 15   | 1      | any-alive   | defense        |
| 147 | 화염 방어구 147   | 방어구 | 화염   | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 6    | 1      | any-alive   | defense        |
| 148 | 물결 방어구 148   | 방어구 | 물결   | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 6    | 1      | any-alive   | defense        |
| 149 | 숲 방어구 149     | 방어구 | 숲     | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 6    | 1      | any-alive   | defense        |
| 150 | 대지 방어구 150   | 방어구 | 대지   | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 6    | 1      | any-alive   | defense        |
| 151 | 무속성 방어구 151 | 방어구 | 무속성 | — / —                       | DFS / —                    | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 6    | 7      | any-alive   | defense        |
| 152 | 무속성 방어구 152 | 방어구 | 무속성 | — / —                       | DFS / BLOCK_MAGIC          | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 153 | 무속성 방어구 153 | 방어구 | 무속성 | — / MAGIC_FREE              | DFS / —                    | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 20   | 1      | any-alive   | defense        |
| 154 | 화염 방어구 154   | 방어구 | 화염   | — / —                       | DFS / —                    | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 8    | 1      | any-alive   | defense        |
| 155 | 물결 방어구 155   | 방어구 | 물결   | — / —                       | DFS / —                    | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 8    | 1      | any-alive   | defense        |
| 156 | 숲 방어구 156     | 방어구 | 숲     | — / —                       | DFS / —                    | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 8    | 1      | any-alive   | defense        |
| 157 | 대지 방어구 157   | 방어구 | 대지   | — / —                       | DFS / —                    | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 8    | 1      | any-alive   | defense        |
| 158 | 빛 방어구 158     | 방어구 | 빛     | — / —                       | DFS / —                    | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 15   | 1      | any-alive   | defense        |
| 159 | 무속성 방어구 159 | 방어구 | 무속성 | — / —                       | DFS / —                    | 7 / 0            | 0 / 7       | 0   | 확정 단일 | 7    | 6      | any-alive   | defense        |
| 160 | 무속성 방어구 160 | 방어구 | 무속성 | — / INCREASE_ATK            | DFS / —                    | 7 / 10           | 10 / 7      | 0   | 확정 단일 | 15   | 1      | any-alive   | defense        |
| 161 | 화염 방어구 161   | 방어구 | 화염   | — / —                       | DFS / —                    | 7 / 0            | 0 / 7       | 0   | 확정 단일 | 9    | 1      | any-alive   | defense        |
| 162 | 물결 방어구 162   | 방어구 | 물결   | — / —                       | DFS / —                    | 7 / 0            | 0 / 7       | 0   | 확정 단일 | 9    | 1      | any-alive   | defense        |
| 163 | 대지 방어구 163   | 방어구 | 대지   | — / —                       | DFS / —                    | 7 / 0            | 0 / 7       | 0   | 확정 단일 | 9    | 1      | any-alive   | defense        |
| 164 | 무속성 방어구 164 | 방어구 | 무속성 | — / —                       | DFS / —                    | 8 / 0            | 0 / 8       | 0   | 확정 단일 | 8    | 5      | any-alive   | defense        |
| 165 | 무속성 방어구 165 | 방어구 | 무속성 | — / —                       | DFS / BLOCK_MAGIC          | 8 / 0            | 0 / 8       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 166 | 화염 방어구 166   | 방어구 | 화염   | — / —                       | DFS / —                    | 8 / 0            | 0 / 8       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 167 | 물결 방어구 167   | 방어구 | 물결   | — / —                       | DFS / —                    | 8 / 0            | 0 / 8       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 168 | 숲 방어구 168     | 방어구 | 숲     | — / —                       | DFS / —                    | 8 / 0            | 0 / 8       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 169 | 무속성 방어구 169 | 방어구 | 무속성 | — / —                       | DFS / —                    | 9 / 0            | 0 / 9       | 0   | 확정 단일 | 9    | 4      | any-alive   | defense        |
| 170 | 무속성 방어구 170 | 방어구 | 무속성 | — / INCREASE_ATK            | DFS / —                    | 9 / 15           | 15 / 9      | 0   | 확정 단일 | 20   | 1      | any-alive   | defense        |
| 171 | 무속성 방어구 171 | 방어구 | 무속성 | — / —                       | DFS / REFLECT_MAGIC        | 9 / 0            | 0 / 9       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 172 | 무속성 방어구 172 | 방어구 | 무속성 | — / MAGIC_FREE              | DFS / —                    | 9 / 0            | 0 / 9       | 0   | 확정 단일 | 20   | 1      | any-alive   | defense        |
| 173 | 무속성 방어구 173 | 방어구 | 무속성 | — / —                       | DFS / —                    | 10 / 0           | 0 / 10      | 0   | 확정 단일 | 10   | 3      | any-alive   | defense        |
| 174 | 무속성 방어구 174 | 방어구 | 무속성 | — / —                       | DFS / REFLECT_MAGIC        | 10 / 0           | 0 / 10      | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 175 | 화염 방어구 175   | 방어구 | 화염   | — / —                       | DFS / FEVER                | 10 / 0           | 0 / 10      | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 176 | 빛 방어구 176     | 방어구 | 빛     | — / —                       | DFS / —                    | 10 / 0           | 0 / 10      | 0   | 확정 단일 | 15   | 1      | any-alive   | defense        |
| 177 | 무속성 방어구 177 | 방어구 | 무속성 | — / —                       | DFS / —                    | 11 / 0           | 0 / 11      | 0   | 확정 단일 | 10   | 2      | any-alive   | defense        |
| 178 | 무속성 방어구 178 | 방어구 | 무속성 | — / —                       | DFS / REFLECT_MAGIC        | 11 / 0           | 0 / 11      | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 179 | 무속성 방어구 179 | 방어구 | 무속성 | — / —                       | DFS / —                    | 12 / 0           | 0 / 12      | 0   | 확정 단일 | 10   | 2      | any-alive   | defense        |
| 180 | 무속성 방어구 180 | 방어구 | 무속성 | — / MAGIC_FREE              | DFS / —                    | 12 / 0           | 0 / 12      | 0   | 확정 단일 | 20   | 1      | any-alive   | defense        |
| 181 | 화염 방어구 181   | 방어구 | 화염   | — / —                       | DFS / —                    | 12 / 0           | 0 / 12      | 0   | 확정 단일 | 15   | 1      | any-alive   | defense        |
| 182 | 무속성 방어구 182 | 방어구 | 무속성 | — / —                       | DFS / BLOCK_MAGIC          | 13 / 0           | 0 / 13      | 0   | 확정 단일 | 15   | 1      | any-alive   | defense        |
| 183 | 무속성 방어구 183 | 방어구 | 무속성 | — / —                       | DFS / BLOCK_MAGIC          | 14 / 0           | 0 / 14      | 0   | 확정 단일 | 15   | 1      | any-alive   | defense        |
| 184 | 숲 방어구 184     | 방어구 | 숲     | — / —                       | DFS / ILLUSION             | 14 / 0           | 0 / 14      | 0   | 확정 단일 | 15   | 1      | any-alive   | defense        |
| 185 | 무속성 방어구 185 | 방어구 | 무속성 | — / —                       | DFS / BLOCK_MAGIC          | 15 / 0           | 0 / 15      | 0   | 확정 단일 | 15   | 1      | any-alive   | defense        |
| 186 | 무속성 방어구 186 | 방어구 | 무속성 | — / —                       | DFS / —                    | 30 / 0           | 0 / 30      | 0   | 확정 단일 | 30   | 1      | any-alive   | defense        |
| 187 | 화염 방어구 187   | 방어구 | 화염   | ATK / —                     | COUNTER / —                | 0 / 0            | 0 / 0       | 0   | 75        | 10   | 1      | any-alive   | defense        |
| 188 | 물결 방어구 188   | 방어구 | 물결   | ADD_HARM / FOG              | COUNTER / —                | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 189 | 숲 방어구 189     | 방어구 | 숲     | ADD_HARM / ILLUSION         | COUNTER / —                | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 190 | 대지 방어구 190   | 방어구 | 대지   | ATK / —                     | COUNTER / —                | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 191 | 빛 방어구 191     | 방어구 | 빛     | ADD_HARM / GLORY            | COUNTER / —                | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 192 | 어둠 방어구 192   | 방어구 | 어둠   | ADD_HARM / DARK_CLOUD       | COUNTER / —                | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 193 | 무속성 방어구 193 | 방어구 | 무속성 | INCREASE_MP / —             | COUNTER / —                | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 194 | 무속성 방어구 194 | 방어구 | 무속성 | ABSORB_YEN / —              | COUNTER / —                | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 195 | 정화의 깃         | 방어구 | 무속성 | — / —                       | — / REMOVE_ATTRIBUTE       | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 15   | 3      | any-alive   | defense        |
| 196 | 거울의 파편       | 방어구 | 무속성 | — / —                       | — / REFLECT_ANY            | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | defense        |
| 197 | 화염 기적 197     | 기적   | 화염   | ATK / INCREASE_ATK          | — / —                      | 2 / 2            | 2 / 0       | 2   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 198 | 물결 기적 198     | 기적   | 물결   | ATK / —                     | — / —                      | 4 / 2            | 4 / 0       | 2   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 199 | 숲 기적 199       | 기적   | 숲     | ATK / —                     | — / —                      | 6 / 3            | 6 / 0       | 3   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 200 | 빛 기적 200       | 기적   | 빛     | ATK / GLORY                 | — / —                      | 1 / 3            | 1 / 0       | 3   | 25        | 10   | 1      | any-alive   | attack         |
| 201 | 물결 기적 201     | 기적   | 물결   | ADD_HARM / FOG              | — / —                      | 0 / 3            | 0 / 0       | 3   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 202 | 무속성 기적 202   | 기적   | 무속성 | REMOVE_LOWER_HARMS / —      | — / —                      | 0 / 3            | 0 / 0       | 3   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 203 | 대지 기적 203     | 기적   | 대지   | ATK / —                     | — / —                      | 8 / 4            | 8 / 0       | 4   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 204 | 화염 기적 204     | 기적   | 화염   | ATK / —                     | — / —                      | 5 / 4            | 5 / 0       | 4   | 75        | 10   | 1      | any-alive   | attack         |
| 205 | 빛 기적 205       | 기적   | 빛     | ATK / —                     | — / —                      | 10 / 4           | 10 / 0      | 4   | 25        | 10   | 1      | any-alive   | attack         |
| 206 | 화염 기적 206     | 기적   | 화염   | ATK / —                     | — / —                      | 10 / 5           | 10 / 0      | 5   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 207 | 어둠 기적 207     | 기적   | 어둠   | ATK / —                     | — / —                      | 5 / 5            | 5 / 0       | 5   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 208 | 어둠 기적 208     | 기적   | 어둠   | ADD_HARM / DARK_CLOUD       | — / —                      | 0 / 5            | 0 / 0       | 5   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 209 | 무속성 기적 209   | 기적   | 무속성 | — / WIDE_ATK                | — / —                      | 0 / 5            | 0 / 0       | 5   | 100       | 10   | 1      | any-alive   | 후속 조합      |
| 210 | 무속성 기적 210   | 기적   | 무속성 | — / —                       | — / FLICK_MAGIC            | 0 / 5            | 0 / 0       | 5   | 확정 단일 | 15   | 1      | any-alive   | defense        |
| 211 | 무속성 기적 211   | 기적   | 무속성 | REMOVE_ALL_HARMS / —        | — / —                      | 0 / 5            | 0 / 0       | 5   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 212 | 무속성 기적 212   | 기적   | 무속성 | ADD_HARM / COLD             | — / —                      | 0 / 6            | 0 / 0       | 6   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 213 | 숲 기적 213       | 기적   | 숲     | ADD_HARM / ILLUSION         | — / —                      | 0 / 6            | 0 / 0       | 6   | 확정 단일 | 10   | 1      | any-alive   | attack         |
| 214 | 무속성 기적 214   | 기적   | 무속성 | — / DOUBLE_ATK              | — / —                      | 0 / 6            | 0 / 0       | 6   | 확정 단일 | 10   | 1      | any-alive   | 후속 조합      |
| 215 | 무속성 기적 215   | 기적   | 무속성 | — / —                       | — / BLOCK_WEAPON           | 0 / 6            | 0 / 0       | 6   | 확정 단일 | 15   | 1      | any-alive   | defense        |
| 216 | 무속성 기적 216   | 기적   | 무속성 | INCREASE_HP / —             | — / —                      | 10 / 6           | 0 / 0       | 6   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 217 | 빛 기적 217       | 기적   | 빛     | ATK / INCREASE_ATK          | — / —                      | 10 / 7           | 10 / 0      | 7   | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 218 | 물결 기적 218     | 기적   | 물결   | ATK / —                     | — / —                      | 9 / 7            | 9 / 0       | 7   | 75        | 10   | 1      | any-alive   | attack         |
| 219 | 대지 기적 219     | 기적   | 대지   | ATK / —                     | — / —                      | 13 / 8           | 13 / 0      | 8   | 50        | 10   | 1      | any-alive   | attack         |
| 220 | 무속성 기적 220   | 기적   | 무속성 | INCREASE_YEN / —            | — / —                      | 15 / 8           | 0 / 0       | 8   | 확정 단일 | 25   | 1      | any-alive   | attack         |
| 221 | 빛 기적 221       | 기적   | 빛     | ATK / ABSORB_HP             | — / —                      | 10 / 10          | 10 / 0      | 10  | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 222 | 물결 기적 222     | 기적   | 물결   | ATK / —                     | — / —                      | 25 / 12          | 25 / 0      | 12  | 확정 단일 | 20   | 1      | any-alive   | attack         |
| 223 | 화염 기적 223     | 기적   | 화염   | ATK / —                     | — / —                      | 16 / 12          | 16 / 0      | 12  | 75        | 15   | 1      | any-alive   | attack         |
| 224 | 무속성 기적 224   | 기적   | 무속성 | ADD_HARM / HEAVEN           | — / —                      | 0 / 15           | 0 / 0       | 15  | 확정 단일 | 15   | 1      | any-alive   | attack         |
| 225 | 무속성 기적 225   | 기적   | 무속성 | SET_ASSISTANT / —           | — / —                      | 0 / 20           | 0 / 0       | 20  | 확정 단일 | 20   | 1      | any-alive   | attack         |
| 226 | 물결 기적 226     | 기적   | 물결   | ATK / —                     | — / —                      | 30 / 30          | 30 / 0      | 30  | 75        | 10   | 1      | any-alive   | attack         |
| 227 | 무속성 도구 227   | 도구   | 무속성 | INCREASE_HP / —             | — / —                      | 5 / 0            | 0 / 0       | 0   | 확정 단일 | 1    | 14     | any-alive   | attack         |
| 228 | 무속성 도구 228   | 도구   | 무속성 | INCREASE_HP / —             | — / —                      | 10 / 0           | 0 / 0       | 0   | 확정 단일 | 3    | 9      | any-alive   | attack         |
| 229 | 무속성 도구 229   | 도구   | 무속성 | INCREASE_HP / —             | — / —                      | 15 / 0           | 0 / 0       | 0   | 확정 단일 | 5    | 5      | any-alive   | attack         |
| 230 | 무속성 도구 230   | 도구   | 무속성 | INCREASE_HP / —             | — / —                      | 20 / 0           | 0 / 0       | 0   | 확정 단일 | 20   | 2      | any-alive   | attack         |
| 231 | 무속성 도구 231   | 도구   | 무속성 | INCREASE_MP / —             | — / —                      | 5 / 0            | 0 / 0       | 0   | 확정 단일 | 1    | 13     | any-alive   | attack         |
| 232 | 무속성 도구 232   | 도구   | 무속성 | INCREASE_MP / —             | — / —                      | 10 / 0           | 0 / 0       | 0   | 확정 단일 | 3    | 8      | any-alive   | attack         |
| 233 | 무속성 도구 233   | 도구   | 무속성 | INCREASE_MP / —             | — / —                      | 15 / 0           | 0 / 0       | 0   | 확정 단일 | 5    | 4      | any-alive   | attack         |
| 234 | 무속성 도구 234   | 도구   | 무속성 | INCREASE_MP / HEAVEN        | — / —                      | 20 / 0           | 0 / 0       | 0   | 확정 단일 | 20   | 1      | any-alive   | attack         |
| 235 | 무속성 도구 235   | 도구   | 무속성 | REMOVE_LOWER_HARMS / —      | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 5    | 12     | any-alive   | attack         |
| 236 | 무속성 도구 236   | 도구   | 무속성 | REMOVE_ALL_HARMS / —        | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 15   | 6      | any-alive   | attack         |
| 237 | 무속성 도구 237   | 도구   | 무속성 | INCREASE_OR_DECREASE_HP / — | — / —                      | 10 / 0           | 0 / 0       | 0   | 확정 단일 | 1    | 2      | any-alive   | attack         |
| 238 | 무속성 도구 238   | 도구   | 무속성 | — / INCREASE_ATK            | — / —                      | 0 / 10           | 10 / 0      | 0   | 확정 단일 | 15   | 2      | any-alive   | 후속 조합      |
| 239 | 무속성 도구 239   | 도구   | 무속성 | — / MAGIC_FREE              | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 5    | 2      | any-alive   | 후속 조합      |
| 240 | 무속성 도구 240   | 도구   | 무속성 | REMOVE_ITEMS / —            | — / —                      | 1 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 3      | any-alive   | attack         |
| 241 | 무속성 도구 241   | 도구   | 무속성 | REMOVE_ABILITIES / —        | — / —                      | 1 / 0            | 0 / 0       | 0   | 확정 단일 | 10   | 3      | any-alive   | attack         |
| 242 | 무속성 도구 242   | 도구   | 무속성 | SET_ASSISTANT / —           | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 5    | 3      | any-alive   | attack         |
| 243 | 별의 실타래       | 도구   | 무속성 | MYSTERY / —                 | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 3    | 1      | self        | attack         |
| 244 | 새벽의 씨앗       | 도구   | 무속성 | — / REVIVE                  | — / —                      | 10 / 0           | 0 / 0       | 0   | 확정 단일 | 10   | 1      | any-alive   | passive        |
| 245 | 위험한 그릇       | 도구   | 무속성 | — / MORTAR                  | — / —                      | 0 / 0            | 0 / 0       | 0   | 확정 단일 | 0    | 1      | any-alive   | passive        |
| 246 | 무속성 이벤트 246 | 이벤트 | 무속성 | ATK / —                     | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 0    | 0      | any-alive   | attack         |
| 247 | 무속성 이벤트 247 | 이벤트 | 무속성 | ATK / —                     | — / —                      | 10 / 0           | 10 / 0      | 0   | 확정 단일 | 0    | 0      | any-alive   | attack         |
| 248 | 무속성 이벤트 248 | 이벤트 | 무속성 | ATK / —                     | — / —                      | 15 / 0           | 15 / 0      | 0   | 확정 단일 | 0    | 0      | any-alive   | attack         |
| 249 | 무속성 이벤트 249 | 이벤트 | 무속성 | REMOVE_ITEMS / —            | — / —                      | 1 / 0            | 0 / 0       | 0   | 확정 단일 | 0    | 0      | any-alive   | attack         |
| 250 | 무속성 이벤트 250 | 이벤트 | 무속성 | REMOVE_ABILITIES / —        | — / —                      | 1 / 0            | 0 / 0       | 0   | 확정 단일 | 0    | 0      | any-alive   | attack         |
| 251 | 무속성 이벤트 251 | 이벤트 | 무속성 | INCREASE_HP / —             | — / —                      | 20 / 0           | 0 / 0       | 0   | 확정 단일 | 0    | 0      | any-alive   | attack         |
| 252 | 무속성 이벤트 252 | 이벤트 | 무속성 | INCREASE_MP / —             | — / —                      | 20 / 0           | 0 / 0       | 0   | 확정 단일 | 0    | 0      | any-alive   | attack         |
| 253 | 무속성 이벤트 253 | 이벤트 | 무속성 | INCREASE_YEN / —            | — / —                      | 20 / 0           | 0 / 0       | 0   | 확정 단일 | 0    | 0      | any-alive   | attack         |
| 254 | 무속성 무기 254   | 무기   | 무속성 | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 1    | 0      | any-alive   | attack         |
| 255 | 무속성 무기 255   | 무기   | 무속성 | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 1    | 0      | any-alive   | attack         |
| 256 | 무속성 무기 256   | 무기   | 무속성 | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 1    | 0      | any-alive   | attack         |
| 257 | 무속성 무기 257   | 무기   | 무속성 | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 1    | 0      | any-alive   | attack         |
| 258 | 무속성 무기 258   | 무기   | 무속성 | ATK / —                     | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 1    | 0      | any-alive   | attack         |
| 259 | 무속성 무기 259   | 무기   | 무속성 | ATK / —                     | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 1    | 0      | any-alive   | attack         |
| 260 | 무속성 무기 260   | 무기   | 무속성 | ATK / —                     | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 1    | 0      | any-alive   | attack         |
| 261 | 무속성 무기 261   | 무기   | 무속성 | ATK / —                     | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 1    | 0      | any-alive   | attack         |
| 262 | 무속성 무기 262   | 무기   | 무속성 | ATK / —                     | — / —                      | 2 / 0            | 2 / 0       | 0   | 확정 단일 | 1    | 0      | any-alive   | attack         |
| 263 | 무속성 무기 263   | 무기   | 무속성 | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 264 | 무속성 무기 264   | 무기   | 무속성 | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 265 | 무속성 무기 265   | 무기   | 무속성 | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 266 | 무속성 무기 266   | 무기   | 무속성 | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 267 | 무속성 무기 267   | 무기   | 무속성 | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 268 | 무속성 무기 268   | 무기   | 무속성 | ATK / —                     | — / —                      | 3 / 0            | 3 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 269 | 무속성 무기 269   | 무기   | 무속성 | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 270 | 무속성 무기 270   | 무기   | 무속성 | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 271 | 무속성 무기 271   | 무기   | 무속성 | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 272 | 무속성 무기 272   | 무기   | 무속성 | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 273 | 무속성 무기 273   | 무기   | 무속성 | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 274 | 무속성 무기 274   | 무기   | 무속성 | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 275 | 무속성 무기 275   | 무기   | 무속성 | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 276 | 무속성 무기 276   | 무기   | 무속성 | ATK / —                     | — / —                      | 4 / 0            | 4 / 0       | 0   | 확정 단일 | 2    | 0      | any-alive   | attack         |
| 277 | 무속성 무기 277   | 무기   | 무속성 | ATK / —                     | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 278 | 무속성 무기 278   | 무기   | 무속성 | ATK / —                     | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 279 | 무속성 무기 279   | 무기   | 무속성 | ATK / —                     | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 280 | 무속성 무기 280   | 무기   | 무속성 | ATK / —                     | — / —                      | 5 / 0            | 5 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 281 | 무속성 무기 281   | 무기   | 무속성 | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 282 | 무속성 무기 282   | 무기   | 무속성 | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 283 | 무속성 무기 283   | 무기   | 무속성 | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 284 | 무속성 무기 284   | 무기   | 무속성 | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 285 | 무속성 무기 285   | 무기   | 무속성 | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 286 | 무속성 무기 286   | 무기   | 무속성 | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 287 | 무속성 무기 287   | 무기   | 무속성 | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 288 | 무속성 무기 288   | 무기   | 무속성 | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 289 | 무속성 무기 289   | 무기   | 무속성 | ATK / —                     | — / —                      | 6 / 0            | 6 / 0       | 0   | 확정 단일 | 3    | 0      | any-alive   | attack         |
| 290 | 무속성 무기 290   | 무기   | 무속성 | ATK / —                     | — / —                      | 7 / 0            | 7 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 291 | 무속성 무기 291   | 무기   | 무속성 | ATK / —                     | — / —                      | 7 / 0            | 7 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 292 | 무속성 무기 292   | 무기   | 무속성 | ATK / —                     | — / —                      | 7 / 0            | 7 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 293 | 무속성 무기 293   | 무기   | 무속성 | ATK / —                     | — / —                      | 7 / 0            | 7 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 294 | 무속성 무기 294   | 무기   | 무속성 | ATK / —                     | — / —                      | 7 / 0            | 7 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 295 | 무속성 무기 295   | 무기   | 무속성 | ATK / —                     | — / —                      | 7 / 0            | 7 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 296 | 무속성 무기 296   | 무기   | 무속성 | ATK / —                     | — / —                      | 8 / 0            | 8 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 297 | 무속성 무기 297   | 무기   | 무속성 | ATK / —                     | — / —                      | 8 / 0            | 8 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 298 | 무속성 무기 298   | 무기   | 무속성 | ATK / —                     | — / —                      | 8 / 0            | 8 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 299 | 무속성 무기 299   | 무기   | 무속성 | ATK / —                     | — / —                      | 8 / 0            | 8 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 300 | 무속성 무기 300   | 무기   | 무속성 | ATK / —                     | — / —                      | 8 / 0            | 8 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 301 | 무속성 무기 301   | 무기   | 무속성 | ATK / —                     | — / —                      | 8 / 0            | 8 / 0       | 0   | 확정 단일 | 4    | 0      | any-alive   | attack         |
| 302 | 무속성 무기 302   | 무기   | 무속성 | ATK / —                     | — / —                      | 9 / 0            | 9 / 0       | 0   | 확정 단일 | 5    | 0      | any-alive   | attack         |
| 303 | 무속성 무기 303   | 무기   | 무속성 | ATK / —                     | — / —                      | 9 / 0            | 9 / 0       | 0   | 확정 단일 | 5    | 0      | any-alive   | attack         |
| 304 | 무속성 무기 304   | 무기   | 무속성 | ATK / —                     | — / —                      | 9 / 0            | 9 / 0       | 0   | 확정 단일 | 5    | 0      | any-alive   | attack         |
| 305 | 무속성 무기 305   | 무기   | 무속성 | ATK / —                     | — / —                      | 9 / 0            | 9 / 0       | 0   | 확정 단일 | 5    | 0      | any-alive   | attack         |
| 306 | 무속성 무기 306   | 무기   | 무속성 | ATK / —                     | — / —                      | 9 / 0            | 9 / 0       | 0   | 확정 단일 | 5    | 0      | any-alive   | attack         |
| 307 | 무속성 무기 307   | 무기   | 무속성 | ATK / —                     | — / —                      | 10 / 0           | 10 / 0      | 0   | 확정 단일 | 5    | 0      | any-alive   | attack         |
| 308 | 무속성 무기 308   | 무기   | 무속성 | ATK / —                     | — / —                      | 11 / 0           | 11 / 0      | 0   | 확정 단일 | 6    | 0      | any-alive   | attack         |
| 309 | 무속성 무기 309   | 무기   | 무속성 | ATK / —                     | — / —                      | 11 / 0           | 11 / 0      | 0   | 확정 단일 | 6    | 0      | any-alive   | attack         |
| 310 | 무속성 무기 310   | 무기   | 무속성 | ATK / —                     | — / —                      | 12 / 0           | 12 / 0      | 0   | 확정 단일 | 6    | 0      | any-alive   | attack         |
| 311 | 무속성 무기 311   | 무기   | 무속성 | ATK / —                     | — / —                      | 12 / 0           | 12 / 0      | 0   | 확정 단일 | 6    | 0      | any-alive   | attack         |
| 312 | 무속성 무기 312   | 무기   | 무속성 | ATK / —                     | — / BLOCK_MAGIC            | 15 / 0           | 15 / 0      | 0   | 확정 단일 | 10   | 0      | any-alive   | attack,defense |
| 313 | 무속성 무기 313   | 무기   | 무속성 | ATK / —                     | — / BLOCK_MAGIC            | 15 / 0           | 15 / 0      | 0   | 확정 단일 | 10   | 0      | any-alive   | attack,defense |
| 314 | 숲 무기 314       | 무기   | 숲     | ATK / —                     | — / —                      | 1 / 0            | 1 / 0       | 0   | 확정 단일 | 1    | 0      | any-alive   | attack         |
| 315 | 무속성 방어구 315 | 방어구 | 무속성 | — / —                       | DFS / —                    | 1 / 0            | 0 / 1       | 0   | 확정 단일 | 1    | 0      | any-alive   | defense        |
| 316 | 무속성 방어구 316 | 방어구 | 무속성 | — / —                       | DFS / —                    | 1 / 0            | 0 / 1       | 0   | 확정 단일 | 1    | 0      | any-alive   | defense        |
| 317 | 무속성 방어구 317 | 방어구 | 무속성 | — / —                       | DFS / —                    | 1 / 0            | 0 / 1       | 0   | 확정 단일 | 1    | 0      | any-alive   | defense        |
| 318 | 무속성 방어구 318 | 방어구 | 무속성 | — / —                       | DFS / —                    | 1 / 0            | 0 / 1       | 0   | 확정 단일 | 1    | 0      | any-alive   | defense        |
| 319 | 무속성 방어구 319 | 방어구 | 무속성 | — / —                       | DFS / —                    | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 2    | 0      | any-alive   | defense        |
| 320 | 무속성 방어구 320 | 방어구 | 무속성 | — / —                       | DFS / —                    | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 2    | 0      | any-alive   | defense        |
| 321 | 무속성 방어구 321 | 방어구 | 무속성 | — / —                       | DFS / —                    | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 2    | 0      | any-alive   | defense        |
| 322 | 무속성 방어구 322 | 방어구 | 무속성 | — / —                       | DFS / —                    | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 2    | 0      | any-alive   | defense        |
| 323 | 무속성 방어구 323 | 방어구 | 무속성 | — / —                       | DFS / —                    | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 2    | 0      | any-alive   | defense        |
| 324 | 물결 방어구 324   | 방어구 | 물결   | — / —                       | DFS / —                    | 2 / 0            | 0 / 2       | 0   | 확정 단일 | 3    | 0      | any-alive   | defense        |
| 325 | 무속성 방어구 325 | 방어구 | 무속성 | — / —                       | DFS / —                    | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 3    | 0      | any-alive   | defense        |
| 326 | 무속성 방어구 326 | 방어구 | 무속성 | — / —                       | DFS / —                    | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 3    | 0      | any-alive   | defense        |
| 327 | 무속성 방어구 327 | 방어구 | 무속성 | — / —                       | DFS / —                    | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 3    | 0      | any-alive   | defense        |
| 328 | 무속성 방어구 328 | 방어구 | 무속성 | — / —                       | DFS / —                    | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 3    | 0      | any-alive   | defense        |
| 329 | 무속성 방어구 329 | 방어구 | 무속성 | — / —                       | DFS / —                    | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 3    | 0      | any-alive   | defense        |
| 330 | 무속성 방어구 330 | 방어구 | 무속성 | — / —                       | DFS / —                    | 3 / 0            | 0 / 3       | 0   | 확정 단일 | 3    | 0      | any-alive   | defense        |
| 331 | 무속성 방어구 331 | 방어구 | 무속성 | — / —                       | DFS / —                    | 4 / 0            | 0 / 4       | 0   | 확정 단일 | 4    | 0      | any-alive   | defense        |
| 332 | 물결 방어구 332   | 방어구 | 물결   | — / —                       | DFS / —                    | 4 / 0            | 0 / 4       | 0   | 확정 단일 | 5    | 0      | any-alive   | defense        |
| 333 | 물결 방어구 333   | 방어구 | 물결   | — / —                       | DFS / —                    | 4 / 0            | 0 / 4       | 0   | 확정 단일 | 5    | 0      | any-alive   | defense        |
| 334 | 무속성 방어구 334 | 방어구 | 무속성 | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 5    | 0      | any-alive   | defense        |
| 335 | 무속성 방어구 335 | 방어구 | 무속성 | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 5    | 0      | any-alive   | defense        |
| 336 | 무속성 방어구 336 | 방어구 | 무속성 | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 5    | 0      | any-alive   | defense        |
| 337 | 무속성 방어구 337 | 방어구 | 무속성 | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 5    | 0      | any-alive   | defense        |
| 338 | 무속성 방어구 338 | 방어구 | 무속성 | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 5    | 0      | any-alive   | defense        |
| 339 | 무속성 방어구 339 | 방어구 | 무속성 | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 5    | 0      | any-alive   | defense        |
| 340 | 무속성 방어구 340 | 방어구 | 무속성 | — / —                       | DFS / —                    | 5 / 0            | 0 / 5       | 0   | 확정 단일 | 5    | 0      | any-alive   | defense        |
| 341 | 무속성 방어구 341 | 방어구 | 무속성 | — / —                       | DFS / —                    | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 6    | 0      | any-alive   | defense        |
| 342 | 무속성 방어구 342 | 방어구 | 무속성 | — / —                       | DFS / —                    | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 6    | 0      | any-alive   | defense        |
| 343 | 무속성 방어구 343 | 방어구 | 무속성 | — / —                       | DFS / —                    | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 6    | 0      | any-alive   | defense        |
| 344 | 무속성 방어구 344 | 방어구 | 무속성 | — / —                       | DFS / —                    | 6 / 0            | 0 / 6       | 0   | 확정 단일 | 6    | 0      | any-alive   | defense        |
| 345 | 무속성 방어구 345 | 방어구 | 무속성 | — / —                       | DFS / —                    | 7 / 0            | 0 / 7       | 0   | 확정 단일 | 7    | 0      | any-alive   | defense        |
| 346 | 무속성 방어구 346 | 방어구 | 무속성 | — / —                       | DFS / —                    | 7 / 0            | 0 / 7       | 0   | 확정 단일 | 7    | 0      | any-alive   | defense        |
| 347 | 무속성 방어구 347 | 방어구 | 무속성 | — / —                       | DFS / —                    | 7 / 0            | 0 / 7       | 0   | 확정 단일 | 7    | 0      | any-alive   | defense        |
| 348 | 무속성 방어구 348 | 방어구 | 무속성 | — / —                       | DFS / —                    | 7 / 0            | 0 / 7       | 0   | 확정 단일 | 7    | 0      | any-alive   | defense        |
| 349 | 무속성 방어구 349 | 방어구 | 무속성 | — / —                       | DFS / —                    | 7 / 0            | 0 / 7       | 0   | 확정 단일 | 7    | 0      | any-alive   | defense        |
| 350 | 무속성 방어구 350 | 방어구 | 무속성 | — / —                       | DFS / —                    | 8 / 0            | 0 / 8       | 0   | 확정 단일 | 8    | 0      | any-alive   | defense        |
| 351 | 무속성 방어구 351 | 방어구 | 무속성 | — / —                       | DFS / —                    | 8 / 0            | 0 / 8       | 0   | 확정 단일 | 8    | 0      | any-alive   | defense        |
| 352 | 무속성 방어구 352 | 방어구 | 무속성 | — / —                       | DFS / —                    | 8 / 0            | 0 / 8       | 0   | 확정 단일 | 8    | 0      | any-alive   | defense        |
| 353 | 무속성 방어구 353 | 방어구 | 무속성 | — / —                       | DFS / —                    | 9 / 0            | 0 / 9       | 0   | 확정 단일 | 9    | 0      | any-alive   | defense        |
| 354 | 무속성 방어구 354 | 방어구 | 무속성 | — / —                       | DFS / —                    | 9 / 0            | 0 / 9       | 0   | 확정 단일 | 9    | 0      | any-alive   | defense        |
| 355 | 무속성 방어구 355 | 방어구 | 무속성 | — / —                       | DFS / —                    | 9 / 0            | 0 / 9       | 0   | 확정 단일 | 9    | 0      | any-alive   | defense        |
| 356 | 무속성 방어구 356 | 방어구 | 무속성 | — / —                       | DFS / —                    | 9 / 0            | 0 / 9       | 0   | 확정 단일 | 9    | 0      | any-alive   | defense        |
| 357 | 무속성 방어구 357 | 방어구 | 무속성 | — / —                       | DFS / —                    | 10 / 0           | 0 / 10      | 0   | 확정 단일 | 10   | 0      | any-alive   | defense        |
| 358 | 무속성 방어구 358 | 방어구 | 무속성 | — / —                       | DFS / —                    | 11 / 0           | 0 / 11      | 0   | 확정 단일 | 10   | 0      | any-alive   | defense        |
| 359 | 무속성 방어구 359 | 방어구 | 무속성 | — / —                       | DFS / —                    | 11 / 0           | 0 / 11      | 0   | 확정 단일 | 10   | 0      | any-alive   | defense        |
| 360 | 무속성 방어구 360 | 방어구 | 무속성 | — / —                       | DFS / —                    | 11 / 0           | 0 / 11      | 0   | 확정 단일 | 10   | 0      | any-alive   | defense        |
| 361 | 무속성 방어구 361 | 방어구 | 무속성 | — / —                       | DFS / —                    | 12 / 0           | 0 / 12      | 0   | 확정 단일 | 10   | 0      | any-alive   | defense        |
| 362 | 무속성 방어구 362 | 방어구 | 무속성 | — / —                       | DFS / —                    | 12 / 0           | 0 / 12      | 0   | 확정 단일 | 10   | 0      | any-alive   | defense        |
| 363 | 무속성 방어구 363 | 방어구 | 무속성 | — / —                       | DFS / BLOCK_MAGIC          | 12 / 0           | 0 / 12      | 0   | 확정 단일 | 15   | 0      | any-alive   | defense        |

## 카드별 표시 설명

- **#0 숨 고르기**: 대기. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#1 정리의 시간**: 카드 버리기. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#2 균형의 저울**: HP·MP·소지금 총합을 보존하여 재분배. 자산: `/assets/card-placeholder.svg`.
- **#3 여행 상인의 제안**: 카드 한 장을 골라 상대에게 강제 판매. 자산: `/assets/card-placeholder.svg`.
- **#4 별빛 경매장**: 상대 카드 무작위 선택 후 구매 확인. 자산: `/assets/card-placeholder.svg`.
- **#5 무속성 무기 005**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#6 무속성 무기 006**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#7 무속성 무기 007**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#8 무속성 무기 008**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#9 무속성 무기 009**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#10 무속성 무기 010**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#11 무속성 무기 011**: 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#12 무속성 무기 012**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#13 무속성 무기 013**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#14 무속성 무기 014**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#15 무속성 무기 015**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#16 무속성 무기 016**: 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#17 무속성 무기 017**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#18 무속성 무기 018**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#19 무속성 무기 019**: 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#20 무속성 무기 020**: 공격 · 무기 무작위 튕겨내기. 자산: `/assets/card-placeholder.svg`.
- **#21 무속성 무기 021**: 공격 · 추가 공격 · 기적 무작위 튕겨내기. 자산: `/assets/card-placeholder.svg`.
- **#22 무속성 무기 022**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#23 무속성 무기 023**: 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#24 무속성 무기 024**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#25 무속성 무기 025**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#26 무속성 무기 026**: 공격 · 피해량만큼 HP 흡수. 자산: `/assets/card-placeholder.svg`.
- **#27 무속성 무기 027**: 공격 · 기적 완전 차단. 자산: `/assets/card-placeholder.svg`.
- **#28 무속성 무기 028**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#29 무속성 무기 029**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#30 무속성 무기 030**: 공격 · 지옥병. 자산: `/assets/card-placeholder.svg`.
- **#31 무속성 무기 031**: 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#32 무속성 무기 032**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#33 무속성 무기 033**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#34 무속성 무기 034**: 공격 · 감기. 자산: `/assets/card-placeholder.svg`.
- **#35 무속성 무기 035**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#36 무속성 무기 036**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#37 무속성 무기 037**: 공격 · 꿈. 자산: `/assets/card-placeholder.svg`.
- **#38 무속성 무기 038**: 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#39 무속성 무기 039**: 공격 · 무기 되돌리기. 자산: `/assets/card-placeholder.svg`.
- **#40 무속성 무기 040**: 공격 · 기적 되돌리기. 자산: `/assets/card-placeholder.svg`.
- **#41 무속성 무기 041**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#42 무속성 무기 042**: 공격 · 피해량만큼 HP 흡수. 자산: `/assets/card-placeholder.svg`.
- **#43 무속성 무기 043**: 공격 · 먹구름. 자산: `/assets/card-placeholder.svg`.
- **#44 무속성 무기 044**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#45 무속성 무기 045**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#46 무속성 무기 046**: 공격 · 꿈. 자산: `/assets/card-placeholder.svg`.
- **#47 무속성 무기 047**: 공격 · 바로 앞 기적의 MP 비용 면제. 자산: `/assets/card-placeholder.svg`.
- **#48 무속성 무기 048**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#49 무속성 무기 049**: 공격 · 감기. 자산: `/assets/card-placeholder.svg`.
- **#50 무속성 무기 050**: 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#51 무속성 무기 051**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#52 무속성 무기 052**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#53 무속성 무기 053**: 공격 · 같은 피해를 자신도 받음. 자산: `/assets/card-placeholder.svg`.
- **#54 무속성 무기 054**: 공격 · 기적 완전 차단. 자산: `/assets/card-placeholder.svg`.
- **#55 무속성 무기 055**: 공격 · 추가 공격 · 기적 완전 차단. 자산: `/assets/card-placeholder.svg`.
- **#56 무속성 무기 056**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#57 마력의 수정검**: 공격 · 남은 MP 전부를 공격력 두 배로 전환. 자산: `/assets/card-placeholder.svg`.
- **#58 화염 무기 058**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#59 물결 무기 059**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#60 숲 무기 060**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#61 대지 무기 061**: 공격 · 감기. 자산: `/assets/card-placeholder.svg`.
- **#62 빛 무기 062**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#63 어둠 무기 063**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#64 화염 무기 064**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#65 화염 무기 065**: 공격 · 속성 덮어쓰기. 자산: `/assets/card-placeholder.svg`.
- **#66 물결 무기 066**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#67 숲 무기 067**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#68 숲 무기 068**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#69 대지 무기 069**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#70 빛 무기 070**: 공격 · 섬광. 자산: `/assets/card-placeholder.svg`.
- **#71 화염 무기 071**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#72 물결 무기 072**: 공격 · 안개. 자산: `/assets/card-placeholder.svg`.
- **#73 숲 무기 073**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#74 숲 무기 074**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#75 빛 무기 075**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#76 어둠 무기 076**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#77 화염 무기 077**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#78 화염 무기 078**: 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#79 물결 무기 079**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#80 숲 무기 080**: 공격 · 꿈. 자산: `/assets/card-placeholder.svg`.
- **#81 대지 무기 081**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#82 빛 무기 082**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#83 어둠 무기 083**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#84 화염 무기 084**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#85 물결 무기 085**: 공격 · 속성 덮어쓰기. 자산: `/assets/card-placeholder.svg`.
- **#86 숲 무기 086**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#87 빛 무기 087**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#88 어둠 무기 088**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#89 어둠 무기 089**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#90 화염 무기 090**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#91 물결 무기 091**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#92 대지 무기 092**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#93 어둠 무기 093**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#94 화염 무기 094**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#95 물결 무기 095**: 공격 · 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#96 빛 무기 096**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#97 어둠 무기 097**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#98 대지 무기 098**: 공격. 자산: `/assets/card-placeholder.svg`.
- **#99 운명의 추**: 공격 · 위험한 그릇 소유자에게 999 피해 · 없으면 무작위 대상. 자산: `/assets/card-placeholder.svg`.
- **#100 화염 무기 100**: 공격 · 대상별 명중 75%. 자산: `/assets/card-placeholder.svg`.
- **#101 어둠 무기 101**: 공격 · 대상별 명중 50%. 자산: `/assets/card-placeholder.svg`.
- **#102 물결 무기 102**: 공격 · 안개 · 대상별 명중 50%. 자산: `/assets/card-placeholder.svg`.
- **#103 숲 무기 103**: 공격 · 피해량만큼 HP 흡수 · 대상별 명중 75%. 자산: `/assets/card-placeholder.svg`.
- **#104 빛 무기 104**: 공격 · 대상별 명중 25%. 자산: `/assets/card-placeholder.svg`.
- **#105 화염 무기 105**: 공격 · 대상별 명중 75%. 자산: `/assets/card-placeholder.svg`.
- **#106 물결 무기 106**: 공격 · 대상별 명중 75%. 자산: `/assets/card-placeholder.svg`.
- **#107 숲 무기 107**: 공격 · 대상별 명중 75%. 자산: `/assets/card-placeholder.svg`.
- **#108 대지 무기 108**: 공격 · 대상별 명중 75%. 자산: `/assets/card-placeholder.svg`.
- **#109 물결 무기 109**: 공격 · 대상별 명중 50%. 자산: `/assets/card-placeholder.svg`.
- **#110 대지 무기 110**: 공격 · 대상별 명중 25%. 자산: `/assets/card-placeholder.svg`.
- **#111 빛 무기 111**: 공격 · 대상별 명중 75%. 자산: `/assets/card-placeholder.svg`.
- **#112 화염 무기 112**: 공격 · 대상별 명중 75%. 자산: `/assets/card-placeholder.svg`.
- **#113 숲 무기 113**: 공격 · 방어 · 대상별 명중 75%. 자산: `/assets/card-placeholder.svg`.
- **#114 물결 무기 114**: 공격 · 대상별 명중 50%. 자산: `/assets/card-placeholder.svg`.
- **#115 화염 무기 115**: 공격 · 대상별 명중 50%. 자산: `/assets/card-placeholder.svg`.
- **#116 대지 무기 116**: 공격 · 대상별 명중 25%. 자산: `/assets/card-placeholder.svg`.
- **#117 황혼의 유언**: 공격 · 사망 시 빛 30 · 적 전체 75% · 대상별 명중 75%. 자산: `/assets/card-placeholder.svg`.
- **#118 무속성 방어구 118**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#119 무속성 방어구 119**: 방어 · 기적 무작위 튕겨내기. 자산: `/assets/card-placeholder.svg`.
- **#120 무속성 방어구 120**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#121 무속성 방어구 121**: 방어 · 기적 무작위 튕겨내기. 자산: `/assets/card-placeholder.svg`.
- **#122 화염 방어구 122**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#123 물결 방어구 123**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#124 숲 방어구 124**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#125 대지 방어구 125**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#126 무속성 방어구 126**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#127 무속성 방어구 127**: 방어 · 기적 무작위 튕겨내기. 자산: `/assets/card-placeholder.svg`.
- **#128 화염 방어구 128**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#129 물결 방어구 129**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#130 숲 방어구 130**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#131 대지 방어구 131**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#132 무속성 방어구 132**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#133 무속성 방어구 133**: 추가 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#134 무속성 방어구 134**: 방어 · 기적 무작위 튕겨내기. 자산: `/assets/card-placeholder.svg`.
- **#135 화염 방어구 135**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#136 물결 방어구 136**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#137 숲 방어구 137**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#138 대지 방어구 138**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#139 무속성 방어구 139**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#140 무속성 방어구 140**: 방어 · 기적 무작위 튕겨내기. 자산: `/assets/card-placeholder.svg`.
- **#141 화염 방어구 141**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#142 물결 방어구 142**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#143 숲 방어구 143**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#144 대지 방어구 144**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#145 무속성 방어구 145**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#146 무속성 방어구 146**: 추가 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#147 화염 방어구 147**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#148 물결 방어구 148**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#149 숲 방어구 149**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#150 대지 방어구 150**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#151 무속성 방어구 151**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#152 무속성 방어구 152**: 방어 · 기적 완전 차단. 자산: `/assets/card-placeholder.svg`.
- **#153 무속성 방어구 153**: 바로 앞 기적의 MP 비용 면제 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#154 화염 방어구 154**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#155 물결 방어구 155**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#156 숲 방어구 156**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#157 대지 방어구 157**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#158 빛 방어구 158**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#159 무속성 방어구 159**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#160 무속성 방어구 160**: 추가 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#161 화염 방어구 161**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#162 물결 방어구 162**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#163 대지 방어구 163**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#164 무속성 방어구 164**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#165 무속성 방어구 165**: 방어 · 기적 완전 차단. 자산: `/assets/card-placeholder.svg`.
- **#166 화염 방어구 166**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#167 물결 방어구 167**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#168 숲 방어구 168**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#169 무속성 방어구 169**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#170 무속성 방어구 170**: 추가 공격 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#171 무속성 방어구 171**: 방어 · 기적 되돌리기. 자산: `/assets/card-placeholder.svg`.
- **#172 무속성 방어구 172**: 바로 앞 기적의 MP 비용 면제 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#173 무속성 방어구 173**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#174 무속성 방어구 174**: 방어 · 기적 되돌리기. 자산: `/assets/card-placeholder.svg`.
- **#175 화염 방어구 175**: 방어 · 열병. 자산: `/assets/card-placeholder.svg`.
- **#176 빛 방어구 176**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#177 무속성 방어구 177**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#178 무속성 방어구 178**: 방어 · 기적 되돌리기. 자산: `/assets/card-placeholder.svg`.
- **#179 무속성 방어구 179**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#180 무속성 방어구 180**: 바로 앞 기적의 MP 비용 면제 · 방어. 자산: `/assets/card-placeholder.svg`.
- **#181 화염 방어구 181**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#182 무속성 방어구 182**: 방어 · 기적 완전 차단. 자산: `/assets/card-placeholder.svg`.
- **#183 무속성 방어구 183**: 방어 · 기적 완전 차단. 자산: `/assets/card-placeholder.svg`.
- **#184 숲 방어구 184**: 방어 · 꿈. 자산: `/assets/card-placeholder.svg`.
- **#185 무속성 방어구 185**: 방어 · 기적 완전 차단. 자산: `/assets/card-placeholder.svg`.
- **#186 무속성 방어구 186**: 방어. 자산: `/assets/card-placeholder.svg`.
- **#187 화염 방어구 187**: 공격 · 받은 피해를 기준으로 반격 · 대상별 명중 75%. 자산: `/assets/card-placeholder.svg`.
- **#188 물결 방어구 188**: ADD_HARM · 안개 · 받은 피해를 기준으로 반격. 자산: `/assets/card-placeholder.svg`.
- **#189 숲 방어구 189**: ADD_HARM · 꿈 · 받은 피해를 기준으로 반격. 자산: `/assets/card-placeholder.svg`.
- **#190 대지 방어구 190**: 공격 · 받은 피해를 기준으로 반격. 자산: `/assets/card-placeholder.svg`.
- **#191 빛 방어구 191**: ADD_HARM · 섬광 · 받은 피해를 기준으로 반격. 자산: `/assets/card-placeholder.svg`.
- **#192 어둠 방어구 192**: ADD_HARM · 먹구름 · 받은 피해를 기준으로 반격. 자산: `/assets/card-placeholder.svg`.
- **#193 무속성 방어구 193**: MP 회복 · 받은 피해를 기준으로 반격. 자산: `/assets/card-placeholder.svg`.
- **#194 무속성 방어구 194**: 소지금 흡수 · 부족분 MP→HP · 받은 피해를 기준으로 반격. 자산: `/assets/card-placeholder.svg`.
- **#195 정화의 깃**: 공격 속성 제거. 자산: `/assets/card-placeholder.svg`.
- **#196 거울의 파편**: 공격 되돌리기. 자산: `/assets/card-placeholder.svg`.
- **#197 화염 기적 197**: 공격 · 추가 공격 · MP 2, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#198 물결 기적 198**: 공격 · MP 2, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#199 숲 기적 199**: 공격 · MP 3, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#200 빛 기적 200**: 공격 · 섬광 · 대상별 명중 25% · MP 3, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#201 물결 기적 201**: ADD_HARM · 안개 · MP 3, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#202 무속성 기적 202**: 감기·열병·안개·섬광 해제 · MP 3, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#203 대지 기적 203**: 공격 · MP 4, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#204 화염 기적 204**: 공격 · 대상별 명중 75% · MP 4, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#205 빛 기적 205**: 공격 · 대상별 명중 25% · MP 4, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#206 화염 기적 206**: 공격 · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#207 어둠 기적 207**: 공격 · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#208 어둠 기적 208**: ADD_HARM · 먹구름 · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#209 무속성 기적 209**: 적 전체 공격 · 무속성 전환 · 대상별 명중 100% · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#210 무속성 기적 210**: 기적 무작위 튕겨내기 · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#211 무속성 기적 211**: 모든 재앙 해제 · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#212 무속성 기적 212**: ADD_HARM · 감기 · MP 6, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#213 숲 기적 213**: ADD_HARM · 꿈 · MP 6, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#214 무속성 기적 214**: 공격력 두 배 · MP 6, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#215 무속성 기적 215**: 무기 완전 차단 · MP 6, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#216 무속성 기적 216**: HP 회복 · MP 6, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#217 빛 기적 217**: 공격 · 추가 공격 · MP 7, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#218 물결 기적 218**: 공격 · 대상별 명중 75% · MP 7, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#219 대지 기적 219**: 공격 · 대상별 명중 50% · MP 8, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#220 무속성 기적 220**: 소지금 획득 · MP 8, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#221 빛 기적 221**: 공격 · 피해량만큼 HP 흡수 · MP 10, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#222 물결 기적 222**: 공격 · MP 12, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#223 화염 기적 223**: 공격 · 대상별 명중 75% · MP 12, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#224 무속성 기적 224**: ADD_HARM · 천국병 · MP 15, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#225 무속성 기적 225**: 무작위 수호자 소환 · HP 20 · MP 20, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#226 물결 기적 226**: 공격 · 대상별 명중 75% · MP 30, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/card-placeholder.svg`.
- **#227 무속성 도구 227**: HP 회복. 자산: `/assets/card-placeholder.svg`.
- **#228 무속성 도구 228**: HP 회복. 자산: `/assets/card-placeholder.svg`.
- **#229 무속성 도구 229**: HP 회복. 자산: `/assets/card-placeholder.svg`.
- **#230 무속성 도구 230**: HP 회복. 자산: `/assets/card-placeholder.svg`.
- **#231 무속성 도구 231**: MP 회복. 자산: `/assets/card-placeholder.svg`.
- **#232 무속성 도구 232**: MP 회복. 자산: `/assets/card-placeholder.svg`.
- **#233 무속성 도구 233**: MP 회복. 자산: `/assets/card-placeholder.svg`.
- **#234 무속성 도구 234**: MP 회복 · 천국병. 자산: `/assets/card-placeholder.svg`.
- **#235 무속성 도구 235**: 감기·열병·안개·섬광 해제. 자산: `/assets/card-placeholder.svg`.
- **#236 무속성 도구 236**: 모든 재앙 해제. 자산: `/assets/card-placeholder.svg`.
- **#237 무속성 도구 237**: 50%로 HP +10 또는 피해 10. 자산: `/assets/card-placeholder.svg`.
- **#238 무속성 도구 238**: 추가 공격. 자산: `/assets/card-placeholder.svg`.
- **#239 무속성 도구 239**: 바로 앞 기적의 MP 비용 면제. 자산: `/assets/card-placeholder.svg`.
- **#240 무속성 도구 240**: 상대 일반 카드 1장 제거. 자산: `/assets/card-placeholder.svg`.
- **#241 무속성 도구 241**: 상대 영구 기적 1개 제거. 자산: `/assets/card-placeholder.svg`.
- **#242 무속성 도구 242**: 무작위 수호자 소환 · HP 20. 자산: `/assets/card-placeholder.svg`.
- **#243 별의 실타래**: 열 가지 운명 중 무작위 발동. 자산: `/assets/card-placeholder.svg`.
- **#244 새벽의 씨앗**: 사망 직전 HP 10 부활. 자산: `/assets/card-placeholder.svg`.
- **#245 위험한 그릇**: 특수 공격의 표적 · 버릴 수 없음. 자산: `/assets/card-placeholder.svg`.
- **#246 무속성 이벤트 246**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#247 무속성 이벤트 247**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#248 무속성 이벤트 248**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#249 무속성 이벤트 249**: 상대 일반 카드 1장 제거. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#250 무속성 이벤트 250**: 상대 영구 기적 1개 제거. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#251 무속성 이벤트 251**: HP 회복. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#252 무속성 이벤트 252**: MP 회복. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#253 무속성 이벤트 253**: 소지금 획득. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#254 무속성 무기 254**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#255 무속성 무기 255**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#256 무속성 무기 256**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#257 무속성 무기 257**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#258 무속성 무기 258**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#259 무속성 무기 259**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#260 무속성 무기 260**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#261 무속성 무기 261**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#262 무속성 무기 262**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#263 무속성 무기 263**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#264 무속성 무기 264**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#265 무속성 무기 265**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#266 무속성 무기 266**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#267 무속성 무기 267**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#268 무속성 무기 268**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#269 무속성 무기 269**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#270 무속성 무기 270**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#271 무속성 무기 271**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#272 무속성 무기 272**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#273 무속성 무기 273**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#274 무속성 무기 274**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#275 무속성 무기 275**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#276 무속성 무기 276**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#277 무속성 무기 277**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#278 무속성 무기 278**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#279 무속성 무기 279**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#280 무속성 무기 280**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#281 무속성 무기 281**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#282 무속성 무기 282**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#283 무속성 무기 283**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#284 무속성 무기 284**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#285 무속성 무기 285**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#286 무속성 무기 286**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#287 무속성 무기 287**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#288 무속성 무기 288**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#289 무속성 무기 289**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#290 무속성 무기 290**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#291 무속성 무기 291**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#292 무속성 무기 292**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#293 무속성 무기 293**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#294 무속성 무기 294**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#295 무속성 무기 295**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#296 무속성 무기 296**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#297 무속성 무기 297**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#298 무속성 무기 298**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#299 무속성 무기 299**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#300 무속성 무기 300**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#301 무속성 무기 301**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#302 무속성 무기 302**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#303 무속성 무기 303**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#304 무속성 무기 304**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#305 무속성 무기 305**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#306 무속성 무기 306**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#307 무속성 무기 307**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#308 무속성 무기 308**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#309 무속성 무기 309**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#310 무속성 무기 310**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#311 무속성 무기 311**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#312 무속성 무기 312**: 공격 · 기적 완전 차단. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#313 무속성 무기 313**: 공격 · 기적 완전 차단. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#314 숲 무기 314**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#315 무속성 방어구 315**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#316 무속성 방어구 316**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#317 무속성 방어구 317**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#318 무속성 방어구 318**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#319 무속성 방어구 319**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#320 무속성 방어구 320**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#321 무속성 방어구 321**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#322 무속성 방어구 322**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#323 무속성 방어구 323**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#324 물결 방어구 324**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#325 무속성 방어구 325**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#326 무속성 방어구 326**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#327 무속성 방어구 327**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#328 무속성 방어구 328**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#329 무속성 방어구 329**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#330 무속성 방어구 330**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#331 무속성 방어구 331**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#332 물결 방어구 332**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#333 물결 방어구 333**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#334 무속성 방어구 334**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#335 무속성 방어구 335**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#336 무속성 방어구 336**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#337 무속성 방어구 337**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#338 무속성 방어구 338**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#339 무속성 방어구 339**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#340 무속성 방어구 340**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#341 무속성 방어구 341**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#342 무속성 방어구 342**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#343 무속성 방어구 343**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#344 무속성 방어구 344**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#345 무속성 방어구 345**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#346 무속성 방어구 346**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#347 무속성 방어구 347**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#348 무속성 방어구 348**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#349 무속성 방어구 349**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#350 무속성 방어구 350**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#351 무속성 방어구 351**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#352 무속성 방어구 352**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#353 무속성 방어구 353**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#354 무속성 방어구 354**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#355 무속성 방어구 355**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#356 무속성 방어구 356**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#357 무속성 방어구 357**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#358 무속성 방어구 358**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#359 무속성 방어구 359**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#360 무속성 방어구 360**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#361 무속성 방어구 361**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#362 무속성 방어구 362**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#363 무속성 방어구 363**: 방어 · 기적 완전 차단. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.

## 특수 수치와 적용 위치

- #0/#1은 손패가 아닌 대기/버리기 명령에 대응합니다. 새 게임의 대기·버리기 보충 정책은 game-rules.md에 따릅니다.
- #99: MORTAR 소유자 탐색→999 피해. 없으면 무작위30 피해. #245: 일반 사용 불가, 버리기 불가, 판매 가능.
- #117: 일반 사용은 CSV상 빛1/75% 적 전체. 사망 시에는 빛30/75% 적 전체로 전환합니다.
- #187: 미방어 공격량을 화염 반격,75% 적 전체. #190: 대지 반격2배. #193: 본인 MP2배. #194: 공격자 소지금 흡수.
- #195 속성 제거는 방어 합성에서 제외하고 공격 속성만 지웁니다. #196 만능 반사는 일반 속성/반격 제한의 예외입니다.
- #243 MYSTERY: MARS 열병 / MERCURY 안개 / JUPITER 꿈 / SATURN 모두HP1 / URANUS 임의 빛60 / PLUTO 적 전체 어둠30·75% / NEPTUNE 본인HP+60 / VENUS 모두소지금99 / EARTH 일반 손패 재분배 / MOON 모두 수호자. 각 분기가 별도 함수입니다.
- #244는 직접 사용하는 대신 죽음 판정에 반응하여 HP10으로 회복합니다.
- #246~253 CREATURE는 출현 가중치0이며 이벤트용 데이터입니다. 기본 종말 악마 피해표는 별도 신규 설정이고, 이8행을 무조건 무작위 드로우하지 않습니다.
- MAGIC_FREE는 바로 앞 MAGIC의 비용만 면제하며 자신은 일반 손패에서 소모됩니다.
- ADD_ATTRIBUTE는 후속 조합에서 속성을 덮어쓰고 기본 value를 추가 공격력으로 중복 합산하지 않습니다.

## 소환체 행동 전체

원본 AssistantItemData.CSV의 ID는 수호자 종류마다0부터 시작합니다. JSON id는 전체 CSV 행 번호입니다. 아래 두 ID를 모두 기록합니다. EARTH와 MOON은 한 행을 그대로 반복하는 대신 일반/기적 카드 조합을 생성합니다.

| CSV 전체 ID | 원본 종류 내부 ID | 수호자  | attackKind       | attackExtra | 속성   | 수치 | 명중%     | 가중치 |
| ----------- | ----------------- | ------- | ---------------- | ----------- | ------ | ---- | --------- | ------ |
| 0           | 0                 | MARS    | ATK              | —           | 화염   | 2    | 75        | 6      |
| 1           | 1                 | MARS    | ATK              | —           | 화염   | 3    | 75        | 5      |
| 2           | 2                 | MARS    | ATK              | —           | 화염   | 4    | 75        | 4      |
| 3           | 3                 | MARS    | ATK              | —           | 화염   | 5    | 75        | 3      |
| 4           | 4                 | MARS    | ATK              | —           | 화염   | 6    | 75        | 2      |
| 5           | 0                 | MERCURY | ATK              | FOG         | 물결   | 1    | 50        | 6      |
| 6           | 1                 | MERCURY | ATK              | FOG         | 물결   | 2    | 확정 단일 | 5      |
| 7           | 2                 | MERCURY | ATK              | —           | 물결   | 2    | 50        | 4      |
| 8           | 3                 | MERCURY | ATK              | —           | 물결   | 3    | 확정 단일 | 3      |
| 9           | 4                 | MERCURY | ATK              | —           | 물결   | 6    | 50        | 2      |
| 10          | 0                 | JUPITER | ATK              | —           | 숲     | 1    | 확정 단일 | 6      |
| 11          | 1                 | JUPITER | ATK              | —           | 숲     | 2    | 확정 단일 | 5      |
| 12          | 2                 | JUPITER | ATK              | ABSORB_HP   | 숲     | 1    | 75        | 4      |
| 13          | 3                 | JUPITER | ADD_HARM         | ILLUSION    | 숲     | 0    | 확정 단일 | 3      |
| 14          | 4                 | JUPITER | ATK              | ILLUSION    | 숲     | 2    | 75        | 2      |
| 15          | 0                 | SATURN  | ATK              | —           | 대지   | 3    | 확정 단일 | 6      |
| 16          | 1                 | SATURN  | ATK              | —           | 대지   | 5    | 확정 단일 | 5      |
| 17          | 2                 | SATURN  | ATK              | —           | 대지   | 7    | 확정 단일 | 4      |
| 18          | 3                 | SATURN  | ATK              | —           | 대지   | 10   | 확정 단일 | 3      |
| 19          | 4                 | SATURN  | ATK              | —           | 대지   | 16   | 확정 단일 | 2      |
| 20          | 0                 | URANUS  | ATK              | —           | 빛     | 2    | 확정 단일 | 6      |
| 21          | 1                 | URANUS  | ATK              | —           | 빛     | 4    | 25        | 5      |
| 22          | 2                 | URANUS  | ADD_HARM         | GLORY       | 빛     | 0    | 확정 단일 | 4      |
| 23          | 3                 | URANUS  | ATK              | ABSORB_HP   | 빛     | 5    | 확정 단일 | 3      |
| 24          | 4                 | URANUS  | ATK              | —           | 빛     | 10   | 75        | 2      |
| 25          | 0                 | PLUTO   | ATK              | DARK_CLOUD  | 어둠   | 1    | 25        | 6      |
| 26          | 1                 | PLUTO   | ATK              | —           | 어둠   | 1    | 확정 단일 | 5      |
| 27          | 2                 | PLUTO   | ATK              | —           | 어둠   | 2    | 확정 단일 | 4      |
| 28          | 3                 | PLUTO   | ATK              | —           | 어둠   | 4    | 확정 단일 | 3      |
| 29          | 4                 | PLUTO   | ATK              | —           | 어둠   | 8    | 확정 단일 | 2      |
| 30          | 0                 | NEPTUNE | REMOVE_ALL_HARMS | —           | 무속성 | 0    | 확정 단일 | 6      |
| 31          | 1                 | NEPTUNE | INCREASE_MP      | —           | 무속성 | 5    | 확정 단일 | 5      |
| 32          | 2                 | NEPTUNE | INCREASE_HP      | —           | 무속성 | 5    | 확정 단일 | 4      |
| 33          | 3                 | NEPTUNE | INCREASE_MP      | —           | 무속성 | 10   | 확정 단일 | 3      |
| 34          | 4                 | NEPTUNE | INCREASE_HP      | —           | 무속성 | 10   | 확정 단일 | 2      |
| 35          | 0                 | VENUS   | SCATTER_YEN      | —           | 무속성 | 1    | 확정 단일 | 6      |
| 36          | 1                 | VENUS   | INCREASE_YEN     | TO_ENEMY    | 무속성 | 5    | 확정 단일 | 5      |
| 37          | 2                 | VENUS   | ABSORB_YEN       | —           | 무속성 | 3    | 확정 단일 | 4      |
| 38          | 3                 | VENUS   | INCREASE_YEN     | —           | 무속성 | 8    | 확정 단일 | 3      |
| 39          | 4                 | VENUS   | INCREASE_YEN     | —           | 무속성 | 20   | 확정 단일 | 2      |
| 40          | 0                 | EARTH   | ADD_ITEM         | —           | 무속성 | 0    | 확정 단일 | 1      |
| 41          | 0                 | MOON    | ATK              | —           | 무속성 | 10   | 확정 단일 | 1      |

## 효과 처리 레지스트리

- `ABSORB_YEN`: 소지금 흡수 · 부족분 MP→HP
- `ADD_HARM`: ADD_HARM
- `ADD_ITEM`: 카드 한 장 지급
- `BUY`: 상대 카드 무작위 선택 후 구매 확인
- `INCREASE_HP`: HP 회복
- `INCREASE_MP`: MP 회복
- `INCREASE_OR_DECREASE_HP`: 50%로 HP +10 또는 피해 10
- `INCREASE_YEN`: 소지금 획득
- `REMOVE_ABILITIES`: 상대 영구 기적 1개 제거
- `REMOVE_ALL_HARMS`: 모든 재앙 해제
- `REMOVE_ITEMS`: 상대 일반 카드 1장 제거
- `REMOVE_LOWER_HARMS`: 감기·열병·안개·섬광 해제
- `SCATTER_YEN`: 모두 소지금 획득
- `SELL`: 카드 한 장을 골라 상대에게 강제 판매
- `SET_ASSISTANT`: 무작위 수호자 소환 · HP 20

ATK와 공격 보조 효과는 CombatResolver, 방어는 DefenseResolver, EXCHANGE/SELL의 소유권 검증은 TradeManager 및 공격 제출 경로, MYSTERY는 개별 열 가지 함수, 사망 직전 효과는 GameEngine.handleDeaths가 처리합니다.

## 검증 한계

전체 직접 사용 가능 카드에 대해 실제 CSV 값으로 명령을 실행하는 테스트를 포함합니다. 모든 카드×모든 카드의 조합 전수검사나 공식 원작 비교 실험을 완료한 것은 아닙니다. 이름·가격·확률·기적 공간 정책이 원작과 완전히 일치한다고 보증하지 않습니다.
