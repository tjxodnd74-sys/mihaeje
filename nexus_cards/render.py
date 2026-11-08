"""사용: python3 render.py <작업폴더>/cards.html
cards.html 안의 #k1, #k2, ... 를 1080x1350으로 찍어 같은 폴더에 카드01.jpg..., grid.jpg 저장."""
import sys, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image
html = pathlib.Path(sys.argv[1]).resolve(); out = html.parent
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1350})
    pg.goto(html.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(1000)
    n = pg.evaluate("document.querySelectorAll('[id^=k]').length")
    ims = []
    for i in range(1, n + 1):
        loc = pg.locator(f"#k{i}")
        if loc.count() == 0: break
        f = out / f"카드{i:02d}.jpg"; loc.screenshot(path=str(out / "_tmp.png"))
        im = Image.open(out / "_tmp.png").convert("RGB"); im.save(f, quality=93); ims.append(im)
    b.close()
(out / "_tmp.png").unlink(missing_ok=True)
s = 0.3; w, h = int(1080 * s), int(1350 * s); cols = 5; rows = (len(ims) + cols - 1) // cols
c = Image.new("RGB", (w * cols + 30, h * rows + 5 * (rows + 1)), "#222")
for k, im in enumerate(ims): c.paste(im.resize((w, h)), (5 + (k % cols) * (w + 5), 5 + (k // cols) * (h + 5)))
c.save(out / "grid.jpg", quality=88); print(f"{len(ims)}장 저장:", out)
