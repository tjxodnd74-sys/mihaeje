// 미해제 v2 저장 도우미 — engine.js 가 불러 씁니다 (덮어쓰기 레이어 아님)
// - 본 키는 예전과 같은 JSON 한 덩어리 그대로 (로비·보관함이 이 키를 읽습니다)
// - 쓸 때마다 같은 내용을 백업 키(본 키 + '~bak')에 하나 더 둡니다
// - 본 키가 깨지면(JSON 아님·모양 틀림) 백업으로 되살리고, 둘 다 없으면 새로 시작합니다
// - localStorage 가 막혀 있거나 가득 차면 메모리로 계속하고 조용한 안내 한 줄을 띄웁니다
// - 진행 코드: 지금 상태를 짧은 글자로 내보내고 다른 기기에서 받아 이어하기

const BAK = '~bak';
const BROKEN = '~broken';

const storage = () => { try { return window.localStorage || null; } catch { return null; } };
const isQuota = (e) => !!e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014);

// ---------- 조용한 안내 한 줄 ----------
let noteEl = null, noteTimer = 0;
export function note(text, ms = 7000) {
  if (!text) return;
  if (!noteEl) {
    noteEl = document.createElement('p');
    noteEl.className = 'v2-save-note';
    noteEl.setAttribute('role', 'status');
    noteEl.addEventListener('click', () => { noteEl.classList.remove('on'); });
  }
  if (!noteEl.isConnected) document.body.append(noteEl);
  noteEl.textContent = text;
  requestAnimationFrame(() => noteEl.classList.add('on'));
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => noteEl?.classList.remove('on'), ms);
}

const NOTES = {
  blocked: '이 브라우저는 저장을 막아 두었어요 창을 닫으면 진행이 사라집니다',
  full: '저장 공간이 가득 차 지금 진행은 이 창에서만 이어집니다',
  restored: '저장이 깨져 있어 바로 전 기록으로 되살렸어요',
  broken: '저장이 깨져 있어 처음부터 시작합니다',
  back: '저장이 다시 됩니다',
};

// ---------- 저장소 ----------
// valid(o): 이 편의 저장 모양이 맞는지 (engine 이 넘김)
// onTrouble(kind, text): 안내를 어떻게 띄울지 (없으면 note 한 줄)
export function openStore(key, { valid = (o) => !!o && typeof o === 'object', onTrouble } = {}) {
  let mode = 'disk';     // 'disk' | 'memory'
  let trouble = '';      // '' | 'blocked' | 'full' | 'restored' | 'broken'
  let warned = false;
  // null = 없음, undefined = 깨짐
  const parse = (txt) => { if (txt == null) return null; try { const o = JSON.parse(txt); return valid(o) ? o : undefined; } catch { return undefined; } };
  const tell = (kind) => { trouble = kind; if (onTrouble) onTrouble(kind, NOTES[kind]); else note(NOTES[kind]); };

  function load() {
    const s = storage();
    let main;
    try { if (!s) throw new Error('no storage'); main = s.getItem(key); } catch { mode = 'memory'; tell('blocked'); warned = true; return null; }
    const m = parse(main);
    if (m) return m;
    if (m === null) return null; // 처음 하는 사람 (로비가 지운 진행도 되살리지 않음)
    // 본 키가 깨짐 → 깨진 원본은 따로 한 번 남겨 두고 백업을 찾는다
    try { if (s.getItem(key + BROKEN) == null) s.setItem(key + BROKEN, String(main).slice(0, 200000)); } catch {}
    let b = null;
    try { b = parse(s.getItem(key + BAK)); } catch {}
    if (b) {
      try { s.setItem(key, JSON.stringify(b)); } catch {}
      tell('restored');
      return b;
    }
    tell('broken');
    return null;
  }

  function save(obj) {
    const s = storage();
    if (!s) { if (!warned) { warned = true; mode = 'memory'; tell('blocked'); } return false; }
    let txt;
    try { txt = JSON.stringify(obj); } catch { return false; }
    try { s.setItem(key, txt); }
    catch (e) {
      // 가득 찼으면 내 백업·깨진 원본을 비우고 한 번 더
      let ok = false;
      if (isQuota(e)) { try { s.removeItem(key + BAK); s.removeItem(key + BROKEN); s.setItem(key, txt); ok = true; } catch {} }
      if (!ok) {
        const was = mode; mode = 'memory';
        if (!warned || was !== 'memory') { warned = true; tell(isQuota(e) ? 'full' : 'blocked'); }
        return false;
      }
    }
    if (valid(obj)) { try { s.setItem(key + BAK, txt); } catch {} }
    if (mode === 'memory') { mode = 'disk'; trouble = ''; note(NOTES.back, 4000); }
    return true;
  }

  return {
    load, save,
    get mode() { return mode; },
    get trouble() { return trouble; },
  };
}

