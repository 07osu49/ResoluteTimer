(function(root){
'use strict';
const LIMIT=100;
const clean=v=>String(v??'').trim();
const key=v=>clean(v).toLowerCase().replace(/[^a-z0-9]/g,'');
const blank=()=>({team1:'—',team2:'—',score1:'0',score2:'0',activity:true});
function timeValue(value){
 const text=clean(value).replace(/\./g,'').replace(/\s+/g,' ');
 if(/^(?:0?\.\d+)$/.test(clean(value))){const minutes=Math.round(Number(value)*1440);if(minutes>=0&&minutes<1440)return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')}
 const m=text.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(AM|PM)?$/i);
 if(!m)return null;
 let h=+m[1],n=+(m[2]||0);if(n>59)return null;
 if(m[3]){if(h<1||h>12)return null;h=h%12+(m[3].toUpperCase()==='PM'?12:0)}else if(h>23)return null;
 return String(h).padStart(2,'0')+':'+String(n).padStart(2,'0');
}
function parseDelimited(text){
 text=String(text).replace(/^\uFEFF/,'');
 const first=text.split(/\r?\n/).slice(0,4).join('\n');
 const delimiter=first.includes('\t')?'\t':(first.split(';').length>first.split(',').length?';':',');
 let rows=[],row=[],value='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++}else if(quoted||value==='')quoted=!quoted;else value+=c}
  else if(!quoted&&c===delimiter){row.push(value);value=''}
  else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);if(row.some(v=>clean(v)))rows.push(row);row=[];value=''}
  else value+=c;
 }
 if(quoted)throw Error('A quoted CSV cell is not closed. Check the file or edit the text below.');
 row.push(value);if(row.some(v=>clean(v)))rows.push(row);
 if(rows.length>501)throw Error('Import at most 500 rows at a time.');
 return rows;
}
function toCSV(rows){return rows.map(row=>row.map(v=>'"'+clean(v).replace(/"/g,'""')+'"').join(',')).join('\n')}
function named(value,what){const v=clean(value);if(!v||v.length>60)throw Error(what+' must contain 1–60 characters.');return v}
function score(value){const v=clean(value);if(!v)return '0';if(!/^\d+$/.test(v)||!Number.isSafeInteger(+v))throw Error('Scores must be whole numbers of zero or more.');return String(+v)}
function matchup(value){
 const text=clean(value);if(!text)return blank();
 const parts=text.split(/\s+(?:v\.?|vs\.?|versus)\s+/i);
 if(parts.length===2)return{team1:named(parts[0],'Team name'),team2:named(parts[1],'Team name'),score1:'0',score2:'0'};
 return{team1:named(text,'Activity or matchup'),team2:'—',score1:'0',score2:'0',activity:true};
}
function parseRows(input){
 const rows=input.map(r=>r.map(clean)).filter(r=>r.some(Boolean));
 if(!rows.length)throw Error('No schedule rows found.');
 let headerIndex=rows.findIndex((r,i)=>i<20&&r.some(v=>['time','start','starttime','gametime'].includes(key(v))));
 if(headerIndex<0)throw Error('Add a header row: Time, East, West, South; or Time, Field, Team 1, Team 2.');
 const headers=rows[headerIndex],keys=headers.map(key),ti=keys.findIndex(v=>['time','start','starttime','gametime'].includes(v));
 const fi=keys.findIndex(v=>['field','fieldname','location','court'].includes(v));
 const a=keys.findIndex(v=>['team1','home','hometeam'].includes(v)),b=keys.findIndex(v=>['team2','away','awayteam'].includes(v));
 const mi=keys.findIndex(v=>['matchup','game','activity','teams'].includes(v));
 const s1=keys.findIndex(v=>['score1','homescore'].includes(v)),s2=keys.findIndex(v=>['score2','awayscore'].includes(v));
 const long=fi>=0&&(a>=0||mi>=0),names=[],slots=new Map(),occupied=new Set();
 const wide=long?[]:headers.map((h,i)=>({h,i})).filter(x=>x.i!==ti&&x.h&&!['date','day','notes','note'].includes(key(x.h)));
 if(!long&&(!wide.length||wide.length>4))throw Error('A wide schedule must have Time plus 1–4 field columns.');
 if(!long)wide.forEach(x=>names.push(named(x.h,'Field name')));
 if(new Set(names.map(key)).size!==names.length)throw Error('Field names must be unique.');
 let count=0;
 for(let ri=headerIndex+1;ri<rows.length;ri++){
  const row=rows[ri];if(row.map(key).join('|')===keys.join('|'))continue;
  const time=timeValue(row[ti]);if(!time)throw Error('Row '+(ri+1)+': use a time such as 10:00 AM or 13:00.');
  let slot=slots.get(time);if(!slot){if(slots.size>=LIMIT)throw Error('Import at most 100 time slots.');slot={name:'',time,fields:Array.from({length:4},blank)};slots.set(time,slot)}
  if(long){
   const fieldName=named(row[fi],'Field name');let index=names.findIndex(n=>key(n)===key(fieldName));
   if(index<0){if(names.length===4)throw Error('Sideline Control supports up to four fields.');index=names.push(fieldName)-1}
   const id=time+'|'+index;if(occupied.has(id))throw Error('Duplicate game at '+time+' on '+fieldName+'.');occupied.add(id);
   if(a>=0){const t1=clean(row[a]),t2=b>=0?clean(row[b]):'';slot.fields[index]=t1?{team1:named(t1,'Team 1'),team2:t2?named(t2,'Team 2'):'—',score1:score(s1>=0?row[s1]:''),score2:score(s2>=0?row[s2]:''),...(!t2?{activity:true}:{})}:blank()}
   else slot.fields[index]=matchup(row[mi]);
   count++;
  }else{
   for(let i=0;i<wide.length;i++){const id=time+'|'+i;if(occupied.has(id))throw Error('Duplicate time slot '+time+'.');occupied.add(id);slot.fields[i]=matchup(row[wide[i].i]);count++}
  }
 }
 if(!slots.size)throw Error('No games found below the header row.');
 const usedFields=names.length;while(names.length<4){let n='Unused '+(names.length+1);while(names.includes(n))n+=' ';names.push(n)}
 return{schedule:[...slots.values()].sort((a,b)=>a.time.localeCompare(b.time)),fieldNames:names,usedFields,count};
}
function ocrRows(data){
 const words=[];for(const block of data.blocks||[])for(const p of block.paragraphs||[])for(const l of p.lines||[])for(const w of l.words||[])if(clean(w.text)&&w.bbox)words.push(w);
 if(!words.length)throw Error('No readable text found. Try a sharper, straight-on photo or use CSV/Excel.');
 const heights=words.map(w=>w.bbox.y1-w.bbox.y0).sort((a,b)=>a-b),tolerance=Math.max(4,heights[Math.floor(heights.length/2)]*.65);
 const lines=[];for(const w of words.sort((a,b)=>(a.bbox.y0+a.bbox.y1)-(b.bbox.y0+b.bbox.y1))){const y=(w.bbox.y0+w.bbox.y1)/2;let line=lines.find(l=>Math.abs(l.y-y)<=tolerance);if(!line){line={y,words:[]};lines.push(line)}line.words.push(w)}
 for(const l of lines)l.words.sort((a,b)=>a.bbox.x0-b.bbox.x0);
 const header=lines.find(l=>l.words.some(w=>['time','starttime'].includes(key(w.text))));
 if(!header)throw Error('Could not find the Time header. Include the column headings in the photo.');
 const heads=[];for(const w of header.words){if(/^\d+$/.test(w.text)&&heads.length)heads[heads.length-1].name+=' '+w.text;else heads.push({name:clean(w.text),x:w.bbox.x0})}
 if(heads.length<2||heads.length>5)throw Error('Could not identify 1–4 field columns. Crop to the schedule table and try again.');
 const result=[heads.map(h=>h.name)];
 for(const line of lines.filter(l=>l.y>header.y+tolerance)){
  const cells=heads.map(()=>[]);
  for(const w of line.words){let col=0;for(let i=1;i<heads.length;i++)if(w.bbox.x0>=heads[i].x-8)col=i;cells[col].push(w.text)}
  const row=cells.map(c=>c.join(' ').replace(/[|\[\]_]/g,' ').replace(/\s+/g,' ').trim());
  const prefix=row[0].match(/^(\d{1,2}:\d{2}(?::\d{2})?\s*[AP]M)/i);
  if(prefix){const rest=row[0].slice(prefix[0].length).trim().replace(/^I$/,'');row[0]=prefix[0];if(rest&&row.length>1)row[1]=(rest+' '+row[1]).trim()}
  if(timeValue(row[0]))result.push(row);
  else if(result.length>1){for(let i=1;i<row.length;i++)if(row[i])result[result.length-1][i]+=' '+row[i]}
 }
 if(result.length<2)throw Error('No timed rows recognized. Try a clearer photo, or enter the rows in the text box.');
 return result;
}
const scripts=new Map();
function loadScript(path,global){if(root[global])return Promise.resolve(root[global]);if(!scripts.has(path))scripts.set(path,new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(path,document.baseURI).href;s.onload=()=>resolve(root[global]);s.onerror=()=>{scripts.delete(path);s.remove();reject(Error('Could not load the local import tools. Reload the app and try again.'))};document.head.append(s)}));return scripts.get(path)}
async function recognizePhoto(file,status){
 const T=await loadScript('vendor/tesseract.min.js','Tesseract');
 const image=new Image(),url=URL.createObjectURL(file);let worker;
 try{
  image.src=url;await image.decode();
  const scale=Math.min(2,2200/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);
  const c=canvas.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,canvas.width,canvas.height);c.drawImage(image,0,0,canvas.width,canvas.height);
  worker=await T.createWorker('eng',1,{workerPath:new URL('vendor/worker.min.js',document.baseURI).href,corePath:new URL('vendor/tesseract-core-lstm.wasm.js',document.baseURI).href,langPath:new URL('vendor',document.baseURI).href,gzip:false,workerBlobURL:false,cacheMethod:'none',logger:m=>status(m.status+(m.progress!=null?' '+Math.round(m.progress*100)+'%':''))});
  await worker.setParameters({tessedit_pageseg_mode:'3',preserve_interword_spaces:'1'});
  const result=await worker.recognize(canvas,{}, {text:true,blocks:true});
  return ocrRows(result.data);
 }finally{URL.revokeObjectURL(url);if(worker)await worker.terminate()}
}
let dialog;
function node(tag,text,parent){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(parent)parent.append(n);return n}
function open(options){
 if(dialog){dialog.showModal();return}
 dialog=node('dialog');dialog.id='import-dialog';dialog.setAttribute('aria-labelledby','import-title');document.getElementById('sideline-preview').append(dialog);
 const title=node('h2','Import schedule',dialog);title.id='import-title';
 node('p','Choose CSV, Excel (.xlsx/.xls), or a clear photo of a schedule table. Files are processed on this device.',dialog);
 const label=node('label','Schedule file',dialog),file=node('input',null,dialog);file.type='file';file.id='schedule-file';label.htmlFor=file.id;file.accept='.csv,.tsv,.xlsx,.xls,image/*';
 const sheetLabel=node('label','Excel worksheet',dialog),sheet=node('select',null,dialog);sheet.id='import-sheet';sheetLabel.htmlFor=sheet.id;sheetLabel.hidden=sheet.hidden=true;
 const status=node('p','',dialog);status.id='import-status';status.setAttribute('role','status');
 const textLabel=node('label','Review or correct the extracted CSV text',dialog),text=node('textarea',null,dialog);text.id='import-text';textLabel.htmlFor=text.id;text.rows=8;text.spellcheck=false;text.placeholder='Time,East,West,South\n10:00 AM,Team A v Team B,Team C v Team D,Training';
 node('p','Use AM/PM or 24-hour times. Photos may misread names or columns: check every row. Up to 100 time slots and four fields.',dialog);
 const previewButton=node('button','Preview Schedule',dialog);previewButton.type='button';
 const preview=node('div',null,dialog);preview.className='import-preview';
 const actions=node('div',null,dialog);actions.className='dialog-actions';const cancel=node('button','Cancel',actions),apply=node('button','Use Schedule',actions);cancel.type=apply.type='button';apply.disabled=true;
 let draft=null,workbook=null,busy=false;
 function busyState(value){busy=value;text.disabled=file.disabled=sheet.disabled=previewButton.disabled=cancel.disabled=value;if(value)apply.disabled=true}
 function build(){draft=null;apply.disabled=true;preview.replaceChildren();try{draft=parseRows(parseDelimited(text.value));const summary=node('p',draft.schedule.length+' time slots · '+draft.usedFields+' fields',preview);summary.className='import-summary';const table=node('table',null,preview),head=node('tr',null,table);for(const h of['Time',...draft.fieldNames.slice(0,draft.usedFields)])node('th',h,head);for(const slot of draft.schedule){const row=node('tr',null,table);node('td',slot.time,row);for(const f of slot.fields.slice(0,draft.usedFields))node('td',f.activity?f.team1:f.team1+' v '+f.team2,row)}apply.disabled=false;status.textContent='Preview ready. Check times, fields, teams, and activities before using this schedule.'}catch(e){status.textContent=e.message}}
 function worksheet(){const rows=root.XLSX.utils.sheet_to_json(workbook.Sheets[sheet.value],{header:1,raw:false,defval:''});text.value=toCSV(rows);build()}
 text.oninput=()=>{draft=null;apply.disabled=true;preview.replaceChildren();status.textContent='Text changed. Preview again before applying.'};sheet.onchange=worksheet;previewButton.onclick=build;
 cancel.onclick=()=>dialog.close();dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
 apply.onclick=()=>{if(!draft||busy)return;if(options.apply(draft)!==false)dialog.close()};
 file.onchange=async()=>{
  const selected=file.files[0];if(!selected)return;if(selected.size>15*1024*1024){status.textContent='Choose a file smaller than 15 MB.';file.value='';return}
  busyState(true);draft=null;preview.replaceChildren();text.value='';sheet.hidden=sheetLabel.hidden=true;status.textContent='Reading schedule…';
  try{
   if(/\.(csv|tsv)$/i.test(selected.name)){text.value=await selected.text();build()}
   else if(/\.(xlsx|xls)$/i.test(selected.name)){const X=await loadScript('vendor/xlsx.full.min.js','XLSX');workbook=X.read(await selected.arrayBuffer(),{type:'array',cellFormula:false,cellHTML:false,cellStyles:false,sheetRows:502});sheet.replaceChildren();for(const name of workbook.SheetNames){const o=node('option',name,sheet);o.value=name}if(!workbook.SheetNames.length)throw Error('This workbook has no worksheets.');sheet.value=workbook.SheetNames[0];sheet.hidden=sheetLabel.hidden=workbook.SheetNames.length<2;worksheet()}
   else if(selected.type.startsWith('image/')||/\.(png|jpe?g|webp|heic|heif)$/i.test(selected.name)){const rows=await recognizePhoto(selected,msg=>status.textContent=msg);text.value=toCSV(rows);build()}
   else throw Error('Choose CSV, XLSX, XLS, or a photo.');
  }catch(e){status.textContent='Import not applied: '+(e.message||'Unable to read this file. Try CSV or a JPEG/PNG photo.');apply.disabled=true}
  finally{busyState(false);apply.disabled=!draft;file.value=''}
 };
 dialog.showModal();
}
const api={timeValue,parseDelimited,toCSV,parseRows,ocrRows,open};
if(typeof module==='object'&&module.exports)module.exports=api;else root.ResoluteScheduleImport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
