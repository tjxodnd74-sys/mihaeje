const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 const timers=new Map();let sequence=0;const names=['garage','apartment','radio','station','laundry','letter','pet-home','cat-invite'];
 const window={MihaejePlaces:{photos:{},data:Object.fromEntries(names.map(n=>[n,Array.from({length:4},()=>[''])]))},MihaejeResponsive:{apply(){return true}}};
 const box={innerWidth:1280,innerHeight:720,window,Promise,setTimeout(fn,ms){assert.equal(ms,5000);const id=++sequence;timers.set(id,fn);return id},clearTimeout(id){timers.delete(id)}};
 vm.createContext(box);vm.runInContext(fs.readFileSync('web/scene-layout-v44.js','utf8'),box);
 const scene=()=>{const classes=new Set();return{style:{setProperty(k,v){this[k]=v}},classList:{add:v=>classes.add(v),remove:v=>classes.delete(v)},setAttribute(k,v){this[k]=v},classes}};
 const image={dataset:{},style:{},complete:false,naturalWidth:0,getAttribute(k){return this[k]||''},decode(){return Promise.resolve()}};
 const first=scene(),second=scene();let finishOld;image.decode=()=>new Promise(r=>finishOld=r);
 window.MihaejeScene.image(image,first,{src:'assets/photoreal/garage-entry-v37.webp'},'first');image.onload();
 window.MihaejeScene.image(image,second,{src:'assets/photoreal/garage-inner-v37.webp'},'second');finishOld();await Promise.resolve();await Promise.resolve();
 assert.equal(second['aria-busy'],'true','a late decode from the previous place must not unlock the new image');
 assert.equal(timers.size,1,'changing scenes must cancel the previous deadline');
 [...timers.values()][0]();assert.equal(second['aria-busy'],'false','a pending decode must not permanently block the game');
 window.MihaejeScene.image(image,second,{src:'assets/photoreal/garage-entry-v37.webp'},'failed');image.onerror();assert.equal(second['aria-busy'],'false');assert.equal(timers.size,0);
 image.complete=true;image.naturalWidth=960;image.decode=()=>Promise.reject(new Error('decode failed'));
 window.MihaejeScene.image(image,second,{src:'assets/photoreal/garage-entry-v37.webp'},'cached');await Promise.resolve();await Promise.resolve();assert.equal(second['aria-busy'],'false');assert.equal(timers.size,0);
 console.log('PASS scene loading: stale decode, changed place, network error, rejected decode and bounded pending decode all preserve playable controls.');
})();

