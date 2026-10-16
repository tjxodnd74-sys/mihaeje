// 고양이의 초대장 — ★1. 이야기·자료·장치가 전부 이 파일에 있습니다
const P = 'assets/v2/cat-invite/';
const js = (w, a, b) => { const c = w.charCodeAt(w.length - 1); if (c < 0xac00 || c > 0xd7a3) return w + a; return w + ((c - 0xac00) % 28 ? a : b); }; // 받침 있음→a, 없음→b

// 장치 1: 봄이 사진 네 장을 찍은 순서(계절)대로
const PHOTOS = [
  { id: 'kitten', label: '벚꽃 아래 B', img: P + 'props/cat-kitten.webp', season: '봄' },
  { id: 'summer', label: '수박 옆', img: P + 'props/cat-summer.webp', season: '여름' },
  { id: 'autumn', label: '낙엽 위', img: P + 'props/cat-autumn.webp', season: '가을' },
  { id: 'winter', label: '눈 오는 날', img: P + 'props/cat-winter.webp', season: '겨울' },
  { id: 'spring', label: '벚꽃 아래 A', img: P + 'props/cat-spring.webp', season: '봄' },
];
const ORDER = ['kitten', 'summer', 'autumn', 'winter', 'spring'];

// 장치 2: 선물과 보낸 사람 맞추기
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
const GIFT_ANSWER = { blue: 'eunho', yellow: 'soyeon', green: 'jihu', flower: 'mijeong' };

// 장치 3: 평상 자리
const SEATS = [
  { id: 'tree', label: '감나무 쪽' },
  { id: 'post', label: '우체통 쪽' },
  { id: 'shop', label: '꽃집 쪽' },
  { id: 'lane', label: '골목 입구 쪽' },
];
// 평상을 둘러싼 자리: 감나무(북) → 우체통(동) → 꽃집(남) → 골목 입구(서), 시계 방향
// 은호: 감나무 맞은편(꽃집 쪽) / 소연: 은호의 왼손 쪽(꽃집 쪽에서 감나무를 보고 앉으면 왼손은 그림의 왼쪽=골목 입구 쪽) / 미정: 꽃집 문이 보이는 자리(감나무 쪽) / 지후: 남는 자리(골목 입구)
const SEAT_ANSWER = { tree: 'mijeong', lane: 'soyeon', shop: 'eunho', post: 'jihu' };

function seatChart(d = {}) {
  const ink = '#3a3a3a';
  const names = Object.fromEntries(PEOPLE.map((p) => [p.id, p.name]));
  const pen = (dd, w = 1) => `<path d="${dd}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const txt = (x, y, size, t, fill = ink) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" fill="${fill}" font-family="MihaejeHand, serif">${t}</text>`;
  const seat = (id, x, y, label) => {
    const who = d[id]; const on = d._pick === id;
    return `<g class="seat-box${who ? ' named' : ''}${on ? ' picking' : ''}" data-seat="${id}" role="button" tabindex="0" aria-label="${label} 자리${who ? ': ' + names[who] : ' (비어 있음)'}"><rect x="${x - 15}" y="${y - 8}" width="30" height="16" rx="1" fill="${on ? 'rgba(227,166,74,.35)' : 'rgba(255,255,255,.01)'}"/>${pen(`M${x - 13} ${y - 6} h26 v12 h-26 z`, on ? 1.6 : 1.1)}${txt(x, y + (who ? 2.6 : 2), who ? 7.5 : 5.2, who ? names[who] : label, who ? '#b23b2e' : ink)}</g>`;
  };
  return `<svg viewBox="0 0 120 100" class="seat-chart" role="img" aria-label="평상 자리표">
   ${pen('M32 34 h56 v32 h-56 z', 1.7)}${pen('M35 40 h50 M35 46 h50 M35 52 h50 M35 58 h50', 0.45)}
   ${txt(60, 52, 6, '평상')}
   ${pen('M60 3 v6 M53 7 c2 -6 12 -6 14 0 c3 -3 5 2 1 4 c-5 2 -11 2 -16 0 c-4 -2 -2 -7 1 -4 z', 0.8)}${txt(60, 15.5, 5, '감나무')}
   ${pen('M111 42 h8 v12 h-8 z M115 54 v8 M112 46 h6', 0.8)}${txt(114, 68, 5, '우체통')}
   ${pen('M46 93 h28 v6 h-28 z M60 93 v6 M46 93 l14 -5 l14 5', 0.8)}${txt(60, 90, 5, '꽃집 문')}
   ${pen('M3 40 l6 10 l-6 10 M12 40 l6 10 l-6 10', 0.7)}${txt(10, 67, 5, '골목 입구')}
   ${pen('M94 10 a18 18 0 0 1 10 12', 0.6)}${pen('M102 18 l2 4 l-4 1', 0.6)}${txt(92, 7, 4.2, '시계 방향')}
   ${seat('tree', 60, 25, '감나무 쪽')}${seat('post', 95, 50, '우체통 쪽')}${seat('shop', 60, 76, '꽃집 쪽')}${seat('lane', 22, 50, '골목 입구 쪽')}
  </svg>`;
}

