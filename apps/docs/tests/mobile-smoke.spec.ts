// NetFrame Docs — focused mobile smoke suite (touch input on real pages)
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Runs on every pull request in the mobile-chromium and mobile-webkit projects
// (Pixel 7 / iPhone 14 emulation) and also in the default desktop project.
// Emulation exercises layout, touch events and pointer: coarse; it does not
// replace physical devices (real keyboards, OS text scaling, rubber-banding,
// browser chrome resizing).

import { expect, test } from '@playwright/test';
import { documentOverflow, isReachable, rect, settle } from './helpers/layout';

test.use({ hasTouch: true });
test.beforeEach(({ browserName }) => {
  test.skip(browserName === 'firefox', 'Firefox does not emulate touch contexts');
});

const PHONE = { width: 390, height: 844 };

test.describe('navigation by touch', () => {
  test.use({ viewport: PHONE });

  test('tap the menu, tap a link, land on the page with the drawer closed', async ({ page }) => {
    await page.goto('/getting-started/');
    await settle(page);
    await page.locator('#nav-toggle').tap();
    await expect(page.locator('#docs-sidebar')).toHaveAttribute('data-state', 'open');
    await page.locator('#docs-sidebar a', { hasText: 'TOOLTIP' }).tap();
    await expect(page).toHaveURL(/\/components\/tooltip\/?$/);
    await expect(page.locator('h1')).toHaveText('Tooltip');
    await expect(page.locator('#docs-sidebar')).toHaveAttribute('data-state', 'closed');
  });

  test('tap outside the drawer (on the scrim) closes it', async ({ page }) => {
    await page.goto('/components/button/');
    await settle(page);
    await page.locator('#nav-toggle').tap();
    await expect(page.locator('#docs-sidebar')).toHaveAttribute('data-state', 'open');
    await page.touchscreen.tap(375, 400);
    await expect(page.locator('#docs-sidebar')).toHaveAttribute('data-state', 'closed');
    await expect(page.locator('#nav-toggle')).toBeFocused();
  });

  test('theme selection persists across navigation on a phone', async ({ page }) => {
    await page.goto('/components/button/');
    await settle(page);
    await page.selectOption('#theme-switcher', 'nf-theme-neon-80s');
    await page.locator('#nav-toggle').tap();
    await page.locator('#docs-sidebar a', { hasText: 'BADGE' }).tap();
    await expect(page).toHaveURL(/\/components\/badge\/?$/);
    await expect(page.locator('html')).toHaveClass(/nf-theme-neon-80s/);
    await expect(page.locator('#theme-switcher')).toHaveValue('nf-theme-neon-80s');
  });

  test('every sidebar link is a 44px-tall touch target', async ({ page }) => {
    await page.goto('/components/button/');
    await settle(page);
    await page.locator('#nav-toggle').tap();
    await expect(page.locator('#docs-sidebar')).toHaveAttribute('data-state', 'open');
    for (const link of await page.locator('#docs-sidebar .sidebar-link').all()) {
      expect((await rect(link)).height).toBeGreaterThanOrEqual(43.5);
    }
  });
});

test.describe('docs chrome on a narrow screen', () => {
  test.use({ viewport: PHONE });

  test('copy button works by touch and reports the result', async ({ page, context, browserName }) => {
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    } else {
      // WebKit does not expose the Chromium permission names; use a stand-in clipboard.
      await page.addInitScript(() => {
        let copied = '';
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (t: string) => { copied = t; }, readText: async () => copied } });
      });
    }
    await page.goto('/components/button/');
    await settle(page);
    const copy = page.locator('.demo-copy').first();
    await copy.scrollIntoViewIfNeeded();
    expect(await isReachable(copy)).toBe(true);
    await copy.tap();
    await expect(page.locator('.demo-copy-label').first()).toHaveText('COPIED');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('nf-button-primary');
  });

  test('landing page install actions are tappable and navigate', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
    await page.locator('.hero-actions a', { hasText: 'INITIALIZE' }).tap();
    await expect(page).toHaveURL(/\/getting-started\/?$/);
  });
});

test.describe('component demos by touch', () => {
  test.use({ viewport: PHONE });

  test('dropdown opens and closes by tap, and tapping elsewhere closes it', async ({ page }) => {
    await page.goto('/components/dropdown/');
    await settle(page);
    const dropdown = page.locator('.demo-preview .nf-dropdown').first();
    const trigger = dropdown.locator('.nf-dropdown-trigger');
    const menu = dropdown.locator('.nf-dropdown-menu');
    if ((await trigger.getAttribute('aria-expanded')) === 'true') await trigger.tap();
    await expect(menu).toBeHidden();
    await trigger.tap();
    await expect(menu).toBeVisible();
    const r = await rect(menu);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeLessThanOrEqual(PHONE.width);
    await trigger.tap();
    await expect(menu).toBeHidden();
    await trigger.tap();
    await page.locator('h1').tap();
    await expect(menu).toBeHidden();
  });

  test('tabs and accordion respond to taps', async ({ page }) => {
    await page.goto('/components/tabs/');
    await settle(page);
    const demo = page.locator('.demo-preview .nf-tabs').first();
    await demo.getByRole('tab', { name: 'NETWORK' }).tap();
    await expect(demo.getByRole('tab', { name: 'NETWORK' })).toHaveAttribute('aria-selected', 'true');
    await expect(demo.getByRole('tabpanel')).toContainText('Network topology');
    await page.goto('/components/accordion/');
    await settle(page);
    const trigger = page.locator('.demo-preview .nf-accordion-trigger').nth(1);
    await trigger.tap();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.tap();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('pagination and table sorting respond to taps', async ({ page }) => {
    await page.goto('/components/pagination/');
    await settle(page);
    const demo = page.locator('.demo-preview [data-pagination]').first();
    await demo.getByRole('button', { name: '3', exact: true }).tap();
    await expect(demo.locator('[data-page-status]')).toHaveText('Page 3 of 5');
    await page.goto('/components/table/');
    await settle(page);
    const header = page.locator('.demo-preview .nf-table').first().getByRole('button', { name: 'LATENCY' });
    await header.tap();
    await expect(header.locator('..')).toHaveAttribute('aria-sort', 'ascending');
  });

  test('page never scrolls sideways on component pages with wide demos', async ({ page }) => {
    for (const route of ['/components/table/', '/components/modal/', '/components/toast/', '/components/pagination/']) {
      await page.goto(route);
      await settle(page);
      expect(await documentOverflow(page), `${route} overflows`).toBeLessThanOrEqual(0);
    }
  });
});
