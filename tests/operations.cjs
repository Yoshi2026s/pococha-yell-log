const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

// Exercise production functions extracted from the requested HTML, with a small
// deterministic DOM/storage boundary. No browser data is modified by this suite.
const target = process.argv.find(v => v.endsWith('.html')) || path.resolve(__dirname, '../index.html');
const src = fs.readFileSync(target, 'utf8');
function take(start, end) {
  const a = src.indexOf(start), b = src.indexOf(end, a);
  assert(a >= 0 && b > a, `Missing source boundaries: ${start}`);
  return src.slice(a, b);
}
const common = `
const N=50;
const vIdx=v=>Number.isInteger(v)&&v>=0&&v<N;
const pad = v => String(v).padStart(2, '0');
const pk = (f,o) => 'f'+f+'_o'+o;
const parsePk = k => { const m=/^f(\\d+)_o(\\d+)$/.exec(k); return m&&vIdx(+m[1])&&vIdx(+m[2])?[+m[1],+m[2]]:null; };
const hm = m => m>=60?Math.floor(m/60)+'時間'+(m%60?m%60+'分':''):m+'分';
const clock = m => Math.floor(m/60)+':'+pad(m%60);
const PF = i => i, PO = i => i;
const famName = i => S.lists.family[i], othName = i => S.lists.others[i];
const isAch = () => false;
` + take('const esc=s=>', 'function ymParts(ym){')
  + take('function ymParts(ym){', 'function defaultDay(){')
  + take('function pairStats(rec,o){', 'const BADKEY=')
  + take('const dayKana=t=>', '// その日に入れると月末まで');

function nodesFactory() {
  const nodes = {};
  const $ = id => nodes[id] ||= {
    value: '', dataset: {}, textContent: '', innerHTML: '', hidden: false,
    handlers:{}, style: {setProperty(){}},
    classList:{add(){},remove(){},toggle(){}},
    addEventListener(type,fn){this.handlers[type]=fn;},
    querySelectorAll(){return [];}
  };
  return {nodes, $};
}

function bulkFixture() {
  const {nodes,$} = nodesFactory(), writes=[], records=new Map(), timers=[];
  const S={mLoaded:true,ym:'2026-10',dday:2,dayKeys:['f0_o0'],bsOnly:true,dayFam:'all',dayOth:'all',dayQ:'',dayView:'all'};
  const timerClock={now:1700000000000};
  class TestDate extends Date {static now(){return timerClock.now;}}
  const key=(f,o,d)=>`${S.ym}:${f}:${o}:${d}`;
  const c=vm.createContext({console,$,S,Date:TestDate,setTimeout:fn=>{timers.push(fn);return timers.length;},savePref(){},pushUndo(){},showToast(){},renderDay(){},
    getE:(f,o,d)=>records.get(key(f,o,d))||null,
    putE:(f,o,d,e)=>{writes.push({ym:S.ym,f,o,d,e});records.set(key(f,o,d),e);}
  });
  vm.runInContext(common+`const TOPTS='';`+take("$('bsT').innerHTML=TOPTS;",'// 機能6：バックアップのお知らせ')
    +take("$('bsOnly').addEventListener('change'", "$('bsChk').onclick"),c);
  return {S,nodes,writes,records,timers,timerClock,click:()=>nodes.bsGo.onclick(),key};
}

function trendFixture(getMonth) {
  const {nodes,$}=nodesFactory();
  const S={ym:'2026-10',month:{records:{}},lists:{family:['ハナ','ユウ'],others:['ユキ','アオイ']},sumFam:'all',sumOth:'all',sumQ:'',sumSort:'num',sumNotAch:false,mLoaded:true};
  const c=vm.createContext({console,$,S,getMonth});
  vm.runInContext(common+'let trendSeq=0;'+take('async function renderTrend(){','/* ---------- バックアップ'),c);
  return {S,nodes,render:()=>vm.runInContext('renderTrend()',c)};
}

