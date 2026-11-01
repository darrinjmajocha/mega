const names = ['thrown', 'woosh', 'hit', 'hit_g', 'hit_gg'];
export function audioCandidates(name, base = import.meta.url) {
  const files = name === 'thrown' ? ['thrown', 'throw'] : [name];
  return ['../audio/', '../public/audio/'].flatMap(dir => files.map(file => new URL(`${dir}${file}.mp3`, base)));
}
export class AudioManager {
  constructor() {
    this.context = null;
    this.buffers = new Map();
    this.volume = 1;
    this.output = null;
    this.ready = this.load();
  }
  async load() {
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      this.context = new Context();
      this.output = this.context.createGain();
      this.output.gain.value = this.volume;
      this.output.connect(this.context.destination);
      await Promise.all(names.map(async name => {
        for (const url of audioCandidates(name)) {
          try {
            const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
            if (!response.ok) continue;
            this.buffers.set(name, await this.context.decodeAudioData(await response.arrayBuffer()));
            return;
          } catch { /* Try the other deployment layout or filename. */ }
        }
      }));
    } catch { this.context = null; }
  }
  async unlock() {
    // Invoke resume synchronously inside the click gesture before awaiting load.
    try {
      const resumed = this.context && this.context.state !== 'running' ? this.context.resume() : Promise.resolve();
      await Promise.all([this.ready, resumed]);
    } catch { /* Gameplay still works when browser audio is unavailable. */ }
  }
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.output) this.output.gain.value = this.volume;
  }
  play(name) {
    const buffer = this.buffers.get(name);
    if (!this.context || !buffer) return;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.output);
    source.onended = () => source.disconnect();
    source.start();
  }
}

