// 3D 무대 (시범): 장면 사진 대신 Three.js 방을 그리고, 방 안 물건을 누르면 엔진의 같은 자료·장치 창이 열린다
// 엔진은 퍼즐을 그대로 쓰고, 이 파일은 "보는 것과 누르는 것"만 맡는다
import * as THREE from './vendor/three-bundle.min.js';
import { makeTextures } from './three-tex.js';

let V = null; // 한 번 만든 3D 화면을 계속 쓴다 (다시 그릴 때마다 새로 만들면 WebGL 문맥이 쌓인다)

const D2R = Math.PI / 180;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function makeKit(root, renderer, small) {
  const texMat = makeTextures(THREE, renderer, { small });
  const mats = new Map();
  const mat = (c, o = {}) => {
    if (c && c.isMaterial) return c;
    const key = JSON.stringify([c, o.rough, o.metal, o.glow, o.glowI, o.alpha, o.double, o.env]); // 재질에 필요한 값만 (parent 같은 물체를 넣으면 느려진다)
    if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({ color: c, roughness: o.rough ?? 0.85, metalness: o.metal ?? 0, emissive: o.glow || 0x000000, emissiveIntensity: o.glowI ?? 1, transparent: o.alpha != null, opacity: o.alpha ?? 1, side: o.double ? THREE.DoubleSide : THREE.FrontSide, envMapIntensity: o.env ?? 0.35 }));
    return mats.get(key);
  };
  const place = (m, pos = [0, 0, 0], o = {}) => {
    m.position.set(...pos);
    if (o.rot) m.rotation.set(o.rot[0] * D2R, o.rot[1] * D2R, o.rot[2] * D2R);
    m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true;
    if (o.name) m.name = o.name;
    (o.parent || root).add(m);
    return m;
  };
  const kit = {
    THREE, root, mat, small,
    tex: (kind, o) => texMat(kind, o),
    rbox: (size, pos, c, o = {}) => place(new THREE.Mesh(new THREE.RoundedBoxGeometry(size[0], size[1], size[2], o.segs || 3, o.r ?? Math.min(0.02, Math.min(...size) / 3)), mat(c, o)), pos, o),
    lathe: (pts, pos, c, o = {}) => place(new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), o.seg || 32), mat(c, { ...o, double: o.double ?? true })), pos, o),
    box: (size, pos, c, o = {}) => place(new THREE.Mesh(new THREE.BoxGeometry(...size), mat(c, o)), pos, o),
    cyl: (rt, rb, h, pos, c, o = {}) => place(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg || 24, 1, !!o.open, o.thetaStart || 0, o.thetaLen || Math.PI * 2), mat(c, o)), pos, o),
    sphere: (r, pos, c, o = {}) => place(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14, 0, Math.PI * 2, 0, o.half ? Math.PI / 2 : Math.PI), mat(c, o)), pos, o),
    plane: (w, h, pos, c, o = {}) => place(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(c, o)), pos, { cast: false, ...o }),
    group: (pos = [0, 0, 0], o = {}) => place(new THREE.Group(), pos, o),
    // 글자가 들어간 판 (간판·표지·종이): 캔버스로 그려서 붙인다
    sign: (w, h, pos, draw, o = {}) => {
      const px = o.px || 512; const cv = document.createElement('canvas'); cv.width = px; cv.height = Math.round(px * h / w);
      const g = cv.getContext('2d'); draw(g, cv.width, cv.height);
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      const m = new THREE.MeshStandardMaterial({ map: tex, roughness: o.rough ?? 0.9, emissive: o.glow ? 0xffffff : 0x000000, emissiveMap: o.glow ? tex : null, emissiveIntensity: o.glowI ?? 0.6, side: THREE.DoubleSide, transparent: !!o.alpha });
      return place(new THREE.Mesh(new THREE.PlaneGeometry(w, h), m), pos, { cast: false, ...o });
    },
    point: (color, intensity, dist, pos, o = {}) => { const l = new THREE.PointLight(color, intensity, dist, o.decay ?? 2); l.position.set(...pos); if (o.shadow) { l.castShadow = true; l.shadow.mapSize.set(512, 512); l.shadow.bias = -0.002; l.shadow.radius = 4; } (o.parent || root).add(l); return l; },
    spot: (color, intensity, dist, pos, target, o = {}) => { const l = new THREE.SpotLight(color, intensity, dist, (o.angle || 40) * D2R, o.penumbra ?? 0.6, 2); l.position.set(...pos); l.target.position.set(...target); if (o.shadow) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.001; } root.add(l, l.target); return l; },
    // 실사 3D 모델(GLB) 불러오기: 받는 동안은 코드로 만든 모양을 보여 주고, 다 오면 바꿔 끼운다
    // fit: [가로, 높이, 깊이] 상자 안에 비율 유지로 맞춤 · 바닥 가운데가 그룹 원점에 오도록
    model: (url, holder, o = {}) => {
      const loader = kit._gltf || (kit._gltf = new THREE.GLTFLoader().setMeshoptDecoder(THREE.MeshoptDecoder));
      loader.load(url, (g) => {
        const m0 = g.scene; const m = new THREE.Group(); m.add(m0); if (o.rot) m0.rotation.set(o.rot[0] * D2R, o.rot[1] * D2R, o.rot[2] * D2R); m.updateMatrixWorld(true);
        const b = new THREE.Box3().setFromObject(m); const sz = b.getSize(new THREE.Vector3());
        const f = o.fit || [sz.x, sz.y, sz.z];
        if (o.stretch) m.scale.set(f[0] / sz.x, f[1] / sz.y, f[2] / sz.z); else m.scale.setScalar(Math.min(f[0] / sz.x, f[1] / sz.y, f[2] / sz.z));
        m.updateMatrixWorld(true);
        const b2 = new THREE.Box3().setFromObject(m); const c = b2.getCenter(new THREE.Vector3());
        m.position.sub(new THREE.Vector3(c.x, b2.min.y, c.z));
        const wrap = new THREE.Group(); wrap.add(m);
        if (o.offset) wrap.position.set(...o.offset);
        const hotId = holder.userData.hot;
        m.traverse((c2) => { if (c2.isMesh) { c2.castShadow = true; c2.receiveShadow = true; if (c2.material) { c2.material.envMapIntensity = o.env ?? 0.5; if (o.tint) c2.material.color?.multiplyScalar(o.tint); } } if (hotId) c2.userData.hot = hotId; });
        (o.hide || []).forEach((h) => { h.visible = false; });
        holder.add(wrap);
        kit.onModel?.();
      }, undefined, (e) => console.warn('model load failed', url, e));
    },
    hots: new Map(), // 핫스팟 id → 물건(Object3D)
    hot: (id, obj) => { kit.hots.set(id, obj); obj.userData.hot = id; obj.traverse((c) => { c.userData.hot = id; }); return obj; },
  };
  return kit;
}

