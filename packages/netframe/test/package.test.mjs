// NetFrame — package contract tests
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// Run after a build (`pnpm --filter netframe test` builds first).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const CSS_FILES = ['netframe.css', 'netframe.min.css', 'themes.css', 'themes.min.css'];

function resolveFile(specifier) {
  // Self-reference resolves through the package "exports" map with Node's
  // default conditions (no bundler-specific "style"/"sass" condition).
  return fileURLToPath(import.meta.resolve(specifier));
}

test('documented and existing import specifiers resolve to built files', () => {
  const expected = {
    // Documented in README.md / packages/netframe/README.md
    'netframe/dist/netframe.css': 'dist/netframe.css',
    'netframe/dist/themes.css': 'dist/themes.css',
    // Existing export map entries
    netframe: 'dist/netframe.css',
    'netframe/min': 'dist/netframe.min.css',
    'netframe/themes': 'dist/themes.css',
    'netframe/themes/min': 'dist/themes.min.css',
    'netframe/scss/netframe.scss': 'dist/scss/netframe.scss',
    'netframe/scss/themes/themes.scss': 'dist/scss/themes/themes.scss',
    'netframe/fonts/vt323-400.woff2': 'dist/fonts/vt323-400.woff2',
  };
  for (const [specifier, rel] of Object.entries(expected)) {
    const resolved = resolveFile(specifier);
    assert.equal(path.relative(ROOT, resolved), rel, specifier);
    assert.ok(fs.existsSync(resolved), `${specifier} → ${rel} missing`);
  }
});

test('bundler "style" and Sass "sass" conditions keep their original targets', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(pkg.exports['.']).slice(0, 2), ['style', 'sass']);
  assert.equal(pkg.exports['.'].style, './dist/netframe.css');
  assert.equal(pkg.exports['.'].sass, './dist/scss/netframe.scss');
  assert.equal(pkg.exports['./themes'].style, './dist/themes.css');
  assert.equal(pkg.exports['./themes'].sass, './dist/scss/themes/themes.scss');
  assert.equal(pkg.main, './dist/netframe.css');
  assert.equal(pkg.dependencies, undefined, 'library must stay dependency-free');
  assert.equal(pkg.peerDependencies, undefined);
});

test('every url() in compiled CSS points at a file inside dist/', () => {
  for (const name of CSS_FILES) {
    const file = path.join(DIST, name);
    const css = fs.readFileSync(file, 'utf8');
    const urls = [...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)]
      .map((m) => m[2])
      .filter((u) => !u.startsWith('data:'));
    if (name.startsWith('netframe')) assert.ok(urls.length >= 8, `${name}: expected font URLs`);
    for (const url of urls) {
      const target = path.resolve(path.dirname(file), url);
      assert.ok(target.startsWith(DIST + path.sep), `${name}: ${url} escapes dist/`);
      assert.ok(fs.existsSync(target), `${name}: ${url} → ${path.relative(ROOT, target)} missing`);
    }
  }
});

test('source maps point at shipped SCSS, not machine paths', () => {
  for (const name of ['netframe.css.map', 'themes.css.map']) {
    const map = JSON.parse(fs.readFileSync(path.join(DIST, name), 'utf8'));
    const scss = map.sources.filter((s) => s.endsWith('.scss'));
    assert.ok(scss.length > 0, `${name}: no SCSS sources`);
    for (const source of map.sources) {
      assert.ok(!source.includes('file:') && !path.isAbsolute(source), `${name}: ${source}`);
      if (source.endsWith('.scss')) {
        assert.ok(fs.existsSync(path.join(DIST, source)), `${name}: ${source} not shipped`);
      }
    }
  }
});

test('build replaces dist/ wholesale so stale files never ship', () => {
  const stale = path.join(DIST, 'scss', '__stale-test.scss');
  fs.writeFileSync(stale, '// stale');
  const tsx = path.join(ROOT, 'node_modules', '.bin', 'tsx');
  const result = spawnSync(tsx, ['scripts/build.ts'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!fs.existsSync(stale), 'stale file survived rebuild');
  const leftovers = fs.readdirSync(ROOT).filter((f) => f.startsWith('.dist-'));
  assert.deepEqual(leftovers, [], 'staging directories left behind');
});

test('Sass consumers can @use the shipped sources via pkg: and relocate fonts', (t) => {
  // Simulate an installed consumer: <tmp>/node_modules/netframe → this package.
  const consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'netframe-sass-'));
  t.after(() => fs.rmSync(consumer, { recursive: true, force: true }));
  fs.mkdirSync(path.join(consumer, 'node_modules'));
  fs.symlinkSync(ROOT, path.join(consumer, 'node_modules', 'netframe'), 'dir');
  const importers = [new sass.NodePackageImporter(consumer)];

  const full = sass.compileString("@use 'pkg:netframe/scss/netframe';", { importers }).css;
  assert.match(full, /\.nf-button-primary/);
  assert.match(full, /url\("\.\.\/fonts\/vt323-400\.woff2"\)/, 'default font path unchanged');

  const relocated = sass.compileString(
    "@use 'pkg:netframe/scss/netframe' with ($nf-font-path: '/assets/fonts');",
    { importers },
  ).css;
  assert.match(relocated, /url\("\/assets\/fonts\/vt323-400\.woff2"\)/);

  const mixins = sass.compileString(
    "@use 'pkg:netframe/scss/mixins/neon-glow' as *; .x { @include nf-offset-shadow; }",
    { importers },
  ).css;
  assert.match(mixins, /\.x\s*\{[^}]*box-shadow/);
});

