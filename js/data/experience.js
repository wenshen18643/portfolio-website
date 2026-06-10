/**
 * Experience data for overlay content generation.
 * @module experience
 */

export const experienceData = {
  beyond: {
    company: 'Beyond Photography',
    watermark: 'BP',
    roles: [
      { title: 'Part-time AI Engineer', period: 'Feb 2026 to Present' },
      { title: 'AI Engineer Intern', period: 'Oct 2025 to Feb 2026' },
    ],
    bullets: [
      'Created a whatsapp chat bot.. super boring intern work.',
      'Built an AI agent with ability to analyze data and place trades automatically.',
      'Cut deployment time from 20 minutes to 30 seconds via automated container cloning. Saves ~10 hours monthly. I automate anything I have to do more than twice.',
      'Built a multi-modal RAG pipeline: ingests voice, images, and unstructured text into a unified retrieval layer. Basically, it reads everything.',
      'Proxmox infrastructure ops: VM provisioning, container management, resource allocation, and occasional networking detective work at 2am. Unfortunately.',
    ],
    people: [],
    proof: null,
  },
  monash: {
    company: 'Monash University Malaysia Engineering Club',
    watermark: 'MUMEC',
    roles: [
      { title: 'Head Treasurer', period: 'Jul 2025 to Present' },
    ],
    bullets: [
      'Overseeing <strong>300K+ Ringgit</strong> annual budget across 15+ student clubs and flagship events. Zero audit flags, zero missed deadlines.',
      'Built a Python pipeline that pulls data from Asana, cleans it, and writes structured budget tracking to spreadsheets. Manual work: 5 hrs/week → 30 min. My predecessor copy-pasted; I wrote logic.',
      'Still treasurer because nobody else wants to deal with spreadsheets. Can\'t blame them.',
    ],
    people: [],
    proofVideo: 'videos/monash-after-60s.mp4',
    beforeVideo: 'videos/monash-before-60s.mp4',
  },
  headspace: {
    company: 'HeadSpace SS15',
    watermark: 'HS',
    tagline: 'The origin story',
    vibe: 'playful',
    roles: [
      { title: 'Co-working Space Coordinator', period: 'Jan 2024 to Present' },
    ],
    achievements: [
      'Managed a co-working space for 20+ tenants. Kept Wi-Fi breathing, coffee flowing, and printers alive against their will.',
      'Handled booking coordination and tenant relations. Learned that most problems are solved by listening first, fixing second.',
      'Coordinated 5+ community events. Respect to people who do this full-time cause it dam hard.',
    ],
    firstJobNote: 'My first real job. Not exactly related to Software Engineering, but everyone starts somewhere.',
    proofImage: 'Images/Headspace/headspace_bg.jpeg',
    people: [],
  },
};
