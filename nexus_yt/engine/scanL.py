import subprocess,numpy as np,json,re,sys
from faster_whisper import WhisperModel
M=WhisperModel('large-v3',device='cpu',compute_type='int8')
R=json.load(open('rec_units.json'))
for k,u in enumerate(R):
  try:a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',u['out'],'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,np.float32)
  except Exception:continue
  if len(a)==0:print('--',k+1,'(no file)',flush=True);continue
  s,_=M.transcribe(a,language='ko',beam_size=5,word_timestamps=True,condition_on_previous_text=False,initial_prompt='다시.')
  ws=[(w.start,w.end,w.word.strip()) for x in s for w in x.words]
  txt=' '.join(w for _,_,w in ws)
  hit=[f'{t0:.2f}' for t0,t1,w in ws if re.sub(r'[^가-힣]','',w) in ('다시','시')]
  ok=u['text'].count('다시')
  print('!!' if len(hit)>ok else '  ',k+1,f'{len(a)/16000:.1f}s',u['text'],'||',txt,'||',hit,flush=True)
