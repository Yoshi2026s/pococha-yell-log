const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const source=fs.readFileSync(target,'utf8');
function take(start,end){const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a,`Missing ${start}`);return source.slice(a,b)}
function setup(){
 const events={},nodes={},store=new Map(),undo=[],toasts=[];
 const document={activeElement:null,addEventListener:(name,fn)=>(events[name]||=[]).push(fn),querySelectorAll:sel=>rich[sel]||[]};
 const decode=s=>s.replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
 function node(id){return nodes[id]||=( {id,type:'text',tagName:'INPUT',dataset:{},value:'',textContent:'',attrs:{},handlers:{},options:[],className:'',lastElementChild:{textContent:''},setAttribute(k,v){this.attrs[k]=String(v)},removeAttribute(k){delete this.attrs[k]},addEventListener(k,f){(this.handlers[k]||=[]).push(f)},matches(s){return s==='input[type=text]'||s.includes('input[type=text]')},closest(s){return this.row||null},querySelectorAll(){return []},querySelector(){return null},select(){},focus(){document.activeElement=this},blur(){document.activeElement=null;fire('focusout',this)},classList:{contains(c){return (nodes[id].className||'').split(' ').includes(c)},toggle(){}}} );}
 function select(id,val='0'){const n=node(id);n.tagName='SELECT';n.value=val;Object.defineProperty(n,'innerHTML',{configurable:true,get(){return this._html||''},set(h){this._html=h;this.options=[...h.matchAll(/<option value="([^"]*)"[^>]*>(.*?)<\/option>/g)].map(m=>({value:m[1],textContent:decode(m[2])}))}});return n;}
 for(const id of ['selFam','selOth','dayFam','dayOth','sumFam','sumOth','addFam','addOth','patOth','oiOth','rytOth'])select(id,/^(day|sum)/.test(id)?'all':'0');
 const rich={};
 function richRow(key,id,indexKey,index){const n=node(id),pan={textContent:'old'},row={querySelector:q=>q==='.pan'?pan:null};n.dataset[indexKey]=String(index);n.row=row;rich[key]=[n];return {n,pan,row};}
 const oi=richRow('#oiList select[data-oc]','close0','oc',0),pat=richRow('#patAssign select[data-pa]','assign0','pa',0),ryt=richRow('#rytList input[data-rt]','rt0','rt',0);ryt.n.value='5.';
 const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i],get length(){return store.size}};
 const context=vm.createContext({console,document,$:node,localStorage,setTimeout:()=>1,clearTimeout:()=>{},window:{addEventListener(){}},navigator:{onLine:true},Promise,Date,Map,Set,__undo:undo,__toasts:toasts});
 const prelude=`const N=50,fcCache=null;const S={ym:'2026-10',tab:'list',month:{records:{}},lists:{family:Array.from({length:N},(_,i)=>'自分'+(i+1)),others:Array.from({length:N},(_,i)=>'他人'+(i+1))},active:{family:Array(N).fill(false),others:Array(N).fill(false)},order:{family:Array.from({length:N},(_,i)=>i),others:Array.from({length:N},(_,i)=>i)},pos:{family:Array.from({length:N},(_,i)=>i),others:Array.from({length:N},(_,i)=>i)},pats:{p:{o0:[{},{}]},a:{}},priv:false,rytO:0,namedOnly:true,onlyActive:false};let db=null,undo=null;const mExists={},inflight={};const vIdx=v=>Number.isInteger(v)&&v>=0&&v<N,PF=i=>S.pos.family[i],PO=i=>S.pos.others[i],pad=n=>String(n).padStart(2,'0');const packMonth=m=>m;const pushUndo=u=>__undo.push(u),showToast=m=>__toasts.push(m);function updFamPats(){}function renderPatSum(){}function updDline(){}function updNdot(){}function applyListQ(){}function updDup(){}function renderListSum(){}function updOthBadges(){}function setOrder(k,a){if(Array.isArray(a))S.order[k]=a.slice()}`;
 let code=prelude;
 code+=take('const isDefName=','const curYM=');
 code+=take('const ls={','const pref=');
 code+=take('const famName=','const memoOf=');
 code+=take('const esc=','function ymParts(');
 code+=take('const pend={};','/* ---------- データ読込');
 code+=take('function applyLists(d){','async function loadPrevKeys(');
 code+=take('function fillSelect(','function renderMonth(');
 code+=take('// 名前欄だけを扱い','$(\'csvBtn\').onclick=');
 code+=take('// 名前を変えたら「元に戻す」','// あいうえお順・最初の番号順');
 code+=take("for(const id of ['lstFam','lstOth']) $(id).addEventListener('keydown',ev=>{const t=ev.target; if(ev.key!=='Enter'",'/* ---------- v3：便利機能');
 code+=take('// Escで入力前の名前に戻す','// バッジから関連する画面へ');
 code+='globalThis.api={S,flush,applyLists,refreshNamedLabels,syncAccountName};';
 new vm.Script(code,{filename:target}).runInContext(context);
 function fire(name,t,extra={}){const e={target:t,isComposing:false,preventDefault(){this.prevented=true},...extra};for(const fn of events[name]||[])fn(e);return e;}
 function input(kind,i){const n=node(kind+'-'+i);n.dataset.k=kind;n.dataset.i=String(i);n.value=context.api.S.lists[kind][i];return n;}
 function focus(n){document.activeElement=n;fire('focusin',n);}
 function key(n,key,extra={}){const e={target:n,key,preventDefault(){this.prevented=true},...extra};for(const fn of node(n.dataset.k==='family'?'lstFam':'lstOth').handlers.keydown||[])fn(e);return e;}
 return {api:context.api,node,nodes,store,undo,toasts,input,focus,fire,key,document,oi,pat,ryt};
}
const option=(s,id='0')=>s.options.find(o=>o.value===id)?.textContent;
async function main(){
 {
  const t=setup(),n=t.input('others',0);t.api.refreshNamedLabels();t.focus(n);n.value='のわんもえ';t.fire('input',n);t.fire('change',n);t.fire('focusout',n);await t.api.flush();
  for(const id of ['patOth','oiOth','rytOth','selOth'])assert.match(option(t.nodes[id]),/のわんもえ/);
  assert.match(option(t.nodes.patOth),/パターン2/);assert.equal(t.nodes.patOth.value,'0');assert.match(t.oi.pan.textContent,/のわんもえ/);assert.match(t.ryt.n.attrs['aria-label'],/のわんもえ/);
  assert.equal(JSON.parse(t.store.get('pk:config/lists')).others[0],'のわんもえ');assert.equal(t.api.S.active.others[0],true);
  console.log('PASS other-account name commits update all selectors, pattern counts, labels and storage');
 }
 {
  const t=setup(),n=t.input('family',0);t.focus(n);n.value='Yoshi';t.fire('input',n);t.fire('focusout',n);assert.match(t.pat.pan.textContent,/Yoshi/);assert.match(t.ryt.pan.textContent,/Yoshi/);assert.match(t.ryt.n.attrs['aria-label'],/Yoshi/);assert.equal(t.ryt.n.value,'5.');assert.strictEqual(t.document.activeElement,n);
  console.log('PASS own-account labels refresh without replacing other input drafts or focused name node');
 }
 {
  const t=setup(),n=t.input('family',1);t.focus(n);n.value='  よし　し  ';t.fire('change',n);t.fire('focusout',n);await t.api.flush();assert.equal(t.api.S.lists.family[1],'よし し');assert.equal(n.value,'よし し');assert.equal(JSON.parse(t.store.get('pk:config/lists')).family[1],'よし し');assert.equal(t.undo.length,1);
  console.log('PASS change-only autofill is committed and normalized with one Undo');
 }
 {
  const t=setup(),n=t.input('others',1);t.focus(n);n.value='直接入力';t.fire('focusout',n);await t.api.flush();assert.equal(t.api.S.lists.others[1],'直接入力');assert.equal(JSON.parse(t.store.get('pk:config/lists')).others[1],'直接入力');
  console.log('PASS blur commits a changed DOM value even without an input event');
 }
 {
  const t=setup(),n=t.input('family',0);t.api.S.lists.family[0]='以前の名前';t.api.S.active.family[0]=false;n.value='以前の名前';t.focus(n);n.value='';t.fire('input',n);n.value='新しい名前';t.fire('input',n);t.fire('change',n);t.fire('focusout',n);assert.equal(t.api.S.active.family[0],false);t.undo[0].fn();assert.equal(t.api.S.lists.family[0],'以前の名前');assert.equal(t.api.S.active.family[0],false);assert.match(option(t.nodes.selFam),/以前の名前/);
  console.log('PASS named-to-named edits preserve inactive state and Undo restores labels and original active state');
 }
 {
  const t=setup(),n=t.input('family',0);t.focus(n);n.value='新しい名前';t.fire('input',n);assert.equal(t.api.S.active.family[0],true);await t.api.flush();const saved=JSON.parse(t.store.get('pk:config/lists'));t.api.applyLists(saved);assert.equal(t.api.S.lists.family[0],'新しい名前');assert.equal(t.api.S.active.family[0],true);
  t.key(n,'Escape');assert.equal(t.api.S.lists.family[0],'自分1');assert.equal(t.api.S.active.family[0],false);assert.equal(t.undo.length,0);
  console.log('PASS focused name and automatic active flag survive reload; Escape restores the original session');
 }
 {
  const t=setup(),n=t.input('others',0);t.focus(n);t.fire('compositionstart',n);n.value='も';t.fire('input',n,{isComposing:true});assert.equal(t.api.S.lists.others[0],'他人1');assert.equal(t.key(n,'Enter',{isComposing:true}).prevented,undefined);assert.equal(t.key(n,'Escape',{keyCode:229}).prevented,undefined);assert.equal(n.value,'も');n.value='もえ';t.fire('compositionend',n);assert.equal(t.api.S.lists.others[0],'もえ');assert.match(option(t.nodes.oiOth),/もえ/);t.fire('focusout',n);assert.equal(t.undo.length,1);
  console.log('PASS Japanese composition is not committed or navigated prematurely; final text and Undo are preserved');
 }
 {
  const t=setup(),n=t.input('others',0);t.api.S.lists.others[0]='登録済み';t.api.S.active.others[0]=true;n.value='登録済み';t.focus(n);n.value='';t.fire('change',n);t.fire('focusout',n);assert.equal(t.api.S.lists.others[0],'他人1');assert.equal(t.api.S.active.others[0],false);t.undo[0].fn();assert.equal(t.api.S.lists.others[0],'登録済み');assert.equal(t.api.S.active.others[0],true);
  console.log('PASS clearing a name restores its default and active flag; Undo restores the registered name');
 }
 {
  const t=setup(),other=t.node('foreign');other.dataset.k='f0_o0';other.dataset.i='0';other.value='unexpected';assert.doesNotThrow(()=>{t.fire('input',other);t.fire('change',other);t.fire('focusout',other)});assert.equal(t.api.S.lists.family[0],'自分1');
  console.log('PASS unrelated data-k fields cannot write to account names');
 }
 console.log('All 9 name input scenarios passed.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
