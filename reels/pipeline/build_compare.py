#!/usr/bin/env python3
"""초단기 비교형(무음성) 릴스 빌더.

python3 build_compare.py <workdir>
workdir: spec.json, bg/(클립)
산출: out.mp4, cover.jpg, check.jpg, spec_resolved.json

spec 예:
{ "style":"compare", "title":"...", "left":"...", "right":"...",
  "rows":[{"k":"라벨","l":"왼쪽","r":"오른쪽"}, ...], "save":"...", "foot":"...",
  "segs":[{"clip":"x.mp4","start":0,"dur":1.6,"cx":0.5,"filled":0,"final":false,"blur":false}],
  "bed":"car_bed","bedVolume":0.35,"tick":"tick","finalSfx":"whoosh_soft",
  "cover":{"clip":"x.mp4","start":1,"cx":0.5,"tag":"..","title":"..","sub":".."} }
나레이션 없음 — 소리는 저장소 sfx만.
"""
import json, os, subprocess, sys, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
W = os.path.abspath(sys.argv[1])
spec = json.load(open(os.path.join(W, 'spec.json')))
TMP = os.path.join(W, '_cmp'); shutil.rmtree(TMP, ignore_errors=True); os.makedirs(TMP)
FPS = 30


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-3000:]); raise SystemExit('ffmpeg failed')


def probe(p):
    o = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries',
                                 'stream=width,height', '-of', 'csv=p=0', p]).decode().strip().split(',')
    return int(o[0]), int(o[1])


def vf_cover(path, cx, zoom=1.0, cy=None, ty=None):
    """cx/cy: 원본에서 보여줄 점(0~1). ty: 그 점이 놓일 출력 y(px). zoom: 꽉 채운 뒤 추가 확대."""
    w, h = probe(path)
    s = max(1080 / w, 1920 / h) * zoom
    sw, sh = int(round(w * s / 2) * 2), int(round(h * s / 2) * 2)
    x = int(min(max(sw * cx - 540, 0), sw - 1080))
    if cy is None:
        y = int((sh - 1920) / 2)
    else:
        y = int(min(max(sh * cy - (ty if ty is not None else 960), 0), sh - 1920))
    return f'scale={sw}:{sh},crop=1080:1920:{x}:{y}'


# 1) overlay PNG 렌더
from playwright.sync_api import sync_playwright
states = []
for i, sg in enumerate(spec['segs']):
    states.append(dict(title=spec['title'], left=spec['left'], right=spec['right'], rows=spec['rows'],
                       filled=sg.get('filled', 0), final=sg.get('final', False), save=spec.get('save', ''),
                       foot=spec.get('foot', '')))
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    for i, st in enumerate(states):
        html = open(os.path.join(HERE, 'template_compare.html'), encoding='utf-8').read()
        html = html.replace('<script>', '<script>window.S=' + json.dumps(st, ensure_ascii=False) + ';', 1)
        tp = os.path.join(HERE, f'_tmp_compare_{os.getpid()}.html')
        open(tp, 'w', encoding='utf-8').write(html)
        pg.goto('file://' + tp)
        pg.evaluate('document.fonts.ready')
        pg.wait_for_timeout(250)
        pg.screenshot(path=os.path.join(TMP, f'ov{i}.png'), omit_background=True)
        os.remove(tp)
    # cover
    cv = spec['cover']
    cf = os.path.join(TMP, 'cover_bg.jpg')
    run(['ffmpeg', '-v', 'error', '-y', '-ss', str(cv['start']), '-i', os.path.join(W, 'bg', cv['clip']),
         '-frames:v', '1', '-vf', vf_cover(os.path.join(W, 'bg', cv['clip']), cv.get('cx', .5)), '-q:v', '2', cf])
    html = open(os.path.join(HERE, 'cover.html'), encoding='utf-8').read()
    C = dict(cv); C['photo'] = 'file://' + cf
    html = html.replace('<script>', '<script>window.COVER=' + json.dumps(C, ensure_ascii=False) + ';', 1)
    tp = os.path.join(HERE, f'_tmp_cover_{os.getpid()}.html'); open(tp, 'w', encoding='utf-8').write(html)
    pg.goto('file://' + tp); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(W, 'cover.jpg'), type='jpeg', quality=92); os.remove(tp)
    b.close()

