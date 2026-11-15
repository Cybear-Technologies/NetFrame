// NetFrame — first-batch native components and compositions
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { documentOverflow, isReachable, loadFixture, rect, settle, tabKeys } from './helpers/layout';
import { docsSnippet } from './helpers/snippets';

const TOKEN = 'VERY_LONG_UNBROKEN_IDENTIFIER_ABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789';
const switchMarkup = `<form id="settings"><label class="nf-switch"><input class="nf-switch-input" type="checkbox" role="switch" name="power" value="on" checked /><span class="nf-switch-track" aria-hidden="true"></span><span class="nf-switch-label">POWER_${TOKEN}</span></label><label class="nf-switch"><input class="nf-switch-input" type="checkbox" role="switch" name="locked" checked disabled /><span class="nf-switch-track" aria-hidden="true"></span><span class="nf-switch-label">Locked</span></label><button type="reset">Reset</button></form>`;
const groups = `<form id="groups"><label class="nf-label" for="search">Search</label><div class="nf-input-group"><span class="nf-input-group-addon" aria-hidden="true">&gt;_</span><input class="nf-input" id="search" name="q" value="node" required /><button class="nf-button nf-button-primary" type="submit">Search</button></div><label class="nf-label" for="units">Limit</label><div class="nf-input-group"><input class="nf-input" id="units" name="limit" value="25" aria-describedby="unit" /><span class="nf-input-group-addon" id="unit">MiB</span></div><label class="nf-label" for="kind">Kind</label><div class="nf-input-group"><select class="nf-select" id="kind" name="kind"><option>Node</option><option>Archive</option></select><button class="nf-button" type="submit">Find</button></div><label class="nf-label" for="invalid">Endpoint (required)</label><div class="nf-input-group nf-input-group-stacked"><span class="nf-input-group-addon">${TOKEN}</span><input class="nf-input" id="invalid" name="endpoint" value="INVALID" aria-invalid="true" aria-describedby="err" /><button class="nf-button" type="submit">SAVE_${TOKEN}</button></div><span class="nf-helper nf-helper-error" id="err">Error: enter a valid endpoint.</span><label class="nf-label" for="readonly">Readonly</label><div class="nf-input-group"><input class="nf-input" id="readonly" name="readonly" value="locked" readonly /><span class="nf-input-group-addon">ID</span></div><label class="nf-label" for="disabled">Disabled</label><div class="nf-input-group"><input class="nf-input" id="disabled" name="disabled" value="managed" disabled /><button class="nf-button" type="reset">Reset</button></div></form>`;
const THEMES = ['', 'nf-theme-night-city', 'nf-theme-chiba-city', 'nf-theme-renaissance', 'nf-theme-neon-80s', 'nf-theme-code-rain', 'nf-theme-iron-signal'];
const alerts = ['info', 'success', 'warning', 'error'].map((variant) => `<div class="nf-alert nf-alert-${variant}"><span class="nf-alert-icon" aria-hidden="true">!</span><div class="nf-alert-content"><p class="nf-alert-title">${variant.toUpperCase()}</p><p>Review <a href="#target">connection details</a> before continuing. ${TOKEN} <a href="#target">https://example.test/${TOKEN}</a></p><div class="nf-alert-actions"><button class="nf-button">RETRY_${TOKEN}</button><a class="nf-button nf-button-ghost" href="#target">REVIEW_DETAILS</a></div></div><button class="nf-alert-close" aria-label="Dismiss ${variant}" type="button">×</button></div>`).join('');

