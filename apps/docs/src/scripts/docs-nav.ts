// NetFrame Docs — responsive documentation navigation
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Below the desktop breakpoint the sidebar is a modal drawer: closed it is inert
// (out of the tab order and accessibility tree); open it traps focus, makes the
// page behind it inert and locks scrolling. Crossing the breakpoint resets all of
// that state. The breakpoint must match the `64rem` media queries in
// DocsLayout.astro and Sidebar.astro.

export const DESKTOP_QUERY = '(min-width: 64rem)';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initDocsNav(): void {
  const toggle = document.getElementById('nav-toggle') as HTMLButtonElement | null;
  const sidebar = document.getElementById('docs-sidebar');
  const scrim = document.getElementById('nav-scrim');
  const close = document.getElementById('nav-close') as HTMLButtonElement | null;
  if (!toggle || !sidebar || !scrim || !close) return;

  const desktop = window.matchMedia(DESKTOP_QUERY);
  const behind = () => [...document.querySelectorAll<HTMLElement>('[data-nav-behind]')];
  let open = false;

  function apply(): void {
    const isDesktop = desktop.matches;
    const drawerOpen = open && !isDesktop;
    sidebar!.dataset['state'] = isDesktop ? 'desktop' : drawerOpen ? 'open' : 'closed';
    // A closed mobile drawer is off-screen and must not be reachable.
    (sidebar as HTMLElement).inert = !isDesktop && !drawerOpen;
    scrim!.hidden = !drawerOpen;
    behind().forEach((el) => (el.inert = drawerOpen));
    toggle!.setAttribute('aria-expanded', String(drawerOpen));
    document.documentElement.classList.toggle('nav-open', drawerOpen);
  }

  function setOpen(next: boolean, { restoreFocus = true } = {}): void {
    if (next && desktop.matches) return;
    const wasOpen = open;
    open = next;
    apply();
    if (next) close!.focus();
    else if (wasOpen && restoreFocus) toggle!.focus();
  }

  toggle.addEventListener('click', () => setOpen(true));
  close.addEventListener('click', () => setOpen(false));
  scrim.addEventListener('click', () => setOpen(false));
  // Same-page links (and links to the current page) do not reload; close the drawer anyway.
  sidebar.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a[href]')) setOpen(false, { restoreFocus: false });
  });

  document.addEventListener('keydown', (event) => {
    if (!open || desktop.matches) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;
    const items = [...sidebar.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (!sidebar.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Breakpoint crossings and back/forward-cache restores must not leave stale state.
  desktop.addEventListener('change', () => {
    const focusInSidebar = sidebar.contains(document.activeElement);
    open = false;
    apply();
    // Going to mobile: the sidebar becomes inert, so move focus to a reachable control.
    if (!desktop.matches && focusInSidebar) toggle.focus();
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      open = false;
      apply();
    }
  });

  apply();
}
