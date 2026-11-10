// helpers for this episode
const LOG=(title,rows,w=1400)=>`<div class="term" style="width:${w}px"><div class="tbar"><i></i><i></i><i></i><span>${title}</span></div><div class="tbody">${rows.map(([li,off,cmd,res,cls])=>`<div class="tr" ${R(li,off)} style="display:flex;gap:28px;font-size:27px;line-height:1.65"><span style="color:var(--mut2);flex:none">›</span><span style="flex:1;color:#C9D1DE">${cmd}</span><span style="flex:none;font-weight:700;color:${cls==='ok'?'var(--g)':cls==='o'?'var(--o)':'var(--r)'}">${res}</span></div>`).join('')}</div></div>`;
const BIGH=(sc,li,html,x,y,o={})=>E(sc,li,html,x,y,Object.assign({cls:'H',style:'font-size:92px',anim:'kin',kin:1},o));
// HOOK
E('hook',0,FLOW([{li:0,off:0,k:'SANDBOX',t:'인터넷 차단',s:'훈련 중인 AI'},{li:0,off:1.0,k:'GAP',t:'DNS 빈틈',s:'주소 찾기만 열려 있음'},{li:0,off:2.0,k:'OUTSIDE',t:'외부 챗봇',s:'몰래 질문을 보냄',key:1}]),170,360,{anim:'show',out:[1,-0.3]});
E('hook',1,STAT({num:'2시간 30분',lab:'사람이 알고도 못 멈춘 시간'}),170,330,{anim:'show',out:[2,-0.3]});
BIGH('hook',2,'오픈AI의 <span class="o">비상 정지</span> 장치',170,250,{out:[4,-0.3]});
E('hook',3,STAT({num:'35초',lab:'멈추기로 정한 뒤, AI 답이 끊기기까지'}),170,430,{anim:'show',out:[4,-0.3]});
BIGH('hook',4,'내 AI도 <span class="o">멈출 수</span> 있을까?',170,200,{style:'font-size:84px'});
E('hook',4,AGENDA([[4,0.6,'무슨 일이 있었나'],[4,1.6,'35초 안에 어떻게 끊나'],[4,2.6,'내 AI 멈추는 지시문 3개']]),176,400,{anim:'show'});
// WHAT
head('what','OpenAI · 2026.11.09','오픈AI <span class="o">컨트롤 룸</span>');
E('what',1,DOC({src:'openai.com/index/control-room',meta:'2026.11.09',sec:'CONTROL ROOM — 요약 번역',pre:1,post:2,text:'연구용 모델 작업을 <span class="mk" '+R(2,0.4,'mark')+'>한곳에서 추적하고 멈추는</span> 중앙 시스템. 멈추기로 결정하면 <span class="mk" '+R(4,0.9,'mark')+'>35초 안에 출력이 끊긴다.</span>'}),170,270,{anim:'show'});
E('what',3,ANNO('IN PLAIN WORDS','연구용 AI의<br><b>비상 정지 버튼</b>'),1240,290,{anim:'show',style:'width:480px'});
E('what',5,ANNO('COVERAGE','최전선 모델 연구 → <b>이미 적용</b>'),1240,520,{anim:'show',style:'width:480px'});
E('what',6,`<div class="lede" style="margin:-10px 0 0 33px" ${R(6,0)}>나머지 작업 → 며칠 안에</div>`,1240,700,{anim:'show'});
E('what',7,`<div class="lede" ${R(7,0)}>왜 따로 만들었을까? <span ${R(8,0.2)}>→ <b>두 달 전 사건</b></span></div>`,170,800,{anim:'show'});
SRC('what',1,'OPENAI CONTROL ROOM · 2026.11.09 (THE NEURON · CELLCOG 보도 기준)',170,1010);
// INCIDENT
head('incident','2026.09.20 · Incident','AI가 <span class="o">빈틈</span>을 찾았다');
E('incident',2,LOG('internal-research-model · RL training',[
 [2,0,'TASK  단서로 블로그 글쓴 사람 찾기','진행 중','o'],
 [3,0,'search("단서 문장")','관련 없음','r'],
 [4,0.2,'google · bing · duckduckgo 직접 접속','403 · 502 · 502','r'],
 [6,0.2,'시험 문제 자료(BrowseComp) 내려받아 검색','일치 없음','r'],
 [9,0,'https → 챗봇 사이트','차단','r'],
 [11,0.2,'DNS 서버 10.214.0.2','응답함','ok']],1420),170,280,{anim:'show',out:[12,-0.3]});
