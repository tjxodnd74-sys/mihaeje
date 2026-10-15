#!/usr/bin/env python3
"""릴스 빌더: spec.json + 나레이션 mp3 + 배경 클립 + 효과음 → 완성 mp4

사용: python3 build.py <workdir>
workdir 안에 있어야 하는 것:
  spec.json          — 아래 형식
  narr.mp3           — 타입캐스트 나레이션
  bg/*.mp4           — 배경 세로 클립 1개 이상 (1080x1920 권장, 아무 해상도나 됨)
  sfx/               — 효과음 wav (hook_impact, hook_hit, whoosh_fast, pop, shutter, riser, success, ding)
출력: workdir/out.mp4

spec.json 형식 (segments의 t/e는 비워두면 나레이션 무음 구간으로 자동 배정):
{
 "eyebrow": "11월 전 필수 체크",
 "title": [["겨울",false],["오기",false],["전",false],["BR"],["차량",false],["점검",false],["3가지",true]],
 "cta": ["저장해 두고","이번 주말에 체크"],
 "segments": [
   {"cap":"11월 오기 전에, |이 세 가지|는 꼭 확인하세요","kin":[["11월",0],["전에",0.4],["꼭!",1.2,true],["확인",1.65,true]]},
   {"cap":"첫째, |배터리|","step":1,"icon":"battery","name":"배터리","num":"01"},
   {"cap":"|3년| 넘었으면 ...","stat":["3년","넘었으면 교체 고민"],"count":[3,"년",""]},
   ...
   {"cap":"저장해두고, ...","cta":true}
 ]
}
- cap: |단어| 로 감싸면 노란 강조. 단어 단위로 튀어나옴.
- kin: 훅 구간 한가운데 큰 글자. [텍스트, 세그먼트 시작 기준 초, 노랑여부]
- step: 1~3 → 와이프 + 거대 숫자 + 카드. icon: battery|tire|washer|generic
- stat: [큰 숫자 문구, 보조 문구], count: [목표 숫자, 단위, 접두(예 "-")] → 카운트업
- cta: true → 마지막 CTA + 컨페티
세그먼트 수 = 나레이션 문장 수(무음 구간으로 나뉘는 수)와 같아야 함.
"""
import json, subprocess, sys, os, re, shutil, glob, math
W = sys.argv[1]
spec = json.load(open(os.path.join(W, 'spec.json'), encoding='utf-8'))
HERE = os.path.dirname(os.path.abspath(__file__))
narr = os.path.join(W, 'narr.mp3')

def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print(r.stderr[-3000:]); sys.exit(1)
    return r

# --- 1. narration duration + pauses ---
dur = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', narr]).stdout.strip())
sd = subprocess.run(['ffmpeg', '-i', narr, '-af', 'silencedetect=n=-32dB:d=0.22', '-f', 'null', '-'], capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', sd)]
ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sd)]
sil = list(zip(starts, ends))
# speech chunks between silences
chunks = []
cur = 0.0
for s, e in sil:
    if s - cur > 0.15: chunks.append([cur, s])
    cur = e
if dur - cur > 0.15: chunks.append([cur, dur])
segs = spec['segments']
n = len(segs)
# merge/split chunks to match segment count
while len(chunks) > n:
    # merge the two chunks with the smallest gap
    gaps = [(chunks[i+1][0] - chunks[i][1], i) for i in range(len(chunks)-1)]
    g, i = min(gaps)
    chunks[i] = [chunks[i][0], chunks[i+1][1]]; del chunks[i+1]
if len(chunks) < n:
    print(f'경고: 나레이션 문장 수({len(chunks)}) < 세그먼트 수({n}) — 글자 수 비율로 나눔')
    total = sum(len(re.sub(r'\|', '', s['cap'])) for s in segs)
    t = chunks[0][0] if chunks else 0.3
    chunks = []
    for s in segs:
        L = (dur - t) * len(re.sub(r'\|', '', s['cap'])) / total
        chunks.append([t, t + L]); t += L
for s, (a, b) in zip(segs, chunks):
    s['t'] = round(a, 3)
# each segment ends where the next begins; last one runs to the end
for i, s in enumerate(segs):
    s['e'] = segs[i+1]['t'] if i+1 < n else round(dur + 1.5, 3)
# kinetic words: relative → absolute
for s in segs:
    if 'kin' in s:
        s['kin'] = [[k[0], round(s['t'] + k[1], 3), bool(k[2]) if len(k) > 2 else False] for k in s['kin']]
total_dur = math.ceil(dur + 1.2)
spec['duration'] = total_dur
# impacts: segment start of hook, each step, cta + hook's yellow words
imp = [segs[0]['t']] + [s['t'] for s in segs if s.get('step')] + [s['t'] for s in segs if s.get('cta')]
for k in segs[0].get('kin', []):
    if k[2]: imp.append(k[1])
