# netframe

## 0.2.0

### Minor Changes

- Fix package consumption and state colours without changing class or token names.

  - The documented imports `netframe/dist/netframe.css` and `netframe/dist/themes.css` now resolve through the `exports` map. Every export also gains a `default` condition, so `netframe`, `netframe/themes`, `netframe/min` and `netframe/themes/min` resolve in tools that do not use the `style` condition. Existing `style`/`sass` targets are unchanged. Added `netframe/fonts/*` and `netframe/package.json`.
  - Compiled CSS (`dist/*.css`) now loads fonts from `./fonts/`, where they are shipped. Previously the URLs pointed outside `dist/` and 404'd (including from CDNs such as unpkg).
  - Sass consumers can relocate fonts with `@use 'pkg:netframe/scss/netframe' with ($nf-font-path: '/your/fonts');`. The default is unchanged.
  - `dist/*.css.map` source maps now map to the shipped `dist/scss/` sources instead of the intermediate CSS.
  - Buttons: primary and secondary hover states now switch text colour along with background (`on-secondary` / `on-tertiary`). Danger hover uses light text on the dark error container. Retuned brand and error colours across all seven palettes to meet 4.5:1 as text on every surface, including `surface-highest`; adjusted matching foregrounds where needed. Existing token names remain unchanged, but palette values intentionally change.
  - New `--nf-color-warning` token (`#fca311`, the value the avatar "away" status already used as a hard-coded fallback). Rendering is unchanged; themes can now override it.
  - `.nf-input`, `.nf-select` and `.nf-textarea` with `aria-invalid="true"` get the same error styling as the `-error` classes (additive).
  - Tooltips open when a focusable child of `.nf-tooltip-wrap` receives focus (`:focus-within`).
  - Builds replace `dist/` using a staged directory swap, so deleted source files no longer survive into published tarballs.
  - Ship the library's GPL licence and each font family's OFL copyright/licence text, plus font provenance notes. Orbitron's existing variable font supports true weight 500 without a duplicate binary.
  - Correct repository metadata to JacksonChandler/NetFrame; retain Cybear Technologies as author and credit Jackson Chandler as contributor.
  - Expand the published README with CSS/theme imports, font hosting, Sass configuration and consumer-owned interaction/accessibility guidance.
