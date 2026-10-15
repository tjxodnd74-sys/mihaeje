/* Answers are derived from the same authored targets that validate a device. */
(()=>{
 const P=window.MihaejePlay,R=window.MihaejeStoryDevices,old=R.plan;
 const actions={'watching-light':'등불 걸쇠 맞추기','ribbon-seal':'리본 걸쇠 잠그기','confirmation-scope':'민서와 나눈 통화 기록하기','night-conditions':'점검판 접수 레버 내리기','input-proofs':'입력·출력 로그 조회','receipt-proof':'해당 수령 원장 조회','powered-path':'패치 연결 점검','family-calendar':'기념 날짜 도장 찍기'};
 function action(id,s){return actions[s.id]||(s.kind==='sort'?'클립으로 고정하기':s.kind==='route'?'도착지 표식 고정하기':s.kind==='symbol'?'그릇 자리 고정하기':s.kind==='match'?'놓은 물건 고정하기':({garage:'백업 검색 레버 당기기',apartment:'점검함 손잡이 당기기',radio:'녹음 라벨 고정하기',station:'사물함 손잡이 당기기',laundry:'기록 검색 레버 당기기',letter:'서가 표찰 고정하기'})[id]||'장치 손잡이 당기기');}
 const transitions={
 garage:['카메라와 서버의 시각을 같은 기준으로 맞췄습니다. 그 순간에 기록된 카드의 명의는 누구일까요? 출입 단말 옆 명부를 보러 갑니다.','카드의 명의를 확인했습니다. 하지만 명의만으로 그날의 행동까지 알 수는 없습니다. 접수대에 남긴 두 직원의 진술을 독립된 기록과 비교해 봅니다.','두 직원의 진술이 다른 곳의 기록과 맞습니다. 이제 접근 기록과 문서를 숨길 이유를 구분해 인계철을 정리합니다.','접근과 동기를 구분해 인계철에 남겼습니다. 안쪽 백업 기록으로 마지막 순간을 확인합니다.'],
 apartment:['불빛을 본 집의 위치를 확인했습니다. 이제 그 세대의 복도로 가서 뒤편 창과 실내 방의 위치를 비교해 봅니다.','바깥에서 본 창과 방의 위치를 연결했습니다. 창마다 남은 표식은 관리인의 점검 공책과도 이어질까요? 관리 기록을 펼치는 탁자로 가서 공책을 살펴봅니다.','점검함이 열렸습니다. 불빛을 본 밤에 주전원과 현관이 어떤 상태였는지, 설비 점검판에서 따로 확인합니다.','주전원과 출입 상태를 확인했습니다. 별도 조명이 남아 있을 가능성은 안쪽의 배터리 점검 기록에서 확인합니다.'],
 radio:['사본의 문장이 이어졌습니다. 지금 들린 목소리는 언제 녹음된 것일까요? 보관실의 음성 목록을 확인합니다.','오래된 녹음임을 확인했습니다. 꺼진 스튜디오 밖에 아직 전원이 연결된 곳이 있는지 중계 연결부로 가서 패치 경로를 살펴봅니다.','두 설비의 전원 경로를 구분했습니다. 다시 들린 소리가 새 마이크 입력인지 보관 파일 출력인지 콘솔에서 대조합니다.','입력과 출력 기록을 대조했습니다. 안쪽 송출 보고서에서 파일이 다시 나온 경위를 확인합니다.'],
 station:['옛 표지가 가리킨 현재 승강장을 찾았습니다. 친구의 이용 내역과 맞는 길이 어디로 이어지는지 안내 자료를 펼친 역무실 탁자로 갑니다.','이용 내역에 맞는 수림행 구간을 찾았습니다. 수림역으로 이동해 예약 보관함을 확인합니다.','예약 보관함을 확인했습니다. 이것은 친구가 남긴 계획입니다. 현재의 안부는 안내소를 통해 직접 물어봅니다.','친구의 현재 상황과 본인이 원해서 왔는지를 통화로 확인했습니다. 확인한 경로와 안부를 따로 기록해 둡니다.'],
 laundry:['N-08 코트가 처리된 기계를 찾았습니다. 수령 표시는 남아 있는데 날짜가 맞지 않습니다. 기기의 점검 기록을 확인합니다.','단말의 날짜와 시각을 실제 시간으로 맞췄습니다. 그 순간 세탁소에 있었던 사람을 출입 명부에서 확인합니다.','그 시각 운영자가 안에 있었고 고객은 뒤에 도착했습니다. 수령 표시가 실제 인계를 뜻하는지 원장과 서경의 문의를 비교합니다.','문의와 처리 항목의 의미를 구분했습니다. 직원 보관 행거의 안쪽 기록으로 코트의 행방을 확인합니다.'],
 letter:['현재 기록관 주소를 확인했습니다. 봉투 원본의 우체국 날짜 도장은 그대로 둔 채 분류실에서 발송 순서를 살펴봅니다.','봉투를 우체국 날짜 도장 순서로 정리했습니다. 묶음의 분류 메모가 가리키는 보관 자리를 서고에서 찾습니다.','서가 표찰의 열·단·칸을 복구했습니다. 원본과 새 수신처 안내를 나란히 보존합니다.'],
 'pet-home':['물건이 지나온 돌봄의 시간을 펼쳤습니다. 상자 속 별명과 현재 루미가 같은 강아지인지 등록 기록철을 살펴봅니다.','접수와 진료, 등록, 현재 입양의 기록이 이어집니다. 유나에게 낯익었던 파란 끈과 정류장을 옛 사진에서 다시 봅니다.','사진과 물건의 흔적이 이어졌습니다. 루미의 옛 시간과 새 가족의 오늘을 담요 위에 함께 남깁니다.'],
 'cat-invite':['이웃들의 선물을 식탁에 놓았습니다. 자리마다 붙은 이름표를 가져와 포장대의 리본 걸쇠를 맞춥니다.','리본 안의 감사 카드가 열렸습니다. 이 모임이 기억하는 날을 가게의 돌봄 달력에서 확인합니다.','함께 가족이 된 날을 확인했습니다. 마지막 빈 의자에 누구를 초대할지 이제 알 수 있습니다.'],
 studio:['사진 속 인물과 촬영자의 이름을 확인했습니다. 윤서가 봉투에 남긴 약속을 전시 카드에 옮깁니다.','기다린 이유는 함께 인화를 끝내자는 약속이었습니다. 완성한 사진을 함께 걸어 둡니다.'],
 ohang:['나의 씨앗에서 시작한 상생의 고리를 완성했습니다. 이번에는 순환의 순서와 다른, 방위의 자리를 천 안쪽 방향표에서 살펴봅니다.','방향에 맞게 그릇을 놓았습니다. 마당 등불에 남은 이번 표식이 어떤 빛의 화살표를 받는지 살펴봅니다.','등불의 걸쇠가 풀렸습니다. 처음 남겼던 접수표와 지금 고른 마음을 편지에서 함께 읽습니다.']};
 function answer(id,s){
  const lines=['정답과 풀이'];
  if(s.id==='confirmation-scope')lines.push('① 「안내소에 연결 요청」을 누르세요. ② 「왜 연락이 없었는지 묻기」와 「지금 괜찮은지 묻기」를 모두 누르세요. 두 답변을 받은 뒤 기록을 남깁니다.');
  else if(s.id==='calibrated-entrance'&&window.MihaejeExperience)lines.push('카메라 시각 보정 방향은 빼기, 카메라 시계 차이는 7분, 실제 입장 시각은 21:46으로 입력하세요.');
  else if(s.id==='room-layout'&&window.MihaejeExperience)lines.push('뒤편 왼쪽 창은 작은방, 가운데 창은 거실, 오른쪽 창은 안방이 나올 때까지 각 창을 누르세요.');
  else if(s.id==='shelf-locator'&&window.MihaejeExperience)lines.push('MR열을 선택한 뒤 17단 04칸을 누르세요.');
  else if(s.id==='personnel-card'&&window.MihaejeExperience)lines.push('「조회할 직원 카드 번호」에 07을 입력하세요. 직원 명부에서 07번의 명의는 한지수입니다.');
  else if(s.id==='coat-machine'&&window.MihaejeExperience)lines.push('1번 기계에서 「물세탁 작업표 태그 집기」 → 「1번 기계 걸이에 태그 놓기」, 다음 기계에서 「N-08 울 코트 태그 집기」 → 「2번 기계 걸이에 태그 놓기」, 다음 기계에서 「열풍 건조 작업표 태그 집기」 → 「3번 기계 걸이에 태그 놓기」를 누르세요.');
  else if(s.id==='registry-chain'&&window.MihaejeExperience)lines.push('잘못 이은 기록은 「마지막으로 이은 기록 풀기」로 모두 푸세요. 「2016년 접수표 연결」 → 「2016년 진료 연결 기록 연결」 → 「과거 동물등록 연결 기록 연결」 → 「2026년 재입양 계약 연결」 순서로 네 서류를 누릅니다.');
  else if(s.id==='family-calendar'&&window.MihaejeExperience)lines.push('「기념 월」에서 6월을 고르고 달력의 「12일 선택」을 누르세요.');
  else if(s.id==='helping-cycle'&&window.MihaejeExperience)lines.push('첫 그릇부터 '+s.target.map(x=>s.items.find(v=>v.id===x).label).join(' → ')+' 순서가 되도록 각 그릇을 누르세요.');
  else if(s.id==='finder-correspondence'&&window.MihaejeExperience)lines.push('학교 소속의 흔적 = 학교 명찰 끈, 발견 날짜의 흔적 = 구조 날의 물건 날짜, 정류장 장소의 흔적 = 사진 원본의 장소를 고르세요.');
  else if(s.id==='located-unit')lines.push('「502호」를 선택하세요. 기둥만 있는 1층 주차장을 포함한 실제 5층이며, 뒤편에서 본 열을 정면 기준으로 뒤집으면 02호입니다.');
  else if(s.kind==='route')lines.push('출발역으로 되돌린 뒤 '+s.target.map(x=>s.nodes.find(n=>n.id===x).label).join(' → ')+' 순서로 이어진 역을 누르세요.');
  else if(!Array.isArray(s.target))lines.push(s.fields.map(f=>{const v=s.target[f.id],label=f.choices?.find(x=>String(x.value)===String(v))?.label||f.values?.[v]||String(v);return f.label+' = '+label}).join('\n'));
  else lines.push(s.slots.map((slot,i)=>slot.label+' → '+s.items.find(x=>x.id===s.target[i]).label).join('\n'));
  if(['postal-order','tape-splice'].includes(s.id))lines.push('각 봉투·조각의 「앞으로 옮기기」와 「뒤로 옮기기」 버튼으로 위 순서에 맞추세요.');
  if(s.requiresSupport)lines.push('기록 접수구에서 '+s.support.map(x=>'「'+R.titles[id][x]+'」').join(' · ')+' — 각 자료의 「사본 끼우기」를 누르세요. 다른 사본이 끼워져 있으면 빼세요.');
  if(s.requiresExclude)lines.push('조사 수첩에서는 '+s.support.map(x=>'「'+R.titles[id][x]+'」').join(' · ')+' — 각 자료를 「이 자료 집기」로 집은 뒤 「메모에 자료 붙이기」를 누르세요. 두 장을 모두 붙입니다.');
  lines.push('마지막으로 「'+(s.actionLabel||action(id,s))+'」 버튼을 누르세요.','풀이\n'+s.explanation);
  return lines.join('\n\n');
 }
 function plan(id,level,state){return old(id,level,state).map((s,i)=>{if(s.id==='tape-splice')s.slots=s.slots.map((slot,n)=>({...slot,label:['시작 조각','두 번째 조각','세 번째 조각','끝 조각','이번 복원에서 제외'][n]}));return {...s,hints:[s.hints[0],s.hints[1],answer(id,s)],nextStory:transitions[id]?.[i],actionLabel:action(id,s)};});}
 R.plan=P.plan=window.MihaejePlaces.plan=plan;
 window.MihaejeQuality={answer,action,transitions};
 document.addEventListener('mihaeje:inspection',()=>{if(document.documentElement.dataset.theme==='station')document.querySelector('.inspection-dialog[open] .surface-status')?.style.setProperty('color','var(--c63-muted,#30271b)','important');});
 const studioScene=document.getElementById?.('studioScene'),studioToast=document.getElementById?.('sceneToast');if(studioScene&&studioToast)studioScene.after(studioToast);
 for(const [id,label] of Object.entries({station:'메시지 열기',laundry:'접힌 면 펼치기',letter:'덮개 열기','pet-home':'뚜껑 들기','cat-invite':'리본 아래 이름표'}))P.stories[id].action=label;
 // The arrival and the first operation are different stops.
 window.MihaejePlaces.data.garage[0][0]='차량 시계 점검대';
 const H=window.MihaejeHints;if(!H)return;const configure=H.configure;
 H.configure=value=>{
  const original=value,puzzles=value.puzzles;
  if(value.id==='studio')value={...value,puzzles:()=>{
   const state=original.state();return puzzles().map((p,i)=>({...p,allowed:()=>state.started&&!state.solved&&(i===0?state.step<3:state.step>=3&&state.step<5),steps:[p.steps[0],p.steps[1],i===0?'봉투 기울기를 32~40도로 맞춰 C3를 읽으세요. C3 서랍을 열고 필름을 1–6 → 7–12 → 13–18 → 19–24 순서로 놓습니다. MIRU 400이 거꾸로 보이는 조각의 「필름 뒤집기」를 눌러 네 조각 모두 정방향으로 맞춥니다. 초기 상태에서는 1–6과 13–18을 뒤집습니다. 「필름 23번 컷」을 선택한 뒤 「이 필름으로 인화 준비」를 누르세요.':'암실에서 하얀 조명을 끄고 붉은 안전등을 켜세요. 인화지 8×10, 초점 65(60~70 허용), 노출 12초로 맞춰 「확대기 준비 마치기」를 누릅니다. 두 사람이 돌아오면 「함께 인화지 노출하기」를 누르세요. 습식 현상대에서 「빨간 집게 · 현상」 → 「노란 집게 · 정지」 → 「파란 집게 · 정착」 순으로 옮기세요.']})).concat([{code:H.code('P',3),label:'사진 전시 준비',allowed:()=>state.step>=5&&!state.solved,steps:['완성한 사진의 앞뒤와 전시 작품을 살펴보세요.','봉투의 주인과 사진에 찍힌 사람은 다를 수 있습니다. 사진 뒷면의 촬영자와 함께 인화하자는 문장을 대조하세요.','「사진 뒷면 보기」로 뒷면을 읽고 「사진관의 전시 액자에 걸기」를 누르세요. 사진 속 인물에 사진관 주인, 촬영자에 윤서를 붙여 「액자 이름표 붙이기」로 확인합니다. 다음에는 「완성한 사진 집기」 → 「빈 액자에 걸기」를 누르세요. 전시 제목을 하나 고르고 「전시 문구 완성하기」로 마칩니다. 어떤 제목을 골라도 됩니다.'],returnTo:()=>original.openRecord('portrait-back')}]);
  }};
  if(value.id==='ohang')value={...value,puzzles:()=>{const state=original.state(),stages=R.plan('ohang',2,state),index=stages.findIndex((s,i)=>!state.adventure?.done?.includes(i));return puzzles().map((p,i)=>({...p,allowed:()=>state.step>=1&&(window.MihaejeExperience?.available('ohang',state).includes(i)??i===index)&&!state.solved,steps:stages[i].hints}));}};
  configure(value);
 };
})();



