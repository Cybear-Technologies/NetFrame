// NetFrame Docs — responsive layout sweeps across routes and widths
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Detects page-level horizontal overflow, clipped or off-screen content and
// colliding top-bar controls. Content that scrolls in place on purpose (tables,
// code, tab lists) is allowed to overflow its own region, never the page.

import { expect, test, type Page } from '@playwright/test';
import { builtRoutes } from './routes';
import { NAV_BREAKPOINT, WIDTHS, documentOverflow, horizontalOffenders, isReachable, rect, settle } from './helpers/layout';

const KEY_ROUTES = ['/', '/getting-started/', '/theming/', '/agents/', '/components/button/', '/components/table/', '/components/modal/', '/components/dropdown/', '/components/input/'];
const NOT_FOUND = '/__no-such-page__/';

async function expectNoOverflow(page: Page, label: string): Promise<void> {
  expect(await documentOverflow(page), `${label}: document scrolls sideways`).toBeLessThanOrEqual(0);
  expect(await horizontalOffenders(page), `${label}: elements outside the viewport`).toEqual([]);
}

test.describe('phone widths: every built route', () => {
  for (const width of [320, 390]) {
    test(`no horizontal overflow or clipped content at ${width}px`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: 800 });
      const problems: string[] = [];
      for (const route of [...builtRoutes(), NOT_FOUND]) {
        await page.goto(route);
        await settle(page);
        const over = await documentOverflow(page);
        const offenders = await horizontalOffenders(page);
        if (over > 0) problems.push(`${route}: document overflows by ${over}px`);
        for (const o of offenders.slice(0, 3)) problems.push(`${route}: ${o.element} spans ${o.left}..${o.right}`);
      }
      expect(problems).toEqual([]);
    });
  }
});

test.describe('key routes across all representative widths', () => {
  for (const route of KEY_ROUTES) {
    test(`${route} fits at ${WIDTHS.join(', ')}px`, async ({ page }) => {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        await settle(page);
        await expectNoOverflow(page, `${route} @ ${width}px`);
      }
    });
  }
});

test.describe('docs top bar', () => {
  for (const width of [320, 390, 768, NAV_BREAKPOINT - 1, NAV_BREAKPOINT, 1440]) {
    test(`controls are visible, reachable and do not collide at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/components/button/');
      await settle(page);
      const wide = width >= NAV_BREAKPOINT;
      const showsTrail = width >= 640; // 40rem
      const controls = [
        ...(wide ? [] : [['menu button', page.locator('#nav-toggle')] as const]),
        ...(showsTrail ? [['title', page.locator('.docs-topbar-path')] as const] : []),
        ['theme select', page.locator('#theme-switcher')] as const,
        ['GitHub link', page.locator('.docs-topbar-link')] as const,
      ];
      const boxes: { name: string; x: number; y: number; right: number; bottom: number }[] = [];
      for (const [name, locator] of controls) {
        await expect(locator, name).toBeVisible();
        if (name !== 'title') expect(await isReachable(locator), `${name} is reachable`).toBe(true);
        const r = await rect(locator);
        expect(r.x, `${name} left edge`).toBeGreaterThanOrEqual(0);
        expect(r.right, `${name} right edge`).toBeLessThanOrEqual(width);
        boxes.push({ name, x: r.x, y: r.y, right: r.right, bottom: r.bottom });
      }
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i]!;
          const b = boxes[j]!;
          const overlap = a.x < b.right - 0.5 && b.x < a.right - 0.5 && a.y < b.bottom - 0.5 && b.y < a.bottom - 0.5;
          expect(overlap, `${a.name} overlaps ${b.name}`).toBe(false);
        }
      }
    });
  }
});

test.describe('docs top bar wording', () => {
  test('phones show MENU without a bare page name beside it (it read like a second button label)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/components/button/');
    await settle(page);
    await expect(page.locator('#nav-toggle')).toBeVisible();
    await expect(page.locator('.docs-topbar-path')).toBeHidden();
    // The page is still named by its heading, immediately below.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  });

  test('wider windows show the full NETFRAME_DOCS // PAGE trail', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto('/components/button/');
    await settle(page);
    await expect(page.locator('.docs-topbar-path')).toHaveText('NETFRAME_DOCS // BUTTON');
  });
});

test.describe('brand line', () => {
  for (const [width, label] of [[1440, 'desktop sidebar'], [390, 'mobile drawer']] as const) {
    test(`names the company in full in the ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/components/button/');
      await settle(page);
      if (width < NAV_BREAKPOINT) {
        await page.locator('#nav-toggle').click();
        await expect(page.locator('#docs-sidebar')).toHaveAttribute('data-state', 'open');
        await page.waitForTimeout(350);
      }
      const brand = page.locator('.sidebar-logo-sub');
      await expect(brand).toHaveText('BY CYBEAR TECHNOLOGIES');
      const box = await rect(brand);
      const bar = await rect(page.locator('#docs-sidebar'));
      expect(box.x).toBeGreaterThanOrEqual(bar.x);
      expect(box.right).toBeLessThanOrEqual(bar.right);
      // It may wrap at the space, but never mid-word.
      expect(await brand.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    });
  }
});

