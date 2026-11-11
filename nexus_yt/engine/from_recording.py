"""Cut the user's own narration recording into per-unit wav files (recording mode, 2026-11-11).

The user reads the numbered script (make_script.py) in one take on their phone. Retakes are fine:
when a line is read twice, the LAST good reading is used. The user says "다시" before a retake; that word (and a
stray "시") is never included in a cut, and lines that start with a "다시" marker are flagged for a listen.

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
_EN = [('chatgpt', '챗지피티'), ('openai', '오픈에이아이'), ('anthropic', '앤트로픽'), ('entropic', '앤트로픽'), ('xai', '엑스에이아이'), ('ai', '에이아이'),
       ('ktx', '케이티엑스'), ('ppt', '피피티'), ('gpt', '지피티'), ('word', '워드'), ('excel', '엑셀'), ('google', '구글')]
def H(s):  # whisper writes English names in Latin letters; the script reads them in Hangul
    s = s.lower()
    for a, b in _EN: s = s.replace(a, b)
    return re.sub(r'[^가-힣a-z]', '', s)

sr = 48000
pcm = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', A.rec, '-ac', '1', '-ar', str(sr), '-af', 'highpass=f=70,afftdn=nf=-28,loudnorm=I=-18:TP=-2:LRA=11',
                                    '-f', 's16le', '-'], capture_output=True).stdout, np.int16)
a16 = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', A.rec, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                                   capture_output=True).stdout, np.float32)
from faster_whisper import WhisperModel
M = WhisperModel(A.model, device='cpu', compute_type='int8')
# transcribe in 55s windows (+5s overlap) with VAD: one long pass made whisper silently skip ~25s of speech
dur_s = len(a16) / 16000; W = []
_fr = 160; _env = np.array([20 * np.log10(np.sqrt(np.mean(a16[q * _fr:(q + 1) * _fr] ** 2)) + 1e-9) for q in range(len(a16) // _fr)])  # 10ms frames
TH = np.percentile(_env, 20) + 10  # "silence" = within 10dB of the noise floor
def _quiet(t_lo, t_hi):  # quietest 0.3s point between t_lo and t_hi (seconds)
    a, b = int(t_lo * 100), int(t_hi * 100); sm = np.convolve(_env, np.ones(30) / 30, 'same')
    return (a + int(np.argmin(sm[a:b]))) / 100 if b > a else t_lo
cuts = [0.0]
while cuts[-1] + 60 < dur_s: cuts.append(_quiet(cuts[-1] + 40, cuts[-1] + 55))
cuts.append(dur_s)
for st, en in zip(cuts[:-1], cuts[1:]):  # windows split at pauses, so no word is cut in half
    seg = a16[int(st * 16000):int(en * 16000)]
    ss, _ = M.transcribe(seg, language='ko', beam_size=5, word_timestamps=True, condition_on_previous_text=False, vad_filter=True)
    for x in ss:
        for w in x.words:
            if re.search(r'[가-힣a-zA-Z0-9]', w.word): W.append((st + w.start, st + w.end, w.word.strip()))
W.sort()
_D = '영일이삼사오육칠팔구'
def _n2k(n):
    n = int(n)
    if n == 0: return '영'
    out = ''; units = [(10000, '만'), (1000, '천'), (100, '백'), (10, '십')]
    for u, name in units:
        q, n = divmod(n, u)
        if q: out += ('' if q == 1 and u != 10000 else _n2k(q) if u == 10000 else _D[q]) + name
    return out + (_D[n] if n else '')
def numkor(s):  # whisper writes numbers as digits; the script reads them in Korean
    s = s.replace('%', '퍼센트').replace(',', '')
    s = re.sub(r'(\d+)\.(\d+)', lambda m: _n2k(m.group(1)) + '점' + ''.join(_D[int(c)] for c in m.group(2)), s)
    return re.sub(r'\d+', lambda m: _n2k(m.group(0)), s)
WH = [H(numkor(w[2])) for w in W]
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

# boundary repair: whisper's word timings and misheard words (e.g. "챗GPT는" -> "채취pt는") made windows start late
# or end early. Grow each window into neighbouring unowned words when the gap is short and the match does not get worse.
owner = [None] * N
for k, s, i, j in res:
    if s >= 0.5:
        for q in range(i, j + 1): owner[q] = k
isre = lambda q: WH[q] in ('다시', '시')
res2 = []
for k, s, i, j in res:
    if s >= 0.5:
        while i > 0 and owner[i - 1] is None and not isre(i - 1) and W[i][0] - W[i - 1][1] < 0.3 and score(k, i - 1, j) > s + 1e-6:
            i -= 1; s = max(s, score(k, i, j)); owner[i] = k
        while j + 1 < N and owner[j + 1] is None and not isre(j + 1) and W[j + 1][0] - W[j][1] < 0.3 and score(k, i, j + 1) > s + 1e-6:
            j += 1; s = max(s, score(k, i, j)); owner[j] = k
    res2.append((k, s, i, j))
res = res2

rep = []
for k, s, i, j in res:
    if s < 0.5:
        rep.append(f'{k + 1:>3}  MISSING  {EXP[k]}'); continue
    # boundaries: start/end at a real pause in the audio, but NEVER cross into a neighbouring word
    # (any word: next line, a stumble, or the user's "다시" retake marker)
    lo = (W[i - 1][1] + (0.10 if isre(i - 1) else 0.03)) if i > 0 else 0.0
    hi = W[j + 1][0] - 0.03 if j + 1 < N else dur_s
    f = int(W[i][0] * 100)
    while f > lo * 100 and np.mean(_env[max(0, f - 25):f] > TH) > 0.1: f -= 1   # walk back until 0.25s of silence
    t0 = max(lo, f / 100 - 0.06)
    if i > 0 and isre(i - 1):  # right after "다시": whisper often ends that word early -> start at the quietest point after it
        a_, b_ = int((W[i - 1][1]) * 100), int((W[i][0] + 0.05) * 100)
        if b_ > a_: t0 = max(t0, (a_ + int(np.argmin(_env[a_:b_]))) / 100)
    f = int(W[j][1] * 100); quiet = False
    while f < hi * 100:
        if np.mean(_env[f:f + 25] > TH) <= 0.1: quiet = True; break          # walk forward until 0.25s of silence
        f += 1
    t1 = min(hi, f / 100 + 0.2) if quiet else min(hi, (W[j][1] + hi) / 2 + 0.05)
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
