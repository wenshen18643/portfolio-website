/**
 * Project section scroll-triggered animations: terminal typing, route bars,
 * and chat bubbles. Each scene reveals whatever demos it contains.
 * @module projects-scroll
 */

import { prefersReducedMotion } from './utils.js';

const terminalLines = {
  trading: [
    { styleClass: 't-prompt', text: '> analyze_market(ticker="AAPL")' },
    { styleClass: 't-blank' },
    { styleClass: 't-agent', text: 'Agent: Identified bullish divergence on 4h chart.' },
    { styleClass: 't-tool', text: 'Tool: fetch_technical_indicators(AAPL, [RSI, MACD, EMA20])' },
    { styleClass: 't-result', text: 'Result: RSI 62, MACD crossing above signal, EMA20 support at $178.4' },
    { styleClass: 't-blank' },
    { styleClass: 't-agent', text: 'Agent: Confidence 0.74 — executing LONG position.' },
    { styleClass: 't-tool', text: 'Tool: place_order(symbol=AAPL, side=BUY, qty=10, type=LIMIT, price=179.00)' },
    { styleClass: 't-result', text: 'Result: Order filled @ $178.95. Position opened.' },
    { styleClass: 't-blank' },
    { styleClass: 't-prompt', text: '> _', hasCursor: true },
  ],
};

const terminalBlankLineDelay = 80;
const terminalResultLineDelay = 60;
const terminalDefaultLineDelay = 45;

const routeBarStaggerMilliseconds = 120;
const chatBubbleStaggerMilliseconds = 180;

const revealThreshold = 0.25;
const revealRootMargin = '0px 0px -60px 0px';

/**
 * Types terminal lines sequentially into a container.
 *
 * @param {HTMLElement} container - The terminal body element.
 * @param {string} projectId - Identifier for the terminal content set.
 */
function typeTerminalLines(container, projectId) {
  const lines = terminalLines[projectId];
  if (!lines) return;

  container.innerHTML = '';
  let lineIndex = 0;

  function renderNextLine() {
    if (lineIndex >= lines.length) return;
    const line = lines[lineIndex];
    const element = document.createElement('span');
    element.className = `t-line ${line.styleClass}`;

    if (line.hasCursor) {
      element.innerHTML = `${line.text}<span class="t-cursor"></span>`;
    } else {
      element.textContent = line.text;
    }

    container.appendChild(element);
    lineIndex++;

    const delay = line.styleClass === 't-blank'
      ? terminalBlankLineDelay
      : line.styleClass === 't-result'
        ? terminalResultLineDelay
        : terminalDefaultLineDelay;

    setTimeout(renderNextLine, delay);
  }

  renderNextLine();
}

/**
 * Renders all terminal lines instantly without animation.
 *
 * @param {HTMLElement} container - The terminal body element.
 * @param {string} projectId - Identifier for the terminal content set.
 */
function renderAllTerminalLines(container, projectId) {
  const lines = terminalLines[projectId];
  if (!lines) return;

  container.innerHTML = lines.map(line => {
    const cursorHtml = line.hasCursor ? '<span class="t-cursor"></span>' : '';
    return `<span class="t-line ${line.styleClass}">${line.text}${cursorHtml}</span>`;
  }).join('');
}

/**
 * Adds the `in` class to a list of elements with a staggered delay.
 *
 * @param {NodeListOf<Element>} elements - Elements to reveal.
 * @param {number} staggerMilliseconds - Delay between each reveal.
 */
function revealWithStagger(elements, staggerMilliseconds) {
  elements.forEach((element, index) => {
    setTimeout(() => element.classList.add('in'), index * staggerMilliseconds);
  });
}

/**
 * Triggers every demo animation contained inside a project scene.
 *
 * @param {HTMLElement} scene - The project scene entering the viewport.
 */
function revealSceneDemos(scene) {
  scene.querySelectorAll('[data-terminal]').forEach(terminal => {
    typeTerminalLines(terminal, terminal.dataset.terminal);
  });
  revealWithStagger(scene.querySelectorAll('.route-bar'), routeBarStaggerMilliseconds);
  revealWithStagger(scene.querySelectorAll('.chat-bubble'), chatBubbleStaggerMilliseconds);
}

/**
 * Initializes scroll-triggered animations for all project scenes.
 */
export function initializeProjectsScroll() {
  if (prefersReducedMotion) {
    document.querySelectorAll('[data-terminal]').forEach(element => {
      renderAllTerminalLines(element, element.dataset.terminal);
    });
    document.querySelectorAll('.chat-bubble, .route-bar').forEach(element => element.classList.add('in'));
    return;
  }

  const revealedScenes = new Set();

  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || revealedScenes.has(entry.target)) return;
      revealedScenes.add(entry.target);
      revealSceneDemos(entry.target);
    });
  }, { threshold: revealThreshold, rootMargin: revealRootMargin });

  document.querySelectorAll('.project-scene').forEach(scene => projectObserver.observe(scene));
}