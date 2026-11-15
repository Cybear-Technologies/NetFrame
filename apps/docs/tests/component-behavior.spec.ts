// NetFrame — real docs behaviour, geometry and motion regressions
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const tableIndex of [0, 1, 2]) {
  test(`table ${tableIndex + 1} sorts every column in both directions`, async ({ page }) => {
    await page.goto('/components/table/');
    const table = page.locator('.demo-preview .nf-table').nth(tableIndex);
    const buttons = table.locator('th button');
    for (let column = 0; column < await buttons.count(); column++) {
      const button = buttons.nth(column);
      const cells = table.locator(`tbody td:nth-child(${column + 1})`);
      const values = (await cells.allTextContents()).map((s) => s.trim());
      const compare = (a: string, b: string) => {
        if (a === '—' || b === '—') return Number(a === '—') - Number(b === '—');
        return /^\d+(\.\d+)?(ms|%|MB)?$/i.test(a) && /^\d+(\.\d+)?(ms|%|MB)?$/i.test(b)
          ? parseFloat(a) - parseFloat(b)
          : a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
      };
      await button.click();
      await expect(button.locator('..')).toHaveAttribute('aria-sort', 'ascending');
      expect((await cells.allTextContents()).map((s) => s.trim())).toEqual([...values].sort(compare));
      await button.press('Enter');
      await expect(button.locator('..')).toHaveAttribute('aria-sort', 'descending');
      const descending = [...values].filter((v) => v !== '—').sort(compare).reverse();
      await expect(cells).toHaveText([...descending, ...values.filter((v) => v === '—')]);
      await expect(table.locator('th[aria-sort]')).toHaveCount(1);
    }
  });
}

test('numeric table values sort numerically and missing values remain last', async ({ page }) => {
  await page.goto('/components/table/');
  const tables = page.locator('.demo-preview .nf-table');
  await tables.nth(0).getByRole('button', { name: 'LATENCY' }).click();
  await expect(tables.nth(0).locator('tbody td:nth-child(3)')).toHaveText(['8ms', '12ms', '—']);
  await tables.nth(1).getByRole('button', { name: 'MEM', exact: true }).click();
  await expect(tables.nth(1).locator('tbody td:nth-child(4)')).toHaveText(['12MB', '32MB', '84MB', '128MB']);
  await tables.nth(1).getByRole('button', { name: 'MEM', exact: true }).press('Space');
  await expect(tables.nth(1).locator('tbody td:nth-child(4)')).toHaveText(['128MB', '84MB', '32MB', '12MB']);
  await expect(tables.nth(2).locator('.nf-table-row-active td').first()).toHaveText('NODE_002');
});

for (const reducedMotion of [false, true]) {
  test(`live accordions open/collapse with mouse and keyboard (reduced motion: ${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
    await page.goto('/components/accordion/');
    for (const trigger of await page.locator('.demo-preview .nf-accordion-trigger').all()) {
      const id = await trigger.getAttribute('aria-controls');
      expect(id).toBeTruthy();
      const panel = page.locator(`#${id}`);
      if (await trigger.getAttribute('aria-expanded') === 'true') await trigger.click();
      await expect(panel).toHaveJSProperty('inert', true);
      await expect(panel).toHaveCSS('height', '0px');
      await trigger.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(panel).toHaveJSProperty('inert', false);
      await expect.poll(() => panel.evaluate((el) => el.clientHeight)).toBeGreaterThan(10);
      await page.setViewportSize({ width: 390, height: 900 });
      await expect.poll(() => panel.evaluate((el) => el.clientHeight >= el.scrollHeight)).toBe(true);
      await trigger.press('Space');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(panel).toHaveJSProperty('inert', true);
      await expect(panel).toHaveCSS('height', '0px');
    }
  });
}

for (const [index, firstPage, lastPage] of [[0, 1, 5], [1, 8, 24]] as const) {
  test(`pagination ${index + 1} changes records, current page and boundary controls`, async ({ page }) => {
    await page.goto('/components/pagination/');
    const demo = page.locator('.demo-preview [data-pagination]').nth(index);
    const status = demo.locator('[data-page-status]');
    await expect(status).toHaveText(`Page ${firstPage} of ${lastPage}`);
    const next = demo.locator('.nf-page-next');
    await next.click();
    await expect(status).toHaveText(`Page ${firstPage + 1} of ${lastPage}`);
    await expect(demo.locator('[aria-current="page"]')).toHaveText(String(firstPage + 1));
    await expect(demo.locator('[data-page-results] li').first()).toHaveText(`NODE_${String(firstPage * 3 + 1).padStart(3, '0')}`);
    await expect(next).toBeFocused();
    await demo.getByRole('button', { name: String(lastPage), exact: true }).click();
    await expect(status).toHaveText(`Page ${lastPage} of ${lastPage}`);
    await expect(next).toBeDisabled();
    await demo.getByRole('button', { name: '1', exact: true }).click();
    await expect(demo.locator('.nf-page-prev')).toBeDisabled();
    await expect(demo.locator('[data-page-results] li')).toHaveText(['NODE_001', 'NODE_002', 'NODE_003']);
    await demo.getByRole('button', { name: '2', exact: true }).press('Enter');
    await expect(status).toHaveText(`Page 2 of ${lastPage}`);
    await expect(page).toHaveURL(/\/components\/pagination\/$/);
  });
}

