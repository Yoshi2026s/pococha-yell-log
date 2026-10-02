const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const path = require('node:path');
const target = path.resolve(process.argv[2] || path.join(__dirname, '..', 'index.html'));
function segment(s, start, end) {
  const a = s.indexOf(start); const b = s.indexOf(end, a);
  assert(a >= 0 && b > a, `Missing segment ${start}`);
  return s.slice(a, b);
}
function setup(filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const context = vm.createContext({console, structuredClone});
  const prelude = `
    const callbacks = new Map(), events = {}, elements = {}, store = new Map(); let timerId = 0;
    const setTimeout = (f, ms) => { const id = ++timerId; callbacks.set(id, {f,ms}); return id; };
    const clearTimeout = id => callbacks.delete(id);
    const window = { addEventListener: (name, fn) => { events[name] = fn; } };
    const navigator = {onLine:true};
    const localStorage = { removeItem:k=>store.delete(k), get length(){return store.size}, key:i=>[...store.keys()][i] };
    const ls = { get:k=>store.has(k)?JSON.parse(store.get(k)):null, set:(k,v)=>{store.set(k,JSON.stringify(v));return true} };
    function $(id) { return elements[id] || (elements[id]={listeners:{},value:'',dataset:{},hidden:false,innerHTML:'',textContent:'',lastElementChild:{textContent:''},className:'',classList:{contains(c){return elements[id].className.split(' ').includes(c)}},addEventListener(name,fn){this.listeners[name]=fn},querySelectorAll(){return this.inputs||[]}}); }
    const N=50, YMAX=99999999, S={ym:'2026-10', month:{records:{}},oinfo:{}}, fcCache=null;
    let db=null; const mExists={}, inflight={};
    const vIdx=v=>Number.isInteger(v)&&v>=0&&v<N;
    const parsePk=k=>{const m=/^f(\\d+)_o(\\d+)$/.exec(k); return m&&vIdx(+m[1])&&vIdx(+m[2])?[+m[1],+m[2]]:null};
    const schNorm=x=>x;
    function listSideUpd() {} function renderOi() {} function renderCl() {}
    const saveOinfo=()=>queueWrite('config/oinfo',JSON.parse(JSON.stringify(S.oinfo||{})));
  `;
  const code = prelude + segment(source, 'function packMonth(', '/* ---------- データ読込 ---------- */') +
    segment(source, 'function setOi(', 'const CLOSE_OPTS=') +
    segment(source, source.includes('let oiT=null;')?'let oiT=null;':"$('oiTx').addEventListener('input'", "$('oiFile').addEventListener") +
    segment(source, 'function saveCl()', "$('clEx').onclick=") +
    segment(source, 'async function allMonths()', "$('expBtn').onclick=") +
    segment(source, "window.addEventListener('pagehide'", '\n\nlet lastDay=');
  vm.runInContext(code, context);
  return context;
}
const run = (c,s)=>vm.runInContext(s,c);
async function tests(filename) {
  const observations = {};
  let c = setup(filename);
  run(c, `$('oiTx').dataset.o='0';$('oiTx').value='新しい配信予定';$('oiTx').listeners.input({target:$('oiTx')});events.pagehide();`);
  observations.scheduleBeforeClose = run(c, `ls.get('pk:config/oinfo')?.o0?.s || null`);
  c = setup(filename);
  run(c, `$('clList').inputs=[{value:'新しいチェック項目'}];$('clList').listeners.input();events.pagehide();`);
  observations.checklistBeforeClose = run(c, `ls.get('pk:config/oinfo')?.cl?.[0] || null`);
  c = setup(filename);
  run(c, `db={doc:()=>({set:async()=>{},update:async()=>{}})};
    for(let f=0;f<50;f++)for(let o=0;o<50;o++){const r=S.month.records['f'+f+'_o'+o]={};for(let d=1;d<=31;d++)r[d]={c:1,m:1440}}
    queueMonth(S.ym,{records:{f0_o0:{1:1440}}});`);
  await run(c, 'flush()');
  observations.oversizeBytes = run(c, 'JSON.stringify(packMonth(S.month)).length');
  observations.oversizeRetained = run(c, `!!pend['months/2026-10']`);
  observations.oversizeErrorVisible = run(c, `$('status').classList.contains('err')`);
  c = setup(filename);
  run(c, `db={collection:()=>({limit:()=>({get:async()=>({docs:[]})})})}; navigator.onLine=false;
    S.month.records={f0_o0:{2:{c:1,m:30}}};queueMonth(S.ym,{records:{f0_o0:{2:30}}});`);
  await run(c, 'flush()');
  const exported = await run(c, 'allMonths()');
  observations.offlineExportMinute = exported['2026-10']?.records?.f0_o0?.['2'] ?? null;
  // Verify that a pending month overlays a server copy and retains unaffected months.
  run(c, `db={collection:()=>({limit:()=>({get:async()=>({docs:[{id:'2026-09',data:()=>({records:{f0_o0:{1:10}}})},{id:'2026-10',data:()=>({records:{f0_o0:{2:5}}})}]})})})};`);
  const overlay = await run(c, 'allMonths()');
  observations.exportPreviousMinute = overlay['2026-09']?.records?.f0_o0?.['1'] ?? null;
  observations.exportNewestMinute = overlay['2026-10']?.records?.f0_o0?.['2'] ?? null;
  // Local debounce and packing remain functional after changes.
  c = setup(filename);
  run(c, `S.month.notes={f0_o0:'最新メモ'};debMonth('notes','f0_o0','最新メモ',600);events.pagehide();`);
  observations.localMemoSaved = run(c, `ls.get('pk:months/2026-10')?.notes?.f0_o0`);
  return observations;
}
(async()=>{
  const fixed=await tests(target);
  assert.equal(fixed.scheduleBeforeClose, '新しい配信予定');
  assert.equal(fixed.checklistBeforeClose, '新しいチェック項目');
  assert.equal(fixed.oversizeRetained, true);
  assert.equal(fixed.oversizeErrorVisible, true);
  assert.equal(fixed.offlineExportMinute, 30);
  assert.equal(fixed.exportPreviousMinute, 10);
  assert.equal(fixed.exportNewestMinute, 30);
  assert.equal(fixed.localMemoSaved, '最新メモ');
  const result={observations:fixed,passed:8,method:'Exact source sections executed in Node VM with controllable timers and a database stub'};
  console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
