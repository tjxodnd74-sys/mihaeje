// 자정의 무인 세탁소 — ★4 안내 없음, 힌트 3단계 이야기·자료·장치가 전부 이 파일에 있습니다
// 6번 건조기는 매일 밤 빈 통으로 돈다 배기구가 뒷골목 막차 정류장 지붕 위로 나 있어서
// 손동작: 버튼 순서 누르기 → 자석 하나 옮기기 → 번호 스티커 여섯 장 붙이기 → 녹화 막대 밀며 화면 표시 → 예약 칩 셋
// v125: 간판은 가게 안에서 보면 좌우가 뒤집힌다(엄마는 늘 밖에서 봤다) · 근무표 대타 메모 함정 · 뒷골목 CCTV(새 장치) · 엄마의 사연과 월요일 밤 빈칸
const P = 'assets/v2/laundry/';
const small = () => typeof matchMedia === 'function' && matchMedia('(max-width:640px)').matches;

// 6번 패널: 버튼 일곱 + 시작 (사진 좌표 %)
const BTN = [
  { id: 'sun', label: '☀', name: '고온', x: 14.6 }, { id: 'star', label: '✶', name: '중온', x: 23.2 }, { id: 'moon', label: '☾', name: '저온', x: 31.8 },
  { id: '1', label: '1', name: '10분', x: 40.4 }, { id: '2', label: '2', name: '20분', x: 48.8 }, { id: '3', label: '3', name: '30분', x: 57.4 }, { id: '4', label: '4', name: '40분', x: 65.9 },
];
const ADMIN = ['sun', 'moon', '2', '4']; // 간판 「☀☾ 빨래방 24」(밖에서 읽은 순서)에서 버튼에 있는 것만 + 시작 길게

// 6번 운전 기록 9/25 ~ 11/4 — 실행은 그날 00:00, 동전은 그 전날 밤
// 9월은 엄마가 관리자 카드로 직접, 10월부터는 야간 알바가 동전으로 월요일 밤(하은 근무)만 빠진다
// 대타 두 번: 10/12 월 야간 하은→도현(그래서 10/13 화는 돈다) · 10/22 목 야간 도현→하은(그래서 10/23 금이 빈다)
const WD = '일월화수목금토';
const coinMin = (m, d) => 3 + ((d * 5 + m * 2) % 6); // 22:03 ~ 22:08 날마다 들쭉날쭉
const doNight = (m, d, w) => { // 그 날짜 밤에 도현이 야간이었나
  if (m === 10 && d === 12) return true;
  if (m === 10 && d === 22) return false;
  return w !== 1;
};
function logRows() {
  const out = [];
  for (let i = 0; i < 45; i++) {
    const dt = new Date(Date.UTC(2026, 8, 25 + i));
    const m = dt.getUTCMonth() + 1, d = dt.getUTCDate(), w = dt.getUTCDay();
    if (m === 11 && d > 4) break;
    const pv = new Date(Date.UTC(2026, 8, 24 + i)); const pm = pv.getUTCMonth() + 1, pd = pv.getUTCDate(), pw = pv.getUTCDay();
    const day = `${m}/${d} ${WD[w]}`;
    if (pm === 9) out.push([day, `23:5${(pd % 4) + 5} 관리자 카드`, '저온 10분 0.0kg']);
    else if (!doNight(pm, pd, pw)) out.push([day, '—', '<span class="term-miss">실행 없음</span>']);
    else out.push([day, `22:0${coinMin(pm, pd)} 500원 1개`, m === 11 && d === 4 ? '저온 10분 <b>운전 중</b>' : '저온 10분 0.0kg']);
  }
  return out;
}
// 영수증: 도현이 커피 사고 거스름돈 넣은 밤 (투입 2분 전) 10/12 월은 대타 날
const RECEIPTS = [[10, 6], [10, 12], [10, 15], [10, 25]].map(([m, d]) => {
  const w = new Date(Date.UTC(2026, m - 1, d)).getUTCDay();
  return [`${m}/${d} ${WD[w]}`, `22:0${coinMin(m, d) - 2}`];
});

// 편의점 근무표 6열(월~금, 토·일) × 3줄(오전·오후·야간) 화이트보드 사진 위에 손글씨로 얹는다
const DAYS = ['월', '화', '수', '목', '금', '토·일'];
const SHIFT = [
  ['지수', '지수', '지수', '지수', '지수', '하은'],
  ['태오', '태오', '태오', '태오', '태오', '지수'],
  ['하은', '도현', '도현', '도현', '도현', '도현'],
];
const SWAP = ['대타 10/12 월 야간 하은→도현 (시험)', '10/22 목 야간 도현→하은 (예비군)'];
const ROWS = [{ t: 20.1, b: 40.7, name: '오전 07-15' }, { t: 40.7, b: 59.3, name: '오후 15-22' }, { t: 59.3, b: 77.8, name: '야간 22-07' }];
const COL0 = 16.8, COLW = 9.49;
const MAGNETS = [
  { id: 'jisu', name: '박지수', color: 'red', y: 24.4 }, { id: 'taeo', name: '이태오', color: 'blue', y: 34.4 },
  { id: 'dohyun', name: '김도현', color: 'green', y: 44.6 }, { id: 'haeun', name: '최하은', color: 'yellow', y: 54.7 },
];

// 뒷골목 배기구 2줄 × 3 배관도: 건조기 → 천장 끝 글자 → 골목 쪽 벽의 글자 자리
const VENT_IDS = ['TL', 'TM', 'TR', 'BL', 'BM', 'BR'];
const VENT_NAME = { TL: '윗줄 왼쪽', TM: '윗줄 가운데', TR: '윗줄 오른쪽', BL: '아랫줄 왼쪽', BM: '아랫줄 가운데', BR: '아랫줄 오른쪽' };
const CROP = { x0: 25, w: 43, y0: 8, h: 37.9 }; // 골목 사진에서 배기구 부분만 (가로·세로 %)
const VENT_XY = { TL: [34.9, 18.6], TM: [46.5, 19.3], TR: [57.1, 20], BL: [34.9, 34.2], BM: [46.4, 34.9], BR: [57.1, 35.3] };
const LETTERS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ'];
const PIPE = { 1: 3, 2: 0, 3: 5, 4: 1, 5: 4, 6: 2 }; // 건조기 → 천장 끝 글자 번호
const WALL = { TL: 'ㅂ', TM: 'ㄹ', TR: 'ㄴ', BL: 'ㅁ', BM: 'ㄱ', BR: 'ㄷ' }; // 골목에서 본 벽
const ANSWER_VENTS = Object.fromEntries(Object.entries(WALL).map(([v, l]) => [v, String(Object.keys(PIPE).find((n) => LETTERS[PIPE[n]] === l))]));

