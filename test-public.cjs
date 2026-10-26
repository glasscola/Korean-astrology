const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'dist'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),js=fs.readFileSync(path.join(root,'app.js'),'utf8');
let checks=0;function check(name,fn){fn();checks++;console.log('PASS '+name);}
check('첫 방문에 특정인의 날짜·시간 또는 사주 결과를 자동 제공하지 않음',()=>{
 assert.ok(!html.includes('2000-06-05')&&!html.includes('15:34'));
 assert.ok(!js.includes("date:'2000-06-05'")&&!js.includes("name:'하루'"));
 assert.match(html,/<section[^>]+id="report"[^>]+hidden/);
 for(const id of ['birth-year','birth-month','birth-day']){const tag=html.match(new RegExp('<input[^>]+id="'+id+'"[^>]*>'))?.[0];assert.ok(tag,id);assert.ok(!/\bvalue="[^"]+"/.test(tag),id);}
 for(const id of ['birth-hour','birth-minute'])assert.match(html,new RegExp('<input[^>]+id="'+id+'"[^>]+value="00"'));
});
check('게시 파일의 스크립트·스타일·그림·앱 아이콘이 모두 존재함',()=>{
 for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const file=match[1];if(file.startsWith('http')||file.startsWith('data:'))continue;assert.ok(fs.existsSync(path.join(root,file)),file);}
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
 assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
 for(const icon of manifest.icons)assert.ok(fs.existsSync(path.join(root,icon.src)),icon.src);
});
check('UI에서 외부 API·AI 요청 코드를 포함하지 않음',()=>{
 assert.ok(!/\bfetch\s*\(|XMLHttpRequest|new\s+WebSocket/.test(js));
});
console.log(`${checks} publication checks passed.`);
