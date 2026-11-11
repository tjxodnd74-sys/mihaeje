"""Make the recording script for the user (recording mode, 2026-11-11).

python3 make_script.py [shorts.json]
  - long-form lines come from units.json (run lines.py first; texts already use R readings: 5.2 -> 오 점 이)
  - shorts.json (optional): list of shorts lines (display text; the user reads it as written)
  - lines.py may define HINT=[('Pickle, Inc.','피클 인크'),...] for words that need a reading hint, e.g. ["클로드한테 욕하면,", ...]
Writes 녹음대본.txt (send this to the user) and rec_units.json (for from_recording.py; long -> ln/u{k}.wav, shorts -> ln_s/s{k}.wav).
"""
import json, sys, os, runpy
U = json.load(open('units.json'))
_g = runpy.run_path('lines.py'); _S = dict(_g['S']); HINT = _g.get('HINT', [])
def show(u):  # what the user reads: natural display text (AI, KTX, 8% as people say them) + reading hints for tricky words
    t = ', '.join(_S[u['sc']][j] for j in u['lines'])
    hs = [f'{a} → {b}' for a, b in HINT if a in t]
    return t + (f'   (읽기: {", ".join(hs)})' if hs else '')
SH = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else []
os.makedirs('ln', exist_ok=True); os.makedirs('ln_s', exist_ok=True)
rec = [{'text': u['text'], 'out': f'ln/u{k}.wav'} for k, u in enumerate(U)]
rec += [{'text': t, 'out': f'ln_s/s{k}.wav'} for k, t in enumerate(SH)]
json.dump(rec, open('rec_units.json', 'w'), ensure_ascii=False, indent=0)
L = ['🎙️ 녹음 대본 — 폰으로 한 번에 쭉 읽어서 보내 주세요',
     '· 번호는 읽지 마세요. 줄 사이에 반 박자 쉬어 주세요.',
     '· 틀리면 멈추지 말고 그 줄만 다시 읽고 이어 가세요 (뒤에 읽은 걸 써요).',
     '· 평소 말하듯 읽으면 돼요. 헷갈리는 건 옆에 (읽기: …)로 적어 뒀어요. 질문은 끝을 올리고, 놀라는 줄은 세게.',
     '· 조용한 곳, 폰은 입에서 한 뼘. 음악·선풍기 끄기.', '']
sc = None; nsc = 0
for k, u in enumerate(U):
    if u['sc'] != sc:
        sc = u['sc']; nsc += 1; L.append(f'— 장면 {nsc} —' if sc != 'outro' else '— 마무리 —')
    L.append(f'{k + 1}. {show(u)}')
if SH:
    L += ['', '— 쇼츠 (이어서 읽어 주세요, 조금 더 빠르고 세게) —']
    L += [f'S{k + 1}. {t}' for k, t in enumerate(SH)]
open('녹음대본.txt', 'w', encoding='utf-8-sig').write('\r\n'.join(L) + '\r\n')
print('\n'.join(L)); print(f'\n{len(U)} long-form units + {len(SH)} shorts lines')
