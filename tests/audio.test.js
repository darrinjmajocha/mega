import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioManager, audioCandidates } from '../src/audio.js';
test('audio URLs preserve repository prefix for built and source deployments', () => {
  assert.deepEqual(audioCandidates('thrown', 'https://example.com/mega/src/audio.js').map(String), [
    'https://example.com/mega/audio/thrown.mp3', 'https://example.com/mega/audio/throw.mp3',
    'https://example.com/mega/public/audio/thrown.mp3', 'https://example.com/mega/public/audio/throw.mp3'
  ]);
});
test('source-hosted throw alias loads, resume is awaited, and cues overlap', async () => {
  const oldWindow = globalThis.window, oldFetch = globalThis.fetch;
  const played = [];
  let finishResume;
  class Context {
    state = 'suspended';
    createGain() { return { gain: { value: 1 }, connect() {} }; }
    async decodeAudioData(data) { return data; }
    resume() { return new Promise(resolve => { finishResume = () => { this.state = 'running'; resolve(); }; }); }
    createBufferSource() { return { connect() {}, disconnect() {}, start() { played.push(this.buffer); } }; }
  }
  globalThis.window = { AudioContext: Context };
  globalThis.fetch = async url => ({ ok: /\/public\/audio\/(throw|woosh|hit)\.mp3$/.test(String(url)), arrayBuffer: async () => String(url) });
  try {
    const audio = new AudioManager();
    await audio.ready;
    assert.equal(audio.buffers.size, 3);
    for (const volume of [1, .5, 0, 1]) { audio.setVolume(volume); assert.equal(audio.output.gain.value, volume); }
    let unlocked = false;
    const unlocking = audio.unlock().then(() => { unlocked = true; });
    await Promise.resolve();
    assert.equal(unlocked, false);
    finishResume();
    await unlocking;
    audio.play('thrown'); audio.play('woosh'); audio.play('woosh'); audio.play('hit'); audio.play('hit_g');
    assert.equal(played.length, 4);
    assert.match(played[0], /\/throw.mp3$/);
  } finally {
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
    globalThis.fetch = oldFetch;
  }
});

