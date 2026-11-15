// NetFrame — tag markup, close controls, and optional consumer behavior
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test } from '@playwright/test';
import { documentOverflow, loadFixture, rect, settle } from './helpers/layout';
import { docsSnippet } from './helpers/snippets';

test('closable demo labels and buttons align without MDX paragraph wrappers', async ({ page }) => {
  await page.goto('/components/tag/');
  await settle(page);
  const tags = page.locator('.demo-preview .nf-tag').filter({ has: page.locator('.nf-tag-close') });
  await expect(tags).toHaveCount(3);
  for (const tag of await tags.all()) {
    await expect(tag.locator('p')).toHaveCount(0);
    const box = await rect(tag);
    const close = await rect(tag.locator('.nf-tag-close'));
    expect(Math.abs((close.y + close.height / 2) - (box.y + box.height / 2))).toBeLessThanOrEqual(1);
    const text = await rect(tag.locator('span').first());
    expect(Math.abs((text.y + text.height / 2) - (close.y + close.height / 2))).toBeLessThanOrEqual(1);
  }
});

test('live close buttons remove only their tag and keep keyboard focus logical', async ({ page }) => {
  await page.goto('/components/tag/');
  const first = page.getByRole('button', { name: 'Remove UPLINK tag' });
  await first.focus();
  await first.press('Enter');
  await expect(first).toHaveCount(0);
  const middle = page.getByRole('button', { name: 'Remove ICE_CORE tag' });
  await expect(middle).toBeFocused();
  const last = page.getByRole('button', { name: 'Remove NODE_047 tag' });
  await last.focus();
  await last.press('Space');
  await expect(middle).toBeFocused();
  await middle.press('Enter');
  await expect(page.locator('[data-tag-fallback]')).toBeFocused();
  await expect(page.locator('[data-tag-status]')).toHaveText('Tag removed. 0 tags remaining.');
});

test('live tags close by mouse or touch without submitting a form', async ({ page, isMobile }) => {
  await page.goto('/components/tag/');
  await page.locator('[data-tag-group]').evaluate((group) => {
    const form = document.createElement('form');
    form.id = 'tag-demo-form';
    group.before(form);
    form.append(group);
    form.addEventListener('submit', (event) => { event.preventDefault(); form.dataset['submitted'] = 'true'; });
  });
  const close = page.getByRole('button', { name: 'Remove UPLINK tag' });
  await expect(close).toHaveAttribute('type', 'button');
  const url = page.url();
  if (isMobile) await close.tap(); else await close.click();
  await expect(page.locator('[data-tag-list] .nf-tag')).toHaveCount(2);
  await expect(page).toHaveURL(url);
  await expect(page.locator('#tag-demo-form')).not.toHaveAttribute('data-submitted');
});

test('long labels wrap in a narrow column without shrinking close targets', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loadFixture(page, `<div style="width:280px"><span class="nf-tag"><span>VERY_LONG_UNBROKEN_IDENTIFIER_ABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789</span><button class="nf-tag-close" type="button" aria-label="Remove long tag"></button></span></div>`);
  const tag = await rect(page.locator('.nf-tag'));
  const text = await rect(page.locator('.nf-tag > span'));
  const close = page.locator('.nf-tag-close');
  const box = await rect(close);
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  expect(box.width).toBe(coarse ? 44 : 16);
  expect(box.height).toBe(coarse ? 44 : 16);
  expect(text.right).toBeLessThanOrEqual(box.x);
  expect(box.right).toBeLessThanOrEqual(tag.right);
  expect(tag.width).toBeLessThanOrEqual(280);
  expect(await documentOverflow(page)).toBe(0);
  await page.keyboard.press('Shift');
  await close.focus();
  await expect(close).toHaveCSS('outline-style', 'solid');
});

test('controller preserves outside focus, disabled states, and independent groups', async ({ page }) => {
  const group = (name: string) => `<section data-tag-group><div data-tag-list><span class="nf-tag"><span>${name}</span><button class="nf-tag-close" type="button" aria-label="Remove ${name}" hidden></button></span></div><button data-tag-fallback type="button">${name} next</button></section>`;
  await loadFixture(page, `<button id="outside">Outside</button>${group('one')}${group('two')}<script>${docsSnippet('tag')}</script>`);
  const close = page.getByRole('button', { name: 'Remove one', exact: true });
  await close.evaluate((el: HTMLButtonElement) => { el.disabled = true; el.click(); });
  await expect(page.locator('.nf-tag')).toHaveCount(2);
  await close.evaluate((el: HTMLButtonElement) => { el.disabled = false; el.setAttribute('aria-disabled', 'true'); el.click(); });
  await expect(page.locator('.nf-tag')).toHaveCount(2);
  await close.evaluate((el) => el.removeAttribute('aria-disabled'));
  await page.locator('#outside').focus();
  await close.evaluate((el: HTMLButtonElement) => el.click());
  await expect(page.locator('#outside')).toBeFocused();
  await expect(page.locator('.nf-tag')).toHaveCount(1);
  const other = page.getByRole('button', { name: 'Remove two', exact: true });
  await other.focus();
  await other.press('Enter');
  await expect(page.getByRole('button', { name: 'two next' })).toBeFocused();
});

test('without JavaScript tags remain readable and inactive close controls stay hidden', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: test.info().project.use.baseURL! });
  try {
    const page = await context.newPage();
    await page.goto('/components/tag/');
    await expect(page.locator('[data-tag-list] .nf-tag')).toHaveCount(3);
    for (const close of await page.locator('[data-tag-list] .nf-tag-close').all()) await expect(close).toBeHidden();
  } finally {
    await context.close();
  }
});
