const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../web/dist/app.js'),'utf8');
const section=source.slice(source.indexOf('const defaultPhone='),source.indexOf("$('#field').onchange="));
function setup(storage,initialize=false,search=''){
 const nodes=new Map();
 class Element{
  constructor(tag='div'){this.tag=tag;this.children=[];this.value='';this.textContent='';this.valid=true;this.style={};this.options=Array.from({length:4},()=>({}));}
  set id(v){this._id=v;nodes.set(v,this)} get id(){return this._id}
  append(...v){this.children.push(...v)} replaceChildren(){this.children=[]}
  insertBefore(child,before){this.children.splice(this.children.indexOf(before),0,child)} before(){} after(){} closest(){return new Element()}
  querySelector(){return new Element()}
  setAttribute(k,v){this[k]=v} setCustomValidity(v){this.valid=!v}
  reportValidity(){return this.valid&&(!this.required||!!this.value)}
  showModal(){this.open=true} close(){this.open=false}
 }
 for(const id of ['score1-plus','score1-minus','score2-plus','score2-minus','score-grid','switch-teams','field','team1','team2','score1','score2','phone','team1-label','team2-label','score1','score2','score-heading','message-title','edit-form','edit-dialog','edit-team-fields','edit-fields','cancel-edit','reset-fields','slot-time','custom-periods','custom-minutes','note']){const e=new Element();e.id=id;}
 for(let i=1;i<=2;i++){nodes.get('team'+i).value='Team '+i;nodes.get('score'+i).value='0'}
 nodes.get('slot-time').required=true;
 const c=vm.createContext({console,URLSearchParams,location:{search},confirm(){return true},state:{},render(){},alert(){},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{createElement:t=>new Element(t),head:new Element()},$:s=>nodes.get(s.slice(1))});
 vm.runInContext(section,c);vm.runInContext(source.slice(source.indexOf('function message(){'),source.indexOf('function render(){')),c);if(initialize)vm.runInContext('initializePicturedSchedule()',c);vm.runInContext('loadField()',c);
 return {c,nodes,run:s=>vm.runInContext(s,c)};
}
const storage=new Map([['resolute-field-score-1',JSON.stringify({team1:'Original A',team2:'Original B',score1:'16',score2:'9'})]]);
let t=setup(storage),n=t.nodes;
assert.equal(n.get('team1').value,'Original A');
assert.equal(n.get('time-slots').children.length,5);
assert.equal(t.run('timeLabel(schedule[0].time)'),'10 AM');
assert.equal(t.run('timeLabel(schedule[3].time)'),'1 PM');
const originalSchedule=t.run('JSON.stringify(schedule)'),originalMessage=t.run('message()');
n.get('switch-teams').onclick();assert.equal(n.get('score-grid')['data-swapped'],'true');assert.equal(n.get('switch-teams')['aria-pressed'],'true');assert.equal(t.run('JSON.stringify(schedule)'),originalSchedule);assert.equal(t.run('message()'),originalMessage);assert.equal(n.get('score1').value,'16');assert.equal(n.get('score2').value,'9');
n.get('switch-teams').onclick();assert.equal(n.get('score-grid')['data-swapped'],'false');n.get('switch-teams').onclick();
n.get('edit-fields').onclick();
n.get('edit-time-slots').children[1].onclick();
n.get('slot-time').value='11:30';n.get('edit-field-1-team-1').value='Slot 2 A';
n.get('edit-time-slots').children[2].onclick();n.get('edit-field-1-team-1').value='Slot 3 A';
n.get('edit-time-slots').children[1].onclick();assert.equal(n.get('slot-time').value,'11:30');assert.equal(n.get('edit-field-1-team-1').value,'Slot 2 A');
n.get('cancel-edit').onclick();assert.equal(t.run('schedule[1].time'),'11:00');
n.get('edit-fields').onclick();n.get('edit-time-slots').children[1].onclick();
n.get('slot-time').value='11:30';n.get('edit-field-1-team-1').value='Slot 2 A';
n.get('edit-form').onsubmit({preventDefault(){}});
assert.equal(n.get('team1').value,'Slot 2 A');assert.equal(t.run('slot'),1);assert.equal(t.run('slotLabel(schedule[1])'),'11:30 AM');
n.get('score1').value='98';t.run('saveField()');n.get('time-slots').children[0].onclick();
assert.equal(n.get('team1').value,'Original A');assert.equal(n.get('score1').value,'16');
n.get('time-slots').children[1].onclick();assert.equal(n.get('score1').value,'98');assert.match(t.run('message()'),/Game Time: 11:30 AM\nSlot 2 A: 98/);assert(!source.includes('slot-name'));
t=setup(storage);n=t.nodes;assert.equal(n.get('score-grid')['data-swapped'],'true');assert.equal(n.get('team1').value,'Slot 2 A');assert.equal(n.get('score1').value,'98');
n.get('edit-fields').onclick();n.get('edit-field-1-team-1').value=' ';n.get('edit-time-slots').children[0].onclick();assert.equal(t.run('editSlot'),1);n.get('cancel-edit').onclick();
n.get('phone').value='2025550123';n.get('reset-fields').onclick();assert.equal(n.get('score-grid')['data-swapped'],'false');assert.equal(n.get('phone').value,'+1 (614) 493-8545');assert.equal(t.run('slot'),0);assert.equal(t.run('schedule[1].time'),'11:00');assert.equal(n.get('team1').value,'Team 1');assert.equal(n.get('score1').value,'0');
const oldSchedule=JSON.parse(JSON.stringify(t.run('defaultSchedule()'))).slice(0,4);oldSchedule[3].time='13:30';oldSchedule[3].fields[2]={team1:'Saved A',team2:'Saved B',score1:'15',score2:'98'};
const migrated=setup(new Map([['resolute-schedule-v1',JSON.stringify(oldSchedule)],['resolute-slot','3']]));
assert.equal(migrated.run('schedule.length'),5);assert.equal(migrated.run('JSON.stringify(schedule.slice(0,4))'),JSON.stringify(oldSchedule));assert.equal(migrated.run('slot'),3);assert.equal(migrated.run('schedule[4].time'),'14:00');
const m=migrated.nodes;m.get('edit-fields').onclick();assert.equal(m.get('edit-time-slots').children.length,5);m.get('edit-time-slots').children[4].onclick();m.get('slot-time').value='14:30';m.get('edit-field-1-team-1').value='Fifth Team';m.get('edit-form').onsubmit({preventDefault(){}});
assert.equal(migrated.run('slot'),4);assert.equal(m.get('team1').value,'Fifth Team');m.get('score1').value='7';migrated.run('saveField()');assert.match(migrated.run('message()'),/Game Time: 2:30 PM\nFifth Team: 7/);
m.get('time-slots').children[0].onclick();assert.equal(m.get('score1').value,'0');m.get('time-slots').children[4].onclick();assert.equal(m.get('score1').value,'7');
m.get('reset-fields').onclick();assert.equal(migrated.run('schedule.length'),5);assert.equal(migrated.run('schedule[4].time'),'14:00');assert.equal(migrated.run('schedule[4].fields[0].score1'),'0');
const fieldStorage=new Map([['resolute-schedule-v1',JSON.stringify(oldSchedule)]]);let ft=setup(fieldStorage),fn=ft.nodes;const priorData=ft.run('JSON.stringify(schedule)');
fn.get('edit-fields').onclick();fn.get('edit-field-1-name').value='North Turf';fn.get('edit-time-slots').children[4].onclick();assert.equal(fn.get('edit-field-1-name').value,'North Turf');fn.get('cancel-edit').onclick();assert.equal(ft.run('fieldName(1)'),'Field 1');
fn.get('edit-fields').onclick();fn.get('edit-field-1-name').value='North Turf';fn.get('edit-field-2-name').value='South Turf';fn.get('edit-form').onsubmit({preventDefault(){}});
assert.equal(ft.run('fieldName(1)'),'North Turf');assert.match(fn.get('field').options[0].textContent,/^North Turf ·/);assert.match(fn.get('score-heading').textContent,/^North Turf · 10 AM/);assert.match(ft.run('message()'),/^Lacrosse Final Score · North Turf\nGame Time: 10 AM/);assert.equal(ft.run('JSON.stringify(schedule)'),priorData);
fn.get('time-slots').children[4].onclick();assert.match(fn.get('score-heading').textContent,/^North Turf · 2 PM/);ft=setup(fieldStorage);fn=ft.nodes;assert.equal(ft.run('fieldName(2)'),'South Turf');assert.match(ft.run('message()'),/North Turf/);
fn.get('edit-fields').onclick();fn.get('edit-field-1-name').value=' ';fn.get('edit-form').onsubmit({preventDefault(){}});assert.equal(ft.run('fieldName(1)'),'North Turf');fn.get('cancel-edit').onclick();fn.get('reset-fields').onclick();assert.equal(ft.run('fieldName(1)'),'Field 1');assert.equal(fieldStorage.has('resolute-field-names'),false);
const testStore=new Map([['resolute-schedule-v1',JSON.stringify(oldSchedule)],['resolute-field-names',JSON.stringify(['North','South','A','B'])],['resolute-slot','3'],['resolute-field','2']]);const beforeTest=setup(testStore).run('JSON.stringify({schedule,fieldNames,slot,field})');let pt=setup(testStore,true),pn=pt.nodes;assert.equal(pt.run('schedule.length'),9);assert.equal(pn.get('time-slots').children.length,9);assert.equal(pt.run('schedule[0].time'),'08:30');assert.equal(pt.run('schedule[8].time'),'14:15');assert.equal(pt.run('fieldName(1)'),'East');assert.equal(pt.run('fieldName(3)'),'South');assert.equal(pt.run('schedule[7].fields[2].team1'),'Party');assert.equal(pt.run('schedule[2].fields[1].team2'),'McCord/Perry');assert.equal(pt.run('schedule[4].fields[2].team2'),'St. Charles');assert.equal(pt.run('schedule[6].fields[0].team1'),'Thomas Worthington');assert.match(pt.run('message()'),/Scheduled Activity · East/);
pn.get('time-slots').children[2].onclick();assert.match(pt.run('message()'),/Game Time: 10 AM\nEast Side All Stars: 0\nWorthington Cardinals: 0/);pt=setup(testStore,true);pn=pt.nodes;assert.equal(pt.run('schedule.length'),9);assert.equal(pt.run('slot'),2);pn.get('edit-fields').onclick();assert.equal(pn.get('edit-time-slots').children.length,9);pn.get('edit-time-slots').children[8].onclick();pn.get('slot-time').value='14:20';pn.get('edit-form').onsubmit({preventDefault(){}});assert.equal(pt.run('schedule[8].time'),'14:20');assert.equal(JSON.stringify(JSON.parse(testStore.get('resolute-test-setup-backup'))),beforeTest);pt=setup(testStore,true);assert.equal(pt.run('schedule[8].time'),'14:20');assert.equal(pt.run('slot'),8);assert(source.includes('load-test-schedule'));assert(!source.includes('restore-test-schedule'));assert(!source.includes('Load Test Schedule'));assert(!source.includes('Restore Previous Setup'));pt.nodes.get('reset-fields').onclick();assert.equal(testStore.has('resolute-test-setup-backup'),true);pt=setup(testStore,true);assert.equal(pt.run('schedule.length'),5);
assert.equal(t.run('savedPhone()'),'+1 (614) 493-8545');storage.set('resolute-phone','2025550123');assert.equal(t.run('savedPhone()'),'2025550123');storage.set('resolute-phone','');assert.equal(t.run('savedPhone()'),'+1 (614) 493-8545');
console.log('PASS: five default slots, legacy migration, independent teams/scores, editable time, no slot-name field, SMS game time, tab drafts, Cancel, Save, validation, reload, complete reset, visual-only side switching, unchanged data/SMS, side preference reload, four-slot migration, fifth-slot edits/scores/SMS/reset, editable field names/save/cancel/reload/validation/reset, shared names and unchanged team data, nine-row preset/transcription/reload/edit/automatic load once/removed buttons/retained backup, default phone/reset/preserved custom number');

