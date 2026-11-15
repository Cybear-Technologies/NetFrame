// NetFrame Docs — theme persistence helpers
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Shared by DocsLayout and the landing page. BaseLayout has an inline
// pre-paint copy of `readTheme` (inline scripts cannot import modules).

export const THEMES = [
  'nf-theme-night-city',
  'nf-theme-chiba-city',
  'nf-theme-neon-80s',
  'nf-theme-renaissance',
  'nf-theme-code-rain',
  'nf-theme-iron-signal',
] as const;

const STORAGE_KEY = 'nf-theme';

function isTheme(value: string): value is (typeof THEMES)[number] {
  return (THEMES as readonly string[]).includes(value);
}

/** Saved theme class, or '' for the default palette. Never throws. */
export function readTheme(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? '';
    return isTheme(saved) ? saved : '';
  } catch {
    // Storage blocked (privacy mode, sandboxed iframe, disabled cookies).
    return '';
  }
}

/** Apply a theme class to <html> and persist it. Unknown values reset to default. */
export function applyTheme(value: string): string {
  const next = isTheme(value) ? value : '';
  document.documentElement.classList.remove(...THEMES);
  if (next) document.documentElement.classList.add(next);
  try {
    if (next) localStorage.setItem(STORAGE_KEY, next);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Persistence is best-effort; the theme still applies for this page.
  }
  return next;
}
