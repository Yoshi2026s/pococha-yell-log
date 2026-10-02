const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const src=fs.readFileSync(target,'utf8');
function take(a,b){const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,`Missing production segment ${a}`);return src.slice(i,j)}
function line(marker){const i=src.indexOf(marker);assert(i>=0,marker);return src.slice(i,src.indexOf('\n',i)+1)}
function setup(){
 const c=vm.createContext({console});
 const base=`
 const callbacks=new Map(),events={},elements={},store=new Map(),undos=[],renders=[],toasts=[];let tid=0;
 const setTimeout=(f,ms)=>{const n=++tid;callbacks.set(n,{f,ms});return n},clearTimeout=id=>callbacks.delete(id);
 const window={addEventListener:(e,fn)=>(events[e]||=[]).push(fn)},navigator={onLine:true};
 const document={activeElement:null,handlers:{},addEventListener(e,fn){(this.handlers[e]||=[]).push(fn)},querySelectorAll(){return []}};
 const localStorage={removeItem:k=>store.delete(k),get length(){return store.size},key:i=>[...store.keys()][i]};
 const ls={get:k=>store.has(k)?JSON.parse(store.get(k)):null,set:(k,v)=>{store.set(k,JSON.stringify(v));return true}};
 function $(id){return elements[id]||(elements[id]={id,value:'',dataset:{},listeners:{},hidden:false,innerHTML:'',textContent:'',lastElementChild:{textContent:''},className:'',classes:new Set(),classList:{contains(k){return elements[id].classes.has(k)||elements[id].className.split(' ').includes(k)},add(k){elements[id].classes.add(k)},remove(k){elements[id].classes.delete(k)},toggle(k,on){if(on)elements[id].classes.add(k);else elements[id].classes.delete(k)}},addEventListener(e,fn){(this.listeners[e]||=[]).push(fn)},querySelectorAll(){return this.inputs||[]},querySelector(){return null},contains(t){return t&&t.owner===id},focus(){document.activeElement=this;this.focused=(this.focused||0)+1},blur(){document.activeElement=null;this.blurred=(this.blurred||0)+1},select(){},insertAdjacentHTML(p,h){this.innerHTML+=h},matches(){return true},closest(){return this.row||null}})}
 const N=50,YMAX=99999999,S={ym:'2026-10',mLoaded:true,month:{records:{},yt:{f0_o0:2000},fcb:{f0:5000},yell:{f0_o0:1000}},ryt:{f0_o0:3000},fam:0,oth:0,fcF:0,rytO:0,dday:2,tab:'rec',oinfo:{},active:{family:Array(N).fill(false)},order:{family:Array.from({length:N},(_,i)=>i)},lists:{family:['自分'],others:['他人']}},fcCache=new Map();S.active.family[0]=true;
 let db=null;const mExists={},inflight={};
 const pk=(f,o)=>'f'+f+'_o'+o,vIdx=v=>Number.isInteger(v)&&v>=0&&v<N;
 const parsePk=k=>{const m=/^f(\\d+)_o(\\d+)$/.exec(k);return m&&vIdx(+m[1])&&vIdx(+m[2])?[+m[1],+m[2]]:null};
 const schNorm=x=>x,kn=v=>String(v/1000),ryVal=v=>v==null?'0':kn(v),yfmt=v=>kn(v)+'k',cfmt=v=>String(v),famName=f=>'自分'+f,othName=o=>'他人'+o,esc=s=>String(s),clock=v=>String(v),ymParts=()=>({m:10}),isDefName=()=>false;
 const ytOf=k=>Number.isInteger(S.month.yt?.[k])?S.month.yt[k]:null,yellOf=k=>Number.isInteger(S.month.yell?.[k])?S.month.yell[k]:null,ryellOf=k=>Number.isInteger(S.month.ryell?.[k])?S.month.ryell[k]:null,rytOf=k=>Number.isInteger(S.ryt?.[k])?S.ryt[k]:null;
 const yTarget=()=>null,yCtx=()=>({f:S.fam,o:S.oth}),yellHtml=()=>'',condYellTag=()=>'',ryTag=()=>'',rowCoinHtml=()=>'',ryStatus=()=>'';
 function showToast(m){toasts.push(m)}function pushUndo(u){undos.push(u)}function renderFcCard(){renders.push('fc')}function renderYCoin(){}function renderSoon(){}function fitW(){}function fitAll(){}function savePref(){}function updFamYell(){}function updDayCoin(){}function renderYProg(){}function celebrate(){}function fillSelect(){}function renderDay(){}function renderOi(){}function renderCl(){}function listSideUpd(){}
 function daySaveMirror(){}function ytFormSaveMirror(){}
 const saveRyt=()=>queueWrite('config/ryt',JSON.parse(JSON.stringify(S.ryt))),saveOinfo=()=>queueWrite('config/oinfo',JSON.parse(JSON.stringify(S.oinfo)));
 function dispatch(id,e,t,extra={}){for(const fn of $(id).listeners[e]||[])fn({target:t,...extra})}
 function field(id,dataset,value,owner){const t=$(id);t.dataset=dataset;t.value=value;t.owner=owner;t.row={querySelector:s=>s==='[data-ry="yell"]'?$('nextYell'):({innerHTML:'',textContent:''})};return t}
 `;
 const code=base+
  take('function packMonth(','/* ---------- データ読込 ---------- */')+
  take('const fcBud=f=>','function fcProj(')+
  take('function fcSetBud(','$(\'fcBody\').addEventListener(\'focusout\'')+
  line("$('fcBody').addEventListener('focusout'")+
  take('function setRyt(','/* ---------- 名前・条件設定：名前をまとめて入力')+
  take('const parseYell=t=>','function saveYell(')+
  take('let ytT=null;','// 実際に取ったエール')+
  take('function saveYell(','// 戻す・文字大')+
  take('let memoT=null;','// 印刷')+
  take('function setOi(','const CLOSE_OPTS=')+
  take("$('oiTx').addEventListener('input'","$('oiFile').addEventListener")+
  take('function saveCl()',"$('clEx').onclick=")+
  take("$('dayList').addEventListener('keydown',ev=>{const t=ev.target;if(!t.dataset||!t.dataset.ry||ev.key","$('dayList').addEventListener('focusout'")+
  line("window.addEventListener('pagehide',()=>{flushDeb();stashPending();flush()});")+
  `globalThis.api={S,field,dispatch,pagehide:()=>{for(const fn of events.pagehide||[])fn()},read:k=>ls.get(k),undos,renders,toasts,flush,fcBudgetHtml,nodes:elements,focus:t=>document.activeElement=t,runTimers:ms=>{for(const [id,v] of [...callbacks])if(v.ms===ms){callbacks.delete(id);v.f()}},hidden:()=>{document.visibilityState='hidden';for(const fn of document.handlers.visibilitychange||[])fn();flush()}};`;
 vm.runInContext(code,c,{filename:target});return c.api;
}
let passed=0;function pass(s){passed++;console.log('PASS '+s)}
function fire(t,owner,type='input',extra={}){t.dispatch(owner,type,t.current,extra)}
for(const [label,id,ds,owner,value,key,expected] of [
 ['row target','goal',{fct:'f0_o0',fcym:'2026-10'},'fcBody','５．２５','yt',5250],
 ['monthly budget','fcBud',{fcbf:'0',fcym:'2026-10'},'fcBody','１２，３４５ コイン','fcb',12345],
 ['reciprocal target','reciprocal',{rt:'0',rto:'0'},'rytList','４．５','ryt',4500],
]){
 const t=setup();t.current=t.field(id,ds,value,owner);fire(t,owner);t.S.tab='list';t.S.fcF=1;t.S.rytO=1;t.pagehide();
 const saved=t.read(key==='ryt'?'pk:config/ryt':'pk:months/2026-10');
 assert.equal(key==='ryt'?saved.f0_o0:key==='fcb'?saved.fcb.f0:saved.yt.f0_o0,expected);assert.equal(t.renders.length,0);
 pass(`${label} saves on input, survives tab/picker change and pagehide, and keeps the active field`);
}
for(const [id,ds,owner,read] of [
 ['goal',{fct:'f0_o0',fcym:'2026-10'},'fcBody',t=>t.S.month.yt.f0_o0],
 ['reciprocal',{rt:'0',rto:'0'},'rytList',t=>t.S.ryt.f0_o0],
]){
 const t=setup(),old=read(t);t.current=t.field(id,ds,'',owner);fire(t,owner);assert.equal(read(t),old);
 t.current.value='9.';fire(t,owner);assert.equal(read(t),old);
 t.current.value='不正';fire(t,owner);assert.equal(read(t),old);assert(t.current.classList.contains('bad'));
 t.current.value='９';fire(t,owner,'compositionstart');fire(t,owner,'input',{isComposing:true});assert.equal(read(t),old);
 fire(t,owner,'compositionend');assert.equal(read(t),9000);assert(!t.current.classList.contains('bad'));
 fire(t,owner,'change');assert.equal(read(t),9000);
 pass(`${id} retains its old value for empty, partial decimal, invalid, and composing drafts; composition end saves the final number`);
}
{
 const t=setup();t.current=t.field('fcBud',{fcbf:'0',fcym:'2026-10'},'1.5','fcBody');fire(t,'fcBody');assert.equal(t.S.month.fcb.f0,5000);
 t.current.value='１２３４';fire(t,'fcBody','compositionstart');fire(t,'fcBody','input',{isComposing:true});assert.equal(t.S.month.fcb.f0,5000);fire(t,'fcBody','compositionend');assert.equal(t.S.month.fcb.f0,1234);fire(t,'fcBody','change');
 assert.equal(t.undos.length,1);assert.equal(t.undos[0].extra.fcb.f0,5000);t.pagehide();assert.equal(t.read('pk:months/2026-10').fcb.f0,1234);
 pass('budget composition and validation preserve existing value and commit creates exactly one undo from the original value');
}
{
 const t=setup();t.current=t.field('goal',{fct:'f0_o0',fcym:'2026-10'},'3','fcBody');fire(t,'fcBody');t.current.value='3.2';fire(t,'fcBody');fire(t,'fcBody','change');fire(t,'fcBody','change');
 assert.equal(t.undos.length,1);assert.equal(t.undos[0].extra.yt.f0_o0,2000);t.pagehide();assert.equal(t.read('pk:months/2026-10').yt.f0_o0,3200);
 pass('multiple valid target keystrokes and repeated change save the final value with one undo');
}
for(const [id,ds,start,invalid,key,prev,latest] of [
 ['goal',{fct:'f0_o0',fcym:'2026-10'},'3','3x','yt',2000,3000],
 ['fcBud',{fcbf:'0',fcym:'2026-10'},'6000','6000x','fcb',5000,6000],
]){
 const t=setup();t.current=t.field(id,ds,start,'fcBody');fire(t,'fcBody');t.current.value=invalid;fire(t,'fcBody');fire(t,'fcBody','change');fire(t,'fcBody','change');t.focus(t.current);t.pagehide();
 const pair=key==='yt'?'f0_o0':'f0';assert.equal(t.undos.length,1);assert.equal(t.undos[0].extra[key][pair],prev);assert.equal(t.read('pk:months/2026-10')[key][pair],latest);assert(t.current.classList.contains('bad'));assert.equal(t.renders.length,0);
 pass(`${id} valid-then-invalid draft keeps the latest valid value and one undo to its original value`);
}
{
 const t=setup();t.current=t.field('goal',{fct:'f0_o0',fcym:'2026-10'},'4','fcBody');t.S.ym='2026-11';fire(t,'fcBody');assert.equal(t.S.month.yt.f0_o0,2000);
 t.current=t.field('fcBud',{fcbf:'0',fcym:'2026-10'},'9000','fcBody');fire(t,'fcBody');assert.equal(t.S.month.fcb.f0,5000);
 assert.match(t.fcBudgetHtml(0,{need:1000}),/data-fcbf="0" data-fcym="2026-11"/);
 pass('stale monthly fields cannot write into a different month; rendered budget binds its account and month');
}
for(const [id,ds,owner,read] of [
 ['goal',{fct:'f0_o0',fcym:'2026-10'},'fcBody',t=>t.S.month.yt.f0_o0],
 ['fcBud',{fcbf:'0',fcym:'2026-10'},'fcBody',t=>t.S.month.fcb.f0],
 ['reciprocal',{rt:'0',rto:'0'},'rytList',t=>t.S.ryt.f0_o0],
]){
 const t=setup();t.current=t.field(id,ds,'',owner);fire(t,owner,'change');assert.equal(read(t),undefined);t.pagehide();
 pass(`${id} explicitly cleared on change removes the saved value`);
}
for(const [id,ds,owner] of [
 ['dayTarget',{ry:'yt',pkey:'f0_o0'},'dayList'],['reciprocal',{rt:'0',rto:'0'},'rytList'],['ytIn',{},'ytIn'],['yellIn',{},'yellIn'],['goal',{fct:'f0_o0',fcym:'2026-10'},'fcBody'],
]){
 for(const mode of ['composing','229',...(owner==='fcBody'||owner==='rytList'?['tracked']:[])]){
  const t=setup();t.current=t.field(id,{...ds},'５',owner);if(mode==='tracked')t.current.dataset.numComp='1';let prevented=0;fire(t,owner,'keydown',{key:'Enter',isComposing:mode==='composing',keyCode:mode==='229'?229:13,preventDefault(){prevented++}});
  assert.equal(prevented,0);assert.equal(t.current.blurred||0,0);assert.equal(t.nodes.nextYell?.focused||0,0);assert.equal(t.nodes.yellIn?.focused||0,0);
 }
 pass(`${id} ignores IME confirmation and keyCode 229 Enter without blurring or moving focus`);
}
for(const [id,ds,owner,savedKey,property] of [
 ['goal',{fct:'f0_o0',fcym:'2026-10'},'fcBody','pk:months/2026-10',['yt','f0_o0']],
 ['fcBud',{fcbf:'0',fcym:'2026-10'},'fcBody','pk:months/2026-10',['fcb','f0']],
 ['reciprocal',{rt:'0',rto:'0'},'rytList','pk:config/ryt',['f0_o0']],
]){
 for(const lifecycle of ['pagehide','hidden']){
  const t=setup();t.current=t.field(id,{...ds},'',owner);t.focus(t.current);fire(t,owner);if(lifecycle==='pagehide')t.pagehide();else t.hidden();
  let saved=t.read(savedKey);for(const k of property)saved=saved?.[k];assert.equal(saved,undefined);assert.equal(t.renders.length,0);
 }
 pass(`${id} cleared while focused commits on pagehide and hidden visibility without rendering`);
}
for(const [id,ds,owner,savedKey,property] of [
 ['goal',{fct:'f0_o0',fcym:'2026-10'},'fcBody','pk:months/2026-10',['yt','f0_o0']],
 ['reciprocal',{rt:'0',rto:'0'},'rytList','pk:config/ryt',['f0_o0']],
]){
 const t=setup();t.current=t.field(id,{...ds},'9.',owner);t.focus(t.current);fire(t,owner);t.pagehide();let saved=t.read(savedKey);for(const k of property)saved=saved?.[k];assert.equal(saved,9000);assert.equal(t.renders.length,0);
 pass(`${id} commits a valid trailing decimal point on pagehide`);
}
{
 const t=setup();t.current=t.field('goal',{fct:'f0_o0',fcym:'2026-10'},'', 'fcBody');t.focus(t.current);fire(t,'fcBody','compositionstart');fire(t,'fcBody','input',{isComposing:true});t.pagehide();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.read('pk:months/2026-10'),null);
 const untouched=setup();untouched.current=untouched.field('reciprocal',{rt:'1',rto:'0'},'0','rytList');untouched.focus(untouched.current);untouched.pagehide();assert.equal(untouched.read('pk:config/ryt'),null);assert.equal(untouched.undos.length,0);
 pass('pagehide preserves an unfinished composition and leaves untouched default zero fields unchanged');
}
for(const next of ['fcBV','fcAddV','nextRow','fcBud']){
 const t=setup();t.current=t.field('goal',{fct:'f0_o0',fcym:'2026-10'},'3','fcBody');fire(t,'fcBody');fire(t,'fcBody','change');
 const other=t.field(next,next==='nextRow'?{fct:'f0_o1',fcym:'2026-10'}:{},'7.','fcBody');t.focus(other);t.runTimers(0);assert.equal(t.renders.length,0);assert.equal(other.value,'7.');assert.equal(other.focused||0,0);
 pass(`deferred target refresh preserves the next focused ${next} field and its partial draft`);
}
for(const [id,ds,owner,value,key,expected] of [
 ['memoTx',{},'memoTx','変更したメモ','notes','変更したメモ'],
 ['ytIn',{yk:'f0_o0'},'ytIn','7.125','yt',7125],
 ['yellIn',{yk:'f0_o0'},'yellIn','8.375','yell',8375],
]){
 const t=setup();t.current=t.field(id,ds,value,owner);fire(t,owner);t.S.fam=1;t.S.oth=1;t.pagehide();assert.equal(t.read('pk:months/2026-10')[key].f0_o0,expected);
 pass(`${id} preserves the original pair after immediate account switch and pagehide`);
}
{
 const t=setup();t.current=t.field('oiTx',{o:'0'},'新しい予定','oiTx');fire(t,'oiTx');t.S.oiO=1;t.pagehide();assert.equal(t.read('pk:config/oinfo').o0.s,'新しい予定');
 t.nodes.clList.inputs=[{value:'歌枠'},{value:'新しい企画'}];t.dispatch('clList','input',t.nodes.clList);t.pagehide();assert.deepEqual(Array.from(t.read('pk:config/oinfo').cl),['歌枠','新しい企画']);
 pass('schedule text and checklist also save immediately before pagehide');
}
console.log(`All ${passed} non-name input audit scenarios passed.`);
