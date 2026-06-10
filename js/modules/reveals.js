/**
 * Scroll-triggered reveal animations for data-reveal elements.
 * @module reveals
 */

import { prefersReducedMotion } from './utils.js';

const revealThreshold = 0.08;
const revealRootMargin = '0px 0px -50px 0px';
const staggerDelayMilliseconds = 120;

/**
 * Initializes intersection observers that toggle the 'revealed' class
 * when elements enter the viewport.
 */
export function initializeReveals() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (prefersReducedMotion) {
    elements.forEach(element => element.classList.add('revealed'));
    return;
  }

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const siblings = [...element.parentElement.querySelectorAll('[data-reveal]')];
      const siblingIndex = siblings.indexOf(element);
      setTimeout(() => element.classList.add('revealed'), siblingIndex * staggerDelayMilliseconds);
      revealObserver.unobserve(element);
    });
  }, { threshold: revealThreshold, rootMargin: revealRootMargin });

  elements.forEach(element => revealObserver.observe(element));
}
