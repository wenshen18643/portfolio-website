import { reduced } from './utils.js';
import { EXP } from '../data/experience.js';

// â”€â”€ Experience overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildOverlay(data) {
  const wm = document.getElementById('overlayWatermark');
  const left = document.getElementById('overlayLeft');
  const body = document.getElementById('overlayBody');

  wm.textContent = data.watermark;

  const animClass = data.vibe === 'playful' ? 'rush' : 'ov-animate';

  const rolesHtml = data.roles.map(r =>
    `<p class="ov-role-line ${animClass}"><strong>${r.title}</strong> Â· ${r.period}</p>`
  ).join('');

  const taglineHtml = data.tagline
    ? `<p class="ov-tagline ${animClass}">${data.tagline}</p>`
    : '';

  let contentHtml = '';
  if (data.beforeAfter) {
    const beforeItems = data.beforeAfter.before.map((b, i) =>
      `<li class="${animClass}" style="transition-delay: ${i * 60}ms">${b}</li>`
    ).join('');
    const afterItems = data.beforeAfter.after.map((b, i) =>
      `<li class="${animClass}" style="transition-delay: ${(i + data.beforeAfter.before.length) * 60}ms">${b}</li>`
    ).join('');
    contentHtml = `
      <div class="ov-beforeafter ${animClass}">
        <div class="ov-beforeafter-col ov-before">
          <p class="ov-section-label">The Old Way</p>
          <ul class="ov-bullets">${beforeItems}</ul>
        </div>
        <div class="ov-beforeafter-col ov-after">
          <p class="ov-section-label">The New Way</p>
          <ul class="ov-bullets">${afterItems}</ul>
        </div>
      </div>
    `;
  } else if (data.achievements) {
    const achievementsHtml = data.achievements.map((a, i) =>
      `<div class="ov-achievement-item ${animClass}" style="transition-delay: ${i * 60}ms">${a}</div>`
    ).join('');
    contentHtml = `
      <p class="ov-section-label ${animClass}">Unlocked abilities</p>
      <div class="ov-achievements">${achievementsHtml}</div>
    `;
  } else if (data.bullets) {
    const bulletsHtml = data.bullets.map((b, i) => `<li class="${animClass}" style="transition-delay: ${i * 60}ms">${b}</li>`).join('');
    contentHtml = `
      <p class="ov-section-label ${animClass}">What I did</p>
      <ul class="ov-bullets">${bulletsHtml}</ul>
    `;
  }

  const noteHtml = data.firstJobNote
    ? `<p class="ov-first-note ${animClass}">${data.firstJobNote}</p>`
    : '';

  let proofHtml = '';
  if (data.proofVideo && data.beforeVideo) {
    proofHtml = `
      <div class="compare-slider ${animClass}" id="mumecSlider">
        <div class="compare-after">
          <video src="${data.proofVideo}" autoplay muted loop playsinline preload="metadata"></video>
        </div>
        <div class="compare-before">
          <video src="${data.beforeVideo}" autoplay muted loop playsinline preload="metadata"></video>
        </div>
        <div class="compare-handle" aria-hidden="true">
          <span class="handle-grip">â†”</span>
        </div>
      </div>
      <div class="compare-labels ${animClass}">
        <span class="compare-label before-label">Before â€” Manual chaos</span>
        <span class="compare-label after-label">After â€” Yes I'm not doing anything</span>
      </div>
    `;
  } else if (data.proofVideo) {
    proofHtml = `
      <div class="proof-slot proof-video ${animClass}">
        <video src="${data.proofVideo}" autoplay muted loop playsinline preload="metadata"></video>
      </div>
    `;
  } else if (data.proof) {
    proofHtml = `
      <p class="ov-section-label ${animClass}">Proof of work</p>
      <div class="proof-slot ${animClass}">
        <strong>Screenshot / demo coming soon</strong>
        ${data.proof}
      </div>
    `;
  }

  let peopleHtml = '';
  if (data.people && data.people.length > 0) {
    const chips = data.people.map(p =>
      `<div class="person-chip ${animClass}">
        <span class="person-name">${p.name}</span>
        <span class="person-role">${p.role}</span>
      </div>`
    ).join('');
    peopleHtml = `
      <p class="ov-section-label ${animClass}">People I've worked with</p>
      <div class="people-grid">${chips}</div>
    `;
  }

  const whistleHtml = '';

  left.innerHTML = `
    <h2 class="ov-company ${animClass}" id="overlayTitle">${data.company}</h2>
    ${taglineHtml}
    <div class="ov-roles">${rolesHtml}</div>
  `;

  body.innerHTML = `
    ${whistleHtml}
    ${contentHtml}
    ${noteHtml}
    ${proofHtml}
    ${peopleHtml}
  `;

  // Character run-in removed â€” clean, readable text
}

