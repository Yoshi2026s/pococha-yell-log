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
 const window={addEventListener:(e,fn)=>(events[e]||=[]).push(fn)},navigator={onLine:true};
 const document={activeElement:null,visibilityState:'visible',handlers:{},addEventListener(e,fn){(this.handlers[e]||=[]).push(fn)},querySelectorAll(sel){return sel.includes('ytFormRows')?$('ytFormRows').inputs||[]:[]}};
 const localStorage={removeItem:k=>store.delete(k),get length(){return store.size},key:i=>[...store.keys()][i]};
 const ls={get:k=>store.has(k)?JSON.parse(store.get(k)):null,set:(k,v)=>{store.set(k,JSON.stringify(v));return true}};
 function $(id){return nodes[id]||(nodes[id]={id,tagName:'INPUT',type:'text',value:'',dataset:{},listeners:{},checked:false,hidden:false,disabled:false,innerHTML:'',textContent:'',options:[],lastElementChild:{textContent:''},attrs:{},className:'',classes:new Set(),classList:{contains(k){return nodes[id].classes.has(k)||nodes[id].className.split(' ').includes(k)},add(k){nodes[id].classes.add(k)},remove(k){nodes[id].classes.delete(k)},toggle(k,on){if(on)nodes[id].classes.add(k);else nodes[id].classes.delete(k)}},addEventListener(e,fn){(this.listeners[e]||=[]).push(fn)},setAttribute(k,v){this.attrs[k]=String(v)},removeAttribute(k){delete this.attrs[k]},querySelectorAll(){return this.inputs||[]},querySelector(){return null},contains(t){return t&&t.owner===id},matches(s){return s.includes('input')},closest(){return this.row||null},focus(){document.activeElement=this;this.focused=(this.focused||0)+1},blur(){document.activeElement=null;this.blurred=(this.blurred||0)+1},select(){this.selected=true},click(){this.clicked=(this.clicked||0)+1;if(this.onclick)this.onclick({target:this})}})}
 const N=50,YMAX=99999999,S={ym:'2026-10',mLoaded:true,tab:'list',month:{records:{},yt:{f0_o0:2000,f1_o0:7000},yell:{f0_o0:1000}},ryt:{f0_o0:3000},fam:0,oth:0,extra:[],active:{family:Array(N).fill(false),others:Array(N).fill(false)},order:{family:Array.from({length:N},(_,i)=>i),others:Array.from({length:N},(_,i)=>i)},lists:{family:Array.from({length:N},(_,i)=>'自分'+(i+1)),others:Array.from({length:N},(_,i)=>'他人'+(i+1))},priv:false};
 Object.assign(S,{ytFormFam:0,ytFormUnit:'yell',ytFormAll:false,ytFormQ:'',pats:{p:{},a:{}}});S.lists.family[0]='よし';S.lists.family[1]='サブ';S.lists.others[0]='もえ';S.lists.others[1]='応援先';S.active.family[0]=true;S.active.others[0]=true;S.active.others[1]=true;
 const fcCache=new Map(),mExists={},inflight={};let db=null,undo=null,scrollToday=false;
 const pk=(f,o)=>'f'+f+'_o'+o,vIdx=v=>Number.isInteger(v)&&v>=0&&v<N;
 const parsePk=k=>{const m=/^f(\\d+)_o(\\d+)$/.exec(k);return m&&vIdx(+m[1])&&vIdx(+m[2])?[+m[1],+m[2]]:null};
 const schNorm=x=>x,esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),kn=v=>String(v/1000),cfmt=v=>new Intl.NumberFormat('ja-JP').format(v),pad=n=>String(n).padStart(2,'0'),yfmt=v=>kn(v)+'k',famName=f=>String(f+1).padStart(2,'0')+' '+S.lists.family[f],othName=o=>String(o+1).padStart(2,'0')+' '+S.lists.others[o],ymParts=ym=>({y:+ym.slice(0,4),m:+ym.slice(5)}),PF=f=>S.order.family.indexOf(f),PO=o=>S.order.others.indexOf(o);
 const ytOf=(k,mo)=>{const v=((mo||S.month).yt||{})[k];return Number.isInteger(v)&&v>0?v:null},yellOf=k=>Number.isInteger(S.month.yell?.[k])?S.month.yell[k]:null;
 const isDefName=(kind,i)=>!S.lists[kind][i]||S.lists[kind][i]===(kind==='family'?'自分':'他人')+(i+1),dayKana=t=>String(t).normalize('NFKC').toLowerCase().trim();
 function showToast(m){toasts.push(m)}function hideToast(){}function pushUndo(u){undoStack.push(u);undo=u}function updHist(){}function rerender(){if(typeof renderYtForm==='function')renderYtForm(true)}function putE(){}function savePref(){}function updFamYell(){}function updFamBadges(){}function updOthBadges(){}function renderListSum(){}function renderYCoin(){}function renderYellCheck(){}function renderFcCard(){}function renderSoon(){}function updDayCoin(){}function renderYProg(){}function alignHeads(){}function updFamPats(){}function renderPatSum(){}function updDline(){}function subscribeMonth(){S.month=unpackMonth(ls.get('pk:months/'+S.ym))}
 function dayPrepareNavigation(){return true}function daySaveMirror(){}
 function fillSelect(sel,label,val){sel.value=String(val);sel.options=S.order.family.map(i=>({value:String(i),textContent:label(i)}))}
 function dispatch(id,e,t,extra={}){for(const fn of $(id).listeners[e]||[])fn({target:t,preventDefault(){},...extra})}
 function nameField(i,value){const t=$('others-'+i);t.dataset={k:'others',i:String(i)};t.value=value;return t}
 function fireDocument(e,t,extra={}){for(const fn of document.handlers[e]||[])fn({target:t,isComposing:false,...extra})}
 function field(k,value,unit='yell',ym=S.ym){const t=$('field-'+k);t.dataset={ytfk:k,ytfym:ym,ytfunit:unit};t.value=value;t.owner='ytFormRows';t.row=$('row-'+k);t.row.querySelector=s=>$('state-'+k+'-'+s);return t}
 `;
 const code=prelude+
  take('function packMonth(','/* ---------- データ読込 ---------- */')+
  line('const parseYell=t=>')+
  take('function fcSetYt(','function fcAfter(')+
  line('function fcFinalizeInputUndo(')+
  take('function doUndo(){','// 自分垢のその日の合計')+
  line('function listsDoc(){')+
  take('function accountNameField(',"document.addEventListener('compositionstart',ev=>{const t=ev.target;if(accountNameField")+
  line("document.addEventListener('input',ev=>{const t=ev.target;if(!accountNameField")+
  take('/* ---------- 自分垢ごとの月別目標フォーム ---------- */','/* ---------- 月別目標フォームここまで ---------- */')+
  take('function flushNumericInputs(){','/* ---------- 名前・条件設定：名前をまとめて入力')+
  line('function goMonth(ym){')+
  line("window.addEventListener('pagehide',()=>{flushDeb();stashPending();flush()});")+
  take("document.addEventListener('visibilitychange',()=>{\n  if(document.visibilityState==='hidden')",'\n})();')+
  `globalThis.api={S,nodes,toasts,undoStack,parse:ytFormParse,sync:ytFormSyncInput,commitFocused:ytFormCommitFocused,others:ytFormOthers,bulk:ytFormBulkApply,render:renderYtForm,meta:ytFormUpdateMeta,field,nameField,fireDocument,dispatch,focused:()=>document.activeElement,undo:doUndo,goMonth,flush,pack:packMonth,unpack:unpackMonth,read:k=>ls.get(k),focus:t=>document.activeElement=t,pagehide:()=>{for(const fn of events.pagehide||[])fn()},hidden:()=>{document.visibilityState='hidden';for(const fn of document.handlers.visibilitychange||[])fn()},runTimers:ms=>{for(const [id,v] of [...callbacks])if(v.ms===ms){callbacks.delete(id);v.f()}}};`;
 vm.runInContext(code,c,{filename:target});return c.api;
}
let passed=0;function pass(s){passed++;console.log('PASS '+s)}
{
 const t=setup();
 assert.equal(t.parse('１２，３４５','yell',true),12345);
 assert.equal(t.parse('２．５','k',true),2500);
 assert.equal(t.parse('0.001','k',true),1);
 assert.equal(t.parse('','yell',false),undefined);assert.equal(t.parse('','k',false),undefined);
 assert.equal(t.parse('','yell',true),null);assert.equal(t.parse('','k',true),null);
 assert.equal(t.parse('3.','k',false),undefined);assert.equal(t.parse('3.','k',true),3000);
 assert(Number.isNaN(t.parse('1.5','yell',true)));assert(Number.isNaN(t.parse('1.2345','k',true)));
 assert(Number.isNaN(t.parse('-1','yell',true)));assert(Number.isNaN(t.parse('abc','k',true)));
 pass('full-yell and k modes normalize pasted values and distinguish draft, clear, and invalid input');
}
for(const [unit,raw,expected] of [['yell','１２，３４５',12345],['k','５．２５',5250]]){
 const t=setup(),f=t.field('f0_o0',raw,unit);t.sync(f,false);t.S.fam=1;t.S.oth=1;t.nodes.ytFormFam.value='1';t.flush();
 assert.equal(t.read('pk:months/2026-10').yt.f0_o0,expected);assert.equal(t.S.month.yt.f1_o0,7000);assert.equal(t.S.ryt.f0_o0,3000);assert.equal(f.value,raw);
 assert.equal(t.unpack(t.read('pk:months/2026-10')).yt.f0_o0,expected);
 pass(`${unit} input saves immediately to its original account pair and survives persistence/reload without altering reciprocal goals or the field`);
}
{
 const t=setup(),f=t.field('f0_o0','','k');t.sync(f,false);assert.equal(t.S.month.yt.f0_o0,2000);f.value='9.';t.sync(f,false);assert.equal(t.S.month.yt.f0_o0,2000);
 f.value='不正';t.sync(f,false);assert.equal(t.S.month.yt.f0_o0,2000);f.value='５';f.dataset.numComp='1';t.sync(f,false);t.sync(f,true);assert.equal(t.S.month.yt.f0_o0,2000);
 delete f.dataset.numComp;t.sync(f,false);assert.equal(t.S.month.yt.f0_o0,5000);t.sync(f,true);assert.equal(t.undoStack.length,1);assert.equal(t.undoStack[0].extra.yt.f0_o0,2000);
 pass('empty, decimal and invalid drafts and unfinished composition retain the previous goal; final composition has one Undo');
}
{
 const t=setup(),f=t.field('f0_o0','3','k');t.sync(f,false);f.value='3.2';t.sync(f,false);f.value='3.25';t.sync(f,false);t.sync(f,true);t.sync(f,true);t.flush();
 assert.equal(t.undoStack.length,1);assert.equal(t.undoStack[0].extra.yt.f0_o0,2000);assert.equal(t.read('pk:months/2026-10').yt.f0_o0,3250);
 t.undo();t.flush();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);
 pass('several keystrokes and repeated commit produce one Undo that restores the original saved goal');
}
{
 const t=setup(),f=t.field('f0_o0','4000');t.sync(f,false);f.value='4000x';t.sync(f,false);t.sync(f,true);t.sync(f,true);t.flush();
 assert.equal(t.read('pk:months/2026-10').yt.f0_o0,4000);assert.equal(t.undoStack.length,1);assert.equal(t.undoStack[0].extra.yt.f0_o0,2000);
 t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);
 pass('a valid value followed by invalid text preserves the latest valid value and can undo to the original goal');
}
for(const raw of ['', '0']){
 const t=setup(),f=t.field('f0_o0',raw);t.sync(f,true);t.flush();assert.equal(t.S.month.yt.f0_o0,undefined);assert.equal(t.read('pk:months/2026-10').yt?.f0_o0,undefined);
 assert.equal(t.undoStack.length,1);t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);
 pass(`${raw===''?'empty':'zero'} commit clears an existing goal; Undo restores it`);
}
{
 const t=setup(),f=t.field('f0_o0','5','k','2026-09');t.sync(f,false);t.sync(f,true);assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.undoStack.length,0);t.flush();assert.equal(t.read('pk:months/2026-10'),null);
 for(const key of ['f50_o0','f0_o50','__proto__']){const bad=t.field(key,'9','k');t.sync(bad,true)}assert.equal(t.S.month.yt.f0_o0,2000);
 pass('stale month fields and invalid account pairs cannot write into the current month');
}
{
 const t=setup(),f=t.field('f0_o0','2.5','k');t.S.ytFormUnit='yell';t.sync(f,false);assert.equal(t.S.month.yt.f0_o0,2500);
 pass('a row retains the unit in which it was rendered when the form unit changes');
}
for(const [raw,unit,expected] of [['','yell',undefined],['9.','k',9000]]){
 const t=setup(),f=t.field('f0_o0',raw,unit);t.focus(f);t.sync(f,false);t.commitFocused();t.flush();assert.equal(t.read('pk:months/2026-10').yt?.f0_o0,expected);assert.equal(t.undoStack.length,1);
 pass(`focused ${raw===''?'clear':'trailing decimal'} commits before leaving the form and is undoable`);
}
{
 const t=setup(),f=t.field('f0_o0','９','k');f.dataset.numComp='1';t.focus(f);t.commitFocused();t.flush();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.read('pk:months/2026-10'),null);
 pass('leaving during unfinished Japanese composition does not overwrite the saved goal');
}
{
 const t=setup();t.S.month.yt.f0_o2=6000;t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f0_o1','')];t.nodes.ytFormBulk.value='５，０００';t.nodes.ytFormEmpty.checked=true;t.bulk();t.flush();
 const saved=t.read('pk:months/2026-10');assert.equal(saved.yt.f0_o0,2000);assert.equal(saved.yt.f0_o1,5000);assert.equal(saved.yt.f0_o2,6000);assert.equal(saved.yt.f1_o0,7000);assert.equal(t.S.ryt.f0_o0,3000);
 assert.equal(t.undoStack.length,1);assert.deepEqual(JSON.parse(JSON.stringify(t.undoStack[0].extra.yt)),{f0_o1:null});t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o1,undefined);assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);
 pass('empty-only batch fills visible unset rows without changing hidden rows, existing goals, another own account or reciprocal goals; one Undo reverts the batch');
}
{
 const t=setup();t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f0_o1','')];t.nodes.ytFormBulk.value='4.25';t.S.ytFormUnit='k';t.nodes.ytFormEmpty.checked=false;t.bulk();t.flush();
 assert.equal(t.read('pk:months/2026-10').yt.f0_o0,4250);assert.equal(t.read('pk:months/2026-10').yt.f0_o1,4250);assert.equal(t.read('pk:months/2026-10').yt.f1_o0,7000);assert.equal(t.undoStack.length,1);
 t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);assert.equal(t.read('pk:months/2026-10').yt.f0_o1,undefined);
 pass('explicit overwrite batch respects k units and Undo restores both existing and unset goals');
}
for(const value of ['','0','1.5','abc']){
 const t=setup();t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000'),t.field('f0_o1','')];t.nodes.ytFormBulk.value=value;t.nodes.ytFormEmpty.checked=false;t.bulk();t.flush();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.S.month.yt.f0_o1,undefined);assert.equal(t.undoStack.length,0);assert.equal(t.read('pk:months/2026-10'),null);
 pass(`${value||'empty'} batch value cannot clear or overwrite a goal`);
}
{
 const t=setup();t.nodes.ytFormRows.inputs=[t.field('f0_o0','2000','yell','2026-09'),t.field('f1_o1','')];t.nodes.ytFormBulk.value='5000';t.nodes.ytFormEmpty.checked=false;t.bulk();t.flush();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.S.month.yt.f1_o1,undefined);assert.equal(t.undoStack.length,0);
 pass('batch ignores stale monthly fields and rows belonging to a different selected own account');
}
for(const mode of ['composing','229','tracked']){
 const t=setup(),f=t.field('f0_o0','５','k'),next=t.field('f0_o1','');t.nodes.ytFormRows.inputs=[f,next];t.focus(f);let prevented=0;
 if(mode==='tracked')f.dataset.numComp='1';t.dispatch('ytFormRows','keydown',f,{key:'Enter',isComposing:mode==='composing',keyCode:mode==='229'?229:13,preventDefault(){prevented++}});
 assert.equal(prevented,0);assert.equal(next.focused||0,0);assert.equal(f.blurred||0,0);assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.undoStack.length,0);
 pass(`${mode} IME confirmation Enter leaves focus, saved goal and Undo unchanged`);
}
{
 const t=setup(),f=t.field('f0_o0','3500'),next=t.field('f0_o1','');t.nodes.ytFormRows.inputs=[f,next];t.focus(f);let prevented=0;t.dispatch('ytFormRows','keydown',f,{key:'Enter',keyCode:13,preventDefault(){prevented++}});
 assert.equal(prevented,1);assert.equal(next.focused,1);assert.equal(t.S.month.yt.f0_o0,3500);assert.equal(t.undoStack.length,1);
 t.dispatch('ytFormRows','keydown',next,{key:'Enter',keyCode:13});assert.equal(next.blurred,1);
 pass('ordinary Enter commits one row and advances; the last row blurs without setting an empty goal');
}
{
 const t=setup(),f=t.field('f0_o0','５．５','k');t.dispatch('ytFormRows','compositionstart',f);t.dispatch('ytFormRows','input',f,{isComposing:true});assert.equal(t.S.month.yt.f0_o0,2000);
 t.dispatch('ytFormRows','compositionend',f);assert.equal(t.S.month.yt.f0_o0,5500);t.dispatch('ytFormRows','change',f);t.dispatch('ytFormRows','focusout',f);assert.equal(t.undoStack.length,1);t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o0,5500);
 pass('actual composition event handlers save the final value and change plus blur create one Undo');
}
{
 const t=setup();t.S.month.yt.f0_o7=11000;t.S.month.yt.f1_o8=12000;t.S.month.records.f0_o9={2:{c:1,m:30}};
 assert.deepEqual(Array.from(t.others()),[0,1,7,9]);t.S.ytFormQ='もえ';assert.deepEqual(Array.from(t.others()),[0]);t.S.ytFormQ='8';assert.deepEqual(Array.from(t.others()),[7]);
 t.S.ytFormAll=true;t.S.ytFormQ='';assert.equal(t.others().length,50);
 pass('normal view includes active or named accounts and this own account’s goals/records; name and number search narrow it; all view exposes all 50 accounts');
}
{
 const t=setup();t.render(true);const f=t.field('f0_o0','7.','k');t.nodes.ytFormRows.inputs=[f];t.focus(f);const oldHtml=t.nodes.ytFormRows.innerHTML;t.S.lists.family[0]='よし変更';t.S.lists.others[0]='もえ変更';t.render(false);
 assert.equal(f.value,'7.');assert.equal(t.nodes.ytFormRows.innerHTML,oldHtml);assert.match(f.attrs['aria-label'],/よし変更.*もえ変更/);assert.match(f.row.querySelector('.ytf-name').textContent,/もえ変更/);assert.equal(f.focused,undefined);
 pass('name refresh updates account labels and accessible input names while retaining the focused field and decimal draft');
}
{
 const t=setup();t.render(true);assert.match(t.nodes.ytFormMonth.textContent,/2026年10月/);assert.match(t.nodes.ytFormRows.innerHTML,/data-ytfk="f0_o0" data-ytfym="2026-10" data-ytfunit="yell"/);assert.match(t.nodes.ytFormRows.innerHTML,/inputmode="numeric"/);assert.match(t.nodes.ytFormRows.innerHTML,/2,000エール = 2k/);assert.match(t.nodes.ytFormExample.textContent,/20,000/);assert.match(t.nodes.ytFormRows.innerHTML,/aria-describedby="ytf-0-0-hint"/);
 t.S.ytFormUnit='k';t.render(true);assert.match(t.nodes.ytFormRows.innerHTML,/data-ytfunit="k"/);assert.match(t.nodes.ytFormRows.innerHTML,/inputmode="decimal"/);assert.equal(t.nodes.ytFormBulkUnit.textContent,'k');
 pass('rendered rows identify own account, other account, month, unit, numeric keyboard and explanatory text');
}
for(const lifecycle of ['pagehide','hidden']){
 for(const [raw,unit,expected] of [['','yell',undefined],['9.','k',9000],['12000','yell',12000]]){
  const t=setup(),f=t.field('f0_o0',raw,unit);t.focus(f);t.dispatch('ytFormRows','input',f);t[lifecycle]();assert.equal(t.read('pk:months/2026-10').yt?.f0_o0,expected);assert.equal(t.undoStack.length,1);
 }
 pass(`${lifecycle} production hooks commit focused clear, trailing decimal and valid number before persisting the month`);
}
{
 const t=setup(),f=t.field('f0_o0','9.','k');t.focus(f);t.sync(f,false);assert.equal(t.goMonth('2026-11'),true);assert.equal(t.read('pk:months/2026-10').yt.f0_o0,9000);assert.equal(t.S.ym,'2026-11');assert.equal(t.S.month.yt.f0_o0,undefined);
 t.sync(f,true);assert.equal(t.S.month.yt.f0_o0,undefined);assert.equal(t.undoStack[0].ym,'2026-10');
 pass('month navigation commits the original month before loading another month; stale events cannot modify the new month');
}
{
 const t=setup(),f=t.field('f0_o0','入力エラー'),next=t.field('f0_o1','');t.nodes.ytFormRows.inputs=[f,next];t.focus(f);let prevented=0;t.dispatch('ytFormRows','keydown',f,{key:'Enter',keyCode:13,preventDefault(){prevented++}});
 assert.equal(prevented,1);assert.equal(t.focused(),f);assert.equal(next.focused||0,0);assert.equal(f.attrs['aria-invalid'],'true');assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.undoStack.length,0);
 f.value='3500';t.dispatch('ytFormRows','keydown',f,{key:'Enter',keyCode:13});assert.equal(f.attrs['aria-invalid'],undefined);assert.equal(next.focused,1);assert.equal(t.S.month.yt.f0_o0,3500);
 pass('invalid Enter retains focus and marks the error; correcting the number clears the error and advances');
}
{
 const t=setup();t.render(true);const f=t.field('f0_o0','5000');t.nodes.ytFormRows.inputs=[f];t.focus(f);t.sync(f,false);t.sync(f,true);f.value='6000';t.sync(f,false);assert.equal(f.dataset.numStart,'5000');
 t.undo();assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.parse(f.value,'yell',true),2000);assert.equal(f.dataset.numStart,undefined);assert.equal(t.undoStack.length,0);
 t.dispatch('ytFormRows','focusout',f);t.flush();assert.equal(t.read('pk:months/2026-10').yt.f0_o0,2000);assert.equal(t.undoStack.length,0);
 pass('Undo synchronizes the focused row and clears its edit origin, so later blur cannot resave the abandoned draft');
}
{
 const t=setup();t.S.lists.others[0]='他人1';t.S.lists.others[1]='他人2';t.S.active.others.fill(false);t.S.month.yt={};t.S.month.yell={};t.render(true);assert(!t.nodes.ytFormRows.innerHTML.includes('data-ytfk="f0_o10"'));
 const n=t.nameField(10,'新しい応援先');t.focus(n);t.fireDocument('input',n);assert.equal(t.S.lists.others[10],'新しい応援先');assert.equal(t.S.active.others[10],true);assert.match(t.nodes.ytFormRows.innerHTML,/data-ytfk="f0_o10"/);assert.match(t.nodes.ytFormRows.innerHTML,/新しい応援先/);assert.equal(t.focused(),n);assert.equal(Object.keys(t.S.month.yt).length,0);
 pass('registering other account 11 immediately adds its goal row through the actual name input and label-refresh flow');
}
console.log(`All ${passed} monthly goal-form scenarios passed.`);
