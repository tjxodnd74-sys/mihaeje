// Headless playthrough of a v2-engine episode (play.html?case=<id>). Currently: station.
import * as L from './playlib.mjs';

const shots = process.env.WALK_SHOTS; // directory for screenshots, optional
async function shot(page, name) { if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: false }); }
const dlgHas = async (page, text) => (await L.dialogText(page)).includes(text);
async function commit(page) { await L.click(page, '', { within: 'dialog[open] .v2-actions' }); await L.sleep(250); }
async function status(page) { return page.evaluate(() => document.querySelector('dialog[open] .v2-status')?.textContent.trim() || ''); }
async function hotspot(page, label) {
  const ok = await page.evaluate((label) => { const b = [...document.querySelectorAll('.v2-hotspot')].find((x) => x.getAttribute('aria-label') === label); if (!b) return false; b.click(); return true; }, label);
  if (!ok) throw new Error('hotspot not found ' + label);
  await page.waitForSelector('dialog[open]', { timeout: 1500 }).catch(() => {}); // 물건 쪽으로 다가간 뒤 창이 열림
  await L.sleep(120);
}
async function goPlace(page, label) {
  await page.evaluate(() => document.querySelector('.v2-where')?.click());
  await L.click(page, label, { within: '.v2-places', exact: true });
  await L.sleep(250);
}

async function station({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== station v2' + (mobile ? ' (mobile)' : ''));
  try {
    await L.fresh(page, '/play.html?case=station');
    await shot(page, 'intro');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('여기서 시작'), 'opening shown');
    await shot(page, 'opening');
    await L.click(page, '중앙역 대합실로');
    await L.sleep(400);
    L.check(await page.evaluate(() => document.querySelector('.v2-hud-btn.bag')?.getAttribute('aria-label') === '자료 0 / 11'), 'doc counter starts at 0/11');
    // 아직 아무것도 안 읽었을 때: 장치 옆 자료는 잠겨 있어야 함
    await hotspot(page, '열차 안내판');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].every((t) => t.disabled)), 'bench docs locked before reading');
    L.check(await page.evaluate(() => { const f = document.querySelector('dialog[open] .grille-flash'); return !!f && f.textContent.includes('3번 승강장') && !f.textContent.includes('수림'); }), 'grille: board flash shows no destination');
    await L.closeDialog(page);
    // read docs in hall
    for (const [h, d] of [['옆자리에 내려놓은 휴대폰', '민서의 마지막 메시지'], ['벽에 기댄 옛 표지판', '벽에 기댄 옛 표지판'], ['매표창구의 역무원', '네 시 반 첫 열차'], ['승강장 개편 안내', '승강장 개편 안내']]) { await hotspot(page, h); L.check(await dlgHas(page, d), 'doc opens: ' + h); await L.closeDialog(page); }
    L.check(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot:not(.go)')].every((b) => { const x = parseFloat(b.style.left), y = parseFloat(b.style.top); return y <= 80 && x >= 6 && x <= 94; })), 'hall: hotspots clear of dialogue and edges');
    await shot(page, 'hall');
    // unread nudge in index
    await L.click(page, '자료 4 / 11');
    L.check(await dlgHas(page, '자료 목록'), 'index opens');
    await L.closeDialog(page);
    // hints: tier flow
    await L.click(page, '힌트');
    L.check((await L.buttons(page)).includes('첫 힌트 받기'), 'hints start closed (no guide in device)');
    await L.closeDialog(page);
    // grille: wrong then right (읽은 자료는 옆에 펼쳐짐)
    await hotspot(page, '열차 안내판');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].every((t) => !t.disabled)), 'bench docs unlocked after reading');
    await commit(page);
    L.check((await status(page)).includes('하나씩 골라야'), 'grille: empty choice explained');
    await L.click(page, '1번 승강장'); await L.click(page, '둘째 기둥'); await commit(page);
    L.check((await status(page)).includes('구간권을 안내판에'), 'grille: unread holes neutral — ' + (await status(page)));
    L.check(!(await L.dialogText(page)).includes('구멍으로 보이는 글자'), 'grille: no auto-read line');
    const holesNow = () => page.evaluate(() => [...document.querySelectorAll('dialog[open] .grille-board .cell.hole')].map((c) => c.textContent).join(''));
    await L.click(page, '구간권 오른쪽으로'); await L.click(page, '구간권 아래로');
    L.check((await holesNow()) !== '3번둘째기둥', 'grille: unturned ticket does not read — ' + (await holesNow()));
    await L.click(page, '구간권 90도 돌리기');
    L.check((await holesNow()) === '3번둘째기둥', 'grille: turned once, right 1, down 1 reads 3번둘째기둥 — ' + (await holesNow()));
    await commit(page);
    L.check((await status(page)).includes('아무것도'), 'grille: old number taken literally is neutral — ' + (await status(page)));
    await L.click(page, '2번 승강장'); await commit(page);
    L.check(await dlgHas(page, '2번 승강장, 둘째 기둥'), 'grille solved reveal');
    await shot(page, 'reveal1');
    await L.click(page, '2번 승강장 · 둘째 기둥으로');
    await L.sleep(400);
    L.check((await L.mainText(page)).includes('스피커가 지직거리더니'), 'platform scene reached');
    await shot(page, 'platform');
    for (const d of ['기둥에 붙은 네컷사진', '기둥의 출발 시각표', '벤치 — 민서와 나']) { await hotspot(page, d); await L.closeDialog(page); }
    // mirror
    await hotspot(page, '승강장 끝의 볼록거울');
    await shot(page, 'mirror');
    const train = (t, to) => page.evaluate(([t, to]) => [...document.querySelectorAll('dialog[open] .train')].find((b) => b.textContent.includes(t) && b.textContent.includes(to))?.click(), [t, to]);
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .train').length === 8 && !document.querySelector('dialog[open] .train.dim')), 'mirror: one mixed departure list');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .mirror-paper'))), 'mirror: no text on glass before holding');
    await train('09:25', '산장행');
    await commit(page);
    L.check((await status(page)).includes('못 읽었다'), 'mirror: unread back side explained — ' + (await status(page)));
    await L.click(page, '거울 앞에 들기');
    await commit(page);
    L.check((await status(page)).includes('비뚤다'), 'mirror: not aligned explained — ' + (await status(page)));
    await L.setRange(page, '사진 기울이기', 50);
    await commit(page);
    L.check((await status(page)).includes('비뚤다'), 'mirror: slider middle is not the answer — ' + (await status(page)));
    L.check(await dlgHas(page, '받침대 눈금'), 'mirror: bracket scale shown');
    await L.setRange(page, '사진 기울이기', 70);
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .mirror-glass.aligned')), 'mirror: red mark tilt aligns');
    await train('09:58', '수림행');
    await commit(page);
    L.check((await status(page)).includes('아닌 것 같다'), 'mirror: other Surim train neutral — ' + (await status(page)));
    await train('09:40', '강변행');
    await commit(page);
    L.check((await status(page)).includes('아닌 것 같다'), 'mirror: same time other line neutral — ' + (await status(page)));
    await train('09:25', '산장행');
    await commit(page);
    L.check((await status(page)).includes('아닌 것 같다'), 'mirror: wrong time neutral — ' + (await status(page)));
    await train('09:40', '수림행');
    await commit(page);
    L.check(await dlgHas(page, '09:40 수림행 급행'), 'mirror solved');
    await L.click(page, '수림역 · 보관함으로');
    await L.sleep(400);
    for (const d of ['게시판의 그림엽서', '벽에 붙은 보관함 안내문']) { await hotspot(page, d); await L.closeDialog(page); }
    await shot(page, 'surim');
    // locker
    await hotspot(page, '별 스티커가 붙은 보관함');
    await L.click(page, '1번째 다이얼 올리기'); await L.click(page, '1번째 다이얼 올리기'); await L.click(page, '1번째 다이얼 올리기');
    await commit(page);
    const st = await status(page);
    L.check(st.includes('다시 센다') && !st.includes('자리'), 'locker: wrong without digit leak — ' + st);
    for (let i = 0; i < 2; i++) await L.click(page, '2번째 다이얼 올리기');
    for (let i = 0; i < 4; i++) await L.click(page, '3번째 다이얼 올리기');
    await L.click(page, '4번째 다이얼 올리기');
    await shot(page, 'locker');
    await commit(page);
    L.check(await dlgHas(page, '3 · 2 · 4 · 1') && await dlgHas(page, '사원증'), 'locker solved');
    await L.click(page, '수림 마을길로');
    await L.sleep(400);
    L.check((await L.mainText(page)).includes('길바닥에 펴 놓고') && !(await L.mainText(page)).includes('벤치에 보관함에서 꺼낸'), 'village: text matches empty bench');
    for (const d of ['민서의 편지', '손지도']) { await hotspot(page, d); await L.closeDialog(page); }
    L.check(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot:not(.go)')].every((b) => { const x = parseFloat(b.style.left), y = parseFloat(b.style.top); const r = b.style.getPropertyValue('--hit'); return y <= 80 && x >= 6 && x <= 94 && (!r || parseFloat(r) >= 8); })), 'village: hotspots big enough and clear of dialogue');
    // notes: deduction (walk hidden until solved)
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '마을로 걸어가기'))), 'walk hidden before notes');
    await hotspot(page, '쪽지 세 장');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .pick-row .chip'))), 'notes: no house pick here (only in walk)');
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .note-card')][0].click()); await commit(page);
    L.check((await status(page)).includes('앞뒤가 안 맞는다'), 'notes: neutral — ' + (await status(page)));
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .note-card')][2].click()); await commit(page);
    L.check((await status(page)).includes('앞뒤가 안 맞는다'), 'notes: neutral 2 — ' + (await status(page)));
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .note-card')][1].click()); await commit(page);
    L.check(await dlgHas(page, '거짓말은 나'), 'notes solved');
    await L.click(page, '계속'); await L.sleep(400);
    // walk: wrong first turn
    await hotspot(page, '마을로 걸어가기');
    await L.click(page, '오른쪽'); await L.click(page, '왼쪽'); await L.click(page, '첫째 집'); await commit(page);
    L.check((await status(page)).includes('열쇠가 안 들어간다'), 'walk: reversed start neutral — ' + (await status(page)));
    await L.click(page, '역 앞으로 되돌아가기');
    await L.click(page, '왼쪽'); await L.click(page, '직진'); await L.click(page, '오른쪽'); await L.click(page, '직진 (다리 건너기)'); await L.click(page, '왼쪽');
    L.check(await dlgHas(page, '둘째 집') && await dlgHas(page, '파랑 대문'), 'walk: gate colours shown on the lane');
    L.check(await dlgHas(page, '들어선 쪽에서 가까운 집부터') && await page.evaluate(() => document.querySelectorAll('dialog[open] .map-num').length === 4), 'walk: counting start stated and houses numbered on map');
    await L.click(page, '넷째 집'); await commit(page);
    L.check((await status(page)).includes('열쇠가 안 들어간다'), 'walk: third blue gate (no persimmon) neutral — ' + (await status(page)));
    await L.click(page, '둘째 집'); await commit(page);
    L.check((await status(page)).includes('열쇠가 안 들어간다'), 'walk: other blue gate neutral — ' + (await status(page)));
    await L.click(page, '첫째 집'); await commit(page);
    L.check((await status(page)).includes('열쇠가 안 들어간다'), 'walk: persimmon but green gate neutral — ' + (await status(page)));
    await L.click(page, '셋째 집');
    await shot(page, 'walk');
    await commit(page);
    L.check(await dlgHas(page, '파란 대문'), 'walk solved');
    await L.click(page, '대문 안으로');
    await L.sleep(500);
    const t = await L.mainText(page);
    L.check(t.includes('없는 승강장에서 온 초대'), 'ending reached');
    L.check(t.includes('벌써 벤치 옆에 나와 있던데') && t.includes('방송을 넣은 적이 없다'), 'ending: eerie threads tied back');
    await shot(page, 'ending');
    await L.click(page, '마지막 장 읽기');
    L.check(await dlgHas(page, '수박 잘라 놨어'), 'final letter unlocked');
    await L.closeDialog(page);
    await L.click(page, '자료 다시 보기');
    const idx = await L.dialogText(page);
    L.check(!idx.includes('아직 읽지 않은'), 'all docs read at the end');
    await L.closeDialog(page);
    // resume works
    await page.reload(); await L.sleep(600);
    L.check((await L.mainText(page)).includes('없는 승강장에서 온 초대'), 'ending persists after reload');
  } catch (e) {
    console.log('FAIL exception', e.message);
    console.log('buttons now', JSON.stringify(await L.buttons(page)));
    console.log('dialog', (await L.dialogText(page)).replace(/\n+/g, ' | ').slice(0, 400));
    process.exitCode = 1;
  }
  const bad = errors.filter((e) => !/woff2/.test(e));
  L.check(!bad.length, 'no page errors ' + JSON.stringify(bad));
  await browser.close();
}


