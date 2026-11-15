// NetFrame Docs — how the Input page wraps prose, inline code and copyable snippets
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test } from '@playwright/test';
import { documentOverflow, settle } from './helpers/layout';

for (const width of [320, 390, 1280]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('short inline code stays whole instead of splitting across lines', async ({ page }) => {
      await page.goto('/components/input/');
      await settle(page);
      const split = await page.evaluate(() =>
        [...document.querySelectorAll('.docs-content :not(pre) > code')]
          .filter((el) => (el.textContent ?? '').length <= 24)
          .filter((el) => el.getClientRects().length > 1 || new Set([...el.getClientRects()].map((r) => Math.round(r.top))).size > 1)
          .map((el) => el.textContent),
      );
      expect(split).toEqual([]);
    });

    test('a token longer than the line breaks rather than widening the page', async ({ page }) => {
      await page.goto('/components/input/');
      await page.evaluate(() => {
        const code = document.createElement('code');
        code.textContent = 'aria-describedby_aria-invalid_nf-input-error_'.repeat(6);
        document.querySelector('.docs-content p')!.append(' ', code);
      });
      await settle(page);
      expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
    });
  });
}

test('copyable snippets put long tags one attribute per line, so wrapping happens between attributes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/components/input/');
  await settle(page);
  const copy = page.locator('.demo-copy').first();
  const code = (await copy.getAttribute('data-code')) ?? '';
  // Display and copy payload stay identical.
  expect(await page.locator('.demo-code code').first().textContent()).toBe(code);
  const longest = Math.max(...code.split('\n').map((line) => line.length));
  expect(longest, 'longest line in the first snippet').toBeLessThanOrEqual(80);
  expect(code).toContain('\n    id="user-id"');
  // No attribute is split mid-name in the rendered snippet.
  const brokenAttr = await page.evaluate(() => {
    const pre = document.querySelector('.demo-code code')!;
    const range = document.createRange();
    const text = pre.firstChild as Text;
    const lines: string[] = [];
    let start = 0;
    let lastTop = -1;
    for (let i = 0; i < text.length; i++) {
      range.setStart(text, i);
      range.setEnd(text, i + 1);
      const rects = range.getClientRects();
      const top = rects.length ? Math.round(rects[0]!.top) : lastTop;
      if (lastTop !== -1 && top !== lastTop && text.data[i] !== '\n') {
        lines.push(text.data.slice(start, i));
        start = i;
      }
      lastTop = top;
    }
    lines.push(text.data.slice(start));
    return lines.filter((l) => /(^|\s)[a-z]+-$/.test(l.trimEnd()) && !/[="]$/.test(l.trimEnd()));
  });
  expect(brokenAttr).toEqual([]);
});
