window.QaSolve77=function({s,d,click,get,scan,current,assert,R,level}){
 const slider=(label,value)=>{const n=get(label);n.value=String(value);n.oninput();n.onchange();};
 const prefix=label=>{const n=scan(current()).find(x=>x.tagName==='BUTTON'&&(x.textContent.startsWith(label)||(x.getAttribute('aria-label')||'').startsWith(label)));assert(n,'missing prefix '+label);n.onclick();};
 const invalid=()=>assert(!R.valid(s,d,level),'invalid interactive state '+s.id);
 if(s.id==='calibrated-entrance'){slider('출입 영상 탐색',1312);slider('시간축 보정 분',-7);invalid();slider('출입 영상 탐색',1313);}
 else if(s.id==='alibi-intervals'){slider('다른 지역 사무실 영상 시각',1306);slider('외부 결제 창구 영상 시각',1307);invalid();slider('외부 결제 창구 영상 시각',1306);}
 else if(s.id==='located-unit'){click('창문 4줄 2칸 선택');click('뒤쪽 도면 보기');invalid();click('창문 4줄 3칸 선택');}
 else if(s.id==='night-conditions'){click('주전원 켜짐');click('점등 시험');invalid();click('별도 전원 꺼짐');click('점등 시험');}
 else if(s.id==='tape-splice'){prefix('A ·');prefix('E ·');invalid();click('마지막 테이프 연결 풀기');for(const key of ['B','C','D'])prefix(key+' ·');}
 else if(s.id==='powered-path'){click('전원 차단 잭');click('공식 중계소 설비 잭');click('별도 전원 유지보수 잭');click('구 스튜디오 설비 잭');invalid();click('전원 차단 잭');click('구 스튜디오 설비 잭');}
 else if(s.id==='old-platform'){click('표지 뒷면 살펴보기');click('사진 속 옛 3번 표지의 방향 북쪽');click('개편 전 2번 표지의 방향 남쪽');}
 else if(s.id==='rail-route'){for(const stop of ['중앙','남문']){prefix(stop+' 선로');click('선택한 구간 운행');}invalid();click('이전 구간으로 돌아가기');for(const stop of ['북문','수림']){prefix(stop+' 선로');click('선택한 구간 운행');}}
 else if(s.id==='real-pickup-time'){slider('영수증 시계 보정 분',-11);invalid();slider('영수증 시계 보정 분',-12);}
 else if(s.id==='receipt-proof'){slider('출입 재현 시각',1436);click('고객 수령 표시 찍기');invalid();slider('출입 재현 시각',1438);}
 else if(s.id==='address-placard'){click('옛 주소로 보내기');click('발신함으로 돌려받기');click('미루동 17-14 → 미루기록길 42');click('새 주소로 보내 보기');invalid();click('미루동 17-4 → 미루기록길 12');}
 else if(s.id==='postal-order'){for(let i=0;i<s.target.length;i++){click(s.items.find(x=>x.id===s.target[i]).label+' 집기');prefix((i+1)+'번 자리');}}
 else if(s.id==='care-objects'){for(let i=0;i<s.target.length;i++){const item=s.items.find(x=>x.id===s.target[i]);click(item.label+' 뒤집기');click(item.label+' 집기');prefix(s.slots[i].label+' · ');}}
 else if(s.id==='registry-chain'){for(const key of s.target)prefix(s.items.find(x=>x.id===key).label+' 연결 · ');click('마지막 연결 풀기');invalid();prefix(s.items.find(x=>x.id===s.target.at(-1)).label+' 연결 · ');}
 else if(s.id==='finder-correspondence'){click('강아지 얼굴 가까이 보기');invalid();click('파란 끈 가까이 보기');click('정류장 주변 보기');click('사진 원본 정보 펼치기');}
 else if(s.id==='gift-seating'){for(let i=0;i<s.target.length;i++){click(s.items.find(x=>x.id===s.target[i]).label+' 집기');prefix(s.slots[i].label+' · ');}}
 else if(s.id==='ribbon-seal'){for(const label of ['은호 · 파란 리본 풀기','소연 · 노란 리본 풀기','지후 · 초록 리본 풀기','미정 · 분홍 리본 풀기'])click(label);}
 else if(s.id==='portrait-label'){click('사진 앞뒤 뒤집기');click('사진 속 인물 이름표 사진관 주인');click('그날의 촬영자 이름표 윤서');}
 else if(s.id==='promise-caption'){click('완성한 사진 집기');click('빈 액자에 걸기');invalid();click('빛이 남은 자리');}
 else if(s.id==='helping-cycle'){for(const key of s.target)click(s.items.find(x=>x.id===key).label+' 그릇 잇기');}
 else if(s.id==='five-directions'){for(let i=0;i<3;i++)click('방향 천 90도 돌리기');for(let i=0;i<s.target.length;i++){click(s.items.find(x=>x.id===s.target[i]).label+' 그릇 집기');click(['천의 위','천의 오른쪽','천의 아래','천의 왼쪽','천의 중앙'][i]+'에 그릇 놓기');}}
 else throw Error('missing mechanic solver '+s.id);
};

