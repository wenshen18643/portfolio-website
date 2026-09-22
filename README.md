# Wen-Shen’s portfolio

HTML, CSS, and JavaScript with a server-only AI chat endpoint. Open Beyond Photography for the customer bot, trading harness, and personal-mode chapters. Open Head Treasurer for code → AI → scheduled work. Side projects contains the Roblox work in progress.

```sh
npm ci
npm run dev
```

The demo account runs locally in the visitor’s browser. Trades, quotes, strategies, customer details, and workspace actions are fictional. The account remembers positions and balances across chapters until the experience is closed or the page is reloaded. No real broker or WhatsApp connection exists.

## AI configuration

Set `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` in `.env.local` for local development, or in the Vercel project’s Production and Preview environment variables. Never prefix the key with `VITE_`: it must only be read by the server. `.env.local` is ignored by Git. No runtime dependency on the Mei repository exists.

Vercel serves `api/chat.js` as a server function; Vite provides the same endpoint during development. The model interprets casual messages and answers questions. The deterministic account engine validates proposals, requires confirmation, and calculates account state. Offline/provider-failure mode remains usable and is explicitly labeled OFFLINE DEMO. Personal-mode free text uses the same model but cannot execute commands.

Each model request is bounded to 500 output tokens, 20 seconds, and a 16 KB request. The endpoint has a 20 requests/minute/IP in-memory limit; this is per warm function instance, not a global billing cap. Configure provider spending limits or a shared gateway limit for a global budget.

Chat history and simulated account context are sent to OpenRouter for replies. Only enter fictional details. Private history from the source project was consulted to understand workflows and is not bundled or sent to the model.

## Checks and deployment

```sh
npm run lint:fix
npm run lint
npm run format:check
npm run build
npx playwright install chromium
npm test
```

Vercel builds with `npm run build`, serves `dist/`, and deploys the API function. A static-only host can run the offline demo but cannot provide AI replies. Plain JavaScript has no separate type compilation step.

Tests cover conversation state, onboarding consent, strategy verification, trade risk, confirmations, closures, P&L, model routing, key isolation, failure fallback, and mobile/modal navigation. Edit `js/data/demos.js` for walkthroughs, `js/modules/demo-bot.js` for account behavior, and `api/chat.js` for model instructions. Roblox gameplay and a permitted playtest link can be added when supplied.
