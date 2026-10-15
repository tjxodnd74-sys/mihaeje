const games=new Set(['garage','apartment','radio','station','laundry','letter','pet-home','cat-invite','studio','ohang']);
const topics=new Set(['navigation','puzzle','story','readability','sound','bug','other']);
/* MEDIA_SIZES */const mediaSizes={"/assets/dashcam-v36.mp4":269370,"/assets/endings/garage-film-v42.mp4":1033302,"/assets/music/apartment-v33.mp3":1401233,"/assets/music/cat-invite-v33.mp3":1241121,"/assets/music/garage-v33.mp3":1401263,"/assets/music/hub-v33.mp3":441245,"/assets/music/laundry-v33.mp3":1401258,"/assets/music/letter-v33.mp3":921115,"/assets/music/ohang-v33.mp3":1401246,"/assets/music/pet-home-v33.mp3":1401233,"/assets/music/radio-v33.mp3":1161179,"/assets/music/station-v33.mp3":1401249,"/assets/music/studio-v33.mp3":920834,"/assets/sounds/door-close-v24.wav":31696,"/assets/sounds/door-creak-close-v24.wav":55424,"/assets/sounds/door-creak-v23.wav":67228,"/assets/sounds/door-open-v23.wav":35368,"/assets/sounds/drawer-open-v23.wav":41914,"/assets/sounds/keys-v24.wav":13238,"/assets/sounds/lock-v24.wav":30850,"/assets/sounds/paper-turn-alt-v23.mp3":12811,"/assets/sounds/paper-turn-v23.wav":33756,"/assets/sounds/switch-off-v24.wav":12296,"/assets/sounds/switch-on-v24.wav":9656};
function exactStream(body,length){return body&&typeof FixedLengthStream==='function'?body.pipeThrough(new FixedLengthStream(length)):body;}
function interval(value,size){const m=/^bytes=(\d*)-(\d*)$/.exec(value||'');if(!m||(!m[1]&&!m[2]))return null;let start,end;if(!m[1]){const tail=Number(m[2]);if(!Number.isSafeInteger(tail)||tail<=0)return false;start=Math.max(0,size-tail);end=size-1}else{start=Number(m[1]);end=m[2]?Number(m[2]):size-1;if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||end<start)return false;end=Math.min(end,size-1)}return[start,end];}
async function mediaAsset(request,env,path){
 const size=mediaSizes[path];if(!size||!['GET','HEAD'].includes(request.method))return env.ASSETS.fetch(request);
 const h=new Headers(request.headers);h.delete('range');h.delete('if-range');h.set('accept-encoding','identity');
 const source=await env.ASSETS.fetch(new Request(request,{headers:h}));if(source.status!==200)return source;
 const headers=new Headers(source.headers);headers.set('Accept-Ranges','bytes');headers.set('Content-Length',String(size));
 if(request.method==='HEAD'){await source.body?.cancel();return new Response(null,{status:200,headers});}
 let range=interval(request.headers.get('range'),size);const validator=request.headers.get('if-range');
 if(validator){const modified=Date.parse(source.headers.get('last-modified')||''),date=Date.parse(validator);if(validator!==source.headers.get('etag')&&!(Number.isFinite(date)&&Number.isFinite(modified)&&modified<=date))range=null;}
 if(range===false){await source.body?.cancel();headers.set('Content-Range','bytes */'+size);headers.set('Content-Length','0');return new Response(null,{status:416,headers});}
 if(!range||!source.body)return new Response(exactStream(source.body,size),{status:200,headers});
 const[start,end]=range,reader=source.body.getReader();let offset=0;
 const body=new ReadableStream({async pull(controller){try{while(true){const {value,done}=await reader.read();if(done){controller.error(Error('Incomplete media asset'));return}const base=offset;offset+=value.byteLength;if(offset<=start)continue;const slice=value.subarray(Math.max(0,start-base),Math.min(value.byteLength,end-base+1));if(slice.length)controller.enqueue(slice);if(offset>end){controller.close();await reader.cancel().catch(()=>{});}return}}catch(error){controller.error(error)}},cancel(reason){return reader.cancel(reason)}});
 headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(end-start+1));
 return new Response(exactStream(body,end-start+1),{status:206,headers});
}
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{...headers,'Content-Type':'application/json;charset=utf-8',...extra}});
const email=request=>(request.headers.get('oai-authenticated-user-email')||'').trim().toLowerCase();
const owner=(request,env)=>!!env.FEEDBACK_OWNER_EMAIL&&email(request)===env.FEEDBACK_OWNER_EMAIL.trim().toLowerCase();
const html=(body,status=200)=>new Response(body,{status,headers:{...headers,'Content-Type':'text/html;charset=utf-8','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"}});
const sameOrigin=request=>request.headers.get('Origin')===new URL(request.url).origin;
// A query-only probe makes repeatable cold-cache QA possible without changing visitors' saves.
async function performanceAsset(request,env,url){
 const result=await env.ASSETS.fetch(request),run=url.searchParams.get('perf')||url.searchParams.get('perf_cache');
 if(!run||!/^[-a-z0-9]{1,60}$/i.test(run)||result.status!==200)return result;
 const type=result.headers.get('content-type')||'',cold=url.searchParams.get('cold')==='1'||url.searchParams.has('perf_cache');
 if(!type.includes('text/html')&&!type.includes('text/css'))return result;
 const suffix='perf_cache='+encodeURIComponent(run),asset=value=>value.replace(/((?:\/?assets\/|[a-z0-9_.-]+\/)?[a-z0-9_./-]+\.(?:js|css|woff2|webp|png|jpe?g))(\?[^\s"'<>),]*)?/gi,(all,path,q)=>path+(q?q+'&':'?')+suffix);
 let body=await result.text();
 if(cold)body=type.includes('text/css')?body.replace(/url\(([^)]+)\)/g,(all,v)=>'url('+asset(v)+')'):body.replace(/(?:src|srcset|href)="[^"]*"/g,all=>asset(all));
 if(type.includes('text/html'))body=body.replace('</head>','<script src="/perf-probe.js?'+suffix+'"></script></head>');
 const h=new Headers(result.headers);for(const key of ['content-length','content-encoding','etag'])h.delete(key);h.set('cache-control','private, no-store');
 return new Response(body,{status:result.status,headers:h});
}
const adminPage=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>제작자 피드백함 · 미해제</title><style>body{margin:0;background:#17251e;color:#fff3de;font:16px/1.8 system-ui,sans-serif}main{max-width:1000px;margin:auto;padding:36px 20px}h1{font-size:28px}article{background:#f4ecd8;color:#30271d;padding:22px;margin:16px 0;border:1px solid #bba88a}p{white-space:pre-wrap;overflow-wrap:anywhere}small{color:#5d4a32}button,select{font:inherit;padding:10px 16px;background:#f4ecd8;color:#30271d;border:1px solid #ab9775}a{color:#f2d5a1}.reviewed{opacity:.8}nav{display:flex;gap:12px;flex-wrap:wrap}*{box-sizing:border-box}nav{align-items:end;gap:16px}nav label{display:flex;flex-direction:column;gap:8px}button,select,a{min-height:44px}h2{font-size:22px;line-height:1.5}button:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #e8ce99;outline-offset:3px}@media(max-width:600px){main{padding:24px 16px}nav label,nav select{width:100%}article{padding:20px 16px}h1{font-size:26px}}
</style></head><body><main><h1>제작자 피드백함</h1><p>작성한 의견은 사이트 소유자 계정으로만 열람할 수 있습니다.</p><nav><label>플레이한 게임 <select id="game"><option value="">전체</option></select></label><button id="refresh">새로고침</button><a href="/">게임으로 돌아가기</a></nav><p id="status" role="status"></p><section id="feedback"></section><button id="more" hidden>다음 의견 보기</button></main><script src="/feedback-admin.js?v=44"></script></body></html>`;
async function submit(request,env){
 if(!sameOrigin(request)||!request.headers.get('content-type')?.includes('application/json'))return json({error:'잘못된 요청입니다'},403);
 const raw=await request.text();if(raw.length>8000)return json({error:'내용이 너무 깁니다'},413);
 let d;try{d=JSON.parse(raw)}catch{return json({error:'의견을 다시 확인해주세요'},400)}
 if(d.website)return json({error:'요청을 확인할 수 없습니다'},400);
 const note=typeof d.notes==='string'?d.notes.trim():'';
 if(!games.has(d.game)||!topics.has(d.topic)||!['pc','phone','tablet'].includes(d.device)||note.length<3||note.length>2000)return json({error:'테마·기기·의견을 고르고 내용을 3자 이상 적어주세요'},400);
 const rating=v=>v===''||v==null?null:Number.isInteger(Number(v))&&Number(v)>=1&&Number(v)<=5?Number(v):undefined;
 const flow=rating(d.flow),clue=rating(d.clue),replay=d.replay||null;if(flow===undefined||clue===undefined||replay&&!['yes','maybe','no'].includes(replay))return json({error:'평가 항목을 다시 확인해주세요'},400);
 const cookie=/\bmih_beta=([a-f0-9-]{36})\b/.exec(request.headers.get('cookie')||'')?.[1]||crypto.randomUUID();
 const client=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(cookie)))).map(n=>n.toString(16).padStart(2,'0')).join('');
 const count=await env.DB.prepare('SELECT COUNT(*) AS n FROM beta_feedback WHERE client_key=? AND created_at>?').bind(client,new Date(Date.now()-3600000).toISOString()).first();
 if(count.n>=8)return json({error:'의견을 받았습니다 잠시 뒤 추가 의견을 보내주세요'},429);
 const id=crypto.randomUUID(),created=new Date().toISOString(),scene=typeof d.scene==='string'?d.scene.slice(0,160):'';
 await env.DB.prepare('INSERT INTO beta_feedback (id,created_at,game,device,topic,note,flow,clue,replay,scene,client_key) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id,created,d.game,d.device,d.topic,note,flow,clue,replay,scene,client).run();
 return json({ok:true,id},201,{'Set-Cookie':`mih_beta=${cookie}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`});
}
export default {async fetch(request,env){const url=new URL(request.url),path=url.pathname;
 try{
  if(path.startsWith('/perf/')&&request.method==='GET'){
   url.pathname=path.slice(5).replace(/\.html$/,'')||'/';
   return await performanceAsset(new Request(url,request),env,url);
  }
  if(path==='/api/feedback-access'&&request.method==='GET')return json({owner:owner(request,env)});
  if(path==='/api/feedback'&&request.method==='POST')return await submit(request,env);
  if(path==='/api/admin/feedback'){
   if(!owner(request,env))return json({error:'사이트 소유자만 열람할 수 있습니다'},403);
   if(request.method==='GET'){const offset=Math.min(10000,Math.max(0,Number(url.searchParams.get('offset'))||0)),game=url.searchParams.get('game');const where=games.has(game)?' WHERE game=?':'';const args=where?[game,51,offset]:[51,offset];const result=await env.DB.prepare('SELECT id,created_at,game,device,topic,note,flow,clue,replay,scene,reviewed FROM beta_feedback'+where+' ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(...args).all();return json({rows:result.results.slice(0,50),next:result.results.length>50?offset+50:null});}
   if(request.method==='PATCH'){if(!sameOrigin(request))return json({error:'잘못된 요청입니다'},403);const raw=await request.text();if(raw.length>300)return json({error:'잘못된 요청입니다'},400);const d=JSON.parse(raw);if(!/^[a-f0-9-]{36}$/.test(d.id)||typeof d.reviewed!=='boolean')return json({error:'잘못된 요청입니다'},400);await env.DB.prepare('UPDATE beta_feedback SET reviewed=? WHERE id=?').bind(d.reviewed?1:0,d.id).run();return json({ok:true});}
   return json({error:'지원하지 않는 요청입니다'},405);
  }
  if(path==='/feedback-admin'||path==='/feedback-admin/'){
   if(!email(request))return new Response(null,{status:302,headers:{...headers,Location:'/signin-with-chatgpt?return_to=%2Ffeedback-admin'}});
   if(!owner(request,env))return html('<html lang="ko"><meta charset="utf-8"><p>사이트 소유자만 피드백을 볼 수 있습니다.</p><a href="/">게임으로 돌아가기</a></html>',403);
   return html(adminPage);
  }
  if(path.startsWith('/api/')||path.startsWith('/server/')||path.startsWith('/.openai/'))return json({error:'찾을 수 없습니다'},404);
  if(path.startsWith('/media/')){const assetPath=path.slice(6);if(!mediaSizes[assetPath])return json({error:'찾을 수 없습니다'},404);url.pathname=assetPath;return await mediaAsset(new Request(url,request),env,assetPath);}
  if(url.searchParams.has('perf')||url.searchParams.has('perf_cache'))return await performanceAsset(request,env,url);
  return await mediaAsset(request,env,path);
 }catch{return json({error:'지금은 요청을 완료하지 못했습니다 작성한 내용은 보관됩니다 잠시 뒤 다시 시도해주세요'},503)}
}};
