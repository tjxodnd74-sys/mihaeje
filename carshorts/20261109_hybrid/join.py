import glob,re,subprocess,json,os
fs=sorted(glob.glob('narr/*.mp3'),key=lambda p:int(re.search(r'audio_(\d+)_',p).group(1)))
long={3,12,16,19}; os.makedirs('_j',exist_ok=True); lst=[]; t=0.3; T=[]
def dur(p): return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout)
def sil(p,d): subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','anullsrc=r=44100:cl=mono','-t',f'{d:.3f}',p],check=True)
sil('_j/s0.wav',0.3); lst.append('_j/s0.wav')
for i,f in enumerate(fs):
    if i: g=0.5 if i in long else 0.22; p=f'_j/g{i}.wav'; sil(p,g); lst.append(p); t+=g
    o=f'_j/v{i}.wav'
    subprocess.run(['ffmpeg','-v','error','-y','-i',f,'-af','silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse','-ar','44100','-ac','1',o],check=True)
    d=dur(o); T.append([round(t,3),round(t+d,3)]); lst.append(o); t+=d
sil('_j/end.wav',1.2); lst.append('_j/end.wav'); t+=1.2
open('_j/l.txt','w').write(''.join(f"file '{os.path.abspath(p)}'\n" for p in lst))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i','_j/l.txt','narr.wav'],check=True)
json.dump(T,open('times.json','w')); print(round(t,2)); print(T)
