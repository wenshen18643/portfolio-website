/**
 * Experience overlay rendering, open/close logic, and compare slider.
 * @module overlays
 */

import { prefersReducedMotion } from './utils.js';
import { experienceData } from '../data/experience.js';

const overlayThemeClasses = ['theme-beyond', 'theme-monash', 'theme-headspace'];

const overlayThemeDecorations = {
  beyond: '<div class="darkroom-safelight"></div><div class="darkroom-vignette"></div>',
  monash: '<div class="ledger-margin"></div><div class="audit-stamp">Audited ✓</div>',
  headspace: '<div class="scrapbook-tape tape-a"></div><div class="scrapbook-tape tape-b"></div>',
};

/**
 * Builds overlay DOM content from experience data.
 *
 * @param {Object} data - Experience entry data object.
 */
function buildOverlayContent(data) {
  const watermarkElement = document.getElementById('overlayWatermark');
  const leftPanel = document.getElementById('overlayLeft');
  const bodyPanel = document.getElementById('overlayBody');

  watermarkElement.textContent = data.watermark;

  const animationClass = 'ov-animate';
  const staggerDelayMilliseconds = 60;

  const rolesHtml = data.roles.map(role =>
    `<p class="ov-role-line ${animationClass}"><strong class="ov-role-title">${role.title}</strong><span class="ov-role-sep"> · </span><span class="ov-role-period">${role.period}</span></p>`
  ).join('');

  const taglineHtml = data.tagline
    ? `<p class="ov-tagline ${animationClass}">${data.tagline}</p>`
    : '';

  let contentHtml = '';
  if (data.beforeAfter) {
    const beforeItems = data.beforeAfter.before.map((item, index) =>
      `<li class="${animationClass}" style="transition-delay: ${index * staggerDelayMilliseconds}ms">${item}</li>`
    ).join('');
    const afterItems = data.beforeAfter.after.map((item, index) =>
      `<li class="${animationClass}" style="transition-delay: ${(index + data.beforeAfter.before.length) * staggerDelayMilliseconds}ms">${item}</li>`
    ).join('');
    contentHtml = `
      <div class="ov-beforeafter ${animationClass}">
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
    const achievementsHtml = data.achievements.map((item, index) =>
      `<div class="ov-achievement-item ${animationClass}" style="transition-delay: ${index * staggerDelayMilliseconds}ms">${item}</div>`
    ).join('');
    contentHtml = `
      <p class="ov-section-label ${animationClass}">Unlocked abilities</p>
      <div class="ov-achievements">${achievementsHtml}</div>
    `;
  } else if (data.bullets) {
    const bulletsHtml = data.bullets.map((item, index) =>
      `<li class="${animationClass}" style="transition-delay: ${index * staggerDelayMilliseconds}ms">${item}</li>`
    ).join('');
    contentHtml = `
      <p class="ov-section-label ${animationClass}">What I did</p>
      <ul class="ov-bullets">${bulletsHtml}</ul>
    `;
  }

  const noteHtml = data.firstJobNote
    ? `<p class="ov-first-note ${animationClass}">${data.firstJobNote}</p>`
    : '';

  let proofHtml = '';
  if (data.proofVideo && data.beforeVideo) {
    proofHtml = `
      <div class="compare-slider ${animationClass}" id="mumecSlider">
        <div class="compare-after">
          <video src="${data.proofVideo}" autoplay muted loop playsinline preload="metadata"></video>
        </div>
        <div class="compare-before">
          <video src="${data.beforeVideo}" autoplay muted loop playsinline preload="metadata"></video>
        </div>
        <div class="compare-handle" aria-hidden="true">
          <span class="handle-grip"></span>
        </div>
      </div>
      <div class="compare-labels ${animationClass}">
        <span class="compare-label before-label">Before - Manual chaos</span>
        <span class="compare-label after-label">After - Yes I'm not doing anything</span>
      </div>
    `;
  } else if (data.proofVideo) {
    proofHtml = `
      <div class="proof-slot proof-video ${animationClass}">
        <video src="${data.proofVideo}" autoplay muted loop playsinline preload="metadata"></video>
      </div>
    `;
  } else if (data.proofImage) {
    proofHtml = `
      <p class="ov-section-label ${animationClass}">Where I worked</p>
      <div class="proof-slot ${animationClass}">
        <img src="${data.proofImage}" alt="${data.company} proof of work" loading="lazy">
      </div>
    `;
  } else if (data.proof) {
    proofHtml = `
      <p class="ov-section-label ${animationClass}">Proof of work</p>
      <div class="proof-slot ${animationClass}">
        <strong>Screenshot / demo coming soon</strong>
        ${data.proof}
      </div>
    `;
  }

  let peopleHtml = '';
  if (data.people && data.people.length > 0) {
    const chips = data.people.map(person =>
      `<div class="person-chip ${animationClass}">
        <span class="person-name">${person.name}</span>
        <span class="person-role">${person.role}</span>
      </div>`
    ).join('');
    peopleHtml = `
      <p class="ov-section-label ${animationClass}">People I've worked with</p>
      <div class="people-grid">${chips}</div>
    `;
  }

  leftPanel.innerHTML = `
    <h2 class="ov-company ${animationClass}" id="overlayTitle">${data.company}</h2>
    ${taglineHtml}
    <div class="ov-roles">${rolesHtml}</div>
  `;

  bodyPanel.innerHTML = `
    ${contentHtml}
    ${noteHtml}
    ${proofHtml}
    ${peopleHtml}
  `;
}

/**
 * Initializes the experience overlay open/close interactions.
 */
export function initializeOverlay() {
  const overlay = document.getElementById('expOverlay');
  const closeButton = document.getElementById('overlayClose');
  let lastFocusedElement = null;

  const initialRevealDelay = 150;
  const revealStaggerMilliseconds = 90;

  function openOverlay(experienceId) {
    const data = experienceData[experienceId];
    if (!data) return;
    lastFocusedElement = document.activeElement;

    overlay.classList.remove(...overlayThemeClasses);
    overlay.classList.add(`theme-${experienceId}`);

    const decorContainer = document.getElementById('overlayDecor');
    decorContainer.classList.remove('decor-in');
    decorContainer.innerHTML = overlayThemeDecorations[experienceId] || '';

    buildOverlayContent(data);
    overlay.removeAttribute('hidden');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('open');

        const animatables = overlay.querySelectorAll('.ov-animate');
        animatables.forEach((element, index) => {
          setTimeout(() => element.classList.add('in'), initialRevealDelay + index * revealStaggerMilliseconds);
        });

        const decorRevealDelay = initialRevealDelay + animatables.length * revealStaggerMilliseconds + 250;
        setTimeout(() => decorContainer.classList.add('decor-in'), prefersReducedMotion ? 0 : decorRevealDelay);
      });
    });

    const scrollContainer = overlay.querySelector('.overlay-scroll');
    const progressBar = overlay.querySelector('.progress-bar');
    scrollContainer.scrollTop = 0;
    progressBar.style.width = '0%';

    scrollContainer.addEventListener('scroll', () => {
      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const scrollPercentage = maxScroll > 0 ? scrollContainer.scrollTop / maxScroll : 0;
      progressBar.style.width = `${scrollPercentage * 100}%`;
    }, { passive: true });

    initializeCompareSlider(overlay);

    closeButton.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay() {
    overlay.classList.remove('open');
    overlay.addEventListener('transitionend', () => {
      overlay.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (lastFocusedElement) lastFocusedElement.focus();
    }, { once: true });
  }

  document.querySelectorAll('.story-cta[data-exp]').forEach(card => {
    card.addEventListener('click', () => openOverlay(card.dataset.exp));
  });

  closeButton.addEventListener('click', closeOverlay);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay.classList.contains('open')) closeOverlay();
  });
}

/**
 * Initializes the before/after video compare slider within an overlay.
 *
 * @param {HTMLElement} container - The overlay element to search within.
 */
function initializeCompareSlider(container) {
  const slider = container ? container.querySelector('#mumecSlider') : document.getElementById('mumecSlider');
  if (!slider) return;
  if (prefersReducedMotion) return;

  const beforeLayer = slider.querySelector('.compare-before');
  const handle = slider.querySelector('.compare-handle');
  let isDragging = false;
  let animationFrameId = null;
  let targetPercentage = 50;
  let currentPercentage = 50;

  const lerpSpeed = 0.15;
  const lerpThreshold = 0.12;

  function applySliderPosition(percentage) {
    const clamped = Math.max(0, Math.min(100, percentage));
    beforeLayer.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    handle.style.left = `${clamped}%`;
  }

  function animateSliderPosition() {
    const difference = targetPercentage - currentPercentage;
    if (Math.abs(difference) < lerpThreshold) {
      currentPercentage = targetPercentage;
      applySliderPosition(currentPercentage);
      animationFrameId = null;
      return;
    }
    currentPercentage += difference * lerpSpeed;
    applySliderPosition(currentPercentage);
    animationFrameId = requestAnimationFrame(animateSliderPosition);
  }

  function setSliderTarget(clientX) {
    const rect = slider.getBoundingClientRect();
    let percentage = ((clientX - rect.left) / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    targetPercentage = percentage;
    if (!animationFrameId) animationFrameId = requestAnimationFrame(animateSliderPosition);
  }

  slider.addEventListener('mousemove', event => {
    if (!isDragging) setSliderTarget(event.clientX);
  });

  handle.addEventListener('touchstart', event => {
    isDragging = true;
    event.preventDefault();
  }, { passive: false });

  window.addEventListener('touchend', () => isDragging = false);
  window.addEventListener('touchmove', event => {
    if (isDragging) setSliderTarget(event.touches[0].clientX);
  }, { passive: true });

  slider.addEventListener('click', event => {
    if (event.target === handle || event.target.closest('.compare-handle')) return;
    setSliderTarget(event.clientX);
  });
}
