// 404호의 불빛 — ★4 안내 없음, 힌트 3단계, 함정 여럿 이야기·자료·장치가 전부 이 파일에 있습니다
// 핵심 통찰: 둑길(뒤편)에서 찍은 사진은 좌우가 뒤집히고, 뒤편은 땅이 낮아 반지하 창이 한 줄 더 보인다
// v125: 장치 다섯 (우편함 → 열쇠함 → 상자 자물쇠 → 엉킨 연장선 → 타이머 핀) · 무서운 순간 셋(관리실 모니터 · 안방 불 · 새 댓글)은 엔딩에서 다 풀린다
// 최종 점검: 장치 여섯 — 상자를 연 뒤 '뒤편 반지하 철문'(손전등으로 흔적 찾기 → 맨 오른쪽 B01, 락카 1 함정)에서 2009년 가계부를 꺼내야 타이머 핀이 열린다
const P = 'assets/v2/apartment/';
const KEY = 'mihaeje-v2-apartment';

// ---------- 장면 안에서 시간이 흐르는 일 (엔진은 모름: 이 파일 안에서만 처리) ----------
const cur = () => { try { return window.MihaejeV2?.state || JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; } };
const ev = (S, k) => !!(S && S.ev && S.ev[k]);
// 벤치 위 내 휴대폰: 작업 지시를 읽고 건물로 들어간 뒤엔 주머니에 있다 (안 읽었으면 그 자리에 남겨 둔다)
const phoneOnBench = (S) => !(S.solved || []).includes('mailbox') || !(S.read || []).includes('order');
const store = (S) => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const click = () => { try { if (localStorage.getItem('mihaeje-v2-sound') === '0') return; const a = new Audio('assets/sounds/switch-on-v24.wav'); a.volume = 0.7; a.play().catch(() => {}); } catch {} };
// 아래 대사창에 새 문장을 띄운다 (엔진의 대사창을 그대로 쓴다)
function say(text) {
  const stage = document.querySelector('.v2-stage'); const talk = stage?.querySelector('.v2-talk'); if (!talk) return;
  const line = talk.querySelector('.v2-talk-line');
  line.replaceChildren(...[...text].map((ch, i) => { const s = document.createElement('span'); s.textContent = ch; s.style.animationDelay = (i * 28) + 'ms'; return s; }));
  talk.classList.remove('gone', 'typed');
  const open = stage.querySelector('.v2-talk-open'); if (open) open.hidden = true;
  setTimeout(() => talk.classList.add('typed'), text.length * 28 + 300);
}
const pending = {};
// 그 장면에 ms 동안 머물러 있으면 한 번 일어나는 일 창이 열려 있으면 닫힐 때까지 기다린다
function soon(name, scene, ms, run) {
  if (pending[name] || ev(cur(), name)) return;
  const tick = () => {
    const S = window.MihaejeV2?.state; const stage = document.querySelector('.v2-stage');
    if (!S || S.screen !== 'play' || !stage || stage.dataset.scene !== scene) { pending[name] = null; return; }
    if (document.querySelector('dialog[open]') || stage.classList.contains('zoomed')) { pending[name] = setTimeout(tick, 1500); return; }
    pending[name] = null; S.ev = S.ev || {}; if (S.ev[name]) return; S.ev[name] = true; store(S); run(stage, S);
  };
  pending[name] = setTimeout(tick, ms);
}

// 기다리지 않고 장치를 먼저 풀어도 이 장면들은 꼭 한 번 보게 된다 (장치를 푸는 순간 일어난다) 엔딩이 이걸 다시 꺼낸다
const CCTV_LINE = '모니터가 지지직 넘어갔다 CH2 둑길 가로등 아까 내가 서 있던 그 벤치에 누가 앉아 있다 이쪽 건물을 보고';
const ANBANG_LINE = '딸깍 안방에서 소리가 났다 문 너머가 노랗게 밝아졌다 단전된 집이다 안에는 아무도 없다';
const COMMENT_LINE = '주머니 속 휴대폰이 짧게 떨렸다 아까 그 커뮤니티 글에 새 댓글 산책러2 「지금 3층에 누가 서 있음 손전등 든 사람」';
const fire = (S, k) => { S.ev = S.ev || {}; if (S.ev[k]) return false; S.ev[k] = true; S.ev[k + 'Late'] = true; return true; };

// ---------- 마구 눌러 보기 막기: 두 번까지는 그냥, 그다음부터 틀릴 때마다 기다리는 시간이 늘어난다 ----------
const WAIT = [0, 0, 0, 15, 25, 40]; // 틀린 횟수 → 기다리는 초
const miss = (d) => { d.miss = (d.miss || 0) + 1; const s = WAIT[Math.min(d.miss, WAIT.length - 1)]; d.until = s ? Date.now() + s * 1000 : 0; };
const waiting = (d) => Math.max(0, Math.ceil(((d.until || 0) - Date.now()) / 1000));
// 기다리는 동안 장치 안에 남은 초를 보여 주고, 끝나면 다시 그린다 (확인 버튼은 canCommit 으로 숨김)
function waitLine(ctx, text) {
  if (!waiting(ctx.d)) return null;
  const p = ctx.el('p', 'apt-wait', `${text} · ${waiting(ctx.d)}초`);
  const t = setInterval(() => {
    if (!p.isConnected) { clearInterval(t); return; }
    const n = waiting(ctx.d);
    if (n <= 0) { clearInterval(t); ctx.save(); return; }
    p.textContent = `${text} · ${n}초`;
  }, 400);
  return p;
}

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

// 커뮤니티 글 사진 넷: 둑길 장면 그림(bank)을 그대로 잘라 만든 같은 건물 (12열 · 5층 + 반지하 창 한 줄)
// 301호는 뒤에서 보면 맨 오른쪽 창 셋, 아래에서 넷째 줄(반지하 포함) = 3층
// 뒤에서 본 301 창 순서(왼→오): 안방 · 거실 · 작은방 (켜진 창은 엔딩 그림에서 그대로 옮김)
// 지금(틀린) 프로그램: 작은방 21:00 → 안방 21:30 → 거실 22:00 → 23:00 전부 끔
const FRAMES = [
  { t: '21:00', img: 'rear-1', n: 1 },
  { t: '21:30', img: 'rear-2', n: 2 },
  { t: '22:00', img: 'rear-3', n: 3 },
  { t: '23:00', img: 'rear-0', n: 0 },
];
const rearPhoto = (f) => `<figure class="prop rearphoto"><button type="button" class="apt-zoom-btn" data-cap="${f.t}" aria-label="${f.t} 사진 크게 보기"><img src="${P}props/${f.img}.webp" alt="둑길에서 찍은 미루연립 A동 뒤편 사진 · 불 켜진 창 ${f.n}개" decoding="async"><span class="apt-zoom-tip" aria-hidden="true">크게 보기</span></button><figcaption>${f.t}</figcaption></figure>`;
// 커뮤니티 사진은 휴대폰에서 창 한 칸이 10px 남짓이라 눌러서 화면 가득(세로 화면은 옆으로 눕혀) 크게 본다 — 열린 자료 창(dialog) 안에 덮개를 붙여야 맨 위에 보인다
if (typeof document !== 'undefined' && !window.__aptZoom) {
  window.__aptZoom = true;
  document.addEventListener('click', (e) => {
    const b = e.target.closest?.('.apt-zoom-btn'); if (!b || !document.documentElement.matches('[data-case="apartment"]')) return;
    const img = b.querySelector('img'); if (!img) return;
    const cover = document.createElement('button'); cover.type = 'button'; cover.className = 'apt-zoom'; cover.setAttribute('aria-label', '크게 본 사진 닫기');
    const big = document.createElement('img'); big.src = img.currentSrc || img.src; big.alt = img.alt;
    const cap = document.createElement('span'); cap.className = 'apt-zoom-cap'; cap.textContent = (b.dataset.cap || '') + ' · 누르면 닫힘';
    cover.append(big, cap);
    cover.onclick = (ev) => { ev.stopPropagation(); cover.remove(); b.focus?.(); };
    (b.closest('dialog') || document.body).append(cover); cover.focus();
  });
}

