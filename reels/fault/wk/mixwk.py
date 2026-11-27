import json,subprocess,sys
# usage: python3 mixwk.py <key>   (expects <key>_silent.mp4, <key>.mp3, spec_<key>.json, sfx/)
k=sys.argv[1]; S=json.load(open(f'spec_{k}.json')); T=S['total']; NO=S['narrOffset']; t=S['t']
E={'zz':lambda:[(0,'whoosh_soft',.3),(t[1],'click',.4),(7.8,'ding',.35),(S['cwAt'],'pop',.35),(t[2],'whoosh_soft',.25),(t[3],'whoosh_snap',.3),(t[4],'click',.4),(S['diaAt'],'ding',.4),(t[5],'whoosh_soft',.25),(t[6],'whoosh_snap',.3)],
   'fog':lambda:[(0,'whoosh_soft',.3),(t[1]+0.4,'whoosh_fast',.35),(t[2],'pop',.4),(S['pressAt'],'click',.6),(S['acAt'],'click',.45),(S['airAt'],'click',.45),(23.9,'ding',.35),(S['tmpAt'],'click',.45),(t[5],'whoosh_soft',.3),(S['clearAt'],'pop',.45),(t[6],'whoosh_snap',.3)],
   'hp':lambda:[(0,'whoosh_soft',.3),(7.6,'alert',.35),(S['stopAt']+0.9,'alert',.35),(14.4,'ding',.4),(t[3],'pop',.35),(21.52,'hook_hit',.45)]+[(x,'pop',.35) for x in S['pay']]+[(30.6,'pop',.4),(t[5],'whoosh_snap',.3)]}[k]()
E+=[(x,'pop',.4) for x in S['summ']]
inp=['-i',f'{k}_silent.mp4','-i',f'{k}.mp3','-stream_loop','-1','-i','sfx/car_bed.wav']
flt=[f'[1:a]aresample=44100,aformat=channel_layouts=stereo,adelay={int(NO*1000)}|{int(NO*1000)}[n]',
     f'[2:a]atrim=0:{T},asetpts=PTS-STARTPTS,volume=0.08,aresample=44100,aformat=channel_layouts=stereo[b]']; lab=['[n]','[b]']
for i,(tt,f,v) in enumerate(E):
    inp+=['-i',f'sfx/{f}.wav']; ms=max(0,int(tt*1000)); flt.append(f'[{i+3}:a]aresample=44100,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{i}]'); lab.append(f'[s{i}]')
flt.append(''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=longest,atrim=0:{T},loudnorm=I=-14:TP=-1.5[a]')
subprocess.run(['ffmpeg','-v','error','-y']+inp+['-filter_complex',';'.join(flt),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(T),'-movflags','+faststart',f'{k}_final.mp4'],check=True)
print('ok',k,len(E))
