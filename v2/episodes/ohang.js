// 오행당 · 돌아오는 계절 — ★3. 이야기·자료·장치가 전부 이 파일에 있습니다
// 생년월일시가 세 장치에 쓰인다: 화분(내 빛을 낳는 빛) · 차 통(태어난 철 = 한 번도 안 온 철) · 등(내 빛부터 누르는 순서)
// 손동작: 화분 하나 들기 → 그릇 칸에 놓기 → 차 통 하나 열기 → 메모를 등잔에 비춰 보고 등 켜기 → 차 통에서 숟갈 세어 주전자에 넣기(고름차)
// 고름차: 접수표 다섯 빛 수에서 제일 많은 빛에 나머지를 모자란 만큼 채운다 (빛마다 max − 내 수 숟갈, 제일 많은 빛은 0)
import { birthProfile } from '../../ohang-rules.js';
const P = 'assets/v2/ohang/';
const js = (w, a, b) => { const c = w.charCodeAt(w.length - 1); if (c < 0xac00 || c > 0xd7a3) return w + a; return w + ((c - 0xac00) % 28 ? a : b); }; // 받침 있음→a, 없음→b

// 다섯 빛: 색 ↔ 오행 ↔ 방향 ↔ 계절
const E = [
  { id: 'blue', color: '청', han: '木', el: '목', dir: '동', season: '봄', name: '청자 빛 그릇', pot: '청자 빛 화분', lantern: '청자 빛 등', tea: '유자차', gift: '작은 화분', homeAt: '내 방 창가', shopAt: '오행당 창가', giftLine: '새싹은 아침마다 창 쪽으로 돈다 물 주는 걸 잊으면 금방 티가 나는 게 나무다' },
  { id: 'red', color: '적', han: '火', el: '화', dir: '남', season: '여름', name: '붉은 그릇', pot: '붉은 화분', lantern: '붉은 등', tea: '오미자차', gift: '작은 등불', homeAt: '내 방 책상 옆', shopAt: '오행당 접수대 옆', giftLine: '등은 해 지면 켜고 자기 전에 끈다 불은 켜 두는 것보다 끄는 때를 아는 게 어렵다' },
  { id: 'yellow', color: '황', han: '土', el: '토', dir: '중앙', season: '늦여름', name: '노란 그릇', pot: '노란 화분', lantern: '노란 등', tea: '대추차', gift: '손때 묻은 흙그릇', homeAt: '우리 집 부엌 찬장', shopAt: '오행당 찬장 가운데 칸', giftLine: '흙그릇은 뜨거운 걸 담아도 손에 뜨겁지 않다 흙은 받아 주는 게 일이다' },
  { id: 'white', color: '백', han: '金', el: '금', dir: '서', season: '가을', name: '흰 그릇', pot: '흰 화분', lantern: '흰 등', tea: '생강차', gift: '작은 종', homeAt: '우리 집 문 앞', shopAt: '오행당 문 앞', giftLine: '종은 문 앞에 달아라 들어올 때 한 번, 나갈 때 한 번 소리가 난다 누가 왔다 갔는지는 알고 살아라' },
  { id: 'black', color: '흑', han: '水', el: '수', dir: '북', season: '겨울', name: '검은 그릇', pot: '검은 화분', lantern: '검은 등', tea: '쌍화차', gift: '물잔', homeAt: '내 책상 위', shopAt: '오행당 접수대 위', giftLine: '물잔은 비면 채우고 차면 마셔라 책상에서 일어날 때마다 한 모금씩' },
];
const byId = Object.fromEntries(E.map((e) => [e.id, e]));
const hj = (id, a, b) => byId[id].han + js(byId[id].el, a, b).slice(byId[id].el.length); // 한자에 조사 붙이기 (읽는 소리 기준)
const NEXT = { blue: 'red', red: 'yellow', yellow: 'white', white: 'black', black: 'blue' }; // 상생: 목→화→토→금→수→목
const PREV = Object.fromEntries(Object.entries(NEXT).map(([a, b]) => [b, a]));
const CONTROL = { blue: 'yellow', yellow: 'black', black: 'red', red: 'white', white: 'blue' }; // 상극: 목극토 토극수 수극화 화극금 금극목
const seedOf = (S) => E[S.profile?.seed ?? 0];
const dirTxt = (e) => (e.dir === '중앙' ? '가운데' : e.dir + '쪽');
const TEA_FILL = { blue: '#c9a227', red: '#a3302a', yellow: '#8a4b22', white: '#d8b36a', black: '#3b2418' }; // 숟갈 색 (차 빛깔)
const brewWant = (S) => { const c = S.profile?.counts || [1, 1, 1, 1, 1]; const m = Math.max(...c); return Object.fromEntries(E.map((e, i) => [e.id, m - c[i]])); };
const tasteLine = (S) => { const w = brewWant(S); const m = Math.max(...Object.values(w)); const top = E.filter((e) => w[e.id] === m); return top.length === 1 ? `"${top[0].tea} 맛이 제일 세다 숟갈은 맞게 셌네"` : '"고르게 들어갔네 숟갈은 맞게 셌네"'; };
const controlOrder = (id) => { const out = [id]; while (out.length < 5) out.push(CONTROL[out[out.length - 1]]); return out; };

