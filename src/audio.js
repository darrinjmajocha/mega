const names = ['thrown', 'woosh', 'hit', 'hit_g', 'hit_gg'];
export class AudioManager {
  constructor() {
    this.context = null;
    this.buffers = new Map();
    this.ready = this.load();
  }
  async load() {
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      this.context = new Context();
      await Promise.all(names.map(async name => {
        try {
          const response = await fetch(new URL(`../audio/${name}.mp3`, import.meta.url));
          if (!response.ok) return;
          this.buffers.set(name, await this.context.decodeAudioData(await response.arrayBuffer()));
        } catch { /* Missing or invalid optional audio does not interrupt gameplay. */ }
      }));
    } catch { this.context = null; }
  }
  unlock() { if (this.context?.state === 'suspended') void this.context.resume().catch(() => {}); }
  play(name) {
    const buffer = this.buffers.get(name);
    if (!this.context || !buffer) return;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.onended = () => source.disconnect();
    source.start();
  }
}
