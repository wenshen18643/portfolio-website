# Wen-Shen’s portfolio

A static HTML, CSS, and JavaScript portfolio. The interactive stories run entirely in the browser using fictional data. No API keys, backend, Mei checkout, WhatsApp membership, broker, or AI service is required.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To build a portable static site, run `npm run build` and serve `dist/`.

## Stories

- Customer service: full profile onboarding, consent, marketplace registration and verification, sample retrieval citations, and an illustrative prompt-injection boundary.
- Trading harness: fictional MT5 account 880042, configurable order proposals, a local per-order risk check, cancellation and confirmation. Prices and contract assumptions are fixed examples.
- Personal mode: a fictional owner workspace with task, draft, review, and handoff actions.
- Treasury: code → AI-assisted review → a scheduled workflow preview, using the same sample claims. Original before/after recordings remain available.
- Side project: Roblox work in progress. Replace the placeholder with supplied gameplay and a permitted playtest link later.

Edit `js/data/demos.js` for narrated scenes and `js/modules/demos.js` for interactive behavior. Personal mode and later treasury stages are illustrative; replace their scripts with verified details before describing them as production behavior. The sample retrieval answers are deterministic, not a live RAG evaluation.

Playback starts on request, supports pause/previous/next/seek, and pauses offscreen or when the browser tab is hidden. All stories have a separate interactive mode. Reduced-motion preferences disable decorative animation.

## Checks

```sh
npm run lint:fix
npm run lint
npm run format:check
npm run build
npx playwright install chromium
npm test
```

Browser tests cover consent, marketplace verification, order risk/confirmation/cancellation, unsafe text rendering, chapter switching, personal handoff, treasury preview, and mobile overflow. This is plain JavaScript, so no separate type compilation is configured.
