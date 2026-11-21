// 끝나지 않은 방송 — ★5 안내 없음, 힌트 2단계(정답 없음), 오답은 장치마다 한 줄 중립 문구
// 2년 전 폐국 날 1시 58분, 송신기를 내린 건 나였다 그 뒤에도 녹음기는 돌았다
// 선배는 10월부터 밤마다 이 건물에 들어와 옛 방송을 오려 붙였고, 오늘 밤 내내 문 하나 사이에 있었다
// 손동작: 도어락 번호 누르기 → 버저 짧게·길게 두드리기 → 선반에서 테이프 한 통 → 카운터 바퀴 → 알림에 순서 붙이기 → 패치 케이블
const P = 'assets/v2/radio/';

// ON AIR 깜빡임: 4719를 반복, 휴대폰 기록은 「1」부터 찍혀서 처음부터 읽으면 1947로 보인다
// 사보 표는 0~4만 남았다 5~9는 점 개수 규칙(뒤 다섯은 줄이 앞에서부터 늘어남)으로 짐작해야 한다
const MORSE = { 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.' };
function blinkSvg() {
  const seq = ['1', '9', 'L', '4', '7', '1', '9', 'L', '4', '7'];
  const marks = [];
  let t = 2;
  seq.forEach((c, i) => {
    if (c === 'L') { t += 7; return; } // 앞의 숫자 사이 3 + 7 = 10단위
    MORSE[c].split('').forEach((s, j) => { const w = s === '.' ? 1 : 3; marks.push([t, w]); t += w + (j < 4 ? 1 : 0); });
    if (i < seq.length - 1) t += 3;
  });
  const W = 80;
  // 줄은 숫자 사이에서만 바꾼다 (한 숫자가 두 줄로 갈라지지 않게) 줄마다 폭은 같고, 둘째 줄은 첫 줄 마지막 불빛이 꺼진 때부터
  const digits = [];
  marks.forEach(([s, w], i) => { if (i % 5 === 0) digits.push([]); digits[digits.length - 1].push([s, w]); });
  const rows = [];
  let row = { s: 0, m: [] };
  digits.forEach((dg) => { const e = dg[dg.length - 1][0] + dg[dg.length - 1][1]; if (e > row.s + W) { const last = row.m[row.m.length - 1]; rows.push(row); row = { s: last[0] + last[1], m: [] }; } row.m.push(...dg); });
  rows.push(row);
  const U = 0.3; // 초
  return rows.map((r, ri) => {
    let s = `<svg viewBox="0 0 ${W} 11" class="blink-svg" role="img" aria-label="${ri + 1}번째 줄 깜빡임 ${r.m.length}번">`;
    s += `<rect x="0" y="0" width="${W}" height="6" rx=".4" fill="#160d0d"/>`;
    r.m.forEach(([x, w]) => { s += `<rect x="${x - r.s}" y="1.6" width="${w}" height="2.8" rx=".3" fill="#ff5545"/>`; });
    const tick = (k, anchor) => `<line x1="${k - r.s}" y1="6" x2="${k - r.s}" y2="6.8" stroke="#8a7f7a" stroke-width=".15"/><text x="${k - r.s}" y="9.6" font-size="1.5" text-anchor="${anchor}" fill="#a3958e" font-family="SUIT, sans-serif">${Math.round(k * U)}초</text>`;
    if (ri === 0) s += tick(0, 'start');
    for (let k = Math.floor(r.s / 10) * 10 + 10; k <= r.s + W - 3; k += 10) s += tick(k, 'middle');
    return s + '</svg>';
  }).join('');
}
// 로비 장면의 ON AIR 간판이 실제로 같은 박자로 깜빡인다 (4719 + 긴 쉼) 풀고 나면 켜진 채로 멎는다
function liveBlinkCss() {
  const on = [];
  let t = 1;
  ['4', '7', '1', '9'].forEach((c, i) => {
    MORSE[c].split('').forEach((sym, j) => { const w = sym === '.' ? 1 : 3; on.push([t, t + w]); t += w + (j < 4 ? 1 : 0); });
    t += i < 3 ? 3 : 10;
  });
  const pc = (u) => +(u / t * 100).toFixed(3);
  const frames = ['0%{opacity:.9}', ...on.flatMap(([a, b]) => [`${pc(a)}%{opacity:0}`, `${pc(b)}%{opacity:.9}`]), '100%{opacity:.9}'];
  return `<style>@keyframes radioOnAir{${frames.join('')}}.v2-stage-ov.onair-live{background:radial-gradient(closest-side,#140707 70%,rgba(20,7,7,.6));animation:radioOnAir ${(t * 0.32).toFixed(2)}s step-end infinite;pointer-events:none}@media (prefers-reduced-motion:reduce){.v2-stage-ov.onair-live{animation:none;opacity:0}}</style>`;
}
const stateNow = () => { try { return window.MihaejeV2?.state || JSON.parse(localStorage.getItem('mihaeje-v2-radio') || '{}'); } catch { return {}; } };
const morseRow = (n) => `<tr><td>${n}</td><td class="mc">${MORSE[n].replace(/\./g, '●').replace(/-/g, '━')}</td></tr>`;

// 헤드폰 큐 채널: 선배가 옛 방송에서 한 마디씩 오려 붙인 말, 붙인 순서가 거꾸로 나온다
const CUE = '하 람 아 보 관 실 뒷 문 은 클 로 징 곡 길 이 를 두 드 려 분 초 순 서 로'.split(' ').reverse();
const TAP_OK = ['.....' + '.----' + '....-', '-----' + '.....' + '.----' + '....-']; // 5분 14초 → 5 1 4 (앞의 0은 있어도 된다)

// 보관실 선반 3줄 × 4 (사진 좌표 %) 241031 상자는 다음 방송일 라벨만 미리 붙인 빈 상자
const SHELF = [
  ['241027 B 01', '241028 A 00', '241031 A 00', '241029 B 02'],
  ['241028 B 02', '241029 A 01', '241030 A 01', '241031 A 01'],
  ['241027 B 00', '241030 A 00', '241029 A 00', '241030 A 02'],
];
const SH_X = [22.0, 40.5, 58.6, 77.2], SH_Y = [15.5, 49.0, 82.0];
const REEL_OK = '1-2';

// 녹화기 알림 (화면에 놓이는 순서 / 실제 순서는 CAM1 → 4) 녹화기 시계는 오전 오후가 없다
const CAMS = {
  c1: { img: 'cam1', cam: 'CAM1 정문 로비', t: '11:40:12', real: '23:40' },
  c2: { img: 'cam2', cam: 'CAM2 B실', t: '12:20:47', real: '00:20' },
  c3: { img: 'cam3', cam: 'CAM3 지하 보관실', t: '01:10:05', real: '01:10' },
  c4: { img: 'cam4', cam: 'CAM4 A실 앞 대기실', t: '01:59:30', real: '01:59' },
};
const CAM_SHOW = ['c2', 'c4', 'c1', 'c3'];
const CAM_OK = ['c1', 'c2', 'c3', 'c4'];
const camFig = (k, extra = '') => `<figure class="cctv-frame"><img src="${P}props/${CAMS[k].img}.webp" alt="${CAMS[k].cam} 흑백 화면" decoding="async"><figcaption><span>${CAMS[k].cam}</span><span>${extra || CAMS[k].t}</span></figcaption></figure>`;

// 패치베이 (사진 좌표 %)
const JX = [13.5, 23.8, 34.2, 44.6, 55.0, 65.4, 75.8, 86.2], JY_OUT = 33.5, JY_IN = 69.5;
const OUTS = ['MIC A', 'MIC B', 'TAPE A', 'TAPE B', 'PGM A', 'PGM B', 'AUTO PC', 'TONE'];
const INS = ['TX MAIN', 'TX 예비', 'MON 로비', 'REC A', 'REC B', 'MON 대기실', 'CON A1', 'AUTO IN'];
function patchOk(c) {
  // 데크(출력 4) → 실제 예비 송신기(입력 1) · 녹음 REC B(5) · 선배가 있는 대기실(6)
  // 남는 잭에 더 꽂힌 선은 소리를 나눠 보낼 뿐이라 판정에 넣지 않는다 (장치 안내에 적어 둠) 송신기 줄은 데크만 받을 수 있다
  return c[1] === 4 && c[5] === 4 && c[6] === 4;
}

// 데크는 한 번 재생하면 5초만 돌고 선다 끊긴 자리(58:22)가 그 5초 안에 들어오면 된다 58:12(프리롤 빼먹음)는 10초 앞이라 안 닿는다
const DECK_CUT = 58 * 60 + 22, DECK_WINDOW = 5;

const KEYS = [['1', 41.0, 23.5], ['2', 46.8, 23.5], ['3', 52.6, 23.5], ['4', 41.0, 31.7], ['5', 46.8, 31.7], ['6', 52.6, 31.7], ['7', 41.0, 40.0], ['8', 46.8, 40.0], ['9', 52.6, 40.0], ['*', 41.0, 48.3], ['0', 46.8, 48.3]];

export default {
  id: 'radio',
  number: '003',
  title: '끝나지 않은 방송',
  subtitle: '「새벽 두 시, 미루」는 꺼진 적이 없다',
  genre: '방송 미스터리 · 송출 추적',
  minutes: 55,
  difficulty: 5,
  mood: 'horror',
  cover: P + 'lobby.webp',
  coverAlt: '불 꺼진 옛 방송국 로비, 스튜디오 문 위 ON AIR 불만 붉게 켜져 있다',
  music: 'assets/music/radio-v33.mp3',
  tagline: '2년 전 문을 닫은 방송국\n꺼 둔 로비 스피커에서 자정에 그 목소리가 흘러나왔다',
  blurb: '폐국 날 송신기를 내린 엔지니어가 철거를 앞둔 건물의 밤을 지킵니다\n목소리를 잃었다던 선배의 방송이 오늘 밤 다시 나갔고, 2년 전 그 자리에서 또 끊겼습니다',
  storageKey: 'mihaeje-v2-radio',
  hintTitle: '내 옛 수첩',
  tracesLabel: '끊긴 방송의 뒤',

  opening: {
    eyebrow: '2026년 10월 31일 토요일, 새벽 2시',
    paragraphs: [
      '미루FM은 2년 전 오늘, 새벽 1시 58분에 문을 닫았다. 송신기를 내린 건 나였다. 위에서 시킨 시각에 맞춰서. 은수 선배가 마지막 인사를 막 시작한 참이었다.',
      '건물은 다음 달 헐린다. 철거 전까지 밤에 건물을 지키는 일을 내가 맡았다. 아는 건물이라서. 선배는 폐국 뒤로 목소리를 거의 잃었다고 들었다. 그 뒤로는 연락을 못 했다.',
      '오늘 밤 열두 시, 꺼 둔 줄 알았던 로비 모니터 스피커가 혼자 켜졌다. 「새벽 두 시, 미루」 시그널. 그리고 은수 선배 목소리. 나올 수 없는 목소리였다.',
      '1시 58분, 방송이 뚝 끊겼다. 2년 전과 같은 자리에서. 스피커에서는 한참 동안 숨소리 같은 잡음만 났다. 그리고 B실 문 위 ON AIR 불이 깜빡이기 시작했다.',
    ],
    cta: 'ON AIR 불빛 쪽으로',
  },

  traces: [
    { device: 'keypad', label: 'B실 문' },
    { device: 'tapdoor', label: '보관실 뒷문' },
    { device: 'reel', label: '마지막 날 2부' },
    { device: 'deck', label: '1시 58분 그 뒤' },
    { device: 'cctv', label: '대기실의 그림자' },
    { device: 'patch', label: '다시 송출' },
  ],

  scenes: [
    {
      id: 'lobby',
      name: '로비',
      image: P + 'lobby.webp',
      // 엔진의 overlays 는 S를 받지 않아서, 지금 상태를 읽어 도어락을 풀기 전까지만 깜빡이게 한다
      get overlays() { return (stateNow().solved || []).includes('keypad') ? [] : [{ x: 32.6, y: 17.6, w: 8.4, h: 5.6, cls: 'onair-live', html: liveBlinkCss() }]; },
      arrive: (S) => S.solved.includes('keypad')
        ? 'ON AIR 불은 켜진 채로 멎었다 그래도 자꾸 그쪽을 보게 된다 스피커의 지지직 소리도 아직 그대로다'
        : '불 꺼진 로비 B실 문 위 ON AIR 불만 길게, 짧게 깜빡인다 스피커에선 아직 지지직 소리 벽에는 옛 사보가 그대로 걸려 있고, 데스크엔 낮 근무 일지가 펼쳐져 있다',
      hotspots: [
        { id: 'mchat', x: 13, y: 66, label: '내 휴대폰 · 만석 형 문자', kind: 'doc', doc: 'mchat' },
        { id: 'notes', x: 14, y: 10, label: '모니터 스피커 받아쓰기', kind: 'doc', doc: 'notes' },
        { id: 'blink', x: 37, y: 20, label: '깜빡이는 ON AIR', kind: 'doc', doc: 'blink', r: 8 },
        { id: 'zine', x: 16, y: 34, label: '벽에 걸린 옛 사보', kind: 'doc', doc: 'zine' },
        { id: 'guardlog', x: 58, y: 50, label: '안내 데스크 관리 일지', kind: 'doc', doc: 'guardlog' },
        { id: 'notice', x: 92, y: 36, label: '유리문의 철거 공지', kind: 'doc', doc: 'notice' },
        { id: 'keypad', x: 42, y: 45, label: 'B실 도어락', kind: 'device', device: 'keypad', r: 7 },
      ],
    },
    {
      id: 'studioB',
      name: 'B실',
      image: P + 'studioB.webp',
      unlockedBy: 'keypad',
      arrive: (S) => S.solved.includes('tapdoor')
        ? '뒷문이 열려 있다 계단 아래에서 테이프 냄새가 올라온다 헤드폰은 아직 같은 말을 되풀이한다'
        : '콘솔이 빠진 자리에 먼지 자국이 네모나다 그 먼지 위에 손바닥 자국 하나 아직 먼지가 앉지 않았다 켜진 모니터 하나, 책상 위 헤드폰에서 뭔가 새어 나온다',
      hotspots: [
        { id: 'auto', x: 92, y: 42, label: '자동 송출 PC 화면', kind: 'doc', doc: 'auto' },
        { id: 'enote', x: 93.5, y: 62, label: '모니터에 붙은 쪽지', kind: 'doc', doc: 'enote', r: 6 },
        { id: 'sched', x: 8.5, y: 32, label: '벽의 편성 변경 알림', kind: 'doc', doc: 'sched' },
        { id: 'cue', x: 76, y: 66, label: '책상 위 헤드폰', kind: 'doc', doc: 'cue' },
        { id: 'tapdoor', x: 25, y: 35, label: '흡음판 옆 보관실 뒷문', kind: 'device', device: 'tapdoor' },
      ],
    },
    {
      id: 'archive',
      name: '보관실',
      image: P + 'archive.webp',
      unlockedBy: 'tapdoor',
      arrive: (S) => S.solved.includes('reel')
        ? '선반 한 칸이 비었다 그 상자는 내 품에 있다 안쪽 계단이 A실 뒷문으로 이어진다'
        : '책상 스탠드가 켜져 있다 나는 이 방 불을 켠 적이 없다 테이프 상자가 천장까지 쌓였다 다음 달 10일이면 전부 폐기된다',
      hotspots: [
        { id: 'rules', x: 15, y: 52, label: '책상 위 보관 규칙', kind: 'doc', doc: 'rules' },
        { id: 'reel', x: 58, y: 40, label: '폐국 전 마지막 주 테이프', kind: 'device', device: 'reel', r: 13 },
        { id: 'reel-r', x: 84, y: 48, label: '폐국 전 마지막 주 테이프', kind: 'device', device: 'reel', r: 13 },
      ],
    },
    {
      id: 'studioA',
      name: 'A실',
      image: P + 'studioA.webp',
      unlockedBy: 'reel',
      arrive: (S) => S.solved.includes('cctv')
        ? 'A실 앞문 너머가 대기실이다 문틈으로 아무 소리도 새지 않는다 랙 맨 위 패치베이에는 오늘 밤 케이블 둘이 그대로 꽂혀 있다'
        : S.solved.includes('deck')
          ? '테이프는 끝까지 돌고 멈췄다 주머니에서 휴대폰이 아까부터 계속 떤다'
          : '2년 전 선배가 마지막으로 앉았던 방 의자가 콘솔 쪽으로 반쯤 돌아가 있다 방금 누가 일어난 것처럼 데크도 콘솔도 그대로다',
      hotspots: [
        { id: 'deck', x: 14, y: 40, label: '릴 테이프 데크', kind: 'device', device: 'deck', r: 13 },
        { id: 'txlog', x: 42, y: 54, label: '콘솔 위 송출 기록지', kind: 'doc', doc: 'txlog' },
        { id: 'wiring', x: 91, y: 48, label: '랙 옆 배선표', kind: 'doc', doc: 'wiring' },
        { id: 'cctv', x: 33, y: 70, label: '주머니 속 휴대폰', kind: 'device', device: 'cctv', visible: (S) => S.solved.includes('deck') },
        { id: 'patch', x: 90, y: 15, label: '패치베이', kind: 'device', device: 'patch', visible: (S) => S.solved.includes('cctv') },
      ],
    },
  ],

  docs: {
    mchat: {
      title: '만석 형 문자',
      kind: '오늘 밤',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>만석이 형</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 10월 31일 토요일</div>
<div class="chat-row them"><span class="chat-avatar">만</span><div class="chat-col"><span class="chat-name">만석이 형</span><div class="chat-bubble">하람아 98점4 틀어봐 지금</div><div class="chat-bubble">은수씨다 새벽두시미루</div><div class="chat-bubble">방송국 다시하냐</div></div><span class="chat-time">오전 12:07</span></div>
<div class="chat-row me"><span class="chat-meta">오전 12:11</span><div class="chat-bubble">형 저 지금 그 건물이에요<br>로비 스피커에서도 나와요</div></div>
<div class="chat-row them"><span class="chat-avatar">만</span><div class="chat-col"><span class="chat-name">만석이 형</span><div class="chat-bubble">니가 트는거냐</div></div><span class="chat-time">오전 12:12</span></div>
<div class="chat-row me"><span class="chat-meta">오전 12:12</span><div class="chat-bubble">아니요</div></div>
<div class="chat-row them"><span class="chat-avatar">만</span><div class="chat-col"><span class="chat-name">만석이 형</span><div class="chat-bubble">끊겼다</div><div class="chat-bubble">이년전이랑 똑같은데서</div><div class="chat-bubble">하람아 나는 끝까지 듣고싶다 그때도 그랬고</div></div><span class="chat-time">오전 1:59</span></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    notes: {
      title: '모니터 스피커 받아쓰기',
      kind: '내 수첩 · 오늘 밤',
      html: `<blockquote class="hand">23:30 순찰 2층부터 지하까지 23:55 데스크로<br>00:00 B실 문 위 ON AIR 불이 혼자 들어옴 꺼 둔 스피커에서 시그널 「새벽 두 시, 미루」 선배 목소리<br>사연 셋 다 예전에 읽었던 거 (제빵사 아저씨, 야간 병동 간호사, 만석이 형)<br>문장마다 목소리 결이 조금씩 다르다 녹음한 해가 다른 것처럼 숨 쉬는 자리가 어색하게 끊긴다<br>신청곡 둘<br>01:57 「오늘이 마지막」까지 하고 끊김<br>2년 전이랑 같은 자리<br>그 뒤로 ON AIR가 깜빡이기 시작</blockquote>`,
    },
    blink: {
      title: '깜빡이는 ON AIR',
      kind: '휴대폰으로 찍은 것 · 깜빡이기 시작하고 조금 뒤부터',
      html: `<p>찍은 영상을 한 칸씩 넘기며 불이 켜진 동안을 막대로 옮겼다 빨간 막대가 켜진 시간이다 둘째 줄은 첫 줄 끝에서 이어진다</p><figure class="blinkfig">${blinkSvg()}</figure><p>찍는 내내 같은 박자가 되풀이됐다 내가 찍기 전에도 그랬을 것이다</p>`,
    },
    zine: {
      title: '벽에 걸린 옛 사보',
      kind: '미루FM 사보 2015년 봄호',
      html: `<div class="zine"><p class="zine-head">유리창 너머의 모스 부호</p><p>새벽 두 시 진행자 백은수 씨와 막내 기술 정하람 씨는 방송 중에 말을 주고받을 수 없다 둘은 부조정실 ON AIR 스위치로 모스 부호를 보낸다 「곡 2분 남음」 「커피」 같은 것들</p><p>은수 씨는 신호 하나를 다 보내면 꼭 한참 쉬었다가 처음부터 다시 보낸다 정하람 씨는 “선배는 쉼표가 길다”고 했다</p><p>숫자는 다섯 칸짜리라 반만 외우면 된다고 한다 나머지 반은 거꾸로 가니까</p><div class="morse-torn"><table class="morse-table"><tr><th colspan="2">숫자 모스 부호 · 중계소 식별용</th></tr>${[0, 1, 2, 3, 4].map(morseRow).join('')}</table><p class="torn-edge">아래는 찢겨 나갔다</p></div><p class="zine-foot">● 짧게 · ━ 길게 (짧은 것의 세 배)</p></div>`,
    },
    guardlog: {
      title: '안내 데스크 관리 일지',
      kind: '낮 근무 박 씨',
      html: `<div class="paper-table"><p class="pt-head">관리 일지</p><table><tr><th>10/3</th><td>B실 도어락 비번 누가 바꿈 관리실 비번으로 안 열림 업체에 문의 예정</td></tr><tr><th>10/17</th><td>보관실 테이프 11/10 일괄 폐기 그 전에 가져갈 사람은 연락</td></tr><tr><th>10/20</th><td>철거 11/15 시작 확정</td></tr><tr><th>10/29</th><td>새벽에 B실 쪽 불 켜져 있었다는 말 있음 출입 기록엔 폐국 때 못 걷은 옛 직원 카드 한 장 누군지 확인 못 함</td></tr></table></div>`,
    },
    notice: {
      title: '유리문의 철거 공지',
      kind: '시공사',
      html: `<div class="paper-table"><p class="pt-head">철거 안내</p><table><tr><th>대상</th><td>옛 미루FM 사옥 (2024년 10월 31일 폐국)</td></tr><tr><th>기간</th><td>2026년 11월 15일 (일)부터</td></tr><tr><th>야간</th><td>경비 1명 상주</td></tr></table><p class="pt-foot">남은 물품은 11월 10일 (화)까지 반출</p></div>`,
    },
    auto: {
      title: '자동 송출 PC 화면',
      kind: 'B실',
      html: `<div class="term-screen auto"><p class="term-line">MIRU AUTO · 예약 재생 목록</p><p class="term-sub">예약 2026-10-31 00:00 한 번 · 등록 2026-10-29 03:12 · 사용자 eunsoo</p><table class="term-table"><tr><th>시작</th><th>파일</th></tr>${[
        ['00:00:00', '시그널_새벽두시'], ['00:00:14', '오프닝_2009-03-02'], ['00:04:40', '사연_제빵사_2013-11-20'], ['00:21:05', '신청곡소개_2017-06-11'], ['00:47:30', '사연_간호사_2019-02-27'], ['01:12:18', '신청곡소개_2011-09-30'], ['01:31:02', '사연_택시_2015-01-08'], ['01:52:30', '클로징음악'], ['01:57:44', '마지막방송_2024-10-31_조각'],
      ].map(([t, f]) => `<tr><td>${t}</td><td>${f}</td></tr>`).join('')}<tr class="term-err"><td>01:58:12</td><td>마지막인사 · 파일 없음 · 송출 정지</td></tr></table><p class="term-sub">큐 채널 · 하람에게 · 반복 재생 중</p></div>`,
    },
    cue: {
      title: '책상 위 헤드폰',
      kind: 'B실 · 자동 송출 PC 큐 채널',
      html: `<p>헤드폰을 썼다 선배 목소리가 한 마디씩 끊겨 나온다 마디마다 목소리 결이 다르다 어떤 건 스무 살 목소리, 어떤 건 쉰 목소리 들리는 대로 받아 적었다</p><div class="cue-strip" role="img" aria-label="받아 적은 마디 ${CUE.length}개">${CUE.map((c) => `<span>${c}</span>`).join('')}</div><p>마지막 마디 뒤에 숨 들이쉬는 소리가 한 번 나고, 처음부터 다시 나온다 몇 번을 들어도 같다</p>`,
    },
    enote: {
      title: '모니터에 붙은 쪽지',
      kind: '선배 글씨',
      html: `<blockquote class="hand">하람아<br>목소리가 이제 잘 안 나와서 옛날 내 말을 오려 붙였다<br>마지막 인사만은 못 만들겠더라 방송에 나간 적이 없으니까<br>근데 한 번은 했지 네가 송신기 내리고 나서도 녹음기는 돌았잖아<br>보관실 버리기 전에 찾아서 내보내 줘 이번엔 녹음도 하고<br>이번엔 끝까지 들을게</blockquote>`,
    },
    sched: {
      title: '벽의 편성 변경 알림',
      kind: '편성팀 · 2024년 10월',
      html: `<div class="paper-table"><p class="pt-head">편성 변경 알림</p><table><tr><th class="nw">10월 28일 (월) 밤 방송부터</th><td>B실 콘솔 매각 반출 「새벽 두 시, 미루」는 콘솔 남은 방에서 진행</td></tr><tr><th>B실</th><td>자동 송출 PC만 남김 (새벽 2시~5시 재방송)</td></tr></table><p class="pt-foot">폐국까지 남은 사흘 협조 부탁드립니다</p></div>`,
    },
    rules: {
      title: '책상 위 보관 규칙',
      kind: '보관실',
      html: `<div class="paper-table"><p class="pt-head">녹음 테이프 보관 규칙</p><table><tr><th>1</th><td>라벨은 방송일 · 스튜디오 · 시작 시각 (예 241015 A 07)</td></tr><tr><th>2</th><td>방송일은 새벽 5시에 넘어간다</td></tr><tr><th>3</th><td>녹음은 정시 10초 전부터 한 시간에 한 통</td></tr><tr><th>4</th><td>데크 카운터는 테이프 맨 처음이 00:00</td></tr><tr><th>5</th><td>다음 방송일 상자는 전날 라벨을 미리 붙여 둔다</td></tr></table></div>`,
    },
    txlog: {
      title: '콘솔 위 송출 기록지',
      kind: 'A실 · 2024/10/31 (목)',
      html: `<div class="paper-table"><p class="pt-head">송출 기록</p><table><tr><th>00:00:00</th><td>「새벽 두 시, 미루」</td></tr><tr><th>01:00:00</th><td>2부</td></tr><tr><th>01:58:12</th><td>TX OFF (수동) 지시 경영지원팀 <span class="hand-note">— 정하람</span></td></tr><tr><th>02:00:00</th><td>폐국</td></tr></table><p class="pt-foot"><span class="hand-note">REC는 못 껐다</span></p></div>`,
    },
    wiring: {
      title: '랙 옆 배선표',
      kind: 'A실 패치베이 · 2019 개정',
      html: `<div class="paper-table wiring"><p class="pt-head">패치베이 배선표</p><table><tr><th>윗줄 출력</th><td>${OUTS.map((o, i) => `<span class="nw jack-tag">${i + 1} ${o}</span>`).join(' ')}</td></tr><tr><th>아랫줄 입력</th><td>${INS.map((o, i) => `<span class="nw jack-tag">${i + 1} ${o}</span>`).join(' ')}</td></tr></table><p class="hand-note">10/28 A실 데크 고장 반출 B실 데크 들여옴 B실 쓰던 선째로 꽂아서 데크는 출력 4 (라벨 안 바꿈)</p><p class="hand-note">10/29 REC A 접촉 불량 녹음은 REC B로</p><p class="hand-note">10/31 02:10 TX MAIN 철거</p><p class="hand-note">예비 송신기 선 입력 1로 옮김 (예비는 철거 보류) — 하람</p></div>`,
    },
    tape: {
      title: '테이프 58:22부터',
      kind: '내 수첩 · A실에서 들은 것',
      html: `<blockquote class="hand">241030 A 01 · 카운터 58:22<br>「오늘이 마지막」<br>송신 끊긴 자리 2초 아무 소리 없음 테이프 잡음도 없음<br>그다음 숨소리<br>선배가 꺼진 마이크에 대고 40초 더 말함<br>받아 적으려다 말았다 손이 떨려서</blockquote>`,
    },
    cctvlog: {
      title: '녹화기 알림 네 장',
      kind: '휴대폰 · 이어 붙인 순서',
      html: `<div class="cctv-log">${CAM_OK.map((k) => camFig(k, `${CAMS[k].t} · ${CAMS[k].real}`)).join('')}</div><p class="term-sub">01:59:30 이후 움직임 알림 없음</p>`,
    },
    final: {
      title: '선배의 문자',
      kind: '2026년 10월 31일 새벽 3시',
      locked: true,
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>은수 선배</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 10월 31일 토요일</div>
<div class="chat-row them"><span class="chat-avatar">은</span><div class="chat-col"><span class="chat-name">은수 선배</span><div class="chat-bubble">하람아</div><div class="chat-bubble">2년 전에 니가 송신기 내린 거 니 맘대로 한 거 아닌 거 나 알아</div><div class="chat-bubble">근데 니가 이 년 내내 미안해할까 봐 그게 더 걸렸어</div><div class="chat-bubble">밤새 무서웠지 미안 니가 직접 찾아야 했어</div><div class="chat-bubble">이제 됐다 테이프는 내가 가져간다</div></div><span class="chat-time">오전 3:04</span></div>
<div class="chat-row me"><span class="chat-meta">오전 3:06</span><div class="chat-bubble">네 선배<br>잘 자요</div></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
  },

  devices: {
    keypad: {
      title: 'B실 도어락',
      scene: 'lobby',
      intro: '관리실 번호로는 안 열린다 누가 바꿨다 번호를 누르고 손잡이를 돌린다 별표나 지우기를 누르면 누른 번호가 다 지워진다',
      docs: ['blink', 'zine', 'guardlog'],
      hintCode: 'R-S01',
      hints: [
        '선배랑 나는 ON AIR 스위치로 말을 했다 사보 표는 반이 찢겼지만 남은 반에 규칙이 보인다',
        '휴대폰은 중간부터 찍었다 선배가 한참 쉬는 데가 한 바퀴의 끝이다',
      ],
      initial: () => ({ code: '' }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const solved = S.solved.includes('keypad');
        const press = (k) => { if (solved) return; if (k === '*') d.code = ''; else if (d.code.length < 8) d.code += k; save(); };
        const wrap = el('div', 'prop keyphoto');
        wrap.innerHTML = `<img src="${P}props/keypad.webp" alt="B실 문의 숫자 도어락" decoding="async"><i class="kp-led${d.code.length || solved ? ' on' : ''}"></i>`;
        KEYS.forEach(([k, x, y]) => {
          const b = el('button', 'kp-key'); b.type = 'button'; b.style.left = x + '%'; b.style.top = y + '%';
          b.setAttribute('aria-label', k === '*' ? '별표 지우기' : `${k} 누르기`);
          b.onclick = () => press(k);
          wrap.append(b);
        });
        const pad = el('div', 'mobile-only kp-pad');
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0'].forEach((k) => { const b = el('button', 'ctl', k === '*' ? '지우기' : k); b.type = 'button'; b.setAttribute('aria-label', k === '*' ? '번호 지우기' : `${k} 버튼`); b.onclick = () => press(k); pad.append(b); });
        const box = el('div', 'mail-wrap'); box.append(wrap, pad, el('p', 'pick-label', solved ? '4 7 1 9 문은 열린 채다' : d.code ? `누른 번호 ${d.code.split('').join(' ')}` : '아직 아무것도 안 눌렀다'));
        return box;
      },
      commitLabel: '손잡이 돌리기',
      canCommit: (d) => d.code.length > 0,
      check(d) {
        const ok = d.code === '4719';
        d.code = '';
        return ok ? { ok: true } : { ok: false, msg: '삑삑삑 손잡이가 돌지 않는다' };
      },
      reveal: {
        title: '4719',
        text: '딸깍 4719 선배 사번이다',
        scene: ['문 안쪽 ON AIR 스위치 줄에 전기 타이머를 뜯어 고친 상자가 물려 있다 선배 글씨로 「깜빡이」 플러그를 뽑자 불이 켜진 채로 멎었다'],
        unlock: 'studioB',
      },
    },

    tapdoor: {
      title: '보관실 뒷문',
      scene: 'studioB',
      intro: '흡음판 옆 좁은 문 손잡이 옆에 선배 글씨로 「두드려」라고 적힌 버저 상자가 물려 있다 짧게, 길게 누른 대로 종이띠에 찍힌다 다 두드리면 손잡이를 당긴다',
      docs: ['cue', 'auto', 'zine'],
      hintCode: 'R-S02',
      hints: [
        '헤드폰 속 말은 마디마다 따로 오려 붙인 것이다 붙인 순서를 의심해 보자',
        '곡 길이는 그 곡이 시작한 때부터 다음 것이 시작한 때까지 두드리는 법은 로비 사보에 있다',
      ],
      initial: () => ({ taps: '' }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const solved = S.solved.includes('tapdoor');
        const box = el('div', 'buzzbox');
        box.append(el('p', 'buzz-tape', '두드려'));
        const strip = el('div', 'tap-strip'); strip.setAttribute('aria-label', d.taps ? `종이띠 ${d.taps.length}칸` : '종이띠 비어 있음');
        const groups = d.taps.match(/.{1,5}/g) || [];
        if (!groups.length) strip.append(el('span', 'tap-empty', '종이띠가 비어 있다'));
        groups.forEach((g) => { const s = el('span', 'tap-group'); s.textContent = g.replace(/\./g, '●').replace(/-/g, '━'); strip.append(s); });
        box.append(strip);
        const row = el('div', 'buzz-row');
        const add = (c) => { if (solved || d.taps.length >= 30) return; d.taps += c; save(); };
        const short = el('button', 'buzz-key short', '짧게'); short.type = 'button'; short.setAttribute('aria-label', '버저 짧게 누르기'); short.onclick = () => add('.');
        const long = el('button', 'buzz-key long', '길게'); long.type = 'button'; long.setAttribute('aria-label', '버저 길게 누르기'); long.onclick = () => add('-');
        const back = el('button', 'chip', '한 칸 지우기'); back.type = 'button'; back.onclick = () => { if (solved) return; d.taps = d.taps.slice(0, -1); save(); };
        const clear = el('button', 'chip', '종이띠 새로'); clear.type = 'button'; clear.onclick = () => { if (solved) return; d.taps = ''; save(); };
        row.append(short, long);
        const row2 = el('div', 'pick-row buzz-row2'); row2.append(back, clear);
        box.append(row, row2);
        const wrap = el('div', 'mail-wrap'); wrap.append(box, el('p', 'pick-label', solved ? '뒷문은 열려 있다' : d.taps ? `${d.taps.length}번 두드렸다 종이띠는 다섯 칸마다 끊어 찍힌다` : '버저를 누르면 종이띠에 점과 줄이 찍힌다'));
        return wrap;
      },
      commitLabel: '손잡이 당기기',
      canCommit: (d) => d.taps.length > 0,
      check(d) {
        if (TAP_OK.includes(d.taps)) return { ok: true };
        return { ok: false, msg: '상자 안에서 딸깍 소리만 나고 손잡이는 그대로다' };
      },
      reveal: {
        title: '5분 14초',
        text: '마지막 칸을 길게 누르자 상자 속에서 계전기가 붙는 소리가 났다 뒷문이 안쪽으로 밀려 열렸다',
        scene: ['종이띠 끝에 연필로 작게 「잘했어」 내가 두드리기 전부터 적혀 있던 글씨다'],
        unlock: 'archive',
      },
    },

    reel: {
      title: '폐국 전 마지막 주 테이프',
      scene: 'archive',
      intro: '폐국 전 마지막 주 테이프가 한 칸에 모여 있다 열두 통 상자를 누르면 반쯤 빼 든다 다른 상자를 누르면 바꿔 든다',
      docs: ['enote', 'sched', 'rules'],
      hintCode: 'R-S03',
      hints: [
        '라벨 셋, 날짜와 방과 시각을 하나씩 따로 따진다 날짜는 보관 규칙에서 먼저',
        '그 주에 B실에서 무엇이 빠져나갔는지, 1시 58분은 몇 시에 시작한 테이프 안인지',
      ],
      initial: () => ({ pick: null, miss: null }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const solved = S.solved.includes('reel');
        const wrap = el('div', 'prop shelfphoto');
        wrap.innerHTML = `<img src="${P}props/shelf.webp" alt="테이프 상자 열두 통이 꽂힌 선반" decoding="async">`;
        SHELF.forEach((row, r) => row.forEach((lab, c) => {
          const id = `${r}-${c}`;
          if (solved && id === REEL_OK) return;
          const b = el('button', 'reel-box' + (d.pick === id && !solved ? ' picking' : '')); b.type = 'button';
          b.style.left = SH_X[c] + '%'; b.style.top = SH_Y[r] + '%';
          b.setAttribute('aria-label', `${lab} 테이프`); b.innerHTML = `<span>${lab.slice(0, 6)}<br>${lab.slice(7)}</span>`;
          b.onclick = () => { if (solved) return; d.pick = d.pick === id ? null : id; d.miss = null; save(); };
          wrap.append(b);
        }));
        // 모바일: 상자 라벨 글씨가 작아서 같은 라벨을 큰 버튼으로 한 번 더
        const mob = el('div', 'mobile-only reel-chips');
        SHELF.forEach((row, r) => row.forEach((lb, c) => { const id = `${r}-${c}`; if (solved && id === REEL_OK) { mob.append(el('span', 'reel-chip empty', '빈 칸')); return; } const b = el('button', 'chip reel-chip' + (d.pick === id && !solved ? ' on' : ''), lb); b.type = 'button'; b.setAttribute('aria-label', `${lb} 상자 고르기`); b.onclick = () => { if (solved) return; d.pick = d.pick === id ? null : id; d.miss = null; save(); }; mob.append(b); }));
        const lab = d.pick ? SHELF[d.pick[0]][d.pick[2]] : null;
        const line = solved ? '그 칸은 비었다 상자는 내 품에 있다' : d.miss ? `${d.miss} 상자는 아니었다 도로 꽂았다${lab ? ` · 지금 든 것 ${lab}` : ''}` : lab ? `${lab} 상자를 반쯤 빼 들었다` : '한 통을 골라 반쯤 빼 든다';
        const box = el('div', 'mail-wrap'); box.append(wrap, mob, el('p', 'pick-label', line));
        return box;
      },
      commitLabel: '이 상자 열어 보기',
      canCommit: (d) => !!d.pick,
      check(d) {
        if (d.pick === REEL_OK) return { ok: true };
        d.miss = SHELF[d.pick[0]][d.pick[2]]; d.pick = null;
        return { ok: false, msg: '상자를 열어 봤다 찾던 테이프가 아니다' };
      },
      reveal: {
        title: '241030 A 01',
        text: '상자 안 릴에 내 글씨 메모가 붙어 있다 「마지막 날 2부」 폐국 날 새벽 이 테이프를 여기 넣은 게 나였다는 걸 잊고 있었다',
        scene: ['상자를 안고 돌아서는데 책상 스탠드가 한 번 깜빡였다 안쪽 계단 위로 A실 뒷문이 보인다'],
        unlock: 'studioA',
      },
    },

    deck: {
      title: '릴 테이프 데크',
      scene: 'studioA',
      intro: '테이프를 걸었다 처음부터 틀면 한 시간이다 삭은 테이프라 오래 돌리기가 겁나서, 한 번 재생하면 5초만 돌고 서게 해 뒀다 송신이 끊긴 순간이 그 5초 안에 들어오게 ▲ ▼로 카운터를 한 자리씩 맞추고 재생한다',
      docs: ['txlog', 'rules', 'enote'],
      hintCode: 'R-S04',
      hints: [
        '카운터 00:00은 테이프 맨 처음이고, 테이프 맨 처음은 정시가 아니다',
        '녹음기는 정시보다 먼저 돌기 시작한다 얼마나 먼저인지 적힌 종이가 있다 기록지의 시각을 테이프 안의 자리로 바꿔 보자',
      ],
      initial: () => ({ v: [0, 0, 0, 0] }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const solved = S.solved.includes('deck');
        const MAX = [5, 9, 5, 9]; // 분·초 십의 자리는 0~5
        d.v = d.v.map((n, i) => Math.min(n, MAX[i]));
        const wrap = el('div', 'prop deckphoto');
        wrap.innerHTML = `<img src="${P}props/deck.webp" alt="릴 테이프 데크 앞면 카운터 창과 재생 버튼" decoding="async"><div class="deck-counter">${d.v[0]}${d.v[1]}:${d.v[2]}${d.v[3]}</div>`;
        const wheels = el('div', 'counter-wheels');
        ['분 십의 자리', '분 일의 자리', '초 십의 자리', '초 일의 자리'].forEach((lab, i) => {
          const col = el('div', 'cw');
          const up = el('button', 'ctl', '▲'); up.type = 'button'; up.setAttribute('aria-label', lab + ' 올리기'); up.onclick = () => { if (solved) return; d.v[i] = (d.v[i] + 1) % (MAX[i] + 1); save(); };
          const dn = el('button', 'ctl', '▼'); dn.type = 'button'; dn.setAttribute('aria-label', lab + ' 내리기'); dn.onclick = () => { if (solved) return; d.v[i] = (d.v[i] + MAX[i]) % (MAX[i] + 1); save(); };
          col.append(up, el('b', 'cw-num', String(d.v[i])), dn);
          wheels.append(col);
          if (i === 1) wheels.append(el('span', 'cw-colon', ':'));
        });
        const box = el('div', 'mail-wrap'); box.append(wrap, wheels);
        if (solved) box.append(el('p', 'pick-label', '테이프는 끝까지 돌고 멈췄다'));
        return box;
      },
      commitLabel: '거기까지 감고 재생',
      check(d) {
        const t = (d.v[0] * 10 + d.v[1]) * 60 + d.v[2] * 10 + d.v[3];
        const ok = t <= DECK_CUT && t >= DECK_CUT - DECK_WINDOW;
        return ok ? { ok: true } : { ok: false, msg: '감고 재생했다 그 순간이 아니다 다시 감는다' };
      },
      reveal: {
        title: '58:22',
        text: '5초 안에 그 자리가 지나갔다 거기서부터 끝까지 다시 틀었다 「오늘이 마지막」 그리고 송신이 끊긴 자리에서 2초 동안 아무 소리도 나지 않았다 테이프 잡음조차 그 다음 숨소리 선배는 꺼진 마이크에 대고 계속 말했다 40초',
        scene: ['선배 말이 끝나고도 테이프는 한참 조용히 돌았다 그때 주머니에서 휴대폰이 떨기 시작했다 건물 녹화기 알림이다'],
        unlockDoc: 'tape',
      },
    },

    cctv: {
      title: '녹화기 알림',
      scene: 'studioA',
      intro: '건물 녹화기가 휴대폰으로 보낸 움직임 알림 네 장 전부 오늘 밤 것인데 날짜 칸은 오래전에 나갔다 알림을 누르면 순서 번호가 붙고, 다시 누르면 빠진다 일어난 순서대로 붙여 이어 본다',
      docs: ['notes', 'mchat', 'guardlog'],
      hintCode: 'R-S05',
      hints: [
        '알림 시각만 믿으면 밤이 거꾸로 흐른다 사진 속 불빛을 보자',
        '열두 시에 무슨 불이 켜졌는지 내 수첩에 있다 그 불이 꺼져 있는 칸은 열두 시 전이다',
      ],
      initial: () => ({ order: [] }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const solved = S.solved.includes('cctv');
        const order = solved ? CAM_OK : d.order;
        const grid = el('div', 'cctv-grid');
        CAM_SHOW.forEach((k) => {
          const n = order.indexOf(k);
          const b = el('button', 'cctv-btn' + (n >= 0 ? ' on' : '')); b.type = 'button';
          b.setAttribute('aria-label', `${CAMS[k].cam} ${CAMS[k].t} 알림${n >= 0 ? ` (${n + 1}번째)` : ''}`);
          b.innerHTML = camFig(k) + (n >= 0 ? `<b class="cctv-no">${n + 1}</b>` : '');
          b.onclick = () => { if (solved) return; if (n >= 0) d.order.splice(n, 1); else d.order.push(k); save(); };
          grid.append(b);
        });
        const wrap = el('div', 'mail-wrap cctv-wrap'); wrap.append(el('p', 'cctv-head', 'MIRU 녹화기 · 움직임 감지 4건'), grid, el('p', 'pick-label', solved ? '01:59:30 이후 움직임 알림 없음' : d.order.length ? `${d.order.length}장에 번호를 붙였다` : '알림을 눌러 번호를 붙인다'));
        return wrap;
      },
      commitLabel: '이 순서로 이어 보기',
      canCommit: (d) => d.order.length === 4,
      check(d) {
        if (d.order.every((k, i) => k === CAM_OK[i])) return { ok: true };
        return { ok: false, msg: '화면이 지직거린다 이 순서로는 앞뒤가 이어지지 않는다' };
      },
      reveal: {
        title: '01:59 이후 움직임 없음',
        text: '알림을 이어 붙이자 한 사람이 밤새 이 건물을 돈 길이 됐다 내가 순찰 도는 사이 정문으로 들어와 B실, 지하 보관실, 그리고 A실 앞 대기실 벤치 마지막 알림 뒤로는 아무것도 없다',
        scene: ['A실 앞문은 대기실 쪽으로 나 있다 문 하나 사이다 숨을 죽이고 들어 봐도 너머에서는 아무 소리도 나지 않는다'],
        unlockDoc: 'cctvlog',
      },
    },

    patch: {
      title: '패치베이',
      scene: 'studioA',
      intro: '윗줄은 소리가 나오는 곳, 아랫줄은 소리가 들어갈 곳 출력을 누르고 입력을 누르면 케이블이 이어진다 꽂힌 입력을 다시 누르면 뽑힌다 케이블 둘은 내가 오기 전부터 꽂혀 있었다 남는 잭에 선이 더 꽂혀 있어도 송출은 된다 소리가 거기로도 갈 뿐이다',
      docs: ['wiring', 'enote', 'cctvlog'],
      hintCode: 'R-S06',
      hints: [
        '라벨은 2019년 그대로다 배선표 손글씨가 나중이다',
        '데크 소리가 닿아야 할 곳은 셋 송신, 녹음, 그리고 선배가 지금 듣고 있는 자리',
      ],
      initial: () => ({ cables: { 1: 7, 3: 7 }, sel: null }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const solved = S.solved.includes('patch');
        const wrap = el('div', 'prop patchphoto');
        const cy = (y) => (y * 688) / 1024;
        let svg = `<svg class="patch-cables" viewBox="0 0 100 ${cy(100)}" aria-hidden="true">`;
        Object.entries(d.cables).forEach(([inp, out]) => {
          const x1 = JX[out - 1], y1 = cy(JY_OUT), x2 = JX[inp - 1], y2 = cy(JY_IN);
          const col = out === 4 ? '#c8372d' : out === 7 ? '#d9a531' : '#3c6fb4';
          // 케이블이 라벨을 덮지 않게 잭 아래쪽으로 늘어뜨린다
          svg += `<path d="M${x1} ${y1} C${x1} ${y1 + 30}, ${x2} ${y2 + 14}, ${x2} ${y2}" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="1.6" stroke-linecap="round"/><path d="M${x1} ${y1} C${x1} ${y1 + 30}, ${x2} ${y2 + 14}, ${x2} ${y2}" fill="none" stroke="${col}" stroke-width="1" stroke-linecap="round" opacity=".92"/><circle cx="${x1}" cy="${y1}" r="1.5" fill="${col}"/><circle cx="${x2}" cy="${y2}" r="1.5" fill="${col}"/>`;
        });
        svg += '</svg>';
        wrap.innerHTML = `<img src="${P}props/patch.webp" alt="패치베이 윗줄 출력 여덟, 아랫줄 입력 여덟" decoding="async">${svg}${OUTS.map((o, i) => `<span class="pb-lab" style="left:${JX[i]}%;top:19.4%">${i + 1} ${o}</span>`).join('')}${INS.map((o, i) => `<span class="pb-lab" style="left:${JX[i]}%;top:55.4%">${i + 1} ${o}</span>`).join('')}`;
        const pickOut = (n) => { if (solved) return; d.sel = d.sel === n ? null : n; save(); };
        const pressIn = (n) => {
          if (solved) return;
          if (d.sel) { d.cables[n] = d.sel; d.sel = null; save(); return; }
          if (d.cables[n]) { delete d.cables[n]; save(); return; }
          ctx.status('먼저 윗줄 출력을 하나 고른다');
        };
        OUTS.forEach((o, i) => {
          const b = el('button', 'jack' + (d.sel === i + 1 ? ' picking' : '')); b.type = 'button'; b.style.left = JX[i] + '%'; b.style.top = JY_OUT + '%';
          b.setAttribute('aria-label', `출력 ${i + 1} ${o}`);
          b.onclick = () => pickOut(i + 1);
          wrap.append(b);
        });
        INS.forEach((o, i) => {
          const n = i + 1;
          const b = el('button', 'jack in' + (d.cables[n] ? ' plugged' : '')); b.type = 'button'; b.style.left = JX[i] + '%'; b.style.top = JY_IN + '%';
          b.setAttribute('aria-label', `입력 ${n} ${o}${d.cables[n] ? ` 출력 ${d.cables[n]}에서 꽂힘` : ''}`);
          b.onclick = () => pressIn(n);
          wrap.append(b);
        });
        const list = Object.entries(d.cables).sort((a, b) => a[0] - b[0]).map(([i, o]) => `${o} ${OUTS[o - 1]} → ${i} ${INS[i - 1]}`).join(' · ');
        // 모바일: 사진 라벨이 작아서 이름 붙은 큰 버튼을 따로 둔다
        const mob = el('div', 'mobile-only pb-rows');
        const rowO = el('div', 'pb-row'); rowO.append(el('span', 'pb-row-lab', '윗줄 출력 (나오는 곳)'));
        OUTS.forEach((o, i) => { const b = el('button', 'chip pb-chip' + (d.sel === i + 1 ? ' on' : '')); b.type = 'button'; b.innerHTML = `<b>${i + 1}</b><small>${o}</small>`; b.setAttribute('aria-label', `출력 ${i + 1} ${o} 고르기`); b.onclick = () => pickOut(i + 1); rowO.append(b); });
        const rowI = el('div', 'pb-row'); rowI.append(el('span', 'pb-row-lab', '아랫줄 입력 (들어갈 곳)'));
        INS.forEach((o, i) => { const n = i + 1; const b = el('button', 'chip pb-chip' + (d.cables[n] ? ' on' : '')); b.type = 'button'; b.innerHTML = `<b>${n}</b><small>${o}</small>${d.cables[n] ? `<i>← ${d.cables[n]}</i>` : ''}`; b.setAttribute('aria-label', `입력 ${n} ${o} 누르기`); b.onclick = () => pressIn(n); rowI.append(b); });
        mob.append(rowO, rowI);
        const box = el('div', 'mail-wrap'); box.append(wrap, mob, el('p', 'pick-label', (d.sel ? `출력 ${d.sel} ${OUTS[d.sel - 1]}에 케이블을 꽂았다 이을 입력을 누른다 · ` : '') + (list ? `꽂힌 케이블 ${list}` : '꽂힌 케이블 없음')));
        return box;
      },
      commitLabel: '송출 시작',
      check(d) {
        return patchOk(d.cables) ? { ok: true } : { ok: false, msg: '송출 버튼을 눌렀다가 바로 뗐다 이대로는 아니다' };
      },
      reveal: {
        title: '송출',
        text: '테이프가 돈다 예비 송신기 계기판 바늘이 올라온다 녹음기 빨간 불이 들어온다 2년 전 1시 58분 12초, 그 뒤가 처음으로 나간다',
        scene: ['문 너머 대기실 스피커에서 같은 소리가 반 박자 늦게 울린다 그 사이로 누가 아주 작게 따라 말하는 소리'],
        ending: true,
        endingLabel: 'A실 앞문 열기',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: 'A실 앞 대기실 벤치에 눈을 감고 앉은 백발의 여자, ON AIR 불 아래 열린 A실 문 앞에 선 남자',
    eyebrow: '2026년 10월 31일 토요일, 새벽 2시 41분',
    title: '1시 58분 그 뒤',
    paragraphs: [
      'A실 앞문을 열었다 대기실 스피커에서 선배 목소리가 나오고 있었다 2년 전 그 방의 공기째로 “오늘이 마지막 방송입니다 열다섯 해 동안 새벽 두 시까지 깨어 있어 준 여러분, 반죽 치대던 분, 병동 불 끄고 돌던 분, 빈 차로 한 바퀴 더 돌던 분 다 고마웠어요”',
      '“마이크가 꺼진 것 같네요 괜찮아요 하람 씨 손 떨지 마요 다음에 또 만나요는 못 하겠고, 잘 자요 새벽 두 시, 미루였습니다”',
      'A실 앞 대기실은 로비를 줄여 놓은 것 같은 좁은 방이다 나무 벽에 벽 스피커 하나, 긴 벤치, 철거 때 내놓은 상자들 그 벤치에 선배가 앉아 있었다 녹화기 마지막 알림 그 자리 그대로 눈을 감고 스피커 쪽으로 고개를 기울이고 있었다 내가 로비에서 깜빡이는 불을 올려다볼 때부터 선배는 여기 있었다 A실에서 테이프를 감는 내내 문 하나 너머에서',
      'B실 번호가 바뀐 10월 3일부터 선배는 밤마다 옛 카드로 이 건물에 들어와 옛 방송을 오려 붙였다 깜빡이도, 버저 상자도, 큐 채널의 거꾸로 붙인 말도 다 나만 풀 수 있게 만든 것이었다 마지막 인사만은 2년 전 송신기를 내린 그 손으로 내보내게',
      '만석이 형 문자가 왔다 「들었다」 「끝까지」',
      '선배가 휴대폰에 뭔가 써서 내밀었다 「손 안 떨었네」',
    ],
    afterword: '11월 10일 보관실 테이프는 모두 폐기됐다 241030 A 01 한 통만 빼고 그 테이프는 지금 선배 집 라디오 옆에 있다 이번엔 녹음도 했으니까 두 통이다',
    unlockDoc: 'final',
    next: { href: 'index.html#cases', title: '테마 로비', label: '테마 로비로 →', line: '다른 이야기는 테마 로비에서 고를 수 있습니다' },
  },
};
