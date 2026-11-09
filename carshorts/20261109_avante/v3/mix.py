import json, subprocess
S = json.load(open('spec_full.json')); TOTAL = S['total']; G = {g['type']: g for g in S['gfx']}
SFX = '/home/claude/mihaeje/reels/pipeline/sfx/'
ev = [(0.0, 'hook_impact', .45)] + [(s['t0'], 'whoosh_fast' if s.get('flash') or s.get('shake') else 'whoosh_soft', .32) for s in S['shots'][1:]]
g = G['stamp']; ev += [(g['t0'], 'hook_hit', .5), (g['t0'] + .1, 'cash', .35)]
g = G['price']; ev += [(g['t0'], 'pop', .4), (g['t0'] + g['strikeAt'], 'whoosh_snap', .4), (g['t0'] + g['strikeAt'] + .28, 'ding', .45)]
g = G['count']; k = g['t0'] + .1
while k < g['t0'] + 1.0: ev.append((k, 'tick', .16)); k += .09
ev.append((g['t0'] + 1.0, 'ding', .35))
g = G['sales']; ev += [(g['t0'] + 1.3, 'alert', .32)]
g = G['ask']; ev += [(g['t0'], 'pop', .45)]
inp = ['-i', 'narr.wav', '-i', '../bgm.mp3']
flt = ['[0:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100,aformat=channel_layouts=stereo[v]',
       f'[1:a]atrim=0:{TOTAL},asetpts=PTS-STARTPTS,loudnorm=I=-30:TP=-6,aresample=44100,aformat=channel_layouts=stereo,afade=t=out:st={TOTAL-1.2}:d=1.2[b]']
lab = ['[v]', '[b]']
for i, (t, f, vol) in enumerate(ev):
    inp += ['-i', SFX + f + '.wav']; n = i + 2; ms = max(0, int(t * 1000))
    flt.append(f'[{n}:a]aresample=44100,aformat=channel_layouts=stereo,volume={vol},adelay={ms}|{ms}[s{i}]'); lab.append(f'[s{i}]')
flt.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,atrim=0:{TOTAL}[a]')
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + inp + ['-filter_complex', ';'.join(flt), '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', 'audio.m4a'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'video_silent.mp4', '-i', 'audio.m4a', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', 'final.mp4'], check=True)
print('ok', len(ev))
