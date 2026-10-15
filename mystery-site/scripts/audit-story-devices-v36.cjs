'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const R=require(path.join(__dirname,'../web/story-devices-v36.js'));
const locked={garage:['backup'],apartment:['inspection'],radio:['transmission'],station:['arrival'],laundry:['audit'],letter:['register'],'pet-home':['letter'],'cat-invite':['invitation'],studio:['ending'],ohang:['reveal','letter']};
function solved(s,l){const d=R.initial(s,l);if(['clock','dial','overlay'].includes(s.kind))d.fields={...s.target};else if(s.kind==='route')d.path=[...s.target];else d.placements=[...s.target];d.support=[...s.support];d.exclude=s.exclude.target;d.proof=[...s.support];return d;}
let stages=0,invalid=0;
for(const id of Object.keys(R.themes))for(let l=1;l<=5;l++){
 const p=R.plan(id,l,{profile:{seed:2,companion:4}});
 const expected=id==='studio'?(l<=2?2:3):(l<=2?4:6);
 assert.equal(p.length,expected,`${id}/${l} count`);
 assert.ok(R.themes[id].opening&&R.themes[id].prop);
 assert.equal(new Set(p.map(s=>s.id)).size,p.length);
 for(const s of p){
  stages++;
  assert.equal(s.hints.length,3,`${id}/${s.id} hint steps`);
  assert.ok(s.hints.every(x=>typeof x==='string'&&x.length));
  assert.equal(s.support.length,2,`${id}/${s.id} physical evidence slots`);
  assert.equal(new Set(s.support).size,2);
  assert.ok(s.evidence.every(v=>R.titles[id][v]&&!locked[id].includes(v)),`${id}/${s.id} pre-unlock sources`);
  assert.ok(s.support.every(v=>s.evidence.includes(v)&&s.supportchoices.includes(v)));
  const d=solved(s,l);
  assert.ok(R.valid(s,d,l),`${id}/${l}/${s.id} canonical reconstruction`);
  assert.ok(!R.valid(s,{...d,version:1},l),'legacy draft must not unlock');invalid++;
  assert.ok(!R.valid(s,{},l),'empty draft must not unlock');invalid++;
  assert.ok(!R.valid(s,R.initial(s,l),l),`${id}/${l}/${s.id} no pre-solved initial state`);invalid++;
  if(['clock','dial','overlay'].includes(s.kind)){
   const key=s.fields[0].id;
   assert.ok(!R.valid(s,{...d,fields:{...d.fields,[key]:d.fields[key]+1}},l));invalid++;
   assert.ok(!R.valid(s,{...d,fields:{...d.fields,[key]:String(d.fields[key])}},l));invalid++;
   assert.ok(!R.valid(s,{...d,fields:{...d.fields,[key]:NaN}},l));invalid++;
  }else if(s.kind==='route'){
   assert.ok(!R.valid(s,{...d,path:['miru','surim']},l),'no teleport');invalid++;
   assert.ok(!R.valid(s,{...d,path:['miru','central','south','river']},l),'same totals wrong direction');invalid++;
   assert.ok(!R.valid(s,{...d,path:['miru','central','miru','central']},l),'no duplicate travel');invalid++;
  }else{
   const bad=[...d.placements];bad[0]='nonexistent';assert.ok(!R.valid(s,{...d,placements:bad},l));invalid++;
   assert.ok(!R.valid(s,{...d,placements:d.placements.slice(1)},l));invalid++;
   if(d.placements.length>1){const dup=[...d.placements];dup[1]=dup[0];assert.ok(!R.valid(s,{...d,placements:dup},l));invalid++;}
   if(s.equivalent){for(const group of s.equivalent){const eq=[...d.placements];const a=eq.indexOf(group[0]),b=eq.indexOf(group[1]);if(a>=0&&b>=0){[eq[a],eq[b]]=[eq[b],eq[a]];assert.ok(R.valid(s,{...d,placements:eq},l),'equivalent physical tokens');}}}
  }
  if(l>=4){assert.ok(!R.valid(s,{...d,support:[]},l));assert.ok(!R.valid(s,{...d,support:[s.support[0],s.support[0]]},l));assert.ok(R.valid(s,{...d,support:[...d.support].reverse()},l));invalid+=2;}
  if(l>=5){assert.ok(!R.valid(s,{...d,exclude:null},l));assert.ok(!R.valid(s,{...d,exclude:'compare'},l));assert.ok(!R.valid(s,{...d,proof:[]},l));assert.ok(!R.valid(s,{...d,proof:[s.support[0],s.support[0]]},l));invalid+=4;}
 }
 const saved={version:2,level:l,done:[0,1,3],draft:{0:solved(p[0],l),1:{version:1},99:{version:2}}};
 const restored=R.normalize(saved,l,p.length);
 assert.deepEqual(restored.done,[0,1]);assert.equal(restored.draft[0].version,2);assert.equal(restored.draft[1],undefined);assert.equal(restored.draft[99],undefined);
 assert.deepEqual(R.normalize({version:1,level:5,done:[0,1,2,3,4,5],draft:{}},l).done,[]);
}
for(let seed=0;seed<5;seed++)for(let companion=0;companion<5;companion++)for(const l of [1,3,5]){
 const p=R.plan('ohang',l,{profile:{seed,companion}});
 const cycle=p.find(s=>s.dynamic==='seed-cycle'),control=p.find(s=>s.dynamic==='companion-predecessor');
 assert.equal(cycle.target[0],['wood','fire','earth','metal','water'][seed]);
 assert.equal(control.target[0],['wood','fire','earth','metal','water'][(companion+3)%5]);
 assert.ok(R.valid(cycle,solved(cycle,l),l));assert.ok(R.valid(control,solved(control,l),l));
}
assert.deepEqual(R.plan('unknown',5),[]);
console.log(`v36 story devices: 10 themes × 5 levels, ${stages} stages, ${invalid} invalid reconstructions rejected; studio has 2/3 post-print display operations; 75 Ohang profile/level combinations passed.`);
