// NetFrame Docs — real-page interaction and code-panel regressions
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test } from '@playwright/test';
import { builtRoutes } from './routes';

test('live dropdown demos toggle repeatedly and close outside or with Escape', async ({ page }) => {
  await page.goto('/components/dropdown/');
  const dropdowns = page.locator('.demo-preview .nf-dropdown');
  await expect(dropdowns).toHaveCount(2);
  for (const dropdown of await dropdowns.all()) {
    const trigger = dropdown.locator('.nf-dropdown-trigger');
    const menu = dropdown.locator('.nf-dropdown-menu');
    // Examples start open; interacting with one may close its sibling.
    if (await trigger.getAttribute('aria-expanded') === 'true') await trigger.click();
    await expect(menu).toBeHidden();
    await trigger.click();
    await expect(menu).toBeVisible();
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.locator('h1').click();
    await expect(menu).toBeHidden();
  }
});

test('live dropdown toggles on repeated touch taps', async ({ browser, browserName }) => {
  test.skip(browserName === 'firefox', 'Firefox does not support touch-context emulation');
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL!,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto('/components/dropdown/');
    const trigger = page.locator('.demo-preview .nf-dropdown-trigger').first();
    const menu = page.locator('.demo-preview .nf-dropdown-menu').first();
    await trigger.tap();
    await expect(menu).toBeHidden();
    await trigger.tap();
    await expect(menu).toBeVisible();
    await trigger.tap();
    await expect(menu).toBeHidden();
  } finally {
    await context.close();
  }
});

for (const route of builtRoutes().filter((route) => route.startsWith('/components/'))) {
  test(`${route} code panels wrap without clipping at desktop, tablet and phone widths`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [1440, 1000, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const panels = page.locator('.demo-code');
      expect(await panels.count()).toBeGreaterThan(0);
      for (const panel of await panels.all()) {
        await expect(panel).toHaveCSS('white-space', 'pre-wrap');
        const metrics = await panel.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return { left: rect.left, right: rect.right, client: el.clientWidth, scroll: el.scrollWidth };
        });
        expect(metrics.left, `${width}px: left edge`).toBeGreaterThanOrEqual(0);
        expect(metrics.right, `${width}px: right edge`).toBeLessThanOrEqual(width + 1);
        expect(metrics.scroll, `${width}px: wrapped content`).toBeLessThanOrEqual(metrics.client + 1);
        const original = await panel.locator('code').textContent();
        const button = panel.locator('..').locator('.demo-copy');
        await expect(button).toHaveAttribute('data-code', original!);
      }
    }
  });
}
