import numpy as np,subprocess,json,wave,re,sys
AF=sys.argv[1]
R=json.load(open('rec_units.json'));sr=48000
P={}
for l in open('rec_report.txt'):
    m=re.match(r'\s*(\d+)\s+\w+\s+[\d.]+\s+([\d.]+)-\s*([\d.]+)',l)
    if m:P[int(m[1])]=[(float(m[2]),float(m[3]))]
P.update({int(k):v for k,v in json.load(open('rec/fix.json')).items()} if __import__('os').path.exists('rec/fix.json') else {})
pcm=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','rec/take1.m4a','-ac','1','-ar',str(sr),'-af',AF,'-f','s16le','-'],capture_output=True).stdout,np.int16).astype(np.float32)
for k in sorted(P):
    parts=[]
    for i,(a,b) in enumerate(P[k]):
        s=pcm[int(a*sr):int(b*sr)].copy();f=int(.01*sr);g=int(.04*sr);s[:f]*=np.linspace(0,1,f);s[-g:]*=np.linspace(1,0,g);parts.append(s)
        if i<len(P[k])-1:parts.append(np.zeros(int(.12*sr),np.float32))
    x=np.concatenate(parts)
    # drop tiny edge blips (a stray '시', breath, click): runs < 0.45s at the start/end separated by >= 0.2s of quiet
    fr=480;n=len(x)//fr;e=np.array([20*np.log10(np.sqrt(np.mean((x[i*fr:(i+1)*fr]/32768)**2))+1e-9) for i in range(n)]);sp=e>-50;rr=[];i=0
    while i<n:
        if sp[i]:
            j=i
            while j<n and (sp[j] or sp[j+1:j+15].any()):j+=1
            rr.append([i,j]);i=j
        else:i+=1
    while len(rr)>1 and rr[0][1]-rr[0][0]<30 and rr[1][0]-rr[0][1]>=20:print('drop head',k,rr[0]);x[:max(0,(rr[1][0]-8))*fr]=0;rr.pop(0)
    while len(rr)>1 and rr[-1][1]-rr[-1][0]<30 and rr[-1][0]-rr[-2][1]>=20:print('drop tail',k,rr[-1]);x[(rr[-2][1]+10)*fr:]=0;rr.pop()
    w=wave.open(R[k-1]['out'],'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(np.clip(x,-32768,32767).astype(np.int16).tobytes());w.close()
print(len(P))
