(()=>{const endpoint='https://resolute-sideline.truecoot2.chatgpt.site/api/results',queueKey='resolute-score-outbox-v1',lastKey='resolute-score-sync-time';
let active=null,lastError='';const load=()=>{try{const rows=JSON.parse(localStorage.getItem(queueKey)||'[]');return Array.isArray(rows)?rows:[]}catch{return[]}};
const notify=()=>window.dispatchEvent(new CustomEvent('resolute-results-sync'));
function status(){let lastSynced=null;try{lastSynced=localStorage.getItem(lastKey)}catch{}return{pending:load().length,error:lastError,lastSynced}}
async function flush(){
 if(active)return active;
 active=(async()=>{for(const queued of load()){
  try{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);let response;
   try{response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(queued),keepalive:true,signal:controller.signal})}finally{clearTimeout(timer)}
   const data=await response.json();if(!response.ok||!data.saved)throw Error(data.error||'Unable to sync result.');
   localStorage.setItem(queueKey,JSON.stringify(load().filter(r=>r.submissionId!==queued.submissionId)));localStorage.setItem(lastKey,new Date().toISOString());lastError='';
  }catch(e){lastError=e.name==='AbortError'?'Connection timed out. Report saved on this device for retry.':e.message;break}
 }})().finally(()=>{active=null;notify()});return active;
}
function record(payload){
 const report={...payload,source:'sideline',submissionId:crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)};
 normalizeReport(report,scheduleGames);
 const rows=load();if(rows.length>=500)throw Error('The pending report queue is full. Connect to the internet and sync first.');
 localStorage.setItem(queueKey,JSON.stringify([...rows,report]));lastError='';notify();void flush();return report.submissionId;
}
window.ResoluteResultsLink={record,flush,status};
window.addEventListener('online',()=>void flush());window.addEventListener('pageshow',()=>void flush());document.addEventListener('visibilitychange',()=>{if(!document.hidden)void flush()});setInterval(()=>{if(!document.hidden&&load().length)void flush()},30000);void flush();
})();
