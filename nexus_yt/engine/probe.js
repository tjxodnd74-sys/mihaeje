// Mascot: 넥서스 펭귄 (img/peng.png). Same API as old Probe: makeProbe(id), probeFace(el,{expr,t,talk})
// Optional pose files img/peng_<expr>.png (happy, wow, think, wink, angry) are used when present.
function makeProbe(id){const d=document.createElement('div');d.className='probe';d.id=id;
 const im=document.createElement('img');im.src='img/peng.png';im.style.transformOrigin='50% 100%';d.appendChild(im);d._im=im;d._cur='';return d;}
const _PENG_POSES={};
function probeFace(el,o){const t=o.t||0,ex=o.expr||'idle';
 const want=['happy','wow','think','wink','angry'].includes(ex)?ex:'idle';
 if(el._cur!==want){el._cur=want;const src=want==='idle'?'img/peng.png':'img/peng_'+want+'.png';
  if(_PENG_POSES[src]===undefined){const tst=new Image();tst.onload=()=>{_PENG_POSES[src]=true;};tst.onerror=()=>{_PENG_POSES[src]=false;};tst.src=src;}
  el._im.src=_PENG_POSES[src]?src:'img/peng.png';}
 // lively motion: talking hop + squash/stretch, lean, expression reactions
 if(el._t0===undefined||el._ex!==ex){el._t0=t;el._ex=ex;}
 const et=Math.max(0,t-el._t0);
 let y=0,rot=Math.sin(t*1.7)*3,sx=1,sy=1;
 if(o.talk){const ph=(t*2.6)%1;const hop=Math.sin(Math.PI*Math.min(1,ph/0.55));y-=hop*14;
  const land=(ph>0.55&&ph<0.72)?Math.sin(Math.PI*(ph-0.55)/0.17):0;sx+=land*0.07-hop*0.02;sy+=-land*0.07+hop*0.03;rot+=Math.sin(t*5.2)*2.5;}
 else{const b=Math.sin(t*2.2);sy+=b*0.015;sx-=b*0.01;}
 if(ex==='wow'&&et<0.7){const k=Math.sin(Math.PI*Math.min(1,et/0.5));y-=k*60;sy+=k*0.08;sx-=k*0.05;rot+=Math.sin(et*30)*6*(1-et/0.7);}
 if(ex==='happy'&&et<1.2){y-=Math.abs(Math.sin(et*9))*22*(1-et/1.2);}
 if(ex==='think'){rot-=8;y+=4;}
 if(ex==='angry'){rot+=Math.sin(t*40)*3;}
 if(ex==='wink'&&et<0.5){rot+=12*Math.sin(Math.PI*et/0.5);}
 el._im.style.transform='translateY('+y.toFixed(1)+'px) rotate('+rot.toFixed(2)+'deg) scale('+sx.toFixed(3)+','+sy.toFixed(3)+')';}
