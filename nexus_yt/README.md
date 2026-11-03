# 넥서스 AI 유튜브 롱폼 파이프라인

Reference episode: ep16 "코딩 0줄, AI한테 말로만 웹사이트 만들기" (2026-10-31, 3:55).
Style: beige/orange motion graphics, 1920x1080, 60fps.
- HTML scenes are rendered with Playwright.
- The mascot Probe sits at the bottom right.
- Subtitle boxes sit at the bottom center.

## 0. Setup
```
bash nexus_yt/new_ep.sh /home/claude/work/<slug>
cd /home/claude/work/<slug>
```
- `require('playwright')` works as-is. Do not install playwright.
- Fonts, sfx, music and probe.png are linked in automatically.

## 1. Script: `lines.py`
- `S` is a list of `(scene, [lines…])`.
- `R` is the TTS reading substitutions. Example: `('AI','에이아이')`, `('Claude','클로드')`. Version numbers are read without breaks, e.g. 4.0 → "사점영". Count units use native Korean numbers (열 장, 열다섯 개).
- `G={'outro':[[0,1]]}` keeps the outro's two lines as one unit.
- The outro is always these three lines:
  - '이런 AI 소식'
  - '그래서 뭘 하면 되는지만 정리해 드릴게요'
  - '다음 영상에서 봬요'
- Its audio is assets/outro/outro1.wav and outro2.wav. Copy them as the last two `ln/u{k}.wav`.
- Run `python3 lines.py` to produce units.json.
- Target length is 4–5 min, about 55–65 lines.
- Script rules:
  - Do not list who the user is or the channels/blogs he runs.
  - No banned words: 최초·유일·완벽·가장·제일·최고·최대·100%·무조건.
  - Base content only on facts checked in official sources.

## 2. Narration (the user's cloned voice)
- Use Higgsfield `generate_audio_batch` with `model "seed_audio"`, `medias [{"value":"eaa16e1c-9a48-4c4f-9d27-d506190ebf6d","role":"audio_references"}]`, `speech_rate 0`, `format "wav"`, `sample_rate 48000`. **Do not use other TTS.**
- index = k*10 + take. Send up to 6 per batch; on a 429, wait and resend.
- Wait with `jobs_wait` using `jobs:[{index,job_id}]`.
- Download with `./dl2.sh <index> <url> …`. Files go to ln2/u{k}_{t}.wav.
- Run `python3 asr.py ln2/*.wav > asr_a.log` (faster-whisper).
  - r < 0.85, or audible stuttering/garbling → retake (take 1). Reword the line if needed.
  - Differences that are only digits vs Korean numerals, or AI vs 에이아이, are fine.
- Copy the good takes to `ln/u{k}.wav`.
- `python3 build_voice.py` produces voice.json and voice.wav. Gaps are generous (LG 0.5, SG 1.7). User feedback: transitions and speech must not feel rushed.

## 3. Scenes: `ep.html`
- template.html is ep16 itself. Keep the head, helpers, probe and seek parts.
- Rewrite only:
  - `ORDER`, `UI`, `PSM`
  - the scene block from `// HOOK` to just before `const probe=makeProbe`
  - `EXPR`
- `E(scene, lineIdx, html, x, y, {w,h,cls,style,anim,off,out:[line,off]})`
  - anim: pop, fade, kin, wipe, stamp, slideL
  - cls: pc (card), band (dark strip), acc (orange border)
- `head(sc,'Eyebrow','Title <span class="o">highlight</span>',y)`; `PR(sc,li,html,x,y,w)` = prompt bubble; `ico(name,size,color)`.
- Icons: check, puzzle, pin, lock, shield, card, user, trash, coin, mail, clock, slash, eye, cursor, nav, phone.
- User dislikes:
  - emoji icon cards and basic text-only tables (looks cheap)
  - useless scenes, blank frames, transition flicker
  - empty-looking results: the AI's output must look detailed
- Screen recordings (optional):
  - Write a real HTML demo and record it with Playwright (see site_example/rec.js). Put clips in site/.
  - Define slots in slots.py: browser frame (desk) or phone frame.
  - Without slots, delete the SLOTS/comp.py steps.
  - In rec.js, body state class names must not collide with CSS class names.
- `LINESJSON=./voice.json node events.js` (sfx event timeline).
- Check: `LINESJSON=./voice.json node snapL.js <sec> …` → l_<sec>.png. Make a contact sheet of ~16 frames, Read it, fix layout.

## 4. Render
- Total frames: N = ceil(60 * duration). Use 4 chunks:
  `FPS=60 LINESJSON=./voice.json nohup node renderL.js F0 F1 > rl$i.log 2>&1 &`
  Speed is about 0.22 s/frame, so a 4-minute video takes about 15 minutes.
- With slots: `python3 slots.py && python3 comp.py` → vid.mp4.
- Without slots: concat lseg_*.mp4 into vid.mp4.
- `python3 mix.py vid.mp4 final.mp4` mixes BGM (quiet), voice and sfx.
- Check 6–8 frames from final.mp4.

## 5. Thumbnail (1280x720) — v2, follows trending Korean AI channels (checked 2026-11)
Trend analysis (top AI channels): one bright hero object in the middle, huge 2-line text at the bottom, black outline, yellow/cyan highlight, emotional hook in quotes.
- Background: Higgsfield `gpt_image_2_5`, 16:9, prompt must include:
  "YouTube thumbnail background, no text, no logos. <ONE hero object: glowing 3D symbol of the topic>. Hero large and centered in the upper 60% of frame, lower 35% darker and simpler for text. Ultra vivid saturated colors, dramatic rim light, high contrast, 3D render, crisp."
  - Bright and saturated (blue/purple space, neon). Not dark/minimal.
  - No real people, celebrities or real company logos.
