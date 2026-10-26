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
# Boundaries: choose sentence starts among pause-ends so that every sentence's duration best
# matches its expected share (by narration text length), optimising all boundaries together (DP).
# Commas inside a sentence ("첫째, ...") also leave pauses — sometimes longer than the pause
# between sentences — so greedy or "merge smallest gaps" approaches mis-assign them.
import re as _re
def _clen(s_):
    t = s_.get('say') or s_['cap']
    return max(1, len(_re.sub(r'[|/\s,.!?]', '', t)))
if not chunks: chunks = [[0.3, dur]]
m = len(chunks)
lens = [_clen(x) for x in segs]
tot = sum(lens)
speech = sum(b - a for a, b in chunks)
exp = [speech * l / tot for l in lens]
INF = float('inf')
# cost[i][j]: best cost placing first i segments over first j chunks
cost = [[INF] * (m + 1) for _ in range(n + 1)]
back = [[0] * (m + 1) for _ in range(n + 1)]
cost[0][0] = 0.0
for i in range(1, n + 1):
    for j in range(i, m - (n - i) + 1):
        for k in range(i - 1, j):
            if cost[i-1][k] == INF: continue
            d = sum(chunks[q][1] - chunks[q][0] for q in range(k, j))
            c = cost[i-1][k] + ((d - exp[i-1]) / max(exp[i-1], 0.6)) ** 2
            # a tiny trailing fragment (e.g. "둘째,") belongs to the next sentence's start, not this one's end
            if j - k > 1 and (chunks[j-1][1] - chunks[j-1][0]) < 0.6: c += 3.0
            if c < cost[i][j]: cost[i][j] = c; back[i][j] = k
if n <= m and cost[n][m] < INF:
    cuts = []; j = m
    for i in range(n, 0, -1):
        k = back[i][j]; cuts.append(k); j = k
    cuts = cuts[::-1]
    starts = [chunks[k][0] for k in cuts]
else:
    print(f'경고: 무음 구간({m}) < 문장 수({n}) — 글자 수 비율로 나눔')
    starts = []; t0 = chunks[0][0]
    for i in range(n): starts.append(t0 + speech * sum(lens[:i]) / tot)
if all('t' in x for x in segs):
    starts = [float(x['t']) for x in segs]   # manual override
chunks = [[a, (starts[i+1] if i+1 < n else dur)] for i, a in enumerate(starts)]
for s, (a, b) in zip(segs, chunks):
    s['t'] = round(a, 3)
# each segment ends where the next begins; last one runs to the end
for i, s in enumerate(segs):
    s['e'] = segs[i+1]['t'] if i+1 < n else round(dur + 1.5, 3)
# kinetic words: relative → absolute
for s in segs:
    if isinstance(s.get('kin'), list):
        s['kin'] = [[k[0], round(s['t'] + k[1], 3), bool(k[2]) if len(k) > 2 else False] for k in s['kin']]
for s_ in segs:
    if s_.get('clip'): s_['cut'] = True

# --- caption chunks timed to the actual narration ---
# The caption is split into short phrases (" / " forces a break). Each phrase's start time comes from
# where its words occur in the spoken text (say), mapped onto the segment's real speech time
# (internal pauses skipped), then snapped to a nearby pause end. Timing by caption character count
# drifts because captions abbreviate ("F" is read "에프", "확인" vs "확인하세요").
import difflib
CMAX = spec.get('capMax', 12)
CAP_LEAD = spec.get('capLead', 0.2)   # phrases appear slightly before the words are spoken (reads as in-sync)
SEG_LEAD = spec.get('segLead', 0.12)  # cuts/new sentences start a touch before the voice
sdf = subprocess.run(['ffmpeg', '-i', narr, '-af', 'silencedetect=n=-35dB:d=0.1', '-f', 'null', '-'], capture_output=True, text=True).stderr
fsil = list(zip([float(x) for x in re.findall(r'silence_start: ([\d.]+)', sdf)], [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sdf)]))
sdf2 = subprocess.run(['ffmpeg', '-i', narr, '-af', 'silencedetect=n=-28dB:d=0.06', '-f', 'null', '-'], capture_output=True, text=True).stderr
fsil2 = list(zip([float(x) for x in re.findall(r'silence_start: ([\d.]+)', sdf2)], [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sdf2)]))
_norm = lambda x: _re.sub(r'[|/\s,.!?·~\-]', '', x)
def cap_groups(cap):
    on = False; toks = []
    for w in cap.split(' '):
        if w == '/': toks.append(None); continue
        st = w.startswith('|')
        if st: on = True
        hl = on or ('|' in w)
        k = w.count('|'); w = w.replace('|', '')
        if k == 2 or (not st and k == 1): on = False
        if w: toks.append((w, hl))
    groups, cur, ln = [], [], 0
    def flush():
        nonlocal cur, ln
        if cur: groups.append(cur)
        cur, ln = [], 0
    for t in toks:
        if t is None: flush(); continue
        if cur and ln + len(t[0]) > CMAX: flush()
        cur.append(t); ln += len(t[0])
        if _re.search(r'[,，]$', t[0]) and ln >= 4: flush()
    flush()
    if len(groups) > 1 and sum(len(w) for w, _ in groups[-1]) <= 3:
        last = groups.pop(); groups[-1] = groups[-1] + last
    return groups
