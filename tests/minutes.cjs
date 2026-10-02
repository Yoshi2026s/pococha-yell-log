const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const file=process.argv[2]||path.join(__dirname,'../index.html');
const html=fs.readFileSync(file,'utf8');
function take(start,end){const i=html.indexOf(start),j=html.indexOf(end,i);assert(i>=0&&j>i,'missing '+start);return html.slice(i,j)}
function boot(){
 const nodes={},events={},map=new Map(),timers=new Map(),metrics={renders:0,toasts:[]};let timerSeq=0;
 let document;
 function node(id,attrs={}){
  const classes=new Set(),n={id,tagName:'DIV',type:'',value:'',hidden:false,disabled:false,dataset:{},attributes:{},listeners:{},children:[],className:'',textContent:'',lastElementChild:{textContent:''},style:{values:{},setProperty(k,v){this.values[k]=v}},
   classList:{toggle(c,on){if(on===undefined)on=!classes.has(c);if(on)classes.add(c);else classes.delete(c);return on},add(c){classes.add(c)},remove(c){classes.delete(c)},contains(c){return classes.has(c)}},
   setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},
   addEventListener(k,fn){(this.listeners[k]||=[]).push(fn)},
   dispatch(k,event={}){event.target||=this;for(const f of this.listeners[k]||[])f(event)},
   contains(a){return this.children.includes(a)},
   closest(s){if(s==='#'+this.id)return this;if(s==='button[data-a]'&&this.tagName==='BUTTON'&&this.dataset.a!==undefined)return this;return null},
   focus(){document.activeElement=this;nodes.qpanel.dispatch('focusin',{target:this});for(const f of events.focusin||[])f({target:this})},
   blur(){if(document.activeElement!==this)return;document.activeElement=null;nodes.qpanel.dispatch('focusout',{target:this});for(const f of events.focusout||[])f({target:this})}
  };
  Object.assign(n,attrs);
  let inner='';Object.defineProperty(n,'innerHTML',{get(){return inner},set(text){inner=text;if(id!=='qpanel')return;metrics.renders++;n.children=[];
   for(const match of text.matchAll(/<(input|select|button|p)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){
    const child=node(match[3],{tagName:match[1].toUpperCase()});
    for(const a of match[2].matchAll(/([\w-]+)="([^"]*)"/g)){child.attributes[a[1]]=a[2];if(a[1]==='value')child.value=a[2];if(a[1]==='type')child.type=a[2];if(a[1].startsWith('data-'))child.dataset[a[1].slice(5)]=a[2]}
    child.hidden=/\bhidden\b/.test(match[2]);nodes[child.id]=child;n.children.push(child);
   }
  }});return n;
 }
 const $=id=>nodes[id]||=(node(id));
 document={activeElement:null,body:{classList:node('body').classList},addEventListener(k,fn){(events[k]||=[]).push(fn)}};
 const window={innerHeight:800,visualViewport:{height:400,offsetTop:0,events:{},addEventListener(k,fn){this.events[k]=fn}},addEventListener(){}};
 const localStorage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const context=vm.createContext({console,document,window,$,localStorage,navigator:{onLine:true},JSON,Date,Math,Number,String,Object,Array,Map,Set,Promise,
  setTimeout(fn,ms){const id=++timerSeq;timers.set(id,{fn,ms});return id},clearTimeout(id){timers.delete(id)},clearInterval(){},
  __metrics:metrics});
 let code=`const N=50,YMAX=99999999;const pad=n=>String(n).padStart(2,'0');const clock=m=>Math.floor(m/60)+':'+pad(m%60);
 const WD=['日','月','火','水','木','金','土'];const pk=(f,o)=>'f'+f+'_o'+o;const vIdx=n=>Number.isInteger(n)&&n>=0&&n<N;
 const parsePk=k=>{const m=/^f(\\d+)_o(\\d+)$/.exec(k);return m&&vIdx(+m[1])&&vIdx(+m[2])?[+m[1],+m[2]]:null};
 const ymParts=ym=>({y:Number(ym.slice(0,4)),m:Number(ym.slice(5)),days:31});const curYM=()=> '2026-10';const schNorm=v=>v;const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('"','&quot;');
 const PF=x=>x,PO=x=>x,famName=f=>'自分'+f,othName=o=>'他人'+o;const dayGuide=()=>null,addBtns=()=>'',boxHtml=()=>'',savePref=()=>{};
 const S={ym:'2026-10',month:{records:{}},mLoaded:true,compact:true,tab:'rec',sel:2,dday:2,fam:0,oth:0,dpk:'f0_o0',panelMin:false,recent:[],swiped:false};
 let db=null,dl=null,fcCache=null;const inflight={},mExists={};
 const isAch=()=>false,isNear=()=>false,celebrate=()=>{},hideToast=()=>{},showToast=(v)=>__metrics.toasts.push(v),rerender=()=>renderPanel();`;
 code+=take('const ls={','const pref=');
 code+=take('function packMonth(mo){','/* ---------- 保存');
 code+=take('const pend={};','/* ---------- データ読込');
 code+=take('function getE(f,o,d){','function celebrate(){');
 code+=take("let TOPTS='';",'function renderRecent(){');
 code+='let lpFired=false;';
 code+=take("$('qpanel').addEventListener('click',ev=>{",'// 3: +ボタン長押し');
 code+=take("$('qpanel').addEventListener('change',ev=>{",'// パネルを左右スワイプ');
 code+=take('const isTextField=','// 入力パネルの高さを');
 code+=`globalThis.api={S,renderPanel,applyQMinutes,parseQMinutes,packMonth,unpackMonth,flush,doUndo,getE,edit,pend,qMinuteKey,get draft(){return qMinuteDraft},undoCount:()=>undoStack.length};renderPanel();`;
 new vm.Script(code,{filename:file}).runInContext(context);
 return {api:context.api,nodes,document,metrics,map,window,timers,input(value){const f=nodes.qMinutes;f.value=value;f.dispatch('input');nodes.qpanel.dispatch('input',{target:f});return f},apply(){nodes.qpanel.dispatch('click',{target:nodes.qMinutesApply})},enter(composing=false){let prevented=false;nodes.qpanel.dispatch('keydown',{target:nodes.qMinutes,key:'Enter',isComposing:composing,preventDefault(){prevented=true}});return prevented}};
}
let passed=0;function test(name,fn){fn();passed++;console.log('PASS:',name)}
test('17 minutes uses existing edit, saves, survives reload and undo',()=>{
 const t=boot();t.input('17');t.apply();assert.equal(t.api.getE(0,0,2).m,17);assert.equal(t.api.undoCount(),1);assert.equal(t.nodes.qsel.value,'17');assert.match(t.nodes.qpanel.innerHTML,/<option value="17">0:17<\/option>/);
 t.api.flush();assert.equal(JSON.parse(t.map.get('pk:months/2026-10')).records.f0_o0[2],17);
 t.api.S.month=t.api.unpackMonth(JSON.parse(t.map.get('pk:months/2026-10')));assert.equal(t.api.getE(0,0,2).m,17);
 t.api.doUndo();assert.equal(t.api.getE(0,0,2),null);
});
test('0 and 1440 boundaries; zero creates a recorded day and undo removes it',()=>{
 const t=boot();t.input('0');assert.equal(t.enter(),true);assert.equal(t.api.getE(0,0,2).m,0);assert.equal(t.api.undoCount(),1);t.api.doUndo();assert.equal(t.api.getE(0,0,2),null);
 t.input('1440');t.enter();assert.equal(t.api.getE(0,0,2).m,1440);t.api.flush();assert.equal(JSON.parse(t.map.get('pk:months/2026-10')).records.f0_o0[2],1440);
});
test('empty, negative, fractional, exponent, text, nonfinite and out-of-range input rejected',()=>{
 for(const value of ['', '  ', '-1','-0','1.5','1.0','1e3','NaN','Infinity','oops','1441','9999999999999999999999999999']){
  const t=boot();t.input(value);t.apply();assert.equal(t.api.getE(0,0,2),null,value);assert.equal(t.api.undoCount(),0,value);assert.equal(Object.keys(t.api.pend).length,0,value);assert.equal(t.nodes.qMinutesError.hidden,false,value);assert.equal(t.nodes.qMinutes.getAttribute('aria-invalid'),'true',value);
  t.input('19');assert.equal(t.nodes.qMinutesError.hidden,true);t.apply();assert.equal(t.api.getE(0,0,2).m,19);
 }
});
test('typing and blur do not save; same-target redraw preserves draft and focused field',()=>{
 const t=boot(),f=t.input('27');f.focus();const renders=t.metrics.renders;t.api.renderPanel();assert.equal(t.metrics.renders,renders);assert.equal(t.nodes.qMinutes,f);assert.equal(t.document.activeElement,f);assert.equal(t.api.getE(0,0,2),null);
 f.blur();assert.equal(t.api.getE(0,0,2),null);t.api.renderPanel();assert.equal(t.nodes.qMinutes.value,'27');assert.equal(Object.keys(t.api.pend).length,0);
});
test('invalid error survives redraw; same-value Apply never adds undo',()=>{
 const t=boot();t.input('-7');t.apply();t.nodes.qMinutes.blur();t.api.renderPanel();assert.equal(t.nodes.qMinutes.value,'-7');assert.equal(t.api.draft.error.includes('整数'),true);
 t.input('34');t.apply();const count=t.api.undoCount();t.input('34');t.apply();assert.equal(t.api.undoCount(),count);assert.equal(t.api.draft,null);
});
test('day, month and pair changes reset the draft; stale context cannot write',()=>{
 for(const change of [s=>s.sel=3,s=>s.ym='2026-11',s=>s.fam=1,s=>s.oth=1]){
  const t=boot(),old=t.input('57');change(t.api.S);t.api.applyQMinutes();assert.equal(t.api.undoCount(),0);assert.equal(Object.keys(t.api.S.month.records).length,0);
  t.api.renderPanel();assert.equal(t.nodes.qMinutes.value,'0');assert.notEqual(t.nodes.qMinutes.dataset.qctx,old.dataset.qctx);
 }
});
test('day tab binding targets selected pair and day; leaving panel clears draft',()=>{
 const t=boot();t.api.S.tab='day';t.api.S.dpk='f2_o3';t.api.S.dday=5;t.api.renderPanel();t.input('23');t.apply();assert.equal(t.api.getE(2,3,5).m,23);assert.equal(t.api.getE(0,0,2),null);
 t.input('89');t.api.S.tab='sum';t.api.renderPanel();assert.equal(t.api.draft,null);assert.equal(t.nodes.qpanel.hidden,true);
 t.api.S.tab='day';t.api.renderPanel();assert.equal(t.nodes.qMinutes.value,'23');
});
test('IME composition Enter does not commit; completed Enter does',()=>{
 const t=boot();t.input('29');assert.equal(t.enter(true),false);assert.equal(t.api.getE(0,0,2),null);assert.equal(t.enter(false),true);assert.equal(t.api.getE(0,0,2).m,29);
});
test('other time controls discard dirty buffer and preserve normal undo',()=>{
 const t=boot();t.input('17');t.apply();t.input('55');const button={disabled:false,dataset:{a:'5'},tagName:'BUTTON',closest(s){if(s==='button[data-a]')return this;return null}};t.nodes.qpanel.dispatch('click',{target:button});assert.equal(t.api.getE(0,0,2).m,22);assert.equal(t.nodes.qMinutes.value,'22');t.api.doUndo();assert.equal(t.api.getE(0,0,2).m,17);
 t.input('999');t.nodes.qsel.value='30';t.nodes.qpanel.dispatch('change',{target:t.nodes.qsel});assert.equal(t.api.getE(0,0,2).m,30);assert.equal(t.nodes.qMinutes.value,'30');
});
test('number semantics and keyboard exception keep panel reachable',()=>{
 const t=boot(),f=t.nodes.qMinutes;assert.equal(f.type,'number');for(const [k,v]of Object.entries({min:'0',max:'1440',step:'1',inputmode:'numeric'}))assert.equal(f.getAttribute(k),v);
 assert.match(t.nodes.qpanel.innerHTML,/<label for="qMinutes">分数を直接入力<\/label>/);assert.match(html,/body\.kb \.qpanel\.manualFocus\{display:flex!important;bottom:calc\(var\(--qkeyboard,0px\) \+ 8px\)\}/);
 f.focus();assert.equal(t.nodes.qpanel.classList.contains('manualFocus'),true);assert.equal(t.document.body.classList.contains('kb'),true);assert.equal(t.nodes.qpanel.style.values['--qkeyboard'],'400px');
 t.window.visualViewport.height=500;t.window.visualViewport.events.resize();assert.equal(t.nodes.qpanel.style.values['--qkeyboard'],'300px');t.input('31');t.apply();assert.equal(t.nodes.qpanel.classList.contains('manualFocus'),false);
});
console.log(`${passed} minute-input scenarios passed.`);
