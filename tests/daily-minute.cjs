const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const source=fs.readFileSync(target,'utf8');
function take(start,end){const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a,`Missing production segment ${start}`);return source.slice(a,b)}
function line(start){const a=source.indexOf(start);assert(a>=0,`Missing production line ${start}`);return source.slice(a,source.indexOf('\n',a)+1)}
function setup(){
 const c=vm.createContext({console,Intl});
 const prelude=`
 const nodes={},store=new Map(),toasts=[],timers=new Map(),windowEvents={};let timerSeq=0,renderCount=0;
 const setTimeout=(f,ms)=>{const id=++timerSeq;timers.set(id,{f,ms});return id},clearTimeout=id=>timers.delete(id),requestAnimationFrame=()=>{};
 const document={activeElement:null,visibilityState:'visible',events:{},addEventListener(e,f){(this.events[e]||=[]).push(f)},querySelectorAll(sel){return $('dayList').querySelectorAll(sel)}};
 const window={addEventListener(e,f){(windowEvents[e]||=[]).push(f)}},navigator={onLine:true};
 const localStorage={removeItem:k=>store.delete(k)},ls={get:k=>store.has(k)?JSON.parse(store.get(k)):null,set:(k,v)=>{store.set(k,JSON.stringify(v));return true}};
 function makeNode(id){
  const n={id,tagName:'DIV',value:'',dataset:{},attrs:{},listeners:{},children:[],textContent:'',hidden:false,disabled:false,checked:false,className:'',classes:new Set(),lastElementChild:{textContent:''},style:{setProperty(k,v){this[k]=v}},scrolls:0};
  n.classList={toggle(k,on){if(on===undefined)on=!n.classes.has(k);if(on)n.classes.add(k);else n.classes.delete(k);return on},add(k){n.classes.add(k)},remove(k){n.classes.delete(k)},contains(k){return n.classes.has(k)}};
  n.setAttribute=(k,v)=>n.attrs[k]=String(v);n.getAttribute=k=>n.attrs[k];n.removeAttribute=k=>delete n.attrs[k];n.hasAttribute=k=>Object.prototype.hasOwnProperty.call(n.attrs,k);
  n.addEventListener=(e,f)=>(n.listeners[e]||=[]).push(f);
  n.contains=t=>n.children.includes(t);n.querySelectorAll=()=>n.children;
  n.querySelector=s=>{const m=/data-dmkey="([^"]+)"/.exec(s);return n.children.find(t=>t.dataset.dmkey&&(!m||t.dataset.dmkey===m[1]))||null};
  n.closest=s=>s==='.prow'?n.row||null:s==='.dmform'?n.form||null:null;
  n.focus=()=>{document.activeElement=n;n.focused=(n.focused||0)+1};
  n.select=()=>{n.selected=(n.selected||0)+1};
  n.blur=()=>{if(document.activeElement!==n)return;document.activeElement=null;n.blurred=(n.blurred||0)+1;if(n.dataset.dmkey)dispatch('dayList','focusout',n)};
  n.scrollIntoView=()=>n.scrolls++;
  let html='';Object.defineProperty(n,'innerHTML',{get(){return html},set(value){html=value;if(id!=='dayList')return;renderCount++;n.children=[];
   for(const m of value.matchAll(/<input\\b([^>]*data-dmkey="([^"]+)"[^>]*)>/g)){
    const key=m[2],t=makeNode('dm-'+key);t.tagName='INPUT';t.row=makeNode('row-'+key);t.row.querySelector=s=>nodes['preview-'+key+'-'+s]||=(makeNode('preview-'+key+'-'+s));
    for(const a of m[1].matchAll(/([\\w-]+)="([^"]*)"/g)){t.attrs[a[1]]=a[2];if(a[1]==='value')t.value=a[2];if(a[1].startsWith('data-'))t.dataset[a[1].slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=a[2]}
    nodes[t.id]=t;nodes[t.id+'-hint']=makeNode(t.id+'-hint');n.children.push(t);
   }
  }});return n;
 }
 function $(id){return nodes[id]||=(makeNode(id))}
 function dispatch(id,e,target,extra={}){const ev={target,isComposing:false,preventDefault(){this.prevented=true},...extra};for(const f of $(id).listeners[e]||[])f(ev);return ev}
 const N=50,YMAX=99999999,pk=(f,o)=>'f'+f+'_o'+o,vIdx=n=>Number.isInteger(n)&&n>=0&&n<N;
 const parsePk=k=>{const m=/^f(\\d+)_o(\\d+)$/.exec(k);return m&&vIdx(+m[1])&&vIdx(+m[2])?[+m[1],+m[2]]:null};
 const pad=n=>String(n).padStart(2,'0'),clock=m=>Math.floor(m/60)+':'+pad(m%60),hm=m=>Math.floor(m/60)+'時間'+m%60+'分',esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const WD=['日','月','火','水','木','金','土'],curYM=()=> '2026-10',ymParts=ym=>({y:+ym.slice(0,4),m:+ym.slice(5),days:new Date(+ym.slice(0,4),+ym.slice(5),0).getDate()}),PF=f=>f,PO=o=>o,schNorm=x=>x;
 const S={ym:'2026-10',mLoaded:true,tab:'day',month:{records:{f0_o0:{1:{c:1,m:45},2:{c:1,m:30}}},yt:{f0_o0:2000},yell:{f0_o0:1000},box:{f0_o0:{2:1}},ryell:{f0_o0:700}},dday:2,dpk:'f0_o0',dayKeys:[],dayAllKeys:[],dayQ:'',dayFam:'all',dayOth:'all',dayView:'all',dayHideAch:false,daySort:'num',dayTodo:false,dayFold:[],compact:true,dayDet:false,bsOnly:true,pins:[],prevKeys:[],extra:['f0_o0','f0_o1','f0_o2','f1_o0'],priv:false,lists:{family:Array.from({length:N},(_,i)=>'自分'+(i+1)),others:Array.from({length:N},(_,i)=>'他人'+(i+1))}};
 S.lists.family[0]='よし';S.lists.family[1]='サブ';S.lists.others[0]='もえ';S.lists.others[1]='ユキ';S.lists.others[2]='たろう';
 const famName=f=>S.lists.family[f],othName=o=>S.lists.others[o],boxOf=(k,d)=>(S.month.box[k]||{})[d]||0,gD=()=>3,gM=()=>300,isAch=(st)=>st.days>=3&&st.min>=300,closeInfo=()=>({left:300});
 let db=null,dl=null,fcCache=new Map(),scrollToday=false;const inflight={},mExists={};
 function showToast(msg){toasts.push(msg)}function hideToast(){}function savePref(){}function ryFocus(){return false}function ryCommitFocused(){}function fillSelect(){}function renderDView(){}function renderStrip(){}function famCoinPlan(){return {nx:{}}}function renderYellBox(){}function fitAll(){}function updDline(){}function renderPanel(){}function alignHeads(){}function addBtns(){return ''}function boxHtml(){return ''}function rowYellHtml(){return ''}function patTag(){return ''}function badge(){return ''}function reachTag(){return ''}function goalYellTag(){return ''}function closeTag(){return ''}function schTag(){return ''}function memoOf(){return ''}function progBar(){return ''}function dayGuide(){return null}function cfmt(v){return String(v)}function fcSrc(){return ''}function fcRest(){return 0}
 function rerender(){renderDay()}function subscribeMonth(){S.month=unpackMonth(ls.get('pk:months/'+S.ym))}function settingsPrepareNavigation(){return true}function ytFormSaveMirror(){}
 const TOPTS='';
 function field(k,value,{ym=S.ym,d=S.dday}={}){const t=makeNode('manual-'+k);t.tagName='INPUT';t.value=value;t.dataset={dmkey:k,dmym:ym,dmday:String(d)};t.row=makeNode('manual-row-'+k);t.row.querySelector=s=>nodes['manual-preview-'+k+'-'+s]||=(makeNode('manual-preview-'+k+'-'+s));nodes[t.id+'-hint']=makeNode(t.id+'-hint');$('dayList').children.push(t);return t}
 `;
 const code=prelude+
 take('function packMonth(','/* ---------- データ読込 ---------- */')+
 take('function getE(f,o,d){','function edit(f,o,d,action){')+
 take('function dayPairs(){','/* ---------- 日付別の時間入力ここまで ---------- */')+
 take('const dayKana=t=>','// その日に入れると月末までに条件の時間へ届く')+
 take("$('bsT').innerHTML=TOPTS;",'// 機能6：バックアップのお知らせ')+
 take('let dayQT=null;',"$('bsOnly').addEventListener('change'")+
 line("$('datePick').addEventListener('change',e=>")+
 line('function goMonth(ym){')+
 take('function flushNumericInputs(){','/* ---------- 名前・条件設定：名前をまとめて入力')+
 line("window.addEventListener('pagehide',()=>{flushDeb();stashPending();flush()});")+
 take("document.addEventListener('visibilitychange',()=>{\n  if(document.visibilityState==='hidden')",'\n})();')+
 `globalThis.api={S,nodes,toasts,field,dispatch,parse:dayMinuteParse,sync:dayMinuteSync,commit:dayMinuteCommitFocused,selectDate:daySelectDate,next:dayNextMissing,render:renderDay,undo:doUndo,undoStack,flush,get:getE,pack:packMonth,unpack:unpackMonth,goMonth,focus:t=>document.activeElement=t,focused:()=>document.activeElement,read:k=>ls.get(k),renderCount:()=>renderCount,runTimers:ms=>{for(const [id,v] of [...timers])if(v.ms===ms){timers.delete(id);v.f()}},pagehide:()=>{for(const fn of windowEvents.pagehide||[])fn()},hidden:()=>{document.visibilityState='hidden';for(const fn of document.events.visibilitychange||[])fn()}};renderDay();`;
 vm.runInContext(code,c,{filename:target});return c.api;
}
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name)}
const plain=v=>JSON.parse(JSON.stringify(v));
test('whole minutes normalize full-width pasted commas and retain exact 0 and 1440 boundaries',()=>{
 const t=setup();for(const [raw,n]of [['０',0],[' １２３ ',123],['１，４４０',1440],['1,200',1200]])assert.equal(t.parse(raw),n);assert.equal(t.parse(''),null);assert.equal(t.parse('　'),null);
});
test('invalid numeric representations cannot overwrite a previously saved time',()=>{
 for(const raw of ['-1','-0','1.5','1.0','1e3','+10','abc','Infinity','1441','９９９９９９９９９９９９９９９９']){
  const t=setup(),f=t.field('f0_o0',raw);assert.equal(t.sync(f,false),false,raw);assert.equal(t.sync(f,true),false,raw);assert.equal(t.get(0,0,2).m,30,raw);assert.equal(t.undoStack.length,0);assert.equal(f.attrs['aria-invalid'],'true');
 }
});
test('ordinary input immediately persists exact minutes through production storage and reload',()=>{
 const t=setup(),f=t.field('f0_o0','７５');t.dispatch('dayList','input',f);t.flush();assert.equal(t.read('pk:months/2026-10').records.f0_o0[2],75);t.S.month=t.unpack(t.read('pk:months/2026-10'));assert.equal(t.get(0,0,2).m,75);assert.equal(t.get(0,0,1).m,45);assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.S.month.ryell.f0_o0,700);assert.equal(t.S.month.box.f0_o0[2],1);assert.equal(f.value,'７５');
});
test('zero records a counted day; an empty draft changes nothing and empty commit removes only that day',()=>{
 const t=setup(),f=t.field('f0_o1','0');t.sync(f,true);t.flush();assert.equal(t.read('pk:months/2026-10').records.f0_o1[2],0);assert.deepEqual(plain(t.get(0,1,2)),{c:1,m:0});f.value='';t.sync(f,false);assert.equal(t.get(0,1,2).m,0);t.sync(f,true);t.flush();assert.equal(t.get(0,1,2),null);assert.equal(t.read('pk:months/2026-10').records.f0_o1,undefined);assert.equal(t.get(0,0,1).m,45);
});
test('one editing session produces one Undo restoring the original record after persistence',()=>{
 const t=setup(),f=t.field('f0_o0','7');t.sync(f,false);f.value='75';t.sync(f,false);f.value='125';t.sync(f,false);t.sync(f,true);t.sync(f,true);assert.equal(t.undoStack.length,1);assert.deepEqual(plain(t.undoStack[0].items),[{f:0,o:0,d:2,prev:{c:1,m:30}}]);t.flush();t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').records.f0_o0[2],30);
});
test('new recorded day and clearing an existing day each Undo to their exact original existence',()=>{
 const t=setup(),f=t.field('f0_o1','60');t.sync(f,true);t.undo();assert.equal(t.get(0,1,2),null);const a=t.field('f0_o0','');t.sync(a,true);t.undo();assert.equal(t.get(0,0,2).m,30);
});
test('a no-op value and an edit reverted before commit create no Undo entry',()=>{
 const t=setup(),f=t.field('f0_o0','30');t.sync(f,true);assert.equal(t.undoStack.length,0);f.value='75';t.sync(f,false);f.value='30';t.sync(f,true);assert.equal(t.undoStack.length,0);assert.equal(t.get(0,0,2).m,30);
});
for(const kind of ['month','day','unloaded','pair'])test(`stale ${kind} context cannot save into another day or month`,()=>{
 const t=setup(),f=t.field('f0_o0','90');if(kind==='month')f.dataset.dmym='2026-09';if(kind==='day')f.dataset.dmday='3';if(kind==='unloaded')t.S.mLoaded=false;if(kind==='pair')f.dataset.dmkey='f50_o0';assert.equal(t.sync(f,true),false);assert.equal(t.get(0,0,2).m,30);assert.equal(t.get(0,0,3),null);assert.equal(t.undoStack.length,0);
});
test('changing current selected pair does not redirect a field bound to its original pair',()=>{
 const t=setup(),f=t.field('f0_o0','90');t.S.dpk='f1_o0';t.sync(f,true);assert.equal(t.get(0,0,2).m,90);assert.equal(t.get(1,0,2),null);
});
for(const mode of ['isComposing','229','tracked'])test(`${mode} IME Enter neither advances nor overwrites a saved time`,()=>{
 const t=setup(),f=t.field('f0_o0','７５');t.focus(f);if(mode==='tracked')f.dataset.dmComp='1';const ev=t.dispatch('dayList','keydown',f,{key:'Enter',isComposing:mode==='isComposing',keyCode:mode==='229'?229:13});assert.equal(ev.prevented,undefined);assert.equal(t.focused(),f);assert.equal(t.get(0,0,2).m,30);assert.equal(t.undoStack.length,0);
});
test('composition event sequence saves only completed text and change plus blur has one Undo',()=>{
 const t=setup(),f=t.field('f0_o0','１２５');t.focus(f);t.dispatch('dayList','compositionstart',f);t.dispatch('dayList','input',f,{isComposing:true});t.dispatch('dayList','change',f);assert.equal(t.get(0,0,2).m,30);t.dispatch('dayList','compositionend',f);assert.equal(t.get(0,0,2).m,125);t.dispatch('dayList','change',f);f.blur();assert.equal(t.undoStack.length,1);assert.equal(f.dataset.dmStart,undefined);
});
test('invalid Enter retains focus and exposes the error; correcting it commits and advances',()=>{
 const t=setup(),f=t.field('f0_o0','1.5');t.focus(f);let ev=t.dispatch('dayList','keydown',f,{key:'Enter',keyCode:13});assert.equal(ev.prevented,true);assert.equal(t.focused(),f);assert.equal(f.attrs['aria-invalid'],'true');assert.equal(t.get(0,0,2).m,30);f.value='75';t.dispatch('dayList','keydown',f,{key:'Enter',keyCode:13});assert.equal(t.get(0,0,2).m,75);assert.equal(t.S.dpk,'f0_o1');assert.equal(t.focused().dataset.dmkey,'f0_o1');assert.equal(t.undoStack.length,1);
});
test('next missing wraps within visible filtered keys and ignores hidden or already recorded pairs',()=>{
 const t=setup();t.S.month.records.f0_o1={2:{c:1,m:0}};t.next('f1_o0',['f0_o2','f0_o0','f0_o1','f1_o0']);assert.equal(t.S.dpk,'f0_o2');assert.equal(t.focused().dataset.dmkey,'f0_o2');assert.equal(t.focused().row.scrolls,1);
});
test('completed visible list retains selected pair and reports no remaining input',()=>{
 const t=setup();t.S.month.records.f0_o1={2:{c:1,m:0}};t.S.dpk='f0_o0';t.next('f0_o0',['f0_o0','f0_o1']);assert.equal(t.S.dpk,'f0_o0');assert.match(t.toasts.at(-1),/未入力はありません/);
});
test('time preset replaces the absolute time instead of adding and Undo restores previous time',()=>{
 const t=setup(),f=t.field('f0_o0','30'),b={dataset:{dmset:'90'},hasAttribute:()=>false};const form={querySelector:()=>f};b.closest=s=>s==='.dmform'?form:b;t.focus(f);t.dispatch('dayList','click',b);assert.equal(t.get(0,0,2).m,90);assert.equal(t.undoStack.length,1);t.undo();assert.equal(t.get(0,0,2).m,30);
});
test('next button saves current input and selects a different unentered visible pair',()=>{
 const t=setup(),f=t.field('f0_o0','60'),b={dataset:{},hasAttribute:k=>k==='data-dmnext'};const form={querySelector:()=>f};b.closest=s=>s==='.dmform'?form:b;t.focus(f);t.dispatch('dayList','click',b);assert.equal(t.get(0,0,2).m,60);assert.equal(t.S.dpk,'f0_o1');assert.equal(t.focused().dataset.dmkey,'f0_o1');
});
test('production rendering has one form for selected pair with account, month and date context',()=>{
 const t=setup();let html=t.nodes.dayList.innerHTML;assert.equal((html.match(/class="dmform"/g)||[]).length,1);assert.match(html,/aria-label="2026-10-02 よし → もえの時間（分）"/);assert.match(html,/aria-describedby="dm-f0_o0-hint"/);assert.match(html,/inputmode="numeric" enterkeyhint="next"/);assert.match(html,/data-dmset="90"/);t.S.dpk='f1_o0';t.render();html=t.nodes.dayList.innerHTML;assert.equal((html.match(/class="dmform"/g)||[]).length,1);assert.match(html,/id="dm-f1_o0"/);assert.doesNotMatch(html,/id="dm-f0_o0"/);
});
test('focused editing preserves input node, value and caret context while totals update',()=>{
 const t=setup(),f=t.nodes.dayList.children[0];t.focus(f);const n=t.renderCount();f.value='75';t.dispatch('dayList','input',f);t.render();assert.equal(t.renderCount(),n);assert.equal(t.focused(),f);assert.equal(f.value,'75');assert.equal(t.S.dayDirty,true);assert.match(t.nodes.daySum.innerHTML,/1時間15分/);assert.equal(t.nodes.dnProg.style['--p'],'25%');
});
test('Undo updates a still focused field and clears its origin so later blur cannot reapply a draft',()=>{
 const t=setup(),f=t.nodes.dayList.children[0];t.focus(f);f.value='75';t.sync(f,true);f.value='90';t.sync(f,false);assert.equal(f.dataset.dmStart,JSON.stringify({c:1,m:75}));t.undo();assert.equal(t.get(0,0,2).m,30);assert.equal(f.value,'30');assert.equal(f.dataset.dmStart,undefined);f.blur();t.flush();assert.equal(t.read('pk:months/2026-10').records.f0_o0[2],30);assert.equal(t.undoStack.length,0);
});
test('valid input followed by invalid text still Undo restores its original saved time on blur',()=>{
 const t=setup();t.S.month.records.f0_o0[2]={c:1,m:60};const f=t.field('f0_o0','75');t.focus(f);t.dispatch('dayList','input',f);f.value='75x';t.dispatch('dayList','input',f);f.blur();assert.equal(t.get(0,0,2).m,75);assert.equal(t.undoStack.length,1);assert.equal(t.undoStack[0].items[0].prev.m,60);t.undo();t.flush();assert.equal(t.read('pk:months/2026-10').records.f0_o0[2],60);
});
test('date navigation commits an empty focused value before changing day and ignores stale blur afterward',()=>{
 const t=setup(),f=t.field('f0_o0','');t.focus(f);t.sync(f,false);assert.equal(t.selectDate(3),true);assert.equal(t.get(0,0,2),null);assert.equal(t.S.dday,3);assert.equal(t.undoStack.length,1);f.value='120';assert.equal(t.sync(f,true),false);assert.equal(t.get(0,0,3),null);t.flush();assert.equal(t.read('pk:months/2026-10').records.f0_o0[1],45);
});
test('date navigation enforces actual month boundaries without committing invalid destination',()=>{
 const t=setup(),f=t.field('f0_o0','');t.focus(f);for(const d of [0,32,-1,2.5,NaN])assert.equal(t.selectDate(d),false);assert.equal(t.S.dday,2);assert.equal(t.get(0,0,2).m,30);t.S.ym='2026-02';f.dataset.dmym='2026-02';assert.equal(t.selectDate(29),false);assert.equal(t.selectDate(28),true);assert.equal(t.S.dday,28);
});
test('date picker rejects malformed, impossible and foreign-month values and restores displayed date',()=>{
 const t=setup();for(const value of ['2026-11-02','2026-10-00','2026-10-32','2026-10-2','broken','']){t.nodes.datePick.value=value;t.dispatch('datePick','change',t.nodes.datePick);assert.equal(t.nodes.datePick.value,'2026-10-02',value);assert.equal(t.S.dday,2)}t.nodes.datePick.value='2026-10-31';t.dispatch('datePick','change',t.nodes.datePick);assert.equal(t.S.dday,31);assert.equal(t.nodes.nextD.disabled,true);
});
for(const lifecycle of ['pagehide','hidden'])test(`${lifecycle} commits focused empty values before production persistence`,()=>{
 const t=setup(),f=t.field('f0_o0','');t.focus(f);t[lifecycle]();assert.equal(t.get(0,0,2),null);assert.equal(t.read('pk:months/2026-10').records.f0_o0[2],undefined);assert.equal(t.read('pk:months/2026-10').records.f0_o0[1],45);assert.equal(t.undoStack.length,1);
});
test('month navigation commits old month and stale field cannot affect newly loaded month',()=>{
 const t=setup(),f=t.field('f0_o0','');t.focus(f);assert.equal(t.goMonth('2026-11'),true);assert.equal(t.read('pk:months/2026-10').records.f0_o0[2],undefined);assert.equal(t.S.ym,'2026-11');f.value='120';assert.equal(t.sync(f,true),false);assert.equal(t.get(0,0,2),null);assert.equal(t.undoStack[0].ym,'2026-10');
});
test('immediate search before bulk refreshes production visible keys and applies only searched pairs',()=>{
 const t=setup();assert.equal(t.S.dayKeys.length,4);t.nodes.dayQ.value='ユキ';t.nodes.bsT.value='60';t.nodes.bsGo.onclick();assert.equal(t.S.dayQ,'ユキ');assert.deepEqual(Array.from(t.S.dayKeys),['f0_o1']);assert.equal(t.get(0,1,2),null);t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2).m,60);assert.equal(t.get(0,2,2),null);assert.equal(t.get(1,0,2),null);assert.equal(t.get(0,0,2).m,30);assert.equal(t.undoStack.length,1);
});
test('bulk action during search composition cannot arm or modify any pair',()=>{
 const t=setup();t.nodes.dayQ.value='ユキ';t.dispatch('dayQ','compositionstart',t.nodes.dayQ);t.nodes.bsT.value='60';t.nodes.bsGo.onclick();t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2),null);assert.equal(t.S.dayQ,'');assert.equal(t.undoStack.length,0);assert.match(t.toasts.at(-1),/文字を確定/);
});
console.log(`All ${passed} daily inline-minute scenarios passed.`);
