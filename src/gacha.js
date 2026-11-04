import { COLORS, darken } from './colors.js?v=rain-16';
const colors = ['red','blue','yellow','green'];
const key = 'mega-toss.collection.v1';
const empty = () => ({counts:Array(16).fill(0), last:-1, run:0, best:0, bestPair:-1});
export function record(stats, pair) {
  const index = colors.indexOf(pair[0])*4 + colors.indexOf(pair[1]);
  const missed = stats.last !== index && stats.run >= 2;
  stats.counts[index]++;
  stats.run = index === stats.last ? stats.run+1 : 1;
  stats.last = index;
  if (stats.run >= 2 && stats.run >= stats.best) {
    stats.best = stats.run;
    stats.bestPair = index;
  }
  return missed ? 'miss' : stats.run >= 2 ? 'hit'+Math.min(8,stats.run) : null;
}
const label = i => colors[Math.floor(i/4)]+' / '+colors[i%4];
export function collection(panel, icon) {
  let stats = empty(), compact=false, top=0, bottom=0, saved=true;
  try {
    const data=JSON.parse(localStorage.getItem(key));
    if(data?.counts?.length===16 && data.counts.every(Number.isSafeInteger)) stats=data;
  } catch {}
  function save(){try { localStorage.setItem(key,JSON.stringify(stats)); saved=true; } catch { saved=false; }}
  function draw(){
    panel.innerHTML='<h2>My collection</h2><div class="inventory"></div><div class="actions"></div>';
    for (const [id, length, pair] of [['current-run',stats.run,stats.last],['best-run',stats.best,stats.bestPair]]) {
      const value=document.getElementById(id);
      value.replaceChildren();
      if(length<2){value.textContent='—';value.setAttribute('aria-label','No streak yet');continue;}
      value.append(icon([colors[pair>>2],colors[pair%4]]), '× '+length);
      value.setAttribute('aria-label',label(pair)+', '+length+' in a row');
    }
    const inventory=panel.querySelector('.inventory');
    function button(parent,name,action){const b=document.createElement('button'); b.textContent=name; b.onclick=action;parent.append(b);}
    if(compact){
      const mega=icon([colors[top],colors[bottom]]);
      inventory.append(mega);
      for(const [i,half] of ['top','bottom'].entries()){
        button(inventory,'Cycle '+half+' · '+colors[i?bottom:top],()=>{if(i)bottom=(bottom+1)%4;else top=(top+1)%4;draw();});
      }
      mega.onclick=e=>{const rect=mega.getBoundingClientRect();if(e.clientY<rect.top+rect.height/2)top=(top+1)%4;else bottom=(bottom+1)%4;draw();};
      inventory.append('Collected × '+stats.counts[top*4+bottom]);
    }else{
      inventory.classList.add('matrix');
      stats.counts.forEach((n,i)=>{const cell=document.createElement('div');cell.title=label(i);cell.setAttribute('aria-label',label(i)+': '+n);cell.append(icon([colors[i>>2],colors[i%4]]),String(n));inventory.append(cell);});
    }
    const actions=panel.querySelector('.actions');
    button(actions,compact?'Show full table':'Browse by color',()=>{compact=!compact;draw();});
    button(actions,'Download PNG',download);
    button(actions,'Reset stats',()=>document.querySelector('#reset').showModal());
    if(!saved)panel.append('Browser storage unavailable. Download a PNG to keep this session’s results.');
  }
  function download(){
    const c=document.createElement('canvas');c.width=880;c.height=620;
    const g=c.getContext('2d');g.fillStyle='#f5f3ed';g.fillRect(0,0,880,620);g.fillStyle='#151515';g.font='bold 36px Arial';g.fillText('Mega Gacha · My collection',30,55);
    g.font='22px Arial';g.fillText('Highest streak · '+(stats.best?stats.best+' × '+label(stats.bestPair):'—'),30,98);
    const palette=colors.map(color => COLORS[color]);
    stats.counts.forEach((n,i)=>{const x=30+(i%4)*210,y=140+(i>>2)*115;
      g.fillStyle='#151515';g.fillRect(x,y,184,92);g.fillStyle='#fff';g.fillRect(x+2,y+2,180,88);
      g.fillStyle=palette[i>>2];g.fillRect(x+10,y+12,18,30);g.fillStyle=(i>>2)===i%4?darken(palette[i%4]):palette[i%4];g.fillRect(x+10,y+42,18,30);
      g.fillStyle='#111';g.font='17px Arial';g.fillText(label(i),x+38,y+34);g.font='bold 25px Arial';g.fillText(String(n),x+38,y+66);});
    const a=document.createElement('a');a.download='mega-gacha.png';a.href=c.toDataURL();a.click();
  }
  document.querySelector('#reset').onclose=e=>{if(e.target.returnValue==='reset'){stats=empty();save();draw();}e.target.returnValue='';};
  return {draw,land(pair){const cue=record(stats,pair);save();draw();return cue;}};
}
