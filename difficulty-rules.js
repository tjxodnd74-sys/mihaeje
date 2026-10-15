/* Original level-specific clue designs; old in-progress locks keep their original rules. */
(()=>{
 const clone=v=>JSON.parse(JSON.stringify(v));
 const permute=a=>a.length?a.flatMap((v,i)=>permute(a.filter((_,j)=>j!==i)).map(p=>[v,...p])):[[]];
 function uniqueOrders(values){return [...new Map(permute(values).map(a=>[a.join('|'),a])).values()]}
 function tier(game){return Math.max(1,Math.min(5,game.challenge?.level||2))}
 function entrance(id,base,game){
  if(game.challenge?.version!==2)return base;
  const level=tier(game),t=clone(base),source=base.marks.slice().sort((a,b)=>a.rank-b.rank).map(m=>m.token),all=uniqueOrders(source),answer=all[(level-1)%all.length];
  t.marks=answer.map((token,i)=>({token,rank:i+1}));t.level=level;t.answer=answer;t.variant=true;
  const letters=answer.map((_,i)=>String.fromCharCode(65+i));
  const layout=answer.length===3?[1,0,2]:[2,0,3,1];t.labels=letters;t.layout=layout;
  // Attach the same answer symbols to shuffled named tags; labels never change meaning within a playthrough.
  t.legend=letters.map((label,i)=>({label,token:answer[layout.indexOf(i)]}));
  const name=i=>letters[i];
  t.constraints=answer.length===3?[
   name(0)+'는 가운데에 있습니다',name(1)+'은 '+name(2)+'보다 앞입니다'
  ]:[name(layout[1])+'는 양 끝이 아닙니다',name(layout[3])+'는 '+name(layout[2])+'보다 뒤입니다',name(layout[0])+'는 '+name(layout[1])+'보다 앞입니다',name(layout[2])+'는 '+name(layout[1])+' 바로 옆입니다',name(layout[3])+'는 '+name(layout[1])+' 바로 옆이 아닙니다'];
  t.rule=level===1?'왼쪽부터 보이는 표식을 그대로 입력하세요':level===2?'태그 번호가 작은 순서대로 표식을 입력하세요':level===3?'연결 조각을 START부터 END까지 이어 읽으세요':level===4?'작업 메모로 태그 순서를 추론한 뒤 대응하는 표식을 입력하세요':'두 자료를 대조하세요 태그 순서를 추론하고 뒷면 해독표의 표식을 입력합니다';
  t.chain=answer.map((token,i)=>({token,from:i===0?'START':letters[i-1],to:i===answer.length-1?'END':letters[i]}));
  // Level 5 requires both a layout and a front/back coordinate transform.
  t.backLegend=t.legend.map(v=>({label:v.label,front:base.tokens[(base.tokens.indexOf(v.token)+1)%base.tokens.length],back:v.token}));
  t.hints=[level<=2?'읽는 기준부터 확인하세요 위치와 태그 번호는 다를 수 있습니다':level===3?'START에 들어오는 조각은 하나뿐입니다 그 조각의 출구 표시를 찾아 이어보세요':'가운데에 놓이는 태그부터 가정하고 앞뒤·이웃 조건을 함께 적용하세요',level<=3?'최종 입력은 '+answer.join(' → '):'태그 순서는 '+layout.map(name).join(' → ')+(level===5?'이며 앞면이 아니라 뒷면 해독표를 씁니다':'입니다'),'입력할 표식: '+answer.join(' → ')];
  return t;
 }
 function pack(id,level,base){
  const p=clone(base),k=level-1;
  p.tagIndex=(base.tagIndex+k)%4;p.notches=(base.notches+k)%3+1;
  p.layout=base.layout.map(v=>(v+k)%4);
  const perms=permute([0,1,2,3]);p.order=perms[(Object.keys(window.MihaejeChallengeRules.packs).indexOf(id)*3+k*5)%24];
  p.turn=(base.turn+k)%4;p.mirror=level>=4?!base.mirror:base.mirror;
  if(p.turn===0)p.mirror=true; // Every fresh spatial puzzle needs at least one deliberate action.
  p.size=level>=4?4:3;p.pattern=level>=4?[0,2,5]:[0,1,5];
  p.glyphs=Array.from((base.glyphs.join('')+'山雨月水火木金土日').slice(0,p.size*p.size));
  p.variantLevel=level;return p;
 }
 function transform(points,turn,mirror,size=3){return points.map(i=>{let r=Math.floor(i/size),c=i%size;for(let n=0;n<turn;n++)[r,c]=[c,size-1-r];if(mirror)c=size-1-c;return r*size+c}).sort((a,b)=>a-b)}
 function constraints(p){const [a,b,c,d]=p.layout;return [p.things[b]+'은 양 끝에 놓지 않았습니다',p.things[d]+'은 '+p.things[c]+'보다 오른쪽입니다',p.things[a]+'은 '+p.things[b]+'보다 왼쪽입니다',p.things[c]+'은 '+p.things[b]+'과 이웃합니다',p.things[d]+'은 '+p.things[b]+'과 이웃하지 않습니다']}
 window.MihaejeDifficulty={entrance,pack,transform,constraints,uniqueOrders,tier};
})();
