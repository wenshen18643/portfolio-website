# Design System: Greenhouse

One drenched green identity. Every surface on the site is a tonal step of a single green hue (oklch hue 110-152). Sections shift tone act by act as the visitor scrolls; nothing leaves the family.

## Visual Theme

Playful engineer poster site. Electric chartreuse drench bookends (hero, contact), pistachio paper for reading (about), deep forest and ink for the cinematic dark acts (experience, projects). Sections transition as stacked sheets: each act caps itself with a rounded top edge (`--seam`) and pulls up over the previous surface. Reference energy: acid-poster confidence tempered into a garden, never neon-on-black.

## Color Palette

Defined in `css/base/tokens.css`. All colors are OKLCH.

| Token | Value | Role |
|---|---|---|
| `--lime` | `oklch(0.89 0.21 128)` | Drench surface (hero, contact, lime bridge) |
| `--lime-bright` | `oklch(0.92 0.22 127)` | Accent on dark surfaces |
| `--cream` | `oklch(0.97 0.02 110)` | Text on dark surfaces |
| `--forest` | `oklch(0.27 0.06 150)` | Experience act surface |
| `--ink` | `oklch(0.18 0.04 152)` | Projects/bridge surface, text on lime |
| `--ink-deep` | `oklch(0.14 0.03 152)` | Terminal/recessed panels |
| `--leaf` | `oklch(0.44 0.14 148)` | Accessible accent on light surfaces |

Semantic tokens (`--bg`, `--surface`, `--text`, `--text-dim`, `--muted`, `--accent`, `--border`) are remapped per zone via `.zone-lime` and `.zone-dark` classes on sections. New components must consume semantic tokens only, never raw palette values, so they work in every zone.

Selection is always ink-on-lime. Fixed chrome (custom cursor, dot nav) uses white + `mix-blend-mode: difference` to survive all zones.

## Typography

- **Display: Archivo** (variable, `wdth` 62-125, `wght` 100-900). Poster headings are uppercase, `font-stretch: 125%`, weight ~880, tight line-height (0.84-0.98). Outlined variants use `-webkit-text-stroke` with transparent fill (hero last name, projects title, lime bridge).
- **Body: Onest** 400/500/600, line-height 1.7-1.8, max 55-65ch.
- **Mono: JetBrains Mono** 400/500 for labels, roles, terminal, contact details. Uppercase micro-labels track at 0.1-0.15em.

The grouped poster rule lives in `css/base/reset.css` (`.hero-name, .bridge-text, ...`). Add new poster headings to that selector list instead of restyling.

## Layout

- Sections are full-bleed tonal blocks joined by the stacked-sheet seam treatment in `css/base/reset.css` (rounded top cap + negative top margin, sized by `--seam`).
- 6vw horizontal gutters, generous vertical rhythm (8-10rem section padding), single dominant idea per fold.
- No nested cards, no side-stripe accents, no gradient text, no glassmorphism.

## Motion

- Scroll-driven: experience story scenes (3D rotate/translate), hero name parallax exit, per-character title reveals.
- Entrances: scramble-in hero name, staggered fades, terminal typing, chat bubbles, route bars.
- Easing: ease-out quart/expo only (`--ease-quart`, `--ease-expo`). No bounce on layout-level moves.
- Every module checks `prefers-reduced-motion` and renders the full static layout when set.

## Components

- **Agent terminal**: `--ink-deep` panel, lime prompt, cream agent lines, amber tool lines.
- **Pills over chips**: tags, status, CTAs use 100px-radius pill shapes.
- **Overlay (experience detail)**: full per-company theme worlds in `css/components/overlay-themes.css`, switched via `theme-<id>` classes and a decor layer. Beyond = darkroom (near-black, red safelight, content develops in from blur/sepia). Monash = ledger (ruled paper, numbered entry rows, "Audited ✓" stamp slam). HeadSpace = scrapbook (warm paper, taped polaroid proof, rotated sticky notes, Caveat handwriting accents).
