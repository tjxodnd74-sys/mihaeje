window.MihaejeEpisodeVersions={"apartment":"7499b8b57a41","radio":"ff22a8f6a65a","station":"ab1e80dbc596","laundry":"7af53c5576ba","letter":"a43095baccd3","pet-home":"378d5911ba58","cat-invite":"a467a613d55b"};
/* Set the surface before the first paint; covers are discovered before game JavaScript. */
(()=>{
 const q=new URLSearchParams(location.search),part=location.pathname.split('/').pop(),id=q.get('case')||(part.startsWith('studio')?'studio':part.startsWith('ohang')?'ohang':part.startsWith('case')?'garage':'hub');
 document.documentElement.dataset.theme=id;
 if(q.has('case')&&['apartment','radio','station','laundry','letter','pet-home','cat-invite'].includes(id)){
  const marker=q.get('cold')==='1'&&q.get('perf')?'?perf_cache='+encodeURIComponent(q.get('perf')):'';
  const link=document.createElement('link');link.rel='preload';link.as='image';link.imageSrcset='assets/covers/'+id+'-480-v2.webp'+marker+' 480w, assets/covers/'+id+'-960-v2.webp'+marker+' 960w, assets/covers/'+id+'-v1.webp'+marker+' 1536w';link.imageSizes='(max-width:700px) 100vw, 55vw';link.fetchPriority='high';document.head.append(link);
  const revision=window.MihaejeEpisodeVersions?.[id]||'58';
  window.MihaejeEpisodePromise=fetch('episodes/'+id+'.json?v='+revision+marker.replace('?','&')).then(r=>r.ok?r.json():null).catch(()=>null);
 }
})();

/* Opt-in, local-only measurement. No game answers or personal data are collected. */
(()=>{
 const query=new URLSearchParams(location.search),run=query.get('perf');
 if(!run||!/^[-a-z0-9]{1,60}$/i.test(run))return;
 if(window.MihaejePerfProbeReady)return;window.MihaejePerfProbeReady=true;
 const cold=query.get('cold')==='1',prefix='mih-perf-'+run+':';
 if(query.get('fresh')==='1'){
  for(const method of ['getItem','setItem','removeItem']){const original=Storage.prototype[method];Storage.prototype[method]=function(key,...args){return original.call(this,this===localStorage?prefix+key:key,...args)}}
 }
 const asset=value=>{try{const u=new URL(value,location.href);if(u.origin===location.origin&&/\.(?:js|css|json|woff2|webp|png|jpe?g|mp[34]|wav)$/i.test(u.pathname)){u.searchParams.set('perf_cache',run);return u.href}}catch{}return value};
 const clean=value=>typeof value==='string'?value.replace(/([?&])perf_cache=[^&#\s,?]*(&?)/g,(_,a,b)=>b?a:'').replace(/\?(?=\s|,|$)/g,''):value;
 if(cold){
  const set=Element.prototype.setAttribute,get=Element.prototype.getAttribute;
  const rewriteSet=value=>String(value).split(',').map(x=>x.trim().split(/\s+/).map((v,i)=>i?v:asset(v)).join(' ')).join(', ');
  Element.prototype.setAttribute=function(name,value){return set.call(this,name,(this instanceof HTMLImageElement||this instanceof HTMLMediaElement)&&name==='src'?asset(value):this instanceof HTMLImageElement&&name==='srcset'?rewriteSet(value):value)};
  Element.prototype.getAttribute=function(name){const value=get.call(this,name);return (this instanceof HTMLImageElement||this instanceof HTMLMediaElement)&&['src','srcset'].includes(name)?clean(value):value};
  for(const [type,key]of [[HTMLImageElement,'src'],[HTMLImageElement,'srcset'],[HTMLMediaElement,'src']]){const d=Object.getOwnPropertyDescriptor(type.prototype,key);if(d?.set)Object.defineProperty(type.prototype,key,{...d,get(){return clean(d.get.call(this))},set(value){d.set.call(this,key==='srcset'?rewriteSet(value):asset(value))}})}
  const fetchOriginal=window.fetch;window.fetch=(input,init)=>fetchOriginal(typeof input==='string'?asset(input):input,init);
 }
 const long=[],events=[],frames=[],shifts=[];let lcp=0,cls=0,previous=0,report;
 const watch=(type,consume,extra={})=>{try{new PerformanceObserver(list=>list.getEntries().forEach(consume)).observe({type,buffered:true,...extra})}catch{}};
 watch('largest-contentful-paint',e=>lcp=e.startTime);
 watch('layout-shift',e=>{if(!e.hadRecentInput){cls+=e.value;shifts.push({value:e.value,at:e.startTime,sources:(e.sources||[]).map(s=>({tag:s.node?.tagName,cls:s.node?.className,previous:s.previousRect.toJSON(),current:s.currentRect.toJSON()}))});if(shifts.length>30)shifts.shift()}});
 watch('longtask',e=>{long.push({ms:Math.round(e.duration),at:Math.round(e.startTime)});if(long.length>100)long.shift()});
 watch('event',e=>{if(e.interactionId){events.push({name:e.name,ms:e.duration,delay:Math.round(e.processingStart-e.startTime)});if(events.length>100)events.shift()}},{durationThreshold:16});
 function frame(now){if(previous&&!document.hidden&&now-previous>50){frames.push(Math.round(now-previous));if(frames.length>100)frames.shift()}previous=document.hidden?0:now;requestAnimationFrame(frame)}requestAnimationFrame(frame);
 function publish(){if(!report){if(!document.body)return;report=document.createElement('output');report.id='perfReport';report.hidden=true;document.body.append(report)}
  const n=performance.getEntriesByType('navigation')[0],resources=performance.getEntriesByType('resource');
  report.textContent=JSON.stringify({run,cold,width:innerWidth,ttfb:n?Math.round(n.responseStart-n.requestStart):null,dcl:n?Math.round(n.domContentLoadedEventEnd):null,load:n?Math.round(n.loadEventEnd):null,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0,lcp,cls,long,shifts,events,frames,resources:resources.map(e=>({url:e.name.replace(location.origin,''),type:e.initiatorType,ms:Math.round(e.duration),bytes:e.transferSize,body:e.decodedBodySize})),images:Array.from(document.images).filter(i=>i.getBoundingClientRect().height>0).map(i=>({src:i.currentSrc.replace(location.origin,''),width:i.naturalWidth,complete:i.complete})),overflow:document.documentElement.scrollWidth>innerWidth});
 }
 let epoch=0;
 function settled(){const current=++epoch;report?.setAttribute('data-ready','false');setTimeout(async()=>{
  await Promise.race([document.fonts?.ready||Promise.resolve(),new Promise(resolve=>setTimeout(resolve,5000))]);
  const images=Array.from(document.images).filter(i=>{const r=i.getBoundingClientRect();return r.width&&r.height&&r.top<innerHeight+200&&!i.complete});
  await Promise.all(images.map(i=>new Promise(resolve=>{i.addEventListener('load',resolve,{once:true});i.addEventListener('error',resolve,{once:true});setTimeout(resolve,5000)})));
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(current===epoch){publish();report?.setAttribute('data-ready','true')}}));
 },300)}
 setInterval(publish,1000);document.addEventListener('DOMContentLoaded',publish,{once:true});window.addEventListener('load',settled,{once:true});document.addEventListener('click',settled,true);
})();
