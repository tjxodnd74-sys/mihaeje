const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});await p.goto('file://'+__dirname+'/logo.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
await p.evaluate(()=>{for(const e of document.querySelectorAll('.L')){const i=e.querySelector('.in');let s=parseFloat(getComputedStyle(e).fontSize);while(i.getBoundingClientRect().width>1200&&s>40){s-=4;e.style.fontSize=s+'px'}}});
await p.screenshot({path:__dirname+'/thumb4.png'});await b.close();})();
