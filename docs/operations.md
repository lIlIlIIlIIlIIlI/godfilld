# 운영 및 배포 지침

## 구성

- Node.js24. SQLite는 로컬 개발·단일 프로세스 실습용.
- PostgreSQL은 운영 필수. `arena_rooms`, `arena_identities` 두 테이블이 초기화됩니다.
- `arena_rooms.data` JSONB에는 비공개 손패·시드·공격 큐·명령도 포함됩니다. DB 덤프를 공개하지 마세요.
- Socket 서버는 `server/src/network/server.ts`, Vercel 진입점은 `api/server.ts`.
- 상태 권위는 DB의 방 단위 잠금 트랜잭션. 프로세스 메모리에는 연결과 마지막 전송 revision만 보관합니다.

## 환경 변수

| 이름            | 용도                                                 | 공개 여부     |
| --------------- | ---------------------------------------------------- | ------------- |
| DATABASE_URL    | 전용 PostgreSQL 연결 URL. 제공자의 TLS·풀링 URL 권장 | 서버 비밀     |
| SQLITE_PATH     | 로컬 SQLite 경로                                     | 서버 설정     |
| PORT            | 로컬 서버 포트, 기본3000                             | 서버 설정     |
| ALLOWED_ORIGINS | 쉼표로 나열한 추가 허용 origin. 기본은 같은 host     | 서버 설정     |
| VITE_WS_URL     | 외부 별도 WS 서버를 쓸 때만 빌드 시 지정             | 브라우저 공개 |

토큰이나 DB URL을 채팅·소스·빌드 로그에 붙여넣지 말고 Vercel의 프로젝트 환경 변수에 직접 설정합니다. DB가 제공하는 `sslmode=require` 등 TLS 정책을 유지합니다. 프로젝트가 초기화에 CREATE TABLE 권한을 쓰므로, 별도 마이그레이션 절차로 분리할 때는 미리 테이블을 생성한 뒤 최소 권한 런타임 계정을 사용하도록 조정할 수 있습니다.

## Vercel 준비 상태

생성된 프로젝트 ID: `prj_M45tAXNv1D4NnqHKEqw1day1FYap`.

계정 범위: `team_aBvh9trNZYl2sGyzMHg4Mchk`. 프로젝트명: `aether-arena`. Node24 / Vite / `npm ci` / `npm run build` / `dist`. ESM import 오류 수정 커밋 `88b0339`의 Preview 배포 `dpl_GCHHe3hb2LWMu9nLQnNoSVyA4VdV`는 READY이며 주소는 https://aether-arena-g1hbk3zvf-nmseu486-8585.vercel.app 입니다. 보호 인증 후 health200(`PostgresStore`)과 방 목록200을 확인했습니다. 정상 플레이 전체를 검증한 것은 아닙니다. Vercel 인증 보호가 켜져 있으므로 로그인 없는 일반 공개 서비스로 운영할 때에는 배포 보호 범위도 확인해야 합니다.

