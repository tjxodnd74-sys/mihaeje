import json,subprocess
S=json.load(open('spec.json')); T=S['total']; NO=S['narrOffset']; X='/home/claude/mihaeje/reels/pipeline/sfx/'; t=S['t']
ev=[(0.0,'whoosh_soft',.35),(S['underAt'],'pop',.4),(t[2],'whoosh_snap',.3),(t[3],'click',.45),
    (S['knockAt'],'tick',.6),(S['knockAt']+.22,'tick',.6),(S['meowAt'],'ding',.35),
    (t[4],'click',.45),(S['slamAt'],'hook_hit',.4),(S['catOutAt']+.1,'whoosh_fast',.35),
    (t[5],'click',.45),(S['stompAt'],'pop',.45),(S['stompAt']+.28,'pop',.45),(S['cat2At'],'whoosh_soft',.3),
    (t[6],'click',.45),(S['hornAt'],'alert',.3),(S['nightAt'],'whoosh_soft',.3)]+[(x,'pop',.4) for x in S['summ']]
inp=['-i','silent.mp4','-i','narr.wav','-stream_loop','-1','-i',X+'car_bed.wav']
flt=[f'[1:a]aresample=44100,aformat=channel_layouts=stereo,adelay={int(NO*1000)}|{int(NO*1000)}[n]',
     f'[2:a]atrim=0:{T},asetpts=PTS-STARTPTS,volume=0.08,aresample=44100,aformat=channel_layouts=stereo[b]']; lab=['[n]','[b]']
for i,(tt,f,v) in enumerate(ev):
    inp+=['-i',X+f+'.wav']; ms=max(0,int(tt*1000)); flt.append(f'[{i+3}:a]aresample=44100,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{i}]'); lab.append(f'[s{i}]')
flt.append(''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=longest,atrim=0:{T},loudnorm=I=-14:TP=-1.5[a]')
subprocess.run(['ffmpeg','-v','error','-y']+inp+['-filter_complex',';'.join(flt),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(T),'-movflags','+faststart','out.mp4'],check=True)
print('ok',len(ev))
