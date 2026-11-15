# netframe

## 0.2.4

### Changes

- Mobile and narrow-container hardening for existing components, plus an accessible, responsive docs site. No class, token or Sass path was renamed or removed.
  
  - **Wrapping instead of overflow.** Long labels and unbroken identifiers now break inside buttons, tags, badges, card titles and bodies, form labels and helper text, checkbox and radio labels, accordion triggers and bodies, tab panels, breadcrumb links, dropdown items, modal and drawer titles and bodies, and toasts. `.nf-button`, `.nf-tag` and `.nf-badge` no longer force `white-space: nowrap`; they wrap only when the container is narrower than the label.
  - **Groups wrap.** Card headers and footers, modal footers and drawer footers use `flex-wrap`, so several actions fit a narrow card or phone.
  - **Touch targets.** Under `pointer: coarse`, buttons, icon buttons, tabs, page links, dropdown items, accordion triggers, breadcrumb links, checkbox/radio rows, the range slider, and the modal and toast close buttons grow to about 44px. Mouse layouts are unchanged. This is a visible change on touch devices.
  - **Small screens.** Modal header (with its close button) stays in view and the body scrolls; the modal close button stays top-aligned beside a long title; overlay, drawer and toast respect `env(safe-area-inset-*)` (add `viewport-fit=cover` to your viewport meta). Toasts are never wider than the screen. Dropdown menus are capped to the screen width.
  - **Tooltips** wrap at about 18rem and are never wider than the screen. They remain CSS-only: the trigger must be focusable, and collision handling needs your own script or `nf-tooltip-left/right`.
  - **Tabs** keep scrolling inside their list (`overscroll-behavior-x: contain`).
  - **Docs controllers:** the dropdown example now flips the menu at screen edges; the tabs example keeps the selected tab in view.
  - **Docs site (not part of the package):** copyable snippets keep their indentation (MDX had flattened one level on every page), inline code stays whole on one line, the landing title never wraps, the phone top bar no longer shows a bare page name next to MENU, and the sidebar brand reads "BY CYBEAR TECHNOLOGIES"; mobile drawer navigation (inert when closed, focus trap, Escape, scroll lock, skip link, `aria-current`), responsive top bar, landing page, prose, demos and token tables; new responsive, mobile, touch-target, accessibility-state and visual test suites.

- Add persistent alerts, native checkbox switches, and attached input groups with an explicit stacked layout. Include accessible live documentation, native form examples, and generated agent references.
  
  Restore visible keyboard focus for text controls, distinguish readonly fields from disabled fields, and replace the select's hard-coded green arrow with its theme-compatible native arrow. Existing classes, Sass entry points, exports, and runtime-free consumption are preserved.

- Keep drawer footer actions reachable on short screens with a scrollable panel and sticky header. Update the documented tabs controller to keep the selected tab visible after font loading and container resizing.

- Fix closable tag documentation alignment by avoiding MDX paragraph wrappers and run the displayed optional dismissal controller in the live demo. Preserve logical keyboard focus on removal, add visible close-button focus and disabled states, and keep close controls non-shrinking with 44px coarse-pointer targets.

- ---
  ---
  
  Fix the left-positioned tooltip documentation example so HOVER_ME remains on one line across all palettes, including Iron Signal. Give side-positioned previews full width and use bounded token-based spacing without disabling normal button-label wrapping. Keep the right tooltip inside narrow viewports in wider-font palettes as well.

## 0.2.2

### Patch Changes

- [#101](https://github.com/Cybear-Technologies/NetFrame/pull/101) [`ffa2e5a`](https://github.com/Cybear-Technologies/NetFrame/commit/ffa2e5ad5ee2fc893a675aa382b3bc00351805cc) Thanks [@JacksonChandler](https://github.com/JacksonChandler)! - Ship agent skills in the package for Claude Code, GitHub Copilot and Codex: `netframe-usage`, `netframe-theming` and `netframe-interactive` under `skills/`, with class, token and interaction-pattern references generated from the shipped source and verified in CI. Install them with `npx netframe skills <claude|copilot|codex|all>` (new `netframe` binary: dependency-free, offline, writes only the `netframe-*` skill folders). Docs add an Agents page, `/llms.txt` and `/llms-full.txt`.

  - Add the `nf-text-subtle` utility class. The docs and examples already used it, but it was missing from the CSS.
  - Improve the documented drawer controller: Escape, focus trap and restore, inert page and closed panel, with browser tests.
  - Docs fixes: removed the non-existent `nf-glitch-primary` and `nf-visually-hidden` entries, described every class, updated colour names to Hot Pink.
  - README: current install, Sass, fonts, browser baseline, accessibility and agent sections.

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
