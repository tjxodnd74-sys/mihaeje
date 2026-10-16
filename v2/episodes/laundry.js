// 자정의 무인 세탁소 — ★4 안내 없음, 힌트 3단계 이야기·자료·장치가 전부 이 파일에 있습니다
// 6번 건조기는 매일 밤 빈 통으로 돈다 배기구가 뒷골목 막차 정류장 지붕 위로 나 있어서
// 손동작: 버튼 순서 누르기 → 자석 하나 옮기기 → 번호 스티커 여섯 장 붙이기 → 다이얼 셋
const P = 'assets/v2/laundry/';

// 6번 패널: 버튼 일곱 + 시작 (사진 좌표 %)
const BTN = [
  { id: 'sun', label: '☀', name: '고온', x: 14.6 }, { id: 'star', label: '✶', name: '중온', x: 23.2 }, { id: 'moon', label: '☾', name: '저온', x: 31.8 },
  { id: '1', label: '1', name: '10분', x: 40.4 }, { id: '2', label: '2', name: '20분', x: 48.8 }, { id: '3', label: '3', name: '30분', x: 57.4 }, { id: '4', label: '4', name: '40분', x: 65.9 },
];
const ADMIN = ['sun', 'moon', '2', '4']; // 간판 「☀☾ 빨래방 24」에서 버튼에 있는 것만 왼쪽부터 + 시작 길게

// 6번 운전 기록 9/25 ~ 11/4 실행은 그날 00:00 동전은 그 전날 밤 화요일 실행이 빠지는 건 월요일 밤 근무가 하은이라서
function logRows() {
  const out = [];
  const wd = '일월화수목금토';
  for (let i = 0; i < 45; i++) {
    const dt = new Date(Date.UTC(2026, 8, 25 + i));
    const m = dt.getUTCMonth() + 1, d = dt.getUTCDate(), w = dt.getUTCDay();
    if (m === 11 && d > 4) break;
    const day = `${m}/${d} ${wd[w]}`;
    if (m === 9) out.push([day, `23:5${(d % 4) + 5} 관리자 카드`, '저온 10분 0.0kg']);
    else if (w === 2) out.push([day, '—', '<span class="term-miss">실행 없음</span>']);
    else out.push([day, `22:0${((d * 7) % 6) + 1} 500원 1개`, m === 11 && d === 4 ? '저온 10분 <b>운전 중</b>' : '저온 10분 0.0kg']);
  }
  return out;
}

// 편의점 근무표 6열(월~금, 토·일) × 3줄(오전·오후·야간) 화이트보드 사진 위에 손글씨로 얹는다
const DAYS = ['월', '화', '수', '목', '금', '토·일'];
const SHIFT = [
  ['지수', '지수', '지수', '지수', '지수', '하은'],
  ['태오', '태오', '태오', '태오', '태오', '지수'],
  ['하은', '도현', '도현', '도현', '도현', '도현'],
];
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

const STARTS = ['00:00', '00:10', '00:15'];
const MINS = ['10', '20', '30'];
const TEMPS = ['저온', '중온', '고온'];

