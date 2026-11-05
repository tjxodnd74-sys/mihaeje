import os
HERE=os.path.dirname(os.path.abspath(__file__));LN='/home/claude/sh2/ln/'
def svg(n,fill):return open(f'{HERE}/{n}.svg').read().replace('<svg',f'<svg fill="{fill}"',1)
def W(k):return LN+f'u{k}_0.wav'
O='#E2622F';R='#E5484D';G='#2FA35A';INK='#1F1F1D'
def tile(n,bg,fg,size=220):
    inner=svg(n,fg) if os.path.exists(f'{HERE}/{n}.svg') else f'<img src="{n}.png">'
    return f'<div class="tile" style="background:{bg};width:{size}px;height:{size}px;border-radius:{size//4}px">{inner}</div>'
def chat(logo,lbg,lfg,title,msgs,lock=False,sub='온라인'):
    b=''.join(f'<div class="bub {c} m{i}">{t}</div>' for i,(c,t) in enumerate(msgs))
    lk='<div class="in lock lk" style="position:absolute;left:0;right:0;top:0;bottom:0;margin:0;opacity:0">메시지를 보낼 수 없어요</div>' if lock else ''
    return f'<div class="card chat"><div class="hd"><div class="lg" style="background:{lbg}">{svg(logo,lfg)}</div><b>{title}</b><span>{sub}</span></div><div class="bd">{b}</div><div style="position:relative;margin:16px 34px 34px"><div class="in" style="margin:0">메시지 입력...</div>{lk}</div></div>'
def big(t,size=260,col=INK):return f'<div class="big" style="font-size:{size}px;color:{col}">{t}</div>'
def sub(t,col='#7A7975',size=56):return f'<div class="sub" style="color:{col};font-size:{size}px">{t}</div>'
def stamp(t,col):return f'<div class="stamp" style="color:{col}">{t}</div>'
def dlg(ic,icbg,h,p,bt=None):
    return f'<div class="card dlg"><div class="ic" style="background:{icbg}">{ic}</div><h1>{h}</h1><p>{p}</p>'+(f'<div class="bt">{bt}</div>' if bt else '')+'</div>'
def pill(t,col=INK):return f'<div class="pill" style="color:{col}">{t}</div>'
def cta(img):return f'<div class="cta"><img src="{img}"><div class="go">풀영상 보러 가기 →</div></div>'
def probe(w=380):return f'<img src="probe.png" style="width:{w}px;filter:drop-shadow(0 30px 40px rgba(31,31,29,.25))">'
CY=880  # stage center