export function initOverlay() {
  const overlay = document.getElementById('expOverlay');
  const closeBtn = document.getElementById('overlayClose');
  let lastFocused = null;

  function open(expId) {
    const data = EXP[expId];
    if (!data) return;
    lastFocused = document.activeElement;

    // Remove old tint, add new one
    overlay.classList.remove('tint-beyond', 'tint-monash', 'tint-headspace');
    overlay.classList.add(`tint-${expId}`);

    buildOverlay(data);
    overlay.removeAttribute('hidden');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('open');

        {
          // Standard staggered entrance
          const animatables = overlay.querySelectorAll('.ov-animate');
          animatables.forEach((el, i) => {
            setTimeout(() => el.classList.add('in'), 150 + i * 90);
          });
        }
      });
    });

    const scrollContainer = overlay.querySelector('.overlay-scroll');
    const progressBar = overlay.querySelector('.progress-bar');
    scrollContainer.scrollTop = 0;
    progressBar.style.width = '0%';

    // Scroll progress
    scrollContainer.addEventListener('scroll', () => {
      const max = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const pct = max > 0 ? scrollContainer.scrollTop / max : 0;
      progressBar.style.width = `${pct * 100}%`;
    }, { passive: true });

    // Initialise drag-to-compare slider if present
    initMumecSlider(overlay);

    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    overlay.addEventListener('transitionend', () => {
      overlay.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }, { once: true });
  }

  document.querySelectorAll('.story-cta[data-exp]').forEach(card => {
    card.addEventListener('click', () => open(card.dataset.exp));
  });

  closeBtn.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
}

// â”€â”€ Monash hover-to-compare slider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initMumecSlider(container) {
  const slider = container ? container.querySelector('#mumecSlider') : document.getElementById('mumecSlider');
  if (!slider) return;
  if (reduced) return;

  const before = slider.querySelector('.compare-before');
  const handle = slider.querySelector('.compare-handle');
  let isDragging = false;
  let rafId = null;
  let targetPct = 50;
  let currentPct = 50;

  function applyPosition(pct) {
    const p = Math.max(0, Math.min(100, pct));
    before.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
    handle.style.left = `${p}%`;
  }

  function lerpPosition() {
    const diff = targetPct - currentPct;
    if (Math.abs(diff) < 0.12) {
      currentPct = targetPct;
      applyPosition(currentPct);
      rafId = null;
      return;
    }
    currentPct += diff * 0.15;
    applyPosition(currentPct);
    rafId = requestAnimationFrame(lerpPosition);
  }

  function setTarget(x) {
    const rect = slider.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    targetPct = pct;
    if (!rafId) rafId = requestAnimationFrame(lerpPosition);
  }

  // Hover: slider follows mouse
  slider.addEventListener('mousemove', e => {
    if (!isDragging) setTarget(e.clientX);
  });

  // Touch: drag the handle
  handle.addEventListener('touchstart', e => { isDragging = true; e.preventDefault(); }, { passive: false });
  window.addEventListener('touchend', () => isDragging = false);
  window.addEventListener('touchmove', e => {
    if (isDragging) setTarget(e.touches[0].clientX);
  }, { passive: true });

  // Click: jump to position
  slider.addEventListener('click', e => {
    if (e.target === handle || e.target.closest('.compare-handle')) return;
    setTarget(e.clientX);
  });
}
