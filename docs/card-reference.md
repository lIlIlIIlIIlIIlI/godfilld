# 카드별 규칙 명세

기준 CSV의 0 기반 ID를 그대로 보존합니다. 아래 한국어 이름은 새로 만든 명칭이며 원작 번역 데이터가 아닙니다. 사용자 허가 확인에 따라246개 ID에 원본 그림을 매핑했습니다. 가중치0 역사 데이터 중 백업에 그림이 없는118개는 기본 SVG를 표시합니다. 모든 일반 데이터364행과 소환체 행동42행을 기재합니다.

## 데이터 필드와 해석

`value/subValue`는 종류와 효과에 따라 의미가 달라집니다. WEAPON의 DFS는 subValue, PROTECTOR의 DFS는 value, MAGIC의 MP비용은 subValue입니다. INCREASE_ATK의 보조 수치는 무기/기적은 value, 방어구/도구는 subValue입니다. hitRate>0은 적 전체에 대상별 명중 판정합니다. weight0은 일반 드로우에서 제외합니다. price0을 무조건 거래 가능한 것으로 해석하지 않습니다.

대상 규칙 self는 자신, other-alive는 자신 외 생존자, any-alive는 생존자입니다. DEFENSE의 실제 대상은 현재 공격을 받는 플레이어입니다. 공격 상황 표시는 첫 카드 유효성의 안내이며, 추가 효과는 조합 후속 위치에서만 쓸 수 있습니다.

## 일반 카드 전체