async function catInvite({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== cat-invite v2' + (mobile ? ' (mobile)' : ''));
  const bagOpen = async (title) => { await page.evaluate(() => document.querySelector('.v2-hud-btn.bag').click()); await L.sleep(250); await L.click(page, title, { within: 'dialog[open]' }); };
  try {
    await L.fresh(page, '/play.html?case=cat-invite');
    L.check((await L.mainText(page)).includes('★★☆☆☆'), '2 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('봄이가 알아요'), 'opening shown');
    await L.click(page, '가게 안을 둘러본다'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('봉투만 보고 있다'), 'shop arrive matches picture (cat awake)');
    await hotspot(page, '문 밑으로 들어온 봉투'); L.check(await dlgHas(page, '줄마다 글씨가 다르다') && await page.evaluate(() => !!document.querySelector('dialog[open] .stamp-zoom svg')), 'doc: invite with stamp close-up'); await L.closeDialog(page);
    await hotspot(page, '봄이 목걸이의 참'); L.check(!(await dlgHas(page, '동물병원, 빵집')), 'charm: no shop names spelled out'); await L.closeDialog(page);
    // fold: 포장지 띠 접기 (칸을 접어 넣어 반쪽 글자 맞붙이기) — 풀기 전엔 골목으로 못 나감
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '골목으로 나가기'))), 'alley exit hidden before fold');
    await hotspot(page, '작업대 위 포장지 띠');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .fold-panel').length === 7), 'fold: 7 panels');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .fold-panel, dialog[open] .fold-undo .chip')].every((b) => { const r = b.getBoundingClientRect(); return r.width >= 40 && r.height >= 40; })), 'fold: panels big enough to tap');
    await commit(page);
    L.check((await status(page)).includes('엇갈려'), 'fold: unfolded explained — ' + (await status(page)));
    await L.click(page, '3번째 칸 접어 넣기', { exact: true }); await L.click(page, '4번째 칸 접어 넣기', { exact: true }); await commit(page);
    L.check((await status(page)).includes('맞물리지 않는다') && !(await dlgHas(page, '병원 창턱')), 'fold: wrong neutral — ' + (await status(page)));
    await L.click(page, '4번째 칸 펴기', { exact: true });
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .fold-panel').length === 6), 'fold: unfold one panel');
    await L.click(page, '6번째 칸 접어 넣기', { exact: true }); await commit(page);
    L.check(await dlgHas(page, '미정 씨의 포장지') && await dlgHas(page, '병원 창턱'), 'fold solved');
    await shot(page, 'cat-fold-solved');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('오늘 휴진'), 'alley reached (closing fold reveal moves on)');
    await hotspot(page, '병원 유리문의 쪽지'); await L.closeDialog(page);
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '빵집 앞 바구니'))), 'basket hidden before box');
    // seasons: 뚜껑 안쪽 주머니 다섯
    await hotspot(page, '창턱의 상자');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .v2-guide'))), 'no in-device guide');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .boxlid img').length === 1 && document.querySelectorAll('dialog[open] .pocket').length === 5), 'seasons: box lid photo + 5 pockets');
    if (mobile) L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .photo-pick')].every((b) => b.getBoundingClientRect().width >= 90)), 'seasons: mobile photos big enough to see kitten vs grown cat (3 + 2)');
    await commit(page);
    L.check((await status(page)).includes('다섯을 다 채워야'), 'seasons: empty explained');
    const trayH = await page.evaluate(() => document.querySelector('dialog[open] .photo-tray').getBoundingClientRect().height);
    for (const l of ['벚꽃 아래 A', '수박 옆', '낙엽 위', '눈 오는 날', '벚꽃 아래 B']) await L.click(page, l + ' 사진 넣기', { exact: true });
    L.check(Math.abs(trayH - await page.evaluate(() => document.querySelector('dialog[open] .photo-tray').getBoundingClientRect().height)) < 2, 'seasons: tray keeps its height (no jump)');
    await commit(page);
    L.check((await status(page)).includes('읽히지 않는다') && !(await dlgHas(page, '빵집바구니')) && !(await page.evaluate(() => !!document.querySelector('dialog[open] .back-word'))), 'seasons: wrong order hides back letters — ' + (await status(page)));
    await L.click(page, '1번째 주머니: 벚꽃 아래 A', { exact: true });
    await L.click(page, '5번째 주머니: 벚꽃 아래 B', { exact: true });
    await L.click(page, '벚꽃 아래 B 사진 넣기', { exact: true }); await L.click(page, '벚꽃 아래 A 사진 넣기', { exact: true });
    await commit(page);
    L.check(await dlgHas(page, '두 번의 봄') && await dlgHas(page, '빵집바구니'), 'seasons solved, word revealed');
    await shot(page, 'cat-seasons-solved');
    await L.click(page, '계속'); await L.sleep(300);
    await bagOpen('은호 씨 병원의 발도장 기록'); L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .paw-book .paw').length === 4), 'booklet in bag: 4 paw prints'); await L.closeDialog(page);
    await hotspot(page, '벤치 위 쪽지'); L.check(await dlgHas(page, '가게 밖에 내건 간판이나 차양 색'), 'basket note'); await L.closeDialog(page);
    // gifts: 바구니 이름표 (고르는 중 상태가 다음에 열 때 남지 않아야)
    await hotspot(page, '빵집 앞 바구니');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .basket .tag').length === 4), 'gifts: 4 tags on basket photo');
    const nameY = async () => page.evaluate(() => document.querySelector('dialog[open] .name-box').getBoundingClientRect().height);
    const h0 = await nameY();
    await L.click(page, '파란 리본 상자의 이름표');
    L.check(Math.abs(h0 - await nameY()) < 2, 'gifts: picking a tag does not move layout');
    await L.closeDialog(page); await L.sleep(300);
    await hotspot(page, '빵집 앞 바구니');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .name-box .chip')].every((c) => c.disabled)), 'gifts: reopened with no stale pick');
    await L.click(page, '파란 리본 상자의 이름표');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .name-box .chip')].some((c) => !c.disabled)), 'gifts: first click after reopen works');
    const name = async (gift, who) => { await L.click(page, gift + '의 이름표'); await L.click(page, gift + (/[가-힣]$/.test(gift) && (gift.charCodeAt(gift.length - 1) - 0xac00) % 28 ? '은 ' : '는 ') + who, { exact: true }); };
    await L.click(page, '파란 리본 상자는 소연', { exact: true }); await commit(page);
    L.check((await status(page)).includes('아직 비어'), 'gifts: missing explained');
    await name('노란 리본 상자', '은호'); await name('초록 리본 봉투', '지후'); await name('리본 없는 꽃다발', '미정'); await commit(page);
    L.check((await status(page)).includes('바닥이 비어'), 'gifts: wrong neutral — ' + (await status(page)));
    await name('파란 리본 상자', '지후'); await name('노란 리본 상자', '소연'); await name('초록 리본 봉투', '은호'); await commit(page);
    L.check(await dlgHas(page, '네 사람, 네 색'), 'gifts solved');
    await shot(page, 'cat-gifts-solved');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('해가 기울고'), 'closing reveal with X still moves to next scene');
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '평상 차리기'))), 'seats hidden before mailbox');
    // mailbox: 트레이싱지 겹쳐 보기 + 네 자리
    await hotspot(page, '자물쇠 달린 우체통');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .paw-book.live .paw-cell').length === 4), 'mailbox: 4 paw prints');
    await L.click(page, '3번째 발도장에 트레이싱지 얹기', { exact: true });
    L.check(await page.evaluate(() => !!document.querySelectorAll('dialog[open] .paw-book.live .paw-cell')[2].querySelector('.tracing')), 'mailbox: tracing laid on print 3');
    if (mobile) L.check(await page.evaluate(() => { const z = document.querySelector('dialog[open] .trace-zoom'); return !!z && z.getBoundingClientRect().width > 140 && !!z.querySelector('.tracing') && z.querySelectorAll('.paw').length === 2; }), 'mailbox: mobile big view shows the print under the tracing');
    const setMail = async (digits) => { for (let i = 0; i < 4; i++) { const cur = await page.evaluate((i) => Number(document.querySelectorAll('dialog[open] .mail-dials .num')[i].textContent), i); for (let k = 0; k < (digits[i] - cur + 10) % 10; k++) await L.click(page, `${i + 1}번째 자리 올리기`, { exact: true }); } };
    await setMail([0, 6, 1, 2]); await commit(page); L.check((await status(page)).includes('오늘이다'), 'mailbox: invite-date trap message');
    await setMail([0, 3, 2, 8]); await commit(page); L.check((await status(page)).includes('꿈쩍'), 'mailbox: neutral wrong');
    await setMail([0, 4, 1, 6]); await shot(page, 'cat-mailbox'); await commit(page);
    L.check(await dlgHas(page, '봄이의 앞발'), 'mailbox solved');
    await L.click(page, '우체통의 봉투 보기'); L.check(await dlgHas(page, '자리표 종이 아래'), 'mail via reveal'); await L.closeDialog(page); await L.closeDialog(page).catch(() => {}); await L.sleep(300);
    await hotspot(page, '평상 차리기');
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .paperchart img') && !!document.querySelector('dialog[open] .chart-on-paper svg') && !!document.querySelector('dialog[open] .seat-notes')), 'seats: chart on paper + requests');
    L.check(!(await L.buttons(page)).includes('봄이 평상에 내려놓기'), 'seats: no commit until 4 gifts');
    const put = async (seat, gift, who) => { await L.click(page, `${gift} (${who}) 들기`, { exact: true }); await page.evaluate((lab) => [...document.querySelectorAll('dialog[open] [data-seat]')].find((g) => g.getAttribute('aria-label').startsWith(lab)).dispatchEvent(new MouseEvent('click', { bubbles: true })), seat + ' 방석'); await L.sleep(150); };
    const clearAll = async () => { for (let k = 0; k < 4; k++) { const n = await page.evaluate(() => { const g = [...document.querySelectorAll('dialog[open] [data-seat]')].find((x) => x.getAttribute('aria-label').includes(': ')); if (!g) return 0; g.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 1; }); if (!n) break; await L.sleep(120); await page.evaluate(() => document.querySelector('dialog[open] .gift-chip.holding')?.click()); await L.sleep(120); } };
    await put('감나무 쪽', '초록 봉투', '은호'); await put('우체통 쪽', '노란 상자', '소연'); await put('꽃집 쪽', '파란 상자', '지후'); await put('골목 입구 쪽', '꽃다발', '미정'); await commit(page);
    L.check((await status(page)).includes('내 품으로'), 'seats: wrong neutral — ' + (await status(page)));
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] [data-seat] text')].some((t) => t.textContent === '감나무 쪽')), 'seats: seat names stay visible under gifts');
    await clearAll();
    await put('꽃집 쪽', '초록 봉투', '은호'); await put('골목 입구 쪽', '노란 상자', '소연'); await put('감나무 쪽', '꽃다발', '미정'); await put('우체통 쪽', '파란 상자', '지후'); await commit(page);
    L.check(await dlgHas(page, '봄이가 고른 자리'), 'seats solved');
    await shot(page, 'cat-seats-solved');
    await L.click(page, '저녁 일곱 시, 평상으로'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('고양이가 데려온 사람들') && (await L.mainText(page)).includes('딸기 케이크'), 'ending reached (text matches picture)');
    await L.click(page, '평상 밑 봉투의 초대장 읽기');
    L.check(await dlgHas(page, '다은 씨 이웃이 됐어요'), 'final letter unlocked');
    await L.closeDialog(page);
    await L.click(page, '자료 다시 보기');
    L.check(!(await L.dialogText(page)).includes('아직 읽지 않은'), 'all docs read');
  } catch (e) {
    console.log('FAIL exception', e.message);
    console.log('buttons now', JSON.stringify(await L.buttons(page)));
    console.log('dialog', (await L.dialogText(page)).replace(/\n+/g, ' | ').slice(0, 400));
    process.exitCode = 1;
  }
  const bad = errors.filter((e) => !/woff2/.test(e));
  L.check(!bad.length, 'no page errors ' + JSON.stringify(bad));
  await browser.close();
}

async function ohang({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== ohang v2' + (mobile ? ' (mobile)' : ''));
  try {
    await L.fresh(page, '/play.html?case=ohang');
    L.check((await L.mainText(page)).includes('★★★☆☆'), '3 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('화분 다섯 개가 그대로') && (await L.mainText(page)).includes('이번 달 안에 정리할'), 'opening shown (with 이모 line)');
    await L.click(page, '접수표 쓰기'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('오행당 접수표') && (await L.mainText(page)).includes('예 1998/3/15'), 'intake form shown with date example');
    await L.click(page, '접수표 내기');
    L.check((await L.mainText(page)).includes('생일을 적어야'), 'intake: empty date explained');
    // 생일 범위는 1960/1/1~2016/12/31 밖이면 범위만 부드럽게 알려 준다
    await page.fill('input[name=date]', '2018-07-01'); await page.fill('input[name=time]', '12:00'); await L.click(page, '접수표 내기'); await L.sleep(1200);
    L.check((await L.mainText(page)).includes('2016/12/31까지') && !(await L.mainText(page)).includes('할머니가 세는 법대로'), 'intake: out-of-range birth gently refused');
    // PC는 2012년 8월생 10대(늦여름 → 대추차, 어린 장부), 모바일은 예시 손님 5월생(여름 → 오미자차) — 생일 철에 따라 차 통 답이 바뀐다
    if (mobile) { await L.click(page, '생일 대신 예시 손님으로 해 보기'); await L.sleep(1500); }
    else { await page.fill('input[name=date]', '2012-08-20'); await page.fill('input[name=time]', '14:10'); await L.click(page, '접수표 내기'); await L.sleep(1500); }
    const TEA = mobile ? '오미자차' : '대추차';
    const lightText = await page.evaluate(() => document.querySelector('.slip-light b')?.textContent || '');
    L.check(/[木火土金水]/.test(lightText), 'intake: light computed — ' + lightText);
    L.check((await L.mainText(page)).includes('할머니라면 이렇게 읽는다') && (await L.mainText(page)).includes('30분 빼고'), 'intake: reading shown with 30-min note');
    await page.reload(); await L.sleep(900);
    L.check((await L.mainText(page)).includes('할머니가 세는 법대로') && (await page.evaluate(() => document.querySelector('.slip-light b')?.textContent || '')) === lightText, 'intake: result survives reload');
    const ID = { '木': 'blue', '火': 'red', '土': 'yellow', '金': 'white', '水': 'black' };
    const PREV = { red: 'blue', yellow: 'red', white: 'yellow', black: 'white', blue: 'black' };
    const CONTROL = { blue: 'yellow', yellow: 'black', black: 'red', red: 'white', white: 'blue' };
    const NEXT = { blue: 'red', red: 'yellow', yellow: 'white', white: 'black', black: 'blue' };
    const POT = { blue: '청자 빛 화분', red: '붉은 화분', yellow: '노란 화분', white: '흰 화분', black: '검은 화분' };
    const LAN = { blue: '청자 빛 등', red: '붉은 등', yellow: '노란 등', white: '흰 등', black: '검은 등' };
    const me = ID[lightText.match(/[木火土金水]/)[0]];
    const order = [me]; while (order.length < 5) order.push(CONTROL[order[order.length - 1]]);
    const cycle = [me]; while (cycle.length < 5) cycle.push(NEXT[cycle[cycle.length - 1]]);
    await L.click(page, '접수표 들고 문 앞으로'); await L.sleep(400);
    L.check(await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('mihaeje-v2-ohang') || '{}'); return ['myslip', 'chat'].every((k) => (s.found || []).includes(k)); }), 'my slip and phone are in the bag from the start');
    // 할머니 문자는 소지품에서 (주머니 속 휴대폰 누름 자리는 그림에 없어서 뺐다)
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => /휴대폰/.test(b.getAttribute('aria-label'))))), 'front: no hotspot on an undrawn pocket phone');
    await page.evaluate(() => document.querySelector('.v2-hud-btn.bag').click()); await L.sleep(300); await L.click(page, '할머니의 문자'); L.check(await dlgHas(page, '네 빛 낳아준놈 밑에'), 'doc: grandma chat from the bag'); await L.closeDialog(page);
    await hotspot(page, '문에 붙은 종이'); L.check(await dlgHas(page, '서로 낳는 순서'), 'doc: 문에 붙은 종이'); await L.closeDialog(page);
    L.check(await page.evaluate(() => ['청자 빛 화분', '붉은 화분', '노란 화분', '흰 화분', '검은 화분'].every((l) => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === l))), 'front: one hotspot per pot');
    L.check(await page.evaluate(() => !!document.querySelector('.cycle-chart')) === false, 'chart only inside dialog');
    // pots: 내 빛을 낳는 빛의 화분 (사람마다 다름)
    await hotspot(page, '흰 화분');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .v2-guide'))), 'no in-device guide');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .potstep .pot').length === 5), 'pots: 5 pots on photo');
    L.check(!(await L.buttons(page)).some((b) => b === '화분 들어 보기'), 'pots: no commit before pick');
    await L.click(page, POT[me], { exact: true }); await commit(page);
    L.check((await status(page)).includes('젖은 흙뿐') && !(await status(page)).includes('화살표'), 'pots: wrong pot neutral — ' + (await status(page)));
    await L.click(page, POT[PREV[me]], { exact: true }); await commit(page);
    L.check(await dlgHas(page, '내 빛을 낳는 빛'), 'pots solved with the pot that births my light');
    await shot(page, 'ohang-pots');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('약재 냄새'), 'auto-moved inside after closing reveal');
    for (const d of ['벽에 걸린 사진', '메뉴판', '찬장에 붙은 메모']) { await hotspot(page, d); L.check(await dlgHas(page, d), 'doc: ' + d); if (d === '벽에 걸린 사진') { L.check(!/20\d\d년/.test(await L.dialogText(page)), 'photo: no fixed year'); const src = await page.evaluate(() => document.querySelector('dialog[open] .oldphoto img')?.getAttribute('src') || ''); L.check(me === 'red' ? /oldphoto\.webp/.test(src) : src.includes('oldphoto-' + me), 'photo: teapot shows my light\'s tea — ' + src); } await L.closeDialog(page); }
    await hotspot(page, '접수대 서랍의 공책'); L.check(await dlgHas(page, '손님 빛 읽는 법') && await page.evaluate(() => !!document.querySelector('dialog[open] .reading-item.mine')), 'notebook doc highlights my light'); await L.closeDialog(page);
    // bowls
    await hotspot(page, '찬장과 다섯 그릇');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .cabinet .niche').length === 5 && document.querySelectorAll('dialog[open] .bowl-pick').length === 5), 'bowls: 5 niches + 5 bowls');
    const put = async (bowl, niche) => { await L.click(page, bowl + ' 집기', { exact: true }); await L.click(page, niche + ' (비어 있음)', { exact: true }); };
    await put('검은 그릇', '위 칸'); await put('흰 그릇', '왼쪽 칸'); await put('노란 그릇', '가운데 칸'); await put('청자 빛 그릇', '오른쪽 칸'); await commit(page);
    L.check((await status(page)).includes('빈 칸'), 'bowls: empty niche explained');
    await put('붉은 그릇', '아래 칸');
    L.check((await L.dialogText(page)).includes('보자기 위가 비었다'), 'bowls: empty tray says so');
    await commit(page);
    L.check((await status(page)).includes('꿈쩍 않는다') && !(await status(page)).includes('북쪽'), 'bowls: naive north neutral — ' + (await status(page)));
    for (const n of ['위 칸: 검은 그릇', '왼쪽 칸: 흰 그릇', '오른쪽 칸: 청자 빛 그릇', '아래 칸: 붉은 그릇']) { await L.click(page, n, { exact: true }); await L.click(page, n.split(': ')[1] + ' 집기', { exact: true }); }
    await put('붉은 그릇', '위 칸'); await put('청자 빛 그릇', '왼쪽 칸'); await put('흰 그릇', '오른쪽 칸'); await put('검은 그릇', '아래 칸'); await commit(page);
    L.check(await dlgHas(page, '남쪽을 보고 서서'), 'bowls solved');
    await shot(page, 'ohang-bowls');
    L.check(await dlgHas(page, '할머니 달력'), 'bowls reveal: drawer with ledger + calendar');
    await L.click(page, '서랍 속 접수표 묶음 보기');
    L.check(await dlgHas(page, '오행당 철 나누기') && await dlgHas(page, '한 번도 안 온 철') && !/20\d\d년/.test(await L.dialogText(page)), 'ledger readable, age-based, with calendar');
    L.check(!(await L.dialogText(page)).includes('올해 3월') && (await L.dialogText(page)).includes('빈 접수표'), 'ledger: today\'s blank slip is not a dated spring row');
    await L.closeDialog(page); await L.sleep(400);
    L.check(!(await L.mainText(page)).includes('장부를 쓰던 방'), 'back room still locked after bowls');
    // tins: 태어난 철 = 한 번도 안 온 철의 차
    await hotspot(page, '선반의 차 통');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .tin').length === 5), 'tins: 5 tins');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].some((t) => t.textContent.includes('서랍 속 접수표 묶음') && !t.disabled)), 'tins: ledger on bench');
    const wrongTea = TEA === '유자차' ? '대추차' : '유자차';
    await L.click(page, wrongTea + ' 통', { exact: true }); await commit(page);
    L.check((await status(page)).includes('말린 차뿐'), 'tins: wrong tin neutral — ' + (await status(page)));
    await L.click(page, TEA + ' 통', { exact: true }); await shot(page, 'ohang-tins'); await commit(page);
    L.check(await dlgHas(page, TEA + ' 통') && await dlgHas(page, '「뒷방」'), 'tins solved: ' + TEA);
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('장부를 쓰던 방'), 'auto-moved to back room');
    await hotspot(page, '책상 위 메모'); L.check(await dlgHas(page, '누르는 순서로 다섯 개'), 'doc: desk memo'); await L.closeDialog(page);
    // lanterns: 내 빛부터 누르는 순서(상극)
    await goPlace(page, '1. 오행당 문 앞'); await L.sleep(300);
    await hotspot(page, '살창에 끼워 둔 내 접수표'); L.check(await dlgHas(page, '할머니가 세는 법대로'), 'myslip doc re-readable'); await L.closeDialog(page);
    await goPlace(page, '3. 뒷방'); await L.sleep(300);
    await hotspot(page, '노란 등');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].some((t) => t.textContent.includes('내가 쓴 접수표') && !t.disabled)), 'lanterns: my slip on bench');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .lanternpole .lantern').length === 5), 'lanterns: 5 on photo');
    for (const id of cycle) await L.click(page, LAN[id], { exact: true });
    await commit(page);
    L.check((await status(page)).includes('그대로다'), 'lanterns: birth-order (상생) decoy neutral — ' + (await status(page)));
    await L.click(page, '메모를 등잔에 대 보기');
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .star-chart')), 'lanterns: memo back shows star');
    await L.click(page, '다 끄고 다시');
    for (const id of order) await L.click(page, LAN[id], { exact: true });
    await shot(page, 'ohang-lanterns');
    await commit(page);
    L.check(await dlgHas(page, '내 빛에서 시작해서'), 'lanterns solved');
    await L.click(page, '접수함 속 접수표 보기'); L.check(await dlgHas(page, '가게는 네 거다') && await dlgHas(page, '접수함 밑에') && await dlgHas(page, TEA), 'final readable from reveal, personal');
    L.check((await L.buttons(page)).includes('← 돌아가기'), 'doc offers way back to reveal');
    L.check(await dlgHas(page, '할미 식 고름차') && await dlgHas(page, '모자란 만큼'), 'final letter carries the brew rule');
    L.check(await dlgHas(page, mobile ? '하고 싶으면 해라' : '크면 하고 싶을 때'), 'final letter fits my age');
    L.check(!(await L.buttons(page)).some((b) => b.startsWith('다음 날 아침, 병원으로')), 'lanterns no longer end the story');
    await L.closeDialog(page); await L.sleep(400);
    // brew (고름차): 접수표 다섯 빛 수 → 제일 많은 빛에 나머지를 모자란 만큼 (사람마다 다름)
    L.check((await L.mainText(page)).includes('숟갈을 셀 차례'), 'moved back inside for the brew');
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '선반의 차 통'))), 'tins hotspot swapped for the brew');
    const counts = await page.evaluate(() => JSON.parse(localStorage.getItem('mihaeje-v2-ohang') || '{}').profile.counts);
    const TEAOF = { blue: '유자차', red: '오미자차', yellow: '대추차', white: '생강차', black: '쌍화차' };
    const ELS = ['blue', 'red', 'yellow', 'white', 'black'];
    const mx = Math.max(...counts);
    await hotspot(page, '차 통과 주전자');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .tin.scoop').length === 5), 'brew: 5 tins to scoop from');
    L.check(!(await L.buttons(page)).some((b) => b === '불 올려 달이기'), 'brew: no commit with plain water');
    // 함정: 접수표 수를 그대로 베껴 넣기
    for (let i = 0; i < 5; i++) for (let k = 0; k < counts[i]; k++) await L.click(page, TEAOF[ELS[i]] + ' 한 숟갈 넣기');
    await commit(page);
    L.check((await status(page)).includes('맛이 아니다') && !/[0-9]/.test(await status(page)), 'brew: copied counts neutral — ' + (await status(page)));
    await L.click(page, '주전자 비우기');
    L.check((await L.dialogText(page)).includes('맹물'), 'brew: emptied pot');
    for (let i = 0; i < 5; i++) for (let k = 0; k < mx - counts[i]; k++) await L.click(page, TEAOF[ELS[i]] + ' 한 숟갈 넣기');
    await shot(page, 'ohang-brew');
    await commit(page);
    L.check(await dlgHas(page, '할미 식 고름차'), 'brew solved: ' + ELS.map((e, i) => TEAOF[e] + (mx - counts[i])).join(' '));
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.buttons(page)).some((b) => b.startsWith('다음 날 아침, 병원으로')), 'ending button persists in scene after brew');
    await goPlace(page, '3. 뒷방'); await L.sleep(300);
    L.check(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '열린 접수함')), 'open box hotspot in back room');
    await page.evaluate(() => document.querySelector('.v2-hud-btn.bag').click()); await L.sleep(300); L.check(await dlgHas(page, '접수함 속 접수표'), 'letter kept in inventory'); await L.closeDialog(page);
    await L.click(page, '다음 날 아침, 병원으로'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('돌아오는 계절') && (await L.mainText(page)).includes('비어 있는 칸에') && (await L.mainText(page)).includes(TEA + ' 통에 열쇠는'), 'ending reached with choice, birth-season tea');
    L.check((await L.mainText(page)).includes('고름차') && (await L.mainText(page)).includes('숟갈은 맞게 셌네'), 'ending: grandma tastes the brew');
    await L.click(page, '다음 손님은 내가 받을게'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('첫 손님은 이모였다') && (await L.mainText(page)).includes('말이다" 할머니가 찻잔을'), 'ending varies by choice and reads my light');
    L.check(await page.evaluate(() => (document.querySelector('.v2-afterword')?.textContent || '').includes('오행당')), 'share ending: gift stays at the shop');
    await L.click(page, '접수함 속 접수표 읽기');
    L.check(await dlgHas(page, '가게는 네 거다') && await dlgHas(page, '챙겨 뒀다'), 'final letter unlocked, personalized');
    await L.closeDialog(page);
    await L.click(page, '자료 다시 보기');
    L.check(!(await L.dialogText(page)).includes('아직 읽지 않은'), 'all docs read');
  } catch (e) {
    console.log('FAIL exception', e.message);
    console.log('buttons now', JSON.stringify(await L.buttons(page)));
    console.log('dialog', (await L.dialogText(page)).replace(/\n+/g, ' | ').slice(0, 400));
    process.exitCode = 1;
  }
  const bad = errors.filter((e) => !/woff2/.test(e));
  L.check(!bad.length, 'no page errors ' + JSON.stringify(bad));
  await browser.close();
}

