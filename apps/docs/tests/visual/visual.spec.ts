// NetFrame Docs — small, stable screenshot suite
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Opt-in (`pnpm run test:visual`, project "visual"). Baselines are per platform
// (`-darwin`, `-linux` suffixes) because font rasterisation differs. Review a
// changed baseline deliberately: `pnpm run test:visual:update` rewrites them, so
// inspect the diff images (test-results/) and the git diff of the PNGs first.
//
// Determinism: local fonts are awaited, CSS animation is disabled by the config,
// version labels are masked, and fixtures use fixed text and sizes.

import { expect, test, type Page } from '@playwright/test';
import { loadFixture, settle } from '../helpers/layout';
import { docsSnippet } from '../helpers/snippets';

const THEMES = ['', 'nf-theme-night-city', 'nf-theme-chiba-city', 'nf-theme-neon-80s', 'nf-theme-renaissance', 'nf-theme-code-rain', 'nf-theme-iron-signal'];
const LONG = 'SUPERCALIFRAGILISTIC_NODE_IDENTIFIER_0123456789 and a long sentence that wraps';

/** Release-dependent text must not make baselines churn on every version bump. */
const masks = (page: Page) => [page.locator('.landing-sidebar-label'), page.locator('.hero-tag span').last(), page.locator('.docs-footer')];

async function theme(page: Page, name: string): Promise<void> {
  await page.evaluate((n) => {
    document.documentElement.className = document.documentElement.className.replace(/nf-theme-[a-z0-9-]+/g, '').trim();
    if (n) document.documentElement.classList.add(n);
  }, name);
  await settle(page);
}

test.describe('landing page', () => {
  test('phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await settle(page);
    await expect(page).toHaveScreenshot('landing-phone.png', { mask: masks(page) });
  });

  test('narrowest phone', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    await settle(page);
    await expect(page).toHaveScreenshot('landing-320.png', { mask: masks(page) });
  });

  test('desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await settle(page);
    await expect(page).toHaveScreenshot('landing-desktop.png', { mask: masks(page) });
  });
});

test.describe('docs shell', () => {
  test('phone: navigation closed', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/components/button/');
    await settle(page);
    await expect(page).toHaveScreenshot('docs-phone-nav-closed.png', { mask: masks(page) });
  });

  test('phone: navigation open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/components/button/');
    await settle(page);
    await page.locator('#nav-toggle').click();
    await expect(page.locator('#docs-sidebar')).toHaveAttribute('data-state', 'open');
    await page.locator('#docs-sidebar').evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)).then(() => undefined));
    await expect(page).toHaveScreenshot('docs-phone-nav-open.png', { mask: masks(page) });
  });

  test('desktop with permanent sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/components/button/');
    await settle(page);
    await expect(page).toHaveScreenshot('docs-desktop.png', { mask: masks(page) });
  });
});

