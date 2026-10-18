// 내 기록: v2 테마별 진행 상황 (이 브라우저에 저장된 것)
(function () {
  const MARK = 'data-v2-vault';
  let cases = null;
  async function render() {
    const box = document.getElementById('vaultContent'); if (!box) return;
    if (!cases) { try { cases = await (await fetch('cases.json', { cache: 'no-cache' })).json(); } catch { return; } }
    const rows = cases.map((c) => {
      let S = null; try { S = JSON.parse(localStorage.getItem(c.storageKey) || 'null'); } catch {}
      const started = S && (S.started || (S.solved && S.solved.length) || (S.read && S.read.length));
      const st = !S || !started ? ['아직 시작 전', 'none'] : S.ended ? ['끝까지 봤음', 'done'] : [`진행 중 · 장치 ${S.solved ? S.solved.length : 0}개 풀었음`, 'doing'];
      return { c, st };
    });
    const order = { doing: 0, done: 1, none: 2 };
    rows.sort((a, b) => order[a.st[1]] - order[b.st[1]]);
    box.setAttribute(MARK, '1');
    box.innerHTML = `<ul class="v2-vault">${rows.map(({ c, st }) => `<li class="${st[1]}"><a href="${c.href}"><b>${c.title}</b><span>${'★'.repeat(c.difficultyLevel || 0)}</span><em>${st[0]}</em></a></li>`).join('')}</ul>`;
  }
  function fixText() {
    const v = document.getElementById('vault'); if (!v) return;
    const h = v.querySelector('.page-intro h1'); if (h) h.textContent = '내 진행 기록';
    const p = v.querySelector('.page-intro p:not(.eyebrow)'); if (p) p.textContent = '테마마다 어디까지 했는지 보여 줍니다 누르면 이어서 할 수 있습니다';
  }
  function boot() {
    fixText(); render();
    const box = document.getElementById('vaultContent');
    if (box) new MutationObserver(() => { if (!box.hasAttribute(MARK) || !box.querySelector('.v2-vault')) render(); }).observe(box, { childList: true });
    window.addEventListener('hashchange', () => { if (location.hash === '#vault') { fixText(); render(); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