test.describe('docs content', () => {
  test('keeps a comfortable gutter on phones and uses the space on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/components/button/');
    await settle(page);
    const phone = await rect(page.locator('h1'));
    expect(phone.x).toBeGreaterThanOrEqual(12);
    expect(phone.x).toBeLessThanOrEqual(24); // not the old 48px each side
    await page.setViewportSize({ width: 1440, height: 900 });
    const desktop = await rect(page.locator('h1'));
    expect(desktop.x).toBeGreaterThanOrEqual(256 + 32);
  });

  test('demo previews leave usable room and keep the whole code snippet and copy button', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/components/button/');
    await settle(page);
    const preview = await rect(page.locator('.demo-preview').first());
    const button = await rect(page.locator('.demo-preview .nf-button').first());
    expect(button.width).toBeGreaterThan(preview.width * 0.45); // padding does not squeeze the example
    const copy = page.locator('.demo-copy').first();
    const copyBox = await rect(copy);
    expect(copyBox.width).toBeGreaterThanOrEqual(43.5);
    expect(copyBox.height).toBeGreaterThanOrEqual(43.5);
    // The complete snippet is still in the page and copy still returns it unwrapped.
    const code = (await page.locator('.demo-code code').first().textContent()) ?? '';
    expect(await copy.getAttribute('data-code')).toBe(code);
  });

  test('wide Markdown tables scroll inside a labelled, focusable region, not the page', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/agents/');
    await settle(page);
    const regions = page.locator('.docs-table-scroll');
    await expect(regions.first()).toHaveAttribute('role', 'region');
    await expect(regions.first()).toHaveAttribute('tabindex', '0');
    await expect(regions.first().locator('table')).toHaveCount(1); // real table semantics kept
    expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
  });

  test('token tables keep names and values readable at 320px (local scroll allowed)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/theming/');
    await settle(page);
    const region = page.locator('.nf-table-wrap[role="region"]').first();
    await expect(region).toHaveAttribute('tabindex', '0');
    expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
    await expect(region.locator('.token-name').first()).toBeVisible();
  });

  test('long headings and inline code wrap instead of widening the page', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/components/card/');
    await settle(page);
    expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
    const code = await page.locator('.docs-content p code').first().evaluate((el) => getComputedStyle(el).overflowWrap);
    expect(code).toBe('anywhere');
  });

  test('footer wraps and stays inside the viewport at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/components/button/');
    await settle(page);
    const footer = page.locator('.docs-footer');
    await footer.scrollIntoViewIfNeeded();
    const r = await rect(footer);
    expect(r.right).toBeLessThanOrEqual(320);
    expect(await isReachable(footer.locator('span').first())).toBe(true);
  });
});

