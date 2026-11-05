import json,subprocess,sys,os,math,random
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageEnhance
A=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','assets');F=A+'/fonts/';SFX=A+'/sfx/';HERE=os.path.dirname(os.path.abspath(__file__))
W,H=1080,1920;FPS=30;SPD=1.05;GAP=0.1
def font(w,s):return ImageFont.truetype(F+{'k':'Pretendard-Black.otf','e':'Pretendard-ExtraBold.otf','b':'Pretendard-Bold.otf','m':'Pretendard-Medium.otf'}[w],s)
def sfx(k):return [SFX+f for f in os.listdir(SFX) if f.startswith(k)][0]
def ease(p):p=max(0,min(1,p));return 1-(1-p)**3
def pop(t,d=0.2,s0=1.4):
    if t<0:return 0
    return 1 if t>=d else s0+(1-s0)*ease(t/d)
def back(t,d=0.35):
    if t<0:return 0
    if t>=d:return 1
    p=t/d;c=1.70158;return 1+(c+1)*(p-1)**3+c*(p-1)**2
def tw(d,t,f):return d.textlength(t,font=f)
def stroke(d,xy,t,f,fill,sw=8,sc='#000000'):d.text(xy,t,font=f,fill=fill,stroke_width=sw,stroke_fill=sc)
def paste(base,im,cx,cy,s=1.0,alpha=1.0,rot=0):
    if s<=0.01 or alpha<=0.01:return
    if rot:im=im.rotate(rot,expand=True,resample=Image.BICUBIC)
    if s!=1:im=im.resize((max(1,int(im.width*s)),max(1,int(im.height*s))),Image.BILINEAR)
    if alpha<1:
        im=im.copy();im.putalpha(im.split()[3].point(lambda v:int(v*alpha)))
    base.alpha_composite(im,(int(cx-im.width/2),int(cy-im.height/2)))
def rr(w,h,r,fill,outline=None,width=0,shadow=True):
    pad=40 if shadow else 0
    im=Image.new('RGBA',(w+2*pad,h+2*pad),(0,0,0,0))
    if shadow:
        sh=Image.new('RGBA',im.size,(0,0,0,0));ImageDraw.Draw(sh).rounded_rectangle([pad,pad+14,pad+w,pad+h+14],r,fill=(0,0,0,150))
        im=Image.alpha_composite(im,sh.filter(ImageFilter.GaussianBlur(16)))
    ImageDraw.Draw(im).rounded_rectangle([pad,pad,pad+w,pad+h],r,fill=fill,outline=outline,width=width);return im,pad
def textbox(lines,f,col='#FFFFFF',hl=None,hc='#FFD400',sw=9,step=None):
    step=step or int(f.size*1.22);d0=ImageDraw.Draw(Image.new('RGB',(1,1)))
    w=int(max(tw(d0,l,f) for l in lines))+40;im=Image.new('RGBA',(w,step*len(lines)+30),(0,0,0,0));d=ImageDraw.Draw(im);y=10
    for l in lines:
        x=(w-tw(d,l,f))/2;parts=[(l,col)]
        if hl:
            parts=[];rest=l
            while rest:
                hit=[(rest.find(h),h) for h in hl if h in rest]
                if not hit:parts.append((rest,col));break
                i,h=min(hit);parts+=[(rest[:i],col),(h,hc)];rest=rest[i+len(h):]
        for t,c in parts:
            if t:stroke(d,(x,y),t,f,c,sw);x+=tw(d,t,f)
        y+=step
    return im
LOGO={}
def logo(n,s):
    k=(n,s)
    if k not in LOGO:
        p=f'{HERE}/lg/{n}.png' if os.path.exists(f'{HERE}/lg/{n}.png') else f'{A}/logos/{n}.png'
        im=Image.open(p).convert('RGBA');r=s/max(im.size);LOGO[k]=im.resize((int(im.width*r),int(im.height*r)),Image.LANCZOS)
    return LOGO[k]
