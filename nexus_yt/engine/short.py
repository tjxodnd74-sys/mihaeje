import json,subprocess,sys,os,math
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageEnhance
A=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets');F=A+'/fonts/';SFX=A+'/sfx/'
W,H=1080,1920;Y=700;VH=608;FPS=30;GAP=0.06;SPD=1.17;END=2.4
fH=ImageFont.truetype(F+'Pretendard-Black.otf',100);fC=ImageFont.truetype(F+'Pretendard-Black.otf',80)
fE=ImageFont.truetype(F+'Pretendard-Black.otf',92);fS=ImageFont.truetype(F+'Pretendard-Bold.otf',40);fT=ImageFont.truetype(F+'Pretendard-Black.otf',96)
def sfx(k):return [SFX+f for f in os.listdir(SFX) if f.startswith(k)][0]
def stroke(d,xy,t,f,fill,sw=8):d.text(xy,t,font=f,fill=fill,stroke_width=sw,stroke_fill='#000000')
def bgbase(th):
    im=Image.open(th).convert('RGB');s=max(W/im.width,H/im.height)
    im=im.resize((int(im.width*s)+1,int(im.height*s)+1));x=(im.width-W)//2;im=im.crop((x,0,x+W,H))
    return ImageEnhance.Brightness(im.filter(ImageFilter.GaussianBlur(38))).enhance(0.28)
def text_img(lines,hl,f,step,col='#FFFFFF',hc='#FFD400',sw=8):
    d0=ImageDraw.Draw(Image.new('RGB',(1,1)));wmax=max(d0.textlength(l,font=f) for l in lines)
    im=Image.new('RGBA',(int(wmax)+40,step*len(lines)+30),(0,0,0,0));d=ImageDraw.Draw(im);y=10
    for ln in lines:
        x=(im.width-d.textlength(ln,font=f))/2;parts=[(ln,col)]
        if hl and hl in ln:a,b=ln.split(hl,1);parts=[(a,col),(hl,hc),(b,col)]
        for t,c in parts:stroke(d,(x,y),t,f,c,sw);x+=d.textlength(t,font=f)
        y+=step
    return im
def stamp_img(t,c):
    d0=ImageDraw.Draw(Image.new('RGB',(1,1)));w=int(d0.textlength(t,font=fT))+70
    im=Image.new('RGBA',(w,150),(0,0,0,0));d=ImageDraw.Draw(im)
    d.rounded_rectangle([6,6,w-6,144],radius=22,fill=c,outline='#FFFFFF',width=7)
    d.text((35,16),t,font=fT,fill='#FFFFFF' if c!='#FFD400' else '#111111')
    return im.rotate(-6,expand=True,resample=Image.BICUBIC)
def chunks(t,mx=11):
    t=t.replace(',',' ').replace('.',' ');ws=[w for w in t.split() if w];out=[];cur=''
    for w in ws:
        if cur and len(cur)+1+len(w)>mx:out.append(cur);cur=w
        else:cur=(cur+' '+w).strip()
    if cur:out.append(cur)
    return out
def cap_img(t,kws):
    d0=ImageDraw.Draw(Image.new('RGB',(1,1)));w=int(d0.textlength(t,font=fC))+40
    im=Image.new('RGBA',(w,130),(0,0,0,0));d=ImageDraw.Draw(im);x=20
    for i,word in enumerate(t.split(' ')):
        c='#FFD400' if any(k in word for k in kws) else '#FFFFFF'
        stroke(d,(x,15),word,fC,c,9);x+=d.textlength(word+' ',font=fC)
    return im
def paste_scaled(base,im,cx,cy,s,alpha=1.0):
    if s<=0.01 or alpha<=0:return
    im2=im.resize((max(1,int(im.width*s)),max(1,int(im.height*s))),Image.BILINEAR)
    if alpha<1:
        a=im2.split()[3].point(lambda v:int(v*alpha));im2.putalpha(a)
    base.alpha_composite(im2,(int(cx-im2.width/2),int(cy-im2.height/2)))
def ease_pop(t,d=0.18,s0=1.35):
    if t<0:return 0
    if t>=d:return 1.0
    p=t/d;return s0+(1-s0)*(1-(1-p)**3)