test.describe('landing title', () => {
  for (const width of [320, 390, 768, 1024, 1280, 1440, 1920]) {
    test(`NETFRAME stays on one line and inside the content at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await settle(page);
      const title = page.locator('.hero-title');
      const lines = await title.evaluate((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
      });
      expect(lines, 'rendered on one line').toBe(1);
      const t = await rect(title);
      const main = await rect(page.locator('.landing-main'));
      const textRight = await title.evaluate((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return Math.max(...[...range.getClientRects()].map((r) => r.right));
      });
      expect(textRight).toBeLessThanOrEqual(width);
      expect(textRight).toBeLessThanOrEqual(main.right);
      expect(t.height).toBeLessThan(parseFloat(await title.evaluate((el) => getComputedStyle(el).fontSize)) * 1.3);
    });
  }
});

test.describe('landing page', () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`hero, palette and install actions fit and are reachable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await settle(page);
      await expectNoOverflow(page, `landing @ ${width}px`);
      const title = page.locator('.hero-title');
      await title.scrollIntoViewIfNeeded();
      const t = await rect(title);
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.right).toBeLessThanOrEqual(width);
      for (const link of await page.locator('.hero-actions a').all()) {
        expect(await isReachable(link)).toBe(true);
        expect((await rect(link)).height).toBeGreaterThanOrEqual(43.5);
      }
      const select = page.locator('#theme-switcher');
      expect(await isReachable(select)).toBe(true);
      // The theme control must not sit on top of the hero tag line.
      // Compare against the tag's actual text spans, not its full-width flex box.
      const s = await rect(select);
      for (const span of await page.locator('.hero-tag > span').all()) {
        const r = await rect(span);
        const collides = s.x < r.right && r.x < s.right && s.y < r.bottom && r.y < s.bottom;
        expect(collides, 'theme select overlaps the hero tag text').toBe(false);
      }
    });
  }

  test('palette swatches stay readable in two columns on phones and four on tablets', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/');
    await settle(page);
    const cols = (sel: string) => page.locator(sel).evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(await cols('.palette-grid')).toBe(2);
    for (const swatch of await page.locator('.swatch').all()) expect(await isReachable(swatch.locator('.swatch-hex'))).toBe(true);
    await page.setViewportSize({ width: 768, height: 800 });
    expect(await cols('.palette-grid')).toBe(4);
  });

  test('the install command can be scrolled to, and is keyboard focusable', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/');
    await settle(page);
    const pre = page.locator('.install-code');
    await expect(pre).toHaveAttribute('tabindex', '0');
    await expect(pre).toHaveAccessibleName('Install command');
    await pre.scrollIntoViewIfNeeded();
    expect(await isReachable(pre)).toBe(true);
  });
});

test.describe('404 page', () => {
  for (const width of [320, 390]) {
    test(`recovery links are full-size and reachable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      const response = await page.goto(NOT_FOUND);
      expect(response?.status()).toBe(404);
      await settle(page);
      await expectNoOverflow(page, `404 @ ${width}px`);
      for (const link of await page.locator('.error-actions a').all()) expect(await isReachable(link)).toBe(true);
    });
  }
});

test.describe('safe areas and short viewports', () => {
  test('viewport meta opts in to safe-area insets', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/);
  });

  test('content and footer use env(safe-area-inset-*) padding', async ({ page }) => {
    await page.goto('/components/button/');
    const css = await page.evaluate(() => [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].map((r) => r.cssText); } catch { return []; } }).join('\n'));
    for (const edge of ['top', 'right', 'bottom', 'left']) expect(css, `safe-area-inset-${edge}`).toContain(`safe-area-inset-${edge}`);
  });

  for (const [width, height] of [[667, 320], [568, 320], [844, 390]] as const) {
    test(`${width}x${height} landscape: page does not overflow and the main content is reachable`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/components/button/');
      await settle(page);
      await expectNoOverflow(page, `landscape ${width}x${height}`);
      expect(await page.locator('.docs-topbar').evaluate((el) => getComputedStyle(el).position)).toBe(width >= NAV_BREAKPOINT ? 'sticky' : 'static');
      await page.locator('h2').first().scrollIntoViewIfNeeded();
      expect(await isReachable(page.locator('h2').first())).toBe(true);
    });
  }

  test('no fixed control covers content or a focused control on phones', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto('/components/button/');
    await settle(page);
    // The old floating NAV button sat over example content; nothing is fixed now except the (hidden) drawer.
    const fixed = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((el) => getComputedStyle(el).position === 'fixed' && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0 && !el.matches('.nf-crt, .skip-link')).map((el) => el.className.toString().split(' ')[0]));
    expect(fixed).toEqual([]);
    const copy = page.locator('.demo-copy').first();
    await copy.focus();
    expect(await isReachable(copy)).toBe(true);
  });
});
