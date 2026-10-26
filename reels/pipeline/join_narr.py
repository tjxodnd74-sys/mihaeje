# Join per-sentence Typecast mp3s (download with "문장 별로 나누기") into narr.mp3 with chosen pauses,
# and write each segment's start time "t" into spec.json so build.py uses exact sentence boundaries.
# usage: python3 join_narr.py <W> <dir_with_mp3s> [gap=0.4] [long_gap=0.8]
#   spec segment field "pause": seconds of silence before that sentence (overrides gap)
#   spec segment field "parts": number of mp3 files that belong to that segment (default 1)
import sys, os, glob, json, re, subprocess
W, D = sys.argv[1], sys.argv[2]
GAP = float(sys.argv[3]) if len(sys.argv) > 3 else 0.4
LONG = float(sys.argv[4]) if len(sys.argv) > 4 else 0.8
spec = json.load(open(os.path.join(W, 'spec.json')))
segs = spec['segments']
def key(p):
    m = re.findall(r'\d+', os.path.basename(p))
    return [int(x) for x in m] if m else [0]
files = sorted(glob.glob(os.path.join(D, '*.mp3')) + glob.glob(os.path.join(D, '*.wav')), key=key)
need = sum(int(s.get('parts', 1)) for s in segs)
if len(files) != need:
    sys.exit(f'files {len(files)} != segments/parts {need}')
tmp = os.path.join(W, '_jn'); os.makedirs(tmp, exist_ok=True)
SR = 44100
def trimmed(src, dst):
    # strip leading/trailing silence, keep 40ms margin
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af',
        'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse,'
        'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse',
        '-ar', str(SR), '-ac', '1', dst], check=True)
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dst],
                                capture_output=True, text=True).stdout)
def sil(dst, d):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'anullsrc=r={SR}:cl=mono', '-t', f'{d:.3f}', dst], check=True)
lst = []; t = 0.0; fi = 0; k = 0
def add_sil(d):
    global t, k
    p = os.path.join(tmp, f's{k:03d}.wav'); k += 1; sil(p, d); lst.append(p); t += d
add_sil(0.35)
for i, s in enumerate(segs):
    if i > 0:
        add_sil(float(s.get('pause', LONG if s.get('year') and s.get('year') != segs[i-1].get('year') else GAP)))
    s['t'] = round(t, 3)
    for j in range(int(s.get('parts', 1))):
        if j: add_sil(0.3)
        p = os.path.join(tmp, f'v{k:03d}.wav'); k += 1
        d = trimmed(files[fi], p); fi += 1; lst.append(p); t += d
add_sil(0.6)
with open(os.path.join(tmp, 'list.txt'), 'w') as f:
    for p in lst: f.write(f"file '{p}'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(tmp, 'list.txt'),
                '-c:a', 'libmp3lame', '-b:a', '192k', os.path.join(W, 'narr.mp3')], check=True)
json.dump(spec, open(os.path.join(W, 'spec.json'), 'w'), ensure_ascii=False, indent=1)
print(f'narr {t:.2f}s', [s['t'] for s in segs])
