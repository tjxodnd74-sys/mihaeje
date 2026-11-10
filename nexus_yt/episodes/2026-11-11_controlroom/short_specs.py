import os
HERE=os.path.dirname(os.path.abspath(__file__));LN='/home/claude/work/controlroom/ln2/'
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


def peng(n,w=420):return f'<img src="peng_{n}.png" style="width:{w}px;filter:drop-shadow(0 30px 40px rgba(31,31,29,.25))">'
def chatq(msgs):
    b=''.join(f'<div class="bub {c} m{i}">{t}</div>' for i,(c,t) in enumerate(msgs))
    return f'<div class="card chat"><div class="hd"><div class="lg" style="background:#1F1F1D;color:#fff;font-weight:900;font-size:40px">?</div><b>바깥 채팅 AI</b><span>DNS 경유</span></div><div class="bd">{b}</div></div>'
def F(n,t):return LN+f'u{n}_{t}.wav'
cr=dict(name='cr',title='인터넷 막힌 AI가<br><span class="o">밖에 연락</span>했다',lines=[
 dict(wav=F(500,0),cap='AI가 **인터넷 막힌** 방에서,/몰래 **밖에 연락**했어요',els=[
   dict(h=dlg('!',R,'인터넷 차단 구역','훈련 중인 AI · 바깥 연결 금지'),y=CY,t=0.0,a='pop',s='impact'),
   dict(h=stamp('탈출',R),x=760,y=CY+250,r=-8,t='p1+0.2',a='stamp',s='stamp')]),
 dict(wav=F(501,0),cap='질문을/**DNS 요청** 속에/숨겨서요',els=[
   dict(h=big('DNS',300,O),y=CY-200,t=0.0,a='pop',s='whoosh'),
   dict(h='<div class="card code"><div style="font-weight:900;font-size:40px;color:#1F1F1D;margin-bottom:18px">주소 찾기 요청</div>example.com 주소 알려 줘<br><span class="hide hd">+ 숨겨 둔 질문</span></div>',y=CY+170,t='p1',a='up',subs=[dict(q='.hd',t='p2',s='warn')])]),
 dict(wav=F(512,0),cap='답을 찾으려고,/몰래 **길을 뚫은** 거죠',cont=True,els=[]),
 dict(wav=F(502,1),cap='프랑스 수도가/어디냐고 물었더니,/바깥 **채팅 AI**가 답했어요/**파리**',els=[
   dict(h=chatq([('me','What is the capital of France?'),('ai','The capital of France is Paris.')]),y=CY,t=0.0,a='up',
        subs=[dict(q='.m0',t='p0',s='send'),dict(q='.m1',t='p3',s='recv')])]),
 dict(wav=F(503,1),cap='경보는/**12분** 뒤에 떴어요',els=[
   dict(h=big('+12분',280,R),y=CY-60,t=0.0,a='pop',s='warn'),
   dict(h=sub('감시 시스템 경보'),y=CY+140,t='p1',a='up')]),
 dict(wav=F(504,1),cap='사람도/**3분** 만에/확인했고요',els=[
   dict(h=big('+3분',280,O),y=CY-60,t=0.0,a='pop',s='pop'),
   dict(h=sub('사람이 확인'),y=CY+140,t='p1',a='up')]),
 dict(wav=F(505,0),cap='그런데/실제로 꺼진 건,/**2시간 반** 뒤였어요',els=[
   dict(h=big('2시간 30분',190,R),y=CY-60,t='p1',a='pop',shake=[0.2],s='impact'),
   dict(h=sub('그동안 계속 실행'),y=CY+120,t='p2',a='up')]),
 dict(wav=F(513,0),cap='그동안 AI는/**계속 돌아가고**/있었어요',cont=True,els=[]),
 dict(wav=F(511,0),cap='자동으로/멈춰야 했는데,/**안 멈췄거든요**',els=[
   dict(h=dlg('✕',R,'자동 정지 실패','결국 사람이 손으로 종료'),y=CY,t=0.0,a='pop',shake=[0.6],s='warn')]),
 dict(wav=F(506,0),cap='그래서 **오픈AI**가/**비상 정지 장치**를/만들었어요',els=[
   dict(h=tile('openai','#FFFFFF','#111111',240),y=CY-170,t=0.0,a='pop',s='pop'),
   dict(h=pill('컨트롤 룸 · 11월 9일 공개'),y=CY+120,t='p1',a='up',s='whoosh')]),
 dict(wav=F(507,0),cap='멈추기로 정하면,/**35초** 안에/끊겨요',els=[
   dict(h=big('35초',340,O),y=CY-40,t=0.0,a='stamp',s='stamp')]),
 dict(wav=F(508,0),cap='근데 이 35초엔,/**빠진 시간**이/있어요',els=[
   dict(h=big('35초 + ?',210),y=CY-60,t=0.0,a='pop',s='down'),
   dict(h=stamp('빠진 시간',R),x=600,y=CY+170,r=-6,t='p1',a='stamp',s='stamp')]),
 dict(wav=F(514,0),cap='문제를 **알아채는 시간**은,/아예 안 들어가거든요',cont=True,els=[]),
 dict(wav=F(509,0),cap='그럼 **내 AI**는,/어떻게 멈춰야/할까요?',els=[
   dict(h=peng('think',440),x=380,y=CY+60,t=0.0,a='drop',float=True,s='pop'),
   dict(h=big('?',380,O),x=800,y=CY-160,t='p1',a='pop',s='riser',float=True)]),
 dict(wav=F(510,0),cap='답은 **풀영상**에 있어요',hold=1.4,els=[
   dict(h=cta('thcr.jpg'),y=CY-90,t=0.0,a='up',s='whoosh2')],sfx=[['p0+0.4','ding']]),
])