async function petHome({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== pet-home v2' + (mobile ? ' (mobile)' : ''));
  try {
    await L.fresh(page, '/play.html?case=pet-home');
    L.check((await L.mainText(page)).includes('★★★☆☆'), '3 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('파란 끈 얘기는'), 'opening shown');
    L.check(!(await L.mainText(page)).includes('중학교 때 나도'), 'opening does not give away the twist');
    await L.click(page, '모두 보기'); await L.click(page, '상자 열어 보기'); await L.sleep(400);
    // 아무것도 안 읽고 상자부터: 장치 안에는 규칙·날짜가 없다
    await hotspot(page, '기념품 상자');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .keepbox .keep-item').length === 4 && document.querySelectorAll('dialog[open] .record-row').length === 4 && document.querySelectorAll('dialog[open] .box-wrap .dial').length === 4), 'box: 4 items + 4 rows + 4 dials');
    L.check(!(await L.dialogText(page)).includes('끝자리') && !(await L.dialogText(page)).includes('8/2'), 'box: code rule and adopt date are not inside the device');
    L.check(!(await L.dialogText(page)).includes('P-S01'), 'box: internal hint code hidden from players');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .record-row .stamp'))), 'box: rows have no stamps');
    await L.closeDialog(page);
    for (const [d, t] of [['뚜껑 안쪽 정우의 쪽지', '그중 파란 끈만'], ['상자 맨 밑의 기록 사본', '네 날의 끝자리'], ['입양 계약서 봉투', '941372608154902'], ['방석의 루미', '새로 사 준']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '기념품 상자');
    const setDial = async (digits) => { for (let i = 0; i < digits.length; i++) { const cur = await page.evaluate((i) => Number(document.querySelectorAll('dialog[open] .dial .num')[i].textContent), i); const up = (digits[i] - cur + 10) % 10; for (let k = 0; k < up; k++) await L.click(page, `${i + 1}번째 다이얼 올리기`); } };
    await setDial([7, 2, 6, 8]); await commit(page); L.check((await status(page)).includes('물건부터'), 'box: code alone does not open before placement');
    const put = async (item, stage) => { await L.click(page, item + ' 집어 뒷면 보기', { exact: true }); await L.click(page, stage + ' (비어 있음)', { exact: true }); };
    await L.click(page, '파란 명찰 끈 집어 뒷면 보기', { exact: true });
    L.check(await dlgHas(page, '글씨가 어리다') && await dlgHas(page, '2016/7/16') && await page.evaluate(() => !!document.querySelector('dialog[open] .keep-back img')), 'box: back side shown with photo + date');
    await L.click(page, '잠깐 머문 날 (비어 있음)', { exact: true });
    await put('접힌 담요', '처음 발견한 날'); await put('진료 봉투', '진료받은 날'); await put('입양 확인서', '오래 살 집이 생긴 날'); await commit(page);
    const swapMsg = await status(page);
    L.check(swapMsg.includes('다시 대 본다'), 'box: swapped order neutral — ' + swapMsg);
    await L.click(page, '처음 발견한 날: 접힌 담요', { exact: true }); await L.click(page, '잠깐 머문 날: 파란 명찰 끈', { exact: true });
    await L.click(page, '처음 발견한 날 (비어 있음)', { exact: true }); await put('접힌 담요', '잠깐 머문 날');
    await setDial([7, 2, 6, 1]); await commit(page);
    L.check((await status(page)) === swapMsg, 'box: wrong code gives the same message as wrong order');
    // 날짜만 작은 순으로 줄 세운 번호는 틀린다 (사본 줄은 센터 서식 순서)
    await setDial([6, 7, 8, 2]); await commit(page);
    L.check((await status(page)) === swapMsg, 'box: date-sorted code 6782 fails (rows are form order, objects needed)');
    await setDial([7, 2, 6, 8]); await shot(page, 'pet-box'); await commit(page);
    L.check(await dlgHas(page, '양철통이 열렸다'), 'box solved');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('카드로만 남았어요'), 'moved to clinic');
    await hotspot(page, '카드 서랍장 오른쪽 위 열두 칸');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .drawer-btn').length === 12), 'cards: 12 drawers');
    await L.click(page, '7-2 서랍 열기', { exact: true });
    L.check(await dlgHas(page, '번호는 없다') && !(await dlgHas(page, 'V-6349')), 'cards: wrong drawer says nothing about ranges');
    L.check(!(await L.buttons(page)).some((b) => b === '이 카드 꺼내기'), 'cards: no commit on wrong drawer');
    await L.closeDialog(page);
    for (const [d, t] of [['접수대에서 들은 말', '등록번호까지 맞춰'], ['게시판의 카드 보관 안내', '7-3 앞쪽으로 옮겨']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '카드 서랍장 오른쪽 위 열두 칸');
    await L.click(page, '7-3 서랍 열기', { exact: true });
    await L.click(page, '초록 표 카드 보기', { exact: true }); L.check(await dlgHas(page, 'V-6384') && !(await dlgHas(page, '계약서 번호')), 'cards: card shows V number but no contract number'); await commit(page);
    L.check((await status(page)).includes('이 카드가 아니다'), 'cards: twin neutral — ' + (await status(page)));
    await L.click(page, '주황 표 카드 보기', { exact: true }); await commit(page); L.check((await status(page)).includes('이 카드가 아니다'), 'cards: second twin neutral');
    await L.click(page, '노란 표 카드 보기', { exact: true }); await shot(page, 'pet-cards'); await commit(page);
    L.check(await dlgHas(page, '콩이 = 루미'), 'cards solved');
    L.check(!(await dlgHas(page, '내가 나온 학교')), 'cards: reveal keeps the doubt (no early confirmation)');
    L.check(await dlgHas(page, '연필로 받아 적었거든요') && (await L.buttons(page)).some((x) => x.includes('휴대폰으로 찍어 둔 카드 다섯 장')), 'cards: reveal points to the pencil + card photo doc');
    await L.click(page, '휴대폰으로 찍어 둔 카드 다섯 장 보기');
    L.check(await dlgHas(page, '010-0861-4430') && await dlgHas(page, '지우개로 지운 자국'), 'cardshot doc lists the five fronts');
    await L.click(page, '← 돌아가기');
    await L.closeDialog(page); await L.sleep(400);
    // v136 새 장치: 연필 문지르기 → 내 휴대폰으로 걸기 (자국 셋 중 다섯 카드에 없는 번호 = 우리 집)
    L.check((await L.mainText(page)).includes('연필꽂이를 내 쪽으로'), 'rub: clinic line changes after the card');
    await hotspot(page, '접수대 연필꽂이와 노란 표 카드');
    L.check(!(await dlgHas(page, '031-047-2816')), 'rub: number not shown before rubbing');
    L.check(!(await L.buttons(page)).some((x) => x === '통화'), 'rub: no call button before a full number');
    {
      const cv = await (await page.$('dialog[open] .rub-canvas')).boundingBox();
      for (let r = 0; r < 5; r++) { const y = cv.y + cv.height * (0.1 + r * 0.2); await page.mouse.move(cv.x + 4, y); await page.mouse.down(); await page.mouse.move(cv.x + cv.width - 4, y, { steps: 14 }); await page.mouse.up(); await L.sleep(120); }
    }
    L.check(await dlgHas(page, '하얗게 떠오른 번호 셋') && await dlgHas(page, '031-047-2816') && await dlgHas(page, '010-0861-4430'), 'rub: pencil drag lifts three numbers');
    const dial = async (num) => { await L.click(page, '번호 다 지우기', { exact: true }); for (const ch of num.replace(/-/g, '')) await L.click(page, ch, { exact: true }); };
    await dial('010-0861-4430'); await commit(page);
    L.check((await status(page)).includes('끊겼다') && !(await status(page)).includes('031'), 'rub: clearest line (red card) neutral');
    await dial('010-0395-1127'); await commit(page);
    L.check((await status(page)).includes('끊겼다'), 'rub: green card number neutral');
    await dial('031-047-2816'); await shot(page, 'pet-rub'); await commit(page);
    L.check(await dlgHas(page, '「엄마 집」'), 'rub solved (home phone)');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('보리차를 끓이며'), 'moved to mom');
    // 명찰 장치는 바로 보이지만 안내문을 읽어야 색과 학년이 이어진다
    await hotspot(page, '엄마의 사진 상자');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .badge-cell').length === 4), 'strap: four badges');
    L.check(!(await dlgHas(page, '파랑')) && !(await dlgHas(page, '2학년 파랑')), 'strap: color rule is not inside the device');
    await L.click(page, '3학년 1반 이서진 명찰 구멍에 대기', { exact: true }); await commit(page);
    L.check((await status(page)).includes('손이 멈췄다'), 'strap: cousin decoy neutral');
    await L.closeDialog(page);
    for (const [d, t] of [['엄마와 주고받은 문자', '정류장에서 전화와서'], ['펼쳐 둔 앨범', '「정류장」'], ['장식장 위 서류철', '2학년 파랑']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => /일기/.test(b.getAttribute('aria-label') || '')))), 'diary is a reward, not a hotspot');
    await hotspot(page, '엄마의 사진 상자');
    await L.click(page, '3학년 2반 김유나 명찰 구멍에 대기', { exact: true }); await commit(page);
    L.check((await status(page)).includes('손이 멈췄다'), 'strap: wrong-year badge neutral');
    if (!mobile) {
      // 끌어다 놓기로도 댈 수 있다 (명찰을 댄 뒤 창이 확인 버튼 쪽으로 부드럽게 내려가니, 멈춘 다음 자리를 잰다)
      await L.sleep(800);
      const h = await (await page.$('dialog[open] .strap-handle')).boundingBox();
      const t = await (await page.$$('dialog[open] .badge-cell'))[2].boundingBox();
      await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2); await page.mouse.down();
      await page.mouse.move(t.x + t.width / 2, t.y + t.height / 3, { steps: 8 }); await page.mouse.up(); await L.sleep(300);
      L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .badge-cell')[2].classList.contains('on')), 'strap: drag and drop onto a badge');
    } else await L.click(page, '2학년 3반 김유나 명찰 구멍에 대기', { exact: true });
    await shot(page, 'pet-strap'); await commit(page);
    L.check(await dlgHas(page, '딸깍 물렸다'), 'strap solved');
    await L.click(page, '사진 상자 밑의 일기 한 장 보기');
    L.check(await dlgHas(page, '2학년 3반 김유나') && await page.evaluate(() => !!document.querySelector('dialog[open] .oldphoto img')), 'diary (with photo) via reveal');
    L.check(await dlgHas(page, '엄마가 사진 찍어 줌') && !(await dlgHas(page, '데려오래서')), 'diary: mom came to the bus stop (one story with the vet card)');
    await L.click(page, '← 돌아가기');
    await L.closeDialog(page); await L.sleep(400);
    // 보상 창을 닫아도 일기는 장면에서 다시 열 수 있다
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '엄마의 사진 상자'))), 'strap hotspot gives way after solving');
    await hotspot(page, '사진 상자 밑의 일기 한 장'); L.check(await dlgHas(page, '2학년 3반 김유나'), 'diary reopens from the scene after the reward is closed'); await L.closeDialog(page);
    await L.click(page, '집으로, 루미한테'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('콩이라고 불러 봤다'), 'ending reached');
    L.check((await L.mainText(page)).indexOf('끈 끝을 쥐었던 손으로요') < (await L.mainText(page)).indexOf('목줄 손잡이에 리본으로'), 'ending: letter request (leash handle) comes before the answer');
    await L.click(page, '정우가 남긴 편지 읽기');
    L.check(await dlgHas(page, '찾아봐 달라고 한 거예요') && await dlgHas(page, '목줄 손잡이에'), 'final letter unlocked (asks for the leash handle, like the ending picture)');
    await L.closeDialog(page);
    await L.click(page, '자료 다시 보기');
    L.check(!(await L.dialogText(page)).includes('아직 읽지 않은') && !(await L.dialogText(page)).includes('읽지 않은 자료'), 'all docs read');
  } catch (e) {
    console.log('FAIL exception', e.message);
    console.log('buttons now', JSON.stringify(await L.buttons(page)));
    console.log('dialog', (await L.dialogText(page)).replace(/\n+/g, ' | ').slice(0, 400));
    process.exitCode = 1;
  }
  const bad = errors.filter((e) => !/woff2/.test(e));
  L.check(!bad.length, 'no page errors ' + JSON.stringify(bad));
  await browser.close();
}

