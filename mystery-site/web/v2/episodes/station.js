// 세 번째 승강장 — 이야기·자료·장치가 전부 이 파일에 있습니다
// 엔진(v2/engine.js)은 이 파일의 구조만 알고, 내용은 모릅니다

const BOARD = [
  // 열차 안내판 7×7. 글자 자체가 단서판입니다 구간권의 구멍을 겹쳐 읽습니다
  ['미', '루', '행', '0', '6', '1', '5'],
  ['산', '장', '2', '행', '0', '번', '둘'],
  ['북', '문', '행', '둘', '완', '째', '수'],
  ['1', '0', '강', '변', '기', '림', '행'],
  ['공', '단', '급', '둥', '0', '9', '4'],
  ['남', '문', '행', '1', '1', '2', '0'],
  ['중', '앙', '환', '승', '역', '안', '내'],
];
// 구멍(5×5 창 기준 좌표) 올바른 자리(오른쪽 2, 아래 1, 회전 0)에서 창 (r,c) → BOARD[1+r][2+c]:
// (0,0)=2 (0,3)=번 (1,1)=둘 (1,3)=째 (2,2)=기 (3,1)=둥
const HOLES = [[0, 0], [0, 3], [1, 1], [1, 3], [2, 2], [3, 1]];

function rotate(holes, turns) {
  // 5×5 창 안에서 시계 방향 90° 회전
  let h = holes.map(([r, c]) => [r, c]);
  for (let t = 0; t < turns; t++) h = h.map(([r, c]) => [c, 4 - r]);
  return h;
}
function readHoles(d) {
  const hs = rotate(HOLES, d.turn || 0);
  return hs
    .map(([r, c]) => [r + (d.dy || 0), c + (d.dx || 0)])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map(([r, c]) => BOARD[r]?.[c] ?? '·')
    .join('');
}

const TRAINS_2 = [
  { id: 'n0910', time: '09:10', to: '북문', stops: '북문 종착', kind: '완행' },
  { id: 'n0925', time: '09:25', to: '산장', stops: '북문 · 수림 · 산장', kind: '완행' },
  { id: 'n0940', time: '09:40', to: '수림', stops: '북문 통과 · 수림 종착', kind: '급행' },
  { id: 'n0958', time: '09:58', to: '북문', stops: '북문 종착', kind: '완행' },
  { id: 'n1015', time: '10:15', to: '산장', stops: '북문 · 수림 · 산장', kind: '완행' },
];
const TRAINS_1 = [
  { id: 's0918', time: '09:18', to: '남문', stops: '남문 종착', kind: '완행' },
  { id: 's0940', time: '09:40', to: '강변', stops: '남문 통과 · 강변 종착', kind: '급행' },
  { id: 's1002', time: '10:02', to: '공단', stops: '남문 · 강변 · 공단', kind: '완행' },
];

// 마을 지도: 역에서 출발, 갈림길마다 왼쪽/오른쪽/직진 정답 경로 → 다리 건너 왼쪽 길의 세 번째 집(H3)
// 좌표는 SVG(0~100) 기준 역은 아래쪽, 북쪽이 위
const MAP = {
  nodes: {
    S: { x: 50, y: 74 }, // 역 앞 길
    B: { x: 40, y: 74 }, // 첫째 골목 입구
    G: { x: 40, y: 56 }, // 첫째 골목 끝(막다른 길)
    C: { x: 24, y: 74 }, // 둘째 골목 입구
    D: { x: 24, y: 50 }, // 둘째 골목, 다리 앞
    E: { x: 24, y: 30 }, // 다리 건넌 뒤 갈림길
    F: { x: 74, y: 74 }, // 동쪽 골목 입구
    FE: { x: 74, y: 56 },
  },
  houses: [
    { id: 'H1', x: 20, y: 20 }, { id: 'H2', x: 14, y: 20 }, { id: 'H3', x: 8, y: 20 }, { id: 'H4', x: 2, y: 20 },
    { id: 'H8', x: 30, y: 20 }, { id: 'H9', x: 36, y: 20 }, { id: 'H10', x: 42, y: 20 },
    { id: 'H6', x: 34, y: 50 }, { id: 'H7', x: 46, y: 50 },
    { id: 'H5', x: 8, y: 66 },
    { id: 'H11', x: 80, y: 48 }, { id: 'H12', x: 90, y: 48 },
  ],
};

const PLACE_NAMES = { S: '수림역 앞', B: '첫째 골목 입구', C: '둘째 골목 입구', D: '둘째 골목, 다리 앞', E: '다리 건넌 뒤 갈림길', F: '동쪽 골목 입구' };
const WALK = {
  // 현재 위치 → 갈림길 선택지 진행 방향을 기억해 "왼쪽/오른쪽"을 지도 방향으로 바꿉니다
  S: { choices: [{ dir: '왼쪽', to: 'B', heading: 'W' }, { dir: '오른쪽', to: 'F', heading: 'E' }] },
  B: { choices: [{ dir: '오른쪽', to: 'GL', heading: 'N' }, { dir: '직진', to: 'C', heading: 'W' }] },
  C: { choices: [{ dir: '오른쪽', to: 'D', heading: 'N' }, { dir: '직진', to: 'X', heading: 'W' }] },
  D: { choices: [{ dir: '직진', to: 'E', heading: 'N', bridge: true }] },
  E: { choices: [{ dir: '왼쪽', to: 'L', heading: 'W' }, { dir: '오른쪽', to: 'R', heading: 'E' }] },
  F: { choices: [{ dir: '왼쪽', to: 'FL', heading: 'N' }] },
};
// 집이 늘어선 길(걷기의 끝) houses는 걸어가며 만나는 순서
const LANES = {
  L: { name: '다리 건너 왼쪽 길', from: 'E', dir: 'W', houses: ['H1', 'H2', 'H3', 'H4'] },
  R: { name: '다리 건너 오른쪽 길', from: 'E', dir: 'E', houses: ['H8', 'H9', 'H10'] },
  GL: { name: '첫째 골목 끝', from: 'B', dir: 'N', houses: ['H6', 'H7'] },
  X: { name: '둘째 골목을 지나친 길 끝', from: 'C', dir: 'W', houses: ['H5'] },
  FL: { name: '동쪽 언덕길', from: 'F', dir: 'N', houses: ['H11', 'H12'] },
};
const ANSWER_HOUSE = 'H3';
// 쪽지 세 장: 정확히 하나만 거짓 유일한 답은 셋째 집(나가 거짓)
const NOTES = [
  { id: '가', text: '둘째 집이 아니야' },
  { id: '나', text: '가는 거짓말이야' },
  { id: '다', text: '셋째 집이야' },
];

const postcardImg = `<figure class="postcard-photo"><img src="assets/v2/station/postcard.webp" srcset="assets/v2/station/postcard-960.webp 960w, assets/v2/station/postcard.webp 1024w" sizes="(max-width: 640px) 100vw, 640px" alt="민서가 보낸 엽서 사진: 작은 역사, 벤치에서 조는 사람, 하늘의 새" decoding="async"><figcaption>수림역 네가 내릴 역 — 민서</figcaption></figure>`;