| ID | 신규 한국어 이름 | 종류 | 속성 | attackKind / attackExtra | defenseKind / defenseExtra | value / subValue | 공격 / 방어 | MP | 명중% | 가격 | 가중치 | 대상 | 사용 상황 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 숨 고르기 | 행동 | 무속성 | DO_NOTHING / — | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 0 | 0 | self | attack |
| 1 | 카드 정리 | 행동 | 무속성 | DISCARD / — | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 0 | 0 | self | attack |
| 2 | 환전 | 거래 | 무속성 | EXCHANGE / — | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 20 | self | attack |
| 3 | 강제 판매 | 거래 | 무속성 | SELL / — | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 5 | 20 | other-alive | attack |
| 4 | 카드 구매 | 거래 | 무속성 | BUY / — | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 5 | 20 | other-alive | attack |
| 5 | 여행자의 단검 | 무기 | 무속성 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 1 | 3 | any-alive | attack |
| 6 | 여행자의 새총 | 무기 | 무속성 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 5 | 1 | any-alive | attack |
| 7 | 여행자의 곤봉 | 무기 | 무속성 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 8 | 여행자의 숏소드 | 무기 | 무속성 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 9 | 연격 손도끼 | 무기 | 무속성 | ATK / INCREASE_ATK | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 2 | 1 | any-alive | attack |
| 10 | 여행자의 장창 | 무기 | 무속성 | ATK / — | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 1 | 3 | any-alive | attack |
| 11 | 여행자의 철퇴 | 무기 | 무속성 | ATK / — | DFS / — | 2 / 6 | 2 / 6 | 0 | 확정 단일 | 10 | 1 | any-alive | attack,defense |
| 12 | 연격 전투 활 | 무기 | 무속성 | ATK / INCREASE_ATK | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 3 | 1 | any-alive | attack |
| 13 | 여행자의 긴 검 | 무기 | 무속성 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 2 | 3 | any-alive | attack |
| 14 | 연격 할버드 | 무기 | 무속성 | ATK / INCREASE_ATK | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 3 | 1 | any-alive | attack |
| 15 | 여행자의 대검 | 무기 | 무속성 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 2 | 3 | any-alive | attack |
| 16 | 여행자의 망치 | 무기 | 무속성 | ATK / — | DFS / — | 4 / 2 | 4 / 2 | 0 | 확정 단일 | 3 | 1 | any-alive | attack,defense |
| 17 | 연격 쌍검 | 무기 | 무속성 | ATK / INCREASE_ATK | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 4 | 1 | any-alive | attack |
| 18 | 여행자의 창날 | 무기 | 무속성 | ATK / — | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 3 | 3 | any-alive | attack |
| 19 | 여행자의 손톱 | 무기 | 무속성 | ATK / — | DFS / — | 5 / 7 | 5 / 7 | 0 | 확정 단일 | 3 | 1 | any-alive | attack,defense |
| 20 | 무기 튕김의 낫 | 무기 | 무속성 | ATK / — | — / FLICK_WEAPON | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 10 | 6 | any-alive | attack,defense |
| 21 | 연격 쇠사슬 | 무기 | 무속성 | ATK / INCREASE_ATK | — / FLICK_MAGIC | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack,defense |
| 22 | 여행자의 투척검 | 무기 | 무속성 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 3 | 8 | any-alive | attack |
| 23 | 여행자의 석궁 | 무기 | 무속성 | ATK / — | DFS / — | 6 / 3 | 6 / 3 | 0 | 확정 단일 | 3 | 1 | any-alive | attack,defense |
| 24 | 연격 칼날 | 무기 | 무속성 | ATK / INCREASE_ATK | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 5 | 1 | any-alive | attack |
| 25 | 여행자의 도끼 | 무기 | 무속성 | ATK / — | — / — | 7 / 0 | 7 / 0 | 0 | 확정 단일 | 4 | 8 | any-alive | attack |
| 26 | 흡혈 창 | 무기 | 무속성 | ATK / ABSORB_HP | — / — | 7 / 0 | 7 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 27 | 기적 봉쇄의 보검 | 무기 | 무속성 | ATK / — | — / BLOCK_MAGIC | 7 / 0 | 7 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack,defense |
| 28 | 연격 전투봉 | 무기 | 무속성 | ATK / INCREASE_ATK | — / — | 7 / 0 | 7 / 0 | 0 | 확정 단일 | 5 | 1 | any-alive | attack |
| 29 | 사냥꾼의 단검 | 무기 | 무속성 | ATK / — | — / — | 8 / 0 | 8 / 0 | 0 | 확정 단일 | 4 | 7 | any-alive | attack |
| 30 | 지옥병 새총 | 무기 | 무속성 | ATK / HELL | — / — | 8 / 0 | 8 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 31 | 사냥꾼의 곤봉 | 무기 | 무속성 | ATK / — | DFS / — | 8 / 12 | 8 / 12 | 0 | 확정 단일 | 4 | 1 | any-alive | attack,defense |
| 32 | 연격 숏소드 | 무기 | 무속성 | ATK / INCREASE_ATK | — / — | 8 / 0 | 8 / 0 | 0 | 확정 단일 | 5 | 1 | any-alive | attack |
| 33 | 사냥꾼의 손도끼 | 무기 | 무속성 | ATK / — | — / — | 9 / 0 | 9 / 0 | 0 | 확정 단일 | 5 | 7 | any-alive | attack |
| 34 | 감기 장창 | 무기 | 무속성 | ATK / COLD | — / — | 9 / 0 | 9 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 35 | 연격 철퇴 | 무기 | 무속성 | ATK / INCREASE_ATK | — / — | 9 / 0 | 9 / 0 | 0 | 확정 단일 | 5 | 1 | any-alive | attack |
| 36 | 사냥꾼의 전투 활 | 무기 | 무속성 | ATK / — | — / — | 10 / 0 | 10 / 0 | 0 | 확정 단일 | 5 | 5 | any-alive | attack |
| 37 | 환영 긴 검 | 무기 | 무속성 | ATK / ILLUSION | — / — | 10 / 0 | 10 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 38 | 사냥꾼의 할버드 | 무기 | 무속성 | ATK / — | DFS / — | 10 / 10 | 10 / 10 | 0 | 확정 단일 | 15 | 1 | any-alive | attack,defense |
| 39 | 무기 반사의 대검 | 무기 | 무속성 | ATK / — | — / REFLECT_WEAPON | 10 / 0 | 10 / 0 | 0 | 확정 단일 | 5 | 3 | any-alive | attack,defense |
| 40 | 기적 반사의 망치 | 무기 | 무속성 | ATK / — | — / REFLECT_MAGIC | 10 / 0 | 10 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack,defense |
| 41 | 사냥꾼의 쌍검 | 무기 | 무속성 | ATK / — | — / — | 11 / 0 | 11 / 0 | 0 | 확정 단일 | 6 | 4 | any-alive | attack |
| 42 | 흡혈 창날 | 무기 | 무속성 | ATK / ABSORB_HP | — / — | 11 / 0 | 11 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 43 | 먹구름 손톱 | 무기 | 무속성 | ATK / DARK_CLOUD | — / — | 11 / 0 | 11 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 44 | 연격 낫 | 무기 | 무속성 | ATK / INCREASE_ATK | — / — | 11 / 0 | 11 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 45 | 사냥꾼의 쇠사슬 | 무기 | 무속성 | ATK / — | — / — | 12 / 0 | 12 / 0 | 0 | 확정 단일 | 6 | 4 | any-alive | attack |
| 46 | 환영 투척검 | 무기 | 무속성 | ATK / ILLUSION | — / — | 12 / 0 | 12 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 47 | 무소모 석궁 | 무기 | 무속성 | ATK / MAGIC_FREE | — / — | 12 / 0 | 12 / 0 | 0 | 확정 단일 | 20 | 1 | any-alive | attack |
| 48 | 사냥꾼의 칼날 | 무기 | 무속성 | ATK / — | — / — | 13 / 0 | 13 / 0 | 0 | 확정 단일 | 7 | 3 | any-alive | attack |
| 49 | 감기 도끼 | 무기 | 무속성 | ATK / COLD | — / — | 13 / 0 | 13 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 50 | 사냥꾼의 창 | 무기 | 무속성 | ATK / — | DFS / — | 13 / 1 | 13 / 1 | 0 | 확정 단일 | 7 | 1 | any-alive | attack,defense |
| 51 | 연격 보검 | 무기 | 무속성 | ATK / INCREASE_ATK | — / — | 13 / 0 | 13 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 52 | 사냥꾼의 전투봉 | 무기 | 무속성 | ATK / — | — / — | 14 / 0 | 14 / 0 | 0 | 확정 단일 | 7 | 3 | any-alive | attack |
| 53 | 광란 단검 | 무기 | 무속성 | ATK / DAMAGE_TO_SELF | — / — | 14 / 0 | 14 / 0 | 0 | 확정 단일 | 1 | 1 | any-alive | attack |
| 54 | 기적 봉쇄의 새총 | 무기 | 무속성 | ATK / — | — / BLOCK_MAGIC | 15 / 0 | 15 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack,defense |
| 55 | 연격 곤봉 | 무기 | 무속성 | ATK / INCREASE_ATK | — / BLOCK_MAGIC | 15 / 0 | 15 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack,defense |
| 56 | 기사의 숏소드 | 무기 | 무속성 | ATK / — | — / — | 30 / 0 | 30 / 0 | 0 | 확정 단일 | 30 | 1 | any-alive | attack |
| 57 | 마력의 수정검 | 무기 | 무속성 | ATK / MAGICAL | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 58 | 화염 기사의 손도끼 | 무기 | 화염 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 1 | 1 | any-alive | attack |
| 59 | 물결 기사의 장창 | 무기 | 물결 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 1 | 1 | any-alive | attack |
| 60 | 숲 기사의 철퇴 | 무기 | 숲 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 1 | 1 | any-alive | attack |
| 61 | 대지 감기 전투 활 | 무기 | 대지 | ATK / COLD | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 62 | 빛 연격 긴 검 | 무기 | 빛 | ATK / INCREASE_ATK | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 63 | 어둠 기사의 할버드 | 무기 | 어둠 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 64 | 화염 기사의 대검 | 무기 | 화염 | ATK / — | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 2 | 1 | any-alive | attack |
| 65 | 화염 속성 망치 | 무기 | 화염 | ATK / ADD_ATTRIBUTE | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 66 | 물결 기사의 쌍검 | 무기 | 물결 | ATK / — | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 2 | 1 | any-alive | attack |
| 67 | 숲 기사의 창날 | 무기 | 숲 | ATK / — | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 2 | 1 | any-alive | attack |
| 68 | 숲 연격 손톱 | 무기 | 숲 | ATK / INCREASE_ATK | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 3 | 1 | any-alive | attack |
| 69 | 대지 기사의 낫 | 무기 | 대지 | ATK / — | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 2 | 1 | any-alive | attack |
| 70 | 빛 섬광 쇠사슬 | 무기 | 빛 | ATK / GLORY | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 71 | 화염 기사의 투척검 | 무기 | 화염 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 3 | 1 | any-alive | attack |
| 72 | 물결 안개 석궁 | 무기 | 물결 | ATK / FOG | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 73 | 숲 기사의 칼날 | 무기 | 숲 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 3 | 1 | any-alive | attack |
| 74 | 숲 연격 도끼 | 무기 | 숲 | ATK / INCREASE_ATK | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 4 | 1 | any-alive | attack |
| 75 | 빛 기사의 창 | 무기 | 빛 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 3 | 1 | any-alive | attack |
| 76 | 어둠 기사의 보검 | 무기 | 어둠 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 77 | 화염 기사의 전투봉 | 무기 | 화염 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 4 | 1 | any-alive | attack |
| 78 | 화염 수호자의 단검 | 무기 | 화염 | ATK / — | DFS / — | 4 / 4 | 4 / 4 | 0 | 확정 단일 | 8 | 1 | any-alive | attack,defense |
| 79 | 물결 수호자의 새총 | 무기 | 물결 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 4 | 1 | any-alive | attack |
| 80 | 숲 환영 곤봉 | 무기 | 숲 | ATK / ILLUSION | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 81 | 대지 연격 숏소드 | 무기 | 대지 | ATK / INCREASE_ATK | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 5 | 1 | any-alive | attack |
| 82 | 빛 수호자의 손도끼 | 무기 | 빛 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 4 | 1 | any-alive | attack |
| 83 | 어둠 수호자의 장창 | 무기 | 어둠 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 84 | 화염 연격 철퇴 | 무기 | 화염 | ATK / INCREASE_ATK | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 6 | 1 | any-alive | attack |
| 85 | 물결 속성 전투 활 | 무기 | 물결 | ATK / ADD_ATTRIBUTE | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 86 | 숲 수호자의 긴 검 | 무기 | 숲 | ATK / — | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 5 | 1 | any-alive | attack |
| 87 | 빛 수호자의 할버드 | 무기 | 빛 | ATK / — | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 5 | 1 | any-alive | attack |
| 88 | 어둠 수호자의 대검 | 무기 | 어둠 | ATK / — | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 89 | 어둠 연격 망치 | 무기 | 어둠 | ATK / INCREASE_ATK | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 90 | 화염 수호자의 쌍검 | 무기 | 화염 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 6 | 1 | any-alive | attack |
| 91 | 물결 수호자의 창날 | 무기 | 물결 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 6 | 1 | any-alive | attack |
| 92 | 대지 연격 손톱 | 무기 | 대지 | ATK / INCREASE_ATK | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 7 | 1 | any-alive | attack |
| 93 | 어둠 수호자의 낫 | 무기 | 어둠 | ATK / — | — / — | 7 / 0 | 7 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | attack |
| 94 | 화염 연격 쇠사슬 | 무기 | 화염 | ATK / INCREASE_ATK | — / — | 8 / 0 | 8 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 95 | 물결 연격 투척검 | 무기 | 물결 | ATK / INCREASE_ATK | — / — | 8 / 0 | 8 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 96 | 빛 수호자의 석궁 | 무기 | 빛 | ATK / — | — / — | 9 / 0 | 9 / 0 | 0 | 확정 단일 | 15 | 1 | any-alive | attack |
| 97 | 어둠 수호자의 칼날 | 무기 | 어둠 | ATK / — | — / — | 10 / 0 | 10 / 0 | 0 | 확정 단일 | 20 | 1 | any-alive | attack |
| 98 | 대지 수호자의 도끼 | 무기 | 대지 | ATK / — | — / — | 13 / 0 | 13 / 0 | 0 | 확정 단일 | 25 | 1 | any-alive | attack |
| 99 | 운명의 방망이 | 무기 | 빛 | ATK / PESTLE | — / — | 30 / 0 | 30 / 0 | 0 | 확정 단일 | 5 | 1 | any-alive | attack |
| 100 | 화염 수호자의 창 | 무기 | 화염 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 75 | 2 | 1 | any-alive | attack |
| 101 | 어둠 수호자의 보검 | 무기 | 어둠 | ATK / — | — / — | 2 / 0 | 2 / 0 | 0 | 50 | 8 | 1 | any-alive | attack |
| 102 | 물결 안개 전투봉 | 무기 | 물결 | ATK / FOG | — / — | 3 / 0 | 3 / 0 | 0 | 50 | 8 | 1 | any-alive | attack |
| 103 | 숲 흡혈 단검 | 무기 | 숲 | ATK / ABSORB_HP | — / — | 3 / 0 | 3 / 0 | 0 | 75 | 10 | 1 | any-alive | attack |
| 104 | 빛 현자의 새총 | 무기 | 빛 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 25 | 3 | 1 | any-alive | attack |
| 105 | 화염 현자의 곤봉 | 무기 | 화염 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 75 | 6 | 1 | any-alive | attack |
| 106 | 물결 현자의 숏소드 | 무기 | 물결 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 75 | 6 | 1 | any-alive | attack |
| 107 | 숲 현자의 손도끼 | 무기 | 숲 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 75 | 6 | 1 | any-alive | attack |
| 108 | 대지 현자의 장창 | 무기 | 대지 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 75 | 6 | 1 | any-alive | attack |
| 109 | 물결 현자의 철퇴 | 무기 | 물결 | ATK / — | — / — | 5 / 0 | 5 / 0 | 0 | 50 | 5 | 1 | any-alive | attack |
| 110 | 대지 현자의 전투 활 | 무기 | 대지 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 25 | 9 | 1 | any-alive | attack |
| 111 | 빛 현자의 긴 검 | 무기 | 빛 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 75 | 10 | 1 | any-alive | attack |
| 112 | 화염 현자의 할버드 | 무기 | 화염 | ATK / — | — / — | 7 / 0 | 7 / 0 | 0 | 75 | 10 | 1 | any-alive | attack |
| 113 | 숲 현자의 대검 | 무기 | 숲 | ATK / — | DFS / — | 8 / 6 | 8 / 6 | 0 | 75 | 15 | 1 | any-alive | attack,defense |
| 114 | 물결 현자의 망치 | 무기 | 물결 | ATK / — | — / — | 9 / 0 | 9 / 0 | 0 | 50 | 9 | 1 | any-alive | attack |
| 115 | 화염 현자의 쌍검 | 무기 | 화염 | ATK / — | — / — | 10 / 0 | 10 / 0 | 0 | 50 | 15 | 1 | any-alive | attack |
| 116 | 대지 현자의 창날 | 무기 | 대지 | ATK / — | — / — | 20 / 0 | 20 / 0 | 0 | 25 | 15 | 1 | any-alive | attack |
| 117 | 황혼의 유언 | 무기 | 빛 | ATK / DYING_ATTACK | — / — | 1 / 30 | 1 / 0 | 0 | 75 | 10 | 1 | any-alive | attack,passive |
| 118 | 여행자의 나무 방패 | 방어구 | 무속성 | — / — | DFS / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 1 | 1 | any-alive | defense |
| 119 | 기적 튕김의 가죽 갑옷 | 방어구 | 무속성 | — / — | DFS / FLICK_MAGIC | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 5 | 1 | any-alive | defense |
| 120 | 여행자의 철 방패 | 방어구 | 무속성 | — / — | DFS / — | 1 / 0 | 0 / 1 | 0 | 확정 단일 | 1 | 12 | any-alive | defense |
| 121 | 기적 튕김의 사슬 갑옷 | 방어구 | 무속성 | — / — | DFS / FLICK_MAGIC | 1 / 0 | 0 / 1 | 0 | 확정 단일 | 5 | 1 | any-alive | defense |
| 122 | 화염 여행자의 원형 방패 | 방어구 | 화염 | — / — | DFS / — | 1 / 0 | 0 / 1 | 0 | 확정 단일 | 2 | 1 | any-alive | defense |
| 123 | 물결 여행자의 투구 | 방어구 | 물결 | — / — | DFS / — | 1 / 0 | 0 / 1 | 0 | 확정 단일 | 2 | 1 | any-alive | defense |
| 124 | 숲 여행자의 철갑 | 방어구 | 숲 | — / — | DFS / — | 1 / 0 | 0 / 1 | 0 | 확정 단일 | 2 | 1 | any-alive | defense |
| 125 | 대지 여행자의 수호 방패 | 방어구 | 대지 | — / — | DFS / — | 1 / 0 | 0 / 1 | 0 | 확정 단일 | 2 | 1 | any-alive | defense |
| 126 | 여행자의 수호 망토 | 방어구 | 무속성 | — / — | DFS / — | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 2 | 11 | any-alive | defense |
| 127 | 기적 튕김의 보호 장갑 | 방어구 | 무속성 | — / — | DFS / FLICK_MAGIC | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 5 | 1 | any-alive | defense |
| 128 | 화염 여행자의 기사 방패 | 방어구 | 화염 | — / — | DFS / — | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 3 | 1 | any-alive | defense |
| 129 | 물결 여행자의 판금 갑옷 | 방어구 | 물결 | — / — | DFS / — | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 3 | 1 | any-alive | defense |
| 130 | 숲 여행자의 수호 반지 | 방어구 | 숲 | — / — | DFS / — | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 3 | 1 | any-alive | defense |
| 131 | 대지 여행자의 방벽 | 방어구 | 대지 | — / — | DFS / — | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 3 | 1 | any-alive | defense |
| 132 | 여행자의 흉갑 | 방어구 | 무속성 | — / — | DFS / — | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 3 | 10 | any-alive | defense |
| 133 | 연격 전투 장화 | 방어구 | 무속성 | — / INCREASE_ATK | DFS / — | 3 / 5 | 5 / 3 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 134 | 기적 튕김의 방호 부적 | 방어구 | 무속성 | — / — | DFS / FLICK_MAGIC | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 5 | 1 | any-alive | defense |
| 135 | 화염 여행자의 가슴 보호대 | 방어구 | 화염 | — / — | DFS / — | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 4 | 1 | any-alive | defense |
| 136 | 물결 여행자의 수호 관 | 방어구 | 물결 | — / — | DFS / — | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 4 | 1 | any-alive | defense |
| 137 | 숲 여행자의 보호 팔찌 | 방어구 | 숲 | — / — | DFS / — | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 4 | 1 | any-alive | defense |
| 138 | 대지 여행자의 방호복 | 방어구 | 대지 | — / — | DFS / — | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 4 | 1 | any-alive | defense |
| 139 | 여행자의 큰 방패 | 방어구 | 무속성 | — / — | DFS / — | 4 / 0 | 0 / 4 | 0 | 확정 단일 | 4 | 9 | any-alive | defense |
| 140 | 기적 튕김의 은빛 갑옷 | 방어구 | 무속성 | — / — | DFS / FLICK_MAGIC | 4 / 0 | 0 / 4 | 0 | 확정 단일 | 5 | 1 | any-alive | defense |
| 141 | 화염 여행자의 수호 장막 | 방어구 | 화염 | — / — | DFS / — | 4 / 0 | 0 / 4 | 0 | 확정 단일 | 5 | 1 | any-alive | defense |
| 142 | 물결 사냥꾼의 나무 방패 | 방어구 | 물결 | — / — | DFS / — | 4 / 0 | 0 / 4 | 0 | 확정 단일 | 5 | 1 | any-alive | defense |
| 143 | 숲 사냥꾼의 가죽 갑옷 | 방어구 | 숲 | — / — | DFS / — | 4 / 0 | 0 / 4 | 0 | 확정 단일 | 5 | 1 | any-alive | defense |
| 144 | 대지 사냥꾼의 철 방패 | 방어구 | 대지 | — / — | DFS / — | 4 / 0 | 0 / 4 | 0 | 확정 단일 | 5 | 1 | any-alive | defense |
| 145 | 사냥꾼의 사슬 갑옷 | 방어구 | 무속성 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 5 | 8 | any-alive | defense |
| 146 | 연격 원형 방패 | 방어구 | 무속성 | — / INCREASE_ATK | DFS / — | 5 / 10 | 10 / 5 | 0 | 확정 단일 | 15 | 1 | any-alive | defense |
| 147 | 화염 사냥꾼의 투구 | 방어구 | 화염 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 6 | 1 | any-alive | defense |
| 148 | 물결 사냥꾼의 철갑 | 방어구 | 물결 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 6 | 1 | any-alive | defense |
| 149 | 숲 사냥꾼의 수호 방패 | 방어구 | 숲 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 6 | 1 | any-alive | defense |
| 150 | 대지 사냥꾼의 수호 망토 | 방어구 | 대지 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 6 | 1 | any-alive | defense |
| 151 | 사냥꾼의 보호 장갑 | 방어구 | 무속성 | — / — | DFS / — | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 6 | 7 | any-alive | defense |
| 152 | 기적 봉쇄의 기사 방패 | 방어구 | 무속성 | — / — | DFS / BLOCK_MAGIC | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 153 | 무소모 판금 갑옷 | 방어구 | 무속성 | — / MAGIC_FREE | DFS / — | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 20 | 1 | any-alive | defense |
| 154 | 화염 사냥꾼의 수호 반지 | 방어구 | 화염 | — / — | DFS / — | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 8 | 1 | any-alive | defense |
| 155 | 물결 사냥꾼의 방벽 | 방어구 | 물결 | — / — | DFS / — | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 8 | 1 | any-alive | defense |
| 156 | 숲 사냥꾼의 흉갑 | 방어구 | 숲 | — / — | DFS / — | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 8 | 1 | any-alive | defense |
| 157 | 대지 사냥꾼의 전투 장화 | 방어구 | 대지 | — / — | DFS / — | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 8 | 1 | any-alive | defense |
| 158 | 빛 사냥꾼의 방호 부적 | 방어구 | 빛 | — / — | DFS / — | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 15 | 1 | any-alive | defense |
| 159 | 사냥꾼의 가슴 보호대 | 방어구 | 무속성 | — / — | DFS / — | 7 / 0 | 0 / 7 | 0 | 확정 단일 | 7 | 6 | any-alive | defense |
| 160 | 연격 수호 관 | 방어구 | 무속성 | — / INCREASE_ATK | DFS / — | 7 / 10 | 10 / 7 | 0 | 확정 단일 | 15 | 1 | any-alive | defense |
| 161 | 화염 사냥꾼의 보호 팔찌 | 방어구 | 화염 | — / — | DFS / — | 7 / 0 | 0 / 7 | 0 | 확정 단일 | 9 | 1 | any-alive | defense |
| 162 | 물결 사냥꾼의 방호복 | 방어구 | 물결 | — / — | DFS / — | 7 / 0 | 0 / 7 | 0 | 확정 단일 | 9 | 1 | any-alive | defense |
| 163 | 대지 사냥꾼의 큰 방패 | 방어구 | 대지 | — / — | DFS / — | 7 / 0 | 0 / 7 | 0 | 확정 단일 | 9 | 1 | any-alive | defense |
| 164 | 사냥꾼의 은빛 갑옷 | 방어구 | 무속성 | — / — | DFS / — | 8 / 0 | 0 / 8 | 0 | 확정 단일 | 8 | 5 | any-alive | defense |
| 165 | 기적 봉쇄의 수호 장막 | 방어구 | 무속성 | — / — | DFS / BLOCK_MAGIC | 8 / 0 | 0 / 8 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 166 | 화염 기사의 나무 방패 | 방어구 | 화염 | — / — | DFS / — | 8 / 0 | 0 / 8 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 167 | 물결 기사의 가죽 갑옷 | 방어구 | 물결 | — / — | DFS / — | 8 / 0 | 0 / 8 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 168 | 숲 기사의 철 방패 | 방어구 | 숲 | — / — | DFS / — | 8 / 0 | 0 / 8 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 169 | 기사의 사슬 갑옷 | 방어구 | 무속성 | — / — | DFS / — | 9 / 0 | 0 / 9 | 0 | 확정 단일 | 9 | 4 | any-alive | defense |
| 170 | 작은 연격 원형 방패 | 방어구 | 무속성 | — / INCREASE_ATK | DFS / — | 9 / 15 | 15 / 9 | 0 | 확정 단일 | 20 | 1 | any-alive | defense |
| 171 | 기적 반사의 투구 | 방어구 | 무속성 | — / — | DFS / REFLECT_MAGIC | 9 / 0 | 0 / 9 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 172 | 무소모 철갑 | 방어구 | 무속성 | — / MAGIC_FREE | DFS / — | 9 / 0 | 0 / 9 | 0 | 확정 단일 | 20 | 1 | any-alive | defense |
| 173 | 기사의 수호 방패 | 방어구 | 무속성 | — / — | DFS / — | 10 / 0 | 0 / 10 | 0 | 확정 단일 | 10 | 3 | any-alive | defense |
| 174 | 기적 반사의 수호 망토 | 방어구 | 무속성 | — / — | DFS / REFLECT_MAGIC | 10 / 0 | 0 / 10 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 175 | 화염 기사의 보호 장갑 | 방어구 | 화염 | — / — | DFS / FEVER | 10 / 0 | 0 / 10 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 176 | 빛 기사의 기사 방패 | 방어구 | 빛 | — / — | DFS / — | 10 / 0 | 0 / 10 | 0 | 확정 단일 | 15 | 1 | any-alive | defense |
| 177 | 기사의 판금 갑옷 | 방어구 | 무속성 | — / — | DFS / — | 11 / 0 | 0 / 11 | 0 | 확정 단일 | 10 | 2 | any-alive | defense |
| 178 | 기적 반사의 수호 반지 | 방어구 | 무속성 | — / — | DFS / REFLECT_MAGIC | 11 / 0 | 0 / 11 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 179 | 기사의 방벽 | 방어구 | 무속성 | — / — | DFS / — | 12 / 0 | 0 / 12 | 0 | 확정 단일 | 10 | 2 | any-alive | defense |
| 180 | 무소모 흉갑 | 방어구 | 무속성 | — / MAGIC_FREE | DFS / — | 12 / 0 | 0 / 12 | 0 | 확정 단일 | 20 | 1 | any-alive | defense |
| 181 | 화염 기사의 전투 장화 | 방어구 | 화염 | — / — | DFS / — | 12 / 0 | 0 / 12 | 0 | 확정 단일 | 15 | 1 | any-alive | defense |
| 182 | 기적 봉쇄의 방호 부적 | 방어구 | 무속성 | — / — | DFS / BLOCK_MAGIC | 13 / 0 | 0 / 13 | 0 | 확정 단일 | 15 | 1 | any-alive | defense |
| 183 | 기적 봉쇄의 가슴 보호대 | 방어구 | 무속성 | — / — | DFS / BLOCK_MAGIC | 14 / 0 | 0 / 14 | 0 | 확정 단일 | 15 | 1 | any-alive | defense |
| 184 | 숲 환영 수호 관 | 방어구 | 숲 | — / — | DFS / ILLUSION | 14 / 0 | 0 / 14 | 0 | 확정 단일 | 15 | 1 | any-alive | defense |
| 185 | 기적 봉쇄의 보호 팔찌 | 방어구 | 무속성 | — / — | DFS / BLOCK_MAGIC | 15 / 0 | 0 / 15 | 0 | 확정 단일 | 15 | 1 | any-alive | defense |
| 186 | 기사의 방호복 | 방어구 | 무속성 | — / — | DFS / — | 30 / 0 | 0 / 30 | 0 | 확정 단일 | 30 | 1 | any-alive | defense |
| 187 | 화염 기사의 큰 방패 | 방어구 | 화염 | ATK / — | COUNTER / — | 0 / 0 | 0 / 0 | 0 | 75 | 10 | 1 | any-alive | defense |
| 188 | 물결 안개 은빛 갑옷 | 방어구 | 물결 | ADD_HARM / FOG | COUNTER / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 189 | 숲 환영 수호 장막 | 방어구 | 숲 | ADD_HARM / ILLUSION | COUNTER / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 190 | 대지 수호자의 나무 방패 | 방어구 | 대지 | ATK / — | COUNTER / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 191 | 빛 섬광 가죽 갑옷 | 방어구 | 빛 | ADD_HARM / GLORY | COUNTER / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 192 | 어둠 먹구름 철 방패 | 방어구 | 어둠 | ADD_HARM / DARK_CLOUD | COUNTER / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 193 | 수호자의 사슬 갑옷 | 방어구 | 무속성 | INCREASE_MP / — | COUNTER / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 194 | 수호자의 원형 방패 | 방어구 | 무속성 | ABSORB_YEN / — | COUNTER / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 195 | 정화의 깃 | 방어구 | 무속성 | — / — | — / REMOVE_ATTRIBUTE | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 15 | 3 | any-alive | defense |
| 196 | 거울의 파편 | 방어구 | 무속성 | — / — | — / REFLECT_ANY | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | defense |
| 197 | 불씨 | 기적 | 화염 | ATK / INCREASE_ATK | — / — | 2 / 2 | 2 / 0 | 2 | 확정 단일 | 10 | 1 | any-alive | attack |
| 198 | 물의 화살 | 기적 | 물결 | ATK / — | — / — | 4 / 2 | 4 / 0 | 2 | 확정 단일 | 10 | 1 | any-alive | attack |
| 199 | 덩굴 채찍 | 기적 | 숲 | ATK / — | — / — | 6 / 3 | 6 / 0 | 3 | 확정 단일 | 10 | 1 | any-alive | attack |
| 200 | 눈부신 섬광 | 기적 | 빛 | ATK / GLORY | — / — | 1 / 3 | 1 / 0 | 3 | 25 | 10 | 1 | any-alive | attack |
| 201 | 안개 부르기 | 기적 | 물결 | ADD_HARM / FOG | — / — | 0 / 3 | 0 / 0 | 3 | 확정 단일 | 10 | 1 | any-alive | attack |
| 202 | 작은 정화 | 기적 | 무속성 | REMOVE_LOWER_HARMS / — | — / — | 0 / 3 | 0 / 0 | 3 | 확정 단일 | 10 | 1 | any-alive | attack |
| 203 | 바위 낙하 | 기적 | 대지 | ATK / — | — / — | 8 / 4 | 8 / 0 | 4 | 확정 단일 | 10 | 1 | any-alive | attack |
| 204 | 불꽃 비 | 기적 | 화염 | ATK / — | — / — | 5 / 4 | 5 / 0 | 4 | 75 | 10 | 1 | any-alive | attack |
| 205 | 별빛 소나기 | 기적 | 빛 | ATK / — | — / — | 10 / 4 | 10 / 0 | 4 | 25 | 10 | 1 | any-alive | attack |
| 206 | 화염구 | 기적 | 화염 | ATK / — | — / — | 10 / 5 | 10 / 0 | 5 | 확정 단일 | 10 | 1 | any-alive | attack |
| 207 | 어둠의 손길 | 기적 | 어둠 | ATK / — | — / — | 5 / 5 | 5 / 0 | 5 | 확정 단일 | 15 | 1 | any-alive | attack |
| 208 | 먹구름 부르기 | 기적 | 어둠 | ADD_HARM / DARK_CLOUD | — / — | 0 / 5 | 0 / 0 | 5 | 확정 단일 | 10 | 1 | any-alive | attack |
| 209 | 확산의 주문 | 기적 | 무속성 | — / WIDE_ATK | — / — | 0 / 5 | 0 / 0 | 5 | 100 | 10 | 1 | any-alive | 후속 조합 |
| 210 | 마법 튕기기 | 기적 | 무속성 | — / — | — / FLICK_MAGIC | 0 / 5 | 0 / 0 | 5 | 확정 단일 | 15 | 1 | any-alive | defense |
| 211 | 완전한 정화 | 기적 | 무속성 | REMOVE_ALL_HARMS / — | — / — | 0 / 5 | 0 / 0 | 5 | 확정 단일 | 15 | 1 | any-alive | attack |
| 212 | 감기 주문 | 기적 | 무속성 | ADD_HARM / COLD | — / — | 0 / 6 | 0 / 0 | 6 | 확정 단일 | 10 | 1 | any-alive | attack |
| 213 | 꿈의 장막 | 기적 | 숲 | ADD_HARM / ILLUSION | — / — | 0 / 6 | 0 / 0 | 6 | 확정 단일 | 10 | 1 | any-alive | attack |
| 214 | 증폭의 주문 | 기적 | 무속성 | — / DOUBLE_ATK | — / — | 0 / 6 | 0 / 0 | 6 | 확정 단일 | 10 | 1 | any-alive | 후속 조합 |
| 215 | 무기 봉쇄 | 기적 | 무속성 | — / — | — / BLOCK_WEAPON | 0 / 6 | 0 / 0 | 6 | 확정 단일 | 15 | 1 | any-alive | defense |
| 216 | 회복의 빛 | 기적 | 무속성 | INCREASE_HP / — | — / — | 10 / 6 | 0 / 0 | 6 | 확정 단일 | 15 | 1 | any-alive | attack |
| 217 | 빛의 창 | 기적 | 빛 | ATK / INCREASE_ATK | — / — | 10 / 7 | 10 / 0 | 7 | 확정 단일 | 15 | 1 | any-alive | attack |
| 218 | 파도 폭풍 | 기적 | 물결 | ATK / — | — / — | 9 / 7 | 9 / 0 | 7 | 75 | 10 | 1 | any-alive | attack |
| 219 | 지진 | 기적 | 대지 | ATK / — | — / — | 13 / 8 | 13 / 0 | 8 | 50 | 10 | 1 | any-alive | attack |
| 220 | 금빛 소원 | 기적 | 무속성 | INCREASE_YEN / — | — / — | 15 / 8 | 0 / 0 | 8 | 확정 단일 | 25 | 1 | any-alive | attack |
| 221 | 생명의 광선 | 기적 | 빛 | ATK / ABSORB_HP | — / — | 10 / 10 | 10 / 0 | 10 | 확정 단일 | 15 | 1 | any-alive | attack |
| 222 | 빙하의 창 | 기적 | 물결 | ATK / — | — / — | 25 / 12 | 25 / 0 | 12 | 확정 단일 | 20 | 1 | any-alive | attack |
| 223 | 화염 폭풍 | 기적 | 화염 | ATK / — | — / — | 16 / 12 | 16 / 0 | 12 | 75 | 15 | 1 | any-alive | attack |
| 224 | 천국의 초대 | 기적 | 무속성 | ADD_HARM / HEAVEN | — / — | 0 / 15 | 0 / 0 | 15 | 확정 단일 | 15 | 1 | any-alive | attack |
| 225 | 수호자 강림 | 기적 | 무속성 | SET_ASSISTANT / — | — / — | 0 / 20 | 0 / 0 | 20 | 확정 단일 | 20 | 1 | any-alive | attack |
| 226 | 대해일 | 기적 | 물결 | ATK / — | — / — | 30 / 30 | 30 / 0 | 30 | 75 | 10 | 1 | any-alive | attack |
| 227 | 작은 회복약 | 도구 | 무속성 | INCREASE_HP / — | — / — | 5 / 0 | 0 / 0 | 0 | 확정 단일 | 1 | 14 | any-alive | attack |
| 228 | 회복약 | 도구 | 무속성 | INCREASE_HP / — | — / — | 10 / 0 | 0 / 0 | 0 | 확정 단일 | 3 | 9 | any-alive | attack |
| 229 | 상급 회복약 | 도구 | 무속성 | INCREASE_HP / — | — / — | 15 / 0 | 0 / 0 | 0 | 확정 단일 | 5 | 5 | any-alive | attack |
| 230 | 생명의 물약 | 도구 | 무속성 | INCREASE_HP / — | — / — | 20 / 0 | 0 / 0 | 0 | 확정 단일 | 20 | 2 | any-alive | attack |
| 231 | 작은 마력약 | 도구 | 무속성 | INCREASE_MP / — | — / — | 5 / 0 | 0 / 0 | 0 | 확정 단일 | 1 | 13 | any-alive | attack |
| 232 | 마력약 | 도구 | 무속성 | INCREASE_MP / — | — / — | 10 / 0 | 0 / 0 | 0 | 확정 단일 | 3 | 8 | any-alive | attack |
| 233 | 상급 마력약 | 도구 | 무속성 | INCREASE_MP / — | — / — | 15 / 0 | 0 / 0 | 0 | 확정 단일 | 5 | 4 | any-alive | attack |
| 234 | 천상의 마력약 | 도구 | 무속성 | INCREASE_MP / HEAVEN | — / — | 20 / 0 | 0 / 0 | 0 | 확정 단일 | 20 | 1 | any-alive | attack |
| 235 | 맑은 약초 | 도구 | 무속성 | REMOVE_LOWER_HARMS / — | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 5 | 12 | any-alive | attack |
| 236 | 정화의 물약 | 도구 | 무속성 | REMOVE_ALL_HARMS / — | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 15 | 6 | any-alive | attack |
| 237 | 수상한 열매 | 도구 | 무속성 | INCREASE_OR_DECREASE_HP / — | — / — | 10 / 0 | 0 / 0 | 0 | 확정 단일 | 1 | 2 | any-alive | attack |
| 238 | 힘의 비약 | 도구 | 무속성 | — / INCREASE_ATK | — / — | 0 / 10 | 10 / 0 | 0 | 확정 단일 | 15 | 2 | any-alive | 후속 조합 |
| 239 | 마력의 향 | 도구 | 무속성 | — / MAGIC_FREE | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 5 | 2 | any-alive | 후속 조합 |
| 240 | 망각의 가위 | 도구 | 무속성 | REMOVE_ITEMS / — | — / — | 1 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 3 | any-alive | attack |
| 241 | 침묵의 봉인 | 도구 | 무속성 | REMOVE_ABILITIES / — | — / — | 1 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 3 | any-alive | attack |
| 242 | 수호자의 피리 | 도구 | 무속성 | SET_ASSISTANT / — | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 5 | 3 | any-alive | attack |
| 243 | 별의 실타래 | 도구 | 무속성 | MYSTERY / — | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 3 | 1 | self | attack |
| 244 | 새벽의 씨앗 | 도구 | 무속성 | — / REVIVE | — / — | 10 / 0 | 0 / 0 | 0 | 확정 단일 | 10 | 1 | any-alive | passive |
| 245 | 위험한 그릇 | 도구 | 무속성 | — / MORTAR | — / — | 0 / 0 | 0 / 0 | 0 | 확정 단일 | 0 | 1 | any-alive | passive |
| 246 | 작은 악마 | 이벤트 | 무속성 | ATK / — | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 0 | 0 | any-alive | attack |
| 247 | 붉은 악마 | 이벤트 | 무속성 | ATK / — | — / — | 10 / 0 | 10 / 0 | 0 | 확정 단일 | 0 | 0 | any-alive | attack |
| 248 | 심연의 악마 | 이벤트 | 무속성 | ATK / — | — / — | 15 / 0 | 15 / 0 | 0 | 확정 단일 | 0 | 0 | any-alive | attack |
| 249 | 도둑 정령 | 이벤트 | 무속성 | REMOVE_ITEMS / — | — / — | 1 / 0 | 0 / 0 | 0 | 확정 단일 | 0 | 0 | any-alive | attack |
| 250 | 망각의 정령 | 이벤트 | 무속성 | REMOVE_ABILITIES / — | — / — | 1 / 0 | 0 / 0 | 0 | 확정 단일 | 0 | 0 | any-alive | attack |
| 251 | 생명의 정령 | 이벤트 | 무속성 | INCREASE_HP / — | — / — | 20 / 0 | 0 / 0 | 0 | 확정 단일 | 0 | 0 | any-alive | attack |
| 252 | 마력의 정령 | 이벤트 | 무속성 | INCREASE_MP / — | — / — | 20 / 0 | 0 / 0 | 0 | 확정 단일 | 0 | 0 | any-alive | attack |
| 253 | 황금의 정령 | 이벤트 | 무속성 | INCREASE_YEN / — | — / — | 20 / 0 | 0 / 0 | 0 | 확정 단일 | 0 | 0 | any-alive | attack |
| 254 | 현자의 손톱 | 무기 | 무속성 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 1 | 0 | any-alive | attack |
| 255 | 현자의 낫 | 무기 | 무속성 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 1 | 0 | any-alive | attack |
| 256 | 현자의 쇠사슬 | 무기 | 무속성 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 1 | 0 | any-alive | attack |
| 257 | 현자의 투척검 | 무기 | 무속성 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 1 | 0 | any-alive | attack |
| 258 | 현자의 석궁 | 무기 | 무속성 | ATK / — | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 1 | 0 | any-alive | attack |
| 259 | 현자의 칼날 | 무기 | 무속성 | ATK / — | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 1 | 0 | any-alive | attack |
| 260 | 현자의 도끼 | 무기 | 무속성 | ATK / — | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 1 | 0 | any-alive | attack |
| 261 | 현자의 창 | 무기 | 무속성 | ATK / — | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 1 | 0 | any-alive | attack |
| 262 | 현자의 보검 | 무기 | 무속성 | ATK / — | — / — | 2 / 0 | 2 / 0 | 0 | 확정 단일 | 1 | 0 | any-alive | attack |
| 263 | 현자의 전투봉 | 무기 | 무속성 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 264 | 왕실의 단검 | 무기 | 무속성 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 265 | 왕실의 새총 | 무기 | 무속성 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 266 | 왕실의 곤봉 | 무기 | 무속성 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 267 | 왕실의 숏소드 | 무기 | 무속성 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 268 | 왕실의 손도끼 | 무기 | 무속성 | ATK / — | — / — | 3 / 0 | 3 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 269 | 왕실의 장창 | 무기 | 무속성 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 270 | 왕실의 철퇴 | 무기 | 무속성 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 271 | 왕실의 전투 활 | 무기 | 무속성 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 272 | 왕실의 긴 검 | 무기 | 무속성 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 273 | 왕실의 할버드 | 무기 | 무속성 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 274 | 왕실의 대검 | 무기 | 무속성 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 275 | 왕실의 망치 | 무기 | 무속성 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 276 | 왕실의 쌍검 | 무기 | 무속성 | ATK / — | — / — | 4 / 0 | 4 / 0 | 0 | 확정 단일 | 2 | 0 | any-alive | attack |
| 277 | 왕실의 창날 | 무기 | 무속성 | ATK / — | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 278 | 왕실의 손톱 | 무기 | 무속성 | ATK / — | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 279 | 왕실의 낫 | 무기 | 무속성 | ATK / — | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 280 | 왕실의 쇠사슬 | 무기 | 무속성 | ATK / — | — / — | 5 / 0 | 5 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 281 | 왕실의 투척검 | 무기 | 무속성 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 282 | 왕실의 석궁 | 무기 | 무속성 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 283 | 왕실의 칼날 | 무기 | 무속성 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 284 | 왕실의 도끼 | 무기 | 무속성 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 285 | 왕실의 창 | 무기 | 무속성 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 286 | 왕실의 보검 | 무기 | 무속성 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 287 | 왕실의 전투봉 | 무기 | 무속성 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 288 | 고대의 단검 | 무기 | 무속성 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 289 | 고대의 새총 | 무기 | 무속성 | ATK / — | — / — | 6 / 0 | 6 / 0 | 0 | 확정 단일 | 3 | 0 | any-alive | attack |
| 290 | 고대의 곤봉 | 무기 | 무속성 | ATK / — | — / — | 7 / 0 | 7 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 291 | 고대의 숏소드 | 무기 | 무속성 | ATK / — | — / — | 7 / 0 | 7 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 292 | 고대의 손도끼 | 무기 | 무속성 | ATK / — | — / — | 7 / 0 | 7 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 293 | 고대의 장창 | 무기 | 무속성 | ATK / — | — / — | 7 / 0 | 7 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 294 | 고대의 철퇴 | 무기 | 무속성 | ATK / — | — / — | 7 / 0 | 7 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 295 | 고대의 전투 활 | 무기 | 무속성 | ATK / — | — / — | 7 / 0 | 7 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 296 | 고대의 긴 검 | 무기 | 무속성 | ATK / — | — / — | 8 / 0 | 8 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 297 | 고대의 할버드 | 무기 | 무속성 | ATK / — | — / — | 8 / 0 | 8 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 298 | 고대의 대검 | 무기 | 무속성 | ATK / — | — / — | 8 / 0 | 8 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 299 | 고대의 망치 | 무기 | 무속성 | ATK / — | — / — | 8 / 0 | 8 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 300 | 고대의 쌍검 | 무기 | 무속성 | ATK / — | — / — | 8 / 0 | 8 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 301 | 고대의 창날 | 무기 | 무속성 | ATK / — | — / — | 8 / 0 | 8 / 0 | 0 | 확정 단일 | 4 | 0 | any-alive | attack |
| 302 | 고대의 손톱 | 무기 | 무속성 | ATK / — | — / — | 9 / 0 | 9 / 0 | 0 | 확정 단일 | 5 | 0 | any-alive | attack |
| 303 | 고대의 낫 | 무기 | 무속성 | ATK / — | — / — | 9 / 0 | 9 / 0 | 0 | 확정 단일 | 5 | 0 | any-alive | attack |
| 304 | 고대의 쇠사슬 | 무기 | 무속성 | ATK / — | — / — | 9 / 0 | 9 / 0 | 0 | 확정 단일 | 5 | 0 | any-alive | attack |
| 305 | 고대의 투척검 | 무기 | 무속성 | ATK / — | — / — | 9 / 0 | 9 / 0 | 0 | 확정 단일 | 5 | 0 | any-alive | attack |
| 306 | 고대의 석궁 | 무기 | 무속성 | ATK / — | — / — | 9 / 0 | 9 / 0 | 0 | 확정 단일 | 5 | 0 | any-alive | attack |
| 307 | 고대의 칼날 | 무기 | 무속성 | ATK / — | — / — | 10 / 0 | 10 / 0 | 0 | 확정 단일 | 5 | 0 | any-alive | attack |
| 308 | 고대의 도끼 | 무기 | 무속성 | ATK / — | — / — | 11 / 0 | 11 / 0 | 0 | 확정 단일 | 6 | 0 | any-alive | attack |
| 309 | 고대의 창 | 무기 | 무속성 | ATK / — | — / — | 11 / 0 | 11 / 0 | 0 | 확정 단일 | 6 | 0 | any-alive | attack |
| 310 | 고대의 보검 | 무기 | 무속성 | ATK / — | — / — | 12 / 0 | 12 / 0 | 0 | 확정 단일 | 6 | 0 | any-alive | attack |
| 311 | 고대의 전투봉 | 무기 | 무속성 | ATK / — | — / — | 12 / 0 | 12 / 0 | 0 | 확정 단일 | 6 | 0 | any-alive | attack |
| 312 | 기적 봉쇄의 단검 | 무기 | 무속성 | ATK / — | — / BLOCK_MAGIC | 15 / 0 | 15 / 0 | 0 | 확정 단일 | 10 | 0 | any-alive | attack,defense |
| 313 | 작은 기적 봉쇄의 새총 | 무기 | 무속성 | ATK / — | — / BLOCK_MAGIC | 15 / 0 | 15 / 0 | 0 | 확정 단일 | 10 | 0 | any-alive | attack,defense |
| 314 | 숲 별빛의 곤봉 | 무기 | 숲 | ATK / — | — / — | 1 / 0 | 1 / 0 | 0 | 확정 단일 | 1 | 0 | any-alive | attack |
| 315 | 수호자의 투구 | 방어구 | 무속성 | — / — | DFS / — | 1 / 0 | 0 / 1 | 0 | 확정 단일 | 1 | 0 | any-alive | defense |
| 316 | 수호자의 철갑 | 방어구 | 무속성 | — / — | DFS / — | 1 / 0 | 0 / 1 | 0 | 확정 단일 | 1 | 0 | any-alive | defense |
| 317 | 수호자의 수호 방패 | 방어구 | 무속성 | — / — | DFS / — | 1 / 0 | 0 / 1 | 0 | 확정 단일 | 1 | 0 | any-alive | defense |
| 318 | 수호자의 수호 망토 | 방어구 | 무속성 | — / — | DFS / — | 1 / 0 | 0 / 1 | 0 | 확정 단일 | 1 | 0 | any-alive | defense |
| 319 | 수호자의 보호 장갑 | 방어구 | 무속성 | — / — | DFS / — | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 2 | 0 | any-alive | defense |
| 320 | 수호자의 기사 방패 | 방어구 | 무속성 | — / — | DFS / — | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 2 | 0 | any-alive | defense |
| 321 | 수호자의 판금 갑옷 | 방어구 | 무속성 | — / — | DFS / — | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 2 | 0 | any-alive | defense |
| 322 | 수호자의 수호 반지 | 방어구 | 무속성 | — / — | DFS / — | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 2 | 0 | any-alive | defense |
| 323 | 수호자의 방벽 | 방어구 | 무속성 | — / — | DFS / — | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 2 | 0 | any-alive | defense |
| 324 | 물결 수호자의 흉갑 | 방어구 | 물결 | — / — | DFS / — | 2 / 0 | 0 / 2 | 0 | 확정 단일 | 3 | 0 | any-alive | defense |
| 325 | 수호자의 전투 장화 | 방어구 | 무속성 | — / — | DFS / — | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 3 | 0 | any-alive | defense |
| 326 | 수호자의 방호 부적 | 방어구 | 무속성 | — / — | DFS / — | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 3 | 0 | any-alive | defense |
| 327 | 수호자의 가슴 보호대 | 방어구 | 무속성 | — / — | DFS / — | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 3 | 0 | any-alive | defense |
| 328 | 수호자의 수호 관 | 방어구 | 무속성 | — / — | DFS / — | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 3 | 0 | any-alive | defense |
| 329 | 수호자의 보호 팔찌 | 방어구 | 무속성 | — / — | DFS / — | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 3 | 0 | any-alive | defense |
| 330 | 수호자의 방호복 | 방어구 | 무속성 | — / — | DFS / — | 3 / 0 | 0 / 3 | 0 | 확정 단일 | 3 | 0 | any-alive | defense |
| 331 | 수호자의 큰 방패 | 방어구 | 무속성 | — / — | DFS / — | 4 / 0 | 0 / 4 | 0 | 확정 단일 | 4 | 0 | any-alive | defense |
| 332 | 물결 수호자의 은빛 갑옷 | 방어구 | 물결 | — / — | DFS / — | 4 / 0 | 0 / 4 | 0 | 확정 단일 | 5 | 0 | any-alive | defense |
| 333 | 물결 수호자의 수호 장막 | 방어구 | 물결 | — / — | DFS / — | 4 / 0 | 0 / 4 | 0 | 확정 단일 | 5 | 0 | any-alive | defense |
| 334 | 현자의 나무 방패 | 방어구 | 무속성 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 5 | 0 | any-alive | defense |
| 335 | 현자의 가죽 갑옷 | 방어구 | 무속성 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 5 | 0 | any-alive | defense |
| 336 | 현자의 철 방패 | 방어구 | 무속성 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 5 | 0 | any-alive | defense |
| 337 | 현자의 사슬 갑옷 | 방어구 | 무속성 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 5 | 0 | any-alive | defense |
| 338 | 현자의 원형 방패 | 방어구 | 무속성 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 5 | 0 | any-alive | defense |
| 339 | 현자의 투구 | 방어구 | 무속성 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 5 | 0 | any-alive | defense |
| 340 | 현자의 철갑 | 방어구 | 무속성 | — / — | DFS / — | 5 / 0 | 0 / 5 | 0 | 확정 단일 | 5 | 0 | any-alive | defense |
| 341 | 현자의 수호 방패 | 방어구 | 무속성 | — / — | DFS / — | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 6 | 0 | any-alive | defense |
| 342 | 현자의 수호 망토 | 방어구 | 무속성 | — / — | DFS / — | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 6 | 0 | any-alive | defense |
| 343 | 현자의 보호 장갑 | 방어구 | 무속성 | — / — | DFS / — | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 6 | 0 | any-alive | defense |
| 344 | 현자의 기사 방패 | 방어구 | 무속성 | — / — | DFS / — | 6 / 0 | 0 / 6 | 0 | 확정 단일 | 6 | 0 | any-alive | defense |
| 345 | 현자의 판금 갑옷 | 방어구 | 무속성 | — / — | DFS / — | 7 / 0 | 0 / 7 | 0 | 확정 단일 | 7 | 0 | any-alive | defense |
| 346 | 현자의 수호 반지 | 방어구 | 무속성 | — / — | DFS / — | 7 / 0 | 0 / 7 | 0 | 확정 단일 | 7 | 0 | any-alive | defense |
| 347 | 현자의 방벽 | 방어구 | 무속성 | — / — | DFS / — | 7 / 0 | 0 / 7 | 0 | 확정 단일 | 7 | 0 | any-alive | defense |
| 348 | 현자의 흉갑 | 방어구 | 무속성 | — / — | DFS / — | 7 / 0 | 0 / 7 | 0 | 확정 단일 | 7 | 0 | any-alive | defense |
| 349 | 현자의 전투 장화 | 방어구 | 무속성 | — / — | DFS / — | 7 / 0 | 0 / 7 | 0 | 확정 단일 | 7 | 0 | any-alive | defense |
| 350 | 현자의 방호 부적 | 방어구 | 무속성 | — / — | DFS / — | 8 / 0 | 0 / 8 | 0 | 확정 단일 | 8 | 0 | any-alive | defense |
| 351 | 현자의 가슴 보호대 | 방어구 | 무속성 | — / — | DFS / — | 8 / 0 | 0 / 8 | 0 | 확정 단일 | 8 | 0 | any-alive | defense |
| 352 | 현자의 수호 관 | 방어구 | 무속성 | — / — | DFS / — | 8 / 0 | 0 / 8 | 0 | 확정 단일 | 8 | 0 | any-alive | defense |
| 353 | 현자의 보호 팔찌 | 방어구 | 무속성 | — / — | DFS / — | 9 / 0 | 0 / 9 | 0 | 확정 단일 | 9 | 0 | any-alive | defense |
| 354 | 현자의 방호복 | 방어구 | 무속성 | — / — | DFS / — | 9 / 0 | 0 / 9 | 0 | 확정 단일 | 9 | 0 | any-alive | defense |
| 355 | 현자의 큰 방패 | 방어구 | 무속성 | — / — | DFS / — | 9 / 0 | 0 / 9 | 0 | 확정 단일 | 9 | 0 | any-alive | defense |
| 356 | 현자의 은빛 갑옷 | 방어구 | 무속성 | — / — | DFS / — | 9 / 0 | 0 / 9 | 0 | 확정 단일 | 9 | 0 | any-alive | defense |
| 357 | 현자의 수호 장막 | 방어구 | 무속성 | — / — | DFS / — | 10 / 0 | 0 / 10 | 0 | 확정 단일 | 10 | 0 | any-alive | defense |
| 358 | 왕실의 나무 방패 | 방어구 | 무속성 | — / — | DFS / — | 11 / 0 | 0 / 11 | 0 | 확정 단일 | 10 | 0 | any-alive | defense |
| 359 | 왕실의 가죽 갑옷 | 방어구 | 무속성 | — / — | DFS / — | 11 / 0 | 0 / 11 | 0 | 확정 단일 | 10 | 0 | any-alive | defense |
| 360 | 왕실의 철 방패 | 방어구 | 무속성 | — / — | DFS / — | 11 / 0 | 0 / 11 | 0 | 확정 단일 | 10 | 0 | any-alive | defense |
| 361 | 왕실의 사슬 갑옷 | 방어구 | 무속성 | — / — | DFS / — | 12 / 0 | 0 / 12 | 0 | 확정 단일 | 10 | 0 | any-alive | defense |
| 362 | 왕실의 원형 방패 | 방어구 | 무속성 | — / — | DFS / — | 12 / 0 | 0 / 12 | 0 | 확정 단일 | 10 | 0 | any-alive | defense |
| 363 | 기적 봉쇄의 투구 | 방어구 | 무속성 | — / — | DFS / BLOCK_MAGIC | 12 / 0 | 0 / 12 | 0 | 확정 단일 | 15 | 0 | any-alive | defense |

