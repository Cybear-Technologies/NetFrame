// NetFrame Docs — library components inside narrow containers and small screens
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Fixtures use the published netframe.css only, with no docs shell. A component
// must stay usable inside a narrow card or column even on a wide desktop
// viewport, and on phones in portrait and short landscape.

import { expect, test, type Page } from '@playwright/test';
import { documentOverflow, finishAnimations, isReachable, loadFixture, rect, reachableAfterScroll, tabKeys } from './helpers/layout';
import { docsSnippet } from './helpers/snippets';

const WORDS = 'A long sentence of ordinary words that has to wrap inside a narrow container.';
const TOKEN = 'SUPERCALIFRAGILISTIC_NODE_IDENTIFIER_0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LONG = `${TOKEN} ${WORDS}`;

/** Elements wider than their column, measured against the container (clipping included). */
async function escapesColumn(page: Page, selector: string): Promise<string[]> {
  return page.evaluate((sel) => {
    const col = document.querySelector(sel)!;
    const box = col.getBoundingClientRect();
    const bad: string[] = [];
    for (const el of col.querySelectorAll('*')) {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      let scrolls = false;
      for (let a = el.parentElement; a && a !== col; a = a.parentElement) {
        if (['auto', 'scroll'].includes(getComputedStyle(a).overflowX) && a.scrollWidth > a.clientWidth) scrolls = true;
      }
      if (scrolls) continue; // intentional local scrolling (tab list, table wrapper)
      const r = el.getBoundingClientRect();
      // Text that spills out of its own box is invisible to a bounding-box check when an
      // ancestor (e.g. a card) clips it, so also compare content width to box width.
      const ox = style.overflowX;
      if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1 && ox !== 'auto' && ox !== 'scroll' && !el.matches('input, textarea, select')) {
        bad.push(`${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).split(' ')[0]} content ${el.scrollWidth}px in a ${el.clientWidth}px box`);
      }
      if (r.width && (r.right > box.right + 1 || r.left < box.left - 1)) bad.push(`${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).split(' ')[0]} ${Math.round(r.left - box.left)}..${Math.round(r.right - box.left)} of ${Math.round(box.width)}`);
    }
    return bad;
  }, selector);
}

const column = (id: string, inner: string) => `<div class="col" id="${id}">${inner}</div>`;

