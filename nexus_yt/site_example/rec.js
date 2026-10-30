const {chromium}=require('playwright');const {spawn}=require('child_process');
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
async function clip(b,name,{w=1440,h=900,dpr=1,url,dur,fn}){
 const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:dpr});
 await p.goto('file://'+__dirname+'/'+url);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 await p.addStyleTag({content:'html{scroll-behavior:auto!important}::-webkit-scrollbar{display:none}'});
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-vf','format=yuv420p','-c:v','libx264','-crf','16','-r','30',__dirname+'/'+name+'.mp4']);
 const N=Math.round(dur*30);const st={};
 for(let f=0;f<N;f++){const t=f/30;await fn(p,t,st);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));await p.close();console.log('ok',name);}
const sc=(p,y)=>p.evaluate(y=>window.scrollTo(0,y),y);
const H=(p)=>p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
const top=(p,sel)=>p.evaluate(s=>document.querySelector(s).getBoundingClientRect().top+scrollY-80,sel);
const cls=(p,c,on)=>p.evaluate(([c,on])=>{if(document.body.classList.contains(c)!==on)document.body.classList.toggle(c,on);},[c,on]);
(async()=>{const b=await chromium.launch();
 const only=process.argv[2];
 const J={
 v1:{url:'v1.html',dur:4,fn:async(p,t)=>{await sc(p,0);}},
 v2:{url:'v2.html',dur:10,fn:async(p,t,s)=>{s.H=s.H||await H(p);await sc(p,s.H*ease(Math.min(1,Math.max(0,(t-1)/8))));}},
 price:{url:'v2.html',dur:5,fn:async(p,t,s)=>{s.y=s.y||await top(p,'#items')+230;await sc(p,s.y);await cls(p,'s-price',t>=1.5);}},
 warm:{url:'v2.html',dur:5,fn:async(p,t,s)=>{await cls(p,'s-price',true);await sc(p,0);await cls(p,'s-warm',t>=1.5);}},
 form:{url:'v2.html',dur:7,fn:async(p,t,s)=>{await cls(p,'s-price',true);await cls(p,'s-warm',true);await cls(p,'s-form',true);s.y=s.y||await top(p,'#book');await sc(p,s.y);
   const nm='김봄날',ph='010-1234-5678';await p.evaluate(([a,b])=>{const i=document.querySelectorAll('.form input');i[0].value=a;i[1].value=b;},[nm.slice(0,Math.floor(Math.max(0,t-0.5)*4)),ph.slice(0,Math.floor(Math.max(0,t-1.5)*9))]);
   if(t>=4.2&&!s.cl){s.cl=1;await p.click('.form button');}}},
 mobile:{w:390,h:844,dpr:2,url:'v2.html',dur:9,fn:async(p,t,s)=>{await cls(p,'s-price',true);await cls(p,'s-warm',true);s.H=s.H||await H(p);await sc(p,s.H*ease(Math.min(1,Math.max(0,(t-0.8)/7.5))));}},
 final:{url:'v2.html',dur:7,fn:async(p,t,s)=>{await cls(p,'s-price',true);await cls(p,'s-warm',true);s.H=s.H||await H(p);await sc(p,s.H*0.62*ease(Math.min(1,t/6.5)));}},
 };
 for(const [k,v] of Object.entries(J)){if(only&&only!==k)continue;await clip(b,k,v);}
 await b.close();})();
