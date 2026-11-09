# shots & graphics cut exactly on caption chunks (word timings from whisper -> words.json)
import json
T=json.load(open('times.json')); W=json.load(open('words.json')); TOTAL=round(T[-1][1]+1.0,2)
CH=[[(0,1,'신형 아반떼'),(2,4,'먼저 산 사람들'),(5,7,'지금 |제대로 뒤통수|'),(8,8,'맞았다는데')],
 [(0,4,'나온 지 |석 달| 만에'),(5,5,'|100만 원|을'),(6,7,'깎아주기 시작함')],
 [(0,1,'근데 진짜'),(2,4,'|열받는 건|'),(5,6,'따로 있음')],
 [(0,1,'기본 트림은'),(2,3,'운전석 |계기판|이'),(4,4,'|35만 원|짜리'),(5,5,'옵션이었거든')],
 [(0,1,'그걸 이제'),(2,4,'|공짜로| 달아준다는 거임')],
 [(0,0,'첫날에만'),(1,2,'|1만 1천 대| 넘게'),(3,4,'계약한 사람들은'),(5,8,'|돈 다 내고| 산 거고')],
 [(0,1,'정작 판매는'),(2,3,'한 달 만에'),(4,7,'|20% 넘게| 빠졌음')],
 [(0,1,'계기판을 옵션으로'),(2,3,'팔던 국민차'),(4,4,'여러분이면'),(5,6,'|지금 사요?|')]]
st={}  # (sentence,chunk) -> start time
flat=[]
for i,ch in enumerate(CH):
    for j,(a,b,txt) in enumerate(ch):
        s=0.0 if (i,j)==(0,0) else round(W[i][a][1]-0.06,3); st[(i,j)]=s; flat.append([s,None,txt])
for k in range(len(flat)): flat[k][1]=flat[k+1][0] if k<len(flat)-1 else TOTAL
w=lambda i,k: round(W[i][k][1]-0.06,3)   # word start
def F(src,**k): return {**dict(src=src,mode='full',s0=1.0,s1=1.05,punch=0.04),**k}
def Wd(src,**k): return {**dict(src=src,mode='wide',s0=1.0,s1=1.04,punch=0.04),**k}
SH=[(st[0,0],F('web/a06.jpg',pos='42% 50%',s0=1.0,s1=1.08)),
 (st[0,1],F('web/a00.jpg',pos='45% 55%')),
 (st[0,2],F('web/a09.jpg',pos='40% 50%',s0=1.0,s1=1.1)),
 (st[1,0],Wd('src/15.jpg',pos='50% 60%')),
 (st[1,1],Wd('src/06.jpg',pos='50% 60%',blur=5)),
 (st[2,0],F('web/a04.jpg',pos='45% 50%',s0=1.0,s1=1.12)),
 (st[3,0],F('web/a02.jpg',pos='42% 50%')),
 (st[3,1],F('web/a01.jpg',pos='50% 40%',s0=1.15,s1=1.2)),
 (st[3,2],F('web/a07.jpg',pos='45% 50%',blur=6)),
 (st[5,0],Wd('src/20.jpg',pos='50% 90%',blur=4)),
 (st[5,3],Wd('src/21.jpg',pos='50% 60%')),
 (st[6,0],F('web/a03.jpg',pos='40% 50%',blur=8)),
 (st[7,0],F('web/a10.jpg',pos='50% 50%')),
 (st[7,1],F('web/a06.jpg',pos='42% 50%',s0=1.1,s1=1.0))]
shots=[]
for k,(t0,s) in enumerate(SH):
    s['t0']=round(t0,3); s['t1']=round(SH[k+1][0],3) if k<len(SH)-1 else TOTAL; shots.append(s)
pr0=st[3,2]
gfx=[dict(type='stamp',t0=st[1,1],t1=st[2,0],small='출시 석 달 만에',text='-100만 원',calm=1),
 dict(type='price',t0=pr0,t1=st[5,0],label='모던 트림 운전석 계기판',strikeAt=round(w(4,2)-pr0,3)),
 dict(type='count',t0=st[5,1],t1=st[5,3],label='출시 첫날 계약',n=11094,unit='대'),
 dict(type='sales',t0=st[6,0],t1=st[7,0],head='신형 아반떼 월 판매',a=6945,b=5501,la='9월',lb='10월',badge='▼ 20.8%',badgeAt=round(w(6,4)-st[6,0],3)),
 dict(type='ask',t0=st[7,2],t1=TOTAL,text='댓글로 알려줘')]
for g in gfx:
    if g['type']=='price': g['from']='35만 원'; g['to']='0원'
S=dict(capPop=0.06,total=TOTAL,title=['먼저 산 사람만 손해','신형 아반떼 근황'],credit='사진: 현대자동차 · 오토트리뷴',shots=shots,caps=flat,gfx=gfx)
json.dump(S,open('spec_full.json','w'),ensure_ascii=False,indent=1)
for c in flat: print(c)
print([(s['t0'],s['src']) for s in shots])
