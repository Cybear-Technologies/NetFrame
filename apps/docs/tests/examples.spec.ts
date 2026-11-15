// NetFrame Docs — documented JavaScript examples
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Runs the exact `## JavaScript` snippets from the component MDX pages
// against the built netframe CSS, so copy-pasted examples stay correct.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

const PAGES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'pages', 'components');

function snippet(name: string, heading = 'JavaScript'): string {
  const mdx = fs.readFileSync(path.join(PAGES, `${name}.mdx`), 'utf8');
  const match = new RegExp(`## ${heading}[\\s\\S]*?\`\`\`js\\n([\\s\\S]*?)\`\`\``).exec(mdx);
  if (!match?.[1]) throw new Error(`no ${heading} JavaScript snippet in ${name}.mdx`);
  return match[1];
}

const MARKUP = `
<main id="page">
  <div class="nf-dropdown" id="dd">
    <button class="nf-button nf-button-ghost nf-dropdown-trigger" aria-expanded="false" aria-haspopup="menu">ACCESS</button>
    <ul class="nf-dropdown-menu" role="menu">
      <li role="none"><button class="nf-dropdown-item" role="menuitem">SCAN</button></li>
      <li role="none"><button class="nf-dropdown-item" role="menuitem" aria-disabled="true">SYNC</button></li>
      <li role="none"><button class="nf-dropdown-item" role="menuitem">PURGE</button></li>
    </ul>
  </div>
  <div class="nf-tab-list" role="tablist" aria-label="Modules">
    <button class="nf-tab" role="tab" aria-selected="true" aria-controls="p1" id="t1">A</button>
    <button class="nf-tab" role="tab" aria-selected="false" aria-controls="p2" id="t2">B</button>
    <button class="nf-tab" role="tab" aria-selected="false" aria-controls="p3" id="t3" aria-disabled="true">C</button>
  </div>
  <div class="nf-tab-panel" role="tabpanel" id="p1" aria-labelledby="t1">P1</div>
  <div class="nf-tab-panel" role="tabpanel" id="p2" aria-labelledby="t2" hidden>P2</div>
  <div class="nf-tab-panel" role="tabpanel" id="p3" aria-labelledby="t3" hidden>P3</div>
  <div class="nf-accordion"><div class="nf-accordion-item">
    <button class="nf-accordion-trigger" aria-expanded="false" aria-controls="ap1">SECTION<span class="nf-accordion-icon"></span></button>
    <div class="nf-accordion-content" id="ap1"><div class="nf-accordion-body"><a href="#x" id="inner">LINK</a></div></div>
  </div></div>
  <span class="nf-tooltip-wrap"><button class="nf-button nf-button-ghost" id="tipbtn">HOVER</button><span class="nf-tooltip" id="tip">TIP</span></span>
  <button class="nf-button nf-button-secondary" id="sec">SEC</button>
  <button class="nf-button nf-button-danger" id="danger">ABORT</button>
  <button id="open-modal" class="nf-button">OPEN</button>
</main>
<div class="nf-modal-overlay nf-hidden" id="modal-overlay" aria-hidden="true">
  <div class="nf-modal" role="dialog" aria-modal="true" aria-labelledby="mt" tabindex="-1">
    <div class="nf-modal-header"><span id="mt">TITLE</span><button class="nf-modal-close" aria-label="Close">x</button></div>
    <div class="nf-modal-body"><button id="m1">ONE</button><button id="m2">TWO</button></div>
  </div>
</div>`;

