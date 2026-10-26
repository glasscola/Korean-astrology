const assert=require('node:assert/strict'),R=require('./dist/regions.js');
global.Solar=require('./dist/vendor/lunar.js').Solar;global.KoreanLunarCalendar=require('./dist/vendor/korean-lunar-calendar.min.js');
const S=require('./dist/engine.js');let passed=0;function check(name,fn){fn();passed++;console.log('PASS '+name);}
check('전국 17개 시도 및 시군구·읍면동·리 좌표 범위',()=>{assert.equal(R.locations.filter(r=>r.kind==='sido').length,17);assert.ok(R.locations.length>19000);assert.equal(new Set(R.locations.map(r=>r.label)).size,R.locations.length);for(const r of R.locations)assert.ok(r.latitude>32&&r.latitude<40&&r.longitude>123&&r.longitude<133,r.label);});
check('여수·순천·광양을 개별 도시로 검색',()=>{for(const city of ['여수','순천','광양'])assert.ok(R.search(city).items.some(r=>r.label==='전라남도 '+city+'시'));});
check('지방 소도시·군·상세 법정동·리 포함',()=>{for(const label of ['전라남도 구례군','경상북도 울릉군','경기도 과천시','제주특별자치도 서귀포시','서울특별시 강남구 역삼동','전라남도 광양시 광양읍 덕례리'])assert.ok(R.resolve(label),label);});
check('동일 이름을 전체 경로로 구분하고 별도 좌표 유지',()=>{const list=R.search('중구',{limit:100}).items.filter(r=>r.name==='중구');assert.ok(list.length>=5);assert.ok(new Set(list.map(r=>r.longitude)).size>=5);});
check('약칭·띄어쓰기·초성 검색과 결과 페이지 나누기',()=>{assert.equal(R.search('전남 광양').items[0].label,'전라남도 광양시');assert.equal(R.search('경기 성남 분당').items[0].label,'경기도 성남시 분당구');assert.ok(R.search('ㄱㅇ').total>0);assert.equal(R.search('서울',{limit:10}).items.length,10);assert.equal(R.search('없는가상도시XYZ').total,0);});
check('과거 저장한 지역명과 인천 신설 구 검색',()=>{assert.equal(R.resolve('광양').label,'전라남도 광양시');for(const name of ['제물포구','영종구','검단구'])assert.equal(R.search(name).items[0].label,'인천광역시 '+name);});
check('선택 지역 경도를 실제 시각 보정에 반영',()=>{const base={name:'검증',date:'1995-08-17',calendar:'solar',time:'10:00',unknown:false,gender:'male',correction:true,boundary:'0'};for(const city of ['서울특별시 강남구 역삼동','전라남도 광양시 광양읍 덕례리','경상북도 울릉군']){const r=S.calculate({...base,city});assert.equal(r.correction,Math.round((R.resolve(city).longitude-135)*4));}assert.throws(()=>S.calculate({...base,city:'없는 가상도시'}));});
console.log(`${passed} region verification groups passed.`);
