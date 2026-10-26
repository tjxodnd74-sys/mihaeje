# usage: python3 smooth_kb.py <workdir>  (needs <workdir>/cards/*.png, writes <workdir>/bg/*.mp4)
# smooth Ken Burns for still cards: subpixel affine per frame -> no pixel-snapping jitter
import sys, subprocess, os
from PIL import Image
from multiprocessing import Pool
S=sys.argv[1]; os.chdir(S)
FPS=30; DUR=7.0; N=int(FPS*DUR)
def ease(x): return x*x*(3-2*x)
def job(args):
    name, src, mode = args
    im=Image.open(src).convert('RGB'); W,H=1080,1920
    p=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
        '-c:v','libx264','-preset','veryfast','-crf','14','-pix_fmt','yuv420p',f'bg/{name}.mp4'],stdin=subprocess.PIPE)
    for i in range(N):
        t=i/(N-1)
        if mode=='pan':   # lineup: slide left->right across the full width
            x=(im.width-W)*ease(t)
            fr=im.transform((W,H),Image.AFFINE,(1,0,x,0,1,0),resample=Image.BICUBIC)
        else:             # gentle push-in toward the car centre
            z=1.0+0.045*t; cx,cy=540,(930 if mode=='card' else 960)
            fr=im.transform((W,H),Image.AFFINE,(1/z,0,cx-cx/z,0,1/z,cy-cy/z),resample=Image.BICUBIC)
        p.stdin.write(fr.tobytes())
    p.stdin.close(); p.wait(); return name
# every cards/<name>.png becomes bg/<name>.mp4 ; name starting with "pan_" slides across, "full_" pushes in at centre, others = car card
import glob as _g
jobs=[]
for f in sorted(_g.glob('cards/*.png')):
    n=os.path.splitext(os.path.basename(f))[0]
    mode='pan' if n.startswith('pan_') else ('full' if n.startswith('full_') else 'card')
    jobs.append((n,f,mode))
with Pool(6) as pl: print(pl.map(job,jobs))
