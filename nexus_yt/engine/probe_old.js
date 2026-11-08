// Probe mascot: <div class="probe"> with img + svg face. Call probeFace(el,{expr,t,talk,look})
function makeProbe(id){const d=document.createElement('div');d.className='probe';d.id=id;
 d.innerHTML=`<img src="img/probe.png"><svg viewBox="0 0 490 464" style="position:absolute;left:${194/868*100}%;top:${104/818*100}%;width:${490/868*100}%;height:${464/818*100}%;overflow:visible">
 <defs><filter id="gl_${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
 <g filter="url(#gl_${id})" fill="#FF9A3C" stroke="#FF9A3C" stroke-linecap="round">
  <g class="eL"></g><g class="eR"></g><g class="mo"></g><g class="fx"></g></g></svg>`;return d;}
function probeFace(el,o){const t=o.t||0,ex=o.expr||'idle',look=o.look||[0,0];
 const blink=(()=>{const p=(t+ (o.seed||0))%3.7;return p<0.12?Math.abs(Math.sin(p/0.12*Math.PI)):0;})();
 const L=el.querySelector('.eL'),R=el.querySelector('.eR'),M=el.querySelector('.mo'),F=el.querySelector('.fx');
 const cx=[160,330],cy=200,lx=look[0]*28,ly=look[1]*22;
 const pill=(x,y,w,h)=>`<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${Math.max(6,h)}" rx="${w/2}" stroke="none"/>`;
 let eye=(x)=>pill(x+lx,cy+ly,62,130*(1-0.92*blink));
 if(ex==='happy') eye=(x)=>`<path d="M${x-48+lx} ${cy+22} Q${x+lx} ${cy-50} ${x+48+lx} ${cy+22}" fill="none" stroke-width="26"/>`;
 if(ex==='wow') eye=(x)=>`<circle cx="${x+lx}" cy="${cy+ly}" r="${58*(1-0.9*blink)+4}" stroke="none"/>`;
 if(ex==='think') eye=(x)=>pill(x+22,cy-24,56,104*(1-0.92*blink));
 if(ex==='angry') eye=(x)=>`<path d="M${x-40} ${cy-30+(x<245?-14:14)} L${x+40} ${cy-30+(x<245?14:-14)}" stroke-width="22"/>`+pill(x,cy+26,58,80*(1-0.9*blink));
 if(ex==='wink') eye=(x)=>x<245?`<path d="M${x-44} ${cy+6} Q${x} ${cy-34} ${x+44} ${cy+6}" fill="none" stroke-width="24"/>`:pill(x,cy,62,130*(1-0.92*blink));
 L.innerHTML=eye(cx[0]);R.innerHTML=eye(cx[1]);
 let m;const tk=o.talk?Math.abs(Math.sin(t*17))*(0.5+0.5*Math.abs(Math.sin(t*5.3))):0;
 if(ex==='wow') m=`<ellipse cx="245" cy="345" rx="30" ry="36" stroke="none"/>`;
 else if(o.talk) m=`<ellipse cx="245" cy="${342}" rx="${44-10*tk}" ry="${6+26*tk}" stroke="none"/>`;
 else if(ex==='think') m=`<path d="M215 350 L275 342" stroke-width="16"/>`;
 else if(ex==='angry') m=`<path d="M205 360 Q245 330 285 360" fill="none" stroke-width="16"/>`;
 else m=`<path d="M200 330 Q245 ${ex==='happy'?385:368} 290 330" fill="none" stroke-width="18"/>`;
 M.innerHTML=m;
 F.innerHTML=ex==='think'?`<text x="420" y="${60+Math.sin(t*3)*6}" font-size="110" font-weight="900" font-family="P" stroke="none" text-anchor="middle">?</text>`:(ex==='wow'?`<text x="430" y="70" font-size="110" font-weight="900" font-family="P" stroke="none" text-anchor="middle">!</text>`:'');
}
