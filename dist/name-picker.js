(function(root){
  'use strict';
  const U=root.SajuUI, $=U.$, esc=U.escape, names=root.SajuName;
  const pageSize=10;
  let instance=0;

  function mount(host,initial){
    const id='name-picker-'+(++instance);
    host.innerHTML='<div class="name-fields">'+
      '<label for="'+id+'">이름 <small>선택</small></label><div class="name-heading">'+
      '<input id="'+id+'" data-name autocomplete="off" spellcheck="false" maxlength="48" placeholder="예: 홍길동">'+
      '<label class="check"><input type="checkbox" data-hanja aria-controls="'+id+'-hanja"> 한자 이름 선택</label></div>'+
      '<div class="name-search" id="'+id+'-hanja" data-picker hidden>'+
      '<p class="hint" data-empty>위에 이름을 적으면 한자 이름을 고를 수 있어요.</p>'+
      '<div class="name-search-body" data-body hidden>'+
      '<div class="name-slots" role="group" aria-label="한자 이름 글자"></div>'+
      '<label class="stack" for="'+id+'-query">한자 검색</label>'+
      '<input id="'+id+'-query" data-query type="search" autocomplete="off" spellcheck="false" maxlength="40" placeholder="예: 홍, 붉을 홍, 전주 이">'+
      '<p class="hint" role="status" data-status></p><div class="name-candidates"></div>'+
      '<button type="button" class="text-button" data-more hidden>더 보기 ↓</button>'+
      '</div></div></div>';
    const name=$('[data-name]',host), checked=$('[data-hanja]',host), picker=$('[data-picker]',host);
    const body=$('[data-body]',host), slots=$('.name-slots',host), query=$('[data-query]',host);
    const status=$('[data-status]',host), list=$('.name-candidates',host), more=$('[data-more]',host);
    const savedDisplay=names.display(initial);
    const oldFamily=names.nameParts(initial?.family||'').letters.length;
    const savedLetters=names.nameParts(savedDisplay).letters;
    name.value=oldFamily>1&&oldFamily<savedLetters.length?
      savedLetters.slice(0,oldFamily).join('')+' '+savedLetters.slice(oldFamily).join(''):savedDisplay;
    checked.checked=initial?.mode==='hanja'||Array.isArray(initial?.hanjaDraft);
    function parseName(text){
      const parsed=names.nameParts(text);
      if(initial?.given&&parsed.letters.join('')===savedDisplay)parsed.familySize=oldFamily;
      return parsed;
    }
    let parts=parseName(name.value);
    let picks=initial?.mode==='hanja'?names.nameParts((initial.family||'')+initial.given).letters:
      parts.letters.map((_,i)=>initial?.hanjaDraft?.[i]||'');
    const nextBlank=()=>parts.letters.findIndex((_,i)=>!picks[i]);
    let active=Math.max(0,nextBlank()), revision=0, hits=[], limit=pageSize;

    function drawSlots(){
      slots.innerHTML=parts.letters.map((letter,i)=>{
        const pick=picks[i];
        return '<button type="button" class="name-slot" data-slot="'+i+'" aria-pressed="'+(i===active)+'" aria-label="'+
          esc((i+1)+'번째 글자 '+letter+(pick?', '+pick+' 선택됨':''))+'"><span>'+esc(letter)+'</span><b lang="ko">'+
          esc(pick||'＋')+'</b></button>';
      }).join('');
    }

    function drawResults(from=0){
      if(from===0)list.replaceChildren();
      list.insertAdjacentHTML('beforeend',hits.slice(from,limit).map(({glyph,reading,meaning},i)=>
        '<button type="button" class="name-choice" data-candidate="'+(from+i)+'"><b lang="ko">'+esc(glyph)+'</b><span>'+
        '<strong>'+esc(meaning||reading||'입력한 글자')+'</strong></span></button>').join(''));
      more.hidden=limit>=hits.length;
    }

    async function search({focus=false}={}){
      const ticket=++revision;
      hits=[];limit=pageSize;drawResults();
      if(!checked.checked||!parts.letters.length)return;
      const reading=parts.letters[active], text=query.value.trim()||reading;
      const options={reading,surname:active<parts.familySize};
      status.textContent='한자를 찾고 있어요.';
      try{
        const matches=await names.search(text,options);
        if(ticket!==revision)return;
        hits=matches.length||!names.isHanja(text)?matches:[{glyph:text,reading:'',meaning:''}];
        status.textContent=hits.length?'‘'+reading+'’ 자리에 넣을 한자를 골라 주세요.':'맞는 한자가 없어요. 음이나 뜻을 확인해 주세요.';
        drawResults();
        if(focus&&document.activeElement===query)list.firstElementChild?.focus();
      }catch(error){
        if(ticket===revision)status.textContent=error.message;
      }
    }

    function refresh(){
      picker.hidden=!checked.checked;
      body.hidden=!parts.letters.length;
      $('[data-empty]',picker).hidden=Boolean(parts.letters.length);
      if(!picker.hidden&&!body.hidden)drawSlots();
      search();
    }

    function updateName(){
      const next=parseName(name.value);
      if(next.letters.join('')===parts.letters.join('')&&next.familySize===parts.familySize)return;
      picks=next.letters.map((letter,i)=>names.isHanja(letter)?letter:letter===parts.letters[i]?picks[i]||'':'');
      parts=next;
      if(parts.letters.some(names.isHanja))checked.checked=true;
      active=Math.max(0,nextBlank());
      query.value='';
      refresh();
    }

    name.addEventListener('input',e=>{if(!e.isComposing)updateName();});
    name.addEventListener('compositionend',updateName);
    checked.addEventListener('change',refresh);
    query.addEventListener('compositionstart',()=>{revision++;hits=[];drawResults();});
    query.addEventListener('compositionend',()=>search());
    query.addEventListener('input',e=>{if(!e.isComposing)search();});
    query.addEventListener('keydown',e=>{
      if(e.isComposing||e.keyCode===229||!['Enter','ArrowDown'].includes(e.key))return;
      e.preventDefault();
      if(list.firstElementChild)list.firstElementChild.focus();
      else search({focus:true});
    });
    slots.addEventListener('click',e=>{
      const button=e.target.closest('[data-slot]');
      if(!button)return;
      active=Number(button.dataset.slot);
      query.value='';
      drawSlots();
      slots.children[active].focus({preventScroll:true});
      search();
    });
    list.addEventListener('click',e=>{
      const button=e.target.closest('[data-candidate]');
      const choice=button&&hits[Number(button.dataset.candidate)];
      if(!choice)return;
      picks[active]=choice.glyph;
      const next=nextBlank();
      if(next!==-1)active=next;
      query.value='';
      drawSlots();
      slots.children[active].focus({preventScroll:true});
      if(next!==-1)search();
      else{
        revision++;hits=[];drawResults();
        status.textContent='한자 이름 '+picks.join('')+'을 선택했어요.';
      }
    });
    more.addEventListener('click',()=>{
      const previous=limit;
      limit+=pageSize;drawResults(previous);
      list.children[previous]?.focus();
    });
    refresh();
    return {read(){
      updateName();
      try{
        const meaning=parts.letters.join('')===savedDisplay?initial?.meaning||'':'';
        return names.fromEditor(parts,picks,checked.checked,meaning);
      }catch(error){
        name.focus();
        throw error;
      }
    }};
  }
  root.SajuNamePicker={mount};
})(window);
