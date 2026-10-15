const fs=require('node:fs');
function edit(file,pairs){let s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');for(const [a,b]of pairs){if(!s.includes(a))throw Error('Missing fragment '+file+' '+a.slice(0,70));s=s.replace(a,b)}fs.writeFileSync(file,s)}
edit('web/escape-kit.js',[
 ["get keyName(){return this.theme.warm?'집으로 돌아가는 열쇠':'출입문 열쇠'}","get journey(){return window.MihaejeJourneys?.data[this.config.id]}\n get keyName(){return this.journey?.final||'출입문 열쇠'}\n scenePhoto(area){return this.journey?'assets/photoreal/'+this.config.id+'-'+(area===1?'inner-v37':this.state.inventory.includes('tool')?'entry-empty-v37':'entry-v37')+'.webp':'assets/photoreal/'+this.config.id+'-'+(area===1?'inner-v2':this.state.inventory.includes('tool')?'entry-empty-v3':'entry-v2')+'.webp'}"],
 ["let dirty=false;if(this.lastSolved", "const j=this.journey;let dirty=false;if(this.lastSolved"],
 ["this.message='열쇠를 얻었습니다 소지품에서 열쇠를 선택해 출입문에 사용하세요'","this.message=j?'마지막 기록을 확인했습니다 '+j.final+'에 손길을 남겨주세요':'열쇠를 얻었습니다 소지품에서 열쇠를 선택해 출입문에 사용하세요'"],
 ["if(this.game.solved&&!s.escaped&&!s.inventory.includes('exit-key'))","if(j&&s.inventory.includes('exit-key')){s.inventory=s.inventory.filter(v=>v!=='exit-key');s.selection=s.selection.filter(v=>v!=='exit-key');dirty=true}if(!j&&this.game.solved&&!s.escaped&&!s.inventory.includes('exit-key'))"],
 ["if(s.escaped)this.message='문이 열렸습니다'","if(s.escaped)this.message=j?'이야기 속 마지막 손길을 남겼습니다':'문이 열렸습니다'"],
 ["(s.area===0?'입구':'안쪽 공간')","(j?(s.area===0?j.entry:j.inside):(s.area===0?'입구':'안쪽 공간'))"],
 ["s.area===0?t.entry:t.inside","s.area===0?(j?.entry||t.entry):(j?.inside||t.inside)"],
 ["s.area===0?'안쪽 공간으로 →':'← 입구로'","s.area===0?(j?.move||'안쪽 공간으로 →'):(j?.back||'← 입구로')"],
 ["this.notify('입구의 장치를 먼저 풀어야 다음 공간이 열립니다')","this.notify(j?j.opening:'입구의 장치를 먼저 풀어야 다음 공간이 열립니다')"],
 ["window.MihaejeAudio?.play(s.area===0?'doorClose':'door')","window.MihaejeAudio?.play(j?j.sound:s.area===0?'doorClose':'door')"],
 ["['구역 열기',s.opened]","[j?.transition||'구역 열기',s.opened]"],
 ["['마지막 선택',this.game.solved],['문 열기',s.escaped]","['이야기 확인',this.game.unlocked], [j?.finish||'문 열기',s.escaped]"],
 ["img.src='assets/photoreal/'+id+'-'+(s.area?'inner-v2':s.inventory.includes('tool')?'entry-empty-v3':'entry-v2')+'.webp'","img.src=this.scenePhoto(s.area);scene.dataset.journeyView=j?.transition||''"],
 ["{name:'입구 안내'","{name:j?'지금 할 일':'입구 안내'"],
 ["name:s.opened?'다음 공간으로':'구역 잠금'","name:s.opened?(j?.move||'다음 공간으로'):(j?.goal||'구역 잠금')"],
 ["window.MihaejeAudio?.play('door');this.save()","window.MihaejeAudio?.play(j?.sound||'door');this.save()"],
 ["(t.groupLabels?.[0]||'책상')","(j?.groups[0]||t.groupLabels?.[0]||'책상')"],
 ["(t.groupLabels?.[1]||'벽면 기록')","(j?.groups[1]||t.groupLabels?.[1]||'벽면 기록')"],
 ["(t.groupLabels?.[2]||'서가')","(j?.groups[2]||t.groupLabels?.[2]||'서가')"],
 ["name:s.escaped?'열린 출입문':'출입문'","name:j?(s.escaped?'남긴 이야기 다시 보기':j.final):(s.escaped?'열린 출입문':'출입문')"],
 ["const positions=window.MihaejeRoomPhotos?.[id]", "const positions=(window.MihaejeJourneyPhotos||window.MihaejeRoomPhotos)?.[id]"],
 ["!s.escaped?'열쇠를 선택해 출입문에 사용하세요':'문이 열렸습니다'","!s.escaped?(j?j.final+'에서 마지막 손길을 남겨주세요':'열쇠를 선택해 출입문에 사용하세요'):(j?'이야기 속 마지막 손길을 남겼습니다':'문이 열렸습니다')"],
 ["if(s.area===1&&this.game.unlocked){root.append(button(this.game.solved?'마지막 행동 다시 보기':'마지막 행동 고르기 →',()=>this.config.onConclusion(),'primary room-final'))}","if(s.area===1&&this.game.unlocked){root.append(button(s.escaped?'남긴 이야기 다시 보기':j?.final+' 살펴보기',()=>this.useExit(),'primary room-final'))}"],
 ["useExit(){if(this.state.escaped)","useExit(){if(this.journey){if(this.state.escaped){this.config.onEscape();return}if(!this.game.unlocked){this.notify('아직 마지막 기록이 보이지 않습니다 '+this.journey.inside+'의 장치를 먼저 복원해주세요');return}const final=this.config.docs.find(d=>d.locked);if(final&&!this.game.read?.includes(final.id)){this.openDoc(final.id);return}this.closePanel();this.config.onConclusion();return}if(this.state.escaped)"],
 ["const p=window.MihaejeRoomPhotos?.[this.config.id]","const p=(window.MihaejeJourneyPhotos||window.MihaejeRoomPhotos)?.[this.config.id]"],
 ["photo.style.backgroundImage='url(\"assets/photoreal/'+this.config.id+'-'+area+'-v2.webp\")'","photo.style.backgroundImage='url(\"'+this.scenePhoto(area==='inner'?1:0)+'\")'"],
 ["renderPanel(root){const panel=", "renderPanel(root){const panel=this.buildPanel(root);this.showPanel(panel,this.panel==='lock'?'잠금장치':this.panel.startsWith('item-')?'물건 발견':this.panel.startsWith('group-')?'현장 기록':'물건 관찰')}\n buildPanel(root){const panel="],
 ["root.append(panel);this.showPanel(panel,this.panel==='lock'?'잠금장치':this.panel.startsWith('item-')?'물건 발견':this.panel.startsWith('group-')?'현장 기록':'물건 관찰');", "root.append(panel);"],
 ["const t=this.theme,s=this.state;const zoom=","const t=this.theme,s=this.state,j=this.journey;const zoom="],
 ["button('소지품 열기',()=>{this.panel='inventory';this.render()},'quiet'));return}", "button('소지품 열기',()=>{this.panel='inventory';this.render()},'quiet'));return panel}"],
 ["button('탐색으로 돌아가기',()=>this.closePanel(),'primary'));return}","button('탐색으로 돌아가기',()=>this.closePanel(),'primary'));return panel}"],
 ["el('p','','입구의 장치를 풀어 안쪽 공간으로 들어가세요 안쪽 기록함의 잠금을 풀고 마지막 행동을 고르면 출입문 열쇠를 얻습니다')","el('p','',j?.opening||'입구의 장치를 풀어 안쪽 공간으로 들어가세요 안쪽 기록함의 잠금을 풀고 마지막 행동을 고르면 출입문 열쇠를 얻습니다')"],
 ["'primary'));return}const diagram","'primary'));return panel}const diagram"],
 ["조작부가 드러납니다'));return}","조작부가 드러납니다'));return panel}"],
 ["t.tokens.forEach(token=>controls.append(button(token,()=>{if(s.choice.length<t.marks.length){s.choice.push(token);this.config.save();this.render()}else this.notify('입력 칸을 눌러 지우고 다시 선택할 수 있습니다')},'symbol-key')))","t.tokens.forEach(token=>{const b=button(token,()=>{if(s.choice.length<t.marks.length){s.choice.push(token);this.config.save();this.render()}else this.notify('입력 칸을 눌러 지우고 다시 선택할 수 있습니다')},'symbol-key');b.setAttribute('data-focus-key','token-'+token);controls.append(b)})"],
 ["this.message='구역 잠금이 풀렸습니다 안쪽에서 새 단서를 살펴보세요';window.MihaejeAudio?.play('door')","this.message=j?j.inside+'에서 새 기록을 살펴보세요':'구역 잠금이 풀렸습니다 안쪽에서 새 단서를 살펴보세요';window.MihaejeAudio?.play(j?.sound||'door')"],
 ["el('h3','',t.groupLabels?.[index]||", "el('h3','',j?.groups[index]||t.groupLabels?.[index]||"],
 ["\n }\n}\n})();","\n return panel;\n }\n}\n})();"]
]);
edit('web/story-adventure-v36.js',[
 ["function draw(){board.replaceChildren();", "function draw(){const body=document.querySelector('.inspection-dialog[open] .inspection-body'),scroll=body?.scrollTop||0;board.replaceChildren();"],
 ["support();collect()}","support();collect();if(body)body.scrollTop=scroll}"],
 ["function finish({id,state,save,onDone}){const t=", "function finish({id,state,save,onDone}){if(window.MihaejeJourneys?.finish({id,state,save,onDone}))return;const t="]
]);
edit('web/episode.js',[
 ["window.MihaejeEscapeDesigns[caseId].inside+' 문 열기'","window.MihaejeJourneys?.data[caseId]?.goal||window.MihaejeEscapeDesigns[caseId].inside+' 문 열기'"],
 ["onDone:()=>{state.solved=true;save();renderRoom();go('room');announce('열쇠가 손에 돌아왔습니다 출입문에 사용해 문 너머로 나가세요')}","onDone:()=>{state.solved=true;state.escape.escaped=true;save();renderRoom();go('room');playEpisodeEnding()}"],
 ["announce('최종 확인을 마쳤습니다 소지품의 열쇠를 선택해 출입문에 사용하세요')","announce('최종 확인을 마쳤습니다 장면의 마지막 물건을 살펴보세요')"]
]);
edit('web/app.js',[
 ["onDone:()=>{state.solved=true;save();renderGarageRoom();showView('room')}","onDone:()=>{state.solved=true;state.escape.escaped=true;save();renderGarageRoom();showView('room');playGarageEnding()}"],
 ["최종 확인을 마쳤습니다 열쇠를 선택해 출입문에 사용하세요","최종 확인을 마쳤습니다 기록 인계 봉투를 살펴보세요"]
]);
edit('web/puzzle-clues.js',[["기록함을 안쪽에서 닫았다는 쪽지가 붙어 있습니다\\n안쪽에서 보이는 면은 뒷면입니다","접합선이 안쪽으로 향하도록 표식판을 설치한다는 제작 메모입니다\\n표식판 안쪽에서 보이는 뒷면 해독표를 사용합니다"]]);
for(const file of ['case.html','episode.html'])edit('web/'+file,[["<script src=\"escape-kit.js", "<script src=\"journeys-v37.js?v=37\"></script>\n<script src=\"journey-photos-v37.js?v=37\"></script>\n<script src=\"escape-kit.js"]]);
for(const file of ['case.html','episode.html','studio.html','ohang.html']){const p='web/'+file;let html=fs.readFileSync(p,'utf8');html=html.replace(/((?:escape-kit|inspection|app|episode|story-adventure-v36|puzzle-clues)\.js)\?[^" ]*/g,'$1?v=37');fs.writeFileSync(p,html)}
edit('scripts/build-static-styles.cjs',[["+'-v36.css'","+'-v37.css'"]]);
const file='design/style-entries.json',entries=JSON.parse(fs.readFileSync(file));for(const list of Object.values(entries))if(!list.includes('journeys-v37.css'))list.push('journeys-v37.css');fs.writeFileSync(file,JSON.stringify(entries,null,2)+'\n');
