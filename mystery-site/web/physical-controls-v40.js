/* Physical actions share validators and saved drafts, rather than a second answer engine. */
(()=>{
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const b=(text,fn,cls='physical-action')=>{const n=el('button',cls,text);n.type='button';n.onclick=fn;return n;};
 const phone={reservation:'오기 전에 보관함을 예약해 뒀어. 일정 안내를 써놓고 보내기 버튼을 안 눌렀더라. 휴대폰을 충전해 둔 채 자료를 정리하느라 전화도 못 봤어.',safety:'신청했던 기록 봉사에 왔어. 나 괜찮아. 안내소 담당자도 옆에 있어.'};
 function ink(panel,skin){const dark=['window','album','seat','caption'].includes(skin);panel.querySelectorAll('h3,p,small,legend').forEach(n=>n.style.setProperty('color',skin==='seat'&&n.classList.contains('prop-caption-label')?'#fff8e6':dark||skin==='postal'&&n.closest('.prop-control-row')?'#30271b':'#fff8e6','important'));panel.querySelectorAll('output').forEach(n=>n.style.setProperty('color','#182419','important'));}
 function render({id,s,d,board,save,draw,status}){
  if(s.id==='postal-order'||s.id==='registry-chain'){
   const postal=s.id==='postal-order',panel=el('section','prop-station '+(postal?'prop-postal':'prop-album'));panel.dataset.propSort=s.id;panel.append(el('p','prop-caption-label',postal?'분류대 · 봉투를 앞뒤로 옮깁니다':'등록 기록철 · 연결 기록의 순서를 옮깁니다'));
   if(!d.placements?.length)d.placements=s.items.map(x=>x.id);d.placements.forEach((key,i)=>{const item=s.items.find(x=>x.id===key),row=el('div','prop-control-row');row.append(el('small','',s.slots[i].label),el('h3','',item.label));const move=delta=>{const j=i+delta;if(j<0||j>=d.placements.length)return;[d.placements[i],d.placements[j]]=[d.placements[j],d.placements[i]];save();draw();status.textContent='';};const up=b('↑ 앞으로',()=>move(-1),'prop-choice'),down=b('↓ 뒤로',()=>move(1),'prop-choice');up.disabled=i===0;down.disabled=i===d.placements.length-1;up.setAttribute('aria-label',item.label+' 앞으로 옮기기');down.setAttribute('aria-label',item.label+' 뒤로 옮기기');row.append(up,down);panel.append(row)});ink(panel,postal?'postal':'album');board.append(panel);return true;
  }
  const props={'personnel-card':['reader','출입 카드 명부 · 카드 리더'],'alibi-intervals':['reader','접수철 · 두 시간대 대조'],'evidence-scope':['reader','인계철 · 접근 기록과 동기 기록'],'room-layout':['window','뒤편 창에서 바라본 실내'],'coat-machine':['hanger','접수표를 기계별 행거에 걸기'],'present-person':['hanger','야간 출입 명부 · 안에 있던 시간'],'address-placard':['postal','반송 봉투에 새 수신처 안내 끼우기'],'postal-order':['postal','우체국 날짜 도장별 봉투 분류함'],'shelf-locator':['postal','보존서고 · 열·단·칸 표찰'],'care-objects':['album','담요 위에 펼친 돌봄 기념품'],'registry-chain':['album','진료·입양 기록 · 같은 등록번호'],'finder-correspondence':['album','유나의 옛 사진첩'],'gift-seating':['seat','식탁에 놓을 이웃의 선물'],'portrait-label':['caption','액자 뒤에 남길 이름표'],'promise-caption':['caption','전시 카드에 옮겨 적는 약속']};
  if(props[s.id]){
   const [skin,caption]=props[s.id],panel=el('section','prop-station prop-'+skin);panel.dataset.propControl=s.id;panel.append(el('p','prop-caption-label',caption));d.placements??=Array(s.slots.length).fill(null);
   s.slots.forEach((slot,i)=>{const row=el('div','prop-control-row');row.append(el('h3','',slot.label));if(s.id==='personnel-card')row.append(el('output','',d.placements[i]?s.items.find(x=>x.id===d.placements[i])?.label:'카드 명의 확인 전'));const bank=el('div','prop-choice-bank');
    for(const item of s.items){const n=b(item.label,()=>{d.placements[i]=d.placements[i]===item.id?null:item.id;save();draw();status.textContent='';},'prop-choice');n.setAttribute('aria-label',slot.label+'에 '+item.label+' 선택');n.setAttribute('aria-pressed',String(d.placements[i]===item.id));bank.append(n);}row.append(bank);panel.append(row);});ink(panel,skin);board.append(panel);return true;
  }
  if(s.id==='five-directions'){
   const pool=el('div','physical-bowl-pool'),table=el('div','physical-bowl-table');d.placements??=Array(5).fill(null);const face=item=>{const n=el('span','physical-bowl bowl-'+item.id);n.append(el('span','',item.label));return n;};
   for(const item of s.items){if(d.placements.includes(item.id))continue;const n=b('',()=>{d.held40=d.held40===item.id?null:item.id;draw();},'physical-bowl-pick'+(d.held40===item.id?' held':''));n.setAttribute('aria-label',item.label+' 집기');n.append(face(item));pool.append(n);}
   s.slots.forEach((slot,i)=>{const item=s.items.find(x=>x.id===d.placements[i]),n=b('',()=>{if(!d.held40){if(item){d.placements[i]=null;d.held40=item.id;save();draw();}return;}const old=d.placements.indexOf(d.held40);if(old>=0)d.placements[old]=null;d.placements[i]=d.held40;d.held40=null;save();draw();},'physical-bowl-place bowl-place-'+i);n.setAttribute('aria-label',slot.label+' 자리'+(item?' · '+item.label:''));n.append(el('strong','',slot.label));if(item)n.append(face(item));else n.append(el('span','bowl-ring'));table.append(n);});board.append(pool,table);return true;
  }
  if(s.id==='watching-light'){
   d.placements??=[null];const lantern=el('section','physical-lantern'),keys=el('div','lantern-keys');lantern.append(el('div','lantern-light'),el('p','lantern-setting',s.items.find(x=>x.id===d.placements[0])?.label||'아직 걸쇠가 풀리지 않았습니다'));for(const item of s.items){const n=b(item.label,()=>{d.placements[0]=item.id;save();draw();},'lantern-key lantern-'+item.id);n.setAttribute('aria-label',item.label+' 표식 선택');n.setAttribute('aria-pressed',String(d.placements[0]===item.id));keys.append(n);}lantern.append(keys);board.append(lantern);return true;
  }
  if(s.id==='ribbon-seal'){
   const wrap=el('section','ribbon-locks');d.fields??={};s.fields.forEach((f,i)=>{const strip=el('div','ribbon-lock ribbon-'+i);strip.append(el('p','ribbon-lock-label',f.label));const tag=el('div','ribbon-number-tag'),out=el('output','ribbon-number',String(d.fields[f.id]??0));out.setAttribute('aria-label',f.label+' 현재 '+out.textContent);out.setAttribute('role','spinbutton');out.tabIndex=0;const set=n=>{d.fields[f.id]=(n+10)%10;out.textContent=String(d.fields[f.id]);out.setAttribute('aria-label',f.label+' 현재 '+out.textContent);save();};out.onkeydown=e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();set((d.fields[f.id]??0)+(e.key==='ArrowUp'?1:-1));}};const down=b('−',()=>set((d.fields[f.id]??0)-1)),up=b('+',()=>set((d.fields[f.id]??0)+1));down.setAttribute('aria-label',f.label+' 줄이기');up.setAttribute('aria-label',f.label+' 늘리기');tag.append(down,out,up);strip.append(tag);wrap.append(strip);});board.append(wrap);return true;
  }
  if(s.id==='confirmation-scope'){
   const set=el('section','physical-phone');set.append(el('p','phone-caption','수림 마을 기록 봉사 안내소 · 담당자 연결'),el('div','phone-speaker'));
   if(!d.connected40)set.append(b('안내소에 연결 요청',()=>{d.connected40=true;save();draw()},'phone-call'));
   else{set.append(el('p','phone-caption','담당자의 대면 확인 후 · 민서와 영상 통화 연결'));
    for(const [key,text] of [['reservation','왜 연락이 없었는지 묻기'],['safety','지금 괜찮은지 묻기']])set.append(b(text,()=>{d.placements??=[null,null];d.placements[key==='reservation'?0:1]=key;d.callNotes40={...(d.callNotes40||{}),[key]:phone[key]};save();draw()},'phone-question'));
    for(const text of Object.values(d.callNotes40||{}))set.append(el('blockquote','phone-answer',text));
   }board.append(set);return true;
  }
  if(s.id==='night-conditions'||s.id==='input-proofs'||s.id==='receipt-proof'){
   const panel=el('section','physical-console console-'+id);d.placements??=Array(s.slots.length).fill(null);
   panel.append(el('p','console-caption',s.id==='night-conditions'?'설비 점검판':s.id==='input-proofs'?'송출 입력·출력 대조 콘솔':'수령 원장 검색 기준'));
   s.slots.forEach((slot,i)=>{const section=el('fieldset','console-channel');section.append(el('legend','',slot.label));const value=el('output','console-value',s.items.find(x=>x.id===d.placements[i])?.label||'확인 항목 선택');section.append(value);
    const options=el('select','console-selector');options.setAttribute('aria-label',slot.label+' 점검 항목');const empty=el('option','','아직 확인하지 않음');empty.value='';options.append(empty);for(const item of s.items){const op=el('option','',item.label);op.value=item.id;options.append(op);}options.value=d.placements[i]||'';options.onchange=()=>{d.placements[i]=options.value||null;save();value.textContent=s.items.find(x=>x.id===options.value)?.label||'확인 항목 선택';status.textContent='';};section.append(options);panel.append(section);});board.append(panel);return true;
  }
  if(s.id==='powered-path'){
   const panel=el('section','physical-patch'),caption=el('p','patch-caption','전원 배선 · 양쪽의 연결점을 차례로 누르세요');panel.append(caption);
   d.placements??=[null,null];s.slots.forEach((slot,i)=>{const bank=el('div','patch-bank');bank.append(el('h3','',slot.label));for(const item of s.items){const n=b(item.label,()=>{d.placements[i]=item.id;save();draw()},'patch-port'+(d.placements[i]===item.id?' connected':''));n.setAttribute('aria-label',slot.label+'에 '+item.label+' 연결');n.setAttribute('aria-pressed',String(d.placements[i]===item.id));bank.append(n);}panel.append(bank);});if(d.placements.every(Boolean))panel.append(el('div','patch-cable'));board.append(panel);return true;
  }
  return false;
 }
 // Wrong-state messages for the hand-built controls whose draft slots have no visible labels.
 function explain(s,d){
  if(s.id==='personnel-card'){const code=/^\d{1,2}$/.test(d.card58||'')?String(d.card58).padStart(2,'0'):'';if(!code)return '조회할 카드 번호를 아직 입력하지 않았습니다. 출입 기록에 남은 두 자리 번호를 넣으세요.';if(!d.placements?.[0])return code+'번 카드는 직원 명부에 없습니다. 출입 기록의 번호를 다시 확인하세요.';return '이 번호는 영상 속 시각에 찍힌 카드가 아닙니다. 보정한 입장 시각의 출입 기록을 보세요.';}
  if(s.id==='confirmation-scope'){if(!d.connected40)return '아직 안내소에 연결하지 않았습니다. 「안내소에 연결 요청」을 누르세요.';const p=d.placements||[];if(!p[0]||!p[1])return '민서에게 아직 묻지 않은 질문이 있습니다. 두 질문을 모두 물어보세요.';return '';}
  if(s.id==='watching-light'){if(!d.placements?.[0])return '걸쇠에 빛을 아직 놓지 않았습니다.';return '그 빛은 등불의 표식으로 향하는 상극 화살표의 앞이 아닙니다. 방향표 안쪽 화살표를 다시 보세요.';}
  return '';
 }
 window.MihaejePhysicalControls={render,explain};
})();