test('npm tarball contains compiled CSS, fonts and Sass sources', () => {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const files = new Set(JSON.parse(out)[0].files.map((f) => f.path));
  for (const required of [
    'package.json',
    'README.md',
    'dist/netframe.css',
    'dist/netframe.min.css',
    'dist/themes.css',
    'dist/themes.min.css',
    'dist/scss/netframe.scss',
    'dist/scss/themes/themes.scss',
    'dist/fonts/space-grotesk-700.woff2',
    'dist/fonts/vt323-400.woff2',
    'LICENSE',
    'dist/fonts/README.md',
    'dist/fonts/OFL-orbitron.txt',
  ]) {
    assert.ok(files.has(required), `tarball missing ${required}`);
  }
  for (const file of files) {
    assert.ok(!file.startsWith('src/') && !file.startsWith('test/'), `unexpected ${file}`);
  }
});

test('every shipped font has its OFL licence text alongside it', () => {
  const fonts = path.join(DIST, 'fonts');
  const readme = fs.readFileSync(path.join(fonts, 'README.md'), 'utf8');
  const files = fs.readdirSync(fonts);
  for (const font of files.filter((f) => f.endsWith('.woff2'))) {
    const row = readme.split('\n').find((line) => line.includes(`\`${font}\``));
    assert.ok(row, `${font} missing from fonts/README.md`);
    const licence = /`(OFL-[a-z0-9]+\.txt)`/.exec(row)?.[1];
    assert.ok(licence && files.includes(licence), `${font}: licence file ${licence} not shipped`);
    assert.match(fs.readFileSync(path.join(fonts, licence), 'utf8'), /SIL OPEN FONT LICENSE Version 1\.1/);
  }
});

test('release changelog configuration supplies the canonical repository', () => {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, '..', '..', '.changeset', 'config.json'), 'utf8'));
  assert.deepEqual(config.changelog, ['@changesets/changelog-github', { repo: 'JacksonChandler/NetFrame' }]);
});

test('a real packed installation resolves CSS, fonts and Sass without workspace links', (t) => {
  const consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'netframe-packed-'));
  t.after(() => fs.rmSync(consumer, { recursive: true, force: true }));
  const packed = JSON.parse(execFileSync('npm', [
    'pack', '--json', '--ignore-scripts', '--pack-destination', consumer,
  ], { cwd: ROOT, encoding: 'utf8' }))[0];
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({ private: true }));
  execFileSync('npm', [
    'install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund',
    path.join(consumer, packed.filename),
  ], { cwd: consumer, encoding: 'utf8' });
  const installed = path.join(consumer, 'node_modules', 'netframe');
  assert.ok(!fs.lstatSync(installed).isSymbolicLink(), 'must test the tarball, not a workspace link');
  execFileSync(process.execPath, ['--input-type=module', '-e', `
    import { existsSync } from 'node:fs';
    import { fileURLToPath } from 'node:url';
    for (const entry of ['netframe', 'netframe/min', 'netframe/themes', 'netframe/themes/min',
      'netframe/dist/netframe.css', 'netframe/fonts/vt323-400.woff2']) {
      if (!existsSync(fileURLToPath(import.meta.resolve(entry)))) throw new Error(entry);
    }
  `], { cwd: consumer, encoding: 'utf8' });
  const css = sass.compileString(
    "@use 'pkg:netframe/scss/netframe' with ($nf-font-path: '/assets/fonts'); @use 'pkg:netframe/scss/themes/themes';",
    { importers: [new sass.NodePackageImporter(consumer)] },
  ).css;
  assert.match(css, /\.nf-button-primary/);
  assert.match(css, /\.nf-theme-iron-signal/);
  assert.match(css, /url\("\/assets\/fonts\/vt323-400\.woff2"\)/);
});
