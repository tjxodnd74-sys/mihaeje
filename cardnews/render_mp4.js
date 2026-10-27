// usage: node render_mp4.js <cards.json> <outdir> [onlyIndex]
// cards.json: {kicker, handle, dur, cards:[{type:'cover'|'follow'|'text', ...}]}
// Each card -> <outdir>/NN.mp4 (1080x1350, 30fps, silent AAC track) + NN.jpg (last frame, for preview/cover)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30;
(async () => {
  const specPath = process.argv[2], out = process.argv[3], only = process.argv[4];
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  fs.mkdirSync(out, { recursive: true });
  const abs = s => (s && !/^https?:|^file:/.test(s)) ? 'file://' + path.resolve(path.dirname(specPath), s) : s;
  const b = await chromium.launch();
  for (let i = 0; i < spec.cards.length; i++) {
    if (only !== undefined && String(i) !== only) continue;
    const c = { ...spec.cards[i] }; c.photo = abs(c.photo); c.img = abs(c.img);
    const meta = { kicker: spec.kicker, handle: spec.handle, idx: i + 1, n: spec.cards.length };
    const dur = c.dur || spec.dur || 6;
    const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
    await p.addInitScript(([cc, mm]) => { window.CARD = cc; window.META = mm; }, [c, meta]);
    await p.goto('file://' + path.join(__dirname, 'anim.html'));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    const name = String(i + 1).padStart(2, '0');
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '64k',
      '-movflags', '+faststart', path.join(out, name + '.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(dur * FPS);
    let last;
    for (let f = 0; f < N; f++) {
      await p.evaluate(t => window.seek(t), f / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
      last = buf;
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    fs.writeFileSync(path.join(out, name + '.jpg'), last);
    await p.close();
    console.log('card', name, dur + 's');
  }
  await b.close();
})();
