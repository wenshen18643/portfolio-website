# Wen-Shen’s portfolio

A static HTML, CSS and JavaScript portfolio. The home page retains its original design. Experience buttons open scrollable case studies: an introduction and role context, explanations of the work, and supporting images or video.

Beyond Photography covers the customer bot, trading harness, and personal coding mode. Treasury follows code → AI-assisted work → scheduled work, retaining the original before/after recordings. HeadSpace covers space operations and community work. Roblox appears within Experience as a clearly labelled personal project.

```sh
npm ci
npm run dev
```

Screenshots for the Mei case study live in `Images/Mei/`, ordered from onboarding through trading to personal Codex mode. Each `media.images` entry includes a label, caption and intrinsic dimensions to reserve space while loading. Related screenshots are grouped into keyboard-accessible workflow tabs, with readable captions and large images. Chapter tabs show one stage at a time without jumping down the page. The marketplace image is privacy-edited; never replace it with the unredacted registration screenshot.

## Adding the recordings

Content lives in `js/data/experience.js`. Add a recording under `videos/`, then set the corresponding section’s `media.video` to `new URL('../../videos/your-recording.mp4', import.meta.url).href`. Keep `label` as the accessible description and `caption` as the explanation below it. Missing recordings show a simple placeholder without fake playback controls. Existing video elements use native controls and do not autoplay.

The interactive chat, account simulator, model API, and credentials are no longer needed. The website makes no model requests and has no dependency on the Mei repository.

## Checks and publishing

```sh
npm run lint:fix
npm run lint
npm run format:check
npm run build
npm test
```

Serve `dist/` or deploy through the existing Vercel integration. Browser tests cover every experience, content order, media, keyboard focus, mobile overflow, and the absence of the old interactive demos. There is no TypeScript compilation step.
