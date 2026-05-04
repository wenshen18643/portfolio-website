export const PROJECTS = {
  trading: {
    title: 'AI Trading Agent',
    tags: ['LangChain', 'Tool Calling', 'Python', 'Node.js', 'Proxmox'],
    desc: 'Autonomous agent analyzing market signals and executing trade recommendations via structured tool calling. Built with prompt-driven multi-step reasoning that genuinely makes decisions not just pattern matching.',
    proof: 'Screenshot of agent trace, trade execution log, or system architecture diagram.',
  },
  lms: {
    title: 'Learning Management System',
    tags: ['Flask', 'MySQL', 'REST API', 'Python'],
    desc: 'Full-stack RESTful LMS with 15+ API endpoints, 50+ unit tests, and 3 distinct user roles. Designed for scalability with clean architecture and comprehensive test coverage.',
    proof: 'Database schema, API documentation, or frontend screenshot.',
  },
  budget: {
    title: 'Budget Dashboard',
    tags: ['Python', 'JavaScript', 'Data Pipeline'],
    desc: 'Python data pipeline + JS frontend that automated financial reporting. Cut manual reporting time by 80% through automated data ingestion, transformation, and visualization.',
    proof: 'Dashboard screenshot showing charts, pipeline flow diagram, or before/after metrics.',
  },
  whatsapp: {
    title: 'WhatsApp Chat Bot',
    tags: ['Node.js', 'WhatsApp API', 'Automation'],
    desc: 'Automated WhatsApp bot that handles inbound messages, sends status updates, and triggers backend workflows. Built to remove the need to manually respond to repetitive inquiries.',
    proof: 'Screenshot of chat flow, message logs, or bot architecture diagram.',
  },
};

export function initProjectOverlay() {
  const overlay = document.getElementById('projOverlay');
  const body = document.getElementById('projOverlayBody');
  const closeBtn = document.getElementById('projOverlayClose');
  let lastFocused = null;

  function open(projectId) {
    const data = PROJECTS[projectId];
    if (!data) return;
    lastFocused = document.activeElement;

    const tagsHtml = data.tags.map(t => `<li>${t}</li>`).join('');

    body.innerHTML = `
      <h2 class="proj-detail-title" id="projOverlayTitle">${data.title}</h2>
      <ul class="proj-detail-tags">${tagsHtml}</ul>
      <p class="proj-detail-desc">${data.desc}</p>
      <div class="proj-proof-slot">
        <strong>Proof of work</strong>
        ${data.proof}
      </div>
    `;

    overlay.removeAttribute('hidden');
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    let closed = false;
    function finish() {
      if (closed) return;
      closed = true;
      overlay.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }
    overlay.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 600);
  }

  document.querySelectorAll('.dream-card').forEach(card => {
    card.addEventListener('click', () => open(card.dataset.project));
  });

  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
}