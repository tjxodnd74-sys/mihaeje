import json,subprocess,glob
S=json.load(open('slots.json'))
segs=sorted(glob.glob('lseg_*.mp4'));open('cl.txt','w').write(''.join(f"file '{s}'\n" for s in segs))
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i','cl.txt','-c','copy','vhtml.mp4'],check=True)
ins=['-i','vhtml.mp4'];fc=[];prev='0:v';n=1;k=0
for s in S:
    cl=s['clips']
    for j,(c,ct) in enumerate(cl):
        a=ct;b=cl[j+1][1] if j+1<len(cl) else s['t1'];d=b-a
        ins+=['-i',f'site/{c}.mp4']
        fi=f'[{n}:v]scale={s["w"]}:{s["h"]}:flags=lanczos,fps=60,tpad=stop_mode=clone:stop_duration=60,trim=0:{d:.3f},format=yuva420p'
        if j==0: fi+=f',fade=t=in:st=0:d=0.3:alpha=1'
        if j==len(cl)-1: fi+=f',fade=t=out:st={d-0.3:.3f}:d=0.3:alpha=1'
        fi+=f',setpts=PTS-STARTPTS+{a:.3f}/TB[f{n}]'
        fc.append(fi)
        if s['kind']=='phone':
            fc.append(f'[f{n}]geq=lum=\'p(X,Y)\':a=\'if(lt(hypot(min(X,W-1-X)-24,min(Y,H-1-Y)-24)*gt(24,min(X,W-1-X))*gt(24,min(Y,H-1-Y)),24)+not(gt(24,min(X,W-1-X))*gt(24,min(Y,H-1-Y))),alpha(X,Y),0)\':cb=\'cb(X,Y)\':cr=\'cr(X,Y)\'[g{n}]');src=f'g{n}'
        else: src=f'f{n}'
        out=f'o{n}';fc.append(f'[{prev}][{src}]overlay={s["x"]}:{s["y"]}:eof_action=pass[{out}]');prev=out;n+=1
fc[-1]=fc[-1].replace(f'[{prev}]','[out]')
open('cfc.txt','w').write(';'.join(fc))
subprocess.run(['ffmpeg','-y','-loglevel','error',*ins,'-filter_complex_script','cfc.txt','-map','[out]','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r','60','vid.mp4'],check=True)
print('ok')
