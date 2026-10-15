/* A place owns its records and one operation. Moving opens a new scene, never a new answer. */
(()=>{
 const places={
 garage:[['차량 작업 구역','차량의 시계와 접속 흔적','차량의 기록에는 시계가 따로 있습니다. 점검 전표와 같은 기준으로 읽을 준비를 합니다.'],['직원 출입 단말','카드 보관대','입장 시각을 좁혔습니다. 출입 단말 옆 카드 명부에서 기록의 명의를 확인합니다.'],['야간 접수대','진술을 남긴 접수철','세 사람이 같은 밤을 다르게 설명합니다. 각자의 진술과 독립된 기록을 나란히 둡니다.'],['폐업 문서 보존대','보존 접수구','인계할 종이와 사건 당시의 기록은 쓰임이 다릅니다. 무엇을 확인할 수 있는지 구분해 접수철에 남깁니다.']],
 apartment:[['건물 뒤편 관찰 지점','필름과 건물 도면','제보자가 서 있던 쪽에서 건물을 봅니다. 사진의 줄과 도면의 층을 같은 기준으로 맞춥니다.'],['해당 세대의 복도','창문 배치 받침','관찰한 세대까지 왔습니다. 바깥에서 본 창과 실내의 방을 연결해 봅니다.'],['세대 앞 점검함','관리인의 점검 공책','공책 잠금은 창문에 남은 약속을 사용합니다. 필름을 넘겨 그 약속이 반복되는지 살펴봅니다.'],['비상 조명 설비','배터리 점검판','불빛이 움직였던 이유를 확인할 차례입니다. 건물 전원과 별도 점검 설비를 구분합니다.']],
 radio:[['편집 부스','사본 재생 데크','원본은 보관함에 둡니다. 편집 연결 표식을 따라 사본 조각의 이어지는 소리를 복원합니다.'],['음성 보관실','테이프 라벨 조회기','이어진 말이 언제 녹음되었는지 확인합니다. 목소리의 내용과 보관 라벨을 함께 읽습니다.'],['중계 패치실','전원 연결 패널','녹음 시점과 다시 들린 시점 사이를 찾아갑니다. 별도 설비의 전원 경로를 추적합니다.'],['송출 예약 콘솔','입력 채널 점검구','목소리만으로 생방송이라 판단할 수 없습니다. 입력과 파일 흔적을 확인해 다시 나온 경위를 기록합니다.']],
 station:[['중앙역 옛 표지 앞','승강장 개편 안내판','사진 속 표지와 현재 안내가 다릅니다. 친구가 서 있던 위치부터 확인합니다.'],['환승 노선 안내대','실로 잇는 노선도','이용 내역에 맞는 구간을 이어봅니다. 안내대에 있는 시간과 운임이 경로를 좁혀줍니다.'],['수림역 보관함 구역','예약 사물함','확인한 도착지에서 친구가 남긴 예약을 찾습니다. 예약은 그때의 계획을 보여줄 뿐입니다.'],['수림역 연락 안내소','역무실 연락 메모','예약만으로 안부를 확신할 수 없습니다. 남은 자료를 구분하고, 마지막 확인 통화로 이어갑니다.']],
 laundry:[['세탁·보관 기계열','접수번호 조회판','같은 모양의 코트가 여럿입니다. 접수표와 처리 이력으로 서경의 물건을 좁힙니다.'],['기기 점검 구역','날짜·시각 점검 단말','단말과 벽시계가 같은 밤을 다르게 표시합니다. 접힌 영수증의 날짜까지 대조합니다.'],['야간 출입구','출입 명부 받침','수령 표시가 남은 순간에 누가 안에 있었는지 확인합니다. 고객이 들어온 기록도 함께 놓습니다.'],['직원 보관 행거','수령 문의 접수대','표시가 곧 실제 인계는 아닙니다. 문의 내용과 단말 처리 방식을 대조해 코트를 돌려줄 준비를 합니다.']],
 letter:[['기록관 주소 게시대','주소 표찰','반송 도장을 그대로 둡니다. 바뀐 주소의 공고를 읽고 현재 수신처를 확인합니다.'],['우편 분류실','우체국 날짜 도장 분류 받침','담당자가 받은 네 사본의 겉면을 펼칩니다. 내용의 사건 순서와 발송 순서는 다를 수 있습니다.'],['보존서고 통로','서가 표찰','분류한 봉투는 보존 목록으로 이어집니다. 목록과 분류 메모를 대조해 보관 자리를 찾습니다.']],
 'pet-home':[['루미의 새 돌봄 자리','기념품 펼친 담요','건강과 돌봄 정보는 이미 넘겨받았습니다. 상자 속 물건이 지나온 돌봄의 시간을 살펴봅니다.'],['인계 서류를 펼친 탁자','동물 등록 기록철','별명이 바뀌어도 이어지는 기록이 있습니다. 접수와 등록, 입양의 연결을 차례로 확인합니다.'],['유나의 사진첩 자리','오래된 사진과 파란 끈','유나가 기억하는 정류장을 다시 봅니다. 물건과 사진에 함께 남은 흔적을 찾아봅니다.']],
 'cat-invite':[['이웃의 초대 식탁','선물을 놓는 자리판','포장된 선물마다 보내는 이의 흔적이 있습니다. 이웃들의 쪽지를 읽어 자리부터 준비합니다.'],['리본 포장대','네 선물의 리본 걸쇠','선물의 자리를 확인했습니다. 이름표의 표식으로 리본을 고정하고 마지막 봉투를 지킬 준비를 합니다.'],['가게의 돌봄 달력 앞','접어둔 감사 카드','자리 하나가 비어 있습니다. 달력과 카드가 함께 기억하는 날을 확인하고 초대를 마칩니다.']],
 studio:[['전시 벽','완성된 사진의 이름표','인화한 사진을 전시할 때가 되었습니다. 사진 뒷면과 벽의 작품에서 촬영한 사람과 찍힌 사람을 구분합니다.'],['전시 문구 작업대','약속을 적는 카드','누구의 사진인지 확인했습니다. 오늘 함께 지킨 약속을 카드에 남깁니다.']],
 ohang:[['빛의 그릇 자리','상생의 고리','접수표의 빛에서 시작합니다. 천에 적힌 관계를 따라 그릇을 돌려놓습니다.'],['마루의 오방 자리','방향표를 펼친 자리판','고리는 관계를, 자리판은 방향을 나타냅니다. 천 안쪽의 방향표를 펼쳐 각 그릇의 자리를 찾습니다.'],['마당의 등불 앞','등불 걸쇠','자리판을 정리하니 등불의 표식이 보입니다. 다른 빛과의 관계를 확인하고 접어둔 편지를 꺼냅니다.']]
 };
 const photos={};
 for(const [id,rows] of Object.entries(places))photos[id]=rows.map((_,i)=>({src:'assets/photoreal/'+id+'-'+(i===0?'entry-v2':i===1?'inner-v2':i===2?'inner-v37':'entry-v37')+'.webp',position:['35% 60%','65% 50%','45% 35%','75% 65%'][i],zoom:[1,1.12,1.18,1.1][i]}));
 photos.studio=[{src:'assets/photoreal/studio-room-v1.webp',position:'49% 29%',zoom:1.35},{src:'assets/photoreal/studio-portrait-v1.webp',position:'50% 50%',zoom:1}];
 photos.ohang=[{src:'assets/photoreal/ohang-entry-v2.webp',position:'50% 70%',zoom:1.1},{src:'assets/photoreal/ohang-entry-v2.webp',position:'85% 65%',zoom:1.3},{src:'assets/photoreal/ohang-inner-v2.webp',position:'53% 55%',zoom:1.15}];
 const order={garage:['entry-v37','entry-v2','inner-v2','inner-v37'],apartment:['entry-v2','entry-v37','inner-v2','inner-v37'],radio:['entry-v2','inner-v2','inner-v37','entry-v37'],station:['entry-v37','entry-v2','inner-v37','inner-v2'],laundry:['entry-v2','entry-v37','inner-v2','inner-v37'],letter:['entry-v2','inner-v2','inner-v37'],'pet-home':['entry-v2','inner-v2','inner-v37'],'cat-invite':['inner-v37','entry-v2','entry-v37']};for(const [id,files] of Object.entries(order))photos[id]=files.map(t=>({src:'assets/photoreal/'+id+'-'+t+'.webp',position:'50% 50%',zoom:1}));
 photos.apartment[0].src='assets/photoreal/apartment-observation-v40.webp';
 const P=window.MihaejePlay,old=P.plan;
 function plan(id,level,state){return old(id,level,state).map((s,i)=>({...s,place:places[id]?.[i]?.[0],prop:places[id]?.[i]?.[1],narrative:places[id]?.[i]?.[2]||s.narrative}));}
 P.plan=plan;window.MihaejeStoryDevices.plan=plan;
 function current(id,state){const list=plan(id,P.levels[id],state);const done=state.adventure?.done||[];return list.findIndex((_,i)=>!done.includes(i));}
 function unlocked(id,state){const c=current(id,state);return c<0?places[id].length:c+1;}
 window.MihaejePlaces={data:places,photos,current,unlocked,plan};
})();
