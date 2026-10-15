// 미해제 v2 엔진. 한 편의 내용은 v2/episodes/<id>.js 한 파일에 있고, 이 파일은 그 구조를 화면으로 만듭니다.
const qs = new URLSearchParams(location.search);
const id = (qs.get('case') || '').replace(/[^a-z-]/g, '');
const root = document.getElementById('app');

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const btn = (cls, text, fn, aria) => { const b = el('button', cls, text); b.type = 'button'; if (aria) b.setAttribute('aria-label', aria); b.onclick = fn; return b; };
const pic = (img, src) => { img.src = src; const base = src.replace(/\.webp$/, ''); if (/assets\/v2\//.test(src)) { img.srcset = `${base}-960.webp 960w, ${src} 1024w`; img.sizes = '(max-width: 640px) 100vw, 1180px'; } return img; };
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1); if (c < 0xac00 || c > 0xd7a3) return w + b; const t = (c - 0xac00) % 28; return w + (t === 0 || t === 8 ? b : a); }; // 받침 없음·ㄹ받침 → '로'
const html = (tag, cls, markup) => { const n = el(tag, cls); n.innerHTML = markup; return n; };

const sounds = {
  paper: 'assets/sounds/paper-turn-v23.wav', lock: 'assets/sounds/lock-v24.wav', keys: 'assets/sounds/keys-v24.wav',
  door: 'assets/sounds/door-open-v23.wav', drawer: 'assets/sounds/drawer-open-v23.wav', on: 'assets/sounds/switch-on-v24.wav',
};
let audioOn = true; // 기본 켜짐. 끄면 기억합니다.
try { audioOn = localStorage.getItem('mihaeje-v2-sound') !== '0'; } catch {}
// 브라우저는 사용자가 한 번 누르기 전에는 소리를 못 내므로, 첫 터치/클릭 때 배경음을 시작합니다.
let armed = false;
function armMusic(ep) {
  if (armed) return; armed = true;
  const go = () => { syncMusic(ep); };
  document.addEventListener('pointerdown', go, { capture: true });
  document.addEventListener('keydown', go, { capture: true });
}
function play(name) { if (!audioOn || !sounds[name]) return; try { const a = new Audio(sounds[name]); a.volume = 0.5; a.play().catch(() => {}); } catch {} }
let music = null;
function syncMusic(ep) {
  if (!ep.music) return;
  if (!audioOn) { if (music) { music.pause(); } return; }
  if (!music) { music = new Audio(ep.music); music.loop = true; music.volume = 0.22; music.preload = 'auto'; }
  if (music.paused) music.play().catch(() => {});
}