c=dict(name='c',title='클로드한테<br><span class="o">욕하면</span> 생기는 일',lines=[
 dict(wav=W(0),cap='클로드한테 욕하면,/이제 진짜 **대화가 끊깁니다**',els=[
   dict(h=dlg('!',R,'대화가 종료됐어요','Claude가 이 대화를 끝냈어요','새 대화 시작'),y=CY,t=0.0,a='pop',shake=[0.0],s='impact')]),
 dict(wav=W(1),cap='**11월 12일**부터/앤트로픽 **이용정책**이/이렇게 바뀌어요',els=[
   dict(h=big('11.12',300,O),y=CY-80,t=0.0,a='pop',s='whoosh'),
   dict(h=pill('앤트로픽 이용정책 개정'),y=CY+150,t='p1',a='up',s='pop')]),
 dict(wav=W(2),cap='AI한테 계속,/이유 없이 **막말하고**/괴롭히는 거,/**금지**',els=[
   dict(h=chat('claude','#D97757','#FFF4EC','Claude',[('bad','야 이것도 못 해? #@$%'),('bad','진짜 %$#@ 쓸모없네'),('bad','@#$%@#$!!')]),y=CY,t=0.0,a='up',
        subs=[dict(q='.m0',t='p0',s='send'),dict(q='.m1',t='p1',s='send'),dict(q='.m2',t='p2',s='send')]),
   dict(h=stamp('금지',R),x=760,y=CY+250,r=-8,t='p3',a='stamp',s='stamp')]),
 dict(wav=W(3),cap='걸리면?/클로드가 먼저/**대화를 끝내** 버려요',els=[
   dict(h=chat('claude','#D97757','#FFF4EC','Claude',[('bad','@#$%@#$!!'),('sys','Claude가 대화를 종료했어요')]),y=CY,t=0.0,a='fade',din=0.15,o='end',
        subs=[dict(q='.m0',t=0.0),dict(q='.m1',t='p2',s='warn')])]),
 dict(wav=W(4),cap='그 대화방엔/더 이상/**메시지도 못 보내요**',cont=True,els=[
   dict(h=chat('claude','#D97757','#FFF4EC','Claude',[('bad','@#$%@#$!!'),('sys','Claude가 대화를 종료했어요')],lock=True),y=CY,t=0.0,a='fade',din=0.01,shake=[0.55],
        subs=[dict(q='.m0',t=-1),dict(q='.m1',t=-1),dict(q='.lk',t='p2',s='impact')])]),
 dict(wav=W(27),cap='새 대화는/열 수 있지만,/그 대화는/**그대로 끝**이에요',els=[
   dict(h=f'<div class="card" style="width:390px;padding:44px 30px;text-align:center"><div style="font-size:90px;font-weight:900;color:{G}">✓</div><div style="font-weight:900;font-size:52px">새 대화</div><div style="font-weight:700;font-size:36px;color:#7A7975;margin-top:10px">바로 가능</div></div>',x=300,y=CY,t='p0',a='left',s='pop'),
   dict(h=f'<div class="card" style="width:390px;padding:44px 30px;text-align:center;border:3px solid {R}"><div style="font-size:90px;font-weight:900;color:{R}">✕</div><div style="font-weight:900;font-size:52px">그 대화방</div><div style="font-weight:700;font-size:36px;color:#7A7975;margin-top:10px">그대로 끝</div></div>',x=780,y=CY,t='p2',a='right',s='pop')]),
 dict(wav=W(5),cap='기존 조항대로라면/**경고**,/**이용 제한**,/**정지**까지/갈 수 있고요',els=[
   dict(h=stamp('경고','#F08C00'),x=380,y=CY-260,r=-7,t='p1',a='stamp',s='stamp'),
   dict(h=stamp('이용 제한',R),x=640,y=CY,r=5,t='p2',a='stamp',s='stamp'),
   dict(h=stamp('정지','#B3261E'),x=420,y=CY+260,r=-4,t='p3',a='stamp',s='stamp')]),
 dict(wav=W(28),cap='앤트로픽은 이걸/**모델 복지**/연구의 하나라고/설명해요',els=[
   dict(h=tile('claude','#D97757','#FFF4EC',200),y=CY-250,t=0.0,a='pop',s='pop'),
   dict(h=big('모델 복지',170),y=CY+20,t='p1',a='up',s='whoosh'),
   dict(h=sub('Model Welfare'),y=CY+180,t='p1+0.15',a='up')]),
 dict(wav=W(6),cap='**무료로** 쓰는 사람도/**예외 없어요**',els=[
   dict(h=big('FREE 플랜도',150),y=CY-90,t=0.0,a='pop',s='whoosh'),
   dict(h=stamp('예외 없음',R),y=CY+150,r=-6,t='p1',a='stamp',s='stamp')]),
 dict(wav=W(29),cap='근데 솔직히,/화나면/**한마디** 할 수도/있잖아요',els=[
   dict(h=probe(420),y=CY+60,t=0.0,a='drop',float=True,s='pop'),
   dict(h='<div class="card" style="padding:28px 40px 34px;font-weight:900;font-size:56px;border-radius:40px">솔직히…</div>',x=600,y=CY-330,t='p1',a='pop',s='pop')]),
 dict(wav=W(7),cap='그럼,/"아 진짜 **틀렸잖아!**"/이 정도도/**걸릴까요?**',els=[
   dict(h=chat('claude','#D97757','#FFF4EC','Claude',[('me','아 진짜 틀렸잖아!')]),y=CY-60,t=0.0,a='up',o='p3-0.05',subs=[dict(q='.m0',t='p1',s='send')]),
   dict(h=big('?',520,O),y=CY,t='p3',a='pop',s='riser')]),
 dict(wav=W(8),cap='답은 **풀영상**에 있어요/욕 대신 쓰면/답이 더 좋아지는/문장까지요',hold=0.7,els=[
   dict(h=cta('th21.jpg'),y=CY-90,t=0.0,a='up',s='whoosh2')],sfx=[['p0+0.4','ding']]),
])