## 카드별 표시 설명

- **#0 숨 고르기**: 대기. 일반 드로우 제외. 자산: `/assets/original/052.webp`.
- **#1 카드 정리**: 카드 버리기. 일반 드로우 제외. 자산: `/assets/original/053.webp`.
- **#2 환전**: HP·MP·소지금 총합을 보존하여 재분배. 자산: `/assets/original/202.webp`.
- **#3 강제 판매**: 카드 한 장을 골라 상대에게 강제 판매. 자산: `/assets/original/203.webp`.
- **#4 카드 구매**: 상대 카드 무작위 선택 후 구매 확인. 자산: `/assets/original/201.webp`.
- **#5 여행자의 단검**: 공격. 자산: `/assets/original/277.webp`.
- **#6 여행자의 새총**: 공격. 자산: `/assets/original/223.webp`.
- **#7 여행자의 곤봉**: 공격. 자산: `/assets/original/235.webp`.
- **#8 여행자의 숏소드**: 공격. 자산: `/assets/original/261.webp`.
- **#9 연격 손도끼**: 공격 · 추가 공격. 자산: `/assets/original/230.webp`.
- **#10 여행자의 장창**: 공격. 자산: `/assets/original/287.webp`.
- **#11 여행자의 철퇴**: 공격 · 방어. 자산: `/assets/original/288.webp`.
- **#12 연격 전투 활**: 공격 · 추가 공격. 자산: `/assets/original/215.webp`.
- **#13 여행자의 긴 검**: 공격. 자산: `/assets/original/266.webp`.
- **#14 연격 할버드**: 공격 · 추가 공격. 자산: `/assets/original/214.webp`.
- **#15 여행자의 대검**: 공격. 자산: `/assets/original/208.webp`.
- **#16 여행자의 망치**: 공격 · 방어. 자산: `/assets/original/307.webp`.
- **#17 연격 쌍검**: 공격 · 추가 공격. 자산: `/assets/original/212.webp`.
- **#18 여행자의 창날**: 공격. 자산: `/assets/original/241.webp`.
- **#19 여행자의 손톱**: 공격 · 방어. 자산: `/assets/original/308.webp`.
- **#20 무기 튕김의 낫**: 공격 · 무기 무작위 튕겨내기. 자산: `/assets/original/282.webp`.
- **#21 연격 쇠사슬**: 공격 · 추가 공격 · 기적 무작위 튕겨내기. 자산: `/assets/original/298.webp`.
- **#22 여행자의 투척검**: 공격. 자산: `/assets/original/227.webp`.
- **#23 여행자의 석궁**: 공격 · 방어. 자산: `/assets/original/226.webp`.
- **#24 연격 칼날**: 공격 · 추가 공격. 자산: `/assets/original/259.webp`.
- **#25 여행자의 도끼**: 공격. 자산: `/assets/original/239.webp`.
- **#26 흡혈 창**: 공격 · 피해량만큼 HP 흡수. 자산: `/assets/original/234.webp`.
- **#27 기적 봉쇄의 보검**: 공격 · 기적 완전 차단. 자산: `/assets/original/224.webp`.
- **#28 연격 전투봉**: 공격 · 추가 공격. 자산: `/assets/original/276.webp`.
- **#29 사냥꾼의 단검**: 공격. 자산: `/assets/original/279.webp`.
- **#30 지옥병 새총**: 공격 · 지옥병. 자산: `/assets/original/252.webp`.
- **#31 사냥꾼의 곤봉**: 공격 · 방어. 자산: `/assets/original/273.webp`.
- **#32 연격 숏소드**: 공격 · 추가 공격. 자산: `/assets/original/312.webp`.
- **#33 사냥꾼의 손도끼**: 공격. 자산: `/assets/original/304.webp`.
- **#34 감기 장창**: 공격 · 감기. 자산: `/assets/original/296.webp`.
- **#35 연격 철퇴**: 공격 · 추가 공격. 자산: `/assets/original/280.webp`.
- **#36 사냥꾼의 전투 활**: 공격. 자산: `/assets/original/313.webp`.
- **#37 환영 긴 검**: 공격 · 꿈. 자산: `/assets/original/237.webp`.
- **#38 사냥꾼의 할버드**: 공격 · 방어. 자산: `/assets/original/303.webp`.
- **#39 무기 반사의 대검**: 공격 · 무기 되돌리기. 자산: `/assets/original/242.webp`.
- **#40 기적 반사의 망치**: 공격 · 기적 되돌리기. 자산: `/assets/original/233.webp`.
- **#41 사냥꾼의 쌍검**: 공격. 자산: `/assets/original/204.webp`.
- **#42 흡혈 창날**: 공격 · 피해량만큼 HP 흡수. 자산: `/assets/original/283.webp`.
- **#43 먹구름 손톱**: 공격 · 먹구름. 자산: `/assets/original/286.webp`.
- **#44 연격 낫**: 공격 · 추가 공격. 자산: `/assets/original/267.webp`.
- **#45 사냥꾼의 쇠사슬**: 공격. 자산: `/assets/original/281.webp`.
- **#46 환영 투척검**: 공격 · 꿈. 자산: `/assets/original/207.webp`.
- **#47 무소모 석궁**: 공격 · 바로 앞 기적의 MP 비용 면제. 자산: `/assets/original/292.webp`.
- **#48 사냥꾼의 칼날**: 공격. 자산: `/assets/original/316.webp`.
- **#49 감기 도끼**: 공격 · 감기. 자산: `/assets/original/232.webp`.
- **#50 사냥꾼의 창**: 공격 · 방어. 자산: `/assets/original/221.webp`.
- **#51 연격 보검**: 공격 · 추가 공격. 자산: `/assets/original/265.webp`.
- **#52 사냥꾼의 전투봉**: 공격. 자산: `/assets/original/218.webp`.
- **#53 광란 단검**: 공격 · 같은 피해를 자신도 받음. 자산: `/assets/original/251.webp`.
- **#54 기적 봉쇄의 새총**: 공격 · 기적 완전 차단. 자산: `/assets/original/210.webp`.
- **#55 연격 곤봉**: 공격 · 추가 공격 · 기적 완전 차단. 자산: `/assets/original/209.webp`.
- **#56 기사의 숏소드**: 공격. 자산: `/assets/original/257.webp`.
- **#57 마력의 수정검**: 공격 · 남은 MP 전부를 공격력 두 배로 전환. 자산: `/assets/original/271.webp`.
- **#58 화염 기사의 손도끼**: 공격. 자산: `/assets/original/305.webp`.
- **#59 물결 기사의 장창**: 공격. 자산: `/assets/original/309.webp`.
- **#60 숲 기사의 철퇴**: 공격. 자산: `/assets/original/306.webp`.
- **#61 대지 감기 전투 활**: 공격 · 감기. 자산: `/assets/original/302.webp`.
- **#62 빛 연격 긴 검**: 공격 · 추가 공격. 자산: `/assets/original/255.webp`.
- **#63 어둠 기사의 할버드**: 공격. 자산: `/assets/original/216.webp`.
- **#64 화염 기사의 대검**: 공격. 자산: `/assets/original/206.webp`.
- **#65 화염 속성 망치**: 공격 · 속성 덮어쓰기. 자산: `/assets/original/240.webp`.
- **#66 물결 기사의 쌍검**: 공격. 자산: `/assets/original/211.webp`.
- **#67 숲 기사의 창날**: 공격. 자산: `/assets/original/248.webp`.
- **#68 숲 연격 손톱**: 공격 · 추가 공격. 자산: `/assets/original/243.webp`.
- **#69 대지 기사의 낫**: 공격. 자산: `/assets/original/311.webp`.
- **#70 빛 섬광 쇠사슬**: 공격 · 섬광. 자산: `/assets/original/225.webp`.
- **#71 화염 기사의 투척검**: 공격. 자산: `/assets/original/275.webp`.
- **#72 물결 안개 석궁**: 공격 · 안개. 자산: `/assets/original/263.webp`.
- **#73 숲 기사의 칼날**: 공격. 자산: `/assets/original/249.webp`.
- **#74 숲 연격 도끼**: 공격 · 추가 공격. 자산: `/assets/original/236.webp`.
- **#75 빛 기사의 창**: 공격. 자산: `/assets/original/300.webp`.
- **#76 어둠 기사의 보검**: 공격. 자산: `/assets/original/290.webp`.
- **#77 화염 기사의 전투봉**: 공격. 자산: `/assets/original/213.webp`.
- **#78 화염 수호자의 단검**: 공격 · 방어. 자산: `/assets/original/246.webp`.
- **#79 물결 수호자의 새총**: 공격. 자산: `/assets/original/247.webp`.
- **#80 숲 환영 곤봉**: 공격 · 꿈. 자산: `/assets/original/315.webp`.
- **#81 대지 연격 숏소드**: 공격 · 추가 공격. 자산: `/assets/original/268.webp`.
- **#82 빛 수호자의 손도끼**: 공격. 자산: `/assets/original/270.webp`.
- **#83 어둠 수호자의 장창**: 공격. 자산: `/assets/original/217.webp`.
- **#84 화염 연격 철퇴**: 공격 · 추가 공격. 자산: `/assets/original/228.webp`.
- **#85 물결 속성 전투 활**: 공격 · 속성 덮어쓰기. 자산: `/assets/original/274.webp`.
- **#86 숲 수호자의 긴 검**: 공격. 자산: `/assets/original/264.webp`.
- **#87 빛 수호자의 할버드**: 공격. 자산: `/assets/original/253.webp`.
- **#88 어둠 수호자의 대검**: 공격. 자산: `/assets/original/260.webp`.
- **#89 어둠 연격 망치**: 공격 · 추가 공격. 자산: `/assets/original/256.webp`.
- **#90 화염 수호자의 쌍검**: 공격. 자산: `/assets/original/294.webp`.
- **#91 물결 수호자의 창날**: 공격. 자산: `/assets/original/299.webp`.
- **#92 대지 연격 손톱**: 공격 · 추가 공격. 자산: `/assets/original/269.webp`.
- **#93 어둠 수호자의 낫**: 공격. 자산: `/assets/original/289.webp`.
- **#94 화염 연격 쇠사슬**: 공격 · 추가 공격. 자산: `/assets/original/258.webp`.
- **#95 물결 연격 투척검**: 공격 · 추가 공격. 자산: `/assets/original/301.webp`.
- **#96 빛 수호자의 석궁**: 공격. 자산: `/assets/original/291.webp`.
- **#97 어둠 수호자의 칼날**: 공격. 자산: `/assets/original/293.webp`.
- **#98 대지 수호자의 도끼**: 공격. 자산: `/assets/original/222.webp`.
- **#99 운명의 방망이**: 공격 · 위험한 그릇 소유자에게 999 피해 · 없으면 무작위 대상. 자산: `/assets/original/205.webp`.
- **#100 화염 수호자의 창**: 공격 · 대상별 명중 75%. 자산: `/assets/original/245.webp`.
- **#101 어둠 수호자의 보검**: 공격 · 대상별 명중 50%. 자산: `/assets/original/220.webp`.
- **#102 물결 안개 전투봉**: 공격 · 안개 · 대상별 명중 50%. 자산: `/assets/original/262.webp`.
- **#103 숲 흡혈 단검**: 공격 · 피해량만큼 HP 흡수 · 대상별 명중 75%. 자산: `/assets/original/310.webp`.
- **#104 빛 현자의 새총**: 공격 · 대상별 명중 25%. 자산: `/assets/original/250.webp`.
- **#105 화염 현자의 곤봉**: 공격 · 대상별 명중 75%. 자산: `/assets/original/254.webp`.
- **#106 물결 현자의 숏소드**: 공격 · 대상별 명중 75%. 자산: `/assets/original/284.webp`.
- **#107 숲 현자의 손도끼**: 공격 · 대상별 명중 75%. 자산: `/assets/original/295.webp`.
- **#108 대지 현자의 장창**: 공격 · 대상별 명중 75%. 자산: `/assets/original/219.webp`.
- **#109 물결 현자의 철퇴**: 공격 · 대상별 명중 50%. 자산: `/assets/original/314.webp`.
- **#110 대지 현자의 전투 활**: 공격 · 대상별 명중 25%. 자산: `/assets/original/231.webp`.
- **#111 빛 현자의 긴 검**: 공격 · 대상별 명중 75%. 자산: `/assets/original/244.webp`.
- **#112 화염 현자의 할버드**: 공격 · 대상별 명중 75%. 자산: `/assets/original/285.webp`.
- **#113 숲 현자의 대검**: 공격 · 방어 · 대상별 명중 75%. 자산: `/assets/original/272.webp`.
- **#114 물결 현자의 망치**: 공격 · 대상별 명중 50%. 자산: `/assets/original/238.webp`.
- **#115 화염 현자의 쌍검**: 공격 · 대상별 명중 50%. 자산: `/assets/original/229.webp`.
- **#116 대지 현자의 창날**: 공격 · 대상별 명중 25%. 자산: `/assets/original/278.webp`.
- **#117 황혼의 유언**: 공격 · 사망 시 빛 30 · 적 전체 75% · 대상별 명중 75%. 자산: `/assets/original/297.webp`.
- **#118 여행자의 나무 방패**: 방어. 자산: `/assets/original/173.webp`.
- **#119 기적 튕김의 가죽 갑옷**: 방어 · 기적 무작위 튕겨내기. 자산: `/assets/original/169.webp`.
- **#120 여행자의 철 방패**: 방어. 자산: `/assets/original/153.webp`.
- **#121 기적 튕김의 사슬 갑옷**: 방어 · 기적 무작위 튕겨내기. 자산: `/assets/original/170.webp`.
- **#122 화염 여행자의 원형 방패**: 방어. 자산: `/assets/original/132.webp`.
- **#123 물결 여행자의 투구**: 방어. 자산: `/assets/original/108.webp`.
- **#124 숲 여행자의 철갑**: 방어. 자산: `/assets/original/147.webp`.
- **#125 대지 여행자의 수호 방패**: 방어. 자산: `/assets/original/167.webp`.
- **#126 여행자의 수호 망토**: 방어. 자산: `/assets/original/163.webp`.
- **#127 기적 튕김의 보호 장갑**: 방어 · 기적 무작위 튕겨내기. 자산: `/assets/original/171.webp`.
- **#128 화염 여행자의 기사 방패**: 방어. 자산: `/assets/original/131.webp`.
- **#129 물결 여행자의 판금 갑옷**: 방어. 자산: `/assets/original/107.webp`.
- **#130 숲 여행자의 수호 반지**: 방어. 자산: `/assets/original/143.webp`.
- **#131 대지 여행자의 방벽**: 방어. 자산: `/assets/original/124.webp`.
- **#132 여행자의 흉갑**: 방어. 자산: `/assets/original/148.webp`.
- **#133 연격 전투 장화**: 추가 공격 · 방어. 자산: `/assets/original/158.webp`.
- **#134 기적 튕김의 방호 부적**: 방어 · 기적 무작위 튕겨내기. 자산: `/assets/original/172.webp`.
- **#135 화염 여행자의 가슴 보호대**: 방어. 자산: `/assets/original/120.webp`.
- **#136 물결 여행자의 수호 관**: 방어. 자산: `/assets/original/134.webp`.
- **#137 숲 여행자의 보호 팔찌**: 방어. 자산: `/assets/original/128.webp`.
- **#138 대지 여행자의 방호복**: 방어. 자산: `/assets/original/142.webp`.
- **#139 여행자의 큰 방패**: 방어. 자산: `/assets/original/103.webp`.
- **#140 기적 튕김의 은빛 갑옷**: 방어 · 기적 무작위 튕겨내기. 자산: `/assets/original/168.webp`.
- **#141 화염 여행자의 수호 장막**: 방어. 자산: `/assets/original/122.webp`.
- **#142 물결 사냥꾼의 나무 방패**: 방어. 자산: `/assets/original/135.webp`.
- **#143 숲 사냥꾼의 가죽 갑옷**: 방어. 자산: `/assets/original/130.webp`.
- **#144 대지 사냥꾼의 철 방패**: 방어. 자산: `/assets/original/113.webp`.
- **#145 사냥꾼의 사슬 갑옷**: 방어. 자산: `/assets/original/162.webp`.
- **#146 연격 원형 방패**: 추가 공격 · 방어. 자산: `/assets/original/157.webp`.
- **#147 화염 사냥꾼의 투구**: 방어. 자산: `/assets/original/123.webp`.
- **#148 물결 사냥꾼의 철갑**: 방어. 자산: `/assets/original/136.webp`.
- **#149 숲 사냥꾼의 수호 방패**: 방어. 자산: `/assets/original/137.webp`.
- **#150 대지 사냥꾼의 수호 망토**: 방어. 자산: `/assets/original/112.webp`.
- **#151 사냥꾼의 보호 장갑**: 방어. 자산: `/assets/original/119.webp`.
- **#152 기적 봉쇄의 기사 방패**: 방어 · 기적 완전 차단. 자산: `/assets/original/116.webp`.
- **#153 무소모 판금 갑옷**: 바로 앞 기적의 MP 비용 면제 · 방어. 자산: `/assets/original/165.webp`.
- **#154 화염 사냥꾼의 수호 반지**: 방어. 자산: `/assets/original/121.webp`.
- **#155 물결 사냥꾼의 방벽**: 방어. 자산: `/assets/original/133.webp`.
- **#156 숲 사냥꾼의 흉갑**: 방어. 자산: `/assets/original/152.webp`.
- **#157 대지 사냥꾼의 전투 장화**: 방어. 자산: `/assets/original/111.webp`.
- **#158 빛 사냥꾼의 방호 부적**: 방어. 자산: `/assets/original/160.webp`.
- **#159 사냥꾼의 가슴 보호대**: 방어. 자산: `/assets/original/129.webp`.
- **#160 연격 수호 관**: 추가 공격 · 방어. 자산: `/assets/original/156.webp`.
- **#161 화염 사냥꾼의 보호 팔찌**: 방어. 자산: `/assets/original/110.webp`.
- **#162 물결 사냥꾼의 방호복**: 방어. 자산: `/assets/original/175.webp`.
- **#163 대지 사냥꾼의 큰 방패**: 방어. 자산: `/assets/original/114.webp`.
- **#164 사냥꾼의 은빛 갑옷**: 방어. 자산: `/assets/original/149.webp`.
- **#165 기적 봉쇄의 수호 장막**: 방어 · 기적 완전 차단. 자산: `/assets/original/117.webp`.
- **#166 화염 기사의 나무 방패**: 방어. 자산: `/assets/original/109.webp`.
- **#167 물결 기사의 가죽 갑옷**: 방어. 자산: `/assets/original/174.webp`.
- **#168 숲 기사의 철 방패**: 방어. 자산: `/assets/original/146.webp`.
- **#169 기사의 사슬 갑옷**: 방어. 자산: `/assets/original/178.webp`.
- **#170 작은 연격 원형 방패**: 추가 공격 · 방어. 자산: `/assets/original/159.webp`.
- **#171 기적 반사의 투구**: 방어 · 기적 되돌리기. 자산: `/assets/original/125.webp`.
- **#172 무소모 철갑**: 바로 앞 기적의 MP 비용 면제 · 방어. 자산: `/assets/original/166.webp`.
- **#173 기사의 수호 방패**: 방어. 자산: `/assets/original/180.webp`.
- **#174 기적 반사의 수호 망토**: 방어 · 기적 되돌리기. 자산: `/assets/original/126.webp`.
- **#175 화염 기사의 보호 장갑**: 방어 · 열병. 자산: `/assets/original/154.webp`.
- **#176 빛 기사의 기사 방패**: 방어. 자산: `/assets/original/145.webp`.
- **#177 기사의 판금 갑옷**: 방어. 자산: `/assets/original/118.webp`.
- **#178 기적 반사의 수호 반지**: 방어 · 기적 되돌리기. 자산: `/assets/original/127.webp`.
- **#179 기사의 방벽**: 방어. 자산: `/assets/original/161.webp`.
- **#180 무소모 흉갑**: 바로 앞 기적의 MP 비용 면제 · 방어. 자산: `/assets/original/164.webp`.
- **#181 화염 기사의 전투 장화**: 방어. 자산: `/assets/original/138.webp`.
- **#182 기적 봉쇄의 방호 부적**: 방어 · 기적 완전 차단. 자산: `/assets/original/105.webp`.
- **#183 기적 봉쇄의 가슴 보호대**: 방어 · 기적 완전 차단. 자산: `/assets/original/106.webp`.
- **#184 숲 환영 수호 관**: 방어 · 꿈. 자산: `/assets/original/181.webp`.
- **#185 기적 봉쇄의 보호 팔찌**: 방어 · 기적 완전 차단. 자산: `/assets/original/104.webp`.
- **#186 기사의 방호복**: 방어. 자산: `/assets/original/140.webp`.
- **#187 화염 기사의 큰 방패**: 공격 · 받은 피해를 기준으로 반격 · 대상별 명중 75%. 자산: `/assets/original/141.webp`.
- **#188 물결 안개 은빛 갑옷**: ADD_HARM · 안개 · 받은 피해를 기준으로 반격. 자산: `/assets/original/176.webp`.
- **#189 숲 환영 수호 장막**: ADD_HARM · 꿈 · 받은 피해를 기준으로 반격. 자산: `/assets/original/151.webp`.
- **#190 대지 수호자의 나무 방패**: 공격 · 받은 피해를 기준으로 반격. 자산: `/assets/original/115.webp`.
- **#191 빛 섬광 가죽 갑옷**: ADD_HARM · 섬광 · 받은 피해를 기준으로 반격. 자산: `/assets/original/179.webp`.
- **#192 어둠 먹구름 철 방패**: ADD_HARM · 먹구름 · 받은 피해를 기준으로 반격. 자산: `/assets/original/150.webp`.
- **#193 수호자의 사슬 갑옷**: MP 회복 · 받은 피해를 기준으로 반격. 자산: `/assets/original/139.webp`.
- **#194 수호자의 원형 방패**: 소지금 흡수 · 부족분 MP→HP · 받은 피해를 기준으로 반격. 자산: `/assets/original/144.webp`.
- **#195 정화의 깃**: 공격 속성 제거. 자산: `/assets/original/155.webp`.
- **#196 거울의 파편**: 공격 되돌리기. 자산: `/assets/original/177.webp`.
- **#197 불씨**: 공격 · 추가 공격 · MP 2, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/068.webp`.
- **#198 물의 화살**: 공격 · MP 2, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/079.webp`.
- **#199 덩굴 채찍**: 공격 · MP 3, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/087.webp`.
- **#200 눈부신 섬광**: 공격 · 섬광 · 대상별 명중 25% · MP 3, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/066.webp`.
- **#201 안개 부르기**: ADD_HARM · 안개 · MP 3, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/078.webp`.
- **#202 작은 정화**: 감기·열병·안개·섬광 해제 · MP 3, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/083.webp`.
- **#203 바위 낙하**: 공격 · MP 4, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/071.webp`.
- **#204 불꽃 비**: 공격 · 대상별 명중 75% · MP 4, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/077.webp`.
- **#205 별빛 소나기**: 공격 · 대상별 명중 25% · MP 4, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/075.webp`.
- **#206 화염구**: 공격 · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/069.webp`.
- **#207 어둠의 손길**: 공격 · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/091.webp`.
- **#208 먹구름 부르기**: ADD_HARM · 먹구름 · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/063.webp`.
- **#209 확산의 주문**: 적 전체 공격 · 무속성 전환 · 대상별 명중 100% · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/086.webp`.
- **#210 마법 튕기기**: 기적 무작위 튕겨내기 · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/084.webp`.
- **#211 완전한 정화**: 모든 재앙 해제 · MP 5, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/090.webp`.
- **#212 감기 주문**: ADD_HARM · 감기 · MP 6, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/076.webp`.
- **#213 꿈의 장막**: ADD_HARM · 꿈 · MP 6, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/067.webp`.
- **#214 증폭의 주문**: 공격력 두 배 · MP 6, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/064.webp`.
- **#215 무기 봉쇄**: 무기 완전 차단 · MP 6, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/073.webp`.
- **#216 회복의 빛**: HP 회복 · MP 6, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/072.webp`.
- **#217 빛의 창**: 공격 · 추가 공격 · MP 7, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/085.webp`.
- **#218 파도 폭풍**: 공격 · 대상별 명중 75% · MP 7, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/082.webp`.
- **#219 지진**: 공격 · 대상별 명중 50% · MP 8, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/065.webp`.
- **#220 금빛 소원**: 소지금 획득 · MP 8, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/092.webp`.
- **#221 생명의 광선**: 공격 · 피해량만큼 HP 흡수 · MP 10, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/080.webp`.
- **#222 빙하의 창**: 공격 · MP 12, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/088.webp`.
- **#223 화염 폭풍**: 공격 · 대상별 명중 75% · MP 12, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/081.webp`.
- **#224 천국의 초대**: ADD_HARM · 천국병 · MP 15, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/089.webp`.
- **#225 수호자 강림**: 무작위 수호자 소환 · HP 20 · MP 20, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/074.webp`.
- **#226 대해일**: 공격 · 대상별 명중 75% · MP 30, 획득 후 반복 사용, 보유 공간 1칸. 자산: `/assets/original/070.webp`.
- **#227 작은 회복약**: HP 회복. 자산: `/assets/original/191.webp`.
- **#228 회복약**: HP 회복. 자산: `/assets/original/187.webp`.
- **#229 상급 회복약**: HP 회복. 자산: `/assets/original/193.webp`.
- **#230 생명의 물약**: HP 회복. 자산: `/assets/original/183.webp`.
- **#231 작은 마력약**: MP 회복. 자산: `/assets/original/189.webp`.
- **#232 마력약**: MP 회복. 자산: `/assets/original/185.webp`.
- **#233 상급 마력약**: MP 회복. 자산: `/assets/original/192.webp`.
- **#234 천상의 마력약**: MP 회복 · 천국병. 자산: `/assets/original/197.webp`.
- **#235 맑은 약초**: 감기·열병·안개·섬광 해제. 자산: `/assets/original/190.webp`.
- **#236 정화의 물약**: 모든 재앙 해제. 자산: `/assets/original/186.webp`.
- **#237 수상한 열매**: 50%로 HP +10 또는 피해 10. 자산: `/assets/original/184.webp`.
- **#238 힘의 비약**: 추가 공격. 자산: `/assets/original/199.webp`.
- **#239 마력의 향**: 바로 앞 기적의 MP 비용 면제. 자산: `/assets/original/194.webp`.
- **#240 망각의 가위**: 상대 일반 카드 1장 제거. 자산: `/assets/original/200.webp`.
- **#241 침묵의 봉인**: 상대 영구 기적 1개 제거. 자산: `/assets/original/188.webp`.
- **#242 수호자의 피리**: 무작위 수호자 소환 · HP 20. 자산: `/assets/original/195.webp`.
- **#243 별의 실타래**: 열 가지 운명 중 무작위 발동. 자산: `/assets/original/198.webp`.
- **#244 새벽의 씨앗**: 사망 직전 HP 10 부활. 자산: `/assets/original/196.webp`.
- **#245 위험한 그릇**: 특수 공격의 표적 · 버릴 수 없음. 자산: `/assets/original/182.webp`.
- **#246 작은 악마**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#247 붉은 악마**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#248 심연의 악마**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#249 도둑 정령**: 상대 일반 카드 1장 제거. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#250 망각의 정령**: 상대 영구 기적 1개 제거. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#251 생명의 정령**: HP 회복. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#252 마력의 정령**: MP 회복. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#253 황금의 정령**: 소지금 획득. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#254 현자의 손톱**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#255 현자의 낫**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#256 현자의 쇠사슬**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#257 현자의 투척검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#258 현자의 석궁**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#259 현자의 칼날**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#260 현자의 도끼**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#261 현자의 창**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#262 현자의 보검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#263 현자의 전투봉**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#264 왕실의 단검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#265 왕실의 새총**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#266 왕실의 곤봉**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#267 왕실의 숏소드**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#268 왕실의 손도끼**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#269 왕실의 장창**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#270 왕실의 철퇴**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#271 왕실의 전투 활**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#272 왕실의 긴 검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#273 왕실의 할버드**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#274 왕실의 대검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#275 왕실의 망치**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#276 왕실의 쌍검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#277 왕실의 창날**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#278 왕실의 손톱**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#279 왕실의 낫**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#280 왕실의 쇠사슬**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#281 왕실의 투척검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#282 왕실의 석궁**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#283 왕실의 칼날**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#284 왕실의 도끼**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#285 왕실의 창**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#286 왕실의 보검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#287 왕실의 전투봉**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#288 고대의 단검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#289 고대의 새총**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#290 고대의 곤봉**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#291 고대의 숏소드**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#292 고대의 손도끼**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#293 고대의 장창**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#294 고대의 철퇴**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#295 고대의 전투 활**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#296 고대의 긴 검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#297 고대의 할버드**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#298 고대의 대검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#299 고대의 망치**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#300 고대의 쌍검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#301 고대의 창날**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#302 고대의 손톱**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#303 고대의 낫**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#304 고대의 쇠사슬**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#305 고대의 투척검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#306 고대의 석궁**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#307 고대의 칼날**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#308 고대의 도끼**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#309 고대의 창**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#310 고대의 보검**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#311 고대의 전투봉**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#312 기적 봉쇄의 단검**: 공격 · 기적 완전 차단. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#313 작은 기적 봉쇄의 새총**: 공격 · 기적 완전 차단. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#314 숲 별빛의 곤봉**: 공격. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#315 수호자의 투구**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#316 수호자의 철갑**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#317 수호자의 수호 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#318 수호자의 수호 망토**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#319 수호자의 보호 장갑**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#320 수호자의 기사 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#321 수호자의 판금 갑옷**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#322 수호자의 수호 반지**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#323 수호자의 방벽**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#324 물결 수호자의 흉갑**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#325 수호자의 전투 장화**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#326 수호자의 방호 부적**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#327 수호자의 가슴 보호대**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#328 수호자의 수호 관**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#329 수호자의 보호 팔찌**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#330 수호자의 방호복**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#331 수호자의 큰 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#332 물결 수호자의 은빛 갑옷**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#333 물결 수호자의 수호 장막**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#334 현자의 나무 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#335 현자의 가죽 갑옷**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#336 현자의 철 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#337 현자의 사슬 갑옷**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#338 현자의 원형 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#339 현자의 투구**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#340 현자의 철갑**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#341 현자의 수호 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#342 현자의 수호 망토**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#343 현자의 보호 장갑**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#344 현자의 기사 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#345 현자의 판금 갑옷**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#346 현자의 수호 반지**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#347 현자의 방벽**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#348 현자의 흉갑**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#349 현자의 전투 장화**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#350 현자의 방호 부적**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#351 현자의 가슴 보호대**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#352 현자의 수호 관**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#353 현자의 보호 팔찌**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#354 현자의 방호복**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#355 현자의 큰 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#356 현자의 은빛 갑옷**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#357 현자의 수호 장막**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#358 왕실의 나무 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#359 왕실의 가죽 갑옷**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#360 왕실의 철 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#361 왕실의 사슬 갑옷**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#362 왕실의 원형 방패**: 방어. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.
- **#363 기적 봉쇄의 투구**: 방어 · 기적 완전 차단. 일반 드로우 제외. 자산: `/assets/card-placeholder.svg`.

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