// 뒷골목 카메라 어젯밤(월요일 밤) 녹화 10분마다 한 장 — 벤치에 앉은 사람이 있는 건 00:10, 00:20
// v126: 00:10 사람은 벤치 가운데에, 앉은 사람은 머리가 낮고 허벅지·무릎이 벤치 높이에서 앞으로 나오게 (서 있는 사람과 한눈에 구분)
const FRAMES = [
  { t: '23:50', day: '2026/11/02 월', fig: ['walker'] },
  { t: '00:00', day: '2026/11/03 화', fig: ['cat'] },
  { t: '00:10', day: '2026/11/03 화', fig: ['p1'] },
  { t: '00:20', day: '2026/11/03 화', fig: ['p2', 'p3', 'p4'] },
  { t: '00:30', day: '2026/11/03 화', fig: ['s1', 's2', 'bus'] },
  { t: '00:40', day: '2026/11/03 화', fig: [] },
];
const CCTV_ANSWER = ['00:10', '00:20'];
function figSvg(list) {
  const ink = 'fill="#070b0a"';
  // 앉은 사람(비스듬히 앉음): 밝게 뜬 얼굴(적외선) · 굽은 등 · 벤치 높이에서 앞으로 나온 허벅지(무릎 위가 밝다) · 무릎에서 꺾여 내려온 정강이
  const sit = (x, pack, k = -1) => {
    const kx = x + k * 24;
    return `<g opacity=".93">${pack ? `<rect x="${x - k * 20 - 9}" y="316" width="18" height="28" rx="6" fill="#0b100e"/>` : ''}`
      + `<path d="M${x - 17} 300 Q${x} 288 ${x + 17} 300 L${x + 15} 344 L${x - 15} 344Z" fill="#0b100e"/>`
      + `<path d="M${x - 14} 334 L${x + 14} 334 L${kx + 13} 342 L${kx + 13} 357 L${kx - 13} 357 L${x - 14} 348Z" fill="#1a2320"/>`
      + `<ellipse cx="${kx}" cy="345" rx="14" ry="5" fill="#5d6b64"/>`
      + `<rect x="${kx - 12}" y="353" width="11" height="50" rx="4" fill="#0d1311"/><rect x="${kx + 1}" y="353" width="11" height="50" rx="4" fill="#0d1311"/>`
      + `<ellipse cx="${kx - 8}" cy="403" rx="9" ry="4" fill="#070b0a"/><ellipse cx="${kx + 8}" cy="403" rx="9" ry="4" fill="#070b0a"/>`
      + `<circle cx="${x + 2}" cy="283" r="11" fill="#8d9b94"/><path d="M${x - 9} 281 Q${x + 2} 266 ${x + 13} 281 Q${x + 2} 275 ${x - 9} 281Z" fill="#0a0f0d"/></g>`;
  };
  const stand = (x) => `<g ${ink} opacity=".86"><circle cx="${x}" cy="236" r="12" fill="#8d9b94"/><path d="M${x - 16} 252 Q${x} 242 ${x + 16} 252 L${x + 17} 332 L${x - 17} 332Z"/><rect x="${x - 15}" y="328" width="12" height="76" rx="4"/><rect x="${x + 3}" y="328" width="12" height="76" rx="4"/></g>`;
  const parts = {
    walker: `<g ${ink} opacity=".8"><path d="M520 222 Q560 186 600 222Z"/><rect x="558" y="222" width="3" height="30"/><circle cx="560" cy="252" r="12"/><path d="M544 268 Q560 258 576 268 L578 360 L542 360Z"/><rect x="545" y="356" width="13" height="80" rx="4" transform="rotate(6 551 356)"/><rect x="562" y="356" width="13" height="80" rx="4" transform="rotate(-8 568 356)"/></g>`,
    cat: `<g ${ink} opacity=".88"><ellipse cx="300" cy="331" rx="19" ry="9"/><circle cx="320" cy="322" r="8"/><path d="M314 316 L316 306 L321 314Z M321 314 L326 306 L327 317Z"/><path d="M282 332 Q268 330 270 316" fill="none" stroke="#070b0a" stroke-width="4" stroke-linecap="round"/></g><circle cx="318" cy="321" r="1.6" fill="#e8fff0"/><circle cx="324" cy="321" r="1.6" fill="#e8fff0"/>`,
    p1: sit(266, true), p2: sit(236, true), p3: sit(292), p4: sit(346, false, 1),
    s1: stand(395), s2: stand(432),
    bus: `<g><rect x="468" y="148" width="190" height="286" rx="14" fill="#a9bdb4" opacity=".92"/><rect x="480" y="196" width="170" height="92" rx="6" fill="#20302a"/><rect x="484" y="160" width="120" height="26" rx="3" fill="#0d1512"/><text x="498" y="181" font-size="21" font-weight="800" fill="#eafff3" font-family="ui-monospace,monospace">12 순환</text><rect x="476" y="300" width="32" height="128" fill="#2a3a34"/><circle cx="636" cy="400" r="13" fill="#f4fff8"/><circle cx="636" cy="400" r="30" fill="#f4fff8" opacity=".25"/></g>`,
  };
  return list.map((k) => parts[k]).join('');
}

const STARTS = ['00:00', '00:10', '00:20', '00:30'];
const MINS = ['10', '20', '30'];
const TEMPS = ['저온', '중온', '고온'];

function ductSvg() {
  const ink = '#2b3340', pipe = '#66717d';
  const tx = (x, y, s, t, a = 'middle', c = ink, w = 400) => `<text x="${x}" y="${y}" font-size="${s}" font-weight="${w}" text-anchor="${a}" fill="${c}" font-family="SUIT, Pretendard, sans-serif">${t}</text>`;
  const X = [15, 29, 43, 57, 71, 85];
  let s = '<svg viewBox="0 0 100 88" class="duct-svg" role="img" aria-label="설비 업체 배기 배관도 위 칸은 골목에서 본 뒷벽 배기구 여섯 자리와 글자, 아래 칸은 건조기 여섯 대에서 천장 끝 글자까지 엇갈려 올라가는 배관">';
  s += `<rect x="31" y="5" width="38" height="25" rx="1" fill="#f1ede2" stroke="${ink}" stroke-width=".4"/>${tx(50, 3.6, 3.9, '뒷벽 배기구 · 골목에서 본 모습', 'middle', ink, 700)}`;
  const gx = { L: 40, M: 50, R: 60 }, gy = { T: 12, B: 23 };
  Object.entries(WALL).forEach(([k, l]) => { const x = gx[k[1]], y = gy[k[0]]; s += `<circle cx="${x}" cy="${y}" r="4.2" fill="#fff" stroke="${ink}" stroke-width=".5"/>${tx(x, y + 1.5, 4.3, l, 'middle', ink, 700)}`; });
  s += `<line x1="4" y1="34" x2="96" y2="34" stroke="${ink}" stroke-width=".3" stroke-dasharray="1 1"/>${tx(50, 39.4, 3.8, '천장 속 배관 · 끝 글자는 위 칸 벽 자리', 'middle', '#3b4450', 700)}`;
  X.forEach((x, i) => { s += `<circle cx="${x}" cy="45" r="3.3" fill="#fff" stroke="${ink}" stroke-width=".45"/>${tx(x, 46.35, 3.8, LETTERS[i], 'middle', ink, 700)}`; });
  for (let n = 1; n <= 6; n++) {
    const dx = X[n - 1], tx2 = X[PIPE[n]];
    const c1 = 61 - n * 1.6, c2 = 55 + n * 1.4;
    const d = `M${dx} 73 C${dx} ${c1}, ${tx2} ${c2}, ${tx2} 48.3`;
    s += `<path d="${d}" fill="none" stroke="#fbfaf4" stroke-width="2.8"/><path d="${d}" fill="none" stroke="${pipe}" stroke-width="1.2" stroke-linecap="round"/>`;
  }
  X.forEach((x, i) => { s += `<rect x="${x - 4.4}" y="73" width="8.8" height="8" rx="1" fill="#e4e7eb" stroke="${ink}" stroke-width=".45"/>${tx(x, 78.6, 4.3, i + 1, 'middle', ink, 700)}`; });
  s += tx(50, 86.4, 3.8, '건조기 1 ~ 6 · 가게 안에서 붙인 번호', 'middle', '#3b4450', 700);
  return s + '</svg>';
}

