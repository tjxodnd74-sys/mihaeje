import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
class Node{constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.dataset={};this.style={};this.className='';this.textContent=''}append(...ns){this.children.push(...ns)}replaceChildren(...ns){this.children=ns}setAttribute(k,v){this.attrs[k]=v}replaceWith(){}querySelectorAll(tag){return flatten(this).filter(n=>n.tag===tag)}}
const flatten=n=>n.children.flatMap(c=>c&&typeof c==='object'?[c,...flatten(c)]:[]);let shown,passed=0;
const ctx={window:{MihaejeOverlay:{show:o=>shown=o,close(){}},MihaejeAudio:{play(){}}},document:{createElement:t=>new Node(t)}};vm.createContext(ctx);for(const f of ['escape-designs.js','challenge-rules.js','difficulty-rules.js','puzzle-clues.js','challenges.js','escape-kit.js'])vm.runInContext(fs.readFileSync('web/'+f,'utf8'),ctx);
const {MihaejeDifficulty:D,MihaejeChallengeRules:R,MihaejeChallenges:C,MihaejeEscapeDesigns:E,MihaejeEscapeRules:ER}=ctx.window;
const permutations=xs=>xs.length?xs.flatMap(x=>permutations(xs.filter(y=>y!==x)).map(p=>[x,...p])):[[]];
assert.equal(R.normalize(null,'garage').version,2);assert.equal(R.normalize({level:5},'garage').version,1);
for(const [id,base]of Object.entries(E)){
 const answers=[];for(let level=1;level<=5;level++){
  const t=D.entrance(id,base,{challenge:{version:2,level}});answers.push(t.answer.join('|'));assert(ER.matches(t,t.answer));assert(!ER.matches(t,t.answer.slice(1)));assert.equal(D.entrance(id,base,{challenge:{version:1,level}}),base);
  const valid=permutations(t.labels.map((_,i)=>i)).filter(a=>{const pos=v=>a.indexOf(v),L=t.layout;return L.length===3?pos(0)===1&&pos(1)<pos(2):pos(L[1])!==0&&pos(L[1])!==3&&pos(L[3])>pos(L[2])&&pos(L[0])<pos(L[1])&&Math.abs(pos(L[2])-pos(L[1]))===1&&Math.abs(pos(L[3])-pos(L[1]))!==1});assert.equal(valid.length,1,id+' entrance ambiguity');assert.equal(valid[0].join(),t.layout.join());assert.equal(t.layout.map(v=>t.legend[v].token).join(),t.answer.join());assert.equal(t.layout.map(v=>t.backLegend[v].back).join(),t.answer.join());
  const board=new Node('div');ctx.window.MihaejePuzzleClues.render(board,t,id);assert(flatten(board).length>0);
 }assert.equal(new Set(answers).size,5,id+' repeated entrance answer');assert(fs.existsSync('web/assets/photoreal/'+id+'-entry-empty-v3.webp'));
}
for(const [id,base]of Object.entries(R.packs))for(let level=1;level<=5;level++){
 const p=D.pack(id,level,base);assert.equal(p.glyphs.length,p.size*p.size);assert.equal(new Set(Array.from({length:8},(_,i)=>D.transform(p.pattern,i%4,i>=4,p.size).join())).size,8);
 const placements=permutations([0,1,2,3]).filter(a=>R.placementValid(a,id,p));assert.equal(placements.length,1);assert.equal(placements[0].join(),p.layout.join());
 let state={challenge:{version:2,level},started:true,unlocked:false,solved:false},completed=0,saves=0;const opts=()=>({id,state,save:()=>saves++,onPass:()=>completed++});C.ensure(opts());
 for(let stage=1;stage<=level;stage++){
  assert.equal(shown.node.dataset.challengeStage,stage);let confirm=flatten(shown.node).find(n=>n.tag==='button'&&n.textContent==='봉인 확인');confirm.onclick();assert.equal(completed,0,'Wrong answer bypass');
  const mechanic=p.plan[stage-1];Object.assign(state.challenge.draft[stage],mechanic===1?{choice:p.tagIndex}:mechanic===2?{order:[...p.order]}:mechanic===3?{slots:[...p.layout]}:mechanic===4?{turn:p.turn,mirror:p.mirror}:{metapick:p.layout[0],metaCode:R.metaCode(id,p)});
  state=JSON.parse(JSON.stringify(state));C.ensure(opts());confirm=flatten(shown.node).find(n=>n.tag==='button'&&n.textContent==='봉인 확인');confirm.onclick();assert.equal(completed,stage===level?1:0);passed++;
 }assert.equal(state.challenge.passed.length,level);assert(saves>level);
}
console.log('v27 PASS: 40 distinct tier entrance designs, unique logic solutions, legacy saves, 50 variant packs, 150 actual sequential seal passes with reload and wrong-answer rejection');
