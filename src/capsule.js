import { COLORS, darken } from './colors.js?v=rain-16';
export function createCapsule() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 200 400');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<path data-top d="M4 200V100a96 96 0 0 1 192 0v100Z"/><path data-bottom d="M4 200h192v100a96 96 0 0 1-192 0Z"/><path data-outline d="M4 100a96 96 0 0 1 192 0v200a96 96 0 0 1-192 0Z" fill="none" stroke="#000" stroke-width="8"/><path d="M8 200h184" fill="none" stroke="#000" stroke-width="8"/>';
  svg.innerHTML += '<text class="color-letter" data-letter-top x="100" y="100" text-anchor="middle" dominant-baseline="central">R</text><text class="color-letter" data-letter-bottom x="100" y="300" text-anchor="middle" dominant-baseline="central">B</text>';
  return svg;
}
export function paintCapsule(svg, [top, bottom]) {
  svg.querySelector('[data-letter-top]').textContent = top[0].toUpperCase();
  svg.querySelector('[data-letter-bottom]').textContent = bottom[0].toUpperCase();
  svg.querySelector('[data-top]').setAttribute('fill', COLORS[top]);
  svg.querySelector('[data-bottom]').setAttribute('fill', darken(COLORS[bottom]));
}
