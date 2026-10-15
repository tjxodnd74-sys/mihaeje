const fs=require('fs'),assert=require('assert/strict'),vm=require('vm');
const j=require('../web/journeys-v37.js');
assert.equal(Object.keys(j.data).length,8);assert.equal(new Set(Object.values(j.data).map(t=>t.mode)).size,8);
class N{constructor(tag){this.tagName=tag;this.children=[];this.attrs={};this.dataset={};this.className='';this.classList={add(){}};this.style={};this.value='';this.disabled=false}append(...a){this.children.push(...a)}replaceChildren(...a){this.children=a}setAttribute(k,v){this.attrs[k]=v}querySelector(selector){return scan(this).find(n=>n.tagName===selector)}focus(){}}
const scan=n=>n.children.flatMap(x=>[x,...scan(x)]);let current,closed=0;
const context={window:{MihaejeOverlay:{show(o){current=o.node},close(){closed++}}},document:{createElement:t=>new N(t)}};vm.runInNewContext(fs.readFileSync('web/journeys-v37.js','utf8'),context);
for(const id of Object.keys(j.data)){
 const d={step:0};assert(!j.advance(id,d,'fake'));assert(!j.advance(id,d,j.orders[id][2]));assert.equal(d.step,0);for(const action of j.orders[id])assert(j.advance(id,d,action));assert(j.complete(id,d));assert(!j.advance(id,d,j.orders[id][0]));
 const state={read:[],unlocked:true},config={id,state,save(){},onDone(){state.done=true}};assert(context.window.MihaejeJourneys.finish(config));
 for(let i=0;i<j.orders[id].length;i++){const slider=scan(current).find(n=>n.tagName==='input');const b=scan(current).find(n=>n.className.startsWith('journey-act '));assert(b);assert(!state.done);if(slider){assert(b.disabled);slider.value='100';slider.oninput();assert(!b.disabled)}const corners=scan(current).filter(n=>n.className==='journey-blanket-corner');if(corners.length){assert(b.disabled);corners.forEach(n=>n.onclick());assert(!b.disabled)}b.onclick();assert.equal(state.journeyFinish.step,i+1);context.window.MihaejeJourneys.finish(config);assert.equal(state.journeyFinish.step,i+1,'reload retains action progress')}
 assert(!state.done);scan(current).find(n=>n.className==='journey-primary').onclick();assert(state.done);assert.equal(state.sceneEnding.choice,0);
 for(const area of ['entry','entry-empty','inner'])assert(fs.existsSync('web/assets/photoreal/'+id+'-'+area+'-v37.webp'));
}
assert.equal(closed,8);console.log('PASS 8 unique physical finale modes, sequential action gates, slider gates, save/reload, callback and 24 scene assets');
