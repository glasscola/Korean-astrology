(function(root){
  'use strict';
  const U=root.SajuUI,S=root.Saju,R=root.SajuReading,esc=U.escape,$=U.$;
  function mount(host,model){
    const today=U.kst();
    const view={year:today.year,month:today.month,day:today.day};
    const r=model.result, pad=U.pad;
    host.innerHTML='<div class="section-lead"><div><span class="eyebrow">날짜별로 읽는 사주</span><h2>선택한 때에는 무엇을 살필까요?</h2><p>날짜를 고르면 그때의 해·달 글자와 출생 사주의 관계를 볼 수 있어요.</p></div>'+root.SajuScene('paths')+'</div>'+
      '<div class="timing-grid"><section class="card date-card"><div class="date-toolbar"><button type="button" class="button subtle" data-step="-1" aria-label="이전 달">‹</button><h3 data-month-title></h3><button type="button" class="button subtle" data-step="1" aria-label="다음 달">›</button></div>'+
      '<label class="stack date-jump">날짜로 이동 <input type="date" min="1962-01-01" max="2050-12-31" data-date-jump></label>'+
      '<div data-calendar></div><p class="small" data-term></p></section><section class="card time-reading" data-time-result aria-live="polite"></section></div>'+
      '<section class="card decade-card"><h3>10년 단위로 보는 흐름 <small>대운</small></h3><div data-decade-list></div></section>';
    const term=$('[data-term]',host), calendar=$('[data-calendar]',host), dateInput=$('[data-date-jump]',host);
    function draw(){
      const {year,month,day}=view, date=year+'-'+pad(month)+'-'+pad(day);
      dateInput.value=date;
      $('[data-month-title]',host).textContent=year+'년 '+month+'월';
      const first=new Date(Date.UTC(year,month-1,1)).getUTCDay(), end=new Date(Date.UTC(year,month,0)).getUTCDate();
      const boundary=S.monthBoundary(year,month);
      calendar.innerHTML='<div class="calendar" role="group" aria-label="'+year+'년 '+month+'월 날짜">'+
        Array.from('일월화수목금토',v=>'<span class="weekday">'+v+'</span>').join('')+
        '<span aria-hidden="true"></span>'.repeat(first)+
        Array.from({length:end},(_,i)=>'<button type="button" data-day="'+(i+1)+'" aria-label="'+(i+1)+'일'+(boundary?.day===i+1?', '+boundary.name:'')+'" aria-pressed="'+(i+1===day)+'">'+(i+1)+(boundary?.day===i+1?'<small aria-hidden="true">•</small>':'')+'</button>').join('')+'</div>';
      term.textContent=boundary?boundary.day+'일 '+boundary.time+' '+boundary.name+'에 달의 글자가 바뀌어요.':'선택한 날짜의 낮 12시 기준이에요.';
      const pillars=S.timePillars(year,month,day);
      const decade=r.decades.filter(d=>d.date<=date).at(-1);
      const parts=[['해',pillars.year],['달',pillars.month],['날',pillars.day]];
      if(decade&&!r.input.unknown&&!model.uncertain)parts.push(['10년 흐름',decade.gz]);
      const matches=parts.flatMap(([label,gz])=>{
        const a=S.STEMS.indexOf(gz[0]), b=S.BRANCHES.indexOf(gz[1]);
        return [{label,han:gz[0],god:S.tg(r.dm,a)},{label,han:gz[1],god:S.tg(r.dm,S.MAIN[b])}];
      });
      const groups=R.keys.map(key=>({key, natal:model.evidence[key].length, added:matches.filter(m=>R.groupFor(m.god)===key)}))
        .filter(x=>x.added.length).sort((a,b)=>(b.added.length+b.natal)-(a.added.length+a.natal));
      const best=groups[0], second=groups[1], g=best&&R.groups[best.key];
      const note=boundary?.day===day?'<p class="small">이 날은 절입 경계예요. 아래는 낮 12시에 해당하는 글자를 사용했어요.</p>':'';
      $('[data-time-result]',host).innerHTML='<span class="eyebrow">'+year+'년 '+month+'월 '+day+'일</span>'+
        (model.uncertain?'<h3>출생 시간을 확인하면 더 자세히 읽을 수 있어요</h3><p>아래는 선택한 날짜의 달력 글자예요.</p>':
          '<h3>'+esc(g.plain)+'을 먼저 살펴봐요</h3><p>'+esc(best.natal?'출생 사주와 이 시기에 모두 나타나는 주제예요.':'선택한 시기에 새로 눈에 띄는 주제예요.')+' '+esc(g.good)+'</p>'+
          (second?'<p>함께 볼 주제는 <b>'+R.groups[second.key].plain+'</b>이에요.</p>':'')+
          '<div class="answer-action"><span aria-hidden="true">✓</span><div><b>그 시기에 해볼 일</b><p>'+esc(g.action)+'</p></div></div>')+
        '<div class="time-facts">'+parts.map(([label,gz])=>'<span><small>'+label+'</small><b>'+gz+'</b></span>').join('')+'</div>'+note+
        (!model.uncertain?'<details class="plain-details"><summary>이 날짜를 풀이한 근거</summary><p>출생 사주에서 '+g.plain+'에 해당하는 관계와 선택한 때의 윗글자·아랫글자를 비교했어요.</p><p>'+best.added.map(e=>e.label+' '+e.han+' · '+e.god).join(' / ')+'</p></details>':'');
      $('[data-decade-list]',host).innerHTML=r.input.unknown||model.uncertain?'<p>태어난 시간이 확인되면 10년 흐름의 시작 시점을 볼 수 있어요.</p>':
        !r.decades.length?'<p>입력 화면에서 시기별 풀이 기준을 고르면 10년 단위 구간을 볼 수 있어요.</p><button type="button" class="text-button" data-edit>기준 선택하기 ↗</button>':
        '<div class="decade-grid">'+r.decades.map(d=>'<div class="decade-item'+(d===decade?' current':'')+'"><b>'+esc(d.date)+'</b><span>'+esc(d.gz)+'</span>'+(d===decade?'<small>선택한 날짜의 구간</small>':'<small>시작일</small>')+'</div>').join('')+'</div>';
    }
    host.onclick=e=>{
      const btn=e.target.closest('[data-step],[data-day]');
      if(!btn)return;
      if(btn.hasAttribute('data-day'))view.day=+btn.dataset.day;
      else {
        const next=new Date(Date.UTC(view.year,view.month-1+Number(btn.dataset.step),1));
        if(next.getUTCFullYear()<1962||next.getUTCFullYear()>2050)return;
        view.year=next.getUTCFullYear();view.month=next.getUTCMonth()+1;view.day=1;
      }
      draw();
      if(btn.hasAttribute('data-day'))$('[data-day="'+view.day+'"]',host)?.focus({preventScroll:true});
    };
    dateInput.addEventListener('change',()=>{
      const [year,month,day]=dateInput.value.split('-').map(Number);
      if(!dateInput.validity.valid||!day||year<1962||year>2050)return;
      Object.assign(view,{year,month,day});draw();
    });
    draw();
  }
  root.SajuTiming={mount};
})(window);
