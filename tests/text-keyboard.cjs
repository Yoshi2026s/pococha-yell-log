const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'../index.html'),'utf8');

function fixture(){
  const nodes={},effects={blur:0,click:0,dayRender:0,recRender:0};
  const $=id=>nodes[id]||=( {value:'確認中',disabled:false,handlers:{},
    addEventListener(type,fn){this.handlers[type]=fn},
    blur(){effects.blur++},click(){effects.click++},
    querySelector(){return $('result')}
  });
  const S={dayQ:'確認中'};
  const ctx=vm.createContext({$,S,renderDay:()=>effects.dayRender++,recQRender:()=>effects.recRender++});
  for(const id of ['dayQ','sumQ','recQ','rstTx']){
    const line=html.split('\n').find(s=>s.startsWith(`$('${id}').addEventListener('keydown',`));
    assert(line,`Missing ${id} handler`);vm.runInContext(line,ctx);
  }
  const dispatch=(id,key,mods={})=>{
    let prevented=0;const target=$(id);
    target.handlers.keydown({key,target,isComposing:false,keyCode:0,preventDefault(){prevented++},...mods});
    return prevented;
  };
  return {$,S,effects,dispatch};
}

let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name)}
for(const id of ['dayQ','sumQ','recQ','rstTx']){
  for(const mods of [{isComposing:true},{keyCode:229}]){
    test(`${id} conversion Enter does not blur, choose a result or run reset`,()=>{
      const t=fixture();assert.equal(t.dispatch(id,'Enter',mods),0);
      assert.deepEqual(t.effects,{blur:0,click:0,dayRender:0,recRender:0});
    });
  }
  test(`${id} regular Enter keeps its intended action`,()=>{
    const t=fixture();assert.equal(t.dispatch(id,'Enter'),1);
    assert.equal(t.effects[id==='dayQ'||id==='sumQ'?'blur':'click'],1);
  });
}
for(const id of ['dayQ','recQ']){
  test(`${id} conversion Escape preserves the query`,()=>{
    const t=fixture();assert.equal(t.dispatch(id,'Escape',{isComposing:true}),0);
    assert.equal(t.$(id).value,'確認中');assert.equal(t.S.dayQ,'確認中');
    assert.equal(t.effects.dayRender+t.effects.recRender,0);
  });
  test(`${id} regular Escape clears the query`,()=>{
    const t=fixture();t.dispatch(id,'Escape');assert.equal(t.$(id).value,'');
    assert.equal(t.effects.dayRender+t.effects.recRender,1);
  });
}
test('reset Enter never clicks a disabled reset action',()=>{
  const t=fixture();t.$('rstGo').disabled=true;t.dispatch('rstTx','Enter');assert.equal(t.effects.click,0);
});
console.log(`${passed} text-input keyboard scenarios passed.`);
