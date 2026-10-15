/* Theme-specific gestures update the same drafts used for saving and validation. */
(()=>{
 const previous=window.MihaejePhysicalControls.render;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const button=(text,fn,cls='experience-control')=>{const b=el('button',cls,text);b.type='button';b.onclick=fn;return b;};
 function render(ctx){const {id,s,d,board,save,draw,status}=ctx;
  const finish=()=>{panel.querySelectorAll('p,small,strong,h3,span,label,output,button,select,input').forEach(n=>{const paper=n.closest('.postal-envelope,.comparison-notebook,.staff-card,.record-leaf,.calendar-page');const button=n.closest('button');if(button?.classList.contains('window-pane'))button.style.setProperty('background','#17261f','important');const light=button?button.classList.contains('window-pane'):!paper&&!n.matches('select,input');if(!paper&&!button&&!n.matches('select,input'))n.style.removeProperty('color');else n.style.setProperty('color',light?'#fff5dc':'#30271e','important');});board.append(panel);return true;};
  const change=()=>{save();draw();status.textContent='';};
  const panel=el('section','experience-apparatus apparatus-'+s.id);panel.dataset.experienceControl=s.id;
  const select=(label,values,value,onChange)=>{const wrap=el('label','experience-field',label),n=el('select');n.setAttribute('aria-label',label);const blank=el('option','','선택');blank.value='';n.append(blank);for(const [v,t]of values){const o=el('option','',t);o.value=v;n.append(o);}n.value=value??'';n.onchange=()=>onChange(n.value);wrap.append(n);return wrap;};
  if(s.id==='personnel-card'){
   const numbers={han:'07',kang:'04',yoon:'09'};d.card58??=numbers[d.placements?.[0]]||'';
   const card=el('article','staff-card'),number=el('output','staff-number','CARD '+(d.card58||'— —'));card.append(el('small','','미루정비소 · 직원 번호'),number,el('p','','출입 기록에 남은 번호로 명의를 조회합니다.'));
   const label=el('label','experience-field','조회할 직원 카드 번호'),input=el('input');input.type='text';input.inputMode='numeric';input.maxLength=2;input.autocomplete='off';input.value=d.card58;input.setAttribute('aria-label','조회할 직원 카드 번호');input.oninput=()=>{d.card58=input.value;const code=/^\d{1,2}$/.test(input.value)?input.value.padStart(2,'0'):'';d.placements=[Object.keys(numbers).find(k=>numbers[k]===code)||null];number.textContent='CARD '+(code||'— —');status.textContent='';save();};label.append(input);panel.append(card,label,el('p','apparatus-note','직원 명부와 출입 기록은 위쪽 단서에서 펼칠 수 있습니다.'));return finish();
  }
  if(s.id==='coat-machine'){
   d.placements??=Array(3).fill(null);d.machine58??=0;
   panel.append(el('p','apparatus-note','세 기계를 차례로 넘기며 접수 태그를 알맞은 걸이에 겁니다. 세 태그를 모두 걸어야 확인할 수 있습니다.'));
   const controls=el('div','experience-row');controls.append(button('← 이전 기계',()=>{d.machine58=(d.machine58+2)%3;change();}),el('output','',String(d.machine58+1)+' / 3'),button('다음 기계 →',()=>{d.machine58=(d.machine58+1)%3;change();}));
   const machine=el('div','coat-machine'),held=s.items.find(x=>x.id===d.held58),placed=s.items.find(x=>x.id===d.placements[d.machine58]);machine.append(el('strong','',s.slots[d.machine58].label),el('span','machine-drum','◯'));
   const hanger=button(placed?.label||'태그를 거는 빈 걸이',()=>{if(!held){status.textContent='접수 태그를 먼저 집어주세요';return;}const old=d.placements.indexOf(held.id);if(old>=0)d.placements[old]=null;d.placements[d.machine58]=held.id;delete d.held58;change();},'machine-tag');hanger.setAttribute('aria-label',s.slots[d.machine58].label+' 걸이에 태그 놓기');machine.append(hanger);
   const tags=el('div','machine-tags');for(const item of s.items){const b=button(item.label,()=>{d.held58=item.id;save();draw();},'laundry-tag');b.setAttribute('aria-label',item.label+' 태그 집기');b.setAttribute('aria-pressed',String(d.held58===item.id));tags.append(b);}
   panel.append(controls,machine,tags,el('p','apparatus-note',held?'손에 든 태그 · '+held.label:'태그를 고르면 위쪽 기계의 걸이에 놓을 수 있습니다.'));return finish();
  }
  if(s.id==='registry-chain'){
   if(!Array.isArray(d.recordChain58)){d.recordChain58=[];d.placements=Array(4).fill(null);}
   const marks={reception:['접수 27','진료 V-6384'],vet:['진료 V-6384','등록 941372608154902'],registration:['등록 941372608154902','콩이 → 루미'],contract:['2026년 재입양','등록 941372608154902']};
   panel.append(el('p','apparatus-note','앞 기록에서 이어진 번호를 다음 서류에서 찾아 묶습니다. 잘못 이었다면 한 장씩 풀 수 있습니다.'));
   const chain=el('ol','registration-chain');d.recordChain58.forEach(key=>{const row=el('li','record-leaf');row.append(el('strong','',s.items.find(x=>x.id===key).label),el('small','',marks[key].join(' · ')));chain.append(row);});panel.append(chain);
   const papers=el('div','registration-papers');for(const item of s.items){if(d.recordChain58.includes(item.id))continue;const b=button('',()=>{d.recordChain58.push(item.id);d.placements=Array.from({length:4},(_,i)=>d.recordChain58[i]||null);change();},'record-leaf');b.setAttribute('aria-label',item.label+' 연결');b.append(el('strong','',item.label),el('small','',marks[item.id].join('\n')));papers.append(b);}panel.append(papers);
   const undo=button('마지막으로 이은 기록 풀기',()=>{d.recordChain58.pop();d.placements=Array.from({length:4},(_,i)=>d.recordChain58[i]||null);change();});undo.disabled=!d.recordChain58.length;panel.append(undo);return finish();
  }
  if(s.id==='family-calendar'){
   d.fields??={};d.fields.month??=1;d.fields.day??=1;
   const paper=el('article','calendar-page');paper.append(el('h3','','봄이를 돌보던 지난해 달력'),select('기념 월',Array.from({length:12},(_,i)=>[String(i+1),(i+1)+'월']),String(d.fields.month),v=>{d.fields.month=Number(v)||1;d.fields.day=Math.min(d.fields.day||1,new Date(2025,d.fields.month,0).getDate());change();}));
   const dates=el('div','family-calendar');for(let day=1;day<=new Date(2025,d.fields.month,0).getDate();day++){const b=button(String(day),()=>{d.fields.day=day;change();},'calendar-date');b.setAttribute('aria-label',day+'일 선택');b.setAttribute('aria-pressed',String(d.fields.day===day));dates.append(b);}paper.append(dates,el('output','',d.fields.month+'월 '+d.fields.day+'일'));panel.append(paper);return finish();
  }
  if(s.id==='calibrated-entrance'){
   d.fields??={};panel.append(el('p','apparatus-note','카메라 입장 표시 21:53 · 시계 점검표는 위쪽 단서에서 확인'));
   const mode=select('카메라 시각 보정 방향',[['0','더하기'],['1','빼기']],d.fields.subtract,v=>{d.fields.subtract=Number(v);save();});
   const diff=el('label','experience-field','카메라 시계의 차이 · 분'),n=el('input');n.type='number';n.min=0;n.max=20;n.inputMode='numeric';n.value=d.fields.offset??0;n.setAttribute('aria-label','카메라 시계 차이 분');n.oninput=()=>{d.fields.offset=n.value===''?null:Number(n.value);save();};diff.append(n);
   const time=el('label','experience-field','출입 기록에서 찾을 입장 시각'),t=el('input');t.type='time';t.setAttribute('aria-label','실제 입장 시각');t.value=String(d.fields.hour??0).padStart(2,'0')+':'+String(d.fields.minute??0).padStart(2,'0');t.oninput=()=>{const [h,m]=t.value.split(':').map(Number);d.fields.hour=h;d.fields.minute=m;save();};time.append(t);
   const preview=el('div','camera-preview','CAM 01 · 입장 장면'),stamp=el('strong','','21:53');preview.append(stamp);panel.append(preview,mode,diff,time);return finish();
  }
  if(s.id==='room-layout'){
   d.placements??=Array(3).fill(null);panel.append(el('p','apparatus-note','뒤편에서 바라본 세 창 · 창을 눌러 방 이름을 돌립니다'));
   const windows=el('div','window-model');s.slots.forEach((slot,i)=>{const item=s.items.find(x=>x.id===d.placements[i]),b=button('',()=>{const next=(s.items.findIndex(x=>x.id===d.placements[i])+1)%s.items.length;d.placements[i]=s.items[next].id;change();},'window-pane');b.setAttribute('aria-label',slot.label+' 방 바꾸기');b.append(el('small','',slot.label),el('strong','',item?.label||'확인 전'));windows.append(b);});panel.append(windows);return finish();
  }
  if(['tape-splice','postal-order'].includes(s.id)){
   const postal=s.id==='postal-order';d.placements??=s.items.map(x=>x.id);d.faces56??={};
   const stamps={garage:['2026.09.19','M'],apartment:['2026.09.23','R'],radio:['2026.09.27','17'],station:['2026.10.01','04']};
   panel.append(el('p','apparatus-note',postal?'우체국 도장은 앞면, 분류 표식은 뒷면에 남아 있습니다.':'이어 듣는 테이프 · 마지막 자리는 이번에 쓰지 않을 조각입니다.'));
   d.placements.forEach((key,i)=>{const item=s.items.find(x=>x.id===key),row=el('article',postal?'postal-envelope':'tape-segment');row.append(el('small','',s.slots[i].label),el('strong','',item.label));
    if(postal){row.append(el('p','envelope-mark',d.faces56[key]?'뒷면 분류 표식 · '+stamps[key][1]:'우체국 날짜 도장 · '+stamps[key][0]),button(d.faces56[key]?'앞면 보기':'뒷면 보기',()=>{d.faces56[key]=!d.faces56[key];change();}));}
    else row.append(el('span','tape-spools','◉ ━ ◉'),el('small','','조각 '+key+' · 연결 표식은 보관 음성에서 확인'));
    const move=delta=>{const next=i+delta;if(next<0||next>=d.placements.length)return;[d.placements[i],d.placements[next]]=[d.placements[next],d.placements[i]];change();};
    const up=button('↑ 앞으로',()=>move(-1)),down=button('↓ 뒤로',()=>move(1));up.disabled=i===0;down.disabled=i===d.placements.length-1;up.setAttribute('aria-label',item.label+' 앞으로 옮기기');down.setAttribute('aria-label',item.label+' 뒤로 옮기기');const buttons=el('div','experience-row');buttons.append(up,down);row.append(buttons);panel.append(row);
   });return finish();
  }
  if(s.id==='shelf-locator'){
   d.placements??=Array(3).fill(null);panel.append(el('p','apparatus-note','서가의 열을 고른 뒤 단과 칸이 만나는 자리를 누릅니다.'));
   const columns=el('div','experience-row');for(const value of ['FM','MR','RD']){const b=button(value+'열',()=>{d.placements[0]=value;change();});b.setAttribute('aria-label',value+'열 선택');b.setAttribute('aria-pressed',String(d.placements[0]===value));columns.append(b);}panel.append(columns);
   const grid=el('div','archive-shelf');for(const row of ['07','17','27'])for(const cell of ['04','14','40']){const b=button(row+'단 · '+cell+'칸',()=>{d.placements[1]=row;d.placements[2]=cell;change();},'shelf-cell');b.setAttribute('aria-label',row+'단 '+cell+'칸 선택');b.setAttribute('aria-pressed',String(d.placements[1]===row&&d.placements[2]===cell));grid.append(b);}panel.append(grid,el('output','shelf-position',(d.placements[0]||'—')+'-'+(d.placements[1]||'—')+'-'+(d.placements[2]||'—')));return finish();
  }
  if(s.id==='gift-seating'){
   d.placements??=Array(4).fill(null);const pool=el('div','gift-pool'),table=el('div','invitation-table');table.append(el('div','table-center','봄이의 자리\n창가 ↑'));
   for(const item of s.items){if(d.placements.includes(item.id))continue;const b=button(item.label,()=>{d.held56=d.held56===item.id?null:item.id;draw();},'wrapped-gift');b.setAttribute('aria-label',item.label+' 집기');b.setAttribute('aria-pressed',String(d.held56===item.id));pool.append(b);}
   s.slots.forEach((slot,i)=>{const item=s.items.find(x=>x.id===d.placements[i]),b=button('',()=>{if(!d.held56){if(item){d.placements[i]=null;d.held56=item.id;change();}else status.textContent='놓을 선물을 먼저 집어주세요';return;}const prev=d.placements.indexOf(d.held56);if(prev>=0)d.placements[prev]=null;d.placements[i]=d.held56;delete d.held56;change();},'table-seat seat-'+slot.id);b.setAttribute('aria-label',slot.label+' 자리'+(item?' · '+item.label:''));b.append(el('small','',slot.label),el('strong','',item?.label||'빈 의자'));table.append(b);});panel.append(pool,table);return finish();
  }
  if(s.id==='helping-cycle'){
   d.placements??=Array(5).fill(null);const ring=el('div','helping-ring');ring.append(el('div','ring-center','상생\n서로 돕는 고리'));
   s.slots.forEach((slot,i)=>{const selected=s.items.find(x=>x.id===d.placements[i]),b=button('',()=>{const next=(s.items.findIndex(x=>x.id===d.placements[i])+1)%s.items.length;d.placements[i]=s.items[next].id;change();},'ring-bowl ring-bowl-'+i);b.setAttribute('aria-label',(i+1)+'번째 그릇 빛 바꾸기');b.append(el('small','',i===0?'접수표의 시작 빛':(i+1)+'번째 빛'),el('strong','',selected?.label||'돌려보기'));ring.append(b);});panel.append(ring,el('p','apparatus-note','그릇을 누르면 빛이 바뀝니다. 마지막 그릇은 처음 빛으로 이어져야 합니다.'));return finish();
  }
  if(s.id==='finder-correspondence'){
   d.placements??=Array(3).fill(null);const notebook=el('div','comparison-notebook');notebook.append(el('h3','','옛 사진 옆에 붙이는 기록'),el('p','','사진 원본과 상자 속 물건을 위쪽 단서에서 펼쳐보세요. 외모만 닮았다는 이유로 같은 강아지라 단정하지 않습니다.'));
   s.slots.forEach((slot,i)=>notebook.append(select(slot.label,s.items.map(x=>[x.id,x.label]),d.placements[i],v=>{d.placements[i]=v||null;save();})));panel.append(notebook);return finish();
  }
  return previous(ctx);
 }
 window.MihaejePhysicalControls.render=render;
})();

