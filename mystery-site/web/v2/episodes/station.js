// 세 번째 승강장 — 이야기·자료·장치가 전부 이 파일에 있습니다.
// 엔진(v2/engine.js)은 이 파일의 구조만 알고, 내용은 모릅니다.

const BOARD = [
  // 열차 안내판 7×7. 글자 자체가 단서판입니다. 구간권의 구멍을 겹쳐 읽습니다.
  ['미', '루', '행', '0', '6', '1', '5'],
  ['산', '장', '2', '행', '0', '번', '둘'],
  ['북', '문', '행', '둘', '완', '째', '수'],
  ['1', '0', '강', '변', '기', '림', '행'],
  ['공', '단', '급', '둥', '0', '9', '4'],
  ['남', '문', '행', '1', '1', '2', '0'],
  ['중', '앙', '환', '승', '역', '안', '내'],
];
// 구멍(5×5 창 기준 좌표). 올바른 자리(오른쪽 2, 아래 1, 회전 0)에서 창 (r,c) → BOARD[1+r][2+c]:
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

// 마을 지도: 역에서 출발, 갈림길마다 왼쪽/오른쪽/직진. 정답 경로 → 다리 건너 왼쪽 길의 세 번째 집(H3).
// 좌표는 SVG(0~100) 기준. 역은 아래쪽, 북쪽이 위.
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

const WALK = {
  // 현재 위치 → 갈림길 선택지. 진행 방향을 기억해 "왼쪽/오른쪽"을 지도 방향으로 바꿉니다.
  S: { choices: [{ dir: '왼쪽', to: 'B', heading: 'W' }, { dir: '오른쪽', to: 'F', heading: 'E' }] },
  B: { choices: [{ dir: '오른쪽', to: 'GL', heading: 'N' }, { dir: '직진', to: 'C', heading: 'W' }] },
  C: { choices: [{ dir: '오른쪽', to: 'D', heading: 'N' }, { dir: '직진', to: 'X', heading: 'W' }] },
  D: { choices: [{ dir: '직진', to: 'E', heading: 'N', bridge: true }] },
  E: { choices: [{ dir: '왼쪽', to: 'L', heading: 'W' }, { dir: '오른쪽', to: 'R', heading: 'E' }] },
  F: { choices: [{ dir: '왼쪽', to: 'FL', heading: 'N' }] },
};
// 집이 늘어선 길(걷기의 끝). houses는 걸어가며 만나는 순서.
const LANES = {
  L: { name: '다리 건너 왼쪽 길', from: 'E', dir: 'W', houses: ['H1', 'H2', 'H3', 'H4'] },
  R: { name: '다리 건너 오른쪽 길', from: 'E', dir: 'E', houses: ['H8', 'H9', 'H10'] },
  GL: { name: '첫째 골목 끝', from: 'B', dir: 'N', houses: ['H6', 'H7'] },
  X: { name: '둘째 골목을 지나친 길 끝', from: 'C', dir: 'W', houses: ['H5'] },
  FL: { name: '동쪽 언덕길', from: 'F', dir: 'N', houses: ['H11', 'H12'] },
};
const ANSWER_HOUSE = 'H3';

