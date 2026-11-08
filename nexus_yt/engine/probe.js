// Mascot: 넥서스 펭귄 (img/peng.png). API: makeProbe(id), probeFace(el,{expr,t,talk,cue})
// Motion rule (2026-11-08): calm, narration-driven. No constant hopping/shaking.
//  - idle: slow breathing only
//  - talk: small soft nod while a line is spoken
//  - cue (0..1): leans toward the content when a new element appears on screen
//  - expr changes ease in/out once (wow = small lift, happy = one small hop, think/wink = gentle tilt)
// Optional pose files img/peng_<expr>.png (happy, wow, think, wink, angry) are used when present.
function makeProbe(id){const d=document.createElement('div');d.className='probe';d.id=id;
 const im=document.createElement('img');im.src='img/peng.png';im.style.transformOrigin='50% 100%';d.appendChild(im);d._im=im;d._cur='';return d;}
const _PENG_POSES={};
const _pc=v=>Math.max(0,Math.min(1,v)),_po=v=>1-Math.pow(1-_pc(v),3),_pio=v=>{v=_pc(v);return v<.5?4*v*v*v:1-Math.pow(-2*v+2,3)/2;};
function _pose(ex,et){// returns [y,rot] contribution of an expression, et = seconds since it started
 if(ex==='wow'){const k=Math.sin(Math.PI*_pc(et/0.5));return [-14*k,0];}
 if(ex==='happy'){const k=Math.sin(Math.PI*_pc(et/0.45));return [-10*k,0];}
 if(ex==='think')return [2*_po(et/0.45),-5*_po(et/0.45)];
 if(ex==='wink')return [0,4*_po(et/0.4)];
 if(ex==='angry')return [0,3*_po(et/0.4)];
 return [0,0];}
function probeFace(el,o){const t=o.t||0,ex=o.expr||'idle';
 const want=['happy','wow','think','wink','angry'].includes(ex)?ex:'idle';
 if(el._cur!==want){el._cur=want;const src=want==='idle'?'img/peng.png':'img/peng_'+want+'.png';
  if(_PENG_POSES[src]===undefined){const tst=new Image();tst.onload=()=>{_PENG_POSES[src]=true;};tst.onerror=()=>{_PENG_POSES[src]=false;};tst.src=src;}
  el._im.src=_PENG_POSES[src]?src:'img/peng.png';}
 if(el._ex!==ex){el._pex=el._ex||'idle';el._pt0=el._t0||t;el._t0=t;el._ex=ex;el._sw=t;}
 const et=Math.max(0,t-el._t0);
 // blend previous held pose out over 0.35s so nothing snaps
 const out=1-_pio((t-el._sw)/0.35);
 const [y1,r1]=_pose(ex,et),[y0,r0]=_pose(el._pex||'idle',t-(el._pt0||t));
 const hold=v=>v;// tilt poses hold; lift poses already return to 0
 let y=y1+(['think','wink','angry'].includes(el._pex)?y0*out:0);
 let rot=r1+(['think','wink','angry'].includes(el._pex)?hold(r0)*out:0);
 let sx=1,sy=1;
 const br=Math.sin(t*1.9);sy+=br*0.008;sx-=br*0.004;           // breathing
 if(o.talk){const n=0.5-0.5*Math.cos(t*6.2);y-=n*3;rot+=Math.sin(t*3.1)*0.8;}  // soft nod
 const c=o.cue||0;rot-=c*5;y-=c*4;                                // lean toward the new content (left)
 el._im.style.transform='translateY('+y.toFixed(1)+'px) rotate('+rot.toFixed(2)+'deg) scale('+sx.toFixed(3)+','+sy.toFixed(3)+')';}
