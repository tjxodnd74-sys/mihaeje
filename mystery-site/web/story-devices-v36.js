/* Story-derived physical reconstructions. Targets are validation data, never input-panel copy. */
(function (host) {
 'use strict';
 const VERSION=2;
 const clamp=v=>Math.max(1,Math.min(5,Math.floor(Number(v)||2)));
 const copy=v=>JSON.parse(JSON.stringify(v));
 const titles={
  garage:{brief:'조사 의뢰',clock:'점검 영수증',video:'블랙박스 관찰 기록',entry:'출입 서버 기록',people:'세 사람의 진술',memo:'폐업 인계 문서'},
  apartment:{brief:'불빛 제보',films:'불빛을 찍은 필름',plan:'건물 배치도',agreement:'관리인의 점검 공책',power:'철거 전 점검 일지'},
  radio:{brief:'택시 기사의 제보',transcript:'수신 기록',archive:'보관 음성 조각',rules:'편집자의 연결 표식표',power:'폐국 확인서'},
  station:{brief:'친구의 의뢰',platform:'승강장 개편 안내',route:'구간 운행표',ticket:'휴대폰 이용내역',locker:'사물함 예약표'},
  laundry:{brief:'이미 수령했다는 코트',order:'코트 접수표',receipt:'다음 날의 영수증',clock:'시계 점검 스티커',entry:'밤의 출입 목록',note:'운영자에게 남긴 문의'},
  letter:{brief:'반송된 네 봉투',envelopes:'봉투 앞뒤',address:'주소 변경 공고',classification:'사서의 분류 메모',catalogue:'보존서고 목록'},
  'pet-home':{brief:'유나의 의뢰',objects:'루미의 기념품',records:'보호센터의 돌봄 기록',rule:'정우의 정리 메모',photos:'유나의 오래된 사진첩',identity:'루미의 진료·입양 기록'},
  'cat-invite':{brief:'봄이 앞으로 온 선물',gifts:'리본 아래 이름표',room:'포장 가게의 자리표',notes:'이웃들이 보낸 쪽지',date:'봄이를 돌보던 달력',card:'접힌 감사 카드'},
  studio:{brief:'할아버지의 부탁',paper:'빛에 드러난 글씨',drawer:'필름 슬리브',wall:'전시 액자',film:'정리한 필름',procedure:'암실 공정표','portrait-back':'사진 뒷면'},
  ohang:{brief:'접수대의 부탁',symbols:'다섯 빛의 원리',reserve:'접어둔 예약',circle:'상생의 고리',directions:'오방의 자리'}
 };
 const themes={};
 const item=(id,label,detail)=>({id,label,...(detail?{detail}: {})});
 const slot=(id,label)=>({id,label});
 const field=(id,label,min,max,initial=0,step=1)=>({id,label,min,max,initial,step});
 const h=(a,b,c)=>[a,b,c];
 function stage(theme,id,kind,title,action,evidence,config){
  const docs=titles[theme];
  return {id,kind,title,action,instruction:action,narrative:'기록을 펼쳐 확인한 뒤 이 물건으로 돌아오세요.',evidence,
   evidenceName:evidence.map(v=>docs[v]).join(' · '),support:evidence.slice(0,2),
   supportchoices:Object.keys(docs),supportChoices:Object.entries(docs).map(([id,label])=>({id,label})),
   items:[],slots:[],...config};
 }
 function match(theme,id,title,action,evidence,items,slots,target,hints,explanation,exclude){
  return stage(theme,id,'match',title,action,evidence,{items,slots,target,hints,explanation,exclude});
 }
 function sort(theme,id,title,action,evidence,items,target,hints,explanation,exclude){
  return stage(theme,id,'sort',title,action,evidence,{items,slots:target.map((_,i)=>slot('place'+i,'기록 '+(i+1))),target,hints,explanation,exclude});
 }
 function dial(theme,id,title,action,evidence,fields,target,hints,explanation,exclude,kind='dial'){
  return stage(theme,id,kind,title,action,evidence,{fields,target,hints,explanation,exclude});
 }
 function rival(target,wrong,other='자료를 같은 기준으로 바꾸고 대조한다'){
  return {instruction:'기록과 충돌하는 해석 한 장을 제외함에 넣으세요.',target,
   options:[item(target,wrong),item('compare',other)]};
 }
 function install(id,stages6,stages4){themes[id]={id,stages6,stages4};}
 const timeHints=h('장비 점검표와 관찰 기록을 나란히 놓아보세요.','같은 순간 두 시계의 표시가 얼마나 다른지 확인하세요.','빠른 시계의 표시에서 차이를 빼세요. 시각을 그대로 비교하지 마세요.');
 const chainHints=h('각 조각의 앞뒤 표식이 있는 기록을 찾아보세요.','한 조각의 끝이 다음 조각의 시작과 이어져야 합니다.','이어질 다음 표식이 없는 갈래를 먼저 제외해보세요.');

 // Garage: no backup record is required to restore that same backup.
 {
 const t='garage';
 const offset=dial(t,'camera-offset','두 시계의 기준','카메라 보정 방향과 분을 점검 다이얼에 맞추세요.',['clock','video'],[field('subtract','빼기 1 / 더하기 0',0,1),field('offset','차이 · 분',0,20)],{subtract:1,offset:7},timeHints,'서버 20:00과 같은 순간 카메라는 20:07을 표시합니다. 카메라 시각에서 7분을 빼야 합니다.',rival('raw','화면 시각을 서버 시각으로 그대로 쓴다'));
 const entrance=dial(t,'entrance-time','입장 장면의 동기화','입장 장면을 서버 시계의 시·분에 맞추세요.',['video','clock'],[field('hour','서버 시 · 입장',0,23),field('minute','서버 분 · 입장',0,59)],{hour:21,minute:46},timeHints,'화면의 21:53:20은 서버 기준 21:46:20입니다.',rival('add','빠른 화면 시각에 차이를 더한다'),'clock');
 const exit=dial(t,'exit-time','퇴장 장면의 동기화','퇴장 장면을 같은 서버 시계에 맞추세요.',['video','clock'],[field('hour','서버 시 · 퇴장',0,23),field('minute','서버 분 · 퇴장',0,59)],{hour:21,minute:48},timeHints,'화면의 21:55:20은 서버 기준 21:48:20입니다.',rival('unchanged','퇴장 장면은 보정할 필요가 없다'),'clock');
 const identity=match(t,'personnel-card','출입 카드의 주인','출입 카드와 같은 번호의 직원 명찰을 방문자 칸에 놓으세요.',['entry','people'],[item('han','한지수'),item('kang','강민호'),item('yoon','윤서연')],[slot('visitor','기록의 방문자')],['han'],h('출입 서버와 직원 명부를 찾아보세요.','이름 대신 두 자료에 공통으로 적힌 번호를 연결하세요.','모두 같은 회색 재킷을 받았으므로 옷은 사람을 가르지 못합니다.'),'출입 서버의 07번은 한지수의 직원 번호입니다. 이 단계는 방문자 식별이며 반출 사실은 복원한 백업으로 확인합니다.',rival('jacket','회색 재킷만으로 방문자를 식별한다'));
 const alibi=match(t,'alibi-intervals','같은 시간의 다른 장소','독립적으로 확인된 두 사람의 기록을 해당 장소에 꽂으세요.',['people','video'],[item('han','한지수의 진술'),item('kang','강민호의 진술'),item('yoon','윤서연의 진술')],[slot('office','다른 지역 사무실의 영상 면담'),slot('counter','외부 결제 창구 영상')],['kang','yoon'],h('세 사람의 진술에서 별도로 확인한 기록을 보세요.','영상 기록이 있는 두 진술을 방문 시간과 겹쳐보세요.','확인되지 않은 퇴근 진술과 다른 장소에서 확인한 영상 기록을 구분하세요.'),'강민호는 21:44–21:50 면담, 윤서연은 21:42–21:52 창구 영상으로 확인됩니다.',rival('equal','퇴근했다는 말과 다른 장소에서 확인한 영상 기록은 같은 강도의 증거다'));
 const scope=match(t,'evidence-scope','인계철의 함께 확인할 기록','접근을 확인하는 종이와 동기를 설명하는 종이를 다른 칸에 놓으세요.',['entry','memo'],[item('entry','출입 서버 기록'),item('memo','폐업 인계 문서'),item('jacket','회색 재킷의 관찰')],[slot('access','누가 접근했는가'),slot('motive','기록을 숨길 이유')],['entry','memo'],h('출입 기록과 인계 메모가 각각 무엇을 증명하는지 보세요.','이유가 있다는 사실과 실제 접근한 사실은 다릅니다.','차량 작업 사진에 관한 메모는 동기의 자료입니다. 반출 확인은 복원 후에 합니다.'),'출입 서버는 접근을, 인계 메모는 무단 부품 교체 사진을 숨길 동기를 설명합니다. 반출자 확정에는 복원된 백업 센서가 더 필요합니다.',rival('motive-only','기록을 숨길 동기만으로 반출자를 확정한다'));
 const low=copy(entrance);low.id='calibrated-entrance';low.title='백업 시계 맞추기';low.fields=[...copy(offset.fields),...copy(entrance.fields)];low.target={...offset.target,...entrance.target};low.action=low.instruction='점검 영수증으로 보정 방향·차이를 정하고 입장 시·분을 함께 맞추세요.';
 install(t,[offset,entrance,exit,identity,alibi,scope],[low,exit,identity,scope]);
 }
 // Apartment: coordinate transformation precedes the physical room-code lock.
 {
 const t='apartment',coordHints=h('필름 관찰도와 건물 배치도를 비교하세요.','창문 행 아래의 필로티와 촬영한 방향을 먼저 확인하세요.','첫 창문 행은 1층이 아닙니다. 사진 좌우의 호수 순서도 앞면과 다릅니다.');
 const floor=dial(t,'floor-marker','창문 행의 높이','사진의 창문 행을 실제 층 표시에 맞추세요.',['films','plan'],[field('floor','실제 층',1,6,1)],{floor:5},coordHints,'기둥만 있는 1층 위의 첫 창문 행은 2층이므로 행 4는 실제 5층입니다.',rival('row-floor','창문 행 번호와 실제 층수가 언제나 같다'),'overlay');
 const unit=dial(t,'rear-unit','뒤편 도면의 방향','뒤편 사진의 세대 열을 실제 호수 끝 두 자리에 맞추세요.',['films','plan'],[field('unit','호수 끝 두 자리',1,4,1)],{unit:2},coordHints,'뒤편 사진 왼쪽부터 04·03·02·01입니다. 세 번째 세대는 끝자리 02입니다.',rival('front','뒤편 사진에서도 앞면의 호수 순서를 그대로 쓴다'),'overlay');
 const rooms=match(t,'room-layout','켜진 세대의 방','해당 세대 타입의 방 카드를 뒤편 창문 자리에 놓으세요.',['plan','films'],[item('main','안방'),item('living','거실'),item('small','작은방')],[slot('left','뒤편 왼쪽 창'),slot('middle','뒤편 가운데 창'),slot('right','뒤편 오른쪽 창')],['small','living','main'],h('배치도의 홀수호·짝수호 표를 확인하세요.','사진에서 찾은 호수에 적용되는 타입만 사용하세요.','방의 좌우는 현관 앞이 아니라 사진을 찍은 뒤편 기준입니다.'),'502호는 짝수 B타입으로 뒤편 왼쪽부터 작은방·거실·안방입니다.',rival('odd-layout','짝수호에 홀수호의 방 배치를 적용한다'));
 const sequence=match(t,'film-rooms','네 장의 불빛','각 필름에 켜진 방을 촬영 순서의 작은 창에 끼우세요.',['films','plan'],[item('small1','작은방 카드 A'),item('main','안방 카드'),item('living','거실 카드'),item('small2','작은방 카드 B')],[slot('film1','필름 01'),slot('film2','필름 02'),slot('film3','필름 03'),slot('film4','필름 04')],['small1','main','living','small2'],h('필름 번호는 촬영 순서입니다.','같은 방이 두 번 켜질 수 있으므로 작은방 카드는 두 장입니다.','좌우 위치를 배치도의 해당 타입에 대조하세요.'),'B타입 필름 위치는 왼쪽·오른쪽·가운데·왼쪽이므로 작은방·안방·거실·작은방입니다.',rival('unique-room','한 방은 한 번만 켜질 수 있다'));
 sequence.equivalent=[['small1','small2']];
 const lock=dial(t,'inspection-code','공책의 숫자 잠금','관찰한 방 순서를 공책의 약속 숫자로 바꿔 네 바퀴를 돌리세요.',['films','agreement','plan'],[0,1,2,3].map(i=>field('d'+i,'필름 '+String(i+1).padStart(2,'0'),0,9)),{d0:3,d1:1,d2:2,d3:3},h('아이들의 공책과 불빛을 찍은 필름을 다시 보세요.','호수의 숫자와 방에 붙인 약속 숫자를 구분하세요.','같은 방이 다시 켜졌다면 같은 약속 숫자가 다시 들어갑니다.'),'안방 1 · 거실 2 · 작은방 3을 필름 순서에 적용하면 3123입니다.',rival('unit-as-code','호수 자체를 점검함 암호로 쓴다'));
 const conditions=match(t,'night-conditions','밤의 점검판','밤의 전원과 출입 상태를 점검 일지의 해당 칸에 꽂으세요.',['power','brief'],[item('mains-off','건물 주전원 차단'),item('no-entry','야간 현관 봉인 정상'),item('all-power','독립 전원까지 모두 제거됨'),item('visitor','야간 작업자 출입')],[slot('power','주전원 확인'),slot('entry','야간 출입 확인')],['mains-off','no-entry'],h('철거 전 점검 일지를 살펴보세요.','주전원과 모든 가능한 전원은 같은 말이 아닙니다.','출입과 설치 시간을 구분하면 밤에 사람이 들어왔다는 설명을 검토할 수 있습니다.'),'18시 주전원 차단과 이후 출입 없음이 확인됩니다. 독립 전원 사양은 열린 점검함에서 확인해야 합니다.',rival('person-required','실내 불빛은 야간 사람의 출입을 반드시 뜻한다'));
 const location=copy(floor);location.id='located-unit';location.fields=[...copy(floor.fields),...copy(unit.fields)];location.target={floor:5,unit:2};location.title='사진과 도면 맞추기';location.action=location.instruction='사진의 세대를 실제 층과 호수 끝 두 자리로 맞추세요.';
 install(t,[floor,unit,rooms,sequence,lock,conditions],[location,rooms,lock,conditions]);
 }
 // Radio: actual edit marks and powered path, not an arbitrary RF dial.
 {
 const t='radio',cards=['A','B','C','D','E'].map((v,i)=>item(v,['오프닝 조각','교차로 안내 조각','신청곡 조각','맺음말 조각','교차로 다른 녹음 버전'][i]));
 const take=match(t,'version-label','비슷한 두 녹음 버전','연결 가능한 교차로 녹음 버전을 편집 슬롯에, 다른 녹음 버전을 제외 슬롯에 놓으세요.',['archive','rules'],[item('B','교차로 녹음 버전 B'),item('E','교차로 녹음 버전 E')],[slot('use','연결 가능한 녹음 버전'),slot('unused','이어지지 않는 녹음 버전')],['B','E'],chainHints,'B의 끝 연결 표식 J08은 C로 이어집니다. E의 J09를 받을 조각은 없습니다.',rival('same-words','말이 같으면 같은 녹음 버전이다'));
 const splice=sort(t,'tape-splice','원본 테이프 잇기','네 조각을 시작부터 끝까지 잇고 남은 조각을 마지막 제외함에 놓으세요.',['archive','rules'],cards,['A','B','C','D','E'],chainHints,'START→J03→J08→J17→END를 잇는 조각은 A·B·C·D입니다. E는 제외됩니다.',rival('missing-cue','앞뒤 연결 표식이 달라도 내용이 비슷하면 이어 붙인다'));
 splice.slots=[slot('first','시작 조각'),slot('second','다음 조각'),slot('third','다음 조각'),slot('fourth','끝 조각'),slot('unused','이번 복원에서 제외')];
 const date=dial(t,'recorded-date','라벨의 녹음 날짜','이어진 원본 녹음 버전의 녹음 년·월·일을 보관 다이얼에 맞추세요.',['archive','transcript'],[field('year','녹음 연',2020,2026,2020),field('month','녹음 월',1,12,1),field('day','녹음 일',1,31,1)],{year:2023,month:4,day:12},h('원본 라벨의 날짜와 받아쓴 내용을 대조하세요.','제보된 방송을 들은 날과 실제로 녹음한 날은 다를 수 있습니다.','교차로 안내에는 내용이 같은 다른 날짜의 녹음 버전도 있으니 연결 표식을 먼저 확인하세요.'),'연결된 A·B·C·D는 2023년 4월 12일 녹음입니다. 새벽 두 시라는 멘트도 원본 내용입니다.',rival('today','수신한 날짜에 새로 녹음한 방송이다'));
 const power=match(t,'powered-path','폐국 뒤의 전원','장치 카드를 각 전원 상태의 접점에 놓으세요.',['power','brief'],[item('studio','구 스튜디오'),item('relay','공식 중계소')],[slot('off','전원 차단'),slot('maintenance','별도 전원 유지보수')],['studio','relay'],h('폐국 확인서에서 대상을 나누어 읽으세요.','스튜디오와 중계소는 같은 전원 장치가 아닙니다.','한 곳이 꺼져 있다는 사실을 다른 곳에도 적용하지 마세요.'),'구 스튜디오는 차단됐지만 공식 중계소는 별도 전원으로 유지보수 중입니다.',rival('all-off','스튜디오가 꺼졌으므로 중계소도 꺼졌다'));
 const input=match(t,'input-proofs','송출 입력의 흔적','확인된 두 흔적을 입력·출력 점검함에 놓으세요.',['power','transcript'],[item('no-mic','제보 시점 마이크 입력 없음'),item('fingerprint','받은 음성과 중계소 출력 파일 비교값 일치'),item('live','현장 마이크 입력 발견'),item('foreign','다른 방송국 출력 파일 비교값 확인')],[slot('input','입력 장치 점검'),slot('output','출력 대조')],['no-mic','fingerprint'],h('폐국 확인서의 마이크 입력과 수신 대조 행을 보세요.','들린 내용만으로 생방송이나 다른 방송국을 결정할 수 없습니다.','입력 데이터와 출력 파일 비교값은 서로 다른 검증입니다.'),'마이크 입력은 없고 공식 중계소 출력과 파일 비교값이 일치합니다. 생방송이나 다른 방송국의 혼선으로 설명되지 않습니다.',rival('voice-live','현재 시각을 말하는 목소리가 들리면 생방송이다'));
 const chronology=match(t,'date-scope','두 날짜의 기록','원본이 설명하는 날과 제보가 일어난 날을 서로 다른 보관판에 꽂으세요.',['archive','brief'],[item('old','원본 라벨의 녹음일'),item('heard','택시 기사의 수신일'),item('accident','2026년 당일 사고 소식')],[slot('record','과거에 만들어진 음성'),slot('reception','이번에 음성을 들은 사건')],['old','heard'],h('녹음 라벨과 제보 기록의 날짜를 비교하세요.','녹음이 설명하는 사건과 다시 재생된 사건을 나누어보세요.','당일 교차로에는 통제가 없었다는 보관 음성의 대조 문장도 확인하세요.'),'과거 녹음과 이번 수신은 별개의 날짜입니다. 재실행 원인은 복원된 송출 로그로 확인합니다.',rival('fresh-accident','옛 교차로 멘트는 제보 당일의 새 사고를 뜻한다'));
 install(t,[take,splice,date,power,input,chronology],[splice,date,power,input]);
 }
 // Station: adjacency and totals are those of the fictional railway itself.
 {
 const t='station',routeHints=h('승강장 개편표와 이용내역을 펼쳐보세요.','총 소요와 운임에는 환승 전 구간도 포함됩니다.','같은 시간·요금인 반대 방향이 있으므로 방향 조건도 함께 확인하세요.');
 const platform=match(t,'old-platform','바뀐 승강장 표지','옛 표지를 현재 승강장과 진행 방향에 맞춰 끼우세요.',['platform','ticket'],[item('north','현재 2번 · 북쪽'),item('south','현재 1번 · 남쪽')],[slot('old3','사진 속 옛 3번 표지'),slot('old2','개편 전 2번 표지')],['north','south'],routeHints,'옛 3번은 현재 2번 승강장으로 북쪽 방향, 옛 2번은 현재 1번 승강장으로 남쪽 방향입니다.',rival('ghost','낡은 3번 표지는 존재하지 않는 역을 증명한다'));
 const nodes=[item('miru','미루'),item('central','중앙'),item('north','북문'),item('surim','수림'),item('lodge','산장'),item('south','남문'),item('river','강변'),item('works','공단')];
 const edges=[['miru','central',5,300],['central','north',3,200],['north','surim',5,300],['surim','lodge',4,200],['central','south',3,200],['south','river',5,300],['river','works',4,200]];
 const route=stage(t,'rail-route','route','도착 기록의 노선','연결된 실제 역을 따라 이동 흔적을 놓으세요.',['platform','route','ticket'],{items:nodes,nodes,edges,start:'miru',target:['miru','central','north','surim'],constraints:{duration:13,fare:800,via:'central',direction:'north'},hints:routeHints,explanation:'미루 → 중앙 → 북문 → 수림은 총 13분·800원이며, 북쪽 방향입니다. 강변은 합계가 같아도 방향이 맞지 않습니다.',exclude:rival('fare-only','시간과 요금만 같으면 어느 방향이든 맞는다')});
 const totals=dial(t,'route-counters','구간권의 두 계기','승차부터 도착 알림까지의 전체 소요·운임을 기록 계기에 맞추세요.',['ticket','route'],[field('minutes','전체 소요 · 분',0,30),field('fare','선불 운임 · 원',0,1500,0,100)],{minutes:13,fare:800},routeHints,'휴대폰 이용내역의 전체경과13분과 선불 구간권800원을 구간 운행표에 적용합니다.',rival('transfer-only','중앙역 이후 구간만 전체 합계에 포함한다'));
 const locker=dial(t,'destination-locker','도착지의 사물함','노선에서 찾은 도착지 역코드와 예약 칸을 세 숫자 바퀴에 맞추세요.',['route','ticket','locker','platform'],[field('d0','역코드 십의 자리',0,9),field('d1','역코드 일의 자리',0,9),field('d2','예약 칸',0,9)],{d0:2,d1:4,d2:3},h('역코드 표와 사물함 예약표를 비교하세요.','사물함 숫자는 역코드 뒤에 예약 칸을 붙이는 규칙입니다.','도착지 이름은 운임만 아니라 승강장 방향도 만족해야 합니다.'),'수림의 역코드 24와 예약 칸 3을 이어 쓰면 잠금 숫자는 243입니다.',rival('start-code','승차역 코드를 도착지 사물함에 쓴다'));
 const reader=match(t,'missing-reader','빈 하차 기록','하차 단말이 없는 두 간이역의 표식을 미설치함에 넣으세요.',['ticket','route'],[item('surim','수림'),item('river','강변'),item('central','중앙'),item('miru','미루')],[slot('reader1','단말 미설치 역 A'),slot('reader2','단말 미설치 역 B')],['surim','river'],h('이용내역의 역 단말 현황을 확인하세요.','빈 기록의 이유와 도착지 식별은 다른 질문입니다.','미설치 간이역 둘 중 방향과 전체 소요를 만족하는 곳이 도착지입니다.'),'수림과 강변은 하차 단말이 없습니다. 도착지는 북쪽 조건으로 수림이며 기록의 공백만으로 실종을 단정할 수 없습니다.',rival('missing-person','하차 기록이 없으면 사람이 사라진 것이다'));reader.equivalent=[['surim','river']];
 const safe=match(t,'confirmation-scope','연락 확인의 준비','지금 확인된 준비와 아직 직접 확인할 내용을 분리해 놓으세요.',['brief','locker'],[item('reservation','출발 전 본인 사물함 예약'),item('safety','도착 후 본인이 원해서 왔는지와 안전 확인'),item('ghost','폐역의 존재 입증')],[slot('known','기록으로 확인한 준비'),slot('needed','도착지에서 별도 확인할 사항')],['reservation','safety'],h('친구의 의뢰와 예약표의 주의 문장을 읽어보세요.','사전 예약이 확인하는 것은 준비 여부입니다.','자발성과 안전은 도착지에서 직접 연락해 확인해야 합니다.'),'예약은 사전 준비의 기록입니다. 예약만으로 지금 안부까지 알 수는 없습니다. 담당자가 민서를 직접 만났고, 이어진 통화에서 본인의 뜻으로 왔으며 안전하다는 답을 들었습니다.',rival('reservation-safe','사전 예약만으로 강요가 없고 안전하다고 확정한다'));
 install(t,[platform,totals,route,locker,reader,safe],[platform,route,locker,safe]);
 }
 // Laundry: calendar boundary is part of the clock, not decoration.
 {
 const t='laundry';
 const machine=match(t,'coat-machine','코트의 보관 기계','주문 꼬리표를 품목 취급에 맞는 기계에 걸어주세요.',['order','receipt'],[item('N08','N-08 울 코트'),item('water','물세탁 작업표'),item('dry','열풍 건조 작업표')],[slot('machine1','1번 기계'),slot('machine2','2번 기계'),slot('machine3','3번 기계')],['water','N08','dry'],h('코트 접수표의 취급 조건을 확인하세요.','이 코트는 현장에서 다시 세탁하거나 건조하지 않습니다.','각 기계의 역할과 주문표의 취급을 연결하세요.'),'1번은 물세탁, 2번은 코트 수령 보관, 3번은 열풍 건조입니다. N-08은 2번에 보관됐습니다.',rival('dry-coat','완료된 코트를 찾으려면 열풍 건조기를 열어야 한다'));
 const offset=dial(t,'terminal-offset','단말 시계 점검','같은 순간의 두 표시로 보정 방향과 차이를 맞추세요.',['clock','receipt'],[field('subtract','빼기 1 / 더하기 0',0,1),field('offset','차이 · 분',0,20)],{subtract:1,offset:12},timeHints,'서버23:00일 때 현장 단말은23:12입니다. 현장 표시에서12분을 뺍니다.',rival('slow','단말 시계가 서버보다 느리다'));
 const correct=dial(t,'real-pickup-time','자정을 넘긴 수령표','단말의 수령 표시를 실제 월·일·시·분으로 맞추세요.',['receipt','clock'],[field('month','실제 월',1,12,1),field('day','실제 일',1,31,1),field('hour','실제 시',0,23),field('minute','실제 분',0,59)],{month:10,day:9,hour:23,minute:56},h('영수증의 날짜와 점검 스티커를 함께 보세요.','보정 중 자정을 넘으면 실제 날짜도 달라집니다.','빠른 단말에서 차이를 빼면 표시된 날의 전날로 돌아갈 수 있습니다.'),'10월 10일 00:08에서 12분을 빼면, 실제 시각은 10월 9일 23:56입니다.',rival('same-day','분만 바꾸고 영수증 날짜는 그대로 둔다'),'clock');
 const timeline=sort(t,'night-timeline','밤의 출입 띠','서버 시각의 출입 표지를 먼저부터 나중까지 놓으세요.',['entry','receipt'],[item('operator-in','운영자 입장'),item('operator-out','운영자 퇴장'),item('customer-in','고객 입장'),item('customer-out','고객 퇴장')],['operator-in','operator-out','customer-in','customer-out'],h('출입 목록의 서버 시각을 확인하세요.','자정 전과 자정 후를 한밤의 이어진 순서로 읽으세요.','단말 수령 시각을 보정한 후에 출입 띠와 비교하세요.'),'서버 기록은 운영자23:51입장·23:57퇴장, 고객23:58입장·00:02퇴장입니다.',rival('receipt-order','단말 표시가 나중이므로 고객이 먼저 수령했다'));
 const presence=match(t,'present-person','수령 표시 당시의 사람','보정한 수령 순간의 현장 인물과 이후 도착한 인물을 구분해 놓으세요.',['entry','clock','receipt'],[item('operator','서도윤 · 운영자 O-2'),item('customer','이서경 · 고객')],[slot('during','보정한 수령 순간 현장'),slot('later','그 뒤 도착한 사람')],['operator','customer'],h('점검 스티커로 수령표를 먼저 보정하세요.','실제 수령 순간이 누구의 입장·퇴장 사이인지 보세요.','카드 명의는 출입 목록 아래 문장에 있습니다.'),'실제 23:56에는 운영자 O-2만 있었고, 이서경은 23:58에 들어왔습니다. 정확한 반출은 원장 복원 뒤 확인합니다.',rival('customer-present','고객이 보정한 수령 시각에 현장에 있었다'));
 const label=match(t,'receipt-proof','수령표의 알려주는 내용','기계 상태 기록과 수동 처리 표기를 별도 칸에 놓으세요.',['receipt','note'],[item('manual','운영자가 선택할 수 있는 처리 항목'),item('arrival','고객이 말한 도착 시각'),item('automatic','코트를 직접 받은 사람을 자동 확인한 신원 기록')],[slot('receipt','영수증의 고객 수령 문구'),slot('message','고객 문의의 시각 주장')],['manual','arrival'],h('영수증 아래 문장과 운영자 문의를 비교하세요.','처리 항목은 운영자가 직접 선택할 수 있습니다.','영수증 표기 하나로 현장 인물이나 품목 반출을 확정하지 마세요.'),'고객 수령은 수동 처리 항목입니다. 보관함이 열린 기록, 코트 무게가 사라진 기록, 그때의 출입 명부를 함께 봐야 누가 가져갔는지 알 수 있습니다.',rival('label-proof','고객 수령 문구만으로 고객의 수령을 증명한다'));
 install(t,[machine,offset,correct,timeline,presence,label],[machine,correct,presence,label]);
 }
 // Letter: all four pieces are available within this episode itself.
 {
 const t='letter';
 const address=match(t,'address-placard','옛 주소의 현재 표찰','봉투의 지번과 정확히 대응하는 현재 주소표를 서고 입구에 끼우세요.',['envelopes','address'],[item('42','미루기록길 42'),item('12','미루기록길 12'),item('21','미루기록길 21')],[slot('destination','현재 수신처')],['12'],h('봉투의 받는 곳과 주소 변경 공고를 대조하세요.','숫자의 자릿수와 하이픈까지 같은 지번을 찾으세요.','비슷한 두 지번은 각각 다른 건물입니다.'),'미루동 17-4의 현재 주소는 미루기록길 12입니다. 17-14나 71-4는 다른 건물입니다.',rival('digits-only','주소 숫자의 배열이 비슷하면 같은 건물이다'));
 const envelopes=sort(t,'postal-order','우체국 날짜 도장의 시간순','반송 봉투를 사서가 정한 시간 방향으로 정렬하세요.',['envelopes','classification'],[item('station','도착 확인서 봉투'),item('garage','폐업 인계 문서 봉투'),item('radio','송출 보고서 봉투'),item('apartment','조명 점검서 봉투')],['garage','apartment','radio','station'],h('사서의 분류 메모와 봉투 우체국 날짜 도장을 확인하세요.','자료의 사건 번호와 우체국 날짜 도장 날짜는 같은 정렬 기준이 아닙니다.','메모는 오래된 우체국 날짜 도장부터 읽으라고 했습니다.'),'우체국 날짜 도장 09.19 → 09.23 → 09.27 → 10.01은 정비소 → 연립 → 방송 → 도착 확인서 순서입니다.',rival('case-order','이야기의 번호순으로 봉투를 정렬한다'));
 const pieces=sort(t,'backside-pieces','봉투 뒤의 분류 조각','정렬한 봉투의 뒤판 조각을 읽는 순서대로 끼우세요.',['envelopes','classification'],[item('M','영문 조각 M'),item('R','영문 조각 R'),item('17','숫자 조각 17'),item('04','숫자 조각 04')],['M','R','17','04'],h('각 봉투의 뒤쪽 분류 조각을 확인하세요.','정렬한 우체국 날짜 도장 순서대로 뒤판도 함께 이동합니다.','사건 내용이 아니라 봉투에 붙은 조각을 읽으세요.'),'오래된 우체국 날짜 도장부터 뒤판을 읽으면 M·R·17·04입니다.',rival('alphabetical','영문·숫자 크기순으로 조각을 정렬한다'));
 const shelf=match(t,'shelf-locator','보존서가의 표찰','읽은 조각을 서가 위치의 열·단·칸에 맞춰 끼우세요.',['classification','envelopes','catalogue'],[item('MR','MR 표찰'),item('FM','FM 표찰'),item('RD','RD 표찰'),item('17','17 표찰'),item('07','07 표찰'),item('27','27 표찰'),item('04','04 표찰'),item('14','14 표찰'),item('40','40 표찰')],[slot('column','열'),slot('row','단'),slot('cell','칸')],['MR','17','04'],h('서가 위치를 나누는 사서의 메모를 읽으세요.','영문 두 글자 뒤의 두 자리 숫자들을 단과 칸으로 나눕니다.','메모의 예시는 실제 묶음의 위치가 아닙니다.'),'영문 두 글자 MR은 열, 다음 숫자 17은 단, 마지막 숫자 04는 칸을 가리킵니다.',rival('example','메모의 예시 서가 위치가 실제 보관 위치다'));
 const returnPath=sort(t,'postal-return','반송 봉투의 이동','수신처와 반송 도장을 따라 우편의 이동 표지를 잇세요.',['envelopes','address'],[item('old','옛 지번으로 발송'),item('unknown','주소 불명 도장'),item('sender','공통 발신지로 반송')],['old','unknown','sender'],h('봉투의 받는 곳·반송 도장·발신지를 살펴보세요.','반송은 받는 곳에서 발신지로 돌아가는 처리입니다.','새 서고의 인수자는 옮겨 보관 대장을 열고 확인하게 됩니다.'),'네 봉투는 옛주소로 보내졌다가 주소불명으로 공통 발신지에 돌아왔습니다. 새 서고 옮겨 보관은 열린 받은 서류 기록이 확인합니다.',rival('hidden','반송 도장은 누군가 의도적으로 자료를 숨겼다는 증거다'));
 const type=match(t,'archive-material','자료군의 보존 봉투','사본 묶음에 해당하는 자료군과 다른 자료군의 표찰을 알맞게 놓으세요.',['catalogue','envelopes'],[item('MR','동의받은 사건 종이 사본'),item('FM','방송 원본과 방송 목록'),item('RD','노선 원본과 운행 자료')],[slot('case','사건 해결 후 종이 사본'),slot('broadcast','방송 원본'),slot('railway','노선 원본')],['MR','FM','RD'],h('보존서고 목록에서 자료군을 확인하세요.','봉투 안의 자료가 원본인지 종이 사본인지 구별하세요.','목록은 사건 사본군에 SD카드 데이터가 없다고 명시합니다.'),'MR은 동의받은 종이 사본군입니다. 같은 분류는 공범이나SD 데이터 보관을 뜻하지 않습니다.',rival('sd','종이 사본 묶음 안에 정비소 SD카드 데이터가 있다'));
 install(t,[address,envelopes,pieces,shelf,returnPath,type],[address,envelopes,shelf,type]);
 }
 // Pet-home: matching administrative links, never resemblance or destiny.
 {
 const t='pet-home',objects=[item('blanket','접힌 담요'),item('ribbon','파란 명찰 끈'),item('ticket','입양 확인서'),item('receipt','진료 봉투')];
 const roles=match(t,'care-objects','물건의 돌봄 자리','물건 뒷면의 날짜·도장을 접수표 단계에 맞춰 놓으세요.',['objects','records','rule'],objects,[slot('rescue','처음 발견'),slot('clinic','진료'),slot('foster','임시보호'),slot('adopt','장기 입양')],['ribbon','receipt','blanket','ticket'],h('물건을 뒤집어 도장과 날짜를 확인하세요.','접수표의 날짜와 도장이 모두 맞는 처리 단계에 연결하세요.','병원·임시보호집의 기록을 장기 입양 기록과 구분하세요.'),'7월 16일 해 도장이 찍힌 파란 명찰 끈은 발견, 7월 17일 십자 도장의 진료 봉투는 진료, 7월 18일 새싹 도장의 담요는 임시보호, 8월 2일 집 도장의 입양 확인서는 장기 입양 기록입니다.',rival('four-owners','기념품은 네 명의 장기 주인을 뜻한다'));
 const order=sort(t,'care-time','한 달의 기억 띠','기념품을 접수 날짜의 흐름대로 앨범 띠에 놓으세요.',['objects','records'],objects,['ribbon','receipt','blanket','ticket'],h('물건 뒷면과 처음 한 달 접수표를 비교하세요.','각 물건의 날짜가 돌봄의 앞뒤를 알려줍니다.','같은 접수번호가 단계 사이에 이어지는지도 확인하세요.'),'구조→진료→임시보호→장기입양 순서입니다. 접수번호는 모두27입니다.',rival('label-number','물건 종류 이름순으로 과거를 정렬한다'));
 const providers=match(t,'care-providers','서로 다른 손길','담당자 카드를 접수표의 돌봄 역할 칸에 꽂으세요.',['records','brief'],[item('finder','어린 신고자'),item('clinic','담담동물병원'),item('foster','햇살 임시보호집'),item('guardian','박정우')],[slot('found','구조 신고'),slot('treated','진료 담당'),slot('temporary','임시보호 담당'),slot('long','열 해의 장기 보호')],['finder','clinic','foster','guardian'],h('접수표의 담당과 처리 항목을 함께 읽으세요.','진료기관과 임시보호 담당자는 장기 입양자가 아닙니다.','현재 의뢰에는 장기 보호자의 재입양 사정도 적혀 있습니다.'),'병원과 임시보호집은 인계 담당이며 박정우가 열 해 보호했습니다. 그는 살아 있고 정식 재입양을 진행했습니다.',rival('dead','이 상자는 세상을 떠난 이전 보호자의 유품이다'));
 const identity=sort(t,'registry-chain','과거와 현재의 연결','같은 강아지를 잇는 문서 표지를 과거부터 현재까지 꽂으세요.',['identity','objects'],[item('reception','2016년 접수표'),item('vet','2016년 진료 연결 기록'),item('registration','과거 동물등록 연결 기록'),item('contract','2026년 재입양 계약')],['reception','vet','registration','contract'],h('진료 봉투의 연결 표기와 루미의 진료·입양 기록을 확인하세요.','접수번호에서 진료 연결번호로, 그다음 현재 계약의 등록번호로 이어집니다.','이름이나 털색이 달라도 연결된 식별 번호가 같은지 보세요.'),'접수 27번 → 진료 V-6384 → 등록번호 941372608154902 → 현재 계약. 같은 등록번호가 이어집니다.',rival('appearance','외모와 이름이 비슷하면 같은 강아지다'));
 const photo=match(t,'finder-correspondence','사진첩과 작은 끈','옛 사진과 대조할 수 있는 세 흔적을 해당 사진 정보 옆에 놓으세요.',['photos','objects'],[item('ribbon','학교 명찰 끈'),item('date','구조 날의 물건 날짜'),item('place','사진 원본의 장소'),item('fur','현재 털 모양')],[slot('school','학교 소속의 흔적'),slot('day','발견 날짜의 흔적'),slot('location','정류장 장소의 흔적')],['ribbon','date','place'],h('유나의 사진첩에서 원본 정보와 명찰 끈을 보세요.','사진 날짜·정류장 위치·학교 끈은 별개의 대조 자료입니다.','현재 외모는 열 해 전 발견자를 확인하는 자료로 쓰지 않습니다.'),'2016년 7월 16일 햇살동 버스정류장 사진과 햇살중의 파란 명찰 끈이, 상자 속 물건의 날짜와 흔적에 맞습니다.',rival('recognition','유나가 강아지의 얼굴을 알아본 사실이 발견자 증거다'));
 const adoption=sort(t,'adoption-order','새 가족과 뒤늦은 상자','이번 입양에서 실제로 이어진 일을 의뢰서 순서대로 놓으세요.',['brief','photos'],[item('visits','현재 루미를 세 차례 만남'),item('adopt','입양 결정'),item('box','기념품 상자를 전달받음'),item('archive','옛 사진 자료 조사')],['visits','adopt','box','archive'],h('유나의 의뢰에서 공고 내용과 상자 전달 시점을 보세요.','구조 장소와 날짜가 입양 공고에 공개됐는지 확인하세요.','이미 현재의 루미를 보고 결정한 뒤 과거의 상자를 받았습니다.'),'현재 루미와 만난 뒤 입양을 정했고 상자는 그다음 전달됐습니다. 과거의 고마움 때문에 입양을 결정한 것이 아닙니다.',rival('destiny','과거 구조 사실을 알고 보답하기 위해 입양했다'));
 install(t,[roles,order,providers,identity,photo,adoption],[roles,identity,photo,adoption]);
 }
 // Cat-invite: gift placement itself is the puzzle surface.
 {
 const t='cat-invite',gifts=[item('vet','은호의 선물'),item('baker','소연의 선물'),item('post','지후의 선물'),item('florist','미정의 선물'),item('courier','준호의 배송 물품')];
 const participants=match(t,'guest-parcels','네 선물과 배송 상자','네 모임 선물을 준비대에, 일반 배송 물품을 별도 배송대에 놓으세요.',['gifts','card'],gifts,[slot('guest1','모임 선물 A'),slot('guest2','모임 선물 B'),slot('guest3','모임 선물 C'),slot('guest4','모임 선물 D'),slot('delivery','일반 배송')],['vet','baker','post','florist','courier'],h('리본 아래 이름표와 감사 카드를 살펴보세요.','모임을 준비한 사람은 돌봄 당번표의 네 사람입니다.','흰 포장은 가게의 일반 배송이라고 적혀 있습니다.'),'은호·소연·지후·미정의 네 선물이 모임에 속하고 준호는 일반 배송입니다.',rival('fifth-guest','흰 배송 포장도 다섯 번째 참석자의 선물이다'));participants.equivalent=[['vet','baker','post','florist']];
 const compass=match(t,'room-compass','가게 자리판','장소 카드를 위에서 내려다본 방위 자리에 끼우세요.',['room','notes'],[item('window','창가'),item('flower','꽃 선반'),item('door','출입문'),item('table','포장대')],[slot('north','북쪽'),slot('east','동쪽'),slot('south','남쪽'),slot('west','서쪽')],['window','flower','door','table'],h('포장 가게의 자리표를 확인하세요.','사진의 좌우보다 위에서 내려다본 도면을 기준으로 보세요.','메모의 창가 시작점을 방위표에 연결하세요.'),'북창가·동꽃선반·남출입문·서포장대입니다.',rival('photo-left','사진 왼쪽을 언제나 서쪽이라고 정한다'));
 const seating=match(t,'gift-seating','선물이 기다릴 자리','네 사람의 메모를 따라 선물을 방위별 의자에 놓으세요.',['notes','room'],gifts,[slot('north','북쪽 자리'),slot('east','동쪽 자리'),slot('south','남쪽 자리'),slot('west','서쪽 자리')],['vet','baker','post','florist'],h('네 사람의 메모와 가게 자리표를 함께 보세요.','창가에서 시작해 시계 방향으로 바로 다음 자리를 찾으세요.','한 사람마다 한 자리이고 마지막 사람은 남은 자리에 앉습니다.'),'북쪽 은호의 자리에서 시계 방향으로 동쪽 소연 → 남쪽 지후 → 서쪽 미정이 앉습니다.',rival('counterclockwise','바로 다음 자리를 반시계 방향으로 잡는다'));
 const ribbons=dial(t,'ribbon-seal','자리별 리본 걸쇠','선물을 놓은 자리의 이름표 숫자로 북·동·남·서 걸쇠를 맞추세요.',['gifts','notes','room'],['north','east','south','west'].map((id,i)=>field(id,['북쪽','동쪽','남쪽','서쪽'][i]+' 걸쇠',0,9)),{north:2,east:5,south:7,west:1},h('선물 이름표의 봉인 숫자를 확인하세요.','먼저 사람의 자리를 정한 뒤 그 사람의 숫자를 옮깁니다.','배송 상자의 숫자는 네 선물 모임에 사용하지 않습니다.'),'북·동·남·서에 앉은 은호·소연·지후·미정의 봉인 숫자는 2·5·7·1입니다.',rival('parcel-order','이름표에 나온 목록 순서만 보고 자리 조건을 무시한다'));
 const date=dial(t,'family-calendar','당번이 멈춘 날','돌봄 당번이 비워진 월·일을 기념 달력에 맞추세요.',['date','card'],[field('month','기념 월',1,12,1),field('day','기념 일',1,31,1)],{month:6,day:12},h('봄이를 돌보던 달력과 감사 카드를 읽어보세요.','당번이 비워진 이유는 매일 돌아올 집이 생겼기 때문입니다.','정확한 생일을 알아낸 기록과 가족이 된 날짜는 구분하세요.'),'달력에는 6월 12일부터 당번을 비우라고 쓰여 있고, 그 아래 다은의 이름이 남아 있습니다. 봄이의 실제 생일은 알려져 있지 않습니다.',rival('birthday','달력 날짜가 봄이의 실제 생일을 증명한다'));
 const occasion=match(t,'gift-purpose','감사의 작은 상자','카드에서 부탁한 두 준비물을 감사 상자에 놓으세요.',['card','date'],[item('flowers','꽃'),item('words','고마운 문구'),item('food','사료'),item('birth','확인된 고양이 생일표')],[slot('gift','이번 선물'),slot('message','함께 적을 내용')],['flowers','words'],h('접힌 감사 카드의 부탁을 확인하세요.','달력의 돌봄 당번이 멈춘 까닭과 이번 선물 종류를 연결하세요.','이번 모임은 사료를 준비하지 말라고 했습니다.'),'네 이웃은 꽃과 고마운 문구를 준비했습니다. 입양 날짜와 수신자는 열린 초대장이 최종 확인합니다.',rival('food-party','네 사람이 사료를 준비하는 고양이 생일 모임이다'));
 install(t,[participants,compass,seating,ribbons,date,occasion],[participants,seating,date,occasion]);
 }
 // Studio: printing is already complete; only the exhibition label remains to prepare.
 {
 const t='studio';
 const portrait=match(t,'portrait-label','액자에 붙일 이름표','완성한 사진의 인물과 촬영자 이름표를 액자 뒤의 두 자리에 끼우세요.',['portrait-back','wall','paper'],[item('owner','사진관 주인'),item('yoonseo','윤서'),item('grandchild','손주')],[slot('subject','사진 속 인물'),slot('photographer','그날의 촬영자')],['owner','yoonseo'],h('사진 뒷면과 작품 벽의 작은 흔적을 비교하세요.','봉투를 맡긴 사람과 사진에 담긴 사람은 같지 않을 수 있습니다.','뒷면에서 사진의 호칭과 누가 이번에는 찍겠다고 했는지 찾아보세요.'),'사진의 인물은 사진관 주인이고 촬영자는 윤서입니다. 앞치마의 초승달과 사진 뒷면의 사장님 사진 1호가 인물을 확인합니다.',rival('yoonseo-subject','윤서가 맡긴 봉투이므로 사진 속 인물도 윤서다'));
 const dates=match(t,'exhibition-dates','서로 다른 두 날짜','사진 뒷면의 두 날짜 표찰을 촬영과 인화의 보존 자리에 붙이세요.',['portrait-back','brief'],[item('past','2006년 3월'),item('today','오늘'),item('unknown','날짜 미확인')],[slot('shot','촬영 기록'),slot('printed','인화 기록')],['past','today'],h('사진 뒷면의 촬영·인화 표기와 오래된 봉투를 확인하세요.','사진이 찍힌 날과 종이에 완성된 날을 나누어 보세요.','봉투가 오래됐다고 오늘 완성한 인화 날짜도 과거가 되지는 않습니다.'),'2006년 3월에 촬영한 필름을 오늘 인화했습니다. 과거 촬영일과 현재 인화일을 별도 보존 표찰로 붙입니다.',rival('same-date','촬영일과 인화일은 모두 오래된 봉투의 날짜다'));
 const promise=match(t,'promise-caption','약속을 남기는 전시 문구','봉투와 사진 뒷면에서 옮긴 문구를 액자 설명의 해당 줄에 붙이세요.',['paper','portrait-back','brief'],[item('together','인화는 같이 해요'),item('photograph','이번엔 제가 찍을게요'),item('first','사장님 사진 1호'),item('unclaimed','윤서의 미수령 인물 사진')],[slot('promise','미뤄두었던 약속'),slot('camera','그날 카메라를 든 사람의 말'),slot('title','완성한 작품의 호칭')],['together','photograph','first'],h('빛에 드러난 봉투 문구와 사진 뒷면을 나란히 펼쳐보세요.','함께 하자는 문장과 누가 찍겠다는 문장은 서로 다른 일을 말합니다.','완성한 작품의 호칭은 사진 뒷면에 따로 적혀 있습니다.'),'윤서는 주인의 사진을 찍었고 함께 인화하자는 약속을 남겼습니다. 봉투를 지킨 이유는 윤서의 미수령 사진이 아니라 함께 끝낼 인화였습니다.',rival('unclaimed-portrait','스무 해 보관한 봉투는 윤서가 찾아가지 않은 윤서 자신의 사진이다'));
 install(t,[portrait,dates,promise],[portrait,dates]);
 }
 // Ohang: dynamic seed/companion are bound by plan(context), never guessed from birth date.
 {
 const t='ohang',elements=[item('wood','목 · 나무'),item('fire','화 · 불'),item('earth','토 · 흙'),item('metal','금 · 쇠'),item('water','수 · 물')],ids=elements.map(x=>x.id);
 const cycle=stage(t,'helping-cycle','symbol','씨앗에서 시작하는 그릇','나의 시작 빛부터 돕는 순환의 다섯 그릇을 놓으세요.',['circle','symbols'],{kind:'symbol',items:elements,slots:ids.map((_,i)=>slot('cycle'+i,i===0?'시작 빛의 자리':'이어지는 빛 '+(i+1))),target:ids,dynamic:'seed-cycle',hints:h('상생의 고리 기록과 나의 다섯 빛을 펼쳐보세요.','순환은 같지만 시작점은 이번 시작 빛입니다.','끝 빛 다음이 처음 씨앗으로 돌아오는지도 확인하세요.'),explanation:'상생은 목→화→토→금→수의 순환이며, 개인의 시작 빛에서 시작합니다.',exclude:rival('fixed-start','모든 사람의 시작 빛은 언제나 목이다')});
 const compass=match(t,'five-directions','오방의 자리','방향표와 상징 표를 대조하여 다섯 자리에 그릇을 놓으세요.',['directions','symbols'],elements,[slot('north','북'),slot('east','동'),slot('south','남'),slot('west','서'),slot('center','중앙')],['water','wood','fire','metal','earth'],h('접힌 방향표와 다섯 빛의 원리를 읽어보세요.','도면의 위가 북쪽이고 색과 방위가 연결됩니다.','중앙은 네 방향 가운데의 별도 자리입니다.'),'북쪽은 수, 동쪽은 목, 남쪽은 화, 서쪽은 금, 중앙은 토입니다.',rival('center-direction','중앙도 네 방향 중 하나다'));
 const objects=match(t,'symbol-objects','빛의 작은 물건','상징 표에 연결된 물건을 빛의 보관칸에 놓으세요.',['symbols','reserve'],[item('plant','새싹'),item('light','등불'),item('rest','그릇'),item('ring','종'),item('flow','물잔')],ids.map(id=>slot(id,elements.find(e=>e.id===id).label)),['plant','light','rest','ring','flow'],h('다섯 빛의 원리에 적힌 물건 표를 확인하세요.','색·방향·물건은 같은 상징을 가리키는 다른 표식입니다.','접수표의 물건은 지금의 선택을 기록한 것이며 미래의 결과가 아닙니다.'),'목새싹·화등불·토그릇·금종·수물잔이 같은 상징으로 연결됩니다.',rival('forecast','물건 표는 그 사람의 미래 결과를 단정한다'));
 const control=stage(t,'watching-light','symbol','등불의 빛을 살피는 걸쇠','이번 표식으로 향하는 상극 화살표 앞의 빛을 걸쇠에 놓으세요.',['directions','symbols'],{kind:'symbol',items:elements,slots:[slot('helper','이번 표식을 살피는 빛')],target:['metal'],dynamic:'companion-predecessor',hints:h('방향표 안쪽의 상극 화살표를 확인하세요.','화살표가 이번 표식으로 들어오는 쪽을 찾습니다.','화살표 뒤의 빛이 아니라 앞의 빛을 놓아야 합니다.'),explanation:'목→토→수→화→금의 상극 순환에서 이번 표식으로 향하는 화살표 앞의 빛을 선택합니다.',exclude:rival('successor','이번 표식 다음의 빛이 이번 표식을 살피는 빛이다')});
 const carbon=sort(t,'carbon-intake','먹지 접수표의 흐름','접수대에서 실제로 일어난 일을 종이 띠의 순서에 놓으세요.',['brief','reserve'],[item('blank','비어 있는 오늘 접수함'),item('choose','오늘 문장과 물건을 선택'),item('copy','먹지로 아래 사본에 옮김'),item('fold','받는 사람 칸을 접어 보관')],['blank','choose','copy','fold'],h('접수대의 부탁과 접어둔 예약을 읽어보세요.','선택한 문장은 먹지를 통해 아래 사본에도 남습니다.','처음 접수함이 비어 있었다는 사실을 잊지 마세요.'),'오늘의 선택이 먹지로 옮긴 접수표에 남고 받는 사람 칸은 접힌 면 안에 있습니다. 과거에 적힌 예언이 아닙니다.',rival('prophecy','선택하기 전부터 과거에 미래를 적어 둔 편지다'));
 const meaning=match(t,'letter-agency','편지를 정하는 손','생일 상징과 접수대 선택을 편지의 서로 다른 칸에 놓으세요.',['brief','symbols','reserve'],[item('symbol','계산된 다섯 빛의 상징'),item('choice','내가 고른 접수표 문장'),item('prediction','정해져 있는 미래 예언')],[slot('imagery','편지의 빛깔과 물건'),slot('direction','편지에 맡길 마음')],['symbol','choice'],h('다섯 빛의 원리와 접수대의 선택을 비교하세요.','상징은 이미지의 씨앗이고 문장은 내가 고릅니다.','좋고 나쁜 미래가 정해져 있다는 설명은 이 공간에 없습니다.'),'생일에서 계산한 상징은 편지의 이미지를 정하고 접수표 선택은 마음의 방향을 정합니다. 최종 물건도 플레이어의 선택입니다.',rival('birth-decides','태어난 날의 분포가 편지의 마음과 결말을 모두 정한다'));
 install(t,[cycle,compass,objects,control,carbon,meaning],[cycle,compass,control,carbon]);
 }

 const openings={
  garage:{prop:'백업 단말의 시각 검색대',opening:'수사 도구의 검색대는 서버 시각으로 백업을 찾습니다. 현장 영수증과 영상으로 두 시계를 맞춘 뒤, 방문 카드와 인계 자료를 검색철에 꽂아 복원할 구간을 정합니다. 자료를 맞추면 센서가 남긴 원본 기록을 열람할 수 있습니다.'},
  apartment:{prop:'필름 도면대와 점검함',opening:'관리자의 점검함에는 아이들의 방 숫자 약속이 쓰였습니다. 사진을 도면대에 겹쳐 실제 세대와 방 순서를 찾고 공책의 약속으로 잠금 바퀴를 돌리세요. 주전원과 출입 상태도 별도 점검판에 남겨야 열린 함의 장치 사양을 해석할 수 있습니다.'},
  radio:{prop:'원본 테이프 편집대',opening:'편집대에서 녹음 조각의 표식를 이어 같은 파일의 조각을 복원합니다. 녹음 라벨과 전원 점검표를 인계철에 꽂으면 보관 담당자가 해당 파일의 송출 로그를 꺼냅니다. 다이얼은 임의의 주파수가 아니라 복원한 녹음의 날짜를 가리킵니다.'},
  station:{prop:'노선도와 도착지 사물함',opening:'분실자 연락 담당자의 노선도에서 옛 승강장을 현재 안내와 맞춥니다. 연결 구간의 시간과 선불 운임으로 도착지를 찾으면, 본인이 예약한 사물함의 규칙에 맞는 역코드와 칸 번호를 돌릴 수 있습니다. 예약 자체로 안전을 확정하지는 않습니다.'},
  laundry:{prop:'수령 기계의 대조 점검대',opening:'고객과 함께 품목 접수표·단말 영수증·서버 출입 목록을 대조합니다. 수령 기계의 번호와 실제 날짜·시각을 조사용 검색대에 맞추면 봉인 원장의 해당 구간을 찾을 수 있습니다. 영수증 처리 문구와 실제 반출을 별도 기록으로 확인합니다.'},
  letter:{prop:'반송 묶음의 보존서가',opening:'사서가 남긴 실제 분류 규칙으로 봉투를 정리합니다. 현재 주소를 찾아 우체국 날짜 도장순 조각을 열·단·칸 표찰에 맞추면 지정 서가의 받은 서류 기록을 꺼낼 수 있습니다. 이 표찰은 누군가 남긴 범행 암호가 아니라 보존서고의 서가 위치입니다.'},
  'pet-home':{prop:'루미의 기념 앨범 정리대',opening:'현재 보호자가 동의한 물건과 접수표를 앨범 정리대에 놓습니다. 날짜·돌봄 역할·등록 연결 기록을 맞춰 같은 강아지의 기억임을 확인하면, 담당자가 보관한 원본 신고 기록과 편지를 읽게 됩니다. 상자는 이미 입양이 결정된 다음 받은 기념품입니다.'},
  'cat-invite':{prop:'가게의 선물 준비대',opening:'네 이웃이 부탁한 자리표를 선물 준비대에 완성합니다. 실제 메모와 방향표를 따라 네 선물을 놓고 돌봄 달력과 감사 카드의 준비물을 정리하면 마지막 봉투를 함께 열 수 있습니다. 혼자 풀어야 하는 출제표가 아니라 모임을 위한 준비입니다.'},
  studio:{prop:'필름 인계대와 전시 액자',opening:'인화를 마친 사진의 뒷면과 오래된 봉투를 펼쳐 전시 이름표를 준비합니다. 사진 속 인물과 촬영자, 서로 다른 촬영·인화 날짜, 함께 하자는 약속을 액자 뒤에 붙입니다. 윤서와 할아버지가 함께 인화한 사진을 벽에 걸 준비를 합니다.'},
  ohang:{prop:'다섯 빛의 그릇과 접수함',opening:'그릇과 방향 천에 남은 상징 관계를 따라 접수함의 장식 걸쇠를 돌려놓습니다. 시작 씨앗과 이번 표식은 나의 다섯 빛에서 확인합니다. 열리는 것은 오늘 작성한 먹지 접수 원본이며 편지에 맡길 마음은 스스로 고릅니다.'}
 };
 Object.entries(themes).forEach(([id,t])=>Object.assign(t,openings[id]));
 function plan(id,level,context={}){
  const l=clamp(level),theme=themes[id];if(!theme)return [];
  const p=copy(l<=2?theme.stages4:theme.stages6),profile=context.profile||context;
  const seed=Number.isInteger(profile.seed)&&profile.seed>=0&&profile.seed<5?profile.seed:0;
  const companion=Number.isInteger(profile.companion)&&profile.companion>=0&&profile.companion<5?profile.companion:0;
  const e=['wood','fire','earth','metal','water'];
  p.forEach((s,index)=>{
   s.theme=id;s.level=l;s.index=index;s.prop=theme.prop;
   s.narrative=theme.opening+'\n'+s.narrative;
   if(s.dynamic==='seed-cycle')s.target=Array.from({length:5},(_,i)=>e[(seed+i)%5]);
   if(s.dynamic==='companion-predecessor'){s.target=[e[(companion+3)%5]];s.marker={id:e[companion],label:s.items.find(v=>v.id===e[companion]).label};}
   if(l===1){
    s.guide=s.hints[1]+' 자료를 닫아도 배치는 남습니다.';
    // Gentle mode removes unrelated loose cards but does not fill any slot.
    if(['match','symbol','decision'].includes(s.kind))s.items=s.items.filter(v=>s.target.includes(v.id));
   }
   // Deterministic loose-card ordering prevents a source list from acting as its own solution.
   if(s.items.length>1){const shift=(l+index)%s.items.length;s.items=s.items.slice(shift).concat(s.items.slice(0,shift));}
   (s.fields||[]).forEach(f=>{if(f.id==='subtract')f.choices=[{value:0,label:'더하기'},{value:1,label:'빼기'}];});
   s.requiresSupport=l>=4;s.requiresExclude=l>=5;
  });return p;
 }
 function initial(spec,level){
  const l=clamp(level??spec.level),d={version:VERSION,support:[],exclude:null,proof:[]};
  if(['clock','dial','overlay'].includes(spec.kind)){d.fields={};(spec.fields||[]).forEach(f=>d.fields[f.id]=f.initial);}
  else if(spec.kind==='route')d.path=[spec.start];
  else if(spec.kind==='sort'){
   const list=spec.items.map(x=>x.id);const shift=1+(l%Math.max(1,list.length-1));d.placements=list.slice(shift).concat(list.slice(0,shift));
   if(d.placements.every((v,i)=>v===spec.target[i]))d.placements.reverse();
  }else d.placements=(spec.slots||[]).map(()=>null);
  return d;
 }
 function sameSet(a,b){return Array.isArray(a)&&a.length===b.length&&new Set(a).size===a.length&&a.every(v=>b.includes(v));}
 function equivalent(s,actual,expected){return actual===expected||(s.equivalent||[]).some(group=>group.includes(actual)&&group.includes(expected));}
 function adjacent(s,a,b){return (s.edges||[]).some(e=>(e[0]===a&&e[1]===b)||(e[1]===a&&e[0]===b));}
 function valid(spec,draft,level){
  if(!spec||!draft||draft.version!==VERSION||typeof draft!=='object')return false;
  const l=clamp(level??spec.level);
  if(l>=4&&spec.requiresSupport!==false&&!sameSet(draft.support,spec.support||[]))return false;
  if(l>=5&&spec.requiresExclude!==false&&(!spec.exclude||draft.exclude!==spec.exclude.target||!sameSet(draft.proof,spec.support||[])))return false;
  if(['clock','dial','overlay'].includes(spec.kind)){
   if(!draft.fields||typeof draft.fields!=='object'||Array.isArray(draft.fields))return false;
   return (spec.fields||[]).length>0&&(spec.fields||[]).every(f=>{
    const value=draft.fields[f.id];return Number.isFinite(value)&&Number.isInteger(value)&&value>=f.min&&value<=f.max&&value===spec.target[f.id];
   });
  }
  if(spec.kind==='route'){
   const p=draft.path;if(!Array.isArray(p)||p.length!==spec.target.length||new Set(p).size!==p.length||!p.every((v,i)=>v===spec.target[i]&&(!i||adjacent(spec,p[i-1],v))))return false;
   const totals=p.slice(1).reduce((a,v,i)=>{const e=spec.edges.find(e=>(e[0]===p[i]&&e[1]===v)||(e[1]===p[i]&&e[0]===v));return [a[0]+e[2],a[1]+e[3]];},[0,0]);
   return totals[0]===spec.constraints.duration&&totals[1]===spec.constraints.fare&&p.includes(spec.constraints.via)&&p.includes(spec.constraints.direction);
  }
  if(['sort','match','symbol','decision'].includes(spec.kind)){
   const p=draft.placements;if(!Array.isArray(p)||p.length!==spec.target.length||new Set(p).size!==p.length)return false;
   const legal=spec.items.map(x=>x.id);return p.every((v,i)=>legal.includes(v)&&equivalent(spec,v,spec.target[i]));
  }return false;
 }
 function normalize(raw,level,stageCount){
  const l=clamp(raw?.version===VERSION?raw.level:level),n=Number.isInteger(stageCount)?stageCount:(l<=2?4:6);
  const result={version:VERSION,level:l,done:[],draft:{}};
  if(!raw||raw.version!==VERSION)return result;
  const passed=new Set(Array.isArray(raw.done)?raw.done:[]);
  // A sequential device cannot skip an unfinished earlier stage.
  for(let i=0;i<n&&passed.has(i);i++)result.done.push(i);
  if(raw.draft&&typeof raw.draft==='object'&&!Array.isArray(raw.draft))for(const [key,value]of Object.entries(raw.draft)){
   const i=Number(key);if(Number.isInteger(i)&&i>=0&&i<n&&value?.version===VERSION)result.draft[i]=copy(value);
  }return result;
 }
 // Why the current draft does not pass: a specific, non-spoiling message per device kind.
 // Easy stories (level ≤ 2) name the wrong control; harder ones only report how many are right.
 function josa(word,a,b){const code=word.charCodeAt(word.length-1);return word+((code>=0xac00&&code<=0xd7a3&&(code-0xac00)%28)?a:b);}
 function listNames(names){return names.map(n=>'「'+n+'」').join('·');}
 function diagnose(spec,draft,level){
  if(!spec||!draft||typeof draft!=='object')return '';
  const l=clamp(level??spec.level),gentle=l<=2;
  if(l>=4&&spec.requiresSupport!==false&&!sameSet(draft.support,spec.support||[]))return '접수구가 비어 있거나 다른 자료가 끼워져 있습니다. 확인한 사본을 대조해주세요.';
  if(l>=5&&spec.requiresExclude!==false&&(!spec.exclude||draft.exclude!==spec.exclude.target||!sameSet(draft.proof,spec.support||[])))return '조사 수첩의 미확인 메모에 반증 자료 두 장을 아직 붙이지 않았습니다.';
  if(['clock','dial','overlay'].includes(spec.kind)){
   const fields=spec.fields||[],f=draft.fields||{},wrong=fields.filter(x=>f[x.id]!==spec.target[x.id]);
   if(!wrong.length)return '';
   if(wrong.length===fields.length)return '맞은 눈금이 아직 없습니다. 자료의 숫자를 다시 확인해 보세요.';
   return gentle?listNames(wrong.map(x=>x.label))+' 눈금이 아직 맞지 않습니다. 나머지 '+(fields.length-wrong.length)+'개는 맞습니다.':fields.length+'개 눈금 중 '+(fields.length-wrong.length)+'개가 맞습니다. 틀린 눈금을 자료와 다시 대조하세요.';
  }
  if(spec.kind==='route'){
   const p=Array.isArray(draft.path)?draft.path:[],c=spec.constraints||{};
   const totals=p.slice(1).reduce((a,v,i)=>{const e=(spec.edges||[]).find(e=>(e[0]===p[i]&&e[1]===v)||(e[1]===p[i]&&e[0]===v));return e?[a[0]+e[2],a[1]+e[3]]:a;},[0,0]);
   if(p.length<2)return '아직 출발하지 않았습니다. 선로를 골라 한 구간씩 운행하세요.';
   if(totals[0]>c.duration||totals[1]>c.fare)return '지나온 구간이 기록의 '+c.duration+'분·'+c.fare+'원을 넘었습니다. 이전 구간으로 돌아가세요.';
   if(totals[0]<c.duration||totals[1]<c.fare)return '지금까지 '+totals[0]+'분·'+totals[1]+'원입니다. 기록의 합계가 될 때까지 더 운행하세요.';
   if(c.direction&&!p.includes(c.direction))return '시간과 요금은 맞지만 방향이 다릅니다. 옛 표지가 가리킨 방향을 다시 확인하세요.';
   if(c.via&&!p.includes(c.via))return '기록에 적힌 환승역을 지나지 않았습니다.';
   return '마지막에 내린 역이 기록과 다릅니다.';
  }
  if(['sort','match','symbol','decision'].includes(spec.kind)){
   const p=Array.isArray(draft.placements)?draft.placements:[],slots=spec.slots||[],target=spec.target||[];
   const empty=target.map((_,i)=>i).filter(i=>!p[i]);
   if(empty.length)return spec.kind==='sort'?'아직 자리가 비어 있습니다.':'아직 비어 있는 자리가 있습니다: '+listNames(empty.map(i=>slots[i]?.label||'자리 '+(i+1)));
   const wrong=target.map((_,i)=>i).filter(i=>!equivalent(spec,p[i],target[i]));
   if(!wrong.length)return '';
   if(wrong.length===target.length)return spec.kind==='sort'?'제자리에 놓인 것이 아직 없습니다. 자료의 순서를 다시 읽어보세요.':'맞게 놓인 자리가 아직 없습니다. 자료를 다시 대조해 보세요.';
   const right=target.length-wrong.length;
   if(spec.kind==='sort')return gentle?right+'개는 제자리이고 '+listNames(wrong.map(i=>slots[i]?.label||'자리 '+(i+1)))+' 자리가 어긋났습니다.':target.length+'개 중 '+right+'개가 제자리입니다. 순서를 다시 살펴보세요.';
   return gentle?listNames(wrong.map(i=>slots[i]?.label||'자리 '+(i+1)))+'에 놓인 것이 맞지 않습니다. 나머지 '+right+'자리는 맞습니다.':target.length+'자리 중 '+right+'자리가 맞습니다. 어느 자리가 어긋났는지 자료와 대조하세요.';
  }
  return '';
 }
 const api={version:VERSION,themes,titles,clamp,plan,valid,normalize,initial,adjacent,diagnose,josa};
 host.MihaejeStoryDevices=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