function create(ep, roomDef) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene3 = new THREE.Scene();
  scene3.background = new THREE.Color(roomDef.background || 0x0d0f12);
  if (roomDef.fog) scene3.fog = new THREE.Fog(...roomDef.fog);
  const camera = new THREE.PerspectiveCamera(62, 16 / 9, 0.05, 60);
  const small = matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 700;
  // 은은한 반사용 환경 (방 모양 조명 상자)
  const pm = new THREE.PMREMGenerator(renderer);
  scene3.environment = pm.fromScene(new THREE.RoomEnvironment(renderer), 0.04).texture;
  const kit = makeKit(scene3, renderer, small);
  const def = roomDef.build(kit);
  // 후처리: 구석 그림자(GTAO, PC만) + 등 번짐(bloom)
  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene3, camera));
  let gtao = null;
  if (!small) { gtao = new THREE.GTAOPass(scene3, camera, 800, 500); gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1, scale: 1.1 }); gtao.blendIntensity = 0.85; composer.addPass(gtao); }
  const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(800, 500), roomDef.bloom?.[0] ?? 0.35, roomDef.bloom?.[1] ?? 0.5, roomDef.bloom?.[2] ?? 0.82);
  composer.addPass(bloom);
  composer.addPass(new THREE.OutputPass());
  const v = {
    ep, def, kit, renderer, scene3, camera, composer, gtao, bloom, small,
    yaw: 0, pitch: 0, fov: 62, pos: new THREE.Vector3(), anim: null,
    sceneId: null, viewIdx: 0, hotList: [], act: null, labels: new Map(), host: null,
    ray: new THREE.Raycaster(), hover: null, alive: true,
  };
  renderer.domElement.className = 'v3-canvas';
  bindControls(v);
  const loop = () => { if (!v.alive) return; requestAnimationFrame(loop); tick(v); };
  requestAnimationFrame(loop);
  return v;
}

// 바라보는 방향(yaw·pitch)을 한 점을 보도록
function lookAtAngles(from, to) {
  const d = new THREE.Vector3().subVectors(to, from);
  return { yaw: Math.atan2(-d.x, -d.z), pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)) };
}
function shortestYaw(a, b) { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d; }

