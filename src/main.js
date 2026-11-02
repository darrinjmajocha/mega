import { randomPair, spinningPair, landingEffect, COLORS, darken } from './colors.js?v=seamless-5';
import { createCapsule, paintCapsule } from './capsule.js?v=seamless-5';
import { animateToss } from './animation.js?v=mid-woosh-7';
import { AudioManager } from './audio.js?v=settings-9';
import { celebrate } from './particles.js?v=seamless-5';
import { animateExtendedSuspense } from './suspense-extras.js?v=pauses-10';
import { Settings, MODE_LABELS } from './settings.js?v=settings-9';
import { animateReduced, animateSuspense } from './modes.js?v=pauses-10';

const holder = document.querySelector('#capsule');
const button = document.querySelector('#toss');
const svg = createCapsule();
holder.append(svg);
paintCapsule(svg, ['red', 'blue']);
const halves = [svg.querySelector('[data-top]'), svg.querySelector('[data-bottom]')];
const audio = new AudioManager();
const settings = new Settings();
const controls = Object.fromEntries(['volume', 'suspense', 'reduced'].map(id => [id, document.querySelector('#' + id)]));
const icons = Object.fromEntries(Object.entries(controls).map(([id, control]) => {
  const icon = createCapsule();
  control.querySelector('.setting-icon').append(icon);
  return [id, icon];
}));
const notice = document.querySelector('#mode-notice');
let noticeTimer, jitterTimer;
function fillIcon(icon, top, bottom) {
  icon.querySelector('[data-top]').setAttribute('fill', top);
  icon.querySelector('[data-bottom]').setAttribute('fill', bottom);
}
function updateSettings() {
  const empty = 'var(--page-background)';
  fillIcon(icons.volume, settings.volumeIndex === 0 ? COLORS.red : empty,
    settings.volumeIndex === 2 ? empty : darken(COLORS.red));
  controls.volume.setAttribute('aria-label', 'Volume: ' + ['50%', '25%', 'muted'][settings.volumeIndex]);
  fillIcon(icons.suspense, settings.mode === 'suspense' ? '#9b51e0' : COLORS.blue,
    darken(settings.mode === 'suspense' ? '#f28c28' : COLORS.blue));
  fillIcon(icons.reduced, COLORS.yellow, darken(COLORS.yellow));
  controls.suspense.setAttribute('aria-pressed', String(settings.mode === 'suspense'));
  controls.reduced.setAttribute('aria-pressed', String(settings.mode === 'reduced'));
  holder.style.transform = settings.mode === 'reduced' ? 'rotate(90deg)' : 'rotate(0deg)';
  icons.reduced.style.transform = settings.mode === 'reduced' ? 'rotate(90deg)' : 'rotate(0deg)';
}
function lock(busy) {
  settings.busy = busy;
  button.disabled = busy;
  for (const control of Object.values(controls)) control.disabled = busy;
}
function clearNotice() {
  clearTimeout(noticeTimer);
  clearTimeout(jitterTimer);
  notice.textContent = '';
  notice.hidden = true;
  for (const control of Object.values(controls)) control.querySelector('.setting-icon').classList.remove('jitter');
}
function showConflict(mode) {
  clearNotice();
  const icon = controls[mode].querySelector('.setting-icon');
  void icon.offsetWidth;
  icon.classList.add('jitter');
  notice.hidden = false;
  notice.textContent = 'Please disable ' + MODE_LABELS[mode] + ' to change modes.';
  jitterTimer = setTimeout(() => icon.classList.remove('jitter'), 1000);
  noticeTimer = setTimeout(clearNotice, 2500);
}
controls.volume.addEventListener('click', () => {
  if (!settings.cycleVolume()) return;
  audio.setVolume(settings.volume);
  updateSettings();
});
for (const mode of ['suspense', 'reduced']) {
  controls[mode].addEventListener('click', () => {
    const result = settings.toggleMode(mode);
    if (result.conflict) showConflict(result.conflict);
    if (result.changed) { clearNotice(); updateSettings(); }
  });
}
updateSettings();
let forcedPair = null;
// Development only: final outcomes can be forced without affecting production odds.
if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
  window.megaTossDebug = { forceNext(kind) {
    if (!['single', 'double', 'normal'].includes(kind)) throw new Error('Use single, double, or normal');
    forcedPair = kind === 'double' ? ['green', 'green'] : kind === 'single' ? ['green', 'blue'] : ['red', 'yellow'];
  } };
}
button.addEventListener('click', async () => {
  if (settings.busy) return;
  lock(true);
  clearNotice();
  const finalPair = forcedPair || randomPair();
  forcedPair = null;
  const mode = settings.mode;
  await audio.unlock();
  audio.play('thrown');
  const land = () => {
    holder.style.transform = mode === 'reduced' ? 'rotate(90deg)' : 'rotate(0deg)';
    for (const half of halves) half.style.fillOpacity = '1';
    paintCapsule(svg, finalPair);
    holder.setAttribute('aria-label', finalPair[0] + ' and ' + finalPair[1] + ' megavitamin');
    const effect = landingEffect(finalPair);
    audio.play(effect.sound);
    celebrate(document.querySelector('#particles'), effect.count);
    lock(false);
  };
  const callbacks = {
    frame: angle => { holder.style.transform = 'rotate(' + angle + 'deg)'; },
    cycle: () => paintCapsule(svg, spinningPair()),
    woosh: () => audio.play('woosh'),
    rotationWoosh: duration => audio.play('woosh', duration),
    throwAgain: () => audio.play('thrown'),
    land
  };
  if (mode === 'reduced') {
    animateReduced({
      fade: opacity => { for (const half of halves) half.style.fillOpacity = String(opacity); },
      reveal: () => paintCapsule(svg, finalPair),
      land
    });
  } else if (mode === 'suspense') {
    animateExtendedSuspense(callbacks);
  } else {
    animateToss(callbacks);
  }
});