export default {
  id: 'cat-invite',
  number: '009',
  title: '고양이의 초대장',
  subtitle: '봄이 앞으로 온 봉투',
  genre: '반려동물 · 따뜻한 미스터리',
  minutes: 15,
  difficulty: 1,
  cover: P + 'cover.webp',
  coverAlt: '포장 가게 창턱에서 자는 고양이와 바닥의 봉투',
  music: 'assets/music/cat-invite-v33.mp3',
  tagline: '받는 사람: 봄이\n보낸 사람은 적혀 있지 않았다',
  blurb: '작년 초여름, 골목 고양이 봄이를 집에 들인 다은\n어느 아침 가게 문 밑으로 봄이 앞으로 온 봉투가 들어왔습니다',
  storageKey: 'mihaeje-v2-cat-invite',
  hintTitle: '이웃들의 귀띔',
  tracesLabel: '이웃들이 남긴 것',

  opening: {
    eyebrow: '6월 10일, 아침',
    paragraphs: [
      '가게 문을 열다가 발밑에서 봉투를 밟을 뻔했다 받는 사람 칸에는 「봄이」라고만 적혀 있고 보낸 사람은 없었는데, 대신 빨간 잉크로 찍은 발바닥 도장이 하나 있었다',
      '봄이는 창턱에서 자고 있었다 작년 6월까지 이 골목 전체가 돌보던 고양이였고, 그 초여름에 내가 집으로 데려왔다 동물병원 은호 씨, 빵집 소연 씨, 우체부 지후 씨, 꽃집 미정 씨 봄이 덕분에 이름을 알게 된 사람들이다',
      '봉투 안에는 종이 한 장 「6월 12일 저녁 일곱 시 봄이를 데리고 오세요 어디로 오는지는 봄이가 알아요」',
      '봄이가 알긴 뭘 알아, 하고 목덜미를 쓰다듬는데 목걸이에 못 보던 참이 달려 있었다',
    ],
    cta: '봄이의 목걸이 보기',
  },

  traces: [
    { device: 'seasons', label: '은호의 상자' },
    { device: 'gifts', label: '소연의 바구니' },
    { device: 'seats', label: '지후의 봉투' },
  ],

  scenes: [
    {
      id: 'shop',
      name: '다은의 포장 가게',
      image: P + 'shop.webp',
      arrive: '아침 해가 창턱까지 들어와 있었고 봄이는 그 안에서 자고 있었다 문 밑 봉투와 목걸이에 달린 참, 둘 다 어젯밤까지는 없던 것이다',
      hotspots: [
        { id: 'envelope', x: 80, y: 84, label: '문 밑으로 들어온 봉투', kind: 'doc', doc: 'invite' },
        { id: 'charm', x: 53, y: 27, label: '봄이 목걸이의 참', kind: 'doc', doc: 'charm' },
        { id: 'go', x: 73, y: 52, label: '골목으로 나가기', kind: 'travel', to: 'alley' },
      ],
    },
    {
      id: 'alley',
      name: '골목 · 동물병원과 빵집',
      image: P + 'alley.webp',
      arrive: '봄이를 안고 골목으로 나왔다 동물병원 유리문에는 「오늘 휴진」 쪽지가, 빵집 문에는 「준비 중」 팻말이 걸려 있었다 두 사람 다 자리를 비웠는데, 창턱의 상자와 바구니는 누가 봐도 나 보라고 둔 것이었다',
      hotspots: [
        { id: 'vetnote', x: 18, y: 36, label: '병원 유리문의 쪽지', kind: 'doc', doc: 'vetnote' },
        { id: 'box', x: 9, y: 58, label: '창턱의 상자', kind: 'device', device: 'seasons' },
        { id: 'awning', x: 76, y: 16, label: '골목에서 본 것', kind: 'doc', doc: 'colors' },
        { id: 'basket', x: 92, y: 86, label: '빵집 앞 바구니', kind: 'device', device: 'gifts', visible: (S) => S.solved.includes('seasons') },
      ],
    },
    {
      id: 'end',
      name: '골목 끝 · 꽃집과 평상',
      image: P + 'end.webp',
      unlockedBy: 'gifts',
      arrive: '골목 끝 평상 위에 전구가 줄줄이 걸려 있었다 꽃집 미정 씨는 보이지 않았고, 우체통에 지후 씨 글씨로 「다은 씨」라고 적힌 봉투가 꽂혀 있었다 봄이가 품에서 내려가 평상 위로 올라갔다',
      hotspots: [
        { id: 'mail', x: 90, y: 52, label: '우체통의 봉투', kind: 'doc', doc: 'mail' },
        { id: 'chart', x: 62, y: 70, label: '평상 자리표', kind: 'device', device: 'seats' },
      ],
    },
  ],

  docs: {
    invite: {
      title: '문 밑으로 들어온 봉투',
      kind: '받는 사람: 봄이',
      html: `<figure class="prop envelope"><img src="${P}props/envelope.webp" alt="발바닥 도장이 찍힌 봉투" decoding="async"><span class="env-to">봄이 앞</span></figure><blockquote class="hand">6월 12일 저녁 일곱 시<br>봄이를 데리고 오세요<br>어디로 오는지는 봄이가 알아요</blockquote><p class="aside">글씨가 한 사람 것이 아니다 몇 사람이 돌아가며 쓴 것 같다</p>`,
    },
    charm: {
      title: '봄이 목걸이의 참',
      kind: '어젯밤까지 없던 것',
      html: `<figure class="prop collar"><img src="${P}props/collar.webp" alt="청진기, 빵, 꽃 모양 나무 참이 달린 목걸이" decoding="async"></figure><p>작은 나무 조각 세 개가 끈에 꿰어 있다 청진기, 빵, 꽃 골목 순서대로다 동물병원, 빵집, 그리고 골목 끝 꽃집</p><p class="aside">봄이가 작년까지 매일 돌던 길이기도 하다</p>`,
    },
    vetnote: {
      title: '병원 유리문의 쪽지',
      kind: '은호의 글씨',
      html: `<blockquote class="hand">다은 씨, 오늘 하루 휴진입니다<br>창턱에 봄이 상자 두고 갔어요<br>재작년부터 찍어 둔 사진인데, 찍은 순서대로 넣으면 열려요<br>벚꽃 사진이 두 장인데, 봄이가 얼마나 컸는지 보면 어느 해인지 알아요</blockquote><p class="aside">은호 씨는 봄이 접종 때마다 파란 수건을 깔아 주던 사람이다</p>`,
    },
    colors: {
      title: '골목에서 본 것',
      kind: '내 눈에 들어온 것들',
      html: `<p>빵집 차양은 노란색이고 소연 씨는 늘 그 색 앞치마를 입는다 지후 씨의 우편 가방은 초록색이라 골목 끝에서도 알아본다 은호 씨 병원 창턱에는 봄이 전용 파란 수건이 아직 개켜 있다</p><p>꽃집 미정 씨는 리본을 싫어한다 꽃은 꽃으로 주면 된다고 했다</p>`,
    },
    basketnote: {
      title: '바구니의 쪽지',
      kind: '소연의 글씨',
      html: `<blockquote class="hand">다은 씨!<br>은호 씨 상자에서 나온 것까지 선물은 넷, 누구 건지는 안 적었어요<br>맞혀 보세요 다 알 거예요<br>맞히면 바구니 바닥에 다음 갈 곳이 있어요</blockquote>`,
    },
    mail: {
      title: '우체통의 봉투',
      kind: '지후의 글씨',
      html: `<blockquote class="hand">다은 씨께<br>12일 모임 날 자리표예요 네 사람 부탁을 적어 뒀어요<br>자리 정해지면 평상 밑 상자를 열어 보세요</blockquote><div class="notes-list"><p><b>은호</b> 봄이는 분명 감나무에 올라가 있을 거예요 나무가 정면으로 보이는 자리로 주세요</p><p><b>소연</b> 은호 씨 왼손 쪽에 앉을게요 접시 건네기 편하게</p><p><b>미정</b> 가게 문이 바로 보이는 자리요 손님 오면 일어나야 해서</p><p><b>지후</b> 저는 아무 데나요 남는 자리 주세요</p></div><p class="aside">평상 자리는 감나무 쪽, 우체통 쪽, 꽃집 쪽, 골목 입구 쪽 넷이고, 그림에는 평상 둘레에 뭐가 있는지 그려 두었다</p>`,
    },
    final: {
      title: '평상 밑 상자의 초대장',
      kind: '받는 사람: 다은',
      locked: true,
      html: `<figure class="prop envelope"><img src="${P}props/envelope.webp" alt="발바닥 도장이 찍힌 봉투" decoding="async"><span class="env-to">다은 앞</span></figure><blockquote class="hand">봄이의 첫 번째 가족 기념일에 초대합니다<br>작년 6월 12일, 봄이는 다은 씨 집으로 갔고<br>우리는 그날부터 다은 씨 이웃이 됐어요<br>봄이 핑계로 매일 가게 앞을 지나가던 건 사실 다은 씨 보려고요<br>이번엔 식탁에 같이 앉아요<br>— 은호, 소연, 지후, 미정</blockquote>`,
    },
  },

  devices: {
    seasons: {
      title: '창턱의 상자',
      scene: 'alley',
      intro: '뚜껑 안쪽에 사진 주머니가 다섯 찍은 순서대로 넣으면 걸쇠가 열린다고 했다',
      docs: ['vetnote'],
      hintCode: 'C-S01',
      hints: [
        '사진마다 계절이 보이는데 벚꽃이 두 장입니다 하나는 아기 고양이, 하나는 다 큰 봄이 작은 쪽이 먼저입니다',
        '아기 봄이(봄) → 여름 → 가을 → 겨울 → 다 큰 봄이(그다음 봄)',
        '벚꽃 아래(작은 봄이) → 수박 옆 → 낙엽 위 → 눈 오는 날 → 벚꽃 아래(다 큰 봄이)',
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
          s.onclick = () => { if (pid) { d.slots[i] = null; save(); } };
          lid.append(s);
        });
        wrap.append(lid);
        const tray = el('div', 'photo-tray');
        ['autumn', 'spring', 'winter', 'kitten', 'summer'].map((id) => PHOTOS.find((p) => p.id === id)).filter((p) => !d.slots.includes(p.id)).forEach((p) => {
          const b = el('button', 'photo-pick'); b.type = 'button'; b.setAttribute('aria-label', p.label + ' 사진 넣기');
          const pi = el('img'); pi.src = p.img; pi.alt = p.label; b.append(pi, el('span', '', p.label));
          b.onclick = () => { const i = d.slots.indexOf(null); if (i < 0) return; d.slots[i] = p.id; save(); };
          tray.append(b);
        });
        wrap.append(el('p', 'pick-label', '상자 옆에 흩어진 사진 (누르면 빈 주머니부터 들어감 · 주머니를 누르면 뺌)'), tray);
        return wrap;
      },
      commitLabel: '뚜껑 닫고 걸쇠 누르기',
      check(d) {
        if (d.slots.includes(null)) return { ok: false, msg: '주머니 다섯을 다 채워야 걸쇠가 눌린다' };
        if (d.slots.every((p, i) => p === ORDER[i])) return { ok: true };
        const names = Object.fromEntries(PHOTOS.map((p) => [p.id, p]));
        for (let i = 0; i < 5; i++) if (d.slots[i] !== ORDER[i]) {
          const got = names[d.slots[i]], want = names[ORDER[i]];
          if ((got.id === 'spring' && want.id === 'kitten') || (got.id === 'kitten' && want.id === 'spring')) return { ok: false, msg: `${i + 1}번째 벚꽃 사진, 봄이 크기를 다시 보자 작을 때가 먼저다` };
          return { ok: false, msg: `${i + 1}번째 사진이 그 자리가 아니다 계절이 순서대로 이어지는지 다시 본다` };
        }
        return { ok: false, msg: '순서가 맞지 않는다' };
      },
      reveal: {
        title: '두 번의 봄',
        text: '걸쇠가 톡 하고 열렸다 안에는 파란 리본을 두른 작은 상자와 쪽지 한 장이 들어 있었다',
        scene: [
          '「봄이가 골목에 온 게 재작년 봄이었어요 손바닥만 했는데 다은 씨가 데려가기 전까지 다섯 계절을 우리가 봤어요 — 은호」',
          '봄이는 내 품에서 상자 냄새를 맡더니 관심을 잃었다 파란 리본 상자는 일단 가방에 넣고 빵집 쪽으로 갔다',
        ],
        unlock: null,
      },
    },

    gifts: {
      title: '빵집 앞 바구니',
      scene: 'alley',
      intro: '바구니에 선물 셋과 빈 이름표 넷 은호 씨 상자에서 나온 파란 리본 상자를 옆에 놓으니 넷이 됐다 선물에는 보낸 사람 이름이 없다 이름표를 맞게 달면 바구니 바닥에 다음 갈 곳이 있다',
      docs: ['basketnote', 'colors'],
      hintCode: 'C-S02',
      hints: [
        '리본 색이 그 사람의 일과 닿아 있습니다 「골목에서 본 것」에 색이 다 나옵니다',
        '파란 수건은 병원, 노란 차양은 빵집, 초록 가방은 우체부 리본을 싫어하는 사람은 꽃집',
        '파란 리본 → 은호, 노란 리본 → 소연, 초록 리본 → 지후, 꽃다발 → 미정',
      ],
      initial: () => ({ who: {}, pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'gifts');
        const basket = el('div', 'prop basket'); const im = el('img'); im.src = P + 'props/basket.webp'; im.alt = '선물 넷이 든 바구니'; basket.append(im);
        const pos = { blue: [35, 37], yellow: [63.5, 37], green: [36, 77], flower: [67, 81] };
        GIFTS.forEach((g) => {
          const [x, y] = pos[g.id]; const who = PEOPLE.find((p) => p.id === d.who[g.id]);
          const t = el('button', 'tag' + (who ? ' named' : '') + (d.pick === g.id ? ' picking' : '')); t.type = 'button'; t.style.left = x + '%'; t.style.top = y + '%';
          t.setAttribute('aria-label', `${g.label}의 이름표${who ? ': ' + who.name : ' (비어 있음)'}`);
          t.textContent = who ? who.name : '?';
          t.onclick = () => { d.pick = d.pick === g.id ? null : g.id; save(); };
          basket.append(t);
        });
        wrap.append(basket);
        if (d.pick) {
          const g = GIFTS.find((x) => x.id === d.pick);
          wrap.append(el('p', 'pick-label', `${g.label}의 이름표에 쓸 이름`));
          const row = el('div', 'pick-row');
          PEOPLE.forEach((p) => { const b = el('button', 'chip' + (d.who[d.pick] === p.id ? ' on' : ''), p.name); b.type = 'button'; b.setAttribute('aria-label', `${js(g.label, '은', '는')} ${p.name}`); b.onclick = () => { d.who[d.pick] = p.id; d.pick = null; save(); }; row.append(b); });
          wrap.append(row);
        } else wrap.append(el('p', 'pick-label', '바구니 속 이름표(?)를 누르면 이름을 쓸 수 있다'));
        return wrap;
      },
      commitLabel: '이름표 다 달았다',
      check(d) {
        const missing = GIFTS.filter((g) => !d.who[g.id]);
        if (missing.length) return { ok: false, msg: `${missing[0].label} 이름표가 아직 비어 있다` };
        const wrong = GIFTS.filter((g) => d.who[g.id] !== GIFT_ANSWER[g.id]);
        if (!wrong.length) return { ok: true };
        const g = wrong[0]; const who = PEOPLE.find((p) => p.id === d.who[g.id]);
        if (g.id === 'flower') return { ok: false, msg: `${who.name} 씨가 꽃다발을? 리본을 싫어하는 사람이 누구였더라` };
        return { ok: false, msg: `${js(g.label, '이', '가')} ${who.name} 씨 것 같지 않다 그 사람한테서 그 색을 본 적이 있나` };
      },
      reveal: {
        title: '네 사람, 네 색',
        text: '바구니 바닥에 쪽지가 한 장 더 있었다 「골목 끝 평상으로 전구 켜 놨어요 — 소연」',
        scene: [
          '노란 리본 상자에서 버터 냄새가 났다 소연 씨는 작년에 봄이한테 빵 부스러기를 주다가 은호 씨한테 혼난 적이 있다 그 뒤로는 봄이 전용 간식을 따로 구웠다',
          '전구라니 저녁 일곱 시가 무슨 날인지 아직도 모르겠는데, 골목 끝으로 걸었다',
        ],
        unlock: 'end',
      },
    },

    seats: {
      title: '평상 자리표',
      scene: 'end',
      intro: '지후 씨 봉투에 든 자리표 네 사람의 부탁대로 자리를 정하면 평상 밑 상자가 열린다',
      docs: ['mail'],
      hintCode: 'C-S03',
      hints: [
        '은호 씨부터 "감나무가 정면으로 보이는 자리"는 감나무 쪽이 아니라 감나무 맞은편입니다 그림에서 맞은편을 찾으세요',
        '꽃집 쪽에 앉아 감나무를 보면 왼손은 골목 입구 쪽입니다 소연 씨는 거기 미정 씨는 꽃집 문이 보이는 자리, 즉 꽃집 맞은편',
        '꽃집 쪽 은호, 골목 입구 쪽 소연, 감나무 쪽 미정, 우체통 쪽 지후',
      ],
      initial: () => ({ seat: {}, pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'seats');
        const chart = el('div', 'prop paperchart'); chart.innerHTML = `<img src="${P}props/paper.webp" alt="지후 씨 봉투에서 나온 종이" decoding="async"><div class="chart-on-paper">${seatChart({ ...d.seat, _pick: d.pick })}</div>`;
        chart.querySelectorAll('[data-seat]').forEach((g) => { const go = () => { d.pick = d.pick === g.dataset.seat ? null : g.dataset.seat; save(); }; g.addEventListener('click', go); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
        wrap.append(chart);
        if (d.pick) {
          const s = SEATS.find((x) => x.id === d.pick);
          wrap.append(el('p', 'pick-label', `${s.label} 자리에 앉을 사람`));
          const picks = el('div', 'pick-row');
          PEOPLE.forEach((p) => { const b = el('button', 'chip' + (d.seat[d.pick] === p.id ? ' on' : ''), p.name); b.type = 'button'; b.setAttribute('aria-label', `${s.label}에 ${p.name}`); b.onclick = () => { for (const k of Object.keys(d.seat)) if (d.seat[k] === p.id) delete d.seat[k]; d.seat[d.pick] = p.id; d.pick = null; save(); }; picks.append(b); });
          wrap.append(picks);
        } else wrap.append(el('p', 'pick-label', '종이 위 네모 칸을 연필로 짚으면 이름을 적을 수 있다'));
        return wrap;
      },
      commitLabel: '자리표 평상에 놓기',
      check(d) {
        const empty = SEATS.filter((s) => !d.seat[s.id]);
        if (empty.length) return { ok: false, msg: `${empty[0].label} 자리가 비어 있다` };
        if (SEATS.every((s) => d.seat[s.id] === SEAT_ANSWER[s.id])) return { ok: true };
        if (d.seat.tree === 'eunho') return { ok: false, msg: '은호 씨가 감나무 쪽에 앉으면 감나무는 등 뒤다 "정면으로 보이는 자리"가 아니다' };
        if (d.seat.shop !== 'eunho') return { ok: false, msg: '감나무가 정면으로 보이는 자리는 감나무 맞은편이다 은호 씨부터 다시' };
        if (d.seat.lane !== 'soyeon') return { ok: false, msg: d.seat.post === 'soyeon' ? '소연 씨가 우체통 쪽이면 은호 씨 오른손이다 꽃집 쪽에 앉아 감나무를 바라보는 사람의 왼손은 그림에서 어느 쪽인가' : '꽃집 쪽에 앉아 감나무를 바라보면 왼손은 어느 쪽인지, 그림을 보며 생각해 보자' };
        if (d.seat.tree !== 'mijeong') return { ok: false, msg: '미정 씨는 꽃집 문이 보이는 자리다 꽃집 쪽이 아니라 꽃집이 보이는 쪽' };
        return { ok: false, msg: '지후 씨는 남는 자리다 셋이 정해지면 하나 남는다' };
      },
      reveal: {
        title: '네 자리, 그리고 빈자리 하나',
        text: '평상 밑 상자가 열렸다 발바닥 도장이 찍힌 봉투가 한 장 더 있었는데, 이번엔 받는 사람이 「다은」이었다',
        scene: ['자리표 네 칸을 채우고 나서야 평상 한가운데가 비어 있는 게 보였다 봄이가 그 자리에 올라앉아 꼬리로 바닥을 쳤다'],
        unlock: null,
        ending: true,
        endingLabel: '이틀 뒤, 저녁 일곱 시로',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '전구 아래 평상에 둘러앉은 네 이웃과, 봄이를 안고 다가가는 다은',
    eyebrow: '6월 12일, 저녁 일곱 시',
    title: '고양이가 데려온 사람들',
    paragraphs: [
      '전구가 켜진 평상에 네 사람이 앉아 있었다 케이크 위에는 초 대신 작은 발바닥 모양 쿠키가 하나 꽂혀 있었고, 은호 씨가 먼저 손을 흔들었다',
      '“봄이 생일은 아무도 모르잖아요 그래서 가족 된 날로 했어요” 소연 씨가 말했다 “작년 오늘, 다은 씨가 봄이 데려간 날”',
      '“근데 왜 저한테는 봄이 앞으로 보내요” “다은 씨 앞으로 보내면 바쁘다고 안 올 것 같아서” 지후 씨가 웃었다 “봄이 앞으로 보내면 봄이 핑계로라도 오잖아요”',
      '미정 씨가 꽃 한 송이를 더 내밀었다 역시 리본은 없었다 “작년에 봄이 데려간다고 했을 때, 우리 넷이 사실 좀 섭섭했어요 근데 그 뒤로 다은 씨 가게 앞을 지나는 게 좋더라고요”',
      '네 사람이 조금씩 당겨 앉아 내 자리를 만들었다 봄이는 이미 평상 한가운데서 쿠키를 노리고 있었다',
    ],
    afterword: '봄이는 여전히 창턱에서 잔다 아침마다 나는 병원, 빵집, 꽃집 순서로 골목을 한 바퀴 돌고 가게 문을 연다 작년까지 봄이가 돌던 길이다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=ohang', title: '돌아오는 계절', line: '다음은 오행당의 다섯 그릇 이야기입니다' },
  },
};
