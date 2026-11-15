# Original request — verbatim

Review the findings from the previous audit of this repository, rerun the investigation below, and update the same Markdown plan file with corrected and expanded findings. This repository is an npm package for a UI kit. Preserve its core mission, intended behavior, public API, and consumer compatibility. This is an audit and planning task only.

Deliverable and existing work
- Read applicable agent instructions before beginning the investigation.
- Locate and read the previous improvement plan before editing it. Use PROJECT_IMPROVEMENT_PLAN.md if it is the existing plan; otherwise identify the actual file from repository evidence. If multiple files are plausible and the intended file cannot be established, ask which to update.
- Update that same file in place. Do not create a replacement or duplicate plan.
- Its first section must contain this entire prompt verbatim, followed by the updated audit and implementation handoff.
- Preserve useful previous findings, correct unsupported conclusions, and explain material changes in an audit comparison section. Make the resulting document coherent and current rather than appending contradictory findings.
- The plan must remain untracked by Git. Do not stage, commit, modify ignore rules, or manipulate Git tracking. If the existing plan is tracked, report the conflict and ask for direction before editing it.
- Preserve all other existing user changes. The identified plan is the only file you may modify.

Review of previous findings
Audit the previous plan and any accessible outputs from earlier runs, including qwen3.8’s attempt. Use available reports, conversation history, logs, and artifacts; do not assume access to unavailable conversations or private internal reasoning.

For each substantive previous finding, classify it as confirmed, partially confirmed, incorrect, outdated, or unverified. Provide current evidence, corrections, and the resulting recommendation. Recheck claims against the current repository and GitHub state instead of carrying forward old conclusions or reported validation results.

If previous supporting material is unavailable, state exactly what is missing and continue independently using the existing plan and accessible evidence.

Investigation
1. Establish the project’s purpose, supported consumers, public API, architecture, package manager, toolchain, and release process.
2. Review repository structure, documentation, agent instructions, skills, and other agent context. Identify missing, conflicting, stale, or repetitive guidance.
3. Review manifests, lockfiles, runtime and development dependencies, peer dependencies, supported Node versions, and build tooling. Identify outdated or unsupported dependencies, vulnerabilities, compatibility constraints, and unnecessary dependencies.
4. Review open Dependabot PRs on GitHub, including proposed changes, linked advisories, CI status, discussions, and conflicts where accessible. Recommend merge, revise, group, supersede, or defer for each, with reasons and prerequisites. Do not modify PRs or post comments.
5. Review source code for defects, obsolete patterns, code smells, duplication, maintainability issues, and inconsistencies with the existing design.
6. Assess testing, CI, linting, formatting, type checking, build validation, and release safeguards. Propose a proportionate testing strategy tied to actual risks and existing tooling.
7. Assess package consumption: exports, type declarations, module formats, peer dependencies, bundled files, styling and asset delivery, documentation, examples, and installation or integration paths. Review accessibility and UI behavior where relevant.
8. Assess how agents can develop the package and help downstream projects consume it. Recommend concrete improvements to instructions, discoverability, examples, API documentation, and validation workflows. Justify proposed skills or machine-readable metadata against demonstrated needs.

Evidence and constraints
- Make no implementation changes. Updating the existing plan is the only authorized file change.
- Do not install or update dependencies, rewrite lockfiles, apply fixes, generate project artifacts, or change Git state.
- Record the initial working-tree state so pre-existing changes can be distinguished from your work.
- Use read-only inspection and checks that do not change project files. Inspect scripts before running them. If a useful check would write files, document its proposed command and purpose instead.
- Distinguish confirmed findings, hypotheses, recommendations, and unresolved product decisions.
- Cite repository paths and relevant symbols or line references. Link GitHub PRs, advisories, and authoritative documentation where used.
- Date time-sensitive dependency, advisory, and PR observations.
- Distinguish an affected dependency version from demonstrated exposure. Explain direct versus transitive dependencies, runtime versus development impact, remediation options, and uncertainty.
- Do not claim a check passed unless you ran it during this audit. Label previous results as historical.
- Record access failures and missing evidence explicitly. Do not substitute assumptions for inaccessible GitHub or registry information.
- Treat compatibility as the default. Flag potentially breaking recommendations with alternatives, migration implications, and release considerations.
- Avoid speculative rewrites, unrelated features, and tooling additions without concrete benefits.

Required plan structure
After the verbatim prompt section, include:
1. Executive assessment and the project mission to preserve.
2. Current architecture, repository structure, tooling, and agent-readiness inventory.
3. Prioritized findings with severity, evidence, impact, confidence, and recommended action.
4. Dependency and vulnerability assessment, plus a Dependabot PR disposition table.
5. Code quality, accessibility, package-consumption, and documentation findings.
6. Testing and CI strategy tied to identified risks.
7. A phased implementation handoff in dependency order. For each work item, specify:
   - Problem and intended outcome.
   - Likely files or areas affected.
   - Concrete implementation steps.
   - Dependencies and prerequisites.
   - Acceptance criteria and validation commands, distinguishing verified commands from proposed ones.
   - Compatibility risks and relative effort.
8. Comparison with previous findings, including corrections, newly discovered issues, and recommendations that changed.
9. Checks performed, checks not performed, limitations, and unresolved decisions.

Make the plan specific enough for another coding agent to execute without repeating the initial investigation. Separate urgent security or correctness work from maintenance and optional improvements.

Before finishing, verify that the existing plan is the only file you changed and that it remains untracked. Report its path, the most important corrections to the previous audit, the highest-priority findings, and material limitations. Do not implement the plan.

# 0. Implementation status — 2026-11-14 (first implementation pass)

This section is current; sections 1–9 below are the audit that drove it. Where they disagree, this section wins. Nothing was staged, committed, pushed, published or deployed. No PRs were modified. This file remains untracked.

## Latest notification-control repair — preparing 0.2.0

Replaced the bare details/summary demo with NotificationExample.astro and explicitly copied demo-only CSS. It now renders a framed list with row separators, timestamps/read labels, unread count, stable-width/reserved-space layout, and native buttons. The exact optional MDX controller runs via ExampleBehavior: repeated click, outside click, Escape (restores focus), focus leaving the control, and explicit mark-all-read (clears dot, zeroes count, announces read state, preserves panel/focus and read state across reopening). No library runtime added. Copied HTML/CSS + JavaScript are self-contained; IDs must be unique for multiple instances.

Tests expanded beyond visibility: real dismissal, keyboard/focus, read state and geometry at 320/390/1000/1440px. All 30 targeted badge tests pass across Chromium/Firefox/WebKit; full check exits 0 (17 library tests, 28 pages, 127 Chromium tests); Firefox/WebKit full suite 253 passed/1 unsupported-touch skip; whitespace check exit 0. Logs: `/tmp/nf-notification-tests2.log`, `/tmp/nf-notification-full-check.log`, `/tmp/nf-notification-full-cross.log`. Desktop and fresh-mobile screenshots reviewed (`/tmp/nf-notification-open.png`, `/tmp/nf-notification-phone-final.png`). No publishing, commits or deployment. This supersedes the prior bare native-disclosure implementation below.

## Latest dot-badge redesign — preparing 0.2.0

Reworked `.nf-badge-dot` from an 8px box with only a 4px colour centre into a 12px framed square with an 8px colour centre, dark separation keyline and thin outer accent. Preserved the existing class/pseudo-element; added `--nf-badge-dot-size` and `--nf-badge-dot-color`; no pulse/blink or pointer interception. Docs now explicitly describe unread notifications, compare UNREAD ALERTS vs ALL READ, and include a native disclosure with a real sample list, visible unread count and accessible summary text. No fake button or required JS. Changelog remains under unpublished 0.2.0.

Validation: all 24 targeted badge tests pass across three engines, including all seven themes; full check exits 0 (17 library tests, 28-page build, 125 Chromium tests). Visual screenshots reviewed at `/tmp/nf-badge-unread-redesign.png` and `/tmp/nf-badge-notifications-redesign.png`. Logs: `/tmp/nf-badge-targeted.log`, `/tmp/nf-badge-full-check.log`. No publishing, commits or deployment.

## Latest tabs regression fix — preparing 0.2.0

User found tabs were static. Both live variants now have unique tab/panel IDs, matching `aria-controls`/`aria-labelledby`, meaningful content for each tab, and execute the displayed controller via ExampleBehavior. Added real-page selection/panel/roving-tabindex, keyboard wrap/Home/End and disabled-activation tests. Controller guards native disabled tabs and an empty enabled list. Targeted snippet + real tabs tests passed 45/45 across Chromium, Firefox and WebKit; Astro check/build pass. No library runtime or public CSS API changes. Changelog included in unpublished 0.2.0.

## Latest docs/component regression fixes — preparing 0.2.0

User walkthrough exposed gaps that earlier isolated-snippet/default-page scans missed. Fixed live dropdown/accordion controllers (including missing accordion `aria-controls`/panel IDs), all three table demos with accessible sortable headers and numeric/missing-value handling, working pagination with local records/status/bounds/focus plus responsive wrapping, real breadcrumb destinations, and a themed static `404.html` with recovery links. Live controllers execute the exact trusted local MDX snippets; no library runtime JavaScript was added.

Redesigned spinners as stationary, slow (2.4s) signal-cell pulses, steady labels and reduced-motion cells, preserving existing classes/sizes/colour variants. Visually reviewed all seven themes. Progress-ring root cause confirmed in Firefox: a number-only `stroke-dashoffset` calc was rejected and rendered a full ring. Fixed it to return a length; added normalized path support, percentage clamps, butt caps, zero-progress seam suppression and stroke clearance. Reviewed 0/25/50/75/100% screenshots. Existing circumference-based markup remains supported. Changelog updated under the still-unpublished **0.2.0** version.

Final validation: `pnpm run check` exit 0 (lint/typecheck, 17 library tests, 28 built pages, **114 Chromium tests**); Firefox/WebKit **227 passed, 1 skipped** (unsupported Firefox touch emulation); audit and whitespace check exit 0. Logs: `/tmp/nf-component-fixes-check.log`, `/tmp/nf-component-fixes-cross.log`, `/tmp/nf-component-fixes-audit.log`. Astro 7-specific Context7 documentation was unavailable; standard custom-404 guidance was verified with the installed build and all three browsers. Static hosting must serve `404.html` with HTTP 404; noted in RELEASING.md. No commits, publishing, deployment or release enablement. External release tasks below remain pending.

## Current remaining checklist — release 0.2.0

**This checklist supersedes the historical status entries below.** User selected **0.2.0** and confirmed CodeQL runs in CI. CodeQL setup is no longer an outstanding task (maintainer-reported, not independently inspected).

### Completed in the version-preparation pass

- Changed the pending Changeset from patch to minor and ran `pnpm run version-packages` successfully. Manifest is now **0.2.0**, `packages/netframe/CHANGELOG.md` was generated, and Changesets consumed `.changeset/fix-package-contract.md` normally. No publishing or Git operations performed.
- Docs version labels now import the actual package version instead of hard-coding 0.1.0.
- Frozen install, full check (17 library tests, 27 pages, 73 Chromium tests), npm pack dry-run and whitespace check all exit 0. Pack reports **netframe-0.2.0.tgz**, 85 files. Logs: `/tmp/nf-version-020.log`, `/tmp/nf-020-install.log`, `/tmp/nf-020-check.log`, `/tmp/nf-020-pack.json`.
- Other completed work: palette/contrast fixes; identity/domain selection; font licensing; package exports/fonts/maps; real installed-tarball test; lint/typechecks; Chromium/Firefox/WebKit tests; release OIDC/provenance code and SHA pins. See implementation records below.

### Final branch-cleanup verification

User reports `dependencies` and `ci` labels are now added. All known in-scope package/code work is complete for **0.2.0**; nested-path hosting remains intentionally deferred for the root-domain site. Corrected stale tracking guidance in AGENTS.md.

Re-ran frozen install and full check (17 library tests, 27-page docs build, 73 Chromium tests), Firefox/WebKit (146 tests), high-level audit and whitespace check: **all exit 0**. Logs: `/tmp/nf-cleanup-install.log`, `/tmp/nf-cleanup-check.log`, `/tmp/nf-cleanup-cross-browser.log`, `/tmp/nf-cleanup-audit.log`.

User authorized deleting this document **if everything is done**. Retained it because the external release/setup/verification tasks below are still unconfirmed. No publishing, release enablement, staging, commits, pushes or GitHub mutations performed. Once those remaining tasks are complete, this handoff can be removed; durable instructions are in RELEASING.md.

### Still required for release

- [ ] Maintainer review/finalize source changes for **0.2.0**, including generated changelog.
- [ ] Maintainer perform initial npm publication when ready. Account/login and apparent name availability are confirmed, but successful name ownership/publication is not.
- [ ] Configure npm trusted publisher after bootstrap, then set `NPM_RELEASE_ENABLED=true` only when ready.
- [ ] Verify actual protected automated publication, OIDC/provenance and version/tag consistency. Cannot be completed by local dry-run.
- [ ] Verify DNS/hosting serves `https://netframe.cybeartech.com` (deployment is external to package publication).

### Optional / verification only

- [x] Repository labels **dependencies** and **ci** added, confirmed by maintainer. Older docs/library label advice is obsolete. No agent-side GitHub changes.
- [ ] Run the new **Cross-browser verification** workflow manually once after merge, then confirm nightly runs. Local Firefox/WebKit validation already passed 146 tests.
- Nested-base-path docs support: **deferred, unnecessary for the chosen root-domain deployment**. Needed only if hosting under a URL prefix such as `/netframe/`; requires code/test work, not a GitHub setting.
- CodeQL setup: **not outstanding**; user confirms it runs in CI. Check that the default branch has a successful scan/results; add its status to branch protection only if desired. Do not add a duplicate workflow.
- Full manual accessibility assessment / whole-site scans of every alternate theme remain optional beyond current automated coverage.

## Latest pre-publication pass — 2026-11-14 (historical)

User requested finishing remaining work before publishing. Current HEAD on entry was `44ca142` (`Fix: Enhance package contract, accessibility, and CI/CD robustness`). Initial dirty state: modified handoff plus existing untracked `.changeset/README.md` and `.changeset/fix-package-contract.md`. Prior implementation has been committed by the maintainer since the earlier session. **This handoff is now tracked by Git**; no tracking/staging changes were made to force it back to untracked.

### Completed

- Reviewed user's dry-run: all checks pass, expected CSS/Sass/fonts/licences are present; pnpm native-binary fallback warning is non-blocking. Existing font duplicates in `dist/scss/fonts/` preserve raw Sass-relative asset paths; retained deliberately rather than breaking a supported path.
- Expanded `packages/netframe/README.md`: CSS/theme imports, theme classes, static hosting/font layout, Sass package importer and configurable font URLs, consumer-owned behaviour/accessibility, GPL/OFL notices.
- Added a **real tarball installation** regression test: pack into a temporary directory, install offline with lifecycle scripts disabled, verify package is not a workspace symlink, resolve CSS/font exports and compile library + themes through Sass package importer. Temporary files are cleaned.
- **Release blocker found/fixed:** `@changesets/changelog-github@0.6.0` requires `options.repo`; previous config supplied only a module name. Config now explicitly supplies `JacksonChandler/NetFrame`, with regression coverage. Context7's current docs describe a GitHub environment fallback, but installed 0.6.0 code has no such fallback; followed installed-version evidence. Changesets action v2 source confirms it supplies `GITHUB_TOKEN` to version commands.
- Added opt-in Firefox and WebKit Playwright projects. All 146 tests pass. Adjusted tooltip keyboard navigation for WebKit's Option+Tab convention; no library CSS change. Clipboard success uses the real clipboard in Chromium, mocked clipboard in Firefox/WebKit because permission names are not portable. Failure/status coverage remains in all engines.
- Added SHA-pinned nightly/manual `.github/workflows/browsers.yml` for Firefox/WebKit. Default required CI remains Chromium. Context7 version-specific Playwright docs were available through 1.64.1, not installed 1.65.1; project configuration was validated by installed typecheck and successful runs.
- Updated AGENTS, RELEASING and the existing changeset.

### Validation

- Frozen install: exit 0 (`/tmp/nf-prepublish-install.log`).
- Final `pnpm run check`: exit 0; lint/typecheck, **17 library tests**, 27 pages, **73 Chromium tests** (`/tmp/nf-prepublish-final-check.log`).
- Firefox/WebKit: **146/146**, exit 0 (`/tmp/nf-cross-browser-final.log`).
- Dependency audit: exit 0 (`/tmp/nf-prepublish-audit.log`).
- Changesets status: exit 0, pending patch proposes **netframe 0.1.1** (`/tmp/nf-prepublish-changeset-status.log`). This is status validation, not a full GitHub-linked changelog/version execution.
- All three workflow YAML files parse; `git diff --check` exit 0.
- No publishing, staging, commits, pushes, tags, deployment, or GitHub settings changes by the agent.

### Remaining, distinguished from package blockers

- npm account/login and apparent package-name availability confirmed **by user**, but name is not reserved. Initial publication, trusted publisher configuration, OIDC/provenance execution remain pending by design. Leave `NPM_RELEASE_ENABLED` unset.
- Maintainer must finalize source revision and intended first version before publishing. Manifest remains **0.1.0**; pending Changeset proposes **0.1.1**. No automatic version bump performed.
- Domain chosen: `netframe.cybeartech.com`. DNS/hosting and live-site reachability remain external/unverified.
- **Optional, not a blocker for the chosen root-domain deployment:** nested-base-path docs hosting. Root-relative site links/assets still mean nested hosting is unsupported. No claim of base-path support.
- Dependabot labels/CodeQL remain separate GitHub configuration work (not changed); nightly workflow requires its first real GitHub run. Existing required CI/protections are user-reported working.
- Broader manual accessibility review and full alternate-theme browser scans remain outside targeted default-theme axe + palette-token tests. No claim of complete WCAG certification.

## Latest maintainer update — GitHub protections

User reports the test PR works with GitHub Actions and setup A/B/C is complete: main branch protection/required checks, protected `release` environment, and Actions permission to create PRs. This is maintainer-reported, not independently inspected. It supersedes older statements that these GitHub settings and all real Actions execution are pending. npm ownership/bootstrap and trusted-publisher configuration remain unconfirmed; OIDC publishing/provenance are not yet verified. Keep `NPM_RELEASE_ENABLED` unset until npm setup is complete. No GitHub settings or publishing changes made by the agent.

## Latest decision — canonical docs domain

User selected **https://netframe.cybeartech.com**. Updated Astro `site` and both README documentation links. DNS/hosting configuration remains maintainer work; no deployment performed. npm ownership and GitHub release protections are still pending. Release automation remains disabled. This decision supersedes older domain questions below.

## 0.000 Fourth implementation pass (2026-11-14) — resumed interrupted work

**Latest status; supersedes older implementation tables below.** Reviewed the conversation and dirty tree, preserved previous changes, finished the approved decisions. Nothing staged, committed, pushed, published or changed in GitHub settings.

### Decisions implemented

- **Palette option B:** change existing palette values rather than add text-only tokens. Retuned brand/error values in all seven palettes; changed default `on-tertiary`, Renaissance `on-secondary`, and Iron Signal `on-primary` to black. Preserved public token/class names. Default pink is now `#ff69a4`, violet `#bc82ff`. Updated README, theme headers, landing swatches and theming docs. This is an intentional visual change.
- **Corrected an inherited coverage gap:** the partial contrast test excluded `surface-highest`, leaving many pairs below 4.5:1 despite saying “every surface.” Added it and retuned values further. All brand/error/warning text pairs now pass on all seven surface tokens, all seven palettes; filled button states and matching brand `on-*` pairs also pass. Removed all axe exceptions. These targeted checks are not a claim that every possible library state is WCAG-conformant.
- **Identity:** Cybear Technologies remains author/copyright holder; Jackson Chandler added as contributor. Repository links normalized to actual origin `JacksonChandler/NetFrame` in package metadata, docs navigation, CONTRIBUTING and SECURITY. This is not a repository transfer. Docs domain remains unchanged pending clarification.
- **Fonts:** verified five upstream Google Fonts OFL notices are present and shipped. Package now also ships its GPL LICENSE. Font README maps every binary to its licence. Correction to earlier diagnosis: the existing `orbitron-400.woff2` matches Google's variable-font download, SHA-256 `967b3909a7d6a5cc6365e9947775060fca15efdb62bc70099aef2e7d86e10205`; the separate 500 face selects the true 500 weight from that binary. Earlier browser probing showed distinct 400/500 widths. Therefore no new/duplicate 500 binary is required. Direct font-axis inspection was not run (local Python lacks fontTools).
- **Release hardening:** SHA-pinned every action in CI/release. Updated Changesets action to v2.0.0 using its actual v2 input names (checked upstream action.yml). Removed token env vars and setup-node registry configuration; install npm 11.21.1 for OIDC, request provenance, run full check + audit before Changesets. Added `environment: release`. **Safe gate:** release job skips unless repository variable `NPM_RELEASE_ENABLED=true`. Remains disabled until npm ownership, trusted publisher and GitHub protections are configured.
- **Maintainer instructions:** new `RELEASING.md` describes bootstrap publication, required CI check, release environment protection, exact trusted-publisher fields and safe enablement. CONTRIBUTING/AGENTS updated; changeset includes palette, licences and metadata.

### Verification in resumed session

| Check | Result |
| --- | --- |
| `npx -y pnpm@9.15.9 install --frozen-lockfile` | exit 0 |
| Final `npx -y pnpm@9.15.9 run check` | exit 0: Stylelint, Astro check (0 errors/warnings), build-script typecheck, 15 library tests, 27-page build, **73 Chromium tests** |
| axe | All 27 default-theme docs routes pass; no suppressions. Other themes have token-level contrast coverage, not whole-site browser scans. |
| `pnpm audit --audit-level high` | exit 0 |
| CI/release YAML parse | valid (yaml parser); actual Actions/OIDC execution not run |
| `git diff --check` | exit 0 |
| Git state | staged diff empty; handoff remains untracked |

Complete logs: `/tmp/nf-resume-install.log`, `/tmp/nf-resume-final-check.log`, `/tmp/nf-resume-final-audit.log`. Earlier resumed validation also passed before the additional highest-surface fix.

**Still requires maintainer:** choose docs domain (`.cybear.dev` or `.cybear.tech`); create npm account/claim package name and bootstrap as necessary; configure required checks, release environment, trusted publisher and Actions PR permission before enabling release variable. Labels/CodeQL remain unapproved and unchanged. Nested-base-path docs and Firefox/WebKit remain future work. First real GitHub CI/release execution remains unverified.

## 0.00 Third implementation pass (2026-11-14) — linters + toast/input/progress accessibility

Decision 0.5.3 resolved by the user: **Stylelint + `astro check`**.

| Item | Status | Details |
| --- | --- | --- |
| Stylelint | **Completed** | `stylelint` ^18.0.0 + `stylelint-config-standard-scss` ^18.0.0 (library devDeps), `packages/netframe/stylelint.config.mjs`. Baseline run had 236 hits, all formatting/notation (hex length, empty comments/lines, `rgba()` notation, `0px`). Those rules are off so `dist/` stays byte-identical. Kept: `color-hex-length: long`, keyword case (with `currentColor`, `optimizeLegibility`, font custom-property exceptions), vendor prefixes (allow `-webkit-text-size-adjust`, `-webkit-backdrop-filter`), redundant longhands (allow `inset`). Added NetFrame conventions: `nf-` naming for classes, custom properties, keyframes, mixins and `$` variables; `border-radius` only `0`/`var(--nf-radius-*)`; in components/utilities, `color-no-hex` and no `cursor: pointer`. Probe file confirms all 9 rule types fire. 0 violations on `src/`. |
| Real finding from Stylelint | **Completed** | `_avatar.scss` used `var(--nf-color-warning, #fca311)`: hard-coded hex, token never defined. Added `--nf-color-warning: #fca311` to `tokens/_colors.scss` and dropped the fallback. Rendering is unchanged in all palettes (no theme previously defined it). Themes can now override it. In changeset. |
| `astro check` | **Completed** | `@astrojs/check` ^0.9.12 + docs `@types/node`; docs tsconfig now includes `playwright.config.ts` and `tests/`. Fixed 3 errors: missing module declaration for `@phosphor-icons/web/thin` (`src/env.d.ts`); a `BaseLayout` `description` prop that was incompatible with `exactOptionalPropertyTypes` (pre-existing); possibly-undefined split result in `index.astro` (pre-existing). 14 files, 0 errors. |
| Lint wiring | **Completed** | `lint` scripts: library `stylelint "src/**/*.scss"`, docs `astro check`. Root `pnpm run lint` now runs real checks. Root `check` = lint + typecheck + test + build + browser. CI has a Lint step. |
| Toast | **Completed** | Doc snippet built toasts with `innerHTML` + `${title}/${message}`, an **HTML-injection risk** for copy-pasters rendering user/server text. Rewritten with `textContent`/DOM nodes. Error toasts get `role="alert"`; the region stays `aria-live="polite"` (`role="status"` rejected: implicit `aria-atomic` would re-announce every toast). Pause on hover/focus (WCAG 2.2.1). Fallback removal when animations are disabled. Tests: injection rendered as text, alert role, pause/resume, dismiss without animations. HEAD's snippet fails all four. |
| Input | **Completed** | Every docs example had an unassociated `<label>` (no `for`/`id`) and a visual-only error. Added `for`/`id`, `aria-describedby`, `aria-invalid="true"` + guidance. CSS (additive): `.nf-input/.nf-select/.nf-textarea[aria-invalid='true']` share the `-error` styling. Test compares computed border colours. |
| Progress | **Completed** | No progress example exposed state to assistive tech. Added `role="progressbar"`, `aria-valuenow/min/max`, `aria-label` (indeterminate: no valuenow), ring SVG `aria-hidden`, plus guidance. Test: indeterminate bar stays inside its track with `prefers-reduced-motion: reduce`. |
| axe scan | **Completed** | `@axe-core/playwright` ^4.14.0; `tests/a11y.spec.ts` runs WCAG 2.0/2.1 A+AA on every built page. Found and fixed: (1) all `ComponentDemo` code `<pre>`s were keyboard-unscrollable (`scrollable-region-focusable`, 21 pages) → `tabindex="0"` + `aria-label`; (2) MDX wrapped multi-line button text in `<p>`, so the text took base paragraph colour (light on green, dropdown/accordion/badge demos) → kept inline content on one line; (3) docs-only colours: landing swatch labels (now `on-*` tokens), TokenTable names (tertiary → text), landing VT323 sample (tertiary → secondary, large text). **Pinned known library issues** (palette decision, §0.5.1): brand colours as text on dark surfaces, i.e. `.nf-avatar-secondary/-tertiary` initials (4.46 / 2.64:1) and `.nf-label` (secondary, 4.46:1). Any other violation fails. |
| Test stability | **Completed** | Toast pause test raced its 400 ms timer under parallel load; it now pauses synchronously. 3 consecutive full runs: 72/72. |

Validation (clean `node_modules`, pnpm 9.15.9): `pnpm install --frozen-lockfile` 0; `pnpm run check` 0: lint (Stylelint 0 problems, astro check 14 files 0 errors), typecheck, 13/13 node tests, 27 pages, **72/72 Playwright** (27 smoke + 27 axe + 18 behaviour/snippet); `pnpm audit --audit-level high` 0; ci.yml parses. The library CSS delta for this pass is exactly: new `--nf-color-warning`, avatar fallback removed, `[aria-invalid=true]` added to the error selectors.

Note: one incremental `pnpm add` left `@emnapi/core` unlinked (astro check crashed: "Cannot find package '@emnapi/core'"). A clean frozen install links it; the lockfile was already correct. CI always installs fresh.

**Palette decision (§0.5.1) now covers:** theme button pairs (iron-signal, neon-80s) **and** brand-colour text on dark surfaces in the default palette (tertiary #7700ff as text is 2.6:1; secondary #ff0066 is 4.46:1, used by `.nf-label` and avatar initials). A likely low-churn option is a lighter `*-text`/`-dim` token for text use, but it needs design sign-off.

**Remaining:** palette decision; canonical repo/domain; font licences/Orbitron 500; release hardening/provenance/SHA pins; Dependabot labels + CodeQL; nested base-path hosting; Firefox/WebKit projects; first real GitHub CI run. **Next recommended batch:** nested base-path hosting support (the docs use root-relative `/netframe.css`, `/fonts`, links) plus Firefox/WebKit Playwright projects in a nightly workflow. Both are independent of pending decisions.

## 0.0 Second implementation pass (2026-11-14) — browser suite + agent guidance

| Item | Status | Details |
| --- | --- | --- |
| Automated browser suite (0.6 next batch) | **Completed** | `@playwright/test` ^1.65.1 (docs devDependency; Chromium headless shell). `apps/docs/playwright.config.ts` runs against `astro preview`. `tests/site.spec.ts`: every built route (discovered from `dist/`, 27 pages incl. all 20 component pages) loads with no console/page errors, no HTTP ≥400, **no external requests**; library + Phosphor fonts load; theme persists / rejects unknown values / works with throwing `localStorage`; copy button success (reads clipboard) and failure/reset. `tests/examples.spec.ts` extracts the **actual** `## JavaScript` snippets from dropdown/tabs/accordion/modal MDX and runs them on built CSS: dropdown open/Arrow/Escape/toggle/outside-click, tabs roving focus + disabled, accordion inert/height, modal Escape-guard/inert/focus-wrap/restore, tooltip keyboard focus, button hover colours. **39/39 pass.** Mutation check: HEAD's dropdown snippet fails (`toBeHidden`). |
| New finding fixed | **Completed** | Avatar docs demo hot-linked `https://i.pravatar.cc/80` (third-party request on every visit). Replaced with local `apps/docs/public/avatar-demo.svg` in demo and code sample. Caught by `site.spec.ts`. |
| CI | **Completed (unverified on GitHub)** | `ci.yml`: install Chromium with deps, `test:browser`, upload `playwright-report` on failure (`actions/upload-artifact@v4`, new action reference). Root `test:browser`; root `check` now = typecheck + library tests + build + browser tests. `.gitignore`: `test-results/`, `playwright-report/`. |
| Phase 7 `AGENTS.md` | **Completed** | New root `AGENTS.md` (untracked, unstaged): mission/public-API rules, layout, generated paths, toolchain pin and pnpm-major caveat, command table, lint-is-a-no-op note, CSS conventions (tokens, foreground pairing, helper-mixin location, barrel order), docs-example rules, package contract, release rules, pointer that ignored `AGENT.md` is stale and not approved scope. Linked from `CONTRIBUTING.md`. No skills or machine-readable metadata added: no demonstrated need yet. |

Validation this pass: `pnpm install --frozen-lockfile` 0; `pnpm run check` 0 (13/13 node tests, 27 pages, 39/39 Playwright); `pnpm audit --audit-level high` 0 ("No known vulnerabilities"); ci.yml parses. Not verified: first GitHub Actions run (Chromium `--with-deps` on ubuntu, `packageManager` pickup by action-setup v4).

Remaining after this pass: decisions in 0.5 (theme contrast values, canonical repo/domain, linter + `astro check`, font licenses/Orbitron 500, release hardening/provenance); toast/input/progress a11y review; nested base-path hosting check; Firefox/WebKit projects; type-checking `apps/docs/tests` + `.astro` scripts (needs `@astrojs/check`/docs `@types/node` decision); Dependabot labels + CodeQL baseline (GitHub settings). **Next recommended batch:** once a linter is chosen, add Stylelint (SCSS) + `astro check` with a baseline that changes no CSS output; otherwise do the toast/input/progress accessibility review with new example tests.

## 0.1 Status by finding

| ID | Status | What was done / evidence |
| --- | --- | --- |
| S1 security | **Completed (pending CI confirmation)** | Astro 6.1.8 → 7.4.12, @astrojs/mdx 5.0.3 → 8.1.6, upgraded together because MDX 8 peers Astro ^7.2.10. Library dev tools stayed in-major: postcss 8.5.33, autoprefixer 10.6.2, sass 1.108.2, tsx 4.23.15, cssnano 7.1.9. Changesets CLI 2.31.1 (stayed on 2.x). Then a targeted in-range transitive refresh: `pnpm update -r --depth Infinity js-yaml browserslist immutable baseline-browser-mapping postcss-selector-parser`. No overrides, no forced majors. `pnpm audit`: 58 → **0** ("No known vulnerabilities found", exit 0). Docs hosting mode is still unverified, but the affected versions are gone. |
| C1 exports | **Completed** | Additive `exports` in `packages/netframe/package.json`: `default` added to `.`, `./min`, `./themes`, `./themes/min`; new `./dist/*` (keeps the README's `netframe/dist/netframe.css` working), `./fonts/*`, `./package.json`. Existing `style`/`sass` targets and their **order** are unchanged. Order decides which target a resolver that supports both conditions picks, so Sass `pkg:netframe` still gets compiled CSS as before. Test: `documented and existing import specifiers resolve to built files`. |
| C2 fonts | **Completed** | `scripts/build.ts` rewrites `../fonts/` → `./fonts/` in compiled `dist/*.css` only (PostCSS plugin `netframe-rewrite-font-urls`). Raw SCSS keeps `../fonts`, which is correct relative to `dist/scss/base/`. New opt-in `$nf-font-path: '../fonts' !default` in `src/base/_fonts.scss` lets Sass consumers relocate fonts; default output is unchanged. This also fixes the documented unpkg CDN link: fonts now resolve to `/netframe/dist/fonts/`. Tests: url() target check, Sass consumer test. |
| C3 runtime | **Completed** | `.nvmrc` 20 → 22; root `engines.node` → `>=22.23.4` (the Astro 7.4.12 / MDX 8.1.6 floor in the lockfile); release workflow Node 20 → 22. The library has no `engines`, so CSS consumers are unaffected. |
| C4 dropdown | **Completed** | The `dropdown.mdx` snippet writes literal `aria-hidden="true"/"false"`. It used `toggleAttribute`, which never produced `"true"`. Also adds Arrow/Escape handling, and outside-click closes only for clicks outside the dropdown. Browser-verified (see 0.3). |
| C5 button colours | **Completed for component logic; theme values deferred** | `_button.scss`: primary hover sets `on-secondary`, secondary hover sets `on-tertiary`, danger hover sets `--nf-color-text` (every palette's error container is dark). Default secondary hover 3.2 → 6.5:1, danger hover <2 → 7.2:1. Remaining sub-4.5 pairs come from theme **token values**, which is a product decision (see 0.5): iron-signal primary 4.00, iron-signal danger 3.41, neon-80s secondary:hover 3.13. They are pinned in `test/css.test.mjs` so they cannot get worse and any new failure is caught. |
| Q1 gates | **Partially completed** | New `packages/netframe/test/*.test.mjs` (node:test, no new test deps), 13 tests: exports, condition order, zero runtime deps, font URLs, source maps, stale-file removal, `npm pack --dry-run` contents, Sass `pkg:` consumption + `$nf-font-path`, undefined tokens, theme set, button pairing + contrast, tooltip focus-within, dropdown hiding. A `typecheck` script plus `@types/node` and `"types": ["node"]` fixed the previously failing no-emit check. Root `typecheck`/`test`/`check` scripts added. **Not done:** linter (see 0.4), `astro check`. Browser suite done in 0.0. |
| R1 release | **Partially completed** | Release concurrency no longer cancels in-progress runs. `pnpm release` now runs typecheck + library tests (which build `dist/`) before `changeset publish`. **Not done:** exact-commit CI gating via required checks/environments, trusted publishing/provenance, action SHA pinning. These need repo settings / maintainer access. |
| R2 Changesets | **Completed** | Removed the `.changeset/*.md` ignore. Added `.changeset/fix-package-contract.md` (netframe patch → 0.1.1; `changeset status` confirms). Side effect: the pre-existing `.changeset/README.md` now shows as untracked. That is intended; it was left unstaged. |
| B1 build | **Completed** | Staged output with an atomic swap of `dist/`, so stale files are removed. The Sass map is chained into PostCSS, with sources rewritten to shipped `scss/…` paths (no machine paths). The watcher is debounced and serialized, and reacts to any file under `src/` (fonts, deletes). Before any source edit, the toolchain upgrade produced **byte-identical** `netframe.css` and `netframe.min.css`. |
| A1 examples | **Completed for tabs/modal/accordion/tooltip** | Tabs: roving tabindex, Arrow/Home/End, disabled guard. Modal: open-state guard (Escape no longer steals focus when closed), `inert` background, Tab wrap. Accordion: `inert` on collapsed panels, height released to `auto` after expanding, initial-open fix. Tooltip: additive `:focus-within` selectors in `_tooltip.scss`. All browser-verified. Toast/input/progress review not done. |
| D1 docs assets | **Completed** | `apps/docs/scripts/sync-netframe.mjs` plus a `netframe-assets` integration in `astro.config.ts` copies the built package (resolved through its public exports) into `public/` on `astro dev`/`astro build`. It re-copies whenever the library watcher swaps `dist/`. Manual `cp` steps removed from README. Tracked `public/` copies kept; they now equal the build output. |
| D2 robustness | **Completed** | New `apps/docs/src/scripts/theme.ts` (allowlist + try/catch), shared by `DocsLayout.astro` and `index.astro`, which removes the duplicated theme lists. The `BaseLayout.astro` inline pre-paint script is guarded and pattern-checked. `ComponentDemo.astro`: removed the unused `escaped`, handled clipboard failure ("COPY FAILED"), added a `role="status"` live region, no `innerHTML`; repeated clicks reset correctly. |
| D3 CDN script | **Completed** | Removed the unpkg `<script>`; `@phosphor-icons/web` (^2.1.1, resolved 2.1.2) is bundled via `import '@phosphor-icons/web/thin'`. Browser check: zero external requests on a docs page. The `getting-started.mdx` CDN line is a consumer code sample and was left. |
| M1 metadata | **Blocked — decision** | Canonical GitHub owner (JacksonChandler / CybearTechnologies / KumaCommunity / "Cybear Technologies") and docs domain (`.cybear.dev` vs `.cybear.tech`) not chosen. Partly done: README/CONTRIBUTING Node/pnpm/Astro/theme-count text corrected; button page "Four variants" → "Five"; anchor guidance no longer suggests `role="button"` on links. |
| L1 legal | **Deferred — needs provenance** | The font comment now lists all five OFL families. OFL license texts not added; they need verified upstream copies. Orbitron 500 still maps to the 400 file, which needs a binary/weight decision. |
| G1 automation | **Partially completed** | `dependabot.yml` consolidated to one root npm entry. Evidence: root-entry PR #85 updated the `apps/docs` manifest **and** the lockfile, while subdirectory PRs #84/#83/#77/#66/#64 were manifest-only and failed CI. Groups: `astro` (all update types, so Astro+MDX majors move together), `dev-tooling` (minor/patch), `changesets`. CI: `pnpm/action-setup` now reads `packageManager` (`pnpm@9.15.9`) instead of `version: 9`; added typecheck, library tests, and `pnpm audit --audit-level high`. **Not done:** create the missing `dependencies`/`docs`/`library`/`ci` labels (GitHub-side), CodeQL baseline. |

## 0.2 Dependabot PR status after this pass (do not close until merged and CI-green)

| PRs | Now |
| --- | --- |
| #85, #84, #83, #82 (Astro 7.1.x), #80, #77 (MDX 7) | Superseded by Astro 7.4.12 + MDX 8.1.6 in this working tree |
| #68, #66, #64, #55, #48 (library tooling) | Superseded (postcss 8.5.33, autoprefixer 10.6.2, sass 1.108.2, tsx 4.23.15) |
| #78 (Changesets CLI 2.31.1) | Superseded (same version) |
| #54 (cssnano 8) | Deferred: cssnano 7.1.9 with refreshed transitive deps audits clean, so the major isn't needed for security |
| #73 (TypeScript 7, docs only) | Deferred: it would split compiler majors across the workspace |
| #36 (changelog-github 0.7) | Deferred: pre-1.0 minor; validate with a version dry run |
| #76, #62, #59, #4 (actions majors) | Still open. **#4 interacts with this change**: CI now relies on action-setup reading `packageManager`, so verify v4 behaviour in the first CI run before merging #4 |

## 0.3 Validation performed in this pass

All runs used pnpm 9.15.9 (`npx -y pnpm@9.15.9`, matching CI's major and the new `packageManager` pin) on local Node 26.13.1.

| Check | Result |
| --- | --- |
| Baseline before changes: frozen install, library build, docs build | exit 0 / 0 / 0, 27 pages |
| `pnpm install --frozen-lockfile` after changes | exit 0 |
| `pnpm audit` / `pnpm audit --audit-level high` | exit 0, "No known vulnerabilities found" (was 58: 1 critical, 29 high) |
| `pnpm run check` (typecheck + library tests + library & docs build) | exit 0; 13/13 tests pass; 27 docs pages |
| `pnpm --filter netframe run typecheck` | exit 0 (previously TS2591/TS2339/TS2584/TS7006) |
| Mutation check: CSS tests against the pre-fix `netframe.css` | 3 tests fail as expected (button pairing, contrast, tooltip) |
| `changeset status --verbose` | netframe → 0.1.1 from the new changeset |
| YAML parse of ci.yml / release.yml / dependabot.yml | no errors |
| Library `--watch`: 6 rapid writes, then delete | 3 builds total, final content correct, deleted file removed from `dist/scss`, no staging dirs left, 0 errors |
| Docs sync `--watch` across two library rebuilds | re-copied each time |
| Browser (playwright-cli, Chromium) on a fixture running the **actual MDX snippets** + built CSS | Dropdown: closed = `display:none`; opening focuses the first item; ArrowDown skips disabled; Escape closes and restores focus; the trigger toggles it closed. Tabs: ArrowRight/End/wrap skip disabled; roving tabindex; panels toggle; disabled click ignored. Accordion: collapsed = inert/0px, expanded = `auto`, re-collapse inert. Modal: Escape when closed keeps focus; opening inerts the page; Tab/Shift+Tab wrap; Escape closes, restores focus and un-inerts. Tooltip opacity 1 on child focus. Secondary hover = violet bg + white text |
| Browser on built docs (`astro preview`) | No external requests; fonts load from `/fonts/`, icons from `/_astro/`; theme persists across reload; invalid stored value ignored; localStorage throwing → no page errors and the theme still applies; clipboard rejection → "COPY FAILED"/"Copy failed", then resets to "COPY"; 0 console errors |

The browser checks were run interactively and are **not** committed as an automated suite.

## 0.4 Corrections discovered while implementing

- **Lint:** under the pinned pnpm 9, `pnpm run lint` exits **0** with "None of the selected packages has a lint script", a silent no-op. The earlier exit 1 came from pnpm 12. There is still no linter, so green lint means nothing yet.
- **Documented Sass usage was broken (new finding):** `@use 'netframe/scss/netframe'` fails ("Can't find stylesheet to import") because the files live under `dist/scss`. `pkg:netframe/scss/...` with Sass's Node package importer works. `getting-started.mdx` now documents `pkg:` plus the font path.
- **No overrides were needed:** every advisory was fixable within existing majors except Astro/MDX, whose fix floor is above 7.2.8 anyway.
- **Recovery from the audit-pass incident:** pnpm 12 had relinked `node_modules` (store v11), which pnpm 9 refuses (`ERR_PNPM_UNEXPECTED_STORE`). The three generated `node_modules` directories were deleted and reinstalled from the frozen lockfile with pnpm 9.15.9. No tracked files were involved.
- **Phosphor version:** `^2.1.1` resolved to 2.1.2 (the CDN pinned 2.1.1). Icons render (checked), but this is a patch bump.

## 0.5 Decisions and maintainer prerequisites — current

Palette, identity, domain (`netframe.cybeartech.com`), linters, fonts and version (**0.2.0**) are resolved. GitHub protections and CodeQL are confirmed by the maintainer. npm bootstrap/trusted-publisher setup and first automated release verification remain pending. See **Current remaining checklist** above.

## 0.6 Remaining work — current

Use **Current remaining checklist — release 0.2.0** above as the source of truth. Earlier implementation entries and audit sections are historical evidence, not additional unfinished requirements.

# 1. Executive assessment and mission to preserve

> Audit text below (sections 1–9) is from the audit pass and is kept for rationale. Current status is in section 0.

**Audit date:** 2026-11-14 UTC, approximately 21:16–21:28. **Repository:** `/Users/jacksonchandler/Documents/Projects/NetFrame`; origin https://github.com/JacksonChandler/NetFrame; HEAD `88d3ea01a371361cd1c13037fd558df0e5d3f4f5`, main. Network observations below are snapshots on this date, not permanent upgrade targets.

NetFrame is a GPL-3.0-only, framework-independent **cyberpunk CSS UI kit**: 20 components, CSS custom-property tokens, six alternate themes plus default, Sass source, self-hosted fonts, hard edges and neon/CRT effects. Preserve existing selectors, tokens, Sass entry points, documented import intentions, design identity, and consumer-owned behavior. Astro is documentation infrastructure, not a consumer dependency. There is no public JavaScript component API to convert to React, no need for CJS/ESM runtime bundles, and no evidence justifying a utility-framework rewrite.

**Most urgent:** affected build/docs dependencies; broken documented exports and distributed font paths; an existing Node engine mismatch in the release workflow; and concrete interaction-example defects. Fix these with regression tests, not broad modernization for its own sake. Keep compatibility aliases and raw-Sass paths while adding reliable package validation. Introduce real lint/type/package/browser gates, then harden release orchestration and publish durable agent guidance.

**Constraint incident — do not mistake this for a fully read-only run:** the intended no-emit check `pnpm exec tsc --noEmit -p packages/netframe/tsconfig.json` unexpectedly invoked pnpm 12's dependency verification/install before execution. It downloaded packages and changed ignored `node_modules`; output reported `+467 -70`, TypeScript 6.0.2 → 6.0.3, then `ERR_PNPM_IGNORED_BUILDS` for watcher/esbuild/sharp scripts. This violates the request's no-install/only-plan-change constraint. It was disclosed during the audit. No speculative rollback was attempted because it could destroy pre-existing local dependency state. Tracked diff and staged diff remained empty after the incident; the lockfile was not changed. The plan is the only intentionally edited source/document file, but it is **not accurate to claim the plan was the only filesystem change**. See §9 for verification and recovery limits.

# 2. Architecture, tooling, and agent-readiness inventory

## 2.1 Initial state and available prior evidence

Before investigation, `git status --porcelain=v1` showed only:

```text
?? .playwright-cli/
?? .serena/
?? MODERNIZATION-HANDOFF.md
```

No tracked edits or staged changes were present. `MODERNIZATION-HANDOFF.md` was the unique existing root plan; `PROJECT_IMPROVEMENT_PLAN.md` was absent. `git ls-files --error-unmatch MODERNIZATION-HANDOFF.md` returned 1 before editing. No Git tracking/ignore changes were made. The existing plan was read in full and rewritten in place; no duplicate plan was created.

Applicable global instructions were read at `/Users/jacksonchandler/.pi/agent/AGENTS.md`; local ignored `AGENT.md` was inspected as existing context, with the user's audit-only scope overriding its build/feature-phase directions. No conventional tracked repository `AGENTS.md` or project `SKILL.md` was found. No Serena results were used; its active project was therefore not assumed.

Available historical material: the prior plan, visible conversation/tool outputs including the earlier attempt, `/tmp/nf-audit.json`, `/tmp/netframe-prs.json`, `/tmp/netframe-pr-files.json`, and `/tmp/netframe-lint.log`. These files were read, not overwritten. Their audit counts and PR numbers agree with the earlier plan. Missing: a separate qwen3.8 report beyond visible history, any inaccessible conversations/private reasoning, previous full clean-install/build/browser logs, and a durable prior package tarball. None is assumed to exist or to have passed.

## 2.2 Repository inventory

| Area | Current evidence | Contract / concern |
| --- | --- | --- |
| Root workspace | `package.json:1–25`, `pnpm-workspace.yaml:1–3`, lockfile v9 | Private pnpm monorepo; `packages/*`, `apps/*`; no orchestrator needed |
| Library | `packages/netframe/package.json` v0.1.0 | No dependencies or peerDependencies; dev-only Sass/PostCSS/optimizer/tsx/TypeScript |
| Public source | `packages/netframe/src/netframe.scss:12–16` forwards tokens → base → mixins → components → utilities | Class/token/Sass API and global reset are part of compatibility surface |
| Source areas | tokens, base, mixins, components, utilities, themes, fonts | 20 components, four utility groups, six theme override files; seven palettes, not seven alternate theme files |
| Build | `scripts/build.ts::buildEntry`, `build`, `copyDirSync`, `watch` | Expanded/minified main and themes CSS, maps, raw SCSS, fonts; writes dist; never run during this audit |
| Documentation | `apps/docs`: Astro 6.1.8 / MDX 5.0.3 locked; layouts/components and MDX pages | Workspace link exists but BaseLayout serves manually copied public CSS; source changes need manual sync |
| Distribution | exports `.`, `./min`, `./themes`, `./themes/min`, `./scss/*`; `main` CSS; `type: module`; files dist/README | Conditions style/sass only; documented dist CSS subpaths absent; no public JS types needed |
| Root scripts | build/dev/lint/clean/changeset/version-packages/release | No root test/typecheck/format script. Child lint scripts absent; actual lint fails |
| Type configuration | strict root config; library includes scripts; docs Bundler resolution; no direct @types/node | tsx transpilation is not type checking; no-emit check fails (§9) |
| CI | `.github/workflows/ci.yml` | Node 22, pnpm 9, frozen install, build library/docs only; no assertion suite |
| Release | `.github/workflows/release.yml`, `.changeset/config.json` | Push to main independently runs Changesets with token publish; Node 20, cancel-in-progress, write permissions |
| Versions | `.nvmrc` 20; root engines Node >=20.0.0 / pnpm >=9; no packageManager pin | Already incompatible with locked Astro/MDX >=22.12.0, not merely future-upgrade risk |
| Local environment | Node 26.13.1, pnpm 12.18.0, npm 11.20.0; gh absent | Does not reproduce CI/release support; pnpm script execution had unexpected install behavior |
| Existing outputs | ignored dist; tracked `apps/docs/public` CSS and seven fonts | Existing main/themes CSS equal dist copies now, but that is not proof they were built from current source |
| Legal/docs | root GPL license; package license declaration; no tracked font licenses found | Tarball contents and font provenance require validation, not a legal conclusion |

## 2.3 Agent context and friction

- **Ignored `AGENT.md` (~39 KB):** useful layout/naming guidance mixed with a mandatory 12-phase feature backlog; stale Astro 4, wrong helper-mixin ownership, manual synchronization, and false claim that missing CSS variables cause Sass failure (`:647`). Its no-gradients/no-soft-shadows absolutes conflict with current CRT/glow effects; contributor palette also differs from tokens. Do not copy it wholesale into shared instructions.
- **Ignored `.claude/settings*.json`:** one-off downloads/permissions and absolute user paths, not portable skills. Do not commit personal permissions.
- **Untracked `.serena/project.yml`:** project name NetFrame, Astro-only language server, no initial shared prompt. Cache/local config/memories are not source authority. Confirm active project if later using Serena; add SCSS support only when needed and supported.
- **`.playwright-cli/` snapshot, `.playwright/` directory:** not a configured automated suite. Existing browser artifacts prove neither test coverage nor passing behavior.
- **No shared agent entry point or skills found in tracked files.** Recommend a short tracked `AGENTS.md` linking stable contribution/testing/release docs. Separate normative behavior from backlog; list true read-only checks and pnpm execution caveats.
- **Concrete downstream-agent need:** current imports, font assets and interactive examples are unreliable. Prioritize executable consumer examples and class/token/behavior documentation over speculative metadata. Only generate machine-readable manifests or `llms.txt` if real downstream tasks show discoverability gaps and a source-of-truth generator/test prevents drift. No MCP server or vendor-specific skill requirement.

# 3. Prioritized findings

Severity refers to project risk, not an automatic CVSS/exploitability claim. Confidence is high for source facts; exposure and UI outcomes not exercised in a browser remain explicitly bounded.

| ID / priority | Severity / confidence | Evidence | Impact and recommended action |
| --- | --- | --- | --- |
| S1 — urgent triage | Critical advisory; high affected-version confidence, exposure unverified | Fresh pnpm audit exit 1: 58 entries, including Astro AVIF RCE; lock Astro 6.1.8 | Determine deployed mode/reachable image/dev endpoints, patch owning chains; do not equate affected package with demonstrated public RCE (§4) |
| C1 — urgent correctness | High / high | Library exports map vs both README imports; Node resolver returns ERR_PACKAGE_PATH_NOT_EXPORTED | Documented installation path fails strict resolution; add compatibility exports and consumer tests, do not delete old paths |
| C2 — urgent correctness | High / high | `base/_fonts.scss` URLs; `build.ts:97–100`; in-memory compiled URLs resolve to nonexistent package-root fonts | Fonts beside CSS are not actually addressed correctly; repair compiled asset layout without breaking Sass relative paths |
| C3 — urgent workflow | High / high | Lock Astro/MDX engines >=22.12.0; release Node 20; root claims >=20 | Release build uses unsupported runtime; align verified contributor/CI/release toolchain before dependency majors |
| C4 — correctness/a11y | High / high source confidence | Dropdown MDX `:86` uses toggleAttribute on aria-hidden while SCSS matches literal 'true' | Empty attribute/removal never hides on trigger close; replace with explicit synchronized values; test open/close/outside/Escape/keyboard |
| C5 — existing readability | High / high source, browser validation pending | Button hover background changes without corresponding foreground changes; default tertiary #7700ff; danger dark container | Potential unreadable text in common states; test and fix foreground/background semantic pairs for all palettes; do not change on-error globally blindly |
| Q1 — missing gates | Medium-high / high | No test/lint config; CI only builds; actual no-emit emits TS2591/TS2339/TS2584/TS7006 | Defects ship unnoticed; introduce narrow package/static/behavior assertions before broad refactors |
| R1 — release safety | High / high source confidence; deployment settings unknown | Separate CI/release push workflows; release cancellation enabled; token publish | Publish is not explicitly dependent on full CI; serialize noncancellable publish, gate exact commit, verify ownership/provenance |
| R2 — versioning | Medium-high / high | `.gitignore:36` excludes `.changeset/*.md`; only config tracked | Normal contribution flow omits new release notes; repair ignore rule during implementation only; validate version PR |
| B1 — build maintenance | Medium / high | `buildEntry` discards Sass map; `copyDirSync` never deletes stale files; asynchronous watch unqueued | Incorrect source maps, possible stale tarball files/write races; confirmed map loses original sources; concurrency not stress-tested |
| A1 — example accessibility | Medium-high / high source confidence | Tabs click-only/disabled not guarded; modal no trap/inert; accordion height-only; tooltip wrapper focus selector | Consumers copying examples inherit incomplete semantics; improve examples/opt-in patterns without adding mandatory runtime |
| D1 — docs source drift | Medium / high | BaseLayout root-relative public assets; manual cp instructions; duplicated preview/code markup | Builds can show stale styles; automate fresh library consumption, validate demo parity and nested base paths |
| D2 — robustness | Medium / high source, execution not browser-tested | Unguarded localStorage in BaseLayout and DocsLayout; clipboard await unhandled | Blocked storage/clipboard errors and stale UI; allowlist stored theme, guard storage and handle copy failures |
| D3 — supply-chain surface | Medium / high | BaseLayout `:23` loads unpkg executable icons | Additional docs-only external execution; prefer pinned local icons or selected SVG, no library runtime dependency |
| M1 — guidance/metadata | Medium / high | Malformed repository URL with spaces; four GitHub identities, two docs domains; stale Astro/Node/design docs | Confusing consumers/agents and release metadata; maintainer chooses canonical identity/domain |
| L1 — legal packaging | Medium / partial | No tracked font licenses; root-only LICENSE; Orbitron 500 maps to 400 binary | Verify upstream notices and actual packed contents; no claim of infringement or missing npm auto-license inclusion yet |
| G1 — automation hygiene | Medium / high for observed PRs | Duplicate Dependabot scopes; failing CI; missing-label comments; neutral CodeQL warnings | Fix automation source of PR noise; do not infer all PR failures share a cause or that neutral CodeQL is clean |

# 4. Dependencies, vulnerabilities, and Dependabot

## 4.1 Locked versus installed versions and consumers

`pnpm-lock.yaml:9–56` matches current manifest specifiers: Changesets CLI 2.30.0, changelog-github 0.6.0, TypeScript 6.0.3; Astro 6.1.8 / MDX 5.0.3; Autoprefixer 10.5.0, cssnano 7.1.7, PostCSS 8.5.12, Sass 1.99.0, tsx 4.21.0. Historical installed versions were older; after the unintended pnpm verification/install, direct package reads show these locked versions. Do not describe that as a clean installation or a successful reproducibility test: pnpm reported ignored-build failure.

**Directness and scope:** Astro and MDX are direct `dependencies` of a private docs application, not dependencies shipped by netframe. PostCSS/Sass/cssnano/tsx are direct library devDependencies; vulnerable parsers/native tools are transitive. Changesets and its YAML chain run in development/release. NetFrame has no runtime or peer dependency section; no framework peer, JS type facade, or runtime dependency is needed. TypeScript repeats across workspace packages; centralization may simplify version alignment but explicit per-package development requirements are not inherently unnecessary. Build tools all have demonstrated uses. Add only required Node typing and justified test tooling, not a speculative dependency purge.

## 4.2 Fresh audit and exposure

On 2026-11-14, `pnpm audit --json` returned **exit 1**, **58 audit entries: 1 critical, 29 high, 21 moderate, 7 low**, metadata 552 dependencies including optional/dev entries. This confirms affected-version findings, not 58 distinct exploits (some advisory IDs have multiple major-version entries). The earlier identical count is historical corroboration, not the basis of the current result. Full parsed evidence was held in tool session memory; terminal excerpts may truncate. No new report file was written to the repository.

| Chain and locked affected version | Current reported fix examples / authority | Reachability and plan |
| --- | --- | --- |
| Astro 6.1.8, direct docs | [AVIF RCE GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2), <7.2.8; later [MDX/script-content XSS](https://github.com/advisories/GHSA-98hj-9722-w3j8), <7.3.2; [node image path issue](https://github.com/advisories/GHSA-r3h5-4585-7x3w), through 7.4.6 | Config has no adapter/output override; static deployment is plausible, but actual hosting and endpoint exposure unknown. No remote payload was sent. Choose patched supported Astro/MDX together; 7.1.x PRs do not suffice |
| PostCSS 8.5.12, library dev and docs Vite transitive | [Path traversal](https://github.com/advisories/GHSA-r28c-9q8g-f849), fix >=8.5.18; [incomplete fix](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp), fix >=8.5.23 | Malicious source-map input/build context matters; current builder passes from, so do not claim every advisory precondition is met. Upgrade all owning chains and test maps |
| sharp 0.34.5, Astro transitive | [librsvg advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w), >=0.35.5; additional libheif/libvips entries | Native/image processing exposure depends on inputs, platform and deployment. Prefer parent upgrade, verify native binaries/build policy |
| devalue 5.7.1, Astro transitive | [Shared-memory serialization](https://github.com/advisories/GHSA-j22f-vq7h-c4qm) and [reviver validation](https://github.com/advisories/GHSA-r9w8-h9r3-54w4); several fixes >=5.9.3 | Server/serialization inputs required; patch owner and record whether relevant feature is used |
| js-yaml 3.14.2 / 4.1.1, Changesets and Astro chains | [Merge-key resource exhaustion](https://github.com/advisories/GHSA-2883-xcg3-v3hh), >=3.15.2 / >=4.3.2 | Untrusted YAML/build input needed; dev/release supply-chain scope still matters. Preserve major compatibility |
| Vite 7.3.2, esbuild 0.27.7, docs/build tooling | [Vite editor/path issue](https://github.com/advisories/GHSA-587h-7wmj-h5pm), Vite >=7.3.7; [esbuild Windows dev-server issue](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr), >=0.28.1 | Mostly dev-server/editor/platform-specific, not shipped CSS execution; keep dev server loopback-only and patch parents |
| SVGO 4.0.1, Astro/cssnano chains | [Script/link bypass](https://github.com/advisories/GHSA-w27v-7q3p-w38r), >=4.1.0 | Affected sanitizer plugin behavior is not proof this build invokes removeScripts as a security boundary. Update owner; never treat SVG optimization as sanitization |
| Browserslist 4.28.2; baseline-browser-mapping | [Memory growth](https://github.com/advisories/GHSA-c83g-rgw3-j3cx), Browserslist >=4.28.7; [mapping termination](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv), >=2.11.0 | Dev/tooling input reachability; update and set intentional browser targets rather than drifting defaults |
| immutable 5.1.5 via Sass; nanoid 3.3.11 via PostCSS | [Immutable DoS](https://github.com/advisories/GHSA-v56q-mh7h-f735), >=5.1.8; [nanoid generator loop](https://github.com/advisories/GHSA-2v37-7h3g-55p8), >=3.3.18 | Requires relevant operations/input; not a CSS runtime dependency |
| source-map-js 1.2.1; selector-parser 7.1.1 | [Indexed-map DoS](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), >=1.2.2; [selector DoS](https://github.com/advisories/GHSA-rj75-hqrm-r3gf), >=7.1.6 | Build parser inputs; patch tooling chains and regression-test compiler/optimizer |
| smol-toml 1.6.1; zod 4.3.6 via Astro | [TOML quadratic parse](https://github.com/advisories/GHSA-r4xh-jqrq-34v2), >=1.9.0; [Zod collection exhaustion](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), >=4.6.6 | Configuration/validation inputs; assess use, update parents |

Fix floors are examples from current audit, not exhaustive safe targets. Refresh all advisories before choosing versions. Prefer same-major patched parents first, framework migration when necessary. Avoid `audit --fix`, forced transitive majors and global ignores. Any temporary exception needs advisory ID, specific lock path, feature/input exposure rationale, owner, expiry and removal issue. Re-audit full workspace; running audit in a subdirectory did not historically isolate it. A CSS-only package does not eliminate release-tool threats.

`SECURITY.md` excludes docs vulnerabilities and dev-only issues categorically; revise this overly broad threat model while retaining private reporting. Confirm private vulnerability reporting and response capacity. No proof of exploitation, compromised package, or leaked secret was found or claimed.

## 4.3 Registry compatibility snapshot

Direct HTTPS npm registry GETs succeeded for packages below on 2026-11-14. This records metadata, not tested upgrade compatibility. No npm install was intentionally requested. New major versions require official migration documentation and peer validation before edits.

| Package | Locked | Latest observed | Selected current metadata / implication |
| --- | --- | --- | --- |
| astro | 6.1.8 | 7.4.12 | >=22.23.4 Node; peer markdown-remark ^7.3.0 |
| @astrojs/mdx | 5.0.3 | 8.1.6 | >=22.23.4 Node; Astro ^7.2.10, markdown-remark ^7.3.0, markdown-satteri ^0.4.0 peers |
| postcss | 8.5.12 | 8.5.33 | Same-major security candidate; transitive copies also matter |
| autoprefixer | 10.5.0 | 10.6.2 | PostCSS ^8.1.0 peer; verify generated browser prefixes |
| cssnano | 7.1.7 | 9.9.0 | Node ^22.22.3 / ^24.15.0 / >=26; PostCSS ^8.5.29 peer; do not make latest-major optimizer a prerequisite absent need |
| sass | 1.99.0 | 1.108.2 | >=20.19.0 Node; check compiler deprecations/CSS diff |
| tsx | 4.21.0 | 4.23.15 | >=18 Node; execution tool only |
| typescript | 6.0.3 | 7.0.2 | >=16.20.0 Node; compiler major can wait for tests unless needed |
| sharp | 0.34.5 transitive | 0.35.5 | >=20.9 Node; update via framework where possible |
| @changesets/cli | 2.30.0 | 3.0.3 | Node ^22.11 / ^24 / >=26; pnpm >=10, npm >=10.9; latest major changes pm/runtime requirements |
| @changesets/changelog-github | 0.6.0 | 1.0.1 | Node ^22.11 / ^24 / >=26; review required repo configuration |

Current, not just latest, Astro 6.1.8 and MDX 5.0.3 declare Node >=22.12.0 in both lockfile and registry. MDX 5 peers Astro ^6; proposed MDX 7.0.3 peers Astro ^7. Updating only one side is incompatible. Raise contributor/workflow floor deliberately with an alternative of retaining supported patched older tooling where available; never impose these build-only requirements on CSS consumers without reason.

Registry GET https://registry.npmjs.org/netframe returned **HTTP 404**. That does not establish name ownership/availability, reservation, a successful release, or an npm takedown. Keep README's availability statement provisional; maintainer must verify access/name before release. Do not rename the public package as part of this audit.

## 4.4 Dependabot PR dispositions — live state and access limits

Live list: **19 open Dependabot PRs**, same numbers as historical report. Current metadata/files/check-runs/combined-status/issue-comments/reviews were requested read-only. Unauthenticated GitHub API reached HTTP 403 rate limit partway through. Nothing was posted or changed. No approvals are implied.

Legend: **F** = current `Build & verify` check failure; **S** = current success; **U** = current check result unavailable. All rows with detailed PR metadata retrieved reported `mergeable: true` against current base SHA (including #68); no textual conflict was reported there. This does not prove merge readiness. For later rows mergeability is unknown. Legacy combined-status `pending` with zero contexts is not an actual pending build; check-runs provide the result. Failure logs/steps were not retrieved, so specific CI failure causes remain unverified.

| PR | Proposed change / files | CI and discussion evidence | Recommendation / prerequisites |
| --- | --- | --- | --- |
| [#85](https://github.com/JacksonChandler/NetFrame/pull/85) | Astro → ^7.1.3, docs manifest + lock | F; neutral CodeQL; missing dependencies label comment; no reviews returned | **Supersede** with patched coordinated Astro/MDX update; current MDX peer mismatch and known audit floors; preserve docs behavior |
| [#84](https://github.com/JacksonChandler/NetFrame/pull/84) | Same Astro bump, manifest only | F; neutral CodeQL; missing dependencies/docs labels; no reviews | **Supersede/group** with #85 replacement; frozen lock consistency required |
| [#83](https://github.com/JacksonChandler/NetFrame/pull/83) | Astro → ^7.1.0, manifest only | F; neutral CodeQL; missing dependencies/docs labels; no reviews | **Supersede**, older overlapping framework target, insufficient patches |
| [#82](https://github.com/JacksonChandler/NetFrame/pull/82) | Astro → ^7.1.0, manifest + lock | F; neutral CodeQL; missing dependencies label; no reviews | **Supersede**, same rationale; inspect replacement locked version, not just caret lower bound |
| [#80](https://github.com/JacksonChandler/NetFrame/pull/80) | MDX → ^7.0.3, manifest + lock | F; neutral CodeQL; missing dependencies label; no reviews | **Group/revise** with Astro migration; MDX 7 requires Astro ^7, current manifest remains ^6 |
| [#78](https://github.com/JacksonChandler/NetFrame/pull/78) | Changesets CLI → ^2.31.1, root + lock | S; neutral CodeQL; missing dependencies label; no reviews | **Revise then merge candidate**: same-major update valuable, but verify resulting YAML advisories and release/version dry run; latest 3 is not automatically necessary |
| [#77](https://github.com/JacksonChandler/NetFrame/pull/77) | MDX → ^7.0.3, manifest only | F; neutral CodeQL; missing dependencies/docs labels; no reviews | **Supersede** with #80 coordinated replacement and lock |
| [#76](https://github.com/JacksonChandler/NetFrame/pull/76) | setup-node 6 → 7, both workflows | S; neutral CodeQL; missing ci/dependencies labels; no reviews | **Revise/merge candidate** after action runtime/runner review, SHA pin and Node floor alignment; green build does not test release |
| [#73](https://github.com/JacksonChandler/NetFrame/pull/73) | docs TypeScript → ^7.0.2, manifest only | F; neutral CodeQL; status/comments/reviews rate-limited | **Defer/group** coordinated compiler alignment, correct lock and establish no-emit/Astro checks first |
| [#68](https://github.com/JacksonChandler/NetFrame/pull/68) | Autoprefixer ^10.5.2, PostCSS ^8.5.16, Sass ^1.101.0, tsx ^4.22.4; manifest + lock | Details/files retrieved; mergeable true / clean; check-runs/comments/reviews 403 | **Revise** coherent tooling batch to currently patched resolved versions; do not call it green from mergeable_state; CSS/package/map regressions required |
| [#66](https://github.com/JacksonChandler/NetFrame/pull/66) | PostCSS → ^8.5.16, manifest only | F; neutral CodeQL; later endpoints 403 | **Supersede** into patched #68 replacement; 8.5.16 itself remains affected; ensure lock resolves beyond all fixes |
| [#64](https://github.com/JacksonChandler/NetFrame/pull/64) | Autoprefixer → ^10.5.2, manifest only | F; neutral CodeQL; later endpoints 403 | **Group/supersede** into tooling replacement, verify browser output and lock |
| [#62](https://github.com/JacksonChandler/NetFrame/pull/62) | cache 5 → 6; two workflows historically | U; details/comments/conflicts 403 | **Defer/revise** pending action runtime/cache compatibility and live CI; historical file list not current validation |
| [#59](https://github.com/JacksonChandler/NetFrame/pull/59) | checkout 6 → 7; two workflows historically | U; details/comments/conflicts 403 | **Defer/revise** pending runner/credential review and exact SHA; do not merge on title alone |
| [#55](https://github.com/JacksonChandler/NetFrame/pull/55) | Sass → ^1.101.0, library manifest historically | U; details/comments/conflicts 403 | **Group** tooling refresh after compiler/CSS/asset checks and authoritative lock |
| [#54](https://github.com/JacksonChandler/NetFrame/pull/54) | cssnano 7 → 8.0.2, manifest historically | U; details/comments/conflicts 403 | **Defer/revise** major optimizer until needed for patched parents or measurable value; compare seven-palette minified behavior |
| [#48](https://github.com/JacksonChandler/NetFrame/pull/48) | tsx → ^4.22.4, manifest historically | U; details/comments/conflicts 403 | **Group** tooling refresh with lock/build execution checks |
| [#36](https://github.com/JacksonChandler/NetFrame/pull/36) | changelog-github 0.6 → 0.7, root + lock historically | U; details/comments/conflicts 403 | **Revise/merge candidate**, coupled with Changesets release-config validation; pre-1.0 minor may break options |
| [#4](https://github.com/JacksonChandler/NetFrame/pull/4) | pnpm/action-setup 4 → 6; both workflows historically | U; details/comments/conflicts 403 | **Revise/defer** until exact pnpm/version/build-policy choice and runner requirements checked; isolated successful CI would not prove new pm behavior |

No GitHub advisory URL was found in inspected PR bodies; do not label these routine version PRs as proven security fixes. Bodies were available from initial list; private Dependabot alerts were not. The audit advisory links above are independent evidence. Accessible issue comments were bot missing-label warnings, not maintainer acceptance; reviews were empty for #85/#84/#83/#82/#80/#78/#77/#76. Inline review comments, full logs and remaining discussions were not inspected after rate limiting.

CodeQL check output repeatedly warns that main's Actions and JavaScript/TypeScript configurations were not found for the PR comparison. **Neutral is not proof of no alerts.** Reconcile default setup/baselines with maintainer access; no local CodeQL workflow was found.

Automation plan: consolidate root-lockfile npm workspace coverage to avoid overlapping root/subdirectory PRs; group compatible Astro/MDX changes, minor/patch CSS tooling, and actions as appropriate; keep breaking majors explicit. Verify current Dependabot workspace behavior before changing config. Create missing configured labels or remove invalid label names (implementation only). Close duplicates only after validated replacements and maintainer approval. Do not auto-merge majors, failing builds or manifest-only lock mismatches.

# 5. Code quality, accessibility, consumption, and documentation

## 5.1 Distribution and public API

**Exports:** `packages/netframe/package.json:16–34` does not expose `./dist/netframe.css` or `./dist/themes.css`, despite both READMEs instructing those imports. A direct Node resolver smoke test from the docs workspace currently returns `ERR_PACKAGE_PATH_NOT_EXPORTED` for those and for root/theme imports under Node's default conditions. This proves an export-contract mismatch, not that every CSS bundler fails: style-aware bundlers may support style/sass conditions. Keep existing entries; add explicit documented CSS/asset compatibility aliases/defaults where appropriate. Test Vite, direct copied CSS, and Sass importers. Do not replace exports wholesale, remove raw Sass subpaths, or claim `main` bypasses exports. Relevant authority: [Node package entry points](https://nodejs.org/api/packages.html#package-entry-points), [Sass package importers](https://sass-lang.com/documentation/at-rules/use/#nodejs-package-importer). Exact importer APIs must be checked against installed versions before implementation; no Context7 API validation was performed here.

**Fonts:** eight @font-face declarations address seven binaries using `../fonts/...`. Relative to `dist/netframe.css`, this resolves to `packages/netframe/fonts`, which does not exist; build copies to `dist/fonts`. The in-memory CSS URL/path check reproduced this mismatch. Ignore data: image URLs in such checks; they are not filesystem assets. Public-root docs copies resolve `../fonts` to site-root `/fonts` by accident and cannot validate the package contract. Raw Sass lives at `dist/scss/base/_fonts.scss` with its own relative asset context: changing the source URL without a strategy can fix CSS and break Sass. Preserve existing raw paths until fixture coverage exists; rewrite compiled paths or provide configurable font base only as an additive, tested option.

**License/assets:** src is copied recursively into dist/scss (including fonts) and fonts copied again to dist/fonts. Do not delete duplicated binaries until import contract is tested. `_fonts.scss` says three typefaces although five are present; Orbitron 500 references the 400 file. Verify font metadata, subsets and required upstream OFL copyright/license text for every family. Root GPL does not replace font notices. Package `files` is dist + README; whether npm auto-includes a root license in this workspace tarball is unverified. No pack operation was run. Require explicit package-level legal assets if needed, tarball allowlist tests, expected files, size budget and no machine paths. Avoid announcing legal violations without provenance review.

**Types/modules:** `type: module` governs build tooling; `main` is CSS. No runtime JS/CJS/ESM function exports or framework peers exist. Do not manufacture `.d.ts` files for a nonexistent JS API or publish script-generated internal declarations under dist/types. Correct development environment typings separately; keep runtime dependency count zero. Validate production CSS survives bundler tree-shaking; `sideEffects` is present, not proven broken.

**Metadata/publication:** package repository/homepage contain spaces; docs link variants include JacksonChandler, KumaCommunity, CybearTechnologies, and `Cybear Technologies`. Astro site uses `.cybear.tech` while READMEs use `.cybear.dev`. Maintainer decides canonical ownership/domain, bugs URL and npm availability. No package rename/license change is authorized. Registry 404 is unresolved, not proof publication rights exist.

## 5.2 Build and Sass

- `buildEntry` compiles with sourceMap true but never passes `sassResult.sourceMap` to PostCSS. In-memory emulation found 36 Sass sources reduced to one PostCSS source `netframe.css`. **Confirmed mapping defect**, not just a missing test. Decide whether to chain original maps or intentionally omit maps; preserve existing files unless a documented migration removes them.
- `copyDirSync` overlays existing dist and never prunes deleted files. A stale-file risk is confirmed by code; no deletion/rebuild test was run. Use a fresh staging directory/atomic replacement or explicit clean build; ensure watcher consumers do not observe missing/partial outputs.
- `watch` runs async full builds from recursive `fs.watch` without queue/debounce and filters only `.scss`. Overlapping builds and ignored font-only updates are source-supported risks, not stress-tested failures. Serialize/coalesce edits and account for rename/delete/font events; test supported platforms.
- Autoprefixer runs independently for full/min output. That is redundant work, not a defect by itself; optimize only if simpler and equivalent. No explicit Browserslist target found; compilation warned caniuse-lite is seven months old. Define modern browser support from actual features and review generated output before refresh. Ignored guide's exact browser floor is **unverified**, not an official compatibility guarantee.
- In-memory compile and PostCSS/optimizer completed with current locked toolchain on local Node 26; this is not the full build, clean install, Node minimum, or published artifact test.
- `_button.scss:49–117`: changing a background to another semantic color must also choose its foreground. Secondary hover reaches tertiary while keeping on-secondary; danger uses on-primary and a dark error-container hover. A foreground correction may intentionally change pixels; test all themes and custom tokens, do not change the palette globally to hide contrast failures.
- `_iron-signal.scss:12` explicitly acknowledges ~4:1 white-on-red, intended for large/bold. Current button font at 16px bold is not WCAG large-text size. Confirm computed contrast/sizes and preserve the theme identity using a state/text-pair fix rather than a redesign. [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) is the acceptance basis.
- Missing `--nf-color-warning` is the only missing library custom-property candidate from a simple compiled reference scan, and it has a working fallback. Do not fabricate success/info tokens or assert Sass failure. A real validator must understand fallback/custom caller tokens.
- `_truncate.scss` owns nf-visually-hidden and nf-flex-center, contrary to agent guide. Correct guidance first; moving public mixins is optional and must preserve forwarding paths. Avoid blanket barrel alphabetization, token renames or numeric-value bans: cascade order, pixels, global reset and intentional effects are compatibility-sensitive.

## 5.3 Interaction and accessibility

New concrete source findings:

1. **Dropdown:** `dropdown.mdx:82–92` toggles aria-hidden via `toggleAttribute('aria-hidden', open ? null : true)`. toggleAttribute sets an empty value or removes the attribute; `_dropdown.scss:62–64` hides only literal `aria-hidden='true'`. A minimal attribute-state reproduction confirmed trigger open and close never produce that value. Use explicit strings/removal and synchronized state; outside-click handler already uses literal true. Add keyboard behavior and one centralized dismissal policy. [MDN toggleAttribute](https://developer.mozilla.org/en-US/docs/Web/API/Element/toggleAttribute) explains force/presence semantics. Do not replace aria-hidden with presence-based CSS, which would also hide aria-hidden='false' consumers.
2. **Tabs:** `tabs.mdx:68–87` implements clicks only, no Arrow/Home/End/roving tabindex and no guard for aria-disabled. Main sample has panel controls, live previews omit them. pointer-events:none is not keyboard disabled behavior. Teach a complete optional controller and truthful previews; keep CSS-only core.
3. **Modal:** `modal.mdx:73–92` focuses/restores trigger and handles Escape/outside click, so previous blanket implication of no focus support was too broad. It lacks trapping/background inertness, and document Escape restores focus even when closed. State-guard handlers, manage background/focus and document expectations. Do not silently swap all existing div markup to native dialog as a breaking requirement.
4. **Accordion:** `accordion.mdx:80–91` collapses via height only; `_accordion.scss` only clips overflow. Hidden interactive descendants may remain keyboard/AT accessible, panels have fixed expanded height and no resize update; preview buttons omit controls while example controller assumes an existing panel. Need real hidden/inert state and robust expansion/resize/reduced motion, without losing existing class API. Browser focus behavior remains untested.
5. **Tooltip:** `_tooltip.scss:18–27` opens on wrapper :focus-visible, while docs wrap a focusable child button in an unfocusable span. Focusing child does not make the wrapper focus-visible. Support :focus-within or target-specific compatible selectors, appropriate description linkage, Escape/persistence and hover/touch behavior. Do not add wrapper tabindex and duplicate tab stops just to trigger CSS.
6. **Focus and motion:** global focus-visible replacement and global prefers-reduced-motion mitigation already exist in `_reset.scss:129–151`. Preserve working behavior. Test forced colors, focus clipping and non-keyboard use rather than duplicating broad rules. Inset rings suppress outline; assess a forced-color fallback. Do not conclude missing support from absence of planned mixins.

Use [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/) for the relevant tab/menu/dialog/accordion patterns and manual keyboard/AT review. Check toast status/live regions, input errors, native disabled controls, progress labels, long content, zoom, RTL and mobile overflow. These are proposed evaluations, not claimed failures across every component. No full accessibility audit or browser tests were run.

## 5.4 Docs reliability and agent usability

- BaseLayout serves `/netframe.css` and `/themes.css`; scripts use root-relative URLs. Choose a deterministic fresh asset pipeline compatible with base-path hosting. Keep tracked copies until replacement works from a fresh clone, then remove only generated duplicates with maintainer approval.
- Theme boot at BaseLayout `:31–35` lacks storage try/catch and accepts arbitrary class tokens, which can throw on whitespace. DocsLayout already removes known theme classes and has a select; earlier recommendation to add theme removal was partly redundant. Guard both storage reads/writes, validate a known theme set, test persistence/first paint. This is not proven XSS.
- ComponentDemo `:12` escaped variable is unused; copy handler `:38–46` lacks rejection/unsupported-browser handling and live status. Constant innerHTML reset is not user-data XSS. Prefer safe static DOM changes for clarity, manage repeated clicks/timeouts, preserve labels and announce success/failure.
- Locally bundle icons or use selected SVGs to avoid executable unpkg dependency in docs. Library self-hosted font claim remains valid in scope; docs are not zero-external-script today.
- Button frontmatter says four variants but shows five; anchor advice overgeneralizes role=button. Links navigating remain links; action controls need native button behavior. Do not teach all classed elements as interchangeable.
- Many ComponentDemo blocks duplicate markup in code and slot; add parity fixtures/tests before introducing a trusted-render abstraction. Never turn arbitrary text into unsanitized live HTML to remove duplication.
- Fix version literal in DocsLayout, stale Astro 4/theme-count prose, contributor palette, canonical links and actual tooling requirements. A concise AGENTS.md should link this canonical information instead of maintaining another sprawling copy.

# 6. Proportionate testing and CI strategy

Implement minimum high-value gates first; do not block urgent security fixes on an ideal all-browser suite. Pure CSS risk is best measured by public import/asset/state coverage, not arbitrary line coverage. Node built-in assertions/test runner can cover package/build helpers; add one browser tool (Playwright) and axe only for demonstrated behavior/a11y checks. No justification for adding React, a UI runtime, multiple competing test runners, or a monorepo orchestrator.

| Risk / finding | First regression assertion | Later coverage / CI placement |
| --- | --- | --- |
| Exports/fonts C1/C2 | Fresh tarball fixture resolves documented CSS/theme imports; browser fetches every font, min and full CSS | Raw Sass package importer + plain copied/static CSS + Vite production fixture; nested base path; required release/PR gate |
| Node floor C3 | Frozen install/build on chosen supported minimum and current LTS | Matrix matches docs, root engines and workflow; gate each PR |
| Dropdown/tabs/modal/tooltip/accordion C4/A1 | Actual copied controller/markup, open/close/keyboard/disabled/focus/hidden states | All interactive components; forced colors, zoom, reduced motion, long labels and mobile; axe plus manual AT |
| Color pairing C5 | Button normal/hover/focus/danger across default and six themes, computed styles/contrast | Stable screenshots with fonts settled/animation paused, reviewed visual diffs; Chromium first, release/nightly Firefox/WebKit |
| Maps/stale output/watch B1 | Source map maps to original SCSS; deleted-source artifact absent after build; rapid edits converge | Temp-output fixture; font rename/change; OS watcher smoke; no writes into source tree in tests |
| Missing validation Q1 | TypeScript no-emit with Node types; Astro-aware check; SCSS lint; simple token/fallback validation | Format checking configured for actual extensions; root commands fail if expected suite absent |
| Security S1 | Full audit output/exit plus advisory-path triage | Gate no unapproved critical/high; lower-severity backlog with expiry; no blanket suppressions |
| Docs D1/D2 | Fresh docs build uses current library; blocked localStorage, clipboard rejection and repeated copy clicks handled | All routes/links/assets, no unexpected third-party executable requests or console errors |
| Release R1/R2 | User-facing Changeset is trackable; version plan/dry run includes library; packed manifest/licenses verified | Exact-commit CI gate, protected publish environment and recovery runbook |

Proposed root script names: lint, format:check, typecheck, test, test:package, test:browser, check. Names not yet implemented. Keep fast static/package checks on all PRs, browser suite narrowed by risk initially, full coverage on release/nightly. Upload complete logs/reports; capture true process status, not a final pipe filter. Security failures must distinguish registry access errors from actual findings.

CI changes: add quality/test/package jobs; align runtime/pm; pin reviewed action SHAs and compatible runner runtime; check default CodeQL setup; do not run untrusted PR code with publish secrets/pull_request_target. Publish must wait for exact commit's required gates. Separate release-PR preparation from privileged publish if useful, and never cancel active irreversible publish. Verify trusted publishing/OIDC/provenance support with selected versions and package ownership before replacing tokens; id-token permission alone does not establish provenance. Authority for implementation review: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), [Dependabot options](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference), [Changesets config](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md). These links are implementation references, not claims that latest configuration APIs were validated during this audit.

# 7. Phased implementation handoff — dependency order

All commands here marked **proposed** require implementation authorization and an isolated checkout/output directory; many install/write files and were deliberately not run. Current audit commands actually executed are in §9. Relative effort: S small localized work; M several related modules/tests; L cross-cutting or migration work. No invented calendar estimates.

## Phase 0 — contain uncertainty and establish a safe baseline (S/M) — STATUS: partially completed (toolchain baseline reproduced with pnpm 9.15.9; hosting/ownership checks blocked on access)

**Problem/outcome:** runtime/dependency state is inconsistent, this audit accidentally changed ignored installs, and deployment exposure is unknown. Establish reproducible baseline before patches.

**Areas:** isolated development environment; manifests/lock; CI/release settings; hosting/npm ownership (no source change needed for evidence).

**Steps:** maintainer decides whether to retain/recreate local node_modules; do not blindly restore stale versions. Inspect package-manager executable/config and automatic verification before running scripts. Select compatible Node LTS and exact pnpm; record minimum >=22.12 for current docs, refresh for target upgrades. Confirm static/SSR deployment and reachable endpoints; preserve audit/PR evidence; refresh rate-limited discussions/checks with authenticated read access. Confirm package name and license/provenance responsibilities.

**Prerequisites:** maintainer access, permission for an isolated install; not a reason to delay urgent exposure containment.

**Acceptance/proposed commands:** in a disposable clone, `pnpm install --frozen-lockfile`, capture exit/status/build policy; `pnpm audit --json`; inspect hosting and public endpoints without attack payloads. No claim these install/build validations passed here. Preserve full logs.

**Compatibility:** build-tool floor change affects contributors, not CSS runtime; document minimum. **Effort:** S/M. If exposure is demonstrated, contain service immediately rather than waiting for all tests.

## Phase 1 — minimal regression harness and environment alignment (M) — STATUS: mostly completed (runtime pin, typecheck, node:test suite, Playwright suite in CI); linter and astro check remain (decision)

**Problem/outcome:** build-only CI misses known consumer/state/type failures. Create small red tests and a reproducible toolchain.

**Areas:** root/child manifests, `.nvmrc`, tsconfigs, `.github/workflows/ci.yml`, new tests/fixtures; concise shared AGENTS.md can start here.

**Steps:** pin packageManager/runtime; add direct @types/node to build-tool type context and `types` configuration as required; ensure docs checks use DOM/Astro types without polluting Node scripts. Add explicit test/check scripts. Create package import/font and dropdown regression fixtures before fixing. Choose Node test runner for pure checks and one browser runner only. Inspect automatic-install policy so check commands do not mutate dependencies unexpectedly.

**Dependencies:** Phase 0 environment decisions; can land alongside urgent patches.

**Acceptance/proposed commands:** `pnpm run typecheck`, `pnpm run lint`, `pnpm run test` once scripts exist; compiler underlying check `node node_modules/typescript/bin/tsc --noEmit -p packages/netframe/tsconfig.json` bypasses pnpm execution hooks (proposed direct form; only pnpm-wrapped version ran here). Tests must run real assertions and capture expected pre-fix failures.

**Compatibility:** no runtime dependencies or emitted internal public types; avoid repo-wide formatting churn. **Effort:** M.

## Phase 2 — security and runtime repair, not indiscriminate latest (M/L) — STATUS: completed locally (audit 0); CI confirmation pending

**Problem/outcome:** current chains include critical/high findings and unsupported release Node. Resolve or explicitly bound every advisory.

**Areas:** all manifests, root lock, `.nvmrc`, workflows, SECURITY.md; Astro config/MDX as migration requires.

**Steps:** (a) compatible same-major PostCSS/parent tooling/Changesets patch batches; (b) coordinated patched Astro/MDX migration with verified Node/peers and official source-to-target guides; (c) resolve native/tool build policy narrowly, not blanket approve-builds; (d) rerun full audit/fixtures after each batch. Track exceptions with owner/expiry; close superseded PRs only after validated replacements. Review YAML paths, selectors/maps, CSS optimizer changes. Defer compiler/optimizer major upgrades unless necessary for patches or validated benefit.

**Dependencies:** Phase 0; minimal regression coverage Phase 1, not the entire later suite. Own root lock edits in one branch at a time.

**Acceptance/proposed commands:** authorized `pnpm install --frozen-lockfile`, `pnpm audit --json`, `pnpm --filter netframe run build`, `pnpm --filter @netframe/docs run build`, new test/typecheck scripts, route smoke. No unapproved critical/high; full list of lower findings; seven-theme CSS diff reviewed. Audit rerun is currently verified exit 1, not acceptance achieved.

**Compatibility:** framework/tool majors affect docs/build; preserve rendered routes/markup and library outputs; default to patched supported older majors if viable. **Effort:** M/L. Review Changed APIs via version-specific official docs/Context7 before editing.

## Phase 3 — package import, font, and legal contract repair (M) — STATUS: partially completed (exports, font URLs, Sass path done; legal texts + metadata blocked on decisions)

**Problem/outcome:** published package would not reliably match documented usage.

**Areas:** library package.json/README, build script, fonts SCSS, asset/license files; root README/getting-started; tests/consumer fixtures.

**Steps:** add existing documented CSS/theme subpath aliases while preserving all exports; verify style/sass/default resolution across consumers. Solve compiled URLs separately from raw-Sass asset contract; retain old paths or migration aliases. Verify font weights/subsets, gather required license/provenance notices. Pack only intended output, include legal files and support direct pack/publish preparation without stale dist. Correct metadata only after canonical owner/domain decision.

**Dependencies:** Phase 1 fixtures; Phase 2 stable toolchain. Legal provenance may start immediately.

**Acceptance/proposed commands:** `pnpm --filter netframe run build`; in isolated approved directory, `npm pack --ignore-scripts` after explicit build, inspect tarball manifest and install tarball into independent fixture, `pnpm run test:package`. Pack commands write tarballs and were not run here. Assert all documented imports, full/min/theme/Sass outputs, fonts and licenses; no access to monorepo sources; no JS/runtime deps; sideEffects production check. Test prepack hook separately if introduced.

**Compatibility:** additive exports preferred; don't replace old subpaths or alter font base for Sass users silently. Behavior fixes need clear release notes/Changeset even at 0.1.0. **Effort:** M.

## Phase 4 — targeted CSS state/build correctness (M) — STATUS: completed for component logic and build; theme token contrast values deferred (decision)

**Problem/outcome:** poor color pairs, source-map loss, stale builds and watch risks.

**Areas:** button/theme tokens as needed, focus/tooltip selectors, build.ts, fixtures.

**Steps:** choose foreground tokens per background/state (add an on-container token only if needed rather than misusing on-error); measure all theme/state contrast including Iron Signal small text. Fix source-map chaining and path normalization. Build into fresh staged output; serialize watcher/coalesce events; handle fonts/rename/delete. Keep CSS order/public names. Tokenize meaningful reusable values, not every pixel. Correct helper documentation before considering refactor.

**Dependencies:** Phases 1–3 as relevant; no need to wait for optional metadata.

**Acceptance/proposed commands:** new `pnpm run test` build/helper cases, `pnpm run test:browser` state/visual/contrast fixtures, `pnpm --filter netframe run build`. Test map sources/original locations, stale deletion, burst edits and final output. In-memory compile/map probe currently passed compilation but confirmed lost map sources; this is not watcher verification.

**Compatibility:** intended visual correction is still consumer-visible; review screenshots, custom theme assumptions, forced-color fallback and selector inventory. Do not remove/reset public CSS wholesale. **Effort:** M.

## Phase 5 — faithful examples, a11y and docs integration (M/L) — STATUS: mostly completed (dropdown/tabs/modal/accordion/tooltip, asset sync, storage/clipboard, local icons); toast/input/progress review and base-path check remain

**Problem/outcome:** copied snippets have concrete state/keyboard defects; docs do not validate library asset freshness.

**Areas:** BaseLayout/DocsLayout, ComponentDemo, affected MDX pages, docs assets/config, fixtures.

**Steps:** repair explicit dropdown state; tabs keyboard/disabled; modal state guard/focus/background; accordion hidden/focus/content sizing; tooltip focus-within/linkage. Preserve CSS-only core and keep optional JS examples documented. Wire docs to fresh library build via one deterministic import/sync pipeline; remove duplicates only after replacement verified. Guard both localStorage paths, reuse known theme removal already present, handle clipboard errors and status. Localize icons; remove unused escaped variable; test markup-code parity. Correct stale links/variant counts/design/toolchain docs.

**Dependencies:** Phase 3 asset layout and Phase 1 fixtures; Phase 2 docs compatibility. Do not migrate every example to a new markup API unless old one remains supported.

**Acceptance/proposed commands:** docs build plus new browser suite; all routes/assets work from a clean approved clone under root and non-root base path; no console errors, no stale CSS/manual cp, keyboard/AT smoke, zoom/mobile/forced-colors/reduced-motion checks; seven-theme state fixtures. Axe is supplemental, not proof of full accessibility.

**Compatibility:** docs markup changes can influence downstream copy/paste; explain optional controllers and ARIA contracts. Keep themes/routes/classes and live demo purpose. **Effort:** M/L.

## Phase 6 — release and automation safeguards (M) — STATUS: partially completed (no-cancel release, checks before publish, Changesets tracking, Dependabot consolidation, CI gates); repo settings/provenance/SHA pins remain

**Problem/outcome:** release can bypass full checks/cancel mid-publish; ignored Changesets and PR noise weaken maintenance.

**Areas:** `.github/workflows/*`, Dependabot config, `.changeset/config.json`, `.gitignore` (implementation only), manifests/release docs, repository labels/settings.

**Steps:** repair Changeset ignore separately from user-local ignores; verify changelog-github repo options for chosen version; require Changesets for consumer changes. Gate publish on exact-commit checks, minimum permissions and protected environment; serialize without cancelling active publish. Review action runtime/runner and SHA pins; trusted publishing/provenance only after ownership/tool support verified. Consolidate workspace dependency updates/labels; resolve CodeQL baseline mismatch; refresh every PR disposition from current CI/discussions before merge. Document recovery/idempotency for partial releases.

**Dependencies:** Phase 0 ownership, Phase 1 commands; integrate Phase 2 runtime repair early. Do not postpone a simple release safeguard until all optional docs work is done.

**Acceptance/proposed commands:** Changesets status/version/publish-preparation dry run in disposable checkout, package gate and workflow review; no real publish during tests. Simulate failed check preventing publish, new push not interrupting active release, trackable release notes, correct version PR/changelog. Verify npm name/access first; registry 404 is not ownership confirmation.

**Compatibility:** deployment process changes can break existing token flows; stage/test with maintainer approval. Use patch/follow-up versions, not deleting releases; do not roll back to known exposed versions without containment. **Effort:** M.

## Phase 7 — durable agent guidance and optional polish (S/M) — STATUS: completed (AGENTS.md); skills/metadata intentionally not added

**Problem/outcome:** ignored local roadmap is the only detailed agent guide; downstream usage is hard to discover.

**Areas:** tracked AGENTS.md, CONTRIBUTING, concise architecture/testing/release docs, package README/examples; optional generated reference.

**Steps:** publish short entry point with mission, supported tools, true read-only vs writing checks, source/generated paths, public compatibility rules, component/theme workflow and test/Changeset checklist. Link canonical data, remove stale duplication only with owner consent; do not delete user-local AGENT.md. Provide complete import/theme/markup/behavior examples. Add at most focused portable component-change or release-review skills only if repeated tasks warrant them; relative paths, bounded permissions, no machine secrets. Generate class/token metadata only from validated source/fixtures and version its schema if adopted.

**Dependencies:** stable commands/contract from earlier phases; basic accurate instructions can start Phase 1.

**Acceptance/proposed validation:** a fresh-clone agent completes a small component/theme change plus applicable tests without ignored files; a downstream agent consumes a packed package using shipped docs alone. Any optional generator must reproduce identical output and validate links/API names. No unneeded new runtime/package dependencies.

**Compatibility:** no product expansion, public renaming or license changes; optional metadata is additive. **Effort:** S/M. Defer new components, broad utility generation, React wrappers, large design rewrites and dashboard/commerce roadmap.

# 8. Comparison with previous findings

Classification applies to substantive claims, not to whether every earlier recommendation should be implemented immediately. Prior validation results below remain historical unless explicitly rerun in §9.

| Previous finding/topic | Classification | Current evidence/correction → recommendation |
| --- | --- | --- |
| CSS-only mission, 20 components, six alternate themes, no runtime deps | Confirmed | Manifests/barrels/source inventory; preserve architecture/API, no runtime rewrite |
| Sound small monorepo/source separation | Confirmed | Two workspace children; retain without orchestrator |
| Tool versions inconsistent/unpinned | Confirmed, expanded | Lock shows current Astro/MDX already require Node >=22.12; release Node20 is concretely unsupported, not hypothetical |
| Older installed versions versus manifest | Outdated after audit incident | Historical node_modules drift was real; unintended pnpm sync now aligns sampled versions but failed build-policy checks; do not claim clean install |
| 58 vulnerabilities / severity counts | Confirmed | Fresh audit returned exact count, exit 1; entries are not distinct exploits |
| Critical Astro package means exposed RCE | Unverified as exposure | Affected range confirmed, hosting/endpoints not; maintain separate reachability triage |
| PostCSS/build-chain vulnerabilities matter despite CSS-only output | Confirmed | Fresh paths include library dev and docs chains; patch owners, no blanket suppression |
| Latest versions snapshot and automatic migration assumptions | Partially confirmed | Same latest values for ten earlier packages; new Changesets latest majors and exact engines/peers added; compatible pair/support still requires migration validation |
| 19 PRs and duplicate scopes | Confirmed | Same live list; file patches show root-lock and manifest-only duplicates |
| PR CI/discussions/conflicts not checked | Outdated/expanded | Current results retrieved for subset, including failures and #78/#76 successes; no conflict for retrieved details; later data rate-limited, not assumed |
| All Astro/MDX independent bumps are acceptable patch path | Incorrect if inferred | Current MDX5 peers Astro6; proposed MDX7 peers Astro7; coordinate; 7.1.x remains affected by later audit entries |
| PostCSS 8.5.16 target is fixed | Incorrect if inferred | Explicit fix floors >8.5.16; caret can resolve later but lock must prove it; revise/supersede |
| #68's exact updates/CI | Partially confirmed | Four exact patches retrieved; mergeable clean but check-runs 403; never equate clean with tested success |
| Missing configured labels / CodeQL baseline | Newly confirmed | Live bot comments and neutral CodeQL warning; repair labels/baseline, no claim clean security scan |
| README dist imports blocked by exports | Confirmed | Current resolver ERR_PACKAGE_PATH_NOT_EXPORTED; bundler-specific behavior still needs consumer fixtures |
| Root/theme style/sass exports fail everywhere | Incorrect if generalized | Node default resolver fails; style-aware tooling can differ. Preserve conditions, add explicit compatibility paths |
| Compiled font URLs wrong | Confirmed | In-memory paths point outside dist/fonts and do not exist; raw-Sass layout must be preserved separately |
| Font licensing missing from actual tarball | Unverified | No tracked notices found, but no pack/legal provenance audit; verify before asserting violation |
| Orbitron500 points to400 / stale three-font comment | Confirmed | `_fonts.scss`; verify binary metadata/weight before changing asset identity |
| Package auto-license inclusion, sideEffects or type exports broken | Unverified | No tarball/tree-shaking test; no public JS types required, no fabricated declarations |
| Invalid repo/homepage URLs, mixed owners/domains | Confirmed | Current manifests/docs/config; owner decides canonical identity, do not rename automatically |
| Publication/initial release status | Unverified, expanded | Current registry netframe GET 404; does not prove name available/owned |
| Manual docs sync and copied-asset drift risk | Confirmed | BaseLayout/public copies/manual cp unchanged; matching current dist files does not prove freshness |
| Source-map chaining omission | Confirmed, strengthened | Current in-memory probe: 36 Sass sources → only netframe.css PostCSS source |
| Build stale files / watcher races/font-only changes | Partially confirmed | Code has no pruning/serialization and SCSS-only watch; actual race/stale-artifact reproduction not run |
| Duplicate Autoprefixer is a defect | Incorrect if generalized | Redundant work only; refactor optional after equivalence test |
| Type checking absent/Node typings likely missing | Confirmed, strengthened | Actual no-emit failed with missing Node types and derivative errors; executed check had unauthorized installation side effect |
| Lint no-op/pass | Incorrect in earliest run; correction confirmed | Fresh recursive lint exit1, missing scripts; filtered historical exit0 misleading |
| Tests passed from recursive no-script command | Incorrect | No test scripts/suite found; do not count no-op as coverage |
| Avatar warning missing token breaks build | Incorrect | Fallback works; current compile succeeds; optional semantic-token consistency only |
| No reduced-motion/focus support | Incorrect | Global reduction and focus-visible rule present; scoped/forced-color browser quality still unverified |
| Hardcoded px/hex count proves bad code | Incorrect | Many intentional effects/border constants; tokenization only for meaningful repeated decisions |
| Button hover semantic pairs/contrast | Confirmed source mismatch; visual/accessibility extent partially confirmed | State colors verified; no browser matrix run; Iron Signal small-text issue newly identified; fix pairs not entire theme identity |
| All interactive docs lack any JS/focus handling | Incorrect if inferred | Dropdown/tabs/modal/accordion snippets exist; modal already focuses/restores and handles Escape, but incomplete semantics remain |
| Dropdown toggle, tooltip child focus, accordion focus leakage, tabs disabled state | Newly confirmed source defects / browser outcomes partly unverified | Concrete selectors/snippets in §5; prioritize actual regression fixtures, no mandatory core runtime |
| Theme switch never removes previous themes | Incorrect as blanket claim | DocsLayout already removes known classes; BaseLayout storage validation/try-catch still missing |
| Theme persistence and clipboard robustness | Confirmed source risks | Unguarded reads/writes and unhandled await; no browser denial test yet |
| Constant innerHTML / arbitrary theme string are proven XSS | Incorrect | No untrusted markup interpolation shown; classify robustness/supply-chain separately |
| External unpkg executable in docs | Confirmed | BaseLayout script; localize without adding library runtime dependency |
| Demo/source duplication and stale button variant count/anchor advice | Confirmed | Current MDX/ComponentDemo; fixture parity + semantic documentation fixes |
| Ignored AGENT.md, Claude paths, untracked Serena/browser artifacts | Confirmed | Git ignore/tracking/source inspection; keep local data untouched, write portable shared guidance later |
| Agent guide mandatory feature phases should drive modernization | Incorrect scope | User requires mission/API preservation; backlog additions deferred |
| Helper ownership/no-gradients guide conflicts | Confirmed | `_truncate.scss` vs AGENT.md; clarify rather than break Sass imports/effects |
| Changeset Markdown ignored | Confirmed | git check-ignore reports .gitignore:36; implementation repair needed |
| CI build-only, release bypass/cancellation/token risks | Confirmed source; external protections unverified | Workflows unchanged, settings not read; exact-commit gates/provenance plan retained |
| OIDC/provenance already enabled by id-token permission | Unverified/unsupported | Token env still used; verify actual trusted publisher/tool support before any claim |
| Broad test matrix, skills and machine metadata mandatory immediately | Partially confirmed recommendation, reduced scope | Concrete package/interaction gaps justify small suite and concise instructions; large metadata/skill additions optional and demand-driven |

# 9. Checks, limitations, unresolved decisions, and final state

## 9.1 Executed during this audit

| Check / inspection | Result and scope |
| --- | --- |
| Initial git status/HEAD/remote/tracking | main at recorded SHA; no tracked edits; three untracked paths above; plan untracked |
| Read prior plan/instructions/manifests/lock/config/docs/source | Completed targeted inspection; not every MDX/SCSS line exhaustively reviewed; no active Serena results used |
| Historical artifacts | Existing /tmp reports/logs read; counts/PR numbers confirmed as historical only |
| Fresh pnpm audit JSON via shell | Exit 1, 58 entries; initial Python direct spawn failed ENOEXEC because pnpm executable is shebang-less shell wrapper; shell rerun succeeded. Early wrapper-output parsing attempts failed/truncated, corrected by capturing parsed summary in memory |
| Recursive lint after inspecting scripts | Actual exit 1, ERR_PNPM_RECURSIVE_RUN_NO_SCRIPT; no working lint validation |
| `pnpm exec tsc --noEmit -p packages/netframe/tsconfig.json` | Exit 2, failed with Node globals/modules/types and derivative implicit-any/import.meta errors. **Unexpected auto-install changed ignored dependencies; constraint violation**, not a successful check |
| In-memory Sass + PostCSS/Autoprefixer/cssnano, no output-file writes | Exit 0 on local Node26 with now-locked sampled packages: main 64,890 expanded /55,617 min bytes; themes 6,761/5,763 bytes. API warning lists empty; separate stderr warns old browser data. Not a full build or cross-version test |
| In-memory source-map probe | 36 original Sass sources lost to single CSS source; confirms mapping issue; no file generation |
| Export resolver smoke | Default Node resolver reports ERR_PACKAGE_PATH_NOT_EXPORTED for documented dist CSS/theme and root/theme imports; browser/bundler coverage not claimed |
| Compiled font path inspection | Eight font references address nonexistent package-root files; data URI excluded from interpretation |
| Simple compiled token scan | Only warning token unresolved, with fallback; not a complete public token verifier |
| Minimal dropdown attribute model | Both open/close paths fail to create literal aria-hidden=true; source logic defect reproduced, not full browser test |
| Existing public vs dist CSS comparison | Main/themes equal, no implication of source freshness |
| npm registry HTTPS GET | Current latest/engines/peers retrieved; netframe GET 404; no ownership conclusion |
| GitHub REST list/details/files/check-runs/status/comments/reviews | 19 current open PRs; partial details as table; later HTTP403 rate limit. No PR writes/comments, no merges |
| Tracked/staged diff after unexpected install | Both exit0 and empty; lock/manifests/source unchanged; no staging/commits/ignore edits |

## 9.2 Not performed / missing evidence

No full build script, dev server, clean install requested intentionally, npm pack, browser/Playwright/axe/manual AT test, deployment probing, release/version dry run, publish, dependency update command, generated artifact writing, or migration implementation. The accidental install is the exception explicitly disclosed; it must not be hidden under a claim of no installs.

No authenticated GitHub access was used. Missing current details/checks/conflicts for #62/#59/#55/#54/#48/#36/#4; partial discussion/status gaps for #73/#68/#66/#64; no failed job logs/root-cause confirmation, inline review thread audit, branch protections, private alerts, npm permissions/trusted publishing or production hosting configuration. No authoritative version-specific migration API docs/Context7 lookup completed; exact code/config must be checked before implementation. Browser floor, font license provenance, asset delivery through all supported bundlers, and true exploitable paths remain unresolved.

Current registry advisories/metadata are received evidence, not independently reproduced CVEs or a guarantee that latest tags are safe. Public registry netframe 404 and Github rate limiting are distinct outcomes; neither substitutes for maintainer permissions.

## 9.3 Decisions required before implementation

1. Canonical repository/docs domain, package ownership and initial release availability.
2. Supported contributor/CI/release Node/pnpm floors; exact automatic-install/build-script policy. CSS consumers must remain framework/runtime-independent.
3. Supported consumer importers and explicit additive exports/font-base strategy, including raw Sass and nested deployment.
4. Security exposure/containment, allowed temporary advisory exceptions with owner/expiry, and minimal supported patched dependency lines.
5. Theme contrast targets and acceptable narrowly scoped visual corrections; browser support and global-reset compatibility boundary.
6. Legal notices/font provenance and distribution approvals; no license change implied.
7. Release gate/credentials/provenance strategy and approval for irreversible publish; no publishing during validation.
8. Whether owner wants local node_modules reconstructed after this audit's unintended dependency sync; original ignored dependency state cannot be safely recreated from the lockfile alone.

## 9.4 Preservation and verification record

Before checks, a SHA-256 digest over 20,806 repository files/symlinks excluding `.git` and the plan was captured: `2f9c1396b593f69edfe59726ced2d0c9fd4a1697987eb5520ab7c719ff8e4c13`. Final digest at 21:27 UTC covers 14,659 files/symlinks and is `7e1200f01f1f89a4e411417dbea146c44a9057931c5452b94311964df0537155`: **not equal**, consistent with the reported dependency replacement. It is not a list of every changed ignored path, so preservation of all ignored files cannot be certified.

Final `git diff --exit-code` and `git diff --cached --exit-code` both returned 0. HEAD remains the initial SHA. `git ls-files --error-unmatch MODERNIZATION-HANDOFF.md` returned 1 (untracked); `git check-ignore MODERNIZATION-HANDOFF.md` returned 1 (not ignored). Final status shows exactly the same three untracked top-level paths as initial status; no replacement plan exists. No staging, commit, ignore-rule change, PR mutation or release occurred.

The correct conclusion is: the existing plan was updated in place and remains untracked; tracked project files were preserved, but the user's strict only-file-change constraint was violated in ignored dependency directories. No destructive rollback or Git-state manipulation is authorized by this plan.