| CSV 전체 ID | 원본 종류 내부 ID | 수호자 | attackKind | attackExtra | 속성 | 수치 | 명중% | 가중치 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 0 | MARS | ATK | — | 화염 | 2 | 75 | 6 |
| 1 | 1 | MARS | ATK | — | 화염 | 3 | 75 | 5 |
| 2 | 2 | MARS | ATK | — | 화염 | 4 | 75 | 4 |
| 3 | 3 | MARS | ATK | — | 화염 | 5 | 75 | 3 |
| 4 | 4 | MARS | ATK | — | 화염 | 6 | 75 | 2 |
| 5 | 0 | MERCURY | ATK | FOG | 물결 | 1 | 50 | 6 |
| 6 | 1 | MERCURY | ATK | FOG | 물결 | 2 | 확정 단일 | 5 |
| 7 | 2 | MERCURY | ATK | — | 물결 | 2 | 50 | 4 |
| 8 | 3 | MERCURY | ATK | — | 물결 | 3 | 확정 단일 | 3 |
| 9 | 4 | MERCURY | ATK | — | 물결 | 6 | 50 | 2 |
| 10 | 0 | JUPITER | ATK | — | 숲 | 1 | 확정 단일 | 6 |
| 11 | 1 | JUPITER | ATK | — | 숲 | 2 | 확정 단일 | 5 |
| 12 | 2 | JUPITER | ATK | ABSORB_HP | 숲 | 1 | 75 | 4 |
| 13 | 3 | JUPITER | ADD_HARM | ILLUSION | 숲 | 0 | 확정 단일 | 3 |
| 14 | 4 | JUPITER | ATK | ILLUSION | 숲 | 2 | 75 | 2 |
| 15 | 0 | SATURN | ATK | — | 대지 | 3 | 확정 단일 | 6 |
| 16 | 1 | SATURN | ATK | — | 대지 | 5 | 확정 단일 | 5 |
| 17 | 2 | SATURN | ATK | — | 대지 | 7 | 확정 단일 | 4 |
| 18 | 3 | SATURN | ATK | — | 대지 | 10 | 확정 단일 | 3 |
| 19 | 4 | SATURN | ATK | — | 대지 | 16 | 확정 단일 | 2 |
| 20 | 0 | URANUS | ATK | — | 빛 | 2 | 확정 단일 | 6 |
| 21 | 1 | URANUS | ATK | — | 빛 | 4 | 25 | 5 |
| 22 | 2 | URANUS | ADD_HARM | GLORY | 빛 | 0 | 확정 단일 | 4 |
| 23 | 3 | URANUS | ATK | ABSORB_HP | 빛 | 5 | 확정 단일 | 3 |
| 24 | 4 | URANUS | ATK | — | 빛 | 10 | 75 | 2 |
| 25 | 0 | PLUTO | ATK | DARK_CLOUD | 어둠 | 1 | 25 | 6 |
| 26 | 1 | PLUTO | ATK | — | 어둠 | 1 | 확정 단일 | 5 |
| 27 | 2 | PLUTO | ATK | — | 어둠 | 2 | 확정 단일 | 4 |
| 28 | 3 | PLUTO | ATK | — | 어둠 | 4 | 확정 단일 | 3 |
| 29 | 4 | PLUTO | ATK | — | 어둠 | 8 | 확정 단일 | 2 |
| 30 | 0 | NEPTUNE | REMOVE_ALL_HARMS | — | 무속성 | 0 | 확정 단일 | 6 |
| 31 | 1 | NEPTUNE | INCREASE_MP | — | 무속성 | 5 | 확정 단일 | 5 |
| 32 | 2 | NEPTUNE | INCREASE_HP | — | 무속성 | 5 | 확정 단일 | 4 |
| 33 | 3 | NEPTUNE | INCREASE_MP | — | 무속성 | 10 | 확정 단일 | 3 |
| 34 | 4 | NEPTUNE | INCREASE_HP | — | 무속성 | 10 | 확정 단일 | 2 |
| 35 | 0 | VENUS | SCATTER_YEN | — | 무속성 | 1 | 확정 단일 | 6 |
| 36 | 1 | VENUS | INCREASE_YEN | TO_ENEMY | 무속성 | 5 | 확정 단일 | 5 |
| 37 | 2 | VENUS | ABSORB_YEN | — | 무속성 | 3 | 확정 단일 | 4 |
| 38 | 3 | VENUS | INCREASE_YEN | — | 무속성 | 8 | 확정 단일 | 3 |
| 39 | 4 | VENUS | INCREASE_YEN | — | 무속성 | 20 | 확정 단일 | 2 |
| 40 | 0 | EARTH | ADD_ITEM | — | 무속성 | 0 | 확정 단일 | 1 |
| 41 | 0 | MOON | ATK | — | 무속성 | 10 | 확정 단일 | 1 |

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
