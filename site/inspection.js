(()=>{
 let dialog,body,heading,closeButton,tools,pager,active=null,origin=null,composing=false,trail=[];
 function ensure(){
  if(dialog)return;
  dialog=document.createElement('dialog');dialog.className='inspection-dialog';dialog.setAttribute('aria-labelledby','inspectionTitle');
  const bar=document.createElement('header');bar.className='inspection-bar';
  heading=document.createElement('h2');heading.id='inspectionTitle';
  closeButton=document.createElement('button');closeButton.type='button';closeButton.className='inspection-close';closeButton.textContent='← 장면';closeButton.setAttribute('aria-label','확대창 닫기');closeButton.onclick=()=>goBack();
  bar.append(heading,closeButton);tools=document.createElement('nav');tools.className='inspection-tools';tools.setAttribute('aria-label','확대창 조사 도구');
  body=document.createElement('div');body.className='inspection-body';pager=document.createElement('nav');pager.className='inspection-pager';pager.setAttribute('aria-label','단서 넘기기');pager.hidden=true;dialog.append(bar,tools,body,pager);document.body.append(dialog);
  dialog.addEventListener('compositionstart',()=>composing=true);dialog.addEventListener('compositionend',()=>composing=false);
  dialog.addEventListener('cancel',e=>{e.preventDefault();if(!composing)goBack()});
  let outside=false;const isOutside=e=>{const r=dialog.getBoundingClientRect();return e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)};
  dialog.addEventListener('pointerdown',e=>outside=isOutside(e));dialog.addEventListener('click',e=>{if(outside&&isOutside(e)&&active?.dismissOutside)close();outside=false});
 }
 function restoreNode(entry){if(entry.placeholder?.parentNode){entry.placeholder.replaceWith(entry.node);entry.node.hidden=entry.hidden}else entry.node.remove()}
 function goBack(){if(!trail.length){close();return}const previous=trail.pop();show({...previous.options,restoring:true});body.scrollTop=previous.scroll;}
 function close({notify=true}={}){
  if(!active)return;
  const previous=active,position=origin;active=null;trail=[];restoreNode(previous);dialog.close();document.documentElement.classList.remove('inspection-open');
  if(position)document.body.style.cssText=position.bodyStyle;
  origin=null;composing=false;if(notify)previous.onClose?.();
  if(position){window.scrollTo({left:position.x,top:position.y,behavior:'instant'});const focus=previous.returnFocus?.()||position.focus;if(focus?.isConnected)focus.focus({preventScroll:true});queueMicrotask(()=>{if(active)return;const latest=previous.returnFocus?.()||position.focus;if(latest?.isConnected)latest.focus({preventScroll:true})})}
 }
 function configureTools(references,back,title){
  tools.replaceChildren();tools.hidden=!references.length&&!back;
  if(back){const b=document.createElement('button');b.type='button';b.className='inspection-return';b.textContent=back.label;b.onclick=back.onClick;tools.append(b)}
  if(references.length){const library=document.createElement('details');library.className='inspection-library';const summary=document.createElement('summary');summary.textContent='펼칠 수 있는 자료 '+references.length+'개';summary.setAttribute('aria-label','발견한 기록 꺼내 보기');const list=document.createElement('div');list.className='inspection-library-list';references.forEach(r=>{const b=document.createElement('button');b.type='button';b.textContent=r.label;b.setAttribute('aria-current',String(r.label===title));b.onclick=r.onClick;list.append(b)});library.append(summary,list);tools.append(library)}
  pager.replaceChildren();const index=references.findIndex(r=>r.label===title);pager.hidden=index<0||references.length<2;
  if(!pager.hidden){for(const [offset,label] of [[-1,'← 이전 단서'],[1,'다음 단서 →']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!references[index+offset];b.onclick=()=>references[index+offset]?.onClick();pager.append(b)}}
 }
 function show({key,title,node,warm=false,onClose,returnFocus,dismissOutside=true,references=[],back,restoring=false}){
  if(active&&!restoring&&active.key!==key&&active.node!==node){const sibling=trail.findIndex(entry=>entry.options.key===key);if(sibling>=0)trail=trail.slice(0,sibling);else trail.push({options:active.options,scroll:body.scrollTop});}
  ensure();window.MihaejeSurface?.apply(dialog,{key,title,node});window.MihaejeThemeType?.(node);configureTools(references,back,title);dialog.classList.toggle('has-inspection-tools',!tools.hidden);dialog.classList.toggle('has-inspection-pager',!pager.hidden);
  const parent=trail.at(-1);if(parent){closeButton.textContent='← '+parent.options.title;closeButton.setAttribute('aria-label','돌아가기 · '+parent.options.title)}else closeButton.setAttribute('aria-label','확대창 닫기');
  if(active?.key===key&&active.node===node){const changed=heading.textContent!==title;heading.textContent=title;active.dismissOutside=dismissOutside;active.options={key,title,node,warm,onClose,returnFocus:returnFocus||active.returnFocus,dismissOutside,references,back};if(changed){body.scrollTop=0;window.MihaejeAudio?.play('paper')}document.dispatchEvent(new CustomEvent('mihaeje:inspection',{detail:{key}}));return}
  const same=active?.key===key,scroll=same?body.scrollTop:0,focused=same&&dialog.contains(document.activeElement)?document.activeElement:null,focusId=focused?.id,focusLabel=focused?.getAttribute('aria-label'),focusName=focused?.getAttribute('data-focus-key'),focusText=focused?.textContent;
  if(!active){origin={x:window.scrollX,y:window.scrollY,focus:document.activeElement,bodyStyle:document.body.style.cssText};Object.assign(document.body.style,{position:'fixed',top:-origin.y+'px',left:-origin.x+'px',width:'100%'})}
  const inheritedFocus=active?.returnFocus;if(active)restoreNode(active);
  let placeholder=null;const hidden=node.hidden;if(node.parentNode){placeholder=document.createComment('inspection return point');node.before(placeholder)}node.hidden=false;
  active={key,node,placeholder,hidden,onClose,returnFocus:returnFocus||inheritedFocus,dismissOutside,options:{key,title,node,warm,onClose,returnFocus:returnFocus||inheritedFocus,dismissOutside,references,back}};heading.textContent=title;dialog.classList.toggle('warm-inspection',warm);body.replaceChildren(node);if(!same&&(node.id==='recordBody'||node.id==='document'))window.MihaejeAudio?.play('paper');
  if(!dialog.open){document.documentElement.classList.add('inspection-open');dialog.showModal();closeButton.focus({preventScroll:true})}else if(!same)closeButton.focus({preventScroll:true});body.scrollTop=scroll;
  if(same&&focused){const candidates=[...body.querySelectorAll('button,input,select,textarea')];const restored=focusName?candidates.find(n=>n.getAttribute('data-focus-key')===focusName):focusId?candidates.find(n=>n.id===focusId):focusLabel?candidates.find(n=>n.getAttribute('aria-label')===focusLabel):candidates.find(n=>n.textContent===focusText);restored?.focus({preventScroll:true})}
  document.dispatchEvent(new CustomEvent('mihaeje:inspection',{detail:{key}}));
 }
 window.MihaejeOverlay={show,close,isOpen:prefix=>!!active&&(!prefix||active.key.startsWith(prefix)),closeIf:prefix=>{if(active?.key.startsWith(prefix))close({notify:false})}};
})();
