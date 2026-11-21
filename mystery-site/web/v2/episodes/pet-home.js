// 첫 번째 보호자 — ★3 이야기·자료·장치가 전부 이 파일에 있습니다
// v125: 장치 안에는 답에 필요한 정보를 그려 두지 않는다 (기록 사본·계약서·학교 안내문을 읽어야 풀린다)
// 손동작: 물건 놓기 + 다이얼 → 서랍 열고 카드 고르기 → 끈 집게를 끌어다 명찰에 물리기
const P = 'assets/v2/pet-home/';
const small = () => typeof matchMedia === 'function' && matchMedia('(max-width:640px)').matches;

const REG = '941372608154902'; // 루미 동물등록번호 (게임 속 가상 번호)
const STAMP = {
  sun: { name: '해', svg: '<circle cx="16" cy="16" r="6"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/>' },
  cross: { name: '십자', svg: '<path d="M16 5v22M5 16h22" stroke-width="3.5"/>' },
  sprout: { name: '새싹', svg: '<path d="M16 28V14M16 14c0-6 4-9 10-9 0 6-4 9-10 9zM16 18c0-5-3-8-9-8 0 5 3 8 9 8z"/>' },
  house: { name: '집', svg: '<path d="M5 15L16 5l11 10M8 13v14h16V13M13 27v-8h6v8"/>' },
};
const stampSvg = (id, cls = '') => `<svg class="stamp ${cls}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-label="${STAMP[id].name} 도장">${STAMP[id].svg}</svg>`;

// 기념품 넷: 뒷면에 남은 것(날짜/도장)이 다 다르다
const ITEMS = [
  { id: 'blanket', name: '접힌 담요', img: 'blanket', stamp: null, date: '2016/7/18', back: '세탁 라벨 안쪽 날짜는 또렷한데 도장은 물에 번져서 무슨 모양인지 읽을 수 없다' },
  { id: 'lanyard', name: '파란 명찰 끈', img: 'lanyard', stamp: null, date: '2016/7/16', back: '도장은 없다 끈 안쪽에 볼펜으로 적은 날짜 하나 글씨가 어리다 겉에 찍혀 있던 글자는 닳아서 하얀 자국만 남았다' },
  { id: 'envelope', name: '진료 봉투', img: 'envelope', stamp: 'cross', date: '2016/7/17', back: '빨간 십자 도장과 날짜 「접수 27 · 진료 V-6384 · 담담동물병원」' },
  { id: 'cert', name: '입양 확인서', img: 'cert', stamp: 'house', date: null, back: '집 모양 도장만 남았다 위쪽 이름 칸과 날짜 칸은 찢어져 없다' },
];
const STAGES = [
  { id: 'rescue', name: '처음 발견한 날', shown: '2016/7/▒▒', stamp: 'sun', who: '보호자 동반 학생 (이름 없음)' },
  { id: 'clinic', name: '진료받은 날', shown: '2016/7/▒▒', stamp: 'cross', who: '담담동물병원' },
  { id: 'foster', name: '잠깐 머문 날', shown: '2016/7/▒▒', stamp: 'sprout', who: '햇살 임시보호집' },
  { id: 'adopt', name: '오래 살 집이 생긴 날', shown: '2016/8/2', stamp: 'house', who: '박정우' },
];
const TIN_CODE = [6, 7, 8, 2]; // 네 날의 끝자리, 기록 순서대로 (규칙과 8/2는 기록 사본에만 있다)
const BOX_ANSWER = { rescue: 'lanyard', clinic: 'envelope', foster: 'blanket', adopt: 'cert' };
const DRAWERS = [
  ['6-1', 'V-5900~5999'], ['6-2', 'V-6000~6099'], ['6-3', 'V-6100~6199'],
  ['7-1', 'V-6200~6299'], ['7-2', 'V-6300~6399'], ['7-3', 'V-6400~6499'],
  ['8-1', 'V-6500~6599'], ['8-2', 'V-6600~6699'], ['8-3', 'V-6700~6799'],
  ['9-1', 'V-6800~6899'], ['9-2', 'V-6900~6999'], ['9-3', 'V-7000~7099'],
];
const DRAWER_ANSWER = '7-3'; // 2017년 정리 때 V-6350 이후를 7-3으로 옮김 (게시판 손글씨)

// 7-3 서랍 앞쪽에 올라온 카드 다섯 (사진 속 색 표 위치) V-6384가 셋, 계약서 등록번호까지 맞는 건 하나
const CARDS = [
  { id: 'blue', tab: '파란', x: 33, y: 34, v: 'V-6381', name: '보리', date: '2016/7/15', reg: '941372608154209' },
  { id: 'green', tab: '초록', x: 39.5, y: 29, v: 'V-6384', name: '콩이', date: '2016/7/17', reg: '941372608145902' },
  { id: 'yellow', tab: '노란', x: 47.5, y: 25, v: 'V-6384', name: '콩이', date: '2016/7/17', reg: '941372608154902' },
  { id: 'orange', tab: '주황', x: 55.5, y: 22.5, v: 'V-6384', name: '콩', date: '2016/7/17', reg: '941372680154902' },
  { id: 'red', tab: '빨간', x: 64, y: 22.5, v: 'V-6385', name: '코코', date: '2016/7/18', reg: '941327608154902' },
];
const CARD_ANSWER = 'yellow';