const html=fs.readFileSync(require('node:path').join(__dirname,'../web/dist/index.html'),'utf8');
assert.match(html,/<button id="reset-fields" type="button" /);
assert.doesNotMatch(html,/#sideline-preview #reset-fields\{display:none!important\}/);
assert.doesNotMatch(html,/<button[^>]*id="reset"[^>]*hidden/);
console.log('Main reset visible; game-clock reset retained');

const webStorage=new Map([['resolute-picture-loaded-v327','true']]);
let web=setup(webStorage,true,'?load-schedule=test-20261011');
assert.equal(web.run('schedule.length'),9);
assert.equal(web.run('fieldNames[0]'),'East');
assert.equal(JSON.parse(webStorage.get('resolute-web-schedule-backup')).schedule.length,5);
web.nodes.get('score1').value='17';web.run('saveField()');
web=setup(webStorage,true,'?load-schedule=test-20261011');assert.equal(web.nodes.get('score1').value,'17');
const untouched=setup(new Map([['resolute-picture-loaded-v327','true']]),true);assert.equal(untouched.run('schedule.length'),5);
console.log('PASS: explicit web link loads schedule once; preserves later edits and other app stores');

const adjustStorage=new Map();let adj=setup(adjustStorage),an=adj.nodes;
an.get('score1-plus').onclick();assert.equal(an.get('score1').value,'1');assert.equal(an.get('score2').value,'0');
an.get('score2-plus').onclick();an.get('score2-plus').onclick();assert.equal(an.get('score2').value,'2');
an.get('score1-minus').onclick();an.get('score1-minus').onclick();assert.equal(an.get('score1').value,'0');assert.equal(an.get('score1-minus').disabled,true);
an.get('score2-minus').onclick();assert.equal(an.get('score2').value,'1');assert.match(adj.run('message()'),/Team 2: 1/);
an.get('switch-teams').onclick();an.get('score1-plus').onclick();assert.equal(an.get('score1').value,'1');assert.equal(an.get('score2').value,'1');
adj=setup(adjustStorage);an=adj.nodes;assert.equal(an.get('score1').value,'1');assert.equal(an.get('score2').value,'1');
an.get('time-slots').children[1].onclick();an.get('score1-plus').onclick();an.get('score1-plus').onclick();assert.equal(an.get('score1').value,'2');
an.get('time-slots').children[0].onclick();assert.equal(an.get('score1').value,'1');
adj.run('field=2;loadField()');an.get('score2-plus').onclick();assert.equal(an.get('score2').value,'1');
adj.run('field=1;loadField()');assert.equal(an.get('score1').value,'1');assert.equal(an.get('score2').value,'1');
an.get('score1').value='98';adj.run('saveField();updateScoreControls()');an.get('score1-plus').onclick();assert.equal(an.get('score1').value,'99');
an.get('score1').value='';an.get('score1-minus').onclick();assert.equal(an.get('score1').value,'0');
adj.run("schedule[slot].fields[field-1].activity=true;updateScoreControls()");
assert.equal(an.get('score1-plus').disabled,true);assert.equal(an.get('score2-minus').disabled,true);
an.get('score1-plus').onclick();assert.equal(an.get('score1').value,'0');
assert.match(html,/class="score-adjust"/);for(const id of['score1-plus','score1-minus','score2-plus','score2-minus'])assert(html.includes('id="'+id+'"'));
console.log('PASS: independent score +/- buttons, zero floor, swapped sides, SMS, slots, fields, reload, typed values, and activity guard');

for(const side of[1,2]){
 const group=html.match(new RegExp('<div class="score-adjust"[^>]*>([\\s\\S]*?)</div>','g'))[side-1];
 assert(group.indexOf('id="score'+side+'-minus"')<group.indexOf('id="score'+side+'"'));
 assert(group.indexOf('id="score'+side+'"')<group.indexOf('id="score'+side+'-plus"'));
 assert(group.includes('>↓</button>'));assert(group.includes('>↑</button>'));
}
assert(!html.includes('class="score-controls"'));
console.log('PASS: down arrow left and up arrow right inside both score boxes');

assert.match(html,/#sideline-preview \.score-adjust \.score-arrow\{[^}]*width:44px;min-height:24px;height:24px;[^}]*border-radius:5px;background:#2d2d2d;[^}]*font-size:20px;font-weight:900;/);
assert(!html.includes('.score-arrow::before'));
console.log('PASS: score arrows use half-height gray buttons with bold symbols');

const manualStore=new Map();let manual=setup(manualStore),mn=manual.nodes;
mn.get('score1').value='9';manual.run('saveField()');manual.c.confirm=()=>false;mn.get('load-test-schedule').onclick();assert.equal(manual.run('schedule.length'),5);assert.equal(mn.get('score1').value,'9');assert(!manualStore.has('resolute-manual-schedule-backup'));
manual.c.confirm=()=>true;mn.get('load-test-schedule').onclick();assert.equal(manual.run('schedule.length'),9);assert.equal(manual.run('fieldNames[0]'),'East');assert.equal(JSON.parse(manualStore.get('resolute-manual-schedule-backup')).schedule[0].fields[0].score1,'9');
mn.get('time-slots').children[2].onclick();mn.get('score1-plus').onclick();assert.equal(mn.get('score1').value,'1');manual=setup(manualStore,true);assert.equal(manual.nodes.get('score1').value,'1');assert.equal(manual.run('slot'),2);
manual.nodes.get('load-test-schedule').onclick();assert.equal(manual.run('slot'),0);assert.equal(manual.run('schedule[2].fields[0].score1'),'0');assert.equal(JSON.parse(manualStore.get('resolute-manual-schedule-backup')).schedule[2].fields[0].score1,'1');
console.log('PASS: visible Load Schedule button, cancel, backup, preset reload, repeat loading, and saved-score preservation on normal startup');

const importStore=new Map();let imp=setup(importStore);imp.nodes.get('score1').value='7';imp.run('saveField()');
const I=require('../web/dist/schedule-import.js'),candidate=I.parseRows([['Time','East'],['10 AM','A v B'],['11 AM','C v D'],['12 PM','E v F'],['1 PM','G v H']]);
imp.c.candidate=candidate;imp.c.confirm=()=>false;assert.equal(imp.run('applyImportedSchedule(candidate)'),false);assert.equal(imp.run('schedule.length'),5);assert(!importStore.has('resolute-import-backup'));
imp.c.confirm=()=>true;assert.equal(imp.run('applyImportedSchedule(candidate)'),true);assert.equal(JSON.parse(importStore.get('resolute-import-backup')).schedule[0].fields[0].score1,'7');
assert.equal(imp.run('schedule.length'),4);imp=setup(importStore,true);assert.equal(imp.run('schedule.length'),4);assert.equal(imp.nodes.get('team1').value,'A');assert.equal(imp.run('fieldNames[0]'),'East');
const one=I.parseRows([['Time','Field','Team 1','Team 2'],['8 AM','Field A','Home','Away']]);imp.c.candidate=one;imp.run('applyImportedSchedule(candidate)');imp=setup(importStore,true);assert.equal(imp.run('schedule.length'),1);
console.log('PASS: import apply/cancel/backup and exact 1- or 4-slot persistence without legacy migration or auto-preset overwrite');