async function main() {
  if (!id) { location.replace('index.html#cases'); return; }
  let ep;
  try { ep = (await import(`./episodes/${id}.js`)).default; } catch (e) { const p = el('p', 'v2-error', '이 주소의 이야기를 찾지 못했습니다. '); const a = el('a', '', '테마 로비로 가기'); a.href = 'index.html#cases'; p.append(a); root.append(p); console.error(e); return; }
  document.title = `${ep.title} — 미해제`;
  document.documentElement.dataset.case = ep.id;

  const KEY = ep.storageKey || 'mihaeje-v2-' + ep.id;
  const fresh = () => ({ v: 2, screen: 'intro', scene: ep.scenes[0].id, read: [], visited: [], solved: [], drafts: {}, hints: {}, seen: [] });
  let S = fresh();
  try { const raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.v === 2) S = { ...fresh(), ...raw }; } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

  const docIds = Object.keys(ep.docs);
  const openDocs = () => docIds.filter((d) => !ep.docs[d].locked || S.screen === 'ending' || S.ended);
  const unlockedScenes = () => ep.scenes.filter((s) => !s.unlockedBy || S.solved.includes(s.unlockedBy));
  const sceneById = (sid) => ep.scenes.find((s) => s.id === sid);
  const deviceOf = (did) => ep.devices[did];
  const activeDevices = () => Object.keys(ep.devices).filter((did) => !S.solved.includes(did) && unlockedScenes().some((s) => s.id === ep.devices[did].scene));

  // ---------- 공통 틀 ----------
  let dialog = null;
  function openDialog(node, { label, onClose, wide } = {}) {
    closeDialog();
    dialog = el('dialog', 'v2-dialog' + (wide ? ' wide' : ''));
    if (label) dialog.setAttribute('aria-label', label);
    const box = el('div', 'v2-dialog-box');
    const bar = el('div', 'v2-dialog-bar');
    bar.append(btn('v2-close', '닫기', () => closeDialog(), '닫기'));
    box.append(bar, node);
    dialog.append(box);
    const me = dialog;
    me.addEventListener('close', () => { me.remove(); if (dialog === me) { dialog = null; onClose?.(); } });
    me.addEventListener('click', (e) => { if (e.target === me) me.close(); });
    document.body.append(dialog);
    dialog.showModal();
    box.scrollTop = 0;
  }
  function closeDialog() { if (dialog?.open) dialog.close(); }

  function header() {
    const h = el('header', 'v2-header');
    const logo = html('a', 'v2-logo', '<img src="assets/mihaeje-logo-v2.webp" alt="미해제" width="1983" height="793" decoding="async">'); logo.href = 'index.html';
    const right = el('div', 'v2-header-right');
    const back = el('a', 'v2-back', '← 테마 로비'); back.href = 'index.html';
    const snd = btn('v2-sound' + (audioOn ? ' on' : ''), audioOn ? '배경음 켜짐' : '배경음 꺼짐', () => { audioOn = !audioOn; try { localStorage.setItem('mihaeje-v2-sound', audioOn ? '1' : '0'); } catch {} snd.textContent = audioOn ? '배경음 켜짐' : '배경음 꺼짐'; snd.classList.toggle('on', audioOn); syncMusic(ep); if (audioOn) play('on'); }, '배경음과 효과음 켜고 끄기');
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
    else root.append(playScreen());
    syncMusic(ep);
  }

  // ---------- 1. 표지 ----------
  function intro() {
    const sec = el('section', 'v2-intro');
    const cover = pic(el('img', 'v2-cover'), ep.cover); cover.alt = ep.coverAlt || ''; cover.decoding = 'async'; sec.append(cover);
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
    card.append(el('p', 'v2-fine', '가상의 이야기 · 진행은 이 브라우저에 저장됩니다'));
    sec.append(card);
    return sec;
  }

  // ---------- 2. 오프닝 ----------
  function opening() {
    const sec = el('section', 'v2-opening');
    const paper = el('article', 'v2-paper v2-opening-paper');
    paper.append(el('p', 'v2-eyebrow', ep.opening.eyebrow));
    ep.opening.paragraphs.forEach((p) => paper.append(el('p', 'v2-line', p)));
    paper.append(btn('v2-primary', ep.opening.cta + ' →', () => { S.screen = 'play'; save(); render(); }));
    sec.append(paper);
    return sec;
  }

  // ---------- 3. 플레이 ----------
  function playScreen() {
    const scene = sceneById(S.scene) || ep.scenes[0];
    const sec = el('section', 'v2-play');
    // 장면 선택
    const nav = el('nav', 'v2-scenes'); nav.setAttribute('aria-label', '장소');
    unlockedScenes().forEach((s, i) => {
      const b = btn('v2-scene-chip' + (s.id === scene.id ? ' on' : ''), `${i + 1}. ${s.name}`, () => { S.scene = s.id; save(); render(); });
      if (s.id === scene.id) b.setAttribute('aria-current', 'page');
      nav.append(b);
    });
    if (ep.traces?.length) {
      const tr = el('div', 'v2-traces'); tr.setAttribute('aria-label', '민서가 남긴 것');
      ep.traces.forEach((t) => { const got = S.solved.includes(t.device); const i = el('span', 'v2-trace' + (got ? ' got' : ''), got ? t.label : '· · ·'); i.setAttribute('aria-label', got ? t.label : '아직 찾지 못함'); tr.append(i); });
      nav.append(tr);
    }
    sec.append(nav);
    // 무대
    const stage = el('div', 'v2-stage');
    const img = pic(el('img', 'v2-stage-img'), scene.image); img.alt = scene.name; img.decoding = 'async';
    stage.append(img);
    (scene.overlays || []).forEach((o) => { const n = html('div', 'v2-stage-ov ' + (o.cls || ''), o.html); n.style.cssText = `left:${o.x}%;top:${o.y}%;width:${o.w}%;height:${o.h}%;${o.style || ''}`; n.setAttribute('aria-hidden', 'true'); stage.append(n); });
    const seenSet = new Set(S.seen);
    scene.hotspots.forEach((h) => {
      if (h.visible && !h.visible(S)) return;
      const done = h.kind === 'doc' ? S.read.includes(h.doc) : h.kind === 'device' ? S.solved.includes(h.device) : false;
      const b = btn('v2-hotspot' + (done ? ' done' : '') + (h.kind === 'device' ? ' device' : ''), '', () => act(h), h.label);
      b.style.left = h.x + '%'; b.style.top = h.y + '%';
      b.append(el('i'), el('span', 'v2-hotspot-label', h.label));
      stage.append(b);
    });
    sec.append(stage);
    // 처음 도착 문장
    const firstVisit = !S.visited.includes(scene.id);
    if (firstVisit) { S.visited.push(scene.id); save(); }
    const arrive = el('p', 'v2-arrive', scene.arrive);
    sec.append(arrive);
    // 핫스팟 목록(작은 화면·접근성)
    const list = el('div', 'v2-spotlist');
    scene.hotspots.forEach((h) => {
      if (h.visible && !h.visible(S)) return;
      const done = h.kind === 'doc' ? S.read.includes(h.doc) : h.kind === 'device' ? S.solved.includes(h.device) : false;
      list.append(btn('v2-spot' + (done ? ' done' : '') + (h.kind === 'device' ? ' device' : ''), (h.kind === 'device' ? '⚙ ' : '') + h.label + (done ? ' ✓' : ''), () => act(h)));
    });
    sec.append(list);
    // 하단 바
    const bar = el('div', 'v2-bar');
    const n = S.read.filter((d) => openDocs().includes(d)).length, m = openDocs().length;
    bar.append(btn('v2-bar-btn', `자료 ${n} / ${m}`, () => openIndex()));
    bar.append(btn('v2-bar-btn', '힌트', () => openHints()));
    bar.append(btn('v2-bar-btn subtle', '의견', () => openFeedback()));
    bar.append(btn('v2-bar-btn subtle', '처음 화면', () => { S.screen = 'intro'; save(); render(); }));
    sec.append(bar);
    return sec;
  }

  function act(h) {
    if (h.kind === 'doc') openDoc(h.doc);
    else if (h.kind === 'device') openDevice(h.device);
  }

  // ---------- 자료 ----------
  function openDoc(did, { from } = {}) {
    const d = ep.docs[did]; if (!d) return;
    if (!S.read.includes(did)) { S.read.push(did); save(); }
    play('paper');
    const node = el('article', 'v2-paper v2-doc');
    node.append(el('p', 'v2-eyebrow', d.kind || '자료'));
    node.append(el('h2', 'v2-doc-title', d.title));
    node.append(html('div', 'v2-doc-body', d.html));
    if (from) node.append(btn('v2-secondary', '← ' + from.label, from.fn));
    openDialog(node, { label: d.title, onClose: () => render() });
  }
  function openIndex() {
    const node = el('article', 'v2-paper v2-index');
    node.append(el('p', 'v2-eyebrow', '읽은 자료'));
    node.append(el('h2', 'v2-doc-title', '자료 목록'));
    const ul = el('div', 'v2-index-list');
    const unread = [];
    openDocs().forEach((did) => {
      const d = ep.docs[did], read = S.read.includes(did);
      const where = ep.scenes.find((s) => s.hotspots.some((h) => h.doc === did));
      const avail = read || (where && unlockedScenes().includes(where)) || d.locked;
      if (!avail) return;
      if (!read) unread.push(did);
      const b = btn('v2-index-item' + (read ? ' read' : ''), '', () => openDoc(did, { label: '자료 목록', fn: openIndex }));
      b.append(el('b', '', d.title), el('small', '', (read ? '읽음' : '아직') + (where ? ' · ' + where.name : '')));
      ul.append(b);
    });
    node.append(ul);
    if (unread.length) node.append(el('p', 'v2-note', `아직 읽지 않은 자료 ${unread.length}장`));
    openDialog(node, { label: '자료 목록', onClose: () => render() });
  }

  // ---------- 장치 ----------
  function openDevice(did, opts = {}) {
    const dev = deviceOf(did); if (!dev) return;
    S.drafts[did] ??= dev.initial();
    const d = S.drafts[did];
    const solved = S.solved.includes(did);
    S.benchTab ??= {};
    const bench = el('article', 'v2-bench');
    // 왼쪽: 장치
    const node = el('section', 'v2-device');
    const head = el('div', 'v2-device-head');
    head.append(el('p', 'v2-eyebrow', (solved ? '해결한 장치 · ' : '') + (dev.hintCode || '')));
    head.append(el('h2', 'v2-doc-title', dev.title));
    head.append(el('p', 'v2-device-intro', dev.intro));
    // 쉬운 편(★3 이하)은 첫 안내를 장치 안에 바로 보여줍니다. 어려운 편은 무전기로만.
    if (!solved && ep.difficulty <= 3 && dev.hints?.[0]) {
      const g = el('details', 'v2-guide'); const sm = el('summary', '', '어떻게 하는 거지?'); g.append(sm, el('p', '', dev.hints[0])); head.append(g);
    }
    node.append(head);
    const body = el('div', 'v2-device-body');
    const status = el('p', 'v2-status'); status.setAttribute('role', 'status');
    const ctx = { d, el, save: () => { save(); status.textContent = ''; status.classList.remove('wrong'); draw(); }, status: (m) => { status.textContent = m; } };
    let draw = () => { body.replaceChildren(dev.render(ctx)); };
    draw();
    node.append(body);
    const actions = el('div', 'v2-actions');
    if (solved) {
      actions.append(el('p', 'v2-solved', '이미 해결했습니다.'));
    } else {
      const go = btn('v2-primary', dev.commitLabel || '확인', () => {
        const r = dev.check(d); save();
        if (r.ok) { solve(did); return; }
        status.textContent = r.msg; status.classList.add('wrong'); play('lock'); draw();
      });
      actions.append(go);
      const gate = () => { if (dev.canCommit) go.hidden = !dev.canCommit(d); };
      gate(); const _draw = draw; draw = () => { _draw(); gate(); };
    }
    node.append(status, actions);
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
        if (!r) { const any = refs.some((x) => S.read.includes(x)); panel.replaceChildren(el('p', 'v2-bench-empty', any ? '위에서 자료를 고르면 여기 펼쳐집니다.' : '장면에서 자료를 먼저 찾아 읽으면, 여기에 펼쳐 둘 수 있습니다.')); return; }
        const dd = ep.docs[r];
        const paper = el('div', 'v2-paper v2-bench-paper');
        paper.append(el('p', 'v2-eyebrow', dd.kind || '자료'), el('h3', 'v2-bench-title', dd.title), html('div', 'v2-doc-body', dd.html));
        panel.replaceChildren(paper); panel.scrollTop = 0;
      };
      // 장면에서 직접 찾아 읽은 자료만 옆에 펼칠 수 있습니다. 아직 못 찾은 것은 자물쇠로 표시합니다.
      refs.forEach((r) => {
        const found = S.read.includes(r);
        const t = btn('v2-bench-tab' + (found ? '' : ' locked'), found ? ep.docs[r].title : '아직 찾지 못한 자료', () => { if (!found) return; show(cur === r && window.innerWidth < 900 ? null : r); });
        t.dataset.doc = r; if (!found) { t.disabled = true; const where = ep.scenes.find((sc) => sc.hotspots.some((h) => h.doc === r)); t.title = where ? where.name + '에서 찾을 수 있습니다' : ''; }
        tabs.append(t);
      });
      side.append(el('p', 'v2-bench-label', '옆에 펼쳐 둔 자료'), tabs, panel);
      bench.append(side);
      show(cur ?? (window.innerWidth >= 900 ? refs.find((x) => S.read.includes(x)) ?? null : null));
    }
    openDialog(bench, { label: dev.title, wide: refs.length > 0, onClose: () => render() });
  }
  function solve(did) {
    const dev = deviceOf(did);
    if (!S.solved.includes(did)) S.solved.push(did);
    save();
    play(dev.reveal?.ending ? 'door' : 'keys');
    const node = el('article', 'v2-paper v2-reveal');
    node.append(el('p', 'v2-eyebrow', '풀렸다'));
    node.append(el('h2', 'v2-doc-title', dev.reveal.title));
    node.append(el('p', 'v2-line', dev.reveal.text));
    (dev.reveal.scene || []).forEach((line) => node.append(el('p', 'v2-line', line)));
    const target = dev.reveal.unlock && sceneById(dev.reveal.unlock);
    if (dev.reveal.ending) node.append(btn('v2-primary', '대문 안으로 →', () => { S.screen = 'ending'; S.ended = true; S.solved = true; save(); closeDialog(); }));
    else if (target) node.append(btn('v2-primary', josa(target.name, '으로', '로') + ' →', () => { S.scene = target.id; save(); closeDialog(); }));
    else node.append(btn('v2-primary', '계속', () => closeDialog()));
    openDialog(node, { label: dev.reveal.title, onClose: () => render() });
  }

  // ---------- 힌트 ----------
  function openHints(pick) {
    const node = el('article', 'v2-paper v2-hints');
    node.append(el('p', 'v2-eyebrow', '역무실 무전기'));
    node.append(el('h2', 'v2-doc-title', '힌트'));
    const ids = Object.keys(ep.devices);
    const open = ids.filter((d) => unlockedScenes().some((s) => s.id === ep.devices[d].scene));
    const cur = pick || activeDevices()[0] || open[open.length - 1];
    const tabs = el('div', 'v2-hint-tabs');
    open.forEach((d) => { const dev = ep.devices[d]; tabs.append(btn('v2-chip' + (d === cur ? ' on' : '') + (S.solved.includes(d) ? ' done' : ''), `${dev.hintCode} ${dev.title}`, () => openHints(d))); });
    node.append(tabs);
    if (cur) {
      const dev = ep.devices[cur];
      const tier = S.hints[cur] || 0;
      const box = el('div', 'v2-hint-box');
      if (S.solved.includes(cur)) {
        box.append(el('p', 'v2-note', '이미 해결한 장치입니다. 풀이를 다시 볼 수 있습니다.'));
        dev.hints.forEach((h, i) => box.append(html('p', 'v2-hint-line', `<b>${['첫 힌트', '풀이 방향', '정답'][i]}</b> ${h}`)));
      } else {
        for (let i = 0; i < tier; i++) box.append(html('p', 'v2-hint-line', `<b>${['첫 힌트', '풀이 방향', '정답'][i]}</b> ${dev.hints[i]}`));
        if (tier < 3) box.append(btn('v2-secondary', ['첫 힌트 받기', '풀이 방향 받기', '정답 보기'][tier], () => { S.hints[cur] = tier + 1; save(); openHints(cur); }));
        else box.append(el('p', 'v2-note', '힌트를 전부 받았습니다.'));
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
    node.append(el('p', 'v2-feedback-lead', '막힌 곳, 이상한 문장, 재미없던 장치, 뭐든 좋습니다. 만든 사람이 직접 읽습니다.'));
    const ta = el('textarea', 'v2-textarea'); ta.rows = 6; ta.maxLength = 2000; ta.placeholder = '예: 보관함 숫자를 어디서 세는지 한참 헤맸어요'; ta.setAttribute('aria-label', '의견');
    const contact = el('input', 'v2-input'); contact.type = 'text'; contact.maxLength = 120; contact.placeholder = '답장 받을 이메일이나 연락처 (선택)'; contact.setAttribute('aria-label', '연락처(선택)');
    const status = el('p', 'v2-status'); status.setAttribute('role', 'status');
    const send = btn('v2-primary', '보내기', async () => {
      const text = ta.value.trim();
      if (!text) { status.textContent = '내용을 적어 주세요.'; return; }
      if (!cfg.form || !cfg.fields?.text) { status.textContent = '아직 의견함이 연결되기 전입니다. 조금만 기다려 주세요.'; return; }
      send.disabled = true; status.textContent = '보내는 중…';
      const where = `${ep.id} / ${S.screen === 'ending' ? '엔딩' : (sceneById(S.scene)?.name || '')} / 푼 장치 ${S.solved.length}/${Object.keys(ep.devices).length}`;
      const body = new URLSearchParams();
      if (cfg.fields.game) body.set(cfg.fields.game, where);
      body.set(cfg.fields.text, text);
      if (cfg.fields.contact && contact.value.trim()) body.set(cfg.fields.contact, contact.value.trim());
      try {
        await fetch(cfg.form, { method: 'POST', mode: 'no-cors', body });
        status.textContent = '보냈습니다. 고맙습니다.'; ta.value = ''; contact.value = '';
      } catch { status.textContent = '보내지 못했습니다. 잠시 뒤 다시 눌러 주세요.'; send.disabled = false; }
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
    e.paragraphs.forEach((p) => paper.append(el('p', 'v2-line', p)));
    if (e.afterword) paper.append(el('p', 'v2-afterword', e.afterword));
    if (e.unlockDoc && ep.docs[e.unlockDoc]) paper.append(btn('v2-secondary', ep.docs[e.unlockDoc].title + ' 읽기', () => openDoc(e.unlockDoc)));
    const row = el('div', 'v2-row');
    if (e.next) { const a = el('a', 'v2-primary', `다음 이야기 · ${e.next.title} →`); a.href = e.next.href; row.append(a); }
    row.append(btn('v2-secondary', '자료 다시 보기', () => openIndex()));
    row.append(btn('v2-secondary', '의견 남기기', () => openFeedback()));
    row.append(btn('v2-secondary subtle', '처음 화면', () => { S.screen = 'intro'; save(); render(); }));
    paper.append(row);
    if (e.next?.line) paper.append(el('p', 'v2-fine', e.next.line));
    sec.append(paper);
    return sec;
  }

  render();
  window.MihaejeV2 = { get state() { return S; }, get music() { return music; }, episode: ep, render, reset() { S = fresh(); save(); render(); } };
}
main();