async function openFixture(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
    <link rel="stylesheet" href="/netframe.css"><link rel="stylesheet" href="/themes.css">
    </head><body>${MARKUP}
    <div class="nf-toast-region nf-toast-top-right" id="toast-region" aria-live="polite"></div>
    <script>${[...['dropdown', 'tabs', 'accordion', 'modal'].map((n) => snippet(n)), snippet('toast', 'Usage')].join('\n;\n')}</script>
    </body></html>`;
  // Serve from the preview origin so /netframe.css and /fonts resolve.
  await page.route('**/__fixture', (route) =>
    route.fulfill({ contentType: 'text/html', body: html }),
  );
  await page.goto('/__fixture');
  return errors;
}

const active = (page: Page) => page.evaluate(() => document.activeElement?.id || document.activeElement?.textContent);

test('dropdown snippet opens, navigates, and actually hides the menu', async ({ page }) => {
  const errors = await openFixture(page);
  const trigger = page.locator('#dd .nf-dropdown-trigger');
  const menu = page.locator('#dd .nf-dropdown-menu');

  await expect(menu).toBeHidden();
  await trigger.click();
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('aria-hidden', 'false');
  expect(await active(page)).toBe('SCAN');

  await page.keyboard.press('ArrowDown'); // skips disabled SYNC
  expect(await active(page)).toBe('PURGE');

  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await trigger.click(); // toggles closed (the previous toggleAttribute bug left it open)
  await expect(menu).toBeHidden();

  await trigger.click();
  await page.locator('#sec').click(); // outside click
  await expect(menu).toBeHidden();
  expect(errors).toEqual([]);
});

test('tabs snippet supports roving focus and skips disabled tabs', async ({ page }) => {
  const errors = await openFixture(page);
  await page.locator('#t1').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#t2')).toBeFocused();
  await expect(page.locator('#t2')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#p2')).toBeVisible();
  await expect(page.locator('#p1')).toBeHidden();
  expect(await page.locator('.nf-tab').evaluateAll((t) => t.map((el) => (el as HTMLElement).tabIndex))).toEqual([-1, 0, -1]);

  await page.keyboard.press('ArrowRight'); // C disabled → wraps to A
  await expect(page.locator('#t1')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#t2')).toBeFocused();

  await page.locator('#t3').click({ force: true });
  await expect(page.locator('#t3')).toHaveAttribute('aria-selected', 'false');
  expect(errors).toEqual([]);
});

test('accordion snippet keeps collapsed content out of the tab order', async ({ page }) => {
  const errors = await openFixture(page);
  const trigger = page.locator('.nf-accordion-trigger');
  const panel = page.locator('#ap1');

  expect(await panel.evaluate((el) => (el as HTMLElement).inert)).toBe(true);
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => panel.evaluate((el) => (el as HTMLElement).style.height)).toBe('auto');
  expect(await panel.evaluate((el) => (el as HTMLElement).inert)).toBe(false);

  await trigger.click();
  await expect.poll(() => panel.evaluate((el) => (el as HTMLElement).style.height)).toBe('0px');
  expect(await panel.evaluate((el) => (el as HTMLElement).inert)).toBe(true);
  expect(errors).toEqual([]);
});

test('modal snippet traps focus, inerts the page, and restores focus', async ({ page }) => {
  const errors = await openFixture(page);
  const overlay = page.locator('#modal-overlay');

  await page.locator('#sec').focus();
  await page.keyboard.press('Escape'); // closed modal must not steal focus
  await expect(page.locator('#sec')).toBeFocused();

  await page.locator('#open-modal').click();
  await expect(overlay).toBeVisible();
  await expect(page.locator('.nf-modal')).toBeFocused();
  expect(await page.locator('#page').evaluate((el) => (el as HTMLElement).inert)).toBe(true);

  await page.locator('#m2').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.nf-modal-close')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#m2')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(overlay).toBeHidden();
  await expect(page.locator('#open-modal')).toBeFocused();
  expect(await page.locator('#page').evaluate((el) => (el as HTMLElement).inert)).toBe(false);
  expect(errors).toEqual([]);
});

test('tooltip opens when its focusable child is keyboard-focused', async ({ page, browserName }) => {
  await openFixture(page);
  await page.locator('#sec').focus();
  // Safari's default keyboard navigation requires Option+Tab for buttons.
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab');
  await expect(page.locator('#tipbtn')).toBeFocused();
  await expect.poll(() => page.locator('#tip').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
});

test('filled button hover states swap text colour with background', async ({ page }) => {
  await openFixture(page);
  await page.locator('#sec').hover();
  await expect(page.locator('#sec')).toHaveCSS('background-color', 'rgb(188, 130, 255)'); // tertiary #bc82ff
  await expect(page.locator('#sec')).toHaveCSS('color', 'rgb(0, 0, 0)'); // on-tertiary
  await page.locator('#danger').hover();
  await expect(page.locator('#danger')).toHaveCSS('background-color', 'rgb(147, 0, 10)');
  await expect(page.locator('#danger')).toHaveCSS('color', 'rgb(226, 226, 226)');
});

test.describe('toast snippet', () => {
  test('renders titles and messages as text, not HTML', async ({ page }) => {
    const errors = await openFixture(page);
    await page.evaluate(() => {
      // @ts-expect-error showToast is defined by the docs snippet
      showToast({ title: '<b>T</b>', message: '<img src=x onerror="window.__pwned=1">', duration: 60_000 });
    });
    const toast = page.locator('#toast-region .nf-toast');
    await expect(toast.locator('.nf-toast-message')).toHaveText('<img src=x onerror="window.__pwned=1">');
    await expect(toast.locator('img, b')).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    expect(errors).toEqual([]);
  });

  test('errors use role=alert; others rely on the polite region', async ({ page }) => {
    await openFixture(page);
    await page.evaluate(() => {
      // @ts-expect-error showToast is defined by the docs snippet
      showToast({ title: 'A', message: 'a', type: 'error', duration: 60_000 });
      // @ts-expect-error showToast is defined by the docs snippet
      showToast({ title: 'B', message: 'b', type: 'info', duration: 60_000 });
    });
    await expect(page.locator('.nf-toast-error')).toHaveAttribute('role', 'alert');
    await expect(page.locator('.nf-toast-info')).not.toHaveAttribute('role');
  });

  test('auto-dismiss pauses while hovered and resumes after', async ({ page }) => {
    await openFixture(page);
    // Pause synchronously after creation so test timing can't race the timer.
    await page.evaluate(() => {
      // @ts-expect-error showToast is defined by the docs snippet
      const el: HTMLElement = showToast({ title: 'HOLD', message: 'x', duration: 400 });
      el.dispatchEvent(new MouseEvent('mouseenter'));
    });
    const toast = page.locator('.nf-toast');
    await page.waitForTimeout(900);
    await expect(toast).toHaveCount(1);
    await toast.dispatchEvent('mouseleave');
    await expect(toast).toHaveCount(0, { timeout: 3000 });
  });

  test('dismiss button removes the toast even with animations disabled', async ({ page }) => {
    await openFixture(page);
    await page.addStyleTag({ content: '.nf-toast { animation: none !important; }' });
    await page.evaluate(() => {
      // @ts-expect-error showToast is defined by the docs snippet
      showToast({ title: 'X', message: 'x', duration: 60_000 });
    });
    await page.locator('.nf-toast-close').click();
    await expect(page.locator('.nf-toast')).toHaveCount(0, { timeout: 3000 });
  });
});

test('error styling follows aria-invalid', async ({ page }) => {
  await openFixture(page);
  await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<input class="nf-input" id="ok"><input class="nf-input" id="bad" aria-invalid="true"><input class="nf-input nf-input-error" id="cls">',
    );
  });
  const errorColor = await page.locator('#cls').evaluate((el) => getComputedStyle(el).borderColor);
  await expect(page.locator('#bad')).toHaveCSS('border-color', errorColor);
  expect(await page.locator('#ok').evaluate((el) => getComputedStyle(el).borderColor)).not.toBe(errorColor);
});

test('indeterminate progress stays visible with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openFixture(page);
  await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div class="nf-progress nf-progress-indeterminate" id="ind" style="width:200px" role="progressbar" aria-label="Loading"><div class="nf-progress-bar"></div></div>',
    );
  });
  await page.waitForTimeout(200);
  const box = await page.locator('#ind .nf-progress-bar').boundingBox();
  const track = await page.locator('#ind').boundingBox();
  expect(box && track && box.x >= track.x && box.x + box.width <= track.x + track.width + 0.5).toBe(true);
});