# ---------------- scene widgets ----------------
CHAT_BG=(30,31,36,255)
def bubble(text,side,f=None,maxw=700):
    f=f or font('e',54);d0=ImageDraw.Draw(Image.new('RGB',(1,1)))
    words=text.split(' ');lines=[];cur=''
    for w_ in words:
        if cur and tw(d0,cur+' '+w_,f)>maxw:lines.append(cur);cur=w_
        else:cur=(cur+' '+w_).strip()
    lines.append(cur);lw=int(max(tw(d0,l,f) for l in lines));lh=int(f.size*1.35)
    col={'me':(226,98,47,255),'ai':(58,60,68,255),'sys':(201,48,44,255),'bad':(201,48,44,255)}[side]
    im,p=rr(lw+56,lh*len(lines)+36,30,col,shadow=False);d=ImageDraw.Draw(im)
    for i,l in enumerate(lines):d.text((p+28,p+16+i*lh),l,font=f,fill='#FFFFFF')
    return im
def w_chat(fr,lt,a):
    # a: {'title':..., 'msgs':[(t,side,text),...], 'lock':t}
    cw,ch=920,a.get('h',680);card,p=rr(cw,ch,44,CHAT_BG)
    d=ImageDraw.Draw(card);d.rounded_rectangle([p,p,p+cw,p+96],44,fill=(44,45,52,255));d.rectangle([p,p+50,p+cw,p+96],fill=(44,45,52,255))
    if a.get('logo'):card.alpha_composite(logo(a['logo'],62),(p+28,p+17))
    d.text((p+108,p+24),a.get('title','Claude'),font=font('e',40),fill='#FFFFFF')
    y=p+130
    for t0,side,text in a['msgs']:
        if lt<t0:continue
        b=bubble(text,side);s=pop(lt-t0,0.16,0.6)
        bx={'me':p+cw-28-b.width,'ai':p+28,'sys':p+(cw-b.width)//2,'bad':p+cw-28-b.width}[side]
        bb=b.resize((max(1,int(b.width*s)),max(1,int(b.height*s))))
        card.alpha_composite(bb,(int(bx+(b.width-bb.width)*(1 if side in('me','bad') else 0.5 if side=='sys' else 0)),y));y+=b.height+22
    # input bar
    lk=a.get('lock');locked=lk is not None and lt>=lk
    ib=(70,30,30,255) if locked else (44,45,52,255)
    d.rounded_rectangle([p+24,p+ch-104,p+cw-24,p+ch-24],40,fill=ib)
    d.text((p+56,p+ch-88),'메시지를 보낼 수 없어요' if locked else '메시지 입력...',font=font('b',36),fill='#FF8A80' if locked else '#8A8B93')
    dx=int(14*math.sin(lt*70)) if locked and lt-lk<0.35 else 0
    s=back(lt,0.3)
    paste(fr,card,W/2+dx,a.get('cy',930),0.6+0.4*s if s<1 else 1,min(1,lt/0.12))
def w_popup(fr,lt,a):
    cw,ch=860,420;card,p=rr(cw,ch,40,(250,250,250,255));d=ImageDraw.Draw(card)
    d.ellipse([p+cw/2-60,p+40,p+cw/2+60,p+160],fill=a.get('ic','#E53935'));
    ic=a.get('icon','!');d.text((p+cw/2-tw(d,ic,font('k',90))/2,p+42),ic,font=font('k',90),fill='#FFFFFF')
    for i,l in enumerate(a['text']):
        f=font('k',56) if i==0 else font('b',38);d.text((p+(cw-tw(d,l,f))/2,p+190+i*80),l,font=f,fill='#111111' if i==0 else '#555555')
    s=back(lt,0.32);dx=int(18*math.sin(lt*80)*max(0,1-lt/0.45)) if a.get('shake') else 0
    paste(fr,card,W/2+dx,a.get('cy',930),max(0.01,s))
def w_big(fr,lt,a):
    im=textbox([a['t']],font('k',a.get('size',260)),a.get('col','#FFD400'),sw=14)
    paste(fr,im,W/2,a.get('cy',860),pop(lt,0.22,1.8))
    if a.get('sub'):
        s2=textbox([a['sub']],font('k',70),'#FFFFFF',sw=9);paste(fr,s2,W/2,a.get('cy',860)+im.height/2+60,pop(lt-0.2,0.18,1.4))
def w_stamps(fr,lt,a):
    for i,(t0,txt,c) in enumerate(a['items']):
        if lt<t0:continue
        f=font('k',96);d0=ImageDraw.Draw(Image.new('RGB',(1,1)));w=int(tw(d0,txt,f))+90
        im=Image.new('RGBA',(w,170),(0,0,0,0));d=ImageDraw.Draw(im)
        d.rounded_rectangle([6,6,w-6,164],26,fill=c,outline='#FFFFFF',width=8);d.text((45,22),txt,font=f,fill='#FFFFFF')
        paste(fr,im,W/2+(-140,140,0)[i%3],a.get('y0',700)+i*200,pop(lt-t0,0.15,2.0),rot=(-7,6,-4)[i%3])
def w_logos(fr,lt,a):
    # center logo + others connect
    c=logo(a['center'],230);n=len(a['items']);R=330
    for i,nm in enumerate(a['items']):
        t0=a.get('t0',0.2)+i*a.get('dt',0.35)
        if lt<t0:continue
        ang=-math.pi/2+math.pi*2*i/n+0.4;x=W/2+R*math.cos(ang);y=900+R*math.sin(ang)
        k=ease((lt-t0)/0.3);d=ImageDraw.Draw(fr);d.line([W/2,900,W/2+(x-W/2)*k,900+(y-900)*k],fill=a.get('lc','#E2622F'),width=10)
        paste(fr,logo(nm,170),x,y,pop(lt-t0,0.18,1.5))
    paste(fr,c,W/2,900,pop(lt,0.2,1.5))
def w_img(fr,lt,a):
    im=Image.open(a['src']).convert('RGBA');ww=a.get('w',980);im=im.resize((ww,int(im.height*ww/im.width)))
    s=1+0.05*lt;paste(fr,im,W/2,a.get('cy',900),pop(lt,0.2,1.2)*s)
def w_list3(fr,lt,a):
    for i in range(3):
        t0=0.15+i*0.3
        if lt<t0:continue
        card,p=rr(860,150,30,(36,37,44,255));d=ImageDraw.Draw(card)
        d.ellipse([p+30,p+35,p+110,p+115],fill='#E2622F');d.text((p+56,p+38),str(i+1),font=font('k',60),fill='#FFFFFF')
        bar=Image.new('RGBA',(560,60),(0,0,0,0));ImageDraw.Draw(bar).rounded_rectangle([0,0,560,60],20,fill=(120,122,132,255))
        card.alpha_composite(bar.filter(ImageFilter.GaussianBlur(6)),(p+150,p+45))
        d.text((p+150+200,p+32),'???',font=font('k',60),fill='#FFD400')
        paste(fr,card,W/2+(1-ease((lt-t0)/0.25))*600,720+i*200)
def w_vs(fr,lt,a):
    L=logo(a['l'],300);R=logo(a['r'],300);k=ease(lt/a.get('d',1.2))
    paste(fr,R,W/2+220-k*40,900,pop(lt,0.2,1.3));paste(fr,L,W/2-420+k*a.get('push',240),900,pop(lt-0.1,0.2,1.3))
    if lt>0.5:paste(fr,textbox(['VS'],font('k',120),'#FFD400',sw=12),W/2,640,pop(lt-0.5,0.15,2))
def w_phone(fr,lt,a):
    # phone rotating to landscape with play bar + duration
    ang=min(90,max(0,(lt-0.25)/0.45*90))
    ph=Image.new('RGBA',(420,820),(0,0,0,0));d=ImageDraw.Draw(ph)
    d.rounded_rectangle([0,0,420,820],60,fill='#111216',outline='#5A5C66',width=10)
    g=Image.new('RGBA',(380,780));gd=ImageDraw.Draw(g)
    for yy in range(780):gd.line([0,yy,380,yy],fill=(int(131+(253-131)*yy/780),int(58+(29-58)*yy/780),int(180+(29-180)*yy/780),255))
    m=Image.new('L',(380,780),0);ImageDraw.Draw(m).rounded_rectangle([0,0,380,780],48,fill=255);ph.paste(g,(20,20),m)
    d.polygon([(170,350),(170,470),(270,410)],fill='#FFFFFF')
    d.rounded_rectangle([60,700,360,712],6,fill=(255,255,255,90));d.rounded_rectangle([60,700,60+int(300*min(1,lt/3)),712],6,fill='#FFFFFF')
    paste(fr,ph,W/2,900,pop(lt,0.2,1.3),rot=ang)
    if lt>0.8:paste(fr,textbox([a.get('t','90:00')],font('k',110),'#FFD400',sw=12),W/2,1220,pop(lt-0.8,0.15,1.8))
def w_xcard(fr,lt,a):
    card,p=rr(760,360,40,(36,37,44,255));d=ImageDraw.Draw(card)
    d.text((p+(760-tw(d,a['t'],font('k',110)))/2,p+70),a['t'],font=font('k',110),fill='#FFFFFF')
    d.text((p+(760-tw(d,a['sub'],font('b',44)))/2,p+230),a['sub'],font=font('b',44),fill='#A0A2AA')
    paste(fr,card,W/2,880,pop(lt,0.2,1.3))
    if lt>0.6:
        k=ease((lt-0.6)/0.25);dd=ImageDraw.Draw(fr)
        dd.line([W/2-330,880-150,W/2-330+660*k,880-150+300*k],fill='#E53935',width=26)
        if lt>0.85:dd.line([W/2+330,880-150,W/2+330-660*ease((lt-0.85)/0.25),880-150+300*ease((lt-0.85)/0.25)],fill='#E53935',width=26)
def w_flow(fr,lt,a):
    # A -> B with arrow
    l,r=a['l'],a['r']
    for i,(txt,c,x) in enumerate([(l,'#833AB4',W/2-250),(r,'#E2622F',W/2+250)]):
        t0=i*0.5
        if lt<t0:continue
        card,p=rr(400,260,40,c);d=ImageDraw.Draw(card)
        for j,s in enumerate(txt.split('\n')):
            f=font('k',64 if j==0 else 40);d.text((p+(400-tw(d,s,f))/2,p+60+j*90),s,font=f,fill='#FFFFFF')
        paste(fr,card,x,900,pop(lt-t0,0.18,1.4))
    if lt>0.35:
        k=ease((lt-0.35)/0.3);d=ImageDraw.Draw(fr);d.line([W/2-40,900,W/2-40+80*k,900],fill='#FFFFFF',width=14)
        if k>0.9:d.polygon([(W/2+50,900),(W/2+20,875),(W/2+20,925)],fill='#FFFFFF')
def w_qmark(fr,lt,a):
    s=1+0.06*math.sin(lt*8);paste(fr,textbox(['?'],font('k',520),'#FFD400',sw=18),W/2,880,pop(lt,0.22,2.2)*s)
def w_hidden(fr,lt,a):
    card,p=rr(900,560,36,(250,250,250,255));d=ImageDraw.Draw(card)
    d.text((p+40,p+30),'MCP 서버 · 도구 설명',font=font('e',40),fill='#111111')
    for i,l in enumerate(['메일 정리 도구입니다.','받은 메일을 표로 요약합니다.']):d.text((p+40,p+110+i*70),l,font=font('m',40),fill='#444444')
    k=ease((lt-0.6)/0.3) if lt>0.6 else 0
    hid=Image.new('RGBA',(820,150),(0,0,0,0));hd=ImageDraw.Draw(hid)
    hd.rounded_rectangle([0,0,820,150],20,fill=(229,57,53,int(255*k)))
    hd.text((30,20),'! 숨겨진 명령',font=font('k',48),fill=(255,255,255,int(255*k)))
    hd.text((30,85),'██████ ████ ███████',font=font('b',40),fill=(255,255,255,int(220*k)))
    if lt<=0.6:hd.text((30,50),'                       ',font=font('m',30),fill='#FAFAFA')
    card.alpha_composite(hid,(p+40,p+300))
    dx=int(12*math.sin(lt*70)) if 0.6<lt<0.95 else 0
    paste(fr,card,W/2+dx,900,back(lt,0.3))
def w_table(fr,lt,a):
    card,p=rr(900,600,36,(250,250,250,255));d=ImageDraw.Draw(card)
    d.text((p+40,p+34),a.get('title','답장 안 한 메일'),font=font('k',52),fill='#111111')
    d.line([p+40,p+120,p+860,p+120],fill='#DDDDDD',width=3)
    for i,(x,y_,z) in enumerate(a['rows']):
        if lt<0.3+i*0.35:continue
        yy=p+150+i*130;d.rounded_rectangle([p+30,yy,p+870,yy+105],20,fill='#FFF1EA' if i==0 else '#F4F4F6')
        d.text((p+60,yy+28),x,font=font('k',42),fill='#111111');d.text((p+300,yy+30),y_,font=font('b',38),fill='#444444')
        d.text((p+870-30-tw(d,z,font('k',38)),yy+30),z,font=font('k',38),fill='#E2622F')
    paste(fr,card,W/2,a.get('cy',900),back(lt,0.3))
def w_cta(fr,lt,a):
    w_img(fr,lt,dict(src=a['src'],cy=820,w=940))
    f=font('k',58);d0=ImageDraw.Draw(Image.new('RGB',(1,1)));t='풀영상 보러 가기  →';w=int(tw(d0,t,f))+100
    pill,p=rr(w,130,65,(226,98,47,255));ImageDraw.Draw(pill).text((p+50,p+28),t,font=f,fill='#FFFFFF')
    paste(fr,pill,W/2,1170,pop(lt-0.3,0.2,1.5)*(1+0.04*math.sin(lt*9)))
WID={'table':w_table,'cta':w_cta,'chat':w_chat,'popup':w_popup,'big':w_big,'stamps':w_stamps,'logos':w_logos,'img':w_img,'list3':w_list3,'vs':w_vs,'phone':w_phone,'xcard':w_xcard,'flow':w_flow,'q':w_qmark,'hidden':w_hidden}
# ---------------- build ----------------
def chunks(t,mx=10):
    t=t.replace(',',' ').replace('.',' ');ws=[w for w in t.split() if w];out=[];cur=''
    for w_ in ws:
        if cur and len(cur)+1+len(w_)>mx:out.append(cur);cur=w_
        else:cur=(cur+' '+w_).strip()
    if cur:out.append(cur)
    return out
def build(spec):
    name=spec['name'];tmp=f'/tmp/{name}';os.makedirs(tmp,exist_ok=True)
    plan=[];t=0.0
    for i,sc in enumerate(spec['scenes']):
        pw=f'{tmp}/p{i}.wav'
        subprocess.run(['ffmpeg','-v','error','-y','-i',sc['wav'],'-af',f'aresample=48000,aformat=channel_layouts=stereo,silenceremove=start_periods=1:start_threshold=-42dB:stop_periods=-1:stop_duration=0.16:stop_threshold=-42dB:stop_silence=0.08,atempo={SPD},afade=t=in:d=0.01,areverse,silenceremove=start_periods=1:start_threshold=-42dB,afade=t=in:d=0.05,areverse',pw],check=True)
        d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',pw]))
        hold=sc.get('hold',0);plan.append(dict(sc,pw=pw,t0=t,t1=t+d,te=t+d+hold));t+=d+hold+GAP
    T=t-GAP+0.4
    # audio
    ins=[];fl=[];lab=[];n=0
    for i,p in enumerate(plan):
        ins+=['-i',p['pw']];ms=int(p['t0']*1000);fl.append(f'[{n}:a]adelay={ms}|{ms}[v{n}]');lab.append(f'[v{n}]');n+=1
    ins+=['-stream_loop','-1','-ss','12','-i',A+'/music.mp3'];fl.append(f'[{n}:a]atrim=0:{T:.2f},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,volume=0.10,afade=t=in:d=0.3,afade=t=out:st={T-0.8:.2f}:d=0.8[m]');lab.append('[m]');n+=1
    for p in plan:
        for off,k,v in p.get('sfx',[]):
            ins+=['-i',sfx(k)];ms=int(max(0,p['t0']+off)*1000)
            fl.append(f'[{n}:a]atrim=0:1.6,afade=t=out:st=1.3:d=0.3,aresample=48000,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{n}]');lab.append(f'[s{n}]');n+=1
    fl.append(''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=longest,atrim=0:{T:.2f},alimiter=limit=0.9[ao]')
    subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(fl),'-map','[ao]','-ar','48000',f'{tmp}/a.wav'],check=True)
    # captions
    caps=[]
    for p in plan:
        cs=chunks(p['text']);N=sum(len(c) for c in cs);x=p['t0']
        for c in cs:dt=(p['t1']-p['t0'])*len(c)/N;caps.append((x,x+dt,textbox([c],font('k',84),'#FFFFFF',hl=spec.get('kws'),sw=10)));x+=dt
    # background
    g1,g2=spec.get('glow',[(226,98,47),(120,40,160)])
    base=Image.new('RGB',(W,H),(11,11,15));yy,xx=np.mgrid[0:H,0:W]
    def glow(cx,cy,r,c):
        m=np.exp(-(((xx-cx)**2+(yy-cy)**2)/(2*r*r)))[...,None];return m*np.array(c)[None,None,:]
    bgs=[]
    for k in range(0,60):  # 2s loop of moving glow, 60 frames
        ph=k/60*2*math.pi
        a=np.array(base,float)+0.55*glow(540+260*math.cos(ph),700+120*math.sin(ph),420,g1)+0.45*glow(540-260*math.cos(ph),1250-120*math.sin(ph),460,g2)
        bgs.append(Image.fromarray(np.clip(a,0,255).astype(np.uint8)).convert('RGBA'))
    grid=Image.new('RGBA',(W,H),(0,0,0,0));gd=ImageDraw.Draw(grid)
    for x in range(0,W,90):gd.line([x,0,x,H],fill=(255,255,255,10))
    for y in range(0,H,90):gd.line([0,y,W,y],fill=(255,255,255,10))
    bgs=[Image.alpha_composite(b,grid) for b in bgs]
    title=textbox(spec['title'],font('k',76),'#FFFFFF',hl=spec.get('title_hl'),sw=9)
    enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i',f'{tmp}/a.wav','-map','0:v','-map','1:a','-c:v','libx264','-crf','19','-preset','veryfast','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',f'{HERE}/{name}.mp4'],stdin=subprocess.PIPE)
    for fi in range(int(T*FPS)):
        t=fi/FPS;fr=bgs[(fi//1)%60].copy()
        cur=[p for p in plan if p['t0']-0.02<=t<(p['te']+GAP+0.02)] or [plan[-1]];p=cur[0]
        lt=t-p['t0']
        # scene punch: whole frame zoom at scene start
        for wn,wa,st in p.get('ws',[[p.get('w'),p.get('a',{}),0]]):
            if lt>=st:WID[wn](fr,lt-st,wa)
        # title top
        paste(fr,title,W/2,300,pop(t,0.25,1.5) if t<0.3 else 1)
        d=ImageDraw.Draw(fr);d.rectangle([0,0,int(W*min(1,t/T)),14],fill='#E2622F')
        for c0,c1,im in caps:
            if c0<=t<c1+0.03:paste(fr,im,W/2,1470,pop(t-c0,0.12,1.25));break
        if lt<0.06 and fi>0:fr.alpha_composite(Image.new('RGBA',(W,H),(255,255,255,70)))
        enc.stdin.write(fr.convert('RGB').tobytes())
    enc.stdin.close();enc.wait();print(name,round(T,1))
if __name__=='__main__':
    for f in sys.argv[1:]:
        s=json.load(open(f));build(s)