let passed=0;
const pass = label => {passed++;console.log('PASS '+label);};
async function run() {
  for(const name of ['constructor','toString','__proto__']) {
    const {nodes,$} = nodesFactory();
    const S={lists:{family:[name,name],others:[]}};
    const c=vm.createContext({console,$,S,isDefName:()=>false});
    vm.runInContext(common+take('const nkey=v=>', "document.addEventListener('input',ev=>{const t=ev.target; if(t.dataset&&t.dataset.k&&S.lists[t.dataset.k]) updDup()});"),c);
    vm.runInContext('updDup()',c);
    assert.match(nodes['dup-family'].innerHTML,/同じ名前が1組/);
    assert(nodes['dup-family'].innerHTML.includes(name));
    pass(`special account name ${name} is accepted and duplicate detection works`);
  }
  {
    const {nodes,$}=nodesFactory();
    const name='<img src=x onerror="alert(1)"> &';
    const S={lists:{family:[name,name],others:[]}};
    const c=vm.createContext({console,$,S,isDefName:()=>false});
    vm.runInContext(common+take('const nkey=v=>', "document.addEventListener('input',ev=>{const t=ev.target; if(t.dataset&&t.dataset.k&&S.lists[t.dataset.k]) updDup()});"),c);
    vm.runInContext('updDup()',c);
    assert.doesNotMatch(nodes['dup-family'].innerHTML,/<img/);
    assert(nodes['dup-family'].innerHTML.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp;'));
    pass('HTML characters in account names stay escaped in duplicate messages');
  }
  {
    const t=bulkFixture();t.click();assert.equal(t.writes.length,0);t.click();assert.equal(t.writes.length,1);
    assert.deepEqual(JSON.parse(JSON.stringify(t.writes[0])),{ym:'2026-10',f:0,o:0,d:2,e:{c:1,m:60}});
    pass('unchanged bulk scope writes exactly after the second click');
  }
  const changes=[
    ['day',t=>{t.S.dday=3;}],
    ['month',t=>{t.S.ym='2026-11';}],
    ['account keys',t=>{t.S.dayKeys=['f1_o1'];}],
    ['time',t=>{t.nodes.bsT.value='120';}],
    ['only-unentered setting',t=>{t.S.bsOnly=false;}],
    ['search query',t=>{t.S.dayQ='ゆき';}],
    ['self-account filter',t=>{t.S.dayFam='0';}],
    ['other-account filter',t=>{t.S.dayOth='0';}],
    ['display status',t=>{t.S.dayView='todo';}],
    ['visible account scope',t=>{t.S.dayKeys=['f0_o0','f0_o1'];}],
  ];
  for(const [label,change] of changes) {
    const t=bulkFixture();t.click();change(t);t.click();
    assert.equal(t.writes.length,0,`${label} changes require a fresh confirmation`);
    t.click();assert.equal(t.writes.length,t.S.dayKeys.length);
    assert(t.writes.every(w=>w.ym===t.S.ym&&w.d===t.S.dday&&w.e.m===+t.nodes.bsT.value));
    pass(`bulk confirmation is renewed after changing ${label}`);
  }
  {
    const t=bulkFixture();t.S.dayKeys=['f0_o0','f0_o1'];t.click();
    t.records.set(t.key(0,1,2),{c:1,m:60});t.click();assert.equal(t.writes.length,0);
    t.click();assert.equal(t.writes.length,1);assert.equal(t.writes[0].o,0);
    pass('external record changes that alter actionable keys require reconfirmation');
  }
  {
    const t=bulkFixture();t.click();t.timerClock.now+=4001;t.click();assert.equal(t.writes.length,0);
    t.click();assert.equal(t.writes.length,1);
    pass('expired bulk confirmation cannot commit');
  }
  for(const input of ['bsT','bsOnly']) {
    const t=bulkFixture();t.click();
    if(input==='bsT'){t.nodes.bsT.value='120';t.nodes.bsT.handlers.change({target:t.nodes.bsT});}
    else{t.nodes.bsOnly.checked=false;t.nodes.bsOnly.handlers.change({target:t.nodes.bsOnly});}
    t.click();assert.equal(t.writes.length,0);t.click();assert.equal(t.writes.length,1);
    pass(`native ${input} change event resets the armed confirmation`);
  }
  {
    const {nodes,$}=nodesFactory();
    const S={ym:'2026-10',month:{records:{}},lists:{family:['ハナ'],others:['ユキ']},sumFam:'all',sumOth:'all',sumQ:'',sumSort:'num',sumNotAch:false,mLoaded:true};
    let trendCalls=0;
    const c=vm.createContext({console,$,S,renderSumFilt(){},renderFcCard(){},renderYellCheck(){},renderPatSum(){},renderYgAll(){},fillSelect(){},yellOf(){return null},ryellOf(){return null},renderSumDelta(){},renderDayChart(){},renderTrend(){trendCalls++;}});
    vm.runInContext(common+take('function renderSum(){','function renderLists(){'),c);vm.runInContext('renderSum()',c);
    assert.equal(trendCalls,1);
    pass('aggregate panel renders trend even when the current month is empty');
  }
  const month={records:{f0_o0:{1:{c:1,m:60}},f0_o1:{1:{c:1,m:180}},f1_o0:{1:{c:1,m:120}},f1_o1:{1:{c:1,m:300}}}};
  for(const [label,filters,expected] of [
    ['all accounts',{},'11時間'],
    ['self account',{sumFam:'0'},'4時間'],
    ['other account',{sumOth:'0'},'3時間'],
    ['hiragana search matches katakana names',{sumQ:'ゆき'},'3時間'],
    ['self account name search',{sumQ:'ゆう'},'7時間'],
    ['combined filters',{sumFam:'0',sumOth:'0',sumQ:'ゆき'},'1時間'],
    ['unmatched search',{sumQ:'存在しない'},'0分'],
  ]) {
    const t=trendFixture(async()=>month);Object.assign(t.S,filters);await t.render();
    const cells=[...t.nodes.tTrend.innerHTML.matchAll(/<td class="r">([^<]+)<\/td>/g)].map(m=>m[1]);
    assert.equal(cells.filter(v=>v===expected).length,6,t.nodes.tTrend.innerHTML);
    pass(`six-month trend respects ${label}`);
  }
  {
    let resolveOld, reads=0;
    const old=new Promise(r=>resolveOld=r);
    const fresh={records:{f0_o0:{1:{c:1,m:60}}}};
    const t=trendFixture(()=>++reads<=6?old:Promise.resolve(fresh));
    const previous=t.render();const latest=t.render();await latest;
    const latestHTML=t.nodes.tTrend.innerHTML;
    assert.match(latestHTML,/>1時間<\/td>/);
    resolveOld(month);await previous;
    assert.equal(t.nodes.tTrend.innerHTML,latestHTML,'Older async result must not overwrite the latest trend');
    pass('older asynchronous trend calculations are ignored by sequence guard');
  }
  console.log(`All ${passed} operations regression scenarios passed.`);
}
run().catch(e=>{console.error(e);process.exitCode=1;});
