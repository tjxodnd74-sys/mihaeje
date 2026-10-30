const {chromium}=require('playwright');const D=require(process.env.LINESJSON||"./draft.json");
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/ep.html');await p.evaluate(()=>document.fonts.ready);await p.evaluate(L=>{window.LINES=L;},D.lines);
for(const t of process.argv.slice(2)){await p.evaluate(t=>window.seek(+t),t);await p.screenshot({path:`l_${t}.png`});}
await b.close();})();
