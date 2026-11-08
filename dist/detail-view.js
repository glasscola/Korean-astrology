(function(root){
  'use strict';
  const U=root.SajuUI,S=root.Saju,R=root.SajuReading,esc=U.escape;
  const godCopy={
    비견:'스스로 기준을 세우고 일을 내 방식으로 해보는 쪽', 겁재:'동료와 힘을 모으고 경쟁 속에서 배우는 쪽',
    식신:'배운 것을 꾸준히 만들고 보여주는 쪽', 상관:'불편한 점을 찾아 다른 방법을 제안하는 쪽',
    편재:'기회를 알아보고 필요한 자원을 연결하는 쪽', 정재:'정해진 시간과 돈을 계획에 맞게 관리하는 쪽',
    편관:'급한 일이나 큰 책임을 맡았을 때 대응하는 쪽', 정관:'정해진 약속과 기준을 맞추며 신뢰를 쌓는 쪽',
    편인:'정보를 파고들고 뜻밖의 연결을 발견하는 쪽', 정인:'자료나 사람의 도움을 받아 차근차근 배우는 쪽'
  };
  function meaning(god){return godCopy[god]||'';}
  const dates=['태어난 해','태어난 달','태어난 날','태어난 시간'];
  const stageCopy={
    장생:'처음 배우고 자라는 때',목욕:'새로운 환경이나 표현을 시험하는 때',관대:'역할을 갖춰 밖으로 나서는 때',
    건록:'익숙한 일에서 자리를 잡는 때',제왕:'주도권이나 활동이 가장 두드러지는 때',쇠:'속도를 조절하며 쌓아온 것을 챙기는 때',
    병:'힘을 쓰는 양을 조정하는 때',사:'한 단계를 마무리하고 안으로 정리하는 때',묘:'경험이나 자원을 모아두는 때',
    절:'이전 흐름을 정리하고 다음을 준비하는 때',태:'새로운 방향의 씨앗이 생기는 때',양:'조건을 갖추며 돌보는 때'
  };
  function pillar(p,i,r){
    const main=p.hidden.at(-1);
    const upper=i===2?'이 글자는 다른 글자와의 관계를 계산할 때 기준이 돼요.':
      '윗글자는 '+meaning(p.god)+'으로 읽어요.';
    const lower='아랫글자는 속에서 중심이 되는 '+main.han+'을 기준으로 '+meaning(p.bgod)+'으로 읽어요.';
    return '<article class="card pillar"><span class="eyebrow">'+dates[i]+' · '+p.title+'</span>'+
      '<div class="pillar-sign"><strong lang="ko">'+p.gz+'</strong><b>'+p.stem+p.branch+'</b></div>'+
      '<div class="sign-pair"><div style="--light:'+S.E[p.e].pale+'"><span>윗글자</span><b>'+p.gz[0]+' '+p.stem+' · '+S.E[p.e].name+'</b></div><div style="--light:'+S.E[p.be].pale+'"><span>아랫글자</span><b>'+p.gz[1]+' '+p.branch+' · '+S.E[p.be].name+'</b></div></div>'+
      '<p>'+upper+'</p><p>'+lower+'</p>'+
      '<details class="plain-details"><summary>'+p.stem+p.branch+' 자세히 보기</summary>'+
      '<dl class="technical"><dt>아랫글자 속 구성 · 지장간</dt><dd>아랫글자를 이루는 요소를 전통 방식으로 나눠 적어요.</dd>'+
      '<dd>'+p.hidden.map(h=>h.han+' '+h.name+' · '+h.god).join(' / ')+'</dd>'+
      '<dt>전통의 단계 이름 · 12운성</dt><dd><b>'+p.stage+'</b> · '+stageCopy[p.stage]+'에 비유해요.</dd>'+
      '<dt>태어난 해와 비교한 표시 · 12신살</dt><dd><b>'+p.sal12+'</b> · 태어난 해의 아랫글자를 기준으로 분류한 이름이에요.</dd></dl></details></article>';
  }
  function show(host,model){
    const r=model.result,day=R.stem(r);
    const relations=r.relations.map(s=>'<div class="relation"><b>'+esc(s.han)+' · '+esc(s.type)+'</b><p>'+dates[s.a]+'와 '+dates[s.b]+'에서 연결된 글자를 찾았어요. '+(s.type==='충'?'두 글자를 함께 볼 때 변하거나 조정할 부분을 살피는 데 써요.':'두 글자의 역할을 함께 살피는 단서로 써요.')+'</p></div>').join('');
    const roles=R.keys.map(key=>{const g=R.groups[key], ev=model.evidence[key];return '<details class="plain-details role-row"><summary><span>'+g.plain+'</span> <small>'+g.term+'</small></summary><p>'+g.good+'</p>'+
      (ev.length?'<ul>'+ev.map(e=>'<li><b>'+e.god+'</b> · '+meaning(e.god)+'<small>'+e.place+' '+e.han+'</small></li>').join('')+'</ul>':'<p class="small">이 사주표의 기본 구성에서 해당 역할이 드러나지 않아요.</p>')+'</details>';}).join('');
    host.innerHTML='<div class="section-title"><span class="eyebrow">풀이의 근거</span><h2>내 사주표를 한 칸씩 읽어요</h2><p>태어난 해·달·날·시간을 각각 두 글자로 적은 표예요. 먼저 <b>태어난 날</b>에서 다른 글자를 읽는 기준을 찾을 수 있어요.</p></div>'+
      '<div class="read-key"><b>'+day.han+' · '+day.name+'</b><p>'+(r.uncertainDay?'시간에 따라 달라질 수 있는 후보의 기준 글자예요.':'태어난 날의 윗글자예요. '+day.explain+' 이 글자와 나머지 글자를 비교해 일과 관계의 특징을 읽어요.')+'</p></div>'+
      (model.uncertain?'<p class="limited-note">출생 시간의 기준에 따라 달라질 수 있는 후보 사주표예요.</p>':'')+
      '<div class="pillar-grid">'+r.pillars.map((p,i)=>pillar(p,i,r)).join('')+
      (r.input.unknown?'<article class="card pillar empty-pillar"><span class="eyebrow">태어난 시간</span><h3>시간 모름</h3><p>시간에 해당하는 글자는 출생 시각을 알면 계산할 수 있어요.</p></article>':'')+'</div>'+
      '<div class="detail-grid"><section class="card roles-card"><h2>글자마다 맡는 역할</h2><p>다른 글자가 기준 글자와 어떤 관계인지 분류한 이름이 ‘십성’이에요. 아래에서 생활 속 뜻과 연결해 볼 수 있어요.</p>'+roles+'</section>'+
      '<section class="card relationship-card"><h2>같이 살펴보는 글자</h2><p>전통 사주에서는 서로 연결되는 글자를 ‘합’, 맞서는 짝을 ‘충’이라고 해요.</p>'+
      (relations||'<p class="empty-note">이 사주표에서 표시할 주요 합이나 충이 없어요.</p>')+
      '<details class="plain-details"><summary>추가로 읽는 전통 상징 · 신살과 길성</summary><p>정해진 글자 조합에서 찾는 보조 단서예요. 삶의 사건은 전체 상황과 함께 봐요.</p>'+
      (r.stars.length?r.stars.map(s=>'<div class="relation"><b>'+esc(s.label)+' <small>'+esc(s.name)+'</small></b><p>'+esc(s.action)+'</p><small>'+esc(s.basis)+'</small></div>').join(''):'<p class="small">이 기준으로 표시할 조합이 없어요.</p>')+
      '</details></section></div>'+
      '<details class="plain-details calculation-details"><summary>계산 설정과 출생 기록</summary><p>양력 '+r.solar.year+'. '+r.solar.month+'. '+r.solar.day+'. · 음력 '+r.lunar.year+'. '+r.lunar.month+'. '+r.lunar.day+'.'+(r.lunar.intercalation?' (윤달)':'')+'</p>'+
      '<p>'+(r.input.unknown?'시간 모름 · 시주 제외':'입력 시각 '+esc(r.input.time)+' · 적용 시각 '+r.local.toISOString().slice(0,16).replace('T',' '))+'</p>'+
      '<p>경도 보정 '+r.correction+'분'+(r.dst?' · 서머타임 −60분':'')+' · 일주 경계 '+esc(r.input.boundary)+':00</p></details>';
  }
  root.SajuDetail={show,meaning};
})(window);
