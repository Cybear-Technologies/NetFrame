// NetFrame — shared test helpers
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DIST = path.join(ROOT, 'dist');

export function parseCss(name) {
  return postcss.parse(fs.readFileSync(path.join(DIST, name), 'utf8'));
}

/** Map of selector → { prop: value } for top-level rules (last declaration wins). */
export function ruleMap(rootNode) {
  const rules = new Map();
  rootNode.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && rule.parent.name !== 'layer') return;
    for (const selector of rule.selectors) {
      const decls = rules.get(selector) ?? {};
      rule.walkDecls((d) => {
        decls[d.prop] = d.value;
      });
      rules.set(selector, decls);
    }
  });
  return rules;
}

/** Palettes: default (:root) plus every .nf-theme-* override, merged over default. */
export function palettes() {
  const base = ruleMap(parseCss('netframe.css')).get(':root') ?? {};
  const themes = ruleMap(parseCss('themes.css'));
  const result = { default: base };
  for (const [selector, decls] of themes) {
    const m = /^\.(nf-theme-[\w-]+)$/.exec(selector);
    if (m) result[m[1]] = { ...base, ...decls };
  }
  return result;
}

/** Resolve `var(--x)` / `var(--x, fallback)` against a palette to a hex colour. */
export function resolveColor(value, palette, depth = 0) {
  if (depth > 10) throw new Error(`var() cycle: ${value}`);
  const v = value.trim();
  const m = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(v);
  if (!m) return v;
  const next = palette[m[1]] ?? m[2];
  if (next === undefined) throw new Error(`undefined token ${m[1]}`);
  return resolveColor(next, palette, depth + 1);
}

function channel(hex, i) {
  const c = parseInt(hex.slice(i, i + 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(color) {
  let hex = color.replace('#', '').toLowerCase();
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/.test(hex)) throw new Error(`not a hex colour: ${color}`);
  return 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 2) + 0.0722 * channel(hex, 4);
}

/** WCAG 2.x contrast ratio between two hex colours. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
