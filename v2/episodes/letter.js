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
  ['2020. 11. 2', '미루동 17-14', '정○리', '수취인 이사', '발신인에게 반송'],
  ['2021. 2. 26', '미루동 71-4', '정○린', '주소 불명', '발신인에게 반송'],
  ['2021. 3. 19', '미루동 17-4', '정○린', '수취인 불명', '반송 불능 (발신 주소 미비) · 보관'],
  ['2021. 8. 11', '미루새길 9, 302호', '박○○', '수취 거절', '발신인에게 반송'],
  ['2022. 3. 18', '미루동 17-4', '정○린', '수취인 불명', '반송 불능 (발신 주소 미비) · 보관'],
  ['2023. 3. 17', '미루동 17-4', '정○린', '수취인 불명', '반송 불능 (우편번호 판독 불가) · 보관'],
  ['2023. 6. 2', '미루기록길 12', '미루기록관', '폐문', '발신인에게 반송'],
  ['2024. 3. 19', '미루동 17-4', '정○린', '수취인 불명', '반송 불능 (발신 주소 미비) · 보관'],
  ['2025. 3. 18', '미루동 17-4', '정○린', '수취인 불명', '반송 불능 (발신 우편번호 오기) · 보관'],
];
const LOCK_CODE = [0, 3, 1, 9];

// 다섯 통의 겉봉 — 보내는 사람 칸은 한 통도 온전하지 않다
const ENVS = [
  { y: 2021, mark: '2021. 3. 15', from: ['35217', '수림군 산장면 <s>▒▒▒ ▒▒▒</s>', '오정민'], note: '빗물에 주소 줄이 번졌다' },
  { y: 2022, mark: '2022. 3. 14', from: ['', '수림군 산장면 산장길 31-2, 1층', '정민'], note: '우편번호 칸이 비어 있다' },
  { y: 2023, mark: '2023. 3. 14', from: ['352<s>▒▒</s>', '수림군 산장면 산장길 31-2, 1층', '오정민'], note: '우편번호 끝 두 자리가 뭉개졌다' },
  { y: 2024, mark: '2024. 3. 14', from: ['35217', '수림군 산장면 산장길 3<s>▒-▒</s>, 2층', '정민'], note: '보내는 사람 칸 옆에 작게 「2층으로 옮겼어요」' },
  { y: 2025, mark: '2025. 3. 14', from: ['35271', '수림군 산장면 산장길 31-2, 2층', '오정민'], note: '' },
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
  ['127', '미루새길 9', '빌라 101~302호 · 우편함 공용'], ['128', '미루새길 9-1', '빌라 옆 골목 안 · 파란 대문'],
  ['129', '미루새길 11', ''], ['130', '미루새길 13', '개 있음'],
];
const ROUTE_OLD = [
  ['124', '미루동 17-1', ''], ['125', '미루동 17-2', ''], ['126', '미루동 17-4', '정 할머니 · 감나무 집'],
  ['127', '미루동 17-14', ''], ['128', '미루동 17-15', '개 있음'],
];
const STAFF_CODE = [1, 2, 8];

// 답장 봉투
const FIELDS = [
  { id: 'zip', label: '우편번호', opts: ['35217', '35271', '35212'], ans: '35217' },
  { id: 'addr', label: '주소', opts: ['산장길 31-2', '산장길 31', '산장길 13-2'], ans: '산장길 31-2' },
  { id: 'floor', label: '층', opts: ['1층', '2층'], ans: '2층' },
  { id: 'name', label: '받는 사람', opts: ['오정민', '정민', '오정'], ans: '오정민' },
];

