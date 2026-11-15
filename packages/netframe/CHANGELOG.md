# netframe

## 0.2.1

### Patch Changes

- [#97](https://github.com/Cybear-Technologies/NetFrame/pull/97) [`fd7fb72`](https://github.com/Cybear-Technologies/NetFrame/commit/fd7fb72ff82ca0dabcef1f8013bb2a03ee333f32) Thanks [@JacksonChandler](https://github.com/JacksonChandler)! - Point package metadata (`repository`, `homepage`, `bugs`) at the canonical `Cybear-Technologies/NetFrame` repository. First release published through GitHub Actions trusted publishing with npm provenance.

## 0.2.0

### Minor Changes

- Fix package consumption, state colours and component behaviour while preserving public class and token names.

  - Rework `.nf-badge-dot` into a larger framed unread-notification marker, preserving the existing class. Add size/colour custom properties and clear, accessible unread/all-read documentation examples. The notification-control demo includes a styled disclosure panel, repeated-click/outside/Escape dismissal, keyboard focus handling and a working mark-all-read action.
  - Redesign spinners as stationary signal-cell loaders with a slow 2.4-second pulse, steady labels and reduced-motion support. Existing sizes and colour variants remain available.
  - Fix progress-ring calculations in Firefox by returning a length from `stroke-dashoffset`. Support normalized `pathLength="100"` circles, clamp percentages, remove arc overshoot and prevent clipped strokes.
  - Add accessible `.nf-table-sort` header-button styles with `aria-sort` indicators. Sorting remains an optional consumer-owned JavaScript controller, demonstrated in the docs.
  - Pagination wraps cleanly with individually bordered controls rather than overflowing narrow containers.
  - Docs: run the displayed dropdown/accordion/table/pagination/tabs controllers in live demos; provide linked panels for both tab variants; update pagination records and status; use working breadcrumb destinations; provide a themed 404 page and readable, wrapping example code.

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
