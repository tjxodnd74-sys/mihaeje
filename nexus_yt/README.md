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
- Target length is 5–6 min (user 2026-11-08: "앞으로 5~6분 분량으로 늘려"), about 90–105 lines, 8–10 scenes. Add SUBSTANCE, not padding: more concrete examples, a step-by-step 실전 demo scene, 비교/주의점 scene, real prompts. Same tight pacing rules (§10) — longer must not mean looser.
- Script rules:
  - Do not list who the user is or the channels/blogs he runs.
  - No banned words: 최초·유일·완벽·가장·제일·최고·최대·100%·무조건.
  - Base content only on facts checked in official sources.

## 2. Narration (the user's cloned voice)
- Use Higgsfield `generate_audio_batch` with `model "seed_audio"`, `medias [{"value":"6dec323c-9c8f-45f4-bb12-b9ad06495af3","role":"audio_references"}]`, `speech_rate 20`, `format "wav"`, `sample_rate 48000`. **Do not use other TTS.** Reference = the user's expressive re-recording (2026-11-09, 51s, YouTube-style intonation; old flat ref eaa16e1c retired — user: "어눌하고 답답, 높낮이 일정"). Measured pitch variation +24% vs old ref.
- index = k*10 + take. Send up to 6 per batch; on a 429, wait and resend.
- Wait with `jobs_wait` using `jobs:[{index,job_id}]`.
- Download with `./dl2.sh <index> <url> …`. Files go to ln2/u{k}_{t}.wav.
- Run `python3 asr.py ln2/*.wav > asr_a.log` (faster-whisper; if missing: `pip install faster-whisper --break-system-packages`).
  - r < 0.85, or audible stuttering/garbling → retake (take 1). Reword the line if needed.
  - Differences that are only digits vs Korean numerals, or AI vs 에이아이, are fine.
- Copy the good takes to `ln/u{k}.wav`.
- `python3 build_voice.py` produces voice.json and voice.wav. Trimming is gentle (2026-11-08 user: "끝음 처리 이상, 답답"): keeps word-end decay (−50dB + 0.2s tail, soft fade), internal pauses capped at 0.32s. Never hard-cut line endings. Gaps: LG 0.22, SG 0.6 (do not widen).
- ★ 2026-11-10 user: "발음도 이상하고, 속도도 너무 느리잖아" (페이블 5.2 롱폼). → speech_rate 20 (was 0) + **TTS ear gate before render**:
  `python3 /home/claude/mihaeje/nexus_tts/tts_check.py --audio voice.wav --script read_lines.txt --rate-lo 5.0 --rate-hi 7.8 --avg-lo 6.0 --out tts_report` (read_lines.txt = R text, one line per unit, as read aloud).
  Pass rules for YouTube: no ❌ lines, **every line 5.0~7.8 syllables/sec**, overall average ≥ 6.0. A slow line → regenerate with speech_rate 30; a misheard word → apply nexus_tts/README.md pronunciation dictionary (영어·약어·숫자는 한글로 풀어 씀) and retake. Max 3 rounds; then reword the line.
  Run the same check with `--mixed` on final.mp4. Put total MOS / avg syll-per-sec in topics_done.md.

## 3. Scenes: `ep.html`
- template.html is ep16 itself. Keep the head, helpers, probe and seek parts.
- Rewrite only:
  - `ORDER`, `UI`, `PSM`
  - the scene block from `// HOOK` to just before `const probe=makeProbe`
  - `EXPR`
