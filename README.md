# 별의 의회 · Aether Arena

갓필드의 카드 전투에서 영감을 받은 독립 HTML5 카드 배틀 게임입니다. TypeScript/Vite 클라이언트, Node.js 서버 권위형 게임 엔진, WebSocket, SQLite 개발 저장, PostgreSQL 운영 저장을 사용합니다. Flash·SWF·Ruffle은 포함하지 않습니다.

현재 버전은 **실행 가능한 개발 빌드**입니다. 원본 규칙의 완전 재현이나 공개 운영 완료 상태가 아닙니다. 검증 범위와 남은 작업은 [진행 현황](docs/progress.md)에 기록합니다.

## 바로 실행

Node.js24, npm이 필요합니다. 별도 계정이나 게임 API키는 필요하지 않습니다.

```bash
npm ci
npm test
npm run build
npm start
```

`http://localhost:3000`에서 접속합니다. **AI와 바로 시작**을 선택하면 사람1명과 AI3명의 경기를 시작합니다. 다른 브라우저/별도 프로필로 같은 서버에 접속하면 멀티플레이할 수 있습니다. 동일 프로필은 같은 재접속 토큰을 사용합니다. 사람마다 별도 브라우저 저장 공간을 사용해 주세요.

일반 방: 방 만들기→친구 참가→준비→방장이 시작. 팀전은 시작 전에 팀을 선택할 수 있습니다. 대전 후 재대전·공개 전투 기록을 볼 수 있습니다. 이름·음량·애니메이션은 설정에서 변경합니다.

개발 중에는 두 터미널에서 다음 명령을 실행합니다.

```bash
npm run dev
npm run dev:client
```

Vite의 `/api` 프록시가 Node 서버3000에 연결됩니다. 기본 SQLite 파일은 `arena.sqlite`, 다른 경로는 `SQLITE_PATH`, 포트는 `PORT`입니다. `.env.example`을 참고하되 실행 환경에서 변수를 직접 설정하거나 `node --env-file=.env --import tsx server/src/index.ts`로 불러오세요. 자동으로 `.env`를 읽는다고 가정하지 않습니다.

## 구현 범위

- 364행 카드·42행 수호자 행동 데이터. 일반 출현244개, 가중치0 제외, ID 보존.
- 공격/방어/구매 확인 상태 머신, 카드 소유권·조합·MP·버전·중복 행동 검사, 실패 원자성.
- 속성·광역·추가 공격·반사·튕김·피해 기준 반격, 기적·상태이상·부활·유언·거래·수호자·열 가지 운명·설정형 종말.
- 세 난이도 AI, 서버의 실제 명령 검사 사용, 공개 관측만 평가.
- 2~8인 로비, 개인/팀전, 준비·방장·봇·비공개·비밀번호·관전·채팅.
- 비밀 토큰 재접속, AFK AI 대행과 복귀, DB 스냅샷·명령 저장, 여러 인스턴스 사이 DB 잠금.
- 한국어 HTML UI, 반응형 CSS, 카드 조합·도감·도움말·첫 게임 안내·로그, 합성 사운드·서버 이벤트 애니메이션.

## 규칙과 분석 문서

- [실제 참고 소스 분석 및 자료 충돌](docs/game-system-analysis.md)
- [채택한 새 게임 규칙](docs/game-rules.md)
- [전체 카드별 데이터와 효과](docs/card-reference.md)
- [자산 권리·ID 매핑 감사](docs/asset-audit.md)
- [실행·배포·장애 복구](docs/operations.md)
- [테스트 결과와 미완료 항목](docs/progress.md)

## 테스트와 자동 대전

```bash
npm test
npm run simulate -- 1000
```

순수 엔진·데이터 커버리지, SQLite 재시작 복구, 실 WebSocket 두 클라이언트의 준비/시작/동기화/중복 입력 거부/재접속을 검사합니다. 시뮬레이션은2~8인, 세 난이도, 일부 팀전의 결정적 시드로 실행합니다. PostgreSQL, 실제 Vercel 런타임과 기기별 브라우저 실사용 검증은 별도입니다.

## 운영 배포

Vercel 프로젝트 `aether-arena`의 최초 GitHub 소스 배포는 READY가 되었고, 인증 후 정적 HTML 응답200을 확인했습니다. 그러나 서버 API는500으로 게임 서비스가 정상 가동되는 상태는 아닙니다. 최초 실행 로그에서 확장자 없는 ESM import 오류를 확인하여 `.js` 경로와 JSON import 속성을 추가했습니다. 전용 PostgreSQL의 `DATABASE_URL`도 아직 필요합니다. Vercel에서는 SQLite로 조용히 대체하지 않고 설정 오류로 중단하도록 했습니다. `/api/server.ts`는 HTTP 서버와 WebSocket 업그레이드를 내보냅니다. 운영 설정·시크릿은 저장소에 넣지 않습니다.

소스 저장소는 [lIlIlIIlIIlIIlI/godfilld](https://github.com/lIlIlIIlIIlIIlI/godfilld)입니다. Vercel의 기존 `aether-arena` 프로젝트에 이 저장소를 연결하며 루트 디렉터리는 저장소 루트입니다. 전용 DB 연결과 공개 배포 검증은 아직 남아 있습니다. 상세 절차는 operations.md를 참고하세요.

## 라이선스와 리소스

AGPL-3.0-only. 참고 데이터의 출처와 고정 커밋은 `data/provenance.json`, 고지는 `NOTICE`, 라이선스 본문은 `LICENSE`에 있습니다. 새 UI 하단의 소스 코드 링크는 빌드 시 생성한 `/source.zip`을 제공합니다. 수정 배포할 때 해당 배포에 대응하는 소스를 다시 빌드해 함께 제공해야 합니다.

원본 클라이언트의 이미지·MP3·SWF·로고·번역 이름은 포함하지 않습니다. 새로 만든 한국어 명칭, Lucide 아이콘, 직접 작성한 벡터 placeholder와 Web Audio 합성을 사용합니다. 원본 이미지 ID 매핑과 재사용 허가는 미확인 상태입니다.
