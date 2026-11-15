---
name: netframe-interactive
description: Add behaviour to NetFrame CSS components. Use when building a working dropdown, tabs, accordion, modal, drawer, toast, sortable table, pagination or notification control with NetFrame classes, or when keyboard, focus and ARIA handling for them is needed.
license: GPL-3.0-only
---

# Interactive NetFrame patterns

NetFrame ships styles only. Open/closed and selected state is read from ARIA attributes and `hidden`, so your JavaScript sets those. `references/patterns.md` has the reference markup and a controller for each pattern. These are the docs' own snippets, executed by the NetFrame browser test suite, so prefer them over rewriting.

## Principles

1. **State in attributes, literal strings.** Write `aria-expanded="true"` or `"false"` and `aria-hidden="true"` or `"false"`. The CSS hides menus only for `aria-hidden="true"` or `.nf-hidden`; toggling the attribute on and off will not hide them.
2. **Keyboard parity.** Every pointer action has a key: Enter/Space activate, Escape closes, arrow keys move within menus and tab lists, Home/End jump. Disabled items are skipped.
3. **Manage focus.** Opening a menu focuses its first item; Escape returns focus to the trigger. Modals and drawers trap focus, make the page behind `inert`, and restore focus on close.
4. **Link controls to content.** Tabs and accordion triggers use `aria-controls` pointing at a real `id`. Give every instance unique ids.
5. **Collapsed content stays out of the tab order.** Use `hidden` or `inert`, not just `height: 0`.
6. **Text, not HTML.** Build dynamic content (toasts, notifications) with `textContent` or DOM APIs. Never inject untrusted strings with `innerHTML`.
7. **Announce changes.** Toast regions are polite live regions; error toasts use `role="alert"`. Update counts and status text alongside any visual change.
8. **Respect reduced motion.** The accordion controller skips its height animation under `prefers-reduced-motion: reduce`; honour the setting in any animation you add.

## Choosing a pattern

| Need | Pattern in `references/patterns.md` |
| --- | --- |
| Menu from a button | Dropdown |
| Switch between panels | Tabs |
| Expand and collapse sections | Accordion |
| Blocking dialog | Modal |
| Side panel | Drawer |
| Transient messages | Toast |
| Click-to-sort columns | Table sorting |
| Paged lists | Pagination (local demo; for real navigation use anchors with real URLs) |
| Unread indicator with a list | Notification disclosure (badge dot) |

## Verifying

After wiring a pattern, test: mouse, keyboard only, repeated open and close, Escape, clicking outside, a disabled item, and a narrow viewport. Run an automated check such as axe on the page.
