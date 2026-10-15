const id=new URLSearchParams(location.search).get('case')||'garage',stageIndex=Number(new URLSearchParams(location.search).get('stage')||0);document.documentElement.dataset.theme=id;
const state={started:true,orientation:38,escape:{opened:true,place40:1},adventure:{done:[]},profile:{seed:2,companion:4},choices:['keep','plant']};
if(new URLSearchParams(location.search).get('native')==='1')state.step=5;
const R=window.MihaejeStoryDevices,H=window.MihaejeHints,plan=R.plan(id,window.MihaejePlay.levels[id],state),names=Object.fromEntries(Object.entries(window.MihaejeRecordHints[id].records).map(([key,value])=>[key,value.title]));
H.configure({id,state:()=>state,save(){},docs:()=>Object.entries(names).map(([id,title])=>({id,title})),allowed:()=>true,openRecord:record,puzzles:()=>plan.map((s,i)=>({code:H.code('S',i+1),label:s.title,steps:s.hints,allowed:()=>i===stageIndex,returnTo:parent}))});
function parent(){const n=document.createElement('article');const p=document.createElement('p');p.textContent='물건 안에서 자료를 꺼냅니다.';const b=document.createElement('button');b.textContent='자료 꺼내기';b.onclick=()=>record(Object.keys(names)[0]);n.append(p,b);window.MihaejeOverlay.show({key:'qa-parent',title:'물건 살펴보기',node:n});}
function record(key){const n=document.createElement('article');n.textContent=names[key];H.badge(n,H.code('D',Object.keys(names).indexOf(key)+1));window.MihaejeOverlay.show({key:'qa-record',title:names[key],node:n});}
document.getElementById('qaParent').onclick=parent;document.getElementById('qaHint').onclick=()=>H.open(H.code('S',stageIndex+1));
