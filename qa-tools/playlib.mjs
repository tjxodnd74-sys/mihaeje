// Headless playthrough helpers (Playwright). Used by walk-*.mjs scripts.
// Usage: NODE_PATH=<global node_modules> node qa-tools/walk-episode.mjs <case>
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

export const BASE = process.env.MIHAEJE_BASE || 'http://127.0.0.1:8790';
// 미리보기 서버가 없으면 띄웁니다(이 프로세스가 끝나도 남게).
export async function ensureServer() {
  if (process.env.MIHAEJE_BASE) return;
  try { await fetch(BASE + '/cases.json'); return; } catch {}
  const { spawn } = await import('node:child_process');
  const path = (await import('node:path')).default;
  const here = path.dirname(new URL(import.meta.url).pathname);
  spawn(process.execPath, [path.join(here, 'preview.mjs')], { detached: true, stdio: 'ignore' }).unref();
  for (let i = 0; i < 20; i++) { await sleep(300); try { await fetch(BASE + '/cases.json'); return; } catch {} }
  throw new Error('preview server did not start');
}

export async function launch({ mobile = false } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 375, height: 812 } : { width: 1280, height: 900 },
    isMobile: mobile,
    hasTouch: mobile,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', (r) => { const t = r.failure()?.errorText || ''; if (!/ABORTED/.test(t)) errors.push('REQFAIL ' + t + ' ' + r.url()); });
  return { browser, page, errors };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function dialogText(page) {
  return page.evaluate(() => {
    const d = document.querySelector('dialog[open]');
    return d ? d.innerText : '';
  });
}
export async function mainText(page) {
  return page.evaluate(() => document.querySelector('main')?.innerText || document.body.innerText);
}
export async function statusText(page) {
  return page.evaluate(() => {
    const d = document.querySelector('dialog[open]');
    const s = (d || document).querySelector('.story-device-status');
    return s ? s.textContent.trim() : '';
  });
}

