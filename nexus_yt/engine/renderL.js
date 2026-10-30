const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
const FPS=+process.env.FPS||30; const D=require(process.env.LINESJSON||'./draft.json'); const DUR=Math.max(...D.lines.map(l=>l[1]))+3.0;
const F0=+process.argv[2]||0, F1=Math.min(+(process.argv[3]||1e9),Math.ceil(FPS*DUR)); const out=path.join(__dirname,`lseg_${String(F0).padStart(5,'0')}.mp4`);
(async()=>{
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-',
  '-vf','format=yuv420p','-r',String(FPS),'-c:v','libx264','-preset','fast','-crf','17',out],{cwd:__dirname});
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('file://'+path.join(__dirname,'ep.html'));await p.evaluate(()=>document.fonts.ready);await p.evaluate(L=>{window.LINES=L;},D.lines);await p.waitForTimeout(200);
 const t0=Date.now();
 for(let f=F0;f<F1;f++){await p.evaluate(t=>window.seek(t),f/FPS);const buf=await p.screenshot({type:'jpeg',quality:95});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done',F0,F1,((Date.now()-t0)/1000/(F1-F0)).toFixed(3),'s/f');})();
