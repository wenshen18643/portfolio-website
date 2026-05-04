import { reduced } from './utils.js';

export function initReveals() {
  const els = document.querySelectorAll('[data-reveal]');
  if (reduced) { els.forEach(el => el.classList.add('revealed')); return; }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const siblings = [...el.parentElement.querySelectorAll('[data-reveal]')];
      const idx = siblings.indexOf(el);
      setTimeout(() => el.classList.add('revealed'), idx * 120);
      io.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => io.observe(el));
}