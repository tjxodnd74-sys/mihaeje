# 릴스 자동 제작 파이프라인

`build.py` 가 spec.json + 나레이션 + 배경 클립 + 효과음을 받아 1080x1920 릴스 mp4를 만든다.

**현재 스타일: 풀스크린 실사** (`"style":"fullscreen"` → template_full.html).
실사 영상이 화면 전체, 글자는 최소(상단 라벨, 단계 태그, 큰 숫자 하나, 하단 자막).
template.html(화려) / template_vector.html(벡터)은 사용하지 않음.

- 길이: **38~45초, 12문장** = 훅, 훅 보강, (첫째·왜·방법) x 3, CTA. 컷 8~9개.
- 형식: `example_spec_fullscreen.json` (세그먼트마다 `say` = 나레이션 원문, 가로 클립은 `cx` 로 크롭 중심)
- 자막: cap 을 ' / ' 로 구절마다(12자 안팎) 끊으면 한 구절씩 화면 가운데 한 줄로, 나레이션 글자 비율에 맞춰 바뀜. 문장 통째 두 줄 자막은 가독성 문제로 폐기(2026-10-18).
- 커버: spec 의 `cover` → `cover.jpg` (Metricool `videoThumbnailUrl` 로 지정, 필수)
- 영상은 자막이 말하는 바로 그 행동이어야 함 — 클립마다 컨택트시트로 눈으로 검수.

준비: `npm i playwright@1.56.1` (Chromium 필요), ffmpeg.
실행: `python3 build.py <workdir>` → `out.mp4`, `check.jpg`(장면 점검용), `cover.jpg`

완성 영상은 이 저장소 `reels/YYYYMMDD_slug.mp4` 로 커밋하면
`https://raw.githubusercontent.com/tjxodnd74-sys/mihaeje/main/reels/<파일명>` 으로 공개되어
Metricool 예약 발행 media 주소로 쓸 수 있다.
