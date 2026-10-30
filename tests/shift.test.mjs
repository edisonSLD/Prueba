import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {currentShift} from '../lib/shift.mjs';
test('Dominican shift boundaries, midnight and date changes',()=>{
 for(const [time,expected] of [['05:59:59','3'],['06:00:00','1'],['14:59:59','1'],['15:00:00','2'],['22:59:59','2'],['23:00:00','3'],['00:00:00','3']]){
  assert.equal(currentShift(new Date(`2026-10-30T${time}-04:00`)),expected,time);
 }
 assert.equal(currentShift(new Date('2027-01-01T03:59:59Z')),'3');
 assert.equal(currentShift(new Date('2026-06-01T10:00:00Z')),'1');
});
test('published preview uses the same tested timezone function',()=>{
 const source=readFileSync(new URL('../lib/shift.mjs',import.meta.url),'utf8').replace('export function','function');
 assert.ok(readFileSync(new URL('../preview/index.html',import.meta.url),'utf8').includes(source));
});
