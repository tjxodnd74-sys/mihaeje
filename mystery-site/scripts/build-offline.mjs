// 홈 화면 앱(서비스 워커)용: sw.js 버전을 play.html 의 ?v= 에 맞추고,
// 인터넷 없이 쓸 파일 목록 dist/client/offline-files.json 을 만든다
// core = 처음 방문 때 받아 둘 공통 파일(엔진·글꼴·로비), cases = 편을 시작하면 받아 둘 그 편 그림·소리
import fs from 'node:fs';
import path from 'node:path';

const web = 'web', out = 'dist/client';
const play = fs.readFileSync(path.join(web, 'play.html'), 'utf8');
const V = (/engine\.js\?v=(\d+)/.exec(play) || [])[1];
if (!V) throw new Error('play.html 에서 engine.js?v= 를 찾지 못함');

// 1) sw.js 버전 맞추기 (원본과 dist 둘 다)
for (const file of [path.join(web, 'sw.js'), path.join(out, 'sw.js')]) {
  const src = fs.readFileSync(file, 'utf8'), next = src.replace(/const VERSION = '[^']*';/, `const VERSION = '${V}';`);
  if (next !== src) fs.writeFileSync(file, next);
}

const exists = (u) => fs.existsSync(path.join(out, decodeURIComponent(u.split('?')[0])));
const media = /\.(webp|jpe?g|png|svg|gif|mp3|wav|ogg|m4a|mp4|webm|woff2?)$/i;
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }) : []).map((f) => f.replaceAll('\\', '/')).filter((f) => media.test(f));

// 2) 공통: 로비·플레이 화면이 바로 쓰는 것
const core = new Set(['index.html', 'play.html', 'manifest.webmanifest', 'favicon.svg', 'cases.json',
  `v2/engine.js?v=${V}`, `v2/engine.css?v=${V}`, `v2/feedback-config.js?v=${V}`]);
for (const f of walk(path.join(out, 'assets/app-icons'))) core.add('assets/app-icons/' + f);
for (const f of walk(path.join(out, 'assets/covers'))) if (/-(480|960)-v2\.webp$/.test(f)) core.add('assets/covers/' + f);
const lobby = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
for (const m of lobby.matchAll(/(?:src|href)="([^"#:]+)"|url\(['"]?([^'")]+)['"]?\)/g)) {
  const u = (m[1] || m[2] || '').replace(/^\.?\//, '');
  if (u && !u.startsWith('data:') && /\.(js|css|webp|png|jpe?g|svg|woff2?)(\?|$)/.test(u)) core.add(u);
}
const engineCss = fs.readFileSync(path.join(web, 'v2/engine.css'), 'utf8');
for (const m of engineCss.matchAll(/url\(['"]?\.\.\/([^'")]+)['"]?\)/g)) core.add(m[1]);
const engineJs = fs.readFileSync(path.join(web, 'v2/engine.js'), 'utf8');
for (const m of engineJs.matchAll(/'(assets\/[^']+)'/g)) core.add(m[1]);

// 3) 편마다: 데이터 파일 + assets/v2/<id>/ 전부(엔진이 ?v= 를 붙여 부름) + 그 편이 부르는 다른 소리·그림
const cases = {};
for (const file of fs.readdirSync(path.join(web, 'v2/episodes')).filter((f) => f.endsWith('.js'))) {
  const id = file.replace(/\.js$/, ''), src = fs.readFileSync(path.join(web, 'v2/episodes', file), 'utf8');
  const list = new Set([`v2/episodes/${id}.js?v=${V}`]);
  for (const f of walk(path.join(out, 'assets/v2', id))) list.add(`assets/v2/${id}/${f}?v=${V}`);
  for (const m of src.matchAll(/assets\/(?!v2\/)[A-Za-z0-9_./-]+\.[a-z0-9]+/g)) if (media.test(m[0])) list.add(m[0]);
  cases[id] = [...list];
}

const all = [...core, ...Object.values(cases).flat()];
const missing = all.filter((u) => !exists(u));
if (missing.length) console.warn('offline-files: 없는 파일 ' + missing.length + '개 빼고 만듦 ' + missing.slice(0, 5).join(' '));
const keep = (u) => exists(u);
fs.writeFileSync(path.join(out, 'offline-files.json'), JSON.stringify({ v: V, core: [...core].filter(keep), cases: Object.fromEntries(Object.entries(cases).map(([k, v]) => [k, v.filter(keep)])) }));
console.log(`offline-files: v${V} 공통 ${[...core].filter(keep).length}개, 편 ${Object.keys(cases).length}개`);
