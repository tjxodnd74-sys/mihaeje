// 비가 그친 사진관 — ★3 이야기·자료·장치가 전부 이 파일에 있습니다
// v126: 비 오는 저녁(창밖 그림과 맞춤) · 라벨은 카드가 다 꽂혀 있고 글씨 남은 게 셋 · 인화 실패는 진하기/얼룩으로 나눠 보여 줌
// v125: 장부의 칸 번호도 번져서 봉투의 눌린 글씨가 꼭 필요 · 루페 후보 셋(간판 없는 컷 · 흔들린 컷 · 정답) · 노출은 셈해서(4×6 3초 → 8×10 12초) · 라벨 없는 트레이는 흰 불 아래서 봐 둬야 한다
const P = 'assets/v2/studio/';
// 보관함 4×4 할아버지식 라벨: 글자는 왼쪽부터 열(A~D), 숫자는 아래 줄부터 1~4
// 라벨 카드는 다 꽂혀 있지만 글씨는 바래고 A4(왼쪽 위) A1(왼쪽 아래) D1(오른쪽 아래)만 읽힌다 → C3 = 왼쪽에서 셋째 열, 위에서 둘째 줄
const CELLS = [0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3].map((c) => ({ id: `r${r}c${c}`, r, c, label: 'ABCD'[c] + (4 - r) })));
const LEFT_LABELS = { r0c0: 'A4', r3c0: 'A1', r3c3: 'D1' };
const LOCKER_ANSWER = 'r1c2'; // C3
const cellName = (id) => { const x = CELLS.find((k) => k.id === id); return `위에서 ${x.r + 1}째 줄 왼쪽에서 ${x.c + 1}째 칸`; };
// 서랍 사진(서랍 열여섯 칸만 잘라 낸 그림) 위 서랍 자리(왼쪽 위 모서리 %)
// v127: 사진에서 다시 잰 서랍 앞판(왼쪽 위 · 폭 21.4% · 높이 21%)과 황동 라벨 꽂이 속 카드 가운데
const DRAWER_X = [4.0, 27.2, 50.55, 73.35], DRAWER_Y = [4.4, 27.4, 50.5, 73.5];
const CARD_X = [14.7, 37.9, 61.25, 84.05], CARD_Y = [12.2, 35.2, 58.3, 81.3];
const STRIPS = [
  { id: 'a', start: 1, end: 6 },
  { id: 'b', start: 7, end: 12 },
  { id: 'c', start: 13, end: 18 },
  { id: 'd', start: 19, end: 24 },
];
const FRAME_ANSWER = 23;
const EXPOSURE = 12; // 시험 인화 4×6 3초 → 5×7 6초 → 8×10 12초
const TRAY_ANSWER = [3, 1, 2]; // 현상(오른쪽 · 누런 물) → 정지(왼쪽 · 빙초산 병) → 정착(가운데 · 파란 테이프 집게)
const TRAY_NAME = { 1: '왼쪽', 2: '가운데', 3: '오른쪽' };
// 망친 인화지 모습 (노출이 길면 시커멓고 짧으면 허옇다 · 트레이 순서가 틀리면 얼룩)
const failText = (f) => {
  const t = f.tone === 'dark' ? '상이 시커멓게 묻혔' : f.tone === 'light' ? '상이 허옇게 날아갔' : '';
  if (t && f.smear) return t + '고 얼룩까지 번졌다';
  return t ? t + '다' : '상이 얼룩덜룩 번졌다';
};
const PRESSED_LIT = 'C3 · 8×10 · 4×6 3초<br>셋 다 · 간판 밑<br>안 흔들린 컷';
const PRESSED_DIM = '▒▒ · ▒▒▒ · ▒▒▒ ▒▒<br>▒ ▒ · ▒▒ ▒<br>▒ ▒▒▒ ▒';
// 휴대폰에서 이 장면에 처음 왔을 때 그림의 어느 가로 위치(fx, 0~1)를 화면 가운데에 둘지 (엔진은 저장된 S.pan 이 없으면 그림 한가운데를 보여 준다)
// 접수실은 한가운데로 열면 초록 등 밑 봉투(68%)가 오른쪽 화살표 밑에 걸린다
function firstLook(S, id, fx) {
  try {
    if (window.innerWidth > 640 || S.pan?.[id] != null) return;
    const h = Math.min(window.innerHeight * 0.74, 640), w = h * 1024 / 688;
    S.pan = S.pan || {}; S.pan[id] = Math.max(0, Math.round(w * fx - window.innerWidth / 2));
  } catch {}
}

