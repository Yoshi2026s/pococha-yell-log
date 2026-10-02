const {spawnSync}=require('node:child_process');
const path=require('node:path');
const rounds=[
  ['構文・画面構造・日付・キーボード',['structure.cjs','keyboard.cjs','panel.cjs']],
  ['時間入力・連続入力・新しい入力操作',['minutes.cjs','daily-minute.cjs','daily-usability.cjs']],
  ['検索・まとめ入力・名前・目標',['operations.cjs','names.cjs','goal-form.cjs']],
  ['数値・IME・エール履歴・取り消し',['input-audit.cjs','text-keyboard.cjs','daily-yell.cjs']],
  ['保存・再読込・保存失敗・バックアップ復元',['data-persistence.cjs','storage-backup.cjs','restore.cjs']]
];
for(let i=0;i<rounds.length;i++){
  const [name,suites]=rounds[i];console.log('\nDebug '+(i+1)+'/5: '+name);
  for(const suite of suites){const r=spawnSync(process.execPath,[path.join(__dirname,suite)],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
  console.log('Debug '+(i+1)+'/5 PASS');
}
console.log('All 5 debugging rounds passed across 15 regression suites. Live browser verification is separate.');
