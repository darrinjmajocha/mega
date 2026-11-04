import test from 'node:test';
import assert from 'node:assert/strict';
import {record} from '../src/gacha.js';
test('ordered pairs, broken streak, newest tied best, and capped audio',()=>{
  const stats={counts:Array(16).fill(0),last:-1,run:0,best:0,bestPair:-1};
  const a=['red','blue'], b=['blue','red'];
  assert.equal(record(stats,a),null);
  assert.equal(record(stats,a),'hit2');
  assert.equal(record(stats,b),'miss');
  assert.equal(record(stats,b),'hit2');
  assert.equal(stats.bestPair,4);
  for(let n=3;n<=9;n++)assert.equal(record(stats,b),'hit'+Math.min(8,n));
  assert.equal(stats.counts[1],2);
  assert.equal(stats.counts[4],9);
  assert.equal(stats.best,9);
});