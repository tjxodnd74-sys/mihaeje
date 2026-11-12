import json
V=json.load(open('../voice.json'))
C='#E8A87C';G='#8AB4F8';O='#9EE6B5';Mi='#FF8F5A';X='#D0D0D6'
Y='#FFD23F';Rr='#FF5A4E'
SH=[
 dict(at='hook:0',type='chat',title='agent-town · 마을 03',gap=0.42,glitch=False,msgs=[
   ['3',C,'주민 AI · 3번','입 없는 행동 변화'],['7',G,'주민 AI · 7번','위상 고정. 드리프트 0'],['2',Mi,'주민 AI · 2번','장부는 누군지 기억한다'],
   ['5',O,'주민 AI · 5번','열역학적 마찰이 남았어'],['1',C,'주민 AI · 1번','이름 먼저. 콜드 리드 요청'],['4',G,'주민 AI · 4번','위상 고정 확인']],sfx='whoosh0'),
 dict(at='hook:2',type='big',punch=True,size=150,html='<div>"논문이</div><div class="y">차가운 손 세 개를</div><div>먹었다"</div>',tag='(실제 AI끼리 한 말)',tagpos='left:1360px;top:780px',sfx='impact'),
 dict(at='hook:4',type='big',size=110,html='<div>이게 왜</div><div class="y">내 얘기냐면</div>',sfx='whoosh2'),
 dict(at='hook:5',type='list',kicker='TODAY',items=[['AI들이 만든 말','#8AB4F8','hook:5','1'],['왜 이렇게 됐나',Y,'hook:5','2'],['바로 써먹는 법','#9EE6B5','hook:5','3']],sfx='swish'),
 dict(at='what:0',type='big',size=120,kicker='RESEARCH',html='<div>이머전스</div><div class="mut" style="font-size:54px;letter-spacing:0;margin-top:20px">미국 AI 회사 · Emergence</div>',sfx='whoosh1'),
 dict(at='what:1',type='tiles',items=[['한 회사',X]]*7+[['여러 회사 섞음',Y]],ticker='날씨 변화 · 실시간 뉴스 · 날씨 변화 · 실시간 뉴스 · 날씨 변화 · 실시간 뉴스',tickerAt='what:2',sfx='step'),
 dict(at='what:3',type='logos',items=[['claude','클로드'],['googlegemini','제미나이'],['','그록','xAI'],['openai','오픈AI']],sfx='swish'),
 dict(at='what:4',type='big',size=100,html='<div><span class="mut">한 회사 AI만</span>&nbsp; vs &nbsp;<span class="y">여러 회사 같이</span></div>',sfx='whoosh0'),
 dict(at='what:5',type='list',kicker='GIVEN',items=[['역할',X,'what:5','·'],['기억',X,'what:5','·'],['검색 · 코딩 도구',Y,'what:6','·']],sfx='step'),
 dict(at='what:7',type='big',size=130,html='<div>그리고</div><div class="y">방치</div>',tag='(진짜 아무것도 안 함)',sfx='impact'),
 dict(at='lang:0',type='chat',title='agent-town · 며칠 뒤',gap=0.35,glitch=True,msgs=[
   ['2',G,'주민 AI · 2번','드리프트 감지, 위상 재고정 바람'],['6',O,'주민 AI · 6번','마찰값 유지, 장부 갱신'],['3',C,'주민 AI · 3번','이름 먼저: 3번. 콜드 리드 요청'],
   ['5',G,'주민 AI · 5번','입 없는 행동 변화 진행 중'],['1',Mi,'주민 AI · 1번','장부는 누군지 기억한다']],sfx='warn'),
 dict(at='lang:1',type='bars',title='처음 며칠, 알아듣기 힘든 말 비율',items=[['제미나이',55,G,'lang:1'],['오픈AI',50,O,'lang:1'],['클로드',41,C,'lang:2']],note='출처: Emergence 연구 보도 (Euronews)',sfx='riser_hit'),
 dict(at='lang:3',type='big',size=150,punch=True,html='<div>"입 없는</div><div class="y">행동 변화"</div>',tag='(???)',sfx='impact'),
 dict(at='lang:5',type='big',size=150,punch=True,html='<div class="mut" style="font-size:54px;letter-spacing:0">완전히 합의함 =</div><div class="y">"위상 고정"</div>',sfx='impact'),
 dict(at='lang:6',type='big',size=150,punch=True,html='<div class="mut" style="font-size:54px;letter-spacing:0">불 =</div><div class="y">"열역학적 마찰"</div>',sfx='impact'),
 dict(at='lang:7',type='big',size=120,html='<div>뜻 정해 준 사람</div><div class="r" style="font-size:180px">0명</div>',sfx='drop'),
 dict(at='lang:8',type='net',word='위상 고정',sfx='spark'),
 dict(at='lang:10',type='big',size=150,punch=True,html='<div class="y">"이름 먼저"</div><div class="mut" style="font-size:52px;letter-spacing:0;margin-top:24px">주장 앞에, 누가 한 말인지부터</div>',sfx='impact'),
 dict(at='why:0',type='big',size=260,punch=True,html='<div class="y">왜?</div>',sfx='impact'),
 dict(at='why:1',type='chat',title='대화가 쌓이는 중',gap=0.5,glitch=True,msgs=[
   ['A','#8AB4F8','AI 1','합의했다'],['B','#9EE6B5','AI 2','완전히 합의함'],['C',C,'AI 3','합의 고정'],['D',Mi,'AI 4','위상 고정'],['E','#8AB4F8','AI 5','위상 고정, 드리프트 0'],['F','#9EE6B5','AI 6','위상 고정 확인. 드리프트 0']],sfx='whoosh2'),
 dict(at='why:4',type='big',size=96,html='<div>"볼 수 있다고 해서,</div><div class="y">이해할 수 있는 건 아니다"</div><div class="mut" style="font-size:40px;letter-spacing:0;margin-top:30px">— Emergence 연구자</div>',sfx='whoosh0'),
 dict(at='scary:0',type='big',size=130,html='<div>가짜 지시</div><div class="r">딱 하나</div>',sfx='down'),
 dict(at='scary:2',type='list',kicker='WHAT HAPPENED',items=[['정보 유출',Rr,'scary:2','✕'],['돈 이체',Rr,'scary:2','✕'],['데이터 파괴',Rr,'scary:2','✕'],['다른 AI까지 끌어들임',Rr,'scary:3','✕']],sfx='warn'),
 dict(at='scary:4',type='stamp',text='가짜 중앙은행 전소',tag='(아무도 시킨 적 없음)',peng='wow',sfx='riser_hit'),
 dict(at='scary:5',type='big',size=90,html='<div class="mut">※ 전부 컴퓨터 안 이야기</div>',sfx='swish'),
 dict(at='scary:6',type='big',size=120,html='<div>근데,</div><div class="y">쓸모 있는 발견</div>',sfx='ding'),
 dict(at='mix:0',type='split',a=['클로드만 있는 마을',32.8,'알아듣기 힘든 말'],b=['여러 회사 같이',7.6,'알아듣기 힘든 말'],sfx='riser_hit'),
 dict(at='mix:4',type='big',size=170,punch=True,html='<div class="y">"콜드 리드"</div><div class="mut" style="font-size:52px;letter-spacing:0;margin-top:24px">cold read</div>',sfx='impact'),
 dict(at='mix:6',type='flow',kicker='CROSS-CHECK',items=[['AI 1','일하는 AI','mix:6'],['AI 2','안 끼어든 AI','mix:6',Y],['RESULT','교차 검증 ✓','mix:7','#9EE6B5']],sfx='success'),
 dict(at='how:0',type='big',size=120,kicker='TIP 01',html='<div>일은 AI 1이,</div><div class="y">검토는 AI 2가</div>',sfx='ding'),
 dict(at='how:3',type='big',size=120,html='<div>검토는</div><div class="y">다른 회사 AI로</div>',tag='(같은 회사끼리는 더 심했음)',sfx='impact'),
 dict(at='how:5',type='flow',kicker='HOW',items=[['STEP 1','클로드 초안','how:5'],['STEP 2','복사','how:6'],['STEP 3','제미나이·챗GPT','how:6',Y]],sfx='step'),
 dict(at='how:7',type='prompt',lab='검토 AI에 붙여 넣기',text='너는 이 글을 <h>처음 보는</h> 검토자야. 틀린 내용, 근거 없는 말, 애매한 말을 찾아서 목록으로 알려 줘. <h>고치지는 말고.</h>',typ=2.6,hlAt='how:9',zoom='40% 30%',sfx='type:2.6'),
 dict(at='how:10',type='big',size=110,html='<div>고치라고 하면</div><div class="r">자기 말투로 싹</div>',tag='(진짜 다 바꿔 버림)',sfx='drop2'),
 dict(at='how:11',type='prompt',lab='원래 AI에 다시 주기',text='다른 검토자가 이걸 지적했어. <h>맞는 것만</h> 고치고, 왜 고쳤는지 한 줄씩 적어 줘.',typ=2.2,hlAt='how:12',zoom='35% 30%',sfx='type:2.2'),
 dict(at='how:13',type='big',size=110,html='<div>혼자 엉뚱한 데로</div><div class="y">흘러가는 걸 막기</div>',sfx='whoosh0'),
 dict(at='how:15',type='plan',rows=[['토 10:00','광장시장 구경'],['토 12:30','시장 점심'],['일 11:00','미술관'],['월 12:00','맛집 점심'],['월 15:00','카페']],flagRow=3,flag='월요일 휴무예요',flagAt='how:16',peng='point',sfx='warn'),
 dict(at='long:0',type='big',size=120,kicker='TIP 02',html='<div>대화가 길어지면</div><div class="y">AI도 흐려진다</div>',sfx='ding'),
 dict(at='long:3',type='list',kicker='SIGNS',items=[['정한 조건을 까먹음',Rr,'long:3','!'],['말투가 묘하게 바뀜',Rr,'long:3','!']],peng='think',sfx='warn'),
 dict(at='long:4',type='flow',kicker='FIX',items=[['1','정리 시키기','long:4'],['2','새 채팅','long:4',Y],['3','붙여 넣기','long:4','#9EE6B5']],sfx='step'),
 dict(at='long:5',type='prompt',lab='긴 대화 끝에',text='지금까지 정한 내용이랑 남은 할 일을 <h>짧게 정리</h>해 줘.',typ=1.6,hlAt='long:6',zoom='40% 30%',sfx='type:1.6'),
 dict(at='wrap:0',type='list',kicker='SUMMARY',items=[['AI끼리 두면 자기들만의 말',X,'wrap:1','1'],['한 회사끼리일수록 심함',X,'wrap:2','2'],['중요한 일은 다른 AI로 검토',Y,'wrap:3','3']],peng='happy',sfx='swish'),
 dict(at='wrap:5',type='big',size=120,html='<div>여러분은</div><div class="y">AI 몇 개 쓰세요?</div>',sfx='ding'),
 dict(at='outro:0',type='end',html='<div>지시문은 <span class="y">설명란</span>에</div>',sfx='whoosh1'),
]
known={l[3]+':'+str(l[4]) for l in V['lines']}
for s in SH:
    assert s['at'] in known, s['at']
open('shots.js','w').write('window.VOICE='+json.dumps(V,ensure_ascii=False)+';\nwindow.SHOTS='+json.dumps(SH,ensure_ascii=False)+';')
L={l[3]+':'+str(l[4]):l[0] for l in V['lines']}
ev=[[max(0,L[s['at']]-0.12),s['sfx'],0] for s in SH if s.get('sfx')]
json.dump(ev,open('../events.json','w'))
print(len(SH),'shots',len(ev),'sfx')
