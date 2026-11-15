// NetFrame — closable tags rendered from the actual documentation
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test } from '@playwright/test';
import { settle } from '../helpers/layout';

test('closable tag labels and close buttons align on a narrow page', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/components/tag/');
  await settle(page);
  await expect(page.locator('[data-tag-group]')).toHaveScreenshot('closable-tags-320.png');
});
