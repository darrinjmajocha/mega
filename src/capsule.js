import { COLORS, darken } from './colors.js?v=rain-16';
export function createCapsule() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 200 400');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<path data-top d="M4 200V100a96 96 0 0 1 192 0v100Z"/><path data-bottom d="M4 200h192v100a96 96 0 0 1-192 0Z"/><path data-outline d="M4 100a96 96 0 0 1 192 0v200a96 96 0 0 1-192 0Z" fill="none" stroke="#000" stroke-width="8"/><path d="M8 200h184" fill="none" stroke="#000" stroke-width="8"/>';
  const top = svg.querySelector('[data-top]');
  const bottom = svg.querySelector('[data-bottom]');
  for (const [name, half] of [['top',top],['bottom',bottom]]) {
    const overlay = document.createElementNS('http://www.w3.org/2000/svg','path');
    overlay.setAttribute('d', name === 'top' ? 'M4 200V100a96 96 0 0 1 192 0v100Z' : 'M4 200h192v100a96 96 0 0 1-192 0Z');
    overlay.setAttribute('class','symbol');
    overlay.setAttribute('data-symbol-'+name,'');
    if (half.after) half.after(overlay);
  }
  return svg;
}
export function paintCapsule(svg, [top, bottom]) {
  svg.classList?.add('patterned');
  svg.querySelector('[data-symbol-top]').setAttribute('fill','url(#symbol-'+top+')');
  svg.querySelector('[data-symbol-bottom]').setAttribute('fill','url(#symbol-'+bottom+')');
  svg.querySelector('[data-top]').setAttribute('fill', COLORS[top]);
  svg.querySelector('[data-bottom]').setAttribute('fill', darken(COLORS[bottom]));
}
