// NetFrame Docs — responsive navigation (drawer below 64rem, sidebar above)
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test, type Page } from '@playwright/test';
import { NAV_BREAKPOINT, finishAnimations, isReachable, rect, settle, tabKeys } from './helpers/layout';

const PAGE = '/components/button/';
const toggle = (page: Page) => page.locator('#nav-toggle');
const sidebar = (page: Page) => page.locator('#docs-sidebar');
const closeBtn = (page: Page) => page.locator('#nav-close');

async function open(page: Page): Promise<void> {
  await toggle(page).click();
  await expect(sidebar(page)).toHaveAttribute('data-state', 'open');
}

test.describe('phone width (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await settle(page);
  });

  test('closed drawer is out of the tab order and the accessibility tree', async ({ page, browserName }) => {
    await expect(sidebar(page)).toHaveJSProperty('inert', true);
    await expect(sidebar(page)).toHaveAttribute('data-state', 'closed');
    await expect(page.getByRole('navigation', { name: 'Documentation' })).toHaveCount(0);
    const { tab } = tabKeys(browserName);
    await page.locator('body').press(tab); // first stop is the skip link
    const visited: string[] = [];
    for (let i = 0; i < 14; i++) {
      visited.push(await page.evaluate(() => (document.activeElement?.closest('#docs-sidebar') ? 'SIDEBAR' : document.activeElement?.id || document.activeElement?.tagName || '')));
      await page.keyboard.press(tab);
    }
    expect(visited).not.toContain('SIDEBAR');
    expect(visited).toContain('nav-toggle');
  });

  test('skip link is the first tab stop and moves focus to the main content', async ({ page, browserName }) => {
    const { tab } = tabKeys(browserName);
    await page.keyboard.press(tab);
    const skip = page.locator('[data-skip-link]');
    await expect(skip).toBeFocused();
    await expect.poll(() => isReachable(skip)).toBe(true); // slides into view while focused
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('the menu button is a 44px target with an accessible name and state', async ({ page }) => {
    const box = await rect(toggle(page));
    expect(box.width).toBeGreaterThanOrEqual(43.5);
    expect(box.height).toBeGreaterThanOrEqual(43.5);
    await expect(toggle(page)).toHaveAccessibleName(/menu/i);
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle(page)).toHaveAttribute('aria-controls', 'docs-sidebar');
  });

  test('opening: names the nav, marks the current page, moves focus, inerts the page, locks scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' })); // html uses smooth scrolling
    await open(page);
    await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeVisible();
    await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveText('BUTTON');
    await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveCount(1);
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(closeBtn(page)).toBeFocused();
    await expect(page.locator('.docs-main')).toHaveJSProperty('inert', true);
    await expect(page.locator('[data-skip-link]')).toHaveJSProperty('inert', true);
    await expect(page.locator('html')).toHaveClass(/nav-open/);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
    // Wheel input is unavailable in mobile WebKit emulation; there the locked
    // overflow above is the check. Real iOS rubber-banding needs a device test.
    if (!test.info().project.use.isMobile) {
      const before = await page.evaluate(() => scrollY);
      await page.mouse.move(300, 400);
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(150);
      expect(await page.evaluate(() => scrollY)).toBe(before);
    }
    // The scrim dims and is a dismiss target; the drawer stays inside the viewport.
    await expect(page.locator('#nav-scrim')).toBeVisible();
    await finishAnimations(sidebar(page));
    const drawer = await rect(sidebar(page));
    expect(drawer.x).toBeGreaterThanOrEqual(0);
    expect(drawer.right).toBeLessThanOrEqual(390);
    expect(drawer.width).toBeLessThanOrEqual(390 - 40); // leaves a visible scrim strip to tap
  });

  test('focus stays inside the open drawer (Tab and Shift+Tab wrap)', async ({ page, browserName }) => {
    const { tab, shiftTab } = tabKeys(browserName);
    await open(page);
    const links = await page.locator('#docs-sidebar a, #docs-sidebar button').count();
    const seen = new Set<string>();
    for (let i = 0; i < links + 3; i++) {
      await page.keyboard.press(tab);
      expect(await page.evaluate(() => !!document.activeElement?.closest('#docs-sidebar'))).toBe(true);
      seen.add(await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ''));
    }
    expect(seen.size).toBeGreaterThan(5);
    // From the first control, Shift+Tab wraps to the last link instead of leaving the drawer.
    await page.locator('#docs-sidebar .sidebar-logo').focus();
    await page.keyboard.press(shiftTab);
    await expect(page.locator('#docs-sidebar a').last()).toBeFocused();
  });

  for (const how of ['escape', 'close button', 'scrim', 'link'] as const) {
    test(`closes with ${how} and restores state`, async ({ page }) => {
      await open(page);
      if (how === 'escape') await page.keyboard.press('Escape');
      if (how === 'close button') await closeBtn(page).click();
      if (how === 'scrim') await page.locator('#nav-scrim').click({ position: { x: 380, y: 400 } });
      if (how === 'link') {
        await page.locator('#docs-sidebar a', { hasText: 'INPUT' }).click();
        await expect(page).toHaveURL(/\/components\/input\/?$/);
        await settle(page);
        // The new page starts closed and unlocked.
        await expect(sidebar(page)).toHaveAttribute('data-state', 'closed');
        await expect(page.locator('html')).not.toHaveClass(/nav-open/);
        return;
      }
      await expect(sidebar(page)).toHaveAttribute('data-state', 'closed');
      await expect(sidebar(page)).toHaveJSProperty('inert', true);
      await expect(page.locator('.docs-main')).toHaveJSProperty('inert', false);
      await expect(page.locator('html')).not.toHaveClass(/nav-open/);
      await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#nav-scrim')).toBeHidden();
      await expect(toggle(page)).toBeFocused();
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
    });
  }

  test('Escape on a closed menu does nothing', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(sidebar(page)).toHaveAttribute('data-state', 'closed');
    await expect(toggle(page)).not.toBeFocused();
  });

  test('reduced motion removes the drawer transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // The global reduced-motion rule clamps durations to ~0 rather than exactly 0s.
    const seconds = await sidebar(page).evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
    expect(seconds).toBeLessThan(0.001);
    await open(page);
    await expect(sidebar(page)).toHaveAttribute('data-state', 'open');
  });

  test('theme selection works on the narrow top bar without moving the menu button', async ({ page }) => {
    const before = await rect(toggle(page));
    await page.selectOption('#theme-switcher', 'nf-theme-iron-signal');
    await expect(page.locator('html')).toHaveClass(/nf-theme-iron-signal/);
    const after = await rect(toggle(page));
    expect(after.x).toBeCloseTo(before.x, 0);
    expect(await isReachable(page.locator('#theme-switcher'))).toBe(true);
    expect(await isReachable(page.locator('.docs-topbar-link'))).toBe(true);
  });
});

