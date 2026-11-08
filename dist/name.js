(function(root){
  'use strict';
  const U=root.SajuUI, $=U.$, esc=U.escape;
  const shards=new Map(), count=8;
  const glyphs=new Intl.Segmenter('ko',{granularity:'grapheme'});
  const han=/^(?:\p{Unified_Ideograph}|[\uF900-\uFAFF\u{2F800}-\u{2FA1F}])[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]?$/u;
  const hangul=/^[가-힣]+$/;
  const groupOf={
    expression:{chars:'炳明昭晟煥熙燦暎映晶光暉輝星晧亮日昇曜照燁昊',label:'빛과 드러남',detail:'빛나거나 밝게 드러나는 뜻에서, 생각이나 마음을 선명하게 전하는 모습을 떠올릴 수 있어요.'},
    standards:{chars:'正貞直信義定律均恒誠實眞真謙淳靖',label:'바르고 한결같음',detail:'바름이나 성실함을 나타내는 뜻에서, 작은 약속을 지키며 신뢰를 쌓는 모습을 떠올릴 수 있어요.'},
    learning:{chars:'智知睿叡慧賢學文書思聰哲敏硏理才藝',label:'배움과 이해',detail:'슬기나 배움과 관련된 뜻에서, 궁금한 것을 살피고 나만의 답을 찾는 모습을 떠올릴 수 있어요.'},
    resources:{chars:'珍寶玉琳珉瑛琦玹珠瑤瑞榮裕富豐厚恩惠仁慈和善溫德',label:'소중함과 돌봄',detail:'귀하게 여기거나 따뜻하게 대하는 뜻에서, 가지고 있는 것과 곁의 사람을 소중히 살피는 모습을 떠올릴 수 있어요.'},
    self:{chars:'志毅勇健建立進勝雄強俊秀卓成宇浩大永遠高志剛',label:'의지와 성장',detail:'뜻을 세우거나 앞으로 나아가는 의미에서, 내가 지켜가고 싶은 방향을 떠올릴 수 있어요.'}
  };
  const motifs=[['木林森松柏柳梅楓竹桐梓', '목'],['火炎焱炳燦煥烈','화'],['土地山岩岳丘堅培','토'],['金銀銅鋼鉉鐵錫鍾錚','금'],['水泉河江海湖洋沐雨澄淵浩潤澤','수']];
  const clean=s=>s.trim().replace(/\s+/g,'');
  const split=s=>[...glyphs.segment(s)].map(x=>x.segment);
  const idOf=c=>c.codePointAt(0)%count;
  const baseGlyph=c=>String.fromCodePoint(c.codePointAt(0));
  const direct=c=>shards.get(idOf(c))?.[c];
  const part=n=>shards.has(n)?Promise.resolve():U.load('data/hanja-'+n+'.js?v=2');
  const safeLength=(text,max)=>split(text).length<=max;
  const sourceNote='<p class="small">독음·뜻은 libhangul과 Unihan, 일반 획수는 Unihan 17.0을 사용해요. 글자에 따라 사전의 대표 뜻이나 읽는 소리가 여럿일 수 있어요.</p>';

  function validate(mode,family,given,meaning) {
    family=clean(family);given=clean(given);meaning=meaning.trim();
    if(!given&&!family&&!meaning)return null;
    if(!given)throw Error('이름을 입력해 주세요.');
    if(!safeLength(family,4)||!safeLength(given,12))throw Error('성은 최대 4글자, 이름은 최대 12글자로 입력해 주세요.');
    if(mode==='hanja'&&![...split(family),...split(given)].every(c=>han.test(c))){
      throw Error('한자 이름의 글자를 확인해 주세요.');
    }
    if(mode!=='hanja'&&![family,given].filter(Boolean).every(c=>hangul.test(c.normalize('NFC'))))throw Error('한글 이름을 입력해 주세요.');
    return {mode,family,given,meaning:mode==='korean'?meaning:''};
  }

  async function lookup(input) {
    const base=baseGlyph(input), normalized=base.normalize('NFC');
    await Promise.all([...new Set([idOf(base),idOf(normalized)])].map(part));
    let row=direct(base);
    const alternate=row?.[2]?.[0]||normalized;
    if(alternate!==base)await part(idOf(alternate));
    const fallback=alternate!==base?direct(alternate):null;
    if(!row)row=fallback;
    return {glyph:input,base:row===fallback&&fallback?alternate:base,readings:row?.[0]||[],
      strokes:direct(base)?.[1]??(base===alternate?row?.[1]:null)??null,
      reference:(!direct(base)&&fallback)?alternate:null};
  }

  let searchIndex;
  // Editorial ordering for given names. The primary surnames use the 2015 census order.
  const givenPriority='吉東同童桐弘洪紅鴻泓敏旻旼珉民玟秀修守洙壽受水士美恩志智芝知惠慧賢玄昇勝承俊準浚埈叡藝睿仁人印潤允侖正貞英榮永映宙宇佑祐友眞真珍鎭辰進振炳秉昊浩皓善宣瑄延妍姸蓮多和禾夏河柔宥有玹鉉瑞書抒舒燦輝奎圭建健大泰太珪';
  const surnamePriority='金李朴崔鄭姜趙尹張林韓吳徐申權黃安宋全洪柳高文梁孫裵白許南沈盧河郭成車周禹朱任羅田閔兪劉丁秦';
  const clanRows=[
    ['김해','김','金'],['밀양','박','朴'],['전주','이','李'],['경주','김','金'],['경주','이','李'],
    ['진주','강','姜'],['경주','최','崔'],['광산','김','金'],['파평','윤','尹'],['청주','한','韓'],
    ['안동','권','權'],['인동','장','張'],['평산','신','申'],['순흥','안','安'],['안동','김','金'],
    ['남양','홍','洪'],['동래','정','鄭'],['해주','오','吳'],['전주','최','崔'],['남평','문','文']
  ];
  const clans=new Map(clanRows.map(([place,reading,glyph])=>[place+reading,{glyph,reading,meaning:place+' '+reading+'씨'}]));
  function byReading() {
    searchIndex ??= Promise.all(Array.from({length:count},(_,i)=>part(i))).then(()=>{
      const index=new Map();
      for(const entries of shards.values()){
        for(const [glyph,[readings]] of Object.entries(entries)){
          if(!han.test(glyph))continue;
          for(const [reading,gloss] of readings){
            if(!index.has(reading))index.set(reading,[]);
            index.get(reading).push({glyph,reading,meanings:gloss.split(',').map(term=>term.trim()).filter(Boolean)});
          }
        }
      }
      return index;
    }).catch(error=>{searchIndex=null;throw error;});
    return searchIndex;
  }

  async function search(input,{reading='',surname=false}={}){
    const raw=input.trim();
    if(han.test(raw)){
      const {glyph,readings,strokes}=await lookup(raw);
      if(!readings.length&&strokes==null)return [];
      const definition=readings.find(([sound,gloss])=>sound===reading&&gloss)||readings.find(([,gloss])=>gloss);
      return [{glyph,reading:readings.map(([sound])=>sound).join(' · '),meaning:definition?.[1].split(',')[0]||''}];
    }
    const query=clean(raw.normalize('NFC'));
    if(!hangul.test(query))return [];
    const clan=clans.get(query.replace(/씨$/,''));
    if(clan)return [clan];
    const index=await byReading();
    const priority=surname?surnamePriority+givenPriority:givenPriority+surnamePriority;
    const rank=glyph=>{
      const position=priority.indexOf(glyph);
      return position<0?priority.length:position;
    };
    const order=(a,b)=>rank(a.glyph)-rank(b.glyph)||Number(Boolean(b.meaning))-Number(Boolean(a.meaning))||a.glyph.localeCompare(b.glyph,'ko');
    if(query.length===1){
      return (index.get(query)||[]).map(hit=>({glyph:hit.glyph,reading:hit.reading,meaning:hit.meanings[0]||''})).sort(order);
    }
    const bySound=(index.get(query.at(-1))||[]).flatMap(hit=>{
      const meaning=hit.meanings.find(term=>clean(term).includes(query)||clean(term).includes(query.slice(0,-1)));
      return meaning?[{glyph:hit.glyph,reading:hit.reading,meaning}]:[];
    });
    if(bySound.length)return bySound.sort(order);
    return (index.get(reading)||[]).flatMap(hit=>{
      const meaning=hit.meanings.find(term=>clean(term).includes(query));
      return meaning?[{glyph:hit.glyph,reading:hit.reading,meaning}]:[];
    }).sort(order);
  }

  function nameParts(text){
    // Normalize Hangul syllables while preserving the user's Hanja and variant selectors.
    const groups=text.trim().split(/\s+/).map(word=>word.replace(/[ᄀ-ᄒ][ᅡ-ᅵ][ᆨ-ᇂ]?/g,sound=>sound.normalize('NFC')));
    const letters=split(groups.join(''));
    const familySize=groups.length>1?split(groups[0]).length:Number(letters.length>1);
    return {letters,familySize};
  }

  function fromEditor(parts,picks,enabled,meaning=''){
    const {letters,familySize}=parts;
    if(!letters.length)return null;
    if(!letters.every(letter=>hangul.test(letter)||han.test(letter)))throw Error('이름에는 한글이나 한자만 입력해 주세요.');
    const hangulName=letters.every(letter=>hangul.test(letter))?letters.join(''):'';
    const make=(mode,values)=>validate(mode,values.slice(0,familySize).join(''),values.slice(familySize).join(''),meaning);
    if(enabled&&letters.every((_,i)=>picks[i]&&han.test(picks[i]))){
      const value=make('hanja',picks);
      if(hangulName)value.hangul=hangulName;
      return value;
    }
    if(!hangulName)throw Error('이름에는 한글을 입력하거나 한자 이름을 모두 채워 주세요.');
    const value=make('korean',letters);
    if(enabled)value.hanjaDraft=letters.map((_,i)=>picks[i]||'');
    return value;
  }

  const display=name=>name?.hangul||(name?(name.family||'')+(name.given||''):'');

  const onset=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  function soundCard(hangulText) {
    return '<div class="glyph-list">'+split(hangulText.normalize('NFC')).map(c=>{
      const n=c.codePointAt(0)-0xAC00;
      return '<article class="glyph-card"><strong>'+esc(c)+'</strong><div><b>첫 글자 '+onset[Math.floor(n/588)]+'</b><span>'+(n%28?'받침이 있는 음절':'받침이 없는 음절')+'</span></div></article>';
    }).join('')+'</div>';
  }

  async function describe(target,name,model){
    if(!name){target.innerHTML='<div class="empty-note"><b>이름을 넣으면 여기에서 풀이를 볼 수 있어요.</b><p>한자가 없다면 한글 이름의 소리와 내가 알려준 뜻을 함께 볼 수 있어요.</p></div>';return;}
    if(name.mode!=='hanja'){
      target.innerHTML='<div class="name-summary"><span class="eyebrow">한글 이름</span><h3>'+esc(name.family+name.given)+'</h3>'+
        (name.meaning?'<p>알려주신 이름의 뜻 · '+esc(name.meaning)+'</p>':'<p>이름을 한 음절씩 나눠 소리의 구성을 살펴봤어요.</p>')+
        (name.hanjaDraft?'<p>한자 이름을 모두 고르면 글자의 뜻도 볼 수 있어요.</p>':'')+'</div>'+soundCard(name.family+name.given);
      return;
    }
    target.innerHTML='<p class="empty-note" role="status">글자 뜻과 획수를 확인하고 있어요.</p>';
    const items=await Promise.all([...split(name.family),...split(name.given)].map(lookup));
    const given=items.slice(split(name.family).length);
    const firstGloss=({readings})=>readings.find(r=>r[1])?.[1].split(',')[0]||'';
    const terms=given.map(firstGloss).filter(Boolean);
    const themes=Object.entries(groupOf).filter(([,theme])=>given.some(item=>theme.chars.includes(item.base)));
    const overlap=themes.find(([key])=>model?.active.includes(key));
    const images=[...new Set(given.flatMap(item=>motifs.filter(([set])=>set.includes(item.base)).map(([,e])=>e)))];
    const knownStrokes=items.every(x=>x.strokes!=null);
    target.innerHTML='<div class="name-summary"><span class="eyebrow">한자 이름</span><h3 lang="ko">'+esc(name.family+name.given)+'</h3>'+
      (name.hangul?'<p>'+esc(name.hangul)+'</p>':'')+
      (terms.length?'<p>이름에 담긴 대표 뜻 · '+terms.map(t=>'‘'+esc(t)+'’').join(' · ')+'</p>':'<p>이 이름은 사전에서 확인한 범위까지 표시했어요.</p>')+'</div>'+
      '<div class="glyph-list">'+items.map(item=>{
        const meanings=[...new Set(item.readings.flatMap(([,g])=>g.split(',').map(t=>t.trim()).filter(Boolean)))];
        return '<article class="glyph-card"><strong lang="ko">'+esc(item.glyph)+'</strong><div><b>'+esc(item.readings.map(([r])=>r).join(' · ')||'독음 자료 미확인')+'</b>'+
          '<span>'+esc(meanings.slice(0,3).join(' · ')||'뜻 자료 미확인')+'</span>'+
          (item.strokes!=null?'<small>일반 '+item.strokes+'획</small>':'')+
          (item.reference?'<small>관련 글자 '+esc(item.reference)+'의 독음·뜻 참고</small>':'')+'</div></article>';
      }).join('')+'</div>'+
      (knownStrokes?'<p class="small">일반 획수 합계 '+items.reduce((s,i)=>s+i.strokes,0)+'획</p>':'')+
      (themes.length?'<div class="name-insight"><h3>이름에서 읽는 이야기</h3>'+themes.slice(0,3).map(([,theme])=>'<p><b>'+theme.label+'</b> '+theme.detail+'</p>').join('')+'</div>':'')+
      (images.length?'<p class="small">뜻에서 떠오르는 자연 이미지 · '+images.join(' · ')+'</p>':'')+
      (model?'<div class="name-insight"><h3>내 사주와 함께 보면</h3><p>'+(overlap?'이름의 ‘'+overlap[1].label+'’과 사주의 ‘'+root.SajuReading.groups[overlap[0]].plain+'’이 생활 속 비슷한 주제로 이어져요.':model.uncertain?'사주는 출생 시간이 확인되면 더 자세히 비교할 수 있어요. 지금은 이름의 뜻부터 볼 수 있어요.':'사주에서 먼저 읽은 주제는 '+model.active.map(k=>root.SajuReading.groups[k].plain).join(' · ')+'이에요. 이름은 위에 적힌 글자 뜻으로 따로 읽어보세요.')+'</p></div>':'')+
      '<details class="plain-details"><summary>이름 풀이 기준</summary>'+sourceNote+'<p class="small">이름 이야기와 자연 이미지는 확인된 뜻을 바탕으로 썼어요. 사주 여덟 글자는 태어난 날과 시간으로 계산해요.</p><a href="https://efamily.scourt.go.kr/cs/CsBltnWrtList.do?bltnbordId=0000010" target="_blank" rel="noopener">법원 인명용 한자 확인 ↗</a></details>';
  }

  function mount(host,name,model,onSave) {
    host.innerHTML='<div class="section-lead"><div><span class="eyebrow">이름의 글자와 뜻</span><h2>내 이름은 어떤 이야기일까요?</h2><p>이름을 입력하고, 한자가 있다면 글자별로 찾아보세요.</p></div>'+root.SajuScene('name')+'</div>'+
      '<div class="name-layout"><form class="card name-editor" novalidate><div data-editor></div><p data-name-error class="error" role="alert" hidden></p><button type="submit" class="button primary">이 이름 풀이 보기 →</button></form><div class="card name-result" aria-live="polite" data-name-result></div></div>';
    const editor=root.SajuNamePicker.mount($('[data-editor]',host),name), result=$('[data-name-result]',host), error=$('[data-name-error]',host);
    let ticket=0;
    async function render(value){
      const n=++ticket;
      const staging=document.createElement('div');
      result.innerHTML='<p class="empty-note" role="status">이름을 확인하고 있어요.</p>';
      try{
        await describe(staging,value,model);
        if(ticket===n)result.replaceChildren(...staging.childNodes);
      }catch(e){if(ticket===n)result.textContent=e.message;}
    }
    $('form',host).addEventListener('submit',e=>{
      e.preventDefault();
      try {
        const value=editor.read();
        error.hidden=true;
        onSave(value);
        render(value);
      } catch(e) {
        error.hidden=false;error.textContent=e.message;
      }
    });
    render(name);
  }
  root.SajuName={install:(i,data)=>shards.set(i,data),validate,lookup,search,nameParts,fromEditor,display,isHanja:char=>han.test(char),mount};
})(window);