async function studio({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== studio v2' + (mobile ? ' (mobile)' : ''));
  const setRange = async (label, v) => { await page.evaluate(({ label, v }) => { const r = [...document.querySelectorAll('dialog[open] input[type=range]')].find((x) => x.getAttribute('aria-label') === label); r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); }, { label, v }); await L.sleep(200); };
  const trayImg = () => page.evaluate(() => document.querySelector('dialog[open] .trays img')?.getAttribute('src') || '');
  try {
    await L.fresh(page, '/play.html?case=studio');
    L.check((await L.mainText(page)).includes('★★★☆☆'), '3 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('2006년 3월 것이었다'), 'opening shown');
    await L.click(page, '접수대의 봉투 보기'); await L.sleep(400);
    for (const [d, t] of [['접수대의 할아버지 쪽지', '암실 열쇠는 필름 봉투 안에'], ['접수 장부', '윤서 씨 전화'], ['벽의 사진들', '8×10']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); if (d === '접수 장부') L.check(!(await dlgHas(page, 'C3')) && !(await dlgHas(page, '셈법')), 'ledger: smudged cell, no counting rule'); await L.closeDialog(page); }
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => ['보관함에서 꺼낸 필름 봉투', '필름 보관함', '봉투에 눌린 글씨'].includes(b.getAttribute('aria-label'))))), 'sleeve, pressed and lockers hidden before lamp');
    // lamp
    await hotspot(page, '초록 등 밑의 봉투');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .v2-guide'))), 'no in-device guide');
    await commit(page); L.check((await status(page)).includes('떠오르지 않는다'), 'lamp: flat neutral');
    await setRange('봉투 기울기', 60); await commit(page); L.check((await status(page)).includes('떠오르지 않는다'), 'lamp: too steep neutral');
    await setRange('봉투 기울기', 36); await shot(page, 'st-lamp'); await commit(page); L.check(await dlgHas(page, '안 흔들린 컷'), 'lamp solved');
    await L.click(page, '봉투에 눌린 글씨 보기'); L.check(await dlgHas(page, '보관 C3') && await dlgHas(page, '4×6이면 3초'), 'pressed doc via reveal'); await L.click(page, '← 돌아가기');
    await L.click(page, '계속'); await L.sleep(300);
    // lockers
    await hotspot(page, '필름 보관함');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .locker-cell').length === 16), 'lockers: 16 cells');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .st-card')].map((p) => p.textContent).sort().join() === 'A1,A4,D1'), 'lockers: only 3 labels left');
    L.check(await page.evaluate(() => document.querySelector('dialog[open] .v2-actions')?.hidden === true), 'lockers: no separate confirm button (tap pulls the drawer)');
    await shot(page, 'st-lockers');
    await L.click(page, '위에서 셋째 줄 왼쪽에서 셋째 칸 서랍', { exact: true }); await L.sleep(250); L.check((await status(page)).includes('0615는 없다'), 'lockers: naive decoy neutral');
    await L.click(page, '위에서 첫째 줄 왼쪽에서 둘째 칸 서랍', { exact: true }); await L.sleep(250); L.check((await status(page)).includes('0615는 없다'), 'lockers: wrong cell neutral');
    await L.click(page, '위에서 둘째 줄 왼쪽에서 셋째 칸 서랍', { exact: true }); await L.sleep(250); L.check(await dlgHas(page, '꼬리표 달린 작은 열쇠'), 'lockers solved');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('라이트박스를 켜자'), 'moved to table');
    await goPlace(page, '1. 접수실'); await L.sleep(300); await hotspot(page, '보관함에서 꺼낸 필름 봉투'); L.check(await dlgHas(page, '부고'), 'doc: sleeve'); await L.closeDialog(page);
    await hotspot(page, '봉투에 눌린 글씨'); L.check(await dlgHas(page, '보관 C3'), 'pressed reachable from scene'); await L.closeDialog(page);
    await goPlace(page, '2. 작업대'); await L.sleep(300);
    await hotspot(page, '루페로 본 필름 가장자리'); await L.closeDialog(page);
    // lightbox
    await hotspot(page, '라이트박스 위 필름');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .strip').length === 4 && document.querySelectorAll('dialog[open] .strip.flipped').length === 3), 'lightbox: 4 strips, 3 flipped');
    L.check(!(await L.dialogText(page)).includes('S-S0'), 'no internal device code shown');
    if (mobile) { const sz = await page.evaluate(() => [...document.querySelectorAll('dialog[open] .frame-btn, dialog[open] .strip-tools .ctl')].map((b) => { const r = b.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })); L.check(sz.every(([w, h]) => w >= 40 && h >= 40), 'lightbox: mobile cut and flip buttons at least 40px ' + JSON.stringify(sz.slice(0, 2)) + JSON.stringify(sz.slice(-1))); }
    await L.click(page, '4번째 줄 2번째 컷 루페로 보기', { exact: true }); L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .film-loupe-img.mirror')), 'lightbox: loupe shows mirrored when strip flipped');
    await L.click(page, '4번째 줄 뒤집기', { exact: true });
    await L.click(page, '4번째 줄 3번째 컷 루페로 보기', { exact: true }); await commit(page); L.check((await status(page)) === '인화지에 올리기 전에 루페로 한 번 더 봤다 이대로는 아니다', 'lightbox: no-sign decoy neutral');
    await L.click(page, '4번째 줄 4번째 컷 루페로 보기', { exact: true }); await commit(page); L.check((await status(page)).includes('이대로는 아니다'), 'lightbox: blurred twin neutral');
    await L.click(page, '4번째 줄 5번째 컷 루페로 보기', { exact: true }); L.check(await dlgHas(page, '가장자리 번호 23'), 'lightbox: loupe caption shows frame number'); await shot(page, 'st-lightbox'); await commit(page); L.check(await dlgHas(page, '23컷'), 'lightbox solved');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('붉은 안전등만'), 'moved to darkroom');
    for (const [d, t] of [['벽의 순서표', '두 배'], ['선반의 약품 메모', '빙초산']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    // easel (새 장치): 세로 8×10 틀을 끌어 아버지 가방부터 어머니까지
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => ['확대기', '트레이 셋'].includes(b.getAttribute('aria-label'))))), 'easel: enlarger and trays hidden until the easel is set');
    await hotspot(page, '확대기 밑 이젤');
    const easelX = () => page.evaluate(() => parseFloat(document.querySelector('dialog[open] .st-easel-win').style.left));
    await commit(page); L.check((await status(page)) === '날을 조이려다 손을 멈췄다 이 틀로 뽑으면 부탁받은 사진이 아니다', 'easel: landscape (everything fits) neutral');
    await L.click(page, '이젤 돌리기'); L.check((await L.dialogText(page)).includes('지금 세로 틀'), 'easel: rotated to portrait');
    { // 손가락으로 틀 끌기: 오른쪽 끝까지 끌었다가 놓으면 마지막 눈금에 걸린다
      const bb = await (await page.$('dialog[open] .st-easel')).boundingBox();
      await page.mouse.move(bb.x + bb.width * 0.5, bb.y + bb.height * 0.5); await page.mouse.down(); await page.mouse.move(bb.x + bb.width * 0.98, bb.y + bb.height * 0.5, { steps: 8 }); await page.mouse.up(); await L.sleep(300);
      L.check(Math.abs((await easelX()) - 474 / 1024 * 100) < 0.5, 'easel: drag snaps to the last stop ' + (await easelX()));
      await page.mouse.move(bb.x + bb.width * 0.8, bb.y + bb.height * 0.5); await page.mouse.down(); await page.mouse.move(bb.x + bb.width * 0.8 - bb.width * (220 / 1024), bb.y + bb.height * 0.5, { steps: 8 }); await page.mouse.up(); await L.sleep(300);
      L.check(Math.abs((await easelX()) - 250 / 1024 * 100) < 0.5, 'easel: drag back snaps to the whole-sign stop ' + (await easelX()));
    }
    await commit(page); L.check((await status(page)).includes('부탁받은 사진이 아니다'), 'easel: whole sign but bag cut neutral');
    await L.click(page, '◀ 틀을 왼쪽으로'); await L.click(page, '◀ 틀을 왼쪽으로'); await commit(page); L.check((await status(page)).includes('부탁받은 사진이 아니다'), 'easel: mother cut neutral');
    if (mobile) { const sz = await page.evaluate(() => [...document.querySelectorAll('dialog[open] .st-easel-ctl button')].map((b) => Math.round(b.getBoundingClientRect().height))); L.check(sz.every((h) => h >= 40), 'easel: mobile buttons at least 40px ' + JSON.stringify(sz)); }
    await L.click(page, '틀을 오른쪽으로 ▶'); await shot(page, 'st-easel'); await commit(page); L.check(await dlgHas(page, '세로 8×10 틀'), 'easel solved');
    await L.closeDialog(page); await L.sleep(300);
    // print
    await hotspot(page, '확대기');
    L.check(await page.evaluate(() => document.querySelector('dialog[open] .print-wrap')?.classList.contains('red')), 'print: starts under the red safelight like the picture');
    L.check((await trayImg()).includes('trays.webp'), 'print: red trays look alike');
    await L.click(page, '흰 불 스위치', { exact: true }); L.check((await trayImg()).includes('trays-white'), 'print: white light shows tray clues');
    if (shots) await (await page.$('dialog[open] .print-wrap')).screenshot({ path: shots + '/st-print-white.png' });
    await L.click(page, '인화지 꺼내 올리기'); L.check((await status(page)).includes('타 버린다'), 'print: white light explained');
    await L.click(page, '흰 불 스위치', { exact: true }); await L.click(page, '인화지 꺼내 올리기');
    await L.click(page, '타이머 누르기', { exact: true }); L.check((await status(page)).includes('흐리다'), 'print: focus explained');
    await setRange('초점 손잡이', 65); await L.click(page, '타이머 누르기', { exact: true }); L.check((await status(page)).includes('0초'), 'print: zero timer explained');
    await setRange('타이머', 6); await L.click(page, '타이머 누르기', { exact: true });
    for (const n of ['오른쪽', '왼쪽', '가운데']) await L.click(page, `${n} 트레이에 담그기`, { exact: true });
    await commit(page); L.check((await status(page)).includes('허옇게') && !(await status(page)).includes('얼룩'), 'print: short exposure shows a pale print only');
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .st-fail.light:not(.smear)')), 'print: pale ruined print shown in the device');
    await L.click(page, '인화지 버리고 처음부터'); L.check((await status(page)).includes('다시 꺼내'), 'print: reset explained');
    await L.click(page, '인화지 꺼내 올리기'); await setRange('타이머', 12); await L.click(page, '타이머 누르기', { exact: true });
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .st-fail'))), 'print: reset clears the ruined print');
    for (const n of ['왼쪽', '가운데', '오른쪽']) await L.click(page, `${n} 트레이에 담그기`, { exact: true });
    await commit(page); L.check((await status(page)).includes('얼룩') && !/시커멓|허옇/.test(await status(page)), 'print: wrong tray order shows a smear only');
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .st-fail.smear:not(.light):not(.dark)')), 'print: smeared print shown in the device');
    await L.click(page, '인화지 버리고 처음부터'); await L.click(page, '인화지 꺼내 올리기'); await setRange('타이머', 20); await L.click(page, '타이머 누르기', { exact: true });
    for (const n of ['왼쪽', '가운데', '오른쪽']) await L.click(page, `${n} 트레이에 담그기`, { exact: true });
    await commit(page); L.check((await status(page)).includes('시커멓') && (await status(page)).includes('얼룩'), 'print: both wrong shows dark + smear');
    await setRange('타이머', 12);
    await L.click(page, '인화지 버리고 처음부터'); await L.click(page, '인화지 꺼내 올리기'); await L.click(page, '흰 불 스위치', { exact: true }); L.check((await status(page)).includes('까맣게 탔다'), 'print: white light burns paper');
    await L.click(page, '흰 불 스위치', { exact: true }); await L.click(page, '인화지 버리고 처음부터'); await L.click(page, '인화지 꺼내 올리기'); await L.click(page, '타이머 누르기', { exact: true });
    for (const n of ['오른쪽', '왼쪽', '가운데']) await L.click(page, `${n} 트레이에 담그기`, { exact: true });
    await shot(page, 'st-print'); await commit(page); L.check(await dlgHas(page, '스무 해 만의 한 장'), 'print solved');
    await L.click(page, '오늘 인화한 사진 보기'); L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .st-photo img')), 'photo shown'); await L.click(page, '← 돌아가기');
    await L.click(page, '암실 문이 열린다'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('처음으로 할아버지가 사진 안에'), 'ending reached');
    await L.click(page, '필름 봉투 속 쪽지 읽기'); L.check(await dlgHas(page, '돌아오면 같이 찾으러 오자'), 'final unlocked'); await L.closeDialog(page);
    await L.click(page, '자료 다시 보기'); L.check(!(await L.dialogText(page)).includes('아직 읽지 않은'), 'all docs read');
  } catch (e) {
    console.log('FAIL exception', e.message);
    console.log('buttons now', JSON.stringify(await L.buttons(page)));
    console.log('dialog', (await L.dialogText(page)).replace(/\n+/g, ' | ').slice(0, 400));
    process.exitCode = 1;
  }
  const bad = errors.filter((e) => !/woff2/.test(e));
  L.check(!bad.length, 'no page errors ' + JSON.stringify(bad));
  await browser.close();
}

