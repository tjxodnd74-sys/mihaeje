// node render.js <workdir>  -> <workdir>/video_silent.mp4 (1080x1920, 30fps)
// workdir/spec_full.json: {total, segs:[{t0, speakEnd, shots:[{src,frac,s0,s1,x,y,x1,y1,v0,rate,blur}], ov, caps:[[a,b,text]]}]}
const { chromium } = require('/home/claude/mihaeje/reels/pipeline/node_modules/playwright');
const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
(async () => {
  const W = path.resolve(process.argv[2]); const spec = JSON.parse(fs.readFileSync(path.join(W, 'spec_full.json'), 'utf8'));
  const from = parseFloat(process.argv[3] || '0'), to = parseFloat(process.argv[4] || spec.total), out = process.argv[5] || 'video_silent.mp4';
  for (const s of (spec.segs || [])) for (const sh of s.shots) sh.src = 'file://' + path.join(W, sh.src);
  for (const sh of (spec.shots || [])) sh.src = 'file://' + path.join(W, sh.src);
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.addInitScript(s => { window.SPEC = s; }, spec);
  await p.goto('file://' + path.join(__dirname, process.env.PAGE || 'page.html'));
  await p.evaluate(() => window.ready());
  const FPS = 30, N = Math.round((to - from) * FPS);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', path.join(W, out)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) {
    await p.evaluate(t => window.seek(t), from + f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 == 0) console.log('frame', f, '/', N);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done');
})();
