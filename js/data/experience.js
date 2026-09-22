/** Content and media for the experience case studies. */
export const experienceData = {
  beyond: {
    company: "Beyond Photography",
    intro:
      "Mei started as a WhatsApp customer-service bot. It grew into a system that can manage customer state, connect people to trading strategies, work with live trading tools, and switch into DevMode when I need to fix something myself.",
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
        title: "DevMode.",
        nav: "DevMode",
        paragraphs: [
          "DevMode is the private mode I use when something needs fixing and I am away from my computer. I can start a session from WhatsApp, send a request, screenshot, or document, and follow the work from the same chat.",
          "The commands stay simple: /status checks the task, /cancel stops it, /model changes the model used for the next request, and /exit returns Mei to the normal assistant.",
        ],
        deepDive: [
          "DevMode keeps coding sessions separate from normal chat. /codex creates a fresh work session, while later messages are routed into that session with their attachments and conversation context. Progress updates come back through WhatsApp without exposing the shell as a general public interface.",
          "Command parsing happens before ordinary assistant routing, so session controls are deterministic. Model changes require a valid full model ID and optional reasoning effort; invalid shortcuts are rejected without changing the current configuration.",
          "Stopping and leaving are different operations. /cancel interrupts the current job, while /exit disables DevMode, stops pending coding work, keeps completed edits, and ensures the next /codex begins with a clean session.",
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
    company: "McFatty's",
    intro:
      "A Roblox restaurant-management game built around a deliberately silly loop: merge food, eat it, grow, refill the tray, and turn that momentum into a bigger restaurant. I designed and built the gameplay systems, server logic, NPC workers, progression, and interface as a personal project.",
    roles: [{ title: "Game designer & developer" }],
    sections: [
      {
        title: "A restaurant that grows with you.",
        nav: "Game overview",
        paragraphs: [
          "Players start with a small tray of food inside their own McFatty’s. Eating raises weight, the restaurant earns cash over time, and both systems feed a longer progression loop of menu discoveries, upgrades, agents, perks, and rebirths.",
          "I chose a ring of twenty restaurant plots around a shared garden district so every player gets a readable home base without losing the feeling of a larger multiplayer place. The repeated architecture also gave me a consistent template for stations, seating, doors, and decoration.",
        ],
        deepDive: [
          "Each plot is assembled from the same restaurant contract, but ownership and progression state are assigned at runtime. PlotService binds the player to a restaurant; StationService, SeatingService, WorkerService, and RestaurantDecor then attach their own behaviour without one enormous script owning the whole place.",
        ],
        media: {
          layout: "wide",
          images: [
            {
              src: new URL(
                "../../Images/Roblox/01-game-overview.jpg",
                import.meta.url,
              ).href,
              width: 1452,
              height: 793,
              label: "01 · Game overview",
              caption:
                "The shared restaurant district in Roblox Studio. I built the twenty-plot layout, reusable restaurant shell, roads, and central garden to make each player’s space easy to recognise while keeping the world cohesive. The next step is giving the garden district more reasons for players to cross paths.",
            },
          ],
        },
      },
      {
        title: "Merge. Eat. Refill. Sell.",
        nav: "Main mechanic",
        paragraphs: [
          "The main interaction is intentionally physical: drag matching foods together to raise their tier, move a meal to the table, then hold to eat it. That gives the idle economy a hands-on decision instead of reducing the game to waiting for a number to increase.",
          "I built the tray, drag-and-drop merge rules, food tiers, eating cadence, weight gain, and the tutorial that introduces the loop one action at a time. The same input path supports mouse, touch, and gamepad.",
        ],
        deepDive: [
          "The client owns immediate presentation for dragging, shrinking bites, animation, and screen-clamped prompts, while the server validates the action and returns the authoritative state. That split keeps the loop responsive without letting a client award itself food, weight, or cash.",
        ],
        media: {
          layout: "wide",
          images: [
            {
              src: new URL(
                "../../Images/Roblox/02-main-mechanic.jpg",
                import.meta.url,
              ).href,
              width: 1736,
              height: 793,
              label: "02 · The merge loop",
              caption:
                "The first playable tutorial asks the player to combine matching food directly on the tray. I implemented the drag interaction and staged coach marks instead of explaining the loop in a wall of text. It solves the hardest onboarding question: what do I touch first? I would next test how quickly a new player reaches their first higher-tier meal without help.",
            },
          ],
        },
      },
      {
        title: "One state, several systems.",
        nav: "System design",
        paragraphs: [
          "Agents are not just collectible cards. A hired agent occupies a station in the restaurant, carries level and rarity data, produces food, and has a client-side animated rig that reflects the server’s worker state.",
          "I kept definitions for workers, food, stations, upgrades, perks, achievements, and restaurant tiers in shared configuration modules. UI panels and world objects read the same definitions, which stops display copy, prices, and behaviour from drifting apart as the game grows.",
        ],
        deepDive: [
          "WorkerService creates and reconciles server-owned worker models. It replicates only compact attributes such as agent ID, station, scale, and frenzy state; AgentAnimator owns the limb poses on each client. Inspect prompts are enabled only for the restaurant owner, and missing character art falls back to a block rig so production logic never depends on a cosmetic asset.",
        ],
        media: {
          layout: "wide",
          images: [
            {
              src: new URL("../../Images/Roblox/03-system.jpg", import.meta.url)
                .href,
              width: 1736,
              height: 793,
              label: "03 · The agent system",
              caption:
                "The agent collection is the front end of a data-driven worker system. I implemented the shared definitions, unlock state, station assignment, rarity treatment, and matching in-world rigs. Centralising that data made it possible to add a worker without rewriting the panel and the restaurant separately; next I would add clearer previews of each agent’s effect before unlock.",
            },
          ],
        },
      },
      {
        title: "The expensive part was invisible.",
        nav: "Hard problem",
        paragraphs: [
          "Twenty plots can each contain stations, prompts, food props, cash bubbles, and animated workers. My first instinct was to update everything continuously from the server. That worked in a small test and became wasteful as the world filled out.",
          "I changed the boundary: the server owns outcomes and coarse state, while clients handle visual motion. Reconciliation runs once per second, animation state is sampled at ten hertz, scale is quantised before replication, and station requests are distance-checked and rate-limited.",
        ],
        deepDive: [
          "Quantising worker scale avoids replicating fourth-decimal changes nobody can see. Cash interactions have per-player request budgets and a maximum world distance. The worker service tags a fully assembled rig only after it is ready, so clients never animate a half-built model. Together, those choices reduce network churn and close obvious exploit paths without making the game feel delayed.",
        ],
        media: {
          layout: "wide",
          images: [
            {
              src: new URL(
                "../../Images/Roblox/04-difficult-problem.jpg",
                import.meta.url,
              ).href,
              width: 1452,
              height: 793,
              label: "04 · Designing for twenty plots",
              caption:
                "The full plot ring made the scaling problem visible: every restaurant repeats the same interactive systems. I moved cosmetic animation to clients, reduced replicated precision, and rate-limited server actions so adding plots did not multiply unnecessary work. I would next profile a full public server with Roblox’s MicroProfiler rather than relying on single-player Studio measurements.",
            },
          ],
        },
      },
      {
        title: "Testing changed the interface.",
        nav: "Improved result",
        paragraphs: [
          "Early builds treated the tray, eating prompt, shop, and stats as separate widgets. In play they competed for attention and the intended loop was easy to lose. I consolidated the important actions around the tray, kept progression stats readable at a glance, and made world prompts point to the actual control the player should use.",
          "The current result is calmer: the tray mirrors authoritative inventory, food art changes with tier, eating works anywhere outside another UI action, and the side rail keeps deeper systems available without covering the restaurant.",
        ],
        deepDive: [
          "The final pass also fixed input edge cases: processed UI clicks no longer trigger a bite, mouse release outside the window stops hold-to-eat, prompts share the same scaled GUI coordinate space, and tray visuals update only when a slot actually changes. Those are small details, but together they make the mechanic feel intentional rather than brittle.",
        ],
        media: {
          layout: "wide",
          images: [
            {
              src: new URL(
                "../../Images/Roblox/05-improved-result.jpg",
                import.meta.url,
              ).href,
              width: 1736,
              height: 793,
              label: "05 · The tested interface",
              caption:
                "The revised HUD keeps food, fill, bag, weight, calories, and cash in one readable loop while leaving the restaurant visible. I implemented the responsive tray, tier-specific food models, input guards, and screen-clamped prompts after playtesting exposed competing controls. Next I would test the hierarchy on small phones and reduce the remaining Studio-only debug controls before release.",
            },
          ],
        },
      },
    ],
  },
};
