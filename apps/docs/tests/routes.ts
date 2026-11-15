// NetFrame Docs — discover built routes for browser tests
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

/** Every page Astro built, e.g. "/", "/components/button/". */
export function builtRoutes(dir = DIST, base = '/'): string[] {
  const routes: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('_')) continue; // _astro assets
      routes.push(...builtRoutes(path.join(dir, entry.name), `${base}${entry.name}/`));
    } else if (entry.name === 'index.html') {
      routes.push(base);
    }
  }
  return routes;
}