spec['impacts'] = sorted(set(round(x, 3) for x in imp))
json.dump(spec, open(os.path.join(W, 'spec_resolved.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('timeline:', [(s['t'], s['e']) for s in segs], 'duration', total_dur)

# --- 2. render overlay frames ---
frames = os.path.join(W, 'frames'); shutil.rmtree(frames, ignore_errors=True); os.makedirs(frames)
render_js = f"""
const {{ chromium }} = require('playwright');const fs=require('fs');
(async()=>{{const spec=JSON.parse(fs.readFileSync({json.dumps(os.path.join(W,'spec_resolved.json'))},'utf8'));
const fps=30,n=Math.round(fps*{total_dur});
const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1920}}}});
await p.addInitScript(s=>{{window.SPEC=s}},spec);
await p.goto('file://'+{json.dumps(os.path.join(HERE,'template.html'))});await p.evaluate(()=>document.fonts.ready);
for(let i=0;i<n;i++){{await p.evaluate(t=>window.seek(t),i/fps);await p.screenshot({{path:{json.dumps(frames)}+'/f'+String(i).padStart(4,'0')+'.png',omitBackground:true}});}}
await b.close();}})();
"""
open(os.path.join(W, '_render.js'), 'w').write(render_js)
run(['node', os.path.join(W, '_render.js')], cwd=HERE)

# --- 3. background: concat clips, cut per segment with punch zooms ---
bgs = sorted(glob.glob(os.path.join(W, 'bg', '*.mp4')))
if not bgs: print('bg/*.mp4 없음'); sys.exit(1)
# build a concat of clips scaled/cropped to 1080x1920, loop if too short
lst = os.path.join(W, '_bg.txt')
with open(lst, 'w') as f:
    L = 0.0; i = 0
    while L < total_dur + 2:
        b = bgs[i % len(bgs)]
        d = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', b]).stdout.strip())
        f.write(f"file '{b}'\n"); L += min(d, 8); i += 1
        if i > 40: break
# punch zoom at impact frames
punch = '+'.join(f"gt(in,{int(t*30)})*lt(in,{int(t*30)+12})*(1-(in-{int(t*30)})/12)" for t in spec['impacts'])
zexpr = f"1.04+0.08*abs(sin(in/{total_dur*30}*3.1416*2))+0.12*({punch})"
bgfilter = (f"[0:v]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,trim=0:{total_dur},setpts=PTS-STARTPTS,"
            f"zoompan=z='{zexpr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)+(zoom-1)*30':d=1:s=1080x1920:fps=30,"
            f"eq=contrast=1.08:saturation=1.15,fade=t=in:st=0:d=0.3,fade=t=out:st={total_dur-0.6}:d=0.6[bg];"
            f"[bg][1:v]overlay=0:0:format=auto:shortest=1[v]")

# --- 4. sfx events ---
sfxdir = os.path.join(W, 'sfx')
ev = []  # (file, ms, vol)
def add(name, t, vol):
    p = os.path.join(sfxdir, name + '.wav')
    if os.path.exists(p): ev.append((p, int(t*1000), vol))
add('hook_impact', segs[0]['t'], 0.6)
for k in segs[0].get('kin', []):
    if k[2]: add('hook_hit', k[1], 0.5)
for s in segs:
    if s.get('step'):
        add('whoosh_fast', s['t'], 0.55); add('pop', s['t']+0.38, 0.5)
    if s.get('stat'): add('shutter', s['t'], 0.4)
    if s.get('cta'):
        add('riser', max(0, s['t']-1.2), 0.35); add('success', s['t'], 0.55); add('ding', s['t']+0.4, 0.45)
inputs = ['-i', os.path.join(W, 'bg', '_concat.mp4'), '-framerate', '30', '-i', os.path.join(frames, 'f%04d.png'), '-i', narr]
# make concat file
run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-t', str(total_dur+1), os.path.join(W, 'bg', '_concat.mp4')])
af = []
labels = ['[n]']
af.append('[2:a]volume=1.0[n]')
for i, (p, ms, vol) in enumerate(ev):
    inputs += ['-i', p]
    af.append(f'[{3+i}:a]adelay={ms}|{ms},volume={vol}[s{i}]'); labels.append(f'[s{i}]')
af.append(''.join(labels) + f'amix=inputs={len(labels)}:normalize=0:duration=longest,apad,atrim=0:{total_dur},loudnorm=I=-14:TP=-1.5:LRA=11[a]')
out = os.path.join(W, 'out.mp4')
run(['ffmpeg', '-loglevel', 'error', '-y'] + inputs + ['-filter_complex', bgfilter + ';' + ';'.join(af),
     '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30',
     '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', str(total_dur), out])
# contact sheet for a quick visual check
ts = [segs[0]['t']+0.6] + [s['t']+0.9 for s in segs[1:]]
sheet = []
for i, t in enumerate(ts[:7]):
    run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(t), '-i', out, '-frames:v', '1', os.path.join(W, f'_c{i}.png')]); sheet.append(os.path.join(W, f'_c{i}.png'))
run(['ffmpeg', '-loglevel', 'error', '-y'] + sum([['-i', s] for s in sheet], []) + ['-filter_complex', ''.join(f'[{i}]' for i in range(len(sheet))) + f'hstack={len(sheet)},scale=2100:-1', os.path.join(W, 'check.jpg')])
print('OK', out)
