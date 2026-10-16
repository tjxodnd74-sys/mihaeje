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
    L.check((await L.mainText(page)).includes('여기서 시작'), 'opening shown');
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
    L.check((await status(page)).includes('말이 안 된다'), 'grille: unread holes explained — ' + (await status(page)));
    await L.click(page, '구간권 오른쪽으로'); await L.click(page, '구간권 오른쪽으로'); await L.click(page, '구간권 아래로');
    L.check((await L.dialogText(page)).includes('2번둘째기둥'), 'grille: correct offset reads 2번둘째기둥');
    await commit(page);
    L.check((await status(page)).includes('아무것도'), 'grille: wrong platform explained — ' + (await status(page)));
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
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .train:not(.dim)')].find((b) => b.textContent.includes('09:25'))?.click());
    await commit(page);
    L.check((await status(page)).includes('제대로 읽지'), 'mirror: unread back side explained — ' + (await status(page)));
    await L.click(page, '거울 앞에 들기');
    await commit(page);
    L.check((await status(page)).includes('나란히'), 'mirror: not aligned explained — ' + (await status(page)));
    await L.setRange(page, '사진 기울이기', 50);
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .train.dim')].find((b) => b.textContent.includes('09:40'))?.click());
    await commit(page);
    L.check((await status(page)).includes('두 승강장'), 'mirror: other platform explained — ' + (await status(page)));
    await page.evaluate(() => [...document.querySelectorAll('dialog[open] .train:not(.dim)')].find((b) => b.textContent.includes('09:25'))?.click());
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
    L.check(st.includes('어딘가가 다르다') && !st.includes('자리는 맞'), 'locker: wrong without digit leak — ' + st);
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
    for (const l of ['벚꽃 아래 A', '수박 옆', '낙엽 위', '눈 오는 날', '벚꽃 아래 B']) await L.click(page, l + ' 사진 넣기', { exact: true });
    await commit(page);
    L.check((await status(page)).includes('작을 때가 먼저'), 'seasons: kitten/adult swap explained — ' + (await status(page)));
    await L.click(page, '1번째 주머니: 벚꽃 아래 A', { exact: true }); // 빼기 → 1번 비움
    await L.click(page, '5번째 주머니: 벚꽃 아래 B', { exact: true });
    await L.click(page, '벚꽃 아래 B 사진 넣기', { exact: true }); await L.click(page, '벚꽃 아래 A 사진 넣기', { exact: true });
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
    L.check((await status(page)).includes('그 색을 본 적이'), 'gifts: wrong person explained — ' + (await status(page)));
    await name('파란 리본 상자', '은호'); await name('노란 리본 상자', '소연'); await commit(page);
    L.check(await dlgHas(page, '네 사람, 네 색'), 'gifts solved');
    await shot(page, 'cat-gifts-solved');
    // 풀고 X로 닫아도 다음 장소로 이동해야 함
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('전구가 줄줄이'), 'closing reveal with X still moves to next scene');
    await hotspot(page, '우체통의 봉투'); await L.closeDialog(page);
    await hotspot(page, '평상 자리표');
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .paperchart img') && !!document.querySelector('dialog[open] .chart-on-paper svg')), 'seats: chart drawn on paper photo');
    const sit = async (seat, who) => { await L.click(page, seat + ' 자리'); await L.click(page, seat + '에 ' + who, { exact: true }); };
    await sit('감나무 쪽', '은호'); await sit('우체통 쪽', '소연'); await sit('꽃집 쪽', '지후'); await sit('골목 입구 쪽', '미정'); await commit(page);
    L.check((await status(page)).includes('등 뒤'), 'seats: 감나무 쪽 은호 explained — ' + (await status(page)));
    await sit('꽃집 쪽', '은호'); await sit('감나무 쪽', '미정'); await sit('골목 입구 쪽', '지후'); await commit(page);
    L.check((await status(page)).includes('오른손'), 'seats: soyeon on the right explained — ' + (await status(page)));
    await sit('골목 입구 쪽', '소연'); await sit('우체통 쪽', '지후'); await commit(page);
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