for (const width of [320, 1440]) {
  test(`alerts wrap inside a 280px column at viewport ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await loadFixture(page, `<main><h1>Messages</h1><div style="width:280px;max-width:100%">${alerts}</div><p id="target">Destination</p></main>`);
    for (const alert of await page.locator('.nf-alert').all()) {
      const box = await rect(alert);
      expect(box.width).toBeLessThanOrEqual(280);
      for (const item of await alert.locator('p, a, button').all()) {
        const child = await rect(item);
        expect(child.x).toBeGreaterThanOrEqual(box.x);
        expect(child.right).toBeLessThanOrEqual(box.right);
      }
      await alert.locator('.nf-alert-close').scrollIntoViewIfNeeded();
      expect(await isReachable(alert.locator('.nf-alert-close'))).toBe(true);
    }
    expect(await documentOverflow(page)).toBe(0);
  });
}

for (const theme of THEMES) {
  test(`alert, switch and input-group rendered states pass axe in ${theme || 'default'}`, async ({ page }) => {
    await loadFixture(page, `<main><h1>Messages</h1>${alerts}<p id="target">Destination</p>${switchMarkup}${groups}</main>`);
    await page.locator('html').evaluate((el, name) => { el.setAttribute('class', name); }, theme);
    await settle(page);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
    // Borders convey category decoratively; the text conveys its meaning.
    for (const variant of ['info', 'success', 'warning', 'error']) {
      expect(await page.locator(`.nf-alert-${variant}`).getAttribute('role')).toBeNull();
    }
  });
}

test('alert live controller: keyboard dismissal, focus preservation, error navigation, polite update', async ({ page }) => {
  await page.goto('/components/alert/');
  const close = page.getByRole('button', { name: 'Dismiss maintenance notice' });
  await close.focus();
  await close.press('Enter');
  await expect(page.locator('[data-alert]')).toHaveCount(0);
  await expect(page.locator('[data-alert-return]')).toBeFocused();
  await page.getByRole('link', { name: 'Upload name: enter a name before saving.' }).click();
  await expect(page.locator('#upload-name')).toBeFocused();
  const update = page.getByRole('button', { name: 'Check connection' });
  await update.focus();
  await update.press('Enter');
  await expect(page.locator('[data-feedback-message]')).toHaveText('Connection ready. Your files are up to date.');
  await expect(update).toBeFocused();
});

test('switch retains native pointer, Space, disabled, reset and submission behavior', async ({ page, isMobile }) => {
  await page.goto('/components/switch/');
  const control = page.getByRole('switch', { name: 'NOTIFICATIONS', exact: true });
  const label = page.locator('label.nf-switch').first();
  if (isMobile) await label.tap(); else await label.click();
  await expect(control).not.toBeChecked();
  await control.focus();
  await control.press('Space');
  await expect(control).toBeChecked();
  await expect(control).not.toHaveAttribute('aria-checked');
  await page.getByRole('switch', { name: 'OPTIONAL_TELEMETRY' }).focus();
  await page.getByRole('switch', { name: 'OPTIONAL_TELEMETRY' }).press('Space');
  await expect(page.getByRole('switch', { name: 'OPTIONAL_TELEMETRY' })).toBeChecked();
  const disabled = page.getByRole('switch', { name: 'MANAGED_BY_ADMINISTRATOR' });
  const disabledBox = await rect(page.locator('label.nf-switch').last());
  await page.mouse.click(disabledBox.x + 8, disabledBox.y + disabledBox.height / 2);
  await expect(disabled).toBeChecked();
  await expect(disabled).toBeDisabled();
  await page.getByRole('button', { name: 'Reset settings' }).click();
  await expect(control).toBeChecked();
  await expect(page.getByRole('switch', { name: 'OPTIONAL_TELEMETRY' })).not.toBeChecked();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page).toHaveURL((url) => url.pathname === '/components/switch/' && url.search === '?notifications=enabled');
});

test('switch focus, long labels, reduced motion and native form data', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loadFixture(page, `<main><h1>Settings</h1><div style="width:280px">${switchMarkup}</div></main>`);
  const control = page.getByRole('switch').first();
  await page.keyboard.press(tabKeys(browserName).tab);
  await expect(control).toBeFocused();
  const track = page.locator('.nf-switch-track').first();
  await expect(track).toHaveCSS('outline-style', 'solid');
  expect(await track.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
  expect((await rect(track)).width).toBe(48);
  expect(await documentOverflow(page)).toBe(0);
  const label = await rect(page.locator('.nf-switch-label').first());
  expect(label.right).toBeLessThanOrEqual(292);
  expect(await page.locator('#settings').evaluate((el: HTMLFormElement) => [...new FormData(el).entries()])).toEqual([['power', 'on']]);
  await control.press('Space');
  expect(await page.locator('#settings').evaluate((el: HTMLFormElement) => [...new FormData(el).entries()])).toEqual([]);
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(control).toBeChecked();
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.getByRole('button', { name: 'Reset', exact: true }).focus();
  await page.keyboard.press(tabKeys(browserName).shiftTab);
  await expect(control).toBeFocused();
  await control.press('Space');
  await expect(control).not.toBeChecked();
  await expect(track).toHaveCSS('outline-style', 'solid');
  expect(await track.evaluate((el) => getComputedStyle(el, '::before').transitionProperty)).toBe('none');
  const off = await track.evaluate((el) => getComputedStyle(el, '::before').transform);
  await control.press('Space');
  expect(await track.evaluate((el) => getComputedStyle(el, '::before').transform)).not.toBe(off);
  expect(await track.evaluate((el) => getComputedStyle(el, '::before').backgroundColor)).not.toBe(await track.evaluate((el) => getComputedStyle(el).backgroundColor));
});

test('native switch and static alert work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: test.info().project.use.baseURL! });
  const page = await context.newPage();
  await page.goto('/components/switch/');
  const control = page.getByRole('switch', { name: 'NOTIFICATIONS', exact: true });
  await page.locator('label.nf-switch').first().click();
  await expect(control).not.toBeChecked();
  await control.press('Space');
  await expect(control).toBeChecked();
  await page.goto('/components/alert/');
  await expect(page.locator('[data-alert]')).toBeVisible();
  await expect(page.locator('[data-alert-close]')).toBeHidden();
  await context.close();
});

for (const width of [320, 1440]) {
  test(`input groups stay within a 280px column at viewport ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await loadFixture(page, `<main><h1>Form</h1><div style="width:280px;max-width:100%">${groups}</div></main>`);
    for (const group of await page.locator('.nf-input-group').all()) {
      const box = await rect(group);
      expect(box.width).toBeLessThanOrEqual(280);
      let previous: Awaited<ReturnType<typeof rect>> | undefined;
      const stacked = await group.evaluate((el) => el.classList.contains('nf-input-group-stacked'));
      for (const child of await group.locator(':scope > *').all()) {
        const b = await rect(child);
        expect(b.x).toBeGreaterThanOrEqual(box.x - 1);
        expect(b.right).toBeLessThanOrEqual(box.right + 1);
        expect(b.bottom).toBeLessThanOrEqual(box.bottom + 1);
        if (previous) expect(stacked ? previous.bottom - b.y : previous.right - b.x, 'exactly one shared 2px border').toBeCloseTo(2, 0);
        previous = b;
        if (await child.evaluate((el) => el.matches('button, span'))) {
          expect(await child.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
        }
      }
    }
    expect(await documentOverflow(page)).toBe(0);
  });
}

