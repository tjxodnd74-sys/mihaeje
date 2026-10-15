export const ELEMENTS=[
 {id:'wood',name:'목',han:'木',color:'청',direction:'동',image:'새싹',gift:'작은 화분',letter:'새싹을 창가에 놓고 내일 물을 주기로 합니다.'},
 {id:'fire',name:'화',han:'火',color:'적',direction:'남',image:'등불',gift:'저녁에 켜둘 등불',letter:'해가 지면 등불을 켜고, 미뤄둔 말을 적어볼 생각입니다.'},
 {id:'earth',name:'토',han:'土',color:'황',direction:'중앙',image:'흙그릇',gift:'쉬는 날의 식사',letter:'흙그릇은 집에 가져가 저녁상을 차릴 때 쓰기로 합니다.'},
 {id:'metal',name:'금',han:'金',color:'백',direction:'서',image:'작은 종',gift:'문 앞의 작은 종',letter:'문 앞에 종을 달아 두기로 합니다. 집에 돌아올 때마다 오늘 적은 글을 떠올릴 겁니다.'},
 {id:'water',name:'수',han:'水',color:'흑',direction:'북',image:'물잔',gift:'책상 위의 물잔',letter:'물잔을 책상에 놓고, 쉴 때마다 물을 채워 마시기로 합니다.'}
];
const STEMS='甲乙丙丁戊己庚辛壬癸',BRANCHES='子丑寅卯辰巳午未申酉戌亥';
const stemNames='갑을병정무기경신임계'.split(''),branchNames='자축인묘진사오미신유술해'.split('');
const stemElements=[0,0,1,1,2,2,3,3,4,4],branchElements=[4,2,0,0,2,1,1,2,3,3,2,4];
export function birthProfile(input,Solar){
 const {year,month,day}=input,hour=input.hour,minute=input.minute??0,unknown=hour===null;
 if(![year,month,day].every(Number.isInteger)||year<1901||year>2026||month<1||month>12||day<1||day>31)throw Error('1901~2026년의 양력 생일을 입력해주세요');
 const d=new Date(Date.UTC(year,month-1,day));if(d.getUTCFullYear()!==year||d.getUTCMonth()+1!==month||d.getUTCDate()!==day)throw Error('실제 달력에 있는 날짜를 입력해주세요');
 if(!unknown&&(!Number.isInteger(hour)||hour<0||hour>23||!Number.isInteger(minute)||minute<0||minute>59))throw Error('태어난 시각을 확인해주세요');
 // Solar terms in this library use UTC+8; only year/month boundary comparisons shift.
 // Day and hour use the supplied Korean standard wall clock, midnight day convention.
 const terms=(h,m)=>{const t=new Date(Date.UTC(year,month-1,day,h-1,m));const lunar=Solar.fromYmdHms(t.getUTCFullYear(),t.getUTCMonth()+1,t.getUTCDate(),t.getUTCHours(),t.getUTCMinutes(),0).getLunar();return [lunar.getYearInGanZhiExact(),lunar.getMonthInGanZhiExact()]};
 const local=Solar.fromYmdHms(year,month,day,unknown?12:hour,unknown?0:minute,0).getLunar();
 const a=terms(unknown?0:hour,unknown?0:minute),b=unknown?terms(23,59):a;
 const dayPair=local.getDayInGanZhiExact2(),di=STEMS.indexOf(dayPair[0]),ti=unknown?null:Math.floor((hour+1)/2)%12;
 const pairs=[a[0]===b[0]?a[0]:null,a[1]===b[1]?a[1]:null,dayPair,unknown?null:STEMS[(di%5*2+ti)%10]+BRANCHES[ti]];
 const counts=[0,0,0,0,0];const pillars=pairs.map((pair,i)=>{if(!pair)return {label:['년','월','일','시'][i],text:'미확정',elements:[]};const si=STEMS.indexOf(pair[0]),bi=BRANCHES.indexOf(pair[1]),elements=[stemElements[si],branchElements[bi]];elements.forEach(n=>counts[n]++);return {label:['년','월','일','시'][i],text:stemNames[si]+branchNames[bi],elements}});
 const seed=stemElements[di],max=Math.max(...counts),companion=counts.findIndex(n=>n===max);
 return {version:1,pillars,counts,seed,companion,unknown,ambiguous:pairs.slice(0,2).some(p=>p===null),total:counts.reduce((a,b)=>a+b,0)};
}
export function ending(profile,choices){
 const primary=ELEMENTS[profile.seed],tone=['keep','release','share'].includes(choices[0])?choices[0]:'keep',action=['plant','light','rest','ring','flow'].indexOf(choices[1]),chosen=ELEMENTS[action<0?profile.companion:action];
 const paths={keep:{title:'남겨두는 마음',text:'간직하고 싶은 기억을 접수표에 적었습니다.',line:'기억하고 싶은 날을 한 줄씩 적어둔다.'},release:{title:'내려놓는 마음',text:'마음에 걸린 걱정을 종이에 적고 접어두었습니다.',line:'오늘 접어둔 걱정은 내일 다시 생각한다.'},share:{title:'함께하는 마음',text:'누군가에게 전하고 싶었던 말을 적었습니다.',line:'미뤄둔 말을 한 사람에게 전한다.'}};
 const path=paths[tone];return {id:primary.id+'-'+tone+'-'+chosen.id,title:primary.gift+' · '+path.title,body:primary.letter+'\n\n'+path.text+'\n마지막에 고른 '+chosen.image+'에 “'+chosen.gift+'”라는 마음을 담았습니다',promise:path.line,seed:primary.id,chosen:chosen.id,tone};
}
