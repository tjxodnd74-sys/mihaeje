// 고양이의 초대장 — ★2 이야기·자료·장치가 전부 이 파일에 있습니다
const P = 'assets/v2/cat-invite/';
const js = (w, a, b) => { const c = w.charCodeAt(w.length - 1); if (c < 0xac00 || c > 0xd7a3) return w + a; return w + ((c - 0xac00) % 28 ? a : b); }; // 받침 있음→a, 없음→b

// 장치 0: 미정 씨가 보낸 포장지 띠 접기 (반쪽 글자 맞붙이기)
// 칸 경계마다 글자가 반쪽씩 걸려 있다 칸을 뒤로 접어 넣으면 양옆 칸이 맞붙는다
// 짝이 맞는 반쪽끼리만 온전한 글자가 된다 → 3·6번째 칸을 접어야 「병원창턱」 (빵·꽃·감·집 반쪽은 함정)
const FOLD = [
  { L: null, R: '병' }, { L: '병', R: '원' }, { L: '빵', R: '꽃' }, { L: '원', R: '창' },
  { L: '창', R: '턱' }, { L: '감', R: '집' }, { L: '턱', R: null },
];
const FOLD_ANSWER = [2, 5];
function foldPanelSvg(p) {
  const g = (x, ch) => `<text x="${x}" y="96" font-size="84" text-anchor="middle" fill="#2f3a7a" font-family="MihaejeHand, serif">${ch}</text>`;
  return `<svg viewBox="0 0 100 140" aria-hidden="true">${p.L ? g(0, p.L) : ''}${p.R ? g(100, p.R) : ''}</svg>`;
}
// 예전 저장본(포장지 장치가 없던 판)에서 이미 골목 장치를 푼 사람은 포장지도 푼 것으로 본다
const legacy = (S) => { if (!S.solved.includes('fold') && ['seasons', 'gifts', 'mailbox', 'seats'].some((d) => S.solved.includes(d))) S.solved.unshift('fold'); };

// 다시 그릴 때 창이 스크롤돼 위쪽 주머니가 밀려나지 않게 (누른 순간의 스크롤 위치로 되돌림)
function keepScroll(node, fn) {
  const box = []; for (let n = node.parentElement; n; n = n.parentElement) if (n.scrollHeight > n.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(n).overflowY)) box.push([n, n.scrollTop]);
  const win = window.scrollY; fn();
  const back = () => { box.forEach(([n, t]) => { n.scrollTop = t; }); if (window.scrollY !== win) window.scrollTo(0, win); };
  back(); requestAnimationFrame(back);
}

// 장치 1: 봄이 사진 다섯 장을 찍은 순서(계절)대로
const PHOTOS = [
  { id: 'kitten', label: '벚꽃 아래 B', img: P + 'props/cat-kitten.webp', season: '봄' },
  { id: 'summer', label: '수박 옆', img: P + 'props/cat-summer.webp', season: '여름' },
  { id: 'autumn', label: '낙엽 위', img: P + 'props/cat-autumn.webp', season: '가을' },
  { id: 'winter', label: '눈 오는 날', img: P + 'props/cat-winter.webp', season: '겨울' },
  { id: 'spring', label: '벚꽃 아래 A', img: P + 'props/cat-spring.webp', season: '봄' },
];
const ORDER = ['kitten', 'summer', 'autumn', 'winter', 'spring'];
const TRAY = ['autumn', 'spring', 'winter', 'kitten', 'summer'];
// 사진 뒷면에 은호가 한 글자씩 적어 둠 찍은 순서대로 꽂아야 뒷면이 비쳐 「빵집바구니」
const BACK = { kitten: '빵', summer: '집', autumn: '바', winter: '구', spring: '니' };

// 장치 2: 선물과 보낸 사람 맞추기 (병원 간판 초록 십자 · 빵집 노란 차양 · 지후는 남는 색 · 미정은 리본 없음)
const GIFTS = [
  { id: 'blue', label: '파란 리본 상자' },
  { id: 'yellow', label: '노란 리본 상자' },
  { id: 'green', label: '초록 리본 봉투' },
  { id: 'flower', label: '리본 없는 꽃다발' },
];
const PEOPLE = [
  { id: 'eunho', name: '은호', job: '동물병원' },
  { id: 'soyeon', name: '소연', job: '빵집' },
  { id: 'jihu', name: '지후', job: '우체부' },
  { id: 'mijeong', name: '미정', job: '꽃집' },
];
const GIFT_ANSWER = { blue: 'jihu', yellow: 'soyeon', green: 'eunho', flower: 'mijeong' };

