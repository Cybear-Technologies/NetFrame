// NetFrame Docs — axe accessibility scan of every built page
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { builtRoutes } from './routes';

for (const route of builtRoutes()) {
  test(`${route} has no axe violations`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const summary = violations.flatMap((v) =>
      v.nodes.map((n) => `${v.id} (${v.impact}): ${n.target.join(' ')}`),
    );
    expect(summary).toEqual([]);
  });
}
