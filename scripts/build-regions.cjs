/* Build a browser-local place index from attributed public Korean legal-district data. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const source=process.argv[2];if(!source)throw Error('Usage: node scripts/build-regions.cjs path/to/korea-regions-with-coords.json');
const raw=fs.readFileSync(source),data=JSON.parse(raw),rows=[];
function walk(n,parents=[]){const parts=[...parents,n.name];if(!Number.isFinite(n.lat)||!Number.isFinite(n.lng))throw Error('Missing coordinates: '+parts.join(' '));rows.push([parts.join(' '),n.lat,n.lng,n.kind]);for(const c of n.children||[])walk(c,parts);}
data.sido.forEach(s=>walk(s));
// Add the three new 2026 Incheon district names. Their representative coordinates
// are the mean of the constituent legal-district centers, not precise boundaries.
const incheon=data.sido.find(s=>s.name==='인천광역시'),jung=incheon.children.find(s=>s.name==='중구'),dong=incheon.children.find(s=>s.name==='동구'),seo=incheon.children.find(s=>s.name==='서구');
const islandNames=['남북동','덕교동','무의동','운남동','운북동','운서동','을왕동','중산동'];
const geomdanNames=['금곡동','당하동','대곡동','마전동','백석동','불로동','오류동','왕길동','원당동'];
const additions=[['영종구',jung.children.filter(n=>islandNames.includes(n.name))],['제물포구',[...jung.children.filter(n=>!islandNames.includes(n.name)),...dong.children]],['검단구',seo.children.filter(n=>geomdanNames.includes(n.name))]];
for(const [name,children] of additions)if(!rows.some(r=>r[0]==='인천광역시 '+name))rows.push(['인천광역시 '+name,Number((children.reduce((a,n)=>a+n.lat,0)/children.length).toFixed(6)),Number((children.reduce((a,n)=>a+n.lng,0)/children.length).toFixed(6)),'gu']);
const meta={baseDate:'2026-02',supplementDate:'2026-07-01',count:rows.length,provinces:17,source:'https://github.com/swuhalee/korea-regions-with-coords',sourceSha256:crypto.createHash('sha256').update(raw).digest('hex'),license:'공공누리 제1유형(출처표시)',note:'법정동·리 중심 좌표. 신설 인천 3개 구는 구성 지역 중심 좌표의 평균. 과거 출생지 검색을 위해 종전 중구·동구·서구 명칭도 유지.'};
const api=fs.readFileSync(path.join(__dirname,'regions-api.js.txt'),'utf8');
fs.writeFileSync(path.join(__dirname,'../dist/regions.js'),`/* Korean legal district coordinates; source and attribution: REGION-DATA.md */\n(function(root){'use strict';\nconst rows=${JSON.stringify(rows)};\nconst meta=${JSON.stringify(meta)};\n${api}\n})(typeof window!=='undefined'?window:globalThis);\n`);
console.log(JSON.stringify({count:rows.length,bytes:fs.statSync(path.join(__dirname,'../dist/regions.js')).size,sourceSha256:meta.sourceSha256}));
