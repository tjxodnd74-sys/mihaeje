/* Places and physical conclusions belong to each story, not a universal exit door. */
(()=>{
 const data={
  garage:{entry:'차량 작업 구역',inside:'진단 기록 작업대',move:'진단 작업대로 이동',back:'차량 쪽 보기',transition:'작업대 연결',opening:'점검판의 공구 반납 순서를 복원하면 진단 작업대의 기록을 열람할 수 있습니다',goal:'진단 기록 작업대 열기',final:'기록 인계 봉투',finish:'인계 봉인',sound:'drawer',mode:'seal',steps:['고객 기록을 인계 봉투에 넣기','종이 사본을 보존 접수철에 넣기','봉인 테이프 붙이기'],explain:'복원한 출입 기록을 고객에게 돌려줍니다 보존하는 사본은 종이 기록입니다 사라진 SD카드를 되찾았다는 뜻은 아닙니다',groups:['차량 진단 단말 · SD 리더','출입 서버 기록','기록 보존 접수철']},
  apartment:{entry:'공동 복도',inside:'배터리 조명 점검함',move:'점검함 가까이 보기',back:'복도 전체 보기',transition:'점검함 확대',opening:'비상용 손전등으로 복도의 안내판을 비춰 조명 점검함의 덮개를 여세요 관리자의 동의 아래 철거 전 배터리 조명만 점검합니다',goal:'조명 점검함 덮개 열기',final:'독립 배터리 연결부',finish:'조명 안전 점검',sound:'switchOff',mode:'battery',steps:['독립 배터리 연결 분리','배터리 단자 보호 덮개 닫기','점검 완료 표식 붙이기'],explain:'502호의 철거 전 점검용 배터리 조명입니다 건물 주전원이나 다른 세대의 전기를 차단하는 행동이 아닙니다',groups:['창문 관찰 필름','건물 평면도와 관리 동의','독립 배터리 점검 기록']},
  radio:{entry:'녹음 부스',inside:'송출 콘솔',move:'유리 너머 콘솔 보기',back:'녹음 부스 보기',transition:'송출 경로 추적',opening:'점검 테이프를 이어 데크에 넣고 채널 상태를 복원하세요 유리 너머 콘솔에서 과거 녹음이 다시 나온 경로를 추적할 수 있습니다',goal:'송출 콘솔 점검 연결',final:'송출 패치 케이블',finish:'송출 정리',sound:'switchOff',mode:'unplug',steps:['테스트 송출 잭 뽑기','테이프 정지 버튼 누르기','원본 테이프 보관 라벨 붙이기'],explain:'테스트 경로만 분리하고 원본은 훼손하지 않습니다 이 목소리는 새 생방송이 아닌 과거의 녹음입니다',groups:['송출 콘솔의 대본','테이프 보관 음성과 운영 규칙','테스트 전원 패치 기록']},
  station:{entry:'미루역 승강장',inside:'승강장 분실물 인계대',move:'승강장 따라 인계대로 →',back:'← 안내도 쪽으로',transition:'승강장 이동',opening:'찢긴 안내도를 복원하고 승강장 안내 경로를 맞추면 옆 인계대의 회수함을 확인할 수 있습니다 역을 떠난 친구의 이동은 기록과 통화로 확인하세요',goal:'승강장 회수함 열기',final:'여정 확인 봉투',finish:'여정 기록 정리',sound:'paper',mode:'stamp',steps:['인계표의 수림역 도장 찍기','노선도를 이송 봉투에 넣기','봉투 접어 봉인하기'],explain:'안내 노선도는 확인한 이동 경로를, 통화 기록은 현재의 안부를 남깁니다 친구의 다음 일정은 본인의 선택으로 남겨 둡니다',groups:['승강장의 관찰 기록','노선 안내와 구간권','분실물 회수함 기록']},
  laundry:{entry:'밤샘 세탁소 접수대',inside:'코트 보관 행거',move:'행거 쪽으로 돌아보기',back:'접수대 다시 보기',transition:'코트 인계 준비',opening:'세탁기 점검 순서표의 덮개를 열어 직원 보관 행거를 확인하세요 수령표와 실제 출입 시각을 대조해 코트의 행방을 찾습니다',goal:'직원 보관 행거 확인',final:'코트 인계 행거',finish:'코트 인계',sound:'paper',mode:'hanger',steps:['코트를 인계 행거에 걸기','실제 인계 시각 수령표 끼우기','옷 커버 지퍼 올리기'],explain:'단말은 실제보다 12분 빨랐습니다 잘못 남은 고객 수령 기록을 바로잡고 주인이 찾을 코트와 정확한 기록을 함께 둡니다',groups:['접수대의 수령표와 영수증','벽시계와 직원 출입 기록','코트 안쪽의 보존 메모']},
  letter:{entry:'우편 분류 작업대',inside:'편지 보존함',move:'보존함 가까이 보기',back:'분류 작업대 전체 보기',transition:'우편함 열람',opening:'분류 카드에 붉은 필터를 대고 보존 표식을 읽으세요 문을 여는 암호가 아니라 편지가 보관된 분류함의 표식입니다',goal:'편지 보존함 찾기',final:'편지 처리 받침',finish:'수신처 정리',sound:'paper',mode:'postal',steps:['새 수신처 안내표를 봉투에 끼우기','반송 이유를 보존 대장에 붙이기','보존 확인 우체국 날짜 도장 찍기'],explain:'바뀐 것은 수신처입니다 안내표와 반송 이유를 같이 남기며, 원본 편지를 임의로 발송하지 않습니다',groups:['우편 봉투 묶음','주소 변경 안내와 분류 카드','편지 보존 목록']},
  'pet-home':{entry:'루미가 쉬는 현관',inside:'바닥에 펼친 기억 상자',move:'기억 상자 펼쳐 보기',back:'현관 전체 보기',transition:'기념품 상자 펼치기',opening:'찢긴 엽서를 이어 상자의 빈 홈에 끼워주세요 산책길 표식을 맞추면 기념품 상자의 안쪽 칸이 열립니다 다른 방으로 이동하는 게임이 아닙니다',goal:'기억 상자 안쪽 칸 열기',final:'루미의 담요와 새 앨범',finish:'새 가족의 자리',sound:'paper',mode:'blanket',steps:['담요의 왼쪽 접힌 면 펼치기','담요의 오른쪽 접힌 면 펼치기','옛 사진 옆에 오늘의 빈 사진 자리 만들기'],explain:'어린 유나가 구해준 강아지와 현재의 루미는 같은 등록 연결 기록으로 확인됩니다 유나와 정우는 루미의 옛 이야기와 앞으로의 산책을 함께 나누기로 했습니다.',groups:['담요와 첫 기념품','구조·돌봄 인계 기록','유나의 사진과 연결 기록']},
  'cat-invite':{entry:'봄이의 선물 포장대',inside:'같은 가게의 초대 식탁',move:'식탁 쪽으로 시선 옮기기',back:'선물 포장대 보기',transition:'같은 방의 식탁 준비',opening:'포장대의 초대장 두 조각을 이어 자리표에 맞춰주세요 가장자리 표식을 완성하면 같은 방의 초대 준비를 이어갈 수 있습니다',goal:'식탁 초대 준비하기',final:'다은을 위한 빈 의자',finish:'초대 준비',sound:'paper',mode:'chair',steps:['다은의 빈 의자 빼기','초대장 접힌 받침 펼치기','다은 앞으로 초대장 세우기'],explain:'봄이의 생일처럼 보였던 모임은 다은과 봄이가 가족이 된 날을 함께 축하하는 초대입니다',groups:['리본 아래 선물 이름표','자리표와 이웃들의 메모','돌봄 달력과 감사 카드']}
 };
 // A conclusion's length and gesture follow its object, rather than a fixed three-step ritual.
 data.apartment.steps=data.apartment.steps.slice(0,2);
 data.radio.steps=['테스트 송출로 향하는 패치 잭 뽑기','테이프를 멈추고 보관함에 닫기'];
 data.station.steps=['수림역 확인 도장 찍기','안내 노선도와 통화 기록을 봉투에 넣기'];
 data.letter.steps=['새 수신처 안내 쪽지 끼우기','사본과 안내 쪽지를 보존함에 나란히 놓기'];
 data['pet-home'].steps=['담요를 루미의 새 자리에 펼치기'];
 data['cat-invite'].steps=['다은의 빈 의자 빼기','다은 앞으로 초대장 세우기'];
 const orders={garage:['original','copy','seal'],apartment:['disconnect','cover'],radio:['unplug','stop'],station:['stamp','insert'],laundry:['hang','receipt','zip'],letter:['address','store'],'pet-home':['unfold'],'cat-invite':['chair','invite']};
 function advance(id,d,action){const order=orders[id];if(!order||action!==order[d.step||0])return false;d.step=(d.step||0)+1;return true}
 function complete(id,d){return !!orders[id]&&(d.step||0)===orders[id].length}
 const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n};
 function finish({id,state,save,onDone}){
  const t=data[id];if(!t)return false;
  const draft=state.journeyFinish?.version===37?state.journeyFinish:{version:37,step:0};state.journeyFinish=draft;
  const node=el('article','journey-finale finale-'+t.mode);node.dataset.storyDevice=id;node.dataset.journeyFinal=id;
  const instructions={garage:'다음 날 오전 · 기록 인계 동의를 확인한 뒤\n고객에게 돌려줄 기록과 동의받은 종이 사본을 따로 챙깁니다',apartment:'관리자의 점검 허가 범위 안에서 독립 배터리와 단자를 안전하게 정리합니다',radio:'별도 전원의 중계기로 이어진 테스트 패치 경로를 분리합니다 원본 녹음은 훼손하지 않습니다',station:'역에 비치된 안내 노선도에 확인한 경로를 표시했습니다\n현재 안부를 확인한 통화 기록과 함께 봉투에 보관합니다',laundry:'되찾은 코트와 시계를 보정한 수령표를 함께 챙깁니다',letter:'봉투에 새 주소를 적은 안내 쪽지를 끼웁니다. 맡겨둔 사본은 보존함에 넣습니다.','pet-home':'열 해를 함께한 담요를 이제 루미가 쉴 자리에 펼칩니다','cat-invite':'마지막 초대장을 다은의 자리에 놓습니다.'};
  const header=el('header','journey-final-header');header.append(el('p','eyebrow','마무리하기'),el('h2','',t.final),el('p','',instructions[id]));node.append(header);
  const photo=el('img','journey-final-photo');photo.src='assets/endings/'+id+'-detail-480-v36.webp';photo.alt=t.final;photo.width=480;photo.height=320;node.append(photo);
  const controls=el('section','journey-final-controls');controls.setAttribute('aria-label',t.final+' 조작');node.append(controls);
  const status=el('p','journey-final-status');status.setAttribute('role','status');node.append(status);
  function paint(){const body=document.querySelector?.('.inspection-dialog[open] .inspection-body'),scroll=body?.scrollTop||0;controls.replaceChildren();const index=draft.step||0;node.dataset.finishStep=index;const progress=el('p','journey-final-progress',complete(id,draft)?'마무리 완료':(index+1)+' / '+t.steps.length);controls.append(progress);if(index){const completed=el('p','journey-final-completed',t.steps.slice(0,index).map(label=>'완료 · '+label).join('\n'));controls.append(completed);}
   if(complete(id,draft)){const b=el('button','journey-primary','엔딩 보기 →');b.type='button';b.onclick=()=>{state.sceneEnding={...(state.sceneEnding||{}),choice:0};save();window.MihaejeOverlay.close({notify:false});onDone(0)};controls.append(b);if(body)body.scrollTop=scroll;return}
   const b=el('button','journey-act journey-act-'+orders[id][index],t.steps[index]);b.type='button';b.setAttribute('data-focus-key','journey-action');
   b.onclick=()=>{if(!advance(id,draft,orders[id][index]))return;save();window.MihaejeAudio?.play(t.sound);paint();status.textContent=complete(id,draft)?'준비를 마쳤습니다. 엔딩을 확인하세요.':t.steps[index]+' · 완료';controls.querySelector('button')?.focus({preventScroll:true})};
   if(['zip','chair'].includes(orders[id][index])){const slider=el('input','journey-slide');slider.type='range';slider.min='0';slider.max='100';slider.value='0';slider.setAttribute('aria-label',t.steps[index]+' 손잡이');slider.oninput=()=>{b.disabled=Number(slider.value)<95};b.disabled=true;controls.append(el('p','journey-touch-guide',orders[id][index]==='chair'?'의자 손잡이를 당겨 자리를 마련하세요':'지퍼 손잡이를 끝까지 밀어 커버를 닫으세요'),slider)}
   if(orders[id][index]==='unfold'){const corners=el('div','journey-blanket-corners'),opened=new Set();b.disabled=true;for(const side of ['왼쪽','오른쪽']){const corner=el('button','journey-blanket-corner',side+' 접힌 면 펼치기');corner.type='button';corner.onclick=()=>{opened.add(side);corner.textContent=side+' 펼침 ✓';corner.disabled=true;b.disabled=opened.size!==2;photo.classList.add('blanket-'+(side==='왼쪽'?'left':'right'))};corners.append(corner)}controls.append(corners)}
   controls.append(b);if(body)body.scrollTop=scroll;
  }
  paint();save();window.MihaejeOverlay.show({key:'journey-final-'+id,title:t.final,node,warm:['letter','pet-home','cat-invite'].includes(id),dismissOutside:false});return true;
 }
 const changes={apartment:{target:'복도 끝의 어두운 안내판',use:'관리자가 제공한 손전등으로 복도 안내판을 비춰보세요'},station:{target:'승강장 안내도 점검 받침'},letter:{target:'분류표 확인 유리판',use:'붉은 필터를 분류표 확인 유리판에 대보세요'},'cat-invite':{target:'식탁 자리표',use:'포장대의 두 초대장 조각을 이어 식탁 자리표의 빈 칸에 맞춰보세요'}};
 if(typeof window==='object'){for(const [id,t]of Object.entries(data)){const base=window.MihaejeEscapeDesigns?.[id];if(base)Object.assign(base,{entry:t.entry,inside:t.inside},changes[id]||{})}
 window.MihaejeJourneys={data,orders,advance,complete,finish};}
 if(typeof module==='object')module.exports={data,orders,advance,complete};
})();
