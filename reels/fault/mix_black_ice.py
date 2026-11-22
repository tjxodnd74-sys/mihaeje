# 20261123_3d_black_ice 효과음 믹스 (mix2.py 구조, 이번 spec 시각에 맞춤). cwd: /home/claude/ff (spec.json, silent.mp4, narr.wav)
import json,subprocess
S=json.load(open('spec.json')); T=S['total']; NO=S['narrOffset']; X='/home/claude/mihaeje/reels/pipeline/sfx/'; t=S['t']
ev=[(S['crashAt']-0.04,'bomb',.9),(S['crashAt']-0.02,'hook_impact',.6),(t[1],'whoosh_snap',.35),(S['replayCrash']-0.03,'bomb',.4),
    (t[2],'whoosh_soft',.3),(S['iceAt'],'shutter',.3),(t[3],'whoosh_soft',.3),(S['numAt'],'hook_hit',.45),(S['numAt2'],'hook_hit',.3),(t[4],'whoosh_soft',.3)]
ev+=[(S['gridAt']+i*0.18,'pop',.35) for i in range(4)]
ev+=[(t[i],'click',.45) for i in (5,6,7,8)]
ev+=[(t[7]+0.2+i*0.7,'tick',.4) for i in range(3)]
ev+=[(S['hazAt']+i*0.6,'tick',.3) for i in range(3)]
ev+=[(t[9]+0.3,'ding',.45),(S['endTilesAt'],'pop',.4)]
inp=['-i','silent.mp4','-i','narr.wav','-stream_loop','-1','-i',X+'car_bed.wav']
flt=[f'[1:a]aresample=44100,aformat=channel_layouts=stereo,adelay={int(NO*1000)}|{int(NO*1000)},volume=1.0[n]',
     f'[2:a]atrim=0:{T},asetpts=PTS-STARTPTS,volume=0.12,aresample=44100,aformat=channel_layouts=stereo[b]']; lab=['[n]','[b]']
for i,(tt,f,v) in enumerate(ev):
    inp+=['-i',X+f+'.wav']; ms=max(0,int(tt*1000)); flt.append(f'[{i+3}:a]aresample=44100,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{i}]'); lab.append(f'[s{i}]')
flt.append(''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=longest,atrim=0:{T},loudnorm=I=-14:TP=-1.5[a]')
subprocess.run(['ffmpeg','-v','error','-y']+inp+['-filter_complex',';'.join(flt),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(T),'-movflags','+faststart','out.mp4'],check=True)
print('ok',len(ev))
