(()=>{
 const key='mihaeje-beta-feedback-v1',button=document.createElement('button');
 button.type='button';button.className='beta-feedback-trigger';button.textContent='베타 · 의견 남기기';
 document.querySelector('footer')?.append(button);
 // The server exposes only the permission flag here, never feedback records.
 fetch('/api/feedback-access',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(access=>{
  if(!access?.owner)return;
  const box=document.createElement('section');box.className='feedback-owner-entry';box.setAttribute('aria-label','소유자 전용 피드백');
  const heading=document.createElement('h2');heading.textContent='받은 의견';
  const note=document.createElement('p');note.textContent='테스터가 남긴 의견을 모아 보는 소유자 전용 공간입니다.';
  const link=document.createElement('a');link.href='/feedback-admin';link.textContent='제작자 피드백함 열기 →';
  box.append(heading,note,link);document.querySelector('body>footer')?.before(box);
  const menu=document.querySelector('nav[aria-label="사이트 메뉴"]');if(menu){const shortcut=link.cloneNode(true);shortcut.className='feedback-owner-shortcut';shortcut.textContent='받은 의견';menu.append(shortcut)}
 }).catch(()=>{});
 // A secondary entry inside the help panel keeps the mobile scene uncluttered.
 document.addEventListener('mihaeje:inspection',e=>{if(!e.detail?.key?.includes('hint'))return;const body=document.querySelector('.inspection-body');if(body&&!body.querySelector('.beta-help-link')){const link=button.cloneNode(true);link.classList.add('beta-help-link');link.onclick=show;body.append(link)}});
 if(document.querySelector('#cases')){const note=document.createElement('p');note.className='beta-status';note.textContent='무료 베타 · 플레이 의견을 받아 이야기를 다듬고 있습니다';document.querySelector('#themeCollection')?.before(note)}
 // Keep all ten choices usable even when the catalogue request is slow or fails.
 let cases=window.MihaejeBoot?.catalogue||Object.entries({garage:'마지막 정비소',apartment:'404호의 불빛',radio:'끝나지 않은 방송',station:'세 번째 승강장',letter:'반송된 편지','pet-home':'첫 번째 보호자',studio:'비가 그친 사진관',laundry:'자정의 무인 세탁소','cat-invite':'고양이의 초대장',ohang:'돌아오는 계절'}).map(([id,title])=>({id,title})),draft={};try{draft=JSON.parse(localStorage.getItem(key))||{}}catch{}
 fetch('cases.json').then(r=>r.json()).then(data=>{cases=Array.isArray(data)?data:data.cases||[]}).catch(()=>{});
 const current=new URLSearchParams(location.search).get('case')||(location.pathname.includes('ohang')?'ohang':location.pathname.includes('studio')?'studio':location.pathname.includes('case')?'garage':'');
 function save(){try{localStorage.setItem(key,JSON.stringify(draft))}catch{}}
 function field(root,label,name,options){const wrap=document.createElement('label');wrap.textContent=label;wrap.className='field';const select=document.createElement('select');select.name=name;for(const [value,text]of options){const o=document.createElement('option');o.value=value;o.textContent=text;select.append(o)}select.value=draft[name]||'';select.onchange=()=>{draft[name]=select.value;save()};wrap.append(select);root.append(wrap);return select}
 function show(){
  const node=document.createElement('section');node.className='beta-feedback';const intro=document.createElement('p');intro.textContent='어디서 막혔는지, 어떤 장면이 좋았는지 알려주세요';node.append(intro);if(current)draft.game=current;
  field(node,'플레이한 테마','game',[['','테마 선택'],...cases.map(c=>[c.id,c.title])]);
  field(node,'사용한 기기','device',[['','기기 선택'],['phone','휴대폰'],['tablet','태블릿'],['pc','PC']]);
  field(node,'남길 의견','topic',[['','의견 선택'],['navigation','단서 확인 동선'],['puzzle','퍼즐이 막힘'],['story','스토리와 결말'],['readability','글씨와 화면'],['sound','효과음'],['bug','오류'],['other','기타']]);
  const label=document.createElement('label');label.className='field';label.textContent='어느 장면에서 어떤 일이 있었나요';const input=document.createElement('textarea');input.rows=4;input.maxLength=2000;input.value=draft.notes||'';input.placeholder='예: 봉투를 열고 단서로 돌아갈 때 위치를 잃었어요';input.oninput=()=>{draft.notes=input.value;save()};label.append(input);node.append(label);
  const optional=document.createElement('details');optional.className='beta-optional';const summary=document.createElement('summary');summary.textContent='플레이 경험도 알려주기 (선택)';optional.append(summary);node.append(optional);
  field(optional,'설명 없이 진행할 수 있었나요','flow',[['','평가하지 않음'],['1','1 · 어려웠어요'],['2','2'],['3','3'],['4','4'],['5','5 · 자연스러웠어요']]);
  field(optional,'단서가 납득되고 재미있었나요','clue',[['','평가하지 않음'],['1','1 · 이해하기 어려웠어요'],['2','2'],['3','3'],['4','4'],['5','5 · 납득되고 재미있었어요']]);
  field(optional,'다른 게임도 하고 싶은가요','replay',[['','평가하지 않음'],['yes','하고 싶어요'],['maybe','고민 중이에요'],['no','아니요']]);
  const info=document.createElement('p');info.className='small';info.textContent='작성한 의견은 제작자만 볼 수 있습니다 보내기를 누르면 이 폼의 내용과 현재 장소가 전달됩니다';const status=document.createElement('p');status.setAttribute('role','status');
  const send=document.createElement('button');send.type='button';send.className='primary';send.textContent='의견 보내기';send.onclick=async()=>{if(!draft.game||!draft.device||!draft.topic||!draft.notes?.trim()){status.textContent='테마·기기·의견을 고르고 내용을 적어주세요';return}send.disabled=true;status.textContent='의견을 보내는 중…';const payload=Object.fromEntries(['game','device','topic','notes','flow','clue','replay'].map(k=>[k,draft[k]||'']));payload.scene=document.querySelector('.escape-heading h2,#spaceTitle,#ohSpace')?.textContent||'';try{const r=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await r.json();if(!r.ok)throw Error(result.error||'전송하지 못했습니다');status.textContent='의견이 제작자에게 도착했습니다 감사합니다';draft={game:current,device:draft.device};save();input.value='';send.textContent='전송 완료'}catch(e){status.textContent=(e.message||'전송하지 못했습니다')+' · 작성한 내용은 보관됩니다';send.disabled=false}};
  const copy=document.createElement('button');copy.className='primary';copy.type='button';copy.textContent='피드백 복사';copy.onclick=async()=>{
   if(!draft.game||!draft.device||!draft.topic||!draft.notes?.trim()){status.textContent='테마·기기·의견을 고르고 내용을 적어주세요';return}
   const text=['미해제 베타 의견',...Array.from(node.querySelectorAll('select')).map(s=>s.closest('label').childNodes[0].textContent+': '+s.options[s.selectedIndex].text),draft.notes.trim()].join('\n');
   try{await navigator.clipboard.writeText(text);status.textContent='복사했습니다 초대해준 분께 붙여넣어주세요'}catch{const fallback=document.createElement('textarea');fallback.value=text;fallback.readOnly=true;fallback.setAttribute('aria-label','직접 복사할 피드백');node.append(fallback);fallback.focus();fallback.select();status.textContent='아래 내용을 선택해 직접 복사해주세요'}
  };const actions=document.createElement('div');actions.className='beta-actions';actions.append(send,copy);node.append(info,actions,status);copy.className='quiet';
  window.MihaejeOverlay?.show({key:'beta-feedback',title:'플레이 의견 남기기',node,dismissOutside:false,returnFocus:()=>button});
 }
 button.onclick=show;
 window.MihaejeFeedback={open:show};
})();
