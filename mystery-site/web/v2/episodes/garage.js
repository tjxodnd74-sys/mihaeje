// 마지막 정비소 — ★5 안내 없음, 힌트 2단계, 함정 여럿 이야기·자료·장치가 전부 이 파일에 있습니다
const P = 'assets/v2/garage/';

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

// 블랙박스 프레임 (표시 시각은 서버보다 7분 빠르다)
const FRAMES = [
  { id: 'f0', t: '21:42:30', img: 'cam3', what: '남색 재킷, 배낭 측문에서 나와 길 쪽으로' },
  { id: 'f1', t: '21:47:05', img: 'cam2', what: '회색 계열 재킷 측문에서 나와 길 쪽으로 소매는 그늘에 가려 안 보인다 셔터는 반쯤 내려감' },
  { id: 'f2', t: '21:53:20', img: 'cam1', what: '회색 계열 재킷 측문을 밀고 들어감 왼 소매에서 뭔가 번쩍임' },
  { id: 'f3', t: '21:55:20', img: 'cam2', what: '회색 계열 재킷 측문에서 나옴 오른손에 작은 것' },
  { id: 'f4', t: '22:07:00', img: 'cam1', what: '회색 계열 재킷 측문을 밀고 들어감 왼 소매에서 다시 번쩍임' },
  { id: 'f5', t: '22:21:40', img: 'cam0', what: '아무도 없음 셔터 내려감' },
];
const CAM_ANSWER = ['f2', 'f3'];
// 백업 단말: 블랙박스 시계를 서버 시계에 맞춰 겹쳐 본다 (블박이 7분 빠름 → −7분에서 출입이 다 겹친다)
const SYNC_ANSWER = -7;
const SRV = [['21:30:40', '퇴', '04'], ['21:35:10', '퇴', '07-B'], ['21:40:00', '퇴', '09'], ['22:00:05', '입', '09'], ['22:12:30', '퇴', '09']];
const CAMDIR = { f0: '퇴', f1: '퇴', f2: '입', f3: '퇴', f4: '입', f5: '' };
const toSec = (t) => { const [h, m, x] = t.split(':').map(Number); return h * 3600 + m * 60 + x; };
function syncSvg(off) {
  const t0 = toSec('21:26:00'), span = 56 * 60;
  const X = (sec) => 4 + ((sec - t0) / span) * 92;
  let s = '<svg viewBox="0 0 100 44" class="sync-svg" role="img" aria-label="위는 블랙박스 출입, 아래는 출입 서버 기록 같은 시간 축">';
  s += '<line x1="4" y1="22" x2="96" y2="22" stroke="#4a5560" stroke-width=".3"/>';
  for (let m = 30; m <= 80; m += 5) { const sec = toSec('21:00:00') + m * 60; const x = X(sec); const hh = 21 + Math.floor(m / 60), mm = m % 60; s += `<line x1="${x}" y1="21" x2="${x}" y2="23" stroke="#6b7782" stroke-width=".25"/><text x="${x}" y="26.4" font-size="2" text-anchor="middle" fill="#8d979f" font-family="ui-monospace,monospace">${hh}:${String(mm).padStart(2, '0')}</text>`; }
  s += '<text x="4" y="5" font-size="2.4" fill="#f2b134" font-family="SUIT,sans-serif">블랙박스 (표시 시각을 옮겨 봄)</text><text x="4" y="42.5" font-size="2.4" fill="#9be8a5" font-family="SUIT,sans-serif">출입 서버</text>';
  FRAMES.forEach((f, i) => { if (!CAMDIR[f.id]) return; const x = X(toSec(f.t) + off * 60); if (x < 2 || x > 98) return; s += `<line x1="${x}" y1="9" x2="${x}" y2="20" stroke="#f2b134" stroke-width=".5"/><text x="${x}" y="8.2" font-size="2.3" text-anchor="middle" fill="#f2b134" font-family="SUIT,sans-serif">${i + 1}${CAMDIR[f.id] === '입' ? '↓' : '↑'}</text>`; });
  SRV.forEach(([t, dir, card]) => { const x = X(toSec(t)); s += `<line x1="${x}" y1="28" x2="${x}" y2="35" stroke="#9be8a5" stroke-width=".5"/><text x="${x}" y="38.2" font-size="2.1" text-anchor="middle" fill="#9be8a5" font-family="SUIT,sans-serif">${card}${dir === '입' ? '↓' : '↑'}</text>`; });
  return s + '</svg>';
}
const SAFE_CODE = [0, 4, 0, 7]; // 개업일 2009/4/7 (사업자등록 3/30은 함정)
const JACKETS = [
  { id: 'navy', name: '남색 재킷', tag: '한지수', note: '소매에 띠 없음 안주머니에 재발급 카드 07-B' },
  { id: 'charcoal', name: '진회색 재킷', tag: '강민호', note: '소매에 띠 없음 안주머니에 본사 출입증' },
  { id: 'stripe', name: '회색 재킷 · 왼 소매 반사띠', tag: '박정호', note: '왼 소매 반사띠 안주머니 비어 있음, 주머니 바닥에 SD카드 보호 케이스 뚜껑' },
];
const REPORT = [
  { id: 'card', label: '① 21:46 측문으로 들어간 카드', opts: [['07b', '07-B'], ['07a', '07-A'], ['09', '09']], ans: '07a' },
  { id: 'from', label: '② 그 카드가 그 전에 있던 곳', opts: [['pocket', '지수 주머니'], ['safe', '사무실 금고 봉투'], ['floor', '작업장 바닥']], ans: 'safe' },
  { id: 'wear', label: '③ 들어간 사람이 입은 것', opts: [['navy', '남색 재킷'], ['charcoal', '진회색 재킷'], ['stripe', '왼 소매 반사띠 회색 재킷']], ans: 'stripe' },
  { id: 'again', label: '④ 같은 재킷이 다시 찍힌 출입 (서버 기준)', opts: [['2135', '21:35 07-B 퇴장'], ['2140', '21:40 09 퇴장'], ['2200', '22:00 09 입장']], ans: '2200' },
  { id: 'who', label: '⑤ 그래서 카드를 꺼낸 사람', opts: [['jisu', '한지수'], ['minho', '강민호'], ['boss', '박정호']], ans: 'boss' },
];

