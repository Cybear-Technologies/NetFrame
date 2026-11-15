# Docs browser tests

Playwright runs against the built site (`astro preview`). Build first: `pnpm run build`.

## Projects

| Project | Runs | Command |
| --- | --- | --- |
| `chromium` | every spec except `visual/`; the required PR check | `pnpm run test:browser` |
| `firefox`, `webkit` | same specs, opt-in; nightly workflow | `playwright test --project=firefox --project=webkit` |
| `mobile-chromium`, `mobile-webkit` | only `docs-nav` and `mobile-smoke`, Pixel 7 / iPhone 14 emulation; PR check | `pnpm run test:mobile` |
| `visual` | screenshot baselines in `visual/`; opt-in | `pnpm run test:visual` |

Mobile projects are **emulation**: viewport, device pixel ratio, user agent, touch events and `pointer: coarse`. They catch layout and input-model regressions. They do not reproduce real keyboards, OS text scaling, rubber-band scrolling, browser chrome resizing or safe-area insets. Do the manual checks below before a release that changes layout.

## What lives where

| Spec | Covers |
| --- | --- |
| `responsive.spec.ts` | page-level overflow, clipped content, top-bar collisions, gutters, landing page, 404, safe areas, short landscape; every route at 320/390 and key routes at 320/390/768/1024/1440 |
| `docs-nav.spec.ts` | drawer open/close, Escape, focus trap and restore, inert and hidden tab stops, scroll lock, skip link, resize and breakpoint transitions |
| `narrow-components.spec.ts` | library components in a 280px column on a desktop window, modal/drawer/toast on small screens, dropdown edge flipping, many-label tabs, tooltip, focus indicators |
| `touch-targets.spec.ts` | 44px targets under `pointer: coarse`; desktop sizes unchanged |
| `mobile-smoke.spec.ts` | touch activation on real pages |
| `a11y-states.spec.ts` | axe on phone widths and open states; reflow and text-spacing settings |
| `a11y.spec.ts` | axe on every page as loaded (desktop) |
| `visual/visual.spec.ts` | landing, docs shell (nav open/closed), fixtures, one fixture across all seven palettes |

Helpers: `helpers/layout.ts` (overflow, reachability, fixtures), `helpers/snippets.ts` (the documented controllers, so fixtures run the code readers copy).

Measure clipping, not just `scrollWidth`: `horizontalOffenders()` and `isReachable()` check that elements are inside the viewport and actually receive the pointer.

## Visual baselines

Baselines are per platform (`-darwin`, `-linux`). Committed baselines come from macOS; Linux ones are produced by the manual **Visual baselines** workflow (tick `update`, download the artifact, inspect, commit). Never regenerate to make a failing run pass:

1. Open the diff images in `test-results/`.
2. Decide whether the change is intended.
3. Only then run `pnpm run test:visual:update` and review the PNG diff in git.

Version labels and other release-dependent text are masked.

## Manual checks (before a layout release)

Run on a real phone if possible (iOS Safari and Android Chrome), else browser device mode.

- **Keyboard:** Tab through a docs page at 390px and desktop. Skip link first; menu opens, focus lands inside, Tab stays inside, Escape closes and returns to the menu button; focus ring always visible.
- **Zoom and reflow:** at 320 CSS px wide (400% zoom on a 1280px window) pages scroll vertically only; text size 200% in browser settings still fits.
- **Text spacing:** apply the WCAG text-spacing bookmarklet; nothing is clipped.
- **Touch:** every button, tab, menu item, page link and form row is easy to hit with a thumb; no control sits under the notch or home indicator in landscape.
- **Screen reader:** VoiceOver (iOS) and TalkBack: closed menu is not announced, open menu is a labelled navigation, current page is announced.
- **Orientation:** rotate with the menu open; layout recovers with no stuck scroll lock.
- **Themes:** open the theme selector on a phone and check one component in each palette.