1. `DATABASE_URL` 등 DB 환경 변수가 Production·Preview에 설정되어 있고, Preview DB 초기화·목록 조회가 성공한 상태입니다. Production·Preview가 별도 DB/브랜치를 사용하는지는 추가 확인 대상입니다. 새 환경에서는 Vercel 대시보드에서 전용 Neon DB를 연결하고 앱이 사용하는 `DATABASE_URL`에 풀링 URL을 설정합니다. URL이나 비밀번호를 채팅에 보내지 마세요.
2. 소스 저장소는 [lIlIlIIlIIlIIlI/godfilld](https://github.com/lIlIlIIlIIlIIlI/godfilld)입니다. 서버·클라이언트·데이터·테스트가 저장소 루트에 있습니다.
3. Vercel의 기존 `aether-arena` 프로젝트에서 이 GitHub 저장소를 연결합니다. 루트 디렉터리는 저장소 루트입니다.
4. 테스트 및 빌드 후 Preview로 배포합니다.
5. `/api/health`, WebSocket `/api/ws` 또는 `/api/server`, 서로 다른 두 브라우저의 같은 방 참가를 확인합니다.
6. 두 클라이언트가 서로 다른 인스턴스에 배정된 상태의 동기화·재접속·토큰 복원을 확인합니다.
7. PostgreSQL 복구·비밀 손패 제한·모바일 조작을 확인한 배포만 운영으로 승격합니다.

참고한 현재 [Vercel WebSocket 문서](https://vercel.com/docs/functions/websockets)는 Fluid Compute의 HTTP 서버 export 방식을 안내합니다. 연결은 함수 수명에 따라 종료될 수 있으므로 클라이언트가 지수 backoff 후 재인증·재참가합니다. 이 문서의 지원 내용만으로 실제 계정·프로젝트 배포가 검증된 것은 아닙니다.

운영 호스팅에서 URL rewrite의 요청 경로 보존과 WebSocket upgrade 처리는 반드시 실제 배포에서 검사해야 합니다. 현재 Vercel 통합 검증은 완료되지 않았습니다.

PostgreSQL 어댑터는 인스턴스당 최대5개 연결, 연결 대기10초, 유휴 회수5초를 설정합니다. Vercel에서는 `attachDatabasePool`로 함수 중단 전 유휴 연결 회수를 지원합니다. 이 설정의 빌드·로컬 회귀 검사와 운영 PostgreSQL 접속 검증은 별개이며, 후자는 DB 준비 전까지 미실시입니다.

## 저장·복구·성능

모든 명령의 최신 GameState와 실제 행동 envelope를 한 방 트랜잭션에 저장합니다. SQLite는 BEGIN IMMEDIATE, PostgreSQL은 SELECT FOR UPDATE입니다. 검증 또는 DB 쓰기에 실패하면 롤백합니다. 재접속 인증 토큰은 클라이언트 로컬 저장 공간에 보관하고 서버 DB에는 해시만 저장합니다. 토큰 유출은 조작권 유출이므로 원본 상태 덤프와 함께 공개하지 마세요.

서버 재시작 후 마지막으로 커밋된 손패·현재 방어 대상·구매 확인·난수 상태가 그대로 복원됩니다. 처리했지만 커밋하지 않은 명령은 반영되지 않습니다. 실제 입력 목록과 initialSeed, 시작 플레이어 설정으로 동일 명세 버전에서 재생할 수 있습니다. DB 스키마와 엔진 규칙 변경 시에는 진행 중 경기를 이전 엔진으로 마무리하거나 명시적 마이그레이션이 필요합니다. 자동 버전 마이그레이션은 현재 없습니다.

각 연결 인스턴스는500ms마다 자신이 구독한 방을 읽고, 만료된 턴을 DB 잠금 아래 한 번 처리합니다. 분산 상태 일치를 우선한 초기 방식으로, 방이 많아지면 PostgreSQL LISTEN/NOTIFY나 Redis pub/sub·전담 스케줄러로 읽기 부하를 줄여야 합니다. 무한한 확장성을 검증했다고 주장하지 않습니다.

모든 연결이 사라지거나 함수 인스턴스가 종료되면 타이머는 독립 실행되지 않습니다. 다음 참가자의 연결이 들어오면 저장된 deadline을 기준으로 AI 대행을 이어갑니다. 항상 가동되는 무인 경기·무인 토너먼트가 필요하면 외부 스케줄러가 필요합니다.

방에는 마지막 정상 입장자/참가자의 활동 후120초 유예와 명시적 마지막 퇴장 삭제가 적용됩니다. 입장자(visitors)와 참가자(seats)를 모두 확인합니다. 종료 경기의 별도 영구 아카이브와 사용자/로그의 개별 보관 정책은 없습니다. 초기 운영 전에 종료 경기 보관 기간, 개인정보·토큰 삭제, SQLite 백업 또는 PostgreSQL PITR을 정하고 실제 복구를 훈련해야 합니다. 대규모 부하 테스트는 수행하지 않았습니다.

## 보안 및 장애 시 점검

- 일반·관전 투영을 분리하고 전체 GameState를 네트워크로 보내지 않습니다.
- 한 메시지16KiB 제한, 연결별 요청 제한, 인증 전10초 제한, origin 검사, WebSocket ping/pong.
- 행동 ID·버전·소유권·자신의 차례·조합·MP·대상·환전 범위·방장 권한을 검사합니다.
- 공개 채팅·닉네임은 HTML 이스케이프하며 사용자 HTML을 실행하지 않습니다.
- 현재 요청 제한은 연결별입니다. 대규모 악용 대응을 위한 IP/게스트 생성 제한·서비스 방화벽 설정은 추가 운영 작업입니다.
- 로컬 코드에는 SQLite 데이터를 내보내거나 초기화하는 관리자 공개 엔드포인트가 없습니다.
- DB 오류 시 상태를 전진시키지 않습니다. 연결을 재시도하고 상태를 다시 받아야 합니다. API health가 내려가면 먼저 DB 연결·환경 변수를 점검합니다.

## 소스 공개와 업데이트

`npm run build`는 `scripts/package-source.ts`로 대응 소스 ZIP을 만들어 클라이언트의 `/source.zip`에 포함합니다. 이 ZIP은 서버 코드·데이터·빌드 설정·문서·라이선스를 포함하고 시크릿·node_modules·DB·원본 이미지·SWF는 제외합니다. 종속성은 잠금파일과 개별 패키지 라이선스를 유지합니다. 소스 링크가 실제 배포에서도 내려받아지는지 확인해야 합니다.

서비스의 공개 리플레이는 발생한 공개 이벤트만 보냅니다. 서버 시드를 공개하면 미사용 초기 손패가 복원될 수 있으므로 공개 replay에 포함하지 않습니다.
