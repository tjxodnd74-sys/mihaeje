# 역사편(모델 1개) 화면 만드는 법 — 풀스크린 AI 주행

사용자 피드백 순서: 사진 떨림 → 서브픽셀 줌(smooth_kb.py) / "그 차가 달리는 모습+효과음" → AI 주행 / **"사진이 너무 좁다, 넓게"** → 가로 띠 대신 **화면 전체(9:16)**.

## 세대별 클립 (fs_<gN>.mp4)
1. 공식 사진에서 차가 있는 부분만 크롭(글자·라벨 칩은 크롭으로 빼기). 가로 1200px 미만이면 1200으로 키움.
2. 인포그래픽의 빨간 숫자·곡선 그래픽 제거: 빨간 계열 마스크(`r>55 & r<200 & r>g*1.45 & r>b*1.3 & g<110`)를 7~9px 팽창 후 `cv2.inpaint`. 단, 미등(아주 밝은 빨강 `r>=185`) 주변 35px는 마스크에서 제외. 번호판·엠블럼 글자가 지워졌으면 원본에서 그 부분만 다시 붙임. 결과를 시트로 확인.
3. `reels/ai_src/clean_<모델>_<gN>.jpg`로 커밋·푸시 → `media_import_url(raw URL)`.
4. `outpaint_image(image_id, aspect_ratio "9:16")` (2크레딧, 동시 4개 제한) → 결과 확인: 빨간 그래픽이 다시 생기거나, 같은 장면이 위아래로 복제되면 버림(실내 사진에서 복제가 나왔음).
5. `generate_video_batch`: kling3_0, `start_image`=outpaint **job_id**, aspect_ratio "9:16", duration 5, mode std, sound on (10크레딧). 앞모습은 "drives slowly forward toward the camera … headlights on", 뒷모습은 "drives forward away from the camera … taillights", 옆모습은 "side tracking shot keeping pace", 공통 "keep the car's design, color and grille exactly unchanged, engine hum and tire sound".
6. 0.3/2.5/4.7초 프레임 확인. 끝에서 그릴이 뭉개지거나 가짜 번호판이 나오면 앞부분만 잘라 setpts 1.2~1.4배로 늘림(오디오 atempo).
7. 그대로 `W/bg/fs_<gN>.mp4` (build.py가 1080x1920으로 키움). spec `"stills":true, "clipAudio":0.35`.

## 실내·엔딩·라인업
- 실내: 공식 실내 사진에서 세로(9:16) 크롭(화면·핸들 중심), 콜아웃 점·선은 inpaint → `cards/full_int.png` → smooth_kb.py.
- 엔딩·커버: 밝은 최신 모델 사진, 차가 잘리지 않게(엔딩은 차를 위쪽, 커버는 아래쪽). 라인업은 높이 1920 맞춤 `pan_` 카드.
- 가로 띠(ai_card.py) 방식은 "좁다"고 해서 쓰지 않음.
