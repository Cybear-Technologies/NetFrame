---
name: netframe-theming
description: Retheme or switch palettes in the NetFrame CSS library. Use when overriding --nf-* tokens, applying nf-theme-* classes, persisting a user's theme choice, creating a custom palette or checking colour contrast in a NetFrame project.
license: GPL-3.0-only
---

# Theming NetFrame

Every design value is a CSS custom property on `:root`. Override a token with plain CSS; no rebuild. The full default list and every theme's overrides are in `references/tokens.md`.

## Override tokens

```css
:root {
  --nf-color-primary: #bd00ff;
  --nf-color-on-primary: #000000; /* always update the matching on-* colour */
}

.my-section { --nf-color-primary: #ff6b00; } /* scoped override */
```

Only override token names that appear in `references/tokens.md`.

## Alternate themes

Import `netframe/dist/themes.css`, then add one class to `<html>` or any container: `nf-theme-night-city`, `nf-theme-chiba-city`, `nf-theme-neon-80s`, `nf-theme-renaissance`, `nf-theme-code-rain`, `nf-theme-iron-signal`. No class means the default palette.

```js
// Validate before applying; the docs site stores the choice under "nf-theme".
const THEME = /^nf-theme-[a-z0-9-]+$/;
function applyTheme(name) {
  const root = document.documentElement;
  [...root.classList].forEach((c) => THEME.test(c) && root.classList.remove(c));
  if (THEME.test(name)) root.classList.add(name);
  try { localStorage.setItem('nf-theme', name); } catch { /* storage blocked */ }
}
```

Apply the saved class before first paint (a tiny inline script in `<head>`) to avoid a flash. Wrap storage access in `try/catch`; it can be blocked.

## Contrast rules for custom palettes

NetFrame's own palettes keep brand colours at 4.5:1 or better as text on every surface token, and every fill at 4.5:1 against its `on-*` colour. A custom palette must do the same.

- A brand colour used as text must reach 4.5:1 against `--nf-color-bg` and each `--nf-color-surface-*` token.
- Change `--nf-color-primary`, `-secondary` or `-tertiary` together with their `on-*` pair and the `-dim` variant.
- Hover states swap the foreground along with the background; verify them.
- Test with a contrast checker or axe; do not eyeball neon colours.

## Fonts

Typography tokens are `--nf-font-display`, `--nf-font-body`, `--nf-font-mono`, `--nf-font-label`. Bundled fonts (Space Grotesk, JetBrains Mono, VT323, Orbitron, Russo One) are self-hosted under their SIL OFL licences; keep the `fonts/` directory and its licence files with the CSS when you redistribute.

## Gotchas

- Themes override tokens only. Component rules still read tokens, so a theme change recolours everything.
- Iron Signal removes transition durations on purpose; do not "fix" that.
- Keep `border-radius: 0` tokens at zero; the hard edge is the design.
