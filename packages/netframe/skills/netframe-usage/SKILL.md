---
name: netframe-usage
description: Build UI with the NetFrame cyberpunk CSS library (npm package "netframe"). Use when a project imports netframe, uses nf- classes, or the user asks for NetFrame components such as buttons, cards, inputs, tables, badges, modals or utilities.
license: GPL-3.0-only
---

# Using NetFrame

NetFrame is plain CSS: `nf-*` classes and `--nf-*` custom properties. It has no JavaScript runtime and no framework dependency; it works in any markup. Docs: https://netframe.cybeartech.com

## Rules that prevent most mistakes

1. **Use only classes listed in `references/classes.md`.** Every class there exists in the shipped CSS. Do not invent `nf-` names or Tailwind-style utilities. If something is missing, write a small custom rule using tokens.
2. **Base class plus modifier.** `nf-button` is required, then add `nf-button-primary`, `nf-button-lg`, and so on. A modifier alone does nothing.
3. **Use tokens, not literals.** Colours, spacing and fonts come from `var(--nf-color-*)`, `var(--nf-space-*)`, `var(--nf-font-*)`. Never hard-code hex values that a token covers.
4. **Keep the hard-edged look.** `border-radius: 0`, hard offset shadows, `cursor: crosshair` on interactive elements. Do not add rounded corners, soft drop shadows or `cursor: pointer`.
5. **CSS only means behaviour is yours.** Dropdowns, tabs, accordions, modals, drawers, toasts, table sorting and pagination need JavaScript you provide. Load the `netframe-interactive` skill before building any of them.

## Install and import

```sh
npm install netframe
```

```js
import 'netframe/dist/netframe.css';
import 'netframe/dist/themes.css'; // optional: six alternate palettes
```

- Compiled CSS loads fonts from `./fonts/` next to the CSS file. A bundler copies them; for static hosting copy `node_modules/netframe/dist/fonts/` beside the stylesheet.
- No bundler: `<link rel="stylesheet" href="https://unpkg.com/netframe/dist/netframe.min.css">`.
- Sass: `@use 'pkg:netframe/scss/netframe' with ($nf-font-path: '/assets/fonts');` requires Dart Sass's Node package importer. `$nf-font-path` defaults to `../fonts`.
- Add `class="nf-crt"` to `<body>` for the CRT scanline overlay. It is decorative and ignores pointer events.
- Themes and token overrides: load the `netframe-theming` skill.

## Accessibility contract

NetFrame styles states; you supply the semantics.

- Every form control needs a `<label for>`; link helper or error text with `aria-describedby`; mark invalid fields with `aria-invalid="true"` (styled like `nf-input-error`).
- Progress bars and rings need `role="progressbar"`, an accessible name and `aria-valuenow/min/max`. Omit `aria-valuenow` when indeterminate.
- Links styled as buttons stay `<a class="nf-button">`; do not add `role="button"`.
- Interactive state lives in ARIA attributes with literal string values (`aria-expanded="false"`).
- Do not remove focus styles. Keep text at 4.5:1 contrast against its surface when you introduce colours.
- Spinners and animated utilities respect `prefers-reduced-motion`; keep a visible text label for loading states.
- The unread dot (`nf-badge-dot`) is decorative. Always pair it with text that states the count or status.

## Workflow

1. Look up each component in `references/classes.md` and read its docs page for markup structure.
2. Write markup using only those classes; add any custom styles with tokens.
3. For anything with behaviour, copy the matching controller from the `netframe-interactive` skill.
4. Check keyboard use, focus visibility, labels and contrast before finishing.

## Components and utilities

Components: accordion, avatar, badge, breadcrumb, button, card, divider, drawer, dropdown, input (field, select, textarea, checkbox, radio, range), modal, pagination, progress, skeleton, spinner, table, tabs, tag, toast, tooltip. Utility groups: glow and shadows, scanlines and CRT, glitch, layout. The per-class tables are in `references/classes.md`.
