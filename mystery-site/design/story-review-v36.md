# v36 story audit — implementation proposal

## Tactile implementation supplement requested by root

The numbered audit below describes deductions, not a requirement for forms. Render all targets as manipulations of objects: timeline hands, movable film, patch cables connecting named endpoints, postal stamps, physical seating cards, tray placement. Generic dropdowns would lose the intended feel.

Recommended tactile four-stage plans, with two distinct advanced additions:

| Theme | Four core physical interactions | Two ★3–5 additions | Exact off-device clue artifacts |
|---|---|---|---|
| Garage | shift video clock hand by −7; synchronize entrance timeline at21:46:20; pair employee07 card with personnel07; arrange backup event strips | pin independently corroborated alibi intervals; join visit/removal corroborating strips | receipt `clock`; observed dash footage `video`; printed roster `people`; server sheet `entry`; after-opening `backup` |
| Apartment | move floor marker past piloti; mirror rear-facing floor overlay to identify502; place room windows in film sequence; set physical lock3123 | align daytime-install/no-entry strips; disconnect battery branch after comparing mains isolation | `films`; folded `plan`; notebook `agreement`; separate wall `power`; after-opening `inspection` |
| Radio | splice cue-marked tape pieces; turn reel to identified recording date; patch named archive→PC→relay ports; disengage retained test-job lever | distinguish B/E labels by successor cue; match playback fingerprint/no-mic input evidence | `archive`; editor `rules`; `transcript`; `power`; after-splice `transmission` |
| Station | rotate old/new sign plates to north/current2; trace actual station graph; move fare/time counters along connected segments; set locker243 | remove uninstalled-reader marker at deduced stop; place direct-contact confirmation into evidence holder | `platform`; `route`; `ticket`; reservation `locker`; after-opening `arrival` |
| Laundry | place N-08 label on machine2; turn clock hand −12 across midnight; align coat-removal strip with operator interval; move manual-status stamp to its actual event | separately synchronize precise audit seconds; place recovered N-08 tag with ledger | `order`; `clock`; `receipt`; `entry`; after-opening `audit` |
| Letter | match exact old/new address placards; physically sort envelopes by postmark; slide sorted backside pieces into shelf locator; insert papers into MR-17-04 | trace return/transfer with address labels; pair consent stamps with paper-copy types | `envelopes`; wall `address`; separate `classification`; `catalogue`; after-opening `register` |
| Pet-home | flip real keepsakes; attach keepsakes to four dated care pages; join registry record strips; place old school ribbon/photo beside finder record | separate care-provider tags from ownership; connect registration number and past-name card | `objects` backs; `records`; `identity`; `photos`; corroborating `letter` |
| Cat-invite | sort gift parcels versus delivery; physically place parcels at compass seats; turn ribbon clasp positions to arranged seat order; open anniversary calendar fold | join care-roster/date and gift-type evidence; compare adoption date with blank birthday field | parcel labels `gifts`; wall `room`; individual notes `notes`; `date`; `card`; after-opening `invitation` |
| Studio | reveal pressed envelope; retrieve actual labeled drawer; order/orient numbered negative strips; expose/develop physical paper using independent instructions | separately prepare lighting/size/time; inspect back and match apron/photo before mounting | `paper`; `drawer` sleeve; `wall`; `procedure`; `portrait-back` |
| Ohang | arrange symbolic bowls by seed cycle; place bowls on directional mat; balance ceramic items using an attendant inventory; unfold own carbon-original against copy | trace controlling-cycle latch from marked target; place final chosen object/recipient paper | `circle`; `directions`; `symbols`; `reserve`; new attendant inventory; `reveal` |

For existing slider mechanics, map semantic derived quantities into slider coordinates instead of inventing target positions: garage clock dial actual minute46/exit48; laundry minute56/next tick57 with explicit date ring; apartment locator floor5,column02; station switch branch north plus destination station24; studio expose12/focus perceptual and paper angle only perceptual; Ohang compass positions are real spatial marks. Auxiliary mechanical target values may vary, but the operator's service artifact must explicitly explain *why that setting corresponds to this recovered fact*. A record that says “set knob37” solely to justify knob37 remains arbitrary.

If retaining wire devices, use labeled causal paths rather than anonymous shapes: radio archive output→conversion input→relay input, apartment independent battery→timer→three room branches; garage/laundry should calibrate records rather than require unrelated wire service. Ports physically plausible in radio/apartment only. Avoid wire stages in all ten.

