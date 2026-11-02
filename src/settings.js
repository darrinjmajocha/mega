export const VOLUMES = [0.5, 0.25, 0];
export const MODE_LABELS = { suspense: 'Suspense Mode', reduced: 'Reduced Motion Mode' };
export class Settings {
  mode = 'normal';
  volumeIndex = 0;
  busy = false;
  get volume() { return VOLUMES[this.volumeIndex]; }
  cycleVolume() {
    if (this.busy) return false;
    this.volumeIndex = (this.volumeIndex + 1) % VOLUMES.length;
    return true;
  }
  toggleMode(mode) {
    if (this.busy) return { changed: false };
    if (!Object.hasOwn(MODE_LABELS, mode)) throw new Error('Unknown mode');
    if (this.mode !== 'normal' && this.mode !== mode) return { changed: false, conflict: this.mode };
    this.mode = this.mode === mode ? 'normal' : mode;
    return { changed: true };
  }
}

