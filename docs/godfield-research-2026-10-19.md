# God Field 조사와 구현 근거 — 2026-10-19

이 조사는 현행 공식 사이트의 공개 HTML·배포 JavaScript·한국어 설명 파일, 나무위키, 기존 `godfilld` 소스를 비교한 결과입니다. 서버 소스를 획득하거나 공식 서버의 게임 판정을 재현한 조사는 아닙니다.

## 출처와 실제로 확인한 내용

| 출처                                                                                                       | 근거                                                                                            | 확인 범위                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [공식 한국어 페이지](https://godfield.net/?lang=ko)                                                        | HTML의 `description`, `#container`, `#main`, script 태그                                        | 최대 9인 카드 배틀 소개, 1080×720 기본 컨테이너, `main.dart.js` 로드, Firebase 12.17.1 app/auth/firestore 모듈 import                                   |
| [공개 배포 번들](https://godfield.net/main.dart.js)                                                        | `signInAnonymously`, `getFirestore`, `onSnapshot`, `create-room`, Cloud Functions URL 조립 코드 | 익명 인증 호출, 문서 구독 및 JSON API 요청 경로가 존재. 문자열만으로 모든 요청의 실제 실행이나 서버 검증을 단정하지 않음                                |
| [공식 한국어 설명 파일](https://godfield.net/i18n/ko.json)                                                 | `texts.reference`, `texts.elementDescriptions`, `texts.alerts`의 JSON 키                        | 반복 사용 기적과 MP 소비, 사용한 기적의 거래 제외, 종말 수취 시 악마 25%, 수호신 행동 25%, 빛 공격 방어 불가, 어둠 피해 시 HP 0, 무기 보유 시 기도 불가 |
| [나무위키 갓필드](https://namu.wiki/w/%EA%B0%93%ED%95%84%EB%93%9C)                                         | 「게임 방식」·「스탯」·「행동」·「종말의 시간」                                                 | 이용자 작성 규칙 요약. 초기 HP 40 / MP 10 / 금 20, 상한 99, 2~9인 훈련, 비밀 결투·랭크전 소개. 문서 표시 수정 시각은 2026-10-14 08:35:44                |
| [REA](https://github.com/morluto/rea)                                                                      | 저장소 `e4c3d72396bf925a45724ce8b18b238b0d23d787`, 배포 CLI `rea-agents@6.7.0`                  | 공개 번들의 정적 분석과 브라우저 시나리오 관찰에 사용. 저장소 main과 npm 배포 버전은 같은 소스라고 가정하지 않음                                        |
| [기존 프로젝트](https://github.com/lIlIlIIlIIlIIlI/godfilld/tree/1bf1fb00e8e6d0548878b6e8538dc6f2d69077bb) | `server/src/game`, `rooms/RoomService.ts`, `network/server.ts`, `client/src`                    | 이미 구현된 독립 서버 엔진·AI·WebSocket·저장·클라이언트를 유지하고 확장                                                                                 |

파일 크기·SHA-256·번들 코드 위치·공식 설명의 짧은 인용은 [source-observations.json](evidence/source-observations.json)에 보관했습니다. 전체 원본 번들·나무위키 본문을 새로 배포하지 않았습니다. 나무위키는 이용자 자료이며 공식 설명과 독립적으로 평가했습니다.

## 구조와 동작

공식 HTML은 외곽 컨테이너를 제공하고, Dart를 JavaScript로 컴파일한 `main.dart.js`가 화면을 구성합니다. 번들에는 `/i18n/<언어>.json`을 읽는 코드가 있습니다. 로그인 경계는 Firebase 익명 인증이며, 관찰한 API 래퍼는 인증 토큰과 JSON 요청을 `https://asia-northeast1-godfield.cloudfunctions.net/<함수명>`으로 전달합니다. `create-room` 호출과 Firestore `onSnapshot` 구독 코드가 있습니다.

따라서 **화면·언어 파일 + 인증 + 서버 요청 + 문서 구독**이라는 클라이언트 구조는 확인됩니다. 공식 서버가 어떤 트랜잭션·난수·매칭·부정행위 방지를 사용하는지는 공개 클라이언트만으로 확정할 수 없습니다. 본 프로젝트는 Firebase 계정이나 원본 API에 의존하지 않고, 기존 Node.js 서버가 판정을 수행하고 각 사용자에게 공개 상태와 자신의 손패만 WebSocket으로 보냅니다.

게임은 공격자가 카드와 대상을 정하고, 대상이 방어 또는 용서를 선택한 뒤, 피해·탈락·보충을 처리하고 다음 차례로 이동하는 카드 배틀입니다. 기적은 MP를 지불해 반복 사용하며, 거래·환전·재앙·수호신·종말이 전투에 영향을 줍니다. 각 판정의 프로젝트 구현은 [game-rules.md](game-rules.md)와 엔진 소스에서 확인할 수 있습니다.

## REA 실행 결과와 한계

실제로 실행한 명령:

```bash
npx --yes --package=rea-agents@6.7.0 rea analyze-javascript-application /workspace/research/godfield-client --format json
npx --yes --package=rea-agents@6.7.0 rea analyze-javascript-application /workspace/research/godfield-client --max-heap-mb 3072 --max-semantic-nodes 2000 --max-semantic-nodes-per-file 2000 --format json
npx --yes --package=rea-agents@6.7.0 rea capture-browser-scenario /workspace/research/official-scenario-connected.json --format json
```

- [첫 정적 Evidence](evidence/rea-static.json): `ev_4d1d1ce0b5279cf46c1584c2e5d4b99405179d3a5abf25f36f167341729721ea`.
- [한도 조정 정적 Evidence](evidence/rea-static-bounded.json): `ev_7e57f46e0a713df727a7f945956816c0ffe7508faaef0072776958fc03b5ded4`.
- 두 정적 실행 모두 파일 인벤토리와 해시를 반환했지만, 각각 1 GiB·3 GiB worker heap 한도에서 파싱을 마치지 못했습니다. `coverage.status = partial`, `parse_status = skipped`입니다. REA가 전체 호출 그래프를 복원했다고 주장하지 않습니다. API 관련 결론은 원본 텍스트의 인용·위치와 HTML·JSON 확인으로 보강했습니다.
- 공식 페이지 브라우저 관찰 Evidence `ev_718b1f56ad6ca9487cdccedf7527bee37fb32550249f16fb74e03229822b798b`: 문서와 Dart/Firebase 모듈 HTTP 200을 확인했습니다. 한국어 JSON 요청은 `net::ERR_NETWORK_CHANGED`로 실패해 빈 `#main`이 남았습니다. 원작 경기 플레이를 관찰했다고 주장하지 않습니다. 같은 JSON은 별도 HTTP 요청으로 정상 수집했습니다.
- 브라우저의 직접 네트워크 연결은 거절돼, 환경에서 제공한 HTTP 프록시를 사용하는 Chromium에 REA를 연결했습니다. 네트워크 보호를 우회하거나 TLS 검증을 끄지 않았습니다.

## 이번 구현과 원작과의 차이

| 항목         | 공식·참고 자료                                   | 프로젝트 동작                                                   |
| ------------ | ------------------------------------------------ | --------------------------------------------------------------- |
| 인원         | 공식 소개 최대 9인, 위키 훈련 2~9인              | **이번에 2~9인 훈련 선택과 최대 9인 개인·팀전 구현**            |
| 초기 능력치  | 위키 40 / 10 / 20, 상한 99                       | 기존 구현과 일치                                                |
| 시작 카드    | 위키 전략의 초반 9장 언급                        | 기존 10장 유지; 완전 복제 아님                                  |
| 기적         | 공식 JSON: MP를 소비해 반복 사용                 | 기존 기적 획득·재사용·MP 검증 유지                              |
| 빛 공격 방어 | 공식 JSON: 어떤 속성도 방어 불가                 | 기존 독립 규칙: 어둠 방어 허용                                  |
| 수호신 행동  | 공식 JSON: 적 턴 뒤 25%                          | 기존 독립 규칙: 30%                                             |
| 종말         | 공식 JSON: 성물 수취마다 악마 25%                | 기존 악마 위험 25%; 구체적 카드 보충 처리 차이는 게임 규칙 참고 |
| 종말 선택    | 위키 1/50/75/100/150/없음                        | 기존 1/50/100/500 유지                                          |
| 악마 피해    | 위키 10/20/30                                    | 기존 5/10/15 유지                                               |
| 통신         | 공식 번들에 HTTP 함수 요청과 Firestore 구독 코드 | 독립 Node.js + WebSocket + SQLite/PostgreSQL                    |
| 랭크전       | 원작에 존재한다는 위키 설명                      | 미구현. 공식 계정·매칭에 연결하지 않음                          |

훈련 인원은 로컬에 기억하고 서버가 같은 값을 검증합니다. AI 수는 선택 인원에서 사람 한 명을 뺀 수이며 재대전에서도 유지됩니다. 서버 엔진·방 정원·일반 방 생성 UI는 같은 최대 인원을 사용합니다. 9인 화면에 맞춰 플레이어 행 높이를 보정하고 8번째 AI 이름을 추가했습니다.

게임 방법 화면에 공식 페이지·공식 한국어 JSON·위키·REA·이 보고서 링크와 주요 규칙 차이를 표시합니다. 기존 게임 기능의 범위는 [README](../README.md)를 참고하세요.

## 배포와 검증

[운영 문서](operations.md)의 Docker Compose 명령으로 Node.js 서버·클라이언트를 함께 실행할 수 있습니다. 단일 인스턴스는 이름 있는 SQLite 볼륨에 저장하고, 여러 인스턴스는 전용 PostgreSQL을 사용해야 합니다. 기존 Vercel 설정도 보존했습니다. GitHub Pages에 정적 파일만 올려서는 WebSocket 서버가 실행되지 않습니다.

GitHub Actions는 테스트·2~9인 100경기·빌드·Docker 이미지 생성과 실제 컨테이너의 HTTP/9인 소켓/재접속 검사를 실행합니다. `dist`에는 클라이언트와 대응 소스 ZIP이 포함됩니다. 이 워크플로는 검증과 빌드 산출물 생성이며 외부 호스팅 자동 게시를 의미하지 않습니다.
