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
jobs=[(f'gr_{k}',f'cards/{k}.png','card') for k in ['g1','g2','g3','g4','g5','g6','g7','new','int']]
jobs+=[('gr_sea','cards/sea.png','full'),('gr_lineup','cards/lineup.png','pan')]
with Pool(6) as pl: print(pl.map(job,jobs))
