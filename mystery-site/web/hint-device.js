(()=>{
 const themes={garage:['G','정비실 무전기','radio','정비실입니다 확인할 자료 코드를 보내주세요'],apartment:['A','관리실 인터폰','intercom','관리실입니다 점검 중인 장치 코드를 알려주세요'],radio:['R','조정실 인터컴','intercom','조정실 응답합니다 어느 기록을 복원하고 있나요'],station:['T','역무실 무전기','radio','역무실입니다 확인할 기록 코드를 호출해주세요'],letter:['L','서고의 전달 쪽지','note','확인하고 싶은 기록 코드를 쪽지에 적어주세요'],'pet-home':['P','보호자의 쪽지','note','루미의 기록에서 막힌 부분을 함께 살펴볼까요'],studio:['S','할아버지의 메모','note','살펴보는 물건의 코드를 적어두면 작업 메모를 펼칠 수 있어요'],laundry:['W','야간 관리자 무전기','radio','야간 관리자입니다 어느 기계의 기록인지 알려주세요'],'cat-invite':['C','이웃의 작은 쪽지','note','초대장의 어느 부분을 함께 볼까요'],ohang:['O','오행당의 전서구','pigeon','편지에 단서 코드를 적어 보내면 작은 답장이 돌아옵니다']};
 let config,grants=new Map(),current='';
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
 const btn=(text,fn)=>{const b=el('button',text);b.type='button';b.onclick=fn;return b};
 const code=(kind,n)=>themes[config?.id]?.[0]+'-'+kind+String(n).padStart(2,'0');
 function refreshDock(){if(!config)return;const t=themes[config.id];document.querySelectorAll('#hint,#episodeHint,#openHint,#ohHint').forEach(b=>{b.setAttribute('aria-label',t[1]+' · 코드로 힌트 요청');const label=b.querySelector('.dock-label');if(label)label.textContent=t[2]==='pigeon'?'전서구':t[2]==='note'?'쪽지':'통신'})}
 function configure(value){config=value;grants=new Map();refreshDock()}
 document.addEventListener('DOMContentLoaded',refreshDock);
 function recordSteps(id){const steps=window.MihaejeRecordHints?.[config.id]?.records[id]?.steps;if(!steps)return null;const state=config.state(),e=['목','화','토','금','수'],objects=['새싹','등불','그릇','종','물잔'],p=state.profile,values={seedName:p?e[p.seed]:'아직 접수표를 작성하지 않았습니다',seedCycle:p?Array.from({length:5},(_,i)=>e[(p.seed+i)%5]).join(' → '):'접수표 작성 뒤 시작점이 정해집니다',seedObject:p?objects[p.seed]:'아직 물건을 고르지 않았습니다',companionName:p?e[p.companion]:'아직 표시가 없습니다',companionPredecessor:p?e[(p.companion+3)%5]:'접수표 작성 뒤 정해집니다',reservationChoice:({keep:'간직하고 싶은 기억을 적어두겠습니다.',release:'마음에 걸린 걱정을 잠시 내려놓겠습니다.',share:'누군가에게 하고 싶었던 말을 전하겠습니다.'}[state.choices?.[0]]||'아직 문장을 고르지 않았습니다'),lastChoice:({plant:'새싹',light:'등불',rest:'그릇',ring:'종',flow:'물잔'}[state.choices?.[1]]||'아직 마지막 물건을 고르지 않았습니다')};return steps.map(t=>t.replace(/\{(\w+)\}/g,(_,key)=>values[key]||''))}
 function entries(){if(!config)return[];const records=(config.docs?.()||[]).map((d,i)=>({code:code('D',i+1),label:d.title,allowed:()=>config.allowed?.(d.id)!==false,returnTo:()=>config.openRecord?.(d.id),steps:recordSteps(d.id)||config.recordHints?.(d.id)||['이 자료가 다루는 대상과 시각을 먼저 확인하세요','문서의 표식·날짜·번호를 현재 장치의 조건과 대조해보세요','자료 하나로 추측하지 말고 같은 표식이 있는 다른 기록과 연결하세요']}));const puzzles=config.puzzles?.()||[];return [...new Map([...records,...puzzles,...grants.values()].map(entry=>[entry.code,entry])).values()]}
 function grant(kind,n,label,steps,allowed=()=>true,returnTo,solved=()=>false){const c=code(kind,n);grants.set(c,{code:c,label,steps,allowed,returnTo,solved});return c}
 function badge(node,c){if(!config||!node||node.querySelector('[data-hint-code]'))return;const t=themes[config.id],label=t[2]==='pigeon'?'전서구로 힌트 받기':t[2]==='note'?'쪽지로 힌트 받기':t[2]==='radio'?'무전기로 힌트 받기':config.id==='radio'?'인터컴으로 힌트 받기':'인터폰으로 힌트 받기',b=btn('',()=>open(c)),icon=el('span','?','hint-request-icon'),copy=el('span',undefined,'hint-request-copy');icon.setAttribute('aria-hidden','true');copy.append(el('strong',label),el('small','힌트 요청 코드 '+c));b.append(icon,copy,el('span','→','hint-request-arrow'));b.setAttribute('aria-label',label+' · 힌트 코드 '+c);b.dataset.hintCode=c;b.className='hint-code hint-request';node.prepend(b)}
 function open(requested=''){
  if(!config)return;
  const t=themes[config.id],state=config.state(),all=entries(),available=all.filter(e=>e.allowed()),hardware=['radio','intercom'].includes(t[2]);
  state.hintDevice??={levels:{},used:0};state.hintDevice.levels??={};state.hintDevice.used=Number(state.hintDevice.used)||0;
  current=requested||available.find(e=>e.code.includes('-S'))?.code||available.find(e=>e.code.includes('-P'))?.code||available.find(e=>e.code===current)?.code||available[0]?.code||'';
  const identity={"garage":["정비실 점검 응답","점검 중인 장치","SUIT,sans-serif","#f7eee0","#202a2e","#efb661","정비실 점검표"],"apartment":["관리실 점검 접수장","확인할 창과 점검함","SUIT,sans-serif","#263844","#f0f3f3","#476b81","관리실 접수 번호"],"radio":["미루 FM · 송출 점검 로그","복원 중인 녹음","Consolas,SUIT,monospace","#e9f6e6","#101e2a","#b9df8a","녹음 점검 채널"],"station":["수림행 · 역무실 안내","이동 중인 구간","SUIT,sans-serif","#173b54","#f1f5f7","#b07719","역무실 안내 번호"],"laundry":["야간 점검 영수증","확인할 접수번호","Consolas,SUIT,monospace","#243d3c","#fffef5","#40746f","세탁소 점검 접수"],"letter":["사서의 분류 답장","정리 중인 봉투","MihaejeLetter,serif","#493125","#f4e9d2","#936343","사서 정해린에게"],"pet-home":["정우가 앨범에 남긴 메모","함께 살펴볼 기념품","MihaejePet,SUIT,sans-serif","#3e402c","#f6f0df","#78824d","정우 씨께"],"cat-invite":["이웃들이 보내온 답장","준비 중인 초대장","MihaejeNote,SUIT,sans-serif","#59323e","#fff1ed","#af607b","포장 가게 이웃들에게"],"studio":["암실 작업 메모","준비 중인 필름과 인화","MihaejeArchive,serif","#302c30","#f4f3ed","#a14132","사진관 작업 번호"],"ohang":["오행당에서 온 한지 편지","접수표와 다섯 그릇","MihaejeLetter,serif","#354331","#f2eddd","#6c7d48","오행당 관리인께"]}[config.id];const root=el('section',undefined,'hint-device hint-workspace');root.dataset.helper=t[2];root.dataset.helperCase=config.id;
  const apparatus=el('div',undefined,hardware?'hint-apparatus':'hint-letter'),conversation=el('section',undefined,'hint-conversation');conversation.style.setProperty('display','block','important');
  const input=el('input',undefined,'apparatus-code');input.type='text';input.maxLength=16;input.autocomplete='off';input.spellcheck=false;input.value=current;input.placeholder=current||available.find(e=>e.code.includes('-S'))?.code||t[0]+'-S01';input.setAttribute('aria-label','힌트 요청 코드');
  const controlLabels={radio:'힌트 요청 · 송신',intercom:'힌트 요청 · 호출',note:'힌트 쪽지 건네기',pigeon:'힌트 편지 보내기'};
  const next=btn(controlLabels[t[2]],request);next.className='hint-transmit';
  if(hardware){
   const photo=el('img',undefined,'apparatus-photo');photo.src='assets/hints/'+t[2]+'-front-v32.webp';photo.alt=t[1];photo.width=1024;photo.height=1280;
   const display=el('label',undefined,'apparatus-display');display.append(el('span','힌트 코드','apparatus-screen-label'),input);apparatus.append(photo,display,next);
   const caption=el('p',t[1],'apparatus-caption');apparatus.append(caption);
  }else{
   const recipient={letter:'기록관에',studio:'할아버지에게','pet-home':'보호자에게','cat-invite':'이웃에게',ohang:'오행당에'}[config.id];
   apparatus.append(el('p',identity[6]||recipient,'hint-letter-recipient'),el('h3',identity[1]),el('p','어디서부터 살펴볼지 막혔어요\n아래 기록에 대한 작은 도움이 필요합니다','hint-letter-copy'));
   const line=el('label',undefined,'hint-letter-code');line.append(el('span','힌트 코드'),input);apparatus.append(line,next);
   if(t[2]==='pigeon'){const bird=el('img',undefined,'hint-messenger');bird.src='assets/hints/pigeon-v1.webp';bird.alt='오행당의 전서구';bird.width=960;bird.height=640;apparatus.append(bird)}
  }
  const heading=el('div',undefined,'hint-conversation-head'),status=el('span',hardware?'수신 대기':'답장을 기다리는 쪽지','hint-connection');
  heading.append(el('p',identity[0],'hint-channel'),status);
  const chosen=el('div',undefined,'hint-chosen'),chosenLabel=el('strong'),chosenCode=el('span',undefined,'hint-chosen-code'),chosenKind=el('small');chosen.append(chosenKind,chosenLabel,chosenCode);
  const picker=el('details',undefined,'hint-clue-picker'),summary=el('summary','다른 단서 선택 ▾'),choices=el('div',undefined,'hint-clue-choices');summary.setAttribute('aria-label','힌트 받을 단서 바꾸기');picker.append(summary,choices);
  available.forEach(entry=>{const choose=btn('',()=>{input.value=entry.code;current=entry.code;picker.open=false;renderSelection()});choose.className='hint-clue-choice';choose.append(el('strong',entry.label),el('small',entry.code));choices.append(choose)});
  const stages=el('ol',undefined,'hint-progress');['첫 힌트','풀이 방향','정답·풀이'].forEach(text=>stages.append(el('li',text)));
  const output=el('div',undefined,'hint-response');output.setAttribute('role','status');output.setAttribute('aria-live','polite');
  const back=btn('해당 자료·문제로 돌아가기',()=>{const entry=all.find(e=>e.code===input.value.trim().toUpperCase());if(!entry?.allowed()){output.replaceChildren(el('p','아직 찾은 단서를 먼저 선택해주세요'));return}window.MihaejeOverlay.close({notify:false});entry.returnTo?.()});back.className='hint-return';
  const instructions=el('details',undefined,'hint-instructions');instructions.append(el('summary','힌트 이용 안내'),el('p','접근법 → 풀이 방향 → 정답·풀이 순서로 열립니다\n요청 기록은 현재 브라우저에 저장됩니다'));
  const related=btn('현재 문제의 정답 보기',()=>{const entry=available.find(e=>e.code.includes('-S'))||available.find(e=>e.code.includes('-P'));if(!entry)return;const chosen=entryNow();if(chosen?.code.includes('-D')&&(state.hintDevice.levels[chosen.code]||0)>=3){window.MihaejeOverlay.close({notify:false});entry.returnTo?.();}else open(entry.code)});related.className='hint-related';conversation.append(heading,chosen,picker,stages,output,related,back,instructions);root.append(apparatus,conversation);
  function entryNow(){return all.find(e=>e.code===input.value.trim().toUpperCase())}
  function reply(entry,n,previous=false){output.replaceChildren(el('p',(previous?'이전에 받은 도움 ':'도움 ')+n+'/3','hint-step'));entry.steps[Math.min(n-1,entry.steps.length-1)].split(/\n\n+/).forEach(text=>output.append(el('p',text)));if(n===3&&entry.code.includes('-D')){const active=available.find(e=>e.code.includes('-S'))||available.find(e=>e.code.includes('-P'));if(active){output.append(el('h3','현재 문제의 정답과 조작 순서','hint-current-solution'));active.steps[2].split(/\n\n+/).forEach(text=>output.append(el('p',text)));}}}
  function nextLabel(n){return n===0?controlLabels[t[2]]:n===1?(hardware?'풀이 방향 요청':'풀이 방향 더 물어보기'):n===2?(hardware?'정답·풀이 요청':'정답·풀이까지 물어보기'):'마지막 답장 다시 보기'}
  function drawLevel(n){[...stages.children].forEach((li,i)=>{li.classList.toggle('received',i<n);li.classList.toggle('next',i===n);li.setAttribute('aria-current',String(i===n-1))});next.textContent=hardware?(t[2]==='radio'?'송신':'호출'):nextLabel(n);next.setAttribute('aria-label',nextLabel(n));next.title=nextLabel(n);root.classList.toggle('has-reply',n>0);}
  function renderSelection(){
   const entry=entryNow(),allowed=entry?.allowed(),n=allowed?Math.min(3,Number(state.hintDevice.levels[entry.code])||0):0;
   const documentHelp=entry?.code.includes('-D');chosenKind.textContent=documentHelp?'자료 읽기 힌트':'장치 힌트 · 세 번째에 정답';stages.children[2].textContent=documentHelp?'자료 해설':'정답·풀이';related.hidden=!documentHelp||!available.some(e=>e.code.includes('-S')||e.code.includes('-P'));related.textContent=n===3?'정답의 문제 화면으로 돌아가기':'현재 문제의 정답 보기';back.textContent=documentHelp?'이 자료로 돌아가기':'이 장치로 돌아가기';
   chosenLabel.textContent=allowed?entry.label:'자료에 붙은 힌트 코드를 적어주세요';chosenCode.textContent=input.value.trim().toUpperCase();drawLevel(n);
   status.textContent=n?(hardware?'응답 수신':'답장 도착'):hardware?'수신 대기':'답장을 기다리는 쪽지';output.replaceChildren();
   if(n)reply(entry,n,true);
   else output.append(el('p',hardware?(t[2]==='radio'?'송신':'호출')+' 버튼을 누르면 이 단서의 첫 번째 힌트를 받을 수 있습니다':'쪽지를 보내면 이 단서의 첫 번째 답장이 도착합니다','hint-awaiting'));
   back.disabled=!allowed;choices.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.querySelector('small').textContent===input.value)));
  }
  function request(){
   const c=input.value.trim().toUpperCase(),entry=entryNow();if(!entry){output.replaceChildren(el('p','이 코드를 찾지 못했습니다 단서에 붙은 힌트 코드를 확인해주세요'));return}
   if(!entry.allowed()){if(entry.solved?.()){current=c;chosenLabel.textContent=entry.label;chosenCode.textContent=c;status.textContent=hardware?'응답 수신':'답장 도착';output.replaceChildren(el('p','이미 해결한 장치입니다 · 풀이 다시 보기','hint-step'));(entry.steps[2]||'').split(/\n\n+/).forEach(text=>output.append(el('p',text)));return}output.replaceChildren(el('p',entry.code.includes('-S')?'아직 열리지 않은 장치입니다 지금 진행 중인 장치의 코드는 장치 화면 위쪽에 있습니다':'아직 발견하지 않은 기록입니다 먼저 장면에서 찾아주세요'));return}
   current=c;const previous=Math.min(3,Number(state.hintDevice.levels[c])||0),level=Math.min(3,previous+1);state.hintDevice.levels[c]=level;if(previous<3)state.hintDevice.used++;config.save();renderSelection();drawLevel(level);
   status.textContent=hardware?'응답 수신':'답장 도착';chosenLabel.textContent=entry.label;chosenCode.textContent=c;back.disabled=false;reply(entry,level);
  }
  input.oninput=renderSelection;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();request()}};renderSelection();
  window.MihaejeOverlay.show({key:'hint-device-'+config.id,title:t[1],node:root,dismissOutside:true});
 }
 document.addEventListener('click',e=>{const b=e.target.closest?.('#hint,#episodeHint,#openHint,#ohHint');if(b&&config){e.preventDefault();e.stopImmediatePropagation();open()}},true);
 document.addEventListener('mihaeje:inspection',e=>{if(!config||e.detail.key.startsWith('hint-device'))return;const node=document.querySelector('.inspection-body > :first-child');if(node?.dataset.hintCode)badge(node,node.dataset.hintCode)});
 function escapeConfig({id,state,save,docs,hints,openRecord,openPuzzle,root,recordHints}){
  configure({id,state,save,docs,openRecord,recordHints,allowed:doc=>window.MihaejeEscape.allowed(state(),doc)&&(!docs().find(d=>d.id===doc)?.locked||state().unlocked),puzzles:()=>{
   const game=state(),story=window.MihaejePlay.stories[id],plan=window.MihaejeStoryDevices.plan(id,game.challenge?.level,game),index=plan.findIndex((s,i)=>!game.adventure?.done?.includes(i)),stage=plan[index];return [{code:code('P',1),label:story.object,steps:['장면의 「'+story.object+'」부터 살펴보세요.','안에 있는 「'+story.action+'」 버튼을 찾아보세요.','정답 조작 순서\n\n1. 「'+story.object+'」 화면으로 돌아갑니다.\n\n2. 「'+story.action+'」 버튼을 누릅니다.\n\n3. 새로 나타난 자료를 읽은 뒤 「이곳 계속 살펴보기」를 누릅니다. 다음 장소로 이동합니다.'],allowed:()=>game.orientation===38&&!game.escape?.opened,returnTo:()=>window.MihaejeEscape.open(root,'target')},...(game.escape?.opened&&stage?[{code:code('S',index+1),label:stage.title,steps:stage.hints,allowed:()=>!game.unlocked,returnTo:openPuzzle}]:[])]
  }})
 }
 window.MihaejeHints={configure,escapeConfig,open,code,grant,badge,themes};
})();