If adding original auxiliary prop documents, mark them as new implementation support, not recovered historical canon. Example Ohang inventory: wooden tray has tare2 units, ceramic bowl tare3, liquid fill markers1/2/3. Attendant instruction says protect carbon copies from ink spill by leveling shelf with two existing bowls; target is left total5/right total5 (tray2+filled bowl3 versus bowl3+fill2). Better to omit balance if there is no visible shelf/causal function. Higher stars require tare correction and matching symbol inventory, not weights arbitrarily6/7. Do not describe ordinary dry bowls as merchant merchandise unless a merchant exists in the story.

Random visual offsets can come from deterministic initial positions, never unexplained target rotation. Physical circular controls should align meaningful engraved marks to scene direction: station old3 plate to north/current2; cat four ribbon clasps to compass seats. Natural success comes from recovered direction; do not crop the same photo into rings everywhere.

Read-only audit of `dist/adventure-data.js`, `adventure-rules.js`, `adventure.js`, `app.js`, all seven episode JSON files, `studio.js`, and `ohang.js`. No game files changed.

## Finding and acceptance rules

v35 does not vary the substance by story: wire map is `[2,0,1]` or `[2,0,3,1]`; alignment is always 50/50; rings are always zero; marble goal is always 24; weights are 6/7. Story names wrap these same targets. Tuner directly prints its target in the clue panel. Several existing level-three hints print the entire answer. This explains all reported complaints.

Use at most four story stages at ★1–2 and six at ★3–5. Do not count atmospheric clicks or final ungraded preservation choice as puzzle stages. Low levels should combine adjacent deductions; high levels separate them and require evidence selection. Each stage must have named evidence outside its input panel; link to the scene object/document, preserve the draft when leaving and returning, and explicitly state the output format. Puzzle panel must not copy the decisive source table or print the target. A source naturally containing a raw number is permitted; a panel telling players to enter that number is not a deduction.

Level effects must change reasoning, not rotation tolerance: ★1 one decisive source pair and labeled slots; ★2 same canonical truth with mixed source order; ★3 six stages and one plausible decoy; ★4 require combined constraints and identification of supporting records; ★5 require the correct claim plus corroborating record pair and exclusion of one rival explanation. Do not add unknown culprits, randomized historical events or fabricated uncertainty. Persist level/variant and all drafts. Exact targets below are already supported by canon. Deterministic alternate asks can use the same records (entrance versus exit time, preceding versus following cue, room identity versus coordinate) without changing the story.

Hints have three *explicitly requested* steps: H1 identifies the scene/document; H2 identifies the relationship or conversion; H3 gives one intermediate operation or narrows one ambiguity. No H3 prints the final code, complete sequence, culprit+time, full seating, or registered identity. No hint after failed attempts appears automatically. Never render answers in data-driven UI labels, clue badges, success previews or expanded summaries before success.

## Per-theme exact stages

Each numbered item gives interaction → target → external clue location. Items can be combined for four-stage low-level flows as stated. Existing locked final records must remain behind the real deduction; they can corroborate a final ending but cannot be required as evidence to open themselves.

### Garage / 마지막 정비소

1. Set camera offset direction and minutes → camera faster, 7 → `clock` equipment receipt, rows server 20:00 / dash 20:07. Natural action: calibrate timeline, not wire a board.
2. Align video visit with server timeline → entrance 21:46:20, exit 21:48:20 → `video` timestamps plus `clock`. Lock format can accept HHMM, canonical 2146, but do not display 2146 in the panel.
3. Match card identity → 07 = 한지수 → `entry` and `people`, not jacket color. Natural action: place personnel card alongside server entry.
4. Place unlocked backup events in time order → unlock 21:47:05, removal 21:47:10, relock 21:48:05 → newly unlocked `backup`. This stage is post-unlock evidence reconstruction, never a prerequisite for the same backup.
5. Exclude rival presence → 강민호 and 윤서연 independently elsewhere during the removal → `people` plus calibrated visit. Natural action: mark corroborated intervals on timeline.
6. Attach supported finding → 한지수 + access/removal evidence; motive alone insufficient → `people`, `entry`, `backup`; `memo` provides motive only.

Four-stage flow: combine 1+2 calibration, 3 identification, 4+5 timeline, 6 evidence finding. Ending: one entry card, calibrated video and one-person locker events identify Han Jisu; 7-minute camera offset hid the return visit. The handover memo explains motive, not identity. Preserve no accomplice/card loan/clone canon.

