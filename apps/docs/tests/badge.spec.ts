// NetFrame Docs — unread notification marker clarity and semantics
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test } from '@playwright/test';

const themes = ['', 'nf-theme-night-city', 'nf-theme-chiba-city', 'nf-theme-neon-80s', 'nf-theme-renaissance', 'nf-theme-code-rain', 'nf-theme-iron-signal'];

for (const theme of themes) {
  test(`unread marker has a larger framed centre in ${theme || 'default'}`, async ({ page }) => {
    await page.goto('/components/badge/');
    await page.selectOption('#theme-switcher', theme);
    const unread = page.locator('.demo-preview .nf-badge-dot').first();
    await expect(unread).toHaveText('UNREAD ALERTS');
    const marker = await unread.evaluate((el) => {
      const style = getComputedStyle(el, '::after');
      return {
        centreWidth: parseFloat(style.width) - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth),
        centreHeight: parseFloat(style.height) - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth),
        background: style.backgroundColor,
        border: style.borderTopColor,
        shadow: style.boxShadow,
        events: style.pointerEvents,
        animation: style.animationName,
      };
    });
    expect(marker.centreWidth).toBeGreaterThanOrEqual(8);
    expect(marker.centreHeight).toBeGreaterThanOrEqual(8);
    expect(marker.background).not.toBe(marker.border);
    expect(marker.shadow).not.toBe('none');
    expect(marker.events).toBe('none');
    expect(marker.animation).toBe('none');
    const clear = page.locator('.demo-preview .nf-badge').filter({ hasText: 'ALL READ' });
    await expect(clear).not.toHaveClass(/nf-badge-dot/);
  });
}

test('notification control toggles, dismisses outside/with Escape, and manages focus', async ({ page, browserName }) => {
  await page.goto('/components/badge/');
  const root = page.locator('[data-notifications]');
  const trigger = root.locator('[data-notification-trigger]');
  const panel = root.locator('.notification-panel');
  const markRead = root.locator('[data-mark-read]');
  await expect(trigger).toHaveAccessibleName('ALERTS — 3 unread notifications');
  await expect(panel).toBeHidden();
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  await expect(panel.locator('li')).toHaveCount(3);
  await trigger.click();
  await expect(panel).toBeHidden();
  await trigger.press('Enter');
  await expect(panel).toBeVisible();
  await markRead.focus();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press('Space');
  await expect(panel).toBeVisible();
  await page.locator('h1').click();
  await expect(panel).toBeHidden();
  await trigger.focus();
  await trigger.press('Enter');
  const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  await trigger.press(tabKey);
  await expect(markRead).toBeFocused();
  await markRead.press(tabKey);
  await expect(panel).toBeHidden();
  await expect(trigger).toHaveClass(/nf-badge-dot/);
});

test('mark all read clears the marker and keeps read state across reopen', async ({ page }) => {
  await page.goto('/components/badge/');
  const root = page.locator('[data-notifications]');
  const trigger = root.locator('[data-notification-trigger]');
  await trigger.click();
  const markRead = root.locator('[data-mark-read]');
  await markRead.click();
  await expect(trigger).not.toHaveClass(/nf-badge-dot/);
  await expect(trigger).toHaveAccessibleName('ALERTS — no unread notifications');
  await expect(root.locator('[data-notification-count]')).toHaveText('0');
  await expect(root.getByRole('status')).toHaveText('All notifications read');
  await expect(root.locator('[data-unread]')).toHaveCount(0);
  await expect(root.locator('.notification-item-state')).toHaveText(['READ · JUST NOW', 'READ · 2 MIN AGO', 'READ · 5 MIN AGO']);
  await expect(markRead).toHaveAttribute('aria-disabled', 'true');
  await expect(root.locator('.notification-panel')).toBeVisible();
  await trigger.click();
  await trigger.click();
  await expect(root.locator('.notification-panel')).toBeVisible();
  await expect(trigger).not.toHaveClass(/nf-badge-dot/);
  await expect(root.getByRole('status')).toHaveText('All notifications read');
});

test('notification panel fits the preview without shifting the trigger on phone/tablet/desktop', async ({ page }) => {
  await page.goto('/components/badge/');
  await page.evaluate(() => document.fonts.ready);
  const root = page.locator('[data-notifications]');
  const trigger = root.locator('[data-notification-trigger]');
  const panel = root.locator('.notification-panel');
  const preview = root.locator('..');
  for (const width of [1440, 1000, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const position = () => trigger.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x + scrollX, y: rect.y + scrollY };
    });
    const before = await position();
    await trigger.click();
    await expect(panel).toBeVisible();
    const after = await position();
    expect(after!.x).toBeCloseTo(before!.x, 0);
    expect(after!.y).toBeCloseTo(before!.y, 0);
    const bounds = await preview.boundingBox();
    const rect = await panel.boundingBox();
    expect(rect!.x).toBeGreaterThanOrEqual(bounds!.x);
    expect(rect!.x + rect!.width + 4).toBeLessThanOrEqual(bounds!.x + bounds!.width);
    expect(await panel.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await trigger.click();
    await expect(panel).toBeHidden();
  }
});
