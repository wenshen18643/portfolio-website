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

  const isMobile = window.matchMedia('(max-width: 768px)').matches || reduced;
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
    const progressPct = scrollProgress * 100;
    const activeSceneIdx = Math.min(Math.floor(scrollProgress * sceneCount), sceneCount - 1);

    if (scrollCue) { scrollCue.classList.toggle('hidden', scrollProgress > 0.03); }
    if (progressFill) progressFill.style.width = `${progressPct}%`;
    progressDots.forEach((d, i) => { d.classList.toggle('active', i === activeSceneIdx); });
    if (expHeaderCompany && phases[activeSceneIdx]) { expHeaderCompany.textContent = phases[activeSceneIdx]; }
    expHeaderDots.forEach((d, i) => { d.classList.toggle('active', i === activeSceneIdx); });

    let maxLocalProgress = -1;
    let focusedScene = null;

    scenes.forEach((scene, i) => {
      const localProgress = Math.max(0, Math.min(1, scrollProgress * sceneCount - i));

      if (localProgress > maxLocalProgress && localProgress <= 1) {
        maxLocalProgress = localProgress;
        focusedScene = scene;
      }

      let rotateY = 0, translateX = 0, translateZ = 0, opacity = 0;

      if (localProgress > 0 && localProgress <= 1) {
        if (localProgress < 0.20) {
          const p = localProgress / 0.20;
          opacity = Math.min(1, p * 2.5);
          rotateY = 55 * (1 - p);
          translateX = 55 * (1 - p);
          translateZ = -900 * (1 - p);
        } else if (localProgress < 0.80) {
          rotateY = 0;
          translateX = 0;
          translateZ = 0;
          opacity = 1;
        } else {
          const p = (localProgress - 0.80) / 0.20;
          opacity = Math.max(0, 1 - p * 2.5);
          rotateY = -55 * p;
          translateX = -55 * p;
          translateZ = -900 * p;
        }
      }

      scene.style.transform = `translateY(-50%) rotateY(${rotateY}deg) translateX(${translateX}%) translateZ(${translateZ}px)`;
      scene.style.opacity = String(opacity);

      const titleChars = scene.querySelectorAll('.story-company .scroll-char');
      const roleChars = scene.querySelectorAll('.story-role .scroll-char');
      const label = scene.querySelector('.story-label');
      const desc = scene.querySelector('.story-desc');
      const cta = scene.querySelector('.story-cta');

      if (localProgress > 0 && localProgress <= 1) {
        scene.classList.add('active');

        if (label) label.classList.toggle('in', localProgress > 0.02);

        const titleStart = 0.05, titleEnd = 0.40;
        const titleP = Math.max(0, Math.min(1, (localProgress - titleStart) / (titleEnd - titleStart)));
        const titleCount = Math.floor(titleP * titleChars.length);
        titleChars.forEach((c, i) => c.classList.toggle('in', i < titleCount));

        const roleStart = 0.30, roleEnd = 0.60;
        const roleP = Math.max(0, Math.min(1, (localProgress - roleStart) / (roleEnd - roleStart)));
        const roleCount = Math.floor(roleP * roleChars.length);
        roleChars.forEach((c, i) => c.classList.toggle('in', i < roleCount));

        if (desc) desc.classList.toggle('in', localProgress > 0.55);
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

    const activeLocalProgress = Math.max(0, Math.min(1, scrollProgress * sceneCount - activeSceneIdx));
    scenes.forEach(s => {
      s.style.pointerEvents = (s === scenes[activeSceneIdx] && activeLocalProgress > 0.05 && activeLocalProgress < 0.95) ? 'auto' : 'none';
    });

    bgScenes.forEach((bg, i) => {
      const localProgress = Math.max(0, Math.min(1, scrollProgress * sceneCount - i));
      if (localProgress > 0 && localProgress <= 1) {
        bg.classList.add('active');
      } else {
        bg.classList.remove('active');
      }
    });

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