// 마지막 정비소 — ★5 안내 없음, 힌트 2단계, 함정 여럿 이야기·자료·장치가 전부 이 파일에 있습니다
const P = 'assets/v2/garage/';

const dialRow = (el, save, d, n) => {
  const row = el('div', 'dials');
  for (let i = 0; i < n; i++) {
    const col = el('div', 'dial');
    const up = el('button', 'ctl', '▲'); up.type = 'button'; up.setAttribute('aria-label', `${i + 1}번째 다이얼 올리기`); up.onclick = () => { d.dial[i] = (d.dial[i] + 1) % 10; save(); };
    const num = el('b', 'num', String(d.dial[i]));
    const dn = el('button', 'ctl', '▼'); dn.type = 'button'; dn.setAttribute('aria-label', `${i + 1}번째 다이얼 내리기`); dn.onclick = () => { d.dial[i] = (d.dial[i] + 9) % 10; save(); };
    col.append(up, num, dn); row.append(col);
  }
  return row;
};
const toSec = (t) => { const [h, m, x] = t.split(':').map(Number); return h * 3600 + m * 60 + x; };
const fmt = (sec) => [Math.floor(sec / 3600), Math.floor(sec / 60) % 60, sec % 60].map((n) => String(n).padStart(2, '0')).join(':');

// 블랙박스 프레임 (표시 시각은 서버보다 7분 빠르다) 그림에 보이는 것만 적는다
// 그림 cam-f0~f5: 같은 차 앞유리에서 렌즈만 돌린 것 (길 쪽 f0·f1·f3 / 측문 쪽 f2·f4 / 정면 f5) 시각 표시는 그림에 구워 넣음
const FRAMES = [
  { id: 'f0', t: '21:42:30', img: 'cam-f0', what: '남색 재킷에 배낭 측문 쪽에서 나와 길로 걸어간다' },
  { id: 'f1', t: '21:47:05', img: 'cam-f1', what: '회색 재킷 측문 앞을 지나 길 쪽으로 걸어간다' },
  { id: 'f2', t: '21:53:20', img: 'cam-f2', what: '회색 재킷 측문 옆 단말에 카드를 댄다' },
  { id: 'f3', t: '21:55:20', img: 'cam-f3', what: '회색 재킷 측문 앞을 지나 길 쪽으로 걸어간다' },
  { id: 'f4', t: '22:07:00', img: 'cam-f4', what: '회색 재킷 측문을 당겨 열고 들어간다' },
  { id: 'f5', t: '22:21:40', img: 'cam-f5', what: '아무도 없다 앞유리에 빗방울 셔터는 반쯤 열린 채 안에 불이 켜져 있다' },
];
const CAM_ANSWER = ['f2', 'f3'];
// 백업 단말: 블랙박스 시계를 서버 시계에 맞춰 겹쳐 본다 (블박이 7분 빠름 → −7분에서 출입이 다 겹친다)
const SYNC_ANSWER = -7;
const SRV = [['21:30:40', '퇴', '04'], ['21:35:10', '퇴', '07-B'], ['21:40:00', '퇴', '09'], ['22:00:05', '입', '09'], ['22:12:30', '퇴', '09']];
const CAMDIR = { f0: '퇴', f1: '퇴', f2: '입', f3: '퇴', f4: '입', f5: '' };
// 블랙박스 출입 표시 (가까이 붙은 두 장면은 글자가 겹치지 않게 서로 반대쪽으로 비켜 쓴다)
const camMarks = (off, pos, near) => {
  const ms = FRAMES.map((f, i) => ({ i, dir: CAMDIR[f.id], p: pos(toSec(f.t) + off * 60) })).filter((m) => m.dir);
  ms.forEach((m, k) => { const prev = ms[k - 1], next = ms[k + 1]; m.shift = next && next.p - m.p < near ? -1 : prev && m.p - prev.p < near ? 1 : 0; });
  return ms;
};
function syncSvg(off) {
  const t0 = toSec('21:26:00'), span = 56 * 60;
  const X = (sec) => 4 + ((sec - t0) / span) * 92;
  let s = '<svg viewBox="0 0 100 44" class="sync-svg pc-only" role="img" aria-label="위는 블랙박스 출입, 아래는 출입 서버 기록 같은 시간 축">';
  s += '<line x1="4" y1="22" x2="96" y2="22" stroke="#4a5560" stroke-width=".3"/>';
  for (let m = 30; m <= 80; m += 5) { const sec = toSec('21:00:00') + m * 60; const x = X(sec); const hh = 21 + Math.floor(m / 60), mm = m % 60; s += `<line x1="${x}" y1="21" x2="${x}" y2="23" stroke="#6b7782" stroke-width=".25"/><text x="${x}" y="26.4" font-size="2" text-anchor="middle" fill="#8d979f" font-family="ui-monospace,monospace">${hh}:${String(mm).padStart(2, '0')}</text>`; }
  s += `<text x="4" y="4" font-size="2.4" fill="#f2b134" font-family="SUIT,sans-serif">블랙박스 (${off ? '시계를 맞춘 뒤' : '표시 시각 그대로'})</text>` + '<text x="4" y="42.5" font-size="2.4" fill="#9be8a5" font-family="SUIT,sans-serif">출입 서버</text>';
  camMarks(off, X, 4.5).forEach(({ i, dir, p: x, shift }) => { if (x < 2 || x > 98) return; const tx = x + shift * 0.5, anchor = shift < 0 ? 'end' : shift > 0 ? 'start' : 'middle'; s += `<line x1="${x}" y1="9" x2="${x}" y2="20" stroke="#f2b134" stroke-width=".5"/><text x="${tx}" y="8.2" font-size="2.3" text-anchor="${anchor}" fill="#f2b134" font-family="SUIT,sans-serif">${i + 1}${dir === '입' ? '↓' : '↑'}</text>`; });
  SRV.forEach(([t, dir, card]) => { const x = X(toSec(t)); s += `<line x1="${x}" y1="28" x2="${x}" y2="35" stroke="#9be8a5" stroke-width=".5"/><text x="${x}" y="38.2" font-size="2.1" text-anchor="middle" fill="#9be8a5" font-family="SUIT,sans-serif">${card}${dir === '입' ? '↓' : '↑'}</text>`; });
  return s + '</svg>';
}
// 모바일: 같은 시간 축을 세로로 세운다 (옆으로 밀지 않아도 한눈에, 맞추기 버튼까지 한 화면에 들어오게 낮게)
function syncSvgV(off) {
  const t0 = toSec('21:26:00'), span = 56 * 60;
  const Y = (sec) => 9 + ((sec - t0) / span) * 80;
  let s = '<svg viewBox="0 0 80 92" class="sync-svg-v mobile-only" role="img" aria-label="왼쪽은 블랙박스 출입, 오른쪽은 출입 서버 기록 같은 시간 축">';
  s += '<text x="33" y="4.4" font-size="3.3" text-anchor="end" fill="#f2b134" font-family="SUIT,sans-serif">블랙박스</text><text x="44" y="4.4" font-size="3.3" fill="#9be8a5" font-family="SUIT,sans-serif">출입 서버</text>';
  s += '<line x1="39" y1="7" x2="39" y2="91" stroke="#4a5560" stroke-width=".4"/>';
  for (let m = 30; m <= 80; m += 5) { const y = Y(toSec('21:00:00') + m * 60); const hh = 21 + Math.floor(m / 60), mm = m % 60; s += `<line x1="37.6" y1="${y}" x2="40.4" y2="${y}" stroke="#6b7782" stroke-width=".3"/><text x="1" y="${y + 1.1}" font-size="3" fill="#8d979f" font-family="ui-monospace,monospace">${hh}:${String(mm).padStart(2, '0')}</text>`; }
  camMarks(off, Y, 4).forEach(({ i, dir, p: y, shift }) => { if (y < 6 || y > 91) return; s += `<line x1="26" y1="${y}" x2="37" y2="${y}" stroke="#f2b134" stroke-width=".6"/><text x="25" y="${y + 1.2 + shift * 1.1}" font-size="3.3" text-anchor="end" fill="#f2b134" font-family="SUIT,sans-serif">${i + 1}${dir === '입' ? '↓' : '↑'}</text>`; });
  SRV.forEach(([t, dir, card]) => { const y = Y(toSec(t)); s += `<line x1="41" y1="${y}" x2="52" y2="${y}" stroke="#9be8a5" stroke-width=".6"/><text x="53" y="${y + 1.2}" font-size="3.3" fill="#9be8a5" font-family="SUIT,sans-serif">${card}${dir === '입' ? '↓' : '↑'}</text>`; });
  return s + '</svg>';
}
const SAFE_CODE = [0, 4, 0, 7]; // 처음 문 연 날 2009/4/7 (사업자등록 3/30 · 다시 연 날 10/3은 함정)
// safe.webp 속 번호 바퀴 넷의 중심 x (1024px 원본 456·490·523·557px, 화면에는 290~770 × 130~450px만 잘라 보여 줌 → 잘린 칸 기준 %)
const SAFE_KNOBS = [34.64, 41.67, 48.59, 55.63];

