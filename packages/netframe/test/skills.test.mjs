// NetFrame — agent skill contract tests
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// The skills ship in the npm package. They must name only classes and tokens
// that exist, stay in step with the docs, and never need a hand-run generator.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, parseCss, palettes, resolveColor } from './helpers.mjs';

const REPO = path.resolve(ROOT, '..', '..');
const SKILLS = path.join(ROOT, 'skills');
const EXPECTED = ['netframe-interactive', 'netframe-theming', 'netframe-usage'];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );
}

function compiled() {
  const classes = new Set();
  const properties = new Set();
  for (const name of ['netframe.css', 'themes.css']) {
    parseCss(name).walk((node) => {
      if (node.type === 'rule') for (const m of node.selector.matchAll(/\.(nf-[a-z0-9-]+)/g)) classes.add(m[1]);
      if (node.type === 'decl' && node.prop.startsWith('--nf-')) properties.add(node.prop);
    });
  }
  return { classes, properties };
}

test('exactly the planned skills ship, with valid metadata', () => {
  assert.deepEqual(fs.readdirSync(SKILLS).sort(), EXPECTED);
  for (const name of EXPECTED) {
    const file = path.join(SKILLS, name, 'SKILL.md');
    const text = fs.readFileSync(file, 'utf8');
    const front = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1];
    assert.ok(front, `${name}: missing frontmatter`);
    const field = (key) => new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(front)?.[1]?.trim();
    assert.equal(field('name'), name, `${name}: name must match its folder`);
    const description = field('description');
    assert.ok(description && description.length >= 80 && description.length <= 500, `${name}: description length ${description?.length}`);
    assert.match(description, /\bUse when\b/, `${name}: description should say when to use it`);
    assert.equal(field('license'), 'GPL-3.0-only');
    const files = walk(path.join(SKILLS, name)).map((f) => path.relative(path.join(SKILLS, name), f));
    for (const f of files) assert.match(f, /^(SKILL\.md|references\/[a-z-]+\.md)$/, `${name}: unexpected file ${f}`);
    assert.ok(text.length < 8000, `${name}: keep SKILL.md short; detail belongs in references/`);
  }
});

test('every nf- class and --nf- token a skill names exists in the shipped CSS', () => {
  const { classes, properties } = compiled();
  // `nf-theme` is the docs' localStorage key, not a class.
  const NOT_CLASSES = new Set(['nf-theme']);
  const problems = [];
  for (const file of walk(SKILLS).filter((f) => f.endsWith('.md'))) {
    // Skip generated "Do not edit" headers and fenced HTML comments naturally; scan everything else.
    const text = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file);
    for (const m of text.matchAll(/(?<![\w$-])nf-[a-z0-9]+(?:-[a-z0-9]+)*(-|-?\*)?/g)) {
      const name = m[0];
      if (m[1] || NOT_CLASSES.has(name) || classes.has(name)) continue; // trailing - or * means a prefix or wildcard
      problems.push(`${rel}: unknown class ${name}`);
    }
    for (const m of text.matchAll(/--nf-[a-z0-9]+(?:-[a-z0-9]+)*(-|-?\*)?/g)) {
      if (!m[1] && !properties.has(m[0])) problems.push(`${rel}: unknown token ${m[0]}`);
    }
  }
  assert.deepEqual([...new Set(problems)], []);
});

test('every class in the docs class-reference tables exists in the shipped CSS', () => {
  const { classes } = compiled();
  const problems = [];
  for (const kind of ['components', 'utilities']) {
    const dir = path.join(REPO, 'apps', 'docs', 'src', 'pages', kind);
    for (const file of fs.readdirSync(dir)) {
      const section = fs.readFileSync(path.join(dir, file), 'utf8').split(/^## Class reference$/m)[1] ?? '';
      for (const row of section.matchAll(/^\|\s*`(nf-[a-z0-9-]+)`\s*\|/gm)) {
        if (!classes.has(row[1])) problems.push(`${kind}/${file}: ${row[1]}`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test('generated skill references and llms.txt are up to date', () => {
  const result = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'build-skills.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('install commands match across the package README, the docs page and the skill index', () => {
  const COMMANDS = [
    'npx netframe skills claude',
    'npx netframe skills copilot',
    'npx netframe skills codex',
    'mkdir -p .claude/skills && cp -R node_modules/netframe/skills/* .claude/skills/',
    'mkdir -p .github/skills && cp -R node_modules/netframe/skills/* .github/skills/',
    'mkdir -p .codex/skills && cp -R node_modules/netframe/skills/* .codex/skills/',
  ];
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const docs = fs.readFileSync(path.join(REPO, 'apps', 'docs', 'src', 'pages', 'agents.mdx'), 'utf8');
  for (const command of COMMANDS) {
    assert.ok(readme.includes(command), `package README missing: ${command}`);
    assert.ok(docs.includes(command), `docs agents page missing: ${command}`);
  }
});

test('theme hex values in the root README match the compiled palettes', () => {
  const readme = fs.readFileSync(path.join(REPO, 'README.md'), 'utf8');
  const all = palettes();
  const sections = [...readme.matchAll(/^### (DEFAULT|`(nf-theme-[a-z0-9-]+)`)\n\n> (.+)$/gm)];
  assert.equal(sections.length, 7, 'expected the default palette plus six themes in the README');
  const problems = [];
  for (const [, heading, theme, line] of sections) {
    const palette = all[theme ?? 'default'];
    const available = new Set(
      Object.keys(palette)
        .filter((k) => k.startsWith('--nf-color-'))
        .map((k) => resolveColor(`var(${k})`, palette).toLowerCase()),
    );
    for (const hex of line.match(/#[0-9a-fA-F]{6}/g) ?? []) {
      if (!available.has(hex.toLowerCase())) problems.push(`${heading}: ${hex} is not a colour in that palette`);
    }
  }
  assert.deepEqual(problems, []);
});
