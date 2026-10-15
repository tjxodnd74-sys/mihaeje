import assert from 'node:assert/strict';
import {initial,normalize,apply,filmCorrect} from '../web/studio-rules.js';
const permutations=xs=>xs.length?xs.flatMap(x=>permutations(xs.filter(y=>y!==x)).map(p=>[x,...p])):[[]];
const s=initial();
for(const action of [{type:'drawer',cell:'C3'},{type:'film'},{type:'enter'},{type:'expose'},{type:'bath',color:'red'},{type:'frame'}])assert(!apply(s,action).ok);
assert(apply(s,{type:'tilt',angle:20}).ok);assert.equal(s.step,0);
apply(s,{type:'tilt',angle:35});assert.equal(s.step,1);
assert(!apply(s,{type:'drawer',cell:'A1'}).ok);apply(s,{type:'drawer',cell:'C3'});
let solutions=0;
for(const order of permutations(['a','b','c','d']))for(let mask=0;mask<16;mask++)for(let frame=1;frame<=24;frame++){
 const candidate={...s,filmOrder:order,frame,flips:Object.fromEntries(['a','b','c','d'].map((id,i)=>[id,Boolean(mask&(1<<i))]))};
 if(filmCorrect(candidate)){solutions++;assert.equal(order.join(''),'abcd');assert.equal(mask,0);assert.equal(frame,23)}
}
assert.equal(solutions,1);
Object.assign(s,{filmOrder:['a','b','c','d'],flips:{a:false,b:false,c:false,d:false},frame:23});apply(s,{type:'film'});apply(s,{type:'enter'});
Object.assign(s,{size:'8×10',focus:65,exposure:12});assert(!apply(s,{type:'expose'}).ok);s.white=false;s.red=true;
let exposureSolutions=0;
for(const size of ['5×7','8×10','11×14'])for(let focus=0;focus<=100;focus+=5)for(let exposure=1;exposure<=20;exposure++){
 const candidate=structuredClone(s);Object.assign(candidate,{size,focus,exposure});if(apply(candidate,{type:'expose'}).ok)exposureSolutions++;
}
assert.equal(exposureSolutions,3);const beforePrepare=structuredClone(s);assert(apply(s,{type:'prepare'}).ok);assert.deepEqual(s,beforePrepare);apply(s,{type:'expose'});
for(const order of permutations(['red','yellow','blue'])){const candidate=structuredClone(s);for(const color of order)apply(candidate,{type:'bath',color});assert.equal(candidate.step===5,order.join()==='red,yellow,blue')}
apply(s,{type:'bath',color:'red'});s.notes='인화는 같이 해요';s.focus=65;
assert.deepEqual(normalize(JSON.parse(JSON.stringify(s))),s);
assert.deepEqual(normalize({...s,baths:['red','wrong','blue']}).baths,['red']);
apply(s,{type:'bath',color:'yellow'});apply(s,{type:'bath',color:'blue'});assert(!apply(s,{type:'frame'}).ok);
s.read.push('portrait-back');assert(apply(s,{type:'frame'}).ok);assert(normalize(s).escape.escaped);
console.log('Photo studio: unique film among 9216 combinations, one size/time with a tolerant focus zone among 1260 combinations, sequential gates, chemical order and partial save passed');
