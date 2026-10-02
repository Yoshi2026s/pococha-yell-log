const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const file=process.argv[2]||path.join(__dirname,'../index.html');
const html=fs.readFileSync(file,'utf8');
function take(start,end){
  const i=html.indexOf(start),j=html.indexOf(end,i);
  assert(i>=0&&j>i,'Missing source boundary: '+start);
  return html.slice(i,j);
}

// Execute the production preference initializer, renderer, and delegated handlers.
// The DOM shim records focus and persistence without touching a user's browser data.
function fixture(pref={},width=1024){
  const nodes={},stored=new Map(),metrics={saved:0,rec:0,day:0,edit:0,dayCommits:0,focused:[]};
  const classes=()=>{
    const values=new Set();
    return {add:c=>values.add(c),remove:c=>values.delete(c),contains:c=>values.has(c),
      toggle(c,on){if(on===undefined)on=!values.has(c);if(on)values.add(c);else values.delete(c);return on}};
  };
  function node(id){
    return {id,innerHTML:'',hidden:false,value:'',disabled:false,dataset:{},classList:classes(),
      style:{setProperty(){}},listeners:{},contains(){return false},
      addEventListener(type,fn){(this.listeners[type]||=[]).push(fn)},
      querySelector(){return null},setAttribute(){},
      focus(){metrics.focused.push(id)},scrollIntoView(){},
      dispatch(type,target,key){
        let prevented=0;
        const event={target,key,preventDefault(){prevented++}};
        for(const fn of this.listeners[type]||[])fn(event);
        return prevented;
      }};
  }
  const $=id=>nodes[id]||=(node(id));
  const document={activeElement:null,body:{classList:classes()},querySelector(){return null}};
  const context=vm.createContext({console,pref,window:{innerWidth:width},document,$,
    N:50,DEF_D:3,DEF_M:210,DEF_T:'2k',TABS:['rec','day','sum','list'],
    defNames:p=>Array.from({length:50},(_,i)=>p+(i+1)),curYM:()=> '2026-10',
    vIdx:n=>Number.isInteger(n)&&n>=0&&n<50,parsePk0:()=>null,
    ls:{get:k=>stored.get(k),set(k,v){stored.set(k,JSON.parse(JSON.stringify(v)));metrics.saved++}},
    pk:(f,o)=>`f${f}_o${o}`,parsePk:k=>{const m=/^f(\d+)_o(\d+)$/.exec(k);return m?[+m[1],+m[2]]:null},
    ymParts:ym=>{const[y,m]=ym.split('-').map(Number);return {y,m,days:new Date(y,m,0).getDate()}},
    WD:['日','月','火','水','木','金','土'],clock:m=>Math.floor(m/60)+':'+String(m%60).padStart(2,'0'),
    PF:i=>i,PO:i=>i,pad:n=>String(n).padStart(2,'0'),esc:String,
    famName:f=>`自分垢${f+1}`,othName:o=>`他人垢${o+1}`,
    dayGuide:()=>null,addBtns:()=>'',boxHtml:()=>'',syncQMinutesKeyboard(){},
    renderRec(){metrics.rec++;vm.runInContext('renderPanel()',context)},
    renderDay(){metrics.day++;vm.runInContext('renderPanel()',context)},
    edit(){metrics.edit++},toggleBox(){},togglePin(){},shiftPanelDay(){},applyQMinutes(){},
    dayPrepareNavigation(){metrics.dayCommits++;return true;},dayCommitFocused(){metrics.dayCommits++;return true;},queueMonth(){},defaultDay:()=>2,goToday(){},showToast(){}});
  const code=take('const S={','let db=null')
    +take('function dayMonthPrefs(','function dayMinuteHtml(')
    +take('function savePref(){','/* ---------- 操作 ---------- */')
    +`let qMinuteDraft=null;const qMinuteKey=c=>S.ym+':'+c.f+':'+c.o+':'+c.d;let TOPTS='<option value="0">0:00</option>';`
    +take('function panelCtx(){','// 任意分入力は')
    +take('function renderPanel(){','function renderRecent(){')
    +take("$('days').addEventListener('click',ev=>{",'let lpFired=false')
    +`let lpFired=false;`
    +take("$('qpanel').addEventListener('click',ev=>{",'// 3: +ボタン長押し')
    +take("$('addPair').onclick=()=>{","document.addEventListener('change',ev=>{")
    +`$('addFam');$('addOth');$('dayQ');`
    +`S.mLoaded=true;S.month={records:{}};S.sel=2;S.dday=2;globalThis.api={S,renderPanel,savePref};renderPanel();`;
  new vm.Script(code,{filename:file}).runInContext(context);
  function target(matches,dataset={}){
    const t={dataset,disabled:false,closest(selector){return matches.includes(selector)?t:null}};
    return t;
  }
  const row=(kind,dataset)=>target(kind==='rec'?['.day.crow']:['.prow','.prow.crow'],dataset);
  return {api:context.api,nodes,metrics,stored,target,row};
}