const FIXTURES: Record<string, string> = {
  card: column('card', `<div class="nf-card"><div class="nf-card-header"><span class="nf-card-title">${LONG}</span></div><div class="nf-card-body">${LONG}</div>
    <div class="nf-card-footer"><button class="nf-button nf-button-ghost">CANCEL_OPERATION</button><button class="nf-button nf-button-primary">CONFIRM_AND_CONTINUE</button><button class="nf-button nf-button-danger">DELETE_EVERYTHING</button></div></div>`),
  forms: column('forms', `<div class="nf-field"><label class="nf-label" for="a">${LONG}</label><input id="a" class="nf-input" value="${LONG}"><span class="nf-helper">${LONG}</span></div>
    <div class="nf-field"><label class="nf-label" for="s">Select</label><select id="s" class="nf-select"><option>${LONG}</option></select></div>
    <div class="nf-field"><label class="nf-label" for="t">Notes</label><textarea id="t" class="nf-textarea">${LONG}</textarea></div>
    <label class="nf-checkbox"><input type="checkbox"><span>${LONG}</span></label><label class="nf-radio"><input type="radio" name="r"><span>${LONG}</span></label><input type="range" class="nf-range" aria-label="Level">`),
  labels: column('labels', `<span class="nf-tag">${LONG}</span> <span class="nf-badge nf-badge-primary">${LONG}</span>`),
  accordion: column('accordion', `<div class="nf-accordion"><div class="nf-accordion-item"><button class="nf-accordion-trigger" aria-expanded="true">${LONG}<span class="nf-accordion-icon"></span></button><div class="nf-accordion-content"><div class="nf-accordion-body">${LONG}</div></div></div></div>`),
  breadcrumb: column('breadcrumb', `<nav aria-label="Breadcrumb"><ol class="nf-breadcrumb"><li class="nf-breadcrumb-item"><a class="nf-breadcrumb-link" href="#">ROOT_DIRECTORY</a></li><li class="nf-breadcrumb-item"><a class="nf-breadcrumb-link" href="#">COMPONENTS_LIBRARY</a></li><li class="nf-breadcrumb-item"><a class="nf-breadcrumb-link" href="#">${TOKEN}</a></li><li class="nf-breadcrumb-item" aria-current="page"><span class="nf-breadcrumb-link nf-breadcrumb-current">NODE_047_DETAIL_VIEW</span></li></ol></nav>`),
  pagination: column('pagination', `<nav aria-label="Pagination"><ol class="nf-pagination"><li class="nf-page-item"><a class="nf-page-link nf-page-prev" href="#">PREV</a></li>${[1, 2, 3, 4, 5].map((n) => `<li class="nf-page-item"><a class="nf-page-link" href="#">${n}</a></li>`).join('')}<li class="nf-page-item"><a class="nf-page-link nf-page-next" href="#">NEXT</a></li></ol></nav>`),
  tabs: column('tabs', `<div class="nf-tabs"><div class="nf-tab-list" role="tablist" aria-label="Many tabs">${['OVERVIEW', 'NETWORK_TOPOLOGY', 'SECURITY_AUDIT_LOGS', 'ARCHIVE_STORAGE', 'SETTINGS'].map((t, i) => `<button class="nf-tab" role="tab" aria-selected="${i === 0}">${t}</button>`).join('')}</div></div>`),
  dropdown: column('dropdown', `<div class="nf-dropdown"><button class="nf-button nf-dropdown-trigger" aria-expanded="true">${LONG}</button><ul class="nf-dropdown-menu" role="menu"><li role="none"><button class="nf-dropdown-item" role="menuitem">${LONG}</button></li></ul></div><div style="height:260px"></div>`),
  table: column('table', `<div class="nf-table-wrap"><table class="nf-table"><thead><tr><th>NODE_IDENTIFIER</th><th>STATUS</th><th>LATENCY</th><th>UPTIME</th><th>REGION</th></tr></thead><tbody><tr><td>NODE_001</td><td><span class="nf-badge nf-badge-primary">ONLINE</span></td><td>12ms</td><td>99.9%</td><td><span class="nf-tag">EU-WEST</span></td></tr></tbody></table></div>`),
  avatars: column('avatars', `<div class="nf-avatar-group">${'<div class="nf-avatar"><span class="nf-avatar-initials">AB</span></div>'.repeat(6)}</div>`),
};

test.describe('narrow container on a wide desktop (280px column in a 1440px window)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const [name, html] of Object.entries(FIXTURES)) {
    test(`${name} stays inside its column`, async ({ page }) => {
      await loadFixture(page, html);
      expect(await escapesColumn(page, '.col')).toEqual([]);
    });
  }

  test('card footer buttons wrap onto extra rows instead of overflowing, each fully inside the card', async ({ page }) => {
    await loadFixture(page, FIXTURES['card']!);
    const card = await rect(page.locator('.nf-card'));
    const buttons = page.locator('.nf-card-footer .nf-button');
    const rows = new Set<number>();
    for (const b of await buttons.all()) {
      const r = await rect(b);
      rows.add(Math.round(r.y));
      expect(r.x).toBeGreaterThanOrEqual(card.x - 1);
      expect(r.right).toBeLessThanOrEqual(card.right + 1);
    }
    expect(rows.size).toBeGreaterThan(1);
  });

  test('card title breaks an unbroken identifier rather than pushing the header wider', async ({ page }) => {
    await loadFixture(page, FIXTURES['card']!);
    const title = await rect(page.locator('.nf-card-title'));
    const card = await rect(page.locator('.nf-card'));
    expect(title.right).toBeLessThanOrEqual(card.right);
  });

  test('tab list scrolls in place; the page and the column do not grow', async ({ page }) => {
    await loadFixture(page, FIXTURES['tabs']!);
    const list = page.locator('.nf-tab-list');
    expect(await list.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
    expect((await rect(list)).width).toBeLessThanOrEqual(281);
  });

  test('table keeps real table semantics and scrolls in its own wrapper', async ({ page }) => {
    await loadFixture(page, FIXTURES['table']!);
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader')).toHaveCount(5);
    const wrap = page.locator('.nf-table-wrap');
    expect(await wrap.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
  });

  test('short status labels in table cells stay on one line; the table scrolls instead of splitting words', async ({ page }) => {
    await loadFixture(page, FIXTURES['table']!);
    for (const label of await page.locator('.nf-table .nf-badge, .nf-table .nf-tag').all()) {
      expect((await rect(label)).height, 'label is a single line').toBeLessThan(40);
    }
  });

  test('desktop control sizes are unchanged: the 44px targets apply only to coarse pointers', async ({ page }) => {
    await loadFixture(page, FIXTURES['pagination']!);
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(false);
    expect((await rect(page.locator('.nf-page-link').first())).height).toBeCloseTo(40, 0);
  });
});

