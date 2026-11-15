// NetFrame — tooltip examples retain readable trigger labels
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test } from '@playwright/test';
import { documentOverflow, finishAnimations, rect, settle } from './helpers/layout';

for (const width of [320, 390, 1024, 1153, 1200, 1280, 1366, 1440]) {
  test(`tooltip demo trigger labels stay on one line at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/components/tooltip/');
    await settle(page);
    for (const theme of ['', 'nf-theme-night-city', 'nf-theme-chiba-city', 'nf-theme-neon-80s', 'nf-theme-renaissance', 'nf-theme-code-rain', 'nf-theme-iron-signal']) {
      await page.locator('#theme-switcher').selectOption(theme);
      await settle(page);
      const triggers = page.getByRole('button', { name: 'HOVER_ME', exact: true });
      await expect(triggers).toHaveCount(4);
      for (const trigger of await triggers.all()) {
        const metrics = await trigger.evaluate((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return { lines: range.getClientRects().length, overflow: el.scrollWidth - el.clientWidth };
        });
        expect(metrics.lines, `${theme || 'default'}: HOVER_ME fits on a single line`).toBe(1);
        expect(metrics.overflow).toBeLessThanOrEqual(1);
      }
      const left = page.locator('.demo-wrap').filter({ has: page.locator('.demo-label', { hasText: /^LEFT$/ }) });
      await left.getByRole('button', { name: 'HOVER_ME' }).focus();
      const tip = left.locator('.nf-tooltip-left');
      await expect(tip).toHaveCSS('opacity', '1');
      await finishAnimations(tip);
      const box = await rect(tip);
      const button = await rect(left.getByRole('button', { name: 'HOVER_ME' }));
      expect(box.right).toBeLessThanOrEqual(button.x);
      expect(box.x).toBeGreaterThanOrEqual(0);
      const right = page.locator('.demo-wrap').filter({ has: page.locator('.demo-label', { hasText: /^RIGHT$/ }) });
      await right.getByRole('button', { name: 'HOVER_ME' }).focus();
      await expect(right.locator('.nf-tooltip-right')).toHaveCSS('opacity', '1');
      await finishAnimations(right.locator('.nf-tooltip-right'));
      expect((await rect(right.locator('.nf-tooltip-right'))).right).toBeLessThanOrEqual(width);
      expect(await documentOverflow(page)).toBe(0);
    }
  });
}
