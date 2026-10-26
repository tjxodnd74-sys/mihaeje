// 비가 그친 사진관 — 3D 회색 상자판 (시범)
// 좌표는 미터 단위 · 접수실 x -3~3, z -3~3 · 작업대는 접수실 오른쪽 안쪽 · 암실은 뒷벽 너머 x -3~0, z -6~-3
// 핫스팟 id(kit.hot)는 episodes/studio.js 장면의 hotspots id와 같아야 엔진의 자료·장치 창이 열린다

const WALL = 0x77706a, WALL_D = 0x403434, FLOOR = 0x5a4636, CEIL = 0x3d3a37, WOOD = 0x7a5a3c, WOOD_D = 0x4a3524, METAL = 0x8b8f93, PAPER = 0xefe6d2, KRAFT = 0xc49a5c;

function hand(g, w, h, lines, o = {}) {
  g.fillStyle = o.bg || '#f3ecd9'; g.fillRect(0, 0, w, h);
  g.fillStyle = o.ink || '#2a3570'; g.font = `${o.size || 40}px "Nanum Pen Script", "MihaejeHand", cursive`;
  lines.forEach((t, i) => g.fillText(t, o.x || 30, (o.y || 70) + i * (o.lh || 56)));
}

export default {
  background: 0x0b0c0e,
  fog: [0x0b0c0e, 9, 22],
  build(k) {
    const T = k.THREE;
    // ---------- 빛 ----------
    k.root.add(new T.HemisphereLight(0xcfd6e0, 0x2a2018, 0.35));
    const ceilLamp = k.point(0xffe2b8, 9, 9, [0.2, 2.6, 0.3], { shadow: true });
    k.sphere(0.12, [0.2, 2.68, 0.3], 0xfff1d6, { glow: 0xffe2b8, glowI: 1.4, cast: false });

    // ---------- 접수실 ----------
    k.box([6, 0.05, 6], [0, -0.025, 0], FLOOR, { rough: 0.7 });
    k.box([6, 0.05, 6], [0, 2.825, 0], CEIL, { cast: false });
    k.box([0.1, 2.8, 6], [-3.05, 1.4, 0], WALL);                // 왼쪽 벽
    k.box([0.1, 2.8, 6], [3.05, 1.4, 0], WALL);                 // 오른쪽 벽
    // 뒷벽: 암실 문 자리(x -2.05 ~ -1.15)만 비운다
    k.box([0.95, 2.8, 0.1], [-2.575, 1.4, -3.05], WALL);
    k.box([4.15, 2.8, 0.1], [0.925, 1.4, -3.05], WALL);
    k.box([0.9, 0.75, 0.1], [-1.6, 2.425, -3.05], WALL);
    // 앞벽: 비 오는 유리문과 진열창
    k.box([1.4, 2.8, 0.1], [-2.3, 1.4, 3.05], WALL);
    k.box([1.1, 2.8, 0.1], [2.45, 1.4, 3.05], WALL);
    k.box([3.5, 0.6, 0.1], [0.15, 0.3, 3.05], WALL);
    k.box([3.5, 0.35, 0.1], [0.15, 2.625, 3.05], WALL);
    k.plane(3.5, 1.85, [0.15, 1.525, 3.06], 0x6f8396, { rot: [0, 180, 0], glow: 0x34465a, glowI: 0.9 });
    for (let i = 0; i < 4; i++) k.box([0.05, 1.85, 0.06], [-1.6 + i * 1.17, 1.525, 3.0], WOOD_D);
    k.sign(1.4, 0.3, [0.15, 2.25, 2.99], (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(240,230,210,.85)'; g.font = 'bold 80px SUIT, sans-serif'; g.textAlign = 'center'; g.fillText('미 루 사 진 관', w / 2, 100); }, { alpha: true, rot: [0, 180, 0], px: 700 });
    // 바닥 깔개
    k.box([2.2, 0.01, 1.2], [0.3, 0.005, 1.6], 0x5d2f2a, { cast: false });

    // ---------- 접수대 ----------
    k.box([2.3, 1.0, 0.6], [0.45, 0.5, -0.45], WOOD);
    k.box([2.4, 0.04, 0.7], [0.45, 1.02, -0.45], WOOD_D);
    k.box([2.3, 0.08, 0.02], [0.45, 0.6, -0.14], WOOD_D);
    // 초록 등 + 등 밑 봉투 (장치: lamp)
    const lampG = k.group([0.95, 1.04, -0.55]);
    k.cyl(0.08, 0.09, 0.03, [0, 0.015, 0], 0x6b5a2c, { metal: 0.7, rough: 0.35, parent: lampG });
    k.cyl(0.012, 0.012, 0.32, [0, 0.18, 0], 0x8b7a3c, { metal: 0.7, rough: 0.35, parent: lampG });
    k.cyl(0.11, 0.11, 0.34, [0, 0.36, 0.0], 0x1f6b3a, { open: true, thetaStart: Math.PI, thetaLen: Math.PI, rot: [0, 0, 90], rough: 0.4, double: true, parent: lampG });
    k.point(0xfff0c8, 3.2, 2.2, [0.95, 1.32, -0.5], { shadow: false });
    const env = k.group([0.72, 1.045, -0.38], { rot: [0, 9, 0] });
    k.box([0.34, 0.008, 0.25], [0, 0, 0], KRAFT, { parent: env });
    k.box([0.05, 0.009, 0.05], [0, 0.002, -0.08], 0x7a5a2c, { parent: env });
    const lampHot = k.group(); lampHot.add(lampG, env); k.hot('lamp', lampHot);
    // 할아버지 쪽지 (자료: gnote)
    const note = k.sign(0.16, 0.11, [0.2, 1.046, -0.3], (g, w, h) => hand(g, w, h, ['윤서 씨 필름', '인화 준비해 둬라'], { size: 52, y: 90, lh: 80 }), { rot: [-90, 0, 4], px: 360 });
    k.hot('gnote', note);
    // 접수 장부 (자료: ledger)
    const led = k.group([-0.25, 1.045, -0.42], { rot: [0, -6, 0] });
    k.box([0.48, 0.015, 0.32], [0, 0, 0], 0x3a2a1c, { parent: led });
    k.sign(0.22, 0.3, [-0.115, 0.012, 0], (g, w, h) => { g.fillStyle = '#efe6cf'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b9ad90'; for (let y = 40; y < h; y += 28) { g.beginPath(); g.moveTo(10, y); g.lineTo(w - 10, y); g.stroke(); } }, { rot: [-90, 0, 0], parent: led, px: 256 });
    k.sign(0.22, 0.3, [0.115, 0.012, 0], (g, w, h) => { g.fillStyle = '#efe6cf'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b9ad90'; for (let y = 40; y < h; y += 28) { g.beginPath(); g.moveTo(10, y); g.lineTo(w - 10, y); g.stroke(); } }, { rot: [-90, 0, 0], parent: led, px: 256 });
    k.hot('ledger', led);
    // 접수대 뒤 의자와 선반
    k.box([0.4, 0.05, 0.4], [0.5, 0.62, -1.1], WOOD_D); k.cyl(0.03, 0.03, 0.6, [0.5, 0.3, -1.1], METAL);
    k.box([1.8, 0.04, 0.3], [0.9, 1.6, -2.85], WOOD_D);
    [[0.3, 0x2b2b2b], [0.65, 0x5a4a3a], [1.0, 0x3a3a3a], [1.35, 0x6a5a45]].forEach(([x, c]) => k.box([0.22, 0.18, 0.2], [x, 1.71, -2.85], c));

    // ---------- 왼쪽 벽: 필름 보관함 (장치: lockers) ----------
    const lock = k.group([-2.78, 0, -0.55]);
    k.box([0.42, 1.55, 1.55], [0, 1.1, 0], 0x55493c, { parent: lock });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const y = 1.7 - r * 0.37, z = -0.56 + c * 0.373;
      k.box([0.03, 0.33, 0.34], [0.225, y, z], 0x6e5c45, { parent: lock });
      k.box([0.03, 0.03, 0.12], [0.245, y - 0.06, z], 0xb59a5a, { metal: 0.6, rough: 0.4, parent: lock });
    }
    // 남은 라벨 셋
    [[0, 1], [1, 3], [3, 0]].forEach(([r, c]) => k.box([0.005, 0.05, 0.14], [0.242, 1.7 - r * 0.37 + 0.09, -0.56 + c * 0.373], 0xe9dfc4, { parent: lock }));
    k.hot('lockers', lock);
    // 보관함에서 꺼낸 필름 봉투 (자료: sleeve, 보관함을 연 뒤 보임)
    const sleeve = k.group([-2.5, 1.9, -0.5], { rot: [0, 12, 0] });
    k.box([0.26, 0.01, 0.2], [0, 0, 0], 0xe8e2d0, { alpha: 0.85, parent: sleeve });
    k.hot('sleeve', sleeve);

    // ---------- 오른쪽 벽: 손님 사진들 (자료: wall) ----------
    const wall = k.group([2.98, 0, 0], { rot: [0, -90, 0] });
    const tones = [0x6b6b6b, 0x8a8478, 0x55524c, 0x9a9488, 0x737069, 0x8e8a80];
    let n = 0;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const w = 0.32 + ((r + c) % 3) * 0.06, h = 0.4 + ((r * 2 + c) % 2) * 0.08;
      const x = -1.5 + c * 0.72, y = 2.15 - r * 0.58;
      const empty = r === 2 && c === 2;
      k.box([w + 0.06, h + 0.06, 0.03], [x, y, 0], 0x2b211a, { parent: wall });
      k.plane(w, h, [x, y, 0.017], empty ? 0xf1ece0 : tones[n++ % tones.length], { parent: wall, rough: 0.6 });
    }
    k.hot('wall', wall);

    // ---------- 뒷벽 왼쪽: 암실 문과 붉은 등 ----------
    const door = k.group([-2.05, 0, -3.05]); // 경첩 쪽
    k.box([0.9, 2.05, 0.06], [0.45, 1.025, 0], 0x2e2622, { parent: door });
    k.box([0.04, 0.04, 0.12], [0.8, 1.0, 0.06], METAL, { metal: 0.8, rough: 0.3, parent: door });
    k.sign(0.36, 0.14, [0.45, 1.65, 0.035], (g, w, h) => { g.fillStyle = '#1b1414'; g.fillRect(0, 0, w, h); g.fillStyle = '#d64a3a'; g.font = 'bold 64px SUIT, sans-serif'; g.textAlign = 'center'; g.fillText('암 실', w / 2, 72); }, { parent: door, px: 256 });
    k.box([0.18, 0.1, 0.08], [-1.6, 2.2, -2.96], 0x2a1414, { glow: 0xff2a14, glowI: 1.2 });
    const doorLight = k.point(0xff3020, 0.9, 2.2, [-1.6, 2.15, -2.8]);

    // ---------- 작업대 (오른쪽 안쪽) ----------
    k.box([1.5, 0.05, 0.8], [2.1, 0.88, -2.5], WOOD_D);
    [[1.4, -2.15], [2.8, -2.15], [1.4, -2.85], [2.8, -2.85]].forEach(([x, z]) => k.box([0.05, 0.86, 0.05], [x, 0.43, z], WOOD_D));
    // 라이트박스 + 필름 넷 (장치: lightbox)
    const lb = k.group([2.05, 0.905, -2.5]);
    k.box([0.66, 0.04, 0.44], [0, 0.02, 0], 0xd9d9d6, { parent: lb });
    k.plane(0.6, 0.38, [0, 0.0415, 0], 0xffffff, { rot: [-90, 0, 0], glow: 0xf4f6ff, glowI: 1.6, parent: lb });
    for (let i = 0; i < 4; i++) k.plane(0.5, 0.055, [0, 0.043, -0.13 + i * 0.085], 0x3b2a1c, { rot: [-90, 0, 0], alpha: 0.8, parent: lb });
    k.hot('lightbox', lb);
    k.point(0xf2f4ff, 1.6, 1.6, [2.05, 1.15, -2.5]);
    // 루페 (자료: loupe)
    const loupe = k.group([2.5, 0.93, -2.3]);
    k.cyl(0.035, 0.045, 0.06, [0, 0.03, 0], 0x1e1e1e, { parent: loupe, rough: 0.5 });
    k.hot('loupe', loupe);
    // 장갑과 가위 (장식)
    k.box([0.14, 0.02, 0.08], [1.65, 0.92, -2.3], 0xf2f2f2);

    // ---------- 암실 ----------
    const DR = 0x3a2b2b;
    k.box([3, 0.05, 3], [-1.5, -0.025, -4.55], 0x2a2420);
    k.box([3, 0.05, 3], [-1.5, 2.625, -4.55], 0x221c1c, { cast: false });
    k.box([0.1, 2.6, 3], [-3.05, 1.3, -4.55], DR);
    k.box([0.1, 2.6, 3], [0.05, 1.3, -4.55], DR);
    k.box([3, 2.6, 0.1], [-1.5, 1.3, -6.05], DR);
    // 작업대
    k.box([2.8, 0.9, 0.6], [-1.5, 0.45, -5.7], 0x2b2b2b);
    // 확대기
    const enl = k.group([-2.3, 0.9, -5.65]);
    k.box([0.52, 0.04, 0.46], [0, 0.02, 0], 0x1c1c1c, { parent: enl });
    k.box([0.3, 0.005, 0.24], [0, 0.043, 0.04], 0xf2efe6, { parent: enl });
    k.cyl(0.03, 0.03, 1.05, [0, 0.55, -0.18], 0x2a2a2a, { metal: 0.5, parent: enl });
    k.box([0.28, 0.22, 0.3], [0, 0.95, -0.05], 0x353535, { parent: enl });
    k.cyl(0.05, 0.06, 0.14, [0, 0.78, -0.02], 0x151515, { parent: enl });
    // 타이머
    k.box([0.16, 0.16, 0.08], [-1.8, 0.98, -5.55], 0x1a1a1a);
    k.cyl(0.055, 0.055, 0.01, [-1.8, 0.99, -5.505], 0xe8e2d0, { rot: [90, 0, 0], glow: 0x401010, glowI: 0.4 });
    // 트레이 셋
    const trays = k.group([-0.95, 0.9, -5.65]);
    [-0.4, 0, 0.4].forEach((x) => { k.box([0.34, 0.06, 0.44], [x, 0.03, 0], 0xe9e9e6, { parent: trays }); k.plane(0.3, 0.4, [x, 0.05, 0], 0x2a2a30, { rot: [-90, 0, 0], rough: 0.15, parent: trays }); });
    const print = k.group([0, 0, 0]); print.add(enl, trays); k.root.add(print); k.hot('print', print);
    // 벽의 순서표 (자료: chart)
    const chart = k.sign(0.42, 0.56, [-2.99, 1.55, -4.7], (g, w, h) => { g.fillStyle = '#efe6cf'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a3570'; g.font = 'bold 44px "Nanum Pen Script", cursive'; g.fillText('순서', 30, 60); g.strokeStyle = '#2a3570'; g.lineWidth = 4; for (let i = 0; i < 5; i++) { g.fillText(String(i + 1), 30, 130 + i * 70); g.beginPath(); g.moveTo(70, 118 + i * 70); g.lineTo(60 + 120 + (i * 53) % 160, 118 + i * 70); g.stroke(); } }, { rot: [0, 90, 0], px: 320 });
    k.hot('chart', chart);
    // 빨랫줄과 집게
    k.cyl(0.004, 0.004, 2.6, [-1.5, 2.15, -4.4], 0xdddddd, { rot: [0, 0, 90], cast: false });
    [-2.4, -1.9, -1.1, -0.6].forEach((x) => k.box([0.02, 0.06, 0.02], [x, 2.11, -4.4], 0x9a7a4a));
    // 붉은 안전등
    k.box([0.2, 0.12, 0.12], [-1.5, 2.45, -4.0], 0x2a1010, { glow: 0xff2010, glowI: 1.5 });
    const safe = k.point(0xff2a12, 4.5, 5.5, [-1.5, 2.3, -4.2], { shadow: true });
    const fill = k.point(0xff6a50, 0, 4, [-1.5, 1.6, -3.6]);

    return {
      scenes: {
        front: { views: [
          { name: '입구에서', pos: [0.3, 1.6, 2.5], look: [0.1, 1.1, -1.2] },
          { name: '접수대 앞', pos: [0.6, 1.5, 0.55], look: [0.6, 0.95, -0.45] },
          { name: '보관함 앞', pos: [-0.5, 1.6, 0.2], look: [-2.8, 1.15, -0.55] },
          { name: '사진 벽 앞', pos: [0.6, 1.6, 0.6], look: [3, 1.6, -0.1] },
        ] },
        table: { views: [{ name: '작업대', pos: [1.95, 1.5, -1.25], look: [2.1, 0.9, -2.5] }] },
        darkroom: { views: [
          { name: '암실 안', pos: [-1.5, 1.6, -3.4], look: [-1.5, 1.0, -5.6] },
          { name: '순서표 앞', pos: [-1.7, 1.6, -4.5], look: [-3, 1.5, -4.7] },
        ] },
      },
      // 진행에 따라 바뀌는 것: 작업대를 풀면 암실 문이 열린다
      onState(S, sceneId) {
        const open = S.solved.includes('lightbox');
        door.rotation.y = open ? -1.7 : 0;
        ceilLamp.intensity = sceneId === 'darkroom' ? 2.5 : 9;
        safe.intensity = sceneId === 'darkroom' ? 12 : 1.2;
        fill.intensity = sceneId === 'darkroom' ? 2.2 : 0;
        doorLight.intensity = open ? 0.3 : 0.9;
      },
    };
  },
};