# 2) 세그먼트별 영상 (이전 오버레이 → 새 오버레이 0.18초 페이드)
segs = []
t = 0.0
for i, sg in enumerate(spec['segs']):
    src = os.path.join(W, 'bg', sg['clip'])
    d = sg['dur']
    vf = vf_cover(src, sg.get('cx', .5), sg.get('zoom', 1.0), sg.get('cy'), sg.get('ty'))
    if sg.get('blur'):
        vf += ',gblur=sigma=18,eq=brightness=-0.06'
    if sg.get('slow'):
        vf = f'setpts={1/sg["slow"]}*PTS,' + vf
    out = os.path.join(TMP, f's{i}.mp4')
    prev = os.path.join(TMP, f'ov{max(i-1,0)}.png'); cur = os.path.join(TMP, f'ov{i}.png')
    fc = (f'[0:v]{vf},fps={FPS},format=yuv420p,trim=duration={d},setpts=PTS-STARTPTS[b];'
          f'[1:v]format=rgba[p];[2:v]format=rgba,fade=in:st=0:d=0.18:alpha=1[n];'
          f'[b][p]overlay=0:0:shortest=1[b2];[b2][n]overlay=0:0:shortest=1,format=yuv420p[v]')
    if i == 0:
        fc = (f'[0:v]{vf},fps={FPS},format=yuv420p,trim=duration={d},setpts=PTS-STARTPTS[b];'
              f'[2:v]format=rgba[n];[b][n]overlay=0:0:shortest=1,format=yuv420p[v];[1:v]nullsink')
    run(['ffmpeg', '-v', 'error', '-y', '-ss', str(sg.get('start', 0)), '-i', src,
         '-loop', '1', '-t', str(d), '-framerate', str(FPS), '-i', prev,
         '-loop', '1', '-t', str(d), '-framerate', str(FPS), '-i', cur,
         '-filter_complex', fc, '-map', '[v]', '-an', '-r', str(FPS), '-frames:v', str(int(round(d * FPS))),
         '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out])
    segs.append(dict(i=i, t=round(t, 3), dur=d, filled=sg.get('filled', 0), final=sg.get('final', False)))
    t += d
total = t
lst = os.path.join(TMP, 'list.txt')
open(lst, 'w').write(''.join(f"file '{os.path.join(TMP, f's{i}.mp4')}'\n" for i in range(len(segs))))
vid = os.path.join(TMP, 'video.mp4')
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', vid])

# 3) 소리: 주행 소리 bed + 항목 바뀔 때 tick, 마지막 whoosh
sfx = os.path.join(HERE, 'sfx')
ins = ['-i', os.path.join(sfx, spec.get('bed', 'car_bed') + '.wav')]
fl = [f'[0:a]atrim=0:{total},asetpts=PTS-STARTPTS,volume={spec.get("bedVolume",0.35)},'
      f'afade=t=in:d=0.3,afade=t=out:st={total-0.6}:d=0.6[bed]']
mix = ['[bed]']
k = 1
for s in segs:
    name = None
    if s['final']:
        name = spec.get('finalSfx', 'whoosh_soft')
    elif s['i'] > 0 and s['filled'] != segs[s['i'] - 1]['filled']:
        name = spec.get('tick', 'tick')
    if not name:
        continue
    ins += ['-i', os.path.join(sfx, name + '.wav')]
    ms = int(s['t'] * 1000)
    fl.append(f'[{k}:a]volume={spec.get("sfxVolume",0.8)},adelay={ms}|{ms}[a{k}]'); mix.append(f'[a{k}]'); k += 1
fl.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{total}[a]')
aud = os.path.join(TMP, 'audio.m4a')
run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[a]', '-ac', '2', '-ar', '48000',
                                               '-c:a', 'aac', '-b:a', '192k', aud])
run(['ffmpeg', '-v', 'error', '-y', '-i', vid, '-i', aud, '-c:v', 'copy', '-c:a', 'copy', '-shortest',
     '-movflags', '+faststart', os.path.join(W, 'out.mp4')])

# 4) 점검 시트
run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(W, 'out.mp4'), '-vf',
     f'fps=2,scale=270:480,tile=8x{int(total*2/8)+1}', '-frames:v', '1', os.path.join(W, 'check.jpg')])
json.dump(dict(total=total, segs=segs), open(os.path.join(W, 'spec_resolved.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', total)
