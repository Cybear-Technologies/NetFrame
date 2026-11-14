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

## Behaviour and accessibility

NetFrame supplies CSS, not JavaScript controllers. Interactive components need
consumer-owned behaviour, ARIA state and keyboard/focus management. The docs
provide optional JavaScript examples. Preserve visible focus indicators and
check contrast when overriding tokens.

Full documentation: [netframe.cybeartech.com](https://netframe.cybeartech.com)

## Licence

Copyright (C) 2026 Cybear Technologies — GPL-3.0-only. Developer: Jackson Chandler.
See `LICENSE` for the library licence. Font families are separately licensed
under SIL OFL 1.1; see `dist/fonts/README.md` and the accompanying `OFL-*.txt` files.
