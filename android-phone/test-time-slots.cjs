const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../web/dist/app.js'),'utf8');
const section=source.slice(source.indexOf('let field=1;'),source.indexOf("$('#field').onchange="));
function setup(storage){
 const nodes=new Map();
 class Element{
  constructor(tag='div'){this.tag=tag;this.children=[];this.value='';this.textContent='';this.valid=true;this.options=Array.from({length:4},()=>({}));}
  set id(v){this._id=v;nodes.set(v,this)} get id(){return this._id}
  append(...v){this.children.push(...v)} replaceChildren(){this.children=[]}
  before(){} after(){} closest(){return new Element()}
  querySelector(){return new Element()}
  setAttribute(k,v){this[k]=v} setCustomValidity(v){this.valid=!v}
  reportValidity(){return this.valid&&(!this.required||!!this.value)}
  showModal(){this.open=true} close(){this.open=false}
 }
 for(const id of ['field','team1','team2','score1','score2','phone','team1-label','team2-label','score1','score2','score-heading','message-title','edit-form','edit-dialog','edit-team-fields','edit-fields','cancel-edit','reset-fields','slot-time','custom-periods','custom-minutes','note']){const e=new Element();e.id=id;}
 for(let i=1;i<=2;i++){nodes.get('team'+i).value='Team '+i;nodes.get('score'+i).value='0'}
 nodes.get('slot-time').required=true;
 const c=vm.createContext({console,state:{},render(){},alert(){},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{createElement:t=>new Element(t),head:new Element()},$:s=>nodes.get(s.slice(1))});
 vm.runInContext(section,c);vm.runInContext(source.slice(source.indexOf('function message(){'),source.indexOf('function render(){')),c);vm.runInContext('loadField()',c);
 return {c,nodes,run:s=>vm.runInContext(s,c)};
}
const storage=new Map([['resolute-field-score-1',JSON.stringify({team1:'Original A',team2:'Original B',score1:'16',score2:'9'})]]);
let t=setup(storage),n=t.nodes;
assert.equal(n.get('team1').value,'Original A');
assert.equal(n.get('time-slots').children.length,4);
assert.equal(t.run('timeLabel(schedule[0].time)'),'10 AM');
assert.equal(t.run('timeLabel(schedule[3].time)'),'1 PM');
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
t=setup(storage);n=t.nodes;assert.equal(n.get('team1').value,'Slot 2 A');assert.equal(n.get('score1').value,'98');
n.get('edit-fields').onclick();n.get('edit-field-1-team-1').value=' ';n.get('edit-time-slots').children[0].onclick();assert.equal(t.run('editSlot'),1);n.get('cancel-edit').onclick();
n.get('phone').value='2025550123';n.get('reset-fields').onclick();assert.equal(n.get('phone').value,'');assert.equal(t.run('slot'),0);assert.equal(t.run('schedule[1].time'),'11:00');assert.equal(n.get('team1').value,'Team 1');assert.equal(n.get('score1').value,'0');
console.log('PASS: four default slots, legacy migration, independent teams/scores, editable time, no slot-name field, SMS game time, tab drafts, Cancel, Save, validation, reload, complete reset');
