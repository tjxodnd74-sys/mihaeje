# 미해제 (mystery-site) — 작업 규칙

이 파일은 이 저장소에서 작업하는 모든 AI 세션이 먼저 읽는 규칙입니다. 사용자의 지적이 있을 때마다 여기에 한 줄로 추가합니다. 같은 지적을 두 번 받으면 그건 세션의 책임입니다.

## 절대 규칙

1. **덮어쓰기 레이어를 새로 만들지 않는다.** `xxx-v81.js`/`.css` 같은 새 파일로 기존 동작을 가리지 말 것. 원인이 있는 파일(`story-devices-v36.js`, `theme-mechanics-v62.js`, `escape-kit.js`, `episodes/*.json` 등)을 직접 고친다. 파일 이름의 `-vNN`은 역사일 뿐 버전이 아니다.
2. **고쳤다고 말하기 전에 플레이로 확인한다.** `qa-tools/walk-episodes.mjs`(8편)와 `qa-tools/walk-native.mjs`(사진관·오행당)를 돌려 10편이 새 저장 상태에서 엔딩까지 통과하는지 본다. PC와 `--mobile` 둘 다. 통과 로그 없이 "완료"라고 보고하지 않는다.
3. **수정 범위는 사용자가 말한 것.** 디자인·사진·구조를 "김에" 바꾸지 않는다. 관련 없는 문구를 다듬고 싶으면 먼저 묻는다.
4. **`web/game-bundles/`와 `dist/`는 손대지 않는다.** `npm run build`가 다시 만든다.
5. **정답을 UI에 새지 않게 한다.** 장치 제목·버튼·자동 표식에 답(번호·호수·날짜)을 넣지 않는다. 자료 한 장에 답이 그대로 적혀 있으면 퍼즐이 아니다.
6. **오답·미완료 피드백은 그 장치의 말로.** 공용 문구 하나로 때우지 않는다. 새 장치를 추가하면 `theme-mechanics-v62.js`의 `explain()` 또는 `physical-controls-v40.js`의 `explain()`에 그 장치의 메시지를 같이 넣는다. 일반 장치는 `story-devices-v36.js`의 `diagnose()`가 처리한다.
7. **숨은 조건을 만들지 않는다.** 정답을 넣었는데 "먼저 X를 보세요"로 막아야 한다면, 그 조건을 안내문에 적거나 조건 자체를 없앤다.
8. **배포는 여기서 하지 않는다.** 이 환경에는 Sites 배포 권한이 없다. 수정 소스 + 빌드 + 검증 기록을 ZIP으로 넘기고, 배포는 사용자의 Codex/Sites 환경에서 한다 (`02-DEPLOYMENT.txt`).
9. **보고는 존댓말로, 확인한 것과 확인 못 한 것을 나눠서.** 자동 검사는 자동 검사라고 말한다. 실기기(iPhone/Android) 확인은 하지 않았다고 쓴다.

## v2 엔진 (2026-10-15부터 · 승강장 편이 첫 사례)

- 새로 뜯어고치는 편은 옛 레이어 더미를 손대지 않고 **`web/play.html?case=<id>` + `web/v2/engine.js` + `web/v2/episodes/<id>.js`** 로 옮긴다. 한 편의 이야기·자료·장치·힌트·엔딩이 `episodes/<id>.js` 한 파일에 있다. 엔진은 구조만 알고 내용은 모른다.
- 장치는 `render(ctx)`(화면)와 `check(draft)`(판정 + 그 장치의 말로 쓴 오답 문장)를 가진다. 공용 오답 문구 금지는 여기서도 같다.
- 그림은 `web/assets/v2/<id>/`에 1024폭 원본 + `-960` 변형. 표지는 허브가 `assets/covers/<id>-480-v2/-960-v2/-v1.webp` 이름을 고정으로 쓰므로 거기에도 복사한다.
- `web/cases.json`의 해당 편 `href`를 `play.html?case=<id>`로, `storageKey`를 `mihaeje-v2-<id>`로, `docNames`를 새 자료 id로 바꾼다(허브의 진행 표시가 이걸 읽는다).
- 검증: `qa-tools/walk-v2.mjs`(PC) / `--mobile`. 새 편을 옮기면 이 파일에 그 편의 걷기를 추가한다.
- 본문 글꼴: `assets/fonts/MihaejeSerif-400.woff2`(Noto Serif CJK KR 2,350자 서브셋, OFL). 옛 `MihaejeLetter`는 658자뿐이라 글자가 빠진다 — v2에서는 쓰지 않는다.
- 글은 사람 말로. "확인합니다/살펴봅니다" 식 절차문, "그날 밤/진실/기억 속으로" 같은 상투어, 자료 베껴 넣기 퍼즐을 쓰지 않는다. 퍼즐은 실제 방탈출 방식(겹쳐 읽기, 거울 글씨, 세기, 길안내 따라가기, 순서 맞추기 등)에서 고른다.

## 코드 지도 (수정할 때 어디를 보는지)

