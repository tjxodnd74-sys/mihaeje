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
    await page.fill('input[name=date]', mobile ? '1988-11-03' : '1995-05-05'); await page.fill('input[name=time]', '10:30');
    await L.click(page, '접수표 내기'); await L.sleep(1500);
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
    await hotspot(page, '장대에 걸린 등 다섯');
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
    await setDial([6, 7, 8, 2]); // 코드만 바로 넣어도 열려야 한다 (워크시트는 도우미)
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
    L.check((await status(page)).includes('번호는 끝자리다'), 'box: days right, code wrong explained');
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
    await L.click(page, '3번째 카드 보기', { exact: true }); L.check(await dlgHas(page, 'V-6383'), 'cards: card face shown'); await commit(page);
    L.check((await status(page)).includes('봉투의 번호가 아니다'), 'cards: wrong V explained');
    await L.click(page, '4번째 카드 보기', { exact: true }); await shot(page, 'pet-cards'); await commit(page);
    L.check(await dlgHas(page, '콩이 = 루미'), 'cards solved');
    await L.closeDialog(page); await L.sleep(400);
    L.check((await L.mainText(page)).includes('보리차를 끓이고'), 'moved to mom');
    L.check(!(await page.evaluate(() => [...document.querySelectorAll('.v2-hotspot')].some((b) => b.getAttribute('aria-label') === '서랍 속 명찰'))), 'badge hidden before desk');
    for (const [d, t] of [['엄마와 주고받은 문자', '명찰끈으로 묶어서'], ['앨범에 끼워진 일기 한 장', '2학년 3반 김유나'], ['앨범과 사진 세 장', '햇살동 정류장'], ['내 옛 방 책상의 포스트잇', '콩이 만난 날']]) { await hotspot(page, d); L.check(await dlgHas(page, t), 'doc: ' + d); await L.closeDialog(page); }
    await hotspot(page, '내 옛 방 책상 서랍');
    await setDial([7, 1, 7]); await commit(page);
    L.check((await status(page)).includes('하루 전'), 'desk: clinic day explained');
    await setDial([7, 1, 6]); await shot(page, 'pet-desk'); await commit(page);
    L.check(await dlgHas(page, '7 · 1 · 6'), 'desk solved');
    await L.click(page, '계속'); await L.sleep(300);
    await hotspot(page, '서랍 속 명찰'); L.check(await dlgHas(page, '끈이 없는') || await dlgHas(page, '끈이 없다'), 'doc: 명찰'); await L.closeDialog(page);
    await hotspot(page, '상자에서 가져온 파란 끈');
    L.check(await page.evaluate(() => document.querySelectorAll('dialog[open] .strapimg .strap-slot').length === 3), 'strap: 3 blanks on photo');
    const fill = async (lab, v) => { await L.click(page, lab + ' 칸'); await L.click(page, lab + '은 ' + v, { exact: true }); };
    await fill('학교', '햇살중'); await fill('학년 반', '2-3'); await fill('이름', '김유진'); await commit(page);
    L.check((await status(page)).includes('명찰의 이름'), 'strap: wrong name explained');
    await fill('이름', '김유나'); await shot(page, 'pet-strap'); await commit(page);
    L.check(await dlgHas(page, '콩이를 처음 데려온 아이는 나였다'), 'strap solved');
    await L.click(page, '상자 맨 밑의 편지를 꺼내러'); await L.sleep(500);
    L.check((await L.mainText(page)).includes('그날의 콩이가 지금의 루미였다'), 'ending reached');
    await L.click(page, '정우가 남긴 편지 읽기');
    L.check(await dlgHas(page, '유나 씨가 찾아야 유나 씨 거니까요'), 'final letter unlocked');
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
if (!which.length || which.includes('ohang')) await ohang({ mobile });
if (!which.length || which.includes('pet-home')) await petHome({ mobile });
