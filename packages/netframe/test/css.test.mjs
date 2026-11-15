// NetFrame — compiled CSS behaviour tests
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCss, ruleMap, palettes, resolveColor, contrast } from './helpers.mjs';

const lib = parseCss('netframe.css');
const rules = ruleMap(lib);

test('every var(--nf-*) without a fallback is defined on :root', () => {
  const defined = new Set();
  lib.walkDecls((d) => {
    if (d.prop.startsWith('--nf-')) defined.add(d.prop);
  });
  // Custom properties a component defines locally (e.g. --nf-ring-stroke).
  const missing = new Set();
  lib.walkDecls((d) => {
    for (const m of d.value.matchAll(/var\(\s*(--nf-[\w-]+)\s*(,)?/g)) {
      if (!m[2] && !defined.has(m[1])) missing.add(m[1]);
    }
  });
  assert.deepEqual([...missing], []);
});

test('six alternate themes compile alongside the default palette', () => {
  assert.deepEqual(Object.keys(palettes()).sort(), [
    'default',
    'nf-theme-chiba-city',
    'nf-theme-code-rain',
    'nf-theme-iron-signal',
    'nf-theme-neon-80s',
    'nf-theme-night-city',
    'nf-theme-renaissance',
  ]);
});

// Filled button states: every background swap must carry its own foreground.
const BUTTON_STATES = [
  '.nf-button-primary',
  '.nf-button-primary:hover',
  '.nf-button-secondary',
  '.nf-button-secondary:hover',
  '.nf-button-danger',
  '.nf-button-danger:hover',
];

function stateColors(selector, palette) {
  const decls = { ...rules.get(selector.split(':')[0]), ...rules.get(selector) };
  return {
    bg: resolveColor(decls['background-color'], palette),
    fg: resolveColor(decls.color, palette),
  };
}

test('button hover states switch foreground with background', () => {
  assert.equal(rules.get('.nf-button-primary:hover').color, 'var(--nf-color-on-secondary)');
  assert.equal(rules.get('.nf-button-secondary:hover').color, 'var(--nf-color-on-tertiary)');
  assert.equal(rules.get('.nf-button-danger:hover').color, 'var(--nf-color-text)');
});

test('filled button text meets 4.5:1 in every palette', () => {
  const failures = [];
  for (const [name, palette] of Object.entries(palettes())) {
    for (const selector of BUTTON_STATES) {
      const { bg, fg } = stateColors(selector, palette);
      const ratio = contrast(bg, fg);
      if (ratio < 4.5) failures.push(`${name} ${selector}: ${ratio.toFixed(2)}`);
    }
  }
  assert.deepEqual(failures, []);
});

// Brand colours are used as text (labels, avatar initials, links, ghost
// buttons) on any surface, and as fills behind their on-* colour.
const SURFACES = ['bg', 'surface', 'surface-lowest', 'surface-low', 'surface-container', 'surface-high', 'surface-highest'];
const BRAND_TEXT = ['primary', 'secondary', 'tertiary', 'error', 'warning'];
const FILL_PAIRS = [
  ['on-primary', 'primary'],
  ['on-secondary', 'secondary'],
  ['on-tertiary', 'tertiary'],
];

test('brand colours reach 4.5:1 as text on every surface and behind their on-* colour', () => {
  const failures = [];
  for (const [name, palette] of Object.entries(palettes())) {
    const color = (token) => resolveColor(`var(--nf-color-${token})`, palette);
    for (const brand of BRAND_TEXT) {
      for (const surface of SURFACES) {
        const ratio = contrast(color(brand), color(surface));
        if (ratio < 4.5) failures.push(`${name}: ${brand} on ${surface} ${ratio.toFixed(2)}`);
      }
    }
    for (const [fg, bg] of FILL_PAIRS) {
      const ratio = contrast(color(fg), color(bg));
      if (ratio < 4.5) failures.push(`${name}: ${fg} on ${bg} ${ratio.toFixed(2)}`);
    }
  }
  assert.deepEqual(failures, []);
});

test('alerts use opaque surfaces with readable text and links in all seven palettes', () => {
  assert.equal(rules.get('.nf-alert')['background-color'], 'var(--nf-color-surface-high)');
  assert.equal(rules.get('.nf-alert').color, 'var(--nf-color-text)');
  for (const [name, palette] of Object.entries(palettes())) {
    const color = (token) => resolveColor(`var(--nf-color-${token})`, palette);
    for (const token of ['text', 'primary', 'secondary', 'tertiary']) {
      assert.ok(contrast(color(token), color('surface-high')) >= 4.5, `${name}: alert ${token}`);
    }
  }
  for (const [variant, token] of Object.entries({ info: 'tertiary', success: 'primary', warning: 'secondary', error: 'error' })) {
    assert.equal(rules.get(`.nf-alert-${variant}`)['border-inline-start-color'], `var(--nf-color-${token})`);
  }
});

test('switch state indicators and readonly boundaries meet non-text contrast in every palette', () => {
  for (const [name, palette] of Object.entries(palettes())) {
    const color = (token) => resolveColor(`var(--nf-color-${token})`, palette);
    for (const [fg, bg] of [['text', 'surface-lowest'], ['text-muted', 'surface-lowest'], ['primary', 'surface-lowest'], ['on-primary', 'primary'], ['text-muted', 'surface-low']]) {
      assert.ok(contrast(color(fg), color(bg)) >= 3, `${name}: ${fg} / ${bg}`);
    }
  }
  assert.equal(rules.get('.nf-input[readonly]')['border-color'], 'var(--nf-color-text-muted)');
  assert.equal(rules.get('.nf-select').appearance, 'auto');
  assert.equal(rules.get('.nf-select')['background-image'], undefined);
  assert.equal(rules.get('.nf-input:focus-visible')['outline-offset'], '2px');
});

test('tooltips open when a focusable child of the wrapper has focus', () => {
  assert.ok(rules.has('.nf-tooltip-wrap:focus-within .nf-tooltip'));
  for (const pos of ['bottom', 'left', 'right']) {
    assert.ok(rules.has(`.nf-tooltip-wrap:focus-within .nf-tooltip-${pos}`), pos);
  }
});

test('dropdown menu hides only on aria-hidden="true" or .nf-hidden', () => {
  // Sass normalises [aria-hidden='true'] to [aria-hidden=true].
  const hiddenRule = rules.get('.nf-dropdown-menu[aria-hidden=true]');
  assert.equal(hiddenRule?.display, 'none');
  assert.ok(rules.has('.nf-dropdown-menu.nf-hidden'));
});
