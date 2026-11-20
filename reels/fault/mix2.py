import json,subprocess
S=json.load(open('spec.json')); T=S['total']; NO=S['narrOffset']; X='/home/claude/mihaeje/reels/pipeline/sfx/'
ev=[(S['crashAt']-0.04,'bomb',.9),(S['crashAt']-0.02,'hook_impact',.6),(S['t'][1],'whoosh_snap',.35),(S['replayCrash']-0.03,'bomb',.4),
    (S['t'][2],'whoosh_soft',.3),(S['chaseCrash']-0.04,'bomb',.6),(S['numAt'],'hook_hit',.45),(S['t'][4],'whoosh_soft',.3)]
ev+=[(S['gridAt']+i*0.18,'pop',.35) for i in range(4)]
ev+=[(S['t'][i],'click',.45) for i in (5,6,7,8)]+[(S['redAt'],'alert',.3),(S['t'][9]+0.3,'ding',.45),(S['endTilesAt'],'pop',.4)]
inp=['-i','silent.mp4','-i','narr.wav','-stream_loop','-1','-i',X+'car_bed.wav']
flt=[f'[1:a]aresample=44100,aformat=channel_layouts=stereo,adelay={int(NO*1000)}|{int(NO*1000)},volume=1.0[n]',
     f'[2:a]atrim=0:{T},asetpts=PTS-STARTPTS,volume=0.12,aresample=44100,aformat=channel_layouts=stereo[b]']; lab=['[n]','[b]']
for i,(t,f,v) in enumerate(ev):
    inp+=['-i',X+f+'.wav']; ms=max(0,int(t*1000)); flt.append(f'[{i+3}:a]aresample=44100,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{i}]'); lab.append(f'[s{i}]')
flt.append(''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=longest,atrim=0:{T},loudnorm=I=-14:TP=-1.5[a]')
subprocess.run(['ffmpeg','-v','error','-y']+inp+['-filter_complex',';'.join(flt),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(T),'-movflags','+faststart','out.mp4'],check=True)
print('ok',len(ev))
