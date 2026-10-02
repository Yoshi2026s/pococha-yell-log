const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const target=process.argv.find(v=>v.endsWith('.html'))||path.resolve(__dirname,'../index.html');
const reproduce=process.argv.includes('--reproduce');
const src=fs.readFileSync(target,'utf8');
const take=(start,end)=>{const a=src.indexOf(start),b=src.indexOf(end,a);assert(a>=0&&b>a,`Missing source boundaries ${start}`);return src.slice(a,b);};

function fixture(){
  const handlers=[],nodes={};
  const S={tab:'day',ym:'2026-10',dday:2,mLoaded:true,dayKeys:['f0_o0'],dpk:'f0_o0'};
  const renders=[],edits=[],focused=[];
  const $=id=>nodes[id]||=( {hidden:true,open:false,
    click(){if(id.startsWith('tab-'))S.tab=id.slice(4);},
    focus(){focused.push(id);},select(){}
  });
  const document={addEventListener(type,fn){assert.equal(type,'keydown');handlers.push(fn);},querySelector(){return null;}};
  const c=vm.createContext({console,S,$,document,TABS:['rec','day','sum','list'],ADDS:[5,10,30,60,120],
    ymParts:()=>({days:31}),parsePk:k=>{const m=/^f(\d+)_o(\d+)$/.exec(k);return m?[+m[1],+m[2]]:null;},
    renderDay:()=>renders.push(S.dday),edit:(...args)=>edits.push(args)
  });
  vm.runInContext(take('// PCのキー操作（日付別実績入力）','/* ---------- 追加の便利機能 ---------- */')
    +take('// キー操作：「/」で検索欄へ・タブで← →','// ブラウザの上の色をテーマに合わせる'),c);
  function dispatch(key,location='body',mods={}){
    let prevented=0;
    const target={closest(selector){
      const selectors=selector.split(',').map(s=>s.trim());
      const match=selectors.some(s=>location==='tab'?s.startsWith('nav.tabs')||s==='button'
        :location==='strip'?s==='.dstrip'
        :location==='calendar'?s==='.mcal'
        :location==='input'?s==='input'
        :false);
      return match?target:null;
    }};
    const ev={key,target,ctrlKey:false,metaKey:false,altKey:false,isComposing:false,preventDefault(){prevented++;},...mods};
    for(const handler of handlers)handler(ev);
    return prevented;
  }
  return {S,renders,edits,focused,nodes,dispatch};
}

let passed=0;
function pass(message){passed++;console.log('PASS '+message);}
function run(){
  if(reproduce){
    const t=fixture();const prevented=t.dispatch('ArrowRight','tab');
    assert.equal(t.S.tab,'sum');assert.equal(t.S.dday,3);assert.equal(t.renders.length,1);assert.equal(prevented,2);
    console.log('REPRO tab ArrowRight changes the selected day from 2 to 3 before switching to aggregate tab');
    return;
  }
  for(const [key,next] of [['ArrowRight','sum'],['ArrowLeft','rec']]){
    const t=fixture();const prevented=t.dispatch(key,'tab');
    assert.equal(t.S.tab,next);assert.equal(t.S.dday,2,'Tab navigation must not change selected day');
    assert.equal(t.renders.length,0,'Tab arrow must not invoke day rendering');assert.equal(prevented,1);
    assert.equal(t.focused.at(-1),'tab-'+next);
    pass(`${key} on the day tab switches and focuses a tab without moving the date`);
  }
  for(const [key,day] of [['ArrowRight',3],['ArrowLeft',1]]){
    const t=fixture();assert.equal(t.dispatch(key),1);assert.equal(t.S.dday,day);assert.equal(t.S.tab,'day');
    assert.equal(t.renders.length,1);
    pass(`${key} in the day panel still moves its selected date`);
  }
  for(const location of ['strip','calendar','input']){
    const t=fixture();assert.equal(t.dispatch('ArrowRight',location),0);assert.equal(t.S.dday,2);assert.equal(t.S.tab,'day');
    pass(`global date shortcuts ignore ${location} controls`);
  }
  for(const mod of ['ctrlKey','metaKey','altKey','isComposing']){
    const t=fixture();assert.equal(t.dispatch('ArrowRight','tab',{[mod]:true}),0);assert.equal(t.S.dday,2);assert.equal(t.S.tab,'day');
    pass(`tab arrows ignore ${mod} keyboard events`);
  }
  for(const [tab,key,next] of [['list','ArrowRight','rec'],['rec','ArrowLeft','list']]){
    const t=fixture();t.S.tab=tab;t.dispatch(key,'tab');assert.equal(t.S.tab,next);assert.equal(t.S.dday,2);
    pass(`tab navigation wraps from ${tab} to ${next}`);
  }
  for(const [start,key] of [[1,'ArrowLeft'],[31,'ArrowRight']]){
    const t=fixture();t.S.dday=start;assert.equal(t.dispatch(key),0);assert.equal(t.S.dday,start);
    pass(`date shortcuts stop at month boundary ${start}`);
  }
  console.log(`All ${passed} keyboard regression scenarios passed.`);
}
try{run();}catch(e){console.error(e);process.exitCode=1;}
