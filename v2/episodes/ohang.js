// 오행당 · 돌아오는 계절 — ★2. 이야기·자료·장치가 전부 이 파일에 있습니다.
const P = 'assets/v2/ohang/';
const js = (w, a, b) => { const c = w.charCodeAt(w.length - 1); if (c < 0xac00 || c > 0xd7a3) return w + a; return w + ((c - 0xac00) % 28 ? a : b); }; // 받침 있음→a, 없음→b

// 다섯 빛: 색 ↔ 오행 ↔ 방향 ↔ 계절
const E = [
  { id: 'blue', color: '청', han: '木', el: '목', dir: '동', season: '봄', name: '청자 빛 그릇', pot: '청자 빛 화분', lantern: '파란 등' },
  { id: 'red', color: '적', han: '火', el: '화', dir: '남', season: '여름', name: '붉은 그릇', pot: '붉은 화분', lantern: '붉은 등' },
  { id: 'yellow', color: '황', han: '土', el: '토', dir: '중앙', season: '늦여름', name: '노란 그릇', pot: '노란 화분', lantern: '노란 등' },
  { id: 'white', color: '백', han: '金', el: '금', dir: '서', season: '가을', name: '흰 그릇', pot: '흰 화분', lantern: '흰 등' },
  { id: 'black', color: '흑', han: '水', el: '수', dir: '북', season: '겨울', name: '검은 그릇', pot: '검은 화분', lantern: '검은 등' },
];
const byId = Object.fromEntries(E.map((e) => [e.id, e]));
const NEXT = { blue: 'red', red: 'yellow', yellow: 'white', white: 'black', black: 'blue' }; // 상생: 목→화→토→금→수→목

// 찬장: 창이 왼쪽(동쪽)이므로 마주 보면 남쪽을 보고 선다. 위=남, 아래=북, 왼쪽=동, 오른쪽=서
const NICHES = [
  { id: 'top', label: '위 칸', x: 42.5, y: 6.5 },
  { id: 'left', label: '왼쪽 칸', x: 27.8, y: 28.3 },
  { id: 'center', label: '가운데 칸', x: 42.5, y: 28.3 },
  { id: 'right', label: '오른쪽 칸', x: 57.4, y: 28.3 },
  { id: 'bottom', label: '아래 칸', x: 42.5, y: 51 },
];
const NICHE_ANSWER = { top: 'red', left: 'blue', center: 'yellow', right: 'white', bottom: 'black' };
const NAIVE = { top: 'black', left: 'white', center: 'yellow', right: 'blue', bottom: 'red' }; // 위=북으로 착각했을 때

const LANTERN_ORDER = ['black', 'blue', 'red', 'yellow', 'white']; // 겨울(수)부터 상생 순서
const CODE = [4, 5, 0, 0]; // 2009년 오미자차 값

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

