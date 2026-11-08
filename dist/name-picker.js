(function(root){
  'use strict';
  const U=root.SajuUI, $=U.$, esc=U.escape, names=root.SajuName;
  const pageSize=12;
  let instance=0;

  function mount(host,initial){
    const id='name-picker-'+(++instance);
    const drafts={hanja:{family:'',given:'',meaning:''},korean:{family:'',given:'',meaning:''}};
    let mode=initial?(initial.mode==='hanja'?'hanja':'korean'):'';
    if(mode)drafts[mode]={...drafts[mode],...initial};
    host.innerHTML='<div class="name-fields">'+
      '<fieldset class="name-modes"><legend>입력 방법 <small>선택</small></legend><div class="gender-options">'+
      '<label><input type="radio" name="'+id+'" data-name-mode value="hanja"><span>한자 검색</span></label>'+
      '<label><input type="radio" name="'+id+'" data-name-mode value="korean"><span>한글 입력</span></label>'+
      '</div></fieldset>'+
      '<p class="hint" data-mode-hint>이름 풀이를 원할 때만 입력해 주세요.</p>'+
      '<div class="name-entry" hidden><p class="hint" id="'+id+'-hint" data-name-hint></p>'+
      '<div class="name-pair">'+
      '<div class="name-slot"><label for="'+id+'-family">성 <small>선택</small></label><input id="'+id+'-family" data-field="family" autocomplete="off" spellcheck="false" aria-describedby="'+id+'-hint"></div>'+
      '<div class="name-slot"><label for="'+id+'-given">이름</label><input id="'+id+'-given" data-field="given" autocomplete="off" spellcheck="false" aria-describedby="'+id+'-hint"></div>'+
      '</div>'+
      '<label class="stack" data-meaning hidden>내가 아는 이름의 뜻 <small>선택</small><input data-field="meaning" maxlength="160" placeholder="예: 밝고 건강하게 자라길 바라는 뜻"></label>'+
      '<button type="button" class="text-button name-clear" data-name-clear>이름 입력 건너뛰기</button>'+
      '</div></div>';

    const entry=$('.name-entry',host);
    const field=key=>$('[data-field="'+key+'"]',host);
    const radio=value=>$('[data-name-mode][value="'+value+'"]',host);
    const family=field('family'), given=field('given'), meaning=field('meaning');
    const panel=document.createElement('div');
    panel.className='name-search';
    panel.hidden=true;
    panel.innerHTML='<p class="hint" role="status" data-status></p><div class="name-candidates"></div>'+
      '<button type="button" class="text-button" data-more hidden>후보 더 보기 ↓</button>';
    const status=$('[data-status]',panel), list=$('.name-candidates',panel), more=$('[data-more]',panel);
    let active, hits=[], limit=pageSize, revision=0;

    function close(){
      revision++;
      active=null;
      panel.hidden=true;
    }

    function sync(){
      close();
      entry.hidden=!mode;
      entry.dataset.mode=mode;
      $('[data-mode-hint]',host).hidden=Boolean(mode);
      $('[data-meaning]',entry).hidden=mode!=='korean';
      $('[data-name-hint]',entry).textContent=mode==='hanja'?
        '한글로 이름을 쓰고 한 글자씩 골라요. 한자를 바로 입력해도 돼요.':
        '한자를 모르거나 한글 이름을 쓰는 경우에 선택해요.';
      family.placeholder=mode==='hanja'?'예: 김 또는 金':'예: 김';
      given.placeholder=mode==='hanja'?'예: 민수 또는 敏秀':'예: 하늘';
      for(const key of ['family','given','meaning'])field(key).value=drafts[mode]?.[key]||'';
      if(mode)radio(mode).checked=true;
    }

    function draw(from=0){
      if(from===0)list.replaceChildren();
      list.insertAdjacentHTML('beforeend',hits.slice(from,limit).map(({glyph,reading,meaning},i)=>
        '<button type="button" class="name-choice" data-candidate="'+(from+i)+'"><b lang="ko">'+esc(glyph)+
        '</b><span><strong>'+esc(reading||'독음 미확인')+'</strong>'+
        (meaning?'<small>'+esc(meaning)+'</small>':'')+'</span></button>').join(''));
      more.hidden=limit>=hits.length;
    }

    async function suggest(input,{afterChoice=false,first=false}={}){
      const token=names.searchToken(input.value);
      if(mode!=='hanja'||!token||(afterChoice&&!token.isReading)){close();return;}
      const ticket=++revision;
      active={input,token,value:input.value};
      input.after(panel);
      panel.hidden=false;
      hits=[];limit=pageSize;draw();
      status.textContent='한자 후보를 찾고 있어요.';
      try{
        const matches=await names.search(token.query);
        if(ticket!==revision)return;
        hits=matches;
        status.textContent=hits.length?'‘'+token.query+'’ 검색 결과 '+hits.length.toLocaleString('ko')+'개 · 이름에 쓰는 글자를 골라 주세요.':
          '‘'+token.query+'’의 한자를 찾지 못했어요. 입력을 확인해 주세요.';
        draw();
        if(first&&document.activeElement===input)list.firstElementChild?.focus();
      }catch(error){
        if(ticket===revision)status.textContent=error.message;
      }
    }

    for(const input of [family,given]){
      input.addEventListener('compositionstart',close);
      input.addEventListener('compositionend',()=>suggest(input));
      input.addEventListener('input',e=>{if(!e.isComposing)suggest(input);});
      input.addEventListener('focus',()=>{if(active&&active.input!==input)close();});
      input.addEventListener('keydown',e=>{
        if(e.isComposing||e.keyCode===229||mode!=='hanja')return;
        const token=names.searchToken(input.value);
        if(e.key==='ArrowDown'&&token){
          e.preventDefault();
          if(active?.input===input&&list.firstElementChild)list.firstElementChild.focus();
          else suggest(input,{first:true});
        }else if(e.key==='Enter'&&token?.isReading){
          e.preventDefault();
          if(active?.input===input&&list.firstElementChild)list.firstElementChild.focus();
          else suggest(input,{first:true});
        }else if(e.key==='Escape'&&active){
          e.preventDefault();close();
        }
      });
    }

    list.addEventListener('click',e=>{
      const button=e.target.closest('[data-candidate]');
      if(!button||!active)return;
      const {input,token,value}=active;
      if(input.value!==value)return;
      input.setRangeText(hits[Number(button.dataset.candidate)].glyph,token.start,token.end,'end');
      input.focus({preventScroll:true});
      suggest(input,{afterChoice:true});
    });
    panel.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&active){
        e.preventDefault();
        active.input.focus({preventScroll:true});
        close();
      }
    });
    more.addEventListener('click',()=>{
      const previous=limit;
      limit+=pageSize;
      draw(previous);
      list.children[previous]?.focus();
    });
    host.addEventListener('focusout',e=>{
      if(!host.contains(e.relatedTarget)&&e.relatedTarget)close();
    });
    for(const option of host.querySelectorAll('[data-name-mode]')){
      option.addEventListener('change',()=>{
        if(mode)drafts[mode]={family:family.value,given:given.value,meaning:meaning.value};
        mode=option.value;
        sync();
      });
    }
    $('[data-name-clear]',host).addEventListener('click',()=>{
      radio(mode).checked=false;
      drafts[mode]={family:'',given:'',meaning:''};
      mode='';
      sync();
      radio('hanja').focus();
    });
    sync();
    return {read(){
      if(!mode)return null;
      try{
        return names.validate(mode,family.value,given.value,meaning.value);
      }catch(error){
        const unresolved=mode==='hanja'&&[family,given].find(input=>names.searchToken(input.value)?.isReading);
        const input=unresolved||given;
        host.closest('details')?.setAttribute('open','');
        input.focus();
        if(unresolved)suggest(input);
        throw error;
      }
    }};
  }

  root.SajuNamePicker={mount};
})(window);