// Click a button/link whose aria-label or text contains `label` (first visible match).
export async function click(page, label, { within = null, nth = 0, exact = false } = {}) {
  if (process.env.AUDIT) await audit(page, page.url().split('case=')[1] + ' before ' + label);
  if (process.env.OVERFLOW) await overflowCheck(page, page.url().split('case=')[1] + ' before ' + label);
  const ok = await page.evaluate(({ label, within, nth, exact }) => {
    const root = within ? document.querySelector(within) : (document.querySelector('dialog[open]') || document);
    const all = [...root.querySelectorAll('button,a,[role=button],summary')].filter((b) => {
      const al = (b.getAttribute('aria-label') || '').trim(), tx = (b.innerText || b.textContent || '').replace(/\s+/g, ' ').trim();
      const hit = exact ? (al === label || tx === label) : (al + ' ' + tx).includes(label);
      return hit && b.getClientRects().length > 0 && !b.disabled;
    });
    const b = all[nth];
    if (!b) return false;
    b.scrollIntoView({ block: 'center' });
    if (typeof b.click === 'function') b.click(); else b.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { label, within, nth, exact });
  if (!ok) throw new Error('click: not found "' + label + '"');
  await sleep(250);
}
export async function tryClick(page, label, opts) {
  try { await click(page, label, opts); return true; } catch { return false; }
}
export async function hasButton(page, label) {
  return page.evaluate((label) => {
    const root = document.querySelector('dialog[open]') || document;
    return [...root.querySelectorAll('button,a,summary')].some((b) => {
      const t = (b.getAttribute('aria-label') || '') + ' ' + (b.innerText || '');
      return t.includes(label) && b.getClientRects().length > 0;
    });
  }, label);
}
export async function buttons(page) {
  return page.evaluate(() => {
    const root = document.querySelector('dialog[open]') || document;
    return [...root.querySelectorAll('button,a,summary')]
      .filter((b) => b.getClientRects().length > 0)
      .map((b) => (b.getAttribute('aria-label') || b.innerText || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  });
}
export async function setRange(page, label, value) {
  const ok = await page.evaluate(({ label, value }) => {
    const root = document.querySelector('dialog[open]') || document;
    const n = [...root.querySelectorAll('input[type=range]')].find((i) => (i.getAttribute('aria-label') || '').includes(label));
    if (!n) return false;
    n.value = value;
    n.dispatchEvent(new Event('input', { bubbles: true }));
    n.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, { label, value });
  if (!ok) throw new Error('range not found ' + label);
  await sleep(200);
}
export async function setSelect(page, label, value) {
  const ok = await page.evaluate(({ label, value }) => {
    const root = document.querySelector('dialog[open]') || document;
    const n = [...root.querySelectorAll('select')].find((i) => (i.getAttribute('aria-label') || '').includes(label));
    if (!n) return false;
    n.value = value;
    n.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, { label, value });
  if (!ok) throw new Error('select not found ' + label);
  await sleep(150);
}
export async function typeInto(page, label, value) {
  const ok = await page.evaluate(({ label, value }) => {
    const root = document.querySelector('dialog[open]') || document;
    const n = [...root.querySelectorAll('input')].find((i) => (i.getAttribute('aria-label') || '').includes(label));
    if (!n) return false;
    n.value = value;
    n.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }, { label, value });
  if (!ok) throw new Error('input not found ' + label);
  await sleep(150);
}
export async function closeDialog(page) {
  if (process.env.AUDIT) await audit(page, page.url().split('case=')[1] + ' before close');
  await page.evaluate(() => {
    const d = document.querySelector('dialog[open]');
    const b = d && [...d.querySelectorAll('button')].find((x) => /닫기|돌아가기/.test(x.getAttribute('aria-label') || x.textContent));
    if (b) b.click();
  });
  await sleep(250);
}
export async function hotspots(page) {
  return page.evaluate(() => [...document.querySelectorAll('.room-hotspot,.scene-tray-item,.place-link,.place-next')]
    .filter((b) => b.offsetParent !== null && !b.disabled)
    .map((b) => b.getAttribute('aria-label') || b.textContent.trim()));
}
export async function docCount(page) {
  return page.evaluate(() => document.getElementById('docCount')?.textContent || '');
}
export async function freshEpisode(page, id) {
  await page.goto(BASE + '/episode?case=' + id);
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE + '/episode?case=' + id);
  await sleep(800);
}
// Reset all storage then open a URL
export async function fresh(page, path) {
  await page.goto(BASE + path);
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE + path);
  await sleep(800);
}
export function log(...a) { console.log(...a); }
export function check(cond, msg) {
  console.log((cond ? 'PASS ' : 'FAIL ') + msg);
  if (!cond) process.exitCode = 1;
}
// Press the device's main confirm button (mechanic62 commit or story-primary in actions footer)
export async function commit(page) {
  const ok = await page.evaluate(() => {
    const d = document.querySelector('dialog[open]') || document;
    const b = d.querySelector('.m62-commit') || d.querySelector('.story-device-actions .story-primary');
    if (!b) return false;
    b.scrollIntoView({ block: 'center' });
    b.click();
    return true;
  });
  if (!ok) throw new Error('commit button not found');
  await sleep(300);
}
// Open a scene hotspot (or quick link) by label — prefers real hotspots over navigation links
export async function spot(page, label) {
  const ok = await page.evaluate((label) => {
    const pick = (sel) => [...document.querySelectorAll(sel)].find((b) => ((b.getAttribute('aria-label') || '') + ' ' + b.textContent).includes(label) && b.getClientRects().length && !b.disabled);
    const b = pick('.room-hotspot') || pick('.room-quick-links button') || pick('.scene-tray-item') || pick('main button');
    if (!b) return false;
    b.click();
    return true;
  }, label);
  if (!ok) throw new Error('spot: not found "' + label + '"');
  await sleep(300);
}
export async function reveal(page) {
  const ok = await page.evaluate(() => {
    const b = document.querySelector('dialog[open] .story-stage-reveal .story-primary');
    if (!b) return false;
    b.click();
    return true;
  });
  if (!ok) throw new Error('reveal: no continue button');
  await sleep(350);
}
export async function roomSpots(page) {
  return page.evaluate(() => [...document.querySelectorAll('.room-hotspot,.place-next')]
    .filter((b) => b.getClientRects().length && !b.disabled)
    .map((b) => b.getAttribute('aria-label') || b.textContent.trim()));
}

// ---- 글자 대비 검사 (AUDIT=1 일 때 click/closeDialog 직전마다 화면 상태를 검사) ----
// 1차: 계산된 색으로 후보를 고르고, 2차: 실제 화면 픽셀로 (글자 있음 vs 글자 투명) 비교해 진짜 대비를 잰다
export const AUDIT = new Map();
const AUDIT_SEEN = new Set();
let sharp = null;
export async function audit(page, where = '') {
  if (!sharp) sharp = require('sharp');
  let cands;
  try {
    cands = await page.evaluate(() => {
      const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return [0, 0, 0, 0]; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
      const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const over = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
      const root = document.querySelector('dialog[open]') || document.body;
      document.querySelectorAll('[data-aud]').forEach((x) => x.removeAttribute('data-aud'));
      const out = []; const seen = new Set();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        if (!n.textContent.trim()) continue;
        const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
        if (el.closest('svg,script,style,noscript,[aria-hidden=true],[hidden]')) continue;
        const dt = el.closest('details'); if (dt && !dt.open && !el.closest('summary')) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
        let op = 1; for (let a = el; a && a !== document.documentElement; a = a.parentElement) op *= Number(getComputedStyle(a).opacity);
        if (op < 0.05) continue;
        const layers = []; let img = false;
        for (let a = el; a; a = a.parentElement) {
          const sc = getComputedStyle(a);
          if (sc.backgroundImage && sc.backgroundImage !== 'none') { img = true; break; }
          const bg = parse(sc.backgroundColor); if (bg[3] > 0) layers.push(bg);
          if (bg[3] >= 0.99) break;
        }
        // 형제 이미지 위에 겹친 글자
        if (!img) { const pr = el.offsetParent; if (pr) for (const im of pr.querySelectorAll('img,canvas,video')) { const q = im.getBoundingClientRect(); if (q.width && !(q.right < r.left || q.left > r.right || q.bottom < r.top || q.top > r.bottom) && !el.contains(im)) { img = true; break; } } }
        let bg = [255, 255, 255, 1]; for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg);
        const tc = parse(cs.color); if (tc[3] === 0) continue; tc[3] *= op; const fg = over(tc, bg);
        const ratio = (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05);
        const px = parseFloat(cs.fontSize), bold = Number(cs.fontWeight) >= 700;
        const need = (px >= 24 || (bold && px >= 18.6)) ? 3 : 4.5;
        if (img || ratio < need) { const id = out.length; el.setAttribute('data-aud', id); out.push({ id, img, ratio: Math.round(ratio * 100) / 100, need, text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40), cls: (el.tagName + '.' + (el.className?.toString?.() || '')).slice(0, 50), color: cs.color }); }
      }
      return out;
    });
  } catch (e) { console.log('AUDIT-ERR ' + e.message); return; }
  const scroll = await page.evaluate(() => [document.scrollingElement.scrollTop, ...[...document.querySelectorAll('dialog[open], dialog[open] *')].filter((x) => x.scrollHeight > x.clientHeight + 2).map((x) => x.scrollTop)]);
  for (const c of cands) {
    const key = c.cls + '|' + c.text + '|' + c.color;
    if (AUDIT_SEEN.has(key)) continue; AUDIT_SEEN.add(key);
    try {
      const sel = `[data-aud="${c.id}"]`;
      const box = await page.evaluate((sel) => { const e = document.querySelector(sel); e.scrollIntoView({ block: 'center', inline: 'nearest' }); const r = e.getBoundingClientRect(); return { x: Math.max(0, r.left), y: Math.max(0, r.top), w: Math.min(r.width, innerWidth - Math.max(0, r.left)), h: Math.min(r.height, innerHeight - Math.max(0, r.top)) }; }, sel);
      if (box.w < 3 || box.h < 3) continue;
      const clip = { x: Math.floor(box.x), y: Math.floor(box.y), width: Math.ceil(box.w), height: Math.ceil(box.h) };
      const A = await page.screenshot({ clip, animations: 'disabled' });
      await page.evaluate((sel) => { const e = document.querySelector(sel); e.dataset.audStyle = e.getAttribute('style') || ''; e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); e.style.setProperty('text-shadow', 'none', 'important'); }, sel);
      const B = await page.screenshot({ clip, animations: 'disabled' });
      await page.evaluate((sel) => { const e = document.querySelector(sel); const st = e.dataset.audStyle; if (st) e.setAttribute('style', st); else e.removeAttribute('style'); delete e.dataset.audStyle; }, sel);
      const a = await sharp(A).raw().toBuffer({ resolveWithObject: true }), b = await sharp(B).raw().toBuffer({ resolveWithObject: true });
      const ch = a.info.channels; const L = (r, g, bb) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bb); };
      const rs = [];
      for (let i = 0; i < a.data.length; i += ch) {
        const d = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
        if (d < 30) continue;
        const l1 = L(a.data[i], a.data[i + 1], a.data[i + 2]), l2 = L(b.data[i], b.data[i + 1], b.data[i + 2]);
        rs.push((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
      }
      rs.sort((x, y) => y - x);
      const real = rs.length ? rs[Math.floor(rs.length * 0.1)] : 1; // 글자 획의 상위 10% 대비
      // 픽셀 측정은 작은 글씨에서 실제보다 낮게 나오므로: 이미지 위 글자는 픽셀 2.2 미만, 그 외는 계산값 기준
      const need = c.img ? 2.2 : c.need;
      if (c.img ? real < need : c.ratio < c.need) { AUDIT.set(key, { ...c, real: Math.round(real * 100) / 100, need, where }); if (process.env.AUDIT_SHOTS) { const pad = 40; const big = { x: Math.max(0, clip.x - pad), y: Math.max(0, clip.y - pad), width: clip.width + pad * 2, height: clip.height + pad * 2 }; try { await page.screenshot({ path: `${process.env.AUDIT_SHOTS}/${AUDIT.size}-${c.text.slice(0, 12).replace(/[^가-힣A-Za-z0-9]/g, '_')}.png`, clip: big }); } catch {} } }
    } catch (e) { /* 요소가 사라짐 */ }
  }
  await page.evaluate((sc) => { document.scrollingElement.scrollTop = sc[0]; [...document.querySelectorAll('dialog[open], dialog[open] *')].filter((x) => x.scrollHeight > x.clientHeight + 2).forEach((x, i) => { if (sc[i + 1] != null) x.scrollTop = sc[i + 1]; }); }, scroll);
}
export function auditReport(tag = '') {
  console.log(`AUDIT checked ${AUDIT_SEEN.size} ${tag}`);
  for (const f of AUDIT.values()) console.log(`AUDIT real=${f.real} need=${f.need} calc=${f.ratio}${f.img ? ' IMG' : ''} ${f.color} [${f.cls}] "${f.text}" @${f.where}`);
  AUDIT.clear();
}