export default {
  id: 'ohang',
  number: '010',
  title: '돌아오는 계절',
  subtitle: '오행당에 맡겨둔 것',
  genre: '찻집 · 가족 미스터리',
  minutes: 20,
  difficulty: 2,
  cover: P + 'cover.webp',
  coverAlt: '비 오는 저녁, 불 켜진 오행당 문 앞에 선 사람',
  music: 'assets/music/ohang-v33.mp3',
  tagline: '찬장 맨 아래 서랍에 둔 거 꼭 가져와라.\n열쇠는 늘 두던 데 있다',
  blurb: '외할머니가 마흔 해 넘게 지킨 약차집 오행당.\n입원한 할머니의 문자 한 통에 지원은 여섯 해 만에 그 골목으로 갑니다.',
  storageKey: 'mihaeje-v2-ohang',

  opening: {
    eyebrow: '3월 2일, 저녁',
    paragraphs: [
      '할머니가 넘어졌다는 연락은 이모한테서 왔고, 할머니한테서는 문자가 왔다. 가게 좀 봐 달라는 거였다. 찬장 맨 아래 서랍에 둔 걸 꼭 가져오라고',
      '오행당. 외할머니가 마흔두 해 동안 약차를 끓인 가게다. 초등학교 때는 여름방학마다 거기서 살았는데, 대학에 들어간 뒤로는 명절에 얼굴만 비쳤다. 가게 안에 마지막으로 들어가 본 게 여섯 해 전이다',
      '열쇠는 늘 두던 데 있다고 했다. 어디였더라. 되물으려는데 할머니 휴대폰이 꺼졌다',
      '골목에 비가 조금 왔다. 문 앞 섬돌에 화분 다섯 개가 그대로 있었다',
    ],
    cta: '오행당 문 앞에 서기',
  },

  traces: [
    { device: 'pots', label: '섬돌의 열쇠' },
    { device: 'bowls', label: '다섯 그릇' },
    { device: 'drawer', label: '서랍 자물쇠' },
    { device: 'lanterns', label: '뒷방의 등' },
  ],

  scenes: [
    {
      id: 'front',
      name: '오행당 문 앞',
      image: P + 'front.webp',
      arrive: '문은 잠겨 있고, 문에는 할머니가 오래전에 붙여 둔 종이가 그대로 있었다. 섬돌 위 화분 다섯 개. 어릴 때 물 주라고 시키던 그 화분들이다',
      hotspots: [
        { id: 'phone', x: 9, y: 90, label: '주머니 속 휴대폰', kind: 'doc', doc: 'chat' },
        { id: 'paper', x: 50, y: 38, label: '문에 붙은 종이', kind: 'doc', doc: 'doorpaper' },
        { id: 'pots', x: 50, y: 86, label: '섬돌 위 화분', kind: 'device', device: 'pots' },
      ],
    },
    {
      id: 'inside',
      name: '찻집 안',
      image: P + 'inside.webp',
      unlockedBy: 'pots',
      arrive: '불을 켜자 약재 냄새가 먼저 왔다. 탁자, 방석, 차 통, 메뉴판. 벽에 걸린 사진 액자. 그리고 안쪽 벽의 찬장. 찬장 칸마다 주전자며 항아리가 올라가 있는데, 그 아래 탁자에는 그릇 다섯 개가 보자기 위에 따로 놓여 있었다',
      hotspots: [
        { id: 'photo', x: 34, y: 34, label: '벽에 걸린 사진', kind: 'doc', doc: 'oldphoto' },
        { id: 'board', x: 92, y: 20, label: '메뉴판', kind: 'doc', doc: 'board' },
        { id: 'memo', x: 44, y: 47, label: '찬장에 붙은 메모', kind: 'doc', doc: 'memo' },
        { id: 'cabinet', x: 52, y: 29, label: '찬장과 다섯 그릇', kind: 'device', device: 'bowls' },
        { id: 'drawernote', x: 47, y: 56, label: '서랍 손잡이의 쪽지', kind: 'doc', doc: 'drawernote', visible: (S) => S.solved.includes('bowls') },
        { id: 'drawer', x: 59, y: 56, label: '찬장 맨 아래 서랍', kind: 'device', device: 'drawer', visible: (S) => S.solved.includes('bowls') },
      ],
    },
    {
      id: 'back',
      name: '뒷방',
      image: P + 'back.webp',
      unlockedBy: 'drawer',
      arrive: '뒷방은 할머니가 장부를 쓰던 방이다. 대나무 장대에 등 다섯 개가 걸려 있고, 책상 위에 접수함이 있었다. 접수함은 잠겨 있고, 책상 위에 메모가 한 장',
      hotspots: [
        { id: 'slips', x: 30, y: 76, label: '가져온 접수표 묶음', kind: 'doc', doc: 'slips' },
        { id: 'deskmemo', x: 58, y: 72, label: '책상 위 메모', kind: 'doc', doc: 'deskmemo' },
        { id: 'lanterns', x: 51, y: 24, label: '장대에 걸린 등 다섯', kind: 'device', device: 'lanterns' },
      ],
    },
  ],

  docs: {
    chat: {
      title: '할머니의 문자',
      kind: '오늘 오후',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>할머니</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 3월 2일 월요일</div>
<div class="chat-row them"><span class="chat-avatar">茶</span><div class="chat-col"><span class="chat-name">할머니</span><div class="chat-bubble">지원아 할미다</div><div class="chat-bubble">가게 좀 봐줘라 일주일은 못 나간다</div><div class="chat-bubble">찬장 맨 아래 서랍에 둔 거 꼭 가져와라</div></div><span class="chat-time">오후 4:02</span></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오후 4:03</span><div class="chat-bubble">할머니 괜찮아? 병원 어디야</div></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오후 4:03</span><div class="chat-bubble">열쇠는?</div></div>
<div class="chat-row them"><span class="chat-avatar">茶</span><div class="chat-col"><span class="chat-name">할머니</span><div class="chat-bubble">늘 두던 데 있다</div><div class="chat-bubble">불 낳는 놈 밑에</div><div class="chat-bubble">문에 붙인 거 보면 안다</div><div class="chat-bubble">밧데리가</div></div><span class="chat-time">오후 4:05</span></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오후 4:06</span><div class="chat-bubble">뭐가 뭘 낳아?? 할머니</div></div>
<div class="chat-row me"><span class="chat-meta"><i>1</i>오후 4:40</span><div class="chat-bubble">할머니</div></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    doorpaper: {
      title: '문에 붙은 종이',
      kind: '할머니 글씨 · 누렇게 바랜',
      html: `<figure class="prop doorpaper"><img src="${P}props/doorpaper.webp" alt="문에 테이프로 붙인 누런 종이" decoding="async"><div class="on-doorpaper">${cycleSvg()}</div></figure><p>어릴 때 이게 뭐냐고 물었을 때 할머니는 "차 끓이는 순서"라고만 했다. 그게 아니라는 건 나중에 알았다. 다섯 색, 다섯 방향, 다섯 계절. 가게 이름이 오행당인 이유</p>`,
    },
    oldphoto: {
      title: '벽에 걸린 사진',
      kind: '2009년 여름',
      html: `<figure class="prop oldphoto"><img src="${P}props/oldphoto.webp" alt="찻집에서 할머니와 찻잔을 든 어린 지원" decoding="async"></figure><p>액자를 뒤집으니 뒷면에 할머니 글씨</p><blockquote class="hand">2009년 8월, 지원이<br>오미자 세 잔째. 수박은 안 먹고 차만 마심</blockquote><p class="aside">그해 여름에 오미자차에 꽂혀서 매일 마셨다. 할머니는 한 번도 돈을 받지 않았고, 대신 장부에 적었다</p>`,
    },
    board: {
      title: '메뉴판',
      kind: '분필 글씨',
      html: `<figure class="prop board"><img src="${P}props/board.webp" alt="찻집 벽의 칠판 메뉴판" decoding="async"><div class="on-board"><b>오행당 차림</b>
<span><i>생강차</i><em>4,000</em></span>
<span><i>오미자차</i><em><s>4,500</s> 5,500</em></span>
<span><i>유자차</i><em>5,000</em></span>
<span><i>대추차</i><em>4,000</em></span>
<span><i>쌍화차</i><em>7,000</em></span>
<small>값은 올랐는데 지우진 않음</small></div></figure><p>오미자차 값만 줄을 긋고 고쳐 적었다. 할머니는 값을 올리면서도 옛 값을 지우는 법이 없었다</p>`,
    },
    memo: {
      title: '찬장에 붙은 메모',
      kind: '할머니 글씨',
      html: `<figure class="prop notecard"><img src="${P}props/notecard.webp" alt="찬장에 테이프로 붙인 쪽지" decoding="async"><div class="on-notecard">그릇은 제 방향에<br>다섯이 제자리에 가야 서랍 쇠가 풀린다<br><br>창이 해 뜨는 쪽이다<br>헷갈리면 창부터 봐라</div></figure><p>찬장을 마주 보고 섰다. 한지 창은 왼쪽에 있다</p>`,
    },
    drawernote: {
      title: '서랍 손잡이의 쪽지',
      kind: '할머니 글씨',
      html: `<figure class="prop notecard"><img src="${P}props/notecard.webp" alt="서랍에 붙은 쪽지" decoding="async"><div class="on-notecard">번호는 네가 여름마다 마시던 차<br>그때 값이다<br>메뉴판에 아직 있다</div></figure>`,
    },
    slips: {
      title: '서랍 속 접수표 묶음',
      kind: '할머니 장부',
      html: `<figure class="prop slips"><img src="${P}props/slips.webp" alt="집게로 묶은 접수표 묶음" decoding="async"></figure><p>장부라기보다 쪽지 묶음이다. 손님 이름 대신 내 이름이 제일 많다</p><div class="slip-list">
<p><b>2007. 12</b> 지원 첫 방문. 감기. 생강차. 안 마시려고 울었음</p>
<p><b>2008. 8</b> 지원. 수박. 차는 안 마심</p>
<p><b>2009. 8</b> 지원. 오미자 세 잔째. 수박은 안 먹음</p>
<p><b>2011. 8</b> 지원. 대추차. 숙제 안 함</p>
<p><b>2014. 2</b> 지원. 쌍화차. 수능 끝</p>
<p><b>2020. 9</b> 지원. 유자차. 취직했다고 함</p>
<p><b>2026. 3</b> 지원. (비어 있음)</p>
</div><p>맨 아래 접수표 밑에 열쇠가 하나 더 있었다. 꼬리표에 「뒷방」</p>`,
    },
    deskmemo: {
      title: '책상 위 메모',
      kind: '할머니 글씨',
      html: `<figure class="prop notecard"><img src="${P}props/notecard.webp" alt="책상 위 쪽지" decoding="async"><div class="on-notecard">접수함 열쇠는 없다<br>등을 켜면 열린다<br><br>네가 처음 온 계절부터<br>낳는 순서로 다섯 개 다</div></figure><p>등 다섯 개는 색이 다 다르다. 어느 계절이 어느 색인지는 문에 붙은 종이에 있다</p>`,
    },
    final: {
      title: '접수함 속 접수표',
      kind: '받는 사람: 지원',
      locked: true,
      html: `<figure class="prop slips"><img src="${P}props/slips.webp" alt="접수표" decoding="async"></figure><blockquote class="hand">접수 · 2026년 3월<br>받는 사람 지원<br><br>서랍 것은 가게 열쇠 뭉치하고 등기부다<br>이모가 가게 팔자고 한 지 삼 년 됐다<br>그래도 네가 올 거라 생각해서 안 팔았다<br>여름마다 왔고, 안 오는 해에도 결국 왔으니까<br><br>가게는 네 거다. 하고 싶으면 해라<br>하기 싫으면 열쇠만 갖고 있어라<br>그래도 계절 돌면 한 번씩은 와라<br><br>등은 끄고 가라. 전기세 나온다</blockquote>`,
    },
  },

  devices: {
    pots: {
      title: '섬돌 위 화분',
      scene: 'front',
      intro: '화분 다섯 개. 할머니 말로는 열쇠가 "불 낳는 놈 밑에" 있다. 들어 볼 화분을 고르면 된다',
      docs: ['chat', 'doorpaper'],
      hintCode: 'O-S01',
      hints: [
        '"불 낳는 놈"은 문에 붙은 종이의 화살표를 따라가면 나옵니다. 불(火) 앞에 있는 것',
        '나무(木)가 불을 낳습니다. 나무는 무슨 색이었나요',
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
        if (d.pick === 'red') return { ok: false, msg: '붉은 화분 밑은 젖은 흙뿐이다. 불은 "낳는 놈"이 아니라 낳아지는 쪽이다. 불 앞의 화살표를 보자' };
        return { ok: false, msg: `${e.pot} 밑에는 지렁이 한 마리. ${e.han}(${e.el})이 낳는 건 불이 아니다. 종이의 화살표를 한 번 더` };
      },
      reveal: {
        title: '나무가 불을 낳는다',
        text: '청자 빛 화분을 들자 비닐에 싼 열쇠가 있었다. 초등학교 때 내가 숨겨 두던 바로 그 자리다',
        scene: ['자물쇠가 뻑뻑했다. 두 번 돌려서 문을 열었다. 안은 캄캄하고, 약재 냄새가 났다'],
        unlock: 'inside',
      },
    },

    bowls: {
      title: '찬장과 다섯 그릇',
      scene: 'inside',
      intro: '칸의 주전자와 항아리를 다 내려놓으니 십자 모양으로 다섯 칸이 비었다. 보자기 위 그릇 다섯을 제 방향 칸에 놓으면 아래 서랍 쇠가 풀린다고 했다',
      docs: ['memo', 'doorpaper'],
      hintCode: 'O-S02',
      hints: [
        '색마다 방향이 있습니다. 문에 붙은 종이에 적혀 있어요. 그런데 찬장의 "위"가 북쪽일까요',
        '창이 동쪽이고, 창은 찬장을 마주 봤을 때 왼쪽에 있습니다. 동쪽이 왼쪽이면 나는 어느 쪽을 보고 서 있는 걸까요. 위 칸은 그 방향입니다',
        '남쪽을 보고 서 있습니다. 위=남(적), 아래=북(흑), 왼쪽=동(청), 오른쪽=서(백), 가운데=황',
      ],
      initial: () => ({ placed: {}, held: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'bowls-wrap');
        const cab = el('div', 'prop cabinet'); const im = el('img'); im.src = P + 'props/cabinet.webp'; im.alt = '십자 모양으로 칸이 난 찬장. 왼쪽에 한지 창'; cab.append(im);
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
        wrap.append(el('p', 'pick-label', d.held ? `${js(byId[d.held].name, '을', '를')} 들었다. 놓을 칸을 누르자` : '보자기 위 그릇을 집은 다음 찬장 칸을 누른다 · 놓은 그릇을 누르면 도로 집는다'), tray);
        return wrap;
      },
      commitLabel: '서랍 쇠 당겨 보기',
      check(d) {
        const empty = NICHES.filter((n) => !d.placed[n.id]);
        if (empty.length) return { ok: false, msg: `${empty[0].label}이 비어 있다. 다섯이 다 들어가야 쇠가 움직인다` };
        if (NICHES.every((n) => d.placed[n.id] === NICHE_ANSWER[n.id])) return { ok: true };
        if (NICHES.every((n) => d.placed[n.id] === NAIVE[n.id])) return { ok: false, msg: '쇠가 꿈쩍 않는다. 위 칸이 북쪽이라고 누가 그랬나. 창이 어느 쪽에 있는지 다시 보자. 해 뜨는 쪽이 왼쪽이면 나는 어디를 보고 서 있나' };
        if (d.placed.center !== 'yellow') return { ok: false, msg: '가운데는 방향이 없는 자리다. 종이에서 "중앙"이 어느 색인지 보자' };
        const wrong = NICHES.find((n) => d.placed[n.id] !== NICHE_ANSWER[n.id]);
        return { ok: false, msg: `${wrong.label}의 ${byId[d.placed[wrong.id]].name}이 어긋난다. 창(동쪽)이 왼쪽에 있다는 걸 기준으로 방향을 다시 잡자` };
      },
      reveal: {
        title: '남쪽을 보고 서서',
        text: '다섯 번째 그릇을 넣자 찬장 아래에서 쇠 빠지는 소리가 났다. 서랍 앞판의 자물쇠 판이 조금 튀어나왔다',
        scene: ['찬장을 마주 보면 남쪽이다. 할머니가 차 끓일 때 늘 남쪽을 보고 앉았다는 걸 그제야 떠올렸다. 서랍 손잡이에 쪽지가 하나 더 붙어 있었다'],
        unlock: null,
      },
    },

    drawer: {
      title: '찬장 맨 아래 서랍',
      scene: 'inside',
      intro: '황동 자물쇠 네 자리. 손잡이의 쪽지대로면 번호는 "여름마다 마시던 차"의 "그때 값"이다',
      docs: ['drawernote', 'board', 'oldphoto'],
      hintCode: 'O-S03',
      hints: [
        '여름마다 마시던 차가 뭔지는 벽에 걸린 사진 뒷면에 있습니다',
        '오미자차. 메뉴판에서 오미자차 값을 보세요. 둘 중 "그때" 값은 어느 쪽일까요',
        '줄 그어진 옛 값, 4500',
      ],
      initial: () => ({ dial: [0, 0, 0, 0], fails: 0 }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop brasslock'); const im = el('img'); im.src = P + 'props/lock.webp'; im.alt = '서랍의 황동 네 자리 자물쇠'; wrap.append(im);
        const row = el('div', 'dials');
        CODE.forEach((_, i) => {
          const col = el('div', 'dial');
          const up = el('button', 'ctl', '▲'); up.type = 'button'; up.setAttribute('aria-label', `${i + 1}번째 다이얼 올리기`); up.onclick = () => { d.dial[i] = (d.dial[i] + 1) % 10; save(); };
          const num = el('b', 'num', String(d.dial[i]));
          const dn = el('button', 'ctl', '▼'); dn.type = 'button'; dn.setAttribute('aria-label', `${i + 1}번째 다이얼 내리기`); dn.onclick = () => { d.dial[i] = (d.dial[i] + 9) % 10; save(); };
          col.append(up, num, dn); row.append(col);
        });
        wrap.append(row);
        return wrap;
      },
      commitLabel: '서랍 당기기',
      check(d) {
        const s = d.dial.join('');
        if (s === CODE.join('')) return { ok: true };
        if (s === '5500') return { ok: false, msg: '서랍이 안 열린다. 5,500원은 지금 값이다. 쪽지는 "그때 값"이라고 했다. 줄 그어진 숫자를 보자' };
        if (s === '5000' || s === '4000' || s === '7000') return { ok: false, msg: '안 열린다. 그 차가 아니다. 여름마다 마시던 차가 뭐였는지 사진 뒷면을 보자' };
        const right = d.dial.filter((v, i) => v === CODE[i]).length;
        return { ok: false, msg: right ? `걸린다. ${right}자리는 맞는 것 같다` : '걸린다. 차 값은 네 자리다. 천 원 단위부터' };
      },
      reveal: {
        title: '4 · 5 · 0 · 0',
        text: '서랍이 열렸다. 열쇠 뭉치, 서류 봉투, 그리고 집게로 묶은 접수표 묶음. 묶음 맨 아래에 꼬리표 달린 열쇠가 하나 더 있었다. 「뒷방」',
        scene: ['접수표에는 손님 이름 대신 내 이름이 제일 많았다. 2007년 12월부터'],
        unlock: 'back',
      },
    },

    lanterns: {
      title: '장대에 걸린 등 다섯',
      scene: 'back',
      intro: '등 다섯 개, 스위치가 하나씩. "네가 처음 온 계절부터, 낳는 순서로 다섯 개 다" 켜면 접수함이 열린다',
      docs: ['deskmemo', 'slips', 'doorpaper'],
      hintCode: 'O-S04',
      hints: [
        '처음 온 계절은 접수표 묶음의 제일 오래된 장에 있습니다. 여름이 아닙니다',
        '2007년 12월, 겨울. 겨울은 문에 붙은 종이에서 무슨 색이었나요. 거기서부터 화살표를 따라 다섯 개',
        '검은 등 → 파란 등 → 붉은 등 → 노란 등 → 흰 등',
      ],
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
        wrap.append(el('p', 'pick-label', d.lit.length ? `${d.lit.length}개 켜짐: ${d.lit.map((id) => byId[id].lantern).join(' → ')}` : '등을 누르면 켜진다. 켠 순서가 남는다'), row);
        return wrap;
      },
      commitLabel: '접수함 열어 보기',
      check(d) {
        if (d.lit.length < 5) return { ok: false, msg: `${d.lit.length}개만 켜져 있다. 다섯 개 다 켜야 한다` };
        if (d.lit.every((id, i) => id === LANTERN_ORDER[i])) return { ok: true };
        if (d.lit[0] === 'red') return { ok: false, msg: '접수함이 안 열린다. 여름이 처음이 아니다. 접수표 묶음의 제일 오래된 장을 보자' };
        if (d.lit[0] !== 'black') return { ok: false, msg: `${byId[d.lit[0]].lantern}부터 켰다. 처음 온 계절이 ${byId[d.lit[0]].season}이었나. 접수표를 다시` };
        const i = d.lit.findIndex((id, k) => id !== LANTERN_ORDER[k]);
        return { ok: false, msg: `시작은 맞다. ${i + 1}번째가 어긋난다. ${byId[d.lit[i - 1]].han}이 낳는 건 뭐였나, 종이의 화살표를 따라가자` };
      },
      reveal: {
        title: '겨울에서 시작해서',
        text: '흰 등이 켜지자 접수함 뚜껑이 딸깍 열렸다. 안에는 접수표가 딱 한 장. 받는 사람 칸에 「지원」',
        scene: ['처음 온 계절이 겨울이었다는 건 기억에 없다. 감기 걸려서 울었다는 것도. 할머니는 그걸 쪽지로 남겨 두고, 다음 장도, 그다음 장도 남겨 뒀다'],
        ending: true,
        endingLabel: '다음 날 아침, 병원으로',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '병실 창가에서 할머니에게 찻잔을 건네는 지원',
    eyebrow: '3월 3일, 아침',
    title: '돌아오는 계절',
    paragraphs: [
      '보온병에 오미자차를 담아 갔다. 가게 불은 다 끄고, 등도 끄고, 열쇠 뭉치는 가방에 넣었다',
      '"서랍 것 가져왔냐" "뒷방까지 가게 해 놓고" 할머니가 웃었다. "니가 길을 잊었나 보려고"',
      '"안 잊었더라" "불 낳는 놈이 뭔지도 몰랐으면서" "그건 할머니 문자가 이상했던 거고"',
      '이모한테 가게 얘기를 들었냐고 물었더니 할머니는 대답 대신 찻잔을 받았다. "값은 올렸냐" "안 올렸어. 할머니 글씨 그대로 있어" "그럼 됐다"',
      '접수표 마지막 장은 비어 있었다. 2026년 3월, 지원. 뭘 적을지는 아직 모르겠다. 적을 날이 또 올 거라는 것만 안다',
    ],
    afterword: '오행당은 일주일 뒤 다시 열었다. 할머니가 앉던 자리에 내가 앉았고, 여전히 남쪽을 보고 차를 끓인다',
    unlockDoc: 'final',
    next: { href: 'pet-home.html', title: '첫 번째 보호자', line: '다음은 동물병원 접수대 이야기입니다' },
  },
};
