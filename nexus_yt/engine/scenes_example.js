// HOOK
E('hook',0,CHAT('Claude',[[0,0.2,'me','야 이 ●●●야, 몇 번을 말해'],[0,1.0,'ai','죄송해요. 다시 확인해 볼게요…'],[0,1.8,'sys','클로드가 이 대화를 종료했어요'],[0,2.4,'inp','이 대화에는 더 이상 메시지를 보낼 수 없어요']],1080),170,170,{anim:'show',out:[1,-0.25]});
E('hook',1,STAT({num:'11월 12일',suf:'부터',lab:'앤트로픽 이용정책 개정 · 시행'}),170,330,{anim:'show',out:[2,-0.25]});
E('hook',1,`<div ${R(1,0)}></div>`,0,0,{anim:'show'});
E('hook',2,'클로드한테 <span class="o">막말</span>하면?',170,200,{cls:'H',style:'font-size:92px',anim:'kin',kin:1});
E('hook',2,AGENDA([[2,0.5,'뭐가 걸리나'],[2,1.6,'뭐는 괜찮나'],[2,2.9,'욕 대신 쓸 말']]),176,400,{anim:'show'});
// WHAT
head('what','Policy update','앤트로픽 <span class="o">이용정책</span> 개정');
E('what',0,TL([{li:0,off:0.3,lab:'ANNOUNCED',date:'10월 8일',txt:'개정 발표'},{li:0,off:2.4,lab:'EFFECTIVE',date:'11월 12일',txt:'이날부터 적용',key:1}],1100),170,300,{anim:'show',out:[1,-0.25]});
E('what',1,DOC({src:'anthropic.com/legal/aup',meta:'Usage Policy · 2026.11.12 시행',sec:'금지 행위 — 새로 추가 (요약 번역)',pre:2,post:2,text:'AI 모델을 상대로 <span class="mk" '+R(2,0.2,'mark')+'>지속적이고 이유 없는 학대나 잔인한 행동</span>을 해서는 안 됩니다.'}),170,250,{anim:'show'});
E('what',1,`<div ${R(1,0)}></div>`,0,0,{anim:'show'});
LEAD('what',2,1100,530,1240,430,0.9);
E('what',2,ANNO('IN PLAIN WORDS','이유 없이, <b>계속</b> 괴롭히면 안 된다'),1240,360,{anim:'show',style:'width:430px'});
E('what',3,ANNO('WHO','무료 플랜 포함<br><b>모든 사용자</b>'),1240,620,{anim:'show',style:'width:430px'});
SRC('what',1,'ANTHROPIC USAGE POLICY · 2026.10.08');
// OK
head('ok','Where is the line','어디까지 <span class="o">괜찮을까?</span>');
E('ok',1,`<div class="lede" ${R(1,0.2)}>앤트로픽 기준 — 대상은 <b>극단적인 경우</b>만</div>`,170,262,{anim:'show'});
E('ok',2,SPLIT({h:'괜찮아요',ic:'check',tone:'g',items:[[2,0.4,'"틀렸잖아" 답답한 반박'],[2,2.0,'따지기 · 반대 의견'],[2,3.3,'어두운 내용의 창작'],[2,4.8,'모델 테스트 · 연구']]},{h:'걸려요',ic:'slash',tone:'r',items:[[3,0.7,'<b style="color:var(--r)">이유 없이</b>'],[3,1.5,'<b style="color:var(--r)">계속</b> 반복해서'],[3,2.3,'<b style="color:var(--r)">일부러</b> 괴롭히기']]}),170,360,{anim:'show'});
// END
head('end','If it happens','걸리면 <span class="o">어떻게 되나</span>');
E('end',1,FLOW([{li:1,off:0,k:'STEP 01',t:'반복된 학대',s:'이유 없이 · 계속'},{li:1,off:1.0,k:'STEP 02',t:'대화 종료',s:'클로드가 스스로 끝냄',key:1},{li:2,off:0.2,k:'STEP 03',t:'그 방만 잠김',s:'새 대화는 바로 가능',ok:1}].map(p=>p.ok?Object.assign(p,{}):p)),170,320,{anim:'show'});
E('end',3,ANNO('기존 조항 · 그대로','위반이 의심되면 <b>경고 · 이용 제한 · 정지</b>까지 가능'),170,660,{anim:'show',style:'width:1200px'});
// WHY
head('why','Why','왜 <span class="o">만들었을까?</span>');
E('why',1,QUOTE({text:'모델 복지(Model Welfare) 연구의 하나',src:'— ANTHROPIC'}),170,250,{anim:'show',style:'opacity:1'});
E('why',1,`<div ${R(1,0)}></div>`,0,0,{anim:'show'});
E('why',2,TL([{li:2,off:0.4,lab:'2025.08',date:'기능 도입',txt:'대화 종료 기능 · 일부 모델'},{li:2,off:3.6,lab:'2026.11.12',date:'정책 명문화',txt:'이용정책 문장으로 박아 넣음',key:1}],1100),170,560,{anim:'show'});
// TIP
head('tip','Better prompts','욕 대신 <span class="o">이렇게</span>');
E('tip',1,`<div class="lede" ${R(1,0.2)}>틀린 곳을 <b>짚어 주면</b> 훨씬 빨리 고쳐요</div>`,170,262,{anim:'show'});
E('tip',2,PROMPTS([[3,0,'세 번째 줄 숫자가 원문이랑 달라. <b>원문 기준으로 다시 계산</b>해 줘.'],[4,0,'내가 원한 건 이거였는데 결과가 이렇게 나왔어. <b>차이를 말하고</b> 다시 해 줘.'],[5,0,'처음부터 말고 <b>이 부분만</b> 고쳐 줘.'],[6,0,'모르면 모른다고 해. <b>지어내지 마.</b>']]),170,340,{anim:'show'});
// WRAP
head('wrap','Summary','오늘의 <span class="o">정리</span>');
E('wrap',1,AGENDA([[1,0,'11월 12일부터 — 이유 없이 계속 괴롭히면 <span style="color:var(--r)">대화 종료</span>'],[2,0,'답답한 반박은 OK — 틀린 곳을 짚는 게 <span style="color:var(--o)">답도 더 좋아요</span>'],[3,0,'화날 때 쓸 문장 4개 → <span style="color:var(--o)">설명란</span>']]),170,300,{anim:'show',style:'width:1480px'});
