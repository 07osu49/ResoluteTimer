import {env} from 'cloudflare:workers';
import {handleResults} from '../../../lib/results-api';
export function GET(request:Request){return handleResults(request,env as any)}
export function POST(request:Request){return handleResults(request,env as any)}
export function OPTIONS(request:Request){return handleResults(request,env as any)}
