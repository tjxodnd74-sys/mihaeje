// usage: node mk.js bg.png out.png "tag" "line1 html" "line2 html"
const {chromium}=require('playwright');const path=require('path');
(async()=>{const [bg,out,tag,l1,l2]=process.argv.slice(2);
const html=`<!doctype html><meta charset=utf-8><link rel=stylesheet href="file://${__dirname}/base.css"><link rel=stylesheet href="file://${__dirname}/v2.css">
<div id=t><img class=bg src="file://${path.resolve(bg)}"><div class=fade></div>${tag?`<div class=tag>${tag}</div>`:''}<div class=brand>넥서스 AI</div>
<div class="L L1"><span class=in>${l1}</span></div><div class="L L2"><span class=in>${l2}</span></div></div>`;
require('fs').writeFileSync(__dirname+'/_'+path.basename(out)+'.html',html);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});await p.goto('file://'+__dirname+'/_'+path.basename(out)+'.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
// auto-shrink lines that overflow
await p.evaluate(()=>{for(const e of document.querySelectorAll('.L')){const i=e.querySelector('.in');let s=parseFloat(getComputedStyle(e).fontSize);while(i.getBoundingClientRect().width>1200&&s>40){s-=4;e.style.fontSize=s+'px'}}});
await p.screenshot({path:out});await b.close();})();