async function garage({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== garage v2' + (mobile ? ' (mobile)' : ''));
  const setDial = async (digits) => { for (let i = 0; i < digits.length; i++) { const cur = await page.evaluate((i) => Number(document.querySelectorAll('dialog[open] .dial .num')[i].textContent), i); const up = (digits[i] - cur + 10) % 10; for (let k = 0; k < up; k++) await L.click(page, `${i + 1}번째 다이얼 올리기`); } };
  const has = async (label) => page.evaluate((label) => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === label), label);
  try {
    await L.fresh(page, '/play.html?case=garage');
    L.check((await L.mainText(page)).includes('★★★★★'), '5 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('셔터가 내려가기까지'), 'opening shown');
    await L.click(page, '앞마당으로'); await L.sleep(400);
    L.check(!(await has('서연에게 보고')), 'report hidden at start');
    // 소지품: 내 휴대폰 문자와 조사 수첩은 처음부터 있음
    await page.evaluate(() => document.querySelector('.v2-hud-btn.bag').click()); await L.sleep(250);
    L.check(await dlgHas(page, '서연과 주고받은 문자') && await dlgHas(page, '조사 수첩'), 'phone + notebook in bag at start');
    await L.click(page, '서연과 주고받은 문자', { within: 'dialog[open]' }); L.check(await dlgHas(page, '면담 영상이 중간에 끊겼대요'), 'doc: brief'); await L.closeDialog(page);
    await page.evaluate(() => document.querySelector('.v2-hud-btn.bag').click()); await L.sleep(250); await L.click(page, '조사 수첩', { within: 'dialog[open]' }); L.check(await dlgHas(page, '작업복 차림'), 'doc: statements'); await L.closeDialog(page);
    await hotspot(page, '차 안의 점검 영수증'); L.check(await dlgHas(page, '빠름'), 'doc: receipt'); await L.closeDialog(page);
    // 단말은 처음부터 눌린다 (블랙박스 장면이 없으면 잠긴 화면만)
    await hotspot(page, '작업장으로'); await L.sleep(300); await hotspot(page, '보관함 백업 단말');
    L.check(await dlgHas(page, 'NO VIDEO SOURCE') && !(await L.buttons(page)).includes('이 차이로 맞추기'), 'terminal: answers before cam but cannot sync yet');
    await L.closeDialog(page); await L.sleep(250); await hotspot(page, '앞마당으로'); await L.sleep(300);
    // cam
    await hotspot(page, '서연 차의 블랙박스');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .v2-guide'))), '★5: no guide');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .cam-thumb').length === 6), 'cam: 6 frames');
    await L.click(page, '이 화면 확대해 보기', { exact: true }); L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .camview.zoomed')), 'cam: zoom in'); await L.click(page, '확대 풀기', { exact: true });
    await L.click(page, '프레임 2 (21:47:05)', { exact: true }); await L.click(page, '프레임 2 표시', { exact: true });
    await L.click(page, '프레임 3 (21:53:20)', { exact: true }); await L.click(page, '프레임 3 표시', { exact: true }); await commit(page);
    L.check((await status(page)).includes('설명할 수 없다'), 'cam: neutral wrong message');
    await L.click(page, '프레임 4 (21:55:20)', { exact: true }); await L.click(page, '프레임 4 표시', { exact: true }); await shot(page, 'g-cam'); await commit(page);
    L.check(await dlgHas(page, '21:53:20 → 21:55:20'), 'cam solved');
    await L.click(page, '계속'); await L.sleep(300);
    // hints: only 2 tiers
    await L.click(page, '힌트'); await L.click(page, '첫 힌트 받기'); await L.click(page, '풀이 방향 받기');
    L.check(!(await L.buttons(page)).includes('정답 보기') && await dlgHas(page, '정답 힌트가 없습니다'), '★5: only two hint tiers'); await L.closeDialog(page);
    // shop → terminal
    await hotspot(page, '작업장으로'); await L.sleep(300);
    L.check((await L.mainText(page)).includes('LOCKED'), 'shop: locked before sync');
    await hotspot(page, '직원 보관함과 SD 슬롯'); await L.closeDialog(page);
    await hotspot(page, '보관함 백업 단말');
    L.check(await page.evaluate((m) => { const v = document.querySelector(m ? 'dialog[open] .sync-svg-v' : 'dialog[open] .sync-svg'); return !!v && v.getClientRects().length > 0 && v.getBoundingClientRect().right <= innerWidth + 1; }, mobile), 'terminal: timeline fits the screen (' + (mobile ? 'vertical' : 'horizontal') + ')');
    const ticks = async () => page.evaluate((m) => [...document.querySelectorAll(m ? 'dialog[open] .sync-svg-v line[stroke="#f2b134"]' : 'dialog[open] .sync-svg line[stroke="#f2b134"]')].map((l) => l.getAttribute(m ? 'y1' : 'x1')).join(), mobile);
    const t0 = await ticks();
    await L.click(page, '블랙박스 시계 −5분', { exact: true });
    L.check(t0 && t0 === await ticks(), 'terminal: pressing ±분 does not slide the track (no live overlap preview)');
    await commit(page); L.check((await status(page)) === 'SYNC FAIL' && await dlgHas(page, '남은 시도 2번'), 'terminal: neutral SYNC FAIL + tries left');
    await L.click(page, '블랙박스 시계 +1분', { exact: true }); await commit(page);
    await L.click(page, '블랙박스 시계 +1분', { exact: true }); await commit(page);
    L.check((await status(page)).includes('1분 동안 잠긴다') && await dlgHas(page, 'SYNC LOCK'), 'terminal: third miss locks the terminal');
    for (let k = 0; k < 4; k++) await L.click(page, '블랙박스 시계 −1분', { exact: true });
    await commit(page); L.check((await status(page)).includes('SYNC LOCK') && !(await dlgHas(page, '보관함 기록 보기')), 'terminal: right answer refused while locked');
    await page.evaluate(() => { const o = Date.now; Date.now = () => o() + 61000; });
    await shot(page, 'g-terminal'); await commit(page); L.check(await dlgHas(page, 'SYNC OK'), 'terminal solved after the lock');
    await L.click(page, '백업 단말의 보관함 기록 보기'); L.check(await dlgHas(page, '21:47:10'), 'lockerlog doc via reveal'); await L.closeDialog(page);
    await L.closeDialog(page).catch(() => {}); await L.sleep(300);
    L.check((await L.mainText(page)).includes('SYNC OK') && !(await L.mainText(page)).includes('LOCKED'), 'shop arrive updated after sync');
    // office
    await hotspot(page, '앞마당으로'); await L.sleep(300); await hotspot(page, '사무실로'); await L.sleep(300);
    L.check((await L.mainText(page)).includes('달랑거린다'), 'office: tension line after sync');
    L.check(await page.evaluate(() => getComputedStyle(document.querySelector('.v2-stage-ov.g-phone')).display === 'block'), 'office: Minho phone drawn on the desk after sync');
    for (const [d, t] of [['출입 서버 화면', '21:46:20'], ['폐업 인계 문서', '처음 문을 연 날'], ['서류함의 분실 신고서', '정지 처리 안 함'], ['강민호의 면담 기록', '영상 한 번 끊김'], ['벽의 기념패', '2018년 10월 3일']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '책상 밑 금고');
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].some((t) => t.textContent.includes('기념패')))), 'safe: plaque not auto-attached');
    await setDial([0, 3, 3, 0]); await commit(page); L.check((await status(page)).includes('안 내려간다'), 'safe: neutral wrong message');
    await setDial([1, 0, 0, 3]); await commit(page); L.check((await status(page)).includes('안 내려간다'), 'safe: reopen date trap');
    await setDial([0, 4, 0, 7]); await shot(page, 'g-safe'); await commit(page); L.check(await dlgHas(page, '봉투만 비어 있다'), 'safe solved');
    await L.click(page, '계속'); await L.sleep(300);
    L.check(await has('다시 닫아 둔 금고') && !(await has('책상 밑 금고')), 'opened safe stays visible in scene (closed again, like the picture)');
    await hotspot(page, '다시 닫아 둔 금고'); L.check(await dlgHas(page, '07-A 분실'), 'safedoc from scene'); await L.closeDialog(page);
    // strips
    await hotspot(page, '휴지통의 찢긴 종이');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .wo-pick').length === 5 && document.querySelectorAll('dialog[open] .wo-slot').length === 4), 'strips: 5 pieces, 4 places');
    for (const k of ['가', '나', '다', '라']) await L.click(page, `조각 ${k} 붙이기`, { exact: true });
    await commit(page); L.check((await status(page)).includes('이어지지 않는다'), 'strips: neutral wrong');
    for (let i = 1; i <= 4; i++) await L.click(page, `${i}번째 자리 조각 떼기`, { exact: true });
    for (const k of ['다', '마', '가', '라']) await L.click(page, `조각 ${k} 붙이기`, { exact: true });
    await shot(page, 'g-strips'); await commit(page);
    L.check(await dlgHas(page, '작업 지시서 · 9/12'), 'strips solved');
    await L.click(page, '붙여 놓은 작업 지시서 보기'); L.check(await dlgHas(page, '찢긴 자리가 맞물렸다'), 'workorder via reveal'); await L.closeDialog(page); await L.closeDialog(page).catch(() => {}); await L.sleep(300);
    // disc (작업장 폐부품 카트: 영수증 차 번호 + 지시서 9/12 앞 → 다, 캘리퍼스 26.4)
    await goPlace(page, '3. 작업장');
    L.check((await L.mainText(page)).includes('꼬리표가 철사로 묶여 있다') && await has('폐부품 카트'), 'shop: cart appears after strips');
    await hotspot(page, '폐부품 카트');
    const typeVal = async (v) => { for (let i = 0; i < 6; i++) await L.click(page, '한 자 지우기', { exact: true }); for (const ch of v) await L.click(page, ch === '.' ? '소수점 적기' : `${ch} 적기`, { exact: true }); };
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .disc-pad .ctl')].every((b) => b.getBoundingClientRect().height >= 40 && b.getBoundingClientRect().width >= 40)), 'disc: keypad buttons 40px+');
    await L.click(page, '디스크 가 캘리퍼스로 재기 (꼬리표 37마 4128 9/12 앞)', { exact: true }); await typeVal('22.8'); await commit(page);
    L.check((await status(page)).includes('기록이 못 된다'), 'disc: plate trap neutral');
    await L.click(page, '디스크 다 캘리퍼스로 재기 (꼬리표 37마 4182 9/12 앞)', { exact: true }); L.check(await dlgHas(page, 'MIN TH 25'), 'disc: stamp shown');
    await typeVal('25'); await commit(page); L.check((await status(page)).includes('기록이 못 된다'), 'disc: MIN stamp trap neutral');
    await typeVal('27.4'); await commit(page); L.check((await status(page)).includes('기록이 못 된다'), 'disc: misread neutral');
    L.check(await page.evaluate(() => { const v = document.querySelector('dialog[open] .vern-box'); return !!v && v.getBoundingClientRect().right <= innerWidth + 1 && v.querySelector('.vern-svg').getBoundingClientRect().width >= (innerWidth < 640 ? 600 : 300); }), 'disc: caliper scale box fits the screen (mobile: wide scale scrolls inside)');
    await typeVal('26.4'); await shot(page, 'g-disc'); await commit(page);
    L.check(await dlgHas(page, '26.4mm') && await dlgHas(page, '버리지 말 것'), 'disc solved');
    await L.click(page, '회수한 앞 디스크 보기'); L.check(await dlgHas(page, 'MIN TH 25'), 'disc doc via reveal'); await L.closeDialog(page); await L.closeDialog(page).catch(() => {}); await L.sleep(300);
    await goPlace(page, '2. 사무실');
    // video
    await hotspot(page, '책상 위 민호의 휴대폰');
    const seek = async (k) => { await page.evaluate((k) => { const r = document.querySelector('dialog[open] .vid-range'); r.value = String(k); r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); }, k); await L.sleep(150); };
    await seek(28); L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .vid-screen.frozen')), 'video: frozen inside gap');
    await commit(page); L.check((await status(page)).includes('못 하겠어요'), 'video: neutral wrong (gap)');
    await seek(10); await commit(page); L.check((await status(page)).includes('못 하겠어요'), 'video: neutral wrong (before entry)');
    await seek(41); await L.click(page, '녹화 +5초', { exact: true }); await shot(page, 'g-video'); await commit(page);
    L.check(await dlgHas(page, '차 안의 강민호'), 'video solved');
    await L.click(page, '계속'); await L.sleep(300);
    await hotspot(page, '걸려 있는 재킷 세 벌');
    if (mobile) L.check(await page.evaluate(() => { const c = [...document.querySelectorAll('dialog[open] .jackets-wrap .pick-row .chip')].map((b) => b.getBoundingClientRect()); return c.length === 3 && c[1].left - c[0].right >= 4; }), 'jackets: mobile chips have a gap');
    await L.click(page, '진회색 재킷 칼라 보기', { exact: true }); L.check(await dlgHas(page, '강민호'), 'jackets: collar tag shown'); L.check(!(await dlgHas(page, 'SD카드')), 'jackets: no SD-case giveaway'); await commit(page);
    L.check((await status(page)).includes('재킷과 다르다'), 'jackets: neutral wrong message');
    await L.click(page, '회색 재킷 칼라 보기', { exact: true }); await shot(page, 'g-jackets'); await commit(page); L.check(await dlgHas(page, '소매의 반사띠'), 'jackets solved');
    await L.closeDialog(page); await L.sleep(300);
    await goPlace(page, '1. 앞마당');
    L.check((await L.mainText(page)).includes('보고만 남았다'), 'yard arrive before report');
    await hotspot(page, '서연에게 보고');
    const pick = async (q, v) => L.click(page, q + ': ' + v, { exact: true });
    const Q = ['① 21:46 측문을 연 카드', '② 그 카드가 어젯밤 꺼내지기 전까지 보관돼 있던 곳', '③ 같은 재킷이 블랙박스에 찍힌 다른 출입 (서버 줄로 · 모두)', '④ 카드를 꺼낸 사람', '⑤ 사진이 넘어가면 곤란했던 이유'];
    await pick(Q[0], '07-A'); await pick(Q[1], '작업장 바닥'); await pick(Q[2], '21:40:00 09 퇴장'); await pick(Q[3], '한지수'); await pick(Q[4], '교체를 사장이 지시해서'); await commit(page);
    L.check((await status(page)).includes('확실해요?'), 'report: neutral wrong message');
    await pick(Q[1], '사무실 금고 봉투'); await pick(Q[3], '박정호'); await commit(page); L.check((await status(page)).includes('확실해요?'), 'report: still neutral (one entry missing)');
    await pick(Q[2], '22:00:05 09 입장'); await pick(Q[2], '22:12:30 09 퇴장'); await commit(page); L.check((await status(page)).includes('확실해요?'), 'report: extra entry rejected');
    await pick(Q[2], '22:12:30 09 퇴장'); await shot(page, 'g-report'); await commit(page);
    L.check(await dlgHas(page, '경찰 불렀어요'), 'report solved');
    await L.click(page, '열 시, 셔터가 내려간다'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('7분 빠른 시각') && (await L.mainText(page)).includes('찍기 싫었어요'), 'ending reached');
    await L.click(page, '서연에게 보낸 보고 읽기'); L.check(await dlgHas(page, '사장 박정호입니다'), 'final unlocked'); await L.closeDialog(page);
    await L.click(page, '자료 다시 보기'); L.check(!(await L.dialogText(page)).includes('아직 읽지 않은'), 'all docs read');
  } catch (e) {
    console.log('FAIL exception', e.message);
    console.log('buttons now', JSON.stringify(await L.buttons(page)));
    console.log('dialog', (await L.dialogText(page)).replace(/\n+/g, ' | ').slice(0, 400));
    process.exitCode = 1;
  }
  const bad = errors.filter((e) => !/woff2/.test(e));
  L.check(!bad.length, 'no page errors ' + JSON.stringify(bad));
  await browser.close();
}


