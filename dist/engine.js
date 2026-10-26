/* 사주정원 1.0 — deterministic, browser-only calculation and interpretation. */
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
 {name:'목',han:'木',color:'#548b62',pale:'#e9f1e6',symbol:'나무',verb:'성장',title:'자라는 힘',good:'새로운 목표를 세우고 배우며, 더 나은 방향을 찾는 일',hard:'진전이 보이지 않거나 내 방식이 계속 막힐 때 조급해지는 상황',action:'오늘 할 수 있는 가장 작은 다음 단계를 하나 정해 보세요.',low:'배울 일과 해볼 일을 작게 정해 성장의 경험을 쌓아 보세요.',scene:'계획만 늘리기보다 이번 주 끝낼 한 가지를 정하면 방향이 또렷해질 수 있어요.'},
 {name:'화',han:'火',color:'#db785c',pale:'#fbe9e0',symbol:'불꽃',verb:'표현',title:'드러내는 힘',good:'생각을 말과 작업으로 표현하고, 사람들과 활기를 나누는 일',hard:'관심과 반응을 얻으려 무리하거나 말이 앞서는 상황',action:'하고 싶은 말을 세 문장으로 정리하고, 상대가 답할 틈을 남겨 보세요.',low:'생각을 혼자 완성하기보다 믿을 만한 사람에게 초안을 보여 주세요.',scene:'회의에서 아이디어를 제시하는 힘은 살리고, 실행 일정도 함께 적어 보세요.'},
 {name:'토',han:'土',color:'#c29b49',pale:'#f5edd8',symbol:'언덕',verb:'안정',title:'쌓아가는 힘',good:'일정을 유지하고 사람 사이를 중재하며, 결과를 차곡차곡 쌓는 일',hard:'책임을 너무 떠안거나 변화를 미루느라 움직이기 어려워지는 상황',action:'내가 맡을 일과 상대가 맡을 일을 나누어 적어 보세요.',low:'하루의 시작과 마무리에 작은 고정 루틴을 만들어 보세요.',scene:'안정감을 위해 모든 부탁을 받아 주기보다, 지킬 수 있는 약속만 남겨 보세요.'},
 {name:'금',han:'金',color:'#899ba3',pale:'#eaf0f2',symbol:'돌',verb:'기준',title:'다듬는 힘',good:'기준을 세우고 오류를 찾으며, 필요한 결정을 분명하게 내리는 일',hard:'완벽한 기준이나 평가에 매달려 자신과 상대에게 엄격해지는 상황',action:'완료 기준 세 가지를 먼저 정하고, 수정 횟수에 한계를 두어 보세요.',low:'일을 시작하기 전에 완료 조건과 마감을 눈에 보이게 적어 보세요.',scene:'피드백을 받을 때 내 가치에 대한 평가와 고칠 작업을 구분하면 부담을 줄일 수 있어요.'},
 {name:'수',han:'水',color:'#6198b1',pale:'#e6f0f5',symbol:'물결',verb:'탐색',title:'이해하는 힘',good:'상황을 관찰하고 정보를 연결하며, 유연하게 다음 길을 찾는 일',hard:'생각할 가능성이 많아 결정을 미루거나 혼자 고민이 길어지는 상황',action:'정보를 더 찾기 전에 결정 시점과 필요한 자료의 범위를 정해 보세요.',low:'바로 반응하기 전에 한 번 쉬고, 지금 필요한 정보부터 확인해 보세요.',scene:'자료 수집 시간을 정해 두고 작은 실험으로 확인하면 생각이 행동으로 이어질 수 있어요.'}
];
const GOD={
 비견:{han:'比肩',label:'자기주도',group:'비겁',good:'자기 기준을 세우고 독립적으로 움직이는 힘',hard:'협의보다 내 방식을 먼저 밀어붙이는 장면',action:'혼자 결정할 일과 함께 정할 일을 구분해 보세요.',work:'자율성과 역할이 분명한 업무',love:'각자의 시간과 선택을 존중하는 관계',money:'공동 지출과 개인 지출을 분리해 관리'},
 겁재:{han:'劫財',label:'경쟁·협력',group:'비겁',good:'동료와 연결되고 경쟁을 추진력으로 바꾸는 힘',hard:'비교하거나 부탁을 거절하지 못해 내 자원이 새는 장면',action:'돈과 시간을 함께 쓰기 전에 범위와 책임을 합의해 보세요.',work:'협업·네트워크·경쟁이 있는 업무',love:'관계 밖의 친구와 생활도 균형 있게 유지',money:'지인과의 거래·공동 구매 조건을 문서로 확인'},
 식신:{han:'食神',label:'꾸준한 생산',group:'식상',good:'자기 기술로 결과물을 차근차근 만드는 힘',hard:'편한 방식에 머물러 결과를 공개하지 못하는 장면',action:'좋아하는 일을 작은 완성품으로 만들어 보여 주세요.',work:'반복해서 숙련도를 높이는 제작·기술 업무',love:'말뿐 아니라 일상의 돌봄으로 마음을 표현',money:'내 기술을 수입으로 연결하는 과정 점검'},
 상관:{han:'傷官',label:'표현·개선',group:'식상',good:'불편한 점을 발견하고 새롭게 표현하는 힘',hard:'옳은 말이더라도 전달 방식 때문에 갈등이 생기는 장면',action:'지적 다음에 대안 한 가지를 붙이고, 상대에게 선택권을 주세요.',work:'기획·개선·발표·창작처럼 답을 바꾸는 업무',love:'상대를 고치려는 말보다 내 바람을 구체적으로 전달',money:'아이디어의 비용과 수익 구조를 함께 확인'},
 편재:{han:'偏財',label:'기회·확장',group:'재성',good:'외부 자원과 기회를 연결하고 판을 넓히는 힘',hard:'기회를 놓칠까 여러 일을 벌려 관리가 흩어지는 장면',action:'새 일을 시작하기 전에 감당할 시간과 손실 범위를 정해 보세요.',work:'영업·사업개발·프로젝트처럼 자원을 연결하는 업무',love:'큰 이벤트와 함께 일상의 약속도 챙기기',money:'기대 수익과 별개로 손실 한도·생활비를 분리'},
 정재:{han:'正財',label:'관리·축적',group:'재성',good:'시간과 돈을 계획적으로 관리하고 꾸준히 쌓는 힘',hard:'계획 밖의 변화가 생겼을 때 통제 부담이 커지는 장면',action:'기본 예산과 조정 가능한 여유 예산을 나누어 보세요.',work:'운영·회계·관리처럼 누적과 정확성이 필요한 업무',love:'성실함과 함께 상대의 다른 생활 방식도 수용',money:'고정비·저축·자유 지출을 주기적으로 점검'},
 편관:{han:'偏官',label:'도전·대응',group:'관성',good:'어려운 과제를 만나 집중하고 위기에 대응하는 힘',hard:'모든 일을 시험처럼 받아들이고 긴장을 내려놓지 못하는 장면',action:'지금 해결할 과제 하나만 고르고, 책임 범위를 확인해 보세요.',work:'문제 해결·안전·품질처럼 판단과 대응이 필요한 업무',love:'걱정을 지시로 전달하지 말고 필요한 도움을 물어보기',money:'급한 결정보다 조건·책임·위험을 먼저 확인'},
 정관:{han:'正官',label:'원칙·책임',group:'관성',good:'약속과 기준을 지키며 신뢰를 만드는 힘',hard:'타인의 기대에 맞추느라 거절이나 도전을 미루는 장면',action:'해야 하는 일과 잘 보이기 위해 하는 일을 구분해 보세요.',work:'규정·절차·공적 책임이 명확한 업무',love:'지켜야 한다는 의무와 실제 원하는 관계를 구분',money:'계약과 지출 원칙을 정하고 정기적으로 확인'},
 편인:{han:'偏印',label:'탐구·직관',group:'인성',good:'남다른 관점으로 파고들고 정보 사이 연결을 찾는 힘',hard:'확신이 생길 때까지 준비만 하거나 혼자 해석하는 장면',action:'관찰한 사실과 내 추측을 나누고 작은 실험으로 확인하세요.',work:'연구·분석·전문 탐구처럼 깊이가 필요한 업무',love:'마음을 추측하기보다 확인 질문을 직접 하기',money:'정보 탐색 뒤에 결정 기한을 정하기'},
 정인:{han:'正印',label:'학습·지원',group:'인성',good:'체계적으로 배우고 도움을 받아 기반을 다지는 힘',hard:'준비나 인정이 충분하지 않으면 시작을 미루는 장면',action:'배운 내용을 오늘 써볼 한 가지 행동으로 바꾸어 보세요.',work:'교육·문서화·지원처럼 배움을 전달하는 업무',love:'받고 싶은 돌봄과 줄 수 있는 돌봄을 말로 표현',money:'공부한 원칙을 실제 기록과 관리에 적용'}
};
const CITIES={서울:126.978,부산:129.076,대구:128.601,인천:126.705,광주:126.853,대전:127.385,울산:129.311,세종:127.289,수원:127.028,춘천:127.73,강릉:128.876,청주:127.489,전주:127.148,목포:126.392,여수:127.662,광양:127.696,포항:129.365,창원:128.681,제주:126.531};
const mod=(n,m)=>(n%m+m)%m, se=i=>Math.floor(i/2), tg=(a,b)=>{const d=mod(se(b)-se(a),5);return TG[[0,2,4,6,8][d]+(a%2===b%2?0:1)];};
const stage=(a,b)=>mod([1,6,10,9,10,9,7,0,4,3][a]+(a%2?-b:b),12);
function dateSolar(d){return Solar.fromYmdHms(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes(),0);}
function asDate(s){return new Date(Date.UTC(s.getYear(),s.getMonth()-1,s.getDay(),s.getHour(),s.getMinute(),s.getSecond()));}
function pillar(gz,title,dm){const a=STEMS.indexOf(gz[0]),b=BRANCHES.indexOf(gz[1]);return {gz,title,a,b,stem:SK[a],branch:BK[b],e:se(a),be:BE[b],god:tg(dm,a),bgod:tg(dm,MAIN[b]),hidden:HIDDEN[b].map(i=>({i,han:STEMS[i],name:SK[i],e:se(i),god:tg(dm,i)})),stage:STAGES[stage(dm,b)],stageDesc:STAGE_DESC[stage(dm,b)]};}
function daylight(d){const y=d.getUTCFullYear();if(y===1987)return d>=new Date(Date.UTC(1987,4,10,2))&&d<new Date(Date.UTC(1987,9,11,3));if(y===1988)return d>=new Date(Date.UTC(1988,4,8,2))&&d<new Date(Date.UTC(1988,9,9,3));return false;}
function calculate(input){
 const cal=new KoreanLunarCalendar();const [y,m,day]=input.date.split('-').map(Number);
 if(y<1962||y>2050)throw Error('지원 생년은 1962~2050년입니다.');
 const ok=input.calendar==='lunar'?cal.setLunarDate(y,m,day,!!input.leap):cal.setSolarDate(y,m,day);
 if(!ok)throw Error('실제로 존재하는 날짜인지, 음력 윤달이 맞는지 확인해 주세요.');
 const sd=cal.getSolarCalendar(),ld=cal.getLunarCalendar();
 const [h,mi]=(input.unknown?'12:00':input.time||'12:00').split(':').map(Number);
 const wall=new Date(Date.UTC(sd.year,sd.month-1,sd.day,h,mi));
 const now=new Date();if(wall.getTime()>now.getTime()+9*3600000)throw Error('아직 태어나지 않은 날짜는 입력할 수 없어요.');
 if(!input.unknown&&daylight(wall)&&h===2&&((sd.year===1987&&sd.month===5&&sd.day===10)||(sd.year===1988&&sd.month===5&&sd.day===8)))throw Error('이 날짜의 02시는 서머타임 시작으로 건너뛴 시간입니다. 출생 기록을 확인해 주세요.');
 const dst=daylight(wall)?60:0;const standard=new Date(wall.getTime()-dst*60000);
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
 const dominant=counts.indexOf(Math.max(...counts));const ranked=TG.slice().sort((a,b)=>gods[b]-gods[a]);
 // Explicit illustrative seasonal model. Not a consensus clinical or scientific score.
 const weighted=Array(5).fill(0);ps.forEach((p,i)=>{weighted[p.e]+=1;p.hidden.forEach((v,j)=>weighted[v.e]+=(p.hidden.length===3?[.1,.2,.7]:p.hidden.length===2?[.3,.7]:[1])[j]*(i===1?1.5:1));});
 const season=ps[1].be;weighted[season]*=1.25;const support=weighted[se(dm)]+weighted[mod(se(dm)+4,5)],weightTotal=weighted.reduce((a,b)=>a+b,0),ratio=support/weightTotal;
 const strength=ratio<.3?'도움이 필요한 편':ratio>.6?'자기 힘이 강한 편':'중간 범위';
 const balance=ratio<.4?[mod(se(dm)+4,5),se(dm)]:ratio>.6?[mod(se(dm)+1,5),mod(se(dm)+2,5)]:[counts.indexOf(Math.min(...counts))];
 const relation=relations(ps);const stars=starRules(ps,dm);const yearGroup=[[8,0,4],[2,6,10],[5,9,1],[11,3,7]].findIndex(g=>g.includes(ps[0].b));const salNames=['겁살','재살','천살','지살','년살(도화)','월살','망신살','장성살','반안살','역마살','육해살','화개살'];ps.forEach(p=>p.sal12=salNames[mod(p.b-[5,11,2,8][yearGroup],12)]);
 const yun=ec.getYun(input.gender==='male'?1:0,2);const start=yun.getStartSolar().nextHour(1);
 const decades=yun.getDaYun(10).slice(1).map((d,i)=>({gz:d.getGanZhi(),year:start.getYear()+i*10,age:yun.getStartYear()+i*10,month:yun.getStartMonth(),god:tg(dm,STEMS.indexOf(d.getGanZhi()[0]))}));
 let uncertain=false;if(input.unknown){const lo=Solar.fromYmdHms(sd.year,sd.month,sd.day,0,0,0).nextHour(-1).getLunar().getEightChar(),hi=Solar.fromYmdHms(sd.year,sd.month,sd.day,23,59,0).nextHour(-1).getLunar().getEightChar();uncertain=lo.getMonth()!==hi.getMonth()||lo.getYear()!==hi.getYear();}
 const groups=[gods.비견+gods.겁재,gods.식신+gods.상관,gods.편재+gods.정재,gods.편관+gods.정관,gods.편인+gods.정인];
 const pattern=groups[3]>=2&&groups[1]>=2?{title:'잘하고 싶은 마음, 표현하고 싶은 마음',text:'관성의 책임·평가와 식상의 표현·개선이 함께 보여요. 자유롭게 해보고 싶은 방식과 요구받는 기준이 다를 때 부담으로 느껴지는지 살펴보세요.',action:'초안을 만드는 시간과 기준에 맞춰 검토하는 시간을 나누고, 시작 전에 평가 기준을 합의해 보세요.',basis:'관성 '+groups[3]+'글자 + 식상 '+groups[1]+'글자'}:groups[0]>=2&&groups[2]>=2?{title:'내 방식과 함께 쓰는 자원 사이',text:'비겁의 자기 기준과 재성의 자원·성과가 함께 보여요. 협업에서 선택권과 돈·시간의 책임이 섞이는지 점검해 보세요.',action:'함께 쓰는 비용·역할·결정권을 나누어 적고 합의해 보세요.',basis:'비겁 '+groups[0]+'글자 + 재성 '+groups[2]+'글자'}:groups[4]>=2&&groups[1]<=1?{title:'깊게 배운 것을 밖으로 꺼내보기',text:'인성의 학습·탐구가 눈에 띄고, 겉글자 식상은 상대적으로 적어요. 더 준비하려는 마음이 결과를 공개하는 일을 늦추는지 돌아보세요.',action:'새 자료를 찾기 전에 지금 아는 것으로 작은 완성품 하나를 만들어 보세요.',basis:'인성 '+groups[4]+'글자 + 식상 '+groups[1]+'글자'}:{title:E[dominant].title+'을 생활의 장점으로',text:E[dominant].scene,action:GOD[ranked[0]].action,basis:E[dominant].name+' '+percent[dominant].toFixed(1)+'% + '+ranked[0]};
 return {input,solar:sd,lunar:ld,wall,local,dst,correction,dm,de:se(dm),pillars:ps,counts,percent,total,gods,godPercent,dominant,topGod:ranked[0],ranked,weighted,ratio,strength,balance,pattern,relations:relation,stars,decades,start:{year:yun.getStartYear(),month:yun.getStartMonth(),day:yun.getStartDay(),date:start.toYmd()},forward:yun.isForward(),uncertain};
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
function flow(result,gz){const a=STEMS.indexOf(gz[0]),b=BRANCHES.indexOf(gz[1]),god=tg(result.dm,a),d=GOD[god];return {gz,god,e:se(a),be:BE[b],label:d.label,theme:d.good,care:d.hard,action:d.action};}
function yearFlow(r,y){return flow(r,STEMS[mod(y-4,10)]+BRANCHES[mod(y-4,12)]);}
function monthFlow(r,y,m){const e=Solar.fromYmdHms(y,m,15,12,0,0).nextHour(-1).getLunar().getEightChar();return flow(r,e.getMonth());}
function dayFlow(r,y,m,d){return flow(r,Solar.fromYmd(y,m,d).getLunar().getDayInGanZhi());}
const QUESTIONS=[
 {id:'self',category:'나 이해',icon:'🌱',q:'내 사주의 핵심을 쉽게 말하면?'},
 {id:'stress',category:'나 이해',icon:'🌧',q:'나는 어떤 상황이 버거울까?'},
 {id:'strength',category:'나 이해',icon:'✨',q:'어떤 강점을 활용하면 좋을까?'},
 {id:'work',category:'일과 돈',icon:'🧰',q:'어떤 일하는 방식이 잘 맞을까?'},
 {id:'money',category:'일과 돈',icon:'🪙',q:'돈을 다룰 때 무엇을 점검할까?'},
 {id:'love',category:'관계',icon:'💌',q:'연애에서 알아두면 좋은 점은?'},
 {id:'people',category:'관계',icon:'🤝',q:'관계가 힘들 때 어떻게 풀어볼까?'},
 {id:'balance',category:'나 이해',icon:'⚖',q:'부족한 오행은 꼭 채워야 할까?'},
 {id:'stars',category:'사주 용어',icon:'🌟',q:'내 사주에 있는 살은 무서운 걸까?'},
 {id:'weak',category:'사주 용어',icon:'🌳',q:'신약하면 의지가 약하다는 뜻일까?'},
 {id:'zero',category:'사주 용어',icon:'○',q:'십성이 0%면 그 능력이 없을까?'},
 {id:'year',category:'시간의 흐름',icon:'☀',q:'올해는 어떤 주제를 살펴볼까?'},
 {id:'month',category:'시간의 흐름',icon:'🌙',q:'이번 달은 무엇에 집중해볼까?'},
 {id:'name',category:'입력·계산',icon:'✍',q:'이름은 한자로 입력해야 하나요?'},
 {id:'time',category:'입력·계산',icon:'⏳',q:'태어난 시간을 모르면 어떻게 되나요?'},
 {id:'percent',category:'입력·계산',icon:'◔',q:'그래프의 퍼센트는 무슨 뜻인가요?'},
 {id:'sign',category:'사주 용어',icon:'±',q:'글자 옆의 음양과 오행은 무엇인가요?'},
 {id:'hidden',category:'사주 용어',icon:'🔍',q:'지장간과 12운성은 어떻게 읽나요?'}
];
function answer(r,id,now){const e=E[r.dominant],me=E[r.de],g=GOD[r.topGod],base=`${STEMS[r.dm]}${SK[r.dm]}${me.name} 일간 · ${e.name} ${r.percent[r.dominant].toFixed(1)}% · ${r.topGod} ${r.godPercent[r.topGod].toFixed(1)}%`;
 let title,text,steps,basis=base;switch(id){
 case 'self':title=`${me.symbol}를 중심으로, ${e.verb}의 주제가 눈에 띄어요`;text=`나를 나타내는 일간은 ${SK[r.dm]}${me.name}이에요. 여덟 글자 분포에서는 ${e.name}이 가장 많이 나타나고, 십성에서는 ${r.topGod}(${g.label})이 눈에 띄어요. 이는 ${g.good}이라는 전통적 주제로 연결해 볼 수 있어요.`;steps=[e.scene,g.action,'풀이가 실제 경험과 맞는 부분과 다른 부분을 각각 떠올려 보세요.'];break;
 case 'stress':title=`${g.label}의 힘이 부담으로 바뀔 때`;text=`${r.topGod}의 주제는 ${g.good}이에요. 부담으로 느껴지는지 점검할 장면은 ${g.hard}이에요. ${e.name}의 상징을 함께 보면 ${e.hard}도 돌아볼 수 있어요.`;steps=[g.action,e.action,'최근 힘들었던 장면에서 내 책임과 환경의 조건을 따로 적어 보세요.'];break;
 case 'strength':title=`${g.label}을 구체적인 결과로 바꾸어 보세요`;text=`${g.good}이라는 주제를 실제 경험에서 찾아보세요. ${e.good}과 연결해 작게 시험해 볼 수 있어요. 사주만으로 능력이나 적성을 확정하지 않고, 해본 일의 결과를 기준으로 확인하면 좋아요.`;steps=[g.action,'잘 해냈던 일 세 가지에서 반복되는 행동을 찾아보세요.',e.scene];break;
 case 'work':title=`직업 이름보다 ${g.label}을 쓰는 환경을 살펴보세요`;text=`${r.topGod}의 상징을 업무에 옮기면 ${g.work}를 탐색할 수 있어요. ${e.good}에서 즐거움이나 성취가 있었는지 떠올려 보세요. 같은 직업도 자율성·평가 방식·팀 문화에 따라 경험이 달라져요.`;steps=['작은 과제나 프로젝트로 먼저 경험해 보세요.','평가 기준·업무 범위·일정이 나에게 맞는지 확인하세요.',g.action];break;
 case 'money':title='금전운보다 먼저, 내 자원 관리 습관';text=`이 구성에서는 ${g.money}를 점검 주제로 삼을 수 있어요. 재성의 개수는 실제 재산이나 수익률이 아니에요. 편재·정재가 없더라도 돈을 벌거나 관리할 수 없는 것은 아니에요.`;steps=['지난 한 달의 고정비·변동비를 실제 기록으로 확인하세요.','공동 지출과 계약은 조건·책임·취소 기준을 먼저 정하세요.','사주 풀이를 투자 종목이나 매매 시점의 근거로 쓰지 않아요.'];break;
 case 'love':title='관계에서 표현하고 확인할 것';text=`${g.love}를 관계 점검의 힌트로 써보세요. ${r.topGod}을 ${g.label}의 상징으로 읽으면, ${g.hard}가 관계에서도 반복되는지 살펴볼 수 있어요. 성별로 상대의 역할을 정하거나 결혼 시기를 확정하지 않아요.`;steps=['내가 편안한 연락·만남의 빈도를 이야기해 보세요.','상대의 마음을 추측하는 대신 지금 필요한 것을 물어보세요.',g.action];break;
 case 'people':title='갈등의 원인을 행동과 조건으로 나누어 보기';text=`${g.hard}가 실제로 반복되는지 확인해 보세요. 합은 연결, 충은 방향 차이의 상징이에요. 특정 글자가 있다고 누군가와 반드시 다투는 것은 아니에요.`;steps=['관찰한 사실 → 느낀 점 → 바라는 행동 순서로 말해 보세요.','나와 상대가 조정할 수 있는 범위를 따로 정해 보세요.',g.action];break;
 case 'balance':title='비율이 낮다고 결함이 있는 것은 아니에요';text=`현재 분포는 ${E.map((v,i)=>v.name+' '+r.percent[i].toFixed(1)+'%').join(', ')}예요. 개수 비율과 계절에 따른 세력은 달라요. 부족한 오행을 특정 색·물건으로 채우면 운명이 바뀐다고 보장하지 않아요.`;steps=r.balance.map(i=>E[i].low);basis='겉글자 분포와 계절 보조모형을 구분하여 설명';break;
 case 'stars':title='신살은 사건 예고가 아니라 조합의 이름이에요';text=r.stars.length?`이 사이트의 공개된 규칙으로는 ${r.stars.map(s=>s.name).join('·')}이 표시돼요. 특정 글자의 조합에 전통적인 의미를 붙인 보조 해석이며, 사고·이혼·성공 같은 사건이 반드시 발생한다는 뜻은 아니에요.`:'선택한 신살 규칙에 해당하는 조합이 없어요. 신살이 없다고 특별함이나 기회가 없다는 뜻은 아니에요.';steps=r.stars.slice(0,3).map(s=>s.action);basis='일간·일지·월지·연지별 채택 규칙, 각 상징 카드의 근거 참고';break;
 case 'weak':title='신약은 의지나 건강 점수가 아니에요';text=`보조모형에서는 ‘${r.strength}’으로 표시돼요. 일간과 같은 오행·일간을 생하는 오행의 비중을 보는 내부 참고치이며, 인격·능력·신체 건강을 측정하지 않아요. 신강·신약과 용신은 학파에 따라 판단이 달라요.`;steps=['전문 판정은 계절·통근·투간·합화 조건 등을 함께 살펴야 해요.','용신 제안은 확정 판정이 아닌 균형을 생각해 보는 참고로 제공해요.'];basis='지장간·월지 가중치를 적용한 공개 보조모형';break;
 case 'zero':title='없는 글자와 없는 능력은 달라요';text=`0%는 이 그래프의 집계 방식에서 해당 십성이 세어지지 않았다는 뜻이에요. 지장간이나 운에서는 나타날 수 있고, 실제 능력은 경험과 학습으로 달라져요. 정재 0%가 가난, 관성 0%가 무직을 뜻하지 않아요.`;steps=['각 십성이 어느 글자에서 나왔는지 원국에서 확인하세요.','현재 필요한 기술과 습관은 실제로 연습해서 만들 수 있어요.'];basis=`${r.total}개 겉글자, 지지는 본기 기준, 일간은 비견으로 포함`;break;
 case 'year':case 'month':{const n=now||{year:2026,month:10},f=id==='year'?yearFlow(r,n.year):monthFlow(r,n.year,n.month);title=`${id==='year'?n.year+'년':n.year+'년 '+n.month+'월'} · ${f.god}, ${f.label}의 주제`;text=`흐름의 천간 ${f.gz[0]}을 내 일간 ${STEMS[r.dm]}과 비교하면 ${f.god}이에요. ${f.theme}을 점검 주제로 삼고, ${f.care}에 주의를 기울여 보세요. 실제 사건이나 성공 확률을 예측한 결과는 아니에요.`;steps=[f.action,'이미 진행 중인 계획과 현실의 일정에 맞춰 적용하세요.'];basis=id==='year'?'연운은 입춘을 경계로 함. 화면은 선택 연도의 입춘 이후 기준':'월운 요약은 양력 15일의 절월 기준. 절입 전후는 월주가 달라질 수 있음';break;}
 case 'name':title='한글 이름이나 별명이면 충분해요';text='사주팔자는 출생 연·월·일·시로 계산해요. 이름은 화면에서 부르는 호칭이고 계산값에 영향을 주지 않아요. 이름의 한자·획수를 따지는 성명학은 별개의 체계로 이 사이트에 포함하지 않았어요.';steps=['본명이 부담스러우면 별명으로 입력하세요.'];basis='생년월일시 기반 사주 원국';break;
 case 'time':title='시간을 모르면 시주를 비워 두어요';text='시간 모름을 고르면 시주는 계산과 비율에서 제외해요. 분포는 여섯 글자 기준이 되며, 신살·강약·대운 시작은 제한적으로 봐야 해요. 절입일에는 년주·월주도 시간에 따라 달라질 수 있어 별도 안내를 표시해요.';steps=['가족 기록으로 확인할 수 있으면 시간을 다시 입력하세요.','표시한 대운 시작은 정오 가정의 참고값이에요.'];basis='임의의 시주를 만들어 넣지 않음';break;
 case 'percent':title='퍼센트는 글자의 구성 비율이에요';text=`${r.total}개 글자를 각각 같은 비중으로 세었어요. 지지는 대표 기운인 본기를 사용하고, 십성에서는 일간도 비견으로 포함해요. 확률·능력 점수·실제 에너지 측정값이 아니며, 20%씩 같아야 좋은 사주라는 뜻도 아니에요.`;steps=['합화나 조후 보정으로 기본 그래프 수치를 바꾸지 않아요.','계절·지장간 보조모형은 별도 영역에서 확인하세요.'];basis=`${r.counts.join('·')} / ${r.total}개`;break;
 case 'sign':title='음양은 방향의 구분, 오행은 상징의 분류예요';text='천간과 지지에는 음양·오행이 배속돼요. 양(+)이 더 좋거나 음(-)이 더 나쁘다는 뜻은 아니에요. 이 사이트의 지지 음양은 지지 자체 기준이며, 십성은 본기의 천간을 기준으로 해요. 午는 양화지만 본기 丁은 음화라 표시 체계가 다를 수 있어요.';steps=['원국 글자를 누르면 본기와 지장간을 함께 확인할 수 있어요.'];basis='지지 자체 음양과 본기 음양을 구분';break;
 default:title='지지 속 세부 구성과 기운의 단계';text='지장간은 지지 안에 담겨 있다고 보는 천간이에요. 여기서는 한국식 여기·중기·정기 배열을 사용하고, 표면 십성은 본기를 기준으로 해요. 12운성은 일간과 지지의 관계를 장생·목욕·관대 등의 단계로 비유한 것이에요. 병·사·절을 실제 병·죽음·단절로 읽지 않아요.';steps=['글자를 누르면 숨은 천간별 십성을 볼 수 있어요.','12운성은 장단점과 맥락을 함께 읽어요.'];basis='일간 기준 음간 역행, 양간 순행·화토동궁';}
 if(['self','stress','work','people'].includes(id)){text+=' '+r.pattern.text;steps.unshift(r.pattern.action);basis+=' · '+r.pattern.basis;}
 return {title,text,steps,basis};
}
const api={STEMS,SK,BRANCHES,BK,BE,MAIN,HIDDEN,TG,STAGES,E,GOD,CITIES,QUESTIONS,calculate,tg,stage,pillar,flow,yearFlow,monthFlow,dayFlow,answer,mod};root.Saju=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