// 휴지통의 찢긴 작업 지시서: 다섯 줄 열두 칸을 세 칸씩 넷으로 찢음 + 다른 지시서 조각 하나
const WO_ROWS = ['작업지시서 · 9/12', '차량 서연 검은 세단', '앞 디스크·패드 교체', '고객 통화 하지 말 것', '지시 박정호 작업 지수'].map((r) => [...r.padEnd(12, ' ')]);
const STRIPS = [0, 1, 2, 3].map((k) => ({ id: 's' + k, rows: WO_ROWS.map((r) => r.slice(k * 3, k * 3 + 3)) }));
STRIPS.push({ id: 'sx', rows: [['월', ' ', '3'], ['흰', '색', ' '], ['오', '일', ' '], ['전', '화', ' '], ['확', '인', ' ']] });
const STRIP_ORDER = ['s0', 's1', 's2', 's3'];
const STRIP_TRAY = ['s2', 'sx', 's0', 's3', 's1']; // 휴지통에서 꺼낸 순서
// 커피 자국: s1 오른쪽 끝과 s2 왼쪽 끝이 붙어야 동그라미 하나가 된다 (다른 지시서 조각엔 반쪽 얼룩이 다른 자리에)
const RING = { s1: '100% 58%', s2: '0% 58%', sx: '0% 22%' };
function stripNode(el, s) {
  const n = el('span', 'wo-strip' + (s.id === 'sx' ? ' other' : '') + (s.id === 's0' ? ' edge-l' : '') + (s.id === 's3' ? ' edge-r' : ''));
  if (RING[s.id]) n.style.setProperty('--ring', RING[s.id]);
  s.rows.forEach((r, i) => { const row = el('span', 'wo-row' + (i === 0 ? ' head' : '')); r.forEach((c) => row.append(el('span', 'wo-cell', c === ' ' ? ' ' : c))); n.append(row); });
  return n;
}

