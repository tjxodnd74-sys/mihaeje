import json,subprocess,re,shutil
A={}
for l in open('asr_a.log'):
    if l.startswith('{'):d=json.loads(l);A[d['f']]=d
U=json.load(open('units.json'))
def sil(f):
    o=subprocess.run(['ffmpeg','-i',f,'-af','silencedetect=noise=-38dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
    s=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',o)];e=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',o)]
    dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
    pairs=list(zip(s,e));head=pairs[0][1] if pairs and pairs[0][0]<0.05 else 0
    tail=s[-1] if s and len(s)>len(e) else dur
    inner=[(a,b) for a,b in pairs if a>head+0.05 and b<tail-0.05]
    return tail-head,inner
import statistics
CC=lambda k:len(re.sub(r'[^가-힣0-9a-zA-Z]','',U[k]['text']))
ALL={}
for k in range(54):
    for t in (0,1):
        f=f'ln2/u{k}_{t}.wav';ALL[f]=sil(f)
rates=[CC(int(re.search(r'u(\d+)_',f).group(1)))/v[0] for f,v in ALL.items() if v[0]>0.5]
TR=statistics.median(rates);print('target cps',round(TR,2))
out={}
for k in range(54):
    c=[]
    for t in (0,1):
        f=f'ln2/u{k}_{t}.wav';d=A.get(f);sp,inner=ALL[f]
        commas=U[k]['text'].count(',')
        longp=sum(1 for a,b in inner if b-a>0.42)
        c.append(dict(f=f,r=d['r'] if d else 0,sp=round(sp,2),lp=longp,cm=commas,asr=d['asr'] if d else ''))
    for x in c:
        rt=CC(k)/x['sp'] if x['sp']>0.3 else TR
        x['score']=x['r']-0.5*abs(rt/TR-1)-0.08*max(0,x['lp']-x['cm'])
    b=max(c,key=lambda x:x['score']);out[k]=b
    flag='  <<' if b['r']<0.85 or b['lp']>b['cm'] else ''
    print(k,[(x['r'],x['sp'],x['lp']) for x in c],'->',b['f'][-5],b['asr'],flag)
    shutil.copy(b['f'],f'ln/u{k}.wav')