test.describe('state resets across the breakpoint', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('an open drawer is cleared when the window grows to desktop, and stays closed when shrunk again', async ({ page }) => {
    await page.goto(PAGE);
    await settle(page);
    await open(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(sidebar(page)).toHaveAttribute('data-state', 'desktop');
    await expect(sidebar(page)).toHaveJSProperty('inert', false);
    await expect(sidebar(page)).toBeVisible();
    await expect(page.locator('.docs-main')).toHaveJSProperty('inert', false);
    await expect(page.locator('[data-skip-link]')).toHaveJSProperty('inert', false);
    await expect(page.locator('#nav-scrim')).toBeHidden();
    await expect(toggle(page)).toBeHidden();
    await expect(page.locator('html')).not.toHaveClass(/nav-open/);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(sidebar(page)).toHaveAttribute('data-state', 'closed');
    await expect(sidebar(page)).toHaveJSProperty('inert', true);
    await expect(toggle(page)).toBeVisible();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('focus inside the desktop sidebar moves to the menu button when it becomes a closed drawer', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(PAGE);
    await settle(page);
    await page.locator('#docs-sidebar a', { hasText: 'CARD' }).focus();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(toggle(page)).toBeFocused();
  });
});

test.describe('breakpoint boundary', () => {
  for (const [width, mode] of [[NAV_BREAKPOINT - 1, 'drawer'], [NAV_BREAKPOINT, 'sidebar'], [NAV_BREAKPOINT + 1, 'sidebar']] as const) {
    test(`${width}px uses the ${mode}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(PAGE);
      await settle(page);
      if (mode === 'sidebar') {
        await expect(sidebar(page)).toBeVisible();
        await expect(sidebar(page)).toHaveAttribute('data-state', 'desktop');
        await expect(toggle(page)).toBeHidden();
        const main = await rect(page.locator('.docs-main'));
        expect(main.x).toBeCloseTo(256, 0); // content starts after the 16rem sidebar
      } else {
        await expect(sidebar(page)).toHaveAttribute('data-state', 'closed');
        await expect(toggle(page)).toBeVisible();
        const main = await rect(page.locator('.docs-main'));
        expect(main.x).toBeCloseTo(0, 0);
      }
    });
  }
});

test.describe('short landscape viewport (667x320)', () => {
  test.use({ viewport: { width: 667, height: 320 } });

  test('the top bar scrolls away instead of covering a third of the screen, and the menu still works', async ({ page }) => {
    await page.goto(PAGE);
    await settle(page);
    expect(await page.locator('.docs-topbar').evaluate((el) => getComputedStyle(el).position)).toBe('static');
    await open(page);
    // Drawer content is taller than the screen: it scrolls, and the close button stays reachable.
    await expect(closeBtn(page)).toBeFocused();
    await expect.poll(() => isReachable(closeBtn(page))).toBe(true); // after the slide-in
    const scrolls = await sidebar(page).evaluate((el) => el.scrollHeight > el.clientHeight);
    expect(scrolls).toBe(true);
    await page.locator('#docs-sidebar a', { hasText: 'SKELETON' }).scrollIntoViewIfNeeded();
    await expect.poll(() => isReachable(page.locator('#docs-sidebar a', { hasText: 'SKELETON' }))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(toggle(page)).toBeFocused();
  });
});

test.describe('menu button icon', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the hamburger icon is visible against the button (not primary-on-primary)', async ({ page }) => {
    await page.goto(PAGE);
    await settle(page);
    const colours = await page.locator('#nav-toggle').evaluate((el) => ({
      button: getComputedStyle(el).backgroundColor,
      icon: getComputedStyle(el.querySelector('i')!).color,
    }));
    expect(colours.icon).not.toBe(colours.button);
  });
});
