import { collection } from './gacha.js?v=streak27';
import { shortcutPair, chooseFinale, teasePair, runFinale } from './surprises.js?v=surprises-18';
import { randomPair, spinningPair, landingEffect, COLORS, darken } from './colors.js?v=rain-16';
import { createCapsule, paintCapsule } from './capsule.js?v=modes26';
import { animateToss } from './animation.js?v=midpoint-22';
import { AudioManager } from './audio.js?v=modes26';
import { celebrate } from './particles.js?v=modes26';
import { animateExtendedSuspense } from './suspense-extras.js?v=freeze-20';
import { Settings, MODE_LABELS } from './settings.js?v=volume-quarters30';
import { animateReduced, animateSuspense } from './modes.js?v=reduced-sequence29';

const holder = document.querySelector('#capsule');
const button = document.querySelector('#toss');
const svg = createCapsule();
holder.append(svg);
paintCapsule(svg, ['red', 'blue']);
const audio = new AudioManager();
const settings = new Settings();
const controls = Object.fromEntries(['volume', 'suspense', 'reduced', 'colorblind', 'dark'].map(id => [id, document.querySelector('#' + id)]));
const icons = Object.fromEntries(Object.entries(controls).map(([id, control]) => {
  const icon = createCapsule();
  control.querySelector('.setting-icon').append(icon);
  return [id, icon];
}));
const notice = document.querySelector('#mode-notice');
icons.volume.insertAdjacentHTML('afterbegin', '<defs><linearGradient id="volume-top"><stop offset="50%"/><stop offset="50%"/></linearGradient><linearGradient id="volume-bottom"><stop offset="50%"/><stop offset="50%"/></linearGradient></defs>');
icons.volume.insertAdjacentHTML('beforeend', '<path d="M100 4V396" fill="none" stroke="#000" stroke-width="8"/>');
let noticeTimer, jitterTimer;
function fillIcon(icon, top, bottom) {
  icon.classList.remove('patterned');
  icon.querySelector('[data-top]').setAttribute('fill', top);
  icon.querySelector('[data-bottom]').setAttribute('fill', bottom);
}
let dark = false;
function updateSettings() {
  document.documentElement.classList.toggle('dark', dark);
  controls.dark.setAttribute('aria-pressed', String(dark));
  fillIcon(icons.dark, dark ? '#fff' : '#000', dark ? '#fff' : '#000');
  document.querySelector('meta[name="theme-color"]').content = dark ? '#121212' : '#f5f3ed';
  document.body.classList.toggle('colorblind', settings.colorblind);
  document.body.classList.toggle('reduced-motion', settings.mode === 'reduced');
  controls.colorblind.setAttribute('aria-pressed', String(settings.colorblind));
  icons.colorblind.classList.toggle('show-letters', settings.colorblind);
  paintCapsule(icons.colorblind, settings.colorblind ? ['green', 'red'] : ['red', 'green']);
  const empty = 'var(--page-background)';
  const volumeQuarters = 4 - settings.volumeIndex;
  for (const [half, firstQuarter, color] of [['top', 3, COLORS.red], ['bottom', 1, darken(COLORS.red)]]) {
    const stops = icons.volume.querySelectorAll('#volume-' + half + ' stop');
    stops.forEach((stop, index) => stop.setAttribute('stop-color', volumeQuarters >= firstQuarter + index ? color : empty));
  }
  fillIcon(icons.volume, 'url(#volume-top)', 'url(#volume-bottom)');
  const volumeLabel = ['Full', 'Three quarters', 'Half', 'One quarter', 'Muted'][settings.volumeIndex];
  controls.volume.setAttribute('aria-label', 'Volume: ' + volumeLabel);
  controls.volume.title = 'Volume: ' + volumeLabel;
  fillIcon(icons.suspense, settings.mode === 'suspense' ? '#9b51e0' : COLORS.blue,
    darken(settings.mode === 'suspense' ? '#f28c28' : COLORS.blue));
  fillIcon(icons.reduced, COLORS.yellow, darken(COLORS.yellow));
  controls.suspense.setAttribute('aria-pressed', String(settings.mode === 'suspense'));
  controls.reduced.setAttribute('aria-pressed', String(settings.mode === 'reduced'));
  for (const mega of document.querySelectorAll('#capsule, .player-mega')) {
    mega.style.transform = settings.mode === 'reduced' ? 'rotate(-90deg)' : 'rotate(0deg)';
  }
  icons.reduced.style.transform = settings.mode === 'reduced' ? 'rotate(-90deg)' : 'rotate(0deg)';
}
function lock(busy) {
  settings.busy = busy;
  button.disabled = busy;
  for (const control of document.querySelectorAll('button')) control.disabled = busy;
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
controls.dark.addEventListener('click', () => {
  if (settings.busy) return;
  dark = !dark;
  updateSettings();
});
controls.colorblind.addEventListener('click', () => {
  if (settings.toggleColorblind()) updateSettings();
});
updateSettings();
const held = new Set();
window.addEventListener('keydown', event => {
  held.add(event.code);
  if (event.altKey && ['KeyG', 'KeyH'].includes(event.code)) event.preventDefault();
});
window.addEventListener('keyup', event => held.delete(event.code));
window.addEventListener('blur', () => held.clear());
document.addEventListener('visibilitychange', () => { if (document.hidden) held.clear(); });
let forcedPair = null;
// Development only: final outcomes can be forced without affecting production odds.
if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
  window.megaTossDebug = { forceNext(kind) {
    if (!['single', 'double', 'normal'].includes(kind)) throw new Error('Use single, double, or normal');
    forcedPair = kind === 'double' ? ['green', 'green'] : kind === 'single' ? ['green', 'blue'] : ['red', 'yellow'];
  } };
}
const $ = selector => document.querySelector(selector);
const icon = pair => {const node=createCapsule();paintCapsule(node,pair);return node;};
const book=collection($('#collection'),icon);
let screen='menu', players=[];
const titles={menu:'Mega Toss Main Menu', setup:'Local Multiplayer Mode', local:'Local Multiplayer Mode', free:'Free Play', gacha:'Mega Gacha'};
function navigate(next){
  screen=next; document.body.dataset.screen=next; $('h1').textContent=titles[next];
  for(const [selector,visible] of Object.entries({'#menu':next==='menu','#setup':next==='setup','#players':next==='local','#scores':next==='local','#collection':next==='gacha','.stage':next==='free'||next==='gacha','#back':next!=='menu','#toss':['local','free','gacha'].includes(next),'#suspense':next!=='menu','#reduced':next!=='menu'})) $(selector).hidden=!visible;
  button.textContent=next==='local'?'Toss All':'Toss';
  clearNotice(); if(next==='gacha')book.draw();
}
function action(parent,title,fn,mega){
  const b=document.createElement('button');b.type='button';if(mega)b.append(icon(mega));b.append(title);b.onclick=fn;parent.append(b);return b;
}
for(const [next,color] of [['setup','red'],['free','blue'],['gacha','yellow']]){
  action($('.choices'),titles[next],async()=>{const ready=audio.unlock();navigate(next);await ready;audio.play('hit');},[color,color]);
}
$('#back .setting-icon').append(icon(['blue','yellow']));
$('#back').onclick=()=>navigate('menu');
$('#legend').onclick=()=>$('#symbols').showModal();
for(const [color,symbol] of Object.entries({red:'Dots',blue:'Diagonal lines',yellow:'Vertical lines',green:'Rings of dots'})){
  const item=document.createElement('div');item.append(icon([color,color]),color+' · '+symbol);$('.samples').append(item);
}
for(const n of [2,3,4]) action($('.counts'),String(n),()=>setupPlayers(n));
function setupPlayers(n){
  players=[];$('#players').replaceChildren();$('#scores').innerHTML='<h2>Scoreboard</h2>';
  for(let i=0;i<n;i++){
    const name='P'+(i+1), card=document.createElement('article'), stage=document.createElement('div'), mega=document.createElement('div');
    stage.className='player-stage';mega.className='player-mega';mega.append(icon(['red','blue']));stage.append(mega);const label=document.createElement('span');label.className='player-label';label.textContent=name;card.append(stage,label);$('#players').append(card);
    const row=document.createElement('div'),score=document.createElement('output');score.value='0';row.append(name);$('#scores').append(row);
    action(row,'−',()=>score.value=Number(score.value)-1).setAttribute('aria-label','Subtract one from '+name);
    row.append(score);action(row,'+',()=>score.value=Number(score.value)+1).setAttribute('aria-label','Add one to '+name);
    players.push(mega);
  }
  action($('#scores'),'Reset all scores',()=>$('#scores').querySelectorAll('output').forEach(o=>o.value='0'));
  updateSettings();
  navigate('local');
}
function multiplayerSpin(cb,duration){
  const start=performance.now(),turns=8+Math.floor(Math.random()*8);
  let slot=-1,cue=0,revealed=false;
  function tick(now){
    const p=Math.min(1,Math.max(0,(now-start)/duration)),angle=360*turns*(1-(1-p)**2);
    cb.frame(angle);
    if(!revealed && angle>=360*turns-18){revealed=true;cb.revealFinal();}
    const next=Math.floor(angle/150);
    if(!revealed && next!==slot){slot=next;cb.cycle();}
    if(cue<3 && p>=[.60,.74,.88][cue]){cue++;cb.woosh();}
    if(p===1)cb.land();else requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function burst(origin){
  const root=origin.parentElement;
  for(let i=0;i<30;i++){
    const mini=icon(randomPair());mini.classList.add('burst');root.prepend(mini);
    const angle=Math.random()*2*Math.PI, distance=55+Math.random()*95;
    const animation=mini.animate([{transform:'translate(-50%,-50%) scale(.4)'},{transform:'translate(calc(-50% + '+Math.cos(angle)*distance+'px), calc(-50% + '+Math.sin(angle)*distance+'px)) rotate(240deg)',opacity:0}],{duration:800,delay:i*75,fill:'both'});
    animation.onfinish=()=>mini.remove();
  }
}
navigate('menu');
button.addEventListener('click',async event=>{
  if(settings.busy)return;
  lock(true);clearNotice();
  try{
    const forced=shortcutPair({alt:event.altKey||held.has('AltLeft')||held.has('AltRight'),g:held.has('KeyG'),h:held.has('KeyH')})||forcedPair;
    forcedPair=null;
    await audio.unlock();audio.play('thrown');
    if(screen==='local'){
      let remaining=players.length,greens=0;
      const slots=players.map((_,i)=>i);
      await Promise.all(players.map(async player=>{
        const slot=slots.splice(Math.floor(Math.random()*slots.length),1)[0];
        const duration=5000+(slot+Math.random())*5000/players.length;
        const pair=forced||randomPair();
        const playerGreens=pair.filter(c=>c==='green').length;
        greens=Math.max(greens,playerGreens);
        await spin(player,pair,duration,slot*1000);remaining--;
        audio.play(remaining===0 && greens?['hit','hit_g','hit_gg'][greens]:'hit');
        if(playerGreens)burst(player);
      }));
    }else{
      const pair=forced||randomPair();
      await spin(holder,pair);
      const effect=landingEffect(pair);
      const cue=screen==='gacha' && !forced ? book.land(pair) : null;
      audio.play(cue && audio.buffers.has(cue)?cue:effect.sound);
      celebrate($('#particles'),effect.count);
    }
  }finally{lock(false);}
});
function spin(holder,finalPair,duration,revealDelay=0){
  const mode=settings.mode, svg=holder.querySelector('svg');
  const halves=svg.querySelectorAll('[data-top],[data-bottom],.symbol');
  return new Promise(resolve=>{
  const land = () => {
    holder.style.transform = mode === 'reduced' ? 'rotate(-90deg)' : 'rotate(0deg)';
    for (const half of halves) half.style.fillOpacity = '1';
    paintCapsule(svg, finalPair);
    holder.setAttribute('aria-label', finalPair[0] + ' and ' + finalPair[1] + ' megavitamin');
    resolve(holder);
  };
  let shell = null;
  const finale = mode === 'suspense' ? chooseFinale(finalPair) : 'none';
  const finish = () => runFinale(finale, {
    frame: angle => { holder.style.transform = 'rotate(' + angle + 'deg)'; },
    tease: () => paintCapsule(svg, teasePair(finalPair)),
    openShell: () => {
      shell = holder.cloneNode(true);
      shell.removeAttribute('id');
      shell.removeAttribute('role');
      shell.setAttribute('aria-hidden', 'true');
      shell.className = 'matryoshka-shell';
      holder.parentElement.append(shell);
      paintCapsule(svg, finalPair);
      holder.style.transform = 'scale(.15)';
    },
    nestFrame: p => {
      const growth = p*p*(3-2*p);
      holder.style.transform = 'translateY(' + (-45*Math.sin(Math.PI*p)) + 'px) scale(' + (.15+.85*growth) + ')';
      if (shell) { shell.style.opacity = String(Math.max(0, 1-p*2.5)); shell.style.transform = 'scale(' + (1+p*.3) + ')'; }
    },
    closeShell: () => { shell?.remove(); shell = null; },
    land
  });
  const callbacks = {
    canSwap: finalPair[0] !== finalPair[1],
    swapPreview: swapped => paintCapsule(svg, swapped ? [finalPair[1], finalPair[0]] : finalPair),
    revealFinal: () => paintCapsule(svg, finalPair),
    frame: angle => { holder.style.transform = 'rotate(' + angle + 'deg)'; },
    cycle: () => paintCapsule(svg, spinningPair()),
    woosh: () => audio.play('woosh'),
    rotationWoosh: duration => audio.play('woosh', duration),
    throwAgain: () => audio.play('thrown'),
    land: finish
  };
  if (mode === 'reduced') {
    animateReduced({
      revealDelay,
      fade: opacity => { for (const half of halves) half.style.fillOpacity = String(opacity); },
      reveal: () => paintCapsule(svg, finalPair),
      land
    });
  } else if (mode === 'suspense') {
    animateExtendedSuspense(callbacks);
  } else if (duration) {
    multiplayerSpin(callbacks,duration);
  } else {
    animateToss({ ...callbacks, revealMidpoint: callbacks.revealFinal });
  }
  });
}
