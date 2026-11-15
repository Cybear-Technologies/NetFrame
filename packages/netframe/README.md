# netframe

Framework-independent cyberpunk CSS components: terminal green, neon accents,
hard edges, CRT effects and seven palettes. No JavaScript runtime dependencies.

## Install

```sh
npm install netframe
# or: pnpm add netframe
# or: yarn add netframe
```

## CSS

Import once in your application's stylesheet entry or JavaScript bundler entry:

```js
import 'netframe/dist/netframe.css';
// Optional: six alternate palettes, in addition to the default palette.
import 'netframe/dist/themes.css';
```

```html
<button class="nf-button nf-button-primary">CONNECT</button>
```

Apply a theme class to a container or the document element:

```html
<html class="nf-theme-night-city">
```

Available alternate classes: `nf-theme-night-city`, `nf-theme-chiba-city`,
`nf-theme-neon-80s`, `nf-theme-renaissance`, `nf-theme-code-rain`,
`nf-theme-iron-signal`. Remove the class to restore the default palette.

Short imports (`netframe`, `netframe/themes`) and minified entries
(`netframe/min`, `netframe/themes/min`) are also available.

## Fonts and static hosting

Compiled CSS references `./fonts/*.woff2` relative to the CSS file. Bundlers should
copy/rewrite those assets. For static hosting, copy `dist/netframe.css`, optionally
`dist/themes.css`, and the entire `dist/fonts/` directory together. Keep fonts and
their licence notices together. Fonts are self-hosted; no Google Fonts request is
required by the library.

## Sass

Use Dart Sass's Node package importer (`--pkg-importer=node` for its CLI):

```scss
@use 'pkg:netframe/scss/netframe' with (
  $nf-font-path: '/assets/fonts'
);
@use 'pkg:netframe/scss/themes/themes';
```

Copy the package's `dist/fonts/` directory to the configured public URL.
The raw Sass default font path is `../fonts`; configure it for your generated
stylesheet location. `pkg:` imports require Sass's Node package importer, not
just a `node_modules` load path.

## Browser support

NetFrame uses `color-mix()`, which needs Chrome/Edge 111+, Firefox 113+ or Safari 16.2+.
The docs test suite runs on current Chromium, Firefox and WebKit.

## Behaviour and accessibility

NetFrame supplies CSS, not JavaScript controllers. Interactive components need
consumer-owned behaviour, ARIA state and keyboard/focus management. The docs
provide tested optional JavaScript examples. Preserve visible focus indicators and
check contrast when overriding tokens. The built-in palettes keep text at WCAG AA
contrast (4.5:1) on every surface.

## Agent skills

The package includes three skills that teach coding agents the real classes, tokens and
accessibility patterns: `netframe-usage`, `netframe-theming` and `netframe-interactive`.
Install them from your project root (needs Node 18+; makes no network calls):

```sh
npx netframe skills claude    # Claude Code    -> .claude/skills
npx netframe skills copilot   # GitHub Copilot -> .github/skills
npx netframe skills codex     # Codex          -> .codex/skills
npx netframe skills all       # every agent above
```

Add `--dry-run` to preview. The command only writes the `netframe-*` folders and never touches
your other skills. Prefer to copy by hand?

```sh
mkdir -p .claude/skills && cp -R node_modules/netframe/skills/* .claude/skills/
mkdir -p .github/skills && cp -R node_modules/netframe/skills/* .github/skills/
mkdir -p .codex/skills && cp -R node_modules/netframe/skills/* .codex/skills/
```

Copilot also reads `.claude/skills` and `.agents/skills`; Codex reads `~/.agents/skills` for all projects.

Run the command again after upgrading. Any agent can also read
`node_modules/netframe/skills/<name>/SKILL.md` directly. An LLM-friendly index is at
[netframe.cybeartech.com/llms.txt](https://netframe.cybeartech.com/llms.txt) and the full
reference at [`/llms-full.txt`](https://netframe.cybeartech.com/llms-full.txt).

Full documentation: [netframe.cybeartech.com](https://netframe.cybeartech.com)

## Licence

Copyright (C) 2026 Cybear Technologies — GPL-3.0-only. Developer: Jackson Chandler.
See `LICENSE` for the library licence. Font families are separately licensed
under SIL OFL 1.1; see `dist/fonts/README.md` and the accompanying `OFL-*.txt` files.