// 우편함: 현관 사진 속 그 우편함을 반듯하게 편 것 6칸 × 5줄 (왼쪽 네 칸이 01~04호, 위 줄이 5층)
// 문짝 테두리(그림에서 잰 값): 가운데 x · 폭 · 가운데 y (높이 17.8%)
const MAIL_X = [10.0, 28.2, 45.9, 63.05, 78.15, 92.1];
const MAIL_W = [16.0, 16.4, 16.2, 15.5, 11.7, 14.2];
const MAIL_Y = [9.2, 28.9, 49.5, 69.7, 89.9];
// 문짝마다 붙은 이름표 받침(금속 판)의 가운데 — 원근 때문에 줄마다 오른쪽이 조금 낮다
const PLATE_X = [10.45, 28.43, 46.2, 63.3, 78.25, 92.0];
const PLATE_Y = [[7.95, 8.6, 9.4, 10.0, 10.0, 10.9], [27.4, 27.7, 28.25, 28.65, 28.7, 29.0], [47.7, 48.0, 48.45, 48.6, 48.7, 48.5], [68.25, 68.25, 68.35, 68.55, 68.6, 68.65], [88.45, 88.65, 88.55, 88.55, 88.4, 88.6]];
const MAILROWS = [5, 4, 3, 2, 1].map((f, r) => [1, 2, 3, 4].map((u) => `${f}0${u}`).concat([['관리실', '신문'], ['반송', '우유'], ['공용', '공사 안내'], ['전단지', '택배 메모'], ['경비', '—']][r]));
const MAIL_ANSWER = '301';
// 열쇠함 6줄 × 4칸
const HOOKROWS = [['501', '502', '503', '504'], ['401', '402', '403', '404'], ['301', '302', '303', '304'], ['201', '202', '203', '204'], ['101', '102', '103', '104'], ['B01', 'B02', 'B03', 'B04']];
const HOOK_X = [31.25, 43.75, 56.25, 68.75], HOOK_Y = [8.0, 23.0, 38.1, 52.8, 67.2, 81.8];
const HOOK_ANSWER = 'B01'; // 2023년 물난리 뒤 3층 두 분 창고를 맞바꿈 → 김순자 할머니 창고는 B01
// 관리인이 집 안 스위치 여섯에 다 번호 테이프를 붙였다 창이 북쪽(둑길 쪽)으로 난 방은 안방 · 작은방 · 거실 셋뿐
const SWITCHES = [['1', '현관'], ['2', '안방'], ['3', '부엌'], ['4', '작은방'], ['5', '거실'], ['6', '욕실']];
const BOX_CODE = [4, 2, 5]; // 작은방 → 안방 → 거실 (뒤집지 않고 읽으면 245)
// 엉킨 연장선: 타이머(왼·가운데·오른쪽) → 선 끝 테이프 번호 (스위치 테이프와 같은 번호 2 안방 · 4 작은방 · 5 거실)
// 자물쇠 번호(425)와 같은 줄이 되지 않게: 왼쪽 거실 · 가운데 안방 · 오른쪽 작은방 = 5 2 4
const WIRE_ANSWER = { L: '5', M: '2', R: '4' };
const WIRE_TAPES = ['2', '4', '5'];
const TIMER_NAME = { L: '왼쪽 검은 타이머', M: '가운데 파란 타이머', R: '오른쪽 검은 타이머' };
// 타이머 핀: 30분짜리 핀 일곱 개 (20:30 ~ 23:30에 시작하는 칸)
const PINS = ['20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
const PIN_START = { L: ['22:00', '22:30'], M: ['21:30', '22:00', '22:30'], R: ['21:00', '21:30', '22:00', '22:30'] }; // 지금 = 할머니가 틀렸다는 순서 (작은방 → 안방 → 거실)
const PIN_ANSWER = { L: ['21:00', '21:30', '22:00', '22:30'], M: ['22:30'], R: ['21:30', '22:00', '22:30'] }; // 거실 · 작은방 · 안방
const PIN_2015 = { L: [], M: ['21:00', '21:30'], R: [] };
const pinKey = (p) => ['L', 'M', 'R'].map((k) => [...(p[k] || [])].sort().join(',')).join('|');

function sectionSvg() {
  const ink = '#2b3340';
  // 글자 크기는 style 로 (공통 CSS 의 휴대폰 .section-svg text 규칙이 속성 크기를 덮지 않게)
  const tx = (x, y, s, t, a = 'middle') => `<text x="${x}" y="${y}" style="font-size:${s}px" text-anchor="${a}" fill="${ink}" font-family="SUIT, sans-serif">${t}</text>`;
  // 휴대폰 폭(340px 남짓)에서도 글자가 15px 넘게 보이도록 그림을 좁게(가로 100) 잡고 길 이름은 두 줄로
  return `<svg viewBox="0 0 100 84" class="section-svg" role="img" aria-label="A동 단면도: 정문 쪽은 길과 1층 바닥이 같고, 미루천 쪽 뒤편은 땅이 한 층 낮아 반지하가 드러난다">
  ${tx(50, 7, 4.4, 'A동 단면 (철거 안내판 부분)')}
  <path d="M1 54 H30" fill="none" stroke="${ink}" stroke-width=".6"/>
  <path d="M62 67 H99" fill="none" stroke="${ink}" stroke-width=".6"/>
  ${[1, 2, 3, 4, 5].map((f) => `<rect x="30" y="${54 - f * 8}" width="32" height="8" fill="#fbfaf4" stroke="${ink}" stroke-width=".6"/>`).join('')}
  <rect x="30" y="54" width="32" height="13" fill="#e9e3d2" stroke="${ink}" stroke-width=".6"/>
  ${[1, 2, 3, 4, 5].map((f) => tx(46, 54 - (f - 1) * 8 - 2.6, 4.4, f + '층')).join('')}${tx(46, 62, 4.4, '반지하 창고')}
  <rect x="62" y="57.5" width="2.8" height="5.5" fill="#9fb6c8" stroke="${ink}" stroke-width=".35"/>
  ${tx(15, 45.5, 4.6, '정문')}${tx(15, 51, 4.6, '미루새길')}
  ${tx(81.5, 58.5, 4.6, '뒤편')}${tx(81.5, 64, 4.6, '둑길 쪽')}${tx(81.5, 75, 4.2, '미루천')}
  <path d="M71 79.5 q3.5 -2.2 7 0 t7 0 t7 0" fill="none" stroke="#5b86b0" stroke-width=".6"/>
  </svg>`;
}
function planSvg() {
  const ink = '#2b3340';
  const tx = (x, y, s, t) => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" fill="${ink}" font-family="SUIT, sans-serif">${t}</text>`;
  return `<svg viewBox="0 0 100 74" class="plan-svg" role="img" aria-label="301호 대피 안내도: 현관에서 들어서 북쪽 벽을 보면 왼쪽부터 작은방, 거실, 안방 창">
  <rect x="8" y="10" width="84" height="48" fill="#fbfaf4" stroke="${ink}" stroke-width="1"/>
  <path d="M36 10 V40 M64 10 V40 M8 40 H92" stroke="${ink}" stroke-width=".6"/>
  ${tx(22, 27, 3.4, '작은방')}${tx(50, 27, 3.4, '거실')}${tx(78, 27, 3.4, '안방')}${tx(30, 51, 3, '욕실')}${tx(70, 51, 3, '부엌')}
  <path d="M16 10 h12 M44 10 h12 M72 10 h12" stroke="#5b86b0" stroke-width="2.2"/>
  ${tx(50, 6.5, 2.8, '창 (북쪽 · 미루천)')}
  <path d="M48 58 h8" stroke="#c0362a" stroke-width="2"/><circle cx="52" cy="60.4" r=".9" fill="#c0362a"/>${tx(52, 66, 2.8, '현관 · 지금 여기')}
  ${tx(50, 72, 2.8, '301호 · 비상시 현관으로 대피')}
  </svg>`;
}
// 열쇠 그림 (손에 든 것)
const keySvg = (n) => `<svg viewBox="0 0 ${n * 46 + 10} 90" class="ring-svg" aria-hidden="true"><circle cx="${n * 23 + 5}" cy="14" r="10" fill="none" stroke="#8a8a8a" stroke-width="3"/>${Array.from({ length: n }, (_, i) => { const x = 10 + i * 46; const c = i ? '#b9bcc0' : '#c9a24e'; return `<g transform="translate(${x} 22) rotate(${i ? 8 : -8} 18 0)"><circle cx="18" cy="12" r="11" fill="${c}"/><circle cx="18" cy="12" r="4" fill="#20232a"/><rect x="15" y="20" width="7" height="40" fill="${c}"/><path d="M22 44 h7 v4 h-4 v4 h5 v5 h-8z" fill="${c}"/></g>`; }).join('')}</svg>`;
// 엉킨 연장선 세 가닥 (위: timers.webp 를 y 165~476 만 잘라 보인다 — 사진 아래 끝에서 플러그 선이 나오는 자리 24.3% · 52% · 78.3% 에서 이어진다 · 아래: 선 끝 테이프)
const WIRES = [
  { from: 'L', d: 'M243 0 C243 110 690 70 640 190 S170 250 300 360 S880 400 800 560' },
  { from: 'M', d: 'M520 0 C520 90 880 150 770 255 S280 290 430 420 S150 450 200 560' },
  { from: 'R', d: 'M783 0 C783 130 300 110 250 225 S720 320 610 420 S440 500 500 560' },
];
const wireSvg = () => `<svg viewBox="0 0 1000 600" class="wire-svg" role="img" aria-label="타이머 셋에서 나온 검은 연장선 세 가닥이 엉켜 아래로 내려간다 선 끝마다 테이프가 붙어 있다">
  ${WIRES.map((w) => `<path d="${w.d}" fill="none" stroke="#d9cfb9" stroke-width="28" stroke-linecap="round"/><path d="${w.d}" fill="none" stroke="#17181b" stroke-width="11" stroke-linecap="round"/>`).join('')}
  ${[['2', 200], ['4', 500], ['5', 800]].map(([n, x]) => `<rect x="${x - 54}" y="526" width="108" height="72" rx="3" fill="#efe2b8" transform="rotate(-3 ${x} 562)"/><text x="${x}" y="585" font-size="62" text-anchor="middle" fill="#2b3570" font-family="MihaejeHand, sans-serif">${n}</text>`).join('')}
</svg>`;

// 뒤편 반지하 철문 넷 (뒤에서 본 왼→오 = B04 · B03 · B02 · B01) 철거 업체 락카 번호는 뒤에서 왼쪽부터 1 2 3 4 (함정)
// 흔적: B04 관리실 공구 창고 = 이 문만 새 황동 자물쇠 · B03 = 23년 장마 물 자국 (cellar.webp 1024×461 에서 잰 문 가운데·폭)
const CELLAR_X = [18.55, 40.04, 61.33, 83.1], CELLAR_W = 15.5;
const CELLAR_ANSWER = 3;
const CELLAR_NAME = ['왼쪽 첫째 철문', '왼쪽 둘째 철문', '왼쪽 셋째 철문', '맨 오른쪽 철문'];
const CELLAR_SEEN = [
  '왼쪽 첫째 철문 · 빨간 락카 1 · 이 문만 고리에 새 황동 자물쇠, 빈 판지 꼬리표',
  '왼쪽 둘째 철문 · 빨간 락카 2 · 아래쪽 무릎 높이까지 누런 물 자국',
  '왼쪽 셋째 철문 · 빨간 락카 3 · 온통 녹 말고는 아무 표시 없다',
  '맨 오른쪽 철문 · 빨간 락카 4 · 녹 말고는 아무 표시 없다',
];
export default {
  id: 'apartment',
  number: '002',
  title: '404호의 불빛',
  subtitle: '사흘 뒤 헐리는 집',
  genre: '도시괴담 · 공간 추리',
  minutes: 50,
  difficulty: 4,
  mood: 'horror',
  cover: P + 'bank.webp',
  coverAlt: '둑길 건너 불 꺼진 연립 뒤편, 창 하나만 노랗게 켜져 있다',
  music: 'assets/music/apartment-v33.mp3',
  tagline: '단전된 지 3주 된 건물\n밤 아홉 시면 창이 하나씩 켜진다',
  blurb: '철거를 사흘 앞둔 미루연립 A동\n전기가 끊긴 지 3주인데 밤마다 창이 차례로 켜진다는 민원이 들어왔습니다 동네에선 404호 귀신이라고 부릅니다',
  storageKey: KEY,
  hintTitle: '점검 수첩',
  tracesLabel: '불빛을 따라간 것',

  opening: {
    eyebrow: '2026/10/23 금요일 · 밤 8시 50분',
    paragraphs: [
      '철거 전 마지막 전기 점검이 내 일이다. 미루연립 A동은 이달 1일에 전기가 끊겼고, 월요일 아침이면 포클레인이 들어온다.',
      '그런데 지난주부터 민원이 세 건이다. 밤 아홉 시가 넘으면 빈 건물 창이 하나씩 켜졌다 꺼진다고. 동네 커뮤니티에는 벌써 「404호 귀신」이라는 글이 올라와 있었다.',
      '팀장은 짧게 말했다. 「귀신이든 도둑이든 전선이든, 월요일 전에 원인 찾아서 끊어.」 나는 둑길 가로등 아래 서서 개울 건너 건물 뒤편을 봤다. 창은 전부 까맸다.',
      '아홉 시 정각, 오른쪽 끝 창 하나가 딸깍, 하고 노랗게 켜졌다. 건너편에는 아무도 없어야 했다.',
    ],
    cta: '둑길에서 건물 보기',
  },

  traces: [
    { device: 'mailbox', label: '그 집 우편함' },
    { device: 'hooks', label: '그 집 열쇠' },
    { device: 'box', label: '싱크대 밑 상자' },
    { device: 'wires', label: '엉킨 선' },
    { device: 'cellar', label: '뒤편 창고' },
    { device: 'timers', label: '불 켜는 순서' },
  ],

  scenes: [
    {
      id: 'bank',
      focusX: 76,
      name: '미루천 둑길',
      image: P + 'bank.webp',
      arrive: (S) => {
        // 상자를 열고 창고 얘기를 읽은 뒤: 개울 건너 반지하 철문 쪽으로 내려갈 수 있다
        const cellar = S.solved.includes('box') && !S.solved.includes('cellar') ? ' 개울 건너 건물 맨 아래, 반지하 철문들은 가로등 빛이 안 닿아 새까맣다' : '';
        if (S.solved.includes('wires')) return '3층 그 집 창 셋이 다 켜져 있다 열 시다 벤치 위 종이컵은 이제 식었다' + cellar;
        if (ev(S, 'anbang')) return '3층 그 집 창이 하나 더 켜져 있다 벤치는 비어 있는데 그 위에 종이컵 하나 김이 아직 오른다 아까는 없었다' + cellar;
        return (phoneOnBench(S) ? '가로등 아래 벤치엔 아까 올려 둔 내 휴대폰뿐' : '가로등 아래 벤치는 비어 있다') + ' 개울 건너 A동 뒤편 벽에 빨간 락카로 커다란 X 표 창은 다 까만데 오른쪽 끝 창 하나만 노랗다 가로등 기둥엔 철거 안내판이 묶여 있다';
      },
      get overlays() {
        const S = cur();
        const o = [
          // 가로등 기둥(그림 x 10.1~10.8%)에 묶인 안내판 (기둥의 원래 전기함 y 53~58% 위)
          { x: 8.55, y: 41.5, w: 3.8, h: 8.2, cls: 'apt-sign', html: '<i></i>' },
          // 3층(가운데 줄) 맨 오른쪽 창 셋 = 301 (밖에서 왼→오: 안방 · 거실 · 작은방) 작은방(맨 오른쪽)은 그림에 처음부터 켜져 있다
          // 패치는 켜진 유리(그림 픽셀 안방 757~798×225~251 · 거실 824~869×222~249) + 그 아래 개울의 노란 반사 줄기, 나머지는 투명 (1024×688 그림 픽셀 744,220 / 812,218 에서 자름)
          { x: 72.656, y: 31.977, w: 6.641, h: 63.953, cls: 'apt-win' + (ev(S, 'anbang') ? ' on' : ''), html: `<img src="${P}props/bank-anbang.webp" alt="">` },
          { x: 79.297, y: 31.686, w: 6.836, h: 64.244, cls: 'apt-win' + ((S.solved || []).includes('wires') ? ' on' : ''), html: `<img src="${P}props/bank-living.webp" alt="">` },
          // 벤치 등받이 윗단(x 15.5% y 75.7% → x 37.5% y 81.3%로 기울어짐) 위에 올려 둔 내 휴대폰 (작업 지시·커뮤니티 글을 보던 것)
          ...(phoneOnBench(S) ? [{ x: 19.6, y: 75.8, w: 3.0, h: 1.3, cls: 'apt-phone', html: '<i></i>' }] : []),
        ];
        if (ev(S, 'anbang')) o.push({ x: 29.0, y: 73.0, w: 2.2, h: 6, cls: 'apt-cup' + ((S.solved || []).includes('wires') ? ' cold' : ''), html: '<i></i><b></b>' });
        return o;
      },
      hotspots: [
        // 휴대폰(벤치 위)에는 팀장 카톡, 불 켜진 3층 창에는 그 창을 찍은 커뮤니티 글 — 둘 다 그림에 있는 물건 위
        { id: 'order', x: 21.1, y: 76.6, r: 9, label: '벤치 위 휴대폰 · 작업 지시', kind: 'doc', doc: 'order', visible: phoneOnBench },
        { id: 'post', x: 85.5, y: 34.4, r: 10, label: '불 켜진 창 · 동네 커뮤니티 글', kind: 'doc', doc: 'post' },
        { id: 'section', x: 10.45, y: 45.6, label: '둑길의 철거 안내판', kind: 'doc', doc: 'section' },
        { id: 'go', x: 40, y: 52, r: 13, label: '건물 정문으로', kind: 'travel', to: 'entrance' },
        // 건물 맨 아래 반지하 줄(그림 y 57~60%) — 철문 넷은 장치 안에서 손전등으로 본다
        { id: 'cellar', x: 70, y: 58.5, r: 9, label: '건물 뒤편 반지하 철문', kind: 'device', device: 'cellar', visible: (S) => S.solved.includes('box') },
      ],
    },
    {
      id: 'entrance',
      focusX: 27,
      name: 'A동 현관',
      image: P + 'entrance.webp',
      arrive: (S) => {
        if (S.solved.includes('hooks')) return '현관 형광등이 깜빡인다 열쇠 두 개가 주머니에서 짤랑거린다 계단 위 3층이 그 집이다';
        if (S.solved.includes('mailbox')) return '301 칸에서 꺼낸 고지서를 쥐고 섰다 관리실 유리창 안 스탠드는 아직 켜져 있다 문은 닫혀 있지만 잠기진 않았다';
        return '정문으로 돌아 들어왔다 형광등은 비상 배터리로 겨우 버틴다 왼쪽 벽에 우편함 서른 칸, 맞은편 관리실 유리창 안에 스탠드가 켜져 있다 전기가 없는 건물인데';
      },
      overlays: [{ x: 9.6, y: 14.4, w: 11.2, h: 5.4, cls: 'apt-plate', html: '<i></i>' }],
      hotspots: [
        { id: 'plate', x: 15.2, y: 17, label: '우편함 위 호수 안내', kind: 'doc', doc: 'plate' },
        { id: 'board', x: 40, y: 40, r: 14, label: '게시판의 이주 현황', kind: 'doc', doc: 'board' },
        { id: 'mailbox', x: 16, y: 50, r: 18, label: '우편함', kind: 'device', device: 'mailbox' },
        { id: 'toOffice', x: 71.5, y: 50, r: 12, label: '관리실 문', kind: 'travel', to: 'office', visible: (S) => S.solved.includes('mailbox') },
        { id: 'stairs', x: 92, y: 66, r: 10, label: '3층으로 계단', kind: 'travel', to: 'unit', visible: (S) => S.solved.includes('hooks') },
        { id: 'back', x: 92, y: 40, r: 14, label: '둑길로', kind: 'travel', to: 'bank' },
      ],
    },
    {
      id: 'office',
      name: '관리실',
      image: P + 'office.webp',
      unlockedBy: 'mailbox',
      arrive: (S) => {
        if (!ev(S, 'cctv')) {
          soon('cctv', 'office', 7000, (stage) => { stage.querySelector('.apt-crt')?.classList.add('on'); click(); say(CCTV_LINE); });
          return '관리실 문은 잠겨 있지 않았다 스탠드는 건전지용 주인은 없고 보온병이 아직 따뜻하다 열쇠함 문이 열려 있고 구석 모니터엔 현관이 비친다';
        }
        return '모니터는 CH2에 멈춰 있다 둑길 가로등 밑 벤치 보온병은 아직 따뜻하다 열쇠함 문은 열린 그대로';
      },
      // 모니터 화면 안쪽(그림 픽셀 897~1002, 338~439)에 맞춘 정사각 화면 — 화면 글자가 잘리지 않게 따로 만든 cctv-crt
      get overlays() { const S = cur(); return [{ x: 87.6, y: 49.1, w: 10.25, h: 14.75, cls: 'apt-crt' + (ev(S, 'cctv') ? ' on' : ''), html: `<img src="${P}props/cctv-crt.webp" alt="">` }]; },
      hotspots: [
        { id: 'log', x: 53, y: 70, label: '책상 위 근무일지', kind: 'doc', doc: 'log' },
        { id: 'roster', x: 92, y: 75, label: '입주자 명부', kind: 'doc', doc: 'roster' },
        { id: 'storage', x: 34.5, y: 21, label: '벽에 붙은 창고 배정표', kind: 'doc', doc: 'storage' },
        { id: 'calendar', x: 78, y: 22, label: '벽 달력', kind: 'doc', doc: 'calendar' },
        { id: 'phone', x: 71, y: 63, r: 9, label: '전화기 옆 통화 메모', kind: 'doc', doc: 'phone' },
        { id: 'receipt', x: 65, y: 86, r: 8, label: '책상 서랍', kind: 'doc', doc: 'receipt' },
        { id: 'cctv', x: 92.5, y: 56, r: 10, label: '구석 모니터', kind: 'doc', doc: 'cctv' },
        { id: 'hooks', x: 53, y: 22, r: 15, label: '열쇠함', kind: 'device', device: 'hooks' },
        { id: 'back2', x: 12, y: 70, label: '현관으로', kind: 'travel', to: 'entrance' },
      ],
    },
    {
      id: 'unit',
      focusX: 73,
      name: '301호',
      image: P + 'unit.webp',
      unlockedBy: 'hooks',
      arrive: (S) => {
        if (!ev(S, 'anbang')) {
          soon('anbang', 'unit', 5000, (stage) => {
            stage.querySelector('.apt-anbang')?.classList.add('on'); stage.querySelector('.apt-spill')?.classList.add('on'); click();
            say(ANBANG_LINE);
            setTimeout(() => { if (document.querySelector('.v2-stage')?.dataset.scene === 'unit') say(COMMENT_LINE); }, 6500);
          });
          return '현관 앞 바닥에 작은 랜턴 하나 창에서 먼 자리다 짐은 거의 상자에 들어갔다 안방 문이 열려 있고 안은 깜깜하다 스위치마다 종이테이프 오른쪽 부엌 싱크대 밑 문이 조금 열려 있다';
        }
        if (S.solved.includes('wires') && !S.solved.includes('cellar')) return '거실 창가 등까지 켜졌다 열 시다 타이머 셋이 째깍거린다 영감님 계실 때 가계부는 뒤편 반지하 창고에 있다고 했다';
        if (S.solved.includes('wires')) return '거실 창가 등까지 켜졌다 밖에서 보면 지금 이 집 창이 셋 다 켜져 있을 거다 창고에서 꺼낸 가계부를 상자 옆에 펼쳤다 타이머 셋이 째깍거린다';
        if (S.solved.includes('box')) return '싱크대 밑 상자가 열려 있다 타이머 셋과 엉킨 연장선, 상자 위엔 가계부 안방 문 너머는 여전히 노랗다';
        return '안방 문 너머가 노랗다 아까 혼자 켜진 불이다 스위치는 눌러도 아무 일 없다 싱크대 밑 문이 조금 열려 있다';
      },
      get overlays() {
        const S = cur();
        return [
          { x: 46, y: 40, w: 3.4, h: 7, cls: 'apt-plan', html: '<i></i>' },
          // 안방 문 안쪽 빛: 문틀 안쪽(그림에서 잰 값 · 윗틀 밑변 51.85,8.9 → 68.3,4.6 · 문턱 51.85,71.6 → 68.3,74.8)만 밝히고, 바닥 빛은 문턱에서 시작
          { x: 51.6, y: 4.4, w: 16.8, h: 70.6, cls: 'apt-anbang' + (ev(S, 'anbang') ? ' on' : ''), html: '<i></i>', style: 'clip-path:polygon(1.5% 6.4%,99.4% .3%,100% 99.7%,1.5% 95.2%)' },
          { x: 47, y: 71.6, w: 32, h: 22, cls: 'apt-spill' + (ev(S, 'anbang') ? ' on' : ''), html: '<i></i>' },
          { x: 0, y: 8, w: 24, h: 70, cls: 'apt-living' + ((S.solved || []).includes('wires') ? ' on' : ''), html: '<i></i>' },
          // 상자를 연 뒤: 이삿짐 상자 위에 가계부 (창고를 다녀오면 두 권), 싱크대 앞 바닥에 꺼내 둔 쪽지 (그림에 없던 물건을 장면에 그려 둔다)
          ...((S.solved || []).includes('box') ? [
            { x: 16.9, y: 45.9, w: 5.2, h: 3.5, cls: 'apt-book' + ((S.solved || []).includes('cellar') ? '' : ' one'), html: '<i></i><b></b>' },
            { x: 78.4, y: 74.6, w: 3.2, h: 2.2, cls: 'apt-note', html: '<i></i>' },
          ] : []),
        ];
      },
      hotspots: [
        { id: 'plan', x: 47.7, y: 43.5, r: 8, label: '방문 옆 대피 안내도', kind: 'doc', doc: 'plan' },
        { id: 'switches', x: 74, y: 29, r: 9, label: '테이프 붙은 스위치', kind: 'doc', doc: 'switches' },
        { id: 'box', x: 89, y: 62, r: 15, label: '싱크대 밑', kind: 'device', device: 'box', visible: (S) => !S.solved.includes('box') },
        { id: 'wires', x: 89, y: 62, r: 15, label: '상자 속 엉킨 선', kind: 'device', device: 'wires', visible: (S) => S.solved.includes('box') && !S.solved.includes('wires') },
        { id: 'timers', x: 89, y: 62, r: 15, label: '상자 속 타이머 셋', kind: 'device', device: 'timers', visible: (S) => S.solved.includes('wires') && S.solved.includes('cellar') },
        { id: 'mnote', x: 80, y: 75.7, r: 8, label: '상자 안 쪽지', kind: 'doc', doc: 'mnote', visible: (S) => S.solved.includes('box') },
        { id: 'book', x: 19.6, y: 47.8, r: 10, label: '상자 위 가계부', kind: 'doc', doc: 'book', visible: (S) => S.solved.includes('box') },
        // 현관 앞 바닥의 랜턴 = 현관 문 앞 (계단으로 내려간다)
        { id: 'downBank', x: 23, y: 69, r: 9, label: '현관 랜턴 · 계단 내려가 둑길로', kind: 'travel', to: 'bank', visible: (S) => S.solved.includes('box') && !S.solved.includes('cellar') },
        { id: 'down', x: 23, y: 69, r: 9, label: '현관 랜턴 · 계단 내려가기', kind: 'travel', to: 'entrance', visible: (S) => !S.solved.includes('box') || S.solved.includes('cellar') },
      ],
    },
  ],

  docs: {
    order: {
      title: '오늘 작업 지시',
      kind: '김 팀장 · 오후 5시 12분',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>김 팀장</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 10월 23일 금요일</div>
<div class="chat-row them"><span class="chat-avatar">팀</span><div class="chat-col"><span class="chat-name">김 팀장</span><div class="chat-bubble">미루연립 A동 최종 점검 오늘 밤에&nbsp;가</div><div class="chat-bubble">10/1 단전 완료 확인서 있음 근데 밤마다 불 켜진다고 민원 3건</div><div class="chat-bubble">무단 전기 끌어다 쓰는 거면 위험하니까 월요일 철거 전에 원인 찾아서 끊고 보고</div></div><span class="chat-time">오후 5:12</span></div>
<div class="chat-row me"><span class="chat-meta">오후 5:20</span><div class="chat-bubble">네 9시쯤 가 볼게요</div></div>
<div class="chat-row them"><span class="chat-avatar">팀</span><div class="chat-col"><span class="chat-name">김 팀장</span><div class="chat-bubble">관리인 할아버지 아직 출근하신대 30년 계신 분 협조 받아</div></div><span class="chat-time">오후 5:21</span></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    post: {
      title: '동네 커뮤니티 글',
      kind: '미루천 사람들 · 자유게시판',
      html: (S) => `<div class="post"><p class="post-head"><b>미루연립 404호 귀신 진짜임</b><small>둑길산책 · 10/21</small></p><p>전기 끊긴 건물에 밤마다 불 들어옴 둑길에서 30분마다 찍어 봄 맨 아래부터 세면 네 번째 줄, 왼쪽에서 네 번째 집 = 404호</p>${FRAMES.map(rearPhoto).join('')}<p>같은 집 창이 30분마다 하나씩 늘어남 ㄷㄷ 10시 반 건 흔들려서 버림 11시 되면 한꺼번에 다 꺼짐</p><div class="post-comments"><p><b>미루토박이</b> 404 작년에 이사 간 집인데</p><p><b>산책러2</b> 거기 뒤쪽 땅 낮던데</p><p><b>둑길산책</b> ↑ 뭔 상관이에요 404 맞음</p>${ev(S, 'anbang') ? '<p class="post-new"><b>산책러2</b> 지금 3층에 누가 서 있음 손전등 든 사람 <small>방금</small></p><p class="post-new"><b>둑길산책</b> ↑ ㄷㄷㄷ 사진 좀 <small>방금</small></p>' : ''}</div></div>`,
    },
    section: {
      title: '둑길의 철거 안내판',
      kind: '미루연립 정비사업 안내 · 일부',
      html: `<div class="paper-table"><p class="pt-head">미루연립 A동 철거 안내</p><p class="pt-foot">철거 10/26(월) 08:00부터 · 둑길 일부 통제</p></div><figure class="prop sectionfig">${sectionSvg()}</figure>`,
    },
    plate: {
      title: '우편함 위 호수 안내',
      kind: 'A동 현관',
      html: `<div class="paper-table"><p class="pt-head">A동 호수 안내</p><p>우편함 왼쪽 네 칸이 각 층 01 · 02 · 03 · 04호 (맨 위 줄 5층)</p><p>정문에서 보아 왼쪽 집부터 01 · 02 · 03 · 04호</p><p>반지하 창고 B01 ~ B04 출입은 건물 뒤편(둑길 쪽) 철문</p></div>`,
    },
    board: {
      title: '게시판의 이주 현황',
      kind: '9/30 게시',
      html: `<div class="paper-table"><p class="pt-head">A동 이주 현황 (20세대)</p><table><tr><th>이주 완료</th><td>19세대</td></tr><tr><th>남은 세대</th><td>1세대 (입원 중 · 짐 정리는 보호자가 대신)</td></tr><tr><th>단전</th><td>10/1 한전</td></tr></table><p class="pt-foot">우편물은 관리실에서 모아 전달합니다 관리인 문철호</p></div>`,
    },
    log: {
      title: '책상 위 근무일지',
      kind: '관리인 문철호 · 10월',
      html: `<blockquote class="hand">10/1 단전 계단 비상등만<br>10/2 그 집 열쇠 할머니 창고 열쇠랑 한 고리에 같이 걸어 둠 자꾸 어디 뒀는지 잊어버려서<br>10/5 병원<br>10/9 철물점 (영수증 서랍)<br>10/11 상자 번호 또 잊어버려서 불 켜지는 순서로 바꿈<br>10/12 밤 9시 ☎<br>10/16 밤 9시 ☎<br>10/21 커뮤니티에 귀신 글 올라왔다고 302 아들이 알려 줌 가입도 시켜 줌 허허</blockquote>`,
    },
    roster: {
      title: '입주자 명부',
      kind: 'A동 · 2026년 9월 기준 (이주 표시)',
      html: `<div class="paper-table"><p class="pt-head">입주자 명부 (3층)</p><table><tr><th>301</th><td>김순자</td><td class="hand-cell">입원 · 짐 그대로</td></tr><tr><th>302</th><td>이경숙</td><td class="hand-cell">이주</td></tr><tr><th>303</th><td>김순례</td><td class="hand-cell">이주 9/20</td></tr><tr><th>304</th><td>(공실)</td><td></td></tr></table><p class="pt-foot">1·2·4·5층 생략</p></div>`,
    },
    storage: {
      title: '벽에 붙은 창고 배정표',
      kind: '반지하 창고 · 2019년에 인쇄',
      html: `<div class="paper-table"><p class="pt-head">반지하 창고 배정 (2019)</p><table><tr><th>B01</th><td>김순례</td></tr><tr><th>B02</th><td>박정호</td></tr><tr><th>B03</th><td>김순자</td></tr><tr><th>B04</th><td>(관리실 공구)</td></tr></table><p class="hand-cell big">23년 여름 장마 B03 바닥에 물 샘 → 3층 두 분 창고 맞바꿔 드림</p></div>`,
    },
    calendar: {
      title: '벽 달력',
      kind: '10월',
      html: `<div class="paper-table"><p class="pt-head">10월</p><table><tr><td>1 목</td><td class="hand-cell">단전</td></tr><tr><td>9 금</td><td class="hand-cell">철물점</td></tr><tr><td>26 월</td><td class="hand-cell">철거 ✕</td></tr></table></div><p>12일부터 날짜마다 볼펜으로 작은 동그라미가 하나씩 쳐져 있다 오늘 23일에도</p>`,
    },
    phone: {
      title: '전화기 옆 통화 메모',
      kind: '관리인 문철호 · 메모지 두 장',
      html: `<blockquote class="hand">10/12 9시 ☎ 할머니<br>불 보이신단다 근데 순서가 틀렸대<br>그 양반 들어오면 문 열자마자 켜던 데부터라고<br><br>10/16 9시 ☎ 할머니<br>안방이 너무 이르대 그땐 아직 이불 안 깔았대<br>몇 시에 뭐 켰는지 다 가계부에 적었다고 짐 어디 들었는지 찾아볼 것</blockquote>`,
    },
    receipt: {
      title: '책상 서랍의 영수증',
      kind: '미루철물 · 2026/10/9',
      html: `<div class="paper-table receipt"><p class="pt-head">미루철물</p><table><tr><td>기계식 타이머 (24시간 핀)</td><td>3</td></tr><tr><td>연장선 5m</td><td>3</td></tr><tr><td>보조배터리 20000</td><td>2</td></tr><tr><td>LED 스탠드</td><td>3</td></tr><tr><td>종이테이프</td><td>1</td></tr></table><p class="pt-foot">2026/10/9 15:42 · 현금</p></div>`,
    },
    cctv: {
      title: '구석 모니터',
      kind: '관리실 CCTV · 채널 넷',
      html: (S) => ev(S, 'cctv')
        ? `<figure class="prop cctvfig"><img src="${P}props/cctv-bench.webp" alt="흑백 CCTV 화면: 둑길 가로등 밑 벤치에 모자 쓴 사람이 혼자 앉아 개울 건너 건물 쪽을 보고 있다" decoding="async"></figure><p>CH2 둑길 가로등 쓰레기 무단투기 때문에 몇 년 전 연립에서 달아 둔 카메라다 얼굴은 안 보인다 납작한 모자와 굽은 등만 보인다</p><p>채널 버튼을 눌러도 화면이 CH2에서 넘어가지 않는다</p>`
        : '<p>작은 흑백 모니터 CH1 현관 앞이 비친다 눈 내리듯 잡음이 계속 흐른다</p><p>아래에 채널 버튼 넷 CH2에는 「둑길」이라고 네임펜으로 적혀 있다</p>',
    },
    plan: {
      title: '방문 옆 대피 안내도',
      kind: '301호',
      html: `<figure class="prop planfig">${planSvg()}</figure><p>안내도는 현관에 서서 안쪽을 본 그대로 그렸다 창이 난 북쪽 벽이 정면이다</p>`,
    },
    switches: {
      title: '테이프 붙은 스위치',
      kind: '301호 스위치 여섯',
      html: `<div class="switch-row apt-switches">${SWITCHES.map(([n, r]) => `<div class="switch-plate"><span class="tape">${n} ${r}</span><i></i></div>`).join('')}</div><p>안방 문 옆에 둘, 나머지는 방마다 문 옆에 하나씩 집 안 스위치마다 번호 테이프가 붙어 있다 단전이라 눌러도 아무 일 없다 테이프 글씨는 관리실 근무일지와 같은 손이다</p>`,
    },
    mnote: {
      title: '상자 안 쪽지',
      kind: '관리인 문철호의 글씨',
      html: `<blockquote class="hand">이걸 연 분께<br>전기 훔쳐 쓴 거 아닙니다 배터리입니다 불나지 않게 매일 낮에 와서 봅니다<br><br>301 김순자 할머니가 지금 햇살요양병원 3층에 계십니다 창가에서 둑 너머 이 집이 보입니다 자제분들은 다 외국이라 보호자 칸엔 제 이름을 적었습니다<br>사십 년 사신 집이 월요일에 헐립니다 그때까지만 밤마다 불 켜진 걸 보시게 하고 싶었습니다<br><br>근데 할머니가 전화로 순서가 틀렸다고 하십니다 영감님 계실 때는 그렇게 안 켰다고<br>나는 그 집 저녁을 모릅니다 짐에서 할머니 가계부를 한 권 찾아 상자 위에 올려 뒀는데 영감님 가신 뒤 것입니다 그 전 것은 할머니 말씀이 B01 창고 과자 상자에 있답니다 저는 무릎이 성치 않아 반지하 계단을 못 내려갑니다<br><br>월요일 아침에 제가 다 떼겠습니다<br>— 관리인 문철호</blockquote>`,
    },
    book: {
      title: '상자 위 가계부',
      kind: '김순자 · 2015년',
      html: `<figure class="prop bookphoto"><img src="${P}props/book.webp" alt="상자 위에 펼쳐 둔 가계부 한 권과 돋보기안경" decoding="async"></figure><div class="paper-table old"><p class="pt-head">2015년 가계부 · 1월 첫 장 여백</p><p class="hand-cell big">그이 가고 나서는 안방만 아홉 시에 켰다가 열 시에 끈다<br>작은방은 애들 나가고 나서 안 켠다 숙제 봐 주던 방</p></div>`,
    },
    book09: {
      title: '창고의 2009년 가계부',
      kind: '김순자 · 반지하 창고 과자 상자',
      html: `<div class="paper-table torn"><p class="pt-head">2009년 가계부 · 3월 둘째 장 여백 (23년 장마 때 젖었다 마른 자국 줄 가운데 글씨가 번져 못 읽는다)</p><p class="hand-cell big">그이 아홉 시 퇴근 들어오면 <span class="rip">▒▒</span> 불부터<br>아홉 시 반 <span class="rip">▒▒▒</span> 켜 주고 숙제 봐 줌<br>열 시 반 <span class="rip">▒▒</span> 이불 깔고<br>열한 시 다 끄고 잔다 우리 집은 이게 저녁</p></div>`,
    },
    final: {
      title: '할머니와의 통화',
      kind: '토요일 밤 9시 · 관리인 휴대폰 스피커',
      locked: true,
      html: `<blockquote>"거실 켜졌다"</blockquote><blockquote>"애들 방도"</blockquote><blockquote>"그래 그렇지 그 양반은 거실부터였어 문 열면 바로 거실 불 켰어 어둡게 들어오는 거 싫다고"</blockquote><blockquote>"안방은 좀 있다 켜져요 할머니"</blockquote><blockquote>"알아 열 시 반 이불 깔 때"</blockquote><p>안방 창이 켜지자 전화기 너머가 한참 조용했다 관리인 할아버지가 휴대폰을 무릎에 내려놓고 먼 데를 봤다</p>`,
    },
  },

  devices: {
    mailbox: {
      title: '우편함',
      scene: 'entrance',
      intro: '서른 칸 철제 우편함 열쇠는 없지만 문이 다 헐겁다 칸을 누르면 그 칸에 손을 댄다 불이 켜진 그 집 우편함을 열어 본다',
      docs: ['post', 'section', 'plate', 'order'],
      hintCode: '',
      hints: [
        '글쓴이는 404라는데, 그 사진을 어디서 찍었는지부터 다시 본다',
        '둑길은 건물 뒤편이다 뒤에서 보면 좌우가 바뀌고, 안내판 단면도로 맨 아랫줄이 무엇인지 다시 센다',
        '3층 01호 301',
      ],
      initial: () => ({ pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop mailwall mailwall6'); wrap.innerHTML = `<img src="${P}props/mailwall.webp" alt="현관 왼쪽 벽의 철제 우편함 여섯 칸 다섯 줄" decoding="async">`;
        MAILROWS.forEach((row, r) => row.forEach((lab, c) => {
          const b = el('button', 'mail-slot' + (d.pick === lab ? ' picking' : '')); b.type = 'button';
          b.style.left = MAIL_X[c] + '%'; b.style.top = MAIL_Y[r] + '%'; b.style.width = MAIL_W[c] + '%';
          b.setAttribute('aria-label', `${lab === '—' ? '이름표 없는 칸 ' + (c + 1) : lab} 우편함`);
          b.onclick = () => { d.pick = lab; save(); };
          // 호수 글자는 문짝의 이름표 받침 위에 (누르는 자리는 문짝 전체)
          const t = el('span', 'mail-tag' + (d.pick === lab ? ' on' : ''), lab); t.setAttribute('aria-hidden', 'true');
          t.style.left = PLATE_X[c] + '%'; t.style.top = PLATE_Y[r][c] + '%';
          wrap.append(b, t);
        }));
        const box = el('div', 'mail-wrap'); box.append(wrap, el('p', 'pick-label', d.pick ? `손을 댄 칸 · ${d.pick}` : '우편함을 하나 고른다'));
        const w = waitLine(ctx, '철문 소리가 계단을 타고 울렸다 위층이 조용해질 때까지 숨죽이고 기다린다'); if (w) box.append(w);
        return box;
      },
      commitLabel: '이 우편함 열어 보기',
      canCommit: (d) => !!d.pick && !waiting(d),
      check(d) {
        if (d.pick === MAIL_ANSWER) return { ok: true };
        miss(d);
        if (d.pick === '404') return { ok: false, msg: '전단지만 꽉 찼다 작년에 이사 간 집이다' };
        return { ok: false, msg: '전단지와 고지서뿐이다 이 집이 아니다' };
      },
      reveal: {
        title: '301',
        text: '우편함 안에 고지서 한 장 「햇살요양병원 10월 입원비 · 301 김순자 님」 그 위에 메모지 「301 우편물 관리실에서 모아 둡니다」',
        scene: ['고지서 봉투가 아직 빳빳하다 다른 칸과 달리 전단지가 한 장도 없다 누가 이 칸만 챙기고 있다 관리실 스탠드는 아직 켜져 있다'],
        unlock: 'office',
      },
    },

    hooks: {
      title: '열쇠함',
      scene: 'office',
      intro: '앞쪽에 빼곡한 색 꼬리표 열쇠는 공용 비품이다 그걸 젖히니 안쪽 판에 세대 열쇠 고리 스물네 개 꼬리표엔 호수만 적혀 있다 고리를 누르면 그 열쇠를 꺼내 손에 들고, 다시 누르면 도로 건다 301 고리는 비어 있다',
      docs: ['log', 'roster', 'storage', 'calendar', 'phone', 'receipt'],
      hintCode: '',
      hints: [
        '301 고리가 비었다 근무일지에 그 집 열쇠를 어디 뒀는지 적혀 있다',
        '할머니 창고가 몇 번인지는 배정표 인쇄 글씨만 믿으면 안 된다 아래 손글씨의 두 분이 누군지 명부에서 찾는다',
        'B01 고리 (2023년에 김순자 할머니와 김순례 할머니 창고를 맞바꿔서 할머니 창고는 B01)',
      ],
      initial: () => ({ hand: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        // 사진에서 열쇠판만 크게 잘라 보인다 (좌우의 스탠드·화분·문짝은 잘라 냄) 고리 좌표는 원본 사진 기준 그대로
        const clip = el('div', 'prop keyclip');
        const wrap = el('div', 'keywall'); wrap.innerHTML = `<img src="${P}props/keys.webp" alt="스물네 고리 열쇠함" decoding="async">`; clip.append(wrap);
        HOOKROWS.forEach((row, r) => row.forEach((lab, c) => {
          if (d.hand === lab) { const g = el('img', 'hook-gone'); g.src = P + 'props/hook-empty.webp'; g.alt = ''; g.style.left = (HOOK_X[c] - 1.95) + '%'; g.style.top = (HOOK_Y[r] + 2.91) + '%'; wrap.append(g); }
          const b = el('button', 'hook-slot' + (d.hand === lab ? ' taken' : '')); b.type = 'button';
          b.style.left = HOOK_X[c] + '%'; b.style.top = HOOK_Y[r] + '%';
          b.setAttribute('aria-label', d.hand === lab ? `${lab} 고리에 도로 걸기` : `${lab} 고리에서 꺼내기`); b.innerHTML = `<span class="hook-tag">${lab}</span>`;
          b.onclick = () => {
            if (lab === '301') { ctx.status('빈 고리다 열쇠가 없다'); return; }
            d.hand = d.hand === lab ? null : lab; save();
          };
          wrap.append(b);
        }));
        // 열쇠판을 크게 잘라 보여서 휴대폰에서도 고리 하나가 손가락 크기(50px 남짓)다 — 따로 단추 표를 두지 않는다
        const box = el('div', 'mail-wrap apt-keys'); box.append(clip);
        const hand = el('div', 'key-hand');
        if (!d.hand) hand.append(el('p', 'pick-label', '손은 비어 있다'));
        else {
          const ring = el('div', 'ring-keys'); ring.innerHTML = keySvg(1); // 사진처럼 고리마다 보이는 열쇠는 하나 (B01 뒤에 겹친 하나는 들고 올라가서야 안다)
          const tag = el('div', 'tag-big', d.hand);
          const back = el('button', 'chip', '도로 걸기'); back.type = 'button'; back.onclick = () => { d.hand = null; save(); };
          hand.append(el('p', 'pick-label', '손에 든 것'), tag, ring, back);
        }
        box.append(hand);
        const w = waitLine(ctx, '3층에서 다시 내려오는 중 숨이 차다'); if (w) box.append(w);
        return box;
      },
      commitLabel: '이 열쇠 들고 3층으로',
      canCommit: (d) => !!d.hand && !waiting(d),
      check(d, S) {
        if (d.hand === HOOK_ANSWER) { if (S) fire(S, 'cctv'); return { ok: true }; }
        d.hand = null; miss(d);
        return { ok: false, msg: '3층까지 올라가 꽂아 봤지만 301 문이 안 열린다 열쇠를 도로 걸었다' };
      },
      reveal: {
        title: 'B01',
        text: 'B01 창고 열쇠 뒤에 하나가 더 겹쳐 걸려 있었다 꼬리표 없는 현관 열쇠',
        // 모니터가 넘어가는 걸 못 보고 열쇠를 찾았으면, 관리실을 나서는 순간에 본다
        get scene() {
          const late = ev(cur(), 'cctvLate');
          return [...(late ? ['열쇠를 쥐고 나서는데 구석 모니터가 지지직 넘어갔다 CH2 둑길 가로등 아까 내가 서 있던 그 벤치에 누가 앉아 이쪽 건물을 보고 있다'] : []), '3층까지 올라가자 301 문틈으로 희미한 빛이 새어 나왔다 꼬리표 없는 열쇠를 꽂자 한 번에 돌아갔다'];
        },
        unlock: 'unit',
      },
    },

    box: {
      title: '싱크대 밑',
      scene: 'unit',
      intro: '회색 공구 상자 하나 상자에서 나온 선이 보조배터리로 이어져 있다 세 자리 번호 자물쇠 ▲▼로 숫자를 돌린다 옆에 놓인 종이테이프 롤 겉면에 볼펜 글씨 「번호: 밤에 켜지는 순서대로 스위치 번호」',
      docs: ['switches', 'plan', 'post', 'log'],
      hintCode: '',
      hints: [
        '커뮤니티 사진은 30분마다 찍은 거다 301 창 셋 중 새로 켜진 게 어느 건지 시간 순서대로',
        '사진은 밖에서 찍었다 안에서 북쪽 벽을 보고 그린 대피 안내도와는 좌우가 반대다 스위치 여섯 중 둑길에서 보이는 창이 있는 방만 센다',
        '작은방 → 안방 → 거실 스위치 번호로 425',
      ],
      initial: () => ({ dial: [0, 0, 0] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop boxphoto'); wrap.innerHTML = `<img src="${P}props/box.webp" alt="싱크대 밑 공구 상자와 세 자리 자물쇠" decoding="async">`;
        const box = el('div', 'letterlock-wrap apt-boxlock'); box.append(wrap, dialRow(el, save, d, 3));
        const w = waitLine(ctx, '다이얼이 헛돈다 한참 흔들어야 다시 맞물린다'); if (w) box.append(w);
        return box;
      },
      commitLabel: '뚜껑 열기',
      canCommit: (d) => !waiting(d),
      check(d, S) {
        if (d.dial.join('') === BOX_CODE.join('')) { if (S) fire(S, 'anbang'); return { ok: true }; }
        miss(d);
        return { ok: false, msg: '안 열린다' };
      },
      reveal: {
        title: '425',
        text: '뚜껑 안에 타이머 셋과 배터리, 엉킨 연장선 세 가닥, 그리고 접힌 쪽지 쪽지는 관리실 근무일지와 같은 글씨였다',
        // 안방 불이 혼자 켜지는 걸 못 보고 상자를 열었으면, 뚜껑이 열리는 순간에 본다
        get scene() {
          const late = ev(cur(), 'anbangLate');
          return [...(late ? ['뚜껑이 열리는 순간 ' + ANBANG_LINE, COMMENT_LINE] : []), '선은 셋 다 검은색이고 서로 감긴 채 상자 밖으로 나가 방마다 하나씩 간다 상자 앞, 선이 갈라지는 자리마다 테이프 숫자가 감겨 있다'];
        },
        unlockDoc: 'mnote',
        unlock: null,
      },
    },

    wires: {
      title: '상자 속 엉킨 선',
      scene: 'unit',
      intro: '타이머 셋 위에 빈 종이테이프 아래로는 검은 연장선 세 가닥이 엉켜 방마다 간다 테이프 숫자를 눌러 집은 뒤 타이머 위 빈 테이프를 누르면 거기 적어 붙인다 붙인 걸 다시 누르면 뗀다',
      docs: ['switches', 'receipt', 'mnote'],
      hintCode: '',
      hints: [
        '타이머 소켓에서 나간 선 하나를 골라 끝까지 손가락으로 따라가 본다',
        '선이 겹치는 자리에서는 위에 올라간 선이 밝은 테두리를 두르고 있다 그걸로 어느 선이 계속 가는지 가린다',
        '왼쪽 타이머 5 · 가운데 2 · 오른쪽 4',
      ],
      initial: () => ({ hold: null, tape: { L: null, M: null, R: null } }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'wire-wrap');
        const top = el('div', 'prop timerphoto wiretop'); top.innerHTML = `<img src="${P}props/timers.webp" alt="회색 공구 상자 속 기계식 타이머 셋 위에 빈 종이테이프가 붙어 있다" decoding="async">`;
        [['L', 27.6], ['M', 50.2], ['R', 72.7]].forEach(([k, x]) => {
          const b = el('button', 'wire-tape' + (d.tape[k] ? ' set' : '')); b.type = 'button'; b.style.left = x + '%';
          b.setAttribute('aria-label', `${TIMER_NAME[k]} 위 테이프${d.tape[k] ? ' ' + d.tape[k] : ' (비어 있음)'}`);
          b.textContent = d.tape[k] || '';
          b.onclick = () => {
            if (d.tape[k]) { d.tape[k] = null; save(); return; }
            if (!d.hold) { ctx.status('아래 테이프 숫자를 먼저 집는다'); return; }
            Object.keys(d.tape).forEach((o) => { if (d.tape[o] === d.hold) d.tape[o] = null; });
            d.tape[k] = d.hold; d.hold = null; save();
          };
          top.append(b);
        });
        const svg = el('div', 'wirebox'); svg.innerHTML = wireSvg();
        const tray = el('div', 'wire-chips');
        WIRE_TAPES.forEach((n) => {
          const used = Object.values(d.tape).includes(n);
          const c = el('button', 'wire-chip' + (d.hold === n ? ' holding' : '') + (used ? ' used' : ''), n); c.type = 'button';
          c.setAttribute('aria-label', `테이프 ${n} 집기`);
          c.onclick = () => { d.hold = d.hold === n ? null : n; save(); };
          tray.append(c);
        });
        wrap.append(top, svg, el('p', 'pick-label', d.hold ? `테이프 ${d.hold}를 집었다 붙일 타이머 위 테이프를 누른다` : '종이테이프 숫자'), tray);
        const w = waitLine(ctx, '테이프를 다 떼고 선을 처음부터 다시 따라가는 중'); if (w) wrap.append(w);
        return wrap;
      },
      commitLabel: '이대로 붙여 두기',
      canCommit: (d) => ['L', 'M', 'R'].every((k) => d.tape[k]) && !waiting(d),
      check(d) {
        d.hold = null;
        if (['L', 'M', 'R'].every((k) => d.tape[k] === WIRE_ANSWER[k])) return { ok: true };
        miss(d);
        return { ok: false, msg: '선 하나를 손으로 짚어 다시 따라가 보니 붙인 숫자와 끝이 맞지 않는다' };
      },
      reveal: {
        title: '5 · 2 · 4',
        text: '왼쪽 타이머는 5 거실, 가운데 파란 타이머는 2 안방, 오른쪽 타이머는 4 작은방 테이프를 다 붙였을 때 왼쪽 타이머가 딸깍 넘어갔다',
        get scene() {
          const toCellar = !(cur().solved || []).includes('cellar');
          return ['거실 창가에서 스탠드가 켜졌다 열 시다 지금 둑에서 보면 이 집 창이 셋 다 노랗겠다', '타이머 둘레에 핀이 촘촘히 박혀 있다 내려간 핀만큼 불이 켜진다', ...(toCellar ? ['영감님 계실 때 가계부는 뒤편 반지하 B01 창고에 있다고 했다 계단을 내려가 둑길 쪽으로 돌아가 본다'] : [])];
        },
        get unlock() { return (cur().solved || []).includes('cellar') ? null : 'bank'; },
      },
    },

    cellar: {
      title: '뒤편 반지하 철문',
      scene: 'bank',
      intro: '개울을 건너 건물 뒤편 둑 아래로 내려왔다 반지하 철문 넷 철거 업체가 문마다 빨간 락카로 번호를 써 놨다 가로등 빛이 여기까진 안 온다 화면을 끌면 손전등이 따라가고, 문을 누르면 창고 열쇠를 그 문에 댄다',
      docs: ['storage', 'plate', 'mnote', 'section'],
      hintCode: '',
      hints: [
        '손전등으로 철문 넷을 하나씩 다 비춰 본다 락카 숫자 말고 문에 남은 흔적도 본다',
        '락카 숫자는 철거 업체가 뒤에서 보고 쓴 거다 창고 배정표에서 물이 샌 창고를 찾아 그 자국이 어느 문에 남았는지 본다 자물쇠를 따로 채운 문이 누구 창고일지도',
        '맨 오른쪽 철문 (왼쪽부터 B04 관리실 공구 자물쇠 · B03 물 자국 · B02 · B01)',
      ],
      initial: () => ({ pick: null, fx: 12 }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'cellar-wrap');
        const wall = el('div', 'cellar-wall');
        wall.innerHTML = `<img src="${P}props/cellar.webp" alt="건물 뒤편 반지하 철문 넷 문마다 빨간 락카 번호" class="cellar-img" draggable="false" decoding="async">`;
        const dark = el('div', 'cellar-dark'); wall.append(dark);
        const cap = el('p', 'cellar-cap');
        const aim = (fx, fy = 52) => {
          d.fx = Math.max(0, Math.min(100, fx));
          dark.style.setProperty('--fx', d.fx + '%'); dark.style.setProperty('--fy', fy + '%');
          const i = CELLAR_X.findIndex((x) => Math.abs(d.fx - x) <= CELLAR_W / 2 + 1);
          cap.textContent = i < 0 ? '손전등 빛이 젖은 벽만 훑는다' : CELLAR_SEEN[i];
        };
        const move = (e) => { const r = wall.getBoundingClientRect(); aim((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100); };
        wall.addEventListener('pointerdown', move);
        wall.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.buttons || e.pressure) move(e); });
        CELLAR_X.forEach((x, i) => {
          const b = el('button', 'cellar-door' + (d.pick === i ? ' picking' : '')); b.type = 'button';
          b.style.left = x + '%'; b.style.width = CELLAR_W + '%';
          b.setAttribute('aria-label', CELLAR_NAME[i] + ' (' + CELLAR_SEEN[i].split(' · ').slice(1).join(' · ') + ')');
          b.onclick = () => { aim(x); d.pick = i; save(); };
          wall.append(b);
        });
        aim(d.pick != null ? CELLAR_X[d.pick] : d.fx);
        wrap.append(wall, cap, el('p', 'pick-label', d.pick != null ? `열쇠를 댈 문 · ${CELLAR_NAME[d.pick]}` : '열쇠를 댈 문을 아직 안 골랐다'));
        const w = waitLine(ctx, '손전등을 끄고 숨을 죽인다 둑 위로 누가 지나간다'); if (w) wrap.append(w);
        return wrap;
      },
      commitLabel: '창고 열쇠 꽂아 돌리기',
      canCommit: (d) => d.pick != null && !waiting(d),
      check(d) {
        if (d.pick === CELLAR_ANSWER) return { ok: true };
        miss(d);
        return { ok: false, msg: '열쇠가 반쯤 들어가다 턱 걸린다 이 문이 아니다' };
      },
      reveal: {
        title: 'B01',
        text: '맨 오른쪽 철문이 끼익 열렸다 선반 맨 위 과자 상자에 할머니 글씨로 「가계부」 해마다 한 권씩 꽂혀 있다',
        scene: ['2009년 것을 꺼냈다 23년 장마 때 젖었다 마른 자국 그대로다 3월 둘째 장 여백, 줄 가운데 글씨가 번져 있다', '철문을 잠그고 돌아서는데 개울 건너 둑길 갈대숲에서 누가 기침을 했다 손전등을 돌렸을 땐 갈대만 흔들렸다'],
        unlockDoc: 'book09',
        unlock: 'unit',
      },
    },

    timers: {
      title: '상자 속 타이머 셋',
      scene: 'unit',
      intro: '기계식 타이머 둘레의 핀 하나가 30분이다 핀을 누르면 내려가고, 내려간 핀 동안 그 타이머 등이 켜진다 다시 누르면 올라온다 지금은 할머니가 틀렸다고 한 저녁 그대로다',
      docs: ['book09', 'book', 'phone', 'switches', 'plan', 'mnote'],
      hintCode: '',
      hints: [
        '할머니가 원하는 건 영감님 계실 때 저녁이다 상자 위 가계부는 그 뒤의 것이고, 창고에서 꺼낸 그해 장은 방 이름이 번져 있다',
        '번지지 않은 말로 방을 맞힌다 숙제 봐 주던 방은 다른 해 가계부에, 문 열자마자 켜던 데는 통화 메모와 대피 안내도에 있다 타이머가 어느 방인지는 붙인 테이프 숫자를 스위치 테이프와 맞춰 본다',
        '왼쪽(5 거실) 21:00~22:30 핀 넷 · 오른쪽(4 작은방) 21:30~22:30 핀 셋 · 가운데(2 안방) 22:30 핀 하나 · 23:00부터는 다 올림',
      ],
      initial: () => ({ pins: JSON.parse(JSON.stringify(PIN_START)) }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const tapes = S.drafts?.wires?.tape || WIRE_ANSWER;
        const wrap = el('div', 'pin-wrap');
        ['L', 'M', 'R'].forEach((k) => {
          const row = el('div', 'pin-timer' + (k === 'M' ? ' blue' : ''));
          row.append(el('p', 'pin-name', `${TIMER_NAME[k]} · 테이프 ${tapes[k] || '?'}`));
          const ring = el('div', 'pin-ring');
          PINS.forEach((t) => {
            const on = d.pins[k].includes(t);
            const b = el('button', 'pin' + (on ? ' down' : '')); b.type = 'button';
            b.setAttribute('aria-label', `${TIMER_NAME[k]} ${t} 핀 ${on ? '내려감' : '올라옴'}`);
            b.append(el('i'), el('small', '', t));
            b.onclick = () => { d.pins[k] = on ? d.pins[k].filter((x) => x !== t) : [...d.pins[k], t]; save(); };
            ring.append(b);
          });
          row.append(ring);
          wrap.append(row);
        });
        return wrap;
      },
      commitLabel: '이 저녁으로 맞춰 두기',
      check(d) {
        const k = pinKey(d.pins);
        if (k === pinKey(PIN_ANSWER)) return { ok: true };
        if (k === pinKey(PIN_START)) return { ok: false, msg: '지금 맞춰진 그대로다 할머니가 틀렸다고 한 저녁' };
        if (k === pinKey(PIN_2015)) return { ok: false, msg: '그건 혼자 되신 뒤의 저녁이다' };
        return { ok: false, msg: '이대로면 또 틀렸다고 하실 거다' };
      },
      reveal: {
        title: '그 집의 저녁',
        text: '거실 아홉 시, 작은방 아홉 시 반, 안방 열 시 반 열한 시에 셋이 같이 꺼진다 2009년 3월 어느 저녁의 순서다',
        scene: ['쪽지 뒷면에 적어 상자 뚜껑 안쪽에 붙였다 「순서 고쳐 놨습니다 월요일 아침 같이 떼요 — 점검 한도윤」 관리실 책상에도 같은 말을 남겼다', '팀장한테는 「원인 확인 배터리 조명 월요일 철거 전 제거 예정」이라고만 보냈다'],
        ending: true,
        endingLabel: '다음 날 밤 아홉 시, 둑길',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '둑길 벤치에 나란히 앉은 두 사람의 뒷모습 개울 건너 A동 뒤편 3층 오른쪽 창 셋만 노랗게 켜져 있다',
    eyebrow: '2026/10/24 토요일 · 밤 9시부터',
    title: '404호에는 불이 켜지지 않았다',
    // 두 장면(모니터 속 벤치 · 산책러2 댓글)은 장치를 풀 때 꼭 보게 되지만, 옛 저장으로 이어 하는 사람을 위해 본 것만 꺼낸다
    paragraphs: (S) => {
      const bench = ev(S, 'cctv'), note = ev(S, 'anbang');
      const who = [bench ? '어젯밤 관리실 모니터 속 벤치에 앉아 있던 사람' : '', note ? '3층에 손전등 든 사람이 있다고 댓글 단 산책러2' : ''].filter(Boolean);
      return [
        '토요일 밤 둑길 벤치에 관리인 할아버지와 나란히 앉았다 할아버지 휴대폰에서 할머니 목소리가 나왔다',
        '"아홉 시 됐나"',
        '"됐어요 할머니"',
        '건너편 3층 오른쪽 창 셋 가운데 창이 먼저 켜졌다',
        '"거실이네" 할머니 목소리가 달라졌다',
        '아홉 시 반에 오른쪽 작은방이, 열 시 반에 왼쪽 안방이 켜졌다 셋 다 켜진 창을 할아버지는 아무 말 없이 한참 봤다',
        '할아버지가 보온병 뚜껑에 커피를 따라 줬다' + (who.length ? ' ' + who.join('도, ') + '도 할아버지였다' : ''),
        '"아홉 시부터 열한 시까지 매일 여기 앉아서 봤어 불 잘 켜지나 어젯밤엔 3층에 웬 불빛이 왔다 갔다 하길래 도둑인 줄 알고 둑길 갈대 뒤에 숨었지' + (note ? ' 거기서 댓글도 달았지 뒤쪽 땅 낮다고 적은 것도 나야 아무도 안 믿더만"' : '"'),
        '열한 시에 셋이 같이 꺼졌다 "잘 자요 할머니" "그래 자네도"',
      ];
    },
    afterword: '월요일 아침 여덟 시, 할아버지와 등 세 개를 떼어 냈다 거실 등 하나는 타이머째 할머니 병실 창가로 갔다 매일 밤 아홉 시에 켜지게 맞춰 두었다 철거가 끝난 날 밤 커뮤니티 글에 마지막 댓글이 달렸다 「연립 헐린 자리에서 둑 너머 보면 아홉 시에 언덕 위 불 하나 켜짐 귀신 이사 감?」 그 언덕 위가 햇살요양병원 3층이다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=laundry', title: '자정의 무인 세탁소', line: '다음은 자정마다 빈 통으로 도는 건조기 이야기입니다' },
  },
};
