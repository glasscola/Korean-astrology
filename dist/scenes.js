(function (root) {
  'use strict';
  const ink = '#334641', paper = '#fff7e5', skin = '#bb7954';
  const outlines = 'stroke="' + ink + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  const person = (x,y,shirt='#60816c',face=skin,flip=false) => '<g transform="translate('+x+' '+y+')'+(flip?' scale(-1 1)':'')+'">'+
    '<path d="M-32 66V46q0-25 24-31h17q27 7 27 31v20" fill="'+shirt+'" '+outlines+'/>'+
    '<path d="M-5 12v9q7 5 13-1V7" fill="'+face+'" '+outlines+'/>'+
    '<path d="M-17-8q3-15 20-15 16 1 19 14v10q-3 15-16 16-14 0-19-12Z" fill="'+face+'" '+outlines+'/>'+
    '<path d="M-20-6q-6-14 3-22c9-10 28-11 39 3q7 9 1 18-3-9-11-13-11 12-32 14Z" fill="'+ink+'"/>'+
    '<circle cx="13" cy="-3" r="1.5" fill="'+ink+'"/><path d="M10 5q3 2 6 0" fill="none" stroke="#683f37" stroke-linecap="round"/></g>';
  const desk = '<path d="M29 119h263M48 122v27m224-27v27" fill="none" stroke="#765742" stroke-width="5" stroke-linecap="round"/>';
  const props = {
    focus: {
      bg:'#f2e9cf', circle:'#edcf8e', label:'책상에서 계획을 정리하는 사람',
      art:person(121,59)+'<path d="M138 101q17 7 36-1" fill="none" stroke="#bb7954" stroke-width="10" stroke-linecap="round"/><path d="M159 108l24-17h54l-18 20Z" fill="#fff5dc" '+outlines+'/><path d="m182 101 24 1m-17-6 24 1" stroke="#a27958" stroke-width="2"/><rect x="212" y="35" width="46" height="39" rx="4" fill="#f9f4da" '+outlines+'/><path d="m221 55 7 7 17-16" fill="none" stroke="#597961" stroke-width="3"/>'+desk
    },
    pressure: {
      bg:'#f7e3d6', circle:'#efb993', label:'여러 부탁과 마감 사이에서 고민하는 사람',
      art:person(152,63,'#9d6353')+'<path d="M131 112q-18-14 0-35" fill="none" stroke="#bb7954" stroke-width="10" stroke-linecap="round"/><rect x="52" y="48" width="42" height="30" rx="5" fill="#fff1ce" '+outlines+'/><rect x="215" y="34" width="52" height="37" rx="5" fill="#fff1ce" '+outlines+'/><path d="M63 59h20m-20 8h14m163-22v12m0 5v1m-45 47h64m-58-6h58m-50-7h48" fill="none" '+outlines+'/>'+desk
    },
    next: {
      bg:'#e1ecde', circle:'#c0d4ab', label:'오늘 할 일을 하나 골라 체크하는 사람',
      art:person(102,67,'#d38e61')+'<rect x="166" y="28" width="87" height="86" rx="8" fill="'+paper+'" '+outlines+'/><path d="M180 47h53m-39 16h40m-40 18h40m-40 18h26" fill="none" stroke="#a79b7d" stroke-width="2.5" stroke-linecap="round"/><path d="m176 63 5 6 10-12" fill="none" stroke="#397050" stroke-width="3.4" stroke-linecap="round"/><path d="m122 107 43-22" stroke="#bb7954" stroke-width="10" stroke-linecap="round"/><path d="m164 86 13-9" stroke="#3a5f50" stroke-width="3" stroke-linecap="round"/>'+desk
    },
    talk: {
      bg:'#ece4ef', circle:'#d9c7df', label:'차 한잔을 두고 서로 이야기를 듣는 두 사람',
      art:person(92,80,'#a96862')+person(231,80,'#5f837b','#945b41',true)+'<path d="M115 127h93m-80 1v20m66-20v20" stroke="#7c5542" stroke-width="4"/><path d="M142 113h11l-2 12h-7Zm25 0h11l-2 12h-7Z" fill="#f4cc8e" '+outlines+'/><path d="M113 24h39q7 0 7 7v16q0 7-7 7h-19l-10 9v-9h-10q-7 0-7-7V31q0-7 7-7Zm69 19h22q7 0 7 7v9q0 7-7 7h-4v7l-8-7h-10q-7 0-7-7v-9q0-7 7-7Z" fill="'+paper+'" '+outlines+'/><path d="M117 35h28m-28 8h19m47 12h17" stroke="#887280" stroke-width="2" stroke-linecap="round"/>'
    },
    money: {
      bg:'#efe8d4', circle:'#d9c694', label:'지출 내역을 노트에 적어 두는 사람',
      art:person(101,62,'#577b70')+'<path d="M126 102 160 94" stroke="#bb7954" stroke-width="10" stroke-linecap="round"/><path d="m155 108 16-25h71l-16 26Z" fill="#fff8e8" '+outlines+'/><path d="M177 91h47m-53 7h47m-44-7-6 13" stroke="#a99371" stroke-width="2"/><circle cx="242" cy="62" r="15" fill="#e4b460" '+outlines+'/><circle cx="266" cy="81" r="12" fill="#e4b460" '+outlines+'/><path d="M237 61h10m-5-6v12m20 14h8" stroke="#88632c" stroke-width="2"/>'+desk
    },
    learn: {
      bg:'#e2eaf0', circle:'#c3d6df', label:'책에서 배운 것을 메모하며 공부하는 사람',
      art:person(142,58,'#727399')+'<path d="M163 100q17 7 26-1" fill="none" stroke="#bb7954" stroke-width="10" stroke-linecap="round"/><path d="m160 109 13-24 21 7 32-7-13 24-24 4Z" fill="#ffefd2" '+outlines+'/><path d="m194 93-5 19m-11-16 9 2m11 1 15-4" stroke="#8a8278" fill="none"/><path d="M53 111h42m-40-6h35m-30-5h31" stroke="#829e8a" stroke-width="5" stroke-linecap="round"/><path d="M229 78h19V43l-11-13" fill="none" '+outlines+'/><path d="m225 21 19 12-10 16-23-9Z" fill="#efbd73" '+outlines+'/>'+desk
    },
    paths: {
      bg:'#e6ebdd', circle:'#c8d7ad', label:'갈림길에서 표지판을 살펴보는 사람',
      art:'<path d="M0 137Q107 97 200 131t120 0v29H0Z" fill="#bfd0b3"/><path d="M139 160q64-21 75-40-12-16-38-18 56-15 75 9 27 25-31 49Z" fill="#f5e5bc"/><path d="M229 116V34m-29 11h45l12 10-12 10h-45Zm50 33h-46l-13 8 13 9h46Z" fill="#e4ba7a" '+outlines+'/>'+person(118,77,'#b86c5b')+'<path d="M88 133q-4-20 13-25h10v25Z" fill="#dda976" '+outlines+'/>'
    },
    name: {
      bg:'#f0e5d6', circle:'#e6c6a5', label:'종이에 글자를 쓰고 그 뜻을 들여다보는 사람',
      art:person(105,65,'#637a72')+'<path d="m153 112 19-39h71l-17 39Z" fill="#fff2d7" '+outlines+'/><path d="m182 90 26-2m-13-8-8 25m17-20 8 18m-30-5 25-2" stroke="#625049" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M125 107q11 2 25-6" stroke="#bb7954" stroke-width="10" fill="none" stroke-linecap="round"/><path d="m144 103 29-15" stroke="#463f37" stroke-width="4" stroke-linecap="round"/>'+desk
    }
  };
  root.SajuScene = function (id) {
    const s=props[id]||props.focus;
    return '<svg class="scene" viewBox="0 0 320 160" role="img" aria-label="'+s.label+'"><rect width="320" height="160" rx="16" fill="'+s.bg+'"/><circle cx="157" cy="78" r="61" fill="'+s.circle+'"/><ellipse cx="159" cy="146" rx="116" ry="8" fill="#334641" opacity=".09"/><g fill="none" stroke="#fff9ea" stroke-width="2" opacity=".85"><path d="M37 47v12m-6-6h12m240 19v10m-5-5h10"/><circle cx="283" cy="37" r="3"/></g>'+s.art+'</svg>';
  };
})(window);
