// Mascot: 넥서스 펭귄 (img/peng.png). Same API as old Probe: makeProbe(id), probeFace(el,{expr,t,talk})
// Optional pose files img/peng_<expr>.png (happy, wow, think) are used when present.
function makeProbe(id){const d=document.createElement('div');d.className='probe';d.id=id;
 const im=document.createElement('img');im.src='img/peng.png';im.style.transformOrigin='50% 100%';d.appendChild(im);d._im=im;d._cur='';return d;}
const _PENG_POSES={};
function probeFace(el,o){const t=o.t||0,ex=o.expr||'idle';
 const want=['happy','wow','think','wink','angry'].includes(ex)?ex:'idle';
 if(el._cur!==want){el._cur=want;const src=want==='idle'?'img/peng.png':'img/peng_'+want+'.png';
  if(_PENG_POSES[src]===undefined){const tst=new Image();tst.onload=()=>{_PENG_POSES[src]=true;};tst.onerror=()=>{_PENG_POSES[src]=false;};tst.src=src;}
  el._im.src=_PENG_POSES[src]?src:'img/peng.png';}
 const talk=o.talk?Math.abs(Math.sin(t*9))*0.035:0;const breathe=Math.sin(t*2.2)*0.012;
 const pop=ex==='wow'?0.04:0;
 el._im.style.transform=`scale(${(1+breathe+pop).toFixed(3)},${(1-talk+breathe+pop).toFixed(3)})`;}
