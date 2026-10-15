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
  await L.sleep(300);
}

async function station({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== station v2' + (mobile ? ' (mobile)' : ''));
  try {
    await L.fresh(page, '/play.html?case=station');
    await shot(page, 'intro');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('여기서 시작. 찾아와'), 'opening shown');
    await shot(page, 'opening');
    await L.click(page, '중앙역 대합실로');
    await L.sleep(400);
    L.check((await L.mainText(page)).includes('자료 0 / 11'), 'doc counter starts at 0/11');
    // 아직 아무것도 안 읽었을 때: 장치 옆 자료는 잠겨 있어야 함
    await hotspot(page, '열차 안내판');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].every((t) => t.disabled)), 'bench docs locked before reading');
    await L.closeDialog(page);
    // read docs in hall
    for (const d of ['민서의 마지막 메시지', '벽에 기댄 옛 표지판', '매표창구의 역무원', '승강장 개편 안내']) { await hotspot(page, d); L.check(await dlgHas(page, d), 'doc opens: ' + d); await L.closeDialog(page); }
    await shot(page, 'hall');
    // unread nudge in index
    await L.click(page, '자료 4 / 11');
    L.check(await dlgHas(page, '자료 목록'), 'index opens');
    await L.closeDialog(page);
    // hints: tier flow
    await L.click(page, '힌트');
    await L.click(page, '첫 힌트 받기');
    L.check(await dlgHas(page, '서른여섯'), 'hint tier 1 shown');
    await L.closeDialog(page);
    // grille: wrong then right (읽은 자료는 옆에 펼쳐짐)
    await hotspot(page, '열차 안내판');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].every((t) => !t.disabled)), 'bench docs unlocked after reading');
    await commit(page);
    L.check((await status(page)).includes('하나씩 골라야'), 'grille: empty choice explained');
    await L.click(page, '1번 승강장'); await L.click(page, '둘째 기둥'); await commit(page);
    L.check((await status(page)).includes('아무것도'), 'grille: wrong platform explained — ' + (await status(page)));
    await L.click(page, '구간권 오른쪽으로'); await L.click(page, '구간권 오른쪽으로'); await L.click(page, '구간권 아래로');
    L.check((await L.dialogText(page)).includes('2번둘째기둥'), 'grille: correct offset reads 2번둘째기둥');
    await L.click(page, '2번 승강장'); await commit(page);
    L.check(await dlgHas(page, '2번 승강장, 둘째 기둥'), 'grille solved reveal');
    await shot(page, 'reveal1');
    await L.click(page, '2번 승강장 · 둘째 기둥으로');
    await L.sleep(400);
    L.check((await L.mainText(page)).includes('둘째 기둥 눈높이에'), 'platform scene reached');
    await shot(page, 'platform');
    for (const d of ['기둥에 붙은 네컷사진', '기둥의 출발 시각표', '벤치 — 민서와 나']) { await hotspot(page, d); await L.closeDialog(page); }
    // mirror
    await hotspot(page, '승강장 끝의 볼록거울');
    await shot(page, 'mirror');
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .train.dim')].find((b) => b.textContent.includes('09:40'))?.click());
    await commit(page);
    L.check((await status(page)).includes('두 승강장'), 'mirror: other platform explained — ' + (await status(page)));
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .train:not(.dim)')].find((b) => b.textContent.includes('09:25'))?.click());
    await commit(page);
    L.check((await status(page)).includes('제대로 읽지'), 'mirror: unread back side explained — ' + (await status(page)));
    await L.click(page, '거울 앞에 들기');
    await commit(page);
    L.check((await status(page)).includes('나란히'), 'mirror: not aligned explained — ' + (await status(page)));
    await L.setRange(page, '사진 기울이기', 50);
    await commit(page);
    L.check((await status(page)).includes('처음 만난 그 시간'), 'mirror: wrong time explained — ' + (await status(page)));
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .train:not(.dim)')].find((b) => b.textContent.includes('09:40'))?.click());
    await commit(page);
    L.check(await dlgHas(page, '09:40 수림행 급행'), 'mirror solved');
    await L.click(page, '수림역 · 보관함으로');
    await L.sleep(400);
    for (const d of ['게시판의 그림엽서', '보관함 이용 안내']) { await hotspot(page, d); await L.closeDialog(page); }
    await shot(page, 'surim');
    // locker
    await hotspot(page, '별 스티커가 붙은 보관함');
    await L.click(page, '1번째 다이얼 올리기'); await L.click(page, '1번째 다이얼 올리기'); await L.click(page, '1번째 다이얼 올리기');
    await commit(page);
    const st = await status(page);
    L.check(st.includes('1자리는 맞다'), 'locker: partial match explained — ' + st);
    for (let i = 0; i < 4; i++) await L.click(page, '2번째 다이얼 올리기');
    for (let i = 0; i < 2; i++) await L.click(page, '3번째 다이얼 올리기');
    await L.click(page, '4번째 다이얼 올리기');
    await shot(page, 'locker');
    await commit(page);
    L.check(await dlgHas(page, '3 · 4 · 2 · 1'), 'locker solved');
    await L.click(page, '수림 마을길로');
    await L.sleep(400);
    for (const d of ['민서의 편지', '접힌 손지도']) { await hotspot(page, d); await L.closeDialog(page); }
    // notes: deduction (walk hidden until solved)
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '마을로 걸어가기'))), 'walk hidden before notes');
    await hotspot(page, '쪽지 세 장');
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .note-card')][0].click()); await L.click(page, '둘째 집', { exact: true }); await commit(page);
    L.check((await status(page)).includes('거짓이 둘'), 'notes: contradiction explained — ' + (await status(page)));
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .note-card')][1].click()); await L.click(page, '셋째 집', { exact: true }); await commit(page);
    L.check(await dlgHas(page, '거짓말은 나'), 'notes solved');
    await L.click(page, '계속'); await L.sleep(400);
    // walk: wrong first turn
    await hotspot(page, '마을로 걸어가기');
    await L.click(page, '오른쪽'); await L.click(page, '왼쪽'); await L.click(page, '첫째 집'); await commit(page);
    L.check((await status(page)).includes('등지고'), 'walk: reversed start explained — ' + (await status(page)));
    await L.click(page, '역 앞으로 되돌아가기');
    await L.click(page, '왼쪽'); await L.click(page, '직진'); await L.click(page, '오른쪽'); await L.click(page, '직진 (다리 건너기)'); await L.click(page, '왼쪽');
    await L.click(page, '첫째 집'); await commit(page);
    L.check((await status(page)).includes('쪽지'), 'walk: right lane wrong house explained — ' + (await status(page)));
    await L.click(page, '셋째 집');
    await shot(page, 'walk');
    await commit(page);
    L.check(await dlgHas(page, '파란 대문'), 'walk solved');
    await L.click(page, '대문 안으로');
    await L.sleep(500);
    const t = await L.mainText(page);
    L.check(t.includes('없는 승강장에서 온 초대'), 'ending reached');
    await shot(page, 'ending');
    await L.click(page, '마지막 장 읽기');
    L.check(await dlgHas(page, '보관함에 넣어 뒀어'), 'final letter unlocked');
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
  try {
    await L.fresh(page, '/play.html?case=cat-invite');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('봄이가 알아요'), 'opening shown');
    await L.click(page, '봄이의 목걸이 보기'); await L.sleep(400);
    for (const d of ['문 밑으로 들어온 봉투', '봄이 목걸이의 참']) { await hotspot(page, d); L.check(await dlgHas(page, d), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '골목으로 나가기');
    L.check((await L.mainText(page)).includes('오늘 휴진'), 'alley reached');
    for (const d of ['병원 유리문의 쪽지', '골목에서 본 것']) { await hotspot(page, d); await L.closeDialog(page); }
    // seasons: 뚜껑 안쪽 주머니 다섯
    await hotspot(page, '창턱의 상자');
    L.check(await page.evaluate(() => document.querySelector('dialog[open] .v2-guide')?.open === true), 'easy episode: guide open by default');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .boxlid img').length === 1 && document.querySelectorAll('dialog[open] .pocket').length === 5), 'seasons: box lid photo + 5 pockets');
    await commit(page);
    L.check((await status(page)).includes('다섯을 다 채워야'), 'seasons: empty explained');
    for (const l of ['벚꽃 아래 · 다 큰 뒤', '수박 옆', '낙엽 위', '눈 오는 날', '벚꽃 아래 · 아기']) await L.click(page, l + ' 사진 넣기', { exact: true });
    await commit(page);
    L.check((await status(page)).includes('작을 때가 먼저'), 'seasons: kitten/adult swap explained — ' + (await status(page)));
    await L.click(page, '1번째 주머니: 벚꽃 아래 · 다 큰 뒤', { exact: true }); // 빼기 → 1번 비움
    await L.click(page, '5번째 주머니: 벚꽃 아래 · 아기', { exact: true });
    await L.click(page, '벚꽃 아래 · 아기 사진 넣기', { exact: true }); await L.click(page, '벚꽃 아래 · 다 큰 뒤 사진 넣기', { exact: true });
    await commit(page);
    L.check(await dlgHas(page, '두 번의 봄'), 'seasons solved');
    await shot(page, 'cat-seasons-solved');
    await L.click(page, '계속'); await L.sleep(300);
    // gifts: 바구니 이름표
    await hotspot(page, '빵집 앞 바구니');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .basket .tag').length === 4), 'gifts: 4 tags on basket photo');
    const name = async (gift, who) => { await L.click(page, gift + '의 이름표'); await L.click(page, gift + (/[가-힣]$/.test(gift) && (gift.charCodeAt(gift.length - 1) - 0xac00) % 28 ? '은 ' : '는 ') + who, { exact: true }); };
    await name('파란 리본 상자', '소연'); await commit(page);
    L.check((await status(page)).includes('아직 비어'), 'gifts: missing explained');
    await name('노란 리본 상자', '은호'); await name('초록 리본 봉투', '지후'); await name('리본 없는 꽃다발', '미정'); await commit(page);
    L.check((await status(page)).includes('빵집에서'), 'gifts: wrong person explained — ' + (await status(page)));
    await name('파란 리본 상자', '은호'); await name('노란 리본 상자', '소연'); await commit(page);
    L.check(await dlgHas(page, '네 사람, 네 색'), 'gifts solved');
    await shot(page, 'cat-gifts-solved');
    // 풀고 X로 닫아도 다음 장소로 이동해야 함
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('전구를 걸어'), 'closing reveal with X still moves to next scene');
    await hotspot(page, '우체통의 봉투'); await L.closeDialog(page);
    await hotspot(page, '평상 자리표');
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .paperchart img') && !!document.querySelector('dialog[open] .chart-on-paper svg')), 'seats: chart drawn on paper photo');
    const sit = async (seat, who) => { await L.click(page, seat + ' 자리'); await L.click(page, seat + '에 ' + who, { exact: true }); };
    await sit('감나무 쪽', '은호'); await sit('우체통 쪽', '소연'); await sit('꽃집 쪽', '지후'); await sit('골목 입구 쪽', '미정'); await commit(page);
    L.check((await status(page)).includes('등 뒤'), 'seats: 감나무 쪽 은호 explained — ' + (await status(page)));
    await sit('꽃집 쪽', '은호'); await sit('감나무 쪽', '미정'); await sit('골목 입구 쪽', '지후'); await commit(page);
    L.check(await dlgHas(page, '빈자리 하나'), 'seats solved');
    await shot(page, 'cat-seats-solved');
    await L.click(page, '이틀 뒤, 저녁 일곱 시로'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('고양이가 데려온 사람들'), 'ending reached');
    await L.click(page, '평상 밑 상자의 초대장 읽기');
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

const which = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const mobile = process.argv.includes('--mobile');
await L.ensureServer();
if (!which.length || which.includes('station')) await station({ mobile });
if (!which.length || which.includes('cat-invite')) await catInvite({ mobile });
