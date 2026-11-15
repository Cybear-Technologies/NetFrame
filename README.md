# NetFrame

```text
███╗   ██╗███████╗████████╗███████╗██████╗  █████╗ ███╗   ███╗███████╗
████╗  ██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝
██╔██╗ ██║█████╗     ██║   █████╗  ██████╔╝███████║██╔████╔██║█████╗
██║╚██╗██║██╔══╝     ██║   ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝
██║ ╚████║███████╗   ██║   ██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗
╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
```

> **CYBERPUNK CSS COMPONENT LIBRARY** — by [Cybear Technologies](https://cybeartech.com)

[![npm](https://img.shields.io/npm/v/netframe)](https://www.npmjs.com/package/netframe)
[![CI](https://github.com/Cybear-Technologies/NetFrame/actions/workflows/ci.yml/badge.svg)](https://github.com/Cybear-Technologies/NetFrame/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-netframe.cybeartech.com-00ff00)](https://netframe.cybeartech.com)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-green.svg)](LICENSE)

---

## `// INITIALIZE`

```sh
npm install netframe
pnpm add netframe
yarn add netframe
```

Import once at your project entry point:

```js
import 'netframe/dist/netframe.css';

// Optional: alternate themes
import 'netframe/dist/themes.css';
```

Or with no bundler:

```html
<link rel="stylesheet" href="https://unpkg.com/netframe/dist/netframe.min.css" />
```

Drop classes anywhere in your markup:

```html
<button class="nf-button nf-button-primary">EXECUTE</button>
<button class="nf-button nf-button-danger">ABORT</button>

<div class="nf-card nf-card-primary">
  <div class="nf-card-header">
    <span class="nf-card-title">UPLINK STATUS</span>
  </div>
  <div class="nf-card-body">All subsystems nominal.</div>
</div>

<span class="nf-badge nf-badge-primary">ONLINE</span>
<span class="nf-badge nf-badge-error">CRITICAL</span>
```

Enable the CRT scanline overlay on `<body>`:

```html
<body class="nf-crt">
```

Compiled CSS loads fonts from `./fonts/` next to it, so ship `dist/fonts/` with the stylesheet (bundlers do this for you). Sass users: `@use 'pkg:netframe/scss/netframe' with ($nf-font-path: '/assets/fonts');`. Details: [Getting started](https://netframe.cybeartech.com/getting-started/).

---

## `// PAYLOAD`

### 20 components

| Component | Component | Component | Component |
| --- | --- | --- | --- |
| Button | Input | Card | Table |
| Avatar | Badge | Tag | Dropdown |
| Tooltip | Modal | Drawer | Toast |
| Progress | Spinner | Tabs | Accordion |
| Breadcrumb | Pagination | Divider | Skeleton |

**4 utility groups** — Glow/shadows · Scanlines/CRT · Glitch animation · Layout

**Fonts** — Space Grotesk · JetBrains Mono · VT323 · Orbitron · Russo One — all self-hosted woff2 under the SIL OFL (licence texts ship in `dist/fonts/`), zero CDN calls

**Zero dependencies** — pure CSS output, framework-agnostic, drop-in anywhere

**CSS only** — interactive components (dropdown, tabs, accordion, modal, drawer, toast, table sorting, pagination) take their state from ARIA attributes. The docs include optional JavaScript for each, executed by the browser test suite

**Accessible by default** — all palettes keep text at 4.5:1 contrast on every surface; docs pages are axe-scanned against WCAG 2.1 AA

**Browsers** — `color-mix()` sets the floor: Chrome/Edge 111+, Firefox 113+, Safari 16.2+. Tested on current Chromium, Firefox and WebKit

---

## `// AGENT_PROTOCOL` — Skills for coding agents

The npm package ships three agent skills: **netframe-usage**, **netframe-theming** and **netframe-interactive**. They give Claude Code, GitHub Copilot and Codex the real class names, tokens and tested interaction patterns instead of guesses.

```sh
npx netframe skills claude    # Claude Code    -> .claude/skills
npx netframe skills copilot   # GitHub Copilot -> .github/skills
npx netframe skills codex     # Codex          -> .codex/skills
npx netframe skills all       # every agent above
```

Prefer to copy by hand? `mkdir -p .claude/skills && cp -R node_modules/netframe/skills/* .claude/skills/` (and the equivalent for `.github/skills` and `.codex/skills`; see the [agents page](https://netframe.cybeartech.com/agents/)).

References are generated from the shipped source and verified in CI. Also published: [`/llms.txt`](https://netframe.cybeartech.com/llms.txt) and [`/llms-full.txt`](https://netframe.cybeartech.com/llms-full.txt). More: [netframe.cybeartech.com/agents](https://netframe.cybeartech.com/agents/).

Working *on* this repository with an agent? Read [AGENTS.md](AGENTS.md).

---

## `// SIGNAL_VARIANTS` — Alternate Themes

Apply a theme class to `<html>` to switch the entire system at runtime:

```html
<html class="nf-theme-night-city">
```

Persist with localStorage:

```js
document.documentElement.classList.add('nf-theme-iron-signal');
localStorage.setItem('nf-theme', 'nf-theme-iron-signal');
```

---

### DEFAULT

> Terminal Green `#00FF00` · Hot Pink `#FF69A4` · UV Violet `#BC82FF`

The baseline. True black void. Neon triad — green/pink/violet. Hard pixel-offset shadows. CRT scanlines at 5% opacity.

---

### `nf-theme-night-city`

> Hazard Yellow `#FCEE09` · Neon Cyan `#00F0FF` · Blood Red `#FF547C`

Blade Runner rain-soaked streets. Yellow primary cuts through the smog. High-contrast danger aesthetic.

---

### `nf-theme-chiba-city`

> Electric Teal `#3AFFE5` · Burn Amber `#FF8C00`

Neuromancer's cyberspace. Two-color terminal. Teal data streams on dark urban substrate.

---

### `nf-theme-neon-80s`

> Hot Magenta `#FF73FF` · Retro Blue `#00D9FF` · UV `#C497FF`

RetroWave synthpop. Heavier scanlines. Grid-burst aesthetic. The decade that invented neon.

---

### `nf-theme-renaissance`

> Augmented Gold `#E5B100` · Renaissance Crimson `#E17676` · Warm Parchment `#E0D8B8`

Cyber-Renaissance. Palatino/Didot serif display font. Gold and ink. Opulent, architectural, inky black surfaces.

---

### `nf-theme-code-rain`

> Matrix Green `#00FF41`

Single-color. All text, all borders, all accents — one shade of green. Maximum monochrome immersion.

---

### `nf-theme-iron-signal`

> Revolutionary Red `#FF5E5E` · Cathode Amber `#FFB000` · Cold Steel `#B4B4B4`

Cyber-Soviet. Tactical Monolith. Russo One display headers. Orbitron body text. Massive borders. Instant state changes — zero transition duration. Red-channel CRT phosphor shift.

```html
<html class="nf-theme-iron-signal">
```

---

## `// OVERRIDE_PROTOCOL` — Custom Theming

Every `--nf-*` token is a live CSS custom property. Override on `:root`, no rebuild required:

```css
:root {
  --nf-color-primary:   #bd00ff;
  --nf-color-secondary: #ff6b00;
  --nf-color-bg:        #050005;
}
```

Full token reference → [netframe.cybeartech.com/theming](https://netframe.cybeartech.com/theming)

---

## `// ARCHITECTURE`

```text
packages/
  netframe/
    src/
      base/           reset, typography, fonts (@font-face)
      components/     20 component SCSS partials
      mixins/         focus-ring, glitch, neon-glow, scanlines, truncate
      themes/         6 alternate theme class overrides
      tokens/         colors, typography, spacing, motion
      utilities/      glow, scanlines, glitch, layout
      fonts/          woff2 files and their OFL licences
    scripts/          build pipeline (Sass -> PostCSS -> dist/)
    skills/           agent skills shipped in the npm package
    test/             node:test package, CSS contract and skill tests
    dist/             built output (not committed)
      netframe.css    compiled library (+ .min.css, source maps)
      themes.css      compiled themes (+ .min.css)
      fonts/          self-hosted woff2 files
      scss/           raw source for Sass consumers
apps/
  docs/               Astro docs site, Playwright browser tests, wrangler.jsonc
scripts/              repo tooling (agent skill generator)
.changeset/           versioning config
.github/workflows/    CI, release and cross-browser automation
```

---

## `// DEV_ENVIRONMENT`

Requires **Node 22.23.4+** · **pnpm 9.15.9** (pinned via `packageManager`; Corepack or pnpm will pick it up)

```sh
pnpm install        # install dependencies
pnpm build          # build the library, then the docs
pnpm dev            # watch the library and serve the docs
```

Library only:

```sh
pnpm --filter netframe run build   # single build
pnpm --filter netframe run dev     # watch mode
```

Docs only:

```sh
pnpm --filter @netframe/docs dev   # http://localhost:4321
```

The docs copy the built library into `apps/docs/public/` on `dev` and `build`, so build the library first.

Checks (the same ones CI runs):

```sh
pnpm run lint             # Stylelint (SCSS) + astro check (docs, tests)
pnpm run typecheck        # build script types
pnpm run test             # build the library, then package, CSS and skill tests
pnpm run test:browser     # Playwright against the built docs (Chromium)
pnpm run check            # all of the above plus a full build
pnpm run skills:build     # regenerate skill references and llms.txt after changing docs or CSS
```

First time running browser tests: `pnpm --filter @netframe/docs exec playwright install chromium`. Firefox and WebKit are opt-in (`playwright install firefox webkit`, then `--project=firefox --project=webkit`) and run nightly in CI.

Changing classes, tokens or docs class tables? Run `pnpm run skills:build` and commit the result; the tests fail on stale generated files.

---

## `// CONTRIBUTE`

See [CONTRIBUTING.md](CONTRIBUTING.md). Security reports: [SECURITY.md](SECURITY.md). Release process: [RELEASING.md](RELEASING.md). Version history: [CHANGELOG](packages/netframe/CHANGELOG.md).

---

## `// LICENSE`

GPL-3.0-only — Copyright (C) 2026 Cybear Technologies
