// 404호의 불빛 — ★4 안내 없음, 힌트 3단계, 함정 여럿 이야기·자료·장치가 전부 이 파일에 있습니다
// 핵심 통찰: 둑길(뒤편)에서 찍은 사진은 좌우가 뒤집히고, 뒤편은 땅이 낮아 반지하 창이 한 줄 더 보인다
const P = 'assets/v2/apartment/';

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

// 뒤편 사진 위 창 좌표(%) — 12열(4집 × 3창), 줄은 아래부터 반지하·1층…5층
const REAR = {
  cols: [12.3, 17.7, 23.0, 34.1, 39.4, 44.7, 55.6, 60.8, 66.1, 77.2, 82.3, 87.7],
  rows: { B: 78.6, 1: 68.6, 2: 54.9, 3: 41.2, 4: 27.4, 5: 13.7 },
  w: 3.5, h: 4.9,
};
// 301호는 뒤에서 보면 맨 오른쪽 묶음(9~11번째 열), 아래에서 넷째 줄(반지하 포함) = 3층
// 뒤에서 본 301 창 순서(왼→오): 안방 · 거실 · 작은방
// 지금(틀린) 프로그램: 작은방 21:00 → 안방 21:30 → 거실 22:00 → 23:00 전부 끔 사진은 켜진 창이 하나씩 늘어난다
const FRAMES = [
  { t: '21:00', lit: [11] },
  { t: '21:30', lit: [11, 9] },
  { t: '22:00', lit: [11, 9, 10] },
  { t: '23:00', lit: [] },
];
const rearPhoto = (lit, cap) => `<figure class="prop rearphoto"><img src="${P}props/rear.webp" alt="둑길에서 찍은 미루연립 A동 뒤편 사진 · 불 켜진 창 ${lit.length}개" decoding="async">${lit.map((col) => `<i class="litwin" style="left:${REAR.cols[col]}%;top:${REAR.rows[3]}%;width:${REAR.w}%;height:${REAR.h}%"></i>`).join('')}${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;

// 우편함 6줄 × 4칸 (정문에서 본 그대로, 왼쪽부터 01)
const MAILROWS = [['501', '502', '503', '504'], ['401', '402', '403', '404'], ['301', '302', '303', '304'], ['201', '202', '203', '204'], ['101', '102', '103', '104'], ['관리실', '공용', '전단지', '반송']];
const MAIL_ANSWER = '301';
// 열쇠함 6줄 × 4칸
const HOOKROWS = [['501', '502', '503', '504'], ['401', '402', '403', '404'], ['301', '302', '303', '304'], ['201', '202', '203', '204'], ['101', '102', '103', '104'], ['B01', 'B02', 'B03', 'B04']];
const HOOK_ANSWER = 'B03';
// 꼬리표 뒷면(손글씨)과 고리에 걸린 열쇠 개수
const RING = { B01: ['김순례', 1], B02: ['박정호', 1], B03: ['김순자', 2], B04: ['공구', 1] };
const BOX_CODE = [3, 1, 2];
const TIMES = ['21:00', '21:30', '22:00', '22:30'];
const OFFS = ['22:00', '22:30', '23:00', '23:30'];
const PROG_ANSWER = { living: '21:00', small: '21:30', main: '22:30', off: '23:00' };

function sectionSvg() {
  const ink = '#2b3340';
  const tx = (x, y, s, t, a = 'middle') => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="${a}" fill="${ink}" font-family="SUIT, sans-serif">${t}</text>`;
  return `<svg viewBox="0 0 120 70" class="section-svg" role="img" aria-label="A동 단면도: 정문 쪽은 길과 1층 바닥이 같고, 미루천 쪽 뒤편은 땅이 한 층 낮아 반지하가 드러난다">
  <path d="M2 48 H34 V30 M34 48" fill="none" stroke="${ink}" stroke-width=".5"/>
  <path d="M86 58 H118" fill="none" stroke="${ink}" stroke-width=".5"/><path d="M86 58 Q 76 56 70 48" fill="none" stroke="${ink}" stroke-width=".4" stroke-dasharray="1 .8"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="34" y="${48 - (i + 1) * 7 + (i === 0 ? 7 : 0)}" width="36" height="${i === 0 ? 0 : 7}" fill="none" stroke="${ink}" stroke-width=".5"/>`).join('')}
  <rect x="34" y="48" width="36" height="10" fill="#e9e3d2" stroke="${ink}" stroke-width=".5"/>
  ${[1, 2, 3, 4, 5].map((f) => tx(52, 48 - (f - 1) * 7 - 2.6, 2.8, f + '층')).join('')}${tx(52, 54.5, 2.8, '반지하 창고')}
  <rect x="70" y="50" width="3" height="4" fill="#9fb6c8" stroke="${ink}" stroke-width=".3"/>
  ${tx(18, 45, 3, '정문 · 미루새길')}${tx(102, 55, 3, '뒤편 · 둑길 쪽')}${tx(102, 64, 2.6, '미루천')}
  <path d="M90 66 q3 -2 6 0 t6 0 t6 0" fill="none" stroke="#5b86b0" stroke-width=".5"/>
  ${tx(60, 6, 3.2, 'A동 단면 (철거 안내판 부분)')}
  </svg>`;
}
function planSvg() {
  const ink = '#2b3340';
  const tx = (x, y, s, t) => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" fill="${ink}" font-family="SUIT, sans-serif">${t}</text>`;
  return `<svg viewBox="0 0 100 70" class="plan-svg" role="img" aria-label="301호 대피 안내도: 현관에서 들어서 북쪽 벽을 보면 왼쪽부터 작은방, 거실, 안방 창">
  <rect x="8" y="10" width="84" height="48" fill="#fbfaf4" stroke="${ink}" stroke-width="1"/>
  <path d="M36 10 V40 M64 10 V40 M8 40 H92" stroke="${ink}" stroke-width=".6"/>
  ${tx(22, 27, 3.4, '작은방')}${tx(50, 27, 3.4, '거실')}${tx(78, 27, 3.4, '안방')}${tx(30, 51, 3, '부엌')}${tx(70, 51, 3, '욕실')}
  <path d="M16 10 h12 M44 10 h12 M72 10 h12" stroke="#5b86b0" stroke-width="2.2"/>
  ${tx(50, 6.5, 2.8, '창 (북쪽 · 미루천)')}
  <path d="M48 58 h8" stroke="#c0362a" stroke-width="2"/>${tx(52, 64, 2.8, '현관 · 지금 여기')}
  <circle cx="52" cy="61" r="1" fill="#c0362a"/>
  ${tx(50, 69, 2.4, '301호 · 비상시 현관으로 대피')}
  </svg>`;
}

