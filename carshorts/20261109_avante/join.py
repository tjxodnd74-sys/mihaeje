# python3 join.py [narr_dir] [atempo]  -> narr.wav, times.json  (gap 0.3s between sentences)
import glob,re,subprocess,json,os,sys
D=sys.argv[1] if len(sys.argv)>1 else 'narr'; AT=sys.argv[2] if len(sys.argv)>2 else None
fs=sorted(glob.glob(D+'/*.mp3'),key=lambda p:int(re.search(r'audio_(\d+)_',p).group(1)))
os.makedirs('_j',exist_ok=True); lst=[]; t=0.25; T=[]
def dur(p): return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout)
def sil(p,d): subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','anullsrc=r=44100:cl=mono','-t',f'{d:.3f}',p],check=True)
sil('_j/s0.wav',0.25); lst.append('_j/s0.wav')
for i,f in enumerate(fs):
    if i: g=0.45 if i in (2,6,7) else 0.3; p=f'_j/g{i}.wav'; sil(p,g); lst.append(p); t+=g
    o=f'_j/v{i}.wav'; af='silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse'
    if AT: af+=f',atempo={AT}'
    subprocess.run(['ffmpeg','-v','error','-y','-i',f,'-af',af,'-ar','44100','-ac','1',o],check=True)
    d=dur(o); T.append([round(t,3),round(t+d,3)]); lst.append(o); t+=d
sil('_j/end.wav',1.0); lst.append('_j/end.wav'); t+=1.0
open('_j/l.txt','w').write(''.join(f"file '{os.path.abspath(p)}'\n" for p in lst))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i','_j/l.txt','narr.wav'],check=True)
json.dump(T,open('times.json','w')); print(round(t,2)); print(T)
