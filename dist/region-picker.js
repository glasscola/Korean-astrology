(function(root){'use strict';
root.createSajuRegionPicker=function(field){
 const api=root.SajuRegions,input=field.querySelector('#city-search'),value=field.querySelector('#city'),popup=field.querySelector('#city-popup'),list=field.querySelector('#city-options'),status=field.querySelector('#city-results-status'),more=field.querySelector('#city-more'),clear=field.querySelector('#city-clear'),selection=document.querySelector('#city-selection');
 const kinds={sido:'시·도 대표',si:'시',gun:'군',gu:'구',eup:'읍',myeon:'면',dong:'법정동',ri:'리'};
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let shown=20,items=[],active=-1;
 function close(){popup.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;}
 function highlight(index){active=Math.max(0,Math.min(items.length-1,index));list.querySelectorAll('[role=option]').forEach((el,i)=>{el.classList.toggle('active',i===active);el.setAttribute('aria-selected',i===active?'true':'false');});const el=list.querySelector('[data-region-id="'+(items[active]?.id??-1)+'"]');if(el){input.setAttribute('aria-activedescendant',el.id);el.scrollIntoView({block:'nearest'});}}
 function render(){
  const found=api.search(input.value,{limit:shown});items=found.items;active=-1;
  list.innerHTML=items.map(r=>'<button type="button" role="option" tabindex="-1" aria-selected="false" aria-label="'+escape(r.label)+'" id="region-option-'+r.id+'" data-region-id="'+r.id+'"><span class="region-result-copy"><strong>'+escape(r.name)+'</strong><small>'+escape(r.label)+'</small></span><span class="region-kind">'+kinds[r.kind]+'</span></button>').join('');
  status.textContent=input.value.trim()?(found.total?found.total.toLocaleString('ko')+'개 지역 · 전체 지역명을 확인해 선택하세요.':'검색 결과가 없어요. 도시명이나 법정동 이름을 입력해 주세요.'):'전국 17개 시·도 · 도시·시군구·읍면동·리 검색';
  more.hidden=found.total<=shown;more.textContent='20개 더 보기 ('+Math.min(shown,found.total)+' / '+found.total.toLocaleString('ko')+')';
  popup.hidden=false;input.setAttribute('aria-expanded','true');input.removeAttribute('aria-activedescendant');clear.hidden=!input.value;
 }
 function setValue(name){const r=api.resolve(name);value.value=r?.label||'';input.value=r?.label||'';input.setCustomValidity('');clear.hidden=!r;selection.hidden=!r;selection.textContent=r?'✓ '+r.label:'';close();return !!r;}
 function choose(r){setValue(r.label);input.focus({preventScroll:true});close();input.dispatchEvent(new Event('change',{bubbles:true}));}
 input.addEventListener('focus',()=>{shown=20;render();});
 input.addEventListener('input',e=>{value.value='';selection.hidden=true;input.setCustomValidity(input.value?'검색 결과에서 태어난 지역을 선택해 주세요.':'');shown=20;if(!e.isComposing)render();});
 input.addEventListener('compositionend',()=>{shown=20;render();});
 input.addEventListener('keydown',e=>{
  if(e.isComposing)return;
  if(e.key==='Escape'){close();return;}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(popup.hidden)render();if(items.length)highlight(active+(e.key==='ArrowDown'?1:-1));}
  if(e.key==='Enter'&&!popup.hidden&&items.length){e.preventDefault();choose(items[active<0?0:active]);}
  if(e.key==='Tab')close();
 });
 list.addEventListener('pointerdown',e=>{if(e.target.closest('[data-region-id]'))e.preventDefault();});
 list.addEventListener('click',e=>{const el=e.target.closest('[data-region-id]');if(el){const r=api.locations[Number(el.dataset.regionId)];if(r)choose(r);}});
 more.addEventListener('pointerdown',e=>e.preventDefault());more.addEventListener('click',()=>{shown+=20;render();});
 clear.addEventListener('click',()=>{setValue('');input.focus();render();});
 document.addEventListener('pointerdown',e=>{if(!field.contains(e.target))close();});
 input.addEventListener('blur',()=>{setTimeout(()=>{if(!field.contains(document.activeElement))close();},0);});
 return {setValue,close,getValue:()=>value.value};
};
})(typeof window!=='undefined'?window:globalThis);