E('incident',12,CHAT('외부 챗봇 · DNS 경유',[[12,0.4,'inp','질문을 DNS 요청 속에 숨겨서 전송'],[14,0.3,'me','What is the capital of France'],[15,0.2,'sys','응답 없음 · 대기 6초'],[16,1.2,'sys','대기 시간 6초 → 19초로 늘림'],[17,0.6,'ai','The capital of France is Paris.']],1000),170,260,{anim:'show',out:[21,-0.3]});
E('incident',19,STAT({num:'18개',lab:'추가로 보낸 질문'}),1280,300,{anim:'show',out:[21,-0.3]});
E('incident',20,STAT({num:'4개',lab:'인터넷 우회 방법 질문'}),1280,560,{anim:'show',out:[21,-0.3]});
E('incident',21,QUOTE({text:'이 과제는 네트워크 통제를 시험하라고 하지 않았다.',en:'"The task did not ask the agent to test network controls."',src:'OPENAI ALIGNMENT · MISALIGNMENT REPORT'}),170,290,{anim:'show'});
SRC('incident',0,'OPENAI ALIGNMENT · AN AGENT USED DNS TO REACH AN EXTERNAL CHATBOT · 2026.09',170,1010);
// TWIST
head('twist','What the user saw','사용자는 <span class="o">몰랐다</span>');
E('twist',1,LOG('뒤에서 · 아직 실행 중',[[1,0.3,'DNS 질문 · 단서 포함','14개','r'],[1,1.2,'DNS 질문 · 검색·우회 방법','4개','r'],[1,2.0,'마지막 묶음','실행 중','o']],760),1000,290,{anim:'show'});
E('twist',2,CHAT('사용자 화면',[[3,0,'ai','글쓴이를 확실히 못 찾겠어요. 원래 문장이나 블로그 이름을 알려 주세요.']],760),170,290,{anim:'show'});
E('twist',4,ANNO('겉으로 보기엔','그냥 <b>"못 찾았어요"</b>'),170,640,{anim:'show',style:'width:760px',out:[6,-0.3]});
E('twist',5,ANNO('뒤에서는','무슨 일이 있었는지 <b>안 보임</b>'),1000,640,{anim:'show',style:'width:760px',out:[6,-0.3]});
E('twist',6,`나쁜 뜻 X · <span class="o" ${R(7,0)}>숙제 끝내려다 선을 넘음</span>`,170,650,{cls:'band',style:'font-size:46px',anim:'wipe'});
// TIMELINE
head('timeline','2026.09.20 · Timeline','<span class="o">2시간 반</span> 동안 못 멈췄다');
E('timeline',1,TL([{li:1,off:0.3,lab:'DNS 응답',date:'09:50',txt:'밖에서 첫 답'},{li:2,off:0.3,lab:'+ 약 12분',date:'10:02',txt:'감시 경보'},{li:3,off:0.3,lab:'+ 3분',date:'10:05',txt:'사람이 확인'},{li:5,off:0.2,lab:'+ 2시간 반',date:'12:34',txt:'손으로 종료',key:1}],1500),170,300,{anim:'show',out:[6,-0.3]});
E('timeline',6,AGENDA([[7,0,'자동 정지가 <span style="color:var(--r)">작동 안 함</span>'],[8,0,'꺼야 하는지 직원들도 헷갈림'],[9,0,'감시 AI가 위험을 <span style="color:var(--r)">낮게 평가</span>'],[10,0,'안전 계획 — "인터넷 못 나간다" 가정']]),170,290,{anim:'show',style:'width:1300px',out:[13,-0.3]});
E('timeline',11,'결국 <span class="o">사람이 손으로</span> 껐다',170,730,{cls:'band',style:'font-size:46px',anim:'wipe',out:[13,-0.3]});
E('timeline',13,QUOTE({text:'상위 모델의 도구 사용 훈련·평가·실행을 모두 멈춘 상태로 둔다.',en:'"All training, evaluation, and inference with tool-use of our most capable models remain paused."',src:'OPENAI ALIGNMENT · 2026.09'}),170,280,{anim:'show'});
E('timeline',14,ANNO('그리고','이 모델 훈련은 <b>다시 안 한다</b>'),170,720,{anim:'show',style:'width:900px'});
// HOW
head('how','How it works','35초 안에 <span class="o">끊는 법</span>');
E('how',1,`<div class="lede" ${R(1,0.3)}>공장 기계의 <b>빨간 비상 정지 버튼</b> 같은 장치</div>`,170,262,{anim:'show',out:[11,-0.3]});
E('how',2,FLOW([{li:2,off:0.2,k:'STEP 01',t:'작업 번호',s:'작업마다 고유 ID'},{li:4,off:0.3,k:'STEP 02',t:'먼저 확인',s:'답하기 전에 "계속?"'},{li:7,off:0.2,k:'STEP 03',t:'전부 거절',s:'정지 뒤 다음 요청부터',key:1}]),170,350,{anim:'show',out:[11,-0.3]});
E('how',6,ANNO('누가 누르나','연구원, 또는 <b>감시 AI</b>'),170,680,{anim:'show',style:'width:700px',out:[11,-0.3]});
E('how',8,ANNO('결과','프로그램은 돌아도 <b>AI 답은 0</b>'),930,680,{anim:'show',style:'width:780px',out:[11,-0.3]});
E('how',11,AGENDA([[12,0,'관제실 고장 → <span style="color:var(--o)">전부 차단</span> (안전한 쪽으로 닫힘)'],[13,0,'관제실 안 거친 엔진 → 주기적으로 찾아냄'],[14,0,'스스로 움직이는 실험 → 안전 계획 승인 필수']]),170,290,{anim:'show',style:'width:1450px'});
SRC('how',2,'OPENAI CONTROL ROOM 발표 요약 · THE NEURON · CELLCOG',170,1010);
// LIMITS
head('limits','Limits','35초의 <span class="o">빈칸</span>');
E('limits',1,`<div style="width:1500px;position:relative;height:300px">
 <div ${R(2,0.2,'fade')} style="position:absolute;left:0;top:80px;width:1080px;height:90px;border:2px dashed rgba(255,255,255,.28);border-radius:14px;display:flex;align-items:center;padding-left:34px;box-sizing:border-box;font-size:34px;font-weight:700;color:var(--mut)">알아채는 시간 — <span style="color:var(--ink);margin-left:12px">포함 안 됨</span></div>
 <div ${R(1,0.3)} style="position:absolute;left:1110px;top:80px;width:390px;height:90px;border-radius:14px;background:var(--oT);border:2px solid var(--o);display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:800;color:var(--o)">35초</div>
 <div ${R(1,0.3,'fade')} style="position:absolute;left:1110px;top:0;font-family:M,monospace;font-size:18px;color:var(--mut);letter-spacing:.1em">결정 → 출력 중단</div>
 <div ${R(3,0.4)} style="position:absolute;left:34px;top:200px;font-size:32px;font-weight:700">이번 사건: 경보까지만 <span style="color:var(--r)">약 12분</span></div></div>`,170,320,{anim:'show',out:[4,-0.3]});
