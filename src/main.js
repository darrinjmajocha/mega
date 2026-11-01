import { randomPair, spinningPair, landingEffect } from './colors.js?v=240rpm-4';
import { createCapsule, paintCapsule } from './capsule.js';
import { animateToss } from './animation.js?v=240rpm-4';
import { AudioManager } from './audio.js?v=120rpm-3';
import { celebrate } from './particles.js';
const holder = document.querySelector('#capsule');
const button = document.querySelector('#toss');
const svg = createCapsule();
holder.append(svg);
paintCapsule(svg, ['red', 'blue']);
const audio = new AudioManager();
let forcedPair = null;
// Served only on loopback, never enabled on GitHub Pages.
if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
  window.megaTossDebug = { forceNext(kind) {
    if (!['single', 'double', 'normal'].includes(kind)) throw new Error('Use single, double, or normal');
    forcedPair = kind === 'double' ? ['green', 'green'] : kind === 'single' ? ['green', 'blue'] : ['red', 'yellow'];
  } };
}
button.addEventListener('click', async () => {
  if (button.disabled) return;
  button.disabled = true;
  const finalPair = forcedPair || randomPair();
  forcedPair = null;
  await audio.unlock();
  audio.play('thrown');
  animateToss({
    frame: angle => { holder.style.transform = `rotate(${angle}deg)`; },
    cycle: () => paintCapsule(svg, spinningPair()),
    woosh: () => audio.play('woosh'),
    land: () => {
      holder.style.transform = 'rotate(0deg)';
      paintCapsule(svg, finalPair);
      holder.setAttribute('aria-label', `${finalPair[0]} and ${finalPair[1]} megavitamin`);
      const effect = landingEffect(finalPair);
      audio.play(effect.sound);
      celebrate(document.querySelector('#particles'), effect.count);
      button.disabled = false;
    }
  });
});
