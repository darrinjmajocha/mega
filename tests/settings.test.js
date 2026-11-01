import test from 'node:test';
import assert from 'node:assert/strict';
import { Settings } from '../src/settings.js';
test('volume cycles full, half, muted, full', () => {
  const s = new Settings();
  assert.equal(s.volume, 1);
  for (const expected of [.5, 0, 1]) { s.cycleVolume(); assert.equal(s.volume, expected); }
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
  assert.equal(s.mode, 'suspense'); assert.equal(s.volume, 1);
  s.busy = false; s.toggleMode('suspense');
  assert.equal(s.mode, 'normal');
});
