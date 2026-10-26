// 실사 느낌용 질감을 코드로 그린다 (사진 파일 없이): 색 · 거칠기 · 요철(노멀) 지도
// 같은 질감은 한 번만 만들고, 물건 크기에 맞춰 반복 횟수만 바꿔 쓴다

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function valueNoise(size, cells, seed) {
  const r = rng(seed); const g = new Float32Array((cells + 1) * (cells + 1));
  for (let i = 0; i < g.length; i++) g[i] = r();
  for (let x = 0; x <= cells; x++) g[cells * (cells + 1) + x] = g[x]; // 이음매 없이
  for (let y = 0; y <= cells; y++) g[y * (cells + 1) + cells] = g[y * (cells + 1)];
  const out = new Float32Array(size * size); const f = cells / size;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const gx = x * f, gy = y * f, x0 = gx | 0, y0 = gy | 0, tx = gx - x0, ty = gy - y0;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const a = g[y0 * (cells + 1) + x0], b = g[y0 * (cells + 1) + x0 + 1], c = g[(y0 + 1) * (cells + 1) + x0], d = g[(y0 + 1) * (cells + 1) + x0 + 1];
    out[y * size + x] = a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  return out;
}
function fbm(size, base, oct, seed) {
  const out = new Float32Array(size * size); let amp = 1, tot = 0;
  for (let o = 0; o < oct; o++) { const n = valueNoise(size, base << o, seed + o * 97); for (let i = 0; i < out.length; i++) out[i] += n[i] * amp; tot += amp; amp *= 0.5; }
  for (let i = 0; i < out.length; i++) out[i] /= tot;
  return out;
}
const stretch = (n, size, sx) => (x, y) => n[y * size + (Math.floor(x / sx) % size)];
const hexRGB = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];

function toCanvas(size, fn) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const g = cv.getContext('2d'); const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) { const [r, gg, b] = fn(i); img.data[i * 4] = r; img.data[i * 4 + 1] = gg; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0); return cv;
}
function normalFromHeight(size, h, strength) {
  return toCanvas(size, (i) => {
    const x = i % size, y = (i / size) | 0;
    const L = h[y * size + ((x - 1 + size) % size)], R = h[y * size + ((x + 1) % size)], U = h[((y - 1 + size) % size) * size + x], D = h[((y + 1) % size) * size + x];
    let nx = (L - R) * strength, ny = (U - D) * strength, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    return [(nx * 0.5 + 0.5) * 255, (ny * 0.5 + 0.5) * 255, (nz * 0.5 + 0.5) * 255];
  });
}

