const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');const fs=require('fs');
const dir=process.argv[2];const out=process.argv[3];const S=JSON.parse(fs.readFileSync(path.join(dir,'S.json')));const FPS=30;
const F0=+(process.argv[4]||0),F1=Math.min(+(process.argv[5]||1e9),Math.ceil(S.dur*FPS));
(async()=>{
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-vf','format=yuv420p','-c:v','libx264','-preset','fast','-crf','18',out]);
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
 await p.goto('file://'+path.join(__dirname,'short.html'));await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(S=>window.setup(S),S);await p.waitForTimeout(300);
 for(let f=F0;f<F1;f++){await p.evaluate(t=>window.seek(t),f/FPS);const buf=await p.screenshot({type:'jpeg',quality:93});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done',out);})();
