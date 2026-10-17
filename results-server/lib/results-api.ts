import schedule from './schedule.json';
import { normalizeReport } from '../public/results-core.mjs';
export const historySql='INSERT INTO report_history (submission_id,game_id,team1,team2,score1,score2,source,recorded_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(submission_id) DO NOTHING';
export const resultSql='INSERT INTO game_results (game_id,report_id,team1,team2,score1,score2,recorded_at) SELECT game_id,id,team1,team2,score1,score2,recorded_at FROM report_history WHERE submission_id=? ON CONFLICT(game_id) DO UPDATE SET report_id=excluded.report_id,team1=excluded.team1,team2=excluded.team2,score1=excluded.score1,score2=excluded.score2,recorded_at=excluded.recorded_at WHERE excluded.report_id>game_results.report_id';
const allowedOrigins=new Set(['https://resolute-sideline.truecoot2.chatgpt.site','https://appassets.androidplatform.net']);
export async function handleResults(request:Request,env:{DB:D1Database}){
 const origin=request.headers.get('Origin');const headers:Record<string,string>={'Cache-Control':'no-store','Vary':'Origin'};
 if(origin&&allowedOrigins.has(origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Headers']='Content-Type';headers['Access-Control-Allow-Methods']='GET,POST,OPTIONS'}
 const json=(data:unknown,status=200)=>Response.json(data,{status,headers});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 try{
  if(!env.DB)return json({error:'Results storage is not connected.'},503);
  if(request.method==='GET'){
   const rows=await env.DB.prepare('SELECT * FROM game_results').all();
   const history=await env.DB.prepare('SELECT * FROM report_history ORDER BY id DESC LIMIT 100').all();
   const results=Object.fromEntries(rows.results.map((r:any)=>[r.game_id,{team1:r.team1,team2:r.team2,score1:r.score1,score2:r.score2,recordedAt:r.recorded_at,reportId:r.report_id}]));
   return json({...schedule,results,history:history.results,updatedAt:new Date().toISOString()});
  }
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  if(origin&&!allowedOrigins.has(origin))return json({error:'This origin cannot report results.'},403);
  if(!(request.headers.get('Content-Type')||'').includes('application/json'))return json({error:'JSON score report required.'},415);
  const raw=await request.text();if(raw.length>6000)return json({error:'Report is too large.'},413);
  let report;try{report=normalizeReport(JSON.parse(raw),schedule.games)}catch(e:any){return json({error:e.message},400)}
  const at=new Date().toISOString(),r=report;
  await env.DB.batch([env.DB.prepare(historySql).bind(r.submissionId,r.gameId,r.team1,r.team2,r.score1,r.score2,r.source,at),env.DB.prepare(resultSql).bind(r.submissionId)]);
  return json({saved:true,gameId:r.gameId,recordedAt:at});
 }catch(e){console.error('Results storage failed',e);return json({error:'Unable to save or load results. Please retry.'},503)}
}
