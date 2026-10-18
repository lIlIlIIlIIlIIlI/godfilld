# 클라이언트 리소스 감사

기준: Igoorx/godfield-flash `fcc83740a3d3cd9968e6e5cd2b7ed781f53abe80`.

## 사용 허가 기록

2026-10-17 사용자가 이 프로젝트에서 원본 카드 이미지와 사운드 사용 허가를 받았다고 확인했습니다. 이 확인에 따라 해당 미디어를 활성화했습니다. 별도 허가 문서나 권리자와의 연락을 독립적으로 검증했다고 주장하지 않습니다. 원본 README Remarks는 클라이언트 자료의 권리가 @guuji에게 있다고 밝힙니다. 미디어를 AGPL로 다시 허가하는 것은 아니며, 애플리케이션 코드의 AGPL과 구분합니다. 허가 근거와 날짜는 `data/asset-manifest.json`에도 기록했습니다.

## 카드 ID와 그림의 실제 대응

Flash를 실행하지 않고 압축 해제하여 SymbolClass 및 DefineBinaryData를 추출했습니다. FFDec로 다음 원본 처리 코드를 읽었습니다.

- `net.godfield.game.ItemData`: CSV 행 순서가 카드 ID입니다.
- `net.godfield.client.game.card.ItemData`: 같은 ID의 표시 데이터 첫 열이 파일명입니다.
- `ItemImage`: `card/{카드 종류 소문자}/{파일명}.png`를 로딩합니다.
- `AssistantItemData`와 `AssistantItemImage`: 수호자별 ID와 `card/assistant/{파일명}.png`를 사용합니다.

내장 `ItemData_CSV`364행을 서버 CSV와 비교해 전 행 일치를 확인했습니다. 내장 `EnglishData_Item`364행으로 파일명을 대응했으며, 파일명 알파벳 순서를 카드 ID로 사용하지 않았습니다.

| 항목                     | 결과                                                     |
| ------------------------ | -------------------------------------------------------- |
| 실제 원본 카드 그림317개 | 80×80 무손실 WebP 개별 파일317개              |
| 일반 카드0~245           | 246개 ID와 원본 파일·해시·좌표 매핑 완료                 |
| 일반 드로우244종         | 전부 원본 그림 제공                                      |
| 나머지118개 데이터       | 모두 출현 가중치0. 백업에 파일이 없으며 기본 이미지 유지 |
| 수호자 행동42종          | 표시 데이터와 이미지 매핑 완료                           |
| 수호자10종               | 초상화 매핑 완료                                         |

예: ID5→`weapon/paper_knife.png`, ID207→`magic/yami.png`. 원본 파일 경로, SHA256, 원본 크기와 개별 이미지 경로는 `data/asset-manifest.json`에 있습니다. 전체 그림은 실제로 열어 크기·형식을 검사하고 최초 합성한 전체 그림 목록도 시각적으로 확인했습니다. 원본317개를 각80×80이미지 중앙에 확대·축소 없이 배치했고 투명도를 보존했습니다. 무손실 WebP를 다시 읽어 각 원본을 중앙 배치한 RGBA와 바이트 일치를 검사했습니다.

`client/public/assets/original/000.webp`부터 개별 파일317개를 제공하며 같은 그림은 같은 URL을 재사용합니다. 지연 로딩과 브라우저 캐싱을 적용하고 손패·도감·상세의 크기에 맞춰 표시합니다. 오류가 발생하면 기본 SVG로 대체하고, 이것도 실패하면 이미지만 숨깁니다. 손패나 명령 처리를 중단하지 않습니다.

## 사운드

원본 MP3 46개를 `client/public/sounds/original/`에 원본 바이트 그대로 포함합니다. `data/sound-assets.json`에 URL·SHA256·바이트 크기가 있으며, 디코딩 결과는 `docs/sound-decode-audit.json`에 있습니다. 원본 Sound/Path, SoloDefenseEffect, PowerIncreaseEffect, GameWinEffect 등의 실제 호출을 읽어 이벤트에 대응했습니다. 의미상 대응되는 새 게임 이벤트는 `shared/sounds.ts`에서 관리합니다.

선택·공격·피해·회복·반사·튕김·반격·방어·질병·재앙 해제·소환·부활·거래·승패 등에 원본 클립을 사용합니다. 브라우저 첫 사용자 입력 이후 AudioContext를 열고, 요청한 MP3만 fetch/디코딩하여 캐싱합니다. 동시 효과음은 최대6개입니다. 효과음 볼륨0은 새 재생을 막고 기존 효과음 게인도0으로 바꿉니다. 로딩·디코딩 실패 시 합성 단음으로 대체하며, 오디오 API 미지원도 게임 동작을 막지 않습니다.

이 백업의46개 파일에는 별도 BGM 트랙이 확인되지 않았습니다. 배경 음악은 기존 합성 음형을 유지하고 효과음과 별도로 조절합니다. 원본 코드에서 호출하나 백업에 없는 `devil.mp3`, `score.mp3` 등을 임의로 있다고 표시하거나 깨진 URL로 연결하지 않습니다.

## 재현 및 범위

`python3 scripts/import-media.py /path/to/godfield-flash`로 재생성합니다. Python Pillow가 필요합니다. 스크립트 자체가 SWF를 데이터로 읽으므로 FFDec는 실행·배포 의존성이 아닙니다. 신규 게임에는 SWF·Ruffle·Flash 실행 엔진·원본 UI 프로그램을 포함하지 않습니다. 새 한국어 이름과 CSS 프레임, Lucide 아이콘을 유지합니다.

실제 모바일 기기의 그림 렌더링과 스피커 청취 검수는 별도입니다. 자동 검사와 파일 디코딩을 실제 청취 결과로 표시하지 않습니다.
