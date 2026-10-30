import {hash,verify,roles,states} from './store.mjs';
export function report(d,filters={}){const samples=d.samples.filter(s=>(!filters.from||s.at>=filters.from)&&(!filters.to||s.at<=filters.to+'T23:59:59.999Z')&&(!filters.area||s.area===filters.area)&&(!filters.machine||s.machine===filters.machine)&&(!filters.product||s.product===filters.product)&&(!filters.shift||s.shift===filters.shift));const groups={};for(const s of samples){const key=[s.area,s.line,s.machine,s.product,s.shift,s.at.slice(0,10)].join('|');groups[key]??={area:s.area,line:s.line,machine:s.machine,product:s.product,shift:s.shift,date:s.at.slice(0,10),quantity:0};groups[key].quantity+=s.quantity}return Object.values(groups)}
export async function advanced(body,u,store){const d=store.get(),db=store.db;const requireAdmin=()=>{if(u.role!=='Administrador')throw Error('Solo administradores')};const str=(x,max=100)=>{if(typeof x!=='string'||!x.trim()||x.length>max)throw Error('Texto inválido');return x.trim()};const number=(x)=>{const n=Number(x);if(!Number.isFinite(n)||n<0)throw Error('Número inválido');return n};
 switch(body.action){
 case 'password':{const row=(await db.query('SELECT password FROM users WHERE username=$1',[u.username])).rows[0];if(!verify(str(body.current,256),row.password))throw Error('Contraseña actual incorrecta');const p=str(body.password,256);if(p.length<12)throw Error('Mínimo 12 caracteres');await db.query('UPDATE users SET password=$1 WHERE username=$2',[hash(p),u.username]);await db.query('DELETE FROM sessions WHERE username=$1',[u.username]);return true;}
 case 'userEdit':{requireAdmin();if(body.username===u.username)throw Error('No modificar tu propio rol');if(!roles.includes(body.role))throw Error('Rol inválido');await db.query('UPDATE users SET role=$1 WHERE username=$2',[body.role,str(body.username)]);await db.query('DELETE FROM sessions WHERE username=$1',[body.username]);return true;}
 case 'catalog':{requireAdmin();const m=d.machines.find(m=>m.id===body.id),l=d.lines.find(l=>l.id===body.id);switch(body.kind){
 case 'machine':if(!m)throw Error('Equipo no encontrado');m.product=str(body.product);m.ratedSpeed=number(body.speed);m.archived=body.archived===true;m.order=number(body.order);break;
 case 'line':if(!l)throw Error('Línea no encontrada');if(d.lines.some(x=>x.id!==l.id&&x.area===l.area&&x.code===body.code))throw Error('Código duplicado');l.code=str(body.code);l.target=number(body.target);l.archived=body.archived===true;break;
 case 'products':d.products=str(body.value,2000).split(',').map(x=>x.trim()).filter(Boolean);break;
 case 'shifts':d.settings.shifts=str(body.value,500).split(',').map(x=>x.trim()).filter(Boolean);break;
 case 'calendar':d.settings.calendar=str(body.value,4000);break;
 case 'causes':d.settings.causes=str(body.value,2000).split(',').map(x=>x.trim());break;
 case 'colors':if(!states.includes(body.id)||!/^#[0-9a-f]{6}$/i.test(body.value))throw Error('Estado o color inválido');d.settings.colors??={};d.settings.colors[body.id]=body.value;break;
 case 'connection':d.settings.connection={protocol:str(body.protocol),endpoint:str(body.endpoint,500),enabled:false};break;
 default:throw Error('Catálogo inválido');}return true;}
 case 'intervention':{if(!['Administrador','Supervisor','Técnico'].includes(u.role))throw Error('No autorizado');const s=d.services.find(s=>s.id===body.id);if(!s)throw Error('Solicitud no encontrada');s.arrived=body.arrived?new Date(body.arrived).toISOString():s.arrived;s.diagnosis=str(body.diagnosis,2000);s.work=str(body.work,2000);s.parts=str(body.parts,2000);return true;}
 default:return false;
 }
}
