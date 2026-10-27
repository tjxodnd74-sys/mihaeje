// usage: node render.js <cards.json> <outdir>
// cards.json: {kicker, handle, cards:[{cls:'cover', photo, tag, title, sub} | {html}]}
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const out = process.argv[3]; fs.mkdirSync(out, { recursive: true });
  // photos: make absolute file:// so the template (in this folder) can load them
  for (const c of spec.cards) if (c.photo && !/^https?:|^file:/.test(c.photo)) c.photo = 'file://' + path.resolve(path.dirname(process.argv[2]), c.photo);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1400 }, deviceScaleFactor: 1 });
  await p.addInitScript(s => { window.CARDS = s; }, spec);
  await p.goto('file://' + path.join(__dirname, 'template.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  for (let i = 0; i < spec.cards.length; i++) {
    const el = await p.$('#c' + i);
    await el.screenshot({ path: path.join(out, `${String(i + 1).padStart(2, '0')}.png`) });
  }
  await b.close();
  console.log('ok', spec.cards.length);
})();
