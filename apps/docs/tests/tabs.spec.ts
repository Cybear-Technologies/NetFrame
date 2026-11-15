// NetFrame Docs — tabs on the real documentation page
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test } from '@playwright/test';

for (const index of [0, 1]) {
  test(`live tabs variant ${index + 1} selects matching content and maintains one tab stop`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/components/tabs/');
    const demo = page.locator('.demo-preview .nf-tabs').nth(index);
    const tabs = demo.getByRole('tab');
    for (const tab of await tabs.all()) {
      if (await tab.getAttribute('aria-disabled') === 'true') continue;
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      await expect(tab).toHaveAttribute('tabindex', '0');
      await expect(demo.locator('[role="tab"][aria-selected="true"]')).toHaveCount(1);
      await expect(demo.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
      const panelId = await tab.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      const panel = demo.locator(`#${panelId}`);
      await expect(panel).toBeVisible();
      await expect(panel).toHaveAttribute('aria-labelledby', (await tab.getAttribute('id'))!);
      await expect(demo.getByRole('tabpanel')).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });
}

test('live tabs support arrow wrap, Home/End and ignore disabled activation', async ({ page }) => {
  await page.goto('/components/tabs/');
  const demo = page.locator('.demo-preview .nf-tabs').first();
  const overview = demo.getByRole('tab', { name: 'OVERVIEW' });
  const network = demo.getByRole('tab', { name: 'NETWORK' });
  const security = demo.getByRole('tab', { name: 'SECURITY' });
  const archive = demo.getByRole('tab', { name: 'ARCHIVE' });
  await overview.focus();
  await overview.press('ArrowRight');
  await expect(network).toBeFocused();
  await expect(network).toHaveAttribute('aria-selected', 'true');
  await network.press('End');
  await expect(security).toBeFocused();
  await expect(security).toHaveAttribute('aria-selected', 'true');
  await security.press('ArrowRight');
  await expect(overview).toBeFocused();
  await overview.press('ArrowLeft');
  await expect(security).toBeFocused();
  await security.press('Home');
  await expect(overview).toBeFocused();
  // Bypass pointer-event styling to verify the controller also guards activation.
  await archive.dispatchEvent('click');
  await archive.press('Enter');
  await expect(archive).toHaveAttribute('aria-selected', 'false');
  await expect(overview).toHaveAttribute('aria-selected', 'true');
  await expect(demo.locator('#tab-panel-4')).toBeHidden();
});
