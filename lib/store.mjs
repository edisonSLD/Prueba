import {PGlite} from '@electric-sql/pglite';
import pg from 'pg';
import {mkdir} from 'node:fs/promises';
import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
export const roles=['Administrador','Supervisor','Operador','Técnico','Gerencia','Consulta'];
export const states=['Produciendo','Detenida','Correctivo','Operacional','Calidad','Electrónica','Cambio','Fuera de servicio','Sin comunicación'];
export const serviceStates=['Pendiente','Asignada','En proceso','Esperando repuesto','Resuelta','Cerrada','Cancelada'];
export function hash(p,s=randomBytes(16).toString('hex')){return s+':'+scryptSync(p,s,64).toString('hex')}
export function verify(p,h){const [s,v]=h.split(':');return timingSafeEqual(Buffer.from(v,'hex'),scryptSync(p,s,64))}
export async function openStore(path=process.env.DATA_DIR||'.data/db'){
 if(!process.env.DATABASE_URL)await mkdir(path,{recursive:true});
 const db=process.env.DATABASE_URL?new pg.Pool({connectionString:process.env.DATABASE_URL}):new PGlite(path);
 for(const statement of `CREATE TABLE IF NOT EXISTS documents (id text PRIMARY KEY, body jsonb NOT NULL); CREATE TABLE IF NOT EXISTS users (username text PRIMARY KEY, password text NOT NULL, role text NOT NULL); CREATE TABLE IF NOT EXISTS sessions (token text PRIMARY KEY, username text REFERENCES users(username), expires timestamptz NOT NULL)`.split('; ')) await db.query(statement);
 let data=(await db.query("SELECT body FROM documents WHERE id='plant'")).rows[0]?.body;
 if(!data){data={mode:'manual',shift:'A',shiftStarted:new Date().toISOString(),areas:['GD','PROTOS','FM'],lines:[],machines:[],services:[],events:[],samples:[],shifts:[],products:['King Size','Box','Slim','Mentol','Capsule'],settings:{timezone:'America/Santo_Domingo',shifts:['A','B','C']}};
 for(const area of data.areas)for(let i=1;i<=(area==='GD'?6:5);i++){const id=area==='FM'?`FM${i}`:`${area}-${String(i).padStart(2,'0')}`;data.lines.push({id:area+'-'+i,area,code:area==='FM'?`FM${i}`:`9S${i}`,target:10000,archived:false});data.machines.push({id,area,line:area+'-'+i,product:data.products[(i-1)%5],count:0,total:0,speed:0,ratedSpeed:6000,state:i===2?'Operacional':i===4?'Detenida':'Produciendo',since:new Date().toISOString(),archived:false});}
 await db.query("INSERT INTO documents VALUES ('plant',$1)",[JSON.stringify(data)]);}
 return {db,get:()=>data,save:async()=>db.query("UPDATE documents SET body=$1 WHERE id='plant'",[JSON.stringify(data)]),close:()=>db.close?db.close():db.end()};
}
export function authorize(role,action){if(role==='Administrador')return true;if(['mode','structure','user','settings'].includes(action))return false;if(action==='serviceUpdate')return ['Supervisor','Técnico'].includes(role);return ['Supervisor','Operador','Técnico'].includes(role)}
