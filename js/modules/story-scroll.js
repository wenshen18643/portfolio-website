/**
 * Experience section scroll-driven story scenes with parallax backgrounds.
 * @module story-scroll
 */

import { prefersReducedMotion } from './utils.js';

const landingScrollThreshold = 0.15;
const exitScrollThreshold = 0.85;

const animationBounds = [
  { start: 0.00, end: 0.35 },
  { start: 0.25, end: 0.65 },
  { start: 0.55, end: 1.00 },
];

const uiBounds = [0, 0.30, 0.60, 1.0];

const fadeInPhaseLength = 0.12;
const fadeOutPhaseLength = 0.12;
const fadeInOpacityMultiplier = 1.8;
const fadeOutOpacityMultiplier = 2.0;

const mobileFadeInTranslateY = 40;
const mobileFadeInScaleStart = 0.96;
const mobileFadeOutTranslateY = -30;
const mobileFadeOutScaleEnd = 0.97;

const desktopFadeInRotateY = 35;
const desktopFadeInTranslateX = 30;
const desktopFadeInTranslateZ = -400;
const desktopFadeOutRotateY = -35;
const desktopFadeOutTranslateX = -30;
const desktopFadeOutTranslateZ = -400;

const labelRevealThreshold = 0.02;
const titleStartProgress = 0.04;
const titleEndProgress = 0.30;
const roleStartProgress = 0.20;
const roleEndProgress = 0.45;
const descriptionRevealThreshold = 0.50;
const callToActionRevealThreshold = 0.45;
const pointerEventsLowerBound = 0.05;
const pointerEventsUpperBound = 0.95;

const parallaxDepthMultiplier = 0.3;

const scrollCueHideThreshold = 0.03;
const mobileBreakpoint = 768;

/**
 * Wraps each text node inside a container in individually animated characters.
 *
 * @param {HTMLElement} container - The element whose text will be split.
 * @param {number} baseDelay - Base animation delay in milliseconds.
 */
function wrapTextInAnimatedCharacters(container, baseDelay) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.trim().length > 0) textNodes.push(node);
  }

  let characterIndex = 0;
  textNodes.forEach(textNode => {
    const text = textNode.textContent;
    const wrapper = document.createElement('span');
    const characters = [];

    for (let index = 0; index < text.length; index++) {
      const character = text[index];
      if (character === ' ') {
        characters.push(' ');
      } else {
        const delay = baseDelay + characterIndex * 15;
        characters.push(`<span class="char-run" style="animation-delay:${delay}ms">${character}</span>`);
        characterIndex++;
      }
    }

    wrapper.innerHTML = characters.join('');
    while (wrapper.firstChild) {
      textNode.parentNode.insertBefore(wrapper.firstChild, textNode);
    }
    textNode.parentNode.removeChild(textNode);
  });
}

/**
 * Splits scroll-text elements into per-character spans for animation.
 */
function splitScrollTextIntoCharacters() {
  document.querySelectorAll('[data-scroll-text]').forEach(element => {
    const text = element.textContent;
    element.innerHTML = '';
    element.setAttribute('aria-label', text);

    const words = text.split(' ').filter(word => word.length > 0);
    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.whiteSpace = 'nowrap';
      wordSpan.style.display = 'inline-block';

      for (let characterIndex = 0; characterIndex < word.length; characterIndex++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'scroll-char';
        charSpan.textContent = word[characterIndex];
        wordSpan.appendChild(charSpan);
      }

      element.appendChild(wordSpan);

      if (wordIndex < words.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
    });
  });
}

/**
 * Initializes the scroll-driven experience story section.
 */
