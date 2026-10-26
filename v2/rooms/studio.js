// 비가 그친 사진관 — 3D 방 (시범)
// 좌표는 미터 단위 · 접수실 x -3~3, z -3~3 · 작업대는 접수실 오른쪽 안쪽 · 암실은 뒷벽 너머 x -3~0, z -6~-3
// 핫스팟 id(kit.hot)는 episodes/studio.js 장면의 hotspots id와 같아야 엔진의 자료·장치 창이 열린다

const BRASS = 0xb08d4a, IRON = 0x2b2b2d, KRAFT = 0xc49a5c;

function hand(g, w, h, lines, o = {}) {
  g.fillStyle = o.bg || '#f3ecd9'; g.fillRect(0, 0, w, h);
  g.fillStyle = o.ink || '#2a3570'; g.font = `${o.size || 40}px "Nanum Pen Script", "MihaejeHand", cursive`;
  lines.forEach((t, i) => g.fillText(t, o.x || 30, (o.y || 70) + i * (o.lh || 56)));
}
// 오래된 인물 사진처럼: 바랜 바탕 + 흐린 사람 실루엣
function oldPhoto(seed) {
  return (g, w, h) => {
    let s = seed * 9301 + 49297; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const sepia = r() > 0.4; const bg = sepia ? [176, 150, 112] : [150, 150, 146];
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, `rgb(${bg.map((c) => c + 25)})`); grd.addColorStop(1, `rgb(${bg.map((c) => c - 30)})`);
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const n = 1 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const cx = w * (0.5 + (i - (n - 1) / 2) * 0.26 + (r() - 0.5) * 0.05), top = h * (0.28 + r() * 0.08);
      g.fillStyle = `rgba(${sepia ? '60,42,28' : '40,40,42'},${0.55 + r() * 0.3})`;
      g.beginPath(); g.ellipse(cx, top, w * 0.07, w * 0.085, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(cx - w * 0.15, h); g.quadraticCurveTo(cx - w * 0.15, top + w * 0.1, cx, top + w * 0.08); g.quadraticCurveTo(cx + w * 0.15, top + w * 0.1, cx + w * 0.15, h); g.fill();
    }
    const v = g.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(30,20,10,.55)'); g.fillStyle = v; g.fillRect(0, 0, w, h);
  };
}