const svgPostcard = `
<svg viewBox="0 0 360 240" class="postcard" role="img" aria-label="민서가 그린 수림역 엽서">
 <rect x="0" y="0" width="360" height="240" fill="#f6efdc"/>
 <rect x="10" y="10" width="340" height="220" fill="none" stroke="#b9a98a" stroke-dasharray="4 3"/>
 <!-- 산 -->
 <path d="M20 150 L90 80 L140 130 L190 70 L260 140 L330 95 L340 150 Z" fill="#cfd8c3" stroke="#6d7d5e" stroke-width="2"/>
 <!-- 역사 -->
 <rect x="110" y="120" width="150" height="70" fill="#f1e2c6" stroke="#5c4b32" stroke-width="2"/>
 <path d="M100 120 L185 92 L270 120 Z" fill="#8c5a3c" stroke="#5c4b32" stroke-width="2"/>
 <!-- 창문 4개 -->
 <g fill="#9fc3d8" stroke="#5c4b32" stroke-width="2">
  <rect x="122" y="136" width="20" height="18"/><rect x="152" y="136" width="20" height="18"/>
  <rect x="200" y="136" width="20" height="18"/><rect x="230" y="136" width="20" height="18"/>
 </g>
 <!-- 문 -->
 <rect x="176" y="150" width="20" height="40" fill="#7a5436" stroke="#5c4b32" stroke-width="2"/>
 <!-- 가로등 2개 -->
 <g stroke="#333" stroke-width="3" stroke-linecap="round">
  <line x1="60" y1="190" x2="60" y2="130"/><circle cx="60" cy="126" r="6" fill="#f3c969" stroke="#333"/>
  <line x1="300" y1="190" x2="300" y2="130"/><circle cx="300" cy="126" r="6" fill="#f3c969" stroke="#333"/>
 </g>
 <!-- 의자 1개와 조는 사람 -->
 <g stroke="#5c4b32" stroke-width="2" fill="#c98e5a">
  <rect x="28" y="172" width="34" height="8"/><line x1="32" y1="180" x2="32" y2="190"/><line x1="58" y1="180" x2="58" y2="190"/>
 </g>
 <g fill="none" stroke="#5c4b32" stroke-width="2"><circle cx="45" cy="158" r="7" fill="#f1e2c6"/><path d="M38 172 Q45 160 52 172"/><path d="M52 160 l6 -4 M54 164 l6 -3" stroke-dasharray="2 2"/></g>
 <text x="56" y="156" font-size="9" fill="#5c4b32" font-family="serif">zz</text>
 <!-- 새 3마리 -->
 <g fill="none" stroke="#2f2f2f" stroke-width="2" stroke-linecap="round">
  <path d="M40 50 q6 -6 12 0 q6 -6 12 0"/><path d="M80 38 q6 -6 12 0 q6 -6 12 0"/><path d="M290 48 q6 -6 12 0 q6 -6 12 0"/>
 </g>
 <!-- 땅 -->
 <line x1="10" y1="190" x2="350" y2="190" stroke="#6d7d5e" stroke-width="3"/>
 <text x="20" y="214" font-size="12" fill="#5c4b32" font-family="MihaejeSerif, serif">수림역. 네가 내릴 역. — 민서</text>
</svg>`;

