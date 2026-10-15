import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {createRequire} from 'node:module';import {birthProfile,ending,ELEMENTS} from '../web/ohang-rules.js';
const require=createRequire(import.meta.url),{Solar}=require('../web/vendor/lunar-1.7.7.js');
const input={year:2000,month:1,day:7,hour:12,minute:0},p=birthProfile(input,Solar);assert.equal(p.pillars[2].text,'갑자');assert.equal(p.total,8);assert.equal(p.seed,0);
const unknown=birthProfile({...input,hour:null},Solar);assert.equal(unknown.total,6);assert.equal(unknown.pillars[3].text,'미확정');assert(!JSON.stringify(p).includes('birthDate'));assert(!('year' in p));
for(const bad of [{...input,month:2,day:30},{...input,hour:24},{...input,year:1899},{...input,year:NaN},{...input,minute:60}])assert.throws(()=>birthProfile(bad,Solar));
const before=birthProfile({year:2000,month:2,day:4,hour:21,minute:40},Solar),after=birthProfile({year:2000,month:2,day:4,hour:21,minute:41},Solar);assert.notEqual(before.pillars[0].text,after.pillars[0].text);assert.notEqual(before.pillars[1].text,after.pillars[1].text);assert.equal(before.pillars[2].text,after.pillars[2].text);
const boundaryUnknown=birthProfile({year:2000,month:2,day:4,hour:null},Solar);assert.equal(boundaryUnknown.ambiguous,true);assert.equal(boundaryUnknown.pillars[0].text,'미확정');assert.equal(boundaryUnknown.pillars[1].text,'미확정');assert.equal(boundaryUnknown.total,2);
assert.equal(birthProfile({...input,hour:23,minute:59},Solar).pillars[2].text,p.pillars[2].text);assert.notEqual(birthProfile({...input,day:8,hour:0},Solar).pillars[2].text,p.pillars[2].text);assert.notEqual(birthProfile({...input,hour:3},Solar).pillars[3].text,p.pillars[3].text);
for(const date of [{year:1995,month:6,day:15,hour:14,minute:30},{year:2000,month:2,day:29,hour:0,minute:0},{year:1987,month:8,day:1,hour:9,minute:30}]){const q=birthProfile(date,Solar);assert.equal(q.total,8);assert(q.counts.every(Number.isInteger))}
const results=new Set;for(let seed=0;seed<5;seed++)for(const tone of ['keep','release','share'])for(const gift of ['plant','light','rest','ring','flow']){const e=ending({...p,seed},[tone,gift]);results.add(e.id);assert(e.body.length>70);assert.equal(e.tone,tone)}assert.equal(results.size,75);
for(const tone of ['keep','release','share'])assert.equal(ending({...p,seed:4},[tone,'light']).promise,ending(p,[tone,'light']).promise);
console.log('Birth: known 甲子 reference, KST solar-term year/month boundary, unknown time ambiguity, midnight convention, invalid dates and 75 symbolic/choice combinations passed');
// Inspect actual challenge gates through a small DOM sink, independently enumerate each logic constraint.
class Node{constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.dataset={};this.style={};this.className='';this.textContent=''}append(...ns){this.children.push(...ns)}replaceChildren(...ns){this.children=ns}setAttribute(k,v){this.attrs[k]=v}replaceWith(){}querySelectorAll(tag){return flatten(this).filter(n=>n.tag===tag)}}
const flatten=n=>n.children.flatMap(c=>c&&typeof c==='object'?[c,...flatten(c)]:[]);let shown,passed=0;
const ctx={window:{MihaejeOverlay:{show:o=>shown=o,close(){}},MihaejeAudio:{play(){}}},document:{createElement:t=>new Node(t)}};vm.createContext(ctx);for(const f of ['challenge-rules.js','challenges.js'])vm.runInContext(fs.readFileSync('web/'+f,'utf8'),ctx);const R=ctx.window.MihaejeChallengeRules,C=ctx.window.MihaejeChallenges;
const permutations=xs=>xs.length?xs.flatMap(x=>permutations(xs.filter(y=>y!==x)).map(p=>[x,...p])):[[]];
for(const [id,pack]of Object.entries(R.packs)){
 const observations=R.observeCandidates(id);const valid=observations.filter(c=>c.shape==='원'&&c.notches===pack.notches&&c.back==='실선');assert.equal(valid.length,1);assert.equal(observations.indexOf(valid[0]),pack.tagIndex);
 const placements=permutations([0,1,2,3]).filter(a=>{const [left,mid,near,right]=pack.layout,p=v=>a.indexOf(v);return p(mid)!==0&&p(mid)!==3&&p(right)>p(near)&&p(left)<p(mid)&&Math.abs(p(near)-p(mid))===1&&Math.abs(p(right)-p(mid))!==1});assert.equal(placements.length,1);assert.equal(placements[0].join(),pack.layout.join());
 assert.equal(new Set(Array.from({length:8},(_,i)=>R.transform(R.pattern,i%4,i>=4).join())).size,8);
 for(let level=1;level<=5;level++){
  let state={challenge:{level},started:true,unlocked:false,solved:false};let completes=0,saves=0;const options=()=>({id,state,save:()=>saves++,onPass:()=>completes++});C.ensure(options());
  for(let stage=1;stage<=level;stage++){
   assert.equal(shown.node.dataset.challengeStage,stage);let buttons=flatten(shown.node).filter(n=>n.tag==='button'),confirm=buttons.find(n=>n.textContent==='봉인 확인');confirm.onclick();assert.equal(completes,0,'Wrong/empty answer bypassed '+id+'/'+stage);
   const mech=pack.plan[stage-1];Object.assign(state.challenge.draft[stage],mech===1?{choice:pack.tagIndex}:mech===2?{order:[0,1,2,3]}:mech===3?{slots:[...pack.layout]}:mech===4?{turn:pack.turn,mirror:pack.mirror}:{metapick:pack.layout[0],metaCode:R.metaCode(id)});
   // Reload after every partial edit; use actual normalized restored state.
   state=JSON.parse(JSON.stringify(state));C.ensure(options());confirm=flatten(shown.node).find(n=>n.tag==='button'&&n.textContent==='봉인 확인');confirm.onclick();assert.equal(completes,stage===level?1:0);passed++;
  }assert.equal(state.challenge.passed.length,level);assert(saves>level);
 }
 for(const old of [{unlocked:true},{solved:true}]){let bypass=0;C.ensure({id,state:{...old},save(){},onPass:()=>bypass++});assert.equal(bypass,1)}
 const damaged=R.normalize({level:9,passed:[1,1,6,'2'],draft:{}},id);assert.equal(damaged.level,R.defaults[id]);assert.equal(damaged.passed.join(),'1');
}
const cases=JSON.parse(fs.readFileSync('web/cases.json'));assert.equal(cases.length,10);assert(cases.every(c=>R.packs[c.id]));assert(cases.every(c=>c.difficultyLevel>=1&&c.difficultyLevel<=5));const collections=JSON.parse(fs.readFileSync('web/collections.json'));assert.equal(collections.assignments.ohang.categoryId,'heartwarming');
console.log('Ten themed packs × five levels: '+passed+' sequential stage passes with partial reload, wrong-answer rejection, unique placements and eight distinct spatial transforms; existing unlocked saves bypass new seals');
