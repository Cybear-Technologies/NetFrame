// NetFrame — reviewed first-batch visual fixtures (macOS/current Chromium)
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test } from '@playwright/test';
import { loadFixture, settle } from '../helpers/layout';

const THEMES = ['', 'nf-theme-night-city', 'nf-theme-chiba-city', 'nf-theme-neon-80s', 'nf-theme-renaissance', 'nf-theme-code-rain', 'nf-theme-iron-signal'];

for (const theme of THEMES) {
  test(`first batch palette ${theme || 'default'}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await loadFixture(page, `<main style="width:288px;max-width:100%;padding:4px;display:grid;gap:16px">
      ${['info', 'success', 'warning', 'error'].map((variant) => `<div class="nf-alert nf-alert-${variant}"><span class="nf-alert-icon" aria-hidden="true">!</span><div class="nf-alert-content"><p class="nf-alert-title">${variant.toUpperCase()}</p><p>Persistent message. <a href="#field">Review details</a>.</p></div><button class="nf-alert-close" type="button" aria-label="Dismiss ${variant}">×</button></div>`).join('')}
      <label class="nf-switch"><input class="nf-switch-input" type="checkbox" role="switch" checked><span class="nf-switch-track" aria-hidden="true"></span><span class="nf-switch-label">NOTIFICATIONS_ON</span></label>
      <label class="nf-switch"><input class="nf-switch-input" type="checkbox" role="switch"><span class="nf-switch-track" aria-hidden="true"></span><span class="nf-switch-label">TELEMETRY_OFF</span></label>
      <label class="nf-switch"><input class="nf-switch-input" type="checkbox" role="switch" checked disabled><span class="nf-switch-track" aria-hidden="true"></span><span class="nf-switch-label">MANAGED_DISABLED</span></label>
      <div class="nf-field"><label class="nf-label" for="field">Search</label><div class="nf-input-group"><span class="nf-input-group-addon" aria-hidden="true">&gt;_</span><input class="nf-input" id="field" value="NODE_01"><button class="nf-button nf-button-primary">GO</button></div></div>
      <div class="nf-field"><label class="nf-label" for="kind">Record kind</label><div class="nf-input-group"><select class="nf-select" id="kind"><option>Node</option><option>Archive</option></select><button class="nf-button nf-button-ghost">FIND</button></div></div>
      <div class="nf-field"><label class="nf-label" for="readonly">Assigned node (read only)</label><div class="nf-input-group"><input class="nf-input" id="readonly" value="NODE_01" readonly><span class="nf-input-group-addon">ID</span></div></div>
      <div class="nf-field"><label class="nf-label" for="error">Endpoint</label><div class="nf-input-group nf-input-group-stacked"><span class="nf-input-group-addon">PRIVATE_NETWORK_ENDPOINT_IDENTIFIER</span><input class="nf-input" id="error" value="INVALID" aria-invalid="true" aria-describedby="error-message"><button class="nf-button nf-button-ghost">VALIDATE_AND_SAVE_CONFIGURATION</button></div><p class="nf-helper nf-helper-error" id="error-message">Error: enter a valid endpoint.</p></div>
    </main>`);
    await page.locator('html').evaluate((el, name) => el.setAttribute('class', name), theme);
    await settle(page);
    await page.locator('.nf-switch-input').first().focus();
    await page.keyboard.press('Shift');
    await expect(page.locator('main')).toHaveScreenshot(`first-batch-${theme || 'default'}.png`);
  });
}

for (const component of ['alert', 'switch', 'input-group']) {
  test(`live ${component} demo on a narrow phone`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(`/components/${component}/`);
    await settle(page);
    await expect(page.locator('.demo-preview').first()).toHaveScreenshot(`live-${component}-320.png`);
  });
}