for i, s_ in enumerate(segs):
    if s_.get('kin'): continue   # hook shows the whole sentence big, no chunks
    groups = cap_groups(s_['cap'])
    t0 = s_['t']; e0 = s_['e'] if i + 1 < n else dur
    # speech end = start of the trailing pause before the next segment
    tail = [a for a, b in fsil if t0 + 0.3 < a < e0 + 0.05 and b >= e0 - 0.08]
    t1 = min(tail) if tail else e0
    # align spoken words to speech islands (gaps between short pauses) by speaking rate (DP).
    # A pause may be a word gap or a stop-consonant gap inside a word, so islands can be grouped;
    # every group must end on a word boundary. Result: syllable position -> time.
    sayraw = s_.get('say') or s_['cap']
    sayn = _norm(sayraw)
    L = max(1, len(sayn))
    wb = []; acc = 0
    for wd in sayraw.split():
        acc += len(_norm(wd)); wb.append(acc)
    wb = sorted(set(x for x in wb if 0 < x < L))
    commas = set(); acc = 0
    for part in _re.split(r'[,，]', sayraw)[:-1]:
        acc += len(_norm(part)); commas.add(acc)
    gaps = [(a, b) for a, b in fsil2 if t0 + 0.1 < a and b < t1 - 0.05]
    isl = []; cur0 = t0
    for a, b in gaps:
        if a - cur0 > 0.04: isl.append((cur0, a))
        cur0 = b
    isl.append((cur0, t1))
    M = len(isl)
    spt = sum(b - a for a, b in isl)
    rate = spt / L
    bps = [0] + wb + [L]          # allowed group ends (syllable positions)
    K = len(bps)
    INF2 = float('inf')
    f = [[INF2] * K for _ in range(M + 1)]; bk = [[None] * K for _ in range(M + 1)]
    f[0][0] = 0.0
    for j in range(1, M + 1):
        for kb in range(1, K):
            for j0 in range(j):
                d = sum(isl[q][1] - isl[q][0] for q in range(j0, j))
                gp = sum(((isl[q+1][0] - isl[q][1]) / 0.1) ** 2 for q in range(j0, j - 1))   # pauses inside a group = inside a word: penalise
                for k0 in range(kb):
                    if f[j0][k0] == INF2: continue
                    syl = bps[kb] - bps[k0]
                    e = rate * syl
                    c = f[j0][k0] + ((d - e) / max(0.12, 0.25 * e)) ** 2 + gp
                    if j < M and bps[kb] in commas: c -= 3.0      # a pause right after a comma is the comma pause
                    if c < f[j][kb]: f[j][kb] = c; bk[j][kb] = (j0, k0)
    anchors = [(0, t0)]
    if f[M][K - 1] < INF2:
        segs_ = []; j, kb = M, K - 1
        while j > 0:
            j0, k0 = bk[j][kb]; segs_.append((j0, j, bps[k0], bps[kb])); j, kb = j0, k0
        for j0, j1, p0, p1 in reversed(segs_):
            if p0 > 0: anchors.append((p0, isl[j0][0]))
    anchors.append((L, t1))
    def char_time(c):
        for (c0, a0), (c1, a1) in zip(anchors, anchors[1:]):
            if c <= c1: return a0 + (a1 - a0) * (c - c0) / max(1, c1 - c0)
        return t1
    capn = ''.join(_norm(w) for g in groups for w, _ in g)
    sm = difflib.SequenceMatcher(None, capn, sayn, autojunk=False)
    blocks = sm.get_matching_blocks()
    def cap2say(ci):
        prev = 0
        for a, b, sz in blocks:
            if sz and a <= ci < a + sz: return b + (ci - a)
            if sz and a > ci: return prev   # unmatched (e.g. "F" vs "에프"): right after the previous match
            if sz: prev = b + sz
        return len(sayn)
    out, ci = [], 0
    for gi, g in enumerate(groups):
        if gi == 0: tt = t0
        else:
            sc = cap2say(ci)
            hit = [a for c, a in anchors if c == sc]
            tt = hit[0] if hit else char_time(sc)
            tt = max(tt - CAP_LEAD, out[-1]['t'] + 0.45)
        html = ''.join(f'<span class="w{" hl" if hl else ""}">{_re.sub(r",$", "", w)}</span>' for w, hl in g)
        out.append({'t': round(tt, 3), 'html': html})
        ci += sum(len(_norm(w)) for w, _ in g)
    s_['capChunks'] = out
    if os.environ.get('CAPDBG'): print('cap', i+1, round(t1,2), [(c, round(a,2)) for c, a in anchors])
