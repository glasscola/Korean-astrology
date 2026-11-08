(function(root){
  'use strict';
  const assets=new URL('assets/watercolor/',document.currentScript.src);
  const descriptions={
    focus:'정원 테이블에 앉아 노트에 오늘 할 일을 정리하는 사람',
    pressure:'바람에 종이가 날리는 정원에서 잠시 손을 멈추고 생각하는 사람',
    next:'작은 화분에 초록 모종을 심는 사람',
    talk:'나무 그늘에서 차를 마시며 이야기를 나누는 두 사람',
    money:'정원 테이블에서 노트와 동전을 살피는 사람',
    learn:'나뭇잎 사이로 빛이 드는 자리에서 책을 읽고 메모하는 사람',
    paths:'개울 옆 갈림길에 서서 두 갈래 오솔길을 바라보는 사람',
    name:'정원에서 먹을 묻힌 붓과 빈 종이를 준비하는 사람'
  };
  function get(id){
    const key=Object.hasOwn(descriptions,id)?id:'focus';
    return {description:descriptions[key],url:new URL(key+'.webp',assets).href};
  }
  function markup(scene,src,loading){
    return '<img class="scene" src="'+src+'" alt="'+scene.description+'" width="720" height="360"'+
      (loading?' loading="lazy" decoding="async"':'')+'>';
  }
  function picture(id){
    const scene=get(id);
    return markup(scene,scene.url,true);
  }
  picture.embed=async function(id){
    const scene=get(id);
    const img=new Image();
    img.src=scene.url;
    try{
      await img.decode();
      const canvas=document.createElement('canvas');
      canvas.width=img.naturalWidth;
      canvas.height=img.naturalHeight;
      canvas.getContext('2d').drawImage(img,0,0);
      return markup(scene,canvas.toDataURL('image/webp',0.84),false);
    }catch{
      return markup(scene,scene.url,false);
    }
  };
  root.SajuScene=picture;
})(window);