let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name)}

test('new users start with a compact panel on desktop and phone',()=>{
  for(const width of [375,1024]){
    const t=fixture({},width);
    assert.equal(t.api.S.panelMin,true);assert.equal(t.nodes.qpanel.hidden,false);
    assert.match(t.nodes.qpanel.innerHTML,/id="qExpand"/);
    assert.doesNotMatch(t.nodes.qpanel.innerHTML,/id="qMinutes"/);
    assert.match(t.nodes.qpanel.innerHTML,/自分垢1.*他人垢1/);
    assert.equal(t.metrics.saved,0);
  }
});
test('saved boolean preferences are respected, including explicit expanded mode',()=>{
  for(const value of [false,true])for(const width of [375,1024]){
    const t=fixture({panelMin:value},width);assert.equal(t.api.S.panelMin,value);
    assert.equal(t.nodes.qpanel.innerHTML.includes('id="qExpand"'),value);
    assert.equal(t.nodes.qpanel.innerHTML.includes('id="qMinutes"'),!value);
  }
});
test('missing or invalid legacy preferences safely start compact',()=>{
  for(const value of [undefined,null,0,1,'false','true',[],{}]){
    const t=fixture({panelMin:value});assert.equal(t.api.S.panelMin,true,String(value));
  }
});
test('monthly row selection expands editing at the selected day without changing records',()=>{
  const t=fixture();t.api.S.month.records={f0_o0:{2:{m:17}}};
  const before=JSON.stringify(t.api.S.month.records),saves=t.metrics.saved;
  t.nodes.days.dispatch('click',t.row('rec',{d:'7'}));
  assert.equal(t.api.S.sel,7);assert.equal(t.api.S.panelMin,false);assert.equal(t.metrics.rec,1);
  assert.match(t.nodes.qpanel.innerHTML,/10月7日/);assert.match(t.nodes.qpanel.innerHTML,/id="qMinutes"/);
  assert.equal(JSON.stringify(t.api.S.month.records),before);assert.equal(t.metrics.edit,0);
  assert.equal(t.metrics.saved,saves,'Selecting a row must not save a preference implicitly');
});
test('calendar day selection opens its editor',()=>{
  const t=fixture();t.nodes.days.dispatch('click',t.target(['.cc[data-cd]'],{cd:'9'}));
  assert.equal(t.api.S.sel,9);assert.equal(t.api.S.panelMin,false);assert.equal(t.metrics.rec,1);
  assert.match(t.nodes.qpanel.innerHTML,/10月9日/);
});
test('monthly row Enter and Space open editing while other keys leave it compact',()=>{
  for(const key of ['Enter',' ']){
    const t=fixture(),row=t.row('rec',{d:'8'});
    assert.equal(t.nodes.days.dispatch('keydown',row,key),1);
    assert.equal(t.api.S.sel,8);assert.equal(t.api.S.panelMin,false);
  }
  const t=fixture();assert.equal(t.nodes.days.dispatch('keydown',t.row('rec',{d:'8'}),'ArrowRight'),0);
  assert.equal(t.api.S.panelMin,true);assert.equal(t.api.S.sel,2);
});
test('daily row selection opens the correct pair and preserves the selected date',()=>{
  const t=fixture();t.api.S.tab='day';t.api.S.dayPanel=true;t.api.S.dday=12;t.api.S.dpk='f0_o0';t.api.renderPanel();
  t.nodes.dayList.dispatch('click',t.row('day',{f:'2',o:'3'}));
  assert.equal(t.api.S.dpk,'f2_o3');assert.equal(t.api.S.dday,12);assert.equal(t.api.S.panelMin,false);
  assert.match(t.nodes.qpanel.innerHTML,/自分垢3.*他人垢4/);assert.match(t.nodes.qpanel.innerHTML,/10月12日/);
  assert.equal(t.metrics.edit,0);assert.equal(t.metrics.saved,0);
});
test('daily inline input starts without a duplicate fixed panel and can explicitly show the legacy panel',()=>{
  const t=fixture();t.api.S.tab='day';t.api.S.dpk='f0_o0';t.api.renderPanel();
  assert.equal(t.api.S.dayPanel,false);assert.equal(t.nodes.qpanel.hidden,true);
  t.api.S.dayPanel=true;t.api.renderPanel();assert.equal(t.nodes.qpanel.hidden,false);
  assert.match(t.nodes.qpanel.innerHTML,/id="qExpand"/);assert.equal(t.metrics.edit,0);
});
test('daily row Enter and Space expand editing without intercepting nested input',()=>{
  for(const key of ['Enter',' ']){
    const t=fixture();t.api.S.tab='day';t.api.S.dayPanel=true;
    assert.equal(t.nodes.dayList.dispatch('keydown',t.row('day',{f:'4',o:'5'}),key),1);
    assert.equal(t.api.S.dpk,'f4_o5');assert.equal(t.api.S.panelMin,false);
  }
  const t=fixture();t.api.S.tab='day';const row=t.row('day',{f:'4',o:'5'});
  const nested={closest:s=>s==='.prow.crow'?row:null};
  assert.equal(t.nodes.dayList.dispatch('keydown',nested,'Enter'),0);assert.equal(t.api.S.panelMin,true);
});
test('adding a daily pair selects and opens it, clears hiding filters and preserves records and date',()=>{
  const t=fixture();t.api.S.tab='day';t.api.S.dayPanel=true;t.api.S.dday=12;t.api.S.dpk='f0_o0';
  t.api.S.month.records={f0_o0:{12:{c:1,m:17}}};const before=JSON.stringify(t.api.S.month.records);
  t.api.S.dayFam='4';t.api.S.dayOth='5';t.api.S.dayView='todo';t.api.S.dayQ='検索外';t.api.S.dayHideAch=true;t.api.S.dayFold=[2,4];
  t.nodes.addFam.value='2';t.nodes.addOth.value='3';t.nodes.addPair.onclick();
  assert.equal(t.api.S.dpk,'f2_o3');assert.equal(t.api.S.panelMin,false);assert.equal(t.api.S.dday,12);
  assert(t.api.S.extra.includes('f2_o3'));assert.equal(t.api.S.dayFam,'all');assert.equal(t.api.S.dayOth,'all');
  assert.equal(t.api.S.dayView,'all');assert.equal(t.api.S.dayQ,'');assert.equal(t.nodes.dayQ.value,'');assert.equal(t.api.S.dayHideAch,false);
  assert.deepEqual(Array.from(t.api.S.dayFold),[4]);assert.equal(t.metrics.dayCommits,1);assert.equal(t.metrics.edit,0);
  assert.equal(JSON.stringify(t.api.S.month.records),before);assert.match(t.nodes.qpanel.innerHTML,/自分垢3.*他人垢4/);
  assert.equal(t.stored.get('pk:pref').daily.k,'f2_o3');assert.equal(t.stored.get('pk:pref').daily.d,12);
});
test('explicit collapse and expand persist and survive a reload',()=>{
  const t=fixture({panelMin:false});
  t.nodes.qpanel.dispatch('click',t.target(['#qMin']));
  assert.equal(t.api.S.panelMin,true);assert.equal(t.stored.get('pk:pref').panelMin,true);
  assert.match(t.nodes.qpanel.innerHTML,/id="qExpand"/);
  assert.equal(fixture(t.stored.get('pk:pref')).api.S.panelMin,true);
  t.nodes.qpanel.dispatch('click',t.target(['#qExpand']));
  assert.equal(t.api.S.panelMin,false);assert.equal(t.stored.get('pk:pref').panelMin,false);
  assert.match(t.nodes.qpanel.innerHTML,/id="qMinutes"/);
  assert.equal(fixture(t.stored.get('pk:pref')).api.S.panelMin,false);assert.equal(t.metrics.saved,2);
});
test('background rerenders and other tabs do not reopen a collapsed panel',()=>{
  const t=fixture();t.api.renderPanel();assert.equal(t.api.S.panelMin,true);
  t.api.S.tab='sum';t.api.renderPanel();assert.equal(t.nodes.qpanel.hidden,true);
  t.api.S.tab='rec';t.api.renderPanel();assert.equal(t.nodes.qpanel.hidden,false);
  assert.equal(t.api.S.panelMin,true);assert.match(t.nodes.qpanel.innerHTML,/id="qExpand"/);
  assert.equal(t.metrics.saved,0);
});
console.log(`${passed} input-panel regression scenarios passed.`);
