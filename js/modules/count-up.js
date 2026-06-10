/**
 * Count-up number animation triggered by intersection.
 * @module count-up
 */

import { prefersReducedMotion } from './utils.js';

const defaultDurationMilliseconds = 1500;
const revealThreshold = 0.5;

/**
 * Animates an element's text from zero to its target numeric value.
 *
 * @param {HTMLElement} element - The element containing the target number.
 */
function animateCount(element) {
  const target = parseFloat(element.dataset.count);
  const suffix = element.dataset.suffix || '';
  const isDecimal = element.dataset.count.includes('.');
  const duration = defaultDurationMilliseconds;
  const startTime = performance.now();

  (function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 4);
    const currentValue = target * easedProgress;
    element.textContent = (isDecimal ? currentValue.toFixed(3) : Math.round(currentValue)) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  })(startTime);
}

/**
 * Initializes count-up observers for all elements with a data-count attribute.
 */
export function initializeCountUp() {
  if (prefersReducedMotion) return;

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: revealThreshold });

  document.querySelectorAll('[data-count]').forEach(element => countObserver.observe(element));
}