// 할머니 달력: 철은 다섯 (봄 3·4 · 여름 5·6 · 늦여름 7·8 · 가을 9·10 · 겨울 11~2)
const SEASON_OF = { 3: 'blue', 4: 'blue', 5: 'red', 6: 'red', 7: 'yellow', 8: 'yellow', 9: 'white', 10: 'white', 11: 'black', 12: 'black', 1: 'black', 2: 'black' };
const birthSeason = (S) => byId[SEASON_OF[S.profile?.month || 5]];
// 장부: 태어난 철에는 한 번도 안 왔다 (생일상은 늘 집에서) 나이로 적어서 생년과 어긋나지 않게
// 플레이어는 9살(2016년생)~66살(1960년생) · 어린 플레이어도 태어난 철을 뺀 네 철이 장부에 다 나오게 채운다
const ageOf = (S) => S.profile?.age ?? 36;
const youngOf = (S) => ageOf(S) < 18;
function ledger(S) {
  const bs = SEASON_OF[S.profile?.month || 5];
  const A = ageOf(S);
  // 마지막 방문: 어른은 여섯 해 전, 10대는 세 해 전, 더 어리면 두 해 전 (오프닝은 '요 몇 해 뜸했다'로 나이 중립)
  const last = A - (A >= 20 ? 6 : A >= 14 ? 3 : 2);
  const lastM = [10, 4, 1, 6].find((m) => SEASON_OF[m] !== bs);
  // 사진 속 여름 (사진 아이는 아홉 살 남짓 · 어린 플레이어면 마지막 방문 전 해로)
  const photo = { a: Math.min(9, last - 1), m: bs === 'yellow' ? 6 : 8, t: bs === 'yellow' ? '제 빛 차 세 잔째 수박은 안 먹음' : '방학 내내 있음 제 빛 차 세 잔째 수박은 안 먹음', photo: true };
  const pool = [
    { a: 7, m: 12, t: '감기 기운 생강차 안 마시려고 울었음' },
    { a: 8, m: 3, t: '입학 선물 받으러 옴 유자차 반 잔' },
    { a: 10, m: 6, t: '기말 끝났다고 옴 오미자차 찬 걸로 두 잔' },
    { a: 11, m: 7, t: '방학 숙제 안 함 대추차 먹고 낮잠' },
    { a: 12, m: 9, t: '추석에 옴 송편만 열 개' },
    { a: 13, m: 2, t: '졸업했다고 옴 쌍화차 노른자는 내가 먹음' },
    { a: 16, m: 4, t: '꽃 보러 왔다가 차 안 마시고 감' },
  ].filter((x) => SEASON_OF[x.m] !== bs && x.a < last && x.a !== photo.a);
  const rows = [photo, ...pool];
  // 어려서 빠진 철은 나이 상관없는 줄로 채운다 (마지막 방문 전 해부터 거꾸로, 네 살 아래로는 안 내려감)
  const FILL = { blue: { m: 4, t: '꽃 보러 왔다가 차 안 마시고 감' }, red: { m: 6, t: '덥다고 옴 오미자차 찬 걸로 두 잔' }, yellow: { m: 7, t: '대추차 먹고 낮잠' }, white: { m: 9, t: '추석에 옴 송편만 열 개' }, black: { m: 1, t: '눈 온다고 옴 쌍화차 노른자는 내가 먹음' } };
  const has = (id) => rows.some((x) => SEASON_OF[x.m] === id) || SEASON_OF[lastM] === id;
  let k = 1;
  E.forEach((e) => { if (e.id === bs || has(e.id)) return; rows.push({ a: Math.max(4, last - k), ...FILL[e.id] }); k += 1; });
  const why = last < 12 ? '용돈 모았다고 옴' : last < 19 ? '혼자 버스 타고 옴' : last < 35 ? '취직했다고 옴' : last < 55 ? '이사했다고 옴' : '일 그만뒀다고 옴';
  rows.push({ a: last, m: lastM, t: `${why} 처음으로 찻값 내려고 함 안 받음` });
  rows.sort((p, q) => p.a - q.a || ((p.m + 9) % 12) - ((q.m + 9) % 12));
  rows[0] = { ...rows[0], t: '이날부터 적음 ' + rows[0].t };
  return rows;
}
const photoRow = (S) => ledger(S).find((x) => x.photo) || ledger(S)[0];

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
  s += `<path d="M14 142 h122" stroke="${ink}" stroke-width=".8"/>`;
  E.forEach((e, i) => {
    const y = 157 + i * 13;
    s += `<circle cx="19" cy="${y - 3.4}" r="4.2" fill="${fills[e.id]}" stroke="${ink}" stroke-width=".6"/>`;
    s += `<text x="27" y="${y}" font-size="10" fill="${ink}" ${hand}>${e.han} ${e.el}</text><text x="56" y="${y}" font-size="10" fill="${ink}" ${hand}>${dirTxt(e)}</text><text x="90" y="${y}" font-size="10" fill="${ink}" ${hand}>${e.color}색</text><text x="114" y="${y}" font-size="10" fill="${ink}" ${hand}>${e.season}</text>`;
  });
  return s + `</svg>`;
}
// 책상 메모 뒷면: 연필로 눌러 그린 별 (등잔에 대야 보인다) 같은 다섯 자리, 한 칸씩 건너뛰는 화살표
function starSvg() {
  const pen = '#4a4640';
  const CX = 75, CY = 78, R = 50;
  const pos = Object.fromEntries(E.map((e, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return [e.id, [CX + R * Math.cos(a), CY + R * Math.sin(a)]]; }));
  let s = `<svg viewBox="0 0 150 150" class="star-chart" role="img" aria-label="연필로 그린 별 모양 화살표 다섯">`;
  E.forEach((e) => {
    const [x, y] = pos[e.id], [nx, ny] = pos[CONTROL[e.id]];
    const dx = nx - x, dy = ny - y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const sx = x + ux * 11, sy = y + uy * 11, ex = nx - ux * 12, ey = ny - uy * 12;
    s += `<path d="M${sx} ${sy} L${ex} ${ey}" stroke="${pen}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-dasharray="7 1.2"/><path d="M${ex} ${ey} l${-ux * 5 - uy * 3} ${-uy * 5 + ux * 3} M${ex} ${ey} l${-ux * 5 + uy * 3} ${-uy * 5 - ux * 3}" stroke="${pen}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  });
  E.forEach((e) => { const [x, y] = pos[e.id]; s += `<circle cx="${x}" cy="${y}" r="9" fill="none" stroke="${pen}" stroke-width=".9"/><text x="${x}" y="${y + 3.6}" font-size="10" text-anchor="middle" fill="${pen}" font-family="serif">${e.han}</text>`; });
  return s + `</svg>`;
}

// 할머니식 풀이 — 이야기용 해석 좋고 나쁜 판정은 없다
const READ = {
  blue: { gen: '木 손님은 새 일 얘기를 하러 온다 가게 문 열 때부터 계획부터 꺼내 놓는다 말 끝나면 하나만 골라서 그거부터 하라고 해 준다', me: '뭘 새로 시작할 때 제일 신나는 사람이다 방학 첫날마다 공책부터 새로 샀지 끝까지 쓴 공책은 별로 없었다 그래도 된다 대신 하나는 끝까지 써 봐라', many: '木이 많으면 벌여 놓은 일이 많다 이번 달에 끝낼 거 하나만 정해라', none: '木이 없으면 시작을 미룬다 내일 할 거를 오늘 밤에 적어 두고 자라', tea: '유자차는 신맛이 있어서 오후에 졸릴 때 준다' },
  red: { gen: '火 손님은 오면 가게가 시끄러워진다 옆자리 손님한테 말도 먼저 건다 일은 혼자 다 떠안고 와서 지쳐 있을 때가 많다', me: '들어오면 가게가 환해지는 사람이다 손님들이 니 웃는 소리에 한 잔씩 더 시켰다 대신 혼자 다 하려다 지친다 일은 나눠 들어라', many: '火가 많으면 약속을 많이 잡는다 달력에 빈 저녁 하나는 남겨 둬라', none: '火가 없으면 처음엔 말이 없다 세 번째 오는 날부터 말이 많아진다', tea: '오미자차는 찬 걸로 낸다 말 많이 한 날 목에 좋다' },
  yellow: { gen: '土 손님은 남 얘기를 들어 주고 온 사람이다 자기 얘기는 차 다 식을 때쯤에야 꺼낸다 그때까지 기다려 준다', me: '남 얘기를 끝까지 들어 주는 사람이다 손님 하소연을 옆에 앉아 다 듣고 있던 게 너다 네 얘기는 아껴 두는데, 가끔은 꺼내라', many: '土가 많으면 버리는 걸 못 한다 서랍 하나는 비워 둬라', none: '土가 없으면 집에 와도 쉬는 자리가 없다 앉을 의자부터 하나 정해 둬라', tea: '대추차는 뜨겁게 낸다 끼니 거르고 온 손님한테 먼저 준다' },
  white: { gen: '金 손님은 앉자마자 따질 거부터 따진다 틀린 말은 아닌데 듣는 사람이 아프다 다 듣고 나서 한 마디만 줄여 보라고 한다', me: '싫은 건 싫다고 먼저 말하는 사람이다 어릴 때도 싫은 차는 이유를 또박또박 대고 안 마셨다 그 말이 맞을 때가 많다 다만 한 번 숨 고르고 해라', many: '金이 많으면 남한테 바라는 게 많다 그 반만 말해라', none: '金이 없으면 거절을 못 한다 싫은 거 하나는 싫다고 해 봐라', tea: '생강차는 꿀을 많이 탄다 매운 걸 싫어하는 손님도 마신다' },
  black: { gen: '水 손님은 이사 얘기, 회사 옮기는 얘기를 들고 온다 한 군데 오래 못 있는다 지도 펴 놓고 같이 봐 준다', me: '어디 가든 금방 맞춰 들어가는 사람이다 처음 온 동네 애들하고도 하루면 친해졌지 그래도 한자리에 오래 있으면 답답해한다 그럴 땐 좀 걸어라', many: '水가 많으면 밤에 생각이 길어진다 열두 시 넘으면 불 끄고 누워라', none: '水가 없으면 쉬는 날에도 일을 한다 일주일에 한나절은 아무것도 하지 마라', tea: '쌍화차는 달걀 노른자를 띄워 낸다 감기 기운 있는 손님한테 준다' },
};
function relationLine(a, b) { // a=내 빛, b=상대 빛
  if (a === b) return `${byId[a].han} 하나가 제일 많다 좋을 땐 끝까지 가고 아니면 한 번에 무너진다 다른 빛 친구 하나는 곁에 둬라`;
  if (NEXT[b] === a) return `${hj(b, '은', '는')} ${hj(a, '을', '를')} 낳는 빛이다 옆에서 챙겨 주는 사람이 있다는 뜻이다 그 사람한테 고맙다는 말은 해라`;
  if (NEXT[a] === b) return `${hj(b, '은', '는')} ${hj(a, '이', '가')} 낳는 빛이다 네가 챙겨 주는 쪽이다 퍼 주다 지치면 가게 와서 한 잔 하고 가라`;
  if (CONTROL[b] === a) return `${hj(b, '은', '는')} ${hj(a, '을', '를')} 누르는 빛이다 남 말에 끌려가는 날이 있다 그런 날엔 네 차를 끓여라`;
  return `${hj(a, '은', '는')} ${hj(b, '을', '를')} 누르는 빛이다 네 말이 센 쪽이다 할 말 다 하고 나면 한 번은 물어봐라`;
}
function reading(profile) {
  profile = profile || { seed: 0, companion: 0, counts: [1, 1, 1, 1, 1] };
  const seed = E[profile.seed], comp = E[profile.companion];
  const missing = E.filter((e, i) => profile.counts[i] === 0);
  let other = comp, others = [comp];
  if (comp.id === seed.id) {
    const best = Math.max(...E.map((e, i) => (i === profile.seed ? -1 : profile.counts[i])));
    others = E.filter((e, i) => i !== profile.seed && profile.counts[i] === best);
    other = others[0];
  }
  const max = Math.max(...profile.counts);
  const tops = E.filter((e, i) => profile.counts[i] === max);
  const strong = max >= 3;
  const topLine = tops.length > 1 ? `제일 많은 빛은 ${tops.map((t) => t.han).join('·')} 같이 많다` : comp.id === seed.id ? `네 빛 ${hj(seed.id, '이', '가')} 제일 많기도 하다` : `제일 많은 빛은 ${hj(comp.id, '이다', '다')}`;
  return {
    seed, comp, missing, other, tops,
    me: READ[seed.id].me,
    many: `${topLine} ${strong ? READ[comp.id].many : '셋도 안 되니 센 건 아니다 고르게 있는 쪽이다'}`,
    none: missing.length ? missing.map((e) => READ[e.id].none).join(' ') : '다섯 빛이 다 있다 뭐 하나 빠졌다는 핑계는 못 댄다',
    relation: (comp.id === seed.id ? (others.length > 1 ? `그다음은 ${others.map((o) => o.han).join('·')} 같이 많은데, ${other.han}부터 보면 ` : `그다음이 ${other.han}인데, `) : '') + relationLine(seed.id, other.id),
    tea: READ[seed.id].tea,
  };
}

function slipHtml(profile) {
  const seed = E[profile.seed];
  const fills = { blue: '#5f9e9a', red: '#b8433a', yellow: '#d2a84a', white: '#eee8dc', black: '#2e2e2e' };
  const r = reading(profile);
  const cols = Math.max(4, ...(profile.counts || [])); // 점 칸 수: 4칸, 한 빛이 5개 이상이면 모든 줄을 그 수에 맞춘다
  return `<p class="slip-head">할머니가 세는 법대로</p>
<div class="pillars">${(profile.pillars || []).map((p) => `<div class="pillar"><small>${p.label}</small><b>${p.text}</b><span>${p.elements.map((i) => E[i].han).join('') || '—'}</span></div>`).join('')}</div>
<div class="counts">${E.map((e, i) => `<div class="count"><i style="background:${fills[e.id]}"></i><b>${e.han}</b><span>${'●'.repeat(profile.counts[i])}${'○'.repeat(Math.max(0, cols - profile.counts[i]))}</span><small>${profile.counts[i]}</small></div>`).join('')}</div>
<p class="slip-light">네 빛은 <b style="color:${fills[seed.id] === '#eee8dc' ? '#6b6248' : fills[seed.id]}">${seed.han} ${seed.el} · ${seed.color}색</b> <small>(태어난 날의 천간)</small></p>
<p class="slip-light">가장 많은 빛은 <b>${r.tops.map((t) => `${t.han} ${t.el}`).join(' · ')}</b>${profile.unknown ? ' <small>(시각을 몰라 시주는 뺐다)</small>' : ' <small>(난 시각은 30분 빼고 셌다 서울 시계가 해보다 30분 빠르다)</small>'}${profile.ambiguous ? ' <small>(절기 바뀌는 날이라 연·월은 미확정)</small>' : ''}</p>
<div class="slip-reading"><p class="slip-sub">할머니라면 이렇게 읽는다</p><p>${r.me}</p><p>${r.many}</p><p>${r.none}</p><p class="slip-note">좋고 나쁜 건 없다 할머니는 이 빛으로 차를 골랐고, 오늘은 이 빛이 열쇠가 된다 나머지 풀이는 가게 안에 있다</p></div>`;
}

// 장치 보상 창은 S를 못 받으므로, 판정할 때 그 사람 몫 글자를 여기 적어 둔다
const last = { pot: '화분', tea: '차' };

export default {
  id: 'ohang',
  number: '010',
  title: '돌아오는 계절',
  subtitle: '오행당에 맡겨둔 것',
  genre: '오행 · 사주 미스터리',
  minutes: 35,
  difficulty: 3,
  cover: P + 'cover.webp',
  coverAlt: '비 오는 밤, 닫힌 오행당 문 앞 섬돌 위 다섯 화분',
  music: 'assets/music/ohang-v33.mp3',
  tagline: '접수표부터 써라 너도 오늘은 손님이다\n생일하고 난 시 적으면 네 빛이 나온다',
  blurb: '외할머니가 평생 지킨 약차집 오행당\n입원한 할머니의 문자 한 통에 지원은 오랜만에 그 골목으로 갑니다\n당신의 생년월일시로 다섯 빛을 세고, 그 빛대로 화분과 차 통과 등이 열립니다',
  hintTitle: '할머니의 귀띔',
  storageKey: 'mihaeje-v2-ohang',
  tracesLabel: '할머니가 남긴 것',

  opening: {
    eyebrow: '3월 2일, 저녁',
    paragraphs: [
      '할머니가 넘어졌다는 연락은 이모한테서 왔고, 할머니한테서는 문자가 왔다. 가게 좀 봐 달라는 거였다. 찬장 맨 아래 서랍에 둔 걸 꼭 가져오라고.',
      '오행당. 외할머니가 평생 약차를 끓인 가게다. 손님이 오면 생일하고 난 시부터 묻고, 다섯 빛을 세어서 차를 골라 줬다. 예전엔 틈만 나면 거기서 살다시피 했는데, 요 몇 해는 발길이 뜸했다.',
      '열쇠는 늘 두던 데 있다고 했다. 어디였더라, 되물으려는데 할머니 휴대폰이 꺼졌다.',
      '이모는 전화 끝에 한마디를 덧붙였다. 가게, 이번 달 안에 정리할 거라고. 할머니도 이제 못 한다고.',
      '골목에 비가 조금 왔다. 문 앞 섬돌에 화분 다섯 개가 그대로 있고, 문 옆 살창에 접수표 묶음이 끼워져 있었다. 손님은 먼저 접수표부터 쓴다. 할머니 가게의 규칙이다.',
    ],
    cta: '접수표 쓰기',
  },

  intake: {
    render({ S, el, btn, save, done }) {
      const wrap = el('div', 'intake-wrap');
      const showResult = (profile) => {
        const card = el('div', 'slip-result');
        card.innerHTML = slipHtml(profile);
        // 내 접수표와 휴대폰은 처음부터 손에 있다 → 소지품에 바로 넣어 둔다
        card.append(btn('v2-primary', '접수표 들고 문 앞으로 →', () => { S.found = S.found || []; ['myslip', 'chat'].forEach((k) => { if (!S.found.includes(k)) S.found.push(k); }); done(profile); }));
        const again = btn('v2-secondary', '접수표 다시 쓰기', () => { delete S.profile; save(); wrap.replaceChildren(...form()); });
        wrap.replaceChildren(card, again);
        window.scrollTo({ top: 0 });
      };
      const form = () => {
        const sheet = el('div', 'slip-form');
        sheet.innerHTML = `<p class="slip-head">오행당 접수표</p>
<p class="slip-note">손님 생일과 난 시를 적는다 할머니는 이걸로 다섯 빛을 센다<br><small>적은 날짜는 그대로 남기지 않는다 센 결과와 나이, 태어난 달만 이 브라우저에 남는다</small></p>
<label class="slip-row"><span>생일 (양력)<small>예 1998/3/15</small></span><input type="date" name="date" min="1960-01-01" max="2016-12-31" required aria-label="생일 (양력) 연 월 일"></label>
<label class="slip-row"><span>난 시각<small>예 오후 2:30</small></span><input type="time" name="time" aria-label="난 시각"></label>
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
            // 생일은 1960/1/1~2016/12/31 (장부가 나이에 맞춰 바뀐다 · 너무 이르면 할머니 나이가 이야기와 안 맞는다)
            if (y < 1960 || y > 2016) throw Error('생일은 1960/1/1부터 2016/12/31까지 적을 수 있다 그 밖이면 아래 예시 손님으로 해 보자');
            let input = { year: y, month: m, day: d, hour: null, minute: 0 };
            if (!unk.checked) {
              if (!time.value) throw Error('난 시각을 적거나, 모름에 표시한다');
              const [hh, mm] = time.value.split(':').map(Number);
              // 할머니는 30분 빼고 센다 (한국 표준시는 해 기준보다 30분 빠르다)
              const t = new Date(Date.UTC(y, m - 1, d, hh, mm) - 30 * 60000);
              input = { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate(), hour: t.getUTCHours(), minute: t.getUTCMinutes() };
            }
            const pr = birthProfile(input, window.Solar);
            const age = 2026 - y - (m > 3 || (m === 3 && d > 2) ? 1 : 0);
            const profile = { version: 2, pillars: pr.pillars, counts: pr.counts, seed: pr.seed, companion: pr.companion, unknown: pr.unknown, ambiguous: pr.ambiguous, month: m, age };
            S.profile = profile; save(); // 새로고침해도 센 결과가 남게
            showResult(profile);
          } catch (e) { err.textContent = e.message.replace(/을 입력해주세요$/, '을 적어야 한다').replace(/를 입력해주세요$/, '를 적어야 한다').replace(/을 확인해주세요$/, '을 다시 본다'); }
        });
        const ex = btn('v2-secondary', '생일 대신 예시 손님으로 해 보기', () => { sheet.querySelector('[name=date]').value = '1990-05-05'; unk.checked = false; time.disabled = false; time.value = '10:00'; go.click(); });
        return [el('p', 'v2-eyebrow', '문 옆 살창 · 접수표'), sheet, go, el('p', 'slip-note', '생일을 적기 싫으면 예시 손님(1990/5/5 오전 10시)으로 해도 된다 풀이와 열쇠가 그 빛대로 바뀐다'), ex];
      };
      if (S.profile) showResult(S.profile); else wrap.append(...form());
      return wrap;
    },
  },

  traces: [
    { device: 'pots', label: '섬돌의 열쇠' },
    { device: 'bowls', label: '다섯 그릇' },
    { device: 'tins', label: '안 온 철의 차' },
    { device: 'lanterns', label: '뒷방의 등' },
    { device: 'brew', label: '고름차' },
  ],

  scenes: [
    {
      id: 'front',
      name: '오행당 문 앞',
      image: P + 'front.webp',
      arrive: (S) => S.solved.includes('pots')
        ? '문은 열려 있다 들었다 놓은 화분이 조금 비뚤게 앉아 있다 문에는 할머니가 붙여 둔 종이가 그대로'
        : '문은 잠겨 있고, 문에는 할머니가 오래전에 붙여 둔 종이가 그대로다 섬돌 위 화분 다섯 처마 끝에서 빗물이 한 방울씩 떨어진다',
      // 할머니 문자는 처음부터 소지품에 있다 (주머니 속 휴대폰은 그림에 없으니 누름 자리를 두지 않는다)
      // 화분 다섯은 그림에서 x 28.3·39.7·50·60.5·71.4 · 잎 y 70~81, 몸통 y 81~92 → 누름 자리는 잎과 몸통을 같이 덮게 y 81 · r 11 (대사창이 떠 있을 땐 대사창이 위, 접히면 화분 몸통도 눌린다) 어느 화분을 눌러도 화분 장치가 열린다
      // 접수표 묶음은 문 오른쪽 살창에 끼워 둔 종이 (그림에 그려 넣음, 가운데 77.3 · 46.5)
      hotspots: [
        { id: 'paper', x: 50, y: 38, label: '문에 붙은 종이', kind: 'doc', doc: 'doorpaper', r: 10 },
        ...[28.3, 39.7, 50, 60.5, 71.4].map((x, i) => ({ id: 'pots-' + E[i].id, x, y: 81, label: E[i].pot, kind: 'device', device: 'pots', r: 11 })),
        { id: 'myslip', x: 77.3, y: 46.5, label: '살창에 끼워 둔 내 접수표', kind: 'doc', doc: 'myslip', r: 10 },
      ],
    },
    {
      id: 'inside',
      name: '찻집 안',
      image: P + 'inside.webp',
      unlockedBy: 'pots',
      arrive: (S) => S.solved.includes('brew')
        ? '고름차는 보온병에 담았다 가게 불은 거의 다 껐다 이제 병원에 가져가기만 하면 된다'
        : S.solved.includes('lanterns')
        ? '찬장에서 주전자 하나를 꺼내 물을 받아 놨다 선반 맨 앞줄 차 통 다섯을 다시 본다 할머니 쪽지대로 숟갈을 셀 차례다'
        : S.solved.includes('tins')
        ? `${birthSeason(S).tea} 통 뚜껑이 열려 있다 뒷방 열쇠는 내 손에 있다 찬장 칸엔 그릇을 넣고, 그 앞에 주전자와 항아리를 도로 앉혀 뒀다`
        : S.solved.includes('bowls')
          ? '맨 아래 서랍이 열려 있다 뒷방 문은 잠긴 그대로다 오른쪽 선반에는 할머니 차 통이 줄지어 있다'
          : '불을 켜자 약재 냄새가 먼저 왔다 탁자 위 찻잔 하나에 아직 물기가 있다 할머니가 넘어지던 날 끓이던 차 안쪽 벽 찬장엔 열십자로 칸 다섯이 나 있고, 칸마다 주전자며 항아리가 들어앉았다 그 아래 반닫이 안엔 그릇 다섯이 보자기에 싸여 있다',
      hotspots: [
        { id: 'photo', x: 34.4, y: 34.4, label: '벽에 걸린 사진', kind: 'doc', doc: 'oldphoto', r: 9 },
        { id: 'board', x: 91, y: 17, label: '메뉴판', kind: 'doc', doc: 'board' },
        { id: 'notebook', x: 89, y: 50, label: '접수대 서랍의 공책', kind: 'doc', doc: 'notebook' },
        // 메모는 찬장 오른쪽 칸 바로 아래 벽에 테이프로 붙은 종이 (그림에 그려 넣음)
        { id: 'memo', x: 59.2, y: 37.5, label: '찬장에 붙은 메모', kind: 'doc', doc: 'memo', r: 6 },
        { id: 'cabinet', x: 52, y: 25, label: '찬장과 다섯 그릇', kind: 'device', device: 'bowls' },
        { id: 'drawer', x: 54, y: 53, label: '열린 맨 아래 서랍', kind: 'doc', doc: 'slips', r: 8, visible: (S) => S.solved.includes('bowls') },
        { id: 'tins', x: 75, y: 30, label: '선반의 차 통', kind: 'device', device: 'tins', visible: (S) => S.solved.includes('bowls') && !S.solved.includes('lanterns') },
        // 등을 켜고 접수표를 읽은 뒤엔 같은 차 통 다섯으로 고름차를 달인다
        { id: 'brew', x: 75, y: 30, label: '차 통과 주전자', kind: 'device', device: 'brew', visible: (S) => S.solved.includes('lanterns') },
      ],
    },
    {
      id: 'back',
      name: '뒷방',
      image: P + 'back.webp',
      unlockedBy: 'tins',
      // 등을 다 켠 뒤엔 장면 그림의 등 다섯에도 불빛을 얹는다 (그림 속 등 가운데 x 24.6·37.8·50.8·63.7·75.8, y 25.3)
      get overlays() { let s = []; try { s = (window.MihaejeV2?.state || JSON.parse(localStorage.getItem('mihaeje-v2-ohang') || '{}')).solved || []; } catch {} if (!s.includes('lanterns') || s.includes('brew')) return []; const C = ['200,255,240', '255,190,170', '255,236,170', '255,255,245', '215,225,245']; return [24.6, 37.8, 50.8, 63.7, 75.8].map((x, i) => ({ x: x - 7, y: 25.3 - 11, w: 14, h: 22, cls: 'lantern-glow', style: `background:radial-gradient(closest-side,rgba(${C[i]},.55),rgba(${C[i]},.22) 55%,rgba(${C[i]},0));mix-blend-mode:screen;pointer-events:none;border-radius:50%`, html: '' })); },
      arrive: (S) => S.solved.includes('brew')
        ? '등은 다 껐다 책상 위 접수함 뚜껑만 열려 있다 안에 있던 접수표는 언제든 다시 꺼내 볼 수 있다'
        : S.solved.includes('lanterns')
        ? '등 다섯 개가 켜져 있다 책상 위 접수함 뚜껑이 열려 있다 접수표 끝에 적힌 대로 차를 달이려면 찻집 선반으로 가야 한다'
        : '뒷방은 할머니가 장부를 쓰던 방이다 대나무 장대에 등 다섯, 책상 위엔 작은 등잔과 잠긴 접수함, 그리고 메모 한 장 창밖에선 빗물 소리만 난다',
      hotspots: [
        // 메모는 책상 위에 누운 종이 (그림에 그려 넣음) · 등 누름 자리는 그림 속 등 다섯 가운데 (어느 등을 눌러도 등 장치) · 접수함은 책상 왼쪽 상자
        { id: 'deskmemo', x: 51.6, y: 74, label: '책상 위 메모', kind: 'doc', doc: 'deskmemo', r: 8 },
        ...[24.6, 37.8, 50.8, 63.7, 75.8].map((x, i) => ({ id: 'lantern-' + E[i].id, x, y: 25.3, label: E[i].lantern, kind: 'device', device: 'lanterns', r: 10 })),
        { id: 'box', x: 36.8, y: 70.3, label: '열린 접수함', kind: 'doc', doc: 'final', r: 8, visible: (S) => S.solved.includes('lanterns') },
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
<div class="chat-row them"><span class="chat-avatar">茶</span><div class="chat-col"><span class="chat-name">할머니</span><div class="chat-bubble">늘 두던데 잇다</div><div class="chat-bubble">네 빛 낳아준놈 밑에</div><div class="chat-bubble">문에 붙인거 보면안다</div><div class="chat-bubble">접수표 부터 써라</div><div class="chat-bubble">너도 오늘은 손님이다 생일하고 난시</div><div class="chat-bubble">밧데리가</div></div><span class="chat-time">오후 4:05</span></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오후 4:06</span><div class="chat-bubble">내 빛이 뭔데?? 할머니</div></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오후 4:40</span><div class="chat-bubble">할머니</div></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    doorpaper: {
      title: '문에 붙은 종이',
      kind: '할머니 글씨 · 누렇게 바랜',
      html: `<figure class="prop doorpaper"><img src="${P}props/doorpaper.webp" alt="문에 테이프로 붙인 누런 종이" decoding="async"><div class="on-doorpaper">${cycleSvg()}</div></figure><table class="mobile-only door-legend"><caption>종이 아래칸 글씨</caption>${E.map((e) => `<tr><th><i style="background:${{ blue: '#5f9e9a', red: '#b8433a', yellow: '#d2a84a', white: '#eee8dc', black: '#2e2e2e' }[e.id]}"></i>${e.han} ${e.el}</th><td>${dirTxt(e)}</td><td>${e.color}색</td><td>${e.season}</td></tr>`).join('')}</table><p>어릴 때 이게 뭐냐고 물었을 때 할머니는 "차 끓이는 순서"라고만 했다 그게 아니라는 건 나중에 알았다 다섯 색, 다섯 방향, 다섯 계절 가게 이름이 오행당인 이유</p>`,
    },
    oldphoto: {
      title: '벽에 걸린 사진',
      kind: '어릴 때 · 찻집에서',
      html: (S) => { const p = photoRow(S), t = seedOf(S); const aged = 2026 - ageOf(S) + p.a < 1992; /* 1990년대 초보다 앞서 찍힌 사진이면 빛바랜 색으로 (나이 많은 손님) */ return `<figure class="prop oldphoto${aged ? ' aged' : ''}"><img src="${P}props/oldphoto${t.id === 'red' ? '' : '-' + t.id}.webp" alt="찻집에서 할머니와 찻잔을 든 어린 지원, 탁자에 ${t.tea} 유리 주전자와 수박" decoding="async"></figure><p>액자를 뒤집으니 뒷면에 할머니 글씨</p><blockquote class="hand">${p.a}살 ${p.m}월, 지원이<br>제 빛 차 세 잔째 수박은 안 먹고 차만 마심</blockquote><p class="aside">이날은 할머니가 내 빛 차를 따로 끓여 줬다 찻값은 한 번도 안 받고, 대신 장부에 적었다</p>`; },
    },
    board: {
      title: '메뉴판',
      kind: '분필 글씨',
      html: `<figure class="prop board"><img src="${P}props/board2.webp" alt="분필로 쓴 오행당 차림: 유자차(木) 5,000 · 오미자차(火) 4,500 · 대추차(土) 4,000 · 생강차(金) 3,500 · 쌍화차(水) 6,000" decoding="async"></figure><p>차 이름 옆에 빛이 하나씩 적혀 있다 할머니는 손님 빛을 세고 그 빛의 차를 내줬다</p>`,
    },
    notebook: {
      title: '할머니의 풀이 공책',
      kind: '손님 빛 읽는 법',
      html: (S) => { const r = reading(S.profile || { seed: 0, companion: 0, counts: [1, 1, 1, 1, 1] }); return `<p>접수대 서랍에 있던 공책 할머니가 손님 빛을 읽을 때 보던 것이다 다섯 빛마다 한 장씩, 내 빛 장에는 귀퉁이가 접혀 있다</p><div class="notes-list reading-list">${E.map((e) => `<div class="reading-item${e.id === r.seed.id ? ' mine' : ''}"><b>${e.han} ${e.el} · ${e.color} · ${e.dir} · ${e.season}</b><p>${e.id === r.seed.id ? READ[e.id].me : READ[e.id].gen}</p><p>많으면 — ${READ[e.id].many}</p><p>없으면 — ${READ[e.id].none}</p><p>차 — ${READ[e.id].tea}</p></div>`).join('')}</div><p class="aside">내 빛 장 귀퉁이에 할머니 글씨로 「지원」이라고 적혀 있다 언제 적은 건지 모르겠다</p>`; },
    },
    memo: {
      title: '찬장에 붙은 메모',
      kind: '할머니 글씨',
      html: `<figure class="prop notecard"><img src="${P}props/notecard.webp" alt="찬장에 테이프로 붙인 쪽지" decoding="async"><div class="on-notecard">그릇은 제 방향에<br>그릇 밑굽이랑 칸 바닥 홈이 맞아야 눌린다<br>다섯 다 눌려야 서랍 빗장이 빠진다<br><br>창이 해 뜨는 쪽이다<br>헷갈리면 창부터 봐라<br>위 칸은 네가 바라보는 쪽이다</div></figure><p>찬장을 마주 보고 섰다 한지 창은 왼쪽에 있다 할아버지가 살아 계실 때 장난삼아 짜 둔 찬장이라고 들었다</p>`,
    },
    slips: {
      title: '서랍 속 접수표 묶음',
      kind: '할머니 장부 · 달력 한 장',
      html: (S) => `<figure class="prop slips"><img src="${P}props/slips.webp" alt="집게로 묶은 접수표 묶음" decoding="async"></figure><p>장부라기보다 쪽지 묶음이다 손님 이름 대신 내 이름이 제일 많다 맨 앞에 쪽지 한 장과 할머니 달력 한 장이 같이 물려 있다</p>
<blockquote class="hand">뒷방 열쇠는 차 통에 넣어 뒀다<br>네가 한 번도 안 온 철의 차다</blockquote>
<div class="season-cal"><p class="season-head">오행당 철 나누기</p>${[['봄', '3 · 4월'], ['여름', '5 · 6월'], ['늦여름', '7 · 8월'], ['가을', '9 · 10월'], ['겨울', '11 · 12 · 1 · 2월']].map(([n, m]) => `<p><b>${n}</b><span>${m}</span></p>`).join('')}</div>
<div class="slip-list">${ledger(S).map((x) => `<p><b>${x.a}살 ${x.m}월</b> 지원 ${x.t}</p>`).join('')}</div><p class="aside">묶음 맨 끝엔 아무것도 안 적힌 빈 접수표가 한 장 끼워져 있다 오늘 내가 쓴 접수표가 들어갈 자리다</p>`,
    },
    deskmemo: {
      title: '책상 위 메모',
      kind: '할머니 글씨',
      html: `<figure class="prop notecard"><img src="${P}props/notecard.webp" alt="책상 위 쪽지" decoding="async"><div class="on-notecard">접수함 열쇠는 없다<br>등을 켜면 열린다<br><br>네 빛부터<br>누르는 순서로 다섯 개 다</div></figure><p>뒷면에 연필로 뭘 그렸다 지운 자국이 있다 너무 흐려서 이대로는 안 보인다</p>`,
    },
    final: {
      title: '접수함 속 접수표',
      kind: '받는 사람: 지원',
      html: (S) => { const r = reading(S.profile), e = r.seed, bt = birthSeason(S); return `<figure class="prop slips"><img src="${P}props/slips.webp" alt="접수표" decoding="async"></figure><blockquote class="hand">접수 · 2026년 3월<br>받는 사람 지원 · 빛 ${e.han} ${e.el}<br><br>너는 ${r.me}<br>${r.many}<br>${r.none}<br>${r.relation}<br><br>그래서 네 차는 ${e.tea}다 ${r.tea}<br>${e.gift} 챙겨 뒀다 접수함 밑에 있다<br>${e.giftLine}<br><br>네 생일 철엔 너는 한 번도 안 왔다 생일상은 너희 집에서 받았으니까<br>그 철엔 ${bt.tea} 끓여 놓고 기다렸다<br><br>서랍 것은 가게 열쇠 뭉치하고 등기부다<br>이모가 가게 팔자고 한 지 삼 년 됐다<br>그래도 네가 올 거라 생각해서 안 팔았다<br>예전엔 틈만 나면 왔고, 요새는 뜸해도 결국 왔으니까<br><br>${youngOf(S) ? '가게는 네 거다 크면 하고 싶을 때 해라<br>그때까진 열쇠만 갖고 있어라' : '가게는 네 거다 하고 싶으면 해라<br>하기 싫으면 열쇠만 갖고 있어라'}<br>그래도 계절 돌면 한 번씩은 와라<br><br>내일 올 때 차 한 병 달여 와라 할미 식 고름차다<br>네 접수표 다섯 빛 수를 봐라 제일 많은 빛에 나머지 빛을 모자란 만큼 채워 맞춘다<br>한 숟갈이 빛 하나다 차 통은 가게 선반 맨 앞줄에 있다<br><br>등은 끄고 가라 전기세 나온다</blockquote>`; },
    },
  },

  devices: {
    pots: {
      title: '섬돌 위 화분',
      scene: 'front',
      intro: '화분 다섯 개 할머니 말로는 열쇠가 "네 빛 낳아준 놈 밑에" 있다 화분을 누르면 그 화분에 손을 얹고, 다른 화분을 누르면 바꾼다 손 얹은 화분을 들어 본다',
      docs: ['chat', 'doorpaper', 'myslip'],
      hintCode: 'O-S01',
      hints: (S) => { const p = byId[PREV[seedOf(S).id]]; return [
        '"네 빛"은 접수표에 있고, "낳아준 놈"은 문에 붙인 종이에 있다 둘을 같이 봐라',
        '종이 화살표 하나가 "낳는다" 한 번이다 네 빛이 화살표 어느 쪽 끝에 있어야 하는지 생각해 봐라',
        `${p.pot}(${p.han}·${p.color}) 밑이다`,
      ]; },
      initial: () => ({ pick: null }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const solved = S.solved.includes('pots');
        const wrap = el('div', 'pots-wrap');
        const step = el('div', 'prop potstep'); const im = el('img'); im.src = P + 'front.webp'; im.alt = '섬돌 위 화분 다섯'; step.append(im);
        const xs = { blue: 16.2, red: 34.0, yellow: 50.1, white: 66.6, black: 83.5 }; // 잘라 낸 섬돌 사진(x 184~839) 안 화분 가운데
        E.forEach((e) => {
          const b = el('button', 'pot' + (d.pick === e.id ? ' picking' : '')); b.type = 'button'; b.style.left = xs[e.id] + '%';
          b.setAttribute('aria-label', e.pot); b.title = e.pot;
          b.onclick = () => { if (solved) return; d.pick = e.id; save(); };
          step.append(b);
        });
        wrap.append(step, el('p', 'pick-label', solved ? '열쇠는 꺼냈다 화분은 제자리에 내려놓았다' : d.pick ? `${js(byId[d.pick].pot, '을', '를')} 들어 보기로 했다` : '화분을 하나 고르면 들어 본다'));
        return wrap;
      },
      commitLabel: '화분 들어 보기',
      canCommit: (d) => !!d.pick,
      check(d, S) {
        const want = PREV[seedOf(S).id];
        last.pot = byId[want].pot;
        if (d.pick === want) return { ok: true };
        return { ok: false, msg: `${byId[d.pick].pot} 밑엔 젖은 흙뿐이다` };
      },
      reveal: {
        title: '내 빛을 낳는 빛',
        get text() { return `${js(last.pot, '을', '를')} 들자 밑에 비닐에 싼 열쇠가 있었다 할머니는 내 빛을 알고 열쇠 자리를 골랐다`; },
        scene: ['자물쇠가 뻑뻑했다 두 번 돌려서 문을 열었다 안은 캄캄하고, 약재 냄새가 났다'],
        unlock: 'inside',
      },
    },

    bowls: {
      title: '찬장과 다섯 그릇',
      scene: 'inside',
      intro: '벽 찬장 칸의 주전자와 항아리를 다 내려놓으니 열십자로 다섯 칸이 비었다 칸 바닥마다 홈이 파여 있다 아래 반닫이에서 보자기에 싼 그릇 다섯을 꺼냈다 보자기 위 그릇을 누르면 집고, 빈 칸을 누르면 거기 놓는다 놓은 그릇을 누르면 도로 집고, 그릇을 든 채 찬 칸을 누르면 서로 바꾼다',
      docs: ['memo', 'doorpaper'],
      hintCode: 'O-S02',
      hints: [
        '색마다 방향이 있다 문에 붙인 종이 봐라 근데 찬장 위 칸이 꼭 북쪽이겠냐',
        '찬장 앞에 서서 창이 어느 손 쪽에 있는지 봐라 그러면 네가 어느 쪽을 보고 서 있는지 나온다',
        '남쪽을 보고 서 있다 위=남(적), 아래=북(흑), 왼쪽=동(청), 오른쪽=서(백), 가운데=황',
      ],
      initial: () => ({ placed: {}, held: null }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const solved = S.solved.includes('bowls');
        const NICHES = [
          // 장면 그림의 벽 찬장(열십자 칸 다섯)을 잘라 칸을 비운 사진 (props/cabinet.webp)
          { id: 'top', label: '위 칸', x: 43.7, y: 5.9 },
          { id: 'left', label: '왼쪽 칸', x: 29.6, y: 26.5 },
          { id: 'center', label: '가운데 칸', x: 43.7, y: 26.5 },
          { id: 'right', label: '오른쪽 칸', x: 57.5, y: 26.5 },
          { id: 'bottom', label: '아래 칸', x: 43.7, y: 47.1 },
        ];
        const wrap = el('div', 'bowls-wrap');
        const cab = el('div', 'prop cabinet'); const im = el('img'); im.src = P + 'props/cabinet.webp'; im.alt = '벽에 열십자로 판 찬장 칸 다섯, 그 아래 반닫이'; cab.append(im);
        // 칸 누르기: 빈 칸엔 든 그릇을 놓고, 찬 칸은 그릇을 집되 든 그릇이 있으면 서로 바꾼다
        const tap = (n) => {
          if (solved) return;
          const bid = d.placed[n.id];
          if (bid) { if (d.held) d.placed[n.id] = d.held; else delete d.placed[n.id]; d.held = bid; save(); return; }
          if (d.held) { d.placed[n.id] = d.held; d.held = null; save(); }
        };
        // 휴대폰: 사진 속 칸이 작아서(360폭 40px) 사진 아래에 같은 열십자 모양 큰 버튼을 같이 둔다
        const cross = el('div', 'niche-cross mobile-only');
        NICHES.forEach((n) => {
          const bid = d.placed[n.id];
          const b = el('button', 'niche' + (bid ? ' filled' : '') + (d.held && !bid ? ' open' : '')); b.type = 'button'; b.style.left = n.x + '%'; b.style.top = n.y + '%';
          b.setAttribute('aria-label', `${n.label}${bid ? ': ' + byId[bid].name : ' (비어 있음)'}`);
          if (bid) { const bi = el('img', 'bowl-img'); bi.src = P + 'props/bowl-' + bid + '.webp'; bi.alt = byId[bid].name; b.append(bi); }
          b.onclick = () => tap(n);
          cab.append(b);
          const m = el('button', 'niche-big ' + n.id + (bid ? ' filled' : '') + (d.held && !bid ? ' open' : '')); m.type = 'button';
          m.setAttribute('aria-label', `${n.label}${bid ? ': ' + byId[bid].name : ' (비어 있음)'}`);
          if (bid) { const bi = el('img'); bi.src = P + 'props/bowl-' + bid + '.webp'; bi.alt = ''; m.append(bi); }
          m.append(el('span', '', n.label));
          m.onclick = () => tap(n);
          cross.append(m);
        });
        wrap.append(cab, cross);
        const tray = el('div', 'bowl-tray');
        const left = E.filter((e) => !Object.values(d.placed).includes(e.id));
        left.forEach((e) => {
          const b = el('button', 'bowl-pick' + (d.held === e.id ? ' picking' : '')); b.type = 'button'; b.setAttribute('aria-label', e.name + ' 집기');
          const bi = el('img'); bi.src = P + 'props/bowl-' + e.id + '.webp'; bi.alt = e.name; b.append(bi);
          b.onclick = () => { if (solved) return; d.held = d.held === e.id ? null : e.id; save(); };
          tray.append(b);
        });
        if (!left.length) tray.append(el('p', 'tray-empty', '보자기 위가 비었다'));
        wrap.append(el('p', 'pick-label', solved ? '그릇 다섯이 홈에 맞아 눌려 있다' : d.held ? `${js(byId[d.held].name, '을', '를')} 들었다 빈 칸에 놓거나 찬 칸 그릇과 바꾼다` : '보자기 위 그릇을 집은 다음 찬장 칸을 누른다'), tray);
        return wrap;
      },
      commitLabel: '서랍 쇠 당겨 보기',
      check(d) {
        const ANSWER = { top: 'red', left: 'blue', center: 'yellow', right: 'white', bottom: 'black' };
        const ids = Object.keys(ANSWER);
        if (ids.some((n) => !d.placed[n])) return { ok: false, msg: '빈 칸이 있다 다섯이 다 들어가야 빗장이 움직인다' };
        if (ids.every((n) => d.placed[n] === ANSWER[n])) return { ok: true };
        return { ok: false, msg: '서랍 쇠를 당겨 봤다 빗장이 꿈쩍 않는다' };
      },
      reveal: {
        title: '남쪽을 보고 서서',
        text: '다섯 번째 그릇이 홈에 맞아 눌리자 찬장 아래에서 빗장 빠지는 소리가 났다 맨 아래 서랍이 손가락 하나만큼 나왔다',
        scene: ['서랍 안에 열쇠 뭉치, 서류 봉투, 집게로 묶은 접수표 묶음이 들어 있다 맨 앞에 쪽지 한 장과 할머니 달력 한 장이 같이 물려 있다', '찬장을 마주 보면 남쪽이다 할머니가 차 끓일 때 늘 남쪽을 보고 앉았다는 걸 그제야 떠올렸다'],
        unlockDoc: 'slips',
      },
    },

    tins: {
      title: '선반의 차 통',
      scene: 'inside',
      intro: '오른쪽 선반엔 통이 빼곡한데, 차 이름표가 붙은 건 맨 앞줄 다섯 통뿐이다 할머니가 매일 쓰던 통이다 통을 누르면 집어 들고, 다른 통을 누르면 바꿔 든다 든 통의 뚜껑을 열어 본다',
      docs: ['slips', 'board', 'doorpaper'],
      hintCode: 'O-S03',
      hints: (S) => { const t = birthSeason(S); return [
        '장부에 적힌 달을 내 달력의 철로 바꿔 봐라 우리가 아는 철하고 금이 다르게 그어져 있다',
        '한 번도 안 온 철이 하나 있다 철마다 빛이 있고, 빛마다 차가 있다',
        `${t.tea} 통 (${t.season} · ${t.han})`,
      ]; },
      initial: () => ({ pick: null }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const solved = S.solved.includes('tins');
        const ORDER = ['yellow', 'black', 'blue', 'white', 'red'];
        const shelf = el('div', 'tin-shelf');
        ORDER.forEach((id) => {
          const e = byId[id];
          const open = solved && id === birthSeason(S).id;
          const b = el('button', 'tin' + (d.pick === id && !solved ? ' picking' : '') + (open ? ' open' : '')); b.type = 'button';
          b.setAttribute('aria-label', `${e.tea} 통`);
          b.innerHTML = `<i class="tin-lid"></i><span class="tin-label">${e.tea}</span>`;
          b.onclick = () => { if (solved) return; d.pick = d.pick === id ? null : id; save(); };
          shelf.append(b);
        });
        const wrap = el('div', 'mail-wrap'); wrap.append(shelf, el('p', 'pick-label', solved ? `${birthSeason(S).tea} 통에서 뒷방 열쇠를 꺼냈다` : d.pick ? `${byId[d.pick].tea} 통을 집어 들었다` : '통을 하나 집어 든다'));
        return wrap;
      },
      commitLabel: '뚜껑 열어 보기',
      canCommit: (d) => !!d.pick,
      check(d, S) {
        const want = birthSeason(S).id;
        last.tea = byId[want].tea;
        if (d.pick === want) return { ok: true };
        const t = byId[d.pick].tea;
        return { ok: false, msg: `${t} 통 안엔 말린 차뿐이다 뚜껑을 도로 닫았다` };
      },
      reveal: {
        get title() { return `${last.tea} 통`; },
        text: '말린 차 사이에 「뒷방」 꼬리표가 달린 열쇠와 쪽지 한 장이 묻혀 있었다',
        scene: ['「네가 안 온 철에는 이걸 끓였다」 할머니 글씨다 통 안 차가 반도 안 남았다'],
        unlock: 'back',
      },
    },

    lanterns: {
      title: '장대에 걸린 등 다섯',
      scene: 'back',
      intro: '등 다섯 개, 스위치가 하나씩 등을 누르면 켜지고 켠 순서가 남는다 아래 버튼으로 책상 메모를 등잔 불빛에 대 볼 수 있다',
      docs: ['deskmemo', 'doorpaper', 'myslip'],
      hintCode: 'O-S04',
      hints: (S) => { const o = controlOrder(seedOf(S).id); return [
        '"네 빛부터"는 접수표에 있다 "누르는 순서"는 "낳는 순서"랑 다른 말이다',
        '메모 뒷면 연필 자국을 등잔에 대 봐라 문종이 화살표와 다른 길이 나온다',
        o.map((id, i) => `${i + 1} ${byId[id].lantern}`).join(' · '),
      ]; },
      initial: () => ({ lit: [], back: false }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const solved = S.solved.includes('lanterns');
        const wrap = el('div', 'lanterns-wrap');
        const pole = el('div', 'prop lanternpole'); const im = el('img'); im.src = P + 'back.webp'; im.alt = '장대에 걸린 등 다섯'; pole.append(im);
        const xs = { blue: 16.6, red: 33.9, yellow: 51.0, white: 68.0, black: 83.9 }; // 잘라 낸 장대 사진(x 123~901) 안 등 가운데
        const lit = solved ? controlOrder(seedOf(S).id) : d.lit;
        E.forEach((e) => {
          const on = lit.includes(e.id);
          const b = el('button', 'lantern ' + e.id + (on ? ' on' : '')); b.type = 'button'; b.style.left = xs[e.id] + '%';
          b.setAttribute('aria-label', `${e.lantern}${on ? ' (켜짐 · ' + (lit.indexOf(e.id) + 1) + '번째)' : ''}`);
          if (on) b.append(el('span', 'lantern-order', String(lit.indexOf(e.id) + 1)));
          b.onclick = () => { if (solved || on) return; d.lit.push(e.id); save(); };
          pole.append(b);
        });
        wrap.append(pole);
        const row = el('div', 'pick-row');
        const reset = el('button', 'chip', '다 끄고 다시'); reset.type = 'button'; reset.onclick = () => { if (solved) return; d.lit = []; save(); };
        const flip = el('button', 'chip' + (d.back ? ' on' : ''), d.back ? '메모 내려놓기' : '메모를 등잔에 대 보기'); flip.type = 'button'; flip.onclick = () => { d.back = !d.back; save(); };
        row.append(reset, flip);
        wrap.append(el('p', 'pick-label', lit.length ? `${lit.length}개 켜짐 · ${lit.map((id, i) => `${i + 1} ${byId[id].lantern}`.replace(/ /g, '\u00a0')).join(' · ')}` : '등을 누르면 켜진다 켠 순서가 남는다'), row);
        if (d.back) {
          const fig = el('figure', 'prop notecard backlit');
          fig.innerHTML = `<img src="${P}props/notecard.webp" alt="등잔 불빛에 비친 메모 뒷면" decoding="async"><div class="on-notecard star">${starSvg()}</div><figcaption>메모 뒷면 등잔 불빛에 대야 연필 자국이 보인다</figcaption>`;
          wrap.append(fig);
        }
        return wrap;
      },
      commitLabel: '접수함 열어 보기',
      check(d, S) {
        const ORDER = controlOrder(seedOf(S).id);
        if (d.lit.length < 5) return { ok: false, msg: `${d.lit.length}개만 켜져 있다 다섯 개 다 켜야 접수함이 움직인다` };
        if (d.lit.every((id, i) => id === ORDER[i])) return { ok: true };
        return { ok: false, msg: '다섯 번째 등이 켜졌는데 접수함이 그대로다' };
      },
      reveal: {
        title: '내 빛에서 시작해서',
        text: '다섯 번째 등이 켜지자 접수함 뚜껑이 딸깍 열렸다 안에는 접수표가 딱 한 장 받는 사람 칸에 「지원」',
        scene: ['등 다섯이 별 모양으로 한 바퀴 돌아 다시 내 빛으로 이어졌다 할머니가 손님마다 이걸 해 줬다는 걸, 내 차례가 되어서야 알았다', '접수표 맨 끝에 할머니가 몇 줄 더 적어 놨다 내일 병원 올 때 차를 달여 오라는 얘기다'],
        unlockDoc: 'final',
        unlock: 'inside',
      },
    },

    brew: {
      title: '고름차 달이기',
      scene: 'inside',
      intro: '선반 맨 앞줄 차 통 다섯 앞에 물 받은 주전자를 놨다 통을 한 번 누를 때마다 그 차가 한 숟갈씩 주전자에 들어간다 잘못 넣었으면 한 숟갈씩 덜어 내거나 주전자를 비우고 처음부터 다시 넣는다',
      docs: ['final', 'myslip', 'board'],
      hintCode: 'O-S05',
      hints: (S) => { const w = brewWant(S); return [
        '숟갈 세는 법은 접수함 속 접수표 맨 끝에 있다 빛마다 몇 개인지는 내 접수표에 있다',
        '제일 많은 빛 수를 기준으로 다른 빛이 몇씩 모자란지 세어 봐라 차 이름과 빛은 메뉴판에 짝지어 있다',
        E.filter((e) => w[e.id] > 0).map((e) => `${e.tea} ${w[e.id]}숟갈`).join(' · ') + ' (나머지 통은 안 넣는다)',
      ]; },
      initial: () => ({ spoons: {}, order: [] }),
      render(ctx) {
        const { d, el, save, S } = ctx;
        const solved = S.solved.includes('brew');
        d.spoons = d.spoons || {};
        const sp = solved ? brewWant(S) : d.spoons;
        const ORDER = ['yellow', 'black', 'blue', 'white', 'red']; // 차 통 장치와 같은 선반 순서
        const shelf = el('div', 'tin-shelf brew-shelf');
        ORDER.forEach((id) => {
          const e = byId[id];
          const n = sp[id] || 0;
          const b = el('button', 'tin scoop' + (n ? ' used' : '')); b.type = 'button';
          b.setAttribute('aria-label', `${e.tea} 한 숟갈 넣기${n ? ' (지금 ' + n + '숟갈)' : ''}`);
          b.innerHTML = `<i class="tin-lid"></i><span class="tin-label">${e.tea}</span>${n ? `<b class="spoon-badge">${n}</b>` : ''}`;
          b.onclick = () => { if (solved) return; if ((d.spoons[id] || 0) >= 9) return; d.spoons[id] = (d.spoons[id] || 0) + 1; d.order = [...(d.order || []), id]; save(); };
          shelf.append(b);
        });
        const pot = el('div', 'brew-pot' + (solved ? ' steaming' : ''));
        const beads = el('div', 'brew-beads');
        ORDER.forEach((id) => { for (let k = 0; k < (sp[id] || 0); k++) { const i = el('i'); i.style.background = TEA_FILL[id]; i.title = byId[id].tea; beads.append(i); } });
        const total = Object.values(sp).reduce((a, b) => a + b, 0);
        if (!total) beads.append(el('span', 'brew-empty', '맹물'));
        pot.append(el('span', 'brew-lid'), beads);
        const wrap = el('div', 'brew-wrap'); wrap.append(shelf, pot);
        const list = ORDER.filter((id) => sp[id]).map((id) => `${byId[id].tea} ${sp[id]}`.replace(/ /g, '\u00a0')).join(' · ');
        wrap.append(el('p', 'pick-label', solved ? '고름차를 보온병에 담았다' : total ? `주전자에 ${total}숟갈 · ${list}` : '차 통을 누르면 한 숟갈씩 주전자에 들어간다'));
        if (!solved) {
          const row = el('div', 'pick-row');
          // 한 숟갈 덜기: 마지막에 넣은 숟갈부터 하나씩 덜어 낸다 (넣은 순서 기록이 없으면 선반 오른쪽 통부터)
          const undo = el('button', 'chip', '한 숟갈 덜기'); undo.type = 'button'; undo.disabled = !total;
          undo.onclick = () => {
            const ord = (d.order || []).filter((id) => d.spoons[id] > 0);
            const id = ord.length ? ord[ord.length - 1] : [...ORDER].reverse().find((k) => d.spoons[k] > 0);
            if (!id) return;
            const at = ord.lastIndexOf(id); if (at >= 0) ord.splice(at, 1);
            d.spoons[id] -= 1; if (!d.spoons[id]) delete d.spoons[id];
            d.order = ord; save();
          };
          const reset = el('button', 'chip', '주전자 비우기'); reset.type = 'button'; reset.disabled = !total; reset.onclick = () => { d.spoons = {}; d.order = []; save(); };
          row.append(undo, reset); wrap.append(row);
        }
        return wrap;
      },
      commitLabel: '불 올려 달이기',
      canCommit: (d) => Object.values(d.spoons || {}).some((n) => n > 0),
      check(d, S) {
        const w = brewWant(S);
        if (E.every((e) => (d.spoons?.[e.id] || 0) === w[e.id])) return { ok: true };
        return { ok: false, msg: '끓기 전에 한 모금 떠 봤다 할머니가 달이던 맛이 아니다' };
      },
      reveal: {
        title: '할미 식 고름차',
        text: '주전자에서 김이 오르자 차 냄새가 한데 섞였다 어느 하나가 튀지 않는다',
        scene: ['보온병에 차를 담고 가게 불을 하나씩 껐다 뒷방 등도 껐다 전기세 나온다고 했으니까'],
        ending: true,
        endingLabel: '다음 날 아침, 병원으로',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '매화가 핀 병실 창가에서 할머니 찻잔에 보온병 차를 따르는 손',
    eyebrow: '3월 3일, 아침',
    title: '돌아오는 계절',
    paragraphs: (S) => {
      const e = seedOf(S), r = reading(S.profile), bt = birthSeason(S);
      const base = [
        `병원 앞 매화가 일찍 피어 있었다 보온병엔 어젯밤 할머니 쪽지대로 달인 고름차가 들었다 병실에 들어가 찻잔에 한 잔 따라 드렸다 열쇠 뭉치와 ${js(e.gift, '은', '는')} 가방에 넣어 왔다`,
        '"서랍 것 가져왔냐"',
        '"뒷방까지 가게 해 놓고"',
        '할머니가 웃었다 "니가 길을 잊었나 보려고"',
        `"${bt.tea} 통에 열쇠는 왜 넣었어"`,
        `"니 생일 철엔 니가 한 번도 안 왔잖아 그 철엔 그거 끓여 놓고 기다렸다"${bt.id === 'blue' ? ' 할머니가 창밖 매화를 봤다 "올해는 왔네"' : ''}`,
        '"접수표는 썼고?"',
        `"썼어 ${e.han}, ${js(e.el, '이래', '래')}"`,
        `"그래, 아기 때부터 ${js(e.el, '이었다', '였다')}" 할머니는 내 빛을 알고 있었다 평생 손님 빛을 세던 사람이 손녀 빛을 모를 리가 없었다`,
        `"${hj(e.id, '은', '는')} 말이다" 할머니가 찻잔을 든 채로 접수표에 쓴 풀이를 처음부터 다시 했다 토씨 하나 안 틀렸다 병실 옆 침대 아주머니가 듣다가 웃었다 "손녀 사주를 병실에서 보시네"`,
        '"접수표에 다 적어 놓고 왜 또 해"',
        `"적은 거랑 듣는 건 다르다" ${r.missing.length ? '없는 빛 얘기를 할 때 할머니는 목소리를 낮췄다' : '다섯이 다 있다는 대목에서 할머니는 조금 자랑스러워 보였다'} 내 빛 얘기를 다 하고 나서야 찻잔을 비웠다 ${tasteLine(S)}`,
        '이모가 이번 달 안에 가게 정리한다던데, 하고 꺼냈더니 할머니는 대답 대신 접수표 묶음 마지막 장을 펴서 내밀었다 비어 있는 칸이었다',
      ];
      if (!S.choice) return base;
      const prevPot = byId[PREV[e.id]].pot;
      const tail = {
        keep: [`접수표 마지막 장에 적었다 「${e.gift} 받음 계절 돌면 또 온다」 할머니가 들여다보더니 한마디 했다 "글씨는 나 닮았네"`, youngOf(S) ? '이모는 가게를 한 해만 더 두자고 했다 계절이 바뀌는 첫 주말마다 오행당에 간다 할머니 옆에 앉아 남쪽을 보고 찻물 끓이는 걸 거들고, 접수표 묶음에 내 이름이 한 장씩 늘어난다' : '이모는 가게를 한 해만 더 두자고 했다 계절이 바뀌는 첫 주말마다 오행당 문을 연다 할머니 자리에 앉아 남쪽을 보고 차를 끓이고, 접수표 묶음에 내 이름이 한 장씩 늘어난다'],
        release: ['접수표 마지막 장에 적었다 「가게는 못 하겠어 열쇠는 가지고 있을게」 할머니는 한참 보더니 접어서 내 가방에 도로 넣었다 "그것도 대답이다"', `오행당 간판은 그달 말에 내려갔다 섬돌 화분 다섯은 우리 집 베란다로 왔다 봄마다 ${prevPot}부터 물을 준다`],
        share: ['접수표 마지막 장에 적었다 「다음 손님은 내가 받을게 빛 세는 법 가르쳐 줘」 할머니가 찻잔을 내려놓았다 "퇴원하면 바로다 한 달은 걸린다"', '퇴원한 날 할머니는 접수표 묶음부터 찾았다 첫 손님은 이모였다 이모 빛은 火였고, 둘이 한참 싸웠다 가게 얘기는 그 뒤로 아무도 꺼내지 않았다'],
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
    afterword: (S) => { const e = seedOf(S); return `${js(e.gift, '은', '는')} ${S.choice === 'share' ? e.shopAt : e.homeAt}에 있다 접수표에 적힌 할머니 말대로다 「${e.giftLine}」`; },
    unlockDoc: 'final',
    next: { href: 'play.html?case=pet-home', title: '첫 번째 보호자', line: '다음은 동물병원 접수대 이야기입니다' },
  },
};
