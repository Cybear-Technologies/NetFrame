#!/usr/bin/env node
// NetFrame CLI — installs the bundled agent skills into a project.
// Copyright (C) 2026 Cybear Technologies
// SPDX-License-Identifier: GPL-3.0-only
//
// No dependencies, no network access, no install scripts. Only writes the three
// package-owned skill folders (netframe-*) under the chosen skills directories.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'skills');
const TARGETS = {
  claude: '.claude/skills',
  copilot: '.github/skills',
  codex: '.codex/skills',
};

const HELP = `NetFrame CLI

Usage:
  npx netframe skills <claude|copilot|codex|all> [--dir <path>] [--dry-run]
  npx netframe skills --list

Copies the bundled netframe-* agent skills into your project:
  claude   -> ${TARGETS.claude}
  copilot  -> ${TARGETS.copilot}
  codex    -> ${TARGETS.codex}
  all      -> all of the above

Options:
  --dir <path>  Use <path> as the skills directory instead (one agent only)
  --dry-run     Show what would change without writing anything
  --list        List the bundled skills
  -h, --help    Show this help

Run from your project root. Re-run after upgrading netframe to refresh the copies.
Only netframe-* folders are written; other skills are never touched. These copies
are overwritten on update, so copy and rename one before customising it.
`;

function fail(message, code = 1) {
  console.error(`netframe: ${message}\n\nRun "npx netframe --help" for usage.`);
  process.exit(code);
}

function skillNames() {
  if (!fs.existsSync(SOURCE)) fail(`bundled skills not found at ${SOURCE}`, 2);
  return fs
    .readdirSync(SOURCE, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^netframe-[a-z-]+$/.test(e.name))
    .map((e) => e.name)
    .sort();
}

/** Regular files under a directory, relative paths; symlinks are never followed. */
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return files(full).map((f) => path.join(e.name, f));
    return e.isFile() ? [e.name] : [];
  });
}

function install(root, names, dryRun) {
  const result = { added: 0, updated: 0, unchanged: 0 };
  for (const name of names) {
    const from = path.join(SOURCE, name);
    const to = path.join(root, name);
    const wanted = files(from);
    for (const rel of wanted) {
      const source = fs.readFileSync(path.join(from, rel));
      const target = path.join(to, rel);
      const exists = fs.existsSync(target);
      if (exists && fs.lstatSync(target).isSymbolicLink()) fail(`refusing to write through symlink ${target}`);
      if (exists && fs.readFileSync(target).equals(source)) {
        result.unchanged++;
        continue;
      }
      result[exists ? 'updated' : 'added']++;
      if (dryRun) continue;
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, source);
    }
    // Drop files an older netframe shipped that this version no longer includes.
    if (fs.existsSync(to) && fs.lstatSync(to).isDirectory()) {
      for (const rel of files(to)) {
        if (wanted.includes(rel)) continue;
        result.updated++;
        if (!dryRun) fs.rmSync(path.join(to, rel));
      }
    }
  }
  return result;
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(HELP);
  process.exit(args.length === 0 ? 1 : 0);
}

const [command, ...rest] = args;
if (command !== 'skills') fail(`unknown command "${command}"`);

if (rest.includes('--list')) {
  for (const name of skillNames()) console.log(name);
  process.exit(0);
}

const dryRun = rest.includes('--dry-run');
let dir;
const positional = [];
for (let i = 0; i < rest.length; i++) {
  const arg = rest[i];
  if (arg === '--dry-run') continue;
  if (arg === '--dir') {
    dir = rest[++i];
    if (!dir) fail('--dir needs a path');
    continue;
  }
  if (arg.startsWith('-')) fail(`unknown option "${arg}"`);
  positional.push(arg);
}

if (positional.length !== 1) {
  console.error('netframe: choose one of: claude, copilot, codex, all\n');
  console.error(HELP);
  process.exit(1);
}
const agent = positional[0];
if (agent !== 'all' && !(agent in TARGETS)) fail(`unknown agent "${agent}" (choose claude, copilot, codex or all)`);
if (dir && agent === 'all') fail('--dir works with one agent, not "all"');

const names = skillNames();
const roots = agent === 'all' ? Object.values(TARGETS) : [dir ?? TARGETS[agent]];
for (const rel of roots) {
  const root = path.resolve(process.cwd(), rel);
  if (fs.existsSync(root) && !fs.statSync(root).isDirectory()) fail(`${root} exists and is not a directory`);
  const { added, updated, unchanged } = install(root, names, dryRun);
  console.log(`${dryRun ? '[dry run] ' : ''}${path.relative(process.cwd(), root) || '.'}: ${added} added, ${updated} updated, ${unchanged} unchanged`);
}
if (!dryRun) console.log('Done. Restart or reload your agent if it caches skills.');
