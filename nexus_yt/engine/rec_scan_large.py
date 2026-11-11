import subprocess,numpy as np,json,re
from faster_whisper import WhisperModel
M=WhisperModel('large-v3',device='cpu',compute_type='int8')
V=json.load(open('voice.json'))
a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','voice_plain.wav','-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,np.float32)
# per placed unit audio region; transcribe with a prompt that makes whisper write '다시' when it hears it
starts=sorted(set(round(l[0],2) for l in V['lines']))
L=V['lines']
for i,l in enumerate(L):
    t0=l[0]-0.15;t1=l[1]+0.15
    s,_=M.transcribe(a[int(max(0,t0)*16000):int(t1*16000)],language='ko',beam_size=5,word_timestamps=True,condition_on_previous_text=False,initial_prompt='다시. 다시 말할게요.')
    ws=[(w.start+t0,w.word.strip()) for x in s for w in x.words]
    txt=' '.join(w for _,w in ws)
    hit=[f'{int(t//60)}:{t%60:05.2f}' for t,w in ws if re.sub(r'[^가-힣]','',w) in ('다시','시')]
    exp=l[2].count('다시')
    flag='!!' if len(hit)>exp else '  '
    print(flag,i,f'{int(l[0]//60)}:{l[0]%60:05.2f}',l[2],'||',txt,'||',hit,flush=True)
import glob
for f in sorted(glob.glob('sv4/tmp_p/l*.wav'),key=lambda x:int(x.split('/l')[-1][:-4])):
    b=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,np.float32)
    s,_=M.transcribe(b,language='ko',beam_size=5,word_timestamps=True,condition_on_previous_text=False,initial_prompt='다시. 다시 말할게요.')
    ws=[(w.start,w.word.strip()) for x in s for w in x.words]
    hit=[f'{t:.2f}' for t,w in ws if re.sub(r'[^가-힣]','',w) in ('다시','시')]
    print('!!' if hit else '  ','SHORT',f,'||',' '.join(w for _,w in ws),'||',hit,flush=True)
