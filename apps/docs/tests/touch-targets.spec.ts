// NetFrame Docs — touch target sizes for primary mobile controls
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Library components grow to about 44x44 CSS px under `pointer: coarse` only;
// mouse layouts are unchanged. Emulation: viewport + touch + pointer: coarse.

import { expect, test } from '@playwright/test';
import { loadFixture, rect } from './helpers/layout';

const MIN = 43.5;

const html = `<div class="col">
  <button class="nf-button" id="btn">DEFAULT</button> <button class="nf-button nf-button-sm" id="btn-sm">SMALL</button>
  <button class="nf-button nf-button-icon" id="btn-icon" aria-label="Settings">+</button>
  <div class="nf-field"><label class="nf-label" for="in">Name</label><input class="nf-input" id="in"></div>
  <div class="nf-field"><label class="nf-label" for="se">Pick</label><select class="nf-select" id="se"><option>One</option></select></div>
  <label class="nf-checkbox" id="chk"><input type="checkbox"><span>Remember me</span></label>
  <label class="nf-radio" id="rad"><input type="radio" name="r"><span>Option</span></label>
  <input type="range" class="nf-range" id="rng" aria-label="Level">
  <div class="nf-tab-list" role="tablist"><button class="nf-tab" role="tab" aria-selected="true" id="tab">TAB</button></div>
  <nav><ol class="nf-pagination"><li class="nf-page-item"><a class="nf-page-link" href="#" id="page">1</a></li></ol></nav>
  <div class="nf-accordion"><div class="nf-accordion-item"><button class="nf-accordion-trigger" aria-expanded="false" id="acc">SECTION<span class="nf-accordion-icon"></span></button></div></div>
  <nav><ol class="nf-breadcrumb"><li class="nf-breadcrumb-item"><a class="nf-breadcrumb-link" href="#" id="crumb">HOME</a></li></ol></nav>
  <div class="nf-dropdown"><button class="nf-button nf-dropdown-trigger" aria-expanded="true">MENU</button><ul class="nf-dropdown-menu" role="menu"><li role="none"><button class="nf-dropdown-item" role="menuitem" id="item">ITEM</button></li></ul></div>
  <div style="height:120px"></div>
</div>
<div class="nf-modal-overlay" aria-hidden="true" style="display:none"><div class="nf-modal"><div class="nf-modal-header"><button class="nf-modal-close" id="mclose" aria-label="Close">x</button></div></div></div>
<div class="nf-toast-region nf-toast-bottom-right"><div class="nf-toast"><div class="nf-toast-content"><div class="nf-toast-message">Saved</div></div><button class="nf-toast-close" id="tclose" aria-label="Dismiss">x</button></div></div>`;

// [selector, needs full width too (icon-only controls) or height only]
const TARGETS: [string, 'both' | 'height'][] = [
  ['#btn', 'height'], ['#btn-sm', 'height'], ['#btn-icon', 'both'], ['#in', 'height'], ['#se', 'height'],
  ['#chk', 'height'], ['#rad', 'height'], ['#rng', 'height'], ['#tab', 'height'], ['#page', 'both'],
  ['#acc', 'height'], ['#crumb', 'height'], ['#item', 'height'], ['#tclose', 'both'],
];

test.describe('coarse pointer (phone emulation)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('primary controls are about 44 CSS px', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox does not emulate mobile/touch contexts');
    await loadFixture(page, html);
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches), 'emulation reports a coarse pointer').toBe(true);
    const small: string[] = [];
    for (const [selector, mode] of TARGETS) {
      const r = await rect(page.locator(selector));
      if (r.height < MIN) small.push(`${selector} height ${r.height.toFixed(1)}`);
      if (mode === 'both' && r.width < MIN) small.push(`${selector} width ${r.width.toFixed(1)}`);
    }
    expect(small).toEqual([]);
  });

  test('modal close is 44px when the dialog is shown', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox does not emulate mobile/touch contexts');
    await loadFixture(page, html);
    await page.evaluate(() => {
      const overlay = document.querySelector<HTMLElement>('.nf-modal-overlay')!;
      overlay.removeAttribute('aria-hidden');
      overlay.style.display = '';
    });
    const r = await rect(page.locator('#mclose'));
    expect(r.width).toBeGreaterThanOrEqual(MIN);
    expect(r.height).toBeGreaterThanOrEqual(MIN);
  });

  test('adjacent small targets keep a gap so taps do not hit the neighbour', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox does not emulate mobile/touch contexts');
    await loadFixture(page, `<div class="col"><ol class="nf-pagination">${[1, 2, 3, 4].map((n) => `<li class="nf-page-item"><a class="nf-page-link" href="#">${n}</a></li>`).join('')}</ol></div>`);
    const links = await page.locator('.nf-page-link').all();
    for (let i = 1; i < links.length; i++) {
      const a = await rect(links[i - 1]!);
      const b = await rect(links[i]!);
      expect(b.x - a.right, 'gap between neighbouring page links').toBeGreaterThanOrEqual(0);
    }
  });
});