// 엄마 사진 상자 속 명찰 넷 — 끈 색은 학년마다 다르다(학교 안내문) 파랑 = 2학년
const BADGES = [
  { id: 'y1', grade: '1학년 5반', name: '김유나', tilt: -3 },
  { id: 's3', grade: '3학년 1반', name: '이서진', tilt: 2 },
  { id: 'y2', grade: '2학년 3반', name: '김유나', tilt: 1.5 },
  { id: 'y3', grade: '3학년 2반', name: '김유나', tilt: -2 },
];
const BADGE_ANSWER = 'y2';

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

export default {
  id: 'pet-home',
  number: '006',
  title: '첫 번째 보호자',
  subtitle: '파란 끈을 버리지 않은 이유',
  genre: '반려동물 · 가족 미스터리',
  minutes: 22,
  difficulty: 3,
  cover: P + 'cover.webp',
  coverAlt: '목줄에 파란 끈을 단 노견 루미',
  music: 'assets/music/pet-home-v33.mp3',
  tagline: '루미를 처음 데려온 아이한테\n이 끈을 돌려주고 싶었어요',
  blurb: '열 살 강아지 루미를 입양한 유나\n전 보호자 정우가 건넨 낡은 상자에는 십 년 전 물건 넷이 들어 있었습니다\n그중 하나는 주인을 모르는 파란 끈',
  storageKey: 'mihaeje-v2-pet-home',
  hintTitle: '정우의 메시지',
  tracesLabel: '루미를 거쳐 간 사람들이 남긴 것',

  opening: {
    eyebrow: '10월 9일, 이사 다음 날',
    paragraphs: [
      '루미는 열 살이다. 전 보호자 정우 씨가 지방으로 이사하면서 새 가족을 찾았고, 한 달 동안 세 번 만나 보고 내가 데려왔다. 상담 때 어디서 자랐냐길래 고향 얘기를 잠깐 했던 게 기억난다. 어제가 첫날이었다.',
      '정우 씨는 사료와 약, 병원 기록을 넘기면서 상자를 하나 더 줬다. "루미가 처음 구조됐을 때 물건들이에요. 저도 받은 거라 누가 뭘 남긴 건지는 몰라요."',
      '파란 끈 얘기는 오래 했다. 루미를 처음 데려온 아이가 쓰던 끈이라고, 닳을까 봐 상자에 넣어 두고 루미 목에는 비슷한 끈을 새로 사서 달아 줬다고, 언젠가 주인한테 돌려주고 싶었다고.',
      '그 말에 괜히 목이 막혔다. 이유는 나도 모르겠다. 상자에서 오래된 담요 냄새가 났다. 뚜껑 안쪽엔 정우 씨 쪽지가 붙어 있었고, 루미는 새 방석에서 자고 있었다.',
    ],
    cta: '상자 열어 보기',
  },

  traces: [
    { device: 'box', label: '기념품 넷' },
    { device: 'cards', label: '진료 카드' },
    { device: 'strap', label: '끈의 주인' },
  ],

  scenes: [
    {
      id: 'home',
      name: '유나의 새집',
      image: P + 'living.webp',
      arrive: '이삿짐 상자가 아직 반이나 남았다 탁자 위에 정우 씨 상자와 입양 계약서 봉투, 창가 방석에선 루미가 잔다 열 살이라더니 자는 모습이 꼭 노인 같다',
      hotspots: [
        { id: 'note', x: 25, y: 65, r: 8, label: '뚜껑 안쪽 정우의 쪽지', kind: 'doc', doc: 'jnote' },
        { id: 'center', x: 42, y: 69, r: 7, label: '상자 맨 밑의 기록 사본', kind: 'doc', doc: 'center' },
        { id: 'box', x: 33, y: 80, r: 9, label: '기념품 상자', kind: 'device', device: 'box' },
        { id: 'contract', x: 61, y: 81, r: 10, label: '입양 계약서 봉투', kind: 'doc', doc: 'contract' },
        { id: 'rumi', x: 72, y: 45, label: '방석의 루미', kind: 'doc', doc: 'rumi' },
      ],
    },
    {
      id: 'clinic',
      name: '담담동물병원',
      image: P + 'clinic.webp',
      unlockedBy: 'box',
      arrive: '접수증의 병원은 아직 같은 자리에 있었다 "2016년이요? 그때 쓰던 접수 프로그램 회사가 문을 닫아서 옛날 건 카드로만 남았어요" 수의사가 벽의 서랍장을 가리켰다',
      hotspots: [
        { id: 'vet', x: 50, y: 56, label: '접수대의 수의사', kind: 'doc', doc: 'vet' },
        { id: 'rule', x: 86, y: 25, r: 10, label: '게시판의 카드 보관 안내', kind: 'doc', doc: 'rule' },
        { id: 'cabinet', x: 34, y: 25, r: 12, label: '카드 서랍장', kind: 'device', device: 'cards' },
      ],
    },
    {
      id: 'mom',
      name: '엄마 집',
      image: P + 'mom.webp',
      unlockedBy: 'cards',
      arrive: (S) => (S.solved.includes('strap')
        ? '엄마는 일기 한 장을 손바닥으로 펴 주고 보리차를 따랐다 사진 상자 뚜껑이 열린 채로 있다'
        : '다음 날 엄마 집 식탁에 앨범이 펼쳐져 있다 엄마는 보리차를 끓이며 "그해 여름이면 서진이가 우리 집에 있을 때다" 했다 식탁 끝엔 엄마가 못 버리는 사진 상자'),
      hotspots: [
        { id: 'phone', x: 62, y: 76, r: 8, label: '엄마와 주고받은 문자', kind: 'doc', doc: 'momchat' },
        { id: 'album', x: 44, y: 58, r: 13, label: '펼쳐 둔 앨범', kind: 'doc', doc: 'album' },
        { id: 'guide', x: 92, y: 27, r: 9, label: '장식장 위 서류철', kind: 'doc', doc: 'guide' },
        { id: 'strap', x: 89, y: 64, r: 11, label: '엄마의 사진 상자', kind: 'device', device: 'strap' },
      ],
    },
  ],

  docs: {
    jnote: {
      title: '뚜껑 안쪽 정우의 쪽지',
      kind: '정우의 글씨',
      html: `<blockquote class="hand">유나 씨께<br>상자 속 물건 넷은 루미(그때 이름은 콩이)를 거쳐 간 사람들이 남긴 거예요<br>뒷면에 날짜나 도장이 있어요 센터 기록 사본하고 맞춰 보면 누가 뭘 남겼는지 나와요<br>그중 파란 끈만 주인을 몰라요 처음 데려온 아이 거라는데 센터 서류에 이름이 없었어요 병원에 물어볼 생각은 그땐 못 했고요<br>저는 못 찾았어요 유나 씨가 찾아 주시면 좋겠어요<br>— 정우</blockquote>`,
    },
    center: {
      title: '상자 맨 밑의 기록 사본',
      kind: '보호센터 접수 27번 · 2016년',
      html: `<div class="paper-table"><p class="pt-head">햇살구 동물보호센터 · 접수번호 27</p><table><tr><th>날짜</th><th>도장</th><th>처리</th><th>담당</th></tr>
${STAGES.map((s) => `<tr><td class="nw ${s.shown.includes('▒') ? 'torn' : ''}">${s.shown}</td><td class="nw">${stampSvg(s.stamp, 'ink')} ${STAMP[s.stamp].name}</td><td>${s.name}</td><td>${s.who}</td></tr>`).join('')}
</table><p class="pt-foot">※ 원본에는 신고자가 「보호자 동반 학생」으로만 적혀 있음 · 진료 연계는 담담동물병원</p></div><p>네 줄 다 접수번호 27이다 위에서부터 일어난 순서대로 적혀 있다 복사가 잘못돼서 날짜 끝자리가 세 줄이나 뭉개졌다 처음 발견한 사람 칸만 이름이 없다</p><p class="aside">사본 밑에 자물쇠 달린 양철통이 하나 더 있었다 정우 씨 글씨로 「통 번호는 네 날의 끝자리, 기록 순서대로」</p>`,
    },
    contract: {
      title: '입양 계약서 봉투',
      kind: '2026년 재입양 · 유나 보관',
      html: `<div class="paper-table"><p class="pt-head">반려동물 재입양 계약서 (사본)</p><table><tr><th>동물 이름</th><td>루미 (10세 · 중성화)</td></tr><tr><th>동물등록번호</th><td class="mono">${REG}</td></tr><tr><th>이전 보호자</th><td>박정우</td></tr><tr><th>새 보호자</th><td>김유나</td></tr><tr><th>등록 최초 일자</th><td>2016/7/17 (담담동물병원)</td></tr></table></div><p>등록번호는 열다섯 자리 처음 등록한 곳은 2016년 7월 담담동물병원이다</p>`,
    },
    rumi: {
      title: '방석의 루미',
      kind: '내가 본 것',
      html: `<figure class="prop"><img src="${P}cover.webp" alt="방석에 엎드린 루미, 목줄에 파란 끈" decoding="async"></figure><p>코끝이 하얗게 셌다 목줄에 달린 파란 끈은 정우 씨가 새로 사 준 거다 상자를 열자 고개를 들더니 상자 속 옛 끈 냄새를 한참 맡았다 십 년 된 끈인데</p>`,
    },
    vet: {
      title: '접수대의 수의사',
      kind: '들은 말',
      html: `<blockquote>"2016년 7월이면 카드예요 V 번호 순으로 서랍에 꽂혀 있고요 같은 주에 온 애들은 번호가 붙어 있어서 헷갈려요 이름도 비슷한 애들이 많고, 그때 접수를 손으로 해서 번호가 겹친 카드도 있어요"</blockquote><blockquote>"V 번호만 보지 말고 등록번호까지 맞춰 보세요 그때 칩 넣으면서 등록한 번호가 카드에 적혀 있거든요 그게 지금 서류하고 같아야 같은 개예요"</blockquote><blockquote>"찾으면 카드 뒷면도 보세요 신고자 메모를 거기 적었어요"</blockquote>`,
    },
    rule: {
      title: '게시판의 카드 보관 안내',
      kind: '오래된 안내문',
      html: `<div class="paper-table"><p class="pt-head">진료 카드 보관 안내 (2014~2018 전산 전 기록)</p><table><tr><th>서랍</th><th>번호</th></tr>${DRAWERS.map(([id, r]) => `<tr><td>${id}</td><td class="mono">${r}</td></tr>`).join('')}</table><p class="pt-foot hand-note">※ 2017년 정리 — 7-2가 꽉 차서 V-6350 이후는 7-3 앞쪽으로 옮겨 꽂음 (손글씨 추가)</p></div><p>카드 앞면에는 V 번호, 이름, 첫 진료일, 동물등록번호, 뒷면에는 메모</p>`,
    },
    momchat: {
      title: '엄마와 주고받은 문자',
      kind: '10월 10일 낮',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>엄마</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 10월 10일 토요일</div>
<div class="chat-row me"><span class="chat-meta">오후 1:12</span><div class="chat-bubble">엄마 2016년 여름에 햇살동 정류장에서 강아지 주운 거 기억나?</div></div>
<div class="chat-row them"><span class="chat-avatar">엄</span><div class="chat-col"><span class="chat-name">엄마</span><div class="chat-bubble">갑자기 왠 강아지</div><div class="chat-bubble">기억나지 콩알만한거</div><div class="chat-bubble">그해 서진이가 우리집에서 학교 다닐때라 둘이 맨날 붙어다녔잖아</div></div><span class="chat-time">오후 1:30</span></div>
<div class="chat-row me"><span class="chat-meta">오후 1:31</span><div class="chat-bubble">누가 주웠는데?</div></div>
<div class="chat-row them"><span class="chat-avatar">엄</span><div class="chat-col"><span class="chat-name">엄마</span><div class="chat-bubble">글쎄다 둘이 같이 들고 들어왔던가</div><div class="chat-bubble">센터 데려다주고 둘다 울었지</div><div class="chat-bubble">와서 봐 앨범 꺼내놓을게 서진이 물건도 아직 사진상자에 있다</div></div><span class="chat-time">오후 1:33</span></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    album: {
      title: '펼쳐 둔 앨범',
      kind: '엄마가 꺼내 둔 것',
      html: `<figure class="prop album"><img src="${P}props/album.webp" alt="펼쳐 둔 앨범 사진 칸 셋이 비어 있고 옆에 흰 덧종이 셋" decoding="async"></figure><p>2016년 여름 장에 사진 칸이 셋 비어 있다 칸 밑에 엄마 글씨 「정류장」 「병원」 「센터 앞」 옆에 놓인 흰 종이 셋은 사진을 빼고 남은 덧종이다</p><p>"사진은 서진이 물건 정리하다 상자에 같이 들어갔을 거다" 엄마가 식탁 끝 사진 상자를 턱으로 가리켰다</p>`,
    },
    guide: {
      title: '햇살중 생활 안내',
      kind: '장식장 위 서류철 · 2016학년도',
      html: `<div class="paper-table"><p class="pt-head">2016학년도 햇살중학교 생활 안내 (가정통신문)</p><table><tr><th>교복</th><td>하복 6월 ~ 9월</td></tr><tr><th>명찰</th><td>학년마다 새로 나눠 줌 학교 안에서는 늘 목에 걸 것</td></tr><tr><th>명찰 끈 색</th><td class="nw">1학년 빨강 · 2학년 파랑 · 3학년 초록</td></tr><tr><th>분실</th><td>교무실에서 같은 색으로 다시 받음</td></tr></table><p class="pt-foot">햇살중학교장</p></div><p>엄마는 가정통신문을 한 장도 안 버렸다 2015년 것과 2017년 것도 같은 서류철에 순서대로 꽂혀 있다</p>`,
    },
    diary: {
      title: '사진 상자 밑의 일기 한 장',
      kind: '2016년 7월 16일 · 내 글씨',
      html: `<figure class="prop oldphoto"><img src="${P}props/photo2016.webp" alt="2016년 정류장에서 강아지를 안은 중학생 유나, 강아지 목에 파란 끈" decoding="async"></figure><p>일기 사이에 사진 한 장이 끼워져 있었다 정류장 벤치 앞에 쪼그려 앉은 중학생이 손바닥만 한 강아지를 안고 있다 강아지 목에 파란 끈 뒷면에 엄마 글씨로 「2016/7/16 햇살동 정류장 유나 콩이」</p><blockquote class="hand">7월 16일 토 맑음 너무 더움<br>학원 가는 길에 정류장 벤치 밑에 강아지가 있었다 손바닥만 하다 엄마한테 전화했더니 데려오래서 명찰 끈 풀어서 목에 묶고 데려왔다 명찰은 빼서 주머니에 넣음<br>이름은 콩이로 정했다 콩같이 생겨서<br>저녁에 서진 오빠가 와서 자기가 키우겠다고 우겼다 둘 다 안 된대 (아빠)<br>내일 병원 데려간대<br>— 햇살중 2학년 3반 김유나</blockquote><p>콩이라는 이름을 지은 것도 나였다 그 이름을 십 년 동안 까맣게 잊고 있었다</p>`,
    },
    final: {
      title: '정우가 남긴 편지',
      kind: '상자 맨 밑에 있던 것',
      locked: true,
      html: `<blockquote class="hand">유나 씨께<br><br>이 편지는 끈 주인을 찾고 나서 읽으시라고 밑에 깔아 뒀어요<br>사실 입양 상담 때 유나 씨가 햇살동에서 자랐다길래 혹시나 했어요 센터 사본에는 「보호자 동반 학생」뿐이라 확신이 없었어요<br>아니면 괜히 마음만 흔들까 봐 말을 못 했고, 대신 물건을 다 넘기면서 찾아봐 달라고 한 거예요<br>끈은 닳을까 봐 십 년 동안 상자에 넣어 뒀어요 진짜 끈은 주인 손으로 돌려주고 싶어서요<br><br>콩이는 십 년 동안 잘 살았어요 이제 루미로 유나 씨한테 돌아간 거예요<br>끈은 루미 목줄에 묶어 주세요 처음 묶였던 자리로요<br>— 정우</blockquote>`,
    },
  },

  devices: {
    box: {
      title: '기념품 상자와 양철통',
      scene: 'home',
      intro: '상자 속 물건을 누르면 집어 들고 뒷면을 본다 들고 있는 물건은 기록 칸을 눌러 그 줄에 놓는다 놓은 물건을 다시 누르면 집어 든다 상자 밑 양철통은 네 자리 자물쇠',
      docs: ['center', 'jnote'],
      hintCode: '',
      hints: [
        '물건 뒷면에 남은 날짜와 도장을 센터 기록 사본과 한 줄씩 대 보세요',
        '양철통 번호 규칙은 기록 사본 아래에 적혀 있어요 날짜가 찢어진 물건의 날은 사본 쪽에 남아 있어요',
        '처음 발견한 날 파란 명찰 끈, 진료받은 날 진료 봉투, 잠깐 머문 날 접힌 담요, 오래 살 집이 생긴 날 입양 확인서 그리고 6782',
      ],
      initial: () => ({ placed: {}, held: null, flip: null, dial: [0, 0, 0, 0] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'box-wrap');
        const left = el('div', 'box-left');
        const box = el('div', 'prop keepbox'); const im = el('img'); im.src = P + 'props/box.webp'; im.alt = '뚜껑 연 기념품 상자 담요, 파란 끈, 봉투, 확인서'; box.append(im);
        const pos = { blanket: [22, 24], lanyard: [57, 22], envelope: [23, 56], cert: [56, 56] };
        ITEMS.forEach((it) => {
          const placed = Object.values(d.placed).includes(it.id);
          const b = el('button', 'keep-item' + (placed ? ' gone' : '') + (d.held === it.id ? ' picking' : '')); b.type = 'button';
          b.style.left = pos[it.id][0] + '%'; b.style.top = pos[it.id][1] + '%';
          b.setAttribute('aria-label', it.name + (placed ? ' (기록에 놓음)' : ' 집어 뒷면 보기'));
          b.onclick = () => { if (placed) return; d.held = d.held === it.id ? null : it.id; d.flip = d.held; save(); };
          box.append(b);
        });
        left.append(box);
        if (d.flip) {
          const it = ITEMS.find((x) => x.id === d.flip);
          const back = el('div', 'prop keep-back'); back.innerHTML = `<img src="${P}props/${it.img}.webp" alt="${it.name} 뒷면" decoding="async"><div class="keep-back-note ${it.id}">${it.stamp ? stampSvg(it.stamp, 'ink big') : ''}<span class="keep-date">${it.date || ''}</span>${it.id === 'envelope' ? '<span class="keep-sub">접수 27 · 진료 V-6384 · 담담동물병원</span>' : ''}${it.id === 'blanket' ? '<span class="smudge" aria-hidden="true"></span>' : ''}</div>`;
          const card = el('div', 'keep-backcard'); card.append(back, el('p', 'pick-label', `${it.name} 뒷면 — ${it.date ? it.date + ' · ' : ''}${it.back}`));
          left.append(card);
        }
        const right = el('div', 'box-right');
        const sheet = el('div', 'record-sheet');
        sheet.append(el('p', 'pt-head', '접수 27 · 네 날 (물건을 놓는 칸)'));
        STAGES.forEach((s, i) => {
          const pid = d.placed[s.id]; const it = pid && ITEMS.find((x) => x.id === pid);
          const row = el('button', 'record-row' + (pid ? ' filled' : '') + (d.held && !pid ? ' open' : '')); row.type = 'button';
          row.setAttribute('aria-label', `${s.name}${it ? ': ' + it.name : ' (비어 있음)'}`);
          row.innerHTML = `<span class="rr-n">${i + 1}</span><span class="rr-name">${s.name}</span><span class="rr-item">${it ? it.name : '—'}</span>`;
          row.onclick = () => { if (pid) { delete d.placed[s.id]; d.held = pid; d.flip = pid; save(); return; } if (d.held) { d.placed[s.id] = d.held; d.held = null; d.flip = null; save(); } };
          sheet.append(row);
        });
        right.append(el('p', 'pick-label', d.held ? `${ITEMS.find((x) => x.id === d.held).name} 들고 있다 기록의 날을 누르면 거기 놓는다` : '물건을 누르면 집어 든다'), sheet);
        const tin = el('div', 'prop tinlock'); const ti = el('img'); ti.src = P + 'props/tin.webp'; ti.alt = '네 자리 자물쇠가 달린 양철통'; tin.append(ti);
        right.append(el('p', 'pick-label', '상자 밑의 양철통 — 자물쇠 네 자리'), tin, dialRow(el, save, d, 4));
        wrap.append(left, right);
        return wrap;
      },
      commitLabel: '자물쇠 당기기',
      check(d) {
        const code = d.dial.join('');
        const filled = STAGES.filter((s) => d.placed[s.id]).length;
        if (filled < 4) return { ok: false, msg: '자물쇠가 안 열린다 기록 줄 네 칸에 물건부터 다 올려놓자' };
        if (!STAGES.every((s) => d.placed[s.id] === BOX_ANSWER[s.id]) || code !== TIN_CODE.join('')) return { ok: false, msg: '안 열린다 기록 사본과 물건 뒷면을 다시 대 본다' };
        return { ok: true };
      },
      reveal: {
        title: '양철통이 열렸다',
        text: '자물쇠가 툭 하고 빠졌다 양철통 안에는 병원 접수증 원본과 사진 한 장 접수증에 「V-6384 · 카드실 보관」 사진은 센터에서 찍은 어린 콩이, 목에 파란 끈',
        scene: ['접수증의 병원은 햇살동에 아직 있다 루미를 데리고 갈까 하다가, 열 살짜리를 끌고 다니기 미안해서 혼자 나섰다'],
        unlock: 'clinic',
      },
    },

    cards: {
      title: '카드 서랍장',
      scene: 'clinic',
      intro: '서랍 열두 개, 번호판엔 서랍 번호뿐이다 서랍을 누르면 연다 열린 서랍에 올라와 있는 카드를 누르면 앞면이 보이고, 고른 카드를 꺼낼 수 있다',
      docs: ['rule', 'vet', 'contract'],
      hintCode: '',
      hints: [
        '봉투에 적힌 V 번호가 어느 서랍에 있을지 게시판 안내를 끝까지 읽어 보세요',
        '같은 V 번호가 여러 장이면, 수의사 말대로 다른 번호까지 서류와 한 자리씩 대 봐야 합니다',
        '7-3 서랍 · 노란 표 카드 (V-6384 · 콩이 · 941372608154902)',
      ],
      initial: () => ({ drawer: null, open: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'cards-wrap');
        const cab = el('div', 'prop cardcabinet'); const im = el('img'); im.src = P + 'props/cabinet.webp'; im.alt = '서랍 열두 개짜리 카드 서랍장'; cab.append(im);
        const cols = [24.5, 41.5, 58.5], rows = [12.5, 32.5, 52.5, 72.5];
        DRAWERS.forEach(([id], i) => {
          const b = el('button', 'drawer-btn' + (d.drawer === id ? ' picking' : '')); b.type = 'button';
          b.style.left = cols[i % 3] + '%'; b.style.top = rows[Math.floor(i / 3)] + '%';
          b.setAttribute('aria-label', `${id} 서랍 열기`); b.innerHTML = `<span class="plate">${id}</span>`;
          b.onclick = () => { d.drawer = d.drawer === id ? null : id; d.open = null; save(); };
          cab.append(b);
        });
        wrap.append(cab);
        if (!d.drawer) { wrap.append(el('p', 'pick-label', '번호판을 보고 서랍을 하나 연다')); return wrap; }
        if (d.drawer !== DRAWER_ANSWER) {
          wrap.append(el('p', 'pick-label', `${d.drawer} 서랍 — 카드를 앞에서부터 넘겨 봤지만 봉투에 적힌 번호는 없다`));
          return wrap;
        }
        const drawer = el('div', 'prop carddrawer'); const di = el('img'); di.src = P + 'props/drawer.webp'; di.alt = '열린 7-3 서랍, 앞쪽에 색 표가 달린 카드 다섯 장이 올라와 있다'; drawer.append(di);
        const mob = small();
        CARDS.forEach((c) => {
          const b = el(mob ? 'span' : 'button', 'card-tab ' + c.id + (d.open === c.id ? ' picking' : '')); b.style.left = c.x + '%'; b.style.top = c.y + '%';
          if (!mob) { b.type = 'button'; b.setAttribute('aria-label', `${c.tab} 표 카드 보기`); b.onclick = () => { d.open = d.open === c.id ? null : c.id; save(); }; } else b.setAttribute('aria-hidden', 'true');
          drawer.append(b);
        });
        wrap.append(el('p', 'pick-label', '7-3 서랍 — 앞쪽에 옮겨 꽂은 카드 다섯 장이 올라와 있다'), drawer);
        if (mob) {
          const row = el('div', 'card-pick-row');
          CARDS.forEach((c) => { const b = el('button', 'card-pick ' + c.id + (d.open === c.id ? ' on' : ''), `${c.tab} 표`); b.type = 'button'; b.setAttribute('aria-label', `${c.tab} 표 카드 보기`); b.onclick = () => { d.open = d.open === c.id ? null : c.id; save(); }; row.append(b); });
          wrap.append(row);
        }
        if (d.open) {
          const c = CARDS.find((x) => x.id === d.open);
          const card = el('div', 'index-card');
          card.innerHTML = `<p class="ic-head">담담동물병원 진료 카드 · ${c.tab} 표</p><div class="ic-row"><span>번호</span><b class="mono">${c.v}</b></div><div class="ic-row"><span>이름</span><b>${c.name}</b></div><div class="ic-row"><span>첫 진료</span><b>${c.date}</b></div><div class="ic-row"><span>동물등록번호</span><b class="mono reg">${c.reg.replace(/(\d{3})(?=\d)/g, '$1 ')}</b></div>`;
          wrap.append(card);
        } else wrap.append(el('p', 'pick-label', '올라와 있는 카드를 누르면 앞면이 보인다'));
        return wrap;
      },
      commitLabel: '이 카드 꺼내기',
      canCommit: (d) => d.drawer === DRAWER_ANSWER && !!d.open,
      check(d) {
        if (d.open === CARD_ANSWER) return { ok: true };
        return { ok: false, msg: '이 카드가 아니다 서류와 한 자리씩 다시 대 본다' };
      },
      reveal: {
        title: '콩이 = 루미',
        text: '카드를 뒤집었다 「신고자: 햇살중 학생, 어머니 동반 명찰 끈을 임시 목줄로 사용 사진 1매는 어머니가 촬영」 학생 이름 칸은 비어 있다 등록번호는 계약서와 한 자리도 안 틀렸다 콩이가 루미다',
        scene: ['햇살중이면 우리 동네 학교다 나도 다녔고, 2016년 그 여름엔 우리 집에 와 있던 사촌 서진 오빠도 다녔다 엄마 집에 내일 가 보기로 했다'],
        unlock: 'mom',
      },
    },

    strap: {
      title: '사진 상자 속 명찰 넷',
      scene: 'mom',
      intro: '엄마 사진 상자 밑에 끈 빠진 명찰이 넷 굴러다닌다 파란 끈 집게를 끌어다 명찰 구멍에 대거나, 명찰 아래 「여기 대기」를 누른다 다 됐으면 집게를 물린다',
      docs: ['guide', 'momchat', 'album'],
      hintCode: '',
      hints: [
        '끈에 이름은 안 남았어요 끈에서 알 수 있는 건 색이에요',
        '그 색 끈을 받은 사람이 누구였을지 서류철 안내문과 명찰의 학년을 맞춰 보세요',
        '햇살중 2학년 3반 김유나 명찰',
      ],
      initial: () => ({ pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'strap-wrap');
        const handle = el('div', 'strap-handle' + (d.pick ? ' parked' : ''));
        handle.innerHTML = `<img src="${P}props/lanyard.webp" alt="" decoding="async" draggable="false"><span class="strap-cap">파란 끈 · 집게를 끌어 명찰에</span>`;
        handle.setAttribute('role', 'img'); handle.setAttribute('aria-label', '상자에서 가져온 파란 명찰 끈 글자는 닳아 없다');
        const grid = el('div', 'badge-grid');
        BADGES.forEach((bd) => {
          const cell = el('div', 'badge-cell' + (d.pick === bd.id ? ' on' : '')); cell.dataset.badge = bd.id;
          const card = el('div', 'prop badge-card'); card.style.setProperty('--tilt', bd.tilt + 'deg');
          card.innerHTML = `<img src="${P}props/badge-card.webp" alt="" decoding="async" draggable="false"><div class="on-badge2"><b>햇살중학교</b><span>${bd.grade}</span><strong>${bd.name}</strong></div>${d.pick === bd.id ? '<i class="clip-on" aria-hidden="true"></i>' : ''}`;
          const b = el('button', 'chip badge-btn' + (d.pick === bd.id ? ' on' : ''), d.pick === bd.id ? '집게 댄 명찰' : '여기 대기'); b.type = 'button';
          b.setAttribute('aria-label', `${bd.grade} ${bd.name} 명찰 구멍에 대기`); b.setAttribute('aria-pressed', d.pick === bd.id ? 'true' : 'false');
          b.onclick = () => { d.pick = d.pick === bd.id ? null : bd.id; save(); };
          cell.append(card, b); grid.append(cell);
        });
        // 끌어다 놓기: 집게를 끌어 명찰 위에서 놓으면 그 명찰에 댄다
        let start = null;
        handle.addEventListener('pointerdown', (e) => { start = { x: e.clientX, y: e.clientY }; handle.setPointerCapture?.(e.pointerId); handle.classList.add('dragging'); e.preventDefault(); });
        handle.addEventListener('pointermove', (e) => { if (!start) return; handle.style.transform = `translate(${e.clientX - start.x}px, ${e.clientY - start.y}px)`; const hit = document.elementsFromPoint(e.clientX, e.clientY).find((n) => n.dataset?.badge); grid.querySelectorAll('.badge-cell').forEach((c) => c.classList.toggle('hover', c === hit)); });
        const drop = (e) => {
          if (!start) return; start = null; handle.classList.remove('dragging'); handle.style.transform = '';
          const hit = document.elementsFromPoint(e.clientX, e.clientY).find((n) => n.dataset?.badge);
          if (hit) { d.pick = hit.dataset.badge; save(); } else grid.querySelectorAll('.badge-cell').forEach((c) => c.classList.remove('hover'));
        };
        handle.addEventListener('pointerup', drop); handle.addEventListener('pointercancel', drop);
        const picked = BADGES.find((x) => x.id === d.pick);
        wrap.append(handle, grid, el('p', 'pick-label', picked ? `${picked.grade} ${picked.name} 명찰 구멍에 집게를 댔다` : '아직 아무 명찰에도 대지 않았다'));
        return wrap;
      },
      commitLabel: '집게 물리기',
      canCommit: (d) => !!d.pick,
      check(d) {
        if (d.pick === BADGE_ANSWER) return { ok: true };
        return { ok: false, msg: '집게를 물리려다 손이 멈췄다 이 명찰이라고 할 까닭이 아직 없다' };
      },
      reveal: {
        title: '첫 번째 보호자',
        text: '집게가 2학년 3반 명찰 구멍에 딸깍 물렸다 십 년 만에 제자리다 그해 여름 파란 끈을 목에 건 건 이 집에서 나 하나였다',
        scene: [
          '명찰을 들어 올리자 상자 바닥에 접힌 종이가 보였다 내 글씨다 사진 한 장이 같이 끼워져 있었다',
          '엄마가 보리차를 내려놓으며 말했다 "둘 다 울긴 했는데 사흘 운 건 너였다 아빠가 강아지 얘기는 꺼내지도 말라고 해서, 그 뒤로 너도 다시는 안 물었지"',
        ],
        unlockDoc: 'diary',
        ending: true,
        endingLabel: '집으로, 루미한테',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '가을 공원에서 루미를 산책시키는 유나와 정우, 목줄 손잡이에 파란 끈',
    eyebrow: '그리고 일주일',
    title: '콩이라고 불러 봤다',
    paragraphs: [
      '집에 와서 상자를 다시 뒤집었다 맨 밑 종이 아래 정우 씨 편지가 한 장 더 있었다 「끈은 루미 목줄에 묶어 주세요 처음 묶였던 자리로요」',
      '정우 씨한테 전화했다 "찾았어요 저였어요" 수화기 너머가 한참 조용하다가 "그럴 줄 알았다고 하면 거짓말이고요, 그러길 바랐어요" 했다',
      '정우 씨가 올라온 토요일, 셋이 햇살동 공원을 걸었다 루미는 정우 씨를 보고 꼬리를 쳤고 나한테 돌아와서 걸었다 둘 다 제 사람이라는 얼굴로',
      '옛 파란 끈은 목줄 손잡이에 리본으로 묶었다 십 년 전에 묶였던 자리는 아니지만, 같은 개 같은 끈이다',
      '"이름은 루미로 둘 거예요"',
      '"루미로 바꾼 거 저였는데, 오늘은 콩이가 더 어울리네요" 정우 씨가 아쉬운 얼굴을 했다',
      '"열 살한테 콩이는 좀" 내가 말하자 정우 씨가 웃었다 장난삼아 "콩이야" 불러 봤다 루미가 고개를 돌려 나를 한참 올려다봤다',
    ],
    afterword: '엄마는 그 사진을 내 집 현관에 걸어 줬다 루미 방석에서 보이는 자리다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=studio', title: '비가 그친 사진관', line: '다음은 오래된 사진관 이야기입니다' },
  },
};