### Apartment / 404호의 불빛

1. Map photo row to actual floor → row4 = floor5 → `films` and `plan` piloti note.
2. Map rear-view column → column3 = unit02, hence 502 → `plan` reverse columns plus `films`.
3. Choose applicable room layout → even unit, B type → `plan` parity table.
4. Reconstruct illuminated room order → small room / main room / living room / small room → `films` positions 0,2,1,0 + B-type layout.
5. Set inspection lock → 3123 → above reconstruction + `agreement` main1/living2/small3. No lock-panel layout or answer text.
6. Diagnose light → independent battery / scheduled relay → unlocked `inspection` plus `power` no night entry and disconnected mains. Natural action: disconnect independent battery and retain inspection report.

Four stages: combine1+2 coordinates, combine3+4 room sequence,5 lock,6 diagnosis. Ending must distinguish misnamed 404 from actual502. Main-power cut does not remove independent battery; the daytime installation executes scheduled relay without a hidden person or rescue signal.

### Radio / 끝나지 않은 방송

1. Select relevant old recording date → 2023.04.12 → `archive` dates plus `transcript`; matching words alone do not distinguish E.
2. Connect start to next cue → A then B, not E → `archive` and `rules`; E ends J09 without successor.
3. Continue to END → A,B,C,D → `archive` cue labels + `rules`. Natural interaction is reorder actual tape excerpts, not decorative concentric plates.
4. Determine live input status → no microphone input, studio off → `power` plus `brief`.
5. Reconstruct recovered transmission path → archive → conversion PC → relay scheduler → unlocked `transmission` stage table.
6. Select restart cause with corroboration → paused test job restored/reexecuted → `transmission` recovery row plus independent relay power in `power`.

Four stages: combine1+2 version identification,3 tape sequence, combine4+5 path,6 restart cause. Ending: 2023 recording carries its own two-am time announcement; official relay fingerprint rules out foreign interference; a retained test job reexecutes after restoration. No new voice or new accident. Tuning only belongs if a source supplies a genuine reception frequency; current invented 94+stage*3+level is unsupported.

### Station / 세 번째 승강장

1. Map old platform → current2 / north → `platform` old3/current2 table + `ticket` old3.
2. Trace direction-valid connected stations → 미루,중앙,북문,… → `route`, not an abstract marble maze.
3. Satisfy all duration and fare constraints → 미루→중앙→북문→수림, 13min/800won → `route` sums + `ticket` values. South route matches totals but fails direction.
4. Set destination locker → 243 → `route` destination code24 + `locker` compartment3/PIN rule.
5. Explain absent alighting record → 수림 terminal uninstalled → `ticket` terminal-status row + deduced destination.
6. Confirm status only on direct evidence → safe voluntary movement → unlocked `arrival` face-to-face and video-call confirmation. Reservation alone proves neither.

Four stages: combine1+2 direction,3 complete route,4 locker,combine5+6 confirmation. Ending must cite independent direct contact; no ghost station, card loan or presumption that preparation eliminates coercion. Leave route map in record sheet, not answer panel.

### Laundry / 다음 날의 영수증

1. Select handling location → machine2 → `order` wool coat storage, no onsite washing/drying.
2. Determine clock offset → terminal faster12 → `clock` server23:00/terminal23:12.
3. Correct dated receipt → October9 23:56 → `receipt` October10 00:08 plus `clock`; date rollover matters.
4. Match person present during actual removal → O-2 / 서도윤 → `entry` operator23:51–23:57 and customer23:58; `audit` later verifies precise removal.
5. Reconstruct audit events in server time → open23:56:05, empty23:56:14, manual customer label23:56:30 → unlocked `audit` plus `clock`.
6. Diagnose misleading receipt → operator manually selected customer pickup before customer arrival → `audit` + `entry` + `receipt` editable-processing note.

Four stages:1 machine, combine2+3 dated correction, combine4+5 removal timeline,6 supported finding. Ending: Seo Doyun removed coat before customer arrived; 12-minute fast clock plus manual status made receipt misleading. The recovered coat and N-08 tag corroborate; no magical weight-balancing lock.

### Letter / 반송된 네 봉투

