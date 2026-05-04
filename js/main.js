import { scramble } from './modules/utils.js';
import { initHeroCanvas, initHeroSequence, initTypewriter } from './modules/hero.js';
import { initReveals } from './modules/reveals.js';
import { initDotNav } from './modules/dot-nav.js';
import { initCountUp } from './modules/count-up.js';
import { initOverlay } from './modules/overlays.js';
import { initStoryScroll } from './modules/story-scroll.js';
import { initDreamStage } from './modules/dream-stage.js';
import { initProjectOverlay } from './data/projects.js';
import { initAboutOrbs, initMagneticQuote, initStatHoverScramble } from './modules/about-effects.js';
import { initBridgeMarquee } from './modules/bridge-marquee.js';

document.addEventListener('DOMContentLoaded', () => {
  scramble(document.querySelector('.name-first'), 'LUM', 600, 150);
  scramble(document.querySelector('.name-last'), 'WEN-SHEN', 950, 380);

  initHeroCanvas();
  initHeroSequence();
  initTypewriter();
  initReveals();
  initDotNav();
  initCountUp();
  initOverlay();
  initStoryScroll();
  initDreamStage();
  initProjectOverlay();
  initAboutOrbs();
  initMagneticQuote();
  initStatHoverScramble();
  initBridgeMarquee();
});