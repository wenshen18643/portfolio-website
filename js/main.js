/**
 * Main application entry point. Initializes all modules on DOM ready.
 * @module main
 */

import './modules/cursor.js';
import { scramble } from './modules/utils.js';
import { initializeHeroCanvas, initializeHeroEntranceSequence, initializeHeroParallax, initializeTypewriter } from './modules/hero.js';
import { initializeReveals } from './modules/reveals.js';
import { initializeDotNavigation } from './modules/dot-nav.js';
import { initializeCountUp } from './modules/count-up.js';
import { initializeOverlay } from './modules/overlays.js';
import { initializeStoryScroll } from './modules/story-scroll.js';
import { initializeProjectsScroll } from './modules/projects-scroll.js';
import { initializeAboutOrbs, initializeMagneticQuote, initializeStatHoverScramble } from './modules/about-effects.js';

document.addEventListener('DOMContentLoaded', () => {
  const nameFirst = document.querySelector('.name-first');
  const nameLast = document.querySelector('.name-last');

  if (nameFirst) scramble(nameFirst, 'LUM', 600, 150);
  if (nameLast) scramble(nameLast, 'WEN-SHEN', 950, 380);

  initializeHeroCanvas();
  initializeHeroEntranceSequence();
  initializeHeroParallax();
  initializeTypewriter();
  initializeReveals();
  initializeDotNavigation();
  initializeCountUp();
  initializeOverlay();
  initializeStoryScroll();
  initializeProjectsScroll();
  initializeAboutOrbs();
  initializeMagneticQuote();
  initializeStatHoverScramble();
});