1. Match exact former address → 미루기록길12 → `envelopes` 미루동17-4 + `address`; do not conflate17-14 or71-4.
2. Chronologically sort postal marks → garage09.19,apartment09.23,radio09.27,station10.01 → `envelopes`.
3. Read sorted pieces → M,R,17,04 → envelope backs, not a separate storyless letter tile image.
4. Set archive shelf → MR-17-04 → `classification` parse rule + sorted pieces + `catalogue` shelf labels.
5. Trace return/transfer → old address→common dispatch address→new archive → unlocked `register` + `envelopes` common sender + `address`.
6. Classify what was preserved → consented paper copies; not SD data/common conspiracy → `catalogue` MR group + `register` custody/consent rows.

Four stages:1 address,combine2+3 sorted pieces,4 shelf,combine5+6 custody. Ending: librarian 정해린 forwarded independently consented records, old-address mail returned, paper copies transferred. Same marks are archive classification; they do not establish an accomplice. No prerequisite of solving earlier episodes.

### Pet-home / 루미의 새집

1. Match each keepsake date+seal to care record → ribbon/rescue,receipt/treatment,blanket/foster,ticket/adoption → `objects` hidden backs and `records`.
2. Reconstruct care sequence → ribbon→receipt→blanket→ticket → dated `records`, not numbered puzzle answer printed at top.
3. Distinguish roles → finder/clinic/foster/long-term guardian, not four owners → `records` all reception27 and provider roles.
4. Link past to present animal → reception27→V-6384→941372608154902=current contract → `identity` and receipt back. This is a record-chain matching interaction; do not use coat appearance.
5. Compare finder records with family archive →2016.07.16/햇살동 bus stop/blue 햇살중 ribbon → `photos` + `objects`; youth is13 then23 now.
6. Identify first finder → 김유나 → `photos`, `identity`, unlocked `letter` original report; letter corroborates after inference.

Four stages:combine1+2 care timeline,3 roles,4 same-animal chain,combine5+6 finder. Ending: Yuna adopted present Lumi first through normal rehoming and only then received box; former guardian 박정우 is alive and cared ten years. Name changed 콩이→루미; registered-ID linkage proves same dog, photo/date/place/ribbon and original report identify Yuna. Do not turn animal recognition into evidence or predestined adoption.

### Cat-invite / 봄이의 초대장

1. Select actual participants → 은호,소연,지후,미정; exclude 준호 delivery → `gifts` white-packaging note + `card` four care stamps.
2. Anchor seat north → 은호/window → `room` north=window + `notes` Eunho choice.
3. Place remaining clockwise → east소연,south지후,west미정 → `notes` relative positions + `room` direction diagram.
4. Match ribbons/seat numbers → north2,east5,south7,west1 (clockwise2571 if existing rule retained) → `gifts` + deduced seats. Real action: place gift/name cards at seating diagram, not balance gifts on scales.
5. Infer occasion date → June12 is family/adoption anniversary → `date` end of shared roster + `card` flowers/messages instead of food. Exact birthday remains unknown.
6. Reveal addressee and corroborate → 다은 / first family anniversary → unlocked `invitation` adoption signature and unknown birthday field.

Four stages:1 participants,combine2+3 seating,4 ribbon seal,combine5+6 anniversary. Ending: four carers celebrate Daeun becoming family with Bomi; outer Bomi name lowers social burden. Do not establish actual cat birthday. Fifth place is a sequel trace, not a missing fifth puzzle participant.

### Studio / 사진을 기다린 사람

Keep the already coherent six native studio steps; remove v35 decorative extra bundle entirely. These belong to photographic preparation:
1. Raking light on envelope → C3 plus ambiguous “주인 거예요” → `paper`; clue is physically revealed, not printed before tilt. Hints should say move angle gradually, never32–40.
2. Retrieve sleeve → C3 → envelope notation + independently labeled `drawer` cabinet.
3. Order strips and choose marked frame → 1–24/MIRU400 correctly facing/frame23 → `film` edge labels, markings; input canvas itself can hold physical observation clues because it is the artifact, but not an answer summary.
4. Prepare enlarger → white off/red on,8×10,sharp focus,12sec → `light`,`wall`,`drawer` sleeve. Separate source links from input dialog. ★4–5 add proof tags for size/time/safety rather than narrower slider tolerances.
5. Develop → red development,yellow stop,blue fixing → external `procedure` wall poster. Do not duplicate the entire process poster in the input instructions at high levels.
6. Identify displayed portrait → photo-shop owner, photographed by 윤서 → `wall` apron crescent + developed image + `portrait-back` “사장님 사진1호” and “이번엔 제가 찍을게요”. Mount print in exhibition frame; choice is thematic action.

