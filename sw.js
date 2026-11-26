// 미해제 서비스 워커 — 홈 화면 설치 + 인터넷 없이 이어 하기
// VERSION 은 play.html 의 ?v= 와 같은 값 (npm run build 가 play.html 을 읽어 맞춰 준다)
// 버전이 바뀌면 sw.js 내용이 달라져 브라우저가 새 워커를 받고, 옛 캐시는 지운다
const VERSION = '147';
const CACHE = 'mihaeje-v' + VERSION;
const SCOPE = new URL('./', self.location).href; // GitHub Pages 에서는 …/mihaeje/
// rec/ = 같은 gh-pages 의 다른 사이트(즉흥연기 촬영기), api/ = 의견 서버 — 손대지 않는다
const SKIP = /^(rec|api)(\/|$)/;
const LEGACY = { studio: 'studio', ohang: 'ohang', case: 'garage', episode: '' }; // 옛 주소 → play.html?case=

const rel = (url) => (url.startsWith(SCOPE) ? url.slice(SCOPE.length) : null);
const pageKey = (url) => { const p = new URL(url).pathname.slice(new URL(SCOPE).pathname.length); return SCOPE + (p === '' ? 'index.html' : p); };
const episodeKey = (id) => SCOPE + 'v2/episodes/' + id + '.js?v=' + VERSION;

let listPromise = null;
function offlineList() {
  // 빌드가 만든 목록: { core: [...], cases: { <편 id>: [...] } }
  if (!listPromise) listPromise = fetch(SCOPE + 'offline-files.json?v=' + VERSION, { cache: 'no-store' }).then((r) => r.json()).catch(() => { listPromise = null; return { core: [], cases: {} }; });
  return listPromise;
}

// 이미 있는 건 건너뛰고 받아 둔다 (하나가 실패해도 나머지는 계속)
async function store(urls) {
  const cache = await caches.open(CACHE);
  await Promise.allSettled([...new Set(urls)].map(async (u) => {
    const url = new URL(u, SCOPE).href; const r = rel(url);
    if (r === null || SKIP.test(r)) return;
    if (await cache.match(url, { ignoreVary: true })) return;
    const res = await fetch(url, { cache: 'no-cache' });
    if (res.ok && res.type === 'basic') await cache.put(/\.html?$|\/$/.test(new URL(url).pathname) ? pageKey(url) : url, res);
  }));
}

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(offlineList().then((list) => store(['index.html', 'play.html', ...list.core])));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith('mihaeje-') && n !== CACHE).map((n) => caches.delete(n)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => {});
    await self.clients.claim();
  })());
});

