/** Content and media for the experience case studies. */
export const experienceData = {
  beyond: {
    company: "Beyond Photography",
    intro:
      "Mei started as a WhatsApp customer-service bot. It grew into a system that can manage customer state, connect people to trading strategies, work with live trading tools, and switch into MeiCodex when I need to fix something myself.",
    roles: [
      { title: "Part-time AI Engineer" },
      { title: "AI Engineer Intern" },
    ],
    sections: [
      {
        title: "Customer service, end to end.",
        nav: "Customer service",
        paragraphs: [
          "Mei takes a new customer from their first message to a usable profile, remembers where they stopped, and carries that context into the strategy marketplace. They can compare a strategy, register, verify their email, and finish setup without starting over on another channel.",
          "It also answers questions from company material across text, images, and voice. The useful part is not just finding a similar passage; it is keeping that material grounded as evidence instead of letting it quietly rewrite how the bot behaves.",
        ],
        deepDive: [
          "Onboarding is backed by stored profile state rather than a long prompt pretending to remember. Answers are normalised, written to the database, read back on every turn, and used to choose the next missing question. That makes the flow resumable and stops an older chat message from overwriting a field that is already saved.",
          "The marketplace handoff uses a separate API layer with input validation, broker mapping, active-account checks, task limits, a 24-hour registration session, and email verification. A selected strategy can ride along with signup and is only claimed after the customer verifies the account.",
          "For retrieval, Mei embeds the question, normalises the vectors, ranks chunks by cosine similarity, applies a relevance threshold, and returns only the strongest matches. Bad files, malformed vectors, low-confidence results, and unavailable embedding calls fail closed instead of being passed to the model as if they were trustworthy context.",
          "Prompt injection is handled as a boundary problem. Retrieved passages remain untrusted reference material, while system rules, identity checks, tool schemas, and approval gates stay outside that content. Even if a document tells Mei to ignore its rules, the document does not gain permission to call tools, change customer records, or place a trade.",
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
        title: "Trading from chat.",
        nav: "Trading bot",
        paragraphs: [
          "I built the trading layer so Mei could inspect a market, explain what it sees, and manage a real position from the same conversation. It can read indicators or charts, ask for anything missing, confirm the exact action, and report what the broker actually did.",
          "That last part matters. A suggested trade, an order waiting for approval, a broker fill, and an open position are four different states, so Mei treats them differently instead of replying with a vague ‘done.’",
        ],
        deepDive: [
          "A message is routed into typed tools for account data, prices, technical analysis, chart vision, orders, positions, and trade management. Indicator analysis and visual chart analysis stay separate and are attributed separately, so conflicting signals are shown rather than blended into a confident answer.",
          "Before execution, the harness checks that the MT5 account belongs to the caller, fills in the active account from stored context, validates order details, caps lot size against the account balance, checks margin, and queues the exact tool call for approval. Ambiguous replies cancel; a clear confirmation resumes the queued action without asking the model to invent it again.",
          "Orders go through a broker adapter that resolves the account’s symbol format and submits once. If the network fails after submission, Mei reconciles against live broker state before deciding whether anything opened. Unknown outcomes are never retried blindly, which avoids turning a timeout into a duplicate trade.",
          "Confirmed fills are recorded with deal and position IDs, then synced against live MT5 positions. Partial closes update the remaining volume, automated trades keep their task source, and failures remain visible instead of being rewritten as success.",
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
        title: "MeiCodex.",
        nav: "MeiCodex",
        paragraphs: [
          "MeiCodex is the private mode I use when something needs fixing and I am away from my computer. I can start a session from WhatsApp, send a request, screenshot, or document, and follow the work from the same chat.",
          "The commands stay simple: /status checks the task, /cancel stops it, /model changes the model used for the next request, and /exit returns Mei to the normal assistant.",
        ],
        deepDive: [
          "MeiCodex keeps coding sessions separate from normal chat. /codex creates a fresh work session, while later messages are routed into that session with their attachments and conversation context. Progress updates come back through WhatsApp without exposing the shell as a general public interface.",
          "Command parsing happens before ordinary assistant routing, so session controls are deterministic. Model changes require a valid full model ID and optional reasoning effort; invalid shortcuts are rejected without changing the current configuration.",
          "Stopping and leaving are different operations. /cancel interrupts the current job, while /exit disables MeiCodex, stops pending coding work, keeps completed edits, and ensures the next /codex begins with a clean session.",
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
      "A Roblox game I’m building in my spare time. It is still in development, so I’m using real Studio screenshots to show the game and the systems behind it as they take shape.",
    roles: [{ title: "Personal project" }],
    sections: [
      {
        title: "Still building it.",
        paragraphs: [
          "The screenshots will start with the core game loop, then show the systems that make it work and one problem that forced me to rethink the design. Each image only needs to explain what is happening, what I built, and why it matters.",
          "The game is not open for playtesting yet. I’ll add the public link when there is enough there for someone to have a proper session instead of landing in a half-finished build.",
        ],
        deepDive: [
          "The technical deep dive will stay tied to the live Studio project: how the game loop is split up, what runs on the server, what the client is allowed to request, and how the main systems share state. I’ll add the exact architecture with screenshots once the Roblox Studio connection is available in this task.",
        ],
      },
    ],
  },
};
