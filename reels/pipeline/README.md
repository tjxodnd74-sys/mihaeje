# 릴스 자동 제작 파이프라인

`build.py` 가 spec.json + 나레이션 + 배경 클립 + 효과음을 받아 1080x1920 릴스 mp4를 만든다.
템플릿(template.html)은 다크 네이비 + 노랑, 상단 제목 패널 / 가운데 영상 / 하단 자막 레이아웃,
키네틱 자막·와이프 전환·흔들림·플래시·눈 파티클·숫자 버스트·컨페티 포함.

준비: `npm i playwright@1.56.1` (Chromium 필요), ffmpeg, Noto Sans CJK KR 폰트.
실행: `python3 build.py <workdir>` → `<workdir>/out.mp4`, `<workdir>/check.jpg`(장면 점검용)
spec 형식은 build.py 상단 docstring 과 example_spec.json 참고.

완성 영상은 이 저장소 `reels/YYYYMMDD_slug.mp4` 로 커밋하면
`https://raw.githubusercontent.com/tjxodnd74-sys/mihaeje/main/reels/<파일명>` 으로 공개되어
Metricool 예약 발행 media 주소로 쓸 수 있다.
