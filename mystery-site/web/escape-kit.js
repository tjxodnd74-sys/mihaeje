(()=>{
 const D=window.MihaejeEscapeDesigns,P=()=>window.MihaejePlay;
 const expected=t=>t.marks.slice().sort((a,b)=>a.rank-b.rank).map(m=>m.token);
 function normalize(raw,game,theme,docs){const s=raw||{},ids=docs.map(d=>d.id),migrated=!raw&&game.started&&((game.read||[]).length>1||game.unlocked||game.solved),opened=!!s.opened||!!migrated;return {...s,inventory:Array.isArray(s.inventory)?s.inventory.filter(i=>['part-0','part-1','tool','exit-key'].includes(i)):[],selection:[],revealed:!!s.revealed||!!migrated,opened,area:opened&&(s.area===1||migrated)?1:0,place40:Number.isInteger(s.place40)?s.place40:0,discovered:[...new Set(['brief',...(s.discovered||[]).filter(i=>ids.includes(i)),...(migrated?(game.read||[]).filter(i=>ids.includes(i)):[])])],choice:[],escaped:!!s.escaped||game.solved===true}}
 window.MihaejeEscapeRules={expected,matches:(t,c)=>Array.isArray(c)&&c.join('|')===expected(t).join('|'),normalize};
 const el=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n},btn=(text,fn,cls='')=>{const n=el('button',cls,text);n.type='button';n.onclick=fn;return n};
 const instances=new WeakMap();
 window.MihaejeEscape={mount(config){let room=instances.get(config.root);if(!room){room=new Room(config);instances.set(config.root,room)}else room.config=config;room.render();return room},open(root,panel){const room=instances.get(root);if(room)room.open(panel)},focus(root){return root.querySelector('[data-return-focus]')||root.querySelector('.room-hotspot')},allowed:(game,id)=>id==='brief'||game.escape?.discovered?.includes(id)===true,ready:game=>game.escape?.opened===true};
 class Room{
  constructor(config){this.config=config;this.focusName='';this.message=''}
  get game(){return this.config.state()} get state(){return this.game.escape} get theme(){return D[this.config.id]} get story(){return P().stories[this.config.id]} get journey(){const j=window.MihaejeJourneys.data[this.config.id];return {...j,entry:window.MihaejeExperience?.arrivals[this.config.id]||j.entry}}
  save(){this.config.save();this.render()}
  show(node,title,key){window.MihaejeOverlay.show({key:'room-'+this.config.id+'-'+key,title,node,warm:!!this.theme.warm,dismissOutside:true,onClose:()=>this.render(),returnFocus:()=>[...this.config.root.querySelectorAll('.room-hotspot')].find(n=>n.getAttribute('aria-label')===this.focusName)})}
  open(panel){if(panel==='brief'){P().readStory(this.config.id,this.game,this.config.save,()=>this.render());return}if(['lock','clue','target'].includes(panel)){this.opening();return}if(panel==='inventory'){this.records();return}if(panel.startsWith('group-')){this.discover(Number(panel.slice(-1)));return}this.render()}
  render(){
   const {root,id,docs}=this.config,s=this.state;if(!s)return;
   const ready=P().gate(id,this.game),M=window.MihaejePlaces,j=this.journey,rows=M.data[id],plan=M.plan(id,P().levels[id],this.game),current=M.current(id,this.game),limit=M.unlocked(id,this.game),final=rows.length+1;
   document.body.classList.toggle('opening-action-pending',!s.opened);document.body.classList.toggle('final-record-pending',!this.game.unlocked);
   root.replaceChildren();root.classList.add('escape-experience');root.dataset.roomCase=id;root.classList.toggle('gentle-room',!!this.theme.warm);
   if(!s.opened)s.place40=0;if(!Number.isInteger(s.place40))s.place40=0;
   s.place40=Math.max(0,Math.min(s.place40,this.game.unlocked?final:limit));
   const place=s.place40,row=place>0&&place<=rows.length?rows[place-1]:null;
   const location=row?row[0]:place===final?j.final:j.entry;
   const heading=el('div','escape-heading');heading.append(el('h2','',location));root.append(heading);
   if(ready&&s.opened){const route=el('nav','place-route');route.setAttribute('aria-label','이동할 장소');
    [j.entry,...rows.map(r=>r[0]),j.final].forEach((name,i)=>{const b=btn(i===0?'처음 물건 다시보기':name,()=>{s.place40=i;this.message='';this.save()},'place-link');b.disabled=window.MihaejeExperience?!window.MihaejeExperience.canVisit(id,this.game,i):i>limit&&!(this.game.unlocked&&i===final);b.hidden=b.disabled;b.setAttribute('aria-current',String(i===place));route.append(b)});root.append(route);}
   const scene=el('div','escape-scene place-scene'),img=this.image||(this.image=el('img','room-art')),layout=window.MihaejeScene;
   const openingView=window.MihaejeExperience?.openings[id];
   const photo=row?M.photos[id][place-1]:place===final?{src:'assets/endings/'+id+'-detail-480-v36.webp'}:openingView||{src:'assets/photoreal/'+id+'-entry-empty-v37.webp'};
   scene.append(img);scene.dataset.place=place;layout.image(img,scene,photo,location);const tray=el('div','scene-tray');tray.append(el('p','scene-tray-label','꺼내 둔 자료'));const hosts=new Map();const offer=(name,p,action,kind="record",recordId=null)=>{const xy=layout.point(photo,p);if(xy){const key=xy.map(n=>n.toFixed(1)).join(',');if(!hosts.has(key))hosts.set(key,{xy,title:p.host,items:[]});hosts.get(key).items.push({name,action,kind,recordId});}else tray.append(btn(name,action,'scene-tray-item'))};
   const setSpot=(name,x,y,action,white=false)=>{const b=btn('',()=>{this.focusName=name;action()},'room-hotspot'+(white?' story-start-spot':''));b.style.left=x+'%';b.style.top=y+'%';b.setAttribute('aria-label',name);b.append(el('span','hotspot-dot'),el('span','hotspot-label',name));scene.append(b)};
   if(!ready)setSpot('이야기 읽기',20,72,()=>this.open('brief'),true);
   else if(!s.opened||place===0){
    const spot=openingView?.opening||[50,60];
    if(openingView?.carried){const prop=el('div','scene-carried-object '+openingView.carried);prop.setAttribute('aria-hidden','true');if(openingView.carried==='reader'){prop.append(el('div','scene-reader-screen','SD CARD'),el('div','scene-reader-slot'),el('div','scene-reader-power','⏻'));}else prop.append(el('span','',this.story.object));scene.append(prop);}
    setSpot(this.story.object,...spot,()=>this.opening());
    heading.append(btn('이야기 다시 읽기',()=>this.open('brief'),'place-link'));
    if(s.opened)heading.append(btn(rows[0][0]+' →',()=>{s.place40=1;this.save()},'place-next'));
   }
   else if(row){
    const stage=place-1,source=(plan[stage].evidence||[]).filter(x=>!docs.find(d=>d.id===x)?.locked),unseen=source.filter(x=>!s.discovered.includes(x));
    source.forEach(key=>{const d=docs.find(d=>d.id===key);if(!d)return;const host=photo.records?.find(r=>r.id===key);offer(d.title.replace(/^\d+\s*·\s*/,''),host,()=>{if(!s.discovered.includes(key))s.discovered.push(key);this.config.save();this.openDoc(key)},"record",key);});
    const available=window.MihaejeExperience?.available(id,this.game)||[current];
    if(available.includes(stage)){if(layout.point(photo,photo.device))offer(row[1],photo.device,()=>this.config.onPuzzle(),"device");else{const carried=el('div','scene-carried-object record-board');carried.append(el('span','',row[1]));scene.append(carried);setSpot(row[1],18,68,()=>this.config.onPuzzle());}}
    if(this.game.adventure?.done?.includes(stage)||current<0){const next=available.length?available[0]+1:final,reason=window.MihaejeExperience?.nextStory(id,this.game,plan[stage].nextStory)||plan[stage].nextStory||row[2],way=el('div','place-continuation');way.append(el('p','',reason));for(const destination of (available.length?available.map(i=>i+1):[final]))way.append(btn((destination===final?j.final:rows[destination-1][0])+' →',()=>{s.place40=destination;this.save()},'place-next'));heading.after?.(way);root.append(way);}
    root.dataset.currentOperation=row[1];
   }else{const last=docs.find(d=>d.locked);if(last){if(!s.discovered.includes(last.id)){s.discovered.push(last.id);this.config.save()}tray.append(btn(last.title,()=>this.openDoc(last.id),'scene-tray-item'));}const carried=el('div','scene-carried-object record-board');carried.append(el('span','',j.final));scene.append(carried);setSpot(s.escaped?'남긴 이야기 다시 보기':j.final,18,68,()=>this.useExit());}
   for(const host of hosts.values()){const items=host.items;setSpot(items.length===1?items[0].name:host.title+' 살펴보기',...host.xy,()=>{const device=items.find(item=>item.kind==="device");if(device){for(const item of items){if(item.recordId&&!s.discovered.includes(item.recordId))s.discovered.push(item.recordId);}this.config.save();device.action();return;}if(items.length===1){items[0].action();return}const n=el('article','opening-object');n.append(el('h2','',host.title));for(const item of items)n.append(btn(item.name,item.action,'discovered-record'));this.show(n,host.title,'host')});}
   if(tray.children.length>1){tray.children[0].textContent='펼쳐둔 자료 · 바로 읽기';root.append(tray);}root.append(scene);queueMicrotask(()=>{layout.fit?.(scene);const route=root.querySelector('.place-route'),active=route?.querySelector('[aria-current=true]');if(innerWidth<=700&&active)route.scrollLeft=Math.max(0,active.offsetLeft-route.clientWidth/3);});if(!ready)return;
   if(s.opened&&place>0){const done=this.game.adventure?.done||[],offered=new Set([...s.discovered,...plan.flatMap((p,i)=>(i<=Math.max(place-1,...done)?(p.evidence||[]):[]))]),unread=docs.filter(d=>offered.has(d.id)&&(!d.locked||this.game.unlocked)&&!(this.game.read||[]).includes(d.id));
    if(unread.length){const left=el('div','place-unread');left.append(el('p','','아직 읽지 않은 자료 '+unread.length+'장'));unread.forEach(d=>left.append(btn(d.title.replace(/^\d+\s*·\s*/,''),()=>{if(!s.discovered.includes(d.id))s.discovered.push(d.id);this.config.save();this.openDoc(d.id);},'discovered-record')));this.unreadBlock=left;}else this.unreadBlock=null;}
   const links=el('div','room-quick-links');if(s.discovered.length>1)links.append(btn('읽은 자료 '+(this.game.read||[]).filter(x=>docs.some(d=>d.id===x)).length+' / '+docs.length,()=>this.records(),'quiet'));if(row&&(window.MihaejeExperience?.available(id,this.game)||[current]).includes(place-1))links.append(btn(row[1],()=>this.config.onPuzzle(),'quiet'));root.insertBefore(links,scene);root.querySelector('.place-continuation')?.before(links);if(this.unreadBlock){links.after(this.unreadBlock);this.unreadBlock=null;}
   if(this.message&&!(this.game.adventure?.done?.length)){const status=el('p','room-feedback',this.message);status.setAttribute('role','status');root.append(status);}
  }
  opening(){const id=this.config.id,s=this.state,story=this.story,node=el('article','opening-object');node.dataset.opening=id;node.append(el('h2','',story.object));
   if(s.opened){node.append(el('p','',story.after));story.first.forEach(doc=>{const d=this.config.docs.find(d=>d.id===doc);if(d)node.append(btn(d.title.replace(/^\d+\s*·\s*/,''),()=>this.openDoc(doc),'opening-record'))});node.append(btn('이곳 계속 살펴보기',()=>{window.MihaejeOverlay.close({notify:false});s.area=1;s.place40=1;this.save()},'story-primary'));this.show(node,story.object,'opening');return}
   const prop=el('div','opening-apparatus opening-'+story.mode);prop.setAttribute('aria-label',story.object);
   if(story.mode==='power'){prop.append(el('span','reader-slot','SD'),el('span','reader-light','대기'),btn('⏻',()=>finish(),'reader-power'));prop.lastChild.setAttribute('aria-label',story.action)}
   if(story.mode==='receiver'){prop.append(el('span','intercom-grill'),btn('수화기',()=>finish(),'intercom-handset'));prop.lastChild.setAttribute('aria-label',story.action)}
   if(story.mode==='play'){prop.append(el('span','tape-reel'),el('span','tape-reel'),btn('▶',()=>finish(),'tape-play'));prop.lastChild.setAttribute('aria-label',story.action)}
   if(story.mode==='message')prop.append(el('p','phone-from','친구 · 받은 메시지'),el('p','phone-preview','“여기 표지가 옛날 그대로야.”'),btn('메시지 열기',()=>finish(),'phone-message'));
   if(story.mode==='receipt')prop.append(el('p','receipt-heading','미루세탁 · 접수 N-08'),el('div','receipt-fold'),btn('접힌 면 펼치기',()=>finish(),'receipt-unfold'));
   if(story.mode==='envelope')prop.append(el('span','envelope-address','미루기록관 귀중'),el('span','envelope-stamp','주소 불명'),btn('덮개 열기',()=>finish(),'envelope-flap'));
   if(story.mode==='lid')prop.append(el('span','box-label','루미의 지난날'),btn('뚜껑 들기',()=>finish(),'keepsake-lid'));
   if(story.mode==='ribbon')prop.append(el('span','gift-ribbon'),btn('리본 아래 이름표',()=>finish(),'ribbon-tag'));
   if(story.mode==='film')prop.append(el('div','film-negative','01  ▢ ▢ ▢   02  ▢ ▢ ▢'),btn('필름을 빛에 비춰보기',()=>finish(),'film-light'));
   node.append(prop);this.show(node,story.object,'opening');const engine=this;function finish(){s.revealed=true;s.opened=true;s.place40=1;s.inventory=[];s.selection=[];for(const doc of story.first)if(!s.discovered.includes(doc))s.discovered.push(doc);engine.message=story.after;engine.config.save();window.MihaejeAudio?.play(story.mode==='power'?'switchOn':story.mode==='receiver'?'keys':'paper');engine.opening();engine.render()}
  }
  discover(index){const ids=(this.theme.groups[index]||[]).filter(id=>!this.config.docs.find(d=>d.id===id)?.locked||this.game.unlocked);for(const id of ids)if(!this.state.discovered.includes(id))this.state.discovered.push(id);this.config.save();const node=el('article','scene-records');node.dataset.roomCase=this.config.id;node.append(el('h2','',this.journey.groups[index]));ids.forEach(id=>{const d=this.config.docs.find(d=>d.id===id);if(d)node.append(btn(d.title.replace(/^\d+\s*·\s*/,''),()=>this.openDoc(id),'discovered-record'))});this.show(node,this.journey.groups[index],'group-'+index);this.render()}
  records(){const node=el('article','scene-records');node.dataset.roomCase=this.config.id;node.append(el('h2','','찾아둔 단서'));this.config.docs.filter(d=>this.state.discovered.includes(d.id)&&(!d.locked||this.game.unlocked)).forEach(d=>node.append(btn(d.title.replace(/^\d+\s*·\s*/,''),()=>this.openDoc(d.id),'discovered-record')));this.show(node,'찾아둔 단서','records')}
  openDoc(id){this.config.onDoc(id)}
  useExit(){if(this.state.escaped){this.config.onEscape();return}if(!this.game.unlocked)return;const last=this.config.docs.find(d=>d.locked);if(last&&!this.game.read.includes(last.id)){this.openDoc(last.id);return}this.config.onConclusion()}
 }
})();

