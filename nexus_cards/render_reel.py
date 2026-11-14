"""카드뉴스 → 세로 릴스(1080x1920) 렌더 — 2026-11-14 사용자 결정: 캐러셀은 도달 1~2명, 릴스는 45~330명 → 카드뉴스를 '움직이는 릴스'로 올림.
사용: python3 render_reel.py <폴더>/cards.html [--hook "첫 1초 한 줄"] [--tag "AI 뉴스"] [--cover 1.8] [--per 2.8] [--last 2.6] [--fps 24] [--bgm 파일]
- cards.html 의 #k1..#kN(1080x1350)을 차례로 찍어 9:16 화면 가운데에 놓음(뒤는 같은 장을 흐리고 어둡게 깐 배경).
- 위 띠: --hook(첫 장에서만 크게 → 이후엔 작은 태그+진행 막대), 아래 띠: @nexus_studio.kr.
- 장마다 motion/motion.css 움직임(제목 올라옴·상자 차례 등장 등) + 장 바뀔 때 살짝 확대되는 '펀치'.
- 소리: --bgm 이 없으면 저작권 걱정 없는 잔잔한 비트를 직접 합성(+장 바뀔 때 휙 소리).
결과: <폴더>/릴스.mp4, <폴더>/릴스_썸네일.jpg(첫 장), <폴더>/릴스_프레임.jpg(0초·1초·중간·끝 확인용)."""
import argparse, pathlib, subprocess, io, math, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("html"); ap.add_argument("--hook", default=""); ap.add_argument("--tag", default="AI 뉴스")
ap.add_argument("--cover", type=float, default=1.8); ap.add_argument("--per", type=float, default=2.8)
ap.add_argument("--last", type=float, default=2.6); ap.add_argument("--fps", type=int, default=24)
ap.add_argument("--bgm", default="")
a = ap.parse_args()
html = pathlib.Path(a.html).resolve(); out = html.parent; here = pathlib.Path(__file__).parent
css = (here / "motion" / "motion.css").read_text()
def _ttf(name):
    """fonts/ 의 woff2 를 PIL 이 읽을 수 있는 ttf 로 풀어 캐시(필요: pip install fonttools brotli)."""
    src = here / "fonts" / name; cache = pathlib.Path("/tmp/nexus_fonts"); cache.mkdir(exist_ok=True)
    dst = cache / (src.stem + ".ttf")
    if not dst.exists():
        from fontTools.ttLib import TTFont
        f = TTFont(str(src)); f.flavor = None; f.save(str(dst))
    return str(dst)
FB = _ttf("Pretendard-Black.woff2"); FM = _ttf("Pretendard-Bold.woff2")
W, H, CW, CH = 1080, 1920, 1080, 1350; TOP = (H - CH) // 2  # 285
JS = """(id)=>{const el=document.getElementById(id); el.classList.add('mx');
 if(getComputedStyle(el).position==='static') el.style.position='relative';
 const L=document.createElement('div'); L.className='mx-light'; el.prepend(L);
 let i=0; el.querySelectorAll('.box,.it,.pill,.q,.mrow,.ox,.map,.chip,.row>*,.tip').forEach(n=>{n.style.animationDelay=(0.08+0.11*i++)+'s'});
 return true}"""

def font(p, s):
    return ImageFont.truetype(p, s)

def fit_lines(d, text, f, maxw):
    words, lines, cur = text.split(" "), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def bands(img, slide, n, t_in, is_cover):
    d = ImageDraw.Draw(img)
    if is_cover and a.hook:
        size = 74
        while size > 46:
            f = font(FB, size); ls = fit_lines(d, a.hook, f, W - 120)
            if len(ls) <= 2: break
            size -= 4
        y = TOP // 2 - (len(ls) * (size + 10)) // 2
        for l in ls:
            tw = d.textlength(l, font=f); x = (W - tw) / 2
            d.text((x + 3, y + 3), l, font=f, fill=(0, 0, 0))
            d.text((x, y), l, font=f, fill=(255, 212, 59)); y += size + 10
    else:
        f = font(FM, 34); tag = a.tag
        tw = d.textlength(tag, font=f); x0 = (W - tw) / 2 - 26
        d.rounded_rectangle([x0, 118, x0 + tw + 52, 176], radius=29, fill=(255, 212, 59))
        d.text((x0 + 26, 125), tag, font=f, fill=(20, 20, 24))
        # 진행 막대
        bw = W - 240; prog = (slide - 1 + min(1, t_in)) / n
        d.rounded_rectangle([120, 214, 120 + bw, 224], radius=5, fill=(255, 255, 255, 60))
        d.rounded_rectangle([120, 214, 120 + max(12, int(bw * prog)), 224], radius=5, fill=(255, 212, 59))
    f2 = font(FM, 32); s = "@nexus_studio.kr"
    d.text(((W - d.textlength(s, font=f2)) / 2, H - TOP + 70), s, font=f2, fill=(235, 235, 240))

