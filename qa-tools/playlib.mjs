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
