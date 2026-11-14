// NetFrame Docs — Astro config
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import mdx from '@astrojs/mdx';
import { syncNetframe, watchNetframe } from './scripts/sync-netframe.mjs';

// Copy the freshly built netframe package into public/ before dev/build, and
// keep it in sync while `pnpm --filter netframe run dev` rebuilds.
const netframeAssets: AstroIntegration = {
  name: 'netframe-assets',
  hooks: {
    'astro:config:setup': ({ command }) => {
      if (command !== 'dev' && command !== 'build') return;
      syncNetframe();
      if (command === 'dev') watchNetframe();
    },
  },
};

export default defineConfig({
  integrations: [netframeAssets, mdx()],
  site: 'https://netframe.cybeartech.com',
  markdown: {
    shikiConfig: {
      theme: 'dark-plus',
      wrap: true,
    },
  },
});