const RECIPES = {
  // 나무 마루: 판자 · 결 · 이음매
  planks(size, o) {
    const seed = o.seed || 7; const n = fbm(size, 4, 4, seed), fine = fbm(size, 32, 3, seed + 5);
    const rows = o.rows || 6; const r = rng(seed + 11); const tint = Array.from({ length: rows * 3 }, () => 0.85 + r() * 0.2); const offs = Array.from({ length: rows }, () => r());
    const base = hexRGB(o.color), dark = hexRGB(o.dark || 0x2a1a10);
    const h = new Float32Array(size * size), rough = new Float32Array(size * size);
    const col = toCanvas(size, (i) => {
      const x = i % size, y = (i / size) | 0; const row = Math.floor(y / size * rows); const ly = (y / size * rows) % 1;
      const seg = Math.floor(((x / size) + offs[row]) * 1.5) % 3; const t = tint[row * 3 + seg];
      const grain = Math.sin((ly * 9 + n[i] * 3 + seg * 3.1) * Math.PI) * 0.5 + 0.5;
      const seam = ly < 0.018 || ly > 0.982 || (((x / size) + offs[row]) * 1.5) % 1 < 0.006;
      const k = seam ? 0.35 : t * (0.9 + grain * 0.08) * (0.92 + fine[i] * 0.14);
      h[i] = seam ? 0 : 0.6 + grain * 0.15 + fine[i] * 0.15; rough[i] = seam ? 0.95 : 0.55 + grain * 0.15 + fine[i] * 0.15;
      return base.map((c, j) => Math.min(255, c * k + dark[j] * (1 - Math.min(1, k)) * 0.15));
    });
    return { col, h, rough, nStr: 3 };
  },
  // 나무 판(가구): 길게 흐르는 가는 결
  wood(size, o) {
    const seed = o.seed || 3; const n = fbm(size, 4, 4, seed), fine = fbm(size, 48, 2, seed + 2), pores = fbm(size, 128, 1, seed + 7);
    const N = stretch(n, size, 10), F = stretch(fine, size, 6);
    const base = hexRGB(o.color); const h = new Float32Array(size * size), rough = new Float32Array(size * size);
    const col = toCanvas(size, (i) => {
      const x = i % size, y = (i / size) | 0;
      const g = Math.sin(((y / size) * 70 + N(x, y) * 10) * Math.PI); const fine2 = F(x, y);
      const k = 0.86 + g * 0.05 + (fine2 - 0.5) * 0.12 + (N(x, y) - 0.5) * 0.12 - (pores[i] > 0.78 ? 0.06 : 0);
      h[i] = 0.5 + g * 0.08 + fine2 * 0.12; rough[i] = 0.5 + fine2 * 0.2;
      return base.map((c) => Math.min(255, c * k));
    });
    return { col, h, rough, nStr: 1.2 };
  },
  // 회벽: 얼룩 · 미세한 요철
  plaster(size, o) {
    const seed = o.seed || 21; const blot = fbm(size, 3, 4, seed), fine = fbm(size, 64, 3, seed + 3);
    const base = hexRGB(o.color); const h = new Float32Array(size * size), rough = new Float32Array(size * size);
    const col = toCanvas(size, (i) => { const k = 0.92 + (blot[i] - 0.5) * 0.14 + (fine[i] - 0.5) * 0.04; h[i] = fine[i] * 0.5 + blot[i] * 0.5; rough[i] = 0.88 + fine[i] * 0.08; return base.map((c) => Math.min(255, c * k)); });
    return { col, h, rough, nStr: 0.45 };
  },
  // 콘크리트·장판
  concrete(size, o) {
    const seed = o.seed || 41; const blot = fbm(size, 4, 5, seed), spk = fbm(size, 96, 2, seed + 9);
    const base = hexRGB(o.color); const h = new Float32Array(size * size), rough = new Float32Array(size * size);
    const col = toCanvas(size, (i) => { const k = 0.85 + (blot[i] - 0.5) * 0.25 + (spk[i] > 0.72 ? -0.12 : 0); h[i] = blot[i] * 0.5 + spk[i] * 0.5; rough[i] = 0.7 + blot[i] * 0.25; return base.map((c) => Math.min(255, c * k)); });
    return { col, h, rough, nStr: 2.5 };
  },
  // 쇠: 결 방향으로 긁힌 자국
  brushed(size, o) {
    const seed = o.seed || 61; const n = valueNoise(size, 8, seed); const r = rng(seed); const lines = new Float32Array(size); for (let y = 0; y < size; y++) lines[y] = r();
    const base = hexRGB(o.color); const h = new Float32Array(size * size), rough = new Float32Array(size * size);
    const col = toCanvas(size, (i) => { const y = (i / size) | 0; const k = 0.88 + lines[y] * 0.12 + n[i] * 0.06; h[i] = lines[y]; rough[i] = 0.32 + lines[y] * 0.2 + n[i] * 0.1; return base.map((c) => Math.min(255, c * k)); });
    return { col, h, rough, nStr: 0.8 };
  },
  // 칠한 면(문·검은 벽): 약한 붓 자국
  paint(size, o) {
    const seed = o.seed || 81; const n = fbm(size, 6, 3, seed), str = valueNoise(size, 64, seed + 1);
    const base = hexRGB(o.color); const h = new Float32Array(size * size), rough = new Float32Array(size * size);
    const col = toCanvas(size, (i) => { const k = 0.92 + (n[i] - 0.5) * 0.12; h[i] = str[i] * 0.4 + n[i] * 0.6; rough[i] = 0.6 + n[i] * 0.2; return base.map((c) => Math.min(255, c * k)); });
    return { col, h, rough, nStr: 1 };
  },
};

export function makeTextures(THREE, renderer, { small = false } = {}) {
  const cache = new Map();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const make = (kind, o) => {
    const key = kind + JSON.stringify(o);
    if (cache.has(key)) return cache.get(key);
    const size = small ? (o.size || 512) / 2 : (o.size || 512);
    const { col, h, rough, nStr } = RECIPES[kind](size, o);
    const tex = (cv, srgb) => { const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = Math.min(8, maxAniso); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
    const roughCv = toCanvas(size, (i) => { const v = Math.max(0, Math.min(255, rough[i] * 255)); return [v, v, v]; });
    const set = { map: tex(col, true), normalMap: tex(normalFromHeight(size, h, nStr * (o.bump ?? 1)), false), roughnessMap: tex(roughCv, false) };
    cache.set(key, set); return set;
  };
  // 물건 크기(미터)에 맞춰 반복: tile = 질감 한 장이 덮는 길이
  return (kind, o = {}) => {
    const set = make(kind, { color: o.color, dark: o.dark, seed: o.seed, rows: o.rows, size: o.size, bump: o.bump });
    const rep = o.repeat || [1, 1];
    const clone = (t) => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(rep[0], rep[1]); if (o.rot) c.rotation = o.rot; return c; };
    return new THREE.MeshStandardMaterial({ map: clone(set.map), normalMap: clone(set.normalMap), roughnessMap: clone(set.roughnessMap), roughness: o.rough ?? 1, metalness: o.metal ?? 0, normalScale: new THREE.Vector2(o.ns ?? 1, o.ns ?? 1), envMapIntensity: o.env ?? 0.35 });
  };
}
