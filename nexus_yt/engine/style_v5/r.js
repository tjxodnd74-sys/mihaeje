const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+__dirname+'/demo.html');await p.evaluate(()=>document.fonts.ready);
const fs=require('fs');fs.mkdirSync('f',{recursive:true});const N=Math.round(15.5*30);
for(let i=0;i<N;i++){await p.evaluate(t=>seek(t),i/30);await p.screenshot({path:`f/${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:90});}
await b.close();})();
