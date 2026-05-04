import { reduced, scramble } from './utils.js';

export function initAboutOrbs() {
  const section = document.getElementById('about');
  const orbs = section?.querySelectorAll('.about-orb');
  if (!orbs?.length) return;

  if (reduced) {
    orbs.forEach(o => o.classList.add('is-visible'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        orbs.forEach((o, i) => setTimeout(() => o.classList.add('is-visible'), i * 200));
        obs.disconnect();
      }
    });
  }, { threshold: 0.15 });

  obs.observe(section);
}

export function initMagneticQuote() {
  const section = document.getElementById('about');
  const quote = section?.querySelector('.about-quote');
  if (!quote) return;

  const html = quote.innerHTML.trim();
  const lines = html.split(/(<br\s*\/?>)/i);

  quote.innerHTML = '';
  const chars = [];

  lines.forEach((line, lineIdx) => {
    if (/^<br\s*\/?>$/i.test(line)) return;
    if (lineIdx > 0) quote.appendChild(document.createElement('br'));

    const words = line.split(/(\s+)/);
    words.forEach(word => {
      if (/^\s+$/.test(word)) {
        quote.appendChild(document.createTextNode(word));
      } else {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';

        for (const ch of word) {
          const span = document.createElement('span');
          span.className = 'magnetic-char';
          span.textContent = ch;
          wordSpan.appendChild(span);
          chars.push({ el: span, x: 0, y: 0, vx: 0, vy: 0, cx: 0, cy: 0, phase: chars.length * 0.4 });
        }
        quote.appendChild(wordSpan);
      }
    });
  });

  if (reduced) return;

  const RADIUS = 140;
  const MAX_FORCE = 3.5;
  const SPRING = 0.06;
  const DAMPING = 0.88;

  function measure() {
    chars.forEach(c => {
      const r = c.el.getBoundingClientRect();
      c.cx = r.left + r.width / 2 + window.scrollX;
      c.cy = r.top + r.height / 2 + window.scrollY;
    });
  }

  measure();
  window.addEventListener('resize', measure);

  let mouseX = -9999, mouseY = -9999;
  section.addEventListener('mousemove', e => {
    mouseX = e.clientX + window.scrollX;
    mouseY = e.clientY + window.scrollY;
  });
  section.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  let time = 0;
  let rafId = null;
  let isVisible = false;

  function tick() {
    if (!isVisible) { rafId = null; return; }
    time++;
    chars.forEach(c => {
      const dx = c.cx - mouseX;
      const dy = c.cy - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < RADIUS && dist > 0) {
        const force = (1 - dist / RADIUS) * MAX_FORCE;
        c.vx += (dx / dist) * force;
        c.vy += (dy / dist) * force;
      }

      c.vx += (0 - c.x) * SPRING;
      c.vy += (0 - c.y) * SPRING;

      c.vx *= DAMPING;
      c.vy *= DAMPING;

      c.x += c.vx;
      c.y += c.vy;

      const idleX = Math.sin(time * 0.001 + c.phase) * 1.5;
      const idleY = Math.cos(time * 0.0013 + c.phase * 1.3) * 1.2;

      c.el.style.transform = `translate(${(c.x + idleX).toFixed(2)}px, ${(c.y + idleY).toFixed(2)}px)`;
    });

    rafId = requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !rafId) rafId = requestAnimationFrame(tick);
  });
  io.observe(section);
}

export function initStatHoverScramble() {
  if (reduced) return;
  document.querySelectorAll('.about-stats .stat').forEach(stat => {
    const label = stat.querySelector('.stat-l');
    if (!label) return;
    const original = label.textContent;
    stat.addEventListener('mouseenter', () => scramble(label, original, 300, 0));
    stat.addEventListener('mouseleave', () => label.textContent = original);
  });
}