function goView(v, view, dur = 900) {
  const to = new THREE.Vector3(...view.pos);
  const ang = lookAtAngles(to, new THREE.Vector3(...view.look));
  const from = { pos: v.pos.clone(), yaw: v.yaw, pitch: v.pitch };
  const target = { pos: to, yaw: shortestYaw(v.yaw, ang.yaw), pitch: ang.pitch };
  if (!dur) { v.pos.copy(to); v.yaw = target.yaw; v.pitch = target.pitch; v.anim = null; return; }
  v.anim = { t0: performance.now(), dur, from, target };
}
function turnTo(v, point, dur = 380, then) {
  const ang = lookAtAngles(v.pos, point);
  v.anim = { t0: performance.now(), dur, from: { pos: v.pos.clone(), yaw: v.yaw, pitch: v.pitch }, target: { pos: v.pos.clone(), yaw: shortestYaw(v.yaw, ang.yaw), pitch: Math.max(-1.2, Math.min(1.0, ang.pitch)) }, then };
}

function anchorOf(obj) {
  const b = new THREE.Box3().setFromObject(obj);
  const c = b.getCenter(new THREE.Vector3()); const sz = b.getSize(new THREE.Vector3());
  // 큰 물건(보관함·사진 벽)은 가운데, 작은 물건은 바로 위에 이름표
  return Math.max(sz.x, sz.y, sz.z) > 0.7 ? c : new THREE.Vector3(c.x, b.max.y + 0.06, c.z);
}

function tick(v) {
  if (!v.host || !v.host.isConnected) return;
  const r = v.host.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
  const cv = v.renderer.domElement;
  if (cv.width !== Math.round(w * v.renderer.getPixelRatio()) || cv.height !== Math.round(h * v.renderer.getPixelRatio())) { v.renderer.setSize(w, h, false); cv.style.width = w + 'px'; cv.style.height = h + 'px'; v.composer.setPixelRatio(v.renderer.getPixelRatio()); v.composer.setSize(w, h); }
  v.camera.aspect = w / h; v.camera.fov = w < 560 ? Math.min(78, v.fov + 12) : v.fov; v.camera.updateProjectionMatrix();
  if (v.anim) {
    const a = v.anim; const t = Math.min(1, (performance.now() - a.t0) / a.dur); const k = ease(t);
    v.pos.lerpVectors(a.from.pos, a.target.pos, k);
    v.yaw = a.from.yaw + (a.target.yaw - a.from.yaw) * k; v.pitch = a.from.pitch + (a.target.pitch - a.from.pitch) * k;
    if (t >= 1) { const then = a.then; v.anim = null; if (then) then(); }
  }
  v.camera.position.copy(v.pos);
  v.camera.rotation.set(v.pitch, v.yaw, 0, 'YXZ');
  v.def.onFrame?.(performance.now() / 1000);
  v.composer.render();
  // 이름표 위치
  for (const [id, tag] of v.labels) {
    const obj = v.kit.hots.get(id); if (!obj) continue;
    const p = anchorOf(obj).project(v.camera);
    const inFront = p.z < 1 && p.z > -1;
    const x = (p.x * 0.5 + 0.5) * w, y = (-p.y * 0.5 + 0.5) * h;
    const on = inFront && x > -20 && x < w + 20 && y > -10 && y < h + 10;
    tag.style.display = on ? '' : 'none';
    if (on) tag.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }
}

function pick(v, cx, cy) {
  const r = v.renderer.domElement.getBoundingClientRect();
  const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  v.ray.setFromCamera(ndc, v.camera);
  const hits = v.ray.intersectObjects(v.scene3.children, true);
  for (const h of hits) {
    if (!h.object.visible) continue;
    const id = h.object.userData.hot;
    if (id && v.hotList.some((x) => x.id === id)) return id;
    if (h.object.userData.solid !== false) return null; // 벽 같은 것에 가려지면 못 누른다
  }
  return null;
}

function bindControls(v) {
  const cv = v.renderer.domElement;
  let down = null;
  cv.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, yaw: v.yaw, pitch: v.pitch, moved: false, id: e.pointerId }; cv.setPointerCapture(e.pointerId); v.anim = null; });
  cv.addEventListener('pointermove', (e) => {
    if (down && down.id === e.pointerId) {
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) down.moved = true;
      const s = (e.pointerType === 'touch' ? 0.0055 : 0.0042) * (v.camera.fov / 62);
      v.yaw = down.yaw + dx * s; v.pitch = Math.max(-1.2, Math.min(1.0, down.pitch + dy * s));
    } else if (e.pointerType === 'mouse') {
      const id = pick(v, e.clientX, e.clientY);
      cv.style.cursor = id ? 'pointer' : 'grab';
      setHover(v, id);
    }
  });
  const up = (e) => { if (!down || down.id !== e.pointerId) return; const was = down; down = null; if (!was.moved) { const id = pick(v, e.clientX, e.clientY); if (id) open(v, id); } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { down = null; });
  cv.addEventListener('wheel', (e) => { e.preventDefault(); v.fov = Math.max(34, Math.min(72, v.fov + Math.sign(e.deltaY) * 4)); }, { passive: false });
}