test('input-group native form validation, reset, readonly, disabled and separate focus indicators', async ({ page, browserName }) => {
  await loadFixture(page, `<main><h1>Form</h1><div style="width:280px">${groups}</div><label for="standalone">Standalone</label><input id="standalone" class="nf-input" value="unchanged" /><button class="nf-button" id="standalone-button">Standalone action</button></main>`);
  await page.keyboard.press(tabKeys(browserName).tab);
  await expect(page.locator('#search')).toBeFocused();
  await expect(page.locator('#search')).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press(tabKeys(browserName).tab);
  const action = page.getByRole('button', { name: 'Search', exact: true });
  await expect(action).toBeFocused();
  await expect(action).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('#search')).toHaveCSS('outline-style', 'none');
  await page.locator('#readonly').focus();
  await page.keyboard.type('MUTATION');
  await expect(page.locator('#readonly')).toHaveValue('locked');
  await expect(page.locator('#disabled')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Reset', exact: true })).toBeEnabled();
  const formData = () => page.locator('#groups').evaluate((el: HTMLFormElement) => Object.fromEntries(new FormData(el)));
  expect(await formData()).toEqual({ q: 'node', limit: '25', kind: 'Node', endpoint: 'INVALID', readonly: 'locked' });
  await page.locator('#groups').evaluate((el: HTMLFormElement) => {
    el.addEventListener('submit', (event) => {
      event.preventDefault();
      el.dataset['submitted'] = 'true';
    });
  });
  await page.locator('#search').fill('');
  await action.click();
  await expect(page.locator('#groups')).not.toHaveAttribute('data-submitted');
  expect(await page.locator('#groups').evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(false);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('#search')).toHaveValue('node');
  expect(await page.locator('#groups').evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(true);
  await action.click();
  await expect(page.locator('#groups')).toHaveAttribute('data-submitted', 'true');
  expect(await page.locator('#kind').evaluate((el) => getComputedStyle(el).appearance)).toBe('auto');
  // Structural group rules must not leak into standalone controls.
  expect(await page.locator('#standalone').evaluate((el) => getComputedStyle(el).padding)).toBe(await page.locator('#search').evaluate((el) => getComputedStyle(el).padding));
  await page.locator('#standalone').focus();
  await page.keyboard.press('Shift');
  await expect(page.locator('#standalone')).toHaveCSS('outline-style', 'solid');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('#standalone')).toHaveCSS('outline-style', 'solid');
  await page.goto('/components/input-group/');
  await page.locator('#site-search').fill('neon nodes');
  await page.getByRole('search').getByRole('button', { name: 'Go: search records', exact: true }).click();
  await expect(page).toHaveURL((url) => url.pathname === '/components/input-group/' && url.search === '?q=neon+nodes');
});

