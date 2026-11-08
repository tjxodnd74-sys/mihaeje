import json
T=json.load(open('times.json')); TOTAL=round(T[-1][1]+1.0,2)
# per sentence: caption chunks [(display, spoken-weight)], shots, overlay
SEG=[
 ([('신형 아반떼는',6),('출시 첫날에만',6),('|1만 1천 대| 넘게 계약된 차임',10)],
  [dict(src='web/a06.jpg',frac=.45,s0=1.0,s1=1.06),dict(src='clips/d1.webm',frac=.55,s0=1.0,s1=1.04,v0=0)],None),
 ([('근데 이 차를 먼저 산 사람들이',12),('지금 |단단히 화났다는데|',10)],
  [dict(src='clips/d2.webm',frac=1,s0=1.0,s1=1.05,v0=0.5)],None),
 ([('출시 석 달 만에',6),('|100만 원 할인|에',6)],
  [dict(src='clips/d5.webm',frac=1,s0=1.0,s1=1.04,v0=0.3)],dict(type='stk',small='K-세일페스타 (11.1~12.31)',text='가솔린 100만 원 할인')),
 ([('|35만 원| 받던 계기판까지',12),('|공짜로| 달아주기 시작했기 때문',13)],
  [dict(src='web/a07.jpg',frac=.5,s0=1.1,s1=1.16,pos='50% 45%'),dict(src='web/a01.jpg',frac=.5,s0=1.15,s1=1.2)],dict(type='stk',small='모던 트림 9.9인치 디스플레이',text='35만 원 → 0원')),
 ([('기본 트림은',5),('운전석 앞 계기판 달려면',10),('|돈을 더| 내야 했거든',8)],
  [dict(src='web/a02.jpg',frac=.5,s0=1.0,s1=1.05),dict(src='web/a05.jpg',frac=.5,s0=1.1,s1=1.15,pos='50% 40%')],dict(type='stk',small='모던 트림',text='운전석 앞 디스플레이 = 유료 옵션')),
 ([('근데 이 혜택,',5),('차 절반 가까이 사 간',8),('|법인은 또 빠졌다|고 함',9)],
  [dict(src='clips/d3.webm',frac=1,s0=1.0,s1=1.05,v0=0)],dict(type='stk',small='9월 신규등록 48.7%가 법인',text='무상 장착은 법인 제외')),
 ([('10월 판매는 |5,501대|로',12),('한 달 만에 |20% 넘게| 빠졌고',15)],
  [dict(src='clips/d4.webm',frac=1,s0=1.05,s1=1.1,v0=0,blur=10)],dict(type='sales')),
 ([('와 계기판을 옵션으로 팔던',11),('국민차라니',5),('|진짜 놀라울 따름|이네',9)],
  [dict(src='clips/d6.webm',frac=.5,s0=1.0,s1=1.04,v0=0.5),dict(src='web/a06.jpg',frac=.5,s0=1.0,s1=1.08)],None),
]
segs=[]
for i,(caps,shots,ov) in enumerate(SEG):
    a,b=T[i]; t0=0 if i==0 else round(T[i][0]-0.12,3)
    tot=sum(w for _,w in caps); c=[]; x=a-t0
    for j,(txt,w) in enumerate(caps):
        d=(b-a)*w/tot; c.append([round(x,3),round(x+d if j<len(caps)-1 else (T[i+1][0]-0.12-t0 if i<7 else 99),3),txt]); x+=d
    segs.append(dict(t0=t0,shots=shots,ov=ov,caps=c))
S=dict(total=TOTAL,title=['먼저 산 사람들 분통 터진','신형 아반떼 근황'],credit='사진·영상: 현대자동차 · 오토트리뷴',segs=segs)
json.dump(S,open('spec_full.json','w'),ensure_ascii=False,indent=1); print(TOTAL)
