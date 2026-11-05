import subprocess,json,sys
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageEnhance
import os
A=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets');F=A+'/fonts/';SFX=A+'/sfx/'
# name, ep dir, thumb, segments, hook lines, highlight, end lines
S={
 's21':('/home/claude/ep21','/home/claude/up21.jpg',[(0.6,8.2),(21.6,32.4),(64.2,70.3),(34.1,36.7)],
        ['클로드한테 욕하면','대화가 끊긴다?'],'끊긴다',['한 번만 욕해도 걸릴까?','답은 풀영상에서']),
 's20':('/home/claude/ep20','/home/claude/up20.jpg',[(0.6,11.2),(111.7,118.8),(102.4,104.1)],
        ['AI한테 메일함','열어주면 생기는 일'],'메일함',['꼭 지킬 3가지','풀영상에서 공개']),
 's19':('/home/claude/ep19','/home/claude/ep19/th/thumb4.png',[(0.6,6.2),(33.6,38.1),(43.5,48.3),(48.8,55.6),(90.8,92.4)],
        ['인스타가 유튜브를','잡아먹으려 한다'],'유튜브',['나한테 뭐가 달라질까?','답은 풀영상에서']),
}
fH=ImageFont.truetype(F+'Pretendard-Black.otf',100);fC=ImageFont.truetype(F+'Pretendard-ExtraBold.otf',58)
fE=ImageFont.truetype(F+'Pretendard-Black.otf',92);fS=ImageFont.truetype(F+'Pretendard-Bold.otf',40)
W,H=1080,1920;Y=700;VH=608;END=2.8
def stroke(d,xy,t,f,fill,sw=8):d.text(xy,t,font=f,fill=fill,stroke_width=sw,stroke_fill='#000000')
def bgbase(th):
    im=Image.open(th).convert('RGB');s=max(W/im.width,H/im.height)
    im=im.resize((int(im.width*s)+1,int(im.height*s)+1));x=(im.width-W)//2;im=im.crop((x,0,x+W,H))
    im=im.filter(ImageFilter.GaussianBlur(38));im=ImageEnhance.Brightness(im).enhance(0.28);return im
def lines_center(d,lines,hl,f,y0,step,col='#FFFFFF',hc='#FFD400'):
    y=y0
    for ln in lines:
        w=d.textlength(ln,font=f);x=(W-w)/2
        if hl and hl in ln:
            a,b=ln.split(hl,1);stroke(d,(x,y),a,f,col);x2=x+d.textlength(a,font=f);stroke(d,(x2,y),hl,f,hc)
            stroke(d,(x2+d.textlength(hl,font=f),y),b,f,col)
        else:stroke(d,(x,y),ln,f,col)
        y+=step
def make_bg(name,th,hook,hl):
    im=bgbase(th);d=ImageDraw.Draw(im)
    lines_center(d,hook,hl,fH,330,128)
    d.rounded_rectangle([0,Y-6,W,Y+VH+6],radius=0,fill='#000000')
    im.save(f'{name}_bg3.png')
def make_end(name,th,end):
    im=bgbase(th);d=ImageDraw.Draw(im)
    lines_center(d,end[:1],None,fE,330,120,'#FFFFFF')
    t=Image.open(th).convert('RGB').resize((W,VH));im.paste(t,(0,Y))
    lines_center(d,end[1:],'풀영상',fE,Y+VH+70,120,'#FFFFFF')
    b='▶  넥서스 AI 채널에서 전체 보기';w=d.textlength(b,font=fS)
    d.rounded_rectangle([(W-w)/2-36,Y+VH+220,(W+w)/2+36,Y+VH+300],radius=40,fill='#E2622F');d.text(((W-w)/2,Y+VH+237),b,font=fS,fill='#FFFFFF')
    im.save(f'{name}_end.png')
def wrap(t,d,maxw=980):
    if d.textlength(t,font=fC)<=maxw:return [t]
    ws=t.split(' ');best=None
    for i in range(1,len(ws)):
        a,b=' '.join(ws[:i]),' '.join(ws[i:]);m=max(d.textlength(a,font=fC),d.textlength(b,font=fC))
        if best is None or m<best[0]:best=(m,[a,b])
    return best[1]
def cap(t,path):
    im=Image.new('RGBA',(W,200),(0,0,0,0));d=ImageDraw.Draw(im);ls=wrap(t.rstrip(',.'),d);y=(200-len(ls)*78)/2
    for l in ls:
        w=d.textlength(l,font=fC);stroke(d,((W-w)/2,y),l,fC,'#FFFFFF',7);y+=78
    im.save(path)
if len(sys.argv)>1 and sys.argv[1].endswith('.json'):
    j=json.load(open(sys.argv[1]));S={j['name']:(j['ep'],j['thumb'],j['segs'],j['hook'],j['hl'],j['end'])};sys.argv=sys.argv[:1]
for name in (sys.argv[1:] or S):
    ep,th,segs,hook,hl,end=S[name];make_bg(name,th,hook,hl);make_end(name,th,end)
    L=json.load(open(ep+'/voice.json'))['lines'];src=ep+'/final.mp4';caps=[];off=0
    for a,b in segs:
        for l in L:
            if l[0]>=a-0.05 and l[1]<=b+0.3:caps.append((l[0]-a+off,min(l[1],b)-a+off,l[2]))
        off+=b-a
    T=off;k=len(segs);ins=[]
    for a,b in segs:ins+=['-ss',str(a),'-t',str(b-a),'-i',src]
    ins+=['-loop','1','-t',str(T+END),'-i',f'{name}_bg3.png','-loop','1','-t',str(T+END),'-i',f'{name}_end.png','-i',SFX+'4ac6a795-Soft_Whoosh_02.wav','-i',SFX+'32bc6c49-ding.MP3']
    fl=[''.join(f'[{i}:v][{i}:a]' for i in range(k))+f'concat=n={k}:v=1:a=1[v][a0]',
        f'[v]crop=1720:968:110:80,scale={W}:{VH},tpad=stop_mode=clone:stop_duration={END}[vs]',f'[{k}:v][vs]overlay=0:{Y}[o0]']
    cur='o0'
    for j,(t0,t1,t) in enumerate(caps):
        p=f'{name}_k{j}.png';cap(t,p);ins+=['-i',p];idx=k+4+j
        fl.append(f"[{cur}][{idx}:v]overlay=0:{Y+VH+40}:enable='between(t,{t0:.2f},{t1+0.2:.2f})'[o{j+1}]");cur=f'o{j+1}'
    fl.append(f"[{k+1}:v]format=rgba,fade=t=in:st={T:.2f}:d=0.25:alpha=1[e];[{cur}][e]overlay=0:0:enable='gte(t,{T:.2f})'[vo]")
    ms=int(T*1000)
    fl.append(f'[a0]apad=whole_dur={T+END:.2f}[ap];[{k+2}:a]volume=0.5,adelay={ms}|{ms}[w];[{k+3}:a]volume=0.45,adelay={ms+350}|{ms+350}[dg];[ap][w][dg]amix=inputs=3:normalize=0:duration=first[ao]')
    cmd=['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(fl),'-map','[vo]','-map','[ao]','-t',f'{T+END:.2f}','-r','30','-c:v','libx264','-crf','20','-preset','veryfast','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',f'{name}.mp4']
    subprocess.run(cmd,check=True)
    print(name,len(caps),round(T+END,1))
