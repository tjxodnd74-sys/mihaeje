import subprocess,numpy as np,json
from faster_whisper import WhisperModel
M=WhisperModel('medium',device='cpu',compute_type='int8')
R=json.load(open('rec_units.json'))
for k,u in enumerate(R):
  a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',u['out'],'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,np.float32)
  e=np.array([20*np.log10(np.sqrt(np.mean(a[q*1600:(q+1)*1600]**2))+1e-9) for q in range(len(a)//1600)])
  sp=e>-55;runs=[];q=0
  while q<len(sp):
    if sp[q]:
      r=q
      while r<len(sp) and (sp[r] or sp[r+1:r+4].any()):r+=1
      runs.append((q/10,r/10));q=r
    else:q+=1
  out=[]
  for x,y in runs:
    s,_=M.transcribe(a[int(max(0,x-0.05)*16000):int((y+0.1)*16000)],language='ko',beam_size=5,condition_on_previous_text=False)
    out.append(f'[{x:.1f}]'+' '.join(t.text.strip() for t in s))
  txt=' '.join(out);fl='!!' if '다시' in txt or len(runs)>3 else '  '
  print(fl,k+1,f'{len(a)/16000:.1f}s',u['text'],'||',txt,flush=True)
