import { reduced } from './utils.js';

export function initCountUp() {
  if (reduced) return;

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const isDecimal = el.dataset.count.includes('.');
    const dur = 1500;
    const start = performance.now();

    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      const v = target * e;
      el.textContent = (isDecimal ? v.toFixed(3) : Math.round(v)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
}