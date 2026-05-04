import { reduced } from './utils.js';

function runInChars(container, baseDelay) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while (n = walker.nextNode()) {
    if (n.textContent.trim().length > 0) nodes.push(n);
  }

  let idx = 0;
  nodes.forEach(node => {
    const text = node.textContent;
    const wrapper = document.createElement('span');
    const chars = [];
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === ' ') {
        chars.push(' ');
      } else {
        const delay = baseDelay + idx * 15;
        chars.push(`<span class="char-run" style="animation-delay:${delay}ms">${c}</span>`);
        idx++;
      }
    }
    wrapper.innerHTML = chars.join('');
    while (wrapper.firstChild) {
      node.parentNode.insertBefore(wrapper.firstChild, node);
    }
    node.parentNode.removeChild(node);
  });
}

function splitScrollText() {
  document.querySelectorAll('[data-scroll-text]').forEach(el => {
    const text = el.textContent;
    el.innerHTML = '';
    el.setAttribute('aria-label', text);

    const words = text.split(' ').filter(w => w.length > 0);
    words.forEach((word, wi) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.whiteSpace = 'nowrap';
      wordSpan.style.display = 'inline-block';

      for (let i = 0; i < word.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'scroll-char';
        charSpan.textContent = word[i];
        wordSpan.appendChild(charSpan);
      }

      el.appendChild(wordSpan);

      if (wi < words.length - 1) {
        el.appendChild(document.createTextNode(' '));
      }
    });
  });
}

