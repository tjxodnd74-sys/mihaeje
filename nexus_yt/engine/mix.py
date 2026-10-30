import json,subprocess,glob,sys
import os;U=os.path.join(os.path.dirname(os.path.abspath(__file__)),'sfx/')
F=lambda k:glob.glob(U+k+'*')[0]
M={'send':[('0940aa4d',.03,.5,1)],'recv':[('6f1fb3da',.03,.42,.6)],'stamp':[('a0174981',.30,.55,1)],
'riser_hit':[('00d28a78',1.87,.32,2.4),('06641024',.66,.30,2.5)],
'whoosh0':[('4ac6a795',.30,.5,1.6)],'whoosh1':[('edfd6df3',.78,1.0,2.0)],'whoosh2':[('90ee9583',.69,.7,1.8)],
'swish':[('a8d936c6',.14,.32,.7)],'drop':[('1b8b15f8',.17,.4,.4)],'drop2':[('61c60b5e',.16,.32,.5)],'warn':[('7bb4dac8',.03,.38,.6)],
'pen':[('890df04f',.21,.35,.6)],'spark':[('035b23cc',.20,.28,.5)],'down':[('23366f9e',.57,.32,1.6)],'step':[('3b9f9a21',.01,.45,.3)],'tick2':[('da2d1537',.04,.3,.3)],
'toggle':[('73bdd9d0',.01,.5,.3)],'button':[('751a4be9',.26,.45,.7)],'success':[('32bc6c49',.19,.45,1),('035b23cc',.20,.3,.5)],
'impact':[('52562cc1',.40,.32,1.6)],'ding':[('32bc6c49',.19,.38,1)]}
VID=sys.argv[1];OUT=sys.argv[2];BGM_I=sys.argv[3] if len(sys.argv)>3 else '-38'
E=json.load(open('events.json'));D=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',VID]))
ins=['-stream_loop','-1','-ss','8','-i',os.path.join(os.path.dirname(os.path.abspath(__file__)),'music.mp3')];fl=[f"[0:a]atrim=0:{D:.2f},asetpts=PTS-STARTPTS,afade=t=in:d=1,afade=t=out:st={D-3:.2f}:d=3,loudnorm=I={BGM_I}:TP=-9:LRA=7,aresample=48000,aformat=channel_layouts=stereo[m]"];ins+=['-i','voice.wav'];fl.append('[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=1.0[vo]');lab=['[m]','[vo]'];n=2
for t,name,p in E:
    if name.startswith('type:'):
        d=float(name.split(':')[1]);ins+=['-ss','0.3','-i',F('c3b7eeb3')]
        st=int(t*1000);fl.append(f'[{n}:a]atrim=0:{d:.2f},afade=t=out:st={max(0,d-0.08):.2f}:d=0.08,aresample=48000,aformat=channel_layouts=stereo,volume=0.42,adelay={st}|{st}[s{n}]');lab.append(f'[s{n}]');n+=1;continue
    for key,pk,vol,mx in M[name]:
        ins+=['-i',F(key)];st=int(max(0,t-pk)*1000)
        fl.append(f'[{n}:a]atrim=0:{mx},afade=t=out:st={max(0,mx-0.1):.2f}:d=0.1,aresample=48000,aformat=channel_layouts=stereo,volume={vol},adelay={st}|{st}[s{n}]');lab.append(f'[s{n}]');n+=1
fc=';'.join(fl)+';'+''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=first,alimiter=limit=0.9[out]'
open('afc.txt','w').write(fc)
subprocess.run(['ffmpeg','-y','-loglevel','error',*ins,'-filter_complex_script','afc.txt','-map','[out]','-t',f'{D:.2f}','mix.wav'],check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',VID,'-i','mix.wav','-map','0:v','-map','1:a','-c:v','libx264','-preset','veryfast','-crf','22','-maxrate','5M','-bufsize','10M','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',OUT],check=True)
print('ok',n)