export default {
  id: 'apartment',
  number: '002',
  title: '404호의 불빛',
  subtitle: '사흘 뒤 헐리는 집',
  genre: '도시괴담 · 공간 추리',
  minutes: 30,
  difficulty: 4,
  cover: P + 'bank.webp',
  coverAlt: '둑길 건너 불 꺼진 연립 뒤편, 창 하나만 노랗게 켜져 있다',
  music: 'assets/music/apartment-v33.mp3',
  tagline: '단전된 지 3주 된 건물\n밤 아홉 시면 창이 하나씩 켜진다',
  blurb: '철거를 사흘 앞둔 미루연립 A동\n전기가 끊긴 지 3주인데 밤마다 창이 차례로 켜진다는 민원이 들어왔습니다 동네에선 404호 귀신이라고 부릅니다',
  storageKey: 'mihaeje-v2-apartment',
  hintTitle: '김 팀장 문자',
  tracesLabel: '불빛을 따라간 것',

  opening: {
    eyebrow: '10월 23일 금요일, 밤 9시 10분',
    paragraphs: [
      '철거 전 마지막 전기 점검이 내 일이다 미루연립 A동은 10월 1일에 한전이 전기를 끊었고, 월요일에 포클레인이 들어온다',
      '그런데 지난주부터 민원이 세 건이다 밤 아홉 시가 넘으면 빈 건물 창이 하나씩 켜졌다 꺼진다고 동네 커뮤니티에는 벌써 「404호 귀신」이라는 글이 올라와 있었다',
      '팀장은 짧게 말했다 「귀신이든 도둑이든 전선이든 월요일 전에 원인 찾아서 끊어」 나는 둑길 벤치에 앉아 건너편 건물 뒤편을 봤다 창 하나가 노랗게 켜져 있었다',
    ],
    cta: '둑길에서 건물 보기',
  },

  traces: [
    { device: 'mailbox', label: '그 집 우편함' },
    { device: 'hooks', label: '그 집 열쇠' },
    { device: 'box', label: '싱크대 밑 상자' },
    { device: 'timers', label: '불 켜는 순서' },
  ],

  scenes: [
    {
      id: 'bank',
      name: '미루천 둑길',
      image: P + 'bank.webp',
      arrive: '둑길 가로등 하나 아래 벤치 개울 건너 A동 뒤편 벽에 빨간 락카로 「철거」 창은 전부 까만데 딱 하나가 노랗다 그 빛이 개울물에 길게 비친다',
      hotspots: [
        { id: 'order', x: 9, y: 88, label: '오늘 작업 지시', kind: 'doc', doc: 'order' },
        { id: 'post', x: 28, y: 80, label: '동네 커뮤니티 글', kind: 'doc', doc: 'post' },
        { id: 'section', x: 86, y: 70, label: '둑길의 철거 안내판', kind: 'doc', doc: 'section' },
        { id: 'go', x: 40, y: 50, label: '건물 정문으로', kind: 'travel', to: 'entrance' },
      ],
    },
    {
      id: 'entrance',
      name: 'A동 현관',
      image: P + 'entrance.webp',
      arrive: '정문으로 돌아 들어왔다 현관 형광등은 비상 배터리로 겨우 버틴다 왼쪽 벽에 우편함, 맞은편에 관리실 관리실 유리창 안쪽에 스탠드 불이 켜져 있다 전기가 없는 건물인데',
      hotspots: [
        { id: 'plate', x: 17, y: 23, label: '우편함 위 호수 안내', kind: 'doc', doc: 'plate' },
        { id: 'board', x: 40, y: 40, label: '게시판의 이주 현황', kind: 'doc', doc: 'board' },
        { id: 'mailbox', x: 17, y: 52, label: '우편함', kind: 'device', device: 'mailbox' },
        { id: 'back', x: 92, y: 88, label: '둑길로', kind: 'travel', to: 'bank' },
      ],
    },
    {
      id: 'office',
      name: '관리실',
      image: P + 'office.webp',
      unlockedBy: 'mailbox',
      arrive: '관리실 문은 잠겨 있지 않았다 스탠드는 건전지용이다 주인은 없고 보온병이 아직 따뜻하다 벽에 열쇠함 문이 열린 채다',
      hotspots: [
        { id: 'log', x: 53, y: 70, label: '책상 위 근무일지', kind: 'doc', doc: 'log' },
        { id: 'roster', x: 94, y: 80, label: '입주자 명부', kind: 'doc', doc: 'roster' },
        { id: 'storage', x: 34, y: 18, label: '벽에 붙은 창고 배정표', kind: 'doc', doc: 'storage' },
        { id: 'calendar', x: 78, y: 22, label: '벽 달력', kind: 'doc', doc: 'calendar' },
        { id: 'hooks', x: 53, y: 24, label: '열쇠함', kind: 'device', device: 'hooks' },
        { id: 'back2', x: 6, y: 92, label: '현관으로', kind: 'travel', to: 'entrance' },
      ],
    },
    {
      id: 'unit',
      name: '301호',
      image: P + 'unit.webp',
      unlockedBy: 'hooks',
      arrive: '문을 여니 거실 바닥에 작은 배터리 등이 켜져 있다 짐은 거의 다 상자에 들어갔다 벽지는 꽃무늬, 달력은 9월에 멈춰 있다 스위치마다 누가 종이테이프를 붙여 숫자를 써 놨다',
      hotspots: [
        { id: 'plan', x: 47, y: 44, label: '방문 옆 대피 안내도', kind: 'doc', doc: 'plan' },
        { id: 'switches', x: 74, y: 26, label: '테이프 붙은 스위치', kind: 'doc', doc: 'switches' },
        { id: 'box', x: 88, y: 66, label: '싱크대 밑', kind: 'device', device: 'box' },
        { id: 'book', x: 20, y: 46, label: '상자 위 가계부', kind: 'doc', doc: 'book', visible: (S) => S.solved.includes('box') },
        { id: 'timers', x: 26, y: 76, label: '꺼낸 타이머 셋', kind: 'device', device: 'timers', visible: (S) => S.solved.includes('box') },
      ],
    },
  ],

  docs: {
    order: {
      title: '오늘 작업 지시',
      kind: '김 팀장 · 오후 5시 12분',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>김 팀장</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 10월 23일 금요일</div>
<div class="chat-row them"><span class="chat-avatar">팀</span><div class="chat-col"><span class="chat-name">김 팀장</span><div class="chat-bubble">미루연립 A동 최종 점검 오늘 밤에 가</div><div class="chat-bubble">10/1 단전 완료 확인서 있음 근데 밤마다 불 켜진다고 민원 3건</div><div class="chat-bubble">무단 전기 끌어다 쓰는 거면 위험하니까 월요일 철거 전에 원인 찾아서 끊고 보고</div></div><span class="chat-time">오후 5:12</span></div>
<div class="chat-row me"><span class="chat-meta">오후 5:20</span><div class="chat-bubble">네 9시쯤 가 볼게요</div></div>
<div class="chat-row them"><span class="chat-avatar">팀</span><div class="chat-col"><span class="chat-name">김 팀장</span><div class="chat-bubble">관리인 할아버지 아직 출근하신대 30년 계신 분 협조 받아</div></div><span class="chat-time">오후 5:21</span></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    post: {
      title: '동네 커뮤니티 글',
      kind: '미루천 사람들 · 자유게시판',
      html: `<div class="post"><p class="post-head"><b>미루연립 404호 귀신 진짜임</b><small>둑길산책 · 10월 21일</small></p><p>전기 끊긴 건물에 밤마다 불 들어옴 둑길에서 30분마다 찍어 봄 맨 아래부터 세면 네 번째 줄, 왼쪽에서 네 번째 집 = 404호</p>${FRAMES.map((f) => rearPhoto(f.lit, f.t)).join('')}<p>같은 집 창이 30분마다 하나씩 늘어남 ㄷㄷ 11시 되면 한꺼번에 다 꺼짐</p><div class="post-comments"><p><b>미루토박이</b> 404 작년에 이사 간 집인데</p><p><b>산책러2</b> 사진 뒤쪽에서 찍은 거 아님? 거기 땅 낮아서 창고 창도 보이던데</p><p><b>둑길산책</b> ↑ 뭔 상관이에요 404 맞음</p></div></div>`,
    },
    section: {
      title: '둑길의 철거 안내판',
      kind: '미루연립 정비사업 안내 · 일부',
      html: `<div class="paper-table"><p class="pt-head">미루연립 A동 철거 안내</p><p class="pt-foot">철거 10월 26일(월) 08:00부터 · 둑길 일부 통제</p></div><figure class="prop sectionfig">${sectionSvg()}</figure>`,
    },
    plate: {
      title: '우편함 위 호수 안내',
      kind: 'A동 현관',
      html: `<div class="paper-table"><p class="pt-head">A동 호수 안내</p><p>정문에서 보아 왼쪽 집부터 01 · 02 · 03 · 04호</p><p>반지하 창고 B01 ~ B04 출입은 건물 뒤편(둑길 쪽) 철문</p></div>`,
    },
    board: {
      title: '게시판의 이주 현황',
      kind: '9월 30일 게시',
      html: `<div class="paper-table"><p class="pt-head">A동 이주 현황 (20세대)</p><table><tr><th>이주 완료</th><td>19세대</td></tr><tr><th>남은 세대</th><td>1세대 (입원 중 · 짐 정리는 보호자가 대신)</td></tr><tr><th>단전</th><td>10월 1일 한전</td></tr></table><p class="pt-foot">우편물은 관리실에서 모아 전달합니다 관리인 문철호</p></div>`,
    },
    log: {
      title: '책상 위 근무일지',
      kind: '관리인 문철호 · 10월',
      html: `<blockquote class="hand">10. 1 단전 계단 비상등만<br>10. 2 그 집 열쇠 할머니 창고 열쇠랑 한 고리에 같이 자꾸 어디 뒀는지 잊어버려서<br>10. 5 병원<br>10. 9 철물점 (영수증 서랍)<br>10. 12 밤 9시 ☎<br>10. 16 밤 9시 ☎<br>10. 21 커뮤니티에 귀신 글 올라왔다고 302 아들이 알려 줌 허허</blockquote>`,
    },
    roster: {
      title: '입주자 명부',
      kind: 'A동 · 2026년 9월 기준 (이주 표시)',
      html: `<div class="paper-table"><p class="pt-head">입주자 명부 (3층)</p><table><tr><th>301</th><td>김순자</td><td class="hand-cell">입원 · 짐 그대로</td></tr><tr><th>302</th><td>이경숙</td><td class="hand-cell">이주</td></tr><tr><th>303</th><td>김순례</td><td class="hand-cell">이주</td></tr><tr><th>304</th><td>(공실)</td><td></td></tr></table><p class="pt-foot">1·2·4·5층 생략</p></div>`,
    },
    storage: {
      title: '창가에 붙은 창고 배정표',
      kind: '반지하 창고 · 이름순 아님',
      html: `<div class="paper-table"><p class="pt-head">반지하 창고 배정</p><table><tr><th>B01</th><td>김순례</td></tr><tr><th>B02</th><td>박정호</td></tr><tr><th>B03</th><td>김순자</td></tr><tr><th>B04</th><td>(관리실 공구)</td></tr></table></div>`,
    },
    calendar: {
      title: '벽 달력',
      kind: '10월',
      html: `<div class="paper-table"><p class="pt-head">10월</p><table><tr><td>1 목</td><td class="hand-cell">단전</td></tr><tr><td>9 금</td><td class="hand-cell">철물점</td></tr><tr><td>26 월</td><td class="hand-cell">철거 ✕</td></tr></table></div><p>12일부터 날짜마다 볼펜으로 작은 동그라미가 하나씩 쳐져 있다 오늘 23일에도</p>`,
    },
    plan: {
      title: '현관문 안쪽 대피 안내도',
      kind: '301호',
      html: `<figure class="prop planfig">${planSvg()}</figure><p>안내도는 현관에 서서 안쪽을 본 그대로 그렸다 창이 난 북쪽 벽이 정면이다</p>`,
    },
    switches: {
      title: '테이프 붙은 스위치',
      kind: '현관 옆 스위치 셋',
      html: `<div class="switch-row">${[['1', '안방'], ['2', '거실'], ['3', '작은방']].map(([n, r]) => `<div class="switch-plate"><span class="tape">${n} ${r}</span><i></i></div>`).join('')}</div><p>스위치는 단전이라 눌러도 아무 일 없다 테이프 글씨는 관리실 근무일지와 같은 손이다</p>`,
    },
    mnote: {
      title: '상자 안 쪽지',
      kind: '관리인 문철호의 글씨',
      html: `<blockquote class="hand">이걸 연 분께<br>전기 훔쳐 쓴 거 아닙니다 배터리입니다 불나지 않게 매일 낮에 와서 봅니다<br><br>301 김순자 할머니가 지금 햇살요양병원 3층에 계십니다 창가에서 둑 너머 이 집이 보입니다<br>사십 년 사신 집이 월요일에 헐립니다 그때까지만 밤마다 불 켜진 걸 보시게 하고 싶었습니다<br><br>근데 할머니가 전화로 순서가 틀렸다고 하십니다 영감님 계실 때는 그렇게 안 켰다고<br>나는 그 집 저녁을 모릅니다 할머니 가계부는 상자 위에 있습니다<br><br>월요일 아침에 제가 다 떼겠습니다<br>— 관리인 문철호</blockquote>`,
    },
    book: {
      title: '상자 위 가계부',
      kind: '김순자 · 두 권',
      html: `<figure class="prop bookphoto"><img src="${P}props/book.webp" alt="펼쳐 둔 낡은 가계부" decoding="async"></figure><div class="paper-table"><p class="pt-head">2009년 가계부 · 3월 둘째 장 여백</p><p class="hand-cell big">그이 아홉 시 퇴근 들어오면 거실 불부터<br>아홉 시 반 애들 방 켜 주고 숙제 봐 줌<br>열 시 반 안방 이불 깔고<br>열한 시 다 끄고 잔다 우리 집은 이게 저녁</p></div><div class="paper-table old"><p class="pt-head">2015년 가계부 · 1월 첫 장 여백</p><p class="hand-cell big">그이 가고 나서는 안방만 아홉 시에 켰다가 열 시에 끈다<br>애들 방은 이제 안 켠다</p></div>`,
    },
    final: {
      title: '할머니와의 통화',
      kind: '토요일 밤 9시 · 관리인 휴대폰 스피커',
      locked: true,
      html: `<blockquote>"거실 켜졌다"</blockquote><blockquote>"애들 방도"</blockquote><blockquote>"그래 그렇지 그 양반은 거실부터였어 문 열면 바로 거실 불 켰어 어둡게 들어오는 거 싫다고"</blockquote><blockquote>"안방은 좀 있다 켜져요 할머니"</blockquote><blockquote>"알아 열 시 반 이불 깔 때"</blockquote><p>안방 창이 켜지자 전화기 너머가 한참 조용했다 관리인 할아버지가 휴대폰을 둑길 난간에 올려놓고 먼 데를 봤다</p>`,
    },
  },

  devices: {
    mailbox: {
      title: '우편함',
      scene: 'entrance',
      intro: '스물네 칸 열쇠는 없지만 문이 다 헐겁다 불이 켜진 그 집 우편함을 연다',
      docs: ['post', 'section', 'plate'],
      hintCode: 'A-S01',
      hints: [
        '그 사진 어디서 찍었는지 생각해 봐 정문 쪽이 아니야',
        '뒤에서 보면 좌우가 바뀌고, 안내판 단면도 보면 뒤쪽은 땅이 낮아서 반지하 창이 한 줄 더 보여',
        '3층 01호 301',
      ],
      initial: () => ({ pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop mailwall'); wrap.innerHTML = `<img src="${P}props/mailbox.webp" alt="스물네 칸 우편함" decoding="async">`;
        MAILROWS.forEach((row, r) => row.forEach((lab, c) => {
          const b = el('button', 'mail-slot' + (d.pick === lab ? ' picking' : '')); b.type = 'button';
          b.style.left = [13.8, 38, 62.2, 86.4][c] + '%'; b.style.top = [9.3, 26.7, 43.7, 60.9, 78.1, 93.3][r] + '%';
          b.setAttribute('aria-label', `${lab} 우편함`); b.innerHTML = `<span class="mail-label">${lab}</span>`;
          b.onclick = () => { d.pick = d.pick === lab ? null : lab; save(); };
          wrap.append(b);
        }));
        const box = el('div', 'mail-wrap'); box.append(wrap, el('p', 'pick-label', d.pick ? `${d.pick} 우편함` : '우편함을 하나 고른다'));
        return box;
      },
      commitLabel: '이 우편함 열어 보기',
      canCommit: (d) => !!d.pick,
      check(d) {
        if (d.pick === MAIL_ANSWER) return { ok: true };
        if (d.pick === '404') return { ok: false, msg: '전단지만 꽉 찼다 작년에 이사 간 집이다 커뮤니티 글쓴이가 센 대로 따라가면 안 된다' };
        if (d.pick === '304') return { ok: false, msg: '304는 비어 있는 집이다 사진을 어느 쪽에서 찍었는지 다시 생각한다' };
        if (d.pick === '401') return { ok: false, msg: '401은 오래된 고지서뿐이다 사진 맨 아래 줄이 정말 1층일까' };
        return { ok: false, msg: '먼지뿐이다 사진 속 그 창을 다시 센다' };
      },
      reveal: {
        title: '301',
        text: '우편함 안에 고지서 한 장 「햇살요양병원 10월 입원비 · 김순자 님 보호자」 그리고 관리실 메모 「301 우편 관리실로 문」',
        scene: ['보호자 칸에 적힌 이름은 가족이 아니라 관리인 문철호였다 관리실 스탠드는 아직 켜져 있다'],
        unlock: 'office',
      },
    },

    hooks: {
      title: '열쇠함',
      scene: 'office',
      intro: '스물네 개 고리 꼬리표 앞면엔 호수, 뒷면엔 관리인 손글씨 301 고리는 비어 있다',
      docs: ['log', 'roster', 'storage'],
      hintCode: 'A-S02',
      hints: [
        '근무일지 10월 2일 그 집 열쇠를 할머니 창고 열쇠랑 한 고리에 같이 걸었다고 했지',
        '그 할머니가 누구고 창고가 몇 번인지는 명부랑 배정표를 같이 봐 이름 비슷한 분이 한 분 더 계셔 꺼내 보면 열쇠가 몇 개 달렸는지도 보이고',
        'B03 고리 열쇠 두 개',
      ],
      initial: () => ({ hand: null, flip: false }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop keywall'); wrap.innerHTML = `<img src="${P}props/keys.webp" alt="스물네 고리 열쇠함" decoding="async">`;
        HOOKROWS.forEach((row, r) => row.forEach((lab, c) => {
          const b = el('button', 'hook-slot' + (d.hand === lab ? ' taken' : '')); b.type = 'button';
          b.style.left = [31.25, 43.75, 56.25, 68.65][c] + '%'; b.style.top = [8.0, 23.0, 38.1, 52.8, 67.2, 81.8][r] + '%';
          b.setAttribute('aria-label', d.hand === lab ? `${lab} 고리에 도로 걸기` : `${lab} 고리에서 꺼내기`); b.innerHTML = `<span class="hook-tag">${lab}</span>`;
          b.onclick = () => {
            if (lab === '301') { save(); ctx.status('빈 고리다 열쇠가 없다'); return; }
            if (d.hand === lab) { d.hand = null; d.flip = false; } else { d.hand = lab; d.flip = false; }
            save();
          };
          wrap.append(b);
        }));
        const box = el('div', 'mail-wrap'); box.append(wrap);
        const hand = el('div', 'key-hand');
        if (!d.hand) hand.append(el('p', 'pick-label', '고리를 누르면 열쇠를 꺼내 손에 든다 다시 누르면 도로 건다'));
        else {
          const ring = RING[d.hand] || ['', 1];
          const tag = el('div', 'tag-big' + (d.flip ? ' back' : ''), d.flip ? (ring[0] || '(뒷면 비어 있음)') : d.hand);
          const flip = el('button', 'chip', d.flip ? '꼬리표 앞면 보기' : '꼬리표 뒤집기'); flip.type = 'button'; flip.onclick = () => { d.flip = !d.flip; save(); };
          const back = el('button', 'chip', '도로 걸기'); back.type = 'button'; back.onclick = () => { d.hand = null; d.flip = false; save(); };
          hand.append(el('p', 'pick-label', `손에 든 것 · ${d.hand} 고리 · 고리에 열쇠 ${ring[1]}개`), tag, el('div', 'pick-row', ''));
          hand.lastChild.append(flip, back);
        }
        box.append(hand);
        return box;
      },
      commitLabel: '이 열쇠 들고 3층으로',
      canCommit: (d) => !!d.hand,
      check(d) {
        if (d.hand === HOOK_ANSWER) return { ok: true };
        d.hand = null; d.flip = false;
        return { ok: false, msg: '3층까지 올라가 꽂아 봤지만 301 문이 안 열린다 열쇠를 도로 걸었다' };
      },
      reveal: {
        title: 'B03',
        text: 'B03 고리의 열쇠는 둘 하나는 창고 열쇠, 하나는 꼬리표 없는 현관 열쇠 301 문에 꽂자 한 번에 돌아갔다',
        scene: ['문 아래로 노란빛이 새어 나왔다'],
        unlock: 'unit',
      },
    },

    box: {
      title: '싱크대 밑',
      scene: 'unit',
      intro: '회색 공구 상자 하나 선이 배터리 두 개로 이어져 있다 세 자리 자물쇠 뚜껑에 테이프 「번호: 밤에 켜지는 순서대로 스위치 번호」',
      docs: ['switches', 'plan', 'post'],
      hintCode: 'A-S03',
      hints: [
        '커뮤니티 사진이 30분마다 찍은 거잖아 301 창 세 개 중 새로 켜진 게 어느 건지 시간 순서대로',
        '밖에서 보면 좌우가 뒤집혀 대피 안내도는 안에서 북쪽을 보고 그린 거야 밖에서 본 왼쪽 창은 안에서는 오른쪽 방',
        '작은방 안방 거실 312',
      ],
      initial: () => ({ dial: [0, 0, 0] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop boxphoto'); wrap.innerHTML = `<img src="${P}props/box.webp" alt="싱크대 밑 공구 상자와 세 자리 자물쇠" decoding="async">`;
        const box = el('div', 'letterlock-wrap'); box.append(wrap, dialRow(el, save, d, 3));
        return box;
      },
      commitLabel: '뚜껑 열기',
      check(d) {
        const s = d.dial.join('');
        if (s === BOX_CODE.join('')) return { ok: true };
        if (s === '132') return { ok: false, msg: '안 열린다 사진은 밖에서 찍은 거다 안에서 본 방 순서랑 같을까' };
        return { ok: false, msg: '안 열린다' };
      },
      reveal: {
        title: '312',
        text: '뚜껑 안에 타이머 셋, 배터리에서 나온 선, 그리고 접힌 쪽지 쪽지는 관리실 근무일지와 같은 글씨였다',
        scene: ['귀신도 도둑도 아니었다 저 건너 언덕 위 요양병원 3층 창이 여기서도 보였다'],
        unlockDoc: 'mnote',
        unlock: null,
      },
    },

    timers: {
      title: '꺼낸 타이머 셋',
      scene: 'unit',
      intro: '방마다 등 하나 타이머 하나 지금은 할머니가 틀렸다고 한 순서로 맞춰져 있다',
      docs: ['book', 'mnote', 'switches'],
      hintCode: 'A-S04',
      hints: [
        '가계부가 두 권이야 할머니가 원하는 건 영감님 계실 때 저녁',
        '2009년 여백 순서 그대로 애들 방은 작은방',
        '거실 21:00 · 작은방 21:30 · 안방 22:30 · 끄기 23:00',
      ],
      initial: () => ({ living: '22:00', small: '21:00', main: '21:30', off: '23:00', t: 2 }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'timers-wrap');
        const ph = el('div', 'prop timerphoto'); ph.innerHTML = `<img src="${P}props/timers.webp" alt="배터리에 연결된 타이머 셋" decoding="async">${[['1 안방', 21.9], ['2 거실', 50], ['3 작은방', 78.9]].map(([t, x]) => `<span class="timer-tape" style="left:${x}%">${t}</span>`).join('')}`;
        wrap.append(ph);
        const step = (k, list, lab) => {
          const row = el('div', 'timer-dial');
          const i = list.indexOf(d[k]);
          const prev = el('button', 'ctl', '◀'); prev.type = 'button'; prev.setAttribute('aria-label', `${lab} 앞으로 돌리기`); prev.onclick = () => { d[k] = list[(i + list.length - 1) % list.length]; save(); };
          const next = el('button', 'ctl', '▶'); next.type = 'button'; next.setAttribute('aria-label', `${lab} 뒤로 돌리기`); next.onclick = () => { d[k] = list[(i + 1) % list.length]; save(); };
          const v = el('b', 'timer-val', d[k]); v.dataset.k = k;
          row.append(el('span', 'gift-name', lab), prev, v, next);
          return row;
        };
        const dials = el('div', 'timer-dials');
        dials.append(step('main', TIMES, '1 안방 켜기'), step('living', TIMES, '2 거실 켜기'), step('small', TIMES, '3 작은방 켜기'), step('off', OFFS, '셋 다 끄기'));
        wrap.append(dials);
        // 미리 보기: 둑길에서 본 301 창 셋 (밖에서 보면 왼쪽부터 안방 · 거실 · 작은방)
        const PREV = ['20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
        const tt = PREV[d.t ?? 2];
        const on = (k) => d[k] <= tt && tt < d.off;
        const pv = el('figure', 'win-preview');
        pv.innerHTML = `<div class="win-crop"><img src="${P}props/rear.webp" alt="" decoding="async">${[['main', 24.8], ['living', 49], ['small', 74.8]].map(([k, x]) => `<i class="pv-win${on(k) ? ' lit' : ''}" style="left:${x}%"></i>`).join('')}</div><figcaption>둑길에서 본 301 창 세 개 · ${tt}</figcaption>`;
        const sl = el('input'); sl.type = 'range'; sl.min = 0; sl.max = PREV.length - 1; sl.step = 1; sl.value = d.t ?? 2; sl.setAttribute('aria-label', '미리 보기 시각');
        sl.oninput = () => { d.t = Number(sl.value); save(); };
        const lab = el('label', 'tilt-label'); lab.append(el('span', '', '시각을 밀어 미리 보기'), sl);
        wrap.append(el('p', 'pick-label', '할머니가 병실 창에서 보는 모습'), pv, lab);
        return wrap;
      },
      commitLabel: '타이머 맞춰 두기',
      check(d) {
        if (Object.entries(PROG_ANSWER).every(([k, v]) => d[k] === v)) return { ok: true };
        if (d.main === '21:00' && d.off === '22:00') return { ok: false, msg: '그건 혼자 되신 뒤의 저녁이다 할머니가 원한 건 그 순서가 아니었다' };
        if (d.small === '21:00' && d.main === '21:30' && d.living === '22:00') return { ok: false, msg: '지금 맞춰진 그대로다 할머니가 틀렸다고 한 순서' };
        return { ok: false, msg: '이대로면 또 틀렸다고 하실 거다 가계부 여백을 다시 본다' };
      },
      reveal: {
        title: '그 집의 저녁',
        text: '거실, 작은방, 안방 열한 시에 다 같이 꺼진다 2009년 3월 어느 저녁의 순서다',
        scene: ['관리실로 내려가 쪽지 밑에 적어 뒀다 「순서 고쳐 놨습니다 월요일 아침 철거 전에 같이 떼요 — 점검 한도윤」 팀장한테는 「원인 확인 배터리 조명 월요일 철거 전 제거 예정」이라고만 보냈다'],
        ending: true,
        endingLabel: '다음 날 밤 아홉 시, 둑길',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '요양병원 창가에서 개울 건너 연립 창을 바라보는 할머니',
    eyebrow: '10월 24일 토요일, 밤 9시',
    title: '404호에는 불이 켜지지 않았다',
    paragraphs: [
      '토요일 밤 둑길 벤치에 관리인 할아버지와 나란히 앉았다 할아버지 휴대폰에서 할머니 목소리가 나왔다',
      '"아홉 시 됐나"',
      '"됐어요 할머니"',
      '건너편 3층 맨 오른쪽 묶음, 가운데 창이 먼저 켜졌다',
      '"거실이네" 할머니 목소리가 달라졌다',
      '아홉 시 반에 작은방이 켜졌고, 열 시 반에 안방이 켜졌다 할아버지는 아무 말 없이 휴대폰을 난간에 올려 두고 건너편만 봤다',
      '열한 시에 셋이 같이 꺼졌다 "잘 자요 할머니" "그래 자네도"',
    ],
    afterword: '월요일 아침 여덟 시, 할아버지와 등 세 개를 떼어 냈다 거실 등 하나는 할머니 병실 창가로 갔다 타이머는 아홉 시 커뮤니티 글에는 댓글이 하나 더 달렸다 「404 아니었음 301이었음 그리고 귀신도 아니었음」',
    unlockDoc: 'final',
    next: { href: 'play.html?case=laundry', title: '자정의 무인 세탁소', line: '다음은 자정마다 빈 통으로 도는 건조기 이야기입니다' },
  },
};
