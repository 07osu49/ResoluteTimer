import { resultsHtml } from '../../lib/results-page';
export function GET(){return new Response(resultsHtml,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}})}
