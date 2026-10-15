const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),file=n=>path.join(root,n),read=n=>fs.readFileSync(file(n),'utf8'),write=(n,s)=>fs.writeFileSync(file(n),s);
function replace(n,a,b){const s=read(n);if(!s.includes(a))throw Error('Missing target '+n);write(n,s.replace(a,b))}
replace('web/episode.js','checkMemory,memoryFacts','checkMemory,memoryFacts,checkClock,checkSeating');
replace('web/episode.js',"memory:memoryPuzzle}","memory:memoryPuzzle,clock:clockPuzzle,seating:seatingPuzzle}");
replace('web/episode.js',"['apartment','radio','station','letter','pet-home'].includes(caseId)","['apartment','radio','station','letter','pet-home','laundry','cat-invite'].includes(caseId)");
replace('web/episode.js',"caseId==='pet-home'?'paper':'drawer'","['pet-home','cat-invite'].includes(caseId)?'paper':'drawer'");
write('web/episode.js',read('web/episode.js')+`
function clockPuzzle(root){
 const draft=state.puzzle,g=episode.gate,card=el('div','puzzle-card');
 const label=el('label','field','코트 보관 기계'),select=el('select');
 for(const [value,text] of [['','기계를 선택하세요'],...g.machines.map(x=>[x,x+'번 기계'])]){const o=el('option','',text);o.value=value;select.append(o)}
 select.value=draft.machine||'';select.onchange=()=>{draft.machine=select.value;save()};label.append(select);
 const code=input('실제 종료 시각 · 네 자리',draft.code);code.i.inputMode='numeric';code.i.maxLength=4;code.i.autocomplete='off';code.i.oninput=()=>{draft.code=code.i.value;save()};
 card.append(label,code.wrap,button('수령 기록함 열기',()=>{if(checkClock(g,draft))unlock();else feedback('품목에 맞는 기계와 서버 기준 종료 시각을 함께 확인하세요 빠른 시계에서 차이를 빼세요')},'primary'));root.append(card)
}
function seatingPuzzle(root){
 const draft=state.puzzle,g=episode.gate;draft.placements??={};
 const board=el('div','seating-board');board.setAttribute('aria-label','북쪽부터 시계 방향 자리표');
 for(const seat of g.seats){const label=el('label','field',seat.name),select=el('select');for(const [value,text] of [['','앉을 사람을 선택하세요'],...g.guests.map(p=>[p.id,p.name])]){const o=el('option','',text);o.value=value;select.append(o)}select.value=draft.placements[seat.id]||'';select.onchange=()=>{draft.placements[seat.id]=select.value;save()};label.append(select);board.append(label)}
 const code=input('봉투 봉인 숫자 · 네 자리',draft.code);code.i.inputMode='numeric';code.i.maxLength=4;code.i.autocomplete='off';code.i.oninput=()=>{draft.code=code.i.value;save()};
 root.append(board,code.wrap,button('마지막 봉투 열기',()=>{if(checkSeating(g,draft))unlock();else feedback('각자 다른 자리에 앉습니다 북쪽부터 시계 방향으로 해당 사람의 선물 숫자를 읽어보세요')},'primary'))
}
`);
write('web/escape-designs.js',read('web/escape-designs.js')+`
window.MihaejeEscapeDesigns.laundry={toolMode:'single',entry:'밤샘 세탁소',inside:'직원 기록실',parts:['정비용 열쇠'],tool:'정비용 열쇠',target:'잠긴 정비 순서표',use:'벤치의 정비용 열쇠로 순서표의 덮개를 여세요',reveal:'덮개 안쪽에서 정비 기호 네 개가 드러났습니다',kind:'symbols',rule:'정비표의 순번 1 → 4에 맞는 기호를 누르세요',tokens:['○','△','□','◇','☆','≋'],marks:[{rank:3,token:'△'},{rank:1,token:'□'},{rank:4,token:'◇'},{rank:2,token:'○'}],groups:[['brief','order','receipt'],['clock','entry'],['note']]};
window.MihaejeEscapeDesigns['cat-invite']={entry:'작은 포장 가게',inside:'초대 준비방',parts:['초대장 왼쪽 조각','초대장 오른쪽 조각'],tool:'이어 맞춘 초대장',target:'초대장 자리표',use:'포장대의 두 조각을 이어 벽면 자리표의 빈 곳에 맞춰보세요',reveal:'초대장 가장자리에 남은 네 가지 표식이 이어졌습니다',kind:'stamps',rule:'초대장 테두리의 순번 1 → 4로 도장을 찍으세요',tokens:['꽃','리본','발자국','집','하트','달'],marks:[{rank:3,token:'발자국'},{rank:1,token:'꽃'},{rank:4,token:'집'},{rank:2,token:'리본'}],groups:[['brief','gifts'],['room','notes'],['date','card']],warm:true};
`);
write('web/photo-scenes.js',read('web/photo-scenes.js')+`
window.MihaejeRoomPhotos.laundry={entry:[[7,23],[14,83],[30,75],[7,33],[89,48]],inner:[[25,70],[11,23],[47,38],[58,70],[84,51]]};
window.MihaejeRoomPhotos['cat-invite']={entry:[[53,28],[28,87],[40,85],[34,31],[88,46]],inner:[[27,64],[12,23],[40,38],[66,60],[93,48]]};
`);
replace('web/theme-ui.css','html[data-theme=pet-home]{','html[data-theme=pet-home],html[data-theme=cat-invite]{');
replace('web/theme-ui.css','html[data-theme=apartment],html[data-theme=station]{','html[data-theme=apartment],html[data-theme=station],html[data-theme=laundry]{');
replace('web/theme-ui.css','.case-card[data-theme=pet-home] .case-card-title{','.case-card[data-theme=pet-home] .case-card-title,.case-card[data-theme=cat-invite] .case-card-title{');
replace('web/theme-ui.css','.case-card[data-theme=apartment] .case-card-title,','.case-card[data-theme=laundry] .case-card-title,.case-card[data-theme=apartment] .case-card-title,');
write('web/theme-ui.css',read('web/theme-ui.css')+'\n.seating-board{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin:18px 0 24px}.seating-board .field{margin:0}@media(max-width:700px){.seating-board{grid-template-columns:1fr;gap:14px}}\n');
replace('scripts/audit-escape.mjs',"'pet-home':['발자국','해','새싹','집']","'pet-home':['발자국','해','새싹','집'],laundry:['□','○','△','◇'],'cat-invite':['꽃','리본','발자국','집']");
replace('scripts/audit-escape.mjs',"'Six gates checked across '","'Eight gates checked across '");
replace('scripts/build-static-styles.cjs',"+'-v22.css'","+'-v24.css'");
for(const n of ['index.html','case.html','episode.html','studio.html'])replace('web/'+n,'audio-ui.js?v=23','audio-ui.js?v=24');
console.log('New games wired into room engine, puzzles, themes and catalogue');