const LANE_END = { L: { x: 0, y: 30 }, R: { x: 48, y: 30 }, GL: { x: 40, y: 56 }, X: { x: 0, y: 74 }, FL: { x: 96, y: 56 } };
function svgMap(path = [], picked = null) {
  const n = MAP.nodes;
  const road = (a, b) => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#b9a98a" stroke-width="2.2" stroke-linecap="round"/>`;
  const lanes = [
    road({ x: 0, y: 74 }, { x: 96, y: 74 }),
    road(n.B, n.G), road(n.C, n.D), road(n.D, n.E), road({ x: 0, y: 30 }, { x: 48, y: 30 }),
    road(n.F, n.FE), road(n.FE, { x: 96, y: 56 }),
    `<path d="M0 42 C 20 36, 40 48, 60 40 S 90 34, 100 42" fill="none" stroke="#9fc3d8" stroke-width="4"/>`,
    `<rect x="21" y="38" width="6" height="8" fill="#8c5a3c"/>`,
  ].join('');
  const walked = path.map(([a, b]) => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#d9872b" stroke-width="3" stroke-linecap="round"/>`).join('');
  const houses = MAP.houses.map((h) => `<g class="map-house${picked === h.id ? ' picked' : ''}"><rect x="${h.x - 3.5}" y="${h.y - 2.5}" width="7" height="5" fill="#efe3c9" stroke="#5c4b32" stroke-width="0.7"/><path d="M${h.x - 4.5} ${h.y - 2.5} L${h.x} ${h.y - 6} L${h.x + 4.5} ${h.y - 2.5} Z" fill="#8c5a3c" stroke="#5c4b32" stroke-width="0.7"/></g>`).join('');
  return `<svg viewBox="0 0 100 100" class="village-map" role="img" aria-label="민서의 손지도">
   <rect width="100" height="100" fill="#f6efdc"/>
   <text x="90" y="8" font-size="4" fill="#5c4b32">N ↑</text>
   ${lanes}${walked}${houses}
   <rect x="44" y="80" width="12" height="8" fill="#5c4b32"/><text x="50" y="94" font-size="3.6" text-anchor="middle" fill="#5c4b32">수림역</text>
   <ellipse cx="60" cy="64" rx="3" ry="2.4" fill="#d9872b" opacity=".8"/><text x="60" y="70.5" font-size="2.8" text-anchor="middle" fill="#5c4b32">감나무</text>
  </svg>`;
}

export default {
  id: 'station',
  number: '004',
  title: '세 번째 승강장',
  subtitle: '없는 승강장에서 온 사진',
  genre: '실종 미스터리 · 길 찾기',
  minutes: 25,
  difficulty: 3,
  cover: 'assets/v2/station/cover.webp',
  coverAlt: '새벽 대합실 벽에 기대 둔 낡은 3번 승강장 표지',
  music: 'assets/music/station-v33.mp3',
  tagline: '새벽 1시 14분, 사진 한 장.\n중앙역에 3번 승강장은 없다.',
  blurb: '회사를 그만두고 방을 뺀 친구가 보낸 마지막 사진은\n지금은 없는 승강장이었습니다. 친구가 남긴 길을 따라가세요.',
  storageKey: 'mihaeje-v2-station',

  opening: {
    eyebrow: '새벽 1시 14분',
    paragraphs: [
      '민서가 사진 한 장을 보냈다.',
      '낡은 법랑 표지판. 「3번 승강장」. 밑에 매직으로 쓴 한 줄.',
      '「여기서 시작. 찾아와.」',
      '전화는 바로 꺼졌다. 다시 걸어도 꺼져 있었다.',
      '민서는 두 달 전 회사를 그만뒀다. 방을 뺐다는 말은 지난주에 들었다. 어디로 가는지는 묻지 못했다. 묻기 전에 먼저 말해 줄 줄 알았다.',
      '중앙역에 3번 승강장은 없다. 1번과 2번뿐이다. 나는 아침 첫차를 탔다.',
    ],
    cta: '중앙역 대합실로',
  },

  traces: [
    { device: 'grille', label: '구멍 뚫린 구간권' },
    { device: 'mirror', label: '네컷사진' },
    { device: 'locker', label: '파란 리본 열쇠' },
    { device: 'walk', label: '파란 대문' },
  ],

  scenes: [
    {
      id: 'hall',
      name: '중앙역 대합실',
      image: 'assets/v2/station/hall.webp',
      arrive: '여섯 시 반의 대합실. 전광판은 아직 어제 날짜를 넘기지 못한 것처럼 느리게 깜빡인다. 안내판 아래, 벽에 기대 둔 흰 표지판이 보인다. 사진 속 그것이다.',
      hotspots: [
        { id: 'sign', x: 30, y: 70, label: '벽에 기댄 옛 표지판', kind: 'doc', doc: 'sign' },
        { id: 'clerk', x: 62, y: 52, label: '매표창구의 역무원', kind: 'doc', doc: 'clerk' },
        { id: 'notice', x: 17, y: 40, label: '승강장 개편 안내', kind: 'doc', doc: 'notice' },
        { id: 'board', x: 42, y: 28, label: '열차 안내판', kind: 'device', device: 'grille' },
        { id: 'tophone', x: 86, y: 84, label: '민서의 마지막 메시지', kind: 'doc', doc: 'message' },
      ],
    },
    {
      id: 'platform',
      name: '2번 승강장 · 둘째 기둥',
      image: 'assets/v2/station/platform.webp',
      unlockedBy: 'grille',
      arrive: '안개가 선로 위에 낮게 깔려 있다. 둘째 기둥. 눈높이에 네컷사진 한 장이 테이프로 붙어 있다. 사진 속 두 사람 중 하나는 나다.',
      hotspots: [
        { id: 'strip', x: 27, y: 34, label: '기둥에 붙은 네컷사진', kind: 'doc', doc: 'strip' },
        { id: 'table', x: 29, y: 57, label: '기둥의 출발 시각표', kind: 'doc', doc: 'timetable' },
        { id: 'mirror', x: 60, y: 40, label: '승강장 끝의 볼록거울', kind: 'device', device: 'mirror' },
        { id: 'brief', x: 37, y: 60, label: '벤치 — 민서와 나', kind: 'doc', doc: 'brief' },
      ],
    },
    {
      id: 'surim',
      name: '수림역 · 보관함',
      image: 'assets/v2/station/surim.webp',
      unlockedBy: 'mirror',
      arrive: '열차는 북문을 서지 않고 지나쳤다. 수림역은 역무원이 없다. 문 옆에 보관함 열두 칸. 열한 칸은 닫혀 있고, 한 칸에 노란 별 스티커가 붙어 있다. 민서는 뭐든 별 스티커를 붙였다.',
      hotspots: [
        { id: 'postcard', x: 60, y: 30, label: '게시판의 그림엽서', kind: 'doc', doc: 'postcard' },
        { id: 'lockerrule', x: 12, y: 24, label: '보관함 이용 안내', kind: 'doc', doc: 'lockerrule' },
        { id: 'locker', x: 30, y: 52, label: '별 스티커가 붙은 보관함', kind: 'device', device: 'locker' },
      ],
    },
    {
      id: 'village',
      name: '수림 마을길',
      image: 'assets/v2/station/village.webp',
      unlockedBy: 'locker',
      arrive: '보관함 안에는 파란 리본을 맨 열쇠, 접은 종이 한 장, 그리고 편지. 역 밖은 매미 소리로 꽉 차 있다. 길은 왼쪽과 오른쪽으로 갈라진다.',
      hotspots: [
        { id: 'letter', x: 24, y: 70, label: '민서의 편지', kind: 'doc', doc: 'letter' },
        { id: 'handmap', x: 46, y: 74, label: '접힌 손지도', kind: 'doc', doc: 'handmap' },
        { id: 'walk', x: 56, y: 52, label: '마을로 걸어가기', kind: 'device', device: 'walk' },
      ],
    },
  ],

  docs: {
    message: {
      title: '민서의 마지막 메시지',
      kind: '휴대폰 · 01:14',
      html: `<div class="phone-msg"><div class="bubble photo"><div class="enamel">3번 승강장</div><p class="scrawl">여기서 시작. 찾아와.</p></div><div class="bubble-time">오전 1:14</div><div class="bubble mine">민서야 어디야</div><div class="bubble mine">전화 좀 받아</div><p class="sys">상대방이 전화를 받을 수 없습니다 · 전원이 꺼져 있음</p></div>`,
    },
    sign: {
      title: '벽에 기댄 옛 표지판',
      kind: '법랑 · 모서리가 깨짐',
      html: `<p>흰 바탕에 검은 글씨. <b>3번 승강장</b>. 개편 전에 떼어 낸 것을 역무원이 버리지 못하고 벽에 세워 두었다고 한다.</p><p>뒷면 아래쪽에 투명 테이프로 종이 한 장이 붙어 있다. 구간권이다. 네모난 구멍이 여섯 개 뚫려 있고, 위쪽 여백에 민서 글씨.</p><blockquote class="hand">시간표에 대 봐. 화살표는 위로.</blockquote><div class="ticket-prop"><span class="arrow">▲</span><div class="holes"><i style="--r:0;--c:0"></i><i style="--r:0;--c:3"></i><i style="--r:1;--c:1"></i><i style="--r:1;--c:3"></i><i style="--r:2;--c:2"></i><i style="--r:3;--c:1"></i></div><small>미루선 구간권 · 800원</small></div><p class="aside">구간권은 열차 안내판(대합실 위쪽)의 글자판과 같은 크기의 칸으로 나뉘어 있다.</p>`,
    },
    clerk: {
      title: '매표창구의 역무원',
      kind: '박종길 · 야간 근무',
      html: `<p>창구 안의 남자는 커피를 반쯤 남긴 채 신문을 접었다.</p><blockquote>“새벽에 여자분 하나가 저 표지판 앞에 한참 서 있다가, 뭘 붙이고 갔어요. 떼려다 뒀습니다. ‘사람이 올 거예요’ 하길래.”</blockquote><blockquote>“3번? 지금은 없어요. 작년에 개편하면서 번호를 바꿨어요. 저 표지판이 서 있던 자리는 지금 2번이에요. 북쪽 가는 쪽.”</blockquote><blockquote>“그 여자분, 첫차 타고 올라갔어요. 어느 열차였는지는… 승강장 가서 물어보시든가. 기둥에도 뭘 붙였을걸요. 테이프 소리가 들렸으니까.”</blockquote>`,
    },
    notice: {
      title: '승강장 개편 안내',
      kind: '게시물 · 작년 3월',
      html: `<p class="eyebrow">미루선 중앙역 승강장 번호 변경</p><table><thead><tr><th>개편 전</th><th>현재</th><th>방향</th></tr></thead><tbody><tr><td>3번</td><td>2번</td><td>북행 (북문 · 수림 · 산장)</td></tr><tr><td>2번</td><td>1번</td><td>남행 (남문 · 강변 · 공단)</td></tr><tr><td>1번</td><td>폐쇄</td><td>—</td></tr></tbody></table><p>대합실 위쪽 열차 안내판은 글자판을 한 칸씩 끼우는 옛날식입니다. 글자판 교체 중에는 안내가 뒤섞일 수 있습니다.</p>`,
    },
    brief: {
      title: '민서와 나',
      kind: '내 기억',
      html: `<p>스무 살. 매일 아침 09:40 통학열차, 둘째 칸. 어느 날 내 자리에 모르는 애가 앉아 있었다. 비켜 달라고 했더니 “자리 이름 적혀 있어?” 했다. 그게 민서였다.</p><p>민서는 뭐든 별 스티커를 붙였다. 노트, 휴대폰, 내 가방에도. 중학교 때부터 쪽지를 거울 글씨로 쓰는 버릇이 있었다. 선생님이 못 읽게 하려고 시작한 거라고 했다.</p><p>외할머니 얘기를 자주 했다. 수림 어디 산골에 혼자 사신다고. 여름마다 갔는데 작년부터는 못 갔다고.</p><p>회사를 그만둔 뒤로 연락이 뜸해졌다. 괜찮냐고 묻지 않았다. 묻지 않는 게 배려라고 생각했다.</p>`,
    },
    strip: {
      title: '기둥에 붙은 네컷사진',
      kind: '앞면 · 뒷면',
      html: `<div class="strip-prop"><div class="frames"><i></i><i></i><i></i><i></i></div><p class="aside">4년 전 역 앞 사진 부스. 둘 다 눈을 감은 컷이 하나 있다.</p></div><p>뒷면에 민서 글씨가 있다. 그런데 글자가 전부 뒤집혀 있다. 왼손으로 쓴 것처럼 삐뚤고, 자음이 거꾸로다.</p><p class="mirror-text">우리가 처음 만난 그 시간 열차. 종점까지 와.</p><p class="aside">승강장 끝에 볼록거울이 있다.</p>`,
    },
    timetable: {
      title: '기둥의 출발 시각표',
      kind: '2번 승강장 · 북행',
      html: `<table><thead><tr><th>출발</th><th>행선</th><th>정차</th><th>종별</th></tr></thead><tbody>${TRAINS_2.map((t) => `<tr><td>${t.time}</td><td>${t.to}행</td><td>${t.stops}</td><td>${t.kind}</td></tr>`).join('')}</tbody></table><p class="aside">맞은편 1번 승강장(남행)의 시각표도 보인다.</p><table class="dim"><thead><tr><th>출발</th><th>행선</th><th>정차</th><th>종별</th></tr></thead><tbody>${TRAINS_1.map((t) => `<tr><td>${t.time}</td><td>${t.to}행</td><td>${t.stops}</td><td>${t.kind}</td></tr>`).join('')}</tbody></table>`,
    },
    postcard: {
      title: '게시판의 그림엽서',
      kind: '민서의 손그림',
      html: `${svgPostcard}<p>뒷면.</p><blockquote class="hand">보관함 번호는 그림 안에 있어.<br>새, 창, 등, 의자 순서로.<br>벤치에서 조는 사람은 세지 마. 그거 너야.</blockquote>`,
    },
    lockerrule: {
      title: '보관함 이용 안내',
      kind: '수림역 · 무인',
      html: `<p>숫자 네 자리를 맞추고 손잡이를 당기세요. 세 번 틀리면 30초 동안 잠깁니다. 물건은 7일까지 보관됩니다.</p><p class="aside">별 스티커가 붙은 칸은 7번. 다이얼이 전부 0에 맞춰져 있다.</p>`,
    },
    letter: {
      title: '민서의 편지',
      kind: '보관함 안 · 봉투 없이',
      html: `<div class="letter-paper"><p>왔네.</p><p>여기까지 왔으면 반은 온 거야. 열쇠는 우리 집 대문 열쇠. 지도는 내가 그렸는데 좀 못 그렸어.</p><p>역을 등지고 서. 그 상태에서 <b>왼쪽</b>으로 가.<br><b>두 번째 골목</b>에서 <b>오른쪽</b>으로 꺾어.<br>다리를 건너. 건너자마자 <b>왼쪽</b>.<br>그 길에서 <b>세 번째 집</b>. 파란 대문.</p><p>대문 색은 지도에 안 그렸어. 그려 놓으면 네가 지도만 보고 올 거잖아.</p><p>— 민서</p></div>`,
    },
    handmap: {
      title: '접힌 손지도',
      kind: '볼펜 · 뒷면은 영수증',
      html: `${svgMap()}<p class="aside">위가 북쪽. 역은 지도 아래쪽에 있다. 집들은 전부 같은 모양으로 그려져 있고 대문 색은 없다.</p>`,
    },
    final: {
      title: '민서의 편지 · 마지막 장',
      kind: '봉투 안에 한 장 더',
      locked: true,
      html: `<div class="letter-paper"><p>할머니가 겨울에 넘어지셨어. 아무한테도 말 안 하고 혼자 석 달을 누워 계셨대. 그 얘기를 듣고 그날 사표 냈어.</p><p>너한테는 말을 못 했어. 말하면 네가 말릴 것 같았고, 안 말리면 그게 더 서운할 것 같았어. 그래서 네가 직접 오게 만들었어. 넌 길 찾는 거 잘하잖아. 그리고 여기까지 온 사람은 그냥 못 돌아가.</p><p>전화는 안 터져. 진짜야. 마당 끝에 서면 한 칸 뜨는데, 거기서 울면서 전화하긴 싫었어.</p><p>수박 잘라 놨어.</p></div>`,
    },
  },

  devices: {
    grille: {
      title: '열차 안내판',
      scene: 'hall',
      intro: '글자판이 7×7로 끼워져 있다. 구간권을 겹쳐 올릴 수 있다. 구멍으로 보이는 글자가 민서가 남긴 말이다.',
      docs: ['sign', 'notice'],
      hintCode: 'T-S01',
      hints: [
        '구간권의 화살표가 위를 보게 한 채로, 안내판 위에서 움직여 보세요. 구멍으로 읽히는 글자가 말이 되는 자리는 하나뿐입니다.',
        '오른쪽으로 두 칸, 아래로 한 칸. 돌리지 않습니다. 숫자 하나와 글자 다섯이 읽힙니다.',
        '읽히는 글자는 「2번 둘째 기둥」입니다. 2번 승강장의 둘째 기둥을 고르세요.',
      ],
      initial: () => ({ dx: 0, dy: 0, turn: 0, platform: null, pillar: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'grille');
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
        wrap.append(board);
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
        if (!d.platform || !d.pillar) return { ok: false, msg: '승강장과 기둥을 하나씩 골라야 합니다.' };
        if (d.platform === 2 && d.pillar === 2) return { ok: true };
        const txt = readHoles(d);
        if (txt === '2번둘째기둥') return { ok: false, msg: `구멍으로는 「${txt}」이 읽힙니다. 고른 곳이 그 글자와 다릅니다.` };
        if (d.platform === 1) return { ok: false, msg: '1번 승강장은 남행입니다. 표지판이 서 있던 자리는 그쪽이 아니었습니다. 구멍으로 읽히는 글자를 다시 보세요.' };
        return { ok: false, msg: `기둥이 다릅니다. 지금 구멍으로 읽히는 글자는 「${txt}」. 말이 되는 자리를 찾을 때까지 구간권을 움직여 보세요.` };
      },
      reveal: {
        title: '2번 승강장, 둘째 기둥',
        text: '역무원이 개찰구를 열어 준다. “북쪽 가는 쪽이요. 기둥은 선로 쪽에서 세요.”',
        scene: [
          '구간권을 주머니에 넣었다. 구멍 여섯 개. 민서가 이걸 칼로 하나씩 뚫고 있었을 생각을 하니 조금 화가 났다. 조금.',
          '개찰구를 지나며 역무원이 덧붙였다. “그 여자분, 웃고 있었어요. 걱정은 안 하셔도 될 것 같던데.”',
        ],
        unlock: 'platform',
      },
    },

    mirror: {
      title: '승강장 끝의 볼록거울',
      scene: 'platform',
      intro: '열차 기관사가 승강장 전체를 보라고 달아 둔 거울이다. 네컷사진을 거울 앞에 들면 뒷면 글씨가 바로 보인다.',
      docs: ['strip', 'timetable', 'brief'],
      hintCode: 'T-S02',
      hints: [
        '민서의 쪽지는 거울 글씨입니다. 거울에 비추면 읽힙니다. 읽은 문장 안에 “시간”과 “종점”이 있습니다.',
        '민서와 처음 만난 시간은 「민서와 나」에 적혀 있습니다. 같은 시간 열차가 두 승강장에 하나씩 있는데, 지금 서 있는 곳은 2번 승강장입니다.',
        '09:40 수림행 급행입니다. 종점은 수림.',
      ],
      initial: () => ({ held: false, train: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'mirror');
        const glass = el('div', 'mirror-glass' + (d.held ? ' held' : ''));
        const paper = el('p', 'mirror-paper', '우리가 처음 만난 그 시간 열차. 종점까지 와.');
        glass.append(paper);
        wrap.append(glass);
        const b = el('button', 'ctl wide', d.held ? '사진 내리기' : '네컷사진을 거울 앞에 들기'); b.type = 'button'; b.onclick = () => { d.held = !d.held; save(); };
        wrap.append(b);
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
        if (!d.train) return { ok: false, msg: '열차를 하나 골라야 합니다.' };
        if (d.train === 'n0940') return { ok: true };
        if (d.train === 's0940') return { ok: false, msg: '시간은 맞습니다. 하지만 그 열차는 건너편 1번 승강장에서 남쪽으로 갑니다. 민서는 이 기둥, 2번 승강장에 사진을 붙였습니다.' };
        if (!d.held) return { ok: false, msg: '뒷면 글씨를 아직 읽지 않았습니다. 거울에 비춰 보면 “시간”이 적혀 있습니다.' };
        const t = [...TRAINS_2, ...TRAINS_1].find((x) => x.id === d.train);
        return { ok: false, msg: `${t.time} ${t.to}행은 “처음 만난 그 시간”이 아닙니다. 「민서와 나」에 그 시간이 있습니다.` };
      },
      reveal: {
        title: '09:40 수림행 급행',
        text: '둘째 칸에 탔다. 자리에 이름은 적혀 있지 않았다.',
        scene: [
          '네컷사진을 창틀에 세워 뒀다. 눈 감은 컷에서 민서는 웃고 있다. 나는 그 컷을 제일 싫어했고, 민서는 제일 좋아했다.',
          '열차는 북문을 서지 않고 지나쳤다. 창밖이 산으로 바뀌는 동안 휴대폰을 세 번 봤다. 여전히 꺼져 있었다.',
        ],
        unlock: 'surim',
      },
    },

    locker: {
      title: '별 스티커가 붙은 보관함',
      scene: 'surim',
      intro: '7번 칸. 다이얼 네 개가 전부 0에 맞춰져 있다. 세 번 틀리면 30초 동안 잠긴다.',
      docs: ['postcard', 'lockerrule'],
      hintCode: 'T-S03',
      hints: [
        '엽서 그림 안의 물건을 셉니다. 순서는 엽서 뒷면에 적힌 대로: 새, 창, 등, 의자.',
        '새는 하늘에 있고, 창은 역사 벽에, 등은 가로등, 의자는 벤치입니다. 조는 사람은 세지 않습니다.',
        '새 3 · 창 4 · 등 2 · 의자 1 → 3421.',
      ],
      initial: () => ({ dial: [0, 0, 0, 0], fails: 0, lockedUntil: 0 }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'locker');
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
        if (d.lockedUntil > now) return { ok: false, msg: `잠겨 있습니다. ${Math.ceil((d.lockedUntil - now) / 1000)}초 뒤에 다시 당겨 보세요.` };
        const ans = [3, 4, 2, 1];
        const right = d.dial.filter((v, i) => v === ans[i]).length;
        if (right === 4) return { ok: true };
        d.fails = (d.fails || 0) + 1;
        if (d.fails >= 3) { d.fails = 0; d.lockedUntil = now + 30000; return { ok: false, msg: '세 번 틀렸습니다. 30초 동안 잠깁니다. 그동안 엽서를 다시 세어 보세요.' }; }
        const wrong = ['새', '창', '등', '의자'].filter((_, i) => d.dial[i] !== ans[i]);
        return { ok: false, msg: `손잡이가 걸립니다. ${right}자리는 맞습니다. 다시 셀 것: ${wrong.join(', ')}.` };
      },
      reveal: {
        title: '3 · 4 · 2 · 1',
        text: '문이 열린다. 파란 리본을 맨 열쇠, 접은 종이, 편지. 봉투는 없다. 민서는 봉투를 산 적이 없다.',
        scene: [
          '엽서를 떼어 뒤집어 보니 연필로 쓴 글씨가 한 줄 더 있었다. “세는 동안 네 얼굴 상상했어. 또 입 삐죽했지.”',
          '입을 삐죽했다.',
        ],
        unlock: 'village',
      },
    },

    walk: {
      title: '마을로 걸어가기',
      scene: 'village',
      intro: '갈림길마다 고른다. 편지는 “역을 등지고”에서 시작한다.',
      docs: ['letter', 'handmap'],
      hintCode: 'T-S04',
      hints: [
        '“역을 등지고”는 역을 뒤에 두고 선다는 뜻입니다. 지도는 위가 북쪽이고 역은 아래에 있으니, 그렇게 서면 왼쪽이 서쪽입니다.',
        '왼쪽(서쪽)으로 가다 두 번째 골목에서 오른쪽(북쪽). 다리를 건너자마자 왼쪽. 그 길에서 집을 셉니다.',
        '왼쪽 → 직진 → 오른쪽 → 직진(다리) → 왼쪽 → 세 번째 집.',
      ],
      initial: () => ({ at: 'S', heading: 'N', path: [], lane: null, house: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'walk');
        const segs = d.path.map(([a, b]) => [MAP.nodes[a] || LANE_END[a], MAP.nodes[b] || LANE_END[b]]);
        const mapBox = el('div', 'walk-map');
        mapBox.innerHTML = svgMap(segs, d.house);
        wrap.append(mapBox);
        const here = el('p', 'walk-here');
        const headingName = { N: '북쪽(역을 등진 방향)', S: '남쪽(역 쪽)', E: '동쪽', W: '서쪽' }[d.heading];
        if (d.lane) {
          const lane = LANES[d.lane];
          here.innerHTML = `<b>${lane.name}</b>에 들어섰다. 집이 ${lane.houses.length}채 늘어서 있다. 보는 방향: ${headingName}`;
          wrap.append(here);
          const row = el('div', 'pick-row');
          lane.houses.forEach((hid, i) => { const b = el('button', 'chip' + (d.house === hid ? ' on' : ''), `${['첫', '둘', '셋', '넷'][i]}째 집`); b.type = 'button'; b.onclick = () => { d.house = hid; save(); }; row.append(b); });
          wrap.append(row);
        } else {
          const node = WALK[d.at];
          here.innerHTML = `<b>${d.at === 'S' ? '수림역 앞' : '갈림길'}</b> — 보는 방향: ${headingName}${d.at === 'D' ? '. 앞에 개울과 다리가 있다.' : ''}`;
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
      check(d) {
        if (!d.lane) return { ok: false, msg: '아직 집이 늘어선 길까지 가지 않았습니다. 갈림길에서 방향을 고르세요.' };
        if (!d.house) return { ok: false, msg: '집을 하나 골라야 합니다.' };
        if (d.house === ANSWER_HOUSE) return { ok: true };
        const first = d.path[0]?.[1];
        if (first === 'F') return { ok: false, msg: '열쇠가 안 들어간다. 처음부터 방향이 반대였다. “역을 등지고” 서면 역은 뒤에 있다. 그때의 왼쪽은 지도에서 서쪽이다.' };
        if (d.lane === 'X') return { ok: false, msg: '여긴 둘째 골목 끝 집. 편지는 둘째 골목에서 오른쪽으로 꺾어 다리를 건너라고 했다.' };
        if (d.lane === 'R') return { ok: false, msg: '다리는 건넜는데, 건너자마자 왼쪽이었다. 이 길은 오른쪽 길이다.' };
        if (d.lane === 'FL') return { ok: false, msg: '동쪽 언덕길이다. 편지의 첫 방향부터 다시 보자.' };
        if (d.lane === 'GL') return { ok: false, msg: '여긴 첫째 골목. 편지는 두 번째 골목에서 꺾으라고 했다.' };
        if (d.lane === 'L') return { ok: false, msg: `길은 맞다. 이 길에서 세 번째 집이다. 지금 고른 집은 ${LANES.L.houses.indexOf(d.house) + 1}번째.` };
        return { ok: false, msg: '열쇠가 안 들어간다. 편지의 순서대로 다시 걸어 보자.' };
      },
      reveal: {
        title: '파란 대문',
        text: '열쇠가 돌아간다.',
        scene: ['마당 안쪽에서 매미 소리보다 큰 웃음소리가 난다. 두 사람 몫이다.'],
        unlock: null,
        ending: true,
      },
    },
  },

  ending: {
    image: 'assets/v2/station/ending.webp',
    imageAlt: '여름 저녁 마당의 평상, 할머니와 민서',
    eyebrow: '수림, 오후 다섯 시',
    title: '없는 승강장에서 온 초대',
    paragraphs: [
      '평상 위에 수박이 잘려 있었다. 할머니가 먼저 손을 흔들었다. 민서는 일어나지 않았다. 일어나면 울 것 같은 얼굴이었다.',
      '“왔네.” “왔지.”',
      '“전화는 왜 꺼.” “안 터져. 진짜야.” “그래도.” “그래도 뭐.”',
      '할머니가 수박을 하나 더 잘랐다. “얘가 겨울 내내 그 얘기만 했어. 걔는 길 잘 찾아, 걔는 길 잘 찾아.”',
      '나는 열쇠를 돌려주려다 말았다. 민서가 “그건 네 거야” 했다. “다음엔 그냥 말로 해.” “그럼 재미없잖아.”',
    ],
    afterword: '민서는 수림에 남았다. 나는 토요일마다 09:40 열차를 탄다. 둘째 칸, 자리에 이름은 없다.',
    unlockDoc: 'final',
    next: { href: 'episode.html?case=letter', title: '반송된 편지', line: '같은 역을 지나는 네 통의 편지가 돌아왔습니다.' },
  },
};