test('single selects keep text-control height while listbox size remains native', async ({ page }) => {
  await loadFixture(page, '<main><h1>Select sizing</h1><label for="single">Single</label><select class="nf-select" id="single"><option>Node</option></select><label for="listbox">Multiple</label><select class="nf-select" id="listbox" multiple size="4"><option>One</option><option>Two</option><option>Three</option><option>Four</option></select></main>');
  expect((await rect(page.locator('#single'))).height).toBeGreaterThanOrEqual(44);
  expect((await rect(page.locator('#listbox'))).height).toBeGreaterThan((await rect(page.locator('#single'))).height);
});

test('new touch controls meet 44px targets and forms reflow with larger text', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await loadFixture(page, `<main><h1>Settings</h1>${alerts}<p id="target">Destination</p>${switchMarkup}${groups}</main>`);
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  for (const item of await page.locator('.nf-alert-close, .nf-switch').all()) {
    expect((await rect(item)).height).toBeGreaterThanOrEqual(coarse ? 44 : 32);
  }
  await page.addStyleTag({ content: 'html{font-size:200%} *{letter-spacing:.12em!important;word-spacing:.16em!important}' });
  expect(await documentOverflow(page)).toBe(0);
  for (const item of await page.locator('.nf-switch-label, .nf-input-group-addon, .nf-input-group button').all()) {
    expect(await item.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test('alert optional controller scopes instances and does not steal outside focus', async ({ page }) => {
  const instance = (name: string) => `<section data-alert-demo><div class="nf-alert" data-alert><div class="nf-alert-content"><p>${name}</p></div><button class="nf-alert-close" data-alert-close type="button" aria-label="Dismiss ${name}" hidden>×</button></div><button data-alert-return>${name} next</button></section>`;
  await loadFixture(page, `<button id="outside">Outside</button>${instance('one')}${instance('two')}<script>${docsSnippet('alert')}</script>`);
  await page.locator('#outside').focus();
  await page.getByRole('button', { name: 'Dismiss one' }).evaluate((el: HTMLButtonElement) => el.click());
  await expect(page.locator('#outside')).toBeFocused();
  await expect(page.locator('[data-alert]')).toHaveCount(1);
  const close = page.getByRole('button', { name: 'Dismiss two' });
  await close.evaluate((el) => el.setAttribute('aria-disabled', 'true'));
  await close.evaluate((el: HTMLButtonElement) => el.click());
  await expect(page.locator('[data-alert]')).toHaveCount(1);
  await close.evaluate((el) => el.removeAttribute('aria-disabled'));
  await close.focus();
  await close.press('Space');
  await expect(page.getByRole('button', { name: 'two next' })).toBeFocused();
});
