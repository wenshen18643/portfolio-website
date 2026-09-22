/** Content and media for the experience case studies. */
export const experienceData = {
  beyond: {
    company: "Beyond Photography",
    intro:
      "I joined as an AI Engineer Intern and continued part-time. The work started with a WhatsApp customer-service bot, then grew into trading tools, retrieval pipelines, and the infrastructure needed to keep them running.",
    roles: [
      { title: "Part-time AI Engineer", period: "Feb 2026 — Present" },
      { title: "AI Engineer Intern", period: "Oct 2025 — Feb 2026" },
    ],
    sections: [
      {
        title: "It started in WhatsApp.",
        paragraphs: [
          "The first job was helping customers get from a first message to a completed onboarding flow. Mei asks for the details it needs one question at a time, remembers the conversation, and guides customers towards the strategy marketplace.",
          "Answering questions meant working with the information behind the chat. I built retrieval workflows for text, images, and voice, and worked through the boundaries between useful source material and prompt-injection attempts. A retrieved document should inform an answer, not rewrite the bot’s instructions.",
        ],
        media: {
          label: "Customer onboarding, the strategy marketplace, and retrieval",
          caption:
            "A recorded walkthrough will show the actual customer journey and how the bot handles questions.",
        },
      },
      {
        title: "Then the agent needed tools.",
        paragraphs: [
          "The trading work moved beyond answering a question. I built a custom harness around the model so it could work with account context, inspect market information, and call structured tools.",
          "The surrounding system matters as much as the model: identifying the right account, validating an action, handling a failed request, and reporting what actually happened. A proposed trade and an executed trade need to remain distinguishable.",
        ],
        media: {
          label: "The custom trading harness",
          caption:
            "Recording to follow: a request, the tool workflow, and the resulting account state.",
        },
      },
      {
        title: "A workspace of my own.",
        paragraphs: [
          "My personal Codex mode takes the same interest in useful agents into a workspace meant for me. It brings my own context and tools into the way I work, with a different boundary from the customer-facing bot.",
          "The recording will walk through that personal workflow rather than expose the private workspace itself.",
        ],
        media: {
          label: "Personal Codex mode",
          caption: "Personal workflow recording coming soon.",
        },
      },
      {
        title: "Keeping it running.",
        paragraphs: [
          "Alongside the agents, I worked on Proxmox infrastructure, VM provisioning, container management, and deployment automation. Automating container cloning reduced a repeated deployment process from roughly 20 minutes to 30 seconds.",
          "The common thread was reducing repeated work: less manual setup, clearer workflows, and more time to investigate the parts that actually needed attention.",
        ],
      },
    ],
  },
  monash: {
    company: "Monash Engineering Club",
    intro:
      "As Head Treasurer of the Monash University Malaysia Engineering Club, I oversee an annual budget of more than RM 300,000 across student clubs and events. The responsibility is financial, but a lot of the daily work is information: collecting it, checking it, and keeping it useful.",
    roles: [{ title: "Head Treasurer", period: "Jul 2025 — Present" }],
    sections: [
      {
        title: "First, I wrote the code.",
        paragraphs: [
          "The starting point was repetitive spreadsheet work. I built a Python pipeline to pull data from Asana, clean it, and write structured updates into the budget tracker.",
          "That gave the work a repeatable process and reduced the time spent manually moving information. These are the original before-and-after recordings.",
        ],
        media: {
          videos: [
            {
              src: new URL(
                "../../videos/monash-before-60s.mp4",
                import.meta.url,
              ).href,
              label: "Before · the manual workflow",
            },
            {
              src: new URL("../../videos/monash-after-60s.mp4", import.meta.url)
                .href,
              label: "After · the original automation",
            },
          ],
        },
      },
      {
        title: "Then AI got better.",
        paragraphs: [
          "As AI became more capable, I started looking beyond moving rows. The next useful step was helping review the information: finding missing details, making sense of updates, and preparing something I could check.",
          "The responsibility still sits with me. The point is to spend less time assembling the review and more time on the exceptions that need a decision.",
        ],
        media: {
          label: "The AI-assisted treasury workflow",
          caption: "A new recording will show how the review process evolved.",
        },
      },
      {
        title: "From running it to scheduling it.",
        paragraphs: [
          "The next part of the story is scheduled work in Codex: preparing the recurring review and bringing the result back to me.",
          "The aim is a useful handoff with the changes and outstanding questions made clear. I still review the numbers and handle the decisions.",
        ],
        media: {
          label: "Scheduled work in Codex",
          caption: "Workflow recording coming soon.",
        },
      },
    ],
  },
  headspace: {
    company: "HeadSpace SS15",
    intro:
      "Before the agents and automation, I worked as a co-working space coordinator. It was a very direct introduction to operations: people needed a space that worked, and someone had to keep the small problems from getting in their way.",
    roles: [
      { title: "Co-working Space Coordinator", period: "Jan 2024 — Present" },
    ],
    sections: [
      {
        title: "The everyday work.",
        paragraphs: [
          "I supported a space with more than 20 tenants, coordinated bookings, and handled tenant questions. Some days that meant keeping the Wi-Fi and printers working; others meant listening carefully enough to understand what someone actually needed.",
        ],
        media: {
          image: new URL(
            "../../Images/Headspace/headspace_bg.jpeg",
            import.meta.url,
          ).href,
          label: "HeadSpace SS15",
          caption: "The co-working space where I started.",
        },
      },
      {
        title: "A space is also its people.",
        paragraphs: [
          "I helped coordinate community events and kept communication moving between the people using the space. The work required organisation, but also patience when plans changed or something stopped working.",
          "That experience still shapes how I approach software: understand the person and the problem first, then work out what needs fixing. The technical solution is only part of the job.",
        ],
      },
    ],
  },
  roblox: {
    company: "Roblox",
    intro:
      "A personal game project in development. I’m keeping the details under wraps until I have gameplay worth showing.",
    roles: [{ title: "Personal project", period: "In development" }],
    sections: [
      {
        title: "Inside the build.",
        paragraphs: [
          "Gameplay footage and a closer look at the development process will be added here. Playtesting will open once the game is ready to share.",
        ],
        media: { label: "Gameplay preview", caption: "Recording coming soon." },
      },
    ],
  },
};
