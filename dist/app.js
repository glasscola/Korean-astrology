(function(root){
  'use strict';
  const U=root.SajuUI,$=U.$,$$=U.$$,esc=U.escape,S=root.Saju,R=root.SajuReading;
  const form=$('#birth-form'), panels=$$('.report-panel'), formError=$('#form-error');
  const field=id=>$('#'+id), storageKey='saju-garden-profiles';
  const nameBox=field('birth-name');
  let nameForm=root.SajuNamePicker.mount(nameBox);
  let regionPicker,regionLoading,model,active='overview',busy=false,profileId=null;
  const visited=new Set();
  field('preview-links').innerHTML=root.SajuReport.questionLinks();

  function ensureRegions(){
    if(regionPicker)return Promise.resolve(regionPicker);
    if(!regionLoading){
      regionLoading=U.load('regions.js?v=2').then(()=>{
        const input=field('city-search');
        regionPicker=root.createSajuRegionPicker($('.region-field'));
        if(document.activeElement===input)input.dispatchEvent(new Event('focus'));
        return regionPicker;
      }).catch(e=>{regionLoading=null;throw e;});
    }
    return regionLoading;
  }
  function prepareRegions(){
    ensureRegions().catch(error=>{formError.hidden=false;formError.textContent=error.message;});
  }
  field('city-search').addEventListener('focus',prepareRegions);
  field('city-search').addEventListener('pointerenter',prepareRegions,{once:true});
  function prepareEngine(){
    return Promise.all([U.load('vendor/lunar.js'),U.load('vendor/korean-lunar-calendar.min.js')]);
  }
  function syncForm(){
    const unknown=field('unknown').checked;
    field('birth-hour').disabled=unknown;
    field('birth-minute').disabled=unknown;
    field('approx-wrap').hidden=!unknown;
    const lunar=$('input[name="calendar"]:checked').value==='lunar';
    $('.lunar-option').hidden=!lunar;
    let y=+field('birth-year').value,m=+field('birth-month').value,d=+field('birth-day').value;
    if(lunar&&root.KoreanLunarCalendar&&y&&m&&d){
      const cal=new root.KoreanLunarCalendar();
      if(cal.setLunarDate(y,m,d,field('leap').checked)){
        const solar=cal.getSolarCalendar();y=solar.year;m=solar.month;d=solar.day;
      }
    }
    const date=[y,m,d].join('-');
    const repeated=+field('birth-hour').value===2&&['1987-10-11','1988-10-9'].includes(date);
    field('clock-fold-wrap').hidden=unknown||!repeated;
  }
  form.addEventListener('change',syncForm);
  form.addEventListener('input',e=>{if(e.target.matches('.date-inputs input,#birth-hour'))syncForm();});

  function numeric(id,min,max,format){
    const el=field(id),raw=el.value.trim().normalize('NFKC'),number=+raw;
    if(!format.test(raw)||number<min||number>max){
      el.focus();
      throw Error(el.getAttribute('aria-label')+' 입력값을 확인해 주세요.');
    }
    return number;
  }
  function profileInput(){
    const year=numeric('birth-year',1962,2050,/^[0-9]{4}$/);
    const month=numeric('birth-month',1,12,/^[0-9]{1,2}$/);
    const day=numeric('birth-day',1,31,/^[0-9]{1,2}$/);
    const unknown=field('unknown').checked;
    const h=unknown?0:numeric('birth-hour',0,23,/^[0-9]{1,2}$/);
    const min=unknown?0:numeric('birth-minute',0,59,/^[0-9]{1,2}$/);
    const city=regionPicker?.getValue();
    if(!city){field('city-search').focus();throw Error('검색 결과에서 태어난 지역을 하나 골라 주세요.');}
    const nameDetails=nameForm.read();
    return {date:year+'-'+U.pad(month)+'-'+U.pad(day),time:U.pad(h)+':'+U.pad(min),unknown,city,
      calendar:$('input[name="calendar"]:checked').value,leap:field('leap').checked,
      gender:$('input[name="gender"]:checked')?.value||null,correction:field('correction').checked,
      boundary:field('boundary').value,clockFold:field('clock-fold-wrap').hidden?'':field('clock-fold').value,
      approx:unknown?field('approx').value:'',
      nameDetails,name:model?.result.input.name||''};
  }
  function fillForm(p){
    const [y,m,d]=p.date.split('-'),[h,min]=(p.time||'00:00').split(':');
    field('birth-year').value=y;field('birth-month').value=m;field('birth-day').value=d;
    field('birth-hour').value=h;field('birth-minute').value=min;field('unknown').checked=!!p.unknown;
    $$('input[name="calendar"]').forEach(x=>{x.checked=x.value===(p.calendar||'solar');});
    $$('input[name="gender"]').forEach(x=>{x.checked=x.value===p.gender;});
    field('leap').checked=!!p.leap;
    field('correction').checked=p.correction!==false;field('boundary').value=p.boundary==='23'?'23':'0';
    field('clock-fold').value=p.clockFold||'';
    field('approx').value=p.approx||'';
    regionPicker.setValue(p.city);
    nameForm=root.SajuNamePicker.mount(nameBox,p.nameDetails);
    syncForm();
  }

  function showPanel(name,question,focus=false){
    if(!model||!panels.some(p=>p.id===name+'-panel'))return;
    active=name;
    for(const panel of panels)panel.hidden=panel.id!==name+'-panel';
    $$('.report-nav button').forEach(btn=>{
      if(btn.dataset.tab===name)btn.setAttribute('aria-current','true');
      else btn.removeAttribute('aria-current');
    });
    const host=field(name+'-panel');
    if(!visited.has(name)||(name==='questions'&&question)){
      if(name==='overview')root.SajuReport.overview(host,model);
      if(name==='details')root.SajuDetail.show(host,model);
      if(name==='questions')root.SajuQuestionView.mount(host,model,question);
      if(name==='name')root.SajuName.mount(host,model.result.input.nameDetails,model,next=>{
        model.result.input.nameDetails=next;
        nameForm=root.SajuNamePicker.mount(nameBox,next);
        showHeader();
      });
      if(name==='timing')root.SajuTiming.mount(host,model);
      visited.add(name);
    }
    if(focus){const heading=$('h2',host);heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});$('.report-nav').scrollIntoView({block:'start'});}
  }
  function showHeader(){
    const r=model.result;
    const display=root.SajuName.display(r.input.nameDetails)||r.input.name;
    field('report-title').textContent=display&&display!=='나'?display+'님의 사주':'나의 사주';
    field('profile-meta').textContent=(r.input.calendar==='lunar'?'음력 ':'양력 ')+r.input.date.replace(/-/g,'. ')+
      (r.input.calendar==='lunar'&&r.input.leap?' (윤달)':'')+' · '+(r.input.unknown?(r.approxLabel?r.approxLabel+'쯤':'출생 시간 모름'):r.input.time)+' · '+r.input.city;
  }
  function reveal(input){
    const result=S.calculate(input);
    model=R.build(result);
    visited.clear();
    panels.forEach(panel=>{panel.replaceChildren();panel.onclick=null;});
    field('welcome').hidden=true;
    field('report').hidden=false;
    showHeader();
    showPanel('overview');
    field('report-title').focus({preventScroll:true});
    field('report').scrollIntoView({block:'start'});
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(busy)return;
    busy=true;formError.hidden=true;
    const submit=$('.form-submit');
    submit.disabled=true;submit.setAttribute('aria-busy','true');
    try{
      await ensureRegions();
      const input=profileInput();
      await prepareEngine();
      syncForm();
      reveal(input);
    }catch(e){
      formError.hidden=false;formError.textContent=e.message;
    }finally{
      busy=false;submit.disabled=false;submit.removeAttribute('aria-busy');
    }
  });

  function readProfiles(){
    try{
      const list=JSON.parse(localStorage.getItem(storageKey)||'[]');
      return Array.isArray(list)?list.filter(item=>item&&typeof item.date==='string').slice(0,20):[];
    }catch{return [];}
  }
  function writeProfiles(value){localStorage.setItem(storageKey,JSON.stringify(value));}
  function saved(){
    const list=readProfiles();
    U.dialog('<h2>저장한 풀이</h2><p>이 브라우저에 저장된 출생 정보예요.</p>'+
      (list.length?list.map((p,i)=>'<article class="saved-entry"><div><b>'+esc(root.SajuName.display(p.nameDetails)||p.name||'나의 사주')+'</b><p>'+esc(p.date)+' · '+esc(p.city)+'</p></div>'+
        '<div><button type="button" class="button subtle" data-open-saved="'+i+'">열기</button><button type="button" class="text-button" data-remove-saved="'+i+'">삭제</button></div></article>').join(''):
      '<p class="empty-note">저장한 풀이가 없어요. 결과에서 ‘이 기기에 저장’을 눌러 보세요.</p>'));
  }
  field('save-profile').addEventListener('click',()=>{
    if(!model)return;
    const list=readProfiles();
    const row={...model.result.input,id:profileId||crypto.randomUUID?.()||String(Date.now()),saved:new Date().toISOString()};
    try{
      writeProfiles([row,...list.filter(p=>p.id!==row.id&&!(profileId===null&&p.date===row.date&&p.time===row.time&&p.city===row.city&&p.name===row.name&&p.nameDetails?.given===row.nameDetails?.given))].slice(0,20));
      profileId=row.id;U.toast('이 기기에 저장했어요.');
    }catch{U.toast('이 브라우저에서는 저장할 수 없어요.');}
  });

  function method(){
    U.dialog('<h2>계산 기준과 출처</h2><p>한국 음양력과 절입 시각으로 사주표를 계산해요. 종합 풀이는 기준 글자와 다른 글자의 관계를 함께 보고 일상의 예시로 옮겼어요.</p>'+
      '<p>오행 그래프의 비율은 사주표의 글자 구성이에요. 이름에서는 한국어 독음과 뜻, 일반 획수를 확인한 뒤 의미를 설명해요.</p>'+
      '<ul><li><a href="https://astro.kasi.re.kr/life/pageView/8" target="_blank" rel="noopener">한국천문연구원 음양력 변환</a></li><li><a href="https://encykorea.aks.ac.kr/Article/E0025957" target="_blank" rel="noopener">한국학중앙연구원 사주 항목</a></li>'+
      '<li><a href="https://github.com/libhangul/libhangul/blob/main/data/hanja/hanja.txt" target="_blank" rel="noopener">libhangul 한자 사전</a> · <a href="data/libhangul-LICENSE.txt">이용 조건</a></li>'+
      '<li><a href="https://www.unicode.org/reports/tr38/" target="_blank" rel="noopener">Unicode Unihan</a> · <a href="data/unicode-LICENSE.txt">이용 조건</a></li>'+
      '<li><a href="https://github.com/swuhalee/korea-regions-with-coords" target="_blank" rel="noopener">국내 출생 지역 좌표 자료</a></li></ul>');
  }
  async function reportFile(){
    const button=field('export-report');
    if(!model||button.disabled)return;
    const {result:r,story:s,scene,uncertain}=model, day=R.stem(r);
    const profile=field('profile-meta').textContent;
    const labels=['좋게 발휘될 때','부담이 커질 때','오늘 해볼 일'];
    const stages=[s.good,s.strain,s.action];
    button.disabled=true;
    try{
      const artwork=await Promise.all([scene,'pressure','next'].map(root.SajuScene.embed));
      const doc='<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>사주정원 풀이</title>'+
        '<style>body{font:17px/1.7 system-ui,sans-serif;background:#f8f5ec;color:#203a32;max-width:760px;margin:auto;padding:24px;overflow-wrap:anywhere}section{background:white;border-radius:16px;padding:20px;margin:14px 0}img{display:block;width:min(100%,560px);height:auto;border-radius:12px}</style>'+
        '<h1>내 사주 풀이</h1><p>'+esc(profile)+'</p><h2>'+esc(s.title)+'</h2><p>'+esc(s.intro)+'</p>'+
        stages.map((x,i)=>'<section>'+artwork[i]+'<h3>'+labels[i]+'</h3><p>'+esc(x)+'</p></section>').join('')+
        '<section><h2>내 사주표</h2><p>'+r.pillars.map(p=>p.title+' '+p.gz).join(' · ')+'</p>'+
        (uncertain?'':'<p>읽는 기준 '+day.han+' · '+day.name+'</p>')+'</section></html>';
      const link=document.createElement('a');
      link.href=URL.createObjectURL(new Blob([doc],{type:'text/html;charset=utf-8'}));
      link.download='사주정원-종합풀이.html';link.click();
      setTimeout(()=>URL.revokeObjectURL(link.href),1000);
    }finally{button.disabled=false;}
  }

  field('saved-open').addEventListener('click',saved);
  field('method-open').addEventListener('click',method);
  field('export-report').addEventListener('click',reportFile);
  field('print-report').addEventListener('click',()=>window.print());
  $('.dialog-close').addEventListener('click',()=>field('detail-dialog').close());
  document.addEventListener('click',async event=>{
    const btn=event.target.closest('button');
    if(!btn)return;
    if(btn.hasAttribute('data-edit')){
      field('welcome').hidden=false;field('report').hidden=true;
      field('birth-year').focus();
    }
    if(btn.dataset.tab)showPanel(btn.dataset.tab,null,true);
    if(btn.dataset.go){
      if(model&&!field('report').hidden)showPanel(btn.dataset.go,btn.dataset.question,true);
      else if(btn.dataset.question){
        const q=root.SajuQuestions.items.find(x=>x.id===btn.dataset.question);
        U.dialog('<h2>'+esc(q.question)+'</h2><p>'+esc(q.explain)+'</p><p>'+esc(q.step)+'</p>'+
          '<button class="button primary" type="button" data-enter>내 사주로 읽기 →</button>');
      }else field('preview-title').scrollIntoView({block:'start'});
    }
    if(btn.hasAttribute('data-enter')){field('detail-dialog').close();field('birth-year').focus();}
    if(btn.hasAttribute('data-open-saved')){
      const row=readProfiles()[+btn.dataset.openSaved];
      if(!row)return;
      btn.disabled=true;
      try{
        await Promise.all([ensureRegions(),prepareEngine()]);
        fillForm(row);reveal(row);profileId=row.id||null;field('detail-dialog').close();
        field('report-title').focus({preventScroll:true});
      }catch(e){U.toast(e.message);}
      finally{btn.disabled=false;}
    }
    if(btn.hasAttribute('data-remove-saved')){
      try{writeProfiles(readProfiles().filter((_,i)=>i!==+btn.dataset.removeSaved));saved();}
      catch{U.toast('저장 정보를 변경할 수 없어요.');}
    }
  });
  syncForm();
})(window);
