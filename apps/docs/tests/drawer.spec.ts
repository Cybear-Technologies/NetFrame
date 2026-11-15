// NetFrame Docs — documented drawer controller
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const PAGE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'pages', 'components', 'drawer.mdx');
const mdx = fs.readFileSync(PAGE, 'utf8');
const script = /## JavaScript\s+```js\n([\s\S]*?)```/.exec(mdx)![1]!;
// The copyable markup from the first demo is the fixture, so docs and code stay in step.
const markup = /<ComponentDemo[^>]*code=\{`([\s\S]*?)`\}>/.exec(mdx)![1]!;

test('drawer snippet opens, traps focus, inerts the page, closes every way and restores focus', async ({ page, browserName }) => {
  // Safari only tabs to buttons with Option held.
  const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  const shiftTab = browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab';
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/__drawer', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="/netframe.css"></head>
        <body><main id="page"><a href="#x" id="outside">outside link</a></main>${markup}<script>${script}</script></body></html>`,
    }),
  );
  await page.goto('/__drawer');
  const drawer = page.locator('#my-drawer');
  const trigger = page.locator('#open-drawer');
  const overlay = page.locator('#drawer-overlay');

  // Closed: off-screen panel is not focusable and the overlay is hidden.
  await expect(drawer).toHaveJSProperty('inert', true);
  await expect(overlay).toBeHidden();
  await page.keyboard.press('Escape'); // must not steal focus when closed
  await expect(trigger).not.toBeFocused();

  for (const closer of ['button', 'footer', 'overlay', 'escape'] as const) {
    await trigger.click();
    await expect(drawer).toHaveClass(/nf-open/);
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');
    await expect(drawer).toHaveJSProperty('inert', false);
    await expect(overlay).toBeVisible();
    await expect(page.locator('#page')).toHaveJSProperty('inert', true);
    await expect(page.locator('[aria-label="Close drawer"]')).toBeFocused();
    // Tab wraps inside the drawer.
    await page.keyboard.press(tab);
    await expect(page.locator('.nf-drawer-footer button')).toBeFocused();
    await page.keyboard.press(tab);
    await expect(page.locator('[aria-label="Close drawer"]')).toBeFocused();
    await page.keyboard.press(shiftTab);
    await expect(page.locator('.nf-drawer-footer button')).toBeFocused();
    if (closer === 'button') await page.locator('[aria-label="Close drawer"]').click();
    if (closer === 'footer') await page.locator('.nf-drawer-footer button').click();
    if (closer === 'overlay') await overlay.click({ position: { x: 600, y: 300 } });
    if (closer === 'escape') await page.keyboard.press('Escape');
    await expect(drawer).not.toHaveClass(/nf-open/);
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
    await expect(drawer).toHaveJSProperty('inert', true);
    await expect(overlay).toBeHidden();
    await expect(page.locator('#page')).toHaveJSProperty('inert', false);
    await expect(trigger).toBeFocused();
  }
  expect(errors).toEqual([]);
});