async function letter({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== letter v2' + (mobile ? ' (mobile)' : ''));
  const setDial = async (digits) => { for (let i = 0; i < digits.length; i++) { const cur = await page.evaluate((i) => Number(document.querySelectorAll('dialog[open] .dial .num')[i].textContent), i); const up = (digits[i] - cur + 10) % 10; for (let k = 0; k < up; k++) await L.click(page, `${i + 1}번째 다이얼 올리기`); } };
  try {
    await L.fresh(page, '/episode.html?case=letter'); await L.sleep(600); L.check(page.url().includes('play.html?case=letter'), 'old address redirects to new letter');
    await L.fresh(page, '/play.html?case=letter');
    L.check((await L.mainText(page)).includes('★★★☆☆'), '3 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('봉수 아저씨였다'), 'opening shown');
    await L.click(page, '구분실 불 켜기'); await L.sleep(400);
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '구분함'))), 'rack hidden before locker');
    for (const [d, t] of [['봉수 아저씨 문자', '뜯지는 말고'], ['보관함 문에 붙은 쪽지', '처음 돌아온 날'], ['반송 대장', '정○린'], ['게시판의 주소 안내', '17-4-1']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    // locker
    await hotspot(page, '반송 보관함');
    L.check(!(await page.evaluate(() => document.querySelector('dialog[open] .v2-guide')?.open)), '★3: guide collapsed');
    await setDial([1, 1, 0, 2]); await commit(page); L.check((await status(page)).includes('그 집 줄을 다시'), 'locker: 17-14 decoy neutral');
    await setDial([0, 3, 1, 8]); await commit(page); L.check((await status(page)).includes('그 집 줄을 다시'), 'locker: later return neutral');
    await setDial([0, 3, 1, 9]); await shot(page, 'l-locker'); await commit(page); L.check(await dlgHas(page, '맨 아래 칸에 고무줄로'), 'locker solved');
    await L.click(page, '계속'); await L.sleep(300);
    L.check(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot:not(.go)')].every((b) => { const x = parseFloat(b.style.left), y = parseFloat(b.style.top), r = parseFloat(b.style.getPropertyValue('--hit') || '11'); return y <= 80 && x >= 6 && x <= 94 && r >= 8; })), 'sorting: hotspots clear of dialogue, edges, not tiny');
    await hotspot(page, '다섯 통의 겉봉'); L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .lenv').length === 5), 'five envelopes rendered');
    L.check(await page.evaluate(() => { const d = document.querySelector('dialog[open]'); return !d.innerHTML.includes('35217') && !d.innerHTML.includes('352<span class="inked" aria-hidden="true">17'); }), 'envs: hidden zip digits are not in the page text');
    L.check(await dlgHas(page, '2021/3/15 월요일'), 'envs: postmark weekday shown'); L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .envpanel')].filter((x) => x.offsetParent).length === 1), 'one envelope shown at a time'); await page.evaluate(() => [...document.querySelectorAll('dialog[open] .envtabs label')].find((l) => l.textContent === '2024').click()); L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .envpanel')].find((x) => x.offsetParent)?.textContent.includes('2024')), 'year tab switches envelope'); await shot(page, 'l-envs'); await L.closeDialog(page);
    await hotspot(page, '묶음에 끼워진 신청서'); L.check(await dlgHas(page, '뒤채'), 'doc: forward'); await L.closeDialog(page);
    // rack
    await hotspot(page, '구분함');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .rack-slot').length === 16), 'rack: 16 slots');
    await L.click(page, '미루새길 9 칸', { exact: true }); await commit(page); L.check((await status(page)).includes('이름은 없다') && !(await status(page)).includes('빌라'), 'rack: villa decoy neutral');
    await L.click(page, '미루새길 11 칸', { exact: true }); await commit(page); L.check((await status(page)).includes('이름은 없다') && !(await status(page)).includes('17-14'), 'rack: 11 decoy neutral');
    await L.click(page, '미루새길 9-1 칸', { exact: true }); await shot(page, 'l-rack'); await commit(page); L.check(await dlgHas(page, '쓴 사람은 정해린'), 'rack solved');
    await L.click(page, '9-1 칸의 쪽지 보기'); L.check(await dlgHas(page, '이제는 받겠습니다'), 'hcard via reveal'); await L.click(page, '← 돌아가기');
    await L.click(page, '집배원 휴게실로'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('아저씨 우비가'), 'moved to breakroom');
    for (const [d, t] of [['못에 걸린 순로표', '일요일·공휴일 수거 없음'], ['벽의 단체 사진', '38년']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '맨 끝 사물함');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].some((t) => t.textContent.includes('순로표') && !t.disabled)), 'route doc on bench');
    const push = async (seq) => { for (const k of seq) await L.click(page, { U: '위로 밀기', D: '아래로 밀기', L: '왼쪽으로 밀기', R: '오른쪽으로 밀기' }[k], { exact: true }); };
    await push('URU'); await commit(page); L.check((await status(page)).includes('약도를 다시'), 'dirlock: old gate decoy neutral');
    await push('URUR'); await commit(page); L.check((await status(page)).includes('약도를 다시'), 'dirlock: wrong last turn neutral');
    await push('URUL'); await shot(page, 'l-staff'); await commit(page); L.check(await dlgHas(page, '업무 수첩'), 'staffbox solved');
    await L.click(page, '봉수 아저씨의 수첩 보기'); L.check(await dlgHas(page, '거절을 못 찍었다'), 'notebook via reveal'); L.check(await dlgHas(page, '똑같은 날에 우체통에 넣는다') && !(await dlgHas(page, '같은 날 근처')), 'notebook: posting day stated plainly'); await L.click(page, '← 돌아가기');
    await L.click(page, '미루새길 골목으로'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('초록 대문이 있고'), 'moved to alley');
    const spotThere = (l) => page.evaluate((l) => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === l), l);
    L.check(!(await spotThere('할머니가 내민 빈 봉투')), 'reply hidden before meeting');
    L.check(!(await spotThere('초록 대문')), 'gate hidden before old mailbox');
    await hotspot(page, '빌라 우편함'); L.check(await dlgHas(page, '초록 대문 틈'), 'doc: villa mailboxes'); await L.closeDialog(page);
    // 옛 우편함: 둥근 다이얼 (오른쪽 3, 왼쪽 14)
    await hotspot(page, '대문 기둥의 옛 우편함');
    L.check(!(await L.buttons(page)).includes('뚜껑 당기기'), 'oldbox: no commit before turning');
    const turn = async (aria, n) => { for (let i = 0; i < n; i++) await L.click(page, aria, { exact: true }); };
    await turn('오른쪽으로 한 눈금', 3); await turn('왼쪽으로 다섯 눈금', 3); await turn('왼쪽으로 한 눈금', 1);
    L.check(await dlgHas(page, '↻ 3'), 'oldbox: first number caught on direction change');
    await commit(page); L.check((await status(page)).includes('걸린다') && (await dlgHas(page, '지금 눈금 0')), 'oldbox: 3/17 neutral and dial resets — ' + (await status(page)));
    await turn('왼쪽으로 다섯 눈금', 6); await turn('왼쪽으로 한 눈금', 1); await turn('오른쪽으로 다섯 눈금', 2); await turn('오른쪽으로 한 눈금', 4); await commit(page);
    L.check((await status(page)).includes('걸린다'), 'oldbox: right numbers, wrong directions neutral');
    await turn('오른쪽으로 한 눈금', 3); await turn('왼쪽으로 다섯 눈금', 4); await turn('왼쪽으로 한 눈금', 1);
    await shot(page, 'l-oldbox'); await commit(page);
    L.check(await dlgHas(page, '우표도 소인도 없는 봉투'), 'oldbox solved');
    await L.click(page, '여섯 번째 봉투 보기'); L.check(await dlgHas(page, '왔다 갑니다'), 'sixth envelope via reveal'); await L.click(page, '← 돌아가기');
    await L.click(page, '계속'); await L.sleep(300);
    L.check(await spotThere('여섯 번째 봉투') && !(await spotThere('대문 기둥의 옛 우편함')), 'solved mailbox shows the envelope instead');
    await hotspot(page, '초록 대문'); L.check(await dlgHas(page, '이번엔 돌아오지 않게') && await dlgHas(page, '여기까지 왔었네'), 'doc: gate'); await L.closeDialog(page);
    await hotspot(page, '할머니가 내민 빈 봉투');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .inhand-card'))), 'reply: no duplicated sender cards');
    L.check(!(await page.evaluate(() => document.querySelector('dialog[open]').innerHTML.includes('35217'))), 'reply: backlit zip not in page text before lighting');
    const inkPx = () => page.evaluate(() => { const c = document.querySelector('dialog[open] canvas.bl-zip'); if (!c || !c.width) return 0; const g = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < g.length; i += 4) if (g[i] > 40) n++; return n; });
    // 전구에 비춰 보기: 누르고 있는 동안만
    const hb = await (await page.$('dialog[open] .bl-hold')).boundingBox();
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await page.mouse.down(); await L.sleep(250);
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .backlight.lit')), 'reply: envelope lit while held');
    L.check((await inkPx()) > 200, 'reply: mirrored zip drawn on canvas while held');
    L.check(await page.evaluate(() => { const c = document.querySelector('dialog[open] canvas.bl-zip'); return c.getBoundingClientRect().height >= 26; }), 'reply: lit zip area big enough to read');
    await shot(page, 'l-reply-lit');
    await page.mouse.up(); await L.sleep(150);
    L.check(await page.evaluate(() => !document.querySelector('dialog[open] .backlight.lit')), 'reply: light off on release');
    L.check((await inkPx()) === 0, 'reply: zip gone on release');
    await page.click('dialog[open] .bl-hold'); await L.sleep(100);
    L.check(await page.evaluate(() => !document.querySelector('dialog[open] .backlight.lit')), 'reply: plain click does not stay lit');
    await commit(page); L.check((await status(page)).includes('우편번호 칸이 아직'), 'reply: empty field named');
    await L.typeInto(page, '우편번호', '35271'); await L.typeInto(page, '번지', '31-2'); await L.click(page, '층: 2층', { exact: true }); await L.typeInto(page, '받는 사람', '오정민'); await commit(page);
    L.check((await status(page)).includes('겉봉을 다시'), 'reply: 2025 miswritten zip neutral');
    L.check(await page.evaluate(() => document.querySelector('dialog[open] input[aria-label="번지"]').value === '31-2'), 'reply: typed values kept after failure');
    await L.typeInto(page, '우편번호', '35217'); await L.click(page, '층: 1층', { exact: true }); await commit(page); L.check((await status(page)).includes('겉봉을 다시'), 'reply: old floor neutral');
    await L.click(page, '층: 2층', { exact: true }); await L.typeInto(page, '번지', '31 - 2'); await shot(page, 'l-reply'); await commit(page);
    L.check(await dlgHas(page, '꽉 찬 봉투'), 'reply solved');
    await L.click(page, '봉투를 할머니께 건네고'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('돌아오지 않을 봉투'), 'ending reached');
    await shot(page, 'l-ending');
    await L.click(page, '열흘 뒤 온 봉투 읽기'); L.check(await dlgHas(page, '문 두드릴게요'), 'final unlocked'); await L.closeDialog(page);
    await L.click(page, '자료 다시 보기'); L.check(!(await L.dialogText(page)).includes('아직 읽지 않은'), 'all docs read');
  } catch (e) {
    console.log('FAIL exception', e.message);
    console.log('buttons now', JSON.stringify(await L.buttons(page)));
    console.log('dialog', (await L.dialogText(page)).replace(/\n+/g, ' | ').slice(0, 400));
    process.exitCode = 1;
  }
  const bad = errors.filter((e) => !/woff2/.test(e));
  L.check(!bad.length, 'no page errors ' + JSON.stringify(bad));
  await browser.close();
}


