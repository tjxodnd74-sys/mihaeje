(()=>{const $=id=>document.getElementById(id),R=window.MihaejeStoryDevices,E=window.MihaejeAdventure;let state,config;
 const names={garage:'마지막 정비소',apartment:'404호의 불빛',radio:'끝나지 않은 방송',station:'세 번째 승강장',laundry:'자정의 무인 세탁소',letter:'반송된 편지','pet-home':'첫 번째 보호자','cat-invite':'고양이의 초대장',studio:'비가 그친 사진관',ohang:'돌아오는 계절'};
 for(const [id,name]of Object.entries(names)){const option=document.createElement('option');option.value=id;option.textContent=name;$('fixtureCase').append(option);}
 function reset(){const id=$('fixtureCase').value,index=Number($('fixtureStage').value)||0;state={started:true,orientation:38,challenge:{level:window.MihaejePlay.levels[id]},escape:{opened:true,place40:index+1},read:Object.keys(R.titles[id]),profile:{seed:2,companion:4},adventure:{version:2,revision:38,layout40:true,done:Array.from({length:index},(_,i)=>i),draft:{}}};if(id==='ohang')state.nativePlace40=index+1;document.documentElement.dataset.theme=id;history.replaceState(null,"","/mechanics-preview?case="+id);
  config={id,state,save(){const stage=state.adventure?.draft[index];$('fixtureStatus').textContent='保存 · '+(stage?.mechanic62?'새 장치 상태 저장됨':'기존 장치 상태 저장됨');},onPass(){ $('fixtureStatus').textContent='선택한 장치 이후 단계로 연결됨';},onCancel(){}};
  E.bindRecords(id,{docs:()=>state.read.map(key=>({id:key,title:R.titles[id][key]})),available:()=>true,openRecord(key){$('fixtureStatus').textContent='검사용 원본 입구 · '+R.titles[id][key];}});
 }
 function stages(){const id=$('fixtureCase').value;const plan=R.plan(id,window.MihaejePlay.levels[id],{profile:{seed:2,companion:4}});$('fixtureStage').replaceChildren();plan.forEach((s,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=s.id+' · '+s.title;$('fixtureStage').append(option)});reset();}
 $('fixtureCase').onchange=stages;$('fixtureStage').onchange=reset;$('fixtureOpen').onclick=()=>{window.QaStage77={config,state};E.ensure(config);window.AttachQa77?.()};stages();
})();