// 길게 누르기(시작 버튼) — 짧은 탭이 click으로 새어 들어가 풀리지 않게 pointer/keydown만 쓴다
// v126: 짧게 누르면 일반 운전 → 동전이 없으니 액정을 지우고 그렇다고 알려 준다 (지워지지 않은 입력 뒤에 정답이 붙어 ERR이 나던 문제)
function holdable(ctx, b, d) {
  const SHORT = '삑 짧게 누르면 일반 운전인데 동전이 없다 액정이 지워졌다 관리자 확인은 시작을 꾹 누르고 있어야 한다';
  let timer = null;
  const begin = () => { if (!d.seq.length) { ctx.status('아직 아무 버튼도 안 눌렀다'); return false; } b.classList.add('holding'); timer = setTimeout(() => { timer = null; b.classList.remove('holding'); ctx.commit?.(); }, 900); return true; };
  const end = () => { if (!timer) return; clearTimeout(timer); timer = null; b.classList.remove('holding'); d.seq = []; d.err = false; ctx.save(); ctx.status(SHORT); };
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); begin(); });
  b.addEventListener('pointerup', end); b.addEventListener('pointerleave', end); b.addEventListener('pointercancel', end);
  b.onclick = (e) => e.preventDefault();
  b.onkeydown = (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); begin(); } };
  b.onkeyup = (e) => { if (e.key === 'Enter' || e.key === ' ') end(); };
  b.addEventListener('contextmenu', (e) => e.preventDefault());
}

