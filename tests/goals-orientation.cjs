const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const source=fs.readFileSync(target,'utf8');
function take(start,end){const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a,`Missing production segment ${start}`);return source.slice(a,b)}
function line(start){const a=source.indexOf(start);assert(a>=0,`Missing production line ${start}`);return source.slice(a,source.indexOf('\n',a)+1)}
function setup(){
 const c=vm.createContext({console,Intl});
 const prelude=`
 const callbacks=new Map(),events={},nodes={},store=new Map(),toasts=[],undoStack=[];let timerId=0;
 const setTimeout=(f,ms)=>{const id=++timerId;callbacks.set(id,{f,ms});return id},clearTimeout=id=>callbacks.delete(id);
 const window={scrollY:0,scrollTo(...args){this.lastScroll=args},addEventListener:(e,fn)=>(events[e]||=[]).push(fn)},navigator={onLine:true},requestAnimationFrame=f=>f(),getComputedStyle=()=>({scrollMarginTop:'0'});
 const document={activeElement:null,visibilityState:'visible',handlers:{},addEventListener(e,fn){(this.handlers[e]||=[]).push(fn)},querySelectorAll(sel){if(sel.includes('ytFormRows'))return $('ytFormRows').inputs||[];if(sel==='.ytf-save')return [$('goalSave')];if(sel.includes('#lstFam'))return Object.values(nodes).filter(n=>n.dataset.k==='family'||n.dataset.k==='others');return []},querySelector(sel){return sel==='nav.tabs'?$('navtabs'):null}};
 const localStorage={removeItem:k=>store.delete(k),get length(){return store.size},key:i=>[...store.keys()][i]};
 const ls={get:k=>store.has(k)?JSON.parse(store.get(k)):null,set:(k,v)=>{store.set(k,JSON.stringify(v));return true}};
 function $(id){return nodes[id]||(nodes[id]={id,tagName:'INPUT',type:'text',value:'',dataset:{},listeners:{},checked:false,hidden:false,disabled:false,innerHTML:'',textContent:'',options:[],lastElementChild:{textContent:''},attrs:{},className:'',classes:new Set(),classList:{contains(k){return nodes[id].classes.has(k)||nodes[id].className.split(' ').includes(k)},add(k){nodes[id].classes.add(k)},remove(k){nodes[id].classes.delete(k)},toggle(k,on){if(on)nodes[id].classes.add(k);else nodes[id].classes.delete(k)}},addEventListener(e,fn){(this.listeners[e]||=[]).push(fn)},setAttribute(k,v){this.attrs[k]=String(v)},removeAttribute(k){delete this.attrs[k]},querySelectorAll(sel){return this.inputs||[]},querySelector(sel){if(sel==='input.bad')return (this.inputs||[]).find(t=>t.classList.contains('bad'))||null;return null},contains(t){return t&&t.owner===id},matches(s){return this.tagName==='INPUT'&&s.includes('input')},closest(sel){return sel==='.ytf-row'?this.row||null:null},focus(){document.activeElement=this;this.focused=(this.focused||0)+1},blur(){if(document.activeElement===this)document.activeElement=null;this.blurred=(this.blurred||0)+1},select(){this.selected=true},scrollIntoView(){},click(){this.clicked=(this.clicked||0)+1;if(this.onclick)this.onclick({target:this})}})}
 const N=50,YMAX=99999999,S={ym:'2026-10',mLoaded:true,tab:'list',scrollPos:{},month:{records:{},yt:{f0_o0:2000,f1_o0:7000},yell:{f0_o0:1000}},ryt:{f0_o0:3000},fam:0,oth:0,extra:[],active:{family:Array(N).fill(false),others:Array(N).fill(false)},order:{family:Array.from({length:N},(_,i)=>i),others:Array.from({length:N},(_,i)=>i)},lists:{family:Array.from({length:N},(_,i)=>'自分'+(i+1)),others:Array.from({length:N},(_,i)=>'他人'+(i+1))},priv:false,pats:{p:{},a:{}}};
 Object.assign(S,{ytFormAxis:'others',ytFormFam:0,ytFormOth:0,ytFormUnit:'yell',ytFormAll:false,ytFormQ:'',ytFormFilter:'all',ytFormLastKey:''});
 S.lists.family[0]='よし';S.lists.family[1]='サブ';S.lists.others[0]='もえ';S.lists.others[1]='応援先';S.active.family[0]=true;S.active.family[1]=true;S.active.others[0]=true;S.active.others[1]=true;
 const fcCache=new Map(),mExists={},inflight={};let db=null,undo=null,scrollToday=false;
 const pk=(f,o)=>'f'+f+'_o'+o,vIdx=v=>Number.isInteger(v)&&v>=0&&v<N;
 const parsePk=k=>{const m=/^f(\\d+)_o(\\d+)$/.exec(k);return m&&vIdx(+m[1])&&vIdx(+m[2])?[+m[1],+m[2]]:null};
 const schNorm=x=>x,esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),kn=v=>String(v/1000),cfmt=v=>new Intl.NumberFormat('ja-JP').format(v),pad=n=>String(n).padStart(2,'0'),yfmt=v=>kn(v)+'k',ymParts=ym=>({y:+ym.slice(0,4),m:+ym.slice(5)}),PF=f=>S.order.family.indexOf(f),PO=o=>S.order.others.indexOf(o);
 const ytOf=(k,mo)=>{const v=((mo||S.month).yt||{})[k];return Number.isInteger(v)&&v>0?v:null},yellOf=k=>Number.isInteger(S.month.yell?.[k])?S.month.yell[k]:null;
 const isDefName=(kind,i)=>!S.lists[kind][i]||S.lists[kind][i]===(kind==='family'?'自分':'他人')+(i+1),dayKana=t=>String(t).normalize('NFKC').toLowerCase().trim();
 function showToast(m){toasts.push(m)}function hideToast(){}function pushUndo(u){undoStack.push(u);undo=u}function updHist(){}function rerender(){if(typeof renderYtForm==='function')renderYtForm(true)}function render(){rerender()}function putE(){}function savePref(){}function updFamYell(){}function updFamBadges(){}function updOthBadges(){}function renderListSum(){}function renderYCoin(){}function renderYellCheck(){}function renderFcCard(){}function renderSoon(){}function updDayCoin(){}function renderYProg(){}function alignHeads(){}function updFamPats(){}function renderPatSum(){}function updDline(){}function subscribeMonth(){S.month=unpackMonth(ls.get('pk:months/'+S.ym))}function toggleCard(){}
 function dayPrepareNavigation(){return true}function daySaveMirror(){}function accountNameHelpAll(){}
 function fillSelect(sel,label,val){sel.value=String(val);sel.options=(label===othName?S.order.others:S.order.family).map(i=>({value:String(i),textContent:label(i)}))}
 function dispatch(id,e,t,extra={}){for(const fn of $(id).listeners[e]||[])fn({target:t,preventDefault(){},stopPropagation(){},...extra})}
 function fireDocument(e,t,extra={}){for(const fn of document.handlers[e]||[])fn({target:t,isComposing:false,...extra})}
 function nameField(kind,i,value){const t=$(kind+'-'+i);t.dataset={k:kind,i:String(i)};t.value=value;return t}
 function field(k,value,unit='yell',ym=S.ym){const t=$('field-'+k);t.dataset={ytfk:k,ytfym:ym,ytfunit:unit,ytfctx:ytFormContext()};t.value=value;t.owner='ytFormRows';t.row=$('row-'+k);t.row.querySelector=s=>$('state-'+k+'-'+s);return t}
 function button(dataset){return {dataset,closest(sel){return Object.keys(dataset).some(k=>sel.includes(k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())))?this:null}}}
 `;
 const code=prelude+
  take('function packMonth(','/* ---------- データ読込 ---------- */')+
  line('const famName=')+line('const othName=')+
  line('function daySaveState(')+
  line('const parseYell=t=>')+
  take('function fcSetYt(','function fcAfter(')+
  line('function fcFinalizeInputUndo(')+
  take('function doUndo(){','// 自分垢のその日の合計')+
  line('function listsDoc(){')+
  take('function accountNameField(',"document.addEventListener('compositionstart',ev=>{const t=ev.target;if(accountNameField")+
  line("document.addEventListener('input',ev=>{const t=ev.target;if(!accountNameField")+
  take('/* ---------- 自分垢ごとの月別目標フォーム ---------- */','/* ---------- 月別目標フォームここまで ---------- */')+
  take('function flushNumericInputs(){','/* ---------- 名前・条件設定：名前をまとめて入力')+
  line('function fcOpenFor(')+line('function goDayFromChart(')+line('function jumpTo(')+
  take("document.querySelector('nav.tabs').addEventListener('click',ev=>{const b=ev.target.closest('[data-tab]');",'function goMonth(')+
  line('function goMonth(ym){')+
  line("window.addEventListener('pagehide',()=>{flushDeb();stashPending();flush()});")+
  take("document.addEventListener('visibilitychange',()=>{\n  if(document.visibilityState==='hidden')",'\n})();')+
  `globalThis.api={S,nodes,toasts,undoStack,axis:ytFormAxis,anchor:ytFormAnchor,rowKind:ytFormRowKind,pair:ytFormPair,context:ytFormContext,candidates:ytFormCandidates,rows:ytFormOthers,prepare:ytFormPrepareNavigation,setAxis:ytFormSetAxis,settingsPrepare:settingsPrepareNavigation,parse:ytFormParse,sync:ytFormSyncInput,commitFocused:ytFormCommitFocused,bulk:ytFormBulkApply,plan:ytFormBulkPlan,applyQuery:ytFormApplyQuery,render:renderYtForm,meta:ytFormUpdateMeta,clear:ytFormClear,changeAnchor:ytFormChangeAnchor,cancel:ytFormCancel,mirror:ytFormSaveMirror,status:setStatus,writeGoal:fcSetYt,fields:ytFormFields,field,nameField,button,fireDocument,dispatch,focused:()=>document.activeElement,undo:doUndo,goMonth,openCard:fcOpenFor,chart:goDayFromChart,jump:jumpTo,flush,pack:packMonth,unpack:unpackMonth,read:k=>ls.get(k),focus:t=>document.activeElement=t,pagehide:()=>{for(const fn of events.pagehide||[])fn()},hidden:()=>{document.visibilityState='hidden';for(const fn of document.handlers.visibilitychange||[])fn()},runTimers:ms=>{for(const [id,v] of [...callbacks])if(v.ms===ms){callbacks.delete(id);v.f()}}};`;
 vm.runInContext(code,c,{filename:target});return c.api;
}
let passed=0;function pass(s){passed++;console.log('PASS '+s)}
const testGroup=process.env.TEST_GROUP||'all';assert(['all','orientation','inputs','bulk-navigation'].includes(testGroup),'Unknown TEST_GROUP '+testGroup);const selected=g=>testGroup==='all'||testGroup===g;
if(selected('orientation')){
{
 const t=setup();assert.equal(t.axis(),'others');assert.equal(t.anchor(),0);assert.equal(t.rowKind(),'family');assert.equal(t.pair(1),'f1_o0');
 t.S.ytFormOth=8;assert.equal(t.pair(2),'f2_o8');
 pass('the other-account anchor maps each own-account row to its canonical own-to-other goal key');
}
{
 const t=setup();t.S.ytFormAxis='family';t.S.ytFormFam=8;
 assert.equal(t.axis(),'family');assert.equal(t.anchor(),8);assert.equal(t.rowKind(),'others');assert.equal(t.pair(2),'f8_o2');
 pass('the optional own-account view maps other-account rows without reversing the stored pair');
}
{
 const t=setup(),initial=t.context();t.S.ytFormOth=1;assert.notEqual(t.context(),initial);const anchor=t.context();t.S.ytFormAxis='family';assert.notEqual(t.context(),anchor);const axis=t.context();t.S.ym='2026-11';assert.notEqual(t.context(),axis);
 pass('render context distinguishes month, view orientation and selected anchor');
}
{
 const t=setup();t.S.month.yt.f7_o0=11000;t.S.month.yt.f8_o1=12000;t.S.month.records.f9_o0={2:{c:1,m:30}};
 assert.deepEqual(Array.from(t.rows()),[0,1,7,9]);
 t.S.ytFormQ='サブ';assert.deepEqual(Array.from(t.rows()),[1]);t.S.ytFormQ='８';assert.deepEqual(Array.from(t.rows()),[7]);
 pass('other-account view includes registered own accounts and that exact anchor’s saved goals or records; name and fullwidth number search narrow it');
}
{
 const t=setup();t.S.order.family=[1,0,...t.S.order.family.slice(2)];assert.deepEqual(Array.from(t.rows()),[1,0]);assert.equal(t.pair(1),'f1_o0');
 t.S.ytFormQ='01';assert.deepEqual(Array.from(t.rows()),[1]);
 pass('display order and display-number search follow account ordering while canonical goal keys keep their original indices');
}
{
 const t=setup();t.S.ytFormFilter='empty';assert.deepEqual(Array.from(t.rows()),[]);t.S.ytFormFilter='set';assert.deepEqual(Array.from(t.rows()),[0,1]);
 t.S.ytFormOth=1;t.S.ytFormFilter='empty';assert.deepEqual(Array.from(t.rows()),[0,1]);t.S.ytFormAll=true;t.S.ytFormFilter='all';assert.equal(t.rows().length,50);
 pass('unset and set filters use the chosen other account, and the explicit all view exposes all fifty own accounts');
}
{
 const t=setup();t.S.ytFormAxis='family';t.S.ytFormFam=1;t.S.month.yt.f1_o7=11000;t.S.month.yt.f0_o8=12000;t.S.month.records.f1_o9={2:{c:1,m:30}};
 assert.deepEqual(Array.from(t.rows()),[0,1,7,9]);t.S.ytFormQ='応援先';assert.deepEqual(Array.from(t.rows()),[1]);
 pass('own-account view offers the symmetric filters without importing another own account’s goals');
}
}
if(selected('inputs')){
for(const [key,raw,expected] of [['f0_o0','１２，３４５',12345],['f1_o0','７，７７７',7777]]){
 const t=setup(),f=t.field(key,raw);t.sync(f,false);t.sync(f,true);t.flush();
 assert.equal(t.read('pk:months/2026-10').yt[key],expected);assert.equal(t.S.month.yt.f0_o1,undefined);assert.equal(t.S.ryt.f0_o0,3000);
 assert.equal(t.unpack(t.read('pk:months/2026-10')).yt[key],expected);assert.equal(t.undoStack.length,1);
 pass(`${key} own-account row saves to the selected other account, preserves reciprocal goals and survives storage/reload`);
}
{
 const t=setup();t.S.ytFormOth=1;t.S.ytFormUnit='k';const f=t.field('f1_o1','５．２５','k');t.sync(f,false);t.sync(f,true);t.flush();
 assert.equal(t.read('pk:months/2026-10').yt.f1_o1,5250);assert.equal(t.read('pk:months/2026-10').yt.f1_o0,7000);
 pass('k input for another other-account anchor updates only that self-and-other combination');
}
for(const unit of ['yell','k']){
 const t=setup();t.S.ytFormUnit=unit;const f=t.field('f1_o0',unit==='k'?'7.5':'7500',unit);t.sync(f,false);f.value=unit==='k'?'7.75':'7750';t.sync(f,false);t.sync(f,true);t.flush();
 assert.equal(t.undoStack.length,1);assert.equal(t.read('pk:months/2026-10').yt.f1_o0,7750);t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f1_o0,7000);assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);
 pass(`${unit} edits across several keystrokes create one Undo for the original selected pair`);
}
{
 const t=setup(),f=t.field('f0_o0','9000');t.S.ytFormOth=1;t.sync(f,true);t.flush();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.undoStack.length,0);assert.equal(t.read('pk:months/2026-10'),null);
 pass('a stale field from the previous other-account anchor cannot write after the anchor changes');
}
{
 const t=setup(),f=t.field('f0_o0','9000');t.S.ytFormAxis='family';t.sync(f,true);t.flush();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.undoStack.length,0);
 pass('a stale field from another view orientation cannot write after switching views');
}
{
 const t=setup(),f=t.field('f1_o0','9000','yell','2026-09');t.sync(f,true);assert.equal(t.S.month.yt.f1_o0,7000);assert.equal(t.undoStack.length,0);
 for(const key of ['f50_o0','f1_o50','__proto__'])t.sync(t.field(key,'9000'),true);assert.equal(t.S.month.yt.f1_o0,7000);
 pass('stale months and invalid own-to-other keys remain unable to modify goals');
}
{
 const t=setup();t.S.ytFormUnit='k';const f=t.field('f1_o0','７．５','k');t.nodes.ytFormRows.inputs=[f];t.focus(f);assert.equal(t.prepare(),true);assert.equal(t.S.month.yt.f1_o0,7500);
 t.S.ytFormUnit='yell';f.value='９';t.sync(f,true);assert.equal(t.S.month.yt.f1_o0,7500);
 pass('unit navigation commits the captured numeric unit first and later stale events cannot reinterpret that field');
}
{
 const t=setup(),f=t.field('f1_o0','7500'),next=t.field('f0_o0','2000');t.nodes.ytFormRows.inputs=[f,next];t.focus(f);
 t.dispatch('ytFormRows','keydown',f,{key:'Enter',keyCode:13});assert.equal(t.S.month.yt.f1_o0,7500);assert.equal(next.focused,1);assert.equal(t.undoStack.length,1);
 t.dispatch('ytFormRows','keydown',next,{key:'Enter',keyCode:13,shiftKey:true});assert.equal(f.focused,1);
 pass('Enter follows visible own-account row order and Shift+Enter moves back after committing the current pair');
}
for(const mode of ['isComposing','key229','tracked']){
 const t=setup();t.S.ytFormUnit='k';const f=t.field('f1_o0','９','k'),next=t.field('f0_o0','');t.nodes.ytFormRows.inputs=[f,next];t.focus(f);if(mode==='tracked')f.dataset.numComp='1';let prevented=0;
 t.dispatch('ytFormRows','keydown',f,{key:'Enter',keyCode:mode==='key229'?229:13,isComposing:mode==='isComposing',preventDefault(){prevented++}});
 assert.equal(prevented,0);assert.equal(t.S.month.yt.f1_o0,7000);assert.equal(next.focused||0,0);assert.equal(t.undoStack.length,0);
 pass(`${mode} IME Enter keeps the same own-account row and saved goal`);
}
{
 const t=setup();t.S.ytFormUnit='k';const f=t.field('f1_o0','8','k');t.nodes.ytFormRows.inputs=[f];t.focus(f);t.sync(f,false);f.value='8.5';t.sync(f,false);
 t.dispatch('ytFormRows','keydown',f,{key:'Escape',keyCode:27});t.flush();assert.equal(t.S.month.yt.f1_o0,7000);assert.equal(t.parse(f.value,'k',true),7000);assert.equal(f.dataset.numStart,undefined);assert.equal(t.undoStack.length,0);
 t.dispatch('ytFormRows','focusout',f);t.flush();assert.equal(t.read('pk:months/2026-10').yt.f1_o0,7000);assert.equal(t.undoStack.length,0);
 pass('Escape restores the session’s original pair goal without a new Undo; subsequent blur cannot resave the canceled draft');
}
{
 const t=setup(),f=t.field('f1_o0','7500'),next=t.field('f0_o0','2000');t.nodes.ytFormRows.inputs=[f,next];t.focus(f);f.value='7500x';let prevented=0;
 t.dispatch('ytFormRows','keydown',f,{key:'Enter',keyCode:13,preventDefault(){prevented++}});assert.equal(prevented,1);assert.equal(t.focused(),f);assert.equal(f.attrs['aria-invalid'],'true');assert.equal(next.focused||0,0);assert.equal(t.S.month.yt.f1_o0,7000);
 f.value='7500';t.dispatch('ytFormRows','keydown',f,{key:'Enter',keyCode:13});assert.equal(f.attrs['aria-invalid'],undefined);assert.equal(next.focused,1);
 pass('invalid goal Enter explains the error and retains the pair; correction advances normally');
}
}
if(selected('bulk-navigation')){
{
 const t=setup();t.S.ytFormOth=1;t.nodes.ytFormRows.inputs=[t.field('f0_o1',''),t.field('f1_o1','')];t.nodes.ytFormBulk.value='５，０００';t.nodes.ytFormEmpty.checked=true;
 t.bulk();t.flush();assert.equal(t.S.month.yt.f0_o1,undefined);assert.equal(t.S.month.yt.f1_o1,undefined);assert.equal(t.undoStack.length,0);
 t.bulk();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o1,5000);assert.equal(t.read('pk:months/2026-10').yt.f1_o1,5000);assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);assert.equal(t.read('pk:months/2026-10').yt.f1_o0,7000);assert.equal(t.S.ryt.f0_o0,3000);assert.equal(t.undoStack.length,1);
 t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o1,undefined);assert.equal(t.read('pk:months/2026-10').yt.f1_o1,undefined);
 pass('bulk requires a second click and writes only visible own accounts for the selected other account; one Undo restores the batch');
}
{
 const t=setup();t.S.month.yt.f2_o0=6000;t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f1_o0','7000'),t.field('f3_o0','')];t.nodes.ytFormBulk.value='5000';t.nodes.ytFormEmpty.checked=true;
 t.bulk();t.bulk();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);assert.equal(t.read('pk:months/2026-10').yt.f1_o0,7000);assert.equal(t.read('pk:months/2026-10').yt.f2_o0,6000);assert.equal(t.read('pk:months/2026-10').yt.f3_o0,5000);assert.equal(t.undoStack.length,1);
 pass('unset-only batch protects existing and hidden own-account goals');
}
{
 const t=setup();t.S.ytFormUnit='k';t.nodes.ytFormRows.inputs=[t.field('f0_o0','2','k'),t.field('f1_o0','7','k')];t.nodes.ytFormBulk.value='4.25';t.nodes.ytFormEmpty.checked=false;
 t.bulk();t.bulk();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o0,4250);assert.equal(t.read('pk:months/2026-10').yt.f1_o0,4250);assert.equal(t.undoStack.length,1);t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);assert.equal(t.read('pk:months/2026-10').yt.f1_o0,7000);
 pass('explicit overwrite in k units changes the displayed own-account goals and Undo restores each distinct original');
}
for(const value of ['','0','1.5','abc','100000000']){
 const t=setup();t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f1_o0','7000')];t.nodes.ytFormBulk.value=value;t.nodes.ytFormEmpty.checked=false;t.bulk();t.bulk();t.flush();
 assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.S.month.yt.f1_o0,7000);assert.equal(t.undoStack.length,0);assert.equal(t.read('pk:months/2026-10'),null);
 pass(`${value||'empty'} bulk input cannot clear, overflow or overwrite saved goals`);
}
for(const change of ['value','scope','query','anchor','unit','filter']){
 const t=setup();t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f1_o0','7000')];t.nodes.ytFormBulk.value='5000';t.nodes.ytFormEmpty.checked=false;t.bulk();
 if(change==='value')t.nodes.ytFormBulk.value='6000';
 if(change==='scope')t.nodes.ytFormRows.inputs=[t.nodes.ytFormRows.inputs[0]];
 if(change==='query')t.S.ytFormQ='よし';
 if(change==='anchor'){t.S.ytFormOth=1;t.nodes.ytFormRows.inputs=[t.field('f0_o1',''),t.field('f1_o1','')];}
 if(change==='unit'){t.S.ytFormUnit='k';t.nodes.ytFormRows.inputs=[t.field('f0_o0','2','k'),t.field('f1_o0','7','k')];t.nodes.ytFormBulk.value='5';}
 if(change==='filter')t.S.ytFormFilter='set';
 t.bulk();t.flush();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.S.month.yt.f1_o0,7000);assert.equal(t.S.month.yt.f0_o1,undefined);assert.equal(t.undoStack.length,0);
 pass(`changing bulk ${change} invalidates the first confirmation rather than applying a stale scope`);
}
{
 const t=setup();t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f1_o0','7000')];t.nodes.ytFormBulk.value='2000';t.nodes.ytFormEmpty.checked=true;t.bulk();t.bulk();t.flush();assert.equal(t.undoStack.length,0);assert.equal(t.read('pk:months/2026-10'),null);
 t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000')];t.nodes.ytFormEmpty.checked=false;t.bulk();t.bulk();assert.equal(t.undoStack.length,0);
 pass('bulk with no unset rows or no changed values adds no Undo and persists nothing');
}
{
 const t=setup();t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000','yell','2026-09'),t.field('f1_o1','')];t.nodes.ytFormBulk.value='5000';t.nodes.ytFormEmpty.checked=false;t.bulk();t.bulk();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.S.month.yt.f1_o1,undefined);assert.equal(t.undoStack.length,0);
 pass('bulk excludes stale month rows and rows belonging to another other-account anchor');
}
for(const route of ['axis','month','tab','card','chart']){
 const t=setup();t.S.ytFormUnit='k';const f=t.field('f1_o0','９','k');f.dataset.numComp='1';t.nodes.ytFormRows.inputs=[f];t.focus(t.nodes.ytFormOth);const old=t.S.tab;
 if(route==='axis')t.setAxis('family');
 if(route==='month')assert.equal(t.goMonth('2026-11'),false);
 if(route==='tab')t.dispatch('navtabs','click',t.button({tab:'day'}));
 if(route==='card')t.openCard(1);
 if(route==='chart')t.chart({dataset:{cd2:'3'}});
 assert.equal(t.S.ytFormAxis,'others');assert.equal(t.S.ym,'2026-10');assert.equal(t.S.tab,old);assert.equal(t.S.month.yt.f1_o0,7000);assert.equal(t.undoStack.length,0);
 pass(`unfocused composing goal blocks ${route} navigation without changing the saved pair`);
}
{
 const t=setup(),f=t.field('f1_o0','入力エラー');t.nodes.ytFormRows.inputs=[f];t.focus(f);assert.equal(t.goMonth('2026-11'),false);assert.equal(t.S.ym,'2026-10');assert.equal(f.attrs['aria-invalid'],'true');assert.equal(t.S.month.yt.f1_o0,7000);
 f.value='8000';t.dispatch('ytFormRows','input',f);assert.equal(t.goMonth('2026-11'),true);assert.equal(t.read('pk:months/2026-10').yt.f1_o0,8000);assert.equal(t.S.ym,'2026-11');t.sync(f,true);assert.equal(t.S.month.yt.f1_o0,undefined);
 pass('invalid goal blocks month navigation; correction commits to its original month before loading the next one');
}
{
 const t=setup();t.S.ytFormUnit='k';const f=t.field('f1_o0','8.','k');t.nodes.ytFormRows.inputs=[f];t.focus(f);t.dispatch('navtabs','click',t.button({tab:'day'}));t.flush();assert.equal(t.S.tab,'day');assert.equal(t.read('pk:months/2026-10').yt.f1_o0,8000);assert.equal(t.undoStack.length,1);
 pass('ordinary tab navigation commits a trailing decimal to the selected pair before leaving settings');
}
{
 const t=setup(),outer={open:false,parentElement:null,closest(){return this}},inner={open:false,parentElement:outer,closest(){return this}},card={closest:()=>inner,scrolled:0,scrollIntoView(){this.scrolled++},getBoundingClientRect(){return {top:0}}};
 t.jump(card);assert.equal(inner.open,true);assert.equal(outer.open,true);assert.equal(card.scrolled,1);t.runTimers(1000);assert.equal(card.scrolled,1);
 pass('jumping to a settings card opens all enclosing disclosure groups before scrolling');
}
}
if(selected('inputs')){
for(const lifecycle of ['pagehide','hidden']){
 const t=setup();t.S.ytFormUnit='k';const f=t.field('f1_o0','９．５','k');t.nodes.ytFormRows.inputs=[f];t.focus(f);t.dispatch('ytFormRows','input',f);t[lifecycle]();assert.equal(t.read('pk:months/2026-10').yt.f1_o0,9500);assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);assert.equal(t.undoStack.length,1);
 pass(`${lifecycle} commits and persists the focused other-anchor goal without modifying a neighboring own account`);
}
{
 const t=setup();assert.equal(t.parse('１２，３４５','yell',true),12345);assert.equal(t.parse('２．５','k',true),2500);assert.equal(t.parse('0.001','k',true),1);assert.equal(t.parse('99999.999','k',true),99999999);
 for(const raw of ['-1','1.5','100000000','abc'])assert(Number.isNaN(t.parse(raw,'yell',true)));
 for(const raw of ['-1','1.2345','100000','Infinity'])assert(Number.isNaN(t.parse(raw,'k',true)));
 assert.equal(t.parse('','k',false),undefined);assert.equal(t.parse('9.','k',false),undefined);assert.equal(t.parse('9.','k',true),9000);assert.equal(t.parse('','k',true),null);assert.equal(t.parse('0','yell',true),null);
 pass('both units normalize fullwidth pasted goals, enforce their exact precision and maximum, and distinguish blank or decimal drafts from committed clears');
}
{
 const t=setup(),f=t.field('f1_o0','7000');t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),f];t.focus(f);assert.equal(t.clear('f1_o0'),true);t.flush();assert.equal(t.read('pk:months/2026-10').yt.f1_o0,undefined);assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);assert.equal(t.undoStack.length,1);
 t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f1_o0,7000);assert.equal(t.parse(f.value,'yell',true),7000);assert.equal(f.dataset.numStart,undefined);
 pass('a row’s explicit clear removes only that pair and Undo restores both its saved value and focused field');
}
{
 const t=setup(),f=t.field('f1_o0','９');f.dataset.numComp='1';t.nodes.ytFormRows.inputs=[f,t.field('f0_o0','2000')];assert.equal(t.clear('f0_o0'),false);assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.undoStack.length,0);
 pass('clear cannot remove another row while an own-account goal is still being composed');
}
}
if(selected('orientation')){
{
 const t=setup(),f=t.field('f1_o0','8000');t.nodes.ytFormRows.inputs=[f];t.focus(f);assert.equal(t.setAxis('family'),true);assert.equal(t.S.ytFormFam,1);assert.equal(t.S.ytFormOth,0);assert.equal(t.S.month.yt.f1_o0,8000);assert.equal(t.undoStack.length,1);assert.match(t.nodes.ytFormRows.innerHTML,/data-ytfk="f1_o0"/);assert.match(t.nodes.ytFormRows.innerHTML,/data-ytfk="f1_o1"/);assert(!t.nodes.ytFormRows.innerHTML.includes('data-ytfk="f0_o0"'));
 pass('switching orientation preserves the current canonical pair and commits it before showing the symmetric rows');
}
}
if(selected('bulk-navigation')){
{
 const t=setup(),f=t.field('f1_o0','8000');t.nodes.ytFormRows.inputs=[f];t.focus(f);assert.equal(t.changeAnchor('others',1),true);t.flush();assert.equal(t.S.ytFormOth,1);assert.equal(t.read('pk:months/2026-10').yt.f1_o0,8000);assert.equal(t.S.month.yt.f1_o1,undefined);assert.equal(t.S.ytFormLastKey,null);
 f.value='10000';t.sync(f,true);assert.equal(t.S.month.yt.f1_o0,8000);assert.equal(t.S.month.yt.f1_o1,undefined);
 pass('changing the selected other account commits the original pair first and rejects late events from the previous anchor');
}
}
if(selected('orientation')){
{
 const t=setup();t.render(true);const f=t.field('f1_o0','8.','k');t.S.ytFormUnit='k';f.dataset.ytfctx=t.context();t.nodes.ytFormRows.inputs=[f];t.render(true);t.focus(f);const old=t.nodes.ytFormRows.innerHTML;t.S.lists.family[1]='サブ改名';t.S.lists.others[0]='もえ改名';t.render(true);
 assert.equal(t.nodes.ytFormRows.innerHTML,old);assert.equal(f.value,'8.');assert.equal(t.focused(),f);assert.match(f.attrs['aria-label'],/サブ改名.*もえ改名/);assert.match(f.row.querySelector('.ytf-name').textContent,/サブ改名/);assert.match(t.nodes.ytFormContext.innerHTML,/もえ改名/);
 pass('live name refresh updates both selected context and row accessibility labels while preserving the focused goal draft');
}
{
 const t=setup();t.render(true);const n=t.nameField('family',10,'新しい自分垢');t.focus(n);t.fireDocument('input',n);assert.equal(t.S.lists.family[10],'新しい自分垢');assert.equal(t.S.active.family[10],true);assert.match(t.nodes.ytFormRows.innerHTML,/data-ytfk="f10_o0"/);assert.match(t.nodes.ytFormRows.innerHTML,/新しい自分垢/);assert.equal(t.focused(),n);assert.equal(t.S.month.yt.f10_o0,undefined);
 pass('registering an own-account name immediately adds its goal row for the selected other account without stealing name-field focus or creating a goal');
}
{
 const t=setup();const n=t.nameField('others',0,'もえ改名');t.focus(n);t.fireDocument('input',n);assert.match(t.nodes.ytFormOth.options[0].textContent,/もえ改名/);assert.match(t.nodes.ytFormContext.innerHTML,/もえ改名/);assert.equal(t.S.ytFormOth,0);assert.equal(t.S.month.yt.f1_o0,7000);
 pass('renaming the selected other account updates the anchor selector and context without reassigning existing pair goals');
}
}
if(selected('bulk-navigation')){
for(const kind of ['family','others']){
 const t=setup(),n=t.nameField(kind,0,'入力中');n.dataset.nameComposing='1';t.focus(t.nodes.ytFormOth);assert.equal(t.settingsPrepare(),false);assert.equal(t.goMonth('2026-11'),false);assert.equal(t.S.ym,'2026-10');assert.equal(t.S.month.yt.f0_o0,2000);
 pass(`an unfocused composing ${kind} name blocks navigation without changing any goal`);
}
for(const id of ['ytFormQuery','ytFormBulk']){
 const t=setup();t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f1_o0','7000')];t.nodes.ytFormBulk.value='5000';t.nodes.ytFormEmpty.checked=false;t.nodes[id].dataset.numComp='1';assert.equal(t.prepare(),false);t.bulk();t.bulk();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.S.month.yt.f1_o0,7000);assert.equal(t.undoStack.length,0);
 pass(`unfinished ${id==='ytFormQuery'?'search':'bulk'} composition blocks navigation and bulk writes`);
}
{
 const t=setup();t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f1_o0','7000')];t.nodes.ytFormBulk.value='5000';t.nodes.ytFormEmpty.checked=false;t.bulk();t.runTimers(8000);t.bulk();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.S.month.yt.f1_o0,7000);assert.equal(t.undoStack.length,0);t.bulk();assert.equal(t.S.month.yt.f0_o0,5000);assert.equal(t.S.month.yt.f1_o0,5000);
 pass('an expired bulk confirmation must be armed again before a subsequent click applies goals');
}
{
 const t=setup();t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f1_o0','7000')];t.nodes.ytFormBulk.value='5000';t.nodes.ytFormEmpty.checked=false;t.bulk();t.writeGoal('f1_o0',8500);t.bulk();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.S.month.yt.f1_o0,8500);assert.equal(t.undoStack.length,0);
 pass('a goal changed through another editor invalidates the armed bulk confirmation before it can overwrite the new value');
}
}
if(selected('inputs')){
{
 const t=setup(),f=t.field('f1_o0','8000');t.nodes.ytFormRows.inputs=[f];t.sync(f,false);assert.equal(t.nodes.goalSave.dataset.state,'pending');assert.match(t.nodes.goalSave.textContent,/保存中/);t.flush();assert.equal(t.nodes.goalSave.dataset.state,'ok');assert.match(t.nodes.goalSave.textContent,/保存済み/);
 t.status('err','保存に失敗');assert.equal(t.nodes.goalSave.dataset.state,'error');assert.equal(t.nodes.goalSave.textContent,'保存に失敗');
 pass('the form’s save mirror follows the real pending, saved and error status instead of claiming unconfirmed persistence');
}
{
 const t=setup();t.render(true);const editing=t.field('f0_o0','8000'),cleared=t.field('f1_o0','7000');t.nodes.ytFormRows.inputs=[editing,cleared];t.focus(editing);t.sync(editing,false);
 editing.blur=()=>{if(t.focused()===editing){t.focus(null);t.dispatch('ytFormRows','focusout',editing)}};
 cleared.focus=()=>{const old=t.focused();if(old&&old!==cleared)old.blur();t.focus(cleared)};
 assert.equal(t.clear('f1_o0'),true);t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f1_o0,7000);assert.equal(t.read('pk:months/2026-10').yt.f0_o0,8000);
 pass('clearing another row commits the previous edit first, so browser focusout cannot replace the clear action’s Undo');
}
{
 const t=setup(),f=t.field('f1_o0','入力エラー');t.nodes.ytFormRows.inputs=[f];t.focus(f);t.sync(f,false);assert.equal(f.attrs['aria-invalid'],'true');assert.equal(t.clear('f1_o0'),true);assert.equal(t.S.month.yt.f1_o0,undefined);assert.equal(f.attrs['aria-invalid'],undefined);t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f1_o0,7000);
 pass('the focused invalid row can be explicitly cleared and Undo restores its original saved goal');
}
}
if(selected('bulk-navigation')){
{
 const t=setup();t.render(true);const bad=t.field('f0_o0','入力エラー'),valid=t.field('f1_o0','7000');t.nodes.ytFormRows.inputs=[bad,valid];t.focus(bad);t.dispatch('ytFormRows','input',bad);const previous=t.nodes.ytFormRows.innerHTML;
 const query=t.nodes.ytFormQuery;query.value='サブ';t.focus(query);t.dispatch('ytFormQuery','input',query);assert.equal(t.S.ytFormQ,'');assert.equal(query.value,'');assert.equal(t.nodes.ytFormRows.innerHTML,previous);assert.equal(bad.attrs['aria-invalid'],'true');
 bad.value='2500';t.dispatch('ytFormRows','input',bad);t.nodes.ytFormBulk.value='5000';t.nodes.ytFormEmpty.checked=false;const plan=t.plan();assert.deepEqual(Array.from(plan.keys),['f0_o0','f1_o0']);assert.equal(JSON.parse(plan.sig)[1],query.value);t.bulk();assert.equal(t.S.month.yt.f0_o0,2500);assert.equal(t.S.month.yt.f1_o0,7000);t.bulk();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o0,5000);assert.equal(t.read('pk:months/2026-10').yt.f1_o0,5000);
 pass('search rejected by an invalid goal restores its visible query, keeps rows unchanged and leaves the corrected bulk plan consistent with that scope');
}
{
 const t=setup();t.render(true);t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f1_o0','7000')];const query=t.nodes.ytFormQuery;query.value='サブ';t.focus(query);t.dispatch('ytFormQuery','input',query);
 assert.equal(t.S.ytFormQ,'サブ');assert.equal(query.value,'サブ');assert.match(t.nodes.ytFormRows.innerHTML,/data-ytfk="f1_o0"/);assert(!t.nodes.ytFormRows.innerHTML.includes('data-ytfk="f0_o0"'));
 const rows=[...t.nodes.ytFormRows.innerHTML.matchAll(/data-ytfk="([^"]+)" data-ytfym="([^"]+)" data-ytfunit="([^"]+)" data-ytfctx="([^"]+)" value="([^"]*)"/g)];assert.equal(rows.length,1);t.nodes.ytFormRows.inputs=rows.map(m=>{const f=t.field(m[1],m[5],m[3],m[2]);f.dataset.ytfctx=m[4];return f});
 t.nodes.ytFormBulk.value='5000';t.nodes.ytFormEmpty.checked=false;assert.deepEqual(Array.from(t.plan().keys),['f1_o0']);t.bulk();t.bulk();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f1_o0,5000);assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);
 pass('ordinary valid search updates the rendered rows and limits bulk application to the exact matching own account');
}
{
 const t=setup();t.render(true);t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f1_o0','7000')];const query=t.nodes.ytFormQuery,previous=t.nodes.ytFormRows.innerHTML;query.value='サブ';t.focus(query);t.dispatch('ytFormQuery','compositionstart',query);t.dispatch('ytFormQuery','input',query,{isComposing:true});assert.equal(query.value,'サブ');assert.equal(t.S.ytFormQ,'');assert.equal(t.nodes.ytFormRows.innerHTML,previous);
 t.dispatch('ytFormQuery','compositionend',query);assert.equal(query.dataset.numComp,undefined);assert.equal(t.S.ytFormQ,'サブ');assert.match(t.nodes.ytFormRows.innerHTML,/data-ytfk="f1_o0"/);assert(!t.nodes.ytFormRows.innerHTML.includes('data-ytfk="f0_o0"'));
 pass('composing search text stays in the input without changing scope until the final Japanese text is confirmed');
}
}
assert(passed>0,'TEST_GROUP selected no scenarios');
console.log(`All ${passed} goal orientation scenarios passed.`);
