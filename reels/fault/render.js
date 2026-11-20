// node render.js spec.json out.mp4 [stillTimes...]
const { chromium } = require('playwright');
const { spawn } = require('child_process'); const fs = require('fs');
(async () => {
  const spec = JSON.parse(fs.readFileSync(process.argv[2])); const out = process.argv[3]; const stills = process.argv.slice(4).map(Number);
  const srv = spawn('python3', ['-m', 'http.server', '8765', '--directory', '/home/claude/ff/web'], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 800));
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text()); }); p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.addInitScript(s => { window.SPEC = s; }, spec);
  await p.goto('http://127.0.0.1:8765/' + (spec.page || 'fault.html')); await p.waitForFunction(() => window.__ok === true, null, { timeout: 120000 }); await p.evaluate(() => window.ready());
  if (stills.length) { for (const t of stills) { await p.evaluate(t => window.seek(t), t); await p.screenshot({ path: `${out}_${t}.jpg`, type: 'jpeg', quality: 80 }); } }
  else {
    const N = Math.round(spec.total * 30);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < N; f++) { await p.evaluate(t => window.seek(t), f / 30); const buf = await p.screenshot({ type: 'jpeg', quality: 92 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 90 == 0) console.log('frame', f, '/', N); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await b.close(); srv.kill(); console.log('done');
})();
