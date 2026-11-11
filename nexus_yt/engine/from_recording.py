"""Cut the user's own narration recording into per-unit wav files (recording mode, 2026-11-11).

The user reads the numbered script (make_script.py) in one take on their phone. Retakes are fine:
when a line is read twice, the LAST good reading is used.

usage: python3 from_recording.py <recording> [--units rec_units.json | units.json] [--out ln/u] [--report rec_report.txt]
  units file: list of {"text": ...} (long-form units.json) or a plain list of strings (shorts).
Writes <out>{k}.wav (48k mono, ~0.08s before first word, ~0.25s after last word) for build_voice.py / short_v4.
Prints a score per unit; score < 0.6 means "missing or unclear — ask the user to re-read that number".
"""
import sys, json, re, subprocess, difflib, argparse
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('rec'); ap.add_argument('--units', default='units.json')
ap.add_argument('--out', default='ln/u'); ap.add_argument('--report', default='rec_report.txt')
ap.add_argument('--model', default='medium')
A = ap.parse_args()

U = json.load(open(A.units))
EXP = [u['text'] if isinstance(u, dict) else u for u in U]
OUT = [u.get('out') if isinstance(u, dict) else None for u in U]  # optional per-item output path (rec_units.json from make_script.py)
H = lambda s: re.sub(r'[^가-힣a-z]', '', s.lower().replace('ai', '에이아이'))

sr = 48000
pcm = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', A.rec, '-ac', '1', '-ar', str(sr), '-af', 'highpass=f=70,afftdn=nf=-28,loudnorm=I=-18:TP=-2:LRA=11',
                                    '-f', 's16le', '-'], capture_output=True).stdout, np.int16)
a16 = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', A.rec, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                                   capture_output=True).stdout, np.float32)
from faster_whisper import WhisperModel
M = WhisperModel(A.model, device='cpu', compute_type='int8')
segs, _ = M.transcribe(a16, language='ko', beam_size=5, word_timestamps=True, condition_on_previous_text=False)  # no initial_prompt: it made whisper drop the opening words
W = [(w.start, w.end, w.word.strip()) for s in segs for w in s.words if H(w.word)]
WH = [H(w[2]) for w in W]
N = len(W)


def score(k, i, j):
    return difflib.SequenceMatcher(None, H(EXP[k]), ''.join(WH[i:j + 1])).ratio()


def best_window(k, lo, hi):
    """best (score,i,j) for unit k with start in [lo,hi)"""
    n = len(H(EXP[k])); best = (0, lo, lo)
    for i in range(lo, min(hi, N)):
        acc = 0
        for j in range(i, N):
            acc += len(WH[j])
            if acc > n * 1.6 + 4: break
            if acc < n * 0.5: continue
            s = score(k, i, j)
            if s > best[0]: best = (s, i, j)
    return best


res = []; p = 0
for k in range(len(EXP)):
    s, i, j = best_window(k, p, p + 40)
    # retake check: same line read again before the next line starts -> keep the later reading
    if s >= 0.5 and k + 1 < len(EXP):
        nxt = best_window(k + 1, j + 1, j + 41)
        s2, i2, j2 = best_window(k, j + 1, nxt[1]) if nxt[1] > j + 1 else (0, 0, 0)
        if s2 >= max(0.6, s - 0.08) and j2 < nxt[1]:
            s, i, j = s2, i2, j2
    res.append((k, s, i, j))
    if s >= 0.5: p = j + 1

rep = []
for k, s, i, j in res:
    if s < 0.5:
        rep.append(f'{k + 1:>3}  MISSING  {EXP[k]}'); continue
    t0 = max(0, W[i][0] - 0.08); t1 = W[j][1] + 0.25
    if j + 1 < N: t1 = min(t1, W[j + 1][0] - 0.03)
    seg = pcm[int(t0 * sr):int(t1 * sr)].astype(np.float32)
    f = int(0.01 * sr); seg[:f] *= np.linspace(0, 1, f); g = int(0.06 * sr); seg[-g:] *= np.linspace(1, 0, g)
    import wave
    w = wave.open(OUT[k] or f'{A.out}{k}.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes(np.clip(seg, -32768, 32767).astype(np.int16).tobytes()); w.close()
    heard = ' '.join(x[2] for x in W[i:j + 1])
    flag = 'OK ' if s >= 0.75 else ('CHK' if s >= 0.6 else 'BAD')
    rep.append(f'{k + 1:>3}  {flag} {s:.2f}  {t0:7.2f}-{t1:7.2f}  {EXP[k]}  ||  {heard}')
open(A.report, 'w').write('\n'.join(rep) + '\n')
print('\n'.join(rep))
bad = [r for r in rep if 'MISSING' in r or ' BAD ' in r]
print(f'\n{len(EXP)} units, {len(bad)} need a re-read')
