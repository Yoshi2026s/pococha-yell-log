const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const src=fs.readFileSync(target,'utf8');
function take(a,b){const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,`Missing production segment ${a}`);return src.slice(i,j)}
function line(a){const i=src.indexOf(a);assert(i>=0,a);return src.slice(i,src.indexOf('\n',i)+1)}
function setup(){
 const c=vm.createContext({console});
 const base=`
 const callbacks=new Map(),events={},elements={},store=new Map(),toasts=[];let tid=0;
 const setTimeout=(f,ms)=>{const n=++tid;callbacks.set(n,{f,ms});return n},clearTimeout=id=>callbacks.delete(id);
 const window={addEventListener:(e,fn)=>(events[e]||=[]).push(fn)},navigator={onLine:true};
 const document={activeElement:null,handlers:{},addEventListener(e,fn){(this.handlers[e]||=[]).push(fn)},querySelectorAll(){return []}};
 const localStorage={removeItem:k=>store.delete(k)};
 const ls={get:k=>store.has(k)?JSON.parse(store.get(k)):null,set:(k,v)=>{store.set(k,JSON.stringify(v));return true}};
 function $(id){return elements[id]||(elements[id]={id,value:'',dataset:{},listeners:{},attrs:{},hidden:false,innerHTML:'',textContent:'',lastElementChild:{textContent:''},className:'',classes:new Set(),classList:{contains(k){return elements[id].classes.has(k)},add(k){elements[id].classes.add(k)},remove(k){elements[id].classes.delete(k)},toggle(k,on){if(on)elements[id].classes.add(k);else elements[id].classes.delete(k)}},setAttribute(k,v){this.attrs[k]=v},addEventListener(e,fn){(this.listeners[e]||=[]).push(fn)},querySelectorAll(){return this.inputs||[]},contains(t){return t&&t.owner===id},focus(){document.activeElement=this;this.focused=(this.focused||0)+1},blur(){document.activeElement=null;this.blurred=(this.blurred||0)+1},closest(){return this.row}})}
 const N=50,YMAX=99999999,S={ym:'2026-10',mLoaded:true,dday:2,tab:'day',month:{records:{f0_o0:{2:{c:1,m:15}}},yell:{f0_o0:1000},yt:{f0_o0:2000},ryell:{f0_o0:1500},ylog:{f0_o0:{1:1000}},rylog:{f0_o0:{1:1500}}}},fcCache=new Map();
 let db=null;const mExists={},inflight={};
 const pk=(f,o)=>'f'+f+'_o'+o,vIdx=v=>Number.isInteger(v)&&v>=0&&v<N;
 const parsePk=k=>{const m=/^f(\\d+)_o(\\d+)$/.exec(k);return m&&vIdx(+m[1])&&vIdx(+m[2])?[+m[1],+m[2]]:null};
 const ymParts=ym=>{const [y,m]=ym.split('-').map(Number);return {y,m,days:new Date(y,m,0).getDate()}},schNorm=x=>x,kn=v=>String(v/1000),yfmt=v=>kn(v)+'k',othName=o=>'他人'+o;
 const ytOf=k=>S.month.yt?.[k]??null,yellOf=k=>S.month.yell?.[k]??null,ryellOf=k=>S.month.ryell?.[k]??null;
 const yTarget=()=>null,rowCoinHtml=()=>'',ryStatus=()=>'';
 function showToast(m){toasts.push(m)}function renderSoon(){}function renderDay(){}function renderSum(){}function renderEom(){}function rerender(){}function updDayCoin(){}function celebrate(){}function hideToast(){}function ytFormUndoFields(){}
 const ryFocus=()=>false,dayMinuteCommitFocused=()=>true;function daySaveMirror(){}function ytFormSaveMirror(){}
 function dispatch(id,e,t,extra={}){for(const fn of $(id).listeners[e]||[])fn({target:t,...extra})}
 function field(fld='yell',k='f0_o0',value='5.25',ym=S.ym,d=S.dday){const t=$('field'+Object.keys(elements).length);t.owner='dayList';t.dataset={ry:fld,pkey:k,ryym:ym,ryday:String(d)};t.value=value;t.row={msg:{textContent:''},querySelector(s){return s==='[data-ry="yell"]'?$('nextYell'):s==='.rymsg'?this.msg:{innerHTML:''}}};$('dayList').inputs=[...($('dayList').inputs||[]),t];return t}
 `;
 const code=base+
  take('function packMonth(','/* ---------- データ読込 ---------- */')+
  take('function getE(','// 自分垢のその日の合計')+
  line('function rybxHtml(')+
  take('function rowYellHtml(','function rowCoinHtml(')+
  take('function ryParseDraft(','/* ---------- 名前・条件設定：相手エール目標 ---------- */')+
  take('function dayCommitFocused(','function daySelectDate(')+
  take('function flushNumericInputs(','/* ---------- 名前・条件設定：名前をまとめて入力')+
  line("window.addEventListener('pagehide',()=>{flushDeb();stashPending();flush()});")+
  `globalThis.api={S,field,dispatch,read:k=>ls.get(k),reload:()=>{flush();S.month=unpackMonth(ls.get('pk:months/'+S.ym));return S.month},pagehide:()=>{for(const fn of events.pagehide||[])fn()},hidden:()=>{document.visibilityState='hidden';for(const fn of document.handlers.visibilitychange||[])fn();flush()},focus:t=>document.activeElement=t,undo:doUndo,undos:undoStack,nodes:elements,flush,rowYellHtml,ryCommitFocused,ryInput,ryParseDraft};`;
 vm.runInContext(code,c,{filename:target});return c.api;
}
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name)}
const data=t=>JSON.parse(JSON.stringify(t.S.month));
const fire=(t,f,type='input',extra={})=>t.dispatch('dayList',type,f,extra);
for(const fld of ['yell','ryell']){
 for(const lifecycle of ['pagehide','hidden'])test(`${fld}: valid focused input saves daily history on ${lifecycle} and survives real pack/unpack reload`,()=>{
  const t=setup(),f=t.field(fld,'f0_o0','５．２５０');t.focus(f);fire(t,f);t[lifecycle]();const stored=t.read('pk:months/2026-10'),lf=fld==='yell'?'ylog':'rylog';
  assert.equal(stored[fld].f0_o0,5250);assert.equal(stored[lf].f0_o0[2],5250);assert.equal(stored[lf].f0_o0[1],fld==='yell'?1000:1500);
  t.reload();assert.equal(t.S.month[fld].f0_o0,5250);assert.equal(t.S.month[lf].f0_o0[2],5250);assert.equal(t.S.month.records.f0_o0[2].m,15);
 });
 test(`${fld}: focused clear waits for commit then removes cumulative value and only the selected daily entry`,()=>{
  const t=setup(),f=t.field(fld,'f0_o0','8');t.focus(f);fire(t,f);fire(t,f,'change');f.value='';fire(t,f);assert.equal(t.S.month[fld].f0_o0,8000);t.pagehide();
  const lf=fld==='yell'?'ylog':'rylog';t.reload();assert.equal(t.S.month[fld].f0_o0,undefined);assert.equal(t.S.month[lf].f0_o0[2],undefined);assert.equal(t.S.month[lf].f0_o0[1],fld==='yell'?1000:1500);
 });
 test(`${fld}: zero is a saved value, distinguishable from missing history`,()=>{
  const t=setup(),f=t.field(fld,'f0_o0','0');fire(t,f);fire(t,f,'change');t.reload();const lf=fld==='yell'?'ylog':'rylog';assert.equal(t.S.month[fld].f0_o0,0);assert.equal(t.S.month[lf].f0_o0[2],0);
 });
 test(`${fld}: Undo restores cumulative value and the edited day without dropping later independent history`,()=>{
  const t=setup(),f=t.field(fld,'f0_o0','6');t.focus(f);fire(t,f);f.value='6.5';fire(t,f);fire(t,f,'change');const lf=fld==='yell'?'ylog':'rylog';t.S.month[lf].f0_o0[3]=7000;
  assert.equal(t.undos.length,1);t.undo();t.reload();assert.equal(t.S.month[fld].f0_o0,fld==='yell'?1000:1500);assert.equal(t.S.month[lf].f0_o0[2],undefined);assert.equal(t.S.month[lf].f0_o0[3],7000);assert.equal(f.value,fld==='yell'?'1':'1.5');
  fire(t,f,'focusout');t.pagehide();assert.equal(t.S.month[lf].f0_o0[2],undefined);
 });
}
test('monthly target saves separately, converts 0 to default goal, and never creates actual daily history',()=>{
 const t=setup(),f=t.field('yt','f0_o0','0');fire(t,f);fire(t,f,'change');t.reload();assert.equal(t.S.month.yt.f0_o0,undefined);assert.equal(t.S.month.ylog.f0_o0[2],undefined);assert.equal(t.S.month.yell.f0_o0,1000);t.undo();assert.equal(t.S.month.yt.f0_o0,2000);
});
for(const value of ['1.2345','-1','1e3','NaN','999999999999','100000','1x'])test(`invalid ${value} cannot change saved values or history; Enter retains focus`,()=>{
 const t=setup(),f=t.field('yell','f0_o0',value),before=data(t);t.focus(f);fire(t,f);let prevented=0;fire(t,f,'keydown',{key:'Enter',preventDefault(){prevented++}});
 assert.deepEqual(data(t),before);assert.equal(f.blurred||0,0);assert.equal(f.attrs['aria-invalid'],'true');assert.equal(prevented,1);assert.equal(t.undos.length,0);
});
test('valid then invalid draft keeps the latest valid value and one Undo back to the original',()=>{
 const t=setup(),f=t.field('yell','f0_o0','3');fire(t,f);f.value='3x';fire(t,f);fire(t,f,'change');assert.equal(t.S.month.yell.f0_o0,3000);assert.equal(t.undos.length,1);t.undo();assert.equal(t.S.month.yell.f0_o0,1000);assert.equal(t.S.month.ylog.f0_o0[2],undefined);
});
test('empty and trailing decimal drafts preserve the original value until explicit lifecycle commit',()=>{
 const t=setup(),f=t.field('yell','f0_o0','');t.focus(f);fire(t,f);assert.equal(t.S.month.yell.f0_o0,1000);assert.equal(t.S.month.ylog.f0_o0[2],undefined);f.value='9.';fire(t,f);assert.equal(t.S.month.yell.f0_o0,1000);t.pagehide();assert.equal(t.S.month.yell.f0_o0,9000);assert.equal(t.S.month.ylog.f0_o0[2],9000);
});
test('composition input is ignored until completion, including Enter and pagehide while composing',()=>{
 const t=setup(),f=t.field('yell','f0_o0','５');t.focus(f);fire(t,f,'compositionstart');fire(t,f,'input',{isComposing:true});let prevented=0;fire(t,f,'keydown',{key:'Enter',preventDefault(){prevented++}});t.pagehide();assert.equal(t.S.month.yell.f0_o0,1000);assert.equal(t.S.month.ylog.f0_o0[2],undefined);assert.equal(prevented,0);assert.equal(f.blurred||0,0);
 fire(t,f,'compositionend');assert.equal(t.S.month.yell.f0_o0,5000);assert.equal(t.S.month.ylog.f0_o0[2],5000);fire(t,f,'change');assert.equal(t.undos.length,1);
});
for(const extra of [{isComposing:true},{keyCode:229}])test(`IME confirmation ${JSON.stringify(extra)} never moves focus`,()=>{
 const t=setup(),f=t.field('yt');let prevented=0;fire(t,f,'keydown',{key:'Enter',...extra,preventDefault(){prevented++}});assert.equal(prevented,0);assert.equal(t.nodes.nextYell?.focused||0,0);
});
for(const context of ['day','month'])test(`stale ${context} fields never redirect writes into the newly selected context`,()=>{
 const t=setup(),f=t.field('yell','f0_o0','8');if(context==='day')t.S.dday=3;else t.S.ym='2026-11';const before=data(t);fire(t,f);fire(t,f,'change');assert.deepEqual(data(t),before);assert.equal(t.undos.length,0);
});
test('a captured valid day is saved before context switch and remains unchanged after late blur',()=>{
 const t=setup(),f=t.field('yell','f0_o0','4.25');t.focus(f);fire(t,f);t.ryCommitFocused(true);t.S.dday=3;f.value='9';fire(t,f,'focusout');t.reload();assert.equal(t.S.month.ylog.f0_o0[2],4250);assert.equal(t.S.month.ylog.f0_o0[3],undefined);assert.equal(t.S.month.yell.f0_o0,4250);
});
test('Undo after month data is reloaded restores the active month object and preserves other days',()=>{
 const t=setup(),f=t.field('yell','f0_o0','4');fire(t,f);fire(t,f,'change');t.reload();t.S.month.ylog.f0_o0[3]=9000;t.undo();assert.equal(t.S.month.yell.f0_o0,1000);assert.equal(t.S.month.ylog.f0_o0[2],undefined);assert.equal(t.S.month.ylog.f0_o0[3],9000);t.reload();assert.equal(t.S.month.ylog.f0_o0[2],undefined);assert.equal(t.S.month.ylog.f0_o0[3],9000);
});
test('untouched focused fields do not create daily history or Undo on pagehide',()=>{
 const t=setup(),f=t.field('yell','f0_o0','1');t.focus(f);t.pagehide();assert.equal(t.S.month.ylog.f0_o0[2],undefined);assert.equal(t.undos.length,0);
});
test('Enter on a valid target saves before advancing to current yell, and repeated change is one Undo',()=>{
 const t=setup(),f=t.field('yt','f0_o0','5.25');fire(t,f);let prevented=0;fire(t,f,'keydown',{key:'Enter',preventDefault(){prevented++}});fire(t,f,'change');assert.equal(t.S.month.yt.f0_o0,5250);assert.equal(t.nodes.nextYell.focused,1);assert.equal(prevented,1);assert.equal(t.undos.length,1);
});
test('input boundaries accept the exact maximum but reject one yell above it',()=>{
 const t=setup(),f=t.field('yell','f0_o0','99,999.999k');fire(t,f);fire(t,f,'change');assert.equal(t.S.month.yell.f0_o0,99999999);f.value='100000.000';fire(t,f);assert.equal(t.S.month.yell.f0_o0,99999999);assert.equal(f.attrs['aria-invalid'],'true');
});
test('rendered fields bind month/day and render blank missing values separately from explicit zero',()=>{
 const t=setup();t.S.month.yell={};t.S.month.ryell={f0_o0:0};t.S.month.yt={};const h=t.rowYellHtml('f0_o0');assert.match(h,/data-ryym="2026-10" data-ryday="2"/);assert.match(h,/data-ry="yell"[^>]*value=""/);assert.match(h,/data-ry="ryell"[^>]*value="0"/);assert.match(h,/placeholder="未入力/);
});
console.log(`All ${passed} daily yell scenarios passed.`);
