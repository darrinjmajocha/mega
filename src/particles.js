import { randomPair } from './colors.js?v=rain-16';
import { createCapsule, paintCapsule } from './capsule.js?v=rain-16';
export function celebrate(container, count, { now = () => performance.now(), request = requestAnimationFrame } = {}) {
  if (!count) return;
  const dramatic = count === 100;
  const width = innerWidth, height = innerHeight;
  const start = now();
  const delay = dramatic ? 4000 : 0;
  const end = start + 17000;
  const particles = Array.from({ length: count }, () => {
    const node = document.createElement('div');
    node.className = 'particle';
    const size = dramatic ? 12 + Math.random() * 30 : 20 + Math.random() * 10;
    node.style.width = `${size}px`;
    node.style.visibility = 'hidden';
    const svg = createCapsule();
    paintCapsule(svg, randomPair());
    node.append(svg);
    container.append(node);
    return { node, size, x: Math.random() * width, y: dramatic ? Math.random() * height * .3 - 100 : -100 - Math.random() * 120,
      vx: dramatic ? (Math.random() - .5) * 330 : (Math.random() - .5) * 24,
      vy: dramatic ? -200 + Math.random() * 300 : 140 + Math.random() * 60,
      angle: Math.random() * 360, spin: (Math.random() - .5) * (dramatic ? 650 : 100),
      delay: Math.random() * (dramatic ? 2200 : 500) };
  });
  function tick(now) {
    if (dramatic && now >= end) {
      for (const p of particles) p.node.remove();
      return;
    }
    if (now < start + delay) { request(tick); return; }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i], t = (now - start - delay - p.delay) / 1000;
      if (t < 0) continue;
      const x = p.x + p.vx * t + (dramatic ? Math.sin(t * 2) * 35 : 0);
      const y = p.y + p.vy * t + (dramatic ? 100 * t * t : 0);
      if (y > innerHeight + p.size * 3 || (dramatic && (x < -p.size * 3 || x > innerWidth + p.size * 3)) || t > 15) {
        if (dramatic) {
          // Recycle the same bounded pool throughout the thirteen-second shower.
          p.x = Math.random() * innerWidth;
          p.y = -p.size * 2;
          p.vy = 140 + Math.random() * 160;
          p.delay = now - start - delay;
          p.node.style.visibility = 'hidden';
        } else { p.node.remove(); particles.splice(i, 1); }
        continue;
      }
      if (dramatic) p.node.style.opacity = String(Math.min(1, (end - now) / 350));
      p.node.style.visibility = 'visible';
      p.node.style.transform = `translate(${x}px,${y}px) rotate(${p.angle + p.spin * t}deg)`;
    }
    if (particles.length) request(tick);
  }
  request(tick);
}