function ductSvg() {
  const ink = '#2b3340', pipe = '#66717d';
  const tx = (x, y, s, t, a = 'middle', c = ink, w = 400) => `<text x="${x}" y="${y}" font-size="${s}" font-weight="${w}" text-anchor="${a}" fill="${c}" font-family="SUIT, Pretendard, sans-serif">${t}</text>`;
  const X = [15, 29, 43, 57, 71, 85];
  let s = '<svg viewBox="0 0 100 84" class="duct-svg" role="img" aria-label="설비 업체 배기 배관도 위 칸은 골목에서 본 뒷벽 배기구 여섯 자리와 글자, 아래 칸은 건조기 여섯 대에서 천장 끝 글자까지 엇갈려 올라가는 배관">';
  s += `<rect x="31" y="4" width="38" height="25" rx="1" fill="#f1ede2" stroke="${ink}" stroke-width=".4"/>${tx(50, 2.6, 2.5, '뒷벽 배기구 · 골목에서 본 모습', 'middle', ink, 700)}`;
  const gx = { L: 40, M: 50, R: 60 }, gy = { T: 11, B: 22 };
  Object.entries(WALL).forEach(([k, l]) => { const x = gx[k[1]], y = gy[k[0]]; s += `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="${ink}" stroke-width=".5"/>${tx(x, y + 1.3, 3.6, l, 'middle', ink, 700)}`; });
  s += `<line x1="6" y1="33" x2="94" y2="33" stroke="${ink}" stroke-width=".3" stroke-dasharray="1 1"/>${tx(6, 37, 2.3, '천장 속 배관 · 끝 글자는 위 칸 벽 자리', 'start', '#5b6470')}`;
  X.forEach((x, i) => { s += `<circle cx="${x}" cy="42" r="2.6" fill="#fff" stroke="${ink}" stroke-width=".45"/>${tx(x, 43.1, 2.9, LETTERS[i], 'middle', ink, 700)}`; });
  for (let n = 1; n <= 6; n++) {
    const dx = X[n - 1], tx2 = X[PIPE[n]];
    const c1 = 58 - n * 1.6, c2 = 52 + n * 1.4;
    const d = `M${dx} 70 C${dx} ${c1}, ${tx2} ${c2}, ${tx2} 44.6`;
    s += `<path d="${d}" fill="none" stroke="#fbfaf4" stroke-width="2.8"/><path d="${d}" fill="none" stroke="${pipe}" stroke-width="1.2" stroke-linecap="round"/>`;
  }
  X.forEach((x, i) => { s += `<rect x="${x - 4.2}" y="70" width="8.4" height="8" rx="1" fill="#e4e7eb" stroke="${ink}" stroke-width=".45"/>${tx(x, 75.4, 3.4, i + 1, 'middle', ink, 700)}`; });
  s += tx(50, 82.6, 2.3, '건조기 1 ~ 6 · 가게 안에서 붙인 번호');
  return s + '</svg>';
}

