// 첫 번째 보호자 — ★2. 이야기·자료·장치가 전부 이 파일에 있습니다.
const P = 'assets/v2/pet-home/';
const js = (w, a, b) => { const c = w.charCodeAt(w.length - 1); if (c < 0xac00 || c > 0xd7a3) return w + a; return w + ((c - 0xac00) % 28 ? a : b); };

const REG = '941372608154902'; // 루미 동물등록번호 (게임 속 가상 번호)
const STAMP = {
  sun: { name: '해', svg: '<circle cx="16" cy="16" r="6"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/>' },
  cross: { name: '십자', svg: '<path d="M16 5v22M5 16h22" stroke-width="3.5"/>' },
  sprout: { name: '새싹', svg: '<path d="M16 28V14M16 14c0-6 4-9 10-9 0 6-4 9-10 9zM16 18c0-5-3-8-9-8 0 5 3 8 9 8z"/>' },
  house: { name: '집', svg: '<path d="M5 15L16 5l11 10M8 13v14h16V13M13 27v-8h6v8"/>' },
};
const stampSvg = (id, cls = '') => `<svg class="stamp ${cls}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-label="${STAMP[id].name} 도장">${STAMP[id].svg}</svg>`;

// 기념품 네 개: 뒷면에 남은 것(날짜/도장)이 다 다르다
const ITEMS = [
  { id: 'blanket', name: '접힌 담요', img: 'blanket', stamp: null, date: '2016. 7. 18', dateNote: '', back: '세탁 라벨 안쪽 날짜는 또렷한데 도장은 물에 번져서 초록 얼룩만 남았다' },
  { id: 'lanyard', name: '파란 명찰 끈', img: 'lanyard', stamp: null, date: '2016. 7. 16', dateNote: '', back: '도장은 없다 끈 안쪽에 볼펜으로 적은 날짜 하나 글씨가 어리다' },
  { id: 'envelope', name: '진료 봉투', img: 'envelope', stamp: 'cross', date: '2016. 7. 17', dateNote: '', back: '빨간 십자 도장과 날짜 「접수 27 · 진료 V-6384 · 담담동물병원」' },
  { id: 'cert', name: '입양 확인서', img: 'cert', stamp: 'house', date: null, dateNote: '날짜 칸이 찢어져 없다', back: '집 모양 도장만 남았다 위쪽 이름 칸과 날짜 칸은 찢어져 없다' },
];
const STAGES = [
  { id: 'rescue', n: 1, name: '처음 발견한 날', date: '2016. 7. 16', shown: '2016. 7. ▒▒', stamp: 'sun', who: '보호자 동반 학생 (이름 없음)' },
  { id: 'clinic', n: 2, name: '진료받은 날', date: '2016. 7. 17', shown: '2016. 7. ▒▒', stamp: 'cross', who: '담담동물병원' },
  { id: 'foster', n: 3, name: '잠깐 머문 날', date: '2016. 7. 18', shown: '2016. 7. ▒▒', stamp: 'sprout', who: '햇살 임시보호집' },
  { id: 'adopt', n: 4, name: '오래 살 집이 생긴 날', date: '2016. 8. 2', shown: '2016. 8. 2', stamp: 'house', who: '박정우' },
];
const TIN_CODE = [6, 7, 8, 2]; // 네 날의 끝자리, 기록 순서대로
const DRAWERS = [
  ['6-1', 'V-5900~5999'], ['6-2', 'V-6000~6099'], ['6-3', 'V-6100~6199'],
  ['7-1', 'V-6200~6299'], ['7-2', 'V-6300~6399'], ['7-3', 'V-6400~6499'],
  ['8-1', 'V-6500~6599'], ['8-2', 'V-6600~6699'], ['8-3', 'V-6700~6799'],
  ['9-1', 'V-6800~6899'], ['9-2', 'V-6900~6999'], ['9-3', 'V-7000~7099'],
];
const DRAWER_ANSWER = '7-3'; // 2017년 정리 때 V-6350 이후를 7-3으로 옮김
const DESK_CODE = [7, 1, 6];
const BOX_ANSWER = { rescue: 'lanyard', clinic: 'envelope', foster: 'blanket', adopt: 'cert' };

// 병원 카드 서랍: 비슷한 카드 다섯. 봉투의 V-6384와 계약서의 등록번호가 둘 다 맞는 건 하나
const CARDS = [
  { id: 'c1', v: 'V-6381', name: '보리', date: '2016. 7. 15', reg: '941372608154209' },
  { id: 'c2', v: 'V-6382', name: '콩', date: '2016. 7. 17', reg: '941372680154902' },
  { id: 'c3', v: 'V-6383', name: '콩이', date: '2016. 7. 17', reg: '941372608145902' },
  { id: 'c4', v: 'V-6384', name: '콩이', date: '2016. 7. 17', reg: '941372608154902' },
  { id: 'c5', v: 'V-6385', name: '코코', date: '2016. 7. 18', reg: '941327608154902' },
];
const CARD_ANSWER = 'c4';

