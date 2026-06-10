/**
 * About section ambient orbs, magnetic quote, and stat hover scramble.
 * @module about-effects
 */

import { prefersReducedMotion, scramble } from './utils.js';

const offscreenCoordinate = -9999;
const magneticEffectRadius = 140;
const magneticMaxForce = 3.5;
const magneticSpringStrength = 0.06;
const magneticDampingFactor = 0.88;
const orbRevealStaggerMilliseconds = 200;
const sectionRevealThreshold = 0.15;

/**
 * Initializes ambient orb visibility when the about section enters view.
 */
export function initializeAboutOrbs() {
  const section = document.getElementById('about');
  const orbs = section?.querySelectorAll('.about-orb');
  if (!orbs?.length) return;

  if (prefersReducedMotion) {
    orbs.forEach(orb => orb.classList.add('is-visible'));
    return;
  }

  const orbObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        orbs.forEach((orb, index) => setTimeout(() => orb.classList.add('is-visible'), index * orbRevealStaggerMilliseconds));
        orbObserver.disconnect();
      }
    });
  }, { threshold: sectionRevealThreshold });

  orbObserver.observe(section);
}

/**
 * Wraps quote characters in spans and applies a magnetic repulsion
 * effect driven by mouse position.
 */
export function initializeMagneticQuote() {
  const section = document.getElementById('about');
  const quote = section?.querySelector('.about-quote');
  if (!quote) return;

  const html = quote.innerHTML.trim();
  const lines = html.split(/(<br\s*\/?>)/i);

  quote.innerHTML = '';
  const characters = [];

  lines.forEach((line, lineIndex) => {
    if (/^<br\s*\/?>$/i.test(line)) return;
    if (lineIndex > 0) quote.appendChild(document.createElement('br'));

    const words = line.split(/(\s+)/);
    words.forEach(word => {
      if (/^\s+$/.test(word)) {
        quote.appendChild(document.createTextNode(word));
      } else {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';

        for (const character of word) {
          const span = document.createElement('span');
          span.className = 'magnetic-char';
          span.textContent = character;
          wordSpan.appendChild(span);
          characters.push({
            element: span,
            x: 0,
            y: 0,
            velocityX: 0,
            velocityY: 0,
            centerX: 0,
            centerY: 0,
            phase: characters.length * 0.4
          });
        }
        quote.appendChild(wordSpan);
      }
    });
  });

  if (prefersReducedMotion) return;

  function measureCharacterCenters() {
    characters.forEach(character => {
      const rect = character.element.getBoundingClientRect();
      character.centerX = rect.left + rect.width / 2 + window.scrollX;
      character.centerY = rect.top + rect.height / 2 + window.scrollY;
    });
  }

  measureCharacterCenters();
  window.addEventListener('resize', measureCharacterCenters);

  let mouseX = offscreenCoordinate;
  let mouseY = offscreenCoordinate;

  section.addEventListener('mousemove', event => {
    mouseX = event.clientX + window.scrollX;
    mouseY = event.clientY + window.scrollY;
  });

  section.addEventListener('mouseleave', () => {
    mouseX = offscreenCoordinate;
    mouseY = offscreenCoordinate;
  });

  let time = 0;
  let animationFrameId = null;
  let isVisible = false;

  function updateFrame() {
    if (!isVisible) {
      animationFrameId = null;
      return;
    }
    time++;
    characters.forEach(character => {
      const deltaX = character.centerX - mouseX;
      const deltaY = character.centerY - mouseY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < magneticEffectRadius && distance > 0) {
        const force = (1 - distance / magneticEffectRadius) * magneticMaxForce;
        character.velocityX += (deltaX / distance) * force;
        character.velocityY += (deltaY / distance) * force;
      }

      character.velocityX += (0 - character.x) * magneticSpringStrength;
      character.velocityY += (0 - character.y) * magneticSpringStrength;

      character.velocityX *= magneticDampingFactor;
      character.velocityY *= magneticDampingFactor;

      character.x += character.velocityX;
      character.y += character.velocityY;

      const idleX = Math.sin(time * 0.001 + character.phase) * 1.5;
      const idleY = Math.cos(time * 0.0013 + character.phase * 1.3) * 1.2;

      character.element.style.transform = `translate(${(character.x + idleX).toFixed(2)}px, ${(character.y + idleY).toFixed(2)}px)`;
    });

    animationFrameId = requestAnimationFrame(updateFrame);
  }

  const visibilityObserver = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !animationFrameId) animationFrameId = requestAnimationFrame(updateFrame);
  });
  visibilityObserver.observe(section);
}

/**
 * Attaches scramble effects to stat labels on mouse enter.
 */
export function initializeStatHoverScramble() {
  if (prefersReducedMotion) return;

  document.querySelectorAll('.about-stats .stat').forEach(stat => {
    const label = stat.querySelector('.stat-l');
    if (!label) return;

    const originalText = label.textContent;
    stat.addEventListener('mouseenter', () => scramble(label, originalText, 300, 0));
    stat.addEventListener('mouseleave', () => label.textContent = originalText);
  });
}
