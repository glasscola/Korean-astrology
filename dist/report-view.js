(function(root){
  'use strict';
  const U=root.SajuUI,S=root.Saju,R=root.SajuReading,Q=root.SajuQuestions,esc=U.escape,$=U.$;
  function questionLinks(ids=Q.featured) {
    return ids.map(id=>Q.items.find(q=>q.id===id)).filter(Boolean).map(q=>
      '<button type="button" data-go="questions" data-question="'+q.id+'"><span>'+esc(q.question)+'</span><span aria-hidden="true">↗</span></button>').join('');
  }
  function basis(model) {
    const rows=R.basis(model,model.active);
    return rows.length?'<details class="plain-details evidence"><summary>이렇게 풀이한 이유</summary><p>태어난 달의 글자와 다른 위치에서 함께 드러나는 특징을 살폈어요.</p>'+
      rows.map(r=>'<p><b>'+r.label+'</b> <small>('+r.term+')</small><br>'+esc(r.facts.join(' / '))+'</p>').join('')+'</details>':'';
  }
  function chart(host,model) {
    const title='<span class="eyebrow">내 사주의 구성</span><h2>어떤 오행이 들어 있을까요?</h2><p>그래프를 눌러 비율과 내 사주에서 맡는 역할을 확인해 보세요.</p>';
    if(model.uncertain){host.innerHTML=title+'<p class="empty-note">태어난 시각을 확인한 뒤 구성의 차이를 볼 수 있어요. 후보 사주표는 자세히 보기에서 확인할 수 있어요.</p>';return;}
    const {result}=model;
    host.innerHTML='<div class="chart-title">'+title+'</div>'+
      '<div class="element-chart" role="group" aria-label="오행 그래프">'+S.E.map((e,i)=>
        '<button type="button" aria-pressed="false" aria-controls="element-note" data-element="'+i+'" style="--tone:'+e.color+';--light:'+e.pale+';--amount:'+result.percent[i]+'%"><span class="element-symbol">'+e.han+'</span><b>'+e.name+'</b><span class="element-track" aria-hidden="true"><i></i></span><span data-element-value aria-hidden="true">＋</span></button>').join('')+
      '</div><div id="element-note" class="element-note" aria-live="polite" hidden></div>';
    const note=$('#element-note',host);
    host.addEventListener('click',e=>{
      const row=e.target.closest('[data-element]');
      if(!row)return;
      const already=row.getAttribute('aria-pressed')==='true';
      U.$$('[data-element]',host).forEach(b=>{
        const selected=!already&&b===row;
        b.setAttribute('aria-pressed',String(selected));
        $('[data-element-value]',b).textContent=selected?result.percent[+b.dataset.element].toFixed(1)+'%':'＋';
      });
      if(already){note.hidden=true;return;}
      const idx=+row.dataset.element, el=S.E[idx], detail=R.element(model,idx);
      note.hidden=false;
      note.innerHTML='<b>'+el.name+' '+el.han+' · '+detail.value.toFixed(1)+'%</b><p>'+esc(detail.reading)+'</p>';
    });
  }
  function overview(host,model){
    const {result,story}=model;
    const day=R.stem(result);
    const intro=story.intro===story.good?'태어난 날의 글자를 기준으로, 다른 위치에서 어떤 특징이 자주 보이는지 읽었어요.':story.intro;
    const cards=[
      ['좋게 발휘될 때',story.good,model.scene],
      ['부담이 커질 때',story.strain,'pressure'],
      ['오늘 해볼 일',story.action,'next']
    ];
    host.innerHTML='<div class="result-hero"><div class="result-lead"><span class="eyebrow"><i></i> 종합 풀이</span><h2>'+esc(story.title)+'</h2><p>'+esc(intro)+'</p><button type="button" class="button primary" data-go="questions">내 고민으로 읽기 <span aria-hidden="true">↗</span></button></div>'+
      '<figure>'+root.SajuScene(model.scene)+'</figure></div>'+
      (result.input.unknown&&!model.uncertain?'<p class="limited-note">'+(result.approxLabel?result.approxLabel+'에 태어났다고 알려주셨어요. ':'정확한 출생 시간 없이 계산했어요. ')+'시간에 해당하는 글자는 빼고 읽었어요.</p>':'')+
      (result.repeated&&!result.input.clockFold?'<p class="limited-note">태어난 시각이 서머타임 종료일에 두 번 있었어요. 출생 시간 계산 설정에서 당시 시계를 선택해 주세요.</p>':'')+
      '<div class="scene-grid">'+cards.map(([title,body,scene],i)=>'<article class="card scene-card">'+root.SajuScene(scene)+'<div><span class="eyebrow">0'+(i+1)+'</span><h3>'+title+'</h3><p>'+esc(body)+'</p></div></article>').join('')+'</div>'+
      basis(model)+
      '<section class="question-callout"><div><span class="eyebrow">질문으로 보기</span><h2>내 일상에 대입해 볼까요?</h2><p>궁금한 질문을 골라 내 사주에 맞는 설명을 읽어보세요.</p><button type="button" class="text-button" data-go="questions">질문 '+Q.items.length+'개 모두 보기 ↗</button></div><div class="preview-links">'+questionLinks()+'</div></section>'+
      '<div class="analysis-grid"><article class="card element-card" data-chart></article>'+
      '<article class="card day-card"><span class="eyebrow">사주표 읽는 법</span><h2>내 사주를 읽는 기준</h2>'+
      (result.uncertainDay?'<p>태어난 시간에 따라 기준 글자가 달라질 수 있어요.</p>':
        '<div class="day-badge"><strong lang="ko">'+day.han+'</strong><div><b>'+day.name+'</b><span>태어난 날에 해당하는 윗글자</span></div></div><p>사주에서는 이 글자를 ‘일간’이라 불러요. 다른 글자가 나와 어떤 관계인지 비교할 때 쓰는 기준이에요.</p><p>'+day.explain+'</p>')+
      '<button class="text-button" type="button" data-go="details">내 사주표에서 확인 ↗</button></article></div>';
    chart($('[data-chart]',host),model);
  }
  root.SajuReport={overview,questionLinks};
})(window);
