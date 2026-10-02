const {spawnSync}=require('node:child_process');
const path=require('node:path');
const rounds=[
  ['構文・画面構造',['structure.cjs']],
  ['日付境界・キーボード移動',['keyboard.cjs']],
  ['時間の直接入力・保存・連続入力',['minutes.cjs','daily-minute.cjs']],
  ['組み合わせ選択・入力パネル',['panel.cjs']],
  ['検索・表示対象・まとめ入力',['operations.cjs']],
  ['名前・自分垢別目標',['names.cjs','goal-form.cjs']],
  ['数値・文字入力・IME',['input-audit.cjs','text-keyboard.cjs']],
  ['日別エール履歴・取り消し',['daily-yell.cjs']],
  ['オフライン保存・保存失敗・再読込',['data-persistence.cjs','storage-backup.cjs']],
  ['バックアップ復元・保存競合',['restore.cjs']]
];
for(let i=0;i<rounds.length;i++){
  const [name,suites]=rounds[i];console.log('\nDebug '+(i+1)+'/10: '+name);
  for(const suite of suites){const r=spawnSync(process.execPath,[path.join(__dirname,suite)],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
  console.log('Debug '+(i+1)+'/10 PASS');
}
console.log('All 10 debugging rounds passed across 14 regression suites. Live browser verification is separate.');
