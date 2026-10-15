// Full headless playthroughs of the 8 episode-engine stories (new save, start → ending).
// node qa-tools/walk-episodes.mjs [case ...]   (needs NODE_PATH pointing at a playwright install)
import * as L from './playlib.mjs';

const C = (l, o) => ['click', l, o];
const R = (l, v) => ['range', l, v];
const S = (l, v) => ['select', l, v];
const T = (l, v) => ['type', l, v];
const COMMIT = ['commit'];
const WRONG = (msgPart) => ['expectWrong', msgPart]; // commit now must fail with a message containing msgPart
const DOC = (l) => ['doc', l]; // open a record from the scene / tray, then close it

const walks = {
  station: {
    opening: ['주머니의 휴대폰 메시지', '메시지 열기'],
    stages: [
      { spot: '승강장 개편 안내판', steps: [C('표지 뒷면 살펴보기'), C('사진 속 옛 3번 표지의 방향 남쪽'), C('개편 전 2번 표지의 방향 북쪽'), WRONG('방향'), C('사진 속 옛 3번 표지의 방향 북쪽'), C('개편 전 2번 표지의 방향 남쪽'), COMMIT] },
      { spot: '역무실 노선 모형', steps: [C('중앙 선로'), C('선택한 구간 운행'), WRONG('더 운행'), C('북문 선로'), C('선택한 구간 운행'), C('수림 선로'), C('선택한 구간 운행'), COMMIT] },
      { spot: '오른쪽 소형 사물함 살펴보기', steps: [C('역코드 십의 자리 늘리기'), C('역코드 십의 자리 늘리기'), WRONG('눈금'), C('역코드 일의 자리 늘리기', { times: 4 }), C('예약 칸 늘리기', { times: 3 }), COMMIT] },
      { spot: '안내소 전화', steps: [WRONG('연결'), C('안내소에 연결 요청'), C('왜 연락이 없었는지 묻기'), WRONG('질문'), C('지금 괜찮은지 묻기'), COMMIT] },
    ],
  },
  garage: {
    opening: ['차에서 꺼낸 기록 리더', '리더 전원 스위치'],
    stages: [
      { spot: '블랙박스 재생기', steps: [R('출입 영상 탐색', 1313), WRONG('보정'), R('시간축 보정 분', -7), COMMIT] },
      { spot: '노트북 출입 기록 살펴보기', steps: [T('조회할 직원 카드 번호', '04'), WRONG('카드'), T('조회할 직원 카드 번호', '07'), COMMIT] },
      { spot: '진술철', steps: [R('다른 지역 사무실 영상 시각', 1306), WRONG('결제 창구'), R('외부 결제 창구 영상 시각', 1306), COMMIT] },
      { spot: '선반의 보존 문서 살펴보기', steps: [C('누가 접근했는가에 폐업 인계 문서 선택'), C('기록을 숨길 이유에 출입 서버 기록 선택'), WRONG('자리'), C('누가 접근했는가에 폐업 인계 문서 선택'), C('누가 접근했는가에 출입 서버 기록 선택'), C('기록을 숨길 이유에 출입 서버 기록 선택'), C('기록을 숨길 이유에 폐업 인계 문서 선택'), COMMIT] },
    ],
  },
  apartment: {
    opening: ['관리인이 맡긴 필름 묶음', '필름을 빛에 비춰보기'],
    stages: [
      { spot: '제보 사진과 건물 도면', steps: [C('창문 4줄 3칸 선택'), WRONG('뒤편'), C('뒤쪽 도면 보기'), C('창문 3줄 3칸 선택'), WRONG('층'), C('창문 4줄 3칸 선택'), COMMIT] },
      { spot: '502호 평면도', steps: [C('뒤편 왼쪽 창 방 바꾸기'), C('뒤편 가운데 창 방 바꾸기'), C('뒤편 오른쪽 창 방 바꾸기'), WRONG('자리'), 'setRooms', COMMIT] },
      { spot: '조명 점검함', steps: [C('필름 01 늘리기', { times: 3 }), C('필름 02 늘리기'), WRONG('눈금'), C('필름 03 늘리기', { times: 2 }), C('필름 04 늘리기', { times: 3 }), COMMIT] },
      { spot: '관리인의 조명 모형', steps: [C('현관 봉인 정상'), WRONG('봉인'), C('현관 봉인 열림'), C('주전원 켜짐'), C('점등 시험'), WRONG('별도 전원만'), C('별도 전원 꺼짐'), C('점등 시험'), COMMIT] },
    ],
  },
  radio: {
    opening: ['보관 음성 사본 데크', '재생 버튼 누르기'],
    stages: [
      { spot: '재생 데크 살펴보기', steps: [C('A · START'), C('E · J03'), WRONG('J09'), C('마지막 테이프 연결 풀기'), C('B · J03'), WRONG('조각'), C('C · J08'), C('D · J17'), COMMIT] },
      { spot: '녹음 보관 라벨', steps: [C('녹음 연 늘리기', { times: 3 }), C('녹음 월 늘리기', { times: 3 }), WRONG('눈금'), C('녹음 일 열 눈금 늘리기'), C('녹음 일 늘리기'), COMMIT] },
      { spot: '패치 연결부 살펴보기', steps: [WRONG('케이블'), C('전원 차단 잭'), C('구 스튜디오 설비 잭'), C('별도 전원 유지보수 잭'), C('공식 중계소 설비 잭'), COMMIT] },
      { spot: '송출 점검 기록', steps: [S('입력 장치 점검 점검 항목', 'live'), WRONG('자리'), S('입력 장치 점검 점검 항목', 'no-mic'), S('출력 대조 점검 항목', 'fingerprint'), COMMIT] },
    ],
  },
  laundry: {
    opening: ['기계 옆 접수표', '접힌 면 펼치기'],
    stages: [
      { spot: '기계의 작업표', steps: [C('N-08 울 코트 태그 집기'), C('1번 기계 걸이에 태그 놓기'), WRONG('비어'), C('물세탁 작업표 태그 집기'), C('1번 기계 걸이에 태그 놓기'), C('다음 기계 →'), C('N-08 울 코트 태그 집기'), C('2번 기계 걸이에 태그 놓기'), C('다음 기계 →'), C('열풍 건조 작업표 태그 집기'), C('3번 기계 걸이에 태그 놓기'), COMMIT] },
      { spot: '영수증과 시계 점검 스티커', steps: [R('영수증 시계 보정 분', 12), WRONG('빼는'), R('영수증 시계 보정 분', -12), COMMIT] },
      { spot: '직원 출입 명부', steps: [C('보정한 수령 순간 현장에 이서경 · 고객 선택'), WRONG('비어'), C('보정한 수령 순간 현장에 이서경 · 고객 선택'), C('보정한 수령 순간 현장에 서도윤 · 운영자 O-2 선택'), C('그 뒤 도착한 사람에 이서경 · 고객 선택'), COMMIT] },
      { spot: '접수 단말 모형', steps: [WRONG('찍지'), R('출입 재현 시각', 1439), C('고객 수령 표시 찍기'), WRONG('수령 시각'), R('출입 재현 시각', 1436), C('고객 수령 표시 찍기'), COMMIT] },
    ],
  },
  letter: {
    opening: ['분류대의 반송 봉투', '덮개 열기'],
    stages: [
      { spot: '사서의 우편 분류 모형', steps: [WRONG('경로'), C('옛 주소로 보내기'), C('발신함으로 돌려받기'), C('미루동 17-14 → 미루기록길 42'), WRONG('옛 지번'), C('미루동 17-4 → 미루기록길 12'), COMMIT] },
      { spot: '탁자에 펼친 봉투 살펴보기', steps: ['sortLetters', COMMIT] },
      { spot: '보존 서가', steps: [C('MR열 선택'), WRONG('자리'), C('17단 04칸 선택'), COMMIT] },
    ],
  },
  'pet-home': {
    opening: ['정우가 건넨 상자', '뚜껑 들기'],
    stages: [
      { spot: '기억 상자', steps: [C('파란 명찰 끈 집기'), C('처음 발견 · 빈 페이지'), C('진료 봉투 집기'), C('진료 · 빈 페이지'), C('접힌 담요 집기'), C('임시보호 · 빈 페이지'), WRONG('비어'), C('입양 확인서 집기'), C('장기 입양 · 빈 페이지'), COMMIT] },
      { spot: '탁자에 펼친 인계서류 살펴보기', steps: [C('2016년 접수표 연결'), WRONG('서류'), C('2016년 진료 연결 기록 연결'), C('과거 동물등록 연결 기록 연결'), C('2026년 재입양 계약 연결'), COMMIT] },
      { spot: '유나의 사진첩', steps: [C('파란 끈 가까이 보기'), WRONG('흔적'), C('정류장 주변 보기'), C('사진 원본 정보 펼치기'), COMMIT] },
    ],
  },
  'cat-invite': {
    opening: ['선물', '리본 아래 이름표'],
    stages: [
      { spot: '식탁 중앙의 쪽지 살펴보기', steps: [C('은호의 선물 집기'), C('북쪽 자리 · 빈 의자'), C('소연의 선물 집기'), C('동쪽 자리 · 빈 의자'), C('지후의 선물 집기'), C('남쪽 자리 · 빈 의자'), WRONG('빈 의자'), C('미정의 선물 집기'), C('서쪽 자리 · 빈 의자'), COMMIT] },
      { spot: '리본을 묶은 선물 상자 살펴보기', steps: [C('은호 · 파란 리본 풀기'), WRONG('리본'), C('소연 · 노란 리본 풀기'), C('지후 · 초록 리본 풀기'), C('미정 · 분홍 리본 풀기'), COMMIT] },
      { spot: '탁자 위 감사 카드 살펴보기', steps: [S('기념 월', '6'), C('10일 선택'), WRONG('눈금'), C('12일 선택'), COMMIT] },
    ],
  },
};