export default {
  id: 'garage',
  number: '001',
  title: '마지막 정비소',
  subtitle: '사라진 SD카드',
  genre: '추리 · 알리바이',
  minutes: 35,
  difficulty: 5,
  cover: P + 'yard.webp',
  coverAlt: '비 온 밤, 셔터가 반쯤 열린 정비소 앞에 선 차',
  music: 'assets/music/garage-v33.mp3',
  tagline: '21:40엔 있었고 22:00엔 없었다\n그 사이 들어온 사람은 기록상 한 명',
  blurb: '폐업 전날 밤, 고객 서연의 부품 교체 사진이 든 SD카드가 보관함에서 사라졌습니다\n블랙박스 시계는 틀려 있고, 출입 기록 두 줄은 암호화돼 있고, 세 사람은 각자 할 말이 있습니다',
  storageKey: 'mihaeje-v2-garage',
  hintTitle: '서연의 문자',
  tracesLabel: '정비소에 남은 것',

  opening: {
    eyebrow: '9월 19일, 폐업 당일 아침',
    paragraphs: [
      '미루정비소가 오늘 문을 닫는다 어젯밤 고객 서연의 SD카드가 직원 보관함에서 사라졌다 서연의 차 부품을 바꿀 때 찍은 교체 전후 사진이 든 카드다 서연은 교체에 동의한 적이 없다고 한다',
      '사장 박정호는 21:40 재고 점검 때 카드를 봤고, 22:00 최종 점검 때 없었다고 했다 그 사이 출입 서버에는 두 줄이 남았는데 폐업 처리 중 암호화가 걸려 읽을 수 없다 CCTV는 전날 철거됐다',
      '서연은 보험사 조사원인 나한테 부탁했다 "경찰 부르기 전에 누가 가져갔는지만 알고 싶어요" 서연의 차는 어젯밤 정비소 앞마당에 세워져 있었고, 그 차의 블랙박스는 켜져 있었다',
      '사장은 아침 열 시까지 정비소를 열어 두겠다고 했다 세 사람 다 나와 있다',
    ],
    cta: '앞마당으로',
  },

  traces: [
    { device: 'cam', label: '블랙박스' },
    { device: 'terminal', label: '두 시계' },
    { device: 'safe', label: '금고' },
    { device: 'jackets', label: '재킷' },
    { device: 'report', label: '보고' },
  ],

  scenes: [
    {
      id: 'yard',
      name: '앞마당',
      image: P + 'yard.webp',
      arrive: '비는 그쳤고 바닥은 아직 젖어 있다 셔터는 반쯤 열려 있고 그 옆에 측문 서연의 차는 어젯밤 그 자리 그대로다 블랙박스가 앞유리 안쪽에서 깜박인다',
      hotspots: [
        { id: 'brief', x: 8, y: 90, label: '서연과 주고받은 문자', kind: 'doc', doc: 'brief' },
        { id: 'cam', x: 22, y: 52, label: '서연 차의 블랙박스', kind: 'device', device: 'cam' },
        { id: 'receipt', x: 30, y: 70, label: '앞유리에 끼워진 점검 영수증', kind: 'doc', doc: 'receipt' },
        { id: 'people', x: 62, y: 60, label: '셔터 앞의 세 사람', kind: 'doc', doc: 'people' },
        { id: 'go-office', x: 46, y: 40, label: '사무실로', kind: 'travel', to: 'office' },
        { id: 'go-shop', x: 70, y: 40, label: '작업장으로', kind: 'travel', to: 'shop' },
        { id: 'report', x: 90, y: 88, label: '서연에게 보고', kind: 'device', device: 'report', visible: (S) => ['cam', 'terminal', 'safe', 'jackets'].every((x) => S.solved.includes(x)) },
      ],
    },
    {
      id: 'office',
      name: '사무실',
      image: P + 'office.webp',
      arrive: '책상 위 모니터에 출입 서버 화면이 떠 있다 벽에는 재킷 세 벌, 기념패 하나 책상 밑에 금고 서류함에는 인계 문서와 신고서 뭉치',
      hotspots: [
        { id: 'server', x: 18, y: 48, label: '출입 서버 화면', kind: 'doc', doc: 'server' },
        { id: 'handover', x: 30, y: 72, label: '폐업 인계 문서', kind: 'doc', doc: 'handover' },
        { id: 'lost', x: 84, y: 72, label: '서류함의 분실 신고서', kind: 'doc', doc: 'lost' },
        { id: 'alibi', x: 84, y: 60, label: '강민호의 면담 기록', kind: 'doc', doc: 'alibi' },
        { id: 'plaque', x: 42, y: 16, label: '벽의 기념패', kind: 'doc', doc: 'plaque' },
        { id: 'jackets', x: 62, y: 34, label: '걸려 있는 재킷 세 벌', kind: 'device', device: 'jackets', visible: (S) => S.solved.includes('cam') },
        { id: 'safe', x: 28, y: 86, label: '책상 밑 금고', kind: 'device', device: 'safe' },
        { id: 'back-yard', x: 8, y: 12, label: '앞마당으로', kind: 'travel', to: 'yard' },
      ],
    },
    {
      id: 'shop',
      name: '작업장',
      image: P + 'shop.webp',
      arrive: '리프트 위에 차 한 대, 공구벽, 그리고 벽에 붙은 철제 직원 보관함 보관함 옆에 손바닥만 한 백업 단말이 붙어 있다 화면에 「LOCKED」',
      hotspots: [
        { id: 'locker', x: 78, y: 50, label: '직원 보관함과 SD 슬롯', kind: 'doc', doc: 'locker' },
        { id: 'terminal', x: 93, y: 36, label: '보관함 백업 단말', kind: 'device', device: 'terminal' },
        { id: 'back-yard2', x: 8, y: 12, label: '앞마당으로', kind: 'travel', to: 'yard' },
      ],
    },
  ],

  docs: {
    brief: {
      title: '서연과 주고받은 문자',
      kind: '오늘 아침',
      html: `<div class="chat"><div class="chat-head"><span class="chat-back">‹</span><b>서연</b><span class="chat-icons">☰</span></div><div class="chat-date">2026년 9월 19일 토요일</div>
<div class="chat-row them"><span class="chat-avatar">서</span><div class="chat-col"><span class="chat-name">서연</span><div class="chat-bubble">조사원님 정비소 도착하셨어요?</div><div class="chat-bubble">사장님이 21:40에 카드 봤고 22:00에 없어졌대요</div><div class="chat-bubble">그 사이에 들어온 건 서버에 두 줄인데 암호화돼서 못 읽는대요 폐업 처리 중이라고</div><div class="chat-bubble">제 차 어젯밤 거기 세워 뒀어요 블박 켜져 있을 거예요 문은 열어 뒀어요</div></div><span class="chat-time">오전 8:51</span></div>
<div class="chat-row me"><span class="chat-meta">오전 8:53</span><div class="chat-bubble">네 지금 앞마당이에요 블박부터 볼게요</div></div>
<div class="chat-row them"><span class="chat-avatar">서</span><div class="chat-col"><span class="chat-name">서연</span><div class="chat-bubble">그 카드에 제 차 부품 교체 전후 사진이 있어요 저는 교체 동의한 적 없고요</div><div class="chat-bubble">경찰 부르기 전에 누가 가져갔는지만요 확실하게</div></div><span class="chat-time">오전 8:54</span></div>
<div class="chat-input"><span class="chat-field">메시지 입력</span><span>➤</span></div></div>`,
    },
    receipt: {
      title: '앞유리에 끼워진 점검 영수증',
      kind: '미루정비소 장비 점검 · 2026/9/18',
      html: `<div class="paper-table"><p class="pt-head">장비 점검 영수증 · 2026/9/18 20:00</p><table><tr><th>항목</th><td>주차 차량 블랙박스 시각 점검 (고객 차량)</td></tr><tr><th>서버 기준 시각</th><td class="mono">20:00:00</td></tr><tr><th>블랙박스 표시 시각</th><td class="mono">20:07:00</td></tr><tr><th>조치</th><td>시계 수정 미실시 폐업 일정으로 보류</td></tr><tr><th>비고</th><td>오차는 자정까지 일정함 (수정 전 기록은 표시 시각 그대로 남음)</td></tr></table></div>`,
    },
    people: {
      title: '셔터 앞의 세 사람',
      kind: '진술',
      html: `<div class="paper-table"><table><tr><th>한지수 · 07<br><small>정비사</small></th><td>“21:35에 퇴근했어요 측문으로 나갔고 그 뒤엔 안 왔어요 카드요? 그제 잃어버려서 어제 아침에 새로 받았어요 07-B”<br><small>알리바이 기록 없음</small></td></tr>
<tr><th>강민호 · 04<br><small>인수 담당</small></th><td>“21:44부터 21:50까지 본사랑 영상 면담 중이었습니다 기록 있어요 저는 21:30에 정비소 나가서 차 안에서 면담했고요”<br><small>면담 기록은 사무실 서류함에</small></td></tr>
<tr><th>박정호 · 09<br><small>사장</small></th><td>“21:40에 재고 점검 끝내고 나갔다가 22:00에 최종 점검하러 들어왔어요 그때 카드가 없더라고 지수가 그 사진 때문에 불안해했으니까”<br><small>21:40 퇴장 · 22:00 입장은 서버에 있음</small></td></tr></table></div><p>셋 다 아침이라 재킷은 사무실에 걸어 둔 채 셔츠 바람이다 사장은 지수 쪽으로 자꾸 말을 돌린다</p>`,
    },
    server: {
      title: '출입 서버 화면',
      kind: '서버 기준 시각 · 기록 누락 없음',
      html: `<div class="term-screen"><p class="term-line">MIRU-GARAGE ACCESS LOG 2026-09-18</p><table class="term-table"><tr><th>시각</th><th>카드</th><th>이벤트</th></tr><tr><td>21:30:40</td><td>04</td><td>퇴장</td></tr><tr><td>21:35:10</td><td>07-B</td><td>퇴장</td></tr><tr><td>21:40:00</td><td>09</td><td>퇴장 · 실내 0</td></tr><tr><td class="enc">██:██:██</td><td class="enc">██-█</td><td>입장 <small>(잠김)</small></td></tr><tr><td class="enc">██:██:██</td><td class="enc">██-█</td><td>퇴장 · 실내 0 <small>(잠김)</small></td></tr><tr><td>22:00:05</td><td>09</td><td>입장 · 최종 점검</td></tr><tr><td>22:12:30</td><td>09</td><td>퇴장 · 실내 0</td></tr></table><p class="term-line">※ 폐업 이관 중 잠긴 구간: 작업장 백업 단말에 영상 기록을 연결하고 두 시계를 맞추면 원본이 열림</p></div>`,
    },
    handover: {
      title: '폐업 인계 문서',
      kind: '작성 강민호 · 폐업 전날 오전',
      html: `<div class="paper-table"><p class="pt-head">미루정비소 폐업 인계 (초안)</p><table><tr><th>사업자등록</th><td>2009/3/30</td></tr><tr><th>금고</th><td>비밀번호는 개업일 네 자리 (월일) 사장 외 공유 금지</td></tr><tr><th>분실 카드</th><td>회수된 출입 카드는 금고 봉투에 보관 폐업 시 일괄 폐기</td></tr><tr><th>고객 저장물</th><td>고객 SD카드는 본인 동의 후 반환 복사본은 동의 없이 삭제 금지</td></tr></table><p class="pt-foot hand-note">인수 담당 메모: 고객 카드에는 지수가 고객 동의 없이 부품을 교체한 전후 사진이 있다고 들었다 내일 인계 전에 확인 필요 — 민호</p></div>`,
    },
    lost: {
      title: '서류함의 분실 신고서',
      kind: '출입 카드 분실 · 2026/9/17',
      html: `<div class="paper-table"><p class="pt-head">출입 카드 분실 신고 · 재발급</p><table><tr><th>신고</th><td>9/17 14:00 한지수 07-A 분실 (작업장에서 잃어버린 듯)</td></tr><tr><th>재발급</th><td>9/18 09:00 07-B 발급 (서명 한지수)</td></tr><tr><th>07-A 처리</th><td>9/18 09:10 작업장 바닥에서 발견 → 사무실 금고 보관 (서명 박정호) <b>정지 처리 안 함</b></td></tr></table><p class="pt-foot">※ 폐업 일정으로 카드 정지는 보류 서버에는 07-A, 07-B가 따로 찍힘</p></div>`,
    },
    alibi: {
      title: '강민호의 면담 기록',
      kind: '본사 영상 면담 시스템 출력',
      html: `<div class="term-screen"><p class="term-line">HQ VIDEO INTERVIEW LOG · 2026-09-18</p><table class="term-table"><tr><th>항목</th><th>값</th></tr><tr><td>참가자</td><td>강민호 (현장) / 인사팀</td></tr><tr><td>접속</td><td>21:44:12 (본사 서버 시각, 정비소 서버와 동기화됨)</td></tr><tr><td>종료</td><td>21:50:48</td></tr><tr><td>카메라</td><td>켜짐 · 차량 내부</td></tr></table></div>`,
    },
    plaque: {
      title: '벽의 기념패',
      kind: '개업 기념',
      html: `<figure class="prop plaque"><img src="${P}props/plaque.webp" alt="개업 기념패" decoding="async"><div class="on-plaque"><b>미루정비소 개업 기념</b><span>2009년 4월 7일</span><small>미루동 상인회</small></div></figure>`,
    },
    locker: {
      title: '직원 보관함과 SD 슬롯',
      kind: '작업장',
      html: `<p>철제 보관함 넉 칸, 그 밑에 손님 저장 매체를 꽂는 SD 슬롯 서랍 슬롯은 직원 카드를 대야 열리고, 열리고 닫힌 기록과 측문 출입이 옆의 백업 단말에 따로 남는다</p><p>슬롯 안은 비어 있다 서연 카드가 꽂혀 있던 자리에 먼지 자국만 남았다</p>`,
    },
    lockerlog: {
      title: '백업 단말의 보관함 기록',
      kind: '복호화 완료',
      html: `<div class="term-screen"><p class="term-line">BACKUP TERMINAL · DECRYPTED</p><table class="term-table"><tr><th>서버 시각</th><th>이벤트</th></tr><tr><td>21:46:20</td><td>07-A 입장 (측문)</td></tr><tr><td>21:47:05</td><td>07-A 보관함 잠금 해제</td></tr><tr><td>21:47:10</td><td>SD 슬롯 · 카드 반출</td></tr><tr><td>21:48:05</td><td>07-A 재잠금</td></tr><tr><td>21:48:20</td><td>07-A 퇴장 · 실내 0</td></tr></table></div>`,
    },
    safedoc: {
      title: '금고 안의 봉투들',
      kind: '금고 열림',
      html: `<figure class="prop"><img src="${P}props/safe-open.webp" alt="열린 금고 안, 봉투 하나가 비어 있다" decoding="async"></figure><p>봉투 넷 「04 예비」 「09 예비」 「11 퇴직」 그리고 「07-A 분실 · 9/18 보관」 — 이 봉투만 비어 있다</p>`,
    },
    final: {
      title: '서연에게 보낸 보고',
      kind: '조사 결과',
      locked: true,
      html: `<blockquote>서연 씨께<br><br>카드를 꺼낸 사람은 사장 박정호입니다<br>블랙박스는 7분 빠릅니다 표시 21:53:20 입장은 서버 21:46:20이고, 그 시각에 쓰인 카드는 지수 씨가 잃어버려 금고에 보관 중이던 07-A입니다 금고 규칙은 인계 문서에 적혀 있어 사장만 열 수 있었다고는 못 합니다 그래서 재킷을 봤습니다<br>들어간 사람의 재킷은 왼 소매에 반사띠가 있는 회색 재킷이고, 같은 재킷이 표시 22:07, 즉 서버 22:00 최종 점검 입장 때도 찍혔습니다 22:00 입장은 09 카드, 사장 본인이 들어왔다고 진술한 시각입니다<br>민호 씨는 21:44~21:50 본사 면담 중이었고, 지수 씨는 21:35 이후 기록이 없습니다<br>동기는 인계 문서에 있습니다 사장은 자기 지시로 부품을 바꿨다는 사진이 인수 쪽에 넘어가는 걸 막으려 했습니다<br>— 조사원</blockquote>`,
    },
  },

  devices: {
    cam: {
      title: '서연 차의 블랙박스',
      scene: 'yard',
      intro: '어젯밤 기록 중 측문이 찍힌 프레임 여섯 카드가 없어진 시간대에 의심스러운 출입 한 쌍, 들어간 장면과 나온 장면을 짚는다',
      docs: ['receipt', 'people'],
      hintCode: 'G-S01',
      hints: [
        '앞유리에 끼워진 영수증 보셨어요? 블박 시계 얘기가 있던데요 그리고 같은 옷이 몇 번 나오는지도 세어 봐 주세요',
        '카드는 서버로 21:40에서 22:00 사이에 없어졌어요 블박 시각으로 바꾸면 그 사이에 들어갔다 나온 사람은 한 명이에요',
      ],
      initial: () => ({ cur: 0, pick: [] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'cam-wrap');
        const f = FRAMES[d.cur];
        const view = el('div', 'prop camview'); view.innerHTML = `<img src="${P}props/${f.img}.webp" alt="블랙박스 프레임 ${d.cur + 1}" decoding="async"><div class="cam-osd"><span>CAM 01 · FRONT</span><span class="cam-time">2026-09-18 ${f.t}</span></div>`;
        wrap.append(view);
        const strip = el('div', 'cam-strip');
        FRAMES.forEach((fr, i) => {
          const b = el('button', 'cam-thumb' + (i === d.cur ? ' cur' : '') + (d.pick.includes(fr.id) ? ' picked' : '')); b.type = 'button';
          b.setAttribute('aria-label', `프레임 ${i + 1} (${fr.t})`); b.innerHTML = `<img src="${P}props/${fr.img}.webp" alt="" decoding="async"><span>${fr.t}</span>`;
          b.onclick = () => { d.cur = i; save(); };
          strip.append(b);
        });
        wrap.append(strip);
        wrap.append(el('p', 'pick-label', `프레임 ${d.cur + 1} · 표시 ${f.t} — ${f.what}`));
        const row = el('div', 'pick-row');
        const mark = el('button', 'chip' + (d.pick.includes(f.id) ? ' on' : ''), d.pick.includes(f.id) ? '이 프레임 표시 해제' : '이 프레임 표시'); mark.type = 'button'; mark.setAttribute('aria-label', `프레임 ${d.cur + 1} 표시`);
        mark.onclick = () => { if (d.pick.includes(f.id)) d.pick = d.pick.filter((x) => x !== f.id); else { d.pick.push(f.id); if (d.pick.length > 2) d.pick.shift(); } save(); };
        row.append(mark); wrap.append(row, el('p', 'pick-label', d.pick.length ? `표시한 프레임: ${d.pick.map((id) => FRAMES.find((x) => x.id === id).t).join(' / ')}` : '두 프레임을 표시한다 (입장과 퇴장)'));
        return wrap;
      },
      commitLabel: '이 두 장면을 표시해 둔다',
      canCommit: (d) => d.pick.length === 2,
      check(d) {
        const p = [...d.pick].sort((a, b) => FRAMES.findIndex((x) => x.id === a) - FRAMES.findIndex((x) => x.id === b));
        if (p.join() === CAM_ANSWER.join()) return { ok: true };
        return { ok: false, msg: '이 두 장면은 카드가 없어진 시간 안에서 같은 사람이 들어갔다 나온 한 쌍이 아니다' };
      },
      reveal: {
        title: '21:53:20 → 21:55:20',
        text: '표시 시각 21:53:20에 들어가 21:55:20에 나왔다 2분 왼 소매가 번쩍이는 회색 계열 재킷 나올 때 오른손에 작은 걸 쥐고 있다',
        scene: ['화면 구석의 시각은 블랙박스 시계다 이게 출입 서버의 어느 줄인지는 아직 모른다 왼 소매의 그 번쩍임이 다른 프레임에도 있는지 다시 넘겨 봤다'],
        unlock: null,
      },
    },

    terminal: {
      title: '보관함 백업 단말',
      scene: 'shop',
      intro: '단말에 서연 차 블랙박스 기록을 연결했다 화면에 시간 축 두 줄 위는 블랙박스, 아래는 출입 서버 두 시계를 맞추면 잠긴 구간이 열린다',
      docs: ['receipt', 'server'],
      hintCode: 'G-S02',
      hints: [
        '블박 시각이 서버랑 다르다고 했죠 둘 다 찍힌 출입이 있을 거예요 화살표 방향도 같아야 같은 출입이에요',
        '시각이 남아 있는 서버 출입 가운데 블박 장면 셋이 한꺼번에 겹치는 차이는 하나뿐이에요 나머지 두 장면은 서버가 잠긴 자리로 떨어져요',
      ],
      initial: () => ({ off: 0 }),
      render(ctx) {
        const { d, el, save } = ctx;
        if (typeof d.off !== 'number') d.off = 0;
        const wrap = el('div', 'sync-wrap');
        const screen = el('div', 'term-screen sync-screen'); screen.innerHTML = `<p class="term-line">BACKUP TERMINAL · CLOCK SYNC</p>${syncSvg(d.off)}<p class="term-line">블랙박스 시계 ${d.off > 0 ? '+' : d.off < 0 ? '−' : '±'}${Math.abs(d.off)}분</p>`;
        const row = el('div', 'sync-row');
        [[-5, '−5분'], [-1, '−1분'], [1, '+1분'], [5, '+5분']].forEach(([v, lab]) => { const b = el('button', 'ctl', lab); b.type = 'button'; b.setAttribute('aria-label', `블랙박스 시계 ${lab}`); b.onclick = () => { d.off = Math.max(-15, Math.min(15, d.off + v)); save(); }; row.append(b); });
        wrap.append(screen, row, el('p', 'pick-label', '블랙박스 프레임 번호와 서버 카드 번호 옆의 ↓는 들어감, ↑는 나감'));
        return wrap;
      },
      commitLabel: '이 차이로 맞추기',
      check(d) {
        if (d.off === SYNC_ANSWER) return { ok: true };
        return { ok: false, msg: 'SYNC FAIL' };
      },
      reveal: {
        title: 'SYNC OK',
        text: '블랙박스 −7분에서 장면 셋이 서버 출입과 겹쳤다 남은 두 장면은 서버가 잠긴 자리에 떨어졌다 잠긴 줄이 열렸다 21:46:20 07-A 입장, 21:47:10 SD 슬롯 반출, 21:48:20 07-A 퇴장',
        scene: ['07-A 이 카드가 어제 아침 이후 어디 있었는지는 서류함에 있을 것이다'],
        unlock: null,
        unlockDoc: 'lockerlog',
      },
    },

    safe: {
      title: '책상 밑 금고',
      scene: 'office',
      intro: '네 자리 다이얼 인계 문서에 번호 규칙이 적혀 있다',
      docs: ['handover', 'plaque', 'lost'],
      hintCode: 'G-S03',
      hints: [
        '인계 문서에 금고 얘기 있지 않았어요? 날짜가 여러 개면 어느 날짜를 말하는 건지 봐야죠',
        '개업일이면 사무실 벽에 걸려 있는 거 아니에요? 월 두 자리 일 두 자리',
      ],
      initial: () => ({ dial: [0, 0, 0, 0] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'prop safelock'); wrap.innerHTML = `<img src="${P}props/safe.webp" alt="책상 밑 금고" decoding="async">`;
        wrap.append(dialRow(el, save, d, 4));
        return wrap;
      },
      commitLabel: '손잡이 내리기',
      check(d) {
        const s = d.dial.join('');
        if (s === SAFE_CODE.join('')) return { ok: true };
        return { ok: false, msg: '손잡이가 안 내려간다' };
      },
      reveal: {
        title: '0407',
        text: '손잡이가 내려갔다 봉투 넷 중 「07-A 분실 · 9/18 보관」 봉투만 비어 있다',
        scene: ['번호 규칙은 인계 문서에 적혀 있다 그 문서를 쓴 사람도, 읽은 사람도 열 수 있다 금고만으로는 사람이 안 나온다'],
        unlock: null,
        unlockDoc: 'safedoc',
      },
    },

    jackets: {
      title: '걸려 있는 재킷 세 벌',
      scene: 'office',
      intro: '블랙박스에 찍힌 재킷을 골라낸다 안쪽 칼라에 이름표가 있다 남색 하나, 회색 계열 둘',
      docs: ['people', 'alibi'],
      hintCode: 'G-S04',
      hints: [
        '블박에서 소매가 번쩍이던 거요 걸려 있는 재킷 소매도 봐 주세요',
        '그 재킷 칼라 이름표요 그리고 그 재킷이 블박에 몇 번 나왔는지, 그 시각에 들어온 건 서버에 누구로 찍혔는지',
      ],
      initial: () => ({ open: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'jackets-wrap');
        const img = el('div', 'prop jacketsimg'); img.innerHTML = `<img src="${P}props/jackets.webp" alt="재킷 세 벌" decoding="async">`;
        const xs = [13, 40, 67];
        JACKETS.forEach((j, i) => {
          const b = el('button', 'jacket-btn' + (d.open === j.id ? ' picking' : '')); b.type = 'button'; b.style.left = xs[i] + '%';
          b.setAttribute('aria-label', `${j.name} 칼라 보기`); b.onclick = () => { d.open = d.open === j.id ? null : j.id; save(); };
          img.append(b);
        });
        wrap.append(img);
        if (d.open) { const j = JACKETS.find((x) => x.id === d.open); wrap.append(el('div', 'collar-tag', `칼라 이름표: ${j.tag}`), el('p', 'pick-label', j.note)); }
        else wrap.append(el('p', 'pick-label', '재킷을 누르면 칼라 안쪽이 보인다'));
        return wrap;
      },
      commitLabel: '이 재킷이 블랙박스의 재킷이다',
      canCommit: (d) => !!d.open,
      check(d) {
        if (d.open === 'stripe') return { ok: true };
        return { ok: false, msg: '블랙박스의 재킷과 다르다' };
      },
      reveal: {
        title: '왼 소매 반사띠',
        text: '왼 소매에 반사띠가 붙은 재킷 안주머니 바닥에 SD카드 보호 케이스 뚜껑이 들어 있었다',
        scene: ['이름표만으로는 약하다 남의 재킷을 입을 수도 있으니까 이 재킷이 블랙박스에 한 번 더 찍혔다면, 그 시각 서버에 누가 찍혔는지가 답이다'],
        unlock: null,
      },
    },

    report: {
      title: '서연에게 보고',
      scene: 'yard',
      intro: '들어감에서 나감까지 한 줄로 이어 보고한다 칸마다 근거를 하나씩 끼운다 하나라도 틀리면 서연은 경찰을 못 부른다',
      docs: ['lockerlog', 'safedoc', 'alibi', 'server'],
      hintCode: 'G-S05',
      hints: [
        '카드는 단말 기록에, 그 카드가 어디 있었는지는 서류함하고 금고에 있잖아요',
        '소매가 번쩍인 장면이 하나 더 있었죠 그 출입이 서버에서 누구 카드로 찍혔는지 보세요',
      ],
      initial: () => ({ pick: {} }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'report-wrap');
        REPORT.forEach((q) => {
          const box = el('div', 'gift-row'); box.append(el('span', 'gift-name', q.label));
          const row = el('div', 'pick-row');
          q.opts.forEach(([id, label]) => { const b = el('button', 'chip' + (d.pick[q.id] === id ? ' on' : ''), label); b.type = 'button'; b.setAttribute('aria-label', `${q.label}: ${label}`); b.onclick = () => { d.pick[q.id] = id; save(); }; row.append(b); });
          box.append(row); wrap.append(box);
        });
        return wrap;
      },
      commitLabel: '보고 보내기',
      check(d) {
        const empty = REPORT.filter((q) => !d.pick[q.id]);
        if (empty.length) return { ok: false, msg: '보고서에 빈 칸이 있다' };
        if (REPORT.every((q) => d.pick[q.id] === q.ans)) return { ok: true };
        return { ok: false, msg: '서연: "확실해요? 하나라도 틀리면 경찰 못 불러요 다시 봐 주세요"' };
      },
      reveal: {
        title: '보고 완료',
        text: '서연이 답장을 보냈다 「경찰 불렀어요 사장님 차 글로브박스에서 카드 나왔대요 고맙습니다」',
        scene: ['사장은 셔터 앞 상자에 앉아 고개를 숙이고 있었다 지수가 사무실에서 자기 재킷을 가져와 사장 어깨에 걸쳐 줬다 남색이었다'],
        ending: true,
        endingLabel: '폐업 당일 아침으로',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '비 그친 아침, 정비소 앞에서 SD카드를 든 서연과 상자에 앉은 사장',
    eyebrow: '9월 19일, 오전 열 시',
    title: '마지막 정비소',
    paragraphs: [
      '사장은 금고에서 07-A를 꺼내 측문으로 들어갔다 자기 카드 09로 들어가면 서버에 남으니까 21:46에 들어가 21:47에 카드를 빼고 21:48에 나왔다 22:00에 다시 들어가 "없어졌다"고 했다',
      '"부품 교체는 내가 시켰어요" 사장이 말했다 "인수 쪽에 그 사진 넘어가면 계약이 깨져요 지수한테 뒤집어씌울 생각은 없었는데 말이 그렇게 나가더라고"',
      '지수는 아무 말도 안 했다 민호는 인계 문서의 메모 줄에 두 줄을 긋고 다시 썼다 「교체 지시: 박정호 사진은 고객에게 반환」',
      '서연은 카드를 받아 들고 한참 보더니 주머니에 넣었다 "이 정비소, 내일부터는 없는 거죠"',
      '열 시에 셔터가 내려갔다 블랙박스는 그때도 7분 빠른 시각을 찍고 있었다',
    ],
    afterword: '정비소에서는 끝내 아무도 블랙박스 시계를 고치지 않았다 서연이 그날 저녁 집 앞에서 직접 맞췄다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=radio', title: '끝나지 않은 방송', line: '다음은 꺼진 마이크의 새벽 두 시 이야기입니다' },
  },
};