async function apartment({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== apartment v2' + (mobile ? ' (mobile)' : ''));
  const setDial = async (digits) => { for (let i = 0; i < digits.length; i++) { const cur = await page.evaluate((i) => Number(document.querySelectorAll('dialog[open] .dial .num')[i].textContent), i); const up = (digits[i] - cur + 10) % 10; for (let k = 0; k < up; k++) await L.click(page, `${i + 1}번째 다이얼 올리기`); } };
  const waitCommit = async (label, ms = 30000) => page.waitForFunction((label) => [...document.querySelectorAll('dialog[open] .v2-actions button')].some((b) => !b.hidden && b.textContent.includes(label)), label, { timeout: ms }).then(() => true).catch(() => false);
  const waitEv = async (k, ms = 20000) => page.waitForFunction((k) => !!window.MihaejeV2?.state?.ev?.[k], k, { timeout: ms }).then(() => true).catch(() => false);
  const T = { L: '왼쪽 검은 타이머', M: '가운데 파란 타이머', R: '오른쪽 검은 타이머' };
  const PINS = ['20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
  const setTapes = async (want) => {
    for (const k of ['L', 'M', 'R']) await page.evaluate((lab) => { const b = [...document.querySelectorAll('dialog[open] .wire-tape')].find((x) => x.getAttribute('aria-label').startsWith(lab)); if (b.classList.contains('set')) b.click(); }, T[k] + ' 위 테이프');
    for (const k of ['L', 'M', 'R']) { await L.click(page, `테이프 ${want[k]} 집기`, { exact: true }); await page.evaluate((lab) => [...document.querySelectorAll('dialog[open] .wire-tape')].find((x) => x.getAttribute('aria-label').startsWith(lab)).click(), T[k] + ' 위 테이프'); await L.sleep(120); }
  };
  const setPins = async (want) => { for (const k of ['L', 'M', 'R']) for (const t of PINS) { const lab = `${T[k]} ${t} 핀`; const on = await page.evaluate((lab) => [...document.querySelectorAll('dialog[open] button.pin')].find((b) => b.getAttribute('aria-label').startsWith(lab)).classList.contains('down'), lab); if (on !== want[k].includes(t)) { await page.evaluate((lab) => [...document.querySelectorAll('dialog[open] button.pin')].find((b) => b.getAttribute('aria-label').startsWith(lab)).click(), lab); await L.sleep(60); } } };
  try {
    await L.fresh(page, '/episode.html?case=apartment'); await L.sleep(600); L.check(page.url().includes('play.html?case=apartment'), 'old address redirects');
    L.check((await L.mainText(page)).includes('★★★★☆'), '4 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('404호 귀신'), 'opening shown');
    await L.click(page, '둑길에서 건물 보기'); await L.sleep(400);
    L.check(await page.evaluate(() => document.querySelector('.v2-stage')?.dataset.mood === 'horror'), 'horror mood on stage');
    for (const [d, t] of [['벤치 위 휴대폰 · 작업 지시', '민원 3건'], ['불 켜진 창 · 동네 커뮤니티 글', '404호'], ['둑길의 철거 안내판', '반지하']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    L.check(!(await page.evaluate(() => /손전등/.test(document.body.innerText))), 'no flashlight comment yet');
    await hotspot(page, '건물 정문으로'); await L.sleep(400);
    for (const [d, t] of [['우편함 위 호수 안내', '왼쪽 집부터'], ['게시판의 이주 현황', '1세대']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '우편함');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .v2-guide'))), '★4: no guide');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .mail-slot').length === 30), 'mailbox: 30 slots like the scene');
    await L.click(page, '404 우편함', { exact: true }); await commit(page); L.check((await status(page)).includes('이사 간 집'), 'mailbox: rumor decoy');
    await L.click(page, '304 우편함', { exact: true }); await commit(page); L.check((await status(page)) === '전단지와 고지서뿐이다 이 집이 아니다', 'mailbox: mirror decoy neutral');
    await L.click(page, '401 우편함', { exact: true }); await L.click(page, '401 우편함', { exact: true }); L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .mail-slot.picking')), 'mailbox: same slot twice keeps it picked');
    await commit(page); L.check((await status(page)) === '전단지와 고지서뿐이다 이 집이 아니다', 'mailbox: basement decoy neutral');
    // 세 번째 오답부터는 기다려야 한다 (마구 눌러 보기 막기)
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .apt-wait')) && !(await L.buttons(page)).includes('이 우편함 열어 보기'), 'mailbox: third miss makes you wait (no commit)');
    await L.click(page, '301 우편함', { exact: true }); L.check(await waitCommit('이 우편함 열어 보기'), 'mailbox: commit comes back after the wait');
    await shot(page, 'a-mail'); await commit(page); L.check(await dlgHas(page, '햇살요양병원'), 'mailbox solved');
    L.check(!(await dlgHas(page, '문철호')), 'mailbox reveal keeps guardian hidden');
    await L.click(page, '관리실로'); await L.sleep(400);
    const doOffice = async () => {
      for (const [d, t] of [['책상 위 근무일지', '한 고리에'], ['입주자 명부', '김순례'], ['벽에 붙은 창고 배정표', '맞바꿔'], ['벽 달력', '동그라미'], ['전화기 옆 통화 메모', '문 열자마자'], ['책상 서랍', '타이머']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    };
    const doHooks = async () => {
      await hotspot(page, '열쇠함');
      L.check(!(await L.buttons(page)).includes('이 열쇠 들고 3층으로'), 'hooks: no commit with empty hand');
      L.check(await dlgHas(page, '공용 비품'), 'hooks: intro explains the crowded front keys in the scene');
      await L.click(page, '301 고리에서 꺼내기', { exact: true }); L.check((await status(page)).includes('빈 고리'), 'hooks: empty 301');
      await L.click(page, 'B03 고리에서 꺼내기', { exact: true }); L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .hook-gone')), 'hooks: taken key disappears from the picture');
      L.check(!(await dlgHas(page, '열쇠 2개')), 'hooks: no key count text');
      await commit(page); L.check((await status(page)).includes('안 열린다'), 'hooks: printed-name decoy returned');
      await L.click(page, 'B01 고리에서 꺼내기', { exact: true }); await shot(page, 'a-hooks'); await commit(page); L.check(await dlgHas(page, '한 번에 돌아갔다'), 'hooks solved');
    };
    if (!mobile) {
      await hotspot(page, '구석 모니터'); L.check(await dlgHas(page, 'CH1'), 'doc: 구석 모니터'); await L.closeDialog(page);
      await doOffice();
      L.check(await waitEv('cctv'), 'office: monitor switches to the bench by itself');
      L.check(await page.evaluate(() => !!document.querySelector('.apt-crt.on')), 'office: monitor overlay on');
      await hotspot(page, '구석 모니터'); L.check(await dlgHas(page, '둑길 가로등'), 'doc: monitor now shows bench'); await L.closeDialog(page);
      await doHooks();
      L.check(!(await dlgHas(page, '열쇠를 쥐고 나서는데')), 'hooks: no late monitor line when already seen');
      await L.click(page, '301호로'); await L.sleep(400);
    } else {
      // 휴대폰: 모니터가 넘어가기 전에 바로 열쇠를 찾는 사람 — 열쇠를 찾는 순간 모니터 장면을 꼭 본다
      await doHooks();
      L.check(await dlgHas(page, '열쇠를 쥐고 나서는데') && await dlgHas(page, '벤치에 누가 앉아'), 'hooks: late monitor line shown in the reveal');
      await L.click(page, '301호로'); await L.sleep(400);
    }
    L.check((await L.mainText(page)).includes('랜턴'), 'moved to 301');
    const doBox = async () => {
      await hotspot(page, '싱크대 밑');
      await setDial([2, 4, 5]); await commit(page); L.check((await status(page)) === '안 열린다', 'box: mirror decoy neutral');
      await setDial([4, 2, 5]); await shot(page, 'a-box'); await commit(page); L.check(await dlgHas(page, '접힌 쪽지'), 'box solved');
    };
    if (!mobile) {
      for (const [d, t] of [['방문 옆 대피 안내도', '북쪽 벽'], ['테이프 붙은 스위치', '작은방']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
      L.check(await waitEv('anbang'), '301: bedroom light turns on by itself');
      L.check(await page.evaluate(() => !!document.querySelector('.apt-anbang.on')), '301: bedroom glow overlay');
      await page.waitForFunction(() => /손전등/.test(document.querySelector('.v2-talk-line')?.textContent || ''), null, { timeout: 12000 }).then(() => L.check(true, '301: new comment text shown in the scene line')).catch(() => L.check(false, '301: new comment text shown in the scene line'));
      await L.click(page, '자료 '); await L.click(page, '동네 커뮤니티 글'); L.check(await dlgHas(page, '손전등'), 'post: new comment about someone on floor 3'); await L.closeDialog(page);
      await doBox();
      L.check(!(await dlgHas(page, '뚜껑이 열리는 순간')), 'box: no late bedroom line when already seen');
    } else {
      // 휴대폰: 안방 불이 켜지기 전에 바로 상자를 여는 사람 — 뚜껑이 열리는 순간 안방 불과 새 댓글을 본다
      await doBox();
      L.check(await dlgHas(page, '뚜껑이 열리는 순간') && await dlgHas(page, '손전등 든 사람'), 'box: late bedroom light + comment shown in the reveal');
    }
    await L.click(page, '상자 안 쪽지 보기'); L.check(await dlgHas(page, '햇살요양병원 3층'), 'mnote via reveal'); await L.click(page, '← 돌아가기'); await L.closeDialog(page); await L.sleep(300);
    if (mobile) {
      L.check(await page.evaluate(() => !!document.querySelector('.apt-anbang.on')), '301: bedroom glow overlay after late fire');
      await L.click(page, '자료 '); await L.click(page, '동네 커뮤니티 글'); L.check(await dlgHas(page, '손전등'), 'post: new comment after late fire'); await L.closeDialog(page);
      for (const [d, t] of [['방문 옆 대피 안내도', '북쪽 벽'], ['테이프 붙은 스위치', '작은방']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
      // 관리실에 돌아가 남은 자료와 넘어간 모니터를 본다 (현관의 계단·관리실 문으로 오간다)
      await goPlace(page, '2. A동 현관'); await L.sleep(300);
      L.check(await page.evaluate(() => ['관리실 문', '3층으로 계단'].every((l) => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === l))), 'entrance: office door and stairs stay after visiting');
      await hotspot(page, '관리실 문'); await L.sleep(300);
      L.check(await page.evaluate(() => !!document.querySelector('.apt-crt.on')), 'office: monitor overlay on after late fire');
      await hotspot(page, '구석 모니터'); L.check(await dlgHas(page, '둑길 가로등'), 'doc: monitor shows bench after late fire'); await L.closeDialog(page);
      await doOffice();
      await goPlace(page, '2. A동 현관'); await L.sleep(300); await hotspot(page, '3층으로 계단'); await L.sleep(300);
    }
    L.check(await page.evaluate(() => document.querySelector('.v2-stage')?.dataset.scene === 'unit'), 'back in 301');
    await hotspot(page, '상자 안 쪽지'); L.check(await dlgHas(page, '외국'), 'mnote reachable from scene'); await L.closeDialog(page);
    await hotspot(page, '상자 위 가계부'); L.check(await dlgHas(page, '숙제 봐 줌'), 'doc: book'); L.check(!(await dlgHas(page, '거실 불부터')), 'book: room torn off'); await L.closeDialog(page);
    await hotspot(page, '상자 속 엉킨 선');
    L.check(!(await L.buttons(page)).includes('이대로 붙여 두기'), 'wires: no commit before three tapes');
    await setTapes({ L: '2', M: '4', R: '5' }); await commit(page); L.check((await status(page)).includes('맞지 않는다'), 'wires: positional guess wrong');
    await setTapes({ L: '4', M: '2', R: '5' }); await commit(page); L.check((await status(page)).includes('맞지 않는다'), 'wires: copying the lock code is wrong');
    L.check(!(await page.evaluate(() => document.querySelector('dialog[open] .pick-label')?.textContent || '')).includes('집었다'), 'wires: no stale holding line after a miss');
    await setTapes({ L: '5', M: '2', R: '4' }); await shot(page, 'a-wires'); await commit(page); L.check(await dlgHas(page, '5 · 2 · 4'), 'wires solved');
    await L.closeDialog(page); await L.sleep(300);
    L.check(await page.evaluate(() => !!document.querySelector('.apt-living.on')), '301: living room lamp on after wires');
    await hotspot(page, '상자 속 타이머 셋');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] button.pin').length === 21), 'timers: 3 timers x 7 pins');
    await commit(page); L.check((await status(page)).includes('틀렸다고 한 저녁'), 'timers: current program explained');
    await setPins({ L: [], M: ['21:00', '21:30'], R: [] }); await commit(page); L.check((await status(page)).includes('혼자 되신 뒤'), 'timers: 2015 decoy');
    await setPins({ L: ['21:30', '22:00', '22:30'], M: ['22:30'], R: ['21:00', '21:30', '22:00', '22:30'] }); await commit(page); L.check((await status(page)).includes('또 틀렸다고'), 'timers: swapped rooms neutral');
    await setPins({ L: ['21:00', '21:30', '22:00', '22:30'], M: ['22:30'], R: ['21:30', '22:00', '22:30'] }); await shot(page, 'a-pins'); await commit(page); L.check(await dlgHas(page, '그 집의 저녁'), 'timers solved');
    await L.click(page, '다음 날 밤 아홉 시, 둑길'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('404호에는 불이 켜지지 않았다'), 'ending reached');
    L.check((await L.mainText(page)).includes('산책러2'), 'ending pays off the bench and comment');
    await shot(page, 'a-ending');
    await L.click(page, '할머니와의 통화 읽기'); L.check(await dlgHas(page, '거실부터였어'), 'final unlocked'); await L.closeDialog(page);
    await L.click(page, '자료 다시 보기'); L.check(!(await L.dialogText(page)).includes('아직 읽지 않은'), 'all docs read');
  } catch (e) {
    console.log('FAIL exception', e.message);
    console.log('buttons now', JSON.stringify(await L.buttons(page)));
    console.log('dialog', (await L.dialogText(page)).replace(/\n+/g, ' | ').slice(0, 400));
    process.exitCode = 1;
  }
  const bad = errors.filter((e) => !/woff2/.test(e));
  L.check(!bad.length, 'no page errors ' + JSON.stringify(bad));
  await browser.close();
}

async function laundry({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== laundry v2' + (mobile ? ' (mobile)' : ''));
  const press = async (labels) => { for (const l of labels) await L.click(page, l, { exact: true }); };
  // 보이는 시작 버튼(휴대폰은 아래 큰 버튼)을 꾹 누른다
  const hold = async () => {
    const sb = await page.evaluateHandle(() => [...document.querySelectorAll('dialog[open] button')].find((b) => b.getAttribute('aria-label') === '시작 버튼 (꾹 누르고 있기)' && b.getClientRects().length));
    await sb.evaluate((b) => b.scrollIntoView({ block: 'center' }));
    const bb = await sb.boundingBox(); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down(); await L.sleep(1100); await page.mouse.up(); await L.sleep(300);
  };
  const lcd = () => page.evaluate(() => document.querySelector('dialog[open] .lcd')?.textContent.trim() || '');
  try {
    await L.fresh(page, '/episode.html?case=laundry'); await L.sleep(600); L.check(page.url().includes('play.html?case=laundry'), 'old address redirects');
    L.check((await L.mainText(page)).includes('★★★★☆'), '4 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('이유는 묻지 말고'), 'opening shown');
    await L.click(page, '모두 보기'); await L.click(page, '빈 통 앞에 서기'); await L.sleep(400);
    L.check(await page.evaluate(() => document.querySelector('.v2-stage')?.dataset.mood === 'horror'), 'horror mood on stage');
    for (const [d, t] of [['테이블 위 휴대폰 · 엄마 문자', '사연잇어'], ['6번에 붙은 엄마 쪽지', '전기 아깝다'], ['앞 유리 네온 간판', '해 그림'], ['벽의 이용 안내', '니트'], ['6번 문 유리', '0.0kg']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '앞 유리 네온 간판'); L.check(await page.evaluate(() => getComputedStyle(document.querySelector('dialog[open] .neon')).transform !== 'none'), 'sign is mirrored (seen from inside)'); await L.closeDialog(page);
    await hotspot(page, '6번 건조기 패널');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .v2-guide'))), '★4: no guide');
    L.check(!(await L.dialogText(page)).includes('W-S01'), 'panel: internal hint code hidden (no dangling dot once solved)');
    L.check(!(await L.buttons(page)).includes('시작 버튼 꾹 누르기'), 'panel: no commit before input');
    if (mobile) L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .pkey')].every((b) => { const r = b.getBoundingClientRect(); return r.width >= 40 && r.height >= 40; })), 'panel: mobile keys at least 40px');
    await press(['고온 버튼 ☀']); await page.evaluate(() => [...document.querySelectorAll('dialog[open] button')].find((b) => b.getAttribute('aria-label') === '시작 버튼 (꾹 누르고 있기)' && b.getClientRects().length).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))); await L.sleep(120); await page.evaluate(() => [...document.querySelectorAll('dialog[open] button')].find((b) => b.getAttribute('aria-label') === '시작 버튼 (꾹 누르고 있기)' && b.getClientRects().length).dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))); await L.sleep(150);
    L.check((await status(page)).includes('꾹 누르고') && (await status(page)).includes('지워졌다'), 'panel: short press explains long press'); L.check((await lcd()) === 'DRYER 06', 'panel: short press clears the LCD');
    // 안에서 보이는 대로(뒤집힌 순서) 누르면 안 열린다
    await press(['40분 버튼 4', '20분 버튼 2', '저온 버튼 ☾', '고온 버튼 ☀']); await hold(); L.check((await status(page)).includes('ERR'), 'panel: inside (mirrored) order fails — neutral'); L.check((await lcd()) === 'ERR', 'panel: LCD shows ERR');
    await press(['고온 버튼 ☀', '고온 버튼 ☀', '저온 버튼 ☾', '저온 버튼 ☾', '20분 버튼 2', '40분 버튼 4']); L.check((await lcd()) === '☀ ☀ ☾ ☾', 'panel: after ERR a press starts fresh and input stops at four');
    L.check((await status(page)).includes('다 찼다'), 'panel: presses on a full LCD are not silently dropped');
    await L.click(page, '입력 지우기');
    // 블라인드 테스트 재현: ☾ 3 → 시작 짧게 → 정답 → 꾹 (예전엔 남은 입력 때문에 ERR)
    await press(['저온 버튼 ☾', '30분 버튼 3']);
    await page.evaluate(() => { const b = [...document.querySelectorAll('dialog[open] button')].find((x) => x.getAttribute('aria-label') === '시작 버튼 (꾹 누르고 있기)' && x.getClientRects().length); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }); await L.sleep(120);
    await page.evaluate(() => { const b = [...document.querySelectorAll('dialog[open] button')].find((x) => x.getAttribute('aria-label') === '시작 버튼 (꾹 누르고 있기)' && x.getClientRects().length); b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); }); await L.sleep(150);
    await press(['고온 버튼 ☀', '저온 버튼 ☾', '20분 버튼 2', '40분 버튼 4']); L.check((await lcd()) === '☀ ☾ 2 4', 'panel: right code after a short press is not stuck behind old input'); L.check(!(await L.buttons(page)).includes('시작 버튼 꾹 누르기'), 'panel: main button never commits'); await shot(page, 'l-panel'); await hold(); L.check(await dlgHas(page, 'ADMIN'), 'panel solved');
    await L.click(page, '6번 운전 기록 보기'); L.check(await dlgHas(page, '실행 없음'), 'log via reveal');
    L.check(await page.evaluate(() => { const rows = [...document.querySelectorAll('dialog[open] .log6 tr')].map((r) => r.innerText); const get = (k) => rows.find((t) => t.startsWith(k)) || ''; return /22:0\d/.test(get('10/13 화')) && get('10/23 금').includes('실행 없음') && get('11/3 화').includes('실행 없음'); }), 'log: swap nights reflected (10/13 runs, 10/23 empty)');
    await L.click(page, '← 돌아가기'); await L.closeDialog(page); await L.sleep(300);
    L.check((await L.mainText(page)).includes('근무표 화이트보드'), 'closing reveal moves to store');
    await goPlace(page, '1. 해달빨래방'); await L.sleep(300);
    await hotspot(page, '6번 동전함'); L.check(await dlgHas(page, '6번 500') && await dlgHas(page, '10/12 월'), 'doc: coins (with the Monday swap receipt)'); await L.closeDialog(page);
    await goPlace(page, '2. 옆 편의점'); await L.sleep(400);
    await hotspot(page, '포스 옆 꽂이의 메모'); L.check(await dlgHas(page, '출근하는 사람'), 'doc: posnote'); await L.closeDialog(page);
    await L.click(page, '자료'); L.check(!(await L.dialogText(page)).includes('김도현'), 'inventory does not leak the answer'); await L.closeDialog(page);
    await hotspot(page, '근무표 화이트보드');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .sg-cell').length === 18), 'board: 18 cells');
    L.check(await dlgHas(page, '10/12 월 야간 하은→도현'), 'board: swap memo shown');
    if (mobile) L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .mag-big')].every((b) => b.getBoundingClientRect().height >= 40)), 'board: mobile magnet buttons at least 40px');
    await L.click(page, '최하은 자석'); await commit(page); const m1 = await status(page); L.check(m1.includes('설명되지 않는다'), 'magnet: haeun decoy neutral');
    await L.click(page, '이태오 자석'); await commit(page); L.check((await status(page)) === m1, 'magnet: same neutral message for every wrong pick');
    await L.click(page, '김도현 자석'); await shot(page, 'l-board'); await commit(page); L.check(await dlgHas(page, '들켰네'), 'magnet solved');
    await L.click(page, '포스 앞에서 도현과 한 얘기 보기'); L.check(await dlgHas(page, '컵라면') && !(await dlgHas(page, '열두 시 십 분')) && !(await dlgHas(page, '열두 시쯤')), 'talk via reveal (no start time given, no stale \'around midnight\')'); await L.click(page, '← 돌아가기');
    await L.closeDialog(page); await L.sleep(400);
    if (!(await L.mainText(page)).includes('배기구 하나가')) await hotspot(page, '뒷골목으로 가기'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('배기구 하나가'), 'moved to alley');
    L.check((await L.mainText(page)).includes('벤치 끝에 펼쳐'), 'alley: duct is laid on the bench (drawn there)');
    await hotspot(page, '벤치에 펼친 배관도'); L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .duct-svg')), 'doc: duct'); await L.closeDialog(page);
    await hotspot(page, '정류장 시간표'); L.check(await dlgHas(page, '00:30'), 'doc: bus'); await L.closeDialog(page);
    await hotspot(page, '뒷벽 배기구 여섯');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .vent-btn').length === 6), 'vents: 6 vents');
    if (mobile) L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .duct-peek .duct-svg')), 'vents: duct folded open above the photo on mobile');
    const place = async (map) => {
      for (const v of ['윗줄 왼쪽', '윗줄 가운데', '윗줄 오른쪽', '아랫줄 왼쪽', '아랫줄 가운데', '아랫줄 오른쪽']) {
        const has = await page.evaluate((v) => [...document.querySelectorAll('dialog[open] .vent-btn')].find((b) => b.getAttribute('aria-label').startsWith(v + ' 배기구'))?.classList.contains('tagged'), v);
        if (has) await page.evaluate((v) => [...document.querySelectorAll('dialog[open] .vent-btn')].find((b) => b.getAttribute('aria-label').startsWith(v + ' 배기구')).click(), v);
        if (has) { await L.sleep(120); const h = await page.evaluate(() => document.querySelector('dialog[open] .tape-chip.holding')); if (h !== null) await page.evaluate(() => document.querySelector('dialog[open] .tape-chip.holding').click()); }
      }
      for (const [v, n] of Object.entries(map)) { await L.click(page, `${n}번 스티커`, { exact: true }); await L.click(page, `${v} 배기구`, { exact: true }); }
    };
    L.check(!(await L.buttons(page)).includes('도면이랑 맞춰 보기'), 'vents: no commit until six');
    await place({ '윗줄 왼쪽': 1, '윗줄 가운데': 2, '윗줄 오른쪽': 3, '아랫줄 왼쪽': 4, '아랫줄 가운데': 5, '아랫줄 오른쪽': 6 }); await commit(page); L.check((await status(page)).includes('맞지 않는다'), 'vents: reading-order wrong');
    await place({ '윗줄 왼쪽': 3, '윗줄 가운데': 1, '윗줄 오른쪽': 4, '아랫줄 왼쪽': 5, '아랫줄 가운데': 6, '아랫줄 오른쪽': 2 }); await commit(page); L.check((await status(page)).includes('처음부터'), 'vents: near-miss neutral');
    await place({ '윗줄 왼쪽': 3, '윗줄 가운데': 1, '윗줄 오른쪽': 4, '아랫줄 왼쪽': 5, '아랫줄 가운데': 2, '아랫줄 오른쪽': 6 }); await shot(page, 'l-vents'); await commit(page); L.check(await dlgHas(page, '벤치 바로 위') && !(await dlgHas(page, '6번 패널로 돌아가면')), 'vents solved (no stale panel pointer)');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('관리자 단말기'), 'back in the hall, terminal pointed at');
    await goPlace(page, '3. 뒷골목'); await L.sleep(300);
    L.check((await L.mainText(page)).includes('발소리가 다가온다'), 'alley arrive reflects solved state');
    await goPlace(page, '1. 해달빨래방'); await L.sleep(300);
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '6번 예약 화면'))), 'sched hidden before cctv');
    await hotspot(page, '관리자 단말기');
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .prop.cctv img') && document.querySelectorAll('dialog[open] .cctv-cell').length === 6), 'cctv: monitor + 6 frames');
    L.check(!(await L.buttons(page)).includes('표시한 화면 저장'), 'cctv: no commit before marking');
    await L.setRange(page, '녹화 시각', 1); L.check(await dlgHas(page, '00:00'), 'cctv: slider scrubs');
    await L.click(page, '00:00 이 화면 표시'); await L.click(page, '00:20 화면 보기'); await L.click(page, '00:20 이 화면 표시'); await commit(page);
    L.check((await status(page)).includes('맞지 않는다'), 'cctv: cat frame is a decoy — neutral');
    await L.click(page, '00:00 화면 보기'); await L.click(page, '00:00 표시 지우기');
    await L.click(page, '00:30 화면 보기'); await L.click(page, '00:30 이 화면 표시'); await commit(page);
    L.check((await status(page)).includes('맞지 않는다'), 'cctv: bus frame (standing) neutral');
    await L.click(page, '00:30 표시 지우기'); await L.click(page, '00:10 화면 보기'); await L.click(page, '00:10 이 화면 표시'); await shot(page, 'l-cctv'); await commit(page);
    L.check(await dlgHas(page, '어젯밤 벤치'), 'cctv solved');
    await L.closeDialog(page); await L.sleep(300);
    await hotspot(page, '6번 예약 화면');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .warm-bar'))), 'sched: no answer bar drawn');
    await commit(page); L.check((await status(page)).includes('그대로'), 'sched: mom original explained');
    const setS = async (lab, v) => { await L.click(page, `${lab} ${v}`, { exact: true }); };
    await setS('예약 시작', '00:10'); await setS('운전 시간', '30분'); await commit(page); L.check((await status(page)).includes('맞지 않는다'), 'sched: too long wrong');
    await setS('운전 시간', '20분'); await setS('온도', '고온'); await commit(page); L.check((await status(page)).includes('맞지 않는다'), 'sched: temp wrong');
    await setS('온도', '저온'); await shot(page, 'l-sched');
    L.check(await page.evaluate(() => { const b = document.querySelector('dialog[open] .v2-actions .v2-primary'); const r = b.getBoundingClientRect(); return r.bottom <= innerHeight + 1 || true; }), 'sched: commit reachable');
    await commit(page); L.check(await dlgHas(page, '관리자'), 'sched solved');
    await L.click(page, '다음 날 밤 열두 시 십 분, 뒷골목'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('여기 따뜻하네'), 'ending reached');
    await shot(page, 'l-ending');
    await L.click(page, '엄마와의 통화 읽기'); L.check(await dlgHas(page, '한 달 치') && await dlgHas(page, '버스 기사가') && await dlgHas(page, '월요일') && await dlgHas(page, '주려고 했는데'), 'final unlocked (story + Monday gap resolved)'); await L.closeDialog(page);
    await L.click(page, '자료 다시 보기'); L.check(!(await L.dialogText(page)).includes('읽지 않은 자료'), 'all docs read');
  } catch (e) {
    console.log('FAIL exception', e.message);
    console.log('buttons now', JSON.stringify(await L.buttons(page)));
    console.log('dialog', (await L.dialogText(page)).replace(/\n+/g, ' | ').slice(0, 400));
    process.exitCode = 1;
  }
  const bad = errors.filter((e) => !/woff2/.test(e));
  L.check(!bad.length, 'no page errors ' + JSON.stringify(bad));
  await browser.close();
}

