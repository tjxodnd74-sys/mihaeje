const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class N{constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.attrs={};this.className='';this.textContent='';this.style={setProperty(){}};this.classList={toggle(){},add(){}};}append(...a){a.forEach(n=>n.parent=this);this.children.push(...a)}prepend(...a){a.forEach(n=>n.parent=this);this.children.unshift(...a)}replaceChildren(...a){a.forEach(n=>n.parent=this);this.children=a}insertBefore(a,b){a.parent=this;this.children.splice(this.children.indexOf(b),0,a)}remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this)}setAttribute(k,v){this.attrs[k]=v}getAttribute(k){return this.attrs[k]}contains(n){return this.children.includes(n)}querySelectorAll(){return []}querySelector(){return null}}
const scan=n=>n.children.filter(x=>x&&typeof x==='object').flatMap(x=>[x,...scan(x)]);let current;const body=new N('div');const ctx={window:{MihaejeOverlay:{show(o){current=o.node;body.replaceChildren(current)},close(){}}},document:{body:new N('body'),createElement:t=>new N(t),createElementNS:(_,t)=>new N(t),getElementById(){},querySelector:()=>body,addEventListener(){}},queueMicrotask:fn=>fn()};
vm.createContext(ctx);for(const f of ['adventure-data.js','story-devices-v36.js','play-v38.js','story-notes-v40.js','places-v40.js','physical-controls-v40.js','game-quality-v43.js','story-payoffs-v44.js','experience-v56.js','experience-controls-v56.js','story-adventure-v36.js'])vm.runInContext(fs.readFileSync('web/'+f,'utf8'),ctx);
const W=ctx.window,R=W.MihaejeStoryDevices,E=W.MihaejeAdventure;const get=(label)=>{const n=scan(current).find(n=>n.attrs['aria-label']===label)||scan(current).find(n=>n.textContent===label);assert(n,'missing control '+label);return n;};const click=l=>get(l).onclick();const select=(l,v)=>{const n=get(l);n.value=v;n.onchange();};let stages=0,passed=0;
for(const id of Object.keys(W.MihaejePlay.levels)){
 const state={started:true,orientation:38,escape:{opened:true,place40:1},read:Object.keys(R.titles[id]),profile:{seed:2,companion:4}},plan=R.plan(id,2,state);const config={id,state,save(){},onPass(){passed++},onCancel(){}};
 E.bindRecords(id,{docs:()=>state.read.map(id=>({id,title:R.titles[config.id][id]})),available:()=>true,openRecord(){}});
 const reverse=process.argv.includes('--reverse'),order=reverse?(id==='garage'||id==='apartment'?[0,2,1,3]:id==='studio'?[0,1]:[1,0,...plan.map((_,i)=>i).slice(2)]):plan.map((_,i)=>i);
 for(const index of order){
  assert(W.MihaejeExperience.available(id,state).includes(index),'branch prerequisites '+id+'/'+index);if(id==='ohang')state.nativePlace40=index+1;else state.escape.place40=index+1;
  E.ensure(config);const s=plan[index],d=state.adventure.draft[index];assert.equal(current.dataset.adventureStage,index);assert(s.narrative.length>30&&s.nextStory.length>30);assert(!s.requiresSupport&&!s.requiresExclude);assert(s.hints[2].startsWith('정답과 조작 순서'));assert(s.hints[2].includes(s.actionLabel));
  scan(current).find(n=>n.className==='story-primary').onclick();assert(!state.adventure.done.includes(index),'initial state cannot pass');
  if(s.id==='calibrated-entrance'){select('카메라 시각 보정 방향','1');const n=get('카메라 시계 차이 분');n.value='7';n.oninput();const t=get('실제 입장 시각');t.value='21:46';t.oninput();}
  else if(s.id==='personnel-card'){const n=get('조회할 직원 카드 번호');n.value='99';n.oninput();assert(!R.valid(s,d,W.MihaejePlay.levels[id]),'unknown card cannot pass');n.value='07';n.oninput();}
  else if(s.id==='coat-machine'){for(let i=0;i<s.target.length;i++){click(s.items.find(x=>x.id===s.target[i]).label+' 태그 집기');click(s.slots[i].label+' 걸이에 태그 놓기');if(i+1<s.target.length)click('다음 기계 →');}}
  else if(s.id==='registry-chain'){for(const key of s.target)click(s.items.find(x=>x.id===key).label+' 연결');click('마지막으로 이은 기록 풀기');assert(!R.valid(s,d,W.MihaejePlay.levels[id]),'partial record chain cannot pass');click(s.items.find(x=>x.id===s.target.at(-1)).label+' 연결');}
  else if(s.id==='family-calendar'){select('기념 월','6');click('12일 선택');}
  else if(s.id==='shelf-locator'){click('MR열 선택');click('17단 04칸 선택');}
  else if(s.id==='room-layout'||s.id==='helping-cycle'){
   s.target.forEach((target,i)=>{const label=s.id==='room-layout'?s.slots[i].label+' 방 바꾸기':(i+1)+'번째 그릇 빛 바꾸기';for(let n=0;n<6&&d.placements[i]!==target;n++)click(label);});
  }else if(['postal-order','tape-splice'].includes(s.id)){
   for(let i=0;i<s.target.length;i++){let where=d.placements.indexOf(s.target[i]);while(where>i){click(s.items.find(x=>x.id===s.target[i]).label+' 앞으로 옮기기');where--;}}
  }else if(s.id==='old-platform'){s.target.forEach((key,i)=>{click(s.items.find(x=>x.id===key).label+' 집기');click(s.slots[i].label+' 자리');});}
  else if(s.id==='gift-seating'){s.target.forEach((key,i)=>{click(s.items.find(x=>x.id===key).label+' 집기');click(s.slots[i].label+' 자리');});}
  else if(s.id==='finder-correspondence'){s.target.forEach((v,i)=>select(s.slots[i].label,v));}
  else if(s.id==='confirmation-scope'){click('안내소에 연결 요청');click('왜 연락이 없었는지 묻기');click('지금 괜찮은지 묻기');}
  else if(s.id==='five-directions'){s.target.forEach((key,i)=>{click(s.items.find(x=>x.id===key).label+' 집기');click(s.slots[i].label+' 자리');});}
  else if(s.id==='watching-light')click(s.items.find(x=>x.id===s.target[0]).label+' 표식 선택');
  else if(s.kind==='route')for(const node of s.target.slice(1))click(s.nodes.find(x=>x.id===node).label+' 역으로 이동');
  else if(['clock','dial','overlay'].includes(s.kind)){
   if(s.id==='located-unit')click('502호 선택');else for(const f of s.fields){const n=scan(current).find(n=>n.tagName==='output'&&n.attrs['aria-label']?.startsWith(f.label+' 현재'));assert(n,s.id+'/'+f.label);for(let k=0;k<200&&d.fields[f.id]!==s.target[f.id];k++)n.onkeydown({key:'ArrowUp',preventDefault(){}});}
  }else if(['night-conditions','input-proofs','receipt-proof'].includes(s.id)){s.target.forEach((v,i)=>select(s.slots[i].label+' 점검 항목',v));}
  else if(s.id==='powered-path'){s.target.forEach((key,i)=>click(s.slots[i].label+'에 '+s.items.find(x=>x.id===key).label+' 연결'));}
  else {s.target.forEach((v,i)=>click(s.slots[i].label+'에 '+s.items.find(x=>x.id===v).label+' 선택'));}
  assert(R.valid(s,d,W.MihaejePlay.levels[id]),id+'/'+s.id);const copy=JSON.stringify(d);E.ensure(config);assert.equal(JSON.stringify(state.adventure.draft[index]),copy,'reopen retains draft');scan(current).find(n=>n.className==='story-primary').onclick();assert(state.adventure.done.includes(index));assert(scan(current).some(n=>n.className==='story-next-question'&&n.textContent===W.MihaejeExperience.nextStory(id,state,s.nextStory)));stages++;
 }E.ensure(config);
}
assert.equal(stages,34);assert.equal(passed,10);
for(const [id,o]of Object.entries(W.MihaejeExperience.openings)){assert(fs.existsSync('web/'+o.src));assert(o.opening.every(v=>v>4&&v<96));}
console.log('PASS 34 current stages through actual control callbacks across 10 games; invalid drafts, save/reopen, exact current hints, story continuity and 8 visible opening anchors.');

