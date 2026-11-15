// NetFrame — CLI (npx netframe skills) tests
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './helpers.mjs';

const BIN = path.join(ROOT, 'bin', 'netframe.mjs');
const SKILLS = path.join(ROOT, 'skills');
const AGENTS = { claude: '.claude/skills', copilot: '.github/skills', codex: '.codex/skills' };

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)).map((f) => path.join(e.name, f)) : [e.name],
  );
}
const shipped = fs.readdirSync(SKILLS).sort().flatMap((s) => walk(path.join(SKILLS, s)).map((f) => path.join(s, f))).sort();

function project(t) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'netframe-cli-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  return cwd;
}
function run(cwd, ...args) {
  return spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: 'utf8' });
}

test('installs the bundled skills for each agent into its own directory', (t) => {
  for (const [agent, dir] of Object.entries(AGENTS)) {
    const cwd = project(t);
    const result = run(cwd, 'skills', agent);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(walk(path.join(cwd, dir)).sort(), shipped, `${agent}: file list`);
    for (const rel of shipped) {
      assert.ok(fs.readFileSync(path.join(cwd, dir, rel)).equals(fs.readFileSync(path.join(SKILLS, rel))), `${agent}: ${rel} content`);
    }
    for (const other of Object.values(AGENTS).filter((d) => d !== dir)) assert.ok(!fs.existsSync(path.join(cwd, other)), `${agent} must not write ${other}`);
  }
});

test('"all" installs every agent directory and a rerun changes nothing', (t) => {
  const cwd = project(t);
  assert.equal(run(cwd, 'skills', 'all').status, 0);
  for (const dir of Object.values(AGENTS)) assert.deepEqual(walk(path.join(cwd, dir)).sort(), shipped);
  const again = run(cwd, 'skills', 'all');
  assert.equal(again.status, 0);
  assert.match(again.stdout, /0 added, 0 updated, 6 unchanged/);
});

test('update refreshes stale copies, removes dropped files, and never touches other skills', (t) => {
  const cwd = project(t);
  run(cwd, 'skills', 'claude');
  const root = path.join(cwd, '.claude', 'skills');
  fs.writeFileSync(path.join(root, 'netframe-usage', 'SKILL.md'), 'stale');
  fs.writeFileSync(path.join(root, 'netframe-usage', 'references', 'removed-in-new-version.md'), 'old');
  fs.mkdirSync(path.join(root, 'my-own-skill'));
  fs.writeFileSync(path.join(root, 'my-own-skill', 'SKILL.md'), 'mine');
  const result = run(cwd, 'skills', 'claude');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(fs.readFileSync(path.join(root, 'netframe-usage', 'SKILL.md')).equals(fs.readFileSync(path.join(SKILLS, 'netframe-usage', 'SKILL.md'))));
  assert.ok(!fs.existsSync(path.join(root, 'netframe-usage', 'references', 'removed-in-new-version.md')));
  assert.equal(fs.readFileSync(path.join(root, 'my-own-skill', 'SKILL.md'), 'utf8'), 'mine');
});

test('--dry-run writes nothing, --dir targets a custom directory, --list names the skills', (t) => {
  const cwd = project(t);
  const dry = run(cwd, 'skills', 'all', '--dry-run');
  assert.equal(dry.status, 0);
  assert.match(dry.stdout, /\[dry run\]/);
  assert.deepEqual(fs.readdirSync(cwd), []);
  assert.equal(run(cwd, 'skills', 'claude', '--dir', 'custom/place').status, 0);
  assert.deepEqual(walk(path.join(cwd, 'custom', 'place')).sort(), shipped);
  assert.deepEqual(run(cwd, 'skills', '--list').stdout.trim().split('\n'), fs.readdirSync(SKILLS).sort());
});

test('bad input exits non-zero with guidance and writes nothing', (t) => {
  const cwd = project(t);
  for (const args of [[], ['skills'], ['skills', 'vim'], ['skills', 'all', '--dir', 'x'], ['skills', 'claude', '--dir'], ['skills', 'claude', '--wat'], ['install']]) {
    const result = run(cwd, ...args);
    assert.notEqual(result.status, 0, `args ${JSON.stringify(args)} should fail`);
    assert.match(result.stderr + result.stdout, /--help|Usage:/, `args ${JSON.stringify(args)} should explain usage`);
  }
  assert.deepEqual(fs.readdirSync(cwd), []);
  assert.equal(run(cwd, '--help').status, 0);
});

test('refuses to write through a symlink and leaves the target untouched', (t) => {
  const cwd = project(t);
  const victim = path.join(cwd, 'victim.txt');
  fs.writeFileSync(victim, 'keep me');
  const dir = path.join(cwd, '.claude', 'skills', 'netframe-usage');
  fs.mkdirSync(dir, { recursive: true });
  fs.symlinkSync(victim, path.join(dir, 'SKILL.md'));
  const result = run(cwd, 'skills', 'claude');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /symlink/);
  assert.equal(fs.readFileSync(victim, 'utf8'), 'keep me');
});

test('a file where a directory is expected is reported, not overwritten', (t) => {
  const cwd = project(t);
  fs.mkdirSync(path.join(cwd, '.github'));
  fs.writeFileSync(path.join(cwd, '.github', 'skills'), 'not a directory');
  const result = run(cwd, 'skills', 'copilot');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not a directory/);
  assert.equal(fs.readFileSync(path.join(cwd, '.github', 'skills'), 'utf8'), 'not a directory');
});