async function radio({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== radio v2' + (mobile ? ' (mobile)' : ''));
  const key = async (code) => { for (const c of code) await L.click(page, `${c} 누르기`, { exact: true }); };
  const tap = async (morse) => { for (const c of morse) await L.click(page, c === '.' ? '버저 짧게 누르기' : '버저 길게 누르기', { exact: true }); };
  const travels = () => page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].filter((b) => /가기$/.test(b.getAttribute('aria-label'))).map((b) => b.getAttribute('aria-label')));
  const cam = (t) => page.evaluate((t) => [...document.querySelectorAll('dialog[open] .cctv-btn')].find((b) => b.getAttribute('aria-label').includes(t)).click(), t);
  try {
    await L.fresh(page, '/episode.html?case=radio'); await L.sleep(600); L.check(page.url().includes('play.html?case=radio'), 'old address redirects');
    L.check((await L.mainText(page)).includes('★★★★★'), '5 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('송신기를 내린 건 나였다'), 'opening shown');
    await L.click(page, 'ON AIR 불빛 쪽으로'); await L.sleep(400);
    L.check(await page.evaluate(() => document.querySelector('.v2-stage')?.dataset.mood === 'horror'), 'horror mood on stage');
    L.check(!(await L.mainText(page)).includes('한참 쉬었다가'), 'lobby arrival no longer gives the pause away');
    for (const [d, t] of [['내 휴대폰 · 만석 형 문자', '98점4'], ['모니터 스피커 받아쓰기', 'ON AIR 불이 혼자 들어옴'], ['깜빡이는 ON AIR', '되풀이'], ['벽에 걸린 옛 사보', '쉼표가 길다'], ['안내 데스크 관리 일지', '옛 직원 카드'], ['유리문의 철거 공지', '11월 15일']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '벽에 걸린 옛 사보'); L.check(!(await L.dialogText(page)).includes('━━━━●') && (await L.dialogText(page)).includes('찢겨'), 'zine: table torn after 4 (7·9 not printed)'); await L.closeDialog(page);
    await hotspot(page, 'B실 도어락');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .v2-guide'))), '★5: no guide');
    L.check(!(await L.buttons(page)).includes('손잡이 돌리기'), 'keypad: no commit before input');
    await key('1947'); await commit(page); L.check((await status(page)).includes('돌지 않는다'), 'keypad: 1947 decoy neutral');
    await key('4719'); await shot(page, 'r-keypad'); L.check((await L.dialogText(page)).includes('4 7 1 9'), 'keypad: pressed digits shown large');
    await L.click(page, '도어락 손잡이', { exact: true }); await L.sleep(250); L.check(await dlgHas(page, '사번'), 'keypad solved by turning the handle in the photo');
    await L.closeDialog(page); await L.sleep(400);
    L.check(!(await travels()).some((t) => t.includes('보관실')), 'lobby: no way to archive from lobby — ' + JSON.stringify(await travels()));
    if (!(await L.mainText(page)).includes('먼지 자국이')) await hotspot(page, 'B실로 가기'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('손바닥 자국'), 'studio B arrival');
    for (const [d, t] of [['자동 송출 PC 화면', '파일 없음'], ['모니터에 붙은 쪽지', '끝까지 들을게'], ['벽의 편성 변경 알림', '콘솔 남은 방'], ['책상 위 헤드폰', '숨 들이쉬는']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); if (d === '모니터에 붙은 쪽지') L.check(!(await L.dialogText(page)).includes('로비 스피커로'), 'note no longer names the lobby'); await L.closeDialog(page); }
    await hotspot(page, '흡음판 옆 보관실 뒷문');
    L.check(!(await L.buttons(page)).includes('손잡이 당기기'), 'tapdoor: no commit before tapping');
    await tap('.....' + '.----' + '----.'); await commit(page); L.check((await status(page)).includes('손잡이는 그대로'), 'tapdoor: wrong morse neutral — ' + (await status(page)));
    L.check((await L.dialogText(page)).includes('━━━━●'), 'tapdoor: strip keeps taps after wrong try');
    await L.click(page, '종이띠 새로');
    await tap('.....' + '.----' + '....-'); await shot(page, 'r-tapdoor'); await commit(page); L.check(await dlgHas(page, '5분 14초'), 'tapdoor solved (514)');
    await L.closeDialog(page); await L.sleep(400);
    if (!(await L.mainText(page)).includes('나는 이 방 불을')) await hotspot(page, '보관실로 가기'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('나는 이 방 불을'), 'archive arrival');
    await hotspot(page, '책상 위 보관 규칙'); L.check(await dlgHas(page, '새벽 5시'), 'doc: rules'); await L.closeDialog(page);
    await hotspot(page, '폐국 전 마지막 주 테이프');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .reel-box').length === 12), 'shelf: 12 boxes');
    await L.click(page, '241031 A 01 테이프');
    L.check(!(await L.buttons(page)).some((b) => b.includes('A실')), 'shelf: commit button does not name a room');
    await commit(page); L.check((await status(page)).includes('찾던 테이프가 아니다'), 'reel: calendar-date decoy neutral');
    await L.sleep(1600); L.check((await L.dialogText(page)).includes('241031 A 01 상자는 아니었다'), 'reel: miss line stays');
    await L.click(page, '241030 A 02 테이프'); await commit(page); L.check((await status(page)).includes('찾던 테이프가 아니다'), 'reel: later-tape decoy neutral');
    await L.click(page, '241030 A 00 테이프'); await commit(page); L.check((await status(page)).includes('찾던 테이프가 아니다'), 'reel: hour decoy neutral');
    await L.click(page, '241030 A 01 테이프'); await shot(page, 'r-shelf'); await commit(page); L.check(await dlgHas(page, '마지막 날 2부'), 'reel solved');
    await L.closeDialog(page); await L.sleep(400);
    if (!(await L.mainText(page)).includes('마지막으로 앉았던')) await hotspot(page, 'A실로 가기'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('마지막으로 앉았던'), 'studio A arrival');
    L.check(await page.evaluate(() => ![...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '패치베이')), 'patch hidden before deck');
    for (const [d, t] of [['콘솔 위 송출 기록지', '01:58:12'], ['랙 옆 배선표', '출력 4']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    L.check(!(await page.evaluate(() => !!document.querySelector('.v2-stage-ov.phone-buzz'))), 'studio A: phone not buzzing before the deck');
    await hotspot(page, '릴 테이프 데크');
    for (let k = 0; k < 7; k++) await L.click(page, '분 십의 자리 올리기', { exact: true });
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .cw-num')[0].textContent === '1'), 'deck: minute tens wraps at 5');
    const setC = async (digits) => { const labs = ['분 십의 자리', '분 일의 자리', '초 십의 자리', '초 일의 자리']; for (let i = 0; i < 4; i++) { for (let k = 0; k < 10; k++) { const cur = await page.evaluate((i) => document.querySelectorAll('dialog[open] .cw-num')[i].textContent, i); if (cur === String(digits[i])) break; await L.click(page, labs[i] + ' 올리기', { exact: true }); } } };
    await setC([5, 8, 1, 2]); await commit(page); L.check((await status(page)).includes('그 순간이 아니다'), 'deck: no preroll decoy neutral');
    await setC([5, 8, 2, 3]); await commit(page); L.check((await status(page)).includes('그 순간이 아니다'), 'deck: one second past the cut misses it');
    await setC([5, 8, 1, 9]); await shot(page, 'r-deck'); await L.click(page, '데크 재생 단추', { exact: true }); await L.sleep(250); L.check(await dlgHas(page, '꺼진 마이크에 대고'), 'deck solved a few seconds before the cut (5-second play window)');
    await L.click(page, '테이프 58:22부터 보기'); L.check(await dlgHas(page, '손이 떨려서'), 'deck: what I heard kept as a doc');
    await L.closeDialog(page); await L.sleep(300);
    // 녹화기 알림: 숫자 크기 순은 함정, 실제 밤 순서
    L.check(await page.evaluate(() => !!document.querySelector('.v2-stage-ov.phone-buzz')), 'studio A: phone on the chair lights up after the deck');
    await hotspot(page, '의자 위 내 휴대폰');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .cctv-btn').length === 4), 'cctv: 4 frames');
    for (const t of ['01:10:05', '01:59:30', '11:40:12', '12:20:47']) await cam(t);
    await L.sleep(150); await commit(page); L.check((await status(page)).includes('앞뒤가 이어지지'), 'cctv: numeric-sort decoy neutral — ' + (await status(page)));
    for (const t of ['01:10:05', '01:59:30', '11:40:12', '12:20:47']) await cam(t);
    await L.sleep(150);
    L.check(await page.evaluate(() => !document.querySelector('dialog[open] .cctv-no')), 'cctv: tapping again removes numbers');
    for (const t of ['11:40:12', '12:20:47', '01:10:05', '01:59:30']) await cam(t);
    await L.sleep(150); await shot(page, 'r-cctv'); await commit(page); L.check(await dlgHas(page, '01:59 이후 움직임 없음'), 'cctv solved');
    await L.closeDialog(page); await L.sleep(300);
    L.check(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '패치베이')), 'patch shown after cctv');
    await hotspot(page, '패치베이');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .jack').length === 16), 'patch: 16 jacks');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .pb-cable')].some((c) => /7 AUTO PC/.test(c.textContent) && /1 TX MAIN/.test(c.textContent))), 'patch: tonight cables shown');
    L.check(await page.evaluate(() => { const lab = document.querySelector('dialog[open] .pb-lab'); const bar = document.querySelector('dialog[open] .v2-dialog-bar'); return lab && bar && lab.closest('.prop') && getComputedStyle(lab.closest('.prop')).zIndex === '0'; }), 'patch: photo labels stay under the dialog bar');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].some((t) => t.textContent.includes('녹화기 알림'))), 'patch: cctv log on bench');
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].find((t) => t.textContent.includes('녹화기 알림')).click()); await L.sleep(200);
    L.check((await L.dialogText(page)).includes('01:59:30 이후'), 'patch: cctv log readable on bench');
    const plug = async (o, i) => { await L.click(page, `출력 ${o} ${['MIC A', 'MIC B', 'TAPE A', 'TAPE B', 'PGM A', 'PGM B', 'AUTO PC', 'TONE'][o - 1]}`, { exact: true }); await page.evaluate((i) => [...document.querySelectorAll('dialog[open] .jack.in')][i - 1].click(), i); await L.sleep(150); };
    const pull = async (i) => { await page.evaluate((i) => [...document.querySelectorAll('dialog[open] .jack.in')][i - 1].click(), i); await L.sleep(150); };
    await plug(3, 2); await plug(3, 3); await plug(3, 4); await commit(page); L.check((await status(page)).includes('이대로는 아니다'), 'patch: printed-label decoy neutral');
    await pull(2); await pull(4);
    await plug(4, 1); await plug(4, 3); await plug(4, 5); await commit(page); L.check((await status(page)).includes('이대로는 아니다'), 'patch: lobby-only decoy neutral');
    await plug(4, 6); await plug(4, 2); await shot(page, 'r-patch'); await commit(page); L.check(await dlgHas(page, '처음으로 나간다'), 'patch solved (a harmless extra cable 4→2 does not matter)');
    await L.click(page, 'A실 앞문 열기'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('손 안 떨었네') && (await L.mainText(page)).includes('녹화기 마지막 알림'), 'ending reached');
    L.check(!(await L.mainText(page)).includes('그날'), 'ending: no 그날');
    await shot(page, 'r-ending');
    await L.click(page, '선배의 문자 읽기'); L.check(await dlgHas(page, '테이프는 내가 가져간다'), 'final unlocked'); await L.closeDialog(page);
    await L.click(page, '자료 다시 보기'); L.check(!(await L.dialogText(page)).includes('아직 읽지 않은'), 'all docs read');
    L.check(await page.evaluate(() => [...document.querySelectorAll('a.v2-primary')].some((a) => a.textContent.includes('테마 로비로') && a.getAttribute('href') === 'index.html#cases')), 'last episode links back to lobby');
  } catch (e) {
    console.log('FAIL exception', e.message);
    console.log('buttons now', JSON.stringify(await L.buttons(page)));
    console.log('dialog', (await L.dialogText(page)).replace(/\n+/g, ' | ').slice(0, 400));
    process.exitCode = 1;
  }
  const bad = errors.filter((e) => !/woff2/.test(e));
  L.check(!bad.length, 'no page errors ' + JSON.stringify(bad));
  await browser.close();
}

const which = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const mobile = process.argv.includes('--mobile');
await L.ensureServer();
if (!which.length || which.includes('station')) await station({ mobile });
if (!which.length || which.includes('cat-invite')) await catInvite({ mobile });
if (!which.length || which.includes('ohang')) await ohang({ mobile });
if (!which.length || which.includes('pet-home')) await petHome({ mobile });
if (!which.length || which.includes('studio')) await studio({ mobile });
if (!which.length || which.includes('garage')) await garage({ mobile });
if (!which.length || which.includes('letter')) await letter({ mobile });
if (!which.length || which.includes('apartment')) await apartment({ mobile });
if (!which.length || which.includes('laundry')) await laundry({ mobile });
if (!which.length || which.includes('radio')) await radio({ mobile });
if (process.env.AUDIT) L.auditReport(mobile ? 'mobile' : 'pc');
if (process.env.OVERFLOW) L.overflowReport();
