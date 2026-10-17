const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../web/dist/app.js'),'utf8');
const section=source.slice(source.indexOf('const defaultPhone='),source.indexOf("$('#field').onchange="));
function setup(storage,initialize=false,search=''){
 const nodes=new Map();
 class Element{
  constructor(tag='div'){this.tag=tag;this.children=[];this.value='';this.textContent='';this.valid=true;this.style={};}
  get options(){return this.children}
  set id(v){this._id=v;nodes.set(v,this)} get id(){return this._id}
  append(...v){this.children.push(...v)} replaceChildren(){this.children=[]}
  insertBefore(child,before){this.children.splice(this.children.indexOf(before),0,child)} before(){} after(){} closest(){return new Element()}
  querySelector(){return new Element()}
  setAttribute(k,v){this[k]=v} setCustomValidity(v){this.valid=!v}
  reportValidity(){return this.valid&&(!this.required||!!this.value)}
  showModal(){this.open=true} close(){this.open=false}
 }
 for(const id of ['add-field','field-limit','score1-plus','score1-minus','score2-plus','score2-minus','score-grid','switch-teams','field','team1','team2','score1','score2','phone','team1-label','team2-label','score1','score2','score-heading','message-title','edit-form','edit-dialog','edit-team-fields','edit-fields','cancel-edit','reset-fields','slot-time','custom-periods','custom-minutes','note']){const e=new Element();e.id=id;}
 for(let i=1;i<=2;i++){nodes.get('team'+i).value='Team '+i;nodes.get('score'+i).value='0'}
 nodes.get('slot-time').required=true;
 const c=vm.createContext({console,URLSearchParams,setTimeout,clearTimeout,setInterval,clearInterval,window:{addEventListener(){}},location:{search},confirm(){return true},state:{},render(){},alert(){},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{addEventListener(){},createElement:t=>new Element(t),head:new Element()},$:s=>nodes.get(s.slice(1))});
 vm.runInContext(source.slice(source.indexOf('let stopClockAdjustment='),source.indexOf("for(const[id,delta]of[['game-minus'")),c);vm.runInContext(section,c);vm.runInContext(source.slice(source.indexOf('function message(){'),source.indexOf('function render(){')),c);if(initialize)vm.runInContext('initializePicturedSchedule()',c);vm.runInContext('loadField()',c);
 return {c,nodes,run:s=>vm.runInContext(s,c)};
}

