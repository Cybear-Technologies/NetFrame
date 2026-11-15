// NetFrame Docs — built-site smoke tests
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { builtRoutes } from './routes';

const DOCS_SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

function track(page: Page) {
  const problems: string[] = [];
  const origin = new URL(test.info().project.use.baseURL!).origin;
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith(origin) && !url.startsWith('data:')) problems.push(`external: ${url}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) problems.push(`HTTP ${res.status()}: ${res.url()}`);
  });
  return problems;
}

const routes = builtRoutes();

test('page titles include the canonical product and company name', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('NETFRAME by Cybear Technologies');
  await page.goto('/components/button/');
  await expect(page).toHaveTitle('Button // NETFRAME by Cybear Technologies');
});

test('docs build contains the expected pages', () => {
  expect(routes).toContain('/');
  expect(routes).toContain('/components/button/');
  expect(routes.filter((r) => r.startsWith('/components/'))).toHaveLength(20);
});

for (const route of routes) {
  test(`${route} loads with no errors, failed or external requests`, async ({ page }) => {
    const problems = track(page);
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    expect(problems).toEqual([]);
  });
}

test('library fonts and local icon font load', async ({ page }) => {
  await page.goto('/components/button/');
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family);
  });
  expect(loaded).toEqual(expect.arrayContaining(['Space Grotesk', 'JetBrains Mono', 'Phosphor-Thin']));
});

test.describe('theme switcher', () => {
  test('persists across reloads and ignores unknown stored values', async ({ page }) => {
    await page.goto('/components/button/');
    await page.selectOption('#theme-switcher', 'nf-theme-night-city');
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/nf-theme-night-city/);
    await expect(page.locator('#theme-switcher')).toHaveValue('nf-theme-night-city');

    await page.evaluate(() => localStorage.setItem('nf-theme', 'bogus value'));
    await page.reload();
    await expect(page.locator('html')).not.toHaveClass(/nf-theme/);
    await expect(page.locator('#theme-switcher')).toHaveValue('');
  });

  test('works without errors when storage is blocked', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('blocked', 'SecurityError');
        },
      });
    });
    const problems = track(page);
    await page.goto('/components/button/');
    await page.selectOption('#theme-switcher', 'nf-theme-code-rain');
    await expect(page.locator('html')).toHaveClass(/nf-theme-code-rain/);
    expect(problems).toEqual([]);
  });
});

test.describe('code copy button', () => {
  test('announces success', async ({ page, context, browserName }) => {
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    } else {
      // Firefox/WebKit do not expose Chromium's clipboard permission names.
      // Keep real clipboard integration in Chromium; test UI/copy payload here.
      await page.addInitScript(() => {
        let copied = '';
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: {
            writeText: async (text: string) => { copied = text; },
            readText: async () => copied,
          },
        });
      });
    }
    await page.goto('/components/button/');
    await page.locator('.demo-copy').first().click();
    await expect(page.locator('.demo-copy-label').first()).toHaveText('COPIED');
    await expect(page.locator('.demo-copy-status').first()).toHaveText('Code copied to clipboard');
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain('nf-button-primary');
  });

  test('reports failure and resets', async ({ page }) => {
    await page.addInitScript(() => {
      navigator.clipboard.writeText = () => Promise.reject(new DOMException('denied', 'NotAllowedError'));
    });
    const problems = track(page);
    await page.goto('/components/button/');
    const button = page.locator('.demo-copy').first();
    await button.click();
    await expect(page.locator('.demo-copy-label').first()).toHaveText('COPY FAILED');
    await expect(page.locator('.demo-copy-status').first()).toHaveText('Copy failed');
    await expect(page.locator('.demo-copy-label').first()).toHaveText('COPY', { timeout: 3000 });
    await expect(button.locator('i')).toHaveCount(1);
    expect(problems).toEqual([]);
  });
});

test('theming page token table matches the compiled default palette', async ({ request }) => {
  const css = await (await request.get('/netframe.css')).text();
  const root = /:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
  const compiled = new Map([...root.matchAll(/(--nf-color-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]!.trim().toLowerCase()]));
  const mdx = fs.readFileSync(path.resolve(DOCS_SRC, 'pages', 'theming.mdx'), 'utf8');
  const documented = [...mdx.matchAll(/name: '(--nf-color-[\w-]+)',\s*value: '([^']+)'/g)];
  expect(documented.length).toBeGreaterThan(10);
  const mismatches = documented
    .filter(([, name, value]) => compiled.get(name!) !== value!.toLowerCase())
    .map(([, name, value]) => `${name}: docs ${value}, css ${compiled.get(name!) ?? '(missing)'}`);
  expect(mismatches).toEqual([]);
});

test('llms.txt and llms-full.txt are served and describe real pages', async ({ request }) => {
  const index = await request.get('/llms.txt');
  expect(index.status()).toBe(200);
  const text = await index.text();
  expect(text).toMatch(/^# NetFrame/);
  for (const url of text.matchAll(/\((https:\/\/netframe\.cybeartech\.com(\/[^)]*))\)/g)) {
    const route = url[2]!;
    if (route.endsWith('.txt')) continue; // generated files, checked below
    const page = await request.get(route);
    expect(page.status(), route).toBe(200);
  }
  const full = await request.get('/llms-full.txt');
  expect(full.status()).toBe(200);
  const body = await full.text();
  for (const needle of ['nf-button-primary', '--nf-color-primary', 'netframe-interactive', 'aria-expanded']) {
    expect(body, needle).toContain(needle);
  }
});
