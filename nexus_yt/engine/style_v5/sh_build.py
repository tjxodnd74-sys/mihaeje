import json,subprocess,os,sys
sys.path.insert(0,'..')
os.chdir('/home/claude/work/aitalk')
src=open('build_voice.py').read().split('LG=0.22')[0].split("for i,u in enumerate(U):")[0]
exec(src.replace("g=runpy.run_path('lines.py');S=g['S']",'').replace("U=json.load(open('units.json'))",''))
T=json.load(open('shorts.json'))
CAP=['AI들을 한 마을에<br>모아 놨더니,','며칠 만에 <em>자기들만의 말</em>을<br>만들었어요','"논문이 <em>차가운 손</em>을<br>먹었다"','이게 <em>AI끼리 진짜</em><br>주고받은 말이에요','뜻은 아무도<br>정해 준 적 없고요','제미나이는 <em>절반 정도</em>를<br>못 알아듣겠더래요','근데 더 무서운 건,','가짜 지시 하나에<br>AI들이 <em>돈까지</em> 옮겼어요','그런데 이걸 줄이는<br>방법이 있었어요','여러 회사 AI를 같이 두니까<br><em>확 줄었거든요</em>','이걸 AI 쓸 때<br>활용하는 법,','<em>풀영상</em>에서 알려 드릴게요']
CAP=json.load(open('v5/sh_caps.json')) if os.path.exists('v5/sh_caps.json') else CAP
os.makedirs('ln_s/t',exist_ok=True)
t=0.35;lines=[];ins=[];fl=[]
for k in range(len(T)):
    s=f'ln_s/s{k}.wav';d=f'ln_s/t/s{k}.wav';trim(s,d,maxgap=0.2)
    du=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',d]))
    lines.append([round(t,3),round(t+du,3),CAP[k]]);ins+=['-i',d];fl.append(f'[{k}:a]adelay={int(t*1000)}|{int(t*1000)}[a{k}]');t+=du+(0.1 if k not in (5,7,9) else 0.22)
dur=round(t+0.6,2)
EQ='highpass=f=90,equalizer=f=300:t=q:w=1:g=-4,equalizer=f=3500:t=q:w=1:g=6,equalizer=f=6000:t=q:w=1:g=7,highshelf=f=9000:g=5,acompressor=threshold=-20dB:ratio=3:attack=5:release=80'
fc=';'.join(fl)+';'+''.join(f'[a{k}]' for k in range(len(T)))+f'amix=inputs={len(T)}:normalize=0,apad,atrim=0:{dur},{EQ},loudnorm=I=-15:TP=-1.5[o]'
subprocess.run(['ffmpeg','-y','-v','error',*ins,'-filter_complex',fc,'-map','[o]','-ar','48000','v5/sh_voice.wav'],check=True)
C='#E8A87C';G='#8AB4F8';O='#9EE6B5';Mi='#FF8F5A'
SSH=[dict(at=0,type='chat',msgs=[['3',C,'주민 AI · 3번','입 없는 행동 변화'],['7',G,'주민 AI · 7번','위상 고정. 드리프트 0'],['2',Mi,'주민 AI · 2번','장부는 누군지 기억한다'],['5',O,'주민 AI · 5번','열역학적 마찰이 남았어'],['1',C,'주민 AI · 1번','이름 먼저. 콜드 리드 요청']]),
 dict(at=2,type='big',size=130,html='<div>"논문이</div><div class="y">차가운 손<br>세 개를</div><div>먹었다"</div>',tag='(실제 AI끼리 한 말)'),
 dict(at=4,type='big',size=120,html='<div>뜻 정해 준 사람</div><div class="r" style="font-size:220px">0명</div>'),
 dict(at=5,type='big',size=130,html='<div class="mut" style="font-size:60px;letter-spacing:0">제미나이</div><div class="y">절반을<br>못 알아들음</div>'),
 dict(at=6,type='stamp',text='돈까지 옮김',peng='wow'),
 dict(at=8,type='split',a=['한 회사 AI끼리',32.8],b=['여러 회사 같이',7.6]),
 dict(at=10,type='cta',html='<div>활용법은</div><div class="y">풀영상에서</div>')]
json.dump([[lines[s['at']][0],{'chat':'whoosh0','big':'impact','stamp':'riser_hit','split':'riser_hit','cta':'whoosh1'}[s['type']],0] for s in SSH],open('v5/sh_events.json','w'))
open('v5/sh_data.js','w').write('window.SV='+json.dumps({'lines':lines,'dur':dur},ensure_ascii=False)+';window.SSH='+json.dumps(SSH,ensure_ascii=False)+';')
print('short dur',dur)
