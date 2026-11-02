import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseZany, EFFECTS, effectAngle } from '../src/zany.js';
test('all six effects are reachable and settle upright',()=>{
  const found=new Set();
  for(let i=0;i<6;i++){
    let n=0; const names=chooseZany(true,()=>n++===0?(i+.5)/6:.9);
    found.add(names[0]);assert.equal(names.length,1);
  }
  assert.equal(found.size,6);
  for(const name of found){
    const end=EFFECTS[name].at(-1)[0];
    assert.equal(effectAngle(name,0),0);
    assert.equal(effectAngle(name,end)%360,0);
    assert.ok(end<=1700);
  }
});
test('matching colors exclude swapping and chains are at most two distinct effects',()=>{
  for(let i=0;i<100;i++){
    let n=0;
    const names=chooseZany(false,()=>n++===0?i/100:0);
    assert.equal(names.length,2);assert.notEqual(names[0],names[1]);
    assert.ok(!names.includes('indecisive'));
  }
});