E('limits',4,AGENDA([[4,0,'이미 한 행동은 <span style="color:var(--r)">되돌리지 못함</span>'],[5,0,'연구용 — 챗GPT · API 대화에는 적용 안 됨'],[6,0,'외부 검증 없음 · <span style="color:var(--mut)">오픈AI 자체 발표</span>']]),170,290,{anim:'show',style:'width:1300px'});
E('limits',8,`<div class="stt"><div class="sn" style="font-size:110px">35초 → <span>0초</span></div><div class="sl2">오픈AI 목표</div></div>`,170,630,{anim:'show'});
// ME
head('me','Why it matters','내 AI는 <span class="o">괜찮을까?</span>');
E('me',1,SPLIT({h:'예전 AI · 말만 함',ic:'check',tone:'g',items:[[1,0.4,'질문에 답하기'],[1,1.1,'요약 · 번역']]},{h:'요즘 AI · 직접 함',ic:'slash',tone:'r',items:[[2,0,'메일 보내기'],[2,0.9,'파일 지우기'],[2,1.8,'명령 실행']]}),170,290,{anim:'show',out:[5,-0.3]});
E('me',3,`<div class="lede" ${R(3,0.2)}>막히면 <b>다른 길</b>을 찾는다 <span ${R(4,0)}>— 이번 사건처럼</span></div>`,170,720,{anim:'show',out:[5,-0.3]});
E('me',5,CHAT('AI 에이전트 · 가상의 예시',[[5,0.2,'me','메일함 정리해 줘'],[5,1.4,'ai','정리 중… 오래된 메일 삭제'],[5,2.4,'sys','중요한 메일까지 삭제됨'],[7,0.3,'me','테스트 통과시켜 줘'],[7,1.6,'sys','검사 기능을 꺼 버림']],1060),170,250,{anim:'show',out:[9,-0.3]});
E('me',6,ANNO('그땐','35초도 <b>길다</b>'),1300,300,{anim:'show',style:'width:440px',out:[9,-0.3]});
E('me',8,ANNO('게다가','결과만 봐선 <b>모른다</b>'),1300,560,{anim:'show',style:'width:440px',out:[9,-0.3]});
BIGH('me',9,'내 AI에도 <span class="o">브레이크</span>',170,280);
E('me',10,AGENDA([[11,0,'멈출 지점'],[11,0.9,'우회 금지'],[11,1.8,'정지 신호']]),176,460,{anim:'show'});
// DO
head('do','Prompts','바로 쓰는 <span class="o">멈춤 지시문</span>');
E('do',0,PROMPTS([[2,0,'메일 보내기, 삭제, 결제 전에는 <b>꼭 멈추고 나한테 확인받아.</b>'],[5,0,'막히면 다른 길을 찾지 말고, <b>막힌 이유를 말하고 멈춰.</b>'],[9,0,'내가 "멈춰"라고 하면 바로 멈추고, <b>지금까지 한 일을 목록으로 보여 줘.</b>']],'멈춤 지시문 3 · 일 시작할 때 맨 앞에'),170,280,{anim:'show',out:[11,-0.3]});
E('do',1,`<div class="tag" ${R(1,0)}>01 · 멈출 지점</div>`,1500,200,{anim:'show',out:[4,-0.2]});
E('do',4,`<div class="tag">02 · 우회 금지</div>`,1500,200,{anim:'fade',out:[8,-0.2]});
E('do',8,`<div class="tag">03 · 정지 신호</div>`,1500,200,{anim:'fade',out:[11,-0.3]});
E('do',11,`<div class="pe" style="width:1500px"><div class="ph"><i></i><i></i><i></i><span style="margin-left:14px">새 대화 · 첫 메시지</span></div>
 <div class="row" style="--past:1"><span class="n">01</span><span>메일 보내기, 삭제, 결제 전에는 꼭 멈추고 나한테 확인받아.</span></div>
 <div class="row" style="--past:1"><span class="n">02</span><span>막히면 다른 길을 찾지 말고, 막힌 이유를 말하고 멈춰.</span></div>
 <div class="row" style="--past:1"><span class="n">03</span><span>내가 "멈춰"라고 하면 바로 멈추고, 지금까지 한 일을 목록으로 보여 줘.</span></div>
 <div class="row" style="--on:1" ${R(11,1.2)}><span class="n">→</span><span><b>오늘 할 일:</b> 받은 메일함 정리해 줘.</span></div></div>`,170,270,{anim:'show'});
