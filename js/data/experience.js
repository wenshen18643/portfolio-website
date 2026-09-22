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
          "The first job was helping customers get from a first message to a completed profile. Mei gathers their language, experience, preferred markets, trading style, and risk appetite through a conversation, then guides them towards the strategy marketplace.",
          "Behind the chat, I built retrieval workflows for text, images, and voice, and worked through prompt-injection boundaries. Source material should help answer a question without becoming a new set of instructions for the bot.",
        ],
        media: {
          layout: "sequence",
          images: [
            {
              src: new URL(
                "../../Images/Mei/onboarding-profile.png",
                import.meta.url,
              ).href,
              width: 905,
              height: 1041,
              label: "Getting to know the customer",
              caption:
                "Mei asks one question at a time, building the context needed for later conversations. This exchange captures a first-time user choosing a language and describing how they trade.",
            },
            {
              src: new URL(
                "../../Images/Mei/onboarding-confirmation.png",
                import.meta.url,
              ).href,
              width: 897,
              height: 619,
              label: "Completing the profile",
              caption:
                "The original onboarding continues with trading size, broker and account details, followed by explicit acknowledgement of the risk disclaimer. The user can see what is being requested before moving on.",
            },
          ],
        },
      },
      {
        title: "From onboarding to the strategy market.",
        paragraphs: [
          "The next step connects the conversation to the strategy website. A customer can ask for strategies, compare the available options, and choose one without having to restart the conversation elsewhere.",
        ],
        media: {
          layout: "sequence",
          images: [
            {
              src: new URL(
                "../../Images/Mei/strategy-marketplace-redacted.png",
                import.meta.url,
              ).href,
              width: 1165,
              height: 1350,
              label: "Choosing and setting up a strategy",
              caption:
                "Mei checks existing strategy context, asks for confirmation, and guides the user through marketplace registration and email verification. The final message reports that the strategy has been set up. Registration credentials are redacted; this image was edited for privacy.",
            },
          ],
        },
      },
      {
        title: "Then the agent needed tools.",
        paragraphs: [
          "I built a custom trading harness so Mei could move from answering questions to inspecting markets and taking actions. The workflow connects a request to structured tools, then brings the result back into the same chat.",
          "These examples show the sequence: inspect the market, confirm an order, and follow what the system actually did. A proposed action and a completed trade have different messages.",
        ],
        media: {
          layout: "sequence",
          images: [
            {
              src: new URL(
                "../../Images/Mei/market-analysis.png",
                import.meta.url,
              ).href,
              width: 952,
              height: 1030,
              label: "01 · See the market",
              caption:
                "A request for gold charts returns M5, M15, H1, H4 and D1 views with a written breakdown of indicators and market context. The customer can compare timeframes from one conversation.",
            },
            {
              src: new URL(
                "../../Images/Mei/trade-execution.png",
                import.meta.url,
              ).href,
              width: 951,
              height: 1033,
              label: "02 · Confirm, execute, manage",
              caption:
                "Mei asks for missing order details and an explicit YES before submitting the trade. The conversation then shows a fill receipt, a position check, and a confirmed partial close of 0.05 lots from a 0.1-lot position.",
            },
            {
              src: new URL(
                "../../Images/Mei/trade-updates.png",
                import.meta.url,
              ).href,
              width: 910,
              height: 995,
              label: "03 · Follow the automation",
              caption:
                "When a strategy acts, Mei sends updates with its task name, trade size, position references and stated reason. These messages give the user a record of execution without having to ask for every update.",
            },
          ],
        },
      },
      {
        title: "A coding workspace inside WhatsApp.",
        paragraphs: [
          "I added a private /codex mode for my own development work. Sending /codex starts a coding session, so I can pass in a request, screenshot or document from WhatsApp and follow the work there.",
          "The session exposes explicit controls: /status checks progress, /cancel stops work, and /exit leaves Codex mode. Model selection uses /model with the full model identifier and an optional reasoning effort.",
        ],
        media: {
          layout: "wide",
          images: [
            {
              src: new URL("../../Images/Mei/codex-work.png", import.meta.url)
                .href,
              width: 1477,
              height: 985,
              label: "A bug report becomes a coding task",
              caption:
                "I forward two bugs into a new /codex session. The agent traces the relevant code, preserves existing changes, reports progress and sends a verification file. It also distinguishes the tested account fix from the website issue that still needs more information.",
            },
            {
              src: new URL(
                "../../Images/Mei/codex-controls.png",
                import.meta.url,
              ).href,
              width: 1475,
              height: 981,
              label: "Precise commands, a clear way out",
              caption:
                "The short model name is rejected; /model gpt-5.6-sol medium succeeds while preserving the conversation. /exit stops pending coding work, keeps existing edits and returns to the regular Mei chat. The next /codex starts a fresh session.",
            },
          ],
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