# shift sentence starts (cut + caption) slightly ahead of the voice
for i_, s_ in enumerate(segs):
    nt = round(max(0.0, s_['t'] - (SEG_LEAD if i_ else 0)), 3)
    if s_.get('capChunks'): s_['capChunks'][0]['t'] = nt
    s_['t'] = nt
for i_, s_ in enumerate(segs):
    s_['e'] = segs[i_+1]['t'] if i_+1 < n else s_['e']
total_dur = math.ceil(dur + 1.2)
spec['duration'] = total_dur
# impacts: segment start of hook, each step, cta + hook's yellow words
imp = [segs[0]['t']] + [s['t'] for s in segs if s.get('step')] + [s['t'] for s in segs if s.get('cta')]
for k in (segs[0].get('kin') if isinstance(segs[0].get('kin'), list) else []):
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
await p.goto('file://'+{json.dumps(os.path.join(HERE, {'vector':'template_vector.html','fullscreen':'template_full.html'}.get(spec.get('style'),'template.html')))});await p.evaluate(()=>document.fonts.ready);
for(let i=0;i<n;i++){{await p.evaluate(t=>window.seek(t),i/fps);await p.screenshot({{path:{json.dumps(frames)}+'/f'+String(i).padStart(4,'0')+'.png',omitBackground:{'false' if spec.get('style')=='vector' else 'true'}}});}}
await b.close();}})();
"""
open(os.path.join(W, '_render.js'), 'w').write(render_js)
run(['node', os.path.join(W, '_render.js')], cwd=HERE)

# --- 3. background: concat clips, cut per segment with punch zooms ---
VECTOR = spec.get('style')=='vector'
bgs = sorted(glob.glob(os.path.join(W, 'bg', '*.mp4')))
if not bgs and not VECTOR: print('bg/*.mp4 없음'); sys.exit(1)
# build a concat of clips scaled/cropped to 1080x1920, loop if too short
lst = os.path.join(W, '_bg.txt')
if VECTOR or spec.get('style')=='fullscreen': bgs=[]
with open(lst, 'w') as f:
    L = 0.0; i = 0
    while bgs and L < total_dur + 2:
        b = bgs[i % len(bgs)]
        d = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', b]).stdout.strip())
        f.write(f"file '{b}'\n"); L += min(d, 8); i += 1
        if i > 40: break
# punch zoom at impact frames
punch = '+'.join(f"gt(in,{int(t*30)})*lt(in,{int(t*30)+12})*(1-(in-{int(t*30)})/12)" for t in spec['impacts'])
zexpr = f"1.04+0.08*abs(sin(in/{total_dur*30}*3.1416*2))+0.12*({punch})"
bgfilter = (f"[0:v]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,trim=0:{total_dur},setpts=PTS-STARTPTS,"
            f"zoompan=z='{zexpr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)+(zoom-1)*30':d=1:s=1080x1920:fps=30,"
            f"eq=contrast=1.08:saturation=1.15,fade=t=out:st={total_dur-0.6}:d=0.6[bg];"
            f"[bg][1:v]overlay=0:0:format=auto:shortest=1[v]")

# --- 4. sfx events ---
sfxdir = os.path.join(W, 'sfx')
if not os.path.isdir(sfxdir) or not os.listdir(sfxdir): sfxdir = os.path.join(HERE, 'sfx')   # bundled copy in the repo
ev = []  # (file, ms, vol)
def add(name, t, vol):
    p = os.path.join(sfxdir, name + '.wav')
    if os.path.exists(p): ev.append((p, int(t*1000), vol))
add('hook_impact', segs[0]['t'], 0.6)
for k in (segs[0].get('kin') if isinstance(segs[0].get('kin'), list) else []):
    if k[2]: add('hook_hit', k[1], 0.5)
for s in segs:
    if s.get('step'):
        add('whoosh_fast', s['t'], 0.55); add('pop', s['t']+0.38, 0.5)
    if s.get('stat'): add('shutter', s['t'], 0.4)
    if s.get('cta'):
        add('riser', max(0, s['t']-1.2), 0.35); add('success', s['t'], 0.55); add('ding', s['t']+0.4, 0.45)
FULL = spec.get('style')=='fullscreen'
STILLS = bool(spec.get('stills'))   # photo-based series (no zoompan jitter, no grain)
CLIPAUD = float(spec.get('clipAudio') or 0)   # >0: mix each clip's own sound (e.g. AI engine/road sfx) at this volume
if FULL:
    # quieter sound design: a soft whoosh on cuts, a tick on numbers, one success at the end
    ev.clear()
    for s_ in segs:
        if s_.get('cut') and s_ is not segs[0]: add('whoosh_soft', s_['t'], 0.3)
        if s_.get('stat'): add('tick', s_['t']+0.1, 0.35)
        if s_.get('cta'): add('success', s_['t'], 0.4)
    add('hook_impact', segs[0]['t'], 0.35)
    # one trimmed piece per clip change; each piece spans until the next segment that names a clip
    pieces=[]; cur=None; start=0.0
    for i,s_ in enumerate(segs):
        if s_.get('clip'):
            if cur: pieces.append((cur,start,s_['t'],cstart,ccx))
            cur=s_['clip']; start=s_['t'] if pieces or i>0 else 0.0; cstart=float(s_.get('start',0.8)); ccx=float(s_.get('cx',0.5))
    if cur: pieces.append((cur,start,total_dur,cstart,ccx))
    if pieces and pieces[0][1]>0: pieces[0]=(pieces[0][0],0.0,pieces[0][2],pieces[0][3],pieces[0][4])
    parts=[]
    for j,(clip,a,b,cstart,ccx) in enumerate(pieces):
        src=os.path.join(W,'bg',clip); L=b-a
        cd=float(run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',src]).stdout.strip())
        off = max(0.0, min(cd-L-0.1, cstart))  # 'start' in spec = where to begin inside the clip
        pf=os.path.join(W,f'_p{j}.mp4')
        # gentle push-in over the piece + 6-frame punch at the cut
        n=int(round(L*30))
        z=f"1.02+0.06*(in/{max(n,1)})+0.10*lt(in,7)*(1-in/7)"
        # stills mode (photo series): clips already carry a smooth subpixel push-in; ffmpeg zoompan on a still
        # snaps to whole pixels and visibly shakes, so pass the clip through untouched
        slow = (L + 0.15) / max(cd - off, 0.1) if STILLS and cd - off < L + 0.1 else 1.0   # clip shorter than the sentence: stretch it slightly instead of running out
        vf = (f"setpts={slow:.4f}*(PTS-STARTPTS),fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,trim=0:{L},setpts=PTS-STARTPTS" if STILLS else
              f"fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:'max(0,min(iw-1080,iw*{ccx}-540))':'(ih-1920)/2',zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,trim=0:{L},setpts=PTS-STARTPTS")
        if CLIPAUD:   # keep each clip's own sound (AI driving clips); silent clips get a silent track so concat stays uniform
            has_a = 'audio' in run(['ffprobe','-v','error','-show_entries','stream=codec_type','-of','csv=p=0',src]).stdout
            ain = ['-f','lavfi','-t',str(L+0.2),'-i','anullsrc=r=44100:cl=stereo'] if not has_a else []
            amap = '1:a' if not has_a else '0:a'
            run(['ffmpeg','-loglevel','error','-y','-ss',str(off),'-i',src]+ain+['-t',str(L),'-vf',vf,'-map','0:v','-map',amap,
                 '-af',f'atrim=0:{L},asetpts=PTS-STARTPTS,afade=t=in:d=0.08,afade=t=out:st={max(0,L-0.15)}:d=0.15',
                 '-c:a','aac','-ar','44100','-ac','2','-c:v','libx264','-preset','veryfast','-crf','16',pf])
            parts.append(pf); continue
        run(['ffmpeg','-loglevel','error','-y','-ss',str(off),'-i',src,'-t',str(L+0.2),'-vf',vf,
             '-an','-c:v','libx264','-preset','veryfast','-crf','16',pf])
        parts.append(pf)
    with open(lst,'w') as f:
        for pf in parts: f.write(f"file '{pf}'\n")
    run(['ffmpeg','-loglevel','error','-y','-f','concat','-safe','0','-i',lst,'-c','copy',os.path.join(W,'bg','_concat.mp4')])
    inputs = ['-i', os.path.join(W, 'bg', '_concat.mp4'), '-framerate', '30', '-i', os.path.join(frames, 'f%04d.png'), '-i', narr]
    bgfilter = (f"[0:v]trim=0:{total_dur},setpts=PTS-STARTPTS,eq=contrast=1.06:saturation=0.92:brightness=-0.02,"
                f"colorbalance=bs=0.04:bh=-0.03,{'' if STILLS else 'noise=alls=7:allf=t+u,'}"
                f"fade=t=out:st={total_dur-0.6}:d=0.6[bg];[bg][1:v]overlay=0:0:format=auto:shortest=1[v]")
elif VECTOR:
    inputs = ['-framerate', '30', '-i', os.path.join(frames, 'f%04d.png'), '-framerate', '30', '-i', os.path.join(frames, 'f%04d.png'), '-i', narr]
    bgfilter = f"[0:v]format=yuv420p,fade=t=out:st={total_dur-0.6}:d=0.6[v]"
else:
  inputs = ['-i', os.path.join(W, 'bg', '_concat.mp4'), '-framerate', '30', '-i', os.path.join(frames, 'f%04d.png'), '-i', narr]
  run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-t', str(total_dur+1), os.path.join(W, 'bg', '_concat.mp4')])
af = []
labels = ['[n]']
af.append('[2:a]volume=1.0[n]')
if FULL and CLIPAUD:
    af.append(f'[0:a]volume={CLIPAUD},afade=t=out:st={total_dur-0.8}:d=0.8[ca]'); labels.append('[ca]')
BED = spec.get('bed')   # one continuous ambience under the whole video (e.g. "car_bed"), instead of per-clip sound that cuts at every scene change
if BED:
    bp = os.path.join(sfxdir, BED + '.wav')
    if not os.path.exists(bp): bp = os.path.join(HERE, 'sfx', BED + '.wav')
    if os.path.exists(bp):
        bi = len([x for x in inputs if x == '-i'])
        inputs += ['-stream_loop', '-1', '-i', bp]
        af.append(f"[{bi}:a]atrim=0:{total_dur},asetpts=PTS-STARTPTS,volume={float(spec.get('bedVolume', 0.5))},afade=t=in:d=0.6,afade=t=out:st={total_dur-1.0}:d=1.0[bed]"); labels.append('[bed]')
for i, (p, ms, vol) in enumerate(ev):
    k_in = len([x for x in inputs if x == '-i'])
    inputs += ['-i', p]
    af.append(f'[{k_in}:a]adelay={ms}|{ms},volume={vol}[s{i}]'); labels.append(f'[s{i}]')
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
# --- cover (thumbnail) ---
if spec.get('cover'):
    C=dict(spec['cover'])
    if C.get('clip'):
        cp=os.path.join(W,'_cover_bg.jpg')
        run(['ffmpeg','-loglevel','error','-y','-ss',str(C.get('start',2)),'-i',os.path.join(W,'bg',C['clip']),'-frames:v','1','-vf',f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:'max(0,min(iw-1080,iw*{float(C.get('cx',0.5))}-540))':'(ih-1920)/2'",cp])
        C['photo']=cp
    cjs=os.path.join(W,'_cover.js')
    open(cjs,'w').write(f"""
const {{ chromium }} = require('playwright');
(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1920}}}});
await p.addInitScript(c=>{{window.COVER=c}},{json.dumps(C,ensure_ascii=False)});
await p.goto('file://'+{json.dumps(os.path.join(HERE,'cover.html'))});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await p.screenshot({{path:{json.dumps(os.path.join(W,'cover.jpg'))},type:'jpeg',quality:92}});await b.close();}})();""")
    run(['node',cjs],cwd=HERE)
    print('COVER', os.path.join(W,'cover.jpg'))
print('OK', out)
