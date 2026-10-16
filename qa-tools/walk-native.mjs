// Headless playthroughs of the two native-engine stories: studio (/studio) and ohang (/ohang).
import * as L from './playlib.mjs';

async function studio({ mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  console.log('=== studio' + (mobile ? ' (mobile)' : ''));
  try {
    await L.fresh(page, '/studio');
    await L.click(page, '처음부터 하기');
    await L.click(page, '이야기 읽기');
    await L.click(page, '이야기를 읽고 탐색 시작');
    // 1. envelope: tilt — text must stay readable past 40°
    await L.click(page, '접수대의 오래된 봉투');
    await L.setRange(page, '종이 기울기', 36);
    await L.setRange(page, '종이 기울기', 60);
    const lit = await page.evaluate(() => document.querySelector('dialog[open] .pressed-note')?.classList.contains('visible'));
    L.check(lit, 'pressed note stays visible at 60°');
    await L.click(page, '접수실로 돌아가기');
    // 2. drawer
    await L.click(page, '접수실 · 필름 보관장', { within: 'main' });
    await L.click(page, '필름 보관장', { within: '#studioGame', exact: true });
    await L.click(page, 'B2');
    L.check((await L.dialogText(page)).includes('다른 손님의 보관함'), 'wrong drawer message');
    await L.click(page, 'C3');
    await L.click(page, '필름을 빛 위에 펼치기');
    // 3. film: frame pick before sorting must be refused
    await L.click(page, '필름 23번 컷');
    L.check((await L.dialogText(page)).includes('먼저 번호가'), 'frame pick gated until sorted');
    await L.click(page, '1–6 필름 위로');
    await L.click(page, '7–12 필름 위로');
    await L.click(page, '7–12 필름 위로');
    await L.click(page, '1–6 필름 뒤집기');
    await L.click(page, '13–18 필름 뒤집기');
    await L.click(page, '필름 23번 컷');
    await L.click(page, '이 필름으로 인화 준비');
    // 4. darkroom door + light
    await L.click(page, '암실 입구', { within: '#studioGame', exact: true });
    await L.click(page, '열쇠로 암실 문 열기');
    await L.click(page, '암실 조명 스위치', { within: '#studioGame', exact: true });
    await L.click(page, '흰 조명 · 켜짐');
    await L.click(page, '붉은 안전등 · 꺼짐');
    L.check((await L.dialogText(page)).includes('붉은 안전등만 켜져'), 'light panel reports usable state');
    await L.click(page, '암실로 돌아가기');
    // 5. enlarger
    await L.click(page, '확대기와 초점 손잡이', { within: '#studioGame', exact: true });
    await L.setSelect(page, '인화 크기', '8×10');
    await L.setRange(page, '초점 손잡이', 65);
    await L.typeInto(page, '노출 시간', '12');
    await L.click(page, '확대기 준비 마치기');
    await L.click(page, '함께 인화지 노출하기');
    // 6. trays
    await L.click(page, '세 개의 인화 트레이', { within: '#studioGame', exact: true });
    await L.click(page, '파란 집게');
    L.check((await L.dialogText(page)).includes('처리 순서가 맞지'), 'wrong bath order message');
    await L.click(page, '빨간 집게');
    await L.click(page, '노란 집게');
    await L.click(page, '파란 집게');
    await L.click(page, '사진을 꺼내 살펴보기');
    await L.click(page, '사진 뒷면 보기');
    await L.click(page, '사진관의 전시 액자에 걸기');
    // 7. portrait label: the correct answer must be accepted without flipping the photo first
    await L.click(page, '사진 속 인물 이름표 윤서');
    await L.click(page, '그날의 촬영자 이름표 윤서');
    await L.commit(page);
    const st1 = await L.statusText(page);
    L.check(st1.includes('사진 속 인물'), 'wrong label names the wrong slot: ' + st1);
    await L.click(page, '사진 속 인물 이름표 사진관 주인');
    await L.commit(page);
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .story-stage-reveal')), 'portrait label accepted without hidden gating');
    await L.reveal(page);
    // 8. caption
    await L.commit(page);
    const st2 = await L.statusText(page);
    L.check(st2.includes('액자에 걸지'), 'caption step explains missing mount: ' + st2);
    await L.click(page, '완성한 사진 집기');
    L.check((await L.dialogText(page)).includes('손에 들었습니다'), 'pick-up feedback shown');
    await L.click(page, '빈 액자에 걸기');
    await L.click(page, '함께 인화한 날');
    await L.commit(page);
    await L.reveal(page);
    await L.sleep(500);
    const t = (await L.dialogText(page)) + (await L.mainText(page));
    L.check(/이야기의 끝|첫 번째 이야기 완료/.test(t), 'studio ending reached');
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
  console.log('=== ohang' + (mobile ? ' (mobile)' : ''));
  try {
    await L.fresh(page, '/ohang');
    await L.click(page, '처음부터 하기');
    await L.click(page, '이야기 읽기');
    await L.click(page, '이야기를 읽고 탐색 시작');
    await L.click(page, '나의 다섯 빛 펼치기');
    L.check((await L.dialogText(page)).includes('생년월일을 먼저'), 'empty birthday is explained');
    await L.click(page, '예시 생일로 체험하기');
    await L.click(page, '나의 다섯 빛 펼치기');
    await L.sleep(800);
    await L.click(page, '접수표의 한 줄 고르기');
    await L.click(page, '마음에 걸린 걱정 내려놓기');
    await L.sleep(400);
    L.check((await page.evaluate(() => document.getElementById('ohMission').textContent)).includes('접수표에 적었습니다'), 'sentence choice confirmed');
    // stage 1: helping cycle from 화
    await L.click(page, '그릇을 놓는 자리', { exact: true });
    await L.click(page, '목 · 나무 그릇 잇기');
    await L.commit(page);
    L.check((await L.statusText(page)).includes('시작 빛이 아닙니다'), 'wrong start light explained');
    await L.click(page, '마지막 그릇 연결 풀기');
    for (const k of ['화 · 불', '토 · 흙', '금 · 쇠', '수 · 물', '목 · 나무']) await L.click(page, k + ' 그릇 잇기');
    await L.commit(page);
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .story-stage-reveal')), 'stage 1 solved');
    await L.reveal(page);
    // stage 2: cloth
    await L.click(page, '마루의 자리판', { exact: true });
    await L.click(page, '수 · 물 그릇 집기');
    await L.click(page, '천의 위에 그릇 놓기');
    await L.commit(page);
    L.check((await L.statusText(page)).includes('북 표시가 위를'), 'cloth rotation explained');
    for (let i = 0; i < 3; i++) await L.click(page, '방향 천 90도 돌리기');
    for (const [k, pos] of [['목 · 나무', '오른쪽'], ['화 · 불', '아래'], ['금 · 쇠', '왼쪽'], ['토 · 흙', '중앙']]) {
      await L.click(page, k + ' 그릇 집기');
      await L.click(page, '천의 ' + pos + '에 그릇 놓기');
    }
    await L.commit(page);
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .story-stage-reveal')), 'stage 2 solved');
    await L.reveal(page);
    // stage 3: lantern — 화 is watched by 수
    const spots = await page.evaluate(() => [...document.querySelectorAll('#ohObjects button,#ohObjectList button,.room-quick-links button')].map((b) => b.getAttribute('aria-label') || b.textContent.trim()));
    console.log('  stage3 spots', JSON.stringify(spots));
    await L.click(page, '등불과 접힌 봉투', { exact: true });
    await L.commit(page);
    L.check((await L.statusText(page)).includes('아직 놓지'), 'empty lantern explained');
    await L.click(page, '목 · 나무 표식 선택');
    await L.commit(page);
    L.check((await L.statusText(page)).includes('상극'), 'wrong lantern light explained');
    await L.click(page, '수 · 물 표식 선택');
    await L.commit(page);
    L.check(await page.evaluate(() => !!document.querySelector('dialog[open] .story-stage-reveal')), 'stage 3 solved');
    await L.reveal(page);
    await L.sleep(400);
    // letter + final object → ending
    let reached = false;
    for (let k = 0; k < 20 && !reached; k++) {
      const dlg = await L.dialogText(page), main = await L.mainText(page);
      if (/이야기의 끝|엔딩 장면/.test(dlg + main)) { reached = true; break; }
      const bs = await L.buttons(page);
      const go = bs.find((x) => !/^확대창 닫기|^돌아가기|^← |힌트|도움|테마 로비|본문으로|설정|켜기|플레이 메뉴|나의 다섯 빛|찾은 단서|현재 장치|^메모$|마루 · |배경음|베타|✓/.test(x));
      if (!go) break;
      if (process.env.WALK_DEBUG) console.log('  [final] click', go);
      await L.click(page, go);
      await L.sleep(400);
    }
    L.check(reached, 'ohang ending reached');
    if (!reached) { console.log('  stuck dialog:', (await L.dialogText(page)).replace(/\n+/g, ' | ').slice(0, 300)); console.log('  stuck buttons:', JSON.stringify(await L.buttons(page))); }
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
if (!which.length || which.includes('studio')) await studio({ mobile });
if (!which.length || which.includes('ohang')) await ohang({ mobile });
