import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base='http://127.0.0.1:3000';
let r=await fetch(base+'/api/state');assert.equal(r.status,401);
r=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:(await readFile('.data/initial-admin-password','utf8')).trim()})});assert.equal(r.status,200);const cookie=r.headers.get('set-cookie').split(';')[0];
const get=async()=>{const r=await fetch(base+'/api/state',{headers:{cookie}});assert.equal(r.status,200);return r.json()};
const action=async body=>{const r=await fetch(base+'/api/action',{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(r.status,200,await r.text())};
const before=await get();assert.equal(before.machines.filter(m=>m.area==='FM').length,5);
await action({action:'production',id:'FM1',quantity:123});let d=await get();assert.equal(d.machines.find(m=>m.id==='FM1').count,before.machines.find(m=>m.id==='FM1').count+123);
await action({action:'service',id:'FM1',description:'Prueba funcional de mantenimiento',specialty:'Mecánica',priority:'Media'});d=await get();const service=d.services[0];assert.equal(service.machine,'FM1');assert.equal(d.machines.find(m=>m.id==='FM1').state,'Produciendo');
await action({action:'serviceUpdate',id:service.id,status:'En proceso',assignee:'Técnico de prueba',note:'Inspección'});await action({action:'serviceUpdate',id:service.id,status:'Resuelta',assignee:'Técnico de prueba',note:'Verificación completada'});
r=await fetch(base+'/api/action',{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify({action:'production',id:'FM1',quantity:-10})});assert.equal(r.status,400);
for(const format of ['pdf','xlsx']){r=await fetch(base+'/api/export?format='+format,{headers:{cookie}});assert.equal(r.status,200);assert((await r.arrayBuffer()).byteLength>500)}
console.log('PASS: authentication, five FM cards, production persistence, service independent of production, intervention, validation and exports.');
