(()=>{
 const key='mihaeje-effects-v1';let enabled=false,context,master,serial=0,active=null,paperIndex=0,lastPaper=0,physicalUntil=0;
 try{enabled=localStorage.getItem(key)==='on'}catch{}
 const supported=!!(window.AudioContext||window.webkitAudioContext),toggle=document.createElement('button'),buffers=new Map(),loading=new Map();
 const theme=new URLSearchParams(location.search).get('case')||'garage';
 const gentle=['pet-home','cat-invite','letter','laundry'].includes(theme)||location.pathname.includes('studio')||location.pathname.includes('ohang');
 const files={paper:['paper-turn-v23.wav','paper-turn-alt-v23.mp3'],drawer:['drawer-open-v23.wav'],door:[gentle?'door-open-v23.wav':'door-creak-v23.wav'],doorClose:[gentle?'door-close-v24.wav':'door-creak-close-v24.wav'],keys:['keys-v24.wav'],switchOn:['switch-on-v24.wav'],switchOff:['switch-off-v24.wav'],lock:['lock-v24.wav']};
 toggle.type='button';toggle.className='sound-toggle';toggle.id='soundToggle';toggle.disabled=!supported;toggle.dataset.soundEdition='recorded-v24';
 function label(){toggle.textContent=supported?(enabled?'효과음 끄기':'효과음 켜기'):'효과음 미지원';toggle.setAttribute('aria-label',toggle.textContent);toggle.setAttribute('aria-pressed',String(enabled));toggle.title='문·종이·서랍의 실제 녹음 소리';}
 function engine(){if(!enabled||!supported||document.hidden)return null;try{if(!context){context=new(window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=.5;master.connect(context.destination)}return context}catch{return null}}
 function load(ctx,file){if(buffers.has(file))return Promise.resolve(buffers.get(file));if(!loading.has(file))loading.set(file,fetch('/media/assets/sounds/'+file).then(r=>{if(!r.ok)throw Error('sound');return r.arrayBuffer()}).then(bytes=>ctx.decodeAudioData(bytes)).then(buffer=>{buffers.set(file,buffer);loading.delete(file);toggle.dataset.audioReady=String(buffers.size);return buffer}).catch(()=>{loading.delete(file);return null}));return loading.get(file)}
 function stop(){serial++;if(active){try{active.source.stop()}catch{}active=null}}
 async function play(type){
  // Ordinary clicks and answer feedback stay silent; only physical actions play.
  if(!files[type])return;const ctx=engine();if(!ctx)return;
  const now=Date.now();if(type==='paper'){if(now<physicalUntil||now-lastPaper<280)return;lastPaper=now}else physicalUntil=now+1100;
  const file=files[type][type==='paper'?paperIndex++%2:0],request=++serial;
  try{if(ctx.state!=='running')await ctx.resume();const buffer=await load(ctx,file);if(request!==serial||!buffer||!enabled||document.hidden||ctx.state!=='running')return;
   if(active){try{active.source.stop()}catch{}active=null}
   const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;
   const data=buffer.getChannelData(0);let sum=0,peak=0;for(const v of data){sum+=v*v;peak=Math.max(peak,Math.abs(v))}const rms=Math.sqrt(sum/data.length);
   gain.gain.value=Math.min((type==='paper'?.035:type==='drawer'?.055:['keys','switchOn','switchOff','lock'].includes(type)?.035:.06)/Math.max(rms,.001),.55/Math.max(peak,.001));
   source.connect(gain);gain.connect(master);active={source};toggle.dataset.lastEffect=type;toggle.dataset.lastFile=file;source.onended=()=>{if(active?.source===source)active=null;source.disconnect();gain.disconnect()};source.start();document.dispatchEvent(new CustomEvent('mihaeje:effect',{detail:{type,duration:buffer.duration}}));
  }catch{}
 }
 toggle.onclick=()=>{enabled=!enabled;try{localStorage.setItem(key,enabled?'on':'off')}catch{}label();if(enabled){const ctx=engine();ctx?.resume().catch(()=>{});if(ctx)for(const file of Object.values(files).flat())load(ctx,file)}else stop()};label();document.querySelector('header')?.append(toggle);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();context?.suspend().catch(()=>{})}});
 // A restored preference alone cannot unlock iPhone Web Audio. Resume directly
 // from a trusted tap, before asynchronous fetching or a physical action handler.
 function unlock(e){if(!e.isTrusted||e.target.closest?.('#soundToggle'))return;if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;const ctx=engine();if(ctx&&ctx.state!=='running')ctx.resume().catch(()=>{});}
 document.addEventListener('click',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.matches('.keepsake.ticket,.keepsake.receipt'))play('paper')});
 window.MihaejeAudio={play};
})();
