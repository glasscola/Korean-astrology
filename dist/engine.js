/* 사주정원: calendar and traditional relationship calculations. */
(function(root){
'use strict';
const STEMS='甲乙丙丁戊己庚辛壬癸'.split(''), SK='갑을병정무기경신임계'.split('');
const BRANCHES='子丑寅卯辰巳午未申酉戌亥'.split(''), BK='자축인묘진사오미신유술해'.split('');
const BE=[4,2,0,0,2,1,1,2,3,3,2,4], MAIN=[9,5,0,1,4,2,3,5,6,7,4,8];
const HIDDEN=[[8,9],[9,7,5],[4,2,0],[0,1],[1,9,4],[4,6,2],[2,5,3],[3,1,5],[4,8,6],[6,7],[7,3,4],[4,0,8]];
const TG=['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];
const STAGES=['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
const STAGE_DESC=['새로운 일을 배우고 시작하는 상징','감각과 표현을 탐색하는 상징','역할을 갖추고 준비하는 상징','자기 몫을 해내는 상징','주도성과 활동이 커지는 상징','경험을 정리하고 조절하는 상징','속도를 낮추고 점검하는 상징','바깥 활동보다 몰입을 보는 상징','축적하고 보관하는 상징','익숙한 흐름을 끊고 전환하는 상징','가능성을 품고 구상하는 상징','돌봄과 준비를 받는 상징'];
const E=[
 {name:'목',han:'木',color:'#4e8067',pale:'#e1eee4'},
 {name:'화',han:'火',color:'#bc5e46',pale:'#f9e3d9'},
 {name:'토',han:'土',color:'#977027',pale:'#f5e8bf'},
 {name:'금',han:'金',color:'#746784',pale:'#eae3f1'},
 {name:'수',han:'水',color:'#426e88',pale:'#e0edf4'}
];
const CITIES={서울:126.978,부산:129.076,대구:128.601,인천:126.705,광주:126.853,대전:127.385,울산:129.311,세종:127.289,수원:127.028,춘천:127.73,강릉:128.876,청주:127.489,전주:127.148,목포:126.392,여수:127.662,광양:127.696,포항:129.365,창원:128.681,제주:126.531};
const mod=(n,m)=>(n%m+m)%m, se=i=>Math.floor(i/2), tg=(a,b)=>{const d=mod(se(b)-se(a),5);return TG[[0,2,4,6,8][d]+(a%2===b%2?0:1)];};
const stage=(a,b)=>mod([1,6,10,9,10,9,7,0,4,3][a]+(a%2?-b:b),12);
function dateSolar(d){return Solar.fromYmdHms(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds());}
function pillar(gz,title,dm){const a=STEMS.indexOf(gz[0]),b=BRANCHES.indexOf(gz[1]);return {gz,title,a,b,stem:SK[a],branch:BK[b],e:se(a),be:BE[b],god:tg(dm,a),bgod:tg(dm,MAIN[b]),hidden:HIDDEN[b].map(i=>({i,han:STEMS[i],name:SK[i],e:se(i),god:tg(dm,i)})),stage:STAGES[stage(dm,b)],stageDesc:STAGE_DESC[stage(dm,b)]};}
function daylight(d){const y=d.getUTCFullYear();if(y===1987)return d>=new Date(Date.UTC(1987,4,10,2))&&d<new Date(Date.UTC(1987,9,11,3));if(y===1988)return d>=new Date(Date.UTC(1988,4,8,2))&&d<new Date(Date.UTC(1988,9,9,3));return false;}
const APPROX={dawn:[0,359,'새벽'],morning:[360,719,'오전'],afternoon:[720,1079,'오후'],night:[1080,1439,'저녁·밤']};
function calculate(input){
 const cal=new KoreanLunarCalendar();const [y,m,day]=input.date.split('-').map(Number);
 if(y<1962||y>2050)throw Error('지원 생년은 1962~2050년입니다.');
 const ok=input.calendar==='lunar'?cal.setLunarDate(y,m,day,!!input.leap):cal.setSolarDate(y,m,day);
 if(!ok)throw Error('실제로 존재하는 날짜인지, 음력 윤달이 맞는지 확인해 주세요.');
 const sd=cal.getSolarCalendar(),ld=cal.getLunarCalendar();
 const approx=input.unknown?APPROX[input.approx]:null;
 const [from,to]=approx||[0,1439];
 const midpoint=approx?Math.round((from+to)/2):720;
 const [h,mi]=input.unknown?[Math.floor(midpoint/60),midpoint%60]:(input.time||'12:00').split(':').map(Number);
 const wall=new Date(Date.UTC(sd.year,sd.month-1,sd.day,h,mi));
 const earliest=input.unknown?Date.UTC(sd.year,sd.month-1,sd.day,0,from):wall.getTime();
 if(earliest>Date.now()+9*3600000)throw Error('아직 태어나지 않은 날짜는 입력할 수 없어요.');
 if(!input.unknown&&daylight(wall)&&h===2&&((sd.year===1987&&sd.month===5&&sd.day===10)||(sd.year===1988&&sd.month===5&&sd.day===8)))throw Error('이 날짜의 02시는 서머타임 시작으로 건너뛴 시간입니다. 출생 기록을 확인해 주세요.');
 const repeated=!input.unknown&&h===2&&((sd.year===1987&&sd.month===10&&sd.day===11)||(sd.year===1988&&sd.month===10&&sd.day===9));
 const dst=daylight(wall)&&!(repeated&&input.clockFold==='standard')?60:0;const standard=new Date(wall.getTime()-dst*60000);
 const selectedRegion=root.SajuRegions?.resolve(input.city);
 const longitude=selectedRegion?.longitude??CITIES[input.city];
 if(!Number.isFinite(longitude))throw Error('검색 결과에서 태어난 지역을 다시 선택해 주세요.');
 const correction=input.correction?Math.round((longitude-135)*4):0;
 const local=new Date(standard.getTime()+correction*60000);
 const korea=dateSolar(standard),china=korea.nextHour(-1),ec=china.getLunar().getEightChar();
 let daySolar=dateSolar(local);if(input.boundary==='23'&&local.getUTCHours()>=23)daySolar=daySolar.nextDay(1);
 const dgz=daySolar.getLunar().getDayInGanZhi(),dm=STEMS.indexOf(dgz[0]);
 const hb=Math.floor((local.getUTCHours()+1)/2)%12,hg=(dm%5*2+hb)%10;
 const values=[ec.getYear(),ec.getMonth(),dgz];if(!input.unknown)values.push(STEMS[hg]+BRANCHES[hb]);
 const ps=values.map((v,i)=>pillar(v,['년주','월주','일주','시주'][i],dm));
 const counts=Array(5).fill(0),gods=Object.fromEntries(TG.map(g=>[g,0]));
 ps.forEach((p,i)=>{counts[p.e]++;counts[p.be]++;gods[i===2?'비견':p.god]++;gods[p.bgod]++;});
 const total=ps.length*2,percent=counts.map(n=>n/total*100),godPercent=Object.fromEntries(TG.map(g=>[g,gods[g]/total*100]));
 const relation=relations(ps);const stars=starRules(ps,dm);const yearGroup=[[8,0,4],[2,6,10],[5,9,1],[11,3,7]].findIndex(g=>g.includes(ps[0].b));const salNames=['겁살','재살','천살','지살','년살(도화)','월살','망신살','장성살','반안살','역마살','육해살','화개살'];ps.forEach(p=>p.sal12=salNames[mod(p.b-[5,11,2,8][yearGroup],12)]);
 const yun=input.gender ? ec.getYun(input.gender==='male'?1:0,2) : null;
 const start=yun?.getStartSolar().nextHour(1);
 const decades=yun ? yun.getDaYun(10).slice(1).map((d,i)=>({
   gz:d.getGanZhi(),date:start.nextYear(i*10).toYmd(),age:yun.getStartYear()+i*10
 })) : [];
 const lower=new Date(Date.UTC(sd.year,sd.month-1,sd.day,0,from));
 const upper=new Date(Date.UTC(sd.year,sd.month-1,sd.day,0,to,59));
 const ecAt=d=>dateSolar(new Date(d.getTime()-(daylight(d)?60:0)*60000)).nextHour(-1).getLunar().getEightChar();
 const dayAt=d=>{
   const t=dateSolar(new Date(d.getTime()+(correction-(daylight(d)?60:0))*60000));
   return (input.boundary==='23'&&t.getHour()>=23?t.nextDay(1):t).getLunar().getDayInGanZhi();
 };
 const lo=input.unknown?ecAt(lower):ec;
 const toCompare=input.unknown?ecAt(upper):Solar.fromYmdHms(china.getYear(),china.getMonth(),china.getDay(),china.getHour(),china.getMinute(),59).getLunar().getEightChar();
 const uncertain=lo.getMonth()!==toCompare.getMonth()||lo.getYear()!==toCompare.getYear();
 const uncertainDay=input.unknown && dayAt(lower)!==dayAt(upper);
 return {input,solar:sd,lunar:ld,wall,local,dst,correction,dm,de:se(dm),pillars:ps,
   counts,percent,total,gods,godPercent,relations:relation,stars,decades,
   start:start?.toYmd()||null,forward:yun?.isForward()??null,uncertain,uncertainDay,repeated,approxLabel:approx?.[2]||null};
}
function relations(ps){const out=[];const he=[[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]],ch=[[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
 for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j];if(he.some(p=>p.includes(a.b)&&p.includes(b.b)&&a.b!==b.b))out.push({type:'육합',a:i,b:j,han:a.gz[1]+b.gz[1],text:'서로 끌어당기거나 묶이는 관계의 상징이에요. 협력과 연결로 읽기도 하지만, 관계에 매여 조정이 필요하다고 보기도 해요.'});if(ch.some(p=>p.includes(a.b)&&p.includes(b.b)&&a.b!==b.b))out.push({type:'충',a:i,b:j,han:a.gz[1]+b.gz[1],text:'서로 다른 방향이 마주치는 상징이에요. 변화와 재정비의 계기로 읽으며, 실제 사건이나 갈등이 확정됐다는 뜻은 아니에요.'});if(Math.abs(a.a-b.a)===5)out.push({type:'천간합',a:i,b:j,han:a.gz[0]+b.gz[0],text:'윗글자끼리 연결되는 관계예요. 관심과 역할이 묶이는 상징으로 읽어요. 합이 있다고 오행이 자동으로 바뀌는 것으로 계산하지 않아요.'});}
 return out;
}
function starRules(ps,dm){const out=[],base=ps[2].b;const groups=[[8,0,4],[2,6,10],[11,3,7],[5,9,1]];const gi=groups.findIndex(g=>g.includes(base));
 const defs=[['도화살',[9,3,0,6][gi],'🌸','눈길을 끄는 표현','취향과 표현, 사람의 관심을 상징해요. 인기가 보장되거나 관계 문제가 생긴다는 뜻은 아니에요.','나에게 편안한 표현 방식과 관계의 경계를 함께 정해 보세요.'],['역마살',[2,8,5,11][gi],'🧭','이동과 새로운 환경','이동·활동 범위·환경 전환을 상징해요. 이사나 해외 생활이 반드시 생긴다는 뜻은 아니에요.','새로운 환경에서 얻을 것과 지켜야 할 생활 리듬을 같이 계획해 보세요.'],['화개살',[4,10,7,1][gi],'🎨','혼자 깊이 몰입하기','몰입·탐구·창작의 상징이에요. 외로움이 정해져 있다는 뜻은 아니에요.','집중하는 시간과 사람을 만나는 시간을 둘 다 일정에 남겨 보세요.']];
 defs.forEach(([name,target,icon,label,text,action])=>{const found=ps.map((p,i)=>p.b===target?i:-1).filter(i=>i>=0);if(found.length)out.push({name,icon,label,text,action,positions:found,basis:`일지 ${BRANCHES[base]} 기준, ${BRANCHES[target]} 확인`});});
 const nobles=[[1,7],[0,8],[11,9],[11,9],[1,7],[0,8],[1,7],[2,6],[3,5],[3,5]][dm];const lit=[5,6,8,9,8,9,11,0,2,3][dm];
 [['천을귀인',nobles,'🤝','도움과 연결','도움을 주고받는 연결의 상징이에요. 어려움이 자동으로 해결된다는 뜻은 아니에요.','필요한 도움을 구체적으로 요청하고 신뢰할 관계를 돌보세요.'],['문창귀인',[lit],'📚','배움과 표현','학습·문서·표현을 상징해요. 시험 합격이나 재능이 보장되는 것은 아니에요.','배운 것을 글이나 작업으로 정리하며 실제 실력을 확인해 보세요.']].forEach(([name,targets,icon,label,text,action])=>{const found=ps.map((p,i)=>targets.includes(p.b)?i:-1).filter(i=>i>=0);if(found.length)out.push({name,icon,label,text,action,positions:found,basis:`일간 ${STEMS[dm]} 기준, ${targets.map(t=>BRANCHES[t]).join('·')} 확인`});});return out.concat(extraStars(ps,dm));
}
function extraStars(ps,dm){
 const out=[],month=ps[1].b,year=ps[0].b;
 const add=(name,icon,label,text,action,positions,basis)=>{if(positions.length)out.push({name,icon,label,text,action,positions,basis});};
 const branchPos=targets=>ps.map((p,i)=>targets.includes(p.b)?i:-1).filter(i=>i>=0);
 const tables=[
 ['금여성',[4,5,7,8,7,8,10,11,1,2][dm],'🛶','편안함과 돌봄','생활의 여유와 배려를 상징해요. 부유한 결혼이나 재산이 보장된다는 뜻은 아니에요.','편안함을 만드는 생활 조건과 서로 주고받는 돌봄을 구체적으로 이야기해 보세요.'],
 ['관귀학관',[5,5,8,8,11,11,2,2,8,8][dm],'🪶','배움과 역할','배움이 역할과 책임으로 연결되는 상징이에요. 관직이나 자격 취득을 보장하지 않아요.','배운 내용을 실제 프로젝트나 기록으로 남겨 보세요.'],
 ['홍염살',[6,8,2,7,4,4,10,9,0,8][dm],'🌺','매력과 감정 표현','개성 있는 표현과 관계의 끌림을 상징해요. 연애 횟수나 관계 문제를 예측하지 않아요.','상대의 관심을 추측하기보다 내 마음과 경계를 명확히 표현해 보세요.']
 ];
 tables.forEach(([name,target,icon,label,text,action])=>add(name,icon,label,text,action,branchPos([target]),`채택한 일간표: ${STEMS[dm]} → ${BRANCHES[target]}${name==='관귀학관'?' · 토장생 신(申) 계열의 학관표':''}`));
 const tae=[[0,6],[0,6],[3,9],[3,9],[4,10,1,7],[4,10,1,7],[2,11],[2,11],[5,8],[5,8]][dm];
 add('태극귀인','☯','탐구와 원리 이해','원리를 탐구하고 큰 맥락을 이해하는 상징이에요. 타고난 지능이나 특별한 보호를 입증하는 표시는 아니에요.','이해한 원리를 내 말로 설명하고 현실 사례에 적용해 보세요.',branchPos(tae),`일간 ${STEMS[dm]} → ${tae.map(i=>BRANCHES[i]).join('·')} 배속표`);
 const wolStem=[8,6,2,0,8,6,2,0,8,6,2,0][month];
 add('월덕귀인','🌤','관계 속의 완충','갈등을 누그러뜨리고 도움을 연결하는 상징이에요. 모든 위험을 피하게 해준다는 뜻은 아니에요.','조정이 필요할 때 중립적인 사람의 도움을 구해 보세요.',ps.map((p,i)=>p.a===wolStem?i:-1).filter(i=>i>=0),`월지 ${BRANCHES[month]}의 삼합군 → 천간 ${STEMS[wolStem]}`);
 const ui=mod(month-1,12);add('천의성','🍃','돌봄과 회복의 관심','현대 월지표에서 돌봄과 회복의 관심으로 읽는 상징이에요. 의학적 재능이나 건강 상태를 판정하는 표시는 아니에요.','필요한 지원을 알아보고 일상에서 돌봄의 시간을 확보해 보세요.',branchPos([ui]),`현대 월지 기준: ${BRANCHES[month]}의 앞 지지 ${BRANCHES[ui]}`);
 const go=year>=2&&year<=4?5:year>=5&&year<=7?8:year>=8&&year<=10?11:2;
 add('고신살','🪴','독립된 시간','독립적인 시간과 자기 공간의 상징이에요. 외로움이나 이별이 정해져 있다는 뜻은 아니에요.','혼자 회복하는 시간과 함께 연결되는 시간을 균형 있게 정해 보세요.',branchPos([go]),`연지 ${BRANCHES[year]}의 계절군 → ${BRANCHES[go]}`);
 const needles=ps.map((p,i)=>([0,7].includes(p.a)||[3,6,8].includes(p.b))?i:-1).filter(i=>i>=0);
 add('현침살','🪡','세밀함과 날카로운 표현','뾰족한 글자 모양에서 세밀함·표현의 예리함을 읽는 상징이에요. 다침이나 수술을 예고하지 않아요.','정확한 표현의 장점을 살리되, 말의 강도와 전달 시점을 조절해 보세요.',needles,'다섯 글자 형상표: 천간 甲·辛, 지지 卯·午·申 중 하나');
 if(['庚辰','壬辰','戊戌','庚戌'].includes(ps[2].gz))add('괴강살','⛰','강한 주도성','강한 추진과 결단을 상징해요. 성격이 거칠거나 인생이 험하다고 단정하지 않아요.','강하게 밀어붙일 일과 다른 의견을 들을 일을 구분해 보세요.',[2],'일주만 적용: 庚辰·壬辰·戊戌·庚戌 네 조합');
 const pardon=month>=2&&month<=4?'戊寅':month>=5&&month<=7?'甲午':month>=8&&month<=10?'戊申':'甲子';
 if(ps[2].gz===pardon)add('천사성','🕊','전환과 새 출발','계절과 일주의 조합에서 전환과 풀림을 읽는 상징이에요. 실수가 자동으로 용서되거나 문제가 사라진다는 뜻은 아니에요.','정리할 일과 다시 시작할 일을 적고 실제로 작은 행동을 시작해 보세요.',[2],`월지 계절 + 일주: 봄 戊寅·여름 甲午·가을 戊申·겨울 甲子`);
 return out;
}
function timePillars(year,month,day,hour=12,minute=0){
 const moment=Solar.fromYmdHms(year,month,day,hour,minute,0).nextHour(-1);
 const ec=moment.getLunar().getEightChar();
 return {year:ec.getYear(),month:ec.getMonth(),
   day:Solar.fromYmd(year,month,day).getLunar().getDayInGanZhi()};
}
const TERM_NAMES={'小寒':'소한','立春':'입춘','惊蛰':'경칩','清明':'청명','立夏':'입하','芒种':'망종',
 '小暑':'소서','立秋':'입추','白露':'백로','寒露':'한로','立冬':'입동','大雪':'대설'};
function monthBoundary(year,month){
 const lunar=Solar.fromYmd(year,month,15).getLunar();
 for(const [key,value] of Object.entries(lunar.getJieQiTable())){
   if(!TERM_NAMES[key])continue;
   const term=value.nextHour(1);
   if(term.getYear()===year&&term.getMonth()===month){
     return {name:TERM_NAMES[key],day:term.getDay(),time:term.toYmdHms().slice(11,16)};
   }
 }
 return null;
}
const api={STEMS,SK,BRANCHES,BK,BE,MAIN,HIDDEN,TG,STAGES,E,CITIES,calculate,tg,stage,pillar,
 timePillars,monthBoundary,mod};
root.Saju=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
