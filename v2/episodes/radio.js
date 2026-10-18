// 끝나지 않은 방송 — ★5 안내 없음, 힌트 2단계(정답 없음), 오답은 장치마다 한 줄 중립 문구
// 2년 전 폐국 날 1시 58분, 송신기를 내린 건 나였다 그 뒤에도 녹음기는 돌았다
// 손동작: 도어락 번호 누르기 → 선반에서 테이프 한 통 꺼내기 → 카운터 숫자 바퀴 맞추기 → 패치 케이블 꽂기
const P = 'assets/v2/radio/';

// ON AIR 깜빡임: 4719를 반복, 휴대폰 기록은 「1」부터 찍혀서 처음부터 읽으면 1947로 보인다
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
  const total = t + 3, W = 80;
  // 줄은 숫자 사이에서만 바꾼다 (한 숫자가 두 줄로 갈라지지 않게)
  const digits = [];
  marks.forEach(([s, w], i) => { if (i % 5 === 0) digits.push([]); digits[digits.length - 1].push([s, w]); });
  const rows = [];
  let row = { s: 0, m: [] };
  digits.forEach((dg) => { const e = dg[dg.length - 1][0] + dg[dg.length - 1][1]; if (e > row.s + W) { rows.push(row); row = { s: dg[0][0] - 1.5, m: [] }; } row.m.push(...dg); });
  rows.push(row);
  const U = 0.3; // 초
  return rows.map((r, ri) => {
    const end = ri === rows.length - 1 ? total : rows[ri + 1].s;
    const len = end - r.s;
    let s = `<svg viewBox="0 0 ${W} 9" class="blink-svg" role="img" aria-label="${ri + 1}번째 줄 깜빡임 ${r.m.length}번">`;
    s += `<rect x="0" y="0" width="${len}" height="6" rx=".4" fill="#160d0d"/>`;
    r.m.forEach(([x, w]) => { s += `<rect x="${x - r.s}" y="1.6" width="${w}" height="2.8" rx=".3" fill="#ff5545"/>`; });
    for (let k = Math.ceil((r.s + 1) / 10) * 10; k <= end - 2; k += 10) s += `<line x1="${k - r.s}" y1="6" x2="${k - r.s}" y2="6.9" stroke="#8a7f7a" stroke-width=".15"/><text x="${k - r.s}" y="8.6" font-size="1.5" text-anchor="middle" fill="#8a7f7a" font-family="SUIT, sans-serif">${(k * U).toFixed(0)}초</text>`;
    return s + '</svg>';
  }).join('');
}

// 보관실 선반 3줄 × 4 (사진 좌표 %)
const SHELF = [
  ['241027 B 00', '241027 B 01', '241027 B 02', '241028 A 00'],
  ['241028 A 01', '241028 B 02', '241029 A 00', '241029 A 01'],
  ['241029 B 02', '241030 A 00', '241030 A 01', '241030 A 02'],
];
const SH_X = [22.0, 40.5, 58.6, 77.2], SH_Y = [15.5, 49.0, 82.0];

// 패치베이 (사진 좌표 %)
const JX = [13.5, 23.8, 34.2, 44.6, 55.0, 65.4, 75.8, 86.2], JY_OUT = 33.5, JY_IN = 69.5;
const OUTS = ['MIC A', 'MIC B', 'TAPE A', 'TAPE B', 'PGM A', 'PGM B', 'AUTO PC', 'TONE'];
const INS = ['TX MAIN', 'TX 예비', 'MON 로비', 'REC A', 'REC B', 'CON A1', 'CON A2', 'AUTO IN'];
const PATCH_ANSWER = '1:4,3:4,5:4'; // 입력:출력

const KEYS = [['1', 41.0, 23.5], ['2', 46.8, 23.5], ['3', 52.6, 23.5], ['4', 41.0, 31.7], ['5', 46.8, 31.7], ['6', 52.6, 31.7], ['7', 41.0, 40.0], ['8', 46.8, 40.0], ['9', 52.6, 40.0], ['*', 41.0, 48.3], ['0', 46.8, 48.3]];

