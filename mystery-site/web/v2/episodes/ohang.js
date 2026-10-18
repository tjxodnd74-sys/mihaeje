// 오행당 · 돌아오는 계절 — ★2. 이야기·자료·장치가 전부 이 파일에 있습니다
import { birthProfile } from '../../ohang-rules.js';
const P = 'assets/v2/ohang/';
const js = (w, a, b) => { const c = w.charCodeAt(w.length - 1); if (c < 0xac00 || c > 0xd7a3) return w + a; return w + ((c - 0xac00) % 28 ? a : b); }; // 받침 있음→a, 없음→b

// 다섯 빛: 색 ↔ 오행 ↔ 방향 ↔ 계절
const E = [
  { id: 'blue', color: '청', han: '木', el: '목', dir: '동', season: '봄', name: '청자 빛 그릇', pot: '청자 빛 화분', lantern: '청색 등', tea: '유자차', gift: '창가의 작은 화분', giftLine: '새싹은 아침마다 창 쪽으로 돈다 물 주는 걸 잊으면 금방 티가 나는 게 나무다' },
  { id: 'red', color: '적', han: '火', el: '화', dir: '남', season: '여름', name: '붉은 그릇', pot: '붉은 화분', lantern: '붉은 등', tea: '오미자차', gift: '저녁에 켜는 등불', giftLine: '등은 해 지면 켜고 자기 전에 끈다 불은 켜 두는 것보다 끄는 때를 아는 게 어렵다' },
  { id: 'yellow', color: '황', han: '土', el: '토', dir: '중앙', season: '늦여름', name: '노란 그릇', pot: '노란 화분', lantern: '노란 등', tea: '대추차', gift: '손때 묻은 흙그릇', giftLine: '흙그릇은 뜨거운 걸 담아도 손에 뜨겁지 않다 흙은 받아 주는 게 일이다' },
  { id: 'white', color: '백', han: '金', el: '금', dir: '서', season: '가을', name: '흰 그릇', pot: '흰 화분', lantern: '흰 등', tea: '생강차', gift: '문 앞에 다는 작은 종', giftLine: '종은 문 앞에 달아라 들어올 때 한 번, 나갈 때 한 번 소리가 난다 누가 왔다 갔는지는 알고 살아라' },
  { id: 'black', color: '흑', han: '水', el: '수', dir: '북', season: '겨울', name: '검은 그릇', pot: '검은 화분', lantern: '검은 등', tea: '쌍화차', gift: '책상 위 물잔', giftLine: '물잔은 비면 채우고 차면 마셔라 책상에서 일어날 때마다 한 모금씩' },
];
const hj = (id, a, b) => byId[id].han + js(byId[id].el, a, b).slice(byId[id].el.length); // 한자에 조사 붙이기 (읽는 소리 기준)
const seedOf = (S) => E[S.profile?.seed ?? 0];
const compOf = (S) => E[S.profile?.companion ?? 0];
const orderFrom = (id) => { const out = [id]; while (out.length < 5) out.push(NEXT[out[out.length - 1]]); return out; };
const byId = Object.fromEntries(E.map((e) => [e.id, e]));
const NEXT = { blue: 'red', red: 'yellow', yellow: 'white', white: 'black', black: 'blue' }; // 상생: 목→화→토→금→수→목

// 찬장: 창이 왼쪽(동쪽)이므로 마주 보면 남쪽을 보고 선다 위=남, 아래=북, 왼쪽=동, 오른쪽=서
const NICHES = [
  { id: 'top', label: '위 칸', x: 42.5, y: 6.5 },
  { id: 'left', label: '왼쪽 칸', x: 27.8, y: 28.3 },
  { id: 'center', label: '가운데 칸', x: 42.5, y: 28.3 },
  { id: 'right', label: '오른쪽 칸', x: 57.4, y: 28.3 },
  { id: 'bottom', label: '아래 칸', x: 42.5, y: 51 },
];
const NICHE_ANSWER = { top: 'red', left: 'blue', center: 'yellow', right: 'white', bottom: 'black' };
const NAIVE = { top: 'black', left: 'white', center: 'yellow', right: 'blue', bottom: 'red' }; // 위=북으로 착각했을 때


