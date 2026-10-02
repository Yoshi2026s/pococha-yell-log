const {spawnSync}=require('node:child_process');
const path=require('node:path');
const suites=['structure.cjs','storage-backup.cjs','data-persistence.cjs','operations.cjs','minutes.cjs','restore.cjs','keyboard.cjs','panel.cjs','names.cjs','input-audit.cjs','text-keyboard.cjs','goal-form.cjs','daily-yell.cjs','daily-minute.cjs','daily-usability.cjs','names-usability.cjs','goals-orientation.cjs','settings-simplification.cjs'];
for(const suite of suites){
  const result=spawnSync(process.execPath,[path.join(__dirname,suite)],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);
}
console.log('All regression suites passed. Live browser checks are recorded separately.');
