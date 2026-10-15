// Original themed puzzle packs; no third-party puzzle text or artwork is reproduced.
(function(root){
 const packs={
  garage:{title:'보관함의 두 번째 걸쇠',why:'암호로 전원을 켰지만, 실제 백업은 정비사가 남긴 기계식 걸쇠 안에 있습니다',things:['점검표','렌치','절연 장갑','차량 열쇠'],places:['접수대','작업대','검사대','인계함'],steps:['차량 접수','부품 점검','시운전','고객 인계'],relic:'인계용 황동판',word:'반환',photo:'garage'},
  apartment:{title:'점검함의 안전 회로',why:'세대와 암호를 찾았습니다 기록을 꺼내려면 끊어진 안전 회로도 이어야 합니다',things:['세대 카드','비상등','점검 도면','차단기 표'],places:['현관','계단','복도','점검실'],steps:['세대 확인','주전원 차단','비상등 점검','점검표 봉인'],relic:'투명 창문 배치판',word:'점검',photo:'apartment'},
  radio:{title:'보조 녹음기의 패치판',why:'송출 순서는 복원했습니다 별도 녹음기의 봉인 패치판을 맞추면 원본 로그가 나옵니다',things:['진행 대본','헤드폰','보조 테이프','송출 키'],places:['준비실','녹음실','편집실','송출실'],steps:['대본 확인','시험 녹음','편집 완료','최종 송출'],relic:'투명 패치 필름',word:'원본',photo:'radio'},
  station:{title:'역무실의 기록 회수 장치',why:'도착지를 찾았습니다 역무실 보관함에는 분실물을 확인하는 수동 장치도 있습니다',things:['승차권','노선도','분실물 표','보관 열쇠'],places:['매표소','대합실','승강장','역무실'],steps:['승차 확인','이동 기록','하차 확인','보관 접수'],relic:'역무실 안내판',word:'도착',photo:'station'},
  letter:{title:'보존서고의 이중 봉인',why:'주소와 서가를 찾았습니다 훼손 방지 봉인을 풀어야 옮겨 보관 대장을 꺼낼 수 있습니다',things:['반송 봉투','우체국 날짜 도장 표','분류 카드','인수 서명'],places:['접수함','분류대','보존대','옮겨 보관함'],steps:['봉투 접수','우체국 날짜 도장 대조','기록 분류','옮겨 보관 서명'],relic:'투명 서가 색인',word:'보존',photo:'letter'},
  'pet-home':{title:'루미의 기억을 담은 상자',why:'물건의 주인을 찾았습니다 상자를 닫아두었던 사람의 작은 부탁도 풀어보세요',things:['접힌 담요','파란 끈','산책 수첩','이름표'],places:['쉼터','진료실','산책길','새집'],steps:['구조 확인','진료 인계','함께 산책','새 가족 인계'],relic:'창가에서 본 발자국 판',word:'안심',photo:'pet-home'},
  studio:{title:'전시 액자의 마지막 봉인',why:'사진의 앞뒤를 확인했습니다 액자 뒷판에 남은 주인의 조립 메모를 따라 마지막 걸쇠를 열어보세요',things:['필름 슬리브','확대기 표','인화 집게','전시 카드'],places:['접수대','정리대','암실','전시벽'],steps:['필름 접수','컷 선택','사진 인화','작품 전시'],relic:'뒤집힌 액자 배치판',word:'함께',photo:'studio'},
  laundry:{title:'수령 원장의 봉인판',why:'기계와 실제 시각을 찾았습니다 코트 보관함의 수동 봉인판을 맞추면 원장을 읽을 수 있습니다',things:['접수표','세탁망','보관 태그','수령표'],places:['접수대','세탁대','보관대','수령대'],steps:['코트 접수','세탁 확인','보관 이동','수령 기록'],relic:'보관함 배치 도면',word:'회수',photo:'laundry'},
  'cat-invite':{title:'선물 상자의 리본 매듭',why:'자리와 숫자를 맞췄습니다 선물을 준비한 사람들이 남긴 리본 매듭도 풀어보세요',things:['밥그릇','돌봄 수첩','파란 리본','초대 카드'],places:['골목','쉼터','가게','모임 자리'],steps:['밥 나눔','임시 보호','가족 맞이','모임 준비'],relic:'유리 너머의 자리표',word:'고마움',photo:'cat-invite'},
  ohang:{title:'오행당의 다섯 봉인',why:'상생의 문을 열었습니다 안쪽 편지는 다섯 물건을 제자리에 돌려놓은 사람에게 열립니다',things:['청색 실','붉은 등','흰 종','검은 물잔'],places:['동쪽 탁자','남쪽 등대','서쪽 선반','북쪽 창가'],steps:['실을 풀기','등을 밝히기','그릇을 놓기','물을 나누기'],relic:'한지에 남은 오방 무늬',word:'돌아옴',photo:'ohang'}
 };
 const defaults={garage:2,apartment:3,radio:3,station:3,letter:4,'pet-home':2,studio:3,laundry:3,'cat-invite':2,ohang:2};
 const shapes=['원','삼각','네모','마름모'];
 const order=[2,0,3,1],pattern=[0,1,5],glyphs=['새','쉼','길','봄','곁','문','빛','온','집'];
 const plans={garage:[1,2,3,4,5],apartment:[4,1,3,2,5],radio:[2,1,4,3,5],station:[2,4,1,3,5],letter:[3,2,1,4,5],'pet-home':[1,3,2,4,5],studio:[4,2,3,1,5],laundry:[1,2,4,3,5],'cat-invite':[3,1,2,4,5],ohang:[1,2,3,4,5]};
 const glyphSets=['앞뒤문키바퀴등힘길','층집창문동선빛벽길','음성방송큐결잇선끝','출발환승도착북남길','우표우체국 날짜 도장봉투반송함','발집밥쉼손길봄곁빛','필름빛상현정착온벽','세탁망옷보관문열쇠','고양이밥봄리본집곁','새쉼길봄곁문빛온집'];
 Object.keys(packs).forEach((id,i)=>{const p=packs[id];p.glyphs=Array.from(glyphSets[i]);p.turn=i%3+1;p.mirror=i%2===0;p.notches=i%3+1;p.tagIndex=(i+1)%4;p.layout=order.map(n=>(n+i)%4);p.plan=plans[id]});
 function level(v,fallback=2){return Number.isInteger(v)&&v>=1&&v<=5?v:fallback}
 function normalize(raw,id){return {version:raw?.version===1?1:raw?.version===2?2:raw?1:2,level:level(raw?.level,defaults[id]||2),passed:Array.isArray(raw?.passed)?[...new Set(raw.passed.filter(v=>Number.isInteger(v)&&v>=1&&v<=5))].sort((a,b)=>a-b):[],draft:raw?.draft&&typeof raw.draft==='object'?raw.draft:{},hints:raw?.hints&&typeof raw.hints==='object'?raw.hints:{}}}
 function transform(points,turn,mirror){return points.map(i=>{let r=Math.floor(i/3),c=i%3;for(let n=0;n<turn;n++)[r,c]=[c,2-r];if(mirror)c=2-c;return r*3+c}).sort((a,b)=>a-b)}
 function observeCandidates(id,p=packs[id]){const a=[{shape:'원',notches:p.notches,back:'실선'},{shape:'원',notches:p.notches===3?2:p.notches+1,back:'실선'},{shape:'원',notches:p.notches,back:'점선'},{shape:'삼각',notches:p.notches,back:'실선'}];return a.map((_,i)=>a[(i-p.tagIndex+4)%4])}
 function placementValid(a,id,pack=packs[id]){if(!Array.isArray(a)||a.length!==4||new Set(a).size!==4||!a.every(v=>[0,1,2,3].includes(v)))return false;const [left,inner,near,right]=pack.layout,p=v=>a.indexOf(v);return p(inner)!==0&&p(inner)!==3&&p(right)>p(near)&&p(left)<p(inner)&&Math.abs(p(near)-p(inner))===1&&Math.abs(p(right)-p(inner))!==1}
 function metaWord(id,pack=packs[id]){return Array.from(pack.word+'함').slice(0,3)}
 function metaCode(id,pack=packs[id]){const a=metaWord(id,pack),offset=pack.notches-1;return a.slice(offset).concat(a.slice(0,offset)).join('')}
 function correct(stage,draft,id,p=packs[id]){;if(stage===1)return draft.choice===p.tagIndex;if(stage===2)return Array.isArray(draft.order)&&draft.order.join(',')===(p.order||[0,1,2,3]).join(',');if(stage===3)return placementValid(draft.slots,id,p);if(stage===4)return (draft.turn??0)===p.turn&&!!draft.mirror===p.mirror;if(stage===5)return draft.metapick===p.layout[0]&&String(draft.metaCode||'').replace(/\s/g,'')===metaCode(id,p);return false}
 root.MihaejeChallengeRules={packs,defaults,shapes,order,pattern,glyphs,level,normalize,transform,observeCandidates,placementValid,correct,metaWord,metaCode};
})(typeof window==='undefined'?globalThis:window);