test('pagination controls stay inside the preview on desktop and small phones', async ({ page }) => {
  await page.goto('/components/pagination/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1440, 1000, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const preview of await page.locator('.demo-preview').all()) {
      const bounds = await preview.boundingBox();
      expect(bounds).not.toBeNull();
      for (const control of await preview.locator('.nf-page-link').all()) {
        const rect = await control.boundingBox();
        expect(rect!.x).toBeGreaterThanOrEqual(bounds!.x);
        expect(rect!.x + rect!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
        expect(rect!.height).toBeGreaterThanOrEqual(24);
      }
    }
  }
});

test('every breadcrumb demo link resolves, and clicking navigates to a real docs page', async ({ page, request }) => {
  await page.goto('/components/breadcrumb/');
  const links = page.locator('.demo-preview a');
  for (const link of await links.all()) {
    const href = await link.getAttribute('href');
    const response = await request.get(href!);
    expect(response.status(), href!).toBe(200);
  }
  await links.filter({ hasText: 'DOCS' }).first().click();
  await expect(page).toHaveURL(/\/getting-started\//);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Getting Started');
});

test('missing routes render the branded 404 with recovery links and valid accessibility', async ({ page }) => {
  const response = await page.goto('/this-doc-route-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle(/404.*NETFRAME/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SIGNAL LOST');
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await page.getByRole('link', { name: 'OPEN DOCS' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Getting Started');
});

const themes = ['', 'nf-theme-night-city', 'nf-theme-chiba-city', 'nf-theme-neon-80s', 'nf-theme-renaissance', 'nf-theme-code-rain', 'nf-theme-iron-signal'];
for (const theme of themes) {
  test(`spinner uses slow stationary signal cells in ${theme || 'default'}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/components/spinner/');
    await page.selectOption('#theme-switcher', theme);
    const spinner = page.locator('.demo-preview .nf-spinner').first();
    await expect(spinner).toHaveCSS('transform', 'none');
    const styles = await spinner.evaluate((el) => {
      const cell = getComputedStyle(el, '::before');
      return { duration: cell.animationDuration, transform: cell.transform, background: cell.backgroundImage, colour: cell.color };
    });
    expect(styles.duration).toBe('2.4s');
    expect(styles.transform).toBe('none');
    expect(styles.background).toContain('linear-gradient');
    expect(styles.colour).not.toBe('rgba(0, 0, 0, 0)');
    const firstOpacity = await spinner.evaluate((el) => getComputedStyle(el, '::before').opacity);
    await expect.poll(() => spinner.evaluate((el) => getComputedStyle(el, '::before').opacity)).not.toBe(firstOpacity);
    await expect(page.locator('.nf-spinner-label')).toHaveCSS('animation-name', 'none');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const element of await page.locator('.demo-preview .nf-spinner').all()) {
      const reduced = await element.evaluate((el) => ['::before', '::after'].map((pseudo) => ({
        animation: getComputedStyle(el, pseudo).animationName,
        opacity: getComputedStyle(el, pseudo).opacity,
      })));
      expect(reduced).toEqual([{ animation: 'none', opacity: '1' }, { animation: 'none', opacity: '1' }]);
    }
  });
}

test('ring percentages use a normalized path, do not overshoot, and leave stroke clearance', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/progress/');
  const ring = page.locator('.demo-preview .nf-progress-ring');
  const fill = ring.locator('.nf-ring-fill');
  await expect(fill).toHaveAttribute('pathLength', '100');
  await expect(fill).toHaveCSS('stroke-linecap', 'butt');
  for (const percent of [0, 25, 50, 75, 100, -10, 110]) {
    await ring.evaluate((el, value) => el.style.setProperty('--nf-ring-progress', String(value)), percent);
    const expected = 100 - Math.max(0, Math.min(100, percent));
    await expect(fill).toHaveCSS('opacity', percent <= 0 ? '0' : '1');
    await expect.poll(() => fill.evaluate((el) => {
      const raw = getComputedStyle(el).strokeDashoffset;
      return Number(raw.match(/-?\d+(\.\d+)?/)?.[0]);
    })).toBeCloseTo(expected, 2);
  }
  const clearance = await fill.evaluate((el) => {
    const circle = el as SVGCircleElement;
    const radius = circle.r.baseVal.value;
    const halfStroke = parseFloat(getComputedStyle(el).strokeWidth) / 2;
    return 16 - radius - halfStroke;
  });
  expect(clearance).toBeGreaterThanOrEqual(0);
});
