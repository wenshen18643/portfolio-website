import { reduced } from './utils.js';

const TW_PHRASES = [
  'Built as proof of work. So its less CViy.',
  'Monash SWE · CGPA 3.725',
  'Speaks 4 Languages Badly',
  'Me like fancy design'
];

export function initTypewriter() {
  const el = document.querySelector('.role-typewriter');
  if (!el) return;

  if (reduced) { el.textContent = TW_PHRASES[0]; return; }

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const phrase = TW_PHRASES[phraseIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, 1900);
        return;
      }
      setTimeout(tick, 75);
    } else {
      charIdx--;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % TW_PHRASES.length;
        setTimeout(tick, 280);
        return;
      }
      setTimeout(tick, 40);
    }
  }

  setTimeout(tick, 1400);
}

export function initHeroSequence() {
  if (reduced) return;
  const role = document.querySelector('.hero-role');
  const tagline = document.querySelector('.hero-tagline');
  const hint = document.querySelector('.scroll-hint');

  [role, tagline, hint].forEach(el => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.85s cubic-bezier(0.16,1,0.3,1), transform 0.85s cubic-bezier(0.16,1,0.3,1)';
  });

  [[role, 1000], [tagline, 1250], [hint, 1500]].forEach(([el, delay]) => {
    if (!el) return;
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
  });
}

export function initHeroCanvas() {
  if (reduced) return;
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = 0, mouseY = 0;
  let isVisible = true;

  function resize() {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  const blobs = [
    { x: 0.3, y: 0.4, r: 180, color: 'oklch(0.92 0.025 100 / 0.5)', phase: 0, speed: 0.0004 },
    { x: 0.7, y: 0.6, r: 220, color: 'oklch(0.90 0.030 145 / 0.35)', phase: 2, speed: 0.0003 },
    { x: 0.5, y: 0.3, r: 150, color: 'oklch(0.93 0.020 100 / 0.45)', phase: 4, speed: 0.0005 },
  ];

  function drawBlob(blob, time) {
    const t = time * blob.speed + blob.phase;
    const cx = blob.x * width + Math.sin(t) * 60 + Math.cos(t * 0.7) * 40;
    const cy = blob.y * height + Math.cos(t * 0.8) * 50 + Math.sin(t * 1.2) * 30;

    const dx = cx - mouseX;
    const dy = cy - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let mdx = 0, mdy = 0;
    if (dist < 250 && dist > 0) {
      const force = (250 - dist) / 250 * 30;
      mdx = (dx / dist) * force;
      mdy = (dy / dist) * force;
    }

    ctx.beginPath();
    const points = 12;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const r = blob.r + Math.sin(angle * 3 + t * 2) * 20 + Math.cos(angle * 5 - t) * 15;
      const px = cx + mdx + Math.cos(angle) * r;
      const py = cy + mdy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = blob.color;
    ctx.fill();
  }

  let rafId = null;
  function animate(now) {
    if (isVisible) {
      ctx.clearRect(0, 0, width, height);
      for (const blob of blobs) drawBlob(blob, now);
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }

  const io = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !rafId) rafId = requestAnimationFrame(animate);
  });
  io.observe(canvas);

  rafId = requestAnimationFrame(animate);
}
