import test from 'node:test';
import assert from 'node:assert/strict';
import { Settings } from '../src/settings.js';
test('volume cycles through quarters of the native maximum and returns to full', () => {
  const s = new Settings();
  assert.equal(s.volume, .5);
  for (const expected of [.375, .25, .125, 0, .5]) { s.cycleVolume(); assert.equal(s.volume, expected); }
});
test('modes toggle individually and reject the other active mode in both directions', () => {
  const s = new Settings();
  for (const [first, other] of [['suspense', 'reduced'], ['reduced', 'suspense']]) {
    assert.equal(s.toggleMode(first).changed, true);
    assert.deepEqual(s.toggleMode(other), { changed: false, conflict: first });
    assert.equal(s.mode, first);
    s.toggleMode(first);
    assert.equal(s.mode, 'normal');
  }
});
test('all settings are immutable throughout an active toss', () => {
  const s = new Settings();
  s.toggleMode('suspense'); s.busy = true;
  assert.equal(s.cycleVolume(), false);
  assert.deepEqual(s.toggleMode('suspense'), { changed: false });
  assert.deepEqual(s.toggleMode('reduced'), { changed: false });
  assert.equal(s.mode, 'suspense'); assert.equal(s.volume, .5);
  s.busy = false; s.toggleMode('suspense');
  assert.equal(s.mode, 'normal');
});


test('colorblind is independent of either mode and locked during tosses', () => {
  const s = new Settings();
  for(const mode of ['suspense','reduced']) {
    s.toggleMode(mode);
    assert.equal(s.toggleColorblind(), true); assert.equal(s.colorblind,true);
    assert.equal(s.mode,mode);
    s.busy=true; assert.equal(s.toggleColorblind(),false); assert.equal(s.colorblind,true);
    s.busy=false; s.toggleColorblind(); s.toggleMode(mode);
  }
});
