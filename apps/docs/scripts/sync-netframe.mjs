// NetFrame Docs — copy the freshly built library into public/
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Replaces the manual `cp packages/netframe/dist/... apps/docs/public/` step.
// Resolves the workspace package through its public exports, so the docs use
// exactly what consumers import. Build the library first.
//
// Used by the `netframe-assets` integration in astro.config.ts (runs on
// `astro dev` / `astro build`), and runnable directly:
//   node scripts/sync-netframe.mjs           one-shot copy
//   node scripts/sync-netframe.mjs --watch   re-copy when the library rebuilds

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(DOCS, 'public');

function resolveDist() {
  let cssPath;
  try {
    cssPath = fileURLToPath(import.meta.resolve('netframe/dist/netframe.css'));
  } catch {
    throw new Error('Cannot resolve the netframe package. Run `pnpm install` first.');
  }
  return path.dirname(cssPath);
}

export function syncNetframe() {
  const dist = resolveDist();
  const missing = ['netframe.css', 'themes.css', 'fonts'].filter(
    (f) => !fs.existsSync(path.join(dist, f)),
  );
  if (missing.length) {
    throw new Error(
      `netframe dist/ is incomplete (missing ${missing.join(', ')}). ` +
        'Run `pnpm --filter netframe run build` first.',
    );
  }
  fs.mkdirSync(path.join(PUBLIC, 'fonts'), { recursive: true });
  fs.copyFileSync(path.join(dist, 'netframe.css'), path.join(PUBLIC, 'netframe.css'));
  fs.copyFileSync(path.join(dist, 'themes.css'), path.join(PUBLIC, 'themes.css'));
  for (const font of fs.readdirSync(path.join(dist, 'fonts'))) {
    fs.copyFileSync(path.join(dist, 'fonts', font), path.join(PUBLIC, 'fonts', font));
  }
  console.log('[sync-netframe] copied netframe.css, themes.css and fonts/ into public/');
}

export function watchNetframe() {
  // The library build swaps dist/ atomically, so watch its parent directory.
  const pkgRoot = path.dirname(resolveDist());
  let timer;
  const watcher = fs.watch(pkgRoot, (_event, filename) => {
    if (filename !== 'dist') return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        syncNetframe();
      } catch (err) {
        console.error('[sync-netframe]', err.message);
      }
    }, 100);
  });
  console.log('[sync-netframe] watching netframe dist/ for rebuilds');
  return watcher;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  syncNetframe();
  if (process.argv.includes('--watch')) watchNetframe();
}
