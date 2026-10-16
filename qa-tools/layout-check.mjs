// 모든 v2 편의 자료·장치를 열어 가로로 넘치는 요소가 있는지 봅니다 (PC/모바일). 사용: node qa-tools/layout-check.mjs
import * as L from './playlib.mjs';
const EPS = ['station', 'cat-invite', 'ohang', 'pet-home', 'studio', 'garage', 'letter', 'apartment', 'laundry', 'radio'];
await L.ensureServer();
let bad = 0;
for (const mobile of [false, true]) for (const id of EPS) {
  const { browser, page } = await L.launch({ mobile });
  await L.fresh(page, '/play.html?case=' + id);
  const names = await page.evaluate(() => Object.keys(window.MihaejeV2.episode.docs));
  for (const doc of names) {
    const res = await page.evaluate((doc) => {
      const ep = window.MihaejeV2.episode; const d = ep.docs[doc]; const html = typeof d.html === 'function' ? d.html({ profile: { seed: 1, companion: 3, counts: [1, 2, 1, 2, 2] } }) : d.html;
      const app = document.getElementById('app'); app.innerHTML = '<div class="v2-paper" style="max-width:620px;margin:0 auto;padding:16px;overflow:hidden"><div class="v2-doc-body">' + html + '</div></div>';
      const box = app.querySelector('.v2-doc-body').getBoundingClientRect();
      const clipped = (e) => { let p = e.parentElement; while (p && !p.classList.contains('v2-doc-body')) { if (getComputedStyle(p).overflow === 'hidden') return true; p = p.parentElement; } return false; };
      const over = [...app.querySelectorAll('.v2-doc-body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && !clipped(e) && (r.right > box.right + 3 || r.left < box.left - 3); }).map((e) => e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : ''));
      return [...new Set(over)];
    }, doc);
    if (res.length) { bad++; console.log(`OVERFLOW ${id}${mobile ? ' (mobile)' : ''} doc=${doc}: ${res.join(', ')}`); }
  }
  await browser.close();
}
console.log(bad ? `FAIL ${bad} overflowing docs` : 'PASS no horizontal overflow in any doc');
process.exitCode = bad ? 1 : 0;
