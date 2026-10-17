# 구현 및 검증 현황

2026-10-17 / v0.1.0. **실행 가능한 개발 빌드이며 공개 운영 완성판은 아닙니다.**

## 작업 파일

| 범위           | 주요 파일                                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 카드·공유 타입 | shared/types.ts, schemas.ts, catalog.ts / data/cards.json, summons.json, asset-manifest.json, provenance.json                                                                                                            |
| 엔진           | server/src/game/GameEngine.ts, Rules.ts, Random.ts, State.ts, CardRegistry.ts, CombatResolver.ts, DefenseResolver.ts, CardEffectResolver.ts, StatusEffectEngine.ts, TradeManager.ts, SummonManager.ts, EndgameManager.ts |
| AI             | server/src/ai/ActionEvaluator.ts, BotController.ts                                                                                                                                                                       |
| 로비·통신·저장 | server/src/rooms/RoomService.ts, network/server.ts, persistence/Store.ts                                                                                                                                                 |
| HTML5 UI       | client/src/main.ts, style.css, network.ts, audio.ts, animations.ts / client/public/assets/card-placeholder.svg                                                                                                           |
| 배포·실행      | api/server.ts, vercel.json, package.json, package-lock.json, .env.example                                                                                                                                                |
| 분석·명세      | game-system-analysis.md, game-rules.md, card-reference.md, asset-audit.md, asset-inventory.json                                                                                                                          |
| 검사           | tests/engine.test.ts, coverage.test.ts, multiplayer.test.ts, client.test.ts / scripts/simulate.ts                                                                                                                        |
| 운영·공개소스  | README.md, operations.md, LICENSE, NOTICE, scripts/package-source.ts                                                                                                                                                     |

## 구현된 기능

카드364행·수호자42행 보존과 일반 출현244개 필터링, 서버 권위 상태 머신, 공격 큐, 속성·광역·조합·명중·흡수·자해·즉사, 다중 방어·반사·튕김·반격, 기적 획득·재사용·MP 면제, 질병·일반 재앙·해제, 거래·환전·구매 확인, 수호자10종, 운명10분기, 부활·유언·카드 재분배·삭제, 설정형 종말을 구현했습니다.

AI는 공개 관측에서 후보를 평가하고 같은 서버 검증을 통과한 행동만 사용합니다. 세 난이도,2~8인 개인/팀전, 연습전, 로비·방장·준비·봇·비밀번호·초대·관전·채팅, 세션 토큰·재접속·AFK 대행·복귀, SQLite 및 PostgreSQL 저장 어댑터가 있습니다.

새 한국어 UI에서 카드 선택 순서·대상 선택·공격/방어·환전·구매를 실제 명령으로 제출합니다. 카드 도감과 필터, 게임 도움말, 첫 게임에서 카드 선택→대상→사용으로 이어지는 안내, 공개 로그, 모바일 기록/채팅 펼침, 합성 음원과 서버 이벤트 애니메이션을 제공합니다. 원본 이미지는 포함하지 않습니다.

## 실행한 검사

- 규칙·카드 레지스트리·각 직접 사용 카드·상태·AI·저장·실제 소켓·UI 입력 테스트: **348개 통과**(마지막 실행 로그 기준).
- 실제 WebSocket2명: 동시 접속, 준비·시작, 동일 공개 상태, 서로 다른 손패, 중복 행동 거절, 토큰 재접속.
- 실제 WebSocket8명:8개 연결의 동일 공개 경기와 각자10장 손패 분리. rewrite 방식 health 경로 검사.
- SQLite 파일을 닫고 다시 열어 인증·손패·단계 복원. 실제 AI 명령 기록으로 동일 상태 재생.
- DOM 기반 UI 검사: 난이도 선택→연습 요청→카드/대상 선택→서버 엔진의 실제 명령 검증→방어 대기 표시, 채팅 HTML 이스케이프, 도감 검색.
- 최종 AI 자동 대전 **1,000회**, 총 **136,601개 명령**, 최장 **149턴**, **24회 전원 탈락 무승부**.600턴 안전 한도로 종료한 경기는 없습니다. 난이도와 인원2~8명, 일부 팀전을 섞은 결정적 시드1~1000입니다. raw 실행 출력은 simulation-run.log에 있습니다.
- 타입 검사 및 Vite 운영 빌드 통과. 빌드가 대응 소스 ZIP도 생성합니다.