// 장치 3: 발도장 겹쳐 보기 → 우체통 자물쇠 (봄이가 병원에 처음 온 날 4/16)
// 발도장 모양: 기본 발가락 넷 + 바닥 패드 / 봄이는 왼쪽 끝 발가락이 안으로 굽고 패드 오른쪽 아래가 패였다
const TOES = [[24, 42, 7, 9, -22], [40, 27, 7, 9.5, -8], [60, 27, 7, 9.5, 8], [76, 42, 7, 9, 22]];
const PAD = 'M50 47 C61 47 72 55 72 66 C72 76 63 80 57 78 C54 77 52 75 50 75 C48 75 46 77 43 78 C37 80 28 76 28 66 C28 55 39 47 50 47 Z';
const PAWS = {
  bom: { bend: 0, nick: [62, 76] },
  bent: { bend: 0 }, // 굽은 발가락은 같고 패인 자리가 없음
  nicked: { nick: [62, 76] }, // 패인 자리는 같고 발가락이 곧음
  dog: { dog: true }, // 병원 강아지 발 (크고 발톱 자국)
};
function pawShapes(kind) {
  const p = PAWS[kind];
  const toes = TOES.map((t, i) => (p.bend === i ? [29, 36, 7, 9, 14] : t)).map(([cx, cy, rx, ry, rot]) => (p.dog ? [cx, cy - 2, rx * 1.05, ry * 1.3, rot] : [cx, cy, rx, ry, rot]));
  return { toes, nick: p.nick, dog: p.dog };
}
// 찍힌 도장 한 개 (먹 또는 빨간 잉크)
function pawSvg(kind, { ink = '#2b2420', paper = '#fbf6ea', cls = '', label = '발도장' } = {}) {
  const { toes, nick, dog } = pawShapes(kind);
  const g = dog ? ' transform="translate(50 56) scale(1.12) translate(-50 -56)"' : '';
  return `<svg viewBox="0 0 100 100" class="paw ${cls}" role="img" aria-label="${label}"><g${g} fill="${ink}">${toes.map(([cx, cy, rx, ry, rot]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})"/>`).join('')}<path d="${PAD}"/>${dog ? toes.map(([cx, cy, , ry]) => `<path d="M${cx - 2} ${cy - ry - 1} L${cx} ${cy - ry - 7} L${cx + 2} ${cy - ry - 1} Z"/>`).join('') : ''}${nick ? `<circle cx="${nick[0]}" cy="${nick[1]}" r="4.2" fill="${paper}"/>` : ''}</g></svg>`;
}
// 트레이싱지에 옮겨 그린 초대장 도장 (빨간 선 + 옅은 칠, 패인 자리는 비워 둠)
function tracingSvg() {
  const { toes, nick } = pawShapes('bom');
  return `<svg viewBox="0 0 100 100" class="paw tracing" aria-hidden="true"><defs><mask id="trnick"><rect width="100" height="100" fill="#fff"/><circle cx="${nick[0]}" cy="${nick[1]}" r="4.2" fill="#000"/></mask></defs><g mask="url(#trnick)" fill="rgba(214,58,58,.42)" stroke="#d63a3a" stroke-width="1.1">${toes.map(([cx, cy, rx, ry, rot]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})"/>`).join('')}<path d="${PAD}"/></g><circle cx="${nick[0]}" cy="${nick[1]}" r="4.2" fill="none" stroke="#d63a3a" stroke-width="1.1"/></svg>`;
}
const BOOK = [
  { paw: 'bent', date: '2024/3/28', note: '처음 진료 · 귀 진드기' },
  { paw: 'nicked', date: '2023/11/2', note: '처음 진료 · 앞발 상처' },
  { paw: 'bom', date: '2024/4/16', note: '처음 진료 · 예방 접종' },
  { paw: 'dog', date: '2025/1/9', note: '처음 진료 · 발톱 정리' },
];
const MAIL_CODE = [0, 4, 1, 6];

// 장치 4: 평상 자리
const SEATS = [
  { id: 'tree', label: '감나무 쪽' },
  { id: 'post', label: '우체통 쪽' },
  { id: 'shop', label: '꽃집 쪽' },
  { id: 'lane', label: '골목 입구 쪽' },
];
// 평상을 둘러싼 자리: 감나무(북) → 우체통(동) → 꽃집(남) → 골목 입구(서), 시계 방향
// 은호: 감나무 맞은편(꽃집 쪽) / 소연: 은호의 왼손 쪽(꽃집 쪽에서 감나무를 보고 앉으면 왼손은 그림의 왼쪽=골목 입구 쪽) / 미정: 꽃집 문이 보이는 자리(감나무 쪽) / 지후: 남는 자리(우체통 쪽)
const SEAT_ANSWER = { tree: 'mijeong', lane: 'soyeon', shop: 'eunho', post: 'jihu' };

const GIFT_OF = { eunho: ['초록 봉투', '#2f8a4a'], soyeon: ['노란 상자', '#9a7400'], jihu: ['파란 상자', '#2f6fd0'], mijeong: ['꽃다발', '#c2416a'] };
function seatChart(d = {}) {
  const ink = '#3a3a3a';
  const names = Object.fromEntries(PEOPLE.map((p) => [p.id, GIFT_OF[p.id][0]]));
  const pen = (dd, w = 1) => `<path d="${dd}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const txt = (x, y, size, t, fill = ink, fit = 0) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" fill="${fill}" font-family="MihaejeHand, serif"${fit ? ` textLength="${fit}" lengthAdjust="spacingAndGlyphs"` : ''}>${t}</text>`;
  const seat = (id, x, y, label) => {
    const who = d[id];
    // 선물을 놓아도 자리 이름은 작게 남는다
    // 빈 방석도 종이색으로 채워 평상 테두리 선이 이름 밑으로 지나가지 않게, 긴 이름(골목 입구 쪽)은 칸 안에 들어가게 조금 작게
    return `<g class="seat-box${who ? ' named' : ''}" data-seat="${id}" role="button" tabindex="0" aria-label="${label} 방석${who ? ': ' + names[who] : ' (비어 있음)'}"><rect x="${x - 15}" y="${y - 8}" width="30" height="16" rx="5" fill="rgba(255,255,255,.01)"/><rect x="${x - 13}" y="${y - 6}" width="26" height="12" fill="${who ? 'rgba(255,255,255,.7)' : 'rgba(253,252,248,.94)'}"/>${pen(`M${x - 13} ${y - 6} h26 v12 h-26 z`, 1.1)}${who ? txt(x, y - 1.4, 4.7, label, '#6b6157', label.length > 5 ? 24 : 0) + txt(x, y + 4.6, 5, names[who], GIFT_OF[who][1]) : txt(x, y + 1.8, 5, label, ink, label.length > 5 ? 24 : 0)}</g>`;
  };
  return `<svg viewBox="0 0 120 100" class="seat-chart" role="img" aria-label="평상 자리표">
   ${pen('M32 34 h56 v32 h-56 z', 1.7)}${pen('M35 40 h50 M35 46 h50 M35 52 h50 M35 58 h50', 0.45)}
   ${txt(60, 52, 6, '평상')}
   ${pen('M60 3 v6 M53 7 c2 -6 12 -6 14 0 c3 -3 5 2 1 4 c-5 2 -11 2 -16 0 c-4 -2 -2 -7 1 -4 z', 0.8)}${txt(77, 9.5, 5, '감나무')}
   ${pen('M111 42 h8 v12 h-8 z M115 54 v8 M112 46 h6', 0.8)}${txt(114, 68, 5, '우체통')}
   ${pen('M46 93 h28 v6 h-28 z M60 93 v6 M46 93 l14 -5 l14 5', 0.8)}${txt(35, 97.5, 5, '꽃집 문')}
   ${pen('M4 63 l5 6 l-5 6 M11 63 l5 6 l-5 6', 0.7)}${txt(11, 82, 5, '골목 입구')}
   ${seat('tree', 60, 25, '감나무 쪽')}${seat('post', 95, 50, '우체통 쪽')}${seat('shop', 60, 76, '꽃집 쪽')}${seat('lane', 22, 50, '골목 입구 쪽')}
  </svg>`;
}
const REQUESTS = `<div class="notes-list seat-notes"><p><b>은호</b> 봄이는 분명 감나무에 올라가 있을 거예요 나무가 정면으로 보이는 자리로 주세요</p><p><b>소연</b> 은호 씨 왼손 쪽에 앉을게요 접시 건네기 편하게</p><p><b>미정</b> 가게 문이 바로 보이는 자리요 손님 오면 일어나야 해서</p><p><b>지후</b> 저는 아무 데나요 남는 자리 주세요</p></div>`;