const store=new Map();let t=setup(store,true),n=t.nodes;
assert.equal(t.run('schedule.length'),17);assert.equal(t.run('fieldNames.length'),5);assert.equal(t.run('field'),2);assert.equal(n.get('team1').value,'McCord/Perry MS');assert.equal(n.get('team2').value,'Liberty MS');
assert.equal(t.run('schedule[0].time'),'08:40');assert.equal(t.run('schedule[16].time'),'14:00');
assert.equal(t.run('schedule.flatMap(s=>s.fields).filter(f=>!f.activity).length'),41);
assert.equal(t.run('schedule[0].fields[0].activity'),true);assert.equal(t.run('schedule[0].fields[4].team1'),'House Team Red');
assert.equal(t.run('schedule[1].fields[0].team1'),'St. Francis De Sales (Tol)');
assert.equal(t.run('schedule[16].fields[3].team2'),'BLACK 2nd Place');
assert(n.get('field').options.every(o=>!o.textContent.includes('Olentangy Liberty High School -')));assert.equal(t.run('fieldName(2)'),'Olentangy Liberty High School - Field 2');assert.match(t.run('message()'),/Olentangy Liberty High School - Field 2/);
assert.equal(n.get('time-slots').children.length,17);assert.equal(n.get('field').options.length,5);
n.get('score1-plus').onclick();assert.equal(n.get('score1').value,'1');assert.match(t.run('message()'),/Game Time: 8:40 AM/);
const before=t.run('message()');n.get('switch-teams').onclick();assert.equal(t.run('message()'),before);
t=setup(store,true);n=t.nodes;assert.equal(n.get('score1').value,'1');assert.equal(n.get('score-grid')['data-swapped'],'true');
n.get('time-slots').children[1].onclick();assert.equal(n.get('score1').value,'0');n.get('time-slots').children[0].onclick();assert.equal(n.get('score1').value,'1');
n.get('edit-fields').onclick();n.get('edit-field-2-name').value='North';n.get('edit-field-2-team-1').value='Edited Team';n.get('cancel-edit').onclick();assert.equal(t.run('fieldNames[1]'),'Olentangy Liberty High School - Field 2');
n.get('edit-fields').onclick();n.get('edit-field-2-name').value='North';n.get('edit-field-2-team-1').value='Edited Team';n.get('edit-form').onsubmit({preventDefault(){}});assert.equal(n.get('team1').value,'Edited Team');assert.equal(t.run('fieldNames[1]'),'North');
n.get('edit-fields').onclick();for(let i=0;i<5;i++)n.get('add-field').onclick();assert.equal(n.get('add-field').disabled,true);n.get('add-field').onclick();assert.equal(t.run('draftFieldNames.length'),10);n.get('edit-form').onsubmit({preventDefault(){}});assert.equal(n.get('field').options.length,10);assert.equal(t.run('schedule.every(s=>s.fields.length===10)'),true);
n.get('phone').value='2025550123';n.get('reset-fields').onclick();assert.equal(t.run('schedule.length'),17);assert.equal(n.get('field').options.length,5);assert.equal(t.run('field'),2);assert.equal(n.get('team1').value,'McCord/Perry MS');assert.equal(n.get('phone').value,'+1 (614) 493-8545');assert.equal(n.get('score1').value,'0');assert.equal(t.run('state.remain'),480);assert.equal(t.run('state.p.length'),4);
t=setup(store,true);assert.equal(t.run('schedule.length'),17);assert.equal(t.run('field'),2);
const I=require('../web/dist/schedule-import.js'),candidate=I.parseRows([['Time','Field','Team 1','Team 2'],['10 AM','Custom Field','Home','Away']]);
t.c.candidate=candidate;assert.equal(t.run('applyImportedSchedule(candidate)'),true);t=setup(store,true);assert.equal(t.run('schedule.length'),1);assert.equal(t.nodes.get('team1').value,'Home');
const saved=store.get('resolute-schedule-v1');t=setup(store,true,'?load-schedule=sixes-20261018');assert.equal(t.run('schedule.length'),17);assert.equal(JSON.stringify(JSON.parse(store.get('resolute-sixes-schedule-backup')).schedule),saved);
t.nodes.get('score1-plus').onclick();t=setup(store,true,'?load-schedule=sixes-20261018');assert.equal(t.nodes.get('score1').value,'1');
const legacy=setup(new Map()).run('legacyDefaultSchedule()');legacy[0].fields[0].team1='Saved custom';legacy[0].fields[0].score1='16';
const legacyStore=new Map([['resolute-schedule-v1',JSON.stringify(legacy)],['resolute-field-names',JSON.stringify(['A','B','C','D'])],['resolute-field','1']]);
let l=setup(legacyStore,true);assert.equal(l.run('schedule.length'),5);assert.equal(l.nodes.get('team1').value,'Saved custom');assert.equal(l.nodes.get('score1').value,'16');assert.equal(l.nodes.get('field').options.length,4);
const four=legacy.slice(0,4);l=setup(new Map([['resolute-schedule-v1',JSON.stringify(four)]]),true);assert.equal(l.run('schedule.length'),5);assert.equal(l.run('schedule[4].time'),'14:00');
const untouchedStore=new Map([['resolute-schedule-v1',JSON.stringify(setup(new Map()).run('picturedSchedule()'))],['resolute-field-names',JSON.stringify(['East','West','South','Unused'])]]);
l=setup(untouchedStore,true);assert.equal(l.run('schedule.length'),17);assert.equal(untouchedStore.has('resolute-sixes-schedule-backup'),true);
const ten=I.parseRows([['Time',...Array.from({length:10},(_,i)=>'F'+i)],['10 AM',...Array(10).fill('A v B')]]);l.c.candidate=ten;l.run('applyImportedSchedule(candidate)');l=setup(untouchedStore,true);assert.equal(l.nodes.get('field').options.length,10);
const html=fs.readFileSync(require('node:path').join(__dirname,'../web/dist/index.html'),'utf8');
assert.match(source,/loadScheduleButton.textContent='Sample Schedule'/);assert.match(html,/<button id="reset-fields" type="button"/);
assert.match(html,/width:44px;min-height:48px;height:48px/);
assert.match(html,/font-size:28px;font-weight:700;text-shadow:none/);
assert.match(html,/#sideline-preview \.penclock\{text-align:center;width:100%\}/);
console.log('PASS: Sixes default has 41 games/17 slots/5 fields, correct names/times, empty-field guards, independent scores, swap, editor save/cancel, ten-field limit, full reset/reload, imports, legacy custom preservation/migration, unchanged-sample upgrade with backup, and one-time update link preserving later scores');

const filterStore=new Map();let ft=setup(filterStore,true),fn=ft.nodes;
const teamNames=fn.get('team-filter').options.slice(1).map(o=>o.textContent);assert.deepEqual(teamNames,[...teamNames].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'})));assert(!teamNames.includes('No game scheduled'));assert.equal(new Set(teamNames).size,teamNames.length);
assert.deepEqual(fn.get('field').options.map(o=>o.value),['1','2','3','4','5']);
fn.get('team-filter').value='Dublin Jerome';fn.get('team-filter').onchange();assert.equal(ft.run('schedule[slot].time'),'10:20');assert.equal(ft.run('field'),3);assert.equal(fn.get('time-slots').children.length,2);assert.equal(fn.get('field').options.length,1);assert.match(ft.run('message()'),/Dublin Jerome/);
fn.get('time-slots').children[1].onclick();assert.equal(ft.run('schedule[slot].time'),'12:40');assert.equal(ft.run('field'),4);fn.get('score2-plus').onclick();assert.equal(fn.get('score2').value,'1');
ft=setup(filterStore,true);fn=ft.nodes;assert.equal(fn.get('team-filter').value,'Dublin Jerome');assert.equal(fn.get('score2').value,'1');assert.equal(fn.get('time-slots').children.length,2);
fn.get('team-filter').value='';fn.get('team-filter').onchange();assert.equal(fn.get('time-slots').children.length,17);assert.equal(fn.get('field').options.length,5);assert.equal(fn.get('score2').value,'1');
const ordered=I.parseRows([['Time','Field 5','Field 2','Field 3','Field 4','Field 1'],['8 AM','A v B','C v D','E v F','G v H','I v J']]);ft.c.candidate=ordered;ft.run('applyImportedSchedule(candidate)');assert.deepEqual(fn.get('field').options.map(o=>o.textContent.split(' · ')[0]),['Field 1','Field 2','Field 3','Field 4','Field 5']);assert.deepEqual(fn.get('field').options.map(o=>o.value),['5','2','3','4','1']);assert.equal(fn.get('team1').value,'A');
fn.get('team-filter').value='I';fn.get('team-filter').onchange();assert.equal(ft.run('field'),5);assert.equal(fn.get('team1').value,'I');assert.equal(fn.get('team2').value,'J');fn.get('reset-fields').onclick();assert.equal(fn.get('team-filter').value,'');assert.equal(fn.get('time-slots').children.length,17);
console.log('PASS: alphabetical unique team list, All Teams, filtered times/fields, correct team identity after natural field sorting, independent scores, saved filter reload, import clearing and reset');

const hiddenStore=new Map([['resolute-team-filter','BLACK 1st Place']]);const hidden=setup(hiddenStore,true);const visible=hidden.nodes.get('team-filter').options.map(o=>o.textContent);assert(!visible.some(n=>n.startsWith('BLACK ')||n.startsWith('RED ')));assert(visible.includes('House Team Red'));assert.equal(hidden.nodes.get('team-filter').value,'');assert.equal(hidden.run('schedule.flatMap(s=>s.fields).filter(f=>!f.activity).length'),41);assert.equal(hidden.run("schedule.some(s=>s.fields.some(f=>f.team1==='BLACK 1st Place'))"),true);console.log('PASS: BLACK/RED bracket placeholders hidden from filter; House Team Red and all 41 games retained; obsolete saved filter cleared');

const bracket=setup(new Map([['resolute-team-filter','Bracket Winner B5']]),true);const bracketNames=bracket.nodes.get('team-filter').options.map(o=>o.textContent);assert(!bracketNames.some(n=>n.toLowerCase().startsWith('bracket winner')));assert(bracketNames.includes('House Team Red'));assert.equal(bracket.nodes.get('team-filter').value,'');assert.equal(bracket.run("schedule.some(s=>s.fields.some(f=>f.team1==='Bracket Winner B5'))"),true);assert.equal(bracket.run('schedule.flatMap(s=>s.fields).filter(f=>!f.activity).length'),41);console.log('PASS: Bracket Winner entries hidden from filter, old selection cleared, all games retained');

const numberTest=setup(new Map(),true),nb=numberTest.nodes;
assert.deepEqual(nb.get('field-number-buttons').children.map(b=>b.textContent),['1','2','3','4','5']);
nb.get('field-number-buttons').children[3].onclick();assert.equal(numberTest.run('field'),4);assert.equal(nb.get('field').value,'4');assert.equal(nb.get('field-number-buttons').children[3]['aria-pressed'],'true');
nb.get('field').value='2';numberTest.run("field=2;loadField()");assert.equal(nb.get('field-number-buttons').children[1]['aria-pressed'],'true');
nb.get('team-filter').value='Dublin Jerome';nb.get('team-filter').onchange();
assert.equal(nb.get('field-number-buttons').children[0].disabled,true);
nb.get('field-number-buttons').children[3].onclick();assert.equal(numberTest.run('field'),4);assert.equal(numberTest.run('schedule[slot].time'),'12:40');
numberTest.run("teamFilter='';loadField()");nb.get('edit-fields').onclick();nb.get('add-field').onclick();nb.get('edit-form').onsubmit({preventDefault(){}});assert.equal(nb.get('field-number-buttons').children.length,6);
console.log('PASS: field number buttons, selected state, dropdown sync, team-filter availability and matching slot, added field');