const envHtml = (e) => `<figure class="prop lenv"><img src="${P}props/envelope.webp" alt="${e.y}년 봉투 앞면" decoding="async">
<span class="lenv-from"><i>보내는 사람</i>${e.from[0] ? `<b class="zip">${e.from[0]}</b>` : '<b class="zip empty">□□□□□</b>'}<span>${e.from[1]}</span><span>${e.from[2]}</span></span>
<span class="lenv-mark"><em>수림</em><em>${e.mark}</em></span>
<span class="lenv-to">미루동 17-4<br>정해린 님께</span>
<span class="lenv-sticker"><b>반송</b><small>수취인 불명</small><small class="pen">보관 · 김</small></span>
</figure>${e.note ? `<p class="aside">${e.y}년 · ${e.note}</p>` : `<p class="aside">${e.y}년</p>`}`;

export default {
  id: 'letter',
  number: '005',
  title: '반송된 편지',
  subtitle: '다섯 번 돌아온 봉투',
  genre: '우체국 · 주소 추적',
  minutes: 25,
  difficulty: 3,
  cover: P + 'cover.webp',
  coverAlt: '우체국 보관함 맨 아래 칸에 고무줄로 묶인 반송 편지 다섯 통',
  music: 'assets/music/letter-v33.mp3',
  tagline: '받는 사람 미루동 17-4 정해린\n다섯 해 동안 다섯 번 돌아왔다',
  blurb: '미루우체국이 다음 달 문을 닫습니다\n퇴임한 선배 집배원이 반송 보관함 맨 아래 칸의 편지 묶음 하나만은 주인을 찾아 달라고 부탁했습니다',
  storageKey: 'mihaeje-v2-letter',
  hintTitle: '봉수 아저씨의 문자',
  tracesLabel: '돌아온 편지가 갈 길',

  opening: {
    eyebrow: '11월 20일 금요일, 마감 뒤',
    paragraphs: [
      '미루우체국은 다음 달 중앙우체국으로 합쳐진다 구분실 짐을 상자에 담다가 휴대폰이 울렸다 지난달 퇴임한 봉수 아저씨였다 이 구역을 서른여덟 해 돈 사람이다',
      '반송 보관함 열쇠는 아저씨가 퇴임하면서 가져가 버렸고, 대신 보관함 문에 쪽지를 붙여 놨다고 했다 맨 아래 칸 묶음 하나만 부탁한다고',
      '반송 우편은 보관 기한이 지나면 폐기한다 그 묶음은 기한을 몇 번이나 넘긴 채 거기 있었다는 뜻이다',
    ],
    cta: '구분실 불 켜기',
  },

  traces: [
    { device: 'locker', label: '맨 아래 칸 묶음' },
    { device: 'rack', label: '그 집 칸' },
    { device: 'staffbox', label: '봉수 아저씨의 수첩' },
    { device: 'reply', label: '꽉 찬 봉투' },
  ],

  scenes: [
    {
      id: 'sorting',
      name: '미루우체국 구분실',
      image: P + 'sorting.webp',
      arrive: '형광등 두 개 중 하나는 깜박거린다 벽 하나를 다 차지한 구분함, 왼쪽의 회색 반송 보관함, 책상 위에 펼쳐진 반송 대장 서른여덟 해 동안 아저씨가 매일 아침 서 있던 자리다',
      hotspots: [
        { id: 'phone', x: 7, y: 90, label: '봉수 아저씨 문자', kind: 'doc', doc: 'chat' },
        { id: 'bmemo', x: 9, y: 30, label: '보관함 문에 붙은 쪽지', kind: 'doc', doc: 'bmemo' },
        { id: 'locker', x: 14, y: 46, label: '반송 보관함', kind: 'device', device: 'locker' },
        { id: 'ledger', x: 36, y: 80, label: '반송 대장', kind: 'doc', doc: 'ledger' },
        { id: 'notice', x: 81, y: 33, label: '게시판의 주소 안내', kind: 'doc', doc: 'notice' },
        { id: 'envs', x: 22, y: 64, label: '다섯 통의 겉봉', kind: 'doc', doc: 'envs', visible: (S) => S.solved.includes('locker') },
        { id: 'forward', x: 47, y: 62, label: '묶음에 끼워진 신청서', kind: 'doc', doc: 'forward', visible: (S) => S.solved.includes('locker') },
        { id: 'rack', x: 58, y: 30, label: '구분함', kind: 'device', device: 'rack', visible: (S) => S.solved.includes('locker') },
      ],
    },
    {
      id: 'breakroom',
      name: '집배원 휴게실',
      image: P + 'breakroom.webp',
      unlockedBy: 'rack',
      arrive: '휴게실엔 아직 아저씨 우비가 걸려 있다 사물함 여섯 칸 중 맨 끝 칸만 자물쇠가 달려 있고, 이름표 자리는 비어 있다',
      hotspots: [
        { id: 'route', x: 68, y: 30, label: '못에 걸린 순로표', kind: 'doc', doc: 'route' },
        { id: 'photo', x: 93, y: 20, label: '벽의 단체 사진', kind: 'doc', doc: 'photo' },
        { id: 'staffbox', x: 53, y: 47, label: '맨 끝 사물함', kind: 'device', device: 'staffbox' },
      ],
    },
    {
      id: 'alley',
      name: '미루새길 골목',
      image: P + 'alley.webp',
      unlockedBy: 'staffbox',
      arrive: '토요일 오후 미루새길 9는 삼 층짜리 빌라다 그 옆, 사람 하나 겨우 지나갈 틈 안쪽에 파란 대문이 있다 담 너머로 감나무가 휘어 있다',
      hotspots: [
        { id: 'mailboxes', x: 88, y: 66, label: '빌라 우편함', kind: 'doc', doc: 'mailboxes' },
        { id: 'gate', x: 60, y: 70, label: '파란 대문', kind: 'doc', doc: 'haerin' },
        { id: 'reply', x: 40, y: 86, label: '할머니가 내민 빈 봉투', kind: 'device', device: 'reply', visible: (S) => S.read.includes('haerin') },
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
<div class="chat-row them"><span class="chat-avatar">봉</span><div class="chat-col"><span class="chat-name">김봉수 주무관님</span><div class="chat-bubble">편지 다섯통</div><div class="chat-bubble">내가 못한 거다 주인 찾아줘라</div><div class="chat-bubble">뜯지는 말고</div></div><span class="chat-time">오후 6:44</span></div>
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
      html: `<figure class="prop ledgerphoto"><img src="${P}props/ledger.webp" alt="펼쳐진 반송 대장" decoding="async"></figure><div class="paper-table ledger-table"><p class="pt-head">반송 우편 처리 대장 (발췌) · 받는 사람 이름은 가려 적음</p><table><tr><th>처리일</th><th>받는 곳</th><th>받는 사람</th><th>사유</th><th>처리</th></tr>${LEDGER.map((r) => `<tr>${r.map((c, i) => `<td class="${i === 0 || i === 1 ? 'hand-cell' : ''}">${c}</td>`).join('')}</tr>`).join('')}</table><p class="pt-foot">처리 담당 김봉수 · 반송 불능 우편은 1년 보관 뒤 폐기</p></div>`,
    },
    notice: {
      title: '게시판의 주소 안내',
      kind: '2020년 7월 게시 · 누렇게 바램',
      html: `<div class="paper-table"><p class="pt-head">미루동 도로명 주소 바뀜 안내 (7구)</p><table><tr><th>옛 지번</th><th>도로명 주소</th></tr><tr><td>미루동 17-1 ~ 17-3</td><td>미루새길 1 ~ 7</td></tr><tr><td>미루동 17-4</td><td>미루새길 9</td></tr><tr><td>미루동 17-4-1</td><td>미루새길 9-1</td></tr><tr><td>미루동 17-14</td><td>미루새길 11</td></tr><tr><td>미루동 71-4</td><td>미루기록길 21</td></tr></table><p class="pt-foot">※ 미루동 17-4는 2020년 6월 앞뒤 두 필지로 나뉨 길가 쪽 새 빌라가 17-4, 안쪽 옛집이 17-4-1</p></div>`,
    },
    envs: {
      title: '다섯 통의 겉봉',
      kind: '맨 아래 칸 묶음 · 뜯지 않음',
      html: () => { const k = 'e' + Math.random().toString(36).slice(2, 7); return `<p>고무줄을 풀어 다섯 통을 나란히 놓았다 받는 곳은 다섯 번 다 같다 보내는 사람 칸은 한 통도 온전하지 않다</p><div class="envtabs">${ENVS.map((e, i) => `<input type="radio" name="${k}" id="${k}${i}"${i === 0 ? ' checked' : ''}><label for="${k}${i}">${e.y}</label>`).join('')}${ENVS.map((e) => `<div class="envpanel">${envHtml(e)}</div>`).join('')}</div>`; },
    },
    forward: {
      title: '묶음에 끼워진 신청서',
      kind: '우편물 전송 신청서 사본 · 2020년',
      html: `<div class="paper-table"><p class="pt-head">우편물 전송 신청서 (사본)</p><table><tr><th>신청인</th><td>정해린</td></tr><tr><th>원래 주소</th><td>미루동 17-4</td></tr><tr><th>받을 곳</th><td class="hand-cell">같은 번지 뒤채 (앞집 헐고 빌라 들어섬)</td></tr><tr><th>전송 기간</th><td>2020. 7. 1 ~ 2021. 6. 30</td></tr></table><p class="pt-foot">접수 김봉수</p></div><p class="aside">사본 귀퉁이에 볼펜으로 「1년 지나면 끝」</p>`,
    },
    hcard: {
      title: '9-1 칸의 쪽지',
      kind: '창구에 맡기고 간 것 · 11월 13일',
      html: `<blockquote class="hand">김봉수 씨께<br>그 편지 아직 가지고 계시면<br>갖다 주세요<br>이제는 받겠습니다<br>— 정해린 미루새길 9-1</blockquote><p class="aside">창구 직원이 「봉수 주무관님께 전달」이라고 적어 그 집 칸에 꽂아 둔 것 같다 아저씨는 이미 퇴임한 뒤였다</p>`,
    },
    route: {
      title: '못에 걸린 순로표',
      kind: '7구 배달 순서 · 두 장 겹쳐 있음',
      html: `<figure class="prop clipphoto"><img src="${P}props/clipboard.webp" alt="못에 걸린 클립보드" decoding="async"></figure><div class="paper-table"><p class="pt-head">7구 순로표 (2026년 개정) · 미루새길 구간</p><table><tr><th>순번</th><th>주소</th><th>메모</th></tr>${ROUTE_NOW.map((r) => `<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table></div><div class="paper-table old"><p class="pt-head">7구 순로표 (2019년) · 밑에 깔린 옛날 것</p><table><tr><th>순번</th><th>주소</th><th>메모</th></tr>${ROUTE_OLD.map((r) => `<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table></div>`,
    },
    photo: {
      title: '벽의 단체 사진',
      kind: '액자 아래 글씨',
      html: `<figure class="prop"><img src="${P}breakroom.webp" alt="휴게실 벽, 집배원 단체 사진 액자" decoding="async"></figure><p>2009년 미루우체국 집배원 일곱 명 맨 왼쪽, 오토바이 헬멧을 옆구리에 낀 사람이 봉수 아저씨다 액자 밑에 누가 매직으로 덧써 놨다 「38년 · 10월 30일 퇴임 · 사물함 비번 아무도 모름」</p>`,
    },
    notebook: {
      title: '봉수 아저씨의 수첩',
      kind: '맨 끝 사물함 · 업무 수첩 마지막 장들',
      html: `<blockquote class="hand">2020. 6. 20 정 할머니 앞집 헐고 빌라 들어섬 할머니는 뒤채로 전송 신청 받아 줌<br><br>2021. 3. 19 수림에서 정 할머니 앞 편지 보낸 사람 아드님 정민 씨<br>할머니가 안 받으신다 함 「그 애 편지 받으면 내가 지는 거다」<br>거절 도장을 찍으면 아드님이 알 거다 17-4는 이제 빌라 번지라 불명이 틀린 말도 아니고<br>보내는 사람 칸이 반쪽이라 돌려보낼 데도 없음 보관<br><br>2022. 3. 18 또 옴 할머니 겉봉만 한참 보시다 그래도 돌려보내라 하심<br><br>2023. 3. 17 할머니 생신이 3월 14일 그날 맞춰 부치는 것 같다<br><br>2024. 3. 19 2층으로 옮겼다고 겉봉에 써 있다 다섯 통 겉봉 합치면 주소 다 나오는데<br>그건 내 일이 아니라고 생각했다<br><br>2025. 3. 18 다섯 통째<br><br>2026. 3 올해는 안 옴<br><br>2026. 10. 30 퇴임 묶음은 못 버렸다<br><br>2026. 11. 14 국장님 전화 할머니가 쪽지 두고 가셨단다 나는 이제 우체국 사람이 아니다 재희한테</blockquote>`,
    },
    mailboxes: {
      title: '빌라 우편함',
      kind: '미루새길 9',
      html: `<div class="paper-table"><p class="pt-head">미루새길 9 우편함</p><table><tr><td>101 김○○</td><td>102 (빈집)</td></tr><tr><td>201 박○○</td><td>202 이○○</td></tr><tr><td>301 최○○</td><td>302 박○○</td></tr></table></div><p>정해린이라는 이름은 없다 우편함 옆 벽에 누가 화살표를 그려 놨다 「뒤채 우편은 골목 안 파란 대문 틈으로」</p>`,
    },
    haerin: {
      title: '파란 대문',
      kind: '정해린 · 미루새길 9-1',
      html: `<p>문을 두 번 두드리자 한참 뒤에 대문이 열렸다 작은 할머니가 내 우체국 점퍼부터 봤다</p><blockquote>"봉수 씨는?"</blockquote><blockquote>"지난달에 퇴임하셨어요 이거 전해 달라고 하셨어요"</blockquote><p>할머니는 묶음을 받아 고무줄 위로 손바닥을 한 번 쓸었다</p><blockquote>"앞집 땅을 그 애가 팔았어 내가 병원에 누워 있을 때 도장 찍고 나 살 데는 뒤채면 된다고 그게 서운해서 받지 말라 했지"</blockquote><blockquote>"다섯 번을 돌려보냈는데 다섯 번을 또 보내더라 올봄엔 안 오길래 그제야 겁이 났어"</blockquote><p>할머니는 봉투를 뜯지 않고 무릎에 내려놓았다 마루 소반 위에 빈 봉투 한 장과 볼펜이 있었다</p><blockquote>"답장을 쓸 거야 근데 눈이 침침해서 주소는 못 쓰겠어 그 애 주소는 나도 몰라 겉봉에 다 있다며 봉투는 자네가 써 줘 이번엔 돌아오지 않게"</blockquote>`,
    },
    final: {
      title: '열흘 뒤 온 봉투',
      kind: '미루새길 9-1 앞 · 반송 스티커 없음',
      locked: true,
      html: `<figure class="prop lenv"><img src="${P}props/envelope.webp" alt="열흘 뒤 수림에서 온 봉투" decoding="async"><span class="lenv-from full"><i>보내는 사람</i><b class="zip">35217</b><span>수림군 산장면 산장길 31-2, 2층</span><span>오정민</span></span><span class="lenv-mark"><em>수림</em><em>2026. 12. 1</em></span><span class="lenv-to">미루새길 9-1<br>정해린 님께</span></figure><p>보내는 사람 칸이 처음으로 꽉 차 있다 받는 곳도 새 주소다 봉투 뒷면, 풀칠한 자리 옆에 작은 글씨가 있었다</p><blockquote class="hand">3월 14일엔 제가 갈게요</blockquote><p class="aside">뜯지는 않았다 남의 편지다 9-1 대문 틈으로 밀어 넣었다</p>`,
    },
  },

  devices: {
    locker: {
      title: '반송 보관함',
      scene: 'sorting',
      intro: '네 자리 황동 다이얼 쪽지대로면 번호는 그 묶음이 처음 돌아온 날, 월일 넷이다',
      docs: ['bmemo', 'ledger'],
      hintCode: 'L-S01',
      hints: [
        '대장에서 그 집 앞으로 온 줄만 골라라 번지 비슷한 게 많다 이름도 가려 놨고',
        '미루동 17-4 딱 그 번지, 정○린 다섯 줄이 있지 그중 제일 먼저 돌아온 거',
        '2021년 3월 19일 0319',
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
        if (s === '1102') return { ok: false, msg: '안 열린다 그 줄은 17-14다 번지 하나 차이로 다른 집이다' };
        if (s === '0226') return { ok: false, msg: '안 열린다 71-4 숫자 순서가 다르다' };
        if (['0318', '0317'].includes(s)) return { ok: false, msg: '안 열린다 그 집 줄은 맞는데 처음 돌아온 날이 아니다' };
        return { ok: false, msg: '안 열린다 대장에서 그 집 줄을 다시 본다' };
      },
      reveal: {
        title: '0319',
        text: '손잡이가 내려갔다 맨 아래 칸에 고무줄로 묶은 편지 다섯 통 다섯 통 다 노란 반송 스티커가 붙어 있고, 묶음 사이에 접힌 종이 한 장이 끼워져 있었다',
        scene: ['받는 곳은 다섯 번 다 미루동 17-4 정해린 님 우체국에서 일하면 한 해에 반송을 수천 통 보는데, 같은 사람이 같은 날짜에 다섯 해를 보낸 건 처음 봤다'],
        unlock: null,
      },
    },

    rack: {
      title: '구분함',
      scene: 'sorting',
      intro: '할머니가 지금 어디 사는지부터 알아야 한다 그 집 앞으로 오는 우편이 꽂히는 칸을 찾는다',
      docs: ['notice', 'forward', 'envs'],
      hintCode: 'L-S02',
      hints: [
        '게시판 안내 밑에 작게 적힌 거 봐라 17-4가 2020년에 둘로 쪼개졌다',
        '할머니가 길가 빌라 쪽인지 안쪽 옛집인지는 묶음에 끼워 둔 전송 신청서에 있다',
        '미루새길 9-1 칸',
      ],
      initial: () => ({ pick: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop rackphoto'); const im = el('img'); im.src = P + 'props/rack.webp'; im.alt = '4칸 4줄 구분함'; wrap.append(im);
        const cols = [14.5, 38.3, 61.7, 85.2], rows = [3.2, 27.2, 50.8, 74.6];
        RACK.forEach((lab, i) => {
          const b = el('button', 'rack-slot' + (d.pick === lab ? ' picking' : '')); b.type = 'button';
          b.style.left = cols[i % 4] + '%'; b.style.top = rows[Math.floor(i / 4)] + '%';
          b.setAttribute('aria-label', `${lab} 칸`); b.innerHTML = `<span class="rack-label">${lab}</span>`;
          b.onclick = () => { d.pick = d.pick === lab ? null : lab; save(); };
          wrap.append(b);
        });
        const box = el('div', 'rack-wrap'); box.append(wrap, el('p', 'pick-label', d.pick ? `${d.pick} 칸을 골랐다` : '칸 위의 이름표를 누른다'));
        return box;
      },
      commitLabel: '이 칸을 뒤져 보기',
      canCommit: (d) => !!d.pick,
      check(d) {
        if (d.pick === RACK_ANSWER) return { ok: true };
        if (d.pick === '미루새길 9') return { ok: false, msg: '빌라 1층부터 3층 집 우편뿐이다 할머니 이름은 없다 할머니가 빌라에 사는 게 맞나' };
        if (d.pick === '미루새길 11') return { ok: false, msg: '11은 옛 17-14다 번지 하나 차이' };
        if (d.pick === '미루기록길 21') return { ok: false, msg: '기록길 21은 옛 71-4다' };
        if (d.pick === '반송') return { ok: false, msg: '반송 칸은 이제 비어 있다 묶음은 이미 꺼냈다' };
        return { ok: false, msg: '할머니 집 칸이 아니다 옛 지번이 지금 무슨 주소가 됐는지부터 본다' };
      },
      reveal: {
        title: '미루새길 9-1',
        text: '9-1 칸에는 광고지 두 장과 손글씨 쪽지 한 장이 꽂혀 있었다 받는 사람은 김봉수 씨 쓴 사람은 정해린',
        scene: ['이제는 받겠다고 했다 그럼 왜 다섯 번이나 돌아온 걸까 아저씨가 「내가 못 한 거다」라고 한 말이 걸렸다 휴게실 맨 끝 사물함은 아저씨 거다'],
        unlock: 'breakroom',
        unlockDoc: 'hcard',
      },
    },

    staffbox: {
      title: '맨 끝 사물함',
      scene: 'breakroom',
      intro: '세 자리 자물쇠 아무도 비번을 모른다는 사물함이다 문자 한 통이 더 와 있었다 「내 사물함 수첩 봐라 비번은 그 할머니 집 순로 번호 요즘 걸로」',
      docs: ['route', 'hcard', 'notice'],
      hintCode: 'L-S03',
      hints: [
        '순로표가 두 장이다 위에 걸린 게 올해 거, 밑에 깔린 게 옛날 거',
        '올해 순로표에서 할머니 집을 찾아라 앞 빌라 말고 그 안쪽 집',
        '128',
      ],
      initial: () => ({ dial: [0, 0, 0] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop staffphoto'); wrap.innerHTML = `<img src="${P}props/staffbox.webp" alt="이름표 없는 사물함과 세 자리 자물쇠" decoding="async">`;
        const box = el('div', 'letterlock-wrap'); box.append(wrap, dialRow(el, save, d, 3));
        return box;
      },
      commitLabel: '자물쇠 당기기',
      check(d) {
        const s = d.dial.join('');
        if (s === STAFF_CODE.join('')) return { ok: true };
        if (s === '126') return { ok: false, msg: '안 열린다 126은 2019년 순로표 번호다 요즘 걸로라고 했다' };
        if (s === '127') return { ok: false, msg: '안 열린다 127은 앞 빌라다' };
        return { ok: false, msg: '자물쇠가 꿈쩍 않는다 순로표를 다시 본다' };
      },
      reveal: {
        title: '128',
        text: '자물쇠가 빠졌다 사물함 안은 거의 비었고 업무 수첩 한 권만 세워져 있었다 마지막 장들에 정 할머니 얘기가 띄엄띄엄 적혀 있다',
        scene: ['아저씨는 「수취 거절」 도장 대신 「수취인 불명」을 찍었다 거절은 받는 사람이 싫다는 뜻이고, 불명은 그냥 못 찾았다는 뜻이다 아들이 어느 쪽으로 받아들일지 알았던 거다'],
        unlock: 'alley',
        unlockDoc: 'notebook',
      },
    },

    reply: {
      title: '할머니가 내민 빈 봉투',
      scene: 'alley',
      intro: '보내는 사람 칸은 내가 대신 채운다 아들 주소는 다섯 통 겉봉에 조각조각 있다 이번엔 돌아오면 안 된다',
      docs: ['envs', 'ledger', 'haerin'],
      hintCode: 'L-S04',
      hints: [
        '한 통에 다 있는 게 아니다 보내는 사람 칸을 다섯 통에서 한 칸씩 모아라',
        '번진 데는 다른 해 봉투에서 찾고, 이사했으면 제일 나중 걸로, 작년 봉투 우편번호가 왜 안 갔는지는 대장 사유 칸에 있다',
        '35217 · 산장길 31-2 · 2층 · 오정민',
      ],
      initial: () => ({ f: {} }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'reply-wrap');
        const env = el('figure', 'prop lenv reply'); env.innerHTML = `<img src="${P}props/reply.webp" alt="소반 위의 빈 봉투와 볼펜" decoding="async"><span class="lenv-to written">${['zip', 'addr', 'floor', 'name'].map((k) => d.f[k] ? `<b>${k === 'addr' ? '수림군 산장면 ' + d.f[k] : d.f[k]}${k === 'name' ? ' 님' : ''}</b>` : '<b class="blank">　</b>').join('')}</span>`;
        wrap.append(env);
        FIELDS.forEach((fd) => {
          const row = el('div', 'gift-row'); row.append(el('span', 'gift-name', fd.label));
          const pr = el('div', 'pick-row');
          fd.opts.forEach((o) => { const b = el('button', 'chip' + (d.f[fd.id] === o ? ' on' : ''), o); b.type = 'button'; b.setAttribute('aria-label', `${fd.label}: ${o}`); b.onclick = () => { d.f[fd.id] = o; save(); }; pr.append(b); });
          row.append(pr); wrap.append(row);
        });
        return wrap;
      },
      commitLabel: '봉투 다 썼다',
      check(d) {
        const empty = FIELDS.find((fd) => !d.f[fd.id]);
        if (empty) return { ok: false, msg: `${empty.label} 칸이 아직 비어 있다` };
        if (FIELDS.every((fd) => d.f[fd.id] === fd.ans)) return { ok: true };
        if (d.f.zip === '35271') return { ok: false, msg: '작년 봉투에 적힌 우편번호다 그 봉투가 왜 못 돌아갔는지 대장에 적혀 있었다' };
        if (d.f.floor === '1층') return { ok: false, msg: '1층은 예전 주소다 그 뒤로 옮겼다는 봉투가 있었다' };
        if (d.f.addr !== '산장길 31-2') return { ok: false, msg: '번지가 다르다 번지가 온전히 적힌 봉투를 다시 본다' };
        if (d.f.name !== '오정민') return { ok: false, msg: '받는 사람은 이름 석 자로 쓴다' };
        return { ok: false, msg: '이대로는 또 돌아온다 겉봉을 다시 본다' };
      },
      reveal: {
        title: '꽉 찬 봉투',
        text: '우편번호 다섯 자리, 군과 면과 길과 번지, 2층, 이름 석 자 다섯 해 동안 한 번도 꽉 차 본 적 없는 칸이었다',
        scene: ['할머니가 봉투를 들고 한 자씩 따라 읽었다 그러고는 우표 붙일 자리에 손가락을 대고 한참 있었다'],
        ending: true,
        endingLabel: '할머니 답장을 받아 들고',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '감나무 아래 마루에서 오래된 봉투를 쥐고 앉은 할머니와 조금 떨어져 앉은 집배원',
    eyebrow: '11월 21일 토요일, 해 질 녘',
    title: '돌아오지 않을 봉투',
    paragraphs: [
      '할머니는 첫 봉투를 뜯고 나서도 한참 안 읽었다 편지지를 펴서 무릎에 올려놓고 감나무만 봤다',
      '"자네 먼저 가 봐 다 읽으면 답장 쓰고, 다 쓰면 대문 틈에 꽂아 둘게"',
      '"월요일 아침에 제가 가지러 올게요"',
      '"봉수 씨한테 말해 줘 불명이라고 찍어 준 거 알고 있었다고 고마웠다고"',
      '월요일 아침, 대문 틈에 봉투가 꽂혀 있었다 우표는 두 장이었다 한 장이면 되는데 할머니가 하나 더 붙였다 나는 그 봉투를 수림 가는 자루 맨 위에 넣었다',
    ],
    afterword: '봉수 아저씨한테 문자를 보냈다 「할머니가 알고 계셨대요 고마웠대요」 답장은 한 시간 뒤에 왔다 「그래」 그게 다였다',
    unlockDoc: 'final',
    next: { href: 'episode.html?case=apartment', title: '404호의 불빛', line: '다음은 밤마다 켜지는 빈집 불빛 이야기입니다' },
  },
};