// 명찰 끈의 지워진 글자 세 칸
const BLANKS = [
  { id: 'school', label: '학교', opts: ['햇살중', '햇빛중', '해솔중', '햇살고'], ans: '햇살중' },
  { id: 'cls', label: '학년 반', opts: ['1-3', '2-3', '3-2', '2-1'], ans: '2-3' },
  { id: 'name', label: '이름', opts: ['김유나', '김유진', '이유나', '김유리'], ans: '김유나' },
];

const dialRow = (el, save, d, n, labels) => {
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
  minutes: 17,
  difficulty: 2,
  cover: P + 'cover.webp',
  coverAlt: '목에 파란 끈을 맨 노견 루미',
  music: 'assets/music/pet-home-v33.mp3',
  tagline: '루미를 처음 데려온 아이한테\n이 끈을 돌려주고 싶었어요',
  blurb: '열 살 강아지 루미를 입양한 유나\n전 보호자 정우가 건넨 낡은 상자에는 십 년 전 물건 네 개와 파란 끈이 들어 있었습니다',
  storageKey: 'mihaeje-v2-pet-home',
  hintTitle: '정우의 메시지',

  opening: {
    eyebrow: '10월 9일, 이사 다음 날',
    paragraphs: [
      '루미는 열 살이다 전 보호자 정우 씨가 지방으로 이사하면서 새 가족을 찾았고, 한 달 동안 세 번 만나 보고 내가 데려왔다 어제가 첫날이었다',
      '정우 씨는 사료와 약, 병원 기록을 넘기면서 상자를 하나 더 줬다 "루미가 처음 구조됐을 때 물건들이에요 저도 받은 거라 누가 뭘 남긴 건지는 몰라요" 그리고 파란 끈 얘기를 했다 루미를 처음 데려온 아이가 쓰던 끈이라고, 언젠가 돌려주고 싶었다고',
      '상자 뚜껑 안쪽에 정우 씨 쪽지가 붙어 있었다 루미는 새 방석에서 자고 있다 창밖으로 이삿짐 트럭이 빠져나갔다',
    ],
    cta: '상자 열어 보기',
  },

  traces: [
    { device: 'box', label: '기념품 네 개' },
    { device: 'cards', label: '진료 카드' },
    { device: 'desk', label: '책상 서랍' },
    { device: 'strap', label: '끈의 글자' },
  ],

  scenes: [
    {
      id: 'home',
      name: '유나의 새집',
      image: P + 'living.webp',
      arrive: '아직 상자가 반이다 탁자 위에 정우 씨 상자와 입양 계약서 봉투, 창가 방석에 루미 열 살이라더니 자는 모습이 노인 같다',
      hotspots: [
        { id: 'note', x: 30, y: 57, label: '뚜껑 안쪽 정우의 쪽지', kind: 'doc', doc: 'jnote' },
        { id: 'center', x: 40, y: 64, label: '상자 바닥의 기록 사본', kind: 'doc', doc: 'center' },
        { id: 'box', x: 34, y: 72, label: '기념품 상자', kind: 'device', device: 'box' },
        { id: 'contract', x: 56, y: 79, label: '입양 계약서 봉투', kind: 'doc', doc: 'contract' },
        { id: 'rumi', x: 72, y: 46, label: '방석의 루미', kind: 'doc', doc: 'rumi' },
      ],
    },
    {
      id: 'clinic',
      name: '담담동물병원',
      image: P + 'clinic.webp',
      unlockedBy: 'box',
      arrive: '봉투에 적힌 병원은 아직 같은 자리에 있었다 접수대 뒤로 나무 카드 서랍장이 벽 하나를 채우고 있다 "2016년이요? 전산 전이라 카드로 남아 있을 거예요" 수의사가 서랍 하나를 열어 줬다',
      hotspots: [
        { id: 'vet', x: 50, y: 56, label: '접수대의 수의사', kind: 'doc', doc: 'vet' },
        { id: 'rule', x: 85, y: 34, label: '게시판의 카드 보관 안내', kind: 'doc', doc: 'rule' },
        { id: 'cabinet', x: 45, y: 24, label: '카드 서랍장', kind: 'device', device: 'cards' },
      ],
    },
    {
      id: 'mom',
      name: '엄마 집',
      image: P + 'mom.webp',
      unlockedBy: 'cards',
      arrive: '엄마는 앨범을 식탁에 꺼내 놓고 보리차를 끓이고 있었다 "니가 중학교 때 강아지 주워 온 거 기억 안 나?" 기억이 안 났다 앨범 옆에 사진 세 장이 뒤집혀 있었다',
      hotspots: [
        { id: 'phone', x: 10, y: 88, label: '엄마와 주고받은 문자', kind: 'doc', doc: 'momchat' },
        { id: 'diary', x: 62, y: 88, label: '앨범에 끼워진 일기 한 장', kind: 'doc', doc: 'diary' },
        { id: 'album', x: 36, y: 62, label: '앨범과 사진 세 장', kind: 'doc', doc: 'album' },
        { id: 'sticky', x: 18, y: 52, label: '내 옛 방 책상의 포스트잇', kind: 'doc', doc: 'sticky' },
        { id: 'desk', x: 24, y: 60, label: '내 옛 방 책상 서랍', kind: 'device', device: 'desk' },
        { id: 'badge', x: 24, y: 70, label: '서랍 속 명찰', kind: 'doc', doc: 'badge', visible: (S) => S.solved.includes('desk') },
        { id: 'strap', x: 90, y: 66, label: '상자에서 가져온 파란 끈', kind: 'device', device: 'strap', visible: (S) => S.solved.includes('desk') },
      ],
    },
  ],

  docs: {
    jnote: {
      title: '뚜껑 안쪽 정우의 쪽지',
      kind: '정우의 글씨',
      html: `<blockquote class="hand">유나 씨께<br>물건 네 개는 루미(그때 이름은 콩이)를 거쳐 간 사람들이 남긴 거예요<br>뒷면에 날짜나 도장이 있어요 센터 기록 사본하고 맞춰 보면 누가 뭘 남겼는지 나와요<br>파란 끈만 주인을 몰라요 처음 데려온 아이 거라는데 센터 서류에 이름이 없었어요<br>저는 못 찾았어요 유나 씨가 찾아 주시면 좋겠어요<br>— 정우</blockquote>`,
    },
    center: {
      title: '상자 바닥의 기록 사본',
      kind: '보호센터 접수 27번 · 2016년',
      html: `<div class="paper-table"><p class="pt-head">햇살구 동물보호센터 · 접수번호 27</p><table><tr><th>날짜</th><th>도장</th><th>처리</th><th>담당</th></tr>
${STAGES.map((s) => `<tr><td class="${s.shown.includes('▒') ? 'torn' : ''}">${s.shown}</td><td>${stampSvg(s.stamp, 'ink')} ${STAMP[s.stamp].name}</td><td>${s.name}</td><td>${s.who}</td></tr>`).join('')}
</table><p class="pt-foot">※ 원본에는 신고자가 「보호자 동반 학생」으로만 적혀 있음 · 진료 연계는 담담동물병원</p></div><p>네 줄 다 접수번호 27이다 발견 → 진료 → 임시보호 → 입양 순서다 복사가 잘못돼서 날짜 끝자리가 세 줄이나 뭉개졌다 처음 발견한 사람 칸만 이름이 없다</p><p class="aside">상자 바닥에는 자물쇠 달린 양철통이 하나 더 있었다 정우 씨 쪽지: 「통 번호는 네 날의 끝자리, 기록 순서대로」</p>`,
    },
    contract: {
      title: '입양 계약서 봉투',
      kind: '2026년 재입양 · 유나 보관',
      html: `<div class="paper-table"><p class="pt-head">반려동물 재입양 계약서 (사본)</p><table><tr><th>동물 이름</th><td>루미 (10세 · 중성화)</td></tr><tr><th>동물등록번호</th><td class="mono">${REG}</td></tr><tr><th>이전 보호자</th><td>박정우</td></tr><tr><th>새 보호자</th><td>김유나</td></tr><tr><th>등록 최초 일자</th><td>2016. 7. 17 (담담동물병원)</td></tr></table></div><p>등록번호 열다섯 자리 최초 등록이 2016년 7월, 그 병원이다 상자 속 봉투에 적힌 병원과 같다</p>`,
    },
    rumi: {
      title: '방석의 루미',
      kind: '내가 본 것',
      html: `<figure class="prop"><img src="${P}cover.webp" alt="방석에 엎드린 루미" decoding="async"></figure><p>코끝이 하얗게 셌다 정우 씨 말로는 어릴 때 이름이 콩이였다고 한다 상자를 열자 고개를 들더니 파란 끈 냄새를 한참 맡았다 십 년 된 끈인데</p>`,
    },
    vet: {
      title: '접수대의 수의사',
      kind: '들은 말',
      html: `<blockquote>“2016년 7월이면 카드예요 V 번호 순으로 서랍에 꽂혀 있고요 같은 주에 온 애들은 번호가 붙어 있어서 헷갈려요 이름도 비슷한 애들이 많고”</blockquote><blockquote>“V 번호만 보지 말고 등록번호까지 맞춰 보세요 그때 칩 넣으면서 등록한 번호가 카드에 적혀 있거든요 그게 지금 서류하고 같아야 같은 개예요”</blockquote><blockquote>“찾으면 카드 뒷면도 보세요 신고자 메모를 거기 적었어요”</blockquote>`,
    },
    rule: {
      title: '게시판의 카드 보관 안내',
      kind: '오래된 안내문',
      html: `<div class="paper-table"><p class="pt-head">진료 카드 보관 안내 (2014~2018 전산 전 기록)</p><table><tr><th>서랍</th><th>번호</th></tr>${DRAWERS.map(([id, r]) => `<tr><td>${id}</td><td class="mono">${r}</td></tr>`).join('')}</table><p class="pt-foot hand-note">※ 2017년 정리 — 7-2가 꽉 차서 V-6350 이후는 7-3 앞쪽으로 옮겨 꽂음 (손글씨 추가)</p></div><p>카드 앞면: V 번호 · 이름 · 첫 진료일 · 동물등록번호 / 뒷면: 메모 안내문 밑에 볼펜으로 덧쓴 줄이 하나 있다</p>`,
    },
    momchat: {
      title: '엄마와 주고받은 문자',
      kind: '오늘 낮',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>엄마</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 10월 10일 토요일</div>
<div class="chat-row me"><span class="chat-meta">오후 1:12</span><div class="chat-bubble">엄마 2016년 7월에 찍은 사진 있어? 나 중2 때</div></div>
<div class="chat-row me"><span class="chat-meta">오후 1:12</span><div class="chat-bubble">강아지 나오는 거</div></div>
<div class="chat-row them"><span class="chat-avatar">母</span><div class="chat-col"><span class="chat-name">엄마</span><div class="chat-bubble">갑자기 왠 강아지</div><div class="chat-bubble">니가 정류장에서 주워온 거 말하는거야?</div><div class="chat-bubble">앨범에 있을거다 와서 봐</div></div><span class="chat-time">오후 1:30</span></div>
<div class="chat-row me"><span class="chat-meta">오후 1:31</span><div class="chat-bubble">내가 강아지를 주워왔다고??</div></div>
<div class="chat-row them"><span class="chat-avatar">母</span><div class="chat-col"><span class="chat-name">엄마</span><div class="chat-bubble">기억 안나냐 니 명찰끈으로 묶어서 끌고 왔잖아</div><div class="chat-bubble">센터에 데려다주고 사흘 울었다</div></div><span class="chat-time">오후 1:33</span></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    diary: {
      title: '앨범에 끼워진 일기 한 장',
      kind: '2016년 7월 16일 · 내 글씨',
      html: `<blockquote class="hand">7월 16일 토 맑음 너무 더움<br>학원 가는 길에 정류장 밑에 강아지가 있었다 손바닥만 하다 엄마한테 전화했더니 데려오래서 명찰 끈 풀어서 목에 묶고 데려왔다 명찰은 빼서 주머니에 넣음<br>이름은 콩이로 정했다 콩같이 생겨서<br>내일 병원 데려간대 키우면 안 되냐고 했는데 안 된대 (아빠)<br>— 햇살중 2학년 3반 김유나</blockquote><p>글씨가 내 글씨다 기억은 없는데 글씨는 맞다</p>`,
    },
    album: {
      title: '앨범과 사진 세 장',
      kind: '엄마가 꺼내 둔 것',
      html: `<figure class="prop album"><img src="${P}props/album.webp" alt="펼쳐 둔 앨범과 뒤집힌 사진 세 장" decoding="async"></figure><p>세 장 중 한 장을 뒤집었다</p><figure class="prop oldphoto"><img src="${P}props/photo2016.webp" alt="2016년 정류장에서 강아지를 안은 중학생 유나" decoding="async"></figure><p>정류장 벤치 앞에 쪼그려 앉은 중학생이 손바닥만 한 강아지를 안고 있다 강아지 목에 파란 끈 뒷면에 엄마 글씨로 「2016. 7. 16 햇살동 정류장 유나 콩이」</p><p class="aside">사진 속 강아지 코가 까맸다 루미는 지금 코끝이 하얗다 십 년이면 그렇다</p>`,
    },
    sticky: {
      title: '책상 서랍의 포스트잇',
      kind: '중2 때 내 글씨',
      html: `<div class="sticky-note">비번 = 콩이 만난 날<br><small>(까먹지 말 것!!)</small></div><p>콩이를 만난 날이 언제인지는 일기에 있다 세 자리 자물쇠다</p>`,
    },
    badge: {
      title: '서랍 속 명찰',
      kind: '2016년 · 햇살중',
      html: `<figure class="prop badgephoto"><img src="${P}props/badge.webp" alt="서랍 속 명찰" decoding="async"><div class="on-badge"><b>햇살중학교</b><span>2학년 3반</span><strong>김유나</strong></div></figure><p>명찰에 끈이 없다 끈은 지금 내 가방에 있다 십 년 전에 강아지 목에 묶었던 그 끈이</p>`,
    },
    final: {
      title: '정우가 남긴 편지',
      kind: '상자 맨 밑에 있던 것',
      locked: true,
      html: `<blockquote class="hand">유나 씨께<br><br>이 편지는 끈 주인을 찾고 나서 읽으시라고 밑에 깔아 뒀어요<br>사실 입양 상담 때 유나 씨 이름을 보고 혹시나 했어요 센터 원본에 「햇살중 학생, 어머니 동반」이라고만 있었고, 유나 씨가 햇살동 출신이라길래요<br>그래도 말 안 했어요 유나 씨가 찾아야 유나 씨 거니까요<br><br>콩이는 십 년 동안 잘 살았어요 이제 루미로 유나 씨한테 돌아간 거예요<br>끈은 루미 목줄에 묶어 주세요 처음 묶였던 자리로요<br>— 정우</blockquote>`,
    },
  },

  devices: {
    box: {
      title: '기념품 상자와 양철통',
      scene: 'home',
      intro: '상자 밑에 자물쇠 달린 양철통 번호는 "네 날의 끝자리, 기록 순서대로" 기록 사본은 날짜가 뭉개져서, 물건 뒷면의 날짜와 도장으로 네 날을 먼저 맞춰야 한다',
      docs: ['center', 'jnote'],
      hintCode: 'P-S01',
      hints: [
        '물건을 누르면 뒷면이 보입니다 도장이 있는 건 도장으로 기록 줄을 찾고, 도장이 없는 둘은 날짜 순서로 앞뒤를 정합니다',
        '십자=진료(2번째), 집=입양(4번째) 끈 7.16과 담요 7.18은 도장이 없지만 발견이 임시보호보다 먼저이니 끈이 1번째, 담요가 3번째 끝자리: 6 · 7 · 8 · 2',
        '6782',
      ],
      initial: () => ({ placed: {}, held: null, flip: null, dial: [0, 0, 0, 0] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'box-wrap');
        const box = el('div', 'prop keepbox'); const im = el('img'); im.src = P + 'props/box.webp'; im.alt = '뚜껑 연 기념품 상자'; box.append(im);
        const pos = { blanket: [22, 24], lanyard: [57, 22], envelope: [23, 56], cert: [56, 56] };
        ITEMS.forEach((it) => {
          const placed = Object.values(d.placed).includes(it.id);
          const b = el('button', 'keep-item' + (placed ? ' gone' : '') + (d.held === it.id ? ' picking' : '')); b.type = 'button';
          b.style.left = pos[it.id][0] + '%'; b.style.top = pos[it.id][1] + '%';
          b.setAttribute('aria-label', it.name + (placed ? ' (기록에 놓음)' : ' 집어 뒷면 보기'));
          b.onclick = () => { if (placed) return; d.held = d.held === it.id ? null : it.id; d.flip = d.held; save(); };
          box.append(b);
        });
        wrap.append(box);
        if (d.flip) {
          const it = ITEMS.find((x) => x.id === d.flip);
          const back = el('div', 'prop keep-back'); back.innerHTML = `<img src="${P}props/${it.img}.webp" alt="${it.name} 뒷면" decoding="async"><div class="keep-back-note ${it.id}">${it.stamp ? stampSvg(it.stamp, 'ink big') : ''}<span class="keep-date">${it.date || it.dateNote}</span>${it.id === 'envelope' ? '<span class="keep-sub">접수 27 · 진료 V-6384 · 담담동물병원</span>' : ''}${it.id === 'blanket' ? '<span class="smudge" aria-hidden="true"></span>' : ''}</div>`;
          wrap.append(el('p', 'pick-label', `${it.name} 뒷면 — ${it.back}`), back);
        }
        const sheet = el('div', 'record-sheet');
        sheet.append(el('p', 'pt-head', '접수 27 · 네 날 (물건을 놓아 날짜를 채운다)'));
        STAGES.forEach((s) => {
          const pid = d.placed[s.id]; const it = pid && ITEMS.find((x) => x.id === pid);
          const row = el('button', 'record-row' + (pid ? ' filled' : '') + (d.held && !pid ? ' open' : '')); row.type = 'button';
          row.setAttribute('aria-label', `${s.name}${it ? ': ' + it.name : ' (비어 있음)'}`);
          row.innerHTML = `<span class="rr-date">${it && it.date ? it.date : s.shown}</span><span class="rr-stamp">${stampSvg(s.stamp, 'ink')}</span><span class="rr-name">${s.name}</span><span class="rr-item">${it ? it.name : '—'}</span>`;
          row.onclick = () => { if (pid) { delete d.placed[s.id]; d.held = pid; d.flip = pid; save(); return; } if (d.held) { d.placed[s.id] = d.held; d.held = null; d.flip = null; save(); } };
          sheet.append(row);
        });
        wrap.append(el('p', 'pick-label', d.held ? `${ITEMS.find((x) => x.id === d.held).name} 들고 있다 기록의 날을 누르면 거기 놓는다` : '상자 속 물건을 누르면 뒷면이 보이고, 그 상태로 기록의 날을 누르면 놓인다'), sheet);
        const tin = el('div', 'prop tinlock'); const ti = el('img'); ti.src = P + 'props/tin.webp'; ti.alt = '네 자리 자물쇠가 달린 양철통'; tin.append(ti);
        wrap.append(el('p', 'pick-label', '상자 밑의 양철통 — 자물쇠 네 자리'), tin, dialRow(el, save, d, 4));
        return wrap;
      },
      commitLabel: '자물쇠 당기기',
      check(d) {
        const code = d.dial.join('');
        if (code === TIN_CODE.join('')) return { ok: true };
        const filled = STAGES.filter((s) => d.placed[s.id]).length;
        if (filled < 4) return { ok: false, msg: `자물쇠가 안 열린다 기록 사본은 날짜가 뭉개져 있다 물건 뒷면으로 네 날부터 채우자 (지금 ${filled}/4)` };
        if (!STAGES.every((s) => d.placed[s.id] === BOX_ANSWER[s.id])) {
          if (d.placed.rescue === 'blanket' && d.placed.foster === 'lanyard') return { ok: false, msg: '안 열린다 도장 없는 둘의 앞뒤가 바뀌었다 발견이 임시보호보다 먼저다 날짜가 빠른 쪽이 발견한 날' };
          return { ok: false, msg: '안 열린다 놓은 물건이 기록 줄과 어긋난다 도장이 있는 둘은 도장으로, 없는 둘은 날짜 순서로' };
        }
        const right = d.dial.filter((v, i) => v === TIN_CODE[i]).length;
        return { ok: false, msg: `네 날은 맞췄다 번호는 끝자리다 ${right}자리는 맞는 것 같다` };
      },
      reveal: {
        title: '6 · 7 · 8 · 2',
        text: '자물쇠가 툭 하고 빠졌다 양철통 안에는 병원 접수증 원본과 사진 한 장 접수증에 「V-6384 · 카드실 보관」 사진은 센터에서 찍은 어린 콩이, 목에 파란 끈',
        scene: ['접수증의 병원은 햇살동에 아직 있다 루미를 데리고 갈까 하다가, 열 살짜리를 끌고 다니기 미안해서 혼자 나섰다'],
        unlock: 'clinic',
      },
    },

    cards: {
      title: '카드 서랍장',
      scene: 'clinic',
      intro: '서랍 열두 개, 번호판은 서랍 번호뿐이다 게시판의 안내로 V-6384가 든 서랍을 열고, 봉투의 V 번호와 계약서의 등록번호가 둘 다 맞는 카드를 꺼낸다',
      docs: ['rule', 'vet', 'contract'],
      hintCode: 'P-S02',
      hints: [
        '게시판 안내에서 V-6384가 어느 서랍 범위인지 봅니다 그런데 밑에 볼펜으로 덧쓴 줄이 있습니다',
        '2017년 정리 때 V-6350 이후는 7-3으로 옮겼습니다 7-3을 열면 카드 다섯 장이 올라와 있고, 그중 V-6384가 둘 아닌 하나, 등록번호까지 맞는 건 하나',
        '7-3 서랍 · 네 번째 카드 (V-6384 · 콩이 · 941372608154902)',
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
          const r = DRAWERS.find(([id]) => id === d.drawer)[1];
          wrap.append(el('p', 'pick-label', `${d.drawer} 서랍 — ${r} 카드들이다 ${d.drawer === '7-2' ? '앞쪽은 V-6300부터인데 뒤로 넘기니 V-6349에서 끝난다 그 뒤가 비어 있다' : '봉투의 번호는 이 범위가 아니다'}`));
          return wrap;
        }
        const drawer = el('div', 'prop carddrawer'); const di = el('img'); di.src = P + 'props/drawer.webp'; di.alt = '열린 7-3 서랍, 앞쪽에 카드 다섯 장이 올라와 있다'; drawer.append(di);
        const xs = [26, 32.5, 39, 45.5, 52];
        CARDS.forEach((c, i) => {
          const b = el('button', 'card-tab' + (d.open === c.id ? ' picking' : '')); b.type = 'button'; b.style.left = xs[i] + '%';
          b.setAttribute('aria-label', `${i + 1}번째 카드 보기`); b.onclick = () => { d.open = d.open === c.id ? null : c.id; save(); };
          drawer.append(b);
        });
        wrap.append(el('p', 'pick-label', '7-3 서랍 — 앞쪽에 옮겨 꽂은 카드 다섯 장이 올라와 있다'), drawer);
        if (d.open) {
          const c = CARDS.find((x) => x.id === d.open);
          const card = el('div', 'index-card');
          card.innerHTML = `<p class="ic-head">담담동물병원 진료 카드</p><div class="ic-row"><span>번호</span><b class="mono">${c.v}</b></div><div class="ic-row"><span>이름</span><b>${c.name}</b></div><div class="ic-row"><span>첫 진료</span><b>${c.date}</b></div><div class="ic-row"><span>동물등록번호</span><b class="mono reg">${c.reg.replace(/(\d{3})(?=\d)/g, '$1 ')}</b></div>`;
          wrap.append(el('p', 'pick-label', `${CARDS.indexOf(c) + 1}번째 카드`), card);
        } else wrap.append(el('p', 'pick-label', '올라와 있는 카드를 누르면 앞면이 보인다'));
        return wrap;
      },
      commitLabel: '이 카드 꺼내기',
      canCommit: (d) => d.drawer === DRAWER_ANSWER && !!d.open,
      check(d) {
        if (d.open === CARD_ANSWER) return { ok: true };
        const c = CARDS.find((x) => x.id === d.open);
        if (c.v !== 'V-6384') return { ok: false, msg: `${c.v}는 봉투의 번호가 아니다 봉투에는 V-6384라고 적혀 있다` };
        return { ok: false, msg: '번호는 맞는데 등록번호가 계약서와 다르다 열다섯 자리를 세 자리씩 끊어서 다시 대 보자' };
      },
      reveal: {
        title: '콩이 = 루미',
        text: '카드를 뒤집었다 「신고자: 햇살중 학생, 어머니 동반 명찰 끈을 임시 목줄로 사용 사진 1매는 어머니가 촬영, 센터 보관」 등록번호는 계약서와 한 자리도 안 틀렸다 콩이가 루미다',
        scene: ['햇살중 내가 나온 학교다 2016년이면 중2 그런데 강아지를 주운 기억이 없다 엄마한테 문자를 보냈다'],
        unlock: 'mom',
      },
    },

    desk: {
      title: '내 옛 방 책상 서랍',
      scene: 'mom',
      intro: '중학교 때 쓰던 책상 서랍에 세 자리 자물쇠 옆에 붙은 포스트잇: "비번 = 콩이 만난 날"',
      docs: ['sticky', 'diary', 'momchat'],
      hintCode: 'P-S03',
      hints: [
        '콩이를 만난 날은 일기 첫 줄에 있습니다 세 자리',
        '7월 16일 → 7 1 6',
        '716',
      ],
      initial: () => ({ dial: [0, 0, 0] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'desk-wrap');
        const desk = el('div', 'prop deskphoto'); const im = el('img'); im.src = P + 'props/desk.webp'; im.alt = '스티커가 바랜 옛 책상, 서랍에 세 자리 자물쇠와 포스트잇'; desk.append(im);
        const lock = el('div', 'prop desklock'); lock.innerHTML = `<img src="${P}props/desk-lock.webp" alt="세 자리 자물쇠와 포스트잇" decoding="async"><div class="on-sticky">비번 = 콩이 만난 날<br><small>까먹지 말 것!!</small></div>`;
        lock.append(dialRow(el, save, d, 3));
        wrap.append(desk, lock);
        return wrap;
      },
      commitLabel: '서랍 당기기',
      check(d) {
        const code = d.dial.join('');
        if (code === DESK_CODE.join('')) return { ok: true };
        if (code === '816' || code === '802') return { ok: false, msg: '안 열린다 콩이를 "만난" 날이다 입양된 날이 아니라' };
        if (code === '717') return { ok: false, msg: '안 열린다 병원 간 날이 아니라 만난 날 하루 전이다' };
        const right = d.dial.filter((v, i) => v === DESK_CODE[i]).length;
        return { ok: false, msg: right ? `걸린다 ${right}자리는 맞는 것 같다 월 하나, 일 둘` : '걸린다 월 한 자리, 일 두 자리다' };
      },
      reveal: {
        title: '7 · 1 · 6',
        text: '서랍이 열렸다 연필, 지우개, 머리끈 사이에 명찰이 하나 끈이 없는 명찰 「햇살중학교 2학년 3반 김유나」',
        scene: ['명찰은 있는데 끈이 없다 끈은 지금 내 가방 속에 있다 상자에서 꺼내 온, 십 년 전 강아지 목에 묶였던 파란 끈'],
        unlock: null,
      },
    },

    strap: {
      title: '파란 끈의 지워진 글자',
      scene: 'mom',
      intro: '끈의 인쇄 글자가 세 군데 지워져 있다 학교, 학년 반, 이름 서랍에서 나온 명찰과 대 본다',
      docs: ['badge', 'diary', 'album'],
      hintCode: 'P-S04',
      hints: [
        '명찰 끈에는 명찰과 같은 글자가 찍힙니다 서랍에서 나온 명찰을 보세요',
        '햇살중학교 · 2학년 3반 · 김유나 끈에는 줄여서 찍힙니다',
        '햇살중 · 2-3 · 김유나',
      ],
      initial: () => ({ fill: {}, pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'strap-wrap');
        const strip = el('div', 'prop strapimg'); const im = el('img'); im.src = P + 'props/strap.webp'; im.alt = '펼친 파란 끈, 글자가 지워진 자리 셋'; strip.append(im);
        const pos = { school: [13, 17], cls: [35, 17], name: [63, 22] };
        BLANKS.forEach((bl) => {
          const b = el('button', 'strap-slot' + (d.fill[bl.id] ? ' filled' : '') + (d.pick === bl.id ? ' picking' : '')); b.type = 'button';
          b.style.left = pos[bl.id][0] + '%'; b.style.width = pos[bl.id][1] + '%';
          b.setAttribute('aria-label', `${bl.label} 칸${d.fill[bl.id] ? ': ' + d.fill[bl.id] : ' (지워짐)'}`);
          b.textContent = d.fill[bl.id] || '';
          b.onclick = () => { d.pick = d.pick === bl.id ? null : bl.id; save(); };
          strip.append(b);
        });
        wrap.append(strip);
        if (d.pick) {
          const bl = BLANKS.find((x) => x.id === d.pick);
          wrap.append(el('p', 'pick-label', `${bl.label} 칸에 들어갈 글자`));
          const row = el('div', 'pick-row');
          bl.opts.forEach((o) => { const c = el('button', 'chip' + (d.fill[bl.id] === o ? ' on' : ''), o); c.type = 'button'; c.setAttribute('aria-label', `${bl.label}은 ${o}`); c.onclick = () => { d.fill[bl.id] = o; d.pick = null; save(); }; row.append(c); });
          wrap.append(row);
        } else wrap.append(el('p', 'pick-label', '끈의 지워진 자리를 누르면 글자를 넣을 수 있다'));
        return wrap;
      },
      commitLabel: '명찰에 끈 끼우기',
      check(d) {
        const empty = BLANKS.filter((b) => !d.fill[b.id]);
        if (empty.length) return { ok: false, msg: `${empty[0].label} 칸이 아직 비어 있다` };
        if (BLANKS.every((b) => d.fill[b.id] === b.ans)) return { ok: true };
        const w = BLANKS.find((b) => d.fill[b.id] !== b.ans);
        if (w.id === 'name') return { ok: false, msg: `${d.fill.name}? 명찰의 이름을 다시 보자` };
        if (w.id === 'cls') return { ok: false, msg: '학년 반이 다르다 명찰에 적힌 대로' };
        return { ok: false, msg: '학교가 다르다 명찰과 병원 카드 뒷면에 같은 학교가 나온다' };
      },
      reveal: {
        title: '첫 번째 보호자',
        text: '끈을 명찰 구멍에 끼웠다 딱 맞는다 햇살중 2-3 김유나 콩이를 처음 데려온 아이는 나였다',
        scene: [
          '엄마가 보리차를 내려놓으며 말했다 "그때 네가 사흘을 울어서 아빠가 다시는 강아지 얘기 꺼내지 말라고 했잖아 그래서 다 잊은 척했지"',
          '루미가 지금 내 집 방석에서 자고 있다 십 년을 돌아서 정우 씨 편지가 상자 맨 밑에 한 장 더 있었다',
        ],
        ending: true,
        endingLabel: '상자 맨 밑의 편지를 꺼내러',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '가을 공원에서 루미를 산책시키는 유나와 정우',
    eyebrow: '그 주 토요일',
    title: '그날의 콩이가 지금의 루미였다',
    paragraphs: [
      '정우 씨한테 전화했다 "찾았어요 저였어요" 수화기 너머가 한참 조용하다가 "그럴 줄 알았어요" 했다 "상담 때 햇살동이라고 하셔서요 근데 제가 말하면 안 되는 거잖아요"',
      '정우 씨가 올라온 토요일, 셋이 햇살동 공원을 걸었다 루미는 정우 씨를 보고 꼬리를 쳤고 나한테 돌아와서 걸었다 둘 다 제 사람이라는 얼굴로',
      '파란 끈은 목줄 손잡이에 리본으로 묶었다 십 년 전에 묶였던 자리는 아니지만, 같은 개 같은 끈이다',
      '"이름은 루미로 둘 거예요" "콩이가 더 어울리는데" "열 살한테 콩이는 좀" 정우 씨가 웃었다 루미는 둘 다 못 들은 척 낙엽 냄새를 맡았다',
    ],
    afterword: '엄마는 앨범에서 그 사진을 빼서 내 집 현관에 걸어 줬다 루미 방석에서 보이는 자리다',
    unlockDoc: 'final',
    next: { href: 'studio.html', title: '사진관', line: '다음은 오래된 사진관 이야기입니다' },
  },
};
