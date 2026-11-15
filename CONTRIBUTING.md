# Contributing to NetFrame

Thanks for your interest. NetFrame is a GPL-3.0-only project by Cybear Technologies.

Coding agents: see [AGENTS.md](AGENTS.md) for the command reference and repository rules. If you change classes, tokens or docs examples, run `pnpm run skills:build` and commit the regenerated agent skill references (CI fails on stale files).

## Prerequisites

- Node 22.23.4+ (see `.nvmrc`)
- pnpm 9.15.9 (pinned in `package.json` → `packageManager`)

## Setup

```sh
git clone https://github.com/Cybear-Technologies/NetFrame.git
cd NetFrame
pnpm install
```

## Development workflow

Build the library in watch mode:

```sh
pnpm --filter netframe run dev
```

Start the docs site (requires the library to be built first):

```sh
pnpm --filter netframe run build
pnpm --filter @netframe/docs run dev
```

Or run everything in parallel:

```sh
pnpm dev
```

## Project structure

```text
packages/netframe/
  src/
    tokens/        Design tokens (_colors, _typography, _spacing, _motion)
    base/          Resets, font-face declarations, base typography
    mixins/        Reusable Sass mixins (shadows, scanlines, glitch, focus)
    components/    One file per component (_button, _card, etc.)
    utilities/     Utility classes (glow, scanlines, glitch, layout)
    netframe.scss  Root barrel — @forward everything
  scripts/
    build.ts       Dart Sass → PostCSS (autoprefixer + cssnano)
  test/            node:test package/CSS contract tests (`pnpm --filter netframe test`)
  dist/            Build output (not committed)
```

## Adding a component

1. Create `packages/netframe/src/components/_your-component.scss`
2. `@forward 'your-component'` in `src/components/_index.scss`
3. Use only `var(--nf-*)` tokens — no hardcoded values
4. Use `@use '../mixins/focus-ring'` and include `@include focus-ring.nf-focus-ring()` on interactive elements
5. 0px border-radius — no exceptions
6. Add a docs page at `apps/docs/src/pages/components/your-component.mdx`

## Design rules (non-negotiable)

- `border-radius: 0` everywhere
- Shadows are hard pixel offsets (`4px 4px 0px 0px color`) — no soft `box-shadow`
- Colours come from tokens only (`packages/netframe/src/tokens/_colors.scss`): primary Terminal Green, secondary Hot Pink, tertiary UV Violet. Every brand colour must reach 4.5:1 as text on all surfaces and against its `on-*` colour; `packages/netframe/test/css.test.mjs` enforces this for all seven palettes
- Headings: `text-transform: uppercase`, `letter-spacing: 0.05em`, Space Grotesk Bold
- Body/UI text: JetBrains Mono
- Status/badge/label text: VT323
- `cursor: crosshair` on body (set in reset)

## Submitting changes

1. Create a branch: `git checkout -b feat/your-thing`
2. Make changes and verify checks pass: `pnpm run check` (typecheck, library tests, full build, browser tests; run `pnpm --filter @netframe/docs exec playwright install chromium` once first)
3. Add a changeset: `pnpm changeset`  
   Select `netframe`, choose `patch`/`minor`/`major`, write a summary
4. Open a pull request against `main`

## Versioning

NetFrame uses [Changesets](https://github.com/changesets/changesets). Every user-facing change needs a changeset file. Once maintainer setup is complete, the release workflow creates version PRs when changesets are merged. See [RELEASING.md](./RELEASING.md) for npm ownership, trusted publishing and required GitHub protections; automation is disabled until explicitly enabled.

## License

By contributing, you agree that your contributions are licensed under GPL-3.0-only.
