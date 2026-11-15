// NetFrame Docs — axe scans of active states, phone widths and zoom/reflow settings
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// a11y.spec.ts scans every page as loaded on desktop. These scans cover what a
// load-time scan misses: opened menus and dialogs, phone-width layouts and the
// reflow/text-spacing user settings. Automated rules do not prove an interface
// is accessible; see tests/README.md for the manual keyboard, zoom and touch checks.

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { builtRoutes } from './routes';
import { documentOverflow, isReachable, loadFixture, rect, settle, tabKeys } from './helpers/layout';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function scan(page: Page, context: string): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(violations.flatMap((v) => v.nodes.map((n) => `${context}: ${v.id} (${v.impact}): ${n.target.join(' ')}`))).toEqual([]);
}

test.describe('phone width (390px)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('every built page has no axe violations', async ({ page }) => {
    test.setTimeout(180_000);
    for (const route of builtRoutes()) {
      await page.goto(route);
      await settle(page);
      await scan(page, route);
    }
  });

  test('navigation drawer open', async ({ page }) => {
    await page.goto('/components/button/');
    await settle(page);
    await page.locator('#nav-toggle').click();
    await expect(page.locator('#docs-sidebar')).toHaveAttribute('data-state', 'open');
    await page.waitForTimeout(350); // slide-in
    await scan(page, 'nav open');
  });

  test('skip link focused', async ({ page, browserName }) => {
    await page.goto('/components/button/');
    await page.keyboard.press(tabKeys(browserName).tab);
    await expect(page.locator('[data-skip-link]')).toBeFocused();
    await scan(page, 'skip link focused');
  });
});

test.describe('open component states', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('dropdown menu open, tabs, expanded accordion, notification panel', async ({ page }) => {
    await page.goto('/components/dropdown/');
    await settle(page);
    const trigger = page.locator('.demo-preview .nf-dropdown-trigger').first();
    if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.click();
    await scan(page, 'dropdown open');
    await page.goto('/components/tabs/');
    await settle(page);
    await page.locator('.demo-preview').first().getByRole('tab', { name: 'SECURITY' }).click();
    await scan(page, 'tabs: second panel selected');
    await page.goto('/components/accordion/');
    await settle(page);
    await page.locator('.demo-preview .nf-accordion-trigger').nth(1).click();
    await page.waitForTimeout(350);
    await scan(page, 'accordion expanded');
    await page.goto('/components/badge/');
    await settle(page);
    await page.locator('[data-notification-trigger]').click();
    await scan(page, 'notification panel open');
  });

  test('modal, drawer and toast fixtures', async ({ page }) => {
    await loadFixture(page, `<main><h1>Page</h1></main><div class="nf-modal-overlay"><div class="nf-modal" role="dialog" aria-modal="true" aria-labelledby="mt" tabindex="-1"><div class="nf-modal-header"><h2 class="nf-modal-title" id="mt">Confirm</h2><button class="nf-modal-close" aria-label="Close dialog">x</button></div><div class="nf-modal-body"><p>Body text.</p></div><div class="nf-modal-footer"><button class="nf-button nf-button-ghost">CANCEL</button><button class="nf-button nf-button-primary">OK</button></div></div></div>`);
    await scan(page, 'modal');
    await loadFixture(page, `<main><h1>Page</h1></main><div class="nf-drawer-overlay"></div><div class="nf-drawer nf-drawer-right nf-open" role="dialog" aria-modal="true" aria-labelledby="dt"><div class="nf-drawer-header"><h2 class="nf-drawer-title" id="dt">Details</h2><button class="nf-button nf-button-ghost nf-button-icon" aria-label="Close drawer">x</button></div><div class="nf-drawer-body"><p>Body.</p></div></div>`);
    await finishDrawer(page);
    await scan(page, 'drawer');
    await loadFixture(page, `<main><h1>Page</h1></main><div class="nf-toast-region nf-toast-top-right" aria-live="polite"><div class="nf-toast nf-toast-success"><div class="nf-toast-content"><div class="nf-toast-title">Saved</div><div class="nf-toast-message">Changes were stored.</div></div><button class="nf-toast-close" aria-label="Dismiss notification">x</button></div></div>`);
    await page.waitForTimeout(400);
    await scan(page, 'toast');
  });

  test('tooltip shown by keyboard focus', async ({ page, browserName }) => {
    await loadFixture(page, `<main><h1>Page</h1><div style="padding-top:80px"><span class="nf-tooltip-wrap"><button class="nf-button">HELP</button><span class="nf-tooltip" role="tooltip">Explains the action.</span></span></div></main>`);
    await page.keyboard.press(tabKeys(browserName).tab);
    await expect(page.locator('.nf-tooltip')).toHaveCSS('opacity', '1');
    await page.waitForTimeout(250);
    await scan(page, 'tooltip visible');
  });
});

async function finishDrawer(page: Page): Promise<void> {
  await page.locator('.nf-drawer').evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)).then(() => undefined));
}

test.describe('reflow and user text settings', () => {
  const ROUTES = ['/', '/components/button/', '/components/input/', '/components/table/', '/theming/'];

  test('200% root text size in the narrow layout (639px window) does not overflow', async ({ page }) => {
    // Media-query rems follow the browser's default font size, not an author font-size, so
    // breakpoints cannot be scaled from a test. This checks that the narrow, rem-based layout
    // survives doubled type; a real browser text-size change needs the manual check in tests/README.md.
    await page.setViewportSize({ width: 639, height: 800 });
    await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.fontSize = '200%'; }));
    for (const route of ROUTES) {
      await page.goto(route);
      await settle(page);
      expect(await documentOverflow(page), `${route} @ 200% text`).toBeLessThanOrEqual(0);
      if (route !== '/') expect(await isReachable(page.locator('#nav-toggle')), `${route}: menu button reachable`).toBe(true);
    }
  });

  test('WCAG text-spacing overrides do not clip controls or add sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    const spacing = '*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p{margin-bottom:2em !important}';
    for (const route of ROUTES) {
      await page.goto(route);
      await settle(page);
      await page.addStyleTag({ content: spacing });
      expect(await documentOverflow(page), `${route} with text spacing`).toBeLessThanOrEqual(0);
      if (route !== '/') {
        expect(await isReachable(page.locator('#nav-toggle')), 'menu button reachable').toBe(true);
        const r = await rect(page.locator('#theme-switcher'));
        expect(r.right).toBeLessThanOrEqual(390);
      }
    }
  });

  test('400% zoom equivalent (320 CSS px wide, 256px tall) keeps primary controls reachable by scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 256 });
    await page.goto('/components/button/');
    await settle(page);
    expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
    await page.locator('#nav-toggle').click();
    await expect(page.locator('#docs-sidebar')).toHaveAttribute('data-state', 'open');
    await page.waitForTimeout(350);
    expect(await isReachable(page.locator('#nav-close'))).toBe(true);
    await page.locator('#docs-sidebar a', { hasText: 'SKELETON' }).scrollIntoViewIfNeeded();
    expect(await isReachable(page.locator('#docs-sidebar a', { hasText: 'SKELETON' }))).toBe(true);
  });
});
