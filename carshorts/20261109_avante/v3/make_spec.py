import json
T=json.load(open('times.json')); TOTAL=round(T[-1][1]+1.0,2)
st=lambda i: 0 if i==0 else round(T[i][0]-0.1,3)   # visual start of sentence i
# caption chunks per sentence: (text, spoken weight)
CAP=[[('신형 아반떼',5),('먼저 산 사람들',6),('지금 |제대로 뒤통수|',8),('맞았다는데',5)],
 [('나온 지 |석 달| 만에',6),('|100만 원|을',5),('깎아주기 시작함',7)],
 [('근데 진짜',4),('|열받는 건|',4),('따로 있음',4)],
 [('기본 트림은',5),('운전석 |계기판|이',7),('|35만 원|짜리',6),('옵션이었거든',6)],
 [('그걸 이제',4),('|공짜로| 달아준다는 거임',10)],
 [('첫날에만',4),('|1만 1천 대| 넘게',7),('계약한 사람들은',7),('|돈 다 내고| 산 거고',9)],
 [('정작 판매는',5),('한 달 만에',4),('|20% 넘게| 빠졌음',10)],
 [('계기판을 옵션으로',8),('팔던 국민차',5),('여러분이면',5),('|지금 사요?|',4)]]
caps=[]
for i,ch in enumerate(CAP):
    a,b=T[i]; tot=sum(w for _,w in ch); x=a
    for j,(txt,w) in enumerate(ch):
        d=(b-a)*w/tot; end=x+d if j<len(ch)-1 else (T[i+1][0]-0.05 if i<7 else TOTAL)
        caps.append([round(x,3),round(end,3),txt]); x+=d
# shots: (start, src, mode, extra)
def F(src,**k): return {**dict(src=src,mode='full',s0=1.0,s1=1.06),**k}
def Wd(src,**k): return {**dict(src=src,mode='wide',s0=1.0,s1=1.05),**k}
SH=[(0.0,F('web/a06.jpg',pos='42% 50%',s0=1.0,s1=1.08,flash=True)),
 (1.35,Wd('src/15.jpg',pos='50% 60%')),
 (2.45,F('web/a09.jpg',pos='40% 50%',shake=.3)),
 (st(1),F('web/a00.jpg',pos='45% 55%')),
 (st(1)+1.25,Wd('src/06.jpg',pos='50% 60%')),
 (st(2),Wd('src/21.jpg',pos='50% 60%',s0=1.08,s1=1.0)),
 (st(2)+0.95,F('web/a13.jpg',pos='50% 45%',shake=.35,flash=True)),
 (st(3),F('web/a01.jpg',pos='50% 40%',s0=1.15,s1=1.2)),
 (st(3)+1.3,F('web/a07.jpg',pos='45% 50%',blur=6)),
 (st(4),F('web/a10.jpg',pos='50% 50%',blur=6,punch=False)),
 (st(5),Wd('src/20.jpg',pos='50% 90%',blur=4)),
 (st(5)+1.6,F('web/a03.jpg',pos='35% 50%')),
 (st(5)+2.5,F('web/a05.jpg',pos='40% 50%')),
 (st(6),F('web/a04.jpg',pos='45% 50%',blur=8)),
 (st(7),F('web/a02.jpg',pos='42% 50%')),
 (st(7)+1.35,F('web/a06.jpg',pos='42% 50%',s0=1.12,s1=1.0,flash=True))]
shots=[]
for k,(t0,s) in enumerate(SH):
    s['t0']=round(t0,3); s['t1']=round(SH[k+1][0],3) if k<len(SH)-1 else TOTAL; shots.append(s)
gfx=[dict(type='stamp',t0=round(T[1][0]+0.85,3),t1=st(2),small='출시 석 달 만에',text='-100만 원'),
 dict(type='price',t0=round(T[3][0]+1.45,3),t1=st(5),label='모던 트림 운전석 계기판',from_='',strikeAt=round(T[4][0]+0.55-(T[3][0]+1.45),3)),
 dict(type='count',t0=round(T[5][0]+0.05,3),t1=round(T[5][0]+1.75,3),label='출시 첫날 계약',n=11094,unit='대'),
 dict(type='sales',t0=round(T[6][0]-0.05,3),t1=st(7),head='신형 아반떼 월 판매',a=6945,b=5501,la='9월',lb='10월',badge='▼ 20.8%'),
 dict(type='ask',t0=round(T[7][0]+2.0,3),t1=TOTAL,text='댓글로 알려줘')]
gfx[1]['from']='35만 원'; gfx[1]['to']='0원'; del gfx[1]['from_']
S=dict(total=TOTAL,title=['먼저 산 사람만 손해','신형 아반떼 근황'],credit='사진: 현대자동차 · 오토트리뷴',shots=shots,caps=caps,gfx=gfx)
json.dump(S,open('spec_full.json','w'),ensure_ascii=False,indent=1); print(TOTAL,len(shots),len(caps))