def compose(card, bg, slide, n, t_in, t_abs_in, is_cover):
    img = bg.copy()
    # 펀치: 장 시작 0.25초 동안 1.05 → 1.0
    k = min(1.0, t_abs_in / 0.25); sc = 1.05 - 0.05 * (1 - (1 - k) ** 3)
    cw, ch = int(CW * sc), int(CH * sc)
    c = card.resize((cw, ch), Image.LANCZOS) if sc != 1 else card
    img.paste(c, ((W - cw) // 2, TOP + (CH - ch) // 2))
    bands(img, slide, n, t_in, is_cover)
    return img

def make_bg(card):
    b = card.resize((W, int(W * CH / CW))).resize((W, H)).filter(ImageFilter.GaussianBlur(40))
    return Image.blend(b, Image.new("RGB", (W, H), (8, 8, 12)), 0.62)

# ---------- 소리 ----------
def synth(total, cuts, sr=44100):
    n = int(total * sr); t = np.arange(n) / sr; y = np.zeros(n)
    bpm = 96; beat = 60 / bpm
    chords = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]]  # Am7 Fmaj7 G7 Em7
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    bar = beat * 4
    for i in range(int(total / bar) + 1):
        s0 = int(i * bar * sr); s1 = min(n, int((i + 1) * bar * sr))
        if s0 >= n: break
        tt = t[s0:s1] - t[s0]; env = np.minimum(1, tt / 0.4) * np.exp(-tt * 0.35)
        for m in chords[i % 4]:
            f = hz(m); y[s0:s1] += 0.045 * env * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt))
        f = hz(chords[i % 4][0] - 24); y[s0:s1] += 0.10 * env * np.sin(2 * np.pi * f * tt)
    for j in range(int(total / beat) + 1):
        s0 = int(j * beat * sr)
        if s0 >= n: break
        L = min(n - s0, int(0.25 * sr)); tt = np.arange(L) / sr
        if j % 2 == 0:  # 킥
            y[s0:s0 + L] += 0.35 * np.sin(2 * np.pi * (110 * np.exp(-tt * 18) + 45) * tt) * np.exp(-tt * 14)
        else:  # 스네어(부드럽게)
            y[s0:s0 + L] += 0.06 * np.random.randn(L) * np.exp(-tt * 22)
        h0 = int((j + 0.5) * beat * sr); Lh = min(n - h0, int(0.05 * sr))
        if Lh > 0: y[h0:h0 + Lh] += 0.025 * np.random.randn(Lh) * np.exp(-np.arange(Lh) / sr * 90)
    for c in cuts:  # 휙
        s0 = max(0, int((c - 0.12) * sr)); L = min(n - s0, int(0.3 * sr)); tt = np.arange(L) / sr
        noise = np.random.randn(L); noise = np.convolve(noise, np.ones(6) / 6, mode="same")
        y[s0:s0 + L] += 0.12 * noise * np.sin(np.pi * tt / (L / sr)) ** 2
    fo = int(0.8 * sr); y[-fo:] *= np.linspace(1, 0, fo); y[:int(0.05 * sr)] *= np.linspace(0, 1, int(0.05 * sr))
    y = y / (np.max(np.abs(y)) + 1e-9) * 0.5
    return (y * 32767).astype(np.int16), sr

# ---------- 렌더 ----------
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": CW, "height": CH})
    pg.goto(html.as_uri()); pg.add_style_tag(content=css); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(900)
    n = pg.evaluate("[...document.querySelectorAll('[id^=k]')].filter(e=>/^k\\d+$/.test(e.id)).length")
    durs = [a.cover] + [a.per] * (n - 2) + [a.last]
    total = sum(durs); cuts = list(np.cumsum(durs)[:-1])
    tmpv = out / "_reel_v.mp4"
    ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(a.fps), "-i", "-",
                           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "19", "-preset", "medium", "-r", str(a.fps), str(tmpv)],
                          stdin=subprocess.PIPE)
    checks = {}
    for i in range(1, n + 1):
        sid = f"k{i}"; loc = pg.locator(f"#{sid}")
        inner = 1 < i < n
        if inner: pg.evaluate(JS, sid)
        pg.evaluate("document.getAnimations().forEach(a=>a.pause())")
        first = Image.open(io.BytesIO(loc.screenshot(type="png"))).convert("RGB")
        bg = make_bg(first)
        if i == 1: first.save(out / "릴스_썸네일.jpg", quality=92)
        frames = int(round(durs[i - 1] * a.fps))
        for f in range(frames):
            tms = f * 1000 / a.fps
            if inner:
                pg.evaluate(f"document.getAnimations().forEach(a=>{{a.currentTime={tms}}})")
                card = Image.open(io.BytesIO(loc.screenshot(type="jpeg", quality=93))).convert("RGB")
            else:
                card = first
            img = compose(card, bg, i, n, f / frames, tms / 1000, i == 1)
            gt = sum(durs[:i - 1]) + tms / 1000
            for key, at in (("0초", 0), ("1초", 1.0), ("중간", total / 2), ("끝", total - 0.5)):
                if key not in checks and gt >= at: checks[key] = img.copy()
            buf = io.BytesIO(); img.save(buf, "JPEG", quality=92); ff.stdin.write(buf.getvalue())
        print(f"장 {i}/{n} ({durs[i-1]}초)")
    ff.stdin.close(); ff.wait(); b.close()

wav = out / "_reel_a.wav"
if a.bgm:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", a.bgm, "-t", str(total), "-af", f"afade=t=out:st={total-0.8}:d=0.8,volume=0.6", "-ar", "44100", "-ac", "2", str(wav)], check=True)
else:
    y, sr = synth(total, cuts)
    with wave.open(str(wav), "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(y.tobytes())
dst = out / "릴스.mp4"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(tmpv), "-i", str(wav), "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
                "-ar", "44100", "-ac", "2", "-shortest", "-movflags", "+faststart", str(dst)], check=True)
tmpv.unlink(missing_ok=True); wav.unlink(missing_ok=True)
s = 0.3; tiles = [checks[k].resize((int(W * s), int(H * s))) for k in ("0초", "1초", "중간", "끝") if k in checks]
sheet = Image.new("RGB", (sum(t.width for t in tiles) + 10 * (len(tiles) + 1), tiles[0].height + 20), "#222")
x = 10
for t_ in tiles: sheet.paste(t_, (x, 10)); x += t_.width + 10
sheet.save(out / "릴스_프레임.jpg", quality=88)
print(f"저장 {dst} ({total:.1f}초, {n}장)")
