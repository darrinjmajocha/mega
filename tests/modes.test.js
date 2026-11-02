import test from 'node:test';
import assert from 'node:assert/strict';
import { reducedOpacityAt, animateReduced, createSuspensePlan, suspenseAngleAt, animateSuspense } from '../src/modes.js';
test('reduced mode fades both colors out, holds a second, fades in, then lands once', () => {
  for (const [t, opacity] of [[0,1],[250,.5],[500,0],[1000,0],[1500,0],[1750,.5],[2000,1]]) assert.equal(reducedOpacityAt(t), opacity);
  let tick, reveals = 0, lands = 0, opacity;
  animateReduced({ now: () => 0, request: cb => { tick = cb; }, fade: v => { opacity = v; }, reveal: () => reveals++, land: () => lands++ });
  for (const t of [100, 500, 1000, 1499, 1500, 1999]) tick(t);
  assert.equal(reveals, 1); assert.equal(lands, 0);
  tick(2000);
  assert.equal(reveals, 1); assert.equal(lands, 1); assert.equal(opacity, 1);
});
test('suspense plans have bounded speeds, whole turns, long deceleration and synchronized cues', () => {
  // Deterministic varying draws exercise the entire allowed range.
  let seed = 113;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
  const variants = new Set();
  for (let n = 0; n < 300; n++) {
    const p = createSuspensePlan(random);
    variants.add(p.fake);
    assert.ok(p.rpm >= 60 && p.rpm <= 600);
    assert.ok(p.cruise > 0 && p.deceleration > p.acceleration * 2);
    assert.ok(p.duration > 3000 && p.duration < 18000);
    assert.equal(suspenseAngleAt(p, p.stop), p.turns * 360);
    assert.equal(suspenseAngleAt(p, p.duration), (p.turns + (p.fake === 'spin' ? 1 : 0)) * 360);
    for (let j = 0; j < p.turns; j++) assert.ok(Math.abs(suspenseAngleAt(p, p.cues[j]) - (j + .5) * 360) < 1e-6);
    const h = .001;
    for (const t of [p.acceleration, p.acceleration + p.cruise]) {
      assert.ok(Math.abs((suspenseAngleAt(p,t+h)-suspenseAngleAt(p,t-h))/(2*h)-p.velocity) < 0.0001);
    }
  }
  assert.deepEqual([...variants].sort(), ['colors', 'none', 'pause', 'spin']);
});
test('fake-outs postpone landing and emit no extra landing callbacks', () => {
  for (const choice of [.2, .5, .7, .9]) {
    let index = 0;
    const p = createSuspensePlan(() => index++ === 4 ? choice : .5);
    let tick, lands = 0, cycles = 0, sounds = 0;
    animateSuspense({ plan: p, now: () => 0, request: cb => { tick = cb; }, frame() {}, cycle: () => cycles++, woosh: () => sounds++, land: () => lands++ });
    tick(p.stop - 1);
    if (p.fake !== 'none') {
      tick(p.stop); assert.equal(lands, 0);
      const before = cycles;
      tick(p.stop + p.pause - 1); assert.equal(cycles, before);
      if (p.fake !== 'pause') { tick(p.stop + p.pause + 1); assert.ok(cycles > before); }
    }
    tick(p.duration);
    assert.equal(lands, 1); assert.equal(sounds, p.cues.length);
  }
});
