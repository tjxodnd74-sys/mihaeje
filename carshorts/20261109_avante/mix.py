import json, subprocess
S = json.load(open('spec_full.json')); t0 = [s['t0'] for s in S['segs']]; TOTAL = S['total']
SFX = '/home/claude/mihaeje/reels/pipeline/sfx/'
ev = [(0.02, 'hook_hit', .35)] + [(t + .02, 'whoosh_soft', .3) for t in t0[1:]]
ev += [(t0[i] + .2, 'pop', .35) for i in (2, 3, 4, 5)] + [(t0[2] + .45, 'cash', .4), (t0[6] + 1.5, 'alert', .3)]
inp = ['-i', 'narr.wav', '-i', 'bgm.mp3']
flt = ['[0:a]loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100,aformat=channel_layouts=stereo[v]',
       f'[1:a]atrim=0:{TOTAL},asetpts=PTS-STARTPTS,loudnorm=I=-31:TP=-6,aresample=44100,aformat=channel_layouts=stereo,afade=t=in:d=0.5,afade=t=out:st={TOTAL-1.5}:d=1.5[b]']
lab = ['[v]', '[b]']
for i, (t, f, vol) in enumerate(ev):
    inp += ['-i', SFX + f + '.wav']; n = i + 2; ms = int(t * 1000)
    flt.append(f'[{n}:a]aresample=44100,aformat=channel_layouts=stereo,volume={vol},adelay={ms}|{ms}[s{i}]'); lab.append(f'[s{i}]')
flt.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,atrim=0:{TOTAL}[a]')
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + inp + ['-filter_complex', ';'.join(flt), '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', 'audio.m4a'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'video_silent.mp4', '-i', 'audio.m4a', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', 'final.mp4'], check=True)
print('ok', len(ev))