자동 대전 중 발견한 두 오류는 수정했습니다. EARTH의 선물 카드 안에 들어 있는 배율/광역 기적을 실제 조합으로 실행하던 문제, 구매자가 이미 사망했는데 구매 확인을 기다리던 문제입니다. 최종1,000회에서는 예외·미종료·범위 밖 능력치·보유 한도 초과가 검출되지 않았습니다. 이것이 모든 가능한 카드 조합에서 오류가 없다는 증명은 아닙니다.

## 아직 남은 사항

1. **소스 저장소 지정.** 사용자가 제공한 [lIlIlIIlIIlIIlI/godfilld](https://github.com/lIlIlIIlIIlIIlI/godfilld)를 사용합니다. 게임 소스·문서·테스트는 저장소 루트에 배치하며, Vercel 프로젝트와의 Git 연동은 별도 작업입니다.
2. **운영 PostgreSQL 기본 연결 확인, 전체 통합 검사 미완료.** Vercel 권한 재확인 후 팀 접근과 Neon 연동 조회가 성공했습니다. 이후 Production·Preview용 `DATABASE_URL` 등이 설정된 것을 값 노출 없이 확인했습니다. 수정 Preview의 `/api/health`는200과 `PostgresStore`, `/api/rooms`는200과 빈 방 목록을 반환했습니다. 이는 DB 초기화와 목록 조회가 성공했다는 근거이며, 경기 저장·경합·재시작 복구까지 검사한 것은 아닙니다. 다른 프로젝트 DB를 임의 재사용하지 않았습니다.
3. **배포 생성·빌드·기본 API 완료, 전체 대전 검증 미완료.** 최초 배포의 ESM import 오류를 수정하여 서버·공유 코드의 상대 import에 `.js`를 추가하고 JSON import 속성을 명시했습니다. 수정 커밋 `88b0339`의 Preview 배포 `dpl_GCHHe3hb2LWMu9nLQnNoSVyA4VdV`는 READY이고 health·방 목록200을 확인했습니다. 변경 후 최신 병합 의존성에서도348개 테스트와 빌드가 통과했습니다. 보호 인증을 사용한 HTTP 검사이며 실제 WebSocket upgrade·여러 인스턴스 대전·복구와 로그인 없는 공개 접근 검증은 아직 필요합니다. 일반 HTTP GET `/api/ws`404는 WebSocket upgrade 검사 결과가 아닙니다.
4. **실브라우저/모바일 시각 QA 미실시.** DOM 입력 검사는 통과했지만 사용 가능한 browser-control 환경이 없어 실제 화면 스크린샷·터치·오디오·애니메이션을 기기에서 검수하지 못했습니다. 반응형 CSS를 구현했다고 해서 실기기 검증까지 완료한 것은 아닙니다.
5. **원작 규칙 불확실성.** 빛 방어·기적 공간·질병·튕김·종말 차이를 문서화했습니다. G.F. 시작 수치와 악마 피해표는 신규 설정입니다. 공식 원작과 완전 일치한다고 주장하지 않습니다.
6. **리소스·번역.** 원본 리소스 재사용 허가와 개별 ID 매핑 미확인. 한국어는 신규 이름과 효과 설명이며 원작 카드 번역이 아닙니다. 창작 일러스트·본격 BGM·다양한 전투 연출은 추후 개선 대상입니다.
7. **운영 고도화.** 상시 무인 진행 스케줄러, 로그/계정 보관·삭제 정책, 대규모 부하 검증, DB 백업 복구 훈련, IP 수준 악용 방지, 엔진 버전 마이그레이션, 시간축 리플레이 플레이어는 아직 없습니다. 현재 제공하는 것은 공개 이벤트 기록 열람입니다.

## 실행

Node.js24에서 `npm ci → npm run build → npm start` 후 http://localhost:3000 에 접속합니다. `npm test`와 `npm run simulate -- 1000`으로 검사를 재현할 수 있습니다. 기본 실행에는 SQLite가 포함되어 외부 DB 계정이 필요하지 않습니다. PostgreSQL은 운영 배포 시 필요합니다.
