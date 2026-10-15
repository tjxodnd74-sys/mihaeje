const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.attrs={};this.dataset={};this.className='';this.textContent='';this.style={setProperty(){}};this.classList={add:(c)=>{this.className+=' '+c}};}
 append(...a){this.children.push(...a)} prepend(...a){this.children.unshift(...a)} insertBefore(a,b){this.children.splice(this.children.indexOf(b),0,a)} replaceChildren(...a){this.children=a} setAttribute(k,v){this.attrs[k]=v}
 contains(n){return this===n||this.children.some(child=>child.contains(n))} getAttribute(k){return this.attrs[k]??null} querySelectorAll(){return []} set innerHTML(v){this.textContent=String(v).replace(/<[^>]+>/g,' ')}
}
const find=(r,p)=>r.children.flatMap(n=>[...(p(n)?[n]:[]),...find(n,p)]),text=n=>[n.textContent,...n.children.map(text)].join(' '),body=new Element('div');
let current,passes=0,cancels=0,saves=0;
const box={window:{MihaejeOverlay:{show(o){current=o.node;body.replaceChildren(current)},close(){}}},document:{createElement:t=>new Element(t),createElementNS:(_,t)=>new Element(t),querySelector:()=>body},queueMicrotask:fn=>fn()};
for(const f of ['adventure-data.js','story-devices-v36.js','story-adventure-v36.js'])vm.runInNewContext(fs.readFileSync('web/'+f,'utf8'),box);
const W=box.window,R=W.MihaejeStoryDevices,E=W.MihaejeAdventure;
const button=name=>{const n=find(current,n=>n.tagName==='button'&&(n.attrs['aria-label']===name||n.textContent===name))[0];assert(n,'missing button '+name);return n};
let total=0;
for(const id of Object.keys(R.themes))for(let level=1;level<=5;level++){
 const read=Object.keys(R.titles[id]),state={started:true,escape:{opened:true,place40:1},challenge:{level},read:[...read],profile:{seed:2,companion:4}},plan=R.plan(id,level,state);let seenProgress=[];
 const config={id,state,save(){saves++},onPass(){passes++},onCancel(){cancels++},onProgress:(done,total)=>seenProgress.push([done,total])};
 E.bindRecords(id,{docs:()=>read.map(x=>({id:x,title:R.titles[id][x],body:'<p>原본 '+x+'</p>'})),available:()=>true,openRecord:x=>{current=new Element('article');current.append(new Element('p'));body.replaceChildren(current)}});
 E.ensure(config);
 for(let stage=0;stage<plan.length;stage++){
  total++;const spec=plan[stage],q=state.adventure,d=q.draft[stage];
  assert.equal(Number(current.dataset.adventureStage),stage);assert(current.children.findIndex(x=>x.className==='story-evidence-tray')<current.children.findIndex(x=>x.className.startsWith('story-workbench')),'clues precede controls on all themes');const action=find(current,n=>n.className==='story-primary')[0];action.onclick();assert(!q.done.includes(stage),'initial draft cannot pass');
  if(spec.id==='located-unit'){button(spec.target.floor+'0'+spec.target.unit+'호 선택').onclick();
  }else if(['clock','dial','overlay'].includes(spec.kind)){
   for(const f of spec.fields){const output=find(current,n=>n.tagName==='output'&&n.attrs['aria-label'].startsWith(f.label+' 현재'))[0];assert(output,id+'/'+level+'/'+stage+'/'+f.label);for(let n=0;n<200&&d.fields[f.id]!==spec.target[f.id];n++)output.onkeydown({key:'ArrowUp',preventDefault(){}});assert.equal(d.fields[f.id],spec.target[f.id]);}
  }else if(spec.kind==='route'){
   for(const node of spec.target.slice(1))button(spec.nodes.find(n=>n.id===node).label+' 역으로 이동').onclick();
  }else{
   // Lift every pre-positioned piece, then put target pieces into physical slots.
   for(let slot=0;slot<spec.slots.length;slot++)if(d.placements[slot]){const label=spec.items.find(i=>i.id===d.placements[slot]).label;button(spec.slots[slot].label+' 자리 · '+label).onclick();button(label+' 집기').onclick();}
   for(let slot=0;slot<spec.target.length;slot++){const label=spec.items.find(i=>i.id===spec.target[slot]).label;button(label+' 집기').onclick();button(spec.slots[slot].label+' 자리').onclick();}
  }
  if(level>=4){for(const x of spec.support)button(R.titles[id][x]+' 사본 끼우기').onclick();assert.equal(find(current,n=>n.className==='story-mounted-paper').length,2,'inserted records change desk');}
  if(level>=5){assert.equal(find(current,n=>n.className.includes('story-fold-card')).length,0,'no true/false alternatives');for(const x of spec.support){button(R.titles[id][x]+' 이 자료 집기').onclick();button('메모에 자료 붙이기').onclick();}assert.equal(find(current,n=>n.className==='story-attached-proof').length,2);}
  assert(R.valid(spec,d,level),id+' '+level+' '+spec.id+' physical callbacks');
  const serialized=JSON.stringify(d);E.ensure(config);assert.equal(JSON.stringify(state.adventure.draft[stage]),serialized,'return preserves operation');
  find(current,n=>n.className==='story-primary')[0].onclick();assert(state.adventure.done.includes(stage));assert.equal(find(current,n=>n.className==='story-primary')[0].textContent,stage+1===plan.length?'안쪽 기록 꺼내기':id==='studio'?'다음 작업 펼치기':'다음 장소 살펴보기');find(current,n=>n.className==='story-primary')[0].onclick();
  if(stage+1<plan.length&&id!=='studio'){assert.equal(state.escape.place40,stage+2,'reward moves to the next physical place');E.ensure(config);}
 }
 assert.equal(seenProgress.length,plan.length);assert(seenProgress.every((x,i)=>x[0]===i+1&&x[1]===plan.length));
 E.finish({id,state,save(){saves++},onDone(choice){assert.equal(state.sceneEnding.choice,choice)}});find(current,n=>n.className==='story-primary')[1].onclick();
}
assert.equal(passes,50);console.log('PASS '+total+' controller stages across 10 themes × 5 levels; rejected initial states, physical operations, mounted records, proof attachment, return/save continuity, progress and final choice callbacks; '+saves+' saves.');