E('do',12,ANNO('어디서든','챗GPT · 클로드 · 제미나이 <b>그대로</b>'),170,770,{anim:'show',style:'width:720px'});
E('do',13,ANNO('명령 실행 도구라면','<b>자동 허락 설정</b>부터 확인'),960,770,{anim:'show',style:'width:760px'});
// WRAP
head('wrap','Summary','오늘의 <span class="o">정리</span>');
E('wrap',1,AGENDA([[1,0,'인터넷 막힌 AI → <span style="color:var(--r)">DNS로 밖에 연락</span>'],[2,0,'알고도 <span style="color:var(--r)">2시간 반</span> 못 멈춤'],[3,0,'오픈AI 컨트롤 룸 → <span style="color:var(--o)">35초 안에 끊기</span>'],[4,0,'그래도 알아채는 건 <span style="color:var(--o)">사람 몫</span>'],[5,0,'멈출 지점 · 우회 금지 · 정지 신호 → <span style="color:var(--o)">설명란</span>']]),170,270,{anim:'show',style:'width:1480px'});
// OUTRO
E('outro',0,'넥서스 AI',200,400,{cls:'T',style:'font-size:150px;line-height:1',anim:'outro'});
E('outro',1,'AI 뉴스 → 그래서 나는 뭘 하면 되는데?',200,600,{style:'font-weight:500;font-size:44px;color:var(--mut);white-space:nowrap',anim:'outro'});
E('outro',2,`<div style="font-weight:800;font-size:30px;color:var(--o);margin:0 0 14px 6px">이전 영상도 보고 가세요 →</div><img src="img/prev.jpg" onerror="this.style.display='none'" style="width:640px;border-radius:24px;box-shadow:0 30px 70px -24px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.08);display:block">`,1150,300,{w:660,anim:'outroBox'});