// 폐부품 카트 옆 바닥의 갈아 낸 앞 디스크 셋 (꼬리표: 차 번호 · 날짜 · 자리) 캘리퍼스로 물리면 눈금이 보인다
// 서연 차는 영수증의 37마 4182, 지시서의 9/12 앞 → 다 (26.4mm, 한계 25) · 가는 번호 끝 두 자리가 바뀐 다른 차(22.8) · 나는 다른 날 다른 차(23.6)
const DISCS = [
  { id: 'a', plate: '37마 4128', when: '9/12 앞', mm: 22.8, rust: '#7a5a44' },
  { id: 'b', plate: '51허 0917', when: '9/5 앞', mm: 23.6, rust: '#6c5240' },
  { id: 'c', plate: '37마 4182', when: '9/12 앞', mm: 26.4, rust: '#8a6a50' },
];
const DISC_ANSWER = { id: 'c', mm: '26.4' };
// 버니어 눈금 확대: 위는 본척(1mm), 아래는 아들자(0.9mm 간격 열 칸, 0.1mm 읽기)
function vernierSvg(mm) {
  const lo = 22, hi = 36, u = 24, ox = 12;
  const X = (v) => ox + (v - lo) * u;
  let s = `<svg viewBox="0 0 360 112" class="vern-svg" role="img" aria-label="캘리퍼스 눈금 확대, 위는 큰 눈금 아래는 작은 눈금">`;
  s += '<rect x="0" y="0" width="360" height="58" fill="#d9dcdf"/><rect x="0" y="58" width="360" height="54" fill="#b9bec4"/>';
  for (let v = lo; v <= hi; v++) {
    const x = X(v), long = v % 5 === 0;
    s += `<line x1="${x}" y1="58" x2="${x}" y2="${long ? 30 : 42}" stroke="#15181b" stroke-width="1"/>`;
    if (long) s += `<text x="${x}" y="24" font-size="15" text-anchor="middle" fill="#15181b" font-family="SUIT,sans-serif" font-weight="700">${v}</text>`;
  }
  for (let k = 0; k <= 10; k++) {
    const x = X(mm + 0.9 * k), long = k % 5 === 0;
    s += `<line x1="${x.toFixed(2)}" y1="58" x2="${x.toFixed(2)}" y2="${long ? 84 : 74}" stroke="#15181b" stroke-width="1"/>`;
    if (long) s += `<text x="${x.toFixed(2)}" y="101" font-size="14" text-anchor="middle" fill="#15181b" font-family="SUIT,sans-serif" font-weight="700">${k}</text>`;
  }
  return s + '</svg>';
}
function discSvg(d) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="${d.rust}"/><circle cx="50" cy="50" r="44" fill="none" stroke="#a9998a" stroke-width="10" opacity=".55"/><circle cx="50" cy="50" r="24" fill="#4b4038"/><circle cx="50" cy="50" r="8" fill="#1b1714"/>${[0, 72, 144, 216, 288].map((a) => { const r = (a * Math.PI) / 180; return `<circle cx="${(50 + 15 * Math.cos(r)).toFixed(1)}" cy="${(50 + 15 * Math.sin(r)).toFixed(1)}" r="3" fill="#1b1714"/>`; }).join('')}</svg>`;
}

// 강민호 본사 면담 녹화 (서버 시각, 5초 간격으로 넘겨 봄)
const V0 = toSec('21:44:12'), V1 = toSec('21:50:48'), GAP = [toSec('21:46:02'), toSec('21:47:34')];
const IN07 = [toSec('21:46:20'), toSec('21:48:20')];
const vAt = (k) => V0 + k * 5;
const VMAX = Math.floor((V1 - V0) / 5);
const SAYS = [
  [V0, '인사팀 · 강민호 씨 들리세요 / 강민호 · 네 차 안이라 조용합니다'],
  [toSec('21:45:10'), '강민호 · 인수 일정은 내일 열 시 그대로 가는 걸로 알고 있습니다'],
  [GAP[0], '강민호 · 어 화면이 멈췄네요 소리는 들리세요? / 인사팀 · 네 소리만 들려요'],
  [toSec('21:47:00'), '강민호 · 정비소 장비 목록은 오늘 받았고요 손님 차 한 대가 아직 안에 있어요'],
  [GAP[1], '인사팀 · 이제 보여요 / 강민호 · 다행이네요 차 안 그대로입니다'],
  [toSec('21:49:00'), '강민호 · 고객 저장물은 인계 전에 본인한테 돌려주는 게 맞겠습니다'],
  [toSec('21:50:20'), '인사팀 · 오늘은 여기까지 할게요 수고했어요'],
];
function videoFrame(sec) {
  const frozen = sec >= GAP[0] && sec < GAP[1];
  const shown = frozen ? GAP[0] : sec;
  const tilt = Math.round(Math.sin(shown / 7) * 3), nod = Math.round(Math.cos(shown / 5) * 1.5);
  const say = [...SAYS].reverse().find(([t]) => sec >= t)?.[1] || '';
  return `<div class="vid-screen${frozen ? ' frozen' : ''}"><svg viewBox="0 0 160 90" role="img" aria-label="${frozen ? '멈춘 화면' : '차 안의 강민호'}">
    <defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2630"/><stop offset="1" stop-color="#0c1014"/></linearGradient></defs>
    <rect width="160" height="90" fill="url(#vg)"/>
    <path d="M0 8 L46 4 L44 46 L0 52 Z" fill="#2b3a48" opacity=".75"/><path d="M160 6 L118 4 L120 44 L160 50 Z" fill="#2b3a48" opacity=".6"/>
    <circle cx="30" cy="20" r="2.2" fill="#e0b46a" opacity=".7"/><circle cx="140" cy="18" r="1.6" fill="#e0b46a" opacity=".5"/>
    <rect x="58" y="20" width="44" height="70" rx="10" fill="#141a20"/>
    <g transform="translate(${tilt} ${nod})"><ellipse cx="80" cy="40" rx="12" ry="14" fill="#c99a78"/><path d="M68 36 q12 -16 24 0 q-2 -10 -12 -11 q-10 1 -12 11 z" fill="#1b1b1b"/>
    <path d="M52 90 q2 -28 28 -30 q26 2 28 30 z" fill="#3c4650"/><path d="M74 62 l6 8 l6 -8" fill="none" stroke="#d9dde0" stroke-width="1.4"/></g>
    <path d="M10 90 q20 -26 50 -22" fill="none" stroke="#0a0d10" stroke-width="5"/>
    </svg><span class="vid-osd">● REC · 본사 영상 면담 · ${fmt(sec)}</span>${frozen ? '<span class="vid-freeze">영상 끊김 · 음성 연결됨</span>' : ''}<span class="vid-sub">${say}</span></div>`;
}

const JACKETS = [
  { id: 'navy', name: '남색 재킷', tag: '한지수', note: '소매에 띠 없음 안주머니에 재발급 카드 07-B' },
  { id: 'charcoal', name: '진회색 재킷', tag: '강민호', note: '소매에 띠 없음 안주머니에 본사 출입증' },
  { id: 'stripe', name: '회색 재킷', tag: '박정호', note: '소매에 반사띠 안주머니는 비어 있다' },
];
const REPORT = [
  { id: 'card', label: '① 21:46 측문을 연 카드', opts: [['07b', '07-B'], ['07a', '07-A'], ['09', '09'], ['04', '04']], ans: '07a' },
  { id: 'from', label: '② 그 카드가 어젯밤 꺼내지기 전까지 보관돼 있던 곳', opts: [['floor', '작업장 바닥'], ['safe', '사무실 금고 봉투'], ['pocket', '지수 재킷 안주머니']], ans: 'safe' },
  { id: 'again', label: '③ 같은 재킷이 블랙박스에 찍힌 다른 출입 (서버 줄로 · 모두)', multi: true, opts: [['2135', '21:35:10 07-B 퇴장'], ['2140', '21:40:00 09 퇴장'], ['2200', '22:00:05 09 입장'], ['2212', '22:12:30 09 퇴장']], ans: ['2140', '2200'] },
  { id: 'who', label: '④ 카드를 꺼낸 사람', opts: [['jisu', '한지수'], ['minho', '강민호'], ['boss', '박정호']], ans: 'boss' },
  { id: 'why', label: '⑤ 사진이 넘어가면 곤란했던 이유', opts: [['jisu', '지수가 몰래 부품을 바꿔서'], ['boss', '교체를 사장이 지시해서'], ['minho', '인수 일정이 늦어져서']], ans: 'boss' },
];
const PRE_REPORT = ['cam', 'terminal', 'safe', 'strips', 'disc', 'video', 'jackets'];
// 보고 앞 장치를 다 풀면 마지막 보상 창에서 바로 앞마당(보고 자리)으로 가는 길을 준다 (사무실에 남아 다음 할 일을 못 찾는 일 방지)
const stateNow = () => { try { return window.MihaejeV2?.state || JSON.parse(localStorage.getItem('mihaeje-v2-garage') || '{}'); } catch { return {}; } };
const toReport = () => (PRE_REPORT.every((x) => (stateNow().solved || []).includes(x)) ? 'yard' : null);

// 내 휴대폰 문자와 조사 수첩은 처음부터 소지품에 있다
const pocket = (S) => { S.found = S.found || []; ['brief', 'people'].forEach((x) => { if (!S.found.includes(x)) S.found.push(x); }); };

export default {
  id: 'garage',
  number: '001',
  title: '마지막 정비소',
  subtitle: '사라진 SD카드',
  genre: '추리 · 알리바이',
  minutes: 55,
  difficulty: 5,
  cover: P + 'yard.webp',
  coverAlt: '비 온 밤, 셔터가 반쯤 열린 정비소 앞에 선 차',
  music: 'assets/music/garage-v33.mp3',
  tagline: '21:40엔 있었고 22:00엔 없었다\n그 사이 기록은 잠겼고, 블랙박스 시계는 틀렸다',
  blurb: '폐업 전날 밤, 고객 서연의 부품 교체 사진이 든 SD카드가 보관함에서 사라졌습니다\n블랙박스 시계는 틀려 있고, 출입 기록 두 줄은 잠겨 있고, 세 사람은 각자 할 말이 있습니다',
  storageKey: 'mihaeje-v2-garage',
  hintTitle: '서연의 문자',
  tracesLabel: '정비소에 남은 것',

  opening: {
    eyebrow: '9월 19일, 폐업 당일 새벽',
    image: P + 'yard.webp',
    paragraphs: [
      '셔터가 반쯤 내려온 채 멈춰 있었다. 날이 밝기 전이라 가로등이 아직 켜져 있다. 미루정비소는 오늘 오전 열 시에 문을 닫는다.',
      '어젯밤 이 안에서 SD카드 한 장이 사라졌다. 고객 서연의 차에서 부품을 바꿀 때 찍은 교체 전후 사진이 든 카드다. 서연은 그 교체에 동의한 적이 없다.',
      '사장 박정호는 21:40에 카드를 봤고, 22:00에는 없었다고 했다. 그 사이 출입 서버에는 두 줄이 남았지만, 폐업 이관 작업 때문에 잠겨서 읽을 수 없다. CCTV는 전날 떼어 냈다.',
      '서연의 차는 어젯밤 이 앞마당에 서 있었고, 블랙박스는 밤새 켜져 있었다. 보험사 조사원인 나한테 서연이 부탁한 건 하나다. "경찰 부르기 전에, 누가 가져갔는지만 확실하게요."',
      '정비사 한지수, 인수 담당 강민호, 사장 박정호. 새벽같이 불려 나온 세 사람이 휴게실에서 나를 기다리고 있다. 셔터가 내려가기까지 네 시간 남짓 남았다.',
    ],
    cta: '앞마당으로',
  },

  traces: [
    { device: 'cam', label: '블랙박스' },
    { device: 'terminal', label: '두 시계' },
    { device: 'safe', label: '금고' },
    { device: 'strips', label: '지시서' },
    { device: 'disc', label: '디스크' },
    { device: 'video', label: '면담 영상' },
    { device: 'jackets', label: '재킷' },
    { device: 'report', label: '보고' },
  ],

  scenes: [
    {
      id: 'yard',
      name: '앞마당',
      image: P + 'yard.webp',
      // 휴대폰 첫 위치: 블랙박스·영수증·작업장 입구가 한 화면에, 보고만 남으면 트렁크 쪽
      focusX: (S) => (PRE_REPORT.every((x) => (S.solved || []).includes(x)) ? 32 : 42),
      arrive: (S) => {
        pocket(S);
        if (PRE_REPORT.every((x) => S.solved.includes(x))) return '서연 차 트렁크에 수첩을 펴 놓았다 불 켜진 창 너머로 세 사람이 이쪽을 보고 있다 이제 보고만 남았다';
        if (S.solved.includes('terminal')) return '작업장 셔터가 덜컹 하고 한 번 울렸다 바람인지 사람인지 모르겠다 휴게실 불이 꺼졌다 켜졌다';
        return '가로등이 아직 켜져 있다 비는 그쳤고 바닥은 젖어 있다 서연의 차는 어젯밤 그 자리에 그대로 서 있고, 뒷유리 너머 앞유리에 붙은 블랙박스 불빛이 깜박인다';
      },
      hotspots: [
        { id: 'cam', x: 27, y: 57, r: 7, label: '서연 차의 블랙박스', kind: 'device', device: 'cam' },
        { id: 'receipt', x: 41, y: 64, r: 6, label: '차 안의 점검 영수증', kind: 'doc', doc: 'receipt' },
        { id: 'go-shop', x: 63, y: 46, r: 10, label: '작업장으로', kind: 'travel', to: 'shop' },
        { id: 'go-office', x: 93, y: 41, r: 7, label: '사무실로', kind: 'travel', to: 'office' },
        { id: 'report', x: 22, y: 76, r: 10, label: '서연에게 보고', kind: 'device', device: 'report', visible: (S) => PRE_REPORT.every((x) => S.solved.includes(x)) },
      ],
    },
    {
      id: 'office',
      name: '사무실',
      image: P + 'office.webp',
      arrive: (S) => {
        pocket(S);
        if (S.solved.includes('terminal') && !S.solved.includes('jackets')) return '그사이 누가 사무실에 다녀갔다 재킷이 걸린 고리 하나가 아직 달랑거린다 책상 위엔 민호가 맡기고 간 휴대폰이 놓여 있다';
        return '모니터엔 출입 서버 화면, 벽엔 재킷 세 벌과 기념패 책상 밑엔 작은 금고, 휴지통 맨 위엔 찢은 종이';
      },
      // 단말을 맞춘 뒤 민호가 책상 위에 휴대폰을 두고 간다 (그때부터 그림에도 보이게)
      overlays: [{ cls: 'g-phone', x: 42.58, y: 52.33, w: 10.16, h: 5.81, html: `<img src="${P}props/office-phone.webp" alt="">` }],
      hotspots: [
        { id: 'server', x: 20, y: 42, r: 9, label: '출입 서버 화면', kind: 'doc', doc: 'server' },
        { id: 'handover', x: 38, y: 44, r: 6, label: '폐업 인계 문서', kind: 'doc', doc: 'handover' },
        { id: 'plaque', x: 47, y: 10, r: 7, label: '벽의 기념패', kind: 'doc', doc: 'plaque' },
        { id: 'alibi', x: 93, y: 33, r: 6, label: '강민호의 면담 기록', kind: 'doc', doc: 'alibi' },
        { id: 'lost', x: 93, y: 62, r: 7, label: '서류함의 분실 신고서', kind: 'doc', doc: 'lost' },
        { id: 'jackets', x: 70, y: 28, r: 12, label: '걸려 있는 재킷 세 벌', kind: 'device', device: 'jackets', visible: (S) => S.solved.includes('terminal') },
        { id: 'video', x: 48, y: 55, r: 5, label: '책상 위 민호의 휴대폰', kind: 'device', device: 'video', visible: (S) => S.solved.includes('terminal') },
        { id: 'safe', x: 37, y: 74, r: 8, label: '책상 밑 금고', kind: 'device', device: 'safe', visible: (S) => !S.solved.includes('safe') },
        { id: 'safeopen', x: 37, y: 74, r: 8, label: '다시 닫아 둔 금고', kind: 'doc', doc: 'safedoc', visible: (S) => S.solved.includes('safe') },
        { id: 'strips', x: 81, y: 80, r: 7, label: '휴지통의 찢긴 종이', kind: 'device', device: 'strips' },
        { id: 'go-shop', x: 16, y: 16, r: 9, label: '작업장으로', kind: 'travel', to: 'shop' },
      ],
    },
    {
      id: 'shop',
      name: '작업장',
      image: P + 'shop.webp',
      // 휴대폰 첫 위치: 보관함·단말 쪽, 지시서를 맞춘 뒤엔 왼쪽 카트 쪽
      focusX: (S) => (S.solved.includes('strips') && !S.solved.includes('disc') ? 20 : 80),
      arrive: (S) => {
        pocket(S);
        if (S.solved.includes('strips') && !S.solved.includes('disc')) return '리프트 옆 카트 아래 바닥에 갈아 낸 디스크가 몇 장 기대 세워져 있다 꼬리표가 철사로 묶여 있다';
        if (S.solved.includes('terminal')) return '단말 화면에 초록 글씨로 SYNC OK 보관함 서랍은 아까 그대로 열려 있다 휴게실 쪽 문이 조금 열려 있다';
        return '리프트 위에 손님 차 한 대 벽 쪽 철제 보관함 아래 서랍이 열려 있고, 옆 벽에 손바닥만 한 단말이 붙어 있다 화면에 「LOCKED」';
      },
      // 그림 속 단말 화면(파란 액정 925~958 × 228~256px)에 지금 상태 글자를 얹는다 (맞추기 전 LOCKED, 뒤 SYNC OK)
      overlays: [{ cls: 'g-term', x: 90.33, y: 33.0, w: 3.22, h: 4.1, html: '<b class="lk">LOCKED</b><b class="ok">SYNC<br>OK</b>' }],
      hotspots: [
        { id: 'locker', x: 76, y: 65, r: 8, label: '직원 보관함과 SD 슬롯', kind: 'doc', doc: 'locker' },
        { id: 'disc', x: 11, y: 81, r: 6, label: '폐부품 카트', kind: 'device', device: 'disc', visible: (S) => S.solved.includes('strips') },
        { id: 'terminal', x: 93, y: 38, r: 7, label: '보관함 백업 단말', kind: 'device', device: 'terminal' },
        { id: 'go-yard', x: 9, y: 42, r: 9, label: '앞마당으로', kind: 'travel', to: 'yard' },
      ],
    },
  ],

  docs: {
    brief: {
      title: '서연과 주고받은 문자',
      kind: '내 휴대폰 · 오늘 새벽',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>서연</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 9월 19일 토요일</div>
<div class="chat-row them"><span class="chat-avatar">서</span><div class="chat-col"><span class="chat-name">서연</span><div class="chat-bubble">조사원님 정비소 도착하셨어요?</div><div class="chat-bubble">사장님이 21:40에 카드 봤고 22:00에 없어졌대요</div><div class="chat-bubble">그 사이에 들어온 건 서버에 두 줄인데 잠겨서 못 읽는대요 폐업 처리 중이라고</div><div class="chat-bubble">제 차 어젯밤 거기 세워 뒀어요 블박 켜져 있을 거예요 문은 열어 뒀어요</div></div><span class="chat-time">오전 5:41</span></div>
<div class="chat-row me"><span class="chat-meta">오전 5:43</span><div class="chat-bubble">네 지금 앞마당이에요 블박부터 볼게요</div></div>
<div class="chat-row them"><span class="chat-avatar">서</span><div class="chat-col"><span class="chat-name">서연</span><div class="chat-bubble">그 카드에 제 차 부품 교체 전후 사진이 있어요 저는 교체 동의한 적 없고요</div><div class="chat-bubble">아 그리고 민호 씨요 어젯밤 본사 면담 영상이 중간에 끊겼대요</div><div class="chat-bubble">그럼 민호 씨도 의심해야 되는 거 아니에요?</div><div class="chat-bubble">경찰 부르기 전에 누가 가져갔는지만요 확실하게</div></div><span class="chat-time">오전 5:44</span></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    people: {
      title: '조사 수첩 · 세 사람 진술',
      kind: '오늘 새벽 휴게실에서 받아 적음',
      html: `<div class="paper-table"><table><tr><th>한지수 · 07<br><small>정비사</small></th><td>“21:35에 측문으로 퇴근했어요 그 뒤엔 안 왔어요 카드요? 그제 잃어버려서 어제 아침에 새로 받았어요 07-B”<br><small>21:35 이후 함께 있던 사람 없음</small></td></tr>
