#!/usr/bin/env tsx
// NetFrame build pipeline
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Steps:
//   1. Compile src/netframe.scss → netframe.css           (Dart Sass)
//   2. PostCSS (autoprefixer) → netframe.css + .map; (+ cssnano) → netframe.min.css
//   3. Copy src/ → scss/  so Sass consumers can @use 'netframe/scss/...'
//   4. Copy src/fonts → fonts/ so compiled CSS can load ./fonts/*.woff2
//
// Output is written to a fresh staging directory and swapped into dist/ in
// one step, so deleted sources never survive as stale files in a release.

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'sass';
import postcss, { type AcceptedPlugin, type Plugin } from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const WATCH = process.argv.includes('--watch');

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDirSync(src: string, dest: string): void {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Source partials use `url('../fonts/…')`, which is correct relative to
// src/base/ and the shipped dist/scss/base/ copies. Compiled CSS lives at the
// dist/ root next to dist/fonts/, so rewrite those URLs for compiled output only.
const rewriteFontUrls: Plugin = {
  postcssPlugin: 'netframe-rewrite-font-urls',
  Declaration(decl) {
    if (decl.value.includes('../fonts/')) {
      decl.value = decl.value.replace(/url\((['"]?)\.\.\/fonts\//g, 'url($1./fonts/');
    }
  },
};

// Point source-map sources at the SCSS copies shipped in dist/scss/ instead of
// absolute machine paths (file:///Users/…).
function relativeSources(sources: string[]): string[] {
  return sources.map((source) => {
    if (!source.startsWith('file:')) return source;
    const abs = fileURLToPath(source);
    const rel = path.relative(SRC, abs);
    if (rel.startsWith('..')) return path.basename(abs);
    return ['scss', ...rel.split(path.sep)].join('/');
  });
}

async function buildEntry(
  outDir: string,
  entry: string,
  outName: string,
): Promise<void> {
  const cssOutPath = path.join(outDir, `${outName}.css`);
  const minOutPath = path.join(outDir, `${outName}.min.css`);

  const sassResult = compile(entry, {
    style: 'expanded',
    sourceMap: true,
    loadPaths: [SRC],
  });

  const sassMap = sassResult.sourceMap;
  if (sassMap) {
    sassMap.sources = relativeSources(sassMap.sources);
  }

  const plugins: AcceptedPlugin[] = [rewriteFontUrls, autoprefixer];

  // Expanded build with a source map chained back to the original SCSS.
  const prefixed = await postcss(plugins).process(sassResult.css, {
    from: cssOutPath,
    to: cssOutPath,
    map: { inline: false, annotation: true, prev: sassMap ?? false, sourcesContent: false },
  });
  fs.writeFileSync(cssOutPath, prefixed.css, 'utf8');
  if (prefixed.map) {
    fs.writeFileSync(`${cssOutPath}.map`, prefixed.map.toString(), 'utf8');
  }

  // Minified build (no source map, matching previous output).
  const minified = await postcss([...plugins, cssnano({ preset: 'default' })]).process(
    sassResult.css,
    { from: cssOutPath, to: minOutPath, map: false },
  );
  fs.writeFileSync(minOutPath, minified.css, 'utf8');

  console.log(`  ✓ ${outName}.css (+ .map) and ${outName}.min.css`);
}

async function build(): Promise<void> {
  const start = Date.now();
  console.log('▶ NetFrame build starting…');

  const staging = path.join(ROOT, `.dist-staging-${process.pid}`);
  fs.rmSync(staging, { recursive: true, force: true });
  ensureDir(staging);

  try {
    await buildEntry(staging, path.join(SRC, 'netframe.scss'), 'netframe');
    await buildEntry(staging, path.join(SRC, 'themes', 'themes.scss'), 'themes');

    copyDirSync(SRC, path.join(staging, 'scss'));
    console.log('  ✓ Copied src/ → dist/scss/');

    copyDirSync(path.join(SRC, 'fonts'), path.join(staging, 'fonts'));
    console.log('  ✓ Copied fonts/ → dist/fonts/');

    // Swap staging into place.
    const previous = path.join(ROOT, `.dist-previous-${process.pid}`);
    fs.rmSync(previous, { recursive: true, force: true });
    if (fs.existsSync(DIST)) fs.renameSync(DIST, previous);
    fs.renameSync(staging, DIST);
    fs.rmSync(previous, { recursive: true, force: true });
  } catch (err) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw err;
  }

  console.log(`✔ Build complete in ${Date.now() - start}ms`);
}

async function watch(): Promise<void> {
  await build();
  console.log('\n👁  Watching src/ for changes…\n');

  // Serialize builds: at most one running, at most one queued.
  let running = false;
  let pending = false;
  let timer: NodeJS.Timeout | undefined;

  const run = async (): Promise<void> => {
    if (running) {
      pending = true;
      return;
    }
    running = true;
    try {
      do {
        pending = false;
        try {
          await build();
        } catch (err) {
          console.error('Build error:', err);
        }
      } while (pending);
    } finally {
      running = false;
    }
  };

  fs.watch(SRC, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    console.log(`  ~ changed: ${filename}`);
    clearTimeout(timer);
    timer = setTimeout(() => void run(), 50);
  });
}

try {
  if (WATCH) {
    await watch();
  } else {
    await build();
  }
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