test.describe('component fixtures on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('card and forms in a narrow column', async ({ page }) => {
    await loadFixture(page, `<div class="col"><div class="nf-card"><div class="nf-card-header"><span class="nf-card-title">${LONG}</span></div><div class="nf-card-body">${LONG}</div><div class="nf-card-footer"><button class="nf-button nf-button-ghost">CANCEL_OPERATION</button><button class="nf-button nf-button-primary">CONFIRM_AND_CONTINUE</button></div></div></div>
      <div class="col"><div class="nf-field"><label class="nf-label" for="a">${LONG}</label><input id="a" class="nf-input" value="value"><span class="nf-helper">${LONG}</span></div><label class="nf-checkbox"><input type="checkbox" checked><span>${LONG}</span></label></div>`);
    await expect(page).toHaveScreenshot('fixture-card-forms.png');
  });

  test('modal in a short landscape window', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 320 });
    await loadFixture(page, `<main><p>page</p></main><div class="nf-modal-overlay"><div class="nf-modal" role="dialog" aria-modal="true" aria-label="Confirm"><div class="nf-modal-header"><h2 class="nf-modal-title">Confirm the operation</h2><button class="nf-modal-close" aria-label="Close">x</button></div><div class="nf-modal-body">${Array.from({ length: 8 }, () => `<p>${LONG}</p>`).join('')}</div><div class="nf-modal-footer"><button class="nf-button nf-button-ghost">CANCEL</button><button class="nf-button nf-button-primary">CONFIRM</button></div></div></div>`);
    await expect(page).toHaveScreenshot('fixture-modal-landscape.png');
  });

  test('toasts with long content', async ({ page }) => {
    await loadFixture(page, `<div class="nf-toast-region nf-toast-top-right"><div class="nf-toast nf-toast-success"><div class="nf-toast-content"><div class="nf-toast-title">UPLOAD_COMPLETE</div><div class="nf-toast-message">${LONG}</div></div><button class="nf-toast-close" aria-label="Dismiss">x</button></div><div class="nf-toast nf-toast-error"><div class="nf-toast-content"><div class="nf-toast-message">${LONG}</div></div><button class="nf-toast-close" aria-label="Dismiss">x</button></div></div>`);
    await page.waitForTimeout(450); // toast entrance animation
    await expect(page).toHaveScreenshot('fixture-toasts.png');
  });

  test('dropdown flipped at the right edge', async ({ page }) => {
    await loadFixture(page, `<div style="display:flex;justify-content:flex-end"><div class="nf-dropdown"><button class="nf-button nf-button-ghost nf-dropdown-trigger" aria-expanded="false" aria-haspopup="menu">ACTIONS</button><ul class="nf-dropdown-menu" role="menu" aria-hidden="true"><li role="none"><button class="nf-dropdown-item" role="menuitem">SCAN_NODE</button></li><li role="none"><button class="nf-dropdown-item" role="menuitem">${LONG}</button></li></ul></div></div><div style="height:260px"></div><script>${docsSnippet('dropdown')}</script>`);
    await page.locator('.nf-dropdown-trigger').click();
    await expect(page).toHaveScreenshot('fixture-dropdown-edge.png');
  });

  test('tabs with many labels and the unread dot', async ({ page }) => {
    const labels = ['OVERVIEW', 'NETWORK_TOPOLOGY', 'SECURITY_AUDIT_LOGS', 'ARCHIVE', 'SETTINGS'];
    await loadFixture(page, `<div class="nf-tabs"><div class="nf-tab-list" role="tablist" aria-label="Sections">${labels.map((t, i) => `<button class="nf-tab" role="tab" aria-selected="${i === 0}">${t}</button>`).join('')}</div></div><p style="margin-top:32px"><span class="nf-badge nf-badge-outline nf-badge-dot">UNREAD ALERTS</span> <span class="nf-spinner" role="status" aria-label="Loading"></span></p>`);
    await expect(page).toHaveScreenshot('fixture-tabs-dot.png');
  });
});

test.describe('one fixture across all seven palettes', () => {
  test.use({ viewport: { width: 390, height: 560 } });

  for (const name of THEMES) {
    test(name || 'default', async ({ page }) => {
      await loadFixture(page, `<div class="col"><div class="nf-card nf-card-primary"><div class="nf-card-header"><span class="nf-card-title">NODE_STATUS</span><span class="nf-badge nf-badge-primary">ONLINE</span></div><div class="nf-card-body"><span class="nf-tag nf-tag-secondary">TAG</span> <span class="nf-badge nf-badge-outline nf-badge-dot">UNREAD</span> <span class="nf-spinner nf-spinner-lg" role="status" aria-label="Loading"></span><div class="nf-progress" style="margin-top:12px"><div class="nf-progress-bar" style="width:62%"></div></div></div>
        <div class="nf-card-footer"><button class="nf-button nf-button-primary">PRIMARY</button><button class="nf-button nf-button-secondary">SECOND</button><button class="nf-button nf-button-danger">DANGER</button></div></div></div>
        <ol class="nf-pagination"><li class="nf-page-item nf-page-item-active"><a class="nf-page-link" href="#" aria-current="page">1</a></li><li class="nf-page-item"><a class="nf-page-link" href="#">2</a></li><li class="nf-page-item"><a class="nf-page-link" href="#">3</a></li></ol>`);
      await theme(page, name);
      await expect(page).toHaveScreenshot(`palette-${name || 'default'}.png`);
    });
  }
});