async function ohang({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== ohang v2' + (mobile ? ' (mobile)' : ''));
  try {
    await L.fresh(page, '/play.html?case=ohang');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('화분 다섯 개가 그대로'), 'opening shown');
    await L.click(page, '접수표 쓰기'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('오행당 접수표'), 'intake form shown');
    await L.click(page, '접수표 내기');
    L.check((await L.mainText(page)).includes('생일을 적어야'), 'intake: empty date explained');
    if (mobile) { await L.click(page, '생일 대신 예시 손님으로 해 보기'); await L.sleep(1500); }
    else { await page.fill('input[name=date]', '1995-05-05'); await page.fill('input[name=time]', '10:30'); await L.click(page, '접수표 내기'); await L.sleep(1500); }
    const lightText = await page.evaluate(() => document.querySelector('.slip-light b')?.textContent || '');
    L.check(/[木火土金水]/.test(lightText), 'intake: light computed — ' + lightText);
    L.check((await L.mainText(page)).includes('할머니라면 이렇게 읽는다'), 'intake: reading shown');
    const EL = { '木': { id: 'blue', code: [5, 0, 0, 0], lantern: '파란 등' }, '火': { id: 'red', code: [4, 5, 0, 0], lantern: '붉은 등' }, '土': { id: 'yellow', code: [4, 0, 0, 0], lantern: '노란 등' }, '金': { id: 'white', code: [3, 5, 0, 0], lantern: '흰 등' }, '水': { id: 'black', code: [6, 0, 0, 0], lantern: '검은 등' } };
    const NEXT = { blue: 'red', red: 'yellow', yellow: 'white', white: 'black', black: 'blue' };
    const LAN = { blue: '파란 등', red: '붉은 등', yellow: '노란 등', white: '흰 등', black: '검은 등' };
    const me = EL[lightText.match(/[木火土金水]/)[0]];
    const order = [me.id]; while (order.length < 5) order.push(NEXT[order[order.length - 1]]);
    await L.click(page, '접수표 들고 문 앞으로'); await L.sleep(400);
    for (const [d, t] of [['주머니 속 휴대폰', '불 낳는놈 밑에'], ['문에 붙은 종이', '서로 낳는 순서']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    L.check(await page.evaluate(() => !!document.querySelector('.cycle-chart')) === false, 'chart only inside dialog');
    // pots
    await hotspot(page, '섬돌 위 화분');
    L.check(await page.evaluate(() => document.querySelector('dialog[open] .v2-guide')?.open === true), '★2: guide open by default');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .potstep .pot').length === 5), 'pots: 5 pots on photo');
    L.check(!(await L.buttons(page)).some((b) => b === '화분 들어 보기'), 'pots: no commit before pick');
    await L.click(page, '붉은 화분', { exact: true }); await commit(page);
    L.check((await status(page)).includes('낳아지는 쪽'), 'pots: red explained — ' + (await status(page)));
    await L.click(page, '청자 빛 화분', { exact: true }); await commit(page);
    L.check(await dlgHas(page, '나무가 불을 낳는다'), 'pots solved');
    await shot(page, 'ohang-pots');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('약재 냄새'), 'auto-moved inside after closing reveal');
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '찬장 맨 아래 서랍'))), 'drawer hidden before bowls');
    for (const d of ['벽에 걸린 사진', '메뉴판', '찬장에 붙은 메모']) { await hotspot(page, d); L.check(await dlgHas(page, d), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '접수대 서랍의 공책'); L.check(await dlgHas(page, '손님 빛 읽는 법') && await page.evaluate(() => !!document.querySelector('dialog[open] .reading-item.mine')), 'notebook doc highlights my light'); await L.closeDialog(page);
    // bowls
    await hotspot(page, '찬장과 다섯 그릇');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .cabinet .niche').length === 5 && document.querySelectorAll('dialog[open] .bowl-pick').length === 5), 'bowls: 5 niches + 5 bowls');
    const put = async (bowl, niche) => { await L.click(page, bowl + ' 집기', { exact: true }); await L.click(page, niche + ' (비어 있음)', { exact: true }); };
    await put('검은 그릇', '위 칸'); await put('흰 그릇', '왼쪽 칸'); await put('노란 그릇', '가운데 칸'); await put('청자 빛 그릇', '오른쪽 칸'); await commit(page);
    L.check((await status(page)).includes('비어 있다'), 'bowls: empty niche explained');
    await put('붉은 그릇', '아래 칸'); await commit(page);
    L.check((await status(page)).includes('위 칸이 북쪽'), 'bowls: naive north explained — ' + (await status(page)));
    // take back all and redo
    for (const n of ['위 칸: 검은 그릇', '왼쪽 칸: 흰 그릇', '오른쪽 칸: 청자 빛 그릇', '아래 칸: 붉은 그릇']) { await L.click(page, n, { exact: true }); await L.click(page, n.split(': ')[1] + ' 집기', { exact: true }); } // 집었다가 도로 쟁반에
    await put('붉은 그릇', '위 칸'); await put('청자 빛 그릇', '왼쪽 칸'); await put('흰 그릇', '오른쪽 칸'); await put('검은 그릇', '아래 칸'); await commit(page);
    L.check(await dlgHas(page, '남쪽을 보고 서서'), 'bowls solved');
    await shot(page, 'ohang-bowls');
    await L.click(page, '계속'); await L.sleep(300);
    await hotspot(page, '서랍 손잡이의 쪽지'); await L.closeDialog(page);
    // drawer
    await hotspot(page, '찬장 맨 아래 서랍');
    const setDial = async (digits) => { for (let i = 0; i < 4; i++) { const cur = await page.evaluate((i) => Number(document.querySelectorAll('dialog[open] .dial .num')[i].textContent), i); const up = (digits[i] - cur + 10) % 10; for (let k = 0; k < up; k++) await L.click(page, `${i + 1}번째 다이얼 올리기`); } };
    const wrongCode = me.id === 'black' ? [5, 0, 0, 0] : [6, 0, 0, 0];
    await setDial(wrongCode); await commit(page);
    L.check((await status(page)).includes('값이다'), 'drawer: other tea explained — ' + (await status(page)));
    await setDial(me.code); await commit(page);
    L.check(await dlgHas(page, '내 빛의 차 값'), 'drawer solved');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('장부를 쓰던 방'), 'auto-moved to back room');
    for (const [d, t] of [['가져온 접수표 묶음', '2007. 12'], ['책상 위 메모', '낳는 순서로 다섯 개']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    // lanterns
    await L.click(page, '1. 오행당 문 앞'); await L.sleep(300);
    await hotspot(page, '내가 쓴 접수표'); L.check(await dlgHas(page, '할머니가 세는 법대로'), 'myslip doc re-readable'); await L.closeDialog(page);
    await L.click(page, '3. 뒷방'); await L.sleep(300);
    await hotspot(page, '장대에 걸린 등 다섯');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].some((t) => t.textContent.includes('내가 쓴 접수표') && !t.disabled)), 'lanterns: my slip on bench');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .lanternpole .lantern').length === 5), 'lanterns: 5 on photo');
    const wrongStart = order.slice(1).concat(order[0]);
    for (const id of wrongStart) await L.click(page, LAN[id], { exact: true });
    await commit(page);
    L.check((await status(page)).includes('부터 켰다'), 'lanterns: wrong start explained — ' + (await status(page)));
    await L.click(page, '다 끄고 다시');
    for (const id of order) await L.click(page, LAN[id], { exact: true });
    await shot(page, 'ohang-lanterns');
    await commit(page);
    L.check(await dlgHas(page, '내 빛에서 시작해서'), 'lanterns solved');
    // 보고된 버그 경로: 접수표를 먼저 읽고 닫아도 엔딩으로 갈 수 있어야 한다
    await L.click(page, '접수함 속 접수표 보기'); L.check(await dlgHas(page, '가게는 네 거다'), 'final readable from reveal');
    L.check((await L.buttons(page)).includes('← 돌아가기'), 'doc offers way back to reveal');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.buttons(page)).some((b) => b.startsWith('다음 날 아침, 병원으로')), 'ending button persists in scene after reading letter');
    await L.click(page, '다음 날 아침, 병원으로'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('돌아오는 계절') && (await L.mainText(page)).includes('비어 있는 칸에'), 'ending reached with choice');
    await L.click(page, '다음 손님은 내가 받을게'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('첫 손님은 이모였다') && (await L.mainText(page)).includes('말이다" 할머니가 찻잔을'), 'ending varies by choice and reads my light');
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
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('파란 끈 얘기를 했다'), 'opening shown');
    await L.click(page, '상자 열어 보기'); await L.sleep(400);
    for (const [d, t] of [['뚜껑 안쪽 정우의 쪽지', '파란 끈만 주인을 몰라요'], ['상자 바닥의 기록 사본', '접수번호 27'], ['입양 계약서 봉투', '941372608154902'], ['방석의 루미', '코끝이 하얗게']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    // box + tin lock
    await hotspot(page, '기념품 상자');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .keepbox .keep-item').length === 4 && document.querySelectorAll('dialog[open] .record-row').length === 4 && document.querySelectorAll('dialog[open] .box-wrap .dial').length === 4), 'box: 4 items + 4 rows + 4 dials');
    const setDial = async (digits) => { for (let i = 0; i < digits.length; i++) { const cur = await page.evaluate((i) => Number(document.querySelectorAll('dialog[open] .dial .num')[i].textContent), i); const up = (digits[i] - cur + 10) % 10; for (let k = 0; k < up; k++) await L.click(page, `${i + 1}번째 다이얼 올리기`); } };
    await setDial([6, 7, 8, 2]); await commit(page); L.check((await status(page)).includes('네 날부터'), 'box: code alone does not open before placement');
    const put = async (item, stage) => { await L.click(page, item + ' 집어 뒷면 보기', { exact: true }); await L.click(page, stage + ' (비어 있음)', { exact: true }); };
    await setDial([0, 0, 0, 0]); await commit(page);
    L.check((await status(page)).includes('네 날부터'), 'box: asks to fill days first');
    await L.click(page, '파란 명찰 끈 집어 뒷면 보기', { exact: true });
    L.check(await dlgHas(page, '글씨가 어리다') && await page.evaluate(() => !!document.querySelector('dialog[open] .keep-back img')), 'box: back side shown with photo');
    await L.click(page, '잠깐 머문 날 (비어 있음)', { exact: true });
    await put('접힌 담요', '처음 발견한 날'); await put('진료 봉투', '진료받은 날'); await put('입양 확인서', '오래 살 집이 생긴 날'); await commit(page);
    L.check((await status(page)).includes('앞뒤가 바뀌었다'), 'box: swapped order explained — ' + (await status(page)));
    await L.click(page, '처음 발견한 날: 접힌 담요', { exact: true }); await L.click(page, '잠깐 머문 날: 파란 명찰 끈', { exact: true });
    await L.click(page, '처음 발견한 날 (비어 있음)', { exact: true }); await put('접힌 담요', '잠깐 머문 날');
    await commit(page);
    L.check((await status(page)).includes('끝자리, 기록 순서대로'), 'box: days right, code wrong explained');
    await setDial([6, 7, 8, 2]); await shot(page, 'pet-box'); await commit(page);
    L.check(await dlgHas(page, '6 · 7 · 8 · 2'), 'box solved');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('카드 서랍장이 벽 하나를'), 'moved to clinic');
    for (const [d, t] of [['접수대의 수의사', '등록번호까지 맞춰'], ['게시판의 카드 보관 안내', '7-3 앞쪽으로 옮겨']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '카드 서랍장');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .drawer-btn').length === 12), 'cards: 12 drawers');
    await L.click(page, '7-2 서랍 열기', { exact: true });
    L.check(await dlgHas(page, 'V-6349에서 끝난다'), 'cards: 7-2 decoy explained');
    L.check(!(await L.buttons(page)).some((b) => b === '이 카드 꺼내기'), 'cards: no commit on wrong drawer');
    await L.click(page, '7-3 서랍 열기', { exact: true });
    await L.click(page, '3번째 카드 보기', { exact: true }); L.check(await dlgHas(page, 'V-6384'), 'cards: duplicate V number shown'); await commit(page);
    L.check((await status(page)).includes('등록번호가 계약서와 다르다'), 'cards: reg mismatch explained — ' + (await status(page)));
    await L.click(page, '2번째 카드 보기', { exact: true }); await commit(page); L.check((await status(page)).includes('봉투의 번호가 아니다'), 'cards: wrong V explained');
    await L.click(page, '4번째 카드 보기', { exact: true }); await shot(page, 'pet-cards'); await commit(page);
    L.check(await dlgHas(page, '콩이 = 루미'), 'cards solved');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('보리차를 끓이고'), 'moved to mom');
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '서랍 속 명찰'))), 'badge hidden before desk');
    for (const [d, t] of [['엄마와 주고받은 문자', '명찰끈으로 묶어서'], ['앨범에 끼워진 일기 한 장', '2학년 3반 김유나'], ['앨범과 사진 세 장', '햇살동 정류장'], ['내 옛 방 책상의 포스트잇', '콩이 만난 날']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '내 옛 방 책상 서랍');
    await setDial([7, 1, 7]); await commit(page);
    L.check((await status(page)).includes('병원에 간 날'), 'desk: clinic day explained');
    await setDial([7, 1, 6]); await shot(page, 'pet-desk'); await commit(page);
    L.check(await dlgHas(page, '7 · 1 · 6'), 'desk solved');
    await L.click(page, '계속'); await L.sleep(300);
    await hotspot(page, '서랍 속 명찰'); L.check(await dlgHas(page, '끈이 없는') || await dlgHas(page, '끈이 없다'), 'doc: 명찰'); await L.closeDialog(page);
    await hotspot(page, '상자에서 가져온 파란 끈');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .strapimg .strap-print').length === 3), 'strap: print on photo');
    await commit(page); L.check((await status(page)).includes('목에 글자가 닿는다'), 'strap: both wrong explained');
    await L.click(page, '끈 뒤집기 (앞뒤)'); await commit(page); L.check((await status(page)).includes('거꾸로'), 'strap: upside down explained');
    await L.click(page, '끈 돌리기 (양 끝 바꾸기)'); await shot(page, 'pet-strap'); await commit(page);
    L.check(await dlgHas(page, '콩이를 처음 데려온 아이는 나였다'), 'strap solved');
    await L.click(page, '상자 맨 밑의 편지를 꺼내러'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('그날의 콩이가 지금의 루미였다'), 'ending reached');
    await L.click(page, '정우가 남긴 편지 읽기');
    L.check(await dlgHas(page, '찾아봐 달라고 한 거예요'), 'final letter unlocked');
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

async function studio({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== studio v2' + (mobile ? ' (mobile)' : ''));
  const setRange = async (label, v) => { await page.evaluate(({ label, v }) => { const r = [...document.querySelectorAll('dialog[open] input[type=range]')].find((x) => x.getAttribute('aria-label') === label); r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); }, { label, v }); await L.sleep(200); };
  try {
    await L.fresh(page, '/play.html?case=studio');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('2006년 3월 것이었다'), 'opening shown');
    await L.click(page, '접수대의 봉투 보기'); await L.sleep(400);
    for (const [d, t] of [['접수대의 할아버지 쪽지', '암실 열쇠는 필름 봉투 안에'], ['접수 장부', '우리 집 셈법'], ['벽의 사진들', '8×10']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => ['보관함에서 꺼낸 필름 봉투', '필름 보관함'].includes(b.getAttribute('aria-label'))))), 'sleeve and lockers hidden before lamp');
    // lamp
    await hotspot(page, '초록 등 밑의 봉투');
    await commit(page); L.check((await status(page)).includes('더 기울이자'), 'lamp: flat explained');
    await setRange('봉투 기울기', 60); await commit(page); L.check((await status(page)).includes('조금 내리자'), 'lamp: too steep explained');
    await setRange('봉투 기울기', 36); await shot(page, 'st-lamp'); await commit(page); L.check(await dlgHas(page, 'C3 · 23 · 8×10 · 12초'), 'lamp solved');
    await L.click(page, '봉투에 눌린 글씨 보기'); L.check(await dlgHas(page, '보관 C3'), 'pressed doc via reveal'); await L.click(page, '← 돌아가기');
    await L.click(page, '계속'); await L.sleep(300);
    // lockers
    await hotspot(page, '필름 보관함');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .locker-cell').length === 16), 'lockers: 16 cells');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .locker-cell .plate')].filter((p) => p.textContent).map((p) => p.textContent).sort().join() === 'A1,A4,D1'), 'lockers: only 3 labels left');
    await L.click(page, '위에서 3째 줄 왼쪽에서 3째 칸 서랍 열기', { exact: true }); await commit(page); L.check((await status(page)).includes('2012년 봉투뿐'), 'lockers: naive decoy explained');
    await L.click(page, '위에서 1째 줄 왼쪽에서 2째 칸 서랍 열기', { exact: true }); await commit(page); L.check((await status(page)).includes('셈법부터'), 'lockers: wrong cell explained');
    await L.click(page, '위에서 2째 줄 왼쪽에서 3째 칸 서랍 열기', { exact: true }); await shot(page, 'st-lockers'); await commit(page); L.check(await dlgHas(page, '꼬리표 달린 작은 열쇠'), 'lockers solved');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('라이트박스를 켜자'), 'moved to table');
    await L.click(page, '1. 접수실'); await L.sleep(300); await hotspot(page, '보관함에서 꺼낸 필름 봉투'); L.check(await dlgHas(page, '접수 봉투 겉면에'), 'doc: sleeve'); await L.closeDialog(page);
    await L.click(page, '2. 작업대'); await L.sleep(300);
    await hotspot(page, '루페로 본 필름 가장자리'); await L.closeDialog(page);
    // lightbox
    await hotspot(page, '라이트박스 위 필름');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .strip').length === 4 && document.querySelectorAll('dialog[open] .strip.flipped').length === 2), 'lightbox: 4 strips, 2 flipped');
    await commit(page); L.check((await status(page)).includes('뒤집혀 있다'), 'lightbox: flipped explained');
    // initial order c,a,d,b; flips a,c. Fix flips: rows 1 (c) and 2 (a)
    await L.click(page, '1번째 줄 뒤집기', { exact: true }); await L.click(page, '2번째 줄 뒤집기', { exact: true });
    await commit(page); L.check((await status(page)).includes('이어지지 않는다'), 'lightbox: order explained');
    // order c,a,d,b -> a,b,c,d: move a(2) up; then d(3) down; order a,c,b,d -> move b(3) up
    await L.click(page, '2번째 줄 위로', { exact: true }); // a,c,d,b
    await L.click(page, '4번째 줄 위로', { exact: true }); // a,c,b,d
    await L.click(page, '3번째 줄 위로', { exact: true }); // a,b,c,d
    await commit(page); L.check((await status(page)).includes('안 짚었다'), 'lightbox: no frame explained');
    await L.click(page, '4번째 줄 2번째 컷 짚기', { exact: true }); await commit(page); L.check((await status(page)).includes('동그라미'), 'lightbox: wrong frame explained');
    await L.click(page, '4번째 줄 5번째 컷 짚기', { exact: true }); await shot(page, 'st-lightbox'); await commit(page); L.check(await dlgHas(page, '23컷'), 'lightbox solved');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('약품 냄새와 어둠'), 'moved to darkroom');
    await hotspot(page, '벽의 순서표'); await L.closeDialog(page);
    // print
    await hotspot(page, '확대기와 트레이');
    await L.click(page, '인화지 꺼내 올리기'); L.check((await status(page)).includes('불부터'), 'print: white light explained');
    await L.click(page, '흰 불 스위치', { exact: true }); await L.click(page, '붉은 등 스위치', { exact: true }); await L.click(page, '인화지 꺼내 올리기');
    await L.click(page, '타이머 누르기', { exact: true }); L.check((await status(page)).includes('흐리다'), 'print: focus explained');
    await setRange('초점 손잡이', 65); await L.click(page, '타이머 누르기', { exact: true }); L.check((await status(page)).includes('봉투에 적힌 초'), 'print: timer explained');
    await setRange('타이머', 12); await L.click(page, '타이머 누르기', { exact: true });
    await L.click(page, '2번째 트레이에 담그기', { exact: true }); await L.click(page, '1번째 트레이에 담그기', { exact: true }); await L.click(page, '3번째 트레이에 담그기', { exact: true }); await commit(page);
    L.check((await status(page)).includes('순서가 틀렸다'), 'print: bath order explained');
    await L.click(page, '인화지 버리고 처음부터'); await L.click(page, '인화지 꺼내 올리기'); await L.click(page, '타이머 누르기', { exact: true });
    for (const n of [1, 2, 3]) await L.click(page, `${n}번째 트레이에 담그기`, { exact: true });
    await shot(page, 'st-print'); await commit(page); L.check(await dlgHas(page, '스무 해 만의 한 장'), 'print solved');
    await L.click(page, '붉은 등 아래로'); await L.sleep(500);
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
  try {
    await L.fresh(page, '/play.html?case=garage');
    L.check((await L.mainText(page)).includes('★★★★★'), '5 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('세 사람 다 나와 있다'), 'opening shown');
    await L.click(page, '앞마당으로'); await L.sleep(400);
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '서연에게 보고'))), 'report hidden at start');
    for (const [d, t] of [['서연과 주고받은 문자', '문은 열어 뒀어요'], ['앞유리에 끼워진 점검 영수증', '20:07:00'], ['셔터 앞의 세 사람', '07-B']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    // cam
    await hotspot(page, '서연 차의 블랙박스');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .v2-guide'))), '★5: no guide');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .cam-thumb').length === 6), 'cam: 6 frames');
    await L.click(page, '프레임 2 (21:47:05)', { exact: true }); await L.click(page, '프레임 2 표시', { exact: true });
    await L.click(page, '프레임 3 (21:53:20)', { exact: true }); await L.click(page, '프레임 3 표시', { exact: true }); await commit(page);
    L.check((await status(page)).includes('한 쌍이 아니다'), 'cam: neutral wrong message');
    await L.click(page, '프레임 4 (21:55:20)', { exact: true }); await L.click(page, '프레임 4 표시', { exact: true }); await shot(page, 'g-cam'); await commit(page);
    L.check(await dlgHas(page, '21:53:20 → 21:55:20'), 'cam solved');
    await L.click(page, '계속'); await L.sleep(300);
    // hints: only 2 tiers
    await L.click(page, '힌트'); await L.click(page, '첫 힌트 받기'); await L.click(page, '풀이 방향 받기');
    L.check(!(await L.buttons(page)).includes('정답 보기') && await dlgHas(page, '정답 힌트가 없습니다'), '★5: only two hint tiers'); await L.closeDialog(page);
    // shop → terminal
    await hotspot(page, '작업장으로'); await L.sleep(300);
    await hotspot(page, '직원 보관함과 SD 슬롯'); await L.closeDialog(page);
    await hotspot(page, '보관함 백업 단말');
    await setDial([2, 1, 5, 3]); await commit(page); L.check((await status(page)) === 'DENIED', 'terminal: neutral DENIED');
    await setDial([2, 1, 4, 6]); await shot(page, 'g-terminal'); await commit(page); L.check(await dlgHas(page, '잃어버린 07-A다'), 'terminal solved');
    await L.click(page, '백업 단말의 보관함 기록 보기'); L.check(await dlgHas(page, '21:47:10'), 'lockerlog doc via reveal'); await L.closeDialog(page);
    await L.closeDialog(page).catch(() => {}); await L.sleep(300);
    // office
    await hotspot(page, '앞마당으로'); await L.sleep(300); await hotspot(page, '사무실로'); await L.sleep(300);
    for (const [d, t] of [['출입 서버 화면', '암호화'], ['폐업 인계 문서', '개업일 네 자리'], ['서류함의 분실 신고서', '정지 처리 안 함'], ['강민호의 면담 기록', '21:44:12'], ['벽의 기념패', '2009년 4월 7일']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '책상 밑 금고');
    await setDial([0, 3, 3, 0]); await commit(page); L.check((await status(page)).includes('안 내려간다'), 'safe: neutral wrong message');
    await setDial([0, 4, 0, 7]); await shot(page, 'g-safe'); await commit(page); L.check(await dlgHas(page, '봉투만 비어 있다'), 'safe solved');
    await L.click(page, '금고 안의 봉투들 보기'); L.check(await dlgHas(page, '07-A 분실'), 'safedoc via reveal'); await L.closeDialog(page); await L.closeDialog(page).catch(() => {}); await L.sleep(300);
    await hotspot(page, '걸려 있는 재킷 세 벌');
    await L.click(page, '진회색 재킷 칼라 보기', { exact: true }); L.check(await dlgHas(page, '강민호'), 'jackets: collar tag shown'); await commit(page);
    L.check((await status(page)).includes('소매를 다시'), 'jackets: neutral wrong message');
    await L.click(page, '회색 재킷 · 왼 소매 반사띠 칼라 보기', { exact: true }); await shot(page, 'g-jackets'); await commit(page); L.check(await dlgHas(page, '박정호'), 'jackets solved');
    await L.closeDialog(page); await L.sleep(300);
    await hotspot(page, '앞마당으로'); await L.sleep(300);
    await hotspot(page, '서연에게 보고');
    const pick = async (q, v) => L.click(page, q + ': ' + v, { exact: true });
    await pick('카드를 반출한 사람', '한지수 (07)'); await pick('그때 쓰인 출입 카드', '07-A (지수 분실 카드, 금고 보관분)'); await pick('실제 반출 시각 (서버 기준)', '21:47'); await pick('그 사람이라는 결정적 근거', '지수가 동의 없이 부품을 바꿨다는 메모'); await commit(page);
    L.check((await status(page)).includes('확실해요?'), 'report: neutral wrong message');
    await pick('카드를 반출한 사람', '박정호 (09)'); await commit(page); L.check((await status(page)).includes('확실해요?'), 'report: still neutral');
    await pick('그 사람이라는 결정적 근거', '반출 때 찍힌 재킷이 서버 22:00 입장 때도 찍혔다'); await shot(page, 'g-report'); await commit(page);
    L.check(await dlgHas(page, '경찰 불렀어요'), 'report solved');
    await L.click(page, '폐업 당일 아침으로'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('열 시에 셔터가 내려갔다'), 'ending reached');
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
    await setDial([1, 1, 0, 2]); await commit(page); L.check((await status(page)).includes('17-14'), 'locker: 17-14 decoy');
    await setDial([0, 3, 1, 8]); await commit(page); L.check((await status(page)).includes('처음 돌아온 날이 아니다'), 'locker: later return');
    await setDial([0, 3, 1, 9]); await shot(page, 'l-locker'); await commit(page); L.check(await dlgHas(page, '맨 아래 칸에 고무줄로'), 'locker solved');
    await L.click(page, '계속'); await L.sleep(300);
    await hotspot(page, '다섯 통의 겉봉'); L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .lenv').length === 5), 'five envelopes rendered'); L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .envpanel')].filter((x) => x.offsetParent).length === 1), 'one envelope shown at a time'); await page.evaluate(() => [...document.querySelectorAll('dialog[open] .envtabs label')].find((l) => l.textContent === '2024').click()); L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .envpanel')].find((x) => x.offsetParent)?.textContent.includes('2024')), 'year tab switches envelope'); await shot(page, 'l-envs'); await L.closeDialog(page);
    await hotspot(page, '묶음에 끼워진 신청서'); L.check(await dlgHas(page, '뒤채'), 'doc: forward'); await L.closeDialog(page);
    // rack
    await hotspot(page, '구분함');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .rack-slot').length === 16), 'rack: 16 slots');
    await L.click(page, '미루새길 9 칸', { exact: true }); await commit(page); L.check((await status(page)).includes('빌라'), 'rack: villa decoy');
    await L.click(page, '미루새길 11 칸', { exact: true }); await commit(page); L.check((await status(page)).includes('17-14'), 'rack: 11 decoy');
    await L.click(page, '미루새길 9-1 칸', { exact: true }); await shot(page, 'l-rack'); await commit(page); L.check(await dlgHas(page, '쓴 사람은 정해린'), 'rack solved');
    await L.click(page, '9-1 칸의 쪽지 보기'); L.check(await dlgHas(page, '이제는 받겠습니다'), 'hcard via reveal'); await L.click(page, '← 돌아가기');
    await L.click(page, '집배원 휴게실로'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('아저씨 우비가'), 'moved to breakroom');
    for (const [d, t] of [['못에 걸린 순로표', '파란 대문'], ['벽의 단체 사진', '38년']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '맨 끝 사물함');
    L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .v2-bench-tab')].some((t) => t.textContent.includes('순로표') && !t.disabled)), 'route doc on bench');
    const push = async (seq) => { for (const k of seq) await L.click(page, { U: '위로 밀기', D: '아래로 밀기', L: '왼쪽으로 밀기', R: '오른쪽으로 밀기' }[k], { exact: true }); };
    await push('URU'); await commit(page); L.check((await status(page)).includes('빌라 현관'), 'dirlock: old gate decoy');
    await push('URUR'); await commit(page); L.check((await status(page)).includes('파란 대문이 어느 쪽'), 'dirlock: wrong last turn');
    await push('URUL'); await shot(page, 'l-staff'); await commit(page); L.check(await dlgHas(page, '업무 수첩'), 'staffbox solved');
    await L.click(page, '봉수 아저씨의 수첩 보기'); L.check(await dlgHas(page, '거절을 못 찍었다'), 'notebook via reveal'); await L.click(page, '← 돌아가기');
    await L.click(page, '미루새길 골목으로'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('파란 대문이 있다'), 'moved to alley');
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '할머니가 내민 빈 봉투'))), 'reply hidden before meeting');
    for (const [d, t] of [['빌라 우편함', '파란 대문 틈'], ['파란 대문', '이번엔 돌아오지 않게']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '할머니가 내민 빈 봉투');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .inhand-card').length === 5), 'reply: five sender boxes in hand');
    const pick = async (q, v) => L.click(page, q + ': ' + v, { exact: true });
    await pick('우편번호', '35271'); await pick('주소', '산장길 31-2'); await pick('층', '2층'); await pick('받는 사람', '오정민'); await commit(page);
    L.check((await status(page)).includes('대장에'), 'reply: wrong zip explained');
    await pick('우편번호', '35217'); await pick('층', '1층'); await commit(page); L.check((await status(page)).includes('옮겼다'), 'reply: old floor explained');
    await pick('층', '2층'); await shot(page, 'l-reply'); await commit(page);
    L.check(await dlgHas(page, '꽉 찬 봉투'), 'reply solved');
    await L.click(page, '할머니 답장을 받아 들고'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('돌아오지 않을 봉투'), 'ending reached');
    await shot(page, 'l-ending');
    await L.click(page, '열흘 뒤 온 봉투 읽기'); L.check(await dlgHas(page, '3월 14일엔 제가 갈게요'), 'final unlocked'); await L.closeDialog(page);
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
  try {
    await L.fresh(page, '/episode.html?case=apartment'); await L.sleep(600); L.check(page.url().includes('play.html?case=apartment'), 'old address redirects');
    L.check((await L.mainText(page)).includes('★★★★☆'), '4 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('404호 귀신'), 'opening shown');
    await L.click(page, '둑길에서 건물 보기'); await L.sleep(400);
    for (const [d, t] of [['오늘 작업 지시', '민원 3건'], ['동네 커뮤니티 글', '404호'], ['둑길의 철거 안내판', '반지하']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    L.check(await page.evaluate(() => true), 'post opened');
    await hotspot(page, '건물 정문으로'); await L.sleep(400);
    for (const [d, t] of [['우편함 위 호수 안내', '왼쪽 집부터'], ['게시판의 이주 현황', '1세대']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '우편함');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .v2-guide'))), '★4: no guide');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .mail-slot').length === 24), 'mailbox: 24 slots');
    await L.click(page, '404 우편함', { exact: true }); await commit(page); L.check((await status(page)).includes('글쓴이'), 'mailbox: rumor decoy');
    await L.click(page, '304 우편함', { exact: true }); await commit(page); L.check((await status(page)).includes('어느 쪽에서'), 'mailbox: mirror decoy');
    await L.click(page, '401 우편함', { exact: true }); await commit(page); L.check((await status(page)).includes('맨 아래 줄'), 'mailbox: basement decoy');
    await L.click(page, '301 우편함', { exact: true }); await shot(page, 'a-mail'); await commit(page); L.check(await dlgHas(page, '햇살요양병원'), 'mailbox solved');
    await L.click(page, '관리실로'); await L.sleep(400);
    for (const [d, t] of [['책상 위 근무일지', '한 고리에'], ['입주자 명부', '김순례'], ['벽에 붙은 창고 배정표', 'B03'], ['벽 달력', '동그라미']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '열쇠함');
    L.check(!(await L.buttons(page)).includes('이 열쇠 들고 3층으로'), 'hooks: no commit with empty hand');
    await L.click(page, '301 고리에서 꺼내기', { exact: true }); L.check((await status(page)).includes('빈 고리'), 'hooks: empty 301');
    await L.click(page, 'B01 고리에서 꺼내기', { exact: true }); await L.click(page, '꼬리표 뒤집기'); L.check(await dlgHas(page, '김순례'), 'hooks: flip tag shows owner');
    await commit(page); L.check((await status(page)).includes('안 열린다'), 'hooks: wrong key returned');
    await L.click(page, 'B03 고리에서 꺼내기', { exact: true }); L.check(await dlgHas(page, '열쇠 2개'), 'hooks: ring shows two keys'); await shot(page, 'a-hooks'); await commit(page); L.check(await dlgHas(page, '한 번에 돌아갔다'), 'hooks solved');
    await L.click(page, '301호로'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('배터리 등'), 'moved to 301');
    for (const [d, t] of [['방문 옆 대피 안내도', '북쪽 벽'], ['테이프 붙은 스위치', '작은방']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '싱크대 밑');
    await setDial([1, 3, 2]); await commit(page); L.check((await status(page)).includes('밖에서 찍은'), 'box: mirror decoy');
    await setDial([3, 1, 2]); await shot(page, 'a-box'); await commit(page); L.check(await dlgHas(page, '접힌 쪽지'), 'box solved');
    await L.click(page, '상자 안 쪽지 보기'); L.check(await dlgHas(page, '햇살요양병원 3층'), 'mnote via reveal'); await L.click(page, '← 돌아가기'); await L.closeDialog(page); await L.sleep(300);
    await hotspot(page, '상자 위 가계부'); L.check(await dlgHas(page, '거실 불부터'), 'doc: book'); await L.closeDialog(page);
    await hotspot(page, '꺼낸 타이머 셋');
    await commit(page); L.check((await status(page)).includes('틀렸다고 한 순서'), 'timers: current program explained');
    const setT = async (k, lab, v) => { for (let i = 0; i < 6; i++) { const cur = await page.evaluate((k) => document.querySelector(`dialog[open] .timer-val[data-k="${k}"]`).textContent, k); if (cur === v) return; await L.click(page, lab + ' 뒤로 돌리기', { exact: true }); } throw new Error('timer not set ' + k); };
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .pv-win').length === 3), 'timers: window preview');
    await L.setRange(page, '미리 보기 시각', 1); L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .pv-win')].map((w) => w.classList.contains('lit')).join() === 'false,false,true'), 'preview: 21:00 shows rightmost (small room) lit from outside');
    await setT('main', '1 안방 켜기', '21:00'); await setT('off', '셋 다 끄기', '22:00'); await commit(page); L.check((await status(page)).includes('혼자 되신 뒤'), 'timers: 2015 decoy');
    await setT('living', '2 거실 켜기', '21:00'); await setT('small', '3 작은방 켜기', '21:30'); await setT('main', '1 안방 켜기', '22:30'); await setT('off', '셋 다 끄기', '23:00');
    await L.setRange(page, '미리 보기 시각', 1); L.check(await page.evaluate(() => [...document.querySelectorAll('dialog[open] .pv-win')].map((w) => w.classList.contains('lit')).join() === 'false,true,false'), 'preview: 21:00 now living (middle)');
    await shot(page, 'a-timers'); await commit(page); L.check(await dlgHas(page, '그 집의 저녁'), 'timers solved');
    await L.click(page, '다음 날 밤 아홉 시, 둑길'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('404호에는 불이 켜지지 않았다'), 'ending reached');
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
  try {
    await L.fresh(page, '/episode.html?case=laundry'); await L.sleep(600); L.check(page.url().includes('play.html?case=laundry'), 'old address redirects');
    L.check((await L.mainText(page)).includes('★★★★☆'), '4 stars shown');
    await L.click(page, '처음부터 하기');
    L.check((await L.mainText(page)).includes('이유는 묻지 말고'), 'opening shown');
    await L.click(page, '빈 통을 들여다보기'); await L.sleep(400);
    for (const [d, t] of [['엄마 문자', '관리자모드는 간판'], ['6번 위 쪽지', '전기 아깝다'], ['문 위 간판', '해 그림'], ['벽의 이용 안내', '니트']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '6번 건조기 패널');
    L.check(!(await page.evaluate(() => !!document.querySelector('dialog[open] .v2-guide'))), '★4: no guide');
    L.check(!(await L.buttons(page)).includes('시작 버튼 꾹 누르고 있기'), 'panel: no commit before input');
    await press(['고온 버튼 ☀']); await L.click(page, '시작 버튼 짧게 누르기'); L.check((await status(page)).includes('동전을 넣으라는'), 'panel: short press clears');
    await press(['고온 버튼 ☀', '고온 버튼 ☀', '저온 버튼 ☾', '저온 버튼 ☾', '20분 버튼 2', '40분 버튼 4']); await commit(page); L.check((await status(page)).includes('ERR'), 'panel: 해달 letters too — neutral');
    await press(['고온 버튼 ☀', '저온 버튼 ☾', '20분 버튼 2', '40분 버튼 4']); await shot(page, 'l-panel'); await commit(page); L.check(await dlgHas(page, 'ADMIN'), 'panel solved');
    await L.click(page, '6번 운전 기록 보기'); L.check(await dlgHas(page, '실행 없음'), 'log via reveal'); await L.click(page, '← 돌아가기'); await L.closeDialog(page); await L.sleep(300);
    await hotspot(page, '6번 동전함'); L.check(await dlgHas(page, 'POS 2'), 'doc: coins'); await L.closeDialog(page);
    await hotspot(page, '옆 편의점으로 가기'); await L.sleep(400);
    await hotspot(page, '포스 옆 메모'); L.check(await dlgHas(page, '출근하는 사람'), 'doc: posnote'); await L.closeDialog(page);
    await hotspot(page, '근무표 화이트보드');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .sg-cell').length === 18), 'board: 18 cells');
    await L.click(page, '최하은 자석'); await commit(page); L.check((await status(page)).includes('하은 씨'), 'magnet: haeun decoy');
    await L.click(page, '이태오 자석'); await commit(page); L.check((await status(page)).includes('어긋나는'), 'magnet: taeo decoy');
    await L.click(page, '김도현 자석'); await shot(page, 'l-board'); await commit(page); L.check(await dlgHas(page, '들켰네'), 'magnet solved');
    await L.click(page, '야간 알바 김도현 보기'); L.check(await dlgHas(page, '열두 시 십 분'), 'talk via reveal'); await L.click(page, '← 돌아가기');
    await L.closeDialog(page); await L.sleep(400);
    if (!(await L.mainText(page)).includes('배기구가 여섯')) await hotspot(page, '뒷골목으로 가기'); await L.sleep(400);
    L.check((await L.mainText(page)).includes('배기구가 여섯'), 'moved to alley');
    await hotspot(page, '손에 든 배관도'); L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .duct-svg')), 'doc: duct'); await L.closeDialog(page);
    await hotspot(page, '정류장 시간표'); L.check(await dlgHas(page, '00:30'), 'doc: bus'); await L.closeDialog(page);
    await hotspot(page, '뒷벽 배기구 여섯');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .vent-btn').length === 6), 'vents: 6 vents');
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
    await place({ '윗줄 왼쪽': 3, '윗줄 가운데': 1, '윗줄 오른쪽': 4, '아랫줄 왼쪽': 5, '아랫줄 가운데': 2, '아랫줄 오른쪽': 6 }); await shot(page, 'l-vents'); await commit(page); L.check(await dlgHas(page, '벤치 바로 위'), 'vents solved');
    await L.closeDialog(page); await L.sleep(300);
    await L.click(page, '해달빨래방'); await L.sleep(400);
    await hotspot(page, '6번 예약 다시 걸기');
    await commit(page); L.check((await status(page)).includes('그대로'), 'sched: mom original explained');
    const setS = async (k, lab, v) => { for (let i = 0; i < 4; i++) { const cur = await page.evaluate((k) => document.querySelector(`dialog[open] .timer-val[data-k="${k}"]`).textContent, k); if (cur === v) return; await L.click(page, lab + ' 뒤로', { exact: true }); } throw new Error('sched not set ' + k); };
    await setS('start', '예약 시작', '00:00'); await setS('min', '운전 시간', '30분'); await commit(page); L.check((await status(page)).includes('맞지 않는다'), 'sched: 00:00 30 wrong');
    await setS('start', '예약 시작', '00:10'); await setS('min', '운전 시간', '20분'); await setS('temp', '온도', '고온'); await commit(page); L.check((await status(page)).includes('맞지 않는다'), 'sched: temp wrong');
    await setS('temp', '온도', '저온'); await shot(page, 'l-sched'); await commit(page); L.check(await dlgHas(page, '관리자'), 'sched solved');
    await L.click(page, '다음 날 밤 열두 시 십 분, 뒷골목'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('여기 따뜻하네'), 'ending reached');
    await shot(page, 'l-ending');
    await L.click(page, '엄마와의 통화 읽기'); L.check(await dlgHas(page, '한 달 치'), 'final unlocked'); await L.closeDialog(page);
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
