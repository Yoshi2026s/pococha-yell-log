const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
function take(src,start,end){const i=src.indexOf(start),j=src.indexOf(end,i);assert(i>=0&&j>i,`missing ${start}`);return src.slice(i,j)}
function make(){
 const file=target,src=fs.readFileSync(file,'utf8');
 const map=new Map(),listeners={},nodes={},toasts=[];let fail=false;
 const localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>{if(fail)throw Error('quota');map.set(k,v)},removeItem:k=>map.delete(k),key:i=>[...map.keys()][i],get length(){return map.size}};
 const $=id=>nodes[id]||=( {className:'',hidden:false,textContent:'',innerHTML:'',dataset:{},attributes:{},getAttribute(k){return this.attributes[k]??null},setAttribute(k,v){this.attributes[k]=String(v)},removeAttribute(k){delete this.attributes[k]},lastElementChild:{textContent:''},handlers:{},addEventListener(e,fn){this.handlers[e]=fn},classList:{contains(k){return nodes[id].className.split(' ').includes(k)}}} );
 const context=vm.createContext({console,assert,Blob,JSON,Date,Math,Number,String,Object,Array,Promise,Map,Set,localStorage,$,navigator:{onLine:true},window:{addEventListener:(e,fn)=>listeners[e]=fn},setTimeout:()=>1,clearTimeout:()=>{},document:{body:{inert:false},querySelector:q=>q==='.month'?$('monthBar'):null},__toasts:toasts,__map:map,__fail:v=>fail=v,__nodes:nodes,__listeners:listeners});
 let code=take(src,'const BACKUP_MAX_BYTES=','const N=')+`const N=50,YMAX=99999999;
 const vIdx=v=>Number.isInteger(v)&&v>=0&&v<N;
 const parsePk=k=>{const m=/^f(\\d+)_o(\\d+)$/.exec(k);return m&&vIdx(+m[1])&&vIdx(+m[2])?[+m[1],+m[2]]:null};
 const schNorm=v=>v;const pad=n=>String(n).padStart(2,'0');const esc=s=>String(s);const patsDoc=()=>({p:{},a:{}});const listsDoc=()=>({});
 const S={ym:'2026-10',month:{records:{}},mLoaded:true,goals:{},oinfo:{},ryt:{},tab:'rec'};let db=null,dl=null,unsubM=null,scrollToday=false;const mExists={},inflight={};let fcCache=null,undo=null;const monthCache={},showToast=m=>__toasts.push(m);const IMG={all:async()=>({})};
 const defaultDay=()=>2,hideToast=()=>{},loadPrevKeys=()=>{},render=()=>{},renderSoon=()=>{},checkBk=()=>{},dayPrepareNavigation=()=>true,daySaveMirror=()=>{};`;
 code+=take(src,'const ls={','const pref=');
 code+=take(src,'function ymParts(ym){','function defaultDay(){');
 code+=take(src,'function dayMonthPrefs(','function dayMinuteHtml(');
 code+=take(src,'function packMonth(mo){','/* ---------- 保存');
 code+=take(src,'const pend={};','/* ---------- データ読込');
 code+=take(src,'function subscribeMonth(){','/* ---------- 記録の編集');
 code+=take(src,'function goMonth(ym){',"$('prevM').onclick");
 code+=take(src,"$('monthPick').addEventListener('change'",'// 9 タブごとのスクロール位置を記憶');
 code+=take(src,"{ const el=document.querySelector('.month');",'// キー操作：');
 code+=take(src,'async function allMonths(){','function renderEom(){');
 code+=take(src,"window.addEventListener('pagehide'",'let lastDay=');
 code+=`globalThis.api={S,pend,unpackMonth,packMonth,flush,goMonth,allMonths,queueMonth,setDb:v=>db=v,setDl:v=>dl=v,setImages:v=>IMG.all=async()=>v,getImp:()=>impData};`;
 new vm.Script(code,{filename:file}).runInContext(context);
 return {api:context.api,context,nodes,localStorage,fail:v=>fail=v,map,listeners,toasts};
}
async function run(){
 {
  const t=make();t.api.S.month.records.f0_o0={2:{c:1,m:15}};t.api.queueMonth('2026-10',{records:{f0_o0:{2:15}}});t.api.goMonth('2026-10');
  assert.equal(t.api.S.month.records.f0_o0[2].m,15);t.api.S.month.records.f0_o0[2].m+=5;t.api.queueMonth('2026-10',{records:{f0_o0:{2:20}}});t.api.goMonth('2026-09');t.api.goMonth('2026-10');
  assert.equal(t.api.S.month.records.f0_o0[2].m,20);assert.equal(JSON.parse(t.localStorage.getItem('pk:months/2026-10')).records.f0_o0[2],20);
  console.log('PASS: same-month reload and switch away/back retain new records');
 }
 {
  const t=make();t.api.S.month.records.f0_o0={2:{c:1,m:15}};t.api.queueMonth('2026-10',{records:{f0_o0:{2:15}}});t.listeners.pagehide();
  assert.equal(JSON.parse(t.localStorage.getItem('pk:months/2026-10')).records.f0_o0[2],15);
  console.log('PASS: pagehide persists immediately, without awaiting a microtask');
 }
 {
  const t=make();t.api.S.month.records.f0_o0={2:{c:1,m:15}};t.api.queueMonth('2026-10',{records:{f0_o0:{2:15}}});t.fail(true);t.api.goMonth('2026-09');
  assert.equal(t.api.S.ym,'2026-10');assert(t.api.pend['months/2026-10']);assert.equal((await t.api.allMonths())['2026-10'].records.f0_o0[2],15);
  t.fail(false);await t.api.flush();assert.equal(Object.keys(t.api.pend).length,0);assert.equal(JSON.parse(t.localStorage.getItem('pk:months/2026-10')).records.f0_o0[2],15);
  console.log('PASS: storage failure retains record, includes it in backup, and can retry');
 }
 {
  const t=make(),r=t.api.unpackMonth({records:{f0_o0:{1:{c:1,m:-50},2:{c:1,m:'-Infinity'},3:{c:1,m:'abc'},4:{c:1,m:1500},5:{c:1,m:15.9},6:Infinity,7:35.8}}}).records.f0_o0;
  for(const e of Object.values(r))assert(Number.isInteger(e.m)&&e.m>=0&&e.m<=1440);
  assert.equal(r[1].m,0);assert.equal(r[4].m,1440);assert.equal(r[5].m,15);assert.equal(r[7].m,35);assert.equal(r[6],undefined);
  console.log('PASS: legacy and numeric imported minutes reject non-finite values and normalize range');
 }
 {
  const t=make();const writes=[];t.api.setDb({doc:p=>({set:async d=>writes.push([p,d]),update:async d=>writes.push([p,d])})});t.api.S.month.records.f0_o0={2:{c:1,m:15}};t.api.queueMonth('2026-10',{records:{f0_o0:{2:15}}});await t.api.flush();
  assert.equal(writes.length,1);assert.equal(writes[0][0],'months/2026-10');assert.equal(writes[0][1].records.f0_o0[2],15);
  console.log('PASS: online month writes keep existing asynchronous database path');
 }
 {
  const t=make();const images={};for(let i=0;i<50;i++)images['o'+i]='data:image/jpeg;base64,'+'A'.repeat(234000);t.api.setImages(images);let saved=null;t.api.setDl({save:async d=>saved=d});await t.nodes.expBtn.onclick();assert(saved);assert(new Blob([saved.data]).size>5*1024*1024);
  const months=JSON.parse(saved.data).months;for(let i=0;i<241;i++){const y=2000+Math.floor(i/12),m=i%12+1;months[y+'-'+String(m).padStart(2,'0')]={records:{}}}const json=JSON.stringify({...JSON.parse(saved.data),months});
  await t.nodes.impFile.handlers.change({target:{files:[{size:new Blob([json]).size,name:'large.json',text:async()=>json}],value:''}});assert(t.api.getImp());assert.equal(t.api.getImp().months.length,241);assert.equal(Object.keys(t.api.getImp().oimg).length,50);
  console.log('PASS: >5MB exported image backup and all 241 months are accepted');
 }
 {
  const t=make();t.api.setImages({o0:'A'.repeat(32*1024*1024)});let saved=false;t.api.setDl({save:async()=>saved=true});await t.nodes.expBtn.onclick();assert.equal(saved,false);assert.match(t.nodes.status.lastElementChild.textContent,/32MB/);
  await t.nodes.impFile.handlers.change({target:{files:[{size:32*1024*1024+1,name:'huge.json',text:async()=>{throw Error('should not read')}}],value:''}});assert.equal(t.api.getImp(),null);assert.match(t.nodes.impConfirm.innerHTML,/32MB/);
  console.log('PASS: export and import consistently reject >32MB with a visible message');
 }
 {
  const t=make();t.localStorage.setItem('pk:months/2026-10',JSON.stringify({records:{f0_o0:{2:10}}}));t.api.S.month.records.f0_o0={2:{c:1,m:15}};t.api.queueMonth('2026-10',{records:{f0_o0:{2:15}}});
  const json=JSON.stringify({app:'pococha-jikan-kasegi',months:{'2026-10':{records:{f0_o0:{2:200}}}}});const select=()=>t.nodes.impFile.handlers.change({target:{files:[{size:json.length,name:'restore.json',text:async()=>json}],value:''}});
  await select();t.fail(true);await t.nodes.impConfirm.handlers.click({target:{id:'impGo',disabled:false}});assert.equal(t.api.getImp(),null);assert.match(t.nodes.impConfirm.innerHTML,/復元を中止/);assert.equal(t.api.S.month.records.f0_o0[2].m,15);assert(t.api.pend['months/2026-10']);assert.equal(JSON.parse(t.localStorage.getItem('pk:months/2026-10')).records.f0_o0[2],10);
  t.fail(false);await t.api.flush();assert.equal(JSON.parse(t.localStorage.getItem('pk:months/2026-10')).records.f0_o0[2],15);await select();await t.nodes.impConfirm.handlers.click({target:{id:'impGo',disabled:false}});await t.api.flush();assert.equal(t.api.S.month.records.f0_o0[2].m,200);assert.equal(JSON.parse(t.localStorage.getItem('pk:months/2026-10')).records.f0_o0[2],200);
  console.log('PASS: restore stops while local saves fail; after recovery restored data is not overwritten by old pending writes');
 }
 {
  const t=make();t.api.S.month.records.f0_o0={2:{c:1,m:15}};t.api.queueMonth('2026-10',{records:{f0_o0:{2:15}}});t.fail(true);t.nodes.monthPick.value='2026-09';t.nodes.monthPick.handlers.change({target:t.nodes.monthPick});assert.equal(t.nodes.monthPick.value,'2026-10');assert.equal(t.api.S.ym,'2026-10');assert.equal(t.api.goMonth('2026-09'),false);assert.match(t.nodes.status.lastElementChild.textContent,/保存容量/);
  t.fail(false);assert.equal(t.api.goMonth('2026-09'),true);assert.equal(t.api.S.ym,'2026-09');
  console.log('PASS: failed month navigation restores picker and returns false; successful navigation returns true');
 }
 {
  const t=make();t.api.S.month.records.f0_o0={2:{c:1,m:15}};t.api.queueMonth('2026-10',{records:{f0_o0:{2:15}}});const start=()=>t.nodes.monthBar.handlers.touchstart({touches:[{clientX:100,clientY:0}]});const end=()=>t.nodes.monthBar.handlers.touchend({changedTouches:[{clientX:0,clientY:0}],preventDefault(){}});
  t.fail(true);start();end();assert.equal(t.api.S.ym,'2026-10');assert.equal(t.toasts.length,0);assert.match(t.nodes.status.lastElementChild.textContent,/保存容量/);t.fail(false);start();end();assert.equal(t.api.S.ym,'2026-11');assert.equal(t.toasts.length,1);assert.match(t.toasts[0],/2026年11月度に移動/);
  console.log('PASS: failed swipe keeps save-error status and shows no moved toast; successful swipe shows moved toast');
 }
 console.log('All 10 storage and backup scenarios passed.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
