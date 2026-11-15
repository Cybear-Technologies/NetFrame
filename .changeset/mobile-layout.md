---
"netframe": minor
---

Mobile and narrow-container hardening for existing components, plus an accessible, responsive docs site. No class, token or Sass path was renamed or removed.

- **Wrapping instead of overflow.** Long labels and unbroken identifiers now break inside buttons, tags, badges, card titles and bodies, form labels and helper text, checkbox and radio labels, accordion triggers and bodies, tab panels, breadcrumb links, dropdown items, modal and drawer titles and bodies, and toasts. `.nf-button`, `.nf-tag` and `.nf-badge` no longer force `white-space: nowrap`; they wrap only when the container is narrower than the label.
- **Groups wrap.** Card headers and footers, modal footers and drawer footers use `flex-wrap`, so several actions fit a narrow card or phone.
- **Touch targets.** Under `pointer: coarse`, buttons, icon buttons, tabs, page links, dropdown items, accordion triggers, breadcrumb links, checkbox/radio rows, the range slider, and the modal and toast close buttons grow to about 44px. Mouse layouts are unchanged. This is a visible change on touch devices.
- **Small screens.** Modal header (with its close button) stays in view and the body scrolls; the modal close button stays top-aligned beside a long title; overlay, drawer and toast respect `env(safe-area-inset-*)` (add `viewport-fit=cover` to your viewport meta). Toasts are never wider than the screen. Dropdown menus are capped to the screen width.
- **Tooltips** wrap at about 18rem and are never wider than the screen. They remain CSS-only: the trigger must be focusable, and collision handling needs your own script or `nf-tooltip-left/right`.
- **Tabs** keep scrolling inside their list (`overscroll-behavior-x: contain`).
- **Docs controllers:** the dropdown example now flips the menu at screen edges; the tabs example keeps the selected tab in view.
- **Docs site (not part of the package):** copyable snippets keep their indentation (MDX had flattened one level on every page), inline code stays whole on one line, the landing title never wraps, the phone top bar no longer shows a bare page name next to MENU, and the sidebar brand reads "BY CYBEAR TECHNOLOGIES"; mobile drawer navigation (inert when closed, focus trap, Escape, scroll lock, skip link, `aria-current`), responsive top bar, landing page, prose, demos and token tables; new responsive, mobile, touch-target, accessibility-state and visual test suites.
