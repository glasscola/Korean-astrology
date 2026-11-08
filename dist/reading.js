(function (root) {
  'use strict';
  const S = root.Saju;
  const groups = {
    self:{plain:'내 기준과 협업', term:'비겁', key:'self', scene:'paths', role:'내가 결정할 범위와 함께 정할 범위', good:'일을 맡으면 내 기준을 세워 움직이는 편으로 읽어요.', strain:'여럿이 의견을 낼 때 혼자 결정할 때보다 더 답답하게 느껴질 수 있어요.', action:'혼자 정해도 되는 일과 의견을 먼저 물을 일을 나눠 보세요.'},
    expression:{plain:'표현과 만들기', term:'식상', key:'expression', scene:'learn', role:'생각을 밖으로 꺼내고 다듬는 방식', good:'불편한 지점을 발견하거나 생각을 결과물로 만드는 쪽으로 읽어요.', strain:'생각이 빨리 정리돼도 다른 사람이 이해하는 속도는 다를 수 있어요.', action:'개선하고 싶은 점 하나에 작은 예시를 붙여 먼저 보여 주세요.'},
    resources:{plain:'기회와 자원 관리', term:'재성', key:'resources', scene:'money', role:'시간과 돈을 쓰고 결과를 관리하는 방식', good:'시간이나 비용이 어느 정도 들지 보고 일을 현실적으로 정리하는 쪽으로 읽어요.', strain:'기회가 겹치면 챙겨야 할 일까지 함께 늘 수 있어요.', action:'새 일을 맡기 전에 주당 쓸 수 있는 시간과 감당할 비용을 적어 보세요.'},
    standards:{plain:'기준과 책임', term:'관성', key:'standards', scene:'focus', role:'기준을 맞추고 책임을 맡는 방식', good:'기준이 분명한 일에서 빠진 부분을 찾아 끝까지 마무리하는 쪽으로 읽어요.', strain:'다른 사람의 기대까지 내 책임으로 받아들이면 마무리하고도 쉬기 어려울 수 있어요.', action:'시작 전에 완료 조건과 내가 맡을 범위를 한 문장씩 적어 보세요.'},
    learning:{plain:'배움과 생각 정리', term:'인성', key:'learning', scene:'learn', role:'정보를 확인하고 도움을 받아들이는 방식', good:'상황을 이해하고 자료를 묶어 나만의 방식으로 정리하는 쪽으로 읽어요.', strain:'확신이 생길 때까지 조사하느라 첫 시도가 늦어질 수 있어요.', action:'자료를 찾는 시간을 정하고, 그다음에는 아주 작은 결과물을 하나 만들어 보세요.'}
  };
  const keys = Object.keys(groups);
  const paired = {
    'expression:standards':{title:'개선할 점이 잘 보이고, 마무리 기준도 중요해요', intro:'표현하고 개선하는 쪽과 기준을 지키는 쪽을 함께 읽는 사주예요. 두 가지를 어느 순서로 쓸지 정하면 일을 풀기 쉬워질 수 있어요.', good:'문제가 있는 부분을 찾아 고치고, 결과가 요구사항에 맞는지 확인하는 상황에서 두 특징을 함께 쓰기 좋아요.', strain:'처음부터 좋은 결과를 내야 한다고 느끼면 초안을 내기도 전에 수정이 길어질 수 있어요.', action:'초안을 만드는 시간과 검토하는 시간을 따로 두고, 완료 조건을 시작 전에 합의해 보세요.'},
    'learning:standards':{title:'기준을 이해하고 준비할 때 일을 풀기 쉬워요', intro:'책임과 배움이 함께 드러나요. 먼저 요구사항을 이해한 다음 내 방식으로 정리하는 상황을 중심으로 풀이했어요.', good:'새 규정이나 업무를 맡았을 때 기준을 문서로 정리하면 같은 실수를 줄이는 데 강점을 쓰기 좋아요.', strain:'자료가 더 필요하다고 느끼는 동안 책임감 때문에 부담도 쌓일 수 있어요.', action:'시작하기 위해 필요한 자료만 정하고, 확인이 어려운 한 가지는 담당자에게 바로 물어보세요.'},
    'resources:standards':{title:'맡은 일을 챙기되, 책임 범위를 정하는 게 중요해요', intro:'기준과 책임, 시간과 자원을 챙기는 두 가지 주제를 함께 읽었어요.', good:'시간·비용·역할을 정리한 뒤 약속을 지켜야 하는 일에서 강점을 쓰기 좋아요.', strain:'예상보다 일이 늘었는데 마감이나 책임은 그대로면 혼자 버티기 쉬워요.', action:'일이 하나 추가될 때 마감·우선순위·역할 중 무엇을 바꿀지 함께 정해 보세요.'},
    'expression:learning':{title:'배운 것을 작게 만들어 보여줄 때 흐름이 이어져요', intro:'깊이 이해하려는 쪽과 밖으로 표현하려는 쪽이 함께 드러나요.', good:'자료를 그대로 따라가기보다 나만의 예시나 작업물로 바꿀 때 배움이 남는 쪽으로 읽어요.', strain:'더 배우고 나서 보여주려 하면 이미 알고 있는 것도 쓰기 어려워질 수 있어요.', action:'새 자료를 열기 전에 지금 아는 것을 한 문단이나 작은 시제품으로 만들어 보세요.'},
    'resources:self':{title:'스스로 정하고 싶을수록, 함께 쓰는 자원은 먼저 합의해요', intro:'내 선택권과 시간·비용을 조율하는 문제가 함께 드러나요.', good:'목표와 권한이 명확하면 필요한 사람과 자원을 연결하며 추진하는 쪽으로 읽어요.', strain:'함께 맡은 일인데 결정권이나 비용의 경계가 흐리면 부담이 커질 수 있어요.', action:'시작 전에 누가 결정하고 누가 비용을 내며 어디서 멈출지 한 번 적어 보세요.'},
    'expression:self':{title:'내 방식으로 시도하되, 중간에 한 번 보여주세요', intro:'독립적으로 선택하는 쪽과 생각을 밖으로 꺼내는 쪽이 함께 드러나요.', good:'방향을 스스로 정하고 작은 결과를 자주 내는 일에서 강점을 쓰기 좋아요.', strain:'혼자 빠르게 진행하면 상대가 바뀐 이유를 뒤늦게 알 수 있어요.', action:'완성 전에 중간 결과를 공유하고, 바꿔도 되는 부분 하나만 질문해 보세요.'}
  };
  const stemScenes = [
    '오래 가져갈 목표를 세우고, 어떤 순서로 할지 정하는 모습에 빗대요.',
    '같은 목표를 두고 상대나 상황에 맞게 방법을 바꾸는 모습에 빗대요.',
    '생각을 먼저 꺼내 여러 사람이 같은 방향을 보게 하는 모습에 빗대요.',
    '사람이나 작업에서 놓치기 쉬운 작은 차이를 비추는 모습에 빗대요.',
    '일정과 자리가 크게 흔들리지 않도록 중심을 잡는 모습에 빗대요.',
    '주변 상황을 살펴 필요한 자원과 역할을 조정하는 모습에 빗대요.',
    '결정의 기준을 세우고 필요한 것과 덜 필요한 것을 가르는 모습에 빗대요.',
    '작은 오차를 찾아 손보고 세부를 맞추는 모습에 빗대요.',
    '여러 정보와 선택지를 연결해 큰 흐름을 파악하는 모습에 빗대요.',
    '눈에 띄지 않는 변화를 살피며 상황에 맞춰 방법을 찾는 모습에 빗대요.'
  ];
  const groupFor = god => keys[Math.floor(S.TG.indexOf(god)/2)];
  const quiet = {title:'확인된 출생 정보부터 살펴봐요',intro:'태어난 날이나 달의 글자가 시간에 따라 달라질 수 있어요. 정확한 시간이 확인되면 더 구체적으로 읽을 수 있어요.',good:'확인된 생일과 출생지로 가능한 사주표를 살펴볼 수 있어요.',strain:'경계에 있는 시간은 기준이 조금만 달라져도 풀이 근거가 바뀔 수 있어요.',action:'출생 시간이 기록된 자료를 확인하거나, 계산 설정의 시간 기준을 먼저 살펴보세요.'};
  function build(result) {
    const evidence = Object.fromEntries(keys.map(key => [key,[]]));
    const scores = Object.fromEntries(keys.map(key => [key,0]));
    result.pillars.forEach((p,i) => {
      const add=(god,part,han)=>{
        const key=groupFor(god);
        evidence[key].push({god,part,han,place:p.title,position:i});
        scores[key]+=i===1?3:2;
      };
      if (i!==2) add(p.god,'윗글자',p.gz[0]);
      add(p.bgod,'아랫글자',p.gz[1]);
    });
    const ranked = keys.filter(key => evidence[key].length).sort((a,b)=>scores[b]-scores[a]);
    const highest=ranked.filter(k=>scores[k]===scores[ranked[0]]);
    const top=groups[ranked[0]];
    const choices=ranked.slice(0,3).filter(k=>scores[k]>=4);
    const combination=choices.length>=2&&paired[choices.slice(0,2).sort().join(':')];
    const partial=highest.length>1;
    const single={title:top.plain+'에서 특징이 보여요',intro:top.good,good:top.good,strain:top.strain,action:top.action};
    const joint={title:highest.map(k=>groups[k].plain).join(' · ')+'을 함께 봐요',intro:'한 가지 주제로 좁히기 어려워 함께 드러난 특징을 상황별로 나눴어요.',good:highest.slice(0,2).map(k=>groups[k].good).join(' '),strain:'여러 일을 한 번에 챙겨야 할 때 어떤 역할을 먼저 맡을지 헷갈릴 수 있어요.',action:'지금 필요한 역할 하나를 고르고, 다른 일은 나중에 다룰 항목으로 적어 보세요.'};
    const uncertain=result.uncertain||result.uncertainDay||(result.repeated&&!result.input.clockFold);
    const active=uncertain?[]:combination?choices.slice(0,2):partial?highest:[top.key];
    return {result, scores, evidence, ranked, uncertain, active,
      story:uncertain?quiet:combination|| (partial?joint:single), scene:uncertain?'paths':partial&&!combination?'focus':top.scene};
  }
  function best(model,preferences) {
    if(model.uncertain)return null;
    return preferences.map((key,i)=>({key,value:model.scores[key]+(preferences.length-i)*1.25}))
      .filter(x=>model.evidence[x.key].length)
      .sort((a,b)=>b.value-a.value)[0]?.key||null;
  }
  function basis(model,keys) {
    return keys.map(k=>({label:groups[k].plain,term:groups[k].term,
      facts:model.evidence[k].map(e=>e.place+' '+e.han+' · '+e.god)}));
  }
  function stem(result) {
    return {name:S.SK[result.dm]+S.E[result.de].name,han:S.STEMS[result.dm],explain:stemScenes[result.dm]};
  }
  function element(model,index) {
    const {result}=model;
    const g=groups[keys[S.mod(index-result.de,5)]], e=S.E[index], value=result.percent[index];
    const reading=value===0?'이 표에서 '+e.name+'에 해당하는 부분은 비어 있어요. '+g.plain+'은 다른 글자와 생활 속 상황도 함께 살펴봐요.':
      '내 기준 글자와 비교하면 '+e.name+'에서 ‘'+g.plain+'’이라는 주제를 읽어요. '+g.good;
    return {group:g,reading, value};
  }
  const api={groups,keys,groupFor,build,best,basis,stem,element};
  root.SajuReading=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
