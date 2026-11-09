"""속장 MP4 렌더: python3 render_mp4.py <폴더>/cards.html [--sec 6] [--fps 30]
표지(#k1)·마지막 장은 JPG(render.py), 그 사이 장(#k2 ~ #k{N-1})은 카드NN.mp4(1080x1350, 무음 오디오 포함, 6초 루프).
motion/motion.css 를 자동으로 넣고, 요소들에 순서대로 등장 지연을 줌. 카드뉴스 HTML에서 직접 @keyframes를 더 넣어도 됨."""
import sys, pathlib, subprocess, argparse
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument("html"); ap.add_argument("--sec", type=float, default=6); ap.add_argument("--fps", type=int, default=24)
a = ap.parse_args()
html = pathlib.Path(a.html).resolve(); out = html.parent
css = (pathlib.Path(__file__).parent / "motion" / "motion.css").read_text()
JS = """(id)=>{const el=document.getElementById(id); el.classList.add('mx');
 if(getComputedStyle(el).position==='static') el.style.position='relative';
 const L=document.createElement('div'); L.className='mx-light'; el.prepend(L);
 let i=0; el.querySelectorAll('.box,.it,.pill,.q,.mrow,.ox,.map,.chip,.row>*,.tip').forEach(n=>{n.style.animationDelay=(0.12+0.13*i++)+'s'});
 el.querySelectorAll('.copy p,.copy .key').forEach(n=>{});
 return true}"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1350})
    pg.goto(html.as_uri()); pg.add_style_tag(content=css); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(800)
    n = pg.evaluate("[...document.querySelectorAll('[id^=k]')].filter(e=>/^k\\d+$/.test(e.id)).length")
    for i in range(2, n):
        sid = f"k{i}"; pg.evaluate(JS, sid)
        pg.evaluate("document.getAnimations().forEach(a=>a.pause())")
        frames = int(a.sec * a.fps)
        dst = out / f"카드{i:02d}.mp4"
        ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(a.fps), "-i", "-",
                               "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-shortest",
                               "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", "-r", str(a.fps),
                               "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", str(dst)], stdin=subprocess.PIPE)
        loc = pg.locator(f"#{sid}")
        for f in range(frames):
            t = f * 1000 / a.fps
            pg.evaluate(f"document.getAnimations().forEach(a=>{{a.currentTime={t}}})")
            ff.stdin.write(loc.screenshot(type="jpeg", quality=92))
        ff.stdin.close(); ff.wait()
        print("저장", dst.name)
    b.close()
