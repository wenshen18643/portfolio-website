import { reduced } from './utils.js';

const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

if (!reduced && dot && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });
  document.addEventListener('mouseleave', () => {
    dot.classList.add('hidden'); ring.classList.add('hidden');
  });
  document.addEventListener('mouseenter', () => {
    dot.classList.remove('hidden'); ring.classList.remove('hidden');
  });

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '46px'; ring.style.height = '46px';
      ring.style.borderColor = 'oklch(0.32 0.12 145 / 0.7)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '30px'; ring.style.height = '30px';
      ring.style.borderColor = 'oklch(0.32 0.12 145 / 0.45)';
    });
  });

  (function lerpRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(lerpRing);
  })();
}
