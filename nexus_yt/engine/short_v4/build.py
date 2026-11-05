import json,subprocess,sys,os,re
HERE=os.path.dirname(os.path.abspath(__file__));A='/home/claude/mihaeje/nexus_yt/assets';SFX=A+'/sfx/'
GAP=0.22;FPS=30
SF={'impact':'52562cc1','warn':'7bb4dac8','whoosh':'4ac6a795','whoosh2':'edfd6df3','stamp':'a0174981','send':'0940aa4d','recv':'6f1fb3da','pop':'a8d936c6','click':'751a4be9','ding':'32bc6c49','riser':'00d28a78','down':'23366f9e','type':'c3b7eeb3'}
VOL={'impact':.3,'warn':.32,'whoosh':.28,'whoosh2':.28,'stamp':.42,'send':.38,'recv':.38,'pop':.32,'click':.38,'ding':.32,'riser':.26,'down':.32,'type':.25}
def sfxf(k):return [SFX+f for f in os.listdir(SFX) if f.startswith(SF[k])][0]
def svg(n,fill):
    s=open(f'{HERE}/{n}.svg').read();return s.replace('<svg',f'<svg fill="{fill}"',1)
def prep(src,dst,maxgap=0.32):
    import numpy as np,wave
    a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',src,'-ac','2','-ar','48000','-f','s16le','-'],capture_output=True).stdout,np.int16).reshape(-1,2).astype(np.float32)
    fr=480;n=len(a)//fr;e=np.array([20*np.log10(np.sqrt(np.mean((a[k*fr:(k+1)*fr]/32768)**2))+1e-9) for k in range(n)])
    on=e>-48;idx=np.where(on)[0]
    s=max(0,idx[0]-3);t=min(n,idx[-1]+12)
    keep=[];k=s;mg=int(maxgap*100)
    while k<t:
        if not on[k]:
            j=k
            while j<t and not on[j]:j+=1
            L=j-k
            if L>mg:keep+=list(range(k,k+mg//2))+list(range(j-mg//2,j))
            else:keep+=list(range(k,j))
            k=j
        else:keep.append(k);k+=1
    out=np.concatenate([a[k*fr:(k+1)*fr] for k in keep])
    ramp=np.linspace(0,1,240)[:,None];out[:240]*=ramp;out[-960:]*=np.linspace(1,0,960)[:,None]
    w=wave.open(dst,'wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(48000);w.writeframes(out.astype(np.int16).tobytes());w.close()
    return len(out)/48000
_M=None
def words(f):
    global _M
    if _M is None:
        from faster_whisper import WhisperModel;_M=WhisperModel('medium',device='cpu',compute_type='int8')
    import numpy as np
    a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-ar','16000','-ac','1','-f','f32le','-'],capture_output=True).stdout,np.float32)
    segs,_=_M.transcribe(a,language='ko',beam_size=5,word_timestamps=True,condition_on_previous_text=False)
    return [(w.start,w.end,w.word.strip()) for s in segs for w in s.words if w.word.strip()]
norm=lambda s:re.sub(r'[^가-힣0-9a-zA-Z]','',s)
def phrase_times(phr,ws,dur):
    # phr: list of phrase strings (with ** markers); map by char proportion onto whisper words
    plain=[norm(p.replace('**','')) for p in phr];tot=sum(len(p) for p in plain)
    wl=[len(norm(w[2])) or 1 for w in ws];wt=sum(wl)
    cum=[];c=0
    for x in wl:cum.append(c/wt);c+=x
    starts=[];acc=0
    for p in plain:
        f=acc/tot;i=min(range(len(ws)),key=lambda k:abs(cum[k]-f));starts.append(ws[i][0] if starts or i>0 else 0.0);acc+=len(p)
    starts[0]=0.0
    out=[]
    for i,p in enumerate(phr):
        e=starts[i+1] if i+1<len(phr) else dur
        out.append((max(0,starts[i]-0.04),e,p))
    return out
def html_cap(p):return re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',p)
def build(spec):
    name=spec['name'];tmp=f'{HERE}/tmp_{name}';os.makedirs(tmp,exist_ok=True)
    L=[];t=0.0
    for i,ln in enumerate(spec['lines']):
        pw=f'{tmp}/l{i}.wav';d=prep(ln['wav'],pw);ws=words(pw)
        ph=phrase_times(ln['cap'].split('/'),ws,d)
        L.append(dict(ln,pw=pw,t0=t,d=d,ph=ph));t+=d+GAP+ln.get('hold',0)
    T=t-GAP+0.5
    def at(i,spec_t):
        l=L[i]
        if isinstance(spec_t,(int,float)):return l['t0']+spec_t
        m=re.match(r'p(\d+)([+-][\d.]+)?$',spec_t);k=int(m.group(1));off=float(m.group(2) or 0)
        return l['t0']+l['ph'][min(k,len(l['ph'])-1)][0]+off
    els=[];sfx=[];scenes=[]
    for i,l in enumerate(L):
        if not l.get('cont'):scenes.append([l['t0']])
        # scene end = start of next non-cont line
        j=i+1
        while j<len(L) and L[j].get('cont'):j+=1
        send=(L[j]['t0']-0.05) if j<len(L) else T+5
        for e in l['els']:
            e=dict(e);e['t']=at(i,e.get('t',0))
            if 'subs' in e:e['subs']=[dict(s,t=at(i,s['t'])) for s in e['subs']]
            if 'o' not in e:e['o']=send
            elif e['o']=='end':e['o']=l['t0']+l['d']+GAP-0.02
            elif isinstance(e['o'],str):e['o']=at(i,e['o'])
            for k,ts in [(e.get('s'),e['t'])]+[(s.get('s'),s['t']) for s in e.get('subs',[])]:
                if k:sfx.append((ts,k))
            if e.get('shake'):sfx.append((e['t']+e['shake'][0],'warn'))
            els.append(e)
        for ts,k in l.get('sfx',[]):sfx.append((at(i,ts),k))
    caps=[]
    for l in L:
        for a,b,p in l['ph']:caps.append([l['t0']+a,l['t0']+b+0.02,html_cap(p)])
    S=dict(title=spec['title'],els=els,caps=caps,scenes=scenes,dur=T)
    json.dump(S,open(f'{tmp}/S.json','w'),ensure_ascii=False)
    # audio
    ins=[];fl=[];lab=[];n=0
    for l in L:
        ins+=['-i',l['pw']];ms=int(l['t0']*1000);fl.append(f'[{n}:a]adelay={ms}|{ms}[v{n}]');lab.append(f'[v{n}]');n+=1
    ins+=['-stream_loop','-1','-ss','20','-i',A+'/music.mp3'];fl.append(f'[{n}:a]atrim=0:{T:.2f},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,volume=0.09,afade=t=in:d=0.4,afade=t=out:st={T-1:.2f}:d=1[m]');lab.append('[m]');n+=1
    for ts,k in sfx:
        ins+=['-i',sfxf(k)];ms=int(max(0,ts)*1000)
        fl.append(f'[{n}:a]atrim=0:1.4,afade=t=out:st=1.1:d=0.3,aresample=48000,aformat=channel_layouts=stereo,volume={VOL[k]},adelay={ms}|{ms}[s{n}]');lab.append(f'[s{n}]');n+=1
    fl.append(''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=longest,atrim=0:{T:.2f},alimiter=limit=0.9[ao]')
    subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(fl),'-map','[ao]','-ar','48000',f'{tmp}/a.wav'],check=True)
    print(name,'dur',round(T,1),'els',len(els),'sfx',len(sfx));return tmp
if __name__=='__main__':
    sys.path.insert(0,HERE);import specs
    for n in sys.argv[1:]:build(getattr(specs,n))