// ---------- 설치된 앱에서 저장이 쉽게 안 지워지게 ----------
let persistAsked = false;
export function askPersist() {
  if (persistAsked) return; persistAsked = true;
  try {
    const st = navigator.storage;
    if (!st?.persist) return;
    const installed = matchMedia?.('(display-mode: standalone)').matches || matchMedia?.('(display-mode: fullscreen)').matches || navigator.standalone === true || !!window.Capacitor;
    // 파이어폭스 웹 탭은 허락 창을 띄우므로 설치된 앱일 때만 묻는다
    if (!installed && /firefox|fxios/i.test(navigator.userAgent)) return;
    Promise.resolve(st.persisted?.()).then((already) => { if (!already) return st.persist(); }).catch(() => {});
  } catch {}
}

// ---------- 진행 코드 ----------
// 모양: MHJ2.<편 id>.<z|j><base64url>.<확인 글자 4>
// z = deflate-raw 압축, j = 압축 없음 (압축을 못 하는 브라우저)
const TAG = 'MHJ';
const CODE_VER = 2;

const toB64 = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const fromB64 = (str) => { const b = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)); const out = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i); return out; };
const sum4 = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return (h % 1679616).toString(36).padStart(4, '0'); };
async function pipe(bytes, Stream, fmt) { const out = new Response(new Blob([bytes]).stream().pipeThrough(new Stream(fmt))); return new Uint8Array(await out.arrayBuffer()); }

export async function encodeCode(caseId, state) {
  const raw = new TextEncoder().encode(JSON.stringify(state));
  let kind = 'j', bytes = raw;
  if (typeof CompressionStream === 'function') { try { bytes = await pipe(raw, CompressionStream, 'deflate-raw'); kind = 'z'; } catch { bytes = raw; kind = 'j'; } }
  const body = kind + toB64(bytes);
  return `${TAG}${CODE_VER}.${caseId}.${body}.${sum4(caseId + '.' + body)}`;
}

async function caseTitle(id) {
  try { const list = await (await fetch('cases.json', { cache: 'force-cache' })).json(); return list.find((c) => c.id === id)?.title || ''; } catch { return ''; }
}

// 돌려줌: { state } 또는 { error: '그 이유를 말하는 한 줄' }
export async function decodeCode(text, caseId, valid = () => true) {
  const code = String(text || '').replace(/\s+/g, '').replace(/^["'「『]+|["'」』]+$/g, '');
  if (!code) return { error: '받은 진행 코드를 먼저 붙여 넣어 주세요' };
  const m = /^MHJ(\d+)\.([a-z-]+)\.([zj])([A-Za-z0-9_-]+)\.([0-9a-z]{4})$/.exec(code);
  if (!m) {
    if (/^MHJ\d/.test(code)) return { error: '코드가 중간에 잘린 것 같아요 처음부터 끝까지 다시 복사해 주세요' };
    return { error: '미해제 진행 코드가 아니에요 복사한 글자를 그대로 붙여 넣어 주세요' };
  }
  const [, ver, cid, kind, b64, sum] = m;
  if (Number(ver) > CODE_VER) return { error: '더 새 판에서 만든 코드예요 이 화면을 새로 고친 뒤 다시 붙여 넣어 주세요' };
  if (Number(ver) !== CODE_VER) return { error: '예전 판에서 만든 코드라 읽을 수 없어요' };
  if (sum4(cid + '.' + kind + b64) !== sum) return { error: '코드 일부가 빠졌거나 바뀌었어요 처음부터 끝까지 다시 복사해 주세요' };
  if (cid !== caseId) {
    const t = await caseTitle(cid);
    return { error: t ? `「${t}」 편의 코드예요 그 편 처음 화면에서 붙여 넣어 주세요` : '다른 편의 코드예요 그 편 처음 화면에서 붙여 넣어 주세요' };
  }
  let bytes;
  try { bytes = fromB64(b64); } catch { return { error: '코드 일부가 빠졌거나 바뀌었어요 처음부터 끝까지 다시 복사해 주세요' }; }
  if (kind === 'z') {
    if (typeof DecompressionStream !== 'function') return { error: '이 브라우저는 이 코드를 풀지 못해요 다른 브라우저에서 열어 주세요' };
    try { bytes = await pipe(bytes, DecompressionStream, 'deflate-raw'); } catch { return { error: '코드를 풀지 못했어요 처음부터 끝까지 다시 복사해 주세요' }; }
  }
  let state;
  try { state = JSON.parse(new TextDecoder().decode(bytes)); } catch { return { error: '코드를 풀지 못했어요 처음부터 끝까지 다시 복사해 주세요' }; }
  if (!valid(state)) return { error: '코드는 읽었지만 이 편의 진행 모양이 아니에요' };
  return { state };
}

// 클립보드에 복사 (안 되면 false)
export async function copyText(text, field) {
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; } } catch {}
  try {
    if (field) { field.focus(); field.select(); field.setSelectionRange?.(0, text.length); return document.execCommand('copy'); }
  } catch {}
  return false;
}
