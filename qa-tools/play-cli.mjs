// 사람처럼 한 걸음씩 플레이하는 도구 (상태는 프로필 폴더에 남아서 다음 호출에 이어짐)
// 사용: NODE_PATH=/home/claude/.npm-global/lib/node_modules node qa-tools/play-cli.mjs <profile> <pc|mobile> '<actions JSON>' [shot.png]
// actions 예: [{"goto":"/play.html?case=cat-invite"},{"click":"처음부터 하기"},{"hotspot":"창턱의 상자"},{"range":["봉투 기울기",36]},
//              {"type":["우편번호","35217"]},{"tap":[120,340]},{"drag":[[x1,y1],[x2,y2]]},{"scroll":400},{"dscroll":400},{"key":"Enter"},{"wait":800},{"close":true},{"hold":["시작 버튼",1100]}]
//  - click: 버튼/링크의 글자나 aria-label에 포함된 문자열 (정확히 같으면 우선), {"click":"...","n":1} 로 n번째
//  - hotspot: 장면 위 표시(aria-label 정확히)  - tap: 화면 좌표 클릭  - scroll: 페이지 스크롤  - dscroll: 열린 창 안 스크롤
// 출력: 열린 창(또는 본문) 글자, 누를 수 있는 것 목록, 장면 표시 목록, 스크린샷 경로
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.MIHAEJE_BASE || 'http://127.0.0.1:8790';
const [profile, mode, actsRaw, shotArg] = process.argv.slice(2);
const mobile = mode === 'mobile';
const dir = `/tmp/mihaeje-play/${profile}-${mode}`;
const ctx = await chromium.launchPersistentContext(dir, {
  viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 860 },
  isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1,
});
const page = ctx.pages()[0] || await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
page.on('dialog', async (d) => { errs.push('BROWSER-DIALOG ' + d.message()); await d.accept(); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const acts = actsRaw ? JSON.parse(actsRaw) : [];
if (!acts.some((a) => a.goto)) {
  const last = await ctx.storageState().catch(() => null);
  let url = (await import('node:fs')).existsSync(dir + '/.lasturl') ? (await import('node:fs')).readFileSync(dir + '/.lasturl', 'utf8') : '/play.html';
  if (!url.startsWith('/')) url = '/play.html';
  await page.goto(BASE + url); await sleep(700);
}
async function clickText(label, n = 0) {
  const ok = await page.evaluate(({ label, n }) => {
    const root = document.querySelector('dialog[open]') || document;
    const vis = (b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !b.closest('[hidden]'); };
    const all = [...root.querySelectorAll('button,a,[role=button],summary,label,.v2-hotspot')].filter(vis);
    const t = (b) => ((b.getAttribute('aria-label') || '') + ' ' + (b.innerText || '')).replace(/\s+/g, ' ').trim();
    let hits = all.filter((b) => (b.getAttribute('aria-label') || '').trim() === label || (b.innerText || '').replace(/\s+/g, ' ').trim() === label);
    if (!hits.length) hits = all.filter((b) => t(b).includes(label));
    const b = hits[n]; if (!b) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true;
  }, { label, n });
  if (!ok) throw new Error('못 찾음: ' + label);
}
for (const a of acts) {
  try {
    if (a.goto) { await page.goto(BASE + a.goto); await sleep(800); }
    else if (a.click != null) { await clickText(a.click, a.n || 0); await sleep(450); }
    else if (a.hotspot) { const ok = await page.evaluate((l) => { const b = [...document.querySelectorAll('.v2-hotspot')].find((x) => x.getAttribute('aria-label') === l); if (!b) return false; b.click(); return true; }, a.hotspot); if (!ok) throw new Error('표시 못 찾음: ' + a.hotspot); await sleep(450); }
    else if (a.tap) { if (mobile) await page.touchscreen.tap(a.tap[0], a.tap[1]); else await page.mouse.click(a.tap[0], a.tap[1]); await sleep(400); }
    else if (a.drag) { const [[x1, y1], [x2, y2]] = a.drag; await page.mouse.move(x1, y1); await page.mouse.down(); await page.mouse.move(x2, y2, { steps: 12 }); await page.mouse.up(); await sleep(300); }
    else if (a.range) { const [label, v] = a.range; const ok = await page.evaluate(({ label, v }) => { const root = document.querySelector('dialog[open]') || document; const n = [...root.querySelectorAll('input[type=range]')].find((i) => (i.getAttribute('aria-label') || '').includes(label)); if (!n) return false; n.value = v; n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true })); return true; }, { label, v }); if (!ok) throw new Error('슬라이더 못 찾음: ' + label); await sleep(300); }
    else if (a.type) { const [label, v] = a.type; const h = await page.evaluateHandle((label) => { const root = document.querySelector('dialog[open]') || document; return [...root.querySelectorAll('input:not([type=range]),textarea,select')].find((i) => ((i.getAttribute('aria-label') || '') + (i.placeholder || '') + (i.name || '')).includes(label)); }, label); const el = h.asElement(); if (!el) throw new Error('입력칸 못 찾음: ' + label); const tag = await el.evaluate((e) => e.tagName); if (tag === 'SELECT') await el.selectOption({ label: v }).catch(() => el.selectOption(v)); else { await el.fill(''); await el.type(String(v)); } await sleep(250); }
    else if (a.key) { await page.keyboard.press(a.key); await sleep(300); }
    else if (a.scroll != null) { await page.mouse.wheel(0, a.scroll); await sleep(300); }
    else if (a.dscroll != null) { await page.evaluate((y) => { const d = document.querySelector('dialog[open]'); if (!d) return; const s = [d, ...d.querySelectorAll('*')].find((x) => x.scrollHeight > x.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(x).overflowY)); (s || d).scrollBy(0, y); }, a.dscroll); await sleep(300); }
    else if (a.close) { await page.evaluate(() => { const d = document.querySelector('dialog[open]'); const b = d && [...d.querySelectorAll('button')].find((x) => /닫기|돌아가기/.test(x.getAttribute('aria-label') || x.textContent)); if (b) b.click(); }); await sleep(350); }
    else if (a.hold) { const [label, ms] = a.hold; const h = await page.evaluateHandle((l) => { const root = document.querySelector('dialog[open]') || document; return [...root.querySelectorAll('button')].find((b) => ((b.getAttribute('aria-label') || '') + b.innerText).includes(l)); }, label); const el = h.asElement(); if (!el) throw new Error('버튼 못 찾음: ' + label); const bb = await el.boundingBox(); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down(); await sleep(ms || 1000); await page.mouse.up(); await sleep(350); }
    else if (a.wait) await sleep(a.wait);
  } catch (e) { console.log('ACTION-ERROR', JSON.stringify(a), e.message); break; }
}
await page.waitForLoadState('load').catch(() => {}); await sleep(300);
const url = page.url().replace(BASE, '');
if (url.startsWith('/')) (await import('node:fs')).writeFileSync(dir + '/.lasturl', url);
const info = await page.evaluate(() => {
  const d = document.querySelector('dialog[open]');
  const root = d || document.querySelector('main') || document.body;
  const vis = (b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !b.closest('[hidden]'); };
  const btns = [...root.querySelectorAll('button,a,[role=button],summary')].filter(vis).map((b) => { const al = b.getAttribute('aria-label'); const tx = (b.innerText || '').replace(/\s+/g, ' ').trim(); return (al && al !== tx ? `${tx || '∅'} 〔${al}〕` : tx) + (b.disabled ? ' (비활성)' : ''); }).filter(Boolean);
  const spots = d ? [] : [...document.querySelectorAll('.v2-hotspot')].filter(vis).map((b) => b.getAttribute('aria-label'));
  const ranges = [...root.querySelectorAll('input[type=range]')].map((i) => `${i.getAttribute('aria-label')}=${i.value} (${i.min}~${i.max})`);
  const inputs = [...root.querySelectorAll('input:not([type=range]),select,textarea')].map((i) => `${i.tagName} ${i.getAttribute('aria-label') || i.placeholder || i.name}`);
  return { dialog: !!d, text: root.innerText.replace(/\n{3,}/g, '\n\n').slice(0, 6000), btns, spots, ranges, inputs, scrollY, docH: document.documentElement.scrollHeight };
});
const shot = shotArg || `${dir}/shot.png`;
await page.screenshot({ path: shot, fullPage: false });
console.log(`URL ${url}  ${info.dialog ? '[창 열림]' : ''}  scrollY=${info.scrollY}/${info.docH}`);
console.log('---- 글자 ----\n' + info.text);
console.log('---- 누를 수 있는 것 ----\n' + info.btns.join(' | '));
if (info.spots.length) console.log('---- 장면 표시 ----\n' + info.spots.join(' | '));
if (info.ranges.length) console.log('---- 슬라이더 ----\n' + info.ranges.join(' | '));
if (info.inputs.length) console.log('---- 입력칸 ----\n' + info.inputs.join(' | '));
if (errs.length) console.log('---- 오류 ----\n' + errs.join('\n'));
console.log('SHOT ' + shot);
await ctx.close();
