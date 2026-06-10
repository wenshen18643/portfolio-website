/**
 * Custom cursor with hover detection, click feedback, and smooth interpolation.
 * @module cursor
 */

import { prefersReducedMotion } from './utils.js';

const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
const cursorElement = document.querySelector('.cursor');

const interactiveSelectors = 'a, button, [data-cursor-hover], input, textarea, .story-cta, .overlay-back, .contact-resume';

const cursorSmoothingFactor = 0.12;
const cursorRotationSmoothing = 0.15;
const cursorIdleRotationDecay = 0.1;
const cursorMovementThreshold = 0.5;
const cursorRotationScale = 0.08;

/**
 * Initializes the custom cursor if the device supports fine pointer input
 * and the user has not requested reduced motion.
 */
function initializeCursor() {
  if (!cursorElement || prefersReducedMotion || isCoarsePointer) {
    if (cursorElement) cursorElement.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let rotation = 0;

  document.addEventListener('mousemove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  document.addEventListener('mouseover', event => {
    const target = event.target.closest(interactiveSelectors);
    if (target) cursorElement.classList.add('hover');
  });

  document.addEventListener('mouseout', event => {
    const target = event.target.closest(interactiveSelectors);
    if (target) cursorElement.classList.remove('hover');
  });

  document.addEventListener('mousedown', () => {
    cursorElement.classList.add('click');
    spawnClickPing(mouseX, mouseY);
  });

  document.addEventListener('mouseup', () => {
    cursorElement.classList.remove('click');
  });

  /**
   * Creates a brief expanding ring at the click location.
   *
   * @param {number} x - Horizontal coordinate in viewport pixels.
   * @param {number} y - Vertical coordinate in viewport pixels.
   */
  function spawnClickPing(x, y) {
    const ping = document.createElement('div');
    ping.className = 'cursor-ping';
    ping.style.left = `${x}px`;
    ping.style.top = `${y}px`;
    document.body.appendChild(ping);
    requestAnimationFrame(() => ping.classList.add('pop'));
    ping.addEventListener('animationend', () => ping.remove());
  }

  /**
   * Smoothly interpolates cursor position and rotation each frame.
   */
  function updateCursorFrame() {
    const deltaX = mouseX - cursorX;
    const deltaY = mouseY - cursorY;
    cursorX += deltaX * cursorSmoothingFactor;
    cursorY += deltaY * cursorSmoothingFactor;

    const speed = Math.hypot(deltaX, deltaY);
    if (speed > cursorMovementThreshold) {
      const targetRotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI) * cursorRotationScale;
      rotation += (targetRotation - rotation) * cursorRotationSmoothing;
    } else {
      rotation += (0 - rotation) * cursorIdleRotationDecay;
    }

    cursorElement.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) rotate(${rotation}deg)`;
    requestAnimationFrame(updateCursorFrame);
  }

  updateCursorFrame();
}

initializeCursor();
