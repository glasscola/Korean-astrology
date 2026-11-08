const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
global.Solar=require('./dist/vendor/lunar.js').Solar;
global.KoreanLunarCalendar=require('./dist/vendor/korean-lunar-calendar.min.js');
const S=require('./dist/engine.js'), R=require('./dist/reading.js'), Q=require('./dist/questions-data.js');
const base={date:'2000-06-05',calendar:'solar',time:'15:34',city:'광양',gender:'male',correction:true,boundary:'0'};
const result=S.calculate(base),model=R.build(result);
assert.ok(model.active.length>=2);
assert.match(model.story.title,/개선|기준|책임/);
assert.equal(R.element(model,3).group.term,'관성');
assert.match(R.stem(result).name,/갑목/);
assert.ok(R.build(S.calculate({...base,unknown:true})).uncertain);
assert.equal(Q.items.length,48);
assert.equal(new Set(Q.items.map(q=>q.id)).size,Q.items.length);
for(const q of Q.items) {
  assert.ok(q.step.length>10&&q.explain.length>10,q.id);
  for(const pref of q.prefs)assert.ok(Q.lenses[q.category][pref],q.id);
}
const dist=path.join(__dirname,'dist');
const window={SajuUI:{$(){},escape:String,load(filename){vm.runInContext(fs.readFileSync(path.join(dist,filename.split('?')[0]),'utf8'),context);return Promise.resolve();}}};
const context=vm.createContext({window});
vm.runInContext(fs.readFileSync(path.join(dist,'name.js'),'utf8'),context);
const N=window.SajuName;
assert.throws(()=>N.validate('hanja','김','민수',''),/한자/);
assert.equal(N.validate('korean','','하늘','푸르고 넓게').given,'하늘');
assert.equal(N.validate('hanja','','𠮷','').given,'𠮷');
(async()=>{
  const chars=await Promise.all(['敏','珉','神'].map(N.lookup));
  assert.match(chars[0].readings[0][1],/민첩/);
  assert.match(chars[1].readings[0][1],/옥돌/);
  assert.equal(chars[0].strokes,11);
  assert.equal(chars[2].glyph,'神');
  assert.equal(chars[2].reference,'神');
  assert.equal(chars[2].strokes,null);
  const renamed=S.calculate({...base,nameDetails:N.validate('hanja','金','敏秀','')});
  assert.deepEqual(renamed.pillars,result.pillars);
  console.log('PASS combined reading, 48 questions, name dictionary, variant preservation and unchanged natal chart');
})().catch(e=>{console.error(e);process.exitCode=1;});
