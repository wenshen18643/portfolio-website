export function initDreamStage() {
  const stage = document.getElementById('dreamStage');
  if (!stage) return;

  const cards = stage.querySelectorAll('.dream-card');
  const orbs = stage.querySelectorAll('.dream-orb');
  if (!cards.length) return;

  // Disable on mobile
  if (window.matchMedia('(max-width: 767px)').matches) return;

  let width = stage.offsetWidth;
  let height = stage.offsetHeight;
  const padding = 24;

  const floaters = [];
  const orbFloaters = [];

  // Initialize cards with slow drift velocities
  cards.forEach((el, i) => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    floaters.push({
      el,
      x: padding + Math.random() * (width - w - padding * 2),
      y: padding + Math.random() * (height - h - padding * 2),
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      w, h
    });
  });

  // Initialize orbs with even slower drift
  orbs.forEach((el, i) => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    orbFloaters.push({
      el,
      x: Math.random() * (width - w),
      y: Math.random() * (height - h),
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      w, h
    });
  });

  function softRepel(f) {
    const margin = 50;
    // Left wall repulsion
    if (f.x < margin) f.vx += 0.008 * (margin - f.x);
    // Right wall repulsion
    if (f.x + f.w > width - margin) f.vx -= 0.008 * (f.x + f.w - (width - margin));
    // Top wall repulsion
    if (f.y < margin) f.vy += 0.008 * (margin - f.y);
    // Bottom wall repulsion
    if (f.y + f.h > height - margin) f.vy -= 0.008 * (f.y + f.h - (height - margin));
    // Hard clamp as safety
    f.x = Math.min(Math.max(f.x, 0), width - f.w);
    f.y = Math.min(Math.max(f.y, 0), height - f.h);
  }

  function softSeparate(a, b) {
    if (a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y) return;
    const overlapX = Math.min(a.x + a.w - b.x, b.x + b.w - a.x);
    const overlapY = Math.min(a.y + a.h - b.y, b.y + b.h - a.y);
    if (overlapX < overlapY) {
      const dir = a.x < b.x ? -1 : 1;
      a.x += overlapX * dir * 0.5;
      b.x -= overlapX * dir * 0.5;
    } else {
      const dir = a.y < b.y ? -1 : 1;
      a.y += overlapY * dir * 0.5;
      b.y -= overlapY * dir * 0.5;
    }
  }

  let time = 0;

  function tick() {
    time += 0.016;

    // Update orbs
    orbFloaters.forEach((o, i) => {
      // Very gentle sine wave drift on top of velocity
      o.x += o.vx + Math.sin(time * 0.3 + i) * 0.08;
      o.y += o.vy + Math.cos(time * 0.2 + i * 1.5) * 0.08;
      softRepel(o);
      o.el.style.transform = `translate(${o.x}px, ${o.y}px)`;
    });

    // Update cards
    floaters.forEach((f, i) => {
      // Slow drift with tiny sine wobble
      f.x += f.vx + Math.sin(time * 0.15 + i * 2) * 0.05;
      f.y += f.vy + Math.cos(time * 0.12 + i * 3) * 0.05;
      softRepel(f);
    });

    // Soft separation between cards (multiple passes)
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < floaters.length; i++) {
        for (let j = i + 1; j < floaters.length; j++) {
          softSeparate(floaters[i], floaters[j]);
        }
      }
    }

    // Render cards
    floaters.forEach(f => {
      f.el.style.transform = `translate(${f.x}px, ${f.y}px)`;
    });

    requestAnimationFrame(tick);
  }

  // Random nudge every 4 seconds to keep movement alive
  setInterval(() => {
    floaters.forEach(f => {
      f.vx += (Math.random() - 0.5) * 0.15;
      f.vy += (Math.random() - 0.5) * 0.15;
      // Clamp velocity
      const maxSpeed = 0.7;
      f.vx = Math.max(-maxSpeed, Math.min(maxSpeed, f.vx));
      f.vy = Math.max(-maxSpeed, Math.min(maxSpeed, f.vy));
    });
  }, 4000);

  // Resize handler
  window.addEventListener('resize', () => {
    width = stage.offsetWidth;
    height = stage.offsetHeight;
    floaters.forEach(f => {
      f.x = Math.min(Math.max(f.x, padding), width - f.w - padding);
      f.y = Math.min(Math.max(f.y, padding), height - f.h - padding);
    });
    orbFloaters.forEach(o => {
      o.x = Math.min(Math.max(o.x, 0), width - o.w);
      o.y = Math.min(Math.max(o.y, 0), height - o.h);
    });
  });

  requestAnimationFrame(tick);
}