export default {
  id: 'radio',
  number: '003',
  title: '끝나지 않은 방송',
  subtitle: '꺼진 마이크의 새벽 두 시',
  genre: '방송 미스터리 · 송출 추적',
  minutes: 40,
  difficulty: 5,
  cover: P + 'lobby.webp',
  coverAlt: '불 꺼진 옛 방송국 로비, 스튜디오 문 위 ON AIR 불만 붉게 켜져 있다',
  music: 'assets/music/radio-v33.mp3',
  tagline: '2년 전 문을 닫은 방송국에서\n새벽 열두 시, 그 목소리가 다시 나갔다',
  blurb: '폐국 날 송신기를 내린 엔지니어가 철거를 앞둔 건물의 밤을 지킵니다\n오늘 밤 로비 스피커에서 「새벽 두 시, 미루」가 흘러나왔습니다',
  storageKey: 'mihaeje-v2-radio',
  hintTitle: '내 옛 수첩',
  tracesLabel: '끊긴 방송의 뒤',

  opening: {
    eyebrow: '2026년 10월 31일 토요일, 새벽 2시',
    paragraphs: [
      '미루FM은 2년 전 오늘 새벽 1시 58분에 문을 닫았다 송신기를 내린 건 나였다 위에서 시킨 시각에 맞춰서 은수 선배가 마지막 인사를 막 시작한 참이었다',
      '건물은 다음 달 헐린다 철거 전까지 밤에 건물을 지키는 일을 내가 맡았다 아는 건물이라서',
      '오늘 밤 열두 시, 로비 모니터 스피커에서 「새벽 두 시, 미루」 시그널이 흘러나왔다 은수 선배 목소리였다 그리고 1시 58분, 방송이 뚝 끊겼다 2년 전 그 자리에서 B실 문 위 ON AIR 불은 아직 켜진 채 깜빡인다',
    ],
    cta: 'ON AIR 불빛 쪽으로',
  },

  traces: [
    { device: 'keypad', label: 'B실 문' },
    { device: 'reel', label: '그날의 테이프' },
    { device: 'deck', label: '1시 58분 그 뒤' },
    { device: 'patch', label: '다시 송출' },
  ],

  scenes: [
    {
      id: 'lobby',
      name: '로비',
      image: P + 'lobby.webp',
      arrive: '불 꺼진 로비 B실 문 위 ON AIR 불만 깜빡인다 일정하지 않다 길게, 짧게, 한참 쉬었다가 다시',
      hotspots: [
        { id: 'mchat', x: 7, y: 88, label: '만석 형 문자', kind: 'doc', doc: 'mchat' },
        { id: 'notes', x: 13, y: 12, label: '모니터 스피커 받아쓰기', kind: 'doc', doc: 'notes' },
        { id: 'blink', x: 37, y: 20, label: '깜빡이는 ON AIR', kind: 'doc', doc: 'blink' },
        { id: 'zine', x: 17, y: 34, label: '벽에 걸린 옛 사보', kind: 'doc', doc: 'zine' },
        { id: 'guardlog', x: 52, y: 47, label: '안내 데스크 관리 일지', kind: 'doc', doc: 'guardlog' },
        { id: 'notice', x: 92, y: 36, label: '유리문의 철거 공지', kind: 'doc', doc: 'notice' },
        { id: 'keypad', x: 41, y: 46, label: 'B실 도어락', kind: 'device', device: 'keypad' },
      ],
    },
    {
      id: 'studioB',
      name: 'B실',
      image: P + 'studioB.webp',
      unlockedBy: 'keypad',
      arrive: 'B실 콘솔 자리는 비어 있다 먼지 자국만 네모나게 남았다 ON AIR 스위치엔 전기 타이머를 뜯어 고친 상자가 물려 있다 선배 글씨로 「깜빡이」 플러그를 뽑자 불이 켜진 채로 멎었다 오른쪽 모니터 하나만 켜져 있고, 재생 목록 맨 아래 줄이 빨갛다',
      hotspots: [
        { id: 'auto', x: 90, y: 42, label: '자동 송출 PC 화면', kind: 'doc', doc: 'auto' },
        { id: 'enote', x: 96, y: 62, label: '모니터에 붙은 쪽지', kind: 'doc', doc: 'enote' },
        { id: 'sched', x: 8, y: 26, label: '벽의 편성 변경 알림', kind: 'doc', doc: 'sched' },
      ],
    },
    {
      id: 'archive',
      name: '보관실',
      image: P + 'archive.webp',
      unlockedBy: 'keypad',
      arrive: 'B실 뒷문으로 이어진 보관실 테이프 상자가 천장까지 쌓였다 다음 달 10일에 전부 폐기된다 책상 위 스탠드만 켜져 있다',
      hotspots: [
        { id: 'rules', x: 13, y: 52, label: '책상 위 보관 규칙', kind: 'doc', doc: 'rules' },
        { id: 'reel', x: 62, y: 46, label: '폐국 전 마지막 주 테이프', kind: 'device', device: 'reel' },
      ],
    },
    {
      id: 'studioA',
      name: 'A실',
      image: P + 'studioA.webp',
      unlockedBy: 'reel',
      arrive: '테이프 상자를 안고 A실로 왔다 그날 밤 선배가 앉았던 방 콘솔도 데크도 그대로다 랙 위쪽에 패치베이',
      hotspots: [
        { id: 'deck', x: 14, y: 40, label: '릴 테이프 데크', kind: 'device', device: 'deck' },
        { id: 'txlog', x: 42, y: 54, label: '콘솔 위 송출 기록지', kind: 'doc', doc: 'txlog' },
        { id: 'wiring', x: 90, y: 45, label: '랙 옆 배선표', kind: 'doc', doc: 'wiring' },
        { id: 'patch', x: 88, y: 15, label: '패치베이', kind: 'device', device: 'patch', visible: (S) => S.solved.includes('deck') },
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
      html: `<blockquote class="hand">00:00 시그널 「새벽 두 시, 미루」 선배 목소리<br>사연 셋 다 예전에 읽었던 거 (제빵사 아저씨, 야간 병동 간호사, 만석이 형)<br>문장마다 목소리 결이 조금씩 다르다 녹음한 해가 다른 것처럼 숨 쉬는 자리가 어색하게 끊긴다<br>신청곡 둘<br>01:57 「오늘이 마지막」까지 하고 끊김<br>2년 전이랑 같은 자리<br>그 뒤로 ON AIR가 깜빡이기 시작</blockquote>`,
    },
    blink: {
      title: '깜빡이는 ON AIR',
      kind: '휴대폰으로 찍은 것 · 깜빡이기 시작하고 조금 뒤부터',
      html: `<p>찍은 영상을 한 칸씩 넘기며 불이 켜진 동안을 막대로 옮겼다 빨간 막대가 켜진 시간이다</p><figure class="blinkfig">${blinkSvg()}</figure><p>찍는 내내 같은 박자가 되풀이됐다 내가 찍기 전에도 그랬을 것이다</p>`,
    },
    zine: {
      title: '벽에 걸린 옛 사보',
      kind: '미루FM 사보 2011년 봄호',
      html: `<div class="zine"><p class="zine-head">유리창 너머의 모스 부호</p><p>새벽 두 시 진행자 백은수 씨와 기술 정하람 씨는 방송 중에 말을 주고받을 수 없다 둘은 부조정실 ON AIR 스위치로 모스 부호를 보낸다 「곡 2분 남음」 「커피」 같은 것들</p><p>은수 씨는 신호 하나를 다 보내면 꼭 한참 쉬었다가 처음부터 다시 보낸다 정하람 씨는 "선배는 쉼표가 길다"고 했다</p><table class="morse-table"><tr><th colspan="5">숫자 모스 부호 · 중계소 식별용</th></tr>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<tr><td>${n}</td><td class="mc">${MORSE[n].replace(/\./g, '●').replace(/-/g, '━')}</td></tr>`).join('')}</table><p class="zine-foot">● 짧게 · ━ 길게 (짧은 것의 세 배)</p></div>`,
    },
    guardlog: {
      title: '안내 데스크 관리 일지',
      kind: '낮 근무 박 씨',
      html: `<div class="paper-table"><p class="pt-head">관리 일지</p><table><tr><th>10/3</th><td>B실 도어락 비번 누가 바꿈 관리실 비번으로 안 열림 업체에 문의 예정</td></tr><tr><th>10/17</th><td>보관실 테이프 11/10 일괄 폐기 그 전에 가져갈 사람은 연락</td></tr><tr><th>10/29</th><td>새벽에 B실 쪽 불 켜져 있었다는 말 있음 확인 못 함</td></tr><tr><th>10/20</th><td>철거 11/15 시작 확정</td></tr></table></div>`,
    },
    notice: {
      title: '유리문의 철거 공지',
      kind: '시공사',
      html: `<div class="paper-table"><p class="pt-head">철거 안내</p><table><tr><th>대상</th><td>옛 미루FM 사옥 (2024년 10월 31일 폐국)</td></tr><tr><th>기간</th><td>2026년 11월 15일 (일)부터</td></tr><tr><th>야간</th><td>경비 1명 상주</td></tr></table><p class="pt-foot">남은 물품은 11월 10일 (화)까지 반출</p></div>`,
    },
    auto: {
      title: '자동 송출 PC 화면',
      kind: 'B실',
      html: `<div class="term-screen auto"><p class="term-line">MIRU AUTO · 예약 재생 목록</p><p class="term-sub">예약 2026-10-31 00:00 한 번 · 등록 2026-10-29 03:12 · 사용자 eunsoo</p><table class="term-table"><tr><th>시각</th><th>파일</th></tr>${[
        ['00:00:00', '시그널_새벽두시'], ['00:00:14', '오프닝_2009-03-02'], ['00:04:40', '사연_제빵사_2013-11-20'], ['00:21:05', '신청곡소개_2017-06-11'], ['00:47:30', '사연_간호사_2019-02-27'], ['01:12:18', '신청곡소개_2011-09-30'], ['01:31:02', '사연_택시_2015-01-08'], ['01:52:30', '클로징음악'], ['01:57:44', '마지막방송_2024-10-31_조각'],
      ].map(([t, f]) => `<tr><td>${t}</td><td>${f}</td></tr>`).join('')}<tr class="term-err"><td>01:58:12</td><td>마지막인사 · 파일 없음 · 송출 정지</td></tr></table></div>`,
    },
    enote: {
      title: '모니터에 붙은 쪽지',
      kind: '선배 글씨',
      html: `<blockquote class="hand">하람아<br>목소리가 이제 잘 안 나와서 옛날 내 말을 오려 붙였다<br>마지막 인사만은 못 만들겠더라 방송에 나간 적이 없으니까<br>근데 한 번은 했지 그날 네가 송신기 내리고 나서도 녹음기는 돌았잖아<br>보관실 버리기 전에 찾아서 내보내 줘 이번엔 녹음도 하고<br>다 되면 로비 스피커로 들을게</blockquote>`,
    },
    sched: {
      title: '벽의 편성 변경 알림',
      kind: '편성팀 · 2024년 10월',
      html: `<div class="paper-table"><p class="pt-head">편성 변경 알림</p><table><tr><th>10월 28일 (월) 밤 방송부터</th><td>「새벽 두 시, 미루」 A실 진행</td></tr><tr><th>B실</th><td>콘솔 매각 반출 자동 송출 PC만 남김 (새벽 2시~5시 재방송)</td></tr></table><p class="pt-foot">폐국까지 남은 사흘 협조 부탁드립니다</p></div>`,
    },
    rules: {
      title: '책상 위 보관 규칙',
      kind: '보관실',
      html: `<div class="paper-table"><p class="pt-head">녹음 테이프 보관 규칙</p><table><tr><th>1</th><td>라벨은 방송일 · 스튜디오 · 시작 시각 (예 241015 A 07)</td></tr><tr><th>2</th><td>방송일은 새벽 5시에 넘어간다</td></tr><tr><th>3</th><td>녹음은 정시 10초 전부터 한 시간에 한 통</td></tr><tr><th>4</th><td>데크 카운터는 테이프 맨 처음이 00:00</td></tr></table></div>`,
    },
    txlog: {
      title: '콘솔 위 송출 기록지',
      kind: 'A실 · 2024-10-31 (목)',
      html: `<div class="paper-table"><p class="pt-head">송출 기록</p><table><tr><th>00:00:00</th><td>「새벽 두 시, 미루」 A실</td></tr><tr><th>01:00:00</th><td>2부</td></tr><tr><th>01:58:12</th><td>TX OFF (수동) 지시 경영지원팀 <span class="hand-note">— 정하람</span></td></tr><tr><th>02:00:00</th><td>폐국</td></tr></table><p class="pt-foot"><span class="hand-note">REC는 못 껐다</span></p></div>`,
    },
    wiring: {
      title: '랙 옆 배선표',
      kind: 'A실 패치베이 · 2019 개정',
      html: `<div class="paper-table wiring"><p class="pt-head">패치베이 배선표</p><table><tr><th>윗줄 출력</th><td>${OUTS.map((o, i) => `<span class="nw jack-tag">${i + 1} ${o}</span>`).join(' ')}</td></tr><tr><th>아랫줄 입력</th><td>${INS.map((o, i) => `<span class="nw jack-tag">${i + 1} ${o}</span>`).join(' ')}</td></tr></table><p class="hand-note">10/28 A실 데크 고장 반출 B실 데크 들여옴 B실 쓰던 선째로 꽂아서 데크는 출력 4 (라벨 안 바꿈)</p><p class="hand-note">10/29 REC A 접촉 불량 녹음은 REC B로</p><p class="hand-note">10/31 02:10 TX MAIN 철거</p><p class="hand-note">예비 송신기 선 입력 1로 옮김 (예비는 철거 보류) — 하람</p></div>`,
    },
    final: {
      title: '선배의 문자',
      kind: '2026년 10월 31일 새벽 3시',
      locked: true,
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>은수 선배</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 10월 31일 토요일</div>
<div class="chat-row them"><span class="chat-avatar">은</span><div class="chat-col"><span class="chat-name">은수 선배</span><div class="chat-bubble">하람아</div><div class="chat-bubble">그날 니가 내린 거 니 맘대로 한 거 아닌 거 나 알아</div><div class="chat-bubble">근데 니가 이 년 내내 미안해할까 봐 그게 더 걸렸어</div><div class="chat-bubble">이제 됐다 테이프는 내가 가져간다</div></div><span class="chat-time">오전 3:04</span></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 3:06</span><div class="chat-bubble">네 선배<br>잘 자요</div></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
  },

  devices: {
    keypad: {
      title: 'B실 도어락',
      scene: 'lobby',
      intro: '관리실 비번으로는 안 열린다 누가 바꿨다',
      docs: ['blink', 'zine', 'guardlog'],
      hintCode: 'R-S01',
      hints: [
        '선배랑 나는 ON AIR 스위치로 말을 했다 사보에 그 표가 있다',
        '휴대폰은 중간부터 찍었다 선배가 한참 쉬는 데가 한 바퀴의 끝이다',
      ],
      initial: () => ({ code: '' }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop keyphoto');
        wrap.innerHTML = `<img src="${P}props/keypad.webp" alt="B실 문의 숫자 도어락" decoding="async"><i class="kp-led${d.code.length ? ' on' : ''}"></i>`;
        KEYS.forEach(([k, x, y]) => {
          const b = el('button', 'kp-key'); b.type = 'button'; b.style.left = x + '%'; b.style.top = y + '%';
          b.setAttribute('aria-label', k === '*' ? '별표 지우기' : `${k} 누르기`);
          b.onclick = () => { if (k === '*') d.code = ''; else if (d.code.length < 8) d.code += k; save(); };
          wrap.append(b);
        });
        const box = el('div', 'mail-wrap'); box.append(wrap, el('p', 'pick-label', d.code ? `누른 번호 ${d.code.split('').join(' ')}` : '아직 아무것도 안 눌렀다 · 별표는 지우기'));
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
        scene: ['문 안쪽 ON AIR 스위치 줄이 웬 상자에 물려 있다'],
        unlock: 'studioB',
      },
    },

    reel: {
      title: '폐국 전 마지막 주 테이프',
      scene: 'archive',
      intro: '폐국 전 마지막 주 테이프가 한 칸에 모여 있다 열두 통',
      docs: ['enote', 'sched', 'rules'],
      hintCode: 'R-S02',
      hints: [
        '라벨 날짜는 달력이 아니다 보관 규칙 둘째 줄',
        '그 주에 프로그램이 어느 방으로 옮겼는지, 1시 58분이 몇 시 테이프에 들어 있는지',
      ],
      initial: () => ({ pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop shelfphoto');
        wrap.innerHTML = `<img src="${P}props/shelf.webp" alt="테이프 상자 열두 통이 꽂힌 선반" decoding="async">`;
        SHELF.forEach((row, r) => row.forEach((lab, c) => {
          const id = `${r}-${c}`;
          const b = el('button', 'reel-box' + (d.pick === id ? ' picking' : '')); b.type = 'button';
          b.style.left = SH_X[c] + '%'; b.style.top = SH_Y[r] + '%';
          b.setAttribute('aria-label', `${lab} 테이프`); b.innerHTML = `<span>${lab.slice(0, 6)}<br>${lab.slice(7)}</span>`;
          b.onclick = () => { d.pick = d.pick === id ? null : id; save(); };
          wrap.append(b);
        }));
        const lab = d.pick ? SHELF[d.pick[0]][d.pick[2]] : null;
        const box = el('div', 'mail-wrap'); box.append(wrap, el('p', 'pick-label', lab ? `${lab} 상자를 반쯤 빼 들었다` : '한 통을 골라 반쯤 빼 든다'));
        return box;
      },
      commitLabel: '이 테이프 들고 A실로',
      canCommit: (d) => !!d.pick,
      check(d) {
        if (d.pick === '2-2') return { ok: true };
        return { ok: false, msg: '상자를 열어 릴에 붙은 메모를 보니 그날이 아니다 도로 꽂았다' };
      },
      reveal: {
        title: '241030 A 01',
        text: '상자 안 릴에 내 글씨 메모가 붙어 있다 「마지막 날 2부」 이 테이프를 그날 내가 여기 넣었다는 걸 잊고 있었다',
        unlock: 'studioA',
      },
    },

    deck: {
      title: '릴 테이프 데크',
      scene: 'studioA',
      intro: '테이프를 걸었다 처음부터 틀면 한 시간 그 끝의 몇십 초만 들으면 된다 카운터를 맞추고 재생',
      docs: ['txlog', 'rules', 'enote'],
      hintCode: 'R-S03',
      hints: [
        '카운터 00:00은 테이프 맨 처음이고, 테이프 맨 처음은 정시가 아니다',
        '기록지의 시계와 카운터의 0은 같은 순간이 아니다',
      ],
      initial: () => ({ v: [0, 0, 0, 0] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop deckphoto');
        wrap.innerHTML = `<img src="${P}props/deck.webp" alt="릴 테이프 데크 앞면 카운터 창과 재생 버튼" decoding="async"><div class="deck-counter">${d.v[0]}${d.v[1]}:${d.v[2]}${d.v[3]}</div>`;
        const wheels = el('div', 'counter-wheels');
        const MAX = [9, 9, 5, 9];
        ['분 십의 자리', '분 일의 자리', '초 십의 자리', '초 일의 자리'].forEach((lab, i) => {
          const col = el('div', 'cw');
          const up = el('button', 'ctl', '▲'); up.type = 'button'; up.setAttribute('aria-label', lab + ' 올리기'); up.onclick = () => { d.v[i] = (d.v[i] + 1) % (MAX[i] + 1); save(); };
          const dn = el('button', 'ctl', '▼'); dn.type = 'button'; dn.setAttribute('aria-label', lab + ' 내리기'); dn.onclick = () => { d.v[i] = (d.v[i] + MAX[i]) % (MAX[i] + 1); save(); };
          col.append(up, el('b', 'cw-num', String(d.v[i])), dn);
          wheels.append(col);
          if (i === 1) wheels.append(el('span', 'cw-colon', ':'));
        });
        const box = el('div', 'mail-wrap'); box.append(wrap, wheels);
        return box;
      },
      commitLabel: '거기까지 감고 재생',
      check(d) {
        const ok = d.v.join('') === '5822';
        return ok ? { ok: true } : { ok: false, msg: '감고 재생했다 그날 그 순간이 아니다 다시 감는다' };
      },
      reveal: {
        title: '58:22',
        text: '스피커에서 그날 밤 A실 공기가 흘러나왔다 「오늘이 마지막」 그리고 송신이 끊긴 뒤에도 선배는 꺼진 마이크에 대고 계속 말했다 40초',
        scene: ['선배 말이 끝나고도 테이프는 한참 조용히 돌았다'],
      },
    },

    patch: {
      title: '패치베이',
      scene: 'studioA',
      intro: '지금 꽂혀 있는 케이블은 오늘 밤 선배가 꽂아 둔 그대로다 윗줄 출력을 누르고 아랫줄 입력을 누르면 케이블이 이어진다 꽂힌 입력을 누르면 뽑힌다',
      docs: ['wiring', 'enote', 'auto'],
      hintCode: 'R-S04',
      hints: [
        '라벨은 2019년 그대로다 배선표 손글씨가 나중이다',
        '오늘 밤 방송이 어디로 나갔는지는 지금 꽂힌 케이블이 말해 준다 쪽지가 바라는 곳은 셋',
      ],
      initial: () => ({ cables: { 1: 7, 3: 7 }, sel: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop patchphoto');
        const cy = (y) => (y * 688) / 1024;
        let svg = `<svg class="patch-cables" viewBox="0 0 100 ${cy(100)}" aria-hidden="true">`;
        Object.entries(d.cables).forEach(([inp, out]) => {
          const x1 = JX[out - 1], y1 = cy(JY_OUT), x2 = JX[inp - 1], y2 = cy(JY_IN);
          const col = out === 4 ? '#c8372d' : out === 7 ? '#d9a531' : '#3c6fb4';
          svg += `<path d="M${x1} ${y1} C${x1} ${y1 + 26}, ${x2} ${y2 + 10}, ${x2} ${y2}" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="1.9" stroke-linecap="round"/><path d="M${x1} ${y1} C${x1} ${y1 + 26}, ${x2} ${y2 + 10}, ${x2} ${y2}" fill="none" stroke="${col}" stroke-width="1.2" stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="1.5" fill="${col}"/><circle cx="${x2}" cy="${y2}" r="1.5" fill="${col}"/>`;
        });
        svg += '</svg>';
        wrap.innerHTML = `<img src="${P}props/patch.webp" alt="패치베이 윗줄 출력 여덟, 아랫줄 입력 여덟" decoding="async">${OUTS.map((o, i) => `<span class="pb-lab" style="left:${JX[i]}%;top:19.4%">${i + 1} ${o}</span>`).join('')}${INS.map((o, i) => `<span class="pb-lab" style="left:${JX[i]}%;top:55.4%">${i + 1} ${o}</span>`).join('')}${svg}`;
        OUTS.forEach((o, i) => {
          const b = el('button', 'jack' + (d.sel === i + 1 ? ' picking' : '')); b.type = 'button'; b.style.left = JX[i] + '%'; b.style.top = JY_OUT + '%';
          b.setAttribute('aria-label', `출력 ${i + 1} ${o}`);
          b.onclick = () => { d.sel = d.sel === i + 1 ? null : i + 1; save(); };
          wrap.append(b);
        });
        INS.forEach((o, i) => {
          const n = i + 1;
          const b = el('button', 'jack in' + (d.cables[n] ? ' plugged' : '')); b.type = 'button'; b.style.left = JX[i] + '%'; b.style.top = JY_IN + '%';
          b.setAttribute('aria-label', `입력 ${n} ${o}${d.cables[n] ? ` 출력 ${d.cables[n]}에서 꽂힘` : ''}`);
          b.onclick = () => {
            if (d.sel) { d.cables[n] = d.sel; d.sel = null; save(); return; }
            if (d.cables[n]) { delete d.cables[n]; save(); return; }
            ctx.status('먼저 윗줄 출력을 하나 고른다');
          };
          wrap.append(b);
        });
        const list = Object.entries(d.cables).sort((a, b) => a[0] - b[0]).map(([i, o]) => `${o} ${OUTS[o - 1]} → ${i} ${INS[i - 1]}`).join(' · ');
        const box = el('div', 'mail-wrap'); box.append(wrap, el('p', 'pick-label', (d.sel ? `출력 ${d.sel} ${OUTS[d.sel - 1]}에 케이블을 꽂았다 이을 입력을 누른다 · ` : '') + (list ? `꽂힌 케이블 ${list}` : '꽂힌 케이블 없음')));
        return box;
      },
      commitLabel: '송출 시작',
      check(d) {
        const key = Object.entries(d.cables).sort((a, b) => a[0] - b[0]).map(([i, o]) => `${i}:${o}`).join(',');
        return key === PATCH_ANSWER ? { ok: true } : { ok: false, msg: '송출 버튼을 눌렀다가 바로 뗐다 이대로는 아니다' };
      },
      reveal: {
        title: '송출',
        text: '테이프가 돈다 예비 송신기 계기판 바늘이 올라온다 녹음기 빨간 불이 들어온다 2년 전 1시 58분 12초, 그 뒤가 처음으로 나간다',
        ending: true,
        endingLabel: '로비로 내려가기',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '옛 방송국 로비 벤치에 눈을 감고 앉은 백발의 여자, 열린 스튜디오 문 앞 ON AIR 불 아래 선 남자',
    eyebrow: '2026년 10월 31일 토요일, 새벽 2시 41분',
    title: '1시 58분 그 뒤',
    paragraphs: [
      '로비 스피커에서 선배 목소리가 나왔다 2년 전 그 방의 공기째로 "오늘이 마지막 방송입니다 열아홉 해 동안 새벽 두 시까지 깨어 있어 준 여러분, 반죽 치대던 분, 병동 불 끄고 돌던 분, 빈 차로 한 바퀴 더 돌던 분 다 고마웠어요"',
      '"마이크가 꺼진 것 같네요 괜찮아요 하람 씨 손 떨지 마요 다음에 또 만나요는 못 하겠고, 잘 자요 새벽 두 시, 미루였습니다"',
      '로비로 나와 보니 벤치에 선배가 앉아 있었다 언제 왔는지 모르겠다 눈을 감고 스피커 쪽으로 고개를 기울이고 있었다',
      '만석이 형 문자가 왔다 「들었다」 「끝까지」',
      '선배가 휴대폰에 뭔가 써서 내밀었다 「손 안 떨었네」',
    ],
    afterword: '11월 10일 보관실 테이프는 모두 폐기됐다 241030 A 01 한 통만 빼고 그 테이프는 지금 선배 집 라디오 옆에 있다 이번엔 녹음도 했으니까 두 통이다',
    unlockDoc: 'final',
    next: { href: 'index.html#cases', title: '테마 로비', label: '테마 로비로 →', line: '다른 이야기는 테마 로비에서 고를 수 있습니다' },
  },
};
