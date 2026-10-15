/* Each case has its own physical objects; controls keep their original behavior. */
(()=>{
 const themes={
  garage:{skin:'workshop',place:'미루정비소',prop:'정비 접수철',action:'새 접수철 열기',note:'현재 조사한 자료와 메모를 비우고, 처음 의뢰받은 시점으로 돌아갑니다',cover:'garage'},
  apartment:{skin:'security',place:'아파트 관리실',prop:'점검 관제 화면',action:'점검 처음부터 시작',note:'찾은 필름과 점검 기록을 비우고, 불빛 제보부터 다시 확인합니다',cover:'apartment'},
  radio:{skin:'broadcast',place:'폐국한 방송국',prop:'방송 복원 콘솔',action:'복원 작업 다시 시작',note:'맞춘 방송 조각과 메모를 비우고, 첫 수신 기록부터 다시 복원합니다',cover:'radio'},
  station:{skin:'railway',place:'세 번째 승강장',prop:'역무 조사표',action:'새 운행표로 시작',note:'대조한 노선과 사물함 기록을 비우고, 친구의 의뢰부터 다시 시작합니다',cover:'station'},
  laundry:{skin:'laundry',place:'자정의 무인 세탁소',prop:'수령 조회 단말',action:'새 조회 시작',note:'열어본 수령 기록과 메모를 비우고, 코트의 접수부터 다시 확인합니다',cover:'laundry'},
  'pet-home':{skin:'journal',place:'루미와 함께한 기록',prop:'보호자의 기록장',action:'기록장 처음부터 펼치기',note:'맞춰둔 물건과 메모를 비우고, 유나의 첫 부탁부터 다시 따라갑니다',cover:'pet-home'},
  'cat-invite':{skin:'invitation',place:'작은 포장 가게',prop:'봄이의 초대 봉투',action:'초대장 다시 준비하기',note:'맞춘 자리표와 모아둔 메모를 비우고, 네 선물이 도착한 순간부터 다시 시작합니다',cover:'cat-invite'},
  letter:{skin:'postal',place:'미루기록관',prop:'반송 서신 보관철',action:'서신 처음부터 열람',note:'분류한 봉투와 메모를 비우고, 반송된 네 편지를 다시 펼칩니다',cover:'letter'},
  studio:{skin:'darkroom',place:'비가 그친 사진관',prop:'인화 작업 봉투',action:'인화 준비부터 시작',note:'정리한 필름과 작업 메모를 비우고, 할아버지가 남긴 봉투부터 다시 살펴봅니다',cover:'studio'},
  ohang:{skin:'hanji',place:'오행당',prop:'접어둔 계절의 편지',action:'새 계절 맡기기',note:'작성한 접수표와 선택, 메모를 비우고, 오행당의 접수대에서 다시 시작합니다',cover:'ohang'}
 };
 const artifacts={
  garage:{'조사 의뢰':'file','세 사람의 진술':'transcript','점검 영수증':'receipt','블랙박스 영상':'monitor','출입 서버 기록':'monitor','잠긴 백업':'monitor','복원된 보관함 기록':'monitor','폐업 인계 문서':'file'},
  apartment:{'불빛 제보':'file','불빛을 찍은 필름':'photo','건물 배치도':'plan','관리인의 점검 공책':'notebook','철거 전 점검 일지':'file','봉인된 점검함':'monitor'},
  radio:{'택시 기사의 제보':'transcript','수신 기록':'transcript','보관 음성 조각':'tape','편집자의 연결 표식표':'tape','폐국 확인서':'file','복원된 송출 로그':'monitor'},
  station:{'친구의 의뢰':'letter','승강장 개편 안내':'timetable','구간 운행표':'timetable','휴대폰 이용내역':'phone','사물함 예약표':'ticket','도착지 확인 자료':'file'},
  laundry:{'이미 수령했다는 코트':'file','코트 접수표':'receipt','다음 날의 영수증':'receipt','시계 점검 스티커':'sticker','밤의 출입 목록':'monitor','운영자에게 남긴 문의':'phone','봉인된 수령 원장':'monitor'},
  'pet-home':{'유나의 의뢰':'notebook','루미의 기념품':'album','보호센터의 돌봄 기록':'file','정우의 정리 메모':'notebook','유나의 오래된 사진첩':'album','루미의 진료·입양 기록':'file','처음 지켜준 사람에게':'letter'},
  'cat-invite':{'봄이 앞으로 온 선물':'invitation','리본 아래 이름표':'gift','포장 가게의 자리표':'plan','이웃들이 보낸 쪽지':'note','봄이를 돌보던 달력':'calendar','접힌 감사 카드':'invitation','빈칸에 들어간 이름':'invitation'},
  letter:{'반송된 네 봉투':'letter','봉투 앞뒤':'envelope','주소 변경 공고':'file','사서의 분류 메모':'notebook','보존서고 목록':'file','사서의 인수 기록':'file'},
  studio:{'할아버지의 부탁':'letter','오래된 봉투':'envelope','필름 정리대':'film','정리한 필름':'film','암실 공정표':'file','완성한 사진':'photo','인화한 사진':'photo','사진 뒷면':'photo','사진관의 새 작품':'photo'},
  ohang:{'이야기를 시작할 작은 접수표':'file','접수대의 부탁':'letter','다섯 빛의 원리':'scroll','접어둔 예약':'envelope','상생의 고리':'scroll','오방의 자리':'plan','관리인이 보관한 접수표':'file','나에게 남긴 편지':'letter','나의 다섯 빛':'scroll'}
 };
 const labels={file:'보관 문서',transcript:'받아쓴 기록',receipt:'점검 · 접수 전표',monitor:'기록 조회 화면',photo:'사진 자료',plan:'공간 배치도',notebook:'기록장',tape:'방송 편집표',timetable:'역무 운행표',phone:'메시지 기록',ticket:'예약표',sticker:'장비 점검 라벨',album:'소중한 물건의 앨범',letter:'접어둔 편지',invitation:'초대장',gift:'선물 이름표',note:'남겨둔 쪽지',calendar:'당번 달력',envelope:'보관 봉투',film:'필름 슬리브',scroll:'다섯 빛의 기록'};
 const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n};
 function id(){const p=new URLSearchParams(location.search);return p.get('case')||(location.pathname.includes('ohang')?'ohang':location.pathname.includes('studio')?'studio':location.pathname.includes('case')?'garage':'hub')}
 function session(){return themes[id()]}
 function apply(dialog,{key,title,node}){
  const caseId=id(),t=themes[caseId];if(!t)return;
  const management=key.startsWith('session'),help=key.startsWith('hint-device'),puzzle=/puzzle|challenge|lock|birth|circle|directions|balance|enlarger|trays/.test(key);
  const utility=/inventory|bag$/.test(key)?'inventory':/notebook|notes|garage-board/.test(key)?'notebook':/conclusion|verdict|balance/.test(key)?'report':/ending|ohang-letter/.test(key)?'ending':/records$/.test(key)&&!artifacts[caseId]?.[title]?'archive':null;
  const artifact=node.classList.contains('opening-story')?(['letter','cat-invite','studio','ohang'].includes(caseId)?'letter':'notebook'):management?'session':help?'help':utility||artifacts[caseId]?.[title]||(key==='ohang-reserve'?'letter':puzzle?'device':'object');
  dialog.dataset.surface=t.skin;dialog.dataset.case=caseId;dialog.dataset.artifact=artifact;dialog.dataset.surfaceMode=management?'management':help?'help':'clue';
  node.classList.add('story-surface');node.dataset.artifact=artifact;
  const close=dialog.querySelector('.inspection-close');if(close)close.textContent='← '+({garage:'정비소',apartment:'관리실',radio:'방송실',station:'승강장',laundry:'세탁소','pet-home':'루미의 방','cat-invite':'포장 가게',letter:'서고',studio:'사진관',ohang:'오행당'}[caseId]);
  let bar=dialog.querySelector('.surface-heading');if(!bar){bar=el('div','surface-heading');bar.append(el('span','surface-identity'),el('span','surface-status'));dialog.querySelector('.inspection-bar').after(bar)}
  const utilityLabels={inventory:'가져온 물건',report:'마지막 확인',ending:'이야기의 끝',archive:'찾아둔 기록'};
  bar.children[0].textContent=t.place;bar.children[1].textContent=management?'플레이 관리':help?'힌트 요청':utilityLabels[artifact]||labels[artifact]||(puzzle?'장치 조작':'물건 살펴보기');
  if(management){
   if(!node.querySelector('.session-layout')){
    const layout=el('div','session-layout'),copy=el('div','session-copy'),figure=el('figure','session-scene'),photo=el('img','session-photo');photo.src='assets/covers/'+t.cover+'-480-v2.webp';photo.alt=t.place+'의 가상 현장';photo.width=480;photo.height=320;photo.decoding='async';figure.append(photo,el('figcaption','session-caption',t.place));
    copy.append(el('p','session-object-name',t.prop));while(node.firstChild)copy.append(node.firstChild);layout.append(figure,copy);node.append(layout);
   }
  }else if(labels[artifact]){
   let plate=node.querySelector(':scope > .artifact-masthead');if(!plate){plate=el('div','artifact-masthead');node.prepend(plate)}plate.replaceChildren(el('span','artifact-owner',t.place),el('span','artifact-kind',labels[artifact]));
  }else node.querySelector(':scope > .artifact-masthead')?.remove();
 }
 window.MihaejeSurface={apply,session,themes,artifacts};
})();