async function runStep(page, step, errors) {
  if (step === 'setRooms') {
    // cycle each window until it reads the target name
    for (const [slot, want] of [['뒤편 왼쪽 창', '작은방'], ['뒤편 가운데 창', '거실'], ['뒤편 오른쪽 창', '안방']]) {
      for (let i = 0; i < 4; i++) {
        const txt = await page.evaluate((slot) => [...document.querySelectorAll('dialog[open] .window-pane')].find((b) => b.getAttribute('aria-label').startsWith(slot))?.innerText || '', slot);
        if (txt.includes(want)) break;
        await L.click(page, slot + ' 방 바꾸기');
      }
    }
    return;
  }
  if (step === 'sortLetters') {
    // target order: garage, apartment, radio, station — move by picking and placing
    const order = ['폐업 인계 문서 봉투', '조명 점검서 봉투', '송출 보고서 봉투', '도착 확인서 봉투'];
    for (let i = 0; i < 4; i++) {
      await L.click(page, order[i] + ' 집기');
      await L.click(page, (i + 1) + '번 자리');
    }
    return;
  }
  const [kind, a, b] = step;
  if (kind === 'click') { const times = b?.times || 1; for (let i = 0; i < times; i++) await L.click(page, a); }
  else if (kind === 'range') await L.setRange(page, a, b);
  else if (kind === 'select') await L.setSelect(page, a, b);
  else if (kind === 'type') await L.typeInto(page, a, b);
  else if (kind === 'commit') await L.commit(page);
  else if (kind === 'expectWrong') {
    await L.commit(page);
    const st = await L.statusText(page);
    const dlg = await L.dialogText(page);
    const stillDevice = !(await page.evaluate(() => !!document.querySelector('dialog[open] .story-stage-reveal')));
    L.check(stillDevice && st.includes(a), 'wrong feedback "' + st + '" ~ ' + a + (stillDevice ? '' : ' (stage passed unexpectedly)'));
  }
}

