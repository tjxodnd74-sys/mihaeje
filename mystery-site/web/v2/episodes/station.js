// 세 번째 승강장 — 이야기·자료·장치가 전부 이 파일에 있습니다
// 엔진(v2/engine.js)은 이 파일의 구조만 알고, 내용은 모릅니다

const BOARD = [
  // 열차 안내판 7×7 글자판 구간권의 구멍을 겹쳐 읽습니다
  ['미', '루', '행', '0', '6', '1', '5'],
  ['산', '장', '3', '행', '번', '둘', '수'],
  ['북', '문', '급', '행', '0', '둘', '림'],
  ['완', '째', '강', '변', '기', '2', '행'],
  ['공', '단', '행', '기', '0', '둥', '4'],
  ['남', '문', '둥', '수', '둥', '행', '0'],
  ['중', '앙', '환', '승', '역', '안', '내'],
];
// 구멍(5×5, 구간권을 처음 놓은 방향 기준) 시계 방향으로 한 번 돌려 오른쪽 1·아래 1에 놓으면
// 「3번둘째기둥」이 읽힌다 처음 방향(돌리지 않음)으로는 어느 자리에서도 말이 되지 않는다
const HOLES = [[3, 0], [1, 0], [0, 1], [4, 2], [2, 3], [1, 4]];
const GRILLE_READ = '3번둘째기둥';

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
  { id: 'n0910', time: '09:10', to: '북문', stops: '북문 종착', kind: '완행', pf: 2 },
  { id: 'n0925', time: '09:25', to: '산장', stops: '북문 · 수림 · 산장', kind: '완행', pf: 2 },
  { id: 'n0940', time: '09:40', to: '수림', stops: '북문 통과 · 수림 종착', kind: '급행', pf: 2 },
  { id: 'n0958', time: '09:58', to: '수림', stops: '북문 · 수림 종착', kind: '완행', pf: 2 },
  { id: 'n1015', time: '10:15', to: '산장', stops: '북문 · 수림 · 산장', kind: '완행', pf: 2 },
];
const TRAINS_1 = [
  { id: 's0918', time: '09:18', to: '남문', stops: '남문 종착', kind: '완행', pf: 1 },
  { id: 's0940', time: '09:40', to: '강변', stops: '남문 통과 · 강변 종착', kind: '급행', pf: 1 },
  { id: 's1002', time: '10:02', to: '공단', stops: '남문 · 강변 · 공단', kind: '완행', pf: 1 },
];
// 출발 안내는 남북을 한 줄로 섞어 시각 순으로
const TRAINS_ALL = [...TRAINS_2, ...TRAINS_1].sort((a, b) => a.time.localeCompare(b.time) || b.pf - a.pf);
// 시각은 이 뒷면에만 있다 (「민서와 나」에는 시각이 없고, 수림 종점 열차는 둘)
const STRIP_BACK = '우리 처음 만난 그 열차 9시 40분 종점에서 내려 할머니 동네야';
// 볼록거울 받침대 눈금(0~10) 중 빨간 페인트가 칠해진 칸 사진을 거울과 같은 기울기로 들어야 비친 글씨가 바로 선다
const MIRROR_MARK = 7;
// 화면에 보이는 눈금(반올림)이 7이면 맞은 것으로 본다 (6.5~7.4)
const tiltOk = (t) => Math.round((t ?? 0) / 10) === MIRROR_MARK;

// 마을 지도: 역에서 출발, 갈림길마다 왼쪽/오른쪽/직진 정답 경로 → 다리 건너 왼쪽 길 → 감나무 옆 파란 대문(H3)
// 좌표는 SVG(0~100) 기준 역은 아래쪽, 북쪽이 위
const MAP = {
  nodes: {
    S: { x: 70, y: 76 }, // 역 앞 길
    B: { x: 56, y: 76 }, // 첫째 골목 입구
    G: { x: 56, y: 58 }, // 첫째 골목 끝(막다른 길)
    C: { x: 42, y: 76 }, // 둘째 골목 입구
    D: { x: 42, y: 50 }, // 둘째 골목, 다리 앞
    E: { x: 42, y: 30 }, // 다리 건넌 뒤 갈림길
    F: { x: 88, y: 76 }, // 동쪽 골목 입구
    FE: { x: 88, y: 56 },
  },
  houses: [
    { id: 'H1', x: 34, y: 20 }, { id: 'H2', x: 25, y: 20 }, { id: 'H3', x: 16, y: 20 }, { id: 'H4', x: 7, y: 20 },
    { id: 'H8', x: 52, y: 20 }, { id: 'H9', x: 61, y: 20 }, { id: 'H10', x: 70, y: 20 },
    { id: 'H6', x: 50, y: 60 }, { id: 'H7', x: 62, y: 60 },
    { id: 'H5', x: 8, y: 66 },
    { id: 'H11', x: 81, y: 64 }, { id: 'H12', x: 81, y: 55 },
  ],
  persimmon: ['H1', 'H3'], // 손지도에 감나무가 그려진 집 (둘)
};
// 걸어가서 보이는 대문 색 (지도엔 없음) 파란 대문은 마을에 여럿
const GATE = { H1: '초록', H2: '파랑', H3: '파랑', H4: '파랑', H8: '파랑', H9: '흰색', H10: '파랑', H6: '파랑', H7: '갈색', H5: '파랑', H11: '초록', H12: '파랑' };
const GATE_CSS = { 초록: '#3f7a4a', 파랑: '#2f5fb0', 회색: '#8b8f94', 흰색: '#e9e6dc', 갈색: '#7a5233' };

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
  L: { name: '다리 건너 왼쪽 길', from: 'E', dir: 'W', houses: ['H1', 'H2', 'H3', 'H4'], sound: '길 안쪽은 조용했다 매미 소리 말고는 아무 소리도 없었다' },
  R: { name: '다리 건너 오른쪽 길', from: 'E', dir: 'E', houses: ['H8', 'H9', 'H10'], sound: '첫 집 담 너머에서 개가 목줄을 끌며 미친 듯이 짖어 댔다' },
  GL: { name: '첫째 골목 끝', from: 'B', dir: 'N', houses: ['H6', 'H7'], sound: '막다른 골목이었다 대문 앞에 신문이 사흘 치 쌓여 있었다' },
  X: { name: '둘째 골목을 지나친 길 끝', from: 'C', dir: 'W', houses: ['H5'], sound: '길이 논두렁에서 끊겼다 집은 한 채뿐이고 창이 판자로 막혀 있었다' },
  FL: { name: '동쪽 언덕길', from: 'F', dir: 'N', houses: ['H11', 'H12'], sound: '언덕 위로 올라갈수록 매미 소리가 멀어졌다' },
};
const ANSWER_HOUSE = 'H3';
// 쪽지 세 장: 정확히 하나만 거짓 → 가는 다를 믿고, 다가 거짓이면 가도 거짓 / 가가 거짓이면 다도 거짓 → 거짓은 나
// '나는 거짓말이야'는 '나(1인칭)는'으로도 읽혀서 '나 쪽지는'으로 적는다
const NOTES = [
  { id: '가', text: '다 쪽지는 참말이야' },
  { id: '나', text: '우리 집 대문은 파란색이 아니야' },
  { id: '다', text: '나 쪽지는 거짓말이야' },
];

// 민서 휴대폰 잠금 패턴: 숫자 3을 위에서부터 그린다 (점 번호 1~9, 왼쪽 위부터 가로로)
// 단서 ① 「민서와 나」: 숫자 하나를 그리는 잠금, 무슨 숫자냐면 우리 처음 만난 데 → 3번 승강장 → 3
// 단서 ② 창빛에 비친 화면의 손가락 기름 자국: 1-2-3 · 3-5 · 5-9 · 9-8-7 선과 1에 꾹 누른 둥근 자국
// 함정: 화면을 쓸어 넘긴 긴 줄(점과 점을 잇지 않고 화면 끝까지 감) · 거꾸로 7에서 시작
const PATTERN = [1, 2, 3, 5, 9, 8, 7];
const PDOT = (n) => ({ x: 50 + ((n - 1) % 3) * 100, y: 50 + Math.floor((n - 1) / 3) * 100 });
const PAT_NAME = ['', '왼쪽 위', '가운데 위', '오른쪽 위', '왼쪽 가운데', '한가운데', '오른쪽 가운데', '왼쪽 아래', '가운데 아래', '오른쪽 아래'];
function patAdd(path, n) {
  // 실제 휴대폰처럼 지나친 가운데 점은 저절로 이어지고, 한 번 이은 점은 다시 못 잇는다
  if (path.includes(n)) return;
  const last = path[path.length - 1];
  if (last) {
    const a = PDOT(last), b = PDOT(n), mid = (a.x + b.x) / 2 === Math.round((a.x + b.x) / 2) ? [1, 2, 3, 4, 5, 6, 7, 8, 9].find((k) => { const m = PDOT(k); return m.x === (a.x + b.x) / 2 && m.y === (a.y + b.y) / 2; }) : null;
    if (mid && !path.includes(mid)) path.push(mid);
  }
  path.push(n);
}

