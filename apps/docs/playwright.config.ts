// NetFrame Docs — Playwright config
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Runs against the built site (`astro preview`). Build first:
//   pnpm --filter netframe run build && pnpm --filter @netframe/docs run build
//   pnpm --filter @netframe/docs run test:browser
//
// Projects
//   chromium         default desktop run (every spec except visual/)
//   firefox, webkit  opt-in desktop engines (nightly workflow, `--project=firefox`)
//   mobile-chromium  opt-in: Pixel 7 emulation, focused mobile smoke suite
//   mobile-webkit    opt-in: iPhone 14 emulation, focused mobile smoke suite
//   visual           opt-in: screenshot baselines (`pnpm run test:visual`)
//
// Mobile projects are *emulation* (viewport, touch, user agent, pointer: coarse).
// They catch layout and input-model regressions; they do not replace testing on
// physical iOS and Android devices (real keyboards, rubber-banding, browser
// chrome resizing, safe-area insets and OS text scaling).

import { defineConfig, devices } from '@playwright/test';

const PORT = 4329;
const VISUAL = '**/visual/**';
// The focused mobile smoke suite: navigation drawer and touch behaviour.
const MOBILE = /(docs-nav|mobile-smoke)\.spec\.ts$/;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixels: 100 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: VISUAL },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: VISUAL, default: false },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: VISUAL, default: false },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] }, testMatch: MOBILE, default: false },
    { name: 'mobile-webkit', use: { ...devices['iPhone 14'] }, testMatch: MOBILE, default: false },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 },
      testMatch: VISUAL,
      default: false,
    },
  ],
  webServer: {
    command: `astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
