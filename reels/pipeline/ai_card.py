# usage: python3 ai_card.py <in_16x9.mp4> <out.mp4> [centre_y=930]
# Places a landscape AI driving clip into the history-card layout: 1080x1920 charcoal spotlight
# background, clip scaled to 1080 wide around y=930 with soft 70px top/bottom fades. Keeps the clip's audio.
import sys, subprocess, os, tempfile
from PIL import Image
src, out = sys.argv[1], sys.argv[2]; cy = int(sys.argv[3]) if len(sys.argv) > 3 else 930
W, H = 1080, 1920
bg = Image.new('RGB', (W, H), (14, 14, 17))
g = Image.eval(Image.radial_gradient('L').resize((1800, 1800)), lambda v: 255 - v)
m = Image.new('L', (W, H), 0); m.paste(g, (W//2 - 900, cy - 900))
bg = Image.composite(Image.new('RGB', (W, H), (48, 48, 56)), bg, m)
tmp = os.path.join(tempfile.mkdtemp(), 'bg.png'); bg.save(tmp)
vh = 608; y = cy - vh//2
has_a = 'audio' in subprocess.run(['ffprobe','-v','error','-show_entries','stream=codec_type','-of','csv=p=0',src],capture_output=True,text=True).stdout
fc = (f"[1:v]fps=30,scale={W}:{vh}:flags=lanczos,eq=brightness=0.03,format=rgba,"
      f"geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*min(1,min(Y/70,({vh}-1-Y)/70))'[v];"
      f"[0:v][v]overlay=0:{y}:shortest=1,format=yuv420p[o]")
cmd = ['ffmpeg','-loglevel','error','-y','-loop','1','-framerate','30','-i',tmp,'-i',src,'-filter_complex',fc,'-map','[o]']
cmd += (['-map','1:a','-c:a','aac','-ar','44100','-ac','2'] if has_a else [])
cmd += ['-c:v','libx264','-preset','veryfast','-crf','16','-shortest',out]
subprocess.run(cmd, check=True); print('OK', out)