function cycleSvg() {
  const ink = '#2a2622';
  const fills = { blue: '#5f9e9a', red: '#b8433a', yellow: '#d2a84a', white: '#eee8dc', black: '#2e2e2e' };
  const CX = 75, CY = 82, R = 46;
  const pts = E.map((e, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return [CX + R * Math.cos(a), CY + R * Math.sin(a), e]; });
  const hand = 'font-family="MihaejeHand, serif"';
  let s = `<svg viewBox="0 0 150 215" class="cycle-chart" role="img" aria-label="다섯 빛이 서로 낳는 순서와 방향, 색, 계절">`;
  s += `<text x="75" y="15" font-size="9.5" text-anchor="middle" fill="${ink}" ${hand}>서로 낳는 순서</text>`;
  pts.forEach(([x, y], i) => {
    const [nx, ny] = pts[(i + 1) % 5];
    const dx = nx - x, dy = ny - y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const sx = x + ux * 14, sy = y + uy * 14, ex = nx - ux * 15, ey = ny - uy * 15;
    s += `<path d="M${sx} ${sy} L${ex} ${ey}" stroke="${ink}" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M${ex} ${ey} l${-ux * 4 - uy * 2.6} ${-uy * 4 + ux * 2.6} M${ex} ${ey} l${-ux * 4 + uy * 2.6} ${-uy * 4 - ux * 2.6}" stroke="${ink}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  });
  pts.forEach(([x, y, e]) => {
    s += `<circle cx="${x}" cy="${y}" r="12" fill="${fills[e.id]}" stroke="${ink}" stroke-width="1"/><text x="${x}" y="${y + 4}" font-size="11" text-anchor="middle" fill="${e.id === 'white' || e.id === 'yellow' ? ink : '#f4efe4'}" font-family="serif">${e.han}</text>`;
  });
  // 아래 표: 방향 · 색 · 계절
  s += `<path d="M14 142 h122" stroke="${ink}" stroke-width=".8"/>`;
  E.forEach((e, i) => {
    const y = 156 + i * 12;
    s += `<circle cx="22" cy="${y - 3}" r="4" fill="${fills[e.id]}" stroke="${ink}" stroke-width=".6"/>`;
    s += `<text x="32" y="${y}" font-size="8.6" fill="${ink}" ${hand}>${e.han} ${e.el}</text><text x="62" y="${y}" font-size="8.6" fill="${ink}" ${hand}>${e.dir}쪽</text><text x="88" y="${y}" font-size="8.6" fill="${ink}" ${hand}>${e.color}색</text><text x="112" y="${y}" font-size="8.6" fill="${ink}" ${hand}>${e.season}</text>`;
  });
  s += `</svg>`;
  return s;
}

// 할머니식 풀이 — 이야기용 해석 좋고 나쁜 판정은 없다
const READ = {
  blue: { gen: '木 손님은 새 일 얘기를 하러 온다 가게 문 열 때부터 계획부터 꺼내 놓는다 말 끝나면 하나만 골라서 그거부터 하라고 해 준다', me: '뭘 새로 시작할 때 제일 신나는 사람이다 방학 첫날마다 공책부터 새로 샀지 끝까지 쓴 공책은 별로 없었다 그래도 된다 대신 하나는 끝까지 써 봐라', many: '木이 많으면 벌여 놓은 일이 많다 이번 달에 끝낼 거 하나만 정해라', none: '木이 없으면 시작을 미룬다 내일 할 거를 오늘 밤에 적어 두고 자라', tea: '유자차는 신맛이 있어서 오후에 졸릴 때 준다' },
  red: { gen: '火 손님은 오면 가게가 시끄러워진다 옆자리 손님한테 말도 먼저 건다 일은 혼자 다 떠안고 와서 지쳐 있을 때가 많다', me: '들어오면 가게가 환해지는 사람이다 손님들이 니 웃는 소리에 한 잔씩 더 시켰다 대신 혼자 다 하려다 지친다 일은 나눠 들어라', many: '火가 많으면 약속을 많이 잡는다 달력에 빈 저녁 하나는 남겨 둬라', none: '火가 없으면 처음엔 말이 없다 세 번째 오는 날부터 말이 많아진다', tea: '오미자차는 찬 걸로 낸다 말 많이 한 날 목에 좋다' },
  yellow: { gen: '土 손님은 남 얘기를 들어 주고 온 사람이다 자기 얘기는 차 다 식을 때쯤에야 꺼낸다 그때까지 기다려 준다', me: '남 얘기를 끝까지 들어 주는 사람이다 손님 하소연을 옆에 앉아 다 듣고 있던 게 너다 네 얘기는 아껴 두는데, 가끔은 꺼내라', many: '土가 많으면 버리는 걸 못 한다 서랍 하나는 비워 둬라', none: '土가 없으면 집에 와도 쉬는 자리가 없다 앉을 의자부터 하나 정해 둬라', tea: '대추차는 뜨겁게 낸다 끼니 거르고 온 손님한테 먼저 준다' },
  white: { gen: '金 손님은 앉자마자 따질 거부터 따진다 틀린 말은 아닌데 듣는 사람이 아프다 다 듣고 나서 한 마디만 줄여 보라고 한다', me: '싫은 건 싫다고 먼저 말하는 사람이다 생강차 안 마신다고 울던 날도 이유는 또박또박 댔다 그 말이 맞을 때가 많다 다만 한 번 숨 고르고 해라', many: '金이 많으면 남한테 바라는 게 많다 그 반만 말해라', none: '金이 없으면 거절을 못 한다 싫은 거 하나는 싫다고 해 봐라', tea: '생강차는 꿀을 많이 탄다 매운 걸 싫어하는 손님도 마신다' },
  black: { gen: '水 손님은 이사 얘기, 회사 옮기는 얘기를 들고 온다 한 군데 오래 못 있는다 지도 펴 놓고 같이 봐 준다', me: '어디 가든 금방 맞춰 들어가는 사람이다 처음 온 동네 애들하고도 하루면 친해졌지 그래도 한자리에 오래 있으면 답답해한다 그럴 땐 좀 걸어라', many: '水가 많으면 밤에 생각이 길어진다 열두 시 넘으면 불 끄고 누워라', none: '水가 없으면 쉬는 날에도 일을 한다 일주일에 한나절은 아무것도 하지 마라', tea: '쌍화차는 달걀 노른자를 띄워 낸다 감기 기운 있는 손님한테 준다' },
};
const CONTROL = { blue: 'yellow', yellow: 'black', black: 'red', red: 'white', white: 'blue' }; // 상극: 목극토 토극수 수극화 화극금 금극목
function relationLine(a, b) { // a=내 빛, b=상대 빛
  if (a === b) return `${byId[a].han} 하나가 제일 많다 좋을 땐 끝까지 가고 아니면 한 번에 무너진다 다른 빛 친구 하나는 곁에 둬라`;
  if (NEXT[b] === a) return `${hj(b, '은', '는')} ${hj(a, '을', '를')} 낳는 빛이다 옆에서 챙겨 주는 사람이 있다는 뜻이다 그 사람한테 고맙다는 말은 해라`;
  if (NEXT[a] === b) return `${hj(b, '은', '는')} ${hj(a, '이', '가')} 낳는 빛이다 네가 챙겨 주는 쪽이다 퍼 주다 지치면 가게 와서 한 잔 하고 가라`;
  if (CONTROL[b] === a) return `${hj(b, '은', '는')} ${hj(a, '을', '를')} 누르는 빛이다 남 말에 끌려가는 날이 있다 그런 날엔 네 차를 끓여라`;
  return `${hj(a, '이', '가')} ${hj(b, '을', '를')} 누르는 빛이다 네 말이 센 쪽이다 할 말 다 하고 나면 한 번은 물어봐라`;
}
function reading(profile) {
  profile = profile || { seed: 0, companion: 0, counts: [1, 1, 1, 1, 1] };
  const seed = E[profile.seed], comp = E[profile.companion];
  const missing = E.filter((e, i) => profile.counts[i] === 0);
  let other = comp;
  if (comp.id === seed.id) { let best = -1; E.forEach((e, i) => { if (i !== profile.seed && profile.counts[i] > best) { best = profile.counts[i]; other = e; } }); }
  const max = Math.max(...profile.counts);
  const tops = E.filter((e, i) => profile.counts[i] === max);
  const strong = max >= 3;
  const topLine = tops.length > 1 ? `제일 많은 빛은 ${tops.map((t) => t.han).join('·')} 같이 많다` : comp.id === seed.id ? `네 빛 ${hj(seed.id, '이', '가')} 제일 많기도 하다` : `제일 많은 빛은 ${hj(comp.id, '이다', '다')}`;
  return {
    seed, comp, missing, other, tops,
    me: READ[seed.id].me,
    many: `${topLine} ${strong ? READ[comp.id].many : '셋도 안 되니 센 건 아니다 고르게 있는 쪽이다'}`,
    none: missing.length ? missing.map((e) => READ[e.id].none).join(' ') : '다섯 빛이 다 있다 뭐 하나 빠졌다는 핑계는 못 댄다',
    relation: (comp.id === seed.id ? `그다음이 ${other.han}인데, ` : '') + relationLine(seed.id, other.id),
    tea: READ[seed.id].tea,
  };
}

function slipHtml(profile) {
  const seed = E[profile.seed];
  const fills = { blue: '#5f9e9a', red: '#b8433a', yellow: '#d2a84a', white: '#eee8dc', black: '#2e2e2e' };
  return `<p class="slip-head">할머니가 세는 법대로</p>
<div class="pillars">${(profile.pillars || []).map((p) => `<div class="pillar"><small>${p.label}</small><b>${p.text}</b><span>${p.elements.map((i) => E[i].han).join('') || '—'}</span></div>`).join('')}</div>
<div class="counts">${E.map((e, i) => `<div class="count"><i style="background:${fills[e.id]}"></i><b>${e.han}</b><span>${'●'.repeat(profile.counts[i])}${'○'.repeat(Math.max(0, 4 - profile.counts[i]))}</span><small>${profile.counts[i]}</small></div>`).join('')}</div>
<p class="slip-light">네 빛은 <b style="color:${fills[seed.id] === '#eee8dc' ? '#6b6248' : fills[seed.id]}">${seed.han} ${seed.el} · ${seed.color}색</b> <small>(태어난 날의 천간)</small></p>
<p class="slip-light">가장 많은 빛은 <b>${reading(profile).tops.map((t) => `${t.han} ${t.el}`).join(' · ')}</b>${profile.unknown ? ' <small>(시각을 몰라 시주는 뺐다)</small>' : ''}${profile.ambiguous ? ' <small>(절기 바뀌는 날이라 연·월은 미확정)</small>' : ''}</p>
<div class="slip-reading"><p class="slip-sub">할머니라면 이렇게 읽는다</p><p>${reading(profile).me}</p><p>${reading(profile).many}</p><p>${reading(profile).none}</p><p class="slip-note">좋고 나쁜 건 없다 할머니는 이 빛으로 차를 골랐고, 오늘은 이 빛이 열쇠가 된다 나머지 풀이는 가게 안에 있다</p></div>`;
}
function resultCard(profile, el, btn, next) {
  const card = el('div', 'slip-result');
  card.innerHTML = slipHtml(profile);
  card.append(btn('v2-primary', '접수표 들고 문 앞으로 →', next));
  return card;
}

export default {
  id: 'ohang',
  number: '010',
  title: '돌아오는 계절',
  subtitle: '오행당에 맡겨둔 것',
  genre: '오행 · 사주 미스터리',
  minutes: 20,
  difficulty: 2,
  cover: P + 'cover.webp',
  coverAlt: '비 오는 저녁, 불 켜진 오행당 문 앞에 선 사람',
  music: 'assets/music/ohang-v33.mp3',
  tagline: '접수표부터 써라 너도 오늘은 손님이다\n생일하고 난 시 적으면 네 빛이 나온다',
  blurb: '외할머니가 마흔 해 넘게 지킨 약차집 오행당\n입원한 할머니의 문자 한 통에 지원은 여섯 해 만에 그 골목으로 갑니다\n당신의 생년월일시로 다섯 빛을 세고, 그 빛대로 문이 열립니다',
  hintTitle: '할머니의 귀띔',
  storageKey: 'mihaeje-v2-ohang',
  tracesLabel: '할머니가 남긴 것',

  opening: {
    eyebrow: '3월 2일, 저녁',
    paragraphs: [
      '할머니가 넘어졌다는 연락은 이모한테서 왔고, 할머니한테서는 문자가 왔다. 가게 좀 봐 달라는 거였다. 찬장 맨 아래 서랍에 둔 걸 꼭 가져오라고.',
      '오행당. 외할머니가 마흔두 해 동안 약차를 끓인 가게다. 손님이 오면 생일하고 난 시부터 묻고, 다섯 빛을 세어서 차를 골라 줬다. 학교 다닐 때는 여름방학마다 거기서 살았는데, 대학에 들어간 뒤로는 뜸해졌고, 마지막으로 간 게 여섯 해 전이다.',
      '열쇠는 늘 두던 데 있다고 했다. 어디였더라, 되물으려는데 할머니 휴대폰이 꺼졌다.',
      '골목에 비가 조금 왔다. 문 앞 섬돌에 화분 다섯 개가 그대로 있고, 문 옆 작은 선반에 접수표 묶음이 놓여 있었다. 손님은 먼저 접수표부터 쓴다. 할머니 가게의 규칙이다.',
    ],
    cta: '접수표 쓰기',
  },

  intake: {
    render({ S, el, btn, done }) {
      const wrap = el('div', 'intake-wrap');
      const sheet = el('div', 'slip-form');
      sheet.innerHTML = `<p class="slip-head">오행당 접수표</p>
<p class="slip-note">손님 생일과 난 시를 적습니다 할머니는 이걸로 다섯 빛을 셉니다<br><small>적은 생일은 저장하지 않고, 센 결과만 이 브라우저에 남습니다</small></p>
<label class="slip-row"><span>생일 (양력)</span><input type="date" name="date" min="1901-01-01" max="2026-03-02" required></label>
<label class="slip-row"><span>난 시각</span><input type="time" name="time"></label>
<label class="slip-check"><input type="checkbox" name="unknown"> 시각은 모름</label>
<p class="slip-err" aria-live="polite"></p>`;
      const err = sheet.querySelector('.slip-err'); const time = sheet.querySelector('[name=time]'); const unk = sheet.querySelector('[name=unknown]');
      unk.onchange = () => { time.disabled = unk.checked; };
      const go = btn('v2-primary', '접수표 내기 →', async () => {
        err.textContent = '';
        try {
          if (!window.Solar) await new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'vendor/lunar-1.7.7.js'; sc.onload = res; sc.onerror = () => rej(Error('달력 자료를 불러오지 못했다 잠시 뒤 다시')); document.head.append(sc); });
          const dv = sheet.querySelector('[name=date]').value; if (!dv) throw Error('생일을 적어야 한다');
          const [y, m, d] = dv.split('-').map(Number);
          let hour = null, minute = 0;
          if (!unk.checked) { if (!time.value) throw Error('난 시각을 적거나, 모름에 표시한다'); [hour, minute] = time.value.split(':').map(Number); }
          const pr = birthProfile({ year: y, month: m, day: d, hour, minute }, window.Solar);
          const profile = { version: 1, pillars: pr.pillars, counts: pr.counts, seed: pr.seed, companion: pr.companion, unknown: pr.unknown, ambiguous: pr.ambiguous };
          wrap.replaceChildren(resultCard(profile, el, btn, () => done(profile)));
          window.scrollTo({ top: 0 });
        } catch (e) { err.textContent = e.message.replace(/을 입력해주세요$/, '을 적어야 한다').replace(/를 입력해주세요$/, '를 적어야 한다').replace(/을 확인해주세요$/, '을 다시 본다'); }
      });
      const ex = btn('v2-secondary', '생일 대신 예시 손님으로 해 보기', () => { sheet.querySelector('[name=date]').value = '1990-05-05'; unk.checked = false; time.disabled = false; time.value = '10:00'; go.click(); });
      wrap.append(el('p', 'v2-eyebrow', '문 옆 선반 · 접수표'), sheet, go, el('p', 'slip-note', '생일을 적기 싫으면 예시 손님(1990년 5월 5일 오전 10시)으로 해도 된다 풀이와 열쇠가 그 빛대로 바뀐다'), ex);
      return wrap;
    },
  },

  traces: [
    { device: 'pots', label: '섬돌의 열쇠' },
    { device: 'bowls', label: '다섯 그릇' },
    { device: 'lanterns', label: '뒷방의 등' },
  ],

  scenes: [
    {
      id: 'front',
      name: '오행당 문 앞',
      image: P + 'front.webp',
      arrive: (S) => S.solved.includes('pots') ? '문은 열려 있다 청자 빛 화분은 내가 들었다 놓은 자리에 조금 비뚤게 앉아 있다 문에는 할머니가 오래전에 붙여 둔 종이가 그대로' : '문은 잠겨 있고, 문에는 할머니가 오래전에 붙여 둔 종이가 그대로 있었다 섬돌 위 화분 다섯 개 어릴 때 물 주라고 시키던 그 화분들이다',
      hotspots: [
        { id: 'phone', x: 9, y: 90, label: '주머니 속 휴대폰', kind: 'doc', doc: 'chat' },
        { id: 'paper', x: 50, y: 38, label: '문에 붙은 종이', kind: 'doc', doc: 'doorpaper' },
        { id: 'pots', x: 50, y: 86, label: '섬돌 위 화분', kind: 'device', device: 'pots' },
        { id: 'myslip', x: 88, y: 90, label: '내가 쓴 접수표', kind: 'doc', doc: 'myslip' },
      ],
    },
    {
      id: 'inside',
      name: '찻집 안',
      image: P + 'inside.webp',
      unlockedBy: 'pots',
      arrive: (S) => S.solved.includes('bowls') ? '찬장 십자 칸에 그릇 다섯이 제자리에 앉아 있다 내려놓은 주전자와 항아리는 탁자 위에 줄지어 있고, 맨 아래 서랍은 열린 채다 뒷방 열쇠는 내 손에 있다' : '불을 켜자 약재 냄새가 먼저 왔다 탁자, 방석, 차 통, 메뉴판 벽에 걸린 사진 액자 그리고 안쪽 벽의 찬장 찬장 칸마다 주전자며 항아리가 올라가 있는데, 그 아래 탁자에는 그릇 다섯 개가 보자기 위에 따로 놓여 있었다',
      hotspots: [
        { id: 'photo', x: 34, y: 34, label: '벽에 걸린 사진', kind: 'doc', doc: 'oldphoto' },
        { id: 'board', x: 92, y: 20, label: '메뉴판', kind: 'doc', doc: 'board' },
        { id: 'notebook', x: 78, y: 52, label: '접수대 서랍의 공책', kind: 'doc', doc: 'notebook' },
        { id: 'memo', x: 44, y: 47, label: '찬장에 붙은 메모', kind: 'doc', doc: 'memo' },
        { id: 'cabinet', x: 52, y: 29, label: '찬장과 다섯 그릇', kind: 'device', device: 'bowls' },
      ],
    },
    {
      id: 'back',
      name: '뒷방',
      image: P + 'back.webp',
      unlockedBy: 'bowls',
      arrive: (S) => S.solved.includes('lanterns') ? '등 다섯 개가 켜져 있다 책상 위 접수함 뚜껑이 열려 있고, 안은 비었다 접수표는 내 손에 있다' : '뒷방은 할머니가 장부를 쓰던 방이다 대나무 장대에 등 다섯 개가 걸려 있고, 책상 위에 접수함이 있었다 접수함은 잠겨 있고, 책상 위에 메모가 한 장',
      hotspots: [
        { id: 'slips', x: 30, y: 76, label: '가져온 접수표 묶음', kind: 'doc', doc: 'slips' },
        { id: 'deskmemo', x: 58, y: 72, label: '책상 위 메모', kind: 'doc', doc: 'deskmemo' },
        { id: 'lanterns', x: 51, y: 24, label: '장대에 걸린 등 다섯', kind: 'device', device: 'lanterns' },
      ],
    },
  ],

  docs: {
    myslip: {
      title: '내가 쓴 접수표',
      kind: '오늘 저녁 · 내 빛',
      html: (S) => `<div class="slip-result">${slipHtml(S.profile || { seed: 0, companion: 0, counts: [1, 1, 1, 1, 1], pillars: [] })}</div>`,
    },
    chat: {
      title: '할머니의 문자',
      kind: '오늘 오후',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>할머니</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 3월 2일 월요일</div>
<div class="chat-row them"><span class="chat-avatar">茶</span><div class="chat-col"><span class="chat-name">할머니</span><div class="chat-bubble">지원아 할미다</div><div class="chat-bubble">가게좀 봐줘라 일주일은 못나간다</div><div class="chat-bubble">찬장 맨아래 서랍에 둔거 꼭 가져와라</div></div><span class="chat-time">오후 4:02</span></div>
<div class="chat-row me"><span class="chat-meta">오후 4:03</span><div class="chat-bubble">할머니 괜찮아? 병원 어디야</div></div>
<div class="chat-row me"><span class="chat-meta">오후 4:03</span><div class="chat-bubble">열쇠는?</div></div>
<div class="chat-row them"><span class="chat-avatar">茶</span><div class="chat-col"><span class="chat-name">할머니</span><div class="chat-bubble">늘 두던데 잇다</div><div class="chat-bubble">불 낳는놈 밑에</div><div class="chat-bubble">문에 붙인거 보면안다</div><div class="chat-bubble">접수표 부터 써라</div><div class="chat-bubble">너도 오늘은 손님이다 생일하고 난시</div><div class="chat-bubble">밧데리가</div></div><span class="chat-time">오후 4:05</span></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오후 4:06</span><div class="chat-bubble">뭐가 뭘 낳아?? 할머니</div></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오후 4:40</span><div class="chat-bubble">할머니</div></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    doorpaper: {
      title: '문에 붙은 종이',
      kind: '할머니 글씨 · 누렇게 바랜',
      html: `<figure class="prop doorpaper"><img src="${P}props/doorpaper.webp" alt="문에 테이프로 붙인 누런 종이" decoding="async"><div class="on-doorpaper">${cycleSvg()}</div></figure><p>어릴 때 이게 뭐냐고 물었을 때 할머니는 "차 끓이는 순서"라고만 했다 그게 아니라는 건 나중에 알았다 다섯 색, 다섯 방향, 다섯 계절 가게 이름이 오행당인 이유</p>`,
    },
    oldphoto: {
      title: '벽에 걸린 사진',
      kind: '2009년 여름',
      html: `<figure class="prop oldphoto"><img src="${P}props/oldphoto.webp" alt="찻집에서 할머니와 찻잔을 든 어린 지원" decoding="async"></figure><p>액자를 뒤집으니 뒷면에 할머니 글씨</p><blockquote class="hand">2009년 8월, 지원이<br>제 빛 차 세 잔째 수박은 안 먹고 차만 마심</blockquote><p class="aside">그해 여름 할머니는 내 빛을 세어 주고 그 차만 내줬다 돈은 한 번도 받지 않았고, 대신 장부에 적었다</p>`,
    },
    board: {
      title: '메뉴판',
      kind: '분필 글씨',
      html: `<figure class="prop board"><img src="${P}props/board2.webp" alt="분필로 쓴 오행당 차림: 유자차(木) 5,000 · 오미자차(火) 4,500 · 대추차(土) 4,000 · 생강차(金) 3,500 · 쌍화차(水) 6,000" decoding="async"></figure><p>차 이름 옆에 빛이 하나씩 적혀 있다 할머니는 손님 빛을 세고 그 빛의 차를 내줬다</p>`,
    },
    notebook: {
      title: '할머니의 풀이 공책',
      kind: '손님 빛 읽는 법',
      html: (S) => { const r = reading(S.profile || { seed: 0, companion: 0, counts: [1, 1, 1, 1, 1] }); return `<figure class="prop slips"><img src="${P}props/slips.webp" alt="접수표 묶음 옆 공책" decoding="async"></figure><p>접수대 서랍에 있던 공책 할머니가 손님 빛을 읽을 때 보던 것이다 다섯 빛마다 한 장씩, 내 빛 장에는 귀퉁이가 접혀 있다</p><div class="notes-list reading-list">${E.map((e) => `<div class="reading-item${e.id === r.seed.id ? ' mine' : ''}"><b>${e.han} ${e.el} · ${e.color} · ${e.dir} · ${e.season}</b><p>${e.id === r.seed.id ? READ[e.id].me : READ[e.id].gen}</p><p>많으면 — ${READ[e.id].many}</p><p>없으면 — ${READ[e.id].none}</p><p>차 — ${e.tea} ${READ[e.id].tea}</p></div>`).join('')}</div><p class="aside">내 빛 장 귀퉁이에 할머니 글씨로 「지원」이라고 적혀 있다 언제 적은 건지 모르겠다</p>`; },
    },
    memo: {
      title: '찬장에 붙은 메모',
      kind: '할머니 글씨',
      html: `<figure class="prop notecard"><img src="${P}props/notecard.webp" alt="찬장에 테이프로 붙인 쪽지" decoding="async"><div class="on-notecard">그릇은 제 방향에<br>그릇 밑굽이랑 칸 바닥 홈이 맞아야 눌린다<br>다섯 다 눌려야 서랍 빗장이 빠진다<br><br>창이 해 뜨는 쪽이다<br>헷갈리면 창부터 봐라<br>위 칸은 네가 바라보는 쪽이다</div></figure><p>찬장을 마주 보고 섰다 한지 창은 왼쪽에 있다 할아버지가 살아 계실 때 장난삼아 짜 둔 찬장이라고 들었다</p>`,
    },
    slips: {
      title: '서랍 속 접수표 묶음',
      kind: '할머니 장부',
      html: (S) => `<figure class="prop slips"><img src="${P}props/slips.webp" alt="집게로 묶은 접수표 묶음" decoding="async"></figure><p>장부라기보다 쪽지 묶음이다 손님 이름 대신 내 이름이 제일 많다</p><div class="slip-list">
<p><b>2007년 12월</b> 지원 첫 방문 감기 생강차 안 마시려고 울었음</p>
<p><b>2008년 8월</b> 지원 차는 안 마시고 수박만 먹음</p>
<p><b>2009년 8월</b> 지원 ${seedOf(S).tea} 세 잔째 수박은 안 먹음</p>
<p><b>2011년 8월</b> 지원 대추차 숙제 안 함</p>
<p><b>2014년 2월</b> 지원 쌍화차 졸업했다고 옴</p>
<p><b>2020년 9월</b> 지원 유자차 취직했다고 함</p>
<p><b>2026년 3월</b> 지원 (비어 있음)</p>
</div><p class="aside">2026년 3월 칸은 비어 있다 오늘 내가 쓴 접수표가 들어갈 자리다</p>`,
    },
    deskmemo: {
      title: '책상 위 메모',
      kind: '할머니 글씨',
      html: `<figure class="prop notecard"><img src="${P}props/notecard.webp" alt="책상 위 쪽지" decoding="async"><div class="on-notecard">접수함 열쇠는 없다<br>등을 켜면 열린다<br><br>네 빛부터<br>낳는 순서로 다섯 개 다</div></figure><p>등 다섯 개는 색이 다 다르다 내 빛이 무슨 색인지는 접수표에 있고, 낳는 순서는 문에 붙은 종이에 있다</p>`,
    },
    final: {
      title: '접수함 속 접수표',
      kind: '받는 사람: 지원',
      locked: true,
      html: (S) => { const r = reading(S.profile), e = r.seed; return `<figure class="prop slips"><img src="${P}props/slips.webp" alt="접수표" decoding="async"></figure><blockquote class="hand">접수 · 2026년 3월<br>받는 사람 지원 · 빛 ${e.han} ${e.el}<br><br>너는 ${r.me}<br>${r.many}<br>${r.none}<br>${r.relation}<br><br>그래서 네 차는 ${e.tea}다 ${r.tea}<br>${e.gift} 챙겨 뒀다 찬장 ${e.dir === '중앙' ? '가운데' : e.dir + '쪽'} 칸이다<br>${e.giftLine}<br><br>서랍 것은 가게 열쇠 뭉치하고 등기부다<br>이모가 가게 팔자고 한 지 삼 년 됐다<br>그래도 네가 올 거라 생각해서 안 팔았다<br>어릴 땐 여름마다 왔고, 커서도 뜸하게나마 결국 왔으니까<br><br>가게는 네 거다 하고 싶으면 해라<br>하기 싫으면 열쇠만 갖고 있어라<br>그래도 계절 돌면 한 번씩은 와라<br><br>등은 끄고 가라 전기세 나온다</blockquote>`; },
    },
  },

  devices: {
    pots: {
      title: '섬돌 위 화분',
      scene: 'front',
      intro: '화분 다섯 개 할머니 말로는 열쇠가 "불 낳는 놈 밑에" 있다 들어 볼 화분을 고르면 된다',
      docs: ['chat', 'doorpaper'],
      hintCode: 'O-S01',
      hints: [
        '할머니 문자의 "불 낳는 놈"이 무슨 뜻인지는 문에 붙은 종이에 있습니다 화분 다섯은 다섯 빛입니다',
        '종이의 화살표는 낳는 쪽에서 태어나는 쪽으로 갑니다 불을 가리키는 화살표를 거꾸로 따라가 보세요',
        '청자 빛 화분(木·청) 밑에 열쇠가 있습니다',
      ],
      initial: () => ({ pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'pots-wrap');
        const step = el('div', 'prop potstep'); const im = el('img'); im.src = P + 'front.webp'; im.alt = '섬돌 위 화분 다섯'; step.append(im);
        const xs = { blue: 17.2, red: 34.4, yellow: 50, white: 65.6, black: 82.8 };
        E.forEach((e) => {
          const b = el('button', 'pot' + (d.pick === e.id ? ' picking' : '')); b.type = 'button'; b.style.left = xs[e.id] + '%';
          b.setAttribute('aria-label', e.pot); b.title = e.pot;
          b.onclick = () => { d.pick = e.id; save(); };
          step.append(b);
        });
        wrap.append(step, el('p', 'pick-label', d.pick ? `${js(byId[d.pick].pot, '을', '를')} 들어 보기로 했다` : '화분을 하나 고르면 들어 본다'));
        return wrap;
      },
      commitLabel: '화분 들어 보기',
      canCommit: (d) => !!d.pick,
      check(d) {
        if (d.pick === 'blue') return { ok: true };
        const e = byId[d.pick];
        if (d.pick === 'red') return { ok: false, msg: '붉은 화분 밑은 젖은 흙뿐이다 불은 "낳는 놈"이 아니라 낳아지는 쪽이다 불 앞의 화살표를 보자' };
        return { ok: false, msg: `${e.pot} 밑에는 지렁이 한 마리 ${hj(e.id, '이', '가')} 낳는 건 불이 아니다 종이의 화살표를 한 번 더` };
      },
      reveal: {
        title: '나무가 불을 낳는다',
        text: '청자 빛 화분을 들자 비닐에 싼 열쇠가 있었다 어릴 때 내가 숨겨 두던 바로 그 자리다',
        scene: ['자물쇠가 뻑뻑했다 두 번 돌려서 문을 열었다 안은 캄캄하고, 약재 냄새가 났다'],
        unlock: 'inside',
      },
    },

    bowls: {
      title: '찬장과 다섯 그릇',
      scene: 'inside',
      intro: '칸의 주전자와 항아리를 다 내려놓으니 십자 모양으로 다섯 칸이 비었다 칸 바닥마다 홈이 파여 있다 보자기 위 그릇 다섯을 제 방향 칸에 놓으면 아래 서랍 빗장이 빠진다고 했다',
      docs: ['memo', 'doorpaper'],
      hintCode: 'O-S02',
      hints: [
        '색마다 방향이 있습니다 문에 붙은 종이에 적혀 있어요 그런데 찬장의 "위"가 북쪽일까요',
        '창은 해 뜨는 쪽에 냈습니다 찬장 앞에 서서 창이 어느 손 쪽에 있는지 보면, 내가 어느 방향을 보고 서 있는지 나옵니다',
        '남쪽을 보고 서 있습니다 위=남(적), 아래=북(흑), 왼쪽=동(청), 오른쪽=서(백), 가운데=황',
      ],
      initial: () => ({ placed: {}, held: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'bowls-wrap');
        const cab = el('div', 'prop cabinet'); const im = el('img'); im.src = P + 'props/cabinet.webp'; im.alt = '십자 모양으로 칸이 난 찬장 왼쪽에 한지 창'; cab.append(im);
        NICHES.forEach((n) => {
          const bid = d.placed[n.id];
          const b = el('button', 'niche' + (bid ? ' filled' : '') + (d.held && !bid ? ' open' : '')); b.type = 'button'; b.style.left = n.x + '%'; b.style.top = n.y + '%';
          b.setAttribute('aria-label', `${n.label}${bid ? ': ' + byId[bid].name : ' (비어 있음)'}`);
          if (bid) { const bi = el('img', 'bowl-img'); bi.src = P + 'props/bowl-' + bid + '.webp'; bi.alt = byId[bid].name; b.append(bi); }
          b.onclick = () => {
            if (bid) { delete d.placed[n.id]; d.held = bid; save(); return; }
            if (d.held) { d.placed[n.id] = d.held; d.held = null; save(); }
          };
          cab.append(b);
        });
        wrap.append(cab);
        const tray = el('div', 'bowl-tray');
        E.filter((e) => !Object.values(d.placed).includes(e.id)).forEach((e) => {
          const b = el('button', 'bowl-pick' + (d.held === e.id ? ' picking' : '')); b.type = 'button'; b.setAttribute('aria-label', e.name + ' 집기');
          const bi = el('img'); bi.src = P + 'props/bowl-' + e.id + '.webp'; bi.alt = e.name; b.append(bi);
          b.onclick = () => { d.held = d.held === e.id ? null : e.id; save(); };
          tray.append(b);
        });
        wrap.append(el('p', 'pick-label', d.held ? `${js(byId[d.held].name, '을', '를')} 들었다 놓을 칸을 누르자` : '보자기 위 그릇을 집은 다음 찬장 칸을 누른다 · 놓은 그릇을 누르면 도로 집는다'), tray);
        return wrap;
      },
      commitLabel: '서랍 쇠 당겨 보기',
      check(d) {
        const empty = NICHES.filter((n) => !d.placed[n.id]);
        if (empty.length) return { ok: false, msg: '빈 칸이 있다 다섯이 다 들어가야 빗장이 움직인다' };
        if (NICHES.every((n) => d.placed[n.id] === NICHE_ANSWER[n.id])) return { ok: true };
        if (NICHES.every((n) => d.placed[n.id] === NAIVE[n.id])) return { ok: false, msg: '빗장이 꿈쩍 않는다 위 칸이 북쪽이라고 누가 그랬나 창이 어느 쪽에 있는지 다시 보자 해 뜨는 쪽이 왼쪽이면 나는 어디를 보고 서 있나' };
        return { ok: false, msg: '빗장이 꿈쩍 않는다 창(동쪽)이 왼쪽에 있다는 것부터 방향을 다시 잡는다' };
      },
      reveal: {
        title: '남쪽을 보고 서서',
        text: '다섯 번째 그릇이 홈에 맞아 눌리자 찬장 아래에서 빗장 빠지는 소리가 났다 맨 아래 서랍이 손가락 하나만큼 나왔다',
        scene: ['서랍 안에 열쇠 뭉치, 서류 봉투, 집게로 묶은 접수표 묶음 맨 아래에 꼬리표 달린 열쇠가 하나 더 「뒷방」', '찬장을 마주 보면 남쪽이다 할머니가 차 끓일 때 늘 남쪽을 보고 앉았다는 걸 그제야 떠올렸다'],
        unlock: 'back',
      },
    },

    lanterns: {
      title: '장대에 걸린 등 다섯',
      scene: 'back',
      intro: '등 다섯 개, 스위치가 하나씩 "네 빛부터, 낳는 순서로 다섯 개 다" 켜면 접수함이 열린다',
      docs: ['deskmemo', 'doorpaper', 'myslip'],
      hintCode: 'O-S03',
      hints: (S) => { const o = orderFrom(seedOf(S).id); return [
        '"네 빛부터, 낳는 순서로"를 둘로 나눠 읽어 보세요 네 빛은 접수표에, 낳는 순서는 문에 붙은 종이에 있습니다',
        '화살표는 한 바퀴를 돕니다 다섯 개를 다 켜면 마지막 등은 내 빛 바로 앞 빛입니다',
        o.map((id) => byId[id].lantern).join(' → '),
      ]; },
      initial: () => ({ lit: [] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'lanterns-wrap');
        const pole = el('div', 'prop lanternpole'); const im = el('img'); im.src = P + 'back.webp'; im.alt = '장대에 걸린 등 다섯'; pole.append(im);
        const xs = { blue: 17.1, red: 34.2, yellow: 51.3, white: 68.4, black: 84.2 };
        E.forEach((e) => {
          const on = d.lit.includes(e.id);
          const b = el('button', 'lantern ' + e.id + (on ? ' on' : '')); b.type = 'button'; b.style.left = xs[e.id] + '%';
          b.setAttribute('aria-label', `${e.lantern}${on ? ' (켜짐 · ' + (d.lit.indexOf(e.id) + 1) + '번째)' : ''}`);
          if (on) b.append(el('span', 'lantern-order', String(d.lit.indexOf(e.id) + 1)));
          b.onclick = () => { if (!on) { d.lit.push(e.id); save(); } };
          pole.append(b);
        });
        wrap.append(pole);
        const row = el('div', 'pick-row');
        const reset = el('button', 'chip', '다 끄고 다시'); reset.type = 'button'; reset.onclick = () => { d.lit = []; save(); }; row.append(reset);
        wrap.append(el('p', 'pick-label', d.lit.length ? `${d.lit.length}개 켜짐: ${d.lit.map((id) => byId[id].lantern).join(' → ')}` : '등을 누르면 켜진다 켠 순서가 남는다'), row);
        return wrap;
      },
      commitLabel: '접수함 열어 보기',
      check(d, S) {
        const ORDER = orderFrom(seedOf(S).id);
        if (d.lit.length < 5) return { ok: false, msg: `${d.lit.length}개만 켜져 있다 다섯 개 다 켜야 한다` };
        if (d.lit.every((id, i) => id === ORDER[i])) return { ok: true };
        const c = compOf(S);
        if (d.lit[0] === c.id && c.id !== seedOf(S).id) return { ok: false, msg: `${byId[d.lit[0]].lantern}부터 켰다 ${hj(c.id, '은', '는')} 제일 많은 빛이지 내 빛이 아니다 접수표의 "네 빛"을 다시 보자` };
        return { ok: false, msg: '접수함이 그대로다 접수표의 내 빛과 문에 붙은 종이의 화살표를 다시 본다' };
      },
      reveal: {
        title: '내 빛에서 시작해서',
        text: '다섯 번째 등이 켜지자 접수함 뚜껑이 딸깍 열렸다 안에는 접수표가 딱 한 장 받는 사람 칸에 「지원」',
        scene: ['등 다섯 개가 한 바퀴 돌아 다시 내 빛으로 이어졌다 할머니가 손님마다 이걸 해 줬다는 걸, 내 차례가 되어서야 알았다'],
        unlockDoc: 'final',
        ending: true,
        endingLabel: '다음 날 아침, 병원으로',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '매화가 핀 병실 창가에서 할머니에게 찻잔을 건네는 지원',
    eyebrow: '3월 3일, 아침',
    title: '돌아오는 계절',
    paragraphs: (S) => {
      const e = seedOf(S), r = reading(S.profile);
      const base = [
        `병원 앞 매화가 일찍 피어 있었다 보온병에 ${e.tea}를 담아 갔다 내 빛의 차다 가게 불은 다 끄고, 등도 끄고, 열쇠 뭉치와 ${js(e.gift, '은', '는')} 가방에 넣었다`,
        '"서랍 것 가져왔냐"',
        '"뒷방까지 가게 해 놓고"',
        '할머니가 웃었다 "니가 길을 잊었나 보려고"',
        '"접수표는 썼고?"',
        `"썼어 ${e.han}, ${js(e.el, '이래', '래')}"`,
        `"그래, ${js(e.el, '이지', '지')} 애 때부터 ${js(e.el, '이었다', '였다')}" 할머니는 내 빛을 알고 있었다 마흔두 해 동안 손님 빛을 세던 사람이 손녀 빛을 모를 리가 없었다`,
        `"${hj(e.id, '은', '는')} 말이다" 할머니가 찻잔을 든 채로 접수표에 쓴 풀이를 처음부터 다시 했다 토씨 하나 안 틀렸다 병실 옆 침대 아주머니가 듣다가 웃었다 "손녀 사주를 병실에서 보시네"`,
        '"접수표에 다 적어 놓고 왜 또 해"',
        `"적은 거랑 듣는 건 다르다" ${r.missing.length ? '없는 빛 얘기를 할 때 할머니는 목소리를 낮췄다' : '다섯이 다 있다는 대목에서 할머니는 조금 자랑스러워 보였다'} 그러고는 보온병 쪽으로 턱짓을 했다 "그래서 ${e.tea}다" 이모한테 가게 얘기를 들었냐고 물었더니 할머니는 대답 대신 찻잔을 받았다`,
      ];
      if (!S.choice) return base;
      const tail = {
        keep: [`접수표 마지막 장에 적었다 「${e.gift} 받음 계절 돌면 또 온다」 할머니가 들여다보더니 한마디 했다 "글씨는 나 닮았네"`, '계절이 바뀌는 첫 주말마다 오행당 문을 연다 할머니 자리에 앉아 남쪽을 보고 차를 끓이고, 접수표 묶음에 내 이름이 한 장씩 늘어난다'],
        release: ['접수표 마지막 장에 적었다 「가게는 못 하겠어 열쇠는 가지고 있을게」 할머니는 한참 보더니 접어서 내 가방에 도로 넣었다 "그것도 대답이다"', '오행당 문은 닫혀 있다 그래도 섬돌 화분에는 물을 준다 봄마다, 청자 빛 화분부터'],
        share: ['접수표 마지막 장에 적었다 「다음 손님은 내가 받을게 빛 세는 법 가르쳐 줘」 할머니가 찻잔을 내려놓았다 "퇴원하면 바로다 한 달은 걸린다"', '퇴원한 날 할머니는 접수표 묶음부터 찾았다 첫 손님은 이모였다 이모 빛은 火였고, 둘이 한참 싸웠다'],
      }[S.choice];
      return base.concat(tail);
    },
    choice: {
      prompt: '접수표 마지막 장, 비어 있는 칸에 뭐라고 적을까',
      options: [
        { id: 'keep', label: '계절 돌면 또 온다' },
        { id: 'release', label: '가게는 못 하겠어, 열쇠는 가지고 있을게' },
        { id: 'share', label: '다음 손님은 내가 받을게' },
      ],
    },
    afterword: (S) => `${js(seedOf(S).gift, '은', '는')} ${seedOf(S).id === 'blue' ? '내 방 창가' : seedOf(S).id === 'white' ? '우리 집 문 앞' : '내 책상 위'}에 있다 ${seedOf(S).giftLine}`,
    unlockDoc: 'final',
    next: { href: 'play.html?case=pet-home', title: '첫 번째 보호자', line: '다음은 동물병원 접수대 이야기입니다' },
  },
};