- 장치 정의·정답·일반 오답 진단: `web/story-devices-v36.js` (`plan`, `valid`, `diagnose`)
- 장치별 커스텀 UI와 그 장치의 오답 설명: `web/theme-mechanics-v62.js` (`ready`, `explain`, `render`)
- 손으로 만든 보조 UI(카드 번호 입력, 전화, 등불 등): `web/experience-controls-v56.js`, `web/physical-controls-v40.js`
- 장치 실행·보상 화면·힌트 등록: `web/story-adventure-v36.js`
- 장소·핫스팟·자료 위치: `web/scene-layout-v44.js`, `web/places-v40.js`, `web/experience-v56.js`
- 방 렌더링·읽지 않은 자료 안내·카운터: `web/escape-kit.js`
- 최종 문구(제목·안내·완료문): `web/copy-editor-v74.js`, `web/player-polish-v64.js`
- 힌트 장치: `web/hint-device.js`
- 사진관: `web/studio.js` + `web/studio-rules.js` / 오행당: `web/ohang.js` + `web/ohang-rules.js` / 정비소 자료: `web/app.js`
- 7편 자료 본문: `web/episodes/*.json`
- 10편 목록·시간·난이도: `web/cases.json` (intro HTML의 시간 표기와 맞춰야 함)

## 검증 명령

```
cd mystery-site && npm ci && npm run build
node scripts/audit-playability-v64.cjs && node scripts/check-hint-entries-v77.cjs
cd .. && node qa-tools/preview.mjs &          # http://127.0.0.1:8790
NODE_PATH=<playwright가 있는 node_modules> node qa-tools/walk-episodes.mjs
NODE_PATH=... node qa-tools/walk-native.mjs
NODE_PATH=... node qa-tools/walk-episodes.mjs --mobile && node qa-tools/walk-native.mjs --mobile
```

## 사용자가 지적한 것 (누적)

- 2026-10-14: GPT가 같은 실수를 반복하고 피드백을 반영하지 않아 넘어옴. "AI티"가 난다: 오답 문구가 전부 같음, 자료 베끼기 퍼즐, 조작해도 반응 없음, 게임마다 라벨·카운터가 제각각.
- 2026-10-14: 쉽게 설명할 것. 전문 용어 없이.
- 2026-10-15: "대대적인 개편" 요청 — 상투적·AI스러운 글, 자료 베끼기 퍼즐, 이야기와 따로 노는 퍼즐, 밋밋한 디자인을 10편 전부 고칠 것. 실제 방탈출 문제 방식으로. 1편(승강장)을 먼저 보여주고 승인 후 나머지. 그림도 새로 만들기로 함.
- 2026-10-15: 글에 마침표(.)를 쓰지 않는다 — 대화뿐 아니라 설명문·태그라인·장치 문구 전부. 문장은 띄어쓰기로만 잇는다
- 2026-10-15: 카톡식 문자는 보낸 사람답게(할머니는 띄어쓰기·오타 섞어서). 상대가 답한 뒤의 내 메시지엔 읽지 않음 표시 "1"을 남기지 않는다
- 2026-10-15: 발광·글로우 같은 효과는 과하지 않게. 소품 사진 위 글씨(칠판 등)는 CSS보다 이미지 생성에 글자를 넣는 편이 자연스럽다
- 2026-10-15: 오행당은 생년월일시 입력 → 오행(사주) 풀이 → 사람마다 다른 열쇠·엔딩이 핵심 컨셉. 엔진의 intake 화면(ep.intake)과 S.profile, docs.html(S)/hints(S)/check(d,S)/ending.paragraphs(S)+choice 로 구현
- 2026-10-15 (GPT 플레이 피드백): 자리표 왼손 방향 정답 반전 버그, 사진 선택지가 정답 순으로 나열되던 것, 힌트 창 제목이 편마다 달라야 함(ep.hintTitle), 모바일은 장치 먼저·자료 아래
- 2026-10-15: 문제는 "맞추기 표"보다 방탈출답게 — 번호 자물쇠·서랍·열쇠처럼 풀면 뭔가 열리는 장치로. 추리(대조·순서)는 그 자물쇠 번호를 얻는 과정으로 넣는다 (첫 번째 보호자: 양철통 4자리, 서랍 12개 중 고르기, 책상 3자리)
- 2026-10-15: ★5(정비소) 기준 — 안내문 없음, 힌트 2단계(정답 없음, 엔진이 hints.length<3이면 '정답 보기' 안 보임), 함정 자료(사업자등록일 vs 개업일, 표시 시각 vs 서버 시각, 재발급 카드 vs 분실 카드), 장치가 풀리면 새 자료(reveal.unlockDoc → S.found)로 이어지고 마지막은 네 항목 보고서
- 2026-10-15: 카톡 말풍선이 오른쪽에서 잘림 (grid 자식 min-width 문제) → .chat-col flex column으로 수정. 재발 방지: qa-tools/layout-check.mjs 가 모든 편·모든 자료를 PC/모바일로 열어 가로 넘침을 검사하고, publish.sh 가 이걸 통과해야만 올린다