function setHover(v, id) {
  if (v.hover === id) return;
  const glow = (oid, on) => { const o = v.kit.hots.get(oid); if (!o) return; o.traverse((c) => { if (c.isMesh) { if (on) { c.userData._em = c.material; c.material = c.material.clone(); c.material.emissive = new THREE.Color(0x6a4a14); c.material.emissiveIntensity = 0.55; } else if (c.userData._em) { c.material.dispose(); c.material = c.userData._em; delete c.userData._em; } } }); };
  if (v.hover) glow(v.hover, false);
  v.hover = id; if (id) glow(id, true);
  v.labels.forEach((t, k) => t.classList.toggle('hover', k === id));
}

function open(v, id) {
  const h = v.hotList.find((x) => x.id === id); if (!h) return;
  const obj = v.kit.hots.get(id);
  if (obj) turnTo(v, anchorOf(obj), 360, () => v.act(h)); else v.act(h);
}

function updateHots(v, hotList, sceneId) {
  v.hotList = hotList;
  const ids = new Set(hotList.map((h) => h.id));
  // 핫스팟에 묶인 물건: 아직 보이지 않는 핫스팟(visible 조건)이면 물건도 숨긴다
  const allHot = new Set(v.ep.scenes.flatMap((s) => s.hotspots.map((h) => h.id)));
  const sceneOf = new Map(v.ep.scenes.flatMap((s) => s.hotspots.map((h) => [h.id, s])));
  v.kit.hots.forEach((obj, id) => {
    if (!allHot.has(id)) return;
    const sc = sceneOf.get(id); const hh = sc.hotspots.find((x) => x.id === id);
    obj.visible = !(hh.visible && !hh.visible(v.S));
  });
  v.def.onState?.(v.S, sceneId);
  // 이름표
  const layer = v.host.querySelector('.v3-tags');
  layer.replaceChildren(); v.labels.clear();
  const strip = v.host.querySelector('.v3-strip'); strip.replaceChildren();
  hotList.forEach((h) => {
    const b = document.createElement('button'); b.type = 'button';
    b.className = 'v3-tag' + (h.done ? ' done' : '') + (h.kind === 'device' ? ' device' : '') + (h.kind === 'travel' ? ' travel' : '');
    b.innerHTML = `<i></i><span>${h.label}</span>`; b.setAttribute('aria-label', h.label);
    b.onclick = () => open(v, h.id);
    if (v.kit.hots.has(h.id)) { layer.append(b); v.labels.set(h.id, b); } else strip.append(b);
  });
}

export async function mount(host, { ep, scene, S, hotspots, act, VER }) {
  if (!V || V.ep.id !== ep.id) {
    if (V) { V.alive = false; V.renderer.dispose(); }
    const room = (await import(`./rooms/${ep.id}.js?v=${VER}`)).default;
    V = create(ep, room);
  }
  const v = V; v.S = S; v.act = act; v.host = host; window.__v3 = v;
  host.classList.add('v3-host');
  host.innerHTML = '<div class="v3-tags"></div><div class="v3-views"></div><div class="v3-strip"></div><p class="v3-help">끌어서 둘러보기 · 물건을 누르면 살펴본다</p>';
  host.prepend(v.renderer.domElement);
  const views = v.def.scenes[scene.id]?.views || [{ pos: [0, 1.6, 2], look: [0, 1.2, 0], name: scene.name }];
  if (v.sceneId !== scene.id) { const first = v.sceneId == null; v.sceneId = scene.id; v.viewIdx = 0; goView(v, views[0], first ? 0 : 1200); }
  const vb = host.querySelector('.v3-views');
  if (views.length > 1) views.forEach((vw, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'v3-view' + (i === v.viewIdx ? ' on' : ''); b.textContent = vw.name; b.onclick = () => { v.viewIdx = i; goView(v, vw, 900); vb.querySelectorAll('.v3-view').forEach((x, k) => x.classList.toggle('on', k === i)); }; vb.append(b); });
  updateHots(v, hotspots, scene.id);
}
