import json,subprocess,re,runpy,os
g=runpy.run_path('lines.py');S=g['S']
U=json.load(open('units.json'))
def dur(f):return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
def sil(f):
    o=subprocess.run(['ffmpeg','-i',f,'-af','silencedetect=noise=-38dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
    s=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',o)];e=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',o)]
    return list(zip(s,e))
# trim each unit — gentle: keep natural word endings (decay + breath), soft fade, internal pauses capped at 0.32s
# (2026-11-08 user: "끝음 처리도 이상하고 답답하게 말함" — old silenceremove cut the decay at -40dB and squeezed pauses to 0.14s)
def trim(src,dst,th=-50,head=0.05,tail=0.20,maxgap=0.26,fade=0.08):
    import numpy as np,wave
    a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',src,'-ac','1','-ar','48000','-f','s16le','-'],capture_output=True).stdout,np.int16).astype(np.float32)
    fr=480;n=len(a)//fr;e=np.array([20*np.log10(np.sqrt(np.mean((a[k*fr:(k+1)*fr]/32768)**2))+1e-9) for k in range(n)])
    on=np.where(e>th)[0]
    s0=max(0,on[0]-int(head*100));s1=min(n,on[-1]+int(tail*100))
    keep=[];k=s0;mg=int(maxgap*100)
    while k<s1:
        if e[k]<=th-6:
            j=k
            while j<s1 and e[j]<=th-6:j+=1
            L=j-k
            if L>mg and j<s1:keep+=list(range(k,k+mg//2))+list(range(j-mg//2,j))
            else:keep+=list(range(k,j))
            k=j
        else:keep.append(k);k+=1
    out=np.concatenate([a[q*fr:(q+1)*fr] for q in keep])
    fi=int(0.01*48000);fo=int(fade*48000);out[:fi]*=np.linspace(0,1,fi);out[-fo:]*=np.linspace(1,0,fo)**1.5
    w=wave.open(dst,'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000);w.writeframes(np.clip(out,-32768,32767).astype(np.int16).tobytes());w.close()
for i,u in enumerate(U):
    src=f'ln/u{i}.wav';dst=f'ln/t{i}.wav'
    if os.path.exists(dst) and os.path.getmtime(dst)>os.path.getmtime(src):continue
    trim(src,dst)
LG=0.22;SG=0.65;MIS=['m1','m2','m3','m4','m5']
t=0.6;out=[];place=[];prev=None;rep=[]
for k,u in enumerate(U):
    sc=u['sc']
    if prev is not None and sc!=prev: t+=SG-LG+(0.3 if prev=='end' else 0)+(0.3 if prev in MIS else 0)
    f=f'ln/t{k}.wav';d=dur(f);lines=dict(S)[sc]
    if len(u['lines'])==1:
        out.append([round(t,3),round(t+d,3),lines[u['lines'][0]],sc,u['lines'][0]])
    else:
        a,b=u['lines'];ca=len(lines[a].replace(' ',''));cb=len(lines[b].replace(' ',''))
        exp=d*ca/(ca+cb);ss=[x for x in sil(f) if 0.3<x[0]<d-0.3]
        best=max(ss,key=lambda x:(x[1]-x[0])*3-abs((x[0]+x[1])/2-exp)*2.5) if ss else (exp,exp)
        out.append([round(t,3),round(t+best[0]+0.03,3),lines[a],sc,a]);out.append([round(t+best[1]-0.03,3),round(t+d,3),lines[b],sc,b])
        rep.append((sc,a,round(best[0],2),round(exp,2),round(d,2)))
    place.append((f,t));t+=d+LG+(0.2 if sc in MIS else 0);prev=sc
total=t+4.0
# ---- phrase captions (whisper word timing, short one-line chunks) ----
import re as _re
def _chunks(t,mx=15):
    t=t.replace('\n',' ')
    toks=[w for w in t.split(' ') if w]
    # keep negation/adverb + verb together (못 보내요, 안 돼요, 잘 돼요)
    m=[]
    for w in toks:
        aux=w.rstrip(',.?!') in ('버려요','버렸어요','줘','줘요','주세요','봐요','봐','있어요','없어요','있고요','돼요','됐어요','해요','했어요','하면','해도','할','하는','거예요','거죠','수','것','적','때','뒀어요','놔요','되고요','남아요')
        if m and (m[-1] in ('못','안','잘','더','꼭','또','딱','확','한','두','세','네') or aux):m[-1]=m[-1]+' '+w
        else:m.append(w)
    out=[];cur=''
    for w in m:
        if cur and (len(cur)+1+len(w)>mx or cur.endswith((',','.','?','!'))):out.append(cur);cur=w
        else:cur=(cur+' '+w).strip()
    if cur:out.append(cur)
    return [c.rstrip(',.') for c in out]
_M=None
_WC=json.load(open('wcache.json')) if os.path.exists('wcache.json') else {}
def _words(f):
    global _M
    import hashlib
    h=hashlib.md5(open(f,'rb').read()).hexdigest()
    if h in _WC:return [tuple(x) for x in _WC[h]]
    import numpy as np
    if _M is None:
        from faster_whisper import WhisperModel;_M=WhisperModel('medium',device='cpu',compute_type='int8')
    a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-ar','16000','-ac','1','-f','f32le','-'],capture_output=True).stdout,np.float32)
    segs,_=_M.transcribe(a,language='ko',beam_size=5,word_timestamps=True,condition_on_previous_text=False)
    r=[(w.start,w.end,w.word.strip()) for s_ in segs for w in s_.words if w.word.strip()]
    _WC[h]=r;json.dump(_WC,open('wcache.json','w'),ensure_ascii=False)
    return r
_n=lambda x:_re.sub(r'[^가-힣0-9a-zA-Z]','',x)
KW=g.get('KW',[])
caps=[]
for (f,st),k in zip(place,range(len(place))):
    rows=[o for o in out if abs(o[0]-st)<0.01 or (o[0]>=st and o[1]<=st+dur(f)+0.01)]
    try:ws=_words(f)
    except Exception as e:ws=[]
    for r in rows:
        ch=_chunks(r[2]);tot=sum(len(_n(c)) for c in ch) or 1
        a0=r[0]-st;a1=r[1]-st
        wl=[w for w in ws if w[0]>=a0-0.15 and w[1]<=a1+0.2]
        acc=0
        for i,c in enumerate(ch):
            fr=acc/tot
            if wl:
                wt=sum(len(_n(w[2])) or 1 for w in wl);cum=0;t0=wl[-1][0]
                for w in wl:
                    if cum/wt>=fr-0.04:t0=w[0];break
                    cum+=len(_n(w[2])) or 1
            else:t0=a0+(a1-a0)*fr
            if i==0:t0=max(a0,wl[0][0]+0.04) if wl else a0
            else:
                t0+=0.04
                if t0<=caps[-1][0]-st+0.25:t0=caps[-1][0]-st+0.25
            caps.append([round(st+t0,3),None,c]);acc+=len(_n(c))
        for i in range(len(caps)-len(ch),len(caps)):
            caps[i][1]=caps[i+1][0] if i+1<len(caps) else round(r[1],3)
for c in caps:
    h=c[2]
    for kw in KW:
        if kw in h:h=h.replace(kw,'<em>'+kw+'</em>',1);break
    c[2]=h
json.dump({'lines':out,'caps':caps,'dur':round(total,2)},open('voice.json','w'),ensure_ascii=False)
ins=[];fl=[];lab=''
for i,(f,st) in enumerate(place):
    ins+=['-i',f];fl.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=mono,adelay={int(st*1000)}[a{i}]');lab+=f'[a{i}]'
fc=';'.join(fl)+f';{lab}amix=inputs={len(place)}:normalize=0,apad,atrim=0:{total:.2f}[o]'
open('vfc.txt','w').write(fc)
subprocess.run(['ffmpeg','-y','-loglevel','error',*ins,'-filter_complex_script','vfc.txt','-map','[o]','-ar','48000','voice.wav'],check=True)
for r in rep:print('split',r)
print('total',round(total,1))
