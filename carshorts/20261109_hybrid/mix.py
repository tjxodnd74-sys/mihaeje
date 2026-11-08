import json, subprocess
S = json.load(open('spec_full.json')); t0 = [s['t0'] for s in S['segs']]; TOTAL = S['total']
SFX = '/home/claude/mihaeje/reels/pipeline/sfx/'
ev = [  # (time, file, volume)
 (0.02, 'whoosh_soft', .35),
 (t0[4] + .02, 'whoosh_soft', .35), (t0[5] + .05, 'cash', .5), (t0[6] + .02, 'whoosh_soft', .35),
 (t0[8] + .02, 'whoosh_soft', .35), (t0[9] + .05, 'ding', .4), (t0[10] + .02, 'whoosh_soft', .35),
 (t0[11] + .5, 'pop', .3), (t0[11] + .95, 'pop', .3), (t0[11] + 1.4, 'pop', .3), (t0[11] + 1.85, 'pop', .3), (t0[11] + 2.4, 'ding', .35),
 (t0[13] + .4, 'pop', .4), (t0[14] + .4, 'pop', .4), (t0[15] + .4, 'pop', .4),
 (t0[16] + .3, 'ding', .35), (t0[17] + .3, 'ding', .35), (t0[18] + .3, 'click', .4),
 (t0[19] + 1.3, 'cash', .45), (t0[20] + .2, 'success', .35),
]
# odometer ticks while the 본전 게이지 fills (seg 10)
d10 = t0[11] - t0[10]; k = t0[10] + .35
while k < t0[10] + d10 - .6: ev.append((k, 'tick', .18)); k += .22
ev.append((t0[10] + d10 - .55, 'ding', .45))
inp = ['-i', 'narr.wav', '-i', 'bgmpack/bgm_vlog_beat.mp3']
flt = ['[0:a]loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100,aformat=channel_layouts=stereo[v]',
       f'[1:a]atrim=0:{TOTAL},asetpts=PTS-STARTPTS,loudnorm=I=-31:TP=-6,aresample=44100,aformat=channel_layouts=stereo,afade=t=in:d=0.8,afade=t=out:st={TOTAL-1.8}:d=1.8[b]']
lab = ['[v]', '[b]']
for i, (t, f, vol) in enumerate(ev):
    inp += ['-i', SFX + f + '.wav']; n = i + 2; ms = int(t * 1000)
    flt.append(f'[{n}:a]aresample=44100,aformat=channel_layouts=stereo,volume={vol},adelay={ms}|{ms}[s{i}]'); lab.append(f'[s{i}]')
flt.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,atrim=0:{TOTAL}[a]')
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + inp + ['-filter_complex', ';'.join(flt), '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', 'audio.m4a'], check=True)
print('audio ok', len(ev))
