import { timerHtml } from '../lib/timer-html';
export function GET(){return new Response(timerHtml,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}})}
