// NetFrame Docs — layout helpers shared by responsive, mobile and component tests
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { expect, type Locator, type Page } from '@playwright/test';

/** Viewport widths exercised across the suite (CSS pixels). */
export const WIDTHS = [320, 390, 768, 1024, 1440] as const;
/** The docs navigation switches to a permanent sidebar at this width (64rem). */
export const NAV_BREAKPOINT = 1024;

export type Offender = { element: string; left: number; right: number; width: number };

/**
 * Elements that extend past the viewport's left/right edge, ignoring content
 * that is allowed to scroll in place (labelled scroll regions, scrollable
 * <pre>, tab lists) and the closed off-canvas drawer. `scrollWidth` alone
 * misses clipped content, so this measures every visible element.
 */
export async function horizontalOffenders(page: Page): Promise<Offender[]> {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const offenders: { element: string; left: number; right: number; width: number }[] = [];
    const name = (el: Element) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String((el as HTMLElement).className || '').split(' ')[0] ?? ''}`;
    for (const el of document.body.querySelectorAll('*')) {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (el.closest('[inert], [hidden]')) continue;
      // Decorative full-bleed overlays are positioned on purpose.
      if (el.closest('.nf-crt') === el && style.position === 'fixed') continue;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      let scrollsInPlace = false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const ox = getComputedStyle(a).overflowX;
        if (ox === 'visible') continue;
        // An ancestor that scrolls or clips horizontally owns this overflow: it is
        // either reachable by scrolling that region or clipped on purpose (for
        // example an animated progress bar sliding inside its track).
        const box = a.getBoundingClientRect();
        const clipped = rect.left < box.left - 0.5 || rect.right > box.right + 0.5;
        if (a.scrollWidth > a.clientWidth || a.matches('pre, .docs-table-scroll, .nf-table-wrap, .nf-tab-list') || clipped) {
          scrollsInPlace = true;
          break;
        }
      }
      // Text lines inside <pre> report box widths that include hanging whitespace.
      if (scrollsInPlace || el.closest('pre')) continue;
      if (rect.right > viewport + 1 || rect.left < -1) {
        offenders.push({ element: name(el), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) });
      }
    }
    return offenders;
  });
}

/** Whole-document horizontal overflow: the symptom users see as sideways page scroll. */
export async function documentOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

/**
 * True when the element is fully inside the viewport and actually receives a
 * pointer at its centre (not covered by a fixed bar, drawer or overlay).
 */
export async function isReachable(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    const inside = rect.left >= -0.5 && rect.top >= -0.5 && rect.right <= innerWidth + 0.5 && rect.bottom <= innerHeight + 0.5;
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return inside && !!hit && (hit === el || el.contains(hit));
  });
}

/** Scrolls the element into view, then checks it is reachable at the pointer. */
export async function reachableAfterScroll(locator: Locator): Promise<boolean> {
  await locator.scrollIntoViewIfNeeded();
  return isReachable(locator);
}

export async function rect(locator: Locator): Promise<{ x: number; y: number; width: number; height: number; right: number; bottom: number }> {
  const box = await locator.boundingBox();
  expect(box, 'element has a box').not.toBeNull();
  const b = box!;
  return { ...b, right: b.x + b.width, bottom: b.y + b.height };
}

/** Safari only tabs to buttons/links with Option held; other engines use plain Tab. */
export function tabKeys(browserName: string): { tab: string; shiftTab: string } {
  return browserName === 'webkit' ? { tab: 'Alt+Tab', shiftTab: 'Alt+Shift+Tab' } : { tab: 'Tab', shiftTab: 'Shift+Tab' };
}

/** Wait for local fonts so measurements and screenshots are stable. */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
}

/** Serve an HTML fixture from the preview origin so /netframe.css and fonts resolve. */
export async function loadFixture(page: Page, body: string, extraHead = ''): Promise<void> {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>Fixture</title>
    <link rel="stylesheet" href="/netframe.css"><link rel="stylesheet" href="/themes.css">${extraHead}
    <style>body{margin:0;padding:12px}.col{width:280px;max-width:100%;border:1px dashed #666;margin-bottom:24px;position:relative}</style>
    </head><body>${body}</body></html>`;
  await page.route('**/__fixture', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  await page.goto('/__fixture');
  await settle(page);
}

/** Resolve once CSS transitions/animations on the element and its subtree have finished. */
export async function finishAnimations(locator: Locator): Promise<void> {
  await locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => undefined))).then(() => undefined));
}
