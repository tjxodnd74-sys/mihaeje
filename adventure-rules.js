(()=>{
 const clamp=v=>Math.max(1,Math.min(5,Math.floor(Number(v)||2)));
 const stages=level=>clamp(level)+1;
 function normalize(raw,level){const l=clamp(raw?.level??level),n=stages(l);return {version:1,level:l,done:[...new Set((Array.isArray(raw?.done)?raw.done:[]).filter(v=>Number.isInteger(v)&&v>=0&&v<n))],draft:raw?.draft&&typeof raw.draft==='object'?raw.draft:{}}}
 function spec(kind,level,index=0){const l=clamp(level),size=l<3?2:3,count=size*size;return {kind,level:l,size,count,wires:l<3?3:4,map:l<3?[2,0,1]:[2,0,3,1],lightCount:l<3?3:5,frequency:94+index*3+l,tolerance:l===1?1:0,weight:l<3?6:7,goal:24,walls:l<3?[2,11,12,17,22]:[1,2,3,4,10,11,12,15,16,17,18,21,22],rotation:[0,0,0]}}
 function valid(s,d){if(!d||typeof d!=='object')return false;
  if(s.kind==='wire')return Array.isArray(d.links)&&d.links.length===s.wires&&d.links.every((v,i)=>v===s.map[i]);
  if(s.kind==='light')return Array.isArray(d.found)&&new Set(d.found.filter(v=>Number.isInteger(v)&&v>=0&&v<s.lightCount)).size===s.lightCount;
  if(s.kind==='tiles')return Array.isArray(d.tiles)&&d.tiles.length===s.count&&d.tiles.every((v,i)=>v===i)&&(!d.turns||d.turns.every(v=>v===0));
  if(s.kind==='tune')return Number.isFinite(d.frequency)&&Math.abs(d.frequency-s.frequency)<=s.tolerance;
  if(s.kind==='align')return Number.isFinite(d.x)&&Number.isFinite(d.y)&&Math.abs(d.x-50)<= (s.level===1?6:2)&&Math.abs(d.y-50)<=(s.level===1?6:2);
  if(s.kind==='rings')return Array.isArray(d.rings)&&d.rings.length===3&&d.rings.every(v=>v===0);
  if(s.kind==='path')return d.position===s.goal&&Array.isArray(d.trail)&&d.trail[0]===0&&d.trail.at(-1)===s.goal&&d.trail.every((v,i)=>Number.isInteger(v)&&v>=0&&v<25&&!s.walls.includes(v)&&(!i||adjacent(d.trail[i-1],v)));
  if(s.kind==='balance'){if(!Array.isArray(d.pans)||d.pans.length!==5||d.pans.some(v=>![0,1,2].includes(v)))return false;const sums=[0,0];d.pans.forEach((p,i)=>{if(p)sums[p-1]+=i+1});return sums.every(v=>v===s.weight)}return false;
 }
 function adjacent(a,b){return Math.abs(Math.floor(a/5)-Math.floor(b/5))+Math.abs(a%5-b%5)===1}
 function move(s,d,delta){const p=d.position??0,next=p+delta;if(next<0||next>=25||s.walls.includes(next)||!adjacent(p,next))return false;d.trail=Array.isArray(d.trail)?d.trail:[0];d.trail.push(next);d.position=next;return true}
 window.MihaejeAdventureRules={clamp,stages,normalize,spec,valid,move,adjacent};
})();
