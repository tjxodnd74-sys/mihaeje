(()=>{
 const el=(tag,text,cls)=>{const n=document.createElement(tag);n.textContent=text||'';if(cls)n.className=cls;return n};
 function render(node,t,id){
  const intro=el('p','입구 장치 · '+'★'.repeat(t.level),'clue-tier');node.append(intro);
  if(t.level===1){const row=el('div','','puzzle-tag-row');t.answer.forEach(token=>row.append(el('strong',token,'puzzle-tag')));node.append(row)}
  else if(t.level===2){const row=el('div','','puzzle-tag-row');t.marks.slice().reverse().forEach(m=>{const card=el('div','','puzzle-tag');card.append(el('small','태그 '+m.rank),el('strong',m.token));row.append(card)});node.append(row)}
  else if(t.level===3){const row=el('div','','puzzle-tag-row');[...t.chain].reverse().forEach(c=>{const card=el('div','','puzzle-tag');card.append(el('small',c.from+' → '+c.to),el('strong',c.token));row.append(card)});const decoy=el('div','','puzzle-tag');decoy.append(el('small',t.labels[0]+' → 취소함'),el('strong',t.tokens.at(-1)));row.append(decoy);node.append(row,el('p','취소함으로 이어지는 조각은 점검 완료 경로에 포함하지 않습니다'))}
  else{
   const note=el('section','','puzzle-clue-document');note.append(el('h4','작업자의 메모'),el('p',t.constraints.join('\n')));node.append(note);
   const details=el('details','','puzzle-clue-document');details.append(el('summary',t.level===5?'자료 B · 앞뒤 해독표 펼치기':'태그 대응표 펼치기'));const table=el('table');
   if(t.level===5){const row=el('tr');['태그','앞면','뒷면'].forEach(v=>row.append(el('th',v)));table.append(row);t.backLegend.forEach(v=>{const row=el('tr');[v.label,v.front,v.back].forEach(x=>row.append(el('td',x)));table.append(row)});details.append(el('p','접합선이 안쪽으로 향하도록 표식판을 설치한다는 제작 메모입니다\n표식판 안쪽에서 보이는 뒷면 해독표를 사용합니다'))}
   else t.legend.forEach(v=>{const row=el('tr');row.append(el('th',v.label),el('td',v.token));table.append(row)});
   details.append(table);node.append(details);
  }
 }
 window.MihaejePuzzleClues={render};
})();