async function walk(id, { mobile = false } = {}) {
  const { browser, page, errors } = await L.launch({ mobile });
  const w = walks[id];
  console.log('=== ' + id + (mobile ? ' (mobile)' : ''));
  try {
    if (id === 'garage') await L.fresh(page, '/case'); else await L.freshEpisode(page, id);
    await L.click(page, '처음부터 하기');
    await L.click(page, '이야기 읽기');
    await L.click(page, '이야기를 읽고 탐색 시작');
    await L.click(page, w.opening[0]);
    await L.click(page, w.opening[1]);
    await L.click(page, '이곳 계속 살펴보기');
    for (let i = 0; i < w.stages.length; i++) {
      const st = w.stages[i];
      // open every tray / scene record once so the read counter can reach 100%
      const trays = await page.evaluate(() => [...document.querySelectorAll('.scene-tray-item')].map((b) => b.textContent.trim()));
      for (const h of trays) {
        await L.click(page, h, { within: '#room' });
        if (await L.dialogText(page)) await L.closeDialog(page);
      }
      await L.spot(page, st.spot);
      const before = await L.dialogText(page);
      if (!before) throw new Error('device did not open: ' + st.spot);
      for (const step of st.steps) await runStep(page, step, errors);
      const after = await L.dialogText(page);
      const solved = await page.evaluate(() => !!document.querySelector('dialog[open] .story-stage-reveal'));
      L.check(solved, 'stage ' + (i + 1) + ' solved (' + st.spot + ')');
      if (!solved) console.log('  dialog:', after.replace(/\n+/g,' | ').slice(0, 400), '\n  status:', await L.statusText(page));
      // continue to next place
      await L.reveal(page);
      // unread nudge: open anything it lists
      for (let k = 0; k < 6; k++) {
        const nudged = await page.evaluate(() => [...document.querySelectorAll('.place-unread button')].map((b) => b.textContent));
        if (!nudged.length) break;
        await L.click(page, nudged[0], { within: '.place-unread' });
        await L.closeDialog(page);
      }
      if (i === w.stages.length - 1) {
        // final record view → "마지막 행동 →" → journey hotspot → journey steps → ending
        if (await L.hasButton(page, '마지막 행동 →')) await L.click(page, '마지막 행동 →');
        await L.sleep(300);
        let reached = false;
        for (let k = 0; k < 30 && !reached; k++) {
          const dlg = await L.dialogText(page);
          const main = await L.mainText(page);
          if (/이야기의 끝|엔딩 장면/.test(dlg + main)) { reached = true; break; }
          if (dlg) {
            await page.evaluate(() => { for (const r of document.querySelectorAll('dialog[open] input[type=range]')) { r.value = r.max; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); } });
            const bs2 = await L.buttons(page);
            const go = bs2.find((x) => x === '마지막 행동 →') || bs2.find((x) => !/^확대창 닫기|^돌아가기|^← |힌트|도움|이전 단서|다음 단서|꺼내 보기|자료 보관|마지막 행동|테마 로비|본문으로|✓|^증거 보관$|^보관 해제$|^자료 보관$/.test(x));
            if (!go) { await L.closeDialog(page); continue; }
            if (process.env.WALK_DEBUG) console.log('  [final] click', go);
            await L.click(page, go);
          } else {
            const hs = await L.roomSpots(page);
            const fin = hs.find((h) => / →$/.test(h)) || hs.find((h) => !/처음 물건|이야기/.test(h) && !w.stages.some((s2) => h.includes(s2.spot)));
            if (!fin) break;
            if (process.env.WALK_DEBUG) console.log('  [final] hotspot', fin);
            await L.spot(page, fin);
          }
          await L.sleep(350);
        }
        L.check(reached, 'ending reached');
        if (!reached) { console.log('  stuck dialog:', (await L.dialogText(page)).replace(/\n+/g,' | ').slice(0,300)); console.log('  stuck buttons:', JSON.stringify(await L.buttons(page))); console.log('  hotspots:', JSON.stringify(await L.hotspots(page))); }
        console.log('docCount', await L.docCount(page));
      } else {
        const hs = await L.hotspots(page);
        L.check(hs.includes(w.stages[i + 1].spot) || hs.some((h) => h.includes(w.stages[i + 1].spot)), 'next device visible: ' + w.stages[i + 1].spot + ' in ' + JSON.stringify(hs));
      }
    }
  } catch (e) {
    console.log('FAIL exception', e.message);
    console.log('buttons now', JSON.stringify(await L.buttons(page)));
    console.log('hotspots now', JSON.stringify(await L.hotspots(page)));
    console.log('status', await L.statusText(page));
    process.exitCode = 1;
  }
  const bad = errors.filter((e) => !/woff2/.test(e));
  L.check(!bad.length, 'no page errors ' + JSON.stringify(bad));
  await browser.close();
}

const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const mobile = process.argv.includes('--mobile');
for (const id of ids.length ? ids : Object.keys(walks)) await walk(id, { mobile });
