const fs=require('fs'), vm=require('vm'), assert=require('assert/strict');
const path=require('node:path');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
function part(s,a,b){const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i,a);return s.slice(i,j)}
function setup(file){
  const source=fs.readFileSync(file,'utf8'); const impDeclaration=source.match(/let impData=null(?:, impBusy=false)?;/)[0];
  const c=vm.createContext({console,queueMicrotask});
  const prelude=`
  const tasks=new Map(),elements={},store=new Map(),server=new Map(),writes=[];let taskId=0,quotaFail=false,resubscribed=0,holdNext=false,releaseWrite=null,throwSubscribe=false;
  const setTimeout=(fn,ms)=>{const id=++taskId;if(ms>=800&&ms<1601)queueMicrotask(fn);else tasks.set(id,fn);return id};
  const clearTimeout=id=>tasks.delete(id);
  const window={addEventListener(){}};const navigator={onLine:true};const document={body:{inert:false}};
  const localStorage={removeItem:k=>store.delete(k)};
  const ls={get:k=>store.has(k)?JSON.parse(store.get(k)):null,set:(k,v)=>{if(quotaFail)return false;store.set(k,JSON.stringify(v));return true}};
  function $(id){return elements[id]||(elements[id]={dataset:{},className:'',hidden:false,innerHTML:'',lastElementChild:{textContent:''},classList:{contains(s){return elements[id].className.split(' ').includes(s)}},attributes:{},getAttribute(name){return this.attributes[name]??null},setAttribute(name,v){this.attributes[name]=v},removeAttribute(name){delete this.attributes[name]},listeners:{},addEventListener(name,fn){this.listeners[name]=fn}})}
  const N=50,YMAX=99999999,S={ym:'2026-10',month:{records:{f0_o0:{2:{c:1,m:30}}}},oinfo:{}},fcCache=null,mExists={},inflight={},monthCache={};
  let db=null;
  const vIdx=n=>Number.isInteger(n)&&n>=0&&n<N;
  const parsePk=k=>{const m=/^f(\\d+)_o(\\d+)$/.exec(k);return m&&vIdx(+m[1])&&vIdx(+m[2])?[+m[1],+m[2]]:null};
  const schNorm=x=>x;function daySaveMirror(){}
  function subscribeMonth(){if(throwSubscribe)throw new Error('Injected render error');resubscribed++}
  function online(){db={doc:p=>({set:async v=>{if(holdNext){holdNext=false;await new Promise(r=>releaseWrite=r)}writes.push({path:p,minute:v.records?.f0_o0?.['2']});server.set(p,JSON.parse(JSON.stringify(v)))},update:async v=>{writes.push({path:p,minute:v.records?.f0_o0?.['2']});deepMerge(server.get(p)||{},v)}})}};
  function backup(){impData={months:[['2026-10',{records:{f0_o0:{2:5}}}]]}}
  function clickRestore(){return $('impConfirm').listeners.click({target:{id:'impGo',disabled:false}})}
  `;
  vm.runInContext(prelude+impDeclaration+part(source,'function packMonth(','/* ---------- データ読込 ---------- */')+part(source,"$('impConfirm').addEventListener('click'",'\n\nfunction renderEom()'),c);
  return c;
}
const run=(c,s)=>vm.runInContext(s,c);
async function suite(file){
  const r={};let c=setup(file);
  run(c,`online();navigator.onLine=false;server.set('months/2026-10',{records:{f0_o0:{2:10}}});queueMonth(S.ym,{records:{f0_o0:{2:30}}});backup()`);
  await run(c,'clickRestore()');
  r.offline={restoreWrites:run(c,'writes.length'),pendingRetained:run(c,"!!pend['months/2026-10']"),memoryMinute:run(c,'S.month.records.f0_o0[2].m'),abortMessage:run(c,"$('impConfirm').innerHTML.includes('復元を中止')")};
  run(c,'navigator.onLine=true');await run(c,'flush()');
  r.offline.afterReconnectMinute=run(c,"server.get('months/2026-10').records.f0_o0[2]");
  c=setup(file);
  run(c,`online();for(let f=0;f<50;f++)for(let o=0;o<50;o++){const row=S.month.records['f'+f+'_o'+o]={};for(let d=1;d<=31;d++)row[d]={c:1,m:1440}};queueMonth(S.ym,{records:{f0_o0:{2:1440}}});backup()`);
  await run(c,'clickRestore()');
  r.oversize={restoreWrites:run(c,'writes.length'),pendingRetained:run(c,"!!pend['months/2026-10']"),memoryMinute:run(c,'S.month.records.f0_o0[2].m'),abortMessage:run(c,"$('impConfirm').innerHTML.includes('復元を中止')")};
  c=setup(file);
  run(c,`online();holdNext=true;queueMonth(S.ym,{records:{f0_o0:{2:30}}});const first=flush();backup();const restoring=clickRestore();`);
  await Promise.resolve();await Promise.resolve();
  r.inflight={sendingDuringWait:run(c,'Object.keys(sending).length'),restoreWritesBeforeRelease:run(c,'writes.length')};
  run(c,'releaseWrite()');await run(c,'restoring');
  r.inflight.restoreWritesAfterRelease=run(c,'writes.map(w=>w.minute)');
  r.inflight.sendingAfter=run(c,'Object.keys(sending).length');
  r.inflight.finalMinute=run(c,"server.get('months/2026-10').records.f0_o0[2]");
  c=setup(file);
  run(c,`online();holdNext=true;queueMonth(S.ym,{records:{f0_o0:{2:30}}});const first=flush();backup();const restoring=clickRestore();`);
  await Promise.resolve();await Promise.resolve();
  run(c,`S.month.records.f0_o0[2]={c:1,m:60};queueMonth(S.ym,{records:{f0_o0:{2:60}}});const later=flush();releaseWrite()`);
  await run(c,'restoring');await run(c,'later');
  r.concurrent={writes:run(c,'writes.map(w=>w.minute)'),abortMessage:run(c,"$('impConfirm').innerHTML.includes('復元を中止')"),finalMinute:run(c,"server.get('months/2026-10').records.f0_o0[2]")};
  c=setup(file);
  run(c,`store.set('pk:months/2026-10',JSON.stringify({records:{f0_o0:{2:10}}}));quotaFail=true;queueMonth(S.ym,{records:{f0_o0:{2:30}}});backup()`);
  await run(c,'clickRestore()');
  r.localFailure={storedMinute:run(c,"ls.get('pk:months/2026-10').records.f0_o0[2]"),pendingRetained:run(c,"!!pend['months/2026-10']"),abortMessage:run(c,"$('impConfirm').innerHTML.includes('復元を中止')")};
  c=setup(file);
  run(c,`queueMonth(S.ym,{records:{f0_o0:{2:30}}});backup()`);await run(c,'clickRestore()');
  r.localSuccess={storedMinute:run(c,"ls.get('pk:months/2026-10').records.f0_o0[2]"),pendingCount:run(c,'Object.keys(pend).length'),resubscribed:run(c,'resubscribed')};
  return r;
}
function snapshot(c){return run(c,`({inert:document.body.inert,busy:impBusy,ariaBusy:$('impConfirm').getAttribute('aria-busy'),pending:Object.keys(pend).length,sending:Object.keys(sending).length})`)}
(async()=>{
  const file=target;
  const regression=await suite(file);
  assert.equal(regression.offline.restoreWrites,0);
  assert.equal(regression.oversize.restoreWrites,0);
  assert.equal(regression.inflight.finalMinute,5);
  assert.deepEqual(Array.from(regression.concurrent.writes),[30,60]);
  assert.equal(regression.localFailure.storedMinute,10);
  assert.equal(regression.localSuccess.storedMinute,5);
  let c=setup(file);
  run(c,`online();holdNext=true;queueMonth(S.ym,{records:{f0_o0:{2:30}}});backup();const restoring=clickRestore()`);
  await Promise.resolve();await Promise.resolve();
  const locked=snapshot(c);
  assert.equal(locked.inert,true);assert.equal(locked.busy,true);assert.equal(locked.ariaBusy,'true');
  await run(c,`$('impConfirm').listeners.click({target:{id:'impCancel'}})`);
  assert.equal(run(c,'!!impData'),true);assert.equal(run(c,"$('impConfirm').hidden"),false);
  await run(c,'clickRestore()');
  assert.equal(run(c,'writes.length'),0);
  run(c,`if(!document.body.inert){S.month.records.f0_o0[2]={c:1,m:60};queueMonth(S.ym,{records:{f0_o0:{2:60}}})}`);
  assert.equal(run(c,'S.month.records.f0_o0[2].m'),30);
  run(c,'releaseWrite()');await run(c,'restoring');
  const unlocked=snapshot(c);
  assert.equal(unlocked.inert,false);assert.equal(unlocked.busy,false);assert.equal(unlocked.ariaBusy,null);
  assert.deepEqual(Array.from(run(c,'writes.map(w=>w.minute)')),[30,5]);
  c=setup(file);
  run(c,`document.body.inert=true;$('impConfirm').setAttribute('aria-busy','false');backup()`);
  await run(c,'clickRestore()');
  const preserved=snapshot(c);
  assert.equal(preserved.inert,true);assert.equal(preserved.ariaBusy,'false');assert.equal(preserved.busy,false);
  c=setup(file);
  run(c,`online();navigator.onLine=false;queueMonth(S.ym,{records:{f0_o0:{2:30}}});backup()`);await run(c,'clickRestore()');
  const aborted=snapshot(c);
  assert.equal(aborted.inert,false);assert.equal(aborted.busy,false);assert.equal(aborted.ariaBusy,null);assert.equal(aborted.pending,1);
  assert.equal(run(c,"$('impConfirm').innerHTML.includes('復元を中止')"),true);
  c=setup(file);
  run(c,`db={doc:()=>({set:async()=>{const e=new Error('denied');e.code='permission_denied';throw e}})};backup()`);await run(c,'clickRestore()');
  const handledFailure=snapshot(c);
  assert.equal(handledFailure.inert,false);assert.equal(handledFailure.busy,false);assert.equal(handledFailure.ariaBusy,null);
  assert.equal(run(c,"$('impConfirm').innerHTML.includes('一部の復元に失敗')"),true);
  c=setup(file);
  run(c,'throwSubscribe=true;backup()');await run(c,'clickRestore()');
  const unexpectedFailure=snapshot(c);
  assert.equal(unexpectedFailure.inert,false);assert.equal(unexpectedFailure.busy,false);assert.equal(unexpectedFailure.ariaBusy,null);
  assert.equal(run(c,"$('impConfirm').innerHTML.includes('復元を完了できませんでした')"),true);
  assert.equal(run(c,"$('status').classList.contains('err')"),true);
  const result={regression,locked,unlocked,preserved,aborted,handledFailure,unexpectedFailure,passed:11,assertions:34,method:'Real extracted restore handler; deferred save promise verifies lock timing, duplicate/cancel guards, failure cleanup, and preservation of existing inert/aria-busy state. Trusted-pointer blocking is supplied by the standard inert property and should be checked in browser separately.'};
  console.log('All 11 restore scenarios passed (34 assertions): pending protection, active-save waiting, concurrent chain detection, local restore, input lock, duplicate/cancel guards, preserved UI state, and cleanup after failures.');
})().catch(e=>{console.error(e);process.exitCode=1});
