export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-+';

export function scramble(el, target, duration, delay) {
  if (reduced) { el.textContent = target; return; }
  const frames = Math.round(duration / 16);
  let f = 0;
  setTimeout(() => {
    (function tick() {
      let out = '';
      for (let i = 0; i < target.length; i++) {
        const revealAt = (i / target.length) * frames * 0.6;
        out += f >= revealAt
          ? target[i]
          : target[i] === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = out;
      f++;
      if (f <= frames) requestAnimationFrame(tick);
      else el.textContent = target;
    })();
  }, delay);
}
