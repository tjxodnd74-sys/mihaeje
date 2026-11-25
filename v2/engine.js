// 미해제 v2 엔진. 한 편의 내용은 v2/episodes/<id>.js 한 파일에 있고, 이 파일은 그 구조를 화면으로 만듭니다.
const qs = new URLSearchParams(location.search);
const id = (qs.get('case') || '').replace(/[^a-z-]/g, '');
const root = document.getElementById('app');
// 자료 글꼴을 처음 화면 때 미리 받아 둔다 — 자료 창을 처음 열 때 글꼴이 바뀌며 글이 위로 당겨지던 것(CLS) 방지
try { document.fonts?.load('400 16px MihaejeSerif'); setTimeout(() => document.fonts?.load('400 16px MihaejeHand'), 1200); } catch {}

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const btn = (cls, text, fn, aria) => { const b = el('button', cls, text); b.type = 'button'; if (aria) b.setAttribute('aria-label', aria); b.onclick = fn; return b; };
const VER = new URL(import.meta.url).searchParams.get('v') || String(Date.now());
const bustUrl = (u) => (/^assets\/v2\//.test(u) && !/\?/.test(u) ? u + '?v=' + VER : u);
const pic = (img, src) => { img.src = bustUrl(src); const base = src.replace(/\.webp$/, ''); if (/assets\/v2\//.test(src)) { img.srcset = `${bustUrl(base + '-960.webp')} 960w, ${bustUrl(src)} 1024w`; img.sizes = '(max-width: 640px) 100vw, 1180px'; } return img; };
// 한가할 때 다음 장소 그림·장치 소품 그림을 하나씩 미리 받아 둡니다 (데이터 절약 모드·2G 에서는 받지 않음)
const warmed = new Set();
const warm = (srcs) => { const c = navigator.connection; if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return; const dup = new Set(srcs.filter((s) => /-960\.webp$/.test(s || '')).map((s) => s.replace('-960', ''))); const list = [...new Set(srcs)].filter((s) => s && !warmed.has(s) && !dup.has(s) && !/-960\.webp$/.test(s)).slice(0, 8); const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200)); const next = () => { const s = list.shift(); if (!s) return; warmed.add(s); const im = /\/props\//.test(s) ? new Image() : pic(new Image(), s); if (!im.src) im.src = bustUrl(s); im.onload = im.onerror = () => idle(next, { timeout: 4000 }); }; (document.fonts?.ready || Promise.resolve()).then(() => idle(next, { timeout: 4000 })); };
const propsIn = (epId, objs) => objs.filter(Boolean).flatMap((o) => [o.html, o.render].map(String).join(' ').match(/(?:assets\/v2\/[a-z-]+\/)?props\/[\w-]+\.webp/g) || []).map((s) => (s.startsWith('assets/') ? s : `assets/v2/${epId}/${s}`));
// 사진이 바뀌어도 브라우저가 옛 파일을 쓰지 않도록 버전을 붙입니다.
const bust = (node) => { node.querySelectorAll?.('img').forEach((i) => { const src = i.getAttribute('src') || ''; if (/^assets\/v2\//.test(src)) { i.src = bustUrl(src); const ss = i.getAttribute('srcset'); if (ss) i.srcset = ss.split(',').map((part) => { const [u, w] = part.trim().split(/\s+/); return bustUrl(u) + (w ? ' ' + w : ''); }).join(', '); } }); return node; };
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1); if (c < 0xac00 || c > 0xd7a3) return w + b; const t = (c - 0xac00) % 28; return w + (t === 0 || t === 8 ? b : a); }; // 받침 없음·ㄹ받침 → '로'
const html = (tag, cls, markup) => { const n = el(tag, cls); n.innerHTML = markup; return n; };

const sounds = {
  paper: 'assets/sounds/paper-turn-v23.wav', lock: 'assets/sounds/lock-v24.wav', keys: 'assets/sounds/keys-v24.wav',
  door: 'assets/sounds/door-open-v23.wav', drawer: 'assets/sounds/drawer-open-v23.wav', on: 'assets/sounds/switch-on-v24.wav',
};
let audioOn = true; // 기본 켜짐. 끄면 기억합니다.
try { const v = localStorage.getItem('mihaeje-v2-sound'); if (v != null) audioOn = v !== '0'; else { const b = JSON.parse(localStorage.getItem('mihaeje-bgm-v1') || 'null'); if (b && typeof b.enabled === 'boolean') audioOn = b.enabled; } } catch {}
function syncLobbySound(on) { try { const b = JSON.parse(localStorage.getItem('mihaeje-bgm-v1') || 'null') || { volume: 45 }; b.enabled = on; localStorage.setItem('mihaeje-bgm-v1', JSON.stringify(b)); localStorage.setItem('mihaeje-effects-v1', on ? 'on' : 'off'); } catch {} }
// 브라우저는 사용자가 한 번 누르기 전에는 소리를 못 내므로, 첫 터치/클릭 때 배경음을 시작합니다.
// 휴대폰은 손가락을 뗄 때(pointerup·touchend·click)에야 소리를 허락하므로 그때도 다시 시도합니다.
// 첫 터치/키 전에는 배경음 파일을 만들지도 받지도 않는다 (느린 망에서 첫 화면 글꼴·그림과 대역폭을 나누지 않게)
let armed = false, gestured = false;
function armMusic(ep) {
  if (armed) return; armed = true;
  const go = (e) => { if (e?.type && e.type !== 'visibilitychange') gestured = true; syncMusic(ep); };
  ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach((t) => document.addEventListener(t, go, { capture: true, passive: true }));
  // 화면을 떠나면(다른 앱·탭·화면 꺼짐) 배경음을 멈추고, 돌아오면 이어서
  document.addEventListener('visibilitychange', go);
  addEventListener('pagehide', () => music?.pause());
}
function play(name) { if (!audioOn || !sounds[name] || document.hidden) return; try { const a = new Audio(sounds[name]); a.volume = 0.5; a.play().catch(() => {}); } catch {} }
let music = null;
function syncMusic(ep) {
  if (!ep.music) return;
  if (!audioOn || document.hidden) { if (music) { music.pause(); } return; }
  if (!gestured) return;
  if (!music) { music = new Audio(ep.music); music.loop = true; music.volume = 0.22; music.preload = 'auto'; }
  if (music.paused) music.play().catch(() => {});
}
// 누름 피드백: 손가락으로 눌렀을 때만 아주 짧게 떨림 (지원하는 기기만 · 소리를 끄면 같이 꺼짐)
let lastPointer = '';
addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; }, { capture: true, passive: true });
function buzz(p = 8) { if (!audioOn || lastPointer !== 'touch' || typeof navigator.vibrate !== 'function') return; try { navigator.vibrate(p); } catch {} }
document.addEventListener('click', (e) => { if (e.target.closest?.('button:not(:disabled), a.v2-primary, a.v2-secondary, [role=button]')) buzz(8); }, { capture: true });
// 휴대폰에서 길게 누르면 뜨는 메뉴(그림 저장·링크 등)를 막는다 (입력칸은 그대로)
document.addEventListener('contextmenu', (e) => { if (lastPointer === 'touch' && !e.target.closest?.('input, textarea, [contenteditable]')) e.preventDefault(); });

async function main() {
  if (!id) { location.replace('index.html#cases'); return; }
  let ep;
  try { ep = (await import(`./episodes/${id}.js?v=${VER}`)).default; } catch (e) { const p = el('p', 'v2-error', '이 주소의 이야기를 찾지 못했습니다 '); const a = el('a', '', '테마 로비로 가기'); a.href = 'index.html#cases'; p.append(a); root.append(p); console.error(e); return; }
  document.title = `${ep.title} — 미해제`;
  document.documentElement.dataset.case = ep.id;

  const KEY = ep.storageKey || 'mihaeje-v2-' + ep.id;
  const fresh = () => ({ v: 2, screen: 'intro', scene: ep.scenes[0].id, read: [], visited: [], solved: [], drafts: {}, hints: {}, seen: [] });
  // 저장: 본 키는 예전 모양 그대로, 백업·막힘·깨짐 처리는 store.js (막혀도 메모리로 계속)
  const { openStore, askPersist, encodeCode, decodeCode, copyText, note } = await import(`./store.js?v=${VER}`);
  const isSave = (o) => !!o && typeof o === 'object' && !Array.isArray(o) && o.v === 2;
  const tidy = (raw) => {
    const s = { ...fresh(), ...raw };
    ['read', 'visited', 'seen'].forEach((k) => { if (!Array.isArray(s[k])) s[k] = []; });
    ['drafts', 'hints'].forEach((k) => { if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {}; });
    if (s.found !== undefined && !Array.isArray(s.found)) delete s.found;
    if (s.solved !== true && !Array.isArray(s.solved)) s.solved = [];
    if (!ep.scenes.some((x) => x.id === s.scene)) s.scene = ep.scenes[0].id;
    // 예전 저장본은 엔딩에서 solved를 true로 덮어썼다 — 배열로 되돌린다
    if (!Array.isArray(s.solved)) { s.ended = true; s.solved = Object.keys(ep.devices); }
    return s;
  };
  let S = fresh();
  // 처음 열 때 저장이 막혀 있으면 표지의 안내 줄이 대신 말한다 (같은 말 두 번 띄우지 않기)
  const store = openStore(KEY, { valid: isSave, onTrouble: (kind, text) => { if (kind === 'blocked' && S.screen === 'intro') return; note(text); } });
  { const raw = store.load(); if (raw) S = tidy(raw); }
  const save = () => { store.save(S); if (S.visited.length || S.solved.length) askPersist(); };

  const docIds = Object.keys(ep.docs);
  const openDocs = () => docIds.filter((d) => !ep.docs[d].locked || S.screen === 'ending' || S.ended);
  const unlockedScenes = () => ep.scenes.filter((s) => !s.unlockedBy || S.solved.includes(s.unlockedBy));
  const sceneById = (sid) => ep.scenes.find((s) => s.id === sid);
  const deviceOf = (did) => ep.devices[did];
  // 장치가 플레이어 눈에 보이는가 (장면이 열렸고, 그 장치 표시가 아직 숨겨져 있지 않음)
  const deviceShown = (did) => { const sc = unlockedScenes().find((s) => s.id === ep.devices[did].scene); if (!sc) return false; const hs = (sc.hotspots || []).filter((h) => h.device === did); return !hs.length || hs.some((h) => !h.visible || h.visible(S)); };
  const activeDevices = () => Object.keys(ep.devices).filter((did) => !S.solved.includes(did) && deviceShown(did));

  // ---------- 공통 틀 ----------
  let dialog = null;
  function openDialog(node, { label, onClose, wide, drawer } = {}) {
    closeDialog();
    dialog = el('dialog', 'v2-dialog' + (wide ? ' wide' : '') + (drawer ? ' drawer' : ''));
    if (label) dialog.setAttribute('aria-label', label);
    const box = el('div', 'v2-dialog-box');
    const bar = el('div', 'v2-dialog-bar');
    bar.append(el('span', 'v2-dialog-label', label || ''), btn('v2-close', '닫기', () => closeDialog(), '닫기'));
    box.tabIndex = -1;
    box.append(bar, node);
    dialog.append(box);
    const me = dialog;
    me.addEventListener('close', () => { me.remove(); if (dialog === me) { dialog = null; onClose?.(); } });
    me.addEventListener('click', (e) => { if (e.target === me) me.close(); });
    document.body.append(dialog);
    dialog.showModal();
    pushGuard();
    box.focus({ preventScroll: true });
    box.scrollTop = 0;
  }
  function closeDialog() { if (dialog?.open) dialog.close(); }

  // ---------- 뒤로가기 (안드로이드 뒤로 버튼 · 브라우저 뒤로 · 앱 웹뷰의 goBack) ----------
  // 창을 열거나 그림에 다가갈 때 기록을 한 칸(guard) 쌓아 둔다 창을 닫기 버튼으로 닫아도 그 칸은 그대로 두고(코드로 history.back() 을 부르면 다음 창 열기와 엇갈린다),
  // 뒤로가기가 그 칸을 쓰면: 창이 열려 있으면 닫기 · 다가가 있으면 물러나기 · 아무것도 없으면 한 번 더 뒤로(= 브라우저 기본 동작, 이전 페이지)
  let guard = history.state?.mhjLayer === 1; // 창을 연 채 새로고침해도 칸이 남아 있다
  function pushGuard() { if (guard) return; try { history.pushState({ mhjLayer: 1 }, ''); guard = true; } catch {} }
  function unzoom(stage) { const pan = stage.querySelector('.v2-pan'); zoomBack = null; if (pan) { pan.style.transition = ''; pan.style.transform = ''; } stage.classList.remove('zoomed'); }
  addEventListener('popstate', (e) => {
    if (e.state?.mhjLayer === 1) { guard = true; return; } // 앞으로 가기로 칸에 다시 올라옴
    if (!guard) return;
    guard = false;
    const st = document.querySelector('.v2-stage.zoomed');
    if (dialog?.open) closeDialog();
    else if (st) unzoom(st);
    else history.back();
  });

  function header() {
    const h = el('header', 'v2-header');
    const logo = html('a', 'v2-logo', '<img src="assets/mihaeje-logo-v2.webp" alt="미해제" width="1983" height="793" decoding="async">'); logo.href = 'index.html';
    const right = el('div', 'v2-header-right');
    const back = el('a', 'v2-back', '← 테마 로비'); back.href = 'index.html';
    const snd = btn('v2-sound' + (audioOn ? ' on' : ''), audioOn ? '배경음 켜짐' : '배경음 꺼짐', () => { audioOn = !audioOn; try { localStorage.setItem('mihaeje-v2-sound', audioOn ? '1' : '0'); } catch {} syncLobbySound(audioOn); snd.textContent = audioOn ? '배경음 켜짐' : '배경음 꺼짐'; snd.classList.toggle('on', audioOn); syncMusic(ep); if (audioOn) play('on'); }, '배경음·효과음·누름 진동 켜고 끄기');
    right.append(back, snd);
    h.append(logo, right);
    return h;
  }

  function render() {
    root.replaceChildren(header());
    armMusic(ep);
    if (S.screen === 'intro') root.append(intro());
    else if (S.screen === 'opening') root.append(opening());
    else if (S.screen === 'ending') root.append(ending());
    else if (S.screen === 'intake') root.append(intakeScreen());
    else root.append(playScreen());
    syncMusic(ep);
  }

  // ---------- 1. 표지 ----------
  function intro() {
    const sec = el('section', 'v2-intro');
    const cover = pic(el('img', 'v2-cover'), ep.cover); cover.alt = ep.coverAlt || ''; cover.decoding = 'async'; sec.append(cover);
    cover.addEventListener('load', () => warm([ep.opening?.image, (sceneById(S.scene) || ep.scenes[0]).image]), { once: true });
    const card = el('div', 'v2-intro-card');
    card.append(el('p', 'v2-eyebrow', `${ep.number} · ${ep.genre}`));
    card.append(el('h1', 'v2-title', ep.title));
    card.append(el('p', 'v2-subtitle', ep.subtitle));
    card.append(html('p', 'v2-tagline', ep.tagline.replace(/\n/g, '<br>')));
    card.append(html('p', 'v2-blurb', ep.blurb.replace(/\n/g, '<br>')));
    const meta = el('p', 'v2-meta', `약 ${ep.minutes}분 · 난이도 ${'★'.repeat(ep.difficulty)}${'☆'.repeat(5 - ep.difficulty)} · 자료 ${docIds.filter((x) => !ep.docs[x].locked).length}장 · 1인`);
    card.append(meta);
    const row = el('div', 'v2-row');
    const started = S.visited.length > 0 || S.solved.length > 0;
    if (started) row.append(btn('v2-primary', '이어서 하기', () => { S.screen = 'play'; save(); render(); }));
    row.append(btn(started ? 'v2-secondary' : 'v2-primary', '처음부터 하기', () => { if (started && !confirm('지금까지의 진행을 지우고 처음부터 할까요?')) return; S = fresh(); S.screen = 'opening'; S.started = true; save(); render(); }));
    card.append(row);
    card.append(el('p', 'v2-fine', store.mode === 'memory' ? '가상의 이야기 · 이 브라우저는 저장이 막혀 있어 창을 닫으면 진행이 사라져요 아래 진행 코드로 옮겨 둘 수 있어요' : '가상의 이야기 · 진행은 이 브라우저에 저장됩니다'));
    card.append(transfer(started));
    sec.append(card);
    return sec;
  }

  // 다른 기기·앱으로 진행 옮기기 (접힌 칸)
  function transfer(started) {
    const box = el('details', 'v2-transfer');
    box.append(el('summary', '', '다른 기기에서 이어하기'));
    const body = el('div', 'v2-transfer-body');
    const status = el('p', 'v2-transfer-status'); status.setAttribute('role', 'status');
    const say = (m, bad) => { status.textContent = m; status.classList.toggle('wrong', !!bad); };
    if (started) {
      body.append(el('p', 'v2-transfer-help', '지금 진행을 코드로 옮겨 다른 기기나 앱의 이 편 처음 화면에 붙여 넣으면 이어서 할 수 있어요'));
      const out = el('input', 'v2-transfer-code'); out.type = 'text'; out.readOnly = true; out.setAttribute('aria-label', '내 진행 코드'); out.spellcheck = false;
      const copy = btn('v2-secondary', '코드 복사', async () => { if (!out.value) return; say(await copyText(out.value, out) ? '복사했어요 다른 기기에서 붙여 넣어 주세요' : '코드 칸을 길게 눌러 직접 복사해 주세요'); });
      copy.disabled = true;
      const line = el('div', 'v2-transfer-line'); line.append(out, copy);
      body.append(line);
      box.addEventListener('toggle', async () => { if (!box.open || out.value) return; try { out.value = await encodeCode(ep.id, S); copy.disabled = false; } catch { say('코드를 만들지 못했어요 잠시 뒤 다시 열어 주세요', true); } });
    }
    const inp = el('input', 'v2-transfer-code'); inp.type = 'text'; inp.placeholder = '받은 코드 붙여 넣기'; inp.setAttribute('aria-label', '받은 진행 코드'); inp.spellcheck = false; inp.autocomplete = 'off'; inp.autocapitalize = 'off';
    const load = btn('v2-secondary', '이 코드로 이어하기', async () => {
      const r = await decodeCode(inp.value, ep.id, isSave);
      if (r.error) { say(r.error, true); return; }
      if (started && !confirm('이 기기의 지금 진행을 코드의 진행으로 바꿀까요?')) return;
      S = tidy(r.state); S.screen = 'intro'; save(); render();
      note('진행을 불러왔어요 이어서 하기를 눌러 주세요', 5000);
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') load.click(); });
    const line2 = el('div', 'v2-transfer-line'); line2.append(inp, load);
    body.append(line2, status);
    box.append(body);
    return box;
  }

  // ---------- 2. 오프닝 ----------
  function opening() {
    // 컷신처럼: 첫 장면 그림 위에서 한 문단씩, 누를 때마다 다음 문단
    const sec = el('section', 'v2-opening cine');
    const bg = pic(el('img', 'v2-cine-bg'), ep.opening.image || ep.scenes[0].image); bg.alt = ''; bg.setAttribute('aria-hidden', 'true'); sec.append(bg);
    const box = el('article', 'v2-cine-box');
    box.append(el('p', 'v2-eyebrow', ep.opening.eyebrow));
    const paras = ep.opening.paragraphs.map((p) => el('p', 'v2-line', p));
    paras.forEach((p) => box.append(p));
    const go = btn('v2-primary v2-cine-go', ep.opening.cta + ' →', () => { S.screen = ep.intake && !S.profile ? 'intake' : 'play'; save(); render(); window.scrollTo({ top: 0 }); });
    const next = btn('v2-cine-next', '다음', () => step(), '다음 문단');
    box.append(next, go);
    let k = 0;
    const show = () => { paras.forEach((p, i) => { p.classList.toggle('on', i <= k); p.classList.toggle('past', i < k); }); const end = k >= paras.length - 1; next.hidden = end; go.classList.toggle('on', end); if (end) go.focus({ preventScroll: true }); paras[k]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    const step = () => { if (k < paras.length - 1) { k++; show(); play('paper'); } };
    sec.addEventListener('click', (e) => { if (e.target.closest('button')) return; step(); });
    const skip = btn('v2-cine-skip', '모두 보기', () => { k = paras.length - 1; show(); });
    sec.append(box, skip);
    show();
    return sec;
  }

  // ---------- 2.5 접수 (편이 요구할 때만: 생년월일 같은 입력) ----------
  function intakeScreen() {
    const sec = el('section', 'v2-opening v2-intake');
    const paper = el('article', 'v2-paper v2-opening-paper');
    const done = (profile) => { S.profile = profile; S.screen = 'play'; save(); play('keys'); render(); window.scrollTo({ top: 0 }); };
    paper.append(ep.intake.render({ S, el, btn, save, done }));
    sec.append(paper);
    return sec;
  }

  // ---------- 3. 플레이 (세이브어스식: 화면 꽉 찬 장면 · 물건을 직접 누르면 그쪽으로 다가감 · 아래 대사창 · 위 소지품) ----------
  let zoomBack = null; // 창을 닫고 돌아오면 가까이 본 자리에서 물러난다
  const sceneSeen = new Set(); // 이번 접속에서 대사창을 이미 본 장면
  function playScreen() {
    const scene = sceneById(S.scene) || ep.scenes[0];
    const places = unlockedScenes();
    const sec = el('section', 'v2-play');
    // 위: 장소 이름 · 남긴 것 · 소지품 · 힌트
    const hud = el('div', 'v2-hud');
    // 장소 이름을 누르면 열린 장소 목록 (양옆 화살표로도 오간다)
    const where = btn('v2-where', '', () => { menu.hidden = !menu.hidden; where.setAttribute('aria-expanded', String(!menu.hidden)); }, '장소 고르기 · 지금 ' + scene.name);
    where.append(el('b', '', scene.name), el('small', '', `${places.indexOf(scene) + 1} / ${places.length}`));
    if (places.length > 1) where.append(html('span', 'caret', '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>')); else where.disabled = true;
    const menu = el('div', 'v2-places'); menu.hidden = true; menu.setAttribute('aria-label', '장소');
    places.forEach((p, i) => { const b = btn('v2-place' + (p.id === scene.id ? ' on' : ''), `${i + 1}. ${p.name}`, () => { menu.hidden = true; if (p.id === scene.id) return; S.scene = p.id; save(); play('door'); render(); }); if (p.id === scene.id) b.setAttribute('aria-current', 'page'); menu.append(b); });
    const whereBox = el('div', 'v2-where-box'); whereBox.append(where, menu);
    hud.append(whereBox);
    if (ep.traces?.length) {
      const tr = el('div', 'v2-traces'); tr.setAttribute('aria-label', ep.tracesLabel || '남긴 것');
      ep.traces.forEach((t) => { const got = S.solved.includes(t.device); const i = el('span', 'v2-trace' + (got ? ' got' : ''), got ? t.label : '· · ·'); i.setAttribute('aria-label', got ? t.label : '아직 찾지 못함'); tr.append(i); });
      hud.append(tr);
    }
    const tools = el('div', 'v2-hud-tools');
    const n = S.read.filter((d) => openDocs().includes(d)).length, m = openDocs().length;
    const bag = btn('v2-hud-btn bag', '', () => openIndex(), `자료 ${n} / ${m}`);
    bag.append(html('span', 'ico', '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8Zm4 0V6a3 3 0 0 1 6 0v2"/></svg>'), el('span', 'lab', '소지품'), el('b', 'num', `${n}/${m}`));
    if (openDocs().some((d) => !S.read.includes(d) && ((S.found || []).includes(d)))) bag.classList.add('new');
    const hint = btn('v2-hud-btn', '', () => openHints(), '힌트');
    hint.append(html('span', 'ico', '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/></svg>'), el('span', 'lab', '힌트'));
    tools.append(bag, hint);
    hud.append(tools);
    sec.append(hud);
    // 무대: 모바일은 세로 화면에 그림을 크게 두고 옆으로 밀어 둘러본다
    const stage = el('div', 'v2-stage');
    stage.dataset.scene = scene.id;
    const scroller = el('div', 'v2-scroll');
    const pan = el('div', 'v2-pan');
    const img = pic(el('img', 'v2-stage-img'), scene.image); img.alt = scene.name; img.decoding = 'async'; pan.append(img);
    img.addEventListener('load', () => warm([...propsIn(ep.id, [...Object.values(ep.devices).filter((d) => d.scene === scene.id), ...scene.hotspots.map((h) => ep.docs[h.doc])]), ...[...ep.scenes.filter((sc) => ep.devices[sc.unlockedBy]?.scene === scene.id), ep.scenes[ep.scenes.indexOf(scene) + 1]].map((sc) => sc?.image)]), { once: true });
    (scene.overlays || []).forEach((o) => { const nn = html('div', 'v2-stage-ov ' + (o.cls || ''), o.html); nn.style.cssText = `left:${o.x}%;top:${o.y}%;width:${o.w}%;height:${o.h}%;${o.style || ''}`; nn.setAttribute('aria-hidden', 'true'); pan.append(nn); });
    const autoTravel = ep.scenes.filter((sc) => sc.unlockedBy && S.solved.includes(sc.unlockedBy) && ep.devices[sc.unlockedBy]?.scene === scene.id && !S.visited.includes(sc.id)).map((sc, i, arr) => ({ id: 'go-' + sc.id, x: arr.length > 1 ? 30 + i * (40 / (arr.length - 1)) : 50, y: 92, label: sc.name + '(으)로 가기', kind: 'travel', to: sc.id, auto: true }));
    // 이 장소에 더 풀 장치가 없으면, 아직 안 푼 장치가 있는 열린 장소로 가는 버튼을 준다 (이미 가 본 곳이라도)
    const openHere = Object.keys(ep.devices).some((did) => ep.devices[did].scene === scene.id && !S.solved.includes(did) && deviceShown(did));
    if (!openHere) { const t = unlockedScenes().find((sc) => sc.id !== scene.id && Object.keys(ep.devices).some((did) => ep.devices[did].scene === sc.id && !S.solved.includes(did) && deviceShown(did))); if (t && !autoTravel.some((a) => a.to === t.id) && !scene.hotspots.some((h) => h.kind === 'travel' && h.to === t.id && (!h.visible || h.visible(S)))) autoTravel.push({ id: 'go-' + t.id, x: 50, y: 92, label: t.name + '(으)로 가기', kind: 'travel', to: t.id, auto: true }); }
    const travelRow = el('div', 'v2-travel-row');
    [...scene.hotspots, ...autoTravel].forEach((h, hi) => {
      if (h.visible && !h.visible(S)) return;
      const done = h.kind === 'doc' ? S.read.includes(h.doc) : h.kind === 'device' ? S.solved.includes(h.device) : h.kind === 'travel' ? S.visited.includes(h.to) : false;
      if (h.auto) h.label = josa(h.label.replace('(으)로 가기', ''), '으로', '로') + ' 가기';
      // 새로 열린 장소로 가는 길은 눈에 보이는 버튼으로, 나머지는 그림 속 물건 자리에 보이지 않는 누름 자리로
      if (h.auto) { const b = btn('v2-hotspot travel go', '', () => act(h), h.label); b.append(el('span', 'v2-hotspot-label', h.label + ' →')); travelRow.append(b); return; }
      const b = btn('v2-hotspot' + (done ? ' done' : '') + (h.kind === 'device' ? ' device' : '') + (h.kind === 'travel' ? ' travel' : '') + (h.y > 76 ? ' above' : ''), '', () => act(h, b), h.label);
      b.style.left = h.x + '%'; b.style.top = h.y + '%';
      if (h.r) b.style.setProperty('--hit', h.r + '%');
      // 아직 안 본 물건은 작은 빛이 가끔 반짝인다(자리마다 다른 박자)
      b.style.setProperty('--tw', (-((h.x * 7.3 + h.y * 3.1 + hi * 1.37) % 4.2)).toFixed(2) + 's');
      b.append(el('i'), el('span', 'v2-hotspot-label', h.label));
      pan.append(b);
    });
    const visSig = scene.hotspots.filter((h) => !h.visible || h.visible(S)).map((h) => h.id || h.device || h.doc || h.to);
    scroller.append(pan); stage.append(scroller);
    // 새 길 버튼 줄은 무대 밖 상자에 둔다: PC는 그림 위 아래쪽에 띄우고, 휴대폰(그림을 밀어 보는 화면)은 무대 바로 아래로 빼서 누름 자리를 가리지 않게
    const stageBox = el('div', 'v2-stage-box'); stageBox.append(stage);
    if (travelRow.children.length) { stageBox.append(travelRow); stageBox.classList.add('has-travel'); sec.classList.add('has-travel'); }
    // 양옆 화살표: 그림이 화면보다 넓으면(휴대폰) 그림을 옆으로 밀고, 아니면(PC) 열린 장소끼리 오간다
    const k = places.indexOf(scene);
    const goPlace = (d) => { const t = places[(k + d + places.length) % places.length]; S.scene = t.id; save(); play('door'); render(); };
    const nm = (d) => josa(places[(k + d + places.length) % places.length].name, '으로', '로') + ' 가기';
    const arrow = (cls, dir, d) => { const b = btn('v2-edge ' + cls, '', () => (stage.classList.contains('panable') ? panBy(d * scroller.clientWidth * 0.7) : goPlace(d)), places.length > 1 ? nm(d) : ''); b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${dir}"/></svg>`; return b; };
    // 그림 밀기: 기기마다 scrollBy(smooth)가 안 먹는 경우가 있어 직접 움직인다
    const panBy = (dx) => { const from = scroller.scrollLeft, to = Math.max(0, Math.min(scroller.scrollWidth - scroller.clientWidth, from + dx)), t0 = performance.now(); const stepF = (t) => { const k = Math.min(1, (t - t0) / 320); scroller.scrollLeft = from + (to - from) * (1 - Math.pow(1 - k, 3)); syncEdges(); if (k < 1) requestAnimationFrame(stepF); }; requestAnimationFrame(stepF); };
    const aL = arrow('left', 'M15 4 7 12l8 8', -1), aR = arrow('right', 'm9 4 8 8-8 8', 1);
    stage.append(aL, aR);
    const syncEdges = () => {
      const panable = scroller.scrollWidth > scroller.clientWidth + 4; stage.classList.toggle('panable', panable);
      if (panable) { const x = scroller.scrollLeft, max = scroller.scrollWidth - scroller.clientWidth; aL.hidden = x < 6; aR.hidden = x > max - 6; aL.setAttribute('aria-label', '왼쪽 보기'); aR.setAttribute('aria-label', '오른쪽 보기'); }
      else { aL.hidden = aR.hidden = places.length < 2; }
    };
    scroller.addEventListener('scroll', syncEdges, { passive: true });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      syncEdges();
      // 휴대폰에서 처음 한 번: 옆으로 밀 수 있다는 걸 보여 준다
      if (stage.classList.contains('panable') && !sessionStorage.getItem('mihaeje-pan-tip')) {
        try { sessionStorage.setItem('mihaeje-pan-tip', '1'); } catch {}
        const tip = el('div', 'v2-pan-tip', '← 그림을 옆으로 밀어서 둘러보기 →'); tip.setAttribute('aria-hidden', 'true'); stage.append(tip); setTimeout(() => tip.remove(), 3200);
      }
    }));
    // 살펴볼 곳 잠깐 보기
    // '?'는 그림 위가 아니라 위 줄에 (그림 속 물건을 가리지 않게)
    const peek = btn('v2-hud-btn v2-peek', '', () => { stage.querySelector('.v2-pan-tip')?.remove(); stage.classList.add('peek'); clearTimeout(peek._t); peek._t = setTimeout(() => stage.classList.remove('peek'), 2600); }, '살펴볼 곳 잠깐 보기');
    peek.append(el('span', 'ico q', '?'), el('span', 'lab', '살펴보기'));
    tools.prepend(peek);
    // 대사창: 처음 온 장면(또는 이번 접속에서 처음 보는 장면)에 한 번, 누르면 넘어간다
    const firstVisit = !S.visited.includes(scene.id);
    if (firstVisit) { S.visited.push(scene.id); save(); }
    const line = typeof scene.arrive === 'function' ? scene.arrive(S) : scene.arrive;
    const talk = el('div', 'v2-talk'); talk.setAttribute('role', 'status');
    const who = el('span', 'v2-talk-who', ep.narrator || '나');
    const say = el('p', 'v2-talk-line');
    [...(line || '')].forEach((ch, i) => { const sp = el('span', '', ch); sp.style.animationDelay = (i * 28) + 'ms'; say.append(sp); });
    const more = el('i', 'v2-talk-more');
    talk.append(who, say, more);
    const shut = () => { if (!talk.classList.contains('typed')) { talk.classList.add('typed'); return; } talk.classList.add('gone'); talkBtn.hidden = false; };
    // 대사창 아래에 물건이 있으면 한 번에: 대사창을 접고 그 물건을 연다 (두 번 눌러 접어야 하던 문제)
    talk.onclick = (e) => {
      talk.style.pointerEvents = 'none'; const under = document.elementFromPoint(e.clientX, e.clientY)?.closest('.v2-hotspot'); talk.style.pointerEvents = '';
      if (under && e.clientX) { talk.classList.add('typed', 'gone'); talkBtn.hidden = false; under.click(); return; }
      shut();
    };
    const talkBtn = btn('v2-talk-open', '', () => { talk.classList.remove('gone'); talk.classList.add('typed'); talkBtn.hidden = true; }, '장면 설명 다시 보기');
    talkBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z"/></svg>';
    if (sceneSeen.has(scene.id) && !firstVisit) { talk.classList.add('gone', 'typed'); } else { talkBtn.hidden = true; sceneSeen.add(scene.id); const tdone = [...(line || '')].length * 28 + 300; setTimeout(() => talk.classList.add('typed'), tdone); setTimeout(() => { if (talk.isConnected && !talk.classList.contains('gone')) { talk.classList.add('gone'); talkBtn.hidden = false; } }, tdone + 6500); }
    // 가로로 눕힌 휴대폰: 그림이 낮아 대사창이 물건을 덮으니, 대사창을 그림 옆 칸으로 뺀다
    if (matchMedia('(orientation:landscape) and (max-height:500px)').matches) { stageBox.classList.add('side-talk'); stage.append(talkBtn); stageBox.append(talk); } else stage.append(talk, talkBtn);
    if (ep.mood) stage.dataset.mood = ep.mood;
    sec.append(stageBox);
    // 가까이 봤던 자리에서 물러나기
    if (zoomBack && zoomBack.scene === scene.id) { const zb = zoomBack; zoomBack = null; requestAnimationFrame(() => { if (zb.sl != null) scroller.scrollLeft = zb.sl; zoomTo(stage, pan, zb.x, zb.y, false); requestAnimationFrame(() => requestAnimationFrame(() => { pan.style.transition = ''; pan.style.transform = ''; stage.classList.remove('zoomed'); })); }); }
    // 처음 보이는 위치: 이 장면에서 밀어 둔 자리가 있으면 그대로, 없으면 scene.focusX(그림 가로 0~100%, 숫자 또는 (S) => 숫자)를 가운데로, 그것도 없으면 한가운데
    else requestAnimationFrame(() => {
      const max = scroller.scrollWidth - scroller.clientWidth; if (max <= 4) return;
      const fx = typeof scene.focusX === 'function' ? scene.focusX(S) : scene.focusX;
      // 밀어 둔 뒤로 이 장면에 새로 보이게 된 물건이 있으면 그 물건 쪽을 먼저 보여 준다
      const fresh = visSig.filter((id) => S.panSig?.[scene.id] && !S.panSig[scene.id].includes(id)).map((id) => scene.hotspots.find((h) => h.id === id || (h.device || h.doc || h.to) === id)).filter(Boolean);
      const x = fresh.length ? pan.offsetWidth * fresh[0].x / 100 - scroller.clientWidth / 2 : (S.pan?.[scene.id] ?? (Number.isFinite(fx) ? pan.offsetWidth * fx / 100 - scroller.clientWidth / 2 : max / 2));
      scroller.scrollLeft = Math.max(0, Math.min(max, x));
    });
    scroller.addEventListener('scroll', () => { S.pan = S.pan || {}; S.pan[scene.id] = Math.round(scroller.scrollLeft); S.panSig = S.panSig || {}; S.panSig[scene.id] = visSig; }, { passive: true });
    // 마지막 장치를 풀었는데 아직 엔딩에 안 갔으면, 어떤 경로로 돌아왔든 엔딩 버튼을 계속 보여 준다
    const endDev = Object.values(ep.devices).find((dv, i) => dv.reveal?.ending && S.solved.includes(Object.keys(ep.devices)[i]));
    if (endDev && !S.ended) { const eb = btn('v2-primary v2-endgo', (endDev.reveal.endingLabel || '이야기의 끝으로') + ' →', () => { S.screen = 'ending'; S.ended = true; save(); render(); window.scrollTo({ top: 0 }); }); sec.append(eb); if (!S.endShown) { S.endShown = true; save(); setTimeout(() => { const r = eb.getBoundingClientRect(); if (r.bottom > innerHeight) eb.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, 400); } }
    // 아래: 의견 · 처음 화면 (게임 화면을 가리지 않게 작게)
    const bar = el('div', 'v2-foot');
    bar.append(btn('v2-foot-btn', '의견 남기기', () => openFeedback()), btn('v2-foot-btn', '처음 화면', () => { S.screen = 'intro'; save(); render(); }));
    sec.append(bar);
    return sec;
  }
  // 무대 안의 한 점(x%, y%)으로 다가간다 — 그 점이 화면 가운데 오도록 키운다
  function zoomTo(stage, pan, x, y, animate = true) {
    const sc = pan.parentElement; const vw = sc.clientWidth, vh = sc.clientHeight, sl = sc.scrollLeft;
    const pw = pan.offsetWidth, ph = pan.offsetHeight; const s = 1.85;
    const px = pw * x / 100, py = ph * y / 100;
    let tx = sl + vw / 2 - s * px, ty = vh / 2 - s * py;
    tx = Math.min(sl, Math.max(sl + vw - s * pw, tx)); ty = Math.min(0, Math.max(vh - s * ph, ty)); // 그림 밖이 보이지 않게
    pan.style.transition = animate ? '' : 'none';
    pan.style.transformOrigin = '0 0'; pan.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    stage.classList.add('zoomed');
  }

  function act(h, node) {
    // 그림 속 물건을 누르면 그쪽으로 다가간 뒤 창이 열린다
    const stage = node?.closest?.('.v2-stage'), pan = stage?.querySelector('.v2-pan');
    if (stage && pan && h.kind !== 'travel' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      zoomBack = { scene: S.scene, x: h.x, y: h.y, sl: pan.parentElement.scrollLeft }; zoomTo(stage, pan, h.x, h.y); pushGuard();
      setTimeout(() => { if (stage.classList.contains('zoomed')) act(h); }, 320); return; // 그사이 뒤로가기로 물러났으면 창을 열지 않는다
    }
    if (h.kind === 'doc') openDoc(h.doc);
    else if (h.kind === 'device') openDevice(h.device);
    else if (h.kind === 'travel') { S.scene = h.to; save(); play('door'); render(); window.scrollTo({ top: 0 }); }
  }

  // ---------- 자료 ----------
  function openDoc(did, { from } = {}) {
    const d = ep.docs[did]; if (!d) return;
    if (!S.read.includes(did)) { S.read.push(did); save(); }
    play('paper');
    const node = el('article', 'v2-paper v2-doc');
    node.append(el('p', 'v2-eyebrow', d.kind || '자료'));
    node.append(el('h2', 'v2-doc-title', d.title));
    node.append(bust(html('div', 'v2-doc-body', typeof d.html === 'function' ? d.html(S) : d.html)));
    if (from) node.append(btn('v2-secondary', '← ' + from.label, from.fn));
    openDialog(node, { label: d.title, onClose: from?.onClose || (() => render()) });
  }
  function openIndex() {
    const node = el('article', 'v2-paper v2-index');
    node.append(el('p', 'v2-eyebrow', '소지품'));
    node.append(el('h2', 'v2-doc-title', '자료 목록'));
    const ul = el('div', 'v2-index-list');
    const unread = [];
    openDocs().forEach((did) => {
      const d = ep.docs[did], read = S.read.includes(did);
      const where = ep.scenes.find((s) => s.hotspots.some((h) => h.doc === did));
      // 소지품에는 직접 본 것(읽은 자료·손에 넣은 자료)만 — 아직 안 가 본 곳의 자료 이름이 답을 흘리지 않게
      const avail = read || (S.found || []).includes(did) || (d.locked && (S.screen === 'ending' || S.ended));
      if (!avail) return;
      if (!read) unread.push(did);
      const b = btn('v2-index-item' + (read ? ' read' : ''), '', () => openDoc(did, { from: { label: '자료 목록', fn: openIndex } }));
      b.append(el('b', '', d.title), el('small', '', (read ? '읽음' : '아직') + (where ? ' · ' + where.name : '')));
      ul.append(b);
    });
    node.append(ul);
    if (unread.length) node.append(el('p', 'v2-note', `손에 넣고 아직 읽지 않은 자료 ${unread.length}장`));
    const missing = openDocs().filter((x) => !S.read.includes(x) && !(S.found || []).includes(x)).length;
    if (missing && S.screen === 'play') node.append(el('p', 'v2-note subtle', `아직 찾지 못한 자료 ${missing}장`));
    if (!ul.children.length) ul.append(el('p', 'v2-bench-empty', '아직 손에 넣은 자료가 없다'));
    openDialog(node, { label: '자료 목록', onClose: () => render(), drawer: S.screen === 'play' });
  }

  // ---------- 장치 ----------
  function openDevice(did, opts = {}) {
    const dev = deviceOf(did); if (!dev) return;
    // resetOnOpen: 창을 다시 열면 손잡이·누름 순서가 처음으로 (방향 자물쇠처럼 '누른 기록'이 눈에 안 보이는 장치)
    if (dev.resetOnOpen && !S.solved.includes(did)) S.drafts[did] = dev.initial();
    S.drafts[did] ??= dev.initial();
    const d = S.drafts[did];
    const solved = S.solved.includes(did);
    S.benchTab ??= {};
    const bench = el('article', 'v2-bench');
    const narrow = () => matchMedia('(max-width:899px)').matches && !matchMedia('(orientation:landscape) and (max-height:500px) and (min-width:700px)').matches;
    // 휴대폰: 방금 생긴 글(오답 문구·힌트)이 아래 자료판에 가리지 않게 창을 올린다
    const keepAbove = (top, bottom) => requestAnimationFrame(() => {
      const box = bench.closest('.v2-dialog-box'); if (!box || !narrow() || !top) return;
      const sh = bench.querySelector('.v2-bench-docs'); const bt = box.getBoundingClientRect();
      const limit = (sh ? sh.getBoundingClientRect().top : bt.bottom) - 12;
      const b = (bottom || top).getBoundingClientRect().bottom, t = top.getBoundingClientRect().top;
      if (b > limit) box.scrollBy({ top: Math.min(b - limit, t - bt.top - 56), behavior: 'smooth' });
      else if (t < bt.top + 56) box.scrollBy({ top: t - bt.top - 56, behavior: 'smooth' });
    });
    // 왼쪽: 장치
    const node = el('section', 'v2-device');
    const head = el('div', 'v2-device-head');
    head.append(el('p', 'v2-eyebrow', solved ? '해결한 장치' : ''));
    head.append(el('h2', 'v2-doc-title', dev.title));
    head.append(el('p', 'v2-device-intro', dev.intro));
    let hintBlock = null;
    // 장치 안 힌트: 창을 닫지 않고 그 자리에서 한 단계씩 받는다 (힌트 창과 같은 기록 S.hints)
    if (!solved) {
      const hs = (typeof dev.hints === 'function' ? dev.hints(S) : dev.hints) || [];
      if (hs.length) {
        const hb = el('div', 'v2-dhint');
        const drawHint = () => {
          hb.replaceChildren();
          const tier = S.hints[did] || 0;
          for (let i = 0; i < tier; i++) hb.append(html('p', 'v2-dhint-line', `<b>${['첫 힌트', '풀이 방향', '정답'][i]}</b> ${hs[i]}`));
          const maxTier = Math.min(3, hs.length);
          if (tier < maxTier) {
            const b = btn('v2-dhint-btn' + (tier === 2 ? ' last' : ''), ['힌트 받기', '풀이 방향 받기', '정답 보기'][tier], () => { if (tier === 2 && !b.dataset.sure) { b.dataset.sure = '1'; b.textContent = '정말 정답을 볼까요? 한 번 더 누르기'; return; } S.hints[did] = tier + 1; save(); drawHint(); keepAbove(hb.lastElementChild?.previousElementSibling || hb.lastElementChild, hb.lastElementChild); });
            hb.append(b);
          } else if (hs.length < 3) hb.append(el('p', 'v2-dhint-note', '이 편은 정답 힌트가 없습니다 여기까지가 전부입니다'));
        };
        drawHint();
        hintBlock = hb;
      }
    }
    node.append(head);
    if (solved && dev.reveal?.ending && !S.ended) node.append(btn('v2-primary', (dev.reveal.endingLabel || '이야기의 끝으로') + ' →', () => { S.screen = 'ending'; S.ended = true; save(); closeDialog(); }));
    const body = el('div', 'v2-device-body');
    const status = el('p', 'v2-status'); status.setAttribute('role', 'status');
    const ctx = { d, S, el, save: () => { save(); status.textContent = ''; status.classList.remove('wrong'); draw(); }, status: (m) => { status.textContent = m; if (m) { try { keepAbove(status, actions); } catch { keepAbove(status); } } }, keepAbove: (a, b) => keepAbove(a, b) };
    let draw = () => { body.replaceChildren(bust(dev.render(ctx))); };
    draw();
    node.append(body);
    const actions = el('div', 'v2-actions');
    if (solved) {
      actions.append(el('p', 'v2-solved', '이미 해결했습니다'));
    } else {
      const go = btn('v2-primary', dev.commitLabel || '확인', () => {
        const r = dev.check(d, S); save();
        if (r.ok) { solve(did); return; }
        status.textContent = r.msg; status.classList.add('wrong'); play('lock'); buzz([10, 60, 10]); draw();
        // 휴대폰에서 자료판이 펼쳐져 있어도 오답 문구와 확인 버튼이 판 위로 보이게
        keepAbove(status, actions);
      });
      actions.append(go);
      ctx.commit = () => go.click();
      const gate = () => { if (dev.canCommit) { const was = go.hidden; go.hidden = !dev.canCommit(d, S); actions.hidden = go.hidden; if (was && !go.hidden && go.isConnected) keepAbove(actions); } };
      gate(); const _draw = draw; draw = () => { _draw(); gate(); };
    }
    node.append(status, actions);
    if (hintBlock) { const wrap = el('div', 'v2-dhint-wrap'); wrap.append(el('p', 'v2-dhint-label', '막혔다면'), hintBlock); node.append(wrap); }
    bench.append(node);
    // 오른쪽: 관련 자료를 옆에 펼쳐 둡니다. 창을 오갈 필요가 없습니다.
    const refs = (dev.docs || []).filter((r) => ep.docs[r]);
    if (refs.length) {
      const side = el('aside', 'v2-bench-docs'); side.setAttribute('aria-label', '관련 자료');
      const tabs = el('div', 'v2-bench-tabs');
      const panel = el('div', 'v2-bench-panel');
      let cur = S.benchTab[did] && refs.includes(S.benchTab[did]) ? S.benchTab[did] : null;
      const show = (r) => {
        cur = r; S.benchTab[did] = r;
        if (r && !S.read.includes(r)) { S.read.push(r); play('paper'); }
        save();
        [...tabs.children].forEach((t) => { if (t.disabled) return; t.classList.toggle('on', t.dataset.doc === r); t.classList.toggle('read', S.read.includes(t.dataset.doc)); });
        side.classList.toggle('open', !!r);
        if (r) { const on = [...tabs.children].find((t) => t.dataset.doc === r); on && requestAnimationFrame(() => { tabs.scrollLeft = Math.max(0, on.offsetLeft - tabs.offsetLeft - 8); }); }
        requestAnimationFrame(() => bench.style.setProperty('--sheet-h', (narrow() ? side.getBoundingClientRect().height + 12 : 0) + 'px'));
        if (!r) { const any = refs.some((x) => S.read.includes(x) || (S.found || []).includes(x)); side.classList.toggle('none', !any); panel.replaceChildren(el('p', 'v2-bench-empty', any ? (narrow() ? '자료 이름을 누르면 여기 펼쳐집니다' : '위에서 자료를 고르면 여기 펼쳐집니다') : '장면에서 자료를 먼저 찾아 읽으면, 여기에 펼쳐 둘 수 있습니다')); return; }
        const dd = ep.docs[r];
        const paper = el('div', 'v2-paper v2-bench-paper');
        paper.append(el('p', 'v2-eyebrow', dd.kind || '자료'), el('h3', 'v2-bench-title', dd.title), bust(html('div', 'v2-doc-body', typeof dd.html === 'function' ? dd.html(S) : dd.html)));
        panel.replaceChildren(paper); panel.scrollTop = 0;
      };
      // 장면에서 직접 찾아 읽은 자료만 옆에 펼칠 수 있습니다. 아직 못 찾은 것은 자물쇠로 표시합니다.
      refs.forEach((r) => {
        const found = S.read.includes(r) || (S.found || []).includes(r);
        // 지금 갈 수 있는 곳에서 찾을 수 없는 자료는 자물쇠 칸으로도 보이지 않게 (놓친 줄 알고 헤매지 않도록)
        if (!found && !unlockedScenes().some((sc) => (sc.hotspots || []).some((h) => h.doc === r && (!h.visible || h.visible(S))))) return;
        const t = btn('v2-bench-tab' + (found ? '' : ' locked'), found ? ep.docs[r].title : '아직 찾지 못한 자료', () => { if (!found) return; show(cur === r && narrow() ? null : r); });
        t.dataset.doc = r; if (!found) { t.disabled = true; const where = ep.scenes.find((sc) => sc.hotspots.some((h) => h.doc === r)); t.title = where ? where.name + '에서 찾을 수 있습니다' : ''; }
        tabs.append(t);
      });
      // 휴대폰: 자료판이 창 아래에 붙어 있다가(접힘) 자료 이름을 누르면 화면 아래 절반으로 올라온다 위 절반에서 장치를 보며 조작
      const fold = btn('v2-bench-fold', '접기 ▾', () => show(null), '자료판 접기');
      const headRow = el('div', 'v2-bench-head');
      // 자료가 길면 판을 크게 (장치는 잠깐 가려도 자료를 한눈에)
      const grow = btn('v2-bench-grow', '크게', () => { const big = side.classList.toggle('big'); grow.textContent = big ? '작게' : '크게'; grow.setAttribute('aria-label', big ? '자료판 작게' : '자료판 크게'); requestAnimationFrame(() => bench.style.setProperty('--sheet-h', side.getBoundingClientRect().height + 12 + 'px')); }, '자료판 크게');
      headRow.append(html('p', 'v2-bench-label', '<span class="wide-only">옆에 펼쳐 둔 자료</span><span class="narrow-only">자료</span>'), tabs, grow, fold);
      side.append(headRow, panel);
      bench.classList.add('has-docs');
      bench.append(side);
      // 휴대폰은 늘 접힌 채로 연다 (장치부터 보이게) 넓은 화면은 마지막에 본 자료를 펼쳐 둔다
      show(narrow() ? null : (cur ?? refs.find((x) => S.read.includes(x)) ?? null));
    }
    openDialog(bench, { label: dev.title, wide: refs.length > 0, onClose: () => render() });
  }
  function solve(did) {
    const dev = deviceOf(did);
    if (!S.solved.includes(did)) S.solved.push(did);
    save();
    play(dev.reveal?.ending ? 'door' : 'keys'); buzz(18);
    const node = el('article', 'v2-paper v2-reveal');
    node.append(el('p', 'v2-eyebrow', '풀렸다'));
    node.append(el('h2', 'v2-doc-title', dev.reveal.title));
    node.append(el('p', 'v2-line', dev.reveal.text));
    (dev.reveal.scene || []).forEach((line) => node.append(el('p', 'v2-line', line)));
    const target = dev.reveal.unlock && sceneById(dev.reveal.unlock);
    // 보상 창을 어떤 길로 닫든(닫기 · 바깥 누르기 · 자료 보고 닫기) 다음 장소로 가는 길이 같게
    const acts = el('div', 'v2-reveal-actions');
    const finish = () => { if (target && S.scene !== target.id) { S.scene = target.id; save(); window.scrollTo({ top: 0 }); } render(); };
    if (dev.reveal.unlockDoc && ep.docs[dev.reveal.unlockDoc]) { S.found = S.found || []; if (!S.found.includes(dev.reveal.unlockDoc)) S.found.push(dev.reveal.unlockDoc); save(); acts.append(btn('v2-secondary', ep.docs[dev.reveal.unlockDoc].title + ' 보기', () => openDoc(dev.reveal.unlockDoc, { from: { label: '돌아가기', fn: () => openDialog(node, { label: dev.reveal.title, onClose: finish }), onClose: finish } }))); }
    if (dev.reveal.ending) acts.append(btn('v2-primary', (dev.reveal.endingLabel || '이야기의 끝으로') + ' →', () => { S.screen = 'ending'; S.ended = true; save(); closeDialog(); }));
    else if (target) acts.append(btn('v2-primary', josa(target.name, '으로', '로') + ' →', () => { S.scene = target.id; save(); closeDialog(); }));
    else acts.append(btn('v2-primary', '계속', () => closeDialog()));
    node.append(acts);
    openDialog(node, { label: dev.reveal.title, onClose: finish });
  }

  // ---------- 힌트 ----------
  function openHints(pick) {
    const node = el('article', 'v2-paper v2-hints');
    node.append(el('p', 'v2-eyebrow', ep.hintTitle || '역무실 무전기'));
    node.append(el('h2', 'v2-doc-title', '힌트'));
    const ids = Object.keys(ep.devices);
    const open = ids.filter((d) => S.solved.includes(d) || deviceShown(d));
    const cur = pick || activeDevices()[0] || open[open.length - 1];
    const tabs = el('div', 'v2-hint-tabs');
    open.forEach((d) => { const dev = ep.devices[d]; tabs.append(btn('v2-chip' + (d === cur ? ' on' : '') + (S.solved.includes(d) ? ' done' : ''), dev.title, () => openHints(d))); });
    node.append(tabs);
    if (cur) {
      const dev = ep.devices[cur];
      const tier = S.hints[cur] || 0;
      const box = el('div', 'v2-hint-box');
      if (S.solved.includes(cur)) {
        box.append(el('p', 'v2-note', '이미 푼 장치 풀이를 다시 볼 수 있다'));
        (typeof dev.hints === 'function' ? dev.hints(S) : dev.hints).forEach((h, i) => box.append(html('p', 'v2-hint-line', `<b>${['첫 힌트', '풀이 방향', '정답'][i]}</b> ${h}`)));
      } else {
        const hs = typeof dev.hints === 'function' ? dev.hints(S) : dev.hints; for (let i = 0; i < tier; i++) box.append(html('p', 'v2-hint-line', `<b>${['첫 힌트', '풀이 방향', '정답'][i]}</b> ${hs[i]}`));
        const maxTier = Math.min(3, hs.length);
        if (tier < maxTier) { const hb = btn('v2-secondary', ['첫 힌트 받기', '풀이 방향 받기', '정답 보기'][tier], () => { if (tier === 2 && !hb.dataset.sure) { hb.dataset.sure = '1'; hb.textContent = '정말 정답을 볼까요? 한 번 더 누르기'; return; } S.hints[cur] = tier + 1; save(); openHints(cur); }); box.append(hb); }
        else if (hs.length < 3) box.append(el('p', 'v2-note', '이 편은 정답 힌트가 없습니다 여기까지가 전부입니다'));
        else box.append(el('p', 'v2-note', '힌트를 전부 받았습니다'));
      }
      node.append(box);
    }
    openDialog(node, { label: '힌트', onClose: () => render() });
  }

  // ---------- 의견 남기기 (Google Form으로 전송) ----------
  function openFeedback() {
    const cfg = window.MihaejeFeedback || {};
    const node = el('article', 'v2-paper v2-feedback');
    node.append(el('p', 'v2-eyebrow', ep.title));
    node.append(el('h2', 'v2-doc-title', '의견 남기기'));
    node.append(el('p', 'v2-feedback-lead', '막힌 곳, 이상한 문장, 재미없던 장치, 뭐든 좋습니다 만든 사람이 직접 읽습니다'));
    const ta = el('textarea', 'v2-textarea'); ta.rows = 6; ta.maxLength = 2000; ta.placeholder = '예: 보관함 숫자를 어디서 세는지 한참 헤맸어요'; ta.setAttribute('aria-label', '의견');
    const contact = el('input', 'v2-input'); contact.type = 'text'; contact.maxLength = 120; contact.placeholder = '답장 받을 이메일 (선택)'; contact.setAttribute('aria-label', '이메일(선택)');
    const status = el('p', 'v2-status'); status.setAttribute('role', 'status');
    const send = btn('v2-primary', '보내기', async () => {
      const text = ta.value.trim();
      if (!text) { status.textContent = '내용을 적어 주세요'; return; }
      if (!cfg.form || !cfg.fields?.text) { status.textContent = '아직 의견함이 연결되기 전입니다 조금만 기다려 주세요'; return; }
      send.disabled = true; status.textContent = '보내는 중…';
      const where = `${ep.id} / ${S.screen === 'ending' ? '엔딩' : (sceneById(S.scene)?.name || '')} / 푼 장치 ${S.solved.length}/${Object.keys(ep.devices).length}`;
      const body = new URLSearchParams();
      if (cfg.fields.game) body.set(cfg.fields.game, where);
      body.set(cfg.fields.text, text);
      if (cfg.fields.contact && contact.value.trim()) body.set(cfg.fields.contact, contact.value.trim());
      try {
        await fetch(cfg.form, { method: 'POST', mode: 'no-cors', body });
        status.textContent = '보냈습니다 고맙습니다'; ta.value = ''; contact.value = '';
      } catch { status.textContent = '보내지 못했습니다 잠시 뒤 다시 눌러 주세요'; send.disabled = false; }
    });
    node.append(ta, contact, status, send);
    openDialog(node, { label: '의견 남기기' });
  }

  // ---------- 4. 엔딩 ----------
  function ending() {
    const e = ep.ending;
    const sec = el('section', 'v2-ending');
    const fig = el('figure', 'v2-ending-figure');
    const img = pic(el('img'), e.image); img.alt = e.imageAlt || ''; img.decoding = 'async';
    fig.append(img);
    sec.append(fig);
    const paper = el('article', 'v2-paper v2-ending-paper');
    paper.append(el('p', 'v2-eyebrow', e.eyebrow));
    paper.append(el('h2', 'v2-ending-title', e.title));
    (typeof e.paragraphs === 'function' ? e.paragraphs(S) : e.paragraphs).forEach((p) => paper.append(el('p', 'v2-line', p)));
    if (e.choice && !S.choice) {
      paper.append(el('p', 'v2-eyebrow', e.choice.prompt));
      const row = el('div', 'pick-row');
      const before = paper.querySelectorAll('.v2-line').length;
      e.choice.options.forEach((o) => row.append(btn('chip', o.label, () => { S.choice = o.id; save(); render(); requestAnimationFrame(() => { const t = document.querySelectorAll('.v2-ending-paper .v2-line')[before]; if (t) t.scrollIntoView({ block: 'center' }); }); })));
      paper.append(row);
      sec.append(paper);
      return sec;
    }
    const after = typeof e.afterword === 'function' ? e.afterword(S) : e.afterword;
    if (after) paper.append(el('p', 'v2-afterword', after));
    if (e.unlockDoc && ep.docs[e.unlockDoc]) paper.append(btn('v2-secondary', ep.docs[e.unlockDoc].title + ' 읽기', () => openDoc(e.unlockDoc)));
    const row = el('div', 'v2-row');
    if (e.next) { const a = el('a', 'v2-primary', e.next.label || `다음 이야기 · ${e.next.title} →`); a.href = e.next.href; row.append(a); }
    row.append(btn('v2-secondary', '자료 다시 보기', () => openIndex()));
    row.append(btn('v2-secondary', '의견 남기기', () => openFeedback()));
    row.append(btn('v2-secondary subtle', '처음 화면', () => { S.screen = 'intro'; save(); render(); }));
    if (e.next?.line) paper.append(el('p', 'v2-fine v2-next-line', e.next.line));
    paper.append(row);
    sec.append(paper);
    return sec;
  }

  render();
  window.MihaejeV2 = { get state() { return S; }, get music() { return music; }, episode: ep, render, reset() { S = fresh(); save(); render(); } };
}
main();
