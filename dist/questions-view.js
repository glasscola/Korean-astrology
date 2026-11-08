(function(root){
  'use strict';
  const U=root.SajuUI,Q=root.SajuQuestions,R=root.SajuReading,$=U.$,esc=U.escape;
  const normalized=s=>s.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  function filter(query,category){
    const raw=query.trim().split(/\s+/).map(normalized).filter(Boolean);
    const pool=Q.items.filter(q=>category==='all'||q.category===category);
    if(!raw.length)return pool;
    const joined=raw.join('');
    const needles=raw.filter(s=>s.length>1);
    return pool.map(q=>{
      const text=normalized(q.question+' '+q.keywords+' '+Q.groups[q.category].label);
      const aliases=q.keywords.split(' ').map(normalized).filter(word=>word.length>=2);
      const score=(text.includes(joined)?6:0)+needles.reduce((n,word)=>n+Number(text.includes(word)||aliases.some(key=>word.includes(key))),0);
      return {q,score};
    }).filter(x=>x.score).sort((a,b)=>b.score-a.score).map(x=>x.q);
  }
  function answer(model,q){
    const key=R.best(model,q.prefs);
    const g=key?R.groups[key]:null;
    const evidence=key?R.basis(model,[key])[0].facts:[];
    return '<div class="answer-image">'+root.SajuScene(Q.groups[q.category].scene)+'</div>'+
      '<div class="answer-body"><span class="eyebrow">'+Q.groups[q.category].label+'</span><h3 tabindex="-1" data-answer-title>'+esc(q.question)+'</h3>'+
      '<p class="answer-main">'+esc(q.title)+'</p><p>'+esc(q.explain)+'</p>'+
      (g?'<div class="personal"><b>내 사주에 대입하면</b><p>'+esc(Q.lenses[q.category][key])+'</p></div>':'<div class="personal"><b>이 질문에서 살펴볼 점</b><p>'+(model.uncertain?'출생 시간에 따라 사주 풀이가 달라질 수 있어요. 지금은 상황을 정리하는 방법부터 볼 수 있어요.':'관련 주제가 사주표에서 두드러지지 않아 생활 예시를 먼저 정리했어요.')+'</p></div>')+
      '<div class="answer-action"><span aria-hidden="true">✓</span><div><b>오늘 해볼 수 있는 한 가지</b><p>'+esc(q.step)+'</p></div></div>'+
      (evidence.length?'<details class="plain-details"><summary>내 사주에서 이렇게 읽었어요</summary><p>'+esc(g.term)+'은 '+esc(g.role)+'에 비유해요.</p><ul>'+evidence.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ul></details>':'')+
      (q.id==='timing'?'<button type="button" class="button subtle" data-go="timing">시기별 풀이 열기 →</button>':'')+'</div>';
  }
  function mount(host,model,initial){
    let category=initial?Q.items.find(q=>q.id===initial)?.category||'all':'all';
    let selected=Q.items.find(q=>q.id===initial)||Q.items.find(q=>q.id==='career');
    let limit=8;
    host.innerHTML='<div class="section-title question-title"><span class="eyebrow">일상에서 골라 읽는 사주</span><h2>지금 어떤 고민이 있나요?</h2><p>일, 관계, 돈처럼 궁금한 상황을 고르면 내 사주에서 함께 볼 점과 바로 해볼 방법을 알려드려요.</p></div>'+
      '<div class="question-controls"><label class="question-search"><span aria-hidden="true">⌕</span><span class="sr">질문 검색</span><input type="search" placeholder="예: 이직, 연락, 저축, 번아웃" autocomplete="off" data-search-questions></label><div class="filter-buttons" role="group" aria-label="질문 분야">'+
      [['all',{label:'전체'}],...Object.entries(Q.groups)].map(([k,g])=>'<button type="button" data-category="'+k+'" aria-pressed="'+(category===k)+'">'+g.label+'</button>').join('')+'</div></div>'+
      '<div class="question-layout"><div class="question-list-area"><div class="question-count" role="status" data-count></div><div class="question-list" data-list></div><button type="button" class="button subtle more-questions" data-more hidden>질문 더 보기 ↓</button></div><article class="card question-answer" data-answer aria-live="polite"></article></div>';
    const search=$('[data-search-questions]',host),list=$('[data-list]',host), result=$('[data-answer]',host), more=$('[data-more]',host);
    function draw(){
      const rows=filter(search.value,category);
      $('[data-count]',host).textContent=rows.length?'질문 '+rows.length+'개':'찾은 질문 0개';
      list.innerHTML=rows.length?rows.slice(0,limit).map(q=>'<button type="button" data-select="'+q.id+'" aria-pressed="'+(q.id===selected?.id)+'"><span>'+esc(q.question)+'</span><span aria-hidden="true">↗</span></button>').join(''):
        '<p class="empty-note">다른 말로 검색해 보세요. ‘일’, ‘연애’, ‘공부’처럼 짧은 단어로도 찾을 수 있어요.</p>';
      more.hidden=limit>=rows.length;
    }
    function show(q,focus=false){
      if(!q)return;
      selected=q;draw();
      result.innerHTML=answer(model,q);
      if(focus){
        $('[data-answer-title]',result).focus({preventScroll:true});
        if(matchMedia('(max-width: 740px)').matches)result.scrollIntoView({block:'start'});
      }
    }
    search.addEventListener('input',()=>{limit=8;draw();});
    search.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();show(filter(search.value,category)[0],true);}});
    more.addEventListener('click',()=>{limit+=8;draw();list.querySelectorAll('button')[limit-8]?.focus();});
    host.onclick=e=>{
      const button=e.target.closest('[data-category], [data-select]');
      if(!button)return;
      if(button.hasAttribute('data-category')){
        category=button.dataset.category;limit=8;
        U.$$('[data-category]',host).forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
        draw();
      } else show(Q.items.find(q=>q.id===button.dataset.select),true);
    };
    show(selected);
  }
  root.SajuQuestionView={mount,filter};
})(window);
