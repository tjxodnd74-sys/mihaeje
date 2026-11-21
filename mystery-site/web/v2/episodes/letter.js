// 반송된 편지 — ★3 이야기·자료·장치가 전부 이 파일에 있습니다
// 규칙: 남의 편지는 뜯지 않는다 모든 단서는 겉봉·대장·공고·순로표에서
const P = 'assets/v2/letter/';

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

// 반송 대장 — 이름은 가려 적는다
const LEDGER = [
  ['2020/11/2', '미루동 17-14', '정○리', '수취인 이사', '발신인에게 반송'],
  ['2021/2/26', '미루동 71-4', '정○린', '주소 불명', '발신인에게 반송'],
  ['2021/3/19', '미루동 17-4', '정○린', '수취인 불명', '반송 불능 (발신 주소 번짐) · 보관'],
  ['2021/8/11', '미루새길 9, 302호', '박○○', '수취 거절', '발신인에게 반송'],
  ['2022/3/18', '미루동 17-4', '정○린', '수취인 불명', '반송 불능 (발신 우편번호 없음) · 보관'],
  ['2023/3/17', '미루동 17-4', '정○린', '수취인 불명', '반송 불능 (우편번호 판독 불가) · 보관'],
  ['2023/6/2', '미루기록길 12', '미루기록관', '폐문', '발신인에게 반송'],
  ['2024/3/19', '미루동 17-4', '정○린', '수취인 불명', '반송 불능 (발신 주소 일부 찢김) · 보관'],
  ['2025/3/18', '미루동 17-4', '정○린', '수취인 불명', '반송 불능 (발신 우편번호 오기) · 보관'],
];
const LOCK_CODE = [0, 3, 1, 9];

// 다섯 통의 겉봉 — 보내는 사람 칸은 한 통도 온전하지 않다
// 우편번호 끝 두 자리는 2023 봉투(도장 밑)를 뒤에서 비춰 봐야만 나온다 2025 봉투의 35271은 대장에 오기로 적혀 있다
// 번진 자리는 진짜 글자 대신 얼룩 모양만 그린다 (글자 수만 맞춤)
const SMEAR = (t) => `<span class="smear" aria-hidden="true" data-g="${'▒'.repeat([...t].length)}"></span>`;
const ENVS = [
  { y: 2021, mark: '2021/3/15', day: '월', zip: SMEAR('35217'), addr: `수림군 산장면 ${SMEAR('산장길 31-2')}`, name: '오정민', note: '빗물에 보내는 사람 칸이 번졌다 이름만 겨우 읽힌다' },
  { y: 2022, mark: '2022/3/14', day: '월', zip: '', addr: '수림군 산장면 산장길 31-2, 1층', name: '정민', note: '우편번호 칸이 비어 있다' },
  { y: 2023, mark: '2023/3/14', day: '화', zip: '352<span class="inked" aria-hidden="true"></span>', addr: '수림군 산장면 산장길 31-2, 1층', name: '오정민', note: '소인 도장이 우편번호 끝 두 자리 위에 시커멓게 겹쳐 찍혔다', atZip: true },
  { y: 2024, mark: '2024/3/14', day: '목', zip: '35<span class="torn"></span>', addr: `수림군 산장면 산장길 3${SMEAR('1-2')}, 2층`, name: '정민', note: '귀퉁이가 찢겨 우편번호 뒤 세 자리가 없다 보내는 사람 칸 옆에 작게 한 줄', extra: '2층으로 옮겼어요' },
  { y: 2025, mark: '2025/3/14', day: '금', zip: '35271', addr: '수림군 산장면 산장길 31-2, 2층', name: '오정민', note: '' },
];

// 구분함 4×4
const RACK = [
  '미루새길 1~7', '미루새길 9', '미루새길 9-1', '미루새길 11',
  '미루새길 13~21', '미루기록길 2~10', '미루기록길 12', '미루기록길 14~20',
  '미루기록길 21', '미루기록길 22~30', '산장로 1~9', '산장로 10~',
  '사서함', '반송', '등기', '기타',
];
const RACK_ANSWER = '미루새길 9-1';

