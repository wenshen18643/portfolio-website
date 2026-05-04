import { reduced } from './utils.js';

export function initBridgeMarquee() {
  const track = document.querySelector('.bridge-track');
  const text = document.querySelector('.bridge-text');
  if (!track || !text) return;

  if (reduced) {
    track.style.justifyContent = 'center';
    return;
  }

  let textWidth = text.offsetWidth;

  window.addEventListener('resize', () => {
    textWidth = text.offsetWidth;
  });

  function update() {
    const offset = (window.scrollY * 0.3) % textWidth;
    track.style.transform = `translateX(-${offset}px)`;
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}
