const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/mihaeje/nexus_yt/assets/logos/si/';
const T=[['openai','#111111','#FFFFFF'],['google','#FFFFFF','#4285F4']];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:300,height:300}});
for(const [n,bg,fg] of T){let s=fs.readFileSync(D+n+'.svg','utf8').replace('<svg','<svg fill="'+fg+'" style="width:170px;height:170px"');
await p.setContent(`<html><body style="margin:0;background:transparent"><div id=t style="width:300px;height:300px;border-radius:70px;background:${bg};display:flex;align-items:center;justify-content:center">${s}</div></body></html>`);
await p.locator('#t').screenshot({path:'lg/'+n+'.png',omitBackground:true});}
await b.close();})();
