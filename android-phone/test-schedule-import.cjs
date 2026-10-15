const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const I=require('../web/dist/schedule-import.js');
assert.equal(I.timeValue('12:00:00 PM'),'12:00');assert.equal(I.timeValue('12 AM'),'00:00');assert.equal(I.timeValue('1:30 PM'),'13:30');assert.equal(I.timeValue('25:00'),null);
const csv='Time,East,West,South\r\n10:00 AM,"East Side All Stars v Worthington Cardinals",Olentangy Berkshire v McCord/Perry,Training\r\n1:30 PM,"A, Inc. v B",Girls,Party';
const rows=I.parseDelimited(csv),s=I.parseRows(rows);assert.equal(s.schedule.length,2);assert.equal(s.schedule[0].fields[0].team2,'Worthington Cardinals');assert.equal(s.schedule[0].fields[1].team1,'Olentangy Berkshire');assert.equal(s.schedule[1].fields[0].team1,'A, Inc.');assert(s.schedule[1].fields[2].activity);assert.deepEqual(I.parseDelimited(I.toCSV(rows)),rows);
const long=I.parseRows([['Time','Field','Team 1','Team 2','Score 1','Score 2'],['10 AM','East','A','B','16','9'],['10 AM','West','C','D','',''],['11 AM','East','E','F','0','0']]);assert.equal(long.schedule.length,2);assert.equal(long.schedule[0].fields[0].score1,'16');assert.equal(long.schedule[0].fields[1].team2,'D');
assert.throws(()=>I.parseRows([['Time','East'],['10 AM','A v B'],['10 AM','C v D']]),/Duplicate/);
assert.throws(()=>I.parseRows([['Time','Field','Team 1','Team 2'],...Array.from({length:5},(_,i)=>['10 AM','Field '+i,'A','B'])]),/four fields/);
assert.throws(()=>I.parseRows([['Time','East'],['bad','A v B']]),/Row 2/);assert.throws(()=>I.parseDelimited('Time,East\n"oops'),/not closed/);
assert.throws(()=>I.parseRows([['Time','Field','Team 1','Team 2','Score 1'],['10 AM','A','B','C','-1']]),/Scores/);
const X=require('../web/dist/vendor/xlsx.full.min.js');const book=X.utils.book_new();X.utils.book_append_sheet(book,X.utils.aoa_to_sheet(rows),'Schedule');for(const bookType of ['xlsx','xls']){const bytes=X.write(book,{bookType,type:'buffer'}),read=X.read(bytes,{type:'buffer'});const parsed=I.parseRows(X.utils.sheet_to_json(read.Sheets.Schedule,{header:1,raw:false,defval:''}));assert.equal(parsed.schedule[0].fields[1].team2,'McCord/Perry')}
function word(text,x,y,w=20){return{text,bbox:{x0:x,x1:x+w,y0:y,y1:y+10}}}
const data={blocks:[{paragraphs:[{lines:[{words:[word('Time',5,0),word('East',100,0),word('West',300,0)]},{words:[word('10:00',5,30),word('AM',45,30),word('A',100,30),word('v',125,30),word('B',145,30),word('C',300,30),word('v',325,30),word('D',345,30)]}]}]}]};
assert.equal(I.parseRows(I.ocrRows(data)).schedule[0].fields[1].team2,'D');assert.throws(()=>I.ocrRows({blocks:[]}),/No readable text/);
console.log('PASS: CSV quoting/roundtrip, wide and long tables, AM/PM, activities, scores, duplicates, limits, real XLSX/XLS roundtrip, and OCR word coordinates');
assert.equal(I.timeValue('0.5'),'12:00');
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.value='';this.disabled=false;this.textContent=''}
 append(...children){this.children.push(...children)}replaceChildren(){this.children=[]}setAttribute(k,v){this[k]=v}addEventListener(){}showModal(){this.isOpen=true}close(){this.isOpen=false}
}
const surface=new Element('main'),head=new Element('head');global.document={createElement:t=>new Element(t),head,getElementById:()=>surface};
function find(predicate,root=surface){if(predicate(root))return root;for(const child of root.children){const result=find(predicate,child);if(result)return result}}
(async()=>{
 let applied=null;I.open({apply:value=>{applied=value;return true}});const dialog=find(n=>n.id==='import-dialog'),file=find(n=>n.id==='schedule-file');file.files=[{name:'schedule.csv',size:csv.length,text:async()=>csv}];await file.onchange();
 const apply=find(n=>n.textContent==='Use Schedule');assert.equal(apply.disabled,false);assert.equal(applied,null);assert.equal(dialog.isOpen,true);
 const text=find(n=>n.id==='import-text');text.value='Time,East\nwrong,A v B';text.oninput();assert.equal(apply.disabled,true);find(n=>n.textContent==='Preview Schedule').onclick();assert.equal(apply.disabled,true);assert.equal(applied,null);
 text.value='Time,East\n10 AM,A v B';text.oninput();find(n=>n.textContent==='Preview Schedule').onclick();assert.equal(apply.disabled,false);apply.onclick();assert.equal(applied.schedule[0].fields[0].team1,'A');assert.equal(dialog.isOpen,false);
 console.log('PASS: import dialog reads CSV, previews without mutation, invalidates edits, blocks invalid time, and applies only on explicit Use Schedule');
})().catch(e=>{console.error(e);process.exitCode=1});