const ROUTE_NOW = [
  ['124', '미루새길 3', ''], ['125', '미루새길 5', ''], ['126', '미루새길 7', '세탁소'],
  ['127', '미루새길 9', '빌라 101~304호 · 우편함 공용'], ['128', '미루새길 9-1', '빌라 옆 골목 안 · 초록 대문'],
  ['129', '미루새길 11', ''], ['130', '미루새길 13', '개 있음'],
];
const DIR_CODE = ['U', 'R', 'U', 'L']; // 우체국 문 → 북 → 미루새길 동 → 빌라 옆 골목 북 → 빌라 뒤 서 → 초록 대문
const ARROW = { U: '↑', D: '↓', L: '←', R: '→' };
function routeMap() {
  const ink = '#2f3a7a';
  const pen = (d, w = 0.8, extra = '', col = ink) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const t = (x, y, s, txt, a = 'middle', c = ink) => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="${a}" fill="${c}" font-family="MihaejeHand, serif">${txt}</text>`;
  const road = (x1, y1, x2, y2) => pen(`M${x1} ${y1} L${x2} ${y2}`, 0.5);
  return `<svg viewBox="0 0 100 80" class="route-map" role="img" aria-label="봉수 아저씨가 순로표 뒤에 볼펜으로 그린 미루새길 약도">
  ${road(4, 37, 96, 37)}${road(4, 43, 96, 43)}${t(90, 41.6, 3.4, '미루새길')}
  ${road(15, 43, 15, 62)}${road(21, 43, 21, 62)}${t(29, 55, 3.4, '우체국길')}
  ${pen('M8 62 h20 v12 h-20 z', 0.9)}${t(18, 70, 4, '우체국')}${pen('M16 62 h4', 1.6)}${t(18, 60.5, 2.8, '문')}
  ${pen('M26 20 h14 v15 h-14 z', 0.7)}${t(33, 29, 3.4, '7 세탁소')}
  ${pen('M44 20 h20 v15 h-20 z', 0.7)}${t(54, 27, 3.4, '9 빌라')}${t(54, 32.5, 2.8, '현관')}${pen('M51 35 h6', 1.4)}
  ${pen('M71 20 h16 v15 h-16 z', 0.7)}${t(79, 29, 3.4, '11')}
  ${road(65, 35, 65, 15)}${road(69, 35, 69, 11)}${road(44, 15, 65, 15)}${road(44, 11, 69, 11)}${t(67, 26, 2.8, '골목', 'middle')}
  ${pen('M29 4 h14 v15 h-14 z', 0.7)}${t(36, 12.5, 3, '9-1 뒤채')}${pen('M43 11.4 v3.2', 2, '', '#2f7a4e')}${t(45, 9, 2.8, '초록 대문', 'start', '#2f7a4e')}
  ${pen('M18 61 V40 H54 V36', 0.7, 'stroke-dasharray="1.6 1.2"', '#b33a28')}${t(52.6, 49, 2.8, '↑ 2019 정 할머니 대문', 'start', '#b33a28')}${t(56, 52.6, 2.8, '(지금 빌라 현관)', 'start', '#b33a28')}
  ${pen('M93 4 v7 M93 4 l-1.6 2.4 M93 4 l1.6 2.4', 0.6)}${t(95.5, 8, 3.4, 'N', 'start')}
  </svg>`;
}

const envHtml = (e) => `<figure class="prop lenv y${e.y}"><img src="${P}props/envelope.webp" alt="${e.y}년 봉투 앞면" decoding="async">
<span class="lenv-from"><i>보내는 사람</i>${e.zip ? `<b class="zip">${e.zip}</b>` : '<b class="zip empty">□□□□□</b>'}<span>${e.addr}</span><span>${e.name}</span>${e.extra ? `<em class="lenv-note">${e.extra}</em>` : ''}</span>
<span class="lenv-mark${e.atZip ? ' at-zip' : ''}"><em>수림</em><em>${e.mark}</em><em>${e.day}</em></span>
<span class="lenv-to">미루동 17-4<br>정해린 님께</span>
<span class="lenv-sticker"><b>반송</b><small>수취인 불명</small><small class="pen">보관 · 김</small></span>
</figure>${e.note ? `<p class="aside">${e.y}년 · 소인 ${e.mark} ${e.day}요일 · ${e.note}${e.extra ? ` 「${e.extra}」` : ''}</p>` : `<p class="aside">${e.y}년 · 소인 ${e.mark} ${e.day}요일</p>`}`;

// 옛 우편함 다이얼: 0~31, 오른쪽(↻)은 숫자가 커지고 왼쪽(↺)은 작아진다 방향이 바뀔 때 그 자리 숫자가 들어간다
const OB_N = 32;
const OB_ANSWER = { first: 3, firstDir: 'R', second: 14 };

// 답장 봉투 칸
const FIELDS = [
  { id: 'zip', label: '우편번호' },
  { id: 'lot', label: '번지' },
  { id: 'floor', label: '층' },
  { id: 'name', label: '받는 사람' },
];
const norm = {
  zip: (v) => String(v || '').replace(/\D/g, ''),
  lot: (v) => String(v || '').replace(/\s|번지/g, '').replace(/의/g, '-').replace(/[–—]/g, '-'),
  floor: (v) => v || '',
  name: (v) => String(v || '').replace(/\s|님/g, ''),
};
const REPLY_ANS = { zip: '35217', lot: '31-2', floor: '2층', name: '오정민' };

export default {
  id: 'letter',
  number: '005',
  title: '반송된 편지',
  subtitle: '다섯 번 돌아온 봉투',
  genre: '우체국 · 주소 추적',
  minutes: 30,
  difficulty: 3,
  cover: P + 'cover.webp',
  coverAlt: '우체국 보관함 맨 아래 칸에 고무줄로 묶인 반송 편지 다섯 통',
  music: 'assets/music/letter-v33.mp3',
  tagline: '받는 사람 미루동 17-4 정해린\n다섯 해 동안 다섯 번 돌아왔다 올해는 오지 않았다',
  blurb: '미루우체국이 다음 달 문을 닫습니다\n퇴임한 선배 집배원이 반송 보관함 맨 아래 칸의 편지 묶음 하나만은 주인을 찾아 달라고 부탁했습니다',
  storageKey: 'mihaeje-v2-letter',
  hintTitle: '봉수 아저씨의 문자',
  tracesLabel: '돌아온 편지가 갈 길',

  opening: {
    eyebrow: '2026/11/20 금요일, 마감 뒤',
    image: P + 'sorting.webp',
    paragraphs: [
      '미루우체국은 다음 달 중앙우체국으로 합쳐진다. 구분실 짐을 상자에 담다가 휴대폰이 울렸다. 지난달 퇴임한 봉수 아저씨였다. 이 구역을 38년 돈 사람이다.',
      '반송 보관함 열쇠는 아저씨가 퇴임하면서 가져가 버렸고, 대신 보관함 문에 쪽지를 붙여 놨다고 했다. 맨 아래 칸 묶음 하나만 부탁한다고.',
      '반송 우편은 보관 기한이 지나면 폐기한다. 그 묶음은 기한을 몇 번이나 넘긴 채 거기 있었다는 뜻이다.',
      '문자 끝에 한 줄이 더 붙어 있었다. 「올해는 안 왔다. 그게 걸린다.」 무엇이 안 왔다는 건지, 그때는 몰랐다.',
    ],
    cta: '구분실 불 켜기',
  },

  traces: [
    { device: 'locker', label: '맨 아래 칸 묶음' },
    { device: 'rack', label: '그 집 칸' },
    { device: 'staffbox', label: '봉수 아저씨의 수첩' },
    { device: 'oldbox', label: '여섯 번째 봉투' },
    { device: 'reply', label: '꽉 찬 봉투' },
  ],

  scenes: [
    {
      id: 'sorting',
      name: '미루우체국 구분실',
      image: P + 'sorting.webp',
      arrive: '형광등 하나가 자꾸 깜박거린다 벽 하나를 다 차지한 구분함, 왼쪽의 회색 반송 보관함, 책상 위에 펼쳐진 반송 대장 38년 동안 아저씨가 매일 아침 서 있던 자리다',
      hotspots: [
        { id: 'phone', x: 62, y: 79, r: 9, label: '봉수 아저씨 문자', kind: 'doc', doc: 'chat' },
        { id: 'bmemo', x: 16.4, y: 32, r: 9, label: '보관함 문에 붙은 쪽지', kind: 'doc', doc: 'bmemo' },
        { id: 'locker', x: 14.5, y: 46, r: 9, label: '반송 보관함', kind: 'device', device: 'locker' },
        { id: 'ledger', x: 33, y: 76, label: '반송 대장', kind: 'doc', doc: 'ledger' },
        { id: 'notice', x: 82, y: 33, label: '게시판의 주소 안내', kind: 'doc', doc: 'notice' },
        { id: 'envs', x: 9, y: 70, r: 9, label: '다섯 통의 겉봉', kind: 'doc', doc: 'envs', visible: (S) => S.solved.includes('locker') },
        { id: 'forward', x: 20, y: 77, r: 9, label: '묶음에 끼워진 신청서', kind: 'doc', doc: 'forward', visible: (S) => S.solved.includes('locker') },
        { id: 'rack', x: 50, y: 30, label: '구분함', kind: 'device', device: 'rack', visible: (S) => S.solved.includes('locker') },
        { id: 'hcard', x: 64, y: 24, r: 9, label: '9-1 칸의 쪽지', kind: 'doc', doc: 'hcard', visible: (S) => S.solved.includes('rack') },
      ],
    },
    {
      id: 'breakroom',
      name: '집배원 휴게실',
      image: P + 'breakroom.webp',
      unlockedBy: 'rack',
      arrive: '휴게실엔 아직 아저씨 우비가 걸려 있다 사물함 여섯 칸 중 맨 끝 칸에만 자물쇠가 달려 있고, 이름표 자리는 비어 있다',
      hotspots: [
        { id: 'route', x: 68, y: 30, label: '못에 걸린 순로표', kind: 'doc', doc: 'route' },
        { id: 'photo', x: 93, y: 19, label: '벽의 단체 사진', kind: 'doc', doc: 'photo' },
        { id: 'staffbox', x: 53, y: 47, label: '맨 끝 사물함', kind: 'device', device: 'staffbox', visible: (S) => !S.solved.includes('staffbox') },
        { id: 'notebook', x: 53, y: 47, label: '봉수 아저씨의 수첩', kind: 'doc', doc: 'notebook', visible: (S) => S.solved.includes('staffbox') },
      ],
    },
    {
      id: 'alley',
      name: '미루새길 골목',
      image: P + 'alley.webp',
      unlockedBy: 'staffbox',
      arrive: (S) => (S.solved.includes('oldbox')
        ? '녹슨 우편함 뚜껑이 열린 채 흔들린다 초록 대문 안쪽에서 라디오 소리가 작게 난다'
        : '토요일 오후 미루새길 9는 3층짜리 빌라다 그 옆 틈 안쪽에 녹슨 초록 대문이 있고, 대문 기둥엔 페인트가 벗겨진 우편함이 하나 붙어 있다'),
      hotspots: [
        { id: 'mailboxes', x: 78, y: 62, label: '빌라 우편함', kind: 'doc', doc: 'mailboxes' },
        { id: 'oldbox', x: 44, y: 62, r: 9, label: '대문 기둥의 옛 우편함', kind: 'device', device: 'oldbox', visible: (S) => !S.solved.includes('oldbox') },
        { id: 'sixth', x: 44, y: 62, r: 9, label: '여섯 번째 봉투', kind: 'doc', doc: 'sixth', visible: (S) => S.solved.includes('oldbox') },
        { id: 'gate', x: 55, y: 66, label: '초록 대문', kind: 'doc', doc: 'haerin', visible: (S) => S.solved.includes('oldbox') },
        { id: 'reply', x: 63, y: 77, label: '할머니가 내민 빈 봉투', kind: 'device', device: 'reply', visible: (S) => S.read.includes('haerin') },
      ],
    },
  ],

  docs: {
    chat: {
      title: '봉수 아저씨 문자',
      kind: '오늘 저녁',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>김봉수 주무관님</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 11월 20일 금요일</div>
<div class="chat-row them"><span class="chat-avatar">봉</span><div class="chat-col"><span class="chat-name">김봉수 주무관님</span><div class="chat-bubble">재희야 정리 하냐</div><div class="chat-bubble">반송함 맨아래칸 묶음 그거 하나만 부탁하자</div><div class="chat-bubble">번호는 문에 쪽지 붙여놨다 열쇠는 내가 들고 나와버렸네 미안</div></div><span class="chat-time">오후 6:41</span></div>
<div class="chat-row me"><span class="chat-meta">오후 6:43</span><div class="chat-bubble">무슨 묶음인데요?</div></div>
<div class="chat-row them"><span class="chat-avatar">봉</span><div class="chat-col"><span class="chat-name">김봉수 주무관님</span><div class="chat-bubble">편지 다섯통</div><div class="chat-bubble">내가 못 한 거다 주인 찾아줘라</div><div class="chat-bubble">뜯지는 말고</div></div><span class="chat-time">오후 6:44</span></div>
<div class="chat-row them"><span class="chat-avatar">봉</span><div class="chat-col"><span class="chat-name">김봉수 주무관님</span><div class="chat-bubble">올해는 안왔다</div><div class="chat-bubble">그게 걸린다</div></div><span class="chat-time">오후 6:52</span></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    bmemo: {
      title: '보관함 문에 붙은 쪽지',
      kind: '봉수 아저씨 글씨',
      html: `<blockquote class="hand">재희야<br>맨 아래 칸 묶음 받는 사람은 미루동 17-4 정해린 할머니<br>번호는 그 묶음이 처음 돌아온 날 월일 넷 대장에 다 있다<br>편지는 뜯지 마라 남의 거다 겉봉만 봐라<br>— 봉수</blockquote><p>반송 대장에는 해마다 비슷한 주소가 수십 줄이다</p>`,
    },
    ledger: {
      title: '반송 대장',
      kind: '2020 ~ 2025 · 미루우체국',
      html: `<figure class="prop ledgerphoto"><img src="${P}props/ledger.webp" alt="펼쳐진 반송 대장" decoding="async"></figure><div class="paper-table ledger-table"><p class="pt-head">반송 우편 처리 대장 (발췌) · 받는 사람 이름은 가려 적음</p><table class="pc-only"><tr><th>처리일</th><th>받는 곳</th><th>받는 사람</th><th>사유</th><th>처리</th></tr>${LEDGER.map((r) => `<tr>${r.map((c, i) => `<td class="${i === 0 || i === 1 ? 'hand-cell nw' : ''}">${c}</td>`).join('')}</tr>`).join('')}</table><table class="mobile-only ledger-compact"><tr><th>처리일</th><th>받는 곳 · 받는 사람</th><th>사유 · 처리</th></tr>${LEDGER.map((r) => `<tr><td class="nw"><b>${r[0]}</b></td><td>${r[1]}<br><small>${r[2]}</small></td><td>${r[3]}<br><small>${r[4]}</small></td></tr>`).join('')}</table><p class="pt-foot">처리 담당 김봉수 · 반송 불능 우편은 1년 보관 뒤 폐기</p></div>`,
    },
    notice: {
      title: '게시판의 주소 안내',
      kind: '2020년 7월 게시 · 누렇게 바램',
      html: `<div class="paper-table"><p class="pt-head">미루동 도로명 주소 바뀜 안내 (7구)</p><table><tr><th>옛 지번</th><th>도로명 주소</th></tr><tr><td>미루동 17-1 ~ 17-3</td><td>미루새길 1 ~ 7</td></tr><tr><td>미루동 17-4</td><td>미루새길 9</td></tr><tr><td>미루동 17-4-1</td><td>미루새길 9-1</td></tr><tr><td>미루동 17-14</td><td>미루새길 11</td></tr><tr><td>미루동 71-4</td><td>미루기록길 21</td></tr></table><p class="pt-foot">※ 미루동 17-4는 2020년 6월 앞뒤 두 필지로 나뉨 길가 쪽 새 빌라가 17-4, 안쪽 옛집이 17-4-1</p></div>`,
    },
    envs: {
      title: '다섯 통의 겉봉',
      kind: '맨 아래 칸 묶음 · 뜯지 않음',
      html: () => { const k = 'e' + Math.random().toString(36).slice(2, 7); return `<p>고무줄을 풀어 다섯 통을 나란히 놓았다 받는 곳은 다섯 번 다 같다 보내는 사람 칸은 한 통도 온전하지 않다 오래된 것일수록 종이가 누렇다</p><div class="envtabs">${ENVS.map((e, i) => `<input type="radio" name="${k}" id="${k}${i}"${i === 0 ? ' checked' : ''}><label for="${k}${i}">${e.y}</label>`).join('')}${ENVS.map((e) => `<div class="envpanel">${envHtml(e)}</div>`).join('')}</div>`; },
    },
    forward: {
      title: '묶음에 끼워진 신청서',
      kind: '우편물 전송 신청서 사본 · 2020년',
      html: `<div class="paper-table"><p class="pt-head">우편물 전송 신청서 (사본)</p><table><tr><th>신청인</th><td>정해린</td></tr><tr><th>원래 주소</th><td>미루동 17-4</td></tr><tr><th>받을 곳</th><td class="hand-cell">같은 번지 뒤채 (앞집 헐고 빌라 들어섬)</td></tr><tr><th>전송 기간</th><td>2020/7/1 ~ 2021/6/30</td></tr></table><p class="pt-foot">접수 김봉수</p></div><p class="aside">사본 귀퉁이에 볼펜으로 「1년 지나면 끝」</p>`,
    },
    hcard: {
      title: '9-1 칸의 쪽지',
      kind: '창구에 맡기고 간 것 · 2026/11/13',
      html: `<blockquote class="hand">김봉수 씨께<br>그 편지 아직 가지고 계시면<br>갖다 주세요<br>이제는 받겠습니다<br>— 정해린 미루새길 9-1</blockquote><p class="aside">창구 직원이 「봉수 주무관님께 전달」이라고 적어 그 집 칸에 꽂아 둔 것 같다 아저씨는 이미 퇴임한 뒤였다</p>`,
    },
    route: {
      title: '못에 걸린 순로표',
      kind: '7구 배달 순서 · 뒷면에 볼펜 약도',
      html: `<p>종이를 뒤집으니 아저씨가 볼펜으로 그린 약도가 있었다 빨간 점선은 예전 길이다 아래에 작게 「할머니 집 가는 길 · 우체국 문 나서는 방향부터 · 길 하나에 한 번씩 · 위가 북쪽」</p><figure class="prop routemap">${routeMap()}</figure><p>앞면은 배달 순서다</p><div class="paper-table"><p class="pt-head">7구 순로표 (2026년 개정) · 미루새길 구간</p><table><tr><th>순번</th><th>주소</th><th>메모</th></tr>${ROUTE_NOW.map((r) => `<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table><p class="pt-foot">우체통 수거 월~토 오후 3시 · 일요일·공휴일 수거 없음 그날 넣은 우편은 다음 수거 때 소인을 찍는다</p></div><figure class="prop clipphoto"><img src="${P}props/clipboard.webp" alt="못에 걸린 클립보드" decoding="async"></figure>`,
    },
    photo: {
      title: '벽의 단체 사진',
      kind: '액자 아래 글씨',
      html: `<figure class="prop photoframe"><img src="${P}props/photo.webp" alt="빨간 오토바이 앞에 나란히 선 집배원들, 액자" decoding="async"></figure><p>2009년 미루우체국 집배원들이 빨간 오토바이 앞에 나란히 섰다 오른쪽 끝 사람은 액자 틀에 반쯤 가렸다 사진이 작아 얼굴은 잘 안 보인다 액자 밑에 누가 매직으로 덧써 놨다 「38년 · 10/30 퇴임 · 사물함 비번 아무도 모름」</p>`,
    },
    notebook: {
      title: '봉수 아저씨의 수첩',
      kind: '맨 끝 사물함 · 업무 수첩 마지막 장들',
      html: `<blockquote class="hand small">2018/4/2 정 할머니 대문 우편함 자물쇠 고장 둥근 다이얼짜리로 새로 달아 드림 번호는 할머니가 정하심 「내 생일로 해 오른쪽으로 달, 왼쪽으로 날 그래야 그 애도 안 잊지」<br><br>2020/6/20 정 할머니 앞집 헐고 빌라 들어섬 할머니는 뒤채로 전송 신청 받아 줌 대문 우편함은 뒤채 대문 기둥으로 옮겨 달아 드림 우편은 대문 틈으로 넣기로<br><br>2021/3/19 수림에서 정 할머니 앞 편지 보낸 사람 아드님 오정민 씨<br>할머니가 안 받으신다 함 「그 애 편지 받으면 내가 지는 거다」<br>거절 도장을 찍으면 언젠가 이게 돌아갔을 때 아드님이 볼 거다 17-4는 이제 빌라 번지라 불명이 틀린 말도 아니고<br>근데 보내는 사람 칸이 번져서 돌려보낼 데도 없다 그럼 그 도장은 누구 보라고 찍었나<br>솔직히는 내가 거절을 못 찍었다 찍으면 정말 끝나는 것 같아서 보관<br><br>2022/3/18 또 옴 할머니 겉봉만 한참 보시다 그래도 돌려보내라 하심<br><br>2023/3/17 또 옴 아드님은 해마다 3월 똑같은 날에 우체통에 넣는다 도착하는 날은 해마다 다르지만 부치는 날은 안 바뀐다 무슨 날인지는 안 여쭸다<br><br>2024/3/19 2층으로 옮겼다고 겉봉에 써 있다 다섯 통 겉봉 합치면 주소가 거의 다 나오는데<br>그건 내 일이 아니라고 생각했다<br><br>2025/3/18 다섯 통째 이번엔 우편번호를 잘못 썼다 아드님도 급했나 보다<br><br><b class="pressed">2026년 3월 올해는 안 옴</b><br><br>2026/10/30 퇴임 묶음은 못 버렸다<br><br>2026/11/14 국장님 전화 할머니가 쪽지 두고 가셨단다 나는 이제 우체국 사람이 아니다 재희한테</blockquote><p class="aside">「올해는 안 옴」 줄만 볼펜으로 몇 번이나 덧그어 종이가 패였다</p>`,
    },
    mailboxes: {
      title: '빌라 우편함',
      kind: '미루새길 9',
      html: `<div class="paper-table"><p class="pt-head">미루새길 9 우편함 · 열두 칸 중 이름표 붙은 칸</p><table><tr><td>101 김○○</td><td>102 (빈집)</td></tr><tr><td>201 박○○</td><td>202 이○○</td></tr><tr><td>301 최○○</td><td>302 박○○</td></tr></table></div><p>나머지 칸은 이름표 없이 광고지만 꽂혀 있다 정해린이라는 이름은 없다 우편함 옆 벽에 누가 화살표를 그려 놨다 「뒤채 우편은 골목 안 초록 대문 틈으로」</p>`,
    },
    sixth: {
      title: '여섯 번째 봉투',
      kind: '대문 기둥의 옛 우편함 안 · 우표도 소인도 없음',
      html: `<figure class="prop lenv sixth"><img src="${P}props/envelope-nostamp.webp" alt="우표도 소인도 없는 봉투 앞면" decoding="async"><span class="lenv-to">어머니께</span></figure><figure class="prop lenv sixth back"><img src="${P}props/envelope-back.webp" alt="같은 봉투 뒷면의 볼펜 글씨" decoding="async"><span class="lenv-back">2026/3/14<br>왔다 갑니다<br>문 앞에서 한참 있다가<br>그냥 갑니다<br>— 정민</span></figure><p>우표를 붙일 자리가 비어 있다 우체국을 거치지 않고 손으로 넣고 간 봉투다 겉봉 앞에 「어머니께」, 풀칠한 자리 옆에 볼펜으로 몇 줄</p><p class="aside">뜯지 않았다 남의 편지다 날짜를 다시 봤다 2026/3/14 올해 3월, 아무것도 안 왔다던 그달이다</p>`,
    },
    haerin: {
      title: '초록 대문',
      kind: '정해린 · 미루새길 9-1',
      html: `<p>문을 두 번 두드리자 한참 뒤에 대문이 열렸다 작은 할머니가 내 우체국 점퍼부터 봤다</p><blockquote>“봉수 씨는?”</blockquote><blockquote>“지난달에 퇴임하셨어요 이거 전해 달라고 하셨어요”</blockquote><p>할머니는 묶음을 받기 전에 내 얼굴부터 살폈다</p><blockquote>“그 애한테 무슨 일 있는 거 아니지 올봄엔 안 왔어 다섯 해 동안 한 번도 안 거르던 애가”</blockquote><p>대답 대신 기둥 우편함에서 나온 봉투를 묶음 맨 위에 올려 드렸다 할머니가 뒷면 글씨를 손가락으로 한 자씩 짚었다 한참 아무 말이 없었다</p><blockquote>“여기까지 왔었네 문 앞까지 그 우편함은 앞집 헐고 나서 한 번도 안 열어 봤어 우편은 다 대문 틈으로 들어오니까 그 애는 번호를 아직 기억하고 있었네”</blockquote><blockquote>“앞집 땅을 그 애가 팔았어 내가 병원에 누워 있을 때 도장 찍고, 나 살 데는 뒤채면 된다고 그게 서운해서 받지 말라 했지 그 애는 아직도 17-4로 써 집이 쪼개진 걸 저도 못 받아들이는 거야”</blockquote><p>할머니는 봉투를 뜯지 않고 무릎에 내려놓았다 마루 소반 위에 빈 봉투 한 장과 볼펜이 있었다</p><blockquote>“답장을 쓸 거야 근데 눈이 침침해서 주소는 못 쓰겠어 그 애 주소는 겉봉에 있다는데 볼 때마다 어디가 번지고 찢기고 비어 있더라 봉투는 자네가 써 줘 이번엔 돌아오지 않게”</blockquote>`,
    },
    final: {
      title: '열흘 뒤 온 봉투',
      kind: '미루새길 9-1 · 반송 스티커 없음',
      locked: true,
      html: `<figure class="prop lenv"><img src="${P}props/envelope.webp" alt="열흘 뒤 수림에서 온 봉투" decoding="async"><span class="lenv-from full"><i>보내는 사람</i><b class="zip">35217</b><span>수림군 산장면 산장길 31-2, 2층</span><span>오정민</span></span><span class="lenv-mark"><em>수림</em><em>2026/12/1</em></span><span class="lenv-to">미루새길 9-1<br>정해린 님께</span></figure><p>보내는 사람 칸이 처음으로 꽉 차 있다 받는 곳도 새 주소다 봉투 뒷면, 풀칠한 자리 옆에 작은 글씨가 있었다</p><blockquote class="hand">내년 3월 14일엔 문 두드릴게요</blockquote><p class="aside">미루우체국은 그 전날 문을 닫았다 중앙우체국 소속으로 처음 돈 날, 뜯지 않고 9-1 대문 틈으로 밀어 넣었다</p>`,
    },
  },

  devices: {
    locker: {
      title: '반송 보관함',
      scene: 'sorting',
      intro: '네 자리 황동 다이얼 ▲▼로 한 칸씩 돌리고, 다 맞췄으면 손잡이를 내린다',
      docs: ['bmemo', 'ledger'],
      hintCode: 'L-S01',
      hints: [
        '대장에서 그 집 앞으로 온 줄만 골라라 번지 비슷한 게 많다 이름도 가려 놨고',
        '번지 하나, 이름 한 글자까지 똑같은 줄만 남겨 봐라 그다음은 내 쪽지대로',
        '2021/3/19 → 0319',
      ],
      initial: () => ({ dial: [0, 0, 0, 0] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop letterlock'); wrap.innerHTML = `<img src="${P}props/lock.webp" alt="반송 보관함 문의 네 자리 황동 다이얼" decoding="async">`;
        const box = el('div', 'letterlock-wrap'); box.append(wrap, dialRow(el, save, d, 4));
        return box;
      },
      commitLabel: '손잡이 내리기',
      check(d) {
        const s = d.dial.join('');
        if (s === LOCK_CODE.join('')) return { ok: true };
        return { ok: false, msg: '안 열린다 대장에서 그 집 줄을 다시 본다' };
      },
      reveal: {
        title: '0319',
        text: '손잡이가 내려갔다 맨 아래 칸에 고무줄로 묶은 편지 다섯 통이 있었고, 전부 노란 반송 스티커가 붙어 있었다 묶음 사이엔 접힌 종이 한 장이 끼워져 있었다',
        scene: ['받는 곳은 다섯 번 다 미루동 17-4 정해린 님 우체국에서 일하면 한 해에 반송을 수천 통 보는데, 한 사람이 다섯 해 내리 3월 중순마다 보낸 건 처음 봤다 올해 3월 칸만 비어 있었다'],
        unlock: null,
      },
    },

    rack: {
      title: '구분함',
      scene: 'sorting',
      intro: '칸 위 이름표를 눌러 칸을 고르고, 그 칸을 뒤진다 할머니 집 앞으로 오는 우편이 꽂히는 칸을 찾는다',
      docs: ['notice', 'forward', 'envs'],
      hintCode: 'L-S02',
      hints: [
        '게시판 안내 밑에 작게 적힌 거 봐라 17-4가 2020년에 둘로 쪼개졌다',
        '할머니가 길가 빌라 쪽인지 안쪽 옛집인지는 묶음에 끼워 둔 신청서에 있다',
        '미루새길 9-1 칸',
      ],
      initial: () => ({ pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop rackphoto'); const im = el('img'); im.src = P + 'props/rack.webp'; im.alt = '4칸 4줄 구분함, 몇몇 칸에 우편 묶음'; wrap.append(im);
        const cols = [14.5, 38.3, 61.7, 85.2], rows = [3.2, 27.2, 50.8, 74.6];
        RACK.forEach((lab, i) => {
          const b = el('button', 'rack-slot' + (d.pick === lab ? ' picking' : '')); b.type = 'button';
          b.style.left = cols[i % 4] + '%'; b.style.top = rows[Math.floor(i / 4)] + '%';
          b.setAttribute('aria-label', `${lab} 칸`); b.innerHTML = `<span class="rack-label">${lab}</span>`;
          b.onclick = () => { d.pick = lab; save(); };
          wrap.append(b);
        });
        const box = el('div', 'rack-wrap'); const chips = el('div', 'pick-row mobile-only rack-chips'); RACK.forEach((lab) => { const c = el('button', 'chip' + (d.pick === lab ? ' on' : ''), lab); c.type = 'button'; c.setAttribute('aria-label', `${lab} 칸 이름표`); c.onclick = () => { d.pick = lab; save(); }; chips.append(c); }); box.append(wrap, chips, el('p', 'pick-label', d.pick ? `${d.pick} 칸을 골랐다` : '칸 위의 이름표를 누른다'));
        return box;
      },
      commitLabel: '이 칸을 뒤져 보기',
      canCommit: (d) => !!d.pick,
      check(d) {
        if (d.pick === RACK_ANSWER) return { ok: true };
        if (d.pick === '반송') return { ok: false, msg: '반송 칸은 이제 비어 있다 묶음은 이미 꺼냈다' };
        return { ok: false, msg: '칸을 다 뒤졌다 할머니 이름은 없다' };
      },
      reveal: {
        title: '미루새길 9-1',
        text: '9-1 칸에는 광고지 두 장과 손글씨 쪽지 한 장이 꽂혀 있었다 받는 사람은 김봉수 씨, 쓴 사람은 정해린',
        scene: ['이제는 받겠다고 했다 그럼 왜 다섯 번이나 돌아온 걸까 아저씨가 「내가 못 한 거다」라고 한 말이 걸렸다 휴게실 맨 끝 사물함은 아저씨 거다'],
        unlock: 'breakroom',
        unlockDoc: 'hcard',
      },
    },

    staffbox: {
      title: '맨 끝 사물함',
      scene: 'breakroom',
      intro: '숫자가 없는 방향 자물쇠다 화살표를 누를 때마다 손잡이가 그쪽으로 한 번 밀린다 다 밀었으면 당긴다 문자가 한 통 더 와 있었다 「내 사물함에 수첩 있다 비번은 그 할머니 집 가는 길 요즘 길로」',
      docs: ['route', 'hcard', 'notice'],
      hintCode: 'L-S03',
      hints: [
        '순로표 뒤에 내가 그린 약도 있다 문 나서는 첫 방향도 한 번이다 그다음은 길이 바뀔 때마다 그 방향으로 한 번씩, 약도 위가 위',
        '빨간 점선은 옛날 길이다 그 대문은 이제 빌라 현관이다 할머니 집 대문은 빌라 옆으로 돌아 뒤 골목에 들어가야 나온다',
        '↑ 문 나서 위로 · → 미루새길 따라 오른쪽 · ↑ 빌라 옆 골목으로 위 · ← 빌라 뒤 골목 끝 초록 대문 쪽으로 왼쪽',
      ],
      initial: () => ({ seq: [] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop staffphoto'); wrap.innerHTML = `<img src="${P}props/dirlock.webp" alt="이름표 없는 사물함과 방향 자물쇠" decoding="async">`;
        const box = el('div', 'letterlock-wrap');
        const shown = el('p', 'dir-seq', d.seq.length ? d.seq.map((k) => ARROW[k]).join(' ') : '· · ·');
        const pad = el('div', 'dir-pad');
        [['U', '위로 밀기'], ['L', '왼쪽으로 밀기'], ['R', '오른쪽으로 밀기'], ['D', '아래로 밀기']].forEach(([k, lab]) => { const b = el('button', 'ctl dir-' + k, ARROW[k]); b.type = 'button'; b.setAttribute('aria-label', lab); b.onclick = () => { if (d.seq.length < 8) d.seq.push(k); save(); }; pad.append(b); });
        const reset = el('button', 'chip', '손 떼고 처음부터'); reset.type = 'button'; reset.onclick = () => { d.seq = []; save(); };
        box.append(wrap, shown, pad, reset);
        return box;
      },
      commitLabel: '자물쇠 당기기',
      canCommit: (d) => d.seq.length > 0,
      check(d) {
        const s = d.seq.join('');
        if (s === DIR_CODE.join('')) return { ok: true };
        d.seq = [];
        return { ok: false, msg: '안 열린다 손잡이가 처음 자리로 돌아갔다 약도를 다시 따라가 본다' };
      },
      reveal: {
        title: '↑ → ↑ ←',
        text: '자물쇠가 빠졌다 사물함 안은 거의 비었고 업무 수첩 한 권만 세워져 있었다 마지막 장들에 정 할머니 얘기가 띄엄띄엄 적혀 있다',
        scene: ['아저씨는 「수취 거절」 대신 「수취인 불명」을 찍었다 어차피 아무에게도 돌아가지 않을 편지였는데 그래도 거절은 못 찍었다고 적혀 있었다', '맨 끝 장 한 줄만 볼펜 자국이 깊었다 「올해는 안 옴」'],
        unlock: 'alley',
        unlockDoc: 'notebook',
      },
    },

    oldbox: {
      title: '대문 기둥의 옛 우편함',
      scene: 'alley',
      intro: '녹슨 양철 우편함에 둥근 다이얼 자물쇠가 달려 있다 ↻는 오른쪽으로, ↺는 왼쪽으로 한 눈금씩 돌린다 돌리는 방향을 바꿀 때마다 그 자리 숫자가 걸린다 다 돌렸으면 뚜껑을 당긴다',
      docs: ['notebook', 'envs', 'route', 'mailboxes'],
      hintCode: 'L-S04',
      hints: [
        '이 다이얼은 숫자 두 개를 받는다 어느 쪽으로 먼저 돌리고 무엇을 넣는지는 내 수첩 2018년 줄에 있다',
        '생일은 어디에도 그냥 적혀 있지 않다 수첩에서 그 애가 언제 부치는지 적은 줄을 찾고, 겉봉 소인과 순로표 아래 인쇄를 같이 봐라',
        '소인은 3/14가 넷, 2021년만 3/15 월요일 2021/3/14는 일요일이라 수거가 없어 다음 날 소인 → 생일 3월 14일 → 오른쪽으로 3, 왼쪽으로 14',
      ],
      initial: () => ({ pos: 0, dir: null, marks: [], dirs: [] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'oldbox');
        const face = el('div', 'ob-face');
        const ticks = Array.from({ length: OB_N }, (_, i) => { const a = (i * 360) / OB_N; const big = i % 4 === 0; return `<g transform="rotate(${a} 50 50)"><line x1="50" y1="${big ? 7 : 8.5}" x2="50" y2="12" stroke="#2a241a" stroke-width="${big ? 1.2 : 0.7}"/>${big ? `<text x="50" y="19.5" font-size="6" text-anchor="middle" fill="#2a241a" font-family="var(--sans)" font-weight="700">${i}</text>` : ''}</g>`; }).join('');
        face.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="obg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#d8c89a"/><stop offset=".7" stop-color="#9a8a5e"/><stop offset="1" stop-color="#5e5236"/></radialGradient></defs><circle cx="50" cy="50" r="47" fill="#3c3a32"/><g class="ob-ring" style="transform:rotate(${-(d.pos * 360) / OB_N}deg);transform-origin:50px 50px">${`<circle cx="50" cy="50" r="42" fill="url(#obg)"/>`}${ticks}<circle cx="50" cy="50" r="13" fill="#6f6346" stroke="#2a241a" stroke-width=".8"/><rect x="47.5" y="33" width="5" height="34" rx="2" fill="#4d4430"/></g><path d="M50 1 l-3.4 6 h6.8 z" fill="#c23a2b"/></svg>`;
        wrap.append(face);
        wrap.append(el('p', 'ob-now', `지금 눈금 ${d.pos}`));
        const trail = el('p', 'ob-trail', d.marks.length || d.dir ? `걸린 숫자 ${[...d.marks.map((m, i) => `${d.dirs[i] === 'R' ? '↻' : '↺'} ${m}`), d.dir ? `${d.dir === 'R' ? '↻' : '↺'} ${d.pos}…` : ''].filter(Boolean).join('  →  ')}` : '아직 돌리지 않았다');
        wrap.append(trail);
        const turn = (dir, n) => { if (d.dir && d.dir !== dir) { d.marks.push(d.pos); d.dirs.push(d.dir); } d.dir = dir; d.pos = (((d.pos + (dir === 'R' ? n : -n)) % OB_N) + OB_N) % OB_N; save(); };
        const row = el('div', 'ob-ctl');
        [['↺ 5', '왼쪽으로 다섯 눈금', 'L', 5], ['↺ 1', '왼쪽으로 한 눈금', 'L', 1], ['1 ↻', '오른쪽으로 한 눈금', 'R', 1], ['5 ↻', '오른쪽으로 다섯 눈금', 'R', 5]].forEach(([t, aria, dir, n]) => { const b = el('button', 'ctl', t); b.type = 'button'; b.setAttribute('aria-label', aria); b.onclick = () => turn(dir, n); row.append(b); });
        wrap.append(row);
        const reset = el('button', 'chip', '다이얼 놓고 0으로'); reset.type = 'button'; reset.onclick = () => { Object.assign(d, { pos: 0, dir: null, marks: [], dirs: [] }); save(); };
        wrap.append(reset);
        return wrap;
      },
      commitLabel: '뚜껑 당기기',
      canCommit: (d) => !!d.dir,
      check(d) {
        const seq = [...d.marks, d.pos], dirs = [...d.dirs, d.dir];
        const ok = seq.length === 2 && dirs[0] === OB_ANSWER.firstDir && dirs[1] !== OB_ANSWER.firstDir && seq[0] === OB_ANSWER.first && seq[1] === OB_ANSWER.second;
        Object.assign(d, { pos: 0, dir: null, marks: [], dirs: [] });
        if (ok) return { ok: true };
        return { ok: false, msg: '뚜껑이 덜컥하고 걸린다 다이얼이 0으로 돌아갔다' };
      },
      reveal: {
        title: '3월 14일',
        text: '뚜껑이 끽 소리를 내며 열렸다 거미줄 사이에 우표도 소인도 없는 봉투 한 장이 누워 있었다 우체국을 거치지 않고, 누가 손으로 넣고 간 것이다',
        scene: ['겉봉 앞엔 「어머니께」 뒷면 풀칠한 자리 옆에 볼펜 글씨 「2026/3/14 왔다 갑니다 문 앞에서 한참 있다가 그냥 갑니다」', '올해는 안 온 게 아니었다 아저씨한테 문자를 보내려다 말았다 이건 할머니가 먼저 알아야 했다'],
        unlock: null,
        unlockDoc: 'sixth',
      },
    },

    reply: {
      title: '할머니가 내민 빈 봉투',
      scene: 'alley',
      intro: '할머니 답장의 받는 사람 칸을 내가 채운다 칸마다 직접 적고 층은 골라 누른다 아래 버튼을 누르고 있는 동안 2023년 봉투를 뒤집어 마루 전구에 비춰 볼 수 있다',
      docs: ['envs', 'ledger', 'sixth', 'haerin'],
      hintCode: 'L-S05',
      hints: [
        '한 통에 다 있는 게 아니다 보내는 사람 칸을 다섯 통에서 한 칸씩 모아라',
        '작년 봉투 우편번호가 왜 안 갔는지는 대장 사유 칸에 있다 도장에 덮인 숫자는 종이 뒤에서 보면 남아 있다 뒤에서 본 글씨는 어떻게 보이는지 생각해라',
        '35217 · 산장길 31-2 · 2층 · 오정민',
      ],
      initial: () => ({ f: {} }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'reply-wrap');
        // 1) 2023 봉투를 뒤집어 전구에 비춰 보기 (누르고 있는 동안만)
        const lb = el('div', 'backlight');
        lb.innerHTML = `<figure class="prop lenv back"><img src="${P}props/envelope-back.webp" alt="2023년 봉투 뒷면" decoding="async"><span class="bl-glow"></span><canvas class="bl-zip" aria-hidden="true"></canvas></figure><p class="bl-cap">2023년 봉투 · 뒷면</p>`;
        const hold = el('button', 'ctl wide bl-hold', '전구에 대고 비춰 보기 (누르고 있기)'); hold.type = 'button';
        hold.setAttribute('aria-label', '2023년 봉투를 전구에 비춰 보기 (누르고 있기)');
        // 비친 숫자는 누르고 있는 동안만 캔버스에 그린다 뒤에서 본 글씨라 좌우가 뒤집혀 있다
        // 앞면 소인 도장 자국(끝 두 자리 위)은 늘 흐리게, 불빛에선 조금 진하게 비친다
        const cv = lb.querySelector('.bl-zip');
        const draw = (show) => {
          const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 3);
          if (!r.width) return;
          cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
          const g = cv.getContext('2d'); if (!g) return; g.clearRect(0, 0, cv.width, cv.height);
          const fam = getComputedStyle(cv).fontFamily || 'serif';
          let px = cv.height * 0.36; g.font = `${px}px ${fam}`;
          const chars = [...'35217'], gapOf = (p) => p * 0.32;
          const total = (p) => chars.reduce((a, c) => a + g.measureText(c).width, 0) + gapOf(p) * (chars.length - 1);
          if (total(px) > cv.width * 0.8) { px *= (cv.width * 0.8) / total(px); g.font = `${px}px ${fam}`; }
          const ws = chars.map((c) => g.measureText(c).width), gap = gapOf(px), tw = total(px);
          const xs = []; let x = (cv.width - tw) / 2; ws.forEach((w) => { xs.push(x); x += w + gap; });
          g.save(); g.translate(cv.width, 0); g.scale(-1, 1);
          const cx = (xs[3] + xs[4] + ws[4]) / 2, rad = Math.min(cv.height * 0.46, Math.max(px * 0.9, (xs[4] + ws[4] - xs[3]) * 0.7));
          g.beginPath(); g.arc(cx, cv.height / 2, rad, 0, Math.PI * 2); g.lineWidth = Math.max(2, px * 0.09); g.strokeStyle = show ? 'rgba(30,30,40,.26)' : 'rgba(30,30,40,.1)'; g.stroke();
          if (show) {
            g.fillStyle = 'rgba(43,53,112,.72)'; g.textBaseline = 'middle'; g.filter = 'blur(' + (0.5 * dpr).toFixed(1) + 'px)';
            chars.forEach((c, i) => g.fillText(c, xs[i], cv.height / 2));
          }
          g.restore();
        };
        requestAnimationFrame(() => draw(false));
        const on = () => { lb.classList.add('lit'); draw(true); lb.querySelector('.bl-cap').textContent = '2023년 봉투 · 뒷면 · 전구 빛에 비친 볼펜 자국'; };
        const off = () => { lb.classList.remove('lit'); draw(false); lb.querySelector('.bl-cap').textContent = '2023년 봉투 · 뒷면'; };
        hold.addEventListener('pointerdown', (e) => { e.preventDefault(); on(); });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => hold.addEventListener(t, off));
        hold.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); on(); } });
        hold.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') off(); });
        hold.addEventListener('contextmenu', (e) => e.preventDefault());
        lb.append(hold);
        wrap.append(lb);
        // 2) 봉투에 받는 사람 칸 적기
        const env = el('figure', 'prop lenv reply'); env.innerHTML = `<img src="${P}props/reply.webp" alt="소반 위의 빈 봉투와 볼펜" decoding="async"><span class="lenv-to written"><b data-k="zip"></b><b data-k="addr"></b><b data-k="name"></b></span>`;
        const paint = () => {
          const z = env.querySelector('[data-k="zip"]'), a = env.querySelector('[data-k="addr"]'), n = env.querySelector('[data-k="name"]');
          z.textContent = d.f.zip || '　'; z.classList.toggle('blank', !d.f.zip);
          a.textContent = d.f.lot || d.f.floor ? `수림군 산장면 산장길 ${d.f.lot || '　'}${d.f.floor ? ', ' + d.f.floor : ''}` : '　'; a.classList.toggle('blank', !(d.f.lot || d.f.floor));
          n.textContent = d.f.name ? `${d.f.name} 님` : '　'; n.classList.toggle('blank', !d.f.name);
        };
        paint();
        wrap.append(env);
        const form = el('div', 'reply-form');
        const field = (id, label, pre, post, attrs = {}) => {
          const row = el('label', 'rf-row'); row.append(el('span', 'rf-name', label));
          const box = el('span', 'rf-box'); if (pre) box.append(el('span', 'rf-pre', pre));
          const inp = el('input', 'v2-input rf-in'); inp.type = 'text'; inp.value = d.f[id] || ''; inp.setAttribute('aria-label', label); inp.autocomplete = 'off'; inp.spellcheck = false;
          Object.entries(attrs).forEach(([k, v]) => inp.setAttribute(k, v));
          inp.oninput = () => { d.f[id] = inp.value.trim(); paint(); };
          inp.onchange = () => { d.f[id] = inp.value.trim(); };
          box.append(inp); if (post) box.append(el('span', 'rf-pre', post));
          row.append(box); form.append(row);
        };
        field('zip', '우편번호', '', '', { inputmode: 'numeric', maxlength: '5', placeholder: '다섯 자리' });
        field('lot', '번지', '수림군 산장면 산장길', '', { maxlength: '8', placeholder: '번지' });
        const fr = el('div', 'rf-row'); fr.append(el('span', 'rf-name', '층'));
        const pr = el('div', 'pick-row'); ['1층', '2층', '3층'].forEach((o) => { const b = el('button', 'chip' + (d.f.floor === o ? ' on' : ''), o); b.type = 'button'; b.setAttribute('aria-label', `층: ${o}`); b.onclick = () => { d.f.floor = o; save(); }; pr.append(b); });
        fr.append(pr); form.append(fr);
        field('name', '받는 사람', '', '님', { maxlength: '8', placeholder: '이름' });
        wrap.append(form);
        return wrap;
      },
      commitLabel: '봉투 다 썼다',
      check(d) {
        const empty = FIELDS.find((fd) => !norm[fd.id](d.f[fd.id]));
        if (empty) return { ok: false, msg: `${empty.label} 칸이 아직 비어 있다` };
        if (FIELDS.every((fd) => norm[fd.id](d.f[fd.id]) === REPLY_ANS[fd.id])) return { ok: true };
        return { ok: false, msg: '이대로는 또 돌아온다 겉봉을 다시 본다' };
      },
      reveal: {
        title: '꽉 찬 봉투',
        text: '우편번호 다섯 자리, 군과 면과 길과 번지, 2층, 이름 석 자 다섯 해 동안 어느 봉투에도 온전히 적힌 적 없던 주소였다',
        scene: ['할머니가 봉투를 들고 한 자씩 따라 읽었다 그러고는 우표 붙일 자리에 손가락을 대고 한참 있었다'],
        ending: true,
        endingLabel: '봉투를 할머니께 건네고',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '감나무 아래 마루에서 오래된 봉투를 쥐고 앉은 할머니와 조금 떨어져 앉은 집배원',
    eyebrow: '2026/11/21 토요일, 해 질 녘',
    title: '돌아오지 않을 봉투',
    paragraphs: [
      '할머니는 첫 봉투를 뜯고 나서도 한참 안 읽었다 편지지를 펴서 무릎에 올려놓고 감나무만 봤다 손으로 넣고 간 여섯 번째 봉투는 맨 나중에 뜯었다',
      '“자네 먼저 가 봐 다 읽으면 답장 쓰고, 다 쓰면 대문 틈에 꽂아 둘게”',
      '“월요일 아침에 제가 가지러 올게요”',
      '“봉수 씨한테 말해 줘 불명이라고 찍어 준 거 알고 있었다고 고마웠다고”',
      '대문을 나서는데 할머니가 뒤에서 한 번 더 불렀다 “그 우편함 번호 이제 안 바꿀 거야 그 애가 아니까”',
      '월요일 아침, 대문 틈에 봉투가 꽂혀 있었다 우표는 두 장이었다 한 장이면 되는데 할머니가 하나 더 붙였다 나는 그 봉투를 수림 가는 자루 맨 위에 넣었다',
    ],
    afterword: '봉수 아저씨한테 문자를 보냈다 「올해도 왔었대요 할머니가 알고 계셨대요 고마웠대요」 답장은 한 시간 뒤에 왔다 「그래」 그게 다였다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=apartment', title: '404호의 불빛', line: '다음은 밤마다 켜지는 빈집 불빛 이야기입니다' },
  },
};
