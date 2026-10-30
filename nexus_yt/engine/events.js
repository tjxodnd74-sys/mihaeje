const {chromium}=require('playwright');const D=require(process.env.LINESJSON||'./draft.json');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+__dirname+'/ep.html');await p.evaluate(L=>{window.LINES=L;},D.lines);
const E=await p.evaluate(()=>window.getEvents());require('fs').writeFileSync(__dirname+'/events.json',JSON.stringify(E));console.log(E.length);await b.close();})();