- Text: `node th/mk.js bg.png thumb.png "<tag>" "<line1>" "<line2>"` (uses th/v2.css)
  - tag (top-left orange pill): 2–8 chars, e.g. "구글 신모델", "코딩 0줄"
  - line1 (white, 86px): an emotional hook in quotes, ≤ 8 Korean chars (user 2026-11-02: "글이 너무 길어"), one key word in `<span class=c>` (cyan). e.g. “1등인데 못 쓴다고?”, “말만 했는데 홈페이지가?”
  - line2 (yellow, 140px): the topic/model name, ≤ 7 chars. Tag is optional; skip it when the image already says it. e.g. 제미나이 4 카본, AI 직원 만들기
  - Never repeat the video title word-for-word. No banned words.
### Real logos (user rule 2026-11-02: "로고 같은 거 그냥 씩씩하게 갖다 써, 직접 만들려 하지 말고, 내가 책임질게")
- When the topic is a company/app (Instagram, YouTube, ChatGPT, Gemini, Claude…), USE THE REAL LOGO FILE. Never redraw a logo by hand or ask the image model to imitate it.
- Sources, in order:
  1. `assets/logos/*.png` (full-color files from official sites, transparent bg). Add new ones here when the user provides them.
  2. npm `simple-icons` (official brand glyphs, one color): `npm pack simple-icons@13.21.0 && tar -xzf simple-icons-*.tgz` → `package/icons/<slug>.svg` (googlegemini, openai, anthropic, claude, meta, x, tiktok, threads, notion, perplexity…). Fill with the brand color, put on a rounded tile if needed.
- Be witty ("센스있게"): make the logos act out the story like a cartoon (user 2026-11-03: "인스타그램 유튜브 때처럼 하라고, 썸네일 보고 쳐 들어와야 하는데"). A plain diagram (logos + lines) is NOT allowed. Give logos faces/eyes, mouths, hands; make them eat, peek, steal, fight, flee. Examples: `logo_example.html` (Instagram jaws biting YouTube), `logo_example_mcp.html` (Gmail box popped open, AI logos with googly eyes peeking out, mails flying). Example `thumb/logo_example.html` (ep19): the Instagram logo split into jaws with teeth, mouth wide open, the YouTube logo inside the mouth being bitten, red crumbs. Other ideas: a logo kicking/crushing/racing/overtaking another, a crown on the winner, a cracked logo for "끝났다?".
- Build such scenes in HTML/CSS (copy logo_example.html, render with `node th/shot_logo.js` → thumb4.png; edit paths). Keep the scene in the top 60%; same bottom text rules.
- No "넥서스 AI" corner badge.
- Read the png before upload: text must be readable at phone size (look at a 320px-wide copy).

## 6. Upload info
- Title: 25–40 chars, MUST create curiosity (user 2026-11-03: "제목 좀 궁금증을 유발하게 좀 해봐 썸네일이랑 제발").
  - Hide the answer; open a gap: "~의 정체", "~한 진짜 이유", "결국 ~까지", "~했더니 결과는?", "~라고?", "…".
  - No "A | B" explainer titles, no "정리/핵심 정리/쓰는 법" as the main hook, no channel name.
  - Title and thumbnail work as a pair: thumbnail = the shock/visual, title = the question it raises. Never repeat the thumbnail text.
  - Must stay true to the video (no fake claims). Banned words still apply.
  - Examples: "인스타가 결국 이것까지 합니다… 90분짜리 영상의 정체" / "구글이 1등 AI를 잠가버린 진짜 이유" / "같은 AI인데 결과가 이렇게 다르다고?"
  - Shorts titles: same rule, ≤ 25 chars.
- BE PROVOCATIVE (user 2026-11-03: "썸네일이랑 글 자체 좀 자극적으로 하라고 제발"): title, thumbnail text and the first description line must hit an emotion — fear of missing out, danger, shock, conflict.
  - Patterns: "~하면 벌어지는 일", "모르면 털린다/손해", "~ 끝났다?", "결국 ~까지", "아직도 ~ 쓰세요?", "(모르면 위험)".
  - Thumbnail scene: danger colors (red glow, warning sticker "⚠"), conflict between logos, things flying/breaking. Calm explainer scenes are not allowed.
  - Still no lies: the video must back the hook (e.g. "모르면 털린다" only when the video covers a real security risk).
- Description: **short**. 2 intro lines, 1–2 key lines, a pinned-comment note, 3 hashtags.
- Tags: about 15.
- Pinned comment: prompts the viewer can copy.
- SRT: generated from voice.json (see the ep16 code in step 7).

## 7. Publish (Metricool, YouTube only)
- Upload: Higgsfield `media_upload` (files: mp4 + jpg thumbnail) → `curl -X PUT` to each upload_url → `media_confirm`. Use the returned cloudfront url.
- `createScheduledPost(blogId "7758775")` (brand 넥서스).
  - providers `[{"network":"youtube"}]`, `videoThumbnailUrl` = thumbnail url
  - youtubeData: `{title, type:"video", privacy:"public", tags, category:"EDUCATION", madeForKids:false, isAiGeneratedContent:false}` (graphics-only video; set it to true if realistic AI footage is used)
- **Never touch brand 7088172 (car_log99).**
- The date must be in the future: urgent = now + 15 min.
- SRT: `[f"{i+1}\n{ts(l[0])} --> {ts(l[1])}\n{l[2]}\n" for l in voice.json lines]`.
