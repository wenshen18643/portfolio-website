/**
 * Utility functions for text animations and shared state.
 * @module utils
 */

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrambleAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-+';
const frameIntervalMilliseconds = 16;

/**
 * Scrambles an element's text content through random characters before resolving
 * to the target string.
 *
 * @param {HTMLElement} element - The DOM element whose text will be scrambled.
 * @param {string} target - The final text to display.
 * @param {number} duration - Total scramble duration in milliseconds.
 * @param {number} delay - Delay before starting the scramble in milliseconds.
 */
export function scramble(element, target, duration, delay) {
  if (prefersReducedMotion) {
    element.textContent = target;
    return;
  }

  const totalFrames = Math.round(duration / frameIntervalMilliseconds);
  let currentFrame = 0;

  setTimeout(() => {
    (function tick() {
      let output = '';
      for (let characterIndex = 0; characterIndex < target.length; characterIndex++) {
        const revealAt = (characterIndex / target.length) * totalFrames * 0.6;
        output += currentFrame >= revealAt
          ? target[characterIndex]
          : target[characterIndex] === ' ' ? ' ' : scrambleAlphabet[Math.floor(Math.random() * scrambleAlphabet.length)];
      }
      element.textContent = output;
      currentFrame++;
      if (currentFrame <= totalFrames) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = target;
      }
    })();
  }, delay);
}