// 민서의 편지 글 (사진 위 손글씨 + 휴대폰에서 크게 옮겨 적은 것)
const LETTER_1 = `<p>왔네</p><p>여기까지 왔으면 반은 온 거야 열쇠는 우리 집 대문 열쇠고, 지도는 내가 그렸는데 좀 못 그렸어</p><p>역을 등지고 서 그 상태에서 <b>왼쪽</b>으로 가<br><b>두 번째 골목</b>에서 <b>오른쪽</b>으로 꺾어<br>다리를 건너 건너자마자 <b>왼쪽</b><br>그 길에 집이 <b>네 채</b> 우리 집 마당엔 <b>감나무</b>가 있어 지도에도 그렸어</p><p>대문 색은 지도에 안 그렸어 쪽지 세 장 중에 <b>하나만 거짓말</b>이야 우리 통학열차에서 하던 거</p><p class="sign">— 민서</p>`;
const LETTER_2 = `<p>할머니가 겨울에 넘어지셨어 아무한테도 말 안 하고 혼자 석 달을 누워 계셨대 그 얘기를 듣고 그날 사표 냈어</p><p>전화를 끈 건 도망친 거야 네 목소리 들으면 다 무너질 것 같았어 그건 내가 잘못한 거고 핑계 없어</p><p>이 길은 한참 뒤에, 좀 괜찮아지고 나서 만들었어 사과를 말로 하기엔 너무 늦은 것 같아서 통학열차에서 하던 쪽지 놀이로 한 번만 불러 보고 싶었어 안 왔어도 원망 안 했을 거야 진짜로</p><p>수박 잘라 놨어</p>`;
const postcardImg = `<figure class="postcard-photo"><img src="assets/v2/station/postcard.webp" srcset="assets/v2/station/postcard-960.webp 960w, assets/v2/station/postcard.webp 1024w" sizes="(max-width: 640px) 100vw, 640px" alt="엽서 사진: 작은 역사, 벤치에 앉은 민서, 하늘의 새, 양쪽 가로등" decoding="async"><figcaption>수림역 네가 내릴 역 — 민서</figcaption></figure>`;

