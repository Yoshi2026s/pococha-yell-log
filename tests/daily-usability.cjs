const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const source=fs.readFileSync(target,'utf8');
function take(start,end){const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a,`Missing production segment ${start}`);return source.slice(a,b)}
function line(start){const a=source.indexOf(start);assert(a>=0,`Missing production line ${start}`);return source.slice(a,source.indexOf('\n',a)+1)}
function setup(){
 const c=vm.createContext({console,Intl});
 const prelude=`
 const nodes={},store=new Map(),toasts=[],timers=new Map(),windowEvents={},saveMirrors=[];let timerSeq=0,renderCount=0;
 const setTimeout=(f,ms)=>{const id=++timerSeq;timers.set(id,{f,ms});return id},clearTimeout=id=>timers.delete(id),requestAnimationFrame=()=>{};
 const document={activeElement:null,visibilityState:'visible',events:{},addEventListener(e,f){(this.events[e]||=[]).push(f)},querySelectorAll(sel){return sel==='.dm-save'?saveMirrors:$('dayList').querySelectorAll(sel)},createElement(){return makeNode('new-element')}};
 const window={addEventListener(e,f){(windowEvents[e]||=[]).push(f)}},navigator={onLine:true};
 const localStorage={removeItem:k=>store.delete(k)},ls={get:k=>store.has(k)?JSON.parse(store.get(k)):null,set:(k,v)=>{store.set(k,JSON.stringify(v));return true}};
 function makeNode(id){
  const n={id,tagName:'DIV',value:'',dataset:{},attrs:{},listeners:{},children:[],textContent:'',hidden:false,disabled:false,checked:false,className:'',classes:new Set(),lastElementChild:{textContent:''},style:{setProperty(k,v){this[k]=v}},scrolls:0};
  n.classList={toggle(k,on){if(on===undefined)on=!n.classes.has(k);if(on)n.classes.add(k);else n.classes.delete(k);return on},add(k){n.classes.add(k)},remove(k){n.classes.delete(k)},contains(k){return n.classes.has(k)}};
  n.setAttribute=(k,v)=>n.attrs[k]=String(v);n.getAttribute=k=>n.attrs[k];n.removeAttribute=k=>delete n.attrs[k];n.hasAttribute=k=>Object.prototype.hasOwnProperty.call(n.attrs,k);
  n.addEventListener=(e,f)=>(n.listeners[e]||=[]).push(f);
  n.contains=t=>n.children.includes(t);n.querySelectorAll=sel=>{if(sel==='input'||sel.includes('input[data-dmkey]'))return n.children.filter(t=>t.tagName==='INPUT');if(sel==='.prow')return n.children.filter(t=>t.tagName==='INPUT').map(t=>t.row);return []};
  n.querySelector=s=>{const m=/data-dmkey="([^"]+)"/.exec(s);return n.children.find(t=>t.dataset.dmkey&&(!m||t.dataset.dmkey===m[1]))||null};
  n.closest=s=>s==='.prow'?n.row||null:s==='.dmform'?n.form||null:null;
  n.focus=()=>{document.activeElement=n;n.focused=(n.focused||0)+1};n.select=()=>n.selected=(n.selected||0)+1;
  n.blur=()=>{if(document.activeElement!==n)return;document.activeElement=null;n.blurred=(n.blurred||0)+1;if(n.dataset.dmkey)dispatch('dayList','focusout',n)};
  n.scrollIntoView=()=>n.scrolls++;
  let html='';Object.defineProperty(n,'innerHTML',{get(){return html},set(value){html=value;if(id!=='dayList')return;renderCount++;n.children=[];
   for(const m of value.matchAll(/<input\\b([^>]*data-dmkey="([^"]+)"[^>]*)>/g)){
    const key=m[2],t=makeNode('dm-'+key);t.tagName='INPUT';t.row=makeNode('row-'+key);t.row.dataset={f:key.match(/^f(\\d+)_/)[1],o:key.match(/_o(\\d+)$/)[1]};t.row.querySelector=s=>nodes['preview-'+key+'-'+s]||=(makeNode('preview-'+key+'-'+s));
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
 const S={ym:'2026-10',mLoaded:true,tab:'day',month:{records:{f0_o0:{1:{c:1,m:45},2:{c:1,m:30}}},yt:{f0_o0:2000},yell:{f0_o0:1000},box:{f0_o0:{2:1}},ryell:{f0_o0:700}},dday:2,dpk:'f0_o0',dayKeys:[],dayAllKeys:[],dayQ:'',dayFam:'all',dayOth:'all',dayView:'all',dayHideAch:false,daySort:'num',dayTodo:false,dayFold:[],compact:true,dayDet:false,bsOnly:true,dayFocus:false,dayClock:false,dayPanel:false,dayExtras:false,dayLastMinutes:null,dayMonths:{},pins:[],prevKeys:[],extra:['f0_o0','f0_o1','f0_o2','f1_o0'],priv:false,lists:{family:Array.from({length:N},(_,i)=>'自分'+(i+1)),others:Array.from({length:N},(_,i)=>'他人'+(i+1))}};
 S.lists.family[0]='よし';S.lists.family[1]='サブ';S.lists.others[0]='もえ';S.lists.others[1]='ユキ';S.lists.others[2]='たろう';
 const famName=f=>S.lists.family[f],othName=o=>S.lists.others[o],boxOf=(k,d)=>(S.month.box[k]||{})[d]||0,gD=()=>3,gM=()=>300,isAch=(st)=>st.days>=3&&st.min>=300,closeInfo=()=>({left:300});
 let db=null,dl=null,fcCache=new Map(),scrollToday=false;const inflight={},mExists={};
 function showToast(msg){toasts.push(msg)}function hideToast(){}function ryFocus(){return false}function ryCommitFocused(){}function fillSelect(){}function renderDView(){}function renderStrip(){}function famCoinPlan(){return {nx:{}}}function renderYellBox(){}function fitAll(){}function updDline(){}function renderPanel(){}function alignHeads(){}function addBtns(){return ''}function boxHtml(){return ''}function rowYellHtml(){return ''}function patTag(){return ''}function badge(){return ''}function reachTag(){return ''}function goalYellTag(){return ''}function closeTag(){return ''}function schTag(){return ''}function memoOf(){return ''}function progBar(){return ''}function dayGuide(){return null}function cfmt(v){return String(v)}function fcSrc(){return ''}function fcRest(){return 0}
 function rerender(){renderDay()}function subscribeMonth(){S.month=unpackMonth(ls.get('pk:months/'+S.ym))}function settingsPrepareNavigation(){return true}function ytFormSaveMirror(){}
 const TOPTS='';
 function field(k,value,{ym=S.ym,d=S.dday}={}){const t=makeNode('manual-'+k);t.tagName='INPUT';t.value=value;t.dataset={dmkey:k,dmym:ym,dmday:String(d)};t.row=makeNode('manual-row-'+k);t.row.querySelector=s=>nodes['manual-preview-'+k+'-'+s]||=(makeNode('manual-preview-'+k+'-'+s));t.row.dataset={f:k.match(/^f(\\d+)_/)[1],o:k.match(/_o(\\d+)$/)[1]};nodes[t.id+'-hint']=makeNode(t.id+'-hint');$('dayList').children.push(t);return t}
 `;
 const code=prelude+
 take('function packMonth(','/* ---------- データ読込 ---------- */')+
 take('function getE(f,o,d){','function edit(f,o,d,action){')+
 line('function savePref(){')+
 take('function dayPairs(){','/* ---------- 日付別の時間入力ここまで ---------- */')+
 take('const dayKana=t=>','// その日に入れると月末までに条件の時間へ届く')+
 take("$('bsT').innerHTML=TOPTS;",'// 機能6：バックアップのお知らせ')+
 take('let dayQT=null;',"$('bsOnly').addEventListener('change'")+
 take("$('bsOnly').addEventListener('change'",'// この日の実績をテキストでコピー')+
 line("$('datePick').addEventListener('change',e=>")+
 line('function goMonth(ym){')+
 line("$('dayFam').addEventListener('change',e=>")+
 line("$('dayOth').addEventListener('change',e=>")+
 line("$('daySort').addEventListener('change',e=>")+
 line("$('dayHideAch').addEventListener('change',e=>")+
 take('function flushNumericInputs(){','/* ---------- 名前・条件設定：名前をまとめて入力')+
 line("window.addEventListener('pagehide',()=>{flushDeb();stashPending();flush()});")+
 take("document.addEventListener('visibilitychange',()=>{\n  if(document.visibilityState==='hidden')",'\n})();')+
 `globalThis.api={S,nodes,toasts,field,dispatch,node:makeNode,saveMirrors,savePref,format:dayMinuteFormat,action:dayMinuteAction,move:dayMovePair,start:dayStartInput,saveState:daySaveState,mirror:daySaveMirror,monthPrefs:dayMonthPrefs,extraKeys:dayExtraKeys,snapshot:daySnapshotHistory,extraOnly:dayExtraOnly,removeExtra:dayRemoveExtra,prepare:dayPrepareNavigation,parse:dayMinuteParse,sync:dayMinuteSync,commit:dayMinuteCommitFocused,selectDate:daySelectDate,next:dayNextMissing,render:renderDay,undo:doUndo,undoStack,flush,get:getE,pack:packMonth,unpack:unpackMonth,goMonth,focus:t=>document.activeElement=t,focused:()=>document.activeElement,read:k=>ls.get(k),renderCount:()=>renderCount,runTimers:ms=>{for(const [id,v] of [...timers])if(v.ms===ms){timers.delete(id);v.f()}},pagehide:()=>{for(const fn of windowEvents.pagehide||[])fn()},hidden:()=>{document.visibilityState='hidden';for(const fn of document.events.visibilitychange||[])fn()}};renderDay();`;
 vm.runInContext(code,c,{filename:target});return c.api;
}
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name)}
const plain=v=>JSON.parse(JSON.stringify(v));
function button(t,dataset={},attrs=[]){const b=t.node('action-button');b.tagName='BUTTON';b.dataset={...dataset};for(const a of attrs)b.setAttribute(a,'');return b}
function apply(t,k,value,dataset={},attrs=[]){const f=t.field(k,value);t.focus(f);return {field:f,ok:t.action(f,button(t,dataset,attrs))}}
test('minute, colon, Japanese, full-width and boundary formats represent exactly the same minutes',()=>{
 const t=setup();for(const [raw,want]of [['75',75],['1:15',75],['１：１５',75],['1時間15分',75],['１時間１５分',75],['75分',75],['1時間',60],['0:00',0],['24:00',1440],['24時間',1440],['24時間0分',1440],['１，４４０',1440]])assert.equal(t.parse(raw),want,raw);assert.equal(t.parse(''),null);assert.equal(t.parse('　'),null);
});
test('malformed clock and mixed units cannot silently normalize out-of-range minutes',()=>{
 const t=setup();for(const raw of ['1:75','24:01','1:5','1:015','25:00','1時間60分','1.5時間','-1:00','+1:00','1時間-5分','1441分','0.5','1e3','Infinity','abc'])assert.ok(Number.isNaN(t.parse(raw)),raw);
});
test('clock input persists exact numeric minutes, preserving all unrelated month fields',()=>{
 const t=setup(),f=t.field('f0_o0','１：１５');t.sync(f,true);t.flush();const saved=t.read('pk:months/2026-10');assert.equal(saved.records.f0_o0[2],75);assert.equal(saved.records.f0_o0[1],45);t.S.month=t.unpack(saved);assert.equal(t.get(0,0,2).m,75);assert.equal(t.S.month.yt.f0_o0,2000);assert.equal(t.S.month.yell.f0_o0,1000);assert.equal(t.S.month.ryell.f0_o0,700);assert.equal(t.S.month.box.f0_o0[2],1);
});
test('changing input format commits valid draft, preserves minute amount and selects the replacement field',()=>{
 const t=setup();const {ok}=apply(t,'f0_o0','75',{dmformat:'clock'});assert.equal(ok,true);assert.equal(t.get(0,0,2).m,75);assert.equal(t.S.dayClock,true);assert.equal(t.focused().value,'1:15');assert.equal(t.focused().selected,1);assert.equal(t.read('pk:pref').dayClock,true);apply(t,'f0_o0','1:15',{dmformat:'minutes'});assert.equal(t.get(0,0,2).m,75);assert.equal(t.S.dayClock,false);assert.equal(t.focused().value,'75');assert.equal(t.undoStack.length,1);
});
test('invalid draft blocks format switch while saved record and focus remain intact',()=>{
 const t=setup();const a=apply(t,'f0_o0','1:75',{dmformat:'clock'});assert.equal(a.ok,false);assert.equal(t.S.dayClock,false);assert.equal(t.get(0,0,2).m,30);assert.equal(t.focused(),a.field);assert.equal(a.field.attrs['aria-invalid'],'true');
});
test('plus and minus corrections are absolute minute updates with exact Undo',()=>{
 const t=setup();apply(t,'f0_o0','1:15',{dmadjust:'5'});assert.equal(t.get(0,0,2).m,80);t.undo();assert.equal(t.get(0,0,2).m,30);apply(t,'f0_o0','30',{dmadjust:'-5'});assert.equal(t.get(0,0,2).m,25);t.undo();apply(t,'f0_o0','30',{dmadjust:'15'});assert.equal(t.get(0,0,2).m,45);t.undo();assert.equal(t.get(0,0,2).m,30);
});
test('correction below zero and above 24 hours refuses the entire proposed change',()=>{
 for(const [value,delta]of [['3','-5'],['1440','5'],['1430','15']]){const t=setup(),a=apply(t,'f0_o0',value,{dmadjust:delta});assert.equal(a.ok,false);assert.equal(t.get(0,0,2).m,30);assert.equal(t.undoStack.length,0);assert.match(t.toasts.at(-1),/範囲/)}
});
test('correction accepts exact zero and 24-hour boundaries without rounding or wrapping',()=>{
 let t=setup();apply(t,'f0_o0','5',{dmadjust:'-5'});assert.deepEqual(plain(t.get(0,0,2)),{c:1,m:0});t=setup();apply(t,'f0_o0','1435',{dmadjust:'5'});assert.equal(t.get(0,0,2).m,1440);
});
test('previous-day copy changes only selected pair/current date and Undo restores its value',()=>{
 const t=setup();const a=apply(t,'f0_o0','30',{},['data-dmprevcopy']);assert.equal(a.ok,true);assert.equal(t.get(0,0,2).m,45);assert.equal(t.get(0,0,1).m,45);assert.equal(t.get(0,1,2),null);t.flush();t.S.month=t.unpack(t.read('pk:months/2026-10'));t.undo();assert.equal(t.get(0,0,2).m,30);assert.equal(t.get(0,0,1).m,45);
});
test('previous-day copy refuses missing source and first day without creating a record',()=>{
 let t=setup();assert.equal(apply(t,'f0_o1','',{},['data-dmprevcopy']).ok,false);assert.equal(t.get(0,1,2),null);assert.equal(t.undoStack.length,0);t=setup();t.S.dday=1;assert.equal(apply(t,'f0_o0','45',{},['data-dmprevcopy']).ok,false);assert.equal(t.get(0,0,1).m,45);
});
test('explicit zero records a counted day; clear removes only it, each action Undo restores existence',()=>{
 const t=setup();apply(t,'f0_o1','',{},['data-dmzero']);t.flush();assert.equal(t.read('pk:months/2026-10').records.f0_o1[2],0);assert.deepEqual(plain(t.get(0,1,2)),{c:1,m:0});apply(t,'f0_o1','0',{},['data-dmclear']);t.flush();assert.equal(t.read('pk:months/2026-10').records.f0_o1,undefined);t.undo();assert.deepEqual(plain(t.get(0,1,2)),{c:1,m:0});t.undo();assert.equal(t.get(0,1,2),null);
});
test('last-input suggestion records only committed nonzero valid minutes and survives preference roundtrip',()=>{
 const t=setup(),f=t.field('f0_o0','75');t.sync(f,false);assert.equal(t.S.dayLastMinutes,null);t.sync(f,true);assert.equal(t.S.dayLastMinutes,75);assert.equal(t.read('pk:pref').dayLastMinutes,75);f.value='0';t.sync(f,true);f.value='';t.sync(f,true);f.value='24:01';t.sync(f,true);assert.equal(t.S.dayLastMinutes,75);assert.equal(t.read('pk:pref').dayLastMinutes,75);apply(t,'f0_o1','',{},['data-dmlast']);assert.equal(t.get(0,1,2).m,75);t.undo();assert.equal(t.get(0,1,2),null);
});
test('viewing an unchanged existing record does not replace the last entered time suggestion',()=>{
 const t=setup();t.S.dayLastMinutes=75;t.savePref();const f=t.field('f0_o0','30');t.focus(f);assert.equal(t.selectDate(3),true);assert.equal(t.S.dayLastMinutes,75);assert.equal(t.read('pk:pref').dayLastMinutes,75);assert.equal(t.get(0,0,2).m,30);assert.equal(t.undoStack.length,0);assert.equal(t.move('f0_o0',1),true);assert.equal(t.S.dayLastMinutes,75);
});
test('save indicator copies exact real saving, error and saved status text',()=>{
 const t=setup(),n=t.node('save-badge');t.saveMirrors.push(n);for(const [cls,txt,state]of [['status busy','この端末に保存中…','pending'],['status err','保存できませんでした','error'],['status ok','この端末に保存しました','ok']]){t.nodes.status.className=cls;t.nodes.status.lastElementChild.textContent=txt;assert.deepEqual(plain(t.saveState()),{state,txt});t.mirror();assert.equal(n.dataset.state,state);assert.equal(n.textContent,txt)}
});
test('save indicator receives real production storage status instead of merely input-change text',()=>{
 const t=setup(),n=t.node('save-badge');t.saveMirrors.push(n);const f=t.field('f0_o0','1:15');t.sync(f,true);t.flush();assert.equal(n.dataset.state,'ok');assert.equal(n.textContent,t.nodes.status.lastElementChild.textContent);assert.match(n.textContent,/保存/);
});
test('previous and next pair navigation follows only supplied visible keys and does not wrap edges',()=>{
 const t=setup(),ks=['f0_o0','f1_o0'];assert.equal(t.move('f0_o0',1,ks),true);assert.equal(t.S.dpk,'f1_o0');assert.equal(t.focused().dataset.dmkey,'f1_o0');assert.equal(t.focused().selected,1);assert.equal(t.move('f1_o0',1,ks),false);assert.equal(t.move('f1_o0',-1,ks),true);assert.equal(t.S.dpk,'f0_o0');assert.equal(t.move('f0_o0',-1,ks),false);assert.equal(t.get(0,1,2),null);
});
test('navigation commits current draft into its own pair before selecting another visible pair',()=>{
 const t=setup(),a=apply(t,'f0_o0','75',{dmpair:'1'});assert.equal(a.ok,true);assert.equal(t.get(0,0,2).m,75);assert.equal(t.S.dpk,'f0_o1');assert.equal(t.get(0,1,2),null);assert.equal(t.undoStack.length,1);assert.equal(t.read('pk:pref').daily.k,'f0_o1');
});
test('start input selects first missing visible pair and skips a counted zero-minute day',()=>{
 const t=setup();t.S.month.records.f0_o1={2:{c:1,m:0}};t.S.dpk='f1_o0';assert.equal(t.start(),true);assert.equal(t.S.dpk,'f0_o2');assert.equal(t.focused().dataset.dmkey,'f0_o2');assert.equal(t.focused().selected,1);assert.match(t.nodes.dayStart.textContent,/残り2組/);
});
test('start after immediate search uses searched keys and never enters a hidden account',()=>{
 const t=setup();t.nodes.dayQ.value='ユキ';assert.equal(t.start(),true);assert.equal(t.S.dayQ,'ユキ');assert.deepEqual(Array.from(t.S.dayKeys),['f0_o1']);assert.equal(t.S.dpk,'f0_o1');assert.equal(t.get(0,2,2),null);
});
test('start with all visible days already recorded selects existing pair for correction',()=>{
 const t=setup();for(const k of t.S.dayKeys)t.S.month.records[k]={[2]:{c:1,m:0}};t.S.dpk='f1_o0';assert.equal(t.start(),true);assert.equal(t.S.dpk,'f1_o0');assert.match(t.nodes.dayStart.textContent,/確認・修正/);
});
test('start with zero searched results reports how to add a pair without creating a record',()=>{
 const t=setup();t.nodes.dayQ.value='存在しない名前';assert.equal(t.start(),false);assert.equal(t.S.dayKeys.length,0);assert.match(t.toasts.at(-1),/組み合わせを追加/);assert.equal(t.get(0,0,2).m,30);
});
for(const comp of ['minute','yell','search'])test(`tracked ${comp} composition refuses date, month, pair and start navigation`,()=>{
 const t=setup(),f=t.field('f0_o0','１：１５');t.focus(f);if(comp==='minute')f.dataset.dmComp='1';if(comp==='yell'){const e=t.node('yell-input');e.tagName='INPUT';e.dataset={ry:'ryell',numComp:'1'};t.nodes.dayList.children.push(e)}if(comp==='search')t.nodes.dayQ.dataset.dayComp='1';assert.equal(t.selectDate(3),false);assert.equal(t.goMonth('2026-11'),false);assert.equal(t.move('f0_o0',1),false);assert.equal(t.start(),false);assert.equal(t.S.ym,'2026-10');assert.equal(t.S.dday,2);assert.equal(t.S.dpk,'f0_o0');assert.equal(t.get(0,0,2).m,30);assert.equal(t.focused(),f);assert.equal(t.undoStack.length,0);
});
test('guard refuses unfocused composition and restores a changed filter select to current context',()=>{
 const t=setup(),f=t.field('f0_o0','７５');f.dataset.dmComp='1';t.nodes.dayFam.value='1';t.dispatch('dayFam','change',t.nodes.dayFam);assert.equal(t.S.dayFam,'all');assert.equal(t.nodes.dayFam.value,'all');assert.equal(t.get(0,0,2).m,30);assert.equal(t.undoStack.length,0);
});
test('after compositionend a date switch commits exactly once in original date',()=>{
 const t=setup(),f=t.field('f0_o0','１：１５');t.focus(f);t.dispatch('dayList','compositionstart',f);t.dispatch('dayList','input',f,{isComposing:true});assert.equal(t.selectDate(3),false);t.dispatch('dayList','compositionend',f);assert.equal(t.selectDate(3),true);assert.equal(t.get(0,0,2).m,75);assert.equal(t.get(0,0,3),null);assert.equal(t.undoStack.length,1);t.flush();assert.equal(t.read('pk:months/2026-10').records.f0_o0[2],75);
});
test('navigation allows invalid draft without applying it and retains latest valid stored draft for Undo',()=>{
 const t=setup(),f=t.field('f0_o0','75');t.focus(f);t.sync(f,false);f.value='1:75';assert.equal(t.selectDate(3),true);assert.equal(t.get(0,0,2).m,75);assert.equal(t.get(0,0,3),null);assert.equal(t.undoStack.length,1);t.undo();assert.equal(t.get(0,0,2).m,30);
});
test('focus toggle preserves selected date and pair and is saved in preferences',()=>{
 const t=setup();t.nodes.dayFocus.onclick();assert.equal(t.S.dayFocus,true);assert.equal(t.nodes['p-day'].classes.has('day-focus'),true);assert.equal(t.read('pk:pref').dayFocus,true);assert.equal(t.S.dday,2);assert.equal(t.S.dpk,'f0_o0');t.nodes.dayFocus.onclick();assert.equal(t.S.dayFocus,false);assert.equal(t.read('pk:pref').dayFocus,false);
});
test('panel and extra controls only change visibility without writing time records',()=>{
 const t=setup();t.nodes.dayPanelToggle.onclick();assert.equal(t.S.dayPanel,true);assert.equal(t.S.panelMin,false);apply(t,'f0_o0','30',{},['data-dmextras']);assert.equal(t.S.dayExtras,true);assert.equal(t.nodes['p-day'].classes.has('day-extras'),true);assert.equal(t.get(0,0,2).m,30);assert.equal(t.undoStack.length,0);
});
test('month history validates month, day, account key and removes duplicates and unknown input types',()=>{
 const t=setup(),v=t.monthPrefs({'2026-10':{d:32,k:'f50_o0',keys:['f0_o0','f0_o0','f49_o49','f50_o0','f0_o50','x',0,null]},'2026-02':{d:28,k:'f0_o1',keys:['f0_o1']},'2026-13':{d:1,keys:['f0_o0']},'bad':{},'2026-11':null});assert.deepEqual(plain(v),{'2026-02':{d:28,k:'f0_o1',keys:['f0_o1']},'2026-10':{d:1,k:null,keys:['f0_o0','f49_o49']}});assert.deepEqual(plain(t.monthPrefs([])),{});assert.deepEqual(plain(t.monthPrefs(null)),{});
});
test('month history caps restored extras at every valid account combination and retains newest 24 months',()=>{
 const t=setup(),keys=[];for(let f=0;f<50;f++)for(let o=0;o<50;o++)keys.push(`f${f}_o${o}`);const hist={};for(let y=2023;y<=2026;y++)for(let m=1;m<=12;m++)hist[`${y}-${String(m).padStart(2,'0')}`]={d:1,k:'f0_o0',keys:[...keys,...keys,'f50_o50']};const got=t.monthPrefs(hist);assert.equal(Object.keys(got).length,24);assert.equal(Object.keys(got)[0],'2025-01');assert.equal(Object.keys(got).at(-1),'2026-12');assert.equal(got['2026-12'].keys.length,2500);assert.equal(new Set(got['2026-12'].keys).size,2500);
});
test('empty extra pair preference survives save and restore without creating a false counted day',()=>{
 const t=setup();t.S.extra.push('f2_o3');t.savePref();const pref=t.read('pk:pref');assert.ok(t.extraKeys('2026-10',pref).includes('f2_o3'));assert.equal(t.get(2,3,2),null);assert.equal(t.read('pk:months/2026-10'),null);assert.equal(pref.dayMonths['2026-10'].d,2);assert.equal(pref.dayMonths['2026-10'].k,'f0_o0');assert.deepEqual(plain(t.extraKeys('2026-11',pref)),[]);
});
test('legacy extra preference restores only its own month with validation and deduplication',()=>{
 const t=setup(),pref={dextra:{ym:'2026-10',keys:['f0_o1','f0_o1','f50_o0','f49_o49']}};assert.deepEqual(plain(t.extraKeys('2026-10',pref)),['f0_o1','f49_o49']);assert.deepEqual(plain(t.extraKeys('2026-11',pref)),[]);
});
test('saving November and returning to October retains each month separate selection and extra pairs',()=>{
 const t=setup();t.S.extra=['f2_o3'];t.savePref();t.S.ym='2026-11';t.S.dday=17;t.S.dpk='f4_o5';t.S.extra=['f4_o5'];t.savePref();const pref=t.read('pk:pref');assert.deepEqual(plain(t.extraKeys('2026-10',pref)),['f2_o3']);assert.deepEqual(plain(t.extraKeys('2026-11',pref)),['f4_o5']);assert.equal(pref.dayMonths['2026-10'].d,2);assert.equal(pref.dayMonths['2026-10'].k,'f0_o0');assert.equal(pref.dayMonths['2026-11'].d,17);assert.equal(pref.dayMonths['2026-11'].k,'f4_o5');
});
test('form rendering describes selected names and date, navigation, format and exact saving state',()=>{
 const t=setup();t.S.dayClock=true;t.nodes.status.className='status err';t.nodes.status.lastElementChild.textContent='保存できませんでした';t.render();const h=t.nodes.dayList.innerHTML;assert.match(h,/2026-10-02/);assert.match(h,/よし → もえ/);assert.match(h,/data-dmpair="-1" disabled/);assert.match(h,/data-dmpair="1"/);assert.match(h,/data-dmformat="clock" aria-pressed="true"/);assert.match(h,/value="0:30"/);assert.match(h,/data-state="error"/);assert.match(h,/保存できませんでした/);assert.match(h,/data-dmprevcopy/);assert.match(h,/data-dmzero/);assert.match(h,/data-dmclear/);
});
for(const lifecycle of ['pagehide','hidden'])test(`${lifecycle} stores a focused clock draft in its bound day and remembers nonzero suggestion`,()=>{
 const t=setup(),f=t.field('f0_o0','1:15');t.focus(f);t[lifecycle]();assert.equal(t.read('pk:months/2026-10').records.f0_o0[2],75);assert.equal(t.read('pk:pref').dayLastMinutes,75);assert.equal(t.undoStack.length,1);
});
test('custom bulk input overrides preset, accepts clock text and alters only displayed unentered pairs',()=>{
 const t=setup();t.nodes.bsT.value='30';t.nodes.bsMinutes.value='１：１５';t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2),null);assert.match(t.nodes.bsGo.textContent,/1:15/);t.nodes.bsGo.onclick();assert.equal(t.get(0,0,2).m,30);assert.equal(t.get(0,1,2).m,75);assert.equal(t.get(0,2,2).m,75);assert.equal(t.get(1,0,2).m,75);assert.equal(t.undoStack.length,1);t.flush();t.S.month=t.unpack(t.read('pk:months/2026-10'));t.undo();assert.equal(t.get(0,1,2),null);assert.equal(t.get(0,0,2).m,30);
});
test('changing custom amount between confirmation clicks requires a new confirmation signature',()=>{
 const t=setup();t.nodes.bsMinutes.value='75';t.nodes.bsGo.onclick();t.nodes.bsMinutes.value='90';t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2),null);assert.match(t.nodes.bsGo.textContent,/1:30/);t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2).m,90);
});
test('invalid custom bulk amount never falls back to preset or applies a previously armed action',()=>{
 const t=setup();t.nodes.bsT.value='60';t.nodes.bsMinutes.value='75';t.nodes.bsGo.onclick();t.nodes.bsMinutes.value='1:75';t.nodes.bsGo.onclick();t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2),null);assert.equal(t.get(0,0,2).m,30);assert.equal(t.undoStack.length,0);assert.equal(t.nodes.bsMinutes.attrs['aria-invalid'],'true');
});
test('blank custom bulk uses preset while explicit zero counts a day and Undo removes it',()=>{
 let t=setup();t.nodes.bsT.value='120';t.nodes.bsMinutes.value='';t.nodes.bsGo.onclick();t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2).m,120);t=setup();t.nodes.bsMinutes.value='0:00';t.nodes.bsGo.onclick();t.nodes.bsGo.onclick();assert.deepEqual(plain(t.get(0,1,2)),{c:1,m:0});t.undo();assert.equal(t.get(0,1,2),null);
});
test('search composition blocks custom bulk and search confirmation reads exact current filter',()=>{
 const t=setup();t.nodes.bsMinutes.value='1時間15分';t.nodes.dayQ.value='ユキ';t.dispatch('dayQ','compositionstart',t.nodes.dayQ);t.nodes.bsGo.onclick();t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2),null);t.dispatch('dayQ','compositionend',t.nodes.dayQ);t.nodes.bsGo.onclick();t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2).m,75);assert.equal(t.get(0,2,2),null);assert.equal(t.get(1,0,2),null);
});
test('custom bulk composition cannot arm or save until completed text has been confirmed',()=>{
 const t=setup();t.nodes.bsMinutes.value='１：１５';t.dispatch('bsMinutes','compositionstart',t.nodes.bsMinutes);t.dispatch('bsMinutes','input',t.nodes.bsMinutes,{isComposing:true});t.nodes.bsGo.onclick();t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2),null);assert.equal(t.undoStack.length,0);t.dispatch('bsMinutes','compositionend',t.nodes.bsMinutes);t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2),null);t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2).m,75);
});
test('preset change clears invalid custom text and resets armed confirmation through real event listener',()=>{
 const t=setup();t.nodes.bsMinutes.value='1:75';t.dispatch('bsMinutes','input',t.nodes.bsMinutes);assert.equal(t.nodes.bsMinutes.attrs['aria-invalid'],'true');t.nodes.bsT.value='90';t.dispatch('bsT','change',t.nodes.bsT);assert.equal(t.nodes.bsMinutes.value,'');assert.equal(t.nodes.bsMinutes.attrs['aria-invalid'],'false');t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2),null);t.nodes.bsGo.onclick();assert.equal(t.get(0,1,2).m,90);
});
test('custom bulk overwrite retains previous values for one combined Undo',()=>{
 const t=setup();t.S.bsOnly=false;t.nodes.bsMinutes.value='75分';t.nodes.bsGo.onclick();t.nodes.bsGo.onclick();assert.equal(t.get(0,0,2).m,75);assert.equal(t.get(0,0,1).m,45);assert.equal(t.undoStack.length,1);t.undo();assert.equal(t.get(0,0,2).m,30);assert.equal(t.get(0,1,2),null);assert.equal(t.S.month.yt.f0_o0,2000);
});
test('production delegated button event reaches safe minute action with exact context and Undo',()=>{
 const t=setup(),f=t.field('f0_o0','30'),b=button(t,{dmadjust:'15'});const form={querySelector:()=>f};b.closest=s=>s==='.dmform'?form:s==='button'?b:null;t.focus(f);t.dispatch('dayList','click',b);assert.equal(t.get(0,0,2).m,45);assert.equal(t.undoStack.length,1);assert.equal(t.get(0,0,1).m,45);
});
test('live metadata refresh updates monthly pair totals without replacing a focused input',()=>{
 const t=setup(),f=t.nodes.dayList.children[0];t.focus(f);const count=t.renderCount();f.value='1:15';t.dispatch('dayList','input',f);assert.equal(t.focused(),f);assert.equal(t.renderCount(),count);assert.match(t.nodes['preview-f0_o0-.pmeta'].innerHTML,/2\/3日・2:00\/5:00/);assert.match(t.nodes.famDay.innerHTML,/よし 1:15/);assert.match(t.nodes.dayStart.textContent,/残り3組/);
});
test('focused autosave refreshes remaining-label and hides empty-pair removal until its record is cleared',()=>{
 const t=setup();t.S.dpk='f0_o1';t.render();assert.match(t.nodes.dayList.innerHTML,/data-dmremove/);const f=t.nodes.dayList.children[0],next=button(t,{},['data-dmnext']),remove=button(t,{},['data-dmremove']);next.textContent='次の未入力へ（3組）';f.form={querySelector:s=>s==='[data-dmnext]'?next:s==='[data-dmremove]'?remove:null};t.focus(f);const count=t.renderCount();f.value='75';t.dispatch('dayList','input',f);assert.equal(t.renderCount(),count);assert.equal(t.focused(),f);assert.equal(f.value,'75');assert.match(t.nodes.daySum.innerHTML,/この日：<b>2<\/b>\/4組/);assert.equal(next.textContent,'次の未入力へ（2組）');assert.equal(remove.hidden,true);t.flush();assert.equal(t.read('pk:months/2026-10').records.f0_o1[2],75);
 f.value='';t.sync(f,true);assert.equal(t.focused(),f);assert.equal(next.textContent,'次の未入力へ（3組）');assert.equal(remove.hidden,false);assert.match(t.nodes.daySum.innerHTML,/この日：<b>1<\/b>\/4組/);assert.equal(t.get(0,1,2),null);f.value='0';t.dispatch('dayList','input',f);assert.deepEqual(plain(t.get(0,1,2)),{c:1,m:0});assert.equal(next.textContent,'次の未入力へ（2組）');assert.equal(remove.hidden,true);assert.equal(t.renderCount(),count);assert.equal(t.focused(),f);
});
test('empty added pair removal persists exact remainder and Undo restores pair and selected context',()=>{
 const t=setup();t.S.dpk='f0_o1';assert.equal(t.extraOnly('f0_o1'),true);assert.equal(t.removeExtra('f0_o1'),true);assert.equal(t.S.extra.includes('f0_o1'),false);assert.equal(t.extraKeys('2026-10',t.read('pk:pref')).includes('f0_o1'),false);assert.equal(t.get(0,1,2),null);assert.equal(t.undoStack.length,1);t.undo();assert.equal(t.S.extra.includes('f0_o1'),true);assert.equal(t.S.dpk,'f0_o1');assert.equal(t.extraKeys('2026-10',t.read('pk:pref')).includes('f0_o1'),true);assert.equal(t.get(0,0,2).m,30);
});
for(const used of ['records','yell','yt','box','ryell','notes','ylog','rylog','pins','prevKeys'])test(`empty pair removal protects a pair used by ${used}`,()=>{
 const t=setup(),k='f0_o1';if(['pins','prevKeys'].includes(used))t.S[used].push(k);else{t.S.month[used]||={};t.S.month[used][k]=used==='notes'?'大事なメモ':used==='records'?{1:{c:1,m:0}}:['box','ylog','rylog'].includes(used)?{1:0}:0}const before=plain(t.S.extra);assert.equal(t.extraOnly(k),false);assert.equal(t.removeExtra(k),false);assert.deepEqual(plain(t.S.extra),before);assert.equal(t.undoStack.length,0);
});
console.log(`All ${passed} daily usability scenarios passed.`);
