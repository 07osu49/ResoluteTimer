const assert=require('node:assert/strict'),I=require('../web/dist/schedule-import.js');
global.document={baseURI:'https://local.test/assets/',createElement:()=>({width:0,height:0,getContext:()=>({})})};
const viewport={scale:1,width:600,height:400,convertToViewportPoint:(x,y)=>[x,400-y]};
function items(time,header=true){return [...(header?[['Time',10,380],['East',150,380],['West',350,380]]:[]),[time,10,340],['A v B',150,340],['C v D',350,340]].map(([str,x,y])=>({str,width:60,height:12,transform:[12,0,0,12,x,y]}))}
let destroyed=0,rendered=0,terminated=0,current=[],pages=2,scanned=false,bad=false;
global.ResolutePDFJS={GlobalWorkerOptions:{},getDocument(options){assert(options.data instanceof Uint8Array);assert.equal(options.enableXfa,false);return{promise:Promise.resolve({numPages:pages,getPage:async n=>({getViewport:()=>viewport,getTextContent:async()=>({items:scanned?[]:items(n===1?'10 AM':'11 AM',n===1)}),render:()=>{rendered++;return{promise:Promise.resolve()}},cleanup(){}})}),destroy:async()=>{destroyed++}}}};
global.Tesseract={createWorker:async()=>({setParameters:async()=>{},recognize:async()=>{if(bad)throw Error('Unreadable scan');return{data:I.pdfTextData(items('10 AM'),viewport)}},terminate:async()=>{terminated++}})};
const file={arrayBuffer:async()=>new ArrayBuffer(2)};
(async()=>{
 const rows=await I.readPDF(file,()=>{}),parsed=I.parseRows(rows);assert.equal(parsed.schedule.length,2);assert.equal(parsed.schedule[1].time,'11:00');assert.equal(parsed.schedule[1].fields[1].team2,'D');assert.equal(destroyed,1);assert.equal(rendered,0);
 pages=21;await assert.rejects(()=>I.readPDF(file,()=>{}),/20 pages/);assert.equal(destroyed,2);
 pages=1;scanned=true;const scan=I.parseRows(await I.readPDF(file,()=>{}));assert.equal(scan.schedule[0].fields[0].team1,'A');assert.equal(rendered,1);assert.equal(terminated,1);
 bad=true;await assert.rejects(()=>I.readPDF(file,()=>{}),/PDF page 1: Unreadable scan/);assert.equal(terminated,2);assert.equal(destroyed,4);
 console.log('PASS: positioned PDF text, multiple pages with inherited headings, scan rendering/OCR fallback, page limit, page-specific errors and cleanup');
})().catch(e=>{console.error(e);process.exitCode=1});
