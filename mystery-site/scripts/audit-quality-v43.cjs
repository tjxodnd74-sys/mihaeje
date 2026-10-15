const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let configured;const box={window:{MihaejeHints:{configure:v=>configured=v,code:(kind,n)=>(configured?.id==='studio'?'S':'O')+'-'+kind+String(n).padStart(2,'0')}},document:{body:{classList:{toggle(){}}},addEventListener(){},getElementById(){return null}}};
for(const f of ['adventure-data.js','story-devices-v36.js','play-v38.js','story-notes-v40.js','places-v40.js','game-quality-v43.js','story-payoffs-v44.js'])vm.runInNewContext(fs.readFileSync('web/'+f,'utf8'),box);
const W=box.window,R=W.MihaejeStoryDevices;let total=0;
for(const id of Object.keys(W.MihaejePlay.levels))for(const s of R.plan(id,2,{profile:{seed:2,companion:4}})){
 total++;const hint=s.hints[2];assert(hint.startsWith('정답과 조작 순서'));assert(hint.includes('「'+s.actionLabel+'」'));assert(s.nextStory?.length>20);assert.equal(new Set(s.slots.map(x=>x.label)).size,s.slots.length,'unique slot names');
 if(s.id!=='confirmation-scope'&&s.id!=='located-unit'){if(Array.isArray(s.target)&&s.kind!=='route'){for(let i=0;i<s.target.length;i++)assert(hint.includes(s.slots[i].label+' → '+s.items.find(x=>x.id===s.target[i]).label));}else if(s.fields?.length)for(const f of s.fields)assert(hint.includes(f.label+' = '));}
 if(s.requiresSupport)for(const x of s.support)assert(hint.includes(R.titles[id][x])&&hint.includes('사본 끼우기'));
 if(s.requiresExclude)assert(hint.includes('이 자료 집기')&&hint.includes('두 장을 모두 붙입니다'));
}
assert.equal(total,34);
const state={started:true,step:0,solved:false},puzzles=()=>[1,2].map(n=>({code:'S-P0'+n,steps:['접근','방향','기존'],allowed:()=>true,returnTo(){}}));W.MihaejeHints.configure({id:'studio',state:()=>state,puzzles,openRecord(){}});
for(const [step,code]of [[0,'S-P01'],[2,'S-P01'],[3,'S-P02'],[4,'S-P02'],[5,'S-P03']]){state.step=step;const available=configured.puzzles().filter(p=>p.allowed());assert.equal(available.length,1);assert.equal(available[0].code,code);}
state.solved=true;assert.equal(configured.puzzles().filter(p=>p.allowed()).length,0);
const oh={step:1,solved:false,profile:{seed:1,companion:3},adventure:{done:[]}};W.MihaejeHints.configure({id:'ohang',state:()=>oh,puzzles:()=>[1,2,3].map(n=>({code:'O-P0'+n,steps:['접근','방향','이전'],returnTo(){}}))});
for(let i=0;i<3;i++){oh.adventure.done=Array.from({length:i},(_,n)=>n);const p=configured.puzzles().filter(p=>p.allowed());assert.equal(p.length,1);assert.equal(p[0].code,'O-P0'+(i+1));assert(p[0].steps[2].includes('마지막으로 「'));}
for(const file of ['case','episode','studio','ohang']){const html=fs.readFileSync('web/'+file+'.html','utf8');assert(html.includes('game-quality-v43.css'));assert(html.indexOf('game-quality-v43.js')<html.indexOf('story-adventure-v36.js'));}
console.log('PASS 34 exact actionable final hints, support and counter-evidence instructions, unique slot labels, all transition questions, native hint routing, and all four page integrations.');
