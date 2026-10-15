const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
class Element {
 constructor(tag){this.tagName=tag;this.children=[];this.attrs={};this.dataset={};this.events={};this.className='';this.textContent='';this.hidden=false;this.open=false;this.disabled=false;this.isConnected=true;this.classList={toggle:(name,on)=>{if(on)this.className+=' '+name}}}
 append(...nodes){this.children.push(...nodes)}
 replaceChildren(...nodes){this.children=nodes}
 setAttribute(k,v){this.attrs[k]=v}
 addEventListener(k,fn){this.events[k]=fn}
 focus(){doc.activeElement=this}
 showModal(){this.open=true}
 close(){this.open=false;this.events.close?.()}
 pause(){this.paused=true}
 load(){this.loaded=true}
 play(){this.paused=false;return Promise.resolve()}
 removeAttribute(k){delete this[k];delete this.attrs[k]}
 querySelector(tag){return find(this,n=>n.tagName===tag)[0]||null}
}
const find=(root,predicate)=>root.children.flatMap(n=>[...(predicate(n)?[n]:[]),...find(n,predicate)]);
const text=n=>[n.textContent,...n.children.map(text)].join(' ');
const opener=new Element('button'),doc={body:new Element('body'),activeElement:opener,createElement:tag=>new Element(tag),addEventListener(){}};
const box={window:{MihaejeOverlay:{close(){}},addEventListener(){}},document:doc};
vm.runInNewContext(fs.readFileSync('web/adventure-data.js','utf8'),box);
vm.runInNewContext(fs.readFileSync('web/ending-scenes.js','utf8'),box);
const D=box.window.MihaejeAdventureData,E=box.window.MihaejeEnding;
let count=0;
for(const id of Object.keys(D).filter(id=>id!=='garage')) for(const choice of [0,1]){
 let saved=0,detail=0;const state={sceneEnding:{choice,custom:'keep'}},sources=[];
 doc.activeElement=opener;E.show({id,state,save:()=>saved++,detail:()=>detail++});
 const dialog=doc.body.children[0];
 for(let beat=1;beat<=4;beat++){
  assert(dialog.open);assert.equal(dialog.dataset.beat,String(beat));
  const img=find(dialog,n=>n.tagName==='img')[0];sources.push(img.src);assert(fs.existsSync('web/'+img.src),id+' missing '+img.src);
  if(img.srcset)for(const src of img.srcset.split(',').map(p=>p.trim().split(' ')[0]))assert(fs.existsSync('web/'+src),id+' missing responsive '+src);
  const details=find(dialog,n=>n.tagName==='details');assert.equal(details.length,beat===4?1:0,id+' record gating');
  const dots=find(dialog,n=>n.className.includes('ending-film-dots'))[0];
  assert.equal(dots.children.length,4);assert.equal(dots.children[beat-1].attrs['aria-current'],'step');
  dots.children.forEach((b,i)=>assert.equal(b.disabled,i>=beat,'future beats cannot jump'));
  if(beat<4)assert(!text(dialog).includes('근거 ·'),id+' detailed deduction before final');
  if(beat<4)find(dialog,n=>n.textContent==='다음 장면 →')[0].onclick();
  else{
   assert.equal(details[0].open,false);assert.equal(find(details[0],n=>n.className==='ending-film-reason').length,3);
   assert.equal(find(dialog,n=>n.tagName==='h2')[0].textContent,D[id].choiceBeats[choice]);
   find(dialog,n=>n.textContent==='남겨진 흔적 살펴보기')[0].onclick();assert.equal(saved,1);assert.equal(state.sceneEnding.hookSeen,true);assert.equal(state.sceneEnding.custom,'keep');
   find(dialog,n=>n.textContent==='발견한 이야기 다시 읽기')[0].onclick();assert.equal(detail,1);assert(!dialog.open);assert.equal(doc.activeElement,opener);
  }
 }
 assert.equal(new Set(sources).size,4,id+' four distinct files');
 assert.equal(new Set(sources.map(s=>crypto.createHash('sha256').update(fs.readFileSync('web/'+s)).digest('hex'))).size,4,id+' four distinct image bytes');
 E.show({id,state,save:()=>saved++});assert.equal(dialog.dataset.beat,'1');assert.equal(find(dialog,n=>n.tagName==='details').length,0);E.close();
 count++;
}
const ohState={sceneEnding:{choice:1}};
E.show({id:'ohang',state:ohState,beats:['사용자의 첫 장면','사용자의 제목','사용자의 셋째 장면'],finalBeat:'사용자의 약속'});
const oh=doc.body.children[0];
for(const expected of ['사용자의 첫 장면','사용자의 제목','사용자의 셋째 장면','사용자의 약속']){
 assert.equal(find(oh,n=>n.tagName==='h2')[0].textContent,expected);
 const next=find(oh,n=>n.textContent==='다음 장면 →')[0];if(next)next.onclick();
}
oh.events.cancel({preventDefault(){}});assert(!oh.open);
for(const choice of [0,1]){
 let saved=0;const state={sceneEnding:{choice,custom:'keep'}};
 E.show({id:'garage',state,save:()=>saved++});const g=doc.body.children[0];
 assert.equal(g.dataset.mode,'summary');assert.equal(find(g,n=>n.tagName==='video').length,0,'no video element or URL request before opt-in');
 assert.equal(find(g,n=>n.className==='ending-film-dots').length,0,'garage no longer requires four photographs');
 assert.equal(find(g,n=>n.tagName==='h2')[0].textContent,['확인한 기록을 인계 봉투에 남깁니다','원본과 동의받은 종이 사본을 나눕니다'][choice]);
 assert.equal(find(g,n=>n.className==='ending-film-reason').length,3);
 find(g,n=>n.textContent==='엔딩 영상 보기')[0].onclick();const v=find(g,n=>n.tagName==='video')[0];
 assert.equal(v.src,'/media/assets/endings/garage-film-v42.mp4');assert(v.controls&&v.playsInline);assert.equal(v.preload,'none');assert.equal(g.dataset.mode,'video');
 v.events.ended();assert.equal(state.sceneEnding.videoSeen,true);assert.equal(saved,1);assert.equal(state.sceneEnding.choice,choice);
 find(g,n=>n.textContent==='사건 풀이로 돌아가기')[0].onclick();assert(v.paused);assert.equal(v.src,undefined);assert(v.loaded);assert.equal(g.dataset.mode,'summary');
 find(g,n=>n.textContent==='엔딩 영상 보기')[0].onclick();const replay=find(g,n=>n.tagName==='video')[0];E.close();assert(replay.paused);assert.equal(replay.src,undefined);
 E.show({id:'radio',state:{}});assert.equal(g.dataset.mode,undefined,'no garage video styles leak to other themes');E.close();
}
assert(!fs.readFileSync('web/ending-scenes.js','utf8').includes('innerHTML'));
console.log('PASS '+count+' photograph theme/choice flows; garage optional video, no prefetch, both choices, explanation, playback, resume, source teardown, and no cross-theme style leak.');