const EP = {
  id: 'cat-invite',
  number: '009',
  title: '고양이의 초대장',
  subtitle: '봄이 앞으로 온 봉투',
  genre: '반려동물 · 따뜻한 미스터리',
  minutes: 25,
  difficulty: 2,
  cover: P + 'cover.webp',
  coverAlt: '포장 가게 창턱에 엎드려 자는 고양이와 바닥의 봉투',
  music: 'assets/music/cat-invite-v33.mp3',
  tagline: '받는 사람: 봄이\n보낸 사람 자리엔 발바닥 도장 하나',
  blurb: '작년 초여름, 골목 고양이 봄이를 집에 들인 다은\n어느 아침 가게 문 밑으로 봄이 앞으로 온 봉투가 들어왔습니다',
  storageKey: 'mihaeje-v2-cat-invite',
  hintTitle: '이웃들의 귀띔',
  tracesLabel: '이웃들이 남긴 것',

  opening: {
    eyebrow: '6월 12일, 아침',
    paragraphs: [
      '가게 문을 열다가 발밑에서 봉투를 밟을 뻔했다. 받는 사람 칸에는 「봄이」라고만 적혀 있고, 보낸 사람은 없었다. 대신 빨간 잉크로 찍은 발바닥 도장이 하나 있었다.',
      '봄이는 창턱에 앉아 그 봉투만 쳐다보고 있었다. 작년 6월까지 이 골목 전체가 돌보던 고양이였고, 그 초여름에 내가 집으로 데려왔다.',
      '동물병원 은호 씨, 빵집 소연 씨, 우체부 지후 씨, 꽃집 미정 씨. 봄이 덕분에 이름을 알게 된 사람들이다.',
      '봉투 안에는 종이가 두 장. 한 장엔 「6월 12일 저녁 일곱 시, 봄이를 데리고 오세요. 어디로 오는지는 봄이가 알아요.」 다른 한 장은 우리 가게 꽃무늬 포장지를 길게 자른 띠였다. 접는 선이 여러 줄 그어져 있었다.',
      '봄이가 알긴 뭘 알아, 하고 목덜미를 쓰다듬는데 목걸이에 못 보던 참이 달려 있었다. 봄이가 꼬리로 내 손목을 툭 쳤다.',
    ],
    cta: '가게 안을 둘러본다',
  },

  traces: [
    { device: 'fold', label: '미정의 포장지' },
    { device: 'seasons', label: '은호의 상자' },
    { device: 'gifts', label: '소연의 바구니' },
    { device: 'mailbox', label: '봄이의 발도장' },
    { device: 'seats', label: '지후의 자리표' },
  ],

  scenes: [
    {
      id: 'shop',
      name: '다은의 포장 가게',
      image: P + 'shop.webp',
      focusX: 30, // 휴대폰 첫 화면에 작업대 띠(x23)가 보이게
      arrive: '아침 해가 창턱까지 들어와 있다 봄이는 그 안에 앉아 문 밑 봉투만 보고 있다 목덜미에서 못 듣던 달각 소리가 났다',
      hotspots: [
        { id: 'envelope', x: 82, y: 80, r: 8, label: '문 밑으로 들어온 봉투', kind: 'doc', doc: 'invite' },
        { id: 'charm', x: 52, y: 25, r: 9, label: '봄이 목걸이의 참', kind: 'doc', doc: 'charm' },
        { id: 'strip', x: 23, y: 76, r: 9, label: '작업대 위 포장지 띠', kind: 'device', device: 'fold' },
        { id: 'go', x: 88, y: 45, r: 11, label: '골목으로 나가기', kind: 'travel', to: 'alley', visible: (S) => S.solved.includes('fold') },
      ],
    },
    {
      id: 'alley',
      name: '골목 · 동물병원과 빵집',
      image: P + 'alley.webp',
      unlockedBy: 'fold',
      // 휴대폰 첫 화면: 처음엔 병원 창턱 상자(x8), 상자를 풀면 빵집 바구니(x89)
      focusX: (S) => (S.solved.includes('seasons') ? 80 : 20),
      arrive: (S) => (legacy(S), S.solved.includes('gifts')
        ? '선물 넷은 종이 가방에 챙겨 들었다 봄이가 이번엔 골목 끝 쪽으로 자꾸 고개를 돌린다'
        : S.solved.includes('seasons')
        ? '봄이가 이번엔 빵집 쪽으로 코를 킁킁댔다 벤치 위 바구니에서 버터 냄새가 났다'
        : '봄이가 품에서 몸을 비틀더니 병원 창턱 쪽으로 고개를 쭉 뺐다 병원은 오늘 휴진이고 빵집은 아직 준비 중이다 병원 창턱에 상자가 하나 놓여 있다'),
      hotspots: [
        { id: 'vetnote', x: 26, y: 41, r: 7, label: '병원 유리문의 쪽지', kind: 'doc', doc: 'vetnote' },
        { id: 'box', x: 8, y: 60, r: 9, label: '창턱의 상자', kind: 'device', device: 'seasons' },
        // 상자를 풀기 전에도 그림 속 바구니를 누르면 반응한다 (자료 목록에는 안 들어가는 짧은 쪽지)
        { id: 'basketwait', x: 86, y: 74, r: 11, label: '벤치 위 바구니', kind: 'doc', doc: 'basketwait', visible: (S) => !S.solved.includes('seasons') },
        { id: 'basket', x: 89, y: 77, r: 9, label: '빵집 앞 바구니', kind: 'device', device: 'gifts', visible: (S) => S.solved.includes('seasons') },
        { id: 'basketnote', x: 78, y: 73, r: 6, label: '벤치 위 쪽지', kind: 'doc', doc: 'basketnote', visible: (S) => S.solved.includes('seasons') },
        { id: 'back', x: 50, y: 70, r: 10, label: '가게로 돌아가기', kind: 'travel', to: 'shop' },
      ],
    },
    {
      id: 'end',
      name: '골목 끝 · 꽃집과 평상',
      image: P + 'end.webp',
      unlockedBy: 'gifts',
      focusX: (S) => (S.solved.includes('mailbox') ? 62 : 80), // 처음엔 우체통(x90), 연 뒤엔 평상
      arrive: (S) => (legacy(S), S.solved.includes('seats')
        ? '봄이는 평상 한가운데 앉아 꼬리로 바닥을 톡톡 치고 있다 평상 밑에서 나온 봉투엔 받는 사람이 「다은」이라고 적혀 있다'
        : S.solved.includes('mailbox')
        ? '우체통 문이 열려 있다 봄이가 내 품에서 평상 쪽으로 자꾸 몸을 내민다'
        : '가게 일을 보다 골목 끝에 닿으니 해가 기울고 있었다 평상 위로 전구가 줄줄이 걸려 있고, 빨간 우체통엔 작은 자물쇠가 달려 있다 봄이가 품에서 평상 쪽으로 코를 킁킁댔다'),
      hotspots: [
        { id: 'mailbox', x: 90, y: 50, r: 9, label: '자물쇠 달린 우체통', kind: 'device', device: 'mailbox' },
        { id: 'chart', x: 60, y: 63, r: 12, label: '평상 차리기', kind: 'device', device: 'seats', visible: (S) => S.solved.includes('mailbox') },
      ],
    },
  ],

  docs: {
    invite: {
      title: '문 밑으로 들어온 봉투',
      kind: '받는 사람: 봄이',
      html: `<figure class="prop envelope"><img src="${P}props/envelope.webp" alt="발도장이 찍힌 봉투" decoding="async"><span class="env-to">봄이 앞</span></figure><div class="stamp-zoom">${pawSvg('bom', { ink: '#c8352f', paper: '#f6efe0', label: '봉투 구석의 빨간 발도장 가까이' })}<span>봉투 구석의 도장 가까이</span></div><blockquote class="hand many-hands"><span>6월 12일 저녁 일곱 시</span><br><span>봄이를 데리고 오세요</span><br><span>어디로 오는지는 봄이가 알아요</span></blockquote><p class="aside">줄마다 글씨가 다르다 몇 사람이 돌아가며 쓴 것 같다</p>`,
    },
    charm: {
      title: '봄이 목걸이의 참',
      kind: '어제 아침엔 없던 것',
      html: `<figure class="prop collar"><img src="${P}props/collar.webp" alt="청진기, 빵, 꽃 모양 나무 참이 달린 가죽 목걸이" decoding="async"></figure><p>작은 나무 조각 세 개가 가죽 목걸이 고리에 나란히 달려 있다 왼쪽부터 청진기, 빵, 꽃</p><p class="aside">봄이가 작년까지 아침마다 돌던 길도 이런 순서였다</p>`,
    },
    vetnote: {
      title: '병원 유리문의 쪽지',
      kind: '은호의 글씨',
      html: `<blockquote class="hand">다은 씨, 오늘 하루 휴진입니다<br>창턱에 봄이 상자 두고 갔어요<br>재작년부터 찍어 둔 사진인데, 찍은 순서대로 꽂아 봐요 순서가 맞으면 뒷면 글자가 비쳐요<br>벚꽃 사진이 두 장인데, 봄이가 얼마나 컸는지 보면 어느 해인지 알아요</blockquote>`,
    },
    basketnote: {
      title: '벤치 위 쪽지',
      kind: '소연의 글씨',
      html: `<blockquote class="hand">다은 씨!<br>선물은 넷, 누구 건지는 안 적었어요 맞혀 보세요<br>은호 씨랑 저는 리본을 각자 가게 밖에 내건 간판이나 차양 색으로 골랐고요<br>지후 씨는 남는 거 아무거나 하겠대요<br>미정 씨는 리본이 싫대요 꽃은 꽃으로 주면 된다고<br>다 맞혔으면 바구니를 들어 보세요</blockquote>`,
    },
    booklet: {
      title: '은호 씨 병원의 발도장 기록',
      kind: '상자 바닥에서 나온 한 장',
      html: `<div class="paw-book">${BOOK.map((b, i) => `<div class="paw-cell">${pawSvg(b.paw, { label: `${i + 1}번째 발도장` })}<span class="nw">${b.date}</span><small>${b.note}</small><em>이름 칸 접힘</em></div>`).join('')}</div><blockquote class="hand">골목 아이들 처음 왔을 때 찍어 둔 발도장이에요 이름 칸은 접어 놨어요 누가 봄이인지는 발 보면 알죠? — 은호</blockquote>`,
    },
    mail: {
      title: '우체통의 봉투',
      kind: '지후의 글씨',
      html: `<blockquote class="hand">다은 씨께<br>오늘 저녁 모임 자리표예요 네 사람 부탁은 자리표 종이 아래에 적어 뒀어요<br>자리 정해지면 각자 선물을 그 자리 방석에 놓아 주세요 봄이가 어디 앉나 보게요</blockquote><p class="aside">평상 자리는 감나무 쪽, 우체통 쪽, 꽃집 쪽, 골목 입구 쪽 넷이다</p>`,
    },
    final: {
      title: '평상 밑 봉투의 초대장',
      kind: '받는 사람: 다은',
      locked: true,
      html: `<figure class="prop envelope"><img src="${P}props/envelope.webp" alt="발도장이 찍힌 봉투" decoding="async"><span class="env-to">다은 앞</span></figure><blockquote class="hand">봄이의 첫 번째 가족 기념일에 초대합니다<br>작년 6월 12일, 봄이는 다은 씨 집으로 갔고<br>우리는 그날부터 다은 씨 이웃이 됐어요<br>봄이 핑계로 매일 가게 앞을 지나가던 건 사실 다은 씨 보려고요<br>이번엔 식탁에 같이 앉아요<br>— 은호, 소연, 지후, 미정</blockquote>`,
    },
  },

  devices: {
    fold: {
      title: '작업대 위 포장지 띠',
      scene: 'shop',
      intro: '봉투에서 나온 꽃무늬 포장지 띠 칸 경계마다 글자가 반쪽씩 걸려 있다 칸을 누르면 그 칸이 뒤로 접혀 들어가고, 아래 펴기 버튼으로 다시 편다',
      docs: ['invite'],
      hintCode: 'C-S05',
      hints: [
        '칸을 하나 접으면 그 양옆 칸이 맞붙어요 맞붙은 자리의 반쪽 글자를 봐요',
        '짝이 맞는 반쪽 글자가 서로 떨어져 있는 곳이 두 군데 있어요 그 사이에 낀 칸만 접어 넣어요',
        '셋째 칸과 여섯째 칸을 접으면 「병원 창턱」',
      ],
      initial: () => ({ tucked: [] }),
      render(ctx) {
        const { d, S, el, save } = ctx;
        const solved = S.solved.includes('fold');
        if (!Array.isArray(d.tucked)) d.tucked = [];
        if (solved) d.tucked = [...FOLD_ANSWER]; // 풀린 띠는 맞게 접힌 모양 그대로
        const wrap = el('div', 'foldwrap');
        const strip = el('div', 'fold-strip' + (d.tucked.length ? ' folded' : '')); strip.setAttribute('role', 'group'); strip.setAttribute('aria-label', '포장지 띠 일곱 칸');
        FOLD.forEach((p, i) => {
          if (d.tucked.includes(i)) return;
          const b = el('button', 'fold-panel' + (i > 0 && d.tucked.includes(i - 1) ? ' crease' : '')); b.type = 'button';
          b.setAttribute('aria-label', solved ? `${i + 1}번째 칸` : `${i + 1}번째 칸 접어 넣기`);
          if (solved) b.disabled = true;
          b.innerHTML = `${foldPanelSvg(p)}<span class="fold-num">${i + 1}</span>`;
          b.onclick = () => { if (solved) return; d.tucked = [...d.tucked, i].sort((a, z) => a - z); save(); ctx.status(`${i + 1}번째 칸을 뒤로 접어 넣었다`); };
          strip.append(b);
        });
        wrap.append(strip);
        const row = el('div', 'fold-undo');
        if (solved) row.append(el('span', 'pick-label', '「병원 창턱」으로 읽히게 접어 둔 채다'));
        else if (d.tucked.length) {
          row.append(el('span', 'pick-label', '접어 넣은 칸'));
          d.tucked.forEach((i) => { const b = el('button', 'chip', `${i + 1}번째 칸 펴기`); b.type = 'button'; b.onclick = () => { d.tucked = d.tucked.filter((x) => x !== i); save(); }; row.append(b); });
        } else row.append(el('span', 'pick-label', '아직 다 펼친 채다'));
        wrap.append(row);
        wrap.append(el('p', 'fold-note', '띠 귀퉁이에 작은 글씨 「포장 가게 사장님이면 이 정도는 금방 접죠? — 미정」'));
        return wrap;
      },
      commitLabel: '접은 띠 읽기',
      check(d) {
        const t = d.tucked || [];
        if (!t.length) return { ok: false, msg: '펼친 채로는 칸 경계마다 반쪽 글자가 엇갈려서 읽히지 않는다' };
        if (t.length === FOLD_ANSWER.length && FOLD_ANSWER.every((i) => t.includes(i))) return { ok: true };
        return { ok: false, msg: '접힌 자리에서 반쪽 글자가 맞물리지 않는다 이상한 글자가 생겼다' };
      },
      reveal: {
        title: '미정 씨의 포장지',
        text: '칸 둘을 뒤로 접어 넣자 반쪽 글자들이 맞붙어 한 줄이 됐다 「병원 창턱」',
        scene: ['접어 넣은 두 칸 가장자리엔 빵, 꽃, 감, 집의 반쪽이 걸려 있었다 헷갈리라고 일부러 넣은 거다 봄이가 창턱에서 꼬리로 유리를 탁 치더니 문 쪽을 봤다'],
        unlock: 'alley',
      },
    },

    seasons: {
      title: '창턱의 상자',
      scene: 'alley',
      intro: '택배 상자를 여니 나무 사진함이 들어 있다 뚜껑 안쪽에 사진 주머니가 다섯 아래 사진을 누르면 왼쪽 빈 주머니부터 꽂히고, 꽂힌 사진을 누르면 빠진다 다 꽂으면 뒷면을 비춰 읽는다',
      docs: ['vetnote'],
      hintCode: 'C-S01',
      hints: [
        '사진마다 계절이 보여요 그리고 봄이 크기도요',
        '계절은 한 바퀴 돌아요 벚꽃 두 장은 봄이가 작은 쪽과 큰 쪽이 서로 다른 해예요',
        '벚꽃 아래 B(작은 봄이) → 수박 옆 → 낙엽 위 → 눈 오는 날 → 벚꽃 아래 A(다 큰 봄이)',
      ],
      initial: () => ({ slots: [null, null, null, null, null] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'seasons');
        const lid = el('div', 'prop boxlid'); const im = el('img'); im.src = P + 'props/boxlid.webp'; im.alt = '뚜껑 안쪽의 사진 주머니 다섯'; lid.append(im);
        const xs = [10.3, 26.9, 43.5, 60.1, 76.7];
        d.slots.forEach((pid, i) => {
          const s = el('button', 'pocket' + (pid ? ' filled' : '')); s.type = 'button'; s.style.left = xs[i] + '%';
          s.setAttribute('aria-label', `${i + 1}번째 주머니${pid ? ': ' + PHOTOS.find((p) => p.id === pid).label : ''}`);
          if (pid) { const ph = PHOTOS.find((p) => p.id === pid); const pi = el('img'); pi.src = ph.img; pi.alt = ph.label; s.append(pi); }
          else s.append(el('span', 'pocket-num', String(i + 1)));
          s.onclick = () => { if (pid) { d.slots[i] = null; keepScroll(s, save); } };
          lid.append(s);
        });
        wrap.append(lid);
        // 꽂은 상태를 글로도 한 줄 (모바일에서 위쪽 주머니가 화면 밖일 때)
        wrap.append(el('p', 'pick-label pocket-line', '주머니 · ' + d.slots.map((p, i) => `${i + 1} ${p ? PHOTOS.find((x) => x.id === p).label : '빈칸'}`).join(' / ')));
        const tray = el('div', 'photo-tray');
        TRAY.map((id) => PHOTOS.find((p) => p.id === id)).forEach((p) => {
          const used = d.slots.includes(p.id);
          const b = el('button', 'photo-pick' + (used ? ' used' : '')); b.type = 'button'; b.disabled = used; b.setAttribute('aria-label', p.label + (used ? ' (꽂았음)' : ' 사진 넣기'));
          const pi = el('img'); pi.src = p.img; pi.alt = p.label; b.append(pi, el('span', '', p.label));
          b.onclick = () => { const i = d.slots.indexOf(null); if (i < 0) return; d.slots[i] = p.id; keepScroll(b, save); ctx.status(`${p.label} 사진을 ${i + 1}번째 주머니에 꽂았다`); };
          tray.append(b);
        });
        wrap.append(el('p', 'pick-label', '상자 옆에 흩어진 사진'), tray);
        return wrap;
      },
      commitLabel: '뒷면 비춰 읽기',
      check(d) {
        if (d.slots.includes(null)) return { ok: false, msg: '주머니 다섯을 다 채워야 비춰 읽을 수 있다' };
        if (d.slots.every((p, i) => p === ORDER[i])) return { ok: true };
        return { ok: false, msg: '햇빛에 비춰 봤지만 뒷면 글자가 서로 겹쳐서 읽히지 않는다 계절이 이어지는 순서와 봄이 크기를 다시 본다' };
      },
      reveal: {
        title: '두 번의 봄',
        text: `사진을 다 꽂고 햇빛에 비추자 뒷면 글자가 한 줄로 이어졌다 「${ORDER.map((p) => BACK[p]).join('')}」`,
        scene: [
          '「봄이가 골목에 온 게 재작년 봄이었어요 손바닥만 했는데 다은 씨가 데려가기 전까지 다섯 계절을 우리가 봤어요 — 은호」',
          '상자 바닥에는 종이 한 장이 깔려 있었다 발도장이 넷 찍힌 종이다 봄이는 그 냄새를 한참 맡더니 빵집 쪽으로 고개를 돌렸다',
        ],
        unlock: null,
        unlockDoc: 'booklet',
      },
    },

    gifts: {
      title: '빵집 앞 바구니',
      scene: 'alley',
      intro: '바구니에 선물 넷과 빈 이름표 넷 선물을 누르고 아래에서 이름을 고르면 이름표에 적힌다 다 달았으면 바구니를 들어 본다',
      docs: ['basketnote'],
      hintCode: 'C-S02',
      hints: [
        '소연 씨 쪽지에 리본 고른 방법이 적혀 있어요',
        '골목 그림에서 병원과 빵집이 가게 밖에 내건 간판과 차양 색을 찾아보세요 남는 두 선물은 쪽지의 나머지 두 사람 얘기로 정해져요',
        '초록 리본 봉투 → 은호, 노란 리본 상자 → 소연, 파란 리본 상자 → 지후, 꽃다발 → 미정',
      ],
      initial: () => ({ who: {} }),
      render(ctx) {
        const { d, el, save } = ctx;
        delete d.pick; // 예전 저장본에 남은 '고르는 중' 상태는 버린다 (지금 고르는 선물은 창을 열 때마다 새로)
        const pick = ctx.pick || null;
        const choose = (gid) => { ctx.pick = ctx.pick === gid ? null : gid; save(); };
        const wrap = el('div', 'gifts');
        const basket = el('div', 'prop basket'); const im = el('img'); im.src = P + 'props/basket.webp'; im.alt = '선물 넷이 든 바구니'; basket.append(im);
        const pos = { blue: [35, 37], yellow: [63.5, 37], green: [36, 77], flower: [67, 81] };
        GIFTS.forEach((g) => {
          const [x, y] = pos[g.id]; const who = PEOPLE.find((p) => p.id === d.who[g.id]);
          const t = el('button', 'tag' + (who ? ' named' : '') + (pick === g.id ? ' picking' : '')); t.type = 'button'; t.style.left = x + '%'; t.style.top = y + '%';
          t.setAttribute('aria-label', `${g.label}의 이름표${who ? ': ' + who.name : ' (비어 있음)'}`);
          t.textContent = who ? who.name : '?';
          t.onclick = () => choose(g.id);
          basket.append(t);
        });
        wrap.append(basket);
        // 선물 줄 (사진 위 이름표가 작은 화면에서도 누르기 쉽게)
        const grow = el('div', 'gift-pick-row');
        GIFTS.forEach((g) => { const who = PEOPLE.find((p) => p.id === d.who[g.id]); const b = el('button', 'chip' + (pick === g.id ? ' on' : ''), `${g.label} · ${who ? who.name : '?'}`); b.type = 'button'; b.setAttribute('aria-label', `${g.label} 고르기`); b.onclick = () => choose(g.id); grow.append(b); });
        wrap.append(grow);
        // 이름 고르는 줄은 늘 같은 자리에 (눌러도 화면이 튀지 않게)
        const g = GIFTS.find((x) => x.id === pick);
        const namebox = el('div', 'name-box');
        namebox.append(el('p', 'pick-label', g ? `${g.label}의 이름표에 쓸 이름` : '위에서 선물을 하나 고르면 이름을 쓸 수 있다'));
        const row = el('div', 'pick-row');
        PEOPLE.forEach((p) => { const b = el('button', 'chip' + (g && d.who[g.id] === p.id ? ' on' : ''), p.name); b.type = 'button'; b.disabled = !g; b.setAttribute('aria-label', g ? `${js(g.label, '은', '는')} ${p.name}` : `${p.name} (선물을 먼저 고른다)`); b.onclick = () => { if (!g) return; d.who[g.id] = p.id; ctx.pick = null; save(); }; row.append(b); });
        namebox.append(row);
        wrap.append(namebox);
        return wrap;
      },
      commitLabel: '바구니 들어 보기',
      check(d) {
        const missing = GIFTS.filter((g) => !d.who[g.id]);
        if (missing.length) return { ok: false, msg: `${missing[0].label} 이름표가 아직 비어 있다` };
        if (GIFTS.every((g) => d.who[g.id] === GIFT_ANSWER[g.id])) return { ok: true };
        return { ok: false, msg: '바구니를 들어 봤는데 바닥이 비어 있다 쪽지를 다시 읽고 골목을 한 번 더 둘러본다' };
      },
      reveal: {
        title: '네 사람, 네 색',
        text: '바구니를 들자 바닥에 쪽지가 붙어 있었다 「다 맞혔죠? 골목 끝 평상에 전구 달아 놨어요 거기 우체통부터 열어 봐요 — 소연」',
        scene: [
          '노란 리본 상자에서 버터 냄새가 났다 소연 씨는 작년에 봄이한테 빵 부스러기를 주다가 은호 씨한테 혼난 적이 있다 그 뒤로는 봄이 전용 간식을 따로 구웠다',
          '전구라니 저녁 일곱 시가 무슨 날인지 아직도 모르겠다 가게로 돌아가 손님 둘을 받고, 해가 기울 무렵 골목 끝으로 걸었다',
        ],
        unlock: 'end',
      },
    },

    mailbox: {
      title: '자물쇠 달린 우체통',
      scene: 'end',
      intro: '우체통에 네 자리 자물쇠와 꼬리표 하나 초대장 도장을 따라 그린 트레이싱지가 있다 발도장을 누르면 트레이싱지가 그 위에 얹히고, 아래 다이얼은 ▲▼로 돌린다',
      docs: ['booklet', 'invite'],
      hintCode: 'C-S03',
      hints: [
        '꼬리표에 번호가 뭔지 적혀 있어요 먼저 기록 종이의 발도장 넷 중 초대장 도장과 같은 발을 찾아요',
        '트레이싱지를 하나씩 얹어 봐요 발가락 하나, 패드 끝 하나까지 다 맞는 발이 있어요 그 칸 날짜가 번호예요',
        '셋째 발도장 2024/4/16 → 0416',
      ],
      initial: () => ({ over: null, dial: [0, 0, 0, 0] }),
      render(ctx) {
        const { d, el, save } = ctx;
        if (!Array.isArray(d.dial)) d.dial = [0, 0, 0, 0];
        const wrap = el('div', 'mailbox-wrap');
        const tag = el('div', 'mail-tag'); tag.innerHTML = '<span class="hand">자물쇠 번호는 그 초대장에 발도장 찍은 친구가 은호 씨 병원에 처음 온 날이에요 (월일 네 자리) — 지후</span>';
        wrap.append(tag);
        const book = el('div', 'paw-book live');
        BOOK.forEach((b, i) => {
          const cell = el('button', 'paw-cell' + (d.over === i ? ' over' : '')); cell.type = 'button';
          cell.setAttribute('aria-label', `${i + 1}번째 발도장에 트레이싱지 ${d.over === i ? '걷기' : '얹기'}`);
          cell.innerHTML = `<span class="paw-stack">${pawSvg(b.paw, { label: `${i + 1}번째 발도장` })}${d.over === i ? tracingSvg() : ''}</span><span class="nw">${b.date}</span><small>${b.note}</small>`;
          cell.onclick = () => { d.over = d.over === i ? null : i; save(); };
          book.append(cell);
        });
        wrap.append(book);
        wrap.append(el('p', 'pick-label', d.over === null ? '트레이싱지는 지금 손에 들고 있다' : `트레이싱지를 ${d.over + 1}번째 발도장 위에 얹었다`));
        // 휴대폰: 발도장 칸이 작아서 겹친 모습을 크게 한 번 더 (얹기 전엔 손에 든 트레이싱지만, 자리 크기는 같게)
        const zoom = el('div', 'trace-zoom mobile-only'); zoom.setAttribute('aria-hidden', 'true');
        zoom.innerHTML = `<span class="paw-stack">${d.over === null ? '' : pawSvg(BOOK[d.over].paw)}${tracingSvg()}</span><small>${d.over === null ? '손에 든 트레이싱지' : `${d.over + 1}번째 발도장 위 · 크게`}</small>`;
        wrap.append(zoom);
        const row = el('div', 'dials mail-dials');
        for (let i = 0; i < 4; i++) {
          const col = el('div', 'dial');
          const up = el('button', 'ctl', '▲'); up.type = 'button'; up.setAttribute('aria-label', `${i + 1}번째 자리 올리기`); up.onclick = () => { d.dial[i] = (d.dial[i] + 1) % 10; save(); };
          const num = el('b', 'num', String(d.dial[i]));
          const dn = el('button', 'ctl', '▼'); dn.type = 'button'; dn.setAttribute('aria-label', `${i + 1}번째 자리 내리기`); dn.onclick = () => { d.dial[i] = (d.dial[i] + 9) % 10; save(); };
          col.append(up, num, dn); row.append(col);
        }
        wrap.append(row);
        return wrap;
      },
      commitLabel: '자물쇠 당겨 보기',
      check(d) {
        const s = d.dial.join('');
        if (s === MAIL_CODE.join('')) return { ok: true };
        if (s === '0612') return { ok: false, msg: '6월 12일은 오늘이다 꼬리표는 처음 병원에 온 날이라고 했다' };
        return { ok: false, msg: '자물쇠가 꿈쩍 않는다 트레이싱지를 한 번 더 얹어 본다' };
      },
      reveal: {
        title: '봄이의 앞발',
        text: '셋째 발도장 위에서 트레이싱지 선이 발가락 끝까지 꼭 맞았다 2024년 4월 16일, 손바닥만 하던 봄이가 처음 병원에 온 날이다 자물쇠가 툭 풀렸다',
        scene: ['초대장 도장은 정말 봄이 발로 찍은 거였다 봄이는 내 품에서 그것도 몰랐냐는 듯 하품을 했다 우체통 안에 지후 씨 글씨로 「다은 씨」라고 적힌 봉투가 있었다'],
        unlock: null,
        unlockDoc: 'mail',
      },
    },

    seats: {
      title: '평상 차리기',
      scene: 'end',
      intro: '지후 씨 자리표 종이 선물을 하나 누르고 방석을 누르면 놓인다 놓인 선물을 누르면 다시 들고, 다른 선물을 든 채 누르면 서로 바꾼다 다 놓으면 봄이를 평상에 내려놓는다',
      docs: ['mail'],
      hintCode: 'C-S04',
      hints: [
        '은호 씨부터 "나무가 정면으로 보이는 자리"는 감나무 쪽일까요 감나무를 마주 보는 자리일까요',
        '은호 씨 자리가 정해지면 나머지 부탁은 앉은 사람이 어느 쪽을 보고 있는지로 풀어요 왼손도, 보이는 자리도 다 앉은 사람 기준이에요',
        '꽃집 쪽에 초록 봉투(은호), 골목 입구 쪽에 노란 상자(소연), 감나무 쪽에 꽃다발(미정), 우체통 쪽에 파란 상자(지후)',
      ],
      initial: () => ({ seat: {}, hold: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        d.hold ??= null;
        const wrap = el('div', 'seats');
        const chart = el('div', 'prop paperchart'); chart.innerHTML = `<img src="${P}props/paper.webp" alt="지후 씨 봉투에서 나온 자리표 종이" decoding="async"><div class="chart-on-paper">${seatChart({ ...d.seat })}</div>`;
        const goSeat = (sid) => {
          if (d.seat[sid]) { const back = d.seat[sid]; delete d.seat[sid]; if (d.hold) d.seat[sid] = d.hold; d.hold = back; save(); return; }
          if (!d.hold) { ctx.status('먼저 아래에서 선물을 하나 든다'); return; }
          d.seat[sid] = d.hold; d.hold = null; save();
        };
        chart.querySelectorAll('[data-seat]').forEach((g) => {
          const go = () => goSeat(g.dataset.seat);
          g.addEventListener('click', go); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        });
        wrap.append(chart);
        // 모바일: 종이 위 손글씨 칸이 작으니 같은 기능의 큰 방석 버튼을 아래에 한 번 더
        const sb = el('div', 'seat-btns mobile-only');
        SEATS.forEach((s) => { const who = d.seat[s.id]; const b = el('button', 'chip' + (who ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-label', `${s.label} 방석 누르기`); if (who) b.style.setProperty('--gc', GIFT_OF[who][1]); b.innerHTML = `<small>${s.label}</small><b>${who ? GIFT_OF[who][0] : '빈 방석'}</b>`; b.onclick = () => goSeat(s.id); sb.append(b); });
        wrap.append(sb);
        const notes = el('div', 'seat-notes-wrap'); notes.innerHTML = `<p class="seat-notes-head">자리표 종이 아래 적힌 부탁</p>${REQUESTS}`;
        const placed = Object.values(d.seat);
        // 선물 줄은 놓아도 자리가 남는다 (눌러도 화면이 튀지 않게)
        const tray = el('div', 'gift-tray');
        PEOPLE.forEach((p) => {
          const [gname, col] = GIFT_OF[p.id]; const on = placed.includes(p.id);
          const b = el('button', 'gift-chip' + (d.hold === p.id ? ' holding' : '') + (on ? ' placed' : '')); b.type = 'button'; b.style.setProperty('--gc', col); b.disabled = on;
          b.setAttribute('aria-label', `${gname} (${p.name}) ${on ? '놓았음' : '들기'}`); b.innerHTML = `<b>${gname}</b><small>${on ? '놓음' : p.name}</small>`;
          b.onclick = () => { d.hold = d.hold === p.id ? null : p.id; save(); };
          tray.append(b);
        });
        wrap.prepend(notes);
        wrap.append(tray, el('p', 'pick-label', d.hold ? `${js(GIFT_OF[d.hold][0], '을', '를')} 들었다 놓을 방석을 누른다` : placed.length === 4 ? '네 자리에 다 놓았다 놓인 선물을 누르면 다시 든다' : '선물을 하나 들고 방석을 누르면 놓인다'));
        return wrap;
      },
      commitLabel: '봄이 평상에 내려놓기',
      canCommit: (d) => Object.keys(d.seat).length === 4,
      check(d) {
        if (SEATS.every((s) => d.seat[s.id] === SEAT_ANSWER[s.id])) return { ok: true };
        return { ok: false, msg: '봄이가 평상 위를 한 바퀴 돌더니 다시 내 품으로 왔다 자리 부탁을 다시 읽는다' };
      },
      reveal: {
        title: '봄이가 고른 자리',
        text: '봄이가 평상 위로 올라가 네 선물 냄새를 차례로 맡더니 한가운데 앉았다 꼬리로 바닥을 톡톡 쳤다',
        scene: ['평상 밑에서 발도장이 찍힌 봉투가 한 장 더 나왔다 이번엔 받는 사람이 「다은」이었다 그때 꽃집 쪽에서 낯익은 목소리들이 들려왔다'],
        unlock: null,
        ending: true,
        endingLabel: '저녁 일곱 시, 평상으로',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '전구 아래 평상에 작은 상을 두고 둘러앉은 네 이웃과, 봄이를 안고 다가가는 다은',
    eyebrow: '6월 12일, 저녁 일곱 시',
    title: '고양이가 데려온 사람들',
    paragraphs: [
      '전구가 켜진 평상에 네 사람이 작은 상을 가운데 두고 방석에 둘러앉아 있었다 아까 내가 선물을 하나씩 올려 둔 그 방석들이었다 상 위엔 딸기 케이크와 유리컵에 든 초가 하나 있었다 은호 씨가 먼저 나를 보고 웃었다',
      '“봄이 생일은 아무도 모르잖아요 그래서 가족 된 날로 했어요” 소연 씨가 말했다 “작년 오늘, 다은 씨가 봄이 데려간 날”',
      '“근데 왜 저한테는 봄이 앞으로 보내요”',
      '“다은 씨 앞으로 보내면 바쁘다고 안 올 것 같아서” 지후 씨가 웃었다 “봉투는 제가 문 밑으로 넣었어요 우체부가 우편함 두고 문 밑으로 넣은 건 처음이에요 발도장은 어제 봄이가 병원 창턱에 놀러 왔을 때 은호 씨가 앞발로 받았고요 참도 그때 달았대요 봄이가 보내는 거니까”',
      '선물을 하나씩 열었다 은호 씨 초록 봉투엔 손바닥만 하던 봄이의 첫 발도장 사본, 지후 씨 파란 상자엔 「받는 사람 봄이」라고 새긴 작은 주소 이름표가 들어 있었다 소연 씨 상자는 역시 봄이 간식이었다',
      '미정 씨가 꽃 한 송이를 더 내밀었다 역시 리본은 없었다 “작년에 봄이 데려간다고 했을 때, 우리 넷이 사실 좀 섭섭했어요 근데 그 뒤로 다은 씨 가게 앞을 지나는 게 좋더라고요”',
      '네 사람이 조금씩 당겨 앉아 내 자리를 만들었다 봄이는 내 품에서 케이크 쪽으로 고개를 쭉 내밀었다',
    ],
    afterword: '봄이 목걸이엔 이제 참 셋 옆에 주소 이름표가 하나 더 달려 있다 아침마다 나는 병원, 빵집, 꽃집 순서로 골목을 한 바퀴 돌고 가게 문을 연다 작년까지 봄이가 돌던 길이다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=ohang', title: '돌아오는 계절', line: '다음은 오행당의 다섯 그릇 이야기입니다' },
  },
};
// 창턱 상자를 풀기 전 바구니를 눌렀을 때의 한 줄 (자료가 아니라서 목록·자료 수에 안 잡히게 열거되지 않는 칸으로 둔다)
Object.defineProperty(EP.docs, 'basketwait', {
  enumerable: false,
  value: {
    title: '벤치 위 바구니',
    kind: '빵집 앞',
    html: '<p>리본 단 선물이 바구니 가득 담겨 있고 위에 쪽지가 한 장 얹혀 있다</p><p class="aside">빵집은 아직 준비 중이라 남의 가게 앞 물건에 먼저 손대긴 그렇다 봄이가 고개를 뺀 병원 창턱 상자부터 열어 보자</p>',
  },
});
export default EP;
