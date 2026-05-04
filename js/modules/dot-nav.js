export function initDotNav() {
  const links = document.querySelectorAll('.dot-link');
  const sections = [...links].map(l => document.querySelector(l.getAttribute('href')));

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = sections.indexOf(entry.target);
      if (idx === -1) return;
      links.forEach((l, i) => l.classList.toggle('active', i === idx));
    });
  }, { threshold: 0.4 });

  sections.forEach(s => s && io.observe(s));
}