// ---- 가로 넘침 검사 (OVERFLOW=1): 화면 폭을 넘는 요소 (가로 스크롤 상자 안은 제외) ----
export const OVER = new Map();
export async function overflowCheck(page, where = '') {
  const res = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth; const out = [];
    const root = document.querySelector('dialog[open]') || document.body;
    const inScroller = (e) => { for (let p = e.parentElement; p && p !== root.parentElement; p = p.parentElement) { const cs = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(cs.overflowX) && p.clientWidth < p.scrollWidth + 1) return true; } return false; };
    for (const e of root.querySelectorAll('*')) {
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
      if (r.right > vw + 2 || r.left < -2) { if (inScroller(e)) continue; out.push((e.tagName + '.' + String(e.className || '').split(' ')[0]).slice(0, 40) + ` [${Math.round(r.left)}..${Math.round(r.right)} / ${vw}]`); }
    }
    return out.slice(0, 6);
  }).catch(() => []);
  for (const o of res) { const k = o.replace(/\[.*\]/, ''); if (!OVER.has(k)) OVER.set(k, o + ' @' + where); }
}
export function overflowReport() { if (!OVER.size) console.log('OVERFLOW OK'); for (const v of OVER.values()) console.log('OVERFLOW ' + v); OVER.clear(); }
