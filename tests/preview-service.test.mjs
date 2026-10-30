import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
test('request reaches selected card, persists and stops alert only after all requests resolve',()=>{
const nodes=new Map();const node=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',focus(){}});return nodes.get(k)};let saved;
const ctx=vm.createContext({Intl,Date,Number,JSON,Array,String,Object,Math,crypto:{randomUUID},location:{hash:'',pathname:'/'},history:{replaceState(){}},localStorage:{getItem:()=>null,setItem:(k,v)=>{saved=JSON.parse(v)}},document:{querySelector:node,getElementById:node,addEventListener(){},body:{classList:{toggle(){}}}},window:{addEventListener(){}},setInterval(){},FormData:class{constructor(form){return Object.entries(form)}}});
const html=readFileSync(new URL('../preview/index.html',import.meta.url),'utf8');vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);
ctx.event={preventDefault(){},target:{machine:'FM1',area:'FM',requester:'Operador',description:'Revisión de rodillo',specialty:'Mecánica',priority:'Alta'}};
vm.runInContext('submitService(event)',ctx);assert.equal(saved.services[0].machine,'FM1');assert.equal(saved.machines.find(m=>m.id==='FM1').state,'Produciendo');assert.equal(vm.runInContext("hasService('FM1')",ctx),true);assert.equal(vm.runInContext("hasService('FM2')",ctx),false);assert.match(node('main').innerHTML,/service-alert/);assert.match(node('main').innerHTML,/#bdeccc/);
vm.runInContext('submitService(event);resolveService(0)',ctx);assert.equal(vm.runInContext("hasService('FM1')",ctx),true);vm.runInContext('resolveService(1)',ctx);assert.equal(vm.runInContext("hasService('FM1')",ctx),false);assert.doesNotMatch(node('main').innerHTML,/class="card service-alert/);
});
