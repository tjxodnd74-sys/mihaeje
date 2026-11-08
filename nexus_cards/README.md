# 넥서스 카드뉴스 제작 키트 (@nexus_studio.kr)

## 폴더
- `fonts/` Pretendard (HTML에서 `../fonts/...`)
- `assets/heart.png` 넥서스 펭귄(하트 포즈, 투명 배경) — **마지막 장에 꼭 넣음**
- `assets/logo3d.png` N 로고 — 상단 바 왼쪽
- `example/gem_v2.html` + `gem_cover.png` + `gem_v2_grid.jpg` — 기준 디자인(제미나이 젬→스킬, 10장). **이 수준 이상**으로.
- `render.py` — `python3 render.py <폴더>/cards.html` → 같은 폴더에 `카드01.jpg…`, `grid.jpg`
- `done.md` — 올린 카드뉴스 기록(주제 중복 금지)

## 만드는 법
1. 작업 폴더 `nexus_cards/<YYYY-MM-DD>_<영문slug>/` 를 만들고 `example/gem_v2.html`을 `cards.html`로 복사해 내용만 바꿈(경로 `../fonts`, `../assets` 그대로 동작).
2. 디자인 규칙 (기준: 프롬왓·비기 카드뉴스 퀄리티)
   - 어두운 'NEXUS BRIEF' 스타일: 상단 바 `NEXUS BRIEF · <서비스>` + `FILE 0N/총장수`, 작은 영문 라벨(.lab), 96px 굵은 제목(.h, 핵심어는 .v 보라 / .a 주황), 설명(.s), 상자(.box + .tag).
   - 8~10장: ①표지(주제 캐릭터 그림 + 큰 제목 + NOTICE 같은 도장) ②무슨 일 ③공식 근거(인용·출처) ④누가/언제(일정·조건) ⑤되는 것/안 되는 것 or 비교 ⑥좋아진 점 ⑦**COPY·PASTE 지시문 상자**(바로 따라 쓰는 프롬프트) ⑧주의점 ⑨추가 팁 ⑩CTA(펭귄 heart.png + 말풍선 + "저장·팔로우" + @nexus_studio.kr).
   - 주제마다 **그 주제 전용 캐릭터**를 표지에 씀(예: 젬 주제 → 울면서 짐 싸는 보석 캐릭터). 남의 회사 캐릭터·로고·유명인·남의 사진은 금지 → 주제를 상징하는 사물을 귀여운 3D 캐릭터로 직접 만듦.
   - 빈 공간 없이 글씨·상자를 크게. 한 장에 하나의 메시지.
3. 표지 그림: Higgsfield `generate_image`(1080x1350에 맞는 4:5 비율, quality high), 프롬프트 = "cute glossy 3D <주제 상징 사물> character with big eyes, <감정·행동>, dark navy/purple cinematic background with soft glow, empty space at top-left for headline, no text, no logos". 1~2장만(약 2~3크레딧). 받은 그림을 작업 폴더에 `cover.png`로 저장하고 `#k1{background:url(cover.png)}`.
4. `python3 render.py <작업폴더>/cards.html` → `grid.jpg`를 Read로 보고 겹침·빈 공간·오타·잘림을 고쳐 다시 렌더(최대 3회).
5. 글 규칙
   - 금지 표현: 최초·유일·완벽·가장·제일·최고·최대·100%·무조건 (python으로 cards.html·캡션 둘 다 0개 확인)
   - 확인된 사실만. 출처(공식 발표·주요 언론)를 마지막 근거 장 하단과 캡션에 적음. 루머·유출설 금지. 이용 조건(유료·지역·순차 배포) 꼭 밝힘.
   - 해요체, 쉽고 짧게. 키캡 이모지 금지(①②③ 사용).
6. 캡션: 스토리형 — 첫 줄 훅(날짜·숫자) / ①②③ 핵심 / 출처 한 줄 + "이미지는 직접 만든 그림이에요" / 📌 저장 유도 / 해시태그 ~10개(#넥서스 포함). UTF-8 BOM + CRLF로 `캡션.txt` 저장.

## 올리는 법 (Metricool 브랜드 7758775만)
- Higgsfield `media_upload(files=[카드01.jpg…])` → 각 upload_url에 `curl -X PUT -H "Content-Type: image/jpeg" --data-binary @파일 '<url>'` (520 등 실패는 그 파일만 다시) → `media_confirm(type image, media_ids)` → 공개 URL(`https://d2ol7oe51mr4n9.cloudfront.net/...`).
- `createScheduledPost(blogId "7758775")`: providers `[{"network":"instagram"}]`만, `instagramData {"type":"POST","isAiGenerated":true}`, media = URL 순서대로, text = 캡션(BOM 없이).
- **브랜드 7088172(로드로그)는 절대 사용 금지. 기존 예약 수정·삭제 금지. 유튜브·쓰레드 provider 넣지 않음.**
- 올린 뒤 `done.md`에 한 줄: 날짜 | 예약 시각 | 주제 | 장수 | Metricool id | 크레딧