export default {
  id: 'laundry',
  number: '008',
  title: '자정의 무인 세탁소',
  subtitle: '빈 통으로 도는 6번 건조기',
  genre: '생활 미스터리 · 동네 추리',
  minutes: 30,
  difficulty: 4,
  cover: P + 'hall.webp',
  coverAlt: '비 오는 밤의 무인 빨래방, 맨 끝 건조기 하나만 안쪽 불이 켜진 채 빈 통으로 돌고 있다',
  music: 'assets/music/laundry-v33.mp3',
  tagline: '밤 열두 시 정각\n아무도 없는 빨래방에서 6번 건조기가 빈 통으로 돈다',
  blurb: '손목 수술을 한 엄마 대신 24시 빨래방을 맡은 지 한 달\n엄마가 남긴 규칙은 하나였습니다 「6번 자정에 도는 거 건드리지 마라」',
  storageKey: 'mihaeje-v2-laundry',
  hintTitle: '엄마 문자',
  tracesLabel: '6번이 데려간 곳',

  opening: {
    eyebrow: '11월 3일 화요일, 밤 11시 50분',
    paragraphs: [
      '해달빨래방은 엄마가 열두 해 한 가게다 엄마가 손목 수술을 받으면서 지난달부터 내가 맡았다 무인이라 밤엔 아무도 없다 원래는',
      '맡은 첫날 엄마가 한 말은 하나였다 「6번 자정에 도는 거 건드리지 마라 이유는 묻지 말고」',
      '오늘 처음으로 자정까지 가게에 남았다 열두 시 정각, 맨 끝 6번 건조기가 혼자 돌기 시작했다 문을 열어 봤다 통 안은 비어 있었다',
    ],
    cta: '빈 통을 들여다보기',
  },

  traces: [
    { device: 'panel', label: '6번의 기록' },
    { device: 'magnet', label: '동전 넣는 사람' },
    { device: 'vents', label: '6번의 배기구' },
    { device: 'sched', label: '새 예약' },
  ],

  scenes: [
    {
      id: 'hall',
      name: '해달빨래방',
      image: P + 'hall.webp',
      arrive: '밖엔 비가 온다 맨 끝 6번이 불을 켠 채 빈 통으로 돌고, 4번 건조기에선 저녁에 손님이 넣고 간 이불이 웅웅 돈다 6번 위에 엄마 글씨 쪽지가 붙어 있다',
      hotspots: [
        { id: 'mchat', x: 7, y: 88, label: '엄마 문자', kind: 'doc', doc: 'mchat' },
        { id: 'note6', x: 96, y: 7, label: '6번 위 쪽지', kind: 'doc', doc: 'note6' },
        { id: 'sign', x: 40, y: 22, label: '문 위 간판', kind: 'doc', doc: 'sign' },
        { id: 'guide', x: 60, y: 28, label: '벽의 이용 안내', kind: 'doc', doc: 'guide' },
        { id: 'panel', x: 93, y: 24, label: '6번 건조기 패널', kind: 'device', device: 'panel' },
        { id: 'coins', x: 96, y: 47, label: '6번 동전함', kind: 'doc', doc: 'coins', visible: (S) => S.solved.includes('panel') },
        { id: 'sched', x: 89, y: 36, label: '6번 예약 다시 걸기', kind: 'device', device: 'sched', visible: (S) => S.solved.includes('vents') },
      ],
    },
    {
      id: 'store',
      name: '옆 편의점',
      image: P + 'store.webp',
      unlockedBy: 'panel',
      arrive: '옆 늘봄편의점은 불이 환하다 계산대는 비어 있고 안쪽 창고에서 박스 끄는 소리가 난다 계산대 너머 벽에 근무표 화이트보드',
      hotspots: [
        { id: 'shift', x: 58, y: 31, label: '근무표 화이트보드', kind: 'device', device: 'magnet' },
        { id: 'posnote', x: 38, y: 50, label: '포스 옆 메모', kind: 'doc', doc: 'posnote' },
        { id: 'talk', x: 66, y: 82, label: '야간 알바 김도현', kind: 'doc', doc: 'talk', visible: (S) => S.solved.includes('magnet') },
      ],
    },
    {
      id: 'alley',
      name: '뒷골목',
      image: P + 'alley.webp',
      unlockedBy: 'magnet',
      arrive: '열두 시 구 분, 빨래방 뒤로 돌아 나왔다 뒷벽에 둥근 배기구가 여섯 개 번호는 없다 하나에서만 김이 오른다 그 아래 작은 버스 정류장, 벤치는 아직 비어 있다',
      hotspots: [
        { id: 'duct', x: 9, y: 84, label: '손에 든 배관도', kind: 'doc', doc: 'duct' },
        { id: 'bus', x: 66, y: 58, label: '정류장 시간표', kind: 'doc', doc: 'bus' },
        { id: 'vents', x: 46, y: 27, label: '뒷벽 배기구 여섯', kind: 'device', device: 'vents' },
      ],
    },
  ],

  docs: {
    mchat: {
      title: '엄마 문자',
      kind: '방금',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>엄마</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 11월 4일 수요일</div>
<div class="chat-row me"><span class="chat-meta">오전 12:01</span><div class="chat-bubble">엄마 6번 지금 혼자 돌아<br>통 비었는데</div></div>
<div class="chat-row them"><span class="chat-avatar">엄</span><div class="chat-col"><span class="chat-name">엄마</span><div class="chat-bubble">건들지 말랫지</div><div class="chat-bubble">궁금하면 기록봐 관리자모드는 간판이야</div><div class="chat-bubble">손목아파 이만 자</div></div><span class="chat-time">오전 12:03</span></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    note6: {
      title: '6번 위 쪽지',
      kind: '엄마 글씨',
      html: `<blockquote class="hand">6번 자정에 도는 거 손대지 말 것<br>예약 걸린 거 취소하지 말 것<br>6번은 저온만 쓸 것 뜨거우면 냄새 난다고 싫어들 한다<br>빈 통 오래 돌리지 말 것 전기 아깝다</blockquote>`,
    },
    sign: {
      title: '문 위 간판',
      kind: '가게 앞에서 올려다본 것',
      html: `<div class="neon" aria-label="간판: 해 그림, 달 그림, 빨래방, 24"><span class="neon-sun">☀</span><span class="neon-moon">☾</span><em>빨래방</em><strong>24</strong></div><p>가게 이름 해달을 엄마는 글자 대신 해 그림, 달 그림으로 넣었다 간판집 사장님이 이러면 아무도 못 읽는다고 했는데 엄마는 그게 좋다고 했다</p>`,
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
      html: `<figure class="prop"><img src="${P}props/coins.webp" alt="500원 동전 사이에 영수증으로 만 동전 묶음" decoding="async"></figure><p>500원짜리 사이에 영수증으로 돌돌 만 것이 여럿 섞여 있다 손에 잡히는 대로 넷을 풀어 보니 안에 500원이 하나씩</p><div class="receipt-row">${[['10/06 화', '22:01'], ['10/10 토', '22:04'], ['10/15 목', '22:01'], ['10/25 일', '22:02']].map(([d, t]) => `<div class="receipt"><b>늘봄편의점 윤슬점</b><span>2026/${d} ${t}</span><span>POS 2</span><span>캔커피 1,500</span><span>받은 돈 2,000</span><span>거스름 500</span></div>`).join('')}</div>`,
    },
    posnote: {
      title: '포스 옆 메모',
      kind: '편의점 계산대',
      html: `<blockquote class="hand">교대 07시 / 15시 / 22시<br>POS 2는 출근하는 사람이 켜고 로그인<br>자기 물건은 자기 POS로 계산!!</blockquote>`,
    },
    talk: {
      title: '야간 알바 김도현',
      kind: '편의점 계산대',
      html: `<p>「6번?」 메모 옆에 초록 자석을 붙이는데 창고에서 박스를 안고 나오던 알바가 멈춰 섰다 명찰에 김도현</p><blockquote>"아 빨래방 사장님 따님이시죠 들켰네"</blockquote><blockquote>"사모님이 수술 들어가시면서 부탁하셨어요 출근할 때 6번에 오백 원 넣고 열두 시로 예약만 걸어 달라고 동전 값은 주신다는데 그냥 커피 사고 남은 거 넣었어요"</blockquote><blockquote>"이유는 열두 시쯤 뒷골목 정류장 가 보면 알아요 사모님이 이것도 맡기셨어요 무슨 그림인지는 모르겠고"</blockquote><p>도현이 계산대 밑에서 접힌 종이를 꺼냈다 설비 업체 배관도였다</p><blockquote>"아 그리고 요즘 학원 끝난 애들이 여기서 컵라면 먹다가 열두 시 십 분 되면 우르르 나가요 막차가 늦어졌다고"</blockquote>`,
    },
    duct: {
      title: '설비 업체 배관도',
      kind: '도현이 맡아 둔 종이',
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
      html: `<blockquote>"봤냐"</blockquote><blockquote>"봤어 막차 바뀐 거 알았어?"</blockquote><blockquote>"몰랐지 병원에 누워 있는데 그럼 사흘을 애들이 떨었겠네"</blockquote><blockquote>"이제 열두 시 십 분부터 이십 분 저온 관리자로 걸어서 동전도 안 들어 예약은 하루짜리니까 밤마다 내가 걸게"</blockquote><blockquote>"잘했네 도현이한테 오백 원 돌려줘라 한 달 치"</blockquote><blockquote>"벌써 줬어 안 받더라"</blockquote><p>엄마가 웃었다 손목이 아프다면서 한참 웃었다</p>`,
    },
  },

  devices: {
    panel: {
      title: '6번 건조기 패널',
      scene: 'hall',
      intro: '버튼 일곱 개와 시작 버튼 관리자 모드로 들어가야 기록을 볼 수 있다',
      docs: ['mchat', 'sign', 'guide'],
      hintCode: 'L-S01',
      hints: [
        '관리자모드는 간판이야 엄마가 그렇게 정했어',
        '간판을 그대로 버튼으로 옮겨 봐 버튼에 없는 건 버리고',
        '☀ ☾ 2 4 그리고 시작 길게',
      ],
      initial: () => ({ seq: [] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop dpanel');
        wrap.innerHTML = `<img src="${P}props/panel.webp" alt="6번 건조기 조작 패널 버튼 일곱 개와 시작 버튼" decoding="async"><div class="lcd">${d.seq.length ? d.seq.map((k) => BTN.find((b) => b.id === k).label).join(' ') : 'DRYER 06'}</div>`;
        BTN.forEach((b) => {
          const x = el('button', 'pbtn'); x.type = 'button'; x.style.left = b.x + '%';
          x.setAttribute('aria-label', `${b.name} 버튼 ${b.label}`); x.innerHTML = `<span>${b.label}</span>`;
          x.onclick = () => { if (d.seq.length < 8) d.seq.push(b.id); save(); };
          wrap.append(x);
        });
        const st = el('button', 'pbtn start'); st.type = 'button'; st.setAttribute('aria-label', '시작 버튼 짧게 누르기'); st.innerHTML = '<span>시작</span>';
        st.onclick = () => { d.seq = []; save(); ctx.status('삑 동전을 넣으라는 표시만 깜빡이고 입력이 지워졌다'); };
        wrap.append(st);
        const box = el('div', 'letterlock-wrap'); box.append(wrap);
        const reset = el('button', 'chip', '입력 지우기'); reset.type = 'button'; reset.onclick = () => { d.seq = []; save(); };
        box.append(reset);
        return box;
      },
      commitLabel: '시작 버튼 꾹 누르고 있기',
      canCommit: (d) => d.seq.length > 0,
      check(d) {
        const s = d.seq.join(',');
        d.seq = [];
        if (s === ADMIN.join(',')) return { ok: true };
        return { ok: false, msg: '삑삑 액정에 ERR 관리자 모드가 안 열리고 입력이 지워졌다' };
      },
      reveal: {
        title: '관리자 모드',
        text: '액정에 ADMIN이 떴다 패널 아래에서 철컥, 동전함 잠금이 풀리는 소리가 났다',
        scene: ['6번 기록이 화면 가득 이어진다 무게는 전부 0.0kg'],
        unlockDoc: 'log6',
        unlock: 'store',
      },
    },

    magnet: {
      title: '근무표 화이트보드',
      scene: 'store',
      intro: '보드 오른쪽에 이름 자석 넷과 빈 자리 하나 빈 자리에 「6번?」이라고 쓴 메모를 붙였다 누구 자석을 거기로 옮길까',
      docs: ['log6', 'coins', 'posnote'],
      hintCode: 'L-S02',
      hints: [
        '동전 들어간 시간 봐라 밤 열 시 조금 넘어서 그 시각에 저 가게 포스 2를 쓰는 사람',
        '기록에 빠진 날 있지 무슨 요일인지 보고 열두 시에 돈 건 그 전날 밤에 넣은 거다',
        '월요일 밤만 쉬는 야간 김도현',
      ],
      initial: () => ({ pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop boardphoto');
        const cx = (c) => COL0 + COLW * c + COLW / 2;
        let g = DAYS.map((dd, c) => `<span class="sg-day" style="left:${cx(c)}%">${dd}</span>`).join('');
        g += ROWS.map((r) => `<span class="sg-row" style="left:${COL0 + 0.6}%;top:${r.t + 1.4}%">${r.name}</span>`).join('');
        g += SHIFT.map((row, r) => row.map((n, c) => `<span class="sg-cell" style="left:${cx(c)}%;top:${(ROWS[r].t + ROWS[r].b) / 2 + 2}%">${n}</span>`).join('')).join('');
        wrap.innerHTML = `<img src="${P}props/board.webp" alt="편의점 근무표 화이트보드 월요일부터 토·일까지 여섯 칸, 오전 오후 야간 세 줄" decoding="async"><div class="shift-grid" aria-hidden="true">${g}</div>`;
        MAGNETS.forEach((m) => {
          const b = el('button', 'mag ' + m.color + (d.pick === m.id ? ' moved' : '')); b.type = 'button'; b.style.top = m.y + '%';
          b.setAttribute('aria-label', `${m.name} 자석`); b.setAttribute('aria-pressed', d.pick === m.id ? 'true' : 'false'); b.innerHTML = `<span>${m.name}</span>`;
          b.onclick = () => { d.pick = d.pick === m.id ? null : m.id; save(); };
          wrap.append(b);
        });
        const picked = MAGNETS.find((m) => m.id === d.pick);
        const sticky = el('div', 'six-sticky' + (picked ? ' filled ' + picked.color : ''));
        sticky.innerHTML = picked ? `<i></i><b>6번?</b><span>${picked.name}</span>` : '<b>6번?</b>';
        wrap.append(sticky);
        const box = el('div', 'mail-wrap'); box.append(wrap, el('p', 'pick-label', picked ? `${picked.name} 자석을 「6번?」 옆으로 옮겼다` : '자석을 하나 누르면 「6번?」 옆으로 옮긴다'));
        return box;
      },
      commitLabel: '이 사람이다',
      canCommit: (d) => !!d.pick,
      check(d) {
        if (d.pick === 'dohyun') return { ok: true };
        if (d.pick === 'haeun') return { ok: false, msg: '하은 씨 칸을 기록이랑 대 보니 맞지 않는다' };
        if (d.pick === 'taeo') return { ok: false, msg: '태오 씨 칸을 기록이랑 대 보니 어긋나는 밤이 있다' };
        return { ok: false, msg: '지수 씨는 밤에 가게에 없다' };
      },
      reveal: {
        title: '김도현',
        text: '초록 자석을 옮기는 순간 창고 문이 열렸다 「들켰네」',
        scene: ['도현은 엄마 부탁이었다고 했다 이유는 열두 시쯤 뒷골목에 가 보면 안다고 하면서 접힌 종이 한 장을 건넸다'],
        unlockDoc: 'talk',
        unlock: 'alley',
      },
    },

    vents: {
      title: '뒷벽 배기구 여섯',
      scene: 'alley',
      intro: '배기구 여섯에 번호가 없다 가게에서 들고 나온 번호 스티커 1부터 6까지 하나씩 제자리에 붙인다',
      docs: ['duct', 'bus', 'talk'],
      hintCode: 'L-S03',
      hints: [
        '김 나는 데는 지금 4번 이불 도는 거다 거기부터 붙여',
        '도면은 위아래 두 칸이야 건조기에서 줄 따라 천장 끝 글자까지 가고 그 글자를 위 칸 벽에서 찾아',
        '윗줄 왼쪽부터 3 1 4 아랫줄 5 2 6',
      ],
      initial: () => ({ map: {}, hold: null }),
      render(ctx) {
        const { d, el, save } = ctx;
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
        const box = el('div', 'mail-wrap');
        box.append(wall, tray, el('p', 'pick-label', d.hold ? `${d.hold}번 스티커를 들었다 붙일 배기구를 누른다` : used.length === 6 ? '여섯 장을 다 붙였다 붙인 스티커를 누르면 떼어 낸다' : '스티커를 하나 집어 배기구에 붙인다 붙인 걸 누르면 떼어 낸다'));
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
        text: '6번 배기구는 아랫줄 오른쪽, 벤치 바로 위였다 손을 대 보니 미지근하다 방금 멎었다 열두 시부터 십 분, 따뜻한 바람이 벤치로 내려오게 돼 있었다',
        scene: ['그때 편의점 쪽에서 교복 입은 애가 뛰어나와 벤치에 앉았다 뒤이어 어른 둘 셋이 어깨를 웅크리고 붙어 앉는다 배기구는 조용하다', '6번 패널로 돌아가면 관리자 모드로 예약을 새로 걸 수 있다'],
      },
    },

    sched: {
      title: '6번 예약 다시 걸기',
      scene: 'hall',
      intro: '관리자 모드라 동전 없이 예약을 걸 수 있다 시작 시각, 운전 시간, 온도',
      docs: ['bus', 'talk', 'note6'],
      hintCode: 'L-S04',
      hints: [
        '도현이가 애들 몇 시에 나간다 했니 버스는 정류장 시간표에',
        '애들 나오는 때부터 버스 올 때까지만 빈 통 오래 돌리지 말고 온도는 쪽지 봐',
        '00:10 20분 저온',
      ],
      initial: () => ({ start: '00:00', min: '10', temp: '저온' }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'sched-wrap');
        const step = (k, list, lab) => {
          const row = el('div', 'timer-dial'); const i = list.indexOf(d[k]);
          const prev = el('button', 'ctl', '◀'); prev.type = 'button'; prev.setAttribute('aria-label', `${lab} 앞으로`); prev.onclick = () => { d[k] = list[(i + list.length - 1) % list.length]; save(); };
          const next = el('button', 'ctl', '▶'); next.type = 'button'; next.setAttribute('aria-label', `${lab} 뒤로`); next.onclick = () => { d[k] = list[(i + 1) % list.length]; save(); };
          const v = el('b', 'timer-val', d[k] + (k === 'min' ? '분' : '')); v.dataset.k = k;
          row.append(el('span', 'gift-name', lab), prev, v, next); return row;
        };
        const ph = el('div', 'prop dpanel small'); ph.innerHTML = `<img src="${P}props/panel.webp" alt="6번 건조기 패널" decoding="async"><div class="lcd">예약 ${d.start}<br>${d.min}분 ${d.temp}</div>`;
        const dials = el('div', 'timer-dials'); dials.append(step('start', STARTS, '예약 시작'), step('min', MINS, '운전 시간'), step('temp', TEMPS, '온도'));
        const toM = (t) => { const [h, m] = t.split(':').map(Number); return h === 23 ? m - 60 : m; };
        const s0 = toM(d.start), s1 = s0 + Number(d.min);
        const pct = (m) => ((m + 10) / 50) * 100;
        const bar = el('figure', 'warm-bar');
        bar.innerHTML = `<div class="wb-track"><i class="wb-warm ${d.temp === '저온' ? 'low' : d.temp === '중온' ? 'mid' : 'high'}" style="left:${pct(s0)}%;width:${pct(s1) - pct(s0)}%"></i>${[-10, 0, 10, 20, 30, 40].map((m) => `<span class="wb-tick" style="left:${pct(m)}%">${m < 0 ? '23:50' : '00:' + String(m).padStart(2, '0')}</span>`).join('')}</div><figcaption>6번 배기구에서 더운 바람이 나오는 동안</figcaption>`;
        wrap.append(ph, dials, bar);
        return wrap;
      },
      commitLabel: '이대로 예약 걸기',
      check(d) {
        if (d.start === '00:10' && d.min === '20' && d.temp === '저온') return { ok: true };
        if (d.start === '00:00' && d.min === '10' && d.temp === '저온') return { ok: false, msg: '엄마가 걸어 둔 그대로다 그대로 두면 오늘 같은 밤이 또 온다' };
        return { ok: false, msg: '막대를 벤치에 앉은 사람들 쪽에 대 보니 맞지 않는다 예약을 다시 고른다' };
      },
      reveal: {
        title: '00:10, 20분, 저온',
        text: '액정에 「예약 00:10 · 20분 · 저온」 동전 칸은 「관리자」 예약은 하루짜리라 내일부터는 내가 밤마다 건다',
        scene: ['도현한테 문자를 보냈다 「이제 오백 원 안 넣으셔도 돼요 한 달 치 돌려드릴게요」 답은 바로 왔다 「됐어요 대신 내일 열두 시 십 분에 같이 봐요」'],
        ending: true,
        endingLabel: '다음 날 밤 열두 시 십 분, 뒷골목',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '자정의 버스 정류장, 지붕 위 배기구에서 내려오는 김 아래 붙어 앉은 세 사람과 모퉁이에서 지켜보는 두 사람, 멀리 막차가 온다',
    eyebrow: '11월 5일 목요일, 막차 오기 전',
    title: '빈 통으로 도는 이유',
    paragraphs: [
      '비가 밤사이 진눈깨비로 바뀌었다 열두 시 십 분, 편의점 문이 열리고 교복 입은 애가 가방을 메고 정류장으로 갔다 뒤로 작업복 차림의 아주머니 한 분, 점퍼 입은 아저씨 한 분',
      '정류장 지붕 위 배기구에서 김이 내려왔다 셋이 벤치에 붙어 앉았다 아주머니가 손을 위로 뻗어 보더니 웃었다 "여기 따뜻하네"',
      '"원래 열두 시였거든요" 도현이 말했다 "막차 바뀌고 나선 애들 나오기 전에 끝나 버렸죠"',
      '"엄마도 몰랐대 막차 바뀐 거"',
      '열두 시 반, 막차가 왔다 배기구 김이 딱 그때 멎었다 아저씨가 버스에 오르면서 빨래방 뒷벽을 한 번 올려다봤다',
    ],
    afterword: '6번 위에 새 쪽지를 붙였다 「6번은 밤 12시 10분부터 20분 정류장 담당 손대지 말 것」 엄마 쪽지는 떼지 않고 그 아래 나란히 붙였다',
    unlockDoc: 'final',
    next: { href: 'episode.html?case=radio', title: '끝나지 않은 방송', line: '다음은 꺼진 마이크의 새벽 두 시 이야기입니다' },
  },
};