export function initStoryScroll() {
  const container = document.querySelector('.story-scroll-container');
  const sticky = document.querySelector('.story-sticky');
  const scenes = document.querySelectorAll('.story-scene');
  const bgScenes = document.querySelectorAll('.story-bg-scene');
  const progressFill = document.querySelector('.story-progress-fill');
  const progressDots = document.querySelectorAll('.story-progress-dot');
  const scrollCue = document.querySelector('.story-scroll-cue');
  const expHeaderCompany = document.querySelector('.exp-header-company');
  const expHeaderDots = document.querySelectorAll('.exp-header-dot');
  const phases = Array.from(scenes).map(s => s.dataset.phase || '');

  if (!container || !sticky || !scenes.length) return;

  // On mobile or reduced motion: just show everything
  const isMobile = window.matchMedia('(max-width: 767px)').matches || reduced;
  if (isMobile) {
    scenes.forEach(s => s.classList.add('active'));
    bgScenes.forEach(b => b.classList.add('active'));
    if (expHeaderCompany && phases.length) expHeaderCompany.textContent = phases[0];
    return;
  }

  splitScrollText();

  function update() {
    const rect = container.getBoundingClientRect();
    const containerHeight = container.offsetHeight;
    const stickyHeight = sticky.offsetHeight;
    const maxScroll = containerHeight - stickyHeight;

    const scrollProgress = Math.max(0, Math.min(1, -rect.top / maxScroll));
    const sceneCount = scenes.length;

    // Scroll cue: hide once user scrolls past 8% of first scene
    if (scrollCue) {
      scrollCue.classList.toggle('hidden', scrollProgress > 0.03);
    }

    // Progress bar
    const progressPct = scrollProgress * 100;
    if (progressFill) progressFill.style.width = `${progressPct}%`;

    // Progress dots
    const activeSceneIdx = Math.min(Math.floor(scrollProgress * sceneCount), sceneCount - 1);
    progressDots.forEach((d, i) => {
      d.classList.toggle('active', i === activeSceneIdx);
    });

    // Update persistent header phase + dots
    if (expHeaderCompany && phases[activeSceneIdx]) {
      expHeaderCompany.textContent = phases[activeSceneIdx];
    }
    expHeaderDots.forEach((d, i) => {
      d.classList.toggle('active', i === activeSceneIdx);
    });

    // 3D transforms + character reveals for all scenes
    let maxLocalProgress = -1;
    let focusedScene = null;

    scenes.forEach((scene, i) => {
      const localProgress = Math.max(0, Math.min(1, scrollProgress * sceneCount - i));

      // Track most "settled" scene for pointer-events
      if (localProgress > maxLocalProgress && localProgress <= 1) {
        maxLocalProgress = localProgress;
        focusedScene = scene;
      }

      // 3D transform based on local progress — DRAMATIC page-turn
      let rotateY = 0, translateX = 0, translateZ = 0, opacity = 0;

      if (localProgress > 0 && localProgress <= 1) {
        if (localProgress < 0.20) {
          // Entering from right (0-20%)
          const p = localProgress / 0.20;
          // Opacity ramps up fast (first half of entrance)
          opacity = Math.min(1, p * 2.5);
          // 3D swing in from right
          rotateY = 55 * (1 - p);
          translateX = 55 * (1 - p);
          translateZ = -900 * (1 - p);
        } else if (localProgress < 0.80) {
          // Settled (20-80%)
          rotateY = 0;
          translateX = 0;
          translateZ = 0;
          opacity = 1;
        } else {
          // Exiting to left (80-100%)
          const p = (localProgress - 0.80) / 0.20;
          // Opacity stays up until near the end
          opacity = Math.max(0, 1 - p * 2.5);
          // 3D swing out to left
          rotateY = -55 * p;
          translateX = -55 * p;
          translateZ = -900 * p;
        }
      }

      scene.style.transform = `translateY(-50%) rotateY(${rotateY}deg) translateX(${translateX}%) translateZ(${translateZ}px)`;
      scene.style.opacity = String(opacity);

      // Character reveals using local progress
      const titleChars = scene.querySelectorAll('.story-company .scroll-char');
      const roleChars = scene.querySelectorAll('.story-role .scroll-char');
      const label = scene.querySelector('.story-label');
      const desc = scene.querySelector('.story-desc');
      const cta = scene.querySelector('.story-cta');

      if (localProgress > 0 && localProgress <= 1) {
        scene.classList.add('active');

        // Label at 2%
        if (label) label.classList.toggle('in', localProgress > 0.02);

        // Title: 5% → 40%
        const titleStart = 0.05, titleEnd = 0.40;
        const titleP = Math.max(0, Math.min(1, (localProgress - titleStart) / (titleEnd - titleStart)));
        const titleCount = Math.floor(titleP * titleChars.length);
        titleChars.forEach((c, i) => c.classList.toggle('in', i < titleCount));

        // Role: 30% → 60%
        const roleStart = 0.30, roleEnd = 0.60;
        const roleP = Math.max(0, Math.min(1, (localProgress - roleStart) / (roleEnd - roleStart)));
        const roleCount = Math.floor(roleP * roleChars.length);
        roleChars.forEach((c, i) => c.classList.toggle('in', i < roleCount));

        // Desc at 55%
        if (desc) desc.classList.toggle('in', localProgress > 0.55);

        // CTA at 50%
        if (cta) cta.classList.toggle('in', localProgress > 0.50);
      } else {
        scene.classList.remove('active');
        if (label) label.classList.remove('in');
        titleChars.forEach(c => c.classList.remove('in'));
        roleChars.forEach(c => c.classList.remove('in'));
        if (desc) desc.classList.remove('in');
        if (cta) cta.classList.remove('in');
      }
    });

    // Only the currently active scene gets pointer events
    const activeLocalProgress = Math.max(0, Math.min(1, scrollProgress * sceneCount - activeSceneIdx));
    scenes.forEach(s => {
      s.style.pointerEvents = (s === scenes[activeSceneIdx] && activeLocalProgress > 0.05 && activeLocalProgress < 0.95) ? 'auto' : 'none';
    });

    // Background scene activation
    bgScenes.forEach((bg, i) => {
      const localProgress = Math.max(0, Math.min(1, scrollProgress * sceneCount - i));
      if (localProgress > 0 && localProgress <= 1) {
        bg.classList.add('active');
      } else {
        bg.classList.remove('active');
      }
    });

    // Background shape parallax
    document.querySelectorAll('.story-bg .shape, .story-bg .cat-silhouette').forEach(shape => {
      const depth = parseFloat(shape.dataset.depth || '0');
      const bgScene = shape.closest('.story-bg-scene');
      if (!bgScene) return;
      const sceneIdx = parseInt(bgScene.dataset.scene);
      const localProgress = Math.max(0, Math.min(1, scrollProgress * sceneCount - sceneIdx));

      if (localProgress > 0 && localProgress <= 1) {
        const parallaxX = (localProgress - 0.5) * depth * 0.3;
        shape.style.setProperty('--parallax-x', `${parallaxX}px`);
      }
    });
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}