export default {
  id: 'studio',
  number: '007',
  title: '비가 그친 사진관',
  subtitle: '스무 해 동안 기다린 한 장',
  genre: '사진관 · 암실 미스터리',
  minutes: 32,
  difficulty: 3,
  cover: P + 'cover.webp',
  coverAlt: '창가에서 필름을 빛에 비춰 보는 할아버지의 손',
  music: 'assets/music/studio-v33.mp3',
  tagline: '2006년 3월에 맡긴 필름\n오늘 찾으러 온다고 했다',
  blurb: '할아버지가 마흔 해 지킨 동네 사진관\n스무 해 전 봉투 하나가 접수대에 남아 있고, 오늘 저녁 그 주인이 돌아옵니다',
  storageKey: 'mihaeje-v2-studio',
  hintTitle: '할아버지의 전화',
  tracesLabel: '할아버지가 맡겨 둔 것',

  opening: {
    eyebrow: '2026/4/4 토요일 · 비 오는 저녁',
    paragraphs: [
      '할아버지 사진관은 역 앞 골목에서 마흔 해째다. 요즘은 증명사진 손님이 하루 둘셋. 나는 주말마다 와서 접수대를 보는 손주다.',
      '오늘은 할아버지가 점심 먹고 나가면서 쪽지를 남겼다. 「윤서 씨 필름, 인화해 둬라. 저녁에 온다.」 윤서 씨가 누군지는 모른다. 접수대 위 봉투는 2006년 3월 것이었다.',
      '아침부터 온 비가 창틀로 새어 접수대까지 흘러와 있었다. 봉투 겉면 이름 칸도, 장부의 그 줄도 다 번졌다. 증명사진 손님 둘을 받고 나니 벌써 해가 졌다. 비는 아직 그칠 기미 없이 유리창을 타고 흘러내렸다.',
    ],
    cta: '접수대의 봉투 보기',
  },

  traces: [
    { device: 'lamp', label: '눌린 글씨' },
    { device: 'lockers', label: '보관함' },
    { device: 'lightbox', label: '고른 컷' },
    { device: 'print', label: '인화' },
  ],

  scenes: [
    {
      id: 'front',
      name: '접수실',
      image: P + 'front.webp',
      arrive: (S) => {
        firstLook(S, 'front', 0.56);
        // 암실 열쇠로 문을 연 뒤에는 '잠겨 있다'가 남지 않게
        if (S.solved.includes('lightbox')) return '창을 두드리는 빗소리 말고는 조용하다 암실 문 위 붉은 등 아래, 작은 열쇠로 연 문이 열려 있다 고른 컷은 슬리브에 넣어 들고 있다';
        return '창을 두드리는 빗소리 말고는 조용하다 가로등 불빛이 젖은 길에 번진다 접수대 초록 등 밑에 누런 봉투 왼쪽 벽은 필름 보관함 암실 문 위 붉은 등만 혼자 켜져 있다 문은 잠겨 있다';
      },
      hotspots: [
        { id: 'gnote', x: 53.5, y: 60.5, r: 9, label: '접수대의 할아버지 쪽지', kind: 'doc', doc: 'gnote' },
        { id: 'ledger', x: 87.5, y: 67.3, r: 10, label: '접수 장부', kind: 'doc', doc: 'ledger' },
        { id: 'wall', x: 68, y: 32, r: 16, label: '벽의 사진들', kind: 'doc', doc: 'wall' },
        { id: 'lamp', x: 68.3, y: 69.8, r: 10, label: '초록 등 밑의 봉투', kind: 'device', device: 'lamp', visible: (S) => !S.solved.includes('lamp') },
        { id: 'pressed', x: 68.3, y: 69.8, r: 10, label: '봉투에 눌린 글씨', kind: 'doc', doc: 'pressed', visible: (S) => S.solved.includes('lamp') },
        { id: 'lockers', x: 12, y: 58, r: 16, label: '필름 보관함', kind: 'device', device: 'lockers', visible: (S) => S.solved.includes('lamp') },
        { id: 'sleeve', x: 11, y: 40, r: 12, label: '보관함에서 꺼낸 필름 봉투', kind: 'doc', doc: 'sleeve', visible: (S) => S.solved.includes('lockers') },
      ],
    },
    {
      id: 'table',
      name: '작업대',
      image: P + 'table.webp',
      unlockedBy: 'lockers',
      arrive: '라이트박스를 켜자 작업대가 하얗게 떴다 필름 네 줄을 올려놓았다 몇 줄은 앞뒤가 뒤집혀 있다 장갑을 끼고 루페를 집었다',
      hotspots: [
        { id: 'lightbox', x: 43, y: 58, r: 16, label: '라이트박스 위 필름', kind: 'device', device: 'lightbox' },
        { id: 'loupe', x: 61, y: 52, r: 9, label: '루페로 본 필름 가장자리', kind: 'doc', doc: 'edge' },
      ],
    },
    {
      id: 'darkroom',
      name: '암실',
      image: P + 'darkroom.webp',
      unlockedBy: 'lightbox',
      arrive: '작은 열쇠가 돌아갔다 약품 냄새 붉은 안전등만 켜져 있고 흰 불 스위치는 문 옆이다 확대기 옆에 타이머, 그 옆에 트레이 셋 라벨은 다 떨어졌다',
      overlays: [{ x: 41.5, y: 17, w: 4.6, h: 9.5, cls: 'st-chart', html: '<i></i>' }, { x: 4.2, y: 26.6, w: 4.4, h: 7.2, cls: 'st-memo', html: '<i></i>' }],
      hotspots: [
        { id: 'chart', x: 43.8, y: 21.8, r: 9, label: '벽의 순서표', kind: 'doc', doc: 'chart' },
        { id: 'memo', x: 6.6, y: 30.2, r: 9, label: '선반의 약품 메모', kind: 'doc', doc: 'memo' },
        { id: 'print', x: 22, y: 42, r: 16, label: '확대기', kind: 'device', device: 'print' },
        // 트레이 셋(그림 x 40~100%) 중 왼쪽·가운데 사이 휴대폰 첫 화면에서 오른쪽 화살표와 겹치지 않게
        { id: 'print2', x: 61, y: 64, r: 16, label: '트레이 셋', kind: 'device', device: 'print' },
      ],
    },
  ],

  docs: {
    gnote: {
      title: '접수대의 할아버지 쪽지',
      kind: '할아버지 글씨',
      html: `<blockquote class="hand">수호야<br>윤서 씨 필름 인화해 둬라 저녁에 온다<br>봉투는 접수대에 있다 겉면에 다 적어 뒀다 나는 봉투에 쓸 때 늘 다른 종이를 대고 쓴다<br>보관함 라벨은 글씨가 거의 바랬는데, 남은 거 보면 내 셈법은 알 거다<br>암실 열쇠는 필름 봉투 안에 넣어 뒀다<br>요새 손이 떨려서 초점을 못 맞춘다 네가 해라<br>— 할아버지</blockquote>`,
    },
    ledger: {
      title: '접수 장부',
      kind: '2006년 3월',
      html: `<div class="paper-table st-ledger"><p class="pt-head">접수 장부 · 2006년 3월</p><table class="nwcells"><tr><th>날짜</th><th>접수</th><th>이름</th><th>보관</th><th>비고</th></tr>
<tr><td>3/2</td><td>0611</td><td>박○○</td><td>B2</td><td>증명 4매</td></tr>
<tr><td>3/9</td><td>0614</td><td>최○○</td><td>C2</td><td>가족 8×10</td></tr>
<tr class="wet"><td>3/11</td><td>0615</td><td><span class="blot">○윤서</span></td><td><span class="blot">▒▒</span></td><td><span class="blot">필름 4줄 · 인화 보류</span></td></tr>
<tr><td>3/15</td><td>0617</td><td>이○○</td><td>C4</td><td>여권</td></tr>
</table><p class="hand-cell big">2026/4/2 윤서 씨 전화 (외국 번호) 4/4 토요일 저녁에 찾으러 온다고</p></div><p>0615 줄만 빗물에 번졌다 보관 칸에는 글자 둘이 있었던 자국만 남았다</p>`,
    },
    wall: {
      title: '벽의 사진들',
      kind: '손님들과 동네',
      html: `<p>벽에는 사십 년 치 손님 사진이 걸려 있다 결혼, 돌, 졸업, 여권 사진까지 할아버지는 늘 카메라 뒤에 있어서 한 장도 없다</p><p>문 옆에는 간판 사진 둘 1986년 개업 날의 나무 간판, 그리고 2005년 봄에 새로 단 흰 바탕 빨간 글씨 「미루사진관」</p><p>맨 아래 줄에 빈 액자가 하나 걸려 있다 8×10 크기 할아버지가 "거긴 비워 둬라" 했던 자리다</p>`,
    },
    pressed: {
      title: '봉투에 눌린 글씨',
      kind: '초록 등 밑에서 읽어 낸 것',
      html: `<blockquote class="hand">0615 윤서 · 보관 C3<br>인화 컷 윤서 씨가 고른 것 (셋 다 나온 거 · 간판 밑 · 안 흔들린 거)<br>8×10 · 시험 인화 4×6에 3초</blockquote><p>봉투 위에 다른 종이를 대고 쓴 자국 할아버지 글씨다</p>`,
    },
    sleeve: {
      title: '보관함에서 꺼낸 필름 봉투',
      kind: '2006년 · 할아버지 글씨',
      html: `<blockquote class="hand">접수 0615 · 윤서<br>필름 4줄 (MIRU 400)<br>인화할 컷·크기·노출은 접수 봉투 겉면에 적음<br>※ 손님 돌아오는 날 인화해서 건넬 것<br>2007/2/10 윤서 씨 아버님 부고 받음 봉투는 그대로 둠</blockquote><p>봉투 안에 작은 열쇠 하나 꼬리표에 「암실」 그리고 필름 네 줄</p>`,
    },
    edge: {
      title: '루페로 본 필름 가장자리',
      kind: '작업대',
      html: `<p>필름 가장자리에는 제조사 이름과 컷 번호가 찍혀 있다 글자가 바르게 읽히는 쪽이 앞면이다 뒤집혀 있으면 글자가 거울처럼 뒤집혀 보인다</p><p>뒤집힌 채로 인화하면 사진도 좌우가 바뀐다</p><p>네거티브는 밝고 어두운 게 뒤바뀌어 있다 루페 속 유리에는 할아버지가 붙여 둔 반전 필터가 있어서 대충 사진처럼 보인다</p>`,
    },
    chart: {
      title: '벽의 순서표',
      kind: '할아버지 글씨 · 암실',
      html: `<blockquote class="hand">1 흰 불 끄고 붉은 등만<br>2 인화지는 그다음에 꺼낸다<br>3 확대기 초점 맞추고 타이머<br>　노출은 크기 한 단계 키울 때마다 두 배<br>　4×6 → 5×7 → 8×10 → 11×14<br>4 노출 뒤 트레이 현상 → 정지 → 정착<br>5 정착 끝나야 흰 불 켠다</blockquote><p>트레이에 붙어 있던 라벨은 다 떨어져 나갔다</p>`,
    },
    memo: {
      title: '선반의 약품 메모',
      kind: '할아버지 글씨 · 4/3',
      html: `<blockquote class="hand">트레이 셋 다 씻고 새로 채움 자리는 손에 잡히는 대로 놨다<br>현상액 쓰다 보면 누렇게 된다 아직 쓸 만함<br>정지액 빙초산 냄새 병은 그 트레이 뒤에 둔다<br>정착액 집게 손잡이에 파란 테이프 다른 집게랑 섞지 말 것<br>붉은 등 밑에선 다 같은 빨강이다 흰 불 켜 놓고 먼저 봐 둘 것</blockquote>`,
    },
    photo: {
      title: '오늘 인화한 사진',
      kind: '8×10 · 2006/3/11 아침',
      html: `<figure class="prop st-photo"><img src="${P}props/print.webp" alt="2006년 봄, 「미루사진관」 간판 아래에서 부모님과 함께 선 윤서" decoding="async"></figure><p>트레이 안에서 천천히 떠오른 상 세 사람이 간판 밑에 나란히 섰다 아버지 손에 종이 가방, 옆에는 자전거 한 대</p>`,
    },
    final: {
      title: '필름 봉투 속 쪽지',
      kind: '2006년 · 윤서 아버지의 글씨',
      locked: true,
      html: `<figure class="prop oldphoto"><img src="${P}props/print.webp" alt="오늘 인화한 사진: 2006년 봄, 사진관 앞에서 부모님과 선 윤서" decoding="async"></figure><p>빈 필름 봉투를 접어 넣다가 안쪽 귀퉁이에 접혀 들어가 있던 쪽지를 봤다 네거티브를 다 빼기 전에는 안 보이던 자리다</p><blockquote class="hand">2006/3/11<br>윤서 유학 가는 날 아침, 사진관 앞에서<br>돌아오면 같이 찾으러 오자<br>— 아빠</blockquote><p>윤서 씨는 그해 봄에 떠났고, 아버지는 이듬해 겨울에 돌아가셨다 할아버지는 부고를 받고도 봉투를 그대로 두었다</p>`,
    },
  },

  devices: {
    lamp: {
      title: '초록 등 밑의 봉투',
      scene: 'front',
      intro: '겉면 글씨는 빗물에 번졌다 아래 막대를 밀면 봉투를 초록 등 쪽으로 기울인다',
      docs: ['gnote', 'ledger'],
      hintCode: '',
      hints: [
        '할아버지는 봉투에 쓸 때 다른 종이를 대고 쓴다 눌린 자국은 빛을 비스듬히 받아야 그림자가 생긴다',
        '평평하게 두면 안 보이고 너무 세우면 빛이 미끄러진다 그 사이 어딘가에서 천천히',
        '기울기 30~45도 「C3 · 8×10 · 4×6 3초 / 셋 다 · 간판 밑 · 안 흔들린 컷」',
      ],
      initial: () => ({ angle: 0 }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'lamp-wrap');
        const env = el('div', 'prop envtilt'); const lit = d.angle >= 30 && d.angle <= 45; env.innerHTML = `<div class="tiltbox"><img src="${P}props/envelope.webp" alt="초록 등 밑의 누런 봉투 겉면 글씨가 번져 있다" decoding="async"><div class="pressed${lit ? ' lit' : ''}" style="opacity:${lit ? 1 : Math.max(0, 1 - Math.abs(d.angle - 37) / 12)}">${lit ? PRESSED_LIT : PRESSED_DIM}</div><div class="glare" style="transform:translateX(${(d.angle - 35) * 2}%)"></div></div>`;
        env.style.setProperty('--tilt', d.angle + 'deg');
        wrap.append(env);
        const big = el('p', 'mobile-only st-pressed-big'); big.innerHTML = lit ? PRESSED_LIT : '';
        wrap.append(big);
        const lab = el('label', 'tilt-label'); lab.append(el('span', '', `기울기 ${d.angle}°`));
        const r = el('input'); r.type = 'range'; r.min = 0; r.max = 70; r.step = 1; r.value = d.angle; r.setAttribute('aria-label', '봉투 기울기');
        // 끄는 동안은 화면만 바꾸고(요소를 새로 만들면 끌기가 끊긴다) 손을 떼면 저장
        r.oninput = () => {
          d.angle = Number(r.value); const on = d.angle >= 30 && d.angle <= 45;
          const pr = env.querySelector('.pressed'); pr.classList.toggle('lit', on); pr.style.opacity = on ? 1 : Math.max(0, 1 - Math.abs(d.angle - 37) / 12);
          pr.innerHTML = on ? PRESSED_LIT : PRESSED_DIM; big.innerHTML = on ? PRESSED_LIT : '';
          env.querySelector('.glare').style.transform = `translateX(${(d.angle - 35) * 2}%)`; env.style.setProperty('--tilt', d.angle + 'deg');
          lab.firstChild.textContent = `기울기 ${d.angle}°`;
        };
        r.onchange = () => save();
        lab.append(r); wrap.append(lab);
        return wrap;
      },
      commitLabel: '글자 읽기',
      check(d) {
        if (d.angle >= 30 && d.angle <= 45) return { ok: true };
        return { ok: false, msg: '눈을 가까이 대 봐도 글자가 떠오르지 않는다' };
      },
      reveal: {
        title: 'C3 · 셋 다 · 간판 밑 · 안 흔들린 컷',
        text: '봉투 위에 다른 종이를 대고 쓴 자국이 비스듬한 빛에 떠올랐다 0615 윤서, 보관 C3, 인화할 컷은 셋 다 나오고 간판 밑이고 안 흔들린 것, 8×10, 시험 인화는 4×6에 3초 할아버지 글씨다',
        scene: ['장부에서 번진 칸 번호가 이거였다 C3 왼쪽 벽 보관함 맨 아래쪽 2000년대 서랍들은 라벨 카드가 꽂혀는 있는데 글씨가 바래서 셋만 읽힌다'],
        unlockDoc: 'pressed',
        unlock: null,
      },
    },

    lockers: {
      title: '필름 보관함',
      scene: 'front',
      intro: '벽 보관함 아래쪽 2000년대 서랍 열여섯 칸 라벨 카드는 다 꽂혀 있지만 글씨가 남은 건 셋뿐 나머지는 바래서 하얗다 서랍을 눌러 고른 뒤 봉투를 꺼낸다',
      docs: ['ledger', 'gnote', 'pressed'],
      hintCode: '',
      hints: [
        '글씨가 남은 라벨 셋의 자리를 본다 같은 글자가 둘이다',
        'A가 붙은 두 칸으로 글자가 가로로 가는지 세로로 가는지, 남은 하나로 숫자가 어느 쪽부터 커지는지 정한다',
        '왼쪽에서 셋째 열, 위에서 둘째 줄',
      ],
      initial: () => ({ open: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'lockers-wrap');
        const cab = el('div', 'prop lockerwall st-drawers'); const im = el('img'); im.src = P + 'props/lockers.webp'; im.alt = '나무 서랍 열여섯 칸 라벨 카드 글씨는 세 개만 읽힌다'; cab.append(im);
        CELLS.forEach((k) => {
          const b = el('button', 'locker-cell' + (d.open === k.id ? ' picking' : '') + (LEFT_LABELS[k.id] ? '' : ' bare')); b.type = 'button';
          b.style.left = DRAWER_X[k.c] + '%'; b.style.top = DRAWER_Y[k.r] + '%';
          b.setAttribute('aria-label', `${cellName(k.id)} 서랍${LEFT_LABELS[k.id] ? ' (라벨 ' + LEFT_LABELS[k.id] + ')' : ''}`);
          b.onclick = () => { d.open = k.id; save(); };
          cab.append(b);
          // 글씨가 남은 라벨 카드는 사진 속 황동 꽂이 안 카드 자리에 그대로 겹친다 (나머지 카드는 사진 그대로 하얗게 바랜 채)
          if (LEFT_LABELS[k.id]) { const t = el('span', 'st-card' + (d.open === k.id ? ' on' : ''), LEFT_LABELS[k.id]); t.setAttribute('aria-hidden', 'true'); t.style.left = CARD_X[k.c] + '%'; t.style.top = CARD_Y[k.r] + '%'; cab.append(t); }
        });
        wrap.append(cab);
        wrap.append(el('p', 'pick-label', d.open ? `고른 서랍 · ${cellName(d.open)}` : '서랍을 하나 고른다'));
        return wrap;
      },
      commitLabel: '이 서랍의 봉투 꺼내기',
      canCommit: (d) => !!d.open,
      check(d) {
        if (d.open === LOCKER_ANSWER) return { ok: true };
        return { ok: false, msg: '다른 손님들 봉투뿐이다 0615는 없다 서랍을 도로 닫았다' };
      },
      reveal: {
        title: 'C3',
        text: '왼쪽에서 셋째, 위에서 둘째 서랍 안에 접수 0615 봉투 필름 네 줄과 할아버지 메모, 그리고 꼬리표 달린 작은 열쇠 「암실」',
        scene: ['필름을 작업대 라이트박스로 가져갔다 암실 문은 그다음이다 어느 컷인지부터 찾아야 한다'],
        unlockDoc: 'sleeve',
        unlock: 'table',
      },
    },

    lightbox: {
      title: '라이트박스 위 필름',
      scene: 'table',
      intro: '필름 네 줄 줄마다 붙은 ⇄는 그 줄을 앞뒤로 뒤집어 놓는다 컷을 누르면 아래 루페로 크게 본다 고른 컷 그대로 인화한다',
      docs: ['pressed', 'edge', 'sleeve', 'wall'],
      hintCode: '',
      hints: [
        '컷을 하나씩 루페로 본다 봉투에 눌린 세 가지를 다 갖춘 컷은 하나뿐이다',
        '셋 다 나왔어도 간판이 안 보이는 컷, 간판이 있어도 흔들린 컷이 바로 옆에 붙어 있다 인화할 줄은 가장자리 글자가 바르게 읽히게',
        '네 번째 줄 다섯 번째 컷 (가장자리 23) 그 줄이 뒤집혀 있으면 ⇄로 바로 놓기',
      ],
      initial: () => ({ flip: { a: true, b: false, c: true, d: true }, frame: 0 }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'lightbox-wrap');
        const box = el('div', 'lightbox');
        const FL = (k) => 1.32 + k * 16.447;
        STRIPS.forEach((st, idx) => {
          const id = st.id;
          const row = el('div', 'strip-row');
          const strip = el('div', 'strip' + (d.flip[id] ? ' flipped' : ''));
          strip.innerHTML = `<img src="${P}props/strip-${id}.webp" alt="필름 ${idx + 1}번째 줄" decoding="async"><div class="strip-edge"><span class="brand">MIRU 400</span>${Array.from({ length: 6 }, (_, k) => `<span class="fno" style="left:${(FL(k) + 9.5).toFixed(2)}%">${st.start + k}</span>`).join('')}</div>`;
          for (let v = 0; v < 6; v++) {
            const k = d.flip[id] ? 5 - v : v; // 뒤집힌 줄은 보이는 자리와 실제 컷 순서가 반대
            const n = st.start + k;
            const f = el('button', 'frame-btn' + (d.frame === n ? ' picking' : '')); f.type = 'button'; f.style.left = FL(v) + '%';
            f.setAttribute('aria-label', `${idx + 1}번째 줄 ${v + 1}번째 컷 루페로 보기`);
            f.onclick = () => { d.frame = n; save(); };
            strip.append(f);
          }
          const tools = el('div', 'strip-tools');
          const fl = el('button', 'ctl', '⇄'); fl.type = 'button'; fl.setAttribute('aria-label', `${idx + 1}번째 줄 뒤집기`); fl.onclick = () => { d.flip[id] = !d.flip[id]; save(); };
          tools.append(fl);
          row.append(strip, tools); box.append(row);
        });
        wrap.append(box);
        if (d.frame) {
          const st = STRIPS.find((x) => d.frame >= x.start && d.frame <= x.end); const k = d.frame - st.start;
          const posX = (FL(k) / (100 - 14.87)) * 100;
          const lp = el('figure', 'film-loupe st-loupe');
          lp.innerHTML = `<div class="film-loupe-glass"><div class="film-loupe-img${d.flip[st.id] ? ' mirror' : ''}" style="background-image:url(${P}props/strip-${st.id}.webp);background-position:${posX.toFixed(2)}% 50%"></div></div><figcaption>루페로 본 컷 · ${STRIPS.indexOf(st) + 1}번째 줄 · 가장자리 번호 ${d.frame}${d.flip[st.id] ? ' (거울 글씨)' : ''}</figcaption>`;
          wrap.append(lp);
        } else wrap.append(el('p', 'pick-label', '컷을 누르면 루페로 크게 본다'));
        return wrap;
      },
      commitLabel: '이 컷으로 인화',
      canCommit: (d) => !!d.frame,
      check(d) {
        if (d.frame === FRAME_ANSWER && !d.flip.d) return { ok: true };
        return { ok: false, msg: '인화지에 올리기 전에 루페로 한 번 더 봤다 이대로는 아니다' };
      },
      reveal: {
        title: '23컷',
        text: '네 번째 줄 다섯 번째 컷 셋이 나란히 웃고 있고 머리 위로 흰 간판 「미루사진관」 바로 앞 컷은 같은 자리인데 흔들렸고, 그 앞 컷엔 간판이 안 들어왔다',
        scene: ['필름을 슬리브에 넣고 작은 열쇠를 들었다 암실 문은 접수실 뒤 붉은 등 밑이다'],
        unlock: 'darkroom',
      },
    },

    print: {
      title: '확대기와 트레이',
      scene: 'darkroom',
      intro: '스위치 둘은 흰 불과 붉은 등을 켜고 끈다 인화지를 꺼내 이젤에 올리고, 초점 손잡이와 타이머를 맞춘 뒤 타이머를 누르면 노출된다 트레이는 누른 순서대로 인화지를 담근다',
      docs: ['chart', 'memo', 'pressed'],
      hintCode: '',
      hints: [
        '라벨 없는 트레이 셋 약품 메모를 먼저 읽고, 흰 불이 켜져 있을 때 트레이를 봐 둔다',
        '노출은 봉투의 시험 인화 초에서 순서표의 크기 단계만큼 두 배씩 트레이는 누런 물 · 빙초산 병 · 파란 테이프 집게가 각각 무엇인지 메모로 맞춘다',
        '흰 불 켜고 트레이 확인 → 흰 불 끔 · 붉은 등 켬 → 인화지 → 초점 60~70 → 타이머 12초 → 오른쪽 → 왼쪽 → 가운데 트레이',
      ],
      initial: () => ({ white: false, red: true, paper: false, focus: 20, timer: 0, exposed: false, expT: 0, baths: [], ruined: false }),
      render(ctx) {
        const { d, el, save } = ctx;
        const mode = d.white ? 'white' : d.red ? 'red' : 'dark';
        const wrap = el('div', 'print-wrap st-print ' + mode);
        // 1 불
        const lights = el('div', 'light-row');
        const w = el('button', 'switch' + (d.white ? ' on' : ''), `흰 불 ${d.white ? '켜짐' : '꺼짐'}`); w.type = 'button'; w.setAttribute('aria-label', '흰 불 스위치');
        w.onclick = () => { d.white = !d.white; const burn = d.white && d.paper && !d.baths.includes(2); if (burn) d.ruined = true; save(); if (burn) ctx.status('정착 전에 흰 불이 켜졌다 인화지가 까맣게 탔다'); };
        const r = el('button', 'switch red' + (d.red ? ' on' : ''), `붉은 등 ${d.red ? '켜짐' : '꺼짐'}`); r.type = 'button'; r.setAttribute('aria-label', '붉은 등 스위치'); r.onclick = () => { d.red = !d.red; save(); };
        lights.append(w, r); wrap.append(lights);
        // 2 확대기 + 확대경
        const grid = el('div', 'st-print-grid');
        const off = Math.max(0, Math.abs(d.focus - 65) - 5);
        const enl = el('div', 'prop enlarger'); enl.innerHTML = `<img src="${P}props/enlarger.webp" alt="확대기와 타이머" decoding="async"><div class="easel-paper${d.paper ? ' in' : ''}"></div><div class="projection" style="filter:blur(${off / 6}px)"><img src="${P}props/print.webp" alt="" decoding="async"></div>`;
        const loupe = el('figure', 'focus-loupe'); loupe.innerHTML = `<div class="loupe-glass"><img src="${P}props/print.webp" alt="확대경으로 본 이젤 위의 상" decoding="async" style="filter:invert(1) sepia(.4) blur(${(off / 3).toFixed(1)}px)"></div><figcaption>확대경으로 본 이젤 위 상</figcaption>`;
        grid.append(enl, loupe); wrap.append(grid);
        const ctl = el('div', 'enl-controls');
        const paperBtn = el('button', 'chip' + (d.paper ? ' on' : ''), d.paper ? '인화지 올려짐 (8×10)' : '인화지 꺼내 올리기 (8×10)'); paperBtn.type = 'button';
        paperBtn.onclick = () => { if (d.paper) return; if (d.white) { ctx.status('흰 불 아래서 인화지를 꺼내면 바로 타 버린다'); return; } if (!d.red) { ctx.status('깜깜해서 손이 안 보인다'); return; } d.paper = true; save(); };
        const fl = el('label', 'tilt-label'); fl.append(el('span', '', `초점 손잡이 ${d.focus}`)); const fr = el('input'); fr.type = 'range'; fr.min = 0; fr.max = 100; fr.step = 5; fr.value = d.focus; fr.setAttribute('aria-label', '초점 손잡이');
        fr.oninput = () => { d.focus = Number(fr.value); const o = Math.max(0, Math.abs(d.focus - 65) - 5); enl.querySelector('.projection').style.filter = `blur(${o / 6}px)`; loupe.querySelector('img').style.filter = `invert(1) sepia(.4) blur(${(o / 3).toFixed(1)}px)`; fl.firstChild.textContent = `초점 손잡이 ${d.focus}`; };
        fr.onchange = () => save(); fl.append(fr);
        const tl = el('label', 'tilt-label'); tl.append(el('span', '', `타이머 ${d.timer}초`)); const tr = el('input'); tr.type = 'range'; tr.min = 0; tr.max = 30; tr.step = 1; tr.value = d.timer; tr.setAttribute('aria-label', '타이머');
        tr.oninput = () => { d.timer = Number(tr.value); tl.firstChild.textContent = `타이머 ${d.timer}초`; }; tr.onchange = () => save(); tl.append(tr);
        const exp = el('button', 'chip' + (d.exposed ? ' on' : ''), d.exposed ? `노출 끝 · ${d.expT}초` : '타이머 누르기 (노출)'); exp.type = 'button'; exp.setAttribute('aria-label', '타이머 누르기');
        exp.onclick = () => {
          if (d.exposed) return;
          if (!d.paper) { ctx.status('이젤에 인화지가 없다'); return; }
          if (Math.abs(d.focus - 65) > 5) { ctx.status('확대경 속 상이 흐리다 이대로는 못 굽는다'); return; }
          if (!d.timer) { ctx.status('타이머가 0초다'); return; }
          d.exposed = true; d.expT = d.timer; save();
        };
        ctl.append(paperBtn, fl, tl, exp); wrap.append(ctl);
        // 3 트레이 (흰 불일 때만 색이 보인다)
        const trays = el('div', 'prop trays'); trays.innerHTML = `<img src="${P}props/${d.white ? 'trays-white' : 'trays'}.webp" alt="${d.white ? '흰 불 아래 트레이 셋: 오른쪽 트레이 물이 누렇고, 가운데 집게 손잡이에 파란 테이프, 왼쪽 트레이 뒤 병에 빨간 글씨 빙초산' : '붉은 등 아래 트레이 셋 다 같은 빨강이다'}" decoding="async">`;
        [1, 2, 3].forEach((n, i) => {
          const b = el('button', 'tray-btn' + (d.baths.includes(n) ? ' done' : '')); b.type = 'button'; b.style.left = [3, 35.2, 67][i] + '%';
          b.setAttribute('aria-label', `${TRAY_NAME[n]} 트레이에 담그기`); b.innerHTML = `<span>${d.baths.includes(n) ? d.baths.indexOf(n) + 1 : ''}</span>`;
          b.onclick = () => { if (!d.exposed) { ctx.status('아직 노출 전이다'); return; } if (d.baths.includes(n)) return; d.baths.push(n); save(); };
          trays.append(b);
        });
        wrap.append(el('p', 'pick-label', d.exposed ? '노출한 인화지를 트레이에 차례로 담근다' : '트레이 셋'), trays);
        // 휴대폰에선 사진 속 병 라벨 글씨가 너무 작다 흰 불일 때만 글자로 같이 (사진에 보이는 것만)
        if (d.white) wrap.append(el('p', 'pick-label mobile-only', '왼쪽 트레이 뒤 병 라벨 「빙초산」'));
        // 방금 꺼내 본 망친 인화지: 진하기(노출)와 얼룩(트레이 순서)을 따로 보여 준다 답은 말하지 않는다
        if (d.fail) {
          const f = el('figure', 'st-fail' + (d.fail.tone ? ' ' + d.fail.tone : '') + (d.fail.smear ? ' smear' : ''));
          f.innerHTML = `<div class="st-fail-img"><img src="${P}props/print.webp" alt="" decoding="async"><i></i></div><figcaption>${failText(d.fail)}</figcaption>`;
          wrap.append(f);
        }
        const reset = el('button', 'chip', '인화지 버리고 처음부터'); reset.type = 'button'; reset.onclick = () => { Object.assign(d, { paper: false, exposed: false, expT: 0, baths: [], ruined: false, fail: null }); save(); ctx.status('새 인화지는 붉은 등 아래서 다시 꺼내 올린다'); };
        wrap.append(reset);
        return wrap;
      },
      commitLabel: '정착 트레이에서 꺼내 보기',
      check(d) {
        if (!d.exposed) return { ok: false, msg: '아직 노출 전이다' };
        if (d.baths.length < 3) return { ok: false, msg: `트레이 ${d.baths.length}개만 거쳤다` };
        if (d.ruined) return { ok: false, msg: '흰 불에 탄 인화지다 버리고 다시' };
        const tone = d.expT > EXPOSURE ? 'dark' : d.expT < EXPOSURE ? 'light' : '';
        const smear = d.baths.join('') !== TRAY_ANSWER.join('');
        if (tone || smear) { d.fail = { tone, smear }; return { ok: false, msg: `꺼내 보니 ${failText(d.fail)} 인화지를 버리고 다시 한다` }; }
        return { ok: true };
      },
      reveal: {
        title: '스무 해 만의 한 장',
        text: '정착 트레이 안, 붉은 등 아래서 상이 끝까지 올라왔다 세 사람이 흰 간판 「미루사진관」 아래 서 있다 2006년 봄, 간판을 새로 단 이듬해다',
        scene: ['빈 필름 봉투를 접다가 안쪽에 접혀 있던 쪽지 한 장이 손에 걸렸다', '접수실 쪽에서 문 열리는 소리가 났다 할아버지 목소리, 그리고 모르는 여자 목소리 "스무 해 만이네요 사장님"'],
        unlockDoc: 'photo',
        ending: true,
        endingLabel: '암실 문이 열린다',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '사진 벽 아래 줄 빈 액자 옆에 나란히 선 할아버지와 윤서 씨, 앞에서 카메라를 든 손주의 손',
    eyebrow: '같은 날 밤',
    title: '비가 그친 사진관',
    paragraphs: [
      '윤서 씨는 마흔 넘은 사람이었다 암실 문을 열자 트레이를 먼저 보고, 그다음 나를 보고, 할아버지를 봤다 붉은 등 아래서 셋이 머리를 맞대고 물속 사진을 들여다봤다',
      '할아버지가 내 어깨를 툭 쳤다 "혼자 다 해 놨네 말리는 건 같이 하자"',
      '"그날 아침에 찍고 저는 그날 저녁 비행기였어요 아빠가 돌아오면 같이 찾자고 했는데, 이듬해 겨울에 아빠가 먼저 가셨어요" 윤서 씨는 거기서 말을 끊었다 할아버지가 집게로 사진을 들어 물을 뺐다',
      '"스무 해 동안 인화 안 한 봉투는 이거 하나다" 할아버지가 말했다 "손님이 찾으러 온다고 했으면 오는 거야"',
      '흰 불은 할아버지가 켰다 젖은 사진은 줄에 걸었다 마르면 벽 맨 아래 줄 빈 액자에 들어갈 거다 8×10 할아버지가 비워 두라던 자리다 윤서 씨가 그 빈 액자 앞에서 사진을 찍어도 되냐고 물었다 할아버지는 카메라를 내줬다 처음으로 할아버지가 사진 안에 섰다',
    ],
    afterword: '윤서 씨를 배웅하러 문을 여니 비가 그쳐 있었다 젖은 길에 가로등 불빛이 번져 있었다 봉투는 비워진 채 C3에 그대로 있다 할아버지가 그건 버리지 말라고 했다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=station', title: '세 번째 승강장', line: '다음은 없는 승강장에서 온 사진 이야기입니다' },
  },
};