m=dict(name='m',title='AI한테 <span class="o">메일함</span><br>열어주면 생기는 일',lines=[
 dict(wav=W(9),cap='AI한테 내 **메일함**을/열어줬더니,/**진짜로** 메일을 뒤집니다',els=[
   dict(h=chat('gmail','#FFFFFF','#EA4335','AI 비서',[('me','내 메일 보고 답장 안 한 것만 골라 줘'),('ai','메일함 확인 중… 37통 읽는 중')]),y=CY,t=0.0,a='up',
        subs=[dict(q='.m0',t='p0',s='send'),dict(q='.m1',t='p2',s='recv')])]),
 dict(wav=W(10),cap='**답장 안 한** 메일만 골라서,/**표로** 싹 정리해 줘요',els=[
   dict(h='<div class="card tb"><div style="font-weight:900;font-size:50px;margin-bottom:14px">답장 안 한 메일</div>'+''.join(f'<div class="r r{i}"><b>{a}</b><span>{b}</span><i>{c}</i></div>' for i,(a,b,c) in enumerate([('김 팀장','견적서 수정 요청','오늘'),('박 대리','회의 시간 확인','11/6'),('고객 C','배송 문의','11/7')]))+'</div>',
        y=CY,t=0.0,a='up',subs=[dict(q='.r0',t='p1',a='slide',s='click'),dict(q='.r1',t='p1+0.3',a='slide',s='click'),dict(q='.r2',t='p1+0.6',a='slide',s='click')])]),
 dict(wav=W(30),cap='메일함 뒤지는 시간이/**확** 줄어드는 거죠',cont=True,els=[
   dict(h=stamp('정리 끝',G),x=700,y=CY+240,r=-7,t='p1',a='stamp',s='stamp')]),
 dict(wav=W(11),cap='이게 되는 이유가/**MCP**예요/AI랑 앱을 잇는/**연결 규격**이죠',els=[
   dict(h=big('MCP',300,O),y=CY-60,t=0.0,a='pop',s='impact'),
   dict(h=pill('AI ↔ 앱 연결 규격'),y=CY+170,t='p2',a='up',s='pop')]),
 dict(wav=W(12),cap='**지메일**,/**캘린더**,/**노션**까지/한 번에 붙어요',els=[
   dict(h=tile('claude','#D97757','#FFF4EC',230),y=CY,t=0.0,a='pop',s='pop'),
   dict(h=tile('gmail','#FFFFFF','#EA4335',190),x=230,y=CY-300,t='p0',a='pop',s='pop'),
   dict(h=tile('googlecalendar','#FFFFFF','#4285F4',190),x=850,y=CY-300,t='p1',a='pop',s='pop'),
   dict(h=tile('notion','#FFFFFF','#111111',190),x=540,y=CY+330,t='p2',a='pop',s='pop')]),
 dict(wav=W(31),cap='**구글**이랑 **오픈AI**도/이 규격을/같이 쓰고 있어요',els=[
   dict(h=tile('google','#FFFFFF','#4285F4',230),x=300,y=CY-60,t='p0',a='left',s='whoosh'),
   dict(h=tile('openai','#111111','#FFFFFF',230),x=780,y=CY-60,t='p0+0.35',a='right',s='whoosh'),
   dict(h=pill('같은 규격 사용 중',O),y=CY+200,t='p1',a='up',s='pop')]),
 dict(wav=W(13),cap='근데 여기서,/진짜 **무서운** 게 있어요',els=[
   dict(h=big('근데…',260,R),y=CY,t=0.0,a='pop',s='down')]),
 dict(wav=W(14),cap='출처 모르는 **MCP 서버**에/**숨겨 둔 명령**으로,/AI를 속이는 공격이/**실제로** 보고됐어요',els=[
   dict(h='<div class="card code"><div style="font-weight:900;font-size:40px;color:#1F1F1D;margin-bottom:18px">MCP 서버 · 도구 설명</div>메일을 표로 정리해 주는 도구입니다.<br>받은 메일을 요약합니다.<br><span class="hide hd">숨겨진 명령: ████ ██ █████</span></div>',
        y=CY-40,t=0.0,a='up',subs=[dict(q='.hd',t='p1',s='warn')]),
   dict(h=stamp('실제 보고됨',R),x=680,y=CY+260,r=-6,t='p3',a='stamp',s='stamp')]),
 dict(wav=W(15),cap='연결 한 번 잘못하면,/내 메일이 **통째로**/새어 나갈 수도 있어요',els=[
   dict(h=dlg('!',R,'메일 유출 위험','연결 한 번 잘못하면'),y=CY,t=0.0,a='pop',shake=[0.0],s='impact')]),
 dict(wav=W(32),cap='**권한**을 많이 줄수록,/**피해**도 커지고요',els=[
   dict(h=stamp('권한 ↑','#F08C00'),x=380,y=CY-120,r=-6,t='p0',a='stamp',s='stamp'),
   dict(h=stamp('피해 ↑',R),x=660,y=CY+140,r=5,t='p1',a='stamp',s='stamp')]),
 dict(wav=W(16),cap='그래서 꼭 지켜야 할 게/딱 **세 가지** 있어요',els=[
   dict(h='<div class="card tb">'+''.join(f'<div class="r r{i}"><b style="width:90px;color:{O}">0{i+1}</b><span style="filter:blur(9px)">필요한 앱만 연결하기</span><i>???</i></div>' for i in range(3))+'</div>',
        y=CY,t=0.0,a='up',subs=[dict(q='.r0',t='p0+0.2',a='slide',s='click'),dict(q='.r1',t='p0+0.5',a='slide',s='click'),dict(q='.r2',t='p1',a='slide',s='click')])]),
 dict(wav=W(17),cap='그 세 가지는,/**풀영상**에서 바로 확인하세요',hold=0.7,els=[
   dict(h=cta('th20.jpg'),y=CY-90,t=0.0,a='up',s='whoosh2')],sfx=[['p1','ding']]),
])