export function initializeStoryScroll() {
  const container = document.querySelector('.story-scroll-container');
  const sticky = document.querySelector('.story-sticky');
  const scenes = document.querySelectorAll('.story-scene');
  const backgroundScenes = document.querySelectorAll('.story-bg-scene');
  const progressFill = document.querySelector('.story-progress-fill');
  const progressDots = document.querySelectorAll('.story-progress-dot');
  const scrollCue = document.querySelector('.story-scroll-cue');
  const headerCompany = document.querySelector('.exp-header-company');
  const headerDots = document.querySelectorAll('.exp-header-dot');
  const phases = Array.from(scenes).map(scene => scene.dataset.phase || '');

  if (!container || !sticky || !scenes.length) return;

  if (prefersReducedMotion) {
    scenes.forEach(scene => scene.classList.add('active'));
    backgroundScenes.forEach(background => background.classList.add('active'));
    if (headerCompany && phases.length) headerCompany.textContent = phases[0];
    return;
  }

  const isMobile = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`).matches;
  const sceneCount = scenes.length;

  splitScrollTextIntoCharacters();

  /**
   * Determines which scene should be considered active for UI state.
   *
   * @param {number} progress - Scroll progress from 0 to 1.
   * @returns {number} Index of the active scene.
   */
  function getActiveSceneIndex(progress) {
    for (let index = 0; index < sceneCount; index++) {
      if (progress >= uiBounds[index] && progress < uiBounds[index + 1]) return index;
    }
    return sceneCount - 1;
  }

  /**
   * Computes local progress within a single scene's animation bounds.
   *
   * @param {number} progress - Overall scroll progress.
   * @param {number} sceneIndex - Index of the scene.
   * @returns {number} Local progress clamped between 0 and 1.
   */
  function getLocalProgress(progress, sceneIndex) {
    const bounds = animationBounds[sceneIndex];
    return Math.max(0, Math.min(1, (progress - bounds.start) / (bounds.end - bounds.start)));
  }

  /**
   * Updates all scene transforms, opacity, and character animations
   * based on current scroll position.
   */
  function updateScenes() {
    const rect = container.getBoundingClientRect();
    const containerHeight = container.offsetHeight;
    const stickyHeight = sticky.offsetHeight;
    const maxScroll = containerHeight - stickyHeight;
    const scrollProgress = Math.max(0, Math.min(1, -rect.top / maxScroll));
    const progressPercentage = scrollProgress * 100;
    const activeSceneIndex = getActiveSceneIndex(scrollProgress);

    if (scrollCue) {
      scrollCue.classList.toggle('hidden', scrollProgress > scrollCueHideThreshold);
    }
    if (progressFill) progressFill.style.width = `${progressPercentage}%`;

    progressDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeSceneIndex);
    });

    if (headerCompany && phases[activeSceneIndex]) {
      headerCompany.textContent = phases[activeSceneIndex];
    }

    headerDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeSceneIndex);
    });

    let maxLocalProgress = -1;
    let focusedScene = null;

    scenes.forEach((scene, sceneIndex) => {
      const localProgress = getLocalProgress(scrollProgress, sceneIndex);
      const isFirstSceneLanding = sceneIndex === 0 && scrollProgress < landingScrollThreshold;
      const isLastSceneLanding = sceneIndex === sceneCount - 1 && scrollProgress > exitScrollThreshold;

      if (localProgress > maxLocalProgress && localProgress <= 1) {
        maxLocalProgress = localProgress;
        focusedScene = scene;
      }

      let rotateY = 0;
      let translateX = 0;
      let translateZ = 0;
      let opacity = 0;
      let mobileTranslateY = 0;
      let mobileScale = 1;

      if (isFirstSceneLanding || isLastSceneLanding) {
        opacity = 1;
      } else if (localProgress > 0 && localProgress <= 1) {
        if (localProgress < fadeInPhaseLength) {
          const phaseProgress = localProgress / fadeInPhaseLength;
          opacity = Math.min(1, phaseProgress * fadeInOpacityMultiplier);
          if (isMobile) {
            mobileTranslateY = mobileFadeInTranslateY * (1 - phaseProgress);
            mobileScale = mobileFadeInScaleStart + (1 - mobileFadeInScaleStart) * phaseProgress;
          } else {
            rotateY = desktopFadeInRotateY * (1 - phaseProgress);
            translateX = desktopFadeInTranslateX * (1 - phaseProgress);
            translateZ = desktopFadeInTranslateZ * (1 - phaseProgress);
          }
        } else if (localProgress < (1 - fadeOutPhaseLength)) {
          opacity = 1;
        } else {
          const phaseProgress = (localProgress - (1 - fadeOutPhaseLength)) / fadeOutPhaseLength;
          opacity = Math.max(0, 1 - phaseProgress * fadeOutOpacityMultiplier);
          if (isMobile) {
            mobileTranslateY = mobileFadeOutTranslateY * phaseProgress;
            mobileScale = 1 - (1 - mobileFadeOutScaleEnd) * phaseProgress;
          } else {
            rotateY = desktopFadeOutRotateY * phaseProgress;
            translateX = desktopFadeOutTranslateX * phaseProgress;
            translateZ = desktopFadeOutTranslateZ * phaseProgress;
          }
        }
      }

      if (isMobile) {
        scene.style.transform = `translateY(calc(-50% + ${mobileTranslateY}px)) scale(${mobileScale})`;
      } else {
        scene.style.transform = `translateY(-50%) rotateY(${rotateY}deg) translateX(${translateX}%) translateZ(${translateZ}px)`;
      }
      scene.style.opacity = String(opacity);

      const titleCharacters = scene.querySelectorAll('.story-company .scroll-char');
      const roleCharacters = scene.querySelectorAll('.story-role .scroll-char');
      const label = scene.querySelector('.story-label');
      const description = scene.querySelector('.story-desc');
      const callToAction = scene.querySelector('.story-cta');

      const isActive = (localProgress > 0 && localProgress <= 1) || isFirstSceneLanding || isLastSceneLanding;

      if (isActive) {
        scene.classList.add('active');

        if (isFirstSceneLanding || isLastSceneLanding) {
          if (label) label.classList.add('in');
          titleCharacters.forEach(character => character.classList.add('in'));
          roleCharacters.forEach(character => character.classList.add('in'));
          if (description) description.classList.add('in');
          if (callToAction) callToAction.classList.add('in');
        } else {
          if (label) label.classList.toggle('in', localProgress > labelRevealThreshold);

          const titleProgress = Math.max(0, Math.min(1, (localProgress - titleStartProgress) / (titleEndProgress - titleStartProgress)));
          const titleRevealCount = Math.floor(titleProgress * titleCharacters.length);
          titleCharacters.forEach((character, index) => character.classList.toggle('in', index < titleRevealCount));

          const roleProgress = Math.max(0, Math.min(1, (localProgress - roleStartProgress) / (roleEndProgress - roleStartProgress)));
          const roleRevealCount = Math.floor(roleProgress * roleCharacters.length);
          roleCharacters.forEach((character, index) => character.classList.toggle('in', index < roleRevealCount));

          if (description) description.classList.toggle('in', localProgress > descriptionRevealThreshold);
          if (callToAction) callToAction.classList.toggle('in', localProgress > callToActionRevealThreshold);
        }
      } else {
        scene.classList.remove('active');
        if (label) label.classList.remove('in');
        titleCharacters.forEach(character => character.classList.remove('in'));
        roleCharacters.forEach(character => character.classList.remove('in'));
        if (description) description.classList.remove('in');
        if (callToAction) callToAction.classList.remove('in');
      }
    });

    const activeLocalProgress = getLocalProgress(scrollProgress, activeSceneIndex);
    scenes.forEach(scene => {
      const isInteractive = scene === scenes[activeSceneIndex] &&
        activeLocalProgress > pointerEventsLowerBound &&
        activeLocalProgress < pointerEventsUpperBound;
      scene.style.pointerEvents = isInteractive ? 'auto' : 'none';
    });

    backgroundScenes.forEach((background, index) => {
      const localProgress = getLocalProgress(scrollProgress, index);
      if (localProgress > 0 && localProgress <= 1) {
        background.classList.add('active');
      } else {
        background.classList.remove('active');
      }
    });

    document.querySelectorAll('.story-bg .shape, .story-bg .cat-silhouette').forEach(shape => {
      const depth = parseFloat(shape.dataset.depth || '0');
      const backgroundScene = shape.closest('.story-bg-scene');
      if (!backgroundScene) return;
      const sceneIndex = parseInt(backgroundScene.dataset.scene);
      const localProgress = getLocalProgress(scrollProgress, sceneIndex);

      if (localProgress > 0 && localProgress <= 1) {
        const parallaxX = (localProgress - 0.5) * depth * parallaxDepthMultiplier;
        shape.style.setProperty('--parallax-x', `${parallaxX}px`);
      }
    });
  }

  let isTicking = false;

  function handleScroll() {
    if (!isTicking) {
      requestAnimationFrame(() => {
        updateScenes();
        isTicking = false;
      });
      isTicking = true;
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  updateScenes();
}
