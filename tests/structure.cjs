const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
// Python's standard HTML parser ignores script contents as markup, so template IDs
// created only by JavaScript are deliberately outside these static HTML checks.
const parser=String.raw`
import json, sys
from html.parser import HTMLParser
class Inspect(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.elements=[]
        self.scripts=[]
        self.script=None
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        self.elements.append({'tag':tag,'attrs':attrs,'line':self.getpos()[0]})
        if tag=='script':
            self.script={'attrs':attrs,'code':'','line':self.getpos()[0]}
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
    def handle_data(self, data):
        if self.script is not None:
            self.script['code']+=data
    def handle_endtag(self, tag):
        if tag=='script' and self.script is not None:
            self.scripts.append(self.script)
            self.script=None
p=Inspect()
with open(sys.argv[1], encoding='utf8') as f:
    p.feed(f.read())
p.close()
print(json.dumps({'elements':p.elements,'scripts':p.scripts}))
`;
const parsed=spawnSync('python3',['-c',parser,target],{encoding:'utf8'});
assert.equal(parsed.error,undefined,'Python 3 with the standard HTMLParser module is required');
assert.equal(parsed.status,0,parsed.stderr);
const {elements,scripts}=JSON.parse(parsed.stdout);
const inline=scripts.filter(s=>!s.attrs.src&&(!s.attrs.type||['text/javascript','application/javascript','module'].includes(s.attrs.type.toLowerCase())));
assert(inline.length>0,'At least one inline JavaScript block must be parsed');
for(const s of inline){
 assert.notEqual(s.attrs.type,'module','This VM syntax check supports classic scripts; use a module compiler for inline modules');
 new vm.Script(s.code,{filename:target,lineOffset:s.line-1});
}
console.log(`PASS full inline JavaScript syntax (${inline.length} scripts)`);
const ids=new Map(),duplicates=[];
for(const e of elements)if(e.attrs.id){
 if(ids.has(e.attrs.id))duplicates.push(`${e.attrs.id} (lines ${ids.get(e.attrs.id).line}, ${e.line})`);
 else ids.set(e.attrs.id,e);
}
assert.deepEqual(duplicates,[],'Static HTML IDs must be unique');
console.log(`PASS static HTML IDs are unique (${ids.size} IDs)`);
const tabs=elements.filter(e=>e.attrs.role==='tab');
assert(tabs.length>0,'At least one tab must be parsed');
for(const tab of tabs){
 assert(tab.attrs.id,`Tab at line ${tab.line} needs an ID`);
 const control=tab.attrs['aria-controls'];
 assert(control,`Tab ${tab.attrs.id} needs aria-controls`);
 const panel=ids.get(control);
 assert(panel,`Tab ${tab.attrs.id} points to missing panel ${control}`);
 assert.equal(panel.attrs.role,'tabpanel',`${control} must be a tab panel`);
 assert((panel.attrs['aria-labelledby']||'').split(/\s+/).includes(tab.attrs.id),`${control} must refer back to ${tab.attrs.id}`);
}
for(const e of elements)for(const id of (e.attrs['aria-labelledby']||'').trim().split(/\s+/).filter(Boolean))assert(ids.has(id),`aria-labelledby at line ${e.line} points to missing ${id}`);
console.log(`PASS tabs and aria-labelledby reference existing elements (${tabs.length} tabs)`);
const labels=elements.filter(e=>e.tag==='label'&&e.attrs.for);
for(const label of labels){
 const control=ids.get(label.attrs.for);
 assert(control,`Label at line ${label.line} points to missing ${label.attrs.for}`);
 assert(['button','input','meter','output','progress','select','textarea'].includes(control.tag),`Label at line ${label.line} points to non-labelable ${control.tag}`);
 assert(!(control.tag==='input'&&control.attrs.type==='hidden'),`Label at line ${label.line} points to a hidden-type input`);
}
console.log(`PASS explicit label targets are valid (${labels.length} labels)`);
console.log('All 4 structure checks passed. JavaScript-generated DOM template IDs require browser checks.');