const LANE_END = { L: { x: 0, y: 30 }, R: { x: 48, y: 30 }, GL: { x: 40, y: 56 }, X: { x: 0, y: 74 }, FL: { x: 96, y: 56 } };
// 볼펜으로 영수증 뒷면에 그린 손지도 길·집 좌표는 WALK/LANES 판정과 같아야 합니다
const INK = '#2f3a7a';
function svgMap(path = [], picked = null) {
  const n = MAP.nodes;
  // 두 번 긋는 볼펜 선(살짝 어긋나게)
  const pen = (d, w = 0.9, extra = '') => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${(w * 1.6).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const road = (a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len * 1.6, ny = dx / len * 1.6;
    return pen(`M${a.x + nx} ${a.y + ny} L${b.x + nx} ${b.y + ny}`, 0.7) + pen(`M${a.x - nx} ${a.y - ny} L${b.x - nx} ${b.y - ny}`, 0.7);
  };
  const roads = [
    road({ x: -2, y: 74 }, { x: 98, y: 74 }),
    road(n.B, n.G), road(n.C, n.D), road(n.D, n.E), road({ x: -2, y: 30 }, { x: 48, y: 30 }),
    road(n.F, n.FE), road(n.FE, { x: 98, y: 56 }),
  ].join('');
  // 개울: 겹친 물결 두 줄 + 다리 널빤지
  const stream = pen('M-2 41 C 15 36, 30 47, 50 41 S 85 35, 102 41', 0.8, 'stroke="#4a6fa5"') + pen('M-2 44 C 15 39, 30 50, 50 44 S 85 38, 102 44', 0.6, 'stroke="#4a6fa5" stroke-dasharray="3 1.5"')
    + pen('M20 37.5 L28 37.5 M20 39.5 L28 39.5 M20 41.5 L28 41.5 M20 43.5 L28 43.5 M20 45.5 L28 45.5', 0.6) + pen('M19.5 36.5 L19.5 46.5 M28.5 36.5 L28.5 46.5', 0.8);
  // 집: 지붕 선 + 벽 + 창 하나, 집마다 조금씩 다르게
  const house = (h, i) => {
    const w = 6 + (i % 3), hh = 4 + (i % 2), r = 2.5 + (i % 2);
    const x = h.x - w / 2, y = h.y - hh / 2;
    const roof = i % 2 ? `M${x - 0.8} ${y} L${h.x} ${y - r} L${x + w + 0.8} ${y}` : `M${x - 0.8} ${y} L${x + w * 0.35} ${y - r} L${x + w + 0.8} ${y}`;
    const hatch = Array.from({ length: 3 }, (_, k) => `M${x + 1 + k * (w / 3)} ${y + 0.6} l${w / 4} ${hh - 1.2}`).join(' ');
    const sel = picked === h.id ? `<circle cx="${h.x}" cy="${h.y}" r="${w * 0.8}" fill="none" stroke="#d9872b" stroke-width="1.2" stroke-dasharray="2 1"/>` : '';
    return `<g class="map-house${picked === h.id ? ' picked' : ''}">${sel}${pen(`M${x} ${y} h${w} v${hh} h${-w} z`, 0.7)}${pen(roof, 0.8)}${pen(hatch, 0.35)}${pen(`M${x + w - 2.2} ${y + 1} h1.4 v1.2 h-1.4 z`, 0.4)}</g>`;
  };
  const houses = MAP.houses.map(house).join('');
  // 논 빗금, 나무 낙서
  const field = (x, y, w, h) => pen(Array.from({ length: Math.floor(h / 1.6) }, (_, k) => `M${x} ${y + k * 1.6} h${w}`).join(' '), 0.3, 'opacity=".7"');
  const tree = (x, y, r = 2.2) => pen(`M${x} ${y + r} v${-r * 0.9} M${x - r} ${y - r * 0.2} c${r * 0.3} ${-r * 1.4}, ${r * 1.7} ${-r * 1.4}, ${r * 2} 0 c${r * 0.4} ${r}, ${-r * 2.4} ${r}, ${-r * 2} 0 z`, 0.5);
  const scenery = field(56, 8, 40, 16) + field(4, 80, 30, 10) + field(60, 80, 34, 10)
    + tree(8, 56) + tree(14, 60, 1.8) + tree(90, 30, 2.6) + tree(84, 24, 2) + tree(50, 62, 1.6) + tree(70, 66, 2)
    + pen('M60 60 c-2 -3, 2 -6, 4 -3 c2 -3, 5 1, 2 3 c2 2, -3 4, -3 2 c-2 2, -5 -1, -3 -2 z', 0.6) + pen('M62 66 v-6', 0.6)
    + `<circle cx="61" cy="59" r="0.9" fill="#d9872b"/><circle cx="64" cy="60.5" r="0.9" fill="#d9872b"/><circle cx="63" cy="57.5" r="0.8" fill="#d9872b"/>`;
  // 걸어온 길(형광펜)
  const walked = path.map(([a, b]) => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#f2c14e" stroke-opacity=".75" stroke-width="3.2" stroke-linecap="round"/>`).join('');
  // 글씨
  const label = (x, y, t, size = 3.4, anchor = 'start', rot = 0) => `<text x="${x}" y="${y}" font-size="${size * 1.3}" font-family="MihaejeHand, MihaejeSerif, serif" fill="${INK}" text-anchor="${anchor}" transform="rotate(${rot} ${x} ${y})">${t}</text>`;
  const notes = label(50, 97, '수림역', 4, 'middle') + label(67, 70, '감나무', 2.8, 'middle') + label(34, 36.5, '개울', 2.8) + label(24, 52, '다리', 2.6, 'middle', -4)
    + label(82, 12, '논', 3) + label(10, 86, '논', 3) + label(6, 24, '여기 개 있음 조심', 2.4) + label(86, 50, '언덕', 2.6);
  // 나침반 낙서
  const compass = pen('M91 6 v8 M91 6 l-2 3 M91 6 l2 3', 0.8) + label(93.5, 9.5, 'N', 3.6) + pen('M91 10 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0', 0.4);
  return `<svg viewBox="0 0 100 100" class="village-map" role="img" aria-label="민서의 손지도">
   <defs>
    <filter id="pen" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0.6" xChannelSelector="R" yChannelSelector="G"/></filter>
   </defs>
   <g filter="url(#pen)">${scenery}${roads}${stream}${houses}${pen('M44 80 h12 v8 h-12 z', 0.9)}${pen('M44 80 l6 -3 l6 3', 0.9)}${compass}${notes}</g>
   ${walked}
  </svg>`;
}

export default {
  id: 'station',
  number: '004',
  title: '세 번째 승강장',
  subtitle: '없는 승강장에서 온 사진',
  genre: '실종 미스터리 · 길 찾기',
  minutes: 30,
  difficulty: 3,
  cover: 'assets/v2/station/cover.webp',
  coverAlt: '새벽 대합실 벽에 기대 둔 낡은 3번 승강장 표지',
  music: 'assets/music/station-v33.mp3',
  tagline: '새벽 1시 14분, 사진 한 장\n중앙역에 3번 승강장은 없다',
  blurb: '회사를 그만두고 방을 뺀 친구가 보낸 마지막 사진은\n지금은 없는 승강장이었습니다 친구가 남긴 길을 따라가세요',
  storageKey: 'mihaeje-v2-station',
  tracesLabel: '민서가 남긴 것',

  opening: {
    eyebrow: '새벽 1시 14분',
    paragraphs: [
      '민서가 사진 한 장을 보냈다. 낡은 법랑 표지판에 「3번 승강장」이라고 적혀 있었다. 사진 밑에 말풍선이 둘.',
      '「여기서 시작.」 「찾아와.」',
      '바로 전화를 걸었지만 꺼져 있었고, 몇 번을 다시 걸어도 마찬가지였다.',
      '민서는 두 달 전에 회사를 그만뒀고, 방을 뺐다는 말은 지난주에야 들었다. 어디로 가는지는 묻지 못했는데, 묻기 전에 먼저 말해 줄 거라고 생각했기 때문이다.',
      '중앙역에 3번 승강장은 없다. 1번과 2번뿐이라는 걸 알면서도, 나는 첫차를 타고 중앙역으로 갔다.',
    ],
    cta: '중앙역 대합실로',
  },

  traces: [
    { device: 'grille', label: '구멍 뚫린 구간권' },
    { device: 'mirror', label: '네컷사진' },
    { device: 'locker', label: '파란 리본 열쇠' },
    { device: 'notes', label: '거짓말 쪽지' },
    { device: 'walk', label: '파란 대문' },
  ],

  scenes: [
    {
      id: 'hall',
      name: '중앙역 대합실',
      image: 'assets/v2/station/hall.webp',
      arrive: '여섯 시 반의 대합실은 전광판이 아직 어제 날짜를 넘기지 못한 것처럼 느리게 깜빡이고 있었다 안내판 아래 벽에 기대 둔 흰 표지판이 보였고, 그게 사진 속 그것이라는 걸 알아보는 순간 숨이 짧아져서 커피를 사려다 말았다',
      hotspots: [
        { id: 'sign', x: 36, y: 63, label: '벽에 기댄 옛 표지판', kind: 'doc', doc: 'sign' },
        { id: 'clerk', x: 66, y: 40, label: '매표창구의 역무원', kind: 'doc', doc: 'clerk' },
        { id: 'notice', x: 13, y: 34, label: '승강장 개편 안내', kind: 'doc', doc: 'notice' },
        { id: 'board', x: 42, y: 24, label: '열차 안내판', kind: 'device', device: 'grille' },
        { id: 'tophone', x: 20, y: 84, label: '민서의 마지막 메시지', kind: 'doc', doc: 'message' },
      ],
    },
    {
      id: 'platform',
      name: '2번 승강장 · 둘째 기둥',
      image: 'assets/v2/station/platform.webp',
      unlockedBy: 'grille',
      arrive: '안개가 선로 위에 낮게 깔려 있었다 둘째 기둥 눈높이에 네컷사진 한 장이 테이프로 붙어 있었는데, 사진 속 두 사람 중 하나는 나였다 이걸 여기 붙이고 간 사람의 마음을 알 수가 없어서 조금 무서웠다',
      hotspots: [
        { id: 'strip', x: 27, y: 34, label: '기둥에 붙은 네컷사진', kind: 'doc', doc: 'strip' },
        { id: 'table', x: 29, y: 57, label: '기둥의 출발 시각표', kind: 'doc', doc: 'timetable' },
        { id: 'mirror', x: 60, y: 40, label: '승강장 끝의 볼록거울', kind: 'device', device: 'mirror' },
        { id: 'brief', x: 37, y: 68, label: '벤치 — 민서와 나', kind: 'doc', doc: 'brief' },
      ],
    },
    {
      id: 'surim',
      name: '수림역 · 보관함',
      image: 'assets/v2/station/surim.webp',
      unlockedBy: 'mirror',
      arrive: '열차는 북문을 서지 않고 지나쳤고, 수림역에는 역무원이 없었다 문 옆에 보관함이 열두 칸 있었는데 그중 한 칸에만 노란 별 스티커가 붙어 있었다 민서는 뭐든 별 스티커를 붙이는 애였고, 그 노란 별을 보고 나서야 민서가 정말 여기까지 왔다는 게 실감이 났다',
      hotspots: [
        { id: 'postcard', x: 86, y: 32, label: '게시판의 그림엽서', kind: 'doc', doc: 'postcard' },
        { id: 'lockerrule', x: 42, y: 28, label: '보관함 이용 안내', kind: 'doc', doc: 'lockerrule' },
        { id: 'locker', x: 55.2, y: 38, label: '별 스티커가 붙은 보관함', kind: 'device', device: 'locker' },
      ],
    },
    {
      id: 'village',
      name: '수림 마을길',
      image: 'assets/v2/station/village.webp',
      unlockedBy: 'locker',
      arrive: '보관함에서 꺼낸 것들을 가방에 넣고 역을 나왔다 휴대폰은 켜지 않았다 그래서 안 받은 거였다 화가 나야 하는데 나지 않았다 역 밖은 매미 소리로 꽉 차 있었고 길은 왼쪽과 오른쪽으로 갈라져 있었다',
      hotspots: [
        { id: 'letter', x: 24, y: 70, label: '민서의 편지', kind: 'doc', doc: 'letter' },
        { id: 'handmap', x: 46, y: 74, label: '접힌 손지도', kind: 'doc', doc: 'handmap' },
        { id: 'notes', x: 34, y: 60, label: '쪽지 세 장', kind: 'device', device: 'notes' },
        { id: 'walk', x: 56, y: 52, label: '마을로 걸어가기', kind: 'device', device: 'walk', visible: (S) => S.solved.includes('notes') },
      ],
    },
  ],

  docs: {
    message: {
      title: '민서의 마지막 메시지',
      kind: '휴대폰 · 01:14',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>민서</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 8월 14일 금요일</div>
<div class="chat-row them"><span class="chat-avatar">★</span><div class="chat-col"><span class="chat-name">민서</span><div class="chat-bubble photo"><img src="assets/v2/station/cover-960.webp" alt="낡은 3번 승강장 표지판 사진" decoding="async"></div><div class="chat-bubble">여기서 시작</div><div class="chat-bubble">찾아와</div></div><span class="chat-time">오전 1:14</span></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 1:15</span><div class="chat-bubble">뭐야 이 시간에</div></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 1:15</span><div class="chat-bubble">민서야 어디야</div></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 1:22</span><div class="chat-bubble">전화 좀 받아</div></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 1:40</span><div class="chat-bubble">장난이면 지금 말해</div></div>
<div class="chat-sys">음성통화 연결 안 됨 · 전원이 꺼져 있습니다</div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 6:02</span><div class="chat-bubble">첫차 탄다</div></div>
<div class="chat-input"><span>+</span><span class="chat-field">메시지 입력</span><span>#</span></div></div>`,
    },
    sign: {
      title: '벽에 기댄 옛 표지판',
      kind: '법랑 · 모서리가 깨짐',
      html: `<p>흰 바탕에 검은 글씨로 <b>3번 승강장</b>이라고 적혀 있다 개편 때 떼어 낸 것을 역무원이 버리지 못하고 벽에 세워 두었다고 한다</p><p>뒷면 아래쪽에는 투명 테이프로 구간권 한 장이 붙어 있는데, 네모난 구멍이 여섯 개 뚫려 있고 위쪽 여백에 민서 글씨가 있다</p><figure class="prop ticket"><img src="assets/v2/station/props/ticket.webp" alt="구멍 뚫린 구간권" decoding="async"><div class="ticket-holes"><i style="--r:0;--c:0"></i><i style="--r:0;--c:3"></i><i style="--r:1;--c:1"></i><i style="--r:1;--c:3"></i><i style="--r:2;--c:2"></i><i style="--r:3;--c:1"></i></div><span class="ticket-arrow">▲</span><span class="ticket-print">미루선 구간권<br>800원</span><span class="ticket-hand">안내판에 대 봐</span></figure><p class="aside">구간권의 칸은 대합실 위쪽 열차 안내판의 글자판과 크기가 같다</p>`,
    },
    clerk: {
      title: '매표창구의 역무원',
      kind: '박종길 · 야간 근무',
      html: `<p>창구 안의 남자는 커피를 반쯤 남긴 채 신문을 접었다</p><blockquote>“새벽에 여자분 하나가 저 표지판 앞에 한참 서 있다가, 뭘 붙이고 갔어요 떼려다 뒀습니다 ‘사람이 올 거예요’ 하길래”</blockquote><blockquote>“3번? 지금은 없어요 작년에 개편하면서 번호를 바꿨어요 저 표지판이 서 있던 자리는 지금 2번이에요 북쪽 가는 쪽”</blockquote><blockquote>“그 여자분, 아침에 북쪽 가는 열차 타고 올라갔어요 어느 열차였는지는 글쎄요 승강장 가서 물어보시든가 기둥에도 뭘 붙였을걸요 테이프 소리가 들렸으니까”</blockquote>`,
    },
    notice: {
      title: '승강장 개편 안내',
      kind: '게시물 · 작년 3월',
      html: `<figure class="prop noticephoto"><img src="assets/v2/station/props/notice.webp" alt="승강장 번호 변경 안내: 옛 3번은 현재 2번(북행), 옛 2번은 현재 1번(남행), 옛 1번은 폐쇄" decoding="async"></figure><p class="aside">옛 3번은 지금 2번(북행), 옛 2번은 지금 1번(남행), 옛 1번은 폐쇄 대합실 안내판은 글자판을 한 칸씩 끼우는 옛날식이라 교체 중에는 안내가 뒤섞일 수 있다고 적혀 있다</p>`,
    },
    brief: {
      title: '민서와 나',
      kind: '내 기억',
      html: `<p>스무 살 때 매일 아침 09:40 통학열차 둘째 칸을 탔는데, 어느 날 내 자리에 모르는 애가 앉아 있었다 비켜 달라고 했더니 “자리에 이름 적혀 있어?” 하고 되물었고, 그게 민서였다</p><p>민서는 노트든 휴대폰이든 내 가방이든 뭐든 별 스티커를 붙였고, 중학교 때부터 쪽지를 거울 글씨로 쓰는 버릇이 있었다 선생님이 못 읽게 하려고 시작한 거라고 했다</p><p>수림 어디 산골에 혼자 사신다는 외할머니 얘기를 자주 했다 여름마다 갔는데 작년부터는 못 갔다고 했다</p><p>회사를 그만둔 뒤로 연락이 뜸해졌지만 괜찮냐고 묻지 않았다 묻지 않는 게 배려라고 생각했다</p>`,
    },
    strip: {
      title: '기둥에 붙은 네컷사진',
      kind: '앞면 · 뒷면',
      html: `<figure class="prop stripphoto"><img src="assets/v2/station/props/strip.webp" alt="기둥에 붙은 네컷사진" decoding="async"></figure><p class="aside">4년 전 역 앞 사진 부스에서 찍은 것으로, 둘 다 눈을 감은 컷이 하나 있다</p><p>뒷면에 민서 글씨가 있는데 글자가 전부 뒤집혀 있다 왼손으로 쓴 것처럼 삐뚤고 자음이 거꾸로다</p><figure class="prop stripback"><p class="mirror-text">우리가 처음 만난 그 시간 열차 종점까지 와</p></figure><p class="aside">승강장 끝에 볼록거울이 있다</p>`,
    },
    timetable: {
      title: '기둥의 출발 시각표',
      kind: '2번 승강장 · 북행',
      html: `<figure class="prop laminated"><img src="assets/v2/station/props/timetable.webp" alt="기둥에 핀으로 꽂힌 시각표" decoding="async"><div class="laminated-sheet"><p class="sheet-title">2번 승강장 출발 시각 (북행)</p><table><thead><tr><th>출발</th><th>행선</th><th>정차</th><th>종별</th></tr></thead><tbody>${TRAINS_2.map((t) => `<tr><td>${t.time}</td><td>${t.to}행</td><td>${t.stops}</td><td>${t.kind}</td></tr>`).join('')}</tbody></table><p class="sheet-title dim">맞은편 1번 승강장 (남행)</p><table class="dim"><thead><tr><th>출발</th><th>행선</th><th>정차</th><th>종별</th></tr></thead><tbody>${TRAINS_1.map((t) => `<tr><td>${t.time}</td><td>${t.to}행</td><td>${t.stops}</td><td>${t.kind}</td></tr>`).join('')}</tbody></table><p class="sheet-foot">미루선 · 수림역무관리소</p></div></figure><div class="paper-table mobile-only"><p class="pt-head">같은 시각표 글자로 옮겨 적은 것</p><table class="nwcells"><tr><th>출발</th><th>행선</th><th>정차</th><th>종별</th></tr>${TRAINS_2.map((t) => `<tr><td>${t.time}</td><td>${t.to}행</td><td>${t.stops}</td><td>${t.kind}</td></tr>`).join('')}</table><p class="pt-foot">맞은편 1번 승강장 (남행) ${TRAINS_1.map((t) => `${t.time} ${t.to}행`).join(' · ')}</p></div>`,
    },
    postcard: {
      title: '게시판의 그림엽서',
      kind: '민서가 찍은 사진 엽서',
      html: `${postcardImg}<p class="aside">뒷면에 적힌 글</p><blockquote class="hand">다이얼 숫자는 그림 안에 있어<br>새, 창, 등, 의자 순서로<br>벤치에서 조는 사람은 세지 마 그거 너야</blockquote>`,
    },
    lockerrule: {
      title: '보관함 이용 안내',
      kind: '수림역 · 무인',
      html: `<div class="sticker"><b>보관함 이용 안내</b><ol><li>숫자 네 자리를 맞추고 손잡이를 당기세요</li><li>세 번 틀리면 30초 동안 잠깁니다</li><li>물건은 7일까지 보관됩니다</li></ol><small>수림역 · 무인역 관리 041-000-0000</small></div><p class="aside">보관함 옆면에 붙은 스티커 별 스티커가 붙은 칸은 5번이고 다이얼은 전부 0에 맞춰져 있다</p>`,
    },
    letter: {
      title: '민서의 편지',
      kind: '보관함 안 · 봉투 없이',
      html: `<figure class="prop letterphoto"><img src="assets/v2/station/props/letter.webp" alt="보관함에서 나온 편지" decoding="async"><div class="letter-hand"><p>왔네</p><p>여기까지 왔으면 반은 온 거야 열쇠는 우리 집 대문 열쇠고, 지도는 내가 그렸는데 좀 못 그렸어</p><p>역을 등지고 서 그 상태에서 <b>왼쪽</b>으로 가<br><b>두 번째 골목</b>에서 <b>오른쪽</b>으로 꺾어<br>다리를 건너 건너자마자 <b>왼쪽</b><br>그 길에 집이 <b>네 채</b> 몇 번째인지는 안 적을래 쪽지 세 장 중 <b>하나만 거짓말</b>이야 우리 중학교 때 하던 거</p><p>대문 색은 지도에 안 그렸어 그려 놓으면 네가 지도만 보고 올 거잖아</p><p class="sign">— 민서</p></div></figure>`,
    },
    handmap: {
      title: '접힌 손지도',
      kind: '종이봉투 조각에 볼펜',
      html: `<figure class="prop kraft"><img src="assets/v2/station/props/kraft.webp" alt="종이봉투를 찢어 그린 손지도" decoding="async"><div class="kraft-map">${svgMap()}</div></figure><p class="aside">위가 북쪽이고 역은 지도 아래쪽에 있다 집은 전부 비슷하게 그려져 있고 대문 색은 없다</p>`,
    },
    final: {
      title: '민서의 편지 · 마지막 장',
      kind: '편지의 접힌 뒷장 · 마당에서 읽음',
      locked: true,
      html: `<figure class="prop letterphoto back"><img src="assets/v2/station/props/letter.webp" alt="편지의 접힌 뒷장" decoding="async"><div class="letter-hand"><p>할머니가 겨울에 넘어지셨어 아무한테도 말 안 하고 혼자 석 달을 누워 계셨대 그 얘기를 듣고 그날 사표 냈어</p><p>전화를 끈 건 도망친 거야 네 목소리 들으면 다 무너질 것 같았어 그건 내가 잘못한 거고 핑계 없어</p><p>이 길은 한참 뒤에, 좀 괜찮아지고 나서 만들었어 사과를 말로 하기엔 너무 늦은 것 같아서 우리 어릴 때 하던 길 찾기로 한 번만 불러 보고 싶었어 안 왔어도 원망 안 했을 거야 진짜로</p><p>수박 잘라 놨어</p></div></figure>`,
    },
  },

  devices: {
    grille: {
      title: '열차 안내판',
      scene: 'hall',
      intro: '글자판이 7×7로 끼워져 있다 구간권을 겹쳐 올릴 수 있다 구멍으로 보이는 글자가 민서가 남긴 말이다',
      docs: ['sign', 'notice'],
      hintCode: 'T-S01',
      hints: [
        '구간권을 안내판 위에서 움직이고, 돌려도 보세요 구멍으로 읽히는 글자가 말이 되는 자리는 서른여섯 가지 중 하나뿐입니다',
        '화살표가 위를 보는 상태로, 오른쪽 두 칸, 아래 한 칸 숫자 하나와 글자 다섯이 읽힙니다',
        '읽히는 글자는 「2번 둘째 기둥」입니다 2번 승강장의 둘째 기둥을 고르세요',
      ],
      initial: () => ({ dx: 0, dy: 0, turn: 0, platform: null, pillar: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'grille');
        const frame = el('div', 'grille-frame'); const bg = el('img'); bg.src = 'assets/v2/station/props/board.webp'; bg.alt = ''; frame.append(bg);
        const board = el('div', 'grille-board');
        board.style.setProperty('--dx', d.dx);
        board.style.setProperty('--dy', d.dy);
        const holes = rotate(HOLES, d.turn || 0);
        BOARD.forEach((row, r) => row.forEach((ch, c) => {
          const cell = el('span', 'cell', ch);
          const inWin = r - d.dy >= 0 && r - d.dy < 5 && c - d.dx >= 0 && c - d.dx < 5;
          if (inWin) {
            const hole = holes.some(([hr, hc]) => hr === r - d.dy && hc === c - d.dx);
            cell.classList.add(hole ? 'hole' : 'covered');
          }
          board.append(cell);
        }));
        const ticket = el('div', 'grille-ticket');
        ticket.style.setProperty('--dx', d.dx);
        ticket.style.setProperty('--dy', d.dy);
        ticket.style.setProperty('--turn', d.turn || 0);
        ticket.append(el('span', 'arrow', '▲'));
        board.append(ticket);
        frame.append(board); wrap.append(frame);
        const ctl = el('div', 'grille-controls');
        const mk = (label, fn, aria) => { const b = el('button', 'ctl', label); b.type = 'button'; b.setAttribute('aria-label', aria); b.onclick = () => { fn(); save(); }; return b; };
        ctl.append(
          mk('←', () => { d.dx = Math.max(0, d.dx - 1); }, '구간권 왼쪽으로'),
          mk('→', () => { d.dx = Math.min(2, d.dx + 1); }, '구간권 오른쪽으로'),
          mk('↑', () => { d.dy = Math.max(0, d.dy - 1); }, '구간권 위로'),
          mk('↓', () => { d.dy = Math.min(2, d.dy + 1); }, '구간권 아래로'),
          mk('↻ 돌리기', () => { d.turn = ((d.turn || 0) + 1) % 4; }, '구간권 90도 돌리기'),
        );
        wrap.append(ctl);
        const read = el('p', 'grille-read');
        read.innerHTML = `구멍으로 보이는 글자 <b>${readHoles(d)}</b> <small>· 화살표 ${['위', '오른쪽', '아래', '왼쪽'][d.turn || 0]}</small>`;
        wrap.append(read);
        const pick = el('div', 'pick-grid');
        pick.append(el('p', 'pick-label', '읽은 대로 가기'));
        const pl = el('div', 'pick-row');
        ['1번 승강장', '2번 승강장'].forEach((name, i) => { const b = el('button', 'chip' + (d.platform === i + 1 ? ' on' : ''), name); b.type = 'button'; b.onclick = () => { d.platform = i + 1; save(); }; pl.append(b); });
        const pr = el('div', 'pick-row');
        ['첫째 기둥', '둘째 기둥', '셋째 기둥', '넷째 기둥'].forEach((name, i) => { const b = el('button', 'chip' + (d.pillar === i + 1 ? ' on' : ''), name); b.type = 'button'; b.onclick = () => { d.pillar = i + 1; save(); }; pr.append(b); });
        pick.append(pl, pr);
        wrap.append(pick);
        return wrap;
      },
      commitLabel: '그 기둥으로 가기',
      check(d) {
        if (!d.platform || !d.pillar) return { ok: false, msg: '승강장과 기둥을 하나씩 골라야 합니다' };
        const txt = readHoles(d);
        if (txt !== '2번둘째기둥') return { ok: false, msg: `구멍으로 읽히는 글자가 아직 말이 안 된다 「${txt}」 구간권을 움직이거나 돌려서 말이 되는 자리를 먼저 찾는다` };
        if (d.platform === 2 && d.pillar === 2) return { ok: true };
        if (d.platform === 1) return { ok: false, msg: '1번 승강장 그 기둥엔 아무것도 붙어 있지 않았다 구멍으로 읽힌 글자가 정말 말이 됐는지 다시 본다' };
        return { ok: false, msg: `기둥이 다릅니다 구멍으로 읽힌 글자 「${txt}」을 다시 본다` };
      },
      reveal: {
        title: '2번 승강장, 둘째 기둥',
        text: '역무원이 개찰구를 열어 주며 말했다 “북쪽 가는 쪽이요 기둥은 선로 쪽에서 세요”',
        scene: [
          '구간권을 주머니에 넣으면서, 민서가 이 구멍 여섯 개를 칼로 하나씩 뚫고 있었을 걸 생각하니 조금 화가 났다 아주 조금',
          '개찰구를 지나는데 역무원이 덧붙였다 “그 여자분, 가방이 컸어요 멀리 가는 사람 가방” 나는 못 들은 척했다',
        ],
        unlock: 'platform',
      },
    },

    mirror: {
      title: '승강장 끝의 볼록거울',
      scene: 'platform',
      intro: '열차 기관사가 승강장 전체를 보라고 달아 둔 거울이다 네컷사진을 거울 앞에 들면 뒷면 글씨가 바로 보인다',
      docs: ['strip', 'timetable', 'brief'],
      hintCode: 'T-S02',
      hints: [
        '민서의 쪽지는 거울 글씨입니다 사진을 거울 앞에 들고 나란히 맞추면 읽힙니다 읽은 문장 안에 “시간”과 “종점”이 있습니다',
        '민서와 처음 만난 시간은 「민서와 나」에 적혀 있습니다 같은 시간 열차가 두 승강장에 하나씩 있는데, 지금 서 있는 곳은 2번 승강장입니다',
        '09:40 수림행 급행입니다 종점은 수림',
      ],
      initial: () => ({ held: false, tilt: 0, train: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'mirror');
        const aligned = d.held && Math.abs((d.tilt || 0) - 50) <= 8;
        const glass = el('div', 'mirror-glass' + (d.held ? ' held' : '') + (aligned ? ' aligned' : '')); const mimg = el('img'); mimg.src = 'assets/v2/station/props/mirror.webp'; mimg.alt = ''; glass.append(mimg);
        const paper = el('p', 'mirror-paper', '우리가 처음 만난 그 시간 열차 종점까지 와');
        paper.style.setProperty('--tilt', String(((d.tilt || 0) - 50) * 1.1));
        glass.append(paper);
        wrap.append(glass);
        const b = el('button', 'ctl wide', d.held ? '사진 내리기' : '네컷사진 뒷면을 거울 앞에 들기'); b.type = 'button'; b.onclick = () => { d.held = !d.held; if (d.held && d.tilt == null) d.tilt = 0; save(); };
        wrap.append(b);
        if (d.held) {
          const lab = el('label', 'mirror-tilt'); lab.append(el('span', '', aligned ? '거울과 나란하다 글씨가 읽힌다' : '사진을 거울과 나란하게 맞춘다'));
          const r = el('input'); r.type = 'range'; r.min = '0'; r.max = '100'; r.value = String(d.tilt || 0); r.setAttribute('aria-label', '사진 기울이기');
          r.oninput = () => { d.tilt = Number(r.value); paper.style.setProperty('--tilt', String((d.tilt - 50) * 1.1)); const ok = Math.abs(d.tilt - 50) <= 8; glass.classList.toggle('aligned', ok); lab.firstChild.textContent = ok ? '거울과 나란하다 글씨가 읽힌다' : '사진을 거울과 나란하게 맞춘다'; };
          r.onchange = () => { save(); };
          lab.append(r); wrap.append(lab);
        }
        const list = el('div', 'train-list');
        list.append(el('p', 'pick-label', '탈 열차 고르기 · 2번 승강장'));
        TRAINS_2.forEach((t) => { const c = el('button', 'train' + (d.train === t.id ? ' on' : '')); c.type = 'button'; c.innerHTML = `<b>${t.time}</b> ${t.to}행 <small>${t.stops} · ${t.kind}</small>`; c.onclick = () => { d.train = t.id; save(); }; list.append(c); });
        list.append(el('p', 'pick-label dim', '1번 승강장(건너편)'));
        TRAINS_1.forEach((t) => { const c = el('button', 'train dim' + (d.train === t.id ? ' on' : '')); c.type = 'button'; c.innerHTML = `<b>${t.time}</b> ${t.to}행 <small>${t.stops} · ${t.kind}</small>`; c.onclick = () => { d.train = t.id; save(); }; list.append(c); });
        wrap.append(list);
        return wrap;
      },
      commitLabel: '이 열차 타기',
      check(d) {
        if (!d.train) return { ok: false, msg: '열차를 하나 골라야 합니다' };
        if (!d.held || Math.abs((d.tilt || 0) - 50) > 8) return { ok: false, msg: '뒷면 글씨를 아직 제대로 읽지 않았다 사진을 거울과 나란히 맞추면 글자가 바로 보인다' };
        if (d.train === 'n0940') return { ok: true };
        if (d.train === 's0940') return { ok: false, msg: '09:40은 두 승강장에 하나씩 있다 민서가 사진을 붙인 기둥은 어느 쪽 승강장이었지' };
        const t = [...TRAINS_2, ...TRAINS_1].find((x) => x.id === d.train);
        return { ok: false, msg: `${t.time} ${t.to}행은 “처음 만난 그 시간”이 아닙니다 「민서와 나」에 그 시간이 있습니다` };
      },
      reveal: {
        title: '09:40 수림행 급행',
        text: '09:40까지 세 시간을 벤치에서 기다렸다 둘째 칸에 탔다 자리에 이름은 적혀 있지 않았다',
        scene: [
          '네컷사진을 창틀에 세워 뒀다 눈 감은 컷에서 민서는 웃고 있었는데, 나는 그 컷을 제일 싫어했고 민서는 제일 좋아했다',
          '열차는 북문을 서지 않고 지나쳤다 창밖이 산으로 바뀌는 동안 휴대폰을 세 번 봤지만 여전히 꺼져 있었다',
        ],
        unlock: 'surim',
      },
    },

    locker: {
      title: '별 스티커가 붙은 보관함',
      scene: 'surim',
      intro: '5번 칸 다이얼 네 개가 전부 0에 맞춰져 있다 세 번 틀리면 30초 동안 잠긴다',
      docs: ['postcard', 'lockerrule'],
      hintCode: 'T-S03',
      hints: [
        '엽서 그림 안의 물건을 셉니다 순서는 엽서 뒷면에 적힌 대로: 새, 창, 등, 의자',
        '새는 하늘에 있고, 창은 역사 벽에, 등은 가로등, 의자는 벤치입니다 조는 사람은 세지 않습니다',
        '새 3 · 창 4 · 등 2 · 의자 1 → 3421',
      ],
      initial: () => ({ dial: [0, 0, 0, 0], fails: 0, lockedUntil: 0 }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'locker'); const limg = el('img'); limg.src = 'assets/v2/station/props/locker.webp'; limg.alt = ''; wrap.append(limg);
        const row = el('div', 'dials');
        ['새', '창', '등', '의자'].forEach((lab, i) => {
          const col = el('div', 'dial');
          const up = el('button', 'ctl', '▲'); up.type = 'button'; up.setAttribute('aria-label', `${i + 1}번째 다이얼 올리기`); up.onclick = () => { d.dial[i] = (d.dial[i] + 1) % 10; save(); };
          const num = el('b', 'num', String(d.dial[i]));
          const dn = el('button', 'ctl', '▼'); dn.type = 'button'; dn.setAttribute('aria-label', `${i + 1}번째 다이얼 내리기`); dn.onclick = () => { d.dial[i] = (d.dial[i] + 9) % 10; save(); };
          col.append(up, num, dn);
          row.append(col);
        });
        wrap.append(row);
        const now = Date.now();
        if (d.lockedUntil > now) wrap.append(el('p', 'locker-note', `잠겨 있습니다 · ${Math.ceil((d.lockedUntil - now) / 1000)}초 뒤에 다시`));
        return wrap;
      },
      commitLabel: '손잡이 당기기',
      check(d) {
        const now = Date.now();
        if (d.lockedUntil > now) return { ok: false, msg: `잠겨 있습니다 ${Math.ceil((d.lockedUntil - now) / 1000)}초 뒤에 다시 당겨 보세요` };
        const ans = [3, 4, 2, 1];
        const right = d.dial.filter((v, i) => v === ans[i]).length;
        if (right === 4) return { ok: true };
        d.fails = (d.fails || 0) + 1;
        if (d.fails >= 3) { d.fails = 0; d.lockedUntil = now + 30000; return { ok: false, msg: '세 번 틀렸습니다 30초 동안 잠깁니다 그동안 엽서를 다시 세어 보세요' }; }
        return { ok: false, msg: '손잡이가 걸린다 네 자리 어딘가가 다르다 엽서를 다시 센다' };
      },
      reveal: {
        title: '3 · 4 · 2 · 1',
        text: '문이 열렸다 파란 리본을 맨 열쇠와 접은 종이, 편지, 쪽지 세 장, 그리고 전원이 꺼진 민서의 휴대폰이 들어 있었다',
        scene: [
          '휴대폰을 켜 볼까 하다 말았다 켜면 내가 건 전화 열한 통이 뜰 테고, 그걸 민서가 보게 하고 싶지는 않았다',
          '엽서 뒷면에는 연필로 쓴 글씨가 한 줄 더 있었다 “세는 동안 네 얼굴 상상했어 또 입 삐죽했지” 입을 삐죽했다',
        ],
        unlock: 'village',
      },
    },


    notes: {
      title: '쪽지 세 장',
      scene: 'village',
      intro: '보관함에서 나온 쪽지 세 장 편지는 “셋 중 하나만 거짓말”이라고 했다 거짓말인 쪽지를 고르고, 그러면 몇 번째 집인지 정한다',
      docs: ['letter'],
      hintCode: 'T-S04',
      hints: [
        '쪽지 하나를 거짓이라고 가정하고, 나머지 둘이 전부 참이 되는지 봅니다 거짓이 둘이 되면 그 가정은 틀린 겁니다',
        '가 쪽지가 거짓이라고 해 보세요 그러면 둘째 집인데, 그때 다 쪽지는 참인가요 거짓인가요 셋 다 그렇게 따져 봅니다',
        '거짓말은 나 집은 셋째',
      ],
      initial: () => ({ lie: null, house: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'notes');
        const cards = el('div', 'note-cards');
        NOTES.forEach((n) => {
          const c = el('button', 'note-card' + (d.lie === n.id ? ' lie' : '')); c.type = 'button';
          c.innerHTML = `<span class="note-id">${n.id}</span><span class="note-text">${n.text}</span><span class="note-mark">${d.lie === n.id ? '거짓말' : ''}</span>`;
          c.onclick = () => { d.lie = n.id; save(); };
          cards.append(c);
        });
        wrap.append(el('p', 'pick-label', '거짓말인 쪽지 하나'), cards);
        wrap.append(el('p', 'pick-label', '그러면 집은'));
        const row = el('div', 'pick-row');
        ['첫째', '둘째', '셋째', '넷째'].forEach((name, i) => { const b = el('button', 'chip' + (d.house === i + 1 ? ' on' : ''), name + ' 집'); b.type = 'button'; b.onclick = () => { d.house = i + 1; save(); }; row.append(b); });
        wrap.append(row);
        return wrap;
      },
      commitLabel: '이렇게 정하기',
      check(d) {
        if (!d.lie || !d.house) return { ok: false, msg: '거짓말 쪽지 하나와 집 하나를 골라야 한다' };
        if (d.lie === '나' && d.house === 3) return { ok: true };
        if (d.lie === '가') return { ok: false, msg: '가가 거짓이면 둘째 집이다 그러면 다(셋째 집)도 거짓이 된다 거짓이 둘이다' };
        if (d.lie === '다') return { ok: false, msg: '다가 거짓이면 셋째 집이 아니다 그러면 가는 참이고, 나(가는 거짓말)는 거짓이 된다 거짓이 둘이다' };
        return { ok: false, msg: '거짓말 쪽지는 맞다 그러면 가와 다는 참이다 다를 다시 읽어 본다' };
      },
      reveal: {
        title: '거짓말은 나, 집은 셋째',
        text: '“가는 거짓말이야”가 거짓이니 가는 참이고 둘째 집이 아니다 다도 참이니 셋째 집이다',
        scene: [
          '민서는 셋 중 하나가 거짓이라는 이 놀이를 좋아했다 중학교 때 쪽지로 시작했고 한 번도 내가 못 푼 적이 없었는데, 이번에도 풀렸다는 게 조금 분했다',
        ],
        unlock: null,
      },
    },

    walk: {
      title: '마을로 걸어가기',
      scene: 'village',
      intro: '갈림길마다 고른다 편지는 “역을 등지고”에서 시작한다 몇 번째 집인지는 쪽지에서 나왔다',
      docs: ['letter', 'handmap'],
      hintCode: 'T-S05',
      hints: [
        '“역을 등지고”는 역을 뒤에 두고 선다는 뜻입니다 지도는 위가 북쪽이고 역은 아래에 있으니, 그렇게 서면 왼쪽이 서쪽입니다',
        '왼쪽(서쪽)으로 가다 두 번째 골목에서 오른쪽(북쪽) 다리를 건너자마자 왼쪽 몇 번째 집인지는 쪽지 세 장에서 나온 답입니다',
        '왼쪽 → 직진 → 오른쪽 → 직진(다리) → 왼쪽 → 쪽지에서 나온 번째 집(셋째)',
      ],
      initial: () => ({ at: 'S', heading: 'N', path: [], lane: null, house: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'walk');
        const segs = d.path.map(([a, b]) => [MAP.nodes[a] || LANE_END[a], MAP.nodes[b] || LANE_END[b]]);
        const mapBox = el('div', 'walk-map');
        mapBox.innerHTML = `<img src="assets/v2/station/props/kraft.webp" alt="" decoding="async"><div class="kraft-map">${svgMap(segs, d.house)}</div>`; mapBox.classList.add('prop', 'kraft');
        wrap.append(mapBox);
        const here = el('p', 'walk-here');
        const headingName = { N: '북쪽(역을 등진 방향)', S: '남쪽(역 쪽)', E: '동쪽', W: '서쪽' }[d.heading];
        if (d.lane) {
          const lane = LANES[d.lane];
          here.innerHTML = `<b>${lane.name}</b>에 들어섰다 집이 ${lane.houses.length}채 늘어서 있다 보는 방향 ${headingName} · 집을 고르면 대문 앞에 선다`;
          wrap.append(here);
          const row = el('div', 'pick-row');
          lane.houses.forEach((hid, i) => { const b = el('button', 'chip' + (d.house === hid ? ' on' : ''), `${['첫', '둘', '셋', '넷'][i]}째 집`); b.type = 'button'; b.onclick = () => { d.house = hid; save(); }; row.append(b); });
          wrap.append(row);
        } else {
          const node = WALK[d.at];
          here.innerHTML = `<b>${PLACE_NAMES[d.at] || '갈림길'}</b> — ${d.path.length ? '지금까지 ' + d.path.length + '번 움직였다 ' : ''}보는 방향: ${headingName}${d.at === 'D' ? ' 앞에 개울과 다리가 있다' : ''}`;
          wrap.append(here);
          const row = el('div', 'pick-row');
          node.choices.forEach((c) => { const b = el('button', 'chip', c.dir + (c.bridge ? ' (다리 건너기)' : '')); b.type = 'button'; b.onclick = () => { d.path.push([d.at, c.to]); if (LANES[c.to]) { d.lane = c.to; } else { d.at = c.to; } d.heading = c.heading; save(); }; row.append(b); });
          wrap.append(row);
        }
        const back = el('button', 'ctl wide', '역 앞으로 되돌아가기'); back.type = 'button'; back.onclick = () => { Object.assign(d, { at: 'S', heading: 'N', path: [], lane: null, house: null }); save(); };
        wrap.append(back);
        return wrap;
      },
      commitLabel: '이 집 대문에 열쇠 넣기',
      canCommit: (d) => !!d.house,
      check(d) {
        if (!d.lane) return { ok: false, msg: '아직 집이 늘어선 길까지 가지 않았습니다 갈림길에서 방향을 고르세요' };
        if (!d.house) return { ok: false, msg: '집을 하나 골라야 합니다' };
        if (d.house === ANSWER_HOUSE) return { ok: true };
        const first = d.path[0]?.[1];
        if (first === 'F') return { ok: false, msg: '열쇠가 안 들어간다 첫 방향부터 틀렸나 편지는 “역을 등지고”로 시작한다 그렇게 서면 어디가 왼쪽이지' };
        if (d.lane === 'X') return { ok: false, msg: '둘째 골목을 지나쳐 버렸다 편지는 둘째 골목에서 오른쪽으로 꺾어 다리를 건너라고 했다' };
        if (d.lane === 'R') return { ok: false, msg: '다리는 건넜는데, 건너자마자 왼쪽이었다 이 길은 오른쪽 길이다' };
        if (d.lane === 'FL') return { ok: false, msg: '동쪽 언덕길이다 편지의 첫 방향부터 다시 보자' };
        if (d.lane === 'GL') return { ok: false, msg: '여긴 첫째 골목 편지는 두 번째 골목에서 꺾으라고 했다' };
        if (d.lane === 'L') return { ok: false, msg: '열쇠가 안 들어간다 길은 맞는 것 같다 몇 번째 집인지는 쪽지 세 장이 정한다' };
        return { ok: false, msg: '열쇠가 안 들어간다 편지의 순서대로 다시 걸어 보자' };
      },
      reveal: {
        title: '파란 대문',
        text: '열쇠가 돌아갔다',
        scene: ['마당 안쪽에서 매미 소리보다 큰 웃음소리가 났다 두 사람 몫이었다'],
        unlock: null,
        ending: true,
        endingLabel: '대문 안으로',
      },
    },
  },

  ending: {
    image: 'assets/v2/station/ending.webp',
    imageAlt: '여름 저녁 마당의 평상, 할머니와 민서',
    eyebrow: '수림, 오후 다섯 시',
    title: '없는 승강장에서 온 초대',
    paragraphs: [
      '평상 위에 수박이 잘려 있었고 할머니가 먼저 손을 흔들었다 민서는 일어나지 않았는데, 일어나면 울 것 같은 얼굴이었다',
      '“왔네”',
      '“왔지”',
      '“무서웠어”',
      '“알아”',
      '“진짜로 무서웠다고 네가 어디 가서 안 돌아오는 줄 알았어”',
      '민서가 수박을 내려놓았다 “미안 그건 내가 잘못했어 네가 밤새 전화 걸 거 알면서 껐어”',
      '“그래서 더 화나”',
      '“응 화내도 돼”',
      '“전화는 왜 보관함에 넣어”',
      '“들고 있으면 받을 것 같아서 받으면 다 말해 버릴 것 같았어”',
      '“말하지 그럼”',
      '“말로 들으면 넌 걱정만 했을 거야 와서 보면 알 것 같았어 할머니도, 여기도”',
      '할머니가 수박을 하나 더 자르며 말했다 “얘가 여름 내내 그 얘기만 했어 걔는 길 잘 찾아, 걔는 길 잘 찾아”',
      '열쇠를 돌려주려다 말았다 민서가 그건 네 거라고 했다',
      '“다음엔 그냥 말로 해”',
      '민서가 한참 있다가 고개를 끄덕였다 “응 다음엔 전화 받을게 먼저 걸게”',
    ],
    afterword: '민서는 수림에 남았고 나는 토요일마다 09:40 열차를 탄다 둘째 칸이고, 자리에 이름은 없다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=letter', title: '반송된 편지', line: '다음은 다섯 번 돌아온 편지 이야기입니다' },
  },
};
