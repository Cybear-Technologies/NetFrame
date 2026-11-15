// NetFrame Docs — read the documented controller snippets for fixtures
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PAGES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'pages', 'components');

/** The exact JavaScript a reader copies from a component page. */
export function docsSnippet(component: string, heading = 'JavaScript'): string {
  const mdx = fs.readFileSync(path.join(PAGES, `${component}.mdx`), 'utf8');
  const match = new RegExp(`## ${heading}[\\s\\S]*?\`\`\`js\\n([\\s\\S]*?)\`\`\``).exec(mdx);
  if (!match?.[1]) throw new Error(`no ${heading} JavaScript snippet in ${component}.mdx`);
  return match[1];
}
