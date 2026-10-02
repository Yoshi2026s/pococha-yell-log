const {spawnSync}=require('node:child_process');
const path=require('node:path');

// The original fifteen suites run once. The name and goal suites are partitioned,
// so every scenario runs exactly once across twenty distinct review targets.
const rounds=[
  ['構文・画面構造・入力欄の参照','structure.cjs'],
  ['オフライン保存・保存失敗・月切替','storage-backup.cjs'],
  ['入力直後の保存・再読み込み','data-persistence.cjs'],
  ['検索・表示対象・まとめ入力の範囲','operations.cjs'],
  ['分数入力・境界値・保存と取り消し','minutes.cjs'],
  ['バックアップ復元・保存競合','restore.cjs'],
  ['日付とタブのキーボード移動','keyboard.cjs'],
  ['組み合わせ選択・入力パネル','panel.cjs'],
  ['個別の名前登録・反映・取り消し','names.cjs'],
  ['数値入力・変換中の保護・入力先保持','input-audit.cjs'],
  ['検索などの文字入力・変換キー','text-keyboard.cjs'],
  ['自分垢別の目標・単位・保存・取り消し','goal-form.cjs'],
  ['日付別エール履歴・目標との分離','daily-yell.cjs'],
  ['日付別時間の直接入力・連続入力','daily-minute.cjs'],
  ['日付別の操作・時刻形式・追加ペアの保持','daily-usability.cjs'],
  ['名前一括登録・番号対応・検証・取り消し','names-usability.cjs','bulk'],
  ['名前入力の案内・前後入力・設定画面の導線','names-usability.cjs','interaction',['settings-simplification.cjs']],
  ['他人垢別目標・方向切替・同じ組み合わせの保持','goals-orientation.cjs','orientation'],
  ['目標の数値入力・保存表示・変換・取り消し','goals-orientation.cjs','inputs'],
  ['目標一括反映・検索範囲・画面移動の保護','goals-orientation.cjs','bulk-navigation']
];

const counts=[],uniqueSuites=new Set();
for(let i=0;i<rounds.length;i++){
  const [name,suite,group,extraSuites]=rounds[i],number=i+1;
  console.log('\nDebug '+number+'/20: '+name);
  let roundCount=0;
  for(const [file,filter] of [[suite,group],...(extraSuites||[]).map(s=>[s,''])]){
    const r=spawnSync(process.execPath,[path.join(__dirname,file)],{
      encoding:'utf8',maxBuffer:8*1024*1024,
      env:{...process.env,TEST_GROUP:filter||''}
    });
    if(r.stdout)process.stdout.write(r.stdout);
    if(r.stderr)process.stderr.write(r.stderr);
    if(r.error){console.error(r.error);process.exit(1)}
    if(r.status!==0){console.error('Debug '+number+'/20 FAILED: '+name);process.exit(r.status||1)}
    const summaries=[...(r.stdout||'').matchAll(/\b(?:All\s+)?(\d+)[^\n]*?(?:scenarios|checks)\s+passed/g)],jsonCount=(r.stdout||'').match(/"passed"\s*:\s*(\d+)/);
    const count=summaries.length?Number(summaries.at(-1)[1]):jsonCount?Number(jsonCount[1]):0;
    if(!Number.isInteger(count)||count<1){console.error('Debug '+number+'/20 FAILED: scenario count is missing');process.exit(1)}
    roundCount+=count;uniqueSuites.add(file);
  }
  counts.push(roundCount);
  console.log('Debug '+number+'/20 PASS ('+roundCount+' scenarios)');
}
const total=counts.reduce((sum,n)=>sum+n,0);
console.log('\nAll 20 debugging targets passed across '+uniqueSuites.size+' regression suites ('+total+' scenarios; each scenario ran once). Live browser verification is separate.');