Four stages combine1+2 retrieval and4+5 printing. Ending: grandfather kept promise to print together, not an uncollected image of Yoonseo. Yoonseo and grandfather return before exposure, work together, and exhibit the owner's first portrait. Canon2006March/twenty years/handwritten contemporary back label must stay.

### Ohang / 오행당

Retain symbolic objects with *symbolic* relations; remove arbitrary numeric weighing and marble channels. Source names already exist in `ohang.js`:
1. Choose personal reservation line → keep/release/share, all valid → `brief` carbon-copy intake; not graded fortune.
2. Arrange helping-cycle bowls from profile seed → cycle 목화토금수 rotated at `profile.seed` → `circle` cycle inscription + `profile` seed (derive, do not print full rotated order).
3. Place compass objects → north수/east목/south화/west금/center토 → `directions` cloth plus `symbols` color/object table, displayed externally as two artifacts.
4. Set controlling relationship latch → element preceding target in 목토수화금 cycle → `directions` arrow rule + `profile.companion`; preserve existing companion-derived target semantics. No arbitrary grams or fabricated unseen bowls.
5. Match folded copy against intake original → player's exact chosen line + E[seed].image → `reserve` player copy and unlocked `reveal` today's carbon original; record matching demonstrates present authorship.
6. Finish recipient/choice → 다음의 나에게, final object any valid user choice → `reveal` folded recipient field + initial `brief` empty intake box. This final object is ungraded, not a hidden correct fortune.

Four stages:1 reservation,combine2+3 bowls/map,4 relation latch,combine5+6 original/recipient. Ending: today's intake carbon copy, not prior prophecy. Birthday-derived symbols color imagery; user choices determine the letter and final object. Unknown birth time/ambiguous solar boundaries remain supported. Do not recalculate calendar folklore or change astronomy in this fictional audit.

## Suggested source-specific hint wording patterns

- Time correction H1 “장비 점검 영수증을 찾아보세요”; H2 “같은 순간 두 시계가 가리킨 값이 다릅니다”; H3 “빠른 시계에서 차이를 빼세요 자정을 넘으면 날짜도 바뀝니다”. Never final HHMM/date.
- Coordinate H1 “배치도와 필름 관찰도를 나란히 보세요”; H2 “주차장과 뒤편 촬영 방향을 고려하세요”; H3 “첫 창문 행은 1층이 아닙니다”. Never502/3123.
- Chain H1 “끝 표시와 다음 시작 표시를 확인하세요”; H2 “말이나 그림이 비슷해도 연결 표식이 다를 수 있습니다”; H3 “다음 기록이 없는 갈래 하나를 제외해보세요”. Never ABCD/full registry chain.
- Route H1 “옛 승강장 안내와 이용내역을 비교하세요”; H2 “전체 시간에는 환승 전 구간도 포함됩니다”; H3 “시간과 요금이 같은 반대 방향도 있으니 세 조건을 모두 확인하세요”. Never243/full route.
- Seating H1 “자리표와 네 사람의 메모를 찾으세요”; H2 “창가에서 시작해 같은 방향으로 한 칸씩 이동합니다”; H3 “택배 물품은 네 사람의 선물에 포함되지 않습니다”. Never full seating/code.
- Identity/ending H1 “닮은 모습보다 연결된 기록을 보세요”; H2 “접수번호·중간 연결번호·현재 번호를 이어 확인하세요”; H3 “사진의 날짜·장소·끈도 맞아야 발견자를 연결할 수 있습니다”. Never culprit/finder name before finding.

## Implementation guardrails

1. Replace generic `spec(kind,level,index)` with theme stages containing canonical record IDs, answer schema, evidence requirements and explain-after-pass text. Numerical correctness alone is insufficient for ★4–5; require actual supporting record IDs or table-row keys.
2. Source buttons return to exact stage/draft, including opening another available scene record; locked source links must not grant their contents.
3. Final ending reveal remains gated by completed deduction and deliberate final action; atmosphere captions do not pre-reveal culprits.
4. Do not let `read` booleans act as correctness. A source may be opened accidentally; validation checks player's reconstruction.
5. Audit legacy hints in `app.js`, episode JSON `hints`, studio custom hint UI and ohang custom hint UI as well as `adventure.js`; several independently still print complete solutions.
6. Add ending explanatory cards linking claim to the specific record/table row used. Canonical story explanation must match retained endings above, including intentional ambiguity and exclusions.