export default {
  background: 0x0b0c0e,
  fog: [0x0b0c0e, 10, 24],
  bloom: [0.26, 0.5, 0.9],
  build(k) {
    const T = k.THREE;
    // ---------- 재질 ----------
    const M = {
      floor: k.tex('planks', { color: 0x5e3e28, rows: 8, repeat: [4, 4] }),
      wallTop: k.tex('plaster', { color: 0xa89c86, repeat: [2, 1] }),
      wallTopSide: k.tex('plaster', { color: 0xa89c86, repeat: [2, 1], seed: 22 }),
      wainscot: k.tex('wood', { color: 0x5b3a22, repeat: [4, 1] }),
      ceil: k.tex('plaster', { color: 0xb9b0a0, repeat: [2, 2], seed: 23 }),
      counter: k.tex('wood', { color: 0x6b4426, repeat: [2, 1] }),
      counterTop: k.tex('wood', { color: 0x4a2c18, repeat: [2, 1], seed: 4 }),
      cabinet: k.tex('wood', { color: 0x7a5232, repeat: [1, 1], seed: 9 }),
      drawer: k.tex('wood', { color: 0x8a5e38, repeat: [1, 1], seed: 12 }),
      frame: k.tex('wood', { color: 0x2c1d14, repeat: [1, 1], seed: 15 }),
      door: k.tex('paint', { color: 0x3a2c26 }),
      darkWall: k.tex('paint', { color: 0x1f1b1b, repeat: [2, 2] }),
      darkFloor: k.tex('concrete', { color: 0x3a3634, repeat: [2, 2] }),
      bench: k.tex('paint', { color: 0x262626, repeat: [2, 1], seed: 82 }),
      steel: k.tex('brushed', { color: 0x9a9da2, repeat: [1, 1] }),
      table: k.tex('wood', { color: 0x5a3a24, repeat: [2, 1], seed: 31 }),
    };
    M.steel.metalness = 0.9; M.steel.roughness = 0.6;

    // ---------- 빛 ----------
    k.root.add(new T.HemisphereLight(0xd8dde6, 0x2a2018, 0.22));
    // 천장 갓등 (그림자)
    const ceilLamp = k.spot(0xffdcb0, 22, 9, [0.3, 2.55, 0.2], [0.3, 0, -0.4], { angle: 62, penumbra: 0.85, shadow: true });
    k.lathe([[0, 0], [0.06, 0], [0.22, -0.16], [0.24, -0.18]], [0.3, 2.62, 0.2], 0x1c2a22, { rough: 0.4, metal: 0.3 });
    k.cyl(0.006, 0.006, 0.18, [0.3, 2.72, 0.2], IRON);
    k.sphere(0.05, [0.3, 2.5, 0.2], 0xfff1d6, { glow: 0xffe2b8, glowI: 3, cast: false });
    // 비 오는 창으로 들어오는 푸른 빛
    const winLight = k.spot(0x8fa8c8, 14, 10, [0.2, 2.2, 4.2], [0, 0.2, 0.5], { angle: 55, penumbra: 1, shadow: !k.small });

    // ---------- 접수실 껍데기 ----------
    k.box([6, 0.05, 6], [0, -0.025, 0], M.floor);
    k.box([6, 0.05, 6], [0, 2.825, 0], M.ceil, { cast: false });
    const wall = (size, pos, side) => { // 위는 회벽, 아래 1m는 나무 판벽 + 몰딩
      const [w, , d] = size; const horiz = w > d;
      k.box([w, 1.8, d], [pos[0], 1.9, pos[2]], side ? M.wallTopSide : M.wallTop);
      k.box([w, 1.0, d], [pos[0], 0.5, pos[2]], M.wainscot);
      k.box(horiz ? [w, 0.05, d + 0.04] : [w + 0.04, 0.05, d], [pos[0], 1.0, pos[2]], M.frame);
      k.box(horiz ? [w, 0.1, d + 0.03] : [w + 0.03, 0.1, d], [pos[0], 0.05, pos[2]], M.frame);
    };
    wall([0.1, 2.8, 6], [-3.05, 0, 0], true);
    wall([0.1, 2.8, 6], [3.05, 0, 0], true);
    wall([0.95, 2.8, 0.1], [-2.575, 0, -3.05]);
    wall([4.15, 2.8, 0.1], [0.925, 0, -3.05]);
    k.box([0.9, 0.75, 0.1], [-1.6, 2.425, -3.05], M.wallTop);
    // 앞벽: 진열창과 유리문 (비)
    k.box([1.4, 2.8, 0.1], [-2.3, 1.4, 3.05], M.wallTop);
    k.box([1.1, 2.8, 0.1], [2.45, 1.4, 3.05], M.wallTop);
    k.box([3.5, 0.6, 0.12], [0.15, 0.3, 3.05], M.wainscot);
    k.box([3.5, 0.35, 0.1], [0.15, 2.625, 3.05], M.wallTop);
    // 빗물 흐르는 유리 (움직이는 질감)
    const rainCv = document.createElement('canvas'); rainCv.width = 256; rainCv.height = 512; const rg = rainCv.getContext('2d');
    const sky = rg.createLinearGradient(0, 0, 0, 512); sky.addColorStop(0, '#5a6f86'); sky.addColorStop(0.6, '#3a4a5c'); sky.addColorStop(1, '#2a3440'); rg.fillStyle = sky; rg.fillRect(0, 0, 256, 512);
    rg.fillStyle = 'rgba(255,214,150,.5)'; [[40, 300, 18], [120, 330, 10], [200, 310, 14]].forEach(([x, y, r]) => { rg.beginPath(); rg.arc(x, y, r, 0, 7); rg.fill(); });
    for (let i = 0; i < 140; i++) { const x = Math.random() * 256, y = Math.random() * 512, l = 8 + Math.random() * 40; rg.strokeStyle = `rgba(220,235,255,${0.08 + Math.random() * 0.18})`; rg.lineWidth = 1 + Math.random(); rg.beginPath(); rg.moveTo(x, y); rg.lineTo(x + (Math.random() - 0.5) * 3, y + l); rg.stroke(); }
    const rainTex = new T.CanvasTexture(rainCv); rainTex.colorSpace = T.SRGBColorSpace; rainTex.wrapS = rainTex.wrapT = T.RepeatWrapping; rainTex.repeat.set(3, 1.6);
    const glass = new T.Mesh(new T.PlaneGeometry(3.5, 1.85), new T.MeshStandardMaterial({ map: rainTex, emissive: 0xffffff, emissiveMap: rainTex, emissiveIntensity: 0.55, roughness: 0.15, metalness: 0, envMapIntensity: 1 }));
    glass.position.set(0.15, 1.525, 3.1); glass.rotation.y = Math.PI; k.root.add(glass);
    for (let i = 0; i < 4; i++) k.box([0.06, 1.85, 0.08], [-1.6 + i * 1.17, 1.525, 3.0], M.frame);
    k.box([3.5, 0.06, 0.1], [0.15, 0.62, 3.0], M.frame);
    k.sign(1.5, 0.3, [0.15, 2.28, 3.0], (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(232,214,170,.92)'; g.font = 'bold 76px SUIT, sans-serif'; g.textAlign = 'center'; g.fillText('미 루 사 진 관', w / 2, 98); }, { alpha: true, rot: [0, 180, 0], px: 720 });
    // 깔개
    k.rbox([2.2, 0.012, 1.2], [0.3, 0.006, 1.7], 0x5a2622, { rough: 1, r: 0.004, cast: false });
    // 우산꽂이와 젖은 우산
    k.cyl(0.11, 0.1, 0.5, [-1.85, 0.25, 2.6], 0x3c4a44, { rough: 0.5, metal: 0.4 });
    k.cyl(0.012, 0.012, 0.9, [-1.83, 0.62, 2.62], 0x1a1a1a, { rot: [6, 0, -5] });
    k.lathe([[0, 0], [0.05, -0.05], [0.07, -0.32], [0.0, -0.34]], [-1.8, 1.08, 2.63], 0x232a3a, { rough: 0.25 });

    // ---------- 접수대 ----------
    k.rbox([2.3, 0.98, 0.6], [0.45, 0.49, -0.45], M.counter, { r: 0.015 });
    for (let i = 0; i < 4; i++) k.rbox([0.5, 0.6, 0.02], [-0.42 + i * 0.58, 0.5, -0.14], M.counterTop, { r: 0.008 }); // 앞판 칸
    k.rbox([2.42, 0.045, 0.7], [0.45, 1.0, -0.45], M.counterTop, { r: 0.01 });
    // 초록 은행 등 + 등 밑 봉투 (장치: lamp)
    const lampG = k.group([0.95, 1.022, -0.6]);
    k.cyl(0.075, 0.09, 0.025, [0, 0.012, 0], BRASS, { metal: 0.9, rough: 0.3, parent: lampG });
    k.cyl(0.009, 0.009, 0.3, [0, 0.165, 0], BRASS, { metal: 0.9, rough: 0.3, parent: lampG });
    const shade = k.cyl(0.075, 0.075, 0.36, [0, 0.33, 0.04], 0x1d5c34, { open: true, thetaStart: Math.PI / 2, thetaLen: Math.PI, rot: [0, 0, 90], rough: 0.15, metal: 0.1, double: true, parent: lampG });
    shade.material = shade.material.clone(); shade.material.transparent = true; shade.material.opacity = 0.92;
    k.cyl(0.004, 0.004, 0.12, [0.06, 0.26, 0.04], BRASS, { metal: 0.9, parent: lampG }); // 당김 줄
    k.sphere(0.018, [0, 0.29, 0.04], 0xfff2d0, { glow: 0xfff0c8, glowI: 1.6, cast: false, parent: lampG });
    k.point(0xfff0c8, 3.6, 2.4, [0.95, 1.3, -0.52], { shadow: !k.small });
    const env = k.group([0.72, 1.026, -0.36], { rot: [0, 9, 0] });
    k.box([0.34, 0.006, 0.25], [0, 0, 0], k.tex('paint', { color: KRAFT, seed: 88 }), { parent: env });
    k.box([0.05, 0.007, 0.05], [0, 0.002, -0.08], 0x7a5a2c, { parent: env });
    k.cyl(0.012, 0.012, 0.003, [0, 0.006, -0.08], 0x5a3a1a, { parent: env });
    const lampHot = k.group(); lampHot.add(lampG, env); k.hot('lamp', lampHot);
    // 할아버지 쪽지 (자료: gnote)
    const note = k.sign(0.16, 0.11, [0.2, 1.024, -0.3], (g, w, h) => hand(g, w, h, ['윤서 씨 필름', '인화 준비해 둬라'], { size: 52, y: 90, lh: 80 }), { rot: [-90, 0, 4], px: 360 });
    k.hot('gnote', note);
    // 접수 장부 (자료: ledger)
    const led = k.group([-0.25, 1.024, -0.42], { rot: [0, -6, 0] });
    k.rbox([0.48, 0.02, 0.33], [0, 0, 0], 0x3a2216, { parent: led, r: 0.006 });
    const pageDraw = (g, w, h) => { g.fillStyle = '#efe6cf'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b9ad90'; g.lineWidth = 1; for (let y = 34; y < h; y += 22) { g.beginPath(); g.moveTo(10, y); g.lineTo(w - 10, y); g.stroke(); } g.strokeStyle = '#3a4580'; g.lineWidth = 2; for (let y = 52; y < h - 20; y += 22) { g.beginPath(); g.moveTo(18, y - 6); for (let x = 18; x < 40 + (y * 7) % 140; x += 8) g.lineTo(x, y - 6 + Math.sin(x * 0.7 + y) * 3); g.stroke(); } };
    k.sign(0.22, 0.31, [-0.113, 0.014, 0], pageDraw, { rot: [-90, 0, 2], parent: led, px: 256 });
    k.sign(0.22, 0.31, [0.113, 0.014, 0], pageDraw, { rot: [-90, 0, -2], parent: led, px: 256 });
    k.hot('ledger', led);
    // 접수대 위 소품: 호출 벨, 연필꽂이, 필름 통
    k.lathe([[0, 0.045], [0.02, 0.043], [0.04, 0.03], [0.045, 0.005], [0.05, 0]], [-0.75, 1.022, -0.35], BRASS, { metal: 0.95, rough: 0.2 });
    k.cyl(0.035, 0.035, 0.1, [1.42, 1.07, -0.62], 0x3a3530, { rough: 0.6 });
    [[-0.01, 0.12], [0.012, 0.13], [0, 0.11]].forEach(([dx, hh], i) => k.cyl(0.004, 0.004, hh, [1.42 + dx, 1.07 + hh / 2, -0.62 + (i - 1) * 0.012], [0xd4a43a, 0x2a2a2a, 0xa83a2a][i], { rot: [0, 0, (i - 1) * 8] }));
    [[1.25, -0.3], [1.3, -0.36]].forEach(([x, z]) => k.cyl(0.016, 0.016, 0.05, [x, 1.047, z], 0x1a1a1a, { rough: 0.4 }));
    // 접수대 뒤: 의자, 선반, 시계
    k.rbox([0.4, 0.05, 0.4], [0.5, 0.62, -1.1], M.frame, { r: 0.01 }); k.cyl(0.025, 0.04, 0.6, [0.5, 0.3, -1.1], IRON, { metal: 0.6 });
    k.rbox([1.8, 0.04, 0.3], [0.9, 1.6, -2.85], M.counterTop, { r: 0.006 });
    [[0.25, 0x2b2b2b, [0.2, 0.16, 0.18]], [0.55, 0x6a4a35, [0.18, 0.22, 0.16]], [0.85, 0x3a3a3a, [0.24, 0.14, 0.2]], [1.2, 0x7a6448, [0.16, 0.2, 0.18]], [1.5, 0x2a3540, [0.2, 0.18, 0.2]]].forEach(([x, c, sz]) => k.rbox(sz, [x, 1.62 + sz[1] / 2, -2.85], c, { r: 0.008, rough: 0.6 }));
    const clock = k.group([0.9, 2.2, -2.99]);
    k.cyl(0.17, 0.17, 0.05, [0, 0, 0], M.frame, { rot: [90, 0, 0], parent: clock });
    k.sign(0.3, 0.3, [0, 0, 0.03], (g, w, h) => { g.fillStyle = '#efe8d8'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, 7); g.fill(); g.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillRect(w / 2 + Math.sin(a) * w * 0.4 - 2, h / 2 - Math.cos(a) * w * 0.4 - 6, 4, 12); } g.strokeStyle = '#111'; g.lineCap = 'round'; g.lineWidth = 7; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.sin(4.5 / 12 * 2 * Math.PI) * w * 0.22, h / 2 - Math.cos(4.5 / 12 * 2 * Math.PI) * w * 0.22); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.sin(Math.PI) * w * 0.34, h / 2 - Math.cos(Math.PI) * w * 0.34); g.stroke(); }, { parent: clock, px: 256 });
    // 화분
    k.lathe([[0, 0], [0.13, 0], [0.16, 0.32], [0.17, 0.34]], [2.6, 0, 2.6], 0x7a4a32, { rough: 0.9 });
    for (let i = 0; i < 9; i++) { const a = i * 2.4, rr = 0.06 + (i % 3) * 0.05; k.sphere(0.09 + (i % 2) * 0.03, [2.6 + Math.cos(a) * rr, 0.42 + (i % 4) * 0.1, 2.6 + Math.sin(a) * rr], 0x2f5a2a, { rough: 0.7 }); }

    // ---------- 촬영 구석 (왼쪽 앞) : 삼각대 카메라 + 배경지 ----------
    k.cyl(0.04, 0.04, 1.6, [-2.9, 2.35, 1.9], IRON, { rot: [90, 0, 0] });
    k.plane(1.5, 2.3, [-2.93, 1.2, 1.9], 0x8e8a82, { rot: [0, 90, 0], rough: 1 });
    const cam = k.group([-1.9, 0, 1.6], { rot: [0, -70, 0] });
    [0, 120, 240].forEach((a) => k.cyl(0.012, 0.012, 1.25, [Math.sin(a * Math.PI / 180) * 0.17, 0.6, Math.cos(a * Math.PI / 180) * 0.17], IRON, { rot: [Math.cos(a * Math.PI / 180) * -12, 0, Math.sin(a * Math.PI / 180) * 12], metal: 0.6, parent: cam }));
    k.rbox([0.2, 0.17, 0.22], [0, 1.32, 0], 0x1d1d1d, { r: 0.015, rough: 0.5, parent: cam });
    k.cyl(0.05, 0.055, 0.12, [0, 1.33, -0.16], 0x111111, { rot: [90, 0, 0], rough: 0.3, parent: cam });
    k.cyl(0.035, 0.035, 0.004, [0, 1.33, -0.222], 0x6a8aa0, { rot: [90, 0, 0], rough: 0.05, metal: 0.4, parent: cam });

    // ---------- 왼쪽 벽: 필름 보관함 (장치: lockers) ----------
    const lock = k.group([-2.78, 0, -0.55]);
    k.rbox([0.42, 1.6, 1.6], [0, 1.1, 0], M.cabinet, { r: 0.015, parent: lock });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const y = 1.7 - r * 0.37, z = -0.56 + c * 0.373;
      k.rbox([0.03, 0.34, 0.35], [0.222, y, z], M.drawer, { r: 0.008, parent: lock });
      k.rbox([0.02, 0.025, 0.11], [0.245, y - 0.07, z], BRASS, { metal: 0.9, rough: 0.35, r: 0.008, parent: lock });
      k.box([0.006, 0.06, 0.15], [0.24, y + 0.09, z], BRASS, { metal: 0.9, rough: 0.4, parent: lock }); // 라벨 틀
    }
    // 남은 라벨 셋
    [[0, 1], [1, 3], [3, 0]].forEach(([r, c]) => k.box([0.004, 0.045, 0.13], [0.244, 1.7 - r * 0.37 + 0.09, -0.56 + c * 0.373], 0xe9dfc4, { parent: lock }));
    k.hot('lockers', lock);
    // 보관함에서 꺼낸 필름 봉투 (자료: sleeve, 보관함을 연 뒤 보임)
    const sleeve = k.group([-2.5, 1.915, -0.5], { rot: [0, 12, 0] });
    k.box([0.26, 0.008, 0.2], [0, 0, 0], 0xe8e2d0, { alpha: 0.9, parent: sleeve });
    k.box([0.2, 0.009, 0.03], [0, 0.001, 0.05], 0x3a2a1c, { alpha: 0.8, parent: sleeve });
    k.hot('sleeve', sleeve);

    // ---------- 오른쪽 벽: 손님 사진들 (자료: wall) ----------
    const wallG = k.group([2.99, 0, 0], { rot: [0, -90, 0] });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const w = 0.3 + ((r + c) % 3) * 0.06, h = 0.38 + ((r * 2 + c) % 2) * 0.08;
      const x = -1.5 + c * 0.72, y = 2.2 - r * 0.56;
      const empty = r === 2 && c === 2;
      k.rbox([w + 0.07, h + 0.07, 0.03], [x, y, 0], M.frame, { r: 0.006, parent: wallG });
      if (empty) k.plane(w, h, [x, y, 0.017], 0xf1ece0, { parent: wallG, rough: 0.8 });
      else k.sign(w, h, [x, y, 0.017], oldPhoto(r * 7 + c * 3 + 1), { parent: wallG, px: 220, rough: 0.35 });
    }
    k.hot('wall', wallG);
    k.spot(0xffe6c4, 9, 4, [1.9, 2.75, 0.2], [2.95, 1.6, 0.2], { angle: 50, penumbra: 0.9 });

    // ---------- 뒷벽 왼쪽: 암실 문과 붉은 등 ----------
    const door = k.group([-2.05, 0, -3.05]); // 경첩 쪽
    k.rbox([0.9, 2.05, 0.05], [0.45, 1.025, 0], M.door, { r: 0.01, parent: door });
    k.rbox([0.7, 0.8, 0.012], [0.45, 1.5, 0.03], M.door, { r: 0.004, parent: door });
    k.rbox([0.7, 0.7, 0.012], [0.45, 0.55, 0.03], M.door, { r: 0.004, parent: door });
    k.lathe([[0, 0], [0.022, 0], [0.025, 0.02], [0.012, 0.05]], [0.8, 1.0, 0.03], BRASS, { metal: 0.9, rough: 0.25, rot: [90, 0, 0], parent: door });
    k.sign(0.32, 0.12, [0.45, 1.95, 0.04], (g, w, h) => { g.fillStyle = '#1b1414'; g.fillRect(0, 0, w, h); g.fillStyle = '#c94434'; g.font = 'bold 60px SUIT, sans-serif'; g.textAlign = 'center'; g.fillText('암 실', w / 2, 66); }, { parent: door, px: 256 });
    k.rbox([0.9, 0.06, 0.08], [-1.6, 2.06, -3.0], M.frame, { r: 0.008 });
    k.rbox([0.18, 0.1, 0.08], [-1.6, 2.25, -2.96], 0x2a1414, { glow: 0xff2a14, glowI: 2.2, r: 0.015 });
    const doorLight = k.point(0xff3020, 0.9, 2.2, [-1.6, 2.15, -2.8]);

    // ---------- 작업대 (오른쪽 안쪽) ----------
    k.rbox([1.5, 0.05, 0.8], [2.1, 0.88, -2.5], M.table, { r: 0.01 });
    [[1.4, -2.15], [2.8, -2.15], [1.4, -2.85], [2.8, -2.85]].forEach(([x, z]) => k.rbox([0.05, 0.86, 0.05], [x, 0.43, z], M.table, { r: 0.006 }));
    // 라이트박스 + 필름 넷 (장치: lightbox)
    const lb = k.group([2.05, 0.905, -2.5]);
    k.rbox([0.66, 0.045, 0.44], [0, 0.022, 0], 0xcfcfcc, { parent: lb, r: 0.01, rough: 0.5 });
    k.plane(0.6, 0.38, [0, 0.0455, 0], 0xffffff, { rot: [-90, 0, 0], glow: 0xf4f6ff, glowI: 1.3, parent: lb });
    for (let i = 0; i < 4; i++) k.plane(0.5, 0.055, [0, 0.047, -0.13 + i * 0.085], 0x3b2a1c, { rot: [-90, 0, (i % 2) * 1.5], alpha: 0.82, parent: lb });
    k.hot('lightbox', lb);
    k.point(0xf2f4ff, 1.8, 1.6, [2.05, 1.15, -2.5]);
    // 루페 (자료: loupe)
    const loupe = k.group([2.5, 0.93, -2.3]);
    k.lathe([[0.03, 0], [0.045, 0.06], [0.044, 0.062], [0.028, 0.002]], [0, -0.025, 0], 0x1e1e1e, { parent: loupe, rough: 0.35 });
    k.cyl(0.044, 0.044, 0.004, [0, 0.036, 0], 0xb8d0dc, { alpha: 0.35, rough: 0.05, parent: loupe });
    k.hot('loupe', loupe);
    // 흰 장갑, 가위, 스탠드
    k.rbox([0.16, 0.025, 0.08], [1.65, 0.92, -2.3], 0xf2f2f0, { r: 0.012 });
    k.box([0.12, 0.006, 0.02], [1.7, 0.91, -2.65], M.steel, { rot: [0, 25, 0] });
    const desk = k.group([2.65, 0.905, -2.8]);
    k.cyl(0.07, 0.08, 0.02, [0, 0.01, 0], IRON, { metal: 0.5, parent: desk });
    k.cyl(0.008, 0.008, 0.45, [0, 0.23, 0], IRON, { metal: 0.6, parent: desk });
    k.lathe([[0, 0], [0.03, 0], [0.08, -0.09]], [-0.06, 0.45, 0.05], 0x2a2a2a, { rot: [0, 0, 25], parent: desk });

    // ---------- 암실 ----------
    k.box([3, 0.05, 3], [-1.5, -0.025, -4.55], M.darkFloor);
    k.box([3, 0.05, 3], [-1.5, 2.625, -4.55], M.darkWall, { cast: false });
    k.box([0.1, 2.6, 3], [-3.05, 1.3, -4.55], M.darkWall);
    k.box([0.1, 2.6, 3], [0.05, 1.3, -4.55], M.darkWall);
    k.box([3, 2.6, 0.1], [-1.5, 1.3, -6.05], M.darkWall);
    // 작업대
    k.rbox([2.8, 0.05, 0.62], [-1.5, 0.9, -5.7], M.bench, { r: 0.01 });
    k.rbox([2.8, 0.85, 0.58], [-1.5, 0.43, -5.72], M.bench, { r: 0.01 });
    // 확대기
    const enl = k.group([-2.3, 0.925, -5.65]);
    k.rbox([0.52, 0.035, 0.46], [0, 0.018, 0], 0x1c1c1c, { r: 0.006, parent: enl });
    k.rbox([0.3, 0.004, 0.24], [0, 0.038, 0.04], 0xf2efe6, { r: 0.001, parent: enl });
    k.cyl(0.028, 0.028, 1.05, [0, 0.55, -0.18], M.steel, { parent: enl });
    k.rbox([0.06, 0.08, 0.14], [0, 0.95, -0.12], IRON, { parent: enl, r: 0.008 });
    k.rbox([0.28, 0.2, 0.3], [0, 1.02, -0.02], 0x2e2e2e, { r: 0.02, parent: enl });
    k.lathe([[0.07, 0], [0.09, 0.04], [0.09, 0.12], [0.07, 0.15]], [0, 0.78, -0.02], 0x151515, { parent: enl });
    k.cyl(0.035, 0.04, 0.06, [0, 0.75, -0.02], 0x0a0a0a, { parent: enl });
    k.cyl(0.035, 0.035, 0.08, [0.16, 0.95, -0.12], IRON, { rot: [0, 0, 90], parent: enl });
    // 타이머
    k.rbox([0.16, 0.16, 0.09], [-1.8, 1.005, -5.55], 0x1a1a1a, { r: 0.012 });
    k.cyl(0.055, 0.055, 0.006, [-1.8, 1.01, -5.504], 0x302018, { rot: [90, 0, 0], glow: 0xff5a20, glowI: 0.35 });
    // 트레이 셋
    const trays = k.group([-0.95, 0.925, -5.65]);
    [-0.4, 0, 0.4].forEach((x) => { k.rbox([0.34, 0.06, 0.44], [x, 0.03, 0], 0xe6e6e2, { r: 0.012, rough: 0.35, parent: trays }); k.plane(0.3, 0.4, [x, 0.052, 0], 0x18181c, { rot: [-90, 0, 0], rough: 0.05, metal: 0.2, parent: trays }); });
    k.box([0.18, 0.004, 0.03], [-0.55, 0.985, -5.45], 0x9a9a9a, { rot: [0, 30, 0] });
    const print = k.group([0, 0, 0]); print.add(enl, trays); k.root.add(print); k.hot('print', print);
    // 약품병 선반
    k.rbox([1.4, 0.03, 0.22], [-0.9, 2.0, -5.9], M.bench, { r: 0.006 });
    [[-0.25, 0x5a2a0a, 0.26], [-0.12, 0x4a2008, 0.22], [0.0, 0x2a2a2a, 0.3]].forEach(([dx, c, hh]) => { k.lathe([[0, 0], [0.05, 0], [0.05, hh * 0.7], [0.022, hh * 0.85], [0.02, hh]], [-0.6 + dx, 2.015, -5.9], c, { rough: 0.15, metal: 0.1 }); });
    // 벽의 순서표 (자료: chart)
    const chart = k.sign(0.42, 0.56, [-2.99, 1.55, -4.7], (g, w, h) => { g.fillStyle = '#efe6cf'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a3570'; g.font = 'bold 44px "Nanum Pen Script", cursive'; g.fillText('순서', 30, 60); g.strokeStyle = '#2a3570'; g.lineWidth = 4; for (let i = 0; i < 5; i++) { g.fillText(String(i + 1), 30, 130 + i * 70); g.beginPath(); g.moveTo(70, 118 + i * 70); g.lineTo(60 + 120 + (i * 53) % 160, 118 + i * 70); g.stroke(); } }, { rot: [0, 90, 0], px: 320 });
    k.hot('chart', chart);
    // 빨랫줄과 집게, 말리는 사진
    k.cyl(0.003, 0.003, 2.6, [-1.5, 2.15, -4.4], 0xdddddd, { rot: [0, 0, 90], cast: false });
    [-2.4, -1.9, -1.1, -0.6].forEach((x, i) => { k.box([0.015, 0.05, 0.02], [x, 2.12, -4.4], 0x9a7a4a); if (i % 2 === 0) k.sign(0.2, 0.25, [x, 1.97, -4.4], oldPhoto(40 + i), { px: 160 }); });
    // 개수대와 수도꼭지
    k.rbox([0.6, 0.08, 0.5], [-0.35, 0.86, -3.4], M.steel, { r: 0.01 });
    k.rbox([0.6, 0.82, 0.5], [-0.35, 0.41, -3.4], M.bench, { r: 0.01 });
    k.cyl(0.012, 0.012, 0.25, [-0.35, 1.0, -3.6], M.steel); k.cyl(0.01, 0.01, 0.15, [-0.35, 1.12, -3.53], M.steel, { rot: [90, 0, 0] });
    // 붉은 안전등
    k.rbox([0.2, 0.12, 0.12], [-1.5, 2.45, -4.0], 0x2a1010, { glow: 0xff2010, glowI: 3, r: 0.02 });
    const safe = k.point(0xff2a12, 4.5, 6, [-1.5, 2.3, -4.2], { shadow: true });
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
      onFrame(t) { rainTex.offset.y = -t * 0.06; },
      // 진행에 따라 바뀌는 것: 작업대를 풀면 암실 문이 열린다
      onState(S, sceneId) {
        const open = S.solved.includes('lightbox');
        door.rotation.y = open ? -1.7 : 0;
        const dark = sceneId === 'darkroom';
        ceilLamp.intensity = dark ? 4 : 22;
        winLight.intensity = dark ? 2 : 14;
        safe.intensity = dark ? 7 : 1.2;
        fill.intensity = dark ? 2.2 : 0;
        doorLight.intensity = open ? 0.3 : 0.9;
      },
    };
  },
};
