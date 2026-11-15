// NetFrame — left tooltip trigger and bubble on the real documentation page
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test } from '@playwright/test';
import { finishAnimations, settle } from '../helpers/layout';

for (const theme of ['', 'nf-theme-iron-signal']) {
  test(`left tooltip keeps its trigger readable in ${theme || 'default'}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/components/tooltip/');
    await page.locator('#theme-switcher').selectOption(theme);
    await settle(page);
    const demo = page.locator('.demo-wrap').filter({ has: page.locator('.demo-label', { hasText: /^LEFT$/ }) });
    await demo.getByRole('button', { name: 'HOVER_ME' }).hover();
    await expect(demo.locator('.nf-tooltip-left')).toHaveCSS('opacity', '1');
    await finishAnimations(demo.locator('.nf-tooltip-left'));
    await expect(demo.locator('.demo-preview')).toHaveScreenshot(`tooltip-left-${theme || 'default'}-320.png`);
  });
}
