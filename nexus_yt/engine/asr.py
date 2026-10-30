import sys,json,re,difflib
from faster_whisper import WhisperModel
m=WhisperModel('medium',device='cpu',compute_type='int8')
U=json.load(open('units.json'))
files=sys.argv[1:]
norm=lambda s:re.sub(r'[^가-힣0-9a-zA-Z]','',s)
for f in files:
    k=int(re.search(r'u(\d+)',f).group(1))
    import subprocess,numpy as np
    a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-ar','16000','-ac','1','-f','f32le','-'],capture_output=True).stdout,np.float32)
    segs,_=m.transcribe(a,language='ko',beam_size=5,condition_on_previous_text=False)
    t=''.join(s.text for s in segs)
    r=difflib.SequenceMatcher(None,norm(U[k]['text']),norm(t)).ratio()
    print(json.dumps({'f':f,'k':k,'r':round(r,3),'asr':t.strip()},ensure_ascii=False),flush=True)