- `E(scene, lineIdx, html, x, y, {w,h,cls,style,anim,off,out:[line,off]})`
  - anim: pop, fade, kin, wipe, stamp, slideL
  - cls: pc (card), band (strip with yellow left bar), acc (yellow border), bad (red border)
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
### v3 CLEAN rule (user 2026-11-09: "자극적인 건 좋은데 너무 정신 사나움") — overrides anything below
- Keep the provocative hook and the logo acting out ONE action, but: ONE focal scene (max 2 logos/objects), NO flying props, crumbs, stars, sparkles, envelopes, badges or tag pill.
- Background: dark, one soft glow behind the subject. Max 3 colors on the whole thumbnail (bg + white + yellow; the logo's own color is fine). No cyan keyword — line1 all white.
- Text: line1 ≤ 8 chars (white), line2 ≤ 7 chars (yellow). Nothing else written anywhere.
- ≥ 30% empty space. Reference: thumb/clean_example.html (vs the old busy thumb/logo_example_mcp.html).
- NO faces on logos: no googly eyes, mouths, hands, stickers (user 2026-11-09: "눈 달리는 것도 별로야"). The drama comes from the situation itself: a box/app opened with a logo coming out, a logo cracked or locked, a red warning glow, one logo pushing/covering another, a real UI snippet. Logos stay clean and unmodified.
- Check at 320px wide: can you read it and tell what it's about in 1 second? If the eye jumps around, remove things.
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
- Be witty ("센스있게"): make the logos act out the story like a cartoon (user 2026-11-03: "인스타그램 유튜브 때처럼 하라고, 썸네일 보고 쳐 들어와야 하는데"). A plain diagram (logos + lines) is NOT allowed. (SUPERSEDED 2026-11-09: no faces/eyes on logos — see v3 CLEAN) Give logos faces/eyes, mouths, hands; make them eat, peek, steal, fight, flee. Examples: `logo_example.html` (Instagram jaws biting YouTube), `logo_example_mcp.html` (Gmail box popped open, AI logos with googly eyes peeking out, mails flying). Example `thumb/logo_example.html` (ep19): the Instagram logo split into jaws with teeth, mouth wide open, the YouTube logo inside the mouth being bitten, red crumbs. Other ideas: a logo kicking/crushing/racing/overtaking another, a crown on the winner, a cracked logo for "끝났다?".
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

### Lesson (ep21): flat CSS cartoons look CHEAP ("싼티")
- Do NOT draw faces/objects with CSS shapes. User rejected it as cheap.
- Do: generate a premium 3D scene background with Higgsfield `gpt_image_2_5` (glossy, cinematic light, dramatic object — e.g. cracked phone, sparks), then composite the REAL logo (simple-icons SVG / assets/logos) + short bold text in HTML.
- Example: thumb/logo_example_premium.html (+ logo_example_premium_bg.png).

## 7. Shorts — 1 per long-form (REQUIRED)
- Engine: engine/short_v4 (HTML short.html + Playwright render.js, scenes in specs.py, build.py). Light cream channel style (same as long-form), real UI cards (chat, dialog, table, stamps, logo tiles, mascot), title top, captions in dark pill.
- Own shorts script 11–12 lines, 40–45s, cloned voice (seed_audio) — tell credits first.
- CAPTIONS: write phrases by hand with "/" at natural Korean breaks — NEVER split a predicate ("못 보내요", "끝내 버려요" stay together). Timing = faster-whisper word timestamps on each line (build.py) → sync.
- AUDIO: no atempo, no aggressive silenceremove (cut words). Python trim: edges at -48dB, cap internal pauses 0.32s. ASR-check final mp4.
- Elements appear at phrase anchors ("p2", "p1+0.3") so visuals hit with the words; every entrance has an SFX.
- Check a 16-frame contact sheet before upload (no empty stage, no overlap with caption, no overflow).

## 8. Prompts go IN THE DESCRIPTION — REQUIRED (user rule 2026-11-08)
- NEVER write or say "고정 댓글에 있어요" / "고정 댓글에 올려 둘게요" — nobody pins it, viewers complained.
- Put the full copy-paste prompts in the description under "📋 그대로 복사해서 쓰세요" (right after the 2 intro lines).
- Narration outro line: "오늘 지시문은 설명란에 그대로 적어 둘게요." (not 고정 댓글)
- Video end card / scenes: "설명란에 있어요" wording only.

## 9. Final QA before every upload (user: "유튜브 디테일 잘 살려야 돼, 전문적으로")
- Title: search keyword first + curiosity (≤40 chars). Thumbnail text ≠ title text.
- Description: 2 hook lines → 📋 full prompts (copy-ready) → chapters (00:00 …) → sources → 3 hashtags. No '고정 댓글'.
- Chapters: add timestamps for every scene (from voice.json), first one 00:00.
- Tags ~15 incl. exact model/feature names (EN + KR spelling).
- Subtitles: upload SRT; check spelling of names (앤트로픽, 클로드, 제미나이…).
- End: last 5–10s ask to watch a related video/series (same topic family).
- Audio: voice clear, BGM low, no clipped words (ASR check). Video: no overlap/overflow (contact sheet).
- Shorts: 1 per long-form, title/topic leads to the long-form.

## 10. Long-form quality rules (user feedback 2026-11-08 — "타 AI 채널에 비하면 퀄리티·자막·목소리 별로")
- MASCOT = 넥서스 펭귄 (assets/peng.png, blue felt penguin with glasses + phone). Probe is retired. NO name tag above it (user: "넥서스 빼").
- MASCOT POSES (assets/peng_<pose>.png, copied to img/ by new_ep.sh): point 가리키기, think 턱 괴기, wow 놀람, happy 엄지·윙크, no 팔 X, show 폰 화면 보여주기. EXPR={scene:{line:pose}} picks them per spoken line (e.g. 경고 문장 → no, 질문 → think, 반전 → wow, 프롬프트 소개 → show, 마무리 → happy). Leave 'idle' on explaining lines: the penguin then automatically POINTS at each new item as it appears. Use poses every scene — the user wants the character visibly acting.
- MASCOT MOTION (user 2026-11-08: "지랄발광 말고 설명에 맞춰 움직여"): calm only. probe.js = breathing + soft nod while talking + lean toward content when a new element appears (cueAt) + one gentle ease per EXPR change. Never constant hopping, shaking or squash. EXPR: use sparingly (≤1 change per scene), matching what the line says.
- DESIGN THEME = "dark pro" (template.html last <style> block; user: "클로드 템플릿 같다, 강조색도, 검정 알약 칩도 별로"):
  - bg #0D0F14 + dot grid + vignette, cards = dark panels, accent = YELLOW var(--o) #FFD23F (not orange), red var(--r), green var(--g), blue var(--b).
  - In scenes use ONLY var(--ink/--mut/--o/--r/--g/--b/--pan2) — no light-theme hex (#1F1F1D, #1E7A41, #C9423A, #FDEEE6…). Brand logo tiles may stay white.
  - Labels = .tag (dark chip + yellow dot). No black rounded pills. Red/negative cards = "pc bad".
  - Captions: no box, white 60px with black outline, keyword in yellow.
- LESS TEXT ON SCREEN: one scene = one headline (≤12 chars) + ONE visual (card/logo/number). No subtitle line + chips + stamp all at once. Max 2 small labels. Let the narration carry details.
- NUMBERS: lines.py S (display/caption) uses digits ("9월", "11월 12일", "5.5"); Korean readings go ONLY in R (TTS). Never "구월" in S.
- PACING: short spoken sentences (≤ 25 chars each), one idea per line, punchy reactions ("근데 여기서 반전.", "이거 진짜예요."), no filler ("정리해 볼게요" once max). build_voice gaps: line 0.22s, scene 0.65s, internal pauses ≤0.22s.
- CAPTIONS: never ahead of the voice — each chunk starts at its first spoken word +0.04s (build_voice), drawSub has no lead. Mux ONLY the voice.wav of the same build_voice run (old final.mp4 audio = desync).
- CAPTIONS: phrase chunks ≤15 chars, one line, whisper-synced (build_voice writes voice.json "caps"; renderL/snapL pass them). Never split predicates (끊어 버려요, 못 보내요). Optional keyword highlight: KW=[...] in lines.py.
- OUTRO: shows previous video thumbnail (assets/prev.jpg → img/prev.jpg). After each upload, save the new thumbnail as assets/prev.jpg (1280x720 jpg) and commit.
- VOICE (user chose: keep cloned seed_audio): write for the ear — short sentences, use "?" and "!" for intonation, put the punchline word last, contractions/구어체 ("~거든요", "~잖아요"). Re-take any line that sounds flat or slow (ASR + listen-length check: >5.5 chars/sec target).

## 11. Scene design = explanatory information graphics (user 2026-11-08: "AI로 딸깍한 디자인 같다, 설명보다 말에 맞춰 넣은 느낌")
- BANNED: word-illustration chains (icon → logo → label), rows of pills/tags, one random card per line, emoji/icon decoration.
- Each scene = ONE explanatory structure from the KIT (template.html, after `head`); full example: engine/scenes_example.js
  - `DOC({src,meta,sec,text})` real-document excerpt (paper + serif) with `<span class="mk" ${R(li,off,'mark')}>` highlighter on the exact clause, plus `ANNO(label,text)` + `LEAD(...)` leader line explaining it in plain words
  - `TL([...])` timeline (dates), `SPLIT(A,B)` OK vs NO columns, `FLOW([...])` cause → result steps, `QUOTE({text,src})`, `STAT({num,lab})`, `CHAT(name,msgs)` product UI mock, `PROMPTS(rows)` copyable prompt editor (row focus follows narration), `AGENDA(items)` numbered list, `.lede` one-line takeaway
  - Containers use `{anim:'show'}`; every inner part reveals ON ITS SPOKEN LINE via `R(li,off,fx)` (fx up|fade|wipe|draw|mark|grow). Time offsets to the word: off = seconds into the line.
  - Cite: `SRC(sc,li,'SOURCE NAME · DATE')` on news/policy scenes.
  - Chapter indicator (top-left "02 / 06 title" + progress) is automatic from head().
- Type: headline 66px/800, body 28–36px/600, labels mono uppercase. Yellow only for the key word. Generous empty space; align everything to x=170.
- Before render: snapshot ~14 frames (contact sheet) and check: nothing cramped, no text wrapping mid-word (set widths), every element appears exactly when it is said.
