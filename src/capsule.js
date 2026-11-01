import { COLORS, darken } from './colors.js';
export function createCapsule() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 200 400');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<path data-top d="M4 200V100a96 96 0 0 1 192 0v100Z"/><path data-bottom d="M4 200h192v100a96 96 0 0 1-192 0Z"/><path d="M4 100a96 96 0 0 1 192 0v200a96 96 0 0 1-192 0Z M4 200h192" fill="none" stroke="#000" stroke-width="8"/>';
  return svg;
}
export function paintCapsule(svg, [top, bottom]) {
  svg.querySelector('[data-top]').setAttribute('fill', COLORS[top]);
  svg.querySelector('[data-bottom]').setAttribute('fill', darken(COLORS[bottom]));
}
