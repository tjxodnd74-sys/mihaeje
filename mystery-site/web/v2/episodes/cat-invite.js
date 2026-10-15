// 고양이의 초대장 — ★1. 이야기·자료·장치가 전부 이 파일에 있습니다.
const P = 'assets/v2/cat-invite/';

// 장치 1: 봄이 사진 네 장을 찍은 순서(계절)대로
const PHOTOS = [
  { id: 'spring', label: '벚꽃 아래', img: P + 'props/cat-spring.webp', season: '봄' },
  { id: 'summer', label: '수박 옆', img: P + 'props/cat-summer.webp', season: '여름' },
  { id: 'autumn', label: '낙엽 위', img: P + 'props/cat-autumn.webp', season: '가을' },
  { id: 'winter', label: '눈 오는 날', img: P + 'props/cat-winter.webp', season: '겨울' },
];
const ORDER = ['spring', 'summer', 'autumn', 'winter'];

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
// 시계 방향: 감나무 → 우체통 → 꽃집 → 골목 입구
const SEAT_ANSWER = { tree: 'eunho', post: 'soyeon', shop: 'jihu', lane: 'mijeong' };

function seatChart(d = {}) {
  const pos = { tree: [50, 16], post: [84, 50], shop: [50, 84], lane: [16, 50] };
  const ink = '#2f3a7a';
  const names = Object.fromEntries(PEOPLE.map((p) => [p.id, p.name]));
  const seats = SEATS.map((s) => {
    const [x, y] = pos[s.id]; const who = d[s.id];
    return `<g><circle cx="${x}" cy="${y}" r="9" fill="${who ? '#f2c14e' : 'none'}" stroke="${ink}" stroke-width="1.2" stroke-dasharray="${who ? '0' : '2 1.5'}"/><text x="${x}" y="${y + (who ? 1.6 : 1.2)}" font-size="${who ? 5 : 3.2}" text-anchor="middle" fill="${ink}" font-family="MihaejeHand, serif">${who ? names[who] : s.label}</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 100 100" class="seat-chart" role="img" aria-label="평상 자리표">
   <rect x="30" y="30" width="40" height="40" rx="3" fill="none" stroke="${ink}" stroke-width="1.4"/>
   <path d="M33 36 h34 M33 42 h34 M33 48 h34 M33 54 h34 M33 60 h34 M33 66 h34" stroke="${ink}" stroke-width=".5" opacity=".5"/>
   <text x="50" y="52" font-size="4" text-anchor="middle" fill="${ink}" font-family="MihaejeHand, serif">평상</text>
   <path d="M50 4 c-3 -2 -6 1 -4 3 c-2 2 1 5 4 3 c3 2 6 -1 4 -3 c2 -2 -1 -5 -4 -3 z" fill="none" stroke="${ink}" stroke-width=".6"/>
   <text x="92" y="8" font-size="3.4" text-anchor="end" fill="${ink}" font-family="MihaejeHand, serif">시계 방향 →</text>
   <path d="M62 10 a 40 40 0 0 1 28 28" fill="none" stroke="${ink}" stroke-width=".6" stroke-dasharray="1.5 1.5"/>
   ${seats}
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
  tagline: '받는 사람: 봄이.\n보낸 사람은 적혀 있지 않았다',
  blurb: '작년 여름, 골목 고양이 봄이를 집에 들인 다은.\n어느 아침 가게 문 밑으로 봄이 앞으로 온 봉투가 들어왔습니다.',
  storageKey: 'mihaeje-v2-cat-invite',

  opening: {
    eyebrow: '6월 10일, 아침',
    paragraphs: [
      '가게 문을 열다가 발밑에서 봉투를 밟을 뻔했다. 받는 사람 칸에는 「봄이」라고만 적혀 있고 보낸 사람은 없었는데, 대신 빨간 잉크로 찍은 발바닥 도장이 하나 있었다',
      '봄이는 창턱에서 자고 있었다. 작년 여름까지 이 골목 전체가 돌보던 고양이였고, 그 여름 끝에 내가 집으로 데려왔다. 동물병원 은호 씨, 빵집 소연 씨, 우체부 지후 씨, 꽃집 미정 씨. 봄이 덕분에 이름을 알게 된 사람들이다',
      '봉투 안에는 종이 한 장. 「6월 12일 저녁 일곱 시. 봄이를 데리고 오세요. 어디로 오는지는 봄이가 알아요」',
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
      arrive: '아침 해가 창턱까지 들어와 있었고 봄이는 그 안에서 자고 있었다. 문 밑 봉투와 목걸이에 달린 참, 둘 다 어젯밤까지는 없던 것이다',
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
      arrive: '봄이를 안고 골목으로 나왔다. 동물병원 유리문에는 「오늘 휴진」 쪽지가, 빵집 문에는 「준비 중」 팻말이 걸려 있었다. 두 사람 다 자리를 비웠는데, 창턱의 상자와 바구니는 누가 봐도 나 보라고 둔 것이었다',
      hotspots: [
        { id: 'vetnote', x: 18, y: 36, label: '병원 유리문의 쪽지', kind: 'doc', doc: 'vetnote' },
        { id: 'box', x: 9, y: 58, label: '창턱의 상자', kind: 'device', device: 'seasons' },
        { id: 'awning', x: 76, y: 16, label: '골목에서 본 것', kind: 'doc', doc: 'colors' },
        { id: 'basket', x: 92, y: 86, label: '빵집 앞 바구니', kind: 'device', device: 'gifts' },
      ],
    },
    {
      id: 'end',
      name: '골목 끝 · 꽃집과 평상',
      image: P + 'end.webp',
      unlockedBy: 'gifts',
      arrive: '골목 끝 평상 위에 전구를 걸어 두고 있었다. 꽃집 미정 씨는 보이지 않았고, 우체통에 지후 씨 글씨로 「다은 씨」라고 적힌 봉투가 꽂혀 있었다. 봄이가 품에서 내려가 평상 위로 올라갔다',
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
      html: `<figure class="prop envelope"><img src="${P}props/envelope.webp" alt="발바닥 도장이 찍힌 봉투" decoding="async"><span class="env-to">봄이 앞</span></figure><blockquote class="hand">6월 12일 저녁 일곱 시<br>봄이를 데리고 오세요<br>어디로 오는지는 봄이가 알아요</blockquote><p class="aside">글씨는 네 사람 것이 섞여 있다. 한 줄씩 돌아가며 쓴 것 같다</p>`,
    },
    charm: {
      title: '봄이 목걸이의 참',
      kind: '어젯밤까지 없던 것',
      html: `<div class="charm"><span class="charm-tag">🩺</span><span class="charm-tag">🥐</span><span class="charm-tag">💐</span></div><p>작은 나무 조각 세 개가 끈에 꿰어 있다. 청진기, 빵, 꽃. 골목 순서대로다. 동물병원, 빵집, 그리고 골목 끝 꽃집</p><p class="aside">봄이가 작년까지 매일 돌던 길이기도 하다</p>`,
    },
    vetnote: {
      title: '병원 유리문의 쪽지',
      kind: '은호의 글씨',
      html: `<blockquote class="hand">다은 씨, 오늘 하루 휴진입니다<br>창턱에 봄이 상자 두고 갔어요<br>작년에 찍어 둔 사진인데, 찍은 순서대로 넣으면 열려요<br>순서는 봄이가 알아요 (사진 보면 아실 거예요)</blockquote><p class="aside">은호 씨는 봄이 접종 때마다 파란 수건을 깔아 주던 사람이다</p>`,
    },
    colors: {
      title: '골목에서 본 것',
      kind: '내 눈에 들어온 것들',
      html: `<p>빵집 차양은 노란색이고 소연 씨는 늘 그 색 앞치마를 입는다. 지후 씨의 우편 가방은 초록색이라 골목 끝에서도 알아본다. 은호 씨 병원 창턱에는 봄이 전용 파란 수건이 아직 개켜 있다</p><p>꽃집 미정 씨는 리본을 싫어한다. 꽃은 꽃으로 주면 된다고 했다</p>`,
    },
    basketnote: {
      title: '바구니의 쪽지',
      kind: '소연의 글씨',
      html: `<blockquote class="hand">다은 씨!<br>선물은 넷인데 누구 건지 안 적었어요<br>맞혀 보세요. 다 알 거예요<br>맞히면 바구니 바닥에 다음 갈 곳이 있어요</blockquote>`,
    },
    mail: {
      title: '우체통의 봉투',
      kind: '지후의 글씨',
      html: `<blockquote class="hand">다은 씨께<br>오늘 저녁 자리표예요. 네 사람 부탁을 적어 뒀어요<br>자리 정해지면 평상 밑 상자를 열어 보세요</blockquote><div class="notes-list"><p><b>은호</b> 감나무 쪽이요. 거기서 봄이가 제일 잘 보여요</p><p><b>소연</b> 은호 씨 바로 다음 자리요. 시계 방향으로</p><p><b>지후</b> 저는 소연 씨 다음이요. 같은 방향으로요</p><p><b>미정</b> 남는 자리 주세요. 꽃 놓을 자리만 있으면 돼요</p></div><p class="aside">평상 자리는 감나무 쪽, 우체통 쪽, 꽃집 쪽, 골목 입구 쪽 넷이다</p>`,
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
      intro: '상자 뚜껑에 사진 네 장이 들어갈 자리가 있다. 찍은 순서대로 넣으면 열린다고 했다',
      docs: ['vetnote'],
      hintCode: 'C-S01',
      hints: [
        '사진마다 계절이 보입니다. 벚꽃, 수박, 낙엽, 눈. 계절 순서대로 놓으면 됩니다',
        '봄 → 여름 → 가을 → 겨울. 벚꽃 아래가 첫 번째입니다',
        '벚꽃 아래 · 수박 옆 · 낙엽 위 · 눈 오는 날',
      ],
      initial: () => ({ slots: [null, null, null, null] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'seasons');
        const slots = el('div', 'photo-slots');
        d.slots.forEach((pid, i) => {
          const s = el('button', 'photo-slot' + (pid ? ' filled' : '')); s.type = 'button'; s.setAttribute('aria-label', `${i + 1}번째 자리${pid ? ': ' + PHOTOS.find((p) => p.id === pid).label : ''}`);
          if (pid) { const ph = PHOTOS.find((p) => p.id === pid); const im = el('img'); im.src = ph.img; im.alt = ph.label; s.append(im); }
          else s.append(el('span', 'slot-num', String(i + 1)));
          s.onclick = () => { if (pid) { d.slots[i] = null; save(); } };
          slots.append(s);
        });
        wrap.append(el('p', 'pick-label', '뚜껑의 자리 (누르면 뺌)'), slots);
        const tray = el('div', 'photo-tray');
        PHOTOS.filter((p) => !d.slots.includes(p.id)).forEach((p) => {
          const b = el('button', 'photo-pick'); b.type = 'button'; b.setAttribute('aria-label', p.label + ' 사진 넣기');
          const im = el('img'); im.src = p.img; im.alt = p.label; b.append(im, el('span', '', p.label));
          b.onclick = () => { const i = d.slots.indexOf(null); if (i < 0) return; d.slots[i] = p.id; save(); };
          tray.append(b);
        });
        wrap.append(el('p', 'pick-label', '상자 옆에 놓인 사진'), tray);
        return wrap;
      },
      commitLabel: '뚜껑 닫고 걸쇠 누르기',
      check(d) {
        if (d.slots.includes(null)) return { ok: false, msg: '네 자리를 다 채워야 걸쇠가 눌린다' };
        if (d.slots.every((p, i) => p === ORDER[i])) return { ok: true };
        const names = Object.fromEntries(PHOTOS.map((p) => [p.id, p]));
        for (let i = 0; i < 4; i++) if (d.slots[i] !== ORDER[i]) {
          const got = names[d.slots[i]], want = names[ORDER[i]];
          return { ok: false, msg: `${i + 1}번째가 ${got.label}(${got.season})인데, ${want.season}이 먼저다. 계절 순서로 다시 놓아 보자` };
        }
        return { ok: false, msg: '순서가 맞지 않는다' };
      },
      reveal: {
        title: '봄, 여름, 가을, 겨울',
        text: '걸쇠가 톡 하고 열렸다. 안에는 파란 리본을 두른 작은 상자와 쪽지 한 장이 들어 있었다',
        scene: [
          '「봄이가 골목에 온 게 재작년 봄이었어요. 사진은 그때부터 찍었어요. 다은 씨가 데려가기 전 네 계절이에요 — 은호」',
          '봄이는 내 품에서 상자 냄새를 맡더니 관심을 잃었다. 파란 리본 상자는 일단 가방에 넣고 빵집 쪽으로 갔다',
        ],
        unlock: null,
      },
    },

    gifts: {
      title: '빵집 앞 바구니',
      scene: 'alley',
      intro: '바구니에 선물 넷과 쪽지 한 장. 선물에는 보낸 사람 이름이 없다. 누가 보낸 건지 맞히면 바구니 바닥에 다음 갈 곳이 있다',
      docs: ['basketnote', 'colors'],
      hintCode: 'C-S02',
      hints: [
        '리본 색이 그 사람의 일과 닿아 있습니다. 「골목에서 본 것」에 색이 다 나옵니다',
        '파란 수건은 병원, 노란 차양은 빵집, 초록 가방은 우체부. 리본을 싫어하는 사람은 꽃집',
        '파란 리본 → 은호, 노란 리본 → 소연, 초록 리본 → 지후, 꽃다발 → 미정',
      ],
      initial: () => ({ who: {} }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'gifts');
        GIFTS.forEach((g) => {
          const row = el('div', 'gift-row');
          row.append(el('span', 'gift-name', g.label));
          const picks = el('div', 'pick-row');
          PEOPLE.forEach((p) => { const b = el('button', 'chip' + (d.who[g.id] === p.id ? ' on' : ''), p.name); b.type = 'button'; b.setAttribute('aria-label', `${g.label}은 ${p.name}`); b.onclick = () => { d.who[g.id] = p.id; save(); }; picks.append(b); });
          row.append(picks); wrap.append(row);
        });
        return wrap;
      },
      commitLabel: '이름표 붙이기',
      check(d) {
        const missing = GIFTS.filter((g) => !d.who[g.id]);
        if (missing.length) return { ok: false, msg: `${missing[0].label}에 아직 이름을 안 붙였다` };
        const wrong = GIFTS.filter((g) => d.who[g.id] !== GIFT_ANSWER[g.id]);
        if (!wrong.length) return { ok: true };
        const g = wrong[0]; const who = PEOPLE.find((p) => p.id === d.who[g.id]);
        if (g.id === 'flower') return { ok: false, msg: `${who.name} 씨가 꽃다발을? 리본을 싫어하는 사람이 누구였더라` };
        return { ok: false, msg: `${g.label}이 ${who.name} 씨 것 같지 않다. ${who.job}에서 그 색을 본 적이 있나` };
      },
      reveal: {
        title: '네 사람, 네 색',
        text: '바구니 바닥에 쪽지가 한 장 더 있었다. 「골목 끝 평상으로. 전구 켜 놨어요 — 소연」',
        scene: [
          '노란 리본 상자에서 버터 냄새가 났다. 소연 씨는 작년에 봄이한테 빵 부스러기를 주다가 은호 씨한테 혼난 적이 있다. 그 뒤로는 봄이 전용 간식을 따로 구웠다',
          '전구라니. 저녁 일곱 시가 무슨 날인지 아직도 모르겠는데, 골목 끝으로 걸었다',
        ],
        unlock: 'end',
      },
    },

    seats: {
      title: '평상 자리표',
      scene: 'end',
      intro: '지후 씨 봉투에 든 자리표. 네 사람의 부탁대로 자리를 정하면 평상 밑 상자가 열린다',
      docs: ['mail'],
      hintCode: 'C-S03',
      hints: [
        '은호 씨 자리부터 정하세요. 감나무 쪽이라고 적혀 있습니다. 그다음은 시계 방향으로 한 칸씩',
        '시계 방향 순서는 감나무 → 우체통 → 꽃집 → 골목 입구입니다',
        '감나무 쪽 은호, 우체통 쪽 소연, 꽃집 쪽 지후, 골목 입구 쪽 미정',
      ],
      initial: () => ({ seat: {} }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'seats');
        const chart = el('div', 'prop paperchart'); chart.innerHTML = `<img src="${P}props/paper.webp" alt="" decoding="async"><div class="chart-on-paper">${seatChart(d.seat)}</div>`;
        wrap.append(chart);
        SEATS.forEach((s) => {
          const row = el('div', 'gift-row');
          row.append(el('span', 'gift-name', s.label));
          const picks = el('div', 'pick-row');
          PEOPLE.forEach((p) => { const b = el('button', 'chip' + (d.seat[s.id] === p.id ? ' on' : ''), p.name); b.type = 'button'; b.setAttribute('aria-label', `${s.label}에 ${p.name}`); b.onclick = () => { for (const k of Object.keys(d.seat)) if (d.seat[k] === p.id) delete d.seat[k]; d.seat[s.id] = p.id; save(); }; picks.append(b); });
          row.append(picks); wrap.append(row);
        });
        return wrap;
      },
      commitLabel: '자리표 평상에 놓기',
      check(d) {
        const empty = SEATS.filter((s) => !d.seat[s.id]);
        if (empty.length) return { ok: false, msg: `${empty[0].label} 자리가 비어 있다` };
        if (SEATS.every((s) => d.seat[s.id] === SEAT_ANSWER[s.id])) return { ok: true };
        if (d.seat.tree !== 'eunho') return { ok: false, msg: '은호 씨는 감나무 쪽을 부탁했다. 거기서부터 시작하자' };
        if (d.seat.post !== 'soyeon') return { ok: false, msg: '소연 씨는 은호 씨 바로 다음, 시계 방향. 감나무 다음은 어느 쪽이지' };
        if (d.seat.shop !== 'jihu') return { ok: false, msg: '지후 씨는 소연 씨 다음이다. 같은 방향으로 한 칸 더' };
        return { ok: false, msg: '미정 씨는 남는 자리다. 셋이 정해지면 하나 남는다' };
      },
      reveal: {
        title: '네 자리, 그리고 빈자리 하나',
        text: '평상 밑 상자가 열렸다. 발바닥 도장이 찍힌 봉투가 한 장 더 있었는데, 이번엔 받는 사람이 「다은」이었다',
        scene: ['자리표를 다시 보니 평상에는 자리가 다섯이었다. 네 사람 자리를 정하고 나면 하나가 남는다. 봄이가 그 자리에 앉아 꼬리로 바닥을 쳤다'],
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
      '전구가 켜진 평상에 네 사람이 앉아 있었다. 케이크 위에는 초 대신 작은 발바닥 모양 쿠키가 하나 꽂혀 있었고, 은호 씨가 먼저 손을 흔들었다',
      '“봄이 생일은 아무도 모르잖아요. 그래서 가족 된 날로 했어요” 소연 씨가 말했다. “작년 오늘, 다은 씨가 봄이 데려간 날”',
      '“근데 왜 저한테는 봄이 앞으로 보내요” “다은 씨 앞으로 보내면 바쁘다고 안 올 것 같아서” 지후 씨가 웃었다. “봄이 앞으로 보내면 봄이 핑계로라도 오잖아요”',
      '미정 씨가 꽃다발을 내밀었다. 리본은 없었다. “작년에 봄이 데려간다고 했을 때, 우리 넷이 사실 좀 섭섭했어요. 근데 그 뒤로 다은 씨 가게 앞을 지나는 게 좋더라고요”',
      '빈자리에 앉았다. 봄이는 이미 평상 한가운데서 쿠키를 노리고 있었다',
    ],
    afterword: '봄이는 여전히 창턱에서 잔다. 아침마다 나는 병원, 빵집, 꽃집 순서로 골목을 한 바퀴 돌고 가게 문을 연다. 작년까지 봄이가 돌던 길이다',
    unlockDoc: 'final',
    next: { href: 'ohang.html', title: '돌아오는 계절', line: '다음은 오행당의 다섯 그릇 이야기입니다' },
  },
};