test.describe('modal and drawer on small screens', () => {
  const modal = `<main><p>page</p></main><div class="nf-modal-overlay" id="ov"><div class="nf-modal" role="dialog" aria-modal="true" aria-labelledby="mt" tabindex="-1">
    <div class="nf-modal-header"><h2 class="nf-modal-title" id="mt">Confirm the operation ${TOKEN}</h2><button class="nf-modal-close" aria-label="Close">x</button></div>
    <div class="nf-modal-body">${Array.from({ length: 16 }, (_, i) => `<p>Paragraph ${i + 1}. ${WORDS}</p>`).join('')}</div>
    <div class="nf-modal-footer"><button class="nf-button nf-button-ghost">CANCEL_THE_OPERATION</button><button class="nf-button nf-button-primary">CONFIRM_AND_CONTINUE_NOW</button><button class="nf-button nf-button-danger">DELETE_PERMANENTLY</button></div></div></div>`;
  const drawer = `<div class="nf-drawer-overlay"></div><div class="nf-drawer nf-drawer-right nf-drawer-xl nf-open" role="dialog" aria-modal="true" aria-label="Details">
    <div class="nf-drawer-header"><h2 class="nf-drawer-title">Details ${TOKEN}</h2><button class="nf-button nf-button-ghost nf-button-icon" aria-label="Close">x</button></div>
    <div class="nf-drawer-body">${Array.from({ length: 16 }, (_, i) => `<p>Paragraph ${i + 1}. ${WORDS}</p>`).join('')}</div>
    <div class="nf-drawer-footer"><button class="nf-button">CANCEL_THE_OPERATION</button><button class="nf-button nf-button-primary">CONFIRM_AND_CONTINUE_NOW</button></div></div>`;

  for (const [width, height, label] of [[320, 568, 'small portrait phone'], [667, 320, 'short landscape phone']] as const) {
    test.describe(`${label} (${width}x${height})`, () => {
      test.use({ viewport: { width, height } });

      test('modal: stays inside the viewport, close control reachable, body scrolls, footer actions reachable', async ({ page }) => {
        await loadFixture(page, modal);
        const dialog = page.locator('.nf-modal');
        const box = await rect(dialog);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(width);
        expect(box.bottom).toBeLessThanOrEqual(height);
        expect(box.y).toBeGreaterThanOrEqual(0);
        await expect.poll(() => isReachable(page.locator('.nf-modal-close'))).toBe(true);
        // Content longer than the screen scrolls somewhere inside the dialog.
        const scrollable = await page.evaluate(() => [...document.querySelectorAll('.nf-modal, .nf-modal-body')].some((el) => el.scrollHeight > el.clientHeight));
        expect(scrollable).toBe(true);
        // Every footer action can be reached by scrolling the dialog, and receives pointers.
        for (const b of await page.locator('.nf-modal-footer .nf-button').all()) expect(await reachableAfterScroll(b)).toBe(true);
        expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
        // The close control is still reachable after scrolling to the end.
        await page.locator('.nf-modal-footer .nf-button').last().scrollIntoViewIfNeeded();
        expect(await isReachable(page.locator('.nf-modal-close'))).toBe(true);
      });

      test('drawer: stays inside the viewport, close control and footer actions reachable', async ({ page }) => {
        await loadFixture(page, drawer);
        const panel = page.locator('.nf-drawer');
        await finishAnimations(panel);
        const box = await rect(panel);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(width);
        expect(box.width).toBeLessThanOrEqual(width * 0.9 + 1);
        expect(await isReachable(page.locator('.nf-drawer-header .nf-button'))).toBe(true);
        for (const b of await page.locator('.nf-drawer-footer .nf-button').all()) expect(await isReachable(b), 'footer action fully visible').toBe(true);
        expect(await page.locator('.nf-drawer-body').evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
      });
    });
  }
});

test.describe('toast width and position', () => {
  const toast = `<div class="nf-toast-region nf-toast-top-right" aria-live="polite">
    <div class="nf-toast nf-toast-success"><div class="nf-toast-content"><div class="nf-toast-title">UPLOAD_COMPLETE</div><div class="nf-toast-message">${LONG} ${LONG}</div></div><button class="nf-toast-close" aria-label="Dismiss">x</button></div>
    <div class="nf-toast nf-toast-error"><div class="nf-toast-content"><div class="nf-toast-message">${TOKEN}${TOKEN}</div></div><button class="nf-toast-close" aria-label="Dismiss">x</button></div></div>`;

  for (const width of [280, 320, 390, 1440]) {
    test(`stays on screen with long messages at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await loadFixture(page, toast);
      for (const t of await page.locator('.nf-toast').all()) {
        await finishAnimations(t);
        const r = await rect(t);
        expect(r.x, 'left edge').toBeGreaterThanOrEqual(0);
        expect(r.right, 'right edge').toBeLessThanOrEqual(width);
        expect(r.width).toBeLessThanOrEqual(24 * 16 + 1);
        expect(await isReachable(t.locator('.nf-toast-close'))).toBe(true);
      }
      expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('dropdown near viewport edges (documented controller)', () => {
  const menu = (cls = '') => `<div class="nf-dropdown"><button class="nf-button nf-button-ghost nf-dropdown-trigger" aria-expanded="false" aria-haspopup="menu">ACTIONS</button>
    <ul class="nf-dropdown-menu ${cls}" role="menu" aria-hidden="true"><li role="none"><button class="nf-dropdown-item" role="menuitem">SCAN_NODE_FOR_ANOMALIES</button></li><li role="none"><button class="nf-dropdown-item" role="menuitem">${LONG}</button></li></ul></div>`;
  const script = `<script>${docsSnippet('dropdown')}</script>`;

  test.use({ viewport: { width: 320, height: 568 } });

  test('a trigger at the right edge flips the menu so it stays on screen', async ({ page }) => {
    await loadFixture(page, `<div style="display:flex;justify-content:flex-end">${menu()}</div><div style="height:300px"></div>${script}`);
    await page.locator('.nf-dropdown-trigger').click();
    const m = page.locator('.nf-dropdown-menu');
    await expect(m).toBeVisible();
    const r = await rect(m);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeLessThanOrEqual(320);
    await expect(m).toHaveClass(/nf-dropdown-menu-right/);
    expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
  });

  test('a trigger at the left edge keeps the default placement; menu items wrap within the screen', async ({ page }) => {
    await loadFixture(page, `${menu()}<div style="height:300px"></div>${script}`);
    await page.locator('.nf-dropdown-trigger').click();
    const m = page.locator('.nf-dropdown-menu');
    const r = await rect(m);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeLessThanOrEqual(320);
    await expect(m).not.toHaveClass(/nf-dropdown-menu-right/);
    for (const item of await page.locator('.nf-dropdown-item').all()) expect(await isReachable(item)).toBe(true);
  });

  test('an authored right-aligned menu flips back when it would leave the left edge', async ({ page }) => {
    await loadFixture(page, `${menu('nf-dropdown-menu-right')}<div style="height:300px"></div>${script}`);
    await page.locator('.nf-dropdown-trigger').click();
    const r = await rect(page.locator('.nf-dropdown-menu'));
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeLessThanOrEqual(320);
  });
});

test.describe('tabs with many labels (documented controller)', () => {
  const tabs = ['OVERVIEW', 'NETWORK_TOPOLOGY', 'SECURITY_AUDIT_LOGS', 'ARCHIVE_STORAGE', 'DEPLOYMENT_HISTORY', 'SETTINGS'];
  const markup = (selected: number) => `<div class="nf-tabs"><div class="nf-tab-list" role="tablist" aria-label="Sections">${tabs.map((t, i) => `<button class="nf-tab" role="tab" id="t${i}" aria-controls="p${i}" aria-selected="${i === selected}">${t}</button>`).join('')}</div>${tabs.map((t, i) => `<div class="nf-tab-panel" role="tabpanel" id="p${i}" aria-labelledby="t${i}"${i === selected ? '' : ' hidden'}>${t} content</div>`).join('')}</div><script>${docsSnippet('tabs')}</script>`;
  test.use({ viewport: { width: 320, height: 568 } });

  test('keyboard selection keeps the selected tab visible inside the scrolling list', async ({ page, browserName }) => {
    await loadFixture(page, markup(0));
    const list = page.locator('.nf-tab-list');
    expect(await list.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    await page.locator('#t0').focus();
    await page.locator('#t0').press('End');
    const last = page.locator(`#t${tabs.length - 1}`);
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await expect.poll(async () => {
      const t = await rect(last);
      const l = await rect(list);
      return t.x >= l.x - 1 && t.right <= l.right + 1;
    }).toBe(true);
    void browserName;
    expect(await documentOverflow(page)).toBeLessThanOrEqual(0);
    await expect(page.locator(`#p${tabs.length - 1}`)).toBeVisible();
  });

  test('a selected tab that starts off-screen is scrolled into view on load, without scrolling the page', async ({ page }) => {
    await loadFixture(page, `<div style="height:200px">spacer</div>${markup(tabs.length - 1)}`);
    const t = await rect(page.locator(`#t${tabs.length - 1}`));
    const l = await rect(page.locator('.nf-tab-list'));
    expect(t.x).toBeGreaterThanOrEqual(l.x - 1);
    expect(t.right).toBeLessThanOrEqual(l.right + 1);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });
});

test.describe('tooltip', () => {
  const tip = (cls = '') => `<span class="nf-tooltip-wrap"><button class="nf-button" id="tip-btn">HELP</button><span class="nf-tooltip ${cls}" role="tooltip">${LONG}</span></span>`;
  test.use({ viewport: { width: 390, height: 700 } });

  test('long tooltip text wraps at a readable width and never exceeds the screen; keyboard focus shows it', async ({ page, browserName }) => {
    await loadFixture(page, `<div style="padding-top:140px;display:flex;justify-content:center">${tip()}</div>`);
    const tooltip = page.locator('.nf-tooltip');
    await expect(tooltip).toHaveCSS('opacity', '0');
    const { tab } = tabKeys(browserName);
    await page.keyboard.press(tab);
    await expect(page.locator('#tip-btn')).toBeFocused();
    await expect(tooltip).toHaveCSS('opacity', '1');
    await finishAnimations(tooltip);
    const r = await rect(tooltip);
    expect(r.width).toBeLessThanOrEqual(18 * 16 + 1);
    expect(r.width).toBeLessThanOrEqual(390 - 32);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeLessThanOrEqual(390);
  });

  test('a tooltip on a non-focusable element is not reachable by touch or keyboard: the trigger must be focusable', async ({ page }) => {
    // Documents the CSS-only limit: hover/focus-within only. Plain text with no tabindex never shows it.
    await loadFixture(page, `<span class="nf-tooltip-wrap" id="plain">plain text<span class="nf-tooltip" role="tooltip">Hint</span></span>`);
    await expect(page.locator('.nf-tooltip')).toHaveCSS('opacity', '0');
    await page.locator('#plain').dispatchEvent('focus');
    await expect(page.locator('.nf-tooltip')).toHaveCSS('opacity', '0');
  });
});

test.describe('focus indicators remain visible on keyboard focus', () => {
  const html = `<div class="col"><button class="nf-button nf-button-primary" id="f-btn">BUTTON</button>
    <div class="nf-tab-list" role="tablist"><button class="nf-tab" role="tab" aria-selected="true" id="f-tab">TAB</button></div>
    <ol class="nf-pagination"><li class="nf-page-item"><a class="nf-page-link" href="#" id="f-page">1</a></li></ol>
    <div class="nf-accordion"><div class="nf-accordion-item"><button class="nf-accordion-trigger" aria-expanded="false" id="f-acc">ACC<span class="nf-accordion-icon"></span></button></div></div>
    <input class="nf-input" id="f-input" aria-label="Name"></div>`;
  test('every primary control shows an outline or ring when focused with the keyboard', async ({ page, browserName }) => {
    await loadFixture(page, html);
    void browserName;
    for (const id of ['f-btn', 'f-tab', 'f-page', 'f-acc', 'f-input']) {
      // A key press first marks the interaction as keyboard, so :focus-visible applies on
      // the programmatic focus; engines differ on whether a scroller (the tab list) is a tab stop.
      await page.keyboard.press('Shift');
      await page.locator(`#${id}`).focus();
      await expect(page.locator(`#${id}`)).toBeFocused();
      const visible = await page.locator(`#${id}`).evaluate((el) => {
        const s = getComputedStyle(el);
        return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow !== 'none' && s.boxShadow !== '') || parseFloat(s.borderTopWidth) > 0;
      });
      expect(visible, `#${id} focus indicator`).toBe(true);
    }
  });
});
