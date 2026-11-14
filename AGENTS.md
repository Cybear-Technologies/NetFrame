# AGENTS.md — NetFrame

Instructions for coding agents (and humans) working in this repository.

## What this is

NetFrame is a framework-agnostic **cyberpunk CSS component library**: Sass source compiled to plain CSS, CSS custom-property tokens, six alternate themes plus the default palette, self-hosted fonts. It has **no runtime dependencies** and no JavaScript API. The Astro site in `apps/docs` is documentation only.

Preserve: class names (`nf-*`), custom properties (`--nf-*`), Sass entry points and mixin names, the `exports` map, the hard-edged neon/CRT look. Treat all of these as public API, even pre-1.0. Don't add a JS framework, runtime dependencies or new components unless asked.

## Layout

```text
packages/netframe/          the published package ("netframe")
  src/tokens|base|mixins|components|utilities|themes|fonts
  src/netframe.scss         main entry (forward order matters: tokens → base → mixins → components → utilities)
  src/themes/themes.scss    separate themes entry → dist/themes.css
  scripts/build.ts          Sass → PostCSS (autoprefixer, cssnano) → dist/ (atomic swap)
  test/*.test.mjs           node:test package + CSS contract tests
apps/docs/                  Astro docs (private, not published)
  scripts/sync-netframe.mjs copies built netframe dist into public/ (runs automatically on dev/build)
  tests/*.spec.ts           Playwright: every page (errors, external requests, axe WCAG 2.1 AA), docs JS snippets
```

Generated, never edit by hand: `packages/netframe/dist/`, `apps/docs/dist/`, `apps/docs/public/netframe.css`, `apps/docs/public/themes.css`, `apps/docs/public/fonts/`.

## Toolchain

- Node **22.23.4+** (`.nvmrc`), pnpm **9.15.9** (root `packageManager`; Corepack or a recent pnpm will select it). Running another pnpm major can rewrite `node_modules` (store mismatch) and change the lockfile format.
- Always change manifests and `pnpm-lock.yaml` together (`pnpm add` / `pnpm update`), then run `pnpm install --frozen-lockfile` to confirm.
- One-time setup for browser tests: `pnpm --filter @netframe/docs exec playwright install chromium`.

## Commands

| Purpose | Command |
| --- | --- |
| Everything CI runs (except audit) | `pnpm run check` |
| Lint: Stylelint (library SCSS) + `astro check` (docs `.astro`/TS/tests) | `pnpm run lint` |
| Build script type check | `pnpm run typecheck` |
| Library build + package/CSS tests | `pnpm --filter netframe run test` |
| Build library / docs | `pnpm --filter netframe run build` / `pnpm --filter @netframe/docs run build` |
| Browser tests (needs both builds) | `pnpm run test:browser` |
| Watch library + docs | `pnpm dev` (docs re-copy the library on each rebuild) |
| Security audit | `pnpm audit --audit-level high` |

Notes:
- Stylelint config: `packages/netframe/stylelint.config.mjs`. It enforces the `nf-` naming for classes, custom properties, mixins, variables and keyframes, `border-radius: 0`, no hex colours in `components/`/`utilities/`, and no `cursor: pointer` there. Formatting-only rules are off on purpose (they would only reformat aligned code or change compiled output); don't turn them on in unrelated changes.
- Write-free inspection: read files, `git diff`, `pnpm audit`, `changeset status`. Builds and tests write to `dist/`, `test-results/` and the docs `public/` copies.

## Changing CSS

- Use tokens only: `var(--nf-color-*)`, `--nf-space-*`, `--nf-font-*`, `--nf-duration-*`/`--nf-ease-*`. Pixel constants are fine for intentional effects (borders, scanlines, carets).
- `border-radius: 0`. Shadows are hard offsets (`nf-offset-shadow`). Glows and CRT effects in `utilities/` are intentional.
- Interactive elements: `cursor: crosshair`, `@include nf-focus-ring` (or `nf-focus-ring-inset`), and both `:disabled` and `[aria-disabled='true']` states.
- Whenever a state changes `background-color`, also set the matching foreground (`on-primary`, `on-secondary`, `on-tertiary`, …). `test/css.test.mjs` checks filled-button contrast across all seven palettes.
- Helper mixins `nf-visually-hidden`, `nf-flex-center`, `nf-truncate` and `nf-line-clamp` live in `mixins/_truncate.scss`.
- A new token in `tokens/_colors.scss` may need overrides in the six `themes/_*.scss` files.
- New component: add `src/components/_name.scss`, `@forward` it in `components/_index.scss` (don't reorder existing lines; cascade order matters), add a docs page in `apps/docs/src/pages/components/`, and add a link in `apps/docs/src/components/Sidebar.astro`.
- New SCSS files start with the GPL-3.0-only header used by existing files.

## Docs examples

Component pages show CSS-only markup plus optional `## JavaScript` snippets. `apps/docs/tests/examples.spec.ts` runs those snippets in a browser. Keep them working: state goes in ARIA attributes with literal values (`aria-hidden="true"`, `aria-expanded="false"`), plus keyboard support and focus management. Docs pages must not load third-party resources; `site.spec.ts` fails on external requests. `a11y.spec.ts` runs axe on every page. No accessibility exceptions are pinned. Fix violations rather than suppressing them.

In MDX, keep inline element content on one line (`<button …>LABEL</button>`). Multi-line content gets wrapped in `<p>`, which picks up base paragraph styles.

Form examples: associate labels (`for`/`id`), link helper text with `aria-describedby`, and mark errors with `aria-invalid="true"` (styled the same as `.nf-input-error`). Progress examples: `role="progressbar"` with value attributes and a label. Snippets that render dynamic text use `textContent`, never `innerHTML`.

## Package contract

- Supported imports: `netframe/dist/netframe.css`, `netframe/dist/themes.css`, `netframe`, `netframe/min`, `netframe/themes`, `netframe/themes/min`, `netframe/fonts/*`. Sass: `@use 'pkg:netframe/scss/netframe'` (optionally `with ($nf-font-path: '…')`).
- Compiled CSS loads fonts from `./fonts/` next to it. Raw SCSS uses `$nf-font-path` (default `../fonts`).
- Keep `style` before `sass` in each `exports` entry. Additive changes only; `test/package.test.mjs` guards this.

## Releases

- User-facing changes need a Changeset: `pnpm changeset` → commit the `.changeset/*.md` file.
- Release automation: `.github/workflows/release.yml` (Changesets action). `pnpm release` runs typecheck + tests before `changeset publish`. The workflow first runs the full check suite and audit; it uses OIDC/provenance and stays disabled until maintainer setup in `RELEASING.md` is complete. Never publish, push or tag from an agent session unless explicitly asked.

## More context

- `CONTRIBUTING.md`: contributor workflow.
- `README.md` and `apps/docs`: consumer-facing usage.
- `MODERNIZATION-HANDOFF.md` (local, untracked, if present): audit findings and remaining modernization work.
- `AGENT.md` (local, ignored, if present): an older feature roadmap. It is not approved scope, and parts of it are stale (Astro 4, manual `cp` sync, helper-mixin locations, "missing tokens fail the build").
