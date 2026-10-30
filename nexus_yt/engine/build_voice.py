import json,subprocess,re,runpy,os
g=runpy.run_path('lines.py');S=g['S']
U=json.load(open('units.json'))
def dur(f):return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
def sil(f):
    o=subprocess.run(['ffmpeg','-i',f,'-af','silencedetect=noise=-38dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
    s=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',o)];e=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',o)]
    return list(zip(s,e))
# trim each unit
for i,u in enumerate(U):
    src=f'ln/u{i}.wav';dst=f'ln/t{i}.wav'
    if os.path.exists(dst) and os.path.getmtime(dst)>os.path.getmtime(src):continue
    af='silenceremove=start_periods=1:start_threshold=-42dB,areverse,silenceremove=start_periods=1:start_threshold=-42dB,areverse,silenceremove=stop_periods=-1:stop_duration=0.40:stop_threshold=-40dB:stop_silence=0.30,apad=pad_dur=0.04'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',src,'-af',af,'-ar','48000','-ac','1',dst],check=True)
LG=0.5;SG=1.7;MIS=['m1','m2','m3','m4','m5']
t=0.6;out=[];place=[];prev=None;rep=[]
for k,u in enumerate(U):
    sc=u['sc']
    if prev is not None and sc!=prev: t+=SG-LG+(0.3 if prev=='end' else 0)+(1.0 if prev in MIS else 0)
    f=f'ln/t{k}.wav';d=dur(f);lines=dict(S)[sc]
    if len(u['lines'])==1:
        out.append([round(t,3),round(t+d,3),lines[u['lines'][0]],sc,u['lines'][0]])
    else:
        a,b=u['lines'];ca=len(lines[a].replace(' ',''));cb=len(lines[b].replace(' ',''))
        exp=d*ca/(ca+cb);ss=[x for x in sil(f) if 0.3<x[0]<d-0.3]
        best=max(ss,key=lambda x:(x[1]-x[0])*3-abs((x[0]+x[1])/2-exp)*2.5) if ss else (exp,exp)
        out.append([round(t,3),round(t+best[0]+0.03,3),lines[a],sc,a]);out.append([round(t+best[1]-0.03,3),round(t+d,3),lines[b],sc,b])
        rep.append((sc,a,round(best[0],2),round(exp,2),round(d,2)))
    place.append((f,t));t+=d+LG+(0.7 if sc in MIS else 0);prev=sc
total=t+4.0
json.dump({'lines':out,'dur':round(total,2)},open('voice.json','w'),ensure_ascii=False)
ins=[];fl=[];lab=''
for i,(f,st) in enumerate(place):
    ins+=['-i',f];fl.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=mono,adelay={int(st*1000)}[a{i}]');lab+=f'[a{i}]'
fc=';'.join(fl)+f';{lab}amix=inputs={len(place)}:normalize=0,apad,atrim=0:{total:.2f}[o]'
open('vfc.txt','w').write(fc)
subprocess.run(['ffmpeg','-y','-loglevel','error',*ins,'-filter_complex_script','vfc.txt','-map','[o]','-ar','48000','voice.wav'],check=True)
for r in rep:print('split',r)
print('total',round(total,1))