(()=>{const main=document.querySelector('main'),button=document.createElement('button');button.textContent='검사: 답지 조작 후 제출';button.onclick=()=>{try{const {config,state}=window.QaStage77,R=window.MihaejeStoryDevices,stage=window.MihaejeExperience.activeStage(config.id,state),s=R.plan(config.id,window.MihaejePlay.levels[config.id],state)[stage],d=state.adventure.draft[stage];const current=()=>document.querySelector('.inspection-body > article'),scan=n=>Array.from(n.querySelectorAll('*'));const get=label=>{const all=scan(current()),n=all.find(n=>n.getAttribute('aria-label')===label)||all.find(n=>n.tagName==='BUTTON'&&n.textContent===label);if(!n)throw Error('Missing control '+label);return n;};const click=label=>get(label).click(),select=(label,value)=>{const n=get(label);n.value=value;n.onchange();},assert=(ok,message)=>{if(!ok)throw Error(message)};
if(s.mechanic62)window.QaSolve77({s,d,click,get,scan,current,assert,R,level:window.MihaejePlay.levels[config.id]});
else if(s.id==='personnel-card'){const n=get('조회할 직원 카드 번호');n.value='07';n.oninput();}
else if(s.id==='coat-machine'){for(let i=0;i<s.target.length;i++){click(s.items.find(x=>x.id===s.target[i]).label+' 태그 집기');click(s.slots[i].label+' 걸이에 태그 놓기');if(i<2)click('다음 기계 →');}}
else if(s.id==='room-layout'){for(let i=0;i<3;i++)for(let j=0;j<6&&d.placements[i]!==s.target[i];j++)click(s.slots[i].label+' 방 바꾸기');}
else if(s.id==='family-calendar'){select('기념 월','6');click('12일 선택');}
else if(s.id==='shelf-locator'){click('MR열 선택');click('17단 04칸 선택');}
else if(s.id==='confirmation-scope'){click('안내소에 연결 요청');click('왜 연락이 없었는지 묻기');click('지금 괜찮은지 묻기');}
else if(['inspection-code','recorded-date','destination-locker'].includes(s.id)){for(const f of s.fields){const out=scan(current()).find(n=>n.tagName==='OUTPUT'&&n.getAttribute('aria-label')?.startsWith(f.label+' 현재'));for(let j=0;j<200&&d.fields[f.id]!==s.target[f.id];j++)out.onkeydown({key:'ArrowUp',preventDefault(){}});}}
else if(s.id==='input-proofs')s.target.forEach((key,i)=>select(s.slots[i].label+' 점검 항목',key));
else if(s.id==='watching-light')click(s.items.find(x=>x.id===s.target[0]).label+' 표식 선택');
else s.target.forEach((key,i)=>click(s.slots[i].label+'에 '+s.items.find(x=>x.id===key).label+' 선택'));
assert(R.valid(s,d,window.MihaejePlay.levels[config.id]),'Solution did not satisfy validator');get(s.actionLabel).click();document.getElementById('fixtureStatus').textContent='정답 제출 완료 · '+s.id;
}catch(e){document.getElementById('fixtureStatus').textContent='검사 실패 · '+e.message;}};main.append(button);})();

window.AttachQa77=()=>{const source=Array.from(document.querySelectorAll("main button")).find(b=>b.textContent==="검사: 답지 조작 후 제출"),bar=document.querySelector(".inspection-bar");bar.querySelectorAll("button").forEach(b=>{if(b.textContent===source.textContent)b.remove();});const n=source.cloneNode(true);n.onclick=source.onclick;bar.append(n);};