def build(spec):
    ep=spec['ep'];L=json.load(open(ep+'/voice.json'))['lines'];name=spec['name']
    sel=[]
    for key in spec['lines']:
        m=[l for l in L if key in l[2]];assert len(m)==1,(key,len(m));sel.append(m[0])
    # timeline
    plan=[];t=0.0
    for i,l in enumerate(sel):
        a,b=l[0]-0.03,l[1]+0.05;pw=f'/tmp/{name}_p{i}.wav'
        subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{a:.3f}','-t',f'{b-a:.3f}','-i',ep+'/voice.wav','-af',f'aresample=48000,aformat=channel_layouts=stereo,silenceremove=start_periods=1:start_threshold=-40dB:stop_periods=-1:stop_duration=0.14:stop_threshold=-40dB:stop_silence=0.07,atempo={SPD},afade=t=in:d=0.015,areverse,afade=t=in:d=0.04,areverse',pw],check=True)
        d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',pw]))
        jump=i>0 and sel[i-1] is not l and L.index(l)!=L.index(sel[i-1])+1
        vs=[v for k,v in spec.get('vsrc',{}).items() if k in l[2]];vi=[v for k,v in spec.get('vimg',{}).items() if k in l[2]]
        plan.append(dict(pw=pw,a=a,b=b,t0=t,t1=t+d,text=l[2],jump=jump,vs=vs[0] if vs else a,vi=vi[0] if vi else None));t+=d+GAP
    T=t-GAP;TOT=T+END
    # audio: voice pieces
    tmp=f'/tmp/{name}_a';os.makedirs(tmp,exist_ok=True)
    ins=[];fl=[];lab=[]
    for i,p in enumerate(plan):
        ins+=['-i',p['pw']]
        ms=int(p['t0']*1000)
        fl.append(f"[{i}:a]adelay={ms}|{ms}[v{i}]");lab.append(f'[v{i}]')
    n=len(plan)
    ins+=['-stream_loop','-1','-ss','4','-i',A+'/music.mp3'];fl.append(f"[{n}:a]atrim=0:{TOT:.2f},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,volume=0.07,afade=t=in:d=0.5,afade=t=out:st={TOT-1.2:.2f}:d=1.2[m]");lab.append('[m]');n+=1
    ev=[]  # sfx events
    ev.append((0.0,'52562cc1',0.28))  # hook impact
    for p in plan[1:]:
        if p['jump']:ev.append((p['t0']-0.12,'4ac6a795',0.22))
    st_imgs={}
    for key,(txt,col) in spec.get('stamps',{}).items():
        p=[p for p in plan if key in p['text']][0];ts=p['t0']+spec.get('stamp_delay',{}).get(key,0.35)
        st_imgs[key]=(ts,min(p['t1']+0.3,ts+1.8),stamp_img(txt,col));ev.append((ts,'a0174981',0.45))
    ev.append((T,'edfd6df3',0.3));ev.append((T+0.35,'32bc6c49',0.35))
    for ts,k,v in ev:
        ins+=['-i',sfx(k)];ms=int(max(0,ts)*1000)
        fl.append(f"[{n}:a]atrim=0:1.6,afade=t=out:st=1.4:d=0.2,aresample=48000,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{n}]");lab.append(f'[s{n}]');n+=1
    fl.append(''.join(lab)+f"amix=inputs={len(lab)}:normalize=0:duration=longest,atrim=0:{TOT:.2f},alimiter=limit=0.9[ao]")
    subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(fl),'-map','[ao]','-ar','48000',f'{tmp}/a.wav'],check=True)
    # captions
    caps=[]
    for p in plan:
        cs=chunks(p['text']);N=sum(len(c) for c in cs);x=p['t0']
        for c in cs:
            dt=(p['t1']-p['t0'])*len(c)/N;caps.append((x,x+dt,cap_img(c,spec['kws'])));x+=dt
    # static layers
    bg=bgbase(spec['thumb']).convert('RGBA');hook=text_img(spec['hook'],spec['hl'],fH,128)
    endc=bgbase(spec['thumb']).convert('RGBA');de=ImageDraw.Draw(endc)
    q=text_img(spec['end'][:1],None,fE,120);endc.alpha_composite(q,((W-q.width)//2,330))
    endc.paste(Image.open(spec['thumb']).convert('RGB').resize((W,VH)),(0,Y))
    q=text_img(spec['end'][1:],'풀영상',fE,120);endc.alpha_composite(q,((W-q.width)//2,Y+VH+60))
    b='▶  넥서스 AI 채널에서 전체 보기';w=de.textlength(b,font=fS)
    de.rounded_rectangle([(W-w)/2-36,Y+VH+220,(W+w)/2+36,Y+VH+300],radius=40,fill='#E2622F');de.text(((W-w)/2,Y+VH+237),b,font=fS,fill='#FFFFFF')
    # video frames per plan item
    BW,BH=1188,669
    def frames(p):
        if p['vi']:
            im=np.array(Image.open(p['vi']).convert('RGB').resize((BW,BH)));return im[None]
        dur=p['b']-p['a'];nf=int(round((p['t1']-p['t0'])*FPS))+1
        raw=subprocess.check_output(['ffmpeg','-v','error','-ss',f"{p['vs']:.3f}",'-t',f'{dur+0.1:.3f}','-i',ep+'/vid.mp4','-vf',f"fps={FPS*(p['b']-p['a'])/(p['t1']-p['t0']):.3f},crop=1720:968:110:80,scale={BW}:{BH}",'-f','rawvideo','-pix_fmt','rgb24','-'])
        arr=np.frombuffer(raw,np.uint8).reshape(-1,BH,BW,3);return arr
    enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i',f'{tmp}/a.wav','-map','0:v','-map','1:a','-c:v','libx264','-crf','19','-preset','veryfast','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',f'{name}.mp4'],stdin=subprocess.PIPE)
    NF=int(TOT*FPS);cache={};last=None
    for fi in range(NF):
        t=fi/FPS
        if t>=T:
            fr=endc.copy();e=t-T
            if e<0.2:  # flash in
                fr=Image.blend(Image.new('RGBA',(W,H),'#FFFFFF'),fr,min(1,e/0.2))
            enc.stdin.write(fr.convert('RGB').tobytes());continue
        pi=max(i for i,p in enumerate(plan) if p['t0']<=t+1e-6) if t>=plan[0]['t0'] else 0
        p=plan[pi]
        if pi not in cache:cache.clear();cache[pi]=frames(p)
        arr=cache[pi];lt=min(t,p['t1'])-p['t0'];k=min(len(arr)-1,int(lt*FPS))
        src=Image.fromarray(arr[k]);ln=lt  # zoom: punch-in at start + slow push
        z=1.0+0.06*min(1,ln/max(0.5,p['t1']-p['t0']))
        if p['jump'] or pi==0:z+=0.10*max(0,1-ln/0.18)
        cw,ch=int(BW/z*W/BW* (BW/W)),0
        cw=int(W*1.1/z);ch=int(cw*VH/W);cx,cy=BW//2,BH//2
        if cw>BW:cw=BW;ch=int(cw*VH/W)
        vid=src.crop((cx-cw//2,cy-ch//2,cx-cw//2+cw,cy-ch//2+ch)).resize((W,VH),Image.BILINEAR)
        fr=bg.copy();fr.paste(vid,(0,Y))
        if (p['jump']) and ln<0.07:fr.alpha_composite(Image.new('RGBA',(W,VH),(255,255,255,150)),(0,Y))
        # hook pop + shake first 0.35s
        s=ease_pop(t,0.22,1.4);dx=int(10*math.sin(t*90))*(1 if t<0.35 else 0)
        paste_scaled(fr,hook,W/2+dx,330+hook.height/2,s)
        # progress bar
        d=ImageDraw.Draw(fr);d.rectangle([0,0,int(W*t/T),12],fill='#E2622F')
        for c0,c1,im in caps:
            if c0<=t<c1+0.02:paste_scaled(fr,im,W/2,Y+VH+125,ease_pop(t-c0,0.12,1.25));break
        for key,(s0,s1,im) in st_imgs.items():
            if s0<=t<s1:paste_scaled(fr,im,W-im.width/2-40,Y-30,ease_pop(t-s0,0.16,1.8),alpha=min(1,(s1-t)/0.15))
        enc.stdin.write(fr.convert('RGB').tobytes())
    enc.stdin.close();enc.wait();print(name,round(TOT,1))
if __name__=='__main__':
    for f in sys.argv[1:]:build(json.load(open(f)))
