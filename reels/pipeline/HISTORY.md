# 역사편(모델 1개) 화면 만드는 법 — 고속도로 변신 + 공식 사진 주행 (v3, 1분 30초~1분 50초)

사용자 피드백(2026-10-26): 배경음 크다 / 너무 급하게 넘어간다 / 변신 모션이 단조롭다 / 1~2분 길어져도 되니 내용·페이스리프트 추가.

## 구성 (세대마다 두 문장)
1. 문장 A(연도·세대·핵심): **고속도로 변신 클립** — 같은 고속도로·같은 카메라 구도의 세대별 장면(h_<gN>)을 start/end 프레임으로 Kling 5초.
2. 문장 B(특징 하나): **공식 사진 주행 클립**(fs_<gN>, 아래 '세대별 클립' 방식) — 앵글이 달라져 단조롭지 않음.
3. 페이스리프트는 현대차 공식 자료(hyundai.com 그랜저 히스토리·헤리티지, 현대차그룹 스토리)에 있는 것만. 공식 사진 없는 건 빼고, 빠진 이유를 사용자에게 한 줄로.
4. 신형은 실내·특징 2~3문장 더(공식 보도자료 사진 crop → outpaint → smooth_kb).

## 세대별 장면(h_<gN>) — nano_banana_2_1, 9:16, 1k (1.5크레딧)
- 1세대: 공식 사진 참고로 밝은 고속도로 앞 3/4 주행 장면 생성(기준 장면).
- 나머지: image_references = [기준 장면(직전 h_ job id), 공식 사진] → "Keep image 1 exactly (scene, camera, position, size, angle). Replace only the car with the car from image 2 … plain blank white plate".

## 변신 방식은 컷마다 다르게 (같은 방식 반복 금지)
- 트럭/버스 추월 가림: "a large white cargo truck (or long coach bus) in the nearer lane overtakes, passing between the camera and the car and briefly hiding it… revealed as the newer model" — 가장 자연스러움.
- 육교 그림자 통과 / 짧은 터널 통과 후 바뀜.
- 부품 교체(범퍼·그릴·문짝이 하나씩 교체) — 한 편에 2번 이하.
- 페이스리프트는 "only the front face changes… grille and headlamps slide out/in, doors and roof stay the same" + 카메라 천천히 push-in.
- 공통: kling3_0, 9:16, duration 5, mode std, sound off(7.5크레딧), declined_preset_id 24bae836-2c4a-48e0-89b6-49fcc0b21612.

## 나레이션 — 여유 있게
- 타입캐스트 속도 1.1, **문장마다 문단(Enter)으로 나눠** 넣고 다운로드 출력 "문장 별로 나누기"(zip).
- `python3 join_narr.py <W> <zip 푼 폴더> 0.4 0.8` → 문장 사이 0.4초, 세대 바뀔 때 0.8초 쉬고 narr.mp3 + 각 문장 t를 spec에 기록(정확한 싱크).
- 배경음 `"bedVolume": 0.22` (0.5는 크다고 함).

## 크레딧(그랜저 v3 기준 ≈ 70): 새 변신 6×7.5 + 장면 1.5 + outpaint 2×2 + 상세 주행 6, 나머지는 기존 클립 재사용. 새 모델은 h_ 8~10장(≈15) + 변신 8~9개(≈65) + fs_ 주행(outpaint 2 + kling 6)×세대 ≈ 150.

---
# (이전) 풀스크린 AI 주행

사용자 피드백 순서: 사진 떨림 → 서브픽셀 줌(smooth_kb.py) / "그 차가 달리는 모습+효과음" → AI 주행 / **"사진이 너무 좁다, 넓게"** → 가로 띠 대신 **화면 전체(9:16)**.

## 세대별 클립 (fs_<gN>.mp4)
1. 공식 사진에서 차가 있는 부분만 크롭(글자·라벨 칩은 크롭으로 빼기). 가로 1200px 미만이면 1200으로 키움.
2. 인포그래픽의 빨간 숫자·곡선 그래픽 제거: 빨간 계열 마스크(`r>55 & r<200 & r>g*1.45 & r>b*1.3 & g<110`)를 7~9px 팽창 후 `cv2.inpaint`. 단, 미등(아주 밝은 빨강 `r>=185`) 주변 35px는 마스크에서 제외. 번호판·엠블럼 글자가 지워졌으면 원본에서 그 부분만 다시 붙임. 결과를 시트로 확인.
3. `reels/ai_src/clean_<모델>_<gN>.jpg`로 커밋·푸시 → `media_import_url(raw URL)`.
4. `outpaint_image(image_id, aspect_ratio "9:16")` (2크레딧, 동시 4개 제한) → 결과 확인: 빨간 그래픽이 다시 생기거나, 같은 장면이 위아래로 복제되면 버림(실내 사진에서 복제가 나왔음).
5. `generate_video_batch`: kling3_0, `start_image`=outpaint **job_id**, aspect_ratio "9:16", **duration 4, mode std, sound "off" (6크레딧)** — 클립마다 소리를 따로 받으면 장면 바뀔 때마다 소리가 끊겼다 들어와 "어수선하다"고 함. 소리는 spec `"bed":"car_bed"`(sfx/car_bed.wav, 끊김 없는 엔진·도로음 한 줄)로 영상 전체에 깔기. 앞모습은 "drives slowly forward toward the camera … headlights on", 뒷모습은 "drives forward away from the camera … taillights", 옆모습은 "side tracking shot keeping pace", 공통 "keep the car's design, color and grille exactly unchanged, engine hum and tire sound".
6. 0.3/2.5/4.7초 프레임 확인. 끝에서 그릴이 뭉개지거나 가짜 번호판이 나오면 앞부분만 잘라 setpts 1.2~1.4배로 늘림(오디오 atempo).
7. 그대로 `W/bg/fs_<gN>.mp4` (build.py가 1080x1920으로 키움). spec `"stills":true, "bed":"car_bed", "bedVolume":0.5` (clipAudio 쓰지 않음). 4초 클립이 문장(3.3~4.6초)보다 짧으면 앞부분을 setpts로 살짝 늘림(최대 1.2배).

## 크레딧 아끼기
- 한 편 목표 ≤ 70크레딧: outpaint 2 × 세대 수 + kling 6 × 세대 수. 원본에서 빨간 그래픽을 먼저 지워 outpaint 재시도를 없앨 것.
- 세대가 8개 넘으면 오래된 세대 일부는 세로 확장 사진(outpaint 결과) + smooth_kb 정지 화면으로.

## 실내·엔딩·라인업
- 실내: 공식 실내 사진에서 세로(9:16) 크롭(화면·핸들 중심), 콜아웃 점·선은 inpaint → `cards/full_int.png` → smooth_kb.py.
- 엔딩·커버: 밝은 최신 모델 사진, 차가 잘리지 않게(엔딩은 차를 위쪽, 커버는 아래쪽). 라인업은 높이 1920 맞춤 `pan_` 카드.
- 가로 띠(ai_card.py) 방식은 "좁다"고 해서 쓰지 않음.
