import json,subprocess,sys
S=json.load(open('spec.json')); T=S['total']; P=S['phase']; C=S['crashAt']
X='/home/claude/mihaeje/reels/pipeline/sfx/'
ev=[(C-0.05,'bomb',.9),(C-0.02,'hook_impact',.7),(P['replay'],'whoosh_snap',.5),(P['ask'],'pop',.5),
    (P['reveal']-3,'tick',.6),(P['reveal']-2,'tick',.6),(P['reveal']-1,'tick',.6),(P['reveal'],'ding',.7),(P['reveal']+0.05,'success',.5),(P['reveal']+1.2,'pop',.35)]
inp=['-i','silent.mp4','-stream_loop','-1','-i',X+'car_bed.wav']; flt=[f'[1:a]atrim=0:{T},asetpts=PTS-STARTPTS,volume=0.35,aresample=44100,aformat=channel_layouts=stereo[b]']; lab=['[b]']
for i,(t,f,v) in enumerate(ev):
    inp+=['-i',X+f+'.wav']; ms=int(t*1000); flt.append(f'[{i+2}:a]aresample=44100,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{i}]'); lab.append(f'[s{i}]')
flt.append(''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=first,atrim=0:{T},loudnorm=I=-14:TP=-1.5[a]')
subprocess.run(['ffmpeg','-v','error','-y']+inp+['-filter_complex',';'.join(flt),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','out.mp4'],check=True)
print('ok')
