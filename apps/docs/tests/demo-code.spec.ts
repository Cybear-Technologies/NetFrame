// NetFrame Docs — copyable snippets keep the structure the author wrote
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// MDX removes two spaces of indentation from every line after the first inside a
// JSX attribute, so ComponentDemo `code` snippets in the MDX source are indented two
// spaces deeper than what readers see. If someone writes a snippet without that offset,
// nested tags render flush-left and the copied code loses its structure.

import { expect, test } from '@playwright/test';
import { builtRoutes } from './routes';
import { settle } from './helpers/layout';

test('no snippet is flattened, and what is displayed is exactly what is copied', async ({ page }) => {
  const problems: string[] = [];
  for (const route of builtRoutes().filter((r) => r.startsWith('/components/') || r.startsWith('/utilities/'))) {
    await page.goto(route);
    await settle(page);
    const demos = await page.evaluate(() =>
      [...document.querySelectorAll('.demo-wrap')].map((wrap) => ({
        title: wrap.querySelector('.demo-label')?.textContent ?? '',
        copied: wrap.querySelector<HTMLElement>('.demo-copy')?.dataset['code'] ?? '',
        shown: wrap.querySelector('.demo-code code')?.textContent ?? '',
      })),
    );
    for (const d of demos) {
      if (d.copied !== d.shown) problems.push(`${route} "${d.title}": displayed code differs from copied code`);
      const lines = d.copied.split('\n');
      const first = lines[0] ?? '';
      const next = lines.slice(1).find((l) => l.trim());
      const opensBlock = /^<[a-z][^>]*[^/]>$/i.test(first.trim()) && !/<\/[a-z]/i.test(first);
      if (opensBlock && next && /^<(?!\/)/.test(next)) problems.push(`${route} "${d.title}": nested tag is not indented under "${first.slice(0, 40)}"`);
    }
  }
  expect(problems).toEqual([]);
});