i=dict(name='i',title='인스타가<br><span class="o">유튜브</span>를 노린다',lines=[
 dict(wav=W(18),cap='인스타그램이,/**유튜브 땅**에 들어왔어요',els=[
   dict(h=tile('instagram','#FFFFFF','#000',260),x=290,y=CY,t=0.0,a='left',s='whoosh'),
   dict(h=tile('youtube','#FFFFFF','#000',260),x=790,y=CY,t=0.0,a='right'),
   dict(h=big('VS',150,O),y=CY,t='p1',a='stamp',s='impact')]),
 dict(wav=W(19),cap='**90분짜리**/가로 영상을/시험하기 시작했거든요',els=[
   dict(h='<div class="phone"><div class="sc"><div class="play"></div></div></div>',y=CY-30,t=0.0,a='pop',rot=[0,-90,0.5,0.45],s='whoosh'),
   dict(h=big('90:00',170,O),y=CY+330,t='p1',a='stamp',s='stamp')]),
 dict(wav=W(20),cap='이름은 **피처스**/우리가 알던 릴스랑은/**완전히 달라요**',els=[
   dict(h=big('Features',190),y=CY-60,t=0.0,a='pop',s='whoosh'),
   dict(h=sub('피처스 · 긴 가로 영상',O),y=CY+110,t='p0+0.3',a='up')]),
 dict(wav=W(33),cap='**팟캐스트**,/**코미디 공연**,/**시리즈**처럼/처음부터 끝까지 보는/영상을 노린 거예요',els=[
   dict(h=pill('팟캐스트'),x=330,y=CY-220,t='p0',a='pop',s='pop'),
   dict(h=pill('코미디 공연'),x=700,y=CY-40,t='p1',a='pop',s='pop'),
   dict(h=pill('시리즈'),x=380,y=CY+140,t='p2',a='pop',s='pop')]),
 dict(wav=W(21),cap='재밌는 건,/이걸 꺼낸 인스타 책임자가/원래 긴 영상을/**반대하던 사람**이에요',els=[
   dict(h=big('원래 반대파',150),y=CY-60,t=0.0,a='up',s='whoosh'),
   dict(h=stamp('반전',R),x=760,y=CY+170,r=-8,t='p3',a='stamp',s='stamp')]),
 dict(wav=W(22),cap='게다가 인스타는 예전에/긴 영상 앱 **IGTV**를/냈다가 **접은 적**도 있어요',els=[
   dict(h='<div class="card" style="width:680px;padding:50px 40px;text-align:center"><div style="font-weight:900;font-size:130px;letter-spacing:-.04em">IGTV</div><div style="font-weight:700;font-size:42px;color:#7A7975">2018 출시 → 2022 종료</div></div>',y=CY,t=0.0,a='pop',s='pop'),
   dict(h=stamp('실패',R),x=760,y=CY+200,r=-8,t='p2',a='stamp',s='stamp')]),
 dict(wav=W(23),cap='그런데/**왜** 다시 하는 걸까요?',els=[
   dict(h=big('?',560,O),y=CY,t=0.0,a='pop',s='riser',float=True)]),
 dict(wav=W(24),cap='**짧은 릴스**로 끌어들이고,/**긴 영상**으로 붙잡겠다는 거예요',els=[
   dict(h=f'<div class="card" style="width:400px;padding:44px 30px;text-align:center"><div style="font-weight:900;font-size:64px">릴스</div><div style="font-weight:700;font-size:38px;color:#7A7975;margin-top:8px">짧게 끌어들이고</div></div>',x=280,y=CY,t='p0',a='left',s='pop'),
   dict(h=f'<div style="font-weight:900;font-size:90px;color:{O}">→</div>',x=540,y=CY,t='p0+0.4',a='pop'),
   dict(h=f'<div class="card" style="width:400px;padding:44px 30px;text-align:center;border:3px solid {O}"><div style="font-weight:900;font-size:64px">피처스</div><div style="font-weight:700;font-size:38px;color:#7A7975;margin-top:8px">길게 붙잡기</div></div>',x=800,y=CY,t='p1',a='right',s='pop')]),
 dict(wav=W(34),cap='릴스에 **본편 링크**를 붙여서,/바로 넘어가게 하는 것도/시험 중이에요',els=[
   dict(h='<div class="phone" style="height:680px"><div class="sc" style="flex-direction:column;justify-content:flex-end;padding-bottom:60px;box-sizing:border-box"><div class="lnk" style="opacity:0;background:#fff;color:#1F1F1D;font-weight:900;font-size:34px;padding:18px 30px 22px;border-radius:999px">본편 보기  ›</div></div></div>',
        y=CY-20,t=0.0,a='pop',s='pop',subs=[dict(q='.lnk',t='p0+0.3',s='click')])]),
 dict(wav=W(35),cap='지금은 **미국**이랑 **브라질**/일부 크리에이터만/먼저 써 보고 있어요',els=[
   dict(h=pill('미국'),x=330,y=CY-120,t='p0',a='pop',s='pop'),
   dict(h=pill('브라질'),x=730,y=CY-120,t='p0+0.4',a='pop',s='pop'),
   dict(h=sub('한국 일정은 아직 발표 없음'),y=CY+120,t='p1',a='up')]),
 dict(wav=W(25),cap='그럼 우리 같은 사람한테는,/**뭐가 달라질까요?**',els=[
   dict(h=probe(420),x=380,y=CY+80,t=0.0,a='drop',float=True,s='pop'),
   dict(h=big('?',360,O),x=800,y=CY-160,t='p1',a='pop',s='riser',float=True)]),
 dict(wav=W(26),cap='답은 **풀영상**에서/바로 확인하세요',hold=0.7,els=[
   dict(h=cta('th19.png'),y=CY-90,t=0.0,a='up',s='whoosh2')],sfx=[['p1','ding']]),
])
