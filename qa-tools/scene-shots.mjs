// 모든 v2 장면을 장치 다 푼 상태로 열어 무대 스크린샷을 찍습니다 (핫스팟 위치 확인용)
import * as L from './playlib.mjs';
const EPS = ['station', 'cat-invite', 'ohang', 'pet-home', 'studio', 'garage'];
const out = process.argv[2];
await L.ensureServer();
const { browser, page } = await L.launch({ mobile: false });
for (const id of EPS) {
  await L.fresh(page, '/play.html?case=' + id);
  const info = await page.evaluate(() => { const ep = window.MihaejeV2.episode; return { key: ep.storageKey || 'mihaeje-v2-' + ep.id, scenes: ep.scenes.map((s) => s.id), devs: Object.keys(ep.devices).filter((k) => !ep.devices[k].reveal?.ending) }; });
  for (const sc of info.scenes) {
    await page.evaluate(({ key, sc, devs, scenes }) => localStorage.setItem(key, JSON.stringify({ v: 2, screen: 'play', scene: sc, read: [], visited: scenes, solved: devs, drafts: {}, hints: {}, seen: [], profile: { seed: 1, companion: 3, counts: [1, 2, 1, 2, 2], pillars: [] } })), { ...info, sc });
    await page.reload(); await L.sleep(700);
    const st = await page.$('.v2-stage'); if (st) await st.screenshot({ path: `${out}/${id}-${sc}.png` });
  }
}
await browser.close();
