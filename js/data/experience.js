/** Content and media for the experience case studies. */
export const experienceData = {
  beyond: {
    company: "Beyond Photography",
    intro:
      "I joined as an AI Engineer Intern and continued part-time. The work started with a WhatsApp customer-service bot, then grew into trading tools, retrieval pipelines, a private coding mode I use for my own work.",
    roles: [
      { title: "Part-time AI Engineer" },
      { title: "AI Engineer Intern" },
    ],
    sections: [
      {
        title: "It started in WhatsApp.",
        nav: "Onboarding",
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
        nav: "Strategy market",
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
        nav: "Trading harness",
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
        nav: "Personal Codex",
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
              width: 1535,
              height: 1024,
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
    ],
  },
  monash: {
    company: "Monash Engineering Club",
    intro:
      "As Head Treasurer of the Monash University Malaysia Engineering Club, I oversee an annual budget of more than RM 300,000 across student clubs and events. The responsibility is financial, but a lot of the daily work is information: collecting it, checking it, and keeping it useful.",
    roles: [{ title: "Head Treasurer" }],
    sections: [
      {
        title: "First, I wrote the code.",
        nav: "The original automation",
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
        title: "Then AI made it a daily workflow.",
        nav: "Scheduled review",
        paragraphs: [
          "As AI became more capable, I moved from running the original scripts myself to scheduling the recurring treasury review in Codex. The daily MUMEC tracker and reply review brings that work into one routine.",
          "The task is scheduled for 1 PM each day. I still review the numbers and handle the decisions; the aim is to spend less time preparing the review and more time on the items that need attention.",
        ],
        media: {
          layout: "wide",
          images: [
            {
              src: new URL(
                "../../Images/Monash/scheduled-review.png",
                import.meta.url,
              ).href,
              width: 1919,
              height: 1028,
              label: "The daily treasury review, scheduled in Codex",
              caption:
                "The active schedule for the MUMEC tracker and reply review. This shows the recurring task setup; the original before-and-after recordings above show where the automation started.",
            },
          ],
        },
      },
    ],
  },
  headspace: {
    company: "HeadSpace SS15",
    intro:
      "Before the agents and automation, I worked as a co-working space coordinator. It was a very direct introduction to operations: people needed a space that worked, and someone had to keep the small problems from getting in their way.",
    roles: [{ title: "Co-working Space Coordinator" }],
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
      "A personal game project in development. This case study will use screenshots to explain the game, the systems behind it, and what I learned while building it.",
    roles: [{ title: "Personal project" }],
    sections: [
      {
        title: "Building the game.",
        paragraphs: [
          "The final case study will begin with the game’s core idea, then show the mechanic I built, the Roblox Studio systems behind it, and one problem that changed how I approached the design.",
          "Each screenshot will explain what the viewer is looking at, what I personally contributed, and why that part mattered. Playtesting will open when the game is ready to share.",
        ],
      },
    ],
  },
};
