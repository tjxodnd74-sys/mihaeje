import json,subprocess
S=json.load(open('spec.json')); T=S['total']; NO=S['narrOffset']; X='/home/claude/mihaeje/reels/pipeline/sfx/'; t=S['t']
ev=[(0.0,'whoosh_soft',.35),(2.6,'boing',.45),(t[1],'ding',.4),(t[2],'whoosh_snap',.3),(t[3],'whoosh_soft',.3),(S['leftAt'],'pop',.4),
    (t[4],'whoosh_snap',.3),(S['goAt'],'click',.4),(S['lawAt'],'ding',.4),(t[5],'whoosh_snap',.3)]
k=0
while S['blinkAt']+k/2.6 < t[6]: ev.append((S['blinkAt']+k/2.6,'tick',.3)); k+=1
ev+=[(x,'pop',.4) for x in S['summ']]
inp=['-i','silent.mp4','-i','narr.wav','-stream_loop','-1','-i',X+'car_bed.wav']
flt=[f'[1:a]aresample=44100,aformat=channel_layouts=stereo,adelay={int(NO*1000)}|{int(NO*1000)}[n]',
     f'[2:a]atrim=0:{T},asetpts=PTS-STARTPTS,volume=0.08,aresample=44100,aformat=channel_layouts=stereo[b]']; lab=['[n]','[b]']
for i,(tt,f,v) in enumerate(ev):
    inp+=['-i',X+f+'.wav']; ms=max(0,int(tt*1000)); flt.append(f'[{i+3}:a]aresample=44100,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{i}]'); lab.append(f'[s{i}]')
flt.append(''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=longest,atrim=0:{T},loudnorm=I=-14:TP=-1.5[a]')
subprocess.run(['ffmpeg','-v','error','-y']+inp+['-filter_complex',';'.join(flt),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(T),'-movflags','+faststart','out.mp4'],check=True)
print('ok',len(ev))