const LANE_END = { L: { x: 0, y: 30 }, R: { x: 78, y: 30 }, GL: { x: 56, y: 58 }, X: { x: 2, y: 76 }, FL: { x: 88, y: 50 } };
// 볼펜으로 종이봉투 조각에 그린 손지도 길·집 좌표는 WALK/LANES 판정과 같아야 합니다
const INK = '#2f3a7a';
function svgMap(path = [], picked = null, lane = null) {
  const n = MAP.nodes;
  const pen = (d, w = 0.9, extra = '') => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${(w * 1.6).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const road = (a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len * 1.6, ny = dx / len * 1.6;
    return pen(`M${a.x + nx} ${a.y + ny} L${b.x + nx} ${b.y + ny}`, 0.7) + pen(`M${a.x - nx} ${a.y - ny} L${b.x - nx} ${b.y - ny}`, 0.7);
  };
  const roads = [
    road({ x: -2, y: 76 }, { x: 98, y: 76 }),
    road(n.B, n.G), road(n.C, n.D), road(n.D, n.E), road({ x: -2, y: 30 }, { x: 78, y: 30 }),
    road(n.F, n.FE), road(n.FE, { x: 88, y: 48 }),
  ].join('');
  // 개울: 겹친 물결 두 줄 + 다리 널빤지
  const stream = pen('M-2 41 C 15 36, 30 47, 50 41 S 85 35, 102 41', 0.8, 'stroke="#4a6fa5"') + pen('M-2 44 C 15 39, 30 50, 50 44 S 85 38, 102 44', 0.6, 'stroke="#4a6fa5" stroke-dasharray="3 1.5"')
    + pen('M38 37.5 L46 37.5 M38 39.5 L46 39.5 M38 41.5 L46 41.5 M38 43.5 L46 43.5 M38 45.5 L46 45.5', 0.6) + pen('M37.5 36.5 L37.5 46.5 M46.5 36.5 L46.5 46.5', 0.8);
  // 집: 지붕 선 + 벽 + 창 하나, 집마다 조금씩 다르게
  const house = (h, i) => {
    const w = 6 + (i % 2), hh = 4 + (i % 2), r = 2.5 + (i % 2);
    const x = h.x - w / 2, y = h.y - hh / 2;
    const roof = i % 2 ? `M${x - 0.8} ${y} L${h.x} ${y - r} L${x + w + 0.8} ${y}` : `M${x - 0.8} ${y} L${x + w * 0.35} ${y - r} L${x + w + 0.8} ${y}`;
    const hatch = Array.from({ length: 3 }, (_, k) => `M${x + 1 + k * (w / 3)} ${y + 0.6} l${w / 4} ${hh - 1.2}`).join(' ');
    const sel = picked === h.id ? `<circle cx="${h.x}" cy="${h.y}" r="${w * 0.8}" fill="none" stroke="#d9872b" stroke-width="1.2" stroke-dasharray="2 1"/>` : '';
    // 집이 늘어선 길에 들어서면 들어선 쪽에서 가까운 집부터 연필로 번호를 적는다
    const k = lane ? LANES[lane].houses.indexOf(h.id) : -1;
    const num = k >= 0 ? `<g class="map-num"><circle cx="${h.x}" cy="${h.y + hh / 2 + 4.2}" r="3" fill="#fbf3dc" stroke="#d9872b" stroke-width=".7"/><text x="${h.x}" y="${h.y + hh / 2 + 5.6}" font-size="4.2" text-anchor="middle" fill="#a85a12" font-family="sans-serif" font-weight="700">${k + 1}</text></g>` : '';
    return `<g class="map-house${picked === h.id ? ' picked' : ''}">${num}${sel}${pen(`M${x} ${y} h${w} v${hh} h${-w} z`, 0.7)}${pen(roof, 0.8)}${pen(hatch, 0.35)}${pen(`M${x + w - 2.2} ${y + 1} h1.4 v1.2 h-1.4 z`, 0.4)}</g>`;
  };
  const houses = MAP.houses.map(house).join('');
  // 논 빗금, 나무 낙서
  const field = (x, y, w, h) => pen(Array.from({ length: Math.floor(h / 1.6) }, (_, k) => `M${x} ${y + k * 1.6} h${w}`).join(' '), 0.3, 'opacity=".7"');
  const tree = (x, y, r = 2.2) => pen(`M${x} ${y + r} v${-r * 0.9} M${x - r} ${y - r * 0.2} c${r * 0.3} ${-r * 1.4}, ${r * 1.7} ${-r * 1.4}, ${r * 2} 0 c${r * 0.4} ${r}, ${-r * 2.4} ${r}, ${-r * 2} 0 z`, 0.5);
  // 감나무: 집 바로 뒤(북쪽)에 동그란 나무 + 감 몇 알
  const kaki = (hid) => { const h = MAP.houses.find((x) => x.id === hid); const x = h.x, y = 10.5; return pen(`M${x} ${y + 4} v-3`, 0.7) + pen(`M${x - 3.4} ${y} c0 -4, 6.8 -4, 6.8 0 c0 3, -6.8 3, -6.8 0 z`, 0.7) + [[-1.4, -0.6], [1.2, -1.2], [0.2, 0.9]].map(([a, b]) => `<circle cx="${x + a}" cy="${y + b}" r="0.7" fill="none" stroke="${INK}" stroke-width=".7"/>`).join(''); };
  const scenery = field(60, 84, 34, 10) + field(4, 84, 28, 10) + field(52, 3, 26, 7)
    + tree(4, 56) + tree(10, 58, 1.8) + tree(96, 30, 2.4) + tree(30, 62, 1.6) + tree(72, 62, 2)
    + MAP.persimmon.map(kaki).join('');
  // 걸어온 길(형광펜)
  const walked = path.map(([a, b]) => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#f2c14e" stroke-opacity=".75" stroke-width="3.2" stroke-linecap="round"/>`).join('');
  // 글씨 (모바일에서도 읽히게 큼직하게)
  const label = (x, y, t, size = 4, anchor = 'start', rot = 0) => `<text x="${x}" y="${y}" font-size="${size * 1.3}" style="font-size:calc(${(size * 1.3).toFixed(2)}px * var(--mapk, 1))" font-family="MihaejeHand, MihaejeSerif, serif" fill="${INK}" text-anchor="${anchor}" transform="rotate(${rot} ${x} ${y})">${t}</text>`;
  const notes = label(70, 98.5, '수림역', 5, 'middle') + label(2, 51, '개울', 4.4) + label(48, 48, '다리', 4.2, 'start', -4)
    + label(77, 93, '논', 4.6) + label(14, 93, '논', 4.6) + label(80, 9.5, '논', 4.4)
    + MAP.persimmon.map((hid) => { const h = MAP.houses.find((x) => x.id === hid); return label(h.x + 4, 12, '감', 4.4); }).join('')
    + label(47, 35.6, '여기 개 있음 조심', 3.8) + label(97, 45, '언덕', 4.4, 'end');
  // 나침반 낙서
  const compass = pen('M93 3 v8 M93 3 l-2 3 M93 3 l2 3', 0.8) + label(95.5, 8, 'N', 3.8);
  return `<svg viewBox="0 0 100 100" class="village-map" role="img" aria-label="민서의 손지도">
   <defs>
    <filter id="pen" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0.6" xChannelSelector="R" yChannelSelector="G"/></filter>
   </defs>
   <g filter="url(#pen)">${scenery}${roads}${stream}${houses}${pen('M64 81 h12 v8 h-12 z', 0.9)}${pen('M64 81 l6 -3 l6 3', 0.9)}${compass}${notes}</g>
   ${walked}
  </svg>`;
}

export default {
  id: 'station',
  number: '004',
  title: '세 번째 승강장',
  subtitle: '없는 승강장에서 온 사진',
  genre: '실종 미스터리 · 길 찾기',
  minutes: 40,
  difficulty: 3,
  mood: 'horror',
  cover: 'assets/v2/station/cover.webp',
  coverAlt: '비에 젖은 새벽 승강장 벤치 옆에 기대 둔 낡은 3번 승강장 표지',
  music: 'assets/music/station-v33.mp3',
  tagline: '새벽 1시 14분, 사진 한 장\n중앙역에 3번 승강장은 없다',
  blurb: '회사를 그만두고 방을 뺀 친구가 보낸 마지막 사진은\n지금은 없는 승강장이었습니다 전화는 그 뒤로 꺼져 있습니다',
  storageKey: 'mihaeje-v2-station',
  tracesLabel: '민서가 남긴 것',

  opening: {
    eyebrow: '2026/8/14 새벽 1시 14분',
    image: 'assets/v2/station/cover.webp',
    paragraphs: [
      '민서가 사진 한 장을 보냈다. 비에 젖은 승강장 벤치 옆에 낡은 법랑 표지판이 기대 서 있었고, 거기 「3번 승강장」이라고 적혀 있었다. 사진 밑에 말풍선이 둘.',
      '「여기서 시작.」 「찾아와.」',
      '바로 전화를 걸었지만 꺼져 있었다. 열한 번을 걸었고, 열한 번 다 같은 안내 음성이 나왔다.',
      '사진을 몇 번이고 다시 봤다. 벽시계, 젖은 바닥, 아무도 없는 벤치. 찍은 사람은 사진 어디에도 없었다.',
      '민서는 두 달 전에 회사를 그만뒀고, 방을 뺐다는 말은 지난주에야 들었다. 어디로 가는지는 묻지 못했다. 묻기 전에 먼저 말해 줄 거라고 생각했다.',
      '중앙역에 3번 승강장은 없다. 1번과 2번뿐이라는 걸 알면서도, 나는 첫 버스를 타고 중앙역으로 갔다.',
    ],
    cta: '중앙역 대합실로',
  },

  traces: [
    { device: 'grille', label: '구멍 뚫린 구간권' },
    { device: 'mirror', label: '네컷사진' },
    { device: 'locker', label: '파란 리본 열쇠' },
    { device: 'phone', label: '민서의 휴대폰' },
    { device: 'notes', label: '거짓말 쪽지' },
    { device: 'walk', label: '파란 대문' },
  ],

  scenes: [
    {
      id: 'hall',
      name: '중앙역 대합실',
      image: 'assets/v2/station/hall.webp',
      arrive: '여섯 시 반 대합실 아무도 손대지 않았는데 열차 안내판 글자판이 덜컥덜컥 넘어가다 멈췄다 벽에 기대 둔 흰 표지판은 사진 속 그것이었다 매표창구에는 불이 켜져 있다',
      hotspots: [
        { id: 'sign', x: 37, y: 66, label: '벽에 기댄 옛 표지판', kind: 'doc', doc: 'sign' },
        { id: 'clerk', x: 67, y: 42, label: '매표창구의 역무원', kind: 'doc', doc: 'clerk' },
        { id: 'notice', x: 13, y: 34, label: '승강장 개편 안내', kind: 'doc', doc: 'notice' },
        { id: 'board', x: 42, y: 24, label: '열차 안내판', kind: 'device', device: 'grille' },
        { id: 'tophone', x: 63, y: 66, label: '옆자리에 내려놓은 휴대폰', kind: 'doc', doc: 'message' },
      ],
    },
    {
      id: 'platform',
      name: '2번 승강장 · 둘째 기둥',
      image: 'assets/v2/station/platform.webp',
      unlockedBy: 'grille',
      arrive: '안개가 선로 위에 낮게 깔려 있었다 머리 위 스피커가 지직거리더니 옛날 녹음 같은 목소리가 한 줄 새어 나왔다 「3번 승강장에 열차가…」 그리고 끊겼다 기둥에 네컷사진이 붙어 있다',
      hotspots: [
        { id: 'strip', x: 19, y: 28, label: '기둥에 붙은 네컷사진', kind: 'doc', doc: 'strip' },
        { id: 'table', x: 17, y: 62, label: '기둥의 출발 시각표', kind: 'doc', doc: 'timetable' },
        { id: 'mirror', x: 62, y: 41, label: '승강장 끝의 볼록거울', kind: 'device', device: 'mirror' },
        { id: 'brief', x: 39, y: 61, label: '벤치 — 민서와 나', kind: 'doc', doc: 'brief' },
      ],
    },
    {
      id: 'surim',
      name: '수림역 · 보관함',
      image: 'assets/v2/station/surim.webp',
      unlockedBy: 'mirror',
      arrive: (S) => S.solved.includes('locker') ? '5번 칸 문이 열린 채다 편지 뭉치는 꺼냈고, 칸 안쪽에 꺼진 휴대폰이 아직 엎어져 있다' : '수림역엔 역무원이 없었다 문 옆에 열두 칸짜리 보관함이 있고, 위에서 둘째 줄 가운데 칸에 노란 별 스티커가 붙어 있다 민서는 뭐든 별을 붙이는 애였다',
      hotspots: [
        { id: 'postcard', x: 87, y: 23, label: '게시판의 그림엽서', kind: 'doc', doc: 'postcard' },
        { id: 'lockerrule', x: 35.4, y: 23.7, label: '벽에 붙은 보관함 안내문', kind: 'doc', doc: 'lockerrule' },
        { id: 'locker', x: 55.2, y: 38, label: '별 스티커가 붙은 보관함', kind: 'device', device: 'locker', visible: (S) => !S.solved.includes('locker') },
        { id: 'phone', x: 55.2, y: 38, label: '5번 칸 속 민서의 휴대폰', kind: 'device', device: 'phone', visible: (S) => S.solved.includes('locker') },
      ],
    },
    {
      id: 'village',
      name: '수림 마을길',
      image: 'assets/v2/station/village.webp',
      unlockedBy: 'phone',
      arrive: '역 앞에 나와 편지와 손지도와 쪽지 세 장을 길바닥에 펴 놓고 돌멩이로 눌렀다 어디선가 개가 짖었다 길 저 앞 대문도 파란색이다 이 동네엔 파란 대문이 흔한 모양이다',
      hotspots: [
        { id: 'letter', x: 39.6, y: 73.4, r: 8.5, label: '민서의 편지', kind: 'doc', doc: 'letter' },
        { id: 'handmap', x: 48.9, y: 71.2, r: 8.5, label: '손지도', kind: 'doc', doc: 'handmap' },
        { id: 'notes', x: 57.9, y: 72.1, r: 8.5, label: '쪽지 세 장', kind: 'device', device: 'notes' },
        { id: 'walk', x: 55, y: 47, label: '마을로 걸어가기', kind: 'device', device: 'walk', visible: (S) => S.solved.includes('notes') },
      ],
    },
  ],

  docs: {
    message: {
      title: '민서의 마지막 메시지',
      kind: '휴대폰 · 01:14',
      html: `<figure class="prop phonephoto"><img src="assets/v2/station/props/phone.webp" srcset="assets/v2/station/props/phone-960.webp 960w, assets/v2/station/props/phone.webp 1024w" sizes="(max-width: 640px) 100vw, 360px" alt="대합실 파란 의자 위에 놓인 휴대폰, 화면에 민서와의 대화가 켜져 있음" decoding="async"></figure><p class="aside">의자에 앉아 대화창을 다시 열었다<br>내가 보낸 말 옆엔 아직 1이 그대로다</p><div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>민서</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 8월 14일 금요일</div>
<div class="chat-row them"><span class="chat-avatar">★</span><div class="chat-col"><span class="chat-name">민서</span><div class="chat-bubble photo"><img src="assets/v2/station/cover-960.webp" alt="비에 젖은 승강장 벤치 옆, 낡은 3번 승강장 표지판 사진" decoding="async"></div><div class="chat-bubble">여기서 시작</div><div class="chat-bubble">찾아와</div></div><span class="chat-time">오전 1:14</span></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 1:15</span><div class="chat-bubble">뭐야 이 시간에</div></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 1:15</span><div class="chat-bubble">민서야 어디야</div></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 1:22</span><div class="chat-bubble">전화 좀 받아</div></div>
<div class="chat-sys">음성통화 연결 안 됨 · 전원이 꺼져 있습니다</div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 1:40</span><div class="chat-bubble">장난이면 지금 말해</div></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 3:02</span><div class="chat-bubble">제발</div></div>
<div class="chat-sys">음성통화 연결 안 됨 · 전원이 꺼져 있습니다</div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오전 6:02</span><div class="chat-bubble">첫 버스 탄다 역으로 갈게</div></div>
<div class="chat-input"><span>+</span><span class="chat-field">메시지 입력</span><span>#</span></div></div>`,
    },
    sign: {
      title: '벽에 기댄 옛 표지판',
      kind: '법랑 · 모서리가 깨짐',
      html: `<p>흰 바탕에 검은 글씨로 <b>3번 승강장</b> 법랑이 군데군데 떨어져 녹이 올라와 있고, 바닥 쪽 모서리엔 아직 빗물이 남아 있다</p><p>뒷면에 테이프로 구간권 한 장이 붙어 있었다 떼어서 창구 턱에 올려놓고 봤다 네모난 구멍이 여섯 개, 여백에 민서 글씨가 있다</p><figure class="prop ticket"><img src="assets/v2/station/props/ticket.webp" alt="창구 턱에 올려놓은 구멍 뚫린 구간권" decoding="async"><div class="ticket-holes">${HOLES.map(([r, c]) => `<i style="--r:${r};--c:${c}"></i>`).join('')}</div><span class="ticket-print">미루선 구간권<br>800원</span><span class="ticket-hand">안내판에 대 봐</span></figure><p class="aside">구멍 한 칸은 대합실 열차 안내판 글자판 한 칸과 크기가 같다 어느 방향으로 대라는 말은 없다</p>`,
    },
    clerk: {
      title: '매표창구의 역무원',
      kind: '박종길 · 야간 근무',
      html: `<p>창구 안의 남자는 커피를 반쯤 남긴 채 신문을 접었다</p><blockquote>“저거요? 개편 때 떼어서 창고에 넣어 둔 거예요 근데 새벽 순찰 돌 때 보니 밖에, 승강장 벤치 옆에 나와 있더라고요 여자분 하나가 그 앞에 한참 서 있었고요”</blockquote><blockquote>“창고 열쇠는 나만 있는데 말이에요 무거워서 안으로 들여놨어요 앞에 표 한 장을 붙여 놨길래 떼려다가 뒤로 옮겨 붙여 뒀습니다 ‘사람이 올 거예요’ 하길래”</blockquote><blockquote>“그 여자분 새벽 네 시 반 첫 열차로 북쪽 갔어요 표는 편도로 끊었고요 승강장 기둥에도 뭘 붙이고 갔을 거예요 테이프 뜯는 소리가 났으니까 번호는 저기 안내문 보시고요”</blockquote>`,
    },
    notice: {
      title: '승강장 개편 안내',
      kind: '게시물 · 2025년 3월',
      html: `<figure class="prop noticephoto"><img src="assets/v2/station/props/notice.webp" alt="승강장 번호 변경 안내: 옛 3번은 현재 2번(북행), 옛 2번은 현재 1번(남행), 옛 1번은 폐쇄" decoding="async"></figure><p class="aside">옛 3번은 지금 2번(북행), 옛 2번은 지금 1번(남행), 옛 1번은 없어졌다 대합실 안내판은 글자판을 한 칸씩 끼우는 옛날식이라 바꾸는 동안 안내가 뒤섞일 수 있다고 적혀 있다</p>`,
    },
    brief: {
      title: '민서와 나',
      kind: '내 기억',
      html: `<p>스무 살 때 매일 아침 같은 통학열차 둘째 칸을 탔는데, 어느 날 내 자리에 모르는 애가 앉아 있었다 비켜 달라고 했더니 “자리에 이름 적혀 있어?” 하고 되물었고, 그게 민서였다</p><p>민서는 노트든 휴대폰이든 내 가방이든 뭐든 별 스티커를 붙였고, 중학교 때부터 쪽지를 거울 글씨로 쓰는 버릇이 있었다 선생님이 못 읽게 하려고 시작한 거라고 했다 휴대폰은 숫자 하나를 그려서 여는 잠금이었는데, 무슨 숫자냐고 물으면 “우리 처음 만난 데” 하고 웃기만 했다 통학열차에서는 쪽지 세 장 중 하나만 거짓말인 놀이를 자주 했다 늘 민서가 냈고 늘 민서가 먼저 웃었다</p><p>수림 산골에 혼자 사신다는 외할머니 얘기를 자주 했다 여름마다 갔는데 작년부터는 못 갔다고 했다</p><p>회사를 그만둔 뒤로 연락이 뜸해졌지만 괜찮냐고 묻지 않았다 묻지 않는 게 배려라고 생각했다</p>`,
    },
    strip: {
      title: '기둥에 붙은 네컷사진',
      kind: '앞면 · 뒷면',
      html: `<figure class="prop stripphoto"><img src="assets/v2/station/props/strip.webp" alt="기둥에 붙은 네컷사진, 셋째 칸이 오려져 없음" decoding="async"></figure><p class="aside">4년 전 역 앞 사진 부스에서 같이 찍은 것이다 그런데 셋째 칸이 칼로 반듯하게 오려져 없다 둘 다 눈을 감고 웃던 컷이었다 그 자리엔 테이프 자국만 남았다</p><p>뒷면에 민서 글씨가 있는데 글자가 전부 뒤집혀 있고, 사진이 빗물을 먹어 잉크가 번졌다</p><figure class="prop stripback"><p class="mirror-text smudged">${STRIP_BACK.replace(/ /g, '')}</p></figure><p class="aside">승강장 끝에 볼록거울이 있다</p>`,
    },
    timetable: {
      title: '기둥의 출발 시각표',
      kind: '2번 승강장 · 북행',
      html: `<figure class="prop laminated"><img src="assets/v2/station/props/timetable.webp" alt="기둥에 핀으로 꽂힌 시각표" decoding="async"><div class="laminated-sheet"><p class="sheet-title">2번 승강장 출발 시각 (북행 · 09시 이후)</p><table><thead><tr><th>출발</th><th>행선</th><th>정차</th><th>종별</th></tr></thead><tbody>${TRAINS_2.map((t) => `<tr><td>${t.time}</td><td>${t.to}행</td><td>${t.stops}</td><td>${t.kind}</td></tr>`).join('')}</tbody></table><p class="sheet-title dim">맞은편 1번 승강장 (남행)</p><table class="dim"><thead><tr><th>출발</th><th>행선</th><th>정차</th><th>종별</th></tr></thead><tbody>${TRAINS_1.map((t) => `<tr><td>${t.time}</td><td>${t.to}행</td><td>${t.stops}</td><td>${t.kind}</td></tr>`).join('')}</tbody></table><p class="sheet-foot">미루선 · 중앙역 역무관리소</p></div></figure><div class="paper-table mobile-only"><p class="pt-head">같은 시각표 글자로 옮겨 적은 것</p><table class="nwcells"><tr><th>출발</th><th>행선</th><th>정차</th><th>종별</th></tr>${TRAINS_2.map((t) => `<tr><td>${t.time}</td><td>${t.to}행</td><td>${t.stops}</td><td>${t.kind}</td></tr>`).join('')}</table><p class="pt-foot">맞은편 1번 승강장 (남행) ${TRAINS_1.map((t) => `${t.time} ${t.to}행 ${t.stops}`).join(' · ')}</p></div>`,
    },
    postcard: {
      title: '게시판의 그림엽서',
      kind: '민서가 찍힌 사진 엽서',
      html: `${postcardImg}<p class="aside">뒷면에 적힌 글</p><blockquote class="hand">다이얼 넷은 이 그림 안에 있어<br>새 · 창 · 등 · 의자를 세어 봐<br>하늘에 가까운 것부터 차례로<br>유리에 비친 건 세지 마 진짜가 아니니까<br>문에 달린 유리도 창 아니야<br>벤치에 앉은 사람도 세지 마 그건 나야</blockquote>`,
    },
    lockerrule: {
      title: '보관함 이용 안내',
      kind: '수림역 · 보관함 옆 벽',
      html: `<div class="sticker"><b>보관함 이용 안내</b><ol><li>숫자 네 자리를 맞추고 손잡이를 당기세요</li><li>세 번 틀리면 30초 동안 잠깁니다</li><li>물건은 7일까지 보관됩니다</li></ol><small>칸 번호는 왼쪽 위 칸부터 가로로 셉니다 · 수림역 무인역 관리 041-000-0000</small></div><p class="aside">별 스티커가 붙은 칸은 5번 맡긴 날짜 칸에 볼펜으로 2026/8/14 05:50</p>`,
    },
    letter: {
      title: '민서의 편지',
      kind: '보관함 안 · 봉투 없이',
      html: `<figure class="prop letterphoto"><img src="assets/v2/station/props/letter.webp" alt="보관함에서 나온 편지" decoding="async"><div class="letter-hand">${LETTER_1}</div></figure><div class="letter-plain mobile-only" aria-hidden="true">${LETTER_1}</div>`,
    },
    handmap: {
      title: '접힌 손지도',
      kind: '종이봉투 조각에 볼펜',
      html: `<figure class="prop kraft"><img src="assets/v2/station/props/kraft.webp" alt="종이봉투를 찢어 그린 손지도" decoding="async"><div class="kraft-map">${svgMap()}</div></figure><p class="aside">위가 북쪽이고 역은 지도 아래쪽에 있다 집은 전부 비슷하게 그렸고 대문 색은 없다 동그란 나무에 감 세 알씩 그린 게 두 그루 있다</p>`,
    },
    final: {
      title: '민서의 편지 · 마지막 장',
      kind: '편지의 접힌 뒷장 · 마당에서 읽음',
      locked: true,
      html: `<figure class="prop letterphoto back"><img src="assets/v2/station/props/letter.webp" alt="편지의 접힌 뒷장" decoding="async"><div class="letter-hand">${LETTER_2}</div></figure><div class="letter-plain mobile-only" aria-hidden="true">${LETTER_2}</div>`,
    },
  },

  devices: {
    grille: {
      title: '열차 안내판',
      scene: 'hall',
      intro: '글자판 7×7 위에 구간권을 겹친다 ← → ↑ ↓는 구간권을 한 칸씩 옮기고 ↻는 90도 돌린다 구멍 사이로 보이는 글자를 읽고, 읽은 곳을 아래에서 골라 간다',
      docs: ['sign', 'notice', 'clerk'],
      hintCode: 'T-S01',
      hints: [
        '구간권을 안내판에 겹쳐 놓고 구멍 여섯 개로 보이는 글자를 위 줄부터 읽습니다 자리만 옮기지 말고 방향도 바꿔 보세요',
        '구멍 글자가 말이 되는 곳을 찾았으면, 민서가 쓴 승강장 번호가 지금도 같은 번호인지 대합실 안의 다른 게시물과 맞춰 보세요',
        '시계 방향으로 한 번 돌리고 오른쪽 1칸, 아래 1칸 → 「3번 둘째 기둥」 옛 3번은 지금 2번 → 2번 승강장 둘째 기둥',
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
        // 구간권 인쇄 글씨가 함께 돌아서 지금 방향을 알 수 있게
        const tf = el('div', 'tframe'); tf.append(el('span', 'tprint', '미루선 구간권')); ticket.append(tf);
        board.append(ticket);
        // 처음 열 때 한 번, 글자판이 저절로 넘어가며 「3번 승강장」을 띄웠다가 흩어진다 행선지 칸은 빈 판만 돈다
        if (!d.flashed) {
          const fl = el('div', 'grille-flash'); fl.setAttribute('aria-hidden', 'true');
          const dest = el('b', 'blank'); dest.innerHTML = '<i></i><i></i>행';
          fl.append(el('b', '', '3번 승강장'), dest);
          board.append(fl);
          d.flashed = true;
        }
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
        const pick = el('div', 'pick-grid');
        pick.append(el('p', 'pick-label', '갈 곳 · 지금 이 역의 승강장은 둘'));
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
        if (!d.platform || !d.pillar) return { ok: false, msg: '승강장과 기둥을 하나씩 골라야 한다' };
        if (readHoles(d) !== GRILLE_READ) return { ok: false, msg: '구멍 사이 글자가 지금은 말이 안 된다 어디로 가라는 건지 구간권부터 다시 대 본다' };
        if (d.platform === 2 && d.pillar === 2) return { ok: true };
        return { ok: false, msg: '그 기둥엔 아무것도 붙어 있지 않았다 개찰구로 다시 나와 구간권을 안내판에 대 본다' };
      },
      reveal: {
        title: '2번 승강장, 둘째 기둥',
        text: '민서는 끝까지 옛 번호로 썼다 옛 3번이 지금 2번이다 역무원이 개찰구를 열어 주며 말했다 “북쪽 가는 쪽이요 기둥은 개찰구 쪽부터 세요”',
        scene: [
          '구간권을 주머니에 넣다가, 민서가 새벽 한 시에 혼자 이 구멍 여섯 개를 칼로 하나씩 오리고 있었을 모습이 떠올랐다',
          '개찰구를 지나는데 역무원이 덧붙였다 “그 여자분 가방이 컸어요 멀리 가는 사람 가방” 나는 못 들은 척했다',
        ],
        unlock: 'platform',
      },
    },

    mirror: {
      title: '승강장 끝의 볼록거울',
      scene: 'platform',
      intro: '기관사가 승강장 전체를 보라고 기둥에 비스듬히 달아 둔 거울이다 버튼으로 네컷사진 뒷면을 거울 앞에 들고, 막대로 사진 기울기를 바꾼다 아래 출발 안내에서 탈 열차를 고른다',
      docs: ['strip', 'brief', 'timetable'],
      hintCode: 'T-S02',
      hints: [
        '네컷사진 뒷면은 거울 글씨라 그냥은 안 읽힙니다 거울 앞에 들고, 사진을 거울이 달린 기울기와 똑같이 맞추면 비친 글씨가 바로 섭니다 거울이 몇 칸 기울어 있는지는 거울 받침대에 남아 있습니다',
        '비친 문장에서 시각을 읽고, 할머니 동네가 어디인지는 「민서와 나」에서 찾으세요 같은 시각에 떠나는 열차가 여럿이면 종점으로, 같은 종점 열차가 여럿이면 시각으로 좁혀집니다',
        '받침대 빨간 눈금 7에 맞추면 「우리 처음 만난 그 열차 9시 40분 종점에서 내려 할머니 동네야」 → 09:40 수림행 급행 (종점 수림 = 외할머니 동네)',
      ],
      initial: () => ({ held: false, tilt: 0, train: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'mirror');
        const aligned = d.held && tiltOk(d.tilt);
        const glass = el('div', 'mirror-glass' + (d.held ? ' held' : '') + (aligned ? ' aligned' : '')); const mimg = el('img'); mimg.src = 'assets/v2/station/props/mirror.webp'; mimg.alt = '기둥에 비스듬히 달린 볼록거울과 눈금이 새겨진 받침대'; glass.append(mimg);
        // 거울 받침대: 녹슨 반원 눈금 0~10, 한 칸에만 빨간 페인트 (거울이 달린 기울기)
        const ticks = Array.from({ length: 11 }, (_, i) => { const a = -90 + i * 18; const big = i % 5 === 0; return `<g transform="rotate(${a} 50 50)"><line x1="50" y1="${big ? 12 : 15}" x2="50" y2="21" stroke="#e9e4d6" stroke-width="${big ? 2.2 : 1.4}"/></g>`; }).join('');
        const nums = [0, 5, 10].map((i) => { const a = (-90 + i * 18) * Math.PI / 180; return `<text x="${(50 + Math.sin(a) * 20).toFixed(1)}" y="${(50 - Math.cos(a) * 20 + (i === 5 ? 3 : -2)).toFixed(1)}" font-size="9" text-anchor="middle" fill="#e9e4d6" font-family="sans-serif" font-weight="700">${i}</text>`; }).join('');
        const ma = (-90 + MIRROR_MARK * 18) * Math.PI / 180;
        const paint = `<circle cx="${(50 + Math.sin(ma) * 33).toFixed(1)}" cy="${(50 - Math.cos(ma) * 33).toFixed(1)}" r="5" fill="#c2382a" opacity=".9"/>`;
        const gauge = el('div', 'mirror-gauge'); gauge.setAttribute('aria-hidden', 'true');
        gauge.innerHTML = `<svg viewBox="0 0 100 56"><path d="M8 50 A42 42 0 0 1 92 50 Z" fill="#3b3f43" stroke="#1c1f22" stroke-width="2"/>${paint}${ticks}${nums}<line x1="50" y1="50" x2="${(50 + Math.sin(ma) * 25).toFixed(1)}" y2="${(50 - Math.cos(ma) * 25).toFixed(1)}" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="50" r="4" fill="#1a1a1a"/></svg><span>거울 받침대 눈금 · 가까이 본 것</span>`;
        const paper = el('p', 'mirror-paper', STRIP_BACK);
        const setTilt = (t) => { const off = t - MIRROR_MARK * 10; paper.style.setProperty('--tilt', String(Math.max(-60, Math.min(60, off)))); paper.style.setProperty('--blur', (Math.min(Math.abs(off), 40) * 0.22).toFixed(2) + 'px'); };
        setTilt(d.tilt || 0);
        if (d.held) glass.append(paper);
        wrap.append(glass);
        const gw = el('div', 'mirror-gauge-row'); gw.append(gauge, el('p', 'mirror-cap', '거울 기둥 받침대에 눈금이 새겨져 있다 녹이 슬어 거울이 달린 그 기울기에서 꼼짝도 하지 않는다'));
        wrap.append(gw);
        const b = el('button', 'ctl wide', d.held ? '사진 내리기' : '네컷사진 뒷면을 거울 앞에 들기'); b.type = 'button'; b.onclick = () => { d.held = !d.held; if (d.held && d.tilt == null) d.tilt = 0; save(); };
        wrap.append(b);
        if (d.held) {
          const tickNow = (t) => Math.round(t / 10);
          const lab = el('label', 'mirror-tilt'); lab.append(el('span', '', `사진 기울기 ${tickNow(d.tilt || 0)} · ${aligned ? '거울과 나란하다' : '사진이 거울에 비스듬히 비친다'}`));
          const r = el('input'); r.type = 'range'; r.min = '0'; r.max = '100'; r.step = '1'; r.value = String(d.tilt || 0); r.setAttribute('aria-label', '사진 기울이기');
          r.oninput = () => { d.tilt = Number(r.value); setTilt(d.tilt); const ok = tiltOk(d.tilt); glass.classList.toggle('aligned', ok); lab.firstChild.textContent = `사진 기울기 ${tickNow(d.tilt)} · ${ok ? '거울과 나란하다' : '사진이 거울에 비스듬히 비친다'}`; };
          r.onchange = () => { save(); };
          const scale = el('span', 'mirror-scale'); scale.setAttribute('aria-hidden', 'true'); scale.innerHTML = Array.from({ length: 11 }, (_, i) => `<i>${i}</i>`).join('');
          lab.append(r, scale); wrap.append(lab);
        }
        const list = el('div', 'train-list');
        list.append(el('p', 'pick-label', '출발 안내 · 09시 이후 · 탈 열차 고르기'));
        TRAINS_ALL.forEach((t) => { const c = el('button', 'train' + (d.train === t.id ? ' on' : '')); c.type = 'button'; c.innerHTML = `<b>${t.time}</b> ${t.to}행 <small>${t.stops} · ${t.kind} · ${t.pf}번 승강장</small>`; c.onclick = () => { d.train = t.id; save(); }; list.append(c); });
        wrap.append(list);
        return wrap;
      },
      commitLabel: '이 열차 타기',
      check(d) {
        if (!d.train) return { ok: false, msg: '열차를 하나 골라야 한다' };
        if (!d.held || !tiltOk(d.tilt)) return { ok: false, msg: '뒷면 글씨를 아직 못 읽었다 거울에 비친 사진이 비뚤다' };
        if (d.train === 'n0940') return { ok: true };
        return { ok: false, msg: '표를 끊으려다 멈췄다 이 열차는 아닌 것 같다' };
      },
      reveal: {
        title: '09:40 수림행 급행',
        text: '09:40까지 세 시간을 벤치에서 기다렸다 둘째 칸에 탔다 자리에 이름은 적혀 있지 않았다',
        scene: [
          '네컷사진을 창틀에 세워 뒀다 오려 낸 셋째 칸 자리로 창밖 풍경이 지나갔다 둘 다 눈을 감고 웃던 컷이었다 나는 그 컷을 제일 싫어했고 민서는 제일 좋아했다',
          '열차는 북문을 서지 않고 지나쳤다 종점까지 둘째 칸엔 나 혼자였다 휴대폰을 세 번 봤다 민서 번호는 여전히 꺼져 있었다',
        ],
        unlock: 'surim',
      },
    },

    locker: {
      title: '별 스티커가 붙은 보관함',
      scene: 'surim',
      intro: '5번 칸 다이얼 네 개 ▲▼로 한 칸씩 돌리고 손잡이를 당긴다 세 번 틀리면 30초 동안 잠긴다',
      docs: ['postcard', 'lockerrule'],
      hintCode: 'T-S03',
      hints: [
        '엽서 그림 안의 새, 창, 등, 의자를 셉니다 뒷면 글이 세지 말라는 것부터 먼저 빼 두세요',
        '세지 말라는 건 셋입니다 유리에 비친 것, 문에 달린 유리, 벤치의 사람 다이얼 순서는 그림에서 높이 있는 것부터입니다',
        '새 3 · 등 2 · 창 4 · 의자 1 → 3241',
      ],
      initial: () => ({ dial: [0, 0, 0, 0], fails: 0, lockedUntil: 0 }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'locker2');
        const ph = el('div', 'locker2-photo'); const limg = el('img'); limg.src = 'assets/v2/station/props/locker.webp'; limg.alt = '5번 칸의 네 자리 다이얼과 노란 별 스티커'; ph.append(limg);
        // 사진 속 다이얼 바퀴 위에 지금 숫자
        [47.0, 54.5, 61.85, 69.2].forEach((x, i) => { const w = el('span', 'wheel', String(d.dial[i])); w.style.left = x + '%'; ph.append(w); });
        wrap.append(ph);
        const row = el('div', 'dials');
        for (let i = 0; i < 4; i++) {
          const col = el('div', 'dial');
          const up = el('button', 'ctl', '▲'); up.type = 'button'; up.setAttribute('aria-label', `${i + 1}번째 다이얼 올리기`); up.onclick = () => { d.dial[i] = (d.dial[i] + 1) % 10; save(); };
          const num = el('b', 'num', String(d.dial[i]));
          const dn = el('button', 'ctl', '▼'); dn.type = 'button'; dn.setAttribute('aria-label', `${i + 1}번째 다이얼 내리기`); dn.onclick = () => { d.dial[i] = (d.dial[i] + 9) % 10; save(); };
          col.append(up, num, dn);
          row.append(col);
        }
        wrap.append(row);
        const now = Date.now();
        if (d.lockedUntil > now) wrap.append(el('p', 'locker-note', `잠겨 있다 · ${Math.ceil((d.lockedUntil - now) / 1000)}초 뒤에 다시`));
        return wrap;
      },
      commitLabel: '손잡이 당기기',
      check(d) {
        const now = Date.now();
        if (d.lockedUntil > now) return { ok: false, msg: `잠겨 있다 ${Math.ceil((d.lockedUntil - now) / 1000)}초 뒤에 다시 당겨 본다` };
        const ans = [3, 2, 4, 1];
        if (d.dial.every((v, i) => v === ans[i])) return { ok: true };
        d.fails = (d.fails || 0) + 1;
        if (d.fails >= 3) { d.fails = 0; d.lockedUntil = now + 30000; return { ok: false, msg: '세 번 틀렸다 30초 동안 잠긴다 그동안 엽서를 다시 센다' }; }
        return { ok: false, msg: '손잡이가 걸린다 엽서를 다시 센다' };
      },
      reveal: {
        title: '3 · 2 · 4 · 1',
        text: '문이 열렸다 열쇠 하나와 풀린 파란 리본, 편지, 쪽지 세 장, 접힌 종이봉투 조각, 그리고 전원이 꺼진 민서의 휴대폰',
        scene: [
          '맨 밑에 사원증이 엎어져 있었다 뒤집어 보니 민서 이름 위에 볼펜으로 줄이 두 번 그어져 있었다',
          '오려 낸 셋째 칸은 없었다 그 자리에 민서 글씨 쪽지만 「셋째 칸은 내가 가져가 네가 오면 돌려줄게」',
          '편지와 열쇠, 쪽지와 봉투 조각은 꺼내 들었다 휴대폰은 칸 안에 엎어 둔 채로 한참 봤다 켜면 내가 건 열한 통이 뜰 텐데, 그걸 내 눈으로 보고 싶지 않았다',
        ],
        unlock: null,
      },
    },

    phone: {
      title: '민서의 휴대폰',
      scene: 'surim',
      intro: '전원을 길게 눌러 켰다 잠금 화면에 점 아홉 개 점을 손가락으로 이어 그리거나, 점을 하나씩 눌러 잇고 풀기를 누른다 휴대폰을 창 쪽으로 기울이면 화면이 빛에 비친다',
      docs: ['brief'],
      hintCode: 'T-S04',
      hints: [
        '휴대폰을 창 쪽으로 기울여 화면에 남은 손가락 자국을 보세요 잠금 패턴은 점과 점을 곧게 잇는 선입니다',
        '점을 벗어나 화면 끝까지 길게 이어진 줄은 화면을 쓸어 넘긴 자국이라 패턴이 아닙니다 남은 선이 무슨 모양인지, 어느 끝에서 그리기 시작했는지는 「민서와 나」의 잠금 얘기와 둥근 자국에서 찾으세요',
        '숫자 3을 위에서부터 → 왼쪽 위 · 가운데 위 · 오른쪽 위 · 한가운데 · 오른쪽 아래 · 가운데 아래 · 왼쪽 아래',
      ],
      initial: () => ({ path: [], tilt: false, fails: 0, lockedUntil: 0 }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'pat');
        const phone = el('div', 'pat-phone' + (d.tilt ? ' tilted' : ''));
        const top = el('div', 'pat-top'); top.innerHTML = '<span>10:46</span><span>8월 14일 금요일</span>';
        const noti = el('p', 'pat-noti', '부재중 전화 11통');
        const now = Date.now();
        const locked = d.lockedUntil > now;
        const say = el('p', 'pat-say', locked ? `${Math.ceil((d.lockedUntil - now) / 1000)}초 후에 다시 시도하세요` : '패턴을 그려 잠금 해제');
        const pad = el('div', 'pat-pad');
        // 창빛에 비친 기름 자국 (기울였을 때만)
        const seg = (a, b) => { const p = PDOT(a), q = PDOT(b); return `M${p.x} ${p.y} L${q.x} ${q.y}`; };
        const smudge = `<g class="pat-smudge" filter="url(#patBlur)"><path d="${[[1, 3], [3, 5], [5, 9], [9, 7]].map(([a, b]) => seg(a, b)).join(' ')}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="50" r="21" fill="#fff" fill-opacity=".3"/><path d="M196 -40 C 212 90, 186 210, 204 345" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="22" stroke-linecap="round"/></g>`;
        const drawn = (p) => p.length ? `<polyline class="pat-line" points="${p.map((n) => `${PDOT(n).x},${PDOT(n).y}`).join(' ')}" fill="none" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>` : '';
        const dots = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<circle class="pat-dot${d.path.includes(n) ? ' on' : ''}" cx="${PDOT(n).x}" cy="${PDOT(n).y}" r="${d.path.includes(n) ? 13 : 8}"/>`).join('');
        const svg = () => `<svg viewBox="0 0 300 300" aria-hidden="true"><defs><filter id="patBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter></defs>${d.tilt ? smudge : ''}${drawn(d.path)}${dots}</svg>`;
        const art = el('div', 'pat-art'); pad.append(art);
        art.innerHTML = svg();
        // 손가락으로 이어 그리기 (끄는 동안은 화면만 고치고, 손을 떼면 바로 풀어 본다)
        let stroke = null;
        const hit = (e) => { const r = pad.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * 300, y = (e.clientY - r.top) / r.height * 300; return [1, 2, 3, 4, 5, 6, 7, 8, 9].find((n) => Math.hypot(PDOT(n).x - x, PDOT(n).y - y) < 38); };
        pad.addEventListener('pointerdown', (e) => { if (locked) return; const n = hit(e); if (!n) return; e.preventDefault(); pad.setPointerCapture?.(e.pointerId); stroke = { moved: false }; patAdd(d.path, n); art.innerHTML = svg(); });
        pad.addEventListener('pointermove', (e) => { if (!stroke) return; const n = hit(e); if (n && !d.path.includes(n)) { patAdd(d.path, n); stroke.moved = true; art.innerHTML = svg(); } });
        const end = () => { if (!stroke) return; const moved = stroke.moved; stroke = null; if (moved && d.path.length > 1) ctx.commit?.(); else save(); };
        pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
        // 점 하나씩 누르기 (키보드·탭) — 사진 위 같은 자리의 큰 누름 칸
        const keys = el('div', 'pat-keys');
        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((n) => { const b = el('button', 'pat-key'); b.type = 'button'; b.setAttribute('aria-label', `점 ${PAT_NAME[n]}`); b.onclick = (e) => { if (e.detail > 0 || locked) return; patAdd(d.path, n); save(); }; keys.append(b); });
        pad.append(keys);
        phone.append(top, noti, say, pad);
        wrap.append(phone);
        const row = el('div', 'pat-row');
        const tilt = el('button', 'ctl wide', d.tilt ? '휴대폰 바로 들기' : '창 쪽으로 기울여 보기'); tilt.type = 'button'; tilt.onclick = () => { d.tilt = !d.tilt; save(); };
        const clear = el('button', 'ctl', '지우기'); clear.type = 'button'; clear.onclick = () => { d.path = []; save(); };
        row.append(tilt, clear);
        wrap.append(row);
        wrap.append(el('p', 'pat-cap', d.tilt ? '창빛에 화면이 번들거린다 손가락 기름 자국이 그대로 남아 있다' : '화면이 까맣게 반짝일 뿐 아무 자국도 안 보인다'));
        return wrap;
      },
      commitLabel: '이대로 풀기',
      canCommit: (d) => d.path.length > 0,
      check(d) {
        const now = Date.now();
        if (d.lockedUntil > now) return { ok: false, msg: `${Math.ceil((d.lockedUntil - now) / 1000)}초 후에 다시 시도하세요` };
        if (d.path.length < 4) { d.path = []; return { ok: false, msg: '점을 4개 이상 연결하세요' }; }
        if (d.path.join() === PATTERN.join()) return { ok: true };
        d.path = [];
        d.fails = (d.fails || 0) + 1;
        if (d.fails >= 5) { d.fails = 0; d.lockedUntil = now + 30000; return { ok: false, msg: '패턴을 5번 잘못 그렸습니다 30초 후에 다시 시도하세요' }; }
        return { ok: false, msg: '잘못된 패턴입니다 화면이 한 번 떨렸다' };
      },
      reveal: {
        title: '잠금 해제',
        text: '그 숫자는 3이었다 화면이 열리자 부재중 전화 열한 통이 한꺼번에 떴다 전부 내 이름이었다',
        scene: [
          '그 밑에 메모장이 열려 있었다 「8/14 05:52 수림 도착 5번 칸 걔 오면 역 앞에서 편지랑 지도랑 쪽지 다 같이 펴 놓고 보라고 하기」 한 줄 띄우고 「무서워하겠지」',
          '휴대폰을 다시 끄고 칸 안에 엎어 두었다 이건 민서가 직접 들고 나와야 하는 거였다 역 앞으로 나갔다',
        ],
        unlock: 'village',
      },
    },

    notes: {
      title: '쪽지 세 장',
      scene: 'village',
      intro: '보관함에서 나온 쪽지 세 장 편지대로면 셋 중 하나만 거짓말이다 쪽지를 누르면 거짓말 표시가 붙는다',
      docs: ['letter'],
      hintCode: 'T-S05',
      hints: [
        '쪽지 하나를 거짓이라고 놓고, 나머지 둘이 정말 둘 다 참일 수 있는지 봅니다 거짓이 둘이 되면 그 가정은 틀린 겁니다',
        '가는 다를 두고 하는 말이고, 다는 나를 두고 하는 말입니다 가가 거짓이면 다는 어떻게 되는지, 다가 거짓이면 가는 어떻게 되는지 따라가 보세요',
        '거짓말은 나 (그러니 대문은 파란색)',
      ],
      initial: () => ({ lie: null }),
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
        return wrap;
      },
      commitLabel: '이게 거짓말이다',
      canCommit: (d) => !!d.lie,
      check(d) {
        if (!d.lie) return { ok: false, msg: '거짓말인 쪽지를 하나 골라야 한다' };
        if (d.lie === '나') return { ok: true };
        return { ok: false, msg: '이렇게 놓으면 쪽지 셋의 앞뒤가 안 맞는다 거짓말은 꼭 하나다' };
      },
      reveal: {
        title: '거짓말은 나',
        text: '가는 다 편이었다 가가 거짓이면 다도 거짓, 다가 거짓이면 가도 거짓이 된다 거짓말이 꼭 하나라면 남는 건 나뿐이다',
        scene: [
          '통학열차에서 이 놀이를 할 때 나는 한 번도 민서보다 먼저 푼 적이 없었다 이번엔 민서가 옆에 없었고, 혼자 풀었다 하나도 기쁘지 않았다',
        ],
        unlock: null,
      },
    },

    walk: {
      title: '마을로 걸어가기',
      scene: 'village',
      intro: '갈림길마다 갈 쪽을 누른다 걸어온 길은 지도에 형광펜으로 남는다 집이 늘어선 길에 닿으면 대문을 하나 골라 열쇠를 넣는다 막히면 역 앞으로 되돌아갈 수 있다',
      docs: ['letter', 'handmap'],
      hintCode: 'T-S06',
      hints: [
        '“역을 등지고”는 역을 뒤에 두고 선다는 뜻입니다 지도는 위가 북쪽이고 역은 아래에 있습니다',
        '편지를 한 줄씩 끊어서 갈림길마다 지금 어느 쪽을 보고 있는지 따져 보세요 집은 지도의 감나무와 쪽지에서 나온 대문 색을 같이 맞춰야 하나로 좁혀집니다',
        '왼쪽 → 직진 → 오른쪽 → 직진(다리) → 왼쪽 → 감나무가 있는 집 중 파란 대문 = 셋째 집',
      ],
      initial: () => ({ at: 'S', heading: 'N', path: [], lane: null, house: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'walk');
        const segs = d.path.map(([a, b]) => [MAP.nodes[a] || LANE_END[a], MAP.nodes[b] || LANE_END[b]]);
        const mapBox = el('div', 'walk-map');
        mapBox.innerHTML = `<img src="assets/v2/station/props/kraft.webp" alt="" decoding="async"><div class="kraft-map">${svgMap(segs, d.house, d.lane)}</div>`; mapBox.classList.add('prop', 'kraft');
        wrap.append(mapBox);
        const here = el('p', 'walk-here');
        const headingName = { N: '북쪽(역을 등진 방향)', S: '남쪽(역 쪽)', E: '동쪽', W: '서쪽' }[d.heading];
        if (d.lane) {
          const lane = LANES[d.lane];
          here.innerHTML = `<b>${lane.name}</b>에 들어섰다 ${lane.sound} 집이 ${['', '한', '두', '세', '네'][lane.houses.length]} 채 늘어서 있다 보는 방향 ${headingName}${lane.houses.length > 1 ? ' 들어선 쪽에서 가까운 집부터 첫째, 둘째로 세어 지도에 연필로 번호를 적었다' : ''}`;
          wrap.append(here);
          const row = el('div', 'gate-row');
          lane.houses.forEach((hid, i) => {
            const col = GATE[hid];
            const b = el('button', 'gate-chip' + (d.house === hid ? ' on' : '')); b.type = 'button';
            b.setAttribute('aria-label', `${['첫', '둘', '셋', '넷'][i]}째 집 ${col} 대문`);
            b.innerHTML = `<i style="--gate:${GATE_CSS[col]}"></i><span>${['첫', '둘', '셋', '넷'][i]}째 집</span><small>${col} 대문</small>`;
            b.onclick = () => { d.house = hid; save(); };
            row.append(b);
          });
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
        if (!d.lane) return { ok: false, msg: '아직 집이 늘어선 길까지 가지 않았다 갈림길에서 방향을 고른다' };
        if (!d.house) return { ok: false, msg: '대문을 하나 골라야 한다' };
        if (d.house === ANSWER_HOUSE) return { ok: true };
        return { ok: false, msg: '열쇠가 안 들어간다 대문 안쪽은 조용했다 편지를 다시 펴 본다' };
      },
      reveal: {
        title: '파란 대문',
        text: '열쇠가 돌아갔다',
        scene: ['대문을 밀기 전에 한참 서 있었다 안에서 아무 소리도 안 나면 어쩌나 싶었다 그때 마당 안쪽에서 웃음소리가 났다 두 사람 몫이었다'],
        unlock: null,
        ending: true,
        endingLabel: '대문 안으로',
      },
    },
  },

  ending: {
    image: 'assets/v2/station/ending.webp',
    imageAlt: '해 질 녘 마당의 평상, 덜 익은 감이 달린 나무 아래 할머니와 민서',
    eyebrow: '수림, 2026/8/14 한낮부터 해 질 녘까지',
    title: '없는 승강장에서 온 초대',
    paragraphs: [
      '대문을 연 건 열한 시쯤이었다 평상 위에 수박이 잘려 있었고 할머니가 먼저 손을 흔들었다 민서는 일어나지 않고 웃기만 했다 일어나면 울어 버릴 것 같은 웃음이었다',
      '“왔네”',
      '“왔지”',
      '“무서웠어”',
      '“알아”',
      '“진짜로 무서웠다고 사원증에 줄 그어 놓고 휴대폰까지 넣어 두고 가면 사람이 무슨 생각을 하겠어”',
      '민서가 수박을 내려놓았다 “미안 그건 내가 잘못했어 네가 밤새 전화 걸 거 알면서 껐어”',
      '“그래서 더 화나”',
      '“응 화내도 돼”',
      '“전화는 왜 보관함에 넣어”',
      '“들고 있으면 받을 것 같아서 네 목소리 들으면 다 무너질 것 같았어”',
      '“말하지 그럼”',
      '“말로 들으면 넌 걱정만 했을 거야 와서 보면 알 것 같았어 할머니도, 여기도”',
      '“근데 왜 3번이야 지금은 2번인데”',
      '“우리 처음 만났을 때 09:40 열차가 서던 데가 3번이었잖아 너는 그것도 기억 못 하지”',
      '기억하고 있었다 말은 안 했다',
      '“표지판은 어떻게 꺼냈어 창고 열쇠는 역무원 아저씨만 있다던데”',
      '“표지판? 나는 사진만 찍었어 내가 갔을 땐 벌써 벤치 옆에 나와 있던데 비에 젖어서”',
      '민서도 나도 한동안 수박만 먹었다',
      '할머니가 수박을 하나 더 자르며 말했다 “얘가 요 며칠 그 얘기만 했어 걔는 길 잘 찾아, 걔는 길 잘 찾아”',
      '민서가 주머니에서 오려 낸 셋째 칸을 꺼내 내 손바닥에 올려놓았다 둘 다 눈을 감고 웃고 있었다 열쇠를 돌려주려다 말았다 민서가 그건 네 거라고 했다',
      '“다음엔 그냥 말로 해”',
      '민서가 한참 있다가 고개를 끄덕였다 “응 다음엔 전화 받을게 먼저 걸게”',
      '해가 산 너머로 넘어갈 때까지 우리는 평상에서 내려오지 않았다 머리 위에서 감이 아직 퍼렇게 달려 있었다',
    ],
    afterword: '민서는 수림에 남았고 나는 토요일마다 09:40 열차를 탄다 옛 3번, 지금 2번 승강장 둘째 칸이고, 자리에 이름은 없다 다만 열차가 들어오기 직전마다 머리 위 스피커가 한 번 지직거린다 「3번 승강장에 열차가…」 역무원 아저씨는 그런 방송을 넣은 적이 없다고 했다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=letter', title: '반송된 편지', line: '다음은 다섯 번 돌아온 편지 이야기입니다' },
  },
};
