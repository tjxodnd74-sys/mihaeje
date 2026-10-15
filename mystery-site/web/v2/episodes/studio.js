// 비가 그친 사진관 — ★2. 이야기·자료·장치가 전부 이 파일에 있습니다.
const P = 'assets/v2/studio/';
const js = (w, a, b) => { const c = w.charCodeAt(w.length - 1); if (c < 0xac00 || c > 0xd7a3) return w + a; return w + ((c - 0xac00) % 28 ? a : b); };

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

const CELLS = ['A', 'B', 'C', 'D'].flatMap((r) => [1, 2, 3, 4].map((c) => r + c));
const LOCKER_ANSWER = 'D3'; // 봉투엔 C3, 장부 메모: 2010년 선반 교체로 C열이 D열로 밀림
const STRIPS = [
  { id: 'a', start: 1, end: 6 },
  { id: 'b', start: 7, end: 12 },
  { id: 'c', start: 13, end: 18 },
  { id: 'd', start: 19, end: 24 },
];
const FRAME_ANSWER = 23;
const EXPOSURE = 12;

export default {
  id: 'studio',
  number: '007',
  title: '비가 그친 사진관',
  subtitle: '스무 해 동안 기다린 한 장',
  genre: '사진관 · 조작 미스터리',
  minutes: 22,
  difficulty: 2,
  cover: P + 'cover.webp',
  coverAlt: '창가에서 필름을 빛에 비춰 보는 할아버지의 손',
  music: 'assets/music/studio-v33.mp3',
  tagline: '2006년 3월에 맡긴 필름\n오늘 찾으러 온다고 했다',
  blurb: '할아버지가 마흔 해 지킨 동네 사진관\n스무 해 전 봉투 하나가 접수대에 남아 있고, 오늘 저녁 그 주인이 돌아옵니다',
  storageKey: 'mihaeje-v2-studio',
  hintTitle: '할아버지의 전화',

  opening: {
    eyebrow: '4월 3일, 비 그친 오후',
    paragraphs: [
      '할아버지 사진관은 역 앞 골목에서 마흔 해째다 요즘은 증명사진 손님이 하루 둘셋 나는 방학마다 와서 접수대를 보는 손주다',
      '오늘은 할아버지가 점심 먹고 나가면서 쪽지를 남겼다 "윤서 씨 필름, 인화 준비해 둬라 저녁에 온다 봉투는 접수대" 윤서 씨가 누군지는 모른다 봉투는 2006년 3월 것이었다',
      '봉투 겉면 이름 칸은 비에 젖어 번져 있었다 보관 칸 번호만 간신히 보인다 비가 그치고 유리창에 물이 흘러내렸다',
    ],
    cta: '접수대의 봉투 보기',
  },

  traces: [
    { device: 'lamp', label: '눌린 글씨' },
    { device: 'lockers', label: '보관함' },
    { device: 'lightbox', label: '필름 순서' },
    { device: 'print', label: '인화' },
  ],

  scenes: [
    {
      id: 'front',
      name: '접수실',
      image: P + 'front.webp',
      arrive: '비 냄새가 문틈으로 들어온다 접수대 위 초록 등 밑에 누런 봉투, 왼쪽 벽은 필름 보관함, 뒤쪽 문 위에는 붉은 등이 꺼진 채 달려 있다 암실 문은 잠겨 있다',
      hotspots: [
        { id: 'gnote', x: 50, y: 80, label: '접수대의 할아버지 쪽지', kind: 'doc', doc: 'gnote' },
        { id: 'ledger', x: 64, y: 86, label: '접수 장부', kind: 'doc', doc: 'ledger' },
        { id: 'wall', x: 70, y: 36, label: '벽의 사진들', kind: 'doc', doc: 'wall' },
        { id: 'lamp', x: 56, y: 70, label: '초록 등 밑의 봉투', kind: 'device', device: 'lamp' },
        { id: 'lockers', x: 11, y: 48, label: '필름 보관함', kind: 'device', device: 'lockers' },
        { id: 'sleeve', x: 11, y: 62, label: '보관함에서 꺼낸 필름 봉투', kind: 'doc', doc: 'sleeve', visible: (S) => S.solved.includes('lockers') },
      ],
    },
    {
      id: 'table',
      name: '작업대',
      image: P + 'table.webp',
      unlockedBy: 'lockers',
      arrive: '라이트박스를 켜자 작업대가 하얗게 떴다 필름 네 줄을 올려놓았다 순서도 앞뒤도 제멋대로다 장갑을 꼈다',
      hotspots: [
        { id: 'lightbox', x: 46, y: 56, label: '라이트박스 위 필름', kind: 'device', device: 'lightbox' },
        { id: 'loupe', x: 54, y: 48, label: '루페로 본 필름 가장자리', kind: 'doc', doc: 'edge' },
      ],
    },
    {
      id: 'darkroom',
      name: '암실',
      image: P + 'darkroom.webp',
      unlockedBy: 'lightbox',
      arrive: '작은 열쇠가 돌아갔다 암실은 약품 냄새와 어둠 벽에 할아버지 글씨로 순서표가 붙어 있고, 확대기 옆에 타이머, 그 옆에 트레이 셋',
      hotspots: [
        { id: 'chart', x: 85, y: 30, label: '벽의 순서표', kind: 'doc', doc: 'chart' },
        { id: 'print', x: 30, y: 50, label: '확대기와 트레이', kind: 'device', device: 'print' },
      ],
    },
  ],

  docs: {
    gnote: {
      title: '접수대의 할아버지 쪽지',
      kind: '할아버지 글씨',
      html: `<blockquote class="hand">수호야<br>윤서 씨 필름 인화 준비해 둬라 저녁에 온다<br>봉투는 접수대에 있다 이름은 번졌어도 칸 번호는 보일 거다<br>컷은 윤서 씨가 동그라미 쳐 둔 거 하나다 크기하고 노출은 봉투에 적어 뒀다<br>암실 열쇠는 필름 봉투 안에 넣어 뒀다<br>— 할아버지</blockquote><p>봉투에 적어 뒀다는데 봉투 겉면은 번져서 글자가 안 보인다</p>`,
    },
    ledger: {
      title: '접수 장부',
      kind: '2006년 3월',
      html: `<div class="paper-table"><p class="pt-head">접수 장부 · 2006년 3월</p><table><tr><th>날짜</th><th>접수</th><th>이름</th><th>보관</th><th>비고</th></tr>
<tr><td>3. 2</td><td>0611</td><td>박○○</td><td>B2</td><td>증명 4매</td></tr>
<tr><td>3. 9</td><td>0614</td><td>최○○</td><td>C2</td><td>가족 8×10</td></tr>
<tr><td>3. 11</td><td>0615</td><td>○윤서</td><td class="mono">C3</td><td>필름 4줄 · 인화 보류 (손님 사정)</td></tr>
<tr><td>3. 15</td><td>0617</td><td>이○○</td><td>C4</td><td>여권</td></tr>
</table><p class="pt-foot hand-note">※ 2010. 6 선반 교체 — C열 서랍은 한 칸씩 아래 D열로 옮겨 꽂음 (라벨 안 바꿈)</p></div><p>2006년 봉투와 2010년 선반 교체 봉투의 칸 번호를 그대로 믿으면 안 된다는 뜻이다</p>`,
    },
    wall: {
      title: '벽의 사진들',
      kind: '손님들과 동네',
      html: `<p>벽에는 사십 년 치 손님 사진이 걸려 있다 결혼, 돌, 졸업, 여권 할아버지는 늘 카메라 뒤에 있어서 한 장도 없다</p><p>맨 아래 줄에 빈 액자가 하나 걸려 있다 8×10 크기 할아버지가 "거긴 비워 둬라" 했던 자리다</p>`,
    },
    sleeve: {
      title: '보관함에서 꺼낸 필름 봉투',
      kind: '2006년 · 할아버지 글씨',
      html: `<blockquote class="hand">접수 0615 · 윤서<br>필름 4줄 (MIRU 400)<br>인화: 동그라미 컷 1장 · 8×10 · 노출 12초<br>※ 손님 돌아오면 같이 인화하기로 함</blockquote><p>봉투 안에 작은 열쇠 하나 꼬리표에 「암실」 그리고 필름 네 줄 손님이 돌아오면 같이 하기로 했다는 게 스무 해 전이다</p>`,
    },
    edge: {
      title: '루페로 본 필름 가장자리',
      kind: '작업대',
      html: `<p>필름 가장자리에는 제조사 이름과 프레임 번호가 찍혀 있다 글자가 바르게 읽히는 쪽이 앞면이다 뒤집혀 있으면 글자가 거울처럼 뒤집혀 보인다</p><p>네 줄은 원래 한 롤이었다 번호가 1에서 24까지 이어져야 한다</p>`,
    },
    chart: {
      title: '벽의 순서표',
      kind: '할아버지 글씨 · 암실',
      html: `<blockquote class="hand">1 흰 불 끄고 붉은 등만<br>2 인화지는 그다음에 꺼낸다<br>3 확대기 초점 맞추고, 타이머는 봉투에 적힌 초<br>4 노출 뒤 트레이: 현상 → 정지 → 정착<br>5 정착 끝나야 흰 불 켠다</blockquote><p>트레이 라벨은 떨어져 나갔다 왼쪽부터 현상, 정지, 정착이라고 할아버지가 늘 말했다</p>`,
    },
    final: {
      title: '사진 뒷면의 글씨',
      kind: '2006년 · 윤서 아버지의 글씨',
      locked: true,
      html: `<figure class="prop oldphoto"><img src="${P}props/print.webp" alt="2006년 봄, 사진관 앞에서 부모님과 선 윤서" decoding="async"></figure><blockquote class="hand">2006. 3. 11<br>윤서 유학 가는 날 아침, 사진관 앞에서<br>돌아오면 같이 찾으러 오자<br>— 아빠</blockquote><p>윤서 씨는 그해 봄에 떠났고, 부모님은 그 뒤로 사진관에 오지 못했다 할아버지는 인화를 보류해 두고 봉투를 스무 해 동안 보관함에 두었다</p>`,
    },
  },

  devices: {
    lamp: {
      title: '초록 등 밑의 봉투',
      scene: 'front',
      intro: '봉투 겉면 글씨는 번졌다 그런데 위에 다른 종이를 대고 눌러 쓴 자국이 남아 있을지 모른다 등 밑에서 봉투를 기울여 본다',
      docs: ['gnote'],
      hintCode: 'S-S01',
      hints: [
        '볼펜으로 눌러 쓴 자국은 빛을 비스듬히 받을 때 보입니다 기울기를 천천히 올려 보세요',
        '30도에서 45도 사이에서 글자가 드러납니다',
        '기울기 35도 전후 — 「C3 · 23 · 8×10 · 12초」',
      ],
      initial: () => ({ angle: 0 }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'lamp-wrap');
        const env = el('div', 'prop envtilt'); const lit = d.angle >= 30 && d.angle <= 45; env.innerHTML = `<div class="tiltbox"><img src="${P}props/envelope.webp" alt="초록 등 밑의 누런 봉투" decoding="async"><div class="pressed${lit ? ' lit' : ''}" style="opacity:${lit ? 1 : Math.max(0, 1 - Math.abs(d.angle - 37) / 12)}">C3 · 23 · 8×10 · 12초</div><div class="glare" style="transform:translateX(${(d.angle - 35) * 2}%)"></div></div>`;
        env.style.setProperty('--tilt', d.angle + 'deg');
        wrap.append(env);
        const lab = el('label', 'tilt-label'); lab.append(el('span', '', `기울기 ${d.angle}°`));
        const r = el('input'); r.type = 'range'; r.min = 0; r.max = 70; r.step = 1; r.value = d.angle; r.setAttribute('aria-label', '봉투 기울기');
        r.oninput = () => { d.angle = Number(r.value); save(); };
        lab.append(r); wrap.append(lab);
        return wrap;
      },
      commitLabel: '글자 읽기',
      check(d) {
        if (d.angle >= 30 && d.angle <= 45) return { ok: true };
        if (d.angle < 30) return { ok: false, msg: '아직 평평하다 빛이 비스듬히 들어와야 눌린 자국이 그림자를 만든다 더 기울이자' };
        return { ok: false, msg: '너무 세웠다 빛이 다 미끄러진다 조금 내리자' };
      },
      reveal: {
        title: 'C3 · 23 · 8×10 · 12초',
        text: '봉투 위에 다른 종이를 대고 쓴 자국이 비스듬한 빛에 떠올랐다 보관 C3, 인화할 컷 23, 크기 8×10, 노출 12초 할아버지 글씨다',
        scene: ['C3 보관함 왼쪽 벽 서랍 열여섯 개 중 하나 그런데 장부 밑에 선반을 바꿨다는 메모가 있었다'],
        unlock: null,
      },
    },

    lockers: {
      title: '필름 보관함',
      scene: 'front',
      intro: '서랍 열여섯 칸, 라벨은 A1부터 D4 봉투의 칸은 C3 장부의 메모를 믿는다면 그 칸이 아닐 수도 있다',
      docs: ['ledger', 'gnote'],
      hintCode: 'S-S02',
      hints: [
        '봉투에는 C3라고 적혀 있습니다 그런데 장부 밑 메모에 2010년 선반 교체 얘기가 있습니다',
        'C열 서랍을 한 칸씩 아래 D열로 옮겼고 라벨은 안 바꿨다고 합니다 C3에 있던 건 지금 어디일까요',
        'D3',
      ],
      initial: () => ({ open: null }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'lockers-wrap');
        const cab = el('div', 'prop lockerwall'); const im = el('img'); im.src = P + 'props/lockers.webp'; im.alt = '4×4 필름 보관함'; cab.append(im);
        const cols = [22, 37, 52, 67], rows = [11, 30, 49.5, 69];
        CELLS.forEach((id, i) => {
          const b = el('button', 'locker-cell' + (d.open === id ? ' picking' : '')); b.type = 'button';
          b.style.left = cols[i % 4] + '%'; b.style.top = rows[Math.floor(i / 4)] + '%';
          b.setAttribute('aria-label', `${id} 서랍 열기`); b.innerHTML = `<span class="plate">${id}</span>`;
          b.onclick = () => { d.open = d.open === id ? null : id; save(); };
          cab.append(b);
        });
        wrap.append(cab);
        if (!d.open) wrap.append(el('p', 'pick-label', '서랍을 하나 고른다'));
        else if (d.open === 'C3') wrap.append(el('p', 'pick-label', 'C3 — 2010년 이후 봉투 하나 「최○○ 2012」 2006년 것은 없다'));
        else if (d.open === LOCKER_ANSWER) wrap.append(el('p', 'pick-label', 'D3 — 누런 봉투 하나 접수 0615 2006년 3월'));
        else wrap.append(el('p', 'pick-label', `${d.open} — 다른 손님 봉투들 2006년 0615는 없다`));
        return wrap;
      },
      commitLabel: '이 서랍의 봉투 꺼내기',
      canCommit: (d) => !!d.open,
      check(d) {
        if (d.open === LOCKER_ANSWER) return { ok: true };
        if (d.open === 'C3') return { ok: false, msg: 'C3에는 2012년 봉투뿐이다 장부 밑 메모: 2010년에 C열을 한 칸씩 아래로 옮겼고 라벨은 그대로다' };
        if (d.open[0] === 'D') return { ok: false, msg: `${d.open}은 다른 손님 거다 C3에 있던 게 한 칸 아래로 갔다면 열은 D, 번호는 그대로다` };
        return { ok: false, msg: `${d.open}은 아니다 봉투의 C3에서 출발해서 장부 메모대로 옮겨 보자` };
      },
      reveal: {
        title: 'D3',
        text: 'D3 서랍 안에 접수 0615 봉투 필름 네 줄과 할아버지 메모, 그리고 꼬리표 달린 작은 열쇠 「암실」',
        scene: ['필름을 작업대 라이트박스로 가져갔다 암실 문은 그다음이다 어느 컷인지부터 찾아야 한다'],
        unlock: 'table',
      },
    },

    lightbox: {
      title: '라이트박스 위 필름',
      scene: 'table',
      intro: '네 줄을 번호가 1부터 24까지 이어지게 놓고, 뒤집힌 줄은 바로 놓는다 그다음 동그라미 친 23컷을 짚는다',
      docs: ['edge', 'sleeve'],
      hintCode: 'S-S03',
      hints: [
        '가장자리 글자가 거울처럼 뒤집혀 보이면 그 줄은 뒤집힌 겁니다 글자부터 바로 세우세요',
        '바로 세운 뒤 가장자리 번호를 읽습니다 1-6, 7-12, 13-18, 19-24 순서로 위에서 아래로',
        '순서 a·b·c·d, 뒤집힘 없음, 네 번째 줄의 다섯 번째 컷(23)',
      ],
      initial: () => ({ order: ['c', 'a', 'd', 'b'], flip: { a: true, b: false, c: true, d: false }, frame: 0 }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'lightbox-wrap');
        const box = el('div', 'lightbox');
        d.order.forEach((id, idx) => {
          const st = STRIPS.find((s) => s.id === id);
          const row = el('div', 'strip-row');
          const strip = el('div', 'strip' + (d.flip[id] ? ' flipped' : ''));
          strip.innerHTML = `<img src="${P}props/strip-${id}.webp" alt="필름 ${idx + 1}번째 줄" decoding="async"><div class="strip-edge"><span class="brand">MIRU 400</span>${Array.from({ length: 6 }, (_, k) => `<span class="fno">${st.start + k}</span>`).join('')}</div>`;
          for (let k = 0; k < 6; k++) {
            const n = st.start + k;
            const f = el('button', 'frame-btn' + (d.frame === n ? ' picking' : '') + (n === FRAME_ANSWER ? ' circled' : '')); f.type = 'button'; f.style.left = (4.5 + k * 15.3) + '%';
            f.setAttribute('aria-label', `${idx + 1}번째 줄 ${k + 1}번째 컷 짚기`);
            f.onclick = () => { d.frame = d.frame === n ? 0 : n; save(); };
            strip.append(f);
          }
          const tools = el('div', 'strip-tools');
          const up = el('button', 'ctl', '▲'); up.type = 'button'; up.disabled = idx === 0; up.setAttribute('aria-label', `${idx + 1}번째 줄 위로`); up.onclick = () => { [d.order[idx - 1], d.order[idx]] = [d.order[idx], d.order[idx - 1]]; save(); };
          const dn = el('button', 'ctl', '▼'); dn.type = 'button'; dn.disabled = idx === 3; dn.setAttribute('aria-label', `${idx + 1}번째 줄 아래로`); dn.onclick = () => { [d.order[idx + 1], d.order[idx]] = [d.order[idx], d.order[idx + 1]]; save(); };
          const fl = el('button', 'ctl', '⇄'); fl.type = 'button'; fl.setAttribute('aria-label', `${idx + 1}번째 줄 뒤집기`); fl.onclick = () => { d.flip[id] = !d.flip[id]; save(); };
          tools.append(up, dn, fl);
          row.append(strip, tools); box.append(row);
        });
        wrap.append(box, el('p', 'pick-label', d.frame ? `짚은 컷: ${d.frame}` : '가장자리 번호를 보고 줄을 정리한 뒤, 컷을 하나 짚는다'));
        return wrap;
      },
      commitLabel: '이 컷으로 인화',
      check(d) {
        const flipped = STRIPS.filter((s) => d.flip[s.id]);
        if (flipped.length) return { ok: false, msg: `${flipped.length}줄이 아직 뒤집혀 있다 가장자리 글자가 거울처럼 보이는 줄을 찾자` };
        if (d.order.join('') !== 'abcd') return { ok: false, msg: '번호가 이어지지 않는다 위에서 아래로 1부터 24까지 흐르게 놓자' };
        if (!d.frame) return { ok: false, msg: '인화할 컷을 아직 안 짚었다 봉투에 적힌 번호의 컷이다' };
        if (d.frame !== FRAME_ANSWER) return { ok: false, msg: `${d.frame}컷? 봉투와 눌린 글씨에 적힌 번호는 그게 아니다 동그라미가 쳐진 컷을 찾자` };
        return { ok: true };
      },
      reveal: {
        title: '23컷',
        text: '네 번째 줄 다섯 번째 컷, 가장자리에 연필로 작은 동그라미 네거티브라 얼굴이 검게 뒤집혀 있지만 세 사람이 사진관 앞에 서 있는 건 보인다',
        scene: ['필름을 슬리브에 넣고 작은 열쇠를 들었다 암실 문은 접수실 뒤 붉은 등 밑이다'],
        unlock: 'darkroom',
      },
    },

    print: {
      title: '확대기와 트레이',
      scene: 'darkroom',
      intro: '순서표대로 한다 불부터 그다음 확대기, 타이머, 그다음 트레이 셋 순서가 틀리면 인화지는 못 쓴다',
      docs: ['chart', 'sleeve'],
      hintCode: 'S-S04',
      hints: [
        '흰 불을 끄고 붉은 등만 켜야 인화지를 꺼낼 수 있습니다 그다음 초점과 타이머',
        '타이머는 봉투에 적힌 12초 초점은 상이 또렷해지는 자리(바늘이 가운데쯤) 트레이는 현상, 정지, 정착 순서로 왼쪽부터',
        '흰 불 끔 · 붉은 등 켬 · 초점 60~70 · 타이머 12 · 트레이 1→2→3',
      ],
      initial: () => ({ white: true, red: false, paper: false, focus: 20, timer: 0, exposed: false, baths: [] }),
      render(ctx) {
        const { d, el, save } = ctx;
        const wrap = el('div', 'print-wrap' + (d.white ? ' white' : d.red ? ' red' : ' dark'));
        // 1 불
        const lights = el('div', 'light-row');
        const w = el('button', 'switch' + (d.white ? ' on' : ''), `흰 불 ${d.white ? '켜짐' : '꺼짐'}`); w.type = 'button'; w.setAttribute('aria-label', '흰 불 스위치'); w.onclick = () => { d.white = !d.white; if (d.white && d.paper && !d.baths.includes(3)) { d.ruined = true; } save(); };
        const r = el('button', 'switch red' + (d.red ? ' on' : ''), `붉은 등 ${d.red ? '켜짐' : '꺼짐'}`); r.type = 'button'; r.setAttribute('aria-label', '붉은 등 스위치'); r.onclick = () => { d.red = !d.red; save(); };
        lights.append(w, r); wrap.append(lights);
        // 2 확대기
        const enl = el('div', 'prop enlarger'); enl.innerHTML = `<img src="${P}props/enlarger.webp" alt="확대기와 타이머" decoding="async"><div class="easel-paper${d.paper ? ' in' : ''}"></div><div class="projection" style="filter:blur(${Math.max(0, Math.abs(d.focus - 65) - 5) / 6}px)"><img src="${P}props/print.webp" alt="" decoding="async"></div>`;
        wrap.append(enl);
        const ctl = el('div', 'enl-controls');
        const paperBtn = el('button', 'chip' + (d.paper ? ' on' : ''), d.paper ? '인화지 올려짐 (8×10)' : '인화지 꺼내 올리기 (8×10)'); paperBtn.type = 'button'; paperBtn.onclick = () => { if (d.paper) return; if (d.white || !d.red) { ctx.status('흰 불 아래서 인화지를 꺼내면 바로 타 버린다 불부터'); return; } d.paper = true; save(); };
        const fl = el('label', 'tilt-label'); fl.append(el('span', '', `초점 손잡이 ${d.focus}`)); const fr = el('input'); fr.type = 'range'; fr.min = 0; fr.max = 100; fr.step = 5; fr.value = d.focus; fr.setAttribute('aria-label', '초점 손잡이'); fr.oninput = () => { d.focus = Number(fr.value); save(); }; fl.append(fr);
        const tl = el('label', 'tilt-label'); tl.append(el('span', '', `타이머 ${d.timer}초`)); const tr = el('input'); tr.type = 'range'; tr.min = 0; tr.max = 30; tr.step = 1; tr.value = d.timer; tr.setAttribute('aria-label', '타이머'); tr.oninput = () => { d.timer = Number(tr.value); save(); }; tl.append(tr);
        const exp = el('button', 'chip' + (d.exposed ? ' on' : ''), d.exposed ? '노출 끝' : '타이머 누르기 (노출)'); exp.type = 'button'; exp.setAttribute('aria-label', '타이머 누르기'); exp.onclick = () => {
          if (d.exposed) return;
          if (!d.paper) { ctx.status('인화지가 안 올라가 있다'); return; }
          if (Math.abs(d.focus - 65) > 5) { ctx.status('상이 흐리다 초점 손잡이를 돌려 또렷해지는 자리를 찾자'); return; }
          if (d.timer !== EXPOSURE) { ctx.status(`타이머가 ${d.timer}초다 봉투에 적힌 초가 아니다`); return; }
          d.exposed = true; save();
        };
        ctl.append(paperBtn, fl, tl, exp); wrap.append(ctl);
        // 3 트레이
        const trays = el('div', 'prop trays'); trays.innerHTML = `<img src="${P}props/trays.webp" alt="트레이 셋" decoding="async">`;
        [1, 2, 3].forEach((n, i) => {
          const b = el('button', 'tray-btn' + (d.baths.includes(n) ? ' done' : '')); b.type = 'button'; b.style.left = [14, 41, 68][i] + '%';
          b.setAttribute('aria-label', `${n}번째 트레이에 담그기`); b.innerHTML = `<span>${d.baths.includes(n) ? d.baths.indexOf(n) + 1 : ''}</span>`;
          b.onclick = () => { if (!d.exposed) { ctx.status('아직 노출을 안 했다 트레이는 그다음이다'); return; } if (d.baths.includes(n)) return; d.baths.push(n); save(); };
          trays.append(b);
        });
        wrap.append(el('p', 'pick-label', d.exposed ? '노출한 인화지를 트레이에 순서대로 담근다' : '트레이는 노출 뒤에'), trays);
        const reset = el('button', 'chip', '인화지 버리고 처음부터'); reset.type = 'button'; reset.onclick = () => { Object.assign(d, { paper: false, exposed: false, baths: [], ruined: false }); save(); };
        wrap.append(reset);
        return wrap;
      },
      commitLabel: '흰 불 켜고 사진 보기',
      check(d) {
        if (!d.exposed) return { ok: false, msg: '아직 노출 전이다 불 → 인화지 → 초점 → 타이머 순서다' };
        if (d.baths.length < 3) return { ok: false, msg: `트레이 ${d.baths.length}개만 거쳤다 현상, 정지, 정착 셋 다` };
        if (d.baths.join('') !== '123') return { ok: false, msg: '순서가 틀렸다 사진이 얼룩졌다 현상 → 정지 → 정착, 왼쪽부터 인화지를 버리고 다시' };
        if (d.ruined) return { ok: false, msg: '정착 전에 흰 불이 켜졌었다 인화지가 탔다 버리고 다시' };
        return { ok: true };
      },
      reveal: {
        title: '스무 해 만의 한 장',
        text: '흰 불을 켰다 트레이 안에서 세 사람이 사진관 앞에 서 있다 2006년 봄, 지금보다 젊은 간판 뒷면에 글씨가 있었다',
        scene: ['접수실 쪽에서 문 열리는 소리가 났다 할아버지 목소리, 그리고 모르는 여자 목소리 "스무 해 만이네요 사장님"'],
        ending: true,
        endingLabel: '붉은 등 아래로',
      },
    },
  },

  ending: {
    image: P + 'ending.webp',
    imageAlt: '붉은 안전등 아래 트레이를 들여다보는 할아버지, 윤서, 손주',
    eyebrow: '같은 날 저녁',
    title: '비가 그친 사진관',
    paragraphs: [
      '윤서 씨는 마흔 넘은 사람이었다 암실 문을 열자 트레이를 먼저 보고, 그다음 나를 보고, 할아버지를 봤다 "준비는 손주가 했어 이제 같이 끝내자"',
      '"그날 아침에 찍고 저는 그날 저녁 비행기였어요 아빠가 돌아오면 찾자고 했는데" 윤서 씨는 거기서 말을 끊었다 할아버지가 집게로 사진을 들어 물을 뺐다',
      '"스무 해 동안 인화 안 한 봉투는 이거 하나다" 할아버지가 말했다 "손님이 찾으러 온다고 했으면 오는 거야"',
      '사진은 벽 맨 아래 줄 빈 액자에 들어갔다 8×10 할아버지가 비워 두라던 자리였다 윤서 씨가 한참 보다가 사진을 찍어도 되냐고 물었다 할아버지는 카메라를 내줬다 처음으로 할아버지가 사진 안에 섰다',
    ],
    afterword: '봉투는 비워진 채 D3에 그대로 있다 할아버지가 그건 버리지 말라고 했다',
    unlockDoc: 'final',
    next: { href: 'play.html?case=station', title: '세 번째 승강장', line: '다음은 없는 승강장에서 온 사진 이야기입니다' },
  },
};
