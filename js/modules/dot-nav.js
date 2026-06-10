/**
 * Dot navigation highlighting based on visible sections.
 * @module dot-nav
 */

/**
 * Initializes the dot navigation to track which section is in view.
 */
export function initializeDotNavigation() {
  const links = document.querySelectorAll('.dot-link');
  const sections = [...links].map(link => document.querySelector(link.getAttribute('href')));

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const sectionIndex = sections.indexOf(entry.target);
      if (sectionIndex === -1) return;
      links.forEach((link, index) => link.classList.toggle('active', index === sectionIndex));
    });
  }, { threshold: 0.4 });

  sections.forEach(section => section && sectionObserver.observe(section));
}
