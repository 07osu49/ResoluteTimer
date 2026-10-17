import {divisions,roster,standings,winner,placeholder,key} from '/results-core.mjs';
import {placementGames,bracketGroups,bracketParticipant} from '/results-brackets.mjs';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data=null,division='all',search='',currentGame=null,loading=false,refreshRevision=0,view=location.hash==='#unsubmitted'?'unsubmitted':location.hash==='#brackets'?'brackets':'standings',teamChoices='';
const time=t=>{const[h,m]=t.split(':').map(Number);return(h%12||12)+':'+String(m).padStart(2,'0')+' '+(h<12?'AM':'PM')};
const ordinal=n=>n+((n%100>=11&&n%100<=13)?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th'));
const stamp=t=>new Date(t).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
function showOutbox(){const s=window.ResoluteResultsLink?.status();$('#outbox-status').textContent=s?.pending?s.pending+' report(s) waiting to sync on this device.'+(s.error?' '+s.error:''):''}
async function refresh(){if(loading)return;loading=true;const revision=refreshRevision;try{const r=await fetch('/api/results',{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to load results');if(revision!==refreshRevision)return;data=d;render();$('#global-status').textContent='Shared results · Updated '+stamp(d.updatedAt);$('#global-status').className='';}catch(e){$('#global-status').textContent=e.message+(data?' · Showing last loaded results.':'');$('#global-status').className='offline';if(!data)$('#content').innerHTML='<div class="error">Results are unavailable. Select Refresh to retry.</div>'}finally{loading=false;showOutbox()}}

function bracketCard(game){
 const r=data.results[game.id],w=winner(r),a=bracketParticipant(data.games,data.results,game,1),b=bracketParticipant(data.games,data.results,game,2);
 return '<article class="bracket-card"><div class="bracket-card-head"><strong>'+esc(game.code)+'</strong><span>'+time(game.time)+' · Field '+game.field+'</span></div>'+[a,b].map((team,i)=>'<div class="bracket-team '+(w===team?'bracket-winner':'')+'"><div><strong>'+esc(team)+'</strong>'+(team!==game['team'+(i+1)]?'<small>'+esc(game['team'+(i+1)])+'</small>':'')+'</div><b>'+(r?r['score'+(i+1)]:'—')+'</b></div>').join('')+'<div class="bracket-card-foot"><span>'+(r?w==='Tie'?'Tie · Winner Pending':'Final':placeholder(a)||placeholder(b)?'Teams Pending':'Ready to Play')+'</span><button class="mini" type="button" data-game="'+esc(game.id)+'">'+(r?'Correct':'Record')+'</button></div></article>';
}
function renderBrackets(ds){
 const match=game=>!search||[game.team1,game.team2,bracketParticipant(data.games,data.results,game,1),bracketParticipant(data.games,data.results,game,2)].some(t=>key(t)===key(search));
 return ds.map(d=>{
  const games=placementGames(data.games,d);if(!games.length)return'';
  const groups=bracketGroups(data.games,d),paths=groups.paths.filter(p=>p.nodes.some(n=>match(n.game))),singles=groups.singles.filter(match);
  if(!paths.length&&!singles.length)return'';
  return '<section class="division"><div class="division-head"><h2>'+esc(d)+'</h2><span class="muted">'+games.length+' Placement / Bracket Games</span></div>'+paths.map(path=>{
   const byId=new Map(path.nodes.map(n=>[n.game.id,n]));
   const lines=path.edges.map(e=>{const a=byId.get(e.from),b=byId.get(e.to),x=a.x+270,y=a.y+90,end=b.y+(e.side===1?65:107),mid=x+30;return '<path d="M '+x+' '+y+' H '+mid+' V '+end+' H '+b.x+'"/>'}).join('');
   return '<div class="bracket-scroll" role="region" aria-label="'+esc(d)+' winner progression" tabindex="0"><div class="bracket-board" style="width:'+path.width+'px;height:'+path.height+'px"><svg class="bracket-lines" width="'+path.width+'" height="'+path.height+'" aria-hidden="true">'+lines+'</svg>'+path.nodes.map(n=>'<div class="bracket-node" style="left:'+n.x+'px;top:'+n.y+'px">'+bracketCard(n.game)+'</div>').join('')+'</div></div>';
  }).join('')+(singles.length?'<h3>Placement Matchups</h3><div class="placement-grid">'+singles.map(bracketCard).join('')+'</div>':'')+'</section>';
 }).join('')||'<div class="empty">No placement games match this division or team.</div>';
}


function renderUnsubmitted(ds){
 const total=data.games.filter(g=>!data.results[g.id]).length;
 const sections=ds.map(d=>{
  const games=data.games.filter(g=>g.division===d&&!data.results[g.id]&&(!search||[bracketParticipant(data.games,data.results,g,1),bracketParticipant(data.games,data.results,g,2)].some(t=>key(t)===key(search))));
  if(!games.length)return'';
  return '<section class="division"><div class="division-head"><h2>'+esc(d)+'</h2><span class="muted">'+games.length+' Unsubmitted</span></div><div class="table-wrap"><table class="games"><thead><tr><th>Time / Field</th><th>Teams</th><th>Status</th><th></th></tr></thead><tbody>'+games.map(g=>{
   const a=bracketParticipant(data.games,data.results,g,1),b=bracketParticipant(data.games,data.results,g,2);
   return '<tr><td>'+time(g.time)+'<br><span class="muted">Field '+g.field+' · '+esc(g.code)+'</span></td><td><span class="match-team">'+esc(a)+'</span><span class="match-team">'+esc(b)+'</span></td><td><span class="pill pending">Not Submitted</span>'+((placeholder(a)||placeholder(b))?'<div class="legend">Teams Pending</div>':'')+'</td><td><button class="mini" type="button" data-game="'+esc(g.id)+'">Record Result</button></td></tr>';
  }).join('')+'</tbody></table></div></section>';
 }).join('');
 return '<div class="unsubmitted-title"><h2>Unsubmitted Game Results</h2><p class="muted">'+total+' of '+data.games.length+' scheduled games have no submitted score.</p></div>'+(sections||'<div class="empty">'+(total?'No unsubmitted games match these filters.':'All game results have been submitted.')+'</div>');
}

function render(){
 const names=[...new Set(divisions.flatMap(d=>roster(data.games,d)))].sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
 const choices='<option value="">All Teams</option>'+names.map(team=>'<option value="'+esc(team)+'">'+esc(team)+'</option>').join('');
 if(choices!==teamChoices){$('#search').innerHTML=choices;teamChoices=choices}
 $('#search').value=search;
 $('#header-brackets').setAttribute('aria-pressed',String(view==='brackets'));
 for(const name of['standings','brackets','unsubmitted'])$('#view-'+name).setAttribute('aria-pressed',String(view===name));
 $('#standings-note').hidden=view!=='standings';$('#brackets-note').hidden=view!=='brackets';$('#unsubmitted-note').hidden=view!=='unsubmitted';
 $('#show-unsubmitted').setAttribute('aria-pressed',String(view==='unsubmitted'));
 $('#stat-unsubmitted').textContent='View '+data.games.filter(g=>!data.results[g.id]).length+' Unsubmitted';
 $('#stat-games').textContent=data.games.length;$('#stat-results').textContent=Object.keys(data.results).length;
 $('#stat-teams').textContent=divisions.reduce((n,d)=>n+roster(data.games,d).length,0);
 $('#division-tabs').innerHTML=[['all','All Divisions'],...divisions.map(d=>[d,d])].map(([id,label])=>'<button type="button" data-division="'+esc(id)+'" aria-pressed="'+(division===id)+'">'+esc(label)+'</button>').join('');
 for(const b of $('#division-tabs').querySelectorAll('button'))b.onclick=()=>{division=b.dataset.division;render()};
 const ds=divisions.filter(d=>division==='all'||division===d);
 $('#content').innerHTML=view==='brackets'?renderBrackets(ds):view==='unsubmitted'?renderUnsubmitted(ds):ds.map(d=>{
  const all=data.games.filter(g=>g.division===d),reported=all.filter(g=>data.results[g.id]).length;
  const match=t=>!search||key(t)===key(search);
  const teams=standings(data.games,data.results,d).map((t,i)=>({...t,place:i+1})).filter(t=>match(t.team));
  const games=all.filter(g=>{const r=data.results[g.id];return match(r?.team1||g.team1)||match(r?.team2||g.team2)});
  if(!teams.length&&!games.length)return'';
  return '<section class="division"><div class="division-head"><h2>'+esc(d)+'</h2><span class="muted">'+roster(data.games,d).length+' Teams · '+reported+' / '+all.length+' Games Reported</span></div><div class="progress"><span style="width:'+(reported/all.length*100)+'%"></span></div><div class="table-wrap"><table><thead><tr><th>Place</th><th style="text-align:left">Team</th><th>Played</th><th>W</th><th>L</th><th>T</th><th>GF</th><th>GA</th><th>+/−</th></tr></thead><tbody>'+teams.map(t=>'<tr><td style="font-weight:800">'+ordinal(t.place)+'</td><td class="team" style="text-align:left">'+esc(t.team)+'</td><td>'+t.played+'</td><td class="wins">'+t.wins+'</td><td>'+t.losses+'</td><td>'+t.ties+'</td><td>'+t.gf+'</td><td>'+t.ga+'</td><td>'+t.diff+'</td></tr>').join('')+'</tbody></table></div><p class="legend">W = wins · L = losses · T = ties · GF / GA = goals for / against</p><h3>Games &amp; Results</h3><div class="table-wrap"><table class="games"><thead><tr><th>Time / Field</th><th>Teams</th><th>Score</th><th>Result</th><th></th></tr></thead><tbody>'+games.map(g=>{
   const r=data.results[g.id],a=r?.team1||g.team1,b=r?.team2||g.team2,w=winner(r),pending=placeholder(a)||placeholder(b);
   return '<tr><td>'+time(g.time)+'<br><span class="muted">Field '+g.field+' · '+esc(g.code)+'</span></td><td><span class="match-team '+(w===a?'winner':'')+'">'+esc(a)+'</span><span class="match-team '+(w===b?'winner':'')+'">'+esc(b)+'</span></td><td class="score">'+(r?r.score1+'<br>'+r.score2:'—<br>—')+'</td><td><span class="pill '+(r?'final':pending?'pending':'')+'">'+(r?w==='Tie'?'Tie':'Final':pending?'Participants Pending':'Scheduled')+'</span>'+(r&&w!=='Tie'?'<div class="legend">Winner: '+esc(w)+'</div>':'')+'</td><td><button class="mini" type="button" data-game="'+esc(g.id)+'">'+(r?'Correct':'Record')+'</button></td></tr>';
  }).join('')+'</tbody></table></div></section>';
 }).join('')||'<div class="empty">No matching teams or games.</div>';
 for(const b of $('#content').querySelectorAll('[data-game]'))b.onclick=()=>openReport(b.dataset.game);
 const history=data.history||[];$('#history').innerHTML=history.length?'<ol>'+history.map(h=>{const g=data.games.find(g=>g.id===h.game_id);return '<li><strong>'+esc(h.team1)+' '+h.score1+' – '+h.score2+' '+esc(h.team2)+'</strong><br><small>'+esc(g?.division||'')+' · Field '+(g?.field||'')+' · '+(g?time(g.time):'')+' · '+stamp(h.recorded_at)+' · '+(h.source==='sideline'?'Send Text tapped':'Results app')+'</small></li>'}).join('')+'</ol>':'<p class="muted">No score reports yet.</p>';
}
function openReport(id){
 currentGame=data.games.find(g=>g.id===id);if(!currentGame)return;const g=currentGame,r=data.results[id];
 $('#report-title').textContent=r?'Correct Result':'Record Result';$('#report-description').textContent=g.division+' · '+time(g.time)+' · Field '+g.field;
 for(const side of[1,2]){const select=$('#report-team'+side),expected=g['team'+side];select.replaceChildren();if(placeholder(expected)){select.append(new Option('Select actual team…',''));for(const team of roster(data.games,g.division))select.append(new Option(team,team));const resolved=bracketParticipant(data.games,data.results,g,side);select.value=r?.['team'+side]||(!placeholder(resolved)?resolved:'');}else{select.append(new Option(expected,expected));select.value=expected;}$('#report-score'+side).value=r?String(r['score'+side]):''}
 $('#report-error').textContent='';$('#report-dialog').showModal();
}
$('#report-form').onsubmit=async e=>{e.preventDefault();const g=currentGame;if(!g)return;const payload={submissionId:crypto.randomUUID(),gameId:g.id,team1:$('#report-team1').value,team2:$('#report-team2').value,score1:Number($('#report-score1').value),score2:Number($('#report-score2').value),source:'results'};$('#save-report').disabled=true;
 try{const r=await fetch('/api/results',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to save result');$('#report-dialog').close();await refresh()}catch(e){$('#report-error').textContent=e.message;$('#report-error').className='error'}finally{$('#save-report').disabled=false}};
$('#cancel-report').onclick=()=>$('#report-dialog').close();$('#refresh').onclick=()=>{window.ResoluteResultsLink?.flush();refresh()};$('#search').onchange=e=>{search=e.target.value;if(data)render()};
$('#export').onclick=()=>{if(!data)return;const rows=[['Division','Game','Field','Time','Team 1','Score 1','Team 2','Score 2','Winner','Reported At']];for(const g of data.games){const r=data.results[g.id];if(r)rows.push([g.division,g.code,g.field,time(g.time),r.team1,r.score1,r.team2,r.score2,winner(r),r.recordedAt])}const csv=rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Sixes-Showdown-Results-2026-10-18.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('#reset-results').onclick=()=>{$('#reset-error').textContent='';$('#reset-dialog').showModal()};
$('#cancel-reset').onclick=()=>$('#reset-dialog').close();
$('#reset-form').onsubmit=async e=>{
 e.preventDefault();const button=$('#confirm-reset');button.disabled=true;$('#cancel-reset').disabled=true;$('#reset-dialog').dataset.busy='true';
 try{
  await window.ResoluteResultsLink?.pause();
  const response=await fetch('/api/results',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'reset',confirmation:'RESET ALL SCORES'})});
  const result=await response.json();if(!response.ok||!result.reset)throw Error(result.error||'Unable to reset scores.');
  refreshRevision++;if(data){data.results={};data.history=[];render()}window.ResoluteResultsLink?.clearPending();$('#reset-dialog').close();await refresh();
 }catch(error){$('#reset-error').textContent=error.message;$('#reset-error').className='error'}
 finally{window.ResoluteResultsLink?.resume();button.disabled=false;$('#cancel-reset').disabled=false;delete $('#reset-dialog').dataset.busy}
};
$('#reset-dialog').addEventListener('cancel',e=>{if($('#reset-dialog').dataset.busy)e.preventDefault()});
for(const name of['standings','brackets','unsubmitted'])$('#view-'+name).onclick=()=>{view=name;history.replaceState(null,'',name==='standings'?location.pathname:'#'+name);if(data)render()};
$('#header-brackets').onclick=()=>$('#view-brackets').click();
$('#show-unsubmitted').onclick=()=>{division='all';search='';view='unsubmitted';history.replaceState(null,'','#unsubmitted');if(data)render()};
window.addEventListener('resolute-results-sync',()=>{showOutbox();refresh()});window.addEventListener('online',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});setInterval(()=>{if(!document.hidden)refresh()},15000);refresh();

