/**
 * Hero section effects: animated canvas blobs, typewriter text, and entrance sequence.
 * @module hero
 */

import { prefersReducedMotion } from './utils.js';

const typewriterPhrases = [
  'Built as proof of work. So its less CViy.',
  'Monash SWE · CGPA 3.725',
  'Speaks 4 Languages Badly',
  'I Drive'
];

const typewriterInitialDelay = 1400;
const typewriterTypingInterval = 75;
const typewriterDeletingInterval = 40;
const typewriterPauseBeforeDelete = 1900;
const typewriterPauseBeforeNextPhrase = 280;

const heroSequenceRoleDelay = 1000;
const heroSequenceTaglineDelay = 1250;
const heroSequenceHintDelay = 1500;
const heroSequenceFadeDuration = 850;

const canvasBlobMouseRadius = 250;
const canvasBlobMouseForce = 30;
const canvasBlobPointCount = 12;

/**
 * Initializes the typewriter effect cycling through phrases.
 */
export function initializeTypewriter() {
  const element = document.querySelector('.role-typewriter');
  if (!element) return;

  if (prefersReducedMotion) {
    element.textContent = typewriterPhrases[0];
    return;
  }

  let phraseIndex = 0;
  let characterIndex = 0;
  let isDeleting = false;

  function tick() {
    const phrase = typewriterPhrases[phraseIndex];
    if (!isDeleting) {
      characterIndex++;
      element.textContent = phrase.slice(0, characterIndex);
      if (characterIndex === phrase.length) {
        isDeleting = true;
        setTimeout(tick, typewriterPauseBeforeDelete);
        return;
      }
      setTimeout(tick, typewriterTypingInterval);
    } else {
      characterIndex--;
      element.textContent = phrase.slice(0, characterIndex);
      if (characterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
        setTimeout(tick, typewriterPauseBeforeNextPhrase);
        return;
      }
      setTimeout(tick, typewriterDeletingInterval);
    }
  }

  setTimeout(tick, typewriterInitialDelay);
}

/**
 * Orchestrates the fade-in entrance sequence for hero sub-elements.
 */
export function initializeHeroEntranceSequence() {
  if (prefersReducedMotion) return;

  const roleElement = document.querySelector('.hero-role');
  const taglineElement = document.querySelector('.hero-tagline');
  const hintElement = document.querySelector('.scroll-hint');

  [roleElement, taglineElement, hintElement].forEach(element => {
    if (!element) return;
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = `opacity ${heroSequenceFadeDuration}ms cubic-bezier(0.16,1,0.3,1), transform ${heroSequenceFadeDuration}ms cubic-bezier(0.16,1,0.3,1)`;
  });

  const sequence = [
    { element: roleElement, delay: heroSequenceRoleDelay },
    { element: taglineElement, delay: heroSequenceTaglineDelay },
    { element: hintElement, delay: heroSequenceHintDelay }
  ];

  sequence.forEach(({ element, delay }) => {
    if (!element) return;
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, delay);
  });
}

const parallaxFirstLineFactor = -0.22;
const parallaxLastLineFactor = 0.30;

/**
 * Slides the hero name lines apart horizontally and fades the hero
 * content as the visitor scrolls past the first viewport.
 */
export function initializeHeroParallax() {
  if (prefersReducedMotion) return;

  const nameFirst = document.querySelector('.name-first');
  const nameLast = document.querySelector('.name-last');
  const content = document.querySelector('.hero-content');
  if (!nameFirst || !nameLast || !content) return;

  let isTicking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    if (scrollY <= viewportHeight) {
      nameFirst.style.transform = `translateX(${scrollY * parallaxFirstLineFactor}px)`;
      nameLast.style.transform = `translateX(${scrollY * parallaxLastLineFactor}px)`;
      content.style.opacity = String(Math.max(0, 1 - (scrollY / viewportHeight) * 1.3));
    }
    isTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(updateParallax);
    }
  }, { passive: true });
}

/**
 * Initializes the hero canvas with drifting blob shapes that react to mouse movement.
 */
export function initializeHeroCanvas() {
  if (prefersReducedMotion) return;

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const canvasContext = canvas.getContext('2d');
  let width, height;
  let mouseX = 0;
  let mouseY = 0;
  let isVisible = true;

  function resizeCanvas() {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvasContext.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  canvas.parentElement.addEventListener('mousemove', event => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
  });

  const blobs = [
    { x: 0.3, y: 0.4, radius: 180, color: 'oklch(0.94 0.16 122 / 0.55)', phase: 0, speed: 0.0004 },
    { x: 0.7, y: 0.6, radius: 220, color: 'oklch(0.80 0.21 132 / 0.30)', phase: 2, speed: 0.0003 },
    { x: 0.5, y: 0.3, radius: 150, color: 'oklch(0.93 0.18 118 / 0.45)', phase: 4, speed: 0.0005 },
  ];

  /**
   * Renders a single animated blob at the given time.
   *
   * @param {Object} blob - The blob configuration object.
   * @param {number} time - Current animation timestamp.
   */
  function drawBlob(blob, time) {
    const elapsedPhase = time * blob.speed + blob.phase;
    const centerX = blob.x * width + Math.sin(elapsedPhase) * 60 + Math.cos(elapsedPhase * 0.7) * 40;
    const centerY = blob.y * height + Math.cos(elapsedPhase * 0.8) * 50 + Math.sin(elapsedPhase * 1.2) * 30;

    const deltaX = centerX - mouseX;
    const deltaY = centerY - mouseY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    let mouseOffsetX = 0;
    let mouseOffsetY = 0;

    if (distance < canvasBlobMouseRadius && distance > 0) {
      const force = (canvasBlobMouseRadius - distance) / canvasBlobMouseRadius * canvasBlobMouseForce;
      mouseOffsetX = (deltaX / distance) * force;
      mouseOffsetY = (deltaY / distance) * force;
    }

    canvasContext.beginPath();
    for (let pointIndex = 0; pointIndex <= canvasBlobPointCount; pointIndex++) {
      const angle = (pointIndex / canvasBlobPointCount) * Math.PI * 2;
      const radius = blob.radius + Math.sin(angle * 3 + elapsedPhase * 2) * 20 + Math.cos(angle * 5 - elapsedPhase) * 15;
      const pointX = centerX + mouseOffsetX + Math.cos(angle) * radius;
      const pointY = centerY + mouseOffsetY + Math.sin(angle) * radius;
      if (pointIndex === 0) {
        canvasContext.moveTo(pointX, pointY);
      } else {
        canvasContext.lineTo(pointX, pointY);
      }
    }
    canvasContext.closePath();
    canvasContext.fillStyle = blob.color;
    canvasContext.fill();
  }

  let animationFrameId = null;

  /**
   * Main canvas animation loop.
   *
   * @param {number} now - Current animation timestamp.
   */
  function animate(now) {
    if (isVisible) {
      canvasContext.clearRect(0, 0, width, height);
      for (const blob of blobs) drawBlob(blob, now);
      animationFrameId = requestAnimationFrame(animate);
    } else {
      animationFrameId = null;
    }
  }

  const visibilityObserver = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !animationFrameId) animationFrameId = requestAnimationFrame(animate);
  });
  visibilityObserver.observe(canvas);

  animationFrameId = requestAnimationFrame(animate);
}