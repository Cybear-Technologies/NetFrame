# Release setup

## Status

- `netframe@0.2.4` is prepared in the working tree at the maintainer's requested exact version. Pending mobile, first-batch component, drawer/tabs, tag, and tooltip Changesets have been consolidated into `packages/netframe/CHANGELOG.md` and consumed; no additional minor bump is pending. This is local release preparation, not confirmation of npm publication. Push/merge and release-environment approval remain maintainer actions.

- `netframe@0.2.0` was published manually (no provenance). `0.2.1` was the first release through GitHub Actions trusted publishing (git tag `netframe@0.2.1` created). At the time of writing the registry listing was still propagating: confirm `npm view netframe versions dist-tags` shows 0.2.1 as `latest`, and that the npm page shows a provenance badge.
- `0.0.0-stage` is a placeholder version on npm from the initial setup. Harmless; npm does not allow reuse of its number.
- Release automation is enabled (`NPM_RELEASE_ENABLED=true`). Trusted publisher: `Cybear-Technologies` / `NetFrame`, `release.yml`, environment `release`.

## Open items

- [ ] Create the Cloudflare project (see Docs hosting), attach `netframe.cybeartech.com`, then confirm an unknown URL returns HTTP 404 with the branded page.
- [ ] Run **Actions → Cross-browser verification → Run workflow** once, then confirm the nightly schedule runs.
- [ ] Optional: create GitHub Releases for `netframe@0.2.0` (no tag exists) and `netframe@0.2.1`.
- Deferred: docs hosted under a URL prefix such as `/netframe/` (needs code and test work; unneeded for root-domain hosting). Brand colours are tuned for 4.5:1 text contrast on all surfaces; keep `test/css.test.mjs` passing when changing palettes.

## Normal release flow

1. Add a Changeset for any user-facing change (`pnpm changeset`) and merge it to `main`.
2. The workflow opens a "chore: version packages" PR. Merge it and approve the `release` environment.
3. The publish step runs `pnpm release`, publishes with provenance and tags the version.
4. With no pending Changesets, the action runs `pnpm release` and attempts to publish checked-in package versions that are not yet on npm; already-published versions are skipped. A manually prepared version such as `0.2.4` therefore does not need another version PR.
   - **Do not leave only empty/docs-only Changesets pending.** The pinned Changesets action v2.1.2 returns early when all Changesets have empty `releases` lists, skipping both PR creation and publishing. Fold documentation-only notes into the release documentation/changelog instead of leaving an empty Changeset as the sole pending entry.
5. TypeScript stays on 6.x: `astro check` rejects 7 (Dependabot ignores >=7).

NetFrame is authored by Cybear Technologies; Jackson Chandler is the developer.
The source repository is https://github.com/Cybear-Technologies/NetFrame.

## Maintainer setup (required before enabling automation)

1. Create your npm account and confirm ownership/availability of the **package name** `netframe` on the existing npm registry. You do not need to create a registry server.
2. Bootstrap the first publication manually if npm requires an existing package to configure trusted publishing. First finalize the intended source revision and package version, run `pnpm run check` and `pnpm audit --audit-level high`, then inspect `pnpm --filter netframe exec npm pack --dry-run`. The package tests also install a real tarball offline to verify consumer CSS/Sass/font imports. For initial cross-browser review, install Firefox/WebKit and run `pnpm --filter @netframe/docs exec playwright test --project=firefox --project=webkit`. No first publication has been performed by the coding agent. Publish only a finalized release: public name/version publication is not a reversible test.
3. In GitHub, protect `main` and require CI's **Build & verify** check. Run CI once so GitHub can discover the check. Enable the repository setting allowing GitHub Actions to create pull requests for Changesets version PRs.
4. Create a GitHub environment named **release**. Restrict it to `main`, require reviewer approval, and prevent self-review where supported. Environment protections require GitHub configuration; a YAML reference does not create those protections. The current combined release job requires approval for version PR creation as well as publishing.
5. In the npm package settings, configure a GitHub Actions trusted publisher:
   - Organization/user: `Cybear-Technologies`
   - Repository: `NetFrame`
   - Workflow filename: `release.yml`
   - Environment: `release`
   - Allow direct `npm publish` if npm presents that permission.
6. Set the GitHub repository Actions variable **NPM_RELEASE_ENABLED** to `true` only after steps 1–5. Until then, the release job is skipped. No npm token is required by the workflow; remove obsolete publishing secrets only after validating OIDC.

## Docs hosting (Cloudflare Workers static assets)

Config lives in `apps/docs/wrangler.jsonc`; `not_found_handling: "404-page"` serves `dist/404.html` with HTTP 404 for unknown routes. Locally verified with `wrangler dev`: real pages 200, unknown route 404 with the branded page, extensionless URLs 307 to the trailing-slash form.

Cloudflare project settings (Workers & Pages → Create → connect `Cybear-Technologies/NetFrame`):

| Field | Value |
| --- | --- |
| Root directory | `apps/docs` |
| Build command | `pnpm run build:cloudflare` (single line; Cloudflare installs dependencies itself) |
| Production deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler preview` |
| Variables | `NODE_VERSION=22`, `PNPM_VERSION=9.15.9` |
| Custom domain | `netframe.cybeartech.com` (project → Settings → Domains) |

Wrangler 4.162.0 requires a top-level `previews` block for `wrangler preview`; `apps/docs/wrangler.jsonc` opts in with `"previews": {}`. Keep `assets`, `compatibility_date`, and the custom 404 configuration at the top level, not inside `previews`. A log saying `wrangler preview` identifies a Preview deployment, not the production `wrangler deploy` path. If the failing build is meant for production, correct its deploy command in the Cloudflare dashboard instead. The open-beta warning is informational; the missing block is the blocking error. See [Worker Previews configuration](https://developers.cloudflare.com/workers/previews/configuration/#wrangler-configuration-file).

Local validation without uploading: build the site, then run `wrangler deploy --dry-run` from `apps/docs`. The Preview command has no dry-run option in 4.162.0; do not run it as a supposedly write-free check.

`build:cloudflare` (in `apps/docs/package.json`) builds the library, then the docs. Keep the dashboard field to that one short command: a pasted line break splits `&&` chains and `sh` fails with `Syntax error: "&&" unexpected`. The library must build before the docs: the docs copy its CSS and fonts into `public/`. The canonical origin is `https://netframe.cybeartech.com`, served at the domain root (links are root-relative).

## Workflow

`.github/workflows/release.yml` runs on pushes to `main`. It uses SHA-pinned actions and npm 11.21.1 (OIDC requires npm >=11.5.1). Changesets action v2 creates version PRs or runs `pnpm release`. pnpm 9 delegates the package upload to the installed npm CLI. `id-token: write` enables OIDC; `NPM_CONFIG_PROVENANCE=true` requests provenance. No token authentication fallback is configured.

The release job runs lint, typecheck, library tests, docs build, Chromium tests and the dependency audit before invoking Changesets. `pnpm release` also runs typecheck and library tests before publishing. Non-cancelling concurrency serializes releases to avoid partial publication.

These changes are locally checked, not proven against GitHub or npm. Verify the first version PR, protected-environment approval, npm authentication, provenance and tags in the first real run. Do not enable automation before the setup above is complete.