export default {
  id: 'laundry',
  number: '008',
  title: '자정의 무인 세탁소',
  subtitle: '빈 통으로 도는 6번 건조기',
  genre: '생활 미스터리 · 동네 추리',
  minutes: 30,
  difficulty: 4,
  mood: 'horror',
  cover: P + 'hall.webp',
  coverAlt: '비 오는 밤의 무인 빨래방, 맨 끝 건조기 하나만 안쪽 불이 켜진 채 빈 통으로 돌고 있다',
  music: 'assets/music/laundry-v33.mp3',
  tagline: '밤 열두 시 정각\n아무도 없는 빨래방에서 6번 건조기가 빈 통으로 돈다',
  blurb: '손목 수술을 한 엄마 대신 24시 빨래방을 맡은 지 한 달\n엄마가 남긴 규칙은 하나였습니다 「6번 자정에 도는 거 건드리지 마라」',
  storageKey: 'mihaeje-v2-laundry',
  hintTitle: '가게 공책',
  tracesLabel: '6번이 데려간 곳',

  opening: {
    eyebrow: '11월 4일 수요일, 밤 12시',
    paragraphs: [
      '해달빨래방은 엄마가 열두 해 한 가게다. 엄마가 손목 수술을 받으면서 지난달부터 내가 맡았다. 무인이라 밤엔 아무도 없다. 원래는.',
      '맡은 첫날 엄마가 한 말은 하나였다. 「6번 자정에 도는 거 건드리지 마라. 이유는 묻지 말고.」',
      '오늘은 열한 시가 넘어서 마감 청소를 하러 나왔다가, 처음으로 자정까지 남았다. 열두 시 정각, 형광등이 한 번 꺼졌다 켜졌다. 그리고 맨 끝 6번이 삑, 하더니 혼자 돌기 시작했다.',
      '문 유리에 손을 대 봤다. 따뜻했다. 통 안에는 아무것도 없었다.',
    ],
    cta: '빈 통 앞에 서기',
  },

  traces: [
    { device: 'panel', label: '6번의 기록' },
    { device: 'magnet', label: '동전 넣는 사람' },
    { device: 'vents', label: '6번의 배기구' },
    { device: 'cctv', label: '어젯밤 벤치' },
    { device: 'sched', label: '새 예약' },
  ],

  scenes: [
    {
      id: 'hall',
      name: '해달빨래방',
      image: P + 'hall.webp',
      arrive: (S) => {
        if (S.solved.includes('cctv')) return '단말기엔 어젯밤 벤치가 멈춰 있다 6번 패널 액정에 예약 화면이 켜져 있다';
        if (S.solved.includes('vents')) return '6번은 멈췄다 문 유리가 아직 따뜻하다 벽에 붙은 관리자 단말기 화면이 저 혼자 깜빡인다 뒷골목을 비추는 카메라다';
        if (S.solved.includes('panel')) return '6번은 아직 빈 통으로 돈다 패널 액정엔 ADMIN 그 아래 동전함 서랍이 반쯤 밀려 나와 있다';
        return '밖엔 비가 온다 맨 끝 6번이 빈 통으로 돌고, 안쪽 4번에선 손님이 두고 간 이불이 웅웅 돈다 6번 앞판엔 엄마 쪽지가 테이프로 붙어 있고 앞 유리 안쪽엔 엄마가 단 네온 간판';
      },
      hotspots: [
        // 그림 속 물건 자리: 테이블 위 내 휴대폰 · 6번 앞판 왼쪽 위에 테이프로 붙은 엄마 쪽지
        { id: 'mchat', x: 52.3, y: 66.5, r: 7, label: '테이블 위 휴대폰 · 엄마 문자', kind: 'doc', doc: 'mchat' },
        { id: 'note6', x: 88.6, y: 5.4, r: 7, label: '6번에 붙은 엄마 쪽지', kind: 'doc', doc: 'note6' },
        { id: 'drum6', x: 92, y: 24, r: 9, label: '6번 문 유리', kind: 'doc', doc: 'drum6' },
        { id: 'sign', x: 24, y: 26, r: 10, label: '앞 유리 네온 간판', kind: 'doc', doc: 'sign' },
        { id: 'guide', x: 6, y: 17, r: 7, label: '벽의 이용 안내', kind: 'doc', doc: 'guide' },
        { id: 'panel', x: 91, y: 45, r: 8, label: '6번 건조기 패널', kind: 'device', device: 'panel', visible: (S) => !S.solved.includes('cctv') },
        { id: 'coins', x: 91, y: 55, r: 6, label: '6번 동전함', kind: 'doc', doc: 'coins', visible: (S) => S.solved.includes('panel') },
        { id: 'cctv', x: 56, y: 28, r: 8, label: '관리자 단말기', kind: 'device', device: 'cctv', visible: (S) => S.solved.includes('vents') },
        { id: 'sched', x: 91, y: 45, r: 8, label: '6번 예약 화면', kind: 'device', device: 'sched', visible: (S) => S.solved.includes('cctv') },
      ],
    },
    {
      id: 'store',
      name: '옆 편의점',
      image: P + 'store.webp',
      unlockedBy: 'panel',
      arrive: (S) => (S.solved.includes('magnet')
        ? '도현은 박스를 안고 다시 창고로 들어갔다 계산대는 또 비었다 포스 화면엔 아직 도현 이름이 로그인돼 있다'
        : '옆 늘봄편의점은 불이 환하다 계산대는 비어 있고 창고에서 박스 끄는 소리만 난다 냉장고 모터가 낮게 운다 계산대 너머 벽에 근무표 화이트보드, 보드 아래 테두리엔 노란 쪽지'),
      hotspots: [
        { id: 'shift', x: 58, y: 31, label: '근무표 화이트보드', kind: 'device', device: 'magnet' },
        { id: 'posnote', x: 49, y: 53, r: 6, label: '포스 옆 꽂이의 메모', kind: 'doc', doc: 'posnote' },
        { id: 'talk', x: 29, y: 57, r: 8, label: '포스 앞에서 도현과 한 얘기', kind: 'doc', doc: 'talk', visible: (S) => S.solved.includes('magnet') },
      ],
    },
    {
      id: 'alley',
      name: '뒷골목',
      image: P + 'alley.webp',
      unlockedBy: 'magnet',
      arrive: (S) => (S.solved.includes('vents')
        ? '편의점 쪽에서 발소리가 다가온다 머리 위 배기구 여섯은 조용하다 6번 바로 밑 벤치엔 아직 내 배관도만 펼쳐져 있다'
        : '열두 시 구 분, 빨래방 뒤로 돌아 나왔다 배기구 하나가 숨 쉬듯 김을 뱉고 나머지 다섯은 검은 입만 벌리고 있다 번호는 없다 그 아래 정류장 벤치는 비어 있어서, 도현이 준 배관도를 벤치 끝에 펼쳐 놓았다'),
      hotspots: [
        { id: 'duct', x: 59, y: 70, r: 6, label: '벤치에 펼친 배관도', kind: 'doc', doc: 'duct' },
        { id: 'bus', x: 66, y: 58, label: '정류장 시간표', kind: 'doc', doc: 'bus' },
        { id: 'vents', x: 46, y: 27, r: 14, label: '뒷벽 배기구 여섯', kind: 'device', device: 'vents' },
      ],
    },
  ],

  docs: {
    mchat: {
      title: '엄마 문자',
      kind: '방금',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>엄마</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 11월 4일 수요일</div>
<div class="chat-row me"><span class="chat-meta">오전 12:01</span><div class="chat-bubble">엄마 6번 지금 혼자 돌아<br>통 비었는데</div></div>
<div class="chat-row them"><span class="chat-avatar">엄</span><div class="chat-col"><span class="chat-name">엄마</span><div class="chat-bubble">건들지 말랫지</div><div class="chat-bubble">사연잇어 낼 낮에 얘기해줄게</div><div class="chat-bubble">글구 열두시 넘으면 뒤쪽 내다보지마 그시간엔 사람잇어</div><div class="chat-bubble">손목아파 자야돼</div></div><span class="chat-time">오전 12:03</span></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    note6: {
      title: '6번 위 쪽지',
      kind: '엄마 글씨',
      html: `<blockquote class="hand">6번 자정에 도는 거 손대지 말 것<br>예약 걸린 거 취소하지 말 것<br>6번은 저온만 쓸 것 뜨거우면 냄새 난다고 싫어들 한다<br>빈 통 오래 돌리지 말 것 전기 아깝다</blockquote><p class="aside">쪽지 맨 아래, 볼펜 색이 다른 글씨</p><blockquote class="hand admin-note">관리자 → 간판대로 누르고 시작 꾹<br><small>(자꾸 까먹어서 적어 둠)</small></blockquote>`,
    },
    drum6: {
      title: '6번 문 유리',
      kind: '손을 대 본 것',
      html: '<p>빈 통인데 유리가 손바닥만큼 따뜻하다 안쪽 벽에 김이 손자국처럼 서렸다가 천천히 지워진다 통이 한 바퀴 돌 때마다 텅 빈 소리가 난다 무게 표시는 0.0kg</p><p class="aside">유리에 비친 내 얼굴 뒤로 가게가 텅 비어 있다</p>',
    },
    sign: {
      title: '앞 유리 네온 간판',
      kind: '가게 안에서 올려다본 것',
      html: `<div class="neon mirrored" role="img" aria-label="앞 유리 안쪽 네온 안에서 보면 왼쪽부터 뒤집힌 24, 뒤집힌 빨래방, 달 그림, 해 그림"><span class="neon-sun">☀</span><span class="neon-moon">☾</span><em>빨래방</em><strong>24</strong></div><p>가게 이름 해달을 엄마는 글자 대신 해 그림, 달 그림으로 넣었다 간판집 사장님이 이러면 아무도 못 읽는다고 했는데 엄마는 그게 좋다고 했다</p><p>엄마는 문을 닫고 나면 꼭 길 건너에서 이 불이 잘 켜졌나 한 번 보고 갔다</p>`,
    },
    guide: {
      title: '벽의 이용 안내',
      kind: '건조기 사용법',
      html: `<div class="paper-table"><p class="pt-head">건조기 사용법</p><table><tr><th>☀</th><td>고온</td></tr><tr><th>✶</th><td>중온</td></tr><tr><th>☾</th><td>저온 (니트 · 이불)</td></tr><tr><th>1 2 3 4</th><td>10분 20분 30분 40분</td></tr><tr><th>시작</th><td>500원 넣고 누르기</td></tr><tr><th>예약</th><td>그날 한 번만 (관리자 카드도 같음)</td></tr></table><p class="pt-foot">고장 문의 사장 휴대폰 010-48**-****</p></div>`,
    },
    log6: {
      title: '6번 운전 기록',
      kind: '관리자 모드 · 9월 25일 ~ 11월 4일',
      html: `<div class="term-screen"><p class="term-line">DRYER 06 · RUN LOG</p><table class="term-table log6"><tr><th>00:00 운전한 날</th><th>전날 밤 투입</th><th>운전</th></tr>${logRows().map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table></div>`,
    },
    coins: {
      title: '6번 동전함',
      kind: '관리자 모드로 열림',
      html: `<figure class="prop"><img src="${P}props/coins.webp" alt="500원 동전 사이에 가늘게 접힌 영수증 넉 장" decoding="async"></figure><p>이쪽 줄 건조기 셋이 같이 쓰는 동전함이라 낮 손님 동전까지 한 달 치가 수북하다 그 위에 가늘게 접힌 영수증 넉 장 서랍 윗단 틈으로 밀어 넣은 것 같다 펴 보니 뒷면마다 볼펜으로 「6번 500」</p><div class="receipt-row">${RECEIPTS.map(([d, t]) => `<div class="receipt"><b>늘봄편의점 윤슬점</b><span>2026/${d} ${t}</span><span>POS 2</span><span>캔커피 1,500</span><span>받은 돈 2,000</span><span>거스름 500</span></div>`).join('')}</div>`,
    },
    posnote: {
      title: '포스 옆 꽂이의 메모',
      kind: '편의점 계산대',
      html: `<blockquote class="hand">교대 07시 / 15시 / 22시<br>POS 2는 출근하는 사람이 켜고 로그인<br>자기 물건은 자기 POS로 계산!!</blockquote>`,
    },
    talk: {
      title: '포스 앞에서 도현과 한 얘기',
      kind: '편의점 계산대',
      html: `<p>「6번?」 메모 옆에 초록 자석을 붙이는데 창고에서 박스를 안고 나오던 알바가 멈춰 서더니, 박스를 내려놓고 포스 앞으로 왔다 명찰에 김도현</p><blockquote>"아 빨래방 사장님 따님이시죠 들켰네"</blockquote><blockquote>"사모님이 수술 들어가시면서 부탁하셨어요 출근할 때 6번에 오백 원 넣고 열두 시로 예약만 걸어 달라고 동전 값은 주신다고 했는데 그냥 제 돈으로 넣었어요 커피 사고 거스름돈 넣은 날은 영수증도 같이 끼워 뒀고요 사모님 나중에 계산하시라고"</blockquote><blockquote>"왜냐고 여쭤봤는데 열두 시 넘어서 뒷골목에 가 보면 안다고만 하셨어요 지금 가 보시면 되겠네요 저는 가게를 못 비워서 아직 못 가 봤어요 사모님이 이것도 맡기셨는데 무슨 그림인지는 모르겠고"</blockquote><p>도현이 계산대 밑에서 접힌 종이를 꺼냈다 설비 업체 배관도였다</p><blockquote>"아 그리고 요즘 학원 끝난 애들이 여기서 컵라면 하나씩 먹고 정류장으로 나가요 막차가 늦어졌다고 투덜대면서"</blockquote>`,
    },
    duct: {
      title: '설비 업체 배관도',
      kind: '도현이 맡아 둔 종이 · 벤치에 펼쳐 둠',
      html: `<figure class="prop ductfig">${ductSvg()}</figure>`,
    },
    bus: {
      title: '정류장 시간표',
      kind: '윤슬동 뒷길 · 순환 12번',
      html: `<div class="paper-table"><p class="pt-head">순환 12번 막차</p><table><tr><th>11월 1일 일요일까지</th><td><s>00:10</s></td></tr><tr><th>11월 2일 월요일부터</th><td><b class="big">00:30</b> 노선 개편</td></tr></table></div><p>개편 안내 종이가 아직 빳빳하다 유리 벽은 있어도 난방은 없다 벤치 위 벽에서 배기구들이 정류장 지붕을 내려다본다</p>`,
    },
    final: {
      title: '엄마와의 통화',
      kind: '11월 5일 목요일 0시 31분',
      locked: true,
      html: `<blockquote>"봤냐"</blockquote><blockquote>"봤어 막차 바뀐 거 알았어?"</blockquote><blockquote>"몰랐지 병원 다니느라 정신없었는데 그럼 며칠을 애들이 떨었겠네"</blockquote><blockquote>"엄마 근데 6번 왜 시작한 거야"</blockquote><blockquote>"몇 년 전 겨울에 저 벤치에서 교복 입은 애 하나가 막차 기다리다 떨면서 잠들었어 버스 기사가 흔들어 깨워서 겨우 탔대 그 얘기 듣고 그다음 날부터 돌렸지"</blockquote><blockquote>"니 아빠도 공장 다닐 때 그 막차 탔거든 말하면 니가 전기세 얘기부터 할까 봐 안 했다"</blockquote><blockquote>"월요일 밤은 왜 비었어?"</blockquote><blockquote>"월요일은 하은이가 야간인데 걔는 학생이라 거기까진 부탁을 못 했어 화요일마다 마음에 걸렸다"</blockquote><blockquote>"이제 열두 시 십 분부터 이십 분 저온 관리자로 걸어 놨어 예약은 하루짜리니까 밤마다 내가 걸게 월요일 밤도 빼지 않고"</blockquote><blockquote>"그리고 열두 시 넘으면 뒤쪽에 사람 있다는 거, 정류장 얘기였어?"</blockquote><blockquote>"그럼 뭔 줄 알았냐"</blockquote><blockquote>"도현이한테 오백 원 돌려줘라 한 달 치"</blockquote><blockquote>"주려고 했는데 안 받더라"</blockquote><p>엄마가 웃었다 손목이 아프다면서 한참 웃었다</p>`,
    },
  },

  devices: {
    panel: {
      title: '6번 건조기 패널',
      scene: 'hall',
      intro: '버튼 일곱 개와 시작 버튼 누른 버튼은 액정에 네 칸까지 찍힌다 시작을 짧게 누르면 일반 운전(동전이 없으면 액정만 지워진다), 꾹 누르고 있으면 관리자 확인이다',
      docs: ['note6', 'sign', 'guide', 'log6'],
      hintCode: 'W-S01',
      hints: [
        '관리자 모드는 쪽지에 적어 놨다 버튼 이름 말고 그림을 봐',
        '간판은 손님 보라고 단 거다 나는 그걸 늘 어디서 봤겠니',
        '☀ ☾ 2 4 그리고 시작 꾹',
      ],
      initial: () => ({ seq: [], err: false }),
      render(ctx) {
        const { d, el, save } = ctx;
        const mob = small();
        // 액정은 네 칸 다 차면 더 받지 않는다 — 조용히 버리지 않고 삑 소리와 함께 알려 준다
        const press = (b) => {
          if (d.err) { d.seq = []; d.err = false; }
          if (d.seq.length >= 4) { ctx.status('삑 액정 네 칸이 다 찼다 더 누른 건 찍히지 않는다 지우려면 「입력 지우기」를 누른다'); const l = wrap.querySelector('.lcd'); if (l) { l.classList.remove('full'); void l.offsetWidth; l.classList.add('full'); } return; }
          d.seq.push(b.id); save();
        };
        const wrap = el('div', 'prop dpanel');
        wrap.innerHTML = `<img src="${P}props/panel.webp" alt="6번 건조기 조작 패널 버튼 일곱 개와 시작 버튼" decoding="async"><div class="lcd${d.err ? ' err' : ''}">${d.err ? 'ERR' : d.seq.length ? d.seq.map((k) => BTN.find((b) => b.id === k).label).join(' ') : 'DRYER 06'}</div>`;
        BTN.forEach((b) => {
          // 휴대폰에선 사진 위 버튼이 너무 작아서 글자만 남기고, 아래 큰 버튼으로 누른다
          const x = el(mob ? 'span' : 'button', 'pbtn'); x.style.left = b.x + '%'; x.innerHTML = `<span>${b.label}</span>`;
          if (!mob) { x.type = 'button'; x.setAttribute('aria-label', `${b.name} 버튼 ${b.label}`); x.onclick = () => press(b); } else x.setAttribute('aria-hidden', 'true');
          wrap.append(x);
        });
        const st = el(mob ? 'span' : 'button', 'pbtn start'); st.innerHTML = '<span>시작</span><i class="hold-ring"></i>';
        if (!mob) { st.type = 'button'; st.setAttribute('aria-label', '시작 버튼 (꾹 누르고 있기)'); holdable(ctx, st, d); } else st.setAttribute('aria-hidden', 'true');
        wrap.append(st);
        const box = el('div', 'letterlock-wrap'); box.append(wrap);
        if (mob) {
          const keys = el('div', 'pkeys');
          BTN.forEach((b) => { const k = el('button', 'pkey'); k.type = 'button'; k.textContent = b.label; k.setAttribute('aria-label', `${b.name} 버튼 ${b.label}`); k.onclick = () => press(b); keys.append(k); });
          const big = el('button', 'pkey start'); big.type = 'button'; big.innerHTML = '시작<i class="hold-ring"></i>'; big.setAttribute('aria-label', '시작 버튼 (꾹 누르고 있기)'); holdable(ctx, big, d);
          keys.append(big); box.append(keys);
        }
        const reset = el('button', 'chip', '입력 지우기'); reset.type = 'button'; reset.onclick = () => { d.seq = []; d.err = false; save(); };
        box.append(reset);
        return box;
      },
      commitLabel: '시작 버튼 꾹 누르기',
      canCommit: () => false,
      check(d) {
        if (d.seq.join(',') === ADMIN.join(',')) return { ok: true };
        d.err = true;
        return { ok: false, msg: '삑삑 액정에 ERR 관리자 모드가 안 열린다 다음 버튼을 누르면 처음부터 다시 찍힌다' };
      },
      reveal: {
        title: '관리자 모드',
        text: '액정에 ADMIN이 떴다 패널 아래에서 철컥, 동전함 서랍이 밀려 나왔다',
        scene: ['기록이 화면 가득 이어진다 무게는 전부 0.0kg 한 달 넘게 밤마다 아무것도 없는 통을 말렸다'],
        unlockDoc: 'log6',
        unlock: 'store',
      },
    },

    magnet: {
      title: '근무표 화이트보드',
      scene: 'store',
      intro: '보드 오른쪽에 이름 자석 넷 「6번?」이라고 쓴 메모를 빈 자석 자리에 붙였다 자석을 누르면 메모 옆으로 옮겨진다 다시 누르면 제자리',
      docs: ['log6', 'coins', 'posnote'],
      hintCode: 'W-S02',
      hints: [
        '기록에서 동전이 들어간 시각하고 빠진 날을 같이 봐라',
        '빠진 날마다 그 전날 밤 야간 칸에 누가 있었는지 보드 구석 글씨까지 날짜로 하나씩 맞춰 봐',
        '김도현',
      ],
      initial: () => ({ pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const mob = small();
        const toggle = (m) => { d.pick = d.pick === m.id ? null : m.id; save(); };
        const wrap = el('div', 'prop boardphoto');
        const cx = (c) => COL0 + COLW * c + COLW / 2;
        let g = DAYS.map((dd, c) => `<span class="sg-day" style="left:${cx(c)}%">${dd}</span>`).join('');
        g += ROWS.map((r) => `<span class="sg-row" style="left:${COL0 + 0.6}%;top:${r.t + 1.4}%">${r.name}</span>`).join('');
        g += SHIFT.map((row, r) => row.map((n, c) => `<span class="sg-cell" style="left:${cx(c)}%;top:${(ROWS[r].t + ROWS[r].b) / 2 + 2}%">${n}</span>`).join('')).join('');
        wrap.innerHTML = `<img src="${P}props/board.webp" alt="편의점 근무표 화이트보드 월요일부터 토·일까지 여섯 칸, 오전 오후 야간 세 줄" decoding="async"><div class="shift-grid" aria-hidden="true">${g}</div>`;
        MAGNETS.forEach((m) => {
          const b = el(mob ? 'span' : 'button', 'mag ' + m.color + (d.pick === m.id ? ' moved' : '')); b.style.top = m.y + '%'; b.innerHTML = `<span>${m.name}</span>`;
          if (!mob) { b.type = 'button'; b.setAttribute('aria-label', `${m.name} 자석`); b.setAttribute('aria-pressed', d.pick === m.id ? 'true' : 'false'); b.onclick = () => toggle(m); } else b.setAttribute('aria-hidden', 'true');
          wrap.append(b);
        });
        const picked = MAGNETS.find((m) => m.id === d.pick);
        const sticky = el('div', 'six-sticky' + (picked ? ' filled ' + picked.color : ''));
        sticky.innerHTML = picked ? `<i></i><b>6번?</b><span>${picked.name}</span>` : '<b>6번?</b>';
        wrap.append(sticky);
        const box = el('div', 'mail-wrap'); box.append(wrap);
        // 보드 아래 테두리에 테이프로 붙여 둔 대타 쪽지
        const swap = el('div', 'swap-note'); swap.innerHTML = `<i aria-hidden="true"></i>${SWAP.join('<br>')}`; box.append(swap);
        if (mob) {
          const tbl = el('div', 'paper-table mobile-only'); tbl.innerHTML = `<table><tr><th></th>${DAYS.map((dd) => `<th>${dd}</th>`).join('')}</tr>${ROWS.map((r, i) => `<tr><th class="nw">${r.name.replace(' ', '<br>')}</th>${SHIFT[i].map((n) => `<td>${n}</td>`).join('')}</tr>`).join('')}</table>`;
          const row = el('div', 'mag-row');
          MAGNETS.forEach((m) => { const b = el('button', 'mag-big ' + m.color + (d.pick === m.id ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-label', `${m.name} 자석`); b.setAttribute('aria-pressed', d.pick === m.id ? 'true' : 'false'); b.innerHTML = `<i></i>${m.name}`; b.onclick = () => toggle(m); row.append(b); });
          box.append(tbl, row);
        }
        box.append(el('p', 'pick-label', picked ? `${picked.name} 자석을 「6번?」 옆으로 옮겼다` : '자석을 하나 누르면 「6번?」 옆으로 옮긴다'));
        return box;
      },
      commitLabel: '이 사람이다',
      canCommit: (d) => !!d.pick,
      check(d) {
        if (d.pick === 'dohyun') return { ok: true };
        return { ok: false, msg: '자석을 옮겨 놓고 기록을 다시 훑었다 이 사람으로는 기록이 설명되지 않는다' };
      },
      reveal: {
        title: '김도현',
        text: '초록 자석을 옮기는 순간 창고 문이 열렸다 「들켰네」',
        scene: ['도현은 엄마 부탁이었다고 했다 이유는 자기도 모른다면서, 열두 시 넘었으니 지금 뒷골목에 가 보라며 접힌 종이 한 장을 건넸다'],
        unlockDoc: 'talk',
        unlock: 'alley',
      },
    },

    vents: {
      title: '뒷벽 배기구 여섯',
      scene: 'alley',
      intro: '배기구 여섯에 번호가 없다 가게에서 들고 나온 번호 스티커 1부터 6까지 아래에서 하나 집어 배기구를 누르면 붙는다 붙인 걸 누르면 떼어 낸다',
      docs: ['duct', 'bus', 'talk'],
      hintCode: 'W-S03',
      hints: [
        '배관도는 위아래 두 칸이야 아래 칸 건조기 번호에서 출발해',
        '줄을 따라 천장 끝 글자까지 간 다음 그 글자를 위 칸 벽에서 찾아봐, 김 나는 데는 지금 누구 빨래가 도는지도 생각하고',
        '윗줄 왼쪽부터 3 1 4 아랫줄 5 2 6',
      ],
      initial: () => ({ map: {}, hold: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const box = el('div', 'mail-wrap');
        // 휴대폰에선 사진과 배관도를 한 화면에서 같이 보도록 접었다 펴는 배관도를 사진 바로 위에 둔다
        if (small() && ctx.S.read.includes('duct')) {
          const det = el('details', 'duct-peek'); det.open = true; const sm = el('summary', '', '배관도 펼쳐 보기'); const fig = el('div', 'ductfig'); fig.innerHTML = ductSvg(); det.append(sm, fig); box.append(det);
        }
        const wall = el('div', 'prop ventwall');
        wall.innerHTML = `<img src="${P}alley.webp" alt="빨래방 뒷벽 둥근 배기구 여섯 윗줄 오른쪽에서 김이 오른다" decoding="async" style="width:${(100 / CROP.w) * 100}%;left:${(-CROP.x0 / CROP.w) * 100}%;top:${(-CROP.y0 / CROP.h) * 100}%">`;
        VENT_IDS.forEach((v) => {
          const [x, y] = VENT_XY[v];
          const b = el('button', 'vent-btn' + (d.map[v] ? ' tagged' : '')); b.type = 'button';
          b.style.left = ((x - CROP.x0) / CROP.w) * 100 + '%'; b.style.top = ((y - CROP.y0) / CROP.h) * 100 + '%';
          b.setAttribute('aria-label', `${VENT_NAME[v]} 배기구${d.map[v] ? ` ${d.map[v]}번 스티커 붙음` : ''}`);
          if (d.map[v]) b.innerHTML = `<span class="vent-tape">${d.map[v]}</span>`;
          b.onclick = () => {
            const had = d.map[v];
            if (had) { delete d.map[v]; if (d.hold) d.map[v] = d.hold; d.hold = d.hold ? null : had; save(); return; }
            if (!d.hold) { ctx.status('먼저 아래에서 번호 스티커를 하나 집는다'); return; }
            d.map[v] = d.hold; d.hold = null; save();
          };
          wall.append(b);
        });
        const used = Object.values(d.map);
        const tray = el('div', 'tape-tray');
        ['1', '2', '3', '4', '5', '6'].forEach((n) => {
          const t = el('button', 'tape-chip' + (d.hold === n ? ' holding' : '') + (used.includes(n) ? ' used' : '')); t.type = 'button';
          t.disabled = used.includes(n); t.textContent = n; t.setAttribute('aria-label', `${n}번 스티커${used.includes(n) ? ' 붙임' : ''}`);
          t.onclick = () => { d.hold = d.hold === n ? null : n; save(); };
          tray.append(t);
        });
        box.append(wall, tray, el('p', 'pick-label', d.hold ? `${d.hold}번 스티커를 들었다 붙일 배기구를 누른다` : used.length === 6 ? '여섯 장을 다 붙였다 붙인 스티커를 누르면 떼어 낸다' : '스티커를 하나 집어 배기구에 붙인다'));
        return box;
      },
      commitLabel: '도면이랑 맞춰 보기',
      canCommit: (d) => Object.keys(d.map).length === 6,
      check(d) {
        if (VENT_IDS.every((v) => d.map[v] === ANSWER_VENTS[v])) return { ok: true };
        return { ok: false, msg: '도면을 벽에 대 보니 맞지 않는다 줄을 처음부터 다시 따라간다' };
      },
      reveal: {
        title: '정류장 지붕 위',
        text: '6번 배기구는 아랫줄 오른쪽, 벤치 바로 위였다 손을 위로 뻗어 보니 바람이 미지근하다 방금 멎었다 열두 시부터 십 분, 더운 바람이 벤치로 내려오게 돼 있었던 거다',
        scene: ['그런데 그 십 분 동안 벤치엔 아무도 없었다 엄마는 누구 앉으라고 이걸 돌린 걸까', '가게 벽 관리자 단말기에 이 골목을 비추는 카메라가 하나 물려 있다'],
        unlock: 'hall',
      },
    },

    cctv: {
      title: '관리자 단말기 · 뒷골목 카메라',
      scene: 'hall',
      intro: '어젯밤 녹화가 10분에 한 장씩 남아 있다 막대를 밀거나 아래 시각을 누르면 화면이 넘어간다 벤치에 사람이 앉아 있는 화면이면 「이 화면 표시」를 눌러 둔다',
      docs: ['bus', 'log6', 'talk'],
      hintCode: 'W-S04',
      hints: [
        '앉아 있는 사람만이다 지나가는 사람이나 사람 아닌 건 빼라',
        '한 장씩 넘기면서 머리 높이와 무릎을 봐 무릎이 벤치 높이에서 앞으로 나와 있으면 앉은 거다 버스가 온 화면에서 벤치에 남은 사람이 있는지도',
        '00:10 하고 00:20 두 장',
      ],
      initial: () => ({ f: 0, marks: [] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'cctv-wrap');
        const mon = el('figure', 'prop cctv');
        const paint = (i) => {
          const fr = FRAMES[i];
          mon.innerHTML = `<img src="${P}props/cctv.webp" alt="" decoding="async"><svg class="cctv-fig" viewBox="0 0 640 480" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="cctvblur"><feGaussianBlur stdDeviation="1.4"/></filter></defs><g filter="url(#cctvblur)">${figSvg(fr.fig)}</g></svg><span class="osd tl">CH4 뒷골목</span><span class="osd tr">● REC</span><span class="osd bl">${fr.day} ${fr.t}:00</span>${d.marks.includes(fr.t) ? '<span class="osd mark">★ 표시함</span>' : ''}`;
          mon.setAttribute('aria-label', `뒷골목 카메라 ${fr.day} ${fr.t} 화면`);
        };
        mon.setAttribute('role', 'img');
        paint(d.f);
        const range = el('input', 'cctv-range'); range.type = 'range'; range.min = '0'; range.max = String(FRAMES.length - 1); range.step = '1'; range.value = String(d.f);
        range.setAttribute('aria-label', '녹화 시각'); range.setAttribute('aria-valuetext', FRAMES[d.f].t);
        // 끄는 동안은 화면만 바꾸고, 손을 떼면 저장 (끄는 중에 다시 그리면 끌기가 끊긴다)
        range.oninput = () => { paint(Number(range.value)); range.setAttribute('aria-valuetext', FRAMES[Number(range.value)].t); };
        range.onchange = () => { d.f = Number(range.value); save(); };
        const strip = el('div', 'cctv-strip');
        FRAMES.forEach((fr, i) => {
          const b = el('button', 'cctv-cell' + (i === d.f ? ' on' : '') + (d.marks.includes(fr.t) ? ' marked' : '')); b.type = 'button';
          b.innerHTML = `<b>${fr.t}</b><span>${d.marks.includes(fr.t) ? '★' : '·'}</span>`;
          b.setAttribute('aria-label', `${fr.t} 화면 보기${d.marks.includes(fr.t) ? ' (표시함)' : ''}`);
          b.onclick = () => { d.f = i; save(); };
          strip.append(b);
        });
        const cur = FRAMES[d.f];
        const on = d.marks.includes(cur.t);
        const mark = el('button', 'chip cctv-mark' + (on ? ' on' : ''), on ? `${cur.t} 표시 지우기` : `${cur.t} 이 화면 표시`); mark.type = 'button';
        mark.setAttribute('aria-pressed', on ? 'true' : 'false');
        mark.onclick = () => { d.marks = on ? d.marks.filter((t) => t !== cur.t) : [...d.marks, cur.t]; save(); };
        // 표시 버튼과 '표시한 화면' 줄은 한 줄로 (확인 버튼이 화면 아래로 밀려나지 않게)
        const foot = el('div', 'cctv-foot'); foot.append(mark, el('p', 'pick-label', d.marks.length ? `표시한 화면 ${d.marks.slice().sort().join(' · ')}` : '아직 표시한 화면이 없다'));
        wrap.append(mon, range, strip, foot);
        return wrap;
      },
      commitLabel: '표시한 화면 저장',
      canCommit: (d) => d.marks.length > 0,
      check(d) {
        const m = d.marks.slice().sort();
        if (m.length === CCTV_ANSWER.length && m.every((t, i) => t === CCTV_ANSWER[i])) return { ok: true };
        return { ok: false, msg: '표시한 화면을 처음부터 다시 돌려 보니 맞지 않는다' };
      },
      reveal: {
        title: '어젯밤 벤치',
        text: '표시한 화면을 나란히 띄웠다 원래대로라면 6번이 바람을 내보냈을 열두 시 화면엔 벤치에 고양이 한 마리뿐이다 눈만 하얗게 빛난다',
        scene: ['어젯밤은 월요일이라 6번은 돌지도 않았다 화면 속 사람들은 어깨를 웅크린 채 버스를 기다렸다', '6번 패널 액정에 예약 화면이 켜졌다 관리자 모드가 아직 살아 있다'],
      },
    },

    sched: {
      title: '6번 예약 다시 걸기',
      scene: 'hall',
      intro: '관리자 모드라 동전 없이 예약을 걸 수 있다 시작 시각, 운전 시간, 온도를 줄마다 하나씩 고른다',
      docs: ['bus', 'note6', 'talk'],
      hintCode: 'W-S05',
      hints: [
        '바람은 누가 벤치에 앉아 있을 때 나와야 쓸모가 있다',
        '시작은 카메라에서, 끝은 정류장 시간표에서 찾아라 온도하고 길이 욕심은 내 쪽지대로',
        '00:10 20분 저온',
      ],
      initial: () => ({ start: '00:00', min: '10', temp: '저온' }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'sched-wrap');
        const step = (k, list, lab) => {
          const row = el('div', 'sched-row'); row.dataset.k = k;
          const g = el('div', 'sched-chips');
          list.forEach((v) => { const b = el('button', 'chip' + (d[k] === v ? ' on' : ''), v + (k === 'min' ? '분' : '')); b.type = 'button'; b.setAttribute('aria-pressed', d[k] === v ? 'true' : 'false'); b.setAttribute('aria-label', `${lab} ${v}${k === 'min' ? '분' : ''}`); b.onclick = () => { d[k] = v; save(); }; g.append(b); });
          row.append(el('span', 'gift-name', lab), g); return row;
        };
        const ph = el('div', 'prop dpanel small'); ph.innerHTML = `<img src="${P}props/panel.webp" alt="6번 건조기 패널" decoding="async"><div class="lcd">예약 ${d.start}<br>${d.min}분 ${d.temp}</div>`;
        const dials = el('div', 'timer-dials'); dials.append(step('start', STARTS, '예약 시작'), step('min', MINS, '운전 시간'), step('temp', TEMPS, '온도'));
        wrap.append(ph, dials);
        return wrap;
      },
      commitLabel: '이대로 예약 걸기',
      check(d) {
        if (d.start === '00:10' && d.min === '20' && d.temp === '저온') return { ok: true };
        if (d.start === '00:00' && d.min === '10' && d.temp === '저온') return { ok: false, msg: '엄마가 걸어 둔 그대로다 그대로 두면 오늘 같은 밤이 또 온다' };
        return { ok: false, msg: '예약 화면을 벤치 쪽 사정에 대 보니 맞지 않는다 다시 고른다' };
      },
      reveal: {
        title: '00:10, 20분, 저온',
        text: '액정에 「예약 00:10 · 20분 · 저온」 동전 칸은 「관리자」 예약은 하루짜리라 내일부터는 내가 밤마다 건다 월요일 밤도 빼지 않고',
        scene: ['도현한테 문자를 보냈다 「이제 오백 원 안 넣으셔도 돼요 한 달 치 돌려드릴게요」 답은 바로 왔다 「됐어요 대신 내일 열두 시 십 분에 같이 봐요」'],
        ending: true,
        endingLabel: '다음 날 밤 열두 시 십 분, 뒷골목',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '자정의 버스 정류장, 지붕 위 배기구 아래 붙어 앉은 세 사람과 모퉁이에서 지켜보는 두 사람, 멀리 막차가 온다',
    eyebrow: '11월 5일 목요일, 막차 오기 전',
    title: '빈 통으로 도는 이유',
    paragraphs: [
      '비가 밤사이 진눈깨비로 바뀌었다 열두 시 십 분, 편의점 문이 열리고 교복 입은 애가 가방을 메고 정류장으로 갔다 뒤로 작업복 차림의 아주머니 한 분, 점퍼 입은 아저씨 한 분',
      '정류장 지붕 위 배기구에서 더운 바람이 내려왔다 빨래 하나 없는 빈 통 바람인데, 진눈깨비 속이라 하얗게 피어올랐다 셋이 벤치에 붙어 앉았다 아주머니가 손을 위로 뻗어 보더니 웃었다 "여기 따뜻하네"',
      '"원래 열두 시였대요" 도현이 말했다 "막차 바뀌고 나선 애들 나오기 전에 끝나 버린 거죠 저도 그게 이거였는지는 오늘 알았어요"',
      '"엄마도 아직 모를 거야 막차 바뀐 거"',
      '열두 시 반, 막차가 왔다 배기구 바람이 딱 그때 멎었다 아저씨가 버스에 오르면서 빨래방 뒷벽을 한 번 올려다봤다',
    ],
    afterword: '6번 위에 새 쪽지를 붙였다 「6번은 밤 12시 10분부터 20분 정류장 담당 월요일 포함 손대지 말 것」 엄마 쪽지는 떼지 않고 그 아래 나란히 붙였다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=garage', title: '마지막 정비소', line: '다음은 폐업 전날 밤 정비소에서 사라진 SD카드 이야기입니다' },
  },
};