// 페이지가 다 뜨면 알려 준다: 그 페이지가 쓴 파일 + (편이면) 그 편 그림·소리 전부
self.addEventListener('message', (e) => {
  const m = e.data || {};
  if (m.type !== 'warm') return;
  e.waitUntil((async () => {
    const urls = (m.urls || []).filter((u) => typeof u === 'string');
    let id = '';
    try { id = (new URL(m.href).searchParams.get('case') || '').replace(/[^a-z-]/g, ''); } catch {}
    if (id) { const list = await offlineList(); if (list.cases[id]) urls.push(...list.cases[id]); }
    await store(urls);
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const r = rel(req.url);
  if (r === null || SKIP.test(r)) return;
  if (req.mode === 'navigate') { e.respondWith(page(e)); return; }
  if (req.headers.has('range')) { e.respondWith(ranged(e)); return; }
  const url = new URL(req.url);
  if (url.searchParams.has('v')) { e.respondWith(cacheFirst(req)); return; }
  if (/\.(json|webmanifest)$/.test(url.pathname)) { e.respondWith(networkFirst(req)); return; }
  e.respondWith(staleWhileRevalidate(e));
});

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms, null));
const keep = async (key, res) => { if (res && res.ok && res.type === 'basic') { const c = await caches.open(CACHE); await c.put(key, res.clone()); } return res; };
const fromCache = async (req, opts) => (await caches.open(CACHE)).match(req, { ignoreVary: true, ...opts });

// 화면(html)은 늘 새 것부터 — 업데이트가 바로 가도록. 6초 넘게 걸리고 받아 둔 게 있으면 그걸 먼저
async function page(e) {
  const req = e.request, key = pageKey(req.url);
  const net = (async () => (await e.preloadResponse) || fetch(req))().then((res) => keep(key, res));
  net.catch(() => {});
  try {
    const quick = await Promise.race([net, timeout(6000)]);
    if (quick) return quick;
    const cached = await fromCache(key);
    return cached || await net;
  } catch {
    return offlinePage(req.url, key);
  }
}

async function offlinePage(href, key) {
  const url = new URL(href), name = url.pathname.split('/').pop().replace(/\.html$/, '');
  if (Object.prototype.hasOwnProperty.call(LEGACY, name)) { // 옛 주소는 새 플레이 화면으로
    const id = name === 'case' ? (url.searchParams.get('case') || 'garage') : (LEGACY[name] || url.searchParams.get('case'));
    if (id) return Response.redirect(SCOPE + 'play.html?case=' + encodeURIComponent(id), 302);
  }
  if (name === 'play') {
    const id = (url.searchParams.get('case') || '').replace(/[^a-z-]/g, '');
    if (id && !(await fromCache(episodeKey(id)))) return notSaved();
  }
  return (await fromCache(key)) || notSaved();
}

// 인터넷이 없고 이 편을 아직 받아 두지 않았을 때 (글에 마침표 없음)
function notSaved() {
  const body = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#111317"><title>인터넷 연결 없음 — 미해제</title><style>
@font-face{font-family:SUIT;src:url('${SCOPE}assets/SUIT-Variable.woff2') format('woff2');font-weight:100 900;font-display:swap}
html,body{margin:0;min-height:100%;background:#111317;color:#eceae4}
body{display:grid;place-items:center;min-height:100svh;padding:24px 16px;box-sizing:border-box;font:15px/1.75 SUIT,'Malgun Gothic',sans-serif;word-break:keep-all}
main{max-width:380px;text-align:center}
img{width:64px;height:64px;border-radius:14px;opacity:.92}
h1{font-size:20px;font-weight:700;margin:18px 0 8px;letter-spacing:-.01em}
p{margin:0 0 6px;color:#b0b4b2;font-size:14px}
.row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:22px}
a,button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:10px;font:600 14px/1 SUIT,'Malgun Gothic',sans-serif;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
button{background:#dfb578;color:#1b1610;border:0}
a{border:1px solid #414848;color:#eceae4}
</style></head><body><main>
<img src="${SCOPE}assets/app-icons/icon-192.png" alt="">
<h1>인터넷에 연결되어 있지 않아요</h1>
<p>이 이야기는 아직 이 기기에 받아 두지 않았어요</p>
<p>연결된 상태에서 한 번 열어 두면 그다음부터는 인터넷 없이도 이어서 할 수 있어요</p>
<div class="row"><button type="button" onclick="location.reload()">다시 시도</button><a href="${SCOPE}">테마 로비로</a></div>
</main></body></html>`;
  return new Response(body, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

// ?v= 가 붙은 파일(엔진·편 데이터·편 그림·빌드 묶음)은 주소가 곧 버전 — 받아 둔 게 있으면 그대로
async function cacheFirst(req) {
  const hit = await fromCache(req);
  if (hit) return hit;
  try { return await keep(req, await fetch(req)); } catch (err) {
    const near = await fromCache(req, { ignoreSearch: true }); // 인터넷이 없으면 버전만 다른 같은 파일이라도
    if (near) return near;
    throw err;
  }
}

async function networkFirst(req) {
  try { return await keep(req, await fetch(req)); } catch (err) {
    const hit = await fromCache(req) || await fromCache(req, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}

// 버전 없는 파일(글꼴·소리·표지): 받아 둔 걸 바로 주고 뒤에서 새로 받아 둔다
async function staleWhileRevalidate(e) {
  const req = e.request;
  const hit = await fromCache(req);
  const net = fetch(req).then((res) => keep(req, res));
  if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
  try { return await net; } catch (err) {
    const near = await fromCache(req, { ignoreSearch: true });
    if (near) return near;
    throw err;
  }
}

// 배경음·효과음은 브라우저가 Range 로 조금씩 달라고 한다 — 받아 둔 파일에서 잘라 준다 (아이폰은 206 이 꼭 필요)
async function ranged(e) {
  const req = e.request;
  const hit = await fromCache(req.url) || await fromCache(req.url, { ignoreSearch: true });
  if (!hit) {
    e.waitUntil(store([req.url]).catch(() => {})); // 다음을 위해 통째로 받아 둔다
    return fetch(req);
  }
  const buf = await hit.arrayBuffer(), size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  let start = m && m[1] !== '' ? +m[1] : 0, end = m && m[2] !== '' ? +m[2] : size - 1;
  if (m && m[1] === '' && m[2] !== '') { start = Math.max(0, size - +m[2]); end = size - 1; }
  end = Math.min(end, size - 1);
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  return new Response(buf.slice(start, end + 1), { status: 206, headers: {
    'Content-Type': hit.headers.get('Content-Type') || 'application/octet-stream',
    'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes',
  } });
}