<tr><th>강민호 · 04<br><small>인수 담당</small></th><td>“21:30에 사무실 문으로 나가서 길가에 세운 제 차 안에서 본사 면담했습니다 21:44부터 21:50까지 기록 있어요”<br><small>면담 기록은 사무실 서류함에</small></td></tr>
<tr><th>박정호 · 09<br><small>사장</small></th><td>“21:40에 재고 점검 끝내고 측문으로 나갔다가 22:00에 최종 점검하러 들어왔어요 그때 카드가 없더라고 지수가 그 사진 때문에 불안해했으니까”<br><small>나갔다 들어온 사이엔 자기 차에 있었다고 함</small></td></tr></table></div><p>셋 다 새벽에 불려 와서 겉옷 재킷은 사무실에 걸어 두고 작업복 차림이다</p>`,
    },
    receipt: {
      title: '차 안의 점검 영수증',
      kind: '미루정비소 장비 점검 · 2026/9/18',
      html: `<div class="paper-table"><p class="pt-head">장비 점검 영수증 · 2026/9/18 20:00</p><table><tr><th>항목</th><td>주차 차량 블랙박스 시각 점검 (고객 차량 37마 4182 · 앞유리 회전형)</td></tr><tr><th>점검 결과</th><td>블랙박스 시계가 서버 시각과 맞지 않음 (빠름)</td></tr><tr><th>조치</th><td>시계 수정 미실시 폐업 일정으로 보류</td></tr><tr><th>비고</th><td>오차는 자정까지 일정함 (수정 전 기록은 표시 시각 그대로 남음)</td></tr></table></div>`,
    },
    server: {
      title: '출입 서버 화면',
      kind: '서버 기준 시각 · 측문과 사무실 문',
      html: (S) => {
        const open = (S.solved || []).includes('terminal');
        const locked = open
          ? '<tr class="restored"><td>21:46:20</td><td>07-A</td><td>측문</td><td>입장</td></tr><tr class="restored"><td>21:48:20</td><td>07-A</td><td>측문</td><td>퇴장 · 실내 0</td></tr>'
          : '<tr><td class="enc">██:██:██</td><td class="enc">██-█</td><td>측문</td><td>입장 <small>(잠김)</small></td></tr><tr><td class="enc">██:██:██</td><td class="enc">██-█</td><td>측문</td><td>퇴장 · 실내 0 <small>(잠김)</small></td></tr>';
        return `<div class="term-screen"><p class="term-line">MIRU-GARAGE ACCESS LOG 2026-09-18</p><table class="term-table log-srv"><tr><th>시각</th><th>카드</th><th>문</th><th>이벤트</th></tr><tr><td>21:30:40</td><td>04</td><td>사무실 문</td><td>퇴장</td></tr><tr><td>21:35:10</td><td>07-B</td><td>측문</td><td>퇴장</td></tr><tr><td>21:40:00</td><td>09</td><td>측문</td><td>퇴장 · 실내 0</td></tr>${locked}<tr><td>22:00:05</td><td>09</td><td>측문</td><td>입장 · 최종 점검</td></tr><tr><td>22:12:30</td><td>09</td><td>사무실 문</td><td>퇴장 · 실내 0</td></tr></table><p class="term-line">※ 셔터 밑 감지선 21:00 이후 감지 없음</p><p class="term-line">${open ? '※ 백업 단말 동기화로 잠긴 두 줄 복원됨' : '※ 폐업 이관 작업 21:45~22:00 이 구간 기록 잠김 (작업 확인 박정호) 작업장 백업 단말에 영상 기록을 물려 두 시계를 맞추면 원본이 열림'}</p></div>`;
      },
    },
    handover: {
      title: '폐업 인계 문서',
      kind: '작성 강민호 · 폐업 전날 오전',
      html: `<div class="paper-table"><p class="pt-head">미루정비소 폐업 인계 (초안)</p><table><tr><th>사업자등록</th><td class="nw">2009/3/30</td></tr><tr><th>금고</th><td>비밀번호는 정비소가 처음 문을 연 날 네 자리 (월일) 사장 외 공유 금지</td></tr><tr><th>분실 카드</th><td>회수된 출입 카드는 금고 봉투에 보관 폐업 시 일괄 폐기</td></tr><tr><th>고객 저장물</th><td>고객 SD카드는 본인 동의 후 반환 복사본은 동의 없이 삭제 금지</td></tr></table><p class="pt-foot hand-note">인수 담당 메모: 고객 카드에 지수가 고객 동의 없이 부품을 교체한 전후 사진이 있다고 들었다 내일 인계 전에 확인 필요 — 민호</p></div>`,
    },
    lost: {
      title: '서류함의 분실 신고서',
      kind: '출입 카드 분실 · 2026/9/17',
      html: `<div class="paper-table"><p class="pt-head">출입 카드 분실 신고 · 재발급</p><table><tr><th>신고</th><td>9/17 14:00 한지수 07-A 분실 (작업장에서 잃어버린 듯)</td></tr><tr><th>재발급</th><td>9/18 09:00 07-B 발급 (서명 한지수)</td></tr><tr><th>07-A 처리</th><td>9/18 09:10 작업장 바닥에서 발견 → 사무실 금고 봉투에 보관 (서명 박정호) <b>정지 처리 안 함</b></td></tr></table><p class="pt-foot">※ 폐업 일정으로 카드 정지는 보류 서버에는 07-A, 07-B가 따로 찍힘</p></div>`,
    },
    alibi: {
      title: '강민호의 면담 기록',
      kind: '본사 영상 면담 시스템 출력',
      html: `<div class="term-screen"><p class="term-line">HQ VIDEO INTERVIEW LOG · 2026-09-18</p><table class="term-table"><tr><th>항목</th><th>값</th></tr><tr><td>참가자</td><td>강민호 (현장) / 인사팀</td></tr><tr><td>접속</td><td>21:44:12 (본사 서버 시각, 정비소 서버와 동기화됨)</td></tr><tr><td>종료</td><td>21:50:48</td></tr><tr><td>카메라</td><td>켜짐 · 차량 내부 (정비소 앞 길가)</td></tr><tr><td>연결 상태</td><td>영상 한 번 끊김 · 음성은 끝까지 유지</td></tr><tr><td>녹화본</td><td>참가자 휴대폰에 저장</td></tr></table></div>`,
    },
    plaque: {
      title: '벽의 기념패',
      kind: '미루동 상인회',
      html: `<figure class="prop plaque"><img src="${P}props/plaque.webp" alt="기념패" decoding="async"><div class="on-plaque"><b>미루정비소</b><span>2009년 4월 7일</span><span>처음 문을 열고</span><span>2018년 10월 3일</span><span>불탄 자리에 다시 열다</span><small>미루동 상인회</small></div></figure><p class="mobile-only plaque-text">미루정비소<br>2009년 4월 7일 처음 문을 열고<br>2018년 10월 3일 불탄 자리에 다시 열다<br>미루동 상인회</p>`,
    },
    locker: {
      title: '직원 보관함과 SD 슬롯',
      kind: '작업장',
      html: `<p>철제 보관함 문 아래쪽에 달린 작은 서랍이 손님 저장 매체를 꽂아 두는 SD 슬롯이다 서랍은 직원 카드를 대야 열리고, 열고 닫은 기록과 측문 출입이 옆의 백업 단말에 따로 남는다</p><p>서랍 칸마다 카드가 꽂혀 있는데 한 칸만 비었다 서연 카드 자리다 먼지 자국만 남았다</p><p>작업장 불은 폐업 정리 때문에 밤새 켜 두었다고 했다</p>`,
    },
    lockerlog: {
      title: '백업 단말의 보관함 기록',
      kind: '잠긴 구간 복원',
      html: `<div class="term-screen"><p class="term-line">BACKUP TERMINAL · RESTORED</p><table class="term-table"><tr><th>서버 시각</th><th>이벤트</th></tr><tr><td>21:46:20</td><td>07-A 입장 (측문)</td></tr><tr><td>21:47:05</td><td>07-A 보관함 서랍 열림</td></tr><tr><td>21:47:10</td><td>SD 슬롯 · 카드 빠짐</td></tr><tr><td>21:48:05</td><td>보관함 서랍 닫힘</td></tr><tr><td>21:48:20</td><td>07-A 퇴장 (측문) · 실내 0</td></tr></table></div>`,
    },
    safedoc: {
      title: '금고 안의 봉투들',
      kind: '금고를 열었을 때',
      html: `<figure class="prop"><img src="${P}props/safe-open.webp" alt="열린 금고 안, 봉투 하나가 비어 있다" decoding="async"></figure><p>봉투 넷 「04 예비」 「09 예비」 「11 퇴직」 그리고 「07-A 분실 · 9/18 보관」 — 이 봉투만 비어 있다</p>`,
    },
    workorder: {
      title: '붙여 놓은 작업 지시서',
      kind: '휴지통에서 · 테이프로 이음',
      html: () => `<div class="wo-sheet joined">${STRIP_ORDER.map((id) => stripNode((t, c, x) => { const n = document.createElement(t); if (c) n.className = c; if (x !== undefined) n.textContent = x; return n; }, STRIPS.find((s) => s.id === id)).outerHTML).join('')}</div><p>찢긴 자리가 맞물렸다 남은 한 조각은 다른 손님 차 지시서였다</p>`,
    },
    disc: {
      title: '회수한 앞 디스크',
      kind: '작업장 폐부품 카트 · 꼬리표째',
      html: `<div class="paper-table"><p class="pt-head">갈아 낸 앞 브레이크 디스크</p><table><tr><th>꼬리표</th><td>37마 4182 · 9/12 앞</td></tr><tr><th>찍힌 글자</th><td>MIN TH 25 (이보다 얇으면 교체)</td></tr><tr><th>잰 두께</th><td>26.4mm</td></tr><tr><th>꼬리표 뒤</th><td class="hand-note">버리지 말 것 — 지수</td></tr></table></div>`,
    },
    final: {
      title: '서연에게 보낸 보고',
      kind: '조사 결과',
      locked: true,
      html: `<blockquote>서연 씨께<br><br>카드를 꺼낸 사람은 사장 박정호입니다<br>블랙박스는 7분 빠릅니다 표시 21:53:20 입장은 서버 21:46:20이고, 그 시각에 쓰인 카드는 지수 씨가 잃어버려 금고 봉투에 들어 있던 07-A입니다 금고 번호는 인계 문서에 적혀 있어서 사장만 열 수 있었다고는 못 합니다 그래서 재킷을 봤습니다<br>들어간 사람은 소매에 반사띠가 있는 회색 재킷을 입었고, 같은 재킷이 서버 21:40 퇴장과 22:00 입장 때도 찍혔습니다 두 줄 다 09 카드, 사장 본인입니다<br>민호 씨는 영상이 끊겼다 돌아온 21:47:34 뒤로 차 안 화면에 있었고, 그때 07-A는 아직 정비소 안에 있었습니다<br>휴지통에서 나온 작업 지시서에 교체 지시 박정호라고 적혀 있습니다 지수 씨가 버리지 않고 둔 앞 디스크는 26.4mm로, 한계 25mm까지 남아 있었습니다 갈 필요가 없던 부품입니다 사진이 인수 쪽에 넘어가면 그 지시가 드러납니다<br>— 조사원</blockquote>`,
    },
  },

  devices: {
    cam: {
      title: '서연 차의 블랙박스',
      scene: 'yard',
      intro: '앞유리에 붙은 회전형 블랙박스라 움직임이 있으면 렌즈가 그쪽으로 돌아가 당겨 찍는다 어젯밤 측문 쪽 프레임 여섯 아래 작은 화면을 누르면 크게 보이고, 큰 화면을 누르면 그 자리를 확대한다 표시해 둘 장면 둘을 고른다',
      docs: ['receipt'],
      hintCode: 'G-S01',
      hints: [
        '차 안 영수증 다시 보세요 블박 시계 얘기가 있어요 그리고 같은 옷이 몇 번 나오는지도요',
        '서버로 21:40~22:00이면 블박 표시로는 그보다 늦은 시각이에요 그 사이에 들어갔다 나온 한 사람을 찾아요',
      ],
      initial: () => ({ cur: 0, pick: [] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'cam-wrap');
        const f = FRAMES[d.cur];
        const view = el('div', 'prop camview' + (ctx.zoom ? ' zoomed' : '')); view.innerHTML = `<img src="${P}props/${f.img}.webp" alt="블랙박스 프레임 ${d.cur + 1} · 화면 시각 ${f.t}" decoding="async">`;
        const im = view.querySelector('img');
        if (ctx.zoom) { im.style.transformOrigin = `${ctx.zoom[0]}% ${ctx.zoom[1]}%`; im.style.transform = 'scale(2.4)'; }
        view.setAttribute('role', 'button'); view.setAttribute('tabindex', '0'); view.setAttribute('aria-label', ctx.zoom ? '확대 풀기' : '이 화면 확대해 보기');
        const zoom = (e) => { if (ctx.zoom) { ctx.zoom = null; } else { const r = view.getBoundingClientRect(); const x = e && e.clientX ? ((e.clientX - r.left) / r.width) * 100 : 50, y = e && e.clientY ? ((e.clientY - r.top) / r.height) * 100 : 50; ctx.zoom = [Math.round(x), Math.round(y)]; } save(); };
        view.onclick = zoom; view.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zoom(null); } };
        wrap.append(view);
        // 지금 보는 프레임 설명과 표시 버튼은 큰 화면 바로 아래 한 줄에 (썸네일을 눌러도 손이 멀리 가지 않게)
        const marked = d.pick.includes(f.id);
        const now = el('div', 'cam-now');
        now.append(el('p', 'cam-desc', `프레임 ${d.cur + 1} · ${f.t} — ${f.what}`));
        const mark = el('button', 'chip cam-mark' + (marked ? ' on' : ''), marked ? '✓ 표시 해제' : '이 프레임 표시'); mark.type = 'button'; mark.setAttribute('aria-label', `프레임 ${d.cur + 1} 표시`); mark.setAttribute('aria-pressed', String(marked));
        mark.onclick = () => { if (d.pick.includes(f.id)) d.pick = d.pick.filter((x) => x !== f.id); else { d.pick.push(f.id); if (d.pick.length > 2) d.pick.shift(); } save(); };
        now.append(mark); wrap.append(now);
        const strip = el('div', 'cam-strip');
        FRAMES.forEach((fr, i) => {
          const pk = d.pick.includes(fr.id);
          const b = el('button', 'cam-thumb' + (i === d.cur ? ' cur' : '') + (pk ? ' picked' : '')); b.type = 'button';
          b.setAttribute('aria-label', `프레임 ${i + 1} (${fr.t})`); b.innerHTML = `<img src="${P}props/${fr.img}.webp" alt="" decoding="async"><span>${fr.t}</span>${pk ? '<em class="cam-badge" aria-hidden="true">✓ 표시</em>' : ''}`;
          b.onclick = () => { d.cur = i; ctx.zoom = null; save(); };
          strip.append(b);
        });
        wrap.append(strip);
        wrap.append(el('p', 'pick-label cam-picked', d.pick.length ? `표시한 프레임 ${d.pick.length}/2 · ${d.pick.map((id) => FRAMES.find((x) => x.id === id).t).join(' / ')}` : '표시한 프레임 없음 (둘까지)'));
        return wrap;
      },
      commitLabel: '이 두 장면을 표시해 둔다',
      canCommit: (d) => d.pick.length === 2,
      check(d) {
        const p = [...d.pick].sort((a, b) => FRAMES.findIndex((x) => x.id === a) - FRAMES.findIndex((x) => x.id === b));
        if (p.join() === CAM_ANSWER.join()) return { ok: true };
        return { ok: false, msg: '이 두 장면으로는 카드가 사라진 사이를 설명할 수 없다' };
      },
      reveal: {
        title: '21:53:20 → 21:55:20',
        text: '표시 시각 21:53:20에 측문으로 들어가 21:55:20에 나왔다 안에 있던 건 딱 2분',
        scene: ['화면 구석 시각은 블랙박스 시계다 이 두 장면이 출입 서버의 어느 줄인지는 아직 모른다 작업장 보관함 옆 백업 단말에 이 기록을 물려 볼 수 있을 것 같다'],
        get unlock() { return toReport(); },
      },
    },

    terminal: {
      title: '보관함 백업 단말',
      scene: 'shop',
      intro: '블랙박스 기록을 물리면 시간 축 두 줄이 뜬다 블랙박스 줄은 표시 시각 그대로, 출입 서버 줄은 서버 기록이다 블랙박스 시계를 몇 분 옮겨야 서버와 맞는지 정해서 맞추기를 누른다 세 번 틀리면 단말이 1분 동안 잠긴다',
      docs: ['receipt', 'server'],
      hintCode: 'G-S02',
      hints: [
        '블박 시각이 서버랑 다르다고 했죠 둘 다 찍힌 출입이 있을 거예요 화살표 방향도 같아야 같은 출입이에요',
        '시각이 남은 서버 줄 가운데 들어간 줄은 하나뿐이에요 그 줄에 맞는 블박 장면부터 겹쳐 봐요',
      ],
      initial: () => ({ off: 0, fails: 0, until: 0 }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        if (typeof d.off !== 'number') d.off = 0;
        d.ready = S.solved.includes('cam');
        const wrap = el('div', 'sync-wrap');
        if (!d.ready) {
          // 블랙박스에서 장면을 표시해 오기 전: 화면은 잠겨 있고 무엇이 필요한지만 보인다
          const idle = el('div', 'term-screen sync-screen'); idle.innerHTML = '<p class="term-line">BACKUP TERMINAL · LOCKED</p><p class="term-line">NO VIDEO SOURCE</p>';
          wrap.append(idle, el('p', 'pick-label', '물릴 영상이 아직 없다 블랙박스에서 측문 장면을 골라 표시해 와야 한다'));
          return wrap;
        }
        const done = S.solved.includes('terminal');
        const shown = done ? SYNC_ANSWER : 0; // 맞추기 전에는 두 줄을 있는 그대로만 보여 준다 (눌러 보며 겹치는 걸 볼 수 없게)
        const sign = (v) => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v);
        // 읽는 법은 화면 안 맨 위에 (버튼과 맞추기 사이에 글줄이 끼지 않게)
        const screen = el('div', 'term-screen sync-screen'); screen.innerHTML = `<p class="term-line">BACKUP TERMINAL · CLOCK SYNC</p><p class="term-line sync-legend">숫자 = 프레임 번호 / 카드 번호 · ↓ 들어감 ↑ 나감</p>${syncSvg(shown)}${syncSvgV(shown)}<p class="term-line sync-off">${done ? 'SYNC OK · 블랙박스 시계 ' + sign(SYNC_ANSWER) + '분' : '옮길 차이 · 블랙박스 시계 <b>' + sign(d.off) + '분</b>'}</p>`;
        wrap.append(screen);
        if (!done) {
          const row = el('div', 'sync-row');
          [[-5, '−5분'], [-1, '−1분'], [1, '+1분'], [5, '+5분']].forEach(([v, lab]) => { const b = el('button', 'ctl', lab); b.type = 'button'; b.setAttribute('aria-label', `블랙박스 시계 ${lab}`); b.onclick = () => { d.off = Math.max(-15, Math.min(15, d.off + v)); save(); }; row.append(b); });
          wrap.append(row);
          const left = Math.ceil(((d.until || 0) - Date.now()) / 1000);
          if (left > 0) {
            // 잠긴 동안 남은 초가 실제로 줄어들고, 풀리면 화면이 저절로 돌아온다
            const lock = el('p', 'pick-label sync-lock', `SYNC LOCK · ${left}초 뒤에 다시 맞출 수 있다`); wrap.append(lock);
            const tick = setInterval(() => { if (!lock.isConnected) { clearInterval(tick); return; } const l = Math.ceil(((d.until || 0) - Date.now()) / 1000); if (l > 0) lock.textContent = `SYNC LOCK · ${l}초 뒤에 다시 맞출 수 있다`; else { clearInterval(tick); save(); } }, 1000);
          } else if (d.fails) wrap.append(el('p', 'pick-label sync-tries', `남은 시도 ${3 - d.fails}번`));
        }
        return wrap;
      },
      commitLabel: '이 차이로 맞추기',
      canCommit: (d) => d.ready !== false,
      check(d) {
        if (!d.ready) return { ok: false, msg: 'NO VIDEO SOURCE' };
        if (Date.now() < (d.until || 0)) return { ok: false, msg: 'SYNC LOCK 잠시 뒤에 다시' };
        if (d.off === SYNC_ANSWER) { d.fails = 0; return { ok: true }; }
        d.fails = (d.fails || 0) + 1;
        if (d.fails >= 3) { d.fails = 0; d.until = Date.now() + 60000; return { ok: false, msg: 'SYNC FAIL · 단말이 1분 동안 잠긴다' }; }
        return { ok: false, msg: 'SYNC FAIL' };
      },
      reveal: {
        title: 'SYNC OK',
        text: '블랙박스 장면 셋이 서버 출입 셋과 겹쳤다 남은 두 장면은 서버가 잠긴 자리에 떨어졌다 잠긴 두 줄이 풀렸다',
        scene: ['단말이 삑 하고 길게 울렸다 휴게실 쪽에서 의자 끄는 소리가 났다가 멎었다 누군가 이쪽 소리를 듣고 있었다'],
        get unlock() { return toReport(); },
        unlockDoc: 'lockerlog',
      },
    },

    safe: {
      title: '책상 밑 금고',
      scene: 'office',
      intro: '네 자리 다이얼 ▲▼로 한 칸씩 돌리고 손잡이를 내려 본다',
      docs: ['handover', 'lost'],
      hintCode: 'G-S03',
      hints: [
        '인계 문서에 금고 규칙이 있어요 어떤 날짜를 말하는지 정확히 읽어요',
        '정비소에 날짜가 여럿 있어요 등록한 날, 다시 연 날, 처음 연 날 문서가 말하는 건 그중 하나예요',
      ],
      initial: () => ({ dial: [0, 0, 0, 0] }),
      render(ctx) {
        const { d, el, save } = ctx;
        // 금고 문을 가까이: 사진 속 번호 바퀴 넷 위에 지금 숫자를 새기고, 돌리는 손잡이(▲▼)는 사진 아래 크게
        const wrap = el('div', 'safe-wrap');
        const door = el('div', 'prop safedoor'); door.innerHTML = `<img src="${P}props/safe.webp" alt="책상 밑 금고 문, 손잡이 옆에 번호 바퀴 네 개" decoding="async">`;
        SAFE_KNOBS.forEach((x, i) => { const k = el('span', 'knob', String(d.dial[i])); k.style.left = x + '%'; k.setAttribute('aria-hidden', 'true'); door.append(k); });
        wrap.append(door, dialRow(el, save, d, 4));
        return wrap;
      },
      commitLabel: '손잡이 내리기',
      check(d) {
        const s = d.dial.join('');
        if (s === SAFE_CODE.join('')) return { ok: true };
        return { ok: false, msg: '손잡이가 안 내려간다' };
      },
      reveal: {
        title: '0407',
        text: '손잡이가 내려갔다 봉투 넷 중 「07-A 분실 · 9/18 보관」 봉투만 비어 있다',
        scene: ['봉투는 손대지 않고 금고 문을 다시 닫아 두었다', '번호 규칙은 인계 문서에 적혀 있다 그 문서를 쓴 사람도, 읽은 사람도 열 수 있다 금고만으로는 사람이 안 나온다'],
        get unlock() { return toReport(); },
        unlockDoc: 'safedoc',
      },
    },

    strips: {
      title: '휴지통의 찢긴 종이',
      scene: 'office',
      intro: '휴지통 맨 위에서 세로로 찢긴 종이 다섯 조각을 꺼냈다 아래 조각을 누르면 왼쪽 빈자리부터 붙고, 붙인 조각을 누르면 떼어진다',
      docs: ['handover'],
      hintCode: 'G-S04',
      hints: [
        '조각마다 다섯 줄씩 글자가 있어요 옆 조각과 붙였을 때 줄마다 말이 되어야 해요',
        '다섯 조각이 다 한 장에서 나온 건 아니에요 종이에 묻은 얼룩도 이어지는지 봐요',
      ],
      initial: () => ({ slots: [null, null, null, null] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'wo-wrap');
        const board = el('div', 'wo-sheet');
        d.slots.forEach((sid, i) => {
          const b = el('button', 'wo-slot' + (sid ? ' filled' : '')); b.type = 'button';
          b.setAttribute('aria-label', `${i + 1}번째 자리${sid ? ' 조각 떼기' : ' (비어 있음)'}`);
          if (sid) b.append(stripNode(el, STRIPS.find((s) => s.id === sid)));
          b.onclick = () => { if (sid) { d.slots[i] = null; save(); } };
          board.append(b);
        });
        wrap.append(board);
        const tray = el('div', 'wo-tray');
        STRIP_TRAY.forEach((sid, k) => {
          const used = d.slots.includes(sid);
          const b = el('button', 'wo-pick' + (used ? ' used' : '')); b.type = 'button'; b.disabled = used;
          b.setAttribute('aria-label', `조각 ${'가나다라마'[k]}${used ? ' (붙였음)' : ' 붙이기'}`);
          b.style.setProperty('--tilt', [-3, 2, -1.5, 3, -2][k] + 'deg');
          b.append(stripNode(el, STRIPS.find((s) => s.id === sid)), el('small', '', '가나다라마'[k]));
          b.onclick = () => { const i = d.slots.indexOf(null); if (i < 0) { ctx.status('네 자리가 다 찼다 붙인 조각을 하나 떼어 낸다'); return; } d.slots[i] = sid; save(); };
          tray.append(b);
        });
        wrap.append(el('p', 'pick-label', '휴지통에서 꺼낸 조각'), tray);
        return wrap;
      },
      commitLabel: '테이프로 붙이기',
      canCommit: (d) => !d.slots.includes(null),
      check(d) {
        if (d.slots.join() === STRIP_ORDER.join()) return { ok: true };
        return { ok: false, msg: '붙여 놓고 읽어 보니 말이 이어지지 않는다' };
      },
      reveal: {
        title: '작업 지시서 · 9/12',
        text: '차량 서연 검은 세단 앞 디스크·패드 교체 고객 통화 하지 말 것 지시 박정호 작업 지수',
        scene: ['종이 끝이 아직 빳빳하다 오늘 새벽 누군가 이걸 찢어 사무실 휴지통 맨 위에 버렸다', '갈아 낸 디스크는 어디 갔을까 폐업 정리 중이라 아직 고물상에 넘기진 않았을 거다'],
        get unlock() { return toReport(); },
        unlockDoc: 'workorder',
      },
    },

    disc: {
      title: '폐부품 카트의 디스크',
      scene: 'shop',
      intro: '카트 옆 바닥에 갈아 낸 앞 브레이크 디스크 셋이 겹쳐 기대 세워져 있다 꼬리표가 철사로 묶여 있다 디스크를 누르면 캘리퍼스로 두께를 물려 본다 서연 차에서 나온 디스크면 잰 두께를 숫자판으로 꼬리표에 적는다',
      docs: ['receipt', 'workorder'],
      hintCode: 'G-S08',
      hints: [
        '서연 차를 언제 무슨 부품을 갈았는지는 지시서에, 차 번호는 앞마당 영수증에 있어요 꼬리표는 한 글자씩 맞춰 봐요',
        '큰 눈금에서 아래 0이 막 지난 숫자가 mm, 작은 눈금 가운데 위 줄과 딱 이어지는 줄 번호가 소수점 아래예요 디스크에 찍힌 MIN 숫자는 잰 값이 아니에요',
      ],
      initial: () => ({ pick: null, val: '' }),
      render(ctx) {
        const { d, el, save } = ctx;
        if (typeof d.val !== 'string') d.val = '';
        const wrap = el('div', 'disc-wrap');
        const row = el('div', 'disc-row');
        DISCS.forEach((x, i) => {
          const b = el('button', 'disc-btn' + (d.pick === x.id ? ' on' : '')); b.type = 'button';
          b.setAttribute('aria-label', `디스크 ${'가나다'[i]} 캘리퍼스로 재기 (꼬리표 ${x.plate} ${x.when})`); b.setAttribute('aria-pressed', String(d.pick === x.id));
          b.innerHTML = `${discSvg(x)}<span class="disc-tag"><b>${x.plate}</b><span>${x.when}</span></span><small>${'가나다'[i]}</small>`;
          b.onclick = () => { d.pick = x.id; save(); };
          row.append(b);
        });
        wrap.append(row);
        const cur = DISCS.find((x) => x.id === d.pick);
        const box = el('div', 'vern-box');
        if (cur) {
          wrap.append(el('p', 'vern-cap', `디스크 ${'가나다'[DISCS.indexOf(cur)]} · 안쪽 테에 찍힌 글자 「MIN TH 25」 · 캘리퍼스 눈금 확대 (mm)`));
          box.innerHTML = vernierSvg(cur.mm);
          // 휴대폰에선 눈금이 상자보다 넓다: 처음엔 아들자 0 조금 앞부터 보이게
          requestAnimationFrame(() => { const sv = box.querySelector('.vern-svg'); if (sv && sv.getBoundingClientRect().width > box.clientWidth + 2) box.scrollLeft = Math.max(0, ((12 + (cur.mm - 2 - 22) * 24) / 360) * sv.getBoundingClientRect().width); });
        } else box.append(el('p', 'vern-cap empty', '디스크를 하나 골라 캘리퍼스를 물린다'));
        wrap.append(box);
        // 숫자판: 꼬리표에 적을 두께
        const tag = el('div', 'disc-write'); tag.append(el('span', '', '꼬리표에 적을 두께'), el('b', 'disc-val', (d.val || '　') + ' mm'));
        wrap.append(tag);
        const pad = el('div', 'disc-pad');
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←'].forEach((k) => {
          const b = el('button', 'ctl', k); b.type = 'button';
          b.setAttribute('aria-label', k === '←' ? '한 자 지우기' : k === '.' ? '소수점 적기' : `${k} 적기`);
          b.onclick = () => {
            if (k === '←') d.val = d.val.slice(0, -1);
            else if (k === '.') { if (!d.val.includes('.') && d.val) d.val += '.'; }
            else if (d.val.replace('.', '').length < 4) d.val += k;
            save();
          };
          pad.append(b);
        });
        wrap.append(pad);
        return wrap;
      },
      commitLabel: '꼬리표에 적어 두기',
      canCommit: (d) => !!d.pick && !!d.val,
      check(d) {
        const v = Number(d.val);
        if (d.pick === DISC_ANSWER.id && Number.isFinite(v) && Math.abs(v - Number(DISC_ANSWER.mm)) < 1e-9) return { ok: true };
        return { ok: false, msg: '꼬리표를 다시 보니 이 기록은 서연 차 디스크 기록이 못 된다' };
      },
      reveal: {
        title: '26.4mm',
        text: '서연 차에서 떼어 낸 앞 디스크 한계 두께 25mm까지 아직 1.4mm 남아 있었다 갈 때가 안 된 디스크다',
        scene: ['꼬리표 뒤에 다른 글씨가 있었다 「버리지 말 것 — 지수」 사진만 남겨 둔 게 아니었다'],
        get unlock() { return toReport(); },
        unlockDoc: 'disc',
      },
    },

    video: {
      title: '민호의 휴대폰 · 면담 녹화',
      scene: 'office',
      intro: '민호가 면담 녹화본을 틀어 놓고 휴대폰을 맡겼다 막대를 끌거나 −5초 +5초로 넘겨 보고, 서연에게 보낼 장면 하나를 캡처한다',
      docs: ['alibi', 'lockerlog'],
      hintCode: 'G-S05',
      hints: [
        '서연이 민호 씨를 의심하는 건 영상이 끊긴 구간 때문이에요 그 구간 앞뒤를 다 봐요',
        '07-A가 정비소 안에 있던 시각은 단말 기록에 있어요 그 시각과 민호 씨가 화면에 보이는 시각을 겹쳐 봐요',
      ],
      initial: () => ({ k: 0 }),
      render(ctx) {
        const { d, el, save } = ctx;
        if (typeof d.k !== 'number') d.k = 0;
        const wrap = el('div', 'vid-wrap');
        const scr = el('div', 'vid-holder'); scr.innerHTML = videoFrame(vAt(d.k));
        const lab = el('p', 'pick-label vid-time', `녹화 ${fmt(vAt(d.k))} (서버 시각)`);
        const r = el('input'); r.type = 'range'; r.min = '0'; r.max = String(VMAX); r.step = '1'; r.value = String(d.k); r.className = 'vid-range'; r.setAttribute('aria-label', '면담 녹화 시각');
        r.oninput = () => { d.k = Number(r.value); scr.innerHTML = videoFrame(vAt(d.k)); lab.textContent = `녹화 ${fmt(vAt(d.k))} (서버 시각)`; };
        r.onchange = () => save();
        const row = el('div', 'sync-row');
        [[-1, '−5초'], [1, '+5초']].forEach(([v, t]) => { const b = el('button', 'ctl', t); b.type = 'button'; b.setAttribute('aria-label', `녹화 ${t}`); b.onclick = () => { d.k = Math.max(0, Math.min(VMAX, d.k + v)); save(); }; row.append(b); });
        const ends = el('div', 'vid-ends'); ends.append(el('span', '', '21:44:12'), el('span', '', '21:50:48'));
        wrap.append(scr, r, ends, row, lab);
        return wrap;
      },
      commitLabel: '이 장면 캡처해서 서연에게 보내기',
      check(d) {
        const t = vAt(d.k);
        if (t >= GAP[1] && t > IN07[0] && t < IN07[1]) return { ok: true };
        return { ok: false, msg: '서연: "이 장면으로는 민호 씨가 아니라고 못 하겠어요"' };
      },
      reveal: {
        title: '차 안의 강민호',
        text: '영상은 21:47:34에 돌아왔다 그때부터 민호는 줄곧 차 안 화면에 있었고, 07-A는 21:48:20까지 정비소 안에 있었다',
        scene: ['서연: "그럼 민호 씨는 아니네요 끊긴 1분 반은 그냥 끊긴 거고요"', '휴대폰을 돌려주자 민호가 작게 말했다 "인계 문서에 금고 번호 정하는 법 적은 거 저예요 그거 때문에 저도 의심받을 줄 알았어요"'],
        get unlock() { return toReport(); },
      },
    },

    jackets: {
      title: '걸려 있는 재킷 세 벌',
      scene: 'office',
      intro: '재킷을 누르면 칼라 안쪽 이름표와 소매, 안주머니가 보인다 블랙박스에 찍힌 재킷을 고른다',
      docs: ['people'],
      hintCode: 'G-S06',
      hints: [
        '블박 화면에서 그 재킷만의 특징이 있었어요 프레임을 확대해 봐요',
        '걸린 재킷 셋의 소매를 하나씩 봐요 칼라 이름표는 누구 옷인지만 알려 줘요',
      ],
      initial: () => ({ open: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'jackets-wrap');
        const img = el('div', 'prop jacketsimg'); img.innerHTML = `<img src="${P}props/jackets.webp" alt="재킷 세 벌" decoding="async">`;
        // jackets.webp에서 잰 재킷 세 벌의 실제 가로 자리 (152~387 · 412~636 · 675~875px / 1024) 에 여유 1%씩
        const xs = [[13.8, 25], [39.3, 23.8], [64.9, 21.6]];
        JACKETS.forEach((j, i) => {
          const b = el('button', 'jacket-btn' + (d.open === j.id ? ' picking' : '')); b.type = 'button'; b.style.left = xs[i][0] + '%'; b.style.width = xs[i][1] + '%';
          b.setAttribute('aria-label', `${j.name} 칼라 보기`); b.onclick = () => { d.open = d.open === j.id ? null : j.id; save(); };
          img.append(b);
        });
        wrap.append(img);
        const chips = el('div', 'pick-row mobile-only');
        JACKETS.forEach((j) => { const c = el('button', 'chip' + (d.open === j.id ? ' on' : ''), j.name); c.type = 'button'; c.setAttribute('aria-label', `${j.name} 들춰 보기`); c.onclick = () => { d.open = j.id; save(); }; chips.append(c); });
        wrap.append(chips);
        const info = el('div', 'collar-info');
        if (d.open) { const j = JACKETS.find((x) => x.id === d.open); info.append(el('div', 'collar-tag', `칼라 이름표: ${j.tag}`), el('p', 'pick-label', j.note)); }
        else info.append(el('p', 'pick-label', '재킷을 누르면 칼라 안쪽이 보인다'));
        wrap.append(info);
        return wrap;
      },
      commitLabel: '이 재킷이 블랙박스의 재킷이다',
      canCommit: (d) => !!d.open,
      check(d) {
        if (d.open === 'stripe') return { ok: true };
        return { ok: false, msg: '블랙박스의 재킷과 다르다' };
      },
      reveal: {
        title: '소매의 반사띠',
        text: '소매에 반사띠가 붙은 회색 재킷 칼라 이름표는 박정호 안주머니는 비어 있다',
        scene: ['이름표만으로는 약하다 남의 재킷을 걸쳐 입을 수도 있으니까 이 재킷이 블랙박스에 또 찍혔다면, 그때 서버에 누구 카드가 찍혔는지가 답이다'],
        get unlock() { return toReport(); },
      },
    },

    report: {
      title: '서연에게 보고',
      scene: 'yard',
      intro: '서연에게 보낼 보고서 칸마다 맞는 것을 누른다 ③은 해당하는 것을 모두 누른다 하나라도 틀리면 서연은 경찰을 못 부른다',
      docs: ['lockerlog', 'safedoc', 'server', 'workorder', 'disc'],
      hintCode: 'G-S07',
      hints: [
        '카드는 단말 기록과 분실 신고서, 금고 봉투를 이어서 봐요 이유는 휴지통에서 나왔죠',
        '띠 두른 재킷이 나온 블박 장면을 전부 서버 시각으로 옮겨 봐요 잠기지 않은 줄에 찍힌 카드가 있어요',
      ],
      initial: () => ({ pick: {} }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'report-wrap');
        REPORT.forEach((q) => {
          const box = el('div', 'gift-row'); box.append(el('span', 'gift-name', q.label));
          const row = el('div', 'pick-row');
          q.opts.forEach(([id, label]) => {
            const on = q.multi ? (d.pick[q.id] || []).includes(id) : d.pick[q.id] === id;
            const b = el('button', 'chip' + (q.multi ? ' multi' : '') + (on ? ' on' : ''), label); b.type = 'button'; b.setAttribute('aria-label', `${q.label}: ${label}`); b.setAttribute('aria-pressed', String(on));
            b.onclick = () => { if (q.multi) { const a = d.pick[q.id] || []; d.pick[q.id] = a.includes(id) ? a.filter((x) => x !== id) : [...a, id]; } else d.pick[q.id] = id; save(); };
            row.append(b);
          });
          box.append(row); wrap.append(box);
        });
        return wrap;
      },
      commitLabel: '보고 보내기',
      check(d) {
        const empty = REPORT.filter((q) => (q.multi ? !(d.pick[q.id] || []).length : !d.pick[q.id]));
        if (empty.length) return { ok: false, msg: '보고서에 빈 칸이 있다' };
        const same = (q) => (q.multi ? [...(d.pick[q.id] || [])].sort().join() === [...q.ans].sort().join() : d.pick[q.id] === q.ans);
        if (REPORT.every(same)) return { ok: true };
        return { ok: false, msg: '서연: "확실해요? 하나라도 틀리면 경찰 못 불러요 다시 봐 주세요"' };
      },
      reveal: {
        title: '보고 완료',
        text: '서연이 답장을 보냈다 「경찰 불렀어요 금방 온대요 저도 지금 가요」',
        scene: ['사장은 셔터 앞 상자에 앉아 고개를 숙이고 있었다 회색 작업복 차림 그대로였다 휴게실 문이 열리고 지수가 나왔다'],
        ending: true,
        endingLabel: '열 시, 셔터가 내려간다',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '비 그친 아침, 정비소 앞에서 SD카드를 든 서연과 상자에 앉은 사장',
    eyebrow: '9월 19일, 오전 열 시',
    title: '마지막 정비소',
    paragraphs: [
      '경찰은 사장 차 글로브박스에서 SD카드와 07-A 출입 카드를 같이 꺼냈다 사장은 21:40에 나가기 전 금고에서 07-A를 꺼내 주머니에 넣었다 이관 작업으로 기록이 잠기는 21:45를 넘겨 측문으로 들어가 슬롯에서 카드를 빼고 나왔다 혹시 잠긴 줄이 풀려도 거기 찍히는 건 지수가 잃어버린 카드였다 22:00에 09로 다시 들어가 "없어졌다"고 했다',
      '"교체는 내가 시켰어요 아직 쓸 만한 디스크였는데" 사장이 말했다 "인수 쪽에 그 사진이 지시서랑 같이 넘어가면 계약이 깨져요 지수한테 뒤집어씌울 생각까진 없었는데 말이 그렇게 나가더라고" 내가 작업장 단말을 보는 사이 사무실에 들어가 재킷을 만진 것도 사장이었다 띠가 안 보이게 돌려 걸려다 단말 우는 소리에 그만뒀다고 했다',
      '지수가 사장 앞에 섰다 "그 사진 저도 찍기 싫었어요 근데 안 찍어 두면 나중에 제가 한 걸로 될 것 같았어요"',
      '민호는 인계 문서 메모 줄에 두 줄을 긋고 다시 썼다 「교체 지시 박정호 사진은 고객에게 반환」',
      '서연은 SD카드를 받아 들고 한참 보더니 주머니에 넣었다 "이 정비소, 내일부터는 없는 거죠"',
      '열 시에 셔터가 끝까지 내려갔다 블랙박스는 그때도 7분 빠른 시각을 찍고 있었다',
    ],
    afterword: '정비소에서는 끝내 아무도 블랙박스 시계를 고치지 않았다 서연이 그날 저녁 집 앞에서 직접 맞췄다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=radio', title: '끝나지 않은 방송', line: '다음은 꺼진 마이크의 새벽 두 시 이야기입니다' },
  },
};
