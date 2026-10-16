const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../web/dist/app.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../web/dist/index.html'),'utf8');
const nodes={};let stopped=0,focused='';
for(const name of ['setup','timers','scores']){
 nodes['#tab-'+name]={setAttribute(k,v){this[k]=v},focus(){focused=name}};
 nodes['#view-'+name]={hidden:false};
}
const state={running:true,remain:123,p:[45,0,0,0]};
const c=vm.createContext({$:id=>nodes[id],stopClockAdjustment:()=>stopped++,state});
vm.runInContext(source.slice(source.indexOf('const appTabNames='),source.lastIndexOf('\n})();')),c);
function visible(name){for(const key of ['setup','timers','scores']){assert.equal(nodes['#view-'+key].hidden,key!==name);assert.equal(nodes['#tab-'+key]['aria-selected'],String(key===name));assert.equal(nodes['#tab-'+key].tabIndex,key===name?0:-1)}}
visible('setup');nodes['#tab-timers'].onclick();visible('timers');nodes['#tab-scores'].onclick();visible('scores');
const event=key=>({key,preventDefault(){}});
nodes['#tab-scores'].onkeydown(event('ArrowRight'));visible('setup');assert.equal(focused,'setup');
nodes['#tab-setup'].onkeydown(event('ArrowLeft'));visible('scores');
nodes['#tab-scores'].onkeydown(event('Home'));visible('setup');
nodes['#tab-setup'].onkeydown(event('End'));visible('scores');
assert.equal(state.running,true);assert.equal(state.remain,123);assert.deepEqual(state.p,[45,0,0,0]);assert(stopped>=7);
for(const [name,content]of [['setup','id="field"'],['timers','id="penalties"'],['scores','id="send"']]){
 const panel=html.match(new RegExp('<section id="view-'+name+'"[^>]*>([\\s\\S]*?)</section>'));assert(panel);assert(panel[1].includes(content));
}
assert.equal((html.match(/role="tab"/g)||[]).length,3);
assert(html.includes('width:16px;height:16px;background:url("data:image/png'));
assert(html.includes('[role="tabpanel"][hidden]{display:none!important}'));
console.log('PASS: three exclusive tabs, selected state, keyboard wrap/Home/End, hold stop, running timer preservation, section grouping and half-size dropdown